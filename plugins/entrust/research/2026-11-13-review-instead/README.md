# Review after the baseline: drafts 24 and 25

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

## Draft 25: the answer cites what was read

Draft 24 let `instead` be any text, so "nothing else does this" passed. In draft 25 the check refuses an `instead` that cites no `path:line`: an answer that something is available names where, and an answer that nothing is names what was read. The page is draft 24's, unchanged; [the data contract](drafts/25-cited-data.md) and the check differ. No review was run with draft 24, so draft 25 is the arm to run.

## Known gaps, left for a later draft

- A mechanism is tied to units, not to blocks, and its `decision` is free text. Nothing checks that a mechanism the review decides to remove has its lines marked `remove`, or that what existed only for it goes too. Round 5 found records that passed the check and contradicted themselves this way.
- If the reviewer does not list a mechanism, `instead` is never asked of it. The first column of `blocks.mjs` is a keyword-based screening signal; source reading is still needed to establish an omission.
- The format of a record tells a judge which arm wrote it.

Each is a second change. They wait until the round shows where the chain breaks: at listing, at finding what is already there, at marking the lines, or at the implementer.

## How to tell

The [next-round protocol](protocol.md) supersedes the earlier broad comparison plan: compare draft 23 and draft 25 on the original private flawed snapshot, three fresh reviews per arm, with complete matching skill packages. Follow every completed review with an isolated implementation and have Astra and GLM judge independently. Neither the later real snapshot nor synthetic clean variants are targets in this round. The protocol defines responsibilities, source parity, metric limitations and two-judge aggregation.

`blocks.mjs` reports deterministic keyword matches and line dispositions where a frozen line rubric exists. Its matches can be false positives as well as false negatives; a match is not proof that the reviewer recognized an existing alternative. Deletions do not measure decomposition or architecture. Judge the supported target and resulting patch separately.

Draft 25 earns its extra field only if it produces useful, supported simplification while preserving required behavior and reducing a concrete reasoning/change burden. More completed fields or keyword matches alone are insufficient. A small or mixed result remains inconclusive; compatibility with released reports is still to be decided before release.

## Status

Protocol updated; no new model runs started. No review has been written with draft 24 or 25, and the corrected `slot-edit` and `profile-phone` remain unadmitted and deferred. Progress and results will be maintained in one new English comment on PR #96.
