# Steps

2026-09-27. The orchestrator is the main session (Fable 5.1) under `/entrust:orchestrate` as installed (0.20.0),
following the unreleased foreman rules read from the tree at `882bcf3`. The owner asked for the not-yet-released
coordinator, chose the Max tier of three offered (as #16 asks every plan to do), and asked for the work to be done
in a worktree. Costs are the reports' own token totals (cache reads included) and wall-clock seconds.

| Step | Who | Produced | Cost | Got wrong, or deviated |
|---|---|---|---|---|
| Scouting | the orchestrator, cheap commands | both issues read; PR #23 found merged as `882bcf3` mid-session (the owner merged it and said so); the ledger empty; the installed launcher's ceiling defect (E45) gone on main; TaskOutput absent from the session's tools | inline | the first plan assumed PR #23 unmerged and proposed exporting its scripts; re-scouted after the owner's message |
| Worktree | the orchestrator, on "го макс" | `agent-skills-field-audit-triage` on branch `entrust-field-audit-triage` at `882bcf3`; this directory | — | — |
| Smoke turn | Codex Luna L0, read, network off, effort low | the launcher on main runs under codex-cli 0.155.1 with short-name model resolution: exit 0, receipt ok, one driver, one report | 13.5k wrapper tokens, 30 s | — |
| Split | the orchestrator | [01-split.md](01-split.md): 44 items in three groups | inline | see the critic |
| Split critique | Codex Astra A1, read, network off, inherited effort | [02-split-critique.md](02-split-critique.md): 20 changes; no numbered item lost; compound items to split (F12, F20, P8–P14, Q2, Q3, Q7); H1/H2 and K1–K8 unowned; harness rows to move to A; the refuter rule "default refuted" opposed to #16's own; the template to gain partial/not-applicable/undecided and to cite the issues' measurements as reported | 184.6k tokens, 488 s, 13 commands | it proposed provenance rows for the orchestrator's own premises and a full per-row form with alternatives, dependency gate and release scope; not taken (03-split.md says why) |
| Split, revised | the orchestrator | [03-split.md](03-split.md): 72 rows, 29 / 24 / 19; the foreman brief repeats its tables | inline | — |
| Foreman brief | the orchestrator | the whole plan, 3,092 words, opened whole and every path checked before launch | inline | two references to 01-split.md where 03 was meant, caught on that read |

Deviations from the pages, decided by the orchestrator for this run:

- The foreman reads the codex page by path and does not load `entrust:codex` with the Skill tool, though
  foreman.md says it does: the installed skill is 0.20.0 and its page names the cache's launcher, which dies at the
  tool's ceiling (E45, fixed on main); the worktree's launcher is the one in force.
- Refuters may answer `unknown` and never `refuted` for want of evidence, #16's rule, instead of the page's
  "defaults to refuted when uncertain".
- Waiting is on completion notifications, as main's page now says and the installed page does not.

| Foreman round | Foreman, Opus, background; workers in the foreground in three waves | [08-foreman.md](08-foreman.md); analysts 04a–c, refuters and prober 05a–d, judge 06, architect 07a–b | foreman 286.3k tokens, 43 tool uses, 5,635 s; Codex workers 5.8M, Claude workers 0.95M, five wrappers 67.8k | none failed; the prober's 22/22 is level 1 at each address, not a status check; three suites failed inside the sandbox and were not rerun outside it |
| Synthesis | the orchestrator | [README.md](README.md), the index row in `../README.md` | inline | — |

Regressions per round, counted as rows a later reader changed: the split critic changed 20 things about the 44
items (round 1 → 2); the refuters changed 21 of 72 rows (round 3 → 4); the judge kept 15 of those changes, reversed
6 (F5, F6, F8, F9, F10, Q7a) and moved one upheld row (F20b) (round 4 → 5); the architect's 42 rows equal the
judge's 42 (round 5 → 6, no change); the completeness critic (Opus C1) changed 24 things about the first draft of
the README and the answer (round 6 → 7).

| Completeness critic | Opus C1, foreground, on the draft answer and the README | 24 corrections: the refutation accounting, rank 19, who checked what, five of ten architect items missing, a Latin letter in a Russian word | 175.0k tokens, 32 tool uses, 531 s | — |
| Checks after the answer | the orchestrator, redirected into files | agent-run.test.mjs all 29 passed, lock.test.mjs all 72 passed outside the sandbox; fidelity.test.mjs read: spawns the real app-server and reads rate limits before the paid gate | inline | — |
| Decisions | the owner («Го», «Примени рекомендуемое») | the research run committed; E51 entered; the nine recommendations accepted; the fixes as a run of their own with a delta re-read as step 0; the 0.21.0 release package to be shown | — | — |
