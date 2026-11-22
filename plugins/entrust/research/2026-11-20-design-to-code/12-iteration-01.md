# Iteration 1: a shorter skill on the same listing case

## The result

The first submission with the revised skill was **returned** by the calibrated small-case judge: at 320 px the edit button and card bottom were 6 CSS px above the reference. The dense-data sweep and all 17 independent interaction checks passed. The worker reported the visual mismatch and the unavailable consumers honestly; it did not claim pixel-perfect completion. No owner-driven repair was given after this first submission.

[Reference, v14 and v15 first submissions side by side](12-iteration-01-visual.html) covers the three card widths and the popover. Download the raw HTML and open it locally. Each section includes the reference and both rendered outcomes with identical judge data.

## Conditions and comparison

Both workers received the same listing-card variant B, the same brief, initial source, kit and reference pack. Their initial Git trees are byte-for-byte identical (`557ea0bc25df197cf0848959d2267e53125eb80f`). Both were requested as native Terra xhigh, with effective model/effort not independently reported by the host. They ran at different times in the same environment. Each shared a filesystem with earlier research and was instructed not to read other solutions or the judge: the runs are **not blind**. No new arm without the skill was run, by the owner's decision.

The saved v14 submission and the v15 submission were both scored using the corrected and calibrated judge. The original judge had two documented observer faults in [the previous record](11-terra-v14-retest.md); we preserve that history rather than replacing its original verdict. The corrected judge accepted a known-good sample, reported an unrendered dense story as indeterminate, and returned a deliberately broken Escape interaction. Its 4 px materiality threshold applies only to this case, not to a product's design contract.

| Measure | v14, saved run | v15, iteration 1 |
|---|---:|---:|
| Independent first-submission verdict | accepted under case threshold | returned |
| Worker handoff | pending proposed differences | fail, proposed differences and untested consumers disclosed |
| Meaningful returned causes | none by the calibrated judge | one 6 px position/height mismatch |
| Dense data | measured, pass | measured, pass |
| Interaction checks | 17/17 | 17/17 |
| Full worker thread | 5:37 | 5:22 |
| Worker-reported time to first submission | 5:17 | 4:47 |
| Checker rounds | 5 | 4 |
| Worker tool calls | 34 | 25 |
| Worker input, uncached | 46,388 | 38,081 |
| Worker input, cached | 2,078,208 | 1,518,464 |
| Worker output (includes reasoning) | 12,166 | 13,023 |

The wall times are not just implementation time, the output totals already include reasoning, and tokens for the coordinator, verifier, checker author and permission-review helper are not included in the worker row. For v15 the permission-review helper separately used 38,811 uncached input, 149,120 cached input and 791 output tokens. The corrected judge ran approximately 17 seconds on v14 and 16 seconds on v15, inferred from output-file timestamps. The skill author's initial and follow-up work plus independent verification cost materially more than these pilot runs: before the first experiment, the implementer recorded 187,253 uncached input and 43,539 output tokens, and the verifier 97,539 uncached input and 9,789 output. These totals cover more than a single measured task and do not include all coordinator or browser work. Do not infer price or causality from them.

Only one run of each version was observed. The 15-second difference in full thread time and the opposing outcomes are not a statistically reliable ranking. The judge's three reported material findings for v15 are the button position, root height and pixel region of the **same** six-pixel shift, not three unrelated defects.

## Reflection: a conflict that was not established

The v15 worker read an 8 px gap in the design context and observed that the picture placed the button 6 px lower. It concluded there was a conflict and left a choice to the owner. An independent Astra reviewer inspected both implementations and reproduced a simpler explanation in headless Chromium: both implementations used an 8 px footer gap, but the accepted v14 implementation gave the neighbouring availability row a minimum height of 24 px, while v15 rendered it at 18 px. On the frozen v15 page a temporary in-memory style changing that row to 24 px moved the button from y=267 to y=273 and the card height from 315 to 321, keeping the 8 px gap. The source and first submission were not changed; this was a targeted diagnostic, not a complete rerun of all product checks.

The lesson is not to prefer screenshot geometry over design context, to hardcode the other implementation, or to waive a real design-system constraint. Before asking the owner to choose, verify that both sources describe the same box edges and state; try a simple layout that can satisfy both. If a real incompatibility or meaningful trade-off remains, present it with evidence. This is a hypothesis for the next skill version, not proof that the rule will improve a fresh task.

## Skill change and checker confidence

The frozen [v15 draft](drafts/15-v15.md) shortened the required workflow, retained reference-first final visual checks and real packaged-consumer verification where applicable, and made dense/sweep/interaction work conditional on the task. The checker also gained explicit acceptance outcomes, root handling and more honest journey evidence; its case judge was calibrated separately. Its initial full browser suite ran 76/76 before several later edits; subsequent final-version targeted and independent tests passed, but that earlier complete run does not by itself cover the later code.

Independent review found that an extra story's unmeasured alignment could still produce `pass`; the implementation was corrected and the reproducer now yields `incomplete` when the criterion requires that observation. Partial-width measurements and a justified `N/A` were checked separately. A journey's reported width and resize points are explicit, and the report states that an observed action/hidden sequence does not establish causal attribution. Equal-looking controls at different widths can still share an identity: a journey at one width does not prove the other width works. The task author must select relevant widths and actions; the checker must not claim they were all exercised.

The resulting [v16 draft](drafts/16-v16.md) adds the narrow general instruction above. No further full-task success has been claimed: the next independent first submission is needed, and an unrelated task is needed to assess transfer beyond this known case.
