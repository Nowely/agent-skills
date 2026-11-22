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
you show it is done; a claim without it is not. To review built UI instead, see [the
pack](references/pack.md#reviewing-an-implementation).

## Before building

- **The references.** List each with its role in [`review.md`](references/review.md): a target frame, a detail of
  one, or context.
- **The product.** Find the closest working UI (its kit components, tokens, assets) and who calls what you change.
- **The data's limits.** For each field, its longest legal value and who says so (the contract, types or owner);
  how many entries repeat; the narrowest supported width. Where nothing bounds a field, ask the owner and test a value
  that does not fit its line at the narrowest width.
- **Past returns.** Each line of `.design/returns.md` is an acceptance row in `review.md`, quoted.

## Build from logic, not to the pixel

- **A system, not a tracing:** the kit's tokens and components, normal flow, grid and flex with gaps, and the
  relations the design shows.
- **Moderate differences are fine.** An offset of 12 px or less, or a drift carried from a wider font, is a note. A
  broken relation is not: a misaligned column, a changed order or format, a piece on another row, an overlap, a type
  of another size.
- **A narrower frame is another design.** Build each as drawn: sizes, order, text formats. Where frames differ, ask
  the owner; do not unify them.
- **A price and its period:** `white-space: nowrap` on the amount and on the period, an ordinary space between them,
  and no cap on their block. "/ месяц" may move to the next line whole only when the whole price is wider than the
  component; "₽ /" | "месяц" is always a finding. A value and its unit, an icon and its count, stay on one line.
- **What repeats grows the component downward;** a fixed height takes an ellipsis or a clamp, the full text reachable.
- **An open popover stays in the window:** the kit's popover, or CSS anchor positioning with fallbacks.
- **Nothing nailed in place:** no negative margins, transforms or offsets moving text, fixed sizes around content
  that grows, or magic numbers per mode. A construct is a note that needs its reason: fix it, or give the reason in
  the handoff.

## Check

Beside `review.md`, `design.json` names the page (`url`), the component's selector (`root`) and
([the full list](references/check.md#designjson)):

- **`frames`:** each target's page, width and spec. From Figma, `design.mjs figma <link>` (with `FIGMA_TOKEN`) or
  `design.mjs spec <metadata> --context <design context>` (from Figma MCP) writes the spec. From a screenshot,
  `design.mjs boxes <reference.png> --width <px>`; name each landmark from its pieces ([the
  pack](references/pack.md#screenshots-without-a-spec)).
- **`sweep`:** `from` the narrowest supported width `to` the widest, and two `stories`:
  - `dense`: the longest values and every conditional piece at once;
  - `many`: more entries than any frame shows.
- **`journeys`:** each control that opens something, opened and closed the ways it supports.

The check adds longer texts, more rows and openers at the window's edges. A collision found only under them is a
candidate: reproduce it with legal data in a story, or name under Candidates in `review.md` the contract's bound that
rules it out.

While building, run `node <skill>/scripts/design.mjs check design.json --quick`; at milestones and last, the
complete check. Run it in the foreground; if it outlasts the wait, look every few minutes. View only the crop and
reference that answer the current question; full pages at every width once, before handover. Keep probes in one
parameterised script on disk, not inline. When the verdict says stop, stop re-running.

A finding says what to fix: fix its first cause and check again. A note needs nothing. A finding you cannot fix goes in
`deviations.json` as `proposed`, with what you tried and measured; only the owner accepts it. `incomplete` (exit 2)
means something went unmeasured: ink no landmark names, page text the spec lacks, a row without evidence, an
unanswered candidate. Name it or record why not, and check again.

## Hand over

- **At the first complete check,** write a handover note in `review.md`: decisions, the state map, paths, open
  findings.
- **The complete check runs last.** `out/handoff.md` opens with the status: `pass` is done; `pending` means proposals
  wait for the owner. Never hand over at `fail`.
- **Acceptance rows:** `- item: pass — evidence`.
- **The consumer.** Load the built artifact through its public import in an existing consumer or a minimal host and
  exercise the affected action. Where the product can cause one, take a lifecycle (mount and unmount, data emptied and
  refilled) or a parent-width change in a journey with `"sameAsFresh": true`.
- **A second look:** where a second agent can be started, run [the review pass](references/review-pass.md), which
  reads the code too, and fix what it returns.
- **The owner's decisions,** in one list: each a fair question where the design or the contract is silent or
  contradicts itself (a missing state, an unbounded value, frames that disagree, the kit against the drawing), with
  options and costs, none repeating a ruling in `.design/returns.md` or `review.md`. What you could fix is fixed,
  not proposed.
- **The handoff:** each reference beside its final image; what the check passed; what differs and why; what you
  could not check. With a screenshot alone and no tool to measure, judge by eye and name what went unmeasured.
