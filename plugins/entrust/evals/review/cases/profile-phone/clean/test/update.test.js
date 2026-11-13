import test from "node:test";
import assert from "node:assert/strict";
import { ProfileStore } from "../src/profiles/store.js";
import { updateProfile } from "../src/profiles/update.js";

test("an edit changes the name and refuses an empty one", () => {
  const store = new ProfileStore();
  const { id } = store.insert({ name: "Ann" });
  assert.equal(updateProfile(id, { name: "Anna" }, store).profile.name, "Anna");
  assert.deepEqual(updateProfile(id, { name: "" }, store), { ok: false, reason: "name is empty" });
});

test("an edit checks a new phone, stores it in E.164 form and leaves an untouched one alone", () => {
  const store = new ProfileStore();
  const { id } = store.insert({ name: "Ann", phone: "+14155550100" });
  assert.deepEqual(updateProfile(id, { phone: "nonsense" }, store), { ok: false, reason: "phone is not a number" });
  assert.equal(updateProfile(id, { name: "Anna" }, store).profile.phone, "+14155550100");
  assert.equal(updateProfile(id, { phone: "+44 20 7946 0958" }, store).profile.phone, "+442079460958");
});
