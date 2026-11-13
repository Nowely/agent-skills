import assert from "node:assert/strict";
import { test } from "node:test";

import { previewEdit } from "./edit.js";

const room = Object.freeze({ id: "room-1", capacity: 4, hourCents: 1000, setupCents: 250 });
const booking = Object.freeze({
  id: "booking-1", revision: 7, state: "confirmed", paidCents: 1250,
  roomId: "room-1", start: 2, end: 4, people: 2,
});
const context = Object.freeze({ mayEdit: true, rooms: Object.freeze([room]) });
const draft = Object.freeze({ roomId: "room-1", start: 2, end: 5, people: 3 });

test("applies access and closed decisions before all other conditions", () => {
  const cancelled = { ...booking, state: "cancelled" };
  const invalid = { ...draft, roomId: "missing", end: 2 };
  assert.deepEqual(previewEdit(cancelled, invalid, { mayEdit: false, rooms: [] }),
    { kind: "blocked", reason: "forbidden" });
  assert.deepEqual(previewEdit(cancelled, invalid, context),
    { kind: "blocked", reason: "closed" });
  assert.deepEqual(previewEdit(cancelled, booking, context),
    { kind: "blocked", reason: "closed" });
});

test("unchanged wins even if the saved room is missing or now too small", () => {
  const unchanged = { roomId: booking.roomId, start: booking.start, end: booking.end, people: booking.people };
  assert.deepEqual(previewEdit(booking, unchanged, { mayEdit: true, rooms: [] }), { kind: "unchanged" });
  assert.deepEqual(previewEdit(booking, unchanged, {
    mayEdit: true, rooms: [{ ...room, capacity: 1 }],
  }), { kind: "unchanged" });
});

test("blocks invalid windows before looking up rooms, then checks room and capacity", () => {
  for (const end of [draft.start, draft.start - 1]) {
    assert.deepEqual(previewEdit(booking, { ...draft, end, roomId: "missing" }, context),
      { kind: "blocked", reason: "invalid-window" });
  }
  assert.deepEqual(previewEdit(booking, { ...draft, roomId: "missing" }, context),
    { kind: "blocked", reason: "room-unavailable" });
  assert.deepEqual(previewEdit(booking, { ...draft, people: room.capacity + 1 }, context),
    { kind: "blocked", reason: "capacity" });
});

test("quotes started hours and returns the exact update command at capacity", () => {
  const atCapacity = Object.freeze({ ...draft, people: room.capacity });
  assert.deepEqual(previewEdit(booking, atCapacity, context), {
    kind: "ready",
    totalCents: 2250,
    requiresPriceConfirmation: true,
    command: {
      bookingId: "booking-1", expectedRevision: 7, roomId: "room-1",
      start: 2, end: 5, people: 4,
    },
  });
  assert.equal(previewEdit(booking, { ...draft, end: 3 }, context).totalCents, 1250);
  assert.equal(previewEdit(booking, { ...draft, end: 4 }, context).totalCents, 1250);
});

test("requires confirmation only above the amount paid, including a zero price", () => {
  for (const [paidCents, expected] of [[1249, true], [1250, false], [1251, false]]) {
    const result = previewEdit({ ...booking, paidCents }, { ...draft, end: 3 }, context);
    assert.equal(result.requiresPriceConfirmation, expected);
  }
  const freeRoom = { ...room, hourCents: 0, setupCents: 0 };
  const result = previewEdit({ ...booking, paidCents: 0 }, draft, { mayEdit: true, rooms: [freeRoom] });
  assert.equal(result.totalCents, 0);
  assert.equal(result.requiresPriceConfirmation, false);
});
