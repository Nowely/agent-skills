# Cross-review of the second implementation round (v5–v7)

Codex Sol R3, 2026-09-28, read agent in the worktree, effort medium, five-field schema; its report follows. 3,737,606 tokens (3,555,584 cached input), exit 0, `receiptOk: true`. It read Opus W1's uncommitted diff (2,560 lines) against c0d7117, designs v5–v7 and probes 3–5.

## result

Codex Sol R3: changes requested, 3 findings, 3 block a merge
F1 [BLOCK] lens 6 — plugins/entrust/plugin/skills/codex/scripts/driver.mjs:4640-4649. When the feature probe returns no usable rows, the driver omits both feature keys but still orders the model to use the unavailable permission mechanisms and allows an escape only when no path could help. A state-writing tool therefore fails and is reported rather than taking the promised escape path—the outcome already measured in Q7c. This violates design v6:43-45: without either feature, “a failing tool takes the escape path.” Level 2 reading, supported by probe-3:13-16 level-3 evidence.
F2 [BLOCK] lens 4 — plugins/entrust/plugin/skills/codex/scripts/driver.mjs:3385-3405 and :3689-3698. rememberDecline retains each turn’s declined paths in declinedWidenings, but neither child nor root turn/completed deletes the corresponding key. Completed child turns therefore accumulate path records until the root driver exits. This violates design v7:35: “The declined set is kept per turn and cleared with the turn’s other per-turn state at turn/completed.” Level 2 reading.
F3 [BLOCK] lens 5 — plugins/entrust/evals/agent-run.test.mjs:200-225 and :316-334. The signal cases cover launch-only forwarding and a continued --run whose driver handles SIGTERM normally; neither kills the detached keeper’s driver and verifies that the keeper writes 128+signal. A broken keeper status encoding would leave both cases green. This violates design v7:59: “Launcher: --run’s keeper writes exit with 128 + signal for a killed driver.” Level 2 reading.
Regression R1 — F1 regresses the required no-feature escape fallback; the existing no-row tests at protocol.test.mjs:731-749 verify only configuration rows, reporting, and the five-second bound, not tool recovery.
Regression R2 — no additional regression in the previously verified v4 mailbox containment, decision settlement, auto-yes, report, exit-ladder, or launch-only behavior was observed. The two lock-suite failures match the previously recorded baseline failures.

## evidence

- Read CLAUDE.md, 15-owner-round-2.md, all 203 lines of design v5, all 158 lines of v6, all 70 lines of v7, probes 3/4/5, and prior reviews 10/11/12.
- Reviewed the supplied 2,560-line v5-v7.diff and the resulting working-tree sources. A byte comparison confirmed that the working diff for its ten paths exactly equals the supplied diff.
- Compared fake server request, warning, experimentalApi, additionalPermissions, availableDecisions, grant, and decline shapes with P1's recorded Q7d, Q10b, Q11a, and Q11b turns.
- protocol.test.mjs: 206 passed, exit 0.
- cli.test.mjs: 129 passed, exit 0.
- agent-run.test.mjs: 29 passed, exit 0.
- conformance.test.mjs: 116 scenarios and 2,566 messages validated, exit 0.
- swarm.test.mjs: 16 passed, exit 0.
- fidelity.test.mjs: all 15 handshake comparisons agreed, exit 0; its live turn was explicitly not run.
- lock.test.mjs: exit 1; 57 passed, 1 skipped, 2 failed out of 60. Failures were the previously recorded “driver had no child to signal” and recycled-pid lock cases.
- git diff --check exited 0. No Codex turns were run and no repository files were written.

## open

- W1’s named gap remains: glob_pattern entries and special kinds other than root bypass the protected-root filter. The design explicitly leaves them to the coordinator, so this was not counted again.
- Whether a real server honors decline for a command widening remains unknown. Q11b measured decline only for an escape; the fixture cannot establish production semantics.
- The hard-killed-wrapper lifecycle and direct killed-driver keeper status were not exercised in this review; implementation conclusions there remain level-2 readings.
- The feature probe’s detached process-group cleanup was inspected but no descendant-survival probe was run.
- The VCS client under iterative exact grants remains unmeasured, as recorded by probes 4 and 5.
- The baseline post-check path-replacement race from R2 remains unresolved but was not worsened by this diff.

