# Rounds

| Round | Text | What ran | Result |
|---|---|---|---|
| 0 | [drafts/01-v1.md](drafts/01-v1.md) with the scripts at the same commit | the tooling, no model | below |

## Round 0: the tooling

`node plugins/entrust/evals/design-to-code.test.mjs`: 15 cases, 15 passed, about 23 s on one Linux container with
Chromium. The pure cases read a Figma-style outline in both coordinate readings, trace offsets, apply the ledger and
render the report. The browser cases render the offer card, take it as its own design, and plant one defect at a time:

| Planted | Reported |
|---|---|
| badges 6 px lower | in all three frames, "Start here" between the SKU and "New", +6 px; the rows below marked inherited |
| price 22 → 20 px, line height unchanged | `font` on the price, `size 22` → `size 20`, where no position moved |
| bottom padding 20 → 28 px | a root height difference; accepted in the ledger, it passes; proposed, it passes as pending |
| two fixed 150 px spec columns below 420 px | the sweep's root overflow from 280 px up, and not at 420 or wider |
| an implementer's ledger excusing everything | ignored by `score.mjs`: the unstyled start still fails |

The reference against itself: 0 % differing pixels, every frame passes. One check of three frames and a sweep of 61
widths takes a few seconds.

Not yet exercised: a real Figma `get_metadata` outline (protocol tier 1), any model.
