# Skeleton 03: `plugins/terse/README.md` — 2026-09-24

## 1. Purpose, base, and the genre's order

The owner's first statement, verbatim (`purpose.md:5–8`):

> в моем понимании, главная миссия - цель плагина. Это оценка и улучшение текста (чтобы это ни значило).
> Документация, комментарии, проза, текст и даже код, и тд - не важно. Плагин итеративно через пайплайн и
> мультиагентность, храня множество правил, бестпрактис и быть способными их найти, оценивает текст,
> делает его лучше итеративно. Для этого есть пайплайн. Без признака нейрослопа, неся истинную ценность.

The rendering (the coordinator's; the Russian governs; `purpose.md:12–16`):

> As I understand it, the main mission is the plugin's goal: assessing and improving text, whatever that
> means. Documentation, comments, prose, text, even code — it does not matter which. Iteratively, through a
> pipeline and multi-agency, holding many rules and best practices and being able to find them, the plugin
> evaluates text and makes it better, iteratively. The pipeline exists for that. Without the marks of AI
> slop, carrying real value.

The owner's second statement, verbatim (`purpose.md:32–41`):

> По поводу области. Моя цель, научить работать и улучшать любой текст. По сути за ними часто стоит одна
> суть. Нигде не требуется проза, вода, нейрослоп и прочее. За каждым словом должна быть причина. Каждое
> слово должно нести смысл и тд. Это относится к коду и прочему. Сейчас мы работаем на реадме, но позже
> будем эксперементировать с документацией, кодом и тд. Для этого нужно разбирать и выделять скелет, суть,
> структуру, смыслы. Их оценивать, собирать информацию о бестпрактисах и тд. В общем этот ворквлоу мы и
> пытаемся итеративно построить.

> REAMDE всегда должен соответствовать коду. Если вышла версия 1, а в коде мы запилили еще 10 штук новых
> фич, значит реадми описывает текущую действительность. В нем не должно быть без везкой причины привязка
> к версии.

The rendering (`purpose.md:43–48`):

> Rendering: the goal is to learn to work on and improve any text; one essence usually stands behind all of
> them; nowhere is prose, water or AI slop required; every word must have a reason and carry meaning — code
> included. The README is the first subject; documentation and code come later. The workflow being built:
> take a text apart into its skeleton, essence, structure and meanings; evaluate them; gather best
> practices. A README always matches the code as it is; it carries no binding to a version without a weighty
> reason.

The third governing input, the owner's read of round 03, verbatim (`skeleton-read-02.md:22–29`):

> Как оказалось, What was measured - это секция, которая, на мой взгляд, не нужна readme. по крайней мере
> в таком виде. Она по сути показывает: вот мы два раза ее запустили и получили такой результат - у нас
> даже цифры есть. Какую ценность оно будет нести пользователю, который захочет прмименить ее у себя?
> Почему ему должно быть интересно, что создатель плагина там с ним делал. Ему главное результат. Если
> нужна техническая информация для дальнейшего иехнического развития, то ее можно держать где-то внутри,
> но не в реадми. Здесь же было бы полезнее дежржать архитектуру пайлпана (как работает агент, потому
> что How it works похоже не оченб на это отвечает), какие методы проверяет, откуда эти методы и почему.
> В общем техническая информация о составе плагина, гарантиях качества.

The rendering: the user wants the result, not what the author did with the plugin; technical information
about the plugin's composition and quality guarantees belongs in the README, results and development notes
inside the plugin.

Base: structure 01 (ranked 2nd, 3rd and 1st by the three critics), in the owner's order (skeleton 02),
revised by the owner's read of round 03. The README describes the code in the repository as it is.

**The genre's order.** Counted from the headings of the fetched copies (`survey/synthesis-sources/`,
`survey/fetched/`; heading counts over all 39 from `terms-evidence/headings.txt`). G = the 9 exact-genre
plugin READMEs; the three `anthropics/claude-code` plugins carry that repository's 147,780★.

| Place | What the genre puts there | N of M | This skeleton |
|---|---|---|---|
| 1 | what it is — a line under the H1, or an Overview / What / Why section | 9 of 9 G | **follows**: the opening |
| 2 | install, often as Quick start with the first run | 8 of 9 G, right after what-it-is in 4 of 8; first in 4 of 6 agent READMEs (OpenCode 209,631★, Codex 126,161★, OpenHands, gpt-engineer) | **follows**: Quick start |
| 3 | the inventory — skills, commands, plugins | 7 of 9 G; after install in 4 of 7 (superpowers 290,578★), before it in 3 (anthropics/skills 177,800★) | **follows**: Skills |
| 4 | How it works | 4 of 9 G; 6 of 39 counting Architecture (OpenHands, code-review) | **follows**: How it works, as the steps of each skill |
| 5 | what it checks, why, how good it is | Checks / Rules / Styles in 6 of 7 text checkers (7 of 39); beside How it works in 2 of 9 G (superpowers' Philosophy, wshobson's Quality evaluation); 1 of 9 G folds it into Technical Details (code-review) | **follows**: Checks and guarantees |
| tail | License 6 of 9 G, Troubleshooting 3, Contributing 2, Updating 1, an evidence section 1 | — | **departs**: none of them, on the owner's word |

Exemplars: **maestro** (1,478 words, 593★) — What is Maestro? → Quick Start › Combine Commands → The Skill → 25
Commands → …; **09-reduction** (1,531 words, the round the owner said looked better) — opening → Quick start
(install, "You need:", an example, a first-run note) → Commands → Update and uninstall → … → How it works.

**Inside Quick start.** Of the 8 G that carry an install or quick-start section, 4 divide it with
subheadings (superpowers, anthropics/skills, plugin-dev, wshobson), 1 with bold lead-ins (claude-hud's
"**Step 1: Add the marketplace**"), 3 with neither. Of the 5 agent READMEs with one, 4 use subheadings
(Codex, OpenHands, gpt-engineer, OpenCode). By phase — install, then use — in Codex ("Installing and
running", "Using Codex with your ChatGPT plan"), gpt-engineer ("Install", "Setup API key", "Create new code
(default usage)"), plugin-dev ("Creating Your First Plugin") and maestro ("Combine Commands"); the rest
divide by host. So: `###` subheadings, by phase. For the main case's name, "Workflow" heads 5 of 39
(superpowers' "The Basic Workflow"), "Usage" 10 of 39; the owner's word is "workflow" (`skeleton-read-02.md:19`).

**The technical part.** Two sections, because the genre gives what it checks a section of its own (6 of 7
text checkers; 2 of 9 G beside How it works) and one combined technical section appears once (code-review).
The owner's words cover both: «архитектуру пайлпана (как работает агент…)», «какие методы проверяет, откуда
эти методы и почему», «гарантиях качества» (`skeleton-read-02.md:27–29`).

## 2. Sections

Budgets are `sections.mjs` counts: whitespace-separated tokens under a `##` heading — table pipes, list
markers, fence lines and `###` lines included, the `##` line excluded; `(opening)` includes `# terse`.
Block budgets under `###` exclude the `###` line.

### 2.1 `# terse` and the opening, no heading — 70

- **Purpose.** Say what terse is — a Claude Code plugin that assesses and improves any text, the README
  first, in rounds of edits by several AI agents working from rules and best practices — and its aim: text
  in which every word carries weight and meaning, without AI slop; not a compressor; with one concrete
  reason to want it (`audit.md:34–39`).
- **Excludes.** A question first; "documentation" as the scope; the README as the only subject; a roadmap or
  version; skill names and commands; install; the order of the skills; any number or date; where anything
  is written; freedom from AI slop as a result rather than the aim; any language or file format as verified.
- **Device.** One plain paragraph under the H1; no tagline, badge, banner, count or navigation line.
- **Rests on.** A01, A06; `purpose.md:32–34`; `skeleton-read-01.md:9`; unchanged by the read of round 03.

### 2.2 `## Quick start` — 190, in three blocks

- **Purpose.** Take the reader from nothing to a reviewed draft in three visible blocks, in the order they
  act: install, the workflow, update.
- **Excludes.** The in-app `/plugin` form; the commands again in prose; "nothing else is needed"; PATH;
  commits and versions; the inventory (2.3); what happens inside a skill (2.4); any report excerpt; the
  phrase "where the Markdown files are"; which run, which README or which date anything came from.
- **Device.** Three `###` subheadings, by phase:
  - **`### Install` — 26.** A `bash` fence, `claude plugin marketplace add Nowely/agent-skills` and
    `claude plugin install terse@nowely`, as run on a clean configuration; one clause only if the run shows
    an open session must reload or restart; "You need: Node 22 or newer" as one line
    (`09-reduction.md:22–27`).
  - **`### Workflow` — 140.** The main case and how to apply it, in order: the scope — the Markdown files to
    check, named one by one or as a folder (every tracked `.md` by default), and where readers start;
    `/terse:audit` in a `text` fence; that it says how many agents it will start and on which model and
    waits until the reader says so; what the report holds, in one clause — the questions the text answers
    wrong, the cause of each, file and line; stop if every answer is already right; otherwise whether the
    document's shape — what it says, in what order — stands: if it does, `/terse:rewrite` in a `text` fence,
    given the folder the report names, handing back a new draft of the whole document and its diff in the
    plugin's own folder, the reader deciding whether it replaces the document; if not, `/terse:rethink` in
    a `text` fence first, whose skeleton rewrite then writes from; last, audit again with the same
    questions. One clause only if the run shows a permission prompt (`09-reduction.md:39`).
  - **`### Update` — 18.** One `bash` fence in the install's form (`claude plugin marketplace update
    nowely`, `claude plugin update terse@nowely`, whichever the run needed); one clause only if the run
    shows a restart is needed.
- **Rests on.** `skeleton-read-02.md:6–8, 12–20`; part 1's counts; A03, A05, A08, A18, A20; rules 5, 6, 10;
  audit C20–C21; `audit/SKILL.md:25` (files, every tracked `.md` by default), `:151` (the stop), `:166–171`
  (the shape); `rewrite/SKILL.md:37` (it asks for the audit's folder).

### 2.3 `## Skills` — 110

- **Purpose.** Let the reader pick one of the three by their situation and see what each hands back.
- **Excludes.** What happens inside a skill; agents and cost; where anything is written; the chains of
  commands (the Workflow block holds them: one home); a diagram; a name-only list.
- **Device.** A three-row table, Command · When to run it · What you get back: audit — a document exists and
  its owner cannot tell whether it is fine → a report of which questions the text answers wrong, the cause
  of each, file and line, no rewording; rethink — no document yet, or it says the wrong things in the wrong
  order → a skeleton to agree to before anything is written; rewrite — after audit, or after a skeleton is
  agreed → a new draft of the whole document beside the reader's, and its diff. One line: each is started
  by the reader.
- **Rests on.** A02, synthesis C; `owner-readme-words.md:142`; part 1, place 3.

### 2.4 `## How it works` — 115 — the cut for rule 1

- **Purpose.** Show how the agent works inside each skill, step by step: audit — a profile of who reads it
  → every claim checked against the code or a named source → questions and an answer key written first → a
  fresh AI reader per question, with and without the text, starting where the reader's own readers start →
  one of five causes for each wrong answer (false, missing, misplaced, hard to find, misleading steps);
  rethink — reads documents like yours → decides the words → about ten structures, ranked together by AI
  reviewers → a skeleton to agree to; rewrite — an adversarial read → three writers and two judges, who
  never pick by length → rounds of edits whose declared checks run → each new claim checked against the code
  → AI reviewers, each checking one thing → a round refused if it loses a sentence checked true → the
  hand-over, with a reason for every cut of twenty words or more.
- **Excludes.** The pages' names for the steps (the dropped words, part 3); script and file names; exit
  codes; the methods' origins and the guarantees (2.5); the route between skills (2.2); "diff".
- **Device.** A three-item list, a bold lead-in per skill, its steps joined by arrows, each item ending in a
  link to the skill's page. "Pipeline" is allowed here, for the steps inside one skill.
- **Rests on.** `skeleton-read-02.md:27–28`; bold-lead-in lists describing components in 3 of 9 G
  (superpowers' workflow, plugin-dev's skills, code-review's "Agent architecture"); audit, rethink and
  rewrite `SKILL.md`, their steps in order.

### 2.5 `## Checks and guarantees` — 160

- **Purpose.** Say which methods the text is checked against, where each comes from and why, and what the
  plugin guarantees and what it does not.
- **Excludes.** Any measurement restated (linked instead); dated numbers; a rule catalogue or
  configuration (there is none); the version any of it arrived in; file names as link text.
- **Device.** A three-row table, Method · What it checks · Where it comes from: the writing rules (a
  sentence that carries nothing, an argument restated, editing history, a condition, a limit or a warning
  cut or weakened where a reader decides) — a rewriting chain measured on one README,
  `skills/rewrite/references/writing-rules.md`; the content rules (what a document says, in what order) —
  one owner's changes to one document, `skills/rethink/references/stages.md`; the scripted checks
  (mechanism before the decision, one idea in three sections, words against a budget, a declared check
  run, a sentence checked true lost), each tested against a planted violation —
  `skills/rewrite/references/measurements.md`. One line linking `references/prior-art.md` by what it holds:
  the field's practices, each marked measured, argued or asserted. Two bold lead-ins: **Guaranteed** — each
  run is written in the plugin's own folder and nothing in the reader's repository changes until they say
  so; a round that loses a sentence an earlier round checked true, or brings back one found false, is
  refused. **Not guaranteed** — that a person reads the result better: what is measured is what AI readers get
  from the text.
- **Rests on.** `skeleton-read-02.md:27–29`; part 1, place 5; A16; audit Q5 key (`audit.md:924–939`);
  `audit/SKILL.md:44`; `rewrite/SKILL.md:76, 88–89, 171–173`; `prior-art.md:3–5, 14–15, 131–132`;
  `writing-rules.md` "Provenance"; `stages.md`, "The rules this produced".

### Whole page

- **Devices.** `###` only inside Quick start; tables in Skills and Checks and guarantees; fences only for the
  five commands; bold lead-ins only in How it works and the two guarantee lines; no badge, banner, image,
  count line, navigation line, table of contents, emoji or horizontal-rule system.
- **Not on the page.** What was measured, report excerpts, Licence, Troubleshooting, Contributing, separate
  Update or Your files sections (the owner's reads); layout, schema, component counts, screenshots, install
  matrices, commented fences (A23, A22, A10, A07, A11).

### Total — 645

70 + 190 + 110 + 115 + 160 = 645, against 625 in skeleton 02 (round 03 came to 687) and 909 now. Out: What
was measured (105), the excerpt and its line (about 35), the route list under Skills (about 25). In: the
three block headings (6), the chains in the Workflow block, and Checks and guarantees (160).

## 3. Mechanical rules

Run on each round `R`, from rewrite's run folder, with `S` its `scripts/`.

1. **Rule 1.** `node "$S/rule1.mjs" "$R" --cut "How it works"` prints `0 violation(s)`. No `--except`: the
   opening, Quick start and Skills carry no absolute path, flag, environment variable, exit code, protocol
   name or `ABC:` field. A command that runs only with a flag is a question to the owner.
2. **Headings.** `grep -n '^#' "$R"` prints, in order: `# terse`, `## Quick start`, `### Install`,
   `### Workflow`, `### Update`, `## Skills`, `## How it works`, `## Checks and guarantees` — nothing else.
3. **One idea, one home.** `node "$S/dup.mjs" "$R" concepts.json` prints `0 concept(s) in three or more
   sections` (it counts `##` sections; the `###` blocks are Quick start's). `concepts.json`:

```json
[
  {"name": "consent — Quick start, Checks and guarantees", "pattern": "say so\\b|say whether|your word"},
  {"name": "the plugin's own folder — Quick start, Checks and guarantees", "pattern": "folder of the plugin|plugin's own folder|its own folder|outside your repository"},
  {"name": "agents announced, then it waits — Quick start", "pattern": "how many agents|which model|announce"},
  {"name": "every word carries weight — opening", "pattern": "carries weight|weight and meaning"},
  {"name": "not a compressor — opening", "pattern": "compressor|shorten|shorter|cut (?:it|your [a-z]+) down"},
  {"name": "the scope — Quick start", "pattern": "folder of Markdown|Markdown files|tracked"},
  {"name": "what a report holds — Quick start, Skills", "pattern": "file and line"},
  {"name": "you start each one — Skills", "pattern": "start each one yourself|starts? (?:on its own|by itself)"},
  {"name": "back to audit — Quick start", "pattern": "audit again|again with the same questions|same questions again"},
  {"name": "a fix is not undone — How it works, Checks and guarantees", "pattern": "undo(?:es)? a fix|make it worse|checked true|found false"},
  {"name": "condition, limit, warning — Checks and guarantees", "pattern": "condition, a limit|limit or a warning"},
  {"name": "AI readers — How it works, Checks and guarantees", "pattern": "AI readers?"},
  {"name": "answer key; without your text — How it works", "pattern": "answer key|without (?:your|the) text"},
  {"name": "claims against the code — How it works", "pattern": "against the code|named source"},
  {"name": "the five causes — How it works", "pattern": "misleading steps|hard to find|misplaced"},
  {"name": "best practices; documents like yours — opening, How it works", "pattern": "best practices?|documents like yours"},
  {"name": "writers, judges, reviewers — How it works", "pattern": "\\bwriters?\\b|\\bjudges?\\b|\\breviewers?\\b"},
  {"name": "the diff — Quick start, Skills", "pattern": "\\bdiff\\b"},
  {"name": "where the methods come from — Checks and guarantees", "pattern": "writing-rules\\.md|stages\\.md|measurements\\.md|prior-art\\.md"},
  {"name": "a person — Checks and guarantees", "pattern": "a person\\b|\\bpeople\\b"},
  {"name": "Node — Quick start", "pattern": "\\bNode\\b"}
]
```

4. **Budgets.** `node "$S/sections.mjs" "$R" budgets.json` prints no section over and a total of 645 or
   less, and `awk '/^## /{b=""} /^### /{b=$0;next} b&&NF{w[b]+=NF} END{for(k in w)print w[k]"\t"k}' "$R"`
   prints Install ≤ 26, Workflow ≤ 140, Update ≤ 18. An overrun is a question to the owner, answered in
   this file. `budgets.json`:

```json
{
  "(opening)": 70,
  "Quick start": 190,
  "Skills": 110,
  "How it works": 115,
  "Checks and guarantees": 160
}
```

5. **Fences.** Every opening fence carries a language: two `bash` (Install, Update) and three `text`
   (`/terse:audit`, `/terse:rewrite`, `/terse:rethink`), all under Quick start. `grep -c '/plugin' "$R"`
   prints 0.
6. **The eleven content rules of `stages.md`: all adopted.** 1 — the first sentence says what terse is for,
   with no `?`. 2 — item 1 passes, and the opening carries none of the concepts consent, the plugin's own
   folder, agents announced. 3 — technical detail only at or after How it works. 4 — PATH is not named;
   Node 22 is one line, because the skills stop without it (audit C20). 5 — the first non-blank line under
   `### Install` opens a `bash` fence. 6 — the same under `### Update`. 7 — no excerpt, no invented example.
   8 — item 7. 9 — Skills and Checks and guarantees are tables whose rows differ. 10 — item 5. 11 — outside
   the fences, `grep -c -i -w -E 'unless|only if|except when|as long as|provided that'` prints 0.
7. **Words.** Outside the fences this prints nothing:

```bash
awk '/^```/{f=!f;next} !f' "$R" | grep -n -i -w -E 'invoke[sd]?|invocation|user-invoked|spawn(s|ed)?|documentation|task readers?|entry file|baseline|no-document|arm|controls?|planted|ledger|pinned|pins?|retired|truth pass|evidence levels?|refuted|placement|findability|harmful|run director(y|ies)|run files?|your tree|code defects?|defects?|checkout|candidates?|bake-off|critics?|lens(es)?|wave|verifier|regressions?|ratchet|chain|pilot|McNemar|genre|survey|water|repairs?|prior art|TMPDIR|consent|your word|version'
```

   `pipeline` appears only under `## How it works`
   (`awk '/^## /{s=$0} tolower($0)~/pipeline/{print s}' "$R" | sort -u` prints that heading or nothing), and
   `grep -o -i -E '\b[a-z]+ readers?\b' "$R" | grep -v -i -E '^(ai|your) '` prints nothing. The opening
   holds `weight` and `meaning`; `until you say so`, `rounds of edits`, `documents like yours`,
   `AI reviewers` and `### Workflow` each occur. The first sentence holding `skeleton` holds `outline`;
   `shape`, `order`; `diff`, `change`; `AI reader` first appears as `fresh AI reader`. `terse` appears only as
   the name.

   **Must use**, wherever the idea appears: text (the mission) and document (the unit); skill, and command
   only for the line typed; run; you start each one yourself; start (agents); workflow (the route across
   the skills); AI reader; agent; a profile of who reads it; answer key; claim; false, missing, misplaced,
   hard to find, misleading steps, in the report's order; folder; report; your files, your repository; bug;
   skeleton, shape, diff, each glossed at first use; draft; round, first as "rounds of edits"; writer,
   judge; reviewer, first as "AI reviewers, each checking one thing"; until you say so; improve; documents
   like yours; filler; AI slop, as the aim; rules and best practices; weight and meaning.

   **Must not**: the grep's list; "pipeline" outside How it works.

## 4. Terminology

From `terms.md` (row numbers in brackets); the rows marked *03* are decided here.

| Term | Decision | Rejected | Why |
|---|---|---|---|
| terse [1] | keep, only as the name | a rename; the adjective | released id and tags; the shortener reading is answered by "not a compressor" |
| audit [2] · rethink [3] · rewrite [4] | keep; rethink's first mention says what it decides; rewrite never the verb for the reader's file | check, lint, review; plan, outline, design; improve, revise, fix | released commands; "fix" reads as line fixes (audit Q4) |
| skill · command [5] | skill for the unit, command for the line typed | command for the unit; tool | the vendor's unit |
| run; you start each one yourself [6] | rename invoke, user-invoked | user-invoked, manual | manifest jargon |
| text · document [7] | text for the mission, document for the unit; Markdown once, as the scope fact | documentation, prose, writing, content | the purpose's «текст»; "documentation" narrowed round 04 |
| agent [8] · start [9] | keep agent; rename spawn | subagent, model, bot; spawn | «мультиагентность»; plain |
| AI reader [10] | rename reader, fresh reader; first as "a fresh AI reader" | reader alone, model agent, subagent, beta or test or simulated reader | the readers are a model (`owner-readme-words.md:86`); "reader" also names the reader's own readers |
| a profile of who reads it [13] · answer key [14] | keep | persona; expected answers, ground truth, oracle | plain; the test's word |
| claim [20] · cause [26] | keep | fact, statement, assertion | the fact-checker's words |
| false · missing · misplaced · hard to find · misleading steps [27–31] | the five causes, plain, in the report's order | refuted, lied, placement, findability, harmful | "lied" imputes intent; "harmful" reads as offensive content |
| run [32] · folder [33] · report [34] | keep run; rename run directory, run file | session, job; workspace; `audit.md`, results | a run spans sessions; "workspace" is the reader's project |
| your files, your repository [35] · bug [36] | rename your tree, code defect | working copy; defect, issue | plain |
| skeleton [38] · shape [39] · diff [50] | define each at first use | outline, plan, brief, structure; track changes, patch | the words the skills print; renaming "skeleton" in the pages is the owner's (75 lines) |
| draft [40] · round [41] | rename candidate; keep round, first as "rounds of edits" | candidate, proposal, version, revision; iteration | "version" collides with install and update |
| writer · judge [43] · reviewer [44] | keep; rename critic ("AI reviewers, each checking one thing") | generator, grader; critic, checker | a critic judges taste |
| workflow [51] *03* | keep, for the route across the skills, and as the `###` heading | usage, cycle, loop, chain | the owner's word (`skeleton-read-02.md:19`, `purpose.md:36`); 5 of 39 headings |
| pipeline [51] *03* | only in How it works, for the steps inside one skill | anywhere else | the owner's word for the architecture (`skeleton-read-02.md:27`); `terms.md`'s own fallback for row 51; across skills it reads as automatic |
| until you say so [52] · improve [53] | rename your word, repair | your word, approval, consent; repair, fix, polish | "your word" reads as a promise; the purpose's verb |
| documents like yours [57, 58] | rename genre, survey | genre, category, survey, research | literary genre; questionnaire |
| filler [59] · AI slop [60] · rules and best practices [61] | rename water; keep AI slop as the aim; keep rules and best practices, no configuration | water, fluff; generic AI prose; checks, style guide | «вода» is a Russian idiom; the purpose's words |
| task reader, entry file, planted question, claim ledger, pinned, retired, truth pass, evidence level, checkout, bake-off, lens, wave, verifier, ratchet, chain, prior art as link text [11, 12, 19, 21–25, 37, 42, 45–47, 49, 54, 62] | drop, How it works included | the pages' names in the technical section | a step is named by what it does; the page it links to carries its own name |
| score [15], the same questions without your text [16, 17], questions it already answers right [18], pass [55], one small trial [56] | no longer needed | — | their only home, What was measured, is gone |
| opening | no heading | What is terse?, Goal, the Why family | the H1 names it |
| Quick start › Install · Workflow · Update *03* | keep Quick start; three `###` blocks by phase | bold lead-ins; Getting started; Usage | 4 of 8 G and 4 of 5 agent quick starts use subheadings; bold lead-ins 1 of 8 |
| Skills | rename What each one does | What's inside, Commands | 8 of 9 G head this function; the vendor's unit |
| How it works | keep, rebuilt as the steps of each skill | Architecture, Technical Details | 4 of 9 G; «как это работает» |
| Checks and guarantees *03* | new | Rules (invites configuration, `terms.md` headings), Philosophy, Quality evaluation, Methods | "Checks" heads 3 of 7 text checkers; «гарантиях качества» (`skeleton-read-02.md:29`) |
| What was measured · Your files · Troubleshooting · Update · Licence | drop | — | the owner's reads (`skeleton-read-02.md:22–26`, `skeleton-read-01.md:14–17, 23–25`); licence: noise |

## 5. Deleted outright from `00-current.md`

| Deleted (line, first words) | Cost |
|---|---|
| :7 "Three skills." | none the table does not carry |
| :9–13, the arrow fence, and :12 "what broke … what to write … did it hold" | one glance at what each stage answers; the order lives in the Workflow block |
| :27–29 "It exists because a draft written at ordinary quality was abandoned…" | the one measured reason to settle a shape first; `rethink/SKILL.md:17–21` keeps it |
| :32–34 "…a loop of critics whose lenses do not overlap — the code, the rules…" | the list of what the reviewers check (both claims refuted, C12) |
| :34–35 "Every round is kept as its own file." | nothing true (C13) |
| :35 "…and the file, line and evidence level behind every behavioural claim" | the promise that a draft's claims carry their sources (C14) |
| :42–45, the untagged `/plugin` fence | the in-session form for a reader already in Claude Code |
| :48–49 "Nothing else is needed — no dependencies, no configuration file, no account anywhere." | the true parts, no npm dependency and no configuration file, go with the false one (C20) |
| :53–56 "It makes documentation truer…", "…the chain moved 2,725 words to 2,571…", "If your text is long because it is wrong…" | the one-line benefit (C22), the one measured size change — kept only in `research/2026-09-10-chain/README.md:20, 24`, not in the plugin — and the account of what length means (C25, C26); "not a compressor" stays, in the opening |
| :58–60 "It will not strip a repetition…", "It will not drop the date or the numbers…" | two promises (C28, C29); `writing-rules.md` keeps both rules |
| :62–86 "## What was measured", all but its link | the evidence a reader weighs before trying — 3/6 → 6/6, *p* = 0.25, no run without the text, lies against findability, clarity against truth, the standards experiment — now one link away (`skills/audit/references/measure.md:4–5, :125`, `measurements.md:101`, `prior-art.md:93, :131–132`); the profile's trust point, every number with its size (`audit.md:54`), leaves the page |
| :88–90 "## Licence" / "MIT." | a reader after the licence opens LICENSE or the manifest |

## 6. Edits outside the document

- `plugins/terse/skills/rethink/SKILL.md` — say where the skeleton and a run's files are written (the plugin's own folder, by audit's step-1 formula); without it, 2.5's first guarantee holds for audit and rewrite only (`audit.md:1041`).
- `plugins/terse/skills/audit/SKILL.md:25` — only if the owner wants "a selection" named as a scope (part 7): say that a selection of text is accepted and how it is read; today step 1 names files, every tracked `.md` by default.
- `plugins/terse/.claude-plugin/plugin.json:4` and `.claude-plugin/marketplace.json:20` — the description in the README's words, the two strings identical: "user-invoked", "documentation", "fresh readers", "the genre", "for your word", "critics with lenses", "your tree" → you start each one yourself, text, AI readers, documents like yours, until you say so, AI reviewers, your repository.
- `README.md:15` (repository root) — terse's row in the mission's words; its `/plugin install` cell is that page's own form, flagged only.
- `plugins/terse/skills/audit/SKILL.md:3–6`, `plugins/terse/skills/rewrite/SKILL.md:3–7` — the picker's descriptions: "fresh readers" → AI readers; "a claim ledger" → every claim checked against the code; "one candidate" → a draft; "critics with lenses that differ" → AI reviewers; "the owner" → you; "into your tree only on your word" → into your repository only when you say so.
- `plugins/terse/CHANGELOG.md` — one line under Unreleased › Changed: the README rewritten to this skeleton.
- **File names** are the pages' decision, not the README's, and the README names none. Today: audit writes `audit.md` and `ledger.json` in `runs/<YYYYMMDD-HHMMSS>/`; rewrite writes `00-original.md`, rounds as `NN-<pass>.md`, `diff-NN.patch`, `rounds.md`, `reviews/NN/`, `code-defects.md` and `skeleton.md` in `runs/<YYYYMMDD-HHMMSS>-<slug>/` (`rewrite/SKILL.md:76–79, 91–92, 221–222, 227–240`). A convention such as `file-name.v1.md` would be an edit there.
- **Nothing in the references changes** for What was measured's removal: 3/6 → 6/6 and *p* = 0.25 are at `skills/audit/references/measure.md:4–5, :125`, `skills/rewrite/references/measurements.md:101` and `references/prior-art.md:93`; the limit to model readers at `prior-art.md:131–132`; the size change and the 2026-09-22 audit figures live in the research record (`research/2026-09-10-chain/README.md:20, 24`, `research/2026-09-22-terse-process/audit-2026-09-22/audit.md:993`), and no rule rests on them.

## 7. The owner's decisions, and the five least sure

**Taken** (numbered as in `skeleton-read-02.md`):

1. Round 03 is not sent; its objections are to sections and arrangement, so the structure is revised here.
2. Quick start is three visible blocks — `### Install`, `### Workflow`, `### Update` — subheadings over bold
   lead-ins on the genre's count (part 1).
3. The Workflow block states its scope and drops "where the Markdown files are"; the report excerpt goes. No
   excerpt survives: every recorded report is of this plugin's own README and prints the run's labels
   (`missing`, `refuted`), so none reads without its history; one clause says what a report holds instead.
4. What was measured is not a README section; its numbers stay in the references and the research record.
5. How it works is rebuilt as the steps of each skill, and Checks and guarantees holds the methods, their
   origin and the guarantees.

**Still the owner's, with defaults**

1. "A selection" as a scope — default: not named, since the audit page accepts files and folders only
   (`audit/SKILL.md:25`); naming it needs part 6's edit to that page.
2. "Pipeline" — default: allowed only in How it works, for the steps inside one skill.
3. The second technical heading — default: Checks and guarantees; alternatives: "Methods and guarantees"
   (the owner's «методы»), or one How it works with `###` subsections as code-review does.
4. Still open from skeleton 02: "AI reader", "draft", "skeleton" as decided; nothing about language.
5. Length: 645 (part 2, Total). The edits in part 6.

**Exceptions kept against the owner's word:** one — "a selection" is not named (default 1), against «это
может быть как как-то выделенный текст» (`skeleton-read-02.md:12–13`), by his own rule that the README matches
the code (`purpose.md:39–41`).

**Routed outside the document:** the file-naming convention (part 6, to the pages); the excerpt's idea — a
report a reader understands without the run's history — to the audit page's report form
(`audit/SKILL.md:166–171`); the selection scope to `audit/SKILL.md:25`; entrust's run-folder convention,
still a question for the pages (`plugins/entrust/README.md:129–137`).

**The five least sure**

1. **The Workflow block at 140, holding the main case, the rethink branch and the return.** It may merge
   into one block again, the fault the owner named. Settles it: the owner's read of the first draft's Quick
   start, and a task reader going from install to a reviewed draft with no forced guess.
2. **Two technical sections rather than one.** The genre splits (2 of 9 G pair them; 1 of 9 folds them).
   Settles it: fresh AI readers asked "how does the agent work?" and "what does it check, from where, and
   what does it guarantee?", each answered from one section; else the owner's word on one section.
3. **The heading "Checks and guarantees"** — findable for a reader scanning for rules or quality? Settles
   it: the owner's word.
4. **Plain step names in How it works**, while the linked pages say bake-off, verifier, wave and ratchet.
   Settles it: a fresh AI reader given How it works and one skill page, asked to map each step to the
   page's; if it cannot, the pages' names enter the technical section.
5. **"Pipeline" allowed in How it works**, a word `terms.md` renamed. Settles it: the owner's word; the
   default follows his own use for the architecture.
