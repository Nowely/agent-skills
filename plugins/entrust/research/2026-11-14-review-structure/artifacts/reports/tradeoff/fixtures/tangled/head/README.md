# Seed dispatch planner

Канонический интерфейс описан в `brief/BRIEF.md`.

## Локальный адаптер ручного ввода

`operatorAids` — необязательный локальный вход для преобразования ручных ссылок
перед планированием.

Если `operatorAids` не передан, адаптер возвращает исходный объект заявки без
преобразований. Действует только канонический контракт с `items`.

При передаче `operatorAids` действуют следующие правила:

- `operatorAids.varieties` и `operatorAids.members` независимы; любой из массивов
  может отсутствовать или быть пустым.
- Variety aid имеет вид `{ id, aliases? }`; его `id` обязан ссылаться на вид из
  основного аргумента `varieties`.
- Member aid имеет вид
  `{ id, aliases?, householdId, permits?, carriedOver? }`.
  `householdId` обязателен для каждой member-записи.
- `itemCodes` может использовать канонические ID и aliases. Неизвестный code
  сохраняется и затем обрабатывается планировщиком как `unknown-variety`.
- Если присутствует `items`, используется оно, а `itemCodes` игнорируется.
  Значения `items` не проходят alias-подстановку.
- `memberId` может использовать канонический ID или alias. Неизвестный member
  reference — ошибка адаптации.
- Явные `householdId` и `carriedOver` имеют приоритет над member defaults.
  Разрешения заявки и member-записи объединяются без дубликатов.
- Если после объединения нет непустого `householdId`, адаптер выбрасывает
  `TypeError`; планирование с неопределённым домохозяйством не начинается.
- `items` или `itemCodes` после выбора источника обязаны быть непустым массивом.

ID и aliases сравниваются после NFKD-нормализации, удаления диакритики,
приведения регистра и сворачивания разделителей. Точное совпадение канонического
ID работает до нормализации. Конфигурация отклоняется заранее, если alias
совпадает после нормализации с каноническим ID другой записи или с alias другой
записи. Канонические ID, которые после нормализации совпадают друг с другом,
также отклоняются при включённом адаптере.

Пример только с variety aids:

```js
planDispatches({
  requests: [
    {
      id: "request-8",
      itemCodes: ["Scarlet beans"],
      householdId: "house-9",
      submittedAt: "2027-01-01T10:00:00Z",
    },
  ],
  varieties,
  lots,
  cycleDate: "2027-01-01",
  operatorAids: {
    varieties: [
      { id: "bean-scarlet", aliases: ["Scarlet beans", "scarlet-bean"] },
    ],
  },
});
```

Пример только с member aids:

```js
const adapted = createRequestAdapter(
  {
    members: [
      {
        id: "member-17",
        aliases: ["M17"],
        householdId: "house-9",
        permits: ["SCARIFY"],
        carriedOver: true,
      },
    ],
  },
  varieties,
)({
  id: "request-9",
  items: ["garlic"],
  memberId: "M17",
  submittedAt: "2027-01-01T10:00:00Z",
});
```

Адаптер не добавляет виды, партии или домохозяйства в основной планировщик и не
изменяет правила запасов, разрешений, сортировки и allium-допуска.
