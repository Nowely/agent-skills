// The diff under review as data: its files, hunks and lines, and the address of each changed line.
import { execFileSync } from "node:child_process";

// The files of `git diff <range>`, each { path, hunks }; a hunk is a list of { kind: add | del | ctx, old, new, text }.
export function diffOf(range) {
  if (typeof range !== "string" || !/^[^-\s]\S*$/.test(range)) throw new Error(`"${range}" is not a git range such as HEAD~1..HEAD`);
  const out = execFileSync("git", ["-c", "core.quotepath=off", "diff", "--no-color", "--no-ext-diff", "--no-renames", "-U3", range, "--"],
    { encoding: "utf8", maxBuffer: 1 << 28 });
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

export const changedLines = (file) => file.hunks.flat().filter((l) => l.kind !== "ctx");
// An added line is known by its number in the new file, a removed one by its number in the old file.
export const numberOf = (line) => line.kind === "add" ? line.new : line.old;
export const address = (line) => `${line.kind === "add" ? "+" : "-"}${numberOf(line)}`;
export const blank = (line) => line.text.trim() === "";
