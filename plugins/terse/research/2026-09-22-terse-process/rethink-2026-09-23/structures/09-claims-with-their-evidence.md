# 09 — Claims with their evidence

The owner's purpose statement, verbatim from `purpose.md`:

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

- **First need:** to tell what `terse` has been shown to do from what it is for, each claim with its check one glance away.
- **Therefore:** the mission stands as an aim with no number beside it; each claim of effect sits in a table beside its check, date and size; a claim that would need a caveat is narrowed instead.
- **Left out, where another reading keeps it:** a headline number up top, the abandoned-draft anecdote, the writing-standards experiment, "clearer" or "slop-free" as results, file facts not made to happen on the installed version.

Titles and words per `terms.md`; budgets include commands and table cells.

**1. Opening** (`# terse`, no heading) · 60 words · plain paragraph, three sentences
- Purpose: the mission as an aim (any text, improved in rounds by many AI agents with the rules and best practices found for each text) and the reason to want it: it checks what readers get from the text, not how the text sounds.
- Excludes: any number (its size would be a warning); a question; "README" or "documentation" as the scope; skill names; results beyond the aim; a claim the table or excerpt below does not show; sentences about the page's own honesty.
- Rests on: A01, A06, A13, A15; B (universal improvement); owner:45, :58, :101; purpose:5–8, :24–25.

**2. Skills** · 115 words · table (Command · When to run it · What you get back), one scope clause (Markdown files), a two-route list without heading, each step started by the reader and each route ending in audit again with the same questions
- Purpose: which skill to run first and what each returns that the reader can check: the report (cause and line per failure; the score by its unit), the skeleton as the document's outline, the draft with its diff and a reason for each cut of twenty words or more.
- Excludes: agent counts, internals, a name-only list, a diagram, routes told in prose.
- Rests on: A02, A20, A22; C (skills, pipeline); owner:142; purpose:25–27; audit Q3, Q4.

**3. Install** · 20 words · one `bash` fence
- Purpose: the two `claude plugin` commands, as run on a clean configuration.
- Excludes: the `/plugin` form; prerequisites (owner:107) unless a clean install was made to fail without one; "nothing else is needed", refuted (audit Q1).
- Rests on: A05, A07, A08, A11; C (install); owner:130, :136; purpose:26.

**4. Update** · 10 words · one `bash` fence
- Purpose: the update command, as run.
- Excludes: version history, commit hashes, the rejected round's installed-versus-described paragraph.
- Rests on: owner:106; E5.

**5. Quick start** · 105 words · one sentence, a `text` fence with `/terse:audit`, one report excerpt, one line
- Purpose: what happens before the first run (how many agents on which model, then it waits until you say so; what it writes), a real excerpt of what comes back, and the next step (rewrite from the report; rethink when there is no document yet).
- Excerpt: the 2026-09-22 audit of this page's previous version finding its promise about your files false, labelled with its date and what ran it.
- Excludes: paths, retention, the other two invocations, a tidied or invented excerpt, a cost figure no run measured, any consequence not made to happen on the installed version.
- Rests on: A03, A09, A17–A19; C (result, `text` fence); D2; owner:105; audit Q3; new: the excerpt's source, which A09 leaves open, because a false claim caught with its line is the profile's first trust point (audit.md:54).

**6. What it will and will not do to your text and your files** · 140 words · table (the claim · how it was checked, dated · what that check does not cover), about five rows
- Purpose: the reader's three fears as claims beside their checks: cut down (Q6), a second round undoing the first (Q5), their files touched (Q2, Q4).
- Excludes: a third cell longer than a clause (narrow the claim: audit.md:58, no caveats); a rule passed off as measured; paths, uninstall, retention; a file fact not made to happen on the installed version, where Q2, the profile's own control, failed.
- Rests on: A12, A17, A19; B (blanket disclaimer); D5; audit Q2, Q4–Q6; new: the check column, since no synthesis row shows a README pairing claim and check (A16, F), while this page's own audit prints its limits beside its score (audit.md:995).

**7. What was measured** · 150 words · the same table, two rows; one line; one link
- Purpose: how far "better" has been measured (four rewriting passes on one README, 2026-09-10; the audit of this page's previous version, 2026-09-22; each with date, size and what ran it), then one line on what no run has measured: people as readers, other languages, text that is not Markdown, AI slop, a run's cost.
- Excludes: the writing-standards experiment and the anecdote (they argue for design choices, they do not measure the plugin); "pilot", "arm", "control", McNemar; a number without date and size; "prior art" as link text.
- Rests on: A04; B (chart-only benchmarks); E1, E3, E6; F; owner:86; purpose:8; audit Q7; audit.md:54, :993.

**8. How it works** · 100 words · four-item list, each item ending in a link to the page that specifies it
- Purpose: the method, for the reader who has decided: AI readers answering with and without the text against answers written first; claims checked against the code or a named source; fixed writing rules plus the practices of documents like yours, read first; rounds of edits by writers, judges and reviewers.
- Excludes: script and file names, ledger, bake-off, lens, verifier, evidence levels, a rule catalogue, configuration (there is none).
- Rests on: owner:104; A04, A16, A23; B (full inline reference); E2; purpose:6–7.

**Total: 700 words of body, 725 with the title and headings.** No licence (A25), table of contents (A24), badges or images (A10, A15).
