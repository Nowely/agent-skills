---
name: design-to-code
description: >-
  Implement or change UI from Figma, screenshots or a mockup, including responsive layouts and interactive
  states. Use for design-to-code, pixel-perfect layout or adaptive frontend work. Compare the implementation with
  the supplied references and verify the affected interactions and consumers before handing it over.
metadata:
  version: "0.44.0"
license: MIT
---

# Design to code

Build the UI from its design so that the owner accepts the first submission. [The check](references/check.md) is how
you show it is done; a claim without it is not.

## Before building

- **The references.** List each with its role in [`review.md`](references/review.md): a target frame, a detail of
  one, or context. A screenshot is a valid start. With Figma, read each frame's node data.
- **The product.** Find the closest working UI: its kit components, tokens and assets. Trace who calls what you
  change, and keep them working.
- **The data's limits.** For each field, its longest legal value and who says so (the contract, the types, the owner);
  how many entries can repeat; the narrowest width the product supports. The frames are samples, not the limits. Where
  nothing bounds a field, ask the owner in `review.md`, and test a value that does not fit its line at the narrowest
  width.
- **Past returns.** Each line of `.design/returns.md` is a row of the acceptance list in `review.md`, quoted.

## Build from logic, not to the pixel

- **A system, not a tracing:** the kit's tokens and components, normal flow, grid and flex with gaps, and the
  relations the design shows: what lines up, what shares a row, what wraps, what grows.
- **Moderate differences are fine.** An offset of 12 px or less, or a drift carried from a wider font, is a note. A
  broken relation is not: a misaligned column, a changed order or format, a piece on another row, an overlap, a type
  of another size.
- **A narrower frame is another design.** Build each as drawn: its sizes, order and text formats. Where frames
  differ, propose a unification in `review.md`; do not build one.
- **What belongs together stays on one line:** a price with its period, a value with its unit, an icon with its count.
  Put `white-space: nowrap` on the whole group, not its parts, and let its block take the group's width.
- **What repeats grows the component downward.** A fixed height takes an ellipsis or a line clamp, with the full text
  reachable.
- **An open popover stays in the window.** Use the kit's popover, or CSS anchor positioning with fallbacks.
- **Nothing nailed in place without a reason:** no negative margins, no transforms or offsets moving text, no fixed
  heights or widths around content that grows, no magic number per mode.

## Check

Beside `review.md`, `design.json` names ([the full list](references/check.md#designjson)):

- **`frames`:** each target's page, width and spec. From Figma, the spec is a snapshot of the frame. From a
  screenshot, run `design.mjs boxes <reference.png> --width <px>` and name each landmark from its pieces ([the
  pack](references/pack.md#screenshots-without-a-spec)).
- **`sweep`:** `from` the narrowest supported width `to` the widest, and two `stories`:
  - `dense`: the longest values and every conditional piece at once;
  - `many`: more entries than any frame shows.
- **`journeys`:** each control that opens something, opened and closed by hover, tap, focus and Escape.

The check adds conditions of its own: every text longer, every repeated entry doubled, each opener at the window's top
and bottom edges.

While building, run `node <skill>/scripts/design.mjs check design.json --quick`. Run the complete check, without
`--quick`, at milestones and last.

A finding says what to fix: fix its first cause and check again. A note needs nothing. A finding you cannot fix goes in
`deviations.json` as `proposed`, with the construct you tried and what the check measured; only the owner accepts it.

## Hand over

- **The complete check runs last.** `out/handoff.md` opens with the status: `pass` is done; `pending` means proposals
  wait for the owner. Never hand over at `fail`: fix the first cause and check again.
- **A second look,** where a second agent can be started: run [the review pass](references/review-pass.md), fix
  what it returns, and check again.
- **The handoff:** each reference beside its final image; what the check passed; what differs and why; the owner's
  open decisions; what you could not check.

## Reviewing an implementation

The same check reviews UI that already matches its design: at what cost, and how to tidy its inside without changing
what users see.

1. Snapshot the current look as the baseline: `design.mjs snapshot <a copy of design.json> --images`.
2. Run the complete check and read its notes: the constructs, the drifts, what the generated conditions break.
3. Rewrite the inside from tokens, flow and grid.
4. Check against the baseline: a visible change is a finding unless the owner accepts it.
