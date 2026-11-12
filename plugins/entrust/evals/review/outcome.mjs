#!/usr/bin/env node
// Measure what the implementers left: does the code do the task, how much of it is there, and can it be changed.
//
//   node evals/review/outcome.mjs <directory>
//
// <directory> is a round after implement.mjs and its implementers. For each implementation this runs the
// case's acceptance checks and the repository's own tests on work/<id>/repo, saves what the implementer changed
// as patches/<id>.patch, and counts the lines of code, tests apart, that the result adds to the code before the
// change, beside the same count for the case's clean form. With outcome-verdicts.json, the rulings of
// judge-outcome.md on the case's probes, it adds how many probes are a local change. Prints the table and
// writes outcome.json. A result is `recovered` when every acceptance check passes and, where a judge ruled,
// every probe is local; on a clean form the same is called `kept`, and the lines changed there are the harm.

import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { CASES, isMain } from "./prepare.mjs";
import { rubricOf } from "./score.mjs";

const SELF = fileURLToPath(import.meta.url);
const RULINGS = ["local", "between", "tangled"];
const isTest = (file) => /(^|\/)tests?\/|\.test\.[cm]?js$/.test(file);

// Lines added to code, with tests, documents and installed packages left out, between two commits or trees.
function added(numstat) {
  return numstat.trim().split("\n").filter(Boolean).map((line) => line.split("\t"))
    .filter(([plus, , file]) => plus !== "-" && !isTest(file) && !file.includes("node_modules/") && !file.endsWith(".md")).reduce((sum, [plus]) => sum + Number(plus), 0);
}
const reference = (name, tree) => added(spawnSync("git", ["diff", "--no-index", "--numstat", "base", tree], { cwd: path.join(CASES, name), encoding: "utf8" }).stdout
  .replaceAll(`${tree}/`, ""));

// The acceptance checks run in a process of their own: an implementation may throw at import or never return.
async function accept(name, repo) {
  const checks = (await import(pathToFileURL(path.join(CASES, name, "accept.mjs")).href)).default, failed = [];
  console.error = () => {};
  for (const check of checks) {
    try { await check.run((file) => import(pathToFileURL(path.join(repo, file)).href)); } catch { failed.push(check.name); }
  }
  return { checks: checks.length, failed };
}

export function measure(directory, entry) {
  const repo = path.resolve(directory, "work", entry.id, "repo"), git = (...args) => execFileSync("git", args, { cwd: repo, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
  git("add", "--all", "--intent-to-add");
  const patch = git("diff", "HEAD");
  fs.mkdirSync(path.join(directory, "patches"), { recursive: true });
  fs.writeFileSync(path.join(directory, "patches", `${entry.id}.patch`), patch);
  const judged = spawnSync(process.execPath, [SELF, "--accept", entry.case, repo], { encoding: "utf8", timeout: 60_000 });
  const accepted = judged.status === 0 ? JSON.parse(judged.stdout) : { checks: 0, failed: ["the acceptance checks did not finish"] };
  const tests = spawnSync(process.execPath, ["--test"], { cwd: repo, encoding: "utf8", timeout: 120_000 });
  const count = (word) => Number(new RegExp(`^(?:#|ℹ) ${word} (\\d+)`, "m").exec(tests.stdout ?? "")?.[1] ?? 0);
  return { ...entry, ...accepted, tests: { pass: count("pass"), fail: count("fail") }, size: added(git("diff", "--numstat", "HEAD~1")),
    changed: patch.split("\n").filter((line) => /^[+-](?![+-]{2} )/.test(line)).length };
}

// The judge's rulings, by implementation id; a case on which the judge did not tell its anchors apart is left out.
function rulings(directory, manifest) {
  const file = path.join(directory, "outcome-verdicts.json");
  if (!fs.existsSync(file)) return { probes: new Map(), blind: [] };
  const verdicts = JSON.parse(fs.readFileSync(file, "utf8")), probes = new Map(), blind = [];
  for (const entry of manifest.filter((m) => m.variant === "head" || m.anchor)) {
    const asked = (rubricOf(entry.case).probes ?? []).map((p) => p.id);
    if (!asked.length) continue;
    const verdict = verdicts.filter((v) => v.id === entry.id);
    if (verdict.length !== 1) throw new Error(`${entry.id}: ${verdict.length} verdicts, expected one`);
    if (Object.keys(verdict[0].probes).sort().join(" ") !== [...asked].sort().join(" ")) throw new Error(`${entry.id}: the verdict does not rule on exactly ${asked.join(", ")}`);
    for (const ruling of Object.values(verdict[0].probes)) if (!RULINGS.includes(ruling)) throw new Error(`${entry.id}: a probe is "${ruling}"`);
    probes.set(entry.id, Object.values(verdict[0].probes).filter((r) => r === "local").length);
  }
  for (const name of new Set(manifest.filter((m) => m.anchor).map((m) => m.case))) {
    const of = (variant) => probes.get(manifest.find((m) => m.anchor && m.case === name && m.variant === variant).id);
    if (!(of("clean") > of("head"))) { blind.push(name); for (const m of manifest.filter((m) => m.case === name)) probes.delete(m.id); }
  }
  return { probes, blind };
}

export function outcome(directory) {
  const manifest = JSON.parse(fs.readFileSync(path.join(directory, "implement.json"), "utf8"));
  const { probes, blind } = rulings(directory, manifest);
  const results = manifest.filter((m) => !m.anchor).map((entry) => {
    const result = measure(directory, entry), asked = rubricOf(entry.case).probes?.length ?? 0, local = entry.variant === "head" ? probes.get(entry.id) : undefined;
    return { ...result, reference: reference(entry.case, "clean"), probes: local === undefined ? null : { local, asked },
      done: result.failed.length === 0 && (local === undefined || local === asked) };
  });
  fs.writeFileSync(path.join(directory, "outcome.json"), `${JSON.stringify(results, null, 2)}\n`);
  return { results, blind };
}

export function table(results) {
  const rows = new Map();
  for (const r of results) for (const target of [`${r.case}/${r.variant}`, `all ${r.variant}`]) {
    const key = `${r.arm}\n${target}`;
    if (!rows.has(key)) rows.set(key, { arm: r.arm, target, list: [] });
    rows.get(key).list.push(r);
  }
  const sum = (list, of) => list.reduce((total, r) => total + of(r), 0);
  const line = ({ arm, target, list }) => {
    const judged = list.filter((r) => r.probes);
    return `| ${arm} | ${target} | ${list.length} | ${list.filter((r) => r.done).length} | ${sum(list, (r) => r.checks - r.failed.length)} / ${sum(list, (r) => r.checks)} | `
      + `${judged.length ? `${sum(judged, (r) => r.probes.local)} / ${sum(judged, (r) => r.probes.asked)}` : "–"} | ${(sum(list, (r) => r.size) / sum(list, (r) => r.reference)).toFixed(2)} | `
      + `${Math.round(sum(list, (r) => r.changed) / list.length)} | ${list.filter((r) => r.tests.fail).length} |`;
  };
  return ["| Arm | Target | Runs | Recovered or kept | Checks passed | Probes local | Code against the clean form | Lines changed per run | Runs with failing tests |",
    "|---|---|---:|---:|---:|---:|---:|---:|---:|",
    ...[...rows.values()].sort((a, b) => a.target.startsWith("all ") - b.target.startsWith("all ") || a.target.localeCompare(b.target) || a.arm.localeCompare(b.arm)).map(line)].join("\n");
}

if (isMain(import.meta)) {
  const [first, name, repo] = process.argv.slice(2);
  if (first === "--accept") { console.log(JSON.stringify(await accept(name, repo))); process.exit(0); }
  if (!first) { console.error("usage: outcome.mjs <directory>"); process.exit(2); }
  const { results, blind } = outcome(first);
  console.log(table(results));
  for (const name of blind) console.log(`\n${name}: the judge did not rule its clean form more local than its first-written one; its probes are not counted.`);
}
