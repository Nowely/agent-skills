# skill-creator v2: the requirements sheet, amended (Fable F3, 2026-11-26)

This file amends [01-requirements.md](01-requirements.md); it replaces none of its lines except where section 3
says so. It adds what the owner asked for after the report on version 1, in eight messages, and what the
architecture critic of version 2's design found missing and the designer accepts. The owner's messages are
private: each line says which message it means and states it in neutral words, and none is quoted. The critic's
return and the design it read stay in the private run directory; this record carries their content.

Version 2 is built in stages. Stage 1 is the preservation list, Change's steps written out and the scope of
"remove first". Stage 2, started only if stage 1's pilot passes, is the plan and the run record, the close-out
and the reflection role. The last column says which stage answers a line; `—` means no stage of this version.

## 1. From the owner, after version 1

| # | The skill must | Source | Stated or inferred | Stage |
|---|---|---|---|---|
| R82 | have its plan fix, before the work, how many rounds or iterations there will be and when the architecture critic takes part, and have the user agree to that with the plan | the first message after the report | stated | 2 |
| R83 | show intermediate results at stages named in advance | the first message; the fourth says the figures given in the first were examples | stated | 2 |
| R84 | report progress in numbers that fit the work, such as goals met, the time of an iteration or experiment, and tokens; what it costs to make a skill is one of the measures | the fourth message | stated | 2 |
| R85 | keep its name or change it, whichever is useful; keeping it is allowed. The reason first given for a rename was the trouble the name had caused; the same message supposes that two skills applying at once is not a problem | the first and fourth messages | stated, as a decision left to the build. Decided: the name stays, see section 4 | 1 |
| R86 | let the digests of the test sessions serve as material for a review from outside | the second message, which offers it and doubts whether it is needed | stated as an option | done: [04](04-part-a-sessions.md), [05](05-part-r-sessions.md) |
| R87 | include a reflection step: at some stage the coordinator starts a fresh agent that asks whether the coordinator has lost its way, whether the direction is right, whether something was missed, whether the skill is developing, whether a dropped approach deserved dropping, given that one change alone may do nothing where two together do, and whether the coordinator forgot something or lost it when its context was compacted | the third message | stated | 2 |
| R88 | settle how reflection is started, on the transcripts or as a copy of the coordinator | the third message, which leaves it to be thought over | stated as open. Decided by the coordinator: on the transcripts and the run's files, because the one comparison with a copy was void ([06](06-reflection-pilot.md), side actions) | 2 |
| R89 | be judged by its own building: how well the skill is made with the skill is evidence about the skill | the third message | stated | 1, 2: departures from the skill's route are logged in the run |
| R90 | aim reflection first at an insight or a leap for the skill; it may run on another agent or on a group, each on a direction of its own | the fifth message | stated | 2 |
| R91 | keep the results of the first reflection run, so that later runs have something to be compared with | the seventh message | stated | done: [06](06-reflection-pilot.md) |
| R92 | carry the reflection role in the skill itself, so that its results can be followed from version to version and the role improved | the seventh message | stated | 2 |
| R93 | say when and how the role is applied: its results are judged when they arrive and the approach corrected alongside, and a direction such as outside sources, which change slowly, is run again only when that pays | the seventh message | stated; the cadence is a reading of one run ([06](06-reflection-pilot.md), last sections) | 2 |
| R94 | carry an idea or a pilot to an end: whether it is applied to the skill, which side actions it needs, a reflection on the result, the approach corrected, the idea corrected | the eighth message | stated. Inferred, from the critic (R99 below): this holds for an idea of the user's that never became an experiment, too | 2 |

The sixth message is an approval and adds no line.

## 2. From the architecture critic of version 2's design

The critic returned `change approach`: the same scope, thinner and in stages. Each line below is a lack it named
that the designer accepts.

| # | The skill, or its build, must | The critic's ground | Stage |
|---|---|---|---|
| R95 | amend the sheet before the design is traced to it | version 1's own rule puts a correction on the sheet first (`SKILL.md`, "A correction"); the first design of version 2 traced to the messages directly | 1: this file |
| R96 | keep Repair a route: a corrected word and a corrected link pass the preservation list with no line listed | a list that compares whole lines lists every corrected line, which would leave Repair empty | 1: `check.mjs`, the suite's second preservation case |
| R97 | build and pilot the cheapest part that can fail before the rest, and place the judges of the text after that pilot | a session's next turn acted on neither of the safeguards its own first turn had written ([04](04-part-a-sessions.md)), so a mechanism that rests on the next turn running a command is unproven until one does | 1: the stages |
| R98 | stay in proportion to the work: a small change is not loaded with a form, a log and a role dearer than the change | both sessions that followed the page dropped the sheet as too much for a small edit ([04](04-part-a-sessions.md)); R5(b) and R14 of the first sheet | 1: one command and one line per lost line. 2: to be shown |
| R99 | give the run's plan and log one owner: where a run has agents, orchestrate's card and decision log, to which this skill adds fields; no second thing called a ledger | orchestrate already defines both (`orchestrate/SKILL.md`); R53, R64 and R81 of the first sheet | 2 |
| R100 | track a user's idea to an outcome whether or not it becomes an experiment | the eighth message is about an idea, not about an experiment | 2 |
| R101 | test with a measure that is not drawn from the mechanism under test: a request the plan's form was not written from is part of the rule | the first design scored the replay on the clauses its own form has slots for | 2: the protocol |
| R102 | say what the reflection role is first: a search for a leap, with the audit as its factual base | the first design scheduled mostly audits, against R90 | 2 |
| R103 | give the plan's form, the run log and the progress table a rule under which they are adopted or dropped | they had no experiment of their own | 2 |

Not accepted as a line, with the reason: the critic asked whether R8, the bulk of the spend on Sonnet, binds
version 2's build. The owner has since answered that the result and efficiency come first; section 3 restates R8.

## 3. Lines of the first sheet that change

| # | Was | Is |
|---|---|---|
| R8 | tested in full, with the bulk of the spend on Sonnet | tested in full; sessions, pilots, verifiers and operators on Sonnet, the writing and the critics on the top tier (R13, R18), readers one tier below it. Source: the owner's answer to the coordinator's questions after the critic's return |
| R5(b) | every question at the first stop | unchanged, with one decision added by the same answer: a small change needs no stop for the user's word for now. Not built in stage 1: Change still waits at its plan, and stage 1's pilot is run to that page |

## 4. Design decisions of stage 1, and the finding each comes from

Numbered after M49 of the first sheet.

| # | Decision | Finding |
|---|---|---|
| M50 | `check.mjs <directory> --against <base>` lists every line of the Markdown as it was that nothing carries now, and exits 1 until each is answered in a dispositions file: `moved`, with a place and a quote that stands there, or `retired`, with the user's own words at a place outside the skill | level 3: all four Part A sessions lost the same three rows, and the two that followed the page never opened the file that held the "nothing was lost" check ([04](04-part-a-sessions.md)). Level 3: a 20-line prototype lists the three rows in all four final trees ([06](06-reflection-pilot.md), cluster 1). Prior art: daymade's skill-creator freezes the old skill and asks one disposition for each unit without a match |
| M51 | Change's steps are written out on `SKILL.md`, with the list as step 8, after the last edit and before the judges; Repair runs the same step | the check was two links from the route, behind "Create's steps 4 to 10" |
| M52 | "remove first" holds for an instruction the requirement no longer wants and for a duplicate; a fact is moved or its removal is put to the user | one session gave the page's "remove first" as its reason to delete the rows ([04](04-part-a-sessions.md)) |
| M53 | the name stays `skill-creator` | R10 of the first sheet (the standard's name); no selection figure exists, since the selection part did not run; a rename would change selection in a direction nobody has measured |

## 5. What these lines do not cover

Creating a new skill, selection beside a host's built-in skill of the same name, and any host other than Claude
Code were unmeasured in version 1 and no stage of version 2 measures them. The preservation list compares
text: it cannot tell whether the words a `moved` line quotes still say what the lost line said, nor whether a
file of saved messages is the user's. Both stay with the quality critic's read.
