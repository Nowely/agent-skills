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
they need first, what would make them want it and choose it over what it resembles, and the one thought the
text carries. The purpose, in the owner's words: <PURPOSE>. Then see how the best texts of its kind are
built: <GENRE>. Where a text exists already, it is <EXISTING>: keep what is true and does its job. Where it
was audited, the run file is <AUDIT>: write for its reader profile, and answer what it found hard to read,
every failure under What broke and every refuted claim in its ledger.

<RULES> requires two things — the text is pleasant to read, and true within its world — and the rest of it
is advice: take what helps this text and leave the rest. <SENTENCES> preserves measured text;
use its suggestions when they serve this reader, not as a compulsory shape.

Plan from the context, not from a list of sections: each part, what it gives this reader, the device that
carries it, a word budget. Every statement is true within the text's world: note beside it what shows it.
Where the owner has a real choice, follow <RULES>, "Offer alternatives when there is a real choice";
ask for one missing fact directly when that is all that blocks the work.
Read; run nothing of what the text describes. A fact its world does not hold — a feature the code lacks, a
requirement of the owner's the code does not meet — goes back to the owner as a question, not into the
text.

Write the text to <OUT>/01-draft.md. Return as your final message the context, the plan and the evidence
notes.
```

The repair is the same agent, sent every critic's report. For owner feedback after hand-over, use brief 13. The repair brief follows.

```
Every critic has read your draft, and each report is a file in <OUT>/critics/. Take a finding where it
makes the text truer for its reader or easier to read; decline one that adds words this reader does not
need where they are — a rare case, a second route, a detail — with the reason from <CONTEXT> in
a line. A rule is advice, and its number is no reason. For a broad claim, choose deletion, replacement
or a substantive qualification by the meaning this reader needs (<RULES>, "A qualification used as a repair");
keep a limit, range or trade-off they need to decide. Keep the truth critic's rare-case list out of the
text. Re-check every sentence you change
against its world and, where the change affects the owner's action, against the choice and warning
advice in <RULES>; read, run nothing of what the text describes. Then read the whole text once as its
reader, so that a count or a name said twice agrees with itself. Write the text to <OUT>/02-repaired.md,
and to <OUT>/02-repairs.md one line per finding: the critic, the finding, applied or declined, the reason.
```

Then, at once: truth, brief 3, on the sentences the repair changed; the question readers again; and the two
cold readers, brief 11. What they find goes back to the writer for those lines only:

```
A check read <OUT>/02-repaired.md, and its reports are in <OUT>/check/. Fix only these: a sentence truth
lists as wrong for this reader, a contradiction, a question now answered wrong, a line a cold reader could
not follow. What a reader wished added is not a fix: it goes to the owner with the text. Re-check every
sentence you change against its world, then write the text to <OUT>/03-fixed.md and one line per finding
to <OUT>/03-fixes.md.
```

No text is called final: the user's word makes it so.

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
Return two lists, each sentence with its line in <DOC> and the evidence. Wrong for this reader —
<CONTEXT>: a refuted sentence, or an overstated one they would act on wrongly; give the plainest sentence
that is true for them, or "cut" where they lose nothing they need. Plain, not shortest: a replacement the
reader must read twice is no fix, and a route the reader takes is not narrowed to fit a case they will not
meet. Rare cases: an exception that would not mislead this reader, named with its evidence and no
replacement — it stays out of the text.
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

One reader per question: a reader that answers two has learned the text from the first. Do not ask a
reader whether the text was clear; self-report can disagree with the answer ([M27](measurements.md#m27)).
A judgement a reader volunteers is a hint, kept out of any score. A quote makes a wrong answer
diagnosable: it names the line that misled the reader and where the repair goes.

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
Read <DOC> against <SENTENCES>, judged for this reader, and against the pleasant-read requirement of
<RULES>. Find every sentence its reader would have to read twice: too long, conditions stacked, a path, a
flag or a name in the middle of prose, a term before the reader needs it. Return each with its line and a
plainer sentence that says the same, or "cut" where it carries nothing.
```

## 11. A cold reader

```
You are a fresh reader. Read ONE file, with cat, and nothing else: <DOC>. Assess the quality of this
<KIND>. Quote the line for every point you make.
```

Its findings are weighed against the context like any critic's. A cold reader finds defects and gives
no mark: a past mark did not separate the owner's choices ([M26](measurements.md#m26)).

## 12. The harness, full mode only

```
Build a runnable copy of <CODE> under $TMPDIR for the truth checks, while the rest of the run goes on:
install its dependencies with every cache under $TMPDIR, build what the repository builds, and stub what
cannot run outside its host. Change nothing in <CODE>. Return as your final message the copy's path, how to
start each part, and what could not be built and why; give the path as <HARNESS> to every truth check.
```

## 13. Owner feedback

When the owner responds to a draft, plan, reply or report, check each point against the next version: applied,
answered, or declined with a reason. One sentence may cover several points. Keep a separate ledger only
for a complex iteration where a point could be lost. Recheck a disputed fact; do not attribute a
decision to the owner that they did not make, or call a draft final before their word. For a real choice, use
[the choice advice](rules.md#where-the-reader-acts); for the hand-over, use
[relayed results](genres/relayed-result.md).

## Why this shape

The roles keep distinct concerns in parallel, then check the repair, because earlier runs duplicated
work and let a repair introduce a contradiction. Dated observations and limits:
[M26–M29](measurements.md#m26).
