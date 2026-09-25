# The one path's first run — test D, 2026-09-24/25

`rewrite` rebuilt as one path (commits `2d6d6e3`, `829c235`), run on the benchmark's snapshot: sharpdeveye/maestro
at `00f9115`, its root README removed. Inputs in `in/`: the rules as of `23036f0`, the stand-in owner's purpose, the
genre's order. One writer, twelve critics at once, one repair. The owner has not read the text: two cold readers
assessed it at the owner's request, and the owner turned their findings into the next iteration's tasks.

## Timeline and cost

| Step | Agents | Wall time | Tokens |
|---|---|---|---|
| the draft | writer, Claude Opus | 23:15–23:48, 32.7 min | 373k |
| every critic at once | truth ×3 and the rationalizer, Claude Opus; form, terms, rules, Claude Sonnet; four question readers, Codex Luna; the task reader, Codex Sol | 23:49–00:11, 22 min; the slowest, truth 1, 21.9 min | truth 296k, 256k, 248k; rationalizer 145k; terms 123k; rules 126k; form not recorded; readers ~24k each; task 414k |
| one repair | the writer, resumed | 00:11–00:25, 14.2 min | 501k, cumulative on the thread |
| **in all** | 14 agent runs | **69.9 min** (23:15:51–00:25:42) | ~1.8M Claude, ~0.5M Codex |

## Result

- `01-draft.md`, 1,017 visible words, is the file the critics read as `writer/draft.md`; `02-repaired.md`, 1,048,
  after 60 findings applied and 11 declined (`repairs.md`).
- `rule1.mjs` made 5 reports, 3 of them link URLs read as paths (ISSUES.md E40); `sections.mjs` found nothing over
  budget, because the budgets were written after the repair (`measures.md`).
- Two cold readers, Codex Astra and Codex Sol, one prompt each — "Assess the quality of this README" — on a copy of
  `02-repaired.md` (`reviews/`): Sol 7/10, Astra no mark. Both put the `.vscode/mcp.json` overwrite and `@maestro`'s
  no-apply limit where a reader chooses the route, and both caught "nine coding tools" in Quick start against "ten
  coding tools" in How it works — both written by the repair, in answer to two different findings (`repairs.md` 15
  and 42). Astra could not tell `/streamline` from `/temper`. Both asked for prerequisites, troubleshooting,
  uninstall steps and a licence, which rules 3 and 15 exclude. Their first launch asked for `WEB_SEARCH: live`,
  which this machine's policy refuses; they ran with `cached` and searched nothing (ISSUES.md E1).
- Sentences (`measures.md`, a rough count): median 17 words in `02-repaired.md` against 11 in C, and 0.94 code spans
  per prose sentence against 0.30.
- Found by grep after the run: `writing-rules.md` and `curse-of-knowledge.md` were in no role of the one path, where
  `2d6d6e3` had said every concern of the old stages was kept as a role.
- A correction to the reflection sent to the owner: the extension sentence was 48 words in the draft and 52 after
  the repair; truth replaced the ten folder names with conditions and did not lengthen it much. The density was the
  writer's from the draft.

## The calibration of a pleasantness mark

The owner, 2026-09-25: «Нужно еще оценивать итоговую понятность и "маркетинговую" приятность. Текст должен быть
легким для чтения и понимания.» A mark goes beside a text only if it reproduces the owner's read of A, B and C. Six
cold readers — Codex Astra and Codex Sol, each on the three texts under blind labels (`calibration/key.json`), one
prompt (`calibration/prompts/`): where it was pleasant and where it stopped, the project in one sentence, would you
try it, the one change, `PLEASANT: 1-10`. 15–21 s and 29–32k tokens each.

| Text | the owner | Astra | Sol |
|---|---|---|---|
| C | 1st | 6 | 7 |
| B | 2nd | 6 | 7 |
| A | 3rd | 6 | 6 |

The mark does not separate the owner's first choice from the second, and all six readers, C's among them, said the
page stopped being pleasant at the command catalogue and asked for one worked example instead — against rule 10 and
against the text the owner put first. One trial per cell. The mark is dropped; a cold reader stays in the path to
find defects and gives no mark (`roles.md` brief 11).

## What the owner decided, 2026-09-25

- «Не будем править текущий вариант. Сначала составим список задач на улучшение, отрефлексируем, поправим скилы,
  сделаем новую итерацию. Поэтому зря ты назвал файл финал.» The repaired text is `02-repaired.md`; no file of this
  run is called final.
- «Текст должен быть приятным для чтения. На самом деле, это критерий номер 1. Приятный текст - продающий текст. В
  него легче погрузиться, с ним приятнее работать. Одним из свойств такого текста является оформление.»
- Asked whether a route's cost goes into Quick start by a new rule (a) or stays in How it works (b): «Скорее б. Тут
  какое дело, нет необходимости грузить пользователя техническими деталями. Можно просто не использовать мсп в
  быстром старте. Можно глянуть, как этот момент обыгрывается в эталоне. Там либо вообще нет этого упоминания, либо
  непосредственно рядом с секцией про мсп. Все, весь текст должно смотреть естетственно и оганично. Нет потребности
  прям все донести до пользователя, всю техническую подноготную, каждый технический камушек.» The reference has no
  MCP in its Quick Start and says nothing of the overwrite.
- On the task list: «Ты мне и нужен, чтобы этим занимался - искать и делал лучшее.»

## The tasks and where each landed

| # | Task | Where |
|---|---|---|
| 1 | a pleasant read above every rule | `references/rules.md`, "First: a pleasant read" |
| 2 | the sentence rules in a role again | `roles.md` brief 10, and the writer's brief |
| 3 | a narrower route and its cost out of Quick start; How it works holds what its reader needs | rules 8 and 12 |
| 4 | truth proposes the shortest true sentence, or cut | brief 3 |
| 5 | alike rows say what tells them apart | rule 10, brief 5 |
| 6 | the writer reads the code, the truth critics run it | brief 1, `rewrite` step 3 — a hypothesis on time until the next run |
| 7 | a check after the repair: truth on the changed sentences, the question readers again, two cold readers | `rewrite` step 5; briefs 3, 8, 11 |
| 8 | word budgets before the text | brief 1, step 3 |
| 9 | numbered texts, none final before the user's word | steps 5 and 6 |
| 10 | agents return their reports, the coordinator saves them | `roles.md` |
| 11, 12 | a pleasantness mark, calibrated first | calibrated above and dropped |
| 13 | `rule1.mjs` reads link URLs as paths and flags the install block | ISSUES.md E40 |

The next iteration on maestro measures whether these land, the owner's maestro feedback among them; whether they
carry to another text needs another repository.
