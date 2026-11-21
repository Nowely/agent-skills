# The check

`node "<skill-dir>/scripts/design.mjs" check <design.json>` renders the component in Chromium at each frame's width,
compares it with the frame's spec and image, applies [the ledger](#the-ledger) and runs the configured sweep and journeys.
Read [Frames](#frames) for how a frame is compared, [Constructs](#constructs-and-the-moderate-offset) for what may be proposed, [the summary](#the-summary-and-the-report) for findings and [Output](#output) for the saved evidence. Playwright is
resolved from the working directory first. Run it from the project that has it. It creates fresh Chromium contexts.
For an authenticated route, use the project's authorized browser profile to capture and test the real page.
Record those observations as separate evidence.

**Exit codes**, the first that applies: 1 a failure; 2 something not measured; 3 what remains awaits the owner's
decision; 0 a pass. Not measured are:

- a frame without its image, and a frame showing text its spec does not have;
- a line of `sweep.lines` that never shows two of its pieces;
- an alignment group that never has two elements, unless the acceptance record marks that story not applicable with a reason;
- everything, when there is no browser;
- in a complete check, what the acceptance list needs (below).

A **complete check** attempts every configured frame, sweep, story and journey without `--frame`, `--no-sweep` or
`--quick`.
It writes `handoff.md` and the gallery. The following evidence contributes to the verdict.

- An acceptance list in `review.md` beside `design.json`. The [acceptance record](review.md#the-acceptance-list)
  defines the outcome markers, evidence, scope of manual claims and optional `Checked by` methods.
- A frame for each `frames/<name>/reference.png` in the pack: put target states there, and context images in
  `context/`.
- An observed open and close transition for each detected control that opens content, including the component
  root itself, and for each frame of an overlay (one that names its own `root`, as a popup's frame does): a passing
  journey that acts on the same element its setup opened it from, sees something visible and, after an action,
  expects the same thing hidden. See [Journeys](#journeys).
- A [layout model](review.md#the-layout-model) in `review.md`, unless `design.json` gives `"static"`: a heading that
  names it (`Layout model`, `Модель раскладки`) with at least one table row below the header, or one list item. A
  component with one line needs one row.
- The model's lines in `sweep.lines`, unless the page is static: at least one, each shown somewhere.
- A width sweep with at least one dense story, unless `design.json` gives `"static"` with the reason: a page with one
  layout at one width. Frames at several widths cannot be static, whatever their source. A story on a frame's own URL needs a `setup` with a step other than `wait` that brings its other data or state; verify
  the combination in its capture. The script cannot tell whether a story is dense: the acceptance record names what
  it adds.
- Each line of the owner's past returns, `.design/returns.md` beside the task's folder (or `"returns"` in
  `design.json`), quoted in an acceptance row; letter case, emphasis, quotes and a final full stop do not matter.

The sweep measures each width in `sweep.switches` a pixel either side, so a layout model's predicted switches are
checked exactly. It also forecasts what longer data could break, as warnings that do not change the verdict:
"fragile under other data" names text positioned out of the flow (other than an overlay: a tooltip, dialog, menu,
listbox or popover; or a badge over a box with no text of its own, such as an image) and a box whose own text already
runs past its height. Each is named once, with the stories that show it. Change the construct, or say in `review.md`
why it holds. The evidence file gives the model's row count and the round it first appeared, and the predicted
switches beside the measured ones.

The evidence file opens with the handover status. A ledger entry that covers more than three findings is named
next, under "Broad excuses": an excuse should be narrower than what it excuses. A frame on which most of the
design's texts are missing is named as rendering other data than its frame. A `fail` is reported as not a state to
hand over in.

**Partial checks:** `--frame <name>` checks one frame and skips the sweep; `--no-sweep` skips the sweep; `--quick`
checks every frame and sweeps every story at the frames' widths only, without journeys: for tuning. Its rounds score
in their own series, so the two-round rule compares complete checks with complete checks. They write
no evidence file and no gallery, leaving the last complete check's gallery in place, and their verdict is said to be
about what they measured. Every check first removes an earlier `handoff.md`, so the one that exists is the last
complete check's. The page before the work is the one the first check saw. If the root was absent after setup, the
gallery records its absence. Before stays the first capture for that frame name. The gallery and handoff mark it
as incomparable if the configured URL, target width, browser viewport, host or root selector, setup steps, touch
mode or device scale changes. A first capture without a matching settings record is labelled unknown. The checker cannot establish
that the rendered data, theme or application state stayed the same at the same URL. Compare those in the images.
Delete `out/before/` to start a new baseline.

## design.json

Paths are relative to the file.

| Field | Meaning |
|---|---|
| `url` | the page or story that renders the component: `http(s)://…`, or a file path |
| `root` | CSS selector of the component's root; positions are measured from its corners. The first match a person can see is taken (not hidden, not transparent); a root that never shows leaves a frame incomplete, a story not swept and a journey failed |
| `host` | CSS selector of the element given each frame's width, when the component is sized by its container; without it the viewport takes the width |
| `viewport` | the viewport width when `host` is set; default 1280 |
| `tolerance` | how far a position or an alignment may differ, in CSS px; default 1 |
| `ledger` | the ledger's file, usually `deviations.json` |
| `frames[]` | `name`, `width` (CSS px), `spec`, `reference`; optionally its own `url`, `viewport`, `setup` and `root` (a state drawn outside the component, such as a popover) |
| `journeys` | what a user does and what should follow, run by a check of every frame: [Journeys](#journeys) |
| `sweep` | `from`, `to`, `step` (default 8) in px; `switches`: the widths where the layout switches, by the design or your layout model, e.g. `[640, 420]`, each measured a pixel either side; `lines`: the layout model's lines, `[{ "name": "top row, wide", "pieces": [".sku", ".cpu", { "selector": ".ram", "wraps": true }, ".price"], "when": "[data-mode=wide]" }]`. At each width in `from`–`to` (sweep widths, both optional) while `when` (optional) matches a visible element, the pieces shown share a row (their first lines overlap), stand in the order listed (in the reading direction; the matches of one selector in any order), and each keeps its texts on one line unless it `wraps`. A piece shown is every visible match of its selector in the flow, not clipped away; two different elements at least make a line. A break is a `line` finding on the frames' page and every story. A piece is one item of the row: `wraps` is for an item that stacks its own text (a value over its type), not for a group whose items should be pieces. Where the layout switches with its content (longer data switches wider), name the mode with `when` rather than a width; `align`: groups that must line up, `{ "selector": ".price", "edge": "right" }` (left, right, center, top); `setup`; `stories`: additional states or pages swept the same way, `[{ "name": "dense", "url": "…", "setup": [] }]` |

`setup` is a list of steps run before measuring, in order: `{ "click": "<selector>" }`, `hover`, `focus`, `tap` (the
page is then opened for touch), `{ "move": "<selector>" }` or `{ "move": [x, y] }` (the pointer, in page px),
`{ "fill": ["<selector>", "<text>"] }`, `{ "press": "Escape" }`, `{ "wait": 200 }`. Selectors may use Playwright's
own forms, such as `text=Help`. A step on something that never appears fails in 5 seconds; a frame whose setup fails
is reported incomplete and the rest is checked. An unknown step is an error in `design.json`. The pointer rests
outside the page, so nothing is measured hovered unless a step hovers it.

## Journeys

Each journey opens the page afresh, at the widest frame's width unless it gives `width`, by touch when it says
`"touch": true`, on its own `url` if it has one, and runs its `steps`: the setup steps above and four expectations,
each given a second to come true, as a person sees (a size, not hidden, not transparent): `{ "visible": "<selector>" }`
(any match seen), `{ "hidden": "<selector>" }` (none seen, or no match), `{ "text": ["<selector>", "<text>"] }` (a match
seen that shows the text, which may not be empty), `{ "focused": "<selector>" }` (the focus is in a match). A journey
may also change its width, `{ "width": 320 }`, to see a state survive a resize. A journey with no expectation is an
error in `design.json`, since it could not fail, and so are two journeys with one name. A hidden assertion can test
initial absence. Opener coverage requires the following transition in a passing journey.

1. Act on the control while the expected content is hidden. The checker discovers controls marked with
   `aria-expanded`, `popovertarget` or a non-false `aria-haspopup`.
2. Observe the content with `visible` or `text`. If the opener specifies `aria-controls` or `popovertarget`,
   the visible match must be that target or inside it.
3. Act while that content is visible, then successfully assert `hidden` using the same selector. A wait alone or
   a hidden assertion on unrelated content leaves the opener unchecked.

Equal labels can belong to different controls. For a journey running with different query arguments on the same
page, an explicit control ID, label and controlled target must match the frame. Use the frame URL for controls
without that linkage. Describe unmarked interactions such as a hover-only hint in the acceptance list and test
the gestures the product supports.

The handoff names the starting width and any completed resize steps. An opener match identifies a control. The
journey's observations cover the page, data and widths it exercised. Seeing the content disappear after a gesture
establishes the sequence. A timer or another event can also dismiss it. When the cause matters, vary the gesture
with timing and data held constant, or verify the handler in the product's interaction test.

The first step that does not hold fails the journey, with its number; a failing journey fails the check and adds 10
to the score. For a popup:

```json
{ "name": "help: leaving closes it", "steps": [{ "hover": ".help" }, { "visible": ".popover" },
  { "move": ".popover" }, { "visible": ".popover" }, { "move": [5, 5] }, { "hidden": ".popover" }] },
{ "name": "help: a tap toggles it", "touch": true, "steps": [{ "tap": ".help" }, { "visible": ".popover" },
  { "tap": [5, 5] }, { "hidden": ".popover" }] },
{ "name": "help: Escape closes it", "steps": [{ "focus": ".help" }, { "visible": ".popover" },
  { "press": "Escape" }, { "hidden": ".popover" }] }
```

## Frames

A spec landmark is a text, found on the page whatever its spaces, letter case and markup, or a CSS `selector`
for an element without text, with its `box` in the design. Texts are compared by position and line height, and by
`font` (size, weight, line height, colour) where the spec gives it; by width only where the spec says `widths`, as a
snapshot does: a Figma text box can be wider than its text. With text landmarks, the check also reports absent
design text and text cut by a clipping boundary. Visible page text the spec does not have is listed on one line and
leaves the frame incomplete: the spec may lack it (an MCP outline without an instance's texts), or the page should
not show it; an accepted `presence` entry for that text excuses it. A text cut with a drawn ellipsis (one unwrapped
line of a block) or a line clamp (a vertical `-webkit-box`) is truncated on purpose and is not a finding: `review.md`
says which texts truncate. Overlaps and texts outside the root are measured on what is painted, inside every box that
clips it. The pixel mask keeps the text
findings from being counted again as regions.

**A reference that is an image alone** is named before it is measured. `design.mjs boxes <reference.png> --width
<px> [--out spec.json]` writes a draft spec with `"source": "image boxes"`: every piece of ink (a word, an icon) and
every filled shape or outline as a numbered piece, and `boxes.png` beside it with the numbers drawn. The implementer
fills `landmarks`, each from its pieces:

```json
{ "landmarks": [
    { "text": "5587 × 4", "pieces": [11, 12, 13] },
    { "text": "HDD", "pieces": [14] },
    { "selector": ".offer__stock-icon", "pieces": [35] } ],
  "skip": { "31": "the page's shadow, not the component" } }
```

A text reads as the frame shows it; a selector names the page's own element for an icon, a shape or a photo. An
element of three characters or fewer (a "?" in a help icon) owns them, and they stay in the pixel comparison, where a
changed glyph shows; a selector over more text owns none of it. A text or a selector named twice is matched in reading
order on both sides, whatever the DOM order. Each landmark's box is the union of its pieces, or the `box` it gives
(`{ "x", "y", "width", "height" }` in frame px) where one piece holds two things, as an icon joined to its label.

A frame is not measured while:

- a landmark has neither a text nor a selector;
- a landmark names a piece that does not exist, or no piece and no box;
- a piece is in two landmarks, or skipped and named;
- a text landmark's box takes in another landmark's piece.

The design's ink in no landmark and not skipped keeps it `incomplete`; skipped pieces are listed in the evidence file.

The page's box for each landmark is made tight to its ink, as the design's is: a text to the pixels of its own
colour, an icon or a shape to what differs from the page's paper. The two are compared as a Figma spec is: by place,
read by the edge that moved least, with each offset traced to its first cause, and by the exact text.

- **Another font:** a text before it that is wider or narrower moves the next piece, and that is the font's, not a
  finding; a changed gap stays one.
- **A larger size:** a text wider than the page's font explains (over 8 px and 15 % beyond the typical ratio, with
  three texts or more) is a `width` finding, for a larger size or more text.
- **Columns:** texts the design stacks on one left edge, a line or so apart, stay on one edge (`align`).
- **Not compared:** heights and narrower widths, since a font changes them and a design's piece may hold an icon
  beside its text.
- **Tolerance:** positions are held to 4 px, or the tolerance if larger.

Two rules hold for every frame, from Figma or a screenshot:

- **The moderate band:** an `x` or `y` offset of 12 px or less is a note in the console and the evidence file, not a
  finding: the system's (a token gap, a kit component, another font). It needs nothing, and a ledger entry for it
  changes nothing. Past the band, only the design's error, a state it lacks or the owner's call excuses an offset.
- **A gap that closes up:** between two neighbours, side by side or one above the other, a gap of 8 px or more that
  closes to under 4 px (or half of it) is a finding: the pieces nearly touch. Two moderate offsets the other way
  round are two notes.

## Constructs and the moderate offset

The sweep reports as `construct` findings:

- **A negative margin** over 3 px that pulls a text into place. Not when both sides bleed alike, the element is off
  the root, or its class starts with a prefix in `design.json`'s `"kit"` (`["Mui", "ant-", "row"]`): a kit builds
  with negative gutters by design.
- **A nudge,** by a transform, the `translate` property or a relative offset: 2 px or more, up to its own size. Half
  its own size is centring and more than its size a slide, both layouts.
- **A text cut on purpose** (an ellipsis, a line clamp) whose full text is nowhere to reach: no `title`, accessible
  name or tooltip on it.

The sweep also reports text over an icon or a small picture (64 × 64 px at most) as an `overlap`: the collision people
see first. It reads where every text breaks, with nothing to declare, and reports as a `wrap`. It reads a line's text
across elements (a price written as `{amount} ₽ / {period}` reads as one), and reports:

- a value split from its period, on either side of "/" ("₽ /" | "месяц", "₽" | "/ месяц"): keep the whole group on
  one line and let its block take the group's width. Only a group wider than the component itself may break before
  its "/": the last resort, reported as a warning for the owner to decide, not a finding;
- "×" split from either of its numbers ("5587 ×" | "4");
- a number broken across lines in one element, or split from its unit or currency ("12 345" | "₽", "$" | "120").
  Units are a list: currency signs, %, ГБ, ТБ, GB, ГГц, GHz, Гбит/с, шт., мес., м², °C, px and the like, not any
  short word;
- a word of a space-delimited script (Latin, Cyrillic, Greek), or a run of four digits or more, broken inside, unless
  the page sets `hyphens: auto`.

Prose wraps where it wraps: a line may end on "5%", "Note:", "·", a breadcrumb's "/" or a date's "21,", and Chinese or
Japanese breaks between any two characters. In a short text (six words or fewer), such a pair with a break
opportunity between them (an ordinary space, also between two elements, in text that wraps) is a "may split"
forecast, a warning: the sweep may step over the width where it splits.

The evidence file lists each story's longest texts, so the owner sees what the dense story tested.

Each journey that opens something from an opener also runs with the opener at the window's top edge and at its bottom
edge, at the widest and the narrowest frame's width. On any `visible` step, an overlay (positioned out of the flow, or
with a popup's role, or the nearest such ancestor of what the step names; the first match a person sees) must be
whole in the window and in every box that scrolls or clips it, or the journey fails: a popover flips or shifts to stay
in view. An overlay larger than the window need only start inside it. At an edge, the first overlay after the opener's
step is checked, and the run stops there. An opener in a fixed or sticky bar, one the page does not scroll to the
edge, or one covered there is not tried, and the journey's notes say so; so does an edge run that sees no overlay.

**What may be proposed, and by whom:**

- **Nothing within the band:** an offset of 12 px or less is a note (above).
- **Only owner-level causes:** an offset past 12 px in total, however the steps add up; a text wider than the font
  explains (but see below); a presence, a text, a line, a wrap, a construct, a broken column or a gap closed up.
  Only a `design-error`,
  `missing-state` or `ux` proposal, or an entry the owner accepted, covers these. A `system` or `platform` proposal for
  one is named in the finding as excusing nothing.
- **The kit's size:** a text wider than the font explains may be proposed as `system` when the kit's type token or
  component sets it, in one entry with no frame (the same size on every frame), giving the token's measured size
  against the drawn one.
- **`owner`** is the owner's own call: an entry of it is accepted, with `decidedBy`.

## The ledger

`deviations.json` is a list. Each entry excuses the differences it matches:

| Field | Meaning |
|---|---|
| `landmark` | a design text or a list of them, a selector, `root`, or `*` |
| `property` | `x`, `y`, `width`, `height`, `font`, `presence`, `text`, `region`, `overflow`, `clipped`, `overlap`, `covered`, `outside`, `align`, `resize`, `switch`, `line`, `wrap`, `construct`, or `*` |
| `region` | for `region`: `[x, y, width, height]` in the frame's CSS px; it covers the differing areas inside it |
| `frame` | a frame's name or a list of names; absent or `*` for all |
| `max` | the largest difference in px the entry covers, at each width in the sweep; only a difference with a size (a position, a size, an overflow, a cut, an overlap, an alignment spread, a resize) can be covered, never a layout switch or a covered control; absent, any |
| `actual` | for `text`: the text the page shows instead of the design's; the check looks for this one. A `text` entry names one design text |
| `category` | `design-error` (the design is wrong: a word form, an off-scale spacing), `missing-state` (no frame shows it), `platform` (the browser or font renders it so: it changes glyphs and their sizes, so it may cover `font`, `width`, `height`, `region` or `overflow`, never where a thing sits, whether it shows, what it says or what it runs into), `system` (the UI kit's component or token differs from the drawing), `owner` (asked for), `ux` (an improvement) |
| `status` | `accepted`: excused, set only by the owner, with `decidedBy`; `proposed`: written by you, shown as pending until the owner decides; a pending-only check does not pass. An entry the owner refuses is deleted and the difference fixed |
| `reason` | why, in a sentence the owner can judge; for "cannot be built", the construct tried and what the check measured; for a kit component drawn another size, the kit's measured size against the drawn one |
| `decidedBy`, `options` | who accepted it; for a proposed entry, the options and what each costs |

An entry excuses a cause and what it carries: an accepted badge 3 px lower also excuses the 3 px every landmark
below it moved, and the root's height. A wildcard property on a named landmark covers its own findings. A pixel
region needs a matching region box or an accepted wildcard for all landmarks and properties. Only an accepted
entry may use `*`. An entry without a reason, a known
category or a known status fails the check.

## The summary and the report

The console shows, per frame: the verdict; the root's size if it differs; **start here**, the first place from the
top where an offset begins, between two landmarks the design places one after the other or between a landmark and
an edge of the root, or a landmark's own width or height that changed and carried its neighbours ("the width of
“New” changes by +9 px") (the first 8 px band from the top, its largest step first); the first findings that are not
inherited; how many are left; and the score, which adds up what is not settled, failures and proposals alike, with
the round before and the lowest so far, counted only over rounds measured the same way: the same tolerance, page,
frames, specs, images, sweep and journeys.
`out/report.md` holds every finding in tables.

- An offset marked *inherited* equals the one it follows from: it disappears with its cause.
- A horizontal position is read from the left edge, the right edge or the centre of the root, whichever the landmark
  moved least from, so a narrower root is one finding and not one per right-aligned text.
- A **region** is an area outside the texts where the images differ, with its box: a wrong icon, image size,
  border, background. An area that matches once shifted by a nearby text's offset moved with that text and is no
  finding of its own.
- **Pixels** is the share of all pixels that differ visibly, texts included. Figma and Chromium smooth text
  differently, so a few percent with no finding is usual.
- **Fonts not available**: the first family a text's stack names does not draw one of that text's characters in the
  text's own style and weight (it failed to load, or lacks the subset), so they render in a fallback. A stack that
  starts with a system or generic family, emoji, combining marks and control characters are skipped. It is a warning, not a verdict: load the font
  before trusting the text findings. The check cannot know the design's font; it reads the family the page names.
- The **sweep** narrows one page from `to` to `from` every `step` px and through each frame's width, then widens back:
  `overflow` (the document or the root wider than its box), `clipped` (text cut by an `overflow: hidden` box),
  `outside` (text past the root), `overlap` (two texts over each other), `covered` (a button, link or field inside
  the component with another element over its centre or two of its four inner points, the window scrolled to it; not counted:
  its own content and label, a transparent native control laid exactly over it, the page outside the component, a
  fixed or sticky bar, a point a clipping box cuts away; not tried: a disabled control, one the pointer ignores, one
  of two pixels or less), `align` (a group's edges further apart than
  the tolerance, as laid out; a group with fewer than two elements at some widths is aligned where it has two, and
  one that never has two is not measured), `resize`
  (the widest layout not restored), and the widths between which the layout changes; with `switches`, a change
  elsewhere or none near a named width is a `switch` finding. Each of `stories` is swept the same way (not for
  `switches`): its findings carry its name, and the gallery pictures it at the frames' widths within the sweep. A
  story that cannot be swept (its root absent, a setup step failing) leaves the check incomplete and keeps the rest.
  Each story records its own alignment coverage. Widths with fewer than two visible matches are reported. A
  `sweep.stories` claim of success remains incomplete when a configured group could never be measured in one
  of the stories. For a genuinely inapplicable alignment, record `N/A` with its reason. The report retains the
  unmeasured group.

## Output

In `out/` beside `design.json`, or `--out`:

| File | What |
|---|---|
| `report.md` | every finding, in tables |
| `result.json` | the same as data: every finding with its offset, the causes, the sweep |
| `<frame>/page.png`, `side.png`, `diff.png` | the page now; design, page and difference side by side; the differing pixels |
| `before/<frame>.png` or `.txt` | first capture or the reason it is unavailable. The adjacent `.sha256` records fingerprints of that file and the capture settings |
| `handoff.md` | written by a complete check, stamped with its time and, in a Git repository, the commit and whether the tree had uncommitted changes: the evidence a handoff quotes. It lists the pictures to look at first, then each frame's verdict with what the ledger excused, the widths and stories, each journey (with "checks opening only" when it sees something visible and never expects anything hidden), each ledger entry with what it excused, awaits or that it matched nothing, ledger faults, the acceptance rows with their assessed and reported outcomes, and what the script did not check |
| `gallery.html` | written by a complete check: one self-contained page with the design, before, after and difference per frame, the sweep, each story at the frames' widths, the journeys, and every ledger entry with its reason: the record to hand over |
| `history.jsonl` | one line per check: `round`, `time`, `frames`, `sweep`, `basis` (a hash of what the score was measured against: the tolerance, the page, the root, host and viewport, each frame's settings, spec and image, the sweep and the journeys), `review` (whether `review.md` had its acceptance list), `status` and `score`; the summary reads it for the round before and the lowest |
