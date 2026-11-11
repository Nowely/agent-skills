# Review skill: experiment and evaluation

The goal is a review that reports every problem in a change, behavior errors, unnecessary mechanisms, unclear boundaries and tests that would miss a regression, and what it could not explain, each grounded in the code, from a model of Sonnet's class. The skill supports one reviewer or independent reviewers by direction.

## Rounds 1 to 10: one private change

A first experiment used one non-public change as a fixed target, with a fresh reviewer per round and no execution. Ten reviews were run while the instructions changed; independent reviewers assessed results and earlier instructions were retained. The per-round classification is in [rounds.md](rounds.md). This is formative evidence, not a controlled before/after result: the target, model family, and evaluator were not varied, and only one review was run for most revisions. The original task, code, logs, and identifying details are not included.

[fixtures](fixtures/) holds the two single-file fictional cases prepared in that experiment; one review read the positive case ([rounds.md](rounds.md#fictional-fixture-pilot)). They stay as that run's input. Later rounds use the cases of the instrument below.

## Round 11: a procedure and an instrument

The table of rounds 1 to 10 cannot say which wording helped. Drafts 06 and 07 are one file, as are 08 and 09, and each pair's two reviews were classified differently; one review per draft does not separate a draft's effect from a run's. Round 11 therefore adds the means to measure before changing more wording.

- [The instrument](../../evals/review/README.md) lives with the plugin's other evals: three fictional repositories in two states, rubrics with traps, a proof that makes each fact a rubric relies on happen, a script that prepares a blind run and one that scores a judge's verdicts. `evals/review-eval.test.mjs` checks it without a model.
- [drafts/11-procedure.md](drafts/11-procedure.md) is the page as committed: the same four directions as a numbered procedure that collects candidates in separate passes, refutes each one, and reports in a fixed shape with a place for what stayed unexplained. It is invoked by the user only, and orchestrate's cross-reviewer follows it. The draft's author also wrote the cases, the same day.

A pilot on Sonnet ran two reviews of one case, drafts 10 and 11, and both found every rubric item ([rounds.md](rounds.md#round-11-sonnet-pilot)). It shows the instrument works end to end and that this case does not separate the two drafts on Sonnet. Whether draft 11 is better than draft 10, or either than no instructions, is not measured.

## What a next round needs

Repetitions, the control arm, the two cases the pilot did not run, and the target model: [a round](../../evals/review/README.md#a-round) says how. A case that every arm solves measures nothing; cases with a contract in an installed dependency, more than one producer of a value, or a change too large to read at once are the ones the first experiment's drafts were written for and the instrument does not have yet.
