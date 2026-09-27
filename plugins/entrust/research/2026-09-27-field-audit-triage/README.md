# Triage of issues #15 and #16: what to fix, whether, and how

2026-09-27. The owner asked for the two field-audit issues,
[#15](https://github.com/Nowely/agent-skills/issues/15) (21 findings, a meta-finding, 14 proposals, a keep list,
two harness notes) and [#16](https://github.com/Nowely/agent-skills/issues/16) (seven proposals, one a twelve-row
role table), to be triaged against `main` at `882bcf3`, using the unreleased foreman, at the Max tier of three
offered. Everything below is attributed; the orchestrator (Fable 5.1) wrote the split, the briefs and this page, and
where a statement is its own and not an agent's, it says so.

## Result

Of the 72 rows the split critic cut the two issues into, the judge (Codex Astra A2, reading the tree itself after
three analysts, three refuters and a prober) rules:

| Verdict | Rows | Which |
|---|---|---|
| already fixed on main (unreleased) | 1 | F7: the page waits on notifications, TaskOutput gone |
| fix now | 42 | in 19 ranked entries below; the architect drafted a delta for every one |
| fix after measurement | 19 | F8, F17, P4, P6, P7, P8a, P8c, P8e, P10b, P10c, P14b, Q2a, Q2b, Q3f, Q3i, Q3l, Q3m, Q4, Q6 |
| do not fix | 8 | F12b, K7, Q3h, Q5 (not a defect: the page already does it); P11b (partial, no orphan cause known); K8, H1, H2 (outside entrust) |
| unknown | 2 | F2 (needs a start-versus-end activation run per client), Q7a (needs the owner's overlap journal) |

By status: 1 `fixed-on-main`, 28 `partial` (main answers part of it), 34 `still-true`, 4 `not-a-defect`,
3 `not-applicable`, 2 `unknown`. Status is against `main`, not against #23 alone: a `partial` row may be answered in
part by text unchanged since 0.20.0, or by the foreman (#24). The bulk of both issues stands. No fix-now row removes
a keep step (A2's check over the rows); the architect checked its deltas against the keep list itself (07b).

**The fix-now rows, ranked by the judge (value for cost), with the architect's delta for each** (Fable F1,
[07b-architect-deltas.md](07b-architect-deltas.md); S/M/L is the architect's cost class):

| # | Rows | Delta | Kind | Cost |
|---|---|---|---|---|
| 1 | F1, P1 | D1: the advisor gives read-only advice on its own command, no plan stop before the first advice, opt-out words; a live-gate case | sentence + gate | S page, M gate |
| 2 | P14a | D18: the activation-position pair in the live gate (command first versus last, headless; VS Code by hand) | experiment | S |
| 3 | F9, F10, F15, F21, P2, P3 | D7: a runner `capture-check.mjs` (log under `$TMPDIR`, 20-line tail, `EXIT=` last, pipefail) for the coordinator and Claude workers, Codex agents left out on F1's hypothesis that Codex's own harness clips output, where A2 asked for both; D8: the cost model and a countable inline bound the runner enforces | mechanism + sentence | M |
| 4 | F12a | D3: the one waited-on Codex agent is a foreground call; a foreground/background matrix with the headless exception | sentence | S |
| 5 | F12c | D2: the advisor's prompt names its model and the five-field schema and carries no effort line | sentence | S |
| 6 | M1, P12a | D17: behavioural regressions as the rule, an index of recurring findings to their cases; offline mechanisms and paid coordinator behaviour tested apart | mechanism | S own, L across |
| 7 | F18, P5, P12b | D5: shared fragments generated from one source with a red-on-drift suite; the codex page loaded only when the plan has a Codex agent | mechanism | M |
| 8 | F20a, F20b, P11a | D14 (every agent that ran is named), D15 (the five-field schema ships as a file, the gate checks every return), D16 (size caps in the schema, checked by the driver) | mechanism | S–M |
| 9 | F5, P8d | D11: dedup-and-rank before refutation, one refuter per cluster, prerequisites once; the refuter's `unknown` verdict is the owner's call | sentence | S |
| 10 | F4, P8b | D10: the critic's verdict carries a digest of the draft it read; a changed draft is re-read | mechanism | S page, M gate |
| 11 | F3, F13, P9a | D9 (the simple-task row states the true count), D6 (the plan is a card of five rows) | sentence + mechanism | S + M |
| 12 | F14, P9b | D6: the card's agents are a manifest the launcher enforces; amendments explicit | mechanism | M |
| 13 | F6, Q3a | D12: no brief exists before the split critic returns; a gate fixture checks the order | sentence + gate | M gate |
| 14 | F11, F19, P10a | D4: an environment capsule, half computed by the driver (writable roots, the daemon rule), half a body line the plan fills | mechanism | M |
| 15 | F16, P13a | D13: one paragraph per phase, of verified changes only | sentence | S |
| 16 | Q3c, Q3e, Q3j, Q3k | D20–D23: the cross-review, strong-reader, blind-proposer and measurer briefs gain the fields #16 asks for | sentences | S |
| 17 | Q3g | D19: the live prober freezes its capture before any write and names revision, mode, platform and control | sentence | S |
| 18 | Q7b | D24: protocol E6, one strong reader against the full policy, preregistered | experiment | S to write |
| 19 | P13b | D14: a draft linter for machinery, length, paths and unsupported success | mechanism | M |

Thirteen of the 24 deltas are sentences, the kind of change M1 says has not held. Opus O1 flagged its nine
sentence rows in its open items, the foreman raised it in its report, the judge never saw the deltas, and the
architect argues each sentence in a "Why a sentence" line; D17 is the answer offered: each repair lands with a
regression.

## Decisions only the owner can take

The architect's open items (07a), and one of the orchestrator's:

1. Five deltas (D4, D6, D7, D14, D16) break the orchestrate page's "prompt only" statement; a replacement sentence
   is drafted and the test that pins the statement changes with it.
2. D11's `unknown` verdict for refuters reverses the page's "defaults to refuted when uncertain" and its pin; #16
   asks for it, and this run already used it.
3. D5 and D6 conflict: an all-Claude plan cannot name the launcher's path for `--plan` before the codex page is
   loaded; the drafts skip the `--plan` registration for an all-Claude run and still show the card.
4. D14's pre-display enforcement could only be a plugin Stop hook, which would fire in every session with the
   plugin enabled: a hypothesis, not in the delta.
5. D16 needs a live check that the server's strict schema accepts `maxLength` and `maxItems`; until then the driver
   strips and enforces them itself.
6. D5 saves 4,511 words on an all-Claude run and none on a run with a Codex agent, where the load is deferred.
7. D6's manifest checks neither the caps nor the truth of the cost figures.
8. F11 gets no classifier, per Opus R1; the acceptance measure is the exit-6 rate after D4.
9. The orchestrator's: the architect ran beside the judge in wave 3, from the post-refutation rows and without the
   judge's reasons, so the deltas have not been read against them. One gap is visible already: D10 digests the
   draft alone, where the judge wants the draft and the referenced artifact bodies. That read is pending.

## Where the agents disagreed

The refuters changed 21 of 72 rows (Opus R1 10 of 29, Codex Sol R2 5 of 24, Opus R3 6 of 19), none `unknown`.
The judge kept 15 of those changes and reversed six: F5, F6, F9, F10 (the refuter called them partial because a
rule exists; the judge: the issue cites that very rule as the one that was skipped, so the row is still true), F8
(the refuter: the keeper removes the relay-breach trigger; the judge: keeper survival does not establish relay
obedience) and Q7a (the refuter: not applicable; the judge: unknown, the source journal is missing). It also moved
one row the refuter had upheld, F20b, to partial, siding with neither: declared Codex schemas are validated and
Claude returns are not. Over all 72 rows its side column reads 55 analyst, 16 refuter, 1 neither.
The live prober's 22 of 22 `confirmed` is unanimous, and read as such: its per-row checks are greps of the quoted
lines, level 1, confirming the text at each address and not the analyst's status; the judge ruled three of those
rows against the analyst. Its standing probes are the behaviour it made happen: the launcher's `--help` and
`--status` on a missing report (nine lines, `FILE=missing`), and fifteen eval suites, twelve green.

## Not decided here

- Checks no worker ran: a live advisor lifecycle; Stop, hand-back and notifications under the Bash-only wrapper in
  each client; whether the server enforces `maxLength` and `maxItems`; the paid orchestrate-live gate.
- The issues' own measurements (tokens, minutes, the replay and the overlap simulation) were cited as reported and
  never reproduced; the owner's local corpora were not read.
- Three suites failed inside the Codex read sandbox. Settled after the answer, by the orchestrator, outside the
  sandbox: `agent-run.test.mjs` all 29 passed and `lock.test.mjs` all 72 passed (level 3, redirected into files and
  read back), so the sandbox's `pgrep -P` refusal and the lock failures are artefacts of the sandbox, not defects.
  `fidelity.test.mjs` spawns the real `codex app-server` and reads the account's rate limits before any turn
  (`fidelity.test.mjs:90`), which the paid-turn gate at line 694 does not cover, and `evals/README.md:47` says the
  suite runs locally with the real codex: under `NETWORK: no` it must fail, and that is not a defect (level 2).

## Found in passing

- Entered as E51 in `plugins/entrust/ISSUES.md` on the owner's word, level 1, found independently by Opus R3 and
  Fable F1: `plugins/entrust/plugin/skills/experiment/SKILL.md:19` says "the four registered first are in
  protocols.md", while `references/protocols.md:3` says "Five experiments" and lists E1 to E5.
- Not entered: Codex Terra T1's hypothesis about `fidelity.test.mjs` and the two sandbox failures, resolved above.

## Decisions

The owner, 2026-09-27 («Примени рекомендуемое»), on the orchestrator's recommendations: (1) the "prompt only"
sentence goes, the architect's replacement stays; (2) refuters may answer `unknown`, the page rule and its pin
change; (3) an all-Claude run skips the `--plan` registration and still shows the card; (4) no Stop hook, the
draft linter runs by rule and the live gate checks it; (5) one Luna turn in the fix run checks whether the server
accepts `maxLength` and `maxItems`; (6) to (8) accepted as the deltas' scope; (9) step 0 of the fix run is one
Codex Sol reading the 24 deltas against the judge's 42 reasons. The fixes are a run of their own, in batches by
the judge's ranking, the nineteen fix-after-measurement rows left out. The recommendation to release 0.21.0 (the
foreman and #23) before the fixes was accepted in principle; its package is shown separately, as RELEASING.md
requires.

## What the run says about the foreman

First use on a real task. The foreman (Opus, background) launched nine workers in the foreground in three waves,
built R2's, T1's and A2's briefs by a pipeline from the returns' files and pasted R1's, R3's and F1's rows from jq
and grep output, checked the row counts before each launch, checked by script that the architect's 42 rows equal
the judge's 42, continued or relaunched nobody, and returned one report; 286k tokens, 43 tool uses, 94 minutes.
Its deviations are listed in [08-foreman.md](08-foreman.md), and the orchestrator's own, running the installed
0.20.0 orchestrate page against the tree's launcher, in [rounds.md](rounds.md): the foreman was told not to load
`entrust:codex` and given the pages by path (the orchestrator's reasoning, since the installed page names the
cache's launcher; nobody tried the load), refuters could answer `unknown`, and waiting was on notifications. One
brief finding, the foreman's: "never spawns agents" beside "tags any Agent call opus or sonnet" is two rules.

## Cost

| Agent | Model | Tokens | Seconds |
|---|---|---|---|
| L0 smoke | Codex Luna | 13.5k (wrapper) | 30 |
| A1 split critic | Codex Astra | 184.6k, wrapper 13.4k | 488 |
| S1, S2 analysts | Codex Sol | 629.1k, 679.3k | 208, 172 |
| O1 analyst | Opus | 252.9k | 1,059 |
| R1, R3 refuters | Opus | 227.0k, 215.0k | 1,192, 927 |
| R2 refuter | Codex Sol | 715.3k | 232 |
| T1 prober | Codex Terra | 543.0k | 382 |
| A2 judge | Codex Astra | 3,249.7k | 1,365 |
| F1 architect | Fable | 251.5k | 1,063 |
| foreman | Opus | 286.3k | 5,635 |
| five wrappers of the foreman's Codex workers | Haiku | 67.8k | — |
| C1 completeness critic | Opus | 175.0k | 531 |

Codex 6.0M (cache reads included), Claude 1.5M by the harness's per-subagent count, the critic included; the
orchestrator's own session tokens are not counted here, and #15 says that is the dominant cost. About two hours
from "go" by the files' times. The plan's Max estimate was 10–30M on each side: the Codex figure sits below it and
the Claude figure far below; the hypothesis is that the harness's per-subagent count is not the cache-inclusive
total #15 used, which no file here measures.

## Files

The row ids (F, P, Q, K, H) are the run's own, defined in 03-split.md; the issues carry none. 06 holds the judge's
reason for every row, the 19 fix-after-measurement and 8 do-not-fix rows included.

01 the split; 02 the split critique (Astra A1); 03 the split in force; 04a–c the analysts (Sol S1, Opus O1, Sol S2);
05a–d the refuters (Opus R1, Sol R2, Opus R3) and the prober (Terra T1); 06 the judge (Astra A2); 07a–b the architect
(Fable F1) and its 24 deltas; 08 the foreman; rounds.md the steps and their costs. Codex reports live in the
plugin's data directory under `orchestrate/…/field-audit-triage-20260927/`.

Completeness critic (Opus C1, 175k tokens, 531 s) on the first draft of this page and of the answer: partial, 24
corrections, all applied here without a second pass; its open items were the plan's estimate (not in the files),
the two-hour figure (file times only), the harness's token accounting and the agents' tree claims beyond one
level-1 check.
