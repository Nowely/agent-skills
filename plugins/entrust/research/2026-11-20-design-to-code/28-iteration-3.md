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
