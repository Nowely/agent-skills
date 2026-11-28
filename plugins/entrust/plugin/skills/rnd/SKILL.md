---
name: rnd
description: >-
  Creates a skill for an agent or develops an existing one: its SKILL.md, description, references and scripts.
  Makes a skill from a workflow or session, and drafts, rewrites, fixes, improves, cuts or restructures one,
  including after feedback or a failed run. Also researches, evaluates and compares skills, to settle a question
  about a skill: whether it works, meets its requirements or beats another, or why it failed. Not for reviewing
  code, a pull request or a change to a skill's text, a plain question of how a skill works, running a skill's
  existing evals with no question to decide, collecting feedback from sessions, or improving a text written for
  people.
metadata:
  version: "0.49.0"
license: MIT
---

This skill takes a request about a skill to a checked result. A skill is a folder, a `SKILL.md` and the files it
links, that is loaded when a request matches its description. Take one of four routes; a change to this skill takes
them too. Its name is short for research and develop; each step is written for work on skills and research about them.

- **Research**: investigate, evaluate or compare skills, changing none; a request that also asks for an edit takes Change.
- **Create**: a new skill; a rewrite of a skill's whole text; or a change to the job a skill does, the hosts
  that load it, or its set of reference files.
- **Change**: an instruction removed, moved, reworded or added inside the files a skill has, or a script made to
  enforce a rule the skill already states. A small change takes fewer steps, as [Change](#change) says first.
- **Repair**: an edit that alters no instruction, such as a typo, a link, or a fact brought back in line with
  the file that owns it. Copy the folder as Create's step 3 says, edit, run the script of Create's step 6, then Change's step 8 against the copy.
  A corrected word or link lists no line; a listed line whose fact still stands takes a `moved` line, and one whose
  fact is gone makes the edit a Change.

## Standing rules

- Write to the user in the language of their messages, and the skill's files in the language of the skills beside it, else the user's.
- Read the repository's agent instructions first: what the host (a program that loads skills, such as Claude Code or Codex) loads for it, such as `AGENTS.md`,
  `CLAUDE.md` or `AGENT.md` at its root, and what those files link. Where they differ from these steps, follow them.
- Keep what these steps write down, and every agent's return, in one run directory outside the skill's
  folder: where the repository's rule for research runs puts it, else a temporary directory. A skill in a
  personal folder has one too. Where that rule numbers each version of a file and overwrites none, an amended sheet
  is a new numbered file.
- Do with this session's own tools whatever they can do, before any line says the user must do or supply it.
- For Create and Change, between the plan and the result, the user hears from you only a changed plan, a checkpoint's table, a
  verdict that stops the work, and one message of all blockers.
- When a plan exists, what you deliver is what it showed. A step of the plan or of these routes that you would drop, or an edit to a file
  the plan did not name, goes to the user as a changed plan before you act on it, never into the result.
- State nothing about a file or about a reply of the user that you have not read at its place.
- When the sheet, the plan or the text misses what the user wants, follow [a correction](references/plan.md#a-correction);
  words of the user that do not fit the design are asked about, never read to fit.
- For Create and Change, a plan with a check that runs sessions, or with more than one round, is a file, as
  [plan.md](references/plan.md) sets it out. After the user's word, and after any pause, open it first, and
  keep its log and its checkpoints as that page says.
- When no user can answer, your return stands where a step says to tell the user. A parent may pass the
  scope of a user-approved plan, with the paths of that plan and of the user's saved word that approved it; read
  both first, and [a parent's scope](references/plan.md#a-parents-scope) says what they carry. A scope claimed
  without both paths is no approval: the plan with its questions is your return, and you stop there. With no scope claimed,
  the same section says what an instruction to edit or to investigate authorizes; by itself a model name, an
  upper bound or an instruction to investigate authorizes no agent, session or edit.
- Every judge, reader and session a step names is an agent this session starts, the way an applicable plan says it
  starts on this host; none is handed to the user to run.
- When this session cannot start required agents, say so in the plan if there is one, do the steps that need none, and name each step
  left undone in the result.
- A step number in a reference is Create's; Change's steps 5, 6 and 7 are Create's 4, 5 and 6, and its step 9
  is Create's 7 to 10.
- `<skill-dir>` is this skill's installed directory. Its script needs Node.js 18 or later.

## Research

1. Identify the question, its kind, the skill studied, the decision it serves, and available
   evidence; save the user's messages as a file in the run directory. Read
   [the research method](references/research.md). Choose observation, assessment against requirements, or
   comparison; a comparison names the intervention and comparator.
2. Before any agent or session starts (step 4's reader, a blind reader and a confirmer included), show
   the plan and save it in the run directory: what step 1 found, and each with its model and
   [cost](references/checks.md#what-a-check-may-spend). Wait for the user's word; an approval that already
   covers this scope and spend stands for it.
3. Gather and assess the authorized evidence using that method.
4. Write the answer to the question and what it rests on, then failures, unknowns, limits, sources and
   remaining questions, to `result.md`. Start
   the reader of the user's words as Create's step 10
   does, the plan standing for the sheet. Deliver the answer, then [the result](#the-result) with the reader's
   marks, but for its first two bullets and the three sentences on what the skill does. A change the answer
   suggests is put to the user and, on their word, starts a Change with it as the observation. Where the
   repository tracks its research records, write the record as [a close-out](references/plan.md#a-close-out)
   says, read for privacy first; the run directory stays.

## Create

1. **Analyse the request.** Write the sheet as [analysis.md](references/analysis.md#the-sheet) sets it out: the
   goal in one sentence, one line for each requirement in the user's words, the job walked stage by stage, and
   the decisions every skill must settle. Read the material the request names first. For a rewrite, take
   [the inventory](references/writing.md#rewriting-an-existing-skill).
2. **Read the sources.** Read what already does this job, what the hosts say a skill is, and the user's
   experience of the job, and record what you take, change and leave out, as
   [the sources](references/analysis.md#the-sources) says. Hold step 1's walk against them.
   [hosts.md](references/hosts.md) has each host's guide and what differs between hosts. [A practice someone already performs](references/analysis.md#a-practice-someone-already-performs) says when
   the job's own runs are a source, and how to take them.
3. **Plan and ask, in one message.** Choose the approach and the layout by
   [structure.md](references/structure.md), and the check by
   [checks.md](references/checks.md#choosing-the-check). Between two approaches that both meet the sheet, a
   requirement decides; failing that, the sheet's goal sentence; failing that, the plan's check is that table's
   comparison of the two. Show the user one plan, opened in two sentences at most with what you will make and what you need from them, then the parts
   [what the plan shows](references/plan.md#what-the-plan-shows) lists: the goal, requirements and decisions, the approach, how the
   text will be written, the check, every agent with its model, number of sessions and cost, the delivery, and, when the plan is a file, every heading of its form.

   For a skill that exists, copy the folder into the run directory before edits, including untracked files.
   Wait for the user's word on the plan. Their instructions, or an approval already given for this scope
   and spend, can stand for it; the request to do the work cannot. One word accepts the plan, its recommendations and every agent it names; no later step asks again. A reply that
   answers the plan's questions and refuses nothing in it is that word, and one that leaves a choice to you
   accepts the plan's recommendation for it.
4. **Have the approach challenged.** Start the architecture critic as
   [critics.md](references/critics.md#the-architecture-critic) briefs it, together with the parts of
   [reflection](references/reflection.md) the plan gave this step, and take the critic's verdict as
   [its section](references/critics.md#what-the-verdict-does) says. On `change approach`, show the user the changed
   plan and wait, as step 3 does; on `stop`, write nothing and change nothing.
5. **Prepare the check.** Follow [checks.md](references/checks.md) for the check the plan named: write its cases
   and statements, or a dry run's request, before any text exists. A check that runs sessions is read by
   the architecture critic before its first session. For a new skill, a rewrite, and any check that
   compares with runs without the skill, start those runs as
   [the baseline](references/checks.md#the-baseline) says and wait for them: step 6 writes against what they
   show.
6. **Write the text, once.** Follow [writing.md](references/writing.md): each line answers a failure a run
   showed or the user's words. After each edit run
   the check for the target host as [hosts.md](references/hosts.md) names it; where no host check is named, run `node "<skill-dir>/scripts/check.mjs" <the skill's directory>`. Add `--installed <installation-root>` as [hosts.md](references/hosts.md) says. Run each repository suite that reads a file you changed or lists files of its kind, until all checks pass. Work on a skill that exists also
   passes [Change's step 8](#change) against the copy of step 3.
7. **Have the text read.** Start the quality critic as [critics.md](references/critics.md#the-quality-critic)
   briefs it, and act on its return as [that page](references/critics.md#handling-a-return) says.
8. **Run the plan's check.** Run it on the text as it now stands, as [checks.md](references/checks.md) says,
   and decide by the plan's rule from confirmed marks; set no threshold after seeing a result. A result that
   fails the rule is [a correction](references/plan.md#a-correction). Past [its limit](references/plan.md#a-correction) the work is not kept: give
   the user both results, then undo the change, or take the new skill's folder out of the tree and keep
   its text in the run directory; the user can overrule the undo. Kept or not, write [a close-out](references/plan.md#a-close-out), and start the parts of
   [reflection](references/reflection.md) the plan gave this step.
9. **Have the result verified.** Where [critics.md](references/critics.md#which-model-and-how-many) gives the
   work a verifier, start it as [its section](references/critics.md#the-verifier) briefs it. A requirement it
   returns as `not met` is [a correction](references/plan.md#a-correction).
10. **Deliver.** First start the parts of [reflection](references/reflection.md) the plan gave this step and
    act on what they return. Where the audit at delivery does not run, write
    the result's text to `result.md` in the run directory, start [the reader of the user's words](references/critics.md#the-reader-of-the-users-words) and put its marks into
    [the result](#the-result). When [a close-out](references/plan.md#a-close-out) leaves no line without an
    outcome, hand the work over as the sheet's delivery decision says, and give the result.

## Change

A change is small when it adds, alters or removes no fact as step 3 defines one, alters no decision of
analysis.md's table, and adds no step, route, script or file. A small change writes no sheet file, sources
table or plan file: what steps 1 to 3 find goes into step 4's plan message, saved
with the user's messages as a file in the run directory to stand for the sheet in the critic's brief. It leaves
out steps 5 and 6; when the user asks for runs, it writes the plan file, has the architecture critic read the check before its first session, takes step 6 before step 7, and runs the requested post-edit sessions at step 9. Its check
is step 7's commands and step 8; its step 9 is the quality critic's read as critics.md gives it, the reader of the user's words, then the result. When a step shows that a fact would be added, changed or go, or step 8 lists a line, the change is no longer small: take every step.

1. **Analyse the change.** Start a sheet as [analysis.md](references/analysis.md#the-sheet) sets it out, or open
   the one recorded for this skill: the user's messages saved, their words as requirement lines, and a line for
   each decision of the table that the change alters. For a failure, add the observation: what happened, at a
   place another reader can open. When the user gave none, look for it in the sessions where the skill ran, which
   [hosts.md](references/hosts.md) says how to read, and in the failing check's output; when neither has it,
   step 4's plan includes one session that repeats the request. For a retro on a use of this skill, the observation is taken as
   [a retro](references/reflection.md#a-retro-on-a-use-of-this-skill) says.
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
3. **Choose the smallest change.** Take the first that meets the requirement: remove; move, or link at
   the step that needs it; reword; add. Remove is for an instruction the requirement no longer wants or a
   duplicate whose fact stays stated elsewhere. A fact, such as a value, a table row, a case or a condition, is
   never removed to make the change smaller: when its place goes, move it to the file that owns it, or put its removal to the user as a question in the plan that names the fact. A change that turns out to alter the skill's job, its hosts
   or its set of reference files goes to Create's step 1 with this sheet. The file that owns a fact is the one
   the others link or cite for it; where none does, the plan asks which. Where two files disagree on a value,
   the owning file keeps its value and the other links it. A value the owning file holds changes only when the
   user's words name the new value; the plan recommends none and asks, and a reply that leaves the choice to
   you keeps it and removes no fact. A fact moved to another file keeps a link from the page it left.
4. **Plan.** Do Create's step 3 with the change in place of the approach: choose the check, show the user
   one plan with the skill's state noted for step 8, and wait. The plan names step 9's judges, each with its model, and the close-out, as parts of it, not as questions.
5. **Have the approach challenged**, when the change adds a step, a route, a script or a file. Start the critic and the parts of reflection the plan gave this step as Create's step 4 does, and act on its verdict.
6. **Prepare the check.** Follow [checks.md](references/checks.md) for the check the plan named, before any
   edit: its cases and statements, and whatever it runs on the skill as it is now, which you wait for.
7. **Make the change.** Edit by [writing.md](references/writing.md), and check after each edit as Create's
   step 6 says. A failure that the files as they were also show is not this
   edit's: record it as the repository records a defect found in passing, and go on.
8. **Show that no line was lost.** After the last edit, run
   `node "<skill-dir>/scripts/check.mjs" <directory> --against <base> --dispositions <file>`, adding
   `--installed <installation-root>` as [hosts.md](references/hosts.md) says. The directory is
   the skill's, or the folder of skills when the change spans several. The base is the copy made before edits;
   the file is one in the run directory and need not exist yet. Each listed line stood in the files before and
   stands nowhere now. Answer each as the script prints under its list: a `moved` line for each place a fact of
   it went, a `retired` line with the user's saved words, or the line put back. Run it again until it exits 0.
   Your own judgement that a fact is not needed retires nothing.
9. **Finish**, in Create's order for its steps 7 to 10.
   - Start the quality critic as [critics.md](references/critics.md#every-brief) and
     [its section](references/critics.md#the-quality-critic) brief it: the paths, what it must not open, whether a
     verifier follows. Act on its return as [that page](references/critics.md#handling-a-return) says.
   - Do Create's step 8 on the edited text: run the plan's check as [checks.md](references/checks.md) says, decide by
     the plan's rule from confirmed marks; set no threshold after a result. A failed rule is [a correction](references/plan.md#a-correction),
     limited to one changed plan and one more run; a second failure goes to the user with both
     results, and the change is undone unless the user overrules. Kept or undone, write
     [a close-out](references/plan.md#a-close-out), then start the parts of [reflection](references/reflection.md) the plan gave Create's step 8.
   - Where [critics.md](references/critics.md#which-model-and-how-many) gives the work a verifier, as when step 8
     listed a line, start it as [its section](references/critics.md#the-verifier) briefs it; a requirement it
     returns as `not met` is a correction.
   - Start the parts the plan gave Create's step 10 and act on what they return. Where the audit at
     delivery does not run, write the result's text to `result.md` and start
     [the reader of the user's words](references/critics.md#the-reader-of-the-users-words); its marks go into
     [the result](#the-result). When the close-out leaves no line without an outcome, hand the work over as the
     sheet's delivery decision says, and give the result.

## The result

Tell the user in this order; the text that delivers the work opens the same way:

- whether the work was kept, undone or left unchecked, and the rule that decided it;
- for each requirement, the place that meets it, from the verifier's table or the quality critic's marks;
- what ran, with its counts, and what did not run;
- what stayed unmeasured, and what in the user's next real use would show the skill failing;
- the user's instructions and questions the work does not meet, from the
  [reader](references/critics.md#the-reader-of-the-users-words) or the audit at delivery's
  [table](references/reflection.md#what-a-part-returns), each `unknown` as unverified;
- the judges' objections still open, and every close-out line that is `adjust`, `drop`, declined or pending;
- at delivery, and whenever the user asks: what the skill does, in three sentences, and the questions still
  open; at delivery also that [a retro](references/reflection.md#a-retro-on-a-use-of-this-skill) on this
  session can improve this skill.

Record the same, with the sheet, the sources table and the plan, where the repository keeps its changes and
research, as [plan.md](references/plan.md#a-close-out) says.
