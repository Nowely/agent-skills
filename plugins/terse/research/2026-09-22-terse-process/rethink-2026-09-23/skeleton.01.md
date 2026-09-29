# Skeleton: `plugins/terse/README.md` — 2026-09-23

## 1. Purpose

The owner's statement, verbatim (`purpose.md:5–8`):

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

Structure 01, "Decide in thirty seconds": the first screen alone lets a reader decide whether terse is for
them, and the rest follows the order of their decisions — choose, install, learn what it writes, try it,
then the method and the evidence. Ranked 2nd by the owner's-calibration critic, 3rd by the reader's-task
critic, 1st by the genre-and-evidence critic.

## 2. Sections

Budgets are `sections.mjs` counts: whitespace-separated tokens under a `##` heading — table pipes, list
markers and fence lines included, the heading line excluded; `(opening)` includes `# terse`. The current
README counts 909 by the same rule.

### 2.1 `# terse` and the opening, no heading — 57

- **Purpose.** Say what terse is for — assessing and improving any text, in rounds of edits by several AI
  agents working from rules and best practices, toward text without AI slop — and give one concrete reason
  to want it, taken from what brings the reader (`audit.md:34–39`: they cannot tell whether a document is
  fine, and touching it may make it worse).
- **Excludes.** A question as the first sentence; "README" or "documentation" as the scope; skill names and
  commands; install; the order of the skills; any number or date; where anything is written; freedom from
  AI slop as a result rather than the aim; any language or file format as verified; other tools;
  reassurance about dependencies.
- **Device.** One plain paragraph under the H1. No tagline, badge, banner, count line or navigation line.
- **Graft.** The purpose's *how* from 05 §1 — "in rounds of edits by several AI agents, from rules and best
  practices, without AI slop" — displacing 01 §2's closing clause on files; "round" is allowed here.

### 2.2 `## Skills` — 130

- **Purpose.** Let the reader pick one of the three by their situation and see what each hands back, then
  show the order they run in and the way back to audit.
- **Excludes.** What happens inside a skill (AI readers, writers, judges, reviewers, rounds); how many
  agents and what they cost; where anything is written; output excerpts; the reader's situation in the
  route list (the When column carries it, once); a route told in prose; a diagram; a name-only list.
- **Device.** A three-row table, Command · When to run it · What you get back (synthesis C). audit: a
  document exists and its owner cannot tell whether it is fine → a report of which questions the text
  answers wrong, the cause of each, file and line, and no rewording. rethink: no document yet, or it says
  the wrong things in the wrong order → a skeleton to agree to before anything is written. rewrite: after
  audit, or after a skeleton is agreed → a new draft of the whole document beside the reader's, and its
  diff. Under the table, no heading: that each is started by the reader, then two lines, each a chain of
  commands ending in audit again with the same questions — audit → rewrite → audit; rethink → rewrite →
  audit.
- **Graft.** The unheaded route list from 09 §2, displacing 01 §9's route list (~35) and 01 §7's clause on
  the rethink branch.

### 2.3 `## Install` — 20

- **Purpose.** Give the one install path to copy, as it ran on a clean Claude Code configuration.
- **Excludes.** The in-app `/plugin` form; the commands again in prose; "nothing else is needed" (refuted,
  audit C20); Node and PATH (2.10); a platform matrix; commits and versions.
- **Device.** One `bash` fence: `claude plugin marketplace add Nowely/agent-skills`, then
  `claude plugin install terse@nowely` — 11 tokens; the other 9 only for a prerequisite or a step the
  clean run showed was needed.
- **Graft.** From 09 §3, "as run on a clean configuration" and a prerequisite only where a clean install
  failed without it, displacing 01 §4's "in-app and shell forms" and its reserved prerequisite clause.

### 2.4 `## Update` — 12

- **Purpose.** Give the command that brings an installed terse to the latest release, as run.
- **Excludes.** Version history, the CHANGELOG, commit hashes, which version this page describes.
- **Device.** One `bash` fence in Install's form (rule 6). The vendor documents
  `claude plugin marketplace update nowely` and `claude plugin update terse@nowely`
  (`survey/synthesis-sources/code.claude.com__docs__en__plugin-marketplaces.md:653, :1344`); the fence
  holds what the clean run needed.
- **Graft.** From 09 §4, displacing 01 §5's "one line, one command".

### 2.5 `## Your files` — 60

- **Purpose.** Before anything runs, say what each skill writes and where — each run in a folder of its own
  outside the reader's repository, whose path the report names — that each skill says how many agents it
  will start and on which model and waits until the reader says so, and that nothing in the repository,
  the document included, changes until the reader says so.
- **Excludes.** The folder's path; `$TMPDIR`; keeping and deleting runs (2.10); how a bug found in the code
  is recorded, beyond that it too waits; a cost figure (none was measured); "every agent" as a universal
  (audit C17).
- **Device.** Two or three plain sentences, no table.

### 2.6 `## Quick start` — 125

- **Purpose.** Take the reader from the first command to a reviewed draft: run audit in Claude Code where
  the text is, answer its first question (which Markdown files, where readers start), read what comes
  back, stop if every answer is already right, otherwise say whether the document's shape stands, give
  rewrite the folder the report names — or run rethink first — and decide from the diff whether the draft
  replaces the document.
- **Excludes.** Install; any order of skills beyond the two commands typed here (the return to audit
  belongs to the route list); the agents and their count (2.5); what happens inside a round; an invented,
  tidied or success-only excerpt; an excerpt about this page's own promise on files, which would contradict
  2.5.
- **Device.** `/terse:audit` and `/terse:rewrite`, each in its own `text` fence; one verbatim excerpt of a
  recorded report, 30 words at most, in a `text` fence, with its date (A09); plain sentences between. The
  Markdown scope fact is stated once, here.
- **Graft.** From 09 §5, the command in its own `text` fence, displacing the command inside 01 §7's
  paragraph.

### 2.7 `## What it will and will not do to your text` — 90

- **Purpose.** Answer the reader's two fears about the text itself — will it cut my document down, will a
  second pass undo the first — each with the rule or check behind the answer.
- **Excludes.** The two predictions about long text (C25, C26); "will not touch" and every other
  never-guarantee (C27–C29): a rule is stated as a rule and a refusal as what the check refuses; the files
  boundary (2.5); the trial's evidence (2.9).
- **Device.** A short list, one fact per item: not a compressor, and length never picks a draft (C23); the
  one measured size change, 2,725 → 2,571 words, 2026-09-10 (C24); every cut of twenty words or more
  handed over with its reason; the rule against cutting or weakening a condition, a limit or a warning
  where a reader decides; a round that loses a sentence an earlier round checked true, or brings back one
  found false, refused before the reader sees it (audit Q5 key).

### 2.8 `## How it works` — 80 — the cut for rule 1

- **Purpose.** Give the reader who came for the method how a judgment is made — a fresh AI reader per
  question, answering from the text alone and starting where the reader's own readers start, against an
  answer key written first from the code or a named source; the same questions without the text; one of
  five causes for each wrong answer, in the report's order — and how a draft is made: three writers, two
  judges, then rounds of edits checked by AI reviewers, each checking one thing, under writing rules named
  by what they forbid and the practices of documents like yours, which rethink reads first.
- **Excludes.** Script, file and check names; ledger, pin, verifier, lens, wave, bake-off, evidence
  levels; a rule catalogue or configuration (there is none); exit codes; the route between skills (2.2).
- **Device.** A short list, one mechanism per item.

### 2.9 `## What was measured` — 100

- **Purpose.** Give the evidence at its size — each figure with its date, its sample and what ran (the
  plugin, or the method it was built from) — and the one thing never measured: whether a person reads the
  improved text better.
- **Excludes.** The writing-standards experiment; clarity against truth; which pass produced the gain;
  McNemar, pilot, rate, arm, control, chain; a figure without date and size; a chart; "prior art" as link
  text.
- **Device.** A short list of sized facts — the 2026-09-10 trial (3 of 6 right → 6 of 6, the questions it
  already answered right still right, one small trial, the gain could be chance, *p* = 0.25, never run
  without the text); at the writer's choice, the 2026-09-22 audit of the previous README (5 of 7 with the
  text, 0 of 7 without) — and one link to `references/prior-art.md` named by what it holds.

### 2.10 `## Troubleshooting` — 80

- **Purpose.** Let a reader whose run stopped, or whose run's folder is gone, fix it without leaving the
  page.
- **Excludes.** A symptom not made to happen on the release build or recorded in a run; install
  alternatives; configuration; questions the sections above answer, beyond a symptom's one-line fix.
- **Device.** A table, Symptom · Cause · What to do, at most three rows: the rows differ (rule 9), and a
  symptom row is `dup.mjs`'s one stated exception (`loop.md`, "Duplication"). Candidates, each kept only if
  reproduced: `node` not found when a skill runs — Node 22 or newer, installed or not (`package.json:4–5`;
  audit C20–C21); a run's folder gone — uninstall without `--keep-data`, or the temporary folder purged
  (`audit/SKILL.md:39–41`); rewrite stops and offers rethink — no agreed shape (`rewrite/SKILL.md:14–20`).

### Whole page

- **Devices.** Plain headings; tables only in Skills and Troubleshooting; fences only for commands and the
  excerpt; no badge, banner, image, count line, navigation line, table of contents, emoji or
  horizontal-rule system.
- **Not on the page.** Licence (5 of 10 tool READMEs carry one; the LICENSE file and the manifest's
  `license` carry the fact); Contributing (6 of 10; no policy exists to state); a table of contents (A24);
  layout or schema (A23); a component count (A22); a screenshot (A10); an install matrix (A07); comments
  inside command fences (A11).
- **The owner's exemplar, sharpdeveye/maestro.** Fetched 2026-09-23 with WebFetch and `curl` (HTTP 200):
  1,478 words by `wc -w`, 347 lines, SHA-256 `4093b017…264e77e7`, 593★ (GitHub API); copy at
  `maestro-README.fetched.md` beside this file. No H1 — a banner image, eight badges, a count line and a
  navigation line sit above the first heading. Headings in order: What is Maestro? · Quick Start ›
  Combine Commands · The Skill: agent-workflow · 25 Commands › Analysis — read-only, generate reports ›
  Fix & Improve — make targeted changes › Enhancement — add capabilities › Utility · What's New in v2 ›
  Memory Layer › Audit Trail › Cost Estimation › `/reflect` — Effectiveness Scorecard · Anti-Patterns
  ("Workflow Slop") · Supported Tools · MCP Server › Local (stdio) › Remote (HTTP) › What the MCP Server
  Exposes · Manual Installation · Project Structure · Contributing · License.
  - Taken: the problem and what answers it before anything else → 2.1; the workflow as a chain of commands
    (Combine Commands) → 2.2's route list and 2.6's two fences; slop named as what the rules forbid, not
    as a promised result (Anti-Patterns) → 2.1's aim and 2.8's rules.
  - Refused: a heading on the opening (the H1 names the plugin; a heading spends the first screen); install
    inside a Quick Start above the command table (part 7, decision 3); the command table grouped by
    effect (three rows need no groups; 2.5 carries the boundary); comments in fences (A11); banner,
    badges, count and navigation lines (A15, A22, A24); What's New (the CHANGELOG's job); Supported Tools,
    MCP Server and Manual Installation (one host, one install path); Project Structure (A23);
    Contributing; License.

### Total — 754

57 + 130 + 20 + 12 + 60 + 125 + 90 + 80 + 100 + 80 = 754, against 909 now. Against 01's 511 words — about
530 in these units once table pipes count — the growth is Troubleshooting +80, the path to a reviewed
draft in Quick start +70, How it works +60 for the method once the route list left it, the second-pass
answer in 2.7 +15, Update +2, Skills −2.

## 3. Mechanical rules

Run on each round `R`, from rewrite's run folder, with `S` its `scripts/`.

1. **Rule 1.** `node "$S/rule1.mjs" "$R" --cut "How it works"` prints `0 violation(s)`. No `--except`: no
   section above the cut carries an absolute path, a flag, an environment variable, an exit code, a
   protocol name or an `ABC:` field — fences and the excerpt included. How it works, What was measured and
   Troubleshooting may. A command that runs only with a flag is a question to the owner: `--except`
   excuses paths, not flags.
2. **Headings.** `grep -n '^#' "$R"` prints `# terse` and then exactly the nine `##` headings of part 2, in
   that order; no `###`.
3. **One idea, one home.** `node "$S/dup.mjs" "$R" concepts.json` prints `0 concept(s) in three or more
   sections`; the one exception is a concept that reaches three only through a Troubleshooting row, named
   as such in `rounds.md`. `concepts.json`, each name ending in the sections meant to carry it:

```json
[
  {"name": "consent — Your files, Quick start", "pattern": "say so\\b|say whether|your word"},
  {"name": "outside your repository — Your files, Quick start", "pattern": "outside your repository|folder of its own|its own folder"},
  {"name": "agents announced, then it waits — Your files", "pattern": "how many agents|which model|announce"},
  {"name": "you start each one — Skills", "pattern": "start each one yourself|starts? (?:on its own|by itself)"},
  {"name": "back to audit — Skills", "pattern": "audit again|again with the same questions|same questions again"},
  {"name": "not a compressor — What it will…", "pattern": "compressor|shorten|shorter|cut (?:it|your [a-z]+) down|2,725"},
  {"name": "a fix is not undone — What it will…", "pattern": "undo(?:es)? a fix|make it worse|checked true|found false"},
  {"name": "condition, limit, warning — What it will…", "pattern": "condition, a limit|limit or a warning"},
  {"name": "AI readers — How it works, What was measured", "pattern": "AI readers?"},
  {"name": "answer key; without your text — How it works, What was measured", "pattern": "answer key|without (?:your|the) text"},
  {"name": "claims against the code — How it works", "pattern": "against the code|named source"},
  {"name": "the five causes — How it works", "pattern": "misleading steps|hard to find|misplaced"},
  {"name": "best practices; documents like yours — opening, How it works", "pattern": "best practices?|documents like yours"},
  {"name": "writers, judges, reviewers — How it works", "pattern": "\\bwriters?\\b|\\bjudges?\\b|\\breviewers?\\b"},
  {"name": "the diff — Skills, Quick start", "pattern": "\\bdiff\\b"},
  {"name": "p = 0.25 — What was measured", "pattern": "0\\.25|small trial"},
  {"name": "a person, never measured — What was measured", "pattern": "a person\\b|\\bpeople\\b"},
  {"name": "Node — Troubleshooting", "pattern": "\\bNode\\b"}
]
```

4. **Budgets.** `node "$S/sections.mjs" "$R" budgets.json` prints no section over its budget and a total
   of 754 or less; an overrun is a question to the owner, answered in this file. `budgets.json`:

```json
{
  "(opening)": 57,
  "Skills": 130,
  "Install": 20,
  "Update": 12,
  "Your files": 60,
  "Quick start": 125,
  "What it will and will not do to your text": 90,
  "How it works": 80,
  "What was measured": 100,
  "Troubleshooting": 80
}
```

5. **Fences.** Every opening fence carries a language: exactly two `bash` (Install, Update) and three
   `text` (Quick start). `grep -c '/plugin' "$R"` prints 0.
6. **The eleven content rules of `stages.md`: all adopted.**
   1. The first sentence says what terse is for, and holds no `?`.
   2. Item 1 passes, and the opening carries none of the concepts consent, outside your repository,
      agents announced.
   3. Technical detail only at or after How it works.
   4. PATH is not named as a requirement; Node 22 stays, as a Troubleshooting row, because the skills stop
      without it (audit C20).
   5. The first non-blank line under `## Install` opens a `bash` fence.
   6. The same under `## Update`.
   7. The excerpt is found verbatim (`grep -F`) in the recorded report it cites; each Troubleshooting
      row's symptom was made to happen.
   8. Item 7 below.
   9. Skills and Troubleshooting are tables, and no two rows say the same thing.
   10. Item 5.
   11. Outside the `text` fences, `grep -c -i -w -E 'unless|only if|except when|as long as|provided that'`
       prints 0.
7. **Words.** Outside the `text` fences this prints nothing:

```bash
awk '/^```text$/{f=1;next} /^```$/{f=0;next} !f' "$R" | grep -n -i -w -E 'invoke[sd]?|invocation|user-invoked|spawn(s|ed)?|documentation|task readers?|entry file|baseline|no-document|arm|controls?|planted|ledger|pinned|pins?|retired|truth pass|evidence levels?|refuted|placement|findability|harmful|run director(y|ies)|run files?|your tree|code defects?|defects?|checkout|candidates?|bake-off|critics?|lens(es)?|wave|verifier|regressions?|ratchet|pipeline|chain|pilot|McNemar|genre|survey|water|repairs?|prior art|TMPDIR|consent|your word'
```

   and so does `grep -o -i -E '\b[a-z]+ readers?\b' "$R" | grep -v -i -E '^(ai|your) '`. Each of
   `until you say so`, `rounds of edits`, `documents like yours` and `AI reviewers` occurs at least once.
   The first sentence that holds `skeleton` also holds `outline`; `shape`, `order`; `diff`, `change`;
   `score`, if used, `without`; `AI reader` first appears as `fresh AI reader`. `terse` appears only as
   the name. Checked on 00-current.md, the first grep finds 28 lines and the second 15 phrases.

   **Must use**, wherever the idea appears: text (the mission) and document (the unit); skill, and
   command only for the line typed; run; you start each one yourself; start (agents); AI reader; agent;
   a profile of who reads it; answer key; the same questions without your text; questions it already
   answers right; claim; false, missing, misplaced, hard to find, misleading steps — the causes, in the
   report's order; folder; report; your files, your repository; bug; skeleton, shape, diff, score — each
   glossed at first use; draft; round, first as "rounds of edits"; pass; writer, judge; reviewer, first
   as "AI reviewers, each checking one thing"; undo a fix, make it worse; until you say so; improve;
   one small trial, the gain could be chance (*p* = 0.25); documents like yours, reads documents like
   yours first; filler; AI slop, as the aim; rules and best practices.

   **Must not**: the grep's list; "pipeline" stays on it until the owner rules (part 7, decision 5).

## 4. Terminology

From `terms.md` (row numbers in brackets); the Troubleshooting heading is decided here.

| Term | Decision | Rejected | Why |
|---|---|---|---|
| terse [1] | keep, only as the name | a rename; "terse" as an adjective | released id `terse@nowely`, tags, 221 lines; its shortener reading is answered in 2.7 |
| audit [2] | keep | check, lint, review | findings, not fixes; its method is readers, not rules |
| rethink [3] | keep; its first mention says what it decides | plan, outline, design | a released command |
| rewrite [4] | keep; never the verb for what happens to the reader's file | improve, revise; fix | rename cost; "fix" reads as line fixes (audit Q4's reader: "proposed fixes") |
| skill · command [5] | skill for the unit, command only for the line typed | command for the unit; tool | the vendor's unit; `commands/` is its legacy word |
| run · you start each one yourself [6] | rename invoke, user-invoked | user-invoked, manual | manifest jargon; "manual" reads as labour |
| text · document [7] | text for the mission, document for the unit; "Markdown (`.md`)" once, as the scope fact | documentation, prose, writing, content | the purpose's «текст»; "documentation" narrowed the mission in round 04 |
| agent [8] | keep | subagent, model, bot | the purpose's «мультиагентность» |
| start [9] | rename spawn | spawn | plain; "launch" acceptable |
| AI reader [10] | rename reader, fresh reader; first as "a fresh AI reader" | reader alone, model agent, subagent, beta reader, test reader, simulated reader | the readers are a model and the page must not claim a person's result (`owner-readme-words.md:86`); "reader" also names the reader's own readers |
| a profile of who reads it [13] | keep | persona, audience analysis | plain |
| answer key [14] | keep, below the cut | expected answers, ground truth, oracle | the test's word, in Russian too |
| score [15] | define at first use by its unit | bare score, rating, accuracy | a writer reads a readability grade; one sense only |
| the same questions without your text [16, 17] | rename no-document arm, baseline | arm, baseline, closed-book, control | the vendor's own framing, with and without the plugin; "baseline" collided in round 04 |
| questions it already answers right [18] | rename control question | control, regression test, canary | "control" is the experiment's untreated arm |
| claim [20] | keep | fact, statement, assertion | true or false: the fact-checker's word |
| false · missing · misplaced · hard to find · misleading steps · cause [26–31] | the five causes in plain words, in the report's order; cause kept | refuted, lied, placement, findability, harmful | "lied" imputes intent; "harmful" reads as offensive or unsafe content |
| run [32] | keep, as the noun | session, job | a run spans sessions |
| folder [33] | rename run directory; its location once, below the cut | run directory, workspace, data directory (location only); `$TMPDIR` never | the vendor's user word; "workspace" means the reader's project |
| report [34] | rename run file | run file, `audit.md`, results | audit's own word for what it hands over |
| your files · your repository [35] | rename your tree | your tree, working copy | plain |
| bug [36] | rename code defect | defect, issue | plain |
| skeleton [38] | keep, defined at first use as the document's outline | outline, plan, design, brief, structure | the word the session prints and the file carries; renaming it in the pages is the owner's call (75 lines) |
| shape [39] | define at first use: what the document says, in what order, at what length | structure, outline | the report prints `shape: agreed`; the genre's "Structure" means files |
| draft [40] | rename candidate | candidate, proposal, suggestion, version, revision | "version" collides with Install and Update; "proposal" reads as line suggestions |
| round [41] | keep; first as "rounds of edits" | iteration, pass, version | the editor's word; «круг правок» |
| writer · judge [43] | keep | generator, grader | plain |
| reviewer [44] | rename critic; "AI reviewers, each checking one thing" | critic, judge, checker | a critic judges taste; "judge" is taken |
| undo a fix · make it worse [48] | rename regression | regression | the reader's own words (audit Q5; the profile) |
| diff [50] | define at first use: every change marked against the original | track changes, patch, comparison | exact for a developer, glossed for a writer |
| workflow [51] | rename pipeline; no heading — the route list shows it; pending the owner | pipeline, cycle, loop, chain | "pipeline" reads as automatic, one skill starting the next |
| until you say so [52] | rename your word | your word, approval, consent, confirmation, sign-off | "your word" reads as a promise; "approval" is also Claude Code's tool prompt |
| improve [53] | rename repair | repair, fix, polish | the purpose's verb, «улучшение» |
| pass [55] | keep | — | the editor's word |
| one small trial; the gain could be chance (*p* = 0.25) [56] | rename pilot, "not a rate", McNemar | dropping *p*; McNemar, paired, rate | *p* is the profile's trust point; the test's names are not |
| documents like yours · reads documents like yours first [57, 58] | rename genre, survey | genre, category, survey, research | a writer reads a literary genre; "survey" reads as a questionnaire |
| filler [59] | rename water | water, fluff; padding acceptable | «вода» is a Russian idiom |
| AI slop [60] | keep, as the aim the rules serve | generic AI prose, machine tone | the purpose's «нейрослоп», and the reader's fear |
| rules and best practices [61] | keep; never imply a configuration | checks, style guide | the purpose's words; there is no rule configuration |
| task reader, entry file, planted question, claim ledger, pinned, retired, truth pass, evidence level, checkout, bake-off, lens, wave, verifier, ratchet, chain, prior art as link text [11, 12, 19, 21–25, 37, 42, 45–47, 49, 54, 62] | drop | keeping any with a definition | mechanism no decision of the reader's needs, several misleading (the evidence level runs backwards to the known scale); where the idea is needed, the plain phrase: "starting where your readers start", "three drafts, two judges", "checks every claim against the code" |
| `# terse` | keep | — | the genre's H1 |
| opening | no heading | What is terse?, Goal, the Why family | a heading spends the first screen |
| Skills | rename What each one does | What's inside, Commands, Available plugins | 8 of 9 plugin READMEs head this function; the vendor's unit |
| Install | keep | Installation | the genre's word |
| Update | new | Upgrade, Updating | pairs with Install; the vendor's `claude plugin update` |
| Your files | new, invented on purpose | Where it writes, Security, Permissions | the reader's own question (audit Q2); "Permissions" is Claude Code's prompt, another gate |
| Quick start | new | Install and first run, Getting started, Usage | the genre's word; an invented one was a measured miss (`stages.md:216–219`) |
| What it will and will not do to your text | keep, a departure defended | Limitations | it says what the text keeps, not what the tool cannot do |
| How it works | new | Rules, Architecture | 4 of 9 plugin READMEs; «как это работает»; "Rules" invites "how do I configure them?" |
| What was measured | keep, a departure defended | Benchmarks, Evaluation | "Benchmarks" promises a rate; this is one small trial |
| Troubleshooting | new | When something goes wrong, FAQ | the genre's word (code-review, claude-hud, the vendor's docs) |
| route list | no heading | Workflow | it sits under the table it orders |
| Licence | drop | License | the licence line is noise (`purpose.md:28`) |

## 5. Deleted outright from `00-current.md`

| Deleted (line, first words) | Cost of deleting it |
|---|---|
| :7 "Three skills." | none the table does not carry |
| :9–13, the arrow fence as a device, and its label line :12 "what broke … what to write … did it hold" | one glance at what each stage answers; the order moves to 2.2's route list, the artifacts to its table |
| :27–29 "It exists because a draft written at ordinary quality was abandoned…" | the page's one measured reason to settle a document's shape before writing; `rethink/SKILL.md:17–21` keeps it |
| :32–34 "…a loop of critics whose lenses do not overlap — the code, the rules, an adversarial reader, a task, a reader's questions — until a round finds nothing new and nothing got worse." | which five things the reviewers check; 2.8 says only that each checks one thing (both claims refuted, C12) |
| :34–35 "Every round is kept as its own file." | nothing true (refuted, C13) |
| :35 "…and the file, line and evidence level behind every behavioural claim" | the promise that a draft's claims come with their sources (unconfirmed as "every", C14) |
| :42–45, the untagged `/plugin` fence | the in-session form for a reader already inside Claude Code, who now types the shell form in a terminal |
| :48–49 "Nothing else is needed — no dependencies, no configuration file, no account anywhere." | the true parts, no npm dependency and no configuration file, go with the false one (C20) |
| :53 "It makes documentation truer and easier to answer from." | the section's one-line benefit (unconfirmed, C22); 2.1 carries the aim |
| :54–55 "…while the second pass cut 105 words and the third added 105 back as missing framing." | the one illustration that a pass adds words as well as cuts them |
| :55–56 "If your text is long because it is wrong, this shortens it. If it is long because…" | the page's plainest account of what length means here (unconfirmed predictions, C25, C26) |
| :58–59 "It will not strip a repetition that sits at a decision a reader reaches independently." | a writer who repeats a warning on purpose gets no promise it stays (C28); `writing-rules.md` keeps the rule |
| :59–60 "It will not drop the date or the numbers from a measurement…" | a text with dated numbers gets no promise they survive (C29); `writing-rules.md` keeps the rule |
| :64 "…Read the size of it before the numbers:" | nothing; each figure carries its own size |
| :66–67 "…took readers leaving the documentation from one to zero…" | the trial's second indicator |
| :68–69 "Three improvements and no reversals over six paired items gives an exact two-sided McNemar…" | the test's name and its paired design, for a statistician; *p* stays |
| :70–72 "Two of the six failures were lies rather than findability…" | the evidence that checking claims against the code catches what a rewrite alone carries forward |
| :73–75 "A reader's own sense of clarity ran against the truth…" | why the audit never asks whether the text was clear; `measure.md` keeps it |
| :76–79 "Five published writing standards were put against two unguided controls…" | the evidence for applying no published style standard; `prior-art.md` and the research record keep it |
| :81 "Not measured: which of the four passes produced the gain, and whether a bake-off beats one careful pass." | two open questions about the method's parts |
| :84 "Two published benchmarks that did run that arm found it large." | the outside evidence that a run without the text matters; the kept link reaches it |
| :88–90 "## Licence" / "MIT." | a reader after the licence opens LICENSE or the manifest |

## 6. Edits outside the document

- `plugins/terse/skills/rethink/SKILL.md` — say where the skeleton and a run's files are written (outside the repository, by audit's step-1 formula); without it, 2.5 holds for audit and rewrite only (`audit.md:1041`).
- `plugins/terse/.claude-plugin/plugin.json:4` — the description in the README's words: "user-invoked", "documentation", "fresh readers", "the genre", "for your word", "critics with lenses", "your tree" become you start each one yourself, text, AI readers, documents like yours, until you say so, AI reviewers, your repository.
- `.claude-plugin/marketplace.json:20` — the same string, kept identical to `plugin.json:4`.
- `README.md:15` (repository root) — terse's row, "Measures whether documentation … and repairs what it measured", in the mission's words; its `/plugin install` cell is that page's own form, flagged only.
- `plugins/terse/skills/audit/SKILL.md:3–6` — the picker's description: "fresh readers" → AI readers; "a claim ledger" → every claim checked against the code.
- `plugins/terse/skills/rewrite/SKILL.md:3–7` — the picker's description: "one candidate" → a draft; "critics with lenses that differ" → AI reviewers; "the owner" → you; "into your tree only on your word" → into your repository only when you say so.
- `plugins/terse/CHANGELOG.md` — one line under Unreleased › Changed: the README rewritten to this skeleton.
- No kept name is renamed (terse, audit, rethink, rewrite, skeleton), so no page pays a rename unless decision 5 renames "skeleton" (75 lines, `terms.md` row 38).

## 7. The owner's decisions, and the five least sure

**Decisions that are the owner's**

1. **The winner.** The three firsts split — 07 (owner's calibration), 09 (reader's task), 01 (genre and
   evidence) — so 07 stood unless the reader's-task critic showed a reader cannot reach an answer from it.
   Its lines on 07: "Q5 none, nearest S7 only promises iterative review; … Q7 none"
   (`critics/astra-reader-task.md:169`), where "`none` means no allocated answer" (:26); "A4 requires
   S2+S7+S8, after the S5 action … backtracking to execute" (:171); "Quick start precedes both the
   access/cost explanation and the file boundary" (:177). So the highest on average: 01, ranked 2, 3, 1,
   mean 2.0 (09 3.3, 05 3.7, 07 4.7). The same critic gives 01 no Q5 or Q7 home either (:85): 2.7 gives Q5
   one; Q7 is decision 6.
2. **The files boundary is the next release's.** 2.5 says nothing enters the reader's repository until they
   say so — true of rewrite on this branch (`rewrite/SKILL.md:76, 88–89, 171–173` at d60c3f8; CHANGELOG
   Unreleased), false of the installed terse@0.1.1 (tag e4d98b6; main 21a225b carries the same pages),
   which writes `research/<date>-<slug>/` at the repository's root and `ISSUES.md` without asking
   (`rewrite/SKILL.md:66–67, 112–113`). Question: does this README ship only in the release that carries
   that change?
3. **Order.** Skills above Install, and Install, Update, Your files and Quick start as four blocks — where
   both exemplars put install and the first run together above the commands: maestro's Quick Start, and
   the "Install and first run" praised at `owner-readme-words.md:105`.
4. **Troubleshooting**, never asked for, is where Node 22 lives — not Install, where it was called trash
   (`owner-readme-words.md:107`). Its weight: 3 of 9 exact-genre READMEs (superpowers "When Something Goes
   Wrong" 290,578★, code-review 147,780★ at repository level, claude-hud 28,133★), 2 of 7 vendor documents,
   bat 60,555★.
5. **Words** that need the owner (`terms.md`, "least sure"): "pipeline" unused — the route list shows it,
   "workflow" if a word is needed; "AI reader" over "reader"; "draft" over "candidate"; "skeleton" kept and
   defined, the pages not renamed.
6. **Scope.** "Text" as the mission, "Markdown (`.md`)" as the scope fact, nothing about language: the
   intent — any text, any language (`audit.md:20–22`) — has no run behind it on a non-English document.
7. **The reading this skeleton serves**: what the README must make its reader able to do
   (`purpose.md:18–22`), the coordinator's reading, marked there as awaiting the owner.
8. **Length.** 754 against 909 now and 01's 511 words (part 2, Total).
9. **The edits in part 6.**

**The five I am least sure of**

1. **The path to a reviewed draft in Quick start (2.6), beside the route list (2.2).** The order audit →
   rewrite is then seen twice, as a chain and as two commands — the fault found in round 04 (`purpose.md:25`).
   Settles it: the owner's read of Skills and Quick start together in the first draft, and a task reader
   on that draft going from a report to a draft with no forced guess at the report's folder, the draft's
   place or the apply step.
2. **Troubleshooting (2.10).** Settles it: each candidate symptom made to happen on a clean configuration of
   the release build — a row that does not reproduce goes, and with no rows the section goes — then the
   owner's word.
3. **The winner's rule, read strictly.** 01 lacks 07's missing Q5 and Q7 homes too; it differs from 07 in
   A4, the consequences before the first run. Settles it: the owner's word on what "cannot reach an answer"
   meant.
4. **The release boundary (decision 2).** Settles it: the owner's word on release order, and a rewrite run
   to its hand-over on the release build with `git status --porcelain` empty in the document's repository
   until the apply step.
5. **The excerpt's source (2.6).** The only report in the current format is the 2026-09-22 audit of this
   README (`research/2026-09-22-terse-process/audit-2026-09-22/audit.md`), and its sharpest finding is the
   files promise 2.6 excludes. Settles it: the owner's pick — another finding from that report, dated, at
   no cost; or a new audit of another document, one run at a size the owner sets.
