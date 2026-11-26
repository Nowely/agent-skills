#!/usr/bin/env node
// A review written as data: checked against its diff, printed as the report, and drawn as a page.
//
//   node report.mjs scaffold <diff> <review.json>   write the record's mechanical part: one block per run of changed lines
//   node report.mjs lines <diff | review.json>   print every changed line of a diff, or of a record's saved diff, with its address
//   node report.mjs comparisons <review.json> [<base-root> <head-root>]   emit the independent reader's source inventory as JSON
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
import { labelsOf, languageOf } from "./labels.mjs";
import { createSyntax } from "./highlight.mjs";
import { page } from "./page.mjs";
import { check, compact, modelOf, mechanismCounts, sourceOf, weightCountsText, weightOverview, ESTABLISHED, VERDICTS, PURPOSES, SHOTS } from "./review.mjs";

const cited = (ids) => ids?.length ? ` (${ids.join(", ")})` : "";
// What a block or unit rests on: its findings, or for a question the questions it waits on.
const grounds = (item) => cited(item.verdict === "question" ? item.questions.map((n) => `Q${n}`) : item.findings);

// The review in the shape SKILL.md gives the report. The full text carries the decision cards, the tradeoffs and
// the coverage limits: the critic and the verifier read this, not the page, so nothing analytical lives only in HTML.
function markdown(review, { blocks, requirements, units, target, mechanisms, scenarios, together, questions, screens, key, recordSha, purpose }, t) {
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
  return [
    ...(review.passport ? [`${t("passport")}: ${(review.passport.links ?? []).map((l) => `${l.label} (${l.url})`).join("; ")}${review.passport.links?.length ? "; " : ""}`
      + `${review.passport.repository} · ${t("passport.base")} ${review.passport.base} → ${t("passport.head")} ${review.passport.head} · ${t("passport.reviewed-at")} ${review.passport.reviewedAt}`, ""] : []),
    `## ${t("change")}`, [review.change.goal, review.change.why].filter(Boolean).join(" "), ...review.change.parts.map((part) => `- ${part}`),
    `${t("sources")}: ${review.change.sources.join("; ")}`,
    `${t("requirements")}:`, ...requirements.map((r) => `${r.id}. ${r.text} (${word("source", r.source)}${ESTABLISHED.has(r.source) ? "" : `, ${t("req.to-confirm")}`}; ${state(r)})${r.sources?.length ? ` — ${srcs(r.sources)}` : ""}${r.doubt ? ` ${t("reconsider")}: ${r.doubt}` : ""}`), "",
    // A route follows one behaviour through its blocks in order; the checking agents read the roles and links here.
    ...(review.routes?.length ? [`## ${t("routes")}`, ...review.routes.flatMap((r) => [`### ${r.title}${r.requirements?.length ? ` (${t("requirement").toLowerCase()} ${r.requirements.join(", ")})` : ""}`,
      ...r.steps.map((step, k) => `${k + 1}. B${step.block} \`${blocks[step.block - 1]?.path}:${blocks[step.block - 1]?.where}\`: ${step.role}${step.via ? ` ${t("route.via")}: ${step.via}` : ""}`)]), ""] : []),
    `## ${t("verdict")}`, review.verdict, `${t("now")}: ${review.now}`, `${t("target")}: ${review.target}`, `${t("recommendation")}: ${review.recommendation}`,
    ...(review.steps ?? []).map((step, index) => `${index + 1}. ${step.text}${cited(step.findings)}`), "",
    `## ${t("findings")}`, ...list(review.findings, (f) => `### ${f.id}. ${f.title} (${word("direction", f.direction)}; ${word("evidence", f.evidence)})\n\`${f.at}\`: ${f.what}`
      + `${names("breaks", f.breaks)}${names("untested", f.untested)}\n${t("shown-by")}: ${f.shown_by}\n${t("fix")}: ${f.fix}\n`), "",
    `## ${t("ideas")}`, ...list(review.ideas, (idea) => `- ${idea.at ? `\`${idea.at}\`: ` : ""}${idea.title}: ${idea.text}`), "",
    ...(review.tradeoffs?.length ? [`## ${t("tradeoffs")}`, ...review.tradeoffs.map((x) => `- ${x.text} ${t("tradeoff.consequence")}: ${x.consequence} (${srcs(x.sources)})`), ""] : []),
    ...(review.checks?.length ? [`## ${t("checks")}`, t("checks-note"), ...review.checks.map((c, index) =>
      `${index + 1}. ${c.from ? `${t("from")}: ${c.from} ` : ""}${t("do")}: ${c.do.join("; ")} ${t("expect")}: ${c.expect}${c.requirements?.length ? ` (${t("requirement").toLowerCase()} ${c.requirements.join(", ")})` : ""}`), ""] : []),
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
    // The map is on the page; the printout, which the reviewer reads back, names the blocks that ask for something.
    `## ${t("map")}`, `${t("map-summary", blocks.length)} ${VERDICTS.map((v) => `${word("verdict", v)}: ${blocks.filter((b) => b.verdict === v).length}`).join("; ")}.`,
    `${t("purpose")}: ${PURPOSES.map((p) => `${t(`purpose.${p}`)} ${purpose.counts[p].blocks}`).join("; ")}. ${t("purpose.lines-note")}`,
    ...blocks.filter((b) => b.verdict !== "keep" || !b.serves.length).map((b) => `- \`${b.path}:${b.where}\`: ${b.does ? `${b.does} ` : ""}${b.serves.length ? `${t("serves")} ${b.serves.join(", ")}` : t("serves-nothing")}. ${capital(word("verdict", b.verdict))}${grounds(b)}.`),
    ...requirements.filter((r) => !r.blocks.length).map((r) => `- ${t("requirement")} ${r.id}: ${t("no-block")}.`), "",
    ...(review.challenges?.length ? [`## ${t("challenges")}`, ...review.challenges.map((c, index) =>
      `${index + 1}. ${t(`challenger.${c.from}`)}: ${c.point} ${capital(t(`outcome.${c.outcome}`))}: ${c.note}${c.at ? ` (\`${c.at}\`)` : ""}`), ""] : []),
    `## ${t("questions")}`, ...list(review.questions, questionText), "",
    `## ${t("coverage")}`,
    ...(review.coverageStructured ?? []).map((c) => `- ${coverageWord(c.kind)}: ${c.text}${c.revision ? ` @ ${c.revision}` : ""} (${srcs(c.sources)})`),
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
  } else if (["render", "check"].includes(command) && argument) {
    const bytes = fs.readFileSync(argument), review = JSON.parse(bytes.toString("utf8")), directory = path.dirname(path.resolve(argument));
    const { files, fault } = changeOf(review, directory), { errors, warnings = [], owner } = fault ? { errors: [fault], owner: new Map() } : check(review, files, directory);
    if (errors.length) {
      console.error(`The review does not match the diff; fix these ${errors.length} and check again:\n${errors.map((e) => `- ${e}`).join("\n")}`);
      process.exit(1);
    }
    // The record's identity is computed from its bytes, never stored in it; the page and the printout carry it.
    const model = { ...modelOf(review, files, owner, directory), recordSha: createHash("sha256").update(bytes).digest("hex") };
    for (const warning of warnings) console.error(`warning: ${warning}`);
    // One verdict over a large block is where a needless part hides: the check cannot see decisions, only size.
    for (const b of model.blocks.filter((b) => b.verdict === "keep" && b.weightLines.added + b.weightLines.removed >= 40))
      console.error(`warning: block ${b.id} (${b.path} ${b.where}) keeps ${b.weightLines.added + b.weightLines.removed} lines under one verdict; divide it, or be sure it is one decision`);
    for (const [ids, what] of [[model.unasked.unlinked, "serve no requirement"], [model.unasked.assumed, "serve only requirements to confirm"]])
      if (ids.length) console.error(`warning: kept blocks ${ids.join(", ")} ${what}; name what each serves, or make it a question or an idea for the owner`);
    for (const u of model.units.filter((u) => u.verdict === "keep" && u.blocks.some((b) => b.verdict !== "keep")))
      console.error(`warning: unit ${u.name} is kept, and its blocks ${u.blocks.filter((b) => b.verdict !== "keep").map((b) => b.id).join(", ")} are not; say what the unit's verdict leaves open`);
    if (command === "check") { console.log("Review data matches the diff."); process.exit(0); }
    const target = argument.replace(/(\.json)?$/, ".html");
    // One Shiki highlighter per render: the page receives ready spans and CSS, and the HTML loads nothing.
    const syntax = await createSyntax(files);
    fs.writeFileSync(target, page(review, files, model, { syntax }));
    console.log(`${markdown(review, model, labelsOf(review))}\n\n${labelsOf(review)("page")}: ${target}`);
  } else {
    console.error("usage: report.mjs scaffold <diff> <review.json> | report.mjs lines <diff | review.json> | report.mjs comparisons <review.json> [<base-root> <head-root>] | report.mjs check <review.json> | report.mjs render <review.json>");
    process.exit(2);
  }
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
