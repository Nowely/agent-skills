const SLOT_CODE_PATTERN = /^([A-Z])([1-9][0-9]*)$/;

export function formatSlotCode(rowIndex, col) {
  return `${String.fromCharCode(65 + rowIndex)}${col}`;
}

export function parseSlotCode(box, slotCode) {
  if (typeof slotCode !== "string") {
    return null;
  }
  const match = SLOT_CODE_PATTERN.exec(slotCode);
  if (!match) {
    return null;
  }
  const rowIndex = match[1].charCodeAt(0) - 65;
  const col = Number(match[2]);
  if (rowIndex < 0 || rowIndex >= box.rows || col < 1 || col > box.cols) {
    return null;
  }
  return { rowIndex, col, code: slotCode };
}

export function findOpenSlot(box, preferredSlot) {
  if (preferredSlot !== undefined && preferredSlot !== null) {
    const parsed = parseSlotCode(box, preferredSlot);
    if (!parsed) {
      return { ok: false, code: "INVALID_SLOT" };
    }
    if (Object.hasOwn(box.slots, parsed.code)) {
      return { ok: false, code: "SLOT_OCCUPIED" };
    }
    return { ok: true, slot: parsed.code };
  }

  for (let rowIndex = 0; rowIndex < box.rows; rowIndex += 1) {
    for (let col = 1; col <= box.cols; col += 1) {
      const code = formatSlotCode(rowIndex, col);
      if (!Object.hasOwn(box.slots, code)) {
        return { ok: true, slot: code };
      }
    }
  }

  return { ok: false, code: "BOX_FULL" };
}
