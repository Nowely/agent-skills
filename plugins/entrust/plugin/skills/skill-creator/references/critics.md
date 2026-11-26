# The judges

Three agents judge the work: the architecture critic at Create's step 4, which judges the architecture and the
approach together, the quality critic at step 7 and the
verifier at step 9. Each is started fresh: it wrote none of the work and saw none of the conversation. Brief each
one with paths to files, never with your summary of them. No brief carries your reasons or what you expect to
hear, and another agent's return goes in only as a claim to check.

## Which model, and how many

Two tiers are used. The top tier is the strongest model the host offers; the executor tier is the model the
host uses for ordinary work. [hosts.md](hosts.md) says where each host lists its models: look them up before the
plan names one, and when this session cannot see the list, the plan gives the tier and asks the user to name
the model. A model the user names for a role replaces its tier.

| Role | Tier | Why |
|---|---|---|
| the architecture critic and the quality critic | top | a skill is read on every later use, so a gap a critic misses is paid for each time |
| the verifier; a reader of sources; the reader who marks a check's statements; the writer of a selection check's requests | executor | each works from a fixed question against files |
| the sessions of a check | the models the sheet says load the skill, as [checks.md](checks.md#the-sessions) sets out | a check shows what those models do |

| Judge | Create | Change |
|---|---|---|
| architecture critic | once; again when a correction changes the approach | only when the change adds a step, a route, a script or a file |
| quality critic | once; a second, fresh one only after a fix that changed what a step tells the agent to do | the same, reading the diff with the files |
| verifier | once | only when the change altered a decision of the sheet or went through a correction; otherwise the quality critic also marks each requirement line `met` or `not met` |

## The architecture critic

It challenges the approach before any text exists. Give it, by path:

- the file of the user's messages;
- the sheet and the sources table;
- the plan's approach and layout; for an existing skill, its directory;
- this section.

It works in this order. First, from the messages alone, it writes the requirements, walks the job stage by stage
as [analysis.md](analysis.md#the-sheet) describes, and lists the decisions a skill of this kind must settle.
Only then does it open the sheet and the plan. Before it judges the approach it states the strongest alternative
it sees: another skill that should own the job, a script in place of text, or no skill at all.

It returns:

- a verdict: `keep`, `change approach` with the alternative in a few lines, or `stop` with the reason;
- each requirement and each stage on its own list that the sheet lacks or the approach gives no place;
- each question whose answer would change the approach and that the sheet shows neither asked nor settled;
- each decision of the sheet filled against what the sources share;
- what evidence would change its verdict.

Each objection cites a place: a line of the messages, the sheet, a source or the plan.

## The quality critic

It reads every file of the skill as the agent that will load it would, and runs nothing but the check script.
Give it, by path: the skill's directory, and for a change its diff; the sheet; [structure.md](structure.md) and
[writing.md](writing.md); this section.

It does five things, in this order:

1. It walks two requests through the files as a literal reader, one from the middle of the sheet's job and one
   from its edge, and reports each step where it halts, has to guess, or can read the line two ways.
2. It holds the files against structure.md: whether each file holds what the layout gives it, whether a detail
   that one step needs sits in a reference linked at that step, whether any file goes unused, and what the
   script reports under each budget.
3. It names every fact stated in two places, with both places.
4. It holds each line against writing.md's rules for lines.
5. It holds the description against the sheet's job: the requests it fits, the near misses it leaves, and
   whether it summarises the steps.

It returns `sound` or `change`, and its objections ranked by how far each would mislead the reading agent. Each
objection gives a file and line, the rule it rests on and the smallest fix. Whether the skill's behaviour is
right is not its question; the check and the verifier answer that.

## The verifier

It holds the finished work against what the user asked. Give it, by path: the file of the user's messages; the
sheet, with its `met at` column filled; the finished skill; the plan's rule for the check, with the check's
outputs; the objections of the quality critic that you overruled, each as a claim to check; this section.

It returns one row for each requirement, stage and decision of the sheet: the file and line that meets it, or
`not met`, or `not proven` when nothing it could run or read shows it. It lists every message of the user in
which it finds a requirement the sheet lacks. It runs the check script itself, and it marks each overruled
objection as holding or not, with the place.

## Settling an objection

- Apply an objection only after reading the place it cites, and only where it names a requirement of the sheet or
  a rule of structure.md or writing.md that fails.
- Overrule one only by citing the place in the skill or on the sheet that refutes it. One you can settle neither
  way goes to the verifier as a claim.
- When an objection and the text as it stands both keep those rules, the sheet's goal sentence decides: take
  the one that serves it, and write the sentence beside the decision.
- Objections still open after the last read go to the user in the result.

A session that the user runs under entrust's [orchestrate](../../orchestrate/SKILL.md) puts these judges on
orchestrate's plan with the models named here; the user's word on that plan is their choice of model.
