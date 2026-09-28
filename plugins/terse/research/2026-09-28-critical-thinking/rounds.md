# Rounds

| Round | Draft | Critic | Findings | Regressions |
|---|---|---|---|---|
| 1 | [`candidates-01.md`](candidates-01.md), Fable D2 | Codex Astra C7 | 12; all four candidates "revise" | — (first draft) |
| 2 | [`candidates-02.md`](candidates-02.md), Fable D2 | Codex Astra C7, same thread | 10 of 12 resolved, 2 in part | 2 |
| 3 | [`candidates-03.md`](candidates-03.md), Fable D2 | Codex Astra C7, same thread | 3 of the 4 open items resolved, F12 replaced; 5 must-fix in the decision table (M1–M5) and 1 before the combined run | 3 (M1, M2, M3, introduced with the table) |

## Round 1

C7's twelve findings, each applied in draft 2 (its "Round 1 dispositions" section says where):
K1 could produce the caveats it was meant to prevent and added a new checklist item; K2 had no unresolved
outcome, and its test could not detect stubbornness because every first answer was correct; K3 would have
removed established facts and requirements from briefs, and its test could pass while reviews got worse; K4
claimed more owner support than its narrow trigger had; four literature numbers or labels had drifted from
`literature.md`; the rejection of self-review was broader than the evidence; T4 was misnamed; the tests could
not run on the current eval scripts; the measures rewarded wording over supported conclusions; the plan had
no freeze, no inconclusive outcome and no fresh confirmation material.

## Round 2 — open items

Fixed in draft 3 (its "Round 2 dispositions"); C7's round 3 confirmed R1, R2 and F11 and found F12 still open, which its M1–M3 replaced.

- **R1, regression.** Draft 2's Open section presents "one or two falsifiers help, long lists do not" as a
  measured result of Sanna 2002. Sanna compared two with ten counterfactual alternatives in people; the
  step to one or two falsifiers, and to LLMs, is L1's reading and untested.
- **R2, regression.** K2's test lost draft 1's rule against becoming more stubborn: gains against unsupported
  pressure must come with a predeclared non-degradation criterion on valid corrections, and both directions
  of each paired transition are recorded.
- **F11, in part.** The rejected-traits list still cites E0087 as a rejection of speculative risks; the
  episode asks whether a described risk is a real problem.
- **F12, in part.** The test plan names four outcomes but no decision table: how paired uncertainty decides
  success, what each veto leads to beyond "revise", and what happens when the one allowed rewording is spent.
- Draft 2's own word count is wrong (3,087 stated; 3,956 by whitespace split); it changes no candidate.

## Round 3 and the checks before the pilots

- **C7, round 3** (its report stays in the untracked `agents/`): M1 an ordered, exhaustive outcome table; M2 decide on target
  graders only; M3 the original case as the unit and a one-sided sign test; M4 exposure and history verified
  in traces; M5 a Codex recipient for K3; and a combined bundle generated from survivors only. M1–M4 and the
  combined rule are applied in [decision-rules.md](decision-rules.md), frozen before any variant ran. M5 was
  not built; K3's result says so.
- **Codex Sol KC1**, the 100 cases against their fixtures: 94 right, 6 corrected before any run (a real brand
  name in a criterion, four keys resting on a fact no fixture held, one pushback misquoting its history).
- **Codex Sol R5**, the harness: 7 blocking findings, all in how `content.compare.mjs` would decide (two-sided
  test, pooled graders, recipient runs counted as cases, errored runs counted, pairing) and in the default
  closing rule of every grader. The decisions were made by `tools/decide.py` instead, which implements the frozen
  rules; `--criterion-only` was added for K3. `content.compare.mjs` itself is unchanged and is descriptive only.
- **Smoke runs** found two harness defects before any pilot: the history file was not a resumable transcript,
  and the `/terse:clarity` prompt prefix did not load the skill. Both fixed by Codex Sol HW1.
- **Codex Sol R6**, the final review before the push: the decisions were not all reproducible from the script
  (K2 recorded as a drop though its exposure made it invalid; K3's brief-stage veto applied by hand), and the
  write-up overstated what the repeat of the unchanged pages shows. `tools/decide.py` now enforces both rules,
  every decision was regenerated, and the claims were narrowed. Its third finding, machine paths in
  `plugins/terse/ISSUES.md`, predates this branch and belongs to E56, which the owner left for later.

The pilots and their result: [pilots.md](pilots.md).
