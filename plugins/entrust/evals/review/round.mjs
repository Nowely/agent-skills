#!/usr/bin/env node
// Prepare every run of one repetition of a round, and the manifest that says which run was which.
//
//   node evals/review/round.mjs <directory> <arm>...
//
// An arm is `control`, for no instructions, or `name=instructions.md`. Every case, in both variants, is
// prepared once per arm, in a shuffled order, so a run's id says nothing about its arm, case or variant.
// The directory gets runs.json, the manifest score.mjs reads, with each arm's instruction digest;
// prompts/<run>.txt, the prompt to hand a fresh reviewer unchanged; and an empty returns/, where the operator
// saves that reviewer's final message as <run>.md. Running it again on the same directory adds a repetition.

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { CASES, VARIANTS, isMain, prepare } from "./prepare.mjs";

export function round(directory, arms) {
  const parsed = arms.map((arm) => {
    const [name, file] = arm.split("=");
    if (!name || (name === "control") !== (file === undefined)) throw new Error(`an arm is control or name=instructions.md, not ${arm}`);
    return { name, file, digest: file ? crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex") : null };
  });
  const manifest = path.join(directory, "runs.json");
  const runs = fs.existsSync(manifest) ? JSON.parse(fs.readFileSync(manifest, "utf8")) : [];
  for (const sub of ["prompts", "returns"]) fs.mkdirSync(path.join(directory, sub), { recursive: true });
  const cells = fs.readdirSync(CASES).sort().flatMap((name) => VARIANTS.flatMap((variant) => parsed.map((arm) => ({ name, variant, arm }))));
  const shuffled = cells.map((cell) => [crypto.randomInt(2 ** 32), cell]).sort(([a], [b]) => a - b).map(([, cell]) => cell);
  for (const { name, variant, arm } of shuffled) {
    const run = `r${String(runs.length + 1).padStart(2, "0")}`;
    fs.writeFileSync(path.join(directory, "prompts", `${run}.txt`), `${prepare(name, variant, arm.file).prompt}\n`);
    runs.push({ run, case: name, variant, arm: arm.name, instructions: arm.digest, review: `returns/${run}.md` });
  }
  fs.writeFileSync(manifest, `${JSON.stringify(runs, null, 2)}\n`);
  return { runs, added: shuffled.length };
}

if (isMain(import.meta)) {
  const [directory, ...arms] = process.argv.slice(2);
  if (!directory || !arms.length) { console.error("usage: round.mjs <directory> <control | name=instructions.md>..."); process.exit(2); }
  const { runs, added } = round(directory, arms);
  console.log(`${added} runs prepared, ${runs.length} in ${path.join(directory, "runs.json")}; hand each prompts/<run>.txt to a fresh reviewer and save its answer as returns/<run>.md`);
}
