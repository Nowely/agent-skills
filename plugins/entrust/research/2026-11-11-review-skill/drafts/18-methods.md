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

Give the author a review they can act on without repeating your work: everything in the change that is wrong, unnecessary, badly structured or untested, each with the line that shows it; what you could not explain, as questions; what would make it better without being a problem, as ideas; and the shape of the smallest clean solution, so that the findings add up to a direction. Review only: change no code and post no comments unless asked. Keep to the scope and limits the user set; where you may not run code, say what a run would settle.

## Procedure

Do the steps in order. Steps 1 to 5 collect and do not filter; step 6 filters. Finish all four passes of step 4 before going on, even after a serious find.

1. **Scope.** Identify the exact change (the diff against its base), the task behind it and the project instructions that apply. Say in a sentence what the change is for and why, and note each source you took that from: the task text, the PR, an issue, the commits, a mockup. Write the task as a numbered list of requirements, each with where it comes from: the task, a decision taken in discussion, a question left open, or an assumption, yours or the author's. A requirement that rests on a claim the code or a contract contradicts stays in the list: say what contradicts it, for whoever decided it. A change too large to read whole is reviewed unit by unit in order of risk, and the report lists what was not reached.
2. **Read around the change.** Read each changed file whole, and the base version of what was rewritten. For each changed function, open its callers, the source of each input and the consumers of its output. Find how the project already does this kind of thing: its parser, its validator, the neighbouring step of the same job. Search for code elsewhere that shows or computes the same thing and was not changed. Write two lists the later steps cite:
   - **Entries.** What starts the changed code: each caller in the repository, each input the task names, each schedule or event. A trigger is one of these.
   - **Contracts.** For each boundary the change crosses, a function it calls, a dependency, stored data, the caller it serves: which side guarantees what, and the line that says so in the code that runs. For a dependency, take its version from the lockfile and read that installed package's types or code, not a document, a comment or another copy of the package. For stored data, find every writer: the current code, older code, imports, migrations.
3. **Map the change.** Split the diff into blocks: the smallest groups of lines that make one decision and could be kept, changed or removed on their own, such as a function, a branch, a guard, a parameter, a constant, a test. Every changed line belongs to one block. For each block note what it does and what it serves: the requirement it implements, or the integration or check that requirement cannot do without. Ask of each: if it were removed, which requirement would fail? A block that serves nothing is a candidate to delete; a requirement no block serves is a candidate to add. Then list the units: each function, class or module with real logic that the change adds or alters, with its jobs, read off its blocks, and the units it uses; and the existing units that call it or that it calls.
4. **Four passes.** Go through the blocks once for each [direction](#directions) and note every candidate: a problem, or something that only looks odd.
5. **Target.** Sketch the smallest solution that meets the requirements in this codebase: its units, what each owns and which units it uses, what it reuses, and which blocks of the map it keeps. What the change has beyond it is a candidate to delete; what it lacks, a candidate to add. If the change already is that solution, say so: a good change gets a short review.
6. **Refute.** Try to prove each candidate wrong, as [Refuting a candidate](#refuting-a-candidate) says. What survives is a finding; what you can neither prove nor refute is a question; what is no problem of the change and would still make it better is an idea.
7. **Report** in [the report's shape](#the-report).

## Directions

In every pass, also note what you cannot explain: a parameter nothing reads, a branch nothing reaches, a constant with no source, a special case no requirement asks for, a comment that says "temporary", a comment the code contradicts.

### Behavior

- For each requirement, find the lines that implement it. A requirement with no lines, or met in only some of the places that need it, is a finding.
- Compare with the base: what works differently now that no requirement asked to change?
- Run concrete values through each changed branch by hand: both sides of every comparison and the value on its boundary; the first, the last and the only element; a value the contract allows to be absent; the same input twice; a failure halfway through.
- Follow each error to where it is handled and to what the user or the caller learns. An error that is caught and only logged, or a lookup that falls back silently, hides the failure from whoever must act on it.
- Check security, data integrity, concurrency and performance where the change touches them, under the callers and load the project supports.
- When the change alters what the user sees, work from the pictures you were given: the mockup, the screen before and the screen after. Compare them screen by screen and state by state. A difference from the mockup that has a reason, in the task or in a limit of the design system, is noted with that reason; one without is a finding, and so is a difference from before that no requirement asks for. A state the mockup does not show, such as empty, loading, error, long text or a narrow screen, is a question. Do not start the application to take pictures unless the user said to: say which screens you could not compare and which picture would settle each.

### Necessity

- Take each block of the map that is a mechanism: a guard or null check, a fallback or default, a try/catch, a retry, a cache, a conversion, an option or mode, a wrapper, a registry, a configuration, a new piece of state.
- For each, write the assumption that makes it necessary ("the currency can be missing"), then check it against the contracts of step 2: the code that produces the value, the schema or type, every caller. It ends as `needed` (cite the source), `contradicted` (a finding: say what to delete and what still works) or `unknown` (a question: say what would settle it).
- Judge each mechanism on its own evidence. One unnecessary guard says nothing about the next one.
- Check whether the project already has this: a utility, a check upstream, the callee itself. Code that re-implements it is a finding, and so is each place where the copy behaves differently.

### Design

Judge how the blocks are grouped into units and how the units depend on each other, against the target of step 5. Do it with a test: take each requirement in turn as the one that changes, and note the units and blocks that change would touch.

- **Interleaved.** Two requirements that can change apart, whose blocks alternate inside one unit: to change one you read the other. Propose the split along them, blocks named by what they do, deciding kept apart from doing, and a main function that reads as the list of its steps.
- **Scattered.** One requirement whose change touches several units that nothing else changes. Propose bringing it together.

- **Too much structure.** An abstraction with one implementation, a layer that only forwards, a registry, an event or a configuration for a fixed set of one, a generic engine where one function would do. Propose the direct form, and name the project's own precedent for it.
- **A crutch.** A special case, retry, delay, de-duplication or fallback in a consumer that makes up for a wrong value coming from somewhere else. Find the unit that produces the wrong value and propose the fix there: one fix at the source replaces a patch in every consumer. Where the source is a library the project cannot change, the patch stays, and the fix in the library is an idea, with the condition under which the patch goes.
- **Ownership.** One fact or rule defined in two places; logic in a unit that does not own it, so that other consumers cannot use it; a function that changes its arguments; a parameter that switches between behaviors; a caller that must know its callee's internals; a name that says something other than what the code does.
- **Dependencies.** Follow who uses whom from the entry point to the effect. A requirement whose path runs through more units than the project's own steps of this kind take; a cycle; a low-level unit that knows the one built on it; two units that every such requirement changes together; a unit placed outside the directory or layer where the project keeps its kind; an export nothing uses.
- **Measure.** Size is no reason to split, and neither is a count of jobs: requirements that only change together stay together. Propose no function that only hides two lines, no class where a function serves, and no pattern, unless you can name the requirement whose change it makes easier.

### Tests

- For each requirement and each risky branch from the behavior pass, name the test that fails when it breaks. Where there is none, that is a gap: say which regression gets through.
- For each test in the change, break the code in your head and ask whether the test fails. A test whose expected value was copied from the output, a mock that restates the implementation, a test of the scaffolding instead of the requirement, and a test that pins behavior the contract excludes all pass for the wrong reason.
- Ask for no test of a state that cannot occur.

## Refuting a candidate

Reopen the cited code and look for what makes you wrong: a check upstream, a contract, callers that never pass the value, an existing test, the same behavior in the base.

- **A defect** needs a trigger that is one of the entries of step 2, the path from it, and the wrong result. A trigger nothing in the repository or the task produces makes it a question: say who would know.
- **A removal or simplification** needs the required behavior to survive it. Say what would change.
- **A design finding** needs the requirement whose change the structure makes harder, what that change touches today, and the structure you propose instead. It is a judgment; label it one.
- **A test gap** needs the regression that passes today.
- **Your own fix** passes the same tests: it names the contract or the entry that makes it necessary, and adds no guard, fallback, retry, option, layer or pattern for an input or a future you have not shown.

A requirement the change leaves to old code that does not meet it is the change's finding. Drop style and taste, advice without a scenario, and duplicates. An improvement the change does not need, with a gain you can name in code removed or a change made easier, is an idea, not a finding; so is a problem the base already had, which the change neither worsens nor relies on. Do not drop a candidate for being small or because you are unsure: unsure is a question.

## The report

    ## Change
    What the change is for, in a sentence, and why, when a source says. Its parts, one line each.
    Sources: where you took the task from.
    Requirements: numbered, each with its source (task, discussion, question or assumption) and how it
    stands: met (ran or traced), fails (its finding), or not checked; then what contradicts it, if
    something does.

    ## Verdict
    Two or three sentences: whether the change does its task, and what matters most.
    Target: the smallest clean solution in two to four lines (its units, what each owns, what it reuses)
    and what of the change survives in it; "the change is already this" when it is.
    Recommendation: accept, fix in place or rewrite as the target, in a sentence; then, when there is
    more than one thing to do, the steps in order, each naming its findings by number.

    ## Findings
    Ordered by impact, each as:
    ### <n>. <what is wrong> (<behavior | necessity | design | tests>; <ran | traced | judgment>)
    `path:line`: what happens and the result; or what is unnecessary; or which change the structure
    makes harder. Name the requirement it breaks.
    Shown by: for a defect, the entry that triggers it, as the caller's `path:line` or the task's
    sentence; for something unnecessary, the line of the contract that excludes it; for structure, the
    requirement and what its change touches; for a test gap, the regression that passes.
    Fix: the smallest change.

    ## Ideas
    Not needed for the change to be accepted. One line each: where, the idea, what it gains and what
    it costs.

    ## Screens
    Only when the change alters what the user sees. One line per screen or state: the pictures you had
    (mockup, before, after), then "matches the mockup" or each difference from it with its reason or the
    number of its finding, or "not compared" and the picture that would settle it.

    ## Structure
    One line per unit of step 3, the existing ones included: `unit -> the units it uses`, its jobs, the
    requirements whose change touches it, then keep, fix, split, merge or remove with the number of its
    finding, or "existing".
    Target: the same lines for the target's units when it differs, each "from the change", "to write"
    or "existing".

    ## Change map
    One line per block, in the order of the diff: `path:lines`, what it does, what it serves (a requirement
    by its number, or "nothing"), then keep, fix or remove, with the number of its finding.
    Then each requirement no block serves.

    ## Questions and oddities
    One line each: where, what is unexplained, what would settle it.

    ## Coverage
    What you read beyond the diff, and what you could not check.
    Contracts: for each one a finding or a fix rests on, the `path:line` you read it at, with the
    dependency's version; "not read" where you did not, and what that leaves open.

Paths are relative to the repository. `ran` means you executed it and saw the result, `traced` that you followed the code path you cite, and `judgment` a maintenance opinion with its cost named. An empty section says "none". Write each finding once, as briefly as its evidence allows; where another section needs it, name it by its number. A finding with nothing to put under "Shown by" is a question. Write the report in the language the user writes to you in, section names included; paths, identifiers and quoted code stay as they are.

When the user asks for the interactive report, write the same report as data and render it, as [the interactive report](references/interactive-report.md) says: a script checks the change map against the diff and draws a page on which the user marks what to apply.

## Modes

One reviewer doing all of the above is the default.

When the user asks for independent reviewers, start one per direction, four for a full review. Give each the same change, task, project instructions and limits, this page to read whole by its path, and its direction: it does steps 1 to 3 and 5 in full, step 4 for its direction while noting whatever else it meets, then steps 6 and 7. Give none of them a suspected finding or another reviewer's result. When they return, reopen the lines each finding cites, since two reviewers agreeing is not evidence; merge duplicates, settle contradictions by reading the code, and write one report with one target. If you cannot start reviewers, say so; do not fall back to one reviewer silently. In an [orchestrate](../orchestrate/SKILL.md) run these reviewers are its [cross-reviewers](../orchestrate/references/roles.md).
