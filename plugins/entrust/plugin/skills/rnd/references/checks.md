# The check

This page has [choosing the check](#choosing-the-check), [what a check may spend](#what-a-check-may-spend),
[the sessions](#the-sessions),
[the baseline](#the-baseline), [a dry run](#a-dry-run), [test cases](#test-cases), [a transfer test](#a-transfer-test) and
[a selection check](#a-selection-check).

## Choosing the check

Take every row whose claim the user's request makes. For research without a change, choose the method in
[research.md](research.md) by the question; a comparison is not required for every observation or assessment.

| The work claims | The check that can fail | It starts |
|---|---|---|
| a script now enforces a rule | a test that fails when the change is taken out | nothing |
| nothing was lost in a cut, a move, a merge or a rewrite | [Change's step 8](../SKILL.md#change) exits 0; each fact its dispositions call moved is found, in the words the disposition quotes, at the step where the reader meets it; and one fresh reader answers scenarios written from the old files | one agent |
| a literal reader can follow the skill: a route, a step, an order | [a dry run](#a-dry-run); for a change, once before and once after | one agent per run |
| an agent acts differently with the skill: an instruction added or reworded, or a new skill when the user asks for runs | [test cases](#test-cases), with the skill and without | two sessions per case, and one reader |
| the skill makes a thing that agents then use, such as a skill, a brief or a prompt | [test cases](#test-cases) whose statements are about what fresh agents do with the thing each run made | two sessions per case, the agents that use each result, and one reader |
| the skill carries a practice: an agent with only the pages does what the practitioner did | [a transfer test](#a-transfer-test), on the pages before and after | its sessions, one agent to build the material, and one confirmer |
| one of two approaches serves the goal better | the same test cases under each approach, the statements written first | two sessions per case, and one reader |
| the description selects the skill: a changed name or description, or a new skill when the user asks for it | [a selection check](#a-selection-check) | its sessions, for each host |

Size the check to the work. A change to one step takes one case. A new skill takes [the baseline](#the-baseline) and the dry run, and when the
user asks for runs, one test case for each stage of the walk that its instructions cover, up to three. When
the user caps the spend below that, keep every check in
the plan, in the order of the decision each can change, and say which ones the cap leaves unrun and what each
would have shown. With no run at all, the quality critic's read is the only evidence, and the result says so.

## What a check may spend

Every session, reader and judge is paid for by the user, and a check is worth the decision it can change.

- The plan gives each check, and each practical run, its cost: its agents and sessions, the model of each, and the tokens estimated
  from runs like it that the host has figures for, else `unknown`. A check runs when its result could
  change the answer to a question the user asked, or the plan; a comparison that a missing control leaves undecided does not stop a
  check or a practical run that answers another such question.
- Before starting a new run, look in the run directory and the repository's records for an existing run, and use it only when its task, inputs, context, versions, tools, permissions and
  assessment support the contrast. Record material differences; an incompatible run is context, not a control. An already used case
  does not become independent by freezing it. When a control is unavailable, report observations and leave
  the comparison unknown.
- A check starts with the smallest sample that can change its decision: one session for each case and each
  side, one reader and one confirmer. Before more than one session of a check starts, run one and read its
  transcript, the transfer test's scenarios and the selection check's requests included: it had the tools, it
  read the files it was given, and its result could pass each statement. A statement that no session could
  pass on that setup is rewritten, or the setup fixed, before the rest start. A genuine missed requirement remains a failure.
- More than that is an option the plan puts to the user, with its cost and what it could show that the
  smallest sample cannot: a repeated run, several sessions for each side, a second reader, or a role on the top
  tier that [critics.md](critics.md#which-model-and-how-many) gives the executor tier. It runs only on the
  user's word naming it; a reply that leaves the choice to you takes the smallest sample.
- A check of more than five sessions, such as a selection check, is shown in the plan on a line of its own
  with its count and cost, so the user's word on the plan is given on it.
- The plan's rule says, before any run, whether a margin reported as undecided keeps the work or fails the rule.

## The sessions

- Start each session with a host-supported native session when it meets the check's needs; otherwise use the repository's adapter for that host. The plan names which. Run every case on the
  cheapest model the sheet says will load the skill, and one case once more on each other model on the sheet.
  A session on a host this one cannot run is started only when the user named that host. A model or a host on
  the sheet that got no session is named in the result as unmeasured.
- Give each session the tools the skill's steps use: a skill that starts agents is checked in sessions that can
  start them. Where what the repository has gives a session no such tool, start it another way that does,
  which [hosts.md](hosts.md) names for each host, and write that way in the plan; no brief of a session is
  handed to the user to run. Where no way gives the tool, the plan and the result say that the check cannot
  show the skill's agents at work.
- The skill reaches a session as files: give it the path of `SKILL.md` and tell it to read the file whole and
  follow it. A session that runs without the skill gets neither the path nor the skill's name.
  The plan names the control it means: the host as it is, which may find another skill for the same job, or no
  skill for the job: their folders are removed from the copy, and an installed copy the session's host loads from
  outside it is turned off where the host allows. If either exposure cannot be excluded, the control is the host as it is,
  and the plan and the result say so. The result names every skill a
  control session opened. If a control opens a skill for the job, label it host-as-is and do not treat its observations as no-skill evidence.
- Every session of a check gets its own copy of the working tree, so that nothing it writes enters the skill or
  the repository. A practical run on the user's real task, with their authorization, is a use and not a check
  session: it runs where the task is, under the normal permissions. Respect actual permissions and approval
  conditions for protected actions. Record
  the environment and limits; do not claim isolation that was not established. No case performs an
  irreversible action or one with an external effect, such as a tag, a push, a release, a publication or a message:
  it stops before it, or simulates it up to that boundary, and the plan and the result say what the check
  therefore cannot show.
- No session receives the statements it is marked by or the finding you expect.
- A session has no user. A question it asks appears in its return; count it as an event and do not answer it.
  A skill whose own steps wait for the user's word is the exception: write its replies before any run, one for
  each question the cases can raise, each an answer and none that hands the choice back, and give every
  session of every arm the same ones.

## The baseline

The baseline is what the agent does on the job with no skill for it, when both exposure sources can be excluded; otherwise it is host-as-is and cannot prove no-skill behavior. It says which lines the skill needs: one
for each failure seen, and none for what went right.

1. At step 5, take the cases the plan's check has. A plan without test cases writes one request the way a
   user would type it, for the whole of the sheet's job.
2. Start one session for each case, as [the sessions](#the-sessions) says, without the skill. For a rewrite,
   also start one with the skill as it is.
3. Read each session's transcript and what it made, and write `baseline.md` in the run directory: each
   failure, the case, the place that shows it, and which requirement line or stage of the sheet it belongs to.
   A failure is a result the user would send back, or a stage of the walk the session skipped or got wrong;
   read what the session did, not only what it reported.
4. A failure that no line of the sheet covers is [a correction](plan.md#a-correction). A stage where no
   session failed, and for which the user's words ask nothing, gets no step: mark it on the sheet as left to
   the agent, with the run that shows it. A stage that no session reached shows nothing about whether its
   instruction is needed.
5. Reuse these sessions as controls for [test cases](#test-cases) only where the conditions of [what a check may spend](#what-a-check-may-spend) support the contrast.

For a Change, the observation of its step 1 is the baseline. The baseline's sessions alone do not make the
plan's check one that runs sessions: that takes test cases, a transfer test or a selection check.

## A dry run

1. At step 5, write one request the way a user would type it, from the middle of the sheet's job.
2. At step 8, start one fresh agent on the cheapest model the sheet says will load the skill, briefed as
   [every brief](critics.md#every-brief) with this section as its role and the sheet among what it must not
   open. Give it the path of `SKILL.md` and the request, in a file. Tell it to walk the request through the files as written, to run nothing, and
   to report each step where it halts, has to guess or can read a line two ways, with the file and line. For a
   change, start the same walk at step 5 as well, on the skill as it was, and compare the two reports.
3. The work is kept when the walk reaches the end with no halt and no guess at a stage the sheet's walk covers.

## Test cases

1. Write each case as a request the way a user would type it: concrete, with the file names, the context and the
   detail a real request carries. Make one of them the request on which following the skill costs the agent
   most. Take none from the run that prompted the work.
2. Before any run, write for each case what a good result is, as statements a reader can mark `true`, `part`, `false` or
   `unknown` with a place, and write in the plan's rule how `part` and `unknown` count, as
   [every brief](critics.md#every-brief) says. A demonstrated violation is `false`; unavailable evidence is
   `unknown`, with the reason. A
   statement is about the result. Where the claim is about what the agent does on the way, such as a
   question it asks or a step it skips, the statement names an event the transcript shows, never the agent's
   wording. Where the result is itself a thing agents use, such as a skill, a brief or a prompt, the statements are
   about what fresh agents do with it: give each run's result, unedited, to fresh agents on the cheapest model
   that will load it, each with a job the result serves and its maker never saw, and have the reader mark what
   they made.
3. Run each case once with the skill and once without it, on the same model with the same inputs. For a change,
   "without" is the skill before the change.
4. Have one fresh reader mark each statement for each run, with the place that shows it, not knowing which run
   is which, briefed as [every brief](critics.md#every-brief) with this item as its role. Give it the
   statements, each with its marks defined, and each run's outputs under a letter; it must not open the key to
   the letters, nor the plan's rule. It marks strictly and literally, and where two marks were possible it says
   why it chose one. It returns the marks, with no total and no verdict; how `part` counts is the plan's rule,
   which it does not see. Then have the marks confirmed and compute the verdict as
   [handling a return](critics.md#handling-a-return) says. Read the transcripts as well, for a file of the
   skill no session opened and a step every session skipped; each is a finding for the result.
5. Report every statement in absolute assessment, including a mandatory criterion failed by all runs. A
   shared outcome does not distinguish the sides and is excluded only from the relative difference.
6. Code that every session wrote for itself is a finding for the result: a script the skill should carry.
7. A difference between two versions counts only when it is larger than the difference between two runs of the
   same version. A second run of the unchanged skill, which learns that difference, is an option of
   [what a check may spend](#what-a-check-may-spend); without it a difference is reported as undecided.

## A transfer test

It answers whether the pages carry a practice to a reader who was not there. It judges by what comes of the
reader's work, not by how far that work resembles the practitioner's: a page that holds a template is copied
by any model, and resemblance then measures copying.

1. At step 5, have a fresh agent that has seen neither the pages nor
   [the practice file](analysis.md#a-practice-someone-already-performs) build the material: for each kind of
   artifact, a small scenario with answers known in advance, such as a fault planted in a text, and a key that
   lists them. A second fresh agent, with the key, confirms each answer can be found from the scenario; one
   that cannot is replaced. Both write to files you pass on by path and do not open before step 8, since you
   may be the one who writes the pages; any other writer of the pages is not given them either.
2. Learn the floor, then write the rule. The plan preregisters the raw-key threshold for sufficiency. Compare the floor against it before removing floor answers or rebuilding: if it meets the threshold for a new skill, the result is `not needed`. Have each scenario answered once by a fresh agent, of the tier that uses an artifact in item 4, whose brief holds
   the artifact's name and the scenario's files and nothing of the pages, and have the second agent of item 1
   count the known answers that come back. Count every answer for each arm, including those the floor reaches.
   Equal outcomes contribute zero difference; if the floor passes an answer and a candidate misses it, retain
   the regression. A residual count may be a separate measure only if the plan specifies it in advance; it
   does not replace the full assessment. When the floor reaches more than half of the answers, the
   material is built again. The rule is written now: how many of the known answers each run must reach,
   and by how much the pages as they will be must beat the pages as they are, as the derivation from the floor
   that the plan approved before any run gives. A rule the plan did not provide for goes to the user before any
   run.
   For a new skill there are no pages as they are: the floor stands in for them.
3. At step 8, start sessions on the cheapest model the sheet says will load the skill. Each gets the path of
   `SKILL.md`, one scenario and one line: which step it is at, which artifact to write, and to start nothing.
   One session for each scenario on the new pages and one on the pages as they were; for a new skill, on the new
   pages only, against the floor measured at item 2.
4. Use each artifact as it would be used: a brief is given, unedited, to a fresh agent with the scenario; a
   review is applied; a plan is carried out. Count the known answers that come back, each confirmed at its
   place as [handling a return](critics.md#handling-a-return) says.
5. Decide by the rule. A margin counts only above the difference between two runs on the new pages; that
   second run is an option of [what a check may spend](#what-a-check-may-spend), and without it a margin is
   reported as undecided. When
   the pages as they were already reach the rule and the new pages show no regression, the result is
   `not needed`: the gaps were not gaps. Report any observed regression separately, including when the floor
   met its threshold.
6. Report beside it, deciding nothing: which things of the catalogue each artifact holds, and what the
   sessions said they were unsure of. The second is where the next correction starts.

## A selection check

1. Have an agent that has seen neither the description nor any earlier case write the requests: about ten the
   skill is for, in varied wording, some that never name the skill, and about ten near misses, which share the
   skill's words and need something else. Fewer leaves each kind of request with one example.
2. Make the session's list of skills the one a real user has: this skill, and every rival that
   [structure.md](structure.md#the-approach) sorted out in step 2, the host's built-in ones included. A rival
   of the same name is the nearest. If the sessions cannot be given a rival to list, say in the result that
   selection beside it is unmeasured.
3. Run each request once: about twenty sessions for each host. Start sessions as above, each given the request alone. A host adapter may describe a selection tool; use it only if its population, run count and side effects meet this plan and the user has explicitly authorized its spend and side effects. Record
   which skill was loaded before the answer or the first action: this one, a rival by name, or none, shown by the log.
   If the selection log is unavailable or selection was not observed by then, record `unknown` separately.
4. Report the result for each request, and every request a rival took. A margin over a rival, or over an
   earlier description, decides only against a second run of the same set, an option of
   [what a check may spend](#what-a-check-may-spend); without it the margin is reported as undecided.
5. Requests the skill is for with a confirmed selection of a rival or none shown by the log are [a correction](plan.md#a-correction): rewrite the
   description from them by [writing.md](writing.md#the-description), have a new set written, because a set its
   writer has seen no longer tests it, and run once more. Unknown selection is unverified, not a confirmed miss.
