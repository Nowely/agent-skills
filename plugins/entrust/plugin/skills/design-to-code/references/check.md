# The check

`node "<skill-dir>/scripts/design.mjs" check <design.json>` renders the component in Chromium at each frame's width,
compares it with the frame's spec and image, runs the sweep, and exits 0 when nothing unlisted differs, 1 when
something does, 2 when it could not measure. Playwright is resolved from the working directory first: run it from the
project that has it. `--frame <name>` checks one frame and skips the sweep; `--no-sweep` skips the sweep;
`--before` records the page as it is now as the "before" state.

## design.json

Paths are relative to the file.

| Field | Meaning |
|---|---|
| `url` | the page or story that renders the component: `http(s)://…`, or a file path |
| `root` | CSS selector of the component's root; positions are measured from its top-left corner |
| `host` | CSS selector of the element given each frame's width, when the component is sized by its container; without it the viewport takes the width |
| `viewport` | the viewport width when `host` is set; default 1280 |
| `tolerance` | how far a position may differ, in CSS px; default 1 |
| `pixelLimit` | a share of differing pixels (0.02 is 2 %) above which the frame fails; unset, pixels are reported and do not decide |
| `ledger` | the ledger's file, usually `deviations.json` |
| `frames[]` | `name`, `width` (CSS px), `spec`, `reference`; optionally its own `url`, `viewport` and `setup` |
| `sweep` | `from`, `to`, `step` in px; `align`: groups that must line up, `{ "selector": ".price", "edge": "right" }` (left, right, center, top); `setup` |

`setup` is a list of steps run before measuring, in order: `{ "click": "<selector>" }`, `hover`, `focus`, `tap`,
`{ "fill": ["<selector>", "<text>"] }`, `{ "press": "Escape" }`, `{ "wait": 200 }`.

## The ledger

`deviations.json` is a list. Each entry excuses or holds the differences it matches:

| Field | Meaning |
|---|---|
| `landmark` | a design text, a selector, `root`, or `*` |
| `property` | `x`, `y`, `width`, `height`, `font`, `presence`, `text`, `pixels`, `overflow`, `clipped`, `overlap`, `outside`, `align`, `resize`, or `*` |
| `frame` | a frame's name or a list of names; absent or `*` for all |
| `max` | the largest difference in px the entry covers; absent, any |
| `actual` | for `text`: the text the page shows instead of the design's; the check looks for this one |
| `category` | `design-error` (the design is wrong: a word form, an off-scale spacing), `missing-state` (no frame shows it), `platform` (the browser or font renders it so), `system` (the UI kit's component or token differs from the drawing), `owner` (asked for), `ux` (an improvement) |
| `status` | `accepted`: excused; `proposed`: shown as pending and not failed, until the owner decides; `rejected`: fails like an unlisted difference |
| `reason` | why, in a sentence the owner can judge |
| `decidedBy`, `options` | who accepted it; for a proposed entry, the options and what each costs |

An entry without a reason, a known category or a known status fails the check.

## The report

The console shows a summary: per frame the verdict, where to start, and the first findings that are not inherited.
`out/report.md` holds every finding in tables.

- **Start here** is the first place from the top where an offset begins: between two landmarks the design places one
  after the other, vertically or horizontally, or between the lowest one and the root's bottom edge. **Then** lists
  the next ones. Fix one, check again.
- An offset marked *inherited* equals the one it follows from: it disappears with its cause.
- `font` compares size, weight and line height where the spec gives them. `width` is compared only where the spec
  asks for it: a snapshot does; a Figma text box can be wider than its text.
- **Pixels** is the share of pixels that differ visibly. Figma and Chromium smooth text differently, so a few percent
  with no geometry finding is usual; it decides only when `pixelLimit` is set.
- **Fonts not available**: the page asks for a family the browser does not have, and no text can match until it is
  installed or loaded.
- The **sweep** narrows one page through every width and back: `overflow` (the document or the root wider than its
  box), `clipped` (text cut by an `overflow: hidden` box), `outside` (text past the root), `overlap` (two texts over
  each other), `align` (a group's edges apart), `resize` (the widest layout not restored after narrowing).

## Output

In `out/` beside `design.json`, or `--out`:

| File | What |
|---|---|
| `report.md` | every finding, in tables; the console prints the summary |
| `result.json` | the same as data, with every landmark's offsets |
| `<frame>/page.png`, `side.png`, `overlay.png`, `diff.png` | the page now; design, page and difference side by side; the two at half opacity; the differing pixels |
| `before/<frame>.png` | the page at the first check, kept until `--before` |
| `gallery.html` | one self-contained page with the design, before, after and difference for every frame, the verdicts and the ledger's entries: the record to hand over |
| `history.jsonl` | one line per check: time, commit, frames, verdict, score, to find the best round |
