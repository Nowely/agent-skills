# Mechanism weight demo v1

Coordinator-enriched copy of round-9/reviews/r04.json on contact-import-v2/head. It is not a new blind model
review and does not change the frozen round9 result. The original source base/head and diff digest remain
recorded in change.sources; reproduce the source through evals/review/prepare.mjs before rendering.

The new copy assigns explicit code/test kinds to the existing blocks and links each mechanism to inspected
blocks. Counts are derived; numeric weight totals are not stored in the review. Attribution uses the existing
coarse logical blocks. In particular B13 includes retries, the actual insertion and the created counter, so it
is shared with direct row application and normalization. Its count is not a claim that every line is removable.
B16's generic test imports are not assigned to a particular mechanism. Do not sum mechanism weights into a
project budget or compare differently grouped inventories as a complexity score.

Benefit/cost prose was clarified from the supplied task and source: the observed loss on removal, existing
alternatives, lifecycle/coupling and explicitly unknown scenario frequencies. No probability, runtime cost
or new functional finding was invented. Keep this version separate from the prior report and its annotations.

Validation: the recorded source diff digest matched; renderer check passed; rendering left this JSON unchanged.
Weight arithmetic, shared attribution, kinds, +/- lines, blank lines, unknown/zero and legacy records are covered
by focused report tests. The six rendered cards were inspected in the browser, with valid block links and no
page overflow at the inspected desktop viewport. This is instrument/UI validation, not evidence that the new
instructions improve model review quality.
