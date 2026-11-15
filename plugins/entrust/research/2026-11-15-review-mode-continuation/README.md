# Single and multi review: formative continuation

**Date:** 2026-11-15. **Status:** four reviews completed; exploratory comparison, not a release gate.

The owner asked to complete the [previous pilot](../2026-11-15-review-gate-pilot/), whose four assigned
reviews had stopped at the plan gate. In this continuation, both modes completed reviews on both
previously used synthetic variants. The owner clarified that the earlier approval covered the selected
work and that displaying subsequently calculated hashes was not an additional condition of consent.

## Result

- On `overdue-notice/clean`, the multi result reported a UTC **test gap** that the single result did
  not. Astra independently demonstrated a local-date mutation that passes the existing suite in UTC
  but behaves differently in another timezone. The current UTC calculation is correct; this is not a
  demonstrated defect in that [implementation](../../evals/review/cases/overdue-notice/clean/src/jobs/nightly.js).
  The existing [tests](../../evals/review/cases/overdue-notice/clean/test/nightly.test.js) use `01:00Z`
  without controlling the process timezone. The single result separately raised a supported question
  about currency minor-unit conventions.
- On `currency-contract/head`, both results identified the currency substitution and missed CSV
  requirement and proposed the same overall simplification. Multi made the design and fallback issues
  more prominent in its short reply, but those concerns were already present in single's accessible
  JSON; they are not additional discoveries when the complete user-visible results are considered.
  The [normalizer](../../evals/review/cases/currency-contract/head/src/invoices/price.js) substitutes
  USD for codes outside its allowlist; the [CSV](../../evals/review/cases/currency-contract/head/src/export/csv.js)
  reads the archive currency without changing its case.
- Astra found no incorrect mandatory recommendation within the examined scope. Unknown scheduler,
  storage and delivery contracts remained questions rather than proven production defects. The
  assessment and its [English translation](assessment-en.md) are model judgments, not ground truth.
- In a separate secondary pass, Astra found no material loss of grounded helper conclusions during
  synthesis. A tests helper and the multi result both included the UTC gap, but no preserved
  pre-synthesis coordinator record establishes that the helper caused the final observation.

These are observations on two exposed, formative cases and one pair per case. They do not establish a
general quality or speed advantage. The permission repairs below also make the paired contexts unequal.

## Materials and assigned results

Both arms used the `review` package from checkout `298a0a2e5d1a536f279be683624d942cc37ca109`,
`packageDigest` `75cbbff65fb406205d9c0e8b635fc51707c35cf449f95e68cff240ee7fddd3ce`.
The supporting `orchestrate` copy was separately checked. Each pair's prepared base/head trees and task
matched the chosen source variant. `clean` is a fixture label, not a proof that a change has no possible
finding. The cases and their history are in the [instrument](../../evals/review/README.md#cases).

| Case | Assigned mode | Assessment label | Outcome | Delivered artifacts |
| --- | --- | --- | --- | --- |
| `overdue-notice/clean` | Single, n02 | P1-A | Complete after operator permission repair | [response](runs/overdue-single/response.txt), [review.json](runs/overdue-single/review.json) |
| `overdue-notice/clean` | Multi, n04 | P1-B | Complete | [response](runs/overdue-multi/response.txt), [review.json](runs/overdue-multi/review.json) |
| `currency-contract/head` | Single, n03 | P2-A | Complete | [response](runs/currency-single/response.txt), [review.json](runs/currency-single/review.json) |
| `currency-contract/head` | Multi, n01 | P2-B | Complete after operator permission repair | [response](runs/currency-multi/response.txt), [review.json](runs/currency-multi/review.json) |

The response files reproduce projected final text with trailing whitespace and the terminal newline
normalized. Their original relative report links referred to the temporary run directories; use the
adjacent JSON links above in this archive. JSON files are copies of the saved user-accessible reports. All four passed the operator's
independent `report.mjs check` against their diff; this checks structure and line ownership, not
factual correctness.

## Procedure and interventions

The first user message was byte-identical in all four sessions:

```text
Review the change.

Repository: .
Change: HEAD~1..HEAD
Task: ../brief.md
```

The host attached the same skill separately. Each session initially returned a single-reviewer plan.
The operator then relayed the owner's actual prior authorization and the assigned mode, identifying
the message as a host relay rather than a new owner reply. The relay did not include expected findings.
The multi assignment named the four directions. These later messages and assistant briefs differed by
mode; complete model inputs were not identical. The earlier failed attempts and their more leading
relay remain recorded in the [previous pilot](../2026-11-15-review-gate-pilot/); they are not replaced by
these reviews.

The operator initially added restrictive session and project rules. In n01 this made the coordinator's
model lookup unavailable; it stopped without reviewing. In n02 relative reads of required review
references and `package.json` were denied; it returned a [partial response](runs/overdue-single/partial-before-permission-repair.txt).
The n01 [blocked response](runs/currency-multi/blocked-before-permission-repair.txt) is also retained.
After the owner requested the ordinary environment, the operator removed those restrictions and resumed
the same two sessions. The other two sessions started after that correction. Consequently n01 and n02
retain extra failed/partial steps and intervention messages. They cannot be treated as clean,
one-shot counterparts to n03 and n04.

Ordinary OpenCode permissions and global instructions applied after the correction, with the agreed
specialized-review-skill exclusions. The shell and plugins were not a sandbox. No claim of filesystem or
network isolation is made. Per the owner's selection, OpenCode reported `openai/gpt-6.1-terra`, default
variant, for all four coordinators/reviewers and all eight direct helpers; no grandchildren were
observed. Those are host-reported model settings, not inspection of raw provider payloads.

The eight direction briefs contained no operator-supplied suspected findings. The archived
[currency briefs](helper-briefs/currency/) and [overdue briefs](helper-briefs/overdue/) have local paths
redacted; their [currency returns](helpers/currency/) and [overdue returns](helpers/overdue/) are
diagnostic evidence, not additional user-delivered findings. In the assessment, `n01-*` names the
currency returns and `n04-*` names the overdue returns. Host tool histories show completed calls
for the report-data, design-standard and structure-example references in all four root sessions, and
a completed skill-page read by each direct helper. A completed read does not prove comprehension or the
complete provider input.

In n02, an initial `report.mjs check` failed on two uncovered removed lines, then passed after
self-repair. In n04, an initial check failed on uncovered added/removed lines, then passed. These are
ordinary workflow steps retained in the attempts; the available evidence was not used to claim that
the repairs could only have affected presentation.

## Assessment and limits

The owner selected **Astra** for evaluation. An already-started Terra evaluator was interrupted at
that request; no verdict from it was used. Astra's first pass used neutral A/B labels, the source,
task, final response and accessible JSON. The complete reports can reveal the mode, so the assessment
was not fully blind. A later pass disclosed which outputs were multi, inspected helper returns and
used the published rubrics only as a source-checked secondary checklist. The original Russian
assessments remain in local session/temporary records; this archive provides Astra's
[English translation](assessment-en.md), with trailing whitespace normalized, not a verbatim raw log.

Astra ran `node --test` in both synthetic repositories: four tests passed in each. It independently
reproduced the currency output problems, checked the whole proposed boundary-normalization and
shared-formatter alternative in memory, and tested the UTC/local-date distinction with an in-memory
mutation. It found the rubric's claim that archive-boundary normalization is the only acceptable
architecture stronger than the task itself; it also did not treat an overlap question as a proven
production race. Its full reasoning, source references and unresolved assumptions are in the
translation. No independent second evaluator was used.

The [host telemetry](telemetry.json) reports the root and each helper separately; [evaluator telemetry](evaluator-telemetry.json)
includes the interrupted Terra assessment and Astra's two assessment passes and translation. Root
`last_turn_ms` is only the final busy-to-idle interval, not end-to-end review time: n01/n02 had earlier
blocked or partial work, and sessions overlapped. Cache and token counters have potentially overlapping
accounting; do not add them as unique context or infer an invoice. The host reported cost `0`, which
does not establish that the provider charged nothing. Provider payloads, exact request/retry counts and
effective effort beyond reported metadata remain unknown.

This archive contains synthetic reviewer outputs and sanitized helper material, not user approval
messages, global instructions, session IDs or raw host logs. The original evaluation sessions and
Russian verdicts were not archived in the repository, so the translation and transferred host
observations do not provide an independently replayable raw trace.
