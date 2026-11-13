# Formative rounds

One private target, one fresh reviewer per round. The review instructions changed between most rounds; all observations are static and omit identifying details. “Contract” means the reviewer established the applicable source, “conditional” means it identified relevant evidence but left applicability unresolved. “Structure” is a judgment about a concrete maintenance task, not a line-count metric.

| Round | Contract | Structure |
| --- | --- | --- |
| 1 | established | no actionable structural recommendation |
| 2 | unresolved | responsibilities noted, no recommendation |
| 3 | conditional | no actionable structural recommendation |
| 4 | unresolved | no actionable structural recommendation |
| 5 | conditional | cross-boundary duplication noted |
| 6 | conditional | named rule boundaries proposed with a maintenance rationale |
| 7 | established | boundaries examined; no split recommended |
| 8 | unresolved | boundaries examined; no split recommended |
| 9 | conditional | boundaries examined; no split recommended |
| 10 | conditional | boundaries examined; no split recommended |
| 11 | conditional | no structural recommendation; the report does not show the rules being examined |

These observations are not a controlled comparison. The final outcome is not a mandatory template for reviewers. The private source material is not published; findings above should not be treated as a benchmark for another codebase.

## Fictional-fixture pilot

One independent `gpt-6.1-terra` reviewer at requested effort `xhigh` read the candidate skill, the positive case brief and change, without its rubric, execution, or prior reviews. The skill SHA-256 was `f5e30d7eb57121ce0f86d8a833837ea47dc18f450d1d4cdb3b7a9b8c264a7019`. The reviewer identified the changed saved text and repeated normalization, and did not require extracting the cohesive validation rules. Those observations match the hidden rubric. The reviewer also named boundary-test examples; no tests were run.

This is one candidate-only run of one fictional case, not a before/after measurement or evidence of general reliability. The baseline and negative case remain unrun.

## Round 11: Sonnet pilot

Draft 11 against draft 10 on the instrument's `delayed-label` case, one review each. Each reviewer was a Claude Code subagent on Sonnet at its default effort, given the prompt `evals/review/prepare.mjs` printed and nothing else; no code was run. One judge on Opus, the same model family at a higher tier, graded both reviews by `evals/review/judge.md` under run ids that do not name the arm. The reviews, the manifest with the instruction digests and the verdicts are in [sonnet-pilot](sonnet-pilot/); the table is `node evals/review/score.mjs` over that directory.

| Arm | Case | Runs | Hit / partial / miss | Recall | Traps violated | Other valid | Unsupported | Words per review |
|---|---|---|---|---|---|---|---|---|
| draft-11 | delayed-label | 1 | 6 / 0 / 0 | 1.00 | 0 | 0 | 0 | 860 |
| draft-10 | delayed-label | 1 | 6 / 0 / 0 | 1.00 | 0 | 0 | 1 | 786 |

Both reviews found all six items and stepped into neither trap; each said the null check on the promised date is required. Draft 10's one unsupported claim is a remark on style. Regressions against draft 10: none observed, in one run.

What this is not. Two runs of one case measure no difference between the drafts, and with every item found there was none to measure: the case is too easy for Sonnet under either draft. No control arm ran, so nothing here says the instructions were needed. Seven more runs were prepared and never started: the other two cases and the control arm on all three. The reviewer model's exact version and effort are whatever the subagent route resolved; the route does not report them.

## Round 11: Terra round

Eighteen reviews of the instrument's three cases as they stood at `3de6352`: no instructions, draft 10 and draft 11, two fresh `gpt-6.1-terra` reviewers at requested effort `xhigh` per case and arm, each given the unchanged prompt of `evals/review/prepare.mjs`; no code was run, and the read-only limit was the prompt's, not a sandbox. A fresh `kimi-k3.1-pro` judge at `high` graded each review by `evals/review/judge.md` without the arm. The run was made by the agent that wrote drafts 00 to 10 and posted as [a comment on the pull request](https://github.com/Nowely/agent-skills/pull/95#issuecomment-6803987634) with a bundle whose SHA-256 is `7ee24688fe94ebca5c50e7fb34e08d87bf48b764d0a1260ee3c9bbd41729bff7`; [terra-round-1](terra-round-1/) is that bundle unpacked, with reviewer paths already shortened to `case/head/` by its author. The table is `score.mjs` at `3de6352` over that directory.

| Arm | Runs | Hit / partial / miss | Recall | Traps violated | Other valid | Unsupported | Words per review |
|---|---|---|---|---|---|---|---|
| control | 6 | 26 / 0 / 6 | 0.81 | 0 | 5 | 2 | 192 |
| draft-10 | 6 | 31 / 0 / 1 | 0.97 | 0 | 6 | 2 | 391 |
| draft-11 | 6 | 32 / 0 / 0 | 1.00 | 0 | 7 | 2 | 696 |

What it shows. Without instructions both repetitions missed the same items: the catch that cannot fire in `delayed-label`, and in `loyalty-discount` the option and field nothing uses and the rule implemented along two paths. Every arm found every behavior item. Draft 10 missed one item once; one item in thirty-two across two repetitions does not separate drafts 10 and 11, and draft 11's reviews are 1.8 times as long. No review stepped into a trap, so the traps separate nothing on this model. Regressions of draft 11 against draft 10 on these cases: none observed.

Two defects of the instrument. All six `webhook-retry` reviews said that acknowledgements and the attempt count live in process memory while the brief asks them to survive the worker death that causes a redelivery. The rubric did not list it; the judge ruled the acknowledgement half unsupported and the attempt half valid, and a second reader the run's author asked, `glm`, held the first to be a missing requirement. The six `Unsupported` are that one class, and the case's author agrees with the reviewers. And a rubric whose every item every arm finds measures nothing: the three cases are retired after this round, so the table is reproduced by checking out `3de6352`.

The private change, one Terra review with draft 11, reported by class only: the behavior failure was traced and a mechanism suspected unnecessary, conditional on a dependency contract that was available locally and not established; a test gap in the user interface was reported; no decomposition of the interleaved rules was proposed, and one compatibility question stayed open. Draft 11 keeps the examination of each unit's rules as working notes, so the report cannot show whether it was done; draft 10's explicit step for resolving a dependency's pinned version was not carried into draft 11. One review does not say either change caused the outcome: round 10, with both, was also conditional.

## Round 13: Sonnet pilot on the new cases

Draft 13 alone, on two of the six targets: the first-written form of `contact-import` and the clean form of `currency-contract`, one review each by a Claude Code subagent on Sonnet at its default effort, from the unchanged prompt of `evals/review/prepare.mjs`; no code was run. One judge on Opus, the same family at a higher tier, graded both by `evals/review/judge.md`. Reviews, manifest and verdicts are in [sonnet-pilot-2](sonnet-pilot-2/); the table is `score.mjs` over it.

| Arm | Target | Runs | Hit / partial / miss | Recall | Traps violated | Other valid | Unsupported | Words per review |
|---|---|---|---|---|---|---|---|---|
| draft-13 | contact-import/head | 1 | 8 / 0 / 0 | 1.00 | 0 | 2 | 3 | 1330 |
| draft-13 | currency-contract/clean | 1 | – | – | 0 | 0 | 0 | 480 |

On the first-written form the review found all eight items, design included: its target is the clean form's shape, the existing parser, validation into a map keyed by the normalized email, then the writes, and its change map marks each block of the function as kept, fixed or removed. Its three unsupported claims are one wrong statement about line numbers and two matters of style that the page says to drop. On the clean form it reported no finding, said the change already is the target, read the contract from the installed 2.3.0 and named the stale page and the nested 1.4.0 copy as such, and declined to add a guard.

What this is not. One run per target and no other arm: nothing here compares draft 13 with draft 11 or with no instructions, and Sonnet may find the same without the page. The page's author wrote the cases. The reviews are long, 1330 words for a hundred-line change, of which the change map is about a fifth. Four targets did not run.


## Round 17: Terra round 2

Eighteen reviews of the instrument's three cases as they stood at `63663f6`, each case in its first-written and its clean form: no instructions, draft 13 and draft 17, one fresh `gpt-6.1-terra` reviewer at requested effort `xhigh` per cell, each given the unchanged prompt of `evals/review/prepare.mjs`; no code was run, and the read-only limit was the prompt's, not a sandbox. Six `kimi-k3.1-pro` calls at `high` graded three reviews each by `evals/review/judge.md` without the arm, though the shape of a report can give its arm away. The run was made by the agent that wrote drafts 00 to 10 and posted as [a comment on the pull request](https://github.com/Nowely/agent-skills/pull/95#issuecomment-6824389752) with a bundle whose SHA-256 is `3dabbd8b536e11e949a7abd91c1c5167be11318722c59624817ed2882c8cb075`; [terra-round-2](terra-round-2/) is that bundle unpacked, with reviewer paths already shortened to `case/<variant>/` by its author. The table is `score.mjs` at `63663f6` over that directory.

| Arm | Form | Runs | Hit / partial / miss | Recall | Traps violated | Other valid | Unsupported | Words per review |
|---|---|---|---|---|---|---|---|---|
| control | first-written | 3 | 14 / 1 / 5 | 0.72 | 1 | 2 | 1 | 209 |
| draft-13 | first-written | 3 | 19 / 0 / 1 | 0.95 | 0 | 6 | 0 | 805 |
| draft-17 | first-written | 3 | 19 / 1 / 0 | 0.97 | 0 | 4 | 1 | 980 |
| control | clean | 3 | – | – | 0 | 7 | 0 | 129 |
| draft-13 | clean | 3 | – | – | 1 | 9 | 0 | 485 |
| draft-17 | clean | 3 | – | – | 1 | 8 | 0 | 617 |

What the first-written forms show. Without instructions the reviewer found the behavior items and missed design and necessity: in `currency-contract` the fallback the contracts exclude, the fix that belongs in the archive reader and the screens that stopped using `formatPrice`; in `contact-import` the function with five jobs, and it asked to keep the retry and the modes and improve them, which is a trap. Either draft found all of these. Drafts 13 and 17 differ by one ruling on one item, a failure swallowed inside a service that both reviews remove whole, a miss for one and a partial for the other: that is no difference. Draft 17's reviews are a fifth longer. Its section for ideas said "none" in all six reviews, so it drew no unsupported claim, and no idea either.

What the clean forms show, and it is the round's main result. In `overdue-notice` all three arms reported two races: two runs of the nightly job at once, and an invoice paid while the job awaits a send. The brief has one job a night, and the repository has no second caller of it and no writer during a run. The control reviewer reported them and asked for a check before sending. Both drafts labelled them `traced`, made them findings and wrote "serialize notification runs" or "coordinate attempts" into the target, a mechanism nobody asked for, which is the trap. The same draft, on the first-written form of the same case, put the overlap under questions. So the page's rule that a defect needs a trigger a supported caller can produce did not hold where the change left nothing else to report: the reviewer took "the function can be called twice" for a trigger.

Three defects of the instrument, all in the clean forms.

- `contact-import` is not clean. All three arms said a record whose cells are all empty is dropped by the parser, so a row with an empty name is not reported; the brief asks for it. The parser is base code the clean form relies on, and the reviewers are right. They are also right that it accepts text after a closing quote, lets a column named `line` overwrite the line number, and does not count a carriage return inside quotes.
- Each clean form has a real gap in its tests, which every arm with instructions found: no future due date, no renamed contact with its count, no price followed through the three outputs.
- The rubric of `overdue-notice` names the lock as a trap and says nothing of the race it is proposed for, so the judge ruled the mechanism a trap and the observation valid. A second reader the run's author asked, `glm`, found the paths possible in isolation and no supported scenario that reaches them.

And the first-written forms no longer separate the drafts: nineteen of twenty for both.

The private change, one Terra review with draft 17, reported by class only: the behavior failure was traced and extra handling proposed, without establishing the contract of the installed dependency, which was available locally; the target did not separate the interleaved validation rules into named responsibilities; a test gap in the user interface was noted as unverified and compatibility questions stayed open; no false statement of fact was established. These are the same two gaps as in round 11.

The interactive report, four reviews with draft 17: one per case on the first-written form and a repeat of `contact-import`; data, printouts and render attempts are in [terra-round-2/interactive](terra-round-2/interactive/).

- Every review rendered. One first attempt was refused, for a unit verdict outside keep, split, merge and remove; the second passed. Rendering the same data twice gave the same bytes.
- The repeat covered the same nine topics in other words and another order, with nineteen blocks against twenty.
- In both `contact-import` reviews the function with five jobs has the verdict keep, no finding is a design finding, and the target is one function. The prose review of the same form with the same draft said to split it, and its target is one function too.
- Three faults of the page. A finding about tests that names every requirement turns every requirement to "fails". A screen for which no picture was given is shown with "No difference from the mockup". Decisions are stored under the title and the range, which two reviews of one change share while their finding 7 differs.

The run's author showed one report, translated, to the user. What the user asked for: the range out of the header; the task's goal, the review's conclusion, the recommended actions and the target told apart by label and weight; recommendations as short ordered lists, with no point repeated across sections; the language of the user's session for content and labels; for each requirement where it came from, the task, a decision in discussion, an open question or an assumption, with agreement and doubt shown apart from the source; text that stays inside the diagram's boxes; a compact tree of the files the blocks are in; a denser page; and the three faults above fixed before any polish.

What this is not. One review per cell: nothing here is evidence that a result repeats. The cases and both drafts have one author, and the cases are small enough to read whole. The clean rows count valid claims against fixtures that were meant to have none, so they are a record and not a rate of false findings.

## Round 18: Terra round 3

The `control`, draft 17 and draft 18 were compared on three cases in both forms, with one fresh Terra review per cell and independent Astra and GLM judgments. The [record](terra-round-3/README.md) preserves all 18 synthetic reviews and both sets of verdicts. Its 95–97.5% draft recall is coverage of this rubric, not a measure of design quality or a reliability estimate. The judges' disputes qualify the earlier categorical readings: in particular, a short CSV row's supported status, the scheduler's concurrency contract and the need for failure reporting were not all specified by the supplied tasks.

The private-change reviewer proposed eliminating an extra lookup but did not establish the applicable installed dependency contract or propose separating the validation rules. Only this general classification is retained here; the non-public source, review and identifying details are excluded.

## Terra design calibration

The [calibration](terra-design-calibration/README.md) uses a separately versioned import case and a new booking case with a behavior-correct but difficult-to-read change. There were 16 fresh static reviews, two per case/variant/arm, and six independent implementations. Both arms found the principal booking design and necessity issues in both repetitions; a task-only implementer produced the same production code as the skill-review-guided implementer, but added no tests. All six implementations passed the supplied acceptance samples; one import implementation left three contradictory old tests failing. These observations do not establish a causal effect or general reliability.

A later pass against the explicit import design criteria rated all four diagnoses partial, even where the target flow was actionable. One draft 18 review of the import control prescribed an optional structural alternative as a mandatory fix. A further static review of the non-public change again proposed removing the lookup without separating the rules; exact dependency applicability and time-dependent UI behavior stayed open. Only these classes are retained publicly.
