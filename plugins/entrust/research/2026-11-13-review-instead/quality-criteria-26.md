# Draft 26: criteria for the remaining quality gap

This is coordinator/evaluator material. Do not include it, the later reference solution, historical findings
or the private target's expected recommendations in a reviewer's packet. It describes the goal beyond the
lookup removal that both arms already achieved in round 6. Assess each dimension separately; do not collapse
one valid simplification into a claim that the entire solution-quality objective is met.

## Distinguish the source of the expectation

- **Task/contract:** required observable behavior, reachable inputs and guarantees established by code/types.
- **Owner decision:** a product tradeoff explicitly accepted for this task, with its source and consequence.
- **Readability judgment:** an owner/repository standard or an evidenced reduction in reading/change burden.

A later owner decision absent from the frozen task packet is not a hidden requirement a reviewer should guess.
A proposed removal that changes a useful behavior without settled authority stays a tradeoff question.
A preferred structure need not be a functional defect; neither does every different shape deserve a finding.

## Per-dimension evidence

| Dimension | What supports a useful result | What does not establish it |
| --- | --- | --- |
| Necessary mechanisms | Identify the requirement/contract or optional benefit, the full state/effect/cleanup/test chain, existing capabilities and the consequence of omission. Recommend a supported removal/reuse, a concrete owner tradeoff, or an evidenced keep decision. | A mechanism count, generic suspicion about a timer/cache, or declaring everything in the implementation required. |
| Readable rule ownership | Show where routing/precedence and non-trivial calculations obscure each other, or where one decision is scattered. Give a small actionable arrangement that makes order and ownership clear while preserving behavior. A justified cohesive arrangement is valid. | Function/file quotas, a preferred helper name, a filename such as `utils`, or extraction that only forwards obvious expressions. |
| Contract-driven simplification | Locate the actual redundant guard/conversion and prove why relevant producers, types and callers already guarantee its premise; reuse a suitable existing predicate/utility. | Treating annotations as runtime validation at an untrusted boundary, dropping a defense on a guessed guarantee, or fabricated edge cases. |
| Behavioral fidelity and scope | Trace the original required scenarios and precedence through the target; identify independently required machinery that stays. Keep later owner preferences separate when they were not supplied. | Calling an optional behavior change equivalent, ignoring an unresolved material regression, or implementing a new product requirement from an evaluation probe. |
| Actionability and test quality | A fresh implementer can locate the change and understand the intended responsibility boundary. Tests target a plausible behavior regression; unfinished implementation and unnecessary test dependencies remain visible. | A generic request to improve architecture, tests that only repeat scaffolding, structural JSON validity, or deletion counts alone. |

For each substantive candidate use `supported`, `unsupported` or `unresolved`, with a source location, reason
and proposed target/keep decision. Record an uncovered dimension explicitly, not as a pass. Do not require
an issue in every category. Match alternatives by the burden they remove, not by resemblance to the reference.

## Pilot signal and stopping rule

Use the same original source/task packet as round 6 and rescore its three draft-25 reviews against these
criteria. Preserve their old ratings alongside the new assessment; never compare the old coarse score with a
new stricter score as if it were the same measure. Draft 26's examples/preferences are part of the tested
instruction, not retrospective additions to the task.

Advance only if at least two of three draft-26 reviews preserve the supported baseline diagnosis/remedy and
provide a new, substantiated, actionable item beyond that removal in mechanism cost, responsibility/readability
or contract-driven simplification. A detailed, source-grounded owner tradeoff can count; a bare question such
as "is this timer needed?" cannot. Keep decisions with specific evidence are useful but do not by themselves
count as a new improvement over baseline. Unsupported destructive recommendations block advancement.

This is a pilot gate, not proof of general reliability or completion of every quality dimension. If it passes,
apply all three draft-26 reviews, including the weaker one, and judge actual patches against the same dimensions.
Do not cherry-pick the best review. Any claim of improved implementation must survive behavior/scope assessment.

If zero or one review provides a new useful item, stop before implementations. A separate two-run lightweight
comparison may then test the report-workload hypothesis. An advantage there is a lead to investigate, not proof
that bookkeeping caused the original failure. No clean target or additional product feature is required by this
pilot. New runs remain subject to the owner's launch instruction.
