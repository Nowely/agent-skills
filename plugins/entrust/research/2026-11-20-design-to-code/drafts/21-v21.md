---
name: design-to-code
description: >-
  Implement or change UI from Figma, screenshots or a mockup, including responsive layouts and interactive
  states. Use for design-to-code, pixel-perfect layout or adaptive frontend work. Compare the implementation with
  the supplied references and verify the affected interactions and consumers before handing it over.
metadata:
  version: "0.43.0"
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

When there is much to do, take it in this order: the target frames on their own data through the real entry point,
then the states and their journeys, then the dense story. Implement the supported states with the existing product
patterns. For a layout driven by data, also exercise a
legal combination that stresses the layout. If the layout changes with width, keep those inputs fixed as you
resize through the transition. At representative widths, inspect the rendered elements together. Check that
adjacent text meant to be read together stays readable and that controls intended for the current state remain
visible and usable. Account for intentional overlays and verify that the expected state survives the transition.

For UI built from frames, [the checker](references/check.md) is how you show the work is done. Its complete check
needs a frame per target state on the frame's own data (targets in `frames/`, context images in `context/`), a sweep
with one dense story (a legal combination of the longest values and every conditional action), and a journey that
opens and closes each overlay or opener. A static page or a screenshot-only task says why in `design.json`
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

After the last change affecting a state or its consumer, repeat its entry-point check. Capture the final result
and inspect it side by side with each target reference.

Run the complete check last. Its evidence file, `out/handoff.md`, opens with the status your submission starts with:
`pass` is done; `pending` only after the two-round rule, with each remaining difference proposed; `incomplete` only
with a named blocker and the attempt you made. A `fail` is not a state to hand over in: fix the first cause and check
again.

Hand over each reference with its final image, labelled by data, width and state. Include comparable before
images when available. State what the comparison shows, which checks passed, which differences remain, which
decisions await the owner and which conditions you could not verify.
