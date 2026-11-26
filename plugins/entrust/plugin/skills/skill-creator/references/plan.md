# The plan file

Write the plan as a file, `plan.md` in the run directory, whenever it starts an agent or a session; a plan that
starts none is the message of step 3 and nothing more. Write the file before you show the plan, show the user
its text down to the log, and wait as step 3 says. After the user's word, and after any pause or any loss of
context, open the file before anything else: it says what was agreed and how far the work is.

Under entrust's [orchestrate](../../orchestrate/SKILL.md) the card stays orchestrate's; its checks row names
this file by path.

## The form

Keep every heading. Where a part does not apply, write `none:` and the reason.

```text
# Plan: <what will be made, and what is needed from the user, in two sentences at most>

Base: <for a change, the revision the files are at, or the copy of the folder; for a new skill, "new">
Sheet: <path>            Sources: <path>            Messages: <path>

## What step 3 shows
<the goal; the requirements; each decision with what settled it, an open one as a question; the approach and
the alternative rejected; each file with one line; the check with the result that keeps the work, the result
that does not, and what it cannot show; how the result is delivered>

## The run
Sessions of the check start through: <what the repository has for starting a session, by its path; else "an
  agent of this host">
The skill's text is written by: <this session, or the model or person the user named>
The delivery text is written by: <the same, or who the user named>
Could not be read: <each source or file, with every way tried; or "nothing">
Agents: <each judge, reader and reflection part, with its model and how many>

## Rounds
Rounds planned: <a number>          Fix rounds after a judge's read, at most: <a number>
The architecture critic reads: <at which step; and what makes it read again>

## Checkpoints
<one row for each: after which step | what the table must show to continue | to rework | to stop>

## Spend
Planned: <tokens by model, sessions, minutes; or "unknown:" and why>
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
  after a result is seen.
- Put a checkpoint after the step whose result can still change the plan cheaply: after the check is prepared,
  after the first run of the check, before delivery. A plan of one round has `none: one round`.
- Write each checkpoint's three rules before any result. At the checkpoint, fill the progress table, apply the
  rule as written, add a `checkpoint` row to the log, and show the user the table with the decision. Go on
  without waiting unless the rule says rework or stop, or the spend has passed its pause figure.
- A check with sessions follows the form of orchestrate's
  [experiment](../../orchestrate/references/plan.md#an-experiment-on-these-rules); where a pilot ran first, its
  [pause rule](../../orchestrate/references/plan.md#model-fit-and-estimates) sets the pause figure.

## The log

Add a row when a thing happens, not afterwards from memory:

| Kind | When |
|---|---|
| `decision` | you choose between two ways, drop a part, or apply or overrule an objection |
| `user idea` | the user offers a thought or a correction; the outcome is filled before delivery |
| `experiment` | a check, a dry run or a reflection part starts; the outcome is its close-out |
| `checkpoint` | a checkpoint is reached |
| `deviation` | you did something other than the plan or a step says |
| `limit` | something could not be done or read |

Take the time from a command, `date -u +%H:%M`, run when you write the row. Never write a time from memory: a
session does not feel the clock, and a log written that way has run more than an hour ahead of it.

## The figures

- A requirement line is shown by a run when a dry run, a session of the check or a script's test showed it;
  a judge's reading of the text fills `met at` and is not counted here. Before any run the first row reads 0.
- Tokens and minutes come from the host, which [hosts.md](hosts.md) says how to read. Write `unknown` where the
  host gives no figure, never 0 and never a guess, and do not add figures that come from different places.
