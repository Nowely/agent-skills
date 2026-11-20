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
