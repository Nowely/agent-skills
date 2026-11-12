# Terra design calibration

This round asks whether a review helps an implementer produce a simpler, readable solution, not just whether it names rubric items. It compared no skill with the frozen [draft 18](../drafts/18-methods.md) on two public synthetic cases, plus a separate non-public change reported only by class. The inputs, outputs and judgments here contain no non-public task, source or identifying details.

## Result

The new booking case is a useful control but does not distinguish the skill in these runs. Both no-skill reviews and both draft 18 reviews identified the reverse-overwrite decision flow, duplicated pricing and the ineffective local cache. On the original non-public change, two static draft 18 reviews both proposed removing an extra lookup and neither proposed separating the policy rules. The precise dependency contract and time-dependent form behavior were not established. One example and two runs do not establish general reliability.

On the import change, Astra's later pass against the explicit D1/D2 criteria rated all four design diagnoses partial: they explained behavior failures without explaining the cost of understanding or changing the coupled logic. The skill reviews both described an actionable target; the control reviews received one hit and one partial. This was a follow-up by the same judge, not another independent sample. One of two draft 18 reviews of the import control made merging its plan a mandatory fix; both judges considered the alternative workable but the mandatory status insufficiently justified. Passing tests and the `clean` label are not evidence that every possible finding is false.

Two import reviews also asserted an impossible consequence: an officially invalid email could replace an officially valid duplicate with the same normalized key. The shared validation and identity both use that key. The different local validator is a real issue, but this example does not demonstrate its consequence. GLM recorded the unsupported consequence while assigning one review maximum calibration and saying all its findings were verified. Judge ratings need evidence review; do not treat them as ground truth or collapse the dimensions into a quality percentage.

## Cases and checks

- [`contact-import-v2`](../../../evals/review/cases/contact-import-v2) clarifies short records, whitespace-only lines, existing email-validation policy and the last-valid-row rule. Its D1 assesses a concrete design diagnosis; D2 assesses the proposed decision/effect boundary and target. It does not mandate an exported `planImport` or a helper count. The original `contact-import` remains unchanged for older results. In this record the case is named `contact-import-v2`; the original manifest called it `contact-import` in the isolated instrument copy ([original manifest](runs-original.json)).
- [`booking-edit`](../../../evals/review/cases/booking-edit) has a behavior-correct but difficult first-written version and a coherent control. The brief fixes decision precedence and supported inputs. An existing price function is reusable; a per-call cache is unnecessary; the missing-room and interval checks and original revision are necessary. The control need not be split further to pass a style preference. [Rubric design](../../../evals/review/cases/booking-edit/rubric-design.md) distinguishes observed failures from maintenance judgments.

For the revised import, its `clean` version passed **13/13** acceptance scenarios; the first-written version passed **6/13**, with the seven expected failures matching its rubric. The synthetic base/head/clean trees' own **32 tests passed**. The new booking fixture's independent runner reported **71 checks passed**: 33 scenarios for each version with mutable and frozen inputs. Results and hashes are in [fixture-verification.json](fixture-verification.json). These finite checks do not prove complete correctness or readability.

## Reviews and judgment

The main round has two cases × two variants × two arms × two repetitions: **16 fresh `gpt-6.1-terra` reviewers**, requested effort `xhigh`. They reviewed statically and did not run code or tests. The [manifest](runs.json) names each case, variant, arm and response; [returns](returns/) contains their full responses. [Input verification](input-verification.json) records that every base/target tree, task and instruction digest matched the frozen input. [Prompt templates](prompts/) differ only by the instruction-file line. Temporary checkout paths were replaced by `<run>` or `target/` in the preserved text. `target/` in a review refers to its case and variant in the manifest. The previously published compressed bundle lost the punctuation after `<run>` in the final prompt sentence during path normalization; the templates here restore it. No other bundle content changed in that correction.

[Four pilot reviews](pilot/) used an ambiguous initial task: “last row” and “last valid row” were both stated. They are retained, including their task and original manifest, but excluded from the main round. The corrected brief was frozen before the 16 main reviews.

A fresh Astra judge and a GLM Flash judge independently evaluated each batch of eight reviews using the same [neutral brief](judging/judge.md). They saw one actual target and its task at a time, without arm mapping or the other variant. The review format and length can still reveal the arm. Their unmodified per-review outputs, anonymous group mappings and Astra's two later D1/D2 follow-ups are in [judging](judging/). Their qualitative axes and optional/not-applicable states are not the `score.mjs` find/trap schema; there is deliberately no combined score table. Reviews of the second batch used fresh judges, not the first judges' sessions. The actual D1/D2 follow-ups were made by the same Astra judges after their first assessments and are not additional independent observations.

The experiment used instructions to keep reviewers and judges within their assigned synthetic data. Those instructions did not create a separate filesystem sandbox. Requested model/effort and other conditions are in [conditions.json](conditions.json); requested effort is not proof of the provider's effective effort.

To prepare the same comparison again, invoke `prepare.mjs` for each of `contact-import-v2` and `booking-edit`, each of `head` and `clean`, once without an instruction file and once with `drafts/18-methods.md`; repeat each cell for a second review. For example, from the repository root:

```sh
node plugins/entrust/evals/review/prepare.mjs booking-edit head
node plugins/entrust/evals/review/prepare.mjs booking-edit head plugins/entrust/research/2026-11-11-review-skill/drafts/18-methods.md
```

Each command prepares a fresh isolated synthetic repository and prints the neutral prompt. `round.mjs` prepares **every** registered case, including the historical ones, so running it unmodified would not reproduce this two-case matrix. Preserve the emitted prompt, model and instruction hash for each run; do not provide reviewers the other variant, results or the judge's criteria.

## From review to implementation

Six fresh Terra implementers were asked to make each first-written case correct and readable: one saw the draft 18 review, one saw the no-skill review, and one received only the task. They did not see the rubric or alternative implementation, and did not execute code, tests or network commands. The coordinator subsequently ran the fictional acceptance suite and each implementation's own synthetic tests. The [manifest](implementations/manifest.json), patches, added files, final modified source snapshots, [acceptance results](implementations/acceptance.json) and [own-test results](implementations/own-tests.json) make each condition inspectable. A zero-exit test run with zero tests is recorded as `no-tests`, not a pass.

To reconstruct an implementation, copy its case's `head` tree into a temporary Git repository, apply its `changes.patch` with `git apply --unidiff-zero`, and copy each listed `newFiles` entry from `<id>/new/` to the corresponding path in the tree. The patches use zero context to preserve the change without storing whitespace-only context lines; the separately recorded final files allow byte-for-byte verification. The complete original-context diffs remain in the synthetic bundle attached to the round's PR comment.

| Case | Input to implementer | Acceptance | Own tests | Observation |
| --- | --- | --- | --- | --- |
| Import | Draft 18 review | 13/13 | 12 passed | Shared parser and validator; modes, retries and extra row log removed |
| Import | No-skill review | 13/13 | 14 passed | Legacy separator and row log retained; parser extended |
| Import | Task only | 13/13 | 9 passed, 3 failed | Three old tests still assert behavior the implementation removed or the task contradicts |
| Booking | No-skill review | 33/33 | 2 passed | Ordered decisions and shared price function |
| Booking | Draft 18 review | 33/33 | 5 passed | Ordered decisions and shared price function |
| Booking | Task only | 33/33 | No tests | Its production implementation is byte-identical to the draft 18 review-guided one |

A separate Astra agent compared randomized implementation trees without arm labels. Its [full assessment](implementation-assessment.md), [blind mapping](implementations/blind-mapping.json) and [judge brief](implementations/judge.md) are retained. The code comparisons are static judgments; test outcomes are the separate coordinator runs above. Extra compatibility behavior is not a demonstrated bug merely because the task does not request it. The task-only control was also explicitly asked to make the code correct and readable. One implementation per condition does not establish the causal effect of a review.

## What remains

- Design a harder independently authored behavior-correct example where the reading and ownership difficulty is less conspicuous. Keep a clear control and necessary guards; do not transplant the non-public code or require matching one reference.
- Score behavioral findings, necessity, maintainability, target consistency and unsupported claims separately. Resolve ambiguous contracts without declaring an entire control defect-free solely from acceptance tests.
- Repeat the reviewer and implementation stages before claiming reliability; keep blinded task-only controls and examine judge evidence and contradictions.
- Apply report feedback from the review discussion separately from skill evaluation. The validated change map checks line ownership and links, not whether findings or a target are semantically complete.
