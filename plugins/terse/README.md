# terse

A Claude Code plugin for assessing and improving any text, in rounds of edits by several AI agents working from rules and best practices. Its aim is text in which every word carries weight and meaning, without AI slop. It is not a compressor. It is for when you cannot tell whether a document is fine, and touching it may make it worse.

## Quick start

### Install

```bash
claude plugin marketplace add Nowely/agent-skills
claude plugin install terse@nowely
```

You need: Node 22 or newer.

### Workflow

In Claude Code:

```text
/terse:audit
```

It asks for the scope — which files to check, every tracked `.md` by default — and where your readers start. Before starting agents, each skill says how many and on which model, and waits until you say so. Its report starts with what makes your text hard to read, then lists the questions it answers wrong, why, and where — file and line when a sentence is at fault.

If every answer from your text is already right, stop. Otherwise say whether the document's shape — what it says, in what order — stands. If it does, run this and, when it asks, give it the folder the report names:

```text
/terse:rewrite
```

It hands back a new draft of your whole document and its diff, each change against the original, in a folder of its own outside your repository. You decide whether the draft replaces your document.

If the shape does not stand, run this first to decide a new one: a plan, an outline you agree to.

```text
/terse:rethink
```

Recommended orders, each command run by you:

- `/terse:audit` → `/terse:rewrite` → `/terse:audit` again with the same questions
- `/terse:rethink` → `/terse:rewrite` → `/terse:audit`

### Update

```bash
claude plugin marketplace update nowely
claude plugin update terse@nowely
```

Restart Claude Code to apply it.

## Skills

| Command | When to run it | What you get back |
|---|---|---|
| `/terse:audit` | You cannot tell whether your document is fine | A report: what makes the text hard to read, then which questions it answers wrong, why, and where — file and line when a sentence is at fault; no rewording |
| `/terse:rethink` | No document yet, or it says the wrong things in the wrong order | A plan: the sections, each with what it gives the reader and its size, to agree to before the text is written |
| `/terse:rewrite` | You want the text written or rewritten | A new draft of the whole document, and its diff |

You start each one yourself.

## How it works

- **audit** — a profile of who reads it → every claim checked by reading the code or a named source → questions and an answer key → a fresh AI reader per question, with and without your text, starting where your readers start, and two more on what makes it hard to read → a cause for each wrong answer: false, missing, misplaced, hard to find, misleading steps. Ask for a full run and the claims are also run, and two AI readers carry out tasks from your text. [Its page](skills/audit/SKILL.md)
- **rethink** — what your text is and who it is for → how the best texts of its kind are built → a plan on one screen: each part, what it gives the reader and the form it takes → form and relevance critics on the plan → a plan you agree to. [Its page](skills/rethink/SKILL.md)
- **rewrite** — one writer, who first works out what your text is, who reads it and what they need → every critic at once: truth by reading the code, relevance for your reader, form, terms, sentences, fresh AI readers → one repair → a check of what it changed → your read. Ask for a full run and the truth critics also run the code, and an AI reader carries out a task from your text. [Its page](skills/rewrite/SKILL.md)

## Checks and guarantees

| Method | What it checks | Where it comes from |
|---|---|---|
| The writing rules | Filler, an argument restated, editing history; a condition, a limit or a warning cut or weakened where your readers decide | Part two of a four-part rewrite, measured on one README: [the rules](references/writing-rules.md) |
| The rules | Two things required of every text — it is pleasant to read, and true within its world — and advice for finding its best structure, words and form, taken where it helps | One owner's feedback and counts of documents of a kind, each piece marked with its source: [the rules](references/rules.md); advice for one kind of text, such as a README, in [its genre notes](references/genres/) |
| The scripted check | Words per section against the writer's own plan, as a report; tested against a deliberate violation | [The measurements behind the scripts](references/measurements.md) |

[The field's practices, each marked measured, argued or asserted](references/prior-art.md), gathered and ranked.

**What the skills promise:** Each run is written in the plugin's own folder. A sentence the truth critics refute goes back to the writer before you see the text. Nothing in your repository changes until you say so.

**Not guaranteed:** that a person reads the result better; what is measured is what AI readers get from the text.
