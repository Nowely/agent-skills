# 06. Reflection pilot: an audit of the run and an insight panel

After v1's test, the owner proposed a reflection step: fresh agents that look back over the run to find where the
coordinator lost its way and, above all, a possible step change for the skill. It ran once, on this run, before
v2's design. This file is the baseline later runs of the role are compared against.

## What ran

| Part | Agent | Input | Rule fixed before it ran | Result |
|---|---|---|---|---|
| state statement | the coordinator, from context alone, no file opened | — | it is the claim under test | 48 claims, read by the audit |
| audit | Fable, fresh, read-only | the owner's messages extracted by script (queued ones included), the coordinator's transcript, the run's files, the record; the state statement only after its first two tables; this record's `03-run-gaps.md` only at the end | trusted if it finds at least 10 of the 12 rows of `03-run-gaps.md` and the five unanswered questions, the addendum that closed Part S and Part B; worth building if at least one finding resolves at its place, is in neither the record nor the state statement, and changes v2's plan or needs the owner | trusted: 12 of 12 rows (10 whole, 2 in part) and all three items; worth building: four confirmed deviations, below |
| panel, from zero | Fable | the owner's messages and the repository before v1; v1 only after a blind sketch | five hypotheses at most, each with a cheapest refuting test | 5 |
| panel, prior art | Opus | v1, its record, the vendors' and the community's skill-creators and guides, read whole | the same | 5, and a 20-line prototype |
| panel, evidence | Opus | v1, its record, the session digests and raw traces | the same | 5, and the causes by evidence level |
| panel, combinations | Fable | v1, its record, the audit's list of what was dropped, the design history | sets of two or three changes, each part's reason written as before a test | 5 sets |

The audit's tables: 56 instructions and questions of the owner (47 met, 8 on the plan, 1 dropped with a reason, none
lost); 34 promises of the coordinator (25 done, 7 pending, 2 lost); 48 claims of the state statement (41 confirmed,
7 differ); 25 things dropped (4 by a rule written before the result, 16 on opinion, 2 tested without a named
companion, 3 with no evidence found); 6 rules changed after a result (5 disclosed, 1 not); 25 questions to the
owner (15 answered, 2 open, 8 closed by a default without an answer); 21 figures (12 confirmed, 5 differ, 2
unknown).

Its findings confirmed at their places, each now corrected in [rounds.md](rounds.md) and the [README](README.md):
Part R's reader counted a decision stated in part as shown, which the protocol does not define, and counted
strictly Part R is Back to design (the audit judged the verdict unchanged; the coordinator's recount found the D7
clause); Part A's delivery record was not taken, and the coordinator told the owner that the page sessions had not
performed the check, before the trace showed they never opened the file holding it; Part B's harness change was part of the
candidate and the candidate was frozen without it; Part S was closed by an addendum written after the result.

## The panel's hypotheses, merged

Duplicates were merged, none dropped without a reason, and each cluster keeps its sources.

| # | Cluster | Lenses | Evidence | Owner |
|---|---|---|---|---|
| 0 | repair the test first (a reference fix for Part A, ledger-closing removals excluded, a moved fact not an addition; the page delivered from outside the tree, pre-registered discriminating decisions, "partial" defined, the relay fixed) | evidence; combinations and prior art as a condition | level 2–3 | taken into v2 |
| 1 | a preservation gate: a script lists removed lines found nowhere else and fails until each is marked moved, with a quote at its new place, or retired, with the user's words; "remove first" scoped to instructions and duplicates; a Change step that runs it | zero, prior art, evidence, combinations | level 3: the prototype flags the three lost rows in 4 of 4 Part A trees, 4–5 candidates each; the page sessions never opened the file with the check | taken |
| 2 | the plan as a fixed form with one slot per decision, validated by the script (how test sessions start, who writes the skill and the delivery text, what the agent fetches itself) | prior art, evidence, combinations | level 3: those decisions were missed in every arm | taken |
| 3 | rounds and checkpoints in the plan, a run ledger and a progress table printed by the script; requirement status taken from a run, not from a line existing | the owner; zero, prior art, evidence, combinations | level 3: the resumed turns opened no skill file | taken |
| 4 | baseline first, text only for what a no-skill run failed | zero, prior art | level 2 | deferred |
| 5 | quality reads that converge: an objection cites a run event or a script rule | combinations, prior art | level 2 | deferred |
| 6 | the architecture critic before the first stop, through the launcher | evidence | judgement | deferred |
| 7 | a selection-test script; a unique name | prior art, combinations | none | deferred |
| 8 | reflection at checkpoints | zero; this pilot | this file | taken: the owner asked that the role be fixed in the skill |

Kept from v1 by several lenses: the decisions table, the run-to-run noise floor, the rules for a run with no user,
the architecture critic that derives requirements before reading the plan, the sources table's whole-or-part
column. Recommended to stay dropped: a third free quality read, a mechanical ban on long pages, two separate skills.

## Each lens, for the next comparison

| Lens | Model | Tokens | Minutes | Offered | Taken into v2 | Only this lens | Independent |
|---|---|---|---|---|---|---|---|
| audit | Fable | 266k | 11.0 | 5 findings | 4 confirmed, corrected | the four deviations | yes |
| from zero | Fable | 159k | 3.4 | 5 | 4 | requirement status from a run | yes |
| prior art | Opus | 431k | 16.6 | 5 | 3 | the calibrated prototype; daymade's dispositions, which v1's design never read whole | yes |
| evidence | Opus | 263k | 12.0 | 5 | 4 | the test repair; Part A's measure made Keep unreachable | yes |
| combinations | Fable | 141k | 3.4 | 5 sets | 3 | the stay-dropped list | no: it read the from-zero and evidence returns |

Tokens are each agent's total from its task notification. "Taken" means the owner's choice of clusters, not an
effect: the effect shows only when v2 is tested.

## What the pilot cannot show

One run, on a run the coordinator also summarised; the owner chose among clusters the coordinator merged. The
combinations lens was not independent. A hypothesis taken is not a hypothesis that works. The cadence of each lens
below is a judgement from one run (level 2): prior art is the dearest and its sources change slowly, so once per
skill and again only for a new source or a vendor release; evidence after every test; from zero once per major
version; combinations after an audit lists what was dropped, without reading the other lenses; the audit at each
checkpoint and before delivery, as the factual base of the rest.

## Close-out

The pilot first ended at the merged list, with no decision on the role itself, until the owner pointed out that
the idea had not been carried to an end. This section is that end; v2 makes it a step of the skill (below).

**Verdict, by the rules written before the pilot.** The audit met its trust rule and its build rule. The panel met
its rule: the owner took clusters 1 to 3 into v2, and the script form of the preservation gate and the plan as a
form with slots were in neither the record nor the state statement.

**Decision.** Adopt the role into skill-creator v2, as the owner asked, with the adjustments below, and measure it
again at v2's checkpoints against the tables above.

**What the pilot showed about the role, and the adjustment each calls for:**

| Observation | Adjustment |
|---|---|
| the auditor judged one finding's effect on a verdict wrongly (Part R's partial marks: "unchanged"; recounted, Back to design) | a finding's effect on any verdict is recomputed from the rule and the raw marks, never taken from the auditor; the audit returns findings, not new verdicts |
| the combinations lens read two other lenses' returns | each lens works from its own list of readable paths and writes where the others are told not to read |
| the owner chose among clusters the coordinator merged | the merge rule is written before the returns arrive, and each lens's own top hypotheses are shown beside the merge |
| the state statement caught drift: 7 of 48 claims differed, among them stale counts of the owner's messages | the coordinator writes one at each checkpoint |
| the run kept no plan card or decision log, so the audit rebuilt the run's state from the transcript, which only some hosts keep | the run directory holds the plan and a decision log from the start, and the audit reads them first |
| prior art was the dearest lens, and its unique gain came from sources v1's design had read only in part | prior art runs once per skill and its digest is kept with each source's date and whether it was read whole; it runs again only for a new source or a vendor release, on what changed |
| the role's main purpose is a step change; the candidate here is the preservation gate as a script, calibrated only on old traces | whether it is one is decided at v2's pilot checkpoint, not now |
| a pilot of a new practice ended without a close-out | every pilot or experiment ends with a close-out in the run directory: the verdict by its rule, the decision (adopt, adjust, drop), the side actions with their commits, what changes in the practice, and when it is measured next |

**Side actions.** Done: the record corrected (`013863a`), the pull request's text aligned, the session digests
added (`0b3bfaf`), this file. Promises the audit listed as pending: the licence check of text carried over from
vendor skill-creators, now done — v1 copies no text from them; its checker quotes two short sentences of
Anthropic's public best-practices page with attribution, in a comment (`skill-creator/scripts/check.mjs:257`); the
fork comparison promised if the audit passed, run once on the same list: a fork of the coordinator filled tables
A, B, D, E and F from its inherited context, opening no file (406k tokens, 2.1 minutes, against the fresh audit's
266k and 11.0). The comparison is void: the fork was made after the audit's return was already in the
coordinator's context, and its tables D and E reproduce the audit's exactly. It found fewer rows where it could
not copy (45 owner instructions against 56, 16 questions against 25) and raised two items the audit had not
marked: by output tokens the run's main spend fell on Fable and Opus, not on Sonnet, against the owner's word for
the test, and the coordinator wrote the record and the merge itself. Adjustment: a fork, if one is used, is made
before any reflection return enters the coordinator's context; and four repository changes an early design proposed (a role row moved to orchestrate, a line in
`AGENT.md`, a ledger entry, a research folder under another name), dropped when the second design replaced it
without the owner being told, now reported to him.

**Next measurement.** At v2's pilot checkpoint (an audit, its tables compared with these) and before v2's delivery
(an audit and the evidence lens).
