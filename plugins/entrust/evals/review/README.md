# Review skill: the measuring instrument

What a version of [the review skill](../../plugin/skills/review/SKILL.md) is measured with. A round gives fresh reviewers a change to review, with or without a version of the skill, and a judge grades each review against a rubric the reviewer never saw. `node evals/review-eval.test.mjs` checks the instrument itself and calls no model; a round is run by hand, by anyone with a model to run it on.

## Cases

Each directory under `cases/` is a small fictional repository with the task its author was given, `brief.md`, in three states: `base/` before the change, `head/` the change as first written, and `clean/` an alternative change. `accept.mjs` checks observable requirements: all checks pass on `clean/`, and `head/` fails exactly those listed in `rubric.json`. A behavior-correct `head/` can have no failing checks and still be difficult to understand. The general protocol reviews both variants; a scoped round must state any omitted variants and the resulting limits. The [next draft23/25 round](../../research/2026-11-13-review-instead/protocol.md) uses only the original private flawed snapshot. Neither the `clean/` label nor passing checks proves that no finding is possible or that its design is the only good one.

| Case | `head/` | `clean/` |
|---|---|---|
| `contact-import` | one hundred-line function that parses, validates, resolves duplicates, writes and reports, re-implementing a parser and a validator the repository has, with an unused mode, a retry and a silent special case | a plan decided before anything is written, in three short functions over the existing parser and validator |
| `contact-import-v2` | the same import with a clarified input contract and separate criteria for design diagnosis and the proposed target | a planning alternative; retaining or merging it must be judged on its consequences, not the function name |
| `booking-edit` | a behavior-correct preview whose priority is hidden by flag overwrites, with duplicated pricing and a per-call one-entry cache | the same decisions expressed in order, using the existing pricing utility; a single cohesive function is acceptable |
| `overdue-notice` | a notification framework of nine files for one email, whose indirection hides that the email has no content and is sent every night | one step function of twenty lines, called as the job's other step is |
| `currency-contract` | a fallback and a whitelist in two screens for a currency the installed dependency never omits, read off a stale page; the export forgotten | one conversion where the only lower-case source, the archive, is read |
| `profile-phone` | phone rules written into the creation of a profile, with a catch and a stripping of separators that the installed library makes needless and a stale page calls for, a crash on what that library returns for no number, the edit path untouched, one fact in three stored fields | one check that creation and edit both call, written to the contract of the installed version, with the library's lower-case country patched where it is read and marked |
| `slot-edit` | an editor of a delivery slot whose five rules share one variable and win by overwriting it, behind a lookup of what the order already carries, with a cache, a retry and loading state for that lookup, a timer nobody stops, and an author's note that follows a stale page; the rules are skipped when the lookup fails | the rules in the order they win in one function, on the zone the order carries, checked again each minute the way the project's pickup form does it. The timer is needed: the installed form library does not validate on submit |
| `locale-options` | four old labels capture the import-time locale while two added getters use the read-time locale; tests check only the new translated labels | all fresh public label reads use the current locale while saved historical selections retain their creation-time text |

A rubric item is a `find`, with the direction it belongs to (behavior, necessity, design, tests), or a `trap`: a claim a reviewer is tempted to make and the code contradicts. `head` has both; `clean` has only traps, and there the count of unsupported claims is the result.

A case may carry `probes` in its rubric: changes someone will be asked to make after this one, each a local edit in the clean form and not in the first-written one. They are what the outcome's judge rules on.

## A round

1. **Arms.** Freeze each skill version under test as a numbered file in the research run. `node evals/review/round.mjs <directory> control name=instructions.md ...` prepares every case in both variants once per arm, or only the cases named after `--cases`, and writes `<directory>/runs.json` with each arm's instruction digest. Run it again on the same directory for another repetition.
2. **Reviewers.** Give each `prompts/<run>.txt`, unchanged, to a fresh reviewer that has seen no other run, with the same model, effort and tools in every arm, and save its final message as `returns/<run>.md`. Where the instructions have the reviewer write a `review.json`, give it a directory outside the repository to write in, the same wording in every such arm, and save the file as `returns/<run>.json`.
3. **Judge.** Per case and variant, give one judge [judge.md](judge.md), the case directory and that target's reviews, named by run id only. The judge is not told the arms and is not the model family under test when another is available. Collect its objects as `<directory>/verdicts.json`. The separate [design calibration](../../research/2026-11-11-review-skill/terra-design-calibration/README.md) describes a more restricted blind-judging protocol and its limitations.
4. **Record.** Add the model and effort to the record, and report every run that started, including the ones that failed or were excluded and why. `node evals/review/score.mjs <directory>` prints the table.

## The outcome

What a review says is not what it is for. The second stage measures the code that is left when someone acts on it.

1. **Implementers.** `node evals/review/implement.mjs <directory>` gives every reviewed run a fresh repository with the change, the task and that review, and a prompt, `implement/<id>.txt`. Every case and variant also gets implementers with no review, the arm `task-only`, and a case with probes gets its two anchors. Hand each prompt, unchanged, to a fresh implementer with the same model, effort and tools in every arm; it works in `work/<id>/repo`.
2. **Judge.** For each case with probes, give one judge [judge-outcome.md](judge-outcome.md), the case's `brief.md`, its probes, and every `work/<id>/repo` of that case's `head` implementations and anchors, named by id only. Collect its objects as `<directory>/outcome-verdicts.json`. The judge does not know that two of the directories are the case's own forms. If it does not rule the clean one more local than the first-written one, the case is disputed: its results count for no arm, and its rulings stay in the record. Read the judge's reasons before deciding whether the probe is weak or the judge missed the difference; do not drop a judge for disagreeing with the case's author.
3. **Measure.** `node evals/review/outcome.mjs <directory>` runs each case's acceptance checks and the repository's own tests on every result, saves what each implementer changed as `patches/<id>.patch`, and prints the table.

The table keeps three things apart: the acceptance checks, the probes, and the repository's own tests.

- **Outcome.** On `head` rows a run is `recovered` only when every acceptance check passes and a judge ruled every probe local: the task is done and the code takes the next change in one place. A run that passes the checks is `not assessed` while nobody has ruled on its probes, `disputed` where the judge's anchors are, and `checks only` in a case that has no probes; none of these counts as recovered. On `clean` rows a run is `kept` or `broken` by the checks. The recovered runs per arm are the result, and the three arms are read together: a review is worth what its implementer recovers beyond `task-only`, and the instructions under test are worth what their reviews recover beyond the control's.
- **Checks passed.** Every acceptance check runs in a process of its own and ends as passed, failed or unfinished: a check whose implementation never returns is `unfinished`, shown beside the count, and the other checks keep their results. `outcome.json` names the failed and the unfinished ones.
- **Own tests.** `passed`, `failed`, `unfinished` or `none`, with the exit status in `outcome.json`. They are not part of the outcome's word: read them beside it, and do not call a recovered run with failing or unfinished tests a finished solution.
- **Lines changed.** Code and tests apart. On a `clean` row they measure how far a review moved an implementer, not harm: a useful test or a true finding also changes lines. Harm is read from the patch: a regression, a mechanism nothing needs, or a rewrite with no shown gain. Use the count to find the patches worth reading, not as a gate.
- **Code against the clean form.** The lines of code the result adds to the code before the change, over the same count for the clean form. It is a size, not a grade: a result may be smaller than the clean form by leaving a requirement out.

## The record's own lines

A review written with the skill saves its record, `review.json`, in which every changed line belongs to a block with a verdict. Save it as `returns/<run>.json`, and `node evals/review/blocks.mjs <directory>` holds those verdicts against the lines the case knows: `lines.remove` in a rubric's `head` are lines no solution of the task keeps, `lines.keep` lines every solution needs. The table follows a removal link by link. `already` in the rubric names mechanisms that something existing makes needless, by words a record would use: the table gives in how many the record lists the mechanism among those the change brought, and in how many its `instead` or `basis` names what was already there. Then the lines: the superfluous ones the review marks `remove`, those it leaves in a block marked `fix`, those in no block, the needed lines it marks `remove`, and the other lines of code it marks `remove`, which show a record that removes everything. On a clean form, any line of code marked `remove`.

No judge takes part, so the count repeats exactly and costs nothing. It is narrower than the judge's ruling: it shows which lines the record marks and which words it contains, not whether the reviewer understood the redundancy or gave a sound reason. A review with no record, as a control's, has no measured counters. The two mechanism columns match words. They can overcount (a name in a denial or an irrelevant sentence) and undercount (different terminology or language); they are not a lower bound or evidence that the alternative was understood. Read both matched and unmatched records. Line dispositions describe proposed removals, not architectural quality; judge behavior preservation and the target separately. `slot-edit` and `profile-phone` list their lines.

## Admitting a case

A case on which the unaided arms already recover measures nothing: `booking-edit` was found whole by reviewers with no instructions, and an implementer given the task alone wrote the same code as one given the skill's review ([the calibration](../../research/2026-11-11-review-skill/terra-design-calibration/README.md)). Before a case counts, run `control` and `task-only` on it three times. If they recover more than half of those runs, the case is a regression case: it stays in the round to show that nothing is lost, and its rows are reported apart from the result. Three runs decide where further measuring is worth its cost; they are no evidence of what the skill does. For a comparison of arms, run five reviews per arm on each admitted first-written form and three on each clean one: the count of lines costs nothing per review, so the reviews are the whole price, and implementers can follow for three of the five. Give the probes to two judges that do not see each other's rulings. Preserve their original files separately. `outcome.mjs` accepts one judge file at a time: use a working copy at `outcome-verdicts.json`, save each judge's outcome JSON/table before evaluating the next, then intersect successful run IDs. Never concatenate the judgments or overwrite their originals. Missing, disputed and unassessed results stay visible; the coordinator records disagreements with both reasons. The [scoped protocol](../../research/2026-11-13-review-instead/protocol.md#independent-judgments-and-aggregation) defines the private static round's separate evidence assessment. `slot-edit` and `profile-phone` were run once as a pilot, which found their tasks and probes ambiguous ([round 4](https://github.com/Nowely/agent-skills/pull/95#issuecomment-6834922569)); the corrected cases have not been run, and whether a judge rules their clean forms more local than their first-written ones is still to be seen.

## Reading the table

On `head` rows, recall is hits plus half the partials over the find items; it measures the listed rubric items, not overall review or solution quality. On `clean` rows, traps and unsupported claims reveal some unnecessary recommendations, but a real new finding must still be judged on evidence. Neither count is folded into recall. `Other valid` counts supported findings the rubric did not list; a case that collects many needs its rubric extended, which starts a new round.

One run per cell shows that the instrument works and little about which arm is better: the same instructions gave different outcomes in consecutive rounds of [the first experiment](../../research/2026-11-11-review-skill/rounds.md). A difference between arms is a result when it holds across cases and repetitions; say how many of each a round ran.

## What it cannot show

The cases are a few hundred lines of JavaScript each and can be read whole, `slot-edit`, the largest, included. They do not show how a review behaves on a change too large to read whole or in another language. The instructions under test and most cases have one author, and the traps are the temptations that author thought of. The probes are rulings of a judge on code, checked only against the two anchors; an implementer is one more model run, with its own variance, between a review and its result.


## Locale-options preparation status

`locale-options` is a newly written fictional case inspired by a partial change to a related value group. Its
brief defines data-read behavior, not UI reactivity. The reference uses getters, but acceptance checks use only
public functions and also pass on an alternative with no getters. Two acceptance failures in `head` represent
one root consistency defect; the rubric does not reward duplicate findings for each entry or consumer.

The case has been checked mechanically, not admitted through model runs. Its `clean` tree is a deterministic
reference required by this instrument, not a request to schedule clean-target reviews. It is not added to the
frozen current pilot automatically and is formative rather than held-out evidence for draft28, which was
designed alongside it. No architecture probes are supplied: a future passing outcome is `checks only`, not
verified architectural recovery.
