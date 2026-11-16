# Review comparison: plain, 0.39 and a refactored candidate

## Result

The checking agents made useful contributions in specific runs: the critic identified a
reproducible test blind spot in both reviews of one case, and the final record incorporated it.
The comparison does **not** establish a general quality advantage or prove the rewrite has no
regressions. One 0.39 review found a different, reproducible test gap that none of the four candidate
reviews on that case reported. Two runs per case and arm cannot establish whether the rewrite
caused the difference.

The checking workflow consumed more host-reported tokens and took longer in these runs. Time
comparisons are descriptive: the run moved from sequential to parallel execution, case allocation
across those conditions was uneven, and some times include operator delays. Actual monetary cost is
unknown.

The tested candidate was [`1c645249`](https://github.com/Nowely/agent-skills/tree/1c6452490459894ced9b90dac2c5fd1a10f9a316),
after the supplied-diff and checks-none changes. While the experiment ran, PR
[#100](https://github.com/Nowely/agent-skills/pull/100) advanced to draft 37 at `371099e1`, changing
review instructions and diff handling. **These results do not validate draft 37.** The
[experiment comment](https://github.com/Nowely/agent-skills/pull/100#issuecomment-6917370625)
records the public aggregate results.

## Question and design

What does the delivered review add over a plain request and the published skill, and what changes
when the candidate uses its independent target, critic and verifier? The latter contrast measures
the **whole checking workflow**, including reconciliation, not the separate causal contribution of
each role.

Four previously used cases were selected for these questions: a reconstructed real change,
`contact-import-v2`, `cohesive` and `required-trigger`. There were two reviews per case and arm:

| Arm | Workflow | Reviews |
| --- | --- | ---: |
| `plain` | Neutral request, no specialized review skill | 8 |
| `0.39` | Published `entrust:review 0.39.0`, one reviewer | 8 |
| `new-none` | Candidate, one reviewer, checking agents off | 8 |
| `new-checks` | Candidate, one reviewer, independent target, critic and verifier | 8 |

The eight `new-checks` runs used 24 checking sessions. Astra and Terra independently assessed the
eight delivered reviews for each case: eight assessment sessions. Total: **64 distinct model
sessions**. There was no multi-review with four direction helpers.

The recorded host was OpenCode CLI 2.1.2 and service 2.3.0. All reviewers and checking agents were
host-reported `openai/gpt-6.1-terra#xhigh`. Assessment used Astra at the host default and Terra at
`xhigh`. The review and checking sessions were separately
conducted OpenCode root sessions, not native child sessions. Each arm received the same ordinary
request, task and change; a skill arm also received its assigned package and approved plan. The
host-projected history contained the assigned skill body and plan in all 24 skill reviews, and no
skill attachment in the eight plain reviews. It is not the provider's raw payload.

The full plugin trees were frozen. SHA-256 of their paths and bytes:

| Package | Paths-and-bytes SHA-256 |
| --- | --- |
| 0.39.0 | `fa94caabcdd13fe15875170d51433df128d383d86c6d4c758ae77241880606dc` |
| Candidate | `ec1f132b114e3602ef888a492abbaedecc609e6408dcbedfe42f9e7c109844a2` |

For this digest, regular files are ordered by relative path using Python `pathlib` ordering. For each,
the UTF-8 path and file bytes are each preceded by their decimal byte length and a colon. Empty
directories and file modes are excluded; neither frozen plugin contained a tracked symlink. A digest
identifies bytes, not their delivery, safety or correctness. The real case's 9,463 manifested files,
brief and diff matched the saved reconstruction, but its historical dependencies, backend and
production behavior remain incomplete or unverified.

Assessors received the task, source and user-delivered responses with accessible linked artifacts,
under neutral labels. Their original assessments were retained independently. Report format could
reveal an arm, and filesystem isolation was not enforced. The cases are formative, not held-out
confirmation or a representative production sample.

## What the reviews delivered

### Reconstructed real change

- Both assessors found the main behavioral risk in all eight reviews. A direct-data alternative
  appeared in 1/2 plain reviews and 2/2 reviews in each skill arm.
- No review fully demonstrated a better decomposition of the combined rule structure according to
  both assessors. An imperfect structure alone does not make a split mandatory.
- One `new-checks` review distinguished the transition rule from automatic refresh and described the
  tradeoff to both assessors' satisfaction. For the other, Astra rated the alternative met at design
  level; Terra rated it partial because a trigger reachable before stale validation blocks an
  unchanged submit was not established. Other arms omitted or partially treated that tradeoff.

### Contact import

- Both assessors rated the actionable target criterion D2 met in 2/2 reviews of each skill arm and
  partial in both plain reviews. This is a case-specific result, not a general superiority claim.
- Both rated the concrete maintenance/change-burden criterion D1 fully met in one `new-none` review;
  none of the other reviews met it by both assessments. The assessors differed on whether the two
  plain reviews were partial or missed.
- All eight reviews identified substantive behavioral issues. The task requires observable behavior,
  not one particular parser or helper structure.

### Cohesive change

- Both plain reviews accepted without findings, a defensible production judgment, though one
  assessor found their explanation thin.
- One 0.39 review presented removing an extra lookup as the default fix; both assessors considered
  that too prescriptive while acknowledging its qualification and tradeoff.
- Both `new-checks` reviews found real test gaps. Both assessors judged the demand to add the tests
  before acceptance stronger than established. That is a priority judgment, not proof the tests are
  useless or that production code is broken.
- One 0.39 review found a future-revision test gap that neither `new-none` nor `new-checks` reported
  in their two reviews each. A local mutation confirmed that specific gap.

### Required autonomous trigger

- All eight reviews preserved the required autonomous scheduling. The task and a historical rubric
  conflict on one validation detail; both assessors followed the task and recorded the conflict.
- Both `new-checks` reviews identified an assertion inside a callback whose exception could be
  swallowed; the other six did not. A local mutation of one cancellation return passed all five
  tests, corroborating that specific blind spot. A broader mutation failed a separate test.
- Some 0.39 and `new-none` reviews treated an optional guard/representation change or a scheduler
  interpretation too categorically in the assessors' judgment. The assessors also differed on
  whether a particular shared-validator recommendation was mandatory.

## Checking agents and regression signals

The eight delivered `new-checks` records report critic: 27 accepted and 8 sent to the owner;
verifier: 11 accepted; independent target: 2 accepted and 11 sent to the owner. No challenge was
recorded as rejected. These are reviewer-recorded dispositions, not independent proof of correctness
or an isolated causal estimate of a role's value.

The saved drafts and checking returns give narrower process evidence:

- In both required-trigger checking runs, the draft omitted the swallowed-assertion gap, the critic
  raised it, and the final record accepted it. The targeted mutation corroborates the gap.
- In both cohesive checking runs, the draft had no findings and the critic proposed test gaps that
  appeared in the final record. Whether those tests block acceptance remains a judgment.
- In one real-case checking run, refresh was already an owner question in the draft. The critic
  raised the stale-submit limitation and the verifier qualified form propagation; the final target
  added the trigger-before-submit caveat.

These traces do not show what the same reviewer would have found without checking agents. In one
`new-none` contact-import record, a block also described an empty-name rejection as proceeding to
email validation, while the source continues to the next row. This and the missed cohesive test gap
preclude an unqualified “no regression” claim; the sample does not establish causation.

The final target text changed after checks in 8/8 runs, and the set of finding titles/directions in
6/8. These are textual comparisons, not quality scores. Assessors did not receive the complete
checking-agent returns or pre-check drafts, so they did not independently attribute contributions.

## Time

Elapsed time is submission to the delivered result, including checking waits and conductor handoffs.
The first 14 reviews were sequential; the remaining 18 ran with at most four reviews in flight.
Case mixes and cohort sizes differ, so the medians are not a clean causal speed comparison.

| Arm | Sequential median (n) | Parallel median (n) |
| --- | ---: | ---: |
| `plain` | 47.0 s (3) | 36.9 s (5) |
| `0.39` | 220.4 s (2) | 220.4 s (6) |
| `new-none` | 218.6 s (5) | 168.2 s (3) |
| `new-checks` | 594.0 s (4) | 409.0 s (4) |

For transparency, the following are medians of **two runs per case and arm**. `S` and `P` identify
sequential and parallel runs; the values must not be read as matched-load comparisons.

| Case | `plain` | `0.39` | `new-none` | `new-checks` |
| --- | ---: | ---: | ---: | ---: |
| Real | 148.4 s (S/P) | 303.6 s (P/P) | 318.4 s (S/S) | 599.2 s (S/S) |
| Contact import | 47.1 s (S/P) | 220.4 s (P/P) | 202.3 s (S/S) | 536.6 s (P/P) |
| Cohesive | 25.6 s (P/P) | 165.7 s (S/P) | 158.0 s (S/P) | 387.9 s (S/P) |
| Required trigger | 36.5 s (S/P) | 212.1 s (S/P) | 167.0 s (P/P) | 503.2 s (S/P) |

One `new-none` review includes 91.82 s of operator investigation before resume after an incorrect
attachment-hash comparison. In the first manually conducted `new-checks` run, operator handling
added 102.7 s after the initial reviewer and target were idle and 40.0 s after the checking agents
were idle. These delays remain in the raw times. Across the eight checking runs, critic/verifier
dispatch to both becoming idle had a median of 116.8 s, and reviewer continuation after return
139.5 s; these intervals cannot be added to initial review time without accounting for overlap.

The 32-review phase spanned 124.7 minutes, the gap before assessment 9.7 minutes, and the eight
assessments 7.9 minutes: 142.4 minutes from first review submission to final assessor idle. This
includes operator waits, the move to parallel execution and a preflight pause, but not preparation
before the first submission.

## Host token counters

Per-review medians across eight runs. For `new-checks`, each category is summed across the reviewer
and its three separate checking sessions. The categories may overlap and must not be added together.

| Arm | Input | Output | Reasoning | Cache read |
| --- | ---: | ---: | ---: | ---: |
| `plain` | 19,370 | 958 | 256 | 55,232 |
| `0.39` | 50,639 | 6,788 | 1,530 | 645,120 |
| `new-none` | 56,764 | 5,714 | 1,056 | 443,904 |
| `new-checks` | 169,572 | 19,505 | 4,153 | 1,856,192 |

The median host cache-write counter was zero in each arm.
Across all 56 review and checking sessions, the separate host counters were 3,183,865 input,
281,454 output, 62,522 reasoning and 35,257,472 cache-read. The eight assessors added 861,887,
36,780, 5,320 and 2,894,720 respectively. Each of the five host token counters for all 56 review
and checking sessions matched the sum of that session's projected assistant-message counters.
Provider billing semantics and conductor usage remain unknown.

All 64 host-reported costs were zero. No provider invoice was checked: **monetary cost is unknown**,
and zero is not evidence of free usage.

For a separate static measure, splitting on whitespace across five selected pages gives 8,208 words
for the 0.39 review page, data contract, design standard, structural examples and interactive-report
reference; the corresponding candidate set replaces the interactive reference with the agents
reference and totals 6,650. The sets differ and this is not a measurement of what a model received
or read. The observed input/cache/output counters above do not establish a general resource gain.

## Fidelity and limitations

- Two parallel preflights initially failed to find the assigned skill while the host catalogue was
  incomplete. No model session was created for either. The failures were retained; after owner
  approval and source verification, each received its first model attempt. No review was silently
  replaced.
- Ten delivered records referred to auxiliary files present in the original review outputs but not
  copied to assessor workspaces. Assessors had the task and diff separately but could not inspect
  some target sketches and mutation directories. This was an **assessment-preparation limitation**,
  not proof the reviewer failed to save those files. Four cohesive mutation variants were
  subsequently rerun locally: all 15 existing tests passed for each. Original assessments were
  retained, not silently rewritten.
- Five reviews delivered revised records. The delivered revised records, not just their drafts,
  were independently checked against their saved diffs; all five structural checks passed.
- The assessor instruction template was written after the first reviewer was dispatched but before
  its response was inspected. Labels and assessor order were randomized after reviews and before
  assessment. This limits claims of complete pre-registration or blinding.
- No external network tool call or obvious shell network command was observed in captured
  transcripts. This heuristic does not prove network isolation. No real application, live backend
  or actual `arc diff` output was validated.
- Raw private inputs, transcripts, outputs and local paths are not published. Public synthetic
  cases and the prior record are available in the repository; the real case cannot be independently
  reconstructed from this record.

## Interpretation and decision boundary

The checking workflow produced useful, independently corroborated findings in these runs. It also
had higher observed resource counters and end-to-end latency, and two reviews made test
recommendations the assessors considered too categorical. Neither these observations nor the small
samples establish that checks are generally better, unnecessary, or that a particular checking role
can be removed.

In a separate post-study consultation, Astra and GLM received only anonymized aggregates and
recommended making the checking group opt-in rather than launching the trio by default. That is
their practical risk/cost judgment, not a further source-grounded assessment. Both cautioned against
removing an individual role based on reviewer-reported acceptance counts. Those two consultation
sessions are outside the 64-session study.

The coordinator's judgment is more cautious about changing the default: the user prioritizes
avoiding review regressions, checks demonstrably helped in some runs, and the tested candidate is
not the current PR head. Keep the observed benefit and expense visible; do not automatically switch
the default or declare no regression from this sample. A focused assessment of the current head may
be useful before adopting its changed behavior, but a new full experiment is not implied by these
results.
