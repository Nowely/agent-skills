# The check

`node "<skill-dir>/scripts/design.mjs" check <design.json>` renders the component in Chromium at each frame's width,
compares it with the frame's spec and image, runs the sweep and prints a summary. It exits 0 when the comparison
passed, 1 on a failure, 2 when something could not be measured, and 3 when what remains awaits the owner's
decision. Not measured are: a frame without its image; a frame whose reference is an image alone, whose text is
left to the eye; an alignment group that never has two elements; and everything, when there is no browser. A
failure outranks 2, and 2 outranks 3. Playwright is resolved from the working directory first: run it from the
project that has it. `--frame <name>` checks one frame and skips the sweep; `--no-sweep` skips the sweep. The page
before the work is the one the first check saw; delete `out/before/` to take it again.

## design.json

Paths are relative to the file.

| Field | Meaning |
|---|---|
| `url` | the page or story that renders the component: `http(s)://…`, or a file path |
| `root` | CSS selector of the component's root; positions are measured from its corners |
| `host` | CSS selector of the element given each frame's width, when the component is sized by its container; without it the viewport takes the width |
| `viewport` | the viewport width when `host` is set; default 1280 |
| `tolerance` | how far a position or an alignment may differ, in CSS px; default 1 |
| `ledger` | the ledger's file, usually `deviations.json` |
| `frames[]` | `name`, `width` (CSS px), `spec`, `reference`; optionally its own `url`, `viewport` and `setup` |
| `sweep` | `from`, `to`, `step` (default 8) in px; `switches`: the widths where the design changes layout, e.g. `[640, 420]`; `align`: groups that must line up, `{ "selector": ".price", "edge": "right" }` (left, right, center, top); `setup` |

`setup` is a list of steps run before measuring, in order: `{ "click": "<selector>" }`, `hover`, `focus`,
`{ "fill": ["<selector>", "<text>"] }`, `{ "press": "Escape" }`, `{ "wait": 200 }`.

A spec landmark is a text, found on the page whatever its spaces, letter case and markup, or a CSS `selector`
for an element without text, with its `box` in the design. Texts are compared by position and line height, and by
`font` (size, weight, line height, colour) where the spec gives it; by width only where the spec says `widths`, as a
snapshot does: a Figma text box can be wider than its text. Everything outside the texts is compared by pixels.

## The ledger

`deviations.json` is a list. Each entry excuses the differences it matches:

| Field | Meaning |
|---|---|
| `landmark` | a design text or a list of them, a selector, `root`, or `*` |
| `property` | `x`, `y`, `width`, `height`, `font`, `presence`, `text`, `region`, `overflow`, `clipped`, `overlap`, `outside`, `align`, `resize`, `switch`, or `*` |
| `region` | for `region`: `[x, y, width, height]` in the frame's CSS px; it covers the differing areas inside it |
| `frame` | a frame's name or a list of names; absent or `*` for all |
| `max` | the largest difference in px the entry covers, at each width in the sweep; only a difference with a size (a position, a size, an overflow, a cut, an overlap, an alignment spread, a resize) can be covered, never a layout switch; absent, any |
| `actual` | for `text`: the text the page shows instead of the design's; the check looks for this one |
| `category` | `design-error` (the design is wrong: a word form, an off-scale spacing), `missing-state` (no frame shows it), `platform` (the browser or font renders it so), `system` (the UI kit's component or token differs from the drawing), `owner` (asked for), `ux` (an improvement) |
| `status` | `accepted`: excused; `proposed`: shown as pending until the owner decides; a pending-only check does not pass. An entry the owner refuses is deleted and the difference fixed |
| `reason` | why, in a sentence the owner can judge |
| `decidedBy`, `options` | who accepted it; for a proposed entry, the options and what each costs |

An entry excuses a cause and what it carries: an accepted badge 3 px lower also excuses the 3 px every landmark
below it moved, and the root's height. Only an accepted entry may use `*`. An entry without a reason, a known
category or a known status fails the check.

## The summary and the report

The console shows, per frame: the verdict; the root's size if it differs; **start here**, the first place from the
top where an offset begins, between two landmarks the design places one after the other or between a landmark and
an edge of the root (the first 8 px band from the top, its largest step first); the first findings that are not
inherited; how many are left; and the score, which adds up what is not settled, failures and proposals alike, with
the round before and the lowest so far. `out/report.md` holds every finding in tables.

- An offset marked *inherited* equals the one it follows from: it disappears with its cause.
- A horizontal position is read from the left edge, the right edge or the centre of the root, whichever the landmark
  moved least from, so a narrower root is one finding and not one per right-aligned text.
- A **region** is an area outside the texts where the images differ, with its box: a wrong icon, image size,
  border, background. An area that matches once shifted by a nearby text's offset moved with that text and is no
  finding of its own.
- **Pixels** is the share of all pixels that differ visibly, texts included. Figma and Chromium smooth text
  differently, so a few percent with no finding is usual.
- **Fonts not available**: the first family a text's stack names does not draw that text's characters (it failed to
  load, or lacks the subset), so the text renders in a fallback. It is a warning, not a verdict: load the font
  before trusting the text findings. The check cannot know the design's font; it reads the family the page names.
- The **sweep** narrows one page from `to` to `from` every `step` px and through each frame's width, then widens back:
  `overflow` (the document or the root wider than its box), `clipped` (text cut by an `overflow: hidden` box),
  `outside` (text past the root), `overlap` (two texts over each other), `align` (a group's edges further apart than
  the tolerance, as laid out; a group with fewer than two elements at some widths is aligned where it has two, and
  one that never has two is not measured), `resize`
  (the widest layout not restored), and the widths between which the layout changes; with `switches`, a change
  elsewhere or none near a named width is a `switch` finding.

## Output

In `out/` beside `design.json`, or `--out`:

| File | What |
|---|---|
| `report.md` | every finding, in tables |
| `result.json` | the same as data: every finding with its offset, the causes, the sweep |
| `<frame>/page.png`, `side.png`, `diff.png` | the page now; design, page and difference side by side; the differing pixels |
| `before/<frame>.png` | the page at the first check, kept until `out/before/` is deleted |
| `gallery.html` | written by a check of every frame: one self-contained page with the design, before, after and difference per frame, the sweep, and every ledger entry with its reason: the record to hand over |
| `history.jsonl` | one line per check: round, time, frames, sweep, verdict and score; the summary reads it for the round before and the lowest |
