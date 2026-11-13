import test from "node:test";
import assert from "node:assert/strict";
import { openSlotEditor } from "../src/slots/screen.js";

let zoneId = 0;
function fakeClient(order = {}, zone = {}) {
  const calls = { getZone: 0, setSlot: [] };
  const theZone = { id: `z${++zoneId}`, opens: "08:00", closes: "20:00", express: false, ...zone };
  return {
    calls,
    getOrder: async (id) => ({ id, weightKg: 5, slotChanges: 0, slot: null, pickup: null, address: { line: "1 Quay St", zone: { id: theZone.id } }, ...order }),
    getZone: async () => { calls.getZone++; return theZone; },
    setSlot: async (id, slot) => { calls.setSlot.push([id, slot]); },
  };
}
const tomorrow = (clock) => `${new Date(Date.now() + 24 * 3600 * 1000).toISOString().slice(0, 10)}T${clock}:00Z`;
const loaded = () => new Promise((resolve) => setImmediate(resolve));

test("a slot inside the hours is stored", async () => {
  const client = fakeClient();
  const { form, submit } = await openSlotEditor(client, "o1");
  await loaded();
  form.set("slot", tomorrow("10:00"));
  assert.equal(form.errors.slot, null);
  assert.equal(submit().ok, true);
  assert.deepEqual(client.calls.setSlot, [["o1", tomorrow("10:00")]]);
});

test("the form is loading until the zone arrives", async () => {
  const { form } = await openSlotEditor(fakeClient(), "o1");
  assert.equal(form.loading(), true);
  await loaded();
  assert.equal(form.loading(), false);
});

test("each rule has its message", async () => {
  const open = async (order, zone) => { const { form } = await openSlotEditor(fakeClient(order, zone), "o1"); await loaded(); return form; };
  let form = await open();
  assert.equal(form.errors.slot, "Choose a slot.");
  form.set("slot", new Date(Date.now() + 30 * 60000).toISOString());
  assert.equal(form.errors.slot, "This slot is too soon.");
  form.set("slot", tomorrow("21:00"));
  assert.equal(form.errors.slot, "This slot is outside delivery hours.");
  form = await open({ weightKg: 31 });
  form.set("slot", tomorrow("13:00"));
  assert.equal(form.errors.slot, "Orders over 30 kg are delivered before noon.");
  form = await open({ slotChanges: 3 });
  assert.equal(form.errors.slot, "This order's slot can no longer be changed.");
});

test("the zone is loaded once for two editors of the same zone", async () => {
  const client = fakeClient();
  await openSlotEditor(client, "o1");
  await loaded();
  await openSlotEditor(client, "o1");
  await loaded();
  assert.equal(client.calls.getZone, 1);
});

test("a dropped zone request is tried once more", async () => {
  const client = fakeClient();
  const getZone = client.getZone;
  let dropped = false;
  client.getZone = async () => { if (!dropped) { dropped = true; throw new Error("timeout"); } return getZone(); };
  const { form } = await openSlotEditor(client, "o1");
  await loaded();
  assert.equal(form.failed(), false);
  form.set("slot", tomorrow("21:00"));
  assert.equal(form.errors.slot, "This slot is outside delivery hours.");
});
