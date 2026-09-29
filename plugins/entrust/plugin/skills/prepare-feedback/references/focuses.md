# Focuses

Contents: [facts and self-analysis](#facts-and-self-analysis), [version](#version), [run](#run), [process](#process),
[feedback](#feedback), [all](#all), [a question in the user's words](#a-question-in-the-users-words), [role
words](#role-words).

A focus fixes four things: the unit an agent returns, the closed labels on it, the report's layout and the way of
reading. Each layout follows a reference, a public issue of `github.com/Nowely/agent-skills` the owner accepted; the
layout below is enough to write from, and the issue shows one filled in. Take a reference's shape, never its findings.

Every claim carries its evidence level: 1, the line resolves; 2, an independent reader of the source would say the
same; 3, the behaviour was made to happen. A refuter's verdict is `upheld`, `refuted` or `unknown`.

## Facts and self-analysis

Every report keeps two kinds of statement apart. A fact comes from the transcript through the script: an event of
`corpus/timeline.jsonl` or a count, each with its address. A model's own account of why it acted, whether the model
that did the work or a reader retelling it, is a hypothesis, marked as one, however confident it sounds. What the
timeline answers is never taken from memory: which plugin pages were read before which draft, which skill the owner
typed and which the model called, what the owner said while the model worked, queued messages included, and what an
agent was told in its prompt against what it read itself.

The case behind the rule: in a field report on terse's clarity skill (2026-09-29), two facts changed the conclusions
most, the pages the model had opened while it drafted and two messages the owner sent while it worked. The writing
model's own account held neither and contradicted itself three times, and the first reading of the transcript
missed both messages.

## version

How a plugin behaved in real work in one release or a window of releases.

- **Unit:** a finding about the plugin's behaviour, with the addresses where it was seen.
- **Labels:** Kind: skill text, driver, harness, environment or contradiction. Level: 1, 2 or 3. Refuter: its verdict.
  Recurring: new, recurring, or claimed fixed and recurring, judged against the plugin's `CHANGELOG.md`, which an
  install keeps in the marketplace clone, `~/.claude/plugins/marketplaces/nowely/plugins/<name>/CHANGELOG.md`.
- **Layout (issue #15):** the title `<plugin> <release or window> field audit: <three or four headline findings>`.
  Summary, with numbered headlines. Scope and method: the corpus as a table of T-ids and each task's shape, the Codex
  runs, what was left out and why, the audit's own composition, the address notation. Cost profile. Findings `F1`…,
  each with Seen (addresses), Pages (`file:line` of the plugin's public text, which may be quoted), Kind, Level,
  Refuter and Recurring. What to keep. Proposed changes, as a table. Open questions. Audit cost.
- **Reading:** readers with a question, one per task, each with its task's timeline slice; a measurer over the
  transcripts' `usage` for the cost profile; for entrust, a strong reader of the Codex runs' reports. Which pages were
  read before which draft, and what the owner said while the model worked, come from the timeline.
- **Page dry run:** when a finding turns on what the pages make a coordinator do, one agent per scenario walks it
  through the pages as written, as issue #15 did for the advisor's start and for two basic actions.
- **Blind proposers:** two, for the proposals table, once the plan has named the criterion that picks the survivors.
- **Judge:** none.

## run

One run: a failure, a limit, or what a large run measured.

- **Unit:** an event or a measurement of one session and its launches. A launch with neither a report nor a rollout is
  `unknown`.
- **Labels:** each claim is measured or a hypothesis. Level: 1, 2 or 3. Refuter: its verdict.
- **Layout for a failure or a limit (issue #1):** the title `Field report: <what happened, one sentence with a
  number> — <the thesis>`. Setup. What happened, a table by launch: shell calls, time inside commands, wall time, the
  driver's verdict, the answer's size. The control, when one ran. The core argument. Proposals `P0`…. Secondary
  observations `S1`…. What worked well. Versions.
- **Layout for a large run's measurements (issue #22):** the title `<the run's shape>: measured fixes for <what>`.
  Summary. Findings, each with what was measured, then what is proposed. Confirmed, keep as is. The measured costs, as
  comparables for later estimates.
- **Reading, for #1's shape:** one strong reader of the session; a measurer over the rollout logs and their
  `Wall time` lines; a refuter of the thesis; the draft; one fresh reader. A control repeat is a paid plan row.
- **Reading, for #22's shape:** a retrospective analyst of the coordinator's decisions and their consequences; a
  measurer for tokens by role, read coverage and timings; a refuter on each measured claim; the draft, measured then
  proposed; one fresh reader.
- **Judge:** none.

## process

Where the time and tokens of the runs went, and what to do about it. Over one session, `run` says what happened and
what was measured; `process` says where the time and tokens went.

- **Unit:** a finding about where a run's time or tokens went; for the usefulness rows, one agent launch.
- **Labels:** each claim is measured or a hypothesis. Level: 1, 2 or 3. Refuter: its verdict. A launch is used, its
  output shaped a delivered result or decision; decisive, a visible contribution nothing else in the run supplied;
  miss, a later correction inside the scope it was given; harm, its output made a result or decision worse; or
  unknown (the labels of issue #16).
- **Layout:** the title `<plugin> <release or window>: where the time and tokens went`. Summary. Cost by role and by
  agent. The coordinator's share. Wall time split into active, user and gap time, and where the run waited. Repeats,
  stalls, redundant checks and rounds. Whether each role earned its place, a table of the launches' labels by role.
  Proposals, each with its measured baseline first and its expected saving. Method and limits. Its reference is three
  parts of others: #15's cost profile, #16's role table and #22's costs as comparables.
- **Time:** a pause is split by what ends it. A pause with a tool call or an agent in flight is active time, however
  long. A pause a person's input ends is user time, `userMs` and `USER=`, uncapped: read it as idle time on the
  person's side, not as time spent answering. Any other pause is active up to 600 seconds and a gap above.
- **Numbers:** `process --run <run>` writes `measures/process.json`: `gap` (600 seconds), `tasks[]`, `agents[]` and
  `totals`, which include `userMs`. A task row holds `id`, `wallMs`, `activeMs`, `userMs`, `apiCalls`, `tokens`
  (`input`, `cacheWrite`, `cacheRead`, `output`), `tools`, `gapCount` (every gap over 600 seconds), `gaps[]` (the ten
  longest, each `{ms, after, before, at}`), `repeats[]`, `outputs[]`, `agentTokens` and `codexTokens`. An agent row
  holds `id` (`T3.s2`, or `run:T3.c1` for a Codex run), `task`, `model`, `type` (a subagent's agent type, or `codex`),
  `tokens`, `durationMs` (a Codex run's wall time), `toolUses` (a Codex run's commands that succeeded) and `exit` (a
  Codex run's exit code, `null` for a subagent). A subagent's `tokens` is summed over the API calls in its own
  transcript, since the Agent tool's figure is its last call's context, and is `null` when the transcript has no usage;
  its `durationMs` falls back to its own wall time. A share says where the tokens went, not what they cost: most of a
  coordinator's are cache reads, 96% in issue #15.
- **Names:** an MCP tool is written as `mcp`, and an agent type that is neither built in nor `entrust:` or `terse:` as
  `custom`; model names stay. No field carries a command's text, a brief or a description; the full names and a
  subagent's description stay in `corpus/index.json`.
- **Roles:** the script counts by agent and by model, never by role, because a role stands in the plan card, not in
  a record. The reader names each agent's role from the card in the transcript and labels its launch; the table by
  role joins those labels with the agent rows.
- **Reading:** `process` and `timeline` run once after `corpus`; then readers with a question over `process.json`,
  each brief carrying its task's rows and its timeline slice. Which pages were read before which draft, and what the
  owner said while the model worked come from the timeline; a measurer's script
  only for a number the script does not give, such as the coordinator's context by source, as issue #15 counted it.
  An experiment a finding proposes goes to `/entrust:experiment` as a protocol and is not run here.
- **Judges:** two on the usefulness rows, as issue #16 had, one applying the labels' rules and one auditing the
  sources independently; then a refuter on the rows they dispute.

## feedback

How the user reacted on a topic, to improve the skill behind it; feedback on writing is a report about terse.

- **Unit:** an episode, one user message that reacts to the form or quality of what the assistant wrote or did, with
  what it reacts to.
- **Labels:** kind: objection, own rewrite, form instruction or approval. Confirmation: explicit request, chosen
  option, applied edit, or the user moved on.
- **Report unit:** a principle, "when …, do …, because …", with its strength by independent dialogues (strong 3 or
  more, moderate 2, weak 1; forks count once), its episodes, its boundary, and a before and after marked with what
  confirmed it.
- **Layout (issue #20):** the title `<topic>: N principles from M feedback episodes`. Summary: source, evidence,
  result, main conclusion. Recommendations for the skill. Core families. Principles, a table of number, principle,
  strength and episodes. Before and after examples, paraphrased. Findings about the existing rules. Limitations.
- **Scope:** the sessions that loaded the plugin, or every session with a user message when the user says "all".
- **Reading:** exhaustive extraction. The two analyses work one from the episodes up, one from all the user's messages
  down. The stress test's unit is one principle against one episode.
- **Judge:** one, deciding keep, revise, merge or drop per principle, and whether a principle turns one success into a
  template.

## all

Every standard focus over one corpus, in one plan and one report.

- **Plan:** the cost of each focus in its own rows, so that the user can drop a focus in words: the readers, shared by
  `version`, `run` and `process`; for `version`, the page dry run, the two blind proposers and the `Recurring` check
  against the changelog; for `run`, the measurer over the rollout logs of the tasks it covers and one refuter per
  thesis; for `process`, the two judges, the refuter and the `process` command; for `feedback`, the pilot, the
  batches, `coverage`, `quotes`, the two analyses, the stress test and the judge, the costliest row; and the rows
  every focus shares, the split critic, the dedup-and-rank, the publication reviewer and the completeness critic. A
  dropped focus takes its rows and its section of the report with it. The corpus is one, so `--all-sessions` widens it
  for every focus, and every row is priced over the widened corpus.
- **Reading:** one brief per task carries the questions of every readers' focus the plan kept, and the reader returns
  a section per focus, with addresses. `feedback` runs its extraction over the same corpus, `parts` cut from it.
- **`run`:** it covers each task in which the readers find a failure, a limit or a large run, one subsection each, in
  #1's layout for a failure or a limit and #22's for a large run's measurements.
- **Report:** one draft, written by the top row, titled
  `<plugin> <release or window> field report: <headline findings>`; then a section per focus in the menu's order,
  `version`, `run`, `process`, `feedback`, each in its focus's layout. One publication reviewer and one completeness
  critic read it, as they read any draft.

## A question in the user's words

The plan writes the unit, the closed labels, the layout and the way of reading, and the user's "go" accepts them.
Extraction when the unit is closed and the sessions are many; readers otherwise. There is no reference, so a judge
runs only when the plan names the criterion it applies.

## Role words

The launcher's plan registration counts a role as a worker by `implement`, `writ`, `worker`, `build` or `fix`, and as
checking by `critic`, `verif`, `review`, `refut`, `judge`, `check`, `test` or `advis`, with Russian forms beside them;
a role with both is checking, and a role with neither is refused. Every agent of a report reads and returns, and only
the one that writes the draft, when an agent does, is a worker: `report writer`. Every other row's role is its name
from [roles.md](../../orchestrate/references/roles.md), followed by `, checks` when the name carries no checking word:
`strong reader, checks`, `measurer, checks`, `page dry run, checks`, `blind proposer, checks`, `dedup-and-rank,
checks`, `retrospective analyst, checks`. A split critic, a refuter, a judge, a completeness critic, a bulk verifier
and a publication reviewer count as they are. The foreman checks nothing but has no class of its own: its row is
`foreman, checks`, and the card counts it apart from the checks.
