---
name: rethink
description: >-
  Decides what a text should say, in what order and in what form, before it is written: the genre's
  order, a plan on one screen, and the form and rationalizer critics on that plan. Returns the plan and
  stops; `rewrite` writes from it. Use when you want to agree the shape first.
disable-model-invocation: true
metadata:
  version: "0.6.0"
license: MIT
---

The shape first, when the user wants to see it before any prose. The same roles `rewrite` runs, stopped
at the plan: [roles.md](../../references/roles.md), working from
[rules.md](../../references/rules.md), a pleasant read first. The writer gets the sentence layer,
[writing-rules.md](../../references/writing-rules.md) and [curse-of-knowledge.md](../../references/curse-of-knowledge.md),
as its brief's `<SENTENCES>`; how a claim is checked against its world is in [truth.md](../../references/truth.md).

1. **One message to the user**, as `rewrite` step 1: what the text is for and who reads it, what it must
   and must not say. It names no mode: no role here runs code. Announce the agents below and wait for the
   word. Keep the answer in `purpose.md` of the run directory, created by
   [run.md](../../references/run.md) with a slug ending in `-rethink`.
2. **The best texts of its kind.** From [genres/](../../references/genres/) where the kind has notes;
   otherwise the genre scout, brief 2, first, and its table is kept there on the user's word.
3. **The context, then the plan.** The writer, brief 1, stopped before the text: `context.md` first —
   what the thing is, who reads it, what they need first, what would make them want it and choose it over
   what it resembles, the one thought — then each part, what it gives this reader, the device that carries
   it — the plan's share of a pleasant read — and a word budget, in `01-plan.md`. One screen.
4. **Two independent critics on the frozen plan**: form, brief 5, and the rationalizer, brief 4, each asking of every
   part whether this reader needs it here or would want it. Batch them to the host's capacity as `roles.md` says.
5. **The hand-over.** Continue the same writer with both reports, still stopped before prose, to write
   `02-plan.md` and the list of findings applied or declined with reasons. Return that plan and what is asked of the
   user: their word on it, or the sections that are wrong. Then stop. `rewrite` starts from the plan they
   agreed, given its path. Use the [relayed-result note](../../references/genres/relayed-result.md), and
   account for later objections through the [owner-feedback brief](../../references/roles.md#13-owner-feedback).

Agreeing the shape first reduces the risk of polishing a draft that solves the wrong problem; the dated record is
[M26](../../references/measurements.md#m26) and [M29](../../references/measurements.md#m29).
