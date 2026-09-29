# prepare-feedback: разбиение на исполнителей (Fable F2, итерация 05)

2026-09-29. Правка `F1-split-04.md` после проверки каждого названного места по дереву worktree
`.claude/worktrees/prepare-feedback` (ветка `entrust-prepare-feedback`, HEAD = main
d1c7ee5 (хеш в переписанной истории) + E91 + research-папка) и по ветке `entrust-issue22-pages` (HEAD того часа, дерево чистое). Адреса ниже — относительно
`plugins/entrust/`, если не сказано иначе. Проект — `F1-design-04.md`; всё, что здесь не переопределено, остаётся как в
`F1-split-04.md`.

## Правки к F1-split-04.md

| # | Правка | Почему |
|---|---|---|
| 1 | Предусловие «влить `entrust-issue22-pages` в worktree» снято. W1 читает страницы orchestrate и swarm из worktree той ветки по пути (только чтение) и записывает хеш, который прочёл; коордиатор вливает `main` в ветку один раз после того, как #22 уйдёт в main squash-ом | `git merge-tree` двух веток: единственный конфликт — `ISSUES.md` (E91 против E89–E90, оба дописаны после E83); после squash тот же конфликт повторится при слиянии main, то есть слияние сейчас — два разрешения вместо одного. Ветка #22 не трогает ни одного файла W1/W2, кроме `CHANGELOG.md` (её `--stat`: CHANGELOG, ISSUES, orchestrate.test, swarm.test, codex/SKILL, protocols.md, orchestrate/SKILL, codex-composition.md, swarm/SKILL). Ни один тест ни на одной ветке не читает новую страницу против текста orchestrate |
| 2 | Новое предусловие: до запуска координатор создаёт четыре новых файла пустыми и делает `git add -N` на них | `package.test.mjs:131-134` читает `git ls-files -z`: неотслеженные `SKILL.md`, `focuses.md`, скрипт и ссылка на `focuses.md` со страницы — красный тест, который W1 не может исправить своими правами. В scratch-репозитории проверено: `git ls-files` показывает intent-to-add файл до и после записи в него (`EXIT=0`) |
| 3 | Путь `plugin/skills/cleanup/scripts/cleanup.mjs` заменён на `plugin/skills/codex/scripts/cleanup.mjs` | `find`: файла по пути F1 нет; cleanup.mjs лежит в `codex/scripts/`. Строка «никто» остаётся |
| 4 | `corpus` пишет и `corpus/turns.jsonl` (поля `t`, `line`, `role`, `text`), не только `index.json` | `parts` режет `turns.jsonl`, `quotes` ищет в нём, а ни одна команда F1 его не пишет |
| 5 | Выход `corpus` получает две строки без опций: `PLUGINS=entrust:<n> terse:<n>` (до фильтра `--plugin`) и `HUMAN_SESSIONS=<n>` | §2 проекта: вторая строка запуска — «какие плагины найдены»; §3: фокус `feedback` показывает «все сессии с человеческими сообщениями: N». В выходе F1 обеих цифр нет — страница не могла бы их показать |
| 6 | `--focus` у `corpus` снят | Ни одна ячейка «Делает» и «Печатает» от него не зависит; фокус — решение страницы. Правило Flags: предложение не пишется |
| 7 | `--date` у `corpus` снят | Единственный потребитель — тест, а тест читает `RUN=`. Прецедент `experiment.mjs init --date` — тот же тестовый потребитель (`experiment.test.mjs:217,233`); здесь не повторяем |
| 8 | `--median` у `tokens` оставлен, предложение переписано | F1 обосновывал «скрипт не хранит состояние», но состояние есть — `measures/`. Настоящая причина: план может повторить пилот, и скрипт не знает, какой из `measures/tokens-*.json` план назвал стоп-линией; ставит координатор из карточки плана |
| 9 | `tokens` получает второй вход `--from <tsv>` (`agent<TAB>tokens`) как альтернативу `--reports` | §4: «после каждой партии читателей `tokens` по отчётам партии» — читатели по вопросу это Claude-агенты, у них нет `report.json`; их токены есть в возврате Agent tool (`totalTokens` в 221 транскрипте на этой машине). Без этого стоп-линия читателей не считается никогда |
| 10 | `<name>` в `coverage-<name>.json`, `quotes-<name>.json`, `tokens-<name>.json` задан: basename входа без расширения; существующее имя — refused 10 | В F1 `<name>` нигде не определён, а W1 и W2 должны назвать его одинаково |
| 11 | `export` копирует `drafts/*.md` как есть; черновики именуются `NN-report.md` при `add` | F1: «копирует drafts/*.md как NN-report.md» — порядок NN не определён (по имени? по времени?); нумерует координатор при `add` |
| 12 | `add` принимает `anonymized/`; `export` копирует его, если есть | §5 проекта: «`anonymized/` — только если отчёт на него ссылается»; в F1 этой папке некуда лечь |
| 13 | Формат `--episodes <jsonl>` задан: `quote` обязательное, `id` необязательное, прочие поля проходят насквозь | Иначе W1 не может сказать слиянию, что писать, а W2 — что читать |
| 14 | Правило повторного `corpus`: на существующий `<run>` — refused 10; суженная после плана область — новый `--slug` | «Ничего не перезаписывает» и «ограничения словами после плана» иначе несовместимы |
| 15 | W2: в `evals/README.md` кроме `:14` («twenty» → twenty-one) правится `:30` («the run-directory path three pages name» → four) | Четвёртая копия литерала регистрируется в `fragments.mjs` |
| 16 | W2 получает `O1-count2.mjs` и `O1-shape.mjs` как свидетельство формы записей; фикстуры синтетические, реальные транскрипты только читаются | В F1 у W2 нет ни одного источника о форме транскрипта, кроме прозы проекта |
| 17 | Бюджет страницы задан числом: тело `SKILL.md` ≤ 20 000 байт, без третьего уровня заголовков; W2 пинит, W1 целится | §1: «до 5 000 токенов» — тест не считает токены; ~4 байта на токен для английского текста — оценка (гипотеза), запас есть |
| 18 | CHANGELOG: W1 ставит `### Added` сразу после `## Unreleased`, а свои `### Changed`-пункты — над существующим пунктом про `environment-and-internals.md` | Ветка #22 дописывает 46 строк после этого пункта (`CHANGELOG.md:12+`); вставки W1 с двумя нетронутыми строками между ними сливаются без конфликта (уровень 2) |
| 19 | W2 не копирует кейс A0 из `experiment.test.mjs` («ни одна фраза не просит загрузить orchestrate») | Первая строка страницы по проекту читает orchestrate по пути — это решение, не ошибка |
| 20 | Столбец Record строки roles.md — в форме соседних строк: дата и источник | Столбец сейчас держит `2026-09-12 (Fable)`, `issues-fix and field-audit (2026-09-12, 2026-09-16)`, не `issue #15` |

## Предусловия (координатор, до запуска исполнителей)

1. **Четыре пустых файла и `git add -N`** в worktree: `plugin/skills/prepare-feedback/SKILL.md`,
   `plugin/skills/prepare-feedback/references/focuses.md`, `plugin/skills/prepare-feedback/scripts/prepare-feedback.mjs`,
   `evals/prepare-feedback.test.mjs`. Это единственная запись в индекс до возвратов; исполнители индекса не касаются. Пока файлы
   пусты, `package.test.mjs` (версия) и `run-all.mjs` (suite не в `SUITES`) красные — это ожидаемо и проходит, как только W1 и W2
   запишут своё. Исполнитель читает пустой файл инструментом Read перед первой записью (Write отказывает на непрочитанном файле).
2. **Ветку `entrust-issue22-pages` не вливать.** W1 читает её страницы по пути
   `.claude/worktrees/issue22-pages/plugins/entrust/plugin/skills/{orchestrate,swarm}/SKILL.md`
   и приводит в `evidence` хеш `git -C .claude/worktrees/issue22-pages rev-parse --short HEAD`.
   Пока оба исполнителя живы, в worktree нет merge, rebase, stash, reset (правило orchestrate о писателях на одном дереве).
   После того как #22 уйдёт в main: `git merge main` в `entrust-prepare-feedback`, один известный конфликт — `ISSUES.md`
   (порядок E89, E90, E91); PR prepare-feedback идёт после PR #22.
3. **Исполнители не коммитят.** Каждый возвращает список своих файлов; координатор прогоняет `node evals/run-all.mjs` и коммитит по
   темам: (а) навык — страница, `focuses.md`, скрипт, тест, регистрации в `run-all`, `package.test`, `fragments.mjs`, `evals/README`;
   (б) строка roles.md; (в) README и манифесты; CHANGELOG-строки идут с темой, которую называют. Версию не трогает никто.
4. **Каждому исполнителю** — этот файл, `F1-design-04.md`, страницы `orchestrate/SKILL.md` и `swarm/SKILL.md` из worktree
   `issue22-pages` (п. 2), `experiment/SKILL.md`, `references/roles.md`, `references/foreman.md` из своего worktree,
   `experiment/scripts/experiment.mjs` и `evals/experiment.test.mjs` как образцы; W2 дополнительно
   `$TMPDIR/fr-design/O1-count2.mjs` и `O1-shape.mjs`; и фраза: «финальный текст — возврат
   координатору, не сообщение человеку». Команды длиннее 20 строк — через runner
   `plugin/skills/orchestrate/scripts/capture-check.mjs` по абсолютному пути, `EXIT=` каждого запуска в `evidence`.

## W1 — страница и её окружение

**Владеет:**

| Файл | Что делает |
|---|---|
| `plugin/skills/prepare-feedback/SKILL.md` | frontmatter в форме `swarm/SKILL.md:1-10`: `name: prepare-feedback`, `description: >-` (триггерные слова первыми), `disable-model-invocation: true`, `metadata:` / `  version: "0.22.0"`, `license: MIT`. Тело по §1–§6 проекта; первая строка — фраза E82 из §1; вызов скрипта — одна строка с отступом в четыре пробела, форма `experiment/SKILL.md:40`: `CLAUDE_PLUGIN_DATA="${CLAUDE_PLUGIN_DATA}" node "${CLAUDE_SKILL_DIR}/scripts/prepare-feedback.mjs" <command> …`; называет каждую из семи команд и их опции строками раздела «Интерфейсы» без изменений; несёт литерал `` `<state>/orchestrate/<project-slug>/<run>/` `` точно в этой форме и форму `<state>/prepare-feedback/<date>-<slug>/`; ссылка `[focuses.md](references/focuses.md)`; ссылка на orchestrate — `../orchestrate/SKILL.md` (относительная, `package.test.mjs:167-174` её разрешает). Бюджет: тело ≤ 20 000 байт, без `###`. Команды на странице без heredoc'ов и абсолютных путей (§5) |
| `plugin/skills/prepare-feedback/references/focuses.md` | по разделу на фокус — единица, закрытые метки, раскладка выхода с эталоном (#15/#16, #1/#22, #20), способ чтения, когда звать page dry run и blind proposer'ов, слова ролей для строк плана (интерфейс 6); линза «полезность ролей» — подраздел `version`. Не называть модель Codex с версией (`package.test.mjs:113-127`, регулярка `\bgpt-\d`) |
| `plugin/skills/orchestrate/references/roles.md` | одна строка `| page dry run | … |` семью колонками, со строчной буквы (E9 `evals/orchestrate.test.mjs:854-870`: семь колонок, ≥ 15 строк); «May write» — `nothing`; «Tier» — `strong`; «Record» — в форме соседних строк (дата и источник, например `field audit #15 (2026-09-16, two page dry runs)`). Другие строки не трогать: E10 (`:872-904`) пинит их фразы |
| `plugin/README.md` | абзац о седьмом навыке после абзаца `:51-57` («Two more are experiments…»); `:82` «all six skills» → seven; `:89-90` список режимов + `/entrust:prepare-feedback`; Layout `:250-277` — строка `skills/prepare-feedback/` |
| `plugin/.claude-plugin/plugin.json` и `.claude-plugin/marketplace.json` | `description` дополнить одинаково в обоих (`package.test.mjs:50-61`: строки равны байт в байт); `version` не трогать |
| `CHANGELOG.md` | под `## Unreleased`: новый `### Added` сразу после заголовка `## Unreleased` (до `### Changed`) — навык одним предложением (что появилось и почему это стоило делать: пять ручных прогонов за #1, #15, #16, #20, #22 и #21) плюс строка W2 (текст ниже); в `### Changed` — строка roles.md и строка README/манифестов, обе **над** существующим пунктом про `environment-and-internals.md` (правка 18) |

**Не трогает:** `orchestrate/SKILL.md`, `swarm/SKILL.md`, лаунчер, `evals/`, `ISSUES.md`, `plugin.json` `version`.

**Проверки, которые читают его файлы:** `evals/package.test.mjs` — одна версия во всех `skills/*/SKILL.md` (`:33-47`), каждая
markdown-ссылка страницы ведёт в отслеживаемый файл (`:167-174`), ни одна страница не называет модель Codex с версией
(`:113-127`); `evals/orchestrate.test.mjs` E9/E10 для roles.md; `evals/fragments.test.mjs` — литерал каталога прогона, когда W2
внесёт страницу в `copies`; `evals/prepare-feedback.test.mjs` W2 — интерфейсные пины из раздела «Тест W2».

## W2 — скрипт и его тест

**Владеет:**

| Файл | Что делает |
|---|---|
| `plugin/skills/prepare-feedback/scripts/prepare-feedback.mjs` | команды раздела «Интерфейсы»; шапка-комментарий и `--help` в форме `experiment.mjs:1-22`; окружение `ENTRUST_STATE_DIR`, иначе `CLAUDE_PLUGIN_DATA` (абсолютный, без своего дефолта); корень транскриптов — `$CLAUDE_CONFIG_DIR/projects`, иначе `~/.claude/projects`; rollout-логи — `$CODEX_HOME/sessions/`, иначе `~/.codex/sessions/`; выходы 0 / 2 usage / 10 refused / 1 write failed; ничего не перезаписывает; только `node:` builtins; `node --check` проходит (CI `.github/workflows/ci.yml:43` идёт по `plugin/skills/*/scripts/*.mjs`) |
| `evals/prepare-feedback.test.mjs` | по образцу `evals/experiment.test.mjs` (шапка, `registry`, `runCases`, `summarize`, `tempDir`, `spawnNode` с `env: { ENTRUST_STATE_DIR }`, `unsetEnv: ["CLAUDE_PLUGIN_DATA"]`, `killAfterMs`); последняя строка — `process.exit(summarize(await runCases(CASES), CASES.length))` |
| `evals/run-all.mjs` | `SUITES` (`:23`) — `"prepare-feedback"` после `"experiment"`; без этого `run-all` завершается с кодом 2 (`:24-29`) |
| `evals/README.md` | `:14` «lists the twenty» → twenty-one, имя в перечне после `experiment`; `:30` «the run-directory path three pages name» → four |
| `evals/package.test.mjs` | `required` (`:151-159`): `...under("skills/prepare-feedback/scripts")` рядом с experiment/swarm/orchestrate |
| `evals/fragments.mjs` | `copies` фрагмента `run-directory` (`:44-48`): `"skills/prepare-feedback/SKILL.md"` |

**Не трогает:** страницы навыков, `roles.md`, README плагина, манифесты, CHANGELOG (свою строку отдаёт W1 текстом), `ISSUES.md`.

**Строка CHANGELOG для W1 (текст W2, файл W1):** «`evals/prepare-feedback.test.mjs` проверяет скрипт навыка на синтетических
транскриптах и отчётах; `package.test.mjs` включает `skills/prepare-feedback/scripts` в проверку полезной нагрузки, потому что
список там задан вручную и новый каталог скриптов иначе не проверяется».

**Источники о форме транскрипта:** `O1-count2.mjs` (загрузка — запись `user` с `isMeta`, текстовый блок начинается с
`Base directory for this skill: `; отказ — `tool_result` с `is_error` и текстом `cannot be used with Skill tool due to
disable-model-invocation`, имя навыка — `Skill <name> cannot be used`), `O1-shape.mjs` (ключи записи). Возврат Agent tool в
транскрипте координатора несёт `totalDurationMs`, `totalTokens`, `totalToolUseCount` — источник токенов субагентов для счётов
`corpus` и для `tokens --from`. Реальные транскрипты `~/.claude/projects` W2 читает, чтобы сверить форму; в репозиторий идут
только синтетические фикстуры.

## Интерфейсы, которые делят двое — у каждого один владелец

### 1. Командная строка скрипта — владелец W2; W1 копирует строки как есть

Вызов на странице: `CLAUDE_PLUGIN_DATA="${CLAUDE_PLUGIN_DATA}" node "${CLAUDE_SKILL_DIR}/scripts/prepare-feedback.mjs" <command> …`.
`<state>` — каталог состояния драйвера (`${CLAUDE_PLUGIN_DATA}`, как `orchestrate/SKILL.md:27`); приватная папка
`<run>` = `<state>/prepare-feedback/<date>-<slug>/`, `<date>` — сегодняшняя, `<slug>` — `[a-z0-9-]`.

| Команда | Аргументы | Делает | Печатает (≤ 20 строк) |
|---|---|---|---|
| `corpus` | `--slug <slug>` и ограничения области: `--plugin entrust\|terse`, `--version <v>` или `<v>..<v>`, `--since YYYY-MM-DD`, `--until YYYY-MM-DD`, `--project <cwd>` (повторяемый), `--session <session-id>` (повторяемый), `--all-sessions` | делает `<run>/` (0700), пишет `corpus/index.json` и `corpus/turns.jsonl` (интерфейс 2). Отбор: сессии с загрузкой плагина (по `--plugin` — только его), сужаемые опциями; `--all-sessions` — все сессии с хотя бы одним человеческим сообщением; исключает сессии с загрузкой страницы prepare-feedback (текущую в том числе), если их id не назван в `--session`. События, счёты, форки, субагенты — как в §3 проекта. Существующий `<run>` — refused 10; суженная после плана область — новый `--slug` | `RUN=<run>`, `PLUGINS=entrust:<n> terse:<n>` (сессии с загрузкой, до фильтра), `HUMAN_SESSIONS=<n>` (все сессии с человеческим сообщением, до фильтра), `PROJECTS=<n>`, `SESSIONS=<n> loaded=<n> cache=<n> checkout=<n> refusals=<n>`, `RANGE=<from>..<to>`, `OLDEST=<date>`, `SELF_RUNS=<n>`, `SUBAGENTS=<n>`, `CODEX_RUNS=<n> reports=<n> rollouts=<n>`, `CHARS=<n> MESSAGES=<n>`, `PARTS_EST=<n>`, по строке `PROJECT=<cwd> sessions=<n>`; при > 20 строк — хвост через runner |
| `parts` | `--run <run>` | режет `corpus/turns.jsonl` на `corpus/parts/P###.md` (~60k символов, перекрытие несколько ходов) и `corpus/pages/P###-NN.md` (≤ 18k); пишет `corpus/parts.json` — для каждой части её страницы и sha256 каждой страницы; повтор — refused 10 | `PARTS=<n> PAGES=<n> LARGEST=<chars>` |
| `add` | `--run <run> --name <relative name> --from <file>` | кладёт файл в `<run>/<name>`; `<name>` — под `ledger/`, `measures/`, `drafts/`, `anonymized/` или ровно `rounds.md`; черновики — `drafts/NN-report.md` (нумерует координатор); существующее имя — refused 10 | `ADDED=<path>` |
| `coverage` | `--run <run> --map <tsv>` | строка карты: `agent-id<TAB>report.json<TAB>P###[,P###]`; по `threadId` отчёта берёт rollout под `$CODEX_HOME/sessions/` или `~/.codex/sessions/`; страница части прочитана, если её текст целиком — подстрока одного вывода команды, сырого или JSON-экранированного; пишет `measures/coverage-<name>.json`, `<name>` — basename `<tsv>` без расширения; существующий файл — refused 10 | `AGENTS=<n> WHOLE=<n> PARTIAL=<n> UNREAD=<n>`, затем по строке на агента с непрочитанным |
| `quotes` | `--run <run> --episodes <jsonl>` | строка — JSON с обязательным `quote` и необязательным `id`, прочие поля проходят в результат; вердикт `exact\|near\|missing` по `corpus/turns.jsonl`, для `near` — ближайшее совпадение и его адрес `t:line`; пишет `ledger/quotes-<name>.json`, `<name>` — basename `<jsonl>` без расширения | `QUOTES=<n> EXACT=<n> NEAR=<n> MISSING=<n>` |
| `tokens` | `--run <run>` и один из `--reports <dir>` (каталог прогона батча или партии: `*/report.json`, поле `tokenUsage.total.totalTokens`) или `--from <tsv>` (`agent<TAB>tokens`, партия Claude-агентов); `[--median <n>]` | считает медиану и максимум партии, пишет `measures/tokens-<name>.json` (`<name>` — basename `<dir>` или `<tsv>`); с `--median` печатает и агентов выше 3× названного числа | `AGENTS=<n> MEDIAN=<n> MAX=<n>` и, с `--median`, `OVER=<n>` и по строке на агента выше линии |
| `export` | `--run <run> --to <relative dir>` | копирует как есть `drafts/*.md`, `rounds.md`, `measures/` и `anonymized/` (если есть) в `<to>/`; `<to>` — относительный путь от рабочего каталога; отказывает (10), если `<to>` существует или лежит под `<state>` | `EXPORTED=<to> FILES=<n>` |
| `--help` | — | все команды, их опции и отказы | — |

**Предложение по правилу Flags для каждой опции** (кто ставит; почему дефолт не решает; что ломается без неё):

- `--plugin` — координатор из слов пользователя или вызова; дефолт «все плагины, что нашлись» не решает, когда `PLUGINS=` называет
  два; без неё корпус `version` мешает загрузки entrust и terse.
- `--version` — пользователь называет релиз в ответе на план («0.20.0», «0.20.0..0.22.0»); дефолт — все версии; без неё
  координатор собирает 11 сессий #15 руками из `index.json` в строки `--session`, и сессия с неверно прочитанной версией
  входит в корпус незамеченной.
- `--since`, `--until` — пользователь называет день сессии (`run`) или окно («с прошлого отчёта»); дефолт — всё хранение; без них —
  та же ручная сборка по id.
- `--project` — пользователь называет каталог («только этот репозиторий»), план показывает `PROJECT=` строками; дефолт — все
  проекты; без неё чужие проекты входят в корпус, хотя пользователь их не показывал.
- `--session` — пользователь называет T-id из плана, координатор переводит его в session id по `index.json`; единственный путь
  вернуть исключённую сессию навыка и единственный точный отбор для `run`; без неё `run` строится через даты и попадает в соседние
  сессии того же дня.
- `--all-sessions` — координатор, когда пользователь после строки `HUMAN_SESSIONS=` говорит «все»; дефолт — сессии с загрузкой
  плагина — не может решить за пользователя, входят ли сессии без плагина; без неё корпус #20 не собрать.
- `--median` — координатор из карточки плана, где стоит стоп-линия; дефолт не решает, потому что план может повторить пилот и
  скрипт не знает, какой `measures/tokens-*.json` план назвал линией; без неё сравнение партий идёт с неверной медианой после
  повторного пилота.
- `--reports` / `--from` — два источника токенов: отчёты Codex-агентов и возвраты Claude-агентов, у которых отчёта нет; один из
  двух обязателен, это операнд, не флаг.
- Снято: `--focus` (поведение от него не зависит), `--date` (потребитель — тест, он читает `RUN=`).

### 2. Разметка приватной папки — владелец W2; страница называет только `<run>` и имена файлов

`corpus/index.json`, `corpus/turns.jsonl`, `corpus/parts/`, `corpus/pages/`, `corpus/parts.json`, `ledger/`, `measures/`,
`drafts/`, `anonymized/`, `rounds.md`. Карта T-id — только в `index.json`; его минимальные поля, на которые ссылается страница:
`sessions[]` с `id` (`T1`…), `session` (uuid), `path` (главный транскрипт), `cwd`, `subagents[]` с `id` (`T1.s1`…) и `path`.
`turns.jsonl` — строка на текстовый ход: `t` (`T3` или `T3.s2`), `line` (номер строки исходного JSONL — адрес проекта `T3:282`),
`role`, `text`. Что именно попадает в `text` (текст ходов, результаты инструментов) — решение W2, названное в `--help`.

### 3. Литерал каталога прогона — владелец `evals/fragments.mjs` (W2 регистрирует, W1 вставляет)

W1 пишет `` `<state>/orchestrate/<project-slug>/<run>/` `` без изменений (`fragments.mjs:154-158` ищет подстроку); W2 добавляет
страницу в `copies`. Пятиполевую схему страница не несёт.

### 4. Имя роли `page dry run` — владелец W1

Строка в roles.md, упоминания в `focuses.md` и на странице — одно имя.

### 5. Описание плагина — владелец W1

Одна строка, одинаковая в `plugin.json` и `marketplace.json`.

### 6. Слова ролей для регистрации плана — владелец W1 (в `focuses.md`), источник — `codex/scripts/agent-run.mjs:416-420`

`implement|writ|worker|build|fix` — worker; `critic|verif|review|refut|judge|check|test|advis` — checking (плюс русские формы
там же). Строка роли: имя из roles.md плюс слово класса.

### 7. Единица батча извлечения — владелец W1 (страница), форма файлов — W2

`{{UNIT}}` swarm'а — путь части `corpus/parts/P###.md`; агент читает часть постранично, по одному `cat` на
`corpus/pages/P###-NN.md`, чтобы `coverage` нашла страницу целиком в одном выводе; карту для `coverage` (интерфейс 1) пишет
координатор из файла units батча и `summary.json` swarm'а.

## Что ещё должно поменяться, чтобы навык ставился и проходил проверки

| Место (проверено по дереву) | Зачем | Кто |
|---|---|---|
| `plugin/.claude-plugin/plugin.json` `version` | не меняется: bump — отдельный коммит владельца; страница берёт `0.22.0` | никто |
| `plugin/.claude-plugin/plugin.json` + `.claude-plugin/marketplace.json` `description` | равенство пинит `package.test.mjs:50-61` | W1 |
| `plugin/README.md` (`:51-57`, `:82`, `:89-90`, `:250-277`) | список навыков и режимов, Layout | W1 |
| `evals/run-all.mjs:23` `SUITES` | иначе `run-all` отказывает стартовать (`:24-29`) | W2 |
| `evals/README.md:14`, `:30` | перечень suites, число копий литерала | W2 |
| `evals/package.test.mjs:151-159` `required` | новый каталог скриптов в полезной нагрузке | W2 |
| `evals/fragments.mjs:44-48` `copies` | литерал каталога прогона на новой странице | W2 |
| четыре новых файла в индексе (`git add -N`) | `package.test.mjs:131-134` читает `git ls-files` | координатор до запуска |
| `ISSUES.md` | дефекты, найденные исполнителями попутно, приходят в `open`; записывает координатор | координатор |
| `.github/workflows/ci.yml` | ничего: `node --check` идёт по `plugin/skills/*/scripts/*.mjs` (`:43`), suites — через `run-all` (`:54`) | никто |
| `evals/orchestrate.test.mjs`, `evals/swarm.test.mjs` | ничего: страницы orchestrate и swarm навык не правит | никто |
| `plugin/skills/codex/scripts/cleanup.mjs` | ничего: `<state>/prepare-feedback/` не перечисляется, как `experiments/` (§9 проекта, п. 4) | никто |
| корневой `README.md`, `RELEASING.md` | ничего: навыков entrust поимённо не перечисляют | никто |

## Тест W2 — что он покрывает

Страница — только интерфейс из этого файла: frontmatter (`name: prepare-feedback`, `disable-model-invocation: true`,
`license: MIT`, `metadata.version` формы `"\d+\.\d+\.\d+"`), строка вызова с отступом в четыре пробела (регулярка по образцу
`experiment.test.mjs:142`), каждая из семи команд названа, форма `<state>/prepare-feedback/<date>-<slug>/`, литерал каталога прогона,
ссылка `references/focuses.md`, тело ≤ 20 000 байт и без `###`; ничего из формулировок §1–§6 не пинить — их пишет W1
одновременно; кейс A0 экспериментальной страницы не копировать (страница читает orchestrate по пути намеренно). Скрипт — на
фикстурах под `tempDir`: два-три синтетических транскрипта JSONL под `$CLAUDE_CONFIG_DIR/projects` (загрузка из кеша с версией,
загрузка из checkout, отказ `tool_result` с `is_error` и именем чужого навыка, цитата маркера в обычном тексте, строка `REPORT=`,
`receiptPath` с `threadId`, форк с теми же ходами, сессия с загрузкой страницы prepare-feedback, каталог `subagents/`, возврат
Agent tool с `totalTokens`); `ENTRUST_STATE_DIR` — временный, `CLAUDE_PLUGIN_DATA` снят; отчёты с `tokenUsage`; rollout с выводом
страницы сырым и JSON-экранированным; TSV для `tokens --from`. Кейсы: `corpus` считает загрузки по `isMeta`, не по тексту; цитата
маркера — не загрузка; версия checkout — `unknown`; чужой навык не в отказах плагина; `PLUGINS=` и `HUMAN_SESSIONS=` печатаются до
фильтра; форк — одна задача; сессия навыка исключена и возвращается через `--session`; повтор `corpus` на тот же `<run>` — 10;
`turns.jsonl` несёт `t`/`line`/`role`/`text` и `line` совпадает с номером строки фикстуры; `parts` держит пределы и пишет
`parts.json`; `add` не перезаписывает и отказывает на имени вне разрешённых; `coverage` различает whole/partial/unread;
`quotes` — exact/near/missing и адрес для `near`; `tokens` — медиана по `--reports` и по `--from`, `OVER` с `--median`; `export` —
относительный путь, копирует `anonymized/` если есть, отказ на существующем и на пути под `<state>`; `--help`; `node --check`.

## Возврат каждого исполнителя

Пять полей orchestrate. `artifacts` — каждый файл, который он создал или изменил, абсолютным путём; `evidence` — W2:
`node evals/prepare-feedback.test.mjs`, `node --check` скрипта, `node evals/fragments.test.mjs`; W1: `node evals/package.test.mjs`,
`node evals/orchestrate.test.mjs`, `node evals/fragments.test.mjs`, хеш прочитанного worktree `issue22-pages`, размер тела страницы
в байтах (`wc -c`); каждая команда через runner с `EXIT=`. Красный кейс, который объясняется незаписанным файлом соседа (пустой
`SKILL.md` у W2, ещё не внесённая страница в `copies` у W1), — в `open`, не правка. `open` — всё, что потребовало бы тронуть чужой
файл (это `blocked`, не правка), и каждый дефект, найденный попутно, с file:line.

## Что исполнители решить не могут (координатор)

- Индекс git: `git add -N` до запуска, `git add` и коммиты после; слияние `main` и разрешение конфликта `ISSUES.md`; порядок PR.
- `node evals/run-all.mjs` целиком — только после обоих возвратов: пока файлы соседа пусты или не зарегистрированы, `run-all`
  красный по причинам вне прав одного исполнителя.
- Проверка страницы против страниц #22 после того, как та ветка изменится: W1 читал снимок и назвал его хеш.
- Живой прогон навыка (первая строка страницы против текста host'а, §9 проекта п. 1) — платно, по слову владельца.
- Число токенов тела страницы: тест меряет байты; токены — только оценка.
