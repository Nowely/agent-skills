#!/usr/bin/env node
// A review written as data: checked against its diff, printed as the report, and drawn as a page.
//
//   node report.mjs lines <range>          print every changed line of `git diff <range>` with its address
//   node report.mjs render <review.json>   check the review; write <review>.html beside it and print the report
//
// Run it in the repository under review; references/interactive-report.md tells the reviewer what to write.
// `render` refuses a review whose change map leaves a changed line out, puts one in two blocks, or names an id
// nothing defines, and lists every such fault: that every changed line belongs to one block is checked here,
// not taken on trust.

import fs from "node:fs";
import { address, changedLines, diffOf } from "./diff.mjs";
import { page } from "./page.mjs";
import { check, modelOf } from "./review.mjs";

const capital = (word) => word[0].toUpperCase() + word.slice(1);
const cited = (ids) => ids.length ? ` (${ids.join(", ")})` : "";

// The review in the shape SKILL.md gives the report.
function markdown(review, { blocks, requirements, units, target }) {
  const list = (items, line) => items?.length ? items.map(line) : ["none"];
  const unit = (u, state) => `- \`${u.name}${u.uses.length ? ` -> ${u.uses.join(", ")}` : ""}\`: ${u.jobs.join(", ")}. ${state}.`;
  const written = new Set(units.filter((u) => !u.existing).map((u) => u.name));
  return [
    "## Change", [review.change.goal, review.change.why].filter(Boolean).join(" "), ...review.change.parts.map((part) => `- ${part}`),
    `Sources: ${review.change.sources.join("; ")}`, "",
    "## Verdict", review.verdict, `Target: ${review.target}`, `Recommendation: ${review.recommendation}`, "",
    "## Findings", ...list(review.findings, (f) => `### ${f.id}. ${f.title} (${f.direction}; ${f.evidence})\n\`${f.at}\`: ${f.what}`
      + `${f.breaks?.length ? ` Breaks requirement ${f.breaks.join(", ")}.` : ""}\nFix: ${f.fix}\n`), "",
    "## Ideas", ...list(review.ideas, (idea) => `- ${idea.at ? `\`${idea.at}\`: ` : ""}${idea.title}: ${idea.text}`), "",
    "## Structure", ...list(units, (u) => unit(u, u.existing ? "Existing" : `${capital(u.verdict)}${cited(u.findings)}`)),
    ...(target.length ? ["Target:", ...target.map((u) => unit(u, u.existing ? "Existing" : written.has(u.name) ? "From the change" : "To write"))] : []), "",
    "## Change map",
    ...blocks.map((b) => `- \`${b.path}:${b.where}\`: ${b.does} Serves ${b.serves.join(", ") || "nothing"}. ${capital(b.verdict)}${cited(b.findings)}.`),
    ...requirements.filter((r) => !r.blocks.length).map((r) => `- No block serves requirement ${r.id}: ${r.text}`), "",
    "## Questions and oddities", ...list(review.questions, (q) => `- \`${q.at}\`: ${q.text}`), "",
    "## Coverage", review.coverage || "none",
  ].join("\n");
}

const [command, argument] = process.argv.slice(2);
try {
  if (command === "lines" && argument) {
    for (const file of diffOf(argument)) console.log([file.path, ...changedLines(file).map((l) => `  ${address(l).padEnd(6)} ${l.text}`)].join("\n"));
  } else if (command === "render" && argument) {
    const review = JSON.parse(fs.readFileSync(argument, "utf8")), files = diffOf(review.range ?? "");
    const { errors, owner } = check(review, files);
    if (errors.length) {
      console.error(`The review does not match the diff; fix these ${errors.length} and render again:\n${errors.map((e) => `- ${e}`).join("\n")}`);
      process.exit(1);
    }
    const model = modelOf(review, files, owner), target = argument.replace(/(\.json)?$/, ".html");
    fs.writeFileSync(target, page(review, files, model));
    console.log(`${markdown(review, model)}\n\nInteractive report: ${target}`);
  } else {
    console.error("usage: report.mjs lines <range> | report.mjs render <review.json>");
    process.exit(2);
  }
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
