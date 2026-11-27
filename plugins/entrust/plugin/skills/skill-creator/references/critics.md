# The judges

Three agents judge the work: the architecture critic at Create's step 4, which judges the architecture and the
approach together, the quality critic at step 7 and the verifier at step 9. This page says how each is briefed
and what you do with what comes back: [every brief](#every-brief),
[which model, and how many](#which-model-and-how-many), [the architecture critic](#the-architecture-critic),
[the quality critic](#the-quality-critic), [the verifier](#the-verifier),
[handling a return](#handling-a-return).

## Every brief

Each judge is started fresh: it wrote none of the work and saw none of the conversation. Brief each one with
paths to files, never with your summary of them: the page that holds its role with the heading of its section,
to read first and follow; the files that section lists; and a file in the run directory for its full return.
No brief carries your reasons or what you expect the judge to find. Another agent's return goes in only as a
claim to check, and so does the author's own account of the work.

- A brief also lists, by path, what the judge must not open: whatever would hand it its answer, and never the
  author's account. That is another judge's return on the same work, an earlier critique of the same text, an
  answer key or a list of faults already known, the statements' expected marks. Judges that run side by side
  are each forbidden the others' return files.
- Every set of marks on this page and in [checks.md](checks.md) has one more member, `part`: the item is
  there without its value, or with one of its two clauses. A judge marks `part` and says what is missing. `part`
  counts as the weakest mark of its set, `not met`, `lost` or absent, unless the plan's rule said otherwise
  before the run.
- Two judges give counts that decide a verdict: the reader of [test cases](checks.md#test-cases) and the
  audit of [reflection](reflection.md). Before you brief either, find out whether its count can be trusted, by
  one of two ways, and write which in the plan: add to what it reads two false items of the kind it is to
  catch, marked nowhere, and keep their list out of its reach; or hold back answers you already know and
  name their file under what it must not open. [Handling a return](#handling-a-return) says what its count is
  then worth.

## Which model, and how many

Two tiers are used. The top tier is the strongest model the host offers; the executor tier is the model the
host uses for ordinary work. [hosts.md](hosts.md) says where each host lists its models: look them up before the
plan names one, and when this session cannot see the list, the plan gives the tier and asks the user to name
the model. A model the user names for a role replaces its tier. Putting the critics on the top tier is the
choice of this skill's owner. It differs from the defaults of entrust's orchestrate, which runs such critics on
the executor tier; the plan names each model, so the user sees the difference and settles it with one word.

| Role | Tier | Why |
|---|---|---|
| the architecture critic and the quality critic | top | a skill is read on every later use, so a gap a critic misses is paid for each time |
| the verifier; a reader of sources or of a practice; the reader who marks a check's statements; the agent that confirms marks; the writer of a selection check's requests; in a transfer test, the builder of the material, the agent that confirms its key and the agent that uses an artifact | executor | each works from a fixed question against files |
| [reflection](reflection.md): the audit, from zero, combinations | top | each judges a whole run or a whole design |
| reflection: evidence, prior art | the strongest model below the top tier; the executor tier where the host has two | each reads much and answers a fixed question |
| the agent of a dry run; the sessions of a check | no tier: [checks.md](checks.md#the-sessions) says which models | a check shows what the models that load the skill do |

| Judge | Create | Change |
|---|---|---|
| architecture critic | once; again when the approach changes | only when the change adds a step, a route, a script or a file |
| quality critic | once; a second, fresh one only after a fix that changed what a step tells the agent to do | the same |
| verifier | once | only when the change altered a decision of the sheet or went through a correction; otherwise the quality critic also marks each requirement line `met`, `part` or `not met` |

## The architecture critic

It challenges the approach before any text exists. Give it, by path:

- the file of the user's messages;
- the sheet and the sources table;
- the plan's approach and layout; for an existing skill, its directory.

It works in this order. First, from the messages alone, it writes the requirements, walks the job stage by stage
as [analysis.md](analysis.md#the-sheet) describes, and lists the decisions a skill of this kind must settle.
Only then does it open the sheet and the plan. Before it judges the approach it states the strongest alternative
it sees: another skill that should own the job, a script in place of text, or no skill at all.

It returns:

- a verdict: `keep`, `change approach` with the alternative in a few lines, or `stop` with the reason;
- each requirement and each stage on its own list that the sheet lacks or the approach gives no place;
- each question whose answer would change the approach and that the sheet shows neither asked nor settled;
- each decision of the sheet filled against what the sources share;
- what evidence would change its verdict;
- one line on whether the planned spend fits what the work can change.

Each objection cites a place: a line of the messages, the sheet, a source or the plan.

## The quality critic

It reads every file of the skill as the agent that will load it would, and runs nothing but the check script.
Give it, by path: the skill's directory, and for a change its diff and the dispositions file; the sheet;
[structure.md](structure.md) and [writing.md](writing.md). A second critic must not open the first one's
return. Its brief says whether a verifier follows.

It does these things, in this order:

1. It walks two requests through the files as a literal reader, one from the middle of the sheet's job and one
   from its edge, and reports each step where it halts, has to guess, or can read the line two ways.
2. It holds the files against structure.md: whether each file holds what the layout gives it, whether a detail
   that one step needs sits in a reference linked at that step, whether any file goes unused, and what the
   script reports under each budget.
3. It names every fact stated in two places, with both places.
4. It holds each line against writing.md's rules for lines.
5. It holds the description against the sheet's job: the requests it fits, the near misses it leaves, and
   whether it summarises the steps.
6. On work that gets no verifier, it marks each requirement line of the sheet `met`, `part` or `not met`, with
   the place, and on a change it does the verifier's item 2.

It returns `sound` or `change`, and its objections ranked by how far each would mislead the reading agent. Each
objection gives a file and line, the rule it rests on and the smallest fix. It counts apart the objections that
would change what a step tells the agent to do. Whether the skill's behaviour is right is not its question; the
check and the verifier answer that.

## The verifier

It holds the finished work against what the user asked. Give it, by path: the file of the user's messages; the
sheet, with its `met at` column filled; the finished skill; for a change, the skill as it was, the diff and the
dispositions file; the author's account of the work, where there is one, and the objections of the quality
critic that you overruled, each as claims to check; the plan's rule for the check, with the check's outputs.

It does these things, in this order:

1. It runs the check script itself.
2. On a change, it takes the dispositions file line by line: it opens the place the line left and the place
   the line names, and marks the line `carried`, `part` or `lost`, with what is missing. Then it reads the diff
   for a removed sentence, row or condition that no line of the file answers, and marks each one `lost`. That
   the script exited 0 shows only that each quote stands where the file says.
3. It reads the user's messages for a requirement the sheet lacks.

It returns one row for each requirement, stage and decision of the sheet: the file and line that meets it, or
`part`, `not met`, or `not proven` when nothing it could run or read shows it. It returns the marks of item 2,
every message in which it found a requirement the sheet lacks, and each overruled objection as holding or not,
with the place.

## Handling a return

- Apply an objection only after reading the place it cites, and only where it names a requirement of the sheet or
  a rule of structure.md or writing.md that fails.
- Overrule one only by citing the place in the skill or on the sheet that refutes it. One you can settle neither
  way goes to the verifier as a claim.
- When an objection and the text as it stands both keep those rules, the sheet's goal sentence decides: take
  the one that serves it, and write the sentence beside the decision.
- Whoever writes the fix answers every finding of the return: taken, or refused with the place that refutes it.
- Where a verdict rests on a count, recount it yourself with a command when one can: a search of the files
  for each thing a judge called lost or present.
- Marks that decide a verdict are confirmed before they are counted. Start one fresh agent on the executor
  tier, briefed as [every brief](#every-brief) says, with the marks' file to read and this bullet as its role:
  it opens every mark that is not the weakest of its set at the place cited and returns `confirmed` or `not
  there`. A mark that is not confirmed counts as the weakest.
- A verdict is computed by you, from the rule the plan wrote before the result and from the confirmed marks,
  one clause of the rule at a time. A judge's own total, and its opinion of what a finding does to a verdict,
  are claims and decide nothing.
- The count of a judge that [every brief](#every-brief) had you calibrate is used only when it caught both
  false items, or found the answers held back. A judge that did not is replaced once by a fresh one with the
  same brief.
- Objections still open after the last read go to the user in the result.

A session that the user runs under entrust's [orchestrate](../../orchestrate/SKILL.md) puts these judges on
orchestrate's plan with the models named here; the user's word on that plan is their choice of model.
