# skill-creator, now rnd: design and test of v1 to v3

**Question.** Can one entrust skill, `skill-creator`, make an agent create and develop skills the way this
repository has learned to: analyse the request into requirements and ask what only the owner can answer at the
start, read prior art, write a procedure with references inside fixed budgets, have fresh critics read the
approach and the text, and change a skill by a measured, keep-or-revert step?

**Result.** The skill is built and committed on its branch; by the frozen landing rule it **does not land**. Part A
(a pending change, with the page and without) returned **Back to design**: both sessions that followed the page
lost page facts while merging duplicates. Part R (a replay of this run's opening) returned **Undecided**: both
skill sessions scored 12 of 13 and raised the three decisions the owner called fundamental, but the controls
scored 10, a margin of 2 where the rule asks for 3. That count lets a decision stated in part count as shown,
a convention the reader set and the protocol does not define; counted strictly, the decision on how a skill's text
is written (D7) is absent in both skill sessions, which the rule makes **Back to design**. Part B (selection) did not run: the harness change it needs is
not built. The owner decides what happens next; this record adds no recommendation after the fact.

**Version 2.** A second version of the skill, with a preservation gate for changes (`check.mjs --against`), Change
written out in steps, a plan form with rounds and checkpoints, one brief form for the judges, a reflection role and
a practice step, was built in stages after two architecture critics and tested by a frozen protocol
([10-v2.md](10-v2.md), [11-test-protocol-v2.md](11-test-protocol-v2.md)). The gate's pilot passed after one rework
(CP2 second pair: mean cost 0.628 USD, no fact lost); the judge briefs' outcome test failed once and passed on a
rerun the audit found contaminated. By the frozen landing rule **v2 does not land**: Part A returned **Back to
design** in both cases (one page session lost a fact in each, and the controls lost as many) and Part R returned
**Back to design** by the frozen reading, because the decision on how a skill's text and files are written is only
partly stated in both page sessions (counting a partial mark as met, every clause of `Pass` holds). External
spend was first recorded as 15.56 USD; corrected, it is 13.36 USD to CP3 and 16.27 with I3's sessions (Part A had
summed a cumulative cost field, and the total had left I3 out; [10-v2.md](10-v2.md#costs)). The test cannot show that the page's judges work, since no test session had an agent tool. The
owner decides what happens next. A further gate set tried after CP3 (I3) passed its replay on the old losses and was dropped by its pilot's rule: one of four sessions still changed the owner's value, openly ([10-v2.md](10-v2.md#i3-a-further-gate-set-tried-and-dropped)). A clean replication of the judge briefs' test on fresh material (I4) returned **not needed**: briefs written from the stage-1 pages caught 8 of 10 known answers, the current pages' 10 and 9, so 2a's pass does not replicate ([10-v2.md](10-v2.md#i4-the-judge-briefs-outcome-test-replicated-clean)); corrected: 8 of the 10 answers were caught in every run of I4 and I5, so that verdict was set by the material, and on the two answers that discriminate the stage-1 briefs caught 0 of 2 and the current pages' 2 and 1. Its consequence (I5) brought the judge page down to what the record supports, a fifth shorter, and kept the same catch on the same material, 9 and 10 of 10 ([10-v2.md](10-v2.md#i5-the-judge-pages-brought-down-to-what-the-record-supports)); on those two answers it caught 1 and 2, and its 27 retirements cite the run's own addendum where the skill asks for the user's words, with no quality critic's read, which is put to the owner and pending. A second reflection after delivery (an audit, an evidence lens and a from-zero lens, against the coordinator's answers sealed beforehand) produced these corrections and found that most of v2's agents went to the judge-brief line while neither cause of "does not land" was worked on after CP3; its merged hypotheses wait for the owner's choice ([10-v2.md](10-v2.md#reflection-2)).

**Version 3.** The skill is renamed `rnd` and rebuilt on v2's two causes and the second reflection's hypotheses,
with a new main measure: what fresh agents achieve with a skill made or changed with `rnd` against one made or
changed by the host alone, marked blind ([12-v3.md](12-v3.md)). Selection holds (10 of 10 meant, 0 of 5 near
misses). The other three clauses fail: facts kept in 5 of 6 change sessions after one correction; the main measure
shows no margin on Create (68.9 against 68.0) and a lower score on the thin Change kind, at 2.2x to 11.6x the cost;
the text-and-files decision is whole in 1 of 6 plans after one correction. By the landing rule v3 does not land;
the owner approved proceeding despite the result. The text fixes for E171 to E174 were applied and those entries are no longer in `ISSUES.md`.

**After v3.** Spend rules and text fixes for E171 to E174 were followed by limited one-session follow-ups, read by the coordinator rather than blind ([13-next.md](13-next.md#results-of-items-2-3-5-and-6)). A dispositions reader still missed a moved condition; undo beyond the correction limit was not reached. These runs do not establish general efficacy.

## What was built

`plugins/entrust/plugin/skills/skill-creator/`: `SKILL.md` (two routes, Create in ten steps and Change, plus
Repair, a correction, the result and standing rules), six references (`analysis.md`, `checks.md`, `critics.md`,
`hosts.md`, `structure.md`, `writing.md`) and `scripts/check.mjs`, twelve mechanical rules that
`scripts/skills.test.mjs` now imports; the current checker separates common rules in rnd from Claude rules in its adapter. Its suite is
`plugins/entrust/evals/skill-check.test.mjs`. The critics on the top tier are the owner's choice and differ from
orchestrate's defaults; `critics.md` says so. That was v1. v2 adds the preservation gate (`check.mjs --against`), a
written-out Change route, one brief form for the judges, a plan file (`references/plan.md`), a reflection role
(`references/reflection.md`) and a practice step, eight references in all ([10-v2.md](10-v2.md)).

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
| R | 6 sessions (2 with the page, 2 controls, 2 with Anthropic's skill-creator), one blind reader, every mark opened at its place | **Undecided**; strictly counted, Back to design: s1 12, s2 12, controls 10 and 10, vendor 10 and 10 (of 13) |
| A | case E104, 4 sessions (2 with the page, 2 without), 4 verifiers, one blind reader | **Back to design**: both page sessions lost rows of `parity.md`'s effort table (level 3, by grep of each final tree) |
| B | — | not run: the trigger harness is bound to terse's `clarity` |

Costs reported by the launcher: Part C 0.73 USD, Part R 5.88, Part A's sessions 1.52; native readers, critics and
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

Session digests: [04-part-a-sessions.md](04-part-a-sessions.md), with the four sessions' patches in
[part-a/](part-a/), and [05-part-r-sessions.md](05-part-r-sessions.md). The Part A trace shows that both
sessions given the page opened only `SKILL.md` and `references/analysis.md`; neither opened `checks.md`, whose
row 10 holds the "nothing was lost" check, nor `writing.md`. The controls lost the same rows without the page, so
the trace does not show that opening it would have changed the edit.

## For the next design round

Part A's failure is the page's route: it has a "nothing lost" check for merged duplicates, two links from the
Change route, and neither page session opened the file that holds it. Part R's open items are the decisions no arm raised (adapters, who writes, fetching a missing source)
and a replay that does not hand the skill sessions the answer in their tree.
