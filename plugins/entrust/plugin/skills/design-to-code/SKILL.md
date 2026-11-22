---
name: design-to-code
description: >-
  Implement or change UI from Figma, screenshots or a mockup, including responsive layouts and interactive
  states. Use for design-to-code, pixel-perfect layout or adaptive frontend work. Compare the implementation with
  the supplied references and verify the affected interactions and consumers before handing it over.
metadata:
  version: "0.46.0"
license: MIT
---

# Design to code

An experimental skill. Build the UI from its design so that the owner accepts the first submission. [The
check](references/check.md) is how you show it is done; a claim without it is not. To review built UI instead, see [the
pack](references/pack.md#reviewing-an-implementation).

## Before building

- **The references.** List each with its role in [`review.md`](references/review.md): a target frame, a detail of
  one, or context.
- **The product.** Find the closest working UI (its kit components, tokens, assets) and who calls what you change.
- **The data's limits.** Each field's longest legal value and who says so; how many entries repeat; the narrowest
  supported width. Where nothing bounds a field, ask the owner; test a value too long for its line at the
  narrowest width.
- **Past returns.** Each line of `.design/returns.md` is an acceptance row in `review.md`, quoted.

## Build from logic, not to the pixel

- **A system, not a tracing:** the kit's tokens and components, normal flow, grid and flex with gaps, the
  relations the design shows.
- **Moderate differences are fine.** An offset of 12 px or less, or a drift from a wider font, is a note. A
  broken relation is not: a misaligned column, a changed order or format, a piece on another row, an overlap, a type
  of another size.
- **A narrower frame is another design:** build each as drawn (sizes, order, text formats); where frames differ,
  ask, do not unify.
- **A price and its period:** `nowrap` on each, an ordinary space between, no cap on their block; "/ месяц" wraps
  whole only when the price is wider than the component; "₽ /" | "месяц" is always a finding. A value and its unit,
  an icon and its count, stay on one line.
- **What repeats grows the component downward;** a fixed height takes an ellipsis or a clamp, the full text reachable.
- **An open popover stays in the window:** the kit's popover, or CSS anchor positioning with fallbacks.
- **Nothing nailed in place:** no negative margins, transforms or offsets moving text, fixed sizes around content
  that grows, or magic numbers per mode. A construct is a note: fix it, or give its reason in the handoff.
- **Modes switch by container queries.** A script measuring widths is a construct, except for a content fit no query
  expresses; its observer follows the mounted element and goes on unmount.

## The code

- **One element per thing shown,** not copies CSS swaps by mode: two prices, two disk lists, a chip twice.
- **Hide visually:** a unit or label the layout hides keeps a visually-hidden class, not `display: none`.
- **Selectors stay under the root;** never restyle a kit class or a bare one (`.card`, `.kit-badge`) page-wide.

## Check

Beside `review.md`, `design.json` names the page (`url`), the component's selector (`root`) and
([the full list](references/check.md#designjson)):

- **`frames`:** each target's page, width and spec. From Figma, `design.mjs figma <link>` (with `FIGMA_TOKEN`) or
  `design.mjs spec <metadata> --context <design context>` (Figma MCP) writes the spec. From a screenshot,
  `design.mjs boxes <reference.png> --width <px>`; name each landmark from its pieces ([the
  pack](references/pack.md#screenshots-without-a-spec)).
- **`sweep`:** `from` the narrowest supported width `to` the widest, and two `stories`:
  - `dense`: the longest values and every conditional piece;
  - `many`: more entries than any frame shows; its acceptance row quotes the last one at the narrowest width.
- **`journeys`:** each control that opens something, opened and closed the ways it supports.

A collision only under the check's generated texts, rows or edge openers is a candidate: reproduce it in a
story with legal data, or name under Candidates in `review.md` the bound that rules it out.

While building, run `node <skill>/scripts/design.mjs check design.json --quick`; at milestones and last, the
complete check, in the foreground; if the shell returns first, wait in one call as long as the last complete check
took (`seconds` in `out/history.jsonl`, else two minutes). View only the crop and reference answering the current
question; full pages at every width once, before handover. Keep probes in one parameterised script on disk. When a
quick round says the first finding is unchanged, fix it or propose it; when a complete round says stop, stop
re-running.

A finding says what to fix: fix its first cause and check again. A note needs nothing. A finding you cannot fix goes in
`deviations.json` as `proposed`, with what you tried and measured; only the owner accepts it. One entry per cause: its
texts in `landmark`, no `frame` if it holds everywhere. A ledger entry records a question; it does not change the
product. Write it when you first see the gap, without asking, then go on.
`incomplete` (exit 2): something went unmeasured (ink no landmark names, page text the spec lacks, a row without
evidence, an unanswered candidate); name it or record why not.

## Hand over

- **At the first complete check,** write a handover note in `review.md`: decisions, state map, paths, open
  findings.
- **The complete check runs last.** `out/handoff.md` opens with the status: `pass` is done; `pending` means proposals
  wait for the owner. Never hand over at `fail`.
- **Acceptance rows:** `- item: pass — evidence`.
- **The consumer.** Load the artifact through its public import, in a consumer or a minimal host, and exercise
  the affected action; take each lifecycle the product can cause (mount and unmount, data emptied and refilled) or
  parent-width change in a journey with `"sameAsFresh": true`.
- **A second look:** where you can start a second agent, run [the review pass](references/review-pass.md) and fix
  what it returns.
- **The owner's decisions,** in one list: each fair question (the design or contract silent or contradicting itself:
  a missing state, an unbounded value, frames that disagree, the kit against the drawing), with options and costs, and
  no ruling already in `.design/returns.md` or `review.md`. What you could fix is fixed.
- **The handoff:** each reference beside its final image; what the check passed; what differs and why; what you
  could not check.
