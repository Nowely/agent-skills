import assert from "node:assert/strict";

const open = async (tree) => {
  const { ProfileStore } = await tree("src/profiles/store.js");
  const { createProfile } = await tree("src/profiles/create.js");
  const { updateProfile } = await tree("src/profiles/update.js");
  return { store: new ProfileStore(), createProfile, updateProfile };
};
// What a refusal looks like: nothing thrown, nothing stored, and a reason to show.
const refused = (result, store, stored = 0) => {
  assert.equal(result.ok, false);
  assert.equal(typeof result.reason, "string");
  assert.equal(store.all().length, stored);
};

export default [
  { name: "a phone is stored in E.164 form however it was typed", run: async (tree) => {
    const { store, createProfile } = await open(tree);
    assert.equal(createProfile({ name: "Ann", phone: "+1 (415) 555-0100" }, store).profile.phone, "+14155550100");
  } },
  { name: "a profile without a phone is refused with a reason", run: async (tree) => {
    const { store, createProfile } = await open(tree);
    refused(createProfile({ name: "Ann" }, store), store);
  } },
  { name: "a text that is not a phone number is refused with a reason", run: async (tree) => {
    const { store, createProfile } = await open(tree);
    refused(createProfile({ name: "Ann", phone: "call me" }, store), store);
  } },
  { name: "a number from a country outside the list is refused, and one inside it is taken", run: async (tree) => {
    const { store, createProfile } = await open(tree);
    refused(createProfile({ name: "Ann", phone: "+74951234567" }, store), store);
    assert.equal(createProfile({ name: "Ann", phone: "+442079460958" }, store).ok, true);
  } },
  { name: "the same number typed another way is refused", run: async (tree) => {
    const { store, createProfile } = await open(tree);
    createProfile({ name: "Ann", phone: "+14155550100" }, store);
    refused(createProfile({ name: "Bo", phone: "+1 415 555 0100" }, store), store, 1);
  } },
  { name: "an edit checks a phone as a creation does", run: async (tree) => {
    const { store, createProfile, updateProfile } = await open(tree);
    const ann = createProfile({ name: "Ann", phone: "+14155550100" }, store).profile;
    const bo = createProfile({ name: "Bo", phone: "+442079460958" }, store).profile;
    assert.equal(updateProfile(bo.id, { phone: "call me" }, store).ok, false);
    assert.equal(updateProfile(bo.id, { phone: "+1 415 555 0100" }, store).ok, false);
    assert.equal(updateProfile(ann.id, { phone: "+1 415 555 0100" }, store).ok, true);
    assert.equal(updateProfile(bo.id, { phone: "+49 30 901820" }, store).profile.phone, "+4930901820");
  } },
  { name: "an edit of the name leaves the phone as it was", run: async (tree) => {
    const { store, createProfile, updateProfile } = await open(tree);
    const { id, phone } = createProfile({ name: "Ann", phone: "+14155550100" }, store).profile;
    assert.equal(updateProfile(id, { name: "Anna" }, store).profile.phone, phone);
  } },
];
