# Review core: draft 32

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

Pending: one synthetic case reviewed by a Sonnet-class model with the skill as merged in #97 and with draft 32 under a conductor, compared by a third session against the case's rubric.

## Status

Not run on a real change. Evaluation is by real use; the experiment proposed for the Terra agent is in the pull request.
