# clarity field report: fixes and their measurement — 2026-09-29

The owner sent a field report on `clarity` (terse 0.5.0): in a private session, a reply in a long thread went
through several rounds of the owner's corrections. The report, its session's transcript and two
independent analyses led to five page fixes (#35) and a follow-up (#39: a second wording of the label check,
E98, E99, and the cases kept). This run measured whether the fixes change what the model writes. The report and
the transcript stay private; nothing here names the case.

## Result

- **Fix 1's case replicated.** Question 2 before writing now asks what comes back and has the writer ask
  the owner when nothing settles it. With the fixed pages, the answer left the choice between two courses to
  the owner in 3 of 3 and 2 of 3 runs, against 1 and 0 without the fixes, by the grader, and 3 against 1 and 3
  against 0 by a blind reader. It is the one lead that held in two runs. The arms differ by all five fixes;
  this case is fix 1's by design, not by isolation.
- **Fix 5, the label check, is not shown to work.** Its first wording ("does every item fit what the label
  says") moved nothing: in all three sessions with it, "No database" stayed an item under Requirements,
  against two of three without the check.
  The second wording ("is every item an instance of what the label names") scored 2 against 0 and then 2
  against 1, a lead that did not hold under the rule. After the confirmation run the owner removed the check
  from `clarity` (#39); case 5 stays in the suite, where its two arms are now the same pages.
- **Fixes 2, 3 and 4 show no effect either way.** Fix 2's drop in the rerun (1 against 3) did not come back:
  in the confirmation run its grader was unmeasured and the reader counted 2 against 2. Fix 3 is unmeasured on
  its grader in both runs; the reader counted 1 against 3, then 3 against 3. Fix 4 was at a ceiling: the model
  quoted the check without it.
- **Four graders are unreliable with a Sonnet judge.** list-first failed answers that met its criterion word
  for word, even after a rewrite that named their openings as allowed; form-matches-neighbours disagreed with
  the reader on three answers in the confirmation run; case 1's facts-correct, reworded, still failed two of the
  three answers the regrade expected to pass; case 5's steps-correct passed and failed the same Steps text. Under
  the rule, a case whose grader disagrees with the reader on two or more answers is unmeasured on that grader;
  the reader's counts stand beside it and decide nothing alone.
  An Opus judge applied list-first and case 1's facts-correct as written on the saved answers (12 of 12), so
  the pr35 cases now run with it.
- **The advisor's premises ask changed how premises are reported, not whether a false one is caught**: all four
  advisors caught the planted premise, with the ask or without it.
- **E99 is fixed and checked**: the trigger suite's control arm now runs without the installed terse.

## Limits

Five fictional cases, three runs per arm, one agent model (Opus 5.5), one judge model (Sonnet) that records
votes but not reasons, and one blind reader, who knew the previous run's arms when reading the confirmation run.
A lead here is a direction, not an effect size. The pages were measured with `clarity` loaded by force, so
nothing here says how often the skill is chosen.

## How it ran

1. Two analyses of the field report against the pages, independently (Fable, Opus), and a reading of the
   session's transcript (Sonnet), checked by a critic (Opus). The fixes were designed by Fable, criticised by
   Opus and applied in #35.
2. Content pilot: five cases, one per fix, designed by Fable and criticised by Opus before any paid run; the
   rule for reading the results was frozen first. A verifier (Opus) read all thirty answers and found two cases
   that could not measure their fix and graders that failed good answers.
3. Rerun, on repaired cases and the second wording of the label check, with a blind reader.
4. Regrade of the rerun's saved answers under reworded graders, then a confirmation run with those graders
   and a second blind reading.
5. The advisor probe and the trigger runs, beside the content runs.

[results.md](results.md) holds the tables and the costs ($17.43 for the paid runs); [rules.md](rules.md)
holds each frozen reading rule. The cases are `evals/content/cases/pr35-field.json` and the reverting variant
`evals/content/variants/pr35-before.json`.
