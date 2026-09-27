# Claude agents' tokens

Source: the `subagent_tokens` field of each task notification the harness delivered to the coordinator (cumulative for
a continued agent). The coordinator's own usage (Opus 5.5) is not measured here.

| agent | model | turns | tokens after each turn |
| --- | --- | --- | --- |
| R (pilot reference) | Opus | 2 | 279,782 → 421,692 |
| A1 (bottom-up) | Opus | 1 | 335,303 |
| D1 (draft, final principles and issue, terse plan) | Fable | 3 | 354,051 → 477,155 → 593,980 |
| Codex wrappers (E1, E1b, J0, E2, A2-1, A2a–A2e, A2-2, J1, X1, C2, C1) | Haiku (pinned in the wrapper) | 1 each | 12,916 – 17,110 each |

Totals: Opus 0.76M, Fable 0.59M, wrappers ~0.25M.
