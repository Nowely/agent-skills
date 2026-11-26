# Follow-up: a real frame, blind review and image-only references

This is a follow-up to [the first calibration](03-calibration.md) and [the independent recommendations](04-recommendations.md). It answers the [request for a real-frame gate](https://github.com/Nowely/agent-skills/pull/107#issuecomment-7037045610), with the limits below. The checker was pinned to `188f57beb2813fb8b90ef72161c334861f49d8d0`. No model implementation was run. Product source, private links, raw design responses and the browser builds remain local; the existing [visual comparison](../2026-11-20-adaptive-frontend/visual/README.md) supplies the permitted reference images.

## Inputs and independent key

We recovered the three previously evaluated builds, their consumer, images and package artifacts. The consumer rendered two records at card widths 601 and 624 CSS px: an ordinary record followed by a dense record with three disks, a long name and price. The same inputs and consumer were used for all three. This is significant: the earlier `align-gate` used a different, shorter second record. Its measurements are observations on that fixture, not reproduction of the original three-disk defect.

A 601 px image of the first card is comparable to the design frame by data and state. A wider design image also includes a list, but its second card contains a different configuration. There was no corresponding design frame at 624. We therefore tested visual fidelity only for the comparable first card at 601, and the relationship between values, rows and the shared header at both widths. The 624 check is not a pixel-parity check against an invented reference.

Before the checker ran, an independent visual reviewer saw anonymized design images and six build screenshots but no checker outputs or prior findings. The reviewer identified the known second-row column shift in B at both widths, found A and C visually aligned across rows, and recorded visible design differences in all builds. The key and default 1 CSS px tolerance were frozen before the run. There were no ledger exceptions. This small, related set evaluates a known case, not general accuracy. A and C were controls for the column relationship, not for complete design fidelity.

A = v5 fourth submission; B = v5 third submission; C = v4 submission. The first card's image is a 601 × 146 px export at 1×; the frame's metadata height is approximately 145.09 CSS px. `spec --context` reported **14/14 text layers**, and the visible text was checked against the image. The saved context had temporary asset URLs redacted; it is not an unedited raw MCP response. A fresh end-to-end raw MCP join, a 2× export and the exact design version remain unchecked. The browser reported that the design font was unavailable. Font/style fields were not fully supplied in the extracted spec.

## Alignment sweep

| Build | Visual assessment, before check | 601 px | 624 px |
|---|---|---|---|
| A | Both rows align with the header | fail: one disk edge 1.02 px apart | pass |
| B | Second row shifts under the wrong headings | fail: 25.27 / 35.55 / 43.97 px | fail: 17.69 / 32.45 / 38.67 px |
| C | Both rows align with the header | pass | pass |

B's numbers are the reported spreads for the frequency, memory and disks groups, respectively. A at 601 exceeds the fixed numeric threshold but looked aligned to the reviewer. The visual judgment does not establish equality to one pixel, so the 1.02 px finding is an unresolved boundary case, not a confirmed false positive. We did not tune the threshold after seeing it.

For these sweep runs, the reference image was each build's own freshly captured rendering. Its `frames pass` and zero-pixel difference only establish self-comparison; they do **not** establish similarity to the design. The checker and blind review both detected the substantive known defect, but alignment checks still depend on the groups and selectors supplied to them and cannot establish that every value belongs to the correct heading.

## Design-frame comparison

With the real 601 px image and extracted text spec, without a deviation ledger, all three frames failed. The measured first-card heights were 171 px for A, 144.11 px for B and 162 px for C, against 145.09 CSS px in the design metadata. The checker reported 28, 27 and 30 findings, respectively. These are diagnostic counts, not counts of distinct confirmed defects: dependent offsets, design wording, font availability, UI-kit choices and the shared row layout can all affect them. The reviewer also noticed icon and stock-indicator differences and, for C, substantially different column positions from the design. Whether any specific difference is accepted has not been decided here. The images and the original owner-approved decisions must be read together before classifying them.

## Bounded exceptions

An independent Chromium reproduction on this pinned revision found a separate `ledger.max` edge case. Alignment is compared to tolerance before rounding, but its reported `delta` is rounded to hundredths before ledger classification. A spread of approximately 1.004 CSS px with `max: 1` can therefore be accepted as 1; a spread of 1.015625 with `max: 1.019` can be rejected as 1.02. The error is near the boundary, approximately ±0.005 px for alignment, and does not explain B's large shift. The ledger was empty in the runs above, so it did not alter their results. Rounding of other sweep categories was observed in code but not reproduced separately. This report records the finding; the calibration did not fix it.

## Screenshot-only control

A separate local synthetic example gave the checker an image of `AAAA` and an identically sized browser rendering of `BBBB`, with an empty landmark list. On the pinned revision it returned `pass` despite 1.38% differing pixels. The pixel-region check masked the page's text even though no text landmark checked its meaning. This demonstrates why an image-only result needs direct visual review and must not become an automatic full pass. It is not evidence that screenshot-only work is impossible: the agent can inspect the reference and rendered images, report assumptions and show the owner the reference, before and after.

## Cost and next question

The nine browser checks took 1.05–2.50 seconds each in two concurrent slots. Those numbers exclude setup, visual inspection, review and analysis; complete wall-clock time and model token usage were not captured and are not estimated. The exercise did not run a new implementation pair.

The evidence supports using the checker as a diagnostic aid; it does not establish an automatic acceptance gate for an entire UI. To investigate whether the skill improves the work, the next candidate is a controlled baseline/skill pair on a new task with fixed inputs and equal limits, followed by blind visual and functional review. Track first-submission quality, returns, elapsed time and tokens when available. One pair remains a case study. If the question instead requires the checker to autonomously decide every return, classify the reference-frame differences and calibrate it further first.
