import assert from "node:assert/strict";
import {test, beforeEach} from "node:test";
import {setLocale} from "../src/locale.js";
import {listCategoryOptions, labelForCategory} from "../src/categories.js";
import {saveSelection} from "../src/saved-selection.js";

beforeEach(() => setLocale("en"));
test("categories keep their stable IDs and order", () => {
  assert.deepEqual(listCategoryOptions().map((x) => x.id), ["notes", "photos", "music", "archives"]);
});
test("an existing category has its English label initially", () => {
  assert.equal(labelForCategory("notes"), "Notes");
});
test("a saved selection keeps its creation-time text", () => {
  const saved = saveSelection("notes");
  setLocale("ru");
  assert.deepEqual(saved, {id: "notes", label: "Notes"});
});
