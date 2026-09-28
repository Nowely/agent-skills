# Design v5: the approval channel

Run `2026-09-27-approval-channel`, Fable D1, 2026-09-28. The baseline is the implemented and fixed v4 in this worktree, af4e82f (code) and c0d7117 (pages): `driver.mjs` 4771 lines, `agent-run.mjs` 502 lines, their `--help` texts as printed today, the wrapper `agents/codex-agent.md`, the orchestrate page's Approvals section and poll paragraph, and what [09-live-gate.md](09-live-gate.md), [10-review-sol.md](10-review-sol.md), [11-refutation-astra.md](11-refutation-astra.md) and [12-verify-sol.md](12-verify-sol.md) found and fixed. v5 answers the owner's second round ([15-owner-round-2.md](15-owner-round-2.md)). Evidence levels as the repository defines them: 1 the line resolves, 2 an independent reader would say the same, 3 made to happen; a lifecycle claim not made to happen is a guess and says so. Line numbers are the current driver's unless a file is named. v1–v4 stay as written.

## Changes from the implemented v4

1. **The two launcher flags go.** `--approvals` and `--approval-timeout` are removed; `--new` makes `<DIR>/approvals/` for every agent and `--run` always hands the driver `--approval-dir`. Owner: «Не нужно плодить флаги … не понятно, кому он нужен и зачем»; the CLAUDE.md rule now in the tree (line 34): a flag is born only with a sentence naming who sets it, why the default cannot decide, and what breaks without it. Neither flag has that sentence; `--approval-dir` does, and stays.
2. **The deadline is one constant**, `LIMITS.APPROVAL_TIMEOUT_S: 1800`, with its reason in the table: a safety net for a run nobody attends. Owner: «Может нужен дедлайн в 30 минут». The idle guard stays paused while a request is open (`:2824-2833`, level 1), so the two clocks never compete.
3. **The wrapper hands a request back.** `--run` returns as soon as a request waits, printing the request in place of the nine lines plus `WAITING=` and `REPORT=`; the wrapper's message is unchanged, because step 2 keys on `REPORT=` and the waiting result carries it; the coordinator decides with `--decide` and continues the wrapper with the same command. The poll stays as the wake in orchestration, for the measured reason the page already carries (a blocking `TaskOutput` on a running wrapper dumps 32 KB at its timeout). Weighed below against C2's F6, F9, F12 and the ceiling.
4. **A third request kind is offered**: `item/permissions/requestApproval`, a widening for named paths and network, answered on `accept` with a granted profile built from the request at scope `turn`. Owner: «просто вызываешь и смотришь результат»; the coordinator's check that 0.155.1 carries this request tool-agnostically (15-owner-round-2, level 1 for the schema). The section is marked **pending P1**.
5. **Nothing tool-specific in the driver.** `--writable` at read level, file roots and the profile entries they produced go; the read row returns to `read [<dir>]`; the pages say nothing about the VCS client but the general rule. Owner: «не очень хочется зашивать в драйвер знание о существовании этого VCS-клиента».
6. Everything else stands as implemented and fixed: containment and the owner file, auto-yes with its checks and re-check at send, causes, settlement before answer, `LATE=`/stale, the report's entries and counts, the exit ladder, `--pending`'s framing, `--decide`'s refusals. Listed below, byte-for-byte and moved.

## In one paragraph

Every Codex agent has a mailbox: `--new` makes it beside the prompt, inside the state directory it now requires, and `--run` hands it to the driver, which checks its containment by inode and claims it. A file change the rights cover is answered yes by the driver; a command escape, a file change outside the roots or a widening of the sandbox for named paths is written to the mailbox, and the launcher's `--run` returns at once with the request, so the wrapper hands it back as any result. The coordinator decides with `--decide` under the owner's rule, preferring a widening to an escape, and continues the wrapper with the same command; in orchestration its one poll task over every alive agent's markers is what wakes it. A request nobody answers is declined after thirty minutes and the turn goes on; the run ends with a report that names every request, its decision, its cause and what the server said of it. Nothing in the driver knows a tool by name.

## Names

As v4, plus: **widening**, an `item/permissions/requestApproval`, a request for write or read access to named paths or for network, answered by a granted profile so the command runs inside a wider sandbox rather than outside one. **waiting result**: what `--run` prints when the run waits on a decision, the request block ending in `WAITING=` and `REPORT=`. **continue**: sending the wrapper the same message block again after a decision.

## 1. No flags

### The mailbox exists for every agent

`--new --report-file <REPORT>` makes `<DIR>/approvals/` at 0700 beside `prompt.txt`, always, and prints `APPROVALS=<path>` after `PROMPT=`. It needs the state directory to check containment (`agent-run.mjs:334-341`, the check the fix round added for both the report and the directory, level 3 in the gate), and the variable is the same one the run call already carries: the codex page's `--new` line becomes

    CLAUDE_PLUGIN_DATA="${CLAUDE_PLUGIN_DATA}" node "${CLAUDE_SKILL_DIR}/scripts/agent-run.mjs" --new --report-file "<REPORT>" <<'PROMPT'

and `agent-contract.test.mjs:160-189`, which already checks that every state-directory mention on both pages is the exact placeholder, covers it. Without the variable `--new` refuses, as the driver does at `--run` (`stateDir()`, exit 2, `:1172`); a hand user who exports `ENTRUST_STATE_DIR` is served the same way. The launcher cannot find the state directory without the variable: it has no configuration of its own and the driver keeps no default (`:1153-1165`), so guessing would put the mailbox where no check applies. The sentence for `--approval-dir`, which stays: set by the launcher, never by a person; the default, none, declines every request at once, which is what a driver run by hand with nobody reading a mailbox wants; without it the launcher could not tell the driver where the mailbox is, since the layout beside the report is the launcher's, not the driver's.

`--run` always passes `--approval-dir <DIR>/approvals` (`agent-run.mjs:260-262` loses its condition). A `<DIR>` made by an older launcher without the directory is the one case left: `--run` makes it then, so an agent directory from before this release still runs armed.

### The constant

    // How long an approval request waits for the coordinator before the driver declines it as expired. The
    // server waits without bound (P1, 180 s held); the idle guard is paused while a request is open; so
    // this is the ONLY clock on a wait. Not a flag: nobody could say who would set it or why the default
    // cannot decide. Thirty minutes is the owner's figure: three times the coordinator's longest blind
    // spot (one 600 s TaskOutput block, then the decision), and short enough that an agent whose
    // coordinator is gone still delivers its report within the hour instead of never.
    APPROVAL_TIMEOUT_S: 1800,

What it protects: a run nobody attends. The coordinator's session ended without its signal reaching the driver, the coordinator forgot the agent, or a headless run has no one to ask: after thirty minutes the request is declined with `why: "deadline"`, the turn continues, the agent answers with what it could, exit 6 records the expiry, and the tokens are not lost to a wait with no end. Its relation to the 900 s idle guard: none while a request is open, because `touchIdle` is a no-op and the timer is cleared for as long as `openApprovals.size > 0` (`:2824-2833`, level 1); at settlement the guard is re-armed (`:3029`). The wall clock, where declared, still cuts on schedule and settles open requests first (`cutTurn`, as implemented). The suites keep the expiry path testable through a seam, `ENTRUST_APPROVAL_TIMEOUT_S`, documented under `--help-all` beside `ENTRUST_APPROVAL_POLL_MS` (`:650-654`) as a seam and nothing else: an environment variable the suites set, like the four already there, not a flag.

### A foreground single-agent call

The codex skill's one wrapper runs with `run_in_background: false`. Under v4 a request from it would have waited, the coordinator blocked on the Agent call, until the constant declined it. Under v5 the wrapper's Bash call returns with the waiting result, the wrapper hands it back, the Agent call returns to the coordinator inside the same turn (the page's measured shape of a foreground call: the hand-back message arrives in the turn, no notification after it, codex `SKILL.md`, One call), the coordinator decides with `--decide`, sends the wrapper the same message block, and the second return carries the nine lines. That is the shape of a native subagent asking a question and being answered, which is the plugin's fitness test. A session with no message tool continues with a second wrapper given the same command, as the page already says for `RESUME:`.

## 2. Hand-back, and the poll

### What `--run` does

`run()` (`agent-run.mjs:451-485`) waits today on the exit marker, polling every 500 ms and watching the driver's pid. It gains a second wake: a request that is **waiting**, meaning `pending` lists its id and no `<id>.decision.json` exists yet. On that it prints, in this order, the `--pending` block for every waiting request (`REQUEST=`, `THREAD=`, `METHOD=`, `KIND=`, `CAUSE=`, `CWD=`, `REASON=`, `ROOTS=`, `DEADLINE=`, then `FILES=` or `ACCESS=` or the command between `COMMAND<<TOKEN` and `COMMAND>>TOKEN`), then `REQUESTS=<n>`, then `WAITING=<id>[,<id>]`, then `REPORT=<REPORT>`, and exits 0. A request whose decision file exists is decided and not waiting: `--run` keeps waiting for the driver to consume it, so a wrapper continued a second after `--decide` does not hand the same request back (the driver takes a decision within `APPROVAL_POLL_MS`, 250 ms, `:143`). A `--run` on a fresh directory launches the driver and waits the same way; a `--run` on a running directory (the ceiling's second call, or a continuation) waits the same way; a `--run` on a finished directory prints the nine lines as today.

The waiting result begins with `REQUEST=` and never with `DRIVER_EXIT=`, and the coordinator tells the two apart by the first line. `--pending` stays for reading the mailbox without a wrapper, and for `LATE=`, `STALE=` and `ORPHANED=` after the run.

### The wrapper's message, unchanged

Step 2 of the message (codex `SKILL.md`, the Agent-call block; `codex-agent.md:13-15`) says: no `REPORT=` line, run the same command again. The waiting result carries `REPORT=` as its last line, so the wrapper hands it back under step 3 and does not rerun; the nine-line result carries it too. Nothing in the message or the wrapper file has to name a request; the wrapper's description line changes from "prints nine status lines" to "prints the run's status lines, or the approval request it is waiting on", which the coordinator reads and the wrapper does not act on. `codex-agent.md`'s last sentence already admits a later message with one more command of the same shape (`:22-23`), which is the continuation.

### The coordinator's side

On a waiting result: read it whole, decide under the rule, `--decide <id> --accept|--decline --why …`, then continue the wrapper with the same message block (the Agent tool's continuation of a background agent, `SendMessage`; a foreground agent's hand-back is followed by the same message in the next turn). The continued `--run` waits for the next event and hands back the nine lines at the end, or the next request. In a headless session, a second wrapper with the same command. `DECIDED=` means published while the request was open; `LATE=` means the driver settled it first and nothing ran on that word (both implemented, `agent-run.mjs:426-434`).

### The poll stays as the wake in orchestration

The orchestrate page's one task over every alive Codex agent's `exit` and `approvals/pending` markers (`SKILL.md:108`, pinned by `orchestrate.test.mjs:341-346`) stays, for the reason the same paragraph carries: a blocking `TaskOutput` on a running wrapper returned 32 KB of its transcript at the timeout, seven of seven (measured 2026-09-15 and 2026-09-16), where the poll returned one line. A coordinator waiting on the wrappers themselves would pay that every ten minutes of a quiet agent; the poll costs one line per event. So in orchestration the poll wakes the coordinator (`ASK=<id>` within five seconds while it blocks on the poll), the wrapper's hand-back carries the request text (it has usually landed by then; `--pending` reads the same text when it has not), the coordinator decides and continues the wrapper, and re-arms the poll. `DONE=<id>` is the exit marker as today, and the wrapper's final hand-back carries the nine lines. Two signals for one event, one line and one block; the block is what the coordinator reads, and the line is what wakes it.

### The weighing

- **F6, the window.** Neither shape wakes a coordinator inside a blocking `TaskOutput` on another task; both deliver at its return, at most 600 s later. The 1800 s constant covers that three times over, and the poll's single task keeps the common case at five seconds. Same as v4 in the poll, and the hand-back adds nothing here; it adds the foreground case, where no poll exists.
- **F9, decide versus settle.** Unchanged: `expire()` reads the decision file first (`:3063-3067`), `--decide` re-reads after publishing and prints `LATE=` (`agent-run.mjs:426-434`), `finish()` counts late decisions (`:3082-3089`). The constant makes an expiry possible where v4's default did not; every path for it is already in the tree and its cases green (12-verify-sol, R1 F5 and C2 G5).
- **F12, replay after a lost report.** Unchanged: the status lines read the mailbox with or without a report (`agent-run.mjs:294-300`), and the `FILE=missing` row reads `RECEIPT=` before any relaunch (orchestrate `SKILL.md:142`, codex `SKILL.md:267-273`). The waiting result adds a case: a wrapper that handed back a request and was never continued leaves a run whose report lands unread; `--status` and the report file are the read, as the page says for any `PATH=own`.
- **The ten-minute ceiling.** `--run` is idempotent as before; a rerun after the ceiling notice waits for exit or the next waiting request; the waiting result carries `REPORT=`, so the wrapper's rerun step never loops on a request. A decision published between the ceiling notice and the rerun is consumed by the driver before the rerun looks (`APPROVAL_POLL_MS`), and a rerun that arrives first sees the decision file and keeps waiting.
- **Stop on the card.** While `--run` runs, Stop reaches the driver through the launcher's signal forwarding (`agent-run.mjs:145`, `:476`, E45 level 3) and the driver settles open requests before the interrupt. After a hand-back the wrapper is idle and holds no process: Stop on its card ends the wrapper and reaches no driver, which then waits out the constant, declines, and finishes unread. The page therefore says: to stop an agent that is waiting on your decision, `--decide … --decline` and continue the wrapper, or `kill -TERM` the pid on the first line of `<DIR>/err.txt`, which the codex page already names as the way to stop a driver (`SKILL.md:311`).
- **A coordinator that never continues.** The constant declines the request after thirty minutes; the turn continues; the report lands; the wrapper stays idle until the session ends. With the poll in orchestration the coordinator still sees `DONE=` and reads the report file; in a foreground single-agent call it reads `--status`.
- **Given up.** The page's promise that every Codex card shows exactly one Bash and its return: an agent with requests shows one Bash per hand-back. And a coordinator that is not on the poll and not blocked learns of a request only when the wrapper's completion notification is delivered, which is the harness's schedule, not the driver's.

Chosen: hand-back for delivery in both shapes, the poll for the wake in orchestration. Rejected: hand-back alone (the 32 KB dump for quiet agents; the poll is one line), and the poll alone (a foreground single agent's request would wait thirty minutes for a coordinator that could have answered in one).

## 3. Three request kinds

The offer predicate (`:3246-3260`) admits a command escape of kind `command` and a file change auto-yes did not settle, from the root's current turn or a grandchild's open turn. v5 adds `item/permissions/requestApproval` on the same terms. The legacy pair, `writeStdin`, unknown threads and closed turns stay declined at once with their `why`.

### The widening — pending P1

**Replace this section's branch with Opus P1's result when it lands.** P1 is measuring, with a toy tool that writes its own state under the home and then with the VCS client in the owner's checkout: whether the model issues this request for a tool's state writes, with and without a steering sentence in the standing instructions; whether a granted profile makes the command succeed inside the sandbox; and whether the grant's scope covers the rest of the turn.

The request (0.155.1 generated schema, `PermissionsRequestApprovalParams.json`, level 1): `{cwd, environmentId, itemId, permissions: {fileSystem: {entries: [{path: {type: "path" | "glob_pattern" | "special", …}, access: "read" | "write" | "deny"}], globScanMaxDepth, read, write}, network: {enabled}}, reason, startedAtMs, threadId, turnId}`. The response: `{permissions: {fileSystem, network}, scope: "turn" | "session" (default turn), strictAutoReview}`; today's refusal is the empty profile `{fileSystem: null, network: null}` (`:3212`).

What the driver records. The entry gets `method: "item/permissions/requestApproval"`, `kind: null`, `permissions`: the request's profile copied whole, `detail`: the entries rendered one per clause, `write path:/Users/…/.vcs/store/.vcs/objects/objectdb; write path:/Users/…/.vcs/store/.vcs/sync; network on`, `cause: "sandbox"` (a widening is the sandbox in the way by definition; the class exists to tell the synthesis what avoids the request, and for a widening the answer is the widening itself), and on acceptance `granted: {permissions, scope}`. The request file carries the same, and `--pending` prints one `ACCESS=` line per entry, `ACCESS=write path:/Users/…`, `ACCESS=read glob_pattern:**/*.lock`, `ACCESS=write special:project_roots`, and `NETWORK=on` or `NETWORK=none`, escaped like every other field.

What the driver refuses before offering, declined at once with `why: "protected root"`: an entry of type `path` that resolves (longest existing prefix, as `coveredByRights` does) to or inside `~/.codex` or the state directory, or to any ancestor of either, or to the home itself; an entry of type `special` with kind `root`; an entry with `access: deny` on a root the agent holds (a request to narrow its own grant is not the coordinator's to answer). Everything else is offered: `glob_pattern` entries shown as written, `special: project_roots` and `minimal`, `read` entries, `network`.

What `--decide --accept` sends: the granted profile is the request's profile, entry for entry, with nothing added and nothing narrowed, `network` copied only when the request asked for it, and `scope: "turn"`, never `session`: the coordinator's decision is on one request in one turn, and a session grant would outlive the turn and hide later matching requests from the record (C7, C8; the same reason `acceptForSession` is not sent). `strictAutoReview` is not sent. A partial grant was considered and rejected: the driver has already refused the entries it will never grant, so the coordinator's yes is a yes to what `--pending` printed, whole. `--decide --decline` sends the empty profile, today's refusal.

The rule, for the orchestrate page's Approvals section, after the existing sentences:

> Prefer a widening to an escape when either would do: a command under a widened sandbox stays sandboxed everywhere else, where an approved escape runs as you. Approve a widening that writes into a tool's own state or cache under your home when the path is not a repository, not `~/.codex` and not the plugin's state directory; the driver refuses those three whatever you decide. Never approve a network widening the plan did not name; an agent under `NETWORK: no` that asks for network goes to the owner.

How an accepted widening appears. The report's `sandbox` stays the server's echo at `thread/start`, which `assertSandbox` compared; beside it `sandboxWidened: [{itemId, permissions, scope, at}]`, one per accepted widening, so a reader of `sandbox` sees what was asked for and a reader of `sandboxWidened` sees what the turn then held. The synthesis rule gains its clause: "a widening: the agent got `<access>` to `<paths>` for the turn, and the plan needs no change".

**Branch (a), the model asks for paths.** The VCS client and every tool that writes its own state work through the widening: the model asks for `objectdb` and `sync`, the coordinator approves under the rule, `vcs status` runs inside the sandbox with two more writable paths, and nothing on the plugin's side names the VCS client. The escape stays for commands with no path to widen. Standing instructions unchanged.

**Branch (b), the model does not ask for paths.** The VCS client stays on the approved escape: `vcs status` fails inside the sandbox, the model asks to run it outside, the coordinator approves a non-destructive query in the plan's direction, as the rule already says, and the command runs as the user. If P1's steering sentence turns the escape into a widening, `developerInstructions` (`:3794-3843` in the tree at b3872b4; the function is unchanged in the baseline) gains one sentence: "When a command fails because the sandbox denies it a path it needs, ask for access to that path, not to run outside the sandbox." If the sentence does not work, it is not added: a sentence that steers nothing is a sentence too many.

Under either branch the widening path exists in the driver and the launcher, because the protocol carries it and a model that asks must be answered with a grant or a refusal, never an error.

## 4. Nothing tool-specific in the driver

Removed: `--writable` at read level (the refusal `--writable belongs to --level write`, b3872b4 `:2277-2278`, lifted at af4e82f, returns), the file-accepting root variant, the read profile's extra filesystem entries, `assertReadSandbox`'s expectation of roots beyond `$TMPDIR`, and the `--help` sentence "only for a tool's own store (the VCS client's object cache and sync file)". The codex page's Rights table read row returns to `read [<dir>]` or no header: "read any readable path, reach the network, run commands, write only `$TMPDIR`"; the header table's `WRITABLE:` row returns to the write-level sentence alone. The orchestrate synthesis sentence loses "`vcs` its two store roots, `WRITABLE:` at read level" and gains the widening clause above. environment-and-internals.md's mailbox section loses its VCS-client example. After this the pages say about the VCS client: nothing. The general rule covers it: a tool whose state the sandbox blocks asks for its paths or to run outside, and the coordinator approves a non-destructive request in the plan's direction, preferring the widening.

P1's VCS-client measurement (01-probe-2, Q6) stays in the research directory as what the widening would grant when the model asks for it, and as the reference for the VCS-client live gate.

## 5. What stays, what moves

### Byte-for-byte

`claimMailbox` and the owner file with its reclaim marker (`:3095-3200`); `coveredByRights` with its inode, symlink, guarded-name and existing-parent checks and the re-check at send (`:2892-2945`, `:3265-3267`); `offerApproval`, `closeApproval` with settlement before answer and decline on a failed write, `readDecision`, `takeDecision`, `expireApproval`, `settleOpenApprovals`, `countLateDecisions` (`:2967-3090`); the duplicate-rpcId guard (`:3226-3229`); the current-turn and child-turn predicates and settlement at turn end (`:3246-3254`, `:3459-3468`); the cause heuristic and `failedAttempts`; the idle pause; the refusal shape `decline`; the report's entries and counts (`--help-all` Report block as printed); the exit ladder's rung; `announceDeclinedApproval`; the retry guard; `--pending`'s escaping and fresh token (`agent-run.mjs:357-389`); `--decide`'s refusals, publication and re-read (`:391-435`); `RECEIPT=`'s tokens (`:294-311`); the orchestrate page's Approvals rule paragraph, synthesis paragraph, `FILE=missing` and exit-10 rows; the codex page's `escalations` bullet and `FILE=missing` bullet; E45's signal path.

### Moves

| Where | From | To |
| --- | --- | --- |
| `agent-run.mjs` parse (`:141-163`) | `--approvals`, `--approval-timeout` accepted | both unknown arguments, exit 2 with the usage |
| `newAgent` (`:324-355`) | mailbox and containment check under `approvals` | always: the state directory required, the report and the directory checked, `approvals/` made, `APPROVALS=` printed |
| `launch` (`:260-262`) | `--approval-dir` iff the directory exists, `--approval-timeout` iff given | `--approval-dir` always (made if absent), no timeout argument |
| `run` (`:451-485`) | waits on `exit` | waits on `exit` or a waiting request; prints the waiting result |
| `pendingRequests` (`:357-389`) | `FILES=` or the command | plus `ACCESS=` lines and `NETWORK=` for a widening |
| `decideRequest` | writes `accept` or `decline` | unchanged file; the driver builds the profile |
| driver `FIELDS` (`:217`), `parseArgs` (`:833`, `:872-878`), `LIMITS` (`:143`) | `APPROVAL_TIMEOUT` row, `--approval-timeout` flag and its checks | the row and the flag gone; `APPROVAL_TIMEOUT_S: 1800`; the `ENTRUST_APPROVAL_TIMEOUT_S` seam read once at start-up |
| driver `offerApproval` (`:2967`) | `deadlineMs` from `opts.approvalTimeout` | from the constant or the seam |
| driver `handleServerRequest` (`:3246-3274`) | a permissions request declined at once, `why: "permission profile"` | offered after the protected-root refusal; `entry.permissions`, `detail` rendered |
| driver `closeApproval` (`:3011`) | `{decision}` for every method | the granted profile with `scope: "turn"` for a permissions accept, the empty profile for its decline; `sandboxWidened` appended |
| driver `--help`, `--help-all` (`:453-543`, `:544-590`) | `--approval-timeout`, "arms", the VCS-client sentence | the constant and the seam; "every agent has a mailbox"; the widening |
| driver read-level roots (the lifted refusal, the profile lines, `assertReadSandbox`) | `--writable` admitted at read level | refused at read level as before af4e82f |
| `codex-agent.md:3` | "prints nine status lines" | "prints the run's status lines, or the approval request it is waiting on" |
| codex `SKILL.md` (`:100-110`, `:173`, `:209`, `:311`) | `--new` plain, `--new --approvals` paragraph, the read row's `WRITABLE:`, the `WRITABLE:` row's read clause | `--new` with the variable, the paragraph replaced by the waiting result and the continuation, the read row alone, the row alone; the stop sentence gains the waiting case |
| orchestrate `SKILL.md` (`:14`, `:108`, `:115-123`) | "one launcher flag, `--approvals`, arms", the poll, the rule and synthesis | "every agent has a mailbox", the poll kept with the hand-back sentences, the rule gains the widening sentences, the synthesis gains the widening clause and loses the VCS client |
| environment-and-internals.md (`:53-70`) | the mailbox made by `--new --approvals`, the VCS-client example | the mailbox made by `--new`, the constant, the widening's grant shape |
| CHANGELOG.md | one Unreleased entry | amended: no flags, the constant, the hand-back, the widening, read-level roots withdrawn |

### The suites

Go: `agent-run.test.mjs:421` (`--new --approvals` variants), `:460-482` (`--approval-dir` iff, lone `--approval-timeout`), `:481` (its refusal); `cli.test.mjs:296-303` (the three `--approval-timeout` cases), the `--help` pins at `:1003` for "only for a tool's own store", "never a repository" and "--approval-timeout S"; the read-level `--writable` cases added at af4e82f in `cli.test.mjs` and `lock.test.mjs`; `orchestrate.test.mjs:84`'s "one launcher flag, `--approvals`, arms"; `agent-contract.test.mjs`'s pin of the read row's `WRITABLE:`.

Change: every protocol case that passed `--approval-timeout N` sets `ENTRUST_APPROVAL_TIMEOUT_S=N` in its env instead (`approval expired`, `a decision present at the deadline tick`, `a stale decision on disk when the deadline fires`, the lock suite's waiting-writer case); `agent-run.test.mjs`'s launch pin (`:232`) to the unconditional `--approval-dir`; `cli.test.mjs`'s `--help` pins to the constant's sentence and the widening; `orchestrate.test.mjs` F6 to the poll paragraph with the hand-back sentences; `agent-contract.test.mjs` to the `--new` line with the variable and the wrapper's new description line.

New: `agent-run.test.mjs`: `--new` makes `approvals/` always and refuses without the state directory; `--run` returns the waiting result when a request waits, with `WAITING=` and `REPORT=` last and `REQUEST=` first; `--run` keeps waiting while a decision file exists unconsumed; a `--run` continued after the driver took the decision hands back the nine lines; `--pending` prints `ACCESS=` and `NETWORK=` for a widening. `fake-app-server.mjs`: `widening-wait` (a permissions request for two `path` entries under the fixture's home with `access: write`, answered with the command `completed` on a granted profile and `declined` on the empty one), `widening-protected` (an entry under `~/.codex`), `widening-network` (`network: {enabled: true}`), `widening-root` (`special: root`). `protocol.test.mjs`: a widening is offered with `cause === "sandbox"` and `detail` rendered; `--decide --accept` sends the request's profile at `scope: "turn"` (the RPC log carries the response body); a protected entry is declined at once with `why === "protected root"`; a root special is declined at once; a network widening is offered; `sandboxWidened` carries the grant; the constant expires a request under the seam; the `RUNGS` contexts unchanged. `agent-contract.test.mjs`: the page's widening sentences.

### Live gates, run by the coordinator

1. **A foreground single-agent call.** The codex skill's one wrapper, `run_in_background: false`, a read agent asked to `touch` a path under `/tmp`: the Agent call returns with the waiting result; `--decide --accept`; the same message block sent to the wrapper; the second return carries the nine lines with `approvals=1/0/0/0`; the file exists; `outcome.exitCode === 0`. Then the same with `--decline`: exit 6, the file absent.
2. **Orchestration.** Two background wrappers over one poll task; one agent raises a request; the poll prints `ASK=`; the wrapper's hand-back carries the request; `--decide`, continue, re-arm; `DONE=` for both; both reports read. Then Stop on a waiting agent's card: the wrapper ends, the driver waits; `kill -TERM` the pid; the report says `expired, why: "signal SIGTERM"`.
3. **A widening**, pending P1: the toy tool P1 uses, then the VCS client in `~/monorepo/app`: the request offered with its `ACCESS=` lines, accepted, the command exits 0 inside the sandbox, `sandboxWidened` in the report, and under branch (b) the same command as an approved escape instead.

### Implementation estimate

| File | Change | Lines |
| --- | --- | --- |
| `driver.mjs` | remove the flag and its checks, the field row, the read-level roots (−90); the constant and the seam (+15); the widening: refusal filter, `detail` and `permissions` on the entry, `ACCESS` data in the record, the granted profile in `closeApproval`, `sandboxWidened` (+120); help texts (+40) | 260–300 |
| `agent-run.mjs` | remove the two flags (−40); `--new` always, the variable required (+15); `--run`'s waiting result (+50); `ACCESS=`/`NETWORK=` in `--pending` (+15); usage text (+40) | 150–180 |
| `fake-app-server.mjs` | four widening scenarios | 60–80 |
| `protocol.test.mjs` | seven cases, env seam in four | 90–120 |
| `agent-run.test.mjs` | five cases new, three gone, two changed | 120–150 |
| `cli.test.mjs`, `lock.test.mjs`, `orchestrate.test.mjs`, `agent-contract.test.mjs` | cases gone and pins moved | 40 + 20 + 30 + 25 |
| `codex-agent.md` | one line | 1 |
| codex `SKILL.md`, orchestrate `SKILL.md`, environment-and-internals.md, parity.md | as in the table above | 45 + 35 + 25 + 5 |
| `CHANGELOG.md` | the Unreleased entry amended | 25 |

About 950–1,150 lines, of which some 200 are removals. Composition: one Opus write agent for the driver, the launcher, the fixture and the suites in one thread, offline to green; one Sonnet agent for the pages after `--help` is final; one Codex Sol cross-reviewer on the diff; Codex Astra as refuter given this document and its own C2 findings; the three live gates by the coordinator, the third after P1 lands. Five agents, announced before spawning.

## Alternatives rejected

v4's list stands. Added:

**Hand-back alone, no poll.** The measured 32 KB dump at a blocking `TaskOutput`'s timeout on a running wrapper (the page's own sentence, 2026-09-15/16, seven of seven) would be paid every ten minutes of a quiet agent; the poll is one line.

**The poll alone, no hand-back.** A foreground single agent's request would wait thirty minutes for a coordinator one message away; and `--run` returning is what puts a request on the agent map as an agent's return.

**Deriving the mailbox from `--report-file` in the driver, dropping `--approval-dir`.** The layout beside the report is the launcher's; a driver that assumed it would claim a mailbox on every hand run with a report file, and would break the day the launcher's layout changed.

**Making the constant a flag with a default.** The rule in CLAUDE.md: nobody could say who sets it or why the default cannot decide.

**`scope: "session"` on a widening.** It outlives the request and hides later matching requests from the record, the same defect as `acceptForSession`.

**A partial grant.** The driver refuses what it will never grant before offering, so the coordinator's yes is to the whole of what it read.

**A `TOOLS:` header or any tool name in the driver.** The owner's sentence; the widening carries every tool without naming one.

## Open for the owner

1. **The constant, 1800 s.** Your figure; the reasoning is in the table. A run nobody attends ends within the hour.
2. **The poll stays in orchestration** because of a measurement from 2026-09-15/16; if the harness no longer dumps a running wrapper's transcript at `TaskOutput`'s timeout, the poll can go and the hand-back is the whole mechanism. One measurement settles it.
3. **Stop on the card during a wait** reaches the wrapper and not the driver; the page says decline-and-continue or `kill -TERM`. A launcher `--stop` subcommand was not added: `kill` exists and the flags rule stands.
4. **A widening's scope is `turn`**; if P1 shows a tool asks again on every command inside one turn, `session` would spare the coordinator repeats at the cost of an unrecorded later grant. Your call after the measurement.

## Found in passing, for the ledger

- v4's five items and 7133095's entries stand.
- The wrapper's description line says "prints nine status lines" (`codex-agent.md:3`) and `--status`'s help says "Prints nine lines"; with the waiting result there are two shapes, and every page sentence that counts to nine is a pin to move (`agent-run.test.mjs:49-51`, `agent-contract.test.mjs`).
- `agent-run.test.mjs:232` pins the conditional `approvalArgs` expression by regular expression over the launcher's source; a pin on source text moves with every refactor, and a case that runs `--run` and reads `err.txt` for the driver's arguments would pin the behaviour instead. Level 1.
