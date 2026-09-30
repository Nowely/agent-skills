#!/usr/bin/env node
// The text two skill pages share, held once: each fragment has one source and its copies, and a copy that
// differs from its source is drift.
//
//   node evals/fragments.mjs --check    one DRIFT= line per copy that differs, exit 1; exit 0 when none
//   node evals/fragments.mjs --write    rewrite every copy from its source, then check
//   node evals/fragments.mjs --list     the fragments, their sources and their copies
//
// Why: the orchestrate page planned from the codex page's composition rules and rights table, so it
// ordered the whole codex page loaded (#15 F18: 4,511 words before a plan with no Codex agent in it), and
// the pages' hand copies of shared text drifted (#15 P12b). A generated copy is a whole file this module
// writes and nobody edits; an inline copy is one span of a page, which --write replaces and nothing else
// on the page; a literal is text each page must still carry, which only its writer can restore.
// fragments.test.mjs runs --check, and run-all runs that suite before the release gate.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const PLUGIN = path.join(path.dirname(HERE), "plugin");

export const FRAGMENTS = [
  {
    id: "codex-composition",
    kind: "generated",
    copy: "skills/orchestrate/references/codex-composition.md",
    title: "Composition and rights",
    sources: [
      { file: "skills/codex/SKILL.md", heading: "## Composition", extent: "section" },
      { file: "skills/codex/SKILL.md", heading: "## Rights", extent: "through the paragraph after its table" },
    ],
    // The page that plans from the copy must link it, and the row its plan reference says it replaces must be in
    // the source.
    linkedFrom: "skills/orchestrate/SKILL.md",
    rows: [{ page: "skills/orchestrate/references/plan.md", says: 'the "nothing" row', row: /^\| nothing \|/m }],
  },
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
    copies: ["skills/orchestrate/SKILL.md", "skills/swarm/SKILL.md", "skills/experiment/SKILL.md", "skills/prepare-feedback/SKILL.md"],
  },
];

const read = (root, rel) => fs.readFileSync(path.join(root, rel), "utf8");

// A section from its heading to the next heading of the same level; or, for a rights-style section, from
// its heading through the first table and the paragraph that follows it.
export function extract(text, { heading, extent }) {
  const lines = text.split("\n");
  const start = lines.findIndex((l) => l === heading);
  if (start < 0) throw new Error(`no line reads ${JSON.stringify(heading)}`);
  const level = heading.match(/^#+/)[0];
  let end = lines.findIndex((l, i) => i > start && new RegExp(`^${level} `).test(l));
  if (end < 0) end = lines.length;
  let body = lines.slice(start, end);
  if (extent === "through the paragraph after its table") {
    const t0 = body.findIndex((l) => l.startsWith("|"));
    if (t0 < 0) throw new Error(`${heading} has no table`);
    let i = t0;
    while (i < body.length && body[i].startsWith("|")) i++;
    while (i < body.length && body[i].trim() === "") i++;
    while (i < body.length && body[i].trim() !== "") i++;
    body = body.slice(0, i);
  }
  while (body.length && body[body.length - 1].trim() === "") body.pop();
  return body.join("\n");
}

// A relative link in the source still has to resolve from the copy's directory.
export function relink(text, fromFile, toFile) {
  const fromDir = path.posix.dirname(fromFile), toDir = path.posix.dirname(toFile);
  return text.replace(/\]\(([^)\s]+)\)/g, (m, target) => {
    if (/^[a-z]+:/i.test(target)) return m;
    const [rel, anchor] = target.split("#");
    const abs = rel ? path.posix.join(fromDir, rel) : fromFile;
    return `](${path.posix.relative(toDir, abs)}${anchor !== undefined ? `#${anchor}` : ""})`;
  });
}

const marker = (f, n, s, rel) => `<!-- fragment ${f.id} ${n}: ${rel}, ${s.heading}${s.extent === "section" ? "" : `, ${s.extent}`} -->`;
const END = "<!-- /fragment -->";

export function generate(f, root = PLUGIN) {
  const blocks = f.sources.map((s, i) => {
    const rel = path.posix.relative(path.posix.dirname(f.copy), s.file);
    const body = relink(extract(read(root, s.file), s), s.file, f.copy);
    return `${marker(f, i + 1, s, rel)}\n${body}\n${END}`;
  });
  return [
    `# ${f.title}`,
    "",
    blocks.join("\n\n"),
    "",
  ].join("\n");
}

// Sorted keys at every level: an inline copy is minified by hand, and key order is not a difference.
const canon = (v) => (Array.isArray(v) ? v.map(canon)
  : v && typeof v === "object" ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, canon(v[k])])) : v);
const same = (a, b) => JSON.stringify(canon(a)) === JSON.stringify(canon(b));

// Every problem as { fragment, copy, why }, none when the copies agree with their sources.
export function check(root = PLUGIN, fragments = FRAGMENTS) {
  const drift = [];
  const add = (f, copy, why) => drift.push({ fragment: f.id, copy, why });
  for (const f of fragments) {
    if (f.kind === "generated") {
      let want;
      try { want = generate(f, root); } catch (e) { add(f, f.copy, `its source cannot be read: ${e.message}`); continue; }
      let have = null;
      try { have = read(root, f.copy); } catch {}
      if (have === null) add(f, f.copy, "missing; run --write");
      else if (have !== want) {
        const a = have.split("\n"), b = want.split("\n");
        const i = a.findIndex((l, k) => l !== b[k]);
        add(f, f.copy, `differs from its source at line ${i + 1}: has ${JSON.stringify((a[i] ?? "<end>").slice(0, 100))}, the source gives ${JSON.stringify((b[i] ?? "<end>").slice(0, 100))}`);
      }
      if (f.linkedFrom) {
        let page = "";
        try { page = read(root, f.linkedFrom); } catch {}
        const target = path.posix.relative(path.posix.dirname(f.linkedFrom), f.copy);
        if (!page.includes(`](${target}`)) add(f, f.linkedFrom, `does not link ${target}, so nothing reads the generated copy`);
      }
      for (const r of f.rows ?? []) {
        const src = f.sources.map((s) => { try { return extract(read(root, s.file), s); } catch { return ""; } }).join("\n");
        let page = "";
        try { page = read(root, r.page); } catch {}
        if (page.includes(r.says) && !r.row.test(src)) add(f, r.page, `names ${r.says} of a table whose source has no such row`);
      }
    } else if (f.kind === "inline-json") {
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
    if (f.kind === "generated") {
      let have = null;
      try { have = read(root, f.copy); } catch {}
      put(f.copy, have, generate(f, root));
    } else if (f.kind === "inline-json") {
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
      console.log(`${f.id} (${f.kind}): ${f.kind === "generated" ? `${f.sources.map((s) => `${s.file} ${s.heading}`).join(" + ")} -> ${f.copy}` : `${f.source ?? f.text} -> ${f.copies.join(", ")}`}`);
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
