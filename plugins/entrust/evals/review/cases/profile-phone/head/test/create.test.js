import test from "node:test";
import assert from "node:assert/strict";
import { ProfileStore } from "../src/profiles/store.js";
import { createProfile } from "../src/profiles/create.js";

test("a profile is created with its name trimmed", () => {
  const store = new ProfileStore();
  assert.equal(createProfile({ name: " Ann ", phone: "+14155550100" }, store).profile.name, "Ann");
});

test("a profile without a name is refused", () => {
  assert.deepEqual(createProfile({ name: " " }, new ProfileStore()), { ok: false, reason: "name is empty" });
});

test("a profile is created with its phone", () => {
  const result = createProfile({ name: "Ann", phone: "+14155550100" }, new ProfileStore());
  assert.equal(result.ok, true);
  assert.equal(result.profile.phoneValid, true);
  assert.equal(result.profile.phoneE164, "+14155550100");
});

test("a country outside the list is refused unless strict is off", () => {
  const store = new ProfileStore();
  assert.equal(createProfile({ name: "Ann", phone: "+74951234567" }, store).reason, "country is not allowed");
  assert.equal(createProfile({ name: "Ann", phone: "+74951234567" }, store, { strict: false }).ok, true);
});

test("the same phone twice is refused", () => {
  const store = new ProfileStore();
  createProfile({ name: "Ann", phone: "+14155550100" }, store);
  assert.equal(createProfile({ name: "Bo", phone: "+14155550100" }, store).reason, "phone is taken");
});
