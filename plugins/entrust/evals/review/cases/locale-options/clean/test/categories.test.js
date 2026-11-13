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
test("both readers use the locale at each read for every category", () => {
  const ids = ["notes", "photos", "music", "archives", "videos", "drawings"];
  const en = ["Notes", "Photos", "Music", "Archives", "Videos", "Drawings"];
  const ru = ["Заметки", "Фотографии", "Музыка", "Архивы", "Видео", "Рисунки"];
  for (const [locale, labels] of [["ru", ru], ["en", en], ["ru", ru]]) {
    setLocale(locale);
    assert.deepEqual(listCategoryOptions(), ids.map((id, index) => ({id, label: labels[index]})));
    assert.deepEqual(ids.map((id) => labelForCategory(id)), labels);
  }
});
