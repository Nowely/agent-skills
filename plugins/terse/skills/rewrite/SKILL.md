---
name: rewrite
description: >-
  Writes or rewrites a text in one pass: a writer works from the code and the rules, every critic reads
  the draft at the same time — truth by running the code, a rationalizer, form, terms, the rules, fresh
  readers — and the writer repairs once. Proposes; writes into your tree only on your word.
disable-model-invocation: true
metadata:
  version: "0.1.1"
license: MIT
---

One writer, then every critic at once, then the writer once more, then your read. Each critic holds one
concern, so none waits for another. Every role works from [rules.md](../../references/rules.md); the
briefs are in [roles.md](references/roles.md).

## Step 1. One message to the user

Ask once, in one message, and announce the run in the same message:

- what the text is for and who reads it, in their words;
- anything the text must say or must not say;
- any rule of `rules.md` they set aside for this text;
- for an existing text, whether its shape stands or should follow the genre.

The announcement names the agents and their models from the table in `roles.md`: the writer, the genre
scout when the genre has no notes, and the critics with how many truth critics the length calls for.
Wait for the word. Keep the answer verbatim in `purpose.md` of the run directory. A behaviour the user
asks the text to state is a claim like any other (rule 23).

## Step 2. The run directory

Outside the repository that holds the text, by the formula of
[`audit`'s step 1](../audit/SKILL.md#step-1-scope-and-the-run-directory), `<slug>` naming the text:

```bash
D="${CLAUDE_PLUGIN_DATA}"; RUN="${D:-${TMPDIR:-/tmp}/terse}/runs/$(date +%Y%m%d-%H%M%S)-<slug>" && mkdir -p "$RUN" && echo "$RUN"
```

Name its absolute path in the hand-over. Under the plugin's data directory a run survives plugin
updates and is deleted by `claude plugin uninstall` unless `--keep-data` is passed; in the temporary
directory the operating system may purge it. A run that must outlive either is the user's to copy.
Nothing goes into the repository without the user's word.

## Step 3. The draft

The writer, brief 1 of `roles.md`: from the code, the rules, the purpose, the genre's notes and the
existing text, if any. It puts a plan on one screen in its report — each section, what it gives the
reader, the device, a word budget — and writes the text. Where the genre has no notes in
[genres/](../../references/genres/), the genre scout, brief 2, runs beside it; its table is kept there
for the next text of the kind, on the user's word.

## Step 4. Every critic at once

Launch them in one message, on the draft:

- truth, brief 3, one agent per group of sections — a few hundred words each, so each finishes fast;
- the rationalizer, brief 4: does this reader need it, here;
- form, brief 5; terms, brief 6; the rules one by one, brief 7;
- three to five question readers, brief 8, and one task reader, brief 9.

Each writes its report into `critics/` of the run directory. No agent merges them: the writer reads them
all.

## Step 5. One repair

The writer again, sent every report: it applies each finding or declines it with the reason in a line,
re-checks every sentence it changed against the code, and returns the final text and that list. Then
run the scripts on the final, `S` being this skill's `scripts/` — installed,
`$CLAUDE_PLUGIN_ROOT/skills/rewrite/scripts`; from a checkout, the directory beside this file:

- `node "$S/rule1.mjs" final.md --cut "<the technical section>"` — no mechanism before it;
- `node "$S/sections.mjs" final.md budgets.json` — words per section against the plan, a report.

A refuted sentence still in the final goes back to the writer before the hand-over.

## Step 6. The hand-over

Give the user the final text, the plan, the list of findings applied and declined, and the diff against
the existing text, all in the run directory. The user reads. If they would not send it as it is, their
words go to the writer for one more repair; new critics run only if they ask. Applying the text to
their files needs their word.

## What you return

In the run directory: `purpose.md`; the draft and the writer's report with its plan; `critics/`, every
report verbatim; the final text with the applied-and-declined list; the scripts' output; `diff.patch`.

## Why this shape

On 2026-09-24 the same README was written by a sequential path — a survey, a synthesis, a terms stage,
ten structures under three critics, a skeleton, a bake-off, a verified round, a wave and its dedup —
in 6 h 38 min. On the owner's read it sat at parity with the repository's own README and above a bare
agent's; what changed the text for the better was the truth checked by running the code and the rules
where they were applied, and here each of those concerns is one role run at the same time as the
others. The measurements behind the rules: [measurements.md](references/measurements.md); the run:
`research/2026-09-24-terse-benchmark-maestro/`. To measure a text before or after, `/terse:audit`.
