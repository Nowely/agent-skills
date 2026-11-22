# Iteration 1: draft 23.1 on the server card, with Sonnet

One run of draft 23.1 on the case of [23-server-card-sonnet.md](23-server-card-sonnet.md), judged by the same frozen
judge, and a blind A/B visual review against draft 22.1's frozen submission. Draft 23 and its critic and verifier
round are in [rounds.md](rounds.md#draft-23-arrangement-ink-and-a-narrower-ledger-iteration-1).

## Setup

- **The arm:**
  - Sonnet in a fresh subagent, with the same brief and the same rules as before;
  - prepared and frozen with `evals/design-to-code/harness/arm.mjs` at `4adcc2c`;
  - no past returns given;
  - it stayed in its directory.
- **The judge:** unchanged, with its checker pinned at the 22.1 commit. The blind reviewer got the references and the
  two submissions' captures as A and B; the key was revealed after the verdicts.

## Results

| | Draft 21.1 | Draft 22.1 | Draft 23.1 |
|---|---|---|---|
| Automatic part (dense sweep, popovers, configure, stock) | accepted | accepted | accepted |
| Blind visual review | returned | returned | **returned; "clearly closer to the design"** than 22.1 |
| Evidence file's status | `incomplete` | `incomplete` | `pending`: 0 failures, 13 entries proposed |
| Wall time · tokens · tool calls | 21:22 · 233k · 89 | 17:51 · 210k · 79 | 20:02 · 218k · 68 |
| Check rounds | 12 | 11 | 12 |
| First round with the acceptance list | 11 | 8 | 7 (the model too) |

**What 23.1 got right, by the review:**

- the structure and the order (the low-stock icon before or after its count, as each frame draws it);
- the badge, chip and price sizes at every width, including the larger ones at 280;
- the popover;
- the dense offer at every width (the layout switches where its content stops fitting).

**Its deciding findings:**

1. **Disk format.** At 486 and 280 the disk lines read "4 × 5587" where the frames read "5587 × 4". The agent unified
   the format to the 764 and 601 frames' order, called the frames inconsistent, and proposed it. The reviewer counted
   a text that reads differently from its frame.
2. **Columns at 764.** The CPU column sits 11 px left, and every column from "32 ядер" on sits 12 px right: the gap
   after the ×2 chip is 22 px where the frame has 14. The check named these offsets; the agent proposed them as the
   kit font drifting ("about 8 % wider"), under `system`.
3. **The cores row at 280.** "32 ядер / 64 потока" stands 3 px off the line it shares with "16 ядер", and the rows
   below sit 6–7 px high. The check named them; the agent proposed them as the kit chip's height.

## What this shows

- **The checker now sees what the reviewer returns for.** Its findings include all three causes above. Draft 22.1's
  submission hid 13–27 px offsets behind one "font" region entry per frame. Draft 23.1's submission was left with
  5–12 px offsets, each named.
- **The weak link moved from seeing to excusing.** The agent fixed the large offsets, then proposed the rest with a
  plausible cause:
  - a font for a changed gap;
  - a kit size for a moved row;
  - consistency for a format the frames draw.

  The evidence file named the broad causes first, so the owner sees them, but a proposal is still a return.
- **The disk unification** breaks a rule the page already has: an improvement the request does not need is proposed,
  not built.
- **Thinking ahead happened in the code, not in the documents.**
  - The model and the acceptance list came at round 7 of 12, the third run in a row with them late.
  - The layout itself switched by content: it tries the widest layout first and keeps the first where nothing
    overflows.
  - The dense offer held everywhere, in all three drafts' runs.
- **Limits:**
  - one run per draft, on one case;
  - the judge is not calibrated against an accepted card;
  - the judge's dense offer is shorter than the contract's maximum.
