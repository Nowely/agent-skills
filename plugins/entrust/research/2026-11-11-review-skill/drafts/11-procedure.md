---
name: review
description: >-
  User-invoked code review of a change, branch or PR: reports every grounded problem in its behavior,
  necessity, design and tests, and what could not be explained, with one reviewer or with independent
  reviewers by direction.
disable-model-invocation: true
metadata:
  version: "0.36.0"
license: MIT
---

# Review

Give the author a review they can act on without repeating your work: everything in the change that is wrong, unnecessary, hard to change or untested, each with the line that shows it, and everything you could not explain, as a question. Review only: change no code and post no comments unless asked. Keep to the scope and limits the user set; where you may not run code, say what a run would settle.

## Procedure

Do the steps in order. Steps 1 to 3 collect and do not filter; step 4 filters. Finish all four passes of step 3 before reporting, even after a serious find.

1. **Scope.** Identify the exact change (the diff against its base), the task behind it and the project instructions that apply. Write the task as a numbered list of requirements; where none is stated, take it from the PR or commit text and say so. A change too large to read whole is reviewed unit by unit in order of risk, and the report lists what was not reached.
2. **Read around the change.** Read each changed file whole, and the base version of what was rewritten. For each changed function, open its callers, the source of each input (the producing code, the schema, the type, the stored data) and the consumers of its output. Search for code elsewhere that does the same job as the changed code, with the same label, rule, constant or call, and was not changed.
3. **Four passes.** Go through the change once for each [direction](#directions) and note every candidate: a problem, or something that only looks odd.
4. **Refute.** Try to prove each candidate wrong, as [Refuting a candidate](#refuting-a-candidate) says. What survives is a finding; what you can neither prove nor refute is a question.
5. **Report** in [the report's shape](#the-report).

## Directions

In every pass, also note what you cannot explain: a parameter nothing reads, a branch nothing reaches, a constant with no source, a condition that reads inverted, a change the task did not ask for, a comment the code contradicts, two siblings handled differently.

### Behavior

- For each requirement, find the lines that implement it. A requirement with no lines, or implemented in only some of the places that need it, is a finding.
- Compare with the base: what works differently now that no requirement asked to change?
- Run concrete values through each changed branch by hand: each side of every comparison and the value on its boundary; the first, the last and the only element; a value the contract allows to be absent; a second call with the same arguments; the same object used again by the caller.
- Follow each error to where it is handled and to what the user sees.
- Check security, data integrity, concurrency and performance where the change touches them, under the callers and load the project supports.

### Necessity

- List each mechanism the change adds: a guard or null check, a fallback or default, a try/catch, a retry, a cache, a conversion, an option or parameter, a wrapper or layer, a new piece of state.
- For each, write the assumption that makes it necessary ("status can be missing"), then check that assumption at its source: the code that produces the value, the schema or type at the version the project uses, every caller. It ends as `needed` (cite the source), `contradicted` (a finding: say what to delete and what still works) or `unknown` (a question: say what would settle it).
- Judge each mechanism on its own evidence. One unnecessary guard says nothing about the next one.
- Check whether existing code already does this: a utility, a check upstream, the callee itself.
- Ask whether the requirements can be met with fewer concepts, parameters or states. Fewer lines is not the goal.

### Design

- For each changed unit with real logic, list the rules it implements and its side effects. These are working notes, not report text.
- For each rule, pick a likely next change, such as a new threshold or one more case, and count the unrelated code its author must read or could break. Much: a finding, with the smallest structure that separates the rule. Little: leave it.
- Look for one fact or rule defined in two places; logic in a unit that does not own it, so that other consumers cannot use it; a function that decides and also performs effects, or changes its arguments; a parameter that switches between behaviors; a caller that must know its callee's internals; an abstraction with one user; a name that says something other than what the code does; a second way of doing what the project already does elsewhere.
- Cohesive code stays together. Propose no split, pattern or layer unless you can name the change it makes easier.

### Tests

- For each requirement and each risky branch from the behavior pass, name the test that fails when it breaks. Where there is none, that is a gap: say which regression gets through.
- For each test in the change, break the code in your head, by flipping a comparison or deleting a branch, and ask whether the test fails. A test whose expected value was copied from the output, a mock that restates the implementation, and a test that pins behavior the contract excludes all pass for the wrong reason.
- Ask for no test of a state that cannot occur.

## Refuting a candidate

Reopen the cited code and look for what makes you wrong: a check upstream, a contract, callers that never pass the value, an existing test, the same behavior in the base.

- **A defect** needs a trigger a supported caller can produce, the path from it, and the wrong result. Without a trigger it is at most a question.
- **A removal or simplification** needs the required behavior to survive it. Say what would change.
- **A design finding** needs the named change or reading task it makes harder. It is a judgment; label it one.
- **A test gap** needs the regression that passes today.
- **Your own fix** passes the necessity test too: propose no guard, fallback, retry, option or layer for an input you have not shown can occur.

Drop style and taste, advice without a scenario, and duplicates. A problem the base already had and the change does not worsen goes in one separate line. Do not drop a candidate for being small or because you are unsure: unsure is a question.

## The report

    ## Verdict
    Two or three sentences: whether the change does its task, and the problems that matter most.

    ## Findings
    Ordered by impact, each as:
    ### <n>. <what is wrong> (<behavior | necessity | design | tests>; <ran | traced | judgment>)
    - Where: path:line, with the line quoted
    - What happens: the trigger and the result; or what is unnecessary; or which change gets harder
    - Evidence: what you read or ran that establishes it, as path:line
    - Fix: the smallest change

    ## Questions and oddities
    For each: where, what is unexplained, what would settle it.

    ## Coverage
    Each requirement as done, partial or missing, with its location. What you read beyond the diff.
    What you could not check, and why.

`ran` means you executed it and saw the result, `traced` that you followed the code path you cite, and `judgment` a maintenance opinion with its cost named. An empty section says "none".

## Modes

One reviewer doing all of the above is the default.

When the user asks for independent reviewers, start one per direction, four for a full review. Give each the same change, task, project instructions and limits, this page to read whole by its path, and its direction: it does steps 1 and 2 in full, step 3 for its direction while noting whatever else it meets, then steps 4 and 5. Give none of them a suspected finding or another reviewer's result. When they return, reopen the lines each finding cites, since two reviewers agreeing is not evidence; merge duplicates, settle contradictions by reading the code, and write one report. If you cannot start reviewers, say so; do not fall back to one reviewer silently. In an [orchestrate](../orchestrate/SKILL.md) run these reviewers are its [cross-reviewers](../orchestrate/references/roles.md).
