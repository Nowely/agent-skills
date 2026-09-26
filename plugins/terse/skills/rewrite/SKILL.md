---
name: rewrite
description: >-
  Writes or rewrites a text pleasant to read and true of the code: a writer works from the code and the
  rules, every critic reads the draft at once — truth, a rationalizer, form, terms, sentences, the rules,
  fresh readers — the writer repairs once, and a check reads the repair. Touches your files only on your word.
disable-model-invocation: true
metadata:
  version: "0.1.1"
license: MIT
---

One writer, then every critic at once, then the writer once more and a check of what it changed, then
your read. Each critic holds one concern, so none waits for another. Every role works from
[rules.md](../../references/rules.md) — two requirements, a pleasant read and truth within the text's world,
and advice taken where it helps; the briefs are in [roles.md](../../references/roles.md).

## Step 1. One message to the user

Ask once, in one message, and announce the run in the same message:

- the directory of an `audit` run of this text, if there is one: its reader profile and shape verdict
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

## Step 3. The draft

Where the kind of text has no notes in [genres/](../../references/genres/), the genre scout, brief 2,
runs first; its table is kept there for the next text of the kind, on the user's word. Then the writer,
brief 1 of `roles.md`. It works out the text's world before its form and writes `context.md`: what the
thing is and what it resembles, who reads the text and in what situation, what they need first, what would
make them want it, the one thought it carries. Then it reads the genre's notes and the best texts of the
kind, and writes its plan's word budgets to `budgets.json` and then `01-draft.md` — from the context, the
purpose, the existing text if any, the plan the user agreed in `rethink` if they give its path, and the
audit's run file if they gave its directory. It returns the context, the plan and its evidence; save them
as `writer-notes.md`. In full mode the harness, brief 12, runs beside it.

## Step 4. Every critic at once

Launch them in one message, on the draft:

- truth, brief 3, one agent per group of sections — a few hundred words each, so each finishes fast;
- the rationalizer, brief 4: does this reader need it, here;
- form, brief 5; terms, brief 6; the rules one by one, brief 7; sentences, brief 10;
- three to five question readers, brief 8; in full mode, one task reader, brief 9.

In full mode each truth critic's brief carries the line brief 3 gives for it. Each returns its report;
save it into `critics/` of the run directory. No agent merges them: the writer reads them all.

## Step 5. One repair, and a check of it

The writer again, sent every report: it applies each finding or declines it with the reason in a line,
re-checks every sentence it changed against the code, reads the whole text once for a count or a name
that disagrees with itself, and writes `02-repaired.md` with that list. Then, in one message: truth,
brief 3, on the sentences the repair changed; the question readers again; the two cold readers, brief 11.
Run the scripts on it too, from this skill's `scripts/`, the directory beside this file:

- `node "${CLAUDE_SKILL_DIR}/scripts/rule1.mjs" 02-repaired.md --cut "<the technical section>"` — no
  mechanism before it;
- `node "${CLAUDE_SKILL_DIR}/scripts/sections.mjs" 02-repaired.md budgets.json` — words per section
  against the plan, a report.

A refuted sentence, a contradiction or a question now answered wrong goes back to the writer for those
lines only, and the text takes the next number.

## Step 6. The hand-over

Give the user the latest numbered text, the plan, the list of findings applied and declined, and the
check's reports, all in the run directory, and for a text that existed, the diff against it. Nothing is
final until the user says so: if they would not send it as it is, their words go to the writer for the
next numbered text, and new critics run only if they ask. Applying the text to their files needs their
word.

## What you return

In the run directory: `purpose.md`; `context.md`; `01-draft.md`, `budgets.json` and `writer-notes.md` with the plan;
`critics/`, every report verbatim, the check's among them; each numbered text after the draft, with the
applied-and-declined list; the scripts' output; `diff.patch` for a text that existed.

## Why this shape

On 2026-09-24 the same README was written by a sequential path — a survey, a synthesis, a terms stage,
ten structures under three critics, a skeleton, a bake-off, a verified round, a wave and its dedup —
in 6 h 38 min. On the owner's read it sat at parity with the repository's own README and above a bare
agent's; what changed the text for the better was the truth checked by running the code and the rules
where they were applied, and here each of those concerns is one role run at the same time as the
others. Its first run, on 2026-09-25, took 70 minutes, and what it missed — a contradiction the repair
brought in, sentences no role read, a writer re-running what the truth critics ran — is what step 5's check,
brief 10 and the reading writer are for. Its second run took 1 h 33 min, and truth critics that each rebuilt
the same harness held the critical path twice, 24 and 20 minutes: hence light by default, and one shared copy
when the user asks for full. On 2026-09-26, on the README of a disk-usage tool, a bare agent's text beat
this path's: the writer had not been asked what the tool was to its reader, and rules applied as requirements
cut the demo, the one-line pitch and the install routes the owner valued most — hence the context first,
the scout before the writer, and rules that are advice. The measurements behind the rules:
[measurements.md](../../references/measurements.md); the runs: `research/2026-09-24-terse-benchmark-maestro/`
and `research/2026-09-26-terse-light-trial/`.
To measure a text before or after, `/terse:audit`.
