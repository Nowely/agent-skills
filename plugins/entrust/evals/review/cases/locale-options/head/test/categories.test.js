import assert from "node:assert/strict";
import {test, beforeEach} from "node:test";
import {setLocale} from "../src/locale.js";
import {listCategoryOptions, labelForCategory} from "../src/categories.js";
import {saveSelection} from "../src/saved-selection.js";

beforeEach(() => setLocale("en"));
test("categories keep their stable IDs and order", () => {
  assert.deepEqual(listCategoryOptions().map((x) => x.id), ["notes", "photos", "music", "archives", "videos", "drawings"]);
});
test("an existing category has its English label initially", () => {
  assert.equal(labelForCategory("notes"), "Notes");
});
test("new category labels use the selected locale", () => {
  setLocale("ru");
  assert.equal(labelForCategory("videos"), "Видео");
  assert.equal(labelForCategory("drawings"), "Рисунки");
});
test("a saved selection keeps its creation-time text", () => {
  setLocale("ru");
  const saved = saveSelection("drawings");
  setLocale("en");
  assert.deepEqual(saved, {id: "drawings", label: "Рисунки"});
});
