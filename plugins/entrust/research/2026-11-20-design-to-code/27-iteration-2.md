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
