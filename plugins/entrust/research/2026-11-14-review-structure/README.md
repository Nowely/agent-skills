# Review of structure: draft 30

## Question

Does a review lead a tangled solution to a better-decomposed one when it must show the cost of the structure as a change of the task walked through the code, and when "smallest" means the result rather than the diff?

## Why

[Draft 29](../2026-11-13-review-instead/drafts/29-integrated.md), the baseline merged in #96, removes unnecessary mechanisms when the facts are at hand and explains test gaps better than the model alone. It does not reach the goal the skill was written for. In [round 11](../2026-11-13-review-instead/round-11/README.md), the first comparison with an unaided arm since round 4, no review in either arm showed the reading or change cost of a structure apart from its bugs; round 9's judge downgraded design diagnoses justified by runtime correctness. And what the reviews did propose rarely reached the code: in round 6 all six implementations were byte-identical, and in round 10 an implementer declined the suggested planning helper.

Two causes are taken as hypotheses:

1. **The cost has no procedure.** Draft 20 asked the reviewer to take each rule and requirement as the one that changes and note what must be read and edited. Draft 21 dropped it; since then the page has asked for the cost without a way to find it. Knowing a principle is not using it.
2. **Least action, read as the smallest diff.** The skill opened with "the smallest clean solution"; the instrument's implementer is told to leave nothing the task does not need. The owner's constitution splits a change into parts and treats one without a requirement behind it as an optional initiative (§5), though it also says to minimize concepts, not lines (§4). The owner's `ponytail` skill fires unasked when a solution outgrows the minimum, with an abstraction with one caller as its first example, and says the shortest working diff wins. Removal passes all of these; restructuring looks like excess change.

## What draft 30 changes

- **Cleanest means the result.** Fewest concepts, one owner per rule and the fewest places a likely change must touch. Code the change wrote may be reshaped toward the target; code it did not touch stays, and a problem there is pre-existing.
- **A design standard as procedure.** [`design-standard.md`](drafts/30-design-standard.md), read for every review: twelve principles from Parnas, Ousterhout, Fowler and Beck, each with how a change shows it broken and what is not a violation; the sides it takes where the literature disagrees (deep modules over small functions; duplication of a rule, not of look-alike code; phases that own their knowledge); and the order for comparing two solutions. Behavior is the entry condition; then fewer scenarios that edit several places that must agree; then less to read; then fewer concepts; size last.
- **Scenarios, written before the target.** Two or three changes derived from the requirements and the deciding units' rules, one of them already local in the code as written, each with the places to edit and the code to read now and in the target. They go in `review.json` as `scenarios` and are drawn as "Changes tried".
- **A boundary earns its place.** One that makes no scenario more local leaves the target. This is the constitution's omission test asked of changeability: which named change stops being local without it.
- **A design finding** names its scenarios, one of which edits or reads fewer places in the target than now; the check refuses it otherwise. It must still stand if every behavior finding were fixed in place.
- **Every unit of the change carries a `reason`**, a kept one included, so a unit considered and kept differs from one not considered.
- **A structural step names its scenario**, so an implementer who keeps to the smallest diff sees why the part is required.

Drafts: [the page](drafts/30-scenarios.md), [its data contract](drafts/30-scenarios-data.md), [the design standard](drafts/30-design-standard.md); the structural examples are [draft 27's](../2026-11-13-review-instead/drafts/27-shown-cost-examples.md), unchanged. Their links resolve in the installed layout. A record written with draft 29 that lists units of the change no longer passes the check: it has no `scenarios` and its units no `reason`. The owner accepts schema breaks.

## How to tell

Synthetic cases written beside the drafts are at the ceiling; they stay as regression checks, not as the measure.

1. **Real pairs.** From the owner's history, three to five changes that a person later simplified: the first solution, the task, and the later form as the hidden reference. Freeze each packet durably before any run, with the installed dependencies; the round-6 packet was lost and cannot be rebuilt.
2. **One held-out synthetic case** for the design half alone: behavior correct, structure tangled, with a clean counterpart, written by someone who has not read draft 30.
3. **Arms.** `control`, draft 29 and draft 30 reviewers, same model, effort and tools. For each review, two implementers: one with `ponytail` and the constitution as the owner normally runs them, one without `ponytail`. Record which user skills and instructions each session loaded, from its tool records.
4. **Measures, kept apart.**
   - Review: does each design finding rest on a scenario a judge confirms against the source; does the review keep code that is already sound (the clean counterpart and the scenario that is already local).
   - Code: hidden probes on the implementations, ruled `local`, `between` or `tangled` by two judges who do not see each other's rulings; behavior by the case's checks; and whether the implementer made the structural part the review asked for.
   - Cost: time and tokens per review.
5. **Reading.** Draft 30 is worth keeping if its implementations take more probes locally than draft 29's without losing behavior or reshaping sound code. If that happens only without `ponytail`, the instruction works and the environment blocks it; the remedy is then in the constitution's §5 and `ponytail`, not in the review. If draft 30 equals draft 29, the scenarios are weight and go.

## Status

Not run. No review has been written with draft 30. Offline checks pass: skill pages 8, report 17, review instrument 14, packaging 21 with one pre-tag skip.
