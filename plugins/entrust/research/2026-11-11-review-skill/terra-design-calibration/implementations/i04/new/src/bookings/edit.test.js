import assert from "node:assert/strict";
import { test } from "node:test";

import { previewEdit } from "./edit.js";

const room = Object.freeze({ id: "room-1", capacity: 4, hourCents: 250, setupCents: 125 });
const booking = Object.freeze({
  id: "booking-1",
  revision: 7,
  state: "confirmed",
  paidCents: 625,
  roomId: room.id,
  start: 2,
  end: 4,
  people: 2,
});
const draft = Object.freeze({ roomId: room.id, start: 2, end: 5, people: 3 });
const context = Object.freeze({ mayEdit: true, rooms: Object.freeze([room]) });

test("applies decisions in order when several conditions match", () => {
  assert.deepEqual(
    previewEdit({ ...booking, state: "cancelled" }, draft, { ...context, mayEdit: false }),
    { kind: "blocked", reason: "forbidden" },
  );
  const unchanged = { roomId: booking.roomId, start: booking.start, end: booking.end, people: booking.people };
  assert.deepEqual(previewEdit({ ...booking, state: "cancelled" }, unchanged, context), {
    kind: "blocked", reason: "closed",
  });
  assert.deepEqual(previewEdit(booking, unchanged, { ...context, rooms: [] }), { kind: "unchanged" });
  assert.deepEqual(previewEdit(booking, unchanged, { ...context, rooms: [{ ...room, capacity: 1 }] }), {
    kind: "unchanged",
  });
  assert.deepEqual(previewEdit(booking, { ...draft, roomId: "missing", end: 2 }, context), {
    kind: "blocked", reason: "invalid-window",
  });
  assert.deepEqual(previewEdit(booking, { ...draft, roomId: "missing" }, context), {
    kind: "blocked", reason: "room-unavailable",
  });
  assert.deepEqual(previewEdit(booking, { ...draft, people: 5 }, context), {
    kind: "blocked", reason: "capacity",
  });
});

test("quotes started hours and returns the exact command without changing inputs", () => {
  assert.deepEqual(previewEdit(booking, draft, context), {
    kind: "ready",
    totalCents: 625,
    requiresPriceConfirmation: false,
    command: {
      bookingId: "booking-1",
      expectedRevision: 7,
      roomId: "room-1",
      start: 2,
      end: 5,
      people: 3,
    },
  });
  assert.equal(previewEdit({ ...booking, paidCents: 624 }, draft, context).requiresPriceConfirmation, true);
  assert.equal(previewEdit({ ...booking, paidCents: 626 }, draft, context).requiresPriceConfirmation, false);
});
