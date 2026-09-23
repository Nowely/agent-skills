---
name: rethink
description: >-
  Decides what a document should be before a sentence of it is written: what comparable documents already
  solved, what things are called, and what is said in what order. Returns a skeleton and stops there —
  the writing is `rewrite`'s. Use when a document's shape is wrong, or when starting one.
disable-model-invocation: true
metadata:
  version: "0.1.1"
license: MIT
---

Three decisions, in order, each cheap to change here and expensive to change later. The output is a
skeleton: section titles, what each is for, what each deliberately leaves out, a word budget, and the
rules that will gate the writing. No prose.

**Then it stops.** Putting a skeleton in front of the person before two thousand words are written
against it is the point, not a courtesy. Measured on 2026-09-11: a ten-section draft written at ordinary
quality was abandoned by its reader at the third section, and nine of his nine objections were about what
the document contained, where it sat, or how much of it there was. None was about phrasing. Every
sentence in it was written against a shape nobody had agreed.

The method, with the measurements behind each stage: [stages.md](references/stages.md).

**Entered from an `audit` whose shape is not agreed**, the audit's profile, purpose and answer key are
the brief, and the steps keep their order: step 1 at the size the user gives, zero included; step 2 in
full, because a profile and a key carry no terminology decisions; then steps 3 and 4.

## Step 1. What comparable documents already solved

A fan-out, not one reader. One agent searching for good examples returns the genre's folklore; six agents
on six slices return a sample.

Announce the count and the models before spawning, and wait for the user's word. Default slices, one
surveyor each: the exact genre, the same structural position, the most used regardless of genre, vendor
guidance, whatever this document's hard part is, and one slice whose job is what *not* to copy. A
seventh reads the documents the owner names as good, asked for before anyone is spawned: on 2026-09-23
no survey fetched the exemplar the owner had named.

Two rules the surveyors carry, both learned by getting them wrong: **fetch, do not recall** — every
document reported carries its URL and its headings in order — and **weight by use, not by taste**. Each
also returns the genre's order — every place from the top, what the genre puts there, in N of M
documents fetched — because the skeleton says where it follows that order and where it departs.

Presentation is surveyed here too, from the markdown source rather than from a rendering, because a
summary of a document does not show you its devices.

One synthesis decides what to take. The bar is that a change earns its words in *this* document: it names
what it displaces, or admits the document grows.

The briefs, and how to make the file of the owner's own words on the genre that every agent here reads:
[briefs.md](references/briefs.md).

## Step 2. The words

Do not inherit a project's vocabulary because the project uses it. For each load-bearing term: who parses
it and as what, where it comes from, and whether its commonest sense in the reader's own field is a
different thing.

Where the document's thesis is that A is like B, call A by B's word. Any other choice is an argument
against the document, made in every sentence. The worked example — a project that called its delegated
agents "seats" while claiming they were the equal of native subagents — is in
[stages.md](references/stages.md#stage-2-the-words-themselves).

## Step 3. The structure

First the owner's purpose statement, verbatim: the audit's purpose line, or the user's own words asked
for now — what this document is for and what it must make its reader able to do. Then about ten
structures, each from a **different reading of what the document is for**, not ten runs of one prompt.
Announce the count and the models, and wait. Before the first writer, put to the owner any unknown the
structures would plan around that is theirs to decide rather than a fact to check, and give every
writer the answer as a fact. The ten default readings and the writers' brief, under which every
structure says what sections of the genre it drops, at what weight and what cost, are in
[briefs.md](references/briefs.md#3-the-structures).

Critics see **all of them at once**, because ranking is the judgement being asked for and it cannot be
made from isolated reviews. Give each critic a different lens, have every critic judge every structure
against the purpose statement, and require a fatal flaw for every structure including the one it ranks
first. The default lenses — the owner's calibration, the reader's task, the genre and the evidence — and
the critics' brief: [briefs.md](references/briefs.md#4-the-critics).

Ask each critic one more thing: what all of them got wrong. That answer is usually worth more than the
ranking — a failure every angle shares is a failure of the brief. On the run this method came from, it
was the three critics' shared answer that found the real defect, and none of the ten proposals had.

Synthesise from the winner, grafting only what the critics named. Do not average ten structures into a
compromise. Which structure is the winner when the rankings split:
[briefs.md](references/briefs.md#5-the-base).

## Step 4. What you hand over

One file, and it describes the document rather than arguing for itself. A skeleton introduced by why each
section exists — "the block you asked for", "the one you said was missing" — is a negotiation transcript,
and a reader feels it before they can name it.

- at the top, the owner's purpose statement, verbatim
- each section: title, one sentence of purpose, what it deliberately excludes, a word budget
- the mechanical rules the writing must pass, written so that passing is a fact rather than an opinion
- the terminology decisions from step 2, including the ones you rejected and why
- what was deleted outright rather than moved, and the stated cost of deleting it
- any edit this structure requires in a file that is not the document

Then stop and wait for the user's word on this file. `rewrite` starts only from a skeleton the user said
they agree to, recorded with its path and SHA-256, and routes back here anything it finds that belongs
to a stage above it.

## Reference

- The four stages, the measurements, and the content rules: [stages.md](references/stages.md).
- Every agent's brief, and the owner's calibration file: [briefs.md](references/briefs.md).
- Filling the blocks, and the loop: [loop.md](../rewrite/references/loop.md).
- What the field already says about all of this: [prior-art.md](../../references/prior-art.md).
