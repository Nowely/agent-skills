#!/usr/bin/env node
// The text two skill pages share, held once: each fragment has one source and its copies, and a copy that
// differs from its source is drift.
//
//   node evals/fragments.mjs --check    one DRIFT= line per copy that differs, exit 1; exit 0 when none
//   node evals/fragments.mjs --write    rewrite every copy from its source, then check
//   node evals/fragments.mjs --list     the fragments, their sources and their copies
//
// Shared schema and external-state copies must agree with their owner. An inline copy is one
// span replaced by --write; a literal is restored by the page's writer.
// fragments.test.mjs runs --check, and run-all runs that suite before the release gate.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const PLUGIN = path.join(path.dirname(HERE), "plugin");

export const FRAGMENTS = [
  {
    id: "five-field-schema",
    kind: "inline-json",
    source: "skills/codex/schemas/five-fields.schema.json",
    copies: ["skills/swarm/SKILL.md"],
    locate: /^ {4}(\{"type":"object".*)$/m,
  },
  {
    id: "run-directory",
    kind: "literal",
    text: "`<state>/orchestrate/<project-slug>/<run>/`",
    copies: ["skills/codex/references/orchestration.md", "skills/swarm/SKILL.md", "skills/experiment/SKILL.md", "skills/prepare-feedback/SKILL.md"],
  },
];

const read = (root, rel) => fs.readFileSync(path.join(root, rel), "utf8");

// Sorted keys at every level: an inline copy is minified by hand, and key order is not a difference.
const canon = (v) => (Array.isArray(v) ? v.map(canon)
  : v && typeof v === "object" ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, canon(v[k])])) : v);
const same = (a, b) => JSON.stringify(canon(a)) === JSON.stringify(canon(b));

// Every problem as { fragment, copy, why }, none when the copies agree with their sources.
export function check(root = PLUGIN, fragments = FRAGMENTS) {
  const drift = [];
  const add = (f, copy, why) => drift.push({ fragment: f.id, copy, why });
  for (const f of fragments) {
    if (f.kind === "inline-json") {
      let src;
      try { src = JSON.parse(read(root, f.source)); } catch (e) { add(f, f.source, `the source does not parse: ${e.message}`); continue; }
      for (const c of f.copies) {
        let page = "";
        try { page = read(root, c); } catch { add(f, c, "missing"); continue; }
        const m = f.locate.exec(page);
        if (!m) { add(f, c, "carries no inline copy"); continue; }
        let copy;
        try { copy = JSON.parse(m[1]); } catch (e) { add(f, c, `its inline copy does not parse: ${e.message}`); continue; }
        if (!same(copy, src)) add(f, c, `its inline copy differs from ${f.source}; it should read ${JSON.stringify(src)}`);
      }
    } else if (f.kind === "literal") {
      for (const c of f.copies) {
        let page = "";
        try { page = read(root, c); } catch { add(f, c, "missing"); continue; }
        if (!page.includes(f.text)) add(f, c, `no longer carries ${f.text}`);
      }
    }
  }
  return drift;
}

// Generated copies are written whole; an inline copy has its located text replaced by the source,
// minified in the source's key order, and nothing else on its page is touched.
export function write(root = PLUGIN, fragments = FRAGMENTS) {
  const written = [];
  const put = (rel, have, want) => {
    if (have === want) return;
    const file = path.join(root, rel);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, want);
    written.push(rel);
  };
  for (const f of fragments) {
    if (f.kind === "inline-json") {
      const src = JSON.stringify(JSON.parse(read(root, f.source)));
      for (const c of f.copies) {
        const page = read(root, c);
        const m = f.locate.exec(page);
        if (!m) continue;
        const at = m.index + m[0].indexOf(m[1]);
        put(c, page, page.slice(0, at) + src + page.slice(at + m[1].length));
      }
    }
  }
  return written;
}

const isMain = (() => {
  try { return fs.realpathSync(process.argv[1] ?? "") === fs.realpathSync(fileURLToPath(import.meta.url)); } catch { return false; }
})();

if (isMain) {
  const mode = process.argv[2];
  if (mode === "--list") {
    for (const f of FRAGMENTS)
      console.log(`${f.id} (${f.kind}): ${`${f.source ?? f.text} -> ${f.copies.join(", ")}`}`);
    process.exit(0);
  }
  if (mode !== "--check" && mode !== "--write") {
    console.log("usage: node evals/fragments.mjs --check | --write | --list");
    process.exit(2);
  }
  if (mode === "--write") for (const w of write()) console.log(`WROTE=${w}`);
  const drift = check();
  for (const d of drift) console.log(`DRIFT=${d.fragment}: ${d.copy}: ${d.why}`);
  console.log(drift.length ? `${drift.length} copies drifted` : `OK=${FRAGMENTS.length} fragments, every copy equal to its source`);
  process.exit(drift.length ? 1 : 0);
}
