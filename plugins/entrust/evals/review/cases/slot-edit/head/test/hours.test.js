import test from "node:test";
import assert from "node:assert/strict";
import { withinHours } from "../src/slots/hours.js";
import { slotsOf } from "../src/slots/schedule.js";

const zone = { id: "z1", opens: "08:00", closes: "20:00", express: false };

test("a slot lies within the hours when it starts at opening and when it ends at closing", () => {
  assert.equal(withinHours(zone, new Date("2026-03-10T08:00:00Z")), true);
  assert.equal(withinHours(zone, new Date("2026-03-10T19:00:00Z")), true);
  assert.equal(withinHours(zone, new Date("2026-03-10T07:59:00Z")), false);
  assert.equal(withinHours(zone, new Date("2026-03-10T19:01:00Z")), false);
});

test("a day has one slot for every whole hour inside the hours", () => {
  const slots = slotsOf(zone, "2026-03-10");
  assert.equal(slots.length, 12);
  assert.equal(slots[0], "2026-03-10T08:00:00.000Z");
});
