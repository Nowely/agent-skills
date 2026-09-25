---
name: rethink
description: >-
  Decides what a text should say and in what order before it is written: the genre's order, a plan on
  one screen, and the form and rationalizer critics on that plan. Returns the plan and stops; `rewrite`
  writes from it. Use when you want to agree the shape first.
disable-model-invocation: true
metadata:
  version: "0.1.1"
license: MIT
---

The shape first, when the user wants to see it before any prose. The same roles `rewrite` runs, stopped
at the plan: [roles.md](../../references/roles.md), working from
[rules.md](../../references/rules.md).

1. **One message to the user**, as `rewrite` step 1: what the text is for and who reads it, what it must
   and must not say, any rule set aside. Announce the agents below and wait for the word. Keep the answer
   in `purpose.md` of the run directory, `<slug>` naming the text and ending in `-rethink`
   ([run.md](../../references/run.md)):

   ```bash
   D="${CLAUDE_PLUGIN_DATA}"; RUN="${D:-${TMPDIR:-/tmp}/terse}/runs/$(date +%Y%m%d-%H%M%S)-<slug>" && mkdir -p "$RUN" && echo "$RUN"
   ```
2. **The genre's order.** From [genres/](../../references/genres/) where the kind has notes; otherwise
   the genre scout, brief 2, and its table is kept there on the user's word.
3. **The plan.** The writer, brief 1, stopped before the text: each section, what it gives the reader,
   the device that carries it, a word budget; where it departs from the genre's order, why. One screen.
4. **Two critics at once on the plan**: form, brief 5, and the rationalizer, brief 4, each asking of every
   section whether this reader needs it here.
5. **The hand-over.** The plan with the critics' findings applied or declined, and what is asked of the
   user: their word on it, or the sections that are wrong. Then stop. `rewrite` starts from the plan they
   agreed, given its path.

Measured on 2026-09-11 and again on 2026-09-23: drafts written against a shape nobody had agreed were
rejected for what they said and in what order, not for their phrasing. On 2026-09-24 the sequential
method this page used to hold — a survey, a synthesis, ten structures under three critics, a skeleton of
13,000 words — took three hours before a sentence was written; the record of it is in
[stages.md](references/stages.md).
