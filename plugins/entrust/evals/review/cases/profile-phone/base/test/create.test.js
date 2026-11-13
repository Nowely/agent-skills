import test from "node:test";
import assert from "node:assert/strict";
import { ProfileStore } from "../src/profiles/store.js";
import { createProfile } from "../src/profiles/create.js";

test("a profile is created with its name trimmed", () => {
  const store = new ProfileStore();
  assert.equal(createProfile({ name: " Ann " }, store).profile.name, "Ann");
});

test("a profile without a name is refused", () => {
  assert.deepEqual(createProfile({ name: " " }, new ProfileStore()), { ok: false, reason: "name is empty" });
});
