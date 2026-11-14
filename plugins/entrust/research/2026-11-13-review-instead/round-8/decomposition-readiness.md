# Existing cases before adding another decomposition fixture

Coordinator source/rubric inspection only, performed alongside the approved locale diagnostic. No extra model
review, implementation or application test was launched. This is not independent admission or a measured
architecture result. Current evidence is source-readable (repository evidence level 2), not runtime proof.

## Prefer contact-import-v2 for a responsibility-boundary question

In [the import](../../../evals/review/cases/contact-import-v2/head/src/contacts/import.js), the same loop parses
physical lines (16–45), interprets fields (52–56), rejects/selects rows (58–75), writes (76–96) and updates
counts (81, 96, 98). Changing duplicate selection requires tracing effects and counters together; deferring
writes until the file is parseable requires a decision/effect boundary. The point is this concrete coupling,
not the function's length. Existing parser and email helpers provide the relevant alternatives.

The [rubric](../../../evals/review/cases/contact-import-v2/rubric.json) already separates D1 (specific reading/
change burden) from D2 (actionable flow, data and order). It explicitly rejects a runtime bug alone as proof
of a design diagnosis and allows clear local blocks instead of prescribed helper counts. Its head traps
reject frameworks, preserving unused extras and dropping required behavior. This is a suitable next candidate
for the specific question: does a review explain and improve a responsibility boundary rather than merely
list bugs or phases? No new equivalent fixture is needed first.

Limits: many functional defects and redundant helpers may dominate attention; a strong bug score must not
stand in for D1/D2. No architecture probes are declared in this case. Review-only success is therefore a
supported proposed target, not verified architectural recovery. The small existing email/create helpers
provide cohesive code to preserve, but are not a separate calibrated clean-target experiment.

## Use slot-edit for rule order, dependency evidence and required lifecycle

In [the validator](../../../evals/review/cases/slot-edit/head/src/slots/edit.js), later assignments decide error
priority (25–47), the empty-value message is repeated (27, 45), the heavy-order rule is duplicated (38–42),
and the express lead is decided inside the delivery-hours branch (31–35). [F5](../../../evals/review/cases/slot-edit/rubric.json)
already asks for this concrete interference and an explicit rule order, not a helper quota. The package also
contains a small cohesive pickup validator and a reusable ticker; these are existing local precedents.

Unlike the original private task, the [brief](../../../evals/review/cases/slot-edit/brief.md) explicitly requires
time-based feedback without input and cleanup on close. The case can detect an invalid removal of a required
timer while encouraging reuse of the project's ticker. It cannot answer whether the reviewer distinguishes
an optional but useful convenience from a requirement: here that choice is already settled by the brief.

Limits: this familiar case helped shape the skill and mixes redundant-lookup diagnosis with rule ordering.
It is a regression/diagnostic case, not held-out evidence. Its future-change probes require a separate
implementation/judging phase before claiming recovered locality; that phase is not authorized by round 8.

## Recommendation, not a queued experiment

1. Finish the locale diagnostic; do not rewrite the skill from a count alone.
2. If responsibility boundaries remain the next question, inspect D1 and D2 separately on contact-import-v2,
   with behavior/scope and unsupported complexity reported independently. Freeze the exact packages, runs and
   judging budget in a later owner-approved plan.
3. Use slot-edit only when the remaining question concerns readable rule order or preservation/reuse of a
   genuinely required lifecycle. Do not run both automatically.
4. Add or amend a fixture only for a named missing distinction, such as the cost of a useful but unrequested
   stateful convenience. That gap is different from an obviously unused mode or a contractually required timer.
   No fixture, rubric or shipping instruction was changed during this inspection.
