---
name: rnd
description: >-
  Creates a skill for an agent or develops an existing one: its SKILL.md, description, references and scripts.
  For requests to make, write or draft a skill, to turn a workflow or a session into a skill, and to rewrite,
  fix, improve, cut or restructure a skill, including after feedback on it or a run where it failed. Not for
  reviewing a skill or running its evals with nothing to change, for collecting feedback from sessions, or for
  improving a text written for people.
metadata:
  version: "0.47.3"
license: MIT
---

This skill takes a request about a skill to a checked result, and leaves collecting feedback from sessions to
other skills. A skill is a folder, a `SKILL.md` and the files it links, that is loaded when a request matches
its description. Take one of three routes; a change to this skill takes them too. Its name is short for
research and develop, and every step here is written for work on a skill.

- **Create**: a new skill; a rewrite of a skill's whole text; or a change to the job a skill does, the hosts
  that load it, or its set of reference files.
- **Change**: an instruction removed, moved, reworded or added inside the files a skill has, or a script made to
  enforce a rule the skill already states. A small change takes fewer steps, as [Change](#change) says first.
- **Repair**: an edit that alters no instruction, such as a typo, a link, or a fact brought back in line with
  the file that defines it. Note the revision the files are at, or copy the folder; make the edit; run the
  script of Create's step 6, then Change's step 8 against that revision or copy. A corrected word or link
  lists no line. A listed line whose fact still stands takes a `moved` line; a listed line whose fact is gone
  makes the edit a Change.

## Standing rules

- Read the repository's agent instructions first: the files the host loads for it (a host is a program
  that loads skills, such as Claude Code or Codex), such as `AGENTS.md`,
  `CLAUDE.md` or `AGENT.md` at its root, and what they link. Where they differ from these steps, follow them.
- Keep everything these steps write down, and every agent's return, in one run directory outside the skill's
  folder: where the repository's rule for research runs puts it, else a temporary directory. A skill in a
  personal folder has one too. Where that rule numbers each version of a file and overwrites none, an amended
  sheet is a new numbered file.
- Do with this session's own tools whatever they can do, before any line says the user must do or supply it.
- Between the plan and the result, the user hears from you only a changed plan, a checkpoint's table, a
  verdict that stops the work, and blockers, all blockers in one message.
- What you deliver is what the plan showed. A step you would drop, or an edit the plan did not show, goes to
  the user as a changed plan before you act on it, never into the result afterwards.
- A plan with a check that runs sessions, or with more than one round, is a file, as
  [plan.md](references/plan.md) sets it out. After the user's word, and after any pause, open it first, and
  keep its log and its checkpoints as that page says.
- When no user can answer, because another agent started you or the run has no one attached, your return
  stands where a step says to tell the user. The plan with its questions is then your return, and you stop
  there, on either route.
- With no user attached, an instruction from whoever started you that names an edit is acceptance of that edit
  and the script's two commands, of Create's step 6 and Change's step 8, and of nothing else: make the edit,
  start no agent, and say in the result that no judge read it.
- Every judge, reader and session a step names is an agent this session starts, the way the plan says it
  starts on this host; none is handed to the user to run.
- When this session cannot start agents, say so in the plan, do the steps that need none, and name each step
  left undone in the result.
- A step number in a reference is Create's; Change's steps 5, 6 and 7 are Create's 4, 5 and 6, and its step 9
  is Create's 7 to 10.
- `<skill-dir>` is this skill's installed directory. Its script needs Node.js 18 or later.

## Create

1. **Analyse the request.** Write the sheet as [analysis.md](references/analysis.md#the-sheet) sets it out: the
   goal in one sentence, one line for each requirement in the user's words, the job walked stage by stage, and
   the decisions every skill must settle. Read the material the request names before you write it. For a rewrite, first take
   [the inventory](references/writing.md#rewriting-an-existing-skill).
2. **Read the sources.** Read what already does this job, what the hosts say a skill is, and the user's own
   experience of the job, and record what you take, change and leave out, as
   [the sources](references/analysis.md#the-sources) says. Hold the walk of step 1 against them.
   [hosts.md](references/hosts.md) has each host's guide and what differs between hosts. That page's
   [a practice someone already performs](references/analysis.md#a-practice-someone-already-performs) says when
   the job's own runs are a source, and how to take them.
3. **Plan and ask, in one message.** Choose the approach and the layout by
   [structure.md](references/structure.md), and the check by
   [checks.md](references/checks.md#choosing-the-check). Between two approaches that both meet the sheet, a
   requirement decides; failing that, the sheet's goal sentence; failing that, the plan's check is that table's
   comparison of the two. Show the user one plan. Open it with what you will make and what you need from them,
   in two sentences at most. Then:
   - the goal, the requirements, and each decision with what settled it; a decision still open is put as a
     question, as [the questions](references/analysis.md#the-questions) says;
   - the approach, with the alternative you rejected, and each file with one line on what it holds;
   - how the skill's text and files will be written, a decision of its own, stated whole as
     [the sheet's table](references/analysis.md#the-sheet) gives it;
   - the check: what will be observed, in which runs, the result that keeps the work, the result that does not,
     and what the check cannot show;
   - who writes the text, which is this session when the user named no one, and every agent steps 4 to 9 will
     start, each with its model, its number of sessions and how it starts on this host, as
     [critics.md](references/critics.md#which-model-and-how-many) and checks.md give them;
   - how the result will be delivered;
   - when the plan is a file: every heading of the form in [plan.md](references/plan.md), the parts of
     [reflection](references/reflection.md) it will run among them.

   For a skill that exists, note the revision its files are at, or copy the folder into the run directory.
   Wait for the user's word on the plan. Their instructions, or an approval they already gave for this scope
   and spend, can stand for it; the request to do the work cannot. One word accepts the plan and its
   recommendations, and no later step asks for another. It covers every agent the plan names. A reply that
   leaves a choice to you accepts the plan's recommendation for it.
4. **Have the approach challenged.** Start the architecture critic as
   [critics.md](references/critics.md#the-architecture-critic) briefs it.
   - `keep`: go on.
   - `change approach`: decide between the two approaches as step 3 does, show the user the changed plan, and
     wait as step 3 does.
   - `stop`: write nothing and change nothing. The critic's reason goes to the user as
     [the result](#the-result). A stop is the user's to overrule; it is not a correction.
   - A stage, a requirement or a question it finds missing is [a correction](#a-correction).

   Start with it the parts of [reflection](references/reflection.md) the plan gave this step.
5. **Prepare the check.** Follow [checks.md](references/checks.md) for the check the plan named: write its cases
   and statements, or a dry run's request, now, before any text exists. For a new skill or a rewrite, and
   where the check compares with runs without the skill, start those runs as
   [the baseline](references/checks.md#the-baseline) says and wait for them: step 6 writes against what they
   show. A check that runs sessions is read by the architecture critic before its first session.
6. **Write the text, once.** Follow [writing.md](references/writing.md): each line answers a failure a run
   showed or the user's words. After each edit run
   `node "<skill-dir>/scripts/check.mjs" <the skill's directory>` and, where the
   repository has them, each of its suites that reads a file you changed, found by searching them for the
   file's name, until they pass. Work on a skill that exists also
   passes [Change's step 8](#change), against the revision or copy step 3 noted.
7. **Have the text read.** Start the quality critic as [critics.md](references/critics.md#the-quality-critic)
   briefs it, and act on its return as [that page](references/critics.md#handling-a-return) says.
8. **Run the plan's check.** Run it on the text as it now stands, as [checks.md](references/checks.md) says,
   and decide by the plan's rule from confirmed marks; set no threshold after seeing a result. A result that
   fails the rule is [a correction](#a-correction). Past [its limit](#a-correction) the work is not kept: undo
   the change, or take the new skill's folder out of the tree and keep its text in the run directory. Whether
   the work is kept or not, write [a close-out](references/plan.md#a-close-out), and start the parts of
   [reflection](references/reflection.md) the plan gave this step.
9. **Have the result verified.** Where [critics.md](references/critics.md#which-model-and-how-many) gives the
   work a verifier, start it as [its section](references/critics.md#the-verifier) briefs it. A requirement it
   returns as `not met` is [a correction](#a-correction).
10. **Deliver.** First start the parts of [reflection](references/reflection.md) the plan gave this step and
    act on what they return. When [a close-out](references/plan.md#a-close-out) leaves no line without an
    outcome, hand the work over as the sheet's delivery decision says, and give [the result](#the-result).

## Change

A change is small when it alters no fact as step 3 defines one and no decision of the sheet, and adds no step,
route, script or file. A small change writes no sheet file, no sources table and no plan file: what steps 1 to
3 find goes into the plan message of step 4. It leaves out steps 5 and 6. Its check is step 7's commands and
step 8, with no session unless the user asks for runs, and its step 9 is one read by the quality critic, then
the result. When a step shows that a fact would change or go, the change is no longer small: take every step.

1. **Analyse the change.** Start a sheet as [analysis.md](references/analysis.md#the-sheet) sets it out, or open
   the one recorded for this skill: the user's messages saved, their words as requirement lines, and a line for
   each decision of the table that the change alters. For a failure, add the observation: what happened, at a
   place another reader can open. When the user gave none, look for it in the sessions where the skill ran, which
   [hosts.md](references/hosts.md) says how to read, and
   in the output of the failing check; when neither has it, the plan of step 4 includes one session that
   repeats the request.
2. **Find the place.** Read what the skill's own files, the skills beside it and the hosts' guides say on the
   rule the change is about, and record them as [the sources](references/analysis.md#the-sources) says. If
   the page or a script already carries the rule, do not state it again; find where it stopped working: past what the host keeps of the
   page in a long session, behind a link away from the step that needs it, contradicted in another file, or
   written as advice where a step was needed. A rule that is absent has a place too: the step that should carry
   it. If a script can enforce the rule, the fix is the script, not a sentence.
   [A practice someone already performs](references/analysis.md#a-practice-someone-already-performs) says when
   runs of the job are a source for the rule. If what produced the failure
   lies outside the skill's files, change nothing: record it where the repository records defects, tell the
   user, and stop.
3. **Choose the smallest change.** Take the first of these that meets the requirement: remove; move, or link at
   the step that needs it; reword; add. Remove is for an instruction the requirement no longer wants and for a
   duplicate whose fact stays stated elsewhere. A fact, such as a value, a table row, a case or a condition, is
   never removed to make the change smaller: when its place goes, move it to the file that owns it, or put its
   removal to the user as a question in the plan. A change that turns out to alter the skill's job, its hosts
   or its set of reference files goes to Create's step 1 with this sheet. Where two files disagree on a value,
   the file that owns the fact keeps its value and the other links it. A value the owning file holds changes
   only when the user's words name the new value; a reply that leaves the choice to you names none.
4. **Plan.** Do Create's step 3 with the change in place of the approach: choose the check, show the user
   one plan with the skill's state noted for step 8, and wait.
5. **Have the approach challenged**, when the change adds a step, a route, a script or a file. Start the
   architecture critic as [critics.md](references/critics.md#the-architecture-critic) briefs it, and act on
   its verdict as Create's step 4 says. Start the parts of reflection the plan gave this step.
6. **Prepare the check.** Follow [checks.md](references/checks.md) for the check the plan named, before any
   edit: its cases and statements, and whatever it runs on the skill as it is now, which you wait for.
7. **Make the change.** Edit by [writing.md](references/writing.md), and check after each edit as Create's
   step 6 says. A failure that the files as they were also show is not this
   edit's: record it as the repository records a defect found in passing, and go on.
8. **Show that no line was lost.** After the last edit, run
   `node "<skill-dir>/scripts/check.mjs" <directory> --against <base> --dispositions <file>`. The directory is
   the skill's, or the folder of skills when the change spans several. The base is step 4's revision or copy.
   The file is one in the run directory; it need not exist yet. Each listed line stood in the files before and
   stands nowhere now. Answer each as the script prints under its list: a `moved` line for each place a fact of
   it went, a `retired` line with the user's saved words, or the line put back. Run it again until it exits 0.
   Your own judgement that a fact is not needed retires nothing.
9. **Finish as Create's steps 7 to 10 say.** The quality critic and the verifier get the diff and the
   dispositions file; [critics.md](references/critics.md#which-model-and-how-many) says whether a change gets
   a verifier. Past [a correction's limit](#a-correction), undo the change and keep its text in the run
   directory.

## A correction

A correction is anything that shows the sheet or the text misses or misreads what the user wants: a message
from the user, a judge's return, a reader's return, a result of the plan's check that fails its rule, a
description that agents do not select. An answer to the plan is a message from the user.

1. Add it to the sheet, with the user's words or the return's, and where they are. Words of the user that do
   not fit the design are asked about, never read to fit.
2. Name the step that should have caught it, and redo that step's part of the sheet to find what else it missed.
3. Hold the approach, the layout and the check against the amended sheet. If the approach or the check changes,
   show the user the changed plan and wait as step 3 does; the architecture critic reads a changed approach
   again. If only the text
   changes, edit it by [writing.md](references/writing.md) and run the check script;
   [critics.md](references/critics.md#which-model-and-how-many) says whether a judge reads again. The user's
   second correction since the plan adds the audit of [reflection](references/reflection.md) to a changed plan.

Every edit that follows comes from the amended sheet, never from the correction alone. After the plan's check
fails, one changed plan and one more run of it are the limit; a second failure goes to the user with both
results.

## The result

State nothing about a file or about a reply of the user that you have not read at its place.
Tell the user, in this order, the outcome first; the text that delivers the work opens the same way:

- whether the work was kept, undone or left unchecked, and the rule that decided it;
- for each requirement, the place that meets it, from the verifier's table or the quality critic's marks;
- what ran, with its counts, and what did not run;
- what stayed unmeasured, and what in the user's next real use would show the skill failing;
- the judges' objections still open, and every close-out line that is `adjust`, `drop`, declined or pending;
- at delivery, and whenever the user asks: what the skill does, in three sentences, and the questions still
  open; at delivery also that [a retro](references/reflection.md#a-retro-on-a-use-of-this-skill) on this
  session can improve this skill.

Record the same, with the sheet, the sources table and the plan, where the repository keeps its changes and
research. What came from the user's sessions is private: before the record is tracked or sent anywhere, an agent
that wrote none of it reads it and takes out whatever the user has not already made public.
