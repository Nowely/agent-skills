# Card bench

What it measures: whether the design-to-code checker (`design.mjs check`) raises the return class a known defect belongs
to, and stays quiet on a clean build. Each build is checked with its own pack; the classes it should raise are matched
against the classes the checker raised (a journey that fails counts as `journey`; a finding's property or gap as its
class). A class is CAUGHT when every expected class is raised, MISSED when not. A build with nothing expected that
raises anything is a clean build blocked; so is one whose complete status is `fail`, or `incomplete` for anything but
what the bench's own corpus and config leave: the corpus's unnamed stand-in icons ("AMD", "?"), and the frames' openers,
which read as unchecked because the bench's journeys run on the frames' page without each frame's width in the url.
Each clean build's status is printed, with what holds it. The bench's config and the frozen packs give `"lifecycle"` a
reason: the bench judges the frames, the sweep and the journeys.

The control is an accepted offer card (`packs/control26`), with its kit, its frames, and the judge's data
(`corpus/data.js`, frames in `corpus/`). Mutants copy its `card.js`, `card.css`, `story.html` and `kit/`, add one change
and check it against the corpus frames. The control's own type findings are carried in a ledger as proposals, so a clean
build reads pending, not blocked. Frozen submissions are earlier builds checked with the packs their builders left.

## Run

From this folder, with Playwright and Chromium installed (in the repository, or globally; the runner resolves it as the
case tests do):

```
node run.mjs                          # the skill in this repository
node run.mjs --skill <dir>            # another skill's scripts folder (holding design.mjs)
node run.mjs --label before cut-sku   # a label for out/<label>/, and only the named builds
```

It writes `out/<label>/<build>/` (`check.txt`, `out/result.json`) and `out/<label>.txt`; `out/` is not committed. About
3.5 minutes, three builds at a time. The opt-in test runs it and asserts the numbers (from `plugins/entrust`):

```
ENTRUST_BENCHES=1 node --test evals/design-to-code/benches/card/card.test.mjs
```

The test asserts minimums: caught at least 15, no clean build blocked. Raise the minimum when a fix lands.

## Builds

Mutants (a change to the control, each expecting one class):

- `control`: unchanged; expects nothing.
- `price-capped`, expects `wrap`: the price block capped at 150 px, its period wrapping while the card has room.
- `popover-noflip`, expects `journey`: the network popover opens outside the window (pack `v25a`).
- `small-type`, expects `type`: the specs text set to 13 px, smaller than drawn.
- `dropped-disk`, expects `text`: only two of the disks rendered.
- `overlap`, expects `overlap`: the CPU model pulled 60 px over its neighbour.
- `column-shift`, expects `offset`: the RAM column moved 30 px in the wide layout. MISSED today (ISSUES.md E149).
- `order-swap`, expects `offset`: the stock icon moved after its text in the mid layout.
- `disk-format`, expects `text`: a disk's size and count written in the other order.
- `cut-sku`, expects `cut`: the SKU clipped at 120 px.
- `c282c-price`, expects `type`: a frozen submission's price set about 2 px smaller than drawn (pack `c282c`).
- `large-type`, expects `type`: the specs text set to 18 px, larger than drawn.

Frozen submissions (earlier builds, each with its own pack, expecting the reason it was returned):

- `frozen-25.1A`, expects `journey`: the popover opens outside the window.
- `frozen-25.1B`, expects `wrap`: texts wrap while the card has room.
- `frozen-26.1`, expects `wrap`: the price block's period wraps onto its own line.
- `frozen-27`, expects `type`: type sizes off the kit's.
- `frozen-control`, expects nothing: the control as accepted, with the carried ledger.

Packs are copied without their outputs, scratch folders and design sources (`packs/*`); the corpus frames are the
specs and references the mutants are checked against.

## Today's result

Fresh run, `ENTRUST_BENCHES=1 node --test card.test.mjs` (label `test`), 4 min, the skill at this branch, the verdict lines:

```
control          expect [] · clean · raised [] · status incomplete
price-capped     expect [wrap] · CAUGHT · raised [offset, type, size, wrap, line] (also offset, type, size, line) · status fail
popover-noflip   expect [journey] · CAUGHT · raised [type, journey] (also type) · status fail
small-type       expect [type] · CAUGHT · raised [offset, type] (also offset) · status fail
dropped-disk     expect [text] · CAUGHT · raised [text, offset] (also offset) · status fail
overlap          expect [overlap] · CAUGHT · raised [offset, text, size, cut, overlap] (also offset, text, size, cut) · status fail
column-shift     expect [offset] · CAUGHT · raised [offset] · status fail
common-shift     expect [] · clean · raised [] · status incomplete
order-swap       expect [offset] · CAUGHT · raised [offset] · status fail
disk-format      expect [text] · CAUGHT · raised [text] · status fail
cut-sku          expect [cut] · CAUGHT · raised [cut] · status fail
c282c-price      expect [type] · CAUGHT · raised [offset, type] (also offset) · status fail
large-type       expect [type] · CAUGHT · raised [offset, type, size, text, align] (also offset, size, text, align) · status fail
frozen-25.1A     expect [journey] · CAUGHT · raised [type, journey] (also type) · status fail
frozen-25.1B     expect [wrap] · CAUGHT · raised [wrap] · status fail
frozen-26.1      expect [wrap] · CAUGHT · raised [type, wrap] (also type) · status fail
frozen-27        expect [type] · CAUGHT · raised [type] · status fail
frozen-control   expect [] · clean · raised [] · status pending

caught 15 of 15 expected classes; 0 clean builds blocked
```
