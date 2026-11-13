#!/usr/bin/env node
// A review written as data: checked against its diff, printed as the report, and drawn as a page.
//
//   node report.mjs lines <range>          print every changed line of `git diff <range>` with its address
//   node report.mjs check <review.json>    validate without writing HTML
//   node report.mjs render <review.json>   check the review; write <review>.html beside it and print the report
//   node report.mjs labels [en|ru]         print the report's own words, for a review to carry in its reader's language
//
// Run it in the repository under review; references/report-data.md tells the reviewer what to write.
// `render` refuses a review whose change map leaves a changed line out, puts one in two blocks, or names an id
// nothing defines, and lists every such fault: that every changed line belongs to one block is checked here,
// not taken on trust.

import fs from "node:fs";
import path from "node:path";
import { address, changedLines, diffOf } from "./diff.mjs";
import { CATALOGS, labelsOf, languageOf } from "./labels.mjs";
import { page } from "./page.mjs";
import { check, modelOf, mechanismCounts, weightCountsText, weightOverview } from "./review.mjs";

const cited = (ids) => ids?.length ? ` (${ids.join(", ")})` : "";

// The review in the shape SKILL.md gives the report.
function markdown(review, { blocks, requirements, units, target, mechanisms }, t) {
  const list = (items, line) => items?.length ? items.map(line) : [t("none")];
  const word = (kind, value) => t(`${kind}.${value}`), capital = (text) => text[0].toUpperCase() + text.slice(1);
  const state = (r) => [r.broken.length ? `${t("fails")}: ${r.broken.join(", ")}` : r.met ? `${t("met")}, ${word("evidence", r.met)}` : !r.not_checked && t("not-checked"),
    r.not_checked && `${t("not-checked")}: ${r.not_checked}`, r.untested.length && `${t("no-test")}: ${r.untested.join(", ")}`].filter(Boolean).join("; ");
  const unit = (u, status) => `- \`${u.name}${u.uses.length ? ` -> ${u.uses.join(", ")}` : ""}\`: ${u.jobs.join(", ")}. ${capital(status)}.`;
  const written = new Set(units.filter((u) => !u.existing).map((u) => u.name));
  const names = (label, ids) => ids?.length ? ` ${t(label)} ${ids.join(", ")}.` : "";
  return [
    `## ${t("change")}`, [review.change.goal, review.change.why].filter(Boolean).join(" "), ...review.change.parts.map((part) => `- ${part}`),
    `${t("sources")}: ${review.change.sources.join("; ")}`,
    `${t("requirements")}:`, ...requirements.map((r) => `${r.id}. ${r.text} (${word("source", r.source)}; ${state(r)})${r.doubt ? ` ${t("reconsider")}: ${r.doubt}` : ""}`), "",
    `## ${t("verdict")}`, review.verdict, `${t("now")}: ${review.now}`, `${t("target")}: ${review.target}`, `${t("recommendation")}: ${review.recommendation}`,
    ...(review.steps ?? []).map((step, index) => `${index + 1}. ${step.text}${cited(step.findings)}`), "",
    `## ${t("findings")}`, ...list(review.findings, (f) => `### ${f.id}. ${f.title} (${word("direction", f.direction)}; ${word("evidence", f.evidence)})\n\`${f.at}\`: ${f.what}`
      + `${names("breaks", f.breaks)}${names("untested", f.untested)}\n${t("shown-by")}: ${f.shown_by}\n${t("fix")}: ${f.fix}\n`), "",
    `## ${t("ideas")}`, ...list(review.ideas, (idea) => `- ${idea.at ? `\`${idea.at}\`: ` : ""}${idea.title}: ${idea.text}`), "",
    ...(review.checks?.length ? [`## ${t("checks")}`, t("checks-note"), ...review.checks.map((c, index) =>
      `${index + 1}. ${c.from ? `${t("from")}: ${c.from} ` : ""}${t("do")}: ${c.do.join("; ")} ${t("expect")}: ${c.expect}${c.requirements?.length ? ` (${t("requirement").toLowerCase()} ${c.requirements.join(", ")})` : ""}`), ""] : []),
    ...(review.screens?.length ? [`## ${t("screens")}`, ...review.screens.flatMap((s) => [
      `- ${s.name}: ${["mockup", "before", "after"].filter((shot) => s[shot]).map((shot) => t(shot).toLowerCase()).join(", ") || t("no-pictures")}.${s.match ? ` ${t("matches")}` : ""}`,
      ...(s.differences ?? []).map((d) => `  - ${d.what}${d.why ? ` ${t("reason")}: ${d.why}` : ""}${d.finding === undefined ? "" : ` (${d.finding})`}`),
      ...(s.missing ? [`  - ${t("not-compared")}: ${s.missing}`] : [])]), ""] : []),
    ...(review.mechanisms?.length ? [`## ${t("mechanisms")}`, mechanismCounts(review).map(([change, count]) => `${word("change", change)}: ${count}`).join("; "), ...mechanisms.flatMap((m) => [
      `### ${m.name} (${word("change", m.change)}; ${word("evidence", m.evidence)})`,
      `${t("units")}: ${(m.units ?? []).join(", ") || t("none")}${cited(m.findings)}`,
      `${t("weight")}:`,
      ...(() => { const rows = weightOverview(m.weight, t, languageOf(review)); return rows.length
        ? rows.map(row => `${t(`weight.category.${row.kind}`)}: ${row.text}`)
        : [t(m.weight ? "weight.unchanged" : "weight.unknown")]; })(),
      ...(m.weight?.shared.length ? [`${t("weight.exclusive")}: ${weightCountsText(m.weight.exclusive, t)}`] : []),
      ...(m.weight?.shared ?? []).map(s => `${t("weight.shared")} ${s.with.join(", ")}: ${weightCountsText({ [s.kind]: s }, t)} (B${s.block})`),
      ...(m.blocks?.length ? [`${t("weight.evidence")}: ${m.blocks.map(id => `B${id}`).join(", ")}`] : []),
      t("weight.note"),
      ...["purpose", "basis", "instead", "benefit", "cost", "decision"].filter((key) => m[key]).map((key) => `${t(key)}: ${m[key]}`), ""]) ] : []),
    `## ${t("structure")}`, ...list(units, (u) => unit(u, u.existing ? t("existing") : `${word("verdict", u.verdict)}${cited(u.findings)}`)),
    ...(target.length ? [`${t("target")}:`, ...target.map((u) => unit(u, t(u.existing ? "existing" : written.has(u.name) ? "from-change" : "to-write")))] : []), "",
    `## ${t("map")}`,
    ...blocks.map((b) => `- \`${b.path}:${b.where}\`: ${b.does} ${b.serves.length ? `${t("serves")} ${b.serves.join(", ")}` : t("serves-nothing")}. ${capital(word("verdict", b.verdict))}${cited(b.findings)}.`),
    ...requirements.filter((r) => !r.blocks.length).map((r) => `- ${t("requirement")} ${r.id}: ${t("no-block")}.`), "",
    `## ${t("questions")}`, ...list(review.questions, (q) => `- \`${q.at}\`: ${q.text}`), "",
    `## ${t("coverage")}`, review.coverage || t("none"),
  ].join("\n");
}

const [command, argument] = process.argv.slice(2);
try {
  if (command === "lines" && argument) {
    for (const file of diffOf(argument)) console.log([file.path, ...changedLines(file).map((l) => `  ${address(l).padEnd(6)} ${l.text}`)].join("\n"));
  } else if (["render", "check"].includes(command) && argument) {
    const review = JSON.parse(fs.readFileSync(argument, "utf8")), files = diffOf(review.range ?? "");
    const directory = path.dirname(path.resolve(argument)), { errors, owner } = check(review, files, directory);
    if (errors.length) {
      console.error(`The review does not match the diff; fix these ${errors.length} and check again:\n${errors.map((e) => `- ${e}`).join("\n")}`);
      process.exit(1);
    }
    if (command === "check") { console.log("Review data matches the diff."); process.exit(0); }
    const model = modelOf(review, files, owner, directory), target = argument.replace(/(\.json)?$/, ".html");
    fs.writeFileSync(target, page(review, files, model));
    console.log(`${markdown(review, model, labelsOf(review))}\n\n${labelsOf(review)("page")}: ${target}`);
  } else if (command === "labels") {
    const code = (argument ?? "en").toLowerCase().split("-")[0];
    const catalog = Object.hasOwn(CATALOGS, code) ? CATALOGS[code] : null;
    if (!catalog) throw new Error(`No built-in catalog for "${argument}"; use labels en as the translation template`);
    console.log(JSON.stringify(catalog, null, 2));
  } else {
    console.error("usage: report.mjs lines <range> | report.mjs check <review.json> | report.mjs render <review.json> | report.mjs labels [en|ru]");
    process.exit(2);
  }
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
