# terse

A Claude Code plugin for assessing and improving any text, a README first, in rounds of edits by several AI agents working from rules and best practices. Its aim is text in which every word carries weight and meaning, without AI slop. It is not a compressor. It is for when you cannot tell whether a document is fine, and touching it may make it worse.

## Quick start

```bash
claude plugin marketplace add Nowely/agent-skills
claude plugin install terse@nowely
```

You need: Node 22 or newer, and a signed-in Claude Code.

In Claude Code, where the Markdown files are:

```text
/terse:audit
```

It asks which files to read and where your readers start, says how many agents it will start and on which model, and waits until you say so. From its report on this plugin's README, 2026-09-22:

```text
`missing`: the owner's intent — the method holds for any text
in any language, code or not — appears in no page
```

If every answer is already right, stop there. Otherwise say whether the document's shape — what it says, in what order — stands. If it does, run this and give it the folder the report names; if not, run `/terse:rethink` first to decide a new one: a skeleton, an outline you agree to.

```text
/terse:rewrite
```

It hands back a new draft of your whole document and its diff, each change against the original, in the plugin's own folder outside your repository. You decide whether the draft replaces your document.

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
| `/terse:rethink` | No document yet, or it says the wrong things in the wrong order | A skeleton: an outline of sections, each with its purpose and budget, to agree to before anything is written |
| `/terse:rewrite` | After audit, or a skeleton you agreed to | A new draft of the whole document, and its diff |

You start each one yourself, and both orders end in audit:

- `/terse:audit` → `/terse:rewrite` → `/terse:audit` again with the same questions
- `/terse:rethink` → `/terse:rewrite` → `/terse:audit` for the first time

## How it works

- A fresh AI reader per question answers from the text alone, starting where your readers start, against an answer key written first from the code or a named source; the same questions run without your text.
- Wrong answers get a cause: false, missing, misplaced, hard to find, misleading steps.
- Three writers draft, two judges pick, then rounds of edits, checked by AI reviewers, each checking one thing.
- The rules forbid cutting or weakening a condition, a limit or a warning where your readers decide; rethink reads documents like yours first.
- Length never picks a draft; cuts of twenty words or more carry reasons.
- A round that drops a claim checked true, or brings back one found false, is refused before you see it.
- Each run is written in the plugin's own folder; nothing in your repository changes until you say so.

## What was measured

- 2026-09-10, one README, the method this plugin was built from: AI readers' right answers 3 of 6 → 6 of 6; the questions it already answered right stayed right. One small trial; the gain could be chance (*p* = 0.25). The same questions were not run without the text.
- The same run took that README from 2,725 words to 2,571.
- 2026-09-22, this plugin's audit of its own README: 5 of 7 right with the text, 0 of 7 without.
- Never measured: whether a person reads the improved text better — only whether a model does. [What the field has measured, and its findings against the 2026-09-10 numbers](references/prior-art.md).
