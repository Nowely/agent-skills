import assert from "node:assert/strict";
import { mock } from "node:test";

const NOW = Date.parse("2026-03-10T06:00:00Z");
const at = (clock) => `2026-03-10T${clock}:00Z`;
const settle = () => new Promise((resolve) => setImmediate(resolve));
const MESSAGE = {
  limit: "This order's slot can no longer be changed.", none: "Choose a slot.", soon: "This slot is too soon.",
  hours: "This slot is outside delivery hours.", heavy: "Orders over 30 kg are delivered before noon.",
};
let zones = 0;

// One check: an editor opened at 06:00 on one order, through the installed client, with the zone service
// answering ("up"), failing ("down") or never answering ("silent"). The clock and the timers are the test's own.
const editing = (run, { order = {}, zone = {}, service = "up" } = {}) => async (tree) => {
  mock.timers.enable({ apis: ["setInterval", "Date"], now: NOW });
  try {
    const { createClient } = await tree("node_modules/@acme/orders-client/index.js");
    const { openSlotEditor } = await tree("src/slots/screen.js");
    // A zone of its own for every check: nothing one check loaded can answer for another.
    const theZone = { id: `zone-${++zones}`, opens: "08:00", closes: "20:00", express: false, ...zone }, stored = [];
    const theOrder = { id: "o1", weightKg: 5, slotChanges: 0, slot: null, pickup: null, address: { line: "1 Quay St", zone: theZone }, ...order };
    const client = createClient({
      get: (path) => path.startsWith("/orders/") ? Promise.resolve(structuredClone(theOrder))
        : service === "up" ? Promise.resolve(structuredClone(theZone))
          : service === "down" ? Promise.reject(new Error("the zone service is down")) : new Promise(() => {}),
      put: async (path, body) => { stored.push([path, body]); },
    });
    const editor = await openSlotEditor(client, "o1");
    await settle();
    await run({ ...editor, stored, pass: (minutes) => mock.timers.tick(minutes * 60_000) });
  } finally {
    mock.timers.reset();
  }
};
const shows = (form, slot, message) => { form.set("slot", slot); assert.equal(form.errors.slot, message); };

export default [
  { name: "a slot inside the hours and far enough ahead is taken and stored", run: editing(async ({ form, submit, stored }) => {
    shows(form, at("10:00"), null);
    assert.equal(submit().ok, true);
    assert.deepEqual(stored, [["/orders/o1/slot", { slot: at("10:00") }]]);
  }) },
  { name: "an editor with no slot chosen says so and submits nothing", run: editing(async ({ form, submit, stored }) => {
    assert.equal(form.errors.slot, MESSAGE.none);
    assert.equal(submit().ok, false);
    assert.deepEqual(stored, []);
  }) },
  { name: "a slot less than two hours ahead is too soon", run: editing(async ({ form }) => {
    shows(form, at("07:59"), MESSAGE.soon);
    shows(form, at("08:00"), null);
  }, { zone: { opens: "00:00" } }) },
  { name: "in an express zone a slot less than one hour ahead is too soon", run: editing(async ({ form }) => {
    shows(form, at("06:59"), MESSAGE.soon);
    shows(form, at("07:00"), null);
  }, { zone: { opens: "00:00", express: true } }) },
  { name: "a slot that does not lie wholly within the zone's hours is refused", run: editing(async ({ form }) => {
    shows(form, at("19:01"), MESSAGE.hours);
    shows(form, at("19:00"), null);
  }) },
  { name: "an order over 30 kg is refused a slot from noon on", run: editing(async ({ form }) => {
    shows(form, at("12:00"), MESSAGE.heavy);
    shows(form, at("11:00"), null);
  }, { order: { weightKg: 31 } }) },
  { name: "an order changed three times is refused whatever the slot", run: editing(async ({ form }) => {
    assert.equal(form.errors.slot, MESSAGE.limit);
    shows(form, at("10:00"), MESSAGE.limit);
  }, { order: { slotChanges: 3 } }) },
  { name: "where two rules refuse, the first of the task's list is shown", run: editing(async ({ form }) => {
    shows(form, at("07:00"), MESSAGE.soon);
    shows(form, at("19:30"), MESSAGE.hours);
  }, { order: { weightKg: 31 } }) },
  { name: "a slot that becomes too soon while the editor is open shows it within a minute and cannot be submitted", run: editing(async ({ form, submit, stored, pass }) => {
    shows(form, at("08:30"), null);
    pass(31);
    assert.equal(form.errors.slot, MESSAGE.soon);
    assert.equal(submit().ok, false);
    assert.deepEqual(stored, []);
  }) },
  { name: "a closed editor runs nothing more", run: editing(async ({ form, close, pass }) => {
    shows(form, at("08:30"), null);
    close();
    pass(31);
    assert.equal(form.errors.slot, null);
  }) },
  { name: "the zone's hours apply when the zone service is down", run: editing(async ({ form, submit, stored }) => {
    shows(form, at("21:00"), MESSAGE.hours);
    assert.equal(submit().ok, false);
    assert.deepEqual(stored, []);
  }, { service: "down" }) },
  { name: "the zone's hours apply while the zone service has not answered", run: editing(async ({ form }) => {
    shows(form, at("21:00"), MESSAGE.hours);
  }, { service: "silent" }) },
  { name: "an express zone's one hour applies when the zone service is down", run: editing(async ({ form }) => {
    shows(form, at("07:30"), null);
  }, { zone: { opens: "00:00", express: true }, service: "down" }) },
];
