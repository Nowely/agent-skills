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

## Understand the reference and product

Identify which references show a requested screen (a target), a detail of that screen or background context, and
list each with its role in `review.md`, so the owner can dispute a role. Record the data, state and available
dimensions for each target. A screenshot is a valid starting point. With Figma, inspect related
variants, assets and existing Code Connect mappings where useful. Use the [design pack](references/pack.md) when
you need saved references or measurements.

Find the closest working UI and interaction in the project. Check which kit components, props, composition, tokens
and assets it uses. Trace the inputs, actions and consumers affected by the change. Where a small visual difference
would substantially simplify the implementation, show the owner the difference and its trade-off.

For responsive layouts, identify which elements align, move together, wrap, grow or need space for an adjacent
action. Distinguish relationships visible in the design from behaviour inferred between frames. Record what the
owner will check and how you will observe it. Resolve choices that affect behaviour or scope with the owner before
building. The [review guide](references/review.md) covers gaps and the acceptance record.

Start from what the owner already knows. Each line of `.design/returns.md`, the owner's past returns, is a row of the
acceptance list, quoted. A decision the owner gave with the task goes in the ledger as `accepted`, its `decidedBy`
naming where the owner decided it. An expected value in a test, a journey or an acceptance row comes from the
requirement or the reference, and the row names its source; never from the code you just wrote.

## Model the layout before building

You have the code: predict where the layout will break instead of waiting to find it. In `review.md`, write a short
[layout model](references/review.md#the-layout-model) for each layout mode:

- **What shares each line,** and the longest legal value of each piece with its source: the data contract or its
  types, the fixtures, the backend's limits, the owner. The frames are samples, not the limits.
- **The width that line needs:** the pieces' content widths plus gaps and padding, from the kit's sizes and the code,
  then measured once it renders. Below that container width it no longer fits: a critical width.
- **What happens below it,** following the design's intent: wrap, move to its own row, truncate with the full text
  reachable, or switch layout. Put a switch where the content stops fitting, not at a frame's width.
- **Constructs that cannot overlap:** normal flow, grid areas with `minmax(0, 1fr)` and content-sized tracks,
  `flex-wrap` with `gap`, `overflow-wrap` for long tokens. Text positioned out of the flow, or a fixed height around
  text, needs a reason in `review.md`.

A component with one line needs one row. The complete check needs the model unless the page is static.

Ask before building: what shares this line, what is its longest legal value and who says so, what appears only
sometimes, what must line up, what happens one step narrower, and what the user does here that must survive a resize.

Write the predicted switch widths in `sweep.switches`, which the check measures a pixel either side, and give the
dense story the longest values the model names. The sweep then confirms the model or refutes it: a switch
elsewhere, an overlap or a "fragile under other data" warning means the model was wrong. Correct the model and the
layout, not only the pixel.

## Build and compare

Capture the existing screen before editing when available. For a page requiring login, use the project's browser
workflow with an existing authorized persistent profile. An unauthenticated local page or Storybook can run in a
fresh session.

As soon as the first target state works, open it through the entry point its users actually use. Compare it with
the reference using the same visible data, interaction state, host width, scale and theme. For a library shipped
as a package, load the built artifact through its public import in an existing consumer or a minimal local host.
Render the target there, check that affected assets load and exercise any affected action. For a simple page
specified by a screenshot alone, a capture at the supplied size paired with the reference is sufficient.

If data or environment access blocks that comparison, record what you tried and the specific blocker. Mark the
affected condition unverified and continue the checks you can run independently.

When there is much to do, take it in this order: the target frames on their own data and the dense story through
the real entry point, then the states and their journeys. The dense story comes early because it decides the layout. Implement the supported states with the existing product
patterns. For a layout driven by data, also exercise a
legal combination that stresses the layout. If the layout changes with width, keep those inputs fixed as you
resize through the transition. At representative widths, inspect the rendered elements together. Check that
adjacent text meant to be read together stays readable and that controls intended for the current state remain
visible and usable. Account for intentional overlays and verify that the expected state survives the transition.

For UI built from frames, [the checker](references/check.md) is how you show the work is done. Its complete check
needs a frame per target state on the frame's own data (targets in `frames/`, context images in `context/`), a sweep
with one dense story (a legal combination of the longest values and every conditional action), and a journey that
opens and closes each overlay or opener (a popup's frame names the popup as its root). A static page or a screenshot-only task says why in `design.json`
(`"static"`) instead of sweeping. Trace an offset to its first cause, fix it and check every frame again; when two
rounds in a row bring no new lowest score, record each remaining difference as `proposed` with its reason, or ask.
With screenshots alone, compare the visible content and alignment at the same scale and state any uncertainty about
scale. Unless the owner specified the CSS values or text line boxes, use them to diagnose differences visible in the
pair. Only the owner accepts a proposed deviation.

## Verify and hand over

Before attributing a material difference to a conflict between a written requirement and an image, try the
smallest reversible change that could satisfy both. Compare the same state, checking which edges each
measurement uses. If the change satisfies both and preserves the required behaviour, keep it and recheck
the affected state. If the difference remains, report the change you tried and what you observed against
each source. If the trial was blocked, name the blocker and mark the conflict unverified.

Then try to break it from the model: for each risk it names, render one input at its critical width (the longest
value, an empty one, many items, a missing image) and record what happened. A risk you could not render is reported
as not checked.

After the last change affecting a state or its consumer, repeat its entry-point check. Capture the final result
and inspect it side by side with each target reference.

Run the complete check last. Its evidence file, `out/handoff.md`, opens with the status your submission starts with:
`pass` is done; `pending` only after the two-round rule, with each remaining difference proposed; `incomplete` only
with a named blocker and the attempt you made. A `fail` is not a state to hand over in: fix the first cause and check
again.

Hand over each reference with its final image, labelled by data, width and state. Include comparable before
images when available. State what the comparison shows, which checks passed, which differences remain, which
decisions await the owner and which conditions you could not verify.
