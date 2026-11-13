import test from "node:test";
import assert from "node:assert/strict";
import { createPickupForm } from "../src/pickup/form.js";

test("a pickup time that runs out of notice while the form is open is refused without input", (t) => {
  t.mock.timers.enable({ apis: ["setInterval", "Date"], now: Date.parse("2026-03-10T06:00:00Z") });
  const { form, close } = createPickupForm({ pickup: null });
  form.set("time", "2026-03-10T06:45:00Z");
  assert.equal(form.errors.time, null);
  t.mock.timers.tick(20 * 60_000);
  assert.equal(form.errors.time, "A pickup needs thirty minutes' notice.");
  assert.equal(form.submit(() => "sent").ok, false);
  close();
});

test("a closed form checks nothing more", (t) => {
  t.mock.timers.enable({ apis: ["setInterval", "Date"], now: Date.parse("2026-03-10T06:00:00Z") });
  const { form, close } = createPickupForm({ pickup: "2026-03-10T06:45:00Z" });
  close();
  t.mock.timers.tick(20 * 60_000);
  assert.equal(form.errors.time, null);
});
