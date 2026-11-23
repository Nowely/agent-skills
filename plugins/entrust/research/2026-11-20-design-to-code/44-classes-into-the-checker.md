# The return classes into the checker: registered before the work

The owner's plan on #113 asked us to treat the observed remount and alignment defects as controls for broader classes,
not as rules per card. Fable read it with the practice first: what returned Terra's real work, and what covers it as a
class without the builder having to remember it. The owner chose that reading (2026-11-22). Written before any of it is
built.

## What returns a first submission, by the evidence

1. **The lifecycle through the real consumer.** In [31](31-terra-real-task.md) the card kept its compact layout at
   375 px after the list was emptied and refilled. Today this is caught only if the builder writes a `sameAsFresh`
   journey, and the stateful bench's `stale-observer` is still missed.
2. **The code as read:** two price paths, later rules overriding earlier ones, a selector outside the row (31). Only
   the review pass looks for these, and it has never run at `pass` or `pending` (E153).
3. **Dense legal data.** Covered by the generated conditions and the returns rows, when `returns.md` exists (E163).
4. **A layout bound to the window or switched by script.** Seen only when the frames are sized by the host.
5. **Static relations:** the column shift the card bench misses (E149).
6. **A choice kept across a re-render.** `sameAsFresh` cannot see it.

## The items, in order

| # | Item | Where | Failing control first | Pass | Cost |
|---|---|---|---|---|---|
| 1 | **Lifecycle required.** A complete check is `incomplete` until one journey on the consumer page carries `sameAsFresh`, or `design.json` says the product has no lifecycle. After each such journey, the check itself resizes through the frames' widths and compares each with a fresh load. | checker | the stateful bench's `stale-observer` (missed today) and its `control`; a `design.json` without the journey | `stale-observer` caught; `control` clean; the catalogue reference has no new finding; the journey-less `design.json` reads `incomplete` | a fresh load per width per such journey; about 20 page words |
| 2 | **The component's own width.** A generated condition at each frame width compares the window at W with the window at 1280 and the root's parent forced to W. A difference is a candidate. | checker | the catalogue card's start code (`matchMedia`) with frames sized by the window, against its reference | the start code raises it; the reference and the card bench block no clean build | seconds |
| 3 | **Script-set modes and stale observers.** `ResizeObserver` and `matchMedia` are wrapped in an init script. A mode set by script is a note that needs a reason. An observer whose target is disconnected after a journey is a finding. | checker | the stateful `control` (observer follows the mount) and the stale mutant | a note on both; a finding only on the mutant | none |
| 4 | **What the contract keeps.** One page line: a journey asserts it after a re-render. | page | the catalogue judge's `choice` (DOM-kept) against the reference | a builder's own journey fails on the DOM-kept build (read in the Sonnet arms and the Terra gate) | about 25 page words |
| 5 | **The review pass, run, with a sixth question:** which lifecycle can the consumer cause, and which journey takes it. | review pass | a stand-in for 31's checkpoint, which is not in this repository: the stale-observer mutant and a two-price-paths mutant, against the clean control | the mutants returned, each naming its cause; the control accepted | one pass, at most one fix round |
| 6 | **The column shift.** | checker | the card bench's `column-shift`, plus a new clean twin with a common shift | 15 of 15 caught; the twin clean | none |
| 7 | **E159, the one-digit pairing.** Kept because it cost rounds in two of two Sonnet arms. | checker | the prebuilt arm with a `delivery` value (E159 "Check") | the "1" paired with its own text; a displaced "1" still fails | none |

**Item 8, added before its work (found by the item-5 reviewers).** The stateful bench's page has a defect that its
"clean" control carried unseen. At 375 px the open filters sidebar (280 px, not shrinking) leaves the list about 47 px,
and titles break letter by letter. Two of six reviewers returned it. The check missed it: the sidebar journey asserts
only that the sidebar shows and hides. This is the owner's "width while open" class.

| # | Item | Where | Failing control first | Pass | Cost |
|---|---|---|---|---|---|
| 8 | **The component's width inside a journey.** After each journey step, the check measures the root's container. Below the sweep's `from` (the narrowest supported width), or with the page scrolling sideways, it is a finding. When the container's width changed in the step, the component is compared with a fresh load whose container is held at that width (item 2's hold). A difference is a finding. | checker | the bench page with the sidebar, kept as a new mutant `squeezed-by-sidebar`, and a fixed control whose sidebar stacks below a width; the catalogue's start code with its sidebar open | the mutant caught; the fixed control clean; the catalogue's start code caught while open, its reference clean; no clean build blocked on either bench | a fresh load per width-changing step |

**Item 9, added before its work (E152, found again by a catalogue arm).** Arm k3 on `d501762` was ACCEPTED by the
catalogue's hidden judge (width, choice, basics), in 20 calls, yet handed over `incomplete`. The Details openers on
`story.html` have no journey there, because that page has no sheet. A journey on the consumer page opens and closes the
same opener. This is the second catalogue arm stopped by it; c1 on 28.5 was the first. It is a failure the checker
causes, which the success clause rules out, and the Terra gate on this case would meet it.

| # | Item | Where | Failing control first | Pass | Cost |
|---|---|---|---|---|---|
| 9 | **An opener covered on another page.** An opener whose target is not on its page counts as covered when a journey on another checked page opens and closes an opener with the same selector, role and accessible name. A same-named opener with another role or target does not count. | checker | k3's frozen arm (`incomplete` today, on the Details openers alone); a negative twin: an unrelated opener that shares the text but not the role or target | k3 reads `pass` or `pending`; the negative twin stays `incomplete`; no clean build blocked | none |

**Benches move into the repository:** the card bench and the stateful bench live in the session's scratchpad. They
move under `evals/design-to-code/` so that their controls are tests that survive the session.

**The guard on overhead.** Items 1–3, 6 and 7 add seconds, not calls. Their risk is false candidates, which cost
rounds. So "no clean build blocked" on both benches is part of every pass criterion. A false candidate on a clean
build reverts the item.

## Then the gate, then the real runs

- **Sonnet first:** three arms on the catalogue card with the changed skill, against its hidden judge (width and
  choice). They read whether a builder now gets both through the skill.
- **The Terra gate (the owner):** one Terra arm on the catalogue card, with the changed skill pinned. It passes at
  `ACCEPTED` on width and choice, with the mechanism that showed each recorded. About 30 calls.
- **Runs A and B** on the real task follow, with the new commit registered in [41](41-the-sitting.md) before either
  starts.

**Dropped:**
- **The prose of the owner's section 1:** replaced by items 1–4.
- **The transient capture (2.4):** item 3 prevents it instead.
- **A new reference-integrity mechanism:** `setup`'s baseline stands, and P kept its inputs intact.
- **E148, E150, E151, E152:** none of them returned a real task.

A change that does not move its measure is reverted.

## Results (2026-11-22)

All on `design-to-code-after-0.46.1`; the head is `74f68b5`.

| # | Commits | Control before → after |
|---|---|---|
| 1 | `4052cf3`, fixed in `4c9da76` | stateful `stale-observer` missed → caught by the fresh compare after its lifecycle journey; a `design.json` with no lifecycle journey → `incomplete`; the catalogue reference: no new finding |
| 2 | `d5e9072`, `26ea95c`, fixed in `a3fe22f`, `44e6622` | the catalogue start code with frames sized by the window: 0 → 1 candidate (`window "card-375"`); the reference 0 → 0; the planted card 0 → 0; about 2 s per check |
| 3 | `5679003`, fixed in `e814bed` | the stale observer is a construct note, not a finding; a mode set in an observer's or listener's callback is a note; a one-shot `.matches` is not |
| 4 | `005a708` | one page line; read through the arms below |
| 5 | `005a708` | rp44, six fresh reviewers on three blind targets: the two mutants named 4 of 4; the "clean" target returned once, for a real defect on the bench page (item 8) |
| 6 | `bcf2021`, twin in `7908c4d` | card bench 14 → 15 of 15; `common-shift`, the clean twin, stays clean |
| 7 | `6e28613` | the stock "1" paired with the "1" of "Выдача за 1 день" → paired with its own; a "1" displaced by 60 px still fails |
| 8 | `594c762`, `3f23a75` | `squeezed-by-sidebar` (a 47 px container against 288 px at `from`) missed → caught; the catalogue start code with its sidebar open → fails; the reference holds; stateful bench 4 of 4 |
| 9 | `d0858bc`, `1b64217` | frozen arm k3 `incomplete` on the story page's Details openers → `pass`; twins with another role or target stay `incomplete` |

**The verifier's review of items 1–5 (Fable)** found:
- **Item 2, masking:** a candidate answered by any line that held the frame's name.
- **Item 2, false candidates:** page chrome, and a page-level root.
- **Item 3, false failures:** an element kept detached, and a cleanup deferred.
- **Item 1, a nominal gate:** a story-page journey that takes no lifecycle, and `"lifecycle": false` with no reason.
- **The benches:** they judged by classes, not by status.

All of these are fixed, each with a test that fails on the code before it.

**Tests:** 155 of 155. The planted case 28. Benches, with every clean build at `pass`, or `incomplete`/`pending` only for the bench's own stand-ins and nothing blocked:
- card: 15 of 15;
- stateful: 4 of 4.

**Sonnet arms on the catalogue card** (`d501762`, items 1–5), against the hidden judge:

| Arm | Calls | Status | Judge | E152 |
|---|---:|---|---|---|
| k1 | 25 | `pass` | ACCEPTED | worked round it with a copy of `index.html` |
| k2 | 27 | `pass` | ACCEPTED | moved the frames to `index.html` |
| k3 | 20 | `incomplete` | ACCEPTED | stopped on it; item 9 now passes it |

Each arm moved from `matchMedia` to a container query, kept the choice per host and id, and wrote its own `sameAsFresh` journey on the consumer page.

**Known:** the catalogue's own `page.css` also squeezes the list at 375 px with the sidebar open. A journey there fails on the page, not the card: a fair question for the owner, one ledger entry.

**A second, short verifier pass on items 6–9 and the fixes.** Items 6 and 7 ship as they are. It found three holes, each now fixed with a test that fails on the code before it:
- **Item 2:** a root whose own width followed the window read as "not measured", and a component placed directly in `body` was skipped. Fixed in `13f6fe3`.
- **Item 9:** a lazily mounted target read as "off its page", so a broken opener elsewhere was covered. Fixed in `ab8872c`: the opener is clicked on its own page first.
- **Item 8:** a zero-width collapsed panel failed falsely, and the root's identity drifted between steps. Fixed in `95f8a75`.

Noted, not changed:
- any child-list change inside the root counts as "data" for the lifecycle gate;
- a stale observer is caught only where a `sameAsFresh` journey runs.

**At `95f8a75`:** 158 of 158 tests; the planted case 28; card bench 15 of 15 and stateful bench 4 of 4, no clean build blocked. Arm k4 on `74f68b5` was ACCEPTED by the catalogue's judge at `pass`, in about 17 calls, with no work-round for E152. This is the commit the Terra gate pins.
