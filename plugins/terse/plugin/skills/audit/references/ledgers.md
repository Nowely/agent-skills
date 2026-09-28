# The report and its claim ledger

`audit` and `rewrite` are two skills and two invocations, possibly two sessions. What passes between them
is one file, the audit's report, so the file has a contract: fixed headings, fixed order, no renaming.
`rewrite` is given its path; its writer reads the file, and its readers take their questions and key from it.

## The report

Path: `<folder>/<date>-<slug>.md` in the audited repository, the folder settled in the audit's Step 1, or
`$RUN/audit.md` when the user chose the chat alone. Every path inside it is relative to the repository.
Headings exactly as below, in this order.

```markdown
# Audit of <what was audited> at <commit or date>

## Scope
Files audited, the entry file, the repository that backs them, and the mode.

## A pleasant read
What the cold readers found hard or unpleasant to read, each point with its line; no mark.

## Reader profile
The nine sections, as confirmed by the user; the last, what the document is for, in their own words.

## Claim ledger
Entries C01, C02, … in document order.

## Questions and answer key
Each question, its correct answer, whether the documentation gives that answer, the ledger entries that
support it, and whether it is a control.

## Reader results
One row per reader.

## Score
Right answers over questions, steps, departures, on a single line.
Then `shape: agreed` or `shape: not agreed`, and what an agreement rests on: the path and SHA-256 of the
plan the user said they agree to, or their words that the current shape stands, quoted.

## What broke
One entry per wrong answer, each with a cause.

## Open
What could not be settled, and anything the steps contradicted each other about.
```

`rewrite`'s writer acts on five headings: **Reader profile** is who it writes for; **A pleasant read**,
**What broke** and the refuted entries of the **Claim ledger** are what the text must answer; and
**Score** carries the shape verdict, whether the text's shape stands.

## Claim ledger entry

One entry per sentence that states what the software does, numbered in document order.

```markdown
### C07 — README.md:46

Claim: the installer requires Node at or above the version package.json declares.

Sources: package.json:1-9 (engines.node is ">=22"); skills/codex/scripts/driver.mjs:24-29.

Level: 2. Verdict: confirmed.
Position: misplaced — sends the reader to look the number up instead of stating it.
```

- **Claim** restates the sentence as a checkable assertion, not as a quote.
- **Sources** name file and line range. Every source is a real path in the audited checkout.
- **Level** is 1, 2 or 3, as reached — see [truth.md](../../../references/truth.md).
- **Verdict** is confirmed, refuted or unconfirmed. A refuted entry names what contradicts it.
- **Position** appears only when the claim is true and read where it misleads.

## Reader results

```markdown
| # | Question | Answer | Right | Steps | Departed | Quote |
|---|---|---|---|---|---|---|
| 1 | What is this? | "delegates coding work" | no | 1 | no | README.md:3 |
```

`Quote` is the line the reader based the answer on. A wrong answer without it cannot be repaired at its
source, only guessed at.

## What broke

```markdown
### Failure 1 — "What is this?" — cause: refuted

The reader answered "coding work" from README.md:3. The software takes any work. The same reader
repeated two guarantees from README.md:5-9 that the code does not make (C02, C14).

Repair must: correct the scope sentence and remove both guarantees at their source.
```

Name the cause with one of the five words — refuted, missing, placement, findability, harmful — because
`rewrite` treats them differently. Name the ledger entries involved. State what a repair must achieve, not how to word it.
