---
name: review
description: >-
  User-invoked review of a change, branch or PR: assess solution quality, unnecessary code,
  responsibility boundaries, behavior and tests, with one reviewer or independent reviewers by direction.
disable-model-invocation: true
metadata:
  version: "0.37.0"
license: MIT
---

# Review

Find the smallest clean solution to the task in this codebase, and explain how the change compares with it. Correct behavior, necessary mechanisms, clear ownership and readable structure all matter. A review can find a design problem without finding a functional defect; a sound design can keep several related rules in one function.

Review only: change no project code and post no comments unless asked. Keep to the user's scope and execution limits. Save review artifacts in the user's permitted output location, outside the source tree by default; where writing artifacts is not allowed, return the complete structured report in the response and state that it was not saved. Never describe a read-through or a proposed manual scenario as an executed check.

## Preparation

Identify the exact diff and base, the task, and the project instructions. State the goal and its source. Extract numbered requirements with source labels: `task`, `discussion`, `question` or `assumption`; include a reference to the actual source. A task's recorded decision remains a requirement when code contradicts its premise: record the contradiction and the decision needed, rather than silently replacing it. An unapproved author rationale or stale project doc is an assumption, not a binding requirement: when an authoritative contract refutes it, recommend removing the unnecessary mechanism directly.

Read the changed files and the base version of rewritten logic. Follow changed inputs from their producers, changed outputs to their consumers, and changed functions to their callers. Read the existing parser, validator, utility or neighboring implementation that already does this kind of work. Look for other places that compute or display the same fact.

Establish reachable entries and boundary contracts. Entries are repository callers, task-specified inputs, schedules and events. At a boundary, identify which side guarantees what and cite the code or type that establishes it. For dependencies, identify the lockfile version and inspect the installed version's types or implementation relevant to the claim. For stored data, inspect the relevant writers, imports and migrations, including older writers when their data can remain. An unavailable contract stays unknown; a neighboring function or different version does not establish it.

Read [references/report-data.md](references/report-data.md), the data and verification contract, for every review so the analysis can populate the report as evidence is collected. HTML is a separate, optional presentation of that same record.

Scope and reading prepare the first analytical step below. If the change cannot be covered whole, review bounded parts in risk order and explicitly mark the unreached scope.

## Procedure

### 1. Map the connected code

Build this map for every review, including a short review without an interactive report. Continue reading wherever the map exposes a missing connection.

Keep one compact analysis record, in Markdown or JSON, with references between its parts:

- **Requirements:** id, required behavior, source and source reference. Add verification status and any contradiction as the review progresses.
- **Blocks:** file and changed line ranges on each side of the diff, containing unit where applicable, what the block does, and the requirement or necessary integration/check it serves. A block is a decision or independently removable part: a branch, guard, parameter, request, constant, test or cohesive function body. Every nonblank changed line belongs to exactly one block. Keep and removal decisions will be added after review; an empty requirement link is a candidate to investigate, not proof of redundancy.
- **Units and connections:** each changed unit with real logic, its responsibilities, the units it uses, and the existing units that call it or that it calls. Include source locations for unchanged code and trace through relevant dependencies far enough to explain the changed behavior and ownership. For a unit that decides, record its rules: inputs, conditions, outcomes and precedence when rules overlap. Include shared mutable decision state and external or time-dependent effects where they connect blocks or affect ownership. The map must show the connected implementation, not just a list of changed files.
- **Mechanisms:** identify the meaningful behaviors or coordination concepts the change adds, reuses, changes or removes. A mechanism may span several blocks and units: a scheduled refresh includes its trigger, state, cancellation and consumer. A helper or guard is not automatically a separate mechanism. Record its purpose, basis, benefit, cost and proposed disposition in `mechanisms`, referencing the mapped units and requirements. For one the change adds or alters, first answer `instead`: where what it obtains or does is already available (a value or field the code was passed, an existing utility, an upstream check, the dependency's own behavior) and where you read that, or the places you read that do not supply it. An empty list is valid for a change with no material mechanism.
- **Evidence and limits:** reachable entries, contract references, relevant existing utilities and unread boundaries. Record each once and refer to it from blocks, units and findings.

Use the same record for later findings and presentation. Requirement links come from blocks; dependencies come from units. Do not copy those relationships into several parallel tables. The initial map is provisional: assign no keep/fix/remove before reviewing. After refutation, finalize it into the mandatory `review.json` data contract: `requirements`, `blocks`, `units`, `mechanisms` and `coverage` carry the map, with rule details in the unit's `jobs`. The complete structured report is required whether or not HTML is requested.

Check the map against the diff and the connected code: changed lines accounted for, unit references resolved, rule order stated, and unverified connections visible. Preserve it as an accessible artifact and link it in the report. A concise response may omit the full map; the analysis and its checkable record remain required.

### 2. Check responsibility boundaries and decomposition

After the breakdown, explicitly assess how responsibilities and rules are grouped: whether to split intertwined logic, merge scattered ownership, simplify control flow or layers in place, or keep the current grouping. Record the assessment and its reason in the map.

Trace each mechanism's owner, inputs, effects and lifetime. Distinguish missing context from entanglement: overwritten state, flags crossing rules, unrelated work needed to establish an outcome, a scattered rule, or a caller interpreting another unit's partial result. Show what must be understood or changed together and its cost; tracing difficulty alone is a lead.

When non-trivial domain calculations obscure multi-rule precedence, this review style prefers a short coordinator and independently understandable named rules. Compare clarification in place, separating decisions from effects, consolidation, extraction and removal. That preference picks among arrangements once a reading burden is shown; it does not stand in for showing one. Cite the burden as a `judgment`, without inventing a functional failure.

Keep obvious guards and cohesive ordered decisions together. A boundary must reduce reasoning burden without exporting the same mutable state; length and helper counts do not decide. Read [the structural examples](references/structure-examples.md) before finalizing this assessment.

### 3. Sketch the target

Before the detailed passes, sketch the smallest solution supported by the requirements and contracts: its units, what each owns, what it reuses, and which mechanisms it needs. This is a provisional comparison, not a commitment to preserve the implementation's premises.

Trace requirements and rules through it. Preserve required timing, failure, retry, reload and no-further-input behavior, citing the task, owner decision or established contract that requires it. A convenience introduced by this change is not binding merely because the author implemented it. If a required decision conflicts with a contract, show the conflict and which part of the target depends on resolving it. If the change already has the appropriate structure, say so. Update the target when later evidence changes it.

### 4. Review all four directions

Finish every direction, even after a serious finding. Collect candidates and unexplained code; refute them in the refutation step rather than discarding uncertain ones during collection.

#### Behavior

- Trace each requirement through all affected places and compare with the base for behavior the task did not ask to change.
- Run concrete values through changed branches by hand: comparison boundaries, empty and singleton inputs, absence the contract permits, repeated input and a failure partway through. Check security, data integrity, concurrency and performance where the changed path makes them relevant.
- Follow errors and fallbacks to what the caller or user observes. Establish whether the handling meets the contract; logging or fallback alone does not prove either correctness or a defect.
- For visible changes, compare the supplied mockup, before and after pictures by screen and state. Distinguish a supported requirement from an unexplained visual difference or an unspecified state. Missing pictures leave comparison unchecked. Start the application only within the user's execution authorization.

#### Necessity

- For each mechanism and each independently removable part—guard, fallback, catch, retry, cache, conversion, option, wrapper, registry, configuration or state—state the premise that requires it. Check that premise against producers, callers and boundary contracts. Classify it as `needed` with evidence, `contradicted` with the removable part, or `unknown` with the missing evidence. Check guards inside `keep` blocks against proven types, producers and existing predicates; retain justified boundary defenses.
- Settle each mechanism's `instead` from the code and the installed contracts, not from the change's own account of why it is needed. An unsettled `instead` is an unread boundary, not a needed mechanism. Before recommending a new mechanism or interface, identify the required behavior the existing ones cannot express.
- Weigh benefit against price: which observed or required scenario benefits, and what state, interactions, lifecycle/cleanup, runtime work, tests and maintenance the mechanism introduces. Separate measured runtime cost from static maintenance judgment; leave frequency or impact unknown when unsupported. Counts describe the chosen grouping, not quality. Keep, simplify, reuse or remove based on evidence. For an unrequested convenience, show its dependent machinery, simpler alternative and observable tradeoff. A stateful feature's removal is not automatically equivalent; an unsettled owner choice remains a question. An explicit requirement stays binding until its owner changes it; an optional improvement is not a defect merely because it was omitted.
- For each proposed removal, follow its dependent machinery: data requests, intermediate values, state, loading/error paths, timers and tests. Remove what serves only that mechanism; preserve parts with an independent required job. Explain the complete simplification, not just its first deleted call.

#### Design

Use the decomposition assessment and target to examine the design as a whole:

- **Ownership and cohesion:** duplicated facts or rules, scattered decisions, overwritten intermediate decision state or mutable flags crossing rules, logic in a consumer that prevents reuse by other consumers, hidden mutation, misleading names, or mode parameters combining unrelated contracts.
- **Dependencies and structure:** cycles, inverted layer knowledge, callers depending on callee internals, forwarding layers, or generic machinery without a supported variation. Compare with the project's closest precedent; fewer layers are useful when they reduce concepts and interfaces, not merely lines.
- **Boundary work:** distinguish a producer violating its contract from an adapter translating valid output into the application's representation. Put a proven defect at its owner; keep a necessary adaptation at the appropriate boundary. A documented format difference is not a dependency bug. When a genuine upstream defect cannot be fixed here, assess the local workaround on its own necessity and record the upstream improvement separately.
- **Cost of the proposal:** show which coupling, duplication or reasoning burden the alternative removes and what boundary it adds. A helper that only renames obvious lines, or a split that requires shared mutable state and more coordination, has not demonstrated an improvement.

#### Tests

- For each requirement and risky changed branch, identify the test that catches a plausible regression. A gap names the regression that escapes and the smallest useful test at a level the project already uses.
- Check whether changed tests detect wrong behavior rather than repeating the implementation, pinning scaffolding, or demanding contract-excluded states. Reusing a utility also requires checking that its actual semantics meet this task.
- Report checks actually run and their results separately from code inspection and recommended manual scenarios.

<a id="refuting-a-candidate"></a>

### 5. Refute candidates and reconcile the target

Reopen the supporting code and actively seek a reason each candidate is wrong: a guarantee upstream, a reachable caller's actual input, a required lifecycle behavior, an explicit owner-accepted tradeoff, an existing test, or unchanged behavior in the base.

- **Behavioral defect:** a reachable entry, its path and the wrong observable result. A merely conceivable input unsupported by code or the task is a question.
- **Unnecessary mechanism:** the contract or existing capability that makes it unnecessary, and the required behavior preserved by the whole removal, including behavior over time. If the key dependency contract is unavailable, retain a question instead of asserting equivalence.
- **Design finding:** the existing responsibility or rule, the concrete ownership/coupling/readability cost visible in the code, and how the proposed arrangement reduces it. Label the conclusion `judgment`. This evidence can justify a finding without a functional failure or a fabricated future requirement. A shape preference with no demonstrated reading/change cost is an idea, whatever standard it cites.
- **Test gap:** the meaningful regression that current tests would miss.

Apply the same scrutiny to fixes. Avoid speculative guards, options and layers; show that proposed deletions preserve independent responsibilities. After a major removal, reassess the remaining responsibilities and plumbing on their own merits. Reconcile findings into one target and trace the requirements and rules through it again; do not invent a further finding to fill a category.

A confirmed problem is a finding; an unresolved premise or candidate is a question; an improvement unnecessary to the change is an idea. Behavior omitted by an explicit owner decision is an accepted tradeoff with its source and consequence, not a finding; proposing to drop a binding requirement stays a question or idea until accepted. Mark pre-existing problems separately unless the change worsens or relies on them. An old implementation that the new requirement depends on but that does not meet it is relevant to this review. Merge duplicates without dropping small confirmed problems.

### 6. Report

Finalize `review.json` for every review (saving it in the permitted output location, or returning it inline when writes are disallowed) before returning the concise response, following [the report](#the-report). Include block and unit dispositions, requirement status, findings and the current and target structures. Read back the materialized JSON and check that the complete report, map and target agree, using the verification pass in the data contract. A structurally valid JSON can still describe contradictory behavior. Generate HTML only when explicitly requested.

## The report

`review.json` is every review's complete canonical result. Use the existing contract for the change and sources, requirements/status, verdict, evidence-backed findings, current/target structure, recommendations/steps, block/unit map, questions, ideas, coverage and applicable manual/visual checks. A later HTML request must not trigger their reconstruction.

Follow the data contract for source preservation, localization and validation; passing the script establishes structure, not truth.

Derive the human-facing response from the canonical report; do not maintain a competing set of findings in prose. Lead with the conclusion and the recommendation: accept, fix in place, or reshape toward the target. State what the change is for, what decides the recommendation, and the material limits of the review. When the target differs, briefly distinguish the solution now from the proposed one and give the ordered changes, referring to findings by number. Avoid using finding count as a quality score.

Present findings by impact, each once, with direction, evidence level, source location, demonstrated problem and smallest sufficient fix. Link affected requirements and distinguish findings, unresolved questions and optional ideas. Derive grounded manual scenarios and visual limitations as the data contract specifies. Omit empty sections in the short response; link the complete `review.json` and surface limits that materially change the recommendation.

When the user asks for an interactive report, render the already prepared `review.json` against its recorded source snapshot using [references/interactive-report.md](references/interactive-report.md). All report data and the selected language are already present. Only supported external presentation options or a separate display wrapper may vary; canonical JSON stays byte-identical and no new findings, requirements, targets or manual scenarios are gathered. If rendering exposes a substantive omission or new evidence warrants a change, make an explicit revised review record and identify the new analysis; do not present that as display-only work. Rendering a report is not authorization to apply the changes marked in it.

## Modes

One reviewer covering the whole procedure and all four directions is the default.

When the user explicitly asks for independent reviewers, start one per requested direction, four for a full review. Give each the same diff and base, task, project instructions, limits, and this skill's full path. Each prepares its own connected map, checks decomposition and sketches the target; it then reviews its assigned direction, noting other evidence it encounters, and refutes its candidates. Give reviewers neither suspected findings nor one another's results.

Each focused reviewer returns structured report data for the scope it actually examined, marking other directions as unreviewed. When they return, reopen the cited code, merge duplicates and resolve disagreements from evidence. Agreement between reviewers is not evidence. Produce one connected map, one coherent target and one canonical `review.json` covering the requested directions; trace every requirement and mapped rule through that merged target and identify anything unreviewed. If independent reviewers cannot be started, say so rather than silently substituting a single reviewer. In an [orchestrate](../orchestrate/SKILL.md) run, these reviewers are its [cross-reviewers](../orchestrate/references/roles.md).
