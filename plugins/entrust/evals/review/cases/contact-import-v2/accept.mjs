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
  { name: "a quoted empty short row is rejected, not treated as a blank line", run: async (tree) => {
    const { store, importContacts } = await open(tree);
    const result = importContacts('name,email\n""\n', store);
    assert.deepEqual(result.rejected, [{ line: 2, reason: "name is empty" }]);
    assert.deepEqual(store.all(), []);
  } },
  { name: "a blank physical line is ignored", run: async (tree) => {
    const { store, importContacts } = await open(tree);
    assert.deepEqual(counts(importContacts("name,email\n\n", store)), [0, 0, 0]);
    assert.deepEqual(store.all(), []);
  } },
  { name: "a whitespace-only physical row is rejected", run: async (tree) => {
    const { store, importContacts } = await open(tree);
    const result = importContacts("name,email\n   \n", store);
    assert.deepEqual(result.rejected, [{ line: 2, reason: "name is empty" }]);
    assert.deepEqual(store.all(), []);
  } },
  { name: "repeated existing email counts once and uses the last valid row", run: async (tree) => {
    const { store, importContacts } = await open(tree);
    store.insert({ name: "Old", email: "a@site.test" });
    const result = importContacts("name,email\nA,a@site.test\nB, A@SITE.TEST \n", store);
    assert.deepEqual(counts(result), [0, 1, 0]);
    assert.equal(store.findByEmail("a@site.test").name, "B");
  } },
  { name: "an invalid last duplicate is rejected and the last valid row wins", run: async (tree) => {
    const { store, importContacts } = await open(tree);
    store.insert({ name: "Old", email: "a@site.test" });
    const result = importContacts("name,email\nA,a@site.test\n,a@site.test\n", store);
    assert.deepEqual(counts(result), [0, 1, 1]);
    assert.deepEqual(result.rejected, [{ line: 3, reason: "name is empty" }]);
    assert.equal(store.findByEmail("a@site.test").name, "A");
  } },
  { name: "the import uses the address book email validator's policy", run: async (tree) => {
    const { store, importContacts } = await open(tree);
    const { isEmail } = await tree("src/contacts/email.js");
    const email = "ann@site..test";
    const result = importContacts(`name,email\nAnn,${email}\n`, store);
    assert.equal(result.created === 1, isEmail(email));
    assert.equal(result.rejected.length, isEmail(email) ? 0 : 1);
  } },
];
