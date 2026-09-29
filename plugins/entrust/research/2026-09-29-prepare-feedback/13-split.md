# prepare-feedback: разбиение на исполнителей (Fable F1, итерация 06 — фокусы `process` и `all`)

2026-09-29. Дельта `F1-design-05.md` поверх написанного навыка на ветке `entrust-prepare-feedback` (worktree
`.claude/worktrees/prepare-feedback`, HEAD — слияние с main 0b2ee40 после #22, дерево чистое). Два исполнителя Opus пишут
одновременно в этом worktree. Адреса — относительно `plugins/entrust/`; строки — по файлам на этом HEAD.

## Предусловия (координатор, до запуска исполнителей)

1. Все файлы навыка уже отслежены; `git add -N` не нужен. Индекса и коммитов исполнители не касаются.
2. Исполнители не коммитят. После обоих возвратов координатор прогоняет `node evals/run-all.mjs` и коммитит по темам:
   (а) страница, `focuses.md`, README, CHANGELOG; (б) скрипт и тест. Версию не трогает никто.
3. Каждому исполнителю — этот файл, `F1-design-05.md`, и из worktree по абсолютному пути: `plugin/skills/prepare-feedback/SKILL.md`,
   `references/focuses.md`, `scripts/prepare-feedback.mjs`, `evals/prepare-feedback.test.mjs`, `plugin/skills/orchestrate/SKILL.md`,
   `plugin/skills/swarm/SKILL.md`, `plugin/skills/orchestrate/references/roles.md`; фраза «финальный текст — возврат
   координатору, не сообщение человеку». Команды длиннее 20 строк — через runner `plugin/skills/orchestrate/scripts/capture-check.mjs`
   по абсолютному пути, `EXIT=` каждого запуска в `evidence`.

## W1 — страница и её окружение

**Владеет:**

| Файл | Что делает |
|---|---|
| `plugin/skills/prepare-feedback/SKILL.md` | `:3-7` описание — «where their time and tokens went, or all of these at once»; «Focus and scope» (`:24-27`) — пункты `process` после `run` и `all` после `feedback` по §1–§2 проекта; список «Beside orchestrate's card the plan shows» (`:41-48`) — маркер про стоимость по фокусам под `all`; «Two ways of reading» — `(version, run)` → `(version, run, process)` в `:62`, фраза про бриф читателя со строками `measures/process.json` и вопросом о повторах, ожиданиях, лишних проверках и раундах, абзац про `all` (один бриф на задачу со всеми вопросами; `feedback` — извлечение по тому же корпусу); пять пунктов `:56-57` — правки R1 и R2 из §0 проекта; «The output» (`:68`) — под `all` один черновик, заголовок формы `<plugin> <release or window> field report: <headline findings>`, раздел на фокус в порядке меню; `:70` — `process.json` в одной фразе с `coverage-*.json` и `tokens-*.json`; «The private folder» (`:93-99`) — строка `process --run <run>` после `tokens`, текст из интерфейса 1. Бюджет: тело ≤ 20 000 байт (сейчас 15 570), без `###`; не влезает — подробности в `focuses.md` |
| `plugin/skills/prepare-feedback/references/focuses.md` | строка Contents (`:3-4`) — `process` и `all`; новый раздел `## process` после `## run` (`:45-64`) по §1 проекта: Unit, Labels, Layout, Reading, Judge (два, как #16), Refuter; абзац линзы (`:33-43`) уходит из `version` целиком; новый раздел `## all` перед «A question in the user's words» (`:86`): один корпус, один план со строкой стоимости на фокус, один бриф на задачу для читателей, извлечение для `feedback`, один отчёт с разделом на фокус в порядке меню, один рецензент и один критик; «Role words» без изменений |
| `plugin/README.md` | `:59-62` — перечень фокусов: «(a release, one run, where its time and tokens went, your feedback on a topic, all of these at once, or a question of your own)» |
| `CHANGELOG.md` | `:10-14` пункт Added про навык — тот же перечень фокусов и одно предложение про `process` и `all` с причиной (#15: доля координатора 51 %; #16: полезность ролей; #22: цены как сопоставимые); строка W2 (текст ниже) — в тот же `### Added`, отдельным пунктом после `evals/prepare-feedback.test.mjs` (`:15-17`) |

**Не трогает:** скрипт, тесты, `orchestrate/SKILL.md`, `swarm/SKILL.md`, `roles.md`, манифесты (`plugin.json` и
`marketplace.json` фокусов не перечисляют — проверено), `ISSUES.md`.

**Проверки, которые читают его файлы:** `evals/prepare-feedback.test.mjs` — бюджет тела и два уровня заголовков (`:45-52`),
строка вызова (`:54-57`), каждая команда из `COMMANDS` в обратных кавычках (`:59-64`; после правки W2 — восемь, включая
`process`), обе формы каталогов (`:66-71`), ссылка на `focuses.md` (`:73`); `evals/package.test.mjs` — версия, ссылки,
модели без версии; `evals/fragments.test.mjs` — литерал каталога прогона на странице.

## W2 — скрипт и его тест

**Владеет:**

| Файл | Что делает |
|---|---|
| `plugin/skills/prepare-feedback/scripts/prepare-feedback.mjs` | в `scan` (`:346-385`) и `gather` (`:434-500`) — счёты §3 проекта на задачу: `apiCalls`, `wallMs`, `activeMs` (промежутки ≤ 600 000 мс), `gaps[]` (до десяти, {ms, after, at}), `tools` {имя: счёт}, `repeats[]` ({sha256, chars, count, at[]} — без текста команды), `outputs[]` (десять, {tool, bytes, at}); у субагентов те же счёты в их строках `subagents[]`, где это даёт транскрипт субагента; в `resolveRuns`/`gather` — у каждого запуска `codex[]` с отчётом поля `model`, `effort`, `tokens`, `cached`, `wallMs`, `commandMs`, `modelMs`, `exitCode`, `turnStatus`, `commandsSucceeded`, `commandsFailed`, `commandsDeclined` (ключи отчёта драйвера 0.22.0: `timing.{wallMs,commandMs,modelMs}`, `tokenUsage.total.{totalTokens,cachedInputTokens}`, верхнеуровневые `model`, `effort`, `exitCode`, `turnStatus`, `commandsSucceeded`, `commandsFailed`, `commandsDeclined` — сверены с реальным отчётом); новая команда `process` (интерфейс 1) в `OPTIONS` (`:52`), `COMMANDS`, диспетчере (`:990`), шапке (`:6-14`) и `usage()` (`:80-127`); `node --check` проходит |
| `evals/prepare-feedback.test.mjs` | `COMMANDS` (`:24`) — восемь; заголовок кейса `:59` — «eight commands»; фикстура транскрипта — метки времени с одним промежутком > 600 с, одна команда Bash дважды, один большой результат инструмента, несколько имён инструментов, отчёт Codex с `timing`, `tokenUsage.total`, `commandsSucceeded/Failed/Declined`; новые кейсы по разделу «Тест W2»; последняя строка — счёт кейсов |

**Не трогает:** страницу, `focuses.md`, README, CHANGELOG (свою строку отдаёт W1 текстом), `run-all.mjs`, `package.test.mjs`,
`fragments.mjs`, `evals/README.md` — ни один из них от новой команды не зависит (проверено: suite уже в `SUITES`, каталог
скриптов уже в `required`, литерал уже в `copies`).

**Строка CHANGELOG для W1 (текст W2, файл W1):** «`prepare-feedback.mjs corpus` records per task the calls, wall and active
time, the gaps over ten minutes, the tool uses, the repeated commands and the largest outputs, and per Codex run the
report's model, effort, tokens, timing and command counts, and `process --run <run>` sums them into
`measures/process.json`, because the `process` focus asks where a run's time and tokens went and no page or script
counted it before».

## Интерфейсы, которые делят двое — у каждого один владелец

### 1. Команда `process` — владелец W2; W1 копирует строку как есть

Строка на странице: `process --run <run>`: reads `corpus/index.json`, writes `measures/process.json` with a row per task, a
row per agent and the totals, and prints `TASKS=`, `WALL=`, `ACTIVE=` with `GAP=600s`, `GAPS=` with the largest and its
address, `COORD=` with its share, cache-read share and `api_calls=`, `AGENTS=`, `CODEX=` with `nonzero_exit=`, `TOOLS=`, `REPEATS=`
with the most repeated command's count and address, `OUTPUTS=` with the largest and its address, then `FILE=`.
Не больше 20 строк; повтор на существующий `process.json` — refused 10; до `corpus` — refused 10; никаких опций сверх `--run`.

### 2. Форма `measures/process.json` — владелец W2; `focuses.md` называет файл и поля строки агента

Верхний уровень: `gap` (600), `tasks[]`, `agents[]`, `totals`. Строка задачи: `id`, `wallMs`, `activeMs`, `apiCalls`, `tokens`
{input, cacheWrite, cacheRead, output}, `tools`, `gaps[]`, `repeats[]`, `outputs[]`, `agentTokens`, `codexTokens`. Строка агента:
`id` (`T3.s2` или `run:<id>`), `task`, `model`, `type` (для субагента `meta.agentType`; для Codex — `codex`), `tokens`,
`durationMs` (у Codex — `wallMs`), `toolUses` (у Codex — `commandsSucceeded`), `exit` (у Codex — `exitCode`; у субагента —
`null`). Ни одно поле не несёт текста команды, брифа или описания: `description` субагента остаётся в `index.json`.

### 3. Имена фокусов `process` и `all` — владелец W1

Меню на странице, разделы `focuses.md`, README и CHANGELOG — одни имена.

### 4. Пин «eight commands» — владелец W2 (тест), W1 называет `process` в обратных кавычках на странице

`COMMANDS` в тесте и список команд на странице совпадают по восьми именам.

### 5. Строка CHANGELOG для скрипта — текст W2, файл W1

## Что ещё должно поменяться, чтобы навык ставился и проходил проверки

| Место (проверено по дереву) | Зачем | Кто |
|---|---|---|
| `evals/prepare-feedback.test.mjs:24` `COMMANDS`, `:59` заголовок кейса | восемь команд | W2 |
| `evals/run-all.mjs`, `evals/package.test.mjs`, `evals/fragments.mjs`, `evals/README.md` | ничего: suite, каталог скриптов и литерал уже зарегистрированы (`run-all.mjs:23`, `package.test.mjs:151-159`, `fragments.mjs:44-48`) | никто |
| `plugin/.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json` | ничего: описание не перечисляет фокусы («a feedback mode that turns your own sessions into a report on a plugin») | никто |
| `plugin/skills/orchestrate/references/roles.md` | ничего: строка `page dry run` уже есть; `process` новых ролей не вводит | никто |
| `.github/workflows/ci.yml` | ничего: `node --check` по `plugin/skills/*/scripts/*.mjs`, suites через `run-all` | никто |
| `plugins/entrust/research/2026-09-29-prepare-feedback/` | итерация 05 и этот split как следующие нумерованные файлы, `rounds.md` и README — после ревью приватности | координатор |

## Тест W2 — что он покрывает

Страница — как прежде, только интерфейс: восемь команд названы (`process` среди них); остальное без изменений. Скрипт — на
фикстурах под `tempDir`, синтетических: транскрипт с метками времени (одна пауза > 600 с после текста ассистента, остальные
короче), одна команда Bash, запущенная дважды, один результат инструмента заметно больше прочих, `tool_use` хотя бы трёх
имён, возврат Agent tool с `totalTokens`/`totalDurationMs`/`totalToolUseCount`, строка `REPORT=` с отчётом, где есть `timing`,
`tokenUsage.total`, `model`, `effort`, `exitCode`, `turnStatus`, `commandsSucceeded`, `commandsFailed`, `commandsDeclined`.
Кейсы: `corpus` пишет в строку задачи `apiCalls`, `wallMs`, `activeMs` (пауза не входит), `gaps` с адресом и `after`, `tools` по
именам, `repeats` с `count` 2 и двумя адресами и без текста команды, `outputs` с самым большим первым; строка запуска `codex[]`
несёт поля отчёта; `process` печатает названные строки, `FILE=` последней, пишет `process.json` с `tasks`, `agents`, `totals` и
`gap`, и ни одно строковое поле в нём не равно тексту команды или описанию агента; `process` до `corpus` — 10; повтор — 10;
`--help` называет `process`; `node --check`.

## Возврат каждого исполнителя

Пять полей orchestrate. `artifacts` — каждый файл, который он создал или изменил, абсолютным путём; `evidence` — W2:
`node evals/prepare-feedback.test.mjs`, `node --check` скрипта; W1: `node evals/prepare-feedback.test.mjs` (пины страницы),
`node evals/package.test.mjs`, `node evals/fragments.test.mjs`, размер тела страницы в байтах; каждая команда через runner с
`EXIT=`. Красный кейс, который объясняется незаписанным файлом соседа (страница ещё без `process` у W2, тест ещё с семью
командами у W1), — в `open`, не правка. `open` — всё, что потребовало бы тронуть чужой файл, и каждый дефект, найденный
попутно, с file:line.

## Что исполнители решить не могут (координатор)

- Коммиты и порядок тем; строки research-папки и `rounds.md`.
- `node evals/run-all.mjs` целиком — только после обоих возвратов.
- Раскладка `process` без эталона-issue: первый отчёт читает владелец.
- Живой прогон навыка — платно, по слову владельца.
