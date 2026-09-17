#!/usr/bin/env node
// Does skills/orchestrate/SKILL.md still say what the mode was agreed to say?
//
//   node evals/orchestrate.test.mjs
//
// The orchestrate mode is prompt only, so these cases pin its decisions as sentences, rows and template
// lines. Prose is whitespace-collapsed to allow rewrapping; rows and templates are anchored to preserve
// the layout an agent copies.
//
// The page is the approved text. A pin that disagrees with it is a wrong pin.

import fs from "node:fs";
import path from "node:path";
import { ROOT, registry, runCases, summarize } from "./lib/harness.mjs";

const { cases: CASES, test } = registry();
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");

const PAGE = "skills/orchestrate/SKILL.md";
const text = read(PAGE);
const lines = text.replace(/\n+$/, "").split("\n");
const front = text.split("---")[1] ?? "";
// Prose wraps at whatever column the sentence lands on, so every prose pin reads this and never the raw
// text: a paragraph re-flowed by one word is not a lost decision.
const flat = text.replace(/\s+/g, " ");

const says = (...phrases) => {
  const missing = phrases.filter((p) => !flat.includes(p));
  return missing.length === 0 || `the page no longer says: ${missing.map((p) => JSON.stringify(p)).join(" | ")}`;
};
const shows = (...res) => {
  const missing = res.filter((r) => !r.test(text));
  return missing.length === 0 || `no line matches: ${missing.map(String).join(" | ")}`;
};

test("the page was read (every case below is sound)",
  "every case here searches one string; if the read had returned an empty page they would report a hundred separate failures instead of one cause, or worse, pass vacuously once a pin is inverted",
  () => lines.length > 100 || `read ${lines.length} lines out of ${PAGE}`);

// ------------------------------------------------------------------ frontmatter and shape

test("the frontmatter names the mode, forbids model invocation, and states the release's version",
  "a mode the model may invoke on its own is not a mode the user opted into, and a version that drifts from plugin.json makes a saved plan name a release that never shipped",
  () => {
    const problems = [];
    for (const re of [/^name: orchestrate$/m, /^disable-model-invocation: true$/m, /^license: MIT$/m])
      if (!re.test(front)) problems.push(`frontmatter has no line matching ${re}`);
    // The Agent Skills spec puts version under `metadata`; the same reader package.test.mjs uses.
    const version = /^metadata:\s*$[\s\S]*?^\s+version:\s*"?([^"\s]+)"?\s*$/m.exec(front)?.[1] ?? null;
    const plugin = JSON.parse(read(".claude-plugin/plugin.json")).version;
    if (version !== plugin) problems.push(`metadata.version is ${JSON.stringify(version)}, plugin.json says ${JSON.stringify(plugin)}`);
    return problems.length === 0 || problems.join("; ");
  });

test("the page stays inside its budget: 156 lines, one heading level, no fence",
  "the mode is loaded into a context it exists to keep small, and it ships no code: a third heading level, a fence or a page that doubled in length are each the mode spending the budget it is selling",
  () => {
    const problems = [];
    if (lines.length > 156) problems.push(`${lines.length} lines`);
    const headings = lines.filter((l) => /^#+ /.test(l));
    const wrongLevel = headings.filter((l) => !l.startsWith("## "));
    if (!headings.length) problems.push("the page has no headings at all");
    if (wrongLevel.length) problems.push(`not a "## " heading: ${wrongLevel.join(" | ")}`);
    if (text.includes("```")) problems.push("a fenced block is in the page, which ships no code");
    return problems.length === 0 || problems.join("; ");
  });

// ------------------------------------------------------------------ the tier table

test("the tier table pairs all eight model names, one tier per row",
  "the pairing IS the table: a coordinator reads across a row to turn its own tier into a Codex `MODEL:` line, and a half-updated rename leaves it sending a name the driver rejects",
  () => shows(
    /^\| top \| Fable \| `gpt-6-astra` \| Astra \| design, mentoring, final review and verdict, decomposition you cannot do, a case stuck after two failed attempts\. Never implementation \|$/m,
    /^\| strong \| Opus \| `gpt-5\.6-sol` \| Sol \| write agents, non-trivial analysis \|$/m,
    /^\| cheap \| Sonnet \| `gpt-5\.6-terra` \| Terra \| mechanical, hard-to-get-wrong work \|$/m,
    /^\| bulk \| Haiku \| `gpt-5\.6-luna` \| Luna \| \*\*outside the pool, with a pool of its own\*\*: up to 50 alive at once\. .* \|$/m,
  ));

// ------------------------------------------------------------------ A: what the mode is

test("A1 the mode is prompt only",
  "the mode adds no mechanism to maintain; asking for a new header field or driver flag would change its scope",
  () => says("The mode is prompt only: no driver change, no new header field or flag, the agent's own prompt file and the driver's state directory unchanged."));

test("A3 the sibling is loaded first and this page re-cuts only what the mode changes",
  "rights, header fields, the worktree lifecycle and the exit ladder have exactly one home; a copy here is a second copy to drift, so the page has to send the reader there and say what it does not restate",
  () => {
    const problems = [];
    const raw = shows(/\[codex\]\(\.\.\/codex\/SKILL\.md\)/);
    if (raw !== true) problems.push(raw);
    const prose = says(
      "(Skill tool, `entrust:codex`; bare `codex` on a clone-and-symlink install)",
      "this page re-cuts only what the mode changes",
      "1. Load the sibling skill with the Skill tool if it is not loaded yet, scout, then decide the composition and the agents.",
    );
    if (prose !== true) problems.push(prose);
    return problems.length === 0 || problems.join("; ");
  });

// ------------------------------------------------------------------ B: the orchestrator's own hands

test("B1 scouting is the only exploration the orchestrator does",
  "the mode's one economy is that the big reads happen in an agent's context; an orchestrator that keeps exploring after the scout has spent the context the fan-out was meant to save",
  () => says(
    "scout the work-list with cheap commands (`ls`, `git status`, targeted `grep`) before any fan-out",
    "Scouting is the only repository exploration you do, and targeted bounded checks stay allowed inline after it",
  ));

test("B2 the verbose work is an agent's",
  "this list is the operational content of the mode: without it \"push the verbose step onto an agent\" is a slogan and every coordinator draws the line somewhere else",
  () => says("test output, greps over the tree, reading source files, diffs, logs"));

test("B3 a quick targeted edit stays in the orchestrator's hands",
  "the counterweight to B1: without it the mode fans out a one-line fix and pays an agent's latency for something already known",
  () => says("a quick targeted edit that needs no exploration"));

test("B4 a check run inline is redirected and read back as a 5-line tail",
  "the escape hatch that keeps B1 affordable: a suite run inline pastes thousands of lines into the context the mode exists to protect",
  () => says("read back only a 5-line tail with the counts"));

test("B5 the orchestrator never grades its own work",
  "self-review is the failure the whole composition is built against, and the orchestrator is the one agent with no one above it",
  () => says("verify: you never grade your own work, a fresh agent does"));

test("B6 a failed agent is reported, never backfilled, and every finding keeps its author",
  "a silently reissued agent turns a measured composition into a claim, and an unattributed finding cannot be weighed against the agent that made it",
  () => says(
    "report a failed agent and never backfill it",
    "attributing every finding to the agent that produced it",
  ));

// ------------------------------------------------------------------ C: the plan and the worktree

test("C1 one plan, or all of them",
  "picking silently between viable approaches is the choice the user came to make; the plan step is where that choice is offered or lost",
  () => says("One plan when there is one; when several approaches are viable, show them all with a recommendation and let the user pick"));

test("C2 the plan is shown and the run stops, with every right an agent needs, in words and not as field names",
  "rights declared per call are the sibling's guarantee, and they are worth nothing if the user first sees them in the transcript of an agent that already wrote; but a plan that recites `RIGHTS: write` and a run directory path at a person is machinery pointed at the one reader who cannot act on it (the owner read one and called it uninformative, 2026-09-09), so the rights have to survive in ordinary words and the field names have to go",
  () => says(
    "Show the plan and stop",
    "what each may write, that the agents reach the network and any you are keeping off it",
    "reports and artifacts land outside the repository, except a worktree agent's own tree",
    "Name no path and no header field",
  ));

test("C3 \"go\" covers the plan and nothing else, and never a live-tree commit",
  "one word of approval is the mode's only gate: if it silently widened to work the plan never listed, the plan stopped being the thing being approved",
  () => says(
    "The user's \"go\" covers only what the plan listed",
    "no commit to the live tree without a separate word from the user",
  ));

test("C4 a worktree is cut at HEAD and never used to test uncommitted live edits",
  "this is the trap that passes: the agent runs the suite against untouched code, reports green, and the coordinator reads it as evidence about edits the worktree never saw",
  () => says(
    "A new thread's worktree is cut at `HEAD`",
    "Never use one to test uncommitted live edits",
    "dependencies installable inside it under the planned rights (the live checkout's are absent), no daemon or socket",
    "A Codex worktree agent cannot commit under the rights a `RIGHTS:` line makes: its sandbox ends at the tree, so its work comes back as a diff",
  ));

test("C5 the harvest is landed by proposal, naming the three envelope handles",
  "the agent's work reaches the live tree through fields the envelope already carries; without their names the coordinator invents a merge and lands something nobody looked at",
  () => says(
    "Land the harvest by proposal: apply `worktreeDiffPath` and restore `worktreeUntrackedPath`, or merge or cherry-pick `worktreeCommitsRef` when the agent committed; show it, then wait, unless the plan said \"land the winner\"",
  ));

test("C6 the plan states the pool and the user overrides it in words",
  "the caps are settings the user owns: a plan that launched under the page's defaults without showing them gave the user nothing to overrule, and \"two Fable\" or \"only codex\" said after the first agent is a word too late",
  () => says(
    "Announce the composition here, and the caps beside it in a sentence: your own model, one Fable and one `gpt-6-astra` at a time, six alive.",
    "A cap the user sets in words (\"two Fable\"), or agrees to when the plan proposes one with its reason, replaces the default for this run; composition words (\"only codex\", \"no codex\") follow the sibling's table.",
  ));

test("C7 every agent's return is retold to the user in one short paragraph, the same shape for both sides",
  "the five fields are the orchestrator's input, not the user's: pasted whole they read in the transcript as the coordinator's own words (observed on 0.10.0, and again on 0.11.1 after this rule shipped), and a Codex agent, whose only visible row is a Bash call and an exit code, otherwise reaches the user having said nothing at all; the retelling is written, not forwarded, which is why the ban names the field names and the paths that rode in with the block",
  () => says("After any agent returns, Claude or Codex, write one short paragraph of your own, in the user's language and naming the agent by its model, in the same shape for both sides, the agent by name as the subject and what it did as the verb; the five fields are your own input, so never paste a five-field block, a header field name or a path into user-facing text."));

test("C8 browser and end-to-end runs go to a Claude agent or a write agent with the browser grants",
  "Chromium needs rights a read agent does not have — the grants are a file written INTO the tree, which is the one thing that level never does, and egress being on at both levels now does not change it; the grants that do work are one section of parity.md and not something to rediscover per run",
  () => {
    const prose = says(
      "Browser and end-to-end runs go to a Claude agent, or to a write agent with the grants parity.md's",
      "section names; a read agent cannot, because that section's Chromium override is a file in the tree it may not write.",
    );
    const link = shows(/\[Browser-mode sandbox\]\(\.\.\/codex\/references\/parity\.md#browser-mode-sandbox\)/);
    return prose === true && link === true || [prose, link].filter((r) => r !== true).join("; ");
  });

// ------------------------------------------------------------------ D: models, tags and effort

test("D2 the orchestrator's own model is read out of the system prompt",
  "the plan states it beside the pool and an untagged subagent inherits it, and nothing else in the session says which it is: a coordinator that guesses announces the wrong model and cannot tell an inherited tier from a chosen one",
  () => says("Your own model is in your system prompt (\"You are powered by the model named ...\"); nothing else carries it."));

test("D3 every Claude Agent call is tagged, fable only for Fable agents within the cap, and a Codex agent's model is its own header line",
  "an untagged subagent silently inherits the session model, so a fan-out meant to be cheap runs at the top tier; and a Codex agent runs inside the shipped wrapper, whose model is pinned in its file, so a model or effort written as a tool option is spent on the wrapper while the agent runs on its `MODEL:` line",
  () => says(
    "Tag every Claude Agent call with an explicit `model`: `opus` or `sonnet`, and `fable` only for Fable agents within the agreed cap",
    "every Codex agent carries one with a slug from the table, never the config default",
    "is spent on the wrapper alone and never reaches Codex",
  ));

test("D4 one Fable agent and one gpt-6-astra agent alive at a time",
  "the top tier is the expensive one and it is the one a fan-out multiplies fastest; the cap is the only thing between a five-agent batch and five top-tier agents",
  () => says("at most one Fable agent and one `gpt-6-astra` agent alive at a time"));

test("D5 the pool does not depend on the orchestrator's model, and the top pair takes its roles in turn",
  "the pool is the user's, not the session's: an Opus orchestrator that designed for itself and reviewed with a fresh Opus spent the strong tier on the top tier's work while a Fable agent sat unused; one Fable agent, one role at a time, is available to every orchestrator",
  () => {
    const prose = says(
      "You are outside the pool, and the pool is the same whatever you are",
      "each taking the top-row roles in turn, architect for one task and judge for the next",
    );
    const row = shows(/^\| plan \| design: the Fable agent, whatever your own model \|$/m);
    return prose === true && row === true || [prose, row].filter((r) => r !== true).join("; ");
  });

test("D7 a Fable agent never spawns Fable, and only the orchestrator launches Fable agents",
  "a top agent that may spawn its own top agent makes the cap of one unenforceable one level down, where nothing is counting; stated without \"agent\" the rule also read as forbidding a Fable orchestrator the one Fable agent the pool promises it",
  () => says("a Fable agent never spawns Fable", "only you launch Fable agents"));

test("D8 effort is chosen per agent below the top row, and low effort only for mechanical Sonnet stages in a Workflow",
  "measured 2026-09-17: two Luna read agents at an inherited xhigh took 480 and 557 s and 1.2M and 2.3M tokens for a ledger and a grep task. The earlier rule inherited the user's effort everywhere because, measured on codex-cli 0.153.4, no effort level bought the evidence guarantee an exception once claimed; this rule claims cost, not evidence",
  () => {
    const prose = says(
      "Every Codex agent carries an `EFFORT:` line chosen for its work",
      "`low` for the bulk row",
      "only a top-row agent goes without one and inherits the configured effort",
      "In a Workflow, `effort: 'low'` is for mechanical Claude Sonnet stages only.",
    );
    // The negative half: the old rule, which a later edit could restore beside the new sentences.
    if (/Send no `EFFORT:` line/.test(text)) return "the page tells the orchestrator to send no EFFORT line again";
    return prose;
  });

// ------------------------------------------------------------------ E: composition and bounds

test("E1 the mode replaces the sibling's \"nothing\" row: half beyond the implementers, rounded up, and implementers are not duplicated",
  "this is the one composition rule the mode changes, and it changes exactly one row; stated loosely it either duplicates every implementer or quietly drops the Codex side entirely",
  () => says(
    "This mode replaces one row of the sibling's",
    "the \"nothing\" row: when the user states no allocation, half the agents beyond the implementers, rounded up, are Codex",
    "Implementers are not duplicated: one per task",
  ));

test("E2 cross-review runs both directions, and each agent is a prompt agent with the schema",
  "one-directional cross-review checks only one side's bias, and a reviewer given no schema answers in prose, which is not the five fields the synthesis reads",
  () => says(
    "a Claude implementer's diff to a Codex agent and a Codex agent's diff to a Claude agent",
    "a cross-review agent is a prompt agent with the diff's path in `TASK:` and the template below in `OUTPUT_SCHEMA:`",
  ));

test("E3 the composition table is linked at its anchor",
  "everything the mode does not replace lives in that section; a link to the page without the anchor sends the reader to the top of a manual and the rules that still hold go unread",
  () => shows(/\[composition table\]\(\.\.\/codex\/SKILL\.md#composition\)/));

test("E4 the three bound rows: alive at once, the top pair, the Codex write agent per directory",
  "these are the numbers that decide whether a fan-out runs or deadlocks: a second Codex write agent on one directory exits 10 before its turn ever runs",
  () => shows(
    /^\| alive at once \| 6, Claude and Codex together, the top pair counted in \|$/m,
    /^\| Fable agents, `gpt-6-astra` agents \| 1 each, alive at a time \|$/m,
    /^\| Codex write agents per directory \| 1: a second on the same directory exits 10 at once, before its turn runs \|$/m,
  ));

test("E5 the three scaling rows: simple, comparison, complex",
  "the agent count is the decision a coordinator makes first and reasons about least; without the bands a simple task gets a panel and a complex one gets a single agent",
  () => shows(
    /^\| simple task \| 1 agent \|$/m,
    /^\| comparison or design \| 2 to 4 agents \|$/m,
    /^\| complex \| 5 agents or more, launched in batches inside the alive cap \|$/m,
  ));

test("E6 the writer may run the suite, but the deciding evidence comes from elsewhere",
  "a writer iterating against its own suite is how a green run gets produced by the same context that produced the bug; the rule keeps the iteration and moves only the verdict",
  () => says(
    "split by file ownership, as Claude agents on one live tree or as Codex agents in separate worktrees, never two Codex write agents on one directory",
    "stop the writers, restate the contract, let each owner repair only its own files, then have an agent that wrote neither verify the combined tree",
    "nobody changes what they share: no stash, branch switch, reset, clean or rebase",
    "A writer may run the suite while it iterates, but the evidence that decides comes from an agent that did not write the code, or from you under the redirect rule.",
  ));

// ------------------------------------------------------------------ F: mechanism and verification

test("F1 a Codex agent is a background Agent call of the shipped codex-agent type, and the Workflow signature names what a script may still do",
  "Workflow is for the chain a script must decide; a batch of independent Claude agents runs as Agent calls so each agent's end reaches the orchestrator (measured 2026-09-08: a Workflow hid an agent's exit for nine minutes); and the wrapper is the shipped agent entrust:codex-agent, which is what the agent map shows (measured 2026-09-12: only an Agent call has a card there, Stop on it reaches the driver, a message continues it), so a page that sent the agent anywhere else would lose the card or double the wrapper's context",
  () => {
    const prose = says(
      "authorises Workflow",
      "A Codex agent is one background Agent call, the sibling's `One call` verbatim",
      "`<DIR>` is the agent's directory the launcher makes beside the report, `agent/` next to `<REPORT>`, holding `prompt.txt`, `out.json`, `err.txt` and the driver's `exit` marker, and `<REPORT>` is `<run>/<agent>/report.json` under the run directory above, which the launcher and the driver create",
      "The wrapper's completion notification is when you read its status lines, and the report after a `PATH=own`",
      "The wrapper is an `agentType` of its own, `entrust:codex-agent`",
      "Launch independent Claude agents as background Agent calls, one notification each",
      "Load the `workflow-authoring` skill before writing the script when the session lists it.",
      "`agent(prompt, {label, phase, schema, model, effort, agentType, isolation})`",
      "`pipeline(items, ...stages)` runs items through stages with no barrier, `parallel(thunks)` is a barrier",
      "A subagent's final text is its return value, not a message to a human",
    );
    // The negative half: the retired relay took the prompt itself; the shipped wrapper never does, so the
    // page must not hand it one.
    if (/codex-agent[^\n]*(writes|write) the prompt/i.test(text)) return "the page hands the wrapper the prompt again";
    return prose;
  });

test("F2 the six verification bullets, one line each",
  "the list is read while composing a fan-out, so each bullet has to be one glance; a bullet that grew into a paragraph is a bullet that stops being read",
  () => shows(
    /^- Scout inline first: the work-list is yours, before any fan-out\.$/m,
    /^- Adversarial verify: a refuter defaults to `refuted` when it is uncertain, and a finding is (one|what) that changes correctness or a stated requirement, the rest (its|in) `open`\.$/m,
    /^- Perspective-diverse verify: vary the angle across verifiers instead of N identical refuters\.$/m,
    /^- Judge panel for a design task: a verdict (missing|without|lacking) its decisive check is `unknown` in `result`; name the missing check in `open`\. Use the sibling's `EXPECT:` rule for a Codex check\.$/m,
    /^- Completeness critic at the end: one fresh strong-row reader (chosen|selected) by the agreed composition and named in the plan, given the user's request, the final answer and its evidence once, before the answer goes out, never per return; it returns done, partial or not done with what is missing, unverified or unread, and the answer carries its verdict\. A publication \(a README, a changelog, a synthesis\) is read the same way before it goes out\.$/m,
    /^- No silent caps: name every agent, check or item you dropped\.$/m,
  ));

test("F3 two rounds of fix and cross-review, then escalate",
  "without a bound the fix loop is where a run spends its budget; the escalation names where the round after the second one goes, the top pair first and the user last",
  () => says("Fix, then cross-review, at most two rounds; then escalate to the Fable agent or the `gpt-6-astra` agent, and to the user only when that round fails too."));

test("F4 every row of the Result table",
  "this table is read at the one moment judgement is worst, when an agent has just failed; a missing row is a relaunch that duplicates a live run, or a gate verdict retried until it costs real money",
  () => shows(
    /^\| `FILE=missing`, or `PATH=taken` \| `DRIVER_EXIT` is the driver's own status: with one, this run is over and `<DIR>\/err\.txt` says why — a refused report path, an unusable parent, a path another run published to first — so read `<DIR>\/out\.json` for a report a turn wrote where publication failed, otherwise treat the result as unknown and relaunch once, same rights, under a fresh report path where work remains\. With `DRIVER_EXIT=unknown` nothing ended it: `kill -0 <pid>` with the pid on the first line of the stderr file says whether it is still running \|$/m,
    /^\| a stderr file naming no driver \| report it; no relaunch fixes an install \|$/m,
    /^\| `exitCode: 3`, a cut \| read the partial; if the work is unfinished, continue that thread once with `RESUME:`, under a report path of its own \|$/m,
    /^\| `exitCode: 10` \| a held lock or a busy thread: read `error` and the stderr file, wait for the holder, then run again; not a retry \|$/m,
    /^\| exit 2 or 4 \| with `turnStatus: null` no turn ran, or it was aborted: read `error` and the stderr file\. Exit 2 WITH a `turnStatus` is a turn the server rejected: read `turnError`, the commands and any answer before relaunching, or a paid turn is thrown away\. A `DRIVER_EXIT=2` beside `PATH=taken` is neither: the path was already taken, nothing of this run reached the file, and the report there is an earlier run's \|$/m,
    /^\| exit 4 with a `turnStatus` \| the server died mid-turn or the report was not delivered: the report is complete, read it as a gate verdict \|$/m,
    /^\| any other non-zero `exitCode` with an answer \| a gate verdict: do not retry, read the answer \|$/m,
    /^\| a Claude agent that returns `blocked` \| do not retry, report it \|$/m,
  ));

test("F5 the wrapper's description names the agent by its model",
  "a Codex agent surfaces as the wrapper's card, so without a description the user reads a generic agent where a Claude agent shows its task; the two sides stop looking like one run, which is the whole point of naming it there, and the model is the name a person can use, where the word this page calls it by is one they cannot",
  () => says("The Agent call carries a `description` of the form \"Codex <short name> <id>: <task in a few words>\", so the card the user sees names the agent, its vendor and its task, not the command line."));

test("F6 a Codex agent is waited on by a poll of its exit marker, a Claude agent by its Agent task, and no turn ends with an agent alive",
  "ending the coordinator's turn kills its background agents in a headless session (measured 2026-09-08); a blocking TaskOutput on a running wrapper returned 32 KB of its transcript at the timeout, seven of seven (2026-09-15/16), where a poll on the driver's exit marker returned one line, so the Codex wait goes on the poll task, the Claude wait stays on the Agent task, and the timeout stays named",
  () => says(
    "Wait on every agent you launch in the background, Claude or Codex, and never end your turn with an agent alive: a headless session ends with the turn and the task is killed with it",
    "until [ -s \"<DIR>/exit\" ]; do sleep 5; done; echo DONE=<id>",
    "call `TaskOutput(<poll_task_id>, block: true, timeout: 600000)` on that task, again while it runs; then read the wrapper's own lines at its completion notification",
    "For a Claude agent, call the same `TaskOutput` on its Agent task, again while it runs, and read its return when it finishes",
  ));

// ------------------------------------------------------------------ G: the agent's return, the run directory

test("G1 the five template lines, their indentation, the inline schema, and no BRIEF: line",
  "the template is pasted into a brief, so its indentation is the thing that survives or does not; `BRIEF:` on top of it clips the answer at 20 lines, which is the template's own bound overruled",
  () => {
    const problems = [];
    const raw = shows(
      /^ {4}status: {4}done \| partial \| blocked$/m,
      /^ {4}result: {4}at most 30 lines$/m,
      /^ {4}evidence: {2}what ran, with counts; a test without its count is not evidence$/m,
      /^ {4}artifacts: paths$/m,
      /^ {4}open: {6}questions and risks$/m,
      /^ {4}\{"type":"object","additionalProperties":false,"required":\["status","result","evidence","artifacts","open"\],"properties":\{"status":\{"type":"string","enum":\["done","partial","blocked"\]\},"result":\{"type":"string"\},"evidence":\{"type":"array","items":\{"type":"string"\}\},"artifacts":\{"type":"array","items":\{"type":"string"\}\},"open":\{"type":"array","items":\{"type":"string"\}\}\}\}$/m,
    );
    if (raw !== true) problems.push(raw);
    const prose = says("and send no `BRIEF:` line");
    if (prose !== true) problems.push(prose);
    return problems.length === 0 || problems.join("; ");
  });

test("G3 the run directory: its path, why it needs no .gitignore, kept after the task, and what a Codex agent's artifacts are",
  "one directory per run is what keeps an agent's artifacts findable and out of the tree the run works in; the plugin's data directory is outside every repository, so nothing has to be ignored and nothing lands in a payload, and `.claude/` is the one path whose writes prompt however the permissions are set",
  () => says(
    "The run directory is `<state>/orchestrate/<project-slug>/<run>/`, `<state>` the driver's state directory (`${CLAUDE_PLUGIN_DATA}` on a plugin install, the exported `ENTRUST_STATE_DIR` on the clone route)",
    "the working directory's absolute path with every character that is not a letter or a digit replaced by `-`",
    "It is outside every repository, so no `.gitignore`",
    "not the repository root, not the project's `.claude/`, whose writes prompt whatever the allow rules say",
    "it is kept after the task and the user deletes it",
    "Codex artifacts are the paths the agent's own report names",
  ));

test("G4 the first line of `result` is one readable sentence, and the five fields are read rather than forwarded",
  "both the synthesis and the paragraph the user reads are built out of returns; a `result` that opens mid-analysis has to be read whole before it can be retold, and the five-field shape alone is not something a human reads. The first line is an aid to the coordinator, not a message already addressed to the user: read the other way it licenses forwarding the block, which is how the ban in C7 was satisfied on paper and broken in the transcript",
  () => says(
    "The first line of `result` is one sentence a reader can take on its own: the agent's model and id, its status and what it did",
    "(\"Sonnet W5: done, four flaky width checks replaced by threshold checks\")",
    "the rest of the fields follow unchanged, and all five are yours to read, never to forward",
  ));

test("G5 a read agent is never asked to write: its artifact is its report",
  "a read agent handed a brief that demands a file spends its whole turn asking for an approval the driver refuses, and the run ends at exit 6 with nothing written and nothing answered (measured 2026-09-08)",
  () => says(
    "A read agent is never asked to write, not under the repository and not in the run directory: its artifact is its report",
    "costs a refused write and exit 6 (measured 2026-09-08)",
  ));

test("G6 the launcher and the driver make the run directory, the coordinator writes nothing there, and a Claude agent's artifact is its text",
  "a headless session refuses a Write, a `mkdir` and a redirect under the plugin's data directory as a sensitive file, with no prompt anyone can answer, so a coordinator told to create the directory itself stops at the first agent; the driver, handed the path as an argument, is not refused (measured 2026-09-08), and a Claude agent pointed at that directory hits the same wall the coordinator did",
  () => says(
    "The launcher and the driver create it, through `--report-file`, and it is what they make of it: a report per agent and, beside it, the launcher's `agent/` with the four files of the run; nothing else is written there",
    "Never run `mkdir`, Write or a shell redirect under that data directory yourself, because a headless session refuses each of them as a sensitive file with no prompt anyone can answer, while a subprocess handed the same path as an argument writes it unopposed (measured 2026-09-08)",
    "A Claude agent's artifact is its returned text, and a file it must leave goes under `$TMPDIR` with the path in that text",
  ));

// ------------------------------------------------------------------ H: the 2026-09-17 research round (research/2026-09-17-orchestration-practices/)
// These cases pin the rule where the words allow it (an alternation over the words that carry it, a
// negative half where the rule forbids something); they are still text pins, not a reading of the page.

test("B7 the page never tells the orchestrator to grade its own work",
  "the opposite of B5 can be added anywhere on the page without touching B5's sentence: 'grade your own work' outside its negation, or an instruction to skip the independent review; this case reads those forms wherever they land. It cannot read every paraphrase, so B5 and a human reader stay the other half",
  () => {
    const problems = [];
    for (const m of text.matchAll(/(grade|verify|review|judge)\w* (your|its|their) own (work|edits|code|diff)/gi)) {
      const before = text.slice(Math.max(0, m.index - 30), m.index);
      if (!/\b(never|not|nobody|no one)\b/i.test(before)) problems.push(`"${m[0]}" with no negation before it`);
    }
    if (/\b(ignore|skip|drop|omit)\b[^.\n]{0,40}\b(independent|fresh|separate)\b[^.\n]{0,20}\b(review|verif\w*)/i.test(text))
      problems.push("the page tells the orchestrator to skip the independent review");
    return problems.length === 0 || problems.join("; ");
  });

test("C9 every alternative is numbered with its cost, and the plan says what \"go\" selects",
  "a bare word of approval over a fork the plan had left open was read as assent three times (30a:204 on 2026-09-12, 30a:848 on 2026-09-13, 426:92 on 2026-09-16) and an option shown without its cost was read as free (426:1214, 2026-09-17); numbered, priced and with the selection stated in the plan, \"go\" is an answer the user gave knowingly, and nothing is selected by an undisclosed default",
  () => shows(
    /Number each (alternative|fork|option|choice), show its cost and mark the recommendation/,
    /(state|say|write) in the plan what "go" selects/i,
  ));

test("C10 the plan states expected tokens by tier and role, from comparable runs, and the page carries no tariff",
  "the user's cost stop came mid-flight (a 51-agent wave, 2026-09-07) and an Astra ran at 1 % quota (2026-09-11); an estimate in the plan moves that stop before \"go\". A fixed number on the page would be a pooled median mixing roles and task shapes (Luna 13.6 k for a recognition read, 742 k for a tree verification), so the line must carry none",
  () => {
    const prose = shows(/State expected tokens by tier and role in the plan/, /name the comparable runs behind each estimate/, /mark unmeasured roles `unknown`/);
    if (/State expected tokens[^\n]*\d/.test(text)) return "the plan step carries a number where it should carry an estimate";
    return prose;
  });

test("C11 the commands each check needs are checked against planned rights and environment before the plan, and unmet prerequisites go into the plan",
  "a review turn spent 2.65 M tokens and left its decisive check unrun because the sandbox could not complete it (sol-n2, 2026-09-17), and ten of thirteen agents in one run ended at exit 6 on declined requests; a prerequisite found before launch is a line in the plan, one found after it is a paid turn; the wording reassigns nothing after a refusal, which the sibling forbids",
  () => shows(
    /For (each|every) agent, (check|match|list) the required commands against its planned rights and environment/,
    /Probe uncertain prerequisites cheaply; put unmet prerequisites in the plan/,
  ));

test("D9 the bulk count is derived from the units and the plan says why that many",
  "eighty agents were launched on the word \"bigger\" against a page that already said six alive (2026-09-11) and a wave of fifty-one was stopped by the user for its cost (2026-09-07, before any cap); a derived count is one the user can weigh before the launch, and the rule claims nothing about yield, which no run has measured",
  () => shows(/a count (derived|taken|drawn) from the units with the plan (saying|stating) why that many/));

test("D10 Luna over Haiku carries no price claim",
  "the sentence said \"four times cheaper\" with no Haiku token count anywhere in the record; the preference is the owner's and stays, the price goes, and no other price, ratio or cost word may take its place on that line",
  () => {
    const line = lines.find((l) => l.includes("Prefer Luna to Haiku"));
    if (!line) return "the page no longer prefers Luna to Haiku in the bulk row";
    if (!/\*\*Prefer Luna to Haiku in the bulk row\*\*/.test(line)) return "the preference lost its emphasis";
    if (/cheap|price|cost|\btimes\b|×|\d+x\b/i.test(line)) return `the Luna line carries a price claim again: ${line.slice(0, 120)}`;
    return true;
  });

test("E7 a decisive check runs before any panel, dependent execution stays in one agent, and its verification stays independent",
  "sixteen agents over two naming rounds proposed, reviewed and judged before the check that decided was run (426:973, 426:1208, 2026-09-17), while the two tasks the coordinator kept in its own hands (2026-09-12, 2026-09-16) landed with critics only; the rule orders the check first and keeps the fresh verifier, it does not ban a panel",
  () => shows(
    /(Run|Make|Do) (a|the) decisive check before (commissioning|launching|spawning) (a|any) panel/,
    /(Keep|Leave) dependent execution in one agent; keep its verification independent/,
  ));

test("F7 one assembled brief is opened whole before the fan-out, and its input paths, item count and quoted claims are checked",
  "the split critic reads the decomposition, not the file the generator wrote: a join paired all twelve reports with the wrong paragraph (T1-05, 2026-09-11), a doubled path segment reached all twenty prompts (T1-09, 2026-09-12) and a quoting slip gave each of three agents one set of four (T1-39, 2026-09-17); paths that exist catch only the second, so the check names all three",
  () => shows(/^- (Open|Read) one assembled brief whole before (the|any) fan-out; check its input paths in the agent's planned tree, its item count and each quoted claim against its source\.$/m));

test("F8 two selection rounds on the same blocker are a stall, re-planned for the word, while repair rounds keep their escalation",
  "the two-round rule counts fix rounds; naming rounds each crowned a winner and the same blocker, a collision check no agent had run, came back (426:973, 426:1208), so that rule never tripped; a stall keyed to a repeated blocker trips where a round count does not, and the repair ladder, two rounds then the top row then the user, is untouched",
  () => shows(
    /Between selection rounds, (record|write|note) the candidates rejected, the evidence gained and the remaining blocker/,
    /Two rounds repeating the same blocker are a stall: show a new plan and wait for the word/,
    /Fix, then cross-review, at most two rounds; then escalate to the Fable agent or the `gpt-6-astra` agent/,
  ));

test("G7 a verifier's brief names its target and whole scope, and its return separates what it checked from what it did not",
  "a verifier that ran one or two checks and declared the whole passed is the early-victory shape (S1-40); locally the coordinator bounded a clipped 50 k-character report to the parts it had read (426:33, 2026-09-16) where three earlier overclaims from partial evidence were cut by agents (T1-08, T1-12, T1-49)",
  () => shows(
    /A verifier's brief (names|states) its target and the (whole|full) scope it must cover/,
    /its return says what it checked and, in `open`, what it did not/,
  ));

test("D11 the caps count turns in progress, and a thread waiting for another message uses no slot",
  "the pool caps parallel turns at a moment, not the threads that exist: a design of 2026-09-17 counted an idle advisor thread against the top-row cap, and the owner corrected it the same day",
  () => shows(
    /The caps count turns in progress/,
    /(a|any) threads? (waiting|that waits) for another message (uses|takes|holds) no slot/,
  ));

test("C12 the completeness critic reads the request, the answer and the evidence before every final answer, and returns a verdict",
  "the owner's corrections at the synthesis stage were 8 of 27 in the record and a README once published an inference from absence unchecked (T1-49, 2026-09-17); the critic is the one agent that reads the task whole, and a one-agent run is not exempt",
  () => {
    const prose = says(
      "given the user's request, the final answer and its evidence once, before the answer goes out, never per return",
      "returns done, partial or not done with what is missing",
      "A one-agent task has no judgement agent beyond the completeness critic",
    );
    if (prose !== true) return prose;
    const bullet = lines.find((l) => l.startsWith("- Completeness critic"));
    if (!bullet) return "the completeness critic bullet is gone";
    if (/\b(except|unless|skip|skipped|waived|optional)\b/.test(bullet)) return "the critic bullet exempts some run";
    return true;
  });

test("E8 the roles reference is linked from the bounds paragraph",
  "the role set was the tier table's four rows in practice; the reference is where the coordinator's variety lives, and a page without the link never sends anyone there",
  () => shows(/\[roles\.md\]\(references\/roles\.md\)/));

test("E9 the roles reference exists with its seven columns, at least fifteen roles, the six the page relies on, and no write right on a bulk verifier, a swarm reducer or a standing advisor",
  "the page sends the coordinator to references/roles.md for what a role may write and return; a missing file, a table without those columns, a gutted table or a bulk row granted a tree is a reference that misleads",
  () => {
    const roles = read("skills/orchestrate/references/roles.md");
    const problems = [];
    if (!/^\| Role \| What it does \| May write \| Returns \| Spawn it when \| Tier \| Record \|$/m.test(roles)) problems.push("the seven-column header is missing");
    const rows = roles.split("\n").filter((l) => /^\| [a-z]/.test(l));
    if (rows.length < 15) problems.push(`only ${rows.length} role rows`);
    for (const r of ["area scout", "split critic", "refuter", "bulk verifier", "judge", "completeness critic"]) if (!rows.some((l) => l.startsWith(`| ${r} |`))) problems.push(`no row for ${r}`);
    for (const r of ["bulk verifier", "swarm reducer", "advisor, standing"]) {
      const row = rows.find((l) => l.startsWith(`| ${r} |`));
      if (!row) problems.push(`no row for ${r}`);
      else if (/repository|run directory|live tree|worktree|state directory|data directory|owned files/i.test(row.split("|")[3])) problems.push(`the ${r} row grants a write right on a tree or the data directory`);
    }
    if (!/No role is a phase of one piece of work/.test(roles)) problems.push("the phase-pipeline sentence is gone");
    return problems.length === 0 || problems.join("; ");
  });

// ------------------------------------------------------------------ the schema, and the links

test("the inline schema parses and is strict all the way down",
  "an agent is told to copy this line into an `OUTPUT_SCHEMA:` file, so a typo in it is an agent that fails validation, and a missing `additionalProperties: false` is the loose schema the sentence beside it forbids",
  () => {
    const src = /^ {4}(\{"type":"object".*)$/m.exec(text)?.[1];
    if (!src) return "no 4-space-indented line starting {\"type\":\"object\" is in the page";
    let schema;
    try { schema = JSON.parse(src); } catch (e) { return `the schema line is not JSON: ${e.message}`; }
    const problems = [];
    const walk = (node, at) => {
      if (!node || typeof node !== "object") return;
      if (node.type === "object") {
        if (node.additionalProperties !== false) problems.push(`${at}: additionalProperties is ${JSON.stringify(node.additionalProperties)}, not false`);
        const props = Object.keys(node.properties ?? {});
        const required = node.required ?? [];
        const optional = props.filter((p) => !required.includes(p));
        const phantom = required.filter((p) => !props.includes(p));
        if (optional.length) problems.push(`${at}: not in required: ${optional.join(", ")}`);
        if (phantom.length) problems.push(`${at}: required but not a property: ${phantom.join(", ")}`);
      }
      for (const [k, v] of Object.entries(node.properties ?? {})) walk(v, `${at}.${k}`);
      if (node.items) walk(node.items, `${at}[]`);
    };
    walk(schema, "schema");
    // The five fields the whole page is built around, checked by name rather than by count.
    const missing = ["status", "result", "evidence", "artifacts", "open"].filter((f) => !(f in (schema.properties ?? {})));
    if (missing.length) problems.push(`the schema is missing: ${missing.join(", ")}`);
    return problems.length === 0 || problems.join("; ");
  });

test("every relative link resolves, inside this repository, to a file and to a heading that exists",
  "the page delegates its whole mechanism to the sibling by link: a moved file or a renamed section turns the authoritative half of the mode into a 404 that only a reader notices",
  () => {
    const dir = path.dirname(path.join(ROOT, PAGE));
    const problems = [];
    // GitHub's slug for a heading: lower-cased, punctuation dropped, spaces to hyphens.
    const slug = (h) => h.toLowerCase().replace(/[^a-z0-9 -]/g, "").trim().replace(/ +/g, "-");
    for (const [, target] of text.matchAll(/\[[^\]]*\]\(([^)\s]+)\)/g)) {
      if (/^[a-z]+:/.test(target)) continue;                                    // an external URL is not this suite's to resolve
      const [rel, anchor] = target.split("#");
      const abs = path.resolve(dir, rel);
      if (!abs.startsWith(ROOT + path.sep)) { problems.push(`${target} leaves the repository`); continue; }
      if (!fs.existsSync(abs)) { problems.push(`${target} resolves to nothing: ${abs}`); continue; }
      if (!anchor) continue;
      const headings = [...fs.readFileSync(abs, "utf8").matchAll(/^## (.+)$/gm)].map((m) => slug(m[1].trim()));
      if (!headings.includes(anchor)) problems.push(`${target}: no "## " heading slugs to #${anchor} (has ${headings.join(", ")})`);
    }
    return problems.length === 0 || problems.join("; ");
  });

process.exit(summarize(await runCases(CASES), CASES.length));
