# Iteration 2: testing the design-conflict instruction

The calibrated judge returned the first submission made with [v16](drafts/16-v16.md). At 320 px the edit button sat 6 CSS px too high and the card ended 6 px early. The dense-data sweep and all 17 interaction checks passed. The worker identified the mismatch and reported that the submission was unready.

The [side-by-side visual](13-iteration-02-visual.html) contains the supplied reference and the judged v14, v15 and v16 captures for each state. Download the HTML and open it locally. The public originals are the [760 px card](../../evals/design-to-code/cases/listing-card/pack/wide-760/reference.png), [520 px card](../../evals/design-to-code/cases/listing-card/pack/medium-520/reference.png), [320 px card](../../evals/design-to-code/cases/listing-card/pack/narrow-320/reference.png) and [deal popover](../../evals/design-to-code/cases/listing-card/pack/deal-popover/reference.png).

## First submissions on the same input

The runs started from the same synthetic listing-card variant B, Git tree `557ea0bc25df197cf0848959d2267e53125eb80f`. All three frozen submissions were evaluated with the same calibrated judge (SHA-256 `ce4e11121652bd7f00a92cf68b8e72b0ce9133000795ea070c8658f19c1d12bf`). That judge accepted v14. Its visual threshold, controls and the earlier run are documented in [iteration 1](12-iteration-01.md).

| Measure | v15 | v16 |
|---|---:|---:|
| First-submission verdict | returned | returned |
| Material visual difference | 6 px at 320 px | 6 px at 320 px |
| Dense-data sweep | pass | pass |
| Interaction checks | 17/17 | 17/17 |
| Checker rounds | 4 | 2 |
| Worker-reported time to submission | 4:47 | 4:51 |
| Elapsed worker thread time | 5:21.927 | 5:16.057 |
| Worker tool calls | 25 | 27 |
| Uncached input tokens | 38,081 | 39,557 |
| Cached input tokens | 1,518,464 | 1,590,912 |
| Output tokens, including reasoning | 13,023 | 11,920 |

On v16 the judge measured the button at y = 267.5 CSS px against 273.5 in the spec, and card height at 315 CSS px against 321. It also reported a differing pixel region around the same shift. The 760 px and 520 px cards and the deal popover had no material visual findings under the case threshold. The worker's second checker round still reported a failure at handoff.

Each version contributed one independent run at a different time. Workers shared a filesystem and could access earlier research, so this comparison was unblinded. There was no new run without the skill. The timings, tokens and round counts describe these individual workers. They exclude the coordinator and independent reviewer and cannot establish the effect of the wording change.

## Checking the apparent contradiction

The v16 worker read the instruction about testing the edges described by each source. A separate review of its transcript found no recorded comparison of those edges or trial of a layout satisfying both sources before it reported a conflict. The record does not establish why.

On the frozen v16 submission an independent reviewer changed only the rendered DOM. Raising the neighbouring availability row from 18 to 24 CSS px preserved the specified 8 px gap between the footer blocks and moved the button and card bottom down by the missing 6 px. This demonstrates that the written gap and the narrow reference position are compatible. The diagnostic did not change the submitted files or repeat full acceptance with the trial applied.

[Draft v17](drafts/17-v17.md) moves the instruction to handoff. For a material difference attributed to conflicting sources, it asks for the reversible change tried and the observation against each source. A compatible change is kept and its affected state rechecked. A blocked trial leaves the conflict unverified, with the blocker named. Whether this changes a fresh worker's first submission remains an open hypothesis.
