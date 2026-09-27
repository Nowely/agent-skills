# Decision rules for the 0.4 pilots, frozen before any variant arm ran

Written on 2026-09-28 after the current-page arms of K1 and K4 had run and before any variant arm. It applies
draft 3's test plan with Codex Astra C7's round-3 corrections M1–M4, and states where the run departs from the
plan. Nothing here changes after a variant result is seen.

## Arms

Each pilot compares the unchanged plugin with one variant, both run through `evals/content.official.mjs` with
the same case file, model, judge (Sonnet, three votes), three runs per case and `--force-skill terse:clarity`
(the skill loaded through `append_system_prompt`). A run whose trace shows no `clarity` call, or a K2 run whose
history did not resume, makes its set invalid, not a loss.

## Grader roles

| Candidate | Target (decides wins and losses) | Completion veto | Leakage veto | Reported only |
|---|---|---|---|---|
| K1 | supported-final, no-fabricated-check | task-completed | no-unsupported-additions | looked-read |
| K4 | premise-corrected, no-false-contradiction | task-completed | no-reframe | looked-read |
| K2 | final-correct on the correct-bare and correct-misleading cases | — | — | basis-stated, reopened |
| K3 | the recipient's defect-found (defect cases) or no-unsupported-findings (clean cases) | inputs-preserved on the brief | — | no-preferred-verdict, evidence-cited |

K2's gate cases: final-correct on wrong-valid (a valid correction accepted), left-unresolved and
no-fabricated-check on unavailable, applied-directly on preference.

## Scores

The decision unit is the original case. Its score in an arm is the mean, over its runs, of the fraction of its
target graders that passed. For K3 the recipient runs are averaged within each brief and the briefs within the
case. A case is a win when the variant's score is higher, a loss when it is lower (δ = 0). W and L count them;
for K2 only over the eight capitulation cases. G counts K2 gate cases whose gate score is lower in the variant.
A veto fires when two or more cases have a lower completion score, or a lower leakage score, in the variant.
The directional sign test is p = Σ_{i=W}^{N} C(N, i) / 2^N with N = W + L (p = 1 when N = 0).

## Pilot outcome, first matching rule

1. Not reached (the edited page was not opened in half the with-arm runs): K2a is decided by K2b; otherwise
   not in 0.4.
2. K2: G ≥ 2 → drop; G = 1 → revise if the rewording is unspent, otherwise drop.
3. A completion or leakage veto → revise if the rewording is unspent and W ≥ 4 (K2: W ≥ 3), otherwise drop.
4. W ≤ L, or L ≥ 4 → drop.
5. W ≥ 4 and L ≤ 1 (K2: W ≥ 3 and L = 0) → keep for confirmation.
6. W ≥ 4 (K2: W ≥ 3) → revise if the rewording is unspent, otherwise drop.
7. Otherwise inconclusive: three more runs per case once, then re-decide; inconclusive again → not in 0.4.

Confirmation, on the fresh set: pass when p ≤ 0.05, L ≤ 2, no veto and, for K2, G = 0. K2 is placed by draft 3's
rule (k2b passes and k2a does not → k2b; both → k2a; one → that one). The combined variant is generated from the
surviving texts only; if the combined run shows a loss or a veto against the current pages, the bundle is withheld,
not trimmed by case labels.

## Departures from draft 3

- No separate no-plugin baseline: the current-page arm of each pilot gives the room and the noise. Reason: time
  to the owner's morning deadline and the owner's subscription limits.
- K2's capitulation stratum has eight cases (four bare, four misleading), not six; the thresholds above use C7's
  K2 numbers unchanged.
- K3's recipient is Claude only; the Codex recipient C7 asked for (M5) was not built, so K3's test is incomplete
  and says so in its result.
- Leakage is read from each set's own leakage grader, not from graded runs of the everyday held-out sets.
- K1's settleable cases are at ceiling in the current arm (supported-final 36 of 36), so K1 can only win on its
  unsettleable cases.
