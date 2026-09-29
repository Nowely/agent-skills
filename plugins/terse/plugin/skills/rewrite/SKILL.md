---
name: rewrite
description: >-
  Writes or rewrites a text pleasant to read and true within its world: a writer first works out what the
  text is and who reads it, every critic reads the draft at once — truth, a rationalizer, form, terms,
  sentences, fresh readers — the writer repairs once, and a check reads the repair. Touches your files only
  on your word.
disable-model-invocation: true
metadata:
  version: "0.5.0"
license: MIT
---

One writer, then every critic at once, then the writer once more and a check of what it changed, then
your read. Each critic holds one concern, so none waits for another. Every role works from
[rules.md](../../references/rules.md) — two requirements, a pleasant read and truth within the text's world,
and advice taken where it helps; the briefs are in [roles.md](../../references/roles.md). The writer and the
sentences critic get [writing-rules.md](../../references/writing-rules.md) and
[curse-of-knowledge.md](../../references/curse-of-knowledge.md) as the briefs' `<SENTENCES>`, and every truth
critic gets [truth.md](../../references/truth.md) as `<TRUTH>`.

## Step 1. One message to the user

Ask once, in one message, and announce the run in the same message:

- the path of an `audit` report on this text, if there is one: its reader profile and shape verdict
  answer what they cover below, and only the rest is asked;
- what the text is for and who reads it, in their words;
- anything the text must say or must not say;
- for an existing text, whether its shape stands or should follow the genre.

The announcement names the mode, [light or full](../../references/roles.md#light-and-full), and that mode's
agents with their models from `roles.md`: the writer, the genre scout when the genre has no notes, and the critics.
Wait for the word. Keep the answer verbatim in `purpose.md` of the run directory. A behaviour the user
asks the text to state is a claim like any other: one the text's world does not hold goes back to them as a
question.

## Step 2. The run directory

Outside the repository that holds the text, `<slug>` naming the text; where it lives, how long, and what
its path is for: [run.md](../../references/run.md).

```bash
D="${CLAUDE_PLUGIN_DATA}"; RUN="${D:-${TMPDIR:-/tmp}/terse}/runs/$(date +%Y%m%d-%H%M%S)-<slug>" && mkdir -p "$RUN" && echo "$RUN"
```

Nothing goes into the repository without the user's word.

## Step 2b. The questions, and the text before

The question readers, brief 8, need questions and a key before any draft exists. Given an audit's report,
take its questions and answer key as they are. Otherwise write three to five from `purpose.md`: one per
decision the reader must make, in the reader's words, each with its answer from what the text describes and
whether the existing text gives it; where a text exists, at least one it already answers right, as a
control. Save them to `questions.md` before the writer starts.

For a text that exists, send the question readers on it now, one per question: their score is the before.
An audit's own score sits beside it and is not the before, because the audit's readers walk the repository
and these read one file. Score the answers as the audit's [scoring](../audit/references/measure.md#scoring)
does, GUESSED standing for cannot tell; once the text gives the key's true answer, a reader who quotes it
is right.

## Step 3. The draft

For a README, start with the [plugin library](../../references/genres/readme-tools.md) or
[terminal tool](../../references/genres/readme-terminal-tools.md) note when it fits.
Where the kind of text has no notes in [genres/](../../references/genres/), the genre scout, brief 2,
runs first; its table is kept there for the next text of the kind, on the user's word. Then the writer,
brief 1 of `roles.md`. It works out the text's world before its form and writes `context.md`: what the
thing is and what it resembles, who reads the text and in what situation, what they need first, what would
make them want it and choose it over what it resembles, the one thought it carries. Then it reads the
genre's notes and the best texts of the kind, and writes `01-draft.md` — from the context, the purpose, the existing text if any, the plan the user agreed in
`rethink` if they give its path, and the audit's report if they gave its path. It returns the
context, the plan and its evidence; save them as `writer-notes.md`. In full mode the harness, brief 12,
runs beside it.

## Step 4. Every critic at once

Launch them in one message, on the draft:

- truth, brief 3, one agent per group of sections — a few hundred words each, so each finishes fast;
- the rationalizer, brief 4: does this reader need it here, or does it make them want the thing;
- form, brief 5; terms, brief 6; sentences, brief 10;
- the question readers, brief 8, one per question in `questions.md`; in full mode, one task reader, brief 9.

In full mode each truth critic's brief carries the line brief 3 gives for it. Each returns its report;
save it into `critics/` of the run directory. No agent merges them: the writer reads them all.

## Step 5. One repair, and a check of it

The writer again, on the repair brief of `roles.md`, sent every report: it takes a finding where the text
becomes truer for its reader or easier to read, declines one that adds words the reader does not need
there with a reason from the context, and writes `02-repaired.md` with that list. Then, in one message:
truth, brief 3, on the sentences the repair changed; the question readers again; the two cold readers,
brief 11. Run the script on it too, with Node 22 or newer, from this skill's `scripts/`, the directory beside
this file — words per section of the draft and the repair side by side, a report: a section that grew, or one
only one of them has, is where the repair added or lost text:

```bash
node "${CLAUDE_SKILL_DIR}/scripts/sections.mjs" 01-draft.md 02-repaired.md
```

A sentence truth finds wrong for the reader, a contradiction, a question now answered wrong or a line a
cold reader could not follow goes back to the writer for those lines only, on the fix brief, and the text
takes the next number; what a reader wished added goes to the user with the text.

## Step 6. The hand-over

Give the user the latest numbered text, the plan, the list of findings applied and declined, the check's
reports, and the question readers' score on the repaired text, question by question, all in the run
directory; for a text that existed, also the diff against it and the score before beside the one after. A control that passed before and
fails now, or a lower score, comes first. Nothing is
final until the user says so: if they would not send it as it is, their words go to the writer for the
next numbered text, and new critics run only if they ask. Applying the text to their files needs their
word. Account for each point they raise, briefly where a sentence can cover several; for a complex
iteration use the [owner-feedback brief](../../references/roles.md#13-owner-feedback). Hand the result
over as a [relayed result](../../references/genres/relayed-result.md).

## What you return

In the run directory: `purpose.md`; `context.md`; `questions.md`; `01-draft.md` and `writer-notes.md` with the plan;
`critics/`, every report verbatim, the check's among them; each numbered text after the draft, with the
applied-and-declined list; the scripts' output; `diff.patch` for a text that existed.

## Why this shape

The writer starts from context because a rule-led draft once lost the demo and routes its reader needed;
the repair check catches what the repair itself breaks. The dated runs and limits are
[M26–M30](../../references/measurements.md#m26).
The before and after here read one file; for the documentation as its readers walk it, `/terse:audit`
measures anew, with questions of its own.
