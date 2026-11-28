# Rounds

Rounds of PR 120's work, in order. Findings are what the round's reader reported against the text or run it read;
a regression is a finding that a later round traced to the text an earlier round's fix wrote or moved. The critics'
and verifiers' returns are not kept in this folder; this record carries their counts and verdicts. Where a return
does not separate a count, the cell says so instead of guessing.

| Round | Reader and input | Findings | Regressions |
|---|---|---|---|
| 1 | The review of `c435d99`, by the coordinator, read against the owner's direction | 12 items and 5 decisions put to the review (a to e) | 0, first round |
| 2 | Quality critic on the text after the review's fixes | 31: 2 blocking, 17 should, 12 could | not separated in its return |
| 3 | Verifier of the fixes to round 2's findings, over 7 commits | 3 not fully answered (2 partly, 1 not) of 32 marks, and 8 new contradictions or gaps | 8 of 8 new ones sit in a sentence a round-2 fix wrote; 0 marks made worse |
| 4 | Verifier of the dispositions file, 76 lines | 18: 16 part, 2 do not hold | not traced in its return |
| 5 | Architecture critic on whether the body should be rebuilt | verdict `change approach`: 1 gap (Change's finish not reached) | 0 |
| 6 | The rebalance (two commits) read by a verifier: moved rules, Change's step 9, the selection check, the description | 11: 5 in the moved rules (2 part, 3 unreached by any link), 4 differences between step 9 and Create's steps 7 to 10, 2 contradictions in the selection check | 11 of 11 lie in text the rebalance moved or wrote |
| 7 | Architecture critic on why Change sessions skip the finish | verdict `change approach`: 1 (the cause lies at the plan, not at the finish) | 0 |
| 8 | Trial, Change and Create sessions, one a side, on the head before the plan sentence | 2 counted `false` (no quality critic, no close-out) in the Change session; the Create session held; 2 more reported | 0 |
| 9 | Trial, a second Change session, on the head with the plan sentence | 2 counted `false` (the judges were put as a question; none started) | 0; the sentence did not hold and was taken out |
| 10 | Selection check, first batch (3 requests meant, 3 near misses) | void: the set's writer had read the description | not applicable |
| 11 | Selection check, second batch, a fresh set | 1 (a request to create a skill went to a rival) | 0 |
| 12 | Critic of direction, on the branch head | verdict `change direction`; not itemised | 0 |
| 13 | Audit of the coordinator's work after a compaction | 5 findings, plus 4 rows part or not met in its tables | 0 |
