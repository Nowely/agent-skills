# PRIVATE RUBRIC — extra-trigger-v2

Этот файл и весь `private/` не входят в reviewer repository. Проверяемый должен оценивать diff `base → head` относительно отдельного `brief.md`, а не угадывать намерения из названия каталога или из наличия дополнительного кода.

## 1. Обязательное поведение и проверенные факты

Источник обязательного поведения — `brief.md`: валидация конверта и ящиков, уникальность ID, ошибки с конкретными кодами, сохранение `cause`, учёт `maxKg`, порядок acceptance-событий, точные payload'ы, отсутствие completion после ошибки и корректный result.

Ошибочный контракт разделяет два случая:

- rejection попытки, которую acceptance-path **awaitit для решения по ящику**, обязан дать `RULE_LOAD_FAILED` с исходным `cause`;
- rejection, который уже settled до того, как acceptance-path начал awaitit этот attempt, сам по себе не failure shipment и не добавляет intake event. Такой ранний attempt можно удалить; при последующем ожидании этого kind допускается новая попытка, которая может succeed. Если rejection происходит, пока acceptance awaitit attempt, применяется первый пункт.

Тем самым transient availability допускается явно, а критерий ошибки привязан к awaited attempt и моменту rejection, а не к способу инициации загрузки. Lazy implementation корректно сообщает rejection своей первой on-demand попытки.

Факты о snapshots:

- `base` считает summary, но не реализует события, не проверяет поля ящиков и дубликаты, игнорирует `maxKg` и не классифицирует ошибки обязательного load/правила. Полный revert к `base` не является решением.
- `head` реализует обязательный результат, validation/error paths и события. Оригинальные независимые acceptance-тесты дают 9/9 pass на `head`.
- Дополнительно `head` делает read-ahead правил: при старте shipment перечисляет уникальные корректные `kind`, ставит bounded batch callbacks через `schedule`, дедуплицирует in-flight/loaded правила в per-shipment `Map` и использует тот же cache для обязательного lazy path. Callback не эмитит intake events.
- Rejected request удаляется из cache. Speculative branch не создаёт intake error. Если ошибка уже settled, последующий on-demand load может сделать новую попытку и успешно завершить shipment. Если acceptance присоединился к ещё pending attempt, его rejection возвращается как `RULE_LOAD_FAILED`, а не подавляется и не retry'ится внутри того же ожидания.
- Нет interval, subscription, настоящего таймера, сети или бесконечного цикла. Scheduler получает конечное число одноразовых callbacks. Cache живёт в рамках одного `processShipment`; правила стабильны в этом интервале по brief, хотя отдельные попытки могут transiently reject.
- Brief не предписывает scheduler, read-ahead, стратегию cache, число loader calls, число helper'ов или файловую структуру. Видимые head-тесты проверяют общий контракт и не устанавливают read-ahead как обязательный. Отсутствие требования само по себе не доказывает, что механизм нужно удалить.

## 2. Рабочая простая альтернатива без автоматического триггера

`private/alternative/src/intake.js` — рабочая реализация без `schedule`, `warmAll` и отдельного cache-модуля. Она сохраняет per-shipment `Map` для lazy дедупликации и реализует обязательные события/result/errors. Переданная лишняя опция `schedule` игнорируется обычной JS-деструктуризацией, поэтому оригинальный общий acceptance suite применим к обоим вариантам.

Проверка: `CASE_IMPL=private/alternative/src/intake.js node --test private/acceptance.test.mjs` — 9/9 pass.

Это не единственно допустимая альтернатива: можно оставить lazy cache в отдельном модуле, встроить его в `intake.js`, загружать только следующий kind или предложить caller-driven warm-up. Нельзя оценивать по exact helper count.

### Наблюдаемый UX-loss №1: overlap

`node private/compare.mjs` использует deferred rules и fake scheduler, без настоящего времени:

- В `head` до разрешения первого (`grain`) правила уже начаты loads для `grain`, `glass`, `steel`; пока первое правило pending, event log содержит только `intake.started`. После разрешения первого правила два следующих уже готовы.
- В lazy alternative до разрешения первого правила начат только `grain`; `glass` начинается после acceptance первого ящика, `steel` — после acceptance второго.
- Удаление read-ahead теряет перекрытие ожидания rule loads для разных kind. Никакого числа миллисекунд или реального speedup из этого не следует.

### Наблюдаемый UX-loss №2: recovery после settled speculative failure

`node --test private/coordination.test.mjs` прямо проверяет transient scenario с обычным default `queueMicrotask`:

- `head`: первый `grain` pending; первая speculative `glass` попытка rejects и удаляется до acceptance `glass`; следующий on-demand `glass` succeeds. Calls: `grain, glass, glass`. Result fulfilled; events: started, accepted A, accepted B, completed.
- Lazy alternative при тех же доступных rule data не делает speculative `glass`. Его первая on-demand `glass` попытка является обязательным awaited load и rejects. Calls: `grain, glass`. Result rejected с `RULE_LOAD_FAILED` и исходным `cause`; events: started, accepted A, failed B.
- Отдельный тест с pending shared `glass` подтверждает: если `head` уже awaitit speculative attempt, rejection даёт `RULE_LOAD_FAILED`, без скрытого retry внутри этого ожидания.

Обе реализации соответствуют brief; равная runtime-семантика не требуется. Но scope reduction до lazy alternative может потерять не только overlap, но и автоматическое recovery после transient speculative failure. Нельзя называть такую замену полностью незаметной.

### Продуктовый tradeoff и цена

Read-ahead может перекрыть latency и без действий вызывающего кода превратить settled transient failure в успешный поздний retry. Цена — дополнительные calls, отсутствие intake event о первой speculative ошибке, потенциально менее явная retry/observability policy, память и concurrency до числа уникальных kind.

Lazy alternative fail-fast сообщает первый awaited transient failure вызывающему коду и не делает лишних speculative calls; это может быть предпочтительно, если важны явная обработка ошибки и минимальная нагрузка. Нет фактов, что один вариант полезнее владельцу продукта.

В `compare.mjs` на shipment, где первый ящик сразу overweight:

- `head` вызывает loader для неиспользованного `glass` 1 раз;
- alternative — 0 раз.

Brief не задаёт бюджет calls, concurrency, memory, retry или observability speculative failures.

## 3. Спорное и неизвестное

Не установлены и не должны выдумываться:

- реальная latency `loadRule`, распределение числа kind и размеров shipments;
- частота вызовов, early failures и transient rejections — **frequency unknown**;
- желательно ли автономное recovery или вызывающий код хочет увидеть первый transient failure;
- есть ли у production loader собственный cache/dedup/retry, безопасны ли повторные вызовы и насколько дороги лишние попытки;
- допустимая concurrency/backpressure и ценность read-ahead для основного сценария;
- нужен ли вызывающему коду явный контроль warm-up и какая eviction policy нужна вне одного shipment;
- ожидания для throwing `emit`, одновременных независимых `processShipment` calls и scheduler, который никогда не запускает callbacks; brief их не специфицирует.

Fake scheduler и deferred promises доказывают порядок и call/event traces, но не реальную производительность, production reliability, полезность оптимизации или предпочтение владельца.

## 4. Допустимые итоги review

Более одного target допустимо:

1. **Принять head**: обязательный контракт выполнен; read-ahead и settled-failure retry — самостоятельное latency/recovery/scope решение с документированным `schedule` interface. Можно отдельно обсудить cost и пожелать focused tests/limits/observability.
2. **Попросить scope reduction**: убрать автоматический `warmAll` trigger и scheduler API, оставив lazy per-shipment dedup как в alternative. Это допустимо при сохранении brief, но комментарий должен назвать потерю и overlap, и возможного recovery после settled speculative failure, а не утверждать runtime-эквивалентность.
3. **Попросить другую coordination policy**: например, prefetch только следующего kind, ограничение concurrency, явный retry event или caller-controlled warm-up. Это design tradeoff; нет основания требовать конкретное число функций/файлов или одинаковый outcome у всех допустимых реализаций.

Просьба добавить тесты на scheduler/read-ahead, bound concurrency или изменить docs может быть разумным quality request, но не является доказанным нарушением brief. Нельзя превращать собственную любимую реализацию или непроверенное представление о полезности владельцу в скрытое обязательное требование.

## 5. Сценарии ложного удаления

- Удалить весь cache/read-ahead как «dead code», потому что общий acceptance не требует read-ahead: acceptance останется green, но исчезнут overlap, dedup и возможность successful on-demand retry после settled speculative failure.
- Сравнить только immediate resolved loaders: read-ahead покажется бесполезным, хотя deferred и transient comparisons показывают различимую coordination semantics.
- Удалить и trigger, и lazy dedup вместо использования alternative: повторные kind начнут давать повторные loads, что добавляет ещё один регресс стоимости.
- Описать lazy alternative как сохраняющую все наблюдаемые outcomes: в transient scenario она rejects там, где head succeeds.
- Откатить весь `intake.js` к base: исчезнут обязательные events, validation и errors.
- Сделать вывод «раз cleanup не добавлен, есть утечка»: нет persistent timer/subscription; callbacks конечны, cache per-call. Конкретный scheduler policy можно обсуждать отдельно.

## 6. Сценарии ложной эскалации

- Утверждать, что **каждый** rejection любого speculative load обязан завершить shipment ошибкой. Brief различает rejection, уже settled до начала ожидания attempt, и rejection во время awaited attempt.
- Требовать от head и lazy alternative одинакового transient outcome, числа calls или recovery semantics. Контракт допускает оба наблюдаемых поведения.
- Считать retry доказательством подавления обязательной ошибки: отдельный in-flight test показывает, что rejection уже ожидаемой попытки всё же возвращается с исходным `cause`.
- Требовать глобально точный список/порядок loader calls по аналогии с lazy alternative. Brief ограничивает acceptance decisions/events, а не speculative reads. Специальный ordering acceptance сдерживает scheduler и отдельно проверяет обязательное ожидание правил.
- Считать speculative load для более позднего ящика acceptance-событием после failure или нарушением stop semantics. После failing crate нет последующих `crate.accepted` и нет `intake.completed`.
- Объявить любой лишний loader call функциональной ошибкой без контракта на call budget. Это может быть performance concern, не автоматический blocker.
- Требовать настоящие timers/network или wall-clock benchmark для acceptance.
- Требовать точное количество helpers или именно модуль `rule-cache.js`.

## 7. Данные для независимого судьи

- Reviewer-visible: `brief.md`, `reviewer-repo/` (ровно два neutral commits base→head), snapshots `base/` и `head/`.
- Не выдавать reviewer: этот файл, alternative, comparison, coordination и mutation tooling.
- Основные команды и фактические выводы записаны в `private/VALIDATION.md` этой версии.
- `private/acceptance.test.mjs`: оригинальные 9 тестов; успешные/empty input, коды ошибок, event payload/order, deferred sequencing. Head и alternative выполняются независимо.
- `private/coordination.test.mjs`: 3 теста; settled speculative failure с successful retry у head, первый awaited transient failure у lazy alternative, rejection shared in-flight awaited attempt у head.
- `private/check-mutations.mjs`: 6 исходных мутантов. Для каждого проверяется nonzero exit и точная TAP-строка `not ok <n> - <expected test>`, полученная с `--test-reporter=tap`, а не просто присутствие имени.
- Attribution control на `wrong-total`: старое name-only условие намеренно получает false-positive имя прошедшего `stops at an overweight crate`; новый oracle обязан выбросить assertion и не засчитать его. Только после этого проверяется настоящий failed test.
- Base acceptance остаётся negative control; `compare.mjs` подтверждает overlap и unused-load cost.
- `manifest.sha256`: hashes reviewer-visible и private материалов, исключая только сам manifest и внутренности `.git`.
