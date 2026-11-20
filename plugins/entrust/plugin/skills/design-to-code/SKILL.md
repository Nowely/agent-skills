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
saying done, run all of it and give each line its evidence. A line that fails is fixed or reported as not done; a line
not run is reported as not checked. A complete check (every frame, with the sweep) refuses "pass" while the list is
missing, a reference has no frame, no dense story is swept or a control that opens something has no journey; only a
complete check writes the evidence and the gallery. The first submission is the one the owner
should be able to accept.

Two files carry the work, and anyone can continue from them: the **design pack** (what the design says) and the
**ledger** (where the page differs from it on purpose, and why). Both live in `.design/<task>/`; commit them only if
the owner agrees.

Reuse what the project has: its UI kit's components, supported props, composition points, typography and tokens. A
value the project already names is written with that name; a new raw value is a finding, not a default. Where a kit
component differs from the design, compare supported composition or styling with the cost of custom code, and a
small difference that substantially simplifies the work can be proposed to the owner.

## 1. Gather the design into a pack

Follow [pack.md](references/pack.md). In short:

1. Gather every supplied reference by state and width (`card-selected-480`) into `frames/`: a popover or a price
   detail drawn once is a state to build and a frame to check. With Figma, also inspect the linked node's parent and
   related frames. Record unknown sizes, scale, states and behaviour as unknown.
2. Give each reference a `spec.json` beside its `reference.png` (2× when available), extracted from Figma as
   pack.md shows and its texts compared with the image. A screenshot alone gets an empty landmark list: the check
   leaves its text to your eye and reports it incomplete, never passed.
3. With Figma, read the design context and variables; use Code Connect mappings when useful; take assets from the
   design or the project's own set, and record material differences.
4. Write `design.json` ([check.md](references/check.md#designjson)): the page or story, the root and host, the frames
   (a state with its `setup`, one drawn outside the component with its own `root`), the sweep with a dense story of
   its own data, and each popup's journeys ([check.md](references/check.md#journeys)).
5. Render each frame with the frame's own data: a frame rendered with other data has a verdict that means nothing.
   Text the data cannot produce is a gap for step 2.

If Figma was supplied but is inaccessible, use the available exports and record what could not be checked.

## 2. Read the design before building

Follow [review.md](references/review.md), and write it before the first product edit. Map each element to an
existing UI-kit component where it fits and each value to a token or typographic style; list what maps to nothing.
Write in a few lines how the parts relate across widths: what moves together, what lines up across rows, what wraps,
truncates or grows when its content grows, where each conditional action goes and what it may never cover. Then
list what the design does not say: states without a frame, widths between frames, long, empty and localized data,
and what looks like an error (a word form, a spacing off the system's scale, contrast, a target smaller than 24 px).
Where the build has to decide, choose the default and write the options with their cost; ask the owner only where
the options change behaviour or scope, and keep building the rest. A default that makes the page differ from a frame
goes in the ledger as `proposed`. End with the acceptance list ([review.md](references/review.md#the-acceptance-list)).

## 3. Build from the outside in

Run the check once before the first edit: it records the page as it was (`out/before/`), and its `out/handoff.md`
lists what the acceptance list still lacks. Settle those first. Then fix in this order, because each level moves
everything inside it:

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

Each round, read the short text summary rather than comparing images; open the images when it cannot explain a
difference, or the reference is a screenshot alone. Read it top-down: the root first, then **start here**, the first
place where an offset begins rather than being inherited, then the differing areas. Fix that one cause, then check
every frame again; a fix for one width can move another. Offsets marked *inherited* go with their cause.

The score is lower-better and counts what is not settled, proposals included; the summary shows the round before and
the lowest so far, and says when a change to what is measured starts a new series. Commit the product's code when a
round reaches a new lowest score. When two rounds in a row bring no new lowest, stop adjusting and sort what remains:
what to fix another way, what to record (a `proposed` ledger entry with its category and reason), what to ask (a
question in `review.md` with its options). Pixel-perfect is not the goal where the design missed a case, a kit
component differs, the layout would overlap or the experience would suffer; the goal is that no difference is left
unexplained. What passes and what a ledger entry excuses are in [check.md](references/check.md#the-ledger).

A layout change must keep behaviour: a state entered (a selection, an open menu, typed input) survives a resize and
the action still finishes. Run the project's existing tests for the component, and for a component other packages
consume, the built package.

## 5. Hand off

Verify the work as if someone else had built it, before saying done:

1. Try two things the acceptance list did not name, such as a resize with a popup open (a journey's `width` step),
   the keyboard order (`press` and `focused`), or an empty or extreme value. Write each as a journey named
   `probe: …`, so it gets a result.
2. Fill in the acceptance list's results, then run the complete check last. `out/handoff.md` lists the pictures to
   look at first, then each frame's verdict, the widths and stories, each journey, what the ledger excused, the
   acceptance rows (a blank result reads "not checked") and what the script did not check.
3. Open each picture it lists before reading its numbers, and write one sentence per picture under "What I saw" in
   the handoff. A difference only the eye or only the check shows is fixed, recorded or explained.
4. Every claim in the handoff quotes a line of `handoff.md`, a command with its output, or a picture; a claim without
   evidence is removed or moves under what was not checked.

Fix what fails; say done only for what passed. Then give the owner `out/handoff.md`, quoted; `out/gallery.html`
(per frame the reference, before, now and their difference, then the sweep, the stories, the journeys and the
ledger); the proposed entries with their options; and `review.md`'s open questions.

When the owner returns something, add it to `.design/returns.md`, the project's list of past returns, so the next
task checks it first.
