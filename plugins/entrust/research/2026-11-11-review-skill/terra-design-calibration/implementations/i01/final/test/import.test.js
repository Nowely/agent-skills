import test from "node:test";
import assert from "node:assert/strict";
import { ContactStore } from "../src/contacts/store.js";
import { importContacts } from "../src/contacts/import.js";
import { CsvError } from "../src/lib/csv.js";

test("imports each address once using its last valid row", () => {
  const store = new ContactStore();
  store.insert({ name: "Old", email: "ann@site.test" });
  const result = importContacts([
    "name,email",
    "First,ann@site.test",
    "Bob,bob@site.test",
    "Ann, ANN@SITE.TEST ",
    "Robert, BOB@SITE.TEST ",
    ",bob@site.test",
    "Example,ann@example.invalid",
  ].join("\n"), store);

  assert.deepEqual(result, {
    created: 2,
    updated: 1,
    rejected: [{ line: 6, reason: "name is empty" }],
  });
  assert.deepEqual(store.all().map(({ name, email }) => ({ name, email })), [
    { name: "Ann", email: "ann@site.test" },
    { name: "Robert", email: "bob@site.test" },
    { name: "Example", email: "ann@example.invalid" },
  ]);
});

test("rejects rows with empty names or invalid email and continues", () => {
  const store = new ContactStore();
  const result = importContacts('name,email\n\n   \n""\nOnly name\n,no@site.test\nBad,ann@site\nBad,a@b@site.test\nGood,good@site.test\n', store);

  assert.deepEqual(result, {
    created: 1,
    updated: 0,
    rejected: [
      { line: 3, reason: "name is empty" },
      { line: 4, reason: "name is empty" },
      { line: 5, reason: "email is not an address" },
      { line: 6, reason: "name is empty" },
      { line: 7, reason: "email is not an address" },
      { line: 8, reason: "email is not an address" },
    ],
  });
  assert.equal(store.findByEmail("good@site.test").name, "Good");
});

test("uses the starting physical line for multiline records", () => {
  const store = new ContactStore();
  const result = importContacts('name,email\r\n"Ann\r\nSmith",ann@site.test\r\n"Bad\r\nName",invalid\r\n', store);

  assert.deepEqual(result, {
    created: 1,
    updated: 0,
    rejected: [{ line: 4, reason: "email is not an address" }],
  });
  assert.equal(store.findByEmail("ann@site.test").name, "Ann\r\nSmith");
});

test("does not write when parsing fails", () => {
  const store = new ContactStore();
  store.insert({ name: "Old", email: "ann@site.test" });
  assert.throws(() => importContacts('name,email\nAnn,ann@site.test\n"Bob,bob@site.test', store), CsvError);
  assert.deepEqual(store.all().map(({ name, email }) => ({ name, email })), [
    { name: "Old", email: "ann@site.test" },
  ]);
});
