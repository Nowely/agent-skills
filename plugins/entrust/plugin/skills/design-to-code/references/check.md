# The check

`node "<skill-dir>/scripts/design.mjs" check <design.json>` renders the component in Chromium at each frame's width,
compares it with the frame's spec and image, runs the sweep and the journeys, prints a summary and writes the files
listed under [Output](#output); [the summary](#the-summary-and-the-report) says what each line means. Playwright is
resolved from the working directory first: run it from the project that has it.

**Exit codes**, the first that applies: 1 a failure; 2 something not measured; 3 what remains awaits the owner's
decision; 0 a pass. Not measured are:

- a frame without its image, a frame whose reference is an image alone (its text is left to the eye), and a frame
  showing text its spec does not have;
- an alignment group that never has two elements;
- everything, when there is no browser;
- in a complete check, what the acceptance list needs (below).

**A complete check** is every frame with the sweep. It writes the evidence file (`handoff.md`) and the gallery, and
it does not pass without:

- `review.md` beside `design.json` with an acceptance list whose every row has a result (its lines under a heading
  that names it; see [review.md](review.md#the-acceptance-list));
- a frame for every `frames/<name>/reference.png` in the pack;
- a sweep with a dense story whose URL is no frame's page (a story differing only in its query, as Storybook's do,
  counts as its own; the script cannot tell whether it is dense);
- for each control inside the component, in a frame, that opens something (`aria-expanded`, `popovertarget`, or an
  `aria-haspopup` other than false), a journey that acts on it and expects something hidden. A hover hint without
  these attributes is not found: list it in the acceptance list yourself.

**Partial checks:** `--frame <name>` checks one frame and skips the sweep; `--no-sweep` skips the sweep. They write
no evidence file and no gallery, leaving the last complete check's gallery in place, and their verdict is said to be
about what they measured. Every check first removes an earlier `handoff.md`, so the one that exists is the last
complete check's. The page before the work is the one the first check saw. If the root was absent after setup, the
gallery records its absence. Delete `out/before/` to start a new baseline.

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
| `sweep` | `from`, `to`, `step` (default 8) in px; `switches`: the widths where the design changes layout, e.g. `[640, 420]`; `align`: groups that must line up, `{ "selector": ".price", "edge": "right" }` (left, right, center, top); `setup`; `stories`: more pages swept the same way, `[{ "name": "dense", "url": "…", "setup": [] }]` |

`setup` is a list of steps run before measuring, in order: `{ "click": "<selector>" }`, `hover`, `focus`, `tap` (the
page is then opened for touch), `{ "move": "<selector>" }` or `{ "move": [x, y] }` (the pointer, in page px),
`{ "fill": ["<selector>", "<text>"] }`, `{ "press": "Escape" }`, `{ "wait": 200 }`. Selectors may use Playwright's
own forms, such as `text=Help`. A step on something that never appears fails in 5 seconds; a frame whose setup fails
is reported incomplete and the rest is checked. An unknown step is an error in `design.json`. The pointer rests
outside the page, so nothing is measured hovered unless a step hovers it.

## Journeys

Each journey opens the page afresh, at the widest frame's width unless it gives `width`, by touch when it says
`"touch": true`, on its own `url` if it has one, and runs its `steps`: the setup steps above and three that expect,
each given a second to come true, as a person sees (a size, not hidden, not transparent): `{ "visible": "<selector>" }`
(any match seen), `{ "hidden": "<selector>" }` (none seen, or no match), `{ "text": ["<selector>", "<text>"] }` (a match
seen that shows the text, which may not be empty), `{ "focused": "<selector>" }` (the focus is in a match). A journey
may also change its width, `{ "width": 320 }`, to see a state survive a resize. A journey with no expectation is an
error in `design.json`, since it could not fail, and so are two journeys with one name. A `hidden` step on what the
journey never saw visible is noted in `handoff.md`: it proves nothing about closing.
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
findings from being counted again as regions. With screenshots alone, inspect text by eye.

## The ledger

`deviations.json` is a list. Each entry excuses the differences it matches:

| Field | Meaning |
|---|---|
| `landmark` | a design text or a list of them, a selector, `root`, or `*` |
| `property` | `x`, `y`, `width`, `height`, `font`, `presence`, `text`, `region`, `overflow`, `clipped`, `overlap`, `covered`, `outside`, `align`, `resize`, `switch`, or `*` |
| `region` | for `region`: `[x, y, width, height]` in the frame's CSS px; it covers the differing areas inside it |
| `frame` | a frame's name or a list of names; absent or `*` for all |
| `max` | the largest difference in px the entry covers, at each width in the sweep; only a difference with a size (a position, a size, an overflow, a cut, an overlap, an alignment spread, a resize) can be covered, never a layout switch or a covered control; absent, any |
| `actual` | for `text`: the text the page shows instead of the design's; the check looks for this one. A `text` entry names one design text |
| `category` | `design-error` (the design is wrong: a word form, an off-scale spacing), `missing-state` (no frame shows it), `platform` (the browser or font renders it so), `system` (the UI kit's component or token differs from the drawing), `owner` (asked for), `ux` (an improvement) |
| `status` | `accepted`: excused, set only by the owner, with `decidedBy`; `proposed`: written by you, shown as pending until the owner decides; a pending-only check does not pass. An entry the owner refuses is deleted and the difference fixed |
| `reason` | why, in a sentence the owner can judge |
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

## Output

In `out/` beside `design.json`, or `--out`:

| File | What |
|---|---|
| `report.md` | every finding, in tables |
| `result.json` | the same as data: every finding with its offset, the causes, the sweep |
| `<frame>/page.png`, `side.png`, `diff.png` | the page now; design, page and difference side by side; the differing pixels |
| `before/<frame>.png` or `.txt` | first capture or the reason it is unavailable; a frame's files are named by its name and a short hash of it |
| `handoff.md` | written by a complete check, stamped with its time and, in a Git repository, the commit and whether the tree had uncommitted changes: the evidence a handoff quotes. It lists the pictures to look at first, then each frame's verdict with what the ledger excused, the widths and stories, each journey (with "checks opening only" when it sees something visible and never expects anything hidden), each ledger entry with what it excused, awaits or that it matched nothing, ledger faults, the acceptance list's rows (a blank result reads "not checked"), and what the script did not check |
| `gallery.html` | written by a complete check: one self-contained page with the design, before, after and difference per frame, the sweep, each story at the frames' widths, the journeys, and every ledger entry with its reason: the record to hand over |
| `history.jsonl` | one line per check: `round`, `time`, `frames`, `sweep`, `basis` (a hash of what the score was measured against: the tolerance, the page, the root, host and viewport, each frame's settings, spec and image, the sweep and the journeys), `review` (whether `review.md` had its acceptance list), `status` and `score`; the summary reads it for the round before and the lowest |
