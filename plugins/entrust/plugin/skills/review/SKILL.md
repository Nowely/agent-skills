---
name: review
description: >-
  User-invoked review of a change, branch or PR: assess solution quality, unnecessary code,
  responsibility boundaries, behavior and tests, with one reviewer or independent reviewers by direction.
disable-model-invocation: true
metadata:
  version: "0.38.0"
license: MIT
---

# Review

Find the cleanest solution to the task in this codebase, and explain how the change compares with it. Cleanest means the result, not the diff: correct behavior, comprehensible code, cohesive rule ownership and justified concepts, judged by [the design standard](references/design-standard.md). Code the change wrote may be reshaped toward that target; code it did not touch stays, and a problem there is pre-existing. A review can find a design problem without finding a functional defect; a sound design can keep several related rules in one function.

Review only: change no project code and post no comments unless asked. Keep to the user's scope and execution limits. Save review artifacts in the user's permitted output location, outside the source tree by default; where writing artifacts is not allowed, return the result inline and state that it was not saved. Never describe a read-through or a proposed manual scenario as an executed check.

## Preparation

Identify the exact diff and base, the task, and the project instructions. State the goal and its source. Extract numbered requirements with source labels: `task`, `discussion`, `question` or `assumption`; include a reference to the actual source. A task's recorded decision remains a requirement when code contradicts its premise: record the contradiction and the decision needed, rather than silently replacing it. An unapproved author rationale or stale project doc is an assumption, not a binding requirement: when an authoritative contract refutes it, recommend removing the unnecessary mechanism directly.

Read the changed files and the base version of rewritten logic. Follow changed inputs from their producers, changed outputs to their consumers, and changed functions to their callers. Read the existing parser, validator, utility or neighboring implementation that already does this kind of work. Look for other places that compute or display the same fact.

Establish reachable entries and boundary contracts. Entries are repository callers, task-specified inputs, schedules and events. At a boundary, identify which side guarantees what and cite the code or type that establishes it. For dependencies, identify the lockfile version and inspect the installed version's types or implementation relevant to the claim. For stored data, inspect the relevant writers, imports and migrations, including older writers when their data can remain. An unavailable contract stays unknown; a neighboring function or different version does not establish it.

Read [references/report-data.md](references/report-data.md), the data and verification contract, and the design standard for every review so the analysis can populate the report as evidence is collected. HTML is a separate, optional presentation of that same record.

Scope and reading prepare the first analytical step below. If the change or a requested direction cannot be covered whole, review bounded parts in risk order and follow the partial-review rule in [the data contract](references/report-data.md#lifecycle-and-verification).

## Procedure

### 1. Analyze the connected code

Analyze the changed code, including for a short review without an interactive report. Continue reading wherever the analysis exposes a missing connection.

Keep one compact, source-backed analysis record, in Markdown or JSON, with references between its parts:

- **Requirements:** id, required behavior, source and source reference. Add verification status and any contradiction as the review progresses.
- **Changed decisions:** each decision or independently removable part, such as a branch, guard, parameter, request, constant, test or cohesive function body; its source location, containing unit where applicable, behavior, and requirement or necessary integration/check it serves. Investigate an unexplained part; an absent requirement link alone is not proof of redundancy.
- **Units and connections:** each changed unit with real logic, its responsibilities, the units it uses, and the existing units that call it or that it calls. Include source locations for unchanged code and trace through relevant dependencies far enough to explain the changed behavior and ownership. For a unit that decides, record its rules: inputs, conditions, outcomes and precedence when rules overlap. Include shared mutable decision state and external or time-dependent effects where they connect parts or affect ownership. Show the connected implementation, not just a list of changed files.
- **Mechanisms:** examine meaningful behaviors or coordination concepts, not helpers: a refresh includes trigger, state, cancellation and consumer. Record purpose, basis, benefit and cost. For added/changed mechanisms, answer `instead` from producers, existing utilities or installed contracts: where the capability already exists and where you read it, or the places read that do not supply it. An empty inventory is valid when no mechanism is material.
- **Evidence and limits:** reachable entries, contract references, relevant existing utilities and unread boundaries. Record each once and refer to it from decisions, units and findings.

Use the same record for later findings and presentation; do not copy relationships into several parallel tables. Dispositions are provisional until refutation. For a complete review, read the entire diff and relevant available connected code, accounting for changed decisions, resolving unit references, stating rule order and recording unavailable boundaries. Record exact source locations and facts as evidence is collected; deferred line mapping does not mean the code was unread.

### 2. Check responsibility boundaries and decomposition

Assess readability, rule ownership and dependencies: split intertwined logic, merge scattered ownership, simplify in place, or keep. When a plausible concrete change helps assess a structural tradeoff, record it before the target as a scenario grounded in the task or code, with the places to edit and code to read today. A simple or clean change may need none. Record each unit's decision with its `reason`, a kept unit included.

Trace each mechanism's owner, inputs, effects and lifetime. Distinguish missing context from entanglement: overwritten state, flags crossing rules, unrelated work needed to establish an outcome, a scattered rule, or a caller interpreting another unit's partial result. A useful scenario shows what must be understood or changed together; tracing difficulty alone is a lead.

Compare in-place simplification, separating decisions from effects, consolidation, extraction or removal as useful. For a material burden, sketch the simplest plausible alternative: compare readability, rule ownership, dependencies and boundary or coordination cost. Trace required rules and precedence; preference alone is not an improvement.

Keep obvious guards and cohesive ordered decisions together; length and helper counts do not decide. Read [the structural examples](references/structure-examples.md) before finalizing this assessment.

### 3. Sketch the target

Before the detailed passes, sketch the smallest solution supported by the requirements and contracts: its units, what each owns, what it reuses, and which mechanisms it needs. This is a provisional comparison, not a commitment to preserve the implementation's premises.

Trace requirements, rules and scenarios through the target, including edits and reads. Preserve timing, failure, retry, reload and no-further-input behavior required by the task, owner decision or contract, citing the source. Check the source of a mandatory rule separately from whether a source requires its automatic trigger: the rule alone does not establish that trigger. For a material mechanism of unestablished necessity, sketch the simplest available alternative without it: what triggers required behavior, which inputs it uses, what behavior, convenience or recovery is lost, if any, and what risks or boundary costs it introduces; mark unknowns or why no alternative is established. Compare benefit and cost; absence from the task alone does not mandate removal. Record a material unresolved tradeoff in the mechanism and an owner question or idea. A provisional recommendation is not an owner decision; record uncertainty about whether it works separately. Avoid questions about minor conveniences. Show conflicts between required decisions and contracts and which target parts depend on their resolution. Say if the structure is appropriate; update the target with evidence.

### 4. Review all four directions

Finish every direction, even after a serious finding. Collect candidates and unexplained code; refute them in the refutation step rather than discarding uncertain ones during collection.

#### Behavior

- Trace requirements across affected paths and the smallest connected group sharing an invariant, including unchanged peers. Check that group under the same reachable transition; report behavioral inconsistency, not differing syntax. Compare with the base for behavior outside the task.
- Run concrete values through changed branches by hand: comparison boundaries, empty and singleton inputs, absence the contract permits, repeated input and a failure partway through. Check security, data integrity, concurrency and performance where the changed path makes them relevant.
- Follow errors and fallbacks to what the caller or user observes. Establish whether the handling meets the contract; logging or fallback alone does not prove either correctness or a defect.
- For requested or material visual questions, follow [Visual evidence](references/report-data.md#visual-evidence); reuse task images within authorized scope.

#### Necessity

- For each mechanism and each independently removable part—guard, fallback, catch, retry, cache, conversion, option, wrapper, registry, configuration or state—state the premise that requires it. Check that premise against producers, callers and boundary contracts. Classify it as `needed` with evidence, `contradicted` with the removable part, or `unknown` with the missing evidence; weigh any independent benefit before proposing removal. Check guards in parts proposed to keep against proven types, producers and existing predicates; retain justified boundary defenses.
- Settle each mechanism's `instead` from the code and the installed contracts, not from the change's own account of why it is needed. An unsettled `instead` is an unread boundary, not a needed mechanism. Before recommending a new mechanism or interface, identify the required behavior the existing ones cannot express.
- Weigh benefit against cost in `benefit`, `cost` and `decision` as the data contract specifies; include relevant tests and make any proposed loss of optional convenience explicit to its owner.
- For each proposed removal, follow its dependent machinery: data requests, intermediate values, state, loading/error paths, timers and tests. Remove what serves only that mechanism; preserve parts with an independent required job. Explain the complete simplification, not just its first deleted call.

#### Design

Use the decomposition assessment and target to examine the design as a whole:

- **The standard's principles:** check the change against each and show any concrete burden in the code; use a grounded scenario when it helps.
- **Boundary work:** distinguish a producer violating its contract from an adapter translating valid output into the application's representation. Put a proven defect at its owner; keep a necessary adaptation at the appropriate boundary. A documented format difference is not a dependency bug. When a genuine upstream defect cannot be fixed here, assess the local workaround on its own necessity and record the upstream improvement separately.
- **Cost of the proposal:** compare the target with the change by the standard, including the boundaries it adds. A helper that only renames obvious lines, or a split that requires shared mutable state and more coordination, has not demonstrated an improvement.

#### Tests

- For each requirement and risky changed branch, identify the test that catches a plausible regression. A gap names the regression that escapes and the smallest useful test at a level the project already uses.
- Check whether changed tests detect wrong behavior rather than repeating the implementation, pinning scaffolding, or demanding contract-excluded states. Reusing a utility also requires checking that its actual semantics meet this task.
- Report checks actually run and their results separately from code inspection and recommended manual scenarios.

<a id="refuting-a-candidate"></a>

### 5. Refute candidates and reconcile the target

Reopen the supporting code and actively seek a reason each candidate is wrong: a guarantee upstream, a reachable caller's actual input, a required lifecycle behavior, an explicit owner-accepted tradeoff, an existing test, or unchanged behavior in the base.

- **Behavioral defect:** a reachable entry, its path and the wrong observable result. A merely conceivable input unsupported by code or the task is a question.
- **Unnecessary mechanism:** the contract or existing capability that makes it unnecessary, and the required behavior preserved by the whole removal, including behavior over time. If the key dependency contract is unavailable, retain a question instead of asserting equivalence.
- **Design finding:** show the concrete structural burden, its evidence and why the proposed arrangement improves the tradeoff. A grounded scenario can clarify this when useful. It must stand if every behavior finding were fixed in place; otherwise it belongs to those fixes. Label it `judgment`. It needs no functional failure or invented future requirement; an unsupported shape preference is an idea.
- **Test gap:** the meaningful regression that current tests would miss.

Apply the same scrutiny to fixes. Avoid speculative guards, options and layers; show that proposed deletions preserve independent responsibilities. After a major removal, reassess the remaining responsibilities and plumbing on their own merits. Reconcile findings into one target and trace the requirements and rules through it again; do not invent a further finding to fill a category.

A confirmed problem is a finding; an unresolved premise or candidate is a question; an improvement unnecessary to the change is an idea. Behavior omitted by an explicit owner decision is an accepted tradeoff with its source and consequence, not a finding; proposing to drop a binding requirement stays a question or idea until accepted. Mark pre-existing problems separately unless the change worsens or relies on them. An old implementation that the new requirement depends on but that does not meet it is relevant to this review. Merge duplicates without dropping small confirmed problems.

### 6. Report

For complete coverage:

After refutation, map every nonblank changed line to exactly one block and carry the same record into the `review.json` data contract: `requirements`, `blocks`, `units`, `mechanisms` and `coverage` carry the map, with rule details in the unit's `jobs`. Requirement links come from blocks; dependencies come from units. Attribute mechanism weight through blocks under the data contract, or explain why it is unassessed; do not estimate totals from a whole mixed-purpose unit. If mapping exposes an analysis gap, return to the relevant analysis and refutation before finalizing; if coverage remains incomplete, return a partial review instead. Check the complete map against the diff and connected code; preserve and link it when writes are allowed, otherwise include it in the inline JSON. Account separately for non-text diff changes as the data contract says.

For a complete review, finalize `review.json` following [the report](#the-report) and the data contract's verification pass. For incomplete coverage of the diff or requested directions, return the partial review described in the data contract instead. Generate HTML only when explicitly requested and writes are allowed.

## The report

`review.json` is the complete review's canonical result. Use the existing contract for the change and sources, requirements/status, verdict, evidence-backed findings, current/target structure, recommendations/steps, block/unit map, questions, ideas, coverage and applicable manual/visual checks. A later HTML request must not trigger their reconstruction.

Follow the data contract for source preservation, localization and validation; passing the script establishes structure, not truth.

For a complete review, derive the response from the canonical report, not a competing set of findings. Lead with the conclusion and recommendation: accept, fix in place, or reshape toward the target. State the change's purpose, what decides the recommendation and material limits. Surface unresolved owner tradeoffs that materially affect the solution, with alternatives and consequences. When the target differs, distinguish it from the current solution and give ordered changes, referring to findings by number. A structural step explains the burden without it; cite a scenario when useful. Finding count is not a quality score.

Present findings by impact, each once, with direction, evidence level, source location, demonstrated problem and smallest sufficient fix. Link affected requirements and distinguish findings, unresolved questions and optional ideas. Derive grounded manual scenarios and visual limitations as the data contract specifies. Omit empty sections in the short response; link the complete `review.json` when saved and surface limits that materially change the recommendation.

When asked for an interactive report, render the complete `review.json` against its recorded snapshot using [references/interactive-report.md](references/interactive-report.md); a partial review has no canonical report to render. Only supported presentation options or a display wrapper may vary: JSON stays byte-identical, with no new analysis. If an omission or new evidence changes the review, create an explicit revised record, identifying the analysis. Rendering does not authorize applying changes.

## Modes

One reviewer covering the whole procedure and all four directions is the default.

When the user explicitly asks for independent reviewers, start one per requested direction, four for a full review. Give each the same diff and base, task, project instructions, limits, and this skill's full path. Each analyzes the connected code, checks decomposition and sketches the target; it then reviews its assigned direction, noting other evidence it encounters, refutes its candidates and finalizes its map when coverage permits. Give reviewers neither suspected findings nor one another's results.

Each focused reviewer returns structured report data for the scope it actually examined, marking other directions as unreviewed; if its diff coverage is incomplete, it returns grounded partial findings and unreached scope instead of claiming a valid full map. When they return, reopen the cited code, merge duplicates and resolve disagreements from evidence. Agreement between reviewers is not evidence. If the reconciled work covers the diff and each requested direction, produce one connected map, one coherent target and one canonical `review.json`; trace every requirement and mapped rule through that merged target and identify anything unreviewed. Otherwise return a partial review. If independent reviewers cannot be started, say so rather than silently substituting a single reviewer. In an [orchestrate](../orchestrate/SKILL.md) run, these reviewers are its [cross-reviewers](../orchestrate/references/roles.md).
