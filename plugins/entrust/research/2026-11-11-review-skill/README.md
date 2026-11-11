# Review skill: experiment and evaluation

The goal is a review that reports every problem in a change, behavior errors, unnecessary mechanisms, unclear boundaries and tests that would miss a regression, and what it could not explain, each grounded in the code, from a model of Sonnet's class. The skill supports one reviewer or independent reviewers by direction.

## Rounds 1 to 10: one private change

A first experiment used one non-public change as a fixed target, with a fresh reviewer per round and no execution. Ten reviews were run while the instructions changed; independent reviewers assessed results and earlier instructions were retained. The per-round classification is in [rounds.md](rounds.md). This is formative evidence, not a controlled before/after result: the target, model family, and evaluator were not varied, and only one review was run for most revisions. The original task, code, logs, and identifying details are not included.

[fixtures](fixtures/) holds the two single-file fictional cases prepared in that experiment; one review read the positive case ([rounds.md](rounds.md#fictional-fixture-pilot)). They stay as that run's input. Later rounds use the cases of the instrument below.

## Round 11: a procedure and an instrument

The table of rounds 1 to 10 cannot say which wording helped. Drafts 06 and 07 are one file, as are 08 and 09, and each pair's two reviews were classified differently; one review per draft does not separate a draft's effect from a run's. Round 11 therefore adds the means to measure before changing more wording.

- [The instrument](../../evals/review/README.md) lives with the plugin's other evals: three fictional repositories in two states, rubrics with traps, a proof that makes each fact a rubric relies on happen, a script that prepares a blind run and one that scores a judge's verdicts. `evals/review-eval.test.mjs` checks it without a model.
- [drafts/11-procedure.md](drafts/11-procedure.md) is the page as committed: the same four directions as a numbered procedure that collects candidates in separate passes, refutes each one, and reports in a fixed shape with a place for what stayed unexplained. It is invoked by the user only, and orchestrate's cross-reviewer follows it. The draft's author also wrote the cases, the same day.

A pilot on Sonnet and a round on Terra followed ([rounds.md](rounds.md#round-11-terra-round)). On Terra, either draft found what no instructions missed, an unreachable catch, an unused option and a rule implemented twice; drafts 10 and 11 differed by one item in thirty-two while draft 11's reviews were 1.8 times as long; no review stepped into a trap. On the private change, draft 11 established no dependency contract and proposed no decomposition, as draft 10 had not.

## Round 12: a target, and cases that have one

The round's three cases were solved by every arm, so they are retired, and the instrument now holds cases written for what the skill is for: a change that works badly because it is built badly. Each has the change as it was first written and as it should be, and both are reviewed ([the instrument](../../evals/review/README.md)): one function doing five jobs against a plan in three short ones, a framework of nine files against one step function, guards read off a stale contract against one conversion at the source. The checks that state each brief pass on the clean form and fail on the other where its rubric says.

[drafts/12-target.md](drafts/12-target.md), the page as committed, changes draft 11 in four places, each a hypothesis the next round tests:

- a step that sketches the smallest clean solution before findings are filtered, and a line for it in the verdict, so that findings add up to a direction;
- a design pass that judges structure in both directions, too little and too much, names the crutch as its own kind, and leaves one line per changed unit in the report, so that the examination can be seen;
- draft 10's rule for a dependency, its version from the lockfile and the installed package rather than a document or another copy, and its counterpart for stored data, every writer;
- a report of half the fields: a finding is its place, what happens and the fix.

Nothing about draft 12 is measured. The round to run: `control`, draft 11 and draft 12 over the three cases in both forms, and one review of the private change with draft 12.
