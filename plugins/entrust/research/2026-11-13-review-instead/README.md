# Review after the baseline: draft 24

## Question

Does a review recommend removing an unnecessary mechanism more often when its record must say, for every mechanism the change brings in, where the same thing is already available?

## Why this change

The released baseline, [draft 23](../2026-11-13-review-baseline/README.md), was never run. What was run before it shows one failure that repeats:

- On a private change, reviews with and without the skill each proposed removing a redundant lookup in 1 of 2 runs ([round 4](https://github.com/Nowely/agent-skills/pull/95#issuecomment-6834922569)); drafts 20, 21 and 22 gave 1, 2 and 1 of 2 ([round 5](../2026-11-13-review-baseline/rounds.md)).
- On `slot-edit`, three reviewers without the skill opened the installed client's contract, which says the order carries its zone whole, and none reported the lookup as unnecessary.

The reviewers read the fact and did not put the question to it. Draft 23 asks the question in one sentence of the necessity pass and stores the answer, if any, inside a mechanism's `basis`, mixed with the requirement that asks for the mechanism. A mechanism that serves a requirement therefore looks justified whether or not the code needed to obtain anything.

## What draft 24 changes

One thing. A mechanism that is `added` or `changed` has a field of its own, `instead`: where what it obtains or does is already available, with the place read, or the places read that do not supply it. The check refuses a record without it, the page and the printout show it as "Already available", and the necessity pass settles it from the code and the installed contracts, not from the change's own reason. Three sentences that repeated a rule stated elsewhere on the page were removed to keep the page within its size limit; no rule was dropped.

The drafts are [the page](drafts/24-instead.md) and [its data contract](drafts/24-instead-data.md), as committed. Their relative links resolve in the installed layout.

A record written with 0.37.0 that lists an added or changed mechanism without `instead` no longer passes the check. This is deliberate for the comparison and is to be decided again before a release.

## How to tell

Compare `control`, 0.37.0 (draft 23) and draft 24 on the admitted cases of [the instrument](../../evals/review/README.md), same model and effort:

1. `blocks.mjs`: the superfluous lines each review's record marks `remove`, and the needed or clean lines it marks `remove`. No judge; drafts 23 and 24 only, since a control has no record.
2. `outcome.mjs`: what an implementer leaves after each review, against `task-only`.
3. The judge's rubric, for what the two above cannot see.

Draft 24 is worth keeping if it marks more of the superfluous lines than draft 23 without marking more needed or clean ones, and its implementers recover more. If the two drafts do not differ, the field is weight and goes.

## Status

Not run. No review has been written with draft 24, and the corrected `slot-edit` and `profile-phone` have not been admitted.
