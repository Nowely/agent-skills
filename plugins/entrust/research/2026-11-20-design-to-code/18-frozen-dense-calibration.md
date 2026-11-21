# Post-series check: can the existing checker see the dense overlap?

## Scope and result

This is a **verification of the already frozen fifth submission**, not a sixth implementation iteration. The current checker at `9596ed17` measured the independent consumer with the previously reported dense-data fixture at 601 and 624 CSS px. It reported the overlapping price and disk texts at both widths. A control using the released package, the same consumer, fixture and checker configuration showed no overlap and a passing sweep at both widths.

[Visual comparison with a reference](18-frozen-dense-visual.html). Download the raw HTML and open it locally. The reference shows ordinary data at 601 px; it is context, not an identical-data reference for the stress case or a 624 px design. The released package and frozen submission show the **same** dense fixture at the named width.

| Observation | Frozen fifth submission | Released package control |
|---|---|---|
| Sweep 601 → 624 px | `fail`; overlap findings at both widths | `pass`; no sweep issues |
| Entire check | `fail`, exit 1 | `incomplete`, exit 2: the narrow diagnostic configuration has no acceptance list |
| Price vs second disk, 601 px | intersects by 59.45 × 8.92 px | no intersection; 37 px vertical separation |
| Price vs second disk, 624 px | intersects by 62.89 × 11 px | no intersection; 37 px vertical separation |

The original fifth-submission `resize` test had passed its width and text-presence assertions. This follow-up does not rewrite that historical result: it demonstrates separately that the same preserved UI has an overlap, and that the existing checker can detect it **when provided the relevant real consumer, data and widths**. Independent DOM Range measurements and screenshots corroborated the detector. A passing sweep in the control is not a claim that the whole package was accepted: the intentionally small configuration omitted the acceptance list, other references, behaviours and states.

## Reproducibility and limits

The two checks used byte-identical consumer and checker configuration; the distinct inputs were the frozen submission's package and the released control package. Package integrity was checked against each original archive before and after. The checker configuration targeted the first rendered card in the actual consumer, varied its host from 624 to 601 px and back, and used the same combined-data fixture. The frozen submission and its files were not changed. Both local browser services were stopped after the checks.

This is one positive and one negative example for one fixture at two widths, not a general sensitivity or false-positive rate. It does not establish that a future worker will derive the right stress data, choose that consumer, run the checker or inspect the reported finding. In particular, it is not a first-submission trial of [v20](drafts/20-v20.md), and the five-iteration limit remains exhausted.

Astra xhigh was requested to perform the verification; the host did not independently report the effective model or effort. Its initial turn and one continuation together lasted 4:20 of wall time and recorded 98,006 uncached input, 2,232,448 cached input and 8,429 output tokens across 28 tool calls. One permission-review helper separately recorded 31,877 uncached input, 30,464 cached input and 315 output tokens. Output includes reasoning; coordinator, browser and any other helper costs are additional and were not fully measured. The release control's complete timed run, including local server startup, DOM measurement and the checker, took 6.38 seconds, and its extracted package and working files occupied about 119 MiB; neither is a monetary estimate.
