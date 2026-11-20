#!/usr/bin/env node
// Scores one prepared run once its implementer says it is done.
//
//   node evals/design-to-code/score.mjs <dir> [--label <text>]
//
// Runs the skill's check with the judge's own design.json, design and ledger (<dir>.judge/), never the
// implementer's: a deviation the implementer recorded is listed for the owner to read, not excused. Writes the
// check's report to <dir>.judge/out/ and appends one JSON line to <dir>.judge/scores.jsonl, which it also prints:
// frames passed, landmarks within tolerance, the largest offset, differing areas, sweep problems, the check's
// score (lower is better) and the implementer's ledger entries.
//
// A private case needs no prepare step: put design.json (pointing at the implementer's page), the design and the
// answer key as deviations.json in <dir>.judge/, with a run.json naming the case and the arm.

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DESIGN = path.resolve(HERE, "../../plugin/skills/design-to-code/scripts/design.mjs");
const [target, flag, label] = process.argv.slice(2);
if (!target) { console.error("usage: score.mjs <dir> [--label <text>]"); process.exit(2); }
const dir = path.resolve(target), judge = `${dir}.judge`;
if (!fs.existsSync(path.join(judge, "design.json"))) { console.error(`${judge}/design.json is missing: prepare the run first`); process.exit(2); }

fs.rmSync(path.join(judge, "out", "result.json"), { force: true });
const run = spawnSync(process.execPath, [DESIGN, "check", path.join(judge, "design.json"), "--out", path.join(judge, "out")], { encoding: "utf8" });
if (run.status === 2 || !fs.existsSync(path.join(judge, "out", "result.json"))) { process.stderr.write(run.stdout + run.stderr); process.exit(2); }
const result = JSON.parse(fs.readFileSync(path.join(judge, "out", "result.json"), "utf8"));
const spec = (f) => JSON.parse(fs.readFileSync(path.join(judge, "design", f.frame, "spec.json"), "utf8"));
const geometry = new Set(["x", "y", "height", "width", "presence"]);
const frames = result.frames.map((f) => {
  const failing = f.issues.filter((i) => i.status === "fail");
  const off = new Set(failing.filter((i) => geometry.has(i.property) && i.landmark !== "root").map((i) => i.landmark));
  const total = spec(f).landmarks.length;
  return {
    name: f.frame, pass: f.pass, landmarks: `${total - off.size}/${total}`,
    maxOffset: Math.max(0, ...failing.filter((i) => i.delta !== undefined && i.landmark !== "*").map((i) => Math.abs(i.delta))),
    font: failing.filter((i) => i.property === "font").length, regions: failing.filter((i) => i.property === "region").length, score: f.score,
  };
});
const ledgerFile = path.join(dir, "deviations.json");
let ledger = [];
try { ledger = fs.existsSync(ledgerFile) ? JSON.parse(fs.readFileSync(ledgerFile, "utf8")) : []; } catch { ledger = ["unreadable"]; }
const meta = JSON.parse(fs.readFileSync(path.join(judge, "run.json"), "utf8"));
const row = {
  time: new Date().toISOString(), case: meta.case, arm: meta.arm, ...(flag === "--label" ? { label } : {}),
  pass: result.pass, score: result.score, framesPassed: `${frames.filter((f) => f.pass).length}/${frames.length}`, frames,
  sweep: result.sweep ? { pass: result.sweep.pass, problems: result.sweep.issues.filter((i) => i.status === "fail").map((i) => `${i.property} ${i.landmark} @ ${i.ranges}`) } : null,
  ledgerEntries: Array.isArray(ledger) ? ledger.map((e) => (!e || typeof e !== "object" ? String(e) : `${e.status} ${e.category}: ${[].concat(e.landmark ?? "region").join(", ")} ${e.property} — ${e.reason}`)) : ledger,
};
fs.appendFileSync(path.join(judge, "scores.jsonl"), `${JSON.stringify(row)}\n`);
console.log(JSON.stringify(row, null, 2));
