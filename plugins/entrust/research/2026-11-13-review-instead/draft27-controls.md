# Draft 27 pilot and optional controls

This is the current next-launch proposal. It supersedes the launch order, gates and package selection in
[draft26-controls.md](draft26-controls.md) and [draft26-plan.md](draft26-plan.md), retained as historical
proposals. No new experimental reviews or implementations have started. Draft 27 is the candidate; draft 25 is the working reference. Historical drafts and round-6
judgments remain frozen. The owner excluded clean targets from the immediate next round; the controls below
are a menu of separately scoped questions, not an automatically authorized campaign.

## Immediate question and pilot

Can draft 27 produce useful source-supported improvements beyond the already-found lookup removal on the
original flawed snapshot? Run three fresh reviews with the same source/task packet and model/effort as round 6.
Reassess the three preserved draft-25 reviews and the three candidate reviews under the same [evidence dimensions](quality-criteria-26.md#per-dimension-evidence),
keeping prior scores separately. Carbon and GLM independently receive all six reviews in the same randomized
packet, without arm labels or run timestamps. Relocate identifying artifact-root paths, but retain repository-relative
source paths and line citations needed to verify claims. They do not see each other's ratings; format may reveal an arm.
This phase is **3 reviewer + 2 judge sessions = 5**.

A review counts toward the two-of-three gate only when both judges support retention of the baseline diagnosis
and remedy, support the **same** new actionable item beyond it in mechanism cost, readable ownership or
contract-driven simplification, and uphold no material unsupported destructive recommendation in that review.
Each credited item needs a source-supported premise, consequence and concrete target or owner tradeoff.
Keyword matches, citation syntax, longer reports and lines marked `remove` do not establish it; a vague
question does not count. Missing evidence and disagreement stay visible, not averaged into a pass.

Advance only with at least two credited candidate reviews and no upheld or unresolved material-harm warning. Any
jointly upheld material destructive recommendation holds the implementation/promotion decision for examination,
not automatic launch. A single-judge material-harm warning is unresolved until checked; do not silently treat
it as a jointly established defect or discard it. There is no quota that excuses one harmful recommendation.

Report each quality dimension separately. A justified cohesive structure is valid; an extra helper is not a
success criterion. This gate selects further work in a small pilot; it does not prove reliability or safety on
already-good code. The owner already excluded clean targets from this immediate round; carry that untested
property into any later promotion decision without adding a new mandatory clean-code gate or waiver ceremony.
If the signal is weak, stop before implementations. If it is useful, propose applying all
three candidate reviews, including any weaker review that lacks a new useful item but has no upheld or unresolved
material-harm warning, with two fresh judge assessments of the resulting patches
against the preserved baseline outputs: **3 implementer + 2 judge sessions = 5 more**. Do not silently schedule
that phase or cherry-pick only successful reviews.

## Optional questions, not prerequisites for the immediate pilot

| Control | What it can answer | Targets and arms | Review/implementation sessions | Judge sessions | Total |
| --- | --- | --- | ---: | ---: | ---: |
| A1: unaided reviews | Whether no-skill review finds the supported improvement | Original flawed packet; 3 no-skill reviews | 3 | 2 | 5 |
| A2: unaided implementation | Whether task-only implementation makes the supported improvement | Original flawed packet; 3 task-only implementations | 3 | 2 | 5 |
| B: harm on reference solutions | Whether 27 produces unsupported changes more often than 25 on these particular reference forms | `slot-edit/clean`, `profile-phone/clean`; 25 and 27, three repetitions per cell | 12 | 4 | 16 |
| C: familiar-case regression | Whether the tested instructions differ on a known motivating case | `slot-edit/head`; control, 23, 25 and 27, three repetitions per arm | 12 | 2 | 14 |

Each row requires a separate launch decision tied to a remaining question. B is deferred under the owner's
current scope. C does not run regardless of the pilot result; first identify what decision it would inform.
No implementer stage for B/C is included in these totals; if proposed later, specify its runs and judging cost.
Running the immediate review phase plus A/B/C would be **45 substantive sessions** (33 reviewer/implementer runs + 12 judge sessions);
adding the immediate pilot's implementation/judging phase would make 50.
A1 and A2 use separate assessment packets; B uses one packet per case, each read by both judges.
Combining unlike rubrics into fewer judge sessions would be a different explicitly priced design, not the
count used here. These sums exclude transport, format-correction retries and any separately approved later work. They are not a recommended launch queue.

### A: attribution limits

If unaided participants solve the task too, this packet may not discriminate the skill's added contribution
on that outcome. It does not prove that the packet caused earlier improvements or that the skill has no value.
No-skill and task-only answer different questions; keep their results separate. A is useful for attribution,
but is not logically required to compare 27 with the working instruction on the remaining quality gap.

### B: evidence of harm, not a deletion quota

Assess unsupported recommendations, violated required behavior and demonstrated unnecessary complexity with
source evidence. The two judges independently assess validity and materiality; preserve their raw rulings
and disagreements. A form named `clean` is a reference, not an oracle: a real defect or worthwhile alternative
may still be found. Rewriting/removing a line is not itself harm, and keeping all lines is not proof of safety.
Use `blocks.mjs` to locate proposals worth inspecting, never as a veto on a valid refactor.
Compare jointly upheld material harmful recommendations against draft 25 on the same cases; 27 should not
increase material harm. Investigate any newly introduced harm pattern before promotion, instead of excusing
it with an arbitrary extra-violation quota. A single-judge warning remains unresolved rather than disappearing.

### C: no held-out transfer claim

`slot-edit` already informed the development of `instead` and the research discussion. It is a familiar
regression/diagnostic case, not an independent held-out transfer test. A genuinely unseen case must be chosen
and frozen separately before adapting instructions to it; no such extra case is scheduled here.
If the question only compares two instructions, select that pair before launch: 6 reviews + 2 judge sessions = 8, instead of the full 14.

Judge the claimed existing alternative and proposed removal semantically: the actual contract, required
behavior preserved and dependent machinery removed. Keyword columns can overcount or undercount. F2/F3 and
the design criterion can help organize evidence, but a raw keyword or line-marking increase does not justify
keeping `instead`. A claimed algorithmic advantage needs a repeatable increase in supported actionable
recommendations/outcomes without extra material harm.
If three runs show no clear difference, call the result inconclusive. With one consumer and no external schema
constraint, the owner may keep `instead` for readability or drop it to reduce reporting work as a product choice,
without claiming proven gains or uselessness.

## Exact packages and launch preparation

- Draft 23: complete release package at `entrust@0.37.0` / `325394a3a8871f8f2a50c9709082348c60a96440`.
- Draft 25: complete package at `9ee0189c365024519bae92649610aada25d4cd21`.
- Draft 27: that draft-25 package, replacing `skills/review/SKILL.md` with `drafts/27-shown-cost.md` and
  placing `drafts/27-shown-cost-examples.md` at `skills/review/references/structure-examples.md`, both frozen at
  `d9bb70a49f8a959c92b89e6ea1f05d98aa4a4347`. Keep draft25's data contract and scripts. Label this arm `draft-27`.
- Before launching, record all copied-file hashes and the source/task identity, and check each report only with
  its matching package. The examples file is absent from the base package and is added by this assembly.
  No relabelling of a draft-26 file as draft 27. Evaluation rubrics stay out of reviewer
  packets. Compare against the same supplied requirements, not unsupplied later owner decisions.
- For approved synthetic cells only, `round.mjs` prepares both variants of every selected case/arm. Select the
  approved case/variant/arm cells in a frozen manifest **before dispatch**, retain the full generation manifest
  and record excluded cells as not launched. Never drop failed or inconvenient results after they are seen.
- Give reviewers a permitted artifact directory. Save original review data/text and every started attempt.
  Send both judges the same packet with anonymized IDs and the same rubric; preserve their individual outputs.
  `outcome.mjs` accepts one judge file at a time, so save both results separately and join by run ID. An unknown
  or disputed result is not a jointly supported one. Include judging sessions in every proposed cost total.
