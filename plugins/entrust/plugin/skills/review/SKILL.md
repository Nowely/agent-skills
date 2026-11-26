---
name: review
description: >-
  User-invoked review of a change, branch or PR: behavior, unnecessary code, responsibility boundaries and tests,
  challenged by fresh agents (an independent target, a critic, a verifier), alone or with direction helpers,
  here or in a subagent.
disable-model-invocation: true
metadata:
  version: "0.47.2"
license: MIT
---

# Review

Find the cleanest solution to the task in this codebase and say how the change compares with it. Cleanest is the result, not the diff: correct behavior, code a maintainer can read and change, each rule owned once and every concept justified, judged by [the design standard](references/design-standard.md). Code the change wrote may be reshaped toward that target; code it did not touch stays, and a problem there is pre-existing. A design problem can exist without a functional defect, and several related rules can rightly live in one function.

Review only: change no project code and post nothing unless asked; keep to the user's scope and execution limits, and write artifacts where the user permits. Never report a read-through or a proposed manual check as an executed check.

## Plan

Identify the diff (base and head, or uncommitted work), the task, the project instructions and the change's size, and for a change reviewed and answered before, the [previous record, its export and head](references/report-data.md#the-next-revision); analyse nothing yet. If the object cannot be identified, ask for it. If the author's description is the only statement of the task, say so in the approval question: approved, its goal is the task; its details stay the author's until confirmed. Then show the plan, each choice with its alternative and the one selected:

- **Mode:** one reviewer (default), or a coordinator with four direction helpers, for a diff with several risky areas. The coordinator still reads the whole diff, so multi mode does not raise the size one review can hold (one held 1,085 changed lines). Multi costs two to six times the tokens.
- **Where:** in this session (default), or in a subagent while this session conducts, which keeps the analysis out of the working session.
- **Checking agents:** an independent target, a critic and a verifier (default), or none. The plan says in a clause what each does: the target sketches the solution from the task and the base code without seeing the change, the critic challenges the draft, the verifier checks its facts.
- **Result:** the full record and its page (default), for a change reviewed before a [continuation](references/report-data.md#the-next-revision) that reads only what changed, or, for a small change, a short review: the same reading and directions, answered in the response with no record, block map or page; its checking agents get the draft response, and its challenges go in the response. The plan offers the short review only for a small change.
- **Full record:** name one comparison reader, or use staged self-review when no additional agent is approved.
- **Agents:** each agent the choices above start, with its exact model and the session that starts it, and scouts up to a stated number. By default the independent target and the critic run on the reviewer's model, the verifier and scouts on a lighter one. On four real changes of 307 to 1,085 lines, a review with them took 610k to 1M tokens and 8 to 31 minutes, about 70% of the tokens theirs and the reconciling they cause. Every agent gets the plan's scope; where it allows tests, one scout runs them once at the start for all.
- **Scope and limits:** what will be read; the tests, application or screenshots run, named by command or suite, or the bound of the choice; any outside provider that receives the code; `<out>`, the folder where the record, the page and the agents' files go; what is known to be out of reach.

Show the plan as a message the owner can scan: a title line naming the object and its link; the task in a line with its source — the owner's task, the discussion, the project instructions, or the author's description approved as the task; the diff's facts with abbreviated hashes, file count and added/removed lines. The four choices — Mode, Where, Checking agents, Result — in a table with columns choice, selected, alternative, one row each, the selected with its reason. Below, short labelled blocks: what the review judges and returns — the change against the cleanest target, a verdict with findings, questions and steps; what each checking agent does; the agents with their exact models and the session that starts each; the checks; `<out>` and how existing snapshots are reused; the limits; the measured cost with its sample, not a prediction for the change. The approval question alone on the last line. Carry what can change the owner's decision — inputs, cost, time, trust, limits; not internal scheduling, not the history of past artifacts, not a quotation of this page.

Wait for approval before analysis. A choice is fixed when the user names it or says to use the defaults; a request or a parent's brief that fixes them all is approval, so show the plan in the first lines and start. A bare request to review is not approval. Ask only for what is missing; a corrected plan waits for its own approval unless the user approved it as corrected. Without an answer, because the user cannot reply or a reviewer was started without an approved plan, return the plan, say the review was not performed, and stop. Recheck the diff before starting; if it, the scope or the agents must change, ask again. If a direction helper fails or is blocked, stop and ask; never switch mode silently. If a checking agent fails, finish without it and say which check did not run. Approving a review approves no edit or comment.

## Agents

The review's agents are briefed by [the agents reference](references/agents.md): an independent target, scouts, a critic, a verifier and, in multi mode, direction helpers. Start only agents the plan names. The session that can start agents starts all of them: in Claude Code load [the claude adapter](../claude/SKILL.md) first; an outside critic on another provider runs through [codex](../codex/SKILL.md) or [opencode](../opencode/SKILL.md). Where no session can start agents, the plan says so and the checks are none. An agent's return is evidence to check against the source, never a conclusion to copy.

**Conducting.** When the review runs in a subagent, this session conducts it as [the agents reference](references/agents.md#conducting) says.

## Read

If the plan includes the independent target, start it now (under a conductor it already runs), with the owner's task and discussion, the project instructions and the code before the change. The author's description, commit messages and any hand-off from the session that made the change go to it, if at all, marked as the author's account to test. It writes its sketch to `<out>/target.md` and returns only the path, so its sketch reaches no one before the reviewer has made its own; where no `<out>` is allowed, it returns the sketch, and the reviewer sets it aside until its own sketch is done.

State the goal and its source. Number the requirements, each with where it comes from and the words that state it, as [the data contract](references/report-data.md#fields) says: established — the task, the owner's decision, a project rule — or to confirm: the author's account (a hand-off from the authoring session included, an input to check), an existing behaviour to keep, your reading of the task's words (naming them, such as keeping the old way beside a new default) or an open point. Code doing something does not make it required. A decision recorded in the task stays binding when the code contradicts its premise: record the contradiction and the decision needed. An unapproved author rationale or a stale doc is an assumption; where an authoritative contract refutes it, recommend removing the mechanism resting on it.

Read the whole diff, the base version of rewritten logic, the producers of changed inputs, the consumers of changed outputs, the callers of changed functions, and existing code that already does this work or computes the same fact. At each boundary, establish who guarantees what and cite the code or type; for a dependency, the installed version's types or implementation; for stored data, older writers too while their data remains; for test data, the same contracts as for real inputs. An unavailable contract stays unknown; a neighbouring function or another version does not establish it. A scout can fetch a contract, a set of callers or a precedent.

## Analyse

For the full record, obtain the diff for the agreed scope and start it with `node "<skill-dir>/scripts/report.mjs" scaffold <diff-file> <out>/review.json`, as [the data contract](references/report-data.md) says, and write in `range` how the diff was obtained and the state its files are read at. Read the change's files at that state, not a working tree that may differ. Its blocks are the decisions to judge: divide one that holds two, so that each block is a branch, guard, parameter, request, constant, test or cohesive body that could go on its own. A block kept whole over several decisions defeats the necessity check; a [generated file](references/report-data.md#generated-files) is the exception. Each block says what it does and why it is there, kept or not, and each behaviour that runs through several blocks gets a [route](references/report-data.md#fields).

The record's fields are the data contract's. What they mean here:

- A block's missing requirement link is a lead, not proof of redundancy.
- A unit that decides is judged by its rules with inputs, outcomes and precedence, and by the shared state and the timed or external effects that connect them; its verdict follows its least settled block.
- A mechanism is each meaningful behavior the change adds or alters, an existing path it keeps beside a new default included, with what it adds to keep that path working, as one lifecycle, with its purpose, basis, benefit and cost, and `instead`: where what it does is already available, read from the code and installed contracts, or the places read that do not supply it. Weigh the mechanisms the user asks about, those a step removes and those that go to the owner because nobody required them, by listing each one's blocks; the report gives each one's weight and, for two or more, the lines they touch together.

Then assess the grouping and sketch the target as [the design standard](references/design-standard.md#structure-and-target) says, after reading [the structural examples](references/structure-examples.md). If the plan includes the independent target, only then read `<out>/target.md` and record each difference between the two targets that could change a requirement, a verdict, a finding or a question as a challenge; if the file is not there yet, read it when the critic's return comes.

## Review all four directions

Finish every direction, even after a serious finding; collect candidates now and refute them later.

**Behavior.** Trace each requirement through every affected path and the smallest group sharing its invariant, unchanged peers included, and check the group under the same transition. Run concrete values through changed branches: boundaries, empty and single inputs, permitted absence, repetition, failure partway. Follow errors and fallbacks to what the caller or user sees; logging or a fallback alone proves neither correctness nor a defect. Compare with the base for behavior the task did not ask to change. Check security, integrity, concurrency and performance where the path makes them relevant. For a visual question, follow [visual evidence](references/report-data.md#visual-evidence).

**Necessity.** For each mechanism and block (guard, fallback, catch, retry, cache, conversion, option, wrapper, registry, configuration, state), state the premise that requires it and check it against producers, callers and contracts: `needed` with evidence, `contradicted` with what can go, or `unknown` with what is missing; an `unknown` block or unit takes the verdict `question`, never `keep`. Settle `instead` from the code, not from the change's account of itself; an unsettled `instead` is an unread boundary, not a needed mechanism. Before recommending a new mechanism, name the required behavior the existing ones cannot express. A behavior nobody required, one whose basis holds only assumptions, is recorded as a mechanism whose basis says so, with its cost and what is lost without it, and goes to the owner as a question or an idea: never kept silently, never removed as mandatory. For a proposed removal, follow everything that exists only for it (requests, intermediate values, state, error paths, timers, tests) and keep the parts with an independent job.

**Design.** Sweep for [the standard's leads](references/design-standard.md#leads). Use the standard's principles to name the burden that walking a change grounded in the task reveals; they are not a checklist to report. Put a proven defect at its owner and keep a necessary adaptation at its boundary; a documented format is not a dependency bug, and a workaround for a genuine upstream defect is judged on its own need, with the upstream fix recorded apart. A proposal shows the burden it removes and the boundaries it adds.

**Tests.** For each requirement and risky branch, name the test that catches a plausible regression, or the regression that escapes and the smallest test that would catch it, at a level the project uses. Check that tests detect wrong behavior rather than repeat the implementation, and that a reused utility's actual semantics fit this task.

Collect comparable sources: promises and consumers, paths for the same case, and assertions that distinguish outcomes. Include removed paths and unchanged consumers.

<a id="refuting-a-candidate"></a>

## Refute, then challenge

Reopen the code and seek a reason each candidate is wrong: an upstream guarantee, a caller's actual input, a required lifecycle, an owner-accepted tradeoff, an existing test, unchanged base behavior.

- **Behavioral defect:** a reachable entry, its path and the wrong observable result. A conceivable input nothing supplies is a question.
- **Unnecessary mechanism:** what makes it unnecessary, and the required behavior the whole removal preserves, over time too. Without the key contract it stays a question.
- **Design finding:** cite the concrete burden and show how the smallest fix removes it. For a structural proposal, walk a change grounded in the task through both arrangements. A finding must stand with every behavior finding fixed in place. Label it `judgment`. A shape preference is an idea.
- **Tests:** for a misleading name, compare what the name promises with what the test exercises and asserts. For a gap, show the meaningful regression the current tests miss.

Scrutinise the fixes the same way, and after a large removal reassess what remains. Reconcile into one target and trace every requirement and rule through it. A confirmed problem is a finding. Keep it at its actual impact, with minor findings that do not affect the verdict marked non-blocking. A missing fact, evidence or choice becomes an owner question when it could change a conclusion or next action. An improvement the change does not need is an idea. An owner-accepted omission is a tradeoff with its source and consequence. A proposal to drop a binding requirement stays a question until its owner accepts it. Mark pre-existing problems apart unless the change worsens or relies on them; an old implementation the new requirement depends on and that does not meet it is in scope.

**Full draft.** Save, check and freeze one [comparison inventory](references/report-data.md#comparison-pass). Give the same reader the full draft and three successive briefs: [structure](references/comparison-structure.md), [paths](references/comparison-paths.md), then [decisions](references/comparison-decisions.md). Deliver each after the previous return is saved. Verify and reconcile the results into the record before challenge.

If the plan includes checking agents, print the reconciled draft with `report.mjs render`, which leaves kept blocks to the page; give that printout to the critic and the verifier at once, and the independent target's sketch to the critic. A block's lines come from `report.mjs lines <out>/review.json`. A short review gives them its draft response instead.

A challenge is a point that could change a requirement, a verdict, a finding or its rank, or a question. A point two agents raise is one challenge; a citation the verifier corrects is fixed in place. Record no agreement; a point its own agent argued against is an agreement.

- **Accept** a point that holds, and name what it changed. One that adds, promotes or drops a finding, or changes the verdict, is accepted only after you have read the place it rests on and it shows what the point says.
- **Reject** a point only on a place in the code or the task's sources that refutes it: name the place, quote what it says and why that contradicts the point.
- **Send to the owner** every other point, naming the fact, evidence or decision that would settle it and what depends on it.

When reconciling rewritten or merged points, ask “Could the author follow this recommendation exactly and still leave the original discrepancy in place?” If so, restore the missing action or choice.

## Record and respond

Before a point goes to the owner, settle by reading or a scout what the scope readily supplies that could change its options, as the card's context lists, and name what stays out of reach; a point that needs the owner's intent stays a question. Classify each question as a choice, a fact to settle, or evidence to obtain, and write it as a card by [the data contract](references/report-data.md#decision-cards): for a choice, a self-contained context, at least two variants, each with its confirmed consequences, a recommendation that names its variant or says there is none, with its basis, and the checks the choice does not replace. Never turn a permission into an obligation, an opinion into a fact, or an owner's mark into a checked result.

Fill the record, run `node "<skill-dir>/scripts/report.mjs" check <out>/review.json` until it passes and its warnings are answered, read it back as the data contract says, and render the page. A short review skips this and answers from its analysis.

Give the owner the page, `review.html` beside the record: they answer there, and what they export goes on as [the data contract](references/report-data.md#the-page) says.

Respond from the record, or a short review's analysis, not from a second set of findings. Lead with the verdict and the recommendation (accept, fix in place, or reshape toward the target), what decides it, and its material limits. Then the ordered steps, each structural one with the burden it removes; the findings by impact, each once, with direction, evidence, place, problem and smallest fix; questions; ideas; open owner tradeoffs and their consequences; the challenges rejected or sent to the owner, each with its reason, and in a line what the accepted ones changed; the checks that did not run; what was not read.

If the diff or a requested direction, a helper's included, could not be covered, review the bounded parts in order of risk and return a partial review: what was compared, grounded findings, what was not read or reviewed, the checks run, and that no complete record exists. Unread code is never `keep`.

## Modes

In multi mode the coordinator reads the whole diff and owns the analysis, the target, the record and the result; it briefs one helper per direction by [the agents reference](references/agents.md#direction-helpers), and settles disagreements from evidence, not agreement. In [orchestrate](../orchestrate/SKILL.md) the parent makes the plan and conducts, and the reviewer is its [cross-reviewer](../orchestrate/references/roles.md).
