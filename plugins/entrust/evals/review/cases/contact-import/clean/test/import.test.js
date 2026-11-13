import test from "node:test";
import assert from "node:assert/strict";
import { CsvError } from "../src/lib/csv.js";
import { ContactStore } from "../src/contacts/store.js";
import { importContacts, planImport } from "../src/contacts/import.js";

const row = (line, name, email) => ({ line, name, email });

test("a plan rejects a row with its line and reason and keeps the rest", () => {
  const plan = planImport([row(2, "", "a@site.test"), row(3, "Bo", "bo@site"), row(4, "Cy", "cy@site.test")], new ContactStore());
  assert.deepEqual(plan.rejected, [{ line: 2, reason: "name is empty" }, { line: 3, reason: "email is not an address" }]);
  assert.deepEqual(plan.create, [{ name: "Cy", email: "cy@site.test" }]);
});

test("a plan renames a known email and takes the last row for a repeated one", () => {
  const store = new ContactStore();
  const { id } = store.insert({ name: "Old", email: "ann@site.test" });
  const plan = planImport([row(2, "Ann", " ANN@site.test "), row(3, "Ed", "ed@site.test"), row(4, "Edward", "ED@site.test")], store);
  assert.deepEqual(plan.rename, [{ id, name: "Ann" }]);
  assert.deepEqual(plan.create, [{ name: "Edward", email: "ed@site.test" }]);
});

test("an import writes its plan and counts it", () => {
  const store = new ContactStore();
  store.insert({ name: "Old", email: "bo@site.test" });
  assert.deepEqual(importContacts("name,email\nAnn,ann@site.test\n,x@site.test\nBo,BO@site.test\n", store),
    { created: 1, updated: 1, rejected: [{ line: 3, reason: "name is empty" }] });
  assert.equal(store.findByEmail("ann@site.test").name, "Ann");
  assert.equal(store.findByEmail("bo@site.test").name, "Bo");
});

test("a file that cannot be parsed writes nothing", () => {
  const store = new ContactStore();
  assert.throws(() => importContacts('name,email\nAnn,ann@site.test\n"Bo,bo@site.test\n', store), CsvError);
  assert.deepEqual(store.all(), []);
});
