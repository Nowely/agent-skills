# Audit A: the Codex driver

At `50c66c2` (entrust 0.27.0). Subject: `plugin/skills/codex/scripts/driver.mjs` (4,928 lines). Line numbers are
that file's unless another file is named.

## Verdict

The Codex driver is careful, measured and mostly correct, and about a quarter of it does no work anyone can
reach. Its core is the best engineering of the three drivers, and parts of it should move into the shared layer:
it checks the sandbox the server actually applied, attributes evidence by root thread and owned turn, drives its
fields and exit codes from data tables, delivers the report whole or not at all, and harvests a worktree against
its base commit. Its weight sits in three places:

- **Text.** 1,569 comment lines, about 40% of them narrative, history or restatement, and a 406-line `HELP` for a
  command line that only the launcher calls, with three fixed flags.
- **Features the one call cannot reach.** `--verify` and its two exit codes, the whole `--timeout` wall clock with
  its steer, `--host-home`, and `--attach` outside `attach-pasted.mjs`: about 260 lines of code.
- **Defences that no longer pay.** Each guards against a failure this driver never showed, or one whose cause has
  since moved: the web-search policy reader, worktree reconciliation, the file-change auto-accept, duplicate-id
  counting.

Rights are not disproportionate as code: about 16% of the file, and almost none of it duplicates what the server
enforces. They are disproportionate as text. Meanwhile the invariant the elaborate write lock rests on no longer
holds. Since 0.26.0 the state root follows `$TMPDIR`, so two writers with different `TMPDIR` values take different
locks and both write the same directory (reproduced, D1). About 1,450 lines (29%) can go, about 1,250 of them at
high confidence, without losing a reason or a safety property.

## Method

- **Read.** The whole driver; `codex/SKILL.md`; the references `environment-and-internals.md`, `incidents.md`,
  `result-gates.md`, `approvals.md` and `parity.md`; `ISSUES.md`; the CHANGELOG entries behind each mechanism; the
  launcher's `statusLines` and spawn; `drivers.mjs`; `temp-dir.mjs`; and the report readers in `swarm.mjs`,
  `cleanup.mjs`, `prepare-feedback.mjs` and `agent-orders.mjs`.
- **Ran, offline, scratch in `/tmp/audit-a-IafilJ`.**
  - One happy run on `evals/fake-app-server.mjs`: 68 top-level report fields, 69 with a prompt file.
  - The D1 reproductions.
  - Five suites:

    | Suite | ok | FAIL |
    | --- | ---: | ---: |
    | protocol | 185 | 2 |
    | lock | 65 | 6 |
    | cli | 134 | 2 |
    | worktree | 30 | 0 |
    | conformance | 109 | 0 |

    The 10 failures are the process-group-sweep and permission cases that the 0.26.0 and 0.27.0 changelogs already
    record as failing locally as root in a Linux container and passing in CI.
- **Comment estimate.** A deterministic sample, every 9th of the 514 comment blocks (57 blocks, 167 lines),
  classified by hand: 70 lines (42%) can go without losing a reason.

## Findings

### 1. A quarter of the driver serves flags the one call cannot pass (overcomplication)

- **Evidence.**
  - The launcher spawns the driver with `--prompt-file`, `--report-file` and `--approval-dir` and nothing else
    (`orchestrate/scripts/agent-run.mjs:454`). `--run` takes no pass-through flags (`agent-run.mjs --help`).
  - `TIMEOUT`, `IDLE_TIMEOUT` and `MAX_COMMANDS` are refused as fields (224-228).
  - `VERIFY` is refused without `--allow-prompt-verify` (778-779), which no caller passes.
  - `--host-home`, `--attach` and `--answer-json` are not fields at all.
- **What never runs under the launcher as a result.**
  - The three wall-clock rungs (4572-4615), the wrap-up steer (4238-4251), the budget sentence of the standing
    rules (4531-4533) and the effort-against-timeout warning (4805-4806).
  - The verifier (4093-4213), its rungs 9 and 12 (282-285), `--verify-sandboxed` (2598-2603) and
    `ENTRUST_VERIFY_FLOOR_MS`.
  - Only `attach-pasted.mjs:316` reaches `--attach`, and it runs the driver outside the launcher (finding 13).
- **Pages that point at the unreachable route.**
  - `SKILL.md:121` tells the coordinator to "Declare gates on the command line", which it has no way to do.
  - `parity.md:32` offers `--host-home` for a subagent's MCP tools, which is unreachable the same way.
- **Unification.** The Claude and OpenCode drivers default to an 1,800 s wall clock
  (`claude/scripts/driver.mjs:30`, `opencode/scripts/driver.mjs:28`); a Codex agent has none.
- **Cost.** About 160 lines of verifier code and 100 of wall-clock code, 31 more lines of HELP, half of
  `result-gates.md`, two exit codes and one test seam.
- **What it protects.** `--verify` is "the one piece of evidence the model cannot author" (2921). The steer answered
  "Five of seven agents lost to the wall clock" (`incidents.md`); the default then became no wall clock.
- **Proposal.** Wire or delete, per feature.
  - `VERIFY`: `--run --verify CMD` on the coordinator's own command keeps the injection argument (741-742).
  - `TIMEOUT`: decide whether Codex gets the other drivers' default.
  - If neither is wired within a release, delete both.
- **Gain.** About 260 driver lines, or three features made real.
- **Risk.** Deleting `--verify` loses the strongest gate, but every coordinator has already lost it.
- **Confidence.** High that these are unreachable; medium on deleting them.

### 2. `HELP` documents a command line nobody types (water)

- **Evidence.**
  - `HELP` spans 321-726 (406 lines). `--help` prints 180 lines and `--help-all` 404; the cap is 200 and is called
    "a screenful" (`evals/cli.test.mjs:1072-1086`). The Claude driver's `--help` is 22 lines, OpenCode's 14.
  - The pages call it canonical (`environment-and-internals.md:6`, `SKILL.md:228`). Yet the coordinator only ever
    writes a prompt file and calls the launcher, and it reads exit codes through the launcher's status lines.
  - It restates the references and they restate it. The escalation fields appear at 589-608 and again at
    `environment-and-internals.md:52-68`. The mailbox rules appear at 488-527 and again at `:88-114`.
  - It lists six test seams over 35 lines (655-679), and the flags of finding 1.
- **Cost.** 406 lines, 8% of the file.
- **What it protects.** One place for flag semantics.
- **Proposal.** Keep about 70 lines: the three usage forms, the field list (rendered from `FIELDS`), the ladder
  (rendered from `LADDER`), the state subdirectories and a pointer. Move what exists nowhere else to
  `environment-and-internals.md`: the header grammar (421-433), report-file publication and the `$TMPDIR` layout.
  Move the help pins at `cli.test.mjs:1036-1070` and in `agent-contract.test.mjs` with it.
- **Gain.** About 335 driver lines; about 265 net after roughly 70 move.
- **Risk.** A hand user loses inline detail that stays one link away.
- **Confidence.** High.

### 3. Comments: about 40% is narrative, repetition or stale (water)

- **Evidence.** The 42% sample above. The same fact is stated many times:
  - An interrupt discards the in-flight message: seven times (170-171, 2939-2942, 3592-3593, 3976-3977, 4068-4070,
    4423-4424, 4577-4578), plus HELP 617-620.
  - The server wraps commands in `/bin/zsh -lc`: five times (3448-3450, 3994-3997, 4034-4035, 4048-4049, HELP
    445-447).
  - Root-only evidence and children as liveness: seven times (14-16, 2958-2960, 3351-3353, 3362-3366, 3527-3530,
    4215-4217, 4373-4375).
  - PID namespaces sharing a pid: three times (1407-1409, 1501, 1638-1639).
  - The spawn bound: twice (123-124, 1869-1871).
- **Plain history.**
  - "They were scattered over the file…" (60-61).
  - "which once reached the parser as `unknown argument: undefined`" (198).
  - "Hoisted out of argvFromPromptFile's per-line loop…" (233).
  - The 64-children measurement (1423-1426).
  - The test advice inside `acquireLock` (1777-1778).
  - "Measured 2026-09-12…" (2699-2701).
  - "29 of 29" (4831-4832).
- **Comments that restate the code.** 1239, 1273-1274, 1392, 2504, 3703, 4334.
- **Comments that are wrong** (D4). 1107-1115, 1969-1972, 146-153 and 59-61.
- **Keep.** The non-obvious reasons:
  - The protocol invariants (11-18).
  - The opt-out list (167-171).
  - Each `LIMITS` reason, cut to one line.
  - link(2) over rename(2) (1124-1128).
  - The TOML escape of DEL and C1 (1234-1235).
  - The synchronous root ids (3417-3420).
  - `turnIdOf` (2951-2953).
  - `bareCommand` and `PROBE_RE` (3994-4013, 4026-4036).
  - The reviewer axis (4756-4762).
  - `excludeTurns` (4765-4767).
  - `TMPPREFIX` (4650-4653).
  - The `sandbox` parameter suppressing the profile (4750-4753).
  - The synchronous quiesce (2786-2790).
- **Cost.** About 1,420 comment lines remain outside the mechanisms the other findings remove.
- **Proposal.** Keep each reason once, in one line where one will do. Move measurements and history to
  `incidents.md`, which already holds most of them.
- **Gain.** About 570 lines.
- **Risk.** A reason lost in the cut. Review the cut against `incidents.md` before merging it.
- **Confidence.** High on the share, medium on the exact count.

### 4. Report fields: 24 of 69 are read or acted on, 27 have no reader (water)

Classification of the 69 top-level fields of a prompt-file run, checked by grep over the launcher, the tools,
every page and the evals:

- **Read by a script (16).**
  - The launcher's status lines (`agent-run.mjs:564-578`): `ok`, `exitCode`, `turnStatus`, `turnError`,
    `threadId`, `model`, `receiptOk`, `answer`, `approvalsAutoAccepted`.
  - `prepare-feedback.mjs:578-586`: `effort`, `reasoningEffort`, `tokenUsage`, `timing`, `commandsSucceeded`,
    `commandsFailed`, `commandsDeclined`.
  - `agent-orders.mjs:8-11` reads `ok`, `receiptOk` and `threadId`, already listed above.
- **A page tells the coordinator to read it (8).** `answerPath`, `escalations` (with entries' `outcome` and
  `cause`), `commandsBlocked`, `commandsProbeNegative`, `commandsPipedToPager`, `fileChangesFailed`, `verify` and
  `verifySkipped`. The last two are unreachable (finding 1).
- **Described on a reference page, with no page saying to act on it (18).** `answerTruncated`, `answerPartial`,
  `tmpDir`, `turnDiffPath`, `subagentThreads`, `receiptPath`, `receiptWhy`, `codexVersion`, `codexVersionPinned`,
  `configInherited`, `promptFileFields`, `approvalsAccepted`, `approvalsStale`, `approvalsLate`,
  `approvalsDuplicate`, `commandsMatchingExpectation`, `rateLimits`, `fileChanges`.
- **No reader outside the driver's own help and its tests (27).**
  - Echoes of the caller's input: `level`, `network`, `cwd`, `writableRootsRequested` (not even a test reads it),
    `expectCommand`, `approvalDir`, `codexHome`, `driverVersion`, `resumedFrom`.
  - Derivable from other fields: `expectationOk`, `commentaryOnly`, `answerPhase`, `filesTouched` (only the live
    gate's `evals/lib/gate-checks.mjs`).
  - Unread diagnostics: `sandbox`, `cut`, `interactions`, `unparsedLines`, `transientRetries`, `reasoningSummary`,
    `otherItemCounts`, `otherItems`, `receiptOriginator`, `receiptModelProvider`, `receiptCwd`, `commentaryPath`,
    `answerPartialPath`.
- **Conditional fields with no reader.** `outputAttempts`, `schemaKeywordsUnchecked`, `schemaSizeCaps` (an echo),
  `answerJsonError`, and seven worktree fields: `worktreeRepo`, `worktreeBase`, `worktreeRestored`,
  `worktreeRemoved`, `worktreeHarvested`, `worktreeDiffStat`, `worktreeFleet`.

The rest of the finding:

- **Cost.** About 80 lines in `writeReport` and its collectors, and about 1 KB of a 3 KB report that a coordinator
  reads whole.
- **Proposal.** Drop about 22: the echoes, the derived fields, the three receipt provenance fields,
  `unparsedLines`, `answerPartialPath` and the seven worktree extras. Keep `cut`, `interactions`, `sandbox` and
  `turnError`, which explain a verdict. `reasoningSummary` and `otherItems` are the owner's call: they give the
  visibility a Claude subagent's transcript has, but nobody reads them.
- **Gain.** About 80 lines, and a field set nearer the other two drivers' 40-42 fields (auditor C).
- **Risk.** An external consumer of a dropped field. None was found.
- **Confidence.** High on the classification, medium on which diagnostics to keep.

### 5. The write lock is precise in the wrong place (overcomplication, with D1)

- **Evidence.**
  - The lock spans 1514-1860, plus `LIMITS` 117-122 and the seam's help 662-669: 361 lines, 246 code and 107
    comment.
  - It holds a link and an owner file, a descriptor and dev:ino, a second process identity, the app-server group,
    a reclaim marker with rename-and-verify takeover, and a one-hour backstop.
  - Each piece answers a measured race. "Stale-lock stampede" (`incidents.md`): six of eight contenders violated
    the lock. E44: update and release acted on the path, 10 of 10 (CHANGELOG 0.21.0). The lock suite has 74
    cases.
- **What it protects.** Two Codex write agents in one directory.
- **Can the failure still happen?** Only between Codex writers that share a `TMPDIR` (D1). The OpenCode and Claude
  drivers take no lock at all: `grep -i lock` finds none in either driver or in `drivers.mjs`. And orchestrate's
  plan gives each writer its own directory.
- **Proposal.**
  - (a) Fix the anchor (D1); without that the rest is moot.
  - (b) Keep the algorithm; replacing it reopens races that were measured. Cut its comments by about 50 lines,
    which is counted in finding 3.
  - (c) Owner's decision. Either move the lock into `drivers.mjs` so all three adapters' writers exclude each
    other, or add a plan-time refusal of overlapping `write` rows at `--plan` and `--new` (about 20 lines in the
    launcher) and keep the runtime lock for runs with no plan.
- **Gain.** (b) about 50 lines; (c) protection for the two drivers that have none.
- **Risk.** Low for (a) and (b).
- **Confidence.** High on (a) and (b), medium on (c).

### 6. The web-search policy reader guards an off-by-default, macOS-only substitution (overcomplication)

- **Evidence.**
  - The reader spans 1316-1362, plus the seam's help 659-661, `ENTRUST_POLICY_SEAM`, and two cli cases from E46.
  - It spawns `plutil` twice, then base64-decodes and regex-scans TOML.
  - It fires only with `WEB_SEARCH:` set (off by default, 2618) and the managed plist present (macOS, 1319).
  - Its own refusal misled coordinators twice: they swapped in a mode nobody asked for (1346-1349). The answer was
    a longer refusal.
- **What it protects.** A managed policy that silently clamps a requested `live` mode to `cached` (measured,
  1316-1317). That is a freshness difference, not a safety one.
- **Proposal.** Delete the reader. Where the plist exists and a mode was asked, print one stderr line, or nothing.
- **Gain.** About 50 lines, one seam and its tests.
- **Risk.** A managed Mac gets cached results for live ones, silently.
- **Confidence.** Medium.

### 7. The file-change auto-accept: the one place the driver grants, and its cause may be gone (rights)

- **Evidence.**
  - `coveredByRights` (3024-3071) and its use (3378-3395) accept a file change the server asked about, when every
    path lies inside the writable roots.
  - The reason (CHANGELOG 0.21.0, around line 1130): all ten measured requests were writes into the agent's own
    `$TMPDIR`. Codex's edit tool compares spellings, and a `/private/var/…` path asked where `/var/…` did not;
    the paths on record are `/private/var/folders/…/T/…`
    (`research/2026-09-27-approval-channel/06-owner-round.md:23`).
  - Since E92/E126 the run's `$TMPDIR` is built on a realpath'd root. `temp-dir.mjs` `temporaryRoot` and
    `directoryChain` returned `<real>/entrust/…/agents/agent-…` when `TMPDIR` was a symlink (run here). So the
    root the server is handed and the path the model writes are now spelled the same way.
  - The last recorded `auto=1` is from before that change (`09-live-gate.md:11`).
- **Cost.** About 50 lines.
  - The auto-accept itself, plus `GUARDED_NAMES`, which repeats the sandbox's own read-only `.git`/`.codex`/`.agents`
    rule only because the accept would bypass it.
  - The `rights` cause, the `approvalsAutoAccepted` field and the launcher's `auto=` token.
- **What it protects.** An agent's turn spent asking to write its own temporary directory ("A read agent asked for
  a file", `incidents.md`).
- **Proposal.** Count `auto=` in live runs on macOS under 0.26 or later. If it is zero, decline those requests with
  cause `outside`, as before 0.21.0, and delete the accept.
- **Gain.** About 50 lines, and the driver stops granting anything itself.
- **Risk.** If spellings still differ somewhere (a symlinked repository), agents re-ask.
- **Confidence.** Medium: this needs a live measurement on macOS.

### 8. Rights overall: about 16%, almost none duplicating the server; the minimal version is about half (rights)

- **Rights proper, about 400 lines.**

  | Part | Lines |
  | --- | ---: |
  | Prompt-file trust boundaries (RIGHTS first, `VERIFY` gate, command-line-only fields, 730-831) | about 40 |
  | `checkRoot` (1041-1105) | 73 |
  | Sandbox configuration in `setup` (2554-2568, 2610-2648) | 45 |
  | Effect assertions (2368-2479) | 112 |
  | Policy and reviewer assertions (4750-4790) | 20 |
  | The auto-accept | 47 |
  | Mailbox placement and ownership (3229-3290) | 62 |

- **Rest.** The approval channel (offer, poll, settle, record) adds about 300 lines, and rights and approvals in
  `HELP` about 104 (326-371, 474-527). In all, about 800 lines (16%), against the inventory's 10% plus 7% by area.
- **Duplication of the server.** Only finding 7.
  - Everything else configures the server, checks its echo, or guards what the server does not know about: the
    state directory, the mailbox and the home.
  - The mailbox placement is checked twice, by the launcher's `--new` and by `claimMailbox`. The driver's copy is
    the one that matters when the driver is run directly.
- **Minimal version with the same safety.**
  - Sandbox configuration from RIGHTS.
  - The effect, policy and reviewer assertions.
  - `checkRoot`.
  - The refusal map with decline-by-default.
  - A mailbox outside every root.
  - RIGHTS first and `VERIFY` gated.
  - The command-request channel.

  That is about 250 lines of code where there are about 400 now, plus the channel. The difference is comments,
  the auto-accept (finding 7) and the counters (finding 10).
- **Confidence.** High that nothing here duplicates the server's enforcement; medium on the minimal-version size.

### 9. Worktrees: the harvest pays, the reconciliation defends against a leak this driver never had (overcomplication)

- **Evidence.** 412 lines, 281 of them code.
  - The value is the harvest against the base commit, committed, staged, unstaged and untracked work alike, and
    preserving on doubt (2233-2304). Keep.
  - Reconciliation (2011-2070) and the ledger-before-add rule cite "22 of 64 such trees held uncommitted work"
    (1969-1972). But `incidents.md:105-116` re-measured those trees: "**zero** created by this driver".
  - The exit handler's last resort (2319-2366) covers every exit except SIGKILL.
  - `cleanup.mjs:789-805` already lists `codex-*` trees and the ledger.
  - Seven report fields have no reader (finding 4).
- **Proposal.**
  - Drop the driver-side reconciliation. Keep the ledger entry, which cleanup reads for liveness.
  - Drop the seven fields.
  - Correct the comment at 1969-1972.
- **Gain.** About 60 lines plus the fields.
- **Risk.** A SIGKILLed driver's clean tree stays until `/entrust:cleanup`, as OpenCode and Claude trees already do
  (E139).
- **Confidence.** Medium.

### 10. Approval counters the launcher already computes, and a defence against an id never seen twice (water)

- **Evidence.**
  - `approvalsStale` and `approvalsLate` (3010-3012, 3182, 3219-3227): the launcher's `RECEIPT=` counts late and
    stale requests from the mailbox itself (`agent-run.mjs:565-566`), not from the report.
  - `approvalsDuplicate` (3344-3350) guards against a JSON-RPC id delivered twice. That was never observed: "The
    real server emitted no repeated approval request…" (`research/2026-09-27-approval-channel/10-review-sol.md:31`).
- **Proposal.** Drop the three counters and their fields. Keep each request's `settled.decisionFile`.
- **Gain.** About 25 lines.
- **Risk.** Low.
- **Confidence.** Medium-high.

### 11. Transient retry: no recorded firing (overcomplication, small)

- **Evidence.**
  - `RETRYABLE` and `startTransientRetry` (3737-3764) and the guard (3632-3644) retry only before any observable
    work.
  - The research has no live record of a retry; the only mentions are design-time test cases.
  - Codex already retries one of these kinds itself before surfacing it (3742-3743).
- **Proposal.** Keep it only if a live report shows `transientRetries` non-empty; otherwise delete it with the
  field.
- **Gain.** About 30 lines.
- **Confidence.** Low.

### 12. Keep, with trims: isolated home, receipts, corrective turn, exit ladder

- **Isolated home and inherited config.**
  - 189 lines. Keep: "Isolation" measured 95 of 157 host-home delegations reading `~/.codex/plugins/cache` first.
  - Trim about 35 comment lines, counted in finding 3.
  - The last-known-good fallback and the probe retry (1484-1499, about 15 lines) can go: a failed probe already
    means the account default, as on a fresh home.
  - Carry `model_provider` (D3).
- **Receipts.**
  - 58 lines (3822-3879). Keep `receiptOk`, `receiptPath` and `receiptWhy`. The launcher's `RECEIPT=` and
    `agent-orders.mjs:8` read `receiptOk`, and it also proves the sessions link works.
  - Drop the three provenance fields, which nobody reads.
  - Restate the threat: 3822-3836 and 4293 call the receipt unforgeable, while `environment-and-internals.md:264-266`
    rightly says a process that can fabricate the report can fabricate these fields too. "The unverified wrapper"
    is now answered by the launcher, a script, reading the report file.
- **Corrective turn and caps.** About 60 lines. Keep: the five-field schema every orchestrated agent uses carries
  `maxLength` and `maxItems` (`five-fields.schema.json:5-8`), so the local cap check, the clip and the one
  corrective turn run routinely.
- **Exit ladder.** 63 lines. Keep; it is a strength (finding 14). Drop rungs 9 and 12 with `--verify`. Coordinators
  act on four classes (`orchestration.md:99-108`); 13 codes cost little because the ladder is data.

### 13. `--attach` is a second call path with no mailbox (overcomplication, unification)

- **Evidence.**
  - The driver's part is 15 lines (238-241, 913-923).
  - The only caller is `attach-pasted.mjs:316`, which runs the driver directly. It gets no `--approval-dir`, so
    every command request is declined (3396). It gets no keeper, no status lines and no agent card.
- **Proposal.** Take attachments at `--new`: the launcher copies the files into the agent's directory and records
  them. The injection reason (743-745) does not apply to the coordinator's own command.
- **Gain.** One call path for every agent.
- **Confidence.** Medium.

### 14. Strengths the other drivers should learn from (strength)

- **It checks what the server applied.**
  - The effect assertions (2398-2479) refuse a sandbox that is wider or narrower than asked, at both levels.
    Behind them is a measured profile typo that kept the id and dropped the grant
    (`environment-and-internals.md:435-458`).
  - The policy and reviewer assertions (4776-4786) answer an MDM clamp and `auto_review` routing, which are
    invisible in the sandbox object.
  - The Claude driver records `permissionMode` but never refuses on it (`claude/scripts/driver.mjs:386`); OpenCode
    sends its rules without reading them back.
- **Evidence attribution fails closed.**
  - Root thread and owned turn (2948-2963).
  - Ids assigned synchronously inside the dispatch burst (3412-3430).
  - Early events held, completion replayed last (2983-2998).
  - So no child, stale turn or earlier resumed turn can satisfy a gate.
- **Contracts as data.**
  - `FIELDS` (211-236) drives the parser, the help and the refusal lists.
  - `LADDER` (258-304) drives the verdict and the help, and each rung can be tested on a context built by hand.
  - `LIMITS` gives each number its reason.
  - The shared `EXIT` came from here; the others' header sets (`claude/scripts/driver.mjs:27`) could render their
    help the same way.
- **Delivery holds "missing means unknown".**
  - link(2) publication at 0600, never over an entry (1117-1175).
  - Pre-turn refusals are published as reports (1186-1191).
  - The answer is persisted as it arrives (3478), and the partial is rebuilt from deltas on a cut (3594-3599,
    4071).
- **Driver-spawned git is disarmed.**
  - `GIT_SAFE` and `GIT_DIFF_SAFE` (1872-1879) are a measured fix ("Hooks run by the driver's own git").
  - The shared `drivers.mjs` `git()` (124-127) and `worktreeFacts` (145-157) run plain `git diff` and `git status`
    in an agent-written tree with the caller's rights. Whether an OpenCode or Claude agent can rewrite its tree's
    `.git` file is auditor D's question.
- **Harvest against the base commit.** Already copied into `worktreeFacts` (E136, 0.27.0).

## Lines each proposal removes

| # | Proposal | Driver lines | Elsewhere | Confidence |
| --- | --- | ---: | --- | --- |
| 2 | `HELP` to about 70 lines | −335 | +70 in `environment-and-internals.md`; help pins move | high |
| 3 | Comments in what remains, each reason once | −570 | some moves to `incidents.md` | high (share), medium (count) |
| 1 | `--verify` family, unless wired | −160 | −40 in `result-gates.md`; rungs 9 and 12; one seam | high (unreachable), medium (delete) |
| 1 | Wall-clock rungs and steer, unless `TIMEOUT` is wired | −100 | | high (unreachable), medium (delete) |
| 4, 9, 12 | About 22 report fields with no reader | −80 | | high |
| 6 | Web-search policy reader | −50 | one seam, two cli cases | medium |
| 7 | File-change auto-accept, after a live count | −50 | the `auto=` token | medium |
| 9 | Driver-side worktree reconciliation | −60 | | medium |
| 10 | Duplicated and never-observed approval counters | −25 | | medium-high |
| 11 | Transient retry, unless shown to fire | −30 | | low |
| | **Total** | **about −1,460 (29%)** | | about −1,245 at high confidence |

The rows do not overlap: comments inside removed mechanisms (about 145 lines) are counted in those rows, not in row
3. Finding 5(c) and finding 13 change protection and unification, not the line count.

## Defects found in passing

### D1. The default state root follows `$TMPDIR`, so write locks and the protected-root guard split by caller

**Cause.**

- `stateDirectory(root = os.tmpdir())` (`orchestrate/scripts/temp-dir.mjs:91-98`) returns `<TMPDIR>/entrust-state`
  when `ENTRUST_STATE_DIR` is unset, and the driver takes it once (1212-1219).
- So the locks (1219), the state-directory refusal in `checkRoot` (1077-1079), the job records behind
  `--resume last`, the worktree ledger and the isolated home all depend on the caller's `TMPDIR`.
- This came with E126 (`CHANGELOG.md:132`).
- The driver's own comment (1107-1115) and `environment-and-internals.md:337-339` still say `$TMPDIR` was rejected
  as the lock's home for this exact reason, which is the incident "State split the lock".

**Reproduction.** On `evals/fake-app-server.mjs`, `ENTRUST_STATE_DIR` unset, `--host-home`:

```sh
S=$(mktemp -d); mkdir -p $S/bin $S/work $S/t1 $S/t2
printf '#!/bin/sh\nexec node %s "$@"\n' "$PWD/plugins/entrust/evals/fake-app-server.mjs" > $S/bin/codex; chmod +x $S/bin/codex
D=$PWD/plugins/entrust/plugin/skills/codex/scripts/driver.mjs
run() { env -u ENTRUST_STATE_DIR TMPDIR=$1 ENTRUST_CODEX=$S/bin/codex FAKE_SCENARIO=idle-silence \
  node $D --host-home --level write --cwd $S/work --idle-timeout 3 --prompt x >/dev/null 2>&1; echo "TMPDIR=$1 exit=$?"; }
run $S/t1 & sleep 1; run $S/t1; wait   # second exits 10: "is in use by entrust pid …"
run $S/t1 & sleep 1; run $S/t2; wait   # both exit 3: two writers in one directory at once
```

Observed here: with the same `TMPDIR` the second run exits 10; with different values both run to their idle cut.

A second run, also observed here: with `TMPDIR=t2`, `--level write --cwd $S/t1/entrust-state/reports/x` exits 0.
With `TMPDIR=t1` it is refused: "it is inside this driver's state directory". So an agent can be granted another
session's state directory, which holds that session's mailboxes. The driver's mailbox rule ("no sandbox this
driver grants can reach in and write a decision", 3229-3233) then holds only within one `TMPDIR`.

**Fix sketch.** Anchor the default state root on something the caller's environment does not change: `/tmp` on
Linux, `getconf DARWIN_USER_TEMP_DIR` on macOS. At least the locks need it. Otherwise, say plainly that callers must
share a `TMPDIR`, and correct 1107-1115 and `environment-and-internals.md:337-339`. Evidence level 3.

### D2. Two pages give instructions the one call cannot carry out

- `codex/SKILL.md:121`: "Declare gates on the command line".
- `codex/references/parity.md:32`: `--host-home` for a subagent's MCP tools.

The launcher's only driver command line is `agent-run.mjs:454`. **Check:** `agent-run.mjs --help` offers no
pass-through flags. Level 1.

### D3. The isolated home does not carry `model_provider`

- `INHERITED` (1258) carries `model`, `model_reasoning_effort`, `personality` and `service_tier`, and neither
  `model_provider` nor `model_providers`.
- A caller whose `config.toml` points at a custom provider therefore runs isolated against the default provider,
  contrary to "Isolating the ENVIRONMENT must not isolate the ACCOUNT" (1229).
- `--host-home` is the escape, and it is unreachable through the one call (D2).

**Check:** run isolated with such a config, then read `<state>/home/config.toml` and `receiptModelProvider`.
Level 2: code reading, since the fake's `config/read` returns only the four keys.

### D4. Comments that are now wrong

- **1107-1115.** Says the state anchor is the passwd entry and not `$TMPDIR` (see D1); 1200-1205, nine lines below
  the report-file block, says the opposite.
- **1969-1972.** Cites "22 of 64 such trees" as the ledger's reason; `incidents.md:105-116` attributes zero of them
  to this driver.
- **146-153.** The 30-minute rationale cites "one 600 s TaskOutput block", but Claude Code 2.1.277 removed
  `TaskOutput` (`CHANGELOG.md:969`).
- **59-61.** Says every tuning number is in `LIMITS`, but literals remain:
  - 6000 ms (1487), 20000 ms (2600) and 200 ms (4156).
  - 64 MiB buffers (2241, 2258, 2272).
  - Caps of 40 summaries (3485), 8000 characters (4376), 12 errors (4337) and 99 cursors (4490).

Level 1.

### D5. Two ledger addresses in `ISSUES.md` have drifted

- **E113** cites `driver.mjs:1376-1414` `tmpBaseProblem` and `refuseBase`, which no longer exist: `runTmpDir`
  (1367-1383) now calls `createAgentTemp`. The same check-then-act shape and the unread mode bit live in
  `temp-dir.mjs` `privateDirectory` (19-32) and `directoryChain`, so E113 still holds, at a new address.
- **E115** cites `closeApproval` at `:3181-3200`; it is now 3150-3169.

Level 1.

### D6. The driver names its host as Claude Code

`clientInfo.name` is "Claude Code" (164), and the standing rules open with "You are being driven by a Claude Code
coordinator" (4526). The launcher now serves Codex and OpenCode hosts too. Low impact. Level 1.
