import test from "node:test";
import assert from "node:assert/strict";
import { ProfileStore } from "../src/profiles/store.js";
import { createProfile } from "../src/profiles/create.js";

test("a profile is created with its name trimmed and its phone in E.164 form", () => {
  const store = new ProfileStore();
  assert.deepEqual(createProfile({ name: " Ann ", phone: "+1 (415) 555-0100" }, store).profile, { id: 1, name: "Ann", phone: "+14155550100" });
});

test("a profile without a name is refused", () => {
  assert.deepEqual(createProfile({ name: " " }, new ProfileStore()), { ok: false, reason: "name is empty" });
});

test("a profile whose phone is refused is not created", () => {
  const store = new ProfileStore();
  assert.deepEqual(createProfile({ name: "Ann" }, store), { ok: false, reason: "phone is required" });
  assert.deepEqual(store.all(), []);
});
