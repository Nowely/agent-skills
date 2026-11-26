---
name: skill-creator
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
its description. Take one of three routes; a change to this skill takes them too.

- **Create**: a new skill; a rewrite of a skill's whole text; or a change to the job a skill does, the hosts
  that load it, or its set of reference files.
- **Change**: an instruction removed, moved, reworded or added inside the files a skill has, or a script made to
  enforce a rule the skill already states.
- **Repair**: an edit that alters no instruction, such as a typo, a link, or a fact brought back in line with
  the file that defines it. Make the edit, run the script of Create's step 6, then run Change's step 8 against
  the skill as it was: the revision its files were at, or a copy taken before the edit. A corrected word or
  link lists no line. A listed line whose fact still stands takes a
  `moved` line; a listed line whose fact is gone makes the edit a Change.

## Standing rules

- Read the repository's agent instructions first: the files the host loads for it (a host is a program
  that loads skills, such as Claude Code or Codex), such as `AGENTS.md`,
  `CLAUDE.md` or `AGENT.md` at its root, and what they link. Where they differ from these steps, follow them.
- Keep everything these steps write down, and every agent's return, in one run directory outside the skill's
  folder: where the repository's rule for research runs puts it, else a temporary directory. A skill in a
  personal folder has one too. Where that rule numbers each version of a file and overwrites none, an amended
  sheet is a new numbered file.
- Do with this session's own tools whatever they can do, before any line says the user must do or supply it.
- Between the plan and the result, the user hears from you only a changed plan, a verdict that stops the work,
  and blockers, all blockers in one message.
- When no user can answer, because another agent started you or the run has no one attached, your return
  stands where a step says to tell the user. The plan with its questions is then your return, and you stop
  there, on either route.
- With no user attached, an instruction from whoever started you that names an edit is acceptance of that edit
  and the check script, and of nothing else: make the edit, start no agent, and say in the result that no judge
  read it.
- When this session cannot start agents, say so in the plan, do the steps that need none, and name each step
  left undone in the result.
- A step number in a reference is Create's; Change's steps 5, 6, 7, 9, 10 and 11 are Create's 4 to 9.
- `<skill-dir>` is this skill's installed directory. Its script needs Node.js 18 or later.

## Create

1. **Analyse the request.** Write the sheet as [analysis.md](references/analysis.md#the-sheet) sets it out: the
   goal in one sentence, one line for each requirement in the user's words, the job walked stage by stage, and
   the decisions every skill must settle. Read the material the request names before you write it. For a rewrite, first take
   [the inventory](references/writing.md#rewriting-an-existing-skill).
2. **Read the sources.** Read what already does this job, what the hosts say a skill is, and the user's own
   experience of the job, and record what you take, change and leave out, as
   [the sources](references/analysis.md#the-sources) says. Hold the walk of step 1 against them.
   [hosts.md](references/hosts.md) has each host's guide and what differs between hosts.
3. **Plan and ask, in one message.** Choose the approach and the layout by
   [structure.md](references/structure.md), and the check by
   [checks.md](references/checks.md#choosing-the-check). Between two approaches that both meet the sheet, a
   requirement decides; failing that, the sheet's goal sentence; failing that, the plan's check is that table's
   comparison of the two. Show the user one plan. Open it with what you will make and what you need from them,
   in two sentences at most. Then:
   - the goal, the requirements, and each decision with what settled it; a decision still open is put as a
     question, as [the questions](references/analysis.md#the-questions) says;
   - the approach, with the alternative you rejected, and each file with one line on what it holds;
   - the check: what will be observed, in which runs, the result that keeps the work, the result that does not,
     and what the check cannot show;
   - who writes the text, which is this session when the user named no one, and every agent steps 4 to 9 will
     start, each with its model and its number of sessions, as
     [critics.md](references/critics.md#which-model-and-how-many) and checks.md give them;
   - how the result will be delivered.

   Wait for the user's word on the plan. Their instructions, or an approval they already gave for this scope
   and spend, can stand for it; the request to do the work cannot. One word accepts the plan and its
   recommendations, and no later step asks for another.
4. **Have the approach challenged.** Start the architecture critic as
   [critics.md](references/critics.md#the-architecture-critic) briefs it.
   - `keep`: go on.
   - `change approach`: decide between the two approaches as step 3 does, show the user the changed plan, and
     wait as step 3 does.
   - `stop`: write nothing and change nothing. The critic's reason goes to the user as
     [the result](#the-result). A stop is the user's to overrule; it is not a correction.
   - A stage, a requirement or a question it finds missing is [a correction](#a-correction).
5. **Prepare the check.** Follow [checks.md](references/checks.md) for the check the plan named: write its cases
   and statements, or a dry run's request, now, before any text exists. Where it compares with runs without the skill, start those runs
   and wait for them.
6. **Write the text, once.** Follow [writing.md](references/writing.md). After each edit run
   `node "<skill-dir>/scripts/check.mjs" <the skill's directory>` and, where the
   repository has them, its own checks for skill pages, until they pass. A rewrite also passes
   [Change's step 8](#change), against a copy of the skill taken before the first edit.
7. **Have the text read.** Start the quality critic as [critics.md](references/critics.md#the-quality-critic)
   briefs it, and settle its objections as [that page](references/critics.md#settling-an-objection) says.
8. **Run the plan's check.** Run it on the text as it now stands, as [checks.md](references/checks.md) says,
   and decide by the plan's rule; set no threshold after seeing a result. A result that fails the rule is
   [a correction](#a-correction). Past [its limit](#a-correction) the work is not kept:
   undo the change, or take the new skill's folder out of the tree and keep its text in the run directory.
9. **Have the result verified.** Where [critics.md](references/critics.md#which-model-and-how-many) gives the
   work a verifier, start it as [its section](references/critics.md#the-verifier) briefs it. A requirement it returns as `not met` is [a correction](#a-correction).
10. **Deliver.** Hand the work over as the sheet's delivery decision says, and give [the result](#the-result).

## Change

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
   it. If a script can enforce the rule, the fix is the script, not a sentence. If what produced the failure
   lies outside the skill's files, change nothing: record it where the repository records defects, tell the
   user, and stop.
3. **Choose the smallest change.** Take the first of these that meets the requirement: remove; move, or link at
   the step that needs it; reword; add. Remove is for an instruction the requirement no longer wants and for a
   duplicate whose fact stays stated elsewhere. A fact, such as a value, a table row, a case or a condition, is
   never removed to make the change smaller: when its place goes, move it to the file that owns it, or put its
   removal to the user as a question in the plan. A change that turns out to alter the skill's job, its hosts
   or its set of reference files goes to Create's step 1 with this sheet.
4. **Plan.** Show the user one plan and wait, as Create's step 3 says, with the change in place of the
   approach. Before the wait, note the skill's state for step 8: the revision the files are at, or a copy of
   the folder in the run directory.
5. **Have the approach challenged**, when the change adds a step, a route, a script or a file. Start the
   architecture critic as [critics.md](references/critics.md#the-architecture-critic) briefs it, and act on
   its verdict as Create's step 4 says.
6. **Prepare the check.** Follow [checks.md](references/checks.md) for the check the plan named, before any
   edit: its cases and statements, and whatever it runs on the skill as it is now.
7. **Make the change.** Edit by [writing.md](references/writing.md). After each edit run
   `node "<skill-dir>/scripts/check.mjs" <the skill's directory>` and, where the repository has them, its own
   checks for skill pages, until they pass.
8. **Show that no line was lost.** After the last edit, run
   `node "<skill-dir>/scripts/check.mjs" <directory> --against <base> --dispositions <file>`. The directory is
   the skill's, or the folder of skills when the change spans several. The base is step 4's revision or copy.
   The file is one in the run directory; write it when a line is listed. Each listed line stood in the files
   before and stands nowhere now. For each, do the first of these that is true:
   - its fact is still stated, in other words or another file: answer it with
     `moved | <file>:<line as printed> | <file>:<line where it stands now> | <the words there>`;
   - the user's own words ask for it to go: answer it with
     `retired | <file>:<line as printed> | <file>:<line of their saved message> | <their words>`;
   - neither: put the line back, or move it to the file that owns the fact.

   Run it again until it exits 0. Your own judgement that a fact is not needed retires nothing.
9. **Have the text read.** Start the quality critic as [critics.md](references/critics.md#the-quality-critic)
   briefs it, with the diff and the dispositions file, and settle its objections as
   [that page](references/critics.md#settling-an-objection) says.
10. **Run the plan's check** on the text as it now stands, and decide by the plan's rule; set no threshold
    after seeing a result. A result that fails the rule is [a correction](#a-correction). Past
    [its limit](#a-correction), undo the change and keep its text in the run directory.
11. **Have the result verified**, where [critics.md](references/critics.md#which-model-and-how-many) gives a
    change a verifier, as [its section](references/critics.md#the-verifier) briefs it. A requirement it
    returns as `not met` is [a correction](#a-correction).
12. **Deliver.** Hand the work over as the sheet's delivery decision says, and give [the result](#the-result).

## A correction

A correction is anything that shows the sheet or the text misses or misreads what the user wants: a message
from the user, a judge's return, a reader's return, a result of the plan's check that fails its rule, a
description that agents do not select.

1. Add it to the sheet, with the user's words or the return's, and where they are.
2. Name the step that should have caught it, and redo that step's part of the sheet to find what else it missed.
3. Hold the approach, the layout and the check against the amended sheet. If the approach or the check changes,
   show the user the changed plan and wait as step 3 does; the architecture critic reads a changed approach
   again. If only the text
   changes, edit it by [writing.md](references/writing.md) and run the check script;
   [critics.md](references/critics.md#which-model-and-how-many) says whether a judge reads again.

Every edit that follows comes from the amended sheet, never from the correction alone. After the plan's check
fails, one changed plan and one more run of it are the limit; a second failure goes to the user with both
results.

## The result

Tell the user, in this order, the outcome first; the text that delivers the work opens the same way:

- whether the work was kept, undone or left unchecked, and the rule that decided it;
- for each requirement, the place that meets it, from the verifier's table or the quality critic's marks;
- what ran, with its counts, and what did not run;
- what stayed unmeasured, and what in the user's next real use would show the skill failing;
- the judges' objections still open;
- at delivery, and whenever the user asks: what the skill does, in three sentences, and the questions still
  open.

Record the same, with the sheet, the sources table and the plan, where the repository keeps its changes and
research. What came from the user's sessions is private: before the record is tracked or sent anywhere, an agent
that wrote none of it reads it and takes out whatever the user has not already made public.
