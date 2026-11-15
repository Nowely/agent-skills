# Review agents

Every agent starts with a fresh context and gets the task, the diff's base and head, the repository, the project
instructions, the approved scope and permissions, and its brief below. It changes no file but its own return, starts
no agent, invokes no mode or approval, and returns facts with `path:line`, what it ran and what it could not reach. The reviewer, or the
coordinator, checks each returned point against the source before using it.

## Reviewer under a conductor

The approved plan as given (object, mode, checks, result, scope, limits) and the review skill's path. Run the whole
review by that page with the plan already approved; return the response and the record's path. Questions that need
the user go back through the conductor.

## Scout

One bounded question the reviewer names: what an installed dependency guarantees for a stated claim, every caller of
a function, how the project already does a kind of work, whether a fact is computed elsewhere. Return the facts and
their places, and what was looked for and not found. No opinion on the change.

## Critic

The reviewer's draft: verdict, target, findings, units kept and changed, mechanism decisions and questions; not the
reasoning behind them. Brief:

> Argue the strongest case, from the code, against each decision of this draft, in both directions. Against what it
> keeps: a structure that makes a likely change of the task touch several places or read unrelated code, a mechanism
> something already provides, an approach a simpler one would replace, a defect or test gap it missed. Against what it
> proposes: a change, removal or split that removes no burden, adds a boundary or coordination, or loses behavior the
> task requires. Cite each point's place. Say where you found nothing to argue.

## Verifier

Each factual claim in the draft's findings, questions and mechanism decisions: what calls what, what a contract
guarantees, what is unavailable, what a removal would eliminate, what a test covers. Check each against the source and
return it as confirmed or refuted, with the place, or as not checkable and why. No new findings.

## Direction helpers

One per direction of a multi review: behavior, necessity, design or tests. The coordinator may share its working
record, its conclusions or other helpers' returns when useful, saying what is unfinished. A helper checks the premises
of its conclusions against the source, says which evidence it borrowed and who ran each check, and extends or corrects
shared work without rebuilding the whole record. The design helper asks where rules, state and effects are owned,
what must be understood or changed together and what that costs; it compares keeping, simplifying in place,
consolidating, extracting and removing, and for a removal weighs what the mechanism guarantees against what is lost.
It traces required behavior through any proposed target, telling observable changes and owner decisions from equivalent refactoring. A supported keep is a valid answer. A helper returns candidates, corrections, questions and leads with their places,
the checks it ran, and the scope it examined and did not reach; no record or line map is asked of it.
