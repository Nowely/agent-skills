// The page: one standalone, offline HTML file drawn from the record and its saved diff. Its client is
// page/runtime.js and page/page.css, inlined here; decisions.mjs's runtime is handed to it whole, so the page and
// the tests share one owner of the owner's answers. The record travels as one JSON island. The report as a document
// (page/document.mjs) sits in <noscript> elements: a reader without JavaScript reads it, the runtime never builds it.
// The diff's code travels once, as markup: each file's rows sit in their <noscript>, which that reader sees as the
// diff and the runtime reads as text, drawing a file only when it nears the viewport.
import fs from "node:fs";
import { CATALOGS, labelsOf, languageOf } from "./labels.mjs";
import { highlight } from "./highlight.mjs";
import { esc } from "./text.mjs";
import { decisionRuntime } from "./decisions.mjs";
import { sourceOf, weightOverview, PURPOSES, SHOTS } from "./review.mjs";
import { documentOf } from "./page/document.mjs";

const read = (name) => fs.readFileSync(new URL(`./page/${name}`, import.meta.url), "utf8");
const RUNTIME = read("runtime.js").trim(), STYLE = read("page.css");
const KIND = { add: 1, del: 2, ctx: 0 };

// A place written as "path:12", "path:12-20" or with " (base)", resolved against the diff when its file is in it; a
// place written as a path suffix resolves only when one touched file ends with it.
function placer(files) {
  const index = new Map(files.map((f, i) => [f.path, i]));
  return (at) => {
    if (!at) return null;
    const m = /^(.+?):(\d+)(?:-(\d+))?(\s*\(base\))?$/.exec(String(at).trim());
    if (!m) return { text: at };
    let file = index.get(m[1]);
    if (file === undefined) { const hits = files.map((f, i) => [f.path, i]).filter(([p]) => p.endsWith("/" + m[1])); if (hits.length === 1) file = hits[0][1]; }
    return { text: at, file: file ?? null, line: +m[2], end: m[3] ? +m[3] : +m[2], base: Boolean(m[4]) };
  };
}

// The screens a list of sources cites, by their index: their pictures are shown beside the claim.
const screensCited = (list) => [...new Set((list ?? []).map((x) => /^\/screens\/(\d+)$/.exec(String(x?.ref))?.[1]).filter((i) => i !== undefined).map(Number))];

// Sources as the page links them: an internal ref to a requirement, finding, question, idea, block or mechanism
// becomes its id; one to an entry of Details becomes its tab and, where it has one, its row; an external place stays
// the text sourceOf gives it.
function sourcer(review) {
  const KINDS = { requirements: "r", findings: "f", questions: "q", ideas: "i", blocks: "b", mechanisms: "m" };
  const DETAILS = { units: ["structure", (i) => `unit:${i}`], target_units: ["structure"], checks: ["checks", (i) => `check:${i}`],
    scenarios: ["scenarios", (i) => `scen:${review.scenarios[i].id}`], challenges: ["challenges", (i) => `chal:${i}`], screens: ["screens"],
    coverageStructured: ["coverage"], tradeoffs: ["coverage"] };
  return (list) => (list ?? []).map((s) => {
    const { text } = sourceOf(s, review);
    const m = s?.ref !== undefined && /^\/([A-Za-z_]+)\/(\d+)$/.exec(String(s.ref));
    if (m && DETAILS[m[1]] && review[m[1]]?.[+m[2]] !== undefined) { const [sub, sel] = DETAILS[m[1]]; return { ref: "d", sub, sel: sel ? sel(+m[2]) : "", text }; }
    const kind = m && KINDS[m[1]];
    if (!kind) return { text };
    const id = m[1] === "requirements" ? review.requirements[+m[2]]?.id : m[1] === "findings" ? review.findings[+m[2]]?.id : +m[2] + 1;
    return id === undefined ? { text } : { ref: kind, id: String(id), text };
  });
}

// The rows of one file: [kind 0 context | 1 added | 2 removed, old number, new number, block, code markup, length].
// A blank changed line no block owns belongs, for drawing only, to the block on both sides of it.
function rowsOf(file, model, hl) {
  return file.hunks.map((hunk) => {
    const rows = hunk.map((l) => [KIND[l.kind], l.old ?? null, l.new ?? null,
      l.kind === "ctx" ? 0 : (model.owner.get(`${file.path}\n${l.kind === "add" ? "+" + l.new : "-" + l.old}`) ?? -1) + 1, hl(l, file.path), l.text.length]);
    rows.forEach((r, i) => {
      if (r[0] === 0 || r[3]) return;
      let a = i - 1, b = i + 1;
      while (a >= 0 && rows[a][0] && !rows[a][3]) a--;
      while (b < rows.length && rows[b][0] && !rows[b][3]) b++;
      const before = a >= 0 && rows[a][0] ? rows[a][3] : 0, after = b < rows.length && rows[b][0] ? rows[b][3] : 0;
      if (before && before === after) r[3] = before;
    });
    return rows;
  });
}

// One file's diff as the no-JavaScript reader and the audit print see it, with a line for each block's verdict. One
// row per line of source, in a shape runtime.js parses: a hunk opens with <tbody>, a row carries its numbers in data-r
// and its code as the last cell; a block's line is not a row.
function fileMarkup(fi, file, hunks, blocks, blockLine) {
  const row = (r) => `<tr class="r ${"cad"[r[0]]}" data-r="${r[0]},${r[1] ?? ""},${r[2] ?? ""},${r[3] || ""},${r[5]}"><td class="lo">${r[1] ?? ""}</td><td class="ln">${r[2] ?? ""}</td><td class="cd">${r[4]}</td></tr>`;
  const seen = new Set();
  let last = 0;
  const rows = (list) => list.map((r) => {
    const line = r[0] && r[3] && r[3] !== last ? blockLine(blocks[r[3] - 1], seen.has(r[3])) + "\n" : "";
    if (r[0]) { if (r[3]) seen.add(r[3]); last = r[3]; }
    return line + row(r);
  }).join("\n");
  return `<noscript id="code-${fi}"><section class="sfile"><h3>${esc(file.path)}</h3><table class="diff">
${hunks.map((list) => { last = 0; return `<tbody>\n${rows(list)}\n</tbody>`; }).join("\n")}
</table></section></noscript>`;
}

export function page(review, files, model, { syntax } = {}) {
  const language = languageOf(review), labels = CATALOGS[language];
  // The render-time Shiki syntax when the caller built it; the built-in pattern highlighter otherwise.
  const hl = syntax ? (l) => syntax.line(l) : (l, path) => highlight(l.text, path);
  const placeOf = placer(files), sources = sourcer(review);
  const claims = (list) => (list ?? []).map((c) => ({ text: c.text, sources: sources(c.sources) }));
  const hunks = files.map((f) => rowsOf(f, model, hl));
  // A mechanism's weight as the printout words it, by kind, with the blocks it shares.
  const t = labelsOf(review);
  const weightOf = (weight) => weight && { rows: weightOverview(weight, t, language).map((row) => ({ kind: t(`weight.category.${row.kind}`), text: row.text })), shared: weight.shared };
  const data = {
    title: review.title, range: review.range, language, labels,
    change: review.change, verdict: review.verdict, now: review.now, target: review.target, recommendation: review.recommendation,
    steps: (review.steps ?? []).map((s) => ({ text: s.text, findings: (s.findings ?? []).map(String) })),
    coverage: review.coverage, coverageStructured: (review.coverageStructured ?? []).map((c) => ({ kind: c.kind, text: c.text, revision: c.revision, sources: sources(c.sources) })),
    tradeoffs: (review.tradeoffs ?? []).map((x) => ({ text: x.text, consequence: x.consequence, sources: sources(x.sources) })),
    passport: review.passport ?? null,
    screens: model.screens.map((s) => ({ name: s.name, match: Boolean(s.match), missing: s.missing, revision: s.revision ?? null, provenance: s.provenance,
      sources: sources(s.sources), differences: s.differences.map((d) => ({ what: d.what, why: d.why, finding: d.finding === undefined ? null : String(d.finding) })),
      // A picture given as a file travels once, in the document's <img data-pic>; the runtime takes it from there.
      pictures: SHOTS.filter((k) => s[k]).map((k) => ({ kind: k, link: s[k].link, embedded: Boolean(s[k].data) })) })),
    scenarios: model.scenarios.map((x) => ({ id: String(x.id), change: x.change, requirements: x.requirements.map(String), findings: x.findings.map(String),
      now: x.now ? { edit: x.now.edit ?? [], read: x.now.read ?? [] } : null, target: x.target ? { edit: x.target.edit ?? [], read: x.target.read ?? [] } : null })),
    digest: { diff: review.diff.sha256, record: model.recordSha ?? model.key, key: model.key, diffFile: review.diff.file },
    counters: model.counters,
    requirements: model.requirements.map((r) => ({ id: String(r.id), text: r.text, source: r.source, met: r.met, not_checked: r.not_checked, doubt: r.doubt, state: r.state,
      established: r.established, sources: sources(r.sources), screens: screensCited(r.sources),
      blocks: r.blocks.map((b) => b.id), broken: r.broken.map(String), untested: r.untested.map(String) })),
    findings: review.findings.map((f) => ({ ...f, id: String(f.id), breaks: (f.breaks ?? []).map(String), untested: (f.untested ?? []).map(String), scenarios: (f.scenarios ?? []).map(String),
      place: placeOf(f.at), blocks: model.blocks.filter((b) => b.findings.includes(f.id)).map((b) => b.id) })),
    ideas: (review.ideas ?? []).map((i, n) => ({ ...i, id: String(n + 1), place: placeOf(i.at), sources: sources(i.sources) })),
    questions: model.questions.map((q) => ({ id: String(q.id), at: q.at, place: placeOf(q.at), text: q.text, kind: q.kind, resolver: q.resolver,
      multiple: q.multiple === true, context: claims(q.context), variants: (q.variants ?? []).map((v) => ({ id: v.id, text: v.text, consequences: claims(v.consequences) })),
      recommendation: q.recommendation ? { text: q.recommendation.text, variant: q.recommendation.variant, variants: q.recommendation.variants, sources: sources(q.recommendation.sources) } : null,
      remainingEvidence: (q.remainingEvidence ?? []).map(String), zones: claims(q.zones), children: q.children.map(String),
      blocks: model.blocks.filter((b) => b.questions.includes(q.id)).map((b) => b.id),
      // the parent's variants this question applies under, by their words
      parent: q.parent ? { question: String(q.parent.question), variants: q.parent.variants,
        texts: q.parent.variants.map((id) => model.questions[q.parent.question - 1].variants.find((v) => v.id === id).text) } : null })),
    checks: (review.checks ?? []).map((c) => ({ from: c.from, do: c.do, expect: c.expect, requirements: (c.requirements ?? []).map(String) })),
    challenges: (review.challenges ?? []).map((c) => ({ ...c, place: placeOf(c.at) })),
    units: model.units.map((u) => ({ name: u.name, jobs: u.jobs ?? [], uses: u.uses, verdict: u.verdict, reason: u.reason, existing: Boolean(u.existing),
      findings: u.findings.map(String), questions: u.questions.map(String), blocks: u.blocks.map((b) => b.id), lines: u.lines })),
    targetUnits: model.target.map((u) => ({ name: u.name, jobs: u.jobs ?? [], uses: u.uses, existing: Boolean(u.existing) })),
    mechanisms: model.mechanisms.map((m) => ({ name: m.name, change: m.change, units: m.units ?? [], purpose: m.purpose, basis: m.basis, instead: m.instead,
      benefit: m.benefit, cost: m.cost, decision: m.decision, evidence: m.evidence, findings: (m.findings ?? []).map(String), blocks: m.blocks ?? [], weight: weightOf(m.weight) })),
    together: model.together && { names: model.together.names, ...weightOf(model.together) },
    blocks: model.blocks.map((b) => ({ id: b.id, path: b.path, file: model.blockFile[b.id], verdict: b.verdict, unit: b.unit ?? null, does: b.does, kind: b.kind ?? null,
      serves: b.serves.map(String), findings: b.findings.map(String), questions: b.questions.map(String), where: b.where, size: b.size, purpose: model.purpose.block[b.id] })),
    unasked: model.unasked,
    purposes: PURPOSES, purposeCounts: model.purpose.counts,
    files: files.map((f, fi) => ({ path: f.path, status: model.files[fi].status, purpose: model.files[fi].purpose,
      add: f.hunks.flat().filter((l) => l.kind === "add").length, del: f.hunks.flat().filter((l) => l.kind === "del").length })),
  };
  const doc = documentOf(data, t, (si, kind) => model.screens[si][kind].data);
  const json = JSON.stringify(data).replace(/</g, "\\u003c").replace(/[\u2028\u2029]/g, (c) => "\\u" + c.charCodeAt(0).toString(16));
  return `<!doctype html>
<html lang="${esc(Intl.getCanonicalLocales(review.language ?? "en")[0])}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(labels.kind)}: ${esc(review.title)}</title>
<style>
${STYLE}${syntax?.css ?? ""}
</style>
</head>
<body>
<div id="app"></div>
${doc.report}
${files.map((f, fi) => fileMarkup(fi, f, hunks[fi], data.blocks, doc.blockLine)).join("\n")}
${doc.details}
<script type="application/json" id="data">${json}</script>
<script>
${RUNTIME}(${decisionRuntime.toString()});
</script>
</body>
</html>
`;
}
