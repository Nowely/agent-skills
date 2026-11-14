import test from "node:test";
import assert from "node:assert/strict";
import { ContactStore } from "../src/contacts/store.js";
import { importContacts } from "../src/contacts/import.js";
import { CsvError } from "../src/lib/csv.js";

test("counts each email once and keeps its last valid name", () => {
  const store = new ContactStore();
  store.insert({ name: "Old", email: "ann@site.test" });
  const result = importContacts([
    " Name , EMAIL ",
    "Ann,ann@site.test",
    "Anne, ANN@SITE.TEST ",
    "Bob,bob@site.test",
    "Bobby, BOB@SITE.TEST ",
    ",bob@site.test",
    "Test,ann@example.invalid",
  ].join("\n"), store);
  assert.deepEqual(result, {
    created: 2, updated: 1, rejected: [{ line: 6, reason: "name is empty" }],
  });
  assert.deepEqual(store.all().map(({ name, email }) => ({ name, email })), [
    { name: "Anne", email: "ann@site.test" },
    { name: "Bobby", email: "bob@site.test" },
    { name: "Test", email: "ann@example.invalid" },
  ]);
});

test("reports missing fields, whitespace, invalid emails and physical starting lines", () => {
  const store = new ContactStore();
  const result = importContacts('\ufeffname,email\r\n\r\n   \r\n""\r\nOnly name\r\nBad,ann@site\r\n"Two\r\nlines",valid@site.test\r\n"",other@site.test\r\nGood,good@site.test\r\n', store);
  assert.deepEqual(result, {
    created: 2, updated: 0, rejected: [
      { line: 3, reason: "name is empty" },
      { line: 4, reason: "name is empty" },
      { line: 5, reason: "email is not an address" },
      { line: 6, reason: "email is not an address" },
      { line: 9, reason: "name is empty" },
    ],
  });
  assert.deepEqual(store.all().map(({ name }) => name), ["Two\r\nlines", "Good"]);
});

test("does not write when parsing fails after a valid row", () => {
  for (const invalid of ['"unclosed,bad@site.test', 'Bad"quote,bad@site.test']) {
    const store = new ContactStore();
    store.insert({ name: "Old", email: "ann@site.test" });
    assert.throws(() => importContacts(`name,email\nNew,ann@site.test\n${invalid}`, store), CsvError);
    assert.deepEqual(store.all(), [{ id: 1, name: "Old", email: "ann@site.test" }]);
  }
});

test("propagates storage errors", () => {
  const store = { findByEmail: () => null, insert: () => { throw new Error("write failed"); } };
  assert.throws(() => importContacts("name,email\nAnn,ann@site.test", store), /write failed/);
});

test("handles quoted names and reports the start of an invalid multiline row", () => {
  const store = new ContactStore();
  const result = importContacts('email,name\nann@site.test,"Ann, ""Ace"""\ninvalid,"Two\nlines"\n', store);
  assert.deepEqual(result, {
    created: 1, updated: 0, rejected: [{ line: 3, reason: "email is not an address" }],
  });
  assert.equal(store.findByEmail("ann@site.test").name, 'Ann, "Ace"');
});
