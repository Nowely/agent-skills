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

