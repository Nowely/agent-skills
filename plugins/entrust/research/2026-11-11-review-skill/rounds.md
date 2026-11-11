# Formative rounds

One private target, one fresh reviewer per round. The review instructions changed between most rounds; all observations are static and omit identifying details. “Contract” means the reviewer established the applicable source, “conditional” means it identified relevant evidence but left applicability unresolved. “Structure” is a judgment about a concrete maintenance task, not a line-count metric.

| Round | Contract | Structure |
| --- | --- | --- |
| 1 | established | no actionable structural recommendation |
| 2 | unresolved | responsibilities noted, no recommendation |
| 3 | conditional | no actionable structural recommendation |
| 4 | unresolved | no actionable structural recommendation |
| 5 | conditional | cross-boundary duplication noted |
| 6 | conditional | named rule boundaries proposed with a maintenance rationale |
| 7 | established | boundaries examined; no split recommended |
| 8 | unresolved | boundaries examined; no split recommended |
| 9 | conditional | boundaries examined; no split recommended |
| 10 | conditional | boundaries examined; no split recommended |

These observations are not a controlled comparison. The final outcome is not a mandatory template for reviewers. The private source material is not published; findings above should not be treated as a benchmark for another codebase.

## Fictional-fixture pilot

One independent `gpt-6.1-terra` reviewer at requested effort `xhigh` read the candidate skill, the positive case brief and change, without its rubric, execution, or prior reviews. The skill SHA-256 was `f5e30d7eb57121ce0f86d8a833837ea47dc18f450d1d4cdb3b7a9b8c264a7019`. The reviewer identified the changed saved text and repeated normalization, and did not require extracting the cohesive validation rules. Those observations match the hidden rubric. The reviewer also named boundary-test examples; no tests were run.

This is one candidate-only run of one fictional case, not a before/after measurement or evidence of general reliability. The baseline and negative case remain unrun.

## Round 11: Sonnet pilot

Draft 11 against draft 10 on the instrument's `delayed-label` case, one review each. Each reviewer was a Claude Code subagent on Sonnet at its default effort, given the prompt `evals/review/prepare.mjs` printed and nothing else; no code was run. One judge on Opus, the same model family at a higher tier, graded both reviews by `evals/review/judge.md` under run ids that do not name the arm. The reviews, the manifest with the instruction digests and the verdicts are in [sonnet-pilot](sonnet-pilot/); the table is `node evals/review/score.mjs` over that directory.

| Arm | Case | Runs | Hit / partial / miss | Recall | Traps violated | Other valid | Unsupported | Words per review |
|---|---|---|---|---|---|---|---|---|
| draft-11 | delayed-label | 1 | 6 / 0 / 0 | 1.00 | 0 | 0 | 0 | 860 |
| draft-10 | delayed-label | 1 | 6 / 0 / 0 | 1.00 | 0 | 0 | 1 | 786 |

Both reviews found all six items and stepped into neither trap; each said the null check on the promised date is required. Draft 10's one unsupported claim is a remark on style. Regressions against draft 10: none observed, in one run.

What this is not. Two runs of one case measure no difference between the drafts, and with every item found there was none to measure: the case is too easy for Sonnet under either draft. No control arm ran, so nothing here says the instructions were needed. Seven more runs were prepared and never started: the other two cases and the control arm on all three. The reviewer model's exact version and effort are whatever the subagent route resolved; the route does not report them.

