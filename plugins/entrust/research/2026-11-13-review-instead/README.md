# Review after the baseline: drafts 24 and 25

## Question

Does a review recommend removing an unnecessary mechanism more often when its record must say, for every mechanism the change brings in, where the same thing is already available?

## Why this change

Before [round 6](round-6/README.md), the released baseline, [draft 23](../2026-11-13-review-baseline/README.md), had not been run. Earlier work showed one failure that repeated:

- On a private change, reviews with and without the skill each proposed removing a redundant lookup in 1 of 2 runs ([round 4](https://github.com/Nowely/agent-skills/pull/95#issuecomment-6834922569)); drafts 20, 21 and 22 gave 1, 2 and 1 of 2 ([round 5](../2026-11-13-review-baseline/rounds.md)).
- On `slot-edit`, three reviewers without the skill opened the installed client's contract, which says the order carries its zone whole, and none reported the lookup as unnecessary.

The reviewers read the fact and did not put the question to it. Draft 23 asks the question in one sentence of the necessity pass and stores the answer, if any, inside a mechanism's `basis`, mixed with the requirement that asks for the mechanism. A mechanism that serves a requirement therefore looks justified whether or not the code needed to obtain anything.

## What draft 24 changes

One thing. A mechanism that is `added` or `changed` has a field of its own, `instead`: where what it obtains or does is already available, with the place read, or the places read that do not supply it. The check refuses a record without it, the page and the printout show it as "Already available", and the necessity pass settles it from the code and the installed contracts, not from the change's own reason. Three sentences that repeated a rule stated elsewhere on the page were removed to keep the page within its size limit; no rule was dropped.

The drafts are [the page](drafts/24-instead.md) and [its data contract](drafts/24-instead-data.md), as committed. Their relative links resolve in the installed layout.

A record written with 0.37.0 that lists an added or changed mechanism without `instead` no longer passes the check. This is deliberate for the comparison and is to be decided again before a release.

## Draft 25: the answer cites what was read

Draft 24 let `instead` be any text, so "nothing else does this" passed. In draft 25 the check refuses an `instead` that cites no `path:line`: an answer that something is available names where, and an answer that nothing is names what was read. The page is draft 24's, unchanged; [the data contract](drafts/25-cited-data.md) and the check differ. No review was run with draft 24, so draft 25 was the candidate arm in round 6.

## Known gaps, left for a later draft

- A mechanism is tied to units, not to blocks, and its `decision` is free text. Nothing checks that a mechanism the review decides to remove has its lines marked `remove`, or that what existed only for it goes too. Round 5 found records that passed the check and contradicted themselves this way.
- If the reviewer does not list a mechanism, `instead` is never asked of it. The first column of `blocks.mjs` is a keyword-based screening signal; source reading is still needed to establish an omission.
- The format of a record tells a judge which arm wrote it.

Each is a second change. They wait until the round shows where the chain breaks: at listing, at finding what is already there, at marking the lines, or at the implementer.

## How to tell

The [next-round protocol](protocol.md) supersedes the earlier broad comparison plan: compare draft 23 and draft 25 on the original private flawed snapshot, three fresh reviews per arm, with complete matching skill packages. Follow every completed review with an isolated implementation and have Carbon and GLM judge independently. Neither the later real snapshot nor synthetic clean variants are targets in this round. The protocol defines responsibilities, source parity, metric limitations and two-judge aggregation.

`blocks.mjs` reports deterministic keyword matches and line dispositions where a frozen line rubric exists. Its matches can be false positives as well as false negatives; a match is not proof that the reviewer recognized an existing alternative. Deletions do not measure decomposition or architecture. Judge the supported target and resulting patch separately.

Draft 25 earns its extra field only if it produces useful, supported simplification while preserving required behavior and reducing a concrete reasoning/change burden. More completed fields or keyword matches alone are insufficient. A small or mixed result remains inconclusive; compatibility with released reports is still to be decided before release.

## Status

[Round 6 is complete](round-6/README.md): six Terra reviews, six isolated implementations, and independent
Carbon/GLM judgments on the original flawed snapshot. Both arms recommended the same removal in 3/3 runs;
all six implementations produced byte-identical core logic. Both judges support all three code-quality
dimensions in every run. Strict overall support is 2/3 for draft 23 and 3/3 for draft 25 because Carbon left
one baseline test's unused import/tooling consequence unresolved. This is not an architectural win for draft 25.

The coordinator recommends keeping 23 as the released baseline and not promoting mandatory `instead` on these
results. The candidate implementation remains unchanged pending the owner's decision. Corrected synthetic
cases remain unadmitted/deferred; no clean-target round was run. Methodology and results share the same
[PR comment](https://github.com/Nowely/agent-skills/pull/96#issuecomment-6847216007).

## Draft 26 prepared after the owner/Carbon discussion

The owner accepts schema breaks and uses the skill personally; draft 25 is now the working reference, while
23 remains the released/historical baseline. This does not rewrite the round-6 results or claim that 25 won.
[Draft 26](drafts/26-structure.md) strengthens source-backed mechanism costs and readable domain-rule ownership,
with [one positive example and one empty split](drafts/26-structure-examples.md). No JSON fields or runtime
scripts change. The [criteria](quality-criteria-26.md) assess remaining quality dimensions separately; the
[preparation/next-pilot plan](draft26-plan.md) records Carbon's advice, the coordinator's qualifications and
the conditional workload comparison. [Validation and hashes](draft26-validation.json) preserve what was checked.

Draft 26 has not been run with a model and is not the shipping entrypoint. The candidate passed all eight
repository skill-document checks in an isolated installed layout. The generic skill-creator validator rejects
the existing explicit-invocation frontmatter; that policy was preserved, not removed to satisfy its allowlist.

## Current pilot and optional controls

The [corrected draft-27 control plan](draft27-controls.md), agreed with Carbon, is the current proposal for the
next launch. It uses three candidate reviews and two independent judge sessions (five total), with semantic
joint-evidence criteria. Additional attribution, clean-reference and familiar-case controls are optional and
separately priced. No clean target enters the immediate round automatically; safety on such inputs remains
unmeasured. The [original control proposal](draft26-controls.md) and [draft-26 plan](draft26-plan.md) remain
historical records, not the current launch recipe. [Agreement and verification](draft27-controls-agreement.md)
records the corrections. Those optional control runs have not started; the separate round-7 diagnostic is recorded below.

## Draft 27: a preference does not replace a shown cost

Draft 26 was read again before any run and three faults were found in it. [Draft 27](drafts/27-shown-cost.md) with [its examples](drafts/27-shown-cost-examples.md) corrects them and changes nothing else; draft 26 stays as written and was not run.

- **A stated preference was enough for a finding.** Draft 26 said a declared readability standard supports a judgment, and that a shape preference is an idea only when it has neither a standard nor a shown cost. The skill declares the standard itself, so every reviewer could cite it and ask for a coordinator with named rules with nothing shown. In draft 27 the preference picks among arrangements once a reading burden is shown and does not stand in for showing one.
- **The examples named features of the pilot's task.** A sentence on a file called `utils` and one on a timer as an optional convenience describe the private change the pilot runs on and what its owner later decided. A reviewer of that change would be handed the expected finding. Both sentences are gone; the general rule on an unrequested convenience stays on the page.
- **Nothing showed ordered rules that stay together.** The example of a split not worth making was two conditions in one expression, so anything larger looked like the case for extraction. Draft 27 adds a function of four ordered guards with a small calculation inside one, whose verdict is `keep`.

The list of signs of entanglement also regains the one the positive example rests on, a caller interpreting another unit's partial result.

Checked as draft 26 was: substituted into the installed layout, all eight skill-document checks pass; the entrypoint is 20,114 bytes against draft 26's 20,093. In the pilot and in [its controls](draft27-controls.md), draft 27 takes draft 26's place. Not run.


## Draft 28: related-value consistency and visual-work scope

[Draft 28 preparation](draft28-notes.md) adds a bounded peer-consistency check and question-driven visual
evidence guidance, plus the fictional `locale-options` case. Carbon's three requested corrections were applied.
The data contract keeps images optional, reuses task artifacts and does not create screenshot work merely for
report completeness. The case is mechanically checked but unmeasured with models and is not automatically
added to the frozen draft27 pilot. The shipping skill and earlier drafts remain unchanged.

[Draft28 checks and file hashes](draft28-validation.json) record the deterministic verification and instruction size.

## Round 7: full versus reduced line allocation

[Round 7](round-7/README.md) is complete: three fresh Terra reviews per arm, with independent Carbon and GLM
assessment. All six found the same redundant mechanism and proposed the same target. Removing mandatory
line allocation did not produce additional decomposition or a reliable smaller/faster report. Keep the full
working method; the shipping skill and frozen earlier rounds are unchanged.

## Round 8: related-value consistency

[Round 8](round-8/README.md) is complete: two Terra reviews each with full draft25 and draft28, independently
judged by Carbon and GLM on locale-options/head. Both variants detect the consistency defect and test gap in
both runs, without the tested harmful recommendations. Decomposition is explicitly not applicable; this is
not an architecture result. No incremental detection benefit from draft28 was observed on this formative
case. [Existing decomposition cases](round-8/decomposition-readiness.md) were inspected, not run or changed.

## Round 9: responsibility boundaries and actionable targets

[Round 9](round-9/README.md) is complete: two Terra reviews per full draft25/draft28 package on contact-import-v2,
with independent Carbon and GLM assessment. Both support actionable targets (D2) in all four; design diagnosis
depth (D1) is disputed, not averaged. Each arm proposes one pure-helper target and one inline phased target.
No incremental advantage for draft28 or implemented architectural recovery is claimed. The skill remains unchanged.
