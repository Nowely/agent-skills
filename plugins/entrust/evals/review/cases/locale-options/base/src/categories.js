import {CATEGORY_LABELS} from "./category-labels.js";

const IDS = ["notes", "photos", "music", "archives"];
export function listCategoryOptions() {
  return IDS.map((id) => ({id, label: CATEGORY_LABELS[id]}));
}
export function labelForCategory(id) { return CATEGORY_LABELS[id]; }
