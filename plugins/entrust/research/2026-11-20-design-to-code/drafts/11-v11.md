---
name: design-to-code
description: >-
  Build or change UI from a design or screenshots so it matches each reference and adapts between them, with every
  remaining difference explained (вёрстка по макету, pixel-perfect, адаптив). Gathers the frames into a design pack,
  reviews the design's gaps, checks the page against the design in numbers with a script, keeps a ledger of
  deliberate deviations, and saves the design, before and after for review. Use when given Figma links, frames or
  screenshots, or asked to match a mockup or make a layout pixel-perfect or responsive. Complements Figma's own
  design-to-code skill, which fetches the design.
metadata:
  version: "0.43.0"
license: MIT
---

# Design to code

**Done means checked.** Before the first product edit, write the acceptance list in `review.md`: every supplied
reference, a dense story, every popup and action, and the owner's past returns when the project keeps them. Before
saying done, run all of it and give each line its evidence: the check's verdict, a journey's result, a picture in the
gallery. A line that fails is fixed or reported as not done; a line not run is reported as not checked. The check
passes only when that list exists, every reference in the pack is a frame and a dense story is swept, so its "pass"
is evidence and not a claim. The first submission is the one the owner should be able to accept.

Each round, read the script's short text summary rather than comparing images; open the images when the summary
cannot explain a difference, for a screenshot-only reference, and before handing off.

Two files carry the work, and anyone can continue from them: the **design pack** (what the design says) and the
**ledger** (where the page differs from it on purpose, and why). Both live in `.design/<task>/` in the project;
commit them only if the owner agrees.

Reuse what the project has: its UI kit components, typography and tokens. A value the design states that the
project already names is written with that name; a new raw value is a finding, not a default. Build from the
project's existing components and their supported props, tokens and composition points. Where a kit component
differs from the design, compare a supported composition or styling with the cost of custom code. A small
difference that substantially simplifies the implementation can be proposed to the owner; follow an explicit
fidelity requirement and record its resolution.

## 1. Gather the design into a pack

Follow [pack.md](references/pack.md). In short:

1. Gather all supplied references by state and width (`card-selected-480`), every one of them into `frames/`: a
   popover or a price detail drawn once is a state to build and a frame to check. If Figma is available, inspect the linked node's parent and related
   frames; otherwise work from the supplied screenshots. Record unknown dimensions, scale, states and behaviour as
   unknown rather than assuming them.
2. For each reference, make a `spec.json` and save its image as `reference.png`. Prefer a 2× export when available;
   retain an image's actual resolution and scale. With Figma, the methods in [pack.md](references/pack.md) can
   extract text and geometry. Compare extracted text with the image. With only an image, use an empty landmark list
   and visually inspect text and layout; the check reports that reference as incomplete, not as an automatic pass.
3. When Figma is available, read its design context and variables with the MCP tools. Use existing Code Connect
   mappings when available and useful. Compare design assets with the project's existing icons and supported
   components; use the appropriate source and record material fidelity differences. Save to the pack what a tool can
   write itself; retype a tool's answer into a file only when another agent will build from it.
4. Write `design.json`: the page or story that renders the component, the root and host selectors, the frames (a
   state with its `setup`, one drawn outside the component with its own `root`), and the widths to sweep with the
   widths where the layout should change ([check.md](references/check.md#designjson)).
5. Render each frame with the frame's own data. Text the data cannot produce is a gap for step 2.
6. Add a dense story and sweep it ([pack.md](references/pack.md#the-data-and-the-states)); write each popup's
   journeys in `design.json` ([check.md](references/check.md#journeys)).

If Figma was supplied but is inaccessible, use the available exports and record what could not be checked; do not
infer unseen states or exact sizes.

## 2. Read the design before building

Follow [review.md](references/review.md), and write it before the first product edit. Map each element to an
existing UI-kit component where it fits and each value to a token or typographic style; list what maps to nothing.
Write in a few lines how the parts relate across widths: what moves together, what lines up across rows, what wraps,
truncates or grows when its content grows, and where each conditional action goes. Then list what the design does not say: states
without a frame, widths between frames, long, empty and localized data, and what looks like an error (a word form, a
spacing off the system's scale, contrast, a target smaller than 24 px). Where the build has to decide, choose the
default and write the options with their cost in `review.md`; ask the owner only where the options change behaviour
or scope, and keep building the rest. When the default makes the page differ from a frame, that difference goes in
the ledger as `proposed`. End with the acceptance list ([review.md](references/review.md#the-acceptance-list)).

Then read `review.md` as the owner would, before building, and fix what this turns up:

- Is every state the references draw a frame, a popover or a price detail drawn once included, not only every image?
- Does the dense story hold the longest legal data and every conditional action at once, and is it named?
- Does every popup have journeys for leaving it, a tap and Escape, each expecting a result?
- Does the layout say what may never cover what, and what happens to the longest text?
- Is each past return a line with how it is checked?

## 3. Build from the outside in

Run the check once before the first edit: it records the page as it was (`out/before/`) and the starting score. Then
fix in this order, because each level moves everything inside it:

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
being inherited, then the differing areas, each with its place. Fix that one cause, then check every
frame again; a fix for one width can move another. Offsets marked *inherited* follow from a cause above them: do not
fix them separately.

The score is lower-better and counts what is not settled, proposals included; the summary shows the round before and
the lowest so far, and says when a change to the specs or the sweep starts a new series. It locates changes; judge
visual relationships and behaviour before undoing one. Commit the product's code when a round reaches a new lowest
score. When two rounds in a row bring no new lowest, stop adjusting and sort what remains:
what to fix another way (the next round), what to record (a `proposed` ledger entry with its category and reason),
what to ask (a question in `review.md` with its options). Then check everything again. Pixel-perfect is not the goal
where the design missed a case, a kit component differs, the layout would overlap or the experience would suffer: the
goal is that no difference is left unexplained.

What passes, what a ledger entry excuses and what the sweep between the widths reports are in
[check.md](references/check.md#the-ledger). For an image-only reference, judge text and layout by eye and say why
the check is incomplete. A `proposed` difference waits for the owner; keep working on the rest. A difference you
cannot remove and cannot justify is reported, not hidden.

A layout change must keep behaviour: enter a state (selection, an open menu, typed input), resize through the
modes, finish the action, and see the same result and the same surrounding state. The popups' journeys run with every
full check. Run the project's existing tests for the component. For a component other packages consume, exercise
the built package.

## 5. Hand off

Verify the work as if someone else had built it, before saying done:

1. Look first. Open each frame's design beside the page now in the gallery, and the dense story's pictures, and write
   down what you see differ before reading the check's summary. Then reconcile the two: a difference only one of them
   shows is fixed, recorded or explained.
2. Run the full check. It writes `out/handoff.md`: each frame's verdict, the widths and stories, each journey, the
   ledger and what the script did not check.
3. List every claim your handoff will make. Give each one its evidence: a line of `handoff.md`, a command with its
   output, a picture. A claim without evidence is removed, or moves under what was not checked.
4. Try two things the acceptance list did not name, such as a resize with a popup open, the keyboard order, or an
   empty or extreme value. Fix what they turn up, or report it.

Fix what fails; say done only for what passed. Then give the owner:

- `out/handoff.md`, quoted, with the acceptance list's remaining lines and their evidence;
- `out/gallery.html`: per frame the reference, the page before the work, the page now and their difference, then the
  sweep, the stories, the journeys and every ledger entry; inspect these images yourself;
- the ledger's entries: accepted with who decided, proposed with the options; and `review.md`'s open questions;
- what was not checked: states and widths without a frame, a device, a browser other than Chromium, a real
  consumer.

When the owner returns something, add it to `.design/returns.md`, the project's list of past returns, so the next
task checks it first.
