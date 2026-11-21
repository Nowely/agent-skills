# Iteration 2 so far: a positive control, and an architectural review

## The positive control

To learn whether the judge accepts anything, the frozen 23.1 submission was hand-fixed by following the checker,
then blind-reviewed alone, twice.

- **First pass,** with draft 24's checker. The three deciding findings of iteration 1 were fixed by the checker's
  readings: the disk format per frame, the column gaps, the 280 cores row. The checker named nothing more.
  **Returned**, for two things the checker had got wrong:
  - **The 280 footer gap.** I narrowed it to 7 px against the frame's 18, because the checker read a gap from
    different points. The design joined the help icon into its label's ink and the page did not. The checker's false
    reading made a correct layout worse.
  - **The 486 rows below the header,** 4–6 px high. Each step was within the 4 px tolerance, and the gap reading hid
    what they added up to.
- **Draft 24.1's checker, after this:**
  - reads a gap only from a neighbour drawn alike on both sides;
  - reads rows by their place;
  - reads a right edge only for what the design sets against the root's right side, and a centre only for what it
    centres.

  It then named the 764 CPU column (11 px left) and the 486 drift that the reviewer saw. It still cannot tell, in
  another font, whether the frame keeps a column's place or its gap: in one column the first line was excused by
  its gap and the second flagged by its place.

## The architectural review

Fable read the skill, the results and [the survey of the outside world](25-external-landscape.md), and answered the
owner's questions: does the approach work, does it scale beyond cards, what should be rethought, what is stronger.

- **Keep:** the deterministic checker, the sweep, journeys, the dense story, the evidence file.
- **Stop investing in ink pairing.** It segments both images independently and pairs them by about fifteen
  constants tuned on one light card. Any disagreement in segmentation is a phantom finding or a hidden one, it is
  blind to what the text says, and a false reading can force a wrong fix.
- **Replace it with named boxes.** The screenshot path becomes the Figma path:
  - the script proposes boxes on the frame;
  - the agent names each once (its text and the page selector) and merges or splits where needed;
  - the script checks that every piece of ink belongs to a box;
  - comparison runs on the existing spec path, the page measured from its DOM.

  Text and format become exact assertions. Relations (gaps, shared edges, rows, order per mode) are derived from the
  boxes, not hand-written, and checked across the sweep, with absolute place as the check on accumulation.
- **Close the excuse channel for named findings, and open a dispute.** A proposal on a gap, a position, an order, a
  text or a presence keeps `fail`. The exits are the owner, a measured "cannot be built", or `disputed` with a crop
  pair, since the checker can be wrong.
- **A fresh-context reviewer pass at handoff.** Read-only, shown the references, the captures and the findings,
  never the implementer's reasons. Every return so far came from the blind reviewer; the implementer's own loop hid
  the offsets or excused them. It needs calibrating first, since models flag many clean screens.
- **Scaling.** The collision sweep, journeys, the dense story and named boxes generalise. Ink pairing, "pieces share
  a row" and one paper colour are card-specific. What breaks first:
  - long text pages: absolute places below a wrapped paragraph;
  - tables: near-identical rows;
  - forms: states without frames;
  - modals: a scrim against the paper colour;
  - dashboards: charts;
  - dark themes: thresholds;
  - animation: settled captures.
- **Evidence.** Three drafts, one run each, on one case, cannot separate a draft's effect from noise. The review's
  minimum plan:
  1. **Calibrate the judge by construction:**
     - take existing UIs (a table, a form, a modal and the card);
     - capture each in another font as its design;
     - seed about eight known defects each;
     - measure the precision and recall of the checker and of the judge.
  2. **Freeze one draft,** and run four cases twice each, one of them through Figma.
  3. **Decide by a rule fixed beforehand.** Classify every return as not seen, seen and excused, or measured wrong.
