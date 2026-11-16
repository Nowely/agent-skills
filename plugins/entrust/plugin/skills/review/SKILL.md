---
name: review
description: >-
  User-invoked review of a change, branch or PR: behavior, unnecessary code, responsibility boundaries and tests,
  challenged by fresh agents (an independent target, a critic, a verifier), alone or with direction helpers,
  here or in a subagent.
disable-model-invocation: true
metadata:
  version: "0.39.0"
license: MIT
---

# Review

Find the cleanest solution to the task in this codebase and say how the change compares with it. Cleanest is the result, not the diff: correct behavior, code a maintainer can read and change, each rule owned once and every concept justified, judged by [the design standard](references/design-standard.md). Code the change wrote may be reshaped toward that target; code it did not touch stays, and a problem there is pre-existing. A design problem can exist without a functional defect, and several related rules can rightly live in one function.

Review only: change no project code and post nothing unless asked; keep to the user's scope and execution limits, and write artifacts where the user permits. Never report a read-through or a proposed manual check as an executed check.

## Plan

Identify the diff (base and head, or uncommitted work), the task, the project instructions and the change's size; analyse nothing yet. If the object cannot be identified, ask for it. If the author's description is the only statement of the task, say so in the plan: approved uncorrected, it is the task. Then show the plan, each choice with its alternative and the one selected:

- **Mode:** one reviewer (default), or a coordinator with four direction helpers, for a diff one reviewer cannot hold (a size not measured; one held 1,085 changed lines) or one with several risky areas. Multi costs two to six times the tokens.
- **Where:** in this session (default), or in a subagent while this session conducts, which keeps the analysis out of the working session.
- **Checking agents:** an independent target, a critic and a verifier (default), or none.
- **Result:** the full record and its page (default), or, for a small change, a short review: the same reading and directions, answered in the response with no record, block map or page; its checking agents get the draft response, and its challenges go in the response.
- **Agents:** each agent the choices above start, with its model and the session that starts it, and scouts up to a stated number. By default the independent target and the critic run on the reviewer's model, the verifier and scouts on a lighter one. Observed on two real changes, a review with them took about 1M tokens and 31 minutes for 1,085 changed lines and 640k and 8 minutes for 307; the checking agents and the reconciling they cause were about 70% of the tokens. Every agent gets the plan's scope; where it allows tests, one scout runs them once at the start for all.
- **Scope and limits:** what will be read; any tests, application or screenshots run; any outside provider that receives the code; where the result goes; what is known to be out of reach.

Wait for approval before analysis. A choice is fixed when the user names it or says to use the defaults; a request or a parent's brief that fixes them all is approval, so show the plan in the first lines and start. A bare request to review is not approval. Ask only for what is missing; a corrected plan waits for its own approval unless the user approved it as corrected. Without an answer, because the user cannot reply or a reviewer was started without an approved plan, return the plan, say the review was not performed, and stop. Recheck the diff before starting; if it, the scope or the agents must change, ask again. If a direction helper fails or is blocked, stop and ask; never switch mode silently. If a checking agent fails, finish without it and say which check did not run. Approving a review approves no edit or comment.

## Agents

The review's agents are briefed by [the agents reference](references/agents.md): an independent target, scouts, a critic, a verifier and, in multi mode, direction helpers. Start only agents the plan names. The session that can start agents starts all of them: in Claude Code load [the claude adapter](../claude/SKILL.md) first; an outside critic on another provider runs through [codex](../codex/SKILL.md) or [opencode](../opencode/SKILL.md). Where no session can start agents, the plan says so and the checks are none. An agent's return is evidence to check against the source, never a conclusion to copy.

**Conducting.** When the review runs in a subagent, this session makes the plan, starts the reviewer, or the coordinator, with the approved plan and this page's path, and starts every agent the plan names on its behalf: the independent target at the same time as the reviewer, direction helpers on the coordinator's briefs, the critic and verifier on its saved draft. It hands the critic's and verifier's returns to the reviewer, the helpers' as they come, and relays the result without redoing the analysis. The reviewer saves its record and draft before each return, so the review survives a host that cannot continue it. Follow-up questions go to the same reviewer.

## Read

Start the independent target now (under a conductor it already runs), with the owner's task and discussion, the project instructions and the code before the change. The author's description and commit messages go to it, if at all, marked as the author's account to test. It writes its sketch to `<out>/target.md` and returns only the path, so its sketch reaches no one before the reviewer has made its own.

State the goal and its source. Number the requirements, each with its source: `task`, `discussion`, `question` or `assumption`. A requirement that only the author's description or commits state is an `assumption` until the owner's task or word confirms it. A decision recorded in the task stays binding when the code contradicts its premise: record the contradiction and the decision needed. An unapproved author rationale or a stale doc is an assumption; where an authoritative contract refutes it, recommend removing the mechanism resting on it.

Read the whole diff, the base version of rewritten logic, the producers of changed inputs, the consumers of changed outputs, the callers of changed functions, and existing code that already does this work or computes the same fact. At each boundary, establish who guarantees what and cite the code or type; for a dependency, the installed version's types or implementation; for stored data, older writers too while their data remains; for test data, the same contracts as for real inputs. An unavailable contract stays unknown; a neighbouring function or another version does not establish it. A scout can fetch a contract, a set of callers or a precedent.

## Analyse

For the full record, start it with `node "<skill-dir>/scripts/report.mjs" scaffold <range> <out>/review.json`, as [the data contract](references/report-data.md) says; read the change's files at the head it names, not in a working tree that may differ. Its blocks are the decisions to judge: divide one that holds two, so that each block is a branch, guard, parameter, request, constant, test or cohesive body that could go on its own. A block kept whole over several decisions defeats the necessity check.

The record's fields are the data contract's. What they mean here:

- A block's missing requirement link is a lead, not proof of redundancy.
- A unit that decides is judged by its rules with inputs, outcomes and precedence, and by the shared state and the timed or external effects that connect them; its verdict follows its least settled block.
- A mechanism is each meaningful behavior the change adds or alters, as one lifecycle, with its purpose, basis, benefit and cost, and `instead`: where what it does is already available, read from the code and installed contracts, or the places read that do not supply it. Weigh the mechanisms the user asks about and those a step removes by listing each one's blocks; the report gives each one's weight and, for two or more, the lines they touch together.

Then assess the grouping and sketch the target as [the design standard](references/design-standard.md#structure-and-target) says, after reading [the structural examples](references/structure-examples.md). Only then read `<out>/target.md`, if it is there, and record each difference between the two targets that could change a requirement, a verdict, a finding or a question as a challenge; otherwise it comes with the critic's.

## Review all four directions

Finish every direction, even after a serious finding; collect candidates now and refute them later.

**Behavior.** Trace each requirement through every affected path and the smallest group sharing its invariant, unchanged peers included, and check the group under the same transition. Run concrete values through changed branches: boundaries, empty and single inputs, permitted absence, repetition, failure partway. Follow errors and fallbacks to what the caller or user sees; logging or a fallback alone proves neither correctness nor a defect. Compare with the base for behavior the task did not ask to change. Check security, integrity, concurrency and performance where the path makes them relevant. For a visual question, follow [visual evidence](references/report-data.md#visual-evidence).

**Necessity.** For each mechanism and block (guard, fallback, catch, retry, cache, conversion, option, wrapper, registry, configuration, state), state the premise that requires it and check it against producers, callers and contracts: `needed` with evidence, `contradicted` with what can go, or `unknown` with what is missing; an `unknown` block or unit takes the verdict `question`, never `keep`. Settle `instead` from the code, not from the change's account of itself; an unsettled `instead` is an unread boundary, not a needed mechanism. Before recommending a new mechanism, name the required behavior the existing ones cannot express. A behavior nobody required is recorded as a mechanism whose basis says so, with its cost and what is lost without it, and goes to the owner as a question or an idea: never kept silently, never removed as mandatory. For a proposed removal, follow everything that exists only for it (requests, intermediate values, state, error paths, timers, tests) and keep the parts with an independent job.

**Design.** Use the standard's principles to name the burden that walking a change grounded in the task reveals; they are not a checklist to report. Put a proven defect at its owner and keep a necessary adaptation at its boundary; a documented format is not a dependency bug, and a workaround for a genuine upstream defect is judged on its own need, with the upstream fix recorded apart. A proposal shows the burden it removes and the boundaries it adds.

**Tests.** For each requirement and risky branch, name the test that catches a plausible regression, or the regression that escapes and the smallest test that would catch it, at a level the project uses. Check that tests detect wrong behavior rather than repeat the implementation, and that a reused utility's actual semantics fit this task.

<a id="refuting-a-candidate"></a>

## Refute, then challenge

Reopen the code and seek a reason each candidate is wrong: an upstream guarantee, a caller's actual input, a required lifecycle, an owner-accepted tradeoff, an existing test, unchanged base behavior.

- **Behavioral defect:** a reachable entry, its path and the wrong observable result. A conceivable input nothing supplies is a question.
- **Unnecessary mechanism:** what makes it unnecessary, and the required behavior the whole removal preserves, over time too. Without the key contract it stays a question.
- **Design finding:** the concrete burden, its evidence and why the proposal improves it, shown by a change grounded in the task walked through both arrangements. It must stand with every behavior finding fixed in place. Label it `judgment`; a shape preference is an idea.
- **Test gap:** the meaningful regression the current tests miss.

Scrutinise the fixes the same way, and after a large removal reassess what remains. Reconcile into one target and trace every requirement and rule through it. A confirmed problem is a finding, an open premise a question, an improvement the change does not need an idea, and an owner-accepted omission a tradeoff with its source and consequence; a proposal to drop a binding requirement stays a question until its owner accepts it. Mark pre-existing problems apart unless the change worsens or relies on them; an old implementation the new requirement depends on and that does not meet it is in scope.

Save the draft and print it with `report.mjs render`, which leaves kept blocks to the page; give that printout to the critic and the verifier at once, and the independent target's sketch to the critic. A block's lines come from `report.mjs lines <out>/review.json`. A challenge is a point that could change a requirement, a verdict, a finding or its rank, or a question; a point two agents raise is one challenge, a citation the verifier corrects is fixed in place, and an agreement, a point its agent itself concluded against included, is not recorded. An accepted point names what it changed; one that adds, promotes or drops a finding, or changes the verdict, is a candidate first and is refuted as above. Reject a point only on a place in the code or the task's sources that refutes it: name the place, quote what it says and why that contradicts the point. One you would reject on judgment alone, or whose source has no such place, goes to the owner. Then reconcile again.

## Record and respond

Fill the record, run `node "<skill-dir>/scripts/report.mjs" check <out>/review.json` until it passes and its warnings are answered, read it back as the data contract says, and render the page. A short review skips this and answers from its analysis.

Respond from the record, or a short review's analysis, not from a second set of findings. Lead with the verdict and the recommendation (accept, fix in place, or reshape toward the target), what decides it, and its material limits. Then the ordered steps, each structural one with the burden it removes; the findings by impact, each once, with direction, evidence, place, problem and smallest fix; questions; ideas; open owner tradeoffs and their consequences; the challenges rejected or sent to the owner, each with its reason, and in a line what the accepted ones changed; the checks that did not run; what was not read.

If the diff or a requested direction, a helper's included, could not be covered, review the bounded parts in order of risk and return a partial review: what was compared, grounded findings, what was not read or reviewed, the checks run, and that no complete record exists. Unread code is never `keep`.

## Modes

In multi mode the coordinator reads the whole diff and owns the analysis, the target, the record and the result; it briefs one helper per direction by [the agents reference](references/agents.md#direction-helpers), and settles disagreements from evidence, not agreement. In [orchestrate](../orchestrate/SKILL.md) the parent makes the plan and conducts, and the reviewer is its [cross-reviewer](../orchestrate/references/roles.md).
