import test from "node:test";
import assert from "node:assert/strict";
import { ProfileStore } from "../src/profiles/store.js";
import { checkPhone } from "../src/profiles/phone.js";

test("a phone is taken as typed and given back in E.164 form", () => {
  assert.deepEqual(checkPhone("+1 (415) 555-0100", new ProfileStore()), { e164: "+14155550100" });
});

test("a missing phone, a text that is no number and a country outside the list are each refused", () => {
  const store = new ProfileStore();
  assert.deepEqual(checkPhone(" ", store), { reason: "phone is required" });
  assert.deepEqual(checkPhone("call me", store), { reason: "phone is not a number" });
  assert.deepEqual(checkPhone("+7 495 123-45-67", store), { reason: "country is not allowed" });
});

test("a number another profile has is refused however it is typed, and a profile may keep its own", () => {
  const store = new ProfileStore();
  const { id } = store.insert({ name: "Ann", phone: "+14155550100" });
  assert.deepEqual(checkPhone("+1 415 555 0100", store), { reason: "phone is taken" });
  assert.deepEqual(checkPhone("+1 415 555 0100", store, id), { e164: "+14155550100" });
});
