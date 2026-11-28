# The plan file

Write the plan as a file, `plan.md` in the run directory, whenever its check runs sessions (test cases, a
transfer test or a selection check) or it has more than one round; any other plan is the message of step 3 and
nothing more. Write the file before you show the plan, show the user
its text down to the log, and wait as step 3 says. After the user's word, and after any pause or any loss of
context, open the file before anything else: it says what was agreed and how far the work is.

This page has [the form](#the-form), [rounds and checkpoints](#rounds-and-checkpoints), [the log](#the-log),
[the figures](#the-figures), [a close-out](#a-close-out), [a correction](#a-correction),
[what the plan shows](#what-the-plan-shows) and [a parent's scope](#a-parents-scope). Every run but a small change
writes a close-out, with a plan file or without one.

Under entrust's [orchestrate](../../orchestrate/SKILL.md), that skill's own plan, which it calls the card,
stays as it is; its checks row names this file by path.

## The form

Keep every heading. Where a part does not apply, write `none:` and the reason.

```text
# Plan: <what will be made, and what is needed from the user, in two sentences at most>

Base: <for a change, the directory snapshot made before edits; for a new skill, "new">
Sheet: <path>            Sources: <path>            Messages: <path>

## What step 3 shows
<the parts of "What the plan shows" below>

## The run
Sessions of the check start through: <the host-supported native session, or the host adapter and why it is needed>
Sessions are given: <the tools the skill's steps use, an agent tool among them; or what the check cannot show
  without one>
The skill's text and files are written as: <the form of the text; what goes to references and what to scripts;
  each limit on size as a number printed after a slash by the common or target-host check run on `<skill-dir>`; the model that will read it>
The skill's text is written by: <this session, or the model or person the user named>
The delivery text is written by: <the same, or who the user named>
Could not be read: <each source or file, with every way tried; or "nothing">
Agents: <each judge, reader and reflection part, with its model, or "this session", and how many>
Agents start: <how each starts on this host; one this host cannot start is written "cannot start:" with the
  reason>
Calibration: <for the check's reader and the audit: false items planted, or answers held back; or "none:">

## Rounds
Rounds planned: <a number>          Fix rounds after a judge's read, at most: <a number>
The architecture critic reads: <at which step; and what makes it read again>

## Checkpoints
<one row for each: after which step | what the table must show to continue | to rework | to stop>

## Spend
| Agent or session, from "Agents" | Requirement line | Model | Planned | Spent, with where the figure comes from | Gain shown by a run |
|---|---|---|---|---|---|
Total planned: <tokens by model, sessions, minutes; or "unknown:" and why>
Options put to the user: <each larger sample, with its cost and what it could show; or "none">
Pause when: <the figure past which you stop and ask>

## Reflection
Parts and their steps: <from reflection.md's table; or "none:" and why>
Merging several returns: <the rule, written now>

## Log
| Time | Kind | What | Why, with the place checked | Outcome |
|---|---|---|---|---|

## Progress
| Measure | At <checkpoint> |
|---|---|
| requirement lines shown by a run, of how many | |
| statements passed, with the skill and without | |
| objections raised, taken, overruled, open | |
| corrections by the user since the last checkpoint | |
| minutes since the plan was accepted | |
| tokens, by model, each with where the figure comes from | |
```

## Rounds and checkpoints

- A round is one pass from a text to a judge's or a check's result. Fix the number, and the cap on fix rounds,
  before the first; when the cap is reached with objections open, they go to the user. A cap is never raised
  after a result is seen. For the plan's check the cap is not yours to set:
  [a correction](#a-correction) allows one changed plan and one more run. No cap takes away the
  second read that [critics.md](critics.md#which-model-and-how-many) gives after a fix.
- Put a checkpoint after the step whose result can still change the plan cheaply: after the check is prepared,
  after the first run of the check, before delivery. A plan of one round has `none: one round`.
- Write each checkpoint's three rules before any result. At the checkpoint, fill the progress table, apply the
  rule as written, add a `checkpoint` row to the log, and show the user the table with the decision. Go on
  without waiting unless the rule says rework or stop, or the spend has passed its pause figure.
- The session's own turns are spend too, each one reading its whole context again. At each checkpoint the table
  shows how much of what the host keeps the session's context holds; past half, say so with the table and offer
  to go on in a fresh session that opens this file first. Read a large file or a transcript by search, and open
  an agent's long return file only where a step needs it.
- Fill the spend's first four columns when you write the plan, one row for each agent and session it names.
  At each checkpoint, fill the last two. The requirement line whose rows hold the largest share of what is
  spent at two checkpoints running, with no gain shown by a run at either, stops: nothing more is spent on it
  until the user, shown the table, says to go on.
- A check with sessions follows the form of orchestrate's
  [experiment](../../orchestrate/references/plan.md#an-experiment-on-these-rules); where a pilot ran first, its
  [pause rule](../../orchestrate/references/plan.md#model-fit-and-estimates) sets the pause figure.

## The log

Add a row when a thing happens, not afterwards from memory:

| Kind | When |
|---|---|
| `decision` | you choose between two ways, drop a part, or apply or overrule an objection |
| `user idea` | the user offers a thought or a correction; the row names its line of the sheet, whose outcome the close-out gives |
| `experiment` | a check, a dry run or a reflection part starts; the row names its close-out |
| `checkpoint` | a checkpoint is reached |
| `deviation` | you did something other than the plan or a step says |
| `limit` | something could not be done or read |

Take the time from a command, `date -u +%H:%M`, run when you write the row. Never write a time from memory: a
session has no sense of the clock.

## The figures

- A requirement line is shown by a run when a dry run, a session of the check or a script's test showed it;
  a judge's reading of the text fills `met at` and is not counted here. Before any run the first row reads 0.
- Tokens and minutes come from the host, which [hosts.md](hosts.md) says how to read. Write `unknown` where the
  host gives no figure, never 0 and never a guess, and do not add figures that come from different places.
- In the spend, an agent or session that serves several requirement lines has `shared` as its line, with the
  lines named; `shared` is not a line and never stops. A gain is shown when a run moved a result the plan's
  rule counts, never when a text changed. Where its figures cannot be added, a line's share is its count of
  agents and sessions.

## A close-out

Nothing the run started is left without an end. Write these in the run directory, beside the sheet.

- For the plan's check, a dry run, a selection check and a part of reflection, each when its result is in:
  the verdict by the rule the plan gave it; what becomes of the thing it tested, the change to the skill or
  the part of reflection: `adopt` as it is, `adjust` with the change named, or `drop`; what you did because of
  it; and when it is measured next.
- For each line of the sheet marked `idea`, before delivery: taken, with the place; declined, with the reason
  you gave the user; or pending, with the step that will decide it.

What came from the user's sessions is private: before the record is tracked or sent anywhere, an agent that wrote
none of it reads it and takes out whatever the user has not already made public.

## A correction

A correction is anything that shows the sheet or the text misses or misreads what the user wants: a message
from the user, a judge's return, a reader's return (the reader of the user's words' only by the user's reply), a result of the plan's check that fails its rule, a
description that agents do not select. An answer to the plan is one when it adds a condition or refuses a
part, and not when it only accepts or settles a question as asked.

1. Add it to the sheet, with the user's words or the return's, and where they are. Words of the user that do
   not fit the design are asked about, never read to fit.
2. Name the step that should have caught it, and redo that step's part of the sheet to find what else it missed.
3. Hold the approach, the layout and the check against the amended sheet. If the approach or the check changes,
   show the user the changed plan and wait as Create's step 3 does; the architecture critic reads a changed approach
   again. If only the text
   changes, edit it by [writing.md](writing.md), run the check script and, where Change's step 8
   ran, its `--against` command again, answering each line as that step says;
   [critics.md](critics.md#which-model-and-how-many) says whether a judge reads again. The user's
   second correction since the plan adds the audit of [reflection](reflection.md) to a changed plan.

Every edit that follows comes from the amended sheet, never from the correction alone. After the plan's check
fails, one changed plan and one more run of it are the limit; a second failure goes to the user with both
results.

## What the plan shows

Create's step 3 and Change's step 4 show the user one plan, in a message or, where the plan is a file, in the
file's text down to the log:

- the goal, the requirements, and each decision with what settled it; a decision still open is put as a
  question, as [the questions](analysis.md#the-questions) says;
- the approach, with the alternative you rejected, and each file with one line on what it holds;
- how the skill's text and files will be written, a decision of its own: each part that
  [the sheet's table](analysis.md#the-sheet) names, with its answer, in the plan's own words, not by pointing at
  a page;
- the check: what will be observed, in which runs, the result that keeps the work, the result that does not, and
  what the check cannot show;
- who writes the text, which is this session when the user named no one, and every agent steps 4 to 10 will
  start, each with its model, number of sessions, cost and how it starts on this host, as
  [critics.md](critics.md#which-model-and-how-many) and [checks.md](checks.md#what-a-check-may-spend) give them;
- how the result will be delivered;
- when the plan is a file: every heading of [the form](#the-form), the parts of
  [reflection](reflection.md) it will run among them.

## A parent's scope

When no user can answer, a parent may pass the scope of a user-approved plan, including its authorized checks and
agents, with the paths of that plan and of the user's saved word that approved it. Read both first: the scope is
what they show; what the parent adds is a claim, returned as a question. In this order:

1. A scope claimed without both paths is no approval, even when an edit is named: the plan with its questions is
   your return, and you stop there.
2. With no scope claimed, an instruction that names an edit authorizes that edit, the common or target-host skill
   check in Create step 6, and the `--against` command in Change step 8, and no agent or session.
3. With no scope claimed, an instruction to investigate authorizes reading and a reported answer, and no agent or
   session.

Carry out a scope the paths show without asking again; by itself a model name, an upper bound or an instruction
to investigate authorizes no agent, session or edit. Do the independent authorized work, then return an unclear
decision to the parent, or in the result when there is none. If no judge reads it, say so there.
