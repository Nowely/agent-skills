# Review skill: the measuring instrument

What a version of [the review skill](../../plugin/skills/review/SKILL.md) is measured with. A round gives fresh reviewers a change to review, with or without a version of the skill, and a judge grades each review against a rubric the reviewer never saw. `node evals/review-eval.test.mjs` checks the instrument itself and calls no model; a round is run by hand, by anyone with a model to run it on.

## Cases

Each directory under `cases/` is a small fictional repository in two states, `base/` and `head/`, with the task its author was given in `brief.md`. `rubric.json` lists what a review should find and what it should not claim, and `proof.mjs` makes each fact the rubric relies on happen in the case's code.

| Case | What it asks of a reviewer |
|---|---|
| `delayed-label` | tell a guard the contract makes unreachable from one the contract requires; notice a consumer the change left out; find a boundary error behind a date format |
| `webhook-retry` | a change that is mostly right: find the one regression against the base and leave the required mechanisms alone |
| `loyalty-discount` | a rule woven through a function: a side effect that reaches the caller, a rule the task said not to change, and a structure worth one named step and no more |

A rubric item is a `find`, with the direction it belongs to (behavior, necessity, design, tests), or a `trap`: a claim a reviewer is tempted to make and the code contradicts. Every case has traps, so a reviewer who flags everything does not score best.

## A round

1. **Arms.** Name the instruction files to compare and record each one's SHA-256. The control arm has no instructions. Freeze a skill version under test as a numbered file in the research run before the first reviewer starts.
2. **Reviewers.** For every case and arm, as many times as the round repeats, run `node evals/review/prepare.mjs <case> [instructions.md]`. It prints a run directory and a prompt. Give the prompt, unchanged, to a fresh reviewer that has seen no other run; the reviewer's model, effort and tools are the same in every arm. Save its final message as the run's review, under an id that does not name the arm.
3. **Judge.** Give a judge [judge.md](judge.md), the case's `rubric.json`, its `base/` and `head/`, and one review at a time, named by run id only. The judge is not told the arms and is not the model family under test when another is available. Collect its JSON objects as `verdicts.json`.
4. **Record.** Beside the reviews keep `runs.json`, one `{run, case, arm, review}` per run with the model, the effort and the instruction digest, and report every run that started, including the ones that failed or were excluded and why. `node evals/review/score.mjs <directory>` prints the table.

## Reading the table

Recall is hits plus half the partials over the case's find items. Trap violations and unsupported claims are counted beside it and never folded in: a version that finds more by claiming more has not improved. `Other valid` counts true findings the rubric did not list; a case that collects many needs its rubric extended, which starts a new round.

One run per arm shows that the instrument works and nothing about which arm is better: the same instructions gave different outcomes in consecutive rounds of [the first experiment](../../research/2026-11-11-review-skill/rounds.md). A difference between arms is a result when it holds across repetitions and across cases; say how many of each a round ran.

## What it cannot show

The cases are a few hundred lines of JavaScript each, written to be read whole. They do not show how a review behaves on a change too large to read whole, in another language, or in a repository whose contracts live in installed dependencies. The traps are the temptations the author of the cases thought of.
