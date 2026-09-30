// Usage: node removed-lines.mjs <worktree> <base ref> <out.md>
// Every sentence of every line removed under plugins/entrust/plugin/ between <base> and HEAD is looked up verbatim
// (whitespace collapsed, link targets blanked) in the plugin's tracked .md files as the worktree has them; the unmatched
// ones go to <out.md>.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const [W, BASE, OUT] = process.argv.slice(2);
const git = (...a) => execFileSync("git", ["-C", W, ...a], { encoding: "utf8", maxBuffer: 1 << 26 });
const norm = (s) => s.replace(/\]\([^)]*\)/g, "]()").replace(/\s+/g, " ").trim();

const diff = git("diff", "-U0", `${BASE}...HEAD`, "--", "plugins/entrust/plugin/");
const removed = [];
let file = null, line = 0;
for (const l of diff.split("\n")) {
  if (l.startsWith("--- ")) { file = l.slice(4).replace(/^a\//, ""); continue; }
  if (l.startsWith("+++ ")) continue;
  const h = l.match(/^@@ -(\d+)(?:,\d+)? /);
  if (h) { line = Number(h[1]); continue; }
  if (l.startsWith("-")) { removed.push({ file, line, text: l.slice(1) }); line++; }
}

const files = git("ls-files", "plugins/entrust/plugin/").split("\n").filter((f) => f.endsWith(".md"));
const corpus = norm(files.map((f) => fs.readFileSync(path.join(W, f), "utf8")).join("\n"));

const split = (t) => t.split(/(?<=[.;:!?])\s+(?=[A-Z`"(\[*])|\s+\|\s+/).map(norm).filter((s) => s.replace(/[|\-\s:]/g, "").length > 3);
let total = 0;
const missing = [];
for (const r of removed) {
  for (const s of split(r.text)) {
    total++;
    if (!corpus.includes(s)) missing.push({ ...r, s });
  }
}
fs.writeFileSync(OUT, missing.map((m) => `- ${m.file}:${m.line}: ${m.s}`).join("\n") + "\n");
console.log(`removed lines ${removed.length}, sentences ${total}, found verbatim ${total - missing.length}, not found ${missing.length}`);
