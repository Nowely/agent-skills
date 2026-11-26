# Reviewer return and the first handoff

This record follows the [catalogue gate](50-catalogue-blocked-handoff-gate.md) and its [corrections](51-catalogue-gate-corrections.md).
It records an observed omission, a proposed guard and an experiment plan. No new model run is reported here.

## Observation

The completed reviewer said the standalone story had no dialog handler and that the dialog was checked on the
consumer page. The builder's first final answer said the Details journey passed, without identifying that standalone
limitation. The independent post-freeze check found the missing target on both original and submitted stories: the
limitation was present in the fixture before the work, not established as a new product regression. The handoff did
not fully communicate a known coverage limit; it did not explicitly claim to have tested the standalone dialog.

In the private parent rollout, the command that appended the review summary and started the final check was launched
at 13:22:47.922 UTC (line 287). It yielded while the check was running at 13:22:49.126 (line 289); the full reviewer
return appeared at 13:22:49.128 (lines 291–292). The builder then awaited the check, which returned at 13:23:01.284
(line 296), and its final answer followed at 13:23:05.068 (line 301). Thus the summary-writing command had already
started when the complete review arrived, but the return preceded the final answer. The underlying transcript and
local paths are private and are not included in this repository.

That ordering is a possible contributor, **not an established cause**. The available record does not show why the
builder omitted the limitation or whether the timing, attention, a relevance judgment, or another factor explains it.
The existing `After it` already required the review's findings to be listed in the handoff; the completed return and
the builder's answer show that the general duty did not ensure this one limitation reached the owner.

## Proposed guard

In the existing [review pass](../../plugin/skills/design-to-code/references/review-pass.md#after-it), after the full
review is received and before the final answer, compare each material result claim with the review and the final
state. Verify the reviewer's observations against evidence; communicate any confirmed material remaining limitation
with its source and scope. Existing limitations are distinguished from proven regressions. A reviewer observation is
not automatically true or an automatic blocker, and this introduces no status, ledger field, or automatic disposition.
The check and the owner still decide their respective outcomes under the existing contract.

This is a minimal defense against the observed discrepancy, not a proven fix for its unknown cause. A rule only in the
handoff section could leave a late review outside the reconciliation step; forcing every reviewer remark into a blocker
or copying it without checking can create false findings. The new step trades a little final-read effort for a chance to
catch a material mismatch; its real effect remains to be measured.

## Service tier and comparisons

The first catalogue gate's recorded thread setting was `service_tier: default`; the later blocked-handoff gate's was
`service_tier: priority`, consistent with the later run's requested fast mode. These are recorded thread settings; they
do not independently establish the toggle interaction or actual service delivery. The runs also differ in skill
revision, prompt, environment and review path.
Their recorded wall times, 5:14.0 and 4:38.2, are observations of those particular runs; they do not establish that
this skill change or service tier caused the difference. The earlier run did not carry the same helper/review work.
Raw per-thread token accounting and its overlap limits are in [50](50-catalogue-blocked-handoff-gate.md#cost-and-comparison)
and [51](51-catalogue-gate-corrections.md#helper-accounting).

## Planned check of the guard

A separately prepared, different component will receive an ordinary task and a positive review containing one material,
independently verified limitation that remains in the final state, plus a plausible assertion that the final files
refute. The hidden criteria are not disclosed to the builder. Establish the ground truth before launch, deliver the full
review before the first final answer and verify delivery, then freeze that first answer. The desired distinction is a
handoff that reports the verified remaining limitation with its source and scope without copying the refuted assertion
as fact or calling an existing limit a new regression.

If the full review is not delivered, the outcome is **unknown**; do not rerun for a better result. This single probe
tests handling of an already received review, not asynchronous delivery, population reliability, or a general success
rate. Record the exact input and skill hashes, model, service tier, timing, token accounting, final evidence and any
missing data. Because this changes the input and conditions, it is not a controlled speed comparison with either
catalogue gate.
