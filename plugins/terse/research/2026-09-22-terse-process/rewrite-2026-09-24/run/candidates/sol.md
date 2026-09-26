# terse

terse is a Claude Code plugin to assess and improve any text, starting with READMEs. Use it when you cannot tell whether a document is fine and fear an edit may make it worse. AI agents make rounds of edits, guided by rules and best practices, toward text where every word carries weight and meaning. The aim is no filler or AI slop; it is not a compressor.

## Quick start

```bash
claude plugin marketplace add Nowely/agent-skills
claude plugin install terse@nowely
```

You need: Node 22 or newer

A skill run needs a signed-in Claude Code session. From the folder containing the Markdown files, run:

```text
/terse:audit
```

The audit asks which files to read and where your readers start, announces how many agents it will start and which model, then waits until you say so.

Excerpt from its 2026-09-22 report:

```text
docs 5/7, no-document 0/7, delta +5/7; steps 1,1,1,1,3,1,1; departed 0/7 and 0/7
```

If every answer is already right, stop. Otherwise, say whether the document's shape—the sections and their order—stands. If it does, give rewrite the folder named in the report. If it does not, run `/terse:rethink` first and agree its skeleton—an outline of sections, their purposes, exclusions and budgets. Then run:

```text
/terse:rewrite
```

Review the diff—the line-by-line change—and decide whether the draft replaces your document.

Update:

```bash
claude plugin marketplace update nowely
claude plugin update terse@nowely
```

## Skills

| Command | When to run it | What you get back |
|---|---|---|
| `/terse:audit` | A document exists; its owner cannot tell if it is fine. | A report: wrong questions; causes in the report's order—false, missing, misplaced, hard to find, misleading steps; file and line; no rewording. |
| `/terse:rethink` | No document, or wrong things in the wrong order. | A skeleton—an outline with section purposes, exclusions and budgets—agreed before writing. |
| `/terse:rewrite` | After an audit, or after a skeleton is agreed. | A new whole-document draft beside yours, and its diff. |

You start each one yourself.

`/terse:audit` → `/terse:rewrite` → `/terse:audit` again with the same questions  
`/terse:rethink` → `/terse:rewrite` → `/terse:audit` again with the same questions

## How it works

- One fresh AI reader per question answers text-only from where your readers start, against an answer key written first from code or named source. The same questions without your text set the score—right-answer gain over prior knowledge. Causes: false, missing, misplaced, hard to find, misleading steps.
- Three writers draft; two judges choose; rounds pass to AI reviewers, each checking one thing. Rules forbid cutting or weakening a condition, a limit or a warning where your reader decides. Rethink reads documents like yours first. Length never selects; cuts of twenty words or more need reasons.
- A check refuses rounds losing checked-true claims or restoring ones found false: edits cannot undo a fix or make it worse.
- Each run uses the plugin's own folder outside your repository; no draft or bug enters your files until you say so.

## What was measured

- On 2026-09-10, the method ran on one README: right answers rose from 3 of 6 to 6 of 6, and the questions it already answers right stayed right. One small trial, the gain could be chance (*p* = 0.25); the questions never ran without the text.
- The same run changed 2,725 words to 2,571.
- On 2026-09-22, the plugin audited its previous README: AI readers answered 5 of 7 with the text and 0 of 7 without it, one trial per question.

Neither run measured whether a person reads the improved text better. [Research behind these results](references/prior-art.md) gives the sources and limits.
