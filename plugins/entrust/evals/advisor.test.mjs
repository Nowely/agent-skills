#!/usr/bin/env node
// Does skills/advisor/SKILL.md still say what the advisor mode was agreed to say?
//
//   node evals/advisor.test.mjs
//
// The mode is prompt only, so these cases pin its rules by the words that carry them, with a negative
// case where a sentence could quietly hand the advisor a role it must never take. The page is the
// approved text; a pin that disagrees with it is a wrong pin.

import fs from "node:fs";
import path from "node:path";
import { ROOT, registry, runCases, summarize } from "./lib/harness.mjs";

const { cases: CASES, test } = registry();
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");

const PAGE = "skills/advisor/SKILL.md";
const text = read(PAGE);
const lines = text.replace(/\n+$/, "").split("\n");
const front = text.split("---")[1] ?? "";
const flat = text.replace(/\s+/g, " ");

const says = (...res) => {
  const missing = res.filter((r) => !(r instanceof RegExp ? r.test(flat) : flat.includes(r)));
  return missing.length === 0 || `the page no longer says: ${missing.map(String).join(" | ")}`;
};

test("the page was read (every case below is sound)",
  "a page that shrank to a stub would pass every negative check; the floor says the file is the page",
  () => lines.length > 15 || `read ${lines.length} lines out of ${PAGE}`);

test("the frontmatter names the mode, forbids model invocation, and carries a version",
  "the owner asked for the advisor by a separate command; a skill the model could invoke would add a standing top-row thread to runs nobody asked it for",
  () => {
    const problems = [];
    for (const re of [/^name: advisor$/m, /^disable-model-invocation: true$/m, /^license: MIT$/m, /^  version: "\d+\.\d+\.\d+"$/m])
      if (!re.test(front)) problems.push(`frontmatter lacks ${re}`);
    return problems.length === 0 || problems.join("; ");
  });

test("the page stays inside its budget: 40 lines, one heading level, no fence",
  "the mode is loaded on top of two pages; a page that doubled is the advisor costing before it answers",
  () => {
    const problems = [];
    if (lines.length > 40) problems.push(`${lines.length} lines`);
    if (/^###/m.test(text)) problems.push("a third heading level");
    if (/^```/m.test(text)) problems.push("a fence");
    return problems.length === 0 || problems.join("; ");
  });

test("A1 the orchestrate page is loaded first, the mode adds one thread and is prompt only",
  "the advisor lives inside an orchestrated run; a page that re-stated the pool or the rights would drift from the page that owns them",
  () => says(
    "Load [orchestrate](../orchestrate/SKILL.md) now",
    /adds one standing thread to the run it is invoked for and re-cuts nothing else/,
    /The mode is prompt only: no driver change, no new header field or flag/,
  ));

test("D1 the advisor is a top-row agent of the other family by the agreed composition, named in the plan with its turns",
  "the value the sources claim for an advisor is a different lineage (Amp's oracle); one the coordinator picks on the fly is a thread the plan never priced",
  () => says(
    /One top-row agent, chosen by the agreed composition, from the other model family than your own/,
    /named in the plan as the advisor, with its expected turns, before "go"/,
  ));

test("D2 the advisor is one thread kept for the run and holds a slot only while a turn of its runs",
  "the owner's reading of the pool on 2026-09-17: the caps count turns in progress, and an idle thread uses no slot",
  () => says(
    /one thread kept for the run/,
    /holds a slot only while (a turn of its runs|one of its turns runs); between questions it is not alive/,
  ));

test("Q1 the decision points are named, one question per message carries the coordinator's own decision, and the return is a recommendation with reasons, an alternative and what would change its mind",
  "an advisor asked open questions is a second coordinator; one asked to react to a decision already formed is measurable against that decision",
  () => says(
    /the split before a fan-out, the composition, a verdict you are about to adopt, a stall, and any point the plan names/,
    /One question per message, carrying the decision you would take without advice and the evidence in a few lines/,
    /a recommendation with the reasons that decide it, one alternative, and what it would need to see to change its mind/,
  ));

test("Q2 the advisor never implements, writes, judges its own advice or spawns, answers unknown when it cannot answer, and no sentence hands it one of those roles",
  "a top-row agent that implements is the tier table's \"never implementation\" broken; one that judges its own advice is self-grading with a title",
  () => {
    const prose = says(
      /never implements, never writes under the repository, never judges a result it advised on, and never spawns agents/,
      /returns `unknown` with the missing check named/,
    );
    if (prose !== true) return prose;
    for (const m of flat.matchAll(/[^.]*\b(advisor|it)\b[^.]*\b(may|can|should|will)\b[^.]*\b(implement|judge|spawn|write under)[^.]*\./gi))
      if (!/\bnever\b/.test(m[0])) return `a sentence hands the advisor a role it must not take: ${m[0].trim().slice(0, 120)}`;
    return true;
  });

test("R1 every decision point is recorded before and after in a notes file the synthesis names, the synthesis names what the advice changed, and the page states no benefit until E3 runs",
  "the 2026-09-17 research found no source that measured a standing advisor and priced a continued thread at 1.23 times a fresh agent; a page that promised a benefit would be the claim the research refused to make; the coordinator cannot write under the data directory, so the notes live in its temporary directory",
  () => says(
    /Before each question, write the decision you would take without advice into a notes file under your temporary directory, whose path the synthesis names; after the answer, write what changed and why/,
    /The synthesis names the decisions the advisor changed, with the outcome of each, and the advisor's turns and tokens beside the run's/,
    /Protocol E3 of the experiment skill measures a standing advisor against per-call advice and against no advice/,
    /this page states no benefit/,
  ));

test("every relative link resolves, inside this repository, to a file and to a heading that exists",
  "the page delegates its whole mechanism to the orchestrate page by link; a moved file turns the mode into a 404 only a reader notices",
  () => {
    const dir = path.dirname(path.join(ROOT, PAGE));
    const problems = [];
    const slug = (h) => h.toLowerCase().replace(/[^a-z0-9 -]/g, "").trim().replace(/ +/g, "-");
    for (const [, target] of text.matchAll(/\[[^\]]*\]\(([^)\s]+)\)/g)) {
      if (/^[a-z]+:/.test(target)) continue;
      const [rel, anchor] = target.split("#");
      const abs = path.resolve(dir, rel);
      if (!abs.startsWith(ROOT + path.sep)) { problems.push(`${target} leaves the repository`); continue; }
      if (!fs.existsSync(abs)) { problems.push(`${target} resolves to nothing: ${abs}`); continue; }
      if (!anchor) continue;
      const headings = [...fs.readFileSync(abs, "utf8").matchAll(/^## (.+)$/gm)].map((m) => slug(m[1].trim()));
      if (!headings.includes(anchor)) problems.push(`${target}: no "## " heading slugs to #${anchor}`);
    }
    return problems.length === 0 || problems.join("; ");
  });

process.exit(summarize(await runCases(CASES), CASES.length));
