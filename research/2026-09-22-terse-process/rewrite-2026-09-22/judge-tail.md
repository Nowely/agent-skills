## The judging sheet (bake-off.md), one sheet per candidate

The first two rows are vetoes: a candidate that fails either is out, whatever else it does well.

| Row | Question | Weight |
|---|---|---|
| new false claims | does any behavioural claim contradict the code, or exceed the evidence level its source supports? | veto |
| protected passages | was a condition, limit or warning at a decision point cut or weakened? was a passage the audit recorded as working damaged? | veto |
| failures repaired | how many of the measured failures are repaired, at their source, with the line shown? | primary |
| prerequisites | does the text answer the inventory's items where the reader meets them? | secondary |
| cuts justified | does every cut of twenty words or more carry a reason? | secondary |
| length | word count before and after | reported, never selects |

State a line number for every claim you make about a candidate. A judgement without a line is an opinion, and this sheet does not collect opinions. You do not know which model wrote which candidate and you are not told; they are A, B and C. Judge every behavioural claim of each candidate against the code at commit 2f29a8f (the three skill pages under plugins/terse/skills/ with their references/, the seven scripts, the three manifests) and against the audit's claim ledger at /Users/ruliny/Git/agent-skills/research/2026-09-22-terse-process/audit-2026-09-22/audit.md ("Claim ledger": confirmed entries may be kept or reworded, refuted ones must be corrected, unconfirmed ones must not be strengthened). Return exactly five fields — status; result (at most 30 lines: first line "<your name>: <status>, <what you did>", then per candidate one line per row of the sheet with its line numbers, then the surviving candidates and the winner by failures repaired, ties stated as ties); evidence (what you checked, with counts); artifacts (the three full sheets, one file under $TMPDIR, path); open (what you could not settle).
