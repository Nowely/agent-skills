#!/usr/bin/env node
// A review written as data: checked against its diff, printed as the report, and drawn as a page.
//
//   node report.mjs scaffold <range> <review.json>   write the record's mechanical part: one block per run of changed lines
//   node report.mjs lines <range>          print every changed line of `git diff <range>` with its address
//   node report.mjs check <review.json>    validate without writing HTML
//   node report.mjs render <review.json>   check the review; write <review>.html beside it and print the report
//   node report.mjs labels [en|ru]         print the report's own words, for a review to carry in its reader's language
//
// Run it in the repository under review; references/report-data.md tells the reviewer what to write.
// `render` refuses a review whose change map leaves a changed line out, puts one in two blocks, or names an id
// nothing defines, and lists every such fault: that every changed line belongs to one block is checked here,
// not taken on trust.

import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { address, blank, changedLines, diffOf, diffText, numberOf, parseDiff } from "./diff.mjs";
import { CATALOGS, labelsOf, languageOf } from "./labels.mjs";
import { page } from "./page.mjs";
import { check, compact, modelOf, mechanismCounts, weightCountsText, weightOverview } from "./review.mjs";

const cited = (ids) => ids?.length ? ` (${ids.join(", ")})` : "";
// What a block or unit rests on: its findings, or for a question the questions it waits on.
const grounds = (item) => cited(item.verdict === "question" ? item.questions.map((n) => `Q${n}`) : item.findings);

// The review in the shape SKILL.md gives the report.
function markdown(review, { blocks, requirements, units, target, mechanisms, scenarios }, t) {
  const list = (items, line) => items?.length ? items.map(line) : [t("none")];
  const word = (kind, value) => t(`${kind}.${value}`), capital = (text) => text[0].toUpperCase() + text.slice(1);
  const state = (r) => [r.broken.length ? `${t("fails")}: ${r.broken.join(", ")}` : r.met ? `${t("met")}, ${word("evidence", r.met)}` : !r.not_checked && t("not-checked"),
    r.not_checked && `${t("not-checked")}: ${r.not_checked}`, r.untested.length && `${t("no-test")}: ${r.untested.join(", ")}`].filter(Boolean).join("; ");
  const unit = (u, status) => `- \`${u.name}${u.uses.length ? ` -> ${u.uses.join(", ")}` : ""}\`: ${u.jobs.join(", ")}. ${capital(status)}.${u.reason ? ` ${t("reason")}: ${u.reason}` : ""}`;
  const side = (s) => s ? `${t("edit")}: ${s.edit.join("; ")}. ${t("read")}: ${(s.read ?? []).join("; ") || t("nothing")}.` : t("as-now");
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
    `## ${t("structure")}`, ...list(units, (u) => unit(u, u.existing ? t("existing") : `${word("verdict", u.verdict)}${grounds(u)}`)),
    ...(target.length ? [`${t("target")}:`, ...target.map((u) => unit(u, t(u.existing ? "existing" : written.has(u.name) ? "from-change" : "to-write")))] : []), "",
    ...(scenarios.length ? [`## ${t("scenarios")}`, t("scenarios-note"), ...scenarios.map((s) => `${s.id}. ${s.change}${s.requirements.length ? ` (${t("requirement").toLowerCase()} ${s.requirements.join(", ")})` : ""}`
      + `\n   ${t("as-written")}: ${side(s.now)}\n   ${t("target")}: ${side(s.target)}${s.findings.length ? `\n   ${t("findings")}: ${s.findings.join(", ")}` : ""}`), ""] : []),
    `## ${t("map")}`,
    ...blocks.map((b) => `- \`${b.path}:${b.where}\`: ${b.does} ${b.serves.length ? `${t("serves")} ${b.serves.join(", ")}` : t("serves-nothing")}. ${capital(word("verdict", b.verdict))}${grounds(b)}.`),
    ...requirements.filter((r) => !r.blocks.length).map((r) => `- ${t("requirement")} ${r.id}: ${t("no-block")}.`), "",
    ...(review.challenges?.length ? [`## ${t("challenges")}`, ...review.challenges.map((c, index) =>
      `${index + 1}. ${t(`challenger.${c.from}`)}: ${c.point} ${capital(t(`outcome.${c.outcome}`))}: ${c.note}${c.at ? ` (\`${c.at}\`)` : ""}`), ""] : []),
    `## ${t("questions")}`, ...list(review.questions, (q, index) => `- Q${index + 1} \`${q.at}\`: ${q.text}`), "",
    `## ${t("coverage")}`, review.coverage || t("none"),
  ].join("\n");
}

// What a script can know of a review before anyone reads the code: the diff's identity, saved beside the record, and
// one block per run of changed lines with nothing but context between, its lines already numbered. The reviewer
// writes the meaning: what each block does, what it serves and its verdict, and divides a block that holds two
// decisions. Every field left empty is a fault `check` names.
// Uncommitted work as a commit of its own, new files included, made through a temporary index so the user's index
// and working tree stay as they are. The commit belongs to no branch; the saved diff is the copy that lasts.
function snapshot(base) {
  const index = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "review-index-")), "index");
  const env = { ...process.env, GIT_INDEX_FILE: index, GIT_AUTHOR_NAME: "review", GIT_AUTHOR_EMAIL: "review@example.invalid",
    GIT_COMMITTER_NAME: "review", GIT_COMMITTER_EMAIL: "review@example.invalid" };
  const git = (...args) => execFileSync("git", args, { encoding: "utf8", env }).trim();
  try {
    git("read-tree", "HEAD");
    git("add", "--all");
    return git("commit-tree", git("write-tree"), "-p", base, "-m", "The working tree under review");
  } finally { fs.rmSync(path.dirname(index), { recursive: true, force: true }); }
}

function scaffold(asked, target) {
  const saved = target.replace(/(\.json)?$/, ".diff");
  for (const file of [target, saved]) if (fs.existsSync(file)) throw new Error(`${file} exists; scaffold writes a new record and never replaces one`);
  const commit = (ref) => { try { return execFileSync("git", ["rev-parse", "--verify", "--quiet", `${ref}^{commit}`], { encoding: "utf8" }).trim(); } catch { return null; } };
  const known = (ref) => commit(ref) ?? (() => { throw new Error(`"${ref}" is not a commit of this repository`); })();
  // The range is pinned to commits, so the record names the same diff after the branch moves; a range with no ".."
  // compares a commit with the working tree, recorded as a commit of its own.
  const [from, to] = asked.includes("...") ? asked.split("...") : asked.includes("..") ? asked.split("..") : [asked, null];
  const head = to === null ? snapshot(known(from)) : known(to || "HEAD");
  const base = asked.includes("...") ? execFileSync("git", ["merge-base", known(from || "HEAD"), head], { encoding: "utf8" }).trim() : known(from || "HEAD");
  const range = `${base}..${head}`;
  const text = diffText(range), files = parseDiff(text), digest = createHash("sha256").update(text).digest("hex");
  const blocks = files.flatMap((file) => file.hunks.flatMap((hunk) => {
    const runs = [[]];
    // A run ends at unchanged context, and at a declaration: a line at the margin after a blank changed line.
    for (const line of hunk) {
      const run = runs.at(-1), last = run.at(-1);
      if (line.kind === "ctx") { if (run.length) runs.push([]); continue; }
      if (last && blank(last) && !blank(line) && /^\S/.test(line.text)) runs.push([line]); else run.push(line);
    }
    return runs.filter((run) => run.some((line) => !blank(line))).map((run) => {
      const of = (kind) => compact(run.filter((l) => l.kind === kind).map(numberOf));
      return { path: file.path, ...(of("add") ? { added: of("add") } : {}), ...(of("del") ? { removed: of("del") } : {}), does: "", serves: [], verdict: "" };
    });
  }));
  fs.mkdirSync(path.dirname(path.resolve(target)), { recursive: true });
  fs.writeFileSync(saved, text);
  const review = { title: "", language: "en", range, diff: { file: path.basename(saved), sha256: digest },
    change: { goal: "", parts: [], sources: [`asked as ${asked}`, `base ${base}`, `head ${head}${to === null ? `, a snapshot of the working tree over ${from}` : ""}`] },
    verdict: "", now: "", target: "", recommendation: "", requirements: [], findings: [], units: [], mechanisms: [], blocks, challenges: [], coverage: "" };
  fs.writeFileSync(target, `${JSON.stringify(review, null, 2)}\n`);
  return { blocks: blocks.length, files: files.length, saved };
}

// The diff a record judges: the copy saved beside it when it names one, checked against its digest, else `git diff`
// of its range. A saved copy keeps the record whole after the branch moves or a snapshot is collected.
function changeOf(review, directory) {
  if (review.diff === undefined) return { files: diffOf(review.range ?? "") };
  const file = path.resolve(directory, String(review.diff?.file ?? ""));
  if (!review.diff?.file || !fs.existsSync(file)) return { files: [], fault: `the saved diff "${review.diff?.file ?? ""}" is not beside the record` };
  const text = fs.readFileSync(file, "utf8");
  if (createHash("sha256").update(text).digest("hex") !== review.diff.sha256)
    return { files: [], fault: `the saved diff "${review.diff.file}" is not the one this record was scaffolded from; scaffold a new record for another change` };
  return { files: parseDiff(text) };
}

const [command, argument] = process.argv.slice(2);
try {
  if (command === "scaffold" && argument && process.argv[4]) {
    const made = scaffold(argument, process.argv[4]);
    console.log(`${process.argv[4]}: ${made.blocks} blocks over ${made.files} files; the diff is saved as ${made.saved}. Fill in what each block does, serves and its verdict, divide a block that holds two decisions, then run check.`);
  } else if (command === "lines" && argument) {
    for (const file of diffOf(argument)) console.log([file.path, ...changedLines(file).map((l) => `  ${address(l).padEnd(6)} ${l.text}`)].join("\n"));
  } else if (["render", "check"].includes(command) && argument) {
    const review = JSON.parse(fs.readFileSync(argument, "utf8")), directory = path.dirname(path.resolve(argument));
    const { files, fault } = changeOf(review, directory), { errors, owner } = fault ? { errors: [fault], owner: new Map() } : check(review, files, directory);
    if (errors.length) {
      console.error(`The review does not match the diff; fix these ${errors.length} and check again:\n${errors.map((e) => `- ${e}`).join("\n")}`);
      process.exit(1);
    }
    const model = modelOf(review, files, owner, directory);
    // One verdict over a large block is where a needless part hides: the check cannot see decisions, only size.
    for (const b of model.blocks.filter((b) => b.verdict === "keep" && b.weightLines.added + b.weightLines.removed >= 40))
      console.error(`warning: block ${b.id} (${b.path} ${b.where}) keeps ${b.weightLines.added + b.weightLines.removed} lines under one verdict; divide it, or be sure it is one decision`);
    // Code kept for no requirement, or only for assumed ones, is where a convenience of the author's stays unasked.
    const kept = model.blocks.filter((b) => b.verdict === "keep"), assumed = (b) => b.serves.length && b.serves.every((id) => review.requirements.find((r) => r.id === id)?.source === "assumption");
    for (const [blocks, what] of [[kept.filter((b) => !b.serves.length), "serve no requirement"], [kept.filter(assumed), "serve only assumed requirements"]])
      if (blocks.length) console.error(`warning: kept blocks ${blocks.map((b) => b.id).join(", ")} ${what}; name what each serves, or make it a question or an idea for the owner`);
    if (command === "check") { console.log("Review data matches the diff."); process.exit(0); }
    const target = argument.replace(/(\.json)?$/, ".html");
    fs.writeFileSync(target, page(review, files, model));
    console.log(`${markdown(review, model, labelsOf(review))}\n\n${labelsOf(review)("page")}: ${target}`);
  } else if (command === "labels") {
    const code = (argument ?? "en").toLowerCase().split("-")[0];
    const catalog = Object.hasOwn(CATALOGS, code) ? CATALOGS[code] : null;
    if (!catalog) throw new Error(`No built-in catalog for "${argument}"; use labels en as the translation template`);
    console.log(JSON.stringify(catalog, null, 2));
  } else {
    console.error("usage: report.mjs scaffold <range> <review.json> | report.mjs lines <range> | report.mjs check <review.json> | report.mjs render <review.json> | report.mjs labels [en|ru]");
    process.exit(2);
  }
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
