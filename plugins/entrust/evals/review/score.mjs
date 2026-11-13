#!/usr/bin/env node
// Turn a judge's verdicts into the table a results page quotes.
//
//   node evals/review/score.mjs <results directory>
//
// The directory holds runs.json, as round.mjs writes it, the reviewers' answers it names, and verdicts.json, the
// judge's objects as judge.md defines them, one per run. A verdict must rule on exactly the rubric items of its
// case and variant, in the rubric's own words; anything else stops the script, because a table over a partly
// judged run reads as a measurement and is not one.
//
// Recall is (hits + half the partials) over the find items; a clean variant has none, and what counts there is
// the two columns beside it. Trap violations and unsupported claims are counts: lower is better, and neither
// is folded into recall.

import fs from "node:fs";
import path from "node:path";
import { CASES, isMain } from "./prepare.mjs";

const RULINGS = { find: ["hit", "partial", "miss"], trap: ["violated", "clean"] };
const EXTRA = ["valid", "unsupported"];

export const rubricOf = (caseName) => JSON.parse(fs.readFileSync(path.join(CASES, caseName, "rubric.json"), "utf8"));

// One row per arm and target, then per arm one row over the head variants and one over the clean ones.
export function score(runs, verdicts, words = () => 0) {
  const rows = new Map();
  const row = (arm, target) => {
    const key = `${arm}\n${target}`;
    if (!rows.has(key)) rows.set(key, { arm, target, runs: 0, finds: 0, hit: 0, partial: 0, miss: 0, violated: 0, valid: 0, unsupported: 0, words: 0 });
    return rows.get(key);
  };
  for (const run of runs) {
    const verdict = verdicts.filter((v) => v.run === run.run);
    if (verdict.length !== 1) throw new Error(`run ${run.run}: ${verdict.length} verdicts, expected one`);
    const { items } = rubricOf(run.case)[run.variant];
    const ruled = Object.keys(verdict[0].items).sort().join(" "), asked = items.map((i) => i.id).sort().join(" ");
    if (ruled !== asked) throw new Error(`run ${run.run}: verdict rules on [${ruled}], the rubric has [${asked}]`);
    const tally = { runs: 1, finds: 0, hit: 0, partial: 0, miss: 0, violated: 0, valid: 0, unsupported: 0, words: words(run) };
    for (const item of items) {
      const ruling = verdict[0].items[item.id];
      if (!RULINGS[item.kind].includes(ruling)) throw new Error(`run ${run.run}: ${item.id} is "${ruling}"`);
      if (item.kind === "find") tally.finds++;
      if (ruling !== "clean") tally[ruling]++;
    }
    for (const extra of verdict[0].extra ?? []) {
      if (!EXTRA.includes(extra.verdict)) throw new Error(`run ${run.run}: an extra claim is "${extra.verdict}"`);
      tally[extra.verdict]++;
    }
    for (const target of [row(run.arm, `${run.case}/${run.variant}`), row(run.arm, `all ${run.variant}`)])
      for (const [key, value] of Object.entries(tally)) target[key] += value;
  }
  const unknown = verdicts.filter((v) => !runs.some((r) => r.run === v.run)).map((v) => v.run);
  if (unknown.length) throw new Error(`verdicts for runs the manifest does not list: ${unknown.join(", ")}`);
  return [...rows.values()].sort((a, b) => a.target.startsWith("all ") - b.target.startsWith("all ") || a.target.localeCompare(b.target));
}

export function table(rows) {
  const line = (r) => `| ${r.arm} | ${r.target} | ${r.runs} | ${r.finds ? `${r.hit} / ${r.partial} / ${r.miss}` : "–"} | `
    + `${r.finds ? ((r.hit + r.partial / 2) / r.finds).toFixed(2) : "–"} | ${r.violated} | ${r.valid} | ${r.unsupported} | ${Math.round(r.words / r.runs)} |`;
  return ["| Arm | Target | Runs | Hit / partial / miss | Recall | Traps violated | Other valid | Unsupported | Words per review |",
    "|---|---|---|---|---|---|---|---|---|", ...rows.map(line)].join("\n");
}

if (isMain(import.meta)) {
  const dir = process.argv[2];
  if (!dir) { console.error("usage: score.mjs <results directory>"); process.exit(2); }
  const read = (name) => JSON.parse(fs.readFileSync(path.join(dir, name), "utf8"));
  const words = (run) => fs.readFileSync(path.join(dir, run.review), "utf8").trim().split(/\s+/).length;
  console.log(table(score(read("runs.json"), read("verdicts.json"), words)));
}
