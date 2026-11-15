# Research in this repository

This is the shared method for new research across the marketplace. It distinguishes exploratory work,
which develops questions, from confirmatory comparisons, which test a question fixed before observing
the results. A plugin's experiment-specific protocol supplies the details; for example, see the
[review-skill protocol](plugins/entrust/evals/review/protocol.md). Existing research records remain
historical records of their own methods, not results retroactively obtained under this one.

## Frame the question

State what the research can decide, what is being observed, and the relevant alternatives. Identify the
unit being studied and distinguish a particular observation from a claim about repeated use or a wider
population. An exploratory investigation may change direction as evidence appears: preserve its starting
question, sources, discoveries and changes of interpretation rather than presenting the final question
as if it had been fixed in advance.

For a confirmatory comparison, record before the measured runs:

- The question, expected contrast, arms or other comparators, and what each one receives. State the
  intended intervention and the conditions that should be common; do not call the complete model context
  identical when the intervention itself changes it.
- The materials and their provenance, selection criteria and known limitations; freeze the available
  inputs and identify their versions. Record what could not be preserved or independently checked.
- The primary outcomes, how they are assessed, the proposed sample and repetitions, budget, stopping
  rule, and how failures, incomplete attempts, uncertainty and disagreements will be reported.
- The expected model, effort, host, tools, permissions and shared instructions, and how actual exposure
  and deviations will be observed. Requested settings and observed metadata are different evidence.

Choose controls for the question, not by a universal formula. A baseline tests the claimed addition only
under its actual prompt, environment and permissions; do not call it instruction-free merely because one
skill was absent. Hold other conditions common where feasible, record actual order and any differences, and
explain what cannot be observed. Randomization and neutral labels can reduce biases; they do not establish
identical contexts, independence or full blinding by themselves.

## Review prior work

When designing a new skill, procedure or unfamiliar solution, look for existing approaches before
settling the design if they could affect the choice. A narrow local change need not start a separate
survey when the relevant precedent is already known.

Look for applicable tools and established practices as well as original research. Follow material claims
to their owners' documentation, source code or studies; check the evidence for adoption when calling a
solution popular. Popularity is a reason to examine an approach, not proof that it works here. Record the
sources, relevant context, benefits, tradeoffs and limits, and what the design reuses, adapts or does
differently. If useful evidence cannot be found or accessed, record that limit instead of asserting that
no prior work exists. Apply the privacy and disclosure boundaries below to searches and source sharing.

## Material and evaluation

Distinguish previously used formative or regression material from material independent of the development
and selection of the candidate. Freezing or publishing an already used case does not make it held out. A
new case can also have unknown prior model exposure; do not claim otherwise without evidence. For a
confirmatory comparison, set case selection rules before results, retain easy cases as well as difficult
ones, and report the whole selected set. For exploratory work, record changes in selection as they happen.
A deliberately selected set does not by itself represent a production population.

Check that task requirements, references and any assessment criteria are mutually consistent where
possible. Preserve genuine requirements; do not silently remove them to make a control appear neutral.
Identify clues that reveal an expected answer, and document ambiguity or unavailable contracts. A passing
test suite, an accepted change, or an absence of later fixes does not prove a case has no defects. If a
material flaw is discovered after results, retain the original inputs and results, identify the affected
claims, and record any correction as an explicit later version or addendum.

Do not add evaluation findings or grading criteria to the participant's inputs unless they are the
intervention being studied. If the genuine task itself names an issue, retain it and record the exposure.
Give an evaluator the source evidence needed for the task, use neutral labels where appropriate, and
record where format or context can reveal an arm. Assess unexpected findings as well as expected ones.
Separate a supported observation, a contradicted claim, an unresolved question and a reasoned judgment;
missing evidence is not a pass or a failure. Preserve original assessments and explain substantive
disagreements and subsequent checks. Independent checking can reduce error but does not make a model's
judgment ground truth.

## Run and report

Preserve every assigned attempt and its status, including incomplete runs, transport failures, repairs,
deviations and exclusions with reasons. For an availability comparison, a participant's decision not to
use an available intervention is an outcome, not a reason to remove it from its assigned group. Where
delivery is intended but cannot be verified, record it as unknown; analyses restricted to confirmed
delivery are secondary and may be biased.

Before a run, specify which normal feedback and self-repair steps belong to the workflow, what operator
intervention is allowed, and how all attempts and their cost will be recorded. A checker can change a
substantive answer as well as its format. Do not feed hidden grading criteria or desired findings back
to a participant in the primary comparison. Preserve available earlier and final artifacts without
requiring participants to produce extra intermediate work solely for the experiment.

Report the observations and their provenance, alternatives considered, sample and missing data,
uncertainties, interventions and material deviations. Report quality and harm separately from time,
resource counters and price; do not infer a price or add incompatible counters. A small pilot can
establish that a particular event occurred, but cannot by itself establish a stable comparative effect.
Do not choose a favourable outcome, subset, interpretation or stopping point after seeing results and
present it as the original confirmatory analysis. Explicitly label later exploration.

Start from the user's ordinary host configuration, tools and existing permissions. Do not replace them
with a special deny-by-default allowlist, sandbox or additional provider/tool restrictions unless the user
requests them or the approved comparison requires them. Keep existing safety limits and apply agreed
exceptions consistently across comparable arms, such as excluding a specialized skill from a control.
If the required access or privacy boundary cannot be met, stop rather than silently changing the setup.
Do not introduce a separate isolation system by default or claim isolation that was not enforced.
Record what available logs show and what they cannot establish. Preserve raw
inputs, transcripts and artifacts only where authorized. Do not publish private project material or
send it to an external service without explicit authorization and an appropriate disclosure check; do
not disclose secrets. A hash identifies particular bytes, not their safety, completeness, or the truth
of a conclusion.
