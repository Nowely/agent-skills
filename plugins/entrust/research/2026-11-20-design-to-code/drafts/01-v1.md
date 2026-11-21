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
`scripts/design.mjs`, not of impressions. It prints a short summary that names where an offset starts, so a round
reads a few lines of text instead of comparing images. Open the images when the summary cannot explain a
difference (a colour, an icon, a shadow) and for the final look.

Two files carry the work, and anyone can continue from them: the **design pack** (what the design says) and the
**ledger** (where the page differs on purpose, and why). Both live in `.design/<task>/` in the project; ask the owner
before committing it.

Reuse what the project has: its UI kit components, typography and tokens. A value the design states that the
project already names is written with that name; a new raw value is a finding, not a default.

## 1. Gather the design into a pack

Follow [pack.md](references/pack.md). In short:

1. Open the link's parent: a link usually points at one node of a group. Take every frame the change touches, one per
   state and width, and name each by both (`card-selected-480`).
2. For each frame, with the Figma MCP tools: the outline (`get_metadata`) as `metadata.xml`, turned into
   `spec.json` by `node "<skill-dir>/scripts/design.mjs" spec`; the image at 2× as `reference.png`; the design
   context; the Code Connect map (which code component, with which props); the variables. Download every asset the
   frame uses as the file the design holds, SVG for icons; never draw or substitute one.
3. Write `design.json`: the page or story that renders the component, the root and host selectors, the frames and the
   widths to sweep between them ([check.md](references/check.md#designjson)).
4. Render one frame with the project's data for that frame. Text the data cannot produce is a gap for step 2.

When the implementer cannot reach Figma, whoever can builds the pack and hands over its path.

## 2. Read the design before building

Follow [review.md](references/review.md). Map each element to a UI-kit component (Code Connect first) and each
value to a token or typographic style; list what maps to nothing. Then list what the design does not say: states
without a frame, widths between frames, long, empty and localized data, and what looks like an error (a word form, a
spacing that breaks the system's scale, contrast, a target smaller than 24 px). For each, choose the default you will
build, give the options with their cost, and record it in the ledger as `proposed`. Ask the owner only where the
options change behaviour or scope; keep building the rest.

## 3. Build from the outside in

Run the check once before the first edit: it records the page as it was (`out/before/`) and the starting score.
Then fix in this order, because each level moves everything inside it:

1. the root: its width source, padding and the host it sits in (a component sized by its container uses container
   queries, not the viewport);
2. the layout: columns, gaps, wrapping, the mode at each width; values that must line up across rows share one grid
   (`grid` with `subgrid`, or one column template), not equal widths that happen to agree;
3. typography: the project's styles for size, weight, line height and letter spacing;
4. assets and decoration: icons, images, borders, shadows, colours.

## 4. Check, fix one cause, repeat

```bash
node "<skill-dir>/scripts/design.mjs" check .design/<task>/design.json
```

Read **Start here**: the first place, from the top, where an offset begins rather than being inherited. Fix that one
cause, then check every frame again; a fix for one width can move another. Offsets marked *inherited* follow from a
cause above them: do not fix them separately. The score is lower-better: a change that raised it is undone, unless
it is one step of a restructuring the next round completes.

Stop when the check exits 0, or when every remaining difference has a ledger entry: `accepted` by the owner or a
rule the owner set, or `proposed` and waiting. A difference you cannot remove and cannot justify is reported, not
hidden. The sweep in the same run narrows one mounted page through every width and reports overflow, clipped and
overlapping text and columns that drift apart; widening back must restore the first layout.

A layout change must keep behaviour: enter a state (selection, an open menu, typed input), resize through the
modes, finish the action, and see the same result and the same surrounding state. Run the project's existing tests
for the component. For a component other packages consume, exercise the built package.

## 5. Hand off

Give the owner:

- the check's verdict per frame and for the sweep (`out/report.md`);
- `out/gallery.html`: the design, the page before the work, the page now and their difference, per frame;
- the ledger's entries: accepted with who decided, proposed with the options;
- what was not checked: states and widths without a frame, a device, a browser other than Chromium, a real
  consumer.
