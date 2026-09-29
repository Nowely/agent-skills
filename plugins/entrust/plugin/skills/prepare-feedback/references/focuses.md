# Focuses

Contents: [version](#version) with the lens of role usefulness, [run](#run), [feedback](#feedback), [a question in the
user's words](#a-question-in-the-users-words), [role words](#role-words).

A focus fixes four things: the unit an agent returns, the closed labels on it, the report's layout and the way of
reading. Each layout follows a reference, a public issue of `github.com/Nowely/agent-skills` the owner accepted; the
layout below is enough to write from, and the issue shows one filled in. Take a reference's shape, never its findings.

Every claim carries its evidence level: 1, the line resolves; 2, an independent reader of the source would say the
same; 3, the behaviour was made to happen. A refuter's verdict is `upheld`, `refuted` or `unknown`.

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
- **Reading:** readers with a question, one per task; a measurer over the transcripts' `usage` for the cost profile;
  for entrust, a strong reader of the Codex runs' reports.
- **Page dry run:** when a finding turns on what the pages make a coordinator do, one agent per scenario walks it
  through the pages as written, as issue #15 did for the advisor's start and for two basic actions.
- **Blind proposers:** two, for the proposals table, once the plan has named the criterion that picks the survivors.
- **Judge:** none.

**The lens of role usefulness (issue #16).** The same corpus, asked which agents earned their place.

- **Unit:** one agent launch.
- **Labels:** used, its output shaped a delivered result or decision; decisive, a visible contribution nothing else in
  the run supplied; miss, a later correction inside the scope it was given; harm, its output made a result or decision
  worse; unknown.
- **Layout (issue #16):** Summary. Evidence base, terms and role results, each claim marked proven or hypothesis. One
  section per proposal, each with its acceptance check. The role table. Costs and source records.
- **Reading:** readers with a question, then two judges, one applying the labels' rules and one auditing the sources
  independently, then a refuter on the rows they dispute. An experiment the lens proposes goes to
  `/entrust:experiment` as a protocol and is not run here.

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
