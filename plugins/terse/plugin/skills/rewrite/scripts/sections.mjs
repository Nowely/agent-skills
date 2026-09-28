#!/usr/bin/env node
// Words per `## ` section of one text, or of two versions side by side.
// Usage: node sections.mjs FILE            words per section
//        node sections.mjs BEFORE AFTER    both counts and the difference; a section one version lacks is marked
// A report, not a gate: exit 0 either way.
import fs from "node:fs";
const files = process.argv.slice(2);
if (files.length < 1 || files.length > 2) { console.error("usage: node sections.mjs FILE | BEFORE AFTER"); process.exit(2); }
const segmenter = new Intl.Segmenter(undefined, { granularity: "word" });
const words = (text) => { let n = 0; for (const s of segmenter.segment(text)) if (s.isWordLike) n++; return n; };
const sections = (file) => {
  const out = new Map();
  let cur = "(opening)", buf = [];
  const flush = () => { let key = cur, n = 2; while (out.has(key)) key = `${cur} (${n++})`; out.set(key, words(buf.join("\n"))); };
  for (const l of fs.readFileSync(file, "utf8").split("\n")) {
    if (/^##\s/.test(l)) { flush(); cur = l.replace(/^##\s*/, "").trim(); buf = []; }
    else buf.push(l);
  }
  flush();
  return out;
};
const col = (v) => String(v).padStart(6);
const signed = (d) => (d > 0 ? "+" : "") + d;
if (files.length === 1) {
  let total = 0;
  for (const [s, w] of sections(files[0])) { console.log(col(w), s); total += w; }
  console.log(col(total), "TOTAL");
  process.exit(0);
}
const [before, after] = files.map(sections);
const names = [...after.keys(), ...[...before.keys()].filter((s) => !after.has(s))];
let tb = 0, ta = 0, grew = 0, one = 0;
console.log(col("before"), col("after"), col("diff"), " section");
for (const s of names) {
  const b = before.get(s), a = after.get(s);
  tb += b ?? 0; ta += a ?? 0;
  if (b === undefined || a === undefined) {
    one++;
    console.log(col(b ?? "-"), col(a ?? "-"), col(""), s, b === undefined ? "  (only after)" : "  (only before)");
    continue;
  }
  if (a > b) grew++;
  console.log(col(b), col(a), col(signed(a - b)), s);
}
console.log(col(tb), col(ta), col(signed(ta - tb)), ` TOTAL, ${grew} section(s) grew, ${one} in one version only`);
process.exit(0);
