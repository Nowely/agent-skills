# Defects found in passing: terse

Recorded per the repository rule: evidence at file:line, an evidence level (1: the line resolves; 2: an
independent reader of the code would say the same; 3: the behaviour was made to happen), and wording that
can become an issue unchanged. An entry leaves when its fix lands and the changelog names it. Ids are
shared with entrust's ledger, `plugins/entrust/ISSUES.md`, so one id names one entry in both. A path
pinned to a commit is that commit's address, with today's beside it.

## E73. Whether `clarity` reduces objections, or improves the texts, is not measured

**Evidence, level 1.** Issue #20 ("How to measure it") sets a baseline of 115 records, 73 of them objections,
over 61 sessions in 30 days, and asks for objections per genre and aspect after adoption. The only counter,
`plugins/terse/evals/clarity-trigger.count.mjs`, counts invocations. The blind pairs in
`plugins/terse/research/2026-09-26-writing-replication/anonymized/blind/` are unread, and the content harness
(`plugins/terse/evals/content.md`) has only compared candidate edits, never `clarity` against no skill.

**Issue text.** After some weeks of use, sample new sessions and count objections per genre and aspect with #20's
labels against its baseline; read the blind pairs; and run the content harness's no-plugin baseline on everyday
cases.
