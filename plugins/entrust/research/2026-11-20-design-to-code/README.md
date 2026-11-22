# Design to code: the owner's pushes, made a script

The question: can an agent reach a pixel-perfect, responsive result from a Figma design without the owner pushing
it round after round, and with fewer tokens per round? The [design-to-code skill](../../plugin/skills/design-to-code/SKILL.md)
is the proposed answer; this directory holds why it looks as it does and how it will be tested. Its predecessor's
record is [2026-11-20-adaptive-frontend](../2026-11-20-adaptive-frontend/README.md).

## Why a new skill

The predecessor's full-task runs took 2 and 3 returns (54:31 and 1:17:56 of worker time), had no arm without the
skill, and its last edition (v6) was never run. Two facts from that record and from the owner change the problem:

- **The workers had no design data.** They received 26 exported images: no outline, design context, Code Connect
  map or variables (`full-task.md` names exports only; the record never mentions Figma). Every number had to come
  from looking at pixels.
- **Looking is not what failed.** The owner reached the accepted implementation with the same model, iteratively:
  pushed, it sees the differences and fixes them. What cost was the rounds: each was a visual comparison heavy in
  tokens, and each waited for the owner to say what was still off.

So the skill's job is to make the push automatic and cheap: the design and the page as numbers, a short text report
that says where an offset starts, and images only for what numbers cannot say.

## What one table would have said

The accepted v5 at 280 px is 7 px shorter than the design, yet its price starts 21 px higher. Measuring the text
rows of the public captures ([the predecessor's visual report](../2026-11-20-adaptive-frontend/visual/README.md)),
the internal offset comes from a handful of spacings, each one CSS value; smaller steps of 1–2 px partly offset them:

| Between | Design | Accepted v5 | Introduced |
|---|---:|---:|---:|
| the top and the SKU (padding) | 23 | 21 | −2 |
| SKU and badges (and the SKU's smaller line) | 17 | 11 | −6 (−8 with the line) |
| badge row height | 15 | 13 | −2 |
| model and vendor logo | 13 | 8 | −5 |
| frequency and cores | 32 | 24 | −8 |
| disks, feature row and price | 28, 28 | 25, 25 | −3, −3 |
| availability and the bottom (padding) | 22 | 38 | +16 |

Rows are ink bands (first and last dark pixel rows), so each value is ±1 px. The skill's check reports the same kind
of table from the page itself, with the first introduced offset as "Start here", in one pass.

## Pixel-perfect is "equal, or different for a recorded reason"

The owner's own final implementation also differs from the design: a word form corrected, units set in a column,
a heavier price, the UI kit's badge in place of the drawn one. [release-deviations.md](release-deviations.md) lists
what the public captures show. A check that fails those would be wrong; a check that ignores them would hide real
misses. The ledger holds them: each difference is fixed, or recorded with its category and reason, accepted by the
owner or proposed with options. The same file is where the agent puts what the design leaves unsaid.

## What it draws on

| Source | Taken | Not taken |
|---|---|---|
| Figma's [MCP tools](https://developers.figma.com/docs/figma-mcp-server/tools-and-prompts/) and its [design-to-code skill](https://github.com/figma/mcp-server-guide) | fetch the outline, context and screenshot; children one by one when large; download every asset, never substitute one | no numeric verification exists there to take |
| OpenAI's `figma-implement-design` ([openai/skills](https://github.com/openai/skills), deprecated) | tokens before raw values; no new icon packages | its checklist "validate against the screenshot" is what the check replaces |
| RubSE, [arXiv 2608.24138](https://arxiv.org/abs/2608.24138) | naive self-refinement degrades because one fix moves what was right; one prioritized repair per round: "start here" and one cause per round. Keeping each round's score (`history.jsonl`) is ours | a model judge with rubrics: the check is a measurement |
| 1D-Bench, [arXiv 2602.18548](https://arxiv.org/abs/2602.18548); DCGen, [arXiv 2406.16386](https://arxiv.org/abs/2406.16386) | execution feedback helps (1D-Bench); smaller segments help (DCGen): per frame, per landmark | segmenting screenshots: the spec already has the structure |
| [W3C DTCG 2025.10](https://www.designtokens.org/), [WCAG 2.2](https://www.w3.org/TR/WCAG22/) | the token map; contrast, target size, reflow in the design review | — |
| The predecessor's v6 | the behaviour checks: a state survives a resize, the built package works | its prose on choosing a "smallest public surface" |

## Hypotheses

1. The automatic loop replaces the owner's pushes: at the same final check, fewer owner interventions per task.
2. A text report per round costs fewer tokens than a visual comparison per round.
3. A pack fetched once (outline, context, Code Connect, variables, assets) gives a first build with a lower score than
   fetching as the work goes.
4. The design review and the ledger raise the design's gaps before the owner sees a result, as proposals with options.
5. The sweep finds defects between frames before handoff.

## Status

Round 0 built and tested the tooling; round 1 rebuilt it after an independent critic and a verifier
([rounds.md](rounds.md)). No model has run it yet. The texts are frozen as [drafts/01-v1.md](drafts/01-v1.md) and
[drafts/02-v2.md](drafts/02-v2.md), the one the runs will use. [protocol.md](protocol.md) registers the next runs: the
check on the owner's real card as a gate, then short runs of the model on two cases with scripted pushes, with a
full task only when those warrant it.

## Follow-up calibration

The [third draft and calibration](03-calibration.md) exercise the checker on a real design input and preserved public builds. A corrected snapshot matches itself, but one accepted control fails the current alignment threshold. The release comparison gate remains open and no model comparison has been run. The prior experiment protocol remains historical; both proposed arms now receive the same design inputs.

## Independent recommendations

An Astra review separates the observed calibration results from next-edition hypotheses, including a reproduced bounded-exception failure and the limits of alignment groups. The [recommendations](04-recommendations.md) also record what worked and a proposed stop/go sequence.

## Real-frame follow-up

The [follow-up calibration](05-calibration-followup.md) records a blind review, the original dense fixture, three builds, a screenshot-only control, the measured ledger boundary and the limits of the checker as an acceptance gate. It also records which requested MCP inputs and costs remain unmeasured.

## Rounds 6 and 7

Round 6 closed E143, simplified image-only references, brought back the summary-first rule and registered a pair on
the card task; its critic and verifier led round 7 to make missing fonts a warning again, keep sizes unrounded for
the ledger, name a neighbour's change of size as a cause, remove what nothing used, and register the pair's
[second protocol](07-pair-protocol.md). Details in [rounds.md](rounds.md).

Before running the pair, use the [third protocol](08-pair-protocol.md) for the product baseline and worker access.

## First skill-only submission

The [first-submission study](09-first-submission.md) records the implementation, independent acceptance, token and time accounting, observed gaps, limitations and alternatives for one or two reviewers. The [visual evidence](09-first-submission.md#visual-evidence) includes reference and submitted views.

## Round 8: done means checked

Reviewing the first submission with a fresh Fable reader set the aim: when the agent says done, the work is done in
fact. The [eighth round](rounds.md#round-8-what-the-first-real-submission-missed) adds an acceptance list written
before the first edit and run before handoff (every reference, a dense story, every popup, every action, the owner's
past returns), sweeps dense stories, reports controls another element covers, gives a popover frame its own root,
keeps scores comparable only within the same specs, and fixes two regressions of b8eb852. Frozen as
[drafts/09-v9.md](drafts/09-v9.md).

## Rounds 9 and 10, and the first pilots

The check's "pass" now carries evidence: popups are journeys with expected results, and a check of every frame is
incomplete without the acceptance list, a frame for every reference and a dense story. Round 10 corrected what
round 8's verifier found. Two Sonnet pairs on the new public
[listing case](../../evals/design-to-code/cases/listing-card/README.md) are in
[10-sonnet-pilots.md](10-sonnet-pilots.md):

- both skill arms were accepted on the first submission;
- one plain arm was accepted and one was returned for column offsets;
- the case's popup and dense traps did not separate the arms.

It ends with what to carry into the Terra runs.

## Draft 14: first submissions on the small case and the real card

A single Terra worker used draft 14 on each case, without a new no-skill baseline. The small case met its registered threshold only after diagnosing a faulty judge selector; the real first submission did not meet visual or packaged-consumer acceptance. [The detailed record](11-terra-v14-retest.md) separates observations, checker and judge defects, time and token costs, and proposals; its [visual report](11-first-submission-visual.html) pairs each shown state with its reference and labels different data. No skill changes were made in this research round.

## Iteration 1: the first revised-skill submission

A same-input listing run with the shortened skill and the corrected judge was returned for one mobile layout mismatch; its worker disclosed the mismatch. [The first iteration record](12-iteration-01.md) includes the reference and both submissions, costs, judge controls, reflection and the next frozen draft.

## Iteration 2: testing the design-conflict instruction

The judge returned v16 for the same 6 px mobile difference as v15. The worker reported it, and a later DOM trial reconciled the written gap with the reference. [Results and visual comparison](13-iteration-02.md).

## Iterations 3 and 4: real package and screenshot-only

[Iteration 3](14-iteration-03.md) records the returned real-card submission, a failed packaged-consumer load, costs and reference pairs with explicitly different fixture data. [Iteration 4](15-iteration-04.md) records the screenshot-only case, the strict failed result, the independent visual observation and a pixel-identical CSS control that exposed a false rejection by the numeric observer.

## Iteration 5: packaged entry, incomplete first submission

[The fifth iteration](16-iteration-05.md) independently loaded the built public consumer but returned the first submission for observed dense-data overlap and other state gaps. Its [visual report](16-iteration-05-visual.html) puts each shown card beside a reference, with data differences named. At the time of that series, the owner set a limit of five implementation iterations; its follow-up draft did not receive a sixth worker run.

## Five-iteration summary

[The comparison and available accounting](17-iteration-summary.md) records first-submission outcomes, frozen versions, available role costs, visual references and remaining uncertainty. The five-run cap for that series was reached; its final revision did not receive another implementation trial.

## Post-series checker calibration

[The frozen dense-data check](18-frozen-dense-calibration.md) compares the fifth submission and a released control with the same consumer, data and widths. The checker detected the known overlap and reported a passing sweep for the control. This is not another implementation iteration or a test of draft 20.

## Post-series: Before image provenance

[The Before-image audit](19-before-conditions.md) reproduces an unlabelled change of capture conditions, preserves the original image and records the corrected gallery, checks and costs. It does not constitute a sixth frontend implementation.

## Post-series: coordination accounting

[The coordination audit](20-coordinator-accounting.md) adds recorded token use for the coordinator, five workers and other linked roles during the five-iteration turn. It separates cached, uncached and output tokens and names unmeasured costs; it is not another implementation iteration.

## Fifth-submission postmortem and sixth-iteration proposal

[The postmortem](21-fifth-submission-postmortem.md) consolidates the observed defects, their causes and limits, prior findings and cost. Its [visual evidence](21-fifth-submission-visual.html) pairs each shown state with a reference and labels different data. [The proposed sixth iteration](22-sixth-iteration-plan.md) was a plan only at that point; the later owner-approved draft-27 run is recorded separately below.

## The server card with Sonnet: drafts 21.1 to 27

- [Drafts 21.1 and 22.1 side by side](23-server-card-sonnet.md): both returned by a blind review, after the automatic
  gates held.
- [Iteration 1](24-iteration-1.md): draft 23 checks the arrangement and narrows what a font may excuse.
- [The external landscape](25-external-landscape.md) and [an architectural review](26-architecture-review.md): ink
  pairing gives way to named boxes, and logic over pixels.
- [Iteration 2](27-iteration-2.md): draft 25.1's frames clean; returns for a popover at the window's edge and a split
  price; 85–135 check rounds.
- [Iteration 3](28-iteration-3.md): draft 26.1 makes moderate offsets notes, cutting the rounds to 27 and the ledger to
  6, and is returned for a price split its own page allowed.
- [Iteration 4](29-iteration-4.md): draft 27 treats a value and its period as one group, and drops a strict rule that
  never caught a real return.
- [The Terra run](30-terra-run.md): the owner's one run, prepared so that it reads clearly: the mechanics tested first,
  the data's bounds seeded, the review pass on, the rule for reading it written before.


## Draft 27 on the full task: first checkpoint and one review round

The owner authorised one new Terra run of frozen draft 27. The [detailed record](31-terra-real-task.md) separates
the builder's first checkpoint, independent review, one correction round, the owner's subsequent observations,
checker defects and available role costs. The [visual report](31-terra-first-visual.html) embeds each principal
reference beside the corresponding result and labels contextual comparisons. This is one case, not proof of a
general improvement; no further product correction is in scope.


## Cost and iteration-speed forensics

[The detailed cost and process analysis](32-efficiency-forensics.md) reconstructs the first checkpoint, reviewer,
coordinator, permission helpers, a prior full-task run and a narrow sample of the original product workflow. It
corrects record 31's permission-helper accounting for two visible compaction requests, keeps the original record as
history, and separates measured facts from speedup hypotheses. Anonymised machine-readable stage, response, phase,
round and analysis-cost data accompany it. No new UI implementation was run.
- [Five more iterations](33-five-iterations-plan.md): the plan written before them, with what each must show and when
  to stop.
- [Iteration 6](34-iteration-6.md): draft 28.2 against 28.1 on Sonnet, three runs each on two cases. No cost effect shown;
  every card returned by a stricter reviewer as seen and as read, 28.2's first in both sets; four code faults recur.
- [Iteration 7](35-iteration-7.md): the architecture critic's and Fable's reading of iteration 6, and the plan it chose:
  draft 28.3, Sonnet on the stateful case and a card with a planted finding, and a capped Terra dry run. Then drafts
  28.4 (a gate, reverted under the plan's rule) and 28.5 (an inputs record), each on Sonnet: every handover put the
  planted question with options; what differed was inputs bent to clear it, and the cost.
- [Terra dry run, registered](36-terra-dry-run.md): the capped run in the owner's Codex on the planted card, now the
  rerun on draft 28.5 with the plan's approval in the task prompt as a changed condition.
- [Terra dry run on draft 28.4](37-terra-28-4-dry-run.md): the first handover stopped before the gate; the result is
  inconclusive for gate obedience, with the worker's approval request, observed checks and role costs recorded.
- [Terra rerun on released 0.45.0](39-terra-045-rerun.md): stopped at 60 calls without a worker handover; records the
  ledger options, grader false negative, snapshot race, role costs and post-boundary check separately.
- [Collector replay and Terra prebuilt pass](42-collect-and-terra-p.md): S's token/poll accounting discrepancies,
  P's first handover and measured poll threshold, the missing-seed exception and process-list uncertainty.
- [After entrust 0.45.0](38-after-the-release.md): the plan for the rest of the quota, written before the runs: the
  Terra rerun on the shipped skill, the real run as iteration 8, and the reserve.
- [Service overhead, and the real runs in one sitting](40-overhead-and-one-sitting.md): written before the runs; the
  owner's decisions, the review-pass control that failed, the rerun as the overhead baseline, 0.46.1's four levers
  with their measures, and the sitting: the prebuilt pass, then runs A and B.
- [The sitting on 0.46.1](41-the-sitting.md): the protocol of the owner's one sitting, written before it runs: the
  `collect` check on the rerun's log, the prebuilt pass, and runs A and B; its results go there.
