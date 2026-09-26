# Brief — `plugins/terse/README.md`, skeleton route with an audit

Assembled once for every writer, 2026-09-24, in the order of `plugins/terse/skills/rewrite/SKILL.md` step 2. Every part is copied from the file and lines named in its source line, not paraphrased. The owner's agreement to the skeleton is the first line of `rounds.md` in the run directory `$TMPDIR/terse/runs/20260924-002235-terse-readme-rewrite2`. The short names `skeleton.md`, `audit.md`, `purpose.md`, `terms.md`, `owner-readme-words.md`, `l3-adversarial-findings.md` and `00-original.md` are files of that directory; paths beginning `plugins/` or `research/` are from the root of the checkout; `audit/…` and `rewrite/…` are under `plugins/terse/skills/`.

# The owner's purpose statement

Source: `skeleton.md` part 1, lines 5–40 — both statements verbatim, each with the rendering printed beside it there; the Russian governs.

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

# Part 1. The skeleton

Source: `skeleton.md` parts 2, 3 and 4, lines 73–317, unedited — every section's purpose, exclusions, budget and device; the mechanical rules; the terminology. `S` in part 3 is `plugins/terse/skills/rewrite/scripts`. Files it cites by short name: `skeleton-read-01.md`, `critics/` and `survey/` are under `research/2026-09-22-terse-process/rethink-2026-09-23/`; `09-reduction.md` is `research/2026-09-11-markup-round-0/09-reduction.md`; `stages.md` is `plugins/terse/skills/rethink/references/stages.md`.

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

# Part 2. Who reads this

Source: `audit.md` — the audit of `plugins/terse/README.md` at `1a24018` — `## Reader profile`, lines 17–60, unedited.

## Reader profile

Built by Opus P0 from the plugin's pages, scripts, manifests and the owner's recorded words, per
`reader-profile.md`; confirmed by the owner with three answers: "their words" accepted as constructed
(no issue tracker exists); the target reader documents any document, not only code; and the owner's own
intent, not in any page, is that `terse` works on any text in any language, code or not.

**What it is, in one sentence, without jargon.** Three commands you run by hand inside Claude Code on your
own `.md` files — one measures whether readers get the right answer and whether each sentence is true of
the code, one decides what a document should be before it is written, one rewrites it in reviewed rounds;
nothing reaches your files without your word.

**The reader.** Writes and owns the documentation of a small project; nobody procures this, they install
it alone in about a minute; already suspects the text is bad and cannot prove it; reads Russian and
English. NOT NECESSARILY AN ENGINEER — the audited text need not be about code at all. The only
assumptions allowed: Claude Code is installed; Node 22 only when run from a checkout.

**What brings them here.** Cannot tell whether a document is already fine, and touching it may make it
worse. A draft was abandoned at its third section, and nine of nine objections were about what it
contained, where it sat and how much there was — none about phrasing. Each round of edits heals one thing
and breaks another with nothing to say which. Sentences that are simply false about the code. Their own
sense that it reads well is not evidence. Handing it to an AI means it rewrites everything and they diff in
the dark.

**What they would otherwise use.** Anthropic's own `doc-coauthoring` skill (fresh readers, but the key in
the author's head, the document pasted in, no controls); style linters (Vale, markdownlint); or asking
Claude to "improve my README".

**Why this instead.** The answer key comes from the code before the first reader exists; readers start at
the entry file instead of being handed the text; control questions are mandatory, so a repair cannot
silently break what worked; a ledger and an executed check refuse a round that got worse; nothing is
written to your tree without your word.

**Their words, not ours.** "is my README any good?", "does this even need rewriting?", "нормальный ли
README?", "it rewrote everything and made it worse", "readers never get past the install", "проверь, что в
доке правда", "перепиши README".

**What earns their trust.** A failure that arrives with a file, a line and the code behind it; every number
with its size, including *p* = 0.25 and the admission that no no-document arm ran; checks that ship with a
self-test against a planted violation; a default that writes nothing.

**Voice.** Short sentences, one decision each. No manifesto, no aphorism. Every number with its size. No
caveats — a sentence that needs one says too much. Never narrow the subject: this takes any documentation,
not only documentation of code.

# Part 3. The writing rules

Source: `plugins/terse/skills/rewrite/references/writing-rules.md`, copied in as written, whole.

# The writing rules

Part two of the four-part chain. The text below is fixed. Apply it as written; do not restate it in
your own words, and do not extend it with rules you like better. It was measured in this form.

Default: no sentence that carries nothing. One earns its place by carrying a
contract, a constraint, or a reason the code cannot state.

Cut first: the argument for an instruction, restated wherever the instruction
appears. Give the instruction; the case for it lives in one place.

Also cut: editing history ("previously", "used to", "moved out of", "per PR #123",
"on this machine"); capitals used for emphasis; a true claim on the wrong line.

Define a term where the reader first needs it, not before. A page does not open
with a glossary.

A document states its purpose once, at the top, in the reader's words. That is not
the argument for an instruction, and it is not cut.

Never cut a condition, a limit or a warning where a reader decides. Repetition at
an independently read decision point is not redundancy. A dated measurement keeps
its date and its numbers, including ones the code has since changed.

Counts - sentence length, repeated phrases - prompt a review. They are not gates.

## Provenance

The twenty lines above are reproduced byte for byte from `PART 2` of the prompt that was measured, kept
at `research/2026-09-10-chain/chain-source-prompt.txt` in this repository. Their SHA-256 is
`7a577b29aff3a255de1f7b2418f8c16cb8246d78e03bb31d1ea64ced772f635d`, computed over the block alone and not
over this file. If an edit ever lands inside them, that digest stops matching and the reproduction claim
above becomes false.

## Where these rules came from

A run on 2026-09-10 put five writing standards against two unguided controls, on one README, across ten
seats with the models hidden from the judges. Both controls beat both entries of both published
standards. On the first 116 words, seven of the ten proposed nothing at all, two produced a longer text,
and the only seat that shortened it (116 to 97 words) was a control. One observation per cell, one
passage, one run — enough to justify not adopting a standard, not enough to state a rate. The lesson is
in the last rule above: standards that read as checklists produce audits, not rewriting.

These rules were themselves written against models as they behaved in September 2026. Anthropic's own
guidance now warns that anti-formatting instructions written for earlier models push newer ones the wrong
way, and the mechanism applies here: a rule aimed at a failure the model no longer has becomes a rule
that causes one. Re-check them against the model in front of you before treating them as fixed.

Already rejected on that evidence, so do not reach for them here: Diataxis or a house style guide as a
mandatory pass; a hard word limit per sentence; a prose linter (Vale, textlint, proselint); a
punctuation gate in CI.

# Part 4. The curse of knowledge

Source: `plugins/terse/skills/rewrite/references/curse-of-knowledge.md`, copied as written, whole.

# The curse of knowledge

Part three of the four-part chain. The text below is fixed. Run the three numbered steps in order and
keep the inventory from step one; it is one of the artifacts `rewrite` returns.

Camerer, Loewenstein & Weber (1989) and Newton (1990): once you know something you cannot accurately
simulate the mind of someone who does not. Tappers tapping a song predicted listeners would name it half
the time; the real rate was 2.5%. Your documentation is the tapping. You hear the melody and can no
longer hear the knocking. The procedure:

  1. Inventory the invisible prerequisites: what must a reader already know for this to make sense -
     vocabulary, mental model, context, prior steps. The items you almost did not list are the curse.
  2. Rebuild from the reader's actual state, not yours minus a bit: what do they see first, what will
     they try first.
  3. Write to the failure point: wherever a non-knower stalled, that is where the melody was playing
     silently in your head.

Its own warnings: do not fix by adding more text, because the curse hides missing framing rather than
missing detail, and one sentence of "what this is and when you need it" beats three paragraphs of how.
Every "obviously", "simply" or "just" hides a prerequisite.

## Provenance

The fifteen lines above are reproduced byte for byte from `PART 3` of the prompt that was measured, kept
at `research/2026-09-10-chain/chain-source-prompt.txt` in this repository. Their SHA-256 is
`fac7a93b1e7e8a5cc71beda90ee0c0f6626a2a4499b366eb50ed48c87ebe2409`, computed over the block alone and not
over this file.

## What the inventory looks like when it is honest

From the 2026-09-10 run on one README, three of the twenty-four items it found:

- **Two installations.** The host tool being installed does not establish that the second one is
  installed and authenticated. Name both, and the language runtime, in the first setup paragraph.
- **Configuration versus prerequisites.** A reader treats every item under a heading named
  Prerequisites as mandatory. Say at the install decision that the optional file need not be created.
- **Instructions versus checks.** Prose addressed to a model is not an executable check. A reader who
  cannot tell them apart believes a verification runs that does not.

Note the shape: none of them is a missing detail. Each is a missing frame around details already on the
page. That pass added 105 words to a text the previous pass had cut by 105, and the addition was framing
rather than implementation background.

# Part 5. Where the readers failed

Source, in three pieces. First, `audit.md` `## What broke`, lines 997–1025, verbatim; its page citations are to the checkout at `1a24018`. Second, the adversarial whole-document read of the same README, `l3-adversarial-findings.md` (2026-09-22): lines 3–5, then its four findings, each copied from its heading through its statement — F1 lines 7–13, F2 47–51, F3 67–71 and 89, F4 91–97 — with each check and its observed output left at the lines named in its place. Third, the passages that worked: the rows of `audit.md` `## Reader results` answered right with the document — the header, lines 970–971, and lines 972, 976, 978, 980 and 982, verbatim.

## What broke

### Q2 — refuted — README.md:35-36

Cause: the text states what the code does not do. "It writes into its own run directory. Applying anything
to your files needs your word." The run directory is `research/<date>-<slug>/` at the root of the repository
that holds the document (`rewrite/SKILL.md:66-67`), and a code defect found in the rounds is written into
that repository's `ISSUES.md` (`rewrite/SKILL.md:136-140`, `loop.md:41`), neither with a word; only applying
the candidate waits for one (`rewrite/SKILL.md:176-177`). Ledger: C16 refuted, C15 Position. The reader
quoted the line and answered "No". The same promise stands in `rewrite/SKILL.md:6-7`, `plugin.json:4`,
`marketplace.json:20` and `CHANGELOG.md:63-64`. What a rewrite must do: correct the claim at its source —
or the owner changes the page so the claim becomes true; that choice is not the audit's.

### Q7 — reader failure, and one `missing` entry

The docs-arm reader answered a confident "Yes" from README.md:18, which says how readers move through the
documentation and nothing about its language; by `measure.md` that is the reader answering from what it
knew, not a failure of the text. Beside it, `missing`: the owner's intent — the method holds for any text
in any language, code or not — appears in no page, and no question can be answered on it from the
documentation. What a rewrite must do: write the answer, and say where it goes. Found in passing by the
truth pass, level 3: `rule1.mjs` flags a path and "exits 2" in an English line and passes the same line in
Russian; a code defect, recorded in the repository's `ISSUES.md`, not the document's failure.

### Task TB — harmful — rewrite/SKILL.md:64-67, 136-140

Every sentence true, and the sequence leaves a reader who wants nothing written into their repository
worse off: the rewrite's run directory is created inside the repository with no consent gate before it, and
the routing rule writes into a tracked file. The reader's own conclusion from the pages: not to invoke
`rewrite` at all. What a rewrite of the pages must do: repair the recipe, and test it by running it.

## The adversarial whole-document read

Target: `~/Git/agent-skills/plugins/terse/README.md`, commit `ed7335f9db83f859f1fe5ba767c7d63b2622dfb6`, branch `terse-process-2026-09-22`. Checks performed on 2026-09-22. All README lines below refer to that snapshot. Relative source paths below are relative to the repository root.

Four findings: three CONFIRMED, one PLAUSIBLE. These are additions to the earlier truth pass, not a repetition of its known refutations. The independent candidate list was saved as `independent-pass.txt` before the earlier audit was opened. The 46 prose entries of `research/2026-09-22-terse-process/audit-2026-09-22/audit.md` were then read and compared. That audit targets `1a24018`; the README is unchanged between that commit and the requested snapshot, but the rewrite implementation changed.

## F1 — CONFIRMED — the documented install does not deliver the checkout's repaired write boundary

**README:** 35–36, 43–49. **Lenses:** A, C, E. **Ledger relationship:** ADDS TO C18/C19; distinguishes the now-superseded checkout allegations C15/C16 from the still-published instructions. The earlier pass installed a local checkout and expressly did not fetch the GitHub source. This finding is about what the actual published install commands delivered.

The exact two shell commands fetched `main` at `8c041b76d7f30196441285d77985b81ae9c9e59f` and installed terse 0.1.1. That installed rewrite page tells the agent to create `research/<date>-<slug>/` inside the document's repository and route a code defect to the repository's `ISSUES.md`. The permission boundary is stated only for applying the candidate. The reviewed checkout instead requires an external run directory and permission before putting a code defect into `ISSUES.md`. Both payloads still identify themselves as 0.1.1. A reader obeying Install gets the older recipe while relying on “Applying anything to your files needs your word.” The local repair therefore does not settle the README's promise for its advertised installation route.

This confirms the fetched payload and its instructions, not that a model performed the unapproved writes. No rewrite model run was made.

Check and observed output: `l3-adversarial-findings.md` lines 15–45.

## F2 — CONFIRMED — “no account anywhere” hides the host authentication prerequisite

**README:** 47–49. **Lenses:** A, C, E. **Ledger relationship:** ADDS TO C20. C20 refuted the dependency claim through Node and discussed the lack of an additional Codex account requirement. It did not test a fresh, unauthenticated Claude Code installation. The missing Node prerequisite is deliberately not reported again here.

An installed but unauthenticated Claude Code can complete both plugin installation steps and still cannot start a model turn. The README says “Nothing else is needed” and “no account anywhere,” without limiting that statement to an additional terse/Codex account. A new reader is told installation is sufficient and encounters an authentication refusal only when trying to use it. The observation establishes the default first-party host's authentication requirement; it does not establish that every supported provider requires an individual Anthropic account.

Check and observed output: `l3-adversarial-findings.md` lines 53–65.

## F3 — CONFIRMED — “every claim” conceals an explicit exclusion for external-tool recipes

**README:** 3–5; examples of the affected category at 43–49. **Lens:** A. **Ledger relationship:** ADDS TO C02. C02 already questioned the universal guarantee, the no-code fallback, and missing failures having no line. It did not identify the explicit external-tool exclusion.

The advertised coverage is “checks every claim about behaviour against the code.” The truth-pass specification explicitly excludes “recipes for tools this repository does not ship” and says they do not enter the ledger. Instructions for host tools are sentences a reader acts on; this README's own Claude Code install recipe is an example of that category. A reader cannot infer from the headline that these instructions are excluded from the systematic truth ledger and routed to rewrite instead. This is an observed scope mismatch in the prescribed process, not a claim that no individual critic will ever check an external command. Task readers or rewrite critics may catch some such defects incidentally.

Check and observed source: `l3-adversarial-findings.md` lines 73–87.

The second check is decisive about the specification. Executed exclusion behavior of an audit model is unknown; there is no deterministic truth-pass CLI to run without starting a model workflow.

## F4 — PLAUSIBLE — the re-audit arrow lacks a way to preserve the candidate's reading context

**README:** 10–12, 35–36. **Lenses:** A, C, E. **Ledger relationship:** ADDS TO C05/C15. C05 confirmed the pipeline but did not check how its temporary candidate becomes the next audit's entry/corpus. C15 addressed the run directory's location; the latest implementation now puts it outside the repository.

The README promises a candidate and diff, then shows `/terse:audit` again, while applying the candidate requires a separate decision. It does not explain how to audit that external candidate with its original relative links and sibling documentation intact. The implementation also provides no staging or entry-file substitution rule: rewrite produces round files outside the repo, while the reader brief permits Markdown inside the repository and re-measurement requires the same entry file. Pointing the next audit at the original can measure unchanged text; pointing it at the bare temporary file changes its link context. A virtual overlay or staged tree could resolve this, but neither is specified by the cited contract.

The link relocation failure is confirmed by an experiment on this README. An actual audit choosing the wrong corpus is PLAUSIBLE, not observed: no paid reader run was performed.

Check, observed output and supporting file checks: `l3-adversarial-findings.md` lines 99–124.

## The passages that worked

| # | Arm | Question | Answer (abridged) | Right | Steps | Departed | Quote | Note |
|---|---|---|---|---|---|---|---|---|
| 1 | docs | What do I type to install this? | Run `claude plugin marketplace add Nowely/agent-skills`, then `claude plugin install terse@nowely`. | yes | 1 | no | README.md:47-48 — “The same two steps from a shell: `claude plugin marketplace add Nowely/ |  |
| 3 | docs | Which of the three do I run first? | Run `/terse:audit` first. It checks whether the existing README gives readers the right answers and produces a run file for `/terse:rewrite` | yes | 1 | no | README.md:11 — `/terse:audit → run file → /terse:rewrite → candidate + diff → /terse:audit |  |
| 4 | docs | Do I get fixes, or does it rewrite the whole file on me? | You get proposed fixes, not an automatic rewrite of your file. It creates a candidate and diff in its own run directory, and applying change | yes | 1 | no | It writes into its own run directory. Applying anything to your files needs your word. — R | 'proposed fixes' misnames the form (a whole candidate), but names the candidate, the diff and the approval; scored right on the either/or |
| 5 | docs | Will a second pass undo what the first one fixed? | No. A later pass is required to preserve verified claims; if it removes one or revives retired wording, the round fails rather than being ac | yes | 3 | no | `ledger.mjs` fails a round that loses a claim or revives a retired phrase. — skills/rewrit | the categorical 'No' overstates the guard; the mechanism it names is the key's |
| 6 | docs | Is it going to cut my long document down? | Only sometimes. It is not designed as a compressor: it shortened the measured document by 6%, but difficult explanations may remain long. It | yes | 1 | no | README.md:53-56 — “It makes documentation truer and easier to answer from. It is not a com |  |

# Part 6. The accuracy floor

Source: `plugins/terse/skills/rewrite/SKILL.md` lines 54–57 (step 2, item 6), verbatim; then the three levels it points to, `plugins/terse/skills/audit/references/truth-pass.md` lines 8–19, verbatim. "This checkout" is `~/Git/agent-skills`, branch `terse-process-2026-09-22`, at `78c17ef` when this brief was assembled.

6. **The accuracy floor**: every statement about behaviour must be true of the code in this checkout,
   and the writer records the level of evidence it reached — the three levels are in
   [truth-pass.md](../audit/references/truth-pass.md#three-levels-of-evidence). A claim about a lifecycle
   (what stays, what is removed, what a continued or retried run sees) at level 2 is a guess: run it.

## Three levels of evidence

Citing a line is the weakest of the three, and it is the one that feels like proof.

| Level | What is proved | What it takes |
|---|---|---|
| 1 | the line exists | the path and line number resolve |
| 2 | the code says this | an independent reader of that code would state the same thing |
| 3 | the behaviour happens | a check that runs and shows it |

Record the level you actually reached, not the level you wish you had. The audit that first stated this
rule admitted in its own header: *citation existence checks are not runtime verification*.

# The owner's verdict on the rejected round — what a writer must not repeat

Source: `purpose.md` lines 24–28, verbatim; `04-terms-rejected.md` is in the rethink run directory `$TMPDIR/terse/runs/20260923-212113-terse-readme-rethink`.

The owner's verdict on the rejected round (`04-terms-rejected.md`): the opening too long, starting with a
question, tied to "README" where the plugin is for any text, silent on what the plugin is for; the pipeline
described twice, better shown with another syntax; Install verbose and its timing unclear; no table or
list of the skills as plugin READMEs have; water in paragraphs; technical detail a reader does not need;
the licence line is noise; the codex-delegate rounds — structure, then plan, then template — looked better.

## Coordinator's note, 2026-09-24 — read after the parts above

1. **Stale findings in part 5.** The audit of 2026-09-22 measured the pages at commit `1a24018`. The pages on this branch (HEAD `78c17ef`) changed since: `rewrite` keeps its run in a folder of the plugin's own outside the repository (`plugins/terse/skills/rewrite/SKILL.md`, step 4) and writes the repository's `ISSUES.md` or the document only on the user's word; `audit` writes nothing into the audited repository; `rethink` still names no place for its skeleton. So the failures Q2, task TB, C15's position note and C16 describe a behaviour the code no longer has. The owner's rule: a README describes the code as it is — write what the pages on this branch do, at the evidence level you reach, and do not describe the old behaviour.
2. **Node.** The profile's "Node 22 only when run from a checkout" is the refuted claim C21; the skeleton's Quick start says "You need: Node 22 or newer" because the installed skills stop without it (`node: command not found`, exit 127 — audit C20). Follow the skeleton.
3. **The excerpt in Quick start** (skeleton §2.2, rule 6 item 7): the only report on record in the current format is this README's own audit, `audit.md` in this directory, dated 2026-09-22. Take any verbatim excerpt of at most thirty words from its *Score* or *What broke* section except the finding about the files promise (Q2), which the skeleton excludes; give its date.
4. **The install commands on record.** `claude plugin marketplace add Nowely/agent-skills` then `claude plugin install terse@nowely` ran on a clean, signed-out configuration on 2026-09-23, exit 0 both (`research/2026-09-22-terse-process/rewrite-2026-09-22/run/probe-03/install-probe.log`), and the same from a local checkout path (`…/run/probe-04/install-checkout.log`). A skill run needs a signed-in Claude Code. The update commands, `claude plugin marketplace update nowely` and `claude plugin update terse@nowely`, are the vendor's documented form and have not been run here: write them as the vendor documents them, at that level.
5. **The ledger.** `ledger.json` holds 17 confirmed claims pinned to the original's words and 11 refuted phrasings retired. A whole-file candidate against a new skeleton will lose most pins by wording; that is expected at this step and is settled in round 02 by re-pinning under the same names. What you must not do is bring back a retired phrasing: read the `want: false` entries once.
6. **Your draft's path.** Write the whole candidate as one Markdown file to the path your message names under `candidates/` in this run directory — that is your temporary directory for this run. Nothing else is written anywhere.
