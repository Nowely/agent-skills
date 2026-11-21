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

The draft's own tests (v25 and v26): 11 passed. The full suite is rerun with the critic's and verifier's fixes.
