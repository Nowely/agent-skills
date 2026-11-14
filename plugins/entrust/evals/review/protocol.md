# Comparing review skills

This protocol specializes the repository's [research method](../../../../RESEARCH.md) for a new
comparison of an ordinary review without a specialized review skill against review with one or more
specified versions of a skill. It applies to future work, not retroactively to published experiments.
Preparing this protocol does not authorize a model run, access to a private project, or a new version of
the skill.

The existing [instrument](README.md) predates this protocol. Its current prompt, single-file skill
copy and binary scoring do **not** implement the comparison below. Do not present its output as compliant
without addressing and verifying those differences.

## Question and arms

Fix the question and the primary outcome before a confirmatory round. The principal contrast is the
normal review workflow with no specialized review skill against the workflow with a designated,
activated review skill and its complete matching package. Compare different skill versions as additional
arms when the question calls for them. Keep the model, effort, ordinary tools, safety permissions and
shared instructions the same where observable, except for the designated intervention and its necessary
activation. Record the treatment's effect on the context; this is not a model without system instructions
or prior knowledge.

In the no-skill control, do not supply or activate specialized review skills. In skill arms, exclude
other specialized review skills as well, apart from the assigned skill. Other ordinary skills, tools and
instructions remain available on the same terms across arms. This is a defined experimental baseline,
not a claim about every user's installed environment. When an implementation cannot enforce or observe
an aspect of it, record the limitation rather than claiming a stronger guarantee.

Give every arm the same ordinary user request, for example:

```text
Review the change.
Repository: repo/
Change: HEAD~1..HEAD
Task: brief.md
```

Use the actual repository, range and task for the case. Relative paths can make the user text identical;
if paths must differ, preserve the actual messages and say whether only their normalized templates match.
Do not add review directions, expected findings, a required report schema or experiment-specific process
instructions to the request. Supply the actual task and connected source equally. Ordinary safety
permissions apply equally; a review request does not authorize source edits, external publication, sharing
secrets or production effects. Tests and permitted tools are not categorically forbidden merely to make
the experiment static. Record the effective restrictions and what each participant actually did.

## Delivery and provenance

An available skill is not necessarily activated. Record separately the assigned arm, full package
identity, available host configuration, observed activation and the files actually loaded or read.
Freeze the full skill package and its relevant dependencies, not only its entrypoint. A path, a matching
hash, an activation request or an HTTP success alone does not prove that the intended content reached
the model. Record `yes`, `no` or `unknown` for observed delivery, the evidence available and any
unverified system or developer context. Keep all assigned attempts in the record.

The user text can remain the same while the host adds a skill message or attachment: that difference is
part of the intervention, not identical full input. OpenCode V2 documents an experimental
[per-session skill activation and prompt skill attachment](https://opencode.ai/docs/api), but their
behavior, message representation and availability in a particular host must be checked rather than
assumed. Other hosts may behave differently. If the required delivery or its observation cannot be
established, report the uncertainty and stop to agree on a next step; do not silently add a user-facing
skill instruction or call it the same strict comparison.

A separate comparison may measure the effect of making a skill **available**, allowing the model to
decide whether to invoke it. That is not the same question as the effect of an activated workflow.
Keep all availability runs in their assigned arms, including non-invocations; report observed activations
and unknowns separately. A confirmed-activation subset is descriptive and may be selected. Do not pool
these distinct comparisons.

Record the actual user message, input identities, host and requested model/effort, observed metadata,
available permissions and tools, startup instructions, activation evidence and accessible session
trace. State what the host does not expose. Do not infer that a model read a file or used a tool from its
answer alone. Do not create a separate isolation system by default; the absence of an observed read of
another run, rubric or prior result is not proof that access was impossible.

## Cases and review

Select and freeze cases, any expected findings, the assessment procedure and the budget before a
confirmatory round. Include the cases selected under the stated rules, including cases where an ordinary
review already performs well; do not discard or reclassify them based on the control's results. Report
the selected set and any stratification. A sample selected for particular difficulties does not measure
their prevalence in production.

Use previously exposed or development cases for formative work and regressions, not as independent
confirmation of the version designed with them. For new material, record its provenance and relationship
to the candidate's development. Independently check material task contracts and any expected findings
where feasible, including potential false positives and cases intended to preserve useful behavior.
Keep genuine task constraints visible to every reviewer; identify direct hints to an expected finding
without changing a real task after the fact. An accepted change, a passing test or a missing follow-up
fix does not establish a clean negative control. Unavailable inputs, unsafe checks, contradictions and
ambiguous requirements remain explicit.

Each reviewer works independently on the same change and task for its case. Do not give reviewers
evaluation rubrics, other reviews or expected solutions as input. Keep normal workflow steps, such as the skill's
own checker and self-repair, within the assigned attempt and budget; they are part of the intervention
and can change substantive recommendations. Record available checker feedback, repairs, operator
interventions and costs. Do not provide substantive hints or rubric-derived corrections. Predeclare
how an infrastructure interruption is handled; never silently replace a poor or failed result.

## Assessment and reporting

The primary review result is what the user actually receives: the final response and any linked
artifacts the user can access. Apply the same predeclared inclusion rule to every arm, including a
no-skill arm that produces an artifact. Record missing or inaccessible links. Separately examine what
is present only in the message, and any internal or diagnostic artifacts not delivered to the user;
do not count the same finding twice. A structured report may reveal the arm to an evaluator even under
neutral IDs. Do not claim full blinding, and do not require a no-skill reviewer to create the skill's
schema for the sake of the comparison.

Assess the claims and proposals against the task and source, including unexpected valid findings. Keep
their presentation and evidence distinct: an asserted finding, a recommendation, an owner question and
an optional idea are not interchangeable; an observation may be supported, contradicted or unresolved.
Report unknowns separately, not as either successful findings or false positives. Distinguish introduced
defects from relevant pre-existing behavior, and assess the cost and behavior a proposed alternative
preserves or loses. A design judgment may be defensible without being the only valid solution. Assess
the risk of unsupported or harmful recommendations as well as findings. A report checker establishes
its applicable structural constraints, not factual or semantic correctness.

Use neutral labels and a source-grounded evaluator, retain the evaluator's original reasoning, and
independently check material disputes where feasible. If a second evaluator is used, retain both original
assessments and their disagreements. Do not use the legacy scorer to force an unresolved item into a
binary result. Record all assigned runs, incomplete outcomes and deviations, and report quality, harm,
available cost counters and elapsed time separately. The sample, models, evaluator and uncertain
context limit the conclusion; a small or targeted pilot does not establish general superiority.

Choose case count, repetitions, evaluator allocation and budget for the question and agree them before
the round rather than treating a fixed number as proof of reliability. This protocol does not authorize
a future experiment. Confirm the next skill version, inputs, host procedure, privacy boundaries and
budget separately before running one.
