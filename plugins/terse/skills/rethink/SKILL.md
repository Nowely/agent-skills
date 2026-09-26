---
name: rethink
description: >-
  Decides what a text should say, in what order and in what form, before it is written: the genre's
  order, a plan on one screen, and the form and rationalizer critics on that plan. Returns the plan and
  stops; `rewrite` writes from it. Use when you want to agree the shape first.
disable-model-invocation: true
metadata:
  version: "0.2.0"
license: MIT
---

The shape first, when the user wants to see it before any prose. The same roles `rewrite` runs, stopped
at the plan: [roles.md](../../references/roles.md), working from
[rules.md](../../references/rules.md), a pleasant read first.

1. **One message to the user**, as `rewrite` step 1: what the text is for and who reads it, what it must
   and must not say. It names no mode: no role here runs code. Announce the agents below and wait for the
   word. Keep the answer in `purpose.md` of the run directory, `<slug>` naming the text and ending in
   `-rethink` ([run.md](../../references/run.md)):

   ```bash
   D="${CLAUDE_PLUGIN_DATA}"; RUN="${D:-${TMPDIR:-/tmp}/terse}/runs/$(date +%Y%m%d-%H%M%S)-<slug>" && mkdir -p "$RUN" && echo "$RUN"
   ```
2. **The best texts of its kind.** From [genres/](../../references/genres/) where the kind has notes;
   otherwise the genre scout, brief 2, first, and its table is kept there on the user's word.
3. **The context, then the plan.** The writer, brief 1, stopped before the text: `context.md` first —
   what the thing is, who reads it, what they need first, what would make them want it and choose it over
   what it resembles, the one thought — then each part, what it gives this reader, the device that carries
   it — the plan's share of a pleasant read — and a word budget. One screen.
4. **Two critics at once on the plan**: form, brief 5, and the rationalizer, brief 4, each asking of every
   part whether this reader needs it here or would want it.
5. **The hand-over.** The plan with the critics' findings applied or declined, and what is asked of the
   user: their word on it, or the sections that are wrong. Then stop. `rewrite` starts from the plan they
   agreed, given its path.

Measured on 2026-09-11 and again on 2026-09-23: drafts written against a shape nobody had agreed were
rejected for what they said and in what order, not for their phrasing. On 2026-09-24 the sequential
method this page used to hold — a survey, a synthesis, ten structures under three critics, a skeleton of
13,000 words — took three hours before a sentence was written; the record of it is in
`research/2026-09-24-terse-benchmark-maestro/`.
