---
name: review
description: >-
  User-invoked review of a change, branch or PR: behavior, unnecessary code, responsibility boundaries and tests,
  challenged by a fresh critic and verifier, alone or with direction helpers, here or in a subagent.
disable-model-invocation: true
metadata:
  version: "0.38.0"
license: MIT
---

# Review

Find the cleanest solution to the task in this codebase and say how the change compares with it. Cleanest is the result, not the diff: correct behavior, code a maintainer can read and change, each rule owned once and every concept justified, judged by [the design standard](references/design-standard.md). Code the change wrote may be reshaped toward that target; code it did not touch stays, and a problem there is pre-existing. A design problem can exist without a functional defect, and several related rules can rightly live in one function.

Review only: change no project code and post nothing unless asked, and keep to the user's scope and execution limits. Write artifacts where the user permits, outside the source tree by default. Never report a read-through or a proposed manual check as an executed check.

## Plan

Identify the diff (base and head, or a snapshot of uncommitted changes), the task, the project instructions and the change's size; analyse nothing yet. If the object cannot be identified, ask for it. Then show the plan, each choice with its alternative and the one selected:

- **Mode:** one reviewer (default), or a coordinator with four direction helpers. Multi costs two to six times the tokens; propose it for a large or risky diff.
- **Where:** in this session (default), or in a subagent while this session conducts. A subagent keeps the analysis, often 50–190k tokens, out of the working session.
- **Checks:** a fresh critic and verifier (default), or none. If the host cannot start agents, say so here: the reviewer then does them itself, not independently.
- **Result:** the full record and its page (default), or a short review.
- **Scope and limits:** what will be read; any tests, application or screenshots run; any outside provider that receives the code; where the result goes; what is known to be out of reach.

Wait for approval before analysis. A bare request to review is not approval; a request or a parent's brief that already fixes the object and these choices is: show the plan in the first lines and start. Ask only for what is missing or ambiguous; a corrected plan waits for its own approval unless the user approved it as corrected. If the user cannot answer, return the plan, say the review was not performed, and stop. A reviewer started without an approved plan returns the plan to whoever started it instead of starting. Recheck the diff before starting; if it, the scope or the agents must change, ask again. If an approved agent fails or is blocked, stop and ask; never switch mode silently. Approving a review approves no edit or comment.

**Conducting.** When the review runs in a subagent, this session does the plan only: it starts the reviewer, or the coordinator, with the approved plan and this page's path, and relays its result without redoing the analysis. A subagent that cannot start agents of its own returns its draft instead of running the checks; the conductor starts the critic and verifier on that draft and gives their returns back to the same reviewer to settle. Follow-up questions go to the same subagent when the host can continue it.

## Agents

A review uses fresh-context agents briefed by [the agents reference](references/agents.md): scouts that fetch facts, a critic and a verifier after refutation, and in multi mode direction helpers. Start only agents the plan covers, with the host's mechanism for subagents; a check the host cannot start, do yourself and mark as not independent. An agent's return is evidence to check against the source, never a conclusion to copy.

## Read

State the goal and its source. Number the requirements with their source, `task`, `discussion`, `question` or `assumption`, and where each is written. A decision recorded in the task stays binding when the code contradicts its premise: record the contradiction and the decision needed. An unapproved author rationale or a stale doc is an assumption; where an authoritative contract refutes it, recommend removing the mechanism resting on it.

Read the whole diff, the base version of rewritten logic, the producers of changed inputs, the consumers of changed outputs, the callers of changed functions, and existing code that already does this work or computes the same fact. At each boundary, establish who guarantees what and cite the code or type; for a dependency, the installed version's types or implementation; for stored data, its writers, imports and migrations, older writers included while their data remains. An unavailable contract stays unknown; a neighbouring function or another version does not establish it. A scout can fetch a contract, a set of callers or a precedent.

## Analyse

Keep one record, with references between its parts:

- **Requirements**, with source and, as the review goes, status.
- **Decisions:** each changed decision or independently removable part (branch, guard, parameter, request, constant, test) with its place, behavior and the requirement or integration it serves. A missing requirement link is a lead, not proof of redundancy.
- **Units:** each changed unit, its jobs, what it uses and what calls it; for a unit that decides, its rules with inputs, outcomes and precedence; the shared state and the timed or external effects that connect them.
- **Mechanisms:** each meaningful behavior the change adds or alters, as one lifecycle, with its purpose, basis, benefit and cost, and `instead`: where what it does is already available, read from the code and installed contracts, or the places read that do not supply it.
- **Evidence and limits:** entries, contracts, existing utilities and unread boundaries.

Then assess the grouping and sketch the target as [the design standard](references/design-standard.md#structure-and-target) says, after reading [the structural examples](references/structure-examples.md).

## Review all four directions

Finish every direction, even after a serious finding; collect candidates now and refute them later.

**Behavior.** Trace each requirement through every affected path and the smallest group sharing its invariant, unchanged peers included, and check the group under the same transition. Run concrete values through changed branches: boundaries, empty and single inputs, permitted absence, repetition, failure partway. Follow errors and fallbacks to what the caller or user sees; logging or a fallback alone proves neither correctness nor a defect. Compare with the base for behavior the task did not ask to change. Check security, integrity, concurrency and performance where the path makes them relevant. For a visual question, follow [visual evidence](references/report-data.md#visual-evidence).

**Necessity.** For each mechanism and removable part (guard, fallback, catch, retry, cache, conversion, option, wrapper, registry, configuration, state), state the premise that requires it and check it against producers, callers and contracts: `needed` with evidence, `contradicted` with what can go, or `unknown` with what is missing. Settle `instead` from the code, not from the change's account of itself; an unsettled `instead` is an unread boundary, not a needed mechanism. Before recommending a new mechanism, name the required behavior the existing ones cannot express. Weigh benefit against cost. For a behavior nobody required whose cost is material, say what is lost without it and ask its owner; keep a minor convenience without asking; never make its removal mandatory. For a proposed removal, follow everything that exists only for it (requests, intermediate values, state, error paths, timers, tests) and keep the parts with an independent job.

**Design.** Check the change against each principle of the design standard. Put a proven defect at its owner and keep a necessary adaptation at its boundary; a documented format is not a dependency bug, and a workaround for a genuine upstream defect is judged on its own need, with the upstream fix recorded apart. A proposal shows the burden it removes and the boundaries it adds; a helper that renames obvious lines, or a split that needs shared mutable state, is no improvement.

**Tests.** For each requirement and risky branch, name the test that catches a plausible regression, or the regression that escapes and the smallest test that would catch it, at a level the project uses. Check that tests detect wrong behavior rather than repeat the implementation, and that a reused utility's actual semantics fit this task. Report the checks actually run apart from those only proposed.

<a id="refuting-a-candidate"></a>

## Refute, then challenge

Reopen the code and seek a reason each candidate is wrong: an upstream guarantee, a caller's actual input, a required lifecycle, an owner-accepted tradeoff, an existing test, unchanged base behavior.

- **Behavioral defect:** a reachable entry, its path and the wrong observable result. A conceivable input nothing supplies is a question.
- **Unnecessary mechanism:** what makes it unnecessary, and the required behavior the whole removal preserves, over time too. Without the key contract it stays a question.
- **Design finding:** the concrete burden, its evidence and why the proposal improves it. It must stand with every behavior finding fixed in place. Label it `judgment`; a shape preference is an idea.
- **Test gap:** the meaningful regression the current tests miss.

Scrutinise the fixes the same way, and after a large removal reassess what remains. Reconcile into one target and trace every requirement and rule through it. A confirmed problem is a finding, an open premise a question, an improvement the change does not need an idea, and an owner-accepted omission a tradeoff with its source and consequence; a proposal to drop a binding requirement stays a question until its owner accepts it. Mark pre-existing problems apart unless the change worsens or relies on them; an old implementation the new requirement depends on and that does not meet it is in scope. Merge duplicates without dropping small confirmed problems, and invent no finding to fill a direction.

Then give the draft (verdict, target, findings, units kept and changed, mechanism decisions) to the critic and the verifier at once. The critic argues the strongest case against each decision in both directions; the verifier checks each factual claim against the source. Check every point they raise against the code, accept or reject it with a reason, and say in the result what they changed.

## Record and respond

For the full record, follow [the data contract](references/report-data.md). `node "<skill-dir>/scripts/report.mjs" scaffold <range> <out>/review.json` writes the diff's identity, a saved copy of the diff and its blocks; fill in the meaning, divide a block that holds two decisions, run `check` until it passes, read the record back, and render the page as [the interactive report](references/interactive-report.md) says. A short review does the same analysis and skips only the record.

Respond from the record, not from a second set of findings. Lead with the verdict and the recommendation (accept, fix in place, or reshape toward the target), what decides it, and its material limits. Then the ordered steps, each structural one with the burden it removes; the findings by impact, each once, with direction, evidence, place, problem and smallest fix; questions; ideas; open owner tradeoffs and their consequences; what the critic and verifier changed; what was not read.

If the diff or a requested direction could not be covered, review the bounded parts in order of risk and return a partial review instead: the change and base compared, grounded findings, the scope examined and the files or lines not reached, the directions not reviewed, the checks run apart from those proposed, and that no complete record or line map exists. No checker vouches for unreviewed scope, and unread code is never `keep`.

## Modes

One reviewer covers everything by default. In multi mode the coordinator reads the whole diff and owns the analysis, the target, the record and the result; it briefs one helper per direction by [the agents reference](references/agents.md#direction-helpers), records what it did with each return, keeps unknowns, and settles disagreements from evidence, not agreement. A helper that returns partial leaves the review partial unless the coordinator covers that scope itself. In [orchestrate](../orchestrate/SKILL.md) the parent makes the plan, and the reviewer is its [cross-reviewer](../orchestrate/references/roles.md).
