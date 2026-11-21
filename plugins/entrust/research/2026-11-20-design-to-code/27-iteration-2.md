# Iteration 2: logic over pixels, named boxes, and a review pass

After [the architectural review](26-architecture-review.md), the owner chose:

- logic over pixels, with named boxes now;
- a fresh-context review pass at handover, as an experiment;
- a moderate budget for evidence.

The owner's stance, which this iteration builds on:

- **Logic, not hacks.** The layout is built on logic. A moderate mismatch with the design is acceptable, since 100 % is
  not reachable. Nailed-down solutions and hacks without a strong reason are bad form.
- **Overlap first.** The main real-world failure was one label overlapping another.
- **Growth.** Horizontally the container is the limit; vertically the component grows, since data can have N entries.
  Where the height is fixed, the standard CSS ways apply: an ellipsis, a line clamp.
- **Review use.** The skill should later serve reviews ("pixel perfect, but at what cost") and the tidying of an
  implementation's inside.

## What changed: drafts 25 and 25.1

- **Build from logic** is the page's first rule:
  - the kit's tokens and components, flow and grid with consistent gaps, the design's relations;
  - a moderate systematic difference named once;
  - nothing nailed in place without a strong reason.
- **Growth by N.** The model asks what repeats and where it goes, and a story with many entries shows it.
- **Named boxes replace ink pairing.**
  - `design.mjs boxes` proposes numbered pieces of a screenshot's ink and draws `boxes.png`.
  - The implementer names each landmark once from its pieces: the text as the frame shows it, or a selector for an
    icon or a shape.
  - The frame is then measured as a Figma frame: by place, with each offset traced to its first cause, and by its exact
    text.
  - Unnamed ink keeps the frame incomplete.
- **Constructs:**
  - a negative margin that pulls a text into place;
  - a nudge, by a transform, the translate property or a relative offset;
  - a cut text whose full text is nowhere to reach.

  Text over an icon is an overlap.
- **What only the owner may let stand.**
  - A total offset past 12 px, a text, a presence, a line, a construct or a broken column. Only an owner-level proposal,
    or an entry the owner accepted, covers these.
  - A moderate offset (12 px or less) may be proposed as the system's, and costs nothing in the score.
- **A review pass,** optional where a second agent can be started.
  - A fresh agent reads the references, the captures and the findings, never the builder's reasons, and says what
    the owner would return.
  - The builder fixes it and says what it did about each finding.
- **A review and tidy mode:** baseline the look, read the cost (constructs, fragile constructs, lines), rewrite the
  inside, and check against the baseline.

A critic and a verifier read draft 25. The verifier built about 30 new cases. They found:

- **12 defects in draft 25:**
  - shape corners widened a text's box;
  - grey text merged into a dark card;
  - repeated texts and selectors paired in DOM order;
  - in another font, a flex row drifted;
  - constructs were flagged on legitimate CSS: full bleeds, gutters, centring, carousels;
  - a selector over a container hid extra text;
  - one box could swallow every piece;
  - the 12 px cap applied to each step, not to the total.
- **Gaps the critic named:**
  - truncation without the full text reachable;
  - text overlapping an icon;
  - `owner` proposals.

Draft 25.1 fixes them, with regression tests. `node --test evals/design-to-code.test.mjs`: 93 passed.

## A regression corpus: named boxes replayed on the frozen submissions

The four server-card frames were named by hand with `boxes`: 24–35 pieces each, every piece named or skipped.
Draft 25.1's checker was replayed on every frozen submission of this record, without any model run:

| Submission | Its deciding findings by the blind review | Named by the checker |
|---|---|---|
| 21.1 | the price block 24 px lower at 601 | yes: price +24, footer +29, card +29 |
| 21.1 | the dense offer's layout at 764 and 280 | not a frame: the sweep's domain |
| 22.1 | columns 13–27 px off at 764 and 601 | yes: +12…+26 on each column |
| 22.1 | the stock icon after its count at 601 | yes: "Доступно 1" −27 |
| 22.1 | badges and type kept small at 280 | yes: offsets −8…−21 |
| 22.1 | the price in a larger type | yes, at 21.1 too: "wider than the font explains" by 21–28 px |
| 23.1 | the disk format against two frames | yes: "5587 × 4" missing, "4 × 5587" not in the design |
| 23.1 | columns 10–12 px off at 764 | yes, as moderate offsets (12 px or less) |
| control | 764 columns, 486 drift | yes: 12 px and −5…−6 |

**Noise left:** texts drawn as icons ("AMD", "?") read as page text not in the design. This is only because the corpus
skips icons, whose selectors differ per submission; an implementer names them by selector.

## Judge v2

**What v2 adds** to the server-card judge, alongside v1, which stays for comparison:

- a many-entries offer: 8 disk groups, 4 badges, a 40-character SKU;
- a growth check at 764, 601 and 280: the card grows taller than with the dense offer, and every disk group shows.

**The frozen submissions, re-judged by v2:**

- 21.1, 23.1 and the control are accepted.
- **22.1 is returned:** it shows 4 of 8 disk groups at every width, silently dropping data.

## The runs: draft 25.1, three arms

One Sonnet run per arm, started together.

- **Listing** (the public case, with specs: the Figma path), without the review pass.
- **Server card A,** without the review pass.
- **Server card B,** with it. The builder stopped at "ready for review". A fresh Sonnet agent then ran the review pass from
  `references/review-pass.md`, and its findings went back for one round.

| Arm | Judge v1 and v2 (automatic) | Evidence status | Wall time · tokens · tool calls | Check rounds |
|---|---|---|---|---|
| Listing | **accepted**, visual part included (its judge has one) | `pass`, an empty ledger | 6:20 · 137k · 34 | 5 |
| Card A | accepted | `pending`, 60 proposed | 63:34 · 318k · 136 | 135 |
| Card B, builder | accepted | `pending`, 52 proposed | 41:00 · 308k · 126 | 85 |
| Card B, review pass | — | — | 0:40 · 80k · 15 | — |
| Card B, after its round | accepted | `pending`, 61 proposed | +2:10 · +6k · 5 | 85 |

**The review pass** accepted B, with one optional finding: a word broken at 240 px, below the narrowest frame. B fixed
it.

**The blind review, under the owner's criteria.** Three submissions, keys revealed after the verdicts:

| Submission | Verdict | Deciding finding | Rank |
|---|---|---|---|
| 25.1 A, no review pass | returned | the network popover opens above the icon without flipping: a card near the top of the page cuts about 10 px of it. All nine card captures had no material finding. | 1 |
| 25.1 B, review pass | returned | on long prices at 280 (dense and many) the period breaks from its price: "₽ /" ends one line, "месяц" starts the next. The review pass saw this wrap and called it fine. | 2 |
| 23.1 | returned | the disk format against two frames, as in iteration 1 | 3 |

All three grew with eight disk groups, and none dropped data or overlapped.

## What this shows

- **Draft 25.1 is the closest yet.** Its frames, dense data and many entries had no material finding in submission A.
  What returned A and B is what the checker does not test:
  - **an open popover inside the window:** the journeys see it open, not whether the page edge cuts it;
  - **what must stay together:** a price with its period, a value with its unit. The lines check it only where the
    builder declares it, and neither did.
- **The review pass did not help in this one A/B.** A fresh Sonnet with the owner's criteria was more lenient than the
  blind judge: it saw the split price and accepted it. One pair says little about the mode in general. It does say
  that the review pass needs the owner's concrete examples, as the judge's prompt had them.
- **Draft 25.1 costs two to three times as much on a screenshot card:**
  - 85–135 check rounds, against 11–12 before;
  - 300k+ tokens, against about 220k;
  - 40–60 minutes, against about 20.

  Every offset of 12 px or less is a finding that needs a ledger entry, so the builders looped and then generated their
  ledgers: 52–61 entries, mostly pixel regions, B's from a script it wrote. That contradicts the owner's own stance, that
  a moderate mismatch is fine.
- **The listing case,** on the Figma path with specs, passed in 6 minutes with nothing proposed.
