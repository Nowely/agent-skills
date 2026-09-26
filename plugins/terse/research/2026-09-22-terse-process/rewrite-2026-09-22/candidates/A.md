# terse

A Claude Code plugin that measures whether your documentation gives readers the right answer, and then
repairs what it measured. Its readers are fresh model agents that have never seen your project. It also
checks what the text says your software does against the code — not recipes for tools your repository
does not ship — so a failure comes back with its cause and its evidence rather than an opinion.

It takes any documentation kept in `.md` files, in any language. Text with no code behind it is audited
too; its claims get a weaker check, which has not been measured.

Three skills. You type each one in a Claude Code session; none starts on its own.

```
/terse:rethink  →  skeleton  →  /terse:rewrite  →  candidate + diff  →  /terse:audit
/terse:audit    →  run file  →  /terse:rewrite  →  candidate + diff  →  /terse:audit again
   what broke                    what to write                          did it hold
```

Start with `/terse:audit` when the document exists, and with `/terse:rethink` when there is none yet or
its shape is wrong. To see whether a rewrite held, apply it, then run `/terse:audit` again on the same
questions.

## Install

```
/plugin marketplace add Nowely/agent-skills
/plugin install terse@nowely
```

The same two steps from a shell: `claude plugin marketplace add Nowely/agent-skills`, then
`claude plugin install terse@nowely`.

You need Claude Code, signed in, and `node` on your `PATH`. `audit` and `rewrite` run Node scripts
whether the plugin is installed or run from a clone, and the package declares version 22 or newer. There
is nothing to `npm install` and no configuration file. With the `entrust` plugin, `rewrite` gives some of
its agents to Codex; without it, they run on Claude.

## What each one does

**`/terse:audit`** builds a profile of who reads this project, derives the correct answers from the
code, then sends one fresh reader per question through the documentation — `.md` only, starting where a
real reader starts. On a first audit each question also goes to a reader with no documentation, and the
score is the difference. It returns a score, the questions that failed, and why each failed: the text
lied, the answer was nowhere, the true sentence sat where it misleads, it was there and unfindable, or
every sentence was true and the sequence left the reader worse off. It never suggests wording. If
readers get every answer right, it says so and stops. It keeps all of this in its run file, `audit.md`.

**`/terse:rethink`** decides what a document should be before a sentence of it is written: what
comparable documents in the same genre already solved, what things should be called, and what is said in
what order. It returns a skeleton — section titles, what each is for, what each leaves out, a word
budget — and stops there for your word.

**`/terse:rewrite`** takes a skeleton or an audit's run file and writes against it. Three writers produce
candidates. From an audit, each takes the whole document through the chain: four passes, for its reader,
the writing rules, what a reader must already know, and the measured failures. Two judges score the
candidates on the measured failures, or from a skeleton on each section's purpose, rather than on taste.
The winner is then edited in rounds. Before critics read a round, each claim its edits add carries a
check that is run, and a check that finds nothing refuses the round. A ledger of verified sentences fails
the round for dropping one or keeping a sentence found false. The critics' lenses differ: the code, the
rules, an adversarial reader, a task, a reader's questions. It hands you a round with its diff against
your original, a list of every cut of twenty words or more with its reason, and the ledger: each claim
with the check or source behind it and its evidence level — the line exists, the code says it, or it was
made to happen. The loop stops when you read a round and say whether you would send it as it is. It
applies the round to your files only when you say so.

All three skills announce how many agents they are about to spawn, on which model, and wait for your
word.

## What it writes, and where

`/terse:audit` writes nothing into your repository. `/terse:rewrite` puts nothing into it without your
word — not the candidate, and not a defect it finds in your code, which it offers you as a proposal.
Both skills keep their run directories outside your repository and print the absolute path; `rewrite`
asks you for the audit's. Installed, runs sit in the plugin's data directory, which
`claude plugin uninstall` deletes unless you pass `--keep-data`. Run from a clone, they sit in the
system's temporary directory, which the operating system may purge. Copy a run you want to keep.

`/terse:rethink` hands over its skeleton as one file; its page does not say where that file is written.

## What it will and will not do to your text

It is not a compressor. On the one file measured, the chain moved 2,725 words to 2,571 — six percent —
while the second pass cut 105 words and the third added 105 back as missing framing. Length is reported,
not used to pick a candidate, and a section over its word budget is reported, not blocked.

The writers follow fixed rules: cut a sentence that carries nothing, and an argument restated wherever
its instruction appears; never cut a condition, a limit or a warning where a reader decides; a
repetition at a point a reader reaches independently is not redundancy; a dated measurement keeps its
date and its numbers, including ones the code has since changed. A judge rejects a candidate that cuts
or weakens such a passage, and a false one is corrected.

`rewrite`'s mechanical checks are scripts, each tested against a planted violation before its output is
believed. The one that keeps paths, flags and exit codes out of the sections a reader meets first
recognises an exit code only when it is written in English.

## What was measured

Two experiments, both on 2026-09-10 and both on another Claude Code plugin: the chain, run once over its
README, and a bake-off of writing standards over all its prose and code comments. The chain ran no arm
with the same questions and no document at all, so none of its numbers separates what the text taught a
reader from what the reader already knew. Read the size of each result before its numbers:

- The four-pass chain took six reader questions from three right answers to six, took readers leaving
  the documentation from one to zero, and broke neither control question — a question the text already
  answered right. **Six questions, one trial each.** Three improvements and no reversals over six paired
  items gives an exact two-sided McNemar *p* = 0.25, so this result is not distinguishable from chance.
  It is a pilot, not a rate. The readers' own answers are not in the repository.
- Two of the six failures were false claims rather than answers that were hard to find: a reader
  repeated two guarantees from that README's opening that its code does not make.
- A reader's own sense of clarity ran against the truth. Two who reported no confusion answered wrong;
  the one who called a section scattered and confusing answered right — three observations. Neither
  skill asks a reader whether the text was clear.
- In the bake-off, ten agents worked in pairs — Diataxis, a published house style, checking against the
  code, a draft rule block, and no standard — with the models hidden from the two judges. Both agents
  with no standard ranked above all four agents of the two published standards on one judge's list; one
  of them did on the other's. On the README's 116-word opening, five agents proposed nothing, one changed
  only punctuation, three made it longer, and the only one that shortened it (116 to 97 words) had no
  standard. **Ten agents, one run, one passage** — one observation per cell, not a rate.

Not measured: which of the four passes produced the gain, and whether a bake-off beats one careful pass.
[references/prior-art.md](references/prior-art.md) records an adversarial review of these numbers and
what the field already knows.

## Licence

MIT.
