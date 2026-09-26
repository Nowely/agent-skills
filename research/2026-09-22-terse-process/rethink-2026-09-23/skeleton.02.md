# Skeleton 02: `plugins/terse/README.md` — 2026-09-24

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

Base: structure 01, "Decide in thirty seconds" (ranked 2nd, 3rd and 1st by the three critics), with the
owner's order applied from `skeleton-read-01.md`. The README describes the code in the repository as it is.

**The genre's order.** Counted from the headings of the fetched copies (`survey/synthesis-sources/`,
`survey/fetched/`). G = the 9 exact-genre plugin READMEs (s1); stars are the surveys', and the three
`anthropics/claude-code` plugins carry that repository's 147,780★, not their own.

| Place | What the genre puts there | N of M | This skeleton |
|---|---|---|---|
| 1 | what it is — a line under the H1, or an Overview / What / Why section | 9 of 9 G | **follows**: the opening |
| 2 | install, often as Quick start with the first run | 8 of 9 G carry it; right after what-it-is in 4 of 8 (wshobson 39,908★, claude-hud 28,133★, superpowers-marketplace, trailofbits); the first real section in 4 of 6 agent READMEs (OpenCode 209,631★, Codex 126,161★, OpenHands, gpt-engineer) and first or after a Why in 5 of 7 text checkers | **follows**: Quick start, holding install, the prerequisite, the first run, the path to a draft and the update line |
| 3 | the inventory — skills, commands, plugins | 7 of 9 G; after install in 4 of 7 (superpowers 290,578★, wshobson, superpowers-marketplace, trailofbits), before it in 3 of 7 (anthropics/skills 177,800★, plugin-dev, code-review) | **follows**: Skills |
| 4 | How it works | 4 of 9 G; after install in 3 of 4 (wshobson, claude-hud, trailofbits), before it in superpowers | **follows** |
| 5 | the tail: License 6 of 9, Troubleshooting 3 of 9, Contributing 2 of 9, Updating 1 of 9; an evidence section in 1 of 9 (wshobson "Quality evaluation", after How it works) | — | **departs**: What was measured is the only tail section, placed where wshobson places its evaluation; License, Troubleshooting, Contributing and a separate Updating are out on the owner's word |

The two exemplars: **maestro** (1,478 words; 593★) — What is Maestro? → Quick Start (install, the first
commands, Combine Commands) → The Skill → 25 Commands → What's New → Anti-Patterns → Supported Tools → MCP
Server → Manual Installation → Project Structure → Contributing → License. **09-reduction**
(`research/2026-09-11-markup-round-0/09-reduction.md`, 1,531 words; the round the owner said looked better)
— opening → Quick start (install fence, a reload note, "You need:", an example exchange, a first-run note)
→ Commands → Update and uninstall → what an agent may touch → what it stores → Where parity stops →
Against the official plugin → How it works → Troubleshooting → Further reading. Both put install inside
Quick start and Quick start before the commands. Outside the genre the CLI tools show no settled order:
install in the first three sections in 5 of 10, after a feature tour or late in 3, handed to a website in 2.

**Skills before Quick start, weighed.** Skeleton 01's reason was the synthesis's placement of Install
"after the short purpose and choice material" (A05) and a choice made before installing. For it: 3 of 7 G
that carry both, top 177,800★ (anthropics/skills), the other two the vendor's own plugins. Against it: 4 of
7, top 290,578★ (superpowers); both exemplars; and the owner's own list, «заголовок, что это и какую задачу
выполняет, быстрый старт, набор команд» (`owner-readme-words.md:142`). The convention wins.

## 2. Sections

Budgets are `sections.mjs` counts: whitespace-separated tokens under a `##` heading — table pipes, list
markers and fence lines included, the heading line excluded; `(opening)` includes `# terse`.

### 2.1 `# terse` and the opening, no heading — 70

- **Purpose.** Say what terse is — a Claude Code plugin that assesses and improves any text, the README
  first, in rounds of edits by several AI agents working from rules and best practices — and its aim: text
  in which every word carries weight and meaning, without AI slop; not a compressor; with one concrete
  reason to want it (`audit.md:34–39`: its owner cannot tell whether a document is fine, and touching it
  may make it worse).
- **Excludes.** A question first; "documentation" as the scope; the README as the only subject; a roadmap
  or version; skill names and commands; install; the order of the skills; any number or date; where
  anything is written; freedom from AI slop as a result rather than the aim; any language or file format
  as verified; other tools.
- **Device.** One plain paragraph under the H1; no tagline, badge, banner, count or navigation line.
- **Rests on.** A01, A06; the second statement (`purpose.md:32–34`); «можно добавить, чтобы каждое слово
  имело вес и несло смысл» (`skeleton-read-01.md:9`); the round-04 verdict against "tied to README"
  (`purpose.md:25`); graft from 05 §1 ("in rounds of edits by several AI agents, from rules and best
  practices, without AI slop").

### 2.2 `## Quick start` — 180

- **Purpose.** Take the reader from nothing to a reviewed draft in the order they act: install; what they
  need; the first run and what comes back; stop there if every answer is already right, otherwise say
  whether the document's shape stands and give rewrite the folder the report names, or run rethink first;
  decide from the diff whether the draft replaces the document; and, last, the one line that updates.
- **Excludes.** The in-app `/plugin` form; the commands again in prose; "nothing else is needed"; PATH; a
  platform matrix; commits and versions; the skills' inventory (2.3) and any order of skills beyond these
  commands (the return to audit is 2.3's); what happens inside a round; an invented, tidied or success-only
  excerpt; an excerpt about this page's own files promise.
- **Device.** In this order: a `bash` fence, `claude plugin marketplace add Nowely/agent-skills` and
  `claude plugin install terse@nowely`, as run on a clean configuration; one clause only if that run shows
  an open session must reload or restart (`09-reduction.md:19–20`); "You need: Node 22 or newer" as one
  line, where the exemplar puts it (`09-reduction.md:22–27`); `/terse:audit` in a `text` fence, run in
  Claude Code where the Markdown files are — it asks which files and where readers start, says how many
  agents it will start and on which model, and waits until the reader says so; one clause only if the run
  shows a permission prompt (`09-reduction.md:39`); a verbatim excerpt of a recorded report, 30 words at
  most, dated, in a `text` fence; the two outcomes; `/terse:rewrite` in a `text` fence; the update as one
  lead word and a `bash` fence in the install's form (`claude plugin marketplace update nowely`,
  `claude plugin update terse@nowely`, whichever the run needed).
- **Rests on.** A03, A05, A08, A09, A18; «Install, Update, Quick start: все полезны, но… может быть частью
  субсекцией другого» and «быстрый старт … где-то в середине» (`skeleton-read-01.md:12–13, 18`); the
  Troubleshooting read, a prerequisite as one line (`:23–25`); rules 5, 6, 10; audit C20–C21 (the skills
  stop without Node, installed or not); the reader's-task critics' shared failure, the path from a report
  to a reviewed draft (`critics/astra-reader-task.md:195`); grafts from 09 §3–§5 (commands as run, each in
  its own fence).

### 2.3 `## Skills` — 130

- **Purpose.** Let the reader pick one of the three by their situation and see what each hands back, then
  show the order they run in and the way back to audit.
- **Excludes.** What happens inside a skill; agents and cost; where anything is written; output excerpts;
  the reader's situation in the route list (the When column carries it); a route in prose; a diagram; a
  name-only list.
- **Device.** A three-row table, Command · When to run it · What you get back: audit — a document exists
  and its owner cannot tell whether it is fine → a report of which questions the text answers wrong, the
  cause of each, file and line, no rewording; rethink — no document yet, or it says the wrong things in the
  wrong order → a skeleton to agree to before anything is written; rewrite — after audit, or after a
  skeleton is agreed → a new draft of the whole document beside the reader's, and its diff. Under it, no
  heading: each is started by the reader; then two chains of commands, each ending in audit again with the
  same questions — audit → rewrite → audit; rethink → rewrite → audit.
- **Rests on.** A02, A20, synthesis C; «нет таблицы с командами скилов» (`owner-readme-words.md:142`); the
  genre's place 3 (part 1); graft from 09 §2 (the unheaded route list).

### 2.4 `## How it works` — 140 — the cut for rule 1

- **Purpose.** For the reader who came for the method: how a judgment is made (a fresh AI reader per
  question answers from the text alone, starting where the reader's own readers start, against an answer
  key written first from the code or a named source; the same questions without the text; one of five
  causes for each wrong answer, in the report's order); how a draft is made (three writers, two judges,
  then rounds of edits checked by AI reviewers, each checking one thing, under writing rules named by what
  they forbid — among them cutting or weakening a condition, a limit or a warning where a reader decides —
  and the practices of documents like yours, which rethink reads first; length never picks a draft; every
  cut of twenty words or more handed over with its reason); what guards a fix (a round that loses a
  sentence an earlier round checked true, or brings back one found false, is refused before the reader
  sees it); and, in one line, that each run is written in a folder of the plugin's own and nothing in the
  reader's repository changes until they say so.
- **Excludes.** Script, file and check names; ledger, pin, verifier, lens, wave, bake-off, evidence
  levels; a rule catalogue or configuration (there is none); exit codes; the folder's path; keeping or
  deleting runs; the route between skills (2.3); the version any of this arrived in.
- **Device.** A short list, one mechanism per item; the folder line last.
- **Rests on.** A16, A17, A19, A12; «как это работает» (`owner-readme-words.md:104`); «Просто по аналогии
  пишем в плагин папке» (`skeleton-read-01.md:14–17`); audit Q5 key (`audit.md:924–939`); C23, C27;
  `audit/SKILL.md:44`, `rewrite/SKILL.md:76, 88–89, 171–173`.

### 2.5 `## What was measured` — 105

- **Purpose.** Give the evidence at its size — each figure with its date, its sample and what ran (the
  plugin, or the method it was built from) — and the one thing never measured: whether a person reads the
  improved text better.
- **Excludes.** The writing-standards experiment; clarity against truth; which pass produced the gain;
  McNemar, pilot, rate, arm, control, chain; a figure without date and size; a chart; "prior art" as link
  text.
- **Device.** A short list of sized facts — the 2026-09-10 run on one README: right answers 3 of 6 → 6 of
  6, the questions it already answered right still right, one small trial, the gain could be chance
  (*p* = 0.25), never run without the text; the same run's 2,725 → 2,571 words; at the writer's choice the
  2026-09-22 audit of the previous README (5 of 7 with the text, 0 of 7 without) — and one link to
  `references/prior-art.md` named by what it holds.
- **Rests on.** A04; C24; the profile's trust point, every number with its size (`audit.md:54`);
  «меряет отвечаемость модели, а не улучшение для человека» (`owner-readme-words.md:86`); wshobson's
  evaluation section after How it works (part 1, place 5).

### Whole page

- **Devices.** Plain headings; tables only in Skills; fences only for commands and the excerpt; no badge,
  banner, image, count line, navigation line, table of contents, emoji or horizontal-rule system.
- **Not on the page.** Licence (6 of 9 G; the owner: noise); Troubleshooting (3 of 9 G; the owner: junk —
  the plugin should just work, or the agent resolves or escalates); Contributing (2 of 9 G; no policy to
  state); a separate Update or Your files section (the owner's read); layout, schema, component counts,
  screenshots, install matrices, commented fences (A23, A22, A10, A07, A11).
- **From maestro.** Taken: mission first; install and the first commands inside Quick Start; the
  workflow as a chain of commands (2.2, 2.3); slop as what the rules forbid (2.1, 2.4). Refused: a heading
  on the opening, a table grouped by effect, comments in fences, the banner and badge lines, and every
  section after its commands.

### Total — 625

70 + 180 + 130 + 140 + 105 = 625, against 754 in skeleton 01 and 909 in the current README. Skeleton
01's Install, Update, Your files and Quick start (217) became one Quick start (180); its What it will and
will not do (90) went into the opening (not a compressor), How it works (length, the rules, the guard, the
cut reasons) and What was measured (the size change); its Troubleshooting (80) went, but for the Node line.

## 3. Mechanical rules

Run on each round `R`, from rewrite's run folder, with `S` its `scripts/`.

1. **Rule 1.** `node "$S/rule1.mjs" "$R" --cut "How it works"` prints `0 violation(s)`. No `--except`: the
   opening, Quick start and Skills carry no absolute path, flag, environment variable, exit code, protocol
   name or `ABC:` field, fences and the excerpt included. A command that runs only with a flag is a
   question to the owner.
2. **Headings.** `grep -n '^#' "$R"` prints `# terse`, then `## Quick start`, `## Skills`,
   `## How it works`, `## What was measured`, and nothing else.
3. **One idea, one home.** `node "$S/dup.mjs" "$R" concepts.json` prints `0 concept(s) in three or more
   sections`. `concepts.json`, each name ending in the sections meant to carry it:

```json
[
  {"name": "consent — Quick start, How it works", "pattern": "say so\\b|say whether|your word"},
  {"name": "the plugin's own folder — Quick start, How it works", "pattern": "folder of the plugin|plugin's own folder|its own folder|outside your repository"},
  {"name": "agents announced, then it waits — Quick start", "pattern": "how many agents|which model|announce"},
  {"name": "every word carries weight — opening", "pattern": "carries weight|weight and meaning"},
  {"name": "not a compressor — opening, What was measured", "pattern": "compressor|shorten|shorter|cut (?:it|your [a-z]+) down|2,725"},
  {"name": "you start each one — Skills", "pattern": "start each one yourself|starts? (?:on its own|by itself)"},
  {"name": "back to audit — Skills", "pattern": "audit again|again with the same questions|same questions again"},
  {"name": "a fix is not undone — How it works", "pattern": "undo(?:es)? a fix|make it worse|checked true|found false"},
  {"name": "condition, limit, warning — How it works", "pattern": "condition, a limit|limit or a warning"},
  {"name": "AI readers — How it works, What was measured", "pattern": "AI readers?"},
  {"name": "answer key; without your text — How it works, What was measured", "pattern": "answer key|without (?:your|the) text"},
  {"name": "claims against the code — How it works", "pattern": "against the code|named source"},
  {"name": "the five causes — How it works", "pattern": "misleading steps|hard to find|misplaced"},
  {"name": "best practices; documents like yours — opening, How it works", "pattern": "best practices?|documents like yours"},
  {"name": "writers, judges, reviewers — How it works", "pattern": "\\bwriters?\\b|\\bjudges?\\b|\\breviewers?\\b"},
  {"name": "the diff — Quick start, Skills", "pattern": "\\bdiff\\b"},
  {"name": "p = 0.25 — What was measured", "pattern": "0\\.25|small trial"},
  {"name": "a person, never measured — What was measured", "pattern": "a person\\b|\\bpeople\\b"},
  {"name": "Node — Quick start", "pattern": "\\bNode\\b"}
]
```

4. **Budgets.** `node "$S/sections.mjs" "$R" budgets.json` prints no section over its budget and a total
   of 625 or less; an overrun is a question to the owner, answered in this file. `budgets.json`:

```json
{
  "(opening)": 70,
  "Quick start": 180,
  "Skills": 130,
  "How it works": 140,
  "What was measured": 105
}
```

5. **Fences.** Every opening fence carries a language: exactly two `bash` (install, update) and three
   `text` (the two commands, the excerpt), all under Quick start. `grep -c '/plugin' "$R"` prints 0.
6. **The eleven content rules of `stages.md`: all adopted.** 1 — the first sentence says what terse is
   for, with no `?`. 2 — item 1 passes, and the opening carries none of the concepts consent, the plugin's
   own folder, agents announced. 3 — technical detail only at or after How it works. 4 — PATH is not
   named; Node 22 is one line, because the skills stop without it (audit C20). 5 — the first non-blank line
   under `## Quick start` opens the install's `bash` fence. 6 — the update is a `bash` fence in the
   install's form. 7 — the excerpt is found verbatim (`grep -F`) in the report it cites. 8 — item 7. 9 —
   Skills is a table whose rows differ. 10 — item 5. 11 — outside the `text` fences,
   `grep -c -i -w -E 'unless|only if|except when|as long as|provided that'` prints 0.
7. **Words.** Outside the `text` fences this prints nothing:

```bash
awk '/^```text$/{f=1;next} /^```$/{f=0;next} !f' "$R" | grep -n -i -w -E 'invoke[sd]?|invocation|user-invoked|spawn(s|ed)?|documentation|task readers?|entry file|baseline|no-document|arm|controls?|planted|ledger|pinned|pins?|retired|truth pass|evidence levels?|refuted|placement|findability|harmful|run director(y|ies)|run files?|your tree|code defects?|defects?|checkout|candidates?|bake-off|critics?|lens(es)?|wave|verifier|regressions?|ratchet|pipeline|chain|pilot|McNemar|genre|survey|water|repairs?|prior art|TMPDIR|consent|your word|version'
```

   and so does `grep -o -i -E '\b[a-z]+ readers?\b' "$R" | grep -v -i -E '^(ai|your) '`. The opening
   holds `weight` and `meaning`; `until you say so`, `rounds of edits`, `documents like yours` and
   `AI reviewers` each occur at least once. The first sentence holding `skeleton` holds `outline`;
   `shape`, `order`; `diff`, `change`; `score`, if used, `without`; `AI reader` first appears as
   `fresh AI reader`. `terse` appears only as the name.

   **Must use**, wherever the idea appears: text (the mission) and document (the unit); skill, and command
   only for the line typed; run; you start each one yourself; start (agents); AI reader; agent; a profile
   of who reads it; answer key; the same questions without your text; questions it already answers right;
   claim; false, missing, misplaced, hard to find, misleading steps, in the report's order; folder; report;
   your files, your repository; bug; skeleton, shape, diff, score, each glossed at first use; draft; round,
   first as "rounds of edits"; pass; writer, judge; reviewer, first as "AI reviewers, each checking one
   thing"; undo a fix, make it worse; until you say so; improve; one small trial, the gain could be chance
   (*p* = 0.25); documents like yours, reads documents like yours first; filler; AI slop, as the aim; rules
   and best practices; weight and meaning.

   **Must not**: the grep's list — "version" joins it (no binding to a version); "pipeline" stays on it
   until the owner rules (part 7).

## 4. Terminology

From `terms.md` (row numbers in brackets).

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
| score [15] | define at first use by its unit | bare score, rating, accuracy | a writer reads a readability grade |
| the same questions without your text [16, 17] · questions it already answers right [18] | rename no-document arm, baseline, control question | arm, baseline, closed-book, control, canary | the vendor's framing; "control" is the experiment's untreated arm |
| claim [20] · cause [26] | keep | fact, statement, assertion | the fact-checker's words |
| false · missing · misplaced · hard to find · misleading steps [27–31] | the five causes, plain, in the report's order | refuted, lied, placement, findability, harmful | "lied" imputes intent; "harmful" reads as offensive content |
| run [32] · folder [33] · report [34] | keep run; rename run directory, run file | session, job; workspace; `audit.md`, results | a run spans sessions; "workspace" is the reader's project |
| your files, your repository [35] · bug [36] | rename your tree, code defect | working copy; defect, issue | plain |
| skeleton [38] · shape [39] · diff [50] | define each at first use | outline, plan, brief, structure; track changes, patch | the words the skills print; renaming "skeleton" in the pages is the owner's (75 lines) |
| draft [40] · round [41] · pass [55] | rename candidate; keep round (first as "rounds of edits") and pass | candidate, proposal, version, revision; iteration | "version" collides with install and update |
| writer · judge [43] · reviewer [44] | keep; rename critic ("AI reviewers, each checking one thing") | generator, grader; critic, checker | a critic judges taste |
| undo a fix, make it worse [48] | rename regression | regression | the reader's words (audit Q5) |
| workflow [51] | rename pipeline; no heading — the route list shows it; pending the owner | pipeline, cycle, loop, chain | "pipeline" reads as automatic |
| until you say so [52] · improve [53] | rename your word, repair | your word, approval, consent; repair, fix, polish | "your word" reads as a promise; the purpose's verb |
| one small trial; the gain could be chance (*p* = 0.25) [56] | rename pilot, "not a rate", McNemar | dropping *p*; McNemar, paired | *p* is the profile's trust point |
| documents like yours; reads documents like yours first [57, 58] | rename genre, survey | genre, category, survey, research | literary genre; questionnaire |
| filler [59] · AI slop [60] · rules and best practices [61] | rename water; keep AI slop as the aim; keep rules and best practices, no configuration | water, fluff; generic AI prose; checks, style guide | «вода» is a Russian idiom; the purpose's words |
| task reader, entry file, planted question, claim ledger, pinned, retired, truth pass, evidence level, checkout, bake-off, lens, wave, verifier, ratchet, chain, prior art as link text [11, 12, 19, 21–25, 37, 42, 45–47, 49, 54, 62] | drop | keeping any with a definition | mechanism no reader decision needs; the plain phrase where the idea is needed |
| opening | no heading | What is terse?, Goal, the Why family | the H1 names it |
| Quick start | keep, holding install, update and the first run | Install, Update, Getting started, Usage as separate headings | the genre's word; the owner's read (`skeleton-read-01.md:12–13`) |
| Skills | rename What each one does | What's inside, Commands | 8 of 9 G head this function; the vendor's unit |
| How it works | keep | Rules, Architecture | 4 of 9 G; «как это работает» |
| What was measured | keep, a departure defended | Benchmarks, Evaluation | "Benchmarks" promises a rate |
| Your files · Troubleshooting · Update · Licence | drop | — | the owner's read (`skeleton-read-01.md:14–17, 23–25`); licence: noise (`purpose.md:28`) |

## 5. Deleted outright from `00-current.md`

| Deleted (line, first words) | Cost |
|---|---|
| :7 "Three skills." | none the table does not carry |
| :9–13, the arrow fence, and :12 "what broke … what to write … did it hold" | one glance at what each stage answers; the order moves to the route list |
| :27–29 "It exists because a draft written at ordinary quality was abandoned…" | the one measured reason to settle a shape first; `rethink/SKILL.md:17–21` keeps it |
| :32–34 "…a loop of critics whose lenses do not overlap — the code, the rules…" | which five things the reviewers check (both claims refuted, C12) |
| :34–35 "Every round is kept as its own file." | nothing true (C13) |
| :35 "…and the file, line and evidence level behind every behavioural claim" | the promise that a draft's claims carry their sources (C14) |
| :42–45, the untagged `/plugin` fence | the in-session form for a reader already in Claude Code |
| :48–49 "Nothing else is needed — no dependencies, no configuration file, no account anywhere." | the true parts, no npm dependency and no configuration file, go with the false one (C20) |
| :53 "It makes documentation truer and easier to answer from." | the one-line benefit (unconfirmed, C22); the opening carries the aim |
| :54–55 "…while the second pass cut 105 words and the third added 105 back as missing framing." | the one illustration that a pass adds words as well as cuts them |
| :55–56 "If your text is long because it is wrong, this shortens it…" | the plainest account of what length means here (C25, C26) |
| :58–60 "It will not strip a repetition…", "It will not drop the date or the numbers…" | two promises to a writer who repeats a warning or keeps dated numbers (C28, C29); `writing-rules.md` keeps both rules |
| :64 "…Read the size of it before the numbers:" | nothing; each figure carries its size |
| :66–67 "…took readers leaving the documentation from one to zero…" | the trial's second indicator |
| :68–69 "Three improvements and no reversals over six paired items gives an exact two-sided McNemar…" | the test's name and design; *p* stays |
| :70–72 "Two of the six failures were lies rather than findability…" | the evidence that checking claims catches what a rewrite alone carries forward |
| :73–75 "A reader's own sense of clarity ran against the truth…" | why the audit never asks whether the text was clear; `measure.md` keeps it |
| :76–79 "Five published writing standards were put against two unguided controls…" | the evidence for applying no published standard; `prior-art.md` keeps it |
| :81 "Not measured: which of the four passes produced the gain…" | two open questions about the method's parts |
| :84 "Two published benchmarks that did run that arm found it large." | outside evidence that a run without the text matters; the link reaches it |
| :88–90 "## Licence" / "MIT." | a reader after the licence opens LICENSE or the manifest |

## 6. Edits outside the document

- `plugins/terse/skills/rethink/SKILL.md` — say where the skeleton and a run's files are written (the plugin's own folder, by audit's step-1 formula); without it, 2.4's folder line holds for audit and rewrite only (`audit.md:1041`).
- `plugins/terse/.claude-plugin/plugin.json:4` — the description in the README's words: "user-invoked", "documentation", "fresh readers", "the genre", "for your word", "critics with lenses", "your tree" → you start each one yourself, text, AI readers, documents like yours, until you say so, AI reviewers, your repository.
- `.claude-plugin/marketplace.json:20` — the same string, identical to `plugin.json:4`.
- `README.md:15` (repository root) — terse's row in the mission's words; its `/plugin install` cell is that page's own form, flagged only.
- `plugins/terse/skills/audit/SKILL.md:3–6` — the picker's description: "fresh readers" → AI readers; "a claim ledger" → every claim checked against the code.
- `plugins/terse/skills/rewrite/SKILL.md:3–7` — the picker's description: "one candidate" → a draft; "critics with lenses that differ" → AI reviewers; "the owner" → you; "into your tree only on your word" → into your repository only when you say so.
- `plugins/terse/CHANGELOG.md` — one line under Unreleased › Changed: the README rewritten to this skeleton.

## 7. The owner's decisions, and the five least sure

**Taken** (`skeleton-read-01.md`):

1. The base is the coordinator's (:3): 01 stands, with the owner's order applied.
2. No binding to a version (:4–6): the README describes the code in the repository as it is. That the
   installed 0.1.1 still writes into the reader's repository while this branch does not is a release
   matter, not the README's.
3. The genre's order (:7–8, 11, 19–22): Quick start straight after the opening, then Skills — stated with
   its counts in part 1.
4. The opening names the aim, every word carrying weight and meaning (:9–10).
5. Install, update and the first run in one section, the update a line inside it (:12–13, 18).
6. No Your files section: one line under How it works, the plugin's own folder (:14–17).
7. No Troubleshooting section; the prerequisite is one line where the praised exemplar put it (:23–25).

**Still the owner's**

1. Words: "pipeline" unused ("workflow" if a word is needed); "AI reader" over "reader"; "draft" over
   "candidate"; "skeleton" kept and defined, the pages not renamed.
2. Scope: "text" as the mission, Markdown as the scope fact, nothing about language — the intent, any
   language (`audit.md:20–22`), has no run on a non-English document behind it.
3. The coordinator's reading of what the README must make its reader able to do (`purpose.md:18–22`).
4. Skeleton 01's What it will and will not do to your text is folded, not kept: "not a compressor" into
   the opening, length, the rules, the guard and the cut reasons into How it works, the size change into
   What was measured. The alternative is a sixth section, about +20 for its framing.
5. Length: 625, against 754 (skeleton 01) and 909 now.
6. The edits in part 6.

**Kept though the owner once called it junk.** "Node 22 or newer", one line under Quick start —
«node 22, PATH - это все мусорные детали» (`owner-readme-words.md:107`). Weight: the installed skills stop
without it, "node: command not found", exit 127 (audit C20, made to happen); the praised exemplar carries
the same line under "You need:" (`09-reduction.md:26`); and the owner restored it once already, shown that
evidence (`stages.md:159–165`). PATH stays out.

**For the pages, not the README.** Whether terse should take entrust's convention for where runs live —
the plugin's own data folder only, no temporary-folder fallback, a cleanup that lists and removes runs,
and the note on the prompt a write outside the working directory raises (`plugins/entrust/README.md:129–137`).

**The five least sure**

1. **The path to a reviewed draft in Quick start, beside the route list in Skills.** audit → rewrite is
   then seen twice, as two commands and as a chain — the round-04 fault (`purpose.md:25`). Settles it: the
   owner's read of the first draft's Quick start and Skills, and a task reader going from a report to a
   draft on it with no forced guess at the folder, the draft's place or the apply step.
2. **What it will and will not do, folded.** Q6's answer is split across the opening and What was measured,
   Q5's sits below the cut. Settles it: fresh AI readers asked Q5 and Q6 on the first draft, each right
   from one place; else the sixth section.
3. **Quick start at 180, holding six things, two of them conditional** (the reload clause, the permission
   clause). Settles it: the clean run on this branch's build, which decides both clauses, then
   `sections.mjs` and the owner's read of the first screen.
4. **"The README first" in the opening** against the round-04 verdict "tied to README where the plugin is
   for any text" (`purpose.md:25`). Settles it: the owner's read of the opening sentence.
5. **The excerpt's source.** The only report in the current format is the 2026-09-22 audit of this README
   (`research/2026-09-22-terse-process/audit-2026-09-22/audit.md`), and its sharpest finding is the files
   promise 2.2 excludes. Settles it: the owner's pick — another finding from that report, dated; or a new
   audit of another document, one run at a size the owner sets.
