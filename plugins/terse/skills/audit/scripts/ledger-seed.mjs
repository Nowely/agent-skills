#!/usr/bin/env node
// The audit's claim ledger becomes `rewrite`'s ledger, so round 01 is already under the ratchet.
// Usage: node ledger-seed.mjs AUDIT.md LEDGER.json
// AUDIT.md is the run file. Under `## Claim ledger` it carries a fenced block whose info string is
// `json claims` — the machine-readable half of the entries the prose half states; the format is in
// ledgers.md. Each object: {"id","where","sentence","claim","level","verdict","sources"} — all seven,
// whatever the verdict — where `sentence` is the document's own words, copied, and `verdict` is
// confirmed, refuted or unconfirmed.
// The block is read only under `## Claim ledger`, and only beside the `### C..` entries it doubles:
// a block under another heading, a heading with no entries under it, and an id in one half and not
// the other are each refused. The two halves are one ledger.
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
// The block belongs under `## Claim ledger` and nowhere else, so that is the only place read.
const start = text.search(/^##[ \t]+Claim ledger[ \t]*$/m);
if (start === -1) { console.error(`${auditFile}: no "## Claim ledger" heading; the run file contract is in ledgers.md`); process.exit(1); }
const after = text.slice(start + 1).search(/^##[ \t]+/m);
const section = after === -1 ? text.slice(start) : text.slice(start, start + 1 + after);
const fence = section.match(/^```json claims[ \t]*\n([\s\S]*?)\n```[ \t]*$/m);
if (!fence) {
  console.error(`${auditFile}: no \`\`\`json claims block under ## Claim ledger` +
    (/^```json claims[ \t]*$/m.test(text) ? ", though there is one under another heading, which is not where it is read" : "") +
    `; the run file contract is in ledgers.md`);
  process.exit(1);
}
let entries;
try { entries = JSON.parse(fence[1]); } catch (e) { console.error(`${auditFile}: the json claims block does not parse: ${e.message}`); process.exit(1); }
if (!Array.isArray(entries)) { console.error(`${auditFile}: the json claims block must be an array of entries`); process.exit(1); }
// The prose entries and the block are two halves of one ledger; neither half is optional, and drift
// between them is an error, not a warning.
const headings = [...section.matchAll(/^###\s+(C\d+)\b/gm)].map((m) => m[1]);
if (!headings.length) { console.error(`${auditFile}: no ### C.. entries under ## Claim ledger; the block is the machine half of entries a reader reads, not a replacement for them`); process.exit(1); }
const ids = entries.map((e) => e.id);
const missing = headings.filter((h) => !ids.includes(h)), extra = ids.filter((i) => !headings.includes(i));
if (missing.length || extra.length) {
  console.error(`${auditFile}: the json claims block and the ### C.. entries disagree` +
    (missing.length ? `; not in the block: ${missing.join(" ")}` : "") + (extra.length ? `; not in the prose: ${extra.join(" ")}` : ""));
  process.exit(1);
}
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const norm = (s) => s.replace(/\s+/g, " ").trim();
const slug = (s) => { const w = norm(s).split(" ").slice(0, 7).join(" "); return w.length > 44 ? w.slice(0, 44) : w; };
const ledger = []; const unconfirmed = [];
for (const e of entries) {
  const at = `${auditFile}: ${e.id ?? "(entry with no id)"}`;
  for (const k of ["id", "where", "sentence", "claim", "sources", "verdict"])
    if (!e[k]) { console.error(`${at}: every entry needs ${k}, whatever its verdict`); process.exit(1); }
  if (!["confirmed", "refuted", "unconfirmed"].includes(e.verdict)) { console.error(`${at}: verdict is confirmed, refuted or unconfirmed, not ${JSON.stringify(e.verdict)}`); process.exit(1); }
  if (![1, 2, 3].includes(e.level)) { console.error(`${at}: every entry needs level 1, 2 or 3 — the level reached, and unconfirmed is a level reached too`); process.exit(1); }
  if (e.verdict === "unconfirmed") { unconfirmed.push(`${e.id} ${e.where} ${slug(e.claim)}`); continue; }
  ledger.push({ name: `${e.id} ${slug(e.claim)}`, pattern: esc(norm(e.sentence)),
    want: e.verdict === "confirmed", level: e.level, how: e.sources });
}
const names = new Set(); for (const c of ledger) { if (names.has(c.name)) { console.error(`${auditFile}: two entries seed the same ledger name: ${c.name}`); process.exit(1); } names.add(c.name); }
fs.writeFileSync(out, JSON.stringify(ledger, null, 1) + "\n");
if (unconfirmed.length) console.error(`not seeded, unconfirmed (${unconfirmed.length}):\n  ` + unconfirmed.join("\n  "));
console.log(`${out}: ${ledger.length} entr(ies) — ${ledger.filter((c) => c.want).length} want:true, ${ledger.filter((c) => !c.want).length} want:false; ${unconfirmed.length} unconfirmed not seeded`);
