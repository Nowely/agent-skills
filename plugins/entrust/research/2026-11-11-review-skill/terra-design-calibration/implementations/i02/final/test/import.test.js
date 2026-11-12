import test from "node:test";
import assert from "node:assert/strict";
import { ContactStore } from "../src/contacts/store.js";
import { importContacts } from "../src/contacts/import.js";
import { CsvError } from "../src/lib/csv.js";

test("imports the last valid row for each normalized email once", () => {
  const store = new ContactStore();
  store.insert({ name: "Old", email: "ann@site.test" });
  const result = importContacts(
    "name,email\nFirst, ANN@site.test \nBob,bob@site.test\nAnn,ann@SITE.test\n,ann@site.test\nRobert, BOB@site.test \n",
    store,
  );
  assert.equal(result.created, 1);
  assert.equal(result.updated, 1);
  assert.deepEqual(result.rejected, [{ line: 5, reason: "name is empty" }]);
  assert.equal(result.rows.length, 2);
  assert.equal(store.findByEmail("ann@site.test").name, "Ann");
  assert.equal(store.findByEmail("bob@site.test").name, "Robert");
});

test("rejects invalid rows and continues in strict mode", () => {
  const store = new ContactStore();
  const result = importContacts("name,email\n,nobody@site.test\nBad,ann@site\nBad,a@b@c\nAnn,ann@example.invalid\n", store, { mode: "strict" });
  assert.deepEqual(result.rejected, [
    { line: 2, reason: "name is empty" },
    { line: 3, reason: "email is not an address" },
    { line: 4, reason: "email is not an address" },
  ]);
  assert.equal(result.created, 1);
  assert.equal(store.findByEmail("ann@example.invalid").name, "Ann");
});

test("reports physical start lines, including blank fields and multiline records", () => {
  const store = new ContactStore();
  const result = importContacts('Name,Email\n\n   \n""\n"Ann\nSmith",ann@site.test\nBob\n,email@site.test\n', store);
  assert.deepEqual(result.rejected, [
    { line: 3, reason: "name is empty" },
    { line: 4, reason: "name is empty" },
    { line: 7, reason: "email is not an address" },
    { line: 8, reason: "name is empty" },
  ]);
  assert.equal(store.findByEmail("ann@site.test").name, "Ann\nSmith");
  assert.equal(result.rows[0].line, 5);
});

test("does not write anything if the CSV is malformed", () => {
  for (const malformed of ['"unclosed', 'bad"quote']) {
    const store = new ContactStore();
    store.insert({ name: "Old", email: "ann@site.test" });
    assert.throws(() => importContacts(`name,email\nAnn,ann@site.test\n${malformed}\n`, store), CsvError);
    assert.deepEqual(store.all(), [{ id: 1, name: "Old", email: "ann@site.test" }]);
  }
});

test("legacy files use semicolons with quoted multiline fields", () => {
  const store = new ContactStore();
  const result = importContacts('name;email\n"Ann;\nSmith";ann@site.test\n', store, { mode: "legacy" });
  assert.equal(result.created, 1);
  assert.equal(store.findByEmail("ann@site.test").name, "Ann;\nSmith");
});

test("propagates store errors", () => {
  const error = new Error("insert failed");
  const store = { findByEmail: () => null, insert: () => { throw error; } };
  assert.throws(() => importContacts("name,email\nAnn,ann@site.test\n", store), (actual) => actual === error);
});
