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

## The openings, side by side (2026-09-25)

The owner asked which top of the page — everything above Quick start — is better and sells more, ours
(`03-fixed.md`) or the reference's, and why, from clean agents; then «Задействуй кодекс еще. 40 лун как минимум».
Blind, both orders (`openings/`): the first four readers — Codex Astra, Codex Sol, Claude Opus, Claude Sonnet —
chose ours, Opus "only by a little"; of 46 Codex Luna votes, 37 counted: ours 32, the reference's 5 (order a
17 to 3, order b 15 to 2). Nine were not counted: in order b, `cat 1.md 2.md` runs our text straight into the
reference's opening `<div>`, and the reader took both for one file. Every vote with its reason: `openings/votes.md`.

- **For ours**: what it is and what you get in the first sentence, then bullets that name a command you would type
  and what it does.
- **Against the reference**: a banner, eight badges, a stats line and navigation before a word on what it is
  (21 of 37 mention them); bullets that list its parts — "a comprehensive agent-workflow skill with 7
  domain-specific reference files", "25 commands … and more" — rather than what you do (21 of 37).
- **For the reference**, even from readers who chose ours: its problem line, "AI agents are only as good as the
  workflows they operate in. Without guidance, you get the same predictable mistakes: …", which Opus called the
  strongest selling line in either file; and the badges as signs of a maintained project.
- **Against ours**: "hold up in production" called generic (7 of 37); the draft's own pain bullet ("Made for LLM
  work") had been cut by the rules critic under rule 6's "no failure modes".

### Three openings, each file read on its own (2026-09-25)

After rules 5, 6 and 14 changed (`9ea29a7`, `ececebc`), the writer rewrote only the opening: `04-opening.md`, E,
188 words — the reader's problem first ("Demos forgive what production doesn't: …"), then capabilities with what
each means for the reader, no steps. Twenty Codex Luna readers ranked E, D2's opening and the reference's, blind,
in all six orders, each file read with its own command (`openings/ranking3.md`, files under `openings/three/`):

| | first place: E / D2 / C | mean rank: E / D2 / C | E over D2 | E over C | D2 over C |
|---|---|---|---|---|---|
| better | 10 / 3 / 7 | 1.65 / 2.20 / 2.15 | 14 of 20 | 13 of 20 | 10 of 20 |
| sells more | 13 / 1 / 6 | 1.50 / 2.30 / 2.20 | 17 of 20 | 13 of 20 | 11 of 20 |

- E leads on both questions and against both texts; the reasons quote its problem line and "find these weak spots
  in your app and fix them".
- D2 against the reference is even here, 10 to 10 and 11 to 9. The first round's 32 to 5 does not survive the
  change of method — separate reads, three texts at once — so that round's margin is not evidence; which of the
  two changes moved it is not isolated.
- The reference's first places rest on its numbers and badges, called credible and established, the same things
  others call a badge wall.
