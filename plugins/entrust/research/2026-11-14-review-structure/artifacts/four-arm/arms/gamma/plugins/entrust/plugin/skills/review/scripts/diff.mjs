// The diff under review as data: its files, hunks and lines, and the address of each changed line.
import { execFileSync } from "node:child_process";

function gitDiff(range, options) {
  if (typeof range !== "string" || !/^[^-\s]\S*$/.test(range)) throw new Error(`"${range}" is not a git range such as HEAD~1..HEAD`);
  return execFileSync("git", ["-c", "core.quotepath=off", "diff", "--no-color", "--no-ext-diff", ...options, range, "--"],
    { encoding: "utf8", maxBuffer: 1 << 28 });
}

// Derived presentation only: preserve metadata, binary patches and EOF markers that the line map omits.
// Git errors and the 256 MiB output limit propagate; neither means an empty diff.
export const rawDiffOf = range => gitDiff(range, ["--binary"]);

function parse(out) {
  const files = [];
  let file, hunk, oldNo = 0, newNo = 0, oldLeft = 0, newLeft = 0;
  for (const line of out.split("\n")) {
    if (oldLeft > 0 || newLeft > 0) {
      const kind = { " ": "ctx", "+": "add", "-": "del" }[line[0]];
      if (!kind) continue; // "\ No newline at end of file"
      const entry = { kind, text: line.slice(1) };
      if (kind !== "add") { entry.old = oldNo++; oldLeft--; }
      if (kind !== "del") { entry.new = newNo++; newLeft--; }
      hunk.push(entry);
      continue;
    }
    const header = /^diff --git a\/(.*) b\/\1$/.exec(line), at = /^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/.exec(line);
    if (header) files.push(file = { path: header[1], hunks: [] });
    else if (at) { [oldNo, oldLeft, newNo, newLeft] = [+at[1], +(at[2] ?? 1), +at[3], +(at[4] ?? 1)]; file.hunks.push(hunk = []); }
  }
  return files.filter((f) => f.hunks.length);
}

// The files of `git diff <range>`, each { path, hunks }; a hunk is a list of { kind: add | del | ctx, old, new, text }.
// Focused validation requests source bounds because three context lines cannot establish EOF.
// Full context uses Git's own before/after selection, including merge bases, working trees and deleted files.
export function diffOf(range, { sourceBounds = false } = {}) {
  const read = context => parse(gitDiff(range, ["--no-renames", `-U${context}`]));
  const files = read(3);
  if (sourceBounds) {
    const full = new Map(read(2147483647).map(file => [file.path, file]));
    for (const file of files) {
      const source = full.get(file.path);
      if (source) file.sourceLines = source.hunks.flat().reduce((counts, line) => ({
        old: Math.max(counts.old, line.old ?? 0), new: Math.max(counts.new, line.new ?? 0),
      }), { old: 0, new: 0 });
    }
  }
  return files;
}

export const changedLines = (file) => file.hunks.flat().filter((l) => l.kind !== "ctx");
// An added line is known by its number in the new file, a removed one by its number in the old file.
export const numberOf = (line) => line.kind === "add" ? line.new : line.old;
export const address = (line) => `${line.kind === "add" ? "+" : "-"}${numberOf(line)}`;
export const blank = (line) => line.text.trim() === "";
