// The diff under review as data: its files, hunks and lines, and the address of each changed line.
// Read a two-sided patch with `diff --git` headers and ordinary unified hunks.
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
    else if (line.startsWith("diff --")) throw new Error("Unsupported diff header; provide a two-sided patch without renames or quoted paths");
    else if (line.startsWith("--- ")) {
      if (!file || oldHeader || file.hunks.length || ![ `--- a/${file.path}`, "--- /dev/null" ].includes(fileHeader))
        throw new Error("Unsupported or mismatched diff file header");
      oldHeader = true;
    }
    else if (line.startsWith("+++ ")) {
      if (!file || !oldHeader || newHeader || ![ `+++ b/${file.path}`, "+++ /dev/null" ].includes(fileHeader))
        throw new Error("Unsupported or mismatched diff file header");
      newHeader = true;
    }
    else if (at) {
      if (!file || !oldHeader || !newHeader) throw new Error("Diff hunk has no supported file header");
      [oldNo, oldLeft, newNo, newLeft] = [+at[1], +(at[2] ?? 1), +at[3], +(at[4] ?? 1)];
      file.hunks.push(hunk = []);
    }
    else if (line.startsWith("@@")) throw new Error("Unsupported diff hunk");
    else if (line.startsWith("old mode ") || line.startsWith("new mode ")) throw new Error("Diff contains a file mode change; review it separately");
    else if (hunk && /^[ +\-]/.test(line)) throw new Error("Unexpected line outside a diff hunk");
  }
  if (oldLeft || newLeft) throw new Error("Incomplete diff hunk");
  if (!files.length || files.some((f) => !f.hunks.length)) throw new Error("Diff has no supported text changes; review other changes separately");
  return files;
}

export const changedLines = (file) => file.hunks.flat().filter((l) => l.kind !== "ctx");
// An added line is known by its number in the new file, a removed one by its number in the old file.
export const numberOf = (line) => line.kind === "add" ? line.new : line.old;
export const address = (line) => `${line.kind === "add" ? "+" : "-"}${numberOf(line)}`;
export const blank = (line) => line.text.trim() === "";
