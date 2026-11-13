import test from "node:test";
import assert from "node:assert/strict";
import { ContactStore } from "../src/contacts/store.js";
import { importContacts } from "../src/contacts/import.js";
import { CsvError } from "../src/lib/csv.js";

test("counts each address once and keeps the last valid row", () => {
  const store = new ContactStore();
  store.insert({ name: "Old", email: "ann@site.test" });
  const result = importContacts([
    " EMAIL , Name ",
    " Ann@SITE.test ,First",
    "ann@site.test,Last",
    " Bob@site.test ,Bob",
    "bob@SITE.test,Robert",
    "bob@site.test, ",
    "x@example.invalid,Example",
  ].join("\n"), store);
  assert.equal(result.created, 2);
  assert.equal(result.updated, 1);
  assert.deepEqual(result.rejected, [{ line: 6, reason: "name is empty" }]);
  assert.deepEqual(result.rows.map(({ line }) => line), [2, 3, 4, 5, 7]);
  assert.deepEqual(store.all().map(({ name, email }) => ({ name, email })), [
    { name: "Last", email: "ann@site.test" },
    { name: "Robert", email: "bob@site.test" },
    { name: "Example", email: "x@example.invalid" },
  ]);
  assert.equal(importContacts("name,email\nChanged,x@example.invalid", store).updated, 1);
  assert.equal(store.findByEmail("x@example.invalid").name, "Changed");
});

test("reports physical record starts and validates missing fields and addresses", () => {
  const store = new ContactStore();
  const result = importContacts('name,email\r\n\r\n   \r\n""\r\nOnly name\r\nAnn,ann@site\r\n"Multi\r\nline",multi@site.test\r\n,nobody@site.test\r\n', store);
  assert.deepEqual(result.rejected, [
    { line: 3, reason: "name is empty" },
    { line: 4, reason: "name is empty" },
    { line: 5, reason: "email is not an address" },
    { line: 6, reason: "email is not an address" },
    { line: 9, reason: "name is empty" },
  ]);
  assert.equal(result.created, 1);
  assert.equal(store.findByEmail("multi@site.test").name, "Multi\r\nline");
});

test("does not write anything when any part of the CSV is malformed", () => {
  for (const malformed of ['"unclosed', 'bad"quote', '"closed"extra']) {
    const store = new ContactStore();
    store.insert({ name: "Old", email: "ann@site.test" });
    assert.throws(() => importContacts(`name,email\nNew,ann@site.test\nBob,bob@site.test\n${malformed}`, store), CsvError);
    assert.deepEqual(store.all().map(({ name, email }) => ({ name, email })), [{ name: "Old", email: "ann@site.test" }]);
  }
});

test("does not suppress storage errors", () => {
  const store = { findByEmail: () => null, insert: () => { throw new Error("storage failed"); } };
  assert.throws(() => importContacts("name,email\nAnn,ann@site.test", store), /storage failed/);
});
