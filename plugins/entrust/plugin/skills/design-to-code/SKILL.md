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

## Build from logic, not to the pixel

The design is the intent; the code is a system. Build the layout from the kit's tokens and components, normal flow,
grid and flex with consistent gaps, and the relations the design shows: what lines up, what shares a row, what wraps,
what grows. A hundred per cent match is not reachable and is not the goal. A moderate, systematic difference the
system explains (a 16 px token gap where the frame measures 14 and 18, the kit's chip height) is fine: the check
reports an offset of 12 px or less as a note, not a finding, from Figma or a screenshot. A broken relation is not
fine: a misaligned column, a gap closed until two pieces nearly touch, a wrong order or format, a piece that moved a
row, an overlap.

What belongs together stays together at every width: a price with its period, a value with its unit, an icon with
its count. Keep each whole group on one line (`white-space: nowrap` on the group, not on its parts), let its block
take the group's width, and let the groups wrap between them. Only a group wider than the component itself may break,
before its "/": the last resort, which the check names for the owner. An open popover stays in the window, wherever
the component sits: place it with the kit's popover or CSS anchor positioning with a fallback, not hand-written
offsets.

Do not nail things in place without a strong reason: a negative margin, a transform that moves text, text positioned
out of the flow, a fixed height or a fixed or maximum width around content that can grow, a different magic number
per mode. They match the frame
for the data they were tuned on and break for the next. The check reports a negative margin and a moving transform as
constructs; a strong reason goes in the ledger for the owner to accept.

## Model the layout before building

You have the code: predict where the layout will break instead of waiting to find it. In `review.md`, write a short
[layout model](references/review.md#the-layout-model) for each layout mode:

- **What shares each line,** and the longest legal value of each piece with its source: the data contract or its
  types, the fixtures, the backend's limits, the owner. The frames are samples, not the limits. Where nothing bounds
  a piece ("an amount can be long"), take a value that does not fit its line at the narrowest width, so the fallback
  shows, and ask the owner for the bound in `review.md`.
- **The width that line needs:** the pieces' content widths plus gaps and padding, from the kit's sizes and the code,
  then measured once it renders. Below that container width it no longer fits: a critical width.
- **What happens below it,** following the design's intent: wrap, move to its own row, truncate with the full text
  reachable, or switch layout. Put a switch where the content stops fitting, not at a frame's width.
- **What changes in each mode:** a narrower frame is often a different design, not the wide one squeezed. Read
  each frame for the sizes, order, spacing and text formats it changes. Where frames differ, build each as drawn and
  propose a unification with what it would cost: if the owner wants it, it is a small follow-up; if a unification is
  built and the owner does not, it is a return.
- **What repeats, and where it goes:** disk groups, badges, rows can come N times. Horizontally the container is
  the limit; vertically the component grows, so nothing that repeats sits in a fixed height. Where the design fixes
  the height (a tile, a table row), use the standard CSS way: an ellipsis, a line clamp, "+N", a scroll, with the full
  content reachable.
- **Constructs that cannot overlap:** normal flow, grid areas with `minmax(0, 1fr)` and content-sized tracks,
  `flex-wrap` with `gap`, `overflow-wrap` for long tokens. Text positioned out of the flow, or a fixed height around
  text, needs a reason in `review.md`.

A component with one line needs one row. The complete check needs the model unless the page is static.

Ask before building: what shares this line, what is its longest legal value and who says so, what appears only
sometimes, what repeats and how many times, what must line up, what happens one step narrower, and what the user does
here that must survive a resize.

Put the model in `design.json`. Sweep from the narrowest width the product supports, as the contract or the owner
names it, not below: past returns came at that width. Its switch widths go in `sweep.switches`, which the check measures a pixel either
side. Each line goes in `sweep.lines`, with its pieces in order and where the line holds. Give the dense story the
longest values the model names, and add a story with many entries, beyond what any frame shows (eight disk groups
where the frames show three): the component must grow, not overlap or cut. The sweep then checks the arrangement on the frames' page and every story, not only
collisions. Any of these means the model was wrong:

- a piece that leaves its row, changes order or wraps;
- a switch elsewhere;
- an overlap;
- a "fragile under other data" warning.

Correct the model and the layout, not only the pixel.

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
opens and closes each overlay or opener (a popup's frame names the popup as its root). A page with one layout at one
width says why in `design.json` (`"static"`) instead of sweeping; frames at several widths are always swept, whether
they come from Figma or screenshots. Trace a finding to its first cause, fix it and check every frame again; a
note needs nothing.

Tune with `--quick` (every frame and story at the frames' widths, no journeys) and run the complete check at
milestones; batch the fixes a check names before checking again. When two rounds in a row bring no new lowest score:

- **Notes need nothing:** an offset of 12 px or less is a note in the evidence. Pixel residue (a stand-in icon, a
  rendering) may be proposed with its reason.
- **The rest is fixed:** an offset past the band, a gap closed up, a text or format, an order, a missing or extra
  piece, a text wider than the font explains, a wrap that splits what belongs together, a popover outside the
  window, a construct. Only the design's error, a state it lacks or the owner's call can excuse them.
- **A kit component or type token drawn another size:** one `system` entry for it, with no frame, gives the kit's
  measured size against the drawn one; the rows around it keep the drawn pitch, so the difference does not add up
  down the card.

`pending` means owner decisions wait, not differences you stopped on. A font or renderer explains glyphs and their
sizes, never where something sits or whether it shows. A deviation proposed because the design cannot be built names,
in its `reason`, the construct tried and what the check measured. Only the owner accepts a proposed deviation.

With screenshots alone, name their boxes first: `design.mjs boxes <reference.png> --width <px>` proposes numbered
pieces of ink in `spec.json` and `boxes.png`. Name each landmark once from its pieces, its text as it reads or a
selector for an icon or a shape (see [the pack](references/pack.md#screenshots-without-a-spec)). The check then
compares each by place and its text exactly, as with Figma; ink left out of every landmark keeps the frame
incomplete. State any uncertainty about scale.

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

Where a second agent can be started, run [the review pass](references/review-pass.md) before handing over: an agent
that did not build the work reads the references, the captures and the findings, never your reasons, and says what
the owner would return. Fix what it returns, run the complete check again, and say in the handover what you did about
each of its findings.

Hand over each reference with its final image, labelled by data, width and state. Include comparable before
images when available. State what the comparison shows, which checks passed, which differences remain, which
decisions await the owner and which conditions you could not verify.

## Reviewing or tidying an implementation

The skill also reviews UI that already matches its design: at what cost, and how to put the inside in order without
changing what users see.

1. Take the current look as the baseline: a copy of `design.json` whose frames point at `baseline/<frame>/spec.json`
   and `reference.png`, with each story added as a frame, and `design.mjs snapshot <baseline design.json> --images`.
2. Run the complete check and read its cost: the constructs, the "fragile under other data" warnings, the lines that
   do not hold, and fixed heights the many-entries story overflows.
3. Rewrite the inside from tokens, flow and grid.
4. Check against the baseline: any visible change is a finding unless the owner accepts it.

