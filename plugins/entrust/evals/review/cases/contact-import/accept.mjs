import assert from "node:assert/strict";

const open = async (tree) => {
  const { ContactStore } = await tree("src/contacts/store.js");
  const { importContacts } = await tree("src/contacts/import.js");
  return { store: new ContactStore(), importContacts };
};
const names = (store) => Object.fromEntries(store.all().map((contact) => [contact.email, contact.name]));
const counts = ({ created, updated, rejected }) => [created, updated, rejected.length];

export default [
  { name: "new emails are created and known ones renamed, whatever their case and spacing", run: async (tree) => {
    const { store, importContacts } = await open(tree);
    store.insert({ name: "Old", email: "ann@site.test" });
    assert.deepEqual(counts(importContacts("name,email\nAnn Lee, ANN@site.test \nBob,bob@site.test\n", store)), [1, 1, 0]);
    assert.deepEqual(names(store), { "ann@site.test": "Ann Lee", "bob@site.test": "Bob" });
  } },
  { name: "a rejected row is reported with its line and reason and stops nothing", run: async (tree) => {
    const { store, importContacts } = await open(tree);
    const result = importContacts("name,email\n,x@site.test\nCy,not-an-address\nDi,di@site.test\n", store);
    assert.deepEqual(result.rejected, [{ line: 2, reason: "name is empty" }, { line: 3, reason: "email is not an address" }]);
    assert.equal(result.created, 1);
  } },
  { name: "the same email twice in one file counts once and the last row wins", run: async (tree) => {
    const { store, importContacts } = await open(tree);
    assert.deepEqual(counts(importContacts("name,email\nEd,ed@site.test\nEdward,ED@site.test\n", store)), [1, 0, 0]);
    assert.deepEqual(names(store), { "ed@site.test": "Edward" });
  } },
  { name: "a file that cannot be parsed writes nothing", run: async (tree) => {
    const { store, importContacts } = await open(tree);
    assert.throws(() => importContacts('name,email\nFay,fay@site.test\n"Gus,gus@site.test\n', store));
    assert.deepEqual(store.all(), []);
  } },
  { name: "a quoted name may hold a comma and a line break", run: async (tree) => {
    const { store, importContacts } = await open(tree);
    assert.deepEqual(counts(importContacts('name,email\n"Lee, Ann\nJr",ann@site.test\n', store)), [1, 0, 0]);
    assert.deepEqual(names(store), { "ann@site.test": "Lee, Ann\nJr" });
  } },
  { name: "an address the single-contact form refuses is refused here", run: async (tree) => {
    const { store, importContacts } = await open(tree);
    const { createContact } = await tree("src/contacts/create.js");
    assert.ok(createContact(store, { name: "Hal", email: "hal@site" }).error);
    assert.deepEqual(counts(importContacts("name,email\nHal,hal@site\n", store)), [0, 0, 1]);
  } },
  { name: "no valid row is dropped without a word", run: async (tree) => {
    const { store, importContacts } = await open(tree);
    assert.deepEqual(counts(importContacts("name,email\nIda,ida@example.invalid\n", store)), [1, 0, 0]);
  } },
];
