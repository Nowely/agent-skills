# The catalogue gate: external blocker and judge scope

This is the post-gate discussion and a **proposed plan**, not an implementation or another model run. The gate's
[record](46-catalogue-terra-gate.md) keeps the original first handover and judge results. An independent Astra
analysis on 2026-11-23 recommended preserving the measured failure while allowing an evidence-backed external blocker
to be handed to the owner. The private return is not included here. The statements below distinguish observations
from the proposed changes.

## What the gate showed

- The judge's **18/18 ACCEPTED** covers its card contract: seven width, six choice and five basic checks. Open-sidebar
  checks use 700–960 px viewports, not the 375 px open-sidebar state. Its result is neither the consumer's full
  verdict nor the owner's acceptance. See the [judge](../../evals/design-to-code/cases/catalogue-card/judge/judge.mjs)
  and [gate record](46-catalogue-terra-gate.md#width-and-choice-separately).
- The consumer's full check stayed **`fail`**: opening Filters at a 375 px viewport left a 47 px column. The check
  compared it to a 288 px floor from a fresh page at the 320 px sweep start chosen by Terra. Neither that floor nor its
  use for the open-sidebar state is established as an owner-stated product invariant. The fixed page and its sidebar
  were outside the card-change brief. An identical baseline/candidate measurement was not recorded, so the extent and
  attribution of any change to this state remain unproved.
- The [original PR request](https://github.com/Nowely/agent-skills/pull/113#issuecomment-7088019516) already named the
  375 px squeeze and expected one ledger entry leading to `pending`. The current
  [ledger validator](../../plugin/skills/design-to-code/scripts/core.mjs#L323) permits a `journey` entry only with
  `cause: "checker"`. Attributing a real page squeeze to the checker would be false. The requested disposition and
  the current contract therefore do not agree; the observation itself remains `fail`.
- The standalone story's Details opener remains uncovered even though the catalogue's Details journey held. This is
  a separate missing coverage gap, not a consequence that resolving the sidebar alone proves away. No independent
  review pass was run; the [review pass](../../plugin/skills/design-to-code/references/review-pass.md) currently starts
  after a complete `pass` or `pending`.
- The 375 px open-Filters [picture](46-catalogue-gate-frames/reproduced-filters-open-375.png) is a **post-gate
  reproduction** from the frozen SHA-256 archive, not a historical frame from the measured run. The
  [gate record](46-catalogue-terra-gate.md#visual-comparison) states its provenance and limits.

The measured candidate was `a21e92f`. At `8f2f096`, the design-to-code skill page differs only in its version;
the checker and catalogue judge files are unchanged. The gate is one synthetic run, not evidence of a general model
success rate or proof that the check caused the builder to discover either defect.

## Proposed behavior

1. **A bounded handover with the real result.** Permit the builder to stop and hand over an evidence-backed external
   blocker while preserving the actual checker `fail` and making clear the product is not declared ready. The report
   identifies the action and state, observed measurement, source and authority of the expected value, evidence for
   the cause, and the exact brief boundary preventing the fix. Give the owner the available choices and any remaining
   unverified coverage. An owner decision can be recorded separately; do not relabel the run `pass` or make every
   `fail` eligible for handover.
2. **Attribution before deferral.** When responsibility or regression status is uncertain, compare original and
   candidate in the same consumer, route, data, viewport and state. Record both observations, the tolerance and what
   the comparison can and cannot establish. If that comparison cannot be made or is ambiguous, leave the cause and
   regression status unknown rather than asserting an inherited defect. The image above shows the candidate state; it
   is not that baseline comparison.
3. **Align instructions and messages.** Reconcile the skill's handover rule with the checker stop guidance and the
   `fail` text shown in its summary and handoff. Prefer the existing `review.md` evidence and the real status over a
   new flag, schema or exit code. A genuine checker-caused failure can still be disputed as such; an external product
   problem must not be written as `cause: "checker"` merely to reach `pending`.
4. **Keep judge and consumer outcomes side by side.** Label the existing 18 checks as the card-contract judge; show
   the consumer check and the owner's decision separately. Preserve the historical judge and its thresholds for
   comparability. A diagnostic control for the 375 px state may be added separately, with its own scope; turning the
   historical judge into a general consumer verdict would change the case and can make the fixed-page brief
   unsatisfiable.
5. **Bound the independent review.** When an independent look is requested or available and the owner needs a card
   decision, permit a review of the card and its reachable states despite a documented external blocker, naming its
   scope and the unreviewed consumer and Details coverage. This is not a mandate to run the review on every fixable
   `fail`; its cost and benefit there are unmeasured.

## Alternatives and risks

The smallest alternative is to retain `fail` and allow a clearly bounded blocker report. It preserves the check's
meaning and avoids changing downstream consumers, but an owner or automation that requires a machine-readable
blocker must read the report rather than a new status. A separate structured owner decision could be warranted if
such a consumer is identified; its identity and need are not established here. Before adding a field or status,
specify who writes and reads it, how it binds a single observed state, and how it coexists with independent failures.

A blanket `pending`, an `out-of-scope` exception for the whole journey, or fabricated `cause: "checker"` can mask a
new regression, including one of the journey's generated edge variants. A baseline/candidate comparison is useful
but cannot prove responsibility when the environment or setup differs, and an unchanged inherited defect still needs
an owner decision if it affects the product. A placement or screenshot demonstrates only the observed state, not
other devices, inputs or continuity. The report must retain the standalone Details gap even if the sidebar decision
is recorded.

## Checks for a future approved change

Use deterministic controls in the existing test infrastructure and **a second consumer** with different markup and
selectors, so the rule is not tailored to this fixture. Keep the same page and conditions within each comparison:

| Case | Expected distinction |
|---|---|
| Original and candidate have the same existing squeeze | An evidence-backed external blocker report is possible; checker `fail` remains visible and no ready verdict is claimed. |
| Candidate introduces or worsens the squeeze | Treat the difference as a candidate regression for investigation; a blanket external-blocker disposition must not clear it. |
| Existing squeeze plus newly lost selection | Preserve the selection failure and missing coverage independently; the external blocker cannot mask it. |

Also cover insufficient or mismatched baseline evidence, genuine checker-caused disputes, independently scoped review,
and the uncovered Details opener. Verify the rendered handoff and console agree on the observed status and that the
historic card judge is unchanged. These controls establish deterministic behavior only; they do not prove how a model
will behave. Assess that separately with a preregistered fresh run and stated acceptance criteria; no such run was
performed in this discussion.
