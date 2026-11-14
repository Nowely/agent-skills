import { hasContainmentConflict, parseSlotCode, scanBoxSlots } from "./box-grid.js";

const BARCODE_PATTERN = /^VIAL-[A-Z0-9]{4,12}$/;

export function checkinVial(box, request, ports) {
  if (typeof request?.barcode !== "string" || !BARCODE_PATTERN.test(request.barcode)) {
    return { ok: false, code: "INVALID_BARCODE" };
  }
  if (typeof request.studyId !== "string" || request.studyId.trim().length === 0) {
    return { ok: false, code: "INVALID_STUDY" };
  }
  if (
    !Number.isFinite(request.collectedAtMs) ||
    !Number.isFinite(request.nowMs) ||
    request.collectedAtMs > request.nowMs
  ) {
    return { ok: false, code: "INVALID_TIMESTAMP" };
  }
  if (
    !Number.isFinite(request.volumeUl) ||
    request.volumeUl <= 0 ||
    request.volumeUl > box.maxVolumeUl
  ) {
    return { ok: false, code: "VOLUME_OUT_OF_RANGE" };
  }
  if (!Number.isInteger(request.thawCount) || request.thawCount < 0) {
    return { ok: false, code: "INVALID_THAW_COUNT" };
  }
  if (
    request.hazardClass !== undefined &&
    request.hazardClass !== "standard" &&
    request.hazardClass !== "bsl2"
  ) {
    return { ok: false, code: "INVALID_HAZARD_CLASS" };
  }

  if (request.thawCount > box.maxThawCount) {
    return { ok: false, code: "THAW_LIMIT_EXCEEDED" };
  }

  for (const existing of Object.values(box.slots)) {
    if (existing.barcode === request.barcode) {
      return { ok: false, code: "DUPLICATE_BARCODE" };
    }
  }

  const studyId = request.studyId.trim();
  const hazardClass = request.hazardClass ?? "standard";
  const state = {
    studyId,
    hazardClass,
    atThawLimit: request.thawCount === box.maxThawCount,
    hasOpenSlot: false,
    regularCompatible: [],
    urgentCompatible: [],
    overflowUsed: false,
    flags: [],
  };

  let slot;
  if (request.preferredSlot !== undefined && request.preferredSlot !== null) {
    const parsed = parseSlotCode(box, request.preferredSlot);
    if (!parsed) {
      return { ok: false, code: "INVALID_SLOT" };
    }
    if (Object.hasOwn(box.slots, parsed.code)) {
      return { ok: false, code: "SLOT_OCCUPIED" };
    }

    scanBoxSlots(box, state);

    const urgentRowPrefix =
      box.urgentRow !== undefined
        ? box.urgentRow
        : String.fromCharCode(65 + box.rows - 1);
    const targetsUrgentRow = parsed.code.startsWith(urgentRowPrefix);

    if (state.atThawLimit && !targetsUrgentRow) {
      return { ok: false, code: "URGENT_ROW_MISMATCH" };
    }
    if (!state.atThawLimit && targetsUrgentRow && state.regularCompatible.length > 0) {
      return { ok: false, code: "URGENT_ROW_MISMATCH" };
    }
    if (hasContainmentConflict(box, parsed.rowIndex, parsed.col, studyId, hazardClass)) {
      return { ok: false, code: "CONTAINMENT_CONFLICT" };
    }
    if (!targetsUrgentRow && state.overflowUsed) {
      state.overflowUsed = false;
      state.flags = state.flags.filter((flag) => flag !== "OVERFLOW_URGENT_ROW");
    }
    slot = parsed.code;
  } else {
    scanBoxSlots(box, state);
    if (!state.hasOpenSlot) {
      return { ok: false, code: "BOX_FULL" };
    }
    slot = state.atThawLimit
      ? state.urgentCompatible[0]
      : state.regularCompatible[0] ?? state.urgentCompatible[0];
    if (!slot) {
      return { ok: false, code: "NO_COMPATIBLE_SLOT" };
    }
  }

  box.slots[slot] = {
    barcode: request.barcode,
    studyId,
    hazardClass,
    volumeUl: request.volumeUl,
    thawCount: request.thawCount,
    checkedInAtMs: request.nowMs,
  };

  ports.labelQueue.enqueue({
    barcode: request.barcode,
    slot,
    flags: state.flags,
  });
  ports.auditLog.record({
    action: "CHECKIN",
    barcode: request.barcode,
    slot,
    studyId,
    hazardClass,
    overflowUsed: state.overflowUsed,
    timestampMs: request.nowMs,
  });

  return {
    ok: true,
    slot,
    flags: state.flags,
    overflowUsed: state.overflowUsed,
  };
}
