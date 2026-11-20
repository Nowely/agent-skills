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

Identify which references show a requested screen, a detail of that screen or background context. Record the data,
state and available dimensions for each target. A screenshot is a valid starting point. With Figma, inspect related
variants, assets and existing Code Connect mappings where useful. Use the [design pack](references/pack.md) when
you need saved references or measurements.

Find the closest working UI and interaction in the project. Check which kit components, props, composition, tokens
and assets it uses. Trace the inputs, actions and consumers affected by the change. Where a small visual difference
would substantially simplify the implementation, show the owner the difference and its trade-off.

For responsive layouts, identify which elements align, move together, wrap, grow or need space for an adjacent
action. Distinguish relationships visible in the design from behaviour inferred between frames. Record what the
owner will check and how you will observe it. Resolve choices that affect behaviour or scope with the owner.
The [review guide](references/review.md) covers gaps and the acceptance record.

## Build and compare

Capture the existing screen before editing when available. Match the reference's data, interaction state, host
width, scale and theme for comparison. Label mismatches in those conditions. For a page requiring login, use
the project's browser workflow with an existing authorized persistent profile. An unauthenticated local page
or Storybook can run in a fresh session.

Implement the supported states with the existing product patterns. For a layout driven by data, exercise the
ordinary reference data and a legal combination that stresses the layout. Keep the data fixed while resizing.
Check the widths between frames where the layout changes and observe whether controls and their state survive
the transition. A fixed label can be checked directly at its supplied size.

Use [the checker](references/check.md) when its frame, sweep or journey measurements answer an acceptance
question. Trace an offset to its first cause, fix it and compare affected frames again. With screenshots alone,
inspect the text, alignment and appearance visually and state any uncertainty about scale. Keep deliberate
differences in the ledger when using the checker. Only the owner accepts a proposed deviation.

## Verify and hand over

Before attributing a material difference to a conflict between a written requirement and an image, try the
smallest reversible change that could satisfy both. Compare the same state, checking which edges each
measurement uses. If the change satisfies both and preserves the required behaviour, keep it and recheck
the affected state. If the difference remains, report the change you tried and what you observed against
each source. If the trial was blocked, name the blocker and mark the conflict unverified.

After the last relevant change, capture the final result and inspect it side by side with each target reference.
For a shared component, run the affected consumer through its normal entry point. When other packages consume
a build, load the built package there and exercise the assets and interactions the change touches.

Hand over each reference with its final image, labelled by data, width and state. Include comparable before
images when available. State what the comparison shows, which checks passed, which differences remain, which
decisions await the owner and which conditions you could not verify.
