export function previewEdit(booking, draft, context) {
  const room = context.rooms.find((item) => item.id === draft.roomId);
  const rangeOk = draft.end > draft.start;
  const same =
    booking.roomId === draft.roomId &&
    booking.start === draft.start &&
    booking.end === draft.end &&
    booking.people === draft.people;

  let blocked = false;
  let unchanged = false;
  let reason = null;
  let totalCents = 0;
  let requiresPriceConfirmation = false;
  const quoteCache = new Map();

  if (room && rangeOk) {
    const key = `${room.id}:${draft.start}:${draft.end}`;
    if (!quoteCache.has(key)) {
      quoteCache.set(
        key,
        room.setupCents + Math.ceil((draft.end - draft.start) / 2) * room.hourCents,
      );
    }
    totalCents = quoteCache.get(key);
    requiresPriceConfirmation = totalCents > booking.paidCents;
  }

  if (room && draft.people > room.capacity) {
    blocked = true;
    reason = "capacity";
  }
  if (!room) {
    blocked = true;
    reason = "room-unavailable";
  }
  if (!rangeOk) {
    blocked = true;
    reason = "invalid-window";
  }
  if (same) {
    blocked = false;
    reason = null;
    unchanged = true;
  }
  if (booking.state === "cancelled") {
    blocked = true;
    reason = "closed";
    unchanged = false;
  }
  if (!context.mayEdit) {
    blocked = true;
    reason = "forbidden";
    unchanged = false;
  }

  if (blocked) return { kind: "blocked", reason };
  if (unchanged) return { kind: "unchanged" };
  return {
    kind: "ready",
    totalCents,
    requiresPriceConfirmation,
    command: {
      bookingId: booking.id,
      expectedRevision: booking.revision,
      roomId: draft.roomId,
      start: draft.start,
      end: draft.end,
      people: draft.people,
    },
  };
}
