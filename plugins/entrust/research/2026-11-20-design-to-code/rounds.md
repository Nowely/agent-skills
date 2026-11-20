# Rounds

| Round | Text | What ran | Result |
|---|---|---|---|
| 0 | [drafts/01-v1.md](drafts/01-v1.md) | the tooling, no model | 15 tests; the planted defects found |
| 1 | [drafts/02-v2.md](drafts/02-v2.md) | an independent critic and a verifier on round 0, then the tooling again | each of the critic's 8 findings changed the check or the pages, one suggestion declined; each of the verifier's 16 corrections applied, some reworded; 25 tests |
| 2 | [drafts/03-v3.md](drafts/03-v3.md) | real design input, browser regressions, and an independent mixed-list check | self-comparison false positives repaired; the alignment gate did not pass on both controls, so no model comparison was run. [Details](03-calibration.md) |
| 3 | [drafts/04-v4.md](drafts/04-v4.md) | fixes for the defects round 2 and its review left, the owner's decisions on them, then a critic and a verifier | below |
| 4 | [drafts/05-v5.md](drafts/05-v5.md) | the corrections round 3's critic and verifier found | below; no model run |
| 5 | [drafts/06-v6.md](drafts/06-v6.md) | the owner's real-frame calibration with a blind review, and image-only references | the column defect found by checker and reviewer alike; one control 1.02 px over the tolerance, unresolved; the gate stays open. [Details](05-calibration-followup.md) |
| 6 | [drafts/07-v7.md](drafts/07-v7.md) | E143, image-only text and missing fonts made simpler, the summary-first rule back, then a critic and a verifier; the pair protocol | below; no model run. [Protocol](06-pair-protocol.md) |

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

## Independent recommendations

After the round 2 calibration, one independent advisor inspected the report and relevant code. The advisor found a bounded-exception aggregation defect and documented concrete successes, limits and [ideas for the next version](04-recommendations.md). No model implementation comparison was run.

## Round 3: what round 2 left

The coordinator re-ran round 2's findings before changing anything. Reproduced: a scorer that stopped at a check
missing one reference image instead of recording it as incomplete; an accepted entry with `max: 1.02` excusing an
8 px alignment spread at another width, because sweep findings had no size and widths were grouped before the ledger
was applied; a frame awaiting one decision summarized as "fail, 0 findings". Measured: Chromium paints boxes laid
out at 11.015625 px and at 10.5 px at 11 px, at 1× and 2×, so the 1.015625 px spread of round 2's control B is 1 px on
screen.

The owner decided: no copies of the work per round (the project's commits cover the worst case; the work moves
forward), a stop to adjusting after two or three rounds without progress, followed by sorting what remains into
fix, record or ask, since pixel-perfect is not the goal where a design missed a case or a kit component differs;
texts for MCP specs joined from the design context by node id and checked against the frame's screenshot.

Changes: sweep findings carry their size and are classified per width; alignment is read on painted pixels against
the configured tolerance, and a group matching fewer than two elements is reported as not measured (exit 2);
`score.mjs` records an incomplete check; the summary says a frame awaits a decision; `spec --context` joins the
design context's texts by `data-node-id`; the round diffs are gone and `history.jsonl` keeps each round's score,
read by the summary as the round before and the lowest. The join was tested on code written like the design
context, not yet on the owner's real answer.

### Round 3's critic and verifier

Two fresh agents of the coordinator's model read round 3 at `fc4f516`: a critic against the owner's goal and the
calibration gate, and a verifier of every claim. Their reports are summarized; the round 3 text above stays as it
was written, and these are its corrections.

- **The alignment rule was wrong for text.** Round 3 rounded each edge to a whole pixel because boxes paint that
  way. The critic showed text paints at subpixel positions: on the offer card, a true 1.99 px spread passed and a
  1.01 px spread failed, depending only on where the edges fell within a pixel. The verifier showed a composited
  ancestor can paint a box 1 px from its rounded edge, and that "control B's 1.015625 px spread is 1 px on screen"
  does not follow from a synthetic box: two edges 1.015625 px apart can paint 1 or 2 px apart. The round 3 claim
  about control B is withdrawn. It also changed the measurement after seeing one control, which
  [04-recommendations.md](04-recommendations.md) warned against.
- **"Not measured" blocked layouts that hide a column on narrow screens**: a group short of two elements at some
  widths made the whole check incomplete for good, and the ledger could not excuse it.
- **The context join could give a wrong text silently**: `{count} cores` became "cores", a template literal "$ GB",
  some entities stayed raw, and a deeply nested attribute broke the parse.
- **`max` did not bound findings without a size** (overlap, clipped, resize, switch): an overlap of 40 × 12 px passed
  under `max: 1`. Only overflow, outside and alignment had gained a size; "sweep findings carry their size" was
  partly true.
- **The stop rule left the implementer guessing** ("two or three" rounds, lower than what, where each kind of
  remainder goes), and a round that only turned failures into proposals lowered the score.
- **Pages contradicted the owner or the code**: the description and the README row promised "pixel for pixel";
  exit-code precedence was unstated; the changelog said texts "are checked against the frame's screenshot", which
  no code does; `protocol.md` and the research README still named the removed round copies; `design.mjs` kept an
  unused import. Round 2's [03-calibration.md](03-calibration.md) and [04-recommendations.md](04-recommendations.md)
  describe the Git snapshots of their time; round 3 removed them.

## Round 4: the corrections

Alignment compares the spread as laid out with the configured tolerance, without rounding: 1.015625 px fails a
tolerance of 1 and passes one of 1.5. Which tolerance is right is the owner's decision, to be taken from evidence
and frozen before the next control run, as 04-recommendations.md proposes. A group that never has two elements is
not measured; one short at some widths is reported and aligned where it has two. The context parser takes only
what the code states and leaves a layer with an expression, an unknown entity or unparsed code without text, to be
read from the image. A `max` covers only a difference with a size; overlap, clipped and resize findings now carry
one. The score counts open proposals with failures. The stop rule says two rounds without a new lowest, commit at
each new lowest, and where each kind of remainder goes. The pages say "every remaining difference explained"
instead of "pixel for pixel", and state the exit-code order. `node plugins/entrust/evals/design-to-code.test.mjs`:
34 cases, 34 passed.

The critic's conclusion stands: tool changes alone do not move the gate. It needs the owner's real frame through
`spec --context`, the screenshot check of its texts, an answer key made before seeing the check's output, and the
alignment tolerance frozen beforehand.

### Round 4's verifier

A fresh verifier checked round 4 at `6194df5` by running each claim. Holding: sizes and `max`, the score with open
proposals, the pages against the code, the draft and the test counts. Partly holding, and corrected at once:
- two alignment groups on one selector (its left and right edges) that never had two elements passed, since widths
  were counted per entry; a group is now one selector and edge, counted once per width;
- the context parser was silently wrong in three ways: commented-out JSX after the component overrode a real text,
  a JS escape (`{"14\" screen"}`) was kept raw, and entities were decoded inside JS strings; it also threw on
  `&#99999999;`. Code outside JSX is now skipped as code, an id seen twice and a literal with an escape give no text,
  literals are taken as written, an undecodable entity gives no text, and an id inside another attribute's value is
  ignored;
- the spread was rounded to 0.01 px before the comparison (1.004 px passed a tolerance of 1); it is compared
  unrounded and rounded only for display;
- the script's header did not state the exit-code order.

Not changed: code the parser cannot read (TypeScript generics, fragments, `<br>` without a slash) gives every layer
as missing, which is loud and sends the implementer to the image. 34 tests pass.

## Round 5: the owner's real-frame calibration

Recorded in [05-calibration-followup.md](05-calibration-followup.md). A blind reviewer and the check both found the
known column shift (17–44 px) in the defective build at 601 and 624 px; control C passed; control A at 601 was 1.02 px
over the 1 px tolerance, which the reviewer saw as aligned: an unresolved boundary. Against the real 601 px frame all
three builds failed with 27–30 findings, with the design font missing in the stand, no ledger and a 1× export. The
owner's round also added image-only references and recorded E143.

## Round 6: simpler, after the owner's reminder

Reviewing round 5, the coordinator found three things to change before a pair uses the check, and the owner
reminded that the product is established, with its kit, components and fonts: no spaceship.

- **E143**: a ledger's `max` was held to the spread rounded for display. It is held to the measured one; tests take
  1.004 px against `max: 1` (fails) and 1.015625 px against `max: 1.019` (passes). Fixed in its own commit.
- **Image-only references.** Round 5 compared their text pixels too. On the public captures, the owner's accepted
  release against its design in that mode failed with 10 areas, real differences and smoothing mixed. Text is now
  left out of the pixels as in every other frame, and the frame is incomplete: the eye judges the text. A first draft
  of this round added two finding statuses for it; the owner's reminder removed them.
- **Missing fonts.** The stand of round 5 lacked the design font, and every text measure compared a fallback. A
  page whose text renders in none of the named families of its stack now makes the check incomplete until the font
  loads; a stack whose first family is absent but another named one is present is no fallback.
- **The summary-first rule is back** on the skill page: each round reads the text summary; images when it cannot
  explain a difference, for a screenshot-only reference, and before handoff. Round 5 had replaced it with "compare
  visually as well", which brought back the token cost of comparing images every round.
- The pair on the card task is registered in [06-pair-protocol.md](06-pair-protocol.md).

`node plugins/entrust/evals/design-to-code.test.mjs`: 36 cases, 36 passed.
