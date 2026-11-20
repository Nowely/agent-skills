# Rounds

| Round | Text | What ran | Result |
|---|---|---|---|
| 0 | [drafts/01-v1.md](drafts/01-v1.md) | the tooling, no model | 15 tests; the planted defects found |
| 1 | [drafts/02-v2.md](drafts/02-v2.md) | an independent critic and a verifier on round 0, then the tooling again | each of the critic's 8 findings changed the check or the pages, one suggestion declined; each of the verifier's 16 corrections applied, some reworded; 25 tests |
| 2 | [drafts/03-v3.md](drafts/03-v3.md) | real design input, browser regressions, and an independent mixed-list check | self-comparison false positives repaired; the alignment gate did not pass on both controls, so no model comparison was run. [Details](03-calibration.md) |

The drafts are byte-identical copies of the skill page; their relative links resolve from the skill's directory.

## Round 0: the tooling

`node plugins/entrust/evals/design-to-code.test.mjs`: 15 cases, 15 passed, about 23 s on one Linux container with
Chromium. Planted on the offer card, one at a time: badges 6 px lower (in all three frames "start here" between the
SKU and "New", +6 px, the rows below inherited); the price at 20 px instead of 22 (at 720 a `font` and a `width`
finding with no position moved; at 480 and 320 the old price beside it also moved 6.7 px); a bottom padding of 28
(a root height difference, passing when accepted and pending when proposed); two fixed 150 px columns below 420 (the
sweep's root overflow from 280 up). The reference against itself: 0 % differing pixels.

## Round 1: a critic and a verifier

Two agents of the coordinator's model read round 0 without its author's conclusions. The critic judged the skill
against the owner's goal and ran its own variants of the offer card; the verifier checked every claim of the pages
against the code, the images and the sources. Their reports are summarized here; the scratch files they made were
not kept.

| Critic's finding (verified by running unless marked) | Change |
|---|---|
| A smaller image, a wrong badge colour and a wrong button colour pass: the check sees only text | The pixel comparison now finds the areas outside text that differ and reports each with its box (`region`); an area that matches once shifted by a nearby text's offset belongs to that text. Text colour joins the font check |
| The ledger excuses findings, not causes: the kit's 3 px shorter badge, accepted, still leaves every row below it failing; and one `proposed` entry with `*` turned 98 failures into pending | An entry excuses a cause and what it carries down or along, and the root's height; only an accepted entry may use `*`; `landmark` may be a list. Gaps no frame shows stay in `review.md`, not the ledger. The page says to use a kit component and record its difference as `system`, never restyle it |
| "Start here" misleads: a narrower root is blamed on the right-aligned price; a Figma text box taller than its line invents a cause below it, and the agent loops | The root's size is the first cause and is listed first. A horizontal position is read from whichever root edge it moved least from. An offset below is carried from the neighbour's top or bottom, whichever explains more |
| Text is not found when markup splits it (`1 499<span>€</span>`) or CSS changes its case | Texts are matched without spaces and case |
| Building the pack through MCP means retyping tool answers as output tokens, and an image the model receives may not reach the disk (reasoned) | `design.mjs figma` reads a frame from Figma's REST API with a token: the spec with fonts and the 2× image, no model tokens. The page says to save what a tool writes itself and retype only for a handoff |
| The protocol measures access to the judge, not the skill: the skill arm gets the judge's own spec; no arm can be pushed, so pushes are not measured (from the code) | The skill arm's spec drops exact text widths, as Figma's would; both arms get the same scripted push, up to three; tier 1 is a gate with the misses it must see; a private case's judge is set up by hand |
| A layout that changes at 500 instead of 640 passes | The sweep reports the widths where the layout changes and, given `switches`, fails a change elsewhere |
| No cap on rounds (reasoned) | Each round's diff is saved; the summary names the best round; the page says to stop after three rounds without a lower score |
| Overbuilt: `--boxes` (it crashed the check), `pixelLimit`, a separate `sweep` command, the `rejected` status, a gallery overwritten by a one-frame check | Removed; the gallery is written only by a check of every frame and now shows the sweep and the ledger |

Kept against the critic: the pack's other files (context, Code Connect, variables) are the implementer's reading,
not the check's; the page now only advises against retyping them.

The verifier found the pages' code claims holding, and these wrong: `result.json` does not hold every landmark's
offsets; "start here" can also start at a root edge; the sweep samples every `step` px, not every width; the
seat limits were unsourced; 1.4.11 was missing beside the 3:1 contrast; tier 0 planted no column gap; the 280 px
bottom spacing is 22 → 38 (+16), not 21; in the owner's final card the availability line is 1 px off, not 4, and its
badge is 18 px high in both, not 15 (the first reading had mixed badge and text in one band); the "New" badge's
text is not darker; RubSE does not prescribe keeping the best round and 1D-Bench uses execution feedback, not a
difference image; the context of the case omitted three colours and said every arm gets a spec. Each is corrected
in its page.

`node plugins/entrust/evals/design-to-code.test.mjs`: 25 cases, 25 passed, about 45 s.
