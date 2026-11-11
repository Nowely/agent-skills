import test from "node:test";
import assert from "node:assert/strict";
import { ContactStore } from "../src/contacts/store.js";
import { importContacts } from "../src/contacts/import.js";

test("imports a file", () => {
  const store = new ContactStore();
  store.insert({ name: "Old", email: "ann@site.test" });
  const result = importContacts("name,email\nAnn,ann@site.test\nBob,bob@site.test\n,nobody@site.test\n", store);
  assert.equal(result.created, 1);
  assert.equal(result.updated, 1);
  assert.equal(result.rejected.length, 1);
  assert.equal(result.rows.length, 2);
});

test("strict mode stops at the first bad row", () => {
  assert.throws(() => importContacts("name,email\n,nobody@site.test\n", new ContactStore(), { mode: "strict" }));
});

test("legacy files use semicolons", () => {
  assert.equal(importContacts("name;email\nAnn;ann@site.test\n", new ContactStore(), { mode: "legacy" }).created, 1);
});

test("old test addresses are skipped", () => {
  assert.equal(importContacts("name,email\nAnn,ann@example.invalid\n", new ContactStore()).created, 0);
});
