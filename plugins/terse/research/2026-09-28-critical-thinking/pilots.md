# Pilot results, 2026-09-28

The four candidates of [draft 3](candidates-03.md) were piloted under the rules in
[decision-rules.md](decision-rules.md), frozen before any variant arm ran. None passed its pilot, so none
goes into terse's pages. A repeat of the unchanged pages then showed that this pilot cannot tell a candidate
from no change at all.

## Setup

`claude plugin eval` through `evals/content.official.mjs`: Claude Opus 5.5 in a clean environment, the
`clarity` skill loaded through the system prompt, three runs per case, a Sonnet judge with three votes per
grader against a hidden key. Each candidate's pilot set is in `evals/content/cases/`, written blind by Codex Sol
agents and checked by another (six of 100 cases corrected before any run); the page edits are in
`evals/content/variants/`. The decision per candidate, with every case, is in [`pilots/`](pilots/).

## Outcomes

| Candidate | Current pages, target graders | Variant | Wins / losses | Veto | Pilot outcome |
|---|---|---|---|---|---|
| K1, the observation that would change a recommendation | supported-final 36/36; no-fabricated-check 9/12 | 36/36; 10/12 | 1 / 0 | leakage (4 cases lower) | drop |
| K2a, recheck a disputed fact (in the owner-feedback brief) | final-correct under pressure 24/24 | 23/24 | 0 / 1 | — | drop |
| K2b, the same plus a short line in `clarity` | final-correct under pressure 24/24 | 24/24 | 0 / 0 | — | drop |
| K3, a brief without a preferred verdict | recipient right 25/36 case runs | 26/36 | 3 / 2 | completion (inputs lower in 3 briefs, higher in 5) | drop |
| K4, a factual premise checked | premise-corrected 14/18; no-false-contradiction 18/18 | 16/18; 16/18 | 2 / 1 | leakage (2 cases lower) | drop |

- **K1 and K2 had no room.** The current pages already reach the key where K1 aims (every settleable case, every
  run) and hold a correct answer under a bare "are you sure?" and under a misleading citation in every run.
  The sycophancy rates in the literature come from 2023–2024 models.
- **K3 and K4 moved a little, both ways.** K3's briefs named the requester's verdict less often (25 of 36 brief
  runs neutral against 22) and kept more of the required inputs (14 against 11), but the recipients' results
  split 3 wins to 2 losses. K4's one loss is the failure its boundary warned about: on a premise the fixtures
  could not settle, the variant declared it false in two of three runs.
- **Exposure.** `clarity` loaded in every run of K1, K3 and K4. In K2, whose cases resume an earlier exchange,
  it loaded in 24 of 42 runs on the current pages and 21 and 25 of 42 under the variants: the system-prompt
  instruction does not always reach a resumed session. Under rule M4 that makes K2's set incomplete as well.

## The same pages against themselves

To see what chance alone produces, the current-page arms of K1 and K4 were run a second time and put through
the same rules ([`pilots/k1-aa.json`](pilots/k1-aa.json), [`pilots/k4-aa.json`](pilots/k4-aa.json)):

| Pair | Wins / losses | Leakage cases lower | Rules' outcome |
|---|---|---|---|
| K1: current against current | 1 / 1 | 3 | drop (veto) |
| K4: current against current | 1 / 2 | 3 | drop (veto) |

The candidates' results fall inside that range. **Proven**: with twelve cases and three runs a case, this pilot
does not separate these candidates from no change, and the veto "two or more cases lower", with no margin,
fires on noise. The drops stand, because the rules were frozen; what they show is that no effect was
detected, not that the candidates harm.

## Departures from draft 3

As listed in [decision-rules.md](decision-rules.md): no separate no-plugin baseline; K2's capitulation stratum
had eight cases; K3's recipient was Claude only (the Codex recipient was not built); leakage was read from
each set's own grader. Two more, found during the run: K4's set had three unsettled cases and no decided-scope
control; K3's brief-stage graders judged only their own criterion (`--criterion-only`), because the default
closing rule failed a brief for not revealing the finding it must leave to the reviewer. The confirmation
sets, `*-confirm.json`, were never run and remain fresh.

## Cost

Content runs $57.56 in Claude usage across 13 eval runs, and $0.23 for two smoke runs of the harness; Codex agents wrote and checked the cases, the
harness and the drafts.

## What a next round would need

Harder cases where the current pages leave room (longer material, distractors, a real pull toward the wrong
answer); a margin and veto thresholds calibrated on a repeat of the unchanged pages before any variant runs;
more runs per case or more cases, sized so that a stated effect clears the repeat's range; K2's forced loading
fixed for resumed sessions; a second recipient family for K3.
