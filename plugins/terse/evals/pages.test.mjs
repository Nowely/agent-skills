#!/usr/bin/env node
// Do terse's pages still agree with each other where they must?
//
//   node evals/pages.test.mjs
//
// A definition two skills use lives once, under references/, and every page links it. What moving text
// cannot keep in agreement, these cases check: that every link still opens after a page moves; that the
// run-directory line, which each skill carries in its own body because Claude Code substitutes
// ${CLAUDE_PLUGIN_DATA} only in a skill body and exports nothing to Bash, is one line in all of them; and
// that a frozen block still hashes to the digest its page records.

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FROZEN = ["references/writing-rules.md", "references/curse-of-knowledge.md"];
const RUN_SKILLS = ["audit", "rethink", "rewrite"];

function pages(dir = ROOT) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return e.name === "node_modules" || e.name.startsWith(".") ? [] : pages(p);
    return e.name.endsWith(".md") ? [p] : [];
  });
}

// Fenced blocks and code spans hold examples, not links.
const prose = (text) => text.replace(/^(```|~~~)[^\n]*\n[\s\S]*?^\1[ \t]*$/gm, "").replace(/`[^`\n]*`/g, "");

// GitHub's heading ids: lower case, anything but letters, digits, `_`, `-` and spaces dropped, each space a
// hyphen, a repeat numbered; and every <a id> or <a name> as written.
function anchors(file) {
  const seen = new Map(), ids = new Set();
  for (const [, h] of prose(fs.readFileSync(file, "utf8")).matchAll(/^#{1,6}[ \t]+(.+?)[ \t#]*$/gm)) {
    const text = h.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1").replace(/<[^>]+>/g, "");
    const base = text.toLowerCase().replace(/[^\p{L}\p{M}\p{N}_\- ]/gu, "").replace(/ /g, "-");
    const n = seen.get(base) ?? 0;
    seen.set(base, n + 1);
    ids.add(n ? `${base}-${n}` : base);
  }
  for (const [, id] of fs.readFileSync(file, "utf8").matchAll(/<a\s+(?:id|name)="([^"]+)"/g)) ids.add(id);
  return ids;
}

const cases = [];
const test = (name, fn) => cases.push([name, fn]);

test("every relative link in the plugin's pages opens, its anchor included", () => {
  const broken = [];
  for (const file of pages()) {
    for (const [, target] of prose(fs.readFileSync(file, "utf8")).matchAll(/\]\(([^)\s]+)\)/g)) {
      if (/^[a-z][a-z0-9+.-]*:/i.test(target)) continue;
      const [rel, anchor] = target.split("#");
      const dest = rel ? path.resolve(path.dirname(file), decodeURIComponent(rel)) : file;
      const at = `${path.relative(ROOT, file)} -> ${target}`;
      if (!fs.existsSync(dest)) broken.push(`${at}: no such file`);
      else if (anchor && dest.endsWith(".md") && !anchors(dest).has(anchor)) broken.push(`${at}: no such anchor`);
    }
  }
  return broken.length === 0 || broken.join("; ");
});

test("each skill that makes a run carries the same run-directory line, in the exact ${...} form", () => {
  const lines = RUN_SKILLS.map((s) => {
    const body = fs.readFileSync(path.join(ROOT, "skills", s, "SKILL.md"), "utf8");
    return [s, body.split("\n").filter((l) => l.includes("${CLAUDE_PLUGIN_DATA}")).map((l) => l.trim())];
  });
  const problems = lines.filter(([, ls]) => ls.length !== 1).map(([s, ls]) => `${s} has ${ls.length} such lines`);
  const distinct = new Set(lines.map(([, ls]) => ls[0]));
  if (!problems.length && distinct.size !== 1)
    problems.push(`the lines differ: ${lines.map(([s, ls]) => `${s}: ${ls[0]}`).join(" | ")}`);
  return problems.length === 0 || problems.join("; ");
});

test("every Claude Code placeholder is written in the exact ${...} form it substitutes", () => {
  // A bare $VAR is neither substituted nor exported, and a ${VAR:-default} is never substituted: either
  // runs on an empty value. The changelog names the old forms where it records the fixes; it instructs no one.
  const problems = [];
  for (const file of pages().filter((f) => path.basename(f) !== "CHANGELOG.md")) {
    const text = fs.readFileSync(file, "utf8");
    for (const [m] of text.matchAll(/\$(?:CLAUDE_PLUGIN_ROOT|CLAUDE_PLUGIN_DATA|CLAUDE_SKILL_DIR)\b|\$\{(?:CLAUDE_PLUGIN_ROOT|CLAUDE_PLUGIN_DATA|CLAUDE_SKILL_DIR)\s*:-/g))
      problems.push(`${path.relative(ROOT, file)} writes ${m}`);
  }
  return problems.length === 0 || problems.join("; ");
});

test("each frozen block hashes to the SHA-256 its page records", () => {
  const problems = [];
  for (const rel of FROZEN) {
    const lines = fs.readFileSync(path.join(ROOT, rel), "utf8").split("\n");
    // Title, blank, the intro paragraph, blank: the block starts there and ends before ## Provenance.
    let i = 1;
    while (lines[i] === "") i++;
    while (lines[i] !== "") i++;
    const start = i + 1, prov = lines.indexOf("## Provenance");
    let end = prov - 1;
    while (lines[end] === "") end--;
    const recorded = lines.slice(prov).join("\n").match(/`([0-9a-f]{64})`/)?.[1];
    const actual = crypto.createHash("sha256").update(lines.slice(start, end + 1).join("\n") + "\n").digest("hex");
    if (prov < 0 || !recorded) problems.push(`${rel}: no digest under ## Provenance`);
    else if (actual !== recorded) problems.push(`${rel}: lines ${start + 1}-${end + 1} hash to ${actual}, the page records ${recorded}`);
  }
  return problems.length === 0 || problems.join("; ");
});

let failed = 0;
for (const [name, fn] of cases) {
  const r = fn();
  if (r === true) console.log(`ok    ${name}`);
  else { failed++; console.log(`FAIL  ${name}\n      ${r}`); }
}
console.log(`${cases.length - failed} of ${cases.length} passed`);
process.exit(failed ? 1 : 0);
