const SLOT_CODE_PATTERN = /^([A-Z])([1-9][0-9]*)$/;
const ORTHOGONAL_DELTAS = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
];

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

export function hasContainmentConflict(box, rowIndex, col, studyId, hazardClass) {
  for (const [dRow, dCol] of ORTHOGONAL_DELTAS) {
    const nextRow = rowIndex + dRow;
    const nextCol = col + dCol;
    if (nextRow < 0 || nextRow >= box.rows || nextCol < 1 || nextCol > box.cols) {
      continue;
    }
    const neighborCode = formatSlotCode(nextRow, nextCol);
    if (!Object.hasOwn(box.slots, neighborCode)) {
      continue;
    }
    const neighbor = box.slots[neighborCode];
    const neighborHazard = neighbor.hazardClass ?? "standard";
    if (
      neighbor.studyId.trim() !== studyId &&
      (hazardClass === "bsl2" || neighborHazard === "bsl2")
    ) {
      return true;
    }
  }
  return false;
}

export function scanBoxSlots(box, state) {
  const urgentRowIndex =
    box.urgentRow !== undefined
      ? box.urgentRow.charCodeAt(0) - 65
      : box.rows - 1;

  if (state.hazardClass === "bsl2") {
    state.flags.push("BSL2");
  }
  if (state.atThawLimit) {
    state.flags.push("AT_THAW_LIMIT");
  }

  for (let rowIndex = 0; rowIndex < box.rows; rowIndex += 1) {
    for (let col = 1; col <= box.cols; col += 1) {
      const code = formatSlotCode(rowIndex, col);
      if (Object.hasOwn(box.slots, code)) {
        continue;
      }
      state.hasOpenSlot = true;
      if (hasContainmentConflict(box, rowIndex, col, state.studyId, state.hazardClass)) {
        continue;
      }
      if (rowIndex === urgentRowIndex) {
        state.urgentCompatible.push(code);
      } else {
        state.regularCompatible.push(code);
      }
    }
  }

  if (
    !state.atThawLimit &&
    state.regularCompatible.length === 0 &&
    state.urgentCompatible.length > 0
  ) {
    state.overflowUsed = true;
    state.flags.push("OVERFLOW_URGENT_ROW");
  }
}
