# Next review comparison: preparation

This is a planning note, not a registered experiment. No cases, sample size, model budget, activation
method or evaluator have been approved here. The [review protocol](../../evals/review/protocol.md)
governs a future round; the [four-arm follow-up](four-arm-followup.md) remains a historical observation.

## Comparison to prepare

On each selected change, compare an ordinary request without specialized review skills, the frozen
current skill and the next candidate. The intended contrasts are candidate versus no skill and
candidate versus current. Keep the user request and common conditions the same; the assigned skill
and its verified activation are the treatment. Actual host delivery, available tools, failures and
unknown context must be recorded as the protocol says. Neither a copied package nor a passed report
checker establishes that the intended workflow was delivered or produced correct findings.

The current-skill reference for this candidate is the `plugins/entrust/plugin/skills/review/` tree at
commit `be950d8a0af42248e7ebfc08b2fb0c56fdff732c`, before the next-candidate edits. This identifies
the reference source, not a release or a finished experiment. Freeze the complete package and any
relevant dependencies at execution time; the next candidate is not yet frozen.

## Selecting material

Before a confirmatory round, agree on the source and selection rules for real and synthetic changes,
then freeze the selected task, base, change and available connected context. Report both categories
separately. Keep cases independent of the candidate's development distinct from previously used or
published formative and regression cases; the latter do not become held out by being run again.
Preserve genuine task requirements and document any ambiguities or direct hints in the reviewer-facing
material. Do not choose cases or drop apparently easy ones after seeing control performance.

The set should make both useful findings and unnecessary interventions observable. Consider cases
with a supported behavioral defect, a concrete structural burden, an already appropriate structure,
required behavior that a simplification could lose, and a material optional tradeoff. These are
selection considerations, not instructions to reviewers or claims that every selected change contains
one of them. A passing suite or an accepted real change with no later fix is not proof of a clean case.
Check the applicable contracts and any proposed evaluator criteria independently where feasible.
Unavailable dependencies, unexecuted checks and disputed interpretations stay visible.

## Assessment and decisions still open

Compare the user-accessible results against source evidence: supported findings, unsupported or harmful
mandatory recommendations, meaningful alternatives and preserved or lost behavior. Record unresolved
questions separately from both successes and false positives. Assess diagnostic report data and checker
results separately from the delivered result, without counting the same finding twice. Retain all
assigned attempts, original assessments and material disagreements; format can reveal an arm despite
neutral labels. Time and available resource counters are reported independently of quality.

The owner must still agree the cases, repetitions, reviewer models and effort, independent evaluator
allocation, budget and stopping rules. Any private inputs or external-service disclosure require their
own authorization. Verify the host's activation and observation procedure before claiming that a skill
was delivered; a runtime preflight and the review/judging runs require separate approval. A small pilot
can expose process problems but cannot establish a stable effect or represent a production workload.
