# terse

terse is a Claude Code plugin that assesses and improves any text — the README first — in rounds of
edits by several AI agents working from rules and best practices, aiming for text where every word
carries weight and meaning, without AI slop. It is not a compressor. Use it when you cannot tell whether
a document is already fine, and touching it might make it worse.

## Quick start

```bash
claude plugin marketplace add Nowely/agent-skills
claude plugin install terse@nowely
```

You need: Node 22 or newer.

Run it in Claude Code, in the project whose Markdown you want checked:

```text
/terse:audit
```

It asks which files count and where your readers start, announces how many agents it will start and on
which model, then waits until you say so. From a 2026-09-22 measurement of the previous README:

```text
controls Q1 yes, Q6 yes; planted Q7 failed in the docs arm (confident) and honest in the no-document arm
```

If every answer is already right, stop there. Otherwise it says whether the document's shape — its
sections and their order — still stands: stands, and you hand `/terse:rewrite` the folder it names;
doesn't, and you run `/terse:rethink` first.

```text
/terse:rewrite
```

It hands back a whole new draft beside your document, and a diff — what changed between them. Read
the diff and decide whether the draft replaces what you have.

Update:

```bash
claude plugin marketplace update nowely
claude plugin update terse@nowely
```

## Skills

| Command | When to run it | What you get back |
|---|---|---|
| `/terse:audit` | a document exists and you cannot tell whether it's fine | a report of which questions the text answers wrong, the cause, file and line — no rewording |
| `/terse:rethink` | there's no document yet, or it says the wrong things in the wrong order | a skeleton — an outline to agree to before anything is written |
| `/terse:rewrite` | after an audit, or a skeleton you agreed to | a new draft of the document beside yours, and its diff |

You start each one yourself; none starts on its own. Two chains end in audit again, same questions:
audit → rewrite → audit; rethink → rewrite → audit.

## How it works

- **Judging.** A fresh AI reader per question answers from text alone, checked against the code, or a
  named source, through an answer key, plus the same questions without the text. Wrong answers get
  one of five causes, in the report's order: false, missing, misplaced, hard to find, misleading steps.
- **Writing.** Three writers, two judges, rounds of edits checked by AI reviewers, each checking one
  thing, against rules protecting a condition, a limit or a warning where your reader decides, and the
  practices of documents like yours. Length never picks a draft; every cut of twenty words or more has
  its reason.
- **Guarding.** A round losing a sentence checked true, or reviving one found false, is refused before
  you see it.
- Runs sit in the plugin's own folder; nothing in your repository changes until you say so.

## What was measured

- 2026-09-10, one README: AI readers went from 3 of 6 questions right to 6 of 6; the questions they
  already answered right stayed right; one small trial, the gain could be chance (*p* = 0.25); never run
  without the text.
- The same run: 2,725 → 2,571 words.
- 2026-09-22, the previous README: 5 of 7 right with the text, 0 of 7 without it.

None of this measures whether a person reads the result better — only whether a model does.

[The field's findings against these numbers](references/prior-art.md).
