# prepare-feedback: разбиение на исполнителей (Fable F1, к итерации 04)

Два исполнителя Opus пишут одновременно в worktree `.claude/worktrees/prepare-feedback` (ветка `entrust-prepare-feedback`, от `main` d1c7ee5 (хеш в переписанной истории) плюс три коммита: E91 и research-папка прогона). Проект — `F1-design-04.md`. Каждое место в дереве ниже проверено по ветке 2026-09-29; адреса — относительно `plugins/entrust/`.

## Предусловия (координатор, до запуска исполнителей)

1. **Ветка `entrust-issue22-pages` в этом worktree.** Страница навыка ссылается на правила, которых на `entrust-prepare-feedback` ещё нет (`EFFORT: high` bulk-ряда, пилот перед фан-аутом, стоп-линия 3×, swarm как маршрут батча; `orchestrate/SKILL.md:37,67-68,77,127,133`, `swarm/SKILL.md:17` на той ветке), и `evals/orchestrate.test.mjs` там пинит новые формулировки (D8, D14, D15, C10b, F7). Влить `entrust-issue22-pages` в `entrust-prepare-feedback` до старта; иначе W1 пишет ссылки на текст, которого в дереве нет, а пины расходятся.
2. Исполнители не коммитят: два коммита в одном worktree одновременно ломают индекс. Каждый возвращает список своих файлов; координатор прогоняет `node evals/run-all.mjs` и коммитит по темам (одна тема — один коммит, без вопроса, по правилу worktree владельца).
3. Каждому исполнителю — этот файл, `F1-design-04.md`, страницы `orchestrate/SKILL.md`, `swarm/SKILL.md`, `experiment/SKILL.md`, `references/roles.md`, `references/foreman.md` по абсолютному пути, `experiment/scripts/experiment.mjs` и `evals/experiment.test.mjs` как образцы, и фраза: «финальный текст — возврат координатору, не сообщение человеку».

## W1 — страница и её окружение

**Владеет:**

| Файл | Что делает |
|---|---|
| `plugin/skills/prepare-feedback/SKILL.md` | новый: frontmatter (`name: prepare-feedback`, `description` — триггерные слова первыми, `disable-model-invocation: true`, `metadata.version` = версия в `plugin/.claude-plugin/plugin.json`, сейчас `0.22.0`, `license: MIT`); тело по §1–§6 проекта, до 5 000 токенов; первая строка — фраза E82 из §1; страница называет команды скрипта строками из раздела «Интерфейсы» без изменений и несёт литерал `` `<state>/orchestrate/<project-slug>/<run>/` `` точно в этой форме (фрагмент `run-directory` в `evals/fragments.mjs:44-48`) |
| `plugin/skills/prepare-feedback/references/focuses.md` | новый: по разделу на фокус — единица, закрытые метки, раскладка выхода с эталоном (#15/#16, #1/#22, #20), способ чтения, когда звать page dry run и blind proposer'ов, слова ролей для строк плана (§4 п. 4); линза «полезность ролей» — подраздел `version` |
| `plugin/skills/orchestrate/references/roles.md` | одна строка `| page dry run | … |` семью колонками, начинается со строчной буквы (пин E9 `evals/orchestrate.test.mjs:859-862`: заголовок из семи колонок, ≥ 15 строк); «May write» — `nothing`; «Tier» — `strong`; «Record» — #15 (два dry run страниц, `issue #15`, «Audit composition»). Остальные строки не трогать: E10 (`:872-904`) пинит их фразы |
| `plugin/README.md` | абзац о седьмом навыке после абзаца «Two more are experiments…» (`:51-57`); `:82` «all six skills» → семь; `:89-90` список режимов + `/entrust:prepare-feedback`; блок Layout (`:250-266`) — строка `skills/prepare-feedback/` |
| `plugin/.claude-plugin/plugin.json` и `.claude-plugin/marketplace.json` | `description` дополнить одинаково в обоих (пин `evals/package.test.mjs:50-61`: строки равны байт в байт) |
| `CHANGELOG.md` | под `## Unreleased`: `### Added` — навык (одно предложение: что появилось и почему это стоило делать: пять ручных прогонов за #1, #15, #16, #20, #22 и #21); `### Changed` — строка roles.md; README и манифесты; и строка W2 (текст ниже) — файл целиком у W1 |

**Не трогает:** `orchestrate/SKILL.md`, `swarm/SKILL.md`, лаунчер, `evals/`, `ISSUES.md`.

**Проверки, которые читают его файлы:** `evals/package.test.mjs` — одна версия во всех `skills/*/SKILL.md` (`:33-47`), каждая markdown-ссылка страницы ведёт в отслеживаемый файл (`:167-174`: `focuses.md` должен быть в `git add`), ни одна страница не называет модель Codex с версией (`:113`); `evals/orchestrate.test.mjs` E9/E10 для roles.md; `evals/fragments.test.mjs` — литерал каталога прогона, когда W2 внесёт страницу в `copies`.

## W2 — скрипт и его тест

**Владеет:**

| Файл | Что делает |
|---|---|
| `plugin/skills/prepare-feedback/scripts/prepare-feedback.mjs` | новый: команды из раздела «Интерфейсы»; шапка-комментарий и `--help` в форме `experiment.mjs:1-22`; окружение `ENTRUST_STATE_DIR`, иначе `CLAUDE_PLUGIN_DATA` (абсолютный, без своего дефолта), корень транскриптов — `$CLAUDE_CONFIG_DIR/projects`, иначе `~/.claude/projects`; выходы 0 / 2 usage / 10 refused / 1 write failed, как у experiment.mjs; ничего не перезаписывает; `node --check` проходит (CI `.github/workflows/ci.yml:43` проверяет `plugin/skills/*/scripts/*.mjs`) |
| `evals/prepare-feedback.test.mjs` | новый, по образцу `evals/experiment.test.mjs` (шапка, `registry`, `runCases`, `summarize`, `tempDir`, `spawnNode` из `evals/lib/harness.mjs`); последняя строка — счёт кейсов |
| `evals/run-all.mjs` | `SUITES` (`:23`) — добавить `"prepare-feedback"` после `"experiment"`; без этого `run-all` завершается с кодом 2 (`:24-29`) |
| `evals/README.md` | `:14` «lists the twenty» → twenty-one, имя в перечне |
| `evals/package.test.mjs` | список `required` (`:151-159`): добавить `...under("skills/prepare-feedback/scripts")` — сейчас там только experiment, swarm и orchestrate, и неотслеженный скрипт нового навыка проверка не заметит |
| `evals/fragments.mjs` | `copies` фрагмента `run-directory` (`:44-48`): добавить `"skills/prepare-feedback/SKILL.md"` |

**Не трогает:** страницы навыков, roles.md, README плагина, манифесты, CHANGELOG (свою строку отдаёт W1 текстом, см. ниже).

**Строка CHANGELOG для W1 (текст W2, файл W1):** «`evals/prepare-feedback.test.mjs` проверяет скрипт навыка на синтетических транскриптах и отчётах; `package.test.mjs` включает `skills/prepare-feedback/scripts` в проверку полезной нагрузки, потому что список там задан вручную и новый каталог скриптов иначе не проверяется».

## Интерфейсы, которые делят двое — у каждого один владелец

### 1. Командная строка скрипта — владелец W2; W1 копирует строки как есть

Вызов на странице (одна форма, как у experiment): `CLAUDE_PLUGIN_DATA="${CLAUDE_PLUGIN_DATA}" node "${CLAUDE_SKILL_DIR}/scripts/prepare-feedback.mjs" <command> …`. Приватная папка `<run>` = `<state>/prepare-feedback/<date>-<slug>/`; `<state>` — каталог состояния драйвера.

| Команда | Аргументы | Делает | Печатает (≤ 20 строк) |
|---|---|---|---|
| `corpus` | `--slug <slug> --focus version\|run\|feedback\|custom` и ограничения области: `--plugin entrust\|terse`, `--version <v>` или `<v>..<v>`, `--since D`, `--until D`, `--project <cwd>` (повторяемый), `--session <id>` (повторяемый), `--all-sessions`, `[--date YYYY-MM-DD]` | делает `<run>/` (0700) и `corpus/index.json`: T-id ↔ session id ↔ `cwd`, даты, версия и путь загрузки, события (загрузки, отказы с именем навыка, `REPORT=`/`threadId`/`receiptPath`), субагенты `T#.s#`, счёты (человеческие сообщения, символы, токены по `usage`), форки одной задачей; исключает сессии с загрузкой страницы prepare-feedback, если их id не назван в `--session` | `RUN=<run>`, `PROJECTS=<n>`, `SESSIONS=<n> loaded=<n> cache=<n> checkout=<n> refusals=<n>`, `RANGE=<from>..<to>`, `OLDEST=<date>`, `SELF_RUNS=<n>`, `SUBAGENTS=<n>`, `CODEX_RUNS=<n> reports=<n> rollouts=<n>`, `CHARS=<n> MESSAGES=<n>`, `PARTS_EST=<n>`, по строке на проект `PROJECT=<cwd> sessions=<n>`; при > 20 строк — хвост через runner |
| `parts` | `--run <run>` | режет `corpus/turns.jsonl` на `corpus/parts/P###.md` (~60k символов, перекрытие несколько ходов) и `corpus/pages/P###-NN.md` (≤ 18k); пишет `corpus/parts.json` с sha256 каждой страницы | `PARTS=<n> PAGES=<n> LARGEST=<chars>` |
| `add` | `--run <run> --name <relative name> --from <file>` | кладёт файл в `<run>/<name>` под `ledger/`, `measures/`, `drafts/` или `rounds.md`; существующее имя — refused (10) | `ADDED=<path>` |
| `coverage` | `--run <run> --map <tsv>` (`agent-id<TAB>report.json<TAB>P###[,P###]`) | по rollout'у агента (`threadId` из отчёта; `~/.codex/sessions/` или `$CODEX_HOME/sessions/`): страница прочитана, если её текст целиком — подстрока одного вывода команды, сырого или JSON-экранированного; пишет `measures/coverage-<name>.json` | `AGENTS=<n> WHOLE=<n> PARTIAL=<n> UNREAD=<n>`, затем по строке на агента с непрочитанным |
| `quotes` | `--run <run> --episodes <jsonl>` | каждая цитата — точное вхождение в `corpus/turns.jsonl`; пишет `ledger/quotes-<name>.json` с вердиктом `exact\|near\|missing` и ближайшим совпадением для `near` | `QUOTES=<n> EXACT=<n> NEAR=<n> MISSING=<n>` |
| `tokens` | `--run <run> --reports <dir>` (каталог прогона батча или партии) `[--median <n>]` | суммирует `tokenUsage.total.totalTokens` каждого `*/report.json`; без `--median` печатает медиану партии и пишет `measures/tokens-<name>.json`; с `--median` — агентов выше 3× | `REPORTS=<n> MEDIAN=<n> MAX=<n> OVER=<n>`, затем по строке на агента выше линии |
| `export` | `--run <run> --to <relative dir>` | копирует `drafts/*.md` как `NN-report.md`, `rounds.md`, `measures/` в `<to>/`; отказывает, если `<to>` существует или лежит под `<state>` | `EXPORTED=<to> FILES=<n>` |
| `--help` | — | все команды и их отказы | — |

Каждая опция области — слова пользователя из ответа на план, которые иначе до скрипта не дойдут; дефолт без опций — все сессии с загрузкой плагина за всё хранение. Других флагов нет; `--median` — число из предыдущего вывода `tokens`, потому что скрипт не хранит состояние между вызовами.

### 2. Разметка приватной папки — владелец W2; страница называет только `<run>`

`corpus/index.json`, `corpus/turns.jsonl`, `corpus/parts/`, `corpus/pages/`, `corpus/parts.json`, `ledger/`, `measures/`, `drafts/`, `rounds.md`. Карта T-id — только в `index.json`.

### 3. Литерал каталога прогона — владелец `evals/fragments.mjs` (W2 регистрирует, W1 вставляет)

W1 пишет на странице `` `<state>/orchestrate/<project-slug>/<run>/` `` без изменений; W2 добавляет страницу в `copies`. Пятиполевую схему страница не несёт: она у orchestrate, который читается по пути.

### 4. Имя роли `page dry run` — владелец W1

Строка в roles.md и упоминания в `focuses.md` и на странице — одно имя.

### 5. Описание плагина — владелец W1

Одна строка, одинаковая в `plugin.json` и `marketplace.json`.

### 6. Слова ролей для регистрации плана — владелец W1 (в `focuses.md`), источник — `codex/scripts/agent-run.mjs:416-419`

`implement|writ|worker|build|fix` — worker; `critic|verif|review|refut|judge|check|test|advis` — checking. Строка роли: имя из roles.md плюс слово класса.

## Что ещё должно поменяться, чтобы навык ставился и проходил проверки

| Место (проверено по дереву) | Зачем | Кто |
|---|---|---|
| `plugin/.claude-plugin/plugin.json` `version` | не меняется: bump — отдельный коммит владельца; страница берёт ту же `0.22.0` | никто |
| `plugin/.claude-plugin/plugin.json` + `.claude-plugin/marketplace.json` `description` | равенство пинит `package.test.mjs:50-61` | W1 |
| `plugin/README.md` (`:51-57`, `:82`, `:89-90`, `:250-266`) | список навыков и режимов, Layout | W1 |
| `evals/run-all.mjs:23` `SUITES` | иначе `run-all` отказывает стартовать (`:24-29`) | W2 |
| `evals/README.md:14` | перечень и счёт suites | W2 |
| `evals/package.test.mjs:151-159` `required` | новый каталог скриптов в полезной нагрузке | W2 |
| `evals/fragments.mjs:44-48` `copies` | литерал каталога прогона на новой странице | W2 |
| `git add` новых файлов | `package.test.mjs` читает `git ls-files`: неотслеженный `focuses.md` или скрипт — красный тест | координатор при коммите |
| `.github/workflows/ci.yml` | ничего: `node --check` идёт по `plugin/skills/*/scripts/*.mjs` (`:43`), suites — через `run-all` (`:54`) | никто |
| `evals/orchestrate.test.mjs`, `evals/swarm.test.mjs` | ничего: страницы orchestrate и swarm навык не правит | никто |
| `plugin/skills/cleanup/scripts/cleanup.mjs` | ничего: `<state>/prepare-feedback/` не перечисляется, как `experiments/` | никто |

## Тест W2 — что он покрывает

Страница — только интерфейс из этого файла: frontmatter (имя, `disable-model-invocation: true`, `metadata.version`), страница называет каждую из семи команд скрипта, форму `<state>/prepare-feedback/<date>-<slug>/` и литерал каталога прогона; ничего из формулировок §1–§6 не пинить — их пишет W1 одновременно. Скрипт — на фикстурах под `tempDir`: два-три синтетических транскрипта JSONL (загрузка из кеша с версией, загрузка из checkout, отказ `tool_result` с `is_error` и именем чужого навыка, строка `REPORT=`, `receiptPath` с `threadId`, форк с теми же ходами, сессия с загрузкой страницы prepare-feedback, каталог `subagents/`) под `$CLAUDE_CONFIG_DIR/projects`; `ENTRUST_STATE_DIR` — временный, `CLAUDE_PLUGIN_DATA` снят; отчёты с `tokenUsage` и rollout с выводом страницы сырым и JSON-экранированным. Кейсы: `corpus` считает загрузки по `isMeta`, а не по тексту; версия checkout — `unknown`; чужой навык не в отказах плагина; форк — одна задача; сессия навыка исключена и возвращается через `--session`; `parts` держит пределы; `add` не перезаписывает; `coverage` различает whole/partial/unread; `quotes` — exact/near/missing; `tokens` — медиана и `OVER`; `export` — относительный путь, отказ на существующем и на пути под `<state>`; `--help` и `node --check`.

## Возврат каждого исполнителя

Пять полей orchestrate. `artifacts` — каждый файл, который он создал или изменил, абсолютным путём; `evidence` — `node evals/prepare-feedback.test.mjs` (W2) и `node evals/package.test.mjs`, `node evals/orchestrate.test.mjs` (W1) со счётом, каждая команда через runner с `EXIT=`; `open` — всё, что потребовало бы тронуть чужой файл (это `blocked`, не правка).
