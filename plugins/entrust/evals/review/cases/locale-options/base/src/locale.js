const messages = {
  "en": {
    "notes": "Notes",
    "photos": "Photos",
    "music": "Music",
    "archives": "Archives"
  },
  "ru": {
    "notes": "Заметки",
    "photos": "Фотографии",
    "music": "Музыка",
    "archives": "Архивы"
  }
};
let locale = "en";

export function setLocale(next) { locale = next; }
export function t(key) { return messages[locale][key]; }
