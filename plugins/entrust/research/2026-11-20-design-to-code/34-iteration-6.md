# Iteration 6: draft 28.2 against 28.1 on Sonnet, three runs each

The question, from [the plan](33-five-iterations-plan.md): do draft 28.2's rules cut the cost? Read as done when
responses and tokens per round fall by at least 30 % with the arms' ranges not overlapping, quality as seen and as read
no worse, and no failure the checker itself causes.

## The runs

Sonnet on the server card (judge v2) and on the listing case (its own judge, visual part included), three runs per arm.
28.1 at `477db31`, 28.2 at `df2299d`. No review pass was run by any builder: a builder running as a subagent cannot
start a second agent.

| Server card | 28.1 | 28.2 |
|---|---|---|
| Judge v2, automatic | 3 of 3 accepted | 2 of 3 (one returned: disk groups past 4 cut) |
| Check rounds | 11, 13, 20 | 10, 11, 12 |
| Tool calls | 75, 91, 95 | 51, 76, 79 |
| Tokens, thousands | 221, 247, 253 | 204, 238, 257 |
| Wall time, minutes | 18, 22, 25 | 14, 19, 22 |
| Calls per round | 4.6–8.6 | 5.1–6.9 |
| Tokens per round, thousands | 12–20 | 20–22 |
| Evidence status | `pending` ×3 | `pending` ×3 |
| Ledger proposals | 1–2 | 1–2 |

| Listing | 28.1 | 28.2 |
|---|---|---|
| Its judge, visual included | 3 of 3 accepted | 3 of 3 accepted |
| Check rounds | 4, 4, 5 | 4, 4, 6 |
| Tool calls | 17, 18, 21 | 17, 20, 25 |
| Tokens, thousands | 105, 109, 110 | 99, 114, 123 |
| Wall time, minutes | 3.3–4.0 | 2.9–4.6 |

No run had a failure the checker itself caused.

## The blind review, as seen and as read

Two reviewers, three cards each, keys revealed after the verdicts. The prompt added the owner's precedent (a card
returned for values set about 2 px smaller than drawn) and the five code questions from the plan.

| Card | Draft | Verdict | Deciding findings | Rank in its set |
|---|---|---|---|---|
| c282c | 28.2 | returned, narrowly | the price at 486 set 2 px smaller than drawn (body bold, not `t-price`); units hidden from screen readers | 1 of 3 |
| c281c | 28.1 | returned | the price about 2 px larger than drawn; help icons grouped with the wrong label; `.kit-badge` changed for the whole page; the chip rendered twice | 2 of 3 |
| c281a | 28.1 | returned | the price 2–3 px larger in every frame, which pushes the period onto its own line at 280; an observer and a resize listener leak on every render; a page-wide icon rule | 3 of 3 |
| c282a | 28.2 | returned | footer one type class too large; the price at 486 2 px smaller; the SKU at 280 2 px larger; unscoped selectors. Code otherwise the soundest | 1 of 3 |
| c282b | 28.2 | returned | disk groups past 4 silently cut; entries under the wrong columns on dense data; views duplicated; units hidden | 2 of 3 |
| c281b | 28.1 | returned | the price 2 px larger in every frame; an unstyled discount button; "×2CPU"; the period split at 280; a generic `.card` root | 3 of 3 |

**What recurs across both drafts,** and so is the skill's, not one builder's:

1. **A single text's type 2 px off,** most often the price. The check reports a type finding only for a frame 10 % off
   on average or a text 20 % off. The reviewer measured subpixel digit heights and saw what the check does not.
2. **Selectors reaching outside the component** (a bare `.card`, kit classes changed page-wide): 6 of 6.
3. **Units hidden from screen readers** with `display: none`: 5 of 6.
4. **One thing rendered twice,** the copies switched by CSS (disk formats, the chip): 5 of 6.
5. **Data silently cut:** 1 of 6.

## Against the rule written before

- **The cost: no effect shown.** The ranges overlap on every measure. 28.2's rounds are tighter (at most 12, against up
  to 20), and its mean calls and time are a little lower, within the noise.
- **The pathology the rules were written against did not occur on Sonnet** in this harness: 10–20 rounds, no polling.
  Terra's loop of 31 rounds with an unchanged first finding, and its 134 polling responses, are not reproduced here, so
  this test cannot show the rules' effect on them. It shows that 28.2 costs no more than 28.1 and breaks no check.
- **Quality:** no worse. Under the stricter reviewer every card was returned, but 28.2's cards rank first in both sets
  and 28.1's last in both. One 28.2 card was returned by the judge for cut data.
- **The review pass was never exercised:** builders running as subagents cannot start a second agent, so "as read" so far
  rests only on the blind review.

## For the architecture critic, after this iteration

- **The type check's precision:** per-text differences of 2 px are the most common visible return.
- **Code-quality rules:** where do the four recurring code faults belong (the page, the review pass, the check)?
- **Testing the cost rules:** reproduce the loop pathology in a case, or go to the Terra run.
- **Cut data:** the generated doubling clones rendered rows, so a slice in code is not seen.

## The proposals handed to the owner, marked

The coordinator marked these provisionally against the owner's rulings in [30-terra-run.md](30-terra-run.md) and the
plan's two kinds. The owner's own marking replaces this one. The six listing runs handed over no proposal.

| Card | Proposal | Marked | Why |
|---|---|---|---|
| c281a | the discount icon 31 px right at 280, the price set "at the frame's size" in a wider font | doubtful, for the owner | the font's width is a fair question, but the reviewer measured the price 2–3 px larger than drawn: the builder could have fixed that, and it explains part of the 31 px |
| c281a | the network popover 34 px wider: its title in the kit's font | fair | the kit's font against the drawing |
| c281b | the same, 34 px | fair | the same |
| c281c | the same, 40 px | fair | the same |
| c282a | the same, 32 px | fair | the same |
| c282b | the same, 34 px against an uncropped image | fair | the same; its numbers include the shadow it left in its frame |
| c282c | the popover's width 9 px, "the reference includes the shadow" | fair | the same font question, explained wrongly: its own frame kept the shadow |
| c282c | the popover's height 32 px, "the image includes the shadow and tail" | unfinished | its frame kept the image's shadow and tail; other builders cropped their frame to the box |

Six fair, one unfinished, one doubtful.

- **One fair question, six times.** Every run handed over the popover's width following the kit's font. Once the owner
  rules on it, it is a ruling, and a later run that repeats it presents unfinished work.
- **The ledger carries only what the check shows.** None of the defects the reviewer returned for (a price 2 px off,
  disk groups cut, the code faults) reached it as a proposal or a note.
