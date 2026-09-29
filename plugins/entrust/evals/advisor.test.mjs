#!/usr/bin/env node
// Does skills/advisor/SKILL.md still say what the advisor mode was agreed to say?
//
//   node evals/advisor.test.mjs
//
// The mode is prompt only, so these cases pin its rules by the words that carry them, with a negative
// case where a sentence could quietly hand the advisor a role it must never take, and one case that
// registers the advisor's prompt as the page writes it. The page is the approved text; a pin that
// disagrees with it is a wrong pin.

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { ROOT, SCRIPTS, registry, runCases, summarize, tempDir } from "./lib/harness.mjs";

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
  "the mode is loaded on top of the codex page; a page that doubled is the advisor costing before it answers",
  () => {
    const problems = [];
    if (lines.length > 40) problems.push(`${lines.length} lines`);
    if (/^###/m.test(text)) problems.push("a third heading level");
    if (/^```/m.test(text)) problems.push("a fence");
    return problems.length === 0 || problems.join("; ");
  });

test("A0 the page loads codex through the Skill tool, and no sentence asks it to load orchestrate",
  "orchestrate is `disable-model-invocation`, so the Skill tool refuses to load it: on 2026-09-25 the advisor did not start because its first sentence asked for that load (E39)",
  () => {
    const problems = [];
    const asks = /\bload\b[^.;]*\borchestrate\b/i.exec(flat) ?? /Skill tool[^)]*entrust:orchestrate/.exec(flat);
    if (asks) problems.push(`a sentence asks to load orchestrate: ${asks[0].slice(0, 120)}`);
    const loads = [...flat.matchAll(/Skill tool, `entrust:([a-z-]+)`/g)].map((m) => m[1]);
    if (loads.join() !== "codex") problems.push(`the Skill-tool loads the page asks for: ${loads.join(", ") || "none"}`);
    const prose = says("Load [codex](../codex/SKILL.md) now (Skill tool, `entrust:codex`)");
    if (prose !== true) problems.push(prose);
    return problems.length === 0 || problems.join("; ");
  });

test("A1 the mode adds one thread of the other family to whatever run it is invoked in, needs no other page, and is prompt only",
  "the owner, 2026-09-25: the advisor does not pull orchestrate; it adds one thread of the other model family to whatever run it is invoked in (E39)",
  () => says(
    /Adds a standing advisor to the run it is invoked in/,
    /adds one standing thread of the other model family to whatever run it is invoked in, and needs no other page/,
    /The mode is prompt only: no driver change, no new header field or flag/,
  ));

test("D1 the advisor is a top-row agent of the other family, consulted from the first decision on the invocation's word, named in the workers' plan with its turns, and ended or restarted by the user's words",
  "the value the sources claim for an advisor is a different lineage (Amp's oracle). #15 F1 and #16: the page chose the advisor by the composition it was to advise on and stopped for \"go\" before read-only advice the invocation had already asked for, so the advisor never advised the first decision; a stop stays for what the invocation did not grant, and the user can end and restart the thread in words",
  () => {
    const said = says(
      /One top-row agent from the other model family than your own: Astra under a Claude coordinator, and Fable only when the user's composition words rule Codex out/,
      /Your user's invocation of this command is the word for its turns: consult it before the first decision, the composition included, with no plan stop of its own/,
      /The plan the run shows for its workers names it as the advisor, with its expected turns/,
      /a stop is for authority the invocation did not grant — the workers' plan, an edit, a commit, a publication — under the rules of the run it joins/,
      /"No advisor" \(без советника\) from the user ends the thread for the run, and "ask the advisor" \(спроси советника\) starts it again/,
    );
    if (said !== true) return said;
    // The negative half: the two sentences the fix removed.
    if (/chosen by the agreed composition/.test(flat)) return "the advisor is chosen by the composition it advises on again";
    if (/stop until "go"/.test(flat)) return "the page stops for \"go\" before the first advice again";
    return true;
  });

test("D3 the advisor's prompt carries its model and the five-field schema, and no effort line",
  "#15 F12c: the page loads codex alone, so orchestrate's top-row rule (no EFFORT:) never reaches it and the codex row invites one, and an advisor once answered in 111 lines of prose with no schema",
  () => {
    const said = says(
      /Its prompt carries `MODEL: astra` \(or the Fable agent's `model: "fable"` tag\), an `OUTPUT_SCHEMA:` line naming the five-field schema file the sibling ships, and no `EFFORT:` line: a top-row agent inherits the configured effort/,
    );
    if (said !== true) return said;
    const effort = /EFFORT: ?(none|minimal|low|medium|high|xhigh|max|ultra)\b/.exec(text);
    return !effort || `the page gives the advisor an effort: ${effort[0]}`;
  });

test("D4 the advisor's prompt, as the page writes it, registers through the launcher with Astra, the shipped five-field schema and no effort, and a continuation's header (RESUME: above the same prompt, under the next report path) registers the same way",
  "#15 F12c and the judge (06, row F12c): check the assembled brief, not the page's words; the prompt is filled the way a coordinator fills it, the schema path from the codex page's OUTPUT_SCHEMA row, and the launcher's --new runs the driver's own check on it. This case checks the header shape of a RESUME: prompt only: that the continuation reaches the thread of the first report is the live gate's advisor case, since offline there is no first turn",
  () => {
    const block = /^((?: {4}[A-Z_]+: .*\n)+)/m.exec(text)?.[1];
    if (!block) return "the page shows no indented prompt block";
    const codex = fs.readFileSync(path.join(ROOT, "skills", "codex", "SKILL.md"), "utf8");
    const rel = /^\| `OUTPUT_SCHEMA:` \|[^|]*`\$\{CLAUDE_SKILL_DIR\}\/([^`]+five-fields[^`]*)`/m.exec(codex)?.[1];
    if (!rel) return "the codex page's OUTPUT_SCHEMA row names no five-field schema under ${CLAUDE_SKILL_DIR}";
    const schema = path.join(ROOT, "skills", "codex", rel);
    const filled = block.replace(/^ {4}/gm, "")
      .replace(/<the five-field schema file the sibling ships>/, schema)
      .replace(/^TASK: <[^>]*>$/m, "TASK: the split before the fan-out; without advice I would cut by file; the evidence is two files sharing one interface.");
    if (/<[^>]*>/.test(filled)) return `a placeholder the page never says how to fill: ${/<[^>]*>/.exec(filled)[0]}`;
    const problems = [];
    const dir = tempDir("advisor-prompt.");
    const register = (id, prompt) => {
      const report = path.join(dir, id, "report.json");
      // The temporary directory is the state directory too: --new puts every agent's mailbox inside it.
      const r = spawnSync(process.execPath, [path.join(SCRIPTS, "agent-run.mjs"), "--new", "--report-file", report],
        { input: prompt, encoding: "utf8", env: { ...process.env, ENTRUST_STATE_DIR: dir } });
      const at = /^PROMPT=(.+)$/m.exec(r.stdout)?.[1];
      if (r.status !== 0 || !at) { problems.push(`${id}: --new exited ${r.status}: ${(r.stdout + r.stderr).trim()}`); return ""; }
      return fs.readFileSync(at, "utf8");
    };
    if (!/each under the next report path, the agent's id with `-2`, then `-3`, added \(`<run>\/<id>-<n>\/report\.json`\)/.test(flat)) problems.push("the page no longer names the continuation's report path");
    if (/report path of its own/.test(flat)) problems.push("the page still sends a continuation to a report path of its own");
    const first = register("advisor", filled);
    const next = register("advisor-2", `RESUME: last\n${filled}`);
    for (const [id, p] of [["advisor", first], ["advisor-2", next]]) {
      if (!p) continue;
      if (!/^MODEL: astra$/m.test(p)) problems.push(`${id}: no MODEL: astra line`);
      if (/^EFFORT:/m.test(p)) problems.push(`${id}: carries an EFFORT: line`);
      if (p.match(/^OUTPUT_SCHEMA: (.+)$/m)?.[1] !== schema) problems.push(`${id}: OUTPUT_SCHEMA is not ${schema}`);
    }
    if (next && !/^RESUME: \S+$/m.test(next)) problems.push("the continuation carries no RESUME: line");
    try {
      const s = JSON.parse(fs.readFileSync(schema, "utf8"));
      const five = ["status", "result", "evidence", "artifacts", "open"];
      if (JSON.stringify(s.required) !== JSON.stringify(five) || s.additionalProperties !== false) problems.push("the shipped schema is not the strict five fields");
    } catch (e) { problems.push(`the shipped schema does not parse: ${e.message}`); }
    fs.rmSync(dir, { recursive: true, force: true });
    return problems.length === 0 || problems.join("; ");
  });

test("D2 the advisor is one thread kept for the run, holds a slot only while a turn of its runs, and the slot is one of six alive and its family's only top-row agent",
  "the owner's reading of the pool on 2026-09-17: the caps count turns in progress, and an idle thread uses no slot; the caps are orchestrate's, stated here because the page loads codex alone",
  () => says(
    /one thread kept for the run/,
    /holds a slot only while (a turn of its runs|one of its turns runs); between questions it is not alive/,
    /That slot is one of six alive at a time, and the only Astra or the only Fable among them/,
  ));

test("Q1 the decision points are named, one question per message carries the coordinator's own decision, and the return is a recommendation with reasons, an alternative and what would change its mind",
  "an advisor asked open questions is a second coordinator; one asked to react to a decision already formed is measurable against that decision",
  () => says(
    /the split before a fan-out, the composition, a verdict you are about to adopt, a stall, and any point the plan names/,
    /One question per message, carrying the decision you would take without advice and the evidence in a few lines/,
    /Its return is five fields: `status` \(done, partial or blocked\), `result`, `evidence`, `artifacts` and `open`/,
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

test("Q3 the coordinator asks the advisor to list the premises its recommendation rests on, those in the message included, each checked or taken as given, and counts its agreement only on the checked ones",
  "an advisor asked whether a list was complete refuted the premise its question pointed at and kept another item in the wrong group its context had set, holding the file that showed where the item lives; agreement with an untested premise is not an independent check",
  () => says(
    /Ask it to list in `evidence` the premises the recommendation rests on, including those in your message, each marked checked at a source or taken as given/,
    /Its agreement counts as independent only on the premises it checked/,
  ));

test("R1 every decision point is recorded before and after in a notes file the synthesis names, the synthesis names what the advice changed, and the page states no benefit until E3 runs",
  "the 2026-09-17 research found no source that measured a standing advisor and priced a continued thread at 1.23 times a fresh agent; a page that promised a benefit would be the claim the research refused to make; the coordinator cannot write under the data directory, so the notes live in its temporary directory",
  () => says(
    /Before each question, write the decision you would take without advice into a notes file under your temporary directory, whose path the synthesis names; after the answer, write what changed and why/,
    /The synthesis names the decisions the advisor changed, with the outcome of each, and the advisor's turns and tokens beside the run's/,
    /Protocol E3 of the experiment skill measures a standing advisor against per-call advice and against no advice/,
    /this page states no benefit/,
  ));

test("every relative link resolves, inside this repository, to a file and to a heading that exists",
  "the page delegates its whole mechanism to the codex page by link; a moved file turns the mode into a 404 only a reader notices",
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
