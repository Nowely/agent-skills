# The check

`node "<skill-dir>/scripts/design.mjs" check <design.json>`, run from the project that has Playwright, compares each
[frame](#frames) in Chromium with its spec and image, runs [the sweep](#the-sweep) with the
[generated conditions](#generated-conditions) and the [journeys](#journeys), applies [the ledger](#the-ledger) and
writes [the output](#output). [Findings and notes](#findings-and-notes) says what blocks.

## What a check runs

A **complete check** runs every frame, the sweep and the journeys; only it writes `handoff.md` and the gallery.
`--frame <name>` checks one frame, `--no-sweep` skips the sweep, and `--quick` sweeps at the frames' widths only,
without journeys, for tuning.

**Exit codes**, the first that applies: 4 [the gate](#the-gate) stopped the check; 1 a finding, a ledger fault, a failing journey or acceptance row; 2
something not measured (a frame without its image or showing text its spec lacks, ink no named box holds, a root or
setup that fails, a story or condition not swept, an alignment group never of two); 3 what remains awaits the owner
(a proposal, a journey disputed with the check); 0 a pass. For a 2, name what is missing (the ink's landmark, the
text in the spec, the row's evidence), or record why it cannot be, and check again. A complete check is also
incomplete when:

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
  row;
- a [candidate](#generated-conditions) is unanswered.

**Rounds.** The score adds what is not settled, findings and proposals alike; notes and candidates count nothing. The
console is a digest of fifteen lines at most: the round before and the lowest among rounds measured the same way, what
changed since (findings fixed, new ones), each frame's new findings with where to start and the unchanged ones as a
count; the full tables are in `report.md`. A finding is named by its key (frame, landmark, property), which neither
`--quick` nor a change of the specs alters. A round whose first finding has led two rounds says the next one stops at
the gate; after two complete rounds without a new lowest score, the verdict line says "stop re-running: fix it, propose
it with a reason, or report the check as blocked".
Each line of `history.jsonl` records the round's status, score and findings, whether it was `quick`, its `seconds` and
the `bytes` it printed, each frame's reference (`refs`: the image's and the spec's digests), and, at the gate,
`blocked` with the finding's key in `gate`.

### The gate

When the same finding, by its key, has come first in three rounds in a row, quick or complete, the check prints that
finding alone with what to do and exits 4. Two ways out: fix it, or propose that one finding in the ledger with a
reason (its frame, landmark and property). A list of landmarks, `*` or a region does not settle a finding the gate
stopped on: it stays a failure. After two stops in one history, `--quick` is refused and only the complete check
runs.

### The reference

The first round that checks a frame records its reference: the image, and what the spec expects (its size, each
landmark's box). A later round whose image differs, or whose spec drops a landmark, moves one or changes the frame's
size, has a `reference` finding, "changed since round N", first of all, until a ledger entry for that frame
(`"frame"`, `"property": "reference"`) says why. Naming more pieces is free; making the frames before the first check
is too.
**Before** is the page the first check saw; delete `out/before/` for a new baseline.

## design.json

Paths are relative to the file.

| Field | Meaning |
|---|---|
| `url` | the page that renders the component: `http(s)://…`, or a file path with its query |
| `root` | CSS selector of the component's root; the first match a person can see |
| `host`, `viewport` | the element given each frame's width, when the container sizes the component, and the viewport then (default 1280) |
| `tolerance` | how far a position may differ, in CSS px; default 1 |
| `ledger` | the ledger's file; `deviations.json` beside design.json when not given |
| `kit` | the UI kit's class prefixes, `["Mui", "ant-"]`: its negative gutters and offsets are not constructs |
| `frames[]` | `name`, `width`, `spec`, `reference`; optionally `url`, `viewport`, `setup` and `root` (a state drawn outside the component, such as a popover) |
| `sweep` | `from`, `to`, `step` (default 8), `setup`, `stories`, `switches`, `align`, `lines`, `generate` |
| `static`, `journeys` | why the page needs no sweep; [what a user does](#journeys) |

`stories` are more data or states, `[{ "name": "dense", "url": "…", "setup": [] }]`; its acceptance row says what
each adds. `switches` are the widths where the layout should switch, measured a pixel either side. `align` names
groups that line up: `{ "selector": ".price", "edge": "right" }`. `lines` are rows of pieces, when you declare them:
`{ "name": "top row", "pieces": [".sku", { "selector": ".ram", "wraps": true }, ".price"], "from": 640, "when":
"[data-mode=wide]" }`. `generate: false` skips the generated conditions, and the evidence lists them as not checked.

`setup` steps run in order: `{ "click": "<selector>" }`, `hover`, `focus`, `tap`, `{ "move": [x, y] }` or a selector,
`{ "fill": ["<selector>", "<text>"] }`, `{ "press": "Escape" }`, `{ "wait": 200 }`. A step on what never appears
fails in 5 seconds.

## Journeys

Each journey opens the page afresh at the widest frame's width (by touch with `"touch": true`, on its own `url` if it
gives one) and runs its `steps`: setup steps, `{ "width": 320 }`, and expectations, each given a second to come true
as a person sees it: `visible`, `hidden` (none seen), `{ "text": ["<selector>", "<text>"] }` and `focused`. A
journey with no expectation is an error; the first step that does not hold fails it. A journey runs with the page's
transitions and animations: what is running is brought to its end, its end events fired, before each expectation, so a
sheet that hides itself when its closing transition ends closes, and one that never closes fails. With
`"sameAsFresh": true`, after its steps the component (the root's place, size and scrolled width, and each child's box)
must match a fresh load of the same page at the same width; what differs beyond the tolerance fails the journey, so
an observer left on removed elements or a layout not chosen again shows.

An opener is covered by a passing journey that acts on it while its content is hidden, sees the content (inside the
target `aria-controls` or `popovertarget` names), acts again and sees the same selector hidden; an overlay frame, by
one that acts on the element its setup opened it from. Each journey that opens something also runs with the opener
at the window's top and bottom edges, at the widest and narrowest frames' widths: the overlay it shows must be whole
in the window and in every box that clips it. An opener in a fixed or sticky bar is not tried there.

## Frames

A spec landmark is a text, found whatever its spaces, case and markup, or a `selector` for an element without text,
with its `box` in the design.

**From Figma**, `design.mjs figma` (with `FIGMA_TOKEN`) or `design.mjs spec … --context` (from Figma MCP, which reads
each text's `text-[Npx]` and `leading-[Npx]` by node id) writes the spec. Texts are compared by position, height and
`font` (size, weight, line height, colour) where the spec gives it, and by width where it says `widths`, as a snapshot
does; a spec with no font size leaves the type's size uncompared, and the console and the evidence say so. A spec
from `design.mjs snapshot` is the page itself: outside a review, the evidence says it compares the page with itself.
Design text that is absent and text cut by a clipping box are findings; page text the spec lacks leaves the frame
incomplete, unless an accepted `presence` entry names it. A text cut with an ellipsis or a line clamp is truncated on
purpose.

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
design's, with five texts or more: 10 % or more off is a `type` finding. One text 20 % or more off by its own ink (a
price set larger than drawn) is a `type` finding too, unless its landmark gives its own box (an icon joined to it). A
size a step off (a price 2 px smaller) moves the ink by a pixel, as rounding does; it moves the width by ten times as
many. So one text is also a `type` finding when it is 10 % and 6 px wider or narrower than the frame's font explains
(the median of the texts' width ratios) and its ink is taller or lower the same way. A text whose landmark gives its
own box (an icon joined to it) has no ink height to read: it is a `type` finding when it is 10 % and 6 px wider than
the font explains; narrower, its box may hold the icon too, and it stays a note.

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
  - **wraps with room**: a text of two to six words (a group of digits, "1 234 567,00", is one) that wraps, though
    with its own limits lifted (no wrapping, no maximum width, no shrinking) it sits on one line inside the
    component's content box, runs into no other text, icon or control, and pushes none out: a price and its period, a
    value and its unit, a label. The items of a flex row (a title and a price, a row of chips) are held one by one,
    and a line whose context is the root is read too. A line clamp, an ellipsis, a line break, an item a flex row puts
    on its own row, and a block as narrow as its own min-content width (its words stacked, as `width: min-content`
    does) are choices, not wraps;
- `truncated`: a text cut with an ellipsis or a clamp whose full text is nowhere to read: give it a title, an
  accessible name or a tooltip;
- `construct`: a negative margin over 3 px (not a bleed, nor the kit's), a nudge of 2 px or more by a transform,
  `translate` or a relative offset (not centring or a slide). A construct is a note that needs its reason: fix it, or
  give the reason in the handoff.

## Findings and notes

A finding blocks the handover until it is fixed or the owner accepts it. A note needs nothing: what the system or a
font explains, or pixels alone, shown for the owner's eye; a ledger entry for one changes nothing. Notes are:

- an `x` or `y` offset of 12 px or less, or a drift up to 24 px carried from the pieces before while its own step
  is 12 or less;
- a pixel `region`, such as a stand-in icon;
- a text's `width`, wider or narrower than drawn (its size is the `type` finding's);
- a `height` within 24 px;
- a frame's column edge (`align`) within 12 px;
- in the sweep, a `switch`, and a `construct`, which needs its reason in the handoff.

Everything else is a finding: an offset, a drift, a height or a column edge past these; a gap of 8 px or more that
closes to under 4, whatever drift the pieces carry; the root's width; a presence, a text, a font, the type's size; a
cut, a truncated text with no way to read it, an overlap, a covered control, an overflow, a line, a wrap, a sweep
alignment, a resize. What only a generated condition finds is a candidate (below).

**Start here** names a frame's first cause from the top: an offset between two neighbours, or a landmark's width or
height that carried them. An offset marked *inherited* goes with its cause. A cause the ledger settles (proposed or
accepted) is not named: what it explains is counted as awaiting a decision, and the first finding is the first one
no entry covers.

## Generated conditions

Unless `sweep.generate` is `false`, the sweep makes its own extremes on the frames' page (the stories already carry
the longest legal values):

- every text two fifths longer ("texts stretched");
- every list's rows doubled ("entries doubled"): siblings that share a class and stand each below the one before, a
  list inside a row too; buttons or columns side by side are not doubled.

They run at the frames' widths, the sweep's ends and the switches. Once a condition is applied, the component is
resized a pixel and back with a resize event, so that one that picks its layout from its content chooses again, and
what it renders anew takes the condition too. Their texts are not the product's, so only `overlap`, `clipped`,
`outside` and `covered` count, and a text set not to wrap (`white-space: nowrap`) is no cut under longer texts.

What they find is a **candidate**, not a finding: it fails nothing and scores nothing, but an unanswered one leaves a
complete check incomplete. Answer it by reproducing it with legal data (a story with a real long value, or a
supported locale: then the story's own finding counts), or under a heading that names candidates in `review.md`, one
list item each, the candidate as the check prints it and after a colon the contract's bound that rules it out:
`- Ready Re × Go G: the label is at most 8 characters (api/types.ts)`.

## The ledger

`deviations.json` is a list of entries, each matching the differences it names:

| Field | Meaning |
|---|---|
| `landmark` | a design text or a list of them, a selector, `root`, or `*` |
| `property` | a finding's property (`x`, `height`, `text`, `type`, `region`, `overlap`, `wrap`, …), or `*` |
| `region` | for `region`: `[x, y, width, height]` in the frame's CSS px |
| `frame` | a frame's name or a list of them; absent or `*` for all |
| `max` | the largest difference in px it covers, at each width; only one with a size |
| `id`, `consequenceOf`, `shift` | an entry's name; a consequence of the entry with that `id` (the row a missing line moves up): for `x`, `y`, `width` or `height`, it covers a difference of `shift` px, within the tolerance, and no other |
| `actual` | for `text`: the text the page shows, which the check then looks for |
| `category` | optional: the cause, for the owner: `design-error`, `missing-state`, `platform`, `system`, `owner`, `ux` |
| `cause` | `checker`: the check itself causes the finding, shown by a minimal reproduction in `review.md` |
| `status` | `accepted`, by the owner only, or `proposed`, by you |
| `reason` | a sentence the owner can judge: for what cannot be built, the construct tried and what was measured |
| `decidedBy`, `options` | who accepted it; for a proposal, the options and their cost |

An entry that matches a finding settles it: accepted, it excuses it; proposed, of any category, it leaves it pending
for the owner. An entry with `"cause": "checker"` may also name a failing journey (`"property": "journey"`, its name
as the landmark): the journey waits for the owner instead of failing, and the evidence lists it under "Disputed with
the check". A refused entry is deleted and the difference fixed. An entry excuses a cause and what it carries.

An entry is a fault, which fails the check, without a landmark (or a region), a reason, or a known property or
status; with an unknown category or a `cause` other than `checker`; a journey entry without that cause; accepted
without `decidedBy`; with `*` and not accepted; of `owner` and not accepted; for `text` without `actual` or with more
than one design text; a consequence without its `shift` or without the entry it names; a `reference` entry without
its frame; a proposed `x` or `y` entry for more than three landmarks without `shift`, since it would cover any offset
of theirs. Entries of one cause that cover more than three findings are named first in the evidence, as broad
excuses.

## Output

The console shows the digest (see Rounds above). In `out/`:

| File | What |
|---|---|
| `report.md`, `result.json` | every finding and note, the causes, the sweep and the journeys |
| `<frame>/page.png`, `side.png`, `diff.png` | the page now; design, page and difference side by side; the differing pixels |
| `handoff.md` | by a complete check, the evidence a handoff quotes: the status first, then the pictures, frames, stories with their longest texts, candidates, constructs, journeys, ledger entries, what is disputed with the check, acceptance rows and what was not checked |
| `gallery.html` | by a complete check: design, before, after and difference per frame, with the stories and the ledger |
| `history.jsonl` | one line per check: round, status, score, what it was measured against, `quick`, `seconds` and `bytes` printed |
