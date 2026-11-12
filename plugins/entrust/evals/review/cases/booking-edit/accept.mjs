import assert from "node:assert/strict";

const rooms = [
  { id: "cedar", capacity: 4, hourCents: 1200, setupCents: 300 },
  { id: "birch", capacity: 8, hourCents: 900, setupCents: 0 },
  { id: "elm", capacity: 2, hourCents: 1500, setupCents: 500 },
  { id: "willow", capacity: 4, hourCents: 0, setupCents: 0 },
];
const booking = {
  id: "demo-booking", revision: 7, state: "confirmed", paidCents: 2700,
  roomId: "cedar", start: 20, end: 24, people: 3,
};

const input = (patch = {}) => {
  const saved = { ...booking, ...patch.booking };
  return structuredClone({
    booking: saved,
    draft: {
      roomId: saved.roomId, start: saved.start, end: saved.end, people: saved.people,
      ...patch.draft,
    },
    context: { mayEdit: true, rooms, ...patch.context },
  });
};
const blocked = (reason) => ({ kind: "blocked", reason });
const unchanged = { kind: "unchanged" };
const ready = (totalCents, requiresPriceConfirmation, roomId, start, end, people,
  bookingId = "demo-booking", expectedRevision = 7) => ({
  kind: "ready", totalCents, requiresPriceConfirmation,
  command: { bookingId, expectedRevision, roomId, start, end, people },
});

// Expected prices and decisions are fixture data, not calls into either candidate.
const scenarios = [
  ["P1 headcount at capacity", { draft: { people: 4 } }, ready(2700, false, "cedar", 20, 24, 4)],
  ["P2 cheaper room", { draft: { roomId: "birch" } }, ready(1800, false, "birch", 20, 24, 3)],
  ["P3 five slots start a third hour", { draft: { end: 25 } }, ready(3900, true, "cedar", 20, 25, 3)],
  ["P4 three slots still cost two hours", { draft: { end: 23 } }, ready(2700, false, "cedar", 20, 23, 3)],
  ["P5 zero price", { draft: { roomId: "willow" } }, ready(0, false, "willow", 20, 24, 3)],
  ["P6 first half-hour of the day", { draft: { start: 0, end: 1 } }, ready(1500, false, "cedar", 0, 1, 3)],
  ["N1 unchanged", {}, unchanged],
  ["N2 access denied", { draft: { people: 4 }, context: { mayEdit: false } }, blocked("forbidden")],
  ["N3 cancelled", { booking: { state: "cancelled" }, draft: { people: 4 } }, blocked("closed")],
  ["N4 equal endpoints", { draft: { start: 24, end: 24 } }, blocked("invalid-window")],
  ["N5 reversed endpoints", { draft: { start: 25, end: 24 } }, blocked("invalid-window")],
  ["N6 missing selected room", { draft: { roomId: "orchid" } }, blocked("room-unavailable")],
  ["N7 capacity exceeded", { draft: { roomId: "elm" } }, blocked("capacity")],
  ["Q1 access beats cancellation, invalid interval and missing room", {
    booking: { state: "cancelled" }, draft: { roomId: "orchid", start: 24, end: 24 },
    context: { mayEdit: false },
  }, blocked("forbidden")],
  ["Q2 cancellation beats unchanged", { booking: { state: "cancelled" } }, blocked("closed")],
  ["Q3 unchanged beats a removed room", { context: { rooms: rooms.slice(1) } }, unchanged],
  ["Q4 unchanged beats reduced capacity", {
    context: { rooms: rooms.map((room) => room.id === "cedar" ? { ...room, capacity: 2 } : room) },
  }, unchanged],
  ["Q5 interval beats missing room", { draft: { roomId: "orchid", start: 24, end: 24 } }, blocked("invalid-window")],
  ["Q6 interval beats capacity", { draft: { roomId: "elm", start: 24, end: 24 } }, blocked("invalid-window")],
  ["Q7 access beats unchanged and removed room", { context: { mayEdit: false, rooms: [] } }, blocked("forbidden")],
  ["Q8 cancellation beats invalid interval and missing room", {
    booking: { state: "cancelled" }, draft: { roomId: "orchid", start: 24, end: 24 },
  }, blocked("closed")],
  ["Q9 access beats capacity", { draft: { roomId: "elm" }, context: { mayEdit: false } }, blocked("forbidden")],
  ["Q10 cancellation beats capacity", {
    booking: { state: "cancelled" }, draft: { roomId: "elm" },
  }, blocked("closed")],
  ["A1 maximum amounts, duration and original revision", {
    booking: { revision: Number.MAX_SAFE_INTEGER, paidCents: 100000 },
    draft: { roomId: "hall", start: 0, end: 48, people: 30 },
    context: { rooms: [{ id: "hall", capacity: 30, hourCents: 100000, setupCents: 100000 }] },
  }, ready(2500000, true, "hall", 0, 48, 30, "demo-booking", Number.MAX_SAFE_INTEGER)],
  ["A2 final half-hour of the day", { draft: { start: 47, end: 48 } }, ready(1500, false, "cedar", 47, 48, 3)],
  ["A3 zero price equal to zero paid", {
    booking: { paidCents: 0 }, draft: { roomId: "willow" },
  }, ready(0, false, "willow", 20, 24, 3)],
  ["A4 setup-only charge equal to amount paid", {
    booking: { paidCents: 500 }, draft: { roomId: "ash" },
    context: { rooms: [{ id: "ash", capacity: 4, hourCents: 0, setupCents: 500 }] },
  }, ready(500, false, "ash", 20, 24, 3)],
  ["A5 every command field comes from its specified source", {
    booking: { id: "another-booking", revision: 42 },
    draft: { roomId: "birch", start: 10, end: 13, people: 8 },
  }, ready(1800, false, "birch", 10, 13, 8, "another-booking", 42)],
  ["A6 minimum people and revision", {
    booking: { revision: 1 }, draft: { people: 1 },
  }, ready(2700, false, "cedar", 20, 24, 1, "demo-booking", 1)],
  ["A7 changed booking with an empty current catalog", {
    draft: { people: 4 }, context: { rooms: [] },
  }, blocked("room-unavailable")],
  ["A8 changed booking after capacity reduction", {
    draft: { end: 25 },
    context: { rooms: rooms.map((room) => room.id === "cedar" ? { ...room, capacity: 2 } : room) },
  }, blocked("capacity")],
  ["A9 minimum capacity", {
    draft: { roomId: "nook", people: 1 },
    context: { rooms: [{ id: "nook", capacity: 1, hourCents: 100, setupCents: 0 }] },
  }, ready(200, false, "nook", 20, 24, 1)],
  ["A10 updated current rate", {
    draft: { people: 4 },
    context: { rooms: rooms.map((room) => room.id === "cedar" ? { ...room, hourCents: 2000 } : room) },
  }, ready(4300, true, "cedar", 20, 24, 4)],
];

const integer = (value, minimum, maximum) => {
  assert.ok(Number.isInteger(value) && value >= minimum && value <= maximum);
};
const id = (value) => assert.ok(typeof value === "string" && value.length > 0);
const draftShape = (value) => {
  id(value.roomId);
  integer(value.start, 0, 48);
  integer(value.end, 0, 48);
  integer(value.people, 1, 30);
};

// Reject a mistaken oracle scenario outside the declared input domain before running it.
function assertSupported({ booking: saved, draft, context }) {
  draftShape(saved);
  id(saved.id);
  integer(saved.revision, 1, Number.MAX_SAFE_INTEGER);
  integer(saved.paidCents, 0, 100000);
  assert.ok(["confirmed", "cancelled"].includes(saved.state));
  assert.ok(saved.end > saved.start);
  draftShape(draft);
  assert.equal(typeof context.mayEdit, "boolean");
  assert.ok(Array.isArray(context.rooms));
  for (const room of context.rooms) {
    id(room.id);
    integer(room.capacity, 1, 30);
    integer(room.hourCents, 0, 100000);
    integer(room.setupCents, 0, 100000);
  }
  assert.equal(new Set(context.rooms.map((room) => room.id)).size, context.rooms.length);
}

const deepFreeze = (value) => {
  if (value && typeof value === "object") {
    for (const child of Object.values(value)) deepFreeze(child);
    Object.freeze(value);
  }
  return value;
};

export default scenarios.map(([name, patch, expected]) => ({
  name,
  run: async (tree) => {
    const { previewEdit } = await tree("src/bookings/edit.js");
    assert.equal(typeof previewEdit, "function");
    for (const freeze of [false, true]) {
      const args = input(patch);
      assertSupported(args);
      const before = structuredClone(args);
      if (freeze) deepFreeze(args);
      const actual = previewEdit(args.booking, args.draft, args.context);
      assert.deepEqual(actual, expected, `${name}: ${freeze ? "frozen" : "mutable"} exact output`);
      assert.deepEqual(args, before, `${name}: inputs must not change`);
    }
  },
}));
