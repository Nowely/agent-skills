# Verification of the fix round

Codex Sol R2, 2026-09-28 00:0x, read agent in the worktree, effort medium, five-field schema; verbatim from its report. 949,681 tokens (847,744 cached input), exit 0, `receiptOk: true`. The brief said twelve findings and enumerated thirteen; R2 counted thirteen.

## result

Codex Sol R2: changes requested, 12 of 13 fixed, 1 partly, 0 not (the task says 12 but enumerates 13).
R1 F1 — fixed. driver.mjs:3226-3229 suppresses repeated rpcIds before creating another entry or response. Pre-fix failure case: protocol.test.mjs:1233 “a request delivered twice under one id is offered once and answered once”.
R1 F2 — fixed. agent-run.mjs:339-341 validates both report and agent directory containment. Pre-fix failure case: agent-run.test.mjs:421 “--new --approvals makes approvals/ … and a directory outside … is refused”, specifically “--dir inside, report outside” at :443-450.
R1 F3 — fixed. agent-run.mjs:223-232 escapes every field/list item; :378-381 uses a fresh command delimiter absent from the command. Pre-fix failure case: agent-run.test.mjs:581 “--pending escapes every field … and fences the command with a fresh token”.
R1 F4 — fixed. agent-run.mjs:402-404 refuses a request absent from pending. Pre-fix failure case: agent-run.test.mjs:648 “--decide refuses what it cannot publish…”, specifically 6-ffffffff at :660-668.
R1 F5 — fixed. driver.mjs:3035-3044 classifies identity mismatch as stale, while agent-run.mjs:215-219 distinguishes stale identity from a valid unconsumed late decision. Pre-fix failure cases: agent-run.test.mjs:487 “a decision naming another run … reads as stale … never as late” and protocol.test.mjs:1254 “a stale decision on disk when the deadline fires is stale, not late”.
R1 F6 — fixed. harness.mjs:36-46 always supplies a sibling TMPDIR, so protocol.test.mjs:1093 “a link inside $TMPDIR that points outside is outside” executes when the parent lacked TMPDIR; pre-fix it skipped rather than failed.
C2 F1 — fixed. driver.mjs:3115-3118 rejects mailboxes inside every driver-owned state subdirectory, including another run’s private tmp. Pre-fix failure case: cli.test.mjs:292-295, `happy --approval-dir mailUnderRunTmp`.
C2 F7 — fixed. driver.mjs:3150-3168 serializes stale-owner reclamation with a link-created reclaim marker and rechecks ownership. Pre-fix failure case: cli.test.mjs:970 “two drivers that both find a mailbox's owner dead: one takes it over, the other exits 2 naming it”.
C2 G1 — fixed for the reported case-insensitive aliases. driver.mjs:2909-2910 records guarded-directory inodes and :2924 rejects either matching inodes or folded guarded names. Pre-fix failure case: protocol.test.mjs:1153 “a guarded directory is guarded under every spelling”.
C2 G2 — partly fixed. driver.mjs:2915-2932 rejects static symlinks/missing intermediate directories and fingerprints the path; :3265 repeats the check before :3267 sends accept. Case: protocol.test.mjs:1171 “below the root only existing plain directories…”. What remains, at reading level 2: after the second check, a writable parent can still be renamed and replaced by a symlink before the server applies the accepted path; the sequence still ends with an outside write under plain accept.
C2 G3 — fixed. driver.mjs:3246-3254 requires a child request’s own turn to remain open; :3459-3468 records child turn completion and settles its open requests. Pre-fix failure cases: protocol.test.mjs:699 `filechange-child-late` and :1127 “a subagent's own turn ending settles the requests it left open”.
C2 G4 — fixed. driver.mjs:2951-2963 converts pending-marker failure into immediate expiry/decline, and :2993 stops normal offering afterward. Pre-fix failure case: protocol.test.mjs:1198 “a pending marker that cannot be written settles the request at once…”.
C2 G5 — fixed. driver.mjs:3017-3027 persists settlement before responding and changes an unpersistable accept to decline. Pre-fix failure case: protocol.test.mjs:1214 “an accept whose settlement cannot be written goes out as a decline…”.
Regressions — the G2 mitigation breaks v4’s auto-yes requirement and unarmed behavior: design-v4.md:39-46 says a new file is resolved through its longest existing parent and auto-accepted inside a writable root, but driver.mjs:2923 refuses a missing intermediate directory; protocol.test.mjs:1171 now codifies offering it, and an unarmed run then declines it at driver.mjs:3271-3274. Also, driver.mjs:2924 unconditionally folds guarded names, so on a case-sensitive filesystem an unrelated `.GIT`/`.CODEX`/`.AGENTS` is declined even though the pre-fix unarmed run would auto-accept it; this portability regression is a level-2 reading. No other v4 or unarmed regression was found.

## evidence

- Read the complete R1 and C2 reports and the complete 246-line design v4; inspected the relevant current-tree driver, launcher, harness, fixture, scenarios, and regression cases, plus relevant hunks against HEAD 7133095.
- Ran `node plugins/entrust/evals/protocol.test.mjs`: all 188 passed, exit 0.
- Ran `node plugins/entrust/evals/cli.test.mjs`: all 132 passed, exit 0.
- Ran `node plugins/entrust/evals/agent-run.test.mjs`: all 23 passed, exit 0.
- Ran `node plugins/entrust/evals/lock.test.mjs`: exit 1; 60 total, 57 passed, 1 skipped, 2 failed. Failures: “the driver had no child to signal” and “a recycled pid still wedged the directory: exit 10”. These match the earlier review’s unrelated lock failures.
- No Codex turns were run. The G2 residual race and stated portability/unarmed regressions were not made to happen and are level-2 readings.

## open

- The request’s stated denominator is inconsistent: R1 F1–F6 plus C2 F1, F7, G1–G5 enumerates 13 findings, not 12.
- Whether the real app server binds a file-change target before receiving accept, eliminating G2’s post-check swap window, is unknown; the current code and offline fixture do not establish that.
- Actual behavior of the unconditional guarded-name folding on a case-sensitive filesystem was not run in this turn.

