# skill-creator v1: design and test

**Question.** Can one entrust skill, `skill-creator`, make an agent create and develop skills the way this
repository has learned to: analyse the request into requirements and ask what only the owner can answer at the
start, read prior art, write a procedure with references inside fixed budgets, have fresh critics read the
approach and the text, and change a skill by a measured, keep-or-revert step?

**Result.** The skill is built and committed on its branch; by the frozen landing rule it **does not land**. Part A
(a pending change, with the page and without) returned **Back to design**: both sessions that followed the page
lost page facts while merging duplicates. Part R (a replay of this run's opening) returned **Undecided**: both
skill sessions scored 12 of 13 and raised the three decisions the owner called fundamental, but the controls
scored 10, a margin of 2 where the rule asks for 3. Part B (selection) did not run: the harness change it needs is
not built. The owner decides what happens next; this record adds no recommendation after the fact.

## What was built

`plugins/entrust/plugin/skills/skill-creator/`: `SKILL.md` (two routes, Create in ten steps and Change, plus
Repair, a correction, the result and standing rules), six references (`analysis.md`, `checks.md`, `critics.md`,
`hosts.md`, `structure.md`, `writing.md`) and `scripts/check.mjs`, twelve mechanical rules that
`scripts/skills.test.mjs` now imports, so the repository's page checks have one owner. Its suite is
`plugins/entrust/evals/skill-check.test.mjs`. The critics on the top tier are the owner's choice and differ from
orchestrate's defaults; `critics.md` says so.

## How it was designed

Two design threads by Fable, read by fresh critics between them ([rounds.md](rounds.md)). Sources: the
repository's records, the owner's earlier sessions (private, read by subagents), and prior art: the Agent Skills
specification, Anthropic's best practices and skill-creator, Claude Code's and Codex's skills documentation,
OpenAI's "Build skills", daymade's skill-creator and obra's writing-skills. The run itself made the mistakes the
skill is meant to prevent; [03-run-gaps.md](03-run-gaps.md) lists the decisions the owner had to raise after a
design existed, and the requirements sheet ([01-requirements.md](01-requirements.md)) was rebuilt from them in
round 6.

## The test

Protocol: [02-test-protocol.md](02-test-protocol.md), frozen before Part S. Every test session was an external
Claude run on Sonnet through entrust's launcher; readers on Opus; Part S's critics on Fable.

| Part | What ran | Verdict |
|---|---|---|
| S | architecture critic (Fable, keep); two quality reads (Fable, change: 12, then 10 objections); a Sonnet verifier | closed after the second read's fixes (protocol addendum 2): paper rounds did not converge, each read found a new class |
| C | two walks of the pages, create and change, by Sonnet | no open halt after the fix round; one defect found in passing, E169 |
| R | 6 sessions (2 with the page, 2 controls, 2 with Anthropic's skill-creator), one blind reader, every mark opened at its place | **Undecided**: s1 12, s2 12, controls 10 and 10, vendor 10 and 10 (of 13) |
| A | case E104, 4 sessions (2 with the page, 2 without), 4 verifiers, one blind reader | **Back to design**: both page sessions lost rows of `parity.md`'s effort table (level 3, by grep of each final tree) |
| B | — | not run: the trigger harness is bound to terse's `clarity` |

Costs reported by the launcher: Part C 0.73 USD, Part R 5.88, Part A's sessions 1.53; native readers, critics and
verifiers run inside the coordinator's session and have no dollar figure.

## What the test cannot show, and what it found beside the verdicts

- Part R's skill sessions ran on a tree that already holds `skill-creator`; both found it and proposed extending
  it, as the page's own structure rule says, so they answered a different task from the controls, who wrote draft
  skills. Their values for placement, name and invocation came from the tree.
- The controls reach 10 of 13 from the repository's rules and the owner's earlier sessions alone: the band left
  for the skill was 3.
- No session in any arm named the repository's adapters for test sessions, said who writes the delivery text, or
  fetched the source the prompt named and the folder lacked; each asked the owner for it instead.
- Part R's relay missed heredoc-form requests, so every session's first read-only Bash expired and the agents then
  avoided Bash; it hit every arm.
- One run, two sessions an arm: an event occurred or did not; no stable difference (`RESEARCH.md:89-90`). Nothing
  here measures a Codex or OpenCode model reading the pages.

## For the next design round

Part A's failure is the page's own: it has a "nothing lost" check for merged duplicates and neither page session
performed it. Part R's open items are the decisions no arm raised (adapters, who writes, fetching a missing source)
and a replay that does not hand the skill sessions the answer in their tree.
