import {labelForCategory} from "./categories.js";

export function saveSelection(id) {
  return {id, label: labelForCategory(id)};
}
