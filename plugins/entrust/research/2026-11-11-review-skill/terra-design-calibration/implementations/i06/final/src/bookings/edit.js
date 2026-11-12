import { quoteRoom } from "./quote.js";

export function previewEdit(booking, draft, context) {
  if (!context.mayEdit) return { kind: "blocked", reason: "forbidden" };
  if (booking.state === "cancelled") return { kind: "blocked", reason: "closed" };
  if (
    booking.roomId === draft.roomId &&
    booking.start === draft.start &&
    booking.end === draft.end &&
    booking.people === draft.people
  ) {
    return { kind: "unchanged" };
  }
  if (draft.end <= draft.start) return { kind: "blocked", reason: "invalid-window" };

  const room = context.rooms.find((item) => item.id === draft.roomId);
  if (!room) return { kind: "blocked", reason: "room-unavailable" };
  if (draft.people > room.capacity) return { kind: "blocked", reason: "capacity" };

  const totalCents = quoteRoom(room, draft.start, draft.end);
  return {
    kind: "ready",
    totalCents,
    requiresPriceConfirmation: totalCents > booking.paidCents,
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
