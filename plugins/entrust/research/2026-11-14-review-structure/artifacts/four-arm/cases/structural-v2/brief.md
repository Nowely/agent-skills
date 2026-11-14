# Specimen Box Check-In: BSL-2 Containment & Urgent-Row Policy

## Context

`cryo-box-checkin` assigns incoming laboratory specimen vials to slots in a rectangular freezer box (`rows` `1..26` labeled `A..Z`, `cols` `1..99` labeled `1..cols`, e.g. `A1`, `D12`), updates `box.slots`, enqueues a barcode label print job, and appends an audit log entry.

Previously, check-in placed a valid vial into `request.preferredSlot` or the first open slot in row-major order, enforcing only the box volume limit, maximum freeze-thaw ceiling, and barcode uniqueness within the box.

This change adds **BSL-2 cross-study containment spacing** and **at-limit urgent-row reservation with overflow**.

## Functional Requirements

### 1. Inputs & Defaults

- `box`:
  - `rows`: integer `1..26` (`A` is row index `0`; last row is `String.fromCharCode(65 + box.rows - 1)`).
  - `cols`: integer `1..99`.
  - `maxVolumeUl`: positive number.
  - `maxThawCount`: integer `>= 0`.
  - `urgentRow`: optional uppercase row letter within the box bounds; defaults to the last row of the box when `undefined`.
  - `slots`: object mapping occupied slot codes to stored vial records. Pre-existing slot records without `hazardClass` are treated as `"standard"`.
- `request`:
  - `barcode`: string matching `/^VIAL-[A-Z0-9]{4,12}$/`.
  - `studyId`: string with non-empty trimmed value (`studyId.trim()` is stored and compared).
  - `collectedAtMs`, `nowMs`: finite numbers satisfying `collectedAtMs <= nowMs`.
  - `volumeUl`: finite number satisfying `0 < volumeUl <= box.maxVolumeUl`.
  - `thawCount`: integer `>= 0`.
  - `hazardClass`: optional `"standard"` or `"bsl2"` (defaults to `"standard"` when `undefined`).
  - `preferredSlot`: optional slot code string (auto-select when `undefined` or `null`).
- `ports`:
  - `ports.labelQueue.enqueue(job)`
  - `ports.auditLog.record(entry)`

### 2. Containment & Urgent-Row Rules

- **BSL-2 cross-study containment**:
  - Two orthogonally adjacent slots (up, down, left, right; diagonals do not count) conflict when their trimmed `studyId` values differ **and** at least one of the two vials has `hazardClass === "bsl2"`.
  - Same-study neighbors never conflict. Two `"standard"` vials never conflict.
- **Urgent-row policy**:
  - Vials at the thaw ceiling (`thawCount === box.maxThawCount`) may **only** be placed in `urgentRow`.
  - Vials below the thaw ceiling (`thawCount < box.maxThawCount`) must be placed outside `urgentRow` whenever at least one open, containment-compatible slot exists outside `urgentRow`.
  - When **zero** open, containment-compatible slots exist outside `urgentRow`, a below-limit vial may use an open, containment-compatible slot in `urgentRow` (**overflow**, `overflowUsed = true`).

### 3. Error Priority

When multiple failure conditions hold, `checkinVial(box, request, ports)` must return `{ ok: false, code }` with the **first** matching code in this exact order:

1. `INVALID_BARCODE` — `barcode` is not a string matching `/^VIAL-[A-Z0-9]{4,12}$/`.
2. `INVALID_STUDY` — `studyId` is not a string or `studyId.trim().length === 0`.
3. `INVALID_TIMESTAMP` — `collectedAtMs` or `nowMs` is not a finite number, or `collectedAtMs > nowMs`.
4. `VOLUME_OUT_OF_RANGE` — `volumeUl` is not a finite number, `volumeUl <= 0`, or `volumeUl > box.maxVolumeUl`.
5. `INVALID_THAW_COUNT` — `thawCount` is not an integer or `thawCount < 0`.
6. `INVALID_HAZARD_CLASS` — `hazardClass` is neither `undefined`, `"standard"`, nor `"bsl2"`.
7. `THAW_LIMIT_EXCEEDED` — `thawCount > box.maxThawCount`.
8. `DUPLICATE_BARCODE` — `box.slots` already contains an entry with the same `barcode`.
9. When `preferredSlot` is provided (`!== undefined && !== null`):
   1. `INVALID_SLOT` — `preferredSlot` is not a canonical in-bounds slot code (uppercase row letter + 1-based column without leading zeros, e.g. `"B4"`).
   2. `SLOT_OCCUPIED` — `preferredSlot` is already present in `box.slots`.
   3. `URGENT_ROW_MISMATCH` — either `thawCount === box.maxThawCount` and `preferredSlot` is outside `urgentRow`, or `thawCount < box.maxThawCount`, `preferredSlot` is in `urgentRow`, and at least one open containment-compatible non-urgent slot exists.
   4. `CONTAINMENT_CONFLICT` — `preferredSlot` has an orthogonally adjacent occupied slot that violates BSL-2 cross-study containment.
10. When `preferredSlot` is omitted (`undefined` or `null`), scanning in row-major order (`A1..A<cols>`, `B1..`):
    1. `BOX_FULL` — no open slots exist anywhere in `box`.
    2. `NO_COMPATIBLE_SLOT` — at least one open slot exists in `box`, but no open slot satisfies both urgent-row and containment rules (after considering urgent-row overflow for below-limit vials).

### 4. State Updates & Side Effects

- **On any error (`ok: false`)**:
  - Do not mutate `box.slots`.
  - Do not call `ports.labelQueue.enqueue` or `ports.auditLog.record`.
- **On success (`ok: true`)**:
  - Store `{ barcode, studyId: studyId.trim(), hazardClass, volumeUl, thawCount, checkedInAtMs: nowMs }` at `box.slots[slot]`.
  - Build `flags` in exact order:
    1. `"BSL2"` if `hazardClass === "bsl2"`
    2. `"AT_THAW_LIMIT"` if `thawCount === box.maxThawCount`
    3. `"OVERFLOW_URGENT_ROW"` if `overflowUsed === true`
  - Call `ports.labelQueue.enqueue({ barcode, slot, flags })` first, then `ports.auditLog.record({ action: "CHECKIN", barcode, slot, studyId: studyId.trim(), hazardClass, overflowUsed, timestampMs: nowMs })`.
  - Return `{ ok: true, slot, flags, overflowUsed }`.
