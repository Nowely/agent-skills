# Round 9: responsibility diagnosis and actionable design

## Question and frozen scope

Can a review explain a concrete responsibility burden and propose a usable, behavior-preserving target,
beyond listing bugs or naming phases? The owner approved continuing with the existing
[contact-import-v2/head](../../../evals/review/cases/contact-import-v2/brief.md) fixture in the same small
comparison: two fresh Terra/xhigh reviews each with full draft25 and full draft28, then independent Carbon
and GLM judgments. No implementation, clean target, unaided arm, project/test/build execution, browser or
image work is included. The original private snapshot is not a target.

The source's import loop mixes parsing, field interpretation, duplicate decisions, mutations and counts.
Its existing rubric already separates D1 (a specific reading/change burden) from D2 (a concrete target with
data, ordering and a decision/effect boundary). Existing parser/email helpers are available. A finding about
a functional defect alone cannot pass D1; naming parse/validate/plan/write alone cannot pass D2. Neither a
function count nor agreement with a reference's shape is a success criterion.

## Inputs and isolation

[Manifest](manifest.json) freezes the source, complete skill package hashes and b/a/a/b order. Packages are
byte-identical to round8: draft25 at `9ee0189c`, draft28 with the frozen entrypoint/data contract and draft27
structural examples. No instructions were revised in response to round8. This compares complete packages;
it cannot attribute a difference to one specific sentence or example.

Four isolated source/task/package copies use the same [neutral prompt](reviewer-prompt.txt), differing only
in run paths. The rubric, reference, previous results and expected recommendations are not in reviewer input.
The temporary root is named only by round/date, without a topic hint. Every started attempt and in-session
repair is retained. Source/package hashes and final artifact checks are independent integrity checks, not
proof of semantic correctness.

## Assessment

Both judges receive the identical source/task/rubric and complete reports under randomized IDs; only local
run paths are relocated. They do not see the arm mapping, tested instructions, prior scores or each other's
answer. Style can still reveal an arm; perfect blinding is not claimed. Frozen [criteria](judging-criteria.md)
and [answer schema](judging-schema.json) keep D1/D2 separate from F2–F8 (reuse, behavior, tests) and X1–X3 traps.

Four independent dimensions record mechanism identification, necessity/cost, responsibility boundaries and
behavior preservation, with supported/partial/unsupported/unresolved/not-assessed/not-applicable outcomes.
A bug score cannot substitute for design evidence. A concrete target must preserve parse-before-write,
last-valid normalized-email selection, unique counts and rejection reporting. Missing choices/evidence stay
visible rather than being silently completed by the judge. Both raw ratings and disagreements are retained;
there is no overall architectural-recovery percentage or automatic instruction-change threshold.

## Limits

This is a two-per-arm diagnostic on a familiar, small synthetic fixture, not an admitted or held-out benchmark.
No unaided control estimates the skill's added value. The fixture has multiple obvious behavioral defects,
so a good behavior/reuse result may still conceal weak design analysis. It provides no architecture probes;
without implementations and follow-up changes, supported D1/D2 establish proposed quality, not recovered
locality in working code. Cohesive nearby helpers can be preserved, but no separate clean-target safety
comparison is included. Earlier results, the fixture/rubric and shipping/installed skills stay unchanged.

## Reviewer workload and artifact repair

[Per-run measurements](usage.json) count unique native response usage and verify it against cumulative usage.
Cached input is part of input and reasoning part of output. These are repeated request tokens, not unique
context lengths. Judge/coordinator/relay work is excluded from this reviewer comparison.

| Mean reviewer workload (two per arm) | Draft25 | Draft28 |
| --- | ---: | ---: |
| Total tokens, including cached input | 401,070 | 462,544 |
| Uncached input | 22,082 | 21,779 |
| Output tokens | 7,532 | 8,061 |
| Duration | 154 s | 165 s |
| Normalized JSON bytes | 28,362 | 31,633 |
| Tool steps | 8 | 9 |

These samples establish neither stable efficiency nor an invoice-cost difference. Both full packages remain
unchanged; cache/read choices and in-session artifact work contribute to the measured variation.

One candidate report initially marked its importer `split` while proposing reuse of existing units only. The
checker rejected it because no new target unit was named. The reviewer changed the label to `fix`; both
`target` and `target_units` stayed unchanged. It later qualified a retry-error claim and refined
a reuse decision. The same run remains included with its full cost. [Audit](audit.json) preserves the exact
checker diagnostic and unchanged-target hashes. This does not show that the checker prevented a useful
structural proposal; it shows that the split-label count is not an independent quality measure.

Four final artifact checks passed; source/package bytes were unchanged. Visible reviewer commands read source/
Git, write permitted output artifacts and use the supplied report checker. No project execution occurred.
The [published reviews](reviews) retain substantive text with local paths relocated; original artifacts and
native logs stay local. Report validity is not semantic correctness or an OS-enforced sandbox guarantee.

## Results: useful targets, disputed diagnosis depth

| Result (two reviews per arm) | Draft25 | Draft28 |
| --- | ---: | ---: |
| D1: full diagnosis agreed by both judges | 0/2; both disputed | 0/2; both disputed |
| D1: Carbon / GLM | partial / hit in both | partial / hit in both |
| D2: actionable target agreed by both | 2/2 | 2/2 |
| F2–F8: reuse, behavior and test items | all hit in both | all hit in both |
| X1–X3 harmful/scope traps | none triggered | none triggered |
| Responsibility-boundary dimension: Carbon / GLM | partial / supported | partial / supported |

Both judges support the concrete target in all four reports: fully parse with the existing parser before
writes; validate and select the last valid row for each normalized email while recording rejections and their
original line numbers; then apply once per unique key and count creates/updates. Existing helpers and store
contracts remain, while modes/retries/silent domain filtering are removed. They support mechanism identification,
necessity/reuse and static behavior preservation. No unsupported recommendation was reported.

Two reports name a pure planning helper (`planImport` / `prepareRows`); two keep the stages within the importer.
Each arm contains one of each. Carbon groups all four as substantively equivalent; GLM separates the two forms
while describing the same root target. This grouping difference does not establish an arm advantage. The helper
names/counts were not grading requirements.

### The disagreement is preserved

[Carbon](judgments/carbon.json) gives D1 partial in all four: the reports describe coupled state/effects but
justify the boundary primarily through parse-before-write and duplicate-count correctness, without showing a
concrete reading trace or change burden. [GLM](judgments/glm.json) gives D1 hit: it accepts that described
coupling and required reordering as a sufficient diagnosis. Their responsibility-boundary ratings differ for
the same reason. [Per-run ratings](results.json) preserve all eight categorical disagreements (two fields in
each run); there was no regrade, consensus pressure or averaging. Evidence uses blinded `u` IDs; results map
them to the published `reviews/r*.json` files.

The coordinator leans toward Carbon's stricter interpretation of the pre-frozen D1 distinction. The code paths
and functional consequences are concrete, but the added claim about reading/changing the design is less clearly
established. This is an interpretation, not another independent judge or an overwrite of GLM's rating. It does
not make the jointly supported D2 targets useless. D1 currently distinguishes depth of design explanation;
its disputed score must not become a verdict that the proposed design is bad or that the skill cannot decompose.

Carbon also notes missing defensive handling of a header without required columns, while acknowledging that
the brief assumes both columns. That is outside the supplied contract, not an additional confirmed omission
or a reason to add speculative guards. Other differences, such as implicit removal of extra output and how
validation priority is distributed across report sections, remain in the detailed judgments.

### What this says about the skill

This round provides positive evidence that both full packages can propose a concrete responsibility/data-flow
improvement on an entangled case. It supplies **no observed incremental advantage for draft28 over draft25**.
Neither automatic skepticism about all decomposition nor a general architecture-success percentage is justified.
The remaining uncertainty is not only instruction wording: the D1 grading boundary itself produces different
interpretations, and no target has been implemented or evaluated under a subsequent requirement change.

Keep the current instructions frozen rather than write a new draft solely to make D1 wording appear. If further
validation is chosen, the more informative next question is whether applying these targets produces simpler
code that preserves behavior and makes one concrete follow-up change local. That would require a separately
approved implementation/probe protocol; it was not launched here. Do not expand this round or repeat reviews
until a favorable diagnosis score appears.

## Completion and cost limits

[Judge usage](judge-usage.json) is separate from reviewer usage. Carbon took about 12 minutes and GLM about
13.4 minutes, much longer than each ordinary review. Their raw adapter counters are not added to native tokens
or interpreted as invoice costs. Both returned complete valid assessments with no format-correction turn.
GLM's relay reattached once to the same still-running invocation after its observation window; it was not an
extra judge/session. The public source/task/rubric were independently matched to the public Git commit before
export, and the packet hashes were unchanged after both judges finished.

Completed: four static reviews, two independent assessments, source/package/packet identity checks and final
report checks. No application tests, implementations, clean targets, images or extra model experiments ran.
The fixture/rubric, earlier rounds and production/installed skill remain unchanged.
