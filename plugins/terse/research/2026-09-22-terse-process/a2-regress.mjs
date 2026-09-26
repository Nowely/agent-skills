#!/usr/bin/env node
// regressions(N) by transition: a sentence group is BAD at round i when any of its pins fails there
// (want:false pattern present, or want:true pattern absent). regressions(i) = groups BAD at i and not BAD at i-1.
// A pin may carry patterns:[{from,pattern}] — a re-pin by the verifier replaces the pattern from a round on.
// Usage: node regress.mjs LEDGER.json FILE... [--judge N]
import fs from "node:fs";
const args = process.argv.slice(2); const ji = args.indexOf("--judge");
const judge = ji === -1 ? null : Number(args[ji + 1]);
const [ledgerFile, ...files] = args.filter((a, i) => ji === -1 || (i !== ji && i !== ji + 1));
const claims = JSON.parse(fs.readFileSync(ledgerFile, "utf8"));
const texts = files.map((f) => fs.readFileSync(f, "utf8").replace(/\s+/g, " "));
const patAt = (c, i) => c.patterns ? [...c.patterns].filter((p) => p.from <= i).pop().pattern : c.pattern;
const groups = new Map();
for (const c of claims) { const g = c.sentence ?? c.name; if (!groups.has(g)) groups.set(g, []); groups.get(g).push(c); }
const bad = [...groups].map(([g, cs]) => [g, texts.map((t, i) => cs.some((c) => new RegExp(patAt(c, i), c.flags ?? "").test(t) !== c.want))]);
const reg = texts.map((_, i) => i === 0 ? null : bad.filter(([, b]) => b[i] && !b[i - 1]).map(([g]) => g));
const fails = texts.map((_, i) => bad.filter(([, b]) => b[i]).length);
files.forEach((f, i) => console.log(`${f.replace(/^.*\//, "")}: failing groups=${fails[i]} regressions=${reg[i] === null ? "-" : reg[i].length}${reg[i]?.length ? " [" + reg[i].join("; ") + "]" : ""}`));
if (judge !== null) process.exit(reg[judge]?.length ? 1 : 0);
