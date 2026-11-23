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
something not measured (a frame without its image or showing text its spec lacks, ink no named box holds, a root or
setup that fails, a story or condition not swept, an alignment group never of two); 3 what remains awaits the owner
(a proposal, a journey disputed with the check); 0 a pass. For a 2, name what is missing (the ink's landmark, the
text in the spec, the row's evidence), or record why it cannot be, and check again. A complete check is also
incomplete when:

- an acceptance row in `review.md` is blank, unrecognised or unmeasured ([the list](review.md#the-acceptance-list));
  with no rows, nothing is assessed;
- an opener (`aria-expanded`, `popovertarget`, `aria-haspopup`) or an overlay frame has no journey that opens and
  closes it ([coverage across pages](#journeys) requires a matching linked target);
- a `frames/<name>/reference.png` has no frame (context images go in `context/`);
- a declared line never shows two of its pieces;
- there is no sweep or no story, unless `design.json` gives `"static"` with its reason (one layout at one width,
  never frames at several);
- a story on a frame's own URL has no setup but `wait`, so it is the frame again;
- no journey with `"sameAsFresh": true` runs on the consumer's page and takes a lifecycle, unless `design.json` gives
  `"lifecycle"` with its reason. The consumer's page is a journey's own `url` that no frame or story shows, or the
  page `url` names, unless the frames are drawn there by `host`. URLs include query and fragment: either can select
  a different page state. A journey takes a lifecycle when a step shows, hides, removes or replaces its root, changes
  its container's width, or a `text` expectation observes changed text in a declared `dataFields` field visible before
  the journey. No matching field may already contain the expected text; the same visible elements must remain in the
  same order. Replacements, reorderings and a swap of their texts are ambiguous and do not count. Other
  text or DOM mutations alone do not establish a data change; a `width` step is the window's, and alone takes none;
- a line of the owner's past returns (`.design/returns.md` beside the task's folder) is not quoted in an acceptance
  row;
- a [candidate](#generated-conditions) is unanswered.

**Rounds.** The score adds what is not settled, findings and proposals alike; notes and candidates count nothing. The
console is a digest of fifteen lines at most: the round before and the lowest among rounds measured the same way, what
changed since (findings fixed, new ones), each frame's new findings with where to start and the unchanged ones as a
count; the full tables are in `report.md`. A finding is named by its key (frame, landmark, property), which neither
`--quick` nor a change of the specs alters. When the same finding has come first in three rounds in a row, quick or
complete, a quick round's verdict line says "the first finding is unchanged for N rounds: fix it or propose it"; a
complete round's, and one after two complete rounds without a new lowest score, says "stop re-running: fix it, propose
it with a reason, or report the check as blocked".
Each line of `history.jsonl` records the round's status, score and findings, whether it was `quick`, its `seconds` and
the `bytes` it printed.
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
| `lifecycle` | the reason the product can cause no lifecycle (no remount, no data emptied and refilled, no change of the parent's width), `"no data changes: the card renders once"`: no `sameAsFresh` journey is then asked for, and the handoff prints the reason |

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
gives one) and runs its `steps`: setup steps, `{ "width": 320 }`, and expectations evaluated on the page:
`visible`, `hidden` (none seen), `{ "text": ["<selector>", "<text>"] }` and `focused`. A
journey with no expectation is an error; a separate consumer page uses its own viewport, not the frame `host`. When a
journey tests a change of product data inside a stable root, the builder declares the field selectors in that journey,
for example `"dataFields": ["#quantity"]`, and asserts the changed value with `"text": ["#quantity", "2"]`. The
builder identifies fields from the product contract: the checker cannot distinguish data from a control label or a
status message by markup or text alone. Without this declaration, an ordinary `text` expectation still checks its text
but cannot establish a data lifecycle; if no other lifecycle is observed, the complete check is incomplete. The
first step that does not hold fails it. Journeys use the browser's natural motion preference. A sheet can close on its
own `transitionend`. A hidden expectation has 1.5 seconds for the target to disappear. If it remains visible with
unfinished motion at that deadline, closing is unmeasured. Other expectations have a second to match. A placement
checks both participants after motion settles. Successive effects from completion handlers share the same 1.5-second
bound. Two successive layout samples must agree. A later timer beyond those samples is outside this checkpoint. Put a text expectation for a required
intermediate state immediately after the input that enters it. For visible
continuity required by the design, capture the affected region during the ordinary transition with animations enabled,
and again at the end. Record the frames sampled and any interval you could not observe. A DOM animation-frame callback
measures layout only. Frames and width sweeps capture settled states. With
`"sameAsFresh": true`, after its steps the component (the root's place, size and scrolled width, and each child's box)
must match a fresh load of the same page at the same width; what differs beyond the tolerance fails the journey, so
an observer left on removed elements or a layout not chosen again shows. The check then resizes that page through the
frames' widths and holds each against a fresh load at that width. After any journey, a `ResizeObserver` still observing
an element its steps removed (the root, one inside it or one around it; not one the page removed while it loaded) is
a construct note on the journey: disconnect it on unmount, or give its reason (a tab pane kept to be shown again, a
cleanup deferred). A script-set mode can be attributed to a size-query listener registered with
`addEventListener` or `addListener`. Assignments to `MediaQueryList.onchange` keep native behavior and are outside
that attribution.

**The component's width.** After each step, at a width the sweep covers, the check measures the root's container (its
parent), for the root the journey started with while it is on the page. The step fails the journey when the container
is narrower than a fresh load gives it at the sweep's `from`, where it narrows with the width (what opened, a sidebar
beside the list, takes the component's room), or when the page starts to scroll sideways. A container with no width,
or a root clipped from view (a panel collapsed, a tab hidden), shows no component, and neither that floor nor the fresh
comparison holds it. A width step sets the test width; its following expectations specify what must hold there.
When a user action changes the parent width, assert the relationship in the live component before the next action,
for example `{ "visible": ".price:below(.title)" }` while a sidebar is open. The check reports that placement only.
Changes to a flex or grid item's size can also resize its sibling column. The check follows size-affecting effects
on those items and their in-flow content, including a nested child that sets the item's intrinsic width. Descendants
behind full size containment contribute no intrinsic size outside that box. If an action overlaps unfinished motion from a window resize, it provides no independent evidence of a parent-width
lifecycle. Exercise that action once the viewport has settled when the product supports it.
It recognizes Playwright's `:above`, `:below`, `:left-of`, `:right-of` and `:near` on a visible component element,
with a single selector on either side. A declared `sameAsFresh` endpoint compares the component at the frame widths.
The check reports unmeasured widths. An independent change of parent width in the configured journey leaves the check
incomplete until the relevant placement or equivalent endpoint is checked. Equal text can occur in both a collapsed
chart and an expanded one.

An opener is covered by a passing journey that acts on it while its content is hidden, sees the content (inside the
target `aria-controls` or `popovertarget` names), acts again and sees the same selector hidden; an overlay frame, by
one that acts on the element its setup opened it from. A journey on another page or URL variant can cover an opener with the same
selector, role, accessible name and linked target when that target exists on the measured page; the handoff names the
journey. A missing target might be mounted on action, so it stays unchecked until a journey on its page opens and
closes it. The check acts only through configured setup and journeys; an unknown accessible name or role cannot establish
identity. Each journey that opens something also runs with the opener at the window's top and
bottom edges, at the widest and narrowest frames' widths: the overlay it shows must be whole in the window and in every
box that clips it. An opener in a fixed or sticky bar is not tried there.

## Frames

A spec landmark is a text, found whatever its spaces, case and markup, or a `selector` for an element without text,
with its `box` in the design. Its place across is read from the edge its alignment holds, or from the other edge or
its centre when that moved less by more than the tolerance (what is anchored right, when the root narrows).

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
twice; ink in no landmark and not skipped keeps it incomplete. A text several landmarks share is paired with the
page's in reading order; one no other landmark repeats, with the page's nearest its box, so a count "1" is not the
"1" inside "Выдача за 1 день". The page's boxes are made tight to their ink and compared by place within 4 px. A text
wider in the page's font moves the next piece, and that is the font's; heights are not compared. **The type's size**
is the trimmed mean (the middle 60 %) of the page's ink heights over the design's, with five texts or more: 10 % or
more off is a `type` finding. One text 20 % or more off by its own ink (a price set larger than drawn) is a `type`
finding too, unless its landmark gives its own box (an icon joined to it). A size a step off (a price 2 px smaller)
moves the ink by a pixel, as rounding does; it moves the width by ten times as many. So one text is also a `type`
finding when it is 10 % and 6 px wider or narrower than the frame's font explains (the median of the texts' width
ratios) and its ink is taller or lower the same way. A text whose landmark gives its own box (an icon joined to it)
has no ink height to read: it is a `type` finding when it is 10 % and 6 px wider than the font explains; narrower, its
box may hold the icon too, and it stays a note.

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
  `translate` or a relative offset (not centring or a slide); a mode set by script: a class, `data-` attribute or style
  on the root or inside it that a `ResizeObserver` callback or a window-size `matchMedia` change listener writes (a
  one-shot read of `.matches` is the component's own width's to show): if it decides the layout, switch it by a
  container query; if it fits content, give its reason. A construct is a note that needs its reason: fix it, or give
  the reason in the handoff.

## Findings and notes

A finding blocks the handover until it is fixed or the owner accepts it. A note needs nothing: what the system or a
font explains, or pixels alone, shown for the owner's eye; a ledger entry for one changes nothing. Notes are:

- an `x` or `y` offset of 12 px or less, or a drift up to 24 px carried from the pieces before while its own step
  is 12 or less;
- a pixel `region`, such as a stand-in icon;
- a text's `width`, wider or narrower than drawn (its size is the `type` finding's);
- a `height` within 24 px;
- a frame's column edge (`align`) within 12 px;
- a shift a missing text's `presence` entry carries ([the ledger](#the-ledger));
- in the sweep, a `switch`, and a `construct` (after a journey, too: an observer kept on what its steps removed),
  which needs its reason in the handoff.

Everything else is a finding: an offset, a drift, a height or a column edge past these; a gap of 8 px or more that
closes to under 4, whatever drift the pieces carry; the root's width; a presence, a text, a font, the type's size; a
cut, a truncated text with no way to read it, an overlap, a covered control, an overflow, a line, a wrap, a sweep
alignment, a resize. What only a generated condition finds is a candidate (below). An entry excuses an offset or a
height whole or not at all; only of a shift a missing text carries in part is the rest judged (below).

**Start here** names a frame's first cause from the top: an offset between two neighbours, or a landmark's width or
height that carried them. An offset marked *inherited* goes with its cause. A cause the ledger settles (proposed or
accepted), or a missing text carries, is not named: what it explains is counted as awaiting a decision, and the first
finding is the first one no entry covers.

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

A third, **the component's own width** (`window`, named by the frame), takes each frame's width once: the frame's
page and setup in a window of that width, then in a 1280 px window with the root's parent held at the content width
it had, by `width`, `min-width` and `max-width` on it, before the setup and after. Which texts share a row, the root's
size and the spec's landmarks must agree within the tolerance. A layout bound to the window (a media query,
`matchMedia`, a script reading the window's width) differs; one laid out by its container (a container query, an
observer on the component) does not. A frame with its own root is not tried, nor the page itself in the page's body
(a root that is `main` or holds it): a page is laid out by the window. A component placed directly in the body is
tried. So is a page root with no `main` inside: answer it as the page. A frame whose width is 1280 px is not tried.
Where the hold does not give the root the width it had (within 3 px) because the wide window lays more beside
it in the container (a sidebar the narrower window hides), the condition measures nothing at that width, and the
evidence says so as a note. Where nothing beside it moved, the root's own width follows the window (a width a media
query sets, `vw`): a candidate.

What they find is a **candidate**, not a finding: it fails nothing and scores nothing, but an unanswered one leaves a
complete check incomplete. Answer it by reproducing it with legal data (a story with a real long value, a supported
locale, or a container narrower than the window: then the story's own finding counts), or under a heading that names
candidates in `review.md`, one list item each, the candidate as the check prints it and after a colon the contract's
bound that rules it out: `- Ready Re × Go G: the label is at most 8 characters (api/types.ts)`. The item starts with
the candidate (its landmark, or its property and landmark, then the condition in parentheses if you like); a landmark
elsewhere in the item answers nothing. The component's own width is answered by its property and the frame's name in
quotes: `- window “card-375”: the card is shown only in the 375 px column (layout.ts)`.

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
| `category` | optional: the cause, for the owner: `design-error`, `missing-state`, `platform`, `system`, `owner`, `ux` |
| `cause` | `checker`: the check itself causes the finding, shown by a minimal reproduction in `review.md` |
| `status` | `accepted`, by the owner only, or `proposed`, by you |
| `reason` | a sentence the owner can judge: for what cannot be built, the construct tried and what was measured |
| `decidedBy`, `options` | who accepted it; for a proposal, the options and their cost |

An entry that matches a finding settles it: accepted, it excuses it; proposed, of any category, it leaves it pending
for the owner. An entry with `"cause": "checker"` may also name a failing journey (`"property": "journey"`, its name
as the landmark): the journey waits for the owner instead of failing, and the evidence lists it under "Disputed with
the check". A refused entry is deleted and the difference fixed. An entry excuses a cause and what it carries.

A `presence` entry, proposed or accepted, for a design text the page lacks also carries, in each frame it applies to,
what that absence moves: upward `y` shifts below the text, and the root's height, by at most the text's height and its
gap to the next landmark below (to the one above when none is below), both from the spec. It carries only on evidence:
the nearest landmark below the text that shares some of its width (the root's bottom, when nothing is below) moved up
past the text's place by that bound less 12 px, or more. Then each step down the page that passes the text's place is
carried, in any column. What it carries is a note that names the entry; no entry is written for the shift. Past the
bound, the rest is judged as any offset, in the same bands: a `y` within 12 px (24 for a drift) and the root's height
within 24 px are notes, and a finding shows the rest: `(-8; +22 after the ledger)`.

The limit: a text on the page in other words is not matched, so it counts as missing, and its entry could carry a
collapse that has another cause. The reworded text is then page text the spec lacks, which keeps the frame incomplete
until an entry names it; check that the entry's question covers it.

An entry is a fault, which fails the check, without a landmark (or a region), a reason, or a known property or
status; with an unknown category or a `cause` other than `checker`; a journey entry without that cause; accepted
without `decidedBy`; with `*` and not accepted; of `owner` and not accepted; for `text` without `actual` or with more
than one design text. Entries of one cause that cover more than three findings are named first in the evidence, as
broad excuses: over all frames for a `*` or a region, in one frame (or the sweep) for entries that name their
landmarks, so one question asked in every frame is not a broad one.

## Output

The console shows the digest (see Rounds above). In `out/`:

| File | What |
|---|---|
| `report.md`, `result.json` | every finding and note, the causes, the sweep and the journeys |
| `<frame>/page.png`, `side.png`, `diff.png` | the page now; design, page and difference side by side; the differing pixels |
| `handoff.md` | by a complete check, the evidence a handoff quotes: the status first, then the pictures, frames, stories with their longest texts, candidates, constructs, journeys, ledger entries, what is disputed with the check, acceptance rows and what was not checked |
| `gallery.html` | by a complete check: design, before, after and difference per frame, with the stories and the ledger |
| `history.jsonl` | one line per check: round, status, score, what it was measured against, `quick`, `seconds` and `bytes` printed |
