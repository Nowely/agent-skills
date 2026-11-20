# Critic re-check of prototype v2

The same critic as round 1 re-ran its six tasks on v2, in Playwright Chromium at 1440×900 and 1280×800, light and dark. A large page was built from the 274-block record with the packaged generator. There were no console errors, and no text fell below WCAG AA in either theme.

## Six tasks: current page, v1, v2

| Task | Current | v1 | v2 |
|---|---|---|---|
| What it does, requirements met | One tab away, 115 B-chips | 0 clicks; table 1–2 screens down | 0 clicks, no scrolling; the strip reads «7 requirements: 4 met · 2 fail · 1 not checked» |
| Decide all items with their code | 16 clicks, about 11 screens | 11 clicks plus 34 keys | 23 keys plus typing, no scrolling (see a2) |
| Large diff: walk and decide | No j/k, about 36 screens | Count jumps 49 → 31 | 49 j presses cover every block of the 4 decisions; «Decision 2 of 4 · block 1 of 15»; headers, tree and Decisions stay in step |
| Find a file and read all of it | The tree click does not move | Dead end; tree wrong 4 of 6 | Kept-only file found; whole file in one click; tree lands 16 of 16 |
| The unit with the most fix work | Misleading tiles | Bars only | Sorted by fix lines; the first row answers both questions |
| Comment on a line, find it again | Block note, unlisted | 2 clicks | 9 keys; listed in Decisions › Comments (see a4) |

All six v1 «must change» items hold. Code column: 1,018 px at 1440, 27 of 165 rows wrap (v1: 578 px, 83 rows). The DOM stays bounded: at most 39,873 elements while scrolling the large page's All view (v1: 87,930), with no focus traps. Code and Decisions stay in step.

## Must change: four defects that record an answer the owner did not give

1. **Decision keys act on the hidden selection, not on the focused or visible note.** One key press decided an item 47,000 px away, with no feedback and no undo.
2. **In Decisions, j/k focus the answer field of an item without variants.** The next «j» is typed into it and decides the item.
3. **A variant clicked while the own-answer field has focus is reverted** by a focus-out timer. The radio shows one answer while the state holds another.
4. **«c» on a line number is typed into the new comment.**

## Partial

- **A filter can hide the destination.** Following a finding's place while a filter excludes it does not reset the filter.
- **Shift+K right after Shift+J stays on the same file.**
- **Start review** lands in an answer field (see 2).

## Decided by the coordinator (the owner delegated UX)

- **Digits** choose options only for an item on screen, with Undo.
- **Tabs** switch with «g» and then a letter, because Alt+digit switches browser tabs on Linux.
- **Start review** begins at the first open item in Decisions order.
- **Kept blocks that serve only assumed requirements** are listed in Details › Coverage, not as attention items.
- **An in-page code search** covers files that are not drawn, which Ctrl+F cannot find.

## Still to build in the implementation

- Persistence and export.
- A no-JavaScript map.
- Printing of lazily drawn code.
- Russian wording.
- The «Answered» tag for an answered evidence request.
