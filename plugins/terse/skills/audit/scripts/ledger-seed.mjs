#!/usr/bin/env node
// The audit's claim ledger becomes `rewrite`'s ledger, so round 01 is already under the ratchet.
// Usage: node ledger-seed.mjs AUDIT.md LEDGER.json
// AUDIT.md is the run file. Under `## Claim ledger` it carries a fenced block whose info string is
// `json claims` — the machine-readable half of the entries the prose half states; the format is in
// ledgers.md. Each object: {"id","where","sentence","claim","level","verdict","sources"}, where
// `sentence` is the document's own words, copied, and `verdict` is confirmed, refuted or unconfirmed.
//   confirmed   -> a ledger entry with want: true  and the entry's level
//   refuted     -> a ledger entry with want: false and the entry's level
//   unconfirmed -> not seeded; listed on stderr, because nobody proved it either way
// The pattern is the sentence whitespace-normalised and escaped to a literal, matched against the
// round text ledger.mjs normalises the same way (ledger.mjs:14) — so a sentence rewrapped across lines
// still matches, and a sentence paraphrased does not.
// Refuses to overwrite LEDGER.json: a seed is written once, and the rounds grow it from there.
import fs from "node:fs";
const [auditFile, out] = process.argv.slice(2);
if (!auditFile || !out) { console.error("usage: node ledger-seed.mjs AUDIT.md LEDGER.json"); process.exit(2); }
if (fs.existsSync(out)) { console.error(`${out} exists; the seed is written once, then the rounds grow it`); process.exit(1); }
const text = fs.readFileSync(auditFile, "utf8");
const fence = text.match(/^```json claims[ \t]*\n([\s\S]*?)\n```[ \t]*$/m);
if (!fence) { console.error(`${auditFile}: no \`\`\`json claims block under ## Claim ledger; the run file contract is in ledgers.md`); process.exit(1); }
let entries;
try { entries = JSON.parse(fence[1]); } catch (e) { console.error(`${auditFile}: the json claims block does not parse: ${e.message}`); process.exit(1); }
if (!Array.isArray(entries)) { console.error(`${auditFile}: the json claims block must be an array of entries`); process.exit(1); }
// The prose entries and the block are two halves of one ledger; drift between them is an error, not a warning.
const headings = [...text.matchAll(/^###\s+(C\d+)\b/gm)].map((m) => m[1]);
const ids = entries.map((e) => e.id);
if (headings.length) {
  const missing = headings.filter((h) => !ids.includes(h)), extra = ids.filter((i) => !headings.includes(i));
  if (missing.length || extra.length) {
    console.error(`${auditFile}: the json claims block and the ### C.. entries disagree` +
      (missing.length ? `; not in the block: ${missing.join(" ")}` : "") + (extra.length ? `; not in the prose: ${extra.join(" ")}` : ""));
    process.exit(1);
  }
}
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const norm = (s) => s.replace(/\s+/g, " ").trim();
const slug = (s) => { const w = norm(s).split(" ").slice(0, 7).join(" "); return w.length > 44 ? w.slice(0, 44) : w; };
const ledger = []; const unconfirmed = [];
for (const e of entries) {
  const at = `${auditFile}: ${e.id ?? "(entry with no id)"}`;
  for (const k of ["id", "sentence", "verdict"]) if (!e[k]) { console.error(`${at}: every entry needs ${k}`); process.exit(1); }
  if (e.verdict === "unconfirmed") { unconfirmed.push(`${e.id} ${e.where ?? ""} ${slug(e.claim ?? e.sentence)}`); continue; }
  if (e.verdict !== "confirmed" && e.verdict !== "refuted") { console.error(`${at}: verdict is confirmed, refuted or unconfirmed, not ${JSON.stringify(e.verdict)}`); process.exit(1); }
  if (![1, 2, 3].includes(e.level)) { console.error(`${at}: a ${e.verdict} entry needs level 1, 2 or 3`); process.exit(1); }
  ledger.push({ name: `${e.id} ${slug(e.claim ?? e.sentence)}`, pattern: esc(norm(e.sentence)),
    want: e.verdict === "confirmed", level: e.level, ...(e.sources ? { how: e.sources } : {}) });
}
const names = new Set(); for (const c of ledger) { if (names.has(c.name)) { console.error(`${auditFile}: two entries seed the same ledger name: ${c.name}`); process.exit(1); } names.add(c.name); }
fs.writeFileSync(out, JSON.stringify(ledger, null, 1) + "\n");
if (unconfirmed.length) console.error(`not seeded, unconfirmed (${unconfirmed.length}):\n  ` + unconfirmed.join("\n  "));
console.log(`${out}: ${ledger.length} entr(ies) — ${ledger.filter((c) => c.want).length} want:true, ${ledger.filter((c) => !c.want).length} want:false; ${unconfirmed.length} unconfirmed not seeded`);
