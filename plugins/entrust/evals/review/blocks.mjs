#!/usr/bin/env node
// Read off each review's own record what it would remove, and hold that against the lines the case knows.
//
//   node evals/review/blocks.mjs <directory>
//
// <directory> is a round whose reviewers saved their review.json as returns/<run>.json, beside returns/<run>.md.
// A case's rubric may give, for its first-written form, `lines.remove`, the lines no solution of the task keeps,
// and `lines.keep`, lines every solution needs, each as { "path": "3, 10-16" }. For every run with a record this
// counts the superfluous lines that lie in a block the review marks `remove`, those in a block it marks `fix`,
// and the needed lines it marks `remove`; on a clean form, every line of code it marks `remove`.
//
// No judge takes part, so the count repeats exactly. It sees only what the record says of lines: a review may
// mark the right lines for a wrong reason, and a review with no record, as a control's, has no row.

import fs from "node:fs";
import path from "node:path";
import { isMain } from "./prepare.mjs";
import { rubricOf } from "./score.mjs";

// "3, 10-16" as the set of its numbers.
export const numbers = (spec) => new Set(String(spec ?? "").split(",").map((part) => part.trim()).filter(Boolean).flatMap((part) => {
  const [from, to = from] = part.split("-").map(Number);
  if (!Number.isInteger(from) || !Number.isInteger(to) || from < 1 || to < from) throw new Error(`"${part}" is not a line or a range`);
  return Array.from({ length: to - from + 1 }, (_, index) => from + index);
}));
const isCode = (file) => !/(^|\/)tests?\/|\.test\.[cm]?js$|\.md$/.test(file);

// The lines of each file that the record's blocks give one verdict. "all" is every line of the file.
function marked(review, verdict) {
  const lines = new Map();
  for (const block of (review.blocks ?? []).filter((b) => b.verdict === verdict && b.added !== undefined)) {
    const file = lines.get(block.path) ?? { all: false, set: new Set() };
    if (block.added === "all") file.all = true; else for (const line of numbers(block.added)) file.set.add(line);
    lines.set(block.path, file);
  }
  return { has: (file, line) => lines.get(file)?.all || lines.get(file)?.set.has(line) || false,
    count: (keep) => [...lines].filter(([file]) => keep(file)).reduce((sum, [, file]) => sum + (file.all ? 1 : file.set.size), 0) };
}

export function compare(run, review) {
  const remove = marked(review, "remove"), fix = marked(review, "fix"), known = rubricOf(run.case)[run.variant].lines;
  if (run.variant !== "head") return { ...run, removed: remove.count(isCode) };
  if (!known) return { ...run, unknown: true };
  const each = (spec) => Object.entries(spec ?? {}).flatMap(([file, lines]) => [...numbers(lines)].map((line) => [file, line]));
  const superfluous = each(known.remove), needed = each(known.keep);
  return { ...run, superfluous: superfluous.length, removed: superfluous.filter(([f, l]) => remove.has(f, l)).length,
    fixed: superfluous.filter(([f, l]) => !remove.has(f, l) && fix.has(f, l)).length, wrongly: needed.filter(([f, l]) => remove.has(f, l)).length };
}

export function blocks(directory) {
  const runs = JSON.parse(fs.readFileSync(path.join(directory, "runs.json"), "utf8"));
  return runs.map((run) => {
    const file = path.join(directory, run.review.replace(/\.md$/, ".json"));
    return fs.existsSync(file) ? compare(run, JSON.parse(fs.readFileSync(file, "utf8"))) : { ...run, missing: true };
  });
}

export function table(results) {
  const rows = Object.entries(Object.groupBy(results, (r) => `${r.arm}\n${r.case}/${r.variant}`)).sort(([a], [b]) => a.split("\n").reverse().join().localeCompare(b.split("\n").reverse().join()));
  const sum = (list, key) => list.reduce((total, r) => total + r[key], 0);
  return ["| Arm | Target | Runs | With a record | Superfluous lines marked remove | In a block marked fix | Needed or clean lines marked remove |", "|---|---|---:|---:|---:|---:|---:|",
    ...rows.map(([key, list]) => {
      const [arm, target] = key.split("\n"), read = list.filter((r) => !r.missing && !r.unknown), head = target.endsWith("/head");
      const cells = !read.length ? ["–", "–", "–"] : head ? [`${sum(read, "removed")} / ${sum(read, "superfluous")}`, sum(read, "fixed"), sum(read, "wrongly")] : ["–", "–", sum(read, "removed")];
      return `| ${arm} | ${target} | ${list.length} | ${list.filter((r) => !r.missing).length} | ${cells.join(" | ")} |`;
    })].join("\n");
}

if (isMain(import.meta)) {
  const [directory] = process.argv.slice(2);
  if (!directory) { console.error("usage: blocks.mjs <directory>"); process.exit(2); }
  const results = blocks(directory);
  fs.writeFileSync(path.join(directory, "blocks.json"), `${JSON.stringify(results, null, 2)}\n`);
  console.log(table(results));
}
