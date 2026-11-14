import { findOpenSlot } from "./box-grid.js";

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

  if (request.thawCount > box.maxThawCount) {
    return { ok: false, code: "THAW_LIMIT_EXCEEDED" };
  }

  for (const existing of Object.values(box.slots)) {
    if (existing.barcode === request.barcode) {
      return { ok: false, code: "DUPLICATE_BARCODE" };
    }
  }

  const selection = findOpenSlot(box, request.preferredSlot);
  if (!selection.ok) {
    return selection;
  }

  const studyId = request.studyId.trim();
  const slot = selection.slot;
  const flags = request.thawCount === box.maxThawCount ? ["AT_THAW_LIMIT"] : [];

  box.slots[slot] = {
    barcode: request.barcode,
    studyId,
    volumeUl: request.volumeUl,
    thawCount: request.thawCount,
    checkedInAtMs: request.nowMs,
  };

  ports.labelQueue.enqueue({
    barcode: request.barcode,
    slot,
    flags,
  });
  ports.auditLog.record({
    action: "CHECKIN",
    barcode: request.barcode,
    slot,
    studyId,
    timestampMs: request.nowMs,
  });

  return { ok: true, slot, flags };
}
