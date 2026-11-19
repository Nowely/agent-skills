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
| availability and the bottom (padding) | 21 | 38 | +17 |

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
| RubSE, [arXiv 2608.24138](https://arxiv.org/abs/2608.24138) | naive self-refinement degrades because one fix moves what was right; one localized fix per round, keep the best round: "Start here", one cause, the score and `history.jsonl` | a model judge with rubrics: the check is a measurement |
| 1D-Bench, [arXiv 2602.18548](https://arxiv.org/abs/2602.18548); DCGen, [arXiv 2406.16386](https://arxiv.org/abs/2406.16386) | render feedback and a difference image help; smaller units help: per-frame, per-landmark | segmenting screenshots: the outline already has the structure |
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

Round 0 built and tested the tooling without a model ([rounds.md](rounds.md)). The text the runs will use is frozen
as [drafts/01-v1.md](drafts/01-v1.md). [protocol.md](protocol.md) registers the next runs: the check on the owner's
real case, then short runs of the model on two cases, with a full task only when those warrant it.
