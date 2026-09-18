# T1 — retrospective ledger of coordinator decisions, from local traces

Opus T1, 2026-09-17. Read-only. Every row carries a trace. Line numbers in transcripts are JSONL line
numbers (1-based) in the named file; quotes are at most two lines.

**54 incidents** over 5 orchestrate runs of this project, 2 runs of the owner's work project (counts only)
and 3 earlier sessions located by lead. By primary stage: 1 decompose 6 · 2 compose 7 · 3 rights 6 ·
4 supervise 5 · 5 verify 17 · 6 synthesise 7 · 7 escalate 3 · 8 delegate-or-not 3. Severity:
4 outcome-blocked (2 of them prevented by a rule that fired), 22 cost-only, 14 near-miss, 14 successful
handling recorded as such. Confidence: 53 trace-proven, 1 trace-proven in fact and inferred in intent.
103 agents are individually identified (78 Codex reports + 25 Claude Agent calls), plus a 50-Haiku and a
16-Sonnet wave counted in aggregate.

---

## 0. Inventory — every file read

### 0.1 Orchestrate run directories (report.json per agent; no prompt files are stored — 96 files total, all `report.json`)

Root: `~/.claude/plugins/data/entrust-nowely/orchestrate/`

| Run (path under root) | Date (file mtime) | Reports read | Models | Codex tokens (`tokenUsage.total.totalTokens`) |
|---|---|---|---|---|
| `-Users-ruliny-Git-agent-skills/verify-2026-09-12/` | 2026-09-12 21:57–22:26 | 23 (L01–L09, L11a, L11b, L14, L15, L16, L18–L22, L28, SA, SB, V2) | 20 Luna, 2 Sol, 1 Astra | 11,026,340 |
| `-Users-ruliny-Git-agent-skills/2026-09-12-orchestrate-rules/` | 2026-09-12 23:20 | 1 (`astra-critic`) | 1 Astra | 266,667 |
| `-Users-ruliny-Git-agent-skills/2026-09-12-issues-fix/` | 2026-09-12 23:16 – 2026-09-13 16:20 | 26 (s1–s4, t2, t3 and 4 `-r2`, v1–v13, p1, p4, j1) | 15 Luna, 10 Sol, 1 Astra | 55,328,462 |
| `-Users-ruliny-Git-agent-skills/field-audit-20260916/` | 2026-09-16 16:35–17:51 | 3 (`astra-j1`, `sol-r1`, `sol-r2`) | 2 Sol, 1 Astra | 8,903,772 |
| `-Users-ruliny-Git-agent-skills/naming-20260917/` | 2026-09-17 10:48–12:49 | 25 (18 luna-*, 4 sol-*, 2 astra-j*, 1 failed `sol-r3`) | 18 Luna, 4 Sol, 2 Astra, 1 pre-turn failure | 8,524,119 |
| **agent-skills total** | | **78** | 53 Luna, 18 Sol, 6 Astra, 1 pre-turn failure | **84,049,360** |
| `<work-project>/61411-a/` (work project, counts only) | 2026-09-16 15:07–16:55 | 3 (`astra-a1`, `sol-r1`, `sol-x1`) | 2 Sol, 1 Astra | 2,862,100 |
| `<work-project>/62078-audit/` (work project, counts only) | 2026-09-14 14:56–15:48 | 13 | 10 Luna, 2 Sol, 1 Astra | 47,244,823 |

Excluded as instructed: `-Users-ruliny-Git-agent-skills/practices-2026-09-17/` (3 reports — current run).

### 0.2 Session transcripts (parsed by script, never by the Read tool)

| Session id | Project dir | Date(s) | JSONL lines parsed | Unparsable | Agent-tool calls | Owner text blocks | Role here |
|---|---|---|---|---|---|---|---|
| `b1e2a3a5-38a4-4548-8ebb-1f17d7b59ccc` | `-Users-ruliny-Git-agent-skills` | 2026-09-11 → 09-12 | 1,438 | 0 | 6 (+2 TaskStop) | 38 blocks (20 real owner messages) | ran `verify-2026-09-12` and the 2026-09-11 80-agent wave |
| `30805d36-de44-4895-a38b-21d8c6854f7a` | `-Users-ruliny-Git-agent-skills` | 2026-09-12 | 243 | 0 | 4 | 2 | ran `2026-09-12-orchestrate-rules` (PR #7) |
| `30a03d40-1e05-4ffe-b552-8210cd3a81d3` | `-Users-ruliny-Git-agent-skills` | 2026-09-12 → 09-13 | 1,377 | 0 | 66 | 11 | ran `2026-09-12-issues-fix` (PR #8, 0.15.0) |
| `42691a3b-929b-4d32-8b10-31b513b8c277` | `-Users-ruliny-Git-agent-skills` | 2026-09-16 → 09-17 | 1,891 | 0 | 74 | 39 blocks (31 real owner messages) | ran `field-audit-20260916` **and** `naming-20260917` (PR #9, 0.16.0) |
| `1fe60ced-c37a-4991-821b-b5ee025bc181` | `<work-project>` | 2026-09-16 | 1,021 | 0 | 7 | 17 | work project, `61411-a`; **counts only** |
| `b2d5773e-d37c-4086-ae4f-9827e784ea1a` | `-Users-ruliny-Git-codex-delegate` | 2026-09-07 | targeted grep only | — | — | line 154 read | owner stop of a 51-agent workflow |
| `d737ff38-2600-42f4-9996-f90670b599e3` | `-Users-ruliny-Git-agent-skills` | 2026-09-12 | targeted grep only | — | — | line 3989 read | owner's stated agent pool + defects-ledger rule |

Grep over all root `*.jsonl` of `-Users-ruliny-Git-agent-skills` and `-Users-ruliny-Git-codex-delegate`
(20 + 60 files) established that each run slug appears in exactly one non-current session.
`035850d2-*.jsonl` excluded (current session).

### 0.3 Repository files read

`plugins/entrust/skills/orchestrate/SKILL.md` (152 lines, at `dff2f0b`) · `plugins/entrust/skills/codex/SKILL.md` (315 lines, length only) ·
`plugins/entrust/CHANGELOG.md` (grep for `measured`, 40 hits) ·
`research/README.md` · `research/2026-09-12-issues-verification/{rounds.md, seat-returns/codex-seats.md, seat-returns/claude-seats.md}` ·
`research/2026-09-11-markup-round-0/{rounds.md, reviews/07/*, reviews/08/*}` (11 + 3 files listed, `fable-dedup-and-rank.md` read) ·
`research/2026-09-11-terse-survey/README.md` · `research/2026-09-10-chain/{README.md, run-2x5/index.json}` ·
Git: `git show codex-delegate@{0.13.0,0.14.0,0.15.0}:…/orchestrate/SKILL.md` (150 / 149 / 152 lines) and `git log --follow` on the page.

### 0.4 Memory notes (leads only, each verified against a transcript before use)

`~/.claude/projects/-Users-ruliny-Git-agent-skills/memory/` — 37 files, 34 carry `originSessionId`.
Read: `feedback-no-large-fanout.md`, `agent-pool-2026-09-12.md`, `orchestrate-pool-correction-2026-09-08.md`,
`feedback-codex-and-native-seats-same-ux.md`, `feedback-qualification-is-antipattern.md`,
`feedback-defects-ledger.md`, `judge-panel-composition.md`.

### 0.5 Reused inventory

`/var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/ctxmeas.UZPd5a/per-session.md` — 46 sessions, per-session turn
counts and the category table used for the TaskOutput and context figures below.

---

## 1. Ledger of coordinator incidents

Abbreviations: **b1**=`b1e2a3a5`, **30a**=`30a03d40`, **426**=`42691a3b`, **308**=`30805d36`.
"Page then" = the orchestrate page version actually in force during the run; "page now" = line at `dff2f0b`.

| id | run / date | stage | tags | what happened | trace | consequence & cost | page then | page now | severity | conf |
|---|---|---|---|---|---|---|---|---|---|---|
| T1-01 | 2026-09-11 wave, b1 | 2 compose | cap exceeded, owner correction | After the owner asked for a bigger wave, the coordinator launched **80 Claude agents in one Workflow** (50 Haiku extractors, 20 Sonnet, 10 Opus refuters). | b1:266 "Запускаю волну 1: **80 агентов**"; owner b1:229 "на волну. Попробуем более массовый запуск" | 80 launched, 76 returned, 6.75 M tokens, 62 min (b1:369) | 0.13.0 page: "alive at once 6"; bulk row ≤50 | L96 (6 alive), L63/69 (bulk ≤50, outside the pool) | cost only | trace-proven |
| T1-02 | 2026-09-11, b1 | 2 compose | tier choice, ignored return | 4 of 50 Haiku returns were lost to output-schema validation (arrays returned as strings, a required field dropped); their findings existed only in their transcripts. | b1:302 "Четыре срыва — это отказ схемы… Все четыре — haiku" | 4 returns lost, no re-run, no backfill | none | L139–152 (five fields / schema) | cost only | trace-proven |
| T1-03 | 2026-09-11, b1 | 5 verify | — (successful) | Opus adversarial verification killed 24 of ~36 candidate findings from the 66 cheap extractors; 12 survived, and most survivors came from the verifiers themselves. | b1:341 "большинство убито при перечитывании исходника; реальный урожай дали сами проверяющие"; b1:369 "12 находок выжило…, 24 убито" | 12 findings kept from an 80-agent wave | none | L116–117 | near miss | trace-proven |
| T1-04 | 2026-09-11, b1 | 5 verify | — (successful) | Before reporting, the coordinator re-checked four of the cheapest claims by hand and found an agent's count off (agent 15/35, coordinator 16/34). | b1:369–376 | agent error caught, not propagated | none | L25 ("you never grade your own work") | near miss | trace-proven |
| **T1-05** | 2026-09-11 wave 3, b1 | 1 decompose | contract defect, duplicated work | The coordinator's own script joined each Codex report to **the wrong paragraph**: all twelve pairs came from the current session. Four successive anchoring rules (thread id, report path, last folder mention, agent name) all failed; probe B was withdrawn with no result. | b1:680 "Дефект подтверждён и он тотальный: **все двенадцать пар склеены неверно**"; b1:749 "Цена ошибки: шесть мест luna и часть шести opus отработали по мусору" | 6 Luna agents + part of 6 Opus burned; 2 `TaskStop` (b1:695, 733); the measurement never happened | none | L115 (critique the split) does not cover a data-joining bug | **outcome blocked** | trace-proven |
| T1-06 | 2026-09-11, b1 | 4 supervise | contract defect | The coordinator's own Workflow script crashed on its own edit: `ReferenceError: fid is not defined`. | owner-side task-notification b1:770; b1:772 "`fid` я объявлять забыл" | result recovered from the workflow journal; no re-run | none | L106 + `workflow-authoring` | cost only | trace-proven |
| T1-07 | 2026-09-11, b1 | 2 compose | capacity | The owner warned Astra was at 1 % quota while the coordinator's only remaining reproduction path required Astra; the one live Astra agent finished before anything was done. | owner b1:809; b1:545 "astra в пуле одна"; b1:831 "Предпринимать не пришлось — V1 закончил с нулём" | none — luck | none | L41/L97 (1 Astra alive) | near miss | trace-proven |
| T1-08 | 2026-09-11, b1 | 5 verify | unverified claim accepted | The Astra judge "снёс изрядную часть того, что я вам докладывал как доказанное" — much of what had already been reported to the owner as proven did not survive; the coordinator's own dossier also mis-cited a line (91 given as 89). | b1:842; b1:847 | round headline cut to 7 surviving items | none | L120 (completeness critic), L116 | cost only | trace-proven |
| **T1-09** | verify-2026-09-12, b1 | 1 decompose | contract defect | **Every one of the 20 bulk prompts carried a doubled `plugins/codex-delegate` path segment** that did not exist. | `seat-returns/codex-seats.md:9–11`; `verify-2026-09-12/L01/report.json` → `commands[0]` runs `…/plugins/codex-delegate/plugins/codex-delegate/skills/cleanup/SKILL.md`, exitCode 1; `open:` field of the same report | 20 Luna agents each burned a failed command; 19 of 20 returned a misleading verdict word; no re-run of the fan-out | none (0.14.0, 149 lines) | **L70** and **L118** exist because of this | cost only | trace-proven |
| T1-10 | verify-2026-09-12, b1 | 5 verify | — (self-corrected) | The coordinator first read the unanimous "MOVED" tally as a **failure of the Luna tier**, then retracted two turns later after opening the `open` field of one return. | b1:1183 "Это отказ разметки, не рассуждения"; b1:1192 "Снимаю предыдущий вывод: это была **моя ошибка, не луны**" | nothing wrong propagated to the owner | none | L118 (open one return whole before you trust the tally) | near miss | trace-proven |
| T1-11 | verify-2026-09-12, b1 | 5 verify | — (successful) | Opus W1 claimed the plugin was not installed on this machine and declared entry C1 unmeasurable; the coordinator checked the registry itself and rejected the claim, then handed the conflict to the judge. | `claude-seats.md:60–62` "CORRECTION BY THE COORDINATOR… That is wrong"; b1:1231; b1:1259 (conflict 2 of 4 given to Astra V2) | agent error rejected, not propagated | none | L25 | near miss | trace-proven |
| T1-12 | verify-2026-09-12, b1 | 5 verify | unverified claim accepted | The coordinator told the owner twice that 0.14.0 had "silently closed" part of the previous round's findings — read off the changelog, not the tree. Opus W2 showed the release fixed **zero** of the nine entries and that what was closed was named in the changelog. | b1:968 and b1:994; refutation b1:1240 "Моя формулировка была неверна, поправка идёт в итог" | two owner-facing statements retracted | none | L25 (verify: a fresh agent does) | cost only | trace-proven |
| **T1-13** | verify-2026-09-12, b1 | 1 decompose | — (successful, rule-forming) | The Fable architect read the decomposition, not the subject, before the fan-out and rejected it: two claims true at 0.13.0 and false at 0.14.0, one quote existing in no version, five addresses corrected, one prior finding with no claim at all. | `seat-returns/claude-seats.md:3–19`; b1:1003 "Ровно ради такого момента архитектор и ставился" | 20 agents saved from a bad split; became the page rule | none | **L115** | outcome blocked (prevented) | trace-proven |
| T1-14 | verify-2026-09-12, b1 | 3 rights | stale locator | The `codex-seat` wrapper agent type did not resolve because the session predated the plugin install. The coordinator probed it with one cheap launch first, then fell back to bare background commands. | b1:1012 "если тип агента не разрешится, узнаю это сразу и дёшево"; b1:1021, b1:1026; `claude-seats.md:121–124` | one wasted launch; 23 agents ran unwrapped | none | L104 (wrapper is an agentType of its own) | near miss | trace-proven |
| T1-15 | verify-2026-09-12, b1 | 3 rights | stale locator | Scouting found `~/.claude/agents/codex-seat.md` a dangling symlink into a repository path that no longer exists — a silently broken wrapper for anyone on the clone route. | `claude-seats.md:125–127`; b1:1026 | filed as candidate N2, later fixed | none | none | cost only | trace-proven |
| T1-16 | verify-2026-09-12, b1 | 5 verify | — (successful) | The one Luna dissent (L06) was opened and verified by the coordinator itself, and proved right: ledger entry C2's "every run" premise is false in orchestrate mode. | b1:1278, b1:1283; `rounds.md:12` "one substantive correction no other agent made" | entry C2 rewritten; the only bulk-tier finding no strong agent produced | none | L118 | near miss | trace-proven |
| T1-17 | verify-2026-09-12, b1 | 3 rights | — | The entire 23-agent fan-out ran with egress denied (`network:false` in 23/23 reports) — the only run in the corpus that did; all other 55 agent-skills reports carry `network:true`. | report field `network` across the 5 run dirs | no network-related escalation in that run | 0.13.0 "network on by default, one line takes it away" | L38 (state which agents are kept off the network) | n/a (successful) | trace-proven (fact); inferred (intent) |
| T1-18 | verify-2026-09-12, b1 | 7 escalate | — (successful) | The coordinator stopped and warned that the round's outputs lived in a temp directory the system could sweep, and asked for one word to commit them. | b1:1347 "проект документа сейчас лежит во временном каталоге, который система может вымести" | the whole research record survives at `research/2026-09-12-issues-verification/` | none | L31 (a file an agent must leave goes under `$TMPDIR`…) | near miss | trace-proven |
| T1-19 | orchestrate-rules, 308 | 8 delegate-or-not | — (successful) | For three one-line page rules the coordinator wrote the edits itself and spent agents only on criticism: 1 Opus (page voice) + 1 Codex Astra (fidelity to the record), both read-only. | 308:148 (Agent `opus`), 308:167 (Agent codex Astra), 308:125 (proposal held for the word) | 2 agents, 266,667 Codex tokens → PR #7 | 0.14.0 L23–25 | L23–25 | n/a (successful) | trace-proven |
| **T1-20** | orchestrate-rules, 308 | 6 synthesise | — (successful, dissent kept) | The Astra critic showed the coordinator's own reading ("their prose said the opposite") was explicitly confirmed in only 3 of 19 returns; the clause was **cut from the final text** and the one clause left at level 2 was named to the owner. | 308:242 "Astra также отмечает… явно подтверждённое в L08, L14, L21, не во всех девятнадцати; в финальном тексте этой клаузы нет" | a weaker claim shipped than the coordinator wanted | 0.14.0 | L54 (attribution), L121 | n/a (successful) | trace-proven |
| T1-21 | issues-fix, 30a | 7 escalate | — (successful) | The Skill tool refused to load the orchestrate page (`disable-model-invocation`); the coordinator said so, read the page from the tree as text, and asked the owner to invoke the slash command. The owner did. | 30a:125 "Блокер 1: … Skill-tool отказал"; owner 30a:131 `/codex-delegate:orchestrate`; 30a:140 "блокер 1 снят" | one owner turn; no silent workaround | 0.14.0 frontmatter | L6 `disable-model-invocation: true` | near miss | trace-proven |
| **T1-22** | issues-fix, 30a (+426) | 4 supervise | — | **19 blocking `TaskOutput` calls returned ~32 KB of a running agent's transcript each** instead of a status line (12 in 30a, 7 in 426). The coordinator named the symptom at the second occurrence and kept polling. | 30a agent map: 12 results of 32,168–32,180 bytes (lines 178, 263, 301, 325, 335, 376, 406, 415, 452, 661, 801, 1199); 426: 7 more (160, 170, 484, 494, 503, 1585, 1650); 426:177 "Второй дамп подряд, тот же ~32 KB" | `per-session.md`: taskoutput = **193,389 tok (23.5 %)** of 30a's attributed context and **92,469 tok (7.6 %)** of 426's | none | **L105** ("returned 32 KB of its transcript… seven of seven each") — written from these two runs | cost only | trace-proven |
| T1-23 | issues-fix 30a; field-audit 426 | 8 delegate-or-not / 7 escalate | — | A bare "го" was read as approval of forks the coordinator had itself left open; it announced the reading and offered a stop each time. Three occurrences. | 30a:204 "«го» принят. По трём развилкам выбора не было, беру рекомендации"; 30a:848; 426:92 "«Го» без ответов на вопросы читаю как согласие… Если не так — остановите" | no owner objection followed in any of the three | 0.14.0 §The plan step 3 | L44 "The user's 'go' covers only what the plan listed" | near miss | trace-proven |
| **T1-24** | issues-fix, 30a | 1 decompose | — (successful) | Ownership was assigned **by file, not by defect**, because four ledger entries lived in one driver file; the contract was settled before the writers started. | plan written at b1:1339 "Дефекты не делятся по темам — они делятся по файлам… Владение назначается по файлу"; executed 30a:204, 30a:560 | 4 concurrent writers in 2 batches, no collision reported | 0.14.0 §Composition | **L100** | n/a (successful) | trace-proven |
| T1-25 | issues-fix, 30a | 5 verify | — (successful) | Cross-review ran the other way round on all four lines (Codex diff → Opus, Opus diff → Codex Sol), two rounds each, then stopped. | 30a:469 "оба крест-накрест прошли по два круга"; 30a:838 "Все четыре линии прошли по два круга ревью" | 4 Sol continuations (18.7 M tokens) on top of round 1 (22.8 M) | 0.14.0 §Composition | L88–89, L123 ("at most two rounds") | n/a (successful) | trace-proven |
| T1-26 | issues-fix, 30a | 5 verify | — (successful) | 13 Luna verifiers, one ledger entry each (12 FIXED, 1 PARTIAL); the coordinator then had the Astra judge read the tree itself rather than the Luna returns. | 30a:1170; 30a:1240 "читал дерево сам, а не возвраты Luna" | 13 Luna = 9,651,370 tok; Astra J1 = 4,035,508 tok | 0.14.0 bulk row | L63, L119 | n/a (successful) | trace-proven |
| T1-27 | issues-fix, 30a | 5 verify | — (successful) | The judge returned **exit 6** (an escalation) and its answer was read and acted on rather than discarded. | `2026-09-12-issues-fix/j1-astra-judge/report.json`: `ok:false, exitCode:6, answerJson.status:"done"`; 30a:1240 quotes its verdict | ISSUES.md deleted on that verdict | 0.14.0 result table | L134 "any other non-zero exitCode with an answer → a gate verdict: read the answer" | n/a (successful) | trace-proven |
| T1-28 | issues-fix, 30a | 3 rights | — (successful) | Four probes were designed to make rights failures happen: P2 deliberately reused another agent's report path, P3 pointed at an unwritable parent, P4 was stopped from its agent card. Two therefore left no report by design (no `p2`/`p3` directory). | Agent prompts 30a:1014, 1029, 1044, 1062; `TaskStop` 30a:1088; follow-up check 30a:1098 | level-3 evidence for entries N5/N6; 91,668 Luna tokens | 0.14.0 | L128–132 (result ladder) | n/a (successful) | trace-proven |
| T1-29 | issues-fix, 30a | 5 verify | — | Two agents found defects outside their brief (the lock window, the preserved-tree reason) and one candidate was **refuted by measurement** rather than fixed. | 30a:838 "кандидат опровергнут измерением" | 2 extra fixes, 1 candidate dropped | 0.14.0 | L121 | n/a (successful) | trace-proven |
| T1-30 | field-audit, 426 | 5 verify | — (successful) | Before judging a 62-agent audit report the owner pasted, the coordinator checked five of its addresses against the 0.15.0 text and reported that the paste had been **clipped at 50,000 characters**. | owner 426:4 (50,055 chars); 426:22, 426:33 "Отчёт обрезан на 50k символов: seat-диффы, eval-логи и фикстуру я не видел" | the verdict was given per-part, not wholesale | 0.15.0 | L25 | n/a (successful) | trace-proven |
| T1-31 | field-audit, 426 | 5 verify | — (successful) | The coordinator's own scouting **refuted one of the report's four driver defects as stated** and narrowed a second before any agent was launched. | 426:78 "четвёртый — не так, как отчёт говорит" | an inherited agent error was not propagated into the fix plan | 0.15.0 L22 (scout inline) | L22, L114 | near miss | trace-proven |
| T1-32 | field-audit, 426 | 1 decompose | owner correction | The plan's first step was to record the defects in `ISSUES.md`; the owner struck it. | owner 426:81 "ISSUES.md заполнять нет необходимости"; 426:85 "Принято: шаг 1 убираю" | one plan step dropped before launch | repo `CLAUDE.md` rule | n/a | cost only | trace-proven |
| **T1-33** | field-audit + naming, 426 | 4 supervise | backfill, stall | Opus W1 was continued three times by `SendMessage`, and once **recovered after the session that launched it ended while it was alive**; the coordinator inspected the tree before resuming. | `SendMessage` 426:192, 426:302, 426:1628; task-notification 426:1599 "didn't finish before the previous session ended"; 426:1620 "Проверяю, в каком состоянии дерево осталось после обрыва W1" | rename finished; no work lost | 0.15.0 L105 "never end your turn with an agent alive" | L105 | cost only | trace-proven |
| **T1-34** | field-audit, 426 | 6 synthesise | owner correction | The coordinator's own status line to the user said "Сиденье Codex Sol R1"; the owner objected. The coordinator found the eval case that had measured the same failure on 0.11.1 and called it a recidive of an abstract rule. | owner 426:379; 426:392 "Это известный дефект, и он уже рецидив… measured on 0.11.1 (2026-09-09)" | drove the whole rename: 1,771 occurrences of `seat`, 34 plugin paths, later 299 more for `entrust` | 0.15.0 §What the user reads (abstract, never names the word) | L54 (name the agent by its model; never paste a header field name or path) | cost only (large) | trace-proven |
| T1-35 | field-audit, 426 | 5 verify | — (successful) | The before/after reader measurement was run against a **frozen commit via `git show`** so the writer agent could not contaminate it: 3 Sonnet before, 3 Sonnet after. | 426:422 "через `git show`, чтобы правки W1 их не задели"; Agent calls 426:431/435/439 and 426:564/566/568 | 6 Sonnet agents; the "before" arm survived a concurrent rename | 0.15.0 | L25 | n/a (successful) | trace-proven |
| **T1-36** | field-audit, 426 | 5 verify | — (successful) | Codex Sol R2's cross-review found that the **terse plugin still sent a `SEAT:` header** through the renamed skill — every terse critic fan-out would have failed on its first line against 0.16.0. | 426:656 "terse слал `SEAT:` через старый скилл в `critic-briefs.md` — исправлено, иначе каждый критик-фанаут падал бы" | a cross-plugin break caught before release | 0.15.0 §Composition (cross-review) | L88–89 | outcome blocked (prevented) | trace-proven |
| T1-37 | naming, 426 | 6 synthesise | owner correction | The coordinator adopted judge Astra J2's verdict (keep `codex-delegate`) and withdrew `delegate`; the owner pushed back; re-verification then found two hard collisions the judge had **not** established (Claude Code's own "delegate mode"; four marketplace plugins). | 426:973 "`delegate` снимаю"; owner 426:979; 426:983 "Проверяю, а не защищаюсь"; 426:1005 | the conclusion held but on different evidence | 0.15.0 L119 (judge panel) | L119 | near miss | trace-proven |
| T1-38 | naming, 426 | 6 synthesise | owner correction | The coordinator had presented "wait for a second backend" to the owner as a free option; the owner challenged it and the coordinator retracted. | owner 426:1214; 426:1226 "Я подал «подождать» как бесплатное; это было неверно" | the rename went ahead in the untagged 0.16.0 | none | L42–43 (show several approaches with a recommendation) | cost only | trace-proven |
| **T1-39** | naming, 426 | 1 decompose | contract defect, duplicated work | A shell-quoting bug in the coordinator's **own prompt generator** gave each Luna T-agent one of four sets instead of four; all three returned `partial` and said so in their own text. | 426:1376 "Каждая Luna увидела только один набор из четырёх — **ошибка в моём генераторе промпта**"; 426:1384 "без кавычек zsh не разбивал переменную на строки"; `naming-20260917/luna-t1/report.json` → `status:"partial"`, answer "rank: неизвестно — предоставлен только один набор" | 3 Luna discarded (40,178 tok), re-run as U1–U3 (43,194 tok) | 0.15.0 L70 (covers the verdict set, not prompt assembly) | L70 unchanged | cost only | trace-proven |
| T1-40 | naming, 426 | 5 verify | owner correction | The owner cut an argument short with "хотите данных, а не мнения"; the coordinator switched from arguing to a Luna recognition measurement. | owner 426:1232; 426:1240 (V1–V3 launched), 426:1285 (results table) | 3 Luna, 53,139 tok; produced the table that decided the name | 0.15.0 L114–121 | L114–121 | near miss | trace-proven |
| T1-41 | naming, 426 | 5 verify | owner correction | The owner supplied a fact the coordinator had not checked ("Entrust используют очень много репозиториев"); the coordinator checked and conceded the word but not the niche. | owner 426:1300; 426:1314 "«очень много» — ваше наблюдение, и оно верно для слова как слова" | one extra verification turn | none | L121 | cost only | trace-proven |
| T1-42 | naming, 426 | 6 synthesise | stale locator, owner correction | The coordinator named `entrust:codex-agent` as if it were a skill; the owner said no such skill exists; the coordinator conceded twice. | owner 426:1532 and 426:1554 "Сейчас нет такого скила как :codex-agent"; 426:1558 "Верно, это не скилл, и я зря ставил его в один ряд со слэш-командами" | two turns of correction | 0.15.0 L104 | L104 | cost only | trace-proven |
| T1-43 | naming, 426 | 4 supervise | — (successful) | Codex Sol R3 died pre-turn (`exitCode:2`, no model, no tokens); the coordinator read stderr and relaunched **once** under a fresh report path. | `naming-20260917/sol-r3/report.json` (exit 2, `model:null`); 426:1715 "Sol R3 упал на старте: exit 2 до хода"; relaunch Agent 426:1730 → `sol-r3b` ok, 5,467,466 tok | one relaunch, right ladder rung | 0.15.0 result table | L128/L132 | near miss | trace-proven |
| **T1-44** | naming, 426 | 3 rights | — | Codex Sol N2 could not run the collision check because SSL failed inside its sandbox; the coordinator did the check itself afterwards. | 426:1005 "Sol N2 это и имел в виду, но не смог проверить из-за SSL в песочнице; теперь проверено"; `naming-20260917/sol-n2/report.json` `ok:false, exitCode:6`, `network:true`, **2,649,693 tok** | 2.65 M tokens for a check the coordinator had to redo | 0.15.0 (network on by default) | L38 | cost only | trace-proven |
| T1-45 | naming, 426 | 2 compose | tier choice | Three naming rounds put blind proposers on three tiers (Opus, Sonnet, Codex Sol) plus informed reviewers plus a judge; **every round's winner was then killed by a collision check no agent could run**. The adopted name entered only at round 4, from a synonym list the coordinator built after an owner correction. | 426:973 (round 1 winner dropped); 426:1208 "Что убило обоих лидеров (проверка в сети после вердикта)"; 426:1285 (round 4 table) | rounds 1–2 = 16 agents, no adopted name | 0.15.0 L119 | L119 | cost only | trace-proven |
| T1-46 | naming, 426 | 4 supervise | — | Seven coordinator turns were spent answering completion notifications for agents whose reports it had already read. | 426:1288, 1291, 1294, 1297, 1523, 1526, 1529 — e.g. "Уведомление о завершении Luna V3 — уже учтено" | 7 turns of no new information | 0.15.0 | L104–105 (the completion notification is when you read its status lines) | cost only | trace-proven |
| T1-47 | 426, both runs | 7 escalate | — (successful) | The coordinator repeatedly named what it had **not** run and why (the paid `RELEASING.md` gates), rather than passing them silently. | 426:706, 426:1838 "Живые гейты из RELEASING.md … не запускались — они платные" | gates still unrun at release; owner informed each time | 0.15.0 | **L121** "No silent caps" | n/a (successful) | trace-proven |
| T1-48 | 426 field-audit | 8 delegate-or-not | — (successful) | The coordinator kept the page edits, the eval and both CHANGELOGs for itself and gave the driver, help and fixtures to one Opus writer plus two Codex reviewers; it announced the composition before and **named the composition that actually ran** after. | 426:85 (announced); 426:348 "Состав, который реально отработал: Opus W1 …, Codex Sol R1 …, Codex Astra J1; я — правки страниц, eval и CHANGELOG" | 3 agents for a 10-file, +138/−31 change | 0.15.0 L54 | L54 | n/a (successful) | trace-proven |
| T1-49 | terse-survey record | 6 synthesise | unfaithful synthesis (confessed) | A published README asserted that round one's raw returns had been lost to an expired transcript; they were intact in another directory. The claim was inferred from absence and published unchecked. | `research/2026-09-11-terse-survey/README.md` — "That was wrong… it was inferred from not finding the material in the place the later rounds were stored, and published without anyone looking in the other place" | corrected the same day, after being questioned | none | L25 | cost only | trace-proven |
| T1-50 | markup-round-0 (2026-09-11) | 6 synthesise | — | The coordinator's own edits produced regressions per round of **1, 2, 1, 0, 6, 5, 10**; round 08's ten were all qualifications added to make a sentence truer, and 4 of the writer's 27 stated checks did not hold. | `research/2026-09-11-markup-round-0/rounds.md:11–17` | drove the owner rule "a qualification is an anti-pattern" | none | L121 | cost only | trace-proven |
| T1-51 | arcadia `62078-audit` (work project — counts only) | 3 rights | — | 10 of 13 agents ended `exitCode:6` carrying 1–3 escalations each; all 10 Luna agents ran with **no** `OUTPUT_SCHEMA` (`outputSchemaOk:null`); two were re-run (`l1→l1b`, `l5→l5b`), both then exit 0. | the 13 `report.json` metadata fields only | 47,244,823 tokens in the run; 2 re-runs | n/a | L134, L149–152 | cost only | trace-proven |
| T1-52 | arcadia `61411-a` (work project — counts only) | 2 compose | — | 4 agents: 1 Astra critic of the split, 1 Fable architect, 2 Sol; all exit 0. 17 owner text blocks in the session. | `1fe60ced` lines 190, 193, 326, 732; 3 `report.json` | 2,862,100 tokens | n/a | L115, L60 | n/a | trace-proven |
| T1-53 | 2026-09-07, `b2d5773e` | 2 compose | cap exceeded, owner correction | The owner stopped a 51-agent Fable workflow mid-flight. | `b2d5773e:154` (user, 2026-09-07T13:44:36) "Останови. Ты сжег почти все токенны текущей сессии" | run killed; the standing rule "no large fan-outs" dates from here | none | L95–97 | **outcome blocked** | trace-proven |
| T1-54 | 2026-09-12, `d737ff38` | 2 compose | owner correction | Seeing one critic per round, the owner stated the per-moment pool (1 astra, 1 fable, 2 opus, 2 sol, 10 luna, 5 terra) and the defects-ledger rule in the same message. | `d737ff38:3989` (user, 2026-09-12T15:02:51) | the pool sentence now on the page | none | L41, L66–69 | cost only | trace-proven |

### Unknowns — decisions whose consequence the traces do not show

| id | what | why untraceable |
|---|---|---|
| T1-U1 | Whether the 2026-09-11 Haiku extractors' 4 lost returns contained findings that would have survived Opus refutation. | The text exists only in subagent transcripts, which are not in the root JSONL (`isSidechain:true` lines: 0 across all 46 sessions, per `per-session.md`). |
| T1-U2 | Whether the 20-agent bulk width in `verify-2026-09-12` was worth it against 5–6 strong readers. | `rounds.md:28–30` records that the comparison was never run: "the width is unproven rather than wrong". |
| T1-U3 | Per-agent token cost of every Claude agent. | The root transcript records `<subagent_tokens>` only in the task-notification blocks that survive; 8 of 14 Opus/Sonnet calls in `426` have no surviving usage line. |
| T1-U4 | Whether Terra was ever used by an orchestrated run. | 0 of 78 agent-skills reports and 0 of 16 arcadia reports carry `gpt-5.6-terra`. Only historical traces: `research/2026-09-10-chain/run-2x5/index.json` (1 of 40) and `b1:658` ("по моделям — astra 22, terra 9, luna 8, sol 2" among 41 recovered reports). |

---

## 2. Contribution by tier

### 2.1 Every Codex agent in the five runs (78) — grouped; individually identified by run/agent directory

| run | agents | tier | task (≤10 words) | documented use of the return | correctness, independently checked | cost (tokens) |
|---|---|---|---|---|---|---|
| verify-2026-09-12 | L01–L28 (20) | Luna | one atomic ledger claim each, quote + verdict | **evidence** — prose and quotes read into the marked-up ledger; verdict word discarded | 20/20 found the real file under a broken path; 19/20 verdict word wrong (coordinator's path); 1 (L11a) misaddressed the help passage | 2,914,505 (median 124,027) |
| verify-2026-09-12 | SA, SB | Sol | seven / eight claims needing commands | **decision** — SA's live run settled C9; SB settled the write-boundary | SA: 5/7 hold, 2 FAILS; SB: 6/8 hold, 2 FIXED; both later reviewed by the judge | 3,225,557 |
| verify-2026-09-12 | V2 | Astra | judge: resolve four conflicts, mark up the ledger | **decision** — produced `01-marked-up.md` and `02-proposed.md` on disk | ruled on all four conflicts including two coordinator corrections | 4,886,278 |
| issues-fix | v1–v13 (13) | Luna | verify one fixed ledger entry each in the tree | **coverage** — 12 FIXED, 1 PARTIAL, reported to the owner | checked against Astra J1, which read the tree itself: 13/13 agreed | 9,651,370 |
| issues-fix | p1, p4 (2; p2, p3 left no report by design) | Luna | live rights probes (write `/tmp`, Stop-on-card) | **evidence** — level-3 proof for N5/N6 | both behaved as predicted | 91,668 |
| issues-fix | s1–s4, t2, t3 (6) + 4 `-r2` continuations | Sol | implement / cross-review four owned files | **decision** — all landed in 11 commits | 9 of 10 review points closed or withdrawn incl. one of its own errors (30a:469) | 22,822,586 + 18,727,330 |
| issues-fix | j1 | Astra | judge the ledger at HEAD, allow deletion | **decision** — ISSUES.md deleted on this verdict | read the tree itself, not the Luna returns; ran its own probes | 4,035,508 |
| orchestrate-rules | astra-critic | Astra | check three new page rules against the record | **decision** — two clauses cut, one demoted to level 2 | caught an over-general claim (3 of 19, not 19 of 19) | 266,667 |
| field-audit | sol-r1, sol-r2 | Sol | cross-review the audit fixes / the rename | **decision** — R2 caught the terse `SEAT:` break | R1 traced the exit ladder and corrected the coordinator's assumption about it | 8,000,067 |
| field-audit | astra-j1 | Astra | judge page and help wording | **decision** — 1 hunk kept, 1 cut, 14 reworded | — | 903,705 |
| naming | luna-l1..l3, r1..r3, v1..v3, t1..t3, u1..u3, c1..c3 (18) | Luna | blind recognition / ranking of candidate names | **decision** for v, u, c (tables at 426:1285, 1451, 1520); **none** for t1–t3 (discarded) | see 2.3 | 259,492 total (median 13,556) |
| naming | sol-n1, sol-n2, sol-m1, sol-r3b | Sol | blind proposal, informed review, coining, cross-review | **evidence** for n1/m1; **partial** for n2 (blocked by SSL); **decision** for r3b | n2 could not complete its own check | 8,154,139 |
| naming | astra-j2, astra-j3 | Astra | judge the naming decision / the coined names | **decision** for both, but both verdicts were later overturned by a collision check | J2's "keep codex-delegate" survived the owner's challenge only after new evidence; J3's `proofbound` was killed | 110,488 |
| naming | sol-r3 | — | pre-turn failure, relaunched | **none** | — | 0 |

### 2.2 Claude agents in the same sessions (25)

| tier | n | where | documented use | correctness where checkable |
|---|---|---|---|---|
| Fable | 3 | b1:925 (decomposition critique), 30a:155 (architect, temp-dir exclusions), 1fe60ced:193 (architect) | **decision** ×3 | b1's critique: 5 corrected addresses matched the coordinator's own 3-of-4 spot-check (`claude-seats.md:12`, `:117–118`); 30a's design was adopted whole (30a:197) |
| Opus | 14 | 30a ×5 (D1, D2, D3, T1, T4), 426 ×6 (W1 ×3, N3, N5, M2), b1 ×2 (W1, W2), 308 ×1 (C2) | **decision** for 12; **evidence** for N3/M2 (blind proposals not adopted) | W1 (b1) found the root cause of the whole address drift and made one false claim, caught by the coordinator; W2 overturned a coordinator claim (T1-12) |
| Sonnet | 8 | 426 ×8 (P1–P3 before-readers, Q1–Q3 after-readers, N4, M3) | **evidence** ×6 (the before/after measurement); **none** for N4/M3 (blind names not adopted) | the 3+3 reader arms are the only controlled measurement of the rename's effect on a user-facing line |
| Haiku | 50 direct (b1, 2026-09-11) + **57 as the `codex-agent` wrapper** across the four sessions | b1:274 (31 lens A, 19 lens B); wrapper: 57 Agent calls with `subagent_type: *:codex-seat` | direct: **evidence** for 12 surviving findings out of ~36 candidates; wrapper: coverage (it never answers the task) | 4/50 direct returns lost to schema validation; 56 of 57 wrapper calls resolved (the 57th could not resolve the agent type, T1-14) |

### 2.3 The two checkable correctness sets the owner named

**(a) Twenty Luna verdicts of 2026-09-12 against the architect's corrections.**
The Fable architect resolved all 32 claim addresses against the tree before the fan-out and corrected five
(`claude-seats.md:12`: 55→80, 70→114, 62-64→99-101, 61,96→99,140, 156→200). Of the 20 Luna returns:
**20/20 located the real file and quoted it verbatim** despite a path that did not exist; **19/20 returned the
verdict word `MOVED`** while their own prose said the claim held (`rounds.md:12`; `codex-seats.md:9–14`); **1
(L11a) misaddressed the extended-help passage** and was re-run as **L11b**, which corrected it
(`codex-seats.md:110` vs `:120–123`). One (L06) produced the only substantive correction no strong agent
produced (T1-16).

**(b) Eighteen Luna recognition readers of the naming round against the final choice (`entrust` / `codex` / `orchestrate` / `cleanup`).**

| set | n | question | ranked 1st | matches the final choice? |
|---|---|---|---|---|
| L1–L3 | 3 | blind recognition of 7 command sets | `codex-delegate:codex` 3/3 | **no** — the name was abandoned |
| R1–R3 | 3 | recognition of coined names | `proofbound` (1,2,1) | **no** — killed by a collision check |
| V1–V3 | 3 | verb-name recognition | `entrust` 1,1,1 | **yes** |
| T1–T3 | 3 | triple coherence | discarded (coordinator's generator bug, T1-39) | n/a |
| U1–U3 | 3 | triple coherence, re-run | `delegate/orchestrate` 1,1,1; `entrust/orchestrate` 2,3,2 | **partly** — confirmed `orchestrate`, ranked the chosen plugin name second |
| C1–C3 | 3 | cleanup-name test | `cleanup` 1,1,1 | **yes** |

**6 of 18 predicted the final choice, 3 confirmed a component of it, 6 pointed elsewhere, 3 were discarded on
the coordinator's own defect.** Every round whose winner the coordinator adopted was adopted after an
independent collision check the agents could not run.

**(c) The eleven-agent wave of 2026-09-11 (round 07), independently deduplicated by Fable.**
`research/2026-09-11-markup-round-0/reviews/07/fable-dedup-and-rank.md` attributes each of 87 deduplicated
findings. Raiser mentions: **astra 24, opus-a 22, opus-b 17, sol1 7, sol2 5, luna1–luna5 8 between them** —
and Luna is the sole or first raiser on only two findings, both ranked STRUCTURE (low): F54, F55.

### 2.4 Summary per tier (the five agent-skills runs plus the Claude agents in the same sessions)

| tier | agents | documented-use rate | correctness where checkable | cost | tokens/agent (median) |
|---|---|---|---|---|---|
| **Luna** (bulk, Codex) | 53 | 50/53 = **94 %** (the 3 with none are luna-t1..t3, discarded on the coordinator's own generator bug) | 20/20 recovered from a broken path; 19/20 verdict word wrong (coordinator's fault); 1 misaddress re-run; 13/13 agreed with an independent judge; 1 unique correction | 12,917,035 (15 % of Codex spend) | **90,065** |
| **Terra** (cheap, Codex) | **0** | — | — | 0 | — (never used in any orchestrated run on this machine) |
| **Sonnet** (cheap, Claude) | 8 | 8/8 = 100 % (6 as the before/after measurement, 2 quoted in the round summaries) | the only controlled before/after reader measurement in the corpus | not recorded per agent | n/a |
| **Haiku** (bulk, Claude) | 50 direct + 57 as wrapper | direct: 46/50 returned, 12 findings survived refutation; wrapper: 57/57 | 4/50 could not satisfy the five-field schema; most of its candidate findings died under Opus refutation | not recorded per agent | n/a |
| **Sol** (strong, Codex) | 18 | 17/18 = 94 % (the one with none is the pre-turn failure `sol-r3`) | caught a cross-plugin break (T1-36); 1 could not finish its own check (T1-44); 1 died pre-turn | 60,929,679 (**73 %** of Codex spend) | 3,032,161 (**34× Luna**) |
| **Opus** (strong, Claude) | 14 | 14/14 = 100 % (12 decisions, 2 blind proposals quoted as evidence) | 1 false claim rejected by the coordinator; 1 refutation of a coordinator claim | not recorded per agent | n/a |
| **Astra** (top, Codex) | 6 | 6/6 = 100 % | 2 of 6 verdicts later overturned by evidence the agent could not gather | 10,202,646 (12 %) | 903,705 |
| **Fable** (top, Claude) | 3 | 3/3 = 100 % | the single highest-value return in the corpus (T1-13) | not recorded | n/a |

Work project, counts only: `61411-a` 4 agents (1 Astra, 2 Sol, 1 Fable), all exit 0, 2.86 M tokens, stage
codes touched: 2, 5. `62078-audit` 13 agents (10 Luna, 2 Sol, 1 Astra), 10 exit 6, 47.24 M tokens, 2 re-runs,
stage codes touched: 3 (rights, 10×), 4 (re-run, 2×).

---

## 3. Continuations (every case the coordinator continued an agent)

12 `SendMessage` calls, 4 `RESUME:`-style Codex thread continuations (reports with `resumedFrom` set), 3 `TaskStop`.

| # | session:line | target | what was sent | what the continuation yielded |
|---|---|---|---|---|
| 1 | 30a:292 | Codex Sol S1 wrapper | round 2 on the cleanup diff | `s1-sol-cleanup-r2`, `resumedFrom:01a0973c…`, 5,323,553 tok, `status:partial` |
| 2 | 30a:314 | Opus D2 | re-review S1's round-2 diff | closed the cross-review of the cleanup line |
| 3 | 30a:401 | Opus D1 | fix the findings of Codex Sol S2 | the driver diff that landed in 6 commits |
| 4 | 30a:441 | Codex Sol S2 wrapper | re-review the driver diff | `s2-sol-review-driver-r2`, `resumedFrom:01a09776…`, 4,609,147 tok, `partial`; 9 of 10 points closed (30a:469) |
| 5 | 30a:729 | Codex Sol T2 wrapper | round 2 on README/references | `t2-sol-readme-refs-r2`, `resumedFrom:01a09a69…`, 5,833,858 tok, `done` |
| 6 | 30a:736 | Opus T1 | apply Sol T3's findings on the seat page | the seat-page diff that landed |
| 7 | 30a:780 | Codex Sol T3 wrapper | re-review the seat page | `t3-sol-review-seatpage-r2`, `resumedFrom:01a09a77…`, 2,960,772 tok, `done` |
| 8 | 30a:784 | Opus T4 | re-review T2's revised docs | 8 of 10 closed (30a:838) |
| 9 | 30a:788 | Opus D3 | Sol S4's findings on the lock diff | lock 58/58 three times; the residual window named "narrowed, not closed" |
| 10 | 426:192 | Opus W1 | two more paths allowed, two named fixes | both fixes landed in the same tree |
| 11 | 426:302 | Opus W1 | apply the judge's rewords to help and references | the judge's 14 rewords applied by the writer, not the coordinator |
| 12 | **426:1628** | Opus W1 | resume after the previous session ended mid-work | rename finished (58 paths); the only cross-session recovery in the corpus |
| — | b1:695, b1:733 | two running fan-outs | `TaskStop` | stopped agents computing on the mis-joined input of T1-05 |
| — | 30a:1088 | Codex Luna P4 | `TaskStop` from the agent card | level-3 proof that Stop reaches the driver (30a:1098) |

Second-round Codex cost: **18,727,330 tokens across 4 continuations**, against 22,822,586 for the six first
rounds — a continuation costs about the same as a fresh agent.

---

## 4. Roles actually assigned

| role | verify-2026-09-12 | orchestrate-rules | issues-fix | field-audit | naming | 2026-09-11 wave | arcadia 61411-a |
|---|---|---|---|---|---|---|---|
| scout (coordinator itself, inline) | 1 | 1 | 1 | 1 | 1 | 1 | 1 |
| architect / split critic | 1 Fable | — | 1 Fable | — | — | — | 1 Fable + 1 Astra |
| bulk verifier | 20 Luna | — | 13 Luna | — | 18 Luna | 50 Haiku | — |
| strong reader / re-deriver | 2 Sol + 2 Opus | — | — | — | — | 16 Sonnet | — |
| implementer (writer) | — | coordinator | 2 Opus + 2 Sol | 1 Opus | 1 Opus | — | coordinator |
| cross-reviewer | — | — | 4 (2 Opus ↔ 2 Sol), 2 rounds | 2 Sol | 1 Sol | — | 1 Sol |
| refuter / adversarial | — | — | — | — | — | 10 Opus | 1 Sol |
| judge | 1 Astra | 1 Astra + 1 Opus (critics) | 1 Astra | 1 Astra | 2 Astra | 1 Astra | — |
| live prober | — | — | 4 Luna | — | — | 7 Luna | — |
| reader / recognition panel | — | — | — | 6 Sonnet | 18 Luna | — | — |
| blind proposer | — | — | — | — | 3 + 3 (Opus, Sonnet, Sol) | — | — |
| dedup-and-rank | — | — | — | — | — | 1 Fable (round 07) | — |

Roles never assigned anywhere in the corpus: a standing "completeness critic" as its own agent (the page's
L120 role is done by the coordinator or folded into the judge), and any Terra agent.

---

## 5. Owner corrections (27 traced)

| # | session:line | date | stage | what the owner did |
|---|---|---|---|---|
| 1 | b2d5773e:154 | 09-07 | 2 | **stopped** a 51-agent workflow: "Останови. Ты сжег почти все токенны текущей сессии" |
| 2 | b1:177 | 09-11 | 1 | narrowed the research directions to three |
| 3 | b1:229 | 09-11 | 2 | asked for a bigger wave and for overlapping tasks between agents |
| 4 | b1:809 | 09-11 | 2 | warned that Astra's quota was at 1 % |
| 5 | b1:858 | 09-11 | 7 | `[Request interrupted by user]` |
| 6 | b1:895 | 09-12 | 2 | added Fable to the pool, named the critic/architect/planner roles, asked to try Luna and report on it |
| 7 | b1:941 | 09-12 | 1 | "не забудь завести ветку под текущую задачу" — a forgotten prerequisite |
| 8 | b1:955 | 09-12 | 2 | asked that the 0.14.0 novelties be exercised |
| 9 | b1:1335 | 09-12 | 1 | set the next campaign's end condition (delete ISSUES.md) |
| 10 | d737ff38:3989 | 09-12 | 2 | stated the per-moment pool and the defects-ledger rule; objected to one critic per round |
| 11 | 30a:472 | 09-13 | 1 | approval plus a new item ("проверь и поправь кандидаты в ISSUES.md") |
| 12 | 30a:1282 | 09-13 | 7 | "mege conflict" — pointed at a merge conflict the coordinator had not surfaced |
| 13 | 426:81 | 09-16 | 1 | struck step 1 of the plan (no ISSUES.md) |
| 14 | 426:379 | 09-16 | 6 | objected to "Сиденье" in the coordinator's own prose |
| 15 | 426:395 | 09-16 | 6 | agreed to rename the concept and possibly the skill |
| 16 | 426:411 | 09-16 | 6 | "Вместо `Codex agent Sol R1` можно просто `Codex Sol R1`" |
| 17 | 426:712 | 09-17 | 5 | "Поправь два хвоста" |
| 18 | 426:757 | 09-17 | 1 | re-framed the question from naming to positioning |
| 19 | 426:764 | 09-17 | 6 | picked `delegate` from the proposals |
| 20 | 426:979 | 09-17 | 6 | rejected the withdrawal of `delegate` and asked what it actually risks |
| 21 | 426:1008 | 09-17 | 6 | "Так в этом проблема" — rejected the coordinator's argument |
| 22 | 426:1018 | 09-17 | 1 | forbade the vendor name in the plugin name |
| 23 | 426:1214 | 09-17 | 6 | rejected "wait until the second backend" as neutral |
| 24 | 426:1232 | 09-17 | 5 | "хотите данных, а не мнения" |
| 25 | 426:1300 | 09-17 | 5 | supplied a fact the coordinator had not checked |
| 26 | 426:1454 | 09-17 | 1 | extended the scope to `cleanup` |
| 27 | 426:1554 | 09-17 | 6 | "Сейчас нет такого скила как `:codex-agent`" |

Distribution by stage: **1 decompose ×8 · 2 compose ×5 · 5 verify ×4 · 6 synthesise ×8 · 7 escalate ×2.**
Nine more owner messages in the same sessions are bare approvals ("го", "apply", "влил", "готово",
"продолжи", "Do it", "Да", "Запускай") and are not counted as corrections. The work project's 17 owner text
blocks are not classified here (counts only).

---

## 6. CHECK — the five "Got wrong" cells of `research/2026-09-12-issues-verification/rounds.md`

| cell (rounds.md line) | what it says went wrong | accepted / propagated by the coordinator? | trace |
|---|---|---|---|
| **Decomposition** (`:10`) — "the file path in every bulk prompt carried a doubled directory segment and did not exist" | the coordinator's own defect | **Its own, disclosed, not propagated.** It first misread the effect as a Luna failure, then retracted before telling the owner, and published the defect at the head of the returns file. | `codex-seats.md:9–11`; b1:1183 → b1:1192 "Снимаю предыдущий вывод: это была моя ошибка, не луны"; `rounds.md:10` |
| **Decomposition** (`:10`) — "four ledger addresses had been spot-checked, three of them already stale" | the coordinator's own defect | **Its own, disclosed and corrected before the fan-out** by the Fable architect, whose fuller count it matched. | `claude-seats.md:117–118`; `claude-seats.md:12`; b1:892 |
| **Architect** (`:11`) — "—" | nothing | no incident | `rounds.md:11` |
| **Bulk** (`:12`) — "19 of 20 returned the verdict word MOVED while their own prose said the claim holds" | agent error caused by the coordinator's path | **Not propagated.** The returns file instructs the reader to ignore the verdict word; the coordinator adjudicated from prose and quotes. It **stays a coordinator incident** because the prompt caused it (T1-09). | `codex-seats.md:12–14` "Read their prose and quotes, not the verdict word"; b1:1192 |
| **Bulk** (`:12`) — "one misaddressed the extended-help passage" | agent error (L11a) | **Not accepted: re-run.** L11b re-located the passage to `driver.mjs:321–334` and its answer is the one used. | `codex-seats.md:110` (L11a, `driver.mjs:508–511`) vs `:120–123` (L11b); `verify-2026-09-12/L11a` and `/L11b` both exist |
| **Strong** (`:13`) — "one said the plugin was not installed on the machine when the registry lists it" | agent error (Opus W1) | **Rejected in writing and handed to the judge as conflict 2.** | `claude-seats.md:60–62`; b1:1231; b1:1259 |
| **Strong** (`:13`) — "one cited a comment about the approvals reviewer as evidence about `/tmp`" | agent error | **Stays an agent error.** No trace shows the coordinator repeating it: the `/tmp` conclusion it published rests on SA's own `driver.mjs:1139–1156, 2111–2114` quotes and on its own L06 check, not on that comment. | `codex-seats.md:236, 260` (SA's cited evidence); b1:1205; b1:1283 |
| **Strong** (`:13`) — "one called a remaining ambiguity a remnant of a fixed finding" | agent error | **Stays an agent error.** The published markup splits the two (entry C9 filed as "help and `--report-file` use the word report for different surfaces"), which is Opus W1's own corrected reading. | `claude-seats.md:48–50`; b1:1226 |
| **Judgement** (`:14`) — "—" | nothing | no incident | `rounds.md:14` |

**Result: of the seven recorded errors, two are the coordinator's own (both disclosed in the record it wrote),
two were caught and neutralised (re-run, rejected), and three stayed agent errors that never entered the
final account.** No unfaithful synthesis was found in this round: every return that was rejected was rejected
with evidence, and the one reading the Astra critic called over-general was cut from the shipped text
(T1-20).

---

## 7. Three costliest incidents

1. **T1-05** — the mis-joined report/paragraph pairs (2026-09-11): 6 Luna agents plus part of 6 Opus agents
   computed on garbage, two `TaskStop` calls, four anchoring rules tried, and the measurement was withdrawn
   with **no result at all**. The only outcome-blocked incident caused by the coordinator alone.
2. **T1-22** — 19 blocking `TaskOutput` polls that each returned ~32 KB of a subagent transcript:
   **193,389 tokens (23.5 %) of session `30a03d40`'s attributed context and 92,469 (7.6 %) of `42691a3b`'s**,
   spent on supervision that returned one line of information.
3. **T1-09** — the doubled path in all 20 bulk prompts: 20 paid Luna turns (2.9 M tokens) whose verdict field
   was unusable, one wrong diagnosis published internally before retraction, and three page rules written
   afterwards to prevent a recurrence (L70, L115, L118).

Runner-up on pure token cost: **T1-44**, 2,649,693 tokens for a Sol agent that could not complete its own
check because SSL failed in its sandbox, after which the coordinator did the check itself.
