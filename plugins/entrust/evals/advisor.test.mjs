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

test("A0 the resource inventory identifies the host, uses Codex-native resources, and does not offer the unavailable Claude adapter",
  "driver status describes an external resource; the runtime identifies the current host and native model roster",
  () => says(
    /Identify the coordinator host from the runtime, then inventory the native models and limits it exposes/,
    /Codex: use native subagents and their actual model list; do not load the external \[Codex adapter\](?:\([^)]*\))? or call its status/,
    /Claude\/Fable is unavailable until a Claude adapter is exposed/,
    /if one appears, check it and propose Fable only when confirmed/,
    /Otherwise, propose Astra if the native model list includes it/,
    /Claude: load the Codex adapter and use its current status, model catalogue and launch protocol/,
    /Use Fable only when the user's composition or Codex status rules out Codex/,
    /Other or unclear host: use native resources only when exposed; check an external driver only when its adapter is available/,
    /Mark unobservable resources unknown/,
  ));

test("A1 the mode discovers and plans before running an independent advisor whose contribution is recorded",
  "the invocation authorizes resource discovery and a plan; the advisor starts only after approval of the model roster",
  () => says(
    /Checks available resources, proposes a model roster for approval, then runs one standing advisor/,
    /questions are independent of the coordinator's view/,
    /The mode is prompt only: no driver change, no new header field or flag/,
  ));

test("D1 resource discovery produces an approved plan that mandates each listed advisor turn",
  "the advisor invocation authorizes inventory and proposal, not launch; approval covers the listed turns, while new points or a changed model need approval again",
  () => {
    const said = says(
      /1\. Identify the coordinator host from the runtime, then inventory the native models and limits it exposes/,
      /2\. Show the checked resource roster and proposed plan before launch: advisor, route, model, planned decision points, expected turns and applicable capacity/,
      /The invocation authorizes discovery and planning only/,
      /Wait for explicit approval of the plan and model roster; launch only after approval/,
      /A route or roster change needs approval again/,
      /After approval, use one standing top-row advisor from the accepted plan, beginning before the first decision, composition included/,
      /The accepted plan authorizes its stated model and turns; a route or model change requires new approval/,
      /Consult at every material decision point named in the accepted plan/,
      /The plan assigns one advisor turn to each listed point; use every approved turn without asking again/,
      /Keep routine operational choices inline/,
      /A new point beyond the plan or a route\/model change requires an amended plan and approval/,
      /"No advisor" \(без советника\) ends the thread for the run; "ask the advisor" \(спроси советника\) starts it again/,
    );
    if (said !== true) return said;
    return true;
  });

test("D3 the external Codex prompt carries the selected model and five-field schema without an unsolicited effort line",
  "the Claude-to-Codex adapter validates a model and schema in its prompt; inherited effort stays with the selected model's configuration",
  () => {
    const said = says(/For a Claude-hosted external Codex advisor, use the selected model and the sibling's five-field schema in the first prompt/);
    if (said !== true) return said;
    const effort = /^\s+EFFORT:/m.exec(text);
    return !effort || `the page gives the advisor an effort: ${effort[0]}`;
  });

test("D4 the Claude-hosted external Codex prompt and its continuation register with the selected model, shipped schema and neutral task",
  "check the assembled neutral brief through the external launcher, then ensure a RESUME prompt keeps the same schema and reaches the next report path",
  () => {
    const block = /^((?: {4}[A-Z_]+: .*\n)+)/m.exec(text)?.[1];
    if (!block) return "the page shows no indented prompt block";
    const codex = fs.readFileSync(path.join(ROOT, "skills", "codex", "SKILL.md"), "utf8");
    const rel = /^\| `OUTPUT_SCHEMA:` \|[^|]*`\$\{CLAUDE_SKILL_DIR\}\/([^`]+five-fields[^`]*)`/m.exec(codex)?.[1];
    if (!rel) return "the codex page's OUTPUT_SCHEMA row names no five-field schema under ${CLAUDE_SKILL_DIR}";
    const schema = path.join(ROOT, "skills", "codex", rel);
    const filled = block.replace(/^ {4}/gm, "")
      .replace(/<selected model short name>/, "astra")
      .replace(/<the five-field schema file the sibling ships>/, schema)
      .replace(/^TASK: <[^>]*>$/m, "TASK: Which split best preserves the shared interface? Facts: two files use it. Constraint: keep ownership clear.");
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
    if (!/continue that same thread with `RESUME: <threadId>` above it, writing successive answers under `<run>\/<id>-2\/report\.json`, then `-3`/.test(flat)) problems.push("the page no longer names the continuation header and report paths");
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

test("D2 the advisor uses one continuing thread and counts active turns against the selected route's actual capacity",
  "native host and external adapter limits are route-specific; an idle advisor thread consumes no active turn",
  () => says(
    /Keep one thread for the run/,
    /continue it through the host's native mechanism or the chosen adapter/,
    /count its active turns against that route's reported limit/,
  ));

test("Q1 the advisor receives a neutral decision brief without the coordinator's provisional answer and is asked to reason independently",
  "showing the coordinator's decision can prime the advisor; the pre-question note keeps that decision for later comparison without putting it in the brief",
  () => {
    const said = says(
      /Before each question, record the coordinator's provisional decision in a private notes file under its temporary directory/,
      /Consult at every material decision point named in the accepted plan, such as the split before a fan-out, the composition, a verdict to adopt or a stall/,
      /Send a neutral brief containing the decision to be made, relevant facts and sources, uncertainty and constraints; present real alternatives evenly/,
      /The brief carries no preferred answer or evaluative framing/,
      /Ask one question per message/,
      /Its return has five fields: `status` \(done, partial or blocked\), `result`, `evidence`, `artifacts` and `open`/,
      /Request a recommendation with deciding reasons, one alternative and what evidence would change the recommendation/,
    );
    if (said !== true) return said;
    if (/without advice I would|my recommendation is|I think we should/i.test(text)) return "the page's task example includes the coordinator's view";
    return true;
  });

test("Q2 the advisor never implements, writes, judges its own advice or spawns, answers unknown when it cannot answer, and no sentence hands it one of those roles",
  "a top-row agent that implements is the tier table's \"never implementation\" broken; one that judges its own advice is self-grading with a title",
  () => {
    const prose = says(
      /never implements, never writes under the repository, never judges a result it advised on, and never spawns agents/,
      /returns `unknown` and names the missing check/,
    );
    if (prose !== true) return prose;
    for (const m of flat.matchAll(/[^.]*\b(advisor|it)\b[^.]*\b(may|can|should|will)\b[^.]*\b(implement|judge|spawn|write under)[^.]*\./gi))
      if (!/\bnever\b/.test(m[0])) return `a sentence hands the advisor a role it must not take: ${m[0].trim().slice(0, 120)}`;
    return true;
  });

test("Q3 the coordinator asks the advisor to list the premises its recommendation rests on, those in the message included, each checked or taken as given, and counts its agreement only on the checked ones",
  "an advisor asked whether a list was complete refuted the premise its question pointed at and kept another item in the wrong group its context had set, holding the file that showed where the item lives; agreement with an untested premise is not an independent check",
  () => says(
    /Ask it to list each premise behind its recommendation in `evidence`, marked checked at a source or taken as given/,
    /count agreement as independent only on checked premises/,
  ));

test("R1 every decision point is recorded before and after in a notes file the synthesis names, the synthesis names what the advice changed, and the page states no benefit until E3 runs",
  "the 2026-09-17 research found no source that measured a standing advisor and priced a continued thread at 1.23 times a fresh agent; a page that promised a benefit would be the claim the research refused to make; the coordinator cannot write under the data directory, so the notes live in its temporary directory",
  () => says(
    /Before each question, record the coordinator's provisional decision in a private notes file under its temporary directory/,
    /whose path the synthesis names/,
    /After each answer, write what changed and why beside the private pre-question decision/,
    /The synthesis names the decisions the advisor changed, their outcomes, and the advisor's turns and tokens beside the run's/,
    /Protocol E3 of the experiment skill measures a standing advisor against per-call advice and no advice/,
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
