# Code comments

Start with neighboring comments and the project's conventions, then read the code the comment will sit beside. The code already shows operations and names; a comment earns space when it carries purpose, a constraint, or a reason that the code and its context do not show. A genuinely useful comment can explain a surprising ordering or a compatibility limit. See the [reader rule](../rules.md#the-reader).

The next reader uses this text while changing code. They need to know what would break if they simplify it, which cases the comment covers, and whether a number still matches the code. Keep a number or version when it matters for compatibility or reproduction, and name its scope. Check a stale comment against current behavior before editing it.

Do not narrate the syntax or add a standard “why” line to every function. Do not delete a reason merely because the code is locally clear: the reason may be about a caller or external contract. A comment that only describes yesterday's implementation should change or go when the implementation changes.

## Example

Before: a comment justified leaving one package out of a list. After: it explained why the list exists and which problem it solves. The owner chose that revision after questioning the relevance of the excluded package. Paraphrased from P21 in `plugins/terse/research/2026-09-26-writing-replication/publication/issue-comment.md`.
