#!/usr/bin/env node
// Prepare every run of one repetition of a round, and the manifest that says which run was which.
//
//   node evals/review/round.mjs <directory> [--cases a,b] <arm>...
//
// An arm is `control`, for no skill, or `name=skill-directory`. Every case, or each one named after
// --cases, is prepared in both variants once per arm, in a shuffled order, so a run's id says nothing about its arm, case or variant.
// The directory gets runs.json with each run's cwd and copied skill package digest;
// prompts/<run>.txt, the prompt to hand a fresh reviewer unchanged; and an empty returns/, where the operator
// saves that reviewer's final message as <run>.md. Running it again on the same directory adds a repetition.

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { CASES, VARIANTS, isMain, packageDigest, prepare } from "./prepare.mjs";

export const PROTOCOL = "review-neutral-2";
const LEGACY_FILES = new Set(["verdicts.json", "blocks.json", "implement.json", "outcome.json", "outcome-verdicts.json"]);
const LEGACY_DIRS = new Set(["work", "implement", "patches"]);

export function round(directory, arms, only) {
  const names = fs.readdirSync(CASES).sort(), unknown = (only ?? []).filter((name) => !names.includes(name));
  if (unknown.length) throw new Error(`no case named ${unknown.join(", ")}`);
  const manifest = path.join(directory, "runs.json"), hasManifest = fs.existsSync(manifest);
  const runs = hasManifest ? JSON.parse(fs.readFileSync(manifest, "utf8")) : [];
  if (hasManifest && (!Array.isArray(runs) || !runs.length || runs.some((run) => run?.protocol !== PROTOCOL)))
    throw new Error(`cannot append to legacy, unknown or mixed protocol in ${manifest}`);
  if (!hasManifest && fs.existsSync(directory)) {
    const legacy = fs.readdirSync(directory, { withFileTypes: true }).find((entry) => {
      const name = entry.name.toLowerCase();
      return LEGACY_FILES.has(name) || (LEGACY_DIRS.has(name) && (entry.isDirectory() || entry.isSymbolicLink()));
    });
    if (legacy) throw new Error(`legacy output exists without a manifest: ${path.join(directory, legacy.name)}`);
  }
  const parsed = arms.map((arm) => {
    const [name, ...parts] = arm.split("="), file = parts.join("=");
    if (!name || (name === "control" ? parts.length !== 0 : parts.length === 0 || !file))
      throw new Error(`an arm is control or name=skill-directory, not ${arm}`);
    return { name, file: parts.length ? file : undefined };
  });
  if (new Set(parsed.map((arm) => arm.name)).size !== parsed.length) throw new Error("arm names must be unique");
  for (const arm of parsed) {
    arm.digest = arm.file ? packageDigest(arm.file) : null;
    for (const run of runs.filter((entry) => entry.arm === arm.name)) {
      if (arm.digest === null ? run.skill !== null : !run.skill || run.skill.sha256 !== arm.digest)
        throw new Error(`arm ${arm.name} has a different skill package or control state in ${manifest}`);
    }
  }
  const cells = (only ?? names).flatMap((name) => VARIANTS.flatMap((variant) => parsed.map((arm) => ({ name, variant, arm }))));
  const id = (index) => `r${String(index + 1).padStart(2, "0")}`;
  const returns = path.join(directory, "returns"), outputs = fs.existsSync(returns) ? fs.readdirSync(returns) : [];
  if (!hasManifest && outputs.length) throw new Error(`returns is not empty without a manifest: ${returns}`);
  for (let index = 0; index < cells.length; index++) {
    const run = id(runs.length + index), prompt = path.join(directory, "prompts", `${run}.txt`);
    if (fs.lstatSync(prompt, { throwIfNoEntry: false })) throw new Error(`prompt already exists: ${prompt}`);
    const output = outputs.find((name) => name.toLowerCase() === run || name.toLowerCase().startsWith(`${run}.`));
    if (output) throw new Error(`return already exists for ${run}: ${path.join(returns, output)}`);
  }
  for (const sub of ["prompts", "returns"]) fs.mkdirSync(path.join(directory, sub), { recursive: true });
  const shuffled = cells.map((cell) => [crypto.randomInt(2 ** 32), cell]).sort(([a], [b]) => a - b).map(([, cell]) => cell);
  for (const { name, variant, arm } of shuffled) {
    const run = id(runs.length);
    const prepared = prepare(name, variant, arm.file, arm.digest);
    fs.writeFileSync(path.join(directory, "prompts", `${run}.txt`), prepared.prompt, { flag: "wx" });
    runs.push({ protocol: PROTOCOL, run, case: name, variant, arm: arm.name, cwd: prepared.cwd, skill: prepared.skill, review: `returns/${run}.md` });
  }
  const temporary = `${manifest}.${process.pid}.${crypto.randomUUID()}.tmp`;
  const fd = fs.openSync(temporary, "wx", 0o600);
  try {
    try { fs.writeFileSync(fd, `${JSON.stringify(runs, null, 2)}\n`); }
    finally { fs.closeSync(fd); }
    fs.renameSync(temporary, manifest);
  } finally { fs.rmSync(temporary, { force: true }); }
  return { runs, added: shuffled.length };
}

if (isMain(import.meta)) {
  const [directory, ...rest] = process.argv.slice(2);
  const only = rest[0] === "--cases" ? rest.splice(0, 2)[1]?.split(",") : undefined;
  if (!directory || !rest.length) { console.error("usage: round.mjs <directory> [--cases a,b] <control | name=skill-directory>..."); process.exit(2); }
  const { runs, added } = round(directory, rest, only);
  console.log(`${added} runs prepared, ${runs.length} in ${path.join(directory, "runs.json")}; hand each prompts/<run>.txt to a fresh reviewer and save its answer as returns/<run>.md`);
}
