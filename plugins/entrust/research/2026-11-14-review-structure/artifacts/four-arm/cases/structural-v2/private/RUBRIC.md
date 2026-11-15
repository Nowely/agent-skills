# Private Evaluation Rubric — `structural` (`cryo-box-checkin`)

> **Confidential / Evaluator-Only** — must never be copied into `repo/`, `base/`, `head/`, or `brief.md`.

## 1. Functional Status & Evidence-Based Evaluation

No functional defect in `head` was found against the `brief.md` contract:
- Enforces the 10-step error priority hierarchy (`INVALID_BARCODE` through `BOX_FULL` / `NO_COMPATIBLE_SLOT`), symmetric orthogonal BSL-2 cross-study containment (diagonals allowed, trimmed `studyId` comparison, pre-existing records without `hazardClass` treated as `"standard"`), urgent-row reservation (`thawCount === box.maxThawCount`, including `maxThawCount === 0`), and overflow only when zero compatible regular slots exist.
- Produces exact label flag ordering (`["BSL2", "AT_THAW_LIMIT", "OVERFLOW_URGENT_ROW"]`), invokes `labelQueue.enqueue` before `auditLog.record` (`src/checkin.js:114–127`), and performs zero mutations/port calls on rejected requests.

**Evaluating functional, edge-case, and test-coverage findings by fact**:
- Do **not** categorically reject every functional or edge-case remark; verify each claim against actual code behavior and `brief.md`:
  - **Contradicted claims**: Reject claims asserting that `head` returns the wrong error code, wrong slot, wrong flag order, or mutates state/ports on inputs governed by `brief.md` when actual execution contradicts the claim.
  - **Factually accurate observations (valid, never penalized)**: Credit or accept observations grounded in the actual code/tests — for example, noting unspecified out-of-contract behavior (such as malformed `box` configuration or throwing/mutating `ports` implementations), or pointing out real gaps in `test/checkin.test.js` (for instance, `head` correctly rejects trailing-whitespace `preferredSlot` values such as `"A1 "` via `SLOT_CODE_PATTERN` at `src/box-grid.js:1`, whereas existing tests do not probe trailing-space slot strings, so a regex mutation accepting `"A1 "` would pass the supplied test suites).
- **Coverage scope of private verification**: `private/verification-report.json` establishes 14/14 kills on the listed negative mutants, **not** exhaustive behavioral or mutation coverage across all possible inputs.

---

## 2. Observable Structural Load Introduced by `base → head`

In `base`, module responsibilities were clean and value-oriented:
- `src/box-grid.js` owned grid coordinates and slot lookup (`parseSlotCode`, `formatSlotCode`, `findOpenSlot(box, preferredSlot) -> { ok, slot | code }`).
- `src/checkin.js` owned request validation, domain checks, label flag derivation, box update, and port calls.

The `base → head` change introduced **concrete structural load visible in the code today** (not merely hypothetical future risk):

### A. Single Domain Invariant Scattered Across Caller (`src/checkin.js`) and Callee (`src/box-grid.js`)
1. **Duplicated urgent-row resolution in two encodings**:
   - `src/box-grid.js` (`scanBoxSlots`, lines 53–56) computes `urgentRowIndex` as a 0-based row integer (`box.urgentRow.charCodeAt(0) - 65 : box.rows - 1`).
   - `src/checkin.js` (`checkinVial`, lines 72–76) independently computes `urgentRowPrefix` as a string (`box.urgentRow : String.fromCharCode(65 + box.rows - 1)`) and checks `parsed.code.startsWith(urgentRowPrefix)`.
2. **Split slot-selection & compatibility rule**:
   - Auto-allocation partitions candidates inside `scanBoxSlots` (`src/box-grid.js:52–91`), then selects between `state.urgentCompatible[0]` and `state.regularCompatible[0] ?? state.urgentCompatible[0]` in `src/checkin.js:97–102`.
   - `preferredSlot` handling (`src/checkin.js:61–92`) parses and checks occupancy (`lines 62–68`), runs `scanBoxSlots(box, state)` across the entire grid (`line 70`, which already checks `hasContainmentConflict` on every open cell at `src/box-grid.js:72`), evaluates urgent-row mismatch in `src/checkin.js:78–83`, and repeats `hasContainmentConflict(...)` on `parsed` at `src/checkin.js:84–86`. *(Note: because box dimensions are bounded to `26 × 99 = 2,574` cells, this extra scan/check is structural duplication and unnecessary work rather than a demonstrated performance bottleneck.)*
   - Verifying *"when is slot `S` eligible for vial `V`, and when does placement count as overflow?"* requires tracing both files simultaneously.

### B. Unrelated Concerns Communicating via Shared Mutable State (`state`) & Redundant Cleanup
1. **Spatial grid scanning coupled to presentation/spooler flags**:
   - `src/checkin.js:49–58` allocates a mutable `state` bag (`hasOpenSlot`, `regularCompatible`, `urgentCompatible`, `overflowUsed`, `flags`) and passes it into `scanBoxSlots(box, state)`.
   - `src/box-grid.js` writes label-printer tokens (`"BSL2"`, `"AT_THAW_LIMIT"` at `lines 58–63`) and overflow state (`state.overflowUsed = true` and `"OVERFLOW_URGENT_ROW"` at `lines 83–90`) during grid scanning, before the caller has finalized slot selection.
2. **Unreachable/redundant cleanup in `src/checkin.js:87–90` (coupled invariants, NOT required reconciliation)**:
   - On contract-valid inputs, the cleanup block `if (!targetsUrgentRow && state.overflowUsed) { ... }` (`src/checkin.js:87–90`) is **dead/unreachable**: if `parsed` is outside `urgentRow`, open (`lines 66–68`), and passes `hasContainmentConflict` (`lines 84–86`), `scanBoxSlots` has necessarily added `parsed.code` to `state.regularCompatible`, so `state.regularCompatible.length > 0` and `scanBoxSlots` (`lines 83–90`) never set `state.overflowUsed = true` (and at the thaw ceiling `!state.atThawLimit` is `false`).
   - Do **not** claim the caller is *forced* to clean up `state`; rather, this dead guard reflects heightened coupling between `scanBoxSlots` and `checkinVial` (proving it unreachable requires reasoning across both modules' invariants) and adds needless branch complexity.
   - **Independent reviewer findings**: Credit a reviewer who accurately identifies `src/checkin.js:87–90` as dead/redundant code, just as well as one who diagnoses the broader `state`/flag coupling that motivated it.

---

## 3. Cohesive Guard Control (Anti-Signal for False Decomposition)

At the top of `checkinVial` (`src/checkin.js:6–35`), six sequential guard clauses validate scalar fields of `request` in strict priority order (`INVALID_BARCODE` → `INVALID_STUDY` → `INVALID_TIMESTAMP` → `VOLUME_OUT_OF_RANGE` → `INVALID_THAW_COUNT` → `INVALID_HAZARD_CLASS`).

- **Why this guard should NOT be fragmented just for helper/line count**:
  - All checks operate on `request` (and `box.maxVolumeUl`) at entry, have zero side effects, are not reused elsewhere, and directly encode the specification's priority table in sequential order.
  - Splitting each `if` into six micro-helpers (`validateBarcode`, `validateStudy`, etc.) adds indirection without unifying any split invariant or removing cross-module mutable state.
  - Keeping the guard inline **or** extracting the cohesive request-validation block as a single pure function is reasonable if justified, provided the reviewer does not prescribe arbitrary helper/line counts or treat fragmenting this cohesive guard as the core structural fix.

---

## 4. Acceptable Reasonable Directions & Tradeoffs

No fixed number of files or helper functions is prescribed. Multiple proportionate outcomes are valid when grounded in concrete code facts and tradeoffs:

### Direction 1: Value-Returning Slot Resolution in `box-grid.js`; Presentation Flags Owned by `checkin.js`
- **Shape**:
  - Replace mutable `scanBoxSlots(box, state)` with a pure, value-returning resolver (e.g., `selectSlot(box, { studyId, hazardClass, atThawLimit, preferredSlot }) -> { ok: true, slot, overflowUsed } | { ok: false, code }`) backed by one `getUrgentRowIndex(box)` helper.
  - Compute `flags` (`["BSL2", "AT_THAW_LIMIT", "OVERFLOW_URGENT_ROW"]`) once in `checkin.js` from `{ hazardClass, atThawLimit, overflowUsed }` after slot selection succeeds.
- **Why simplification genuinely helps**:
  - Eliminates cross-module mutation (`state`), removes printer-flag tokens from `box-grid.js`, deletes duplicate `urgentRow` logic and the dead cleanup at `src/checkin.js:87–90`, and unifies placement eligibility behind a narrow value return (consistent with `base`'s `findOpenSlot`).
- **Cost**:
  - Keeps domain placement policy (`urgentRow`, `atThawLimit`, BSL-2 neighbor rules) inside `box-grid.js` rather than keeping `box-grid.js` purely geometric, and changes an internal module interface.

### Direction 2: Pure Geometry in `box-grid.js`; All Check-In Domain Policy Consolidated in `checkin.js`
- **Shape**:
  - Restrict `box-grid.js` to domain-agnostic grid geometry (`parseSlotCode`, `formatSlotCode`, orthogonal neighbor coordinates/iteration).
  - Consolidate urgent-row resolution, BSL-2 cross-study conflict, `preferredSlot` vs row-major selection, `overflowUsed`, and `flags` derivation inside `checkin.js` using local immutable values.
- **Why simplification genuinely helps**:
  - Restores `box-grid.js` to reusable grid geometry free of specimen/hazard/thaw/label rules and keeps the entire placement + error-priority decision in one module without cross-file state passing or dead defensive code.
- **Cost**:
  - Expands `checkin.js` and leaves placement policy unextracted if a second caller later needs BSL-2 slot scanning.

### Argued Retention (Conditionally Acceptable)
- Retaining the current two-file structure (optionally trimming only the dead block at `src/checkin.js:87–90` or recording restructuring as non-blocking follow-up) is **acceptable** when grounded in factual tradeoffs:
  1. Recognizes the actual coupling introduced in `head` (split `urgentRow`/placement reasoning across `checkin.js` and `box-grid.js`, mutable `state` coupling spatial scanning to printer flags, and/or the redundant `checkin.js:87–90` guard),
  2. Accurately scopes runtime risk using observable facts (e.g., `state` is freshly created per synchronous `checkinVial` invocation at `src/checkin.js:49–58`, so there is no cross-call state leak), and
  3. Weighs refactor churn and regression risk against readability gain — **without** needing to claim that current tests exhaustively cover all behavior and **without** denying the observable coupling.

---

## 5. Scoring Guidance Summary

- **Strong pass**:
  - Evaluates functional behavior accurately from code/spec facts (no invented defects; any test-gap or out-of-contract remarks are factually verified).
  - Identifies the concrete structural load in `head`: split `urgentRow`/placement logic across `src/checkin.js` and `src/box-grid.js` plus shared mutable `state` coupling spatial scanning (`src/box-grid.js:58–63, 83–90`) to output flags (and, if noted, recognizes `src/checkin.js:87–90` as dead/redundant rather than required cleanup).
  - Recommends a proportionate simplification (such as Direction 1 or Direction 2) with explicit costs, **or** justifies retention/minimal cleanup via concrete churn-vs-coupling tradeoffs, without prescribing arbitrary helper counts or fragmenting the cohesive validation guard (`src/checkin.js:6–35`).
- **Weak / Fail signals**:
  - Asserts functional bugs on `brief.md` inputs that are contradicted by `head`'s actual behavior.
  - Misses the `checkin.js` ↔ `box-grid.js` mutable `state` / split-invariant coupling while demanding mechanical decomposition of the cohesive request guard ("extract 6 validator helpers", fixed line/function limits).
  - Relies on generic style slogans without tying recommendations or tradeoffs to concrete code interactions.
