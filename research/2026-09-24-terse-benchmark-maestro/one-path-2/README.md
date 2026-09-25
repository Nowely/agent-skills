# The one path's second run — iteration D2, 2026-09-25

The same README as test D, written by `rewrite` after the pages changed on 2026-09-25 (commits `fd98fe8`,
`f570c52`): a pleasant read above every rule, the sentence rules in a role, a check after the repair, numbered
texts. Same snapshot, purpose, genre notes, questions and task as D (`in/`, `briefs/`).

## Timeline

| Stage | Agents | Wall time |
|---|---|---|
| the draft | writer, Claude Opus — read only, ran nothing | 20:13–20:43, 30.0 min |
| every critic at once | truth ×3 and the rationalizer, Claude Opus; form, terms, rules, sentences, Claude Sonnet; four question readers, Codex Luna; the task reader, Codex Sol | 20:44–21:08, 23.5 min; the slowest, truth 1, 24.0 min |
| one repair | the writer | 21:08–21:21, 13.1 min |
| the check | truth on the changed lines, Claude Opus; the four question readers again; two cold readers, Codex Astra and Codex Sol | 21:21–21:41, 19.8 min; the readers took under a minute |
| the fix | the writer, the check's lines only | 21:41–21:46, 4.4 min |
| **in all** | 21 agents | **1 h 33 min** |

Each agent's time, tokens and tool calls: `agents.json`. **Who changed what**: `impact.html`, built by `impact.mjs`
from `repairs.json`, in which the writer logged every finding with the text before and after.

## Result

- `01-draft.md` 1,049 visible words → `02-repaired.md` 934 → `03-fixed.md` 926; the median prose sentence 13 → 10
  words (C 11, D 17); code spans per sentence 0.57 → 0.42 (C 0.30, D 0.94).
- Truth on the draft: 10 sentences refuted or overstated (D: 22). After the repair, 2 of 30 changed lines failed —
  one found by reading (`/diagnose` maps two gaps to commands that do not fix them), one by running (what the
  extension writes to MCP configs). The fix narrowed both.
- Question readers: 4 of 4 answered from the draft and again from the repaired text. Task reader: GOAL achieved,
  3 guesses, no untrue sentence.
- The two cold readers found no contradiction; Sol could now tell `/streamline` from `/temper`, which D's cold reader
  could not. One real ambiguity: one `code --install-extension` command shown for three editors — fixed.
- Budgets were written before the text (20:31 against 20:40); only Commands ran over, 585 of 560.
- Writes outside `$TMPDIR`: the writer's scratch in `/tmp` (deleted at once); truth 1, truth 3 and the check's
  truth critic used npm's cache in `~/.npm`; truth 1 once tried to launch a browser whose profile is under
  `~/Library/Caches/ms-playwright-mcp`.

## What the run measured about the pages

- **Refuted**: the writer who reads rather than runs is faster — 30.0 min against D's 32.7; the time is in reading.
- **The truth critics are the critical path twice**, 24 and 20 min, each rebuilding the same harness. The owner,
  2026-09-25: «Надо упростить проверку правдой по итогам сессии. Сейчас как минимум он слишком ответственен, если аж
  запускает стенды и прочее. Он скорее должен опираться на доступные readonly информацию», then: «либо может
  разделять два уровня (не только для проверки правды) условно лайт режим и полный».
- Every run-based finding of this round's truth critics names the code lines that cause it.
- The rationalizer asked to cut three of the five advantages; the writer kept them by rule 5.

## Open questions for the owner

- The writer's Q1: a VS Code reader with only Copilot — `@maestro` cannot finish `/teach-maestro` (no history, no
  tools), so what do they type first? The text says "your coding tool's chat".
- The writer's Q2: keep the maestroskills.dev link? Kept.
- Both cold readers called "hold up in production" a promise the page does not show; the writer kept it by rules 4
  and 16.
