#!/usr/bin/env node
// Prototype generator: draws the redesigned review page from a real record and its saved diff.
//
//   node build.mjs <review.json> <out.html>
//
// The record's saved diff is read beside it, as the report reads it. The review skill's own modules do the work,
// imported read-only and found from this script's place (prototype/ -> 2026-11-19-report-redesign/ -> research/
// -> plugins/entrust/, then plugin/skills/review/scripts/): diff parsing, the check that assigns every changed
// line to its block, the model, the label catalog and the vendored Shiki highlighter. The output is one
// standalone, offline HTML file: app.css and app.js from this folder inline, the record's data as one JSON island,
// and the syntax as class-based token spans (one CSS rule per token colour per theme).
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SCRIPTS = path.resolve(HERE, "../../../plugin/skills/review/scripts");
const load = (name) => import(pathToFileURL(path.join(SCRIPTS, name)).href);
const { parseDiff } = await load("diff.mjs");
const { check, modelOf, sourceOf, PURPOSES } = await load("review.mjs");
const { labelsOf } = await load("labels.mjs");
const { createSyntax, highlight } = await load("highlight.mjs");
const [input, output] = process.argv.slice(2);
if (!input || !output) { console.error("usage: node build.mjs <review.json> <out.html>"); process.exit(2); }

const started = Date.now();
const recordBytes = fs.readFileSync(input), review = JSON.parse(recordBytes.toString("utf8"));
const directory = path.dirname(path.resolve(input));
const diffBytes = fs.readFileSync(path.resolve(directory, review.diff.file));
const diffSha = createHash("sha256").update(diffBytes).digest("hex");
if (diffSha !== review.diff.sha256) throw new Error("the saved diff is not the one the record names");
const files = parseDiff(diffBytes.toString("utf8"));
const { errors, warnings, owner } = check(review, files, directory);
if (errors.length) throw new Error(`the record does not pass the check:\n${errors.join("\n")}`);
const model = modelOf(review, files, owner, directory);
const t = labelsOf(review);

// ---- syntax: Shiki spans with inline colours become classes; colours re-checked against this page's code backgrounds.
const syntax = await createSyntax(files);
const LIGHT_BGS = ["#ffffff", "#e9f6ed", "#fdeeec"], DARK_BGS = ["#151920", "#16291e", "#2e1a1d"];
const hex2rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const rgb2hex = (c) => "#" + c.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("");
const lum = (rgb) => { const [r, g, b] = rgb.map((v) => { v /= 255; return v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }); return .2126 * r + .7152 * g + .0722 * b; };
const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
function adjust(hex, bgs, lighten) {
  const base = hex2rgb(hex), bg = bgs.map(hex2rgb), min = (c) => Math.min(...bg.map((b) => ratio(c, b)));
  if (min(base) >= 4.6) return hex;
  let lo = 0, hi = 1;
  for (let i = 0; i < 24; i++) { const m = (lo + hi) / 2, c = base.map((v) => lighten ? v + (255 - v) * m : v * (1 - m)); if (min(c) >= 4.6) hi = m; else lo = m; }
  return rgb2hex(base.map((v) => lighten ? v + (255 - v) * hi : v * (1 - hi)));
}
const tokenClass = new Map(); // "light|dark|font" -> class index
const DEFAULT_LIGHT = "#24292e";
function classify(html) {
  return html.replace(/<span style="color:(#[0-9a-f]{6});--shiki-dark:(#[0-9a-f]{6})([^"]*)">([^<]*)<\/span>/g, (all, light, dark, font, text) => {
    if (light === DEFAULT_LIGHT && !font) return text; // the code's own text colour: no span at all
    const key = `${light}|${dark}|${font}`;
    if (!tokenClass.has(key)) tokenClass.set(key, tokenClass.size);
    return `<span class="t${tokenClass.get(key)}">${text}</span>`;
  });
}
const lineHtml = (l, p) => syntax ? classify(syntax.line(l)) : highlight(l.text, p);

// ---- places: "path:12" or "path:12-20", resolved against the diff when the file and line are in it.
const fileIndex = new Map(files.map((f, i) => [f.path, i]));
function placeOf(at) {
  if (!at) return null;
  const m = /^(.+?):(\d+)(?:-(\d+))?(\s*\(base\))?$/.exec(String(at).trim());
  if (!m) return { text: at };
  const base = Boolean(m[4]);
  let file = fileIndex.get(m[1]);
  // a place written as a path suffix ("config.mjs:38") resolves only when one touched file ends with it
  if (file === undefined) { const hits = files.map((f, i) => [f.path, i]).filter(([p]) => p.endsWith("/" + m[1])); if (hits.length === 1) file = hits[0][1]; }
  return { text: at, file: file ?? null, line: +m[2], end: m[3] ? +m[3] : +m[2], base };
}

// ---- sources: internal refs become link chips; external places stay text.
function sources(list) {
  return (list ?? []).map((s) => {
    if (s?.ref !== undefined) {
      const m = /^\/([A-Za-z_]+)\/(\d+)$/.exec(String(s.ref)), { text } = sourceOf(s, review);
      const kind = m && { requirements: "r", findings: "f", questions: "q", blocks: "b", mechanisms: "m" }[m[1]];
      const id = m && (m[1] === "requirements" ? review.requirements[+m[2]]?.id : m[1] === "findings" ? review.findings[+m[2]]?.id : +m[2] + 1);
      return kind && id !== undefined ? { ref: kind, id: String(id), text } : { text };
    }
    return { text: sourceOf(s, review).text, at: s?.at };
  });
}
const claims = (list) => (list ?? []).map((c) => ({ text: c.text, sources: sources(c.sources) }));

// ---- rows of the diff: [kind 0 ctx | 1 add | 2 del, old, new, block, html]
const blockOf = (f, l) => { const i = owner.get(`${f.path}\n${l.kind === "add" ? "+" : "-"}${l.kind === "add" ? l.new : l.old}`); return i === undefined ? 0 : i + 1; };
const outFiles = files.map((f, fi) => {
  let add = 0, del = 0;
  const hunks = f.hunks.map((h) => {
    const rows = h.map((l) => {
      if (l.kind === "add") add++; else if (l.kind === "del") del++;
      // [kind, old number, new number, block, highlighted html, text length — for wrapped-height estimates]
      return [l.kind === "ctx" ? 0 : l.kind === "add" ? 1 : 2, l.old ?? null, l.new ?? null, l.kind === "ctx" ? 0 : blockOf(f, l), lineHtml(l, f.path), l.text.length];
    });
    // a blank changed line no block owns belongs, for drawing only, to the block on both sides of it
    rows.forEach((r, i) => {
      if (r[0] === 0 || r[3]) return;
      let a = i - 1, b = i + 1;
      while (a >= 0 && rows[a][0] && !rows[a][3]) a--;
      while (b < rows.length && rows[b][0] && !rows[b][3]) b++;
      const before = a >= 0 && rows[a][0] ? rows[a][3] : 0, after = b < rows.length && rows[b][0] ? rows[b][3] : 0;
      if (before && before === after) r[3] = before;
    });
    return { o: h[0]?.old ?? h.find((l) => l.old !== undefined)?.old ?? 0, n: h.find((l) => l.new !== undefined)?.new ?? 0, rows };
  });
  const meta = model.files[fi];
  return { path: f.path, status: meta.status, purpose: meta.purpose, add, del, hunks };
});

// ---- the words the page borrows from the report's own catalog
const words = {};
for (const key of ["verdict.keep", "verdict.fix", "verdict.remove", "verdict.split", "verdict.merge", "verdict.question",
  "source.task", "source.discussion", "source.project", "source.question", "source.assumption",
  "evidence.ran", "evidence.read", "evidence.judgment", "direction.behavior", "direction.necessity", "direction.design", "direction.tests",
  "challenger.target", "challenger.critic", "challenger.verifier", "outcome.accepted", "outcome.rejected", "outcome.owner",
  "change.added", "change.reused", "change.changed", "change.removed", "now", "target", "recommendation", "checks-note", "challenges-note", "weight.note"]) {
  words[key] = t(key);
  if (words[key] === "undefined") throw new Error(`the report's label catalog has no "${key}"; the prototype borrows it`);
}

const data = {
  title: review.title, range: review.range, language: review.language ?? "en",
  change: review.change, verdict: review.verdict, now: review.now, target: review.target, recommendation: review.recommendation,
  steps: (review.steps ?? []).map((s) => ({ text: s.text, findings: (s.findings ?? []).map(String) })),
  coverage: review.coverage, coverageStructured: (review.coverageStructured ?? []).map((c) => ({ kind: c.kind, text: c.text, revision: c.revision, sources: sources(c.sources) })),
  tradeoffs: (review.tradeoffs ?? []).map((x) => ({ text: x.text, consequence: x.consequence, sources: sources(x.sources) })),
  passport: review.passport ?? null,
  // every screen field, provenance included: a historical picture carries its revision and sources
  screens: (model.screens ?? []).map((s) => ({ name: s.name, match: Boolean(s.match), missing: s.missing, historical: Boolean(s.historical), revision: s.revision ?? null,
    sources: sources(s.sources), differences: (s.differences ?? []).map((d) => ({ what: d.what, why: d.why, finding: d.finding === undefined ? null : String(d.finding) })),
    pictures: ["mockup", "before", "after"].filter((k) => s[k]).map((k) => ({ kind: k, link: s[k]?.link, data: s[k]?.data })) })),
  scenarios: model.scenarios.map((x) => ({ id: String(x.id), change: x.change, requirements: x.requirements.map(String), findings: x.findings.map(String),
    now: x.now ? { edit: x.now.edit ?? [], read: x.now.read ?? [] } : null, target: x.target ? { edit: x.target.edit ?? [], read: x.target.read ?? [] } : null })),
  digest: { diff: diffSha, record: createHash("sha256").update(recordBytes).digest("hex"), key: model.key, diffFile: review.diff.file },
  counters: model.counters,
  requirements: model.requirements.map((r) => ({ id: String(r.id), text: r.text, source: r.source, met: r.met, not_checked: r.not_checked, doubt: r.doubt, permission: r.permission,
    blocks: r.blocks.map((b) => b.id), broken: r.broken.map(String), untested: r.untested.map(String) })),
  findings: review.findings.map((f) => ({ ...f, id: String(f.id), breaks: (f.breaks ?? []).map(String), untested: (f.untested ?? []).map(String), scenarios: (f.scenarios ?? []).map(String), place: placeOf(f.at) })),
  ideas: (review.ideas ?? []).map((i, n) => ({ ...i, id: String(n + 1), place: placeOf(i.at) })),
  questions: model.questions.map((q) => ({ id: String(q.id), at: q.at, place: placeOf(q.at), text: q.text, kind: q.kind, resolver: q.resolver,
    context: claims(q.context), variants: (q.variants ?? []).map((v) => ({ id: v.id, text: v.text, consequences: claims(v.consequences) })),
    recommendation: q.recommendation ? { text: q.recommendation.text, variant: q.recommendation.variant, sources: sources(q.recommendation.sources) } : null,
    remainingEvidence: (q.remainingEvidence ?? []).map(String), parent: q.parent ? { question: String(q.parent.question), variants: q.parent.variants } : null,
    zones: claims(q.zones), children: q.children.map(String) })),
  checks: (review.checks ?? []).map((c) => ({ from: c.from, do: c.do, expect: c.expect, requirements: (c.requirements ?? []).map(String) })),
  challenges: (review.challenges ?? []).map((c) => ({ ...c, place: placeOf(c.at) })),
  units: model.units.map((u) => ({ name: u.name, jobs: u.jobs ?? [], uses: u.uses, verdict: u.verdict, reason: u.reason, existing: Boolean(u.existing),
    findings: u.findings.map(String), questions: u.questions.map(String), blocks: u.blocks.map((b) => b.id) })),
  targetUnits: model.target.map((u) => ({ name: u.name, jobs: u.jobs ?? [], uses: u.uses, existing: Boolean(u.existing) })),
  mechanisms: model.mechanisms.map((m) => ({ name: m.name, change: m.change, units: m.units ?? [], purpose: m.purpose, basis: m.basis, instead: m.instead,
    benefit: m.benefit, cost: m.cost, decision: m.decision, evidence: m.evidence, findings: (m.findings ?? []).map(String), blocks: m.blocks ?? [], weight: m.weight })),
  together: model.together,
  blocks: model.blocks.map((b) => ({ id: b.id, path: b.path, file: model.blockFile[b.id], verdict: b.verdict, unit: b.unit ?? null, does: b.does, kind: b.kind ?? null,
    serves: b.serves.map(String), findings: b.findings.map(String), questions: b.questions.map(String), where: b.where, size: b.size,
    lines: b.weightLines, purpose: model.purpose.block[b.id] })),
  purposes: PURPOSES, purposeCounts: model.purpose.counts,
  files: outFiles, words,
};

// ---- token CSS, both themes
let tokenCss = "";
for (const [key, index] of tokenClass) {
  const [light, dark, font] = key.split("|");
  const style = font.replace(/^;/, "").replace(/;/g, ";");
  tokenCss += `.t${index}{color:${adjust(light, LIGHT_BGS, false)}${style ? ";" + style : ""}}\n`;
  tokenCss += `:root[data-theme="dark"] .t${index}{color:${adjust(dark, DARK_BGS, true)}}\n`;
  tokenCss += `@media (prefers-color-scheme: dark){:root:not([data-theme="light"]) .t${index}{color:${adjust(dark, DARK_BGS, true)}}}\n`;
}
if (!syntax) tokenCss += ".t-c{color:#57606a}.t-s{color:#0a3069}.t-n{color:#0550ae}.t-k{color:#cf222e}\n";

const css = fs.readFileSync(path.join(HERE, "app.css"), "utf8");
const js = fs.readFileSync(path.join(HERE, "app.js"), "utf8");
const json = JSON.stringify(data).replace(/</g, "\\u003c").replace(/[\u2028\u2029]/g, (c) => "\\u" + c.charCodeAt(0).toString(16));
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const html = `<!doctype html>
<html lang="${esc(data.language)}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(review.title)} · Review</title>
<style>
${css}
/* syntax tokens: Shiki's GitHub themes, re-checked to >=4.6:1 on this page's code backgrounds */
${tokenCss}</style>
</head>
<body>
<div id="app" aria-busy="true"><p class="boot">Loading the review…</p></div>
<noscript><p class="boot">This prototype needs JavaScript.</p></noscript>
<script type="application/json" id="data">${json}</script>
<script>
${js}
</script>
</body>
</html>
`;
fs.writeFileSync(output, html);
console.log(`${output}: ${(html.length / 1024).toFixed(0)} KB (data ${(json.length / 1024).toFixed(0)} KB), ${files.length} files, ${model.blocks.length} blocks, ${tokenClass.size} token classes, ${warnings.length} check warnings, ${Date.now() - started} ms`);
