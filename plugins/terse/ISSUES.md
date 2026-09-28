# Defects found in passing: terse

Recorded per the repository rule: evidence at file:line, an evidence level (1: the line resolves; 2: an
independent reader of the code would say the same; 3: the behaviour was made to happen), and wording that
can become an issue unchanged. An entry leaves when its fix lands and the changelog names it. Ids are
shared with entrust's ledger, `plugins/entrust/ISSUES.md`, so one id names one entry in both. A path
pinned to a commit is that commit's address, with today's beside it.

## E70. terse has no genre notes for review comments, tickets or issues, UI strings, or before/after comparisons

**Evidence, level 1.** `plugins/terse/plugin/references/genres/` holds notes for agent briefs, code comments,
commit titles, PR descriptions, READMEs, relayed results and team messages. Issue #20 ("Structure") lists as
genre notes a PR description, a review comment, a before/after comparison, a commit message, a ticket or issue,
a UI string and a brief for an agent.

**Issue text.** Four genres #20 names have no note: review comments, tickets or issues, UI strings, and
before/after comparisons. Each would be an application of the core with one or two confirmed examples, not a new
rule set.

## E71. `clarity`'s description leaves out names, test titles and user-facing strings, and excludes changing identifiers

**Evidence, level 1.** Issue #20 ("Trigger") says the skill "should also cover the human-readable parts of code:
names, test titles, user-facing strings and comments". `plugins/terse/plugin/skills/clarity/SKILL.md:3-18`
names comments but not names, test titles or user-facing strings, and line 10 skips "steps that only run tools,
change identifiers, or copy existing output".

**Issue text.** Decide whether choosing a name, a test title or a user-facing string is in `clarity`'s scope. If
it is, name those texts in the description and narrow the exclusion to mechanical renames; a description change
needs the trigger measurement in `RELEASING.md`.

## E73. Whether `clarity` reduces objections, or improves the texts, is not measured

**Evidence, level 1.** Issue #20 ("How to measure it") sets a baseline of 115 records, 73 of them objections,
over 61 sessions in 30 days, and asks for objections per genre and aspect after adoption. The only counter,
`plugins/terse/evals/clarity-trigger.count.mjs`, counts invocations. The blind pairs in
`plugins/terse/research/2026-09-26-writing-replication/anonymized/blind/` are unread, and the content harness
(`plugins/terse/evals/content.md`) has only compared candidate edits, never `clarity` against no skill.

**Issue text.** After some weeks of use, sample new sessions and count objections per genre and aspect with #20's
labels against its baseline; read the blind pairs; and run the content harness's no-plugin baseline on everyday
cases.
