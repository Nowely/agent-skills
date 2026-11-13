import test from "node:test";
import assert from "node:assert/strict";
import { ContactStore } from "../src/contacts/store.js";
import { importContacts, previewImport } from "../src/contacts/import.js";
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

test("preview matches import without changing the store, even across repeated calls", () => {
  const makeStore = () => {
    const store = new ContactStore();
    store.insert({ name: "Old", email: "ann@site.test" });
    store.insert({ name: "Same", email: "same@site.test" });
    return store;
  };
  const store = makeStore();
  const originalContacts = store.all();
  const snapshot = structuredClone(originalContacts);
  const readOnlyStore = {
    findByEmail: (email) => store.findByEmail(email),
    insert: () => assert.fail("preview called insert"),
    rename: () => assert.fail("preview called rename"),
  };
  const csv = 'name,email\r\n\r\nFirst, ANN@site.test \r\nLast,ann@SITE.test\r\nSame,same@site.test\r\nBob,bob@site.test\r\n,bob@site.test\r\n"Multi\r\nline",multi@site.test\r\nOnly name\r\n';
  const expected = importContacts(csv, makeStore());

  assert.deepEqual(previewImport(csv, readOnlyStore), expected);
  assert.deepEqual(previewImport(csv, readOnlyStore), expected);
  assert.deepEqual(store.all(), snapshot);
  assert.deepEqual(originalContacts, snapshot);
  assert.deepEqual(expected.rejected, [
    { line: 7, reason: "name is empty" },
    { line: 10, reason: "email is not an address" },
  ]);
  assert.equal(expected.created, 2);
  assert.equal(expected.updated, 2);
});

test("preview propagates parse errors without reading or writing the store", () => {
  const store = {
    findByEmail: () => assert.fail("preview read store before parsing completed"),
    insert: () => assert.fail("preview called insert"),
    rename: () => assert.fail("preview called rename"),
  };
  assert.throws(() => previewImport('name,email\nAnn,ann@site.test\n"unclosed', store), CsvError);
});

test("an unchanged existing name is counted as updated without a rename", () => {
  const store = {
    findByEmail: () => ({ id: 1, name: "Ann" }),
    rename: () => assert.fail("unchanged name was renamed"),
  };
  const csv = "name,email\nAnn,ann@site.test";
  assert.equal(previewImport(csv, store).updated, 1);
  assert.equal(importContacts(csv, store).updated, 1);
});
