# Structure 05 — iterate without harm

Russian, as written:

> в моем понимании, главная миссия - цель плагина. Это оценка и улучшение текста (чтобы это ни значило).
> Документация, комментарии, проза, текст и даже код, и тд - не важно. Плагин итеративно через пайплайн и
> мультиагентность, храня множество правил, бестпрактис и быть способными их найти, оценивает текст,
> делает его лучше итеративно. Для этого есть пайплайн. Без признака нейрослопа, неся истинную ценность.

English rendering (the coordinator's; the Russian governs):

> As I understand it, the main mission is the plugin's goal: assessing and improving text, whatever that
> means. Documentation, comments, prose, text, even code — it does not matter which. Iteratively, through a
> pipeline and multi-agency, holding many rules and best practices and being able to find them, the plugin
> evaluates text and makes it better, iteratively. The pipeline exists for that. Without the marks of AI
> slop, carrying real value.

- First need: before installing, to see how a change is proven — measured, checked each round, measured again — and that nothing lands on their files until they say so.
- So the page runs along that loop, with the checks in their own section ahead of Install.
- Left out, which another reading would keep: rethink as writing from nothing, the rules library and the no-slop aim as selling points, the standards experiment.

## Sections, in order

**1. `# terse` + opening, no heading** — 55 words — two plain sentences
- Purpose: what terse is for (assessing and improving any text in rounds of edits by several AI agents, from rules and best practices, without AI slop), and this reader's reason: each round checked before they see it, their files changed only when they say so.
- Excludes: a question first; "README" or "documentation" as the scope; skill names, counts, paths, numbers; warnings.
- Rests on: A01, A06; owner:45, 101; purpose.md:24–25.

**2. `## Skills`** — 95 words — "you start each one yourself"; table Command · When to run it · What you get back; the scope fact once: Markdown files read from where readers start, one document per rewrite
- Purpose: choose by situation and see what comes back — audit's report (score by its unit; each failure's cause and line), rethink's skeleton, rewrite's draft with its diff and a reason per cut of twenty words or more.
- Excludes: writers, judges, reviewers; locations; the checks (row 3).
- Rests on: A02, C; owner:142; terms heading table; score, skeleton, diff defined at first use (terms 15, 38, 50).

**3. `## Before a change reaches your files`** — 140 words — numbered list in running order; rethink as one clause
- Purpose: show how a change is proven before it lands — the score and the questions already answered right as the line to hold; a round redone if it drops a sentence checked true or revives one found false; AI reviewers, each checking one thing, and no round handed over with a make-it-worse finding; the reader's read of the diff ends the rounds; runs kept outside the repository, the document changed or a bug filed only when they say so; the same questions again.
- Excludes: ledger, check and script names; "every round kept", "until nothing got worse", "every claim sourced" (audit C12–C14); a no-regression promise or a caveat for one (Q5); any step unverified against the shipped pages (Q2).
- Rests on: new — «делает его лучше итеративно» needs the loop and what holds each round, and synthesis F finds no analogue; owner:165; audit Q2, Q5; A17, A19 moved ahead of Install; replaces A20's route list.

**4. `## Install`** — 30 words — `bash` fence, the two `claude plugin` commands, one clause
- Purpose: one copyable path, plus Node 22 or newer, kept against owner:107 because the installed skills fail without it (audit C20–C21).
- Excludes: the `/plugin` form; commits, install history (purpose.md:26); PATH, checkout (owner:107).
- Rests on: A05, A08, C; owner:105, 130–136.

**5. `## Update`** — 15 words — `bash` fence
- Purpose: Install's twin.
- Excludes: versions, changelog.
- Rests on: owner:106; synthesis E5.

**6. `## Quick start`** — 80 words — `text` fence for Claude Code; one sentence; a real report excerpt, 25–40 words
- Purpose: make the first run the first measurement (`/terse:audit`): what happens before its agents start (count, model, what they spend; it waits until you say so), then a score line and one failure with its cause and line.
- Excludes: a rewrite command; invented or success-only output; a price (A18); "every agent announced" (audit C17).
- Rests on: A03, A09, A17, A18, C; audit Q3.

**7. `## What it will and will not do to your text`** — 70 words — three list items
- Purpose: answer "will it cut my document down?" (not a shortener; length never picks a draft; the one measured change, sized) and name what the rules forbid a round to cut or weaken.
- Excludes: rules as guarantees (audit C27–C29); predictions about long text (C25–C26).
- Rests on: A12; audit Q6.

**8. `## What was measured`** — 85 words — three list items, one link
- Purpose: evidence at its size, each number traced to its record: the make-it-worse findings reviewers caught per recorded round; the 2026-09-10 trial as far as its record holds (could be chance, p = 0.25; never run without the text); whether a person reads better, never measured.
- Excludes: the standards experiment (audit C39–C41); unrecorded per-reader counts (C31–C37); "McNemar", "pilot", "control", "chain".
- Rests on: A04; synthesis E1, F; owner:86, 165; audit.md:54.

**9. `## How it works`** — 80 words — list, one linked line each
- Purpose: after the decision, what sits under the checks: AI readers and the answer key written before they run; a first round's three drafts and two judges; the rules and best practices, and rethink reading documents like yours; where run folders live and when they are deleted.
- Excludes: script names, exit codes, `$TMPDIR` (owner:46); rule configuration (terms 61).
- Rests on: owner:104; A04, A16, A19; synthesis E2; purpose.md:7.

**Total: 650 words** (current 933), fences and table cells counted, headings not. Not on the page: Licence (A25), table of contents (A24), badges (A15), Contributing (synthesis B).
