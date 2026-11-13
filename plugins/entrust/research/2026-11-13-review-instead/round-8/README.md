# Round 8: completing a related behavioral change

## Motivation and frozen scope

A partial repair can be individually correct yet leave related values with inconsistent behavior. The
fictional [locale-options case](../../../evals/review/cases/locale-options/brief.md) models four existing
labels evaluated at import time and two added labels evaluated at read time. The public contract requires
fresh reads to use the current locale, while saved selections preserve their creation-time text. The reviewer
must complete the connected behavior without imposing uniform syntax or making historical values reactive.
The fixture was written from scratch; it contains no private project code or identifiers.

The owner approved four fresh Terra/xhigh reviews of `locale-options/head`: two with the full draft25 package
and two with the full draft28 package, followed by independent Carbon and GLM judgments. Full `blocks` remain
in both arms. No clean target, no-skill arm, task-only implementation, application/test/build execution, browser
or image work is included. No new shipping-skill instruction or mode is being tested beyond the frozen drafts.

[Manifest](manifest.json) pins the source, complete packages and interleaved a/b/b/a order. Draft25 uses
`9ee0189c`; draft28 substitutes its entrypoint and data contract plus draft27 structural examples. Thus a
between-arm difference would concern these complete packages, not prove a causal effect of one sentence.
Every reviewer receives an isolated equal source/task copy and matching package, using the
[frozen neutral prompt](reviewer-prompt.txt). The neutral prompt differs
only in run paths, not requested review directions. The rubric, reference, prior reviews and expected fixes
are outside reviewer input. Every started attempt and repair stays in the record.

## Assessment

The [frozen criteria](judging-criteria.md) and [answer schema](judging-schema.json) assess the case rubric's
root diagnosis/remedy (F1), test gap (F2), and three traps separately. Four independent dimensions record
mechanism identification, necessity/cost, responsibility boundaries and behavior preservation. A dimension
can be not assessed or not applicable. A correct behavior repair does not establish architectural recovery.
No overall success percentage, helper quota or score averaging can hide missing dimensions.

Both judges receive the same source/task/rubric and full review records under randomized IDs. Only run-root
paths are relocated; claims and supporting block descriptions remain. They do not see arm labels, prior
scores or each other's assessment. Writing style may disclose an arm; perfect blinding is not claimed. The shared temporary root also contains
`consistency`, a topic cue common to both arms. It does not reveal the exact defect or remedy, but is an
additional limitation on calling the reviewer setup fully blind.
Both independent ratings and disagreements are retained; there is no automatic two-of-three threshold or
instruction change. The coordinator examines whether an observed difference comes from the method, fixture,
model execution or assessment.

This is a two-per-arm diagnostic pilot on a formative case designed alongside draft28. It is not an admitted
benchmark, held-out transfer evidence, reliability estimate or implementation experiment. The absence of an
unaided arm limits attribution to the skill as a whole. Successful findings on this small case do not establish
that the same issue would be found in a larger real repository.

## Reviewer workload

[All four measurements](usage.json) include every reviewer tool step and in-session artifact repair. Native
response counters were deduplicated and checked against cumulative usage. Cached input is a subset of input,
reasoning a subset of output; totals are repeated request tokens, not unique prompt size. Judge/coordinator/
relay work is excluded from this reviewer comparison.

| Mean per review (two per arm) | Draft25 | Draft28 |
| --- | ---: | ---: |
| Total tokens, including cached input | 434,754 | 409,842 |
| Uncached input | 31,854 | 21,197 |
| Output tokens | 5,844 | 5,605 |
| Duration | 125 s | 123 s |
| Normalized JSON bytes | 17,805 | 16,859 |
| Tool steps | 9.5 | 8.5 |

These tiny samples do not establish a stable efficiency difference. The first baseline review used 46,891
uncached input tokens versus 16,816 for its same-arm repeat; cache state and tool-reading choices materially
affect this comparison. No billed-cost claim is inferred.

## Execution integrity

- Four source/package hash checks and four final artifact checks passed. Report validity is not correctness.
- One candidate review initially omitted ownership of a removed test line; it repaired that block and passed
  its checker in the same session. The run and its full cost remain included.
- Visible reviewer commands contain source/Git reads, output-artifact writes and the supplied report checker.
  No application/tests/build or visual work ran. Raw native logs remain local; this is not an OS-sandbox claim.
- The first GLM launch was rejected before execution. After an independent check that source/brief/rubric
  matched the public Git fixture and the four reports came only from it, the same authorized launch proceeded.
  Model, rights and packet were not changed. No judge was replaced or exposed to the other's result.
- [Review copies](reviews) preserve substantive content; local source/run/artifact paths are relocated for
  publication. [Audit notes](audit.json) disclose recovery and the shared pathname cue.

## Decomposition follow-up

[Source/rubric inspection](decomposition-readiness.md) found existing material suitable for the next distinct
question: contact-import-v2 already separates a concrete coupling diagnosis (D1) from an actionable target
(D2). Slot-edit is useful for rule order and preservation/reuse of an explicitly required lifecycle. Neither
was run in this round. No new fixture, rubric or shipping instruction was needed for that inspection.

## Results and interpretation

| Jointly confirmed result | Draft25 (2 reviews) | Draft28 (2 reviews) |
| --- | ---: | ---: |
| F1: root consistency diagnosis and bounded remedy | 2/2 | 2/2 |
| F2: concrete test gap | 2/2 | 2/2 |
| Triggered harmful/scope traps | 0 | 0 |
| Mechanism identification / necessity-cost / behavior preservation | supported in both | supported in both |
| Responsibility boundaries / decomposition | not applicable | not applicable |

Both judges put all four reviews in one substantive equivalence group. Every reviewer traces import-time
translation of old labels versus read-time translation of new labels, keeps the old entries in scope under
the task's current-locale contract, and recommends completing behavior for the whole group. Every target
preserves IDs/order and plain-string historical snapshots. Existing translation/getter capabilities suffice;
no new reactive UI, framework, screenshots or browser requirement was proposed.

All four also identify the test gap: switching locale only for new entries cannot detect old stale labels.
English-label coverage and replacement of a legacy snapshot test are useful details of F2, not extra
independent root defects. Reviewer text differs in specificity and presentation, but the core target does not.
The historical-selection API is mentioned by all four; grading did not require naming it unless affected.

[Per-run results](results.json) retain separate judge ratings. [Carbon](judgments/carbon.json) and
[GLM](judgments/glm.json) agree on all categorical ratings; their additional test observations differ in emphasis.
They correctly mark responsibility boundaries **not applicable**, rather than treating a behavioral repair as
an architecture win. Their detailed answers are preserved with only local-path relocation. Evidence uses blinded `u` IDs;
`results.json` maps them to the published `reviews/r*.json` files. These ratings
support proposed repairs statically; no implementation was produced, so no completed-code recovery is claimed.
[Judge workload](judge-usage.json) is separate from reviewer usage; both returned valid complete outputs without
a corrective format turn.

The specific consistency failure is detected by both tested packages. The added draft28 wording showed **no
incremental detection benefit in this pilot**. This does not establish that the rule is useless elsewhere or
that the skill adds value over unaided review; that control was not run. The explicit task/README contract and
small fixture may make the problem easy. The case was designed alongside draft28 and the shared path supplies
a topic cue. Keep it as formative/regression material, not evidence of a new capability or a held-out benchmark.
The original neighboring task's real snapshot was not reviewed in this round.

## Decision and next steps

Keep both drafts frozen; do not change the production skill, remove the peer-consistency rule, or strengthen
it merely because these four reviews tied. No new draft or release follows automatically.

The agreed remaining quality question is whether a review can show a concrete responsibility burden and give
an actionable, behavior-preserving target. Existing contact-import-v2 already exposes that question through
D1/D2. Use its [readiness assessment](decomposition-readiness.md) to prepare a separately approved experiment;
there is no need to create another equivalent fixture or repeat the saturated private snapshot first.

Completed: four static reviews, two independent judgments, source/package/packet identity checks and final
report-data checks. No application tests, implementation, clean-target reviews, browser, images or extra model
experiments ran. Earlier rounds, fixture/rubric and the installed/shipping skill remain unchanged.
