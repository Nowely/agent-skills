# Cross-review of the implementation

Codex Sol R1, 2026-09-27, read agent in the worktree, effort medium, five-field schema; verbatim from its report. 1,670,100 tokens (1,535,488 cached input), exit 0, `receiptOk: true`. It read Opus W1's diff (2,496 lines) against HEAD 7133095 and design v4.

## result

Codex Sol R1: changes requested, 6 findings, 5 block a merge
F1 [merge-blocking] settlement — plugins/entrust/plugin/skills/codex/scripts/driver.mjs:3114-3116,2920-2941: repeating one server request with the same rpcId creates two mailbox requests, overwrites entryByRpc, and can send two responses for that rpcId; level 2 reading; violates v4 C18: “single consumption”.
F2 [merge-blocking] launcher — plugins/entrust/plugin/skills/codex/scripts/agent-run.mjs:294-309: `--new --approvals --dir <inside-state> --report-file <outside-state>` passes because containment checks `dir`, not `report`; level 2 reading; violates v4: “`--new --approvals` ... refuses a report outside the state directory.”
F3 [merge-blocking] launcher/pending — plugins/entrust/plugin/skills/codex/scripts/agent-run.mjs:324-342: command text containing a line `COMMAND>>`, or newlines in CWD/ROOTS/FILES, can forge field and boundary lines because only REASON is escaped; level 2 reading; violates v4: “Read the request whole, between the markers `--pending` prints, and approve nothing you have not read.”
F4 [merge-blocking] launcher/decide — plugins/entrust/plugin/skills/codex/scripts/agent-run.mjs:350-383: an unsettled request file absent from `pending` is accepted and reported `DECIDED=`, although no driver need be polling it; level 2 reading; violates v4: “The poll, the three commands and the re-arm are v3's,” whose `--decide` contract refuses IDs not in pending.
F5 [merge-blocking] launcher/receipt — plugins/entrust/plugin/skills/codex/scripts/agent-run.mjs:189-202 and plugins/entrust/evals/agent-run.test.mjs:533-553: a stale decision present before driver expiry is classified as late solely because settlement was not by the coordinator, and the synthetic test enshrines this without timing or identity; level 2 reading; violates v4’s distinct `approvalsStale`/`approvalsLate` counts and definition of late as a decision published after settlement.
F6 [non-blocking] suites — plugins/entrust/evals/lib/harness.mjs:42-46 and plugins/entrust/evals/protocol.test.mjs:1064-1069: when the parent has no TMPDIR the harness deliberately leaves it unset and the required symlink-containment case skips, despite the driver creating a private TMPDIR; level 2 reading; violates v4’s suite requirement that `filechange-symlink` be tested as outside.
Unarmed regression: none found at level 2 beyond intended v4 changes: auto-yes for rights-covered file changes, read-level WRITABLE roots, and the new protected-root check for caller TMPDIR; otherwise the exit ladder, retry guard, refusal reporting, and no-channel path remain structurally unchanged.

## evidence

- Read the complete 02-design-v4.md, including Changes from v3 and The mechanism, end to end; read 01-probe.md and 01-probe-2.md.
- Reviewed w1.diff and working-tree driver, launcher, fixture, protocol/CLI/agent-run/lock/agent-contract suites, lib/harness.mjs, and lib/scenarios.mjs.
- Ran `node plugins/entrust/evals/protocol.test.mjs`: all 176 passed.
- Ran `node plugins/entrust/evals/cli.test.mjs`: all 130 passed.
- Ran `node plugins/entrust/evals/agent-run.test.mjs`: all 21 passed.
- Ran `node plugins/entrust/evals/agent-contract.test.mjs`: all 14 passed.
- Ran `node plugins/entrust/evals/lock.test.mjs`: exit 1; 60 cases total, 57 passed, 1 skipped, 2 failed. Exact failures: “the driver had no child to signal” in the paired SIGTERM grace case; “a recycled pid still wedged the directory: exit 10” in the recycled-pid case.
- No Codex turns were run. All behavioral findings are level 2 readings; suite totals are observed level 3 executions from this turn.

## open

- The lock suite’s two failures concern existing signal/lock behavior; whether this diff caused either is unknown.
- No suite covers rename `move_path`, file changes under `.git`/`.codex`/`.agents`, duplicate rpcId delivery, pending-marker collisions, or `--decide` against an unsettled request absent from pending. The corresponding implementation behavior was reviewed only at level 2.
- The real server emitted no repeated approval request during the measured 180-second hold, but whether duplicate rpcId delivery is impossible is unknown.
- The global harness TMPDIR relocation did not visibly weaken an existing case on this machine; portability is reduced only when the invoking environment leaves TMPDIR unset.

