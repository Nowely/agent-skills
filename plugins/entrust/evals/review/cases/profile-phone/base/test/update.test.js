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
