import assert from "node:assert/strict";

const ids = ["notes", "photos", "music", "archives", "videos", "drawings"];
const en = ["Notes", "Photos", "Music", "Archives", "Videos", "Drawings"];
const ru = ["Заметки", "Фотографии", "Музыка", "Архивы", "Видео", "Рисунки"];
const open = async (tree) => {
  const {setLocale} = await tree("src/locale.js");
  setLocale("en");
  const api = await tree("src/categories.js");
  const {saveSelection} = await tree("src/saved-selection.js");
  return {...api, setLocale, saveSelection};
};

export default [
  {name: "all six categories retain stable IDs and order", run: async (tree) => {
    const api = await open(tree);
    assert.deepEqual(api.listCategoryOptions().map((x) => x.id), ids);
    assert.deepEqual(api.listCategoryOptions().map((x) => x.label), en);
  }},
  {name: "all option labels follow locale changes after module loading", run: async (tree) => {
    const api = await open(tree);
    for (const [locale, labels] of [["ru", ru], ["en", en], ["ru", ru]]) {
      api.setLocale(locale);
      assert.deepEqual(api.listCategoryOptions().map((x) => x.label), labels);
      assert.deepEqual(api.listCategoryOptions().map((x) => x.id), ids);
    }
  }},
  {name: "individual label reads use the same current locale as the option group", run: async (tree) => {
    const api = await open(tree);
    for (const [locale, labels] of [["ru", ru], ["en", en], ["ru", ru]]) {
      api.setLocale(locale);
      assert.deepEqual(ids.map((id) => api.labelForCategory(id)), labels);
    }
  }},
  {name: "saved selections retain their creation-time label", run: async (tree) => {
    const api = await open(tree);
    api.setLocale("ru");
    const saved = api.saveSelection("drawings");
    api.setLocale("en");
    assert.deepEqual(saved, {id: "drawings", label: "Рисунки"});
    assert.equal(api.labelForCategory("drawings"), "Drawings");
  }},
];
