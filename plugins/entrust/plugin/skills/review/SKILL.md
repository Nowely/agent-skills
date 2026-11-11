---
name: review
description: >-
  User-invoked code review of a change, branch or PR: finds what is wrong, unnecessary, badly structured
  or untested, each with the line that shows it, and says what the smallest clean solution looks like,
  with one reviewer or with independent reviewers by direction.
disable-model-invocation: true
metadata:
  version: "0.36.0"
license: MIT
---

# Review

Give the author a review they can act on without repeating your work: everything in the change that is wrong, unnecessary, badly structured or untested, each with the line that shows it; what you could not explain, as questions; and the shape of the smallest clean solution, so that the findings add up to a direction. Review only: change no code and post no comments unless asked. Keep to the scope and limits the user set; where you may not run code, say what a run would settle.

## Procedure

Do the steps in order. Steps 1 to 5 collect and do not filter; step 6 filters. Finish all four passes of step 4 before going on, even after a serious find.

1. **Scope.** Identify the exact change (the diff against its base), the task behind it and the project instructions that apply. Write the task as a numbered list of requirements; where none is stated, take it from the PR or commit text and say so. A change too large to read whole is reviewed unit by unit in order of risk, and the report lists what was not reached.
2. **Read around the change.** Read each changed file whole, and the base version of what was rewritten. For each changed function, open its callers, the source of each input and the consumers of its output. Find how the project already does this kind of thing: its parser, its validator, the neighbouring step of the same job. Search for code elsewhere that shows or computes the same thing and was not changed.
3. **Map the change.** Split the diff into blocks: the smallest groups of lines that make one decision and could be kept, changed or removed on their own, such as a function, a branch, a guard, a parameter, a constant, a test. Every changed line belongs to one block. For each block note what it does and what it serves: the requirement it implements, or the integration or check that requirement cannot do without. Ask of each: if it were removed, which requirement would fail? A block that serves nothing is a candidate to delete; a requirement no block serves is a candidate to add.
4. **Four passes.** Go through the blocks once for each [direction](#directions) and note every candidate: a problem, or something that only looks odd.
5. **Target.** Sketch the smallest solution that meets the requirements in this codebase: its units, what each owns, what it reuses, and which blocks of the map it keeps. What the change has beyond it is a candidate to delete; what it lacks, a candidate to add. If the change already is that solution, say so: a good change gets a short review.
6. **Refute.** Try to prove each candidate wrong, as [Refuting a candidate](#refuting-a-candidate) says. What survives is a finding; what you can neither prove nor refute is a question.
7. **Report** in [the report's shape](#the-report).

## Directions

In every pass, also note what you cannot explain: a parameter nothing reads, a branch nothing reaches, a constant with no source, a special case no requirement asks for, a comment that says "temporary", a comment the code contradicts.

### Behavior

- For each requirement, find the lines that implement it. A requirement with no lines, or met in only some of the places that need it, is a finding.
- Compare with the base: what works differently now that no requirement asked to change?
- Run concrete values through each changed branch by hand: both sides of every comparison and the value on its boundary; the first, the last and the only element; a value the contract allows to be absent; the same input twice; a failure halfway through.
- Follow each error to where it is handled and to what the user or the caller learns. An error that is caught and only logged, or a lookup that falls back silently, hides the failure from whoever must act on it.
- Check security, data integrity, concurrency and performance where the change touches them, under the callers and load the project supports.

### Necessity

- Take each block of the map that is a mechanism: a guard or null check, a fallback or default, a try/catch, a retry, a cache, a conversion, an option or mode, a wrapper, a registry, a configuration, a new piece of state.
- For each, write the assumption that makes it necessary ("the currency can be missing"), then check it at its source: the code that produces the value, the schema or type, every caller. It ends as `needed` (cite the source), `contradicted` (a finding: say what to delete and what still works) or `unknown` (a question: say what would settle it).
- The source is the one the code runs with. For a dependency, take its version from the lockfile and read that installed package's types or code, not a document, a comment or another copy of the package. For stored data, find every writer: the current code, older code, imports, migrations.
- Judge each mechanism on its own evidence. One unnecessary guard says nothing about the next one.
- Check whether the project already has this: a utility, a check upstream, the callee itself. Code that re-implements it is a finding, and so is each place where the copy behaves differently.

### Design

Judge how the blocks are grouped into units, against the target of step 5, in both directions.

- **Too little structure.** A function that does several jobs, such as reading input, validating, deciding, writing and formatting, or that decides and writes in the same loop. The blocks of a unit show its jobs. Where one job cannot be tested, changed or reused without the others, propose the split: blocks named by what they do, deciding kept apart from doing, and a main function that reads as the list of its steps.
- **Too much structure.** An abstraction with one implementation, a layer that only forwards, a registry, an event or a configuration for a fixed set of one, a generic engine where one function would do. Propose the direct form, and name the project's own precedent for it.
- **A crutch.** A special case, retry, delay, de-duplication or fallback in a consumer that makes up for a wrong value coming from somewhere else. Find the unit that produces the wrong value and propose the fix there: one fix at the source replaces a patch in every consumer.
- **Ownership.** One fact or rule defined in two places; logic in a unit that does not own it, so that other consumers cannot use it; a function that changes its arguments; a parameter that switches between behaviors; a caller that must know its callee's internals; a name that says something other than what the code does.
- **Measure.** A block earns a name when it has one job and its own reason to change. Propose no function that only hides two lines, no class where a function serves, and no pattern, unless you can name the change it makes easier. Cohesive code stays together.

### Tests

- For each requirement and each risky branch from the behavior pass, name the test that fails when it breaks. Where there is none, that is a gap: say which regression gets through.
- For each test in the change, break the code in your head and ask whether the test fails. A test whose expected value was copied from the output, a mock that restates the implementation, a test of the scaffolding instead of the requirement, and a test that pins behavior the contract excludes all pass for the wrong reason.
- Ask for no test of a state that cannot occur.

## Refuting a candidate

Reopen the cited code and look for what makes you wrong: a check upstream, a contract, callers that never pass the value, an existing test, the same behavior in the base.

- **A defect** needs a trigger a supported caller can produce, the path from it, and the wrong result. Without a trigger it is at most a question.
- **A removal or simplification** needs the required behavior to survive it. Say what would change.
- **A design finding** needs the job or change the structure makes harder, and the structure you propose instead. It is a judgment; label it one.
- **A test gap** needs the regression that passes today.
- **Your own fix** passes the necessity test too: propose no guard, fallback, retry, option, layer or pattern for an input or a future you have not shown.

A requirement the change leaves to old code that does not meet it is the change's finding. Drop style and taste, advice without a scenario, and duplicates. A problem the base already had, which the change neither worsens nor relies on, goes in one separate line. Do not drop a candidate for being small or because you are unsure: unsure is a question.

## The report

    ## Verdict
    Two or three sentences: whether the change does its task, and what matters most.
    Target: the smallest clean solution in two to four lines (its units, what each owns, what it reuses)
    and what of the change survives in it; "the change is already this" when it is.

    ## Findings
    Ordered by impact, each as:
    ### <n>. <what is wrong> (<behavior | necessity | design | tests>; <ran | traced | judgment>)
    `path:line`: what happens, with the trigger and the result; or what is unnecessary, with the source
    that shows it; or which job or change the structure makes harder.
    Fix: the smallest change.

    ## Change map
    One line per block, in the order of the diff: `path:lines`, what it does, what it serves (a requirement
    by its number, or "nothing"), then keep, fix or remove, with the number of its finding.
    Then each requirement no block serves, and each changed unit with real logic as: the unit, its jobs,
    then keep, split or remove.

    ## Questions and oddities
    One line each: where, what is unexplained, what would settle it.

    ## Coverage
    What you read beyond the diff, and what you could not check.

Paths are relative to the repository. `ran` means you executed it and saw the result, `traced` that you followed the code path you cite, and `judgment` a maintenance opinion with its cost named. An empty section says "none". Write each finding once, as briefly as its evidence allows.

## Modes

One reviewer doing all of the above is the default.

When the user asks for independent reviewers, start one per direction, four for a full review. Give each the same change, task, project instructions and limits, this page to read whole by its path, and its direction: it does steps 1 to 3 and 5 in full, step 4 for its direction while noting whatever else it meets, then steps 6 and 7. Give none of them a suspected finding or another reviewer's result. When they return, reopen the lines each finding cites, since two reviewers agreeing is not evidence; merge duplicates, settle contradictions by reading the code, and write one report with one target. If you cannot start reviewers, say so; do not fall back to one reviewer silently. In an [orchestrate](../orchestrate/SKILL.md) run these reviewers are its [cross-reviewers](../orchestrate/references/roles.md).
