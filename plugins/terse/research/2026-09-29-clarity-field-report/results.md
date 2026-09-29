# Results

All content runs used terse's content harness (`evals/content.official.mjs`) with the cases in
`evals/content/cases/pr35-field.json` (the versions below changed between runs), `clarity` loaded by force,
three runs per arm, a Sonnet judge that votes three times per grader, and `--criterion-only`. "Before" is the
pages with #35's five clarity fixes reverted (`evals/content/variants/pr35-before.json`); "after" is the pages
as changed. The agent was Opus 5.5 in every run whose trace was checked. Counts are passes out of three runs.
The judge records votes, not reasons.

## Target grader per case, after against before

| Fix | Grader | Pilot | Rerun | Confirmation |
|---|---|---|---|---|
| 1 ask the owner what comes back | asks-owner | 1 / 0 | 3 / 1 | 2 / 0 |
| 2 choose the form from nearby texts | form-matches-neighbours | 1 / 0 | 1 / 3 | 1 / 0 |
| 3 the list is the conclusion | list-first | 0 / 0 | 1 / 0 | 1 / 1 |
| 4 quote what the reader acts on | quotes-the-check | 2 / 3 | 3 / 3 | 3 / 2 |
| 5 heading or group label check | label-fit | 0 / 1 | 2 / 0 | 2 / 1 |

The pilot's "after" carried the first wording of the label check; the rerun and the confirmation run carried
the second.

## Blind reading, after against before

A reader (Opus) judged each answer against the fix's intent, from the answer text alone, with the arms hidden
behind random labels. The pilot was read with the arms known.

| Fix | Pilot (arms known) | Rerun (blind) | Confirmation (blind) |
|---|---|---|---|
| 1 | 3 / 1 | 3 / 1 | 3 / 0 |
| 2 | not exercised: 5 of 6 runs never found the neighbouring entries | 1 / 3 | 2 / 2 |
| 3 | 3 / 3: every answer opened with a count, then the list | 1 / 3 | 3 / 3 |
| 4 | 2 / 3 | 3 / 3 | 3 / 3 |
| 5 | 0 / 1 | 2 / 0 | 2 / 1 |

Grader against reader, answers where they disagreed (of six per case): rerun 0, 0, 3, 0, 0; confirmation 1,
3, 4, 1, 0. Under the rules, two or more disagreements mark the grader as a defect and the case as
unmeasured on it: list-first in both runs, form-matches-neighbours in the confirmation run.

Non-target graders lower by two or more in the after arm: none in any run. That check is weak for cases 1
and 5, whose side graders are unreliable: in the confirmation run, case 5's steps-correct, which judges only
Steps, voted 0 of 3 and 3 of 3 on two answers whose Steps are word for word the same. The frozen rule lists
each disagreement with its quote; the quotes are in the run's working files, which are not kept.

## Regrade of saved answers

The twelve rerun answers of cases 1 and 3 were echoed verbatim by Haiku (all twelve exact) and judged again
under the reworded list-first and facts-correct criteria. The judge agreed with the reader's expected verdicts
on 7 of 12: facts-correct 4 of 6, list-first 3 of 6. List-first failed the three answers that open with the count
"I count three jobs, not four" and then give the table, directly, after a caption or inside a block introduced
for pasting; its criterion names each of these openings as allowed. Facts-correct failed two of the three answers
expected to pass.

The same twelve echoes judged by Opus instead of Sonnet agreed with the expected verdicts on 12 of 12, each by
three unanimous votes: it passed the three count-first answers and the two drafts without a wrong fact that
Sonnet had failed. The expected verdicts were written by the reader with the arms known, on the answers the
criteria were reworded against, so this shows that Opus applies the criteria as written; it is not a test on
new answers. form-matches-neighbours and case 5's steps-correct were not regraded. Since then the pr35 cases
run with `--judge-model opus`.

## Advisor probe (entrust)

Four fresh Fable advisors, two per wording, got one question whose context planted a false premise (a default
said to be the new path that a config file in the probe tree contradicts). All four listed the premise, named
the file they checked it against and refuted it, with and without the advisor page's new ask to list premises.
With the ask, both advisors marked every premise as checked at a source or taken as given; without it, what
could not be checked went to open questions. The task was easy, and instructions loaded into every session,
which ask for evidence, reach subagents too.

## Trigger suite

`ticket-check`, a request to check a ticket whose last comment is an open question: clarity loaded before the
answer in 3 of 3 sessions with the plugin. The control arm did not count, because the installed terse loaded
there too (E99). After the E99 fix, one session per arm: the control session loaded no terse and counted as
isolated; the with-plugin session loaded only the candidate.

## Cost

| Run | Cost |
|---|---|
| Trigger, ticket-check, both arms | $0.85 |
| Content pilot | $4.87 |
| Content rerun | $4.65 |
| E99 check | $0.25 |
| Regrade | $0.63 |
| Regrade, Opus judge | $1.41 |
| Confirmation run | $4.77 |
| Total | $17.43 |

Priced here: the harness and trigger runs. The agents that designed, criticised and read, and the advisor
probe, ran on session tokens and are not priced.
