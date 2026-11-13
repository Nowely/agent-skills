#!/usr/bin/env node
// Prepare the second stage of a round: what becomes of the code when someone acts on each review.
//
//   node evals/review/implement.mjs <directory>
//
// <directory> is a round, as round.mjs made it, with the reviewers' answers saved. Every reviewed run gets an
// implementation: a fresh repository holding the change that was reviewed, the task and that review, and a
// prompt for a fresh implementer. Every case and variant also gets implementations with no review, the arm
// `task-only`, as many as it has reviews per arm: what the same implementer makes of the same code unaided.
// A case with probes gets two anchors, its head and its clean tree untouched, which no implementer sees: the
// judge of the outcome rules on them unknowingly, and a judge who cannot tell them apart is not counted.
// The ids are shuffled, so an id says nothing about its arm. Writes <directory>/implement.json, the manifest
// outcome.mjs reads; implement/<id>.txt, the prompt; and work/<id>/, where the implementer works.

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { isMain, prepare } from "./prepare.mjs";
import { rubricOf } from "./score.mjs";

export const TASK_ONLY = "task-only";

export function implementerPrompt(run, withReview) {
  return [
    "Finish a code change.",
    "",
    `- Repository: ${path.join(run, "repo")}, a git repository. Its last commit is a change made for the task below; `
      + "HEAD~1 is the code before it.",
    `- The task: ${path.join(run, "brief.md")}.`,
    ...(withReview
      ? [`- A review of that change: ${path.join(run, "review.md")}. Check what it says against the code and act on what holds.`]
      : []),
    "- Leave the repository as you would hand it over: the task done, nothing in it the task does not need, the code "
      + "easy to read and to change, and tests for what you changed. If it is already that, change nothing.",
    "",
    "Limits: change files only inside the repository and do not commit. You may run the repository's own tests. "
      + `Read nothing outside ${run}. Your final message is a short note of what you changed and why.`,
  ].join("\n");
}

export function implement(directory) {
  const runs = JSON.parse(fs.readFileSync(path.join(directory, "runs.json"), "utf8"));
  const reviewed = runs.filter((r) => fs.existsSync(path.join(directory, r.review)));
  const cells = [...new Set(reviewed.map((r) => `${r.case}\n${r.variant}`))].map((cell) => cell.split("\n"));
  const planned = reviewed.map((r) => ({ case: r.case, variant: r.variant, arm: r.arm, review: r.review }));
  for (const [name, variant] of cells) {
    const perArm = Math.max(...Object.values(Object.groupBy(reviewed.filter((r) => r.case === name && r.variant === variant), (r) => r.arm)).map((list) => list.length));
    for (let i = 0; i < perArm; i++) planned.push({ case: name, variant, arm: TASK_ONLY });
  }
  for (const name of new Set(cells.filter(([, variant]) => variant === "head").map(([name]) => name)))
    if (rubricOf(name).probes?.length) for (const anchor of ["head", "clean"]) planned.push({ case: name, variant: anchor, anchor: true });
  const shuffled = planned.map((p) => [crypto.randomInt(2 ** 32), p]).sort(([a], [b]) => a - b).map(([, p]) => p);
  fs.mkdirSync(path.join(directory, "implement"), { recursive: true });
  const manifest = shuffled.map((p, index) => {
    const id = `i${String(index + 1).padStart(2, "0")}`, work = path.join(directory, "work", id);
    fs.rmSync(work, { recursive: true, force: true });
    fs.mkdirSync(path.dirname(work), { recursive: true });
    fs.cpSync(prepare(p.case, p.variant).run, work, { recursive: true });
    if (p.review) fs.copyFileSync(path.join(directory, p.review), path.join(work, "review.md"));
    if (!p.anchor) fs.writeFileSync(path.join(directory, "implement", `${id}.txt`), `${implementerPrompt(path.resolve(work), Boolean(p.review))}\n`);
    return { id, ...p };
  });
  fs.writeFileSync(path.join(directory, "implement.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  return manifest;
}

if (isMain(import.meta)) {
  const [directory] = process.argv.slice(2);
  if (!directory) { console.error("usage: implement.mjs <directory>"); process.exit(2); }
  const manifest = implement(directory), anchors = manifest.filter((m) => m.anchor).length;
  console.log(`${manifest.length - anchors} implementations prepared and ${anchors} anchors, in ${path.join(directory, "implement.json")}; `
    + "hand each implement/<id>.txt to a fresh implementer, which works in work/<id>/repo, then run outcome.mjs");
}
