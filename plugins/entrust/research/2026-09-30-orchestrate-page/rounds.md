# Rounds

Each round of the page, the findings on it and how many of them were regressions against main. Hashes are the
branch's after its rebase onto main cf6f92f.

| Round | Commits | Checked by | Findings | Regressions against main |
| --- | --- | --- | --- | --- |
| 1, the cut | 8867b23, ae3aee9, 65afa5c | removed-lines.mjs, Opus V2, Sonnet R1, Fable L4, run-all | 11 fix items | 4: the survivors check at exit 10, the finding rule's scope, the judge's `EXPECT:` rule, the writers-collided pointer |
| 2, fixes | 79d55c7, d45b13a | Fable L4, the touched suites | 1: the repair of "is neither" was false | 1, introduced by the round's own fix |
| 3, fixes | 694c73e | the coordinator: the touched suites, `evals/skills.test.mjs`, removed-lines.mjs; Opus C1 | 0 | 0 |
| 4, owner-approved additions and the rebase | f469001, efee7b7, 681f6e5, 4a97186, 67ea343 | the six touched suites, `evals/skills.test.mjs` 8 of 8, removed-lines.mjs; Opus C1's second read | 1: the `FILE=missing` row still restates the relaunch precondition that the codex run moved to its `references/approvals.md#after-the-run` | 0 |
