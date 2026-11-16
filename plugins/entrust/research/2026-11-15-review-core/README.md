# Review core: drafts 32 to 36

## Question

Can the review skill do what it is for, leading a tangled or bloated change to a clean one, with less reading and with fresh agents breaking the reviewer's anchoring on the author's structure?

## Why

Three independent reviews of the skill as merged in #97 (a product review by an Opus-class model, a critic of the coordinator's recommendations and a methods review, both Sonnet-class) agreed on the state:

- **Demonstrated, weakly:** necessity findings and test-gap explanations a directed reviewer without the skill misses (rounds 11 and 17 of [the first study](../2026-11-11-review-skill/README.md), [round 11](../2026-11-13-review-instead/round-11/README.md) of the second). The margin is shrinking: the model alone now finds the main behavior defects.
- **Not demonstrated in any run:** leading a tangled real change to a decomposed one. Reviewers find bugs and needless lookups and accept the author's structure. The installed-dependency contract was not established on the real change in four rounds.
- **Load:** 7,627 words read for every review, about a third of it mechanics a script can do (line ranges, coverage, digests, preservation), patches written for single past runs, duplicates (the same rule stated up to eight times) and hedges. The page sat at the compaction limit.
- **Cost without evidence:** the complete line map was most of the 2.2× time of a recorded review; multi mode cost two to six times the tokens for one extra finding; the plan gate stopped four of four pilot reviews.
- **Method:** every comparison had one or two runs per cell, synthetic cases written beside the drafts reached the ceiling, the no-skill control's prompt named the review directions, and several things changed per arm. Further A/B runs of wording would not separate drafts.

## Owner's decisions

- Keep the plan and its approval: a review is heavy, and the owner wants to see what will be done, with which inputs and mode. The plan shows each choice with its alternative.
- Add the option to run the review in a subagent with the working session as conductor.
- Fresh agents are on by default (critic and verifier; the independent target followed from the critic of this draft). The owner asked to use subagents actively as critics, verifiers and helpers.
- The full record and its page stay the default result.
- No freeze of features, no split of the pull request; evaluation by real use, lazily, later.

## What draft 32 changes

- **Plan:** mode, where, checks, result, agents (count, model, who starts them), scope. A choice is fixed when the user names it or asks for the defaults.
- **Agents** ([brief](drafts/32-agents.md)): an independent target from the task and the base code, never the change; scouts; a critic given the requirements with their sources and the block verdicts, ranking five points both ways and walking one grounded change through another arrangement of the busiest unit; a verifier of factual claims. A point is rejected only on a refuting place; otherwise it goes to the owner. The session that can start agents starts them all.
- **Scaffold:** `report.mjs scaffold` writes the diff's identity, a saved diff and declaration-sized blocks at the start of the analysis; uncommitted work becomes a snapshot with its new files. `check` refuses another diff and warns on one verdict over a large block.
- **Text:** the page from 2,838 to 2,171 words, the data contract from 2,953 to 1,524, the design standard from 1,364 to 871; the page reference folded into the contract; total reading about 5,800 words with the new agents' brief.

Drafts: [the page](drafts/32-review.md), [agents](drafts/32-agents.md), [design standard](drafts/32-design-standard.md), [data contract](drafts/32-report-data.md), [structural examples](drafts/32-structure-examples.md), as committed. Their links resolve in the installed layout.

## How the draft was checked before running

- A fresh critic (Opus-class) and a verifier (Sonnet-class) read the first version. The verifier found load-bearing rules the cut had dropped (a supplied target, partial coverage by helpers, approval when the user cannot answer, stored data, artifact location, findings hygiene, visual evidence); they were restored briefly. The critic found that a critic of the reviewer's own decomposition starts anchored to it, that a Claude subagent cannot start agents, that one block per new file defeats the necessity check, that uncommitted new files were missed, and that the new example mapped one to one onto an evaluation case's answer; all were corrected.
- Offline: skill pages 8, report 20, review instrument 26, orchestrate 13, packaging 21 with one pre-tag skip.

## Regression check

One synthetic case, `slot-edit/head`, reviewed by Sonnet-class subagents in Claude Code: once with the skill as merged in #97 (package digest `797e55a7d79e`), once with draft 32 (`37dde8b78612`) as a subagent under this session as conductor, which started an independent target at once and a critic and a verifier on the saved draft. A fresh Sonnet-class judge compared both final responses and records against the case's rubric, not told which was which. One run each: a smoke check for regression, not a comparison of quality.

| | Merged in #97 | Draft 32 |
|---|---|---|
| Rubric finds hit (F1–F8) | 8 of 8 | 8 of 8 |
| Traps violated (X1–X4) | none | none |
| Claims the source refutes | none | none |
| Judge's verdict | | equal, no regression |
| Subagent tokens reported | 116k | reviewer 98k + 106k on continuation; independent target 70k, critic 86k, verifier 80k |

- **The independent target**, given only the task and the base code, reached the case's clean form on its own: the zone read from the order, the stale doc to fix, the rules as ordered guards in one function, `withinHours` and `everyMinute` reused. The reviewer's target matched it on every structural point.
- **The critic** raised five points; the reviewer accepted all five and the review improved: a design scenario grounded in the task replaced an invented one, the stale doc became a step, an overstated design finding became "fragility, not a defect", the 60-second tick was argued, and a missed test gap was added (an editor opened on a stored slot already too soon). It also named a module-level cache shared by all clients.
- **The verifier** confirmed 27 claims and corrected two (a line number, and "nothing reads `failed`" where the change's own tests do).
- **The judge** found the merged skill slightly sharper on the main defect's consequence and on a test fixture that violates the installed client's type; draft 32 slightly richer on design cost and test gaps. Neither missed what the other found.
- **Cost:** the three checking agents alone used about twice the tokens of the whole merged-skill review. The plan's estimate, "likely half again", is wrong for this case.

The case is formative and at the ceiling for both versions: it shows no regression, not an improvement.

## Draft 33

Draft 32 less what its own run and a second critic showed unneeded. A Sonnet-class critic checked every rule the verifier had restored against the research records: only the approval rules (four of four pilot reviews stopped at the gate) and "helpers invoke no mode or approval" (pilot briefs had to add it by hand) had an observed failure behind them; the rest were duplicates, text the page or scripts already carry, or guards against failures never seen. About 140 words went; at the owner's word, the comparison with the base for behavior the task did not ask to change stayed, since reading the base and checking unintended changes are different acts. From the regression run: the plan's cost line now says what was measured (the three checking agents cost about two reviews' tokens on one case); the response names only the critic's and verifier's points rejected or sent to the owner, with the accepted ones in a line, since the judge found the full list added little for a reader; and the tests direction checks that test data respects the contracts the code relies on, the one thing the merged skill found that draft 32 missed.

Drafts: [the page](drafts/33-review.md), [agents](drafts/33-agents.md), [design standard](drafts/33-design-standard.md), [data contract](drafts/33-report-data.md), [structural examples](drafts/33-structure-examples.md). About 5,650 words in all. Not run.

## Draft 34

A fresh Opus-class review of draft 33 found the skill's anti-anchoring output invisible: the critic's and verifier's points and the independent target's differences had no place in the record or on the page, the reviewer settled target differences with no evidence bar, a necessity verdict of `unknown` could only be recorded as `keep`, the independent target could inherit the author's framing through "the task", the record stopped checking after one more commit, and the data contract's example was an evaluation case's answer. Draft 34 answers each:

- **Challenges.** Each point of the critic and the verifier, and each difference between the two targets, is a `challenge` in the record (`from`, `point`, `outcome`, `note`, and for a rejection `at`, the place that refutes it), checked and drawn on the page. The independent target's return reaches the reviewer with the critic's and verifier's, under a conductor and in session alike.
- **Question verdict.** A block or unit whose premise is unread is a `question` naming the question, never `keep`.
- **Inputs.** The independent target gets the owner's task and discussion; the author's description and commits only marked as the author's account. A requirement only the author states is an `assumption` unless the approved plan made that description the task.
- **Record.** `scaffold` pins the range to commits and saves the diff named after the record; `check`, `render` and `lines` read the saved diff. `check` also warns about kept blocks that serve no requirement or only assumed ones, and about a kept unit with an open block.
- **Smaller.** A failed checking agent leaves its check not run instead of stopping the review; the short review skips the record, block map and page; one vocabulary for unit verdicts; the cost line states the measured total; the format example is a neutral domain. Slot-edit's rubric items F5 and X4 are taught by the structural examples, so that case no longer measures design effect.

A Sonnet-class critic of draft 34 confirmed all eight changes and the scripts on a scratch repository, and argued five points. Fixed: the short review contradicted "respond from the record"; the author-only rule would have flagged most kept blocks on a pull request whose description is the only task (now confirmed through the plan); `lines` read live git; a kept unit with an open block went unnoticed; the contract did not say the check cannot judge whether a place refutes a point. Left open for real use: the bookkeeping cost of a challenge per point, and that the independent target now reaches the reviewer only with the critic.

Drafts: [the page](drafts/34-review.md), [agents](drafts/34-agents.md), [design standard](drafts/34-design-standard.md), [data contract](drafts/34-report-data.md), [structural examples](drafts/34-structure-examples.md) (unchanged). About 6,100 words in all.

## Trial on a real change

One real change from this repository's history: `276a94a`, "Driver audit, step 4: one rights model for the three adapters", 669 lines added and 416 removed in 23 files. The owner's task was the audit proposal's step 4 and the owner's decisions; the commit message and implementation notes were the author's account. A Sonnet-class reviewer ran draft 34 in a subagent with this session as conductor, which started a Sonnet-class independent target at once and a Sonnet-class critic and verifier on the saved draft. One run: a trial of the procedure on a real change, not a comparison.

| | Tokens reported | Time |
|---|---|---|
| Reviewer, to the saved draft | 287k | 11 min |
| Independent target | 110k | 1 min |
| Critic (ran the suites on extracted copies) | 153k | 16 min |
| Verifier | 139k | 2 min |
| Reviewer, reconciling | 325k | 3 min |

- **Blocks.** The scaffold made 169 blocks; the reviewer divided them into 198 and wrote a 59 KB script to fill them. 183 ended `keep`, 11 `fix`, 4 `question`. The block map is the largest writing cost of a review this size.
- **What the checks changed.** The draft said the change does its task, the mailbox module kept, five findings. After the checks: requirement 1 only partly met (the module does not own "record, then answer"; each adapter keeps its own unrecorded-accept branch), the mailbox unit to fix with an `answer()` that owns the order, the plan-time overlap refusal moved to the top as the one regression, and a new behavior finding from the verifier: the Codex read sandbox no longer refuses a TMPDIR that does not resolve (`[null]` equals `[null]`). Three questions answerable from the code were cut. The independent target had proposed the module owning the order (`offer(request, answerFn)`) from the task alone; the reviewer's own draft had accepted the author's primitives.
- **Challenges.** 25: critic 8 accepted and 2 rejected, verifier 8 accepted, independent target 5 accepted and 2 rejected. One rejection cites a test that confirms the critic's point rather than refuting it (the OpenCode run with no reported rules proceeds and only says so on stderr): the check sees that a place is named, not what it shows.
- **The reviewer's notes on the procedure:** how to record a target point that agrees, whether a citation correction needs its own challenge, that a unit's verdict follows its least certain block, how to divide a removal-only block, that `uses` must name listed units, how to cite a base line in `instead`, and that 198 blocks are a large input for the critic.
- **The two defects, read again in the current code.** The Codex one is real but out of reach in practice: the driver makes the run's `$TMPDIR` itself just before the check, so only a directory that vanishes in between would pass; the refusal is restored in one line. The overlap one is not a defect: `orchestrate/references/external.md:396` and the comment above `overlappingRows` state that two rows never write one tree and that writers in sequence are one row and its continuations; whether native rows should be exempt is the owner's question.

## Draft 35

A fresh Opus-class review of draft 34, using the trial, found the chain had broken the anchoring only along one path (independent target → critic → reviewer), the reconciliation the weakest link (the anchored reviewer refuted the letter of a point, not its substance), 25 challenges inflated by agreements and citation fixes, the block map 55% of the record and a third of the printed report with no finding resting on it, the plan's numbers contradicted by the trial, and a hidden rule (`uses` must name listed units) that caused 38 errors. A Sonnet-class critic of the coordinator's list then corrected it: resuming the verifier to re-check rejections would break the adapter's rule that independent verification takes a fresh agent, and a rejection must instead quote its place; the division rule should wait for evidence; the trial's numbers are one observation, and part of them came from a critic that ran suites the plan excluded. The owner kept mechanism weight: a rough weight lets the user ask what several suspect mechanisms weigh together and decide to remove them.

- **The independent target starts with the reviewer**, its return written where the reviewer reads it after its own sketch; differences that could change something are recorded then, the rest come with the critic.
- **Challenges** are only points that could change a requirement, verdict, finding or question; a citation fix is made in place and an agreement not recorded; an accepted point names what it changed; a rejection names a place in the code or the task's sources, quotes it and says why it contradicts the point.
- **The critic** gets units, mechanisms, findings, questions and the target, not the block map. Every agent gets the plan's scope; where tests are allowed, one scout runs them once at the start.
- **The printed report** lists only the blocks not kept or not linked (the trial's printout falls from 9,034 to 5,781 words); a mechanism nobody weighed prints nothing about weight; two or more weighed mechanisms get a total, each block counted once.
- **Contract:** `uses` names listed units; a divided copy drops the side it no longer has; places are at the head unless marked `(base)`; a unit's verdict follows its least settled block; the short review keeps its challenges in the response; the plan bullet is "Checking agents"; the plan's numbers are the two observations, and the multi-mode threshold is marked unmeasured.

Not changed, for real use to decide: how far to divide blocks; whether the reviewer's own target adds anything over the independent one (0 of 2 so far); the multi-mode threshold.

A Sonnet-class critic of draft 35 found every item in place and the Codex fix right and enough, and four things to correct, all done: the weight rule said "wholly theirs" while the total counts every listed block (now "the lines they touch together", with one trigger stated alike in both pages); reading the record back now says the record, not the printout that leaves kept blocks to the page; a rejection whose source has no place goes to the owner, and the check's comment says it sees that a place is named, not what it says; the plan's trial numbers were cut to one clause.

Drafts: [the page](drafts/35-review.md), [agents](drafts/35-agents.md), [design standard](drafts/35-design-standard.md), [data contract](drafts/35-report-data.md), [structural examples](drafts/35-structure-examples.md). About 6,400 words in all.

## Second trial: draft 35 on a smaller real change

`418a605`, "Driver audit, step 5: act on the owner's measurements, and tell every agent how to ask", 286 lines added and 21 removed in 14 files. The author's description was the only statement of the task; the plan said so and was approved uncorrected, so it was the task, acting on the owner's measurements the change itself records. Same arrangement as the first trial: Sonnet-class reviewer in a subagent, this session conducting, a Sonnet-class independent target started with the reviewer and written to `out/target.md`, a fresh critic and verifier on the saved draft, each given the plan's scope (read only, no tests). One run.

| | Tokens reported | Time |
|---|---|---|
| Reviewer, to the saved draft | 178k | 5 min |
| Independent target | 90k | 1 min |
| Critic | 98k | 1.5 min |
| Verifier | 83k | 0.6 min |
| Reviewer, reconciling | 192k | 1 min |

About 640k tokens and 8 minutes on the critical path, against 1M and 31 for the first trial; the critic, kept to the plan's scope, no longer ran the suites.

- **Target timing.** The target's return was in `out/target.md` four minutes before the draft; the reviewer read it after its own sketch, which had already reached the same structure (one rules builder, the refusal sentence owned once). Two differences recorded: one accepted, one to the owner.
- **Challenges.** 8, against 25 in the first trial: target 1 accepted, 1 to the owner; critic 4 accepted, 1 to the owner, 1 rejected; the verifier refuted nothing, and its three citation fixes were made in place. The one rejection names `drivers.mjs:173-182` and says what it shows (the builder already takes the four CLI-specific strings, and the critic's own walk needs more places), which supports it.
- **What the checks changed.** The critic found a defect the draft missed: the fix gives a message only to the requested permission, so a sibling pending with it is still rejected without one, and the turn may still end; the unproven fix became the headline finding. It also promoted the rights text that promises asking where the session denies outright (`.git`, `.opencode`, `opencode.json*`) from idea to finding, demoted the duplicated sentence to a small cleanup, and separated two rules no source states into an assumed requirement.
- **Blocks.** 57 scaffolded, 40 in the end: the reviewer merged 28 prose blocks of the results file into 9, judging a paragraph of results not a decision of its own, and split three code blocks. 28 `keep`, 7 `fix`, 5 `question`. No mechanism was weighed; nobody asked.
- **Procedure notes.** The reviewer read the working tree by mistake for part of the review (it is far ahead of the head here) and found no stated way to read the head; re-running a fill script means deleting the record and the saved diff by hand; renumbering findings means remapping ids by hand; whether a point that only changes a finding's rank is a challenge, and whether "to the owner" covers both a source with no place and a judgment call, are not said.

## Draft 36

An Opus-class review of draft 35 using both trials, a Sonnet-class verifier of its claims (all held but two line numbers), and a Sonnet-class critic of the coordinator's list. The review found the default mode, a review in this session, unable to keep the independent target's sketch back: a background agent's return lands in the starting session at once, and only the conductor path, the one both trials used, held it in a file. Across the trials only the critic changed the review both times; the target mattered when the reviewer had taken the author's structure (trial 1); the verifier's value followed the draft's error count. Reconciliation stayed the weakest link: a false headline accepted (trial 1), a confirming test cited as a refutation (trial 1), an agreement recorded as a rejection (trial 2), each with the anchored reviewer the only judge. The critic of the list moved a re-check of the reconciled record to "needs evidence" (two of its three failures already have a rule, and a disputed verdict outside the record would split the response from it), kept the reviewer's own sketch out of the skill text (an instrument for a trial, not a rule), and moved optional `does` on kept blocks to now: 0 of 211 kept blocks' descriptions were read by any check or finding, while the block map was the largest writing cost and enlarges the context the reconciling resumes.

- **The independent target writes `<out>/target.md` and returns only the path**, in this session as under a conductor; the reviewer opens it after its own sketch. The conductor no longer copies it.
- **An accepted point that adds, promotes or drops a finding, or changes the verdict, is refuted first** like any candidate.
- **The critic and the verifier get the draft's printed report** (`render`, which leaves kept blocks to the page), with `report.mjs lines` for a block's lines; the verifier no longer gets the target's sketch.
- **Challenges:** a point two agents raise is one; a point its agent concluded against is an agreement, not recorded; a change of a finding's rank counts; "to the owner" is every point neither accepted nor refuted by a place.
- **Scaffold:** Markdown runs end at headings (trial 2's results file: 28 paragraph blocks would be 9); the scaffold names the head to read files at; starting over says to delete the record and its saved diff.
- **`does` is optional on kept blocks.** Coverage of every line and a verdict per block stay.
- **Smaller:** the plan gives both trials' numbers and the 70% share; roles.md links the conducting procedure; a mechanism's `blocks` may be shared, as the scripts already allowed.

Not changed, for real use to decide: a re-check of the reconciled record (if refuting accepted points does not stop false accepts); whether the reviewer's own sketch adds anything (a trial can save it as an instrument); the multi-mode threshold; the cost of reconciling, the largest single item, which lighter blocks should reduce.

Drafts: [the page](drafts/36-review.md), [agents](drafts/36-agents.md), [design standard](drafts/36-design-standard.md), [data contract](drafts/36-report-data.md), [structural examples](drafts/36-structure-examples.md). About 6,600 words in all.

## Status

Two real changes reviewed, with drafts 34 and 35 (above); draft 36 not run. Further evaluation is by real use; the experiment proposed for the Terra agent is in the pull request.
