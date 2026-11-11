---
name: evidence-code-review
description: Review code changes for correctness, unnecessary complexity, architecture, readability, and meaningful test gaps. Use for change, branch, or PR reviews; supports one reviewer or independent reviewers by direction.
---

# Evidence-based code review

Review the quality of the whole solution: it should satisfy the task, be as simple as the supported behavior permits, and be understandable to maintainers. Do not modify code or publish comments unless explicitly asked. Respect the user's scope and verification constraints.

## Choose a mode

- **Single reviewer (default):** one reviewer covers all requested directions and consolidates the findings.
- **By direction:** when the user requests delegation, assign one independent reviewer to each requested direction; use all four for a full review. Give each the same task, exact change, project instructions, available evidence, and verification constraints, plus their focus. Each reviewer must read this skill, including validation and reporting. Do not provide suspected findings or prior conclusions. Each reviewer may inspect connected code from other directions and report validated findings outside their assigned direction.

Each reviewer validates their candidates. The coordinator checks cited evidence and resolves duplicates or conflicting interpretations; agreement is not proof. If the requested mode is unavailable, explain the limitation instead of silently substituting another mode.

## Establish context

Identify the exact change and read its complete diff, requirements, and applicable project instructions. Trace affected data sources, outputs, callers, and supported user flows. Distinguish task requirements, existing behavior, and implementation choices. If a requirement or contract is unavailable, note the limitation.

## Review directions

### Behavior and scope

- Compare the implementation with each requirement, affected contracts, and project rules. Trace the relevant flows through callers and integration points; identify missing behavior and changes outside the task.
- Trace error paths to their actual handling and user impact. A catch or fallback alone is not a defect. Check security, data integrity, concurrency, and performance where affected, using supported scenarios and expected load.

### Necessity and simplicity

- For each significant new mechanism, identify the required behavior and the assumption that makes the mechanism necessary. Check that assumption against data producers, types, schemas, API contracts, and existing utilities or execution paths.
- Record the behavior, premise, source checked, and result for each significant mechanism. A contradicted premise can indicate a removal candidate; an unresolved premise is a question, not a finding.
- Examine changed functions as a whole, including their conditions, parameters, conversions, and checks. Identify dead code, redundant checks, repeated work, unnecessary options or abstractions, and behavior added without a requirement. Consider what would happen if each substantial part were removed.
- Compare with a simpler path using existing information or capabilities. Check affected supported behavior and explain any change in behavior. Code, tests, and author explanations are evidence to examine, not independent proof that a mechanism is needed. Fewer lines alone do not make a better solution.

### Design and readability

- Identify the rules, responsibilities, and side effects in the changed code. Check whether the main flow and decision order are clear and whether a reader can understand or change one rule without tracing unrelated logic.
- For changed units with nontrivial logic, note their responsibilities before deciding whether their boundaries are clear. Use this to assess structure even when no functional defect is found.
- Examine responsibility boundaries, interfaces, dependencies, names, nesting, and duplication. Consider whether related logic belongs together, independent rules need clearer boundaries, or an existing abstraction obscures more than it helps.
- For each structural concern, identify a concrete reading, modification, or verification task made harder and suggest the smallest clearer structure. Split by responsibility, not by line count; do not add abstractions or indirection merely to make functions shorter. Prefer readable, explicit code over compactness.

### Tests

- Check whether existing tests cover affected behavior and integration points. For each meaningful gap, identify the regression it could catch and whether existing tests already cover it.
- Assess assertions and mocks against the actual contracts: could a material regression pass, or could a test merely repeat an implementation assumption? A missing or weak test does not by itself prove a production defect.

## Validate candidates

Before reporting, look for counterevidence in the relevant callers, guards, handlers, contracts, existing tests, and base revision. Confirm the relationship to the change.

- For a defect, establish supported triggering conditions, the causal path, and a material consequence. A static trace can support a finding; distinguish it from a reproduced failure.
- For a simplification, verify that the alternative satisfies the required behavior and constraints, and identify what would change. If a significant premise remains unresolved, say why it matters and what evidence would resolve it; uncertainty alone is not proof of a defect or unnecessary code.
- Apply the same necessity test to your own suggestions: investigate the premise before proposing another guard, fallback, retry, configuration option, or layer.
- For a structural concern, verify the cited code and explain the practical maintenance cost and proposed boundary. Treat judgment as judgment, not a functional failure.
- Keep pre-existing issues separate unless the change makes them reachable or materially worse, or the user requested broader review.

## Report

Lead with actionable findings, ordered by impact. For each, give the location, relevant evidence, consequence, and a corrective direction. State the basis for expected behavior or the claimed simplification; distinguish proven facts from assumptions.

Keep defects, unnecessary complexity, structural concerns, material unresolved questions, and test suggestions distinguishable. Omit empty finding groups, but state briefly what was examined and concluded in each requested direction. If no actionable findings survive validation, say so. State the reviewed scope, checks performed, and material limitations.

## Skill maintenance

Earlier drafts are archived in [references](references/README.md) for improving this skill; they are not additional review instructions.
