# Review agents

The agents below start with a fresh context and get the task, the diff's base and head (the independent target gets
only the base), the repository, the project instructions, the approved scope and permissions, and their brief. Each
changes no file but its own return, starts no agent, invokes no mode or approval, and returns facts with `path:line`,
what it ran and what it could not reach. The reviewer, or the coordinator, checks each returned point against the
source before using it.

## Reviewer under a conductor

The full reviewer, not a checking agent: it gets the approved plan as given and the review skill's path and runs the
whole review by that page, with the plan already approved. It cannot start agents; it asks the conductor for each one
the plan names and saves its record and draft before returning, so a fresh reviewer could continue from them. It
returns the response and the record's path; questions for the user go back through the conductor.

## Independent target

The task, the project instructions and the repository at the base, not the change. Brief:

> Sketch the cleanest solution to this task in this codebase, by the design standard at `<skill-dir>/references/
> design-standard.md`: its units, what each owns and reuses, the mechanisms it needs and the ones existing code or
> contracts already provide, with places. Say which requirements you read from the task and which you assumed.

## Scout

One bounded question the reviewer names: what an installed dependency guarantees for a stated claim, every caller of
a function, how the project already does a kind of work, whether a fact is computed elsewhere. Return the facts and
their places, and what was looked for and not found. No opinion on the change.

## Critic

The requirements with their sources, the reviewer's saved draft (the record with its block and unit verdicts, the
mechanisms, the target, the findings and the questions) and the independent target; not the reasoning behind them.
Brief:

> Give the five strongest points against this draft, ranked, each with its place. Name any requirement that no
> source states and the mechanisms kept only for it. For the unit that makes the most decisions, propose another
> arrangement and walk one change grounded in the task through both, the places edited and the code read in each.
> Look both ways: what the draft keeps that should change (a structure, a mechanism something already provides, a
> missed defect or test gap), and what it proposes that should not (a change that removes no burden, adds a boundary
> or loses required behavior). Where you found nothing to argue, say so.

## Verifier

Each factual claim in the draft: the source given for each requirement, every `met: read`, what calls what, what a
contract guarantees, what is unavailable, what a removal would eliminate, what a test covers, the reasons for kept
units. Check each against the source and return it as confirmed or refuted, with the place, or as not checkable and
why. No new findings.

## Direction helpers

One per direction of a multi review: behavior, necessity, design or tests. The coordinator may share its working
record, its conclusions or other helpers' returns when useful, saying what is unfinished. A helper checks the premises
of its conclusions against the source, says which evidence it borrowed and who ran each check, and extends or corrects
shared work without rebuilding the whole record. The design helper asks where rules, state and effects are owned,
what must be understood or changed together and what that costs; it compares keeping, simplifying in place,
consolidating, extracting and removing, and for a removal weighs what the mechanism guarantees against what is lost.
A supported keep is a valid answer. A helper returns candidates, corrections, questions and
leads with their places, the checks it ran, and the scope it examined and did not reach.
