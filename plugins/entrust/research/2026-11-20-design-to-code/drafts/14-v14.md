---
name: design-to-code
description: >-
  Build or change UI from a design or screenshots so the owner can accept the first submission: each reference
  matched where it makes sense, the layout adapting between them and with real data, and every remaining difference
  explained (вёрстка по макету, pixel-perfect, адаптив). Gathers the frames into a design pack, reviews the design
  and writes an acceptance list before the code, checks the page against the design in numbers with a script, keeps
  a ledger of deliberate deviations, and hands over the evidence with the design, before and after. Use when given
  Figma links, frames or screenshots, or asked to match a mockup or make a layout pixel-perfect or responsive.
  Complements Figma's own design-to-code skill, which fetches the design.
metadata:
  version: "0.43.0"
license: MIT
---

# Design to code

**The aim: the owner accepts your first submission.** "Done" means checked, not claimed: every line of the acceptance
list has its evidence, and every remaining difference from the design is fixed or recorded with its reason. Follow the
design where it makes sense; a case it missed, a kit component that differs, an overlap or worse UX is a recorded
difference, not a reason to force a pixel.

Order of work:

1. Gather the design into a pack.
2. Review the design and write the acceptance list; send the owner, now, the questions that change behaviour or scope.
3. Run the baseline check before the first edit to the product's code (the pack, stories and test data are not that).
4. Build from the outside in.
5. Check, fix one cause, repeat.
6. Verify as if someone else had built it, then hand over.

Throughout:

- **Reuse the kit:** its components, props, composition, typography and tokens; a new raw value is a gap in
  `review.md`. Where a small difference much simplifies the code, build it and record it as `proposed`.
- **The ledger** (`deviations.json`) holds every deliberate difference. You write `proposed`, with options; only the
  owner sets `accepted`, with `decidedBy`.
- **Each round, read the script's short text summary** rather than comparing images. Open the images when the summary
  cannot explain a difference, or when the reference is a screenshot alone.
- The pack and the ledger live in `.design/<task>/`; commit them only if the owner agrees.

## 1. Gather the design into a pack

Follow [pack.md](references/pack.md):

1. Every supplied reference goes into `frames/<state-width>/`: its image as `reference.png` (2× when available) and a
   `spec.json` extracted as pack.md shows, its texts compared with the image. A popover drawn once is still a state:
   build it and give it a frame. A screenshot alone gets an empty landmark list, and the check reports it incomplete.
   Record unknown sizes, scale, states and behaviour as unknown.
2. With Figma, also read the related frames, the design context and the variables. Take assets from the design or
   the project's own set, and record material differences.
3. Write `design.json` ([check.md](references/check.md#designjson)): the page or story, the root and host, the frames
   (a state with its `setup`, one drawn outside the component with its own `root`) and the sweep. Render each frame
   with the frame's own data: with other data the verdict is meaningless.
4. Add a dense story with data of its own: the longest legal values, every badge, every conditional action at once.
   The script sweeps it but cannot tell whether it is dense, so the acceptance list names what it adds.

If Figma was supplied but is inaccessible, use the exports and record what could not be checked.

## 2. Review the design and write the acceptance list

Follow [review.md](references/review.md), before the first edit to the product's code:

- Map each element to a kit component and each value to a token or style; each `none` or `raw` is a gap.
- In a few lines, how the parts relate across widths: what moves together, what lines up across rows, what wraps,
  truncates or grows, where each conditional action goes and what it may never cover.
- What the design does not say (states without a frame, widths between frames, long, empty and localized data) and
  what looks wrong (a word form, an off-scale spacing, contrast, a target under 24 px). For each decision, the
  default you will build and the options with their cost. Send the owner now only the questions that change
  behaviour or scope, and keep building the rest.
- The acceptance list ([review.md](references/review.md#the-acceptance-list)): each line with how it will be checked.
- Each popup's journeys in `design.json` ([check.md](references/check.md#journeys)): open it, leave it and expect
  it hidden; a tap; Escape. The script finds openers only by `aria-expanded`, `aria-haspopup` or `popovertarget`, so
  list a hover hint without them yourself.

## 3. Run the baseline check

Before the first edit to the product's code:

```bash
node "<skill-dir>/scripts/design.mjs" check .design/<task>/design.json
```

It records the page as it was (`out/before/`), and its evidence file (`out/handoff.md`) lists what the acceptance
list still lacks. Settle those first.

## 4. Build from the outside in

Each level moves everything inside it, so fix in this order: the root (its width source, padding and host; a
component sized by its container uses container queries, not the viewport); the layout (columns, gaps, wrapping,
the mode at each width; values that line up across rows share one grid, not equal widths that happen to agree);
typography (the project's styles); then assets and decoration.

## 5. Check, fix one cause, repeat

Run the same command. Read the summary top-down: the root first, then **start here** (the first offset that no
earlier offset causes), then the differing areas. Fix that one cause, then check every frame again; a fix for one
width can move another. Offsets marked *inherited* go with their cause.

Lower scores are better. Commit the product's code at each new lowest score: that is your way back. When two rounds
in a row bring no new lowest, stop adjusting and sort what remains: fix it another way, record it as `proposed` with
its category and reason, or ask in `review.md` with the options. What passes and what an entry excuses are in
[check.md](references/check.md#the-ledger).

A layout change must keep behaviour: a state entered survives a resize and the action still finishes. The journeys and
the acceptance list's consumers row check it.

## 6. Verify, then hand over

Verify the work as if someone else had built it:

1. Try two things the list did not name, such as a resize with a popup open (a journey's `width` step), the
   keyboard order (`press` and `focused`), or an empty or extreme value. Write each as a journey named `probe: …`.
2. Fill in every result in the acceptance list; a blank one leaves the check incomplete. Then run the complete check
   last: it writes the evidence file.
3. Open each picture the evidence file lists before reading its numbers. Write one sentence per picture under "What
   I saw" in your message to the owner. A difference only the eye or only the check shows is fixed, recorded or
   explained.
4. Every claim in your message quotes a line of the evidence file, a command with its output, or a picture; a claim
   without evidence is removed or goes under "Not checked".

Say done only for what passed. Your message to the owner holds the evidence file, quoted; "What I saw"; the proposed
entries with their options; `review.md`'s open questions; "Not checked"; and the gallery, `out/gallery.html`.

When the owner returns something, add it to `.design/returns.md`, so the next task checks it first.
