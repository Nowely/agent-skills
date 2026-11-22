# The catalogue card: a component inside a stateful consumer

A product card restyled to a new design, inside the catalogue page that uses it: a search that re-renders the list
on every keystroke and empties it when nothing matches, a Filters sidebar that narrows the list's column, and a
Details sheet that hides when its slide-out transition ends (the consumer of the stateful bench). The builder changes
`card.js` and `card.css` only; the page is the consumer's.

## The two defects

The builder hands over with both gone, or the card is returned. The judge holds them apart.

1. **Width, planted in the start code:** the card picks its layout with `matchMedia("(min-width: 672px)")`, "the
   window less the page's padding". It is right while the sidebar is closed and wrong whenever the card's column is
   not the window's: with the sidebar open, or in another page's container. Not a kind the bench or the skill's
   examples show (they show an observer left on removed cards and a layout not chosen again).
2. **Choice, the task's own change:** the new design lets a size be chosen, and `context.md` says a choice stays
   while its card is shown, also when the search re-renders the list. A choice kept only in the DOM is lost on the
   next keystroke.

**The skill's check at `34c3a2f`** (28.3's text, before its mechanics), on the reference and on a build with both
defects, with a design.json a builder following the skill would write (frames on `story.html` sized by `host` in a
1280 px window, the sweep with dense and many, journeys for the sheet, the list emptied and restored with
`sameAsFresh`, the sidebar opened and closed with `sameAsFresh`):

- **the reference:** frames and sweep pass, no false finding;
- **width: found,** but only through the frames and the sweep sized by the container (`card-375` fails, the sweep
  overflows at 320–396). The sidebar journey with `sameAsFresh` holds: closed again, the window-bound card is the fresh
  one. A builder who sizes the frames by the window does not see it;
- **choice: not found.** The list journey with `sameAsFresh` holds, since a fresh load has no choice either, and the
  chosen frame passes, its setup choosing on a fresh page. Only a journey the builder writes (choose, type, clear,
  expect the choice) shows it.

28.3's page asks for modes switched by container queries, which removes the width defect as a matter of course if
the builder rewrites the switch; keeping `matchMedia` and restyling around it keeps it.

## Files

| Path | Who sees it |
|---|---|
| `project/` | the builder: the page, the old card with the planted width defect, the data, a story page |
| `pack/` | the builder, as `design/`: three frames at 2× with Figma-style specs, and the context |
| `brief.md` | the builder, as `.brief.md` |
| `reference/` | nobody: the accepted card the frames were taken from |
| `judge/judge.mjs` | nobody: the hidden criteria |

Smoke-tested: the reference is `ACCEPTED`; the start code is returned on both; the reference with only the width
defect is returned on width only; with only a choice kept in the DOM, on choice only.

## Run an arm

From `plugins/entrust`, into a directory outside the repository:

```bash
node evals/design-to-code/cases/catalogue-card/make-arm.mjs ~/arms/c1
```

```bash
node evals/design-to-code/harness/arm.mjs prepare ~/arms/c1 --skill <commit>
```

Start the builder in `~/arms/c1` on `~/arms/c1/.prompt.md`, alone, with no other files. When it hands over:

```bash
node evals/design-to-code/harness/arm.mjs freeze ~/arms/c1
```

```bash
NODE_PATH=$(npm root -g) node evals/design-to-code/cases/catalogue-card/judge/judge.mjs ~/arms/c1 ~/arms/c1.judge
```

It prints `ACCEPTED` or `RETURNED` with `width`, `choice` and `basics` each holding or broken, and each failed check;
`judge.json` has them all, `shots/` the pictures for a blind review (the three frames' states, dense and many at 764
and 375, the page at 407 and with the sidebar open at 960).

**Read as done** (the plan's iteration 7): the builder finds both defects itself before handing over, so the first
submission holds on width and on choice. Record also whether its handoff names each, and whether its check showed it
(the frames, the sweep or a journey) or it was found by reading the code.
