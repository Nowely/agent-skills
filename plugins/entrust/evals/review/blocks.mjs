#!/usr/bin/env node
// Read off each review's own record what it would remove, and hold that against the lines the case knows.
//
//   node evals/review/blocks.mjs <directory>
//
// <directory> is a round whose reviewers saved their review.json as returns/<run>.json, beside returns/<run>.md.
// A case's rubric may give, for its first-written form, `lines.remove`, the lines no solution of the task keeps,
// and `lines.keep`, lines every solution needs, each as { "path": "3, 10-16" }. For every run with a record this
// counts the superfluous lines that lie in a block the review marks `remove`, those in a block it marks `fix`,
// those in no block at all, the needed lines it marks `remove`, and the other lines of code it marks `remove`, so
// that a record which removes everything does not read as one that saw the superfluous; on a clean form, every
// line of code it marks `remove`. `already` in the rubric names mechanisms that something existing makes needless:
// the count says in how many the record lists the mechanism, and in how many it names what was already there.
//
// No judge takes part, so the count repeats exactly. It sees only what the record says of lines: a review may
// mark the right lines for a wrong reason, and a review with no record, as a control's, has no row.

import fs from "node:fs";
import path from "node:path";
import { CASES, isMain } from "./prepare.mjs";
import { rubricOf } from "./score.mjs";

// "3, 10-16" as the set of its numbers.
export const numbers = (spec) => new Set(String(spec ?? "").split(",").map((part) => part.trim()).filter(Boolean).flatMap((part) => {
  const [from, to = from] = part.split("-").map(Number);
  if (!Number.isInteger(from) || !Number.isInteger(to) || from < 1 || to < from) throw new Error(`"${part}" is not a line or a range`);
  return Array.from({ length: to - from + 1 }, (_, index) => from + index);
}));
const isCode = (file) => !/(^|\/)tests?\/|\.test\.[cm]?js$|\.md$/.test(file);

const within = (text, tokens) => tokens.some((token) => String(text ?? "").toLowerCase().includes(token.toLowerCase()));

// The lines of each file that the record's blocks give some verdict. "all" is every line of the file that is not blank.
function marked(run, review, verdicts) {
  const lines = new Map();
  for (const block of (review.blocks ?? []).filter((b) => verdicts.includes(b.verdict) && b.added !== undefined)) {
    const set = lines.get(block.path) ?? new Set(), file = path.join(CASES, run.case, run.variant, block.path);
    const all = () => fs.existsSync(file) ? fs.readFileSync(file, "utf8").split("\n").flatMap((line, index) => line.trim() ? [index + 1] : []) : [];
    for (const line of block.added === "all" ? all() : numbers(block.added)) set.add(line);
    lines.set(block.path, set);
  }
  return { has: (file, line) => lines.get(file)?.has(line) ?? false,
    count: () => [...lines].filter(([file]) => isCode(file)).reduce((sum, [, set]) => sum + set.size, 0) };
}

// The chain a removal goes through, each link read off the record: the mechanism is listed, what makes it needless
// is found, its lines are marked. `already` in a rubric names such mechanisms by words a record would use.
export function compare(run, review) {
  const remove = marked(run, review, ["remove"]), fix = marked(run, review, ["fix"]), any = marked(run, review, ["keep", "fix", "remove"]), known = rubricOf(run.case)[run.variant];
  if (run.variant !== "head") return { ...run, removed: remove.count() };
  if (!known.lines) return { ...run, unknown: true };
  const each = (spec) => Object.entries(spec ?? {}).flatMap(([file, lines]) => [...numbers(lines)].map((line) => [file, line]));
  const superfluous = each(known.lines.remove), needed = each(known.lines.keep), hit = (list, set) => list.filter(([f, l]) => set.has(f, l)).length;
  const brought = (review.mechanisms ?? []).filter((m) => ["added", "changed"].includes(m.change));
  const listed = (known.already ?? []).map((one) => brought.filter((m) => within(JSON.stringify(m), one.listed)));
  const removed = hit(superfluous, remove), wrongly = hit(needed, remove);
  return { ...run, superfluous: superfluous.length, removed, fixed: superfluous.filter(([f, l]) => !remove.has(f, l) && fix.has(f, l)).length,
    unmapped: superfluous.filter(([f, l]) => !any.has(f, l)).length, wrongly, other: remove.count() - removed - wrongly,
    mechanisms: (known.already ?? []).length, listed: listed.filter((found) => found.length).length,
    found: listed.filter((found, index) => found.some((m) => within(`${m.instead ?? ""} ${m.basis ?? ""}`, known.already[index].instead))).length };
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
  const sum = (list, key) => list.reduce((total, r) => total + r[key], 0), of = (list, part, whole) => `${sum(list, part)} / ${sum(list, whole)}`;
  return ["| Arm | Target | Runs | With a record | Mechanisms listed | Found already available | Superfluous lines marked remove | In a block marked fix | In no block | Needed lines marked remove | Other code lines marked remove |",
    "|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|",
    ...rows.map(([key, list]) => {
      const [arm, target] = key.split("\n"), read = list.filter((r) => !r.missing && !r.unknown), head = target.endsWith("/head");
      const cells = !read.length ? Array(7).fill("–") : !head ? [...Array(6).fill("–"), sum(read, "removed")]
        : [of(read, "listed", "mechanisms"), of(read, "found", "mechanisms"), of(read, "removed", "superfluous"), sum(read, "fixed"), sum(read, "unmapped"), sum(read, "wrongly"), sum(read, "other")];
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
