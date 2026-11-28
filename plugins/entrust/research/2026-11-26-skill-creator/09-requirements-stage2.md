# skill-creator v2, stage 2: the requirements sheet, amended, and its sources (Fable F3, 2026-11-27)

This file amends [07-requirements-v2.md](07-requirements-v2.md) and replaces none of its lines except where
section 3 says so. It adds what the owner asked for in four further messages, the ninth to the twelfth after
the report on version 1, and what the architecture critic of stage 2's first design found missing and the
designer accepts. The owner's messages are private: each line says which message it means, in neutral words,
and none is quoted. The critic's return, the design it read and the study of the coordinator's briefs stay in
the private run directory; this record carries their content.

Stage 2 is built in two slices. Slice 2a is the judges' briefs, the handling of their returns and the
close-out. Slice 2b, started only after 2a's test and the full test have a result, is the practice step, the
reflection role and the plan's fields. The last column says which slice answers a line; `build` means the
line is about this build and not about the skill; `—` means no slice of this version.

A departure, recorded as evidence about the skill (R89): stage 2 was first designed before this sheet and
before its sources were read. The route for work that adds reference files is Create, whose first two steps
are the sheet and the sources. The design is re-traced against this file.

## 1. From the owner, messages nine to twelve

| # | The skill, or its build, must | Source | Stated or inferred | Slice |
|---|---|---|---|---|
| R104 | have the coordinator settle the build's open questions itself, on rational and practical grounds, and keep its answers where they will be needed; the build stays in one conversation | the ninth message | stated | build |
| R105 | treat the result and efficiency as the bound on spend; no budget limit is set | the ninth message | stated; it is the source of the change to R8 that 07 records | build |
| R106 | be developed for about ten more hours by iterating, testing and experimenting; when the session's usage limit is near, the coordinator stops, waits for it to reset and continues by itself | the ninth message | stated, about the build. Inferred for the skill: a run that pauses is resumed from what it wrote down, its plan and its log, read first | build; 2b for the inferred line |
| R107 | show the user the plan of what comes next: the iterations, the experiments, and when reflection is started | the ninth message | stated; it restates R82 and R83 for this build | 2b |
| R108 | be built the way it tells an agent to work: what the coordinator does in this build maps onto the skill, and where the two differ, either the difference is logged as a departure or the practice becomes a line of the skill | the ninth message | stated; it sharpens R89 | 2a, 2b |
| R109 | carry in its own text what makes this build's critics and verifiers effective, because another model given the skill will not use them the same way | the tenth message | stated | 2a |
| R110 | avoid the curse of knowledge: its text works for a reader who has none of the writer's context | the tenth message | stated. Inferred: it is shown by a reader that has only the pages, on a model that will load the skill | 2a |
| R111 | make the handling of the curse of knowledge a part of the skill | the eleventh message, which approves the way the coordinator had begun to handle it | stated that it be a part. The method is the coordinator's and was approved in general words: take what a practitioner actually does from their own runs, hold it against the pages, write the gaps for a reader without the context, and test the transfer | 2a for its first instance, the judges' briefs; 2b for the general step |
| R112 | have the name `rnd`, for research and develop, weighed: the work is research, development, iteration and experiment, and the owner hopes it serves beyond creating and developing skills | the twelfth message, offered as a side thought | stated as a suggestion and a hope. Decided for this version: the name and the scope stay (section 4, M54); two tests named there decide later | — |

## 2. From the architecture critic of stage 2's first design

The critic returned `change approach` on the order, the test and the slicing, and would keep the architecture:
one skill under its present name, `references/critics.md` as the one owner of how a judge is briefed, and the
close-out on the main page.

| # | The skill, or its build, must | The critic's ground | Slice |
|---|---|---|---|
| R113 | have the sheet and the sources before the design, and the user's messages saved whole | the design traced to a study and to the coordinator's log, and four messages existed only as the coordinator's reading of them | build: this file |
| R114 | test the transfer of a practice on outcomes: a judge briefed from the pages alone is run on material whose answer is known, and what it catches is counted. A count of how far a brief resembles the catalogue the pages were written from is reported and decides nothing | a template on the page is copied by any model, so resemblance measures copying; R101 | 2a |
| R115 | give every added part a step number on the main page, in Create and in Change, and state what it costs of the page's budget | both sessions that followed the page opened the main page and one reference ([04](04-part-a-sessions.md)); the first design left reflection, the checkpoint and the close-out on no step | 2a, 2b |
| R116 | write the skill's pages about a skill; no wording made general ahead of a rename | R81; the first design named vaguer steps as the cost of generalising and then paid it | 2a, 2b |
| R117 | give each added part a rule under which it is kept or dropped, the handling of returns included | R103 | 2a |
| R118 | scale by size for Create as well as for Change: the audit runs only when the plan starts agents beyond the judges | R98 holds for a small new skill too; the pilot's audit cost 266 thousand tokens ([06](06-reflection-pilot.md)) | 2b |
| R119 | keep what the record shows working and say when it applies: planted false items and known answers held back calibrate a judge whose count decides a verdict | planted claims were caught six of six, and the held-back list made the audit's trust rule usable ([rounds.md](rounds.md); [06](06-reflection-pilot.md)); the first design dropped both and kept two elements with no visible effect | 2a |
| R120 | keep private places out of tracked lines: a requirement taken from someone's sessions names its source in neutral words on a tracked sheet | R56; the first design put "its place" on the sheet | 2b |
| R121 | add no measure to a frozen protocol: a rule that adopts or drops a part uses a measure the protocol already holds, or a test of its own written before it runs | [rounds.md](rounds.md), deviations of version 1 | 2a, 2b |

## 3. Lines of the earlier sheets that change

| # | Was | Is |
|---|---|---|
| R5(b), as 07 restated it | a small change needs no stop for the user's word for now; not built in stage 1 | this is a rule of this build's coordination and not a line of the skill. At the step where the wait would be dropped the agent cannot yet see what decides it, and the repository's rule is that a request for a task is not approval (`CONSTITUTION.md`). Change keeps its wait |
| R99 | the run's plan and log are orchestrate's card and decision log where a run has agents; this skill adds fields | the fields stay in this skill's own file in the run directory. orchestrate's plan page keeps cost estimates off the card, and nothing tells orchestrate's coordinator that a block was added (section 5). Under orchestrate the card names that file. For 2b |

## 4. Design decisions of stage 2, and the finding each comes from

Numbered after M53 of 07.

| # | Decision | Finding |
|---|---|---|
| M54 | one skill, named `skill-creator`, for this version. A general skill that owns the loop, with this one linking it, is rejected | level 3: the check version 1's sessions missed sat two links from the route ([04](04-part-a-sessions.md)); a second skill puts every loop step there. No selection figure exists for any name. Later, by rules fixed beforehand: two dry runs of the pages on work that is not a skill, and a selection probe of the two names |
| M55 | `references/critics.md` owns the brief: a short form the coordinator fills, and a section per role that the judge reads by path | briefs that named a section got returns in that section's form; a rule that sat in a role row was missed by two of four verifiers (the study of the briefs, level 3) |
| M56 | stage 2 is built in two slices, and 2b waits for 2a's test and the full test | the first design spent most of its tokens before any session read the pages |

## 5. Sources of stage 2

| Source | Read | What it settles | Taken | Refused |
|---|---|---|---|---|
| the conversation-mining workflow of a community skill-creator | whole | mining earlier sessions is a route of its own, used only when the user asks for it or names the sessions, and never implied by a long conversation; finding sessions and distilling them are separate stages; who said what is kept, and approval is never inferred from an assistant's or a tool's text; a gap in what could be read is recorded, not filled by a wider scan; the read-through for private material is the gate, and a clean scan is not; the smallest pass first, with no agent for a small corpus; an existing owner is updated before a new reference is made | the trigger (the user's word or named sessions); the roles kept apart; the recorded gap; the manual privacy read; the smallest pass; update the owner first | its manifest, chunking and redaction scripts and their runtime, since this skill's one script is host-neutral; its five kinds of mining agent; promoting the mined text as a new reference with a section on the main page that lists it. It mines knowledge of a subject. It has no step that holds a practice against the pages, none that asks what each habit did, and no test of transfer on a reader without the context. For those three this skill has no prior art and says so |
| orchestrate's main page (this plugin) | whole | the card and the decision log are written under the coordinator's temporary directory and re-read after a pause; its coordinator may not edit the tree or read sources whole, so a session that writes a skill's text is a worker there, not the coordinator; an objection counts when it cites a place, is applied after that place is read and overruled by a place, with the reason in the decision log; a fix is re-verified at most twice; one whole return is opened before a unanimous tally is trusted; the mode is the user's to invoke and no skill can load it | the decision log's row with its reason; re-reading the plan after a pause; opening a return before trusting a tally; the cap on fix rounds as a number fixed beforehand | putting this skill's fields on the card; its default tier for critics, which the owner overrode (R18) |
| orchestrate's plan page (this plugin) | whole | the card has four rows and leaves cost estimates off; a pilot has an acceptance rule and a pause when tokens pass three times the pilot's; an experiment is a protocol written before any agent, with a hypothesis that can be false, frozen material with its ground truth, a blind read, a budget with a stop rule, and a failed arm recorded and never rerun | the experiment's form, by link, for the outcome test of 2a and for 2b's experiments field; the pause rule, by link | restating either; a planned-spend line on the card |
| the study of the coordinator's 31 judge briefs against their returns and the pages (this run, private) | whole | which elements of a brief the returns show working, which failed when absent, which show nothing; what the coordinator did with returns; which of it the pages lack or contradict | the elements with a level-3 place; the skeletons as the content of the role sections | its test's rule, which scored resemblance (R114); the two elements with no visible effect are kept as one line each, marked as judgement |

## 6. What these lines do not cover

Whether the loop serves work that is not a skill, and whether another name would be selected as well, are not
measured in this version. The outcome test of 2a uses one model, one scenario per role and three roles; the
architecture critic, the dry-run agent and the reflection lenses are briefed from the same form and are not in
it.
