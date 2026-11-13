# Draft 26 preparation and proposed pilot

## Decision and motivation

Use draft 25 as the working reference for the next focused hypothesis; retain 23 as the released/historical
baseline. This is a practical choice, not a claim that 25 won round 6. The owner is the only consumer and
accepts report-schema breaks. Size is not a compelling objection: 25's required entrypoint/data text is about
1.1% larger than 23; normalized report JSON differs by about 0.12%, not the raw-format 3.9%. Review and
implementation times/output tokens were effectively alike in the small sample.

Round 6 succeeded at deleting one unnecessary responsibility and data dependency in both arms. It did not
establish that the remaining structure matches the owner's desired quality. The new hypothesis concerns
source-backed mechanism costs and readable domain-rule ownership, not another iteration of `instead`.

## What is prepared

- [Draft 26 entrypoint](drafts/26-structure.md): a full candidate copied from 25, with localized changes to
  responsibility assessment, required behavior, guards inside kept blocks and final target reconciliation.
- [Structural examples](drafts/26-structure-examples.md): one actionable design judgment and one empty split.
  Materialize this as `references/structure-examples.md` in the candidate skill package.
- [Quality criteria](quality-criteria-26.md): evaluator-only evidence dimensions and the pilot gate. Reviewers
  never receive the rubric, later solution or expected findings.
- The data contract remains [draft 25's](drafts/25-cited-data.md); checker/renderer and all other references
  come from the frozen draft-25 package at `9ee0189c`. No fields, runtime code or invocation modes are added.

The shipping skill in the PR and the installed plugin remain unchanged. Only these research artifacts are
prepared. A numbered draft is retained as its own file; further revisions after a critic/experiment starts
need their own immutable version. The drafts' links resolve in the assembled installed layout.

## What Carbon recommended, and what was qualified

Carbon's advisory continuation recommended a stronger source-of-requirement check, a positive structural
example, a more discriminating quality rubric and a staged experiment on the original flawed snapshot. It
also proposed testing whether mandatory line bookkeeping takes attention from design. The latter is an
unmeasured hypothesis, not the established cause of round 6's result.

The coordinator did not adopt two categorical claims: draft 25 already says to preserve *required* timing,
not every behavior the author implemented; and a validator beside mappers in a file named `utils` is not
inherently defective. Draft 26 makes the required source and concrete reasoning cost explicit, keeps valid
cohesive alternatives, and treats a changed UX convenience as an owner tradeoff rather than silent equivalence.
The owner preference for readable rule orchestration is an honest design criterion, not a fabricated bug.

Carbon read the memo and draft 25, not the finished draft 26. Its answer was complete and attributed; the
transport rejected only its length exceeding the default output-schema cap. No additional approval of the
finished artifact or measured improvement is claimed. A temporary adapter copy waited for the requested model
in the startup catalogue; the installed adapter and user configuration were not changed.

## Proposed next experiment — not launched

1. **Freeze inputs.** Use the same original flawed source/task packet as round 6, the same Terra model and
   requested xhigh effort, and a complete matching draft-26 package. Preserve unknown/reconstructed contracts.
   Do not add later owner decisions only to the new arm. Historical 25 results are a small reference cohort,
   not a fresh randomized control; record any model/environment drift before comparison.
2. **First phase: three reviews only.** Give fresh reviewers identical neutral prompts, differing only in
   local paths. Score the three draft-26 reviews and the preserved three draft-25 reviews with the new criteria;
   retain old scores separately. No new schema field or keyword hit counts as quality improvement.
3. **Advance only on useful signal.** At least two of three candidate reviews must retain the baseline's
   supported diagnosis/remedy and add a substantiated actionable item in mechanism cost, readable ownership
   or proven contract-driven simplification, without an unsupported destructive recommendation. This does
   not mean all quality goals are solved. If the gate passes, apply all three candidate reviews and evaluate
   the resulting patches; do not select only the best ones.
4. **If the gate fails, stop before implementations.** Prepare a separate, frozen two-run workload comparison
   only after agreeing its package: the same substantive draft-26 instructions/source, but without exhaustive
   changed-line block bookkeeping or its completeness check. Keep requirements, evidence, mechanisms, findings,
   target and limitations. The altered artifact contract must be explicit; do not pass incomplete data through
   the production checker and call it valid. Different formats can reveal the arm.
5. **Interpret the lightweight result cautiously.** If it finds useful structure the full version missed,
   investigate reducing bookkeeping or moving it after analysis. That is a lead, not causal proof from two
   runs. If neither does, revisit the evidence/standard behind the expected improvement instead of appending
   another generic instruction. A new transfer case is future work, not automatically added here.

No clean target or new product feature is part of this proposal. New model launches require the owner's next
instruction. The existing PR comment will describe preparation and methodology, with no invented result row.
