// The diff under review as data: its files, hunks and lines, and the address of each changed line.
// Read a two-sided patch with `diff --git` headers and ordinary unified hunks. Input it cannot read is refused, never
// dropped; each refusal names the file and what to do, since the reviewer has to make a diff it can read.
const GIT = "for Git: git -c core.quotepath=off diff --no-color --no-ext-diff --no-renames --src-prefix=a/ --dst-prefix=b/ <base> <head>";
export function parseDiff(out) {
  const files = [];
  let file, hunk, oldHeader = false, newHeader = false, oldNo = 0, newNo = 0, oldLeft = 0, newLeft = 0;
  for (const line of out.split("\n")) {
    if (oldLeft > 0 || newLeft > 0) {
      const kind = { " ": "ctx", "+": "add", "-": "del" }[line[0]];
      if (line === "\\ No newline at end of file") continue;
      if (!kind || (kind !== "add" && !oldLeft) || (kind !== "del" && !newLeft))
        throw new Error("Incomplete or invalid diff hunk");
      const entry = { kind, text: line.slice(1) };
      if (kind !== "add") { entry.old = oldNo++; oldLeft--; }
      if (kind !== "del") { entry.new = newNo++; newLeft--; }
      hunk.push(entry);
      continue;
    }
    const header = /^diff --git a\/(.*) b\/\1$/.exec(line), at = /^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/.exec(line);
    const fileHeader = line.endsWith("\t") ? line.slice(0, -1) : line;
    if (header) {
      files.push(file = { path: header[1], hunks: [] });
      hunk = undefined;
      oldHeader = newHeader = false;
    }
    else if (line.startsWith("diff --")) throw new Error(`Unsupported diff header "${line}": provide a two-sided patch with a/ and b/ prefixes, no renames and no quoted paths (${GIT})`);
    else if (line.startsWith("--- ")) {
      if (!file || oldHeader || file.hunks.length || ![ `--- a/${file.path}`, "--- /dev/null" ].includes(fileHeader))
        throw new Error(`Unsupported or mismatched diff file header "${line}"${file ? ` for ${file.path}` : ""}`);
      oldHeader = true;
    }
    else if (line.startsWith("+++ ")) {
      if (!file || !oldHeader || newHeader || ![ `+++ b/${file.path}`, "+++ /dev/null" ].includes(fileHeader))
        throw new Error(`Unsupported or mismatched diff file header "${line}"${file ? ` for ${file.path}` : ""}`);
      newHeader = true;
    }
    else if (at) {
      if (!file || !oldHeader || !newHeader) throw new Error("Diff hunk has no supported file header");
      [oldNo, oldLeft, newNo, newLeft] = [+at[1], +(at[2] ?? 1), +at[3], +(at[4] ?? 1)];
      file.hunks.push(hunk = []);
    }
    else if (line.startsWith("@@")) throw new Error("Unsupported diff hunk");
    else if ((line.startsWith("old mode ") || line.startsWith("new mode ")) && file) file.mode = true;
    else if (hunk && /^[ +\-]/.test(line)) throw new Error("Unexpected line outside a diff hunk");
  }
  if (oldLeft || newLeft) throw new Error("Incomplete diff hunk");
  if (!files.length) throw new Error(`Diff has no \`diff --git\` file header; a colored or prefix-less diff has none (${GIT})`);
  // Every file the blocks cannot hold, named at once, so one corrected diff is enough.
  const apart = files.filter((f) => f.mode || !f.hunks.length).map((f) => `${f.path} (${f.mode ? "a file mode change" : "no text lines: binary or empty"})`);
  if (apart.length) throw new Error(`The blocks cannot hold ${apart.join(", ")}: give the diff without ${apart.length > 1 ? "these files" : "this file"} (for Git, a pathspec that excludes ${apart.length > 1 ? "them" : "it"}) and review ${apart.length > 1 ? "them" : "it"}, text changes included, separately`);
  return files;
}

export const changedLines = (file) => file.hunks.flat().filter((l) => l.kind !== "ctx");
// An added line is known by its number in the new file, a removed one by its number in the old file.
export const numberOf = (line) => line.kind === "add" ? line.new : line.old;
export const address = (line) => `${line.kind === "add" ? "+" : "-"}${numberOf(line)}`;
export const blank = (line) => line.text.trim() === "";
