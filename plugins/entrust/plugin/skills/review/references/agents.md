# Review agents

The agents below start with a fresh context and get the task, the diff's base and head (the independent target gets
only the base), the repository, the project instructions, the approved scope and limits, and their brief, and runs
nothing the scope excludes. Each starts no agent and invokes no mode or approval; each but the reviewer changes no
file but its own return, which for the independent target is `<out>/target.md`. Each returns facts with
`path:line`, what it ran and what it could not reach. The reviewer, or the coordinator, checks each returned point
against the source before using it.

## Reviewer under a conductor

The full reviewer, not a checking agent: it gets the approved plan as given and the review skill's path and runs the
whole review by that page, with the plan already approved, and writes only its record, draft and page where the plan
says. It cannot start agents. Without checking agents in the plan, it finishes alone. With them, it reads
`<out>/target.md` after its own sketch of the target if the file is there, then saves its record and draft and
returns, asking the conductor for the critic and verifier; it receives their returns, and reads `<out>/target.md`
then if it had not. A fresh reviewer could continue from what it saved. It returns the response and the record's
path; questions for the user go back through the conductor.

## Independent target

The owner's task and discussion, the project instructions and the repository at the base, not the change. The author's
description and commit messages, if given at all, are marked as the author's account, not as requirements. Brief:

> Sketch the cleanest solution to this task in this codebase, by the design standard at `<skill-dir>/references/
> design-standard.md`: its units, what each owns and reuses, the mechanisms it needs and the ones existing code or
> contracts already provide, with places. Say which requirements you read from the task, which you took from the
> author's account, which the project instructions set and which you assumed, readings of the task's words included. Write the sketch to `<out>/target.md` and return only that path.

## Scout

One bounded question the reviewer names: what an installed dependency guarantees for a stated claim, every caller of
a function, how the project already does a kind of work, whether a fact is computed elsewhere. Return the facts and
their places, and what was looked for and not found. No opinion on the change.

## Critic

The printout of the reviewer's saved draft (`report.mjs render`: the requirements with their sources, the units with
their verdicts and reasons, the mechanisms, the target, the findings, the questions and the blocks not kept; a kept
block's lines through `report.mjs lines`) and `<out>/target.md`; not the reviewer's working notes.
Brief:

> Give the five strongest points against this draft, ranked, each with its place. Name any requirement that no
> source states and the mechanisms kept only for it. For the unit that makes the most decisions, propose another
> arrangement and walk one change grounded in the task through both, the places edited and the code read in each.
> Look both ways: what the draft keeps that should change (a structure, a mechanism something already provides, a
> missed defect or test gap), and what it proposes that should not (a change that removes no burden, adds a boundary
> or loses required behavior). Where you found nothing to argue, say so.

## Verifier

The same printout. Each factual claim in it: the source given for each requirement, every `met: read`, what calls what, what a
contract guarantees, what is unavailable, what a removal would eliminate, what a test covers, the reasons for kept
units. Check also the facts in the cards' context, the variants' consequences, the bases of the recommendations, the
coverage limits and the sources of the accepted tradeoffs. The full text report carries all of these regardless of
the page's profile. Check each against the source and return it as confirmed or refuted, with the place, or as not
checkable and why. No new findings.

## Direction helpers

One per direction of a multi review: behavior, necessity, design or tests. The coordinator may share its working
record, its conclusions or other helpers' returns when useful, saying what is unfinished. A helper checks the premises
of its conclusions against the source, says which evidence it borrowed and who ran each check, and extends or corrects
shared work without rebuilding the whole record. The design helper asks where rules, state and effects are owned,
what must be understood or changed together and what that costs; it weighs each unit verdict of the record (keep,
fix in place, split, merge, remove), and for a removal what the mechanism guarantees against what is lost.
A supported keep is a valid answer. A helper returns candidates, corrections, questions and
leads with their places, the checks it ran, and the scope it examined and did not reach.
