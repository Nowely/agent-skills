# 03. The split, revised

Round 2, written by the orchestrator after the split critic's return (02-split-critique.md). This is the split in
force for the fan-out; 01-split.md is the first cut and stays as written. What changed, and what the critic
proposed that was not taken:

- Taken: the compound items are rows of their own (F12a–c, F20a–b, P8a–e, P9a–b, P10a–c, P11a–b, P12a–b,
  P13a–b, P14a–b, Q2a–b, Q3a–m, Q7a–b); the keep list is eight checks K1–K8, six attached to the row they
  guard; H1 and H2 (the harness suggestions of #15) are rows judged as outside entrust; P1 includes Q1; F17's
  TaskOutput facet folds into F7; the harness-mechanics rows move to group A; statuses gain `partial` and
  `not-applicable`, verdicts gain `undecided`, cost may be `unknown`; a P or Q row's evidence carries the
  acceptance check its issue names and whether the tree has it; the live prober also gets the `unknown` rows a
  command in the tree can decide; the refuter answers `unknown` where it could not verify, never `refuted` for
  want of evidence (#16's own rule for refuters), which departs from the page's "defaults to refuted when
  uncertain" for this run.
- Not taken: separate provenance rows for the orchestrator's own statements about the tree, the ledger and the
  caps (they are the run's premises, recorded here and checked by the analysts as they read the tree, not
  triaged); a full per-row form with alternatives, dependency gate and release scope (the judge's ranking and
  the architect's deltas carry those for the rows that reach them).

## Question and tree

As in 01-split.md: for every row, is it still true of `main` at `882bcf3`, should it be fixed, and how. The
issues describe 0.20.0 as installed; a row can be answered on `main` and open in the release users have.

## Items and groups

The critic (Codex Astra A1, 02-split-critique.md) split the compound items into rows, added the two harness suggestions of #15 (H1, H2) and the eight keep-list steps (K1–K8), and moved the harness-mechanics rows to group A. 72 rows; every row has exactly one analyst.

Row aliases, so no row is judged twice: P1 includes Q1 (advisor bootstrap: #15's proposal 1 and #16's advisor section, judged with #16's fuller acceptance check); F7 includes F17's TaskOutput facet, F17 keeps the foreground ceiling, the Stop card and SubagentHandback; P8d includes Q3b (refuter deduplication and bounded clusters); P8b and P8c cover Q3d (the completeness critic on the actual final, and blocking trialled separately). K1 (plan stop) is judged with F13 and P9a; K2 (split critique) with F6 and Q3a; K3 (refuters) with F5 and P8d; K4 (final-version critic) with F4 and P8b; K5 (cross-review) with Q3c; K6 (one-off advice) with P1 and Q3i: each K is a preservation check, "is the step still on the page", recorded in that row's evidence. K7 (batched prompt registration) and K8 (mount backup-and-swap) are rows of their own.

Sub-rows, by the critic's cut:
- F12a scheduling contradiction (foreground or background), F12b return-shape contradiction (review schema versus five fields), F12c effort contradiction (top-row `EFFORT`).
- F20a attribution, F20b return-shape compliance.
- P8a combined proportional verification for a simple task, P8b the critic runs once on the final version with a versioned verdict, P8c the verdict gates publication, P8d claims deduplicated and mechanical prerequisites shared before refutation, P8e test receipts reused when inputs are unchanged.
- P9a the compiled five-row approval card, P9b the launcher refuses an agent missing from the approved manifest and amendments are explicit.
- P10a Codex briefs compiled from role profiles with an environment capsule, P10b a circuit breaker for repeated environment failures, P10c exit 6 classified by answer completeness.
- P11a hard size limits on structured returns with overflow to a file, P11b transactional prompt registration.
- P12a behavioural regressions instead of wording pins, P12b shared page fragments generated from one constants module and release failing on drift.
- P13a progress batched by phase with verified deltas, P13b a draft linter for machinery, length, paths and unsupported success.
- P14a an activation-position eval per client, P14b a cost index of past runs for plans.
- Q2a the three tier recipes, the plan card and its authorization behaviour; Q2b the selection criteria C1–C8 and their held-out validation.
- Q3a split critic, Q3c implementer and cross-reviewer, Q3e strong reader, Q3f area scout, Q3g live prober, Q3h recognition reader, Q3i advisor usefulness, Q3j blind proposer, Q3k measurer and retrospective analyst, Q3l evidence-packaging consolidation, Q3m the usefulness metrics, accounting and the unobserved roles (the twelve role-table rows of #16, Q3b and Q3d aliased above).
- Q7a the recorded overlap simulation, Q7b the prospective single-agent versus full-orchestration pilot.
- H1 trim the harness start package, H2 one fresh session per task or compaction at phase boundaries: outside entrust, judged as such.

| Group | Findings | Proposals | #16 | Count |
|---|---|---|---|---|
| A, launch and harness mechanics | F1, F2, F7, F8, F11, F12a, F12b, F12c, F17, F18, F19 | P1, P5, P6, P7, P9b, P10a, P10b, P10c, P11b, P12b, P14a, K7, K8, H1, H2 | Q3g, Q3h, Q3i | 29 |
| B, assurance and coordinator context | F3, F4, F5, F6, F9, F10, F15, F21 | P2, P3, P4, P8a, P8b, P8c, P8d, P8e, P11a | Q3a, Q3c, Q3e, Q3f, Q3j, Q4, Q5 | 24 |
| C, plans, delivery and measurement | F13, F14, F16, F20a, F20b, M1 | P9a, P12a, P13a, P13b, P14b | Q2a, Q2b, Q3k, Q3l, Q3m, Q6, Q7a, Q7b | 19 |
| Total | 25 | 29 | 18 | 72 |

The implementation order #15 proposes (P1 and P14a; then P2, P3, P4; then P5 and P12; then P9 and P13; P6, P7, P8 and P10 behind experiments) and the requirement that the keep list stays intact are inputs to the judge's ranking, not rows.

## What an analyst returns per row

    result row:     id | status | verdict | how (at most 30 words) | cost S / M / L / unknown | sentence | mechanism | experiment
    evidence entry: id: the claim in one line as the issue states it; the status evidence (file:line or a
                    CHANGELOG line) with its level (1, 2 or 3); the verdict's reason in one or two sentences;
                    for a P or Q row, the acceptance check the issue names and whether the tree has it

- status: `fixed-on-main` (the text at 882bcf3 answers it, though 0.20.0 did not), `partial` (some of it),
  `still-true`, `not-a-defect` (the claim does not hold, or asks for what the pages already do),
  `not-applicable` (outside entrust, or the tree has no such surface), `unknown` (undecidable with read rights
  and a tree; the missing check named in `open`).
- verdict: `fix-now`, `fix-after-measurement`, `do-not-fix`, `already-fixed`, `undecided` (when the status is
  `unknown` and the fix would only be warranted if the claim holds).
- "how" is the smallest change that answers the row: a page sentence, a mechanism (a script, a default, a
  generated fragment, a behavioural regression under `plugins/entrust/evals`) or an experiment protocol; the
  last column names which, because M1 shows sentences have not held. The issues' own measurements are cited as
  reported, not as reproduced.

## Verification

- Refuters of the other family, one per analyst: `upheld` only when the evidence at its address holds and the
  verdict follows; `refuted` with the evidence that changes the status or the verdict; `unknown` when neither
  could be verified. A finding is a refuted row.
- Live prober (Codex Terra T1): every `fixed-on-main` and `partial` row, and every `unknown` row whose missing
  check is a command that can run in the tree; never a live harness session or a paid gate.
- Architect (Fable F1): a delta for every row that is `fix-now` after refutation.
- Judge (Codex Astra A2): every row, reading the tree itself; `unknown` where its decisive check did not run,
  naming it; then the fix-now rows ranked by value for cost, with #15's implementation order and the keep list
  as inputs.
- Completeness critic (Opus): the request, the answer and its evidence, once, before the answer goes out.

## Composition

Unchanged from 01-split.md: Max; foreman Opus; analysts Codex Sol S1 (A), Opus O1 (B), Codex Sol S2 (C);
refuters Opus R1 (S1), Codex Sol R2 (O1), Opus R3 (S2); prober Codex Terra T1; judge Codex Astra A2; architect
Fable F1; completeness critic Opus. Group sizes are 29 / 24 / 19 rows, which the critic weighed against the
issue text each group must read (about 1,100 / 2,800 / 2,000 words) rather than against row counts.
