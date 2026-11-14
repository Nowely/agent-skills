import {t} from "./locale.js";

export const CATEGORY_LABELS = {
  notes: t("notes"),
  photos: t("photos"),
  music: t("music"),
  archives: t("archives"),
  get videos() { return t("videos"); },
  get drawings() { return t("drawings"); },
};
