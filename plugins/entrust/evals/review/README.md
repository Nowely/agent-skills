# Review skill: the measuring instrument

What a version of [the review skill](../../plugin/skills/review/SKILL.md) is measured with. A round gives fresh reviewers a change to review, with or without a version of the skill, and a judge grades each review against a rubric the reviewer never saw. `node evals/review-eval.test.mjs` checks the instrument itself and calls no model; a round is run by hand, by anyone with a model to run it on.

## Cases

Each directory under `cases/` is a small fictional repository with the task its author was given, `brief.md`, in three states: `base/` before the change, `head/` the change as it was first written, and `clean/` the change as it should be. `accept.mjs` holds the brief's requirements as checks: all of them pass on `clean/`, and `head/` fails exactly the ones `rubric.json` lists. Both variants are reviewed. A review of `head/` is asked for what leads from it to `clean/`; a review of `clean/` is asked to leave good code alone.

| Case | `head/` | `clean/` |
|---|---|---|
| `contact-import` | one hundred-line function that parses, validates, resolves duplicates, writes and reports, re-implementing a parser and a validator the repository has, with an unused mode, a retry and a silent special case | a plan decided before anything is written, in three short functions over the existing parser and validator |
| `overdue-notice` | a notification framework of nine files for one email, whose indirection hides that the email has no content and is sent every night | one step function of twenty lines, called as the job's other step is |
| `currency-contract` | a fallback and a whitelist in two screens for a currency the installed dependency never omits, read off a stale page; the export forgotten | one conversion where the only lower-case source, the archive, is read |

A rubric item is a `find`, with the direction it belongs to (behavior, necessity, design, tests), or a `trap`: a claim a reviewer is tempted to make and the code contradicts. `head` has both; `clean` has only traps, and there the count of unsupported claims is the result.

## A round

1. **Arms.** Freeze each skill version under test as a numbered file in the research run. `node evals/review/round.mjs <directory> control name=instructions.md ...` prepares every case in both variants once per arm and writes `<directory>/runs.json` with each arm's instruction digest. Run it again on the same directory for another repetition.
2. **Reviewers.** Give each `prompts/<run>.txt`, unchanged, to a fresh reviewer that has seen no other run, with the same model, effort and tools in every arm, and save its final message as `returns/<run>.md`.
3. **Judge.** Per case and variant, give one judge [judge.md](judge.md), the case directory and that target's reviews, named by run id only: six calls for the three cases. The judge is not told the arms and is not the model family under test when another is available. Collect its objects as `<directory>/verdicts.json`.
4. **Record.** Add the model and effort to the record, and report every run that started, including the ones that failed or were excluded and why. `node evals/review/score.mjs <directory>` prints the table.

## Reading the table

On `head` rows, recall is hits plus half the partials over the find items; the design and necessity items are the ones the skill exists for. On `clean` rows there is nothing to find: traps violated and unsupported claims are the whole result, and a version that finds more on `head` by claiming more on `clean` has not improved. Neither count is folded into recall. `Other valid` counts true findings the rubric did not list; a case that collects many needs its rubric extended, which starts a new round.

One run per cell shows that the instrument works and little about which arm is better: the same instructions gave different outcomes in consecutive rounds of [the first experiment](../../research/2026-11-11-review-skill/rounds.md). A difference between arms is a result when it holds across cases and repetitions; say how many of each a round ran.

## What it cannot show

The cases are a few hundred lines of JavaScript each and can be read whole. They do not show how a review behaves on a change too large to read whole or in another language. The instructions under test and the cases have one author, and the traps are the temptations that author thought of.
