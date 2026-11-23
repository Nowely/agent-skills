# After entrust 0.47.0: what the merged state shows, and what to do next

A review of `main` at `45fbea2` (entrust 0.47.0, #113), written before any further change. The design-to-code
suite passes, 190 of 190; so do the planted case (28), the real-run scripts (11), the package test and the stateful
bench. The skill stays experimental: runs A and B on the real task have not run.

## Problems found

1. **The card bench blocks two clean builds on Linux, on a journey (E166).**
   - **The failure:** `control` and `common-shift` fail "network help: an open popover survives a resize". After
     `{"width":300}`, `.pop-net` is open with 127 px outside the window.
   - **The cause is the control:** its `place()` (`packs/control26/card.js:89–103`) sets the popover above its
     icon when there is no room below, even when there is no room above either, and never clamps it.
   - **Why it shows now:** the stricter placement check after a resize (`7e0c9eb`, `c44257f`) sees it. The earlier
     check compared with a fresh load, which drew the same placement.
   - **Why it slipped:** the benches are opt-in (`ENTRUST_BENCHES=1`) and not in CI, so the commits that tightened the
     check never ran them.
   - E165 records the same two builds blocked on macOS by another finding, a type size.
2. **The journey width floor is not a contract (E167).**
   - **What happened:** item 8 of [44](44-classes-into-the-checker.md) fails a step whose container is narrower than
     at the sweep's `from`. In the Terra gate ([46](46-catalogue-terra-gate.md), [50](50-catalogue-blocked-handoff-gate.md))
     the hidden judge said ACCEPTED, yet the handover was `fail`, then blocked: the catalogue's own page leaves the
     card 47 px beside the open sidebar at 375 px.
   - **Why that is wrong:** `from` is the builder's choice. Record 46 itself says the narrowest supported width is
     the owner's decision, and 288 px is not it. A check failure that rests on a bound no contract gives is a failure
     the checker causes, which the success clause rules out. The blocked handoff (`cf4c3ba`) reports it honestly, but
     the owner should not meet it as a fail.
3. **The checker grew faster than its measures.**
   - **The size:** `design.mjs` went from 1946 to 2528 lines in one PR (+30 %), and `check.md` by about 80 lines.
   - **What is measured:** the benches guard that clean builds are not blocked. The cost of a run on 0.47.0 (calls,
     rounds, entries) is measured only by the one Terra gate.
   - **Why it matters:** the goal of this line of work was less overhead.
4. **Results depend on the platform.** E164 (a +16.5 px delta that a test rounds to 16) and E165 (a type finding)
   appear on macOS and not here. The tests and benches lean on font rendering.
5. **Known limits, carried from 44:**
   - any child-list change inside the root counts as content for the lifecycle gate;
   - a stale observer is caught only where a `sameAsFresh` journey runs;
   - a target mounted more than a second after its opener's click reads as off its page.

## Recommendations, in order

1. **Fix the bench's control (E166).**
   - Clamp the popover into the window when neither side has room.
   - Keep today's unclamped control as a new mutant, `popover-out-after-resize`, expecting the journey class.
   - Pass: card bench 16 of 16, no clean build blocked. Cost: none at runtime.
2. **Tie the journey width floor to the contract (E167).**
   - **When it is a finding:** only when the narrowest supported width is stated with its source, which the page's
     "The data's limits" already asks the builder to find.
   - **Otherwise:** the squeeze is a candidate, answered as an owner's question in `review.md`.
   - **The controls:**
     - the catalogue gate's state reads `pending` with the question, not `fail`;
     - `squeezed-by-sidebar` with a stated narrowest width stays caught.
3. **Run the benches before a design-to-code release.** Add them to RELEASING.md's conditional checks for changes
   under `skills/design-to-code/`. They take about five minutes and spend no model tokens.
4. **Measure the cost of 0.47.0 before adding more rules.**
   - **The arms:** three Sonnet arms each on the prebuilt planted card and the catalogue card. Compare calls,
     rounds, entries and status with the 0.46.1 arms in [40](40-overhead-and-one-sitting.md) and 44.
   - **The rule:** a new rule without a failing control is not added; one that raises cost without catching a class
     is reverted.
5. **Make the platform drift explicit.** Load the test fixtures' fonts from files, or widen the two assertions to
   the band the checker itself uses, then close E164 and E165 or restate them.
6. **Then the real task.** Rerun the catalogue gate on the commit with 1 and 2, then runs A and B per
   [41](41-the-sitting.md), with the commit registered first.
