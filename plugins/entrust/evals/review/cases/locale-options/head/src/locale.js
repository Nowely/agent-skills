const messages = {
  "en": {
    "notes": "Notes",
    "photos": "Photos",
    "music": "Music",
    "archives": "Archives",
    "videos": "Videos",
    "drawings": "Drawings"
  },
  "ru": {
    "notes": "Заметки",
    "photos": "Фотографии",
    "music": "Музыка",
    "archives": "Архивы",
    "videos": "Видео",
    "drawings": "Рисунки"
  }
};
let locale = "en";

export function setLocale(next) { locale = next; }
export function t(key) { return messages[locale][key]; }
