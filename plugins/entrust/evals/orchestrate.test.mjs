#!/usr/bin/env node
// Does skills/orchestrate/SKILL.md, with the references it sends the coordinator to at a moment of the run
// (plan.md, results.md, approvals.md, answer.md, roles.md, foreman.md), still say what the mode was agreed
// to say?
//
//   node evals/orchestrate.test.mjs
//
// The orchestrate mode's rules are sentences, so these cases pin its decisions as sentences, rows and
// template lines, each in the file that holds it; where the page hands out a command (the runner, the
// linter, the launcher's --plan, the critic's manifest), a case runs it as the page writes it. Prose is
// whitespace-collapsed to allow rewrapping; rows and templates are anchored to preserve the layout an agent
// copies.
//
// The page and its references are the approved text. A pin that disagrees with them is a wrong pin.

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { ROOT, SCRIPTS, registry, runCases, skip, summarize, tempDir } from "./lib/harness.mjs";

const { cases: CASES, test } = registry();
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");

const PAGE = "skills/orchestrate/SKILL.md";
const text = read(PAGE);
const lines = text.replace(/\n+$/, "").split("\n");
const front = text.split("---")[1] ?? "";
// Prose wraps at whatever column the sentence lands on, so every prose pin reads this and never the raw
// text: a paragraph re-flowed by one word is not a lost decision.
const flat = text.replace(/\s+/g, " ");

// The references the page moved a moment's procedure into, read the same way. A missing file reads as
// empty, so the read case below names it instead of the whole suite throwing.
const source = (name, rel) => {
  let t = "";
  try { t = read(rel); } catch {}
  return { name, rel, text: t, flat: t.replace(/\s+/g, " "), lines: t.replace(/\n+$/, "").split("\n") };
};
const page = { name: "the page", rel: PAGE, text, flat, lines };
const REFS = ["plan", "results", "approvals", "answer"].map((n) => source(`${n}.md`, `skills/orchestrate/references/${n}.md`));
const [plan, results, approvals, answer] = REFS;

const saysIn = (src, ...phrases) => {
  const missing = phrases.filter((p) => !src.flat.includes(p));
  return missing.length === 0 || `${src.name} no longer says: ${missing.map((p) => JSON.stringify(p)).join(" | ")}`;
};
const showsIn = (src, ...res) => {
  const missing = res.filter((r) => !r.test(src.text));
  return missing.length === 0 || `no line of ${src.name} matches: ${missing.map(String).join(" | ")}`;
};
const says = (...phrases) => saysIn(page, ...phrases);
const shows = (...res) => showsIn(page, ...res);
// Several verdicts as one: true when every one holds, else their messages joined.
const all = (...verdicts) => verdicts.every((v) => v === true) || verdicts.filter((v) => v !== true).join("; ");
// A command the page hands out, as written there, with `${CLAUDE_SKILL_DIR}` resolved the way Claude Code
// resolves it in this skill's body: to the orchestrate skill's own directory.
const SKILL_DIR = path.dirname(path.join(ROOT, PAGE));
const recipe = (script) => {
  const m = new RegExp(`\`node "\\$\\{CLAUDE_SKILL_DIR\\}/scripts/${script.replace(".", "\\.")}"([^\`]*)\``).exec(text);
  return m && { file: path.join(SKILL_DIR, "scripts", script), args: m[1].trim() };
};
const run = (file, args, opts = {}) => spawnSync(process.execPath, [file, ...args], { encoding: "utf8", timeout: 60000, ...opts });

test("the page and its four moment references were read (every case below is sound)",
  "every case here searches one string; if the read had returned an empty page they would report a hundred separate failures instead of one cause, or worse, pass vacuously once a pin is inverted. The read is checked by what the files open with, not by a line count, which a trim of the page would trip for no reason",
  () => {
    const problems = [];
    if (!/^---\nname: orchestrate\n/.test(text)) problems.push(`${PAGE} does not open with its frontmatter`);
    for (const r of REFS) if (!/^# \S/.test(r.text)) problems.push(`${r.rel} is missing, empty or opens with no title`);
    return problems.length === 0 || problems.join("; ");
  });

test("the references carry no ${CLAUDE_...} placeholder",
  "Claude Code substitutes a placeholder only in a skill's body: a reference read with the Read tool keeps it literal, and a command copied from there runs on a path that does not exist, so a line that needs one stays on the page",
  () => {
    const hits = REFS.flatMap((r) => r.lines.flatMap((l, i) => (/\$\{CLAUDE_[A-Z_]+\}/.test(l) ? [`${r.name}:${i + 1}`] : [])));
    return hits.length === 0 || `a placeholder in ${hits.join(", ")}`;
  });

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

test("the page keeps its shape: one heading level, no fence",
  "the mode is loaded into a context it exists to keep small, and it ships no code: a third heading level or a fence is the mode spending the budget it is selling. The size bound itself is evals/skills.test.mjs rule 4's, which counts what Claude Code re-attaches after a compaction and runs in CI; the line count that stood here was a proxy for it, passing a page that rule fails (the owner, 2026-09-30)",
  () => {
    const problems = [];
    const headings = lines.filter((l) => /^#+ /.test(l));
    const wrongLevel = headings.filter((l) => !l.startsWith("## "));
    if (!headings.length) problems.push("the page has no headings at all");
    if (wrongLevel.length) problems.push(`not a "## " heading: ${wrongLevel.join(" | ")}`);
    if (text.includes("```")) problems.push("a fenced block is in the page, which ships no code");
    return problems.length === 0 || problems.join("; ");
  });

// ------------------------------------------------------------------ the tier table

test("the tier table pairs all eight model names, one tier per row",
  "the pairing IS the table: a coordinator reads across a row to turn its own tier into a Codex `MODEL:` line, and a half-updated rename leaves it sending a name the driver rejects. The Codex column carries the short name alone, because the driver resolves it to the newest model of that name and a version written here went stale the day GPT-6 Sol shipped",
  () => shows(
    /^\| top \| Fable \| Astra \| design, mentoring, \[final review\]\(references\/roles\.md\) and verdict, decomposition you cannot do, a case stuck after two failed attempts\. Never implementation \|$/m,
    /^\| strong \| Opus \| Sol \| write agents, non-trivial analysis \|$/m,
    /^\| cheap \| Sonnet \| Terra \| mechanical, hard-to-get-wrong work \|$/m,
    /^\| bulk \| Haiku \| Luna \| \*\*outside the pool, with a pool of its own\*\*: up to 50 alive at once\. .* \|$/m,
  ));

// ------------------------------------------------------------------ A: what the mode is

test("A1 the mode adds no header field or flag, its own scripts write only under $TMPDIR, and every agent has a mailbox",
  "the owner, 2026-09-27: the \"prompt only\" sentence goes, because the fixes for #15 and #16 change the driver and the launcher and add the runner and the linter; a header field of the mode's own would still change its scope, and a script of its own that wrote beside the repository would be a second state directory. The mode names no flag for approvals either: every agent already has a mailbox. The owner, 2026-09-30: the clause saying that what the mode asks of the driver and the launcher is changed in the sibling under its own changelog line went, unclear to a coordinator and a maintainer's rule the repository's CLAUDE.md already states",
  () => {
    const said = says(
      "The mode adds no header field or flag and leaves the agent's own prompt file where the sibling puts it, and its own scripts, the runner and the linter, run a command or read a draft and write only under `$TMPDIR`.",
      "Every agent has a mailbox, so it can ask instead of being declined at once.",
    );
    if (said !== true) return said;
    return !/The mode is prompt only/.test(flat) || "the page still says the mode is prompt only";
  });

test("A4 the page sends the coordinator to each moment reference from the step or sentence where that moment comes, and step 1 reads plan.md by its substituted path",
  "the four references hold what the page moved out of the block Claude Code re-attaches after a compaction; a reference no page sentence links is one a coordinator never opens, and its pins below would stay green over a procedure nobody follows. plan.md is read at step 1 like the composition page, because the plan is made before any event could send the coordinator there (2026-09-30)",
  () => {
    const step = (n) => lines.find((l) => l.startsWith(`${n}. `)) ?? "";
    const problems = [];
    if (!step(1).includes("Read [plan.md](references/plan.md) the same way, `${CLAUDE_SKILL_DIR}/references/plan.md`")) problems.push("step 1 does not read plan.md");
    if (!/\]\(references\/plan\.md#the-card\)/.test(step(2))) problems.push("step 2 does not send the card to plan.md");
    if (!/\]\(references\/results\.md#a-worktree-agents-harvest\)/.test(step(4))) problems.push("step 4 does not send the harvest to results.md");
    if (!/\]\(references\/answer\.md\)/.test(step(5)) || !/\]\(references\/approvals\.md#the-synthesis\)/.test(step(5))) problems.push("step 5 does not send the answer's checks to answer.md and the approvals synthesis to approvals.md");
    const mechanism = text.split("## Mechanism")[1]?.split("\n## ")[0] ?? "";
    if (!/`DONE=<id>`[^\n]*\]\(references\/results\.md\)/.test(mechanism)) problems.push("the DONE= sentence does not send the report to results.md");
    if (!/`ASK=<id>`[^\n]*\]\(references\/approvals\.md\)/.test(mechanism)) problems.push("the ASK= sentence does not send the request to approvals.md");
    if (!flat.includes("When two writers' work collides, repair it as [results.md](references/results.md#writers-collided) says.")) problems.push("the page does not send a collision of two writers to results.md");
    return problems.length === 0 || problems.join("; ");
  });

test("A3 step 1 reads the generated composition page first, the sibling is loaded once the plan has a Codex agent, and this page re-cuts only what the mode changes",
  "rights, header fields, the worktree lifecycle and the exit ladder have exactly one home; a copy here is a second copy to drift, so the page has to send the reader there and say what it does not restate. #15 F18: the page loaded the sibling's 4,500 words on every run, an all-Claude one included; the composition rules and the rights table it plans from are generated into a reference, and the load waits for a Codex agent, before the launcher's --plan, which is the first command that needs it",
  () => {
    const problems = [];
    const raw = shows(/\[codex\]\(\.\.\/codex\/SKILL\.md\)/, /\[codex-composition\.md\]\(references\/codex-composition\.md\)/);
    if (raw !== true) problems.push(raw);
    const prose = says(
      "Plan from [codex-composition.md](references/codex-composition.md), the sibling's composition rules and rights table generated into this page's references.",
      "Load [codex](../codex/SKILL.md) (Skill tool, `entrust:codex`) once the plan has a Codex agent, before its launcher's `--plan`",
      "this page re-cuts only what the mode changes",
      "1. First read `${CLAUDE_SKILL_DIR}/references/codex-composition.md` whole with the Read tool, before any decision: it holds the composition rules and the rights table the plan is made from.",
      "Scout, then decide the composition and the agents from it; load the sibling skill with the Skill tool once the plan has a Codex agent, and compose again by the Codex status it prints as it loads, the sixth rule, before anything is registered or shown.",
    );
    if (prose !== true) problems.push(prose);
    // The live gate, 2026-09-27 (case 6): with the reference only linked, an Opus coordinator scouted and showed
    // the card without reading it. The read is step 1's first action, and its path is the file the link names.
    const step1 = lines.find((l) => l.startsWith("1. ")) ?? "";
    const read = /^1\. First read `\$\{CLAUDE_SKILL_DIR\}\/([^`]+)` whole with the Read tool, before any decision/.exec(step1)?.[1];
    if (!read) problems.push(`step 1 does not open with the read: ${step1.slice(0, 80)}`);
    else if (!fs.existsSync(path.join(SKILL_DIR, read))) problems.push(`step 1 reads ${read}, which is not in the skill's directory`);
    else if (path.join(SKILL_DIR, read) !== path.join(SKILL_DIR, "references", "codex-composition.md")) problems.push(`step 1 reads ${read}, not the page line 12 links`);
    // The negative half: the unconditional load the deferral replaced.
    if (/Load \[codex\]\(\.\.\/codex\/SKILL\.md\) now/.test(text)) problems.push("the page loads the sibling unconditionally again");
    if (/if it is not loaded yet/.test(flat)) problems.push("step 1 loads the sibling before the composition again");
    return problems.length === 0 || problems.join("; ");
  });

// ------------------------------------------------------------------ B: the orchestrator's own hands

test("B1 scouting is the only exploration the orchestrator does",
  "the mode's one economy is that the big reads happen in an agent's context; an orchestrator that keeps exploring after the scout has spent the context the fan-out was meant to save",
  () => says(
    "scout the work-list with cheap commands (`ls`, `git status`, targeted `grep`) before any fan-out",
    "Scouting is the only repository exploration you do. After it, an inline check is one command through the runner, answering one yes-or-no or one number in at most twenty lines read back; a second command on the same question goes to an agent.",
  ));

test("B2 the verbose work is an agent's",
  "this list is the operational content of the mode: without it \"push the verbose step onto an agent\" is a slogan and every coordinator draws the line somewhere else",
  () => says("test output, greps over the tree, reading source files, diffs, logs"));

test("B3 a quick targeted edit stays in the orchestrator's hands",
  "the counterweight to B1: without it the mode fans out a one-line fix and pays an agent's latency for something already known",
  () => says("a quick targeted edit that needs no exploration"));

test("B4 a check run inline goes through the runner, read back as its tail and its EXIT= line, and every brief names the runner",
  "the escape hatch that keeps B1 affordable: a suite run inline pastes thousands of lines into the context the mode exists to protect. #15 F9 and F10: the 5-line-tail sentence was on the page and coordinators and agents still read whole floods, and a `| tail` returned tail's exit 0 over a failing suite; the runner prints the exit itself, and the Codex half is in the rule because its exclusion rested on an unmeasured clipping hypothesis (09, D7)",
  () => {
    const said = says(
      "Redirect every check you run yourself through the runner, `node \"${CLAUDE_SKILL_DIR}/scripts/capture-check.mjs\" --label <question> --ledger <file> -- '<command>'`, one ledger file under `$TMPDIR` for the run (its `--help` has the rest)",
      "the whole output goes to a log under `$TMPDIR`, you read back its tail and its `EXIT=` line, and a pipeline's status is its failing stage's, not `tail`'s.",
      "Every brief, Claude or Codex, names the runner by the path above for any command whose output may pass twenty lines, and the return quotes each run's `EXIT=` line.",
    );
    if (said !== true) return said;
    return !/5-line tail/.test(flat) || "the page still asks for a 5-line tail read by hand";
  });

test("B5 the orchestrator never grades its own work",
  "self-review is the failure the whole composition is built against, and the orchestrator is the one agent with no one above it",
  () => says("verify: you never grade your own work, a fresh agent does"));

test("B8 inline work is priced as its size times the calls left, and the section carries no tariff",
  "#15 F21: the page priced agents and never the coordinator's own reads, which every later call re-reads; the price is a rule of proportion, and a token figure here would be a pooled median the page cannot keep true (C10)",
  () => {
    const said = says(
      "What you read inline is re-read by every call after it: its cost is its size times the calls left in the session",
      "so a 500-line diff read at the twentieth call of a hundred is read eighty more times, where an agent reads it once and returns thirty lines.",
    );
    if (said !== true) return said;
    const section = text.split("## Your own hands")[1]?.split("\n## ")[0] ?? "";
    const tariff = /\d[\d.,]*\s*[kKM]?\s*tokens\b/.exec(section);
    return !tariff || `the section carries a token figure: ${tariff[0]}`;
  });

test("B9 the runner the page hands out runs as written: a flood comes back as a bounded tail with EXIT= last, a failing pipeline's exit is its failing stage's, and a second command on the same question is refused",
  "#15 F9, F10 and F15 are behaviours, so the regression runs the page's own command line: a 5,000-line output read back whole, an exit 0 printed over a failing stage, or a second inline command on a question already asked, is the failure the sentence exists to stop",
  () => {
    const cmd = recipe("capture-check.mjs");
    if (!cmd) return "the page names no `node \"${CLAUDE_SKILL_DIR}/scripts/capture-check.mjs\"` command";
    if (!fs.existsSync(cmd.file)) return `the page names ${cmd.file}, which does not exist`;
    for (const flag of ["--label", "--ledger"]) if (!cmd.args.includes(flag)) return `the page's runner command carries no ${flag}`;
    const problems = [];
    const ledgerDir = tempDir("orchestrate-ledger.");
    const ledger = path.join(ledgerDir, "ledger.jsonl");
    const flood = run(cmd.file, ["--label", "flood", "--ledger", ledger, "--", "seq 1 5000"]);
    const again = run(cmd.file, ["--label", "flood", "--ledger", ledger, "--", "seq 1 3"]);
    if (!/^ERROR=/m.test(again.stdout) || /^LOG=/m.test(again.stdout)) problems.push(`a second command on the same question ran: ${again.stdout.trim().split("\n").at(-1)}`);
    const summary = run(cmd.file, ["--summary", "--ledger", ledger]);
    if (!/^CHECKS=/m.test(summary.stdout)) problems.push(`--summary printed no CHECKS= line: ${summary.stdout.slice(0, 120)}`);
    fs.rmSync(ledgerDir, { recursive: true, force: true });
    const out = flood.stdout.replace(/\n+$/, "").split("\n");
    // The page's bound is twenty lines read back in all, the runner's own lines included.
    if (out.length > 20) problems.push(`a 5,000-line command printed ${out.length} lines, over the page's twenty`);
    if (out.at(-1) !== "EXIT=0") problems.push(`the flood's last line is ${JSON.stringify(out.at(-1))}, not EXIT=0`);
    const pipe = run(cmd.file, ["--label", "pipe", "--", "sh -c 'echo failing; exit 3' | tail -1"]);
    const last = pipe.stdout.replace(/\n+$/, "").split("\n").at(-1);
    if (last !== "EXIT=3") problems.push(`a pipeline whose first stage exits 3 ended ${JSON.stringify(last)}`);
    if (pipe.status !== 3) problems.push(`the runner exited ${pipe.status} for a failing stage, not 3`);
    const log = /^LOG=(.+)$/m.exec(flood.stdout)?.[1];
    if (!log || !fs.existsSync(log)) problems.push(`no LOG= line naming a file: ${JSON.stringify(log)}`);
    else {
      if (fs.readFileSync(log, "utf8").split("\n").filter(Boolean).length !== 5000) problems.push("the log does not hold the whole output");
      if (process.env.TMPDIR && !fs.realpathSync(log).startsWith(fs.realpathSync(process.env.TMPDIR))) problems.push(`the log is outside $TMPDIR: ${log}`);
      fs.rmSync(log, { force: true });
    }
    const pipeLog = /^LOG=(.+)$/m.exec(pipe.stdout)?.[1];
    if (pipeLog) fs.rmSync(pipeLog, { force: true });
    return problems.length === 0 || problems.join("; ");
  });

test("B6 a failed agent is reported, never backfilled, and every finding keeps its author",
  "a silently reissued agent turns a measured composition into a claim, and an unattributed finding cannot be weighed against the agent that made it",
  () => says(
    "Report a failed agent and never backfill it.",
    "attributing every finding to the agent that produced it",
  ));

// ------------------------------------------------------------------ C: the plan and the worktree

test("C1 one plan, or all of them",
  "picking silently between viable approaches is the choice the user came to make; the plan step is where that choice is offered or lost",
  () => saysIn(plan, "One plan when there is one; when several approaches are viable, show them all with a recommendation and let the user pick"));

test("C2 the plan is shown and the run stops, with every right an agent needs, in words and not as field names",
  "rights declared per call are the sibling's guarantee, and they are worth nothing if the user first sees them in the transcript of an agent that already wrote; but a plan that recites `RIGHTS: write` and a run directory path at a person is machinery pointed at the one reader who cannot act on it (the owner read one and called it uninformative, 2026-09-09), so the rights have to survive in ordinary words and the field names have to go",
  () => all(
    says("show the plan as a card of five rows and stop"),
    saysIn(plan,
      "what each may write, that the agents reach the network and any you are keeping off it",
      "reports and artifacts land outside the repository, except a worktree agent's own tree",
      "Name no path and no header field",
    ),
  ));

test("C3 \"go\" covers the plan and nothing else, and never a live-tree commit",
  "one word of approval is the mode's only gate: if it silently widened to work the plan never listed, the plan stopped being the thing being approved",
  () => says(
    "The user's \"go\" covers only what the plan listed",
    "no commit to the live tree without a separate word from the user",
  ));

test("C4 a worktree is cut at HEAD and never used to test uncommitted live edits",
  "this is the trap that passes: the agent runs the suite against untouched code, reports green, and the coordinator reads it as evidence about edits the worktree never saw",
  () => all(
    saysIn(plan,
      "A new thread's worktree is cut at `HEAD`",
      "Never use one to test uncommitted live edits",
      "dependencies installable inside it under the planned rights (the live checkout's are absent), no daemon or socket",
    ),
    says("A Codex worktree agent cannot commit under the rights a `RIGHTS:` line makes: its sandbox ends at the tree, so its work comes back as a diff"),
  ));

test("C5 the harvest is landed by proposal, naming the three envelope handles",
  "the agent's work reaches the live tree through fields the envelope already carries; without their names the coordinator invents a merge and lands something nobody looked at",
  () => saysIn(results,
    "Land the harvest by proposal: apply `worktreeDiffPath` and restore `worktreeUntrackedPath`, or merge or cherry-pick `worktreeCommitsRef` when the agent committed; show it, then wait, unless the plan said \"land the winner\"",
  ));

test("C6 the plan states the pool and the user overrides it in words",
  "the caps are settings the user owns: a plan that launched under the page's defaults without showing them gave the user nothing to overrule, and \"two Fable\" or \"only codex\" said after the first agent is a word too late",
  () => saysIn(plan,
    "Announce the composition here, and the caps beside it in a sentence: your own model, one Fable and one Astra at a time, six alive.",
    "A cap the user sets in words (\"two Fable\"), or agrees to when the plan proposes one with its reason, replaces the default for this run; composition words (\"only codex\", \"no codex\") follow the sibling's table.",
  ));

test("C7 each phase is retold to the user in one short paragraph of verified changes, pending work and blockers, the same shape for both sides",
  "the five fields are the orchestrator's input, not the user's: pasted whole they read in the transcript as the coordinator's own words (observed on 0.10.0, and again on 0.11.1 after this rule shipped), and a Codex agent, whose only visible row is a Bash call and an exit code, otherwise reaches the user having said nothing at all; the retelling is written, not forwarded, which is why the ban names the field names and the paths that rode in with the block",
  () => {
    // #15 F16: a paragraph after every return is fourteen paragraphs a run; the cadence is the phase, and a
    // paragraph carries only what a verifier confirmed, so an unverified return never reads as a success.
    const said = says("At the end of each phase — a fan-out's returns, a verification round, the synthesis — write one short paragraph of your own, in the user's language, naming each agent by its model, in the same shape for both sides, the agent by name as the subject and what it did as the verb, carrying what a verifier confirmed, what is pending and what blocks; a return arriving alone earns no paragraph unless it is a failure or a question for the user; the five fields are your own input, so never paste a five-field block, a header field name or a path into user-facing text.");
    if (said !== true) return said;
    return !/After any agent returns/.test(flat) || "the page still asks for a paragraph after every return";
  });

test("C13 the plan is a card of five rows over agents the launcher registered, and an agent off the card is refused or not launched until an amendment is approved",
  "#15 F13 and F14: the plan's ten elements were read as a wall and approved unread, and agents the plan never listed ran anyway (T7: 1.38M tokens unplanned); the card's five headings are what the user and the gate check, the launcher's refusal holds the Codex half without compliance, and the Claude half is the id in the description. The owner, 2026-09-27: an all-Claude plan skips the registration and still shows the card",
  () => {
    const problems = [];
    const said = all(
      says(
        "With a Codex agent in the plan, register every agent, Claude or Codex, through the sibling's launcher, `--plan --run-dir <run>` (its `--help` gives the rows), and build the card from the rows it prints. An all-Claude plan skips the registration.",
        "The launcher refuses a Codex agent the registered plan does not list, and a Claude agent the card does not list is one you do not launch: amend the plan (`--plan --amend` when it was registered), show the amendment and wait for a word, as for the plan.",
        "Give it a description of the form \"<Model> <id>: <task in a few words>\", the id the card gave it, as a Codex agent's card carries \"Codex <short name> <id>: <task in a few words>\".",
      ),
      saysIn(plan,
        "Write the card's five rows in the user's own language and in ordinary words",
        "— work: what will be done; who: each agent by model name and role; writes: what each may write",
        "except a worktree agent's own tree, which is made and removed inside the repository, in a hidden folder;",
        "; cost: the tokens by agent, and your own inline work beside them; checks: which agent verifies what, the critic, and for a design round the criterion that picks the survivors.",
      ),
    );
    if (said !== true) problems.push(said);
    // E89: the launcher prints no counts, since the role vocabulary is open and a word classifier refused 12 of 22 roles.
    if (/WORKERS=|CHECKING=/.test(flat + plan.flat)) problems.push("the card is still built from the launcher's worker and checker counts");
    // The card is read by the user: the sentence that tells what it says carries no machinery (R1, 2026-09-27).
    // Cut between two pinned phrases (C13 above, C2), so a lost key is a failure, never an empty card that passes.
    const card = plan.flat.split("Write the card's five rows in the user's own language and in ordinary words")[1]?.split("Name no path and no header field")[0] ?? "";
    if (!card) problems.push("plan.md's card sentence cannot be cut out between its pinned phrases");
    for (const word of ["driver", ".claude"]) if (card.includes(word)) problems.push(`the card's sentence says ${JSON.stringify(word)}`);
    // The flags the page hands over are the launcher's: a renamed or dropped one is a plan step that exits 2.
    const launcher = path.join(SCRIPTS, "agent-run.mjs");
    const help = run(launcher, ["--help"]).stdout ?? "";
    for (const flag of ["--plan", "--run-dir", "--amend"]) if (!help.includes(flag)) problems.push(`the launcher's --help does not advertise ${flag}`);
    return problems.length === 0 || problems.join("; ");
  });

test("C14 every return is read into the five fields before the synthesis, the answer is a linted draft naming every agent that ran, and the run is checked against the card",
  "#15 F20a and F20b: returns reached the synthesis in shapes nobody parsed and agents that ran were never named; P13b: the answer carried paths, ids and exit mechanics (T5, T9); the linter reads the draft without reading intent, and an unparsed return stays unknown rather than becoming a finding",
  () => all(
    says(
      "Before the synthesis, read every return, Claude or Codex, into the five fields, each claim keeping the agent it came from; a return that does not parse is continued once for them, and after that its result is `unknown`.",
      "Draft the answer into a file under your temporary directory and lint it with `node \"${CLAUDE_SKILL_DIR}/scripts/lint-draft.mjs\" --agents \"<Model> <id>, …\" --receipts <ledger> <file>` until it exits 0, `--agents` naming every agent that ran and `--receipts` the run's ledger (its `--help` lists the rules).",
    ),
    saysIn(answer,
      "The answer names every agent that ran, or names it as dropped, and a success claim names the evidence behind it or says it is unverified.",
      "Before it goes out, check the run against the card: every launch, every write and every dropped agent.",
      "Your own inline reads, the runner's `--summary` of the run's ledger, stand beside the agents' tokens, and `unknown` where nothing counted them.",
    ),
  ));

test("C15 the linter the page hands out runs as written: a clean draft passes, and a path, an agent left unnamed or a success claim with no receipt fails",
  "the page points at the linter's --help instead of restating its rules, so the regression is that the command the page writes exists and refuses what #15 names: machinery in the answer (P13b), an agent that ran and is never named (F20a), and a success claim resting on nothing (09, D14)",
  () => {
    const cmd = recipe("lint-draft.mjs");
    if (!cmd) return "the page names no `node \"${CLAUDE_SKILL_DIR}/scripts/lint-draft.mjs\"` command";
    if (!fs.existsSync(cmd.file)) return `the page names ${cmd.file}, which does not exist`;
    for (const flag of ["--agents", "--receipts"]) if (!cmd.args.includes(flag)) return `the page's linter command carries no ${flag}`;
    const problems = [];
    const dir = tempDir("orchestrate-lint.");
    const draft = (name, body) => { const f = path.join(dir, name); fs.writeFileSync(f, body); return f; };
    const ledger = draft("ledger.jsonl", `${JSON.stringify({ label: "the orchestrate suite", exit: 0 })}\n`);
    const agents = ["--agents", "Opus W1, Codex Sol W3", "--receipts", ledger];
    const lint = (f) => run(cmd.file, [...agents, f]);
    const clean = lint(draft("clean.md", "Opus W1 changed the two pages, Codex Sol W3 the launcher, and the orchestrate suite passed.\n"));
    if (clean.status !== 0) problems.push(`a clean draft exited ${clean.status}: ${clean.stdout.trim()}`);
    for (const [name, body, rule] of [
      ["path.md", "Opus W1 and Codex Sol W3 left their notes in /Users/someone/Library/entrust/report.json.\n", "path"],
      ["unnamed.md", "Opus W1 changed the two pages.\n", "agent-not-named"],
      ["unsupported.md", "Opus W1 and Codex Sol W3 changed the pages, and everything passed.\n", "unsupported-success"],
    ]) {
      const red = lint(draft(name, body));
      if (red.status !== 1 || !new RegExp(`^LINT=${rule}:`, "m").test(red.stdout)) problems.push(`${name}: exit ${red.status}, no LINT=${rule}: line`);
    }
    const help = run(cmd.file, ["--help"]);
    if (help.status !== 0 || help.stdout.length < 200) problems.push(`--help exited ${help.status} with ${help.stdout.length} bytes`);
    fs.rmSync(dir, { recursive: true, force: true });
    return problems.length === 0 || problems.join("; ");
  });

test("C8 browser and end-to-end runs go to a Claude agent or a write agent with the browser grants",
  "Chromium needs rights a read agent does not have — the grants are a file written INTO the tree, which is the one thing that level never does, and egress being on at both levels now does not change it; the grants that do work are one section of parity.md and not something to rediscover per run",
  () => all(
    saysIn(plan,
      "Browser and end-to-end runs go to a Claude agent, or to a write agent with the grants parity.md's",
      "section names; a read agent cannot, because that section's Chromium override is a file in the tree it may not write.",
    ),
    showsIn(plan, /\[Browser-mode sandbox\]\(\.\.\/\.\.\/codex\/references\/parity\.md#browser-mode-sandbox\)/),
  ));

// ------------------------------------------------------------------ D: models, tags and effort

test("D2 the orchestrator's own model is read out of the system prompt",
  "the plan states it beside the pool and an untagged subagent inherits it, and nothing else in the session says which it is: a coordinator that guesses announces the wrong model and cannot tell an inherited tier from a chosen one",
  () => saysIn(plan, "Your own model is in your system prompt (\"You are powered by the model named ...\"); nothing else carries it."));

test("D3 every Claude Agent call is tagged, fable only for Fable agents within the cap, and a Codex agent's model is its own header line",
  "an untagged subagent silently inherits the session model, so a fan-out meant to be cheap runs at the top tier; and a Codex agent runs inside the shipped wrapper, whose model is pinned in its file, so a model or effort written as a tool option is spent on the wrapper while the agent runs on its `MODEL:` line",
  () => says(
    "Tag every Claude Agent call with an explicit `model`: `opus` or `sonnet`, and `fable` only for Fable agents within the agreed cap",
    "every Codex agent carries one with a name from the table, never the config default",
    "is spent on the wrapper alone and never reaches Codex",
  ));

// D4, "at most one Fable agent and one Astra agent alive at a time", left with the numbers of plan.md's pool
// sentence (the owner, 2026-09-30, option h): the caps are the Bounds table's row, pinned by E4, and the card
// states them in the words C6 pins.

test("D5 the pool does not depend on the orchestrator's model, and the top pair takes its roles in turn",
  "the pool is the user's, not the session's: an Opus orchestrator that designed for itself and reviewed with a fresh Opus spent the strong tier on the top tier's work while a Fable agent sat unused; one Fable agent, one role at a time, is available to every orchestrator",
  () => all(
    saysIn(plan,
      "You are outside the pool, and the pool is the same whatever you are",
      "the top pair, the Fable agent and the Astra agent the page's [Bounds](../SKILL.md#bounds) allow",
      "each taking the top-row roles in turn, architect for one task and judge for the next",
    ),
    shows(/^\| plan \| design: the Fable agent, whatever your own model \|$/m),
  ));

test("D7 a Fable agent never spawns Fable, and only the orchestrator or a foreman it launched launches Fable agents",
  "a top agent that may spawn its own top agent makes the cap of one unenforceable one level down, where nothing is counting; stated without \"agent\" the rule also read as forbidding a Fable orchestrator the one Fable agent the pool promises it; the foreman, an Opus agent that runs the plan, may take that one Fable agent (the owner, 2026-09-26)",
  () => says("a Fable agent never spawns Fable", "only you, or a foreman you launched, launch Fable agents"));

test("D8 effort is chosen per agent below the top row, and low effort only for mechanical Sonnet stages in a Workflow",
  "measured 2026-09-17: two Luna read agents at an inherited xhigh took 480 and 557 s and 1.2M and 2.3M tokens for a ledger and a grep task. The earlier rule inherited the user's effort everywhere because, measured on codex-cli 0.153.4, no effort level bought the evidence guarantee an exception once claimed; this rule claims cost, not evidence. The bulk row left `low` after issue #22's pilot (11 false positives in 22 at low, 1 in 13 at medium, tokens within 5 %); `high` over `medium` is the owner's choice from the writing replication's pilot",
  () => {
    const prose = all(says("Every Codex agent carries an `EFFORT:` line chosen for its work"), saysIn(plan,
      "Every Codex agent carries an `EFFORT:` line chosen for its work",
      "`high` for the bulk row's extraction, classification and verification",
      "`low` for mechanical work only",
      "only Astra in the top row goes without one and inherits the configured effort, and a model standing in for Astra carries `EFFORT: xhigh`",
      "In a Workflow, `effort: 'low'` is for mechanical Claude Sonnet stages only.",
    ));
    // The negative half: the old rule, which a later edit could restore beside the new sentences.
    if (/Send no `EFFORT:` line/.test(text + plan.text)) return "the page or plan.md tells the orchestrator to send no EFFORT line again";
    return prose;
  });

// ------------------------------------------------------------------ E: composition and bounds

test("E1 the mode replaces the sibling's \"nothing\" row: half beyond the implementers, rounded up, and implementers are not duplicated",
  "this is the one composition rule the mode changes, and it changes exactly one row; stated loosely it either duplicates every implementer or quietly drops the Codex side entirely",
  () => saysIn(plan,
    "This mode replaces one row of the sibling's",
    "the \"nothing\" row: when the user states no allocation, half the agents beyond the implementers, rounded up, are Codex",
    "Implementers are not duplicated: one per task",
  ));

test("E2 cross-review runs both directions",
  "one-directional cross-review checks only one side's bias. The brief of a cross-review agent, the diff's path in `TASK:` beside the requirement, the owning unit and its consumers, is the cross-reviewer row of roles.md, pinned by E10, and its five fields are the roles preamble's",
  () => saysIn(plan, "a Claude implementer's diff to a Codex agent and a Codex agent's diff to a Claude agent"));

test("E3 the composition table is linked at its anchor",
  "everything the mode does not replace lives in that section; a link to the page without the anchor sends the reader to the top of a manual and the rules that still hold go unread",
  () => showsIn(plan, /\[composition table\]\(\.\.\/\.\.\/codex\/SKILL\.md#composition\)/));

test("E4 the three bound rows: alive at once, the top pair, the Codex write agent per directory",
  "these are the numbers that decide whether a fan-out runs or deadlocks: a second Codex write agent on one directory exits 10 before its turn ever runs",
  () => shows(
    /^\| alive at once \| 6, Claude and Codex together, the top pair counted in \|$/m,
    /^\| Fable agents, Astra agents \| 1 each, alive at a time \|$/m,
    /^\| Codex write agents per directory \| 1: a second on the same directory exits 10 at once, before its turn runs \|$/m,
  ));

test("E5 the three scaling rows: simple, comparison, complex",
  "the agent count is the decision a coordinator makes first and reasons about least; without the bands a simple task gets a panel and a complex one gets a single agent",
  () => shows(
    /^\| simple task \| 1 worker; the completeness critic beside it, not counted, and its verifier is you under the redirect rule or one agent when the check cannot run there \|$/m,
    /^\| comparison or design \| 2 to 4 agents \|$/m,
    /^\| complex \| 5 agents or more, launched in batches inside the alive cap \|$/m,
  ));

test("E6 a writer runs the checks that read what it changed, and the deciding run of them comes from elsewhere",
  "a writer iterating against its own suite is how a green run gets produced by the same context that produced the bug, and a whole suite run after a change none of its checks reads spends minutes proving nothing (measured 2026-09-29: seven full runs of about six minutes each after page, ledger and rebase changes that five suites of a few seconds read); the rule keeps the iteration, moves only the verdict, and ties both to the files changed",
  () => all(
    saysIn(plan, "split by file ownership, as Claude agents on one live tree or as Codex agents in separate worktrees, never two Codex write agents on one directory"),
    saysIn(results, "stop the writers, restate the contract, let each owner repair only its own files, then have an agent that wrote neither verify the combined tree"),
    says(
      "nobody changes what they share: no stash, branch switch, reset, clean or rebase",
      "Run a check only when its result can change what happens next: a writer runs the checks that read the files it changed while it iterates, and the evidence that decides is those same checks run once on the tree that goes out, by an agent that did not write the code or by you under the redirect rule; a brief names those checks, not the whole suite.",
    ),
  ));

// ------------------------------------------------------------------ F: mechanism and verification

test("F1 a Codex agent is one Agent call of the shipped codex-agent type, and a Workflow script gives a Codex agent that type",
  "Workflow is for the chain a script must decide; a batch of independent Claude agents runs as Agent calls so each agent's end reaches the orchestrator (measured 2026-09-08: a Workflow hid an agent's exit for nine minutes); and the wrapper is the shipped agent entrust:codex-agent, which is what the agent map shows (measured 2026-09-12: only an Agent call has a card there, Stop on it reaches the driver, a message continues it), so a page that sent the agent anywhere else would lose the card or double the wrapper's context. The script's own signatures, `agent`, `pipeline` and `parallel`, are the workflow-authoring skill's, which plan.md has the coordinator load, and are no longer copied here (2026-09-30)",
  () => {
    const prose = all(
      says(
        "A Codex agent is one Agent call, the sibling's `One call` verbatim",
        "`<REPORT>` is `<run>/<agent>/report.json` under the run directory above, and `<DIR>` the agent's directory, `agent/` beside it.",
        "Launch independent Claude agents as background Agent calls, one notification each",
        "A subagent's final text is its return value, not a message to a human",
      ),
      saysIn(plan,
        "authorises Workflow",
        "Load the `workflow-authoring` skill before writing the script when the session lists it.",
        "a Codex agent's `agentType` is `entrust:codex-agent`.",
      ),
    );
    // The negative half: the retired relay took the prompt itself; the shipped wrapper never does, so the
    // page must not hand it one.
    if (/codex-agent[^\n]*(writes|write) the prompt/i.test(text + plan.text)) return "the page hands the wrapper the prompt again";
    return prose;
  });

test("F2 the eight verification bullets, one line each",
  "the list is read while composing a fan-out, so each bullet has to be one glance; a bullet that grew into a paragraph is a bullet that stops being read, and a bullet added or dropped changes the count the fan-out is checked against (measured 2026-09-17: five sentences, three of them bullets here, were deleted from the page in memory and 45 registered cases stayed green). The judge bullet went to the judge row of roles.md (E9, E10), which names the sibling's `EXPECT:` rule for a Codex check; the critic's procedure and the options analysis went to answer.md (F2b), read when the draft is linted; the split critic's and the refuter's brief content went to their rows of roles.md (E10), which the bullets name, and the finding rule to the page's return section (G7) (2026-09-30)",
  () => {
    const section = text.split("## Verification")[1]?.split("\n## ")[0] ?? "";
    const bullets = section.split("\n").filter((l) => l.startsWith("- "));
    if (bullets.length !== 8) return `the Verification list has ${bullets.length} bullets, not eight`;
    // The owner, 2026-09-27 (option B): "could not check" is not "false", so the old default must not return.
    if (/defaults to `refuted`|`refuted` when (it is )?uncertain/.test(section)) return "a refuter defaults to refuted when uncertain again";
    return shows(
      /^- Scout inline first: the work-list is yours, before any fan-out\.$/m,
      /^- Critique the split before the fan-out: a top-row agent reads the decomposition, not the subject; twenty agents on a bad split agree and are all wrong \(\[measured [\d-]+\]\(references\/incidents\.md#the-split-critique\)\)\. It returns the corrected split as a file, the split critic row of \[roles\.md\]\(references\/roles\.md\)\. No worker brief exists before that file: each is written from it and names its path, and before a worker launches you check the files and interfaces its brief touches against the file's owners\.$/m,
      /^- (Open|Read) one assembled brief whole before (the|any) fan-out; check its input paths in the agent's planned tree, its output paths against the agent's writable roots, its item count and each quoted claim against its source\.$/m,
      /^- Adversarial verify: a refuter returns `refuted` when its check ran and contradicted the claim and `unknown` when its decisive check could not run, never `refuted` for want of evidence; its brief is the refuter row of \[roles\.md\]\(references\/roles\.md\)\.$/m,
      /^- Perspective-diverse verify: vary the angle across verifiers instead of N identical refuters\.$/m,
      /^- Read a unanimous fan-out as evidence about the prompt first: open one return whole before you trust the tally \(\[measured [\d-]+\]\(references\/incidents\.md#nineteen-of-twenty-on-one-broken-path\)\)\.$/m,
      /^- Recommend only what an analysis stands behind: for each item the user must decide, the options analysis \[answer\.md\]\(references\/answer\.md#a-recommendation\) describes; an item with no such analysis goes to the user as a question with the options known so far, never as a recommendation\.$/m,
      /^- No silent caps: name every agent, check or item you dropped\.$/m,
    );
  });

test("F2b answer.md carries the options analysis behind a recommendation and the completeness critic's procedure, each one paragraph",
  "both are read at the moment the answer is drafted, and each is a procedure the coordinator follows step by step: the analysis's criteria and who relies on what (the owner, 2026-09-29: 9 of 16 shallow recommendations lost to the analysis), and the critic's frozen draft, digest, cited hunks and read count (#15 F4, P8b; measured 2026-09-29: the fourth and fifth reads of a report found nothing new). A paragraph that lost a clause is a step the coordinator skips",
  () => showsIn(answer,
    /^Recommend only what an analysis stands behind\. For each item the user must decide: the problem, what it costs the user, two or more options with closing it among them, each judged by minimalism \(removing beats adding\), no crutches \(the cause is fixed where it arises, never compensated downstream\) and clean architecture \(each fact has one owner and is defined in one place, a page says what the code does\); an outside critic on each recommendation, and a top-row judge where the two disagree\. Each option names what it removes or moves and who relies on it: users, coordinators, tools, tests, leftover state; what stays and how a user finds it is made to happen or `unknown`\. An item with no such analysis goes to the user as a question with the options known so far, never as a recommendation\.$/m,
    /^Completeness critic at the end: one fresh strong-row reader (chosen|selected) by the agreed composition and named in the plan, given the user's request, the final answer and its evidence once, before the answer goes out, never per return; it returns done, partial or not done with what is missing, unverified or unread, and the answer carries its verdict\. What it reads is the linted draft, frozen with a manifest beside it: `shasum -a 256` over the draft, every artifact it cites, the run's ledger and the runner's log behind each number it states\. The critic returns the manifest's sha256 as the first line of its `evidence`\. Before the answer goes out, compute the manifest's sha256 again and compare it with the critic's, and run `shasum -a 256 -c` on the manifest: a different digest or a failed check voids the verdict, and the critic reads again\. Freeze the first draft after the last owner decision and the last return, so the first read covers the whole answer\. For each gap the critic writes the fix into a copy of the draft under its temporary directory and returns the copy's path and one diff hunk per gap, each citing the line of a return or artifact it rests on and changing nothing outside the gap\. Take the copy whole, or without the hunks you object to, and send each objection with its source into the critic's next read; the citations stay in its return, never in the draft, and you never restate a fix in your own words\. A later read covers the changed lines, the lines that state the same facts, and the rest for anything they contradict\. Count the reads of one answer or publication across its drafts, voided ones included: after the third, or after two that repeat the same gap, take the critic's copy, name its remaining gaps as open in the answer, or in a publication's own open items, lint it and send it without another read \(measured [\d-]+: of a report's five reads, the fourth and fifth found nothing new in its subject\); the page's fix rounds under Verification, with their two-round limit, escalation and stall, are not these reads\. A `not done` verdict means you fix the answer or name the gap in it, or in a publication's own open items\. A publication \(a README, a changelog, a synthesis\) is read the same way before it goes out\.$/m,
  ));

test("F3 two rounds of fix and cross-review, then escalate",
  "without a bound the fix loop is where a run spends its budget; the escalation names where the round after the second one goes, the top pair first and the user last",
  () => says("Fix, then cross-review, at most two rounds; then escalate to the Fable agent or the Astra agent, and to the user only when that round fails too."));

test("F4 every row of the Result table: what this mode adds to the sibling's reading of a result",
  "this table is read at the one moment judgement is worst, when an agent has just failed; a missing row is a relaunch that duplicates a live run, or a gate verdict retried until it costs real money. What the sibling's \"Reading the result\" and the driver's --help-all already say, the stderr file's reason, `out.json`, the two shapes of exit 2 and 4, the partial of a cut and reading the answer, is theirs; each row keeps this mode's own step, the `FILE=missing` row keeps the receipt's precondition beside its relaunch, since the sibling's section lies where a coordinator reads it only by path (the owner, 2026-09-30), and the `exitCode: 10` row keeps the survivors check, which the sibling states under stopping an agent and a fresh reader at a held lock found there and did not apply (Sonnet R1, 2026-09-30)",
  () => showsIn(results,
    /^\| `FILE=missing`, or `PATH=taken` \| Read `RECEIPT=` first: an `approvals=` token whose first number is not 0 says a command ran with your rights and no report says how it ended — that count is a decision, not an execution outcome\. Read `<DIR>\/approvals\/` and check the tree and whatever the command touched before any relaunch, and never relaunch a prompt that would ask for the same thing again\. Only once that is clear, treat the rest as unknown and relaunch once, same rights, under the agent's next report path where work remains\. With `DRIVER_EXIT=unknown` nothing ended it: `kill -0 <pid>` with the pid on the first line of the stderr file says whether it is still running \|$/m,
    /^\| a stderr file naming no driver \| report it; no relaunch fixes an install \|$/m,
    /^\| `exitCode: 3`, a cut \| if the work is unfinished, continue that thread once with `RESUME:`, under the agent's next report path \|$/m,
    /^\| `exitCode: 10` \| a held lock or a busy thread: read `error` and the stderr file, wait for the holder, then run again; not a retry\. A holder that waits on your own decision has an `ASK=` in your poll: answer it before you wait on the holder\. Before a second writer enters a directory where a command was approved, check for its survivors yourself: `pgrep -fl '<the approved command>'` and wait for it — the lock does not prove they are gone \|$/m,
    /^\| exit 2 or 4 \| Exit 2 WITH a `turnStatus` is a turn the server rejected: read `turnError`\. A `DRIVER_EXIT=2` beside `PATH=taken` says the path was already taken: nothing of this run reached the file, and the report there is an earlier run's \|$/m,
    /^\| exit 4 with a `turnStatus` \| the server died mid-turn or the report was not delivered: the report is complete, read it as a gate verdict \|$/m,
    /^\| any other non-zero `exitCode` with an answer \| a gate verdict: do not retry \|$/m,
    /^\| a Claude agent that returns `blocked` \| do not retry, report it \|$/m,
  ));

// F5, the Mechanism sentence on the wrapper's description, left with the sentence (2026-09-30): the sibling's
// One call states it whole, and the template "Codex <short name> <id>: <task in a few words>" stays in the tag
// bullet, where C13 pins it and agent-contract.test.mjs pins it on both pages as a pair.

test("F6 the one agent you wait for is a foreground call, background agents are waited for by their notifications and never blocked on, one poll over every alive Codex agent's exit and approvals/pending markers says DONE= or ASK= and is launched again after, and a headless turn never ends with an agent alive",
  "Claude Code 2.1.277 removed the tool the page used to block on (E50), and the replacement its changelog names, the task's output file, is an agent's whole transcript; a background agent's return arrives as its message and then its notification with nothing called (measured 2026-09-26), a poll on the driver's markers notifies with one line even after a wrapper handed back RUNNING= (2026-09-27), an interactive session takes each completion as a new turn (2026-09-27), and a headless session kills its background tasks with the turn (2026-09-08), so there the wait is a foreground call, whose hand-back arrives inside the turn (2026-09-17). The poll is one task over every alive agent's exit and pending markers that exits on the first marker rather than looping on, because a request that arrives after a RUNNING= hand-back has no call in flight to hand it back",
  () => all(
    says(
      "Wait for the agents you launch in the background, Claude or Codex, never on them: each one's return arrives on its own, its message first and its completion notification after (measured 2026-09-26).",
      "Never read an Agent task's output file for that return: it is the agent's whole transcript.",
      "For the Codex agents in the background, also launch one poll as a background Bash task over every alive one's `exit` and `approvals/pending` markers, one wake per event:",
      "while :; do for d in <DIR>...; do [ -s \"$d/exit\" ] && { echo \"DONE=<id>\"; exit 0; }; [ -s \"$d/approvals/pending\" ] && { echo \"ASK=<id>\"; exit 0; }; done; sleep 5; done",
      "one task for the whole batch, not one per agent, and it exits the moment it prints either marker rather than looping on",
      "In an interactive session you may end your turn with agents alive: they go on, and each completion arrives as a turn of its own (measured 2026-09-27).",
      "A headless session ends with the turn and its background tasks are killed with it (measured 2026-09-08), so there never end a turn with an agent alive: launch each agent in the foreground, and its hand-back arrives inside the same turn ([measured 2026-09-17](../codex/references/incidents.md#foreground-background-and-the-ceiling)).",
      "in the background when agents run side by side and you work while they do, in the foreground for the one agent you wait for and for every agent in a headless session.",
      "`DONE=<id>` is that agent's own exit marker: read its report as [results.md](references/results.md) says",
      "`ASK=<id>` is that agent's own request waiting on your decision, as a wrapper's hand-back may be: decide it as [approvals.md](references/approvals.md) says.",
    ),
    saysIn(results, "`DONE=<id>` is that agent's own exit marker: it says the run has ended even after a `RUNNING=` hand-back, and you read the report file after it (measured 2026-09-27)."),
    saysIn(approvals,
      "`ASK=<id>` is that agent's own request waiting on your decision, and the wrapper's own hand-back may carry the same waiting block instead of the nine lines: read it whole from that hand-back or with `--pending`, decide it as the rule below says, send the wrapper the very same message block again, then launch the poll again over the agents still alive and keep waiting",
      "an armed agent is launched and waited for like any other",
    ),
  ));

test("F7 the approval rule: run as you with no sandbox, approve nothing unread, what to approve, what goes to the owner",
  "this is the sentence a coordinator applies at the moment of deciding a live request, verbatim from the design's own rule paragraph; a paraphrase here is a rule nobody agreed to",
  () => saysIn(approvals,
    "Approving it runs the command as you, with no sandbox, the way every Claude agent in this session already runs; the line for Codex is not stricter than for Claude",
    "approve nothing you have not read",
    "Approve a request that is non-destructive and in the plan's direction",
    "Take to the owner, while the turn waits, a request that is destructive or irreversible, or outside the plan",
    "In a headless run decline it and name it in the answer",
    "When you retell an approval, say what the entry's `outcome` says",
  ));

test("F7b a request is decided from the waiting result through the sibling's --decide call, and the page does not restate that call",
  "the accept's heredoc on a delimiter of the coordinator's own, the ID's shape, the copy from --pending after a refused restatement and the decline after a blocked accept are the sibling's, pinned there by agent-contract.test.mjs; a second copy here drifted from it and cost every call its words after a compaction (E77)",
  () => {
    const said = saysIn(approvals, "Decide from the waiting result the wrapper handed back, and answer with the sibling's `--decide` call.");
    if (said !== true) return said;
    return !/ACCEPT_|digits, a hyphen and eight hex characters/.test(flat + approvals.flat) || "the page or approvals.md restates the sibling's accept call again";
  });

test("F8 the synthesis rule: one sentence per cause and what avoids it next time",
  "the three causes are what the driver records, so a synthesis that skips one leaves the run's own why unexplained. A command request is one cause, because an attempt the sandbox stopped can leave no trace in the stream and the driver no longer guesses sandbox from policy (E65); no plan line changes it either way",
  () => {
    const said = saysIn(approvals,
      "When the run had approvals, the synthesis says why in one sentence per cause and what avoids it next time: `rights`, the driver answered and nothing changes",
      "`asked`, Codex asked before running the command, and nothing on our side changes it",
      "`outside`, the plan needs a `WRITABLE:` line or a different agent for that file",
    );
    if (said !== true) return said;
    return !/`sandbox`, the tool|`policy`, Codex/.test(flat + approvals.flat) || "the page or approvals.md still names the causes sandbox and policy";
  });

// F8b, which pinned the page's paraphrase of --pending's markers and of STALE=, is gone with the paragraph
// (2026-09-30): the launcher's --help states both under --pending, and the markers the accept copies are the
// sibling's, pinned by agent-contract.test.mjs on the accept block.

test("F9b never launch under another state directory while an armed agent is alive",
  "containment is the driver's own inode check against one state directory; a peer under a different one is outside what that check can see, so the boundary is a page sentence, not a mechanism",
  () => says("Never launch an agent under another state directory while an armed agent is alive"));
test("F10 the critic's manifest, made as the page writes it, catches a changed cited artifact, and the digest comparison catches a manifest rewritten after the change",
  "#15 F4 and P8b: the critic read one version and another went out (T3, T8 post-critic corrections); a digest over the draft and every artifact it cites is the version link. `shasum -c` alone passes a manifest rewritten over the changed files, so the send rule also compares the manifest's digest with the one the critic returned (R1, 2026-09-27), and this case shows why both are needed",
  () => {
    // The two commands are read out of the critic's paragraph in answer.md, so a text that changed them is
    // what runs here.
    const bullet = answer.lines.find((l) => l.startsWith("Completeness critic")) ?? "";
    const spans = [...bullet.matchAll(/`([^`]+)`/g)].map((m) => m[1].trim().split(/\s+/));
    const make = spans.find((a) => /sum$/.test(a[0]) && !a.includes("-c"));
    const check = spans.find((a) => /sum$/.test(a[0]) && a.includes("-c"));
    if (!make || !check) return "the critic bullet names no digest command and no check of it";
    if (spawnSync(make[0], [...make.slice(1), "/dev/null"]).status !== 0) return skip(`no ${make[0]} on this machine`);
    const dir = tempDir("orchestrate-critic.");
    const draft = path.join(dir, "draft.md"), cited = path.join(dir, "evidence.txt"), manifest = path.join(dir, "manifest.sha256");
    fs.writeFileSync(draft, "Opus W1 changed two pages.\n");
    fs.writeFileSync(cited, "all 70 passed\n");
    const made = spawnSync(make[0], [...make.slice(1), draft, cited], { encoding: "utf8" });
    fs.writeFileSync(manifest, made.stdout);
    const problems = [];
    if (made.stdout.trim().split("\n").length !== 2) problems.push(`the digest command made ${made.stdout.trim().split("\n").length} manifest lines for two files`);
    if (spawnSync(check[0], [...check.slice(1), manifest]).status !== 0) problems.push("the manifest does not verify the draft it was made on");
    const digest = () => spawnSync(make[0], [...make.slice(1), manifest], { encoding: "utf8" }).stdout.split(/\s/)[0];
    const critics = digest();
    fs.appendFileSync(cited, "one more line\n");
    if (spawnSync(check[0], [...check.slice(1), manifest]).status === 0) problems.push("a changed cited artifact passed the manifest check");
    // The manifest rewritten over the changed files: its own check passes, and only the digest comparison sees it.
    fs.writeFileSync(manifest, spawnSync(make[0], [...make.slice(1), draft, cited], { encoding: "utf8" }).stdout);
    if (spawnSync(check[0], [...check.slice(1), manifest]).status !== 0) problems.push("the rewritten manifest does not pass its own check, so this case no longer shows the gap");
    if (digest() === critics) problems.push("the rewritten manifest has the digest the critic returned");
    if (!/compare it with the critic's/.test(bullet)) problems.push("the critic bullet no longer compares the manifest's digest with the critic's");
    fs.rmSync(dir, { recursive: true, force: true });
    return problems.length === 0 || problems.join("; ");
  });

test("F11 a continuation or a relaunch goes under the agent's next report path, and the launcher admits that path for a listed agent once the run before it has ended",
  "#15 F14's refusal must not stop the listed agent's own continuation: with a plan registered, a RESUME: after a cut, a relaunch after PATH=taken and every advisor question after the first would each have become a stop for an amendment (R3, 2026-09-27, reproduced); the page's path form and the launcher's matcher have to be the same form",
  () => {
    const said = saysIn(results, "A continuation or a relaunch goes under the agent's next report path, `<run>/<agent>-<n>/report.json`, which a registered plan admits for a listed Codex agent once the run before it has ended.");
    if (said !== true) return said;
    if (/report path of its own|a fresh report path/.test(flat + results.flat)) return "the page or results.md still sends a continuation to a report path of its own";
    const launcher = path.join(SCRIPTS, "agent-run.mjs");
    const dir = tempDir("orchestrate-next.");
    const runDir = path.join(dir, "run");
    const problems = [];
    const plan = run(launcher, ["--plan", "--run-dir", runDir], { input: "S1 | sol | cross-reviewer | nothing | 200000\n" });
    if (plan.status !== 0) { fs.rmSync(dir, { recursive: true, force: true }); return `--plan exited ${plan.status}: ${plan.stdout.trim()}`; }
    const prompt = "MODEL: sol\nTASK: review the diff\n";
    // The temporary directory is the state directory too: --new puts every agent's mailbox inside it.
    const next = (n) => run(launcher, ["--new", "--report-file", path.join(runDir, n === 1 ? "S1" : `S1-${n}`, "report.json")],
      { input: n === 1 ? prompt : `RESUME: last\n${prompt}`, env: { ...process.env, ENTRUST_STATE_DIR: dir } });
    if (next(1).status !== 0) problems.push("the listed agent's first report path was refused");
    const early = next(2);
    if (early.status === 0) problems.push("S1-2 was admitted while S1 had not ended");
    fs.writeFileSync(path.join(runDir, "S1", "agent", "exit"), "0\n");
    const later = next(2);
    if (later.status !== 0 || !/^PROMPT=/m.test(later.stdout)) problems.push(`S1-2 after S1 ended: exit ${later.status}, ${later.stdout.trim().split("\n").at(-1)}`);
    fs.rmSync(dir, { recursive: true, force: true });
    return problems.length === 0 || problems.join("; ");
  });

test("F12 what follows the frozen draft is one verdict line, counted in the draft's word bound, and the page's linter holds that bound over the draft and the line together",
  "the live gate, 2026-09-27 (case 5): the page said both that the answer carries the critic's verdict and that the frozen, linted draft goes out, and the coordinator appended a verdict paragraph and an unrelated one after the lint, so 474 words went out against the linter's 400 and the critic had read neither",
  () => {
    const said = says(
      "What goes out is the draft's text and one line after it, the critic's verdict, \"<Model> <id>: done\", \"partial\" or \"not done\", counted in the draft's word bound.",
      "Nothing else follows the lint, no paragraph on the critic's return included: anything you must add is linted and frozen again, and the critic reads again.",
    );
    if (said !== true) return said;
    const cmd = recipe("lint-draft.mjs");
    if (!cmd || !fs.existsSync(cmd.file)) return "the page's linter is not there to hold the bound";
    const dir = tempDir("orchestrate-verdict.");
    const problems = [];
    // "Opus C1: not done" is the longest verdict line, four words; the linter's default bound is 400.
    const answer = (words) => { const f = path.join(dir, `a${words}.md`); fs.writeFileSync(f, `${Array(words).fill("word").join(" ")}\n\nOpus C1: not done\n`); return f; };
    const fits = run(cmd.file, ["--agents", "Opus C1", answer(396)]);
    if (fits.status !== 0) problems.push(`396 words and the verdict line exited ${fits.status}: ${fits.stdout.trim().split("\n")[0]}`);
    const over = run(cmd.file, ["--agents", "Opus C1", answer(397)]);
    if (over.status !== 1 || !/^LINT=length:/m.test(over.stdout)) problems.push(`397 words and the verdict line exited ${over.status} with no LINT=length: line`);
    fs.rmSync(dir, { recursive: true, force: true });
    return problems.length === 0 || problems.join("; ");
  });

test("F9 the page and its references name no TaskOutput",
  "Claude Code 2.1.277 removed TaskOutput and a session on it or later lists no such tool (E50; measured 2026-09-26 and 2026-09-27), so any sentence that names it sends the orchestrator to a tool it does not have",
  () => {
    const hits = [page, ...REFS].flatMap((s) => s.lines.flatMap((l, i) => (l.includes("TaskOutput") ? [`${s.name}:${i + 1}`] : [])));
    return hits.length === 0 || `TaskOutput is named on ${hits.join(", ")}`;
  });

// ------------------------------------------------------------------ G: the agent's return, the run directory

test("G1 the five template lines, their indentation, and no BRIEF: line",
  "the template is pasted into a brief, so its indentation is the thing that survives or does not; `BRIEF:` on top of it clips the answer at 20 lines, which is the template's own bound overruled. The page no longer carries the schema inline: the shipped file is the one copy, pinned by package.test.mjs (2026-09-30)",
  () => {
    const problems = [];
    const raw = shows(
      /^ {4}status: {4}done \| partial \| blocked$/m,
      /^ {4}result: {4}at most 30 lines$/m,
      /^ {4}evidence: {2}what ran, with counts; a test without its count is not evidence$/m,
      /^ {4}artifacts: paths$/m,
      /^ {4}open: {6}questions and risks$/m,
    );
    if (raw !== true) problems.push(raw);
    const prose = says("and send no `BRIEF:` line");
    if (prose !== true) problems.push(prose);
    return problems.length === 0 || problems.join("; ");
  });

test("G8 a Codex agent names the shipped five-field schema file, and a field past its cap goes whole into a file with a summary left in the field",
  "#15 F20b: a coordinator wrote the schema by hand each run and once handed the review schema instead; P11a: returns overran \"at most 30 lines\"; the shipped file is the easy path, its caps are checked by the driver, and the overflow keeps the whole text recoverable (09, D16)",
  () => all(says(
    "A Codex agent's `OUTPUT_SCHEMA:` line names the five-field schema file the sibling ships, the path its `OUTPUT_SCHEMA:` row gives, and you read the fields from `answerJson` in its report file.",
    "A field past the schema's cap goes whole into a file under the agent's temporary directory, named in `artifacts`, and the field keeps a summary with every material finding.",
    "A brief that wants a longer return names a copy of the schema file with larger caps.",
  ), (() => {
    // The path, with ${CLAUDE_SKILL_DIR} resolved the way Claude Code resolves it in this body.
    const named = /The file is `\$\{CLAUDE_SKILL_DIR\}\/([^`]+)`, strict/.exec(flat)?.[1];
    if (!named) return "the page does not name the schema file by a ${CLAUDE_SKILL_DIR} path";
    return fs.existsSync(path.join(SKILL_DIR, named)) || `the page names ${named}, which is not beside the skill`;
  })()));

test("G3 the run directory: its path, why it needs no .gitignore, kept after the task, and what a Codex agent's artifacts are",
  "one directory per run is what keeps an agent's artifacts findable and out of the tree the run works in; the plugin's data directory is outside every repository, so nothing has to be ignored and nothing lands in a payload, and `.claude/` is the one path whose writes prompt however the permissions are set",
  () => says(
    "The run directory is `<state>/orchestrate/<project-slug>/<run>/`, `<state>` the driver's state directory (`${CLAUDE_PLUGIN_DATA}`)",
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
    "costs a refused write and exit 6 ([measured 2026-09-08](references/incidents.md#a-read-agent-asked-for-a-file))",
  ));

test("G6 the launcher and the driver make the run directory, the coordinator writes nothing there, and a Claude agent's artifact is its text",
  "a headless session refuses a Write, a `mkdir` and a redirect under the plugin's data directory as a sensitive file, with no prompt anyone can answer, so a coordinator told to create the directory itself stops at the first agent; the driver, handed the path as an argument, is not refused (measured 2026-09-08), and a Claude agent pointed at that directory hits the same wall the coordinator did",
  () => says(
    "The launcher and the driver create it, through `--report-file`, and it is what they make of it: a report per agent and, beside it, the launcher's `agent/` with the four files of the run, and the plan the launcher registered; nothing else is written there",
    "Never run `mkdir`, Write or a shell redirect under that data directory yourself, because a headless session refuses each of them as a sensitive file with no prompt anyone can answer ([measured 2026-09-08](references/incidents.md#writes-under-the-data-directory))",
    "and never write a decision file by hand: `--decide` is the one path",
    "A Claude agent's artifact is its returned text, and a file it must leave goes under `$TMPDIR` with the path in that text",
  ));

// ------------------------------------------------------------------ H: the 2026-09-17 research round (plugins/entrust/research/2026-09-17-orchestration-practices/)
// These cases pin the rule where the words allow it (an alternation over the words that carry it, a
// negative half where the rule forbids something); they are still text pins, not a reading of the page.

test("B7 the page and its references never tell the orchestrator to grade its own work",
  "the opposite of B5 can be added anywhere on the page without touching B5's sentence: 'grade your own work' outside its negation, or an instruction to skip the independent review; this case reads those forms wherever they land. It cannot read every paraphrase, so B5 and a human reader stay the other half",
  () => {
    const problems = [];
    for (const s of [page, ...REFS]) {
      for (const m of s.text.matchAll(/(grade|verify|review|judge)\w* (your|its|their) own (work|edits|code|diff)/gi)) {
        const before = s.text.slice(Math.max(0, m.index - 30), m.index);
        if (!/\b(never|not|nobody|no one)\b/i.test(before)) problems.push(`${s.name}: "${m[0]}" with no negation before it`);
      }
      if (/\b(ignore|skip|drop|omit)\b[^.\n]{0,40}\b(independent|fresh|separate)\b[^.\n]{0,20}\b(review|verif\w*)/i.test(s.text))
        problems.push(`${s.name} tells the orchestrator to skip the independent review`);
    }
    return problems.length === 0 || problems.join("; ");
  });

test("C9 every alternative is numbered with its cost, and the plan says what \"go\" selects",
  "a bare word of approval over a fork the plan had left open was read as assent three times (30a:204 on 2026-09-12, 30a:848 on 2026-09-13, 426:92 on 2026-09-16) and an option shown without its cost was read as free (426:1214, 2026-09-17); numbered, priced and with the selection stated in the plan, \"go\" is an answer the user gave knowingly, and nothing is selected by an undisclosed default",
  () => showsIn(plan,
    /Number each (alternative|fork|option|choice), show its cost and mark the recommendation/,
    /(state|say|write) in the plan what "go" selects/i,
  ));

test("C10 the plan states expected tokens by tier and role, from comparable runs, and the page carries no tariff",
  "the user's cost stop came mid-flight (a 51-agent wave, 2026-09-07) and an Astra ran at 1 % quota (2026-09-11); an estimate in the plan moves that stop before \"go\". A fixed number on the page would be a pooled median mixing roles and task shapes (Luna 13.6 k for a recognition read, 742 k for a tree verification), so the line must carry none",
  () => {
    const prose = showsIn(plan, /State expected tokens by tier and role in the plan/, /name the comparable runs behind each estimate/, /mark unmeasured roles `unknown`/);
    if (/State expected tokens[^\n]*\d/.test(plan.text)) return "plan.md's estimate line carries a number where it should carry an estimate";
    return prose;
  });

test("C10b the bulk row is estimated per unit and again after the pilot, and the plan's per-agent stop line halts further launches",
  "issue #22's bulk row was planned at 25–30M and spent 38.7M, pilots and re-runs included, with one agent at 2.09M; the replication's per-part forecast with a relaunch margin came within about 6 %. The stop line is a plan line, not a budget: it fires when an agent's report arrives, so it can stop only the launches after it, and 0.8.0 removed the driver's budget on purpose",
  () => saysIn(plan,
    "Estimate the bulk row per unit: a comparable unit's tokens times the units, plus the pilot and a margin for re-runs, and estimate it again after the pilot.",
    "The plan states a stop line of three times the pilot's median tokens per agent: an agent whose report's `tokenUsage` total passes it stops further launches until the user has seen a new estimate.",
  ));

test("C11 the commands each check needs are checked against planned rights and environment before the plan, and unmet prerequisites go into the plan",
  "a review turn spent 2.65 M tokens and left its decisive check unrun because the sandbox could not complete it (sol-n2, 2026-09-17), and ten of thirteen agents in one run ended at exit 6 on declined requests; a prerequisite found before launch is a line in the plan, one found after it is a paid turn; the wording reassigns nothing after a refusal, which the sibling forbids",
  () => {
    const found = showsIn(plan,
      /For (each|every) agent, (check|match|list) the required commands against its planned rights and environment/,
      /Probe uncertain prerequisites cheaply; put unmet prerequisites in the plan/,
    );
    if (found !== true) return found;
    // #15 F11 and F19: what the coordinator found reached no brief, and Codex agents wrote to /tmp and fought a
    // VCS daemon; the finding goes into the body line the sibling's Prompt shape defines.
    return saysIn(plan, "and write what you found into a Codex agent's `ENVIRONMENT:` line: what is staged and where, and the daemon or socket a tool needs with the command to run instead.");
  });

test("D9 the bulk count is derived from the units and the plan says why that many",
  "eighty agents were launched on the word \"bigger\" against a page that already said six alive (2026-09-11) and a wave of fifty-one was stopped by the user for its cost (2026-09-07, before any cap); a derived count is one the user can weigh before the launch, and the rule claims nothing about yield, which no run has measured. The swarm page says it too, for a swarm (swarm.test.mjs U1); plan.md says it for every bulk batch, a swarm or ordinary Codex agents (the owner, 2026-09-30)",
  () => showsIn(plan, /a count (derived|taken|drawn) from the units with the plan (saying|stating) why that many/));

test("D10 Luna over Haiku carries no price claim",
  "the sentence said \"four times cheaper\" with no Haiku token count anywhere in the record; the preference is the owner's and stays, the price goes, and no other price, ratio or cost word may take its place on that line",
  () => {
    const line = lines.find((l) => l.includes("Prefer Luna to Haiku"));
    if (!line) return "the page no longer prefers Luna to Haiku in the bulk row";
    if (!/\*\*Prefer Luna to Haiku in the bulk row\*\*/.test(line)) return "the preference lost its emphasis";
    if (/cheap|price|cost|\btimes\b|×|\d+x\b/i.test(line)) return `the Luna line carries a price claim again: ${line.slice(0, 120)}`;
    return true;
  });

test("D12 the bulk unit is one part of the material for extraction with a fixed answer schema, or one claim, one address, a verbatim quote, and a closed-set verdict about the subject, never the brief",
  "a bulk verifier scored on its own prompt agrees with itself for the wrong reason (measured 2026-09-12: a broken path in every brief drew the same verdict from nineteen of twenty agents); this sentence is what keeps a bulk verdict about the input rather than the ask, and the 2026-09-17 mutation baseline deleted it with the suite staying green. The bulk rows of issue #22 and of the writing replication were extraction, one part of the material per agent with a shared answer schema, which the verdict alone did not describe",
  () => saysIn(plan,
    "The unit of a bulk fan-out is either one part of the material for extraction, with a fixed answer schema, or one claim, one address, a verbatim quote, and a verdict from a closed set that describes the subject and never the brief",
    "whether an address moved or was wrong is a judgement about your own input, and it stays out of the set",
  ));

test("D13 the bulk row announces its count before spawning, like any other fan-out",
  "the bulk row sits outside the alive cap, which is exactly the row a count could grow in unannounced; the clause was deleted alongside the Luna preference in the 2026-09-17 mutation baseline and the suite stayed green",
  () => says("announce its count before spawning, like any other fan-out"));

test("D14 every bulk fan-out is piloted against a stronger model's marking, and the pilot decides the brief's fixes and the effort",
  "issue #22's pilot chose the effort and exposed a brief that counted process complaints, and the writing replication's first pilot found 12 extras in 22 on the brief as assembled; the split critique reads the decomposition and caught neither. The rule sat in Model tiers because Verification lay past what a compaction kept (E77); it now sits in plan.md, which step 1 reads before the plan is made",
  () => saysIn(plan,
    "Pilot every bulk fan-out before it launches: a stronger model marks a few units, the bulk model runs the same units, and recall, false positives and tokens against that marking decide the brief's fixes and its effort.",
  ));

test("D15 a bulk batch of either unit may run as a swarm the plan proposes, started by the user's go, read by path and launched with the data directory forwarded, each in a run directory of its own; otherwise as ordinary Codex agents",
  "issue #22's 456 Luna runs and the writing replication's collection both launched bulk batches by hand, with no wrapper, and the page named no batch route; the owner then made the swarm a role the planner may propose (2026-09-29), for verdict units and extraction parts alike. The swarm page is user-only, so it is read by path; the launch line forwards the data directory because a Bash shell has none of its own, and a swarm's agent ids cannot be registered in a plan (E90)",
  () => all(
    saysIn(plan, "A bulk batch of either unit may run as a swarm the plan proposes: the card names it with its count and cost, and the user's \"go\" on the plan starts it, as a typed `/entrust:swarm` also does."),
    says(
      "Read [swarm](../swarm/SKILL.md) at `${CLAUDE_SKILL_DIR}/../swarm/SKILL.md` whole with the Read tool",
      "`CLAUDE_PLUGIN_DATA=\"${CLAUDE_PLUGIN_DATA}\" node \"${CLAUDE_SKILL_DIR}/../swarm/scripts/swarm.mjs\" --units <file> --brief <template> --run <run directory> --concurrency <n>`",
      "each swarm in a run directory of its own, since the launcher refuses a swarm's agent ids under a registered plan (E90)",
      "Its unit, its pilot, its count and its effort are set as [plan.md](references/plan.md#a-bulk-row) says, whether the batch runs as a swarm the plan proposed or as ordinary Codex agents launched as Mechanism says.",
    ),
  ));

test("E7 a decisive check runs before any panel, dependent execution stays in one agent, and its verification stays independent",
  "sixteen agents over two naming rounds proposed, reviewed and judged before the check that decided was run (426:973, 426:1208, 2026-09-17), while the two tasks the coordinator kept in its own hands (2026-09-12, 2026-09-16) landed with critics only; the rule orders the check first and keeps the fresh verifier, it does not ban a panel",
  () => showsIn(plan,
    /(Run|Make|Do) (a|the) decisive check before (commissioning|launching|spawning) (a|any) panel/,
    /(Keep|Leave) dependent execution in one agent; keep its verification independent/,
  ));

test("F7 one assembled brief is opened whole before the fan-out, and its input paths, output paths, item count and quoted claims are checked",
  "the split critic reads the decomposition, not the file the generator wrote: a join paired all twelve reports with the wrong paragraph (T1-05, 2026-09-11), a doubled path segment reached all twenty prompts (T1-09, 2026-09-12) and a quoting slip gave each of three agents one set of four (T1-39, 2026-09-17); paths that exist catch only the second, so the check names all three. Issue #22: a write agent's brief put its output one level above its root, the write was refused and the run exited 6, and since 0.22.0 no approval can grant the root mid-run, so the brief is the one place to catch it",
  () => shows(/^- (Open|Read) one assembled brief whole before (the|any) fan-out; check its input paths in the agent's planned tree, its output paths against the agent's writable roots, its item count and each quoted claim against its source\.$/m));

test("F8 two selection rounds on the same blocker are a stall, re-planned for the word, while repair rounds keep their escalation",
  "the two-round rule counts fix rounds; naming rounds each crowned a winner and the same blocker, a collision check no agent had run, came back (426:973, 426:1208), so that rule never tripped; a stall keyed to a repeated blocker trips where a round count does not, and the repair ladder, two rounds then the top row then the user, is untouched",
  () => shows(
    /Between selection rounds, (record|write|note) the candidates rejected, the evidence gained and the remaining blocker/,
    /Two rounds repeating the same blocker are a stall: show a new plan and wait for the word/,
    /Fix, then cross-review, at most two rounds; then escalate to the Fable agent or the Astra agent/,
  ));

test("G7 a verifier's brief names its target and whole scope, its return separates what it checked from what it did not, and a finding is what changes correctness or a stated requirement",
  "a verifier that ran one or two checks and declared the whole passed is the early-victory shape (S1-40); locally the coordinator bounded a clipped 50 k-character report to the parts it had read (426:33, 2026-09-16) where three earlier overclaims from partial evidence were cut by agents (T1-08, T1-12, T1-49). The finding rule stood in the refuter's bullet and covered the cross-review too; it sits here since 2026-09-30, once for every verifying role, and the cross-reviewer row of roles.md points at it (E10)",
  () => shows(
    /A verifier's brief (names|states) its target and the (whole|full) scope it must cover/,
    /its return says what it checked and, in `open`, what it did not/,
    /A finding is (one|what) that changes correctness or a stated requirement, the rest (its|in) `open`/,
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
    const prose = all(
      saysIn(answer,
        "given the user's request, the final answer and its evidence once, before the answer goes out, never per return",
        "returns done, partial or not done with what is missing",
      ),
      saysIn(plan, "A one-agent task has no judgement agent beyond the completeness critic"),
    );
    if (prose !== true) return prose;
    const bullet = answer.lines.find((l) => l.startsWith("Completeness critic"));
    if (!bullet) return "the completeness critic's paragraph is gone from answer.md";
    if (/\b(except|unless|skip|skipped|waived|optional)\b/.test(bullet)) return "the critic's paragraph exempts some run";
    return true;
  });

test("E8 the roles reference is linked from the page and from plan.md's composition",
  "the role set was the tier table's four rows in practice; the reference is where the coordinator's variety lives, and a page without the link never sends anyone there",
  () => all(shows(/\[roles\.md\]\(references\/roles\.md\)/), showsIn(plan, /\[roles\.md\]\(roles\.md\)/)));

test("E11 a Claude agent starts with the CLAUDE.md files and the memory index, and a Codex agent without them",
  "E53, 2026-09-26: an analyst told to work from episodes only and not to open CLAUDE.md or memory had all three attached by the harness; the plugin cannot remove them, so the page says it where roles are assigned",
  () => says("A Claude agent starts with the user's and the project's CLAUDE.md and the memory index in its context, whatever its brief says, and a Codex agent starts without them, so a blind or independent role on the Claude side still sees them."));

test("E9 the roles reference exists with its seven columns, at least fifteen roles, the seven the page relies on, and no write right on a bulk verifier, a swarm reducer or a standing advisor",
  "the page sends the coordinator to references/roles.md for what a role may write and return; a missing file, a table without those columns, a gutted table or a bulk row granted a tree is a reference that misleads",
  () => {
    const roles = read("skills/orchestrate/references/roles.md");
    const problems = [];
    if (!/^\| Role \| What it does \| May write \| Returns \| Spawn it when \| Tier \| Record \|$/m.test(roles)) problems.push("the seven-column header is missing");
    const rows = roles.split("\n").filter((l) => /^\| [a-z]/.test(l));
    if (rows.length < 15) problems.push(`only ${rows.length} role rows`);
    for (const r of ["area scout", "split critic", "refuter", "bulk verifier", "judge", "final reviewer", "completeness critic"]) if (!rows.some((l) => l.startsWith(`| ${r} |`))) problems.push(`no row for ${r}`);
    for (const r of ["bulk verifier", "swarm reducer", "advisor, standing"]) {
      const row = rows.find((l) => l.startsWith(`| ${r} |`));
      if (!row) problems.push(`no row for ${r}`);
      else if (/repository|run directory|live tree|worktree|state directory|data directory|owned files/i.test(row.split("|")[3])) problems.push(`the ${r} row grants a write right on a tree or the data directory`);
    }
    if (!/No role is a phase of one piece of work/.test(roles)) problems.push("the phase-pipeline sentence is gone");
    return problems.length === 0 || problems.join("; ");
  });

test("E10 the roles reference carries what #15 and #16 asked of each role's brief and return",
  "the fix run of 2026-09-27 (07b D7, D10-D12, D19-D23, as amended by 09): each clause is what a brief writer reads off the row — the runner for a verbose command (F9), the split as a file every brief names (F6, Q3a), refuters on clusters with unknown for an unrun check (F5, P8d, the owner's option B), the critic's digest (F4), the cross-review's owning unit (Q3c), the strong reader's stop and its missing-input state (Q3e), the prober's frozen capture (Q3g), the criterion declared before the proposers (Q3j), fixed inputs and unknowns for measurers (Q3k), and the standing advisor from the first decision (F1); and, since the page stopped restating them (2026-09-30), the cross-review brief's diff path, a finding that changes a stated requirement, and the judge's missing check named in open",
  () => {
    const roles = read("skills/orchestrate/references/roles.md");
    const flatRoles = roles.replace(/\s+/g, " ");
    const row = (name) => roles.split("\n").find((l) => l.startsWith(`| ${name} |`)) ?? "";
    const problems = [];
    const want = [
      [null, "Every brief whose commands may print more than twenty lines names the runner, the page's `scripts/capture-check.mjs`, by its absolute path, and the agent quotes each run's `EXIT=` line in its `evidence`."],
      ["split critic", "the corrected split as a file under its temporary directory, naming each unit's owner and every shared interface's one owner; every worker brief names that file"],
      ["split critic", "reads the decomposition, not the subject: what the cut lost, what the wording added, which items are two, which the rights cannot decide"],
      ["advisor, standing", "under `/entrust:advisor`, before the run's first decision; the workers' plan names it"],
      ["cross-reviewer", "against the requirement, the owning unit and its consumers, all named in the brief; a valid change in the wrong unit is a finding"],
      ["cross-reviewer", "the diff's path in `TASK:`"],
      ["cross-reviewer", "findings, as the page's [return section](../SKILL.md#the-agents-return) defines a finding"],
      ["refuter", "`refuted` when its check ran and contradicted the claim, `unknown` when its decisive check could not run"],
      ["refuter", "a shared prerequisite runs once, by one agent, and its receipt goes into every refuter's brief"],
      ["refuter", "attacks one claim, or one cluster the dedup-and-rank made, keeping its origins"],
      ["strong reader", "the decision the answer feeds and the evidence that ends the read; it stops at that evidence"],
      ["strong reader", "a negative result told apart from an input it could not reach"],
      ["live prober", "it takes its baseline capture before any write and never while a writer runs, and freezes it as a file with its sha256, the revision, the mode, the platform, the control it is compared with and the time"],
      ["blind proposer", "after the plan has named the criterion that selects the survivors"],
      ["judge", "the final verdict by the criterion the plan named, which its brief quotes"],
      ["judge", "the verdict and a marked-up artifact, naming a missing check in `open`"],
      ["judge", "use the sibling's [`EXPECT:`](../../codex/SKILL.md#header-fields) rule for a Codex check"],
      ["dedup-and-rank", "merges a wave's returns into clusters of one claim each, keeps every origin on its cluster"],
      ["dedup-and-rank", "before the refutation of a wave's claims"],
      ["completeness critic", "the verdict, the manifest's sha256, the missing items, and the copy's path with one cited diff hunk per gap"],
      ["measurer", "a script over inputs fixed by path and digest, re-runnable by anyone who has them"],
      ["retrospective analyst", "each incident with its trace address, and `unknown` where the trace has none"],
    ];
    for (const [name, phrase] of want) {
      const where = name ? row(name) : flatRoles;
      if (!where) problems.push(`no row for ${name}`);
      else if (!where.includes(phrase)) problems.push(`${name ?? "the preamble"} no longer says: ${JSON.stringify(phrase)}`);
    }
    if (/`refuted` when uncertain/.test(roles)) problems.push("the refuter row still defaults to refuted when uncertain");
    return problems.length === 0 || problems.join("; ");
  });

// ------------------------------------------------------------------ I: the foreman (plugins/entrust/research/2026-09-26-coordinator-practices/)

const FOREMAN = "skills/orchestrate/references/foreman.md";
const foreman = fs.existsSync(path.join(ROOT, FOREMAN)) ? read(FOREMAN) : "";
const foremanFlat = foreman.replace(/\s+/g, " ");
const foremanSays = (...phrases) => {
  if (!foreman) return `${FOREMAN} is missing`;
  const missing = phrases.filter((p) => !foremanFlat.includes(p));
  return missing.length === 0 || `foreman.md no longer says: ${missing.map((p) => JSON.stringify(p)).join(" | ")}`;
};

test("I1 a plan with three workers or more proposes a foreman, and step 2 links its reference",
  "the owner saw every worker's calls in the timeline (2026-09-26); a page that never proposes the foreman leaves that noise in place, and below three workers the extra agent costs more coordination than it saves",
  () => {
    const said = says("A plan with three workers or more proposes a foreman");
    return said !== true ? said : shows(/\[foreman\.md\]\(references\/foreman\.md\)/);
  });

test("I2 the foreman launches every worker in the foreground, and the page says why",
  "a background worker's calls reach the user's timeline past the foreman (measured 2026-09-26: two Bash cards, a hand-back and a text), so a foreman that backgrounds its workers removes none of the noise it exists to remove",
  () => foremanSays("Launch every worker in the foreground", "A worker in the background writes its calls into the user's timeline past you (measured 2026-09-26)"));

test("I3 the user's approval goes down verbatim, and an action approved mid-run goes to a fresh worker",
  "an agent's auto-mode check sees only its own transcript and no agent message is consent (Anthropic's coordinator prompt, Claude Code 2.1.280): two levels below the user a paraphrased or relayed approval is no approval at all",
  () => foremanSays("Quote the user's approval exactly", "an approval you paraphrase does not exist for it", "run it in a fresh worker whose first brief holds the quote and the literal command"));

test("I4 the foreman is Opus in the background, in the foreground in a headless session, may launch the one Fable agent, and never changes the plan",
  "the owner's decisions of 2026-09-26: Opus, not Sonnet, and not Fable, which would hold the one Fable slot for the whole run; the background keeps the orchestrator free for the user, except in a headless session, which kills its background tasks with the turn (measured 2026-09-08); a foreman that changes the plan spends the user's \"go\" on work they never saw",
  () => foremanSays("The foreman is Opus", "launched in the background so you stay free for the user", "(in the foreground in a headless session, whose turn would otherwise end with it alive)", "It may launch the one Fable agent the cap allows", "Never change the plan", "is a hand-back with `status: blocked`"));

test("I5 the foreman cannot load the skill, so its brief names the pages by path",
  "the Skill tool refuses a skill marked disable-model-invocation (E39), so a foreman told to load orchestrate starts without the rules it runs under",
  () => foremanSays("It cannot load this skill", "Name this file, the page and the sibling's page by absolute path in its brief"));

test("I6 a foreman's brief says why and what done looks like, and never hands understanding back",
  "\"based on your findings\" hands the synthesis to the worker (Anthropic's coordinator prompt); a brief without its purpose or its \"done\" leaves the worker to guess how deep to go",
  () => foremanSays("with why the work is needed and what \"done\" looks like", "Never \"based on your findings\""));

test("I7 the foreman's return carries the deviations, the concerns and every artifact path",
  "the orchestrator sees the workers only through this report; a report of what was done alone hides what went differently (Cursor's handoff carries notes, concerns, deviations, findings)",
  () => foremanSays("every deviation from the plan and why", "every concern", "every path the workers' work left"));

test("I8 the roles reference has a foreman row in the strong tier that writes nothing itself and links its page",
  "the roles table is where a coordinator picks a role by its rights; a foreman without a row is a role the table does not know, and one granted a write right would be a writer no one verifies",
  () => {
    const roles = read("skills/orchestrate/references/roles.md");
    const row = roles.split("\n").find((l) => l.startsWith("| foreman |"));
    if (!row) return "no row for foreman";
    const cells = row.split("|").map((c) => c.trim());
    const problems = [];
    if (!cells[3].startsWith("nothing")) problems.push(`may write: ${cells[3]}`);
    if (!/^strong/.test(cells[6])) problems.push(`tier: ${cells[6]}`);
    if (!/\[foreman\.md\]\(foreman\.md\)/.test(row)) problems.push("no link to foreman.md");
    return problems.length === 0 || problems.join("; ");
  });

test("I9 the foreman's brief carries the corrected split's file and the runner's path, and every worker brief names both",
  "the foreman writes the worker briefs, so the split critic's file (#16 Q3a: no brief before the critique) and the runner (#15 F9: floods read whole) reach a worker only if the foreman's own brief carries them",
  () => foremanSays(
    "the run directory, the corrected split's file, the runner's absolute path and what you want back",
    "Write every brief self-contained, from the corrected split's file and naming its path",
    "Name the runner by its absolute path in every worker brief, Claude or Codex, for any command whose output may pass twenty lines, and read the worker's `EXIT=` line as that command's verdict.",
  ));

// ------------------------------------------------------------------ the links

// The page no longer carries the schema inline (2026-09-30): it names the shipped file, whose strict shape and
// caps package.test.mjs pins, and the swarm page's inline copy is held to that file by fragments.test.mjs.

test("every relative link on the page and in its four moment references resolves, inside this repository, to a file and to a heading that exists",
  "the page delegates its whole mechanism to the sibling and to its references by link: a moved file or a renamed section turns the authoritative half of the mode into a 404 that only a reader notices",
  () => {
    const problems = [];
    // GitHub's slug for a heading: lower-cased, punctuation dropped, spaces to hyphens.
    const slug = (h) => h.toLowerCase().replace(/[^a-z0-9 -]/g, "").trim().replace(/ +/g, "-");
    for (const s of [page, ...REFS]) {
      const dir = path.dirname(path.join(ROOT, s.rel));
      for (const [, target] of s.text.matchAll(/\[[^\]]*\]\(([^)\s]+)\)/g)) {
        if (/^[a-z]+:/.test(target)) continue;                                  // an external URL is not this suite's to resolve
        const [rel, anchor] = target.split("#");
        const abs = path.resolve(dir, rel);
        if (!abs.startsWith(ROOT + path.sep)) { problems.push(`${s.name}: ${target} leaves the repository`); continue; }
        if (!fs.existsSync(abs)) { problems.push(`${s.name}: ${target} resolves to nothing: ${abs}`); continue; }
        if (!anchor) continue;
        const headings = [...fs.readFileSync(abs, "utf8").matchAll(/^## (.+)$/gm)].map((m) => slug(m[1].trim()));
        if (!headings.includes(anchor)) problems.push(`${s.name}: ${target}: no "## " heading slugs to #${anchor} (has ${headings.join(", ")})`);
      }
    }
    return problems.length === 0 || problems.join("; ");
  });

process.exit(summarize(await runCases(CASES), CASES.length));
