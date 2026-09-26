# The roles

Every agent the three skills start, with its model and its brief. `rewrite` runs one writer, then every
critic at once on the writer's draft, then the writer once more, then a check of what the repair changed;
`rethink` runs the writer, the genre scout, form and the rationalizer on a plan; `audit` runs the readers,
and in a full run the harness. Each critic holds one concern and nothing else, so they run in parallel and
none waits for another. Fill `<DOC>` (the text under review), `<CODE>` (what the text describes: for
documentation, the repository), `<CONTEXT>` (the `context.md` the writer writes first), `<GENRE>` (the notes
for this kind of text, or the scout's table and the best documents it fetched), `<RULES>` (`rules.md` beside
this page), `<SENTENCES>` (`writing-rules.md` and `curse-of-knowledge.md` beside this page), `<TRUTH>`
(`truth.md` beside this page), `<PURPOSE>` (the owner's words: what the text is for and who reads it),
`<AUDIT>` (an audit's `audit.md`, where one was given), `<OUT>` (the run directory); send nothing else.
Every brief ends with: do not modify the repository, write only under `$TMPDIR`, never `cd` inside a
compound command. Every agent returns its report as its final message, and the coordinator saves it: a
harness hook refuses a subagent's report file.

| Role | Model | Runs | Brief |
|---|---|---|---|
| writer | Claude Opus | first, and again for the repair | 1 |
| genre scout | Codex Sol | before the writer, only when the kind has no notes | 2 |
| truth, one per group of sections | Claude Opus | on the draft; one more on the sentences the repair changed | 3 |
| rationalizer | Claude Opus | on the draft | 4 |
| form | Claude Sonnet | on the draft | 5 |
| terms | Claude Sonnet | on the draft | 6 |
| sentences | Claude Sonnet | on the draft | 10 |
| question readers | Codex Luna | `rewrite`: three to five, on the draft and again on the repaired text; `audit`: one per question | 8 |
| task reader | Codex Sol | `rewrite`: one, on the draft; `audit`: two, on the documentation; full mode only | 9 |
| harness | Claude Sonnet | beside the writer, or from the audit's first step; full mode only | 12 |
| cold readers, two | Codex Astra and Codex Sol | `rewrite`: on the repaired text; `audit`: on the entry file | 11 |

## Light and full

A run is light by default: every role reads and runs nothing. It is full when the user asks: one agent
builds a runnable copy of the code while the rest of the run goes on (brief 12), the truth checks may run
the code there, and a task reader carries out what the text tells it to do (brief 9). A skill that starts
a role able to run code names the mode when it announces its agents.

## 1. The writer

```
Write <DOC>. First know its world: read what it is about — for a text about code, the code at <CODE>:
what it does, how a user gets it and starts it, what they type, what comes back — and write
<OUT>/context.md: what the thing is and what it resembles, who reads the text and in what situation, what
they need first, what would make them want it, and the one thought the text carries. The purpose, in the
owner's words: <PURPOSE>. Then see how the best texts of its kind are built: <GENRE>. Where a text exists
already, it is <EXISTING>: keep what is true and does its job. Where it was audited, the run file is
<AUDIT>: write for its reader profile, and answer what it found hard to read, every failure under What
broke and every refuted claim in its ledger.

<RULES> requires two things — the text is pleasant to read, and true within its world — and the rest of it
is advice: take what helps this text and leave the rest. <SENTENCES> is a measured technique for
sentences, applied as written.

Plan from the context, not from a list of sections: each part, what it gives this reader, the device that
carries it, a word budget. Write the budgets to <OUT>/budgets.json, every `## ` heading mapped to its
words, before the text. Every statement is true within the text's world: note beside it what shows it.
Read; run nothing of what the text describes. A fact its world does not hold — a feature the code lacks, a
requirement of the owner's the code does not meet — goes back to the owner as a question, not into the
text.

Write the text to <OUT>/01-draft.md. Return as your final message the context, the plan and the evidence
notes.
```

The repair is the same agent, sent every critic's report: it applies each finding or declines it with a
reason from the context in a line — a rule is advice, and its number is no reason — re-checks every sentence it changed, then reads the whole text once as its reader, so
that a count or a name said twice agrees with itself, and writes `02-repaired.md` beside the draft with
that list. Then, at once: truth, brief 3, on the sentences the repair changed; the question readers
again; and the two cold readers, brief 11. A refuted sentence, a contradiction or a question now answered
wrong goes back to the writer for those lines only, and the text takes the next number. No text is called
final: the user's word makes it so.

## 2. The genre scout

```
Find how documents of this kind are written: <KIND>. Fetch five to eight of the most used — by stars,
downloads or listings — as raw markdown with curl, never through a summarising tool, and save them
under <OUT>/fetched/. Return one table: each place from the top, what the genre puts there, in N of M
documents, and how it is formatted there — headings, bold lead-ins, tables, fenced blocks, lists. Then
name the two or three best, and what their first 150 words do for their reader. Cite nothing you did not
fetch.
```

It runs before the writer, whose brief carries its table and the best documents it named. Its table is
kept as the genre's notes; the next text of the same kind is written from them without a scout.

## 3. Truth, one agent per group of sections

```
Check every sentence that states a fact in <SECTIONS> of <DOC> — a group of sections, or the sentences a
repair changed — against its world, <CODE>, as <TRUTH> checks a claim in a light run: read, run nothing of
what the text describes, and judge each sentence by its levels, its verdicts and its guarantee words.
Return only the refuted and the overstated sentences, each with its line in <DOC>, the evidence, and the
plainest sentence that is true for this reader — <CONTEXT> — or "cut" where they lose nothing they need.
Plain, not shortest: a replacement the reader must read twice is no fix. A rare case that would not
mislead this reader is noted, not written into the text, and a route the reader takes is not narrowed to
fit it.
```

In full mode, add to the brief: "You may also run the code in <HARNESS>, the copy built for this run, and
nowhere else; what you make happen there is level 3."

## 4. The rationalizer

```
The reader of <DOC>, and the text's world: <CONTEXT>. For every fact, sentence and block, ask: does this
reader need it here, to decide or to act — or does it make them want the thing? What does the reader lose
if it goes? Be hardest on versions, paths, prerequisites, internal names and anything explained that this
reader already knows; keep what tells them what the thing is and why it is worth having — a comparison
with what they know, a demo, the pitch — even where it is not a step. Return a list: the line, the words,
cut or keep with the reason in a clause, and the words saved. Keep a condition, a limit or a warning at a
point where the reader decides.
```

## 5. Form

```
Read <DOC> as its reader — <CONTEXT> — beside the best texts of its kind, <GENRE>, and the advice of
<RULES>. Is it pleasant to look at and to scan? Does it give this reader, early, what they need first and
what would make them want the thing? Which part does this reader need that is missing, which is there
only because texts of the kind have it, which is out of place? Which formatting would help them read
it? Return each finding with its line and what the reader gains from the change.
```

## 6. Terms

```
Read <DOC> as its reader: <CONTEXT>. List every word this reader would parse differently from what the
text means, every internal name used where the reader has a word of their own, and every term used
twice under two names. Return each with its line and the word to use.
```

## 8. A question reader

One reader per question: a reader that answers two has learned the text from the first. Never ask a
reader whether the text was clear: on 2026-09-10 the self-report ran against the truth — two readers who
reported no confusion answered wrong, and the one who called a section scattered and confusing answered
right. A judgement a reader volunteers is a hint, kept out of any score. The quote is what makes a wrong
answer diagnosable: it names the line that misled the reader, and that line is where the repair goes.

For one text, as `rewrite` sends it:

```
You are a fresh reader. Read ONE file and nothing else, with cat: <DOC>. Do not use anything you
already know about this software. Answer from that document alone: <QUESTION>. Quote the sentence the
answer comes from and name its section. If the document does not answer it, write GUESSED, give your
best guess, and the sentence you wished were there. Run no command other than that one cat.
```

For a set of documents, as `audit` sends it, starting where its readers start:

```
You are reading a project's documentation for the first time. You have never seen this project.

Start at <ENTRY FILE>. You may open only .md files in <REPO>. You may not open source code,
tests or configuration, and you may not search the web.

Answer this question: <QUESTION>

Return:
  answer:    your answer, in your own words
  files:     every file you opened, in the order you opened them
  steps:     how many files you opened before you could answer
  departed:  yes if you needed anything outside the .md files, no otherwise
  quote:     the line you based your answer on, with its file and line number
```

## 9. The task reader

```
You are a fresh reader carrying a task. You may read <READ>, and nothing else. Starting state:
<STATE>, created under $TMPDIR. Goal: <GOAL>. Do what the document says, then show the resulting state.
Report every command with its output, every point where you had to guess and the sentence you wished
were there, and every sentence that turned out untrue. End with one line: GOAL: achieved | partly | not.
```

`rewrite` fills <READ> with "ONE file, with cat: <DOC>"; `audit` with "the .md files in <REPO>, starting at
<ENTRY FILE>".

## 10. Sentences

```
Read <DOC> against <SENTENCES>, applied as written, and against the pleasant-read requirement of
<RULES>. Find every sentence its reader would have to read twice: too long, conditions stacked, a path, a
flag or a name in the middle of prose, a term before the reader needs it. Return each with its line and a
plainer sentence that says the same, or "cut" where it carries nothing.
```

## 11. A cold reader

```
You are a fresh reader. Read ONE file, with cat, and nothing else: <DOC>. Assess the quality of this
<KIND>. Quote the line for every point you make.
```

Its findings are weighed against the context like any critic's. On 2026-09-25 two cold readers of the
one path's first text found a contradiction the repair had brought in and two rows no reader could
tell apart; in the same round, marks for pleasantness from cold readers did not separate the owner's first
choice from the second, so a cold reader finds defects and gives no mark.

## 12. The harness, full mode only

```
Build a runnable copy of <CODE> under $TMPDIR for the truth checks, while the rest of the run goes on:
install its dependencies with every cache under $TMPDIR, build what the repository builds, and stub what
cannot run outside its host. Change nothing in <CODE>. Return as your final message the copy's path, how to
start each part, and what could not be built and why; give the path as <HARNESS> to every truth check.
```

## Why this shape

Measured on 2026-09-24, on the README of sharpdeveye/maestro written from scratch: the sequential path —
a survey, a synthesis, a terms stage, ten structures under three critics, a skeleton, a bake-off of
three writers under three judges, a verified round, a wave and its dedup — took 6 h 38 min, and on the
owner's read the result sat at parity with the repository's own README and above a bare agent's, which
took 14 minutes. What changed the text for the better was the truth checked by running the code and the
rules where they were applied; the rest was process. Here each of those concerns is kept as one role,
run at the same time as the others (`research/2026-09-24-terse-benchmark-maestro/`). The first run of
this path, on 2026-09-25, took 70 minutes: the writer spent 33 of them running code the truth critics ran
again, the repair brought in a contradiction nobody read for, and the sentence rules were in no role —
hence the writer who reads, the check after the repair, and the sentence critic
(`research/2026-09-24-terse-benchmark-maestro/one-path/`). The second, on 2026-09-25, took 1 h 33 min: three
truth critics and the check's each built the same harness and held the critical path twice, 24 and 20
minutes, while every finding they reached by running named the code lines that cause it — hence truth by
reading in a light run, and one shared copy in a full one (`…/one-path-2/`).
