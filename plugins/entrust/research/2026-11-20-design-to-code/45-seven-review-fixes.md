# Seven review fixes: observed boundaries

This record follows the approved review-fix plan for #113. The implementation candidate is `f4f570f`; the comparison
baseline is `f668204b50a120ae0184df3c2b0f562295792389`. The candidate adds only a browser test after production commit
`998a8a3`. It is not a new full-task implementation or a general guarantee of design quality.

## Changes and limits

1. **Control actions.** Frame inventory, quick and full measurements do not click unconfigured controls. Setup and
   journeys provide the actions. An absent target alone does not prove a control belongs to a different page; without
   sufficient evidence its coverage is incomplete.
2. **Accessible identity.** Playwright's accessibility snapshot supplies the computed role and name, including
   `aria-labelledby`; differently named controls do not cover each other. Unrecognized identity remains unknown.
3. **Data lifecycle.** A journey can optionally declare `dataFields` and assert changed text in a stable, previously
   visible field. An undeclared or ambiguous mutation, including replacement, reordering or exchanged texts, does not
   establish a data lifecycle; absent another qualifying lifecycle or an explicit reason, the complete check is
   incomplete.
4. **Consumer and route.** A consumer journey uses its own viewport; registered frame and sweep story URLs use the
   configured host. Query and fragment are part of the route and can select distinct states.
5. **Resized state.** An independent parent-width change needs a placement assertion in that state or an equivalent
   `sameAsFresh` endpoint. Without the evidence, geometry is unmeasured; a window-width step alone does not establish
   the product's parent-width lifecycle.
6. **Media listeners.** Native `MediaQueryList.onchange` behavior and callback identity are retained. Assignments to
   that property are outside script-set mode attribution; supported registered listeners remain attributable.
7. **Motion.** Journeys use natural motion and bounded checks for settling. A snapshot or sampled animation frames do
   not automatically establish visual continuity between samples; later timers and unfinished motion can leave a state
   unmeasured and need separate observation.

## Review and checks

The coordinator reported an Astra critic on `64d46a3` exercising 19 independent scenarios without a blocking finding,
separately from a Terra verifier's 15 targeted runs with no skips. After the story/consumer routing change, the
coordinator reported separate critic and verifier confirmation of the production diff at `998a8a3`; `f4f570f` added
the routing browser test. The underlying independent returns are not included here. A regression count for the whole
change is not established by these reports.

The coordinator reported four successful GitHub CI checks on `f4f570f`, including Ubuntu and macOS. Local checks at
`f4f570f` and their limits:

| Check | Result |
|---|---|
| Full `design-to-code.test.mjs` | 181 tests: 180 passed, one failed, none skipped. The v25 `32 ядер` x assertion got +16.5 rather than a delta rounding to 16. The same assertion and +16.5 occurred on `f668204`; [E164](../../ISSUES.md#e164-the-v25-boxes-assertion-fails-on-a-165-px-column-shift) remains open. |
| Card bench | 15/15 expected classes caught; two clean builds, `control` and `common-shift`, blocked by `Доступно 1 type -15`. Both have the same finding on `f668204`. `frozen-control` is clean with status `pending` after the routing fix. [E165](../../ISSUES.md#e165-the-card-bench-blocks-two-clean-builds-on-a-type-finding) remains open. |
| Stateful bench | The coordinator reported four of four expected classes caught and no clean build blocked; the local test output confirms at least four caught and no clean build blocked. |
| Planted-case unit checks | 28 passed, none skipped. |
| Skill mechanical checks | 8/8 passed. |
| Terse page checks | 12/12 passed. |

The failing local checks were observed on macOS 26.7.2, Playwright 1.65.1 and Chromium 159.0.8154.6. Their cause is
not established. The baseline observations do not turn the candidate's local results green and do not establish that
all environments behave alike.

The Terra gate and real A/B runs were not run. Before the next gate, pin the newly checked commit, not the earlier
`55b37c3` pin. These controls measure the named cases; they do not prove general frontend quality or uninterrupted
visual motion between captured frames.
