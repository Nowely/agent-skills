# terse

A Claude Code plugin for assessing and improving any text, in rounds of edits by several AI agents working from rules and best practices. Its aim is text in which every word carries weight and meaning, without AI slop. It is not a compressor. It is for when you cannot tell whether a document is fine, and touching it may make it worse.

## Quick start

```bash
claude plugin marketplace add Nowely/agent-skills
claude plugin install terse@nowely
```

You need: Node 22 or newer.

In Claude Code, where the Markdown files are:

```text
/terse:audit
```

It asks which files and where your readers start, and waits for your answer. Its report on this plugin's README, 2026-09-22:

```text
`missing`: the owner's intent — the method holds for any text
in any language, code or not — appears in no page
```

If every answer is already right, stop there. Otherwise say whether the document's shape — what it says, in what order — stands. If it does, run this and, when it asks, give it the folder the report names; if not, run `/terse:rethink` first to decide a new one: a skeleton, an outline you agree to.

```text
/terse:rewrite
```

It hands back a new draft of your whole document and its diff, each change against the original, in a folder of its own outside your repository. You decide whether the draft replaces your document.

Before starting agents, audit says how many and on which model, and waits until you say so; rewrite does so before its writers and judges, and before a round's reviewers.

Update:

```bash
claude plugin marketplace update nowely
claude plugin update terse@nowely
```

Restart Claude Code to apply it.

## Skills

| Command | When to run it | What you get back |
|---|---|---|
| `/terse:audit` | You cannot tell whether your document is fine | A report: which questions the text answers wrong, why, file and line; no rewording |
| `/terse:rethink` | No document yet, or it says the wrong things in the wrong order | A skeleton: an outline of sections, each with its purpose and size, to agree to before the text is written |
| `/terse:rewrite` | After audit, once you say the shape stands; or from a skeleton you agreed to | A new draft of the whole document, and its diff |

You start each one yourself, and both orders end in audit:

- `/terse:audit` → `/terse:rewrite` → `/terse:audit` again with the same questions
- `/terse:rethink` → `/terse:rewrite` → `/terse:audit`

## How it works

- A fresh AI reader per question answers from the text alone, starting where your readers start, against an answer key written first from the code or a named source; the same questions run without your text.
- Wrong answers get a cause: false, missing, misplaced, hard to find, misleading steps.
- By default three writers draft and two judges pick, then rounds of edits, checked by AI reviewers, each from its own angle.
- The rules forbid filler, and cutting or weakening a condition, a limit or a warning where your readers decide; rethink starts by reading documents like yours, with as many agents as you allow.
- Word count never selects a draft; cuts of twenty words or more carry reasons.
- A round that silently loses a sentence checked true, or repeats one found false, is refused before you see it.
- Each run is written in the plugin's own folder; nothing in your repository changes until you say so.

## What was measured

- 2026-09-10, one README, the method this plugin was built from: AI readers' right answers 3 of 6 → 6 of 6; the questions it already answered right stayed right. One small trial; the gain could be chance (*p* = 0.25). The same questions were not run without the text.
- The same run: 2,725 words → 2,571.
- 2026-09-22, this plugin's audit of its previous README: 5 of 7 right with the text, 0 of 7 without.
- Never measured: whether a person reads the improved text better — only whether a model does. [What the field has measured, and its findings against the 2026-09-10 numbers](references/prior-art.md).
