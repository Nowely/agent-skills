# Pilot protocol (fixed before any pilot run)

Written 2026-09-26 by the coordinator, before the reference and the Luna pilot ran.

## Selection

- Sessions: the three sessions with the most human messages after the corpus rebuild, picked to differ in size (largest, middle, smallest of the top group).
- Parts: from each session, the two parts with the most own `user` turns. About six parts in total.
- Diagnostic cases (mixed reactions, praise, boundaries, branches, missing drafts) are not selected for; the pilot measures detection on ordinary high-traffic parts.

## Reference

- Claude Opus R marks the same parts with both angles and the same episode schema, including `confidence`.
- G = reference episodes with `confidence: high` ("confident episodes").

## Matching

- A Luna episode matches a reference episode when `user_turn` is equal and `draft_turn` is equal, or either side has `draft_missing: true`.
- Luna episodes are the union of angle A and angle B, deduplicated on (`user_turn`, `draft_turn`); agreement of angles A and B counts once.
- Kind agreement is reported separately and does not gate.

## Gates

- Recall: matched G / G >= 5/6.
- Extra: unmatched Luna episodes (matching no reference episode of any confidence) / all Luna episodes <= 20 %.
- Both are reported per angle and overall, with and without Luna `confidence: low`; the gate uses the overall numbers with low included.
- Coverage: every pilot Luna must read every page (tools/coverage.py, whole page text in one command output). An agent that did not is relaunched once and its numbers are reported both ways.
- If either gate fails at effort medium, the same parts run at effort high and the level is chosen by the numbers: recall first, extra second, tokens third.

## Cost

- Per-run tokens come from each report's tokenUsage.total (tools/tokens.py).
- Forecast for the full collection = median tokens per Luna run x parts x 2 angles x 1.15 (relaunches), plus the stress-test estimate scaled the same way.
- Stop and show the numbers when one Luna exceeds 3 x the pilot median, or when the forecast exceeds 2 x the plan (plan: Codex ~115M tokens in total).

## Caveat recorded in advance

- The reference is one model's reading. An extra Luna episode may be a reference miss; three extras are opened and read by the coordinator and the finding is written beside the numbers.

## Amendment after pilot 1 (recorded before pilot 2 ran)

- Pilot 1 (medium, briefs as first assembled): recall 2/2, extra 12/22 = 55 % (measures/pilot-medium-compare.md). The
  coordinator read all 12 extras: 7 were plugin/repo naming, 2 API naming, 1 "the file was not updated", 2 requests for
  action or disputes about the solution. The brief gained explicit exclusions for these four classes.
- G = 2 cannot test a 5/6 gate. Three holdout parts rich in writing reactions (P164, P178, P120; chosen by a count of human turns
  matching writing words such as текст, readme, пиш, короч, понятн, абзац, стил: P164 6 of 19, P178 4 of 29, P120 4 of 13,
  the top three parts outside the pilot sessions) are added; the Opus reference labels them in its own continued thread.
- Pilot 2 runs the amended brief at medium (prefix pilot2) and high (prefix pilot2h) on all nine parts. Numbers are
  reported for the six tuning parts and the three holdout parts separately; the level is chosen on the holdout parts
  first, all nine second.
