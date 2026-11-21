# Drafts 21.1 and 22.1 side by side on the server card, with Sonnet

One run per draft, in the coordinator's session, on a case built from the server card's references. It asks whether
either draft gets a first submission accepted where the five Terra iterations did not, and where each falls short.

## Setup

- **The case:** a scratch project made from the 1× references already in this record:
  - the card at 764, 601, 486 and 280 px and the network popover;
  - a small kit (tokens, badge, chip, help icon, indicators, action, popover);
  - a legacy `renderCard(el, offer, { onConfigure })`;
  - a data contract: SKU up to 40 characters, 0–4 badges, 1–4 disk groups, long prices, `configurable`.

  The design is screenshots only: no layer data.
- **Arms:**
  - Sonnet in a fresh subagent with the same brief and rules (work only in its own directory);
  - prepared and frozen with `evals/design-to-code/harness/arm.mjs`: draft 21.1 at `d70839e`, draft 22.1 at
    `28ec7ad`;
  - no past returns given;
  - run concurrently.

  The arms stayed in their directories.
- **The judge:** frozen before the runs, with its checker pinned at `28ec7ad`.
  - **Automatic part:**
    - the judge's dense offer swept from 280 to 800 px;
    - both popovers by hover, moving in, leaving, tap, tap elsewhere, focus and Escape;
    - the network popover's content;
    - the configure action present and absent;
    - a low stock's count.

    It returned the start project on 14 behaviour checks.
  - **Visual part:** a blind A/B review of the captures against the references. Its key was revealed after the
    verdicts.
  - **Not calibrated:** no accepted implementation of this card exists to calibrate the judge against.
  - **Its dense offer:** a 27-character SKU and 2 badges, not the contract's maximum.

## Results

| | Draft 21.1 | Draft 22.1 |
|---|---|---|
| Automatic part | accepted | accepted |
| Blind visual review | **returned** | **returned** |
| Status the evidence file opened with | `incomplete` (screenshots only) | `incomplete` (screenshots only) |
| Wall time · tokens · tool calls | 21:22 · 233k · 89 | 17:51 · 210k · 79 |
| Check rounds · stories · journeys | 12 · 7 · 36 | 11 · 3 · 22 |
| Round in which `review.md` first had its acceptance list | 11 of 12 | 8 of 11 (the layout model too) |

**Deciding findings of the visual review, confirmed by the coordinator on the pictures:**

- **Draft 21.1:**
  - At 601 the price block sits about 24 px lower than in the frame, and the card is 29 px taller. Its handoff
    proposed this as a deviation, on the claim that the frame's arrangement cannot be built without overlap.
    Draft 22.1 built it.
  - On the dense offer at 764 the disk groups drop under the frequency and cores columns, and the processor model
    breaks over two lines. Nothing overlaps, so the sweep passed it.
  - On the dense offer at 280 the period "/ месяц" wraps away from its amount.
- **Draft 22.1:**
  - At 601 the low-stock indicator stands after "Доступно 1"; the frame has it before.
  - The specification columns sit 13–27 px off at 764 and 601, with about half the frame's gaps.
  - At 280 the badges, chip and text keep their wide-card sizes.

  Its handoff said the 764, 601 and 486 cards "match in rows, order and alignment".

## What this shows

- **The automatic gates held for both drafts.** Both submissions passed the dense sweep and every popover gesture,
  where the fifth Terra iteration failed: dense overlap and popups that stayed open. With one run per draft and no
  plain arm, this run does not show that the skill caused it.
- **One broad "font" entry hid the layout errors.** Draft 22.1 proposed one entry per frame, "glyph-level differences
  from the font", which covered 13 to 43 differing regions each. Among them were the shifted columns and the swapped
  indicator. With a screenshot-only design the check leaves text out of the comparison. Text positions were therefore
  left to the eye, and the eye passed them.
- **A layout can break without overlapping.** Draft 21.1 switched layouts at fixed container widths, so the dense
  offer at 764 stayed in the wide layout and its disk groups wrapped under other columns. Draft 22.1 switched where
  its content stopped fitting, as its page asks, and the dense offer read correctly at every width.
- **The layout model came last.** Draft 22.1 wrote it at round 8, after the card was built, and its predicted switches
  are the measured ones. Its page's idea still shaped the code, but the model as a prediction was not exercised.
- **The `incomplete` ceiling:** a screenshot-only pack can reach `incomplete` at best, so both handoffs opened with it
  after good work, and the status said nothing about what remained.

## For draft 23

1. **The model's lines as a check.** Each line of the model names its pieces and the widths where they share a row.
   The sweep then checks, on every story, that they do. This would have returned draft 21.1's dense offer at 764
   and 280, and it makes the model a prediction tested on the dense data.
2. **Positions from a screenshot.** The script finds the text boxes in the reference and the agent names each one.
   The check then compares left and top edges, not widths, because the font differs. A shifted column or a swapped
   indicator becomes a position finding that a font entry cannot excuse. This also lifts the `incomplete` ceiling.
3. **The model before the first measurement.** The check refuses to measure until `review.md` has the model and the
   acceptance list.
