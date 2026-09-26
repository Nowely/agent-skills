# Structure 02 — what do I type first, and what comes back

## Purpose statement, verbatim (purpose.md:5–8, then :12–16)

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

## Reading

First need: the exact command for the document already in front of them, and what comes back before they
type it — not why the plugin exists or how trustworthy it is yet. Structure follows situation → command →
return, three times, mechanism (writers, judges, critics, evidence levels) held to one linked section at
the end. Left out: the trust case — pilot numbers, linter/agent comparisons, how rules get found — a
trust-first reading would open with; the file-write boundary sits at the command that causes it, not as a
standing policy before Install.

## Sections

**1. Opening — no heading.** 70w. Purpose: state the mission in the fewest words, then fork the reader
onto the one command matching their situation, before install or mechanism. Excludes: alternatives,
genre/evidence talk, install commands, mechanism terms (writer, judge, critic, lens, ledger). Device: a
plain paragraph (2–4 sentences) ending in a two-line fork — a document you doubt → `/terse:audit`; none,
or the shape is wrong → `/terse:rethink`; no question opener. Rests on: A01, A06 (TAKE WITH CHANGE); owner
O1 (owner-readme-words.md:45), O3 (:101); purpose.md:18–22, 24–25 (rejected round's opening question).

**2. Install.** 45w. Purpose: the exact commands to type, in the owner's specified form, nothing else in
the way. Excludes: what happens after installing; the "nothing else is needed" reassurance, kept out of
the opening. Device: one `bash`-fenced block, the two commands, plus one line for the Node/checkout-only
prerequisite. Rests on: A05 (owner-readme-words.md:130,136), A08; A13 (reassurance excluded from the
opening → here instead).

**3. Update.** 15w. Purpose: the one command that updates an install already running. Excludes:
version/commit provenance, changelog pointers. Device: one line, a single command. Rests on: synthesis E5
(gap); owner-readme-words.md:106; terms.md's `## Install`/`## Update` heading pair.

**4. Skills.** 145w. Purpose: for each command, when this reader would type it and exactly what lands
afterward — including whether it touches their files and what still waits for their word. Excludes:
writer/judge/critic/lens counts, how the answer key or claim ledger is built, evidence levels, retention
detail beyond "inside your repository." Device: a three-row table, Command · When to run it · What comes
back, with one line beneath for the agent-count-and-model announcement. Rests on: A02 (owner O5,
owner-readme-words.md:142); A17; A19 (corrects refuted current:35–36, C15/C16; answers Q2); A18
(beneath-table line).

**5. One real result — no heading.** 35w. Purpose: make "what comes back" concrete with one authentic
line. Excludes: a full transcript, an invented "before," a success score. Device: a short quoted excerpt
of one real returned line — question, cause, file:line — under the table, no heading. Rests on: A09 (real
excerpt over invented transform); A10 (DO NOT TAKE — no image here either).

**6. Workflow.** 45w. Purpose: the two entry routes, once, and where each rejoins the other, without
retelling the table. Excludes: a boxed/ASCII/Mermaid diagram; a second prose description; per-skill
internals. Device: a short two-line arrow list, one line per entry route, each ending at "audit again."
Rests on: A20 (two-route list, not a diagram, not narrated twice; purpose.md:25–26).

**7. What it will and will not do to your text.** 65w. Purpose: answer the length fear the name invites;
name the one boundary that never moves. Excludes: the measurement numbers (linked from §8), unchecked
predictions, the file-write boundary (in §4). Device: plain paragraph — what it does (truer, easier to
answer), what it will not touch (a condition, limit, or warning at a decision point; a dated number).
Rests on: A12 (ALREADY PRESENT); Q6 (control question, already answered correctly).

**8. How it works.** 45w. Purpose: name what the judgments rest on, close the one open question — does a
second pass undo the first — and link the full measurement rather than reproducing it. Excludes: the
McNemar figure, the 2×5 bake-off design, every dated number — named only by link. Device: one short
paragraph plus a linked reference. Rests on: A16, A04. Regression-guard clause is **new** — closes audit
Q5 (current text answers it wrong, refuted); no surveyed device covers it, so one clause, not a section.

## Total

70 + 45 + 15 + 145 + 35 + 45 + 65 + 45 = **465 words**.
