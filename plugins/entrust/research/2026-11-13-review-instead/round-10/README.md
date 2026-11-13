# Round 10: applying reviews and extending the resulting code

## Approved question and scope

After applying a review, does the resulting code accept a concrete new requirement through a bounded change
without duplicated policy or altered unrelated behavior? The owner reduced the proposed panel to one judge:
two Terra/xhigh implementations, two fresh Terra/xhigh extensions and one Carbon/high assessment. GLM is
reserved for a concrete material dispute that source/tests cannot resolve, not part of the default schedule.
No second judge was scheduled.

This is not a draft-version comparison. Both draft28 reviews from round9, r01 and r04, are included without
best-result selection. Source and reports are pinned to `d7e2e664`. Earlier drafts, results and the shipping/
installed skill remain unchanged. No task-only arm, clean-target model runs, private project, browser or images
are included. The synthetic example's local tests are explicitly part of this outcome experiment.

## Frozen sequence

1. A01/A02 each received an isolated copy of contact-import-v2/head, the [original task](original-task.md) and
   one canonical full review.json. The future requirement, evaluator, reference and other outputs were hidden.
   They could verify/reject a recommendation, choose their own structure and run local tests.
2. Completed A trees were frozen and checked against the original 13 acceptance checks and their own suites.
   B01/B02 each received the corresponding passing tree in a new repository with one commit, no dirty-head
   history, review files or actor reasoning, plus the original task and [new requirement](next-requirement.md).
3. Fresh B actors added previewImport and meaningful tests. Frozen B trees were independently checked against
   the old suite and 14 preview/compatibility checks, comparing with frozen A where appropriate.
4. Carbon receives both before/after trees, exact diffs, contracts, test source and results under neutral path
   IDs. Reviews, actor reasoning, time/token metrics and histories are excluded. The coordinator checks its
   source-backed conclusions and adds telemetry only after its verdict.

A failing A would not advance or be silently repaired/replaced; both A failures would stop before B/judging.
All branches remain in the denominator. B failures remain visible. Only the explicitly selected cells were
prepared; implement.mjs/outcome.mjs were not run with their automatic extra arms or clean-reference metrics.
[Prompt templates](prompts) preserve the used boundaries. [Manifest](manifest.json) records identity and hashes.

## Evaluator prepared before A

The preview contract requires the same declared result fields on equal initial stores, no insert/rename calls
or mutation of read contact objects, repeatability, preserved parsing/rejection behavior and unchanged normal
import. It does not prescribe helpers, an effect-switch form or a new same-name counting rule.

[Evaluator](evaluator) reuses the pinned 13 original checks and adds 14 checks across fixed scenarios. Five
fixtures have independently specified expected results; the same-name case preserves frozen-A policy. B import
results/stored names are compared with frozen A, so equality between a jointly wrong preview and B importer
is not the only oracle. Preview checks intercept writes and direct/transient mutation of returned contact
objects. Ordinary import is not required to perform an unnecessary rename when the name is unchanged.

Each check runs in its own Node process with a five-second timeout; failure and unfinished status are separate.
Own suites run separately with a 30-second timeout. New tests were frozen before A and never shown to actors.
They cover specified scenarios, not every possible input or all undocumented return fields. Carbon also reads
code/test changes; passing checks alone do not establish total compatibility.

[Calibration results](calibration/summary.json) were collected before actor dispatch. Correct preview passes
13 old + 14 new checks. A write-performing preview fails six new checks, a transient-object-mutation variant
fails three, and a shared last-valid-to-first-valid bug in both operations fails two old and two compatibility
checks. No calibration run was unfinished. These were deterministic local checks, not extra model sessions.
The four [import overlays](calibration) reproduce the candidates when placed over the pinned fixture's clean
reference tree; that reference was isolated from every actor and is not a model evaluation target.

## Assessment

[Criteria](judging-criteria.md) and [schema](judging-schema.json) were frozen before A. Locality is evaluated by
rule ownership, data crossing boundaries, unrelated semantic rewrites and policy duplication. Moving/extracting
an existing coherent block is distinguished from rewriting decisions. Helpers/files/lines do not determine a
winner, and a bounded effect switch is not automatically a defect. The judge must demonstrate any claimed cost.
Equal or converged structures are valid outcomes, not reasons to force a contrast.

## Observed execution before judging

Both A implementations passed 13/13 independent checks. A01's own suite passed 13 tests; A02's passed 12.
Both left clear sequential phases inside the importer: A02 explicitly declined the suggested planning helper.
The coordinator did not force the report's suggested shape. A02 retains an extra rows result, whereas A01
returns the three required fields; both preserve case-insensitive headers inherited from the starting code.

Both B results passed 13/13 old and 14/14 new checks. Their own suites passed 16 and 15 tests. Each exposed a
shared private processImport and gated only insert/rename through an apply boolean; validation, duplicate
selection and counting remained shared. This is a source observation, not yet the judge's locality ruling.
Snapshots, evaluator and criteria hashes were unchanged after verification.

Both B actors requested approval because their isolated context did not make the user's existing authorization
sufficiently explicit. The coordinator supplied only that authorization and unchanged scope, not a technical
solution. B01 continued its ongoing turn; B02 continued the same actor after a read-only handback. All their
usage/turns remain included. This operational interruption is not a code difficulty and confounds naive timing
comparisons. Future dispatches should state the approved scope clearly from the start; original prompts remain
preserved rather than retroactively rewritten.

## Limits and status

The probe was chosen with knowledge of the reviewed targets. It tests one familiar decision/effect boundary,
not held-out general maintainability, causal value of the skill without controls, or a helper's superiority.
Two paths and one extension do not provide a reliability estimate. Both may work equally well.

## Results and coordinator verification

| Path | A: original checks / own tests | B: original + preview checks / own tests | Carbon locality |
| --- | --- | --- | --- |
| A01 -> B01 | 13/13; 13 passed | 13/13 + 14/14; 16 passed | local |
| A02 -> B02 | 13/13; 12 passed | 13/13 + 14/14; 15 passed | local |

[Carbon's full assessment](carbon.json) supports both original/preview contracts, single rule ownership and
relevant tests, with no unrelated semantic changes or unnecessary new mechanisms reported. [Results](results.json)
retain the individual ratings and observed checks rather than an architecture percentage. The judge gave no
forced winner: both used the same bounded change, with minor pre-existing data/test differences.

The coordinator checked the key reasoning directly. Both A versions fully parse/validate and deduplicate by
normalized email before storage. `findByEmail` and `insert` share normalization; `rename` identifies by id and
changes only the name. Therefore skipping writes for one unique key cannot change classification of a different
key in this fixture. B merely adds the shared-handler entry points and gates insert/rename; validation, selection
and counting stay in one place. This supports the local-change verdict without requiring another model.

Carbon's wording that storage operations share normalization is slightly imprecise for rename; it uses id/name,
not email normalization. That source-level clarification does not alter the argument above. Its optional test
suggestions are not demonstrated failures: the external checks already catch transient mutation for both paths.
No measured artifact was edited after the verdict to improve its score.

Some residual quality differences remain. A02/B02 preserves an extra pre-existing rows output, and its contacts
Map carries a raw email property that the persistence loop never reads. A01/B01 carries only the required name
value. These are not introduced by preview and do not invalidate tested contracts/locality; successful extension
is not a certificate that every line in A was necessary. Carbon's suggestions and these coordinator observations
are recorded without silently fixing frozen code.

## What was learned

The reviewed targets produced working implementations on the tested cases, and a fresh implementer could add
preview without duplicating business policy or rewriting unrelated rules. That is a concrete positive result
for this particular reviewed code and extension, beyond a reviewer's promise to improve structure.

Both A actors nevertheless chose inline phases, including the actor whose review proposed a planning helper.
Thus the experiment does **not** establish a helper-vs-inline advantage: the intended shape contrast did not
survive implementation, and none was forced. It also cannot establish draft28 superiority or the skill's causal
benefit versus unaided work. No control arm or such comparison was run.

Do not add another mandatory decomposition rule solely from this result. The useful boundary here was that
selection/deduplication completed before effects, not the existence of a particular helper name. A bounded
apply switch solved the actual new requirement without new policy copies. A different requirement may expose
a different cost; no broader maintainability claim is made.

## Effort and operational limits

[Native usage](usage.json) includes every turn, including the B authorization clarification. A actors completed
in about 58–61 seconds. B01's single turn includes its approval wait; B02 ended and resumed, so its summed task
duration differs from session elapsed time. Their session elapsed times were about 118 and 136 seconds. These
are not clean measurements of implementation difficulty; cache and control-flow effects are disclosed.

[Carbon usage](judge-usage.json) is separate: one assessment took about 5.3 minutes, with no format-correction
turn. It did not receive telemetry before judging. Native and adapter token semantics differ; reported counters
are not summed into a billed-cost claim. Coordinator and Luna transport work are excluded from those counters.
GLM was not launched because source/tests resolved the remaining concrete questions. This uses the approved
four actor roles and one judge, while making the additional authorization turns visible.

Completed: two A implementations, two fresh B extensions, local own/external tests, one Carbon assessment,
source/packet/hash checks and coordinator source verification. No extra cohort, clean-target model run,
shipping/installed-skill change or release was performed.

## Publication verification after interruption

The temporary orchestration directory was unavailable when publication resumed. No experiment was rerun.
All four saved trees were checked against the manifest and all four patches replayed to those exact hashes
from the pinned input or preceding A snapshot. JSON, links and public-content checks passed. The whitespace
check passes excluding stored patch files; its full output flags blank context-line markers inside those
patches, which are preserved verbatim because replay confirms their validity. Raw transient-log availability
was not reverified; the public bundle preserves code, check results, judge output and metrics.
