---
name: audit
description: >-
  Measures a document: what makes it hard to read, first; then whether fresh readers get the right answer,
  and whether every claim about behaviour is true of the code — read by default, also run when you ask.
  Returns what reads badly, a reader profile, a claim ledger, reader scores, what broke, and whether the
  user agreed the shape. It never proposes wording; `rewrite` does that.
disable-model-invocation: true
metadata:
  version: "0.6.0"
license: MIT
---

An audit here is a measurement, not an opinion. You run eight steps in order, and the order carries the
method: the profile decides which questions are worth asking, the code decides what the right answers
are, and both exist before the first reader is spawned. A reader sent out before the answer key is
written measures the text against your memory of it, and your memory has already read the code.

Say what you found. Do not say what to write instead — the moment this skill starts proposing
sentences, it becomes the thing that was measured and lost: an audit that rewrites a little, badly.

## Step 1. Scope and the run directory

Settle five things with the user in one exchange, not six:

- Which files are the documentation. Default to every tracked `.md`.
- Which repository backs them, if any. Text with no code behind it still gets audited; the truth pass
  runs in its weaker form, described in [truth.md](../../references/truth.md).
- Where a reader arrives. Usually `README.md`. This is the entry file for every reader.
- Where the report goes: a folder in the audited repository, `audits/` at its root unless they name
  another, or the run directory outside it. A summary and the report's path come to the chat either way.
- The mode: [light, or full](../../references/roles.md#light-and-full) on their word. In a full run, start
  the harness, brief 12, as soon as the run directory exists: the truth pass runs the code in its copy.

Then make the run directory for the working files, `<slug>` naming the audited document; where it lives,
how long, and what its path is for: [run.md](../../references/run.md).

```bash
D="${CLAUDE_PLUGIN_DATA}"; RUN="${D:-${TMPDIR:-/tmp}/terse}/runs/$(date +%Y%m%d-%H%M%S)-<slug>" && mkdir -p "$RUN" && echo "$RUN"
```

Write nothing into the audited repository but the report, in the folder they named. Not a note, not a fix,
not a commit.

## Step 2. The reader profile

Build it from the repository and from the user's own words, following
[reader-profile.md](references/reader-profile.md). One line of it is the user's alone, in their own
words: what this document is for, and what it must make its reader able to do. Show the profile and ask
for corrections before Step 3.

A wrong profile is not a small error. It chooses the questions, so the whole measurement ends up
answering a question nobody arrives with, and every number after it is precise about the wrong thing.

## Step 3. The truth pass

Every sentence that states what the software does becomes one ledger entry: the claim, the doc line,
the code that backs it, an evidence level and a verdict, checked as [truth.md](../../references/truth.md)
says for the run's mode — its levels, its guarantee words, its three verdicts. Use the entry format in
[ledgers.md](references/ledgers.md).

## Step 4. The questions and the answer key

One question per decision the reader must make, taken from the profile's *what brings them here*. Five
to eight; the measured run used six. Phrase each in the reader's words, not the project's.

Write the correct answer to each from the ledger, and write it now. The ledger already holds the code
and the line, so the key costs nothing extra here and is impossible to reconstruct honestly later.

At least two of the questions must be ones the current text answers correctly. These are the controls.
Without them a rewrite measured on these questions can raise the score by breaking something nobody asked
about.

Plant at least one question the documentation genuinely does not answer, and record in the key that it
does not, with the true answer where the code gives one. A confident answer to it is a failure, and it is the only thing that separates a reader who read
from a reader who knew. Benchmarks that do this plant about one in ten.

## Step 5. The readers

Announce the plan before spawning anything: the mode, how many readers of each kind below, which model,
roughly what it costs. Wait for the user's word. Fan-outs that surprise the user are not measurements, they
are bills.

One fresh reader per question: brief 8 of [roles.md](../../references/roles.md), in its form for a set of
documents, under the rights in [measure.md](references/measure.md).

**Every audit runs a second arm with no documentation at all**: the same questions, the same
model, no files. Its score is what a reader already knew, and the number this audit reports is the
difference between the two. A raw score without that arm cannot tell a document that teaches from a
document that is merely about something the reader has seen before; the two published benchmarks that ran
this arm found the effect large enough to swallow a result our size. It doubles the reader agents.

## Step 5b. The cold readers

In the same launch, two cold readers, brief 11 of [roles.md](../../references/roles.md), each on the entry
file alone: what makes it hard or unpleasant to read, each point quoting its line. A pleasant read comes
first in [rules.md](../../references/rules.md#a-pleasant-read), and their findings come first in the
report. They give no mark, as brief 11 says, and the user's own read decides; what a cold reader would write
instead stays out of the report, as all wording does.

## Step 5c. The task readers, in a full run

In a full run, beside the question readers, two readers carrying a task, brief 9: a starting state and an
outcome they want, acting from the documentation alone, with no answer key and no source. Check the state
they produce, not what they say. It is the only evidence at level 3 about the reader's path, and it finds
the failure a question cannot: a recipe whose every sentence is true and whose sequence leaves the reader
worse off ([M11](../../references/measurements.md#m11)). Report beside the result which sections no task reached; a gate that passes everything has
described the tasks, not the document. The readers' forced guesses are the yield: ask for every place the
text made them invent something, and treat a guess that turned out right exactly like one that turned out
wrong.

## Step 6. The score and what broke

The score is right answers over questions, reported as the difference from the no-document arm. Report steps taken and departures from the documentation
beside it; a right answer found in the source code is a documentation failure.

Give every wrong answer a cause, because the cause decides what a rewrite must do:

| Cause | What happened | What a rewrite must do |
|---|---|---|
| refuted | the text states what the code does not do | correct the claim at its source |
| missing | the documentation does not answer the question anywhere | write the answer, and say where it goes |
| placement | the sentence is true and sits where it misleads | put it at the decision — by moving it, or by repeating it there |
| findability | true, in the right place, not found | change the path to it |
| harmful | every sentence true, the sequence leaves the reader worse off | repair the recipe, and test it by running it |

Keep the causes apart: a findability repair cannot correct a refuted claim, and a sentence under the
wrong heading needs its placement fixed ([M27](../../references/measurements.md#m27)).

**Missing is the largest class, not the rarest.** In the one study that counted — 805,939 candidates
mined, 878 classified by hand — the answer being absent accounted for 268 of 485 documentation defects,
against 190 stale and 72 wrong. A question the documentation never answers is not a findability failure,
and sending a rewrite to improve the path to an answer that does not exist wastes the run.

**Placement is repaired by repetition as often as by relocation.** Written procedure in the field where
a misreading kills settles it this way: state the fact early, and require it again at the point of use.
A local warning belongs immediately before its action; a global one is stated once and repeated locally.
Do not move a fact away from where it is currently read correctly in order to put it where it is also
needed — put it in both places.

Report the score with its own limits beside it. If every question is already answered right, say so and
stop: an instrument with no room above cannot register an improvement, and a rewrite measured on these
questions will show nothing. A zero can rise; report it and go on.

Write the report using the section contract in [ledgers.md](references/ledgers.md), to the folder they
named as `<date>-<slug>.md`, or to `$RUN/audit.md` when they chose the run directory: `rewrite` is given its
path, and its writer and readers work from that file.

Report to the user, first, what the cold readers found hard to read, with its lines; then the score, the
failures with their causes, the refuted claims, the report's path, and the shape verdict; in a light run,
also that nothing was run, so no claim is above level 2 and no recipe was tried. It is `shape: agreed`
only on the user's word: that they agree to a named plan (`rethink` step 5), whose file name and SHA-256
go into the report, or, quoted, that the document's current shape stands. A plan they read without saying
they agree to it is not agreement; anything short of their word is `shape: not agreed`. Agreed, offer
`rewrite` as the next step, given the report's path. Not agreed, offer `/terse:rethink`, and say why
not `rewrite` alone: a polished text can still have the wrong shape
([M29](../../references/measurements.md#m29)). Run neither. For the human hand-over, follow
[relayed results](../../references/genres/relayed-result.md).

## Reference

- The readers' briefs, their models, light and full: [roles.md](../../references/roles.md).
- Building the profile, with a worked example: [reader-profile.md](references/reader-profile.md).
- Evidence levels, guarantee words, verdicts: [truth.md](../../references/truth.md).
- The reader protocol and scoring: [measure.md](references/measure.md).
- Entry formats and the report's contract: [ledgers.md](references/ledgers.md).
- The sentence rules and the curse-of-knowledge steps under `rules.md`:
  [writing-rules.md](../../references/writing-rules.md), [curse-of-knowledge.md](../../references/curse-of-knowledge.md).
- What a code comment carries that the code does not: [code-comments.md](../../references/genres/code-comments.md).
