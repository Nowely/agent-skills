# F1-claims-01: фактические утверждения, на которые опирается F1-design-01.md

Каждое — одно утверждение о существующем, его адрес и дословная цитата источника. Адреса в репозитории — абсолютный путь:строка на `main` (0ef42dd); issues — `gh issue view N --repo Nowely/agent-skills` (для комментариев `--comments`); замеры на этой машине — команда, которую можно повторить.

1. **CLAUDE.md репозитория запрещает новый флаг без предложения «кто ставит, почему дефолт не решает, что сломается».**
   Адрес: `CLAUDE.md:39-40`.
   Цитата: «a new flag, header field or option is born only with a sentence that names who sets it, why the default cannot decide, and what breaks without it; when that sentence cannot be written, the default decides.»

2. **CLAUDE.md репозитория объявляет всё собранное для research приватным по умолчанию, включая детали, приватные только в сочетании.**
   Адрес: `CLAUDE.md:24-26`.
   Цитата: «A tracked file carries only what the owner has already made public or would publish on this repository's front page; a detail private only in combination with public ones is private.»

3. **CLAUDE.md репозитория задаёт место и форму research-прогона: `plugins/<name>/research/<date>-<slug>/`, нумерованные файлы, `rounds.md`.**
   Адрес: `CLAUDE.md:20-23`.
   Цитата: «Every iteration of a document is its own numbered file, never overwritten; a round is frozen once its critics launch; `rounds.md` beside them records the findings and the regression count of each round.»

4. **Комментарий владельца к #21 требует, чтобы всё выходящее из приватной папки проверяла сильная модель, которая это не писала, включая комбинации.**
   Адрес: issue #21, единственный комментарий (`gh issue view 21 --repo Nowely/agent-skills --comments`), второй маркер списка.
   Цитата: «Anything that does leave the folder — the issue body, an anonymized copy — is checked before it leaves by a strong model that did not write it, including combinations: whether a label or a detail can be joined to something already public.»

5. **#21 фиксирует хранение транскриптов по умолчанию 30 дней и требование предупреждать о малом корпусе.**
   Адрес: issue #21, раздел «Requirements», четвёртый маркер.
   Цитата: «The skill warns when the corpus is small or old sessions are gone. The default transcript retention is 30 days; raising it keeps more history for future runs.»

6. **#21 замерил: при 8 параллельных агентах все 148 прогонов извлечения прочли каждую страницу с первого раза, при 36 — 63 пустых чтения.**
   Адрес: issue #21, раздел `<details>` «Measured lessons from the first run», маркер «Concurrency».
   Цитата: «With 36 extraction agents in parallel on an 8-core machine, 63 page reads came back empty. […] With 8 agents in parallel, all 148 runs of the full extraction read every page on the first pass.»

7. **#21 замерил размер страницы: ~18k символов помещаются под лимит вывода 10k токенов.**
   Адрес: issue #21, тот же `<details>`, маркер «Page size».
   Цитата: «Pages of at most ~18k characters fit under the 10k-token output limit.»

8. **#22 предлагает вместо жёсткого токен-бюджета правило остановки 3× медианы пилота / 2× прогноза.**
   Адрес: issue #22, раздел «5. Chunked reading in one context grows cost quadratically…», подпункт «Proposed», третий маркер.
   Цитата: «Instead of a hard token budget, stop and ask when one agent spends more than 3× the pilot median, or when the post-pilot forecast exceeds the plan by 2×.»

9. **#22 замерил: Luna на `low` даёт 11 ложных из 22 против 1 из 13 на `medium` при тех же токенах, и предлагает `medium` дефолтом для классификации.**
   Адрес: issue #22, раздел «1. A three-transcript pilot found `EFFORT: low` unreliable…», таблица и «Proposed».
   Цитата: «| low | 11 of 15 | 11 of 22 | 3.48M |» и «Bulk default `medium` for extraction, classification and verification.»

10. **#22 описывает батч-режим bulk-ряда без обёрток: launch-only лаунчера и `--status`, ~13k токенов на обёртку.**
    Адрес: issue #22, раздел «9. Document a batch mode for the bulk row», «Measured».
    Цитата: «The 456 Luna runs used batch launch (the launcher's launch-only mode) and `--status`, without a per-agent Claude wrapper. This avoided wrapper calls — each wrapper in this session cost about 13k tokens according to the harness's usage notices»

11. **#22 называет `codex debug models` источником списка моделей, а в установочной части плагина эта команда не упомянута.**
    Адрес: issue #22, раздел «6. The model table is outdated», «Measured»; команда `grep -rn -l 'debug models' plugins/entrust/plugin/` печатает ничего (0 файлов).
    Цитата (#22): «`codex debug models` on codex-cli 0.156.1 lists `gpt-6-astra`, `gpt-6-sol` and `gpt-6-luna`, and describes the 5.6 models as "Older".»

12. **#15 отбирал корпус по пути скилла в транскрипте и нумеровал адреса как `T#:line`.**
    Адрес: issue #15, раздел «Scope and method», абзац «Corpus», и подраздел «Evidence», первый маркер.
    Цитата: «Every transcript in one project that loaded the 0.20.0 skills (found by skill path):» и «`T#:line` is a 1-based JSONL line in the task's transcript.»

13. **#16 предлагает «triggered reporter», собирающий деливерабл для человека по одобренному владельцем образцу, с правилом «package, never assert».**
    Адрес: issue #16, раздел «Proposal: triggered reporter using an owner-approved reference», абзац «Proposal, hypothesis».
    Цитата: «Inputs are verified evidence only, audience, destination and an owner-approved example/template from memory, repository or plugin default. […] **Hard rule:** package, never assert; every statement traces to verified evidence and adds no causal claim.»

14. **Skill tool отказывает загрузке страницы с `disable-model-invocation`, поэтому режим не может загрузить orchestrate.**
    Адрес: `plugins/entrust/plugin/skills/orchestrate/references/foreman.md:24`.
    Цитата: «It cannot load this skill: the Skill tool refuses a skill marked `disable-model-invocation`.»

15. **Координатор сам не пишет под каталог состояния: headless-сессия отказывает, а подпроцесс с тем же путём пишет.**
    Адрес: `plugins/entrust/plugin/skills/orchestrate/SKILL.md:29`.
    Цитата: «Never run `mkdir`, Write or a shell redirect under that data directory yourself, because a headless session refuses each of them as a sensitive file with no prompt anyone can answer, while a subprocess handed the same path as an argument writes it unopposed (measured 2026-09-08)»

16. **Навык experiment держит свою запись под каталогом состояния, рядом с прогонами orchestrate, и пишет её только скриптом — образец для приватной папки field-report.**
    Адрес: `plugins/entrust/plugin/skills/experiment/SKILL.md:38`.
    Цитата: «The record lives where the driver's own artifacts live: `experiments/<date>-<slug>/` under the state directory, beside the orchestrate runs, written by `scripts/experiment.mjs` and never by hand»

17. **Bulk-ряд orchestrate: Luna предпочтительнее Haiku, ряд не считается в кап «шесть живых» и никогда не берёт роль верхнего ряда; swarm запускается одной командой с капом параллельности.**
    Адрес: `plugins/entrust/plugin/skills/orchestrate/SKILL.md:67-68` и `plugins/entrust/plugin/skills/swarm/SKILL.md:23`.
    Цитата: «**Prefer Luna to Haiku in the bulk row**: measured better. The bulk row does not count against the alive cap and never takes a top-row role» и «node "${CLAUDE_SKILL_DIR}/scripts/swarm.mjs" --units <file> --brief <template> --run <run directory> --concurrency <n>»

18. **После компакции Claude Code хранит только первые 5 000 токенов страницы навыка.**
    Адрес: `plugins/terse/plugin/references/genres/skill-page.md:5`.
    Цитата: «Claude Code keeps only the first 5,000 tokens of a skill after compaction, so a rule past that point is lost for the rest of a long session.»

19. **Глубокие навыки terse запускают агентов, но без Codex: слова `codex` на страницах `rewrite` и `audit` нет.**
    Адрес: `.claude-plugin/marketplace.json:20` и команда `grep -c -i codex plugins/terse/plugin/skills/rewrite/SKILL.md plugins/terse/plugin/skills/audit/SKILL.md` → `0` и `0`.
    Цитата (marketplace.json): «The deep skills use agents, work in a run directory and ask before applying a text to your files.»

20. **Загрузка скилла видна в транскрипте маркером с путём и версией; попыток загрузки больше, чем загрузок; субагенты лежат в `<session-id>/subagents/`.**
    Адрес: команды на этой машине (2026-09-28): `grep -l 'Base directory for this skill: .*nowely/entrust' ~/.claude/projects/*/*.jsonl | wc -l` → 26; `grep -l '"name":"Skill","input":{"skill":"entrust:' ~/.claude/projects/*/*.jsonl | wc -l` → 37; `ls ~/.claude/projects/<slug>/<session-id>/subagents` → `agent-<id>.jsonl agent-<id>.meta.json`.
    Цитата (из `~/.claude/projects/<slug>/<session-id>.jsonl`): «Base directory for this skill: ~/.claude/plugins/cache/nowely/entrust/0.18.0/skills/codex»
