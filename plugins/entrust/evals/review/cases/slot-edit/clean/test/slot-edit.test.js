import test from "node:test";
import assert from "node:assert/strict";
import { slotError } from "../src/slots/edit.js";
import { openSlotEditor } from "../src/slots/screen.js";

const NOW = Date.parse("2026-03-10T06:00:00Z");
const order = (over = {}, zone = {}) => ({ id: "o1", weightKg: 5, slotChanges: 0, slot: null, pickup: null,
  address: { line: "1 Quay St", zone: { id: "z1", opens: "08:00", closes: "20:00", express: false, ...zone } }, ...over });
const at = (clock) => `2026-03-10T${clock}:00Z`;
const clock = (t) => t.mock.timers.enable({ apis: ["setInterval", "Date"], now: NOW });

test("each rule refuses with its message, at its boundary", (t) => {
  clock(t);
  assert.equal(slotError(order({ slotChanges: 3 }), at("10:00")), "This order's slot can no longer be changed.");
  assert.equal(slotError(order({ slotChanges: 2 }), at("10:00")), null);
  assert.equal(slotError(order(), null), "Choose a slot.");
  assert.equal(slotError(order({}, { opens: "00:00" }), at("07:59")), "This slot is too soon.");
  assert.equal(slotError(order({}, { opens: "00:00" }), at("08:00")), null);
  assert.equal(slotError(order({}, { opens: "00:00", express: true }), at("06:59")), "This slot is too soon.");
  assert.equal(slotError(order({}, { opens: "00:00", express: true }), at("07:00")), null);
  assert.equal(slotError(order(), at("19:01")), "This slot is outside delivery hours.");
  assert.equal(slotError(order(), at("19:00")), null);
  assert.equal(slotError(order({ weightKg: 31 }), at("12:00")), "Orders over 30 kg are delivered before noon.");
  assert.equal(slotError(order({ weightKg: 31 }), at("11:00")), null);
  assert.equal(slotError(order({ weightKg: 30 }), at("12:00")), null);
});

test("where two rules refuse, the one that comes first in the task's list is shown", (t) => {
  clock(t);
  assert.equal(slotError(order({ slotChanges: 3 }), null), "This order's slot can no longer be changed.");
  assert.equal(slotError(order(), at("07:00")), "This slot is too soon.");
  assert.equal(slotError(order({ weightKg: 31 }), at("19:30")), "This slot is outside delivery hours.");
});

const client = (theOrder, stored = []) => ({ stored, getOrder: async () => theOrder, setSlot: async (id, slot) => { stored.push([id, slot]); } });

test("a chosen slot is stored", async (t) => {
  clock(t);
  const desk = client(order()), { form, submit, close } = await openSlotEditor(desk, "o1");
  form.set("slot", at("10:00"));
  assert.equal(submit().ok, true);
  assert.deepEqual(desk.stored, [["o1", at("10:00")]]);
  close();
});

test("a slot that becomes too soon while the form is open is refused without input", async (t) => {
  clock(t);
  const desk = client(order()), { form, submit, close } = await openSlotEditor(desk, "o1");
  form.set("slot", at("08:30"));
  assert.equal(form.errors.slot, null);
  t.mock.timers.tick(31 * 60_000);
  assert.equal(form.errors.slot, "This slot is too soon.");
  assert.equal(submit().ok, false);
  assert.deepEqual(desk.stored, []);
  close();
});

test("a closed editor checks nothing more", async (t) => {
  clock(t);
  const { form, close } = await openSlotEditor(client(order({ slot: at("08:30") })), "o1");
  close();
  t.mock.timers.tick(31 * 60_000);
  assert.equal(form.errors.slot, null);
});
