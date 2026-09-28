# Does `clarity` need its description widened to cover interface text? Trigger runs, 2026-09-28

E71 asked whether choosing a name, a test title or a user-facing string is in `clarity`'s scope and, if it is,
to name those texts in the description. Names and test titles were kept out, so that the skill does not load on
every code edit. Interface text and error messages were added to the description (commit 7d08748) and measured
against the 0.3.0 description on the same day. **The 0.3.0 description already called `clarity` for interface
text and error messages in every run, and the added words changed nothing measured, so the description stays as
0.3.0 had it.** The numbers are in [`results.json`](results.json).

## Setup

- Claude Code 2.1.280 and Claude Opus 5.5. Three runs per case.
- The official eval ran through `evals/clarity-trigger.official.mjs` in a clean environment. The live probe ran
  through `evals/clarity-trigger.live.mjs` in the owner's ordinary profile, with the branch's plugin passed by
  `--plugin-dir`.
- The owner had terse 0.3.0 installed and enabled. Two single sessions showed that `--plugin-dir` replaces the
  installed copy: `init.plugins` listed one terse, at the branch's path.
- The new held-out set, `evals/clarity-trigger/holdout-ui.json`, was written by Claude Sonnet H1, which saw
  neither description nor the other case files. It has four positives (a button label with its confirmation, an
  empty state, a command-line error, a form validation error) and two negatives (an identifier rename, a constant
  change).

## Results

A cell counts the runs where `clarity` was called before the answer, out of all runs; for negatives, the runs
where it was not called.

| Set | Widened description | 0.3.0 description, same day |
|---|---|---|
| `cases.json`, official | 36/36; negatives 6/6 | — |
| `cases.json`, live | 36/36, every call before any text; negatives 6/6 | — |
| `holdout.json`, official | 22/24, then 24/24 on a second run; negatives 6/6 | 24/24; negatives 6/6 |
| `holdout-relay.json`, official | 18/18 | — |
| `holdout-ui.json`, official | 12/12; negatives 6/6 | 12/12; negatives 6/6 |

- The two misses on the first `holdout.json` run were one case, `commit-title-h1`. In both, the model read the
  staged diff and wrote the title without loading the skill. The second run of the same pages had it at 3/3, so it
  is run-to-run spread, as in the 0.3.0 runs, where one description scored 24/36 and then 29/36.
- On the 0.3.0 description, one `rename-h3` run stopped at the five-turn limit without calling `clarity`; it
  counts as not called.

## What changed in the plugin

- The description stays as it was.
- E71 is closed by this measurement: interface text and error messages are in scope already, and names and test
  titles stay out.
- The body changes that shipped with it have no effect on whether the skill is chosen. They are the recheck line
  (E69) and the links to three new genre notes (E70); the body loads only after the skill is called.

## Cost

$23.82 in Claude usage: $13.71 for the official runs of the widened description and $4.59 for the same-day
control, $5.37 for the live probe, and $0.15 for the two isolation sessions.
