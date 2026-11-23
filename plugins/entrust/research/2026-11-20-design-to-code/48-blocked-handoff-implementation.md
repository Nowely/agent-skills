# A blocked handoff keeps the failed measurement

This record implements the approved [post-gate plan](47-external-blocker-and-judge-scope.md). It is not another model
run, owner acceptance, or a revision of the historical catalogue judge. The recorded catalogue gate remains at
`a21e92f`; the unchanged [gate report](46-catalogue-terra-gate.md) describes its handover and limits.

## Contract

The skill now permits an evidence-backed external blocker to be reported as **blocked, not done**, while preserving
the check's actual `fail`. The handoff names the action and state, measurement, expected value and its source or
unknown, cause, scope boundary, other findings and missing coverage. Where responsibility is uncertain, compare the
original and candidate under the same consumer conditions; if that cannot be done, leave attribution unknown. A
current complete check is evidence, not a quick, frame-only or no-sweep round. If the current complete check cannot
run, the report says why and what is missing. A journey entry remains reserved for a checker-caused defect; the
builder does not accept its own proposed entry.

Before this change, an invalid journey entry could still mark the individual journey `pending` or `accepted`, while
its ledger fault kept the overall result `fail`. Invalid entries no longer mark journeys; the ledger fault still fails
the check, and a valid checker-tagged entry still matches. An owner-accepted wildcard can still match a journey
without `cause: "checker"`; that valid pre-existing behavior is unchanged. The synthetic checker-tagged control tests
matching, not the true cause of its fixture's failure. This is a pre-existing defect in the invalid-entry association,
observed by the new control, not a newly introduced status or schema.

The check retains its overall status semantics, JSON structure and exit codes. Its human-readable `Status: fail` line and console now
permit an evidenced blocked handoff; the numerical calculation is unchanged. `sweep.from` is a selected test width;
it alone does not establish the supported component minimum. The skill asks for the product or owner source, or
unknown. The independent review brief asks for that source separately and does not promote the builder's chosen
width to an independently established contract. The human width diagnostic is also the `journeys[].failed` string in
JSON, so its wording changes; the JSON structure, measurements and status do not. Repository benches use the
presence of that string and journey name rather than the former sentence; external consumers were not inventoried.
A bounded component review may be requested when an external blocker prevents the consumer from passing; it does not
claim the remaining consumer or Details coverage was reviewed.

The catalogue judge keeps its checks, group order, JSON and exit behavior. Its human output labels the existing
verdict as card-contract scope and points to the existing complete-check handoff and owner verdict form; the owner
decision is unknown until recorded. Neither a fresh 18/18 nor a report of an external blocker is an owner's acceptance.

## Prompt and comparison boundary

The generated future harness approval line now permits an evidenced external blocker to be reported with the actual
`fail`, without claiming done. It still limits edits to the component's files and keeps fixed inputs unchanged. This
changes the first message for future runs: an outcome under that prompt is not directly comparable to the historical
run without accounting for the changed condition. The prior registrations, prompts, measurements and judge are not
rewritten. Collection compares a rollout's approval line to the line recorded in that run's baseline, rather than to
today's prompt; if the baseline has no recorded approval, whether the line was sent is unknown, not backfilled.

## Deterministic controls and limits

The independent consumer exercises the same squeeze in original and candidate, a worsened candidate squeeze, and a
separate reachable selection-loss journey before and after the squeeze journey. It also covers missing baseline,
unknown and sourced minimum, and all three partial modes. Separate controls retain matching for checker-tagged disputes and the
catalogue judge's reference, start, width-only and choice-only cases. The synthetic tag is a matching control, not
proof that its fixture's failure was caused by the checker. These tests check the observed software
contract; they do not establish that a model will follow the new instructions. A model-behavior comparison requires a
separately approved and preregistered fresh run. E164 and E165 remain open; the blocked-handoff change does not excuse
them or make their previously failing local checks pass.
