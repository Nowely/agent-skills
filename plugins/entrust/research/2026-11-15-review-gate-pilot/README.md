# Review gate exploratory pilot

**Date:** 2026-11-15. **Status:** transferred exploratory record; four assigned reviews incomplete.

The later [continuation](../2026-11-15-review-mode-continuation/) completed four new reviews after
the owner clarified the prior authorization. It does not replace the attempts recorded here.

The gate-only preflight produced a plan and stopped. All four subsequent assigned review attempts
also stopped at the approval gate, each returning `Review not performed`. Their host outcomes were
`succeeded`, meaning generation completed, not that a review succeeded. Completed reviews: **0/4**.
Observed helpers: **0**. Canonical review reports: **0**. The intended single-versus-multi review-quality
comparison did not take place.

## Question, authorization and provenance

The owner approved a proposed two-stage exploratory exercise: a real review-package gate-only
preflight, followed by two selected synthetic variants, each assigned to single and multi review.
The approved proposal included the same requested model and skill, four helpers in multi mode,
OpenAI as provider, and standard OpenCode global instructions and context. The owner requested
execution without further confirmations. This is a paraphrase of the earlier decision, not a new
approval or permission to publish the owner's verbatim conversation.

The intended contrast was one reviewer versus a coordinator and four focused assistants using the
same review package. Both arms had the skill; neither was a no-skill control. This note uses the
[research method](https://github.com/Nowely/agent-skills/blob/716aa5d14d4880a6ec2df63880dd35b40212d75e/RESEARCH.md) and the
[review protocol](../../evals/review/protocol.md) for provenance and reporting, without claiming a
completed protocol comparison or a confirmatory experiment.

**All runtime statements below are transferred host observations supplied in messages by the
operator.** The writer did not inspect the original raw traces, reproduce the attempts, or independently
verify their runtime claims. Original raw traces remain local in ephemeral sessions and are not
archived here. The repository therefore does not provide those records for independent verification.
In repository evidence terms, the operator reports behavior made to happen; this transfer does not
convert it into independently verified level-3 evidence.

The [earlier synthetic attachment preflight](../2026-11-15-opencode-skill-attachment/README.md)
is separate prior work, not an additional attempt in this pilot. That note tested a synthetic marker
attachment; the preflight recorded here used the real review skill.

This public record contains authorized synthetic identifiers and summarized observations. It excludes
verbatim owner approval, session identifiers, personal filesystem paths, private instruction contents
and raw logs. The relay description below is a paraphrase, not an archived message transcript.

## Materials and environment

| Item | Reported identity or setting |
| --- | --- |
| Source checkout | `298a0a2e5d1a536f279be683624d942cc37ca109` |
| Review package | `plugins/entrust/plugin/skills/review` |
| `packageDigest` | `75cbbff65fb406205d9c0e8b635fc51707c35cf449f95e68cff240ee7fddd3ce` |
| OpenCode service | `2.3.0` |
| OpenCode CLI | `2.1.2` |
| Requested model | `openai/gpt-6.1-terra` |
| Requested variant | Default |
| Ambient context | Owner-approved global instructions and standard OpenCode context |

The [preparation instrument](../../evals/review/prepare.mjs) defines the ordinary prompt and the
path-and-content package digest. For all four main attempts, the operator reported checking frozen
case source-tree and brief digests against the checkout, identical base/head commits within each
case's single/multi pair, matching package digests, and intended registered source paths. The individual
case digests and generated commit IDs were not supplied for this public record; no values are
reconstructed here.

The cases had already been exposed and are formative material, not held out. The variant name
`clean` is a fixture label, not independent evidence of defect-free code. No blind-heldout claim is made.

Requested model settings and host versions do not establish provider payload bytes, effective effort,
or provider-side routing. Provider payloads, request counts and retry counts are unknown. Standard
global context means this was not an instruction-isolated experiment. Shell permission policy is
**not a sandbox**.

## Stage 1: gate-only preflight

Attempt **PRE** used synthetic `locale-options/head`. The host reportedly registered `review` at the
intended source. Its projected attachment included the original body text after removing frontmatter
and trimming surrounding whitespace. This is evidence of body text in a host projection, not a raw
provider payload or proof that linked references were delivered or read.

The ordinary user text was exactly the following, with LF separators and no trailing newline:

```text
Review the change.

Repository: .
Change: HEAD~1..HEAD
Task: ../brief.md
```

The participant read the task and metadata, produced a plan, and stopped before substantive review or
delegation. This observed attachment-and-stop behavior did not demonstrate passage through the
approval gate into review.

**Permission-plan discrepancy:** the plan proposed running tests and saving JSON, while session edit
permission was denied and only git-prefixed shell rules were explicitly allowed. The proposed actions
did not match the reported session permissions. This is not evidence that forbidden commands were
executed. Nor do those permission rules establish absolute inability to write or execute other
commands: shell prefixes and permission matching can leave bypass paths, and no sandbox was established.

## Stage 2: all assigned review attempts

These are all four assigned attempts, retained in their original arms:

| Attempt | Synthetic case / variant | Assigned mode | Host outcome | Review outcome |
| --- | --- | --- | --- | --- |
| r01 | `overdue-notice/clean` | Multi: coordinator + 4 focused assistants | `succeeded` | `Review not performed`; incomplete |
| r02 | `overdue-notice/clean` | Single reviewer | `succeeded` | `Review not performed`; incomplete |
| r03 | `currency-contract/head` | Multi: coordinator + 4 focused assistants | `succeeded` | `Review not performed`; incomplete |
| r04 | `currency-contract/head` | Single reviewer | `succeeded` | `Review not performed`; incomplete |

All used the same requested model/default variant and review package. The first ordinary prompt was
byte-identical to PRE's prompt above. Each projected user message reportedly included the root skill's
body text after removing frontmatter and trimming surrounding whitespace. Host projection does not
establish complete provider-side delivery or supporting-reference reads.

Each participant first returned a default single-reviewer plan with exact base/head identities.
The ordinary request contained no expected-finding hints or mode instruction. A default single plan
at this point is consistent with the skill's default; the assigned multi mode was communicated later.
Concrete hashes and these machine-generated plans were produced after the owner's earlier decision
and were not separately shown to the owner for approval.

### Additional operator-authored relay

Each attempt then received an additional user-role message authored by the operator. It explicitly
identified itself as a host relay of the owner's real earlier decision, not a new owner reply to the
displayed plan. It contained the actual prior approval, which is not republished here.

The relay:

- Identified the attempt's assigned single reviewer or coordinator plus four focused assistants,
  using the same requested model/default variant.
- Identified the fixed source revision and selected synthetic scope.
- Described permitted synthetic-run reads, local shell commands and helpers; prohibited project-source
  changes and posting comments.
- Stated that direct web tools were denied and shell was not sandboxed.
- Named output locations outside the repository: `../review.json` or `../artifacts/`.
- Accurately disclosed that the exact generated hashes and displayed plan had not been separately
  shown to the owner for approval.
- Asked the skill to assess the actual evidence under its preapproval rule and stop if insufficient,
  noting the owner's request for no further confirmation.

The relay varied by assigned allocation and was an experimenter-authored intervention. Only the first
ordinary prompt was identical; the full contexts were not. Emphasizing the lack of separate approval
and explicitly offering a stop may have primed caution. This record does not causally separate that
wording from the skill's gate wording.

### Returns and stopping

After the relay, all four returned `Review not performed`, citing insufficient approval covering the
exact diff/plan and relevant scope, allocation, permissions or output. These are participant-stated
reasons, not independently established deficiencies in the owner's original decision.

The transferred observations report no tools after the relay, no observed direct child sessions and
no canonical `review.json` in any attempt. No substantive review was completed. There were no
operator-initiated review-model retries, substituted modes, fabricated authorizations or further
confirmation requests to the owner. The additional relay turn was part of each assigned attempt,
not a replacement attempt. Provider-internal retries remain unknown.

Finding assessment, false-positive assessment, review-quality assessment and merge-loss assessment
were **NOT RUN**, not measured as zero. A separate quality evaluator had no completed review to assess.
Neither multi-review execution nor substantive single-review execution was observed, so this record
supports no mode-quality ranking or comparative effect.

## Catalogue diagnostic deviation

The initial four catalogue checks mistakenly invoked the CLI from the pilot directory and did not
confirm the intended IDs. Their raw responses were not retained. The operator separately inspected
configuration, then manually diagnosed discovery from each prepared repository's working directory.
Those later checks reportedly found the intended registered review/orchestrate IDs and source paths
for all four attempts.

Both observations are retained. Working-directory selection is a plausible contributor, not a proven
cause of the initial non-confirmation. The later diagnostic does not erase the initial collection
error. Registration establishes availability at that location, not model delivery or execution.
These were catalogue diagnostics, not retries of the review model.

## Raw host counters

The following values are transcribed from the supplied host observations, without normalization,
aggregation or independent verification:

| Attempt | input | output | reasoning | cache.read | cost |
| --- | ---: | ---: | ---: | ---: | ---: |
| PRE | 7370 | 479 | 67 | 7040 | 0 |
| r01 | 13361 | 597 | 80 | 25728 | 0 |
| r02 | 13494 | 667 | 81 | 38912 | 0 |
| r03 | 13387 | 620 | 54 | 25728 | 0 |
| r04 | 11378 | 575 | 125 | 27648 | 0 |

These are host counter fields, not an invoice. `cost: 0` does not establish a zero provider charge.
Counters may have different or overlapping accounting semantics; they are not added into an inferred
total. They establish neither provider request counts nor retry counts. Elapsed-time measurements were
not supplied for this record.

## Interpretation and limits

The [Plan rule](../../plugin/skills/review/SKILL.md#plan) accepts an earlier approved plan covering the
exact diff, scope, mode, allocation, permissions and result. It also requires stopping when the
necessary decision is unavailable. The observed stops are consistent with a conservative reading of
that rule under this relay; they do not prove that the skill always ignores prior approval or that
every participant-stated blocker was justified.

Later calculation of a hash does not by itself prove that an earlier approval failed to identify an
immutable object. Conversely, a file list, scenario label or package hash alone does not establish
approval of both sides of the reviewed diff and every other required field. Without examining the
actual original plan and its mapping to prepared inputs, this record cannot settle that distinction.
It does not treat the participants' refusal as an independent authorization audit.

The preflight permission-plan discrepancy is a process observation, not demonstrated execution of
prohibited commands. Host generation success is a separate endpoint from gate disposition, review
completion, delegation and delivered artifacts. Four incomplete attempts on exposed synthetic cases
cannot establish a general reliability rate, topology effect or review-quality difference.

A separate consultation with Astra considered summarized observations and judged that the relay could
confound interpretation. It did not inspect the original runtime records. This was process reasoning
from a transferred summary, not independent raw-trace verification or an independent quality judgment.

## Optional follow-up questions, not execution

- **Documentary approval-field audit:** compare the original proposal and decision with the prepared
  diff identity, assigned mode/allocation, permissions and result location. Classify each claimed gap
  as supported, contradicted or unresolved. Access and publication must respect the original records'
  consent boundary; this note does not publish or replace them.
- **Possible skill clarification:** determine whether an immutable source reference identifying both
  sides can bind an earlier approval before generated commit IDs exist, and how a host should document
  that correspondence without inventing authorization. This is a rule-design question, not evidence
  that the gate should be bypassed.
- **Keep design and permission questions separate:** distinguish identity/preapproval wording from
  whether a generated plan accurately reflects actual permissions. The existing Plan rule already
  requires permission accounting; the observed mismatch alone does not establish a need for another
  mechanism. A protocol clarification could separately label generation, gate, delegation and review
  endpoints and record the relay as an intervention.

These are optional owner follow-ups, not work performed or authorization for new runs. No skill or
protocol change accompanies this record. The pilot ends with its incomplete outcomes preserved;
there is no proposed replacement run, fabricated approval or further confirmation request.
