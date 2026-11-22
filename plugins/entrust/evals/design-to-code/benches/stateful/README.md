# Stateful bench

What it measures: whether the checker catches defects that show only after a state change, a transition, or in a gap
the drift allowance can swallow, none of which a frame or a width sweep shows. The consumer page in `control/` is plain
HTML, CSS and JS: a host whose width a sidebar changes (beside the list from 640 px, stacked above it below), a list of
cards that a filter empties and restores (each card picks a wide or compact layout from its own width with a
ResizeObserver), and a mobile sheet that closes by a CSS transition. Its frames (`control/frames/`, 764 and 375 px) are
the page itself; `control/design.json` holds the journeys: the sheet opens and closes (by button and by backdrop), the
list is emptied and restored at 375 px (the lifecycle journey, with `sameAsFresh`), the sidebar opens.
Each build is judged as in `../card`: the classes expected against the classes raised, and a clean build's complete
status, which blocks it at `fail` or at `incomplete` for anything but gaps its own config causes by design (`own` in
the runner). A journey's class is the word before its colon (`journey:sheet`), so one journey failing for another
reason is not counted as a catch.

## Run

From this folder, with Playwright and Chromium installed:

```
node run-stateful.mjs                      # the skill in this repository
node run-stateful.mjs --skill <dir>        # another skill's scripts folder (holding design.mjs)
node run-stateful.mjs --label before stale-observer
```

It writes `out/<label>/<build>/` and `out/<label>.txt`; `out/` is not committed. About 40 seconds. The opt-in test
runs it and asserts the numbers (from `plugins/entrust`):

```
ENTRUST_BENCHES=1 node --test evals/design-to-code/benches/stateful/stateful.test.mjs
```

The test asserts minimums: caught at least 4, no clean build blocked. Raise the minimum when a fix lands.

To rewrite the control's frames from the page, run `node <skill>/design.mjs snapshot design.json --images --force`
in `control/`.

## Builds

- `control`: the clean page: observers follow remounts, the sheet closes, gaps are as designed, the sidebar stacks
  above the list below 640 px. Expects nothing.
- `transition-close`: the clean sheet alone, closed by its transition, by button and by backdrop, with the lifecycle
  journey and a coarse sweep. Expects nothing: the checker must not break a transition (it once forced
  `transition:none`).
- `stale-observer`, expects a `journey:list` finding or one that the page differs from a fresh load: after the list is
  emptied and restored, the observers stay on the removed cards, so at 375 px the card keeps its wide layout.
- `broken-close`, expects `journey:sheet`: the sheet waits for a transition it does not run and never hides.
- `collapsed-gap`, expects `gap`: three 10 px pieces drawn at 0, 30, 48 render at 10, 49, 60 in the compact layout (a gap
  of 8 closes to 1 px, every offset within the drift allowance).
- `squeezed-by-sidebar`, expects `journey:sidebar`: the control until research note 44's item 8, its sidebar (280 px,
  not shrinking) beside the list at every width, so at 375 px the open sidebar leaves the list 47 px and its titles
  break letter by letter. The sidebar journey asserted only that the sidebar shows and hides; it was missed before
  item 8.

## Today's result

Fresh run, `ENTRUST_BENCHES=1 node --test …/stateful.test.mjs` (label `test`), about 70 s on a loaded machine, the
skill at this branch (research note 44, items 1–3 and 8):

```
control          expect [] · clean · raised [] · status pass
transition-close expect [] · clean · raised [] · status pass
stale-observer   expect [journey:list|fresh] · CAUGHT · raised [journey:list] · status fail
    journey:list: 1 — list: emptied by the search and restored, the cards come back: step 5, {"fill":["#q",""]}: after it the page scrolls sideways: the component is 470 px wi
broken-close     expect [journey:sheet] · CAUGHT · raised [journey:sheet] · status fail
    journey:sheet: 2 — sheet: Details opens it, Close closes it: step 5, {"hidden":"#sheet"}: #sheet is still visible ; sheet: a tap opens it, a tap on the backdrop closes it: step 5, {"hidden":"#sheet"}: #sheet is still visible
collapsed-gap    expect [gap] · CAUGHT · raised [gap] · status fail
    gap: 1 — card-375 L x -7
squeezed-by-sidebar expect [journey:sidebar] · CAUGHT · raised [journey:sidebar] · status fail
    journey:sidebar: 2 — sidebar: Filters opens it beside the list and closes it (at the window's top edge, 375 px): step 1, {"click":"#filters"}: after it the component's container is 47 px wide (343 before ; sidebar: Filters opens it beside the list and closes it (at the window's bottom edge, 375 px): step 1, {"click":"#filters"}: after it the component's container is 47 px wide (343 before

caught 4 of 4 expected classes; 0 clean builds blocked
```

With the checker before item 8 (`d501762`), `squeezed-by-sidebar` is MISSED and raises nothing; the other builds
raise the same classes (`stale-observer` by the observer it leaves on the removed cards). The sidebar is caught in the
runs the check adds at the narrowest frame's width (375 px), since the journey opens it from an opener.
