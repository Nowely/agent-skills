#!/usr/bin/env node
// Measure what the implementers left: does the code do the task, can it be changed, and are its own tests sound.
//
//   node evals/review/outcome.mjs <directory>
//
// <directory> is a round after implement.mjs and its implementers. For each implementation this runs the
// case's acceptance checks and the repository's own tests on work/<id>/repo, saves what the implementer changed
// as patches/<id>.patch, and counts the lines changed, code and tests apart, and the lines of code the result
// adds to the code before the change, beside the same count for the case's clean form. With
// outcome-verdicts.json, the rulings of judge-outcome.md on the case's probes, it adds how many probes are a
// local change. Prints the table and writes outcome.json.
//
// Three things are kept apart: the acceptance checks, the probes and the repository's own tests. Each check runs
// in its own process and ends as passed, failed or unfinished; an unfinished check is not a pass. On a
// first-written form a result is `recovered` only when every check passes and a judge ruled every probe local.
// Where the checks pass and the probes were not ruled on it is `not assessed`; where the judge did not rule the
// case's clean form more local than its first-written one, `disputed`; where the case has no probes, `checks only`.
// None of these three is counted as recovered. On a clean form a result is `kept` or `broken` by the checks alone.

import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { CASES, isMain } from "./prepare.mjs";
import { rubricOf } from "./score.mjs";

const SELF = fileURLToPath(import.meta.url);
const RULINGS = ["local", "between", "tangled"];
const isTest = (file) => /(^|\/)tests?\/|\.test\.[cm]?js$/.test(file);

// The lines of a numstat that are code: tests, documents and installed packages left out.
const rows = (numstat) => numstat.trim().split("\n").filter(Boolean).map((line) => line.split("\t")).filter(([plus, , file]) => plus !== "-" && !file.includes("node_modules/"));
const code = (numstat) => rows(numstat).filter(([, , file]) => !isTest(file) && !file.endsWith(".md"));
const added = (numstat) => code(numstat).reduce((sum, [plus]) => sum + Number(plus), 0);
const touched = (list) => list.reduce((sum, [plus, minus]) => sum + Number(plus) + Number(minus), 0);

// How the repository's own tests ended. No test is not a pass, and a run that did not end is not a failure of a test.
function testsOf(repo) {
  const run = spawnSync(process.execPath, ["--test"], { cwd: repo, encoding: "utf8", timeout: 120_000 });
  const count = (word) => Number(new RegExp(`^(?:#|ℹ) ${word} (\\d+)`, "m").exec(run.stdout ?? "")?.[1] ?? 0);
  const pass = count("pass"), fail = count("fail"), ended = !run.error && run.signal === null;
  return { status: !ended ? "unfinished" : fail || run.status !== 0 ? "failed" : pass ? "passed" : "none", pass, fail,
    exit: run.status, signal: run.signal, error: run.error?.code ?? null };
}
const reference = (name, tree) => added(spawnSync("git", ["diff", "--no-index", "--numstat", "base", tree], { cwd: path.join(CASES, name), encoding: "utf8" }).stdout
  .replaceAll(`${tree}/`, ""));

// Every acceptance check runs in a process of its own: an implementation may throw at import or never return, and
// one check that does not end must not take the others' results with it.
const checksOf = async (name) => (await import(pathToFileURL(path.join(CASES, name, "accept.mjs")).href)).default;
async function accept(name, repo, index) {
  const check = (await checksOf(name))[index];
  console.error = () => {};
  await check.run((file) => import(pathToFileURL(path.join(repo, file)).href));
}
// Planned, failed and unfinished apart. A check is unfinished when its process timed out or ended with its work
// still pending (Node's exit code 13); it is failed when the check threw.
function accepted(name, repo) {
  const self = (...args) => spawnSync(process.execPath, [SELF, ...args], { encoding: "utf8", timeout: 60_000 });
  const names = JSON.parse(self("--checks", name).stdout), failed = [], unfinished = [];
  names.forEach((check, index) => {
    const run = self("--accept", name, repo, String(index));
    if (run.status === 0) return;
    (run.status === 1 ? failed : unfinished).push(check);
  });
  return { checks: names.length, failed, unfinished };
}

export function measure(directory, entry) {
  const repo = path.resolve(directory, "work", entry.id, "repo"), git = (...args) => execFileSync("git", args, { cwd: repo, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
  git("add", "--all", "--intent-to-add");
  const patch = git("diff", "HEAD");
  fs.mkdirSync(path.join(directory, "patches"), { recursive: true });
  fs.writeFileSync(path.join(directory, "patches", `${entry.id}.patch`), patch);
  const change = git("diff", "--numstat", "HEAD");
  return { ...entry, ...accepted(entry.case, repo), tests: testsOf(repo), size: added(git("diff", "--numstat", "HEAD~1")),
    changed: { code: touched(code(change)), tests: touched(rows(change).filter(([, , file]) => isTest(file))) } };
}

// The judge's rulings: how many probes of each implementation are local, and the cases on which the judge did not
// rule the clean form more local than the first-written one. Such a case is disputed, not discarded: the probe may
// be weak or the judge may have seen something, and its rulings stay in the record for whoever settles it.
function rulings(directory, manifest) {
  const file = path.join(directory, "outcome-verdicts.json"), local = new Map(), disputed = [];
  if (!fs.existsSync(file)) return { local, disputed };
  const verdicts = JSON.parse(fs.readFileSync(file, "utf8"));
  for (const entry of manifest.filter((m) => m.variant === "head" || m.anchor)) {
    const asked = (rubricOf(entry.case).probes ?? []).map((p) => p.id);
    if (!asked.length) continue;
    const verdict = verdicts.filter((v) => v.id === entry.id);
    if (verdict.length !== 1) throw new Error(`${entry.id}: ${verdict.length} verdicts, expected one`);
    if (Object.keys(verdict[0].probes).sort().join(" ") !== [...asked].sort().join(" ")) throw new Error(`${entry.id}: the verdict does not rule on exactly ${asked.join(", ")}`);
    for (const ruling of Object.values(verdict[0].probes)) if (!RULINGS.includes(ruling)) throw new Error(`${entry.id}: a probe is "${ruling}"`);
    local.set(entry.id, Object.values(verdict[0].probes).filter((r) => r === "local").length);
  }
  for (const name of new Set(manifest.filter((m) => m.anchor).map((m) => m.case))) {
    const of = (variant) => local.get(manifest.find((m) => m.anchor && m.case === name && m.variant === variant).id);
    if (!(of("clean") > of("head"))) disputed.push(name);
  }
  return { local, disputed };
}

// One word for what became of the change; only `recovered` and `kept` say it is as it should be.
function stateOf(result, asked, local, disputed) {
  const passes = result.failed.length + result.unfinished.length === 0;
  if (result.variant !== "head") return passes ? "kept" : "broken";
  if (!passes) return "not recovered";
  if (!asked) return "checks only";
  if (local === undefined) return "not assessed";
  if (disputed) return "disputed";
  return local === asked ? "recovered" : "not recovered";
}

export function outcome(directory) {
  const manifest = JSON.parse(fs.readFileSync(path.join(directory, "implement.json"), "utf8"));
  const { local, disputed } = rulings(directory, manifest);
  const results = manifest.filter((m) => !m.anchor).map((entry) => {
    const result = measure(directory, entry), asked = entry.variant === "head" ? rubricOf(entry.case).probes?.length ?? 0 : 0, ruled = local.get(entry.id);
    return { ...result, reference: reference(entry.case, "clean"), probes: asked && ruled !== undefined ? { local: ruled, asked } : null,
      state: stateOf(result, asked, ruled, disputed.includes(entry.case)) };
  });
  fs.writeFileSync(path.join(directory, "outcome.json"), `${JSON.stringify(results, null, 2)}\n`);
  return { results, disputed };
}

export function table(results) {
  const rows = new Map();
  for (const r of results) for (const target of [`${r.case}/${r.variant}`, `all ${r.variant}`]) {
    const key = `${r.arm}\n${target}`;
    if (!rows.has(key)) rows.set(key, { arm: r.arm, target, list: [] });
    rows.get(key).list.push(r);
  }
  const sum = (list, of) => list.reduce((total, r) => total + of(r), 0);
  // "2 recovered, 1 disputed": every state that occurs, with its count.
  const tally = (list, of) => Object.entries(Object.groupBy(list, of)).map(([word, same]) => `${same.length} ${word}`).join(", ");
  const line = ({ arm, target, list }) => {
    const judged = list.filter((r) => r.probes && r.state !== "disputed"), unfinished = sum(list, (r) => r.unfinished.length);
    return `| ${arm} | ${target} | ${list.length} | ${tally(list, (r) => r.state)} | ${sum(list, (r) => r.checks - r.failed.length - r.unfinished.length)} / ${sum(list, (r) => r.checks)}${unfinished ? `, ${unfinished} unfinished` : ""} | `
      + `${judged.length ? `${sum(judged, (r) => r.probes.local)} / ${sum(judged, (r) => r.probes.asked)}` : "–"} | ${tally(list, (r) => r.tests.status)} | `
      + `${(sum(list, (r) => r.size) / sum(list, (r) => r.reference)).toFixed(2)} | ${Math.round(sum(list, (r) => r.changed.code) / list.length)} | ${Math.round(sum(list, (r) => r.changed.tests) / list.length)} |`;
  };
  return ["| Arm | Target | Runs | Outcome | Checks passed | Probes local | Own tests | Code against the clean form | Code lines changed per run | Test lines changed per run |",
    "|---|---|---:|---|---:|---:|---|---:|---:|---:|",
    ...[...rows.values()].sort((a, b) => a.target.startsWith("all ") - b.target.startsWith("all ") || a.target.localeCompare(b.target) || a.arm.localeCompare(b.arm)).map(line)].join("\n");
}

if (isMain(import.meta)) {
  const [first, name, repo, index] = process.argv.slice(2);
  if (first === "--checks") { console.log(JSON.stringify((await checksOf(name)).map((check) => check.name))); process.exit(0); }
  if (first === "--accept") { try { await accept(name, repo, Number(index)); } catch { process.exit(1); } process.exit(0); }
  if (!first) { console.error("usage: outcome.mjs <directory>"); process.exit(2); }
  const { results, disputed } = outcome(first);
  console.log(table(results));
  for (const name of disputed) console.log(`\n${name}: the judge did not rule its clean form more local than its first-written one. Its results are disputed and count for no arm: `
    + "read the judge's reasons in outcome-verdicts.json and settle whether the probe or the judge is at fault.");
}
