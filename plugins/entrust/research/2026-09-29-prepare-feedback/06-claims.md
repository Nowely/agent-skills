# F1-claims-02: новые и изменённые утверждения, на которые опирается F1-design-02.md

Тот же формат, что в `F1-claims-01.md`: одно утверждение, адрес, дословная цитата. Номера 1–5 заменяют L002, L007, L009, L017, L020 из 01; остальные — новые. Подтверждённые в 01 утверждения не повторяются.

1. **(заменяет L002)** CLAUDE.md репозитория объявляет всё собранное для research приватным по умолчанию.
   Адрес: `CLAUDE.md:24-26`.
   Цитата: «**Everything gathered for research is private by default.** A tracked file carries only what the owner has already made public or would publish on this repository's front page; a detail private only in combination with public ones is private.»

2. **(заменяет L007)** #21 сообщает размер страницы: ~18k символов под лимит вывода 10k токенов; замер не воспроизведён.
   Адрес: issue #21, `<details>` «Measured lessons from the first run», маркер «Page size».
   Цитата: «Pages of at most ~18k characters fit under the 10k-token output limit.»

3. **(заменяет L009)** #22 сообщает: Luna на `low` — 11 ложных из 22 при 3.48M токенов, на `medium` — 1 из 13 при 3.63M, примерно те же токены.
   Адрес: issue #22, раздел «1. A three-transcript pilot found `EFFORT: low` unreliable…», таблица.
   Цитата: «| low | 11 of 15 | 11 of 22 | 3.48M |» и «| medium | 12 of 15 | 1 of 13 | 3.63M |»

4. **(заменяет L017)** Строка запуска swarm несёт кап параллельности `--concurrency`, а дефолт скрипта — 10.
   Адрес: `plugins/entrust/plugin/skills/swarm/SKILL.md:23` и `plugins/entrust/plugin/skills/swarm/scripts/swarm.mjs:42`.
   Цитата: «--run <run directory> --concurrency <n>» и «at most --concurrency (1 to ${MAX}, default 10) run at once.»

5. **(заменяет L020)** Маркер загрузки по любому пути даёт 38 сессий entrust и 10 terse; маркер по пути кеша — 26 и 12; «лишние» пути — worktree-checkout'ы.
   Адрес: команды на этой машине (2026-09-29): `grep -l 'Base directory for this skill: [^"\\]*/entrust/[^"\\]*/skills/' ~/.claude/projects/*/*.jsonl | wc -l` → 38; то же с `/terse/` → 10; `grep -oh 'Base directory for this skill: [^"\\]*/entrust/[^"\\]*/skills/[a-z-]*' ~/.claude/projects/*/*.jsonl | grep -v 'plugins/cache/nowely' | sed 's|/skills/.*||' | sort | uniq -c` → два пути вида `…/agent-skills-<worktree>/plugins/entrust/plugin` (15 и 8 вхождений).
   Цитата (образец строки): «Base directory for this skill: ~/Git/agent-skills-field-audit-triage/plugins/entrust/plugin»

6. **Отказ загрузки виден текстом ошибки в `tool_result`.**
   Адрес: команда `grep -l 'cannot be used with Skill tool due to disable-model-invocation' ~/.claude/projects/*/*.jsonl | wc -l` → 16 (46 вхождений).
   Цитата: «cannot be used with Skill tool due to disable-model-invocation»

7. **Строка `REPORT=` лаунчера попадает в транскрипт и называет разные корни отчётов.**
   Адрес: команда `grep -l 'REPORT=/' ~/.claude/projects/*/*.jsonl | wc -l` → 38; `grep -oh 'REPORT=/[^"\\ ]*report.json' ~/.claude/projects/*/*.jsonl | sed 's|/[^/]*/[^/]*/report.json$||' | sort | uniq -c | sort -rn | head -3` → корни `…/plugins/data/entrust-nowely/orchestrate/<slug>` (3 175), `…/plugins/data/codex-delegate-nowely/orchestrate/<slug>` (384), `…/plugins/data/entrust-nowely` (275).
   Цитата (образец): «REPORT=~/.claude/plugins/data/entrust-nowely/orchestrate/-Users-user-Git-agent-skills»

8. **Обычный `entrust:codex` кладёт отчёт в `<state>/reports/<run>/report.json`, не в каталог orchestrate.**
   Адрес: `plugins/entrust/plugin/skills/codex/SKILL.md:161-162`.
   Цитата: «`<REPORT>` is an absolute path of this agent's own: put it under the driver's state directory, `<state>/reports/<run>/report.json` with `<run>` unique, or, under the orchestrate»

9. **Отчёты эпохи #1 лежали в `~/.codex-delegate/`.**
   Адрес: issue #1, раздел «The core argument…», маркер «A job registry already exists».
   Цитата: «`~/.codex-delegate/jobs/` — one JSON record per run keyed by `threadId`»

10. **`MODEL:` с коротким именем резолвится в новейший слаг каталога, поэтому список моделей навыку не нужен.**
    Адрес: `plugins/entrust/plugin/skills/codex/SKILL.md:250`.
    Цитата: «`astra`, `sol`, `terra`, `luna`: the newest model of that name the catalogue lists, resolved before the turn; a full slug from the catalogue pins one version»

11. **Реплика #20 исключала из корпуса текущую сессию, а эффорт извлечения выбрал пилот — high.**
    Адрес: issue #20, комментарий-реплика, `<details>` «Method», шаги 1 и 3.
    Цитата: «144 sessions in five projects with at least one human message, after excluding scripted test runs and the current session» и «at high effort 21 of 21 with 1 extra out of 31. High effort was used.»

12. **Состав аудита #15 не содержал судьи; ранжирование предложений — «by value for cost» без него.**
    Адрес: issue #15, раздел «Scope and method», абзац «Audit composition», и раздел «Proposed changes», первая строка.
    Цитата: «19 Codex agents: 2 Astra and 17 Sol, all read-only with `NETWORK: no`. - a split critic; - ten transcript readers; - a fuel accountant (a script, run twice, three hand spot-checks); - a Codex-run auditor; - two dry runs of the pages (the advisor path; two basic actions); - a refuter; - two independent idea generators; - a completeness critic.» и «Ranked by value for cost.»

13. **Ответ orchestrate линтуется, и после строки критика ничего не следует.**
    Адрес: `plugins/entrust/plugin/skills/orchestrate/SKILL.md:133` и `plugins/entrust/plugin/skills/orchestrate/scripts/lint-draft.mjs --help` (строки правил `path`, `machinery`, `length`).
    Цитата: «Nothing else follows the lint, no paragraph on the critic's return included: anything you must add is linted and frozen again, and the critic reads again.» и «length        more than --max-words words (default 400).»

14. **Критик полноты читает публикацию так же, как ответ.**
    Адрес: `plugins/entrust/plugin/skills/orchestrate/references/roles.md:26`.
    Цитата: «a publication is read the same way»

15. **Критик разбиения — перед любым фан-аутом шире одного агента.**
    Адрес: `plugins/entrust/plugin/skills/orchestrate/SKILL.md:127` и `references/roles.md:10`.
    Цитата: «Critique the split before the fan-out: a top-row agent reads the decomposition, not the subject» и «before every fan-out wider than one agent, and before any worker brief is written»

16. **Скрипт experiment имеет команды `arm` и `add`, копирующие чужие файлы в запись, — образец для `field-report.mjs add`.**
    Адрес: `node plugins/entrust/plugin/skills/experiment/scripts/experiment.mjs --help`, строки 4–6.
    Цитата: «arm    --record <dir> --arm <name> [--report <report.json>] [--return <file>] [--brief <file>]» и «add    --record <dir> --name metrics.md|conclusion.md|verdict.md --from <file>»

17. **swarm: не больше 50 единиц на файл, id агентов `001…`, сводка пишется только по окончании.**
    Адрес: `plugins/entrust/plugin/skills/swarm/scripts/swarm.mjs:84`, `:114`, `:150-157`.
    Цитата: «if (units.length > MAX) fail(EXIT.USAGE, `--units has ${units.length} units; a swarm is ${MAX} at most`);», «const id = String(k + 1).padStart(3, "0");», «finishedAt: new Date().toISOString(), stopped, agents };»

18. **Правило владельца: агентам читать рабочие сессии можно; из корпусов их по соображениям приватности не исключать.**
    Адрес: `~/.claude/projects/-Users-user-Git-agent-skills/memory/feedback-privacy-public-repo-only.md`, первый абзац тела.
    Цитата: «Agents reading or processing work sessions … is fine; do not exclude work projects from research corpora … on privacy grounds.»

19. **Правило владельца: research-прогон плагина живёт на ветке в worktree, файлы прогона коммитятся там как само собой разумеющееся.**
    Адрес: `~/.claude/projects/-Users-user-Git-agent-skills/memory/feedback-research-lives-in-plugin.md` (первая строка тела) и `feedback-worktree-means-commit.md` (поле `description`).
    Цитата: «A research run about a plugin goes into `plugins/<name>/research/<date>-<slug>/` of this repo, on a worktree branch, with its own README and a row in that plugin's `research/README.md`.» и «"work in a worktree" means the run's files are committed on the worktree branch as a matter of course»

20. **Наблюдение координатора и O1 (не воспроизведено мной): Skill tool грузит страницу с `disable-model-invocation`, когда пользователь набрал её команду последним сообщением, и отказывает иначе — 19 из 19.**
    Адрес: `$TMPDIR/fr-design/O1-critique-01.md:47-52` (замер `dmi-by-user-typing`), сообщение координатора от 2026-09-29, п. 3.
    Цитата (O1): «Вызовов Skill tool для `entrust:orchestrate`: 11 загрузились, 6 отказаны. Все 11 загрузок пришлись на случаи, где последнее сообщение пользователя содержало `/entrust:orchestrate`, а все 6 отказов — на случаи, где его не было»
