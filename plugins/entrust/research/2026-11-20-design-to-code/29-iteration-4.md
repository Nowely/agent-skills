# Iteration 4: the price as one group, values the contract leaves open, and fewer strict rules

[Iteration 3](28-iteration-3.md) cut the cost by four to five times, but draft 26.1's submission was returned for
the price split from its period, a break the page itself had allowed. Fable read the result before anything was
built.

## What changed: draft 27

- **A value and its period are one group.** A break on either side of "/" ("₽ /" | "месяц", "₽" | "/ месяц") is a
  finding while the component could hold the whole group on one line; the finding gives the group's width against the
  component's. Only a group wider than the component itself may break before its "/": the last resort, a warning for
  the owner. The page: `nowrap` on the whole group, not on its parts, and its block takes the group's width; a fixed
  or maximum width around content that grows is a construct, as a fixed height is.
- **The "may split" forecast sees a break between elements,** as between a `nowrap` amount and a `nowrap` period
  inside a block that wraps.
- **Values the contract leaves open:** the dense story takes a value that does not fit its line at the narrowest
  width, so the fallback shows, and the builder asks the owner for the bound. The evidence file lists each story's
  longest texts.
- **The kit's type token** may be proposed as `system` for a text wider than the font explains, in one entry with no
  frame, giving its measured size against the drawn one.
- **The five-distance relation rule is gone:** it never caught a real return and ended a run at `fail`. A gap that
  closes until two pieces nearly touch stays a finding.
- **The pages agree:** the review pass names the same price classes and the kit's token as the builder page.

## Replay before any model run

- **Draft 26.1's frozen submission, with the judge's long price ("1 234 567 890,00 ₽"):** the split is named at
  280–284, 404–524 and 636–724 px, with the group's 215 px against the component's 692. On the builder's own data it is
  named too: its dense price at 404–460 px and its short plain price at 500–604.
- **The positive control:** silent from 280 px up. Its only finding is "₽ /" | "месяц" at 240–252 px, below the
  contract's narrowest width, which it swept from.

## The run: written down before it starts

One Sonnet run of draft 27 on the server card, the same case and brief, no review pass. Judged by judge v2 and a blind
review against the control (the same prompt), key revealed after the verdicts. Draft 27 does what it was made for if
all four hold:

- accepted by the blind review;
- fewer than about 30 check rounds;
- fewer than about 10 ledger entries;
- the evidence file ends at `pass` or `pending`, the states the page allows a handover in.

## The run: draft 27 on the server card

| | Draft 27 | Draft 26.1 | 25.1 A |
|---|---|---|---|
| Judge v2, automatic | accepted | accepted | accepted |
| Evidence status | `fail` (four column offsets at 764, 13–14 px) | `fail` | `pending` |
| Check rounds | 31 | 27 | 135 |
| Ledger entries | 2 | 6 | 60 |
| Wall time · tokens · tool calls | 32:54 · 264k · 103 | 24:07 · 257k · 98 | 63:34 · 318k · 136 |

The worker handed over honestly at `fail`. What kept it there is one cumulative drift, not four errors. The price is
wider (the kit's price token), so each column before it steps 5–6 px left, until the total at 764 passes 12 px. Since
draft 25.1 a total past the band is strict, however it was split into steps. Even a `system` entry for the kit's token
could not excuse what the token pushes: a contradiction inside draft 27.

It asked the owner three questions: the bound on a price, one disk format for every layout, and whether the wide
layouts' 13 px values are meant when the kit says 15.

## The blind review

The same prompt; draft 27, the positive control and draft 26.1 again as an anchor, under a new key:

| Submission | Verdict | Notes |
|---|---|---|
| positive control | **accepted** | the larger price called the kit's token, borderline |
| draft 27 | **accepted** | columns at 764 about 15 px right, "systematic, order kept"; type sizes and card heights closest to the frames |
| draft 26.1 | returned | the price split from its period on all five dense and many captures, as in iteration 3 |

**The first submission built by a model, not corrected by hand, that the blind review accepts.** The reviewer was
consistent across sessions: it returned 26.1 for the same class twice, with fresh keys.

## Against the rule written before the run

- accepted: **yes**;
- fewer than about 30 check rounds: **31**, at the limit;
- fewer than about 10 ledger entries: **yes, 2**;
- the evidence file at `pass` or `pending`: **no**, `fail`, held there only by the column drift the reviewer accepted.

Three of four, and the fourth failed on a strict rule that the owner's reviewer would not return for.

## The architecture review

A fresh critic read the skill, the checker and the records, without my hypothesis. Its reading:

- **The checker has converged on the frames; the loop has not converged on the conditions around them,** and as built
  will not: each return adds a detector, while the builder still chooses what gets rendered. The axes are few and
  known (width, text lengths, list counts, optional elements, where an overlay sits, input mode, a fallback font);
  list each axis's extremes and render them, instead of waiting for a run to show the next one.
- **With a model that follows the page literally, a false finding costs more than a miss.** Block only on checks with
  near-zero false findings (text over text or an icon, text cut or outside, dropped data, a broken journey, a text or
  order unlike the frame, an offset past the band, and one general "wrapped with room" test: re-render a short text
  with `nowrap`; if nothing overflows, the wrap was avoidable). Everything else is a note. A unit list and a grammar
  for "/" in the checker are this case's price written into code.
- **Too large for Terra:** SKILL.md is about 2,400 words, all pages about 10,100. Terra's one accepted submission (v14)
  used a 1,250-word page; its last run (v19) never ran the checker.
- **The evaluation is not sound yet:** one case, one run per arm, a reviewer prompt written by the drafter, a review
  pass quoting the judge's examples. Cheapest reliable signal: the owner labels the frozen captures once, to measure
  how far the model reviewer agrees with the owner; checker changes are judged on frozen submissions and mutants, not
  model runs; claims about a draft rest on k of n runs on two cases.
- **Outside:** category-partition and pairwise testing, pseudo-localization (every string lengthened automatically),
  property-based data with shrinking (fast-check), layout primitives and anchor positioning that prevent the failures
  by construction.
- **Its plan:**
  1. freeze draft 27 for Terra;
  2. calibrate on the owner's own accepted build;
  3. the owner rules on the returns and labels the captures;
  4. seed the extremes into the start project;
  5. run Terra;
  6. only then generate the conditions from a contract, two tiers of checks, and a one-page builder skill.

## The owner's decisions

Asked after the review, with the reviewer's and the critic's readings before them:

- **Direction: Terra now.** Draft 27 is frozen for Terra, as is. A new draft only for a bug in the mechanics, and the
  rebuild the critic proposes only after Terra's result.
- **A price with its period wider than the card itself:** "/ месяц" moving to the next line whole is acceptable, as the
  last resort. A break while the card has room stays a return. This is what draft 27 checks.
- **The columns at 764 about 15 px right** (the kit's font and price token, order and alignment kept): "hard to say,
  the visual differences need looking at, but most likely it needs reworking". The model reviewer accepted this drift;
  the checker blocked it. On this point the checker is closer to the owner than the model reviewer, so the 12 px band
  on the total offset stays, and the small fix proposed before (the kit token's drift not blocking) is not made.

**Then, on the side-by-side picture of 764** (design, draft 27, the control, and an overlay): "on the picture it looks
OK; the only problem seems to be the font size". So the 15 px column drift is not a return, and the model reviewer was
right about it; the checker's block on it was a false finding. But draft 27's values are set about 10 % smaller than
drawn (13 px where about 15 is drawn), which the model reviewer called minor and the checker does not compare on a
screenshot at all. Measured over every frozen submission, the trimmed mean of page-to-design ink heights is 1.00 on
the wide frames and 0.92–0.99 at 280 for all others; draft 27 reads 0.90–0.91, and 0.84 at 280; 22.1 at 280,
returned in iteration 1 for type kept small, reads 0.84. Both readings go to draft 28: a carried drift is a note, and
a type of another size is a finding.
