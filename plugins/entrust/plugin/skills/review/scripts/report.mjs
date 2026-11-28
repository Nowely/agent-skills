#!/usr/bin/env node
// A review written as data: checked against its diff, printed as the report, and drawn as a page.
//
//   node report.mjs scaffold <diff> <review.json>   write the record's mechanical part: one block per run of changed lines
//   node report.mjs carry <previous/review.json> <review.json>   on a fresh scaffold, take over the previous record's blocks whose lines are unchanged
//   node report.mjs lines <diff | review.json>   print every changed line of a diff, or of a record's saved diff, with its address
//   node report.mjs comparisons <review.json> [<base-root> <head-root>]   emit the independent reader's source inventory as JSON
//   node report.mjs ground <review.json> <repo>   read every quote at its place in the repository, list the entry points
//                                          the changed code makes, and save them beside the record for check and render
//   node report.mjs check <review.json>    validate without writing HTML
//   node report.mjs render <review.json>   check the review; write <review>.html beside it and print the report
//
// It reads only the files it is given, anywhere; references/report-data.md tells the reviewer what to write.
// `render` refuses a review whose change map leaves a nonblank changed line out, puts one in two blocks, or names
// an id nothing defines, and lists every such fault: that every nonblank changed line belongs to one block is checked here,
// not taken on trust.

import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { address, blank, changedLines, numberOf, parseDiff } from "./diff.mjs";
import { comparisons } from "./comparisons.mjs";
import { candidatesOf, checkoutOf, driftOf, GROUND } from "./ground.mjs";
import { labelsOf, languageOf } from "./labels.mjs";
import { createSyntax } from "./highlight.mjs";
import { page } from "./page.mjs";
import { check, compact, lineRead, modelOf, mechanismCounts, ownerOf, sourceOf, staleCarried, weightCountsText, weightOverview, ESTABLISHED, VERDICTS, PURPOSES, SHOTS } from "./review.mjs";

const cited = (ids) => ids?.length ? ` (${ids.join(", ")})` : "";
// What a block or unit rests on: its findings, or for a question the questions it waits on.
const grounds = (item) => cited(item.verdict === "question" ? item.questions.map((n) => `Q${n}`) : item.findings);

// The review in the shape SKILL.md gives the report. The full text carries the decision cards, the tradeoffs and
// the coverage limits: the critic and the verifier read this, not the page, so nothing analytical lives only in HTML.
function markdown(review, { blocks, requirements, units, target, mechanisms, scenarios, together, questions, screens, key, recordSha, purpose, carried, ground }, t) {
  const list = (items, line) => items?.length ? items.map(line) : [t("none")];
  const word = (kind, value) => t(`${kind}.${value}`), capital = (text) => text[0].toUpperCase() + text.slice(1);
  const coverageWord = (kind) => t(kind === "not_checked" ? "coverage.not-checked" : `coverage.${kind}`);
  const srcs = (sources) => (sources ?? []).map((s) => sourceOf(s, review).text).filter(Boolean).join("; ");
  // The checking agents read the whole card here, not the page.
  const questionText = (q, index) => {
    const n = index + 1;
    const lines = [`- Q${n} \`${q.at}\`: ${q.text} (${word("question.kind", q.kind)}${q.resolver ? `; ${q.resolver}` : ""})`];
    if (q.parent) lines.push(`  ${t("question.parent")}: Q${q.parent.question} (${q.parent.variants.join(", ")})`);
    if (q.context?.length) lines.push(`  ${t("question.context")}:`, ...q.context.map((c) => `  - ${c.text} (${srcs(c.sources)})`));
    if (q.variants?.length) lines.push(`  ${t("question.variants")}:${q.multiple ? ` ${t("p.choose-several")}` : ""}`, ...q.variants.flatMap((v) => [`  - ${v.id}: ${v.text}`,
      ...(v.consequences ?? []).map((c) => `    ${t("question.consequences")}: ${c.text} (${srcs(c.sources)})`)]));
    if (q.recommendation) lines.push(`  ${t("recommendation")}: ${q.recommendation.text}${q.recommendation.variant ? ` [${q.recommendation.variant}]` : q.recommendation.variants?.length ? ` [${q.recommendation.variants.join(", ")}]` : ""} (${srcs(q.recommendation.sources)}) — ${t("question.recommendation-note")}`);
    if (q.remainingEvidence?.length) lines.push(`  ${t("question.remaining-evidence")}: ${q.remainingEvidence.map((m) => `Q${m}`).join(", ")}`);
    if (q.zones?.length) lines.push(`  ${t("question.zones")}:`, ...q.zones.map((z) => `  - ${z.text} (${srcs(z.sources)})`));
    return lines.join("\n");
  };
  // the model's state in words; an unchecked one whose unchecked part is named says it once
  const state = (r) => [{ permission: () => t("permission"), fail: () => `${t("fails")}: ${r.broken.join(", ")}`, met: () => `${t("met")}, ${word("evidence", r.met)}`, unchecked: () => !r.not_checked && t("not-checked") }[r.state](),
    r.not_checked && `${t("not-checked")}: ${r.not_checked}`, r.untested.length && `${t("no-test")}: ${r.untested.join(", ")}`].filter(Boolean).join("; ");
  const unit = (u, status) => `- \`${u.name}${u.uses.length ? ` -> ${u.uses.join(", ")}` : ""}\`: ${u.jobs.join(", ")}. ${capital(status)}.${u.reason ? ` ${t("reason")}: ${u.reason}` : ""}`;
  const side = (s) => s ? `${t("edit")}: ${s.edit.join("; ")}. ${t("read")}: ${(s.read ?? []).join("; ") || t("nothing")}.` : t("as-now");
  const written = new Set(units.filter((u) => !u.existing).map((u) => u.name));
  const names = (label, ids) => ids?.length ? ` ${t(label)} ${ids.join(", ")}.` : "";
  // A test that confirms a step, a link or a check: the run and the quoted assertion, for the verifier to check.
  const confirmed = (list) => list?.length ? ` (${t("route.confirmed")}: ${srcs(list)})` : "";
  const resultWord = (r) => ({ pass: t("check.result.pass"), fail: t("check.result.fail"), "could-not-run": t("check.result.could-not-run"), observed: t("check.result.observed") })[r];
  return [
    ...(review.passport ? [`${t("passport")}: ${(review.passport.links ?? []).map((l) => `${l.label} (${l.url})`).join("; ")}${review.passport.links?.length ? "; " : ""}`
      + `${review.passport.repository} · ${t("passport.base")} ${review.passport.base} → ${t("passport.head")} ${review.passport.head} · ${t("passport.reviewed-at")} ${review.passport.reviewedAt}`, ""] : []),
    `## ${t("change")}`, [review.change.goal, review.change.why].filter(Boolean).join(" "), ...review.change.parts.map((part) => `- ${part}`),
    `${t("sources")}: ${review.change.sources.join("; ")}`,
    `${t("requirements")}:`, ...requirements.map((r) => `${r.id}. ${r.text} (${word("source", r.source)}${ESTABLISHED.has(r.source) ? "" : `, ${t("req.to-confirm")}`}; ${state(r)})${r.sources?.length ? ` — ${srcs(r.sources)}` : ""}${r.doubt ? ` ${t("reconsider")}: ${r.doubt}` : ""}`), "",
    // A route follows one behaviour through the code; the checking agents read its roles, links, stops and the tests
    // that confirm them here, and the verifier checks each confirmation against its run and its quoted assertion.
    ...(review.routes?.length ? [`## ${t("routes")}`, ...review.routes.flatMap((r) => [`### ${r.title}${r.kind === "states" ? ` (${t("route.states")})` : ""}${r.requirements?.length ? ` (${t("requirement").toLowerCase()} ${r.requirements.join(", ")})` : ""}`,
      ...r.steps.map((step, k) => `${k + 1}. ${step.block !== undefined ? `B${step.block} \`${blocks[step.block - 1]?.path}:${blocks[step.block - 1]?.where}\`` : `\`${step.at}\` «${step.quote}» (${t("route.unchanged")})`}: ${step.role}`
        + `${step.value ? ` ${t("route.value")}: ${step.value}` : ""}${step.via ? ` ${t("route.via")}: ${step.via}` : ""}`
        + `${step.stops ? ` ${t("route.stops")}: ${step.stops.finding !== undefined ? step.stops.finding : `Q${step.stops.question}`}` : ""}`
        + `${step.findings?.length || step.questions?.length ? ` (${[...(step.findings ?? []).map(String), ...(step.questions ?? []).map((q) => `Q${q}`)].join(", ")})` : ""}${confirmed(step.confirmedBy)}`),
      ...(r.links ?? []).map((l) => `   ${l.from} → ${l.to}: ${l.via}${l.question !== undefined ? ` (Q${l.question})` : ""}${confirmed(l.confirmedBy)}`)]), ""] : []),
    ...(ground?.unlisted.length ? [`${t("ground.unlisted", ground.unlisted.length, ground.found)}:`, ...ground.unlisted.map((c) => `- ${c.kind} \`${c.name}\` \`${c.at}\`: ${c.quote}`), ""] : []),
    `## ${t("verdict")}`, review.verdict, `${t("now")}: ${review.now}`, `${t("target")}: ${review.target}`, `${t("recommendation")}: ${review.recommendation}`,
    ...(review.steps ?? []).map((step, index) => `${index + 1}. ${step.text}${cited(step.findings)}`), "",
    `## ${t("findings")}`, ...list(review.findings, (f) => `### ${f.id}. ${f.title} (${word("direction", f.direction)}; ${word("evidence", f.evidence)})\n\`${f.at}\`: ${f.what}`
      + `${names("breaks", f.breaks)}${names("untested", f.untested)}\n${t("shown-by")}: ${f.shown_by}\n${t("fix")}: ${f.fix}\n`), "",
    `## ${t("ideas")}`, ...list(review.ideas, (idea) => `- ${idea.at ? `\`${idea.at}\`: ` : ""}${idea.title}: ${idea.text}`), "",
    ...(review.tradeoffs?.length ? [`## ${t("tradeoffs")}`, ...review.tradeoffs.map((x) => `- ${x.text} ${t("tradeoff.consequence")}: ${x.consequence} (${srcs(x.sources)})`), ""] : []),
    ...(review.checks?.length ? [`## ${t("checks")}`, t("checks-note"), ...review.checks.map((c, index) =>
      `${index + 1}. ${c.from ? `${t("from")}: ${c.from} ` : ""}${t("do")}: ${c.do.join("; ")} ${t("expect")}: ${c.expect}${c.requirements?.length ? ` (${t("requirement").toLowerCase()} ${c.requirements.join(", ")})` : ""}`
        + `${c.route ? ` (${c.route.step !== undefined ? t("route.of-check.step", c.route.route, c.route.step) : c.route.link !== undefined ? t("route.of-check.link", c.route.route, c.route.link) : t("route.of-check", c.route.route)})` : ""}${confirmed(c.confirmedBy)}`
        + (c.observations ?? []).map((o) => `\n   ${t("check.observed", o.by ?? t("check.owner"), o.revision ?? o.diff.slice(0, 12))}${o.diff === review.diff.sha256 ? "" : ` (${t("check.earlier")})`}: ${resultWord(o.result)}${o.conditions ? `; ${o.conditions}` : ""}${o.note ? ` — ${o.note}` : ""}`).join("")), ""] : []),
    ...(screens.length ? [`## ${t("screens")}`, ...screens.flatMap((s) => { const historical = s.provenance.startsWith("historical"); return [
      `- ${s.name}: ${SHOTS.filter((shot) => s[shot]).map((shot) => t(shot).toLowerCase()).join(", ") || t("no-pictures")}.${s.match ? ` ${t("matches")}` : ""}${historical ? ` (${t("screen.historical")}${s.revision ? ` @ ${s.revision}` : ""})` : ""}${historical && s.sources?.length ? ` (${srcs(s.sources)})` : ""}`,
      ...(s.differences ?? []).map((d) => `  - ${d.what}${d.why ? ` ${t("reason")}: ${d.why}` : ""}${d.finding === undefined ? "" : ` (${d.finding})`}`),
      ...(s.missing ? [`  - ${t("not-compared")}: ${s.missing}`] : [])]; }), ""] : []),
    ...(review.mechanisms?.length ? [`## ${t("mechanisms")}`, mechanismCounts(review).map(([change, count]) => `${word("change", change)}: ${count}`).join("; "), t("weight.limit"),
      ...(together ? [`${t("weight.together")} (${together.names.join(", ")}): ${weightOverview(together, t, languageOf(review)).map((row) => `${t(`weight.category.${row.kind}`)}: ${row.text}`).join("; ") || t("weight.unchanged")}`] : []),
      ...mechanisms.flatMap((m) => [
      `### ${m.name} (${word("change", m.change)}; ${word("evidence", m.evidence)})`,
      `${t("units")}: ${(m.units ?? []).join(", ") || t("none")}`,
      // The findings a mechanism names stand as related findings, never as an invented consequence of it.
      ...(m.findings?.length ? [`${t("findings")}: ${m.findings.join(", ")}`] : []),
      // Weight is printed for a mechanism whose blocks were named; the others have none to show.
      ...(m.weight ? [`${t("weight")}:`, ...(() => { const rows = weightOverview(m.weight, t, languageOf(review)); return rows.length
        ? rows.map(row => `${t(`weight.category.${row.kind}`)}: ${row.text}`) : [t("weight.unchanged")]; })(),
      ...(m.weight.shared.length ? [`${t("weight.exclusive")}: ${weightCountsText(m.weight.exclusive, t)}`] : []),
      ...m.weight.shared.map(s => `${t("weight.shared")} ${s.with.join(", ")}: ${weightCountsText({ [s.kind]: s }, t)} (B${s.block})`),
      `${t("weight.evidence")}: ${m.blocks.map(id => `B${id}`).join(", ")}`, t("weight.note")] : []),
      ...["purpose", "basis", "instead", "benefit", "cost", "decision"].filter((key) => m[key]).map((key) => `${t(key)}: ${m[key]}`), ""]) ] : []),
    `## ${t("structure")}`, ...list(units, (u) => unit(u, u.existing ? t("existing") : `${word("verdict", u.verdict)}${grounds(u)}`)),
    ...(target.length ? [`${t("target")}:`, ...target.map((u) => unit(u, t(u.existing ? "existing" : written.has(u.name) ? "from-change" : "to-write")))] : []), "",
    ...(scenarios.length ? [`## ${t("scenarios")}`, t("scenarios-note"), ...scenarios.map((s) => `${s.id}. ${s.change}${s.requirements.length ? ` (${t("requirement").toLowerCase()} ${s.requirements.join(", ")})` : ""}`
      + `\n   ${t("as-written")}: ${side(s.now)}\n   ${t("target")}: ${side(s.target)}${s.findings.length ? `\n   ${t("findings")}: ${s.findings.join(", ")}` : ""}`), ""] : []),
    // Every block with its description, verdict and reason, so the checking agents read what the page shows; the
    // lines stay on the page and in `lines`.
    `## ${t("map")}`, `${t("map-summary", blocks.length)} ${VERDICTS.map((v) => `${word("verdict", v)}: ${blocks.filter((b) => b.verdict === v).length}`).join("; ")}.`,
    `${t("purpose")}: ${PURPOSES.map((p) => `${t(`purpose.${p}`)} ${purpose.counts[p].blocks}`).join("; ")}. ${t("purpose.lines-note")}`,
    ...blocks.map((b) => `- B${b.id} \`${b.path}:${b.where}\`: ${b.does ? `${b.does} ` : ""}${b.serves.length ? `${t("serves")} ${b.serves.join(", ")}` : t("serves-nothing")}. ${capital(word("verdict", b.verdict))}${grounds(b)}${b.carried ? ` (${t("carried").toLowerCase()})` : ""}.${b.whole ? ` ${t("whole")}: ${b.whole}` : ""}`),
    ...requirements.filter((r) => !r.blocks.length).map((r) => `- ${t("requirement")} ${r.id}: ${t("no-block")}.`), "",
    ...(review.challenges?.length ? [`## ${t("challenges")}`, ...review.challenges.map((c, index) =>
      `${index + 1}. ${t(`challenger.${c.from}`)}: ${c.point} ${capital(t(`outcome.${c.outcome}`))}: ${c.note}${c.at ? ` (\`${c.at}\`)` : ""}`), ""] : []),
    `## ${t("questions")}`, ...list(review.questions, questionText), "",
    ...(review.replies?.length ? [`## ${t("replies")}`, ...review.replies.map((x, index) => `${index + 1}. ${x.place}: «${x.comment}» — ${x.text} (${srcs(x.sources)})`), ""] : []),
    `## ${t("coverage")}`,
    ...(carried?.length ? [`${t("carried")}: ${carried.map((id) => `B${id}`).join(", ")}`] : []),
    ...(review.coverageStructured ?? []).map((c) => `- ${coverageWord(c.kind)}: ${c.text}${c.revision ? ` @ ${c.revision}` : ""}${c.by ? `; ${t("coverage.by", c.by)}` : ""}${c.where ? `; ${t("coverage.where", c.where)}` : ""} (${srcs(c.sources)})`),
    review.coverage || t("none"), "",
    `${t("report-details")}: ${review.range} · ${key} · ${t("passport.diffSha")} ${review.diff?.sha256 ?? t("none")} · ${t("passport.record")} ${recordSha ?? t("none")}`,
  ].join("\n");
}

// What a script can know of a review before anyone reads the code: the diff's identity, saved beside the record, and
// one block per run of changed lines with nothing but context between, its lines already numbered. The reviewer
// writes the meaning: what each block does, what it serves and its verdict, and divides a block that holds two
// decisions. Every field left empty is a fault `check` names.
function scaffold(input, target) {
  const saved = target.replace(/(\.json)?$/, ".diff");
  for (const file of [target, saved]) if (fs.existsSync(file)) throw new Error(`${file} exists; scaffold writes a new record and never replaces one: to start over, delete ${path.basename(target)} and ${path.basename(saved)}`);
  const bytes = fs.readFileSync(input), files = parseDiff(bytes.toString("utf8")), digest = createHash("sha256").update(bytes).digest("hex");
  const blocks = files.flatMap((file) => file.hunks.flatMap((hunk) => {
    const runs = [[]], prose = /\.(md|markdown)$/i.test(file.path);
    // A run ends at unchanged context, and at a declaration: in code, a line at the margin after a blank changed
    // line; in Markdown, a heading, since a paragraph of prose is rarely a decision of its own.
    for (const line of hunk) {
      const run = runs.at(-1), last = run.at(-1);
      if (line.kind === "ctx") { if (run.length) runs.push([]); continue; }
      const starts = prose ? run.some((l) => !blank(l)) && /^#{1,6}\s/.test(line.text) : last && blank(last) && !blank(line) && /^\S/.test(line.text);
      if (starts) runs.push([line]); else run.push(line);
    }
    return runs.filter((run) => run.some((line) => !blank(line))).map((run) => {
      const of = (kind) => compact(run.filter((l) => l.kind === kind).map(numberOf));
      return { path: file.path, ...(of("add") ? { added: of("add") } : {}), ...(of("del") ? { removed: of("del") } : {}), does: "", serves: [], verdict: "" };
    });
  }));
  fs.mkdirSync(path.dirname(path.resolve(target)), { recursive: true });
  fs.writeFileSync(saved, bytes);
  const review = { title: "", language: "en", range: "", diff: { file: path.basename(saved), sha256: digest },
    change: { goal: "", parts: [], sources: [] },
    verdict: "", now: "", target: "", recommendation: "", requirements: [], findings: [], units: [], mechanisms: [], blocks, challenges: [], coverage: "" };
  fs.writeFileSync(target, `${JSON.stringify(review, null, 2)}\n`);
  return { blocks: blocks.length, files: files.length, saved };
}

// A continuation: the new record's blocks whose changed lines read exactly as one of the previous record's blocks, in
// the same order and found once, take that block's description, unit, kind and requirements. A block the previous
// record kept stays kept and is marked carried, not read again; one it did not keep is left to judge. The rest of the
// scaffold stays as it was, less the lines carried. Nothing is matched by a near likeness.
function carry(previousPath, target) {
  const prevBytes = fs.readFileSync(previousPath), prev = JSON.parse(prevBytes.toString("utf8"));
  const p = changeOf(prev, path.dirname(path.resolve(previousPath)));
  if (p.fault) throw new Error(`the previous record: ${p.fault}`);
  const review = JSON.parse(fs.readFileSync(target, "utf8")), dir = path.dirname(path.resolve(target)), cur = changeOf(review, dir);
  if (cur.fault) throw new Error(cur.fault);
  if (review.blocks.some((b) => b.verdict || b.does || b.carried) || review.previous) throw new Error(`${target} is not a fresh scaffold; carry runs right after scaffold, before any block is written`);
  const prevOwner = ownerOf(prev, p.files), curOwner = ownerOf(review, cur.files), key = (file, l) => `${file.path}\n${address(l)}`, taken = new Set();
  const carriedBlocks = [];
  prev.blocks.forEach((b, i) => {
    const pf = p.files.find((f) => f.path === b.path), nf = cur.files.find((f) => f.path === b.path);
    if (!pf || !nf) return;
    const plines = changedLines(pf), at = plines.map((l, k) => prevOwner.get(key(pf, l)) === i ? k : -1).filter((k) => k >= 0);
    if (!at.length || at.at(-1) - at[0] + 1 !== at.length) return;
    const seq = at.map((k) => lineRead(plines[k])), nlines = changedLines(nf), hits = [];
    for (let s = 0; s + seq.length <= nlines.length; s++) if (seq.every((x, j) => lineRead(nlines[s + j]) === x)) hits.push(s);
    if (hits.length !== 1) return;
    const run = nlines.slice(hits[0], hits[0] + seq.length);
    if (run.some((l) => taken.has(key(nf, l)))) return;
    run.forEach((l) => taken.add(key(nf, l)));
    const of = (kind) => compact(run.filter((l) => l.kind === kind).map(numberOf));
    carriedBlocks.push({ from: i + 1, at: [cur.files.indexOf(nf), nlines.indexOf(run[0])], block: { path: nf.path, ...(of("add") ? { added: of("add") } : {}), ...(of("del") ? { removed: of("del") } : {}),
      does: b.does ?? "", serves: b.serves ?? [], ...(b.unit ? { unit: b.unit } : {}), ...(b.kind ? { kind: b.kind } : {}), ...(b.verdict === "keep" ? { verdict: "keep", carried: true } : { verdict: "" }) } });
  });
  const rest = review.blocks.flatMap((b, j) => {
    const nf = cur.files.find((f) => f.path === b.path), mine = changedLines(nf).filter((l) => curOwner.get(key(nf, l)) === j && !taken.has(key(nf, l)));
    if (!mine.some((l) => !blank(l))) return [];
    const of = (kind) => compact(mine.filter((l) => l.kind === kind).map(numberOf));
    return [{ at: [cur.files.indexOf(nf), changedLines(nf).indexOf(mine[0])], block: { path: b.path, ...(of("add") ? { added: of("add") } : {}), ...(of("del") ? { removed: of("del") } : {}), does: "", serves: [], verdict: "" } }];
  });
  const ordered = [...carriedBlocks, ...rest].sort((x, y) => x.at[0] - y.at[0] || x.at[1] - y.at[1]);
  review.blocks = ordered.map((x) => x.block);
  // The structure tied to the blocks comes with them, its block numbers renumbered: units and target units as they were
  // named, a unit judged anew where the previous record did not keep it; mechanisms with the blocks that came over;
  // routes whose every step came over. What pointed at the previous findings or questions is left for this review.
  const renumber = new Map(ordered.map((x, i) => [x.from, i + 1]).filter(([from]) => from !== undefined));
  review.units = (prev.units ?? []).map(({ findings, questions, ...u }) => u);
  review.target_units = prev.target_units ?? [];
  review.mechanisms = (prev.mechanisms ?? []).map(({ findings, blocks, ...m }) => ({ ...m, ...(blocks ? { blocks: blocks.map((n) => renumber.get(n)).filter(Boolean) } : {}) }))
    .map((m) => m.blocks && !m.blocks.length && m.change !== "reused" ? (({ blocks, ...rest }) => rest)(m) : m);
  // A step at unchanged code comes over as it is; what pointed at the previous findings, questions and runs does not.
  const touched = new Set(cur.files.map((f) => f.path));
  const routes = (prev.routes ?? []).filter((r) => r.steps.every((s) => s.block === undefined ? !touched.has(String(s.at).replace(/:\d+$/, "")) : renumber.has(s.block)));
  if (routes.length) review.routes = routes.map((r) => ({ ...r,
    steps: r.steps.map(({ stops, confirmedBy, findings, questions, ...s }) => s.block === undefined ? s : { ...s, block: renumber.get(s.block) }),
    ...(r.links ? { links: r.links.map(({ question, confirmedBy, ...l }) => l) } : {}) }));
  // A carried block serves the previous record's requirements by their ids: they come with it, each still to be checked.
  // A source that pointed into the previous record by `ref` would name another entry here: it is left out, and a
  // requirement left with no source is refused until this review cites one again.
  const unsourced = [];
  review.requirements = (prev.requirements ?? []).map(({ id, text, source, sources, permission }) => {
    const kept = (sources ?? []).filter((x) => x?.ref === undefined);
    if (kept.length !== (sources ?? []).length) unsourced.push(id);
    return { id, text, source, ...(kept.length ? { sources: kept } : {}), ...(permission ? { permission } : {}) };
  });
  // A kept block is carried only while what it was kept for stands: a block of a unit that changed, or uses one that
  // did, and a block with no unit in a file that changed, are read again — until nothing more changes.
  review.previous = { record: path.relative(dir, path.resolve(previousPath)), sha256: createHash("sha256").update(prevBytes).digest("hex") };
  const prevRecord = { review: prev, files: p.files, owner: prevOwner };
  for (let again = true; again;) {
    const stale = staleCarried(review, cur.files, ownerOf(review, cur.files), prevRecord);
    again = stale.some(Boolean);
    stale.forEach((why, i) => { if (why) { const { carried, ...b } = review.blocks[i]; review.blocks[i] = { ...b, verdict: "" }; } });
  }
  // A unit with a block read again is judged again, its reason with it.
  const reread = new Set(review.blocks.filter((b) => b.carried !== true && b.unit).map((b) => b.unit));
  for (const b of prev.blocks) if (b.unit && !review.blocks.some((x) => x.carried === true && x.unit === b.unit)) reread.add(b.unit);
  review.units = review.units.map((u) => u.existing || (u.verdict === "keep" && !reread.has(u.name)) ? u : { ...u, verdict: "", reason: "" });
  fs.writeFileSync(target, `${JSON.stringify(review, null, 2)}\n`);
  const kept = review.blocks.filter((b) => b.carried).length;
  return { kept, judge: carriedBlocks.length - kept, fresh: rest.length, routes: [routes.length, (prev.routes ?? []).length], unsourced };
}

// The diff a record judges is the copy saved beside it, checked against its digest.
function changeOf(review, directory) {
  if (review.diff === undefined) return { files: [], fault: "the record has no saved diff" };
  const file = path.resolve(directory, String(review.diff?.file ?? ""));
  if (!review.diff?.file || !fs.existsSync(file)) return { files: [], fault: `the saved diff "${review.diff?.file ?? ""}" is not beside the record` };
  const bytes = fs.readFileSync(file);
  if (createHash("sha256").update(bytes).digest("hex") !== review.diff.sha256)
    return { files: [], fault: `the saved diff "${review.diff.file}" is not the one this record was scaffolded from; scaffold a new record for another change` };
  return { files: parseDiff(bytes.toString("utf8")) };
}

const [command, argument] = process.argv.slice(2);
try {
  if (command === "scaffold" && argument && process.argv[4]) {
    const made = scaffold(argument, process.argv[4]);
    console.log(`${process.argv[4]}: ${made.blocks} blocks over ${made.files} files; the diff is saved as ${made.saved}. Fill in \`range\` (how the diff was obtained and the state its files are read at; read them there), the change's sources, and each block's verdict, what it serves and what it does and why; divide a block that holds two decisions; then run check.`);
  } else if (command === "carry" && argument && process.argv[4]) {
    const made = carry(argument, process.argv[4]);
    console.log(`${process.argv[4]}: ${made.kept} kept blocks carried unchanged, not to be read again; ${made.judge} blocks of the previous record to judge again, their descriptions kept — not kept before, or kept for a unit or file that changed; ${made.fresh} blocks new or changed.${made.unsourced.length ? ` Requirements ${made.unsourced.join(", ")} lost sources that pointed into the previous record; cite them again.` : ""} The previous requirements, units, target units, mechanisms and ${made.routes[0]} of ${made.routes[1]} routes came with them, renumbered; check each again — requirements come without met or doubt, units not kept without a verdict — and add what the export's answers make, with new ids.`);
  } else if (command === "comparisons" && argument && [4, 6].includes(process.argv.length)) {
    const review = JSON.parse(fs.readFileSync(argument, "utf8"));
    const { files, fault } = changeOf(review, path.dirname(path.resolve(argument)));
    if (fault) throw new Error(fault);
    const inventory = comparisons(review, files, process.argv[4], process.argv[5]);
    console.log(JSON.stringify(inventory, null, 2));
  } else if (command === "lines" && argument) {
    // A record's own diff when given a record, so the addresses are the ones its check reads.
    const files = argument.endsWith(".json") ? (({ files, fault }) => { if (fault) throw new Error(fault); return files; })(
      changeOf(JSON.parse(fs.readFileSync(argument, "utf8")), path.dirname(path.resolve(argument)))) : parseDiff(fs.readFileSync(argument, "utf8"));
    for (const file of files) console.log([file.path, ...changedLines(file).map((l) => `  ${address(l).padEnd(6)} ${l.text}`)].join("\n"));
  } else if (command === "ground" && argument && process.argv[4]) {
    const review = JSON.parse(fs.readFileSync(argument, "utf8")), directory = path.dirname(path.resolve(argument)), repo = path.resolve(process.argv[4]);
    const { files, fault } = changeOf(review, directory);
    if (fault) throw new Error(fault);
    if (!fs.existsSync(repo) || !fs.statSync(repo).isDirectory()) throw new Error(`${process.argv[4]} is not a directory: give the checkout at the reviewed state`);
    // The checkout at its commit: every line the diff adds must stand there, or this is not the reviewed state.
    const checkout = checkoutOf(repo), drift = driftOf(files, checkout);
    if (drift) throw new Error(`${checkout.root}${checkout.sha ? ` at ${checkout.sha.slice(0, 12)}` : ""} is not the reviewed state: ${drift}. Check out the reviewed head and run ground again`);
    if (!checkout.sha) console.error(`warning: ${checkout.root} is no git checkout: its files are read as they are now, and no callers are listed`);
    fs.writeFileSync(path.join(directory, GROUND), `${JSON.stringify({ diff_sha256: review.diff.sha256, repo: checkout.root, sha: checkout.sha, candidates: candidatesOf(files, checkout) }, null, 1)}\n`);
    const { errors, warnings, ground } = check(review, files, directory);
    for (const warning of warnings) console.error(`warning: ${warning}`);
    if (errors.length) console.error(`Fix these ${errors.length} and run check again:\n${errors.map((e) => `- ${e}`).join("\n")}`);
    console.log(`${GROUND}: ${ground?.found ?? 0} places found in the changed code, ${ground?.unlisted.length ?? 0} on no route; ${ground?.checked ?? 0} quotes read at their places, ${ground?.skipped ?? 0} not read (another revision, a base line, or no file).`);
    process.exit(errors.length ? 1 : 0);
  } else if (["render", "check"].includes(command) && argument) {
    const bytes = fs.readFileSync(argument), review = JSON.parse(bytes.toString("utf8")), directory = path.dirname(path.resolve(argument));
    const { files, fault } = changeOf(review, directory), { errors, warnings = [], owner, ground = null } = fault ? { errors: [fault], owner: new Map() } : check(review, files, directory);
    if (errors.length) {
      console.error(`The review does not match the diff; fix these ${errors.length} and check again:\n${errors.map((e) => `- ${e}`).join("\n")}`);
      process.exit(1);
    }
    // The record's identity is computed from its bytes, never stored in it; the page and the printout carry it.
    const model = { ...modelOf(review, files, owner, directory), recordSha: createHash("sha256").update(bytes).digest("hex"), ground };
    for (const warning of warnings) console.error(`warning: ${warning}`);
    // One verdict over a large block is where a needless part hides: the check cannot see decisions, only size. A block
    // that says in "whole" why it is one decision is not warned of; the printout carries the reason to the critic.
    for (const b of model.blocks.filter((b) => b.verdict === "keep" && !b.whole && b.weightLines.added + b.weightLines.removed >= 40))
      console.error(`warning: block ${b.id} (${b.path} ${b.where}) keeps ${b.weightLines.added + b.weightLines.removed} lines under one verdict; divide it, or say in "whole" why it is one decision`);
    for (const [ids, what] of [[model.unasked.unlinked, "serve no requirement"], [model.unasked.assumed, "serve only requirements to confirm"]])
      if (ids.length) console.error(`warning: kept blocks ${ids.join(", ")} ${what}; name what each serves, or make it a question or an idea for the owner`);
    for (const u of model.units.filter((u) => u.verdict === "keep" && u.blocks.some((b) => b.verdict !== "keep")))
      console.error(`warning: unit ${u.name} is kept, and its blocks ${u.blocks.filter((b) => b.verdict !== "keep").map((b) => b.id).join(", ")} are not; say what the unit's verdict leaves open`);
    if (command === "check") { console.log("Review data matches the diff."); process.exit(0); }
    const target = argument.replace(/(\.json)?$/, ".html");
    // One Shiki highlighter per render: the page receives ready spans and CSS, and the HTML loads nothing.
    const syntax = await createSyntax(files);
    fs.writeFileSync(target, page(review, files, model, { syntax, directory }));
    console.log(`${markdown(review, model, labelsOf(review))}\n\n${labelsOf(review)("page")}: ${target}`);
  } else {
    console.error("usage: report.mjs scaffold <diff> <review.json> | report.mjs carry <previous/review.json> <review.json> | report.mjs lines <diff | review.json> | report.mjs ground <review.json> <repo> | report.mjs comparisons <review.json> [<base-root> <head-root>] | report.mjs check <review.json> | report.mjs render <review.json>");
    process.exit(2);
  }
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
