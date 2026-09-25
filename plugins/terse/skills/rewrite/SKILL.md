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
[rules.md](../../references/rules.md), a pleasant read first; the briefs are in [roles.md](references/roles.md).

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

The writer, brief 1 of `roles.md`: from the code, the rules, the purpose, the genre's notes, the
existing text if any, and the plan the user agreed in `rethink` if they give its path. It writes its
plan's word budgets to `budgets.json` before the text, then `01-draft.md`, and returns the plan with its
evidence; save that as `writer-notes.md`. It reads the code rather than running it: the truth critics run
it. Where the genre has no notes in [genres/](../../references/genres/), the genre scout, brief 2, runs
beside it; its table is kept there for the next text of the kind, on the user's word.

## Step 4. Every critic at once

Launch them in one message, on the draft:

- truth, brief 3, one agent per group of sections — a few hundred words each, so each finishes fast;
- the rationalizer, brief 4: does this reader need it, here;
- form, brief 5; terms, brief 6; the rules one by one, brief 7; sentences, brief 10;
- three to five question readers, brief 8, and one task reader, brief 9.

Each returns its report; save it into `critics/` of the run directory. No agent merges them: the writer
reads them all.

## Step 5. One repair, and a check of it

The writer again, sent every report: it applies each finding or declines it with the reason in a line,
re-checks every sentence it changed against the code, reads the whole text once for a count or a name
that disagrees with itself, and writes `02-repaired.md` with that list. Then, in one message: truth,
brief 3, on the sentences the repair changed; the question readers again; the two cold readers, brief 11.
Run the scripts on it too, `S` being this skill's `scripts/` — installed,
`$CLAUDE_PLUGIN_ROOT/skills/rewrite/scripts`; from a checkout, the directory beside this file:

- `node "$S/rule1.mjs" 02-repaired.md --cut "<the technical section>"` — no mechanism before it;
- `node "$S/sections.mjs" 02-repaired.md budgets.json` — words per section against the plan, a report.

A refuted sentence, a contradiction or a question now answered wrong goes back to the writer for those
lines only, and the text takes the next number.

## Step 6. The hand-over

Give the user the latest numbered text, the plan, the list of findings applied and declined, and the
check's reports, all in the run directory, and for a text that existed, the diff against it. Nothing is
final until the user says so: if they would not send it as it is, their words go to the writer for the
next numbered text, and new critics run only if they ask. Applying the text to their files needs their
word.

## What you return

In the run directory: `purpose.md`; `01-draft.md`, `budgets.json` and `writer-notes.md` with the plan;
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
brief 10 and the reading writer are for. The measurements behind the rules:
[measurements.md](references/measurements.md); the runs: `research/2026-09-24-terse-benchmark-maestro/`.
To measure a text before or after, `/terse:audit`.
