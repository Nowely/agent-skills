# Iteration 3: notes instead of ledger entries, what stays together, and overlays at the window's edges

[Iteration 2](27-iteration-2.md) left three things:

- **Two returns the checker could not see:**
  - 25.1 A's network popover opened above its icon and did not flip, so a card near the top of the page cut it;
  - 25.1 B's period broke from its price at 280 px ("₽ /" | "месяц").
- **A cost that contradicted the owner's stance:** every offset of 12 px or less was a finding that needed a ledger
  entry. The builders took 85–135 check rounds and wrote 52–61 entries, mostly pixel regions.
- **A lenient review pass:** a fresh Sonnet with the owner's criteria saw the split price and accepted it.

## What changed: draft 26

- **A moderate offset is a note, not a finding.**
  - On a screenshot spec, an `x` or `y` offset within the band is listed in the report and the evidence file, and
    needs nothing. The band is 12 px, or 8 px on a frame 400 px wide or narrower.
  - This holds whether or not the ledger proposes the offset: a proposal for it holds nothing pending.
  - Past the band, only the design's error, a state it lacks or the owner's call excuses an offset.
- **Relations.** Two pieces side by side keep one of four distances:
  - the gap between them (a flow);
  - their left edges (fixed tracks);
  - their right edges;
  - their outer edges (free space between a left and a right group).

  When none holds within the band, the pair is a finding: two moderate offsets the other way round. A pair with a
  piece already past the band is left to that piece's own finding.
- **What stays together** (`wrap`, read on every story at every width, with nothing to declare):
  - a separator left alone at a line's end;
  - a number broken across lines, or split from its unit or currency;
  - a word broken between its letters, unless the page sets `hyphens: auto`.

  Prose wraps where it wraps: a line may end on "5%" or "Note:".
- **Overlays at the window's edges.** Each journey that opens something from an opener also runs with the opener at
  the window's top edge and at its bottom edge. On each `visible` step, an overlay (positioned out of the flow, or with
  a popup's role) must be whole in the window.
- **`--quick`** checks every frame and sweeps every story at the frames' widths only, without journeys: for tuning.
  The complete check stays the evidence.
- **Acceptance rows.** A row checked by `sweep.stories` that names stories in inline code answers for those only, and
  a failing row says what failed.
- **The page:**
  - keep together what belongs together (a no-break space, `white-space: nowrap` on the group);
  - place a popover with the kit's popover or CSS anchor positioning with a fallback, not hand-written offsets;
  - tune with `--quick`, and batch the fixes a check names.
- **The review pass** lists the return classes with one example each: a split price, a popover cut at the window's
  top. It also says where returns hide: the dense and many-entries stories at the narrowest width, and each overlay
  with its opener near the window's edges.

## Replay before any model run

### The frozen submissions' own packs, under draft 26

Each 25.1 submission was checked again with its own `design.json`, ledger and stories, unchanged:

| Submission | Draft 26 names | The blind review's deciding finding |
|---|---|---|
| 25.1 A | 16 journeys fail with "outside the window: flip or shift it", 6 to 128 px; the dense price splits at 240–252 px | the network popover cut at the top of the page |
| 25.1 B | the dense price splits at 240–288 px: "a line ends on “/”, split from “месяц” below" | the period breaks from its price at 280 |

Both returns are now the checker's findings.

### A positive control

25.1 A, with one change: its popover opens below its icon when the window has no room above. Judge v2 accepts the
automatic part, and all 41 of the arm's journeys hold, including at both window edges. The dense price split at
240–252 px remains: 25.1 A swept from 240, below the contract's narrowest width.

### The named-box corpus

The four server-card frames, named by hand, replayed on every frozen submission without a ledger:

- **Draft 26's first relation rule was noise.** It compared only the gap after a piece and flagged:
  - free space between a left and a right group (a 481 px gap before "Доступно 1");
  - a text's end against the next fixed column;
  - the consequence of a piece that had already moved on its own.

  Checking four distances, and leaving a moved piece to its own finding, leaves the rule silent on the corpus. Every
  deciding frame finding of iteration 2's table is still named.
- **The corpus's own labels joined a help icon to its text** ("MC-LAG 25/25 ?", "PSU ?"). The check's hint says to give
  such a landmark its own box; the corpus now does.
- **Draft 26's first wrap rule flagged prose:** a line ending on "5%" or "Note:". It now flags only a separator left
  alone, a split number, and a word broken between letters.

## The critic and the verifier: draft 26.1

A critic read draft 26 against the owner's stance and ran the checker on its own small cases. A verifier built about
40 cases of its own. Between them:

- **The wrap rule missed the return it was written for.** It read one text node at a time, so a price rendered as
  `{amount} ₽ / {period}`, as a component writes it, split unseen. Its message also led to a fix it could not check.
- **It flagged prose:** "2020" | "and" as a number and its unit, "21," | "2026" as a broken number, Chinese and
  Japanese labels as broken words, a breadcrumb's "/" and a list's "·".
- **Notes held only for screenshots.** A Figma frame still made every 6 px offset a finding, the cost the owner had
  objected to, while the page promised notes for every frame.
- **Quick rounds shared the score series** with complete checks, so the two-round rule fired on the first complete
  check after tuning, pushing proposals instead of fixes.
- **A passing frame printed "start here"** for its notes, and the page told builders to fix it.
- **Relations:** a centred title in another font and a narrower root were read as broken relations. Vertical
  neighbours and a gap that closed up while the edges held were not read at all.
- **Overlays at the edges:** an opener named with a Playwright selector was never moved. A `visible` precondition, a
  child selector, an invisible tooltip in another row, a sticky header and a fixed bottom bar each gave a false pass,
  a false failure or a timeout. A popover cut by a scrolling box was not seen.
- **A `--quick` crash** when no frame width lay inside the sweep, and acceptance rows that passed on a misspelled story.
- **The 8 px band on narrow frames** had no evidence behind it: a 390 px and a 414 px frame got different rules.

**Draft 26.1:**

- **Wrap** reads a line's text across elements. "/" counts only after a value. Units come from a list. Words count
  only in space-delimited scripts, and long digit runs count as words. A short pair joined by an ordinary space is a
  "may split" forecast, since the sweep can step over the width where it splits.
- **Notes** hold for every frame, from Figma or a screenshot, within one 12 px band. The relation and column rules
  apply to every frame too. A proposal past the band is named in its finding as excusing nothing.
- **Relations** add centres, and vertical neighbours. They skip a pair neither of which moved on its own. A gap of
  8 px or more that closes to under 4 px is a finding.
- **Overlays:** the opener is found through Playwright, at the widest and the narrowest frame's width. The first
  overlay after the opener's step is measured: the first match a person sees, or its nearest overlay ancestor. The
  window and every box that clips it count. An opener in a fixed or sticky bar, or one that is covered or not
  scrolled to the edge, is noted as not tried.
- **Quick rounds** score in their own series; the summary says journeys were not run.
- **"Start here"** only for a frame with a finding. The report lists the notes.
- **Acceptance rows:** unmeasured stories count only for the rows that name them, and a row naming no configured
  story is incomplete.
- **The pages:** sweep from the narrowest width the product supports, not below. A break before "/" moves the period
  whole. The review pass states the band.

**Not taken:** an en dash in a price range; `text` steps at the window's edges; a dropdown inside a modal at the edges;
two landmarks with the same text in the relation rule.

## The run: written down before it starts

One Sonnet run of draft 26.1 on the server card, with the same brief, kit, start project and contract as 25.1 A, and
no review pass. Judged by judge v2 (automatic) and a blind review against 25.1 A and the positive control, under the
owner's criteria, with the key revealed after the verdicts.

Draft 26.1 does what it was made for if all three hold:

- **accepted** by the blind review, or returned only for a class no earlier submission was returned for;
- **fewer than about 30 check rounds** (25.1: 85–135);
- **fewer than about 10 ledger entries** (25.1: 52–61).

## The run: draft 26.1 on the server card

| | Draft 26.1 | 25.1 A | 25.1 B |
|---|---|---|---|
| Judge v2, automatic | accepted | accepted | accepted |
| Evidence status | `fail` (two findings at 601) | `pending` | `pending` |
| Check rounds | **27** | 135 | 85 |
| Ledger entries | **6** | 60 | 52–61 |
| Wall time · tokens · tool calls | 24:07 · 257k · 98 | 63:34 · 318k · 136 | 41:00 · 308k · 126 |

The worker handed over honestly at `fail`: "implemented, with the differences below open". The two findings it
could not settle, both at 601:

- **the price 21 px wider than the font explains:** the kit's `t-price` is bolder and wider than the drawn price.
  Only an owner-level cause may excuse that finding, and the worker proposed `platform`;
- **a "broken relation":** the free space between the power help and the stock icon is 21 px shorter, because the
  stock text to the icon's right is wider in the page's font. This is a false positive of draft 26.1's relation rule.

The worker used the edge runs as intended. They caught its popover cut at the window's edge, and it rebuilt the
popover with CSS anchor positioning and flip fallbacks.

## The blind review

Same prompt as iteration 2, three submissions, key revealed after the verdicts:

| Submission | Verdict | Deciding finding |
|---|---|---|
| positive control (25.1 A, its popover flipping) | **accepted** | none |
| 25.1 A | returned | the network popover cut at the window's top, as in iteration 2 |
| draft 26.1 | returned | on every dense and many capture, "/ месяц" on its own line under the price; at 764 with 430 px of the row free, since the price block is capped at about 182 px |

Draft 26.1's four frames, its popover and its growth had no material finding. The reviewer called the 601 price
width "the kit's `t-price`, the same in all three" and did not count it. It did not mention the stock icon.

## What this shows

- **The return came from the page, not from the worker.** The critic's first finding warned that a break before "/"
  still splits the price from its period. I kept that break as allowed, and the page told builders that "/ месяц" may
  move to the next line whole. The worker did exactly that: `nowrap` on the amount and on the period separately,
  inside a block that wraps. Its own dense price split at 400 px, which the check then passed by my exemption.
- **Name the owner's class literally.** "A price separated from its period" is the owner's own example. A
  typographic compromise on it was a return.
- **The dense story's values decide what is tested.** The contract says only "an amount can be long". The worker used
  "1 125 898,00 ₽"; the judge used "1 234 567 890,00 ₽", which split at every width.
- **The cost problem is solved.** Notes instead of ledger entries cut the rounds by four to five times and the entries
  by ten, and the worker spent its rounds on findings, not on proposals.
- **Two strict findings were not the owner's:** the kit's price token and free space before a right-aligned group.
  Each kept the evidence at `fail`. A strict rule that the owner would not return for costs a handover.
- **Draft 26.1 does not meet the rule written before the run.** It was not accepted, though it took 27 rounds and 6
  entries.

## Fable's reflection

- **The pages disagreed.** The builder page allowed a break before "/"; the review prompt listed "a price on one line
  and its period on the next" as a return. Each agent applied its own sentence. The result shows the disagreement, not
  what the owner thinks of "1 234 ₽" | "/ месяц".
- **The reviewer described a capped block,** about 182 px while 430 px of the row stood free: a fixed width around
  content that grows, the owner's "nailed down" class. The construct list named only fixed heights.
- **The pattern of three iterations:** the frames stopped producing returns after iteration 2. Every return since
  sits on an axis the builder did not push to its limit: the window's position, the narrowest width, a value's length.
- **The checker and the reviewer disagreed both ways:** the checker failed two things the reviewer waved off, and
  passed the one it returned. The reviewer accepted the control, so it does tell work apart.
- **A rule as first proposed, nowrap on the whole price, has no legal outcome at narrow widths.** A ten-digit price may
  not fit 280 px, which leaves the builder only hacks. Its logical form: a group that breaks while the component could
  hold it unbroken is a finding; wider than the component, a break before "/" is the last resort, for the owner.
- **A checker rule is worth keeping only once it has caught something real.** Two were added on reasoning alone; one
  of them ended a run at `fail`.
- **Still one run per arm,** judged by a Sonnet reviewer with a prompt I wrote. The owner's first verdict on Terra will
  outweigh it.
