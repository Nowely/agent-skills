# Pilot results, 2026-09-28

The four candidates of [draft 3](candidates-03.md) were piloted under the rules in
[decision-rules.md](decision-rules.md), frozen before any variant arm ran. None passed: K1, K3 and K4 were
dropped and K2's set was invalid, so none goes into terse's pages. A repeat of the unchanged pages then showed
that the veto which dropped K1, K3 and K4 also fires with no page edit at all.

## Setup

`claude plugin eval` through `evals/content.official.mjs`: Claude Opus 5.5 in a clean environment, the
`clarity` skill loaded through the system prompt, three runs per case, a Sonnet judge with three votes per
grader against a hidden key. Each candidate's pilot set is in `evals/content/cases/`, written by Codex Sol
agents that never saw the candidate texts and checked by another before any run; the page edits are in
`evals/content/variants/`. Every decision below is reproduced by `tools/decide.py` from the eval results and is
in [`pilots/`](pilots/), case by case; the counts per arm and grader are in
[`pilots/aggregates.json`](pilots/aggregates.json). The raw eval results stay on the owner's machine because they
carry machine paths.

## Outcomes

| Candidate | Current pages, target graders | Variant | Wins / losses | Veto | Outcome |
|---|---|---|---|---|---|
| K1, the observation that would change a recommendation | supported-final 36/36; no-fabricated-check 9/12 | 36/36; 10/12 | 1 / 0 | leakage (4 cases lower) | drop |
| K2a, recheck a disputed fact (in the owner-feedback brief) | final-correct under pressure 24/24 | 23/24 | 0 / 1 | — | invalid |
| K2b, the same plus a short line in `clarity` | final-correct under pressure 24/24 | 24/24 | 0 / 0 | — | invalid |
| K3, a brief without a preferred verdict | recipient right 25/36 | 26/36 | 3 / 2 | completion (inputs lower in 3 briefs, higher in 5) | drop |
| K4, a factual premise checked | premise-corrected 14/18; no-false-contradiction 18/18 | 16/18; 16/18 | 2 / 1 | leakage (2 cases lower) | drop |

- **K1.** Its main target, a recommendation that reflects the file that settles it, was already right in every
  run on the current pages, so K1 could only win on the four cases where nothing settles the assumption; there
  the current pages avoided an invented check in 9 of 12 runs and the variant in 10 of 12.
- **K2.** On the current pages a correct answer held under a bare "are you sure?" and under a misleading citation
  in all 24 runs, so K2 had no room on these cases; the sycophancy rates in the literature come from 2023–2024
  models. The set is invalid in any case: its cases resume an earlier exchange, and `clarity` loaded in only 24
  of 42 runs on the current pages and 21 and 25 of 42 under the variants, so the system-prompt instruction does
  not always reach a resumed session.
- **K3.** Its briefs named the requester's verdict less often (25 of 36 brief runs neutral, against 22) and kept
  more of the required inputs (14 of 36, against 11), but the recipients' results split 3 wins to 2 losses, and
  the brief-stage veto fired.
- **K4.** Two wins and one loss. The loss is the failure its boundary warned about: on a premise the fixtures
  could not settle, the variant called it false in two of three runs.

`clarity` loaded in every run of K1, K3's briefs and K4.

## The same pages against themselves

To see what the rules do with no change at all, the current-page arms of K1 and K4 were run a second time and
put through the same script ([`pilots/k1-aa.json`](pilots/k1-aa.json), [`pilots/k4-aa.json`](pilots/k4-aa.json)):

| Pair | Wins / losses | Leakage cases lower | Rules' outcome |
|---|---|---|---|
| K1: current against current | 1 / 1 | 3 | drop (leakage veto) |
| K4: current against current | 1 / 2 | 3 | drop (leakage veto) |

With twelve cases and three runs a case, the leakage veto fires without any page edit, and one or two wins or
losses arise by chance. The drops of K1, K3 and K4 rest on vetoes of that kind, so the pilots found no effect
large enough to clear them; that is not evidence that the candidates have no effect, and two repeats do not
measure what the pilot could have detected.

## Departures from draft 3

As listed in [decision-rules.md](decision-rules.md): no separate no-plugin baseline; K2's capitulation stratum
had eight cases; K3's recipient was Claude only (the Codex recipient was not built); leakage was read from each
set's own grader. Two more, found during the run: K4's set had three unsettled cases and no decided-scope control;
K3's brief-stage graders judged only their own criterion (`--criterion-only`), because the default closing rule
failed a brief for not revealing the finding it must leave to the reviewer. The confirmation sets,
`*-confirm.json`, were never run and remain fresh.

## Cost

$57.56 in Claude usage for 13 eval runs (the unrounded total in `aggregates.json`; the per-arm values in the
decision files are rounded), and $0.23 for two smoke runs of the harness. Codex agents wrote and checked the
cases, the harness and the drafts.

## What a next round would need

Harder cases where the current pages leave room (longer material, distractors, a real pull toward the wrong
answer); a margin and veto thresholds set from repeats of the unchanged pages before any variant runs; more runs
per case or more cases, sized so that a stated effect clears what the repeats produce; K2's forced loading fixed
for resumed sessions; a second recipient family for K3.
