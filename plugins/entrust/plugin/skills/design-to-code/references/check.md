# The check

`node "<skill-dir>/scripts/design.mjs" check <design.json>`, run from the project that has Playwright, compares each
[frame](#frames) in Chromium with its spec and image, runs [the sweep](#the-sweep) with the
[generated conditions](#generated-conditions) and the [journeys](#journeys), applies [the ledger](#the-ledger) and
writes [the output](#output). [Findings and notes](#findings-and-notes) says what blocks.

## What a check runs

A **complete check** runs every frame, the sweep and the journeys; only it writes `handoff.md` and the gallery.
`--frame <name>` checks one frame, `--no-sweep` skips the sweep, and `--quick` sweeps at the frames' widths only,
without journeys, for tuning.

**Exit codes**, the first that applies: 1 a finding, a ledger fault, a failing journey or acceptance row; 2
something not measured (a frame without its image or showing text its spec lacks, named boxes not ready, a root or
setup that fails, a story or condition not swept, an alignment group never of two); 3 what remains awaits the owner;
0 a pass. A complete check is also incomplete when:

- an acceptance row in `review.md` is blank, unrecognised or unmeasured ([the list](review.md#the-acceptance-list));
  with no rows, nothing is assessed;
- an opener (`aria-expanded`, `popovertarget`, `aria-haspopup`) or an overlay frame has no journey that opens and
  closes it;
- a `frames/<name>/reference.png` has no frame (context images go in `context/`);
- a declared line never shows two of its pieces;
- there is no sweep or no story, unless `design.json` gives `"static"` with its reason (one layout at one width,
  never frames at several);
- a story on a frame's own URL has no setup but `wait`, so it is the frame again;
- a line of the owner's past returns (`.design/returns.md` beside the task's folder) is not quoted in an acceptance
  row.

**Rounds.** The score adds what is not settled, findings and proposals alike; notes count nothing. The summary gives
the round before and the lowest among rounds measured the same way, and says to stop adjusting after two rounds
without a new lowest. **Before** is the page the first check saw; delete `out/before/` for a new baseline.

## design.json

Paths are relative to the file.

| Field | Meaning |
|---|---|
| `url` | the page that renders the component: `http(s)://…`, or a file path with its query |
| `root` | CSS selector of the component's root; the first match a person can see |
| `host`, `viewport` | the element given each frame's width, when the container sizes the component, and the viewport then (default 1280) |
| `tolerance` | how far a position may differ, in CSS px; default 1 |
| `ledger` | the ledger's file, usually `deviations.json` |
| `kit` | the UI kit's class prefixes, `["Mui", "ant-"]`: its negative gutters and offsets are not constructs |
| `frames[]` | `name`, `width`, `spec`, `reference`; optionally `url`, `viewport`, `setup` and `root` (a state drawn outside the component, such as a popover) |
| `sweep` | `from`, `to`, `step` (default 8), `setup`, `stories`, `switches`, `align`, `lines`, `generate` |
| `static`, `journeys` | why the page needs no sweep; [what a user does](#journeys) |

`stories` are more data or states, `[{ "name": "dense", "url": "…", "setup": [] }]`; its acceptance row says what
each adds. `switches` are the widths where the layout should switch, measured a pixel either side. `align` names
groups that line up: `{ "selector": ".price", "edge": "right" }`. `lines` are rows of pieces, when you declare them:
`{ "name": "top row", "pieces": [".sku", { "selector": ".ram", "wraps": true }, ".price"], "from": 640, "when":
"[data-mode=wide]" }`. `generate: false` skips the generated conditions.

`setup` steps run in order: `{ "click": "<selector>" }`, `hover`, `focus`, `tap`, `{ "move": [x, y] }` or a selector,
`{ "fill": ["<selector>", "<text>"] }`, `{ "press": "Escape" }`, `{ "wait": 200 }`. A step on what never appears
fails in 5 seconds.

## Journeys

Each journey opens the page afresh at the widest frame's width (by touch with `"touch": true`, on its own `url` if it
gives one) and runs its `steps`: setup steps, `{ "width": 320 }`, and expectations, each given a second to come true
as a person sees it: `visible`, `hidden` (none seen), `{ "text": ["<selector>", "<text>"] }` and `focused`. A
journey with no expectation is an error; the first step that does not hold fails it.

An opener is covered by a passing journey that acts on it while its content is hidden, sees the content (inside the
target `aria-controls` or `popovertarget` names), acts again and sees the same selector hidden; an overlay frame, by
one that acts on the element its setup opened it from. Each journey that opens something also runs with the opener
at the window's top and bottom edges, at the widest and narrowest frames' widths: the overlay it shows must be whole
in the window and in every box that clips it. An opener in a fixed or sticky bar is not tried there.

## Frames

A spec landmark is a text, found whatever its spaces, case and markup, or a `selector` for an element without text,
with its `box` in the design.

**From Figma**, texts are compared by position, height and `font` (size, weight, line height, colour) where the spec
gives it, and by width where it says `widths`, as a snapshot does. Design text that is absent and text cut by a
clipping box are findings; page text the spec lacks leaves the frame incomplete, unless an accepted `presence` entry
names it. A text cut with an ellipsis or a line clamp is truncated on purpose.

**From a screenshot**, name its boxes: `design.mjs boxes <reference.png> --width <px>` writes `spec.json` with every
piece of ink and every filled shape numbered, and `boxes.png` to read the numbers from. Fill `landmarks`:

```json
{ "landmarks": [
    { "text": "5587 × 4", "pieces": [11, 12, 13] },
    { "selector": ".offer__stock-icon", "pieces": [35] } ],
  "skip": { "31": "the page's shadow, not the component" } }
```

A text reads as the frame shows it; a selector names the page's element for an icon or a shape. The frame is not
measured while a landmark has no text or selector, names a missing piece or takes in another's, or a piece is named
twice; ink in no landmark and not skipped keeps it incomplete. The page's boxes are made tight to their ink and
compared by place within 4 px. A text wider in the page's font moves the next piece, and that is the font's; heights
are not compared. **The type's size** is the trimmed mean (the middle 60 %) of the page's ink heights over the
design's, with five texts or more: 10 % or more off is a `type` finding.

Either way, texts stacked on one left edge stay on it (`align`), an area outside the texts whose pixels differ is a
`region`, and a font the page asks for that cannot draw its text is named.

## The sweep

The sweep narrows one mounted page from `to` to `from` every `step` px and through each frame's width, then widens
back; each story and generated condition the same way. At each width:

- `overflow`: the document or the root wider than its box; `outside`: text past the root; `clipped`: text cut by an
  `overflow: hidden` box; `resize`: the widest layout not restored;
- `overlap`: two texts over each other, or text over an icon of 64 × 64 px or less;
- `covered`: a control with another element over its centre or two inner points (not its label or a fixed bar);
- `align`: a group's edges further apart than the tolerance, where it has two elements;
- `line`, for a declared line where its range and `when` hold: its pieces share a row, in order, each on one line
  unless it `wraps`;
- `switch`: a layout change away from `switches`, or none near one;
- `wrap`, reading a line's text across inline elements and a row's flex items:
  - "/" left at a line's end after a value (a number, a currency or per-cent sign): "₽ /" | "месяц";
  - "×" split from its numbers;
  - a word broken between its letters, unless `hyphens: auto`;
  - **wraps with room**: a text of two to six words that wraps, though with its own limits lifted (no wrapping, no
    maximum width, no shrinking) it fits the component on one line and runs into no other text: a price and its
    period, a value and its unit, a label. A line clamp or an ellipsis is a choice, not a wrap;
- `construct`: a negative margin over 3 px (not a bleed, nor the kit's), a nudge of 2 px or more by a transform,
  `translate` or a relative offset (not centring or a slide), a text cut on purpose with no title or accessible name.

"Fragile under other data" warns of text positioned out of the flow and of a box whose text runs past its height.

## Findings and notes

A finding blocks the handover until it is fixed or the owner accepts it. A note needs nothing: what the system or a
font explains, or pixels alone, shown for the owner's eye; a ledger entry for one changes nothing. Notes are:

- an `x` or `y` offset of 12 px or less, or a drift up to 24 px carried from the pieces before while its own step
  is 12 or less;
- a pixel `region`, such as a stand-in icon;
- a text's `width`, wider or narrower than drawn (its size is the `type` finding's);
- a `height` within 24 px;
- a frame's column edge (`align`) within 12 px;
- in the sweep, a `construct` and a `switch`.

Everything else is a finding: an offset, a drift, a height or a column edge past these; a gap of 8 px or more that
closes to under 4; the root's width; a presence, a text, a font, the type's size; a cut, an overlap, a covered
control, an overflow, a line, a wrap, a sweep alignment, a resize.

**Start here** names a frame's first cause from the top: an offset between two neighbours, or a landmark's width or
height that carried them. An offset marked *inherited* goes with its cause.

## Generated conditions

Unless `sweep.generate` is `false`, the sweep makes its own extremes:

- the frames' page with every text two fifths longer ("texts stretched");
- the frames' page with every set of repeated entries (siblings that share a class) doubled ("entries doubled");
- each story with its texts stretched.

They run at the frames' widths, the sweep's ends and the switches. Their texts are not the product's, so only
`overlap`, `clipped`, `outside` and `covered` count, under the condition's name. A layout that grows with its content
passes them; a fixed height around repeated entries, or text out of the flow, does not.

## The ledger

`deviations.json` is a list of entries, each matching the differences it names:

| Field | Meaning |
|---|---|
| `landmark` | a design text or a list of them, a selector, `root`, or `*` |
| `property` | a finding's property (`x`, `height`, `text`, `type`, `region`, `overlap`, `wrap`, …), or `*` |
| `region` | for `region`: `[x, y, width, height]` in the frame's CSS px |
| `frame` | a frame's name or a list of them; absent or `*` for all |
| `max` | the largest difference in px it covers, at each width; only one with a size |
| `actual` | for `text`: the text the page shows, which the check then looks for |
| `category` | the cause, for the owner: `design-error`, `missing-state`, `platform`, `system`, `owner`, `ux` |
| `status` | `accepted`, by the owner only, or `proposed`, by you |
| `reason` | a sentence the owner can judge: for what cannot be built, the construct tried and what was measured |
| `decidedBy`, `options` | who accepted it; for a proposal, the options and their cost |

An entry that matches a finding settles it: accepted, it excuses it; proposed, of any category, it leaves it pending
for the owner. A refused entry is deleted and the difference fixed. An entry excuses a cause and what it carries.

An entry is a fault, which fails the check, without a landmark (or a region), a reason, or a known property,
category or status; accepted without `decidedBy`; with `*` and not accepted; of `owner` and not accepted; for `text`
without `actual` or with more than one design text. Entries of one cause that cover more than three findings are
named first in the evidence, as broad excuses.

## Output

The console shows each verdict, the notes, where to start, the first findings and the score. In `out/`:

| File | What |
|---|---|
| `report.md`, `result.json` | every finding and note, the causes, the sweep and the journeys |
| `<frame>/page.png`, `side.png`, `diff.png` | the page now; design, page and difference side by side; the differing pixels |
| `handoff.md` | by a complete check, the evidence a handoff quotes: the status first, then the pictures, frames, stories with their longest texts, journeys, ledger entries, acceptance rows and what was not checked |
| `gallery.html` | by a complete check: design, before, after and difference per frame, with the stories and the ledger |
| `history.jsonl` | one line per check: round, status, score and what it was measured against |
