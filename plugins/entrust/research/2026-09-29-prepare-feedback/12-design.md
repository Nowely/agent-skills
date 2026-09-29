# prepare-feedback: итерация 05 — дельта к написанному навыку

2026-09-29. База — навык, как он написан на ветке `entrust-prepare-feedback` (worktree `.claude/worktrees/prepare-feedback`, HEAD 754b8e4 = merge main после PR #33): `plugins/entrust/plugin/skills/prepare-feedback/SKILL.md` (101 строка, тело 15 570 байт при пине 20 000), `references/focuses.md`, `scripts/prepare-feedback.mjs` (семь команд), `evals/prepare-feedback.test.mjs` (28 кейсов). Не F1-design-04. Вход — решения владельца от 2026-09-29: четвёртый фокус `process`; `all` — все стандартные фокусы над одним корпусом одним планом; один сводный отчёт; никаких новых флагов сверх правила Flags. Каждая правка ниже названа вместе с разделом или файлом, куда она ложится; адреса — `SKILL.md:<строка>` написанной страницы.

## 0. Сверка страницы со страницами #22 на main

Проверено по worktree после слияния (orchestrate `SKILL.md:40, 69, 77-78`, swarm `SKILL.md:17-29`, `ISSUES.md` E89 `:436`, E90 `:463`, CHANGELOG Unreleased).

| # | Где на странице | Что говорит main | Вердикт |
|---|---|---|---|
| R1 | `SKILL.md:57`, пункт 2 «A batch's unit is a corpus part» | orchestrate `:69`: «The unit of a bulk fan-out is either one part of the material for extraction, with a fixed answer schema, or one claim…» — единица извлечения теперь определена самим orchestrate | **правка**: пункт 2 говорит, что единица батча — единица извлечения orchestrate (часть материала с фиксированной схемой ответа); сверх страниц остаётся одно — страница swarm знает только единицу-вердикт, поэтому `{{UNIT}}` несёт путь части |
| R2 | `SKILL.md:56`, пункт 1 «in place of the typed `/entrust:swarm` the swarm page asks for» | orchestrate `:69`: батч единиц-вердиктов — swarm, который запускает только пользователь; «a batch of extraction units runs as ordinary Codex agents, launched as Mechanism below says», то есть по обёртке на агента | **правка**: пункт 1 называет оба переопределения — swarm запускается «go» плана вместо набранного `/entrust:swarm`, и батч извлечения идёт через `swarm.mjs`, а не обычными Codex-агентами с обёрткой, потому что #22 насчитал ~13k токенов на обёртку при 456 запусках; E90 записывает, что у извлечения маршрута батча нет |
| R3 | `SKILL.md:64` «in place of the swarm page's "go" that covers the pilot and the swarm» | swarm (merged): «its "go" covers the pilot and then the swarm» | совпадает; без правки |
| R4 | `SKILL.md:58-60`, пункты 3–5 (свой каталог без плана; слово класса роли; `tokens`/`coverage`) | E89 и E90 на ветке открыты без изменений; сводка swarm'а токенов не несёт | без правки |
| R5 | `SKILL.md:62`, стоп-линия «an agent over three times it stops further launches until the user has seen a new estimate»; эффорт на странице не назван | orchestrate `:40` — та же фраза; `:77` — `high` для bulk-ряда, если пилот не выбрал иного | совпадает; без правки |
| R6 | `SKILL.md:64` `--concurrency` = число ядер с причиной в плане | swarm `:23` — `--concurrency <n>`, дефолт скрипта 10 | выбор внутри правила; без правки |

## 1. Фокус `process`

**Что это.** Куда уходят время и токены: по ролям и по агентам и доля самого координатора (#15: контекст главной сессии — 51 % токенов, 96 % из них — чтение кеша); wall time против активного времени и где прогон ждал; повторы, застревания, лишние проверки и раунды; заработала ли каждая роль своё место (линза полезности ролей из #16 переезжает сюда из `version`; `version` оставляет себе cost profile); к каждой находке — предложение с ожидаемой экономией.

**Куда ложится:**

| Правка | Файл, раздел |
|---|---|
| Пункт меню: `process`: where the time and tokens of the runs went, by role and by agent and the coordinator's own share, wall time against active time and where the run waited, repeats, stalls, redundant checks and rounds, and whether each role earned its place; every finding ends in a proposal with its expected saving | `SKILL.md` «Focus and scope», после `run` |
| Описание навыка в frontmatter дополняется «where their time and tokens went, or all of these at once» | `SKILL.md:3-7` |
| Чтение: `process` читается читателями с вопросом; бриф каждого читателя несёт строки его задачи из `measures/process.json` (§3) и вопрос, на какие повторы, ожидания, лишние проверки и раунды числа указывают, с адресами; замерщик — только там, где утверждается число, которого скрипт не даёт (например, состав контекста координатора по источникам, как считал #15); два судьи для строк полезности ролей, как держал #16, и опровергатель на спорные строки | `SKILL.md` «Two ways of reading», абзац «Readers with a question»: `(version, run)` → `(version, run, process)`; фраза про судью — «A judge only where the focus's reference had one» остаётся, `process` называет своих в focuses.md |
| Команда `process --run <run>` в списке команд и фраза, что `process.json` держит счёты, хеши и адреса и не требует ревью — той же строкой, что `coverage-*.json` и `tokens-*.json` (`SKILL.md:70`) | `SKILL.md` «The private folder», после `tokens`; «The output», `:70` |
| Раздел `## process`: Unit — a finding about where a run's time or tokens went, or one agent launch for the usefulness rows; Labels — measured or hypothesis; Level; Refuter; for a launch: used, decisive, miss, harm, unknown (перенос из `version`); Layout — title `<plugin> <release or window>: where the time and tokens went`; Summary; Cost by role and by agent (роли — по карточке плана в транскрипте, которую читатель пересказывает; агенты — строки `process.json`); The coordinator's share; Wall time against active time and where the run waited; Repeats, stalls, redundant checks and rounds; Whether each role earned its place (таблица по меткам #16); Proposals, each with its expected saving, measured baseline first; Method and limits. Reading — readers with a question over `process.json`; two judges on the usefulness rows; a refuter on disputed rows; a measurer's script only for a number the script does not give | `focuses.md`, новый раздел после `run`; строка Contents |
| Из `version` уходит абзац «The lens of role usefulness (issue #16)» целиком; остаётся cost profile в раскладке #15 | `focuses.md:33-43` |
| Абзац README: «(a release, one run, your feedback on a topic, or a question of your own)» → «(a release, one run, where its time and tokens went, your feedback on a topic, all of these at once, or a question of your own)» | `plugin/README.md:59-62` |
| Пункт CHANGELOG Added про навык: та же вставка в перечень фокусов; ещё одно предложение: `process` и `all`, почему (#15: доля координатора; #16: полезность ролей; владелец 2026-09-29) | `CHANGELOG.md:10-14` |

Манифесты (`plugin.json`, `marketplace.json`) фокусов не перечисляют — без правки. Тест страницы пинит «seven commands» и массив `COMMANDS` — становится восемь (§4).

## 2. `all`

**Что это.** Все стандартные фокусы над одним корпусом, одним планом и одним отчётом.

| Правка | Файл, раздел |
|---|---|
| Пункт меню: `all`: every standard focus over one corpus in one run: `version`, `run` and `process` by the same readers, one brief per task carrying all their questions; `feedback` by extraction | `SKILL.md` «Focus and scope», после `feedback` |
| План под `all` показывает стоимость по фокусам, чтобы пользователь снимал фокусы словами: строка читателей (общая для `version`, `run`, `process`), строка `version` (page dry run, два blind proposer'а, проверка `Recurring` по CHANGELOG), строка `process` (два судьи, опровергатель, `process`), строка `feedback` (пилот, батчи, покрытие, цитаты, анализы, stress-тест, судья — самая дорогая), и общие для всех: критик разбиения, dedup-and-rank, рецензент, критик полноты. Снятый фокус убирает свои строки и свой раздел отчёта | `SKILL.md` «Focus and scope», список «Beside orchestrate's card the plan shows» — новый маркер |
| Чтение: под `all` один бриф на задачу несёт вопросы всех выбранных фокусов читателей; возврат — по разделу на фокус с адресами; извлечение для `feedback` идёт своей цепочкой по тому же корпусу (`parts` над ним) | `SKILL.md` «Two ways of reading», первый абзац после списка из пяти пунктов |
| Выход: один черновик, одна первая строка-заголовок формы `<plugin> <release or window> field report: <headline findings>`, по разделу на фокус в порядке меню, каждый раздел — по раскладке своего фокуса; один рецензент публикации, один критик полноты — как у любого черновика | `SKILL.md` «The output», первый абзац; `focuses.md` раздел `## all` с этим перечнем |

Ни одной новой опции: фокус — слово пользователя и решение страницы; `all` не добавляет аргументов ни `corpus`, ни другим командам.

## 3. Что скрипт меряет для `process`

**Что уже есть в `corpus/index.json` на задачу** (по `gather`, `prepare-feedback.mjs:434-500`): `first`, `last`; `humanMessages`, `turns`, `chars`; `tokens` {input, cacheWrite, cacheRead, output} — это и есть доля координатора (главный транскрипт и форки); `subagents[]` {id, agentId, type, description, tokens, durationMs, toolUses, model} из возврата Agent tool или task-notification; `codex[]` — запуски с путями отчёта и rollout.

**Что добавить в `corpus`** — в том же проходе `scan` (он уже читает каждую запись), счёты на задачу (главный транскрипт с форками; субагенты — своими счётами в своих строках):

- `apiCalls` — число записей `usage`: столько раз контекст перечитан;
- `wallMs` = `last − first`; `activeMs` — сумма промежутков ≤ 600 с между соседними записями с меткой времени; `gaps[]` — до десяти промежутков > 600 с: {ms, after: тип записи и имя инструмента перед промежутком, at: `T3:282`}. Проверено на одном транскрипте этой машины: 17 промежутков > 600 с, самые большие — после текста ассистента, то есть ожидание пользователя; активное время 96 016 с;
- `tools` {имя: счёт} по блокам `tool_use` (Bash, Agent, Read, Edit, Write, SendMessage, Skill, TaskOutput…);
- `repeats[]` — команды Bash, запущенные два раза и больше: {sha256 команды, chars, count, at[]} — текст команды не хранится;
- `outputs[]` — десять самых больших результатов инструментов: {tool, bytes, at};
- у каждого запуска `codex[]`, когда отчёт есть: `model`, `effort`, `tokens` (`tokenUsage.total.totalTokens`), `cached` (`cachedInputTokens`), `wallMs`, `commandMs`, `modelMs` (`timing`), `exitCode`, `turnStatus`, `commandsSucceeded`, `commandsFailed`, `commandsDeclined` — ключи сверены с реальным отчётом драйвера 0.22.0.

Всё это — счёты, хеши, имена инструментов и адреса; текста нет, поэтому сводка не требует ревью, как `coverage-*.json`.

**Новая команда `process --run <run>`**: читает `index.json`, пишет `measures/process.json` — строки по задачам, строки по агентам (`T3.s2` и `run:<id>`: модель, тип, токены, длительность, вызовы или команды, exit) и итоги — и печатает не больше 20 строк: `TASKS=`, `WALL=<s>`, `ACTIVE=<s> GAP=600s`, `GAPS=<n> LARGEST=<s> at <T#:line>`, `COORD=<tokens> share=<%> cache_read=<%> api_calls=<n>`, `AGENTS=<n> tokens=<n> share=<%>`, `CODEX=<n> tokens=<n> share=<%> nonzero_exit=<n>`, `TOOLS=Bash:<n> Agent:<n> …` (пять самых частых), `REPEATS=<n> MOST=<count>x at <T#:line>`, `OUTPUTS=<bytes> at <T#:line>`, `FILE=measures/process.json`. Повтор на существующий файл — refused 10; до `corpus` — refused 10.

**По ролям** скрипт не считает: роль агента стоит в карточке плана, а не в записи; читатель называет роли по карточке из транскрипта, метки полезности ставит по правилам #16, и таблица «по ролям» собирается из строк `process.json` и этих меток. Скрипт даёт по агентам и по моделям.

**Правило Flags.** `process` — команда, операнд, как `parts`; берёт только `--run`. Порог 600 с — константа, напечатанная в выводе (`GAP=600s`): никто её не ставит, промежутки над ней перечислены с адресами, и читатель судит сам; предложение о том, почему дефолт не решает, не пишется. Счёты добавляются в `corpus`, а не вторым проходом: `scan` уже идёт по каждой записи, а `feedback` платит несколько чисел на задачу. Отдельная команда `process`, а не строки в выводе `corpus`: у `corpus` сводка плана, а `process.json` — файл, который называет бриф читателя.

## 4. Что остаётся как есть

Всё остальное на странице: старт, область, пять пунктов сверх страниц (с правками R1 и R2), извлечение, выход как публикация, worktree и коммит, приватная папка, рецензент. `run` и `process` над одной сессией — разные разделы одного отчёта: `run` — что случилось и что замерено (#1/#22), `process` — куда ушли время и токены и что с этим делать.

## 5. Открытое

1. У `process` нет принятого владельцем эталона-issue: раскладка новая, собрана из cost profile #15, таблицы ролей #16 и таблицы цен #22; первый отчёт `process` читает владелец.
2. Состав контекста координатора по источникам (#15: доля повторного чтения «размер × последующие вызовы») скрипт не считает; это measurer-скрипт агента, когда вопрос требует.
3. Гипотеза E82 (первая строка страницы против текста host'а) — без изменений, живой прогон по слову.
4. Тело страницы: 15 570 из 20 000 байт; §1–§2 добавляют оценочно 2 500–3 500 байт; если не влезает, подробности `process` и `all` живут в focuses.md, а на странице остаются пункты меню и одна фраза на раздел.
