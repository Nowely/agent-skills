# Review report redesign: prototype v3 — notes

The critic's re-check of v2 found four defects that recorded an answer the owner did not give (a1–a4). v3 fixes
them and applies the coordinator's UX decisions and the partial items of the re-check. `05-notes-v2.md` is
unchanged.

**Proof.** `prototype/selfcheck.cjs` gained 18 checks (77 in all). The seven a1–a4 checks run on their own with
`node prototype/selfcheck.cjs <pages> --only=v3`. On the v2 pages they fail 7 of 7; on the v3 pages they pass 7
of 7. The full suite passes 77 of 77 on this folder's `run38.html` and `themed.html` plus a big.html built with
the same generator. The pages were built against the review skill's modules at `1bfcb42`.

## The four defects

**a1 — keys answered a hidden selection.**
- **Change.**
  - Focus now sets the current item: moving focus into a margin note (by Tab or click) makes that note's decision
    the one keys act on.
  - A key answers only when that note (in Code) or card (in Decisions) is in view. Otherwise it brings the item
    into view, says so, and does nothing else.
  - Every answer given by a key (`1`–`9`, `f`, `n`, `x`, and `Ctrl/⌘+Enter` on an answer or a defer reason) shows
    a toast, «F3: Fix it · Undo». `u` or the button restores the state from before the key.
- **v2 proof (fails).** In the critic's case, after Tab into note 17 (Q1), «1» decided F3 in note 11.
  - «2» pressed 60,000 px away decided F3, «Leave it».
  - There was no toast.
- **v3 proof (passes).** «1» leaves F3 unchanged, and the current item is Q1.
  - «2» far away leaves F3 unchanged and brings its note into view.
  - The toast reads «F3: Fix it · Undo»; after Undo, F3 is Open again.

**a2 — j typed into an answer field.**
- **Change.** Arriving on a card by j / k, «Start review» or a link focuses the card itself, never a text field.
  Enter or `o` on a focused card opens its answer: the text field, or the chosen or first option.
- **v2 proof (fails).** «Start review» then j recorded «j» as Q2's answer.
- **v3 proof (passes).** «Start review» focuses card Q2; j moves to Q3 and Q2 stays empty.

**a3 — a variant was reverted by a late write.**
- **Cause.** In v2, the own-answer field wrote its text on a timer after focus left it. A variant clicked from
  the field was picked first, then overwritten by the timer.
- **Change.** The field now writes its text synchronously as focus leaves. The click that follows runs after it
  and wins. Nothing writes the text later.
- **v2 proof (fails).** Themed Q3: Other plus text, then the first variant, gave state «own answer» with the
  variant's radio checked. In the margin, «Fix it» after Other plus text gave «own answer».
- **v3 proof (passes).** The variant `status-quo` is in effect with the text cleared, its radio alone checked and
  no Other field. In the margin, «Fix it» is in effect with the text cleared.

**a4 — «c» leaked into the comment.**
- **Change.** The key is consumed before the comment field takes focus.
- **v2 proof (fails).** The comment field opened with «c» in it.
- **v3 proof (passes).** The field opens empty.

## The coordinator's decisions

- **Digit keys.** They still choose options, now only under a1's in-view rule and with Undo. Checked by the a1
  checks.
- **Tab keys.** Tabs move from `Alt+1…4` (a browser-tab conflict on Linux) to `g` then `s`, `d`, `c` or `t`:
  Summary, Decisions, Code, Details. They are listed in the `?` help. Proof: «g d» opens Decisions and «g c» opens
  Code.
- **Start review.** It goes to the first open item in Decisions order, as a focused card: Q2 on run38.
- **The check's warnings about kept code.**
  - Details › Coverage shows «30 kept blocks serve only assumed requirements: name what each serves, or make it a
    question or an idea for the owner», on run38. Where present, it also shows the warning about kept blocks
    with no requirement. Each warning has «Show in Code».
  - «Show in Code» filters the code view to those blocks, with a removable token «Kept, serving only assumed
    requirements». These blocks are not attention items.
  - Proof: on run38 the warning reads 30, and «Show in Code» sets the filter and selects the first such block.
- **In-page code search.** It works through the toolbar's «Find» or `Ctrl/⌘+F` in Code.
  - It searches the diff's text in every file, drawn or not, folded or not.
  - It shows «3 of 11». Enter and Shift+Enter step to the next and previous match.
  - Each match is drawn, unfolded and landed in the middle of the code area, with an accent outline.
  - Proof on big: «applyWithoutVariant» has 11 matches in 5 files. 11 of 11 land drawn and in view, including
    matches in kept code that was never drawn.

## Partial items from the re-check

- **5 — following a place that a filter hides.** Following a place now resets the filters that hide it, as
  following a block always did. It also redraws only what changed.
  - Proof: with the R5 filter set, F1's «Show in Code» clears the filter and lands `agent-run.mjs:102` in view.
- **17 — Shift+K right after Shift+J.** Moving and landing now use the same line below the toolbar, so Shift+K
  steps back. Proof: file 3, then file 2.
- **j speed.**
  - **Changes.**
    - The answering controls of a multi-block decision stay where they are while j walks its blocks; they move
      on «Answer here», `o` or `d`. A j no longer redraws notes.
    - The selected note shows its key hints instead.
    - The toolbar offset is cached instead of forcing a style and layout read on every call.
    - The filtered walk is cached.
    - The context column is drawn only when open.
  - **Measurement.** The in-page median on big, for a j's handler plus two frames, is 30–39 ms over the runs
    (v1: 13 ms, v2: 51 ms, same probe). The checked bound is under 50 ms.
  - **What was not kept.** `content-visibility` on drawn files gave 21–23 ms, but it broke exact find landing
    (8 of 11) and the DOM bound (peak 71,693 elements), so it was removed.
- **Polish.**
  - «Show in Code» from Comments now centres the line in the code area (0 px off).
  - The Decisions panel no longer shows an empty «Code · 0 blocks».
  - The units table is compact: jobs on one line, the reason and «uses» / «used by» on two, with full text in the
    tooltip and the panel.
  - «Files viewed N of M» shows on every tab.
  - The skip link and the toast are not printed.
- **Found while testing.** A link to another Details sub-tab, or to Decisions › Comments, did not redraw the body
  when that tab was already drawn. It does now.

## Measurements (headless Chromium 1440×900, final run, 77 of 77)

- **big.html load.** It opens in 165 ms wall time: DOMContentLoaded at 131 ms, first paint at 68 ms, app script
  48 ms.
- **Tree clicks on big.** 6 of 6 within 3 px in both views.
- **The DOM on big.** Scrolling the whole All view peaks at 38,608 elements.
- **Contrast.** No text below WCAG AA in light or dark.
- **Width.** Nothing scrolls sideways at 1024 px.

## Remaining gaps

These carry over from v2, apart from the new one:
- A single 1,768-row file is drawn whole near the viewport.
- The word for an answered evidence request is still open.
- There is no persistence or export.
- **New:** the critic's v2 scripts press `Alt+1…4`. On v3 that becomes `g` then `s`, `d`, `c` or `t`.
