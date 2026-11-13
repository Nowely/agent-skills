import test from "node:test";
import assert from "node:assert/strict";
import { ContactStore } from "../src/contacts/store.js";
import { createContact } from "../src/contacts/create.js";

test("a contact is stored under its normalized email", () => {
  const store = new ContactStore();
  assert.equal(createContact(store, { name: " Ann ", email: " Ann@Site.test " }).contact.email, "ann@site.test");
});

test("an address without a domain suffix is refused", () => {
  assert.equal(createContact(new ContactStore(), { name: "Ann", email: "ann@site" }).error, "email is not an address");
});
