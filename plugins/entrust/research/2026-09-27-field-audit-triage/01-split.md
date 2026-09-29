# 01. The split

Round 1 of the triage of issues #15 and #16, written by the orchestrator (Fable 5.1) on 2026-09-27 before any
agent ran. Frozen once the split critic launched.

## Question

For every finding and proposal of [#15](https://github.com/Nowely/agent-skills/issues/15) and
[#16](https://github.com/Nowely/agent-skills/issues/16): is it still true of the tree, should it be fixed, and how.

## Tree under triage

`main` at `1bbab5b` (2026-09-27), which is 0.20.0 plus the unreleased changes in `plugins/entrust/CHANGELOG.md`
under `Unreleased`: the foreman (#24), the keeper launcher, the lock's new shape, `WEB_SEARCH:` wording,
`advisor`/`experiment`/`swarm` loading `codex` alone, the page waiting on notifications (#23). The defects
ledger `plugins/entrust/ISSUES.md` is empty at this commit. Both issues were written against 0.20.0 as installed,
so a finding may be answered on `main` and still be open in the release a user has.

## Items

Identifiers used by every agent of this run.

- `F1`–`F21`, `M1`: the findings of #15, numbered as there.
- `P1`–`P14`: the "Proposed changes" table of #15, by its `#` column.
- `K`: the "What to keep" list of #15, eight steps; one item, checked as a whole.
- `Q1`–`Q7`: the seven bullets of #16's summary, in order: `Q1` advisor activation and automatic consultation;
  `Q2` Light / Balanced / Max in every plan; `Q3` the role-change table and the usefulness metrics; `Q4` the
  source-and-deliverable contract; `Q5` no mandated contract-fed final critic; `Q6` the triggered reporter;
  `Q7` the single-agent versus full-orchestration pilot and the overlap simulation.

## Groups

Three analysts, one group each. The cut is by what the item touches: the launcher, the driver and the harness
(A); the roles, the assurance steps and the coordinator's own context (B); the plan, the user-facing text and
the measurement policy (C).

| Group | Findings | Proposals | #16 | Count |
|---|---|---|---|---|
| A, mechanics | F1, F7, F8, F11, F12, F17, F19 | P1, P6, P7, P10 | Q1 | 12 |
| B, process and roles | F3, F4, F5, F6, F9, F10, F15, F21 | P2, P3, P4, P8, P11 | Q3, Q4, Q5 | 16 |
| C, plan, user-facing text, measurement | F2, F13, F14, F16, F18, F20, M1 | P5, P9, P12, P13, P14 | Q2, Q6, Q7, K | 16 |

Coverage: 21 findings + M1 + 14 proposals + K + 7 of #16 = 44 items, each in exactly one group.

## What an analyst returns per item

One row each, in `result`:

    id | claim (one line, as the issue states it)
       | status at 1bbab5b: fixed-on-main | still-true | not-a-defect | unknown, with the evidence (file:line, or
         the changelog line) and its level (1 the line resolves; 2 an independent reader would agree; 3 made to
         happen)
       | verdict: fix-now | fix-after-measurement | do-not-fix | already-fixed, with the reason in one or two
         sentences
       | how: the smallest change that answers it (a page sentence, a mechanism such as a script, a default, a
         generated fragment or a behavioural regression in evals, or an experiment protocol), its cost class
         S / M / L, and whether it is a sentence or a mechanism (M1: sentences have not held)
       | open: what the analyst could not decide with read rights

## Verification

- Split critic (Codex Astra A1) reads this file, not the subject, before the fan-out.
- Refuters of the other family, one per analyst: default `refuted` when uncertain; a finding is a row whose
  status or verdict changes.
- A live prober (Codex Terra T1) runs the check behind every `fixed-on-main` row, for level 3 where a command
  can make the behaviour happen.
- An architect (Fable) drafts the delta for every `fix-now` row that survives refutation.
- A judge (Codex Astra A2) rules on every item, reading the tree itself; `unknown` where its decisive check did
  not run, naming it.
- A completeness critic (Opus) reads the request, the answer and its evidence before the answer goes out.

## Composition

Max, chosen by the owner («го макс», 2026-09-27) from the three tiers #16 asks every plan to offer. Coordinator:
Fable 5.1. Caps: one Fable and one Astra alive at a time, six alive, two Opus and two Sol at a time (the owner's
note of 2026-09-12). Codex agents run without network; every agent reads only; the foreman writes nothing; the
orchestrator writes only this directory and its temporary directory.
