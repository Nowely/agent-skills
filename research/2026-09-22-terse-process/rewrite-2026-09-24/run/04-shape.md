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

It asks for the scope — which files to check, every tracked `.md` by default — and where your readers start. Before starting agents, audit says how many and on which model, and waits until you say so; rewrite does so before its writers and judges, and before a round's reviewers. Its report lists the questions your text answers wrong, why, and where — file and line when a sentence is at fault.

If every answer from your text is already right, stop. Otherwise say whether the document's shape — what it says, in what order — stands. If it does, run this and, when it asks, give it the folder the report names:

```text
/terse:rewrite
```

It hands back a new draft of your whole document and its diff, each change against the original, in a folder of its own outside your repository. You decide whether the draft replaces your document.

If the shape does not stand, run this first to decide a new one: a skeleton, an outline you agree to.

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
| `/terse:audit` | You cannot tell whether your document is fine | A report: which questions the text answers wrong, why, and where — file and line when a sentence is at fault; no rewording |
| `/terse:rethink` | No document yet, or it says the wrong things in the wrong order | A skeleton: an outline of sections, each with its purpose and size, to agree to before the text is written |
| `/terse:rewrite` | After audit, once you say the shape stands; or from a skeleton you agreed to | A new draft of the whole document, and its diff |

You start each one yourself.

## How it works

- **audit** — a profile of who reads it → every claim checked against the code or a named source → questions and an answer key → a fresh AI reader per question, with and without your text, starting where your readers start → a cause for each wrong answer: false, missing, misplaced, hard to find, misleading steps. [Its page](skills/audit/SKILL.md)
- **rethink** — documents like yours, read by as many agents as you allow → the words chosen → about ten structures, ranked together by AI reviewers → a skeleton you agree to. [Its page](skills/rethink/SKILL.md)
- **rewrite** — an adversarial first read of an existing text → by default three writers and two judges, never picking by word count → rounds of edits, each claim with a check that runs, a round refused if it silently loses a checked sentence → AI reviewers, each from its own angle → your read, with a reason for every cut of twenty words or more. [Its page](skills/rewrite/SKILL.md)

## Checks and guarantees

| Method | What it checks | Where it comes from |
|---|---|---|
| The writing rules | Filler, an argument restated, editing history; a condition, a limit or a warning cut or weakened where your readers decide | Part two of a four-part rewrite, measured on one README: [the rules](skills/rewrite/references/writing-rules.md) |
| The content rules | What a document says, and in what order | What one owner changed on his documents: [the rules](skills/rethink/references/stages.md) |
| The scripted checks | Mechanism before the decision, one idea in three sections, words against a budget, a declared check that runs, a sentence checked true lost; each tested against a deliberate violation | [The measurements behind them](skills/rewrite/references/measurements.md) |

[The field's practices, each marked measured, argued or asserted](references/prior-art.md), gathered and ranked.

**What the skills promise:** Each run is written in the plugin's own folder. A round that silently loses a sentence checked true, or repeats one found false, is refused before you see it. Nothing in your repository changes until you say so.

**Not guaranteed:** that a person reads the result better; what is measured is what AI readers get from the text.
