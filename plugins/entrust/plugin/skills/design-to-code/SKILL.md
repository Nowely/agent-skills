---
name: design-to-code
description: >-
  Build or change UI from a Figma design so it matches pixel for pixel at every frame and adapts between them
  (вёрстка по макету, pixel-perfect, адаптив). Gathers the frames into a design pack, reviews the design's gaps,
  checks the page against the design in numbers with a script, keeps a ledger of deliberate deviations, and saves
  the design, before and after for review. Use when given Figma links or frames, or asked to match a mockup or make
  a layout pixel-perfect or responsive. Complements Figma's own design-to-code skill, which fetches the design.
metadata:
  version: "0.42.0"
license: MIT
---

# Design to code

A design is a set of numbers and so is a rendered page; matching them is a comparison of numbers, made by
`scripts/design.mjs`, not of impressions. It prints a short summary that names where an offset starts and which
areas outside the text differ, so a round reads a few lines of text instead of comparing images. Open the images
when the summary cannot explain a difference, and for the final look.

Two files carry the work, and anyone can continue from them: the **design pack** (what the design says) and the
**ledger** (where the page differs from it on purpose, and why). Both live in `.design/<task>/` in the project; ask
the owner before committing it.

Reuse what the project has: its UI kit components, typography and tokens. A value the design states that the
project already names is written with that name; a new raw value is a finding, not a default. Where a kit
component differs from the drawing, use the component and record the difference as `system`; never restyle or
wrap the component to imitate the drawing.

## 1. Gather the design into a pack

Follow [pack.md](references/pack.md). In short:

1. Open the link's parent: a link usually points at one node of a group. Take every frame the change touches, one per
   state and width, and name each by both (`card-selected-480`).
2. For each frame, write its `spec.json` (every text with its box and font) and its image at 2× as `reference.png`.
   With a Figma token, `node "<skill-dir>/scripts/design.mjs" figma <frame link> --out .design/<task>/frames/<name>`
   writes both and costs no model tokens; without one, build them from the MCP tools as pack.md says.
3. With the Figma MCP tools, read the design context, the Code Connect map (which code component, with which
   props) and the variables. Download every asset the frame uses as the file the design holds, SVG for icons;
   never draw or substitute one. Save to the pack what a tool can write itself; retype a tool's answer into a file
   only when another agent will build from it.
4. Write `design.json`: the page or story that renders the component, the root and host selectors, the frames, and
   the widths to sweep with the widths where the layout should change ([check.md](references/check.md#designjson)).
5. Render each frame with the frame's own data. Text the data cannot produce is a gap for step 2.

When the implementer cannot reach Figma, whoever can builds the pack and hands over its path.

## 2. Read the design before building

Follow [review.md](references/review.md). Map each element to a UI-kit component (Code Connect first) and each
value to a token or typographic style; list what maps to nothing. Then list what the design does not say: states
without a frame, widths between frames, long, empty and localized data, and what looks like an error (a word form, a
spacing off the system's scale, contrast, a target smaller than 24 px). Where the build has to decide, choose the
default and write the options with their cost in `review.md`; ask the owner only where the options change behaviour
or scope, and keep building the rest. When the default makes the page differ from a frame, that difference goes in
the ledger as `proposed`.

## 3. Build from the outside in

Run the check once before the first edit: it records the page as it was (`out/before/`) and the starting score.
Then fix in this order, because each level moves everything inside it:

1. the root: its width source, padding and the host it sits in (a component sized by its container uses container
   queries, not the viewport);
2. the layout: columns, gaps, wrapping, the mode at each width; values that must line up across rows share one grid
   (`grid` with `subgrid`, or one column template), not equal widths that happen to agree;
3. typography: the project's styles for size, weight, line height, letter spacing and colour;
4. assets and decoration: icons, images, borders, shadows, backgrounds.

## 4. Check, fix one cause, repeat

```bash
node "<skill-dir>/scripts/design.mjs" check .design/<task>/design.json
```

Read the summary top-down: the root first, then **start here**, the first place where an offset begins rather than
being inherited, then the areas outside text that differ, each with its place. Fix that one cause, then check every
frame again; a fix for one width can move another. Offsets marked *inherited* follow from a cause above them: do not
fix them separately.

Each check saves the round's diff in `out/rounds/`. The score is lower-better and the summary names the best round:
when a change raised the score, undo it, unless it is one step of a restructuring the next round completes. After
three rounds without a lower score, stop and hand off what remains, with the report: more rounds of the same kind
rarely converge.

Stop when the check exits 0, or when every remaining difference has a ledger entry: `accepted` by the owner or a
rule the owner set, or `proposed` and waiting. An accepted change of size or position also excuses what it pushes
along. A difference you cannot remove and cannot justify is reported, not hidden. The sweep in the same run narrows
one mounted page every few pixels and through each frame's width, and reports overflow, clipped and overlapping
text, columns that drift apart, layout changes at widths the design does not name, and a layout that does not come
back when widened.

A layout change must keep behaviour: enter a state (selection, an open menu, typed input), resize through the
modes, finish the action, and see the same result and the same surrounding state. Run the project's existing tests
for the component. For a component other packages consume, exercise the built package.

## 5. Hand off

Give the owner:

- the check's verdict per frame and for the sweep (`out/report.md`);
- `out/gallery.html`: per frame the design, the page before the work, the page now and their difference, then the
  sweep and every ledger entry;
- the ledger's entries: accepted with who decided, proposed with the options; and `review.md`'s open questions;
- what was not checked: states and widths without a frame, a device, a browser other than Chromium, a real
  consumer.
