# Design v4: the approval channel

Run `2026-09-27-approval-channel`, Fable D1, against the tree at b3872b4 (`plugins/entrust/plugin/skills/codex/scripts/driver.mjs`, 4198 lines, version 0.20.0, pinned codex 0.153.4; the installed binary is 0.155.1). v4 builds the owner's principle ([06-owner-round.md](06-owner-round.md)) and Opus P1's second round ([01-probe-2.md](01-probe-2.md)) into v3's mechanics ([02-design-v3.md](02-design-v3.md)). Evidence levels as the repository defines them: 1 the line resolves, 2 an independent reader would say the same, 3 made to happen; a lifecycle claim not made to happen is a guess and says so. Line numbers are the driver's unless a file is named. v1–v3 stay as written.

## Changes from v3

1. **The driver answers yes itself to a file change whose every path lies inside the agent's writable roots**, recorded as `accepted` by the driver with `why: "rights cover it"`. Owner, principle 1: a request the rights already cover is answered by the driver and never shown to anyone. Fact: all ten declined file changes on this machine were writes into the agent's own `$TMPDIR`, and the agents then wrote the same files through the shell (06-owner-round, level 3 from the reports); the edit tool asks by path spelling, `/private/var/…` asks and `/var/…` does not, cwd irrelevant (P1 Q5, level 3).
2. **No sentence is added to the standing instructions.** Weighed against the owner's suggestion: the model that was declined did not fall back to the shell (P1 Q5a, n=1), so an instruction is compliance where the driver's answer is not, and a shell write leaves no `fileChange` item in the report.
3. **Requests from Codex's own subagent threads are offered** to the coordinator, and their file changes take the same auto-yes. Owner: «что-то типа от внуков», principle 4. Success evidence stays root-only (C11).
4. **No deadline by default.** Owner: «Что за дедлайн? Почему он вообще существует?», principle 5. A request waits until answered or the agent is stopped; the idle guard stays paused (v3); `--approval-timeout` stays as an optional bound for headless runs and the suites.
5. **The rule is the owner's**: non-destructive and in the plan's direction, approve; destructive, irreversible or outside the plan, ask the owner while the turn waits, or decline and name it in a headless run; nothing unread is approved (F5). F3 and F4 are named as hazards the owner accepts on parity (06-owner-round, last paragraph) instead of refused classes.
6. **A cause class on every entry** (`rights`, `sandbox`, `policy`, `outside`) and a synthesis rule that says why approvals were needed and what avoids them. Owner, principle 6: «эскалировать почему нужны апрувы и как избежать их в будущем».
7. **`vcs` for Codex agents**: `WRITABLE:` at read level for the two roots P1 measured, `~/.vcs/store/.vcs/objects/objectdb` and `~/.vcs/store/.vcs/sync`, with which `status`, `log`, `show` and `diff` exit 0 under the read profile (P1 Q6, level 3). Owner, principle 7.
8. **The 37 requests, reclassified**: 10 auto-yes, 24 approve, 3 ask the owner, 0 decline; by cause 10 `rights`, 24 `sandbox`, 3 `policy`, 0 `outside`.
9. v3's answers to F1, F2 and F6–F13 stand; F6's poll stays and its deadline half is replaced by change 4.
10. The report entry gains `cause`; `by: "driver"` now also means accepted; the status token and the suites follow.

## In one paragraph

The coordinator arms a channel per agent at `--new` with one flag; the launcher hands the driver a mailbox inside the agent's own `<DIR>`, which the driver verifies lies inside its state directory and which no sandbox under that state directory can write. A file change whose paths the agent's rights already cover is answered yes by the driver and recorded; any other approval request from the root thread or one of its subagent threads is written to the mailbox with a `pending` marker, the idle guard pauses, and the turn waits with no deadline until the coordinator answers or the agent is stopped. The coordinator's one poll task over every alive Codex agent wakes on any `pending`, reads the request whole, approves what is non-destructive and in the plan's direction, takes the rest to the owner while the turn waits, and writes the decision atomically and once. The driver validates the decision against this run and this request, sends `accept` or `decline`, and records the request with its cause, the decision, who made it, the server's receipt and the command's reported outcome in `escalations`. An accepted command runs with no sandbox and the user's rights, which is what every Claude subagent's Bash in the same session already has. Exit 6 is "a request was declined or expired", never "a request was accepted", and the synthesis says why approvals were needed and what avoids them next time.

## Names

- **channel**, **mailbox**, **request**, **decision**, **offered**, **late**, **outcome**: as in v3. **auto-yes**: a request the driver answers `accept` itself because the agent's rights cover it. **cause**: why the request arose, one of `rights`, `sandbox`, `policy`, `outside`. **grandchild**: a Codex subagent thread the root announced (`subagentThreads`, `:2893-2897`).

## What `accept` grants

Unchanged from v3 (P1 Q2, level 3): a command re-runs with no Seatbelt at all, as the user, with the user's network by hypothesis. A file-change `accept` makes the server write the patch as the user (P1 Q4: the file appeared; no helper process was seen, so the writer is the server itself, a reading). The owner's parity ground: a Claude subagent's Bash in the same session runs with exactly those rights, so the line for a Codex agent is not drawn stricter than for a Claude agent (06-owner-round, principle 2; parity.md is the plugin's fitness test).

## Auto-yes: the rights already cover it

### What the driver does

The driver keeps a map from item id to the file change's `changes` list, filled from every `item/started` whose `item.type === "fileChange"` on the root thread or a registered grandchild thread, and dropped at that item's `item/completed`. P1 measured the `item/started` 2 ms (Q4) and 4 ms (Q5a) before the request, carrying `path`, `kind` and `diff`, while the request itself carries `reason: null, grantRoot: null` and no path (level 3, three observations).

On `item/fileChange/requestApproval` from the root or a grandchild:

1. Look up `itemId`. No entry: **offer** the request to the coordinator with `fileChanges: null` (below); the driver does not guess a path.
2. For each change, take every path it names: `path`, and `kind.move_path` for a rename. Resolve each through symlinks: `canonPath` (`fs.realpathSync`, `:2111-2113`) on the longest existing prefix, then the remaining components appended unchanged, so a file that does not exist yet (`kind: add`) resolves through its parent, and a symlink the agent planted inside `$TMPDIR` pointing outside resolves to the outside.
3. The agent's writable roots, canonicalised the same way: `$TMPDIR` at every level (`:2302`, `:2352`, level 1); at write level also `cwd`, each `--writable` root (`roots`, `:2333`) and the worktree, which is the cwd. These are the roots `assertSandbox` verified the server applied (`:2116-2200`), so the list is the server's, not a hope.
4. Every resolved path inside one of those roots, by inode walk of the existing prefix (the walk `checkRoot` uses, `:921-936`): send `{ decision: "accept" }` at once, record the entry with `decision: "accepted", by: "driver", why: "rights cover it", cause: "rights", fileChanges: [{path, kind}]`. Nothing is written to the mailbox and no one is woken.
5. Any path outside, or unresolvable: **offer** the request with `cause: "outside"` and the change list, so the coordinator sees the paths.

Why nothing is widened. The sandbox would have allowed a shell write to the same resolved path: `$TMPDIR` is granted at every level (codex `SKILL.md:169`, `:2352`), and P1's `printf > /private/var/…` inside `$TMPDIR` raised no request and succeeded (Q5c-shell, level 3). The edit tool asked because it compared the spelling, not the resolved path (P1's mechanism, a hypothesis; the observation is level 3). `accept` writes the same bytes to the same inode the shell could have written, through the tool that produces a `fileChange` item with its diff, which the report's `fileChanges` and `filesTouched` carry and a shell write does not. The comparison is on resolved paths on both sides, so the two spellings are one root and a planted symlink is not.

What this fixes without the channel. Auto-yes needs no mailbox: it runs in every driver, armed or not. All ten historical file-change refusals were `$TMPDIR` writes (06-owner-round, level 3), so every one of them would have been answered yes with no coordinator involved.

### Why no command request is auto-answered

A command is text, and its effect is not in its text: the driver cannot tell from `rm -rf /var/folders/…/T/tmp.X` what the shell will resolve, whether the path is a symlink, or what a script at that path does now. For a file change the server names the exact paths and the kind before it asks; for a command it names a string. F3 and F4 are the hazards of judging a command by its text, and the owner accepts them for the coordinator's judgement on parity grounds, not for a driver heuristic that would run unsandboxed on a regular expression. So every command request is offered, and the coordinator keeps them.

### The owner's suggestion, weighed

A sentence in the standing instructions (`developerInstructions`, `:3794-3840`) telling the agent to write temp files in the `$TMPDIR` spelling, or through the shell when the edit tool is refused, would avoid the request at its source. Against auto-yes: the model P1 declined did not fall back to the shell and reported the file missing (Q5a, n=1), where three production agents did fall back (06-owner-round); an instruction is followed by some models some of the time, and the driver's answer is followed always. A shell write also leaves the patch review behind: the edit tool produces a `fileChange` item with kind and diff that the report lists (`fileChanges`, `filesTouched`, `:2856-2863`), and a shell `printf` is a command with no such record. Chosen: auto-yes alone; no new sentence. What is given up: nothing measurable; a sentence the driver makes unnecessary is a sentence too many.

## The mechanism, end to end

### Arming, containment, ownership

As v3: `--new --approvals` makes `<DIR>/approvals/` and refuses a report outside the state directory; `--run` passes `--approval-dir` iff it exists; the driver refuses a mailbox not inside `stateDir()` by inode walk, refuses any writable root at or above the state directory or `~/.codex` (the inverse walk added to `checkRoot`), and claims the mailbox with an `O_EXCL` owner file (F1, F2, F7). `APPROVAL_DIR` and `APPROVAL_TIMEOUT` are `cli-only` fields (`:180-200`, refused in a prompt file at `:652-653`). Auto-yes runs with or without the mailbox.

### When a request arrives

`handleServerRequest` (`:2714`) gains two branches before `REFUSALS`. First the auto-yes above, for a file-change request from the root or a grandchild. Then the offer: a request is **offered** when `msg.method` is `item/commandExecution/requestApproval` with `kind` absent or `"command"` (F11), or `item/fileChange/requestApproval` that auto-yes did not settle; `opts.approvalDir` is set; the request's thread is the root with `turnId === rootTurnId` (F8) or a registered grandchild (`subagentThreads.has(threadId)`, registered from the root's `subAgentActivity` item, `:2893-2897`), whose `turnId` is recorded as the request's own; `settled` and `pendingCut` are both false. Everything else takes today's path: declined at once and recorded with `offered: false` and a `why` (`no channel`, `unknown thread`, `legacy method`, `permission profile`, `kind writeStdin`, `not the current turn`, `turn closing`).

The offer writes the request record and the `pending` marker, pauses the idle guard, starts the 250 ms decision poll, and prints the stderr line, as in v3; the request record gains `cause` and, for a file change, `fileChanges` from the map. Nothing else in the record comes from an item notification (P1 saw a sandboxed attempt emit none). Grandchildren and the root share one mailbox and one `pending`; each request's `thread` says whose it is, and `--pending` prints `THREAD=root` or `THREAD=<agentPath>`.

How offering grandchildren and strict evidence coexist. Two attributions answer two questions. "Whose request may the coordinator answer" is root plus registered grandchildren, refused for any thread the root never announced. "Whose success counts as this agent's evidence" is `isRoot` (`:2673-2675`) and stays root-only: an accepted grandchild command completes on the child's thread and counts in `subagentThreads[].commands`, liveness and never evidence (`:2911-2913`). An accepted grandchild file change is written by the server on the child's behalf and appears nowhere in `filesTouched`, which is root-only by construction. The two rules never read the same field.

### The cause class

Every entry carries `cause`, decided by the driver from what it observed and corrected by nobody:

| `cause` | When | Example on this machine |
| --- | --- | --- |
| `rights` | a file change whose every resolved path is inside the writable roots; auto-yes | the ten `$TMPDIR` writes |
| `outside` | a file change with a resolved path beyond the roots | none in the 37 |
| `sandbox` | a command request preceded in this turn by a root or grandchild `item/completed` of the same `command` text with status `failed` or a non-zero exit: the sandbox stopped it and Codex asks to escalate (P1 Q1, level 3; 00-scouting's two traced cases, level 2) | `vcs show`, `vcs status`, `ps -o lstart=`, `curl` after exit 60 |
| `policy` | a command request with no such attempt seen: Codex's own heuristic asked before trying, as it does for `rm -rf` | the three `rm -rf` of the agent's own temp directories |

`policy` is what the driver says when it saw no attempt, and P1 saw one attempt emit no item at all (01-probe.md, side finding), so a `policy` entry can be a sandbox refusal the server did not report; the request's `reason`, the model's own justification (P1 Q1), is in the record for the coordinator to read. The page's synthesis rule, below, is where the coordinator names the cause in its own words when the class is wrong.

### No deadline

A request waits until it is answered or the agent is stopped. The idle guard is paused while any request is open and re-armed at settlement (v3). `--approval-timeout S` stays as an optional bound: default 0, none; a positive value expires an unanswered request as `decline` with `why: "deadline"`, for headless runs that want a floor and for the suites. `--approval-timeout` without `--approval-dir` is exit 2. The wall clock, where declared, still cuts on schedule and settles open requests first. A run with a channel and no timeouts is bounded by the coordinator, which is what a native subagent is bounded by (`:3855-3857`).

How an abandoned run ends. The coordinator's session ends; a headless session kills its background tasks and agents with the turn (orchestrate `SKILL.md:107`, measured 2026-09-08, level 3); the wrapper's Bash call ends, and the launcher's `--run`, a child of that call, receives `SIGTERM` and forwards it to the driver (`agent-run.mjs:145`); the driver's signal path settles every open request as `expired` with `why: "signal SIGTERM"`, cuts the turn, writes the report at exit 1 with `turnStatus: interrupted`, sweeps the app-server group and releases the lock (`:4150-4175`). Level 3 for the launcher-to-driver leg: ISSUES E45 recorded a wrapper whose turn ended, the launcher's `SIGTERM`, the driver's "interrupted by SIGTERM" and the report seconds later (E45, level 3 for the wrapper's steps and the driver's report, level 2 that the wrapper's end caused the launcher's signal). A reading, level 2: that a session's end takes the same route as the wrapper's end at the ceiling did. A request that waits with the session alive and the coordinator elsewhere waits: the wrapper reruns its idempotent command every ten minutes as it does for any long turn, and the poll task shows `ASK=` whenever the coordinator looks.

What a waiting write agent's lock does to a peer: the peer exits 10 at once with the holder's pid in the message (`:1499-1506`), as today; the exit-10 row says "answer the holder's `ASK=` first", and with no deadline the hold lasts until the coordinator answers. The owner chose this over a clock: a request the plan covers is answered in seconds, and one it does not cover is the owner's question, not a timer's.

### Expiry, cuts, signals, the turn's end, the driver dying first; how a decision travels back

As v3 (F8, F9, F13): settle open requests at the root's `turn/completed` (`:2938`) and at a grandchild's own `turn/completed` under its thread id, in `cutTurn` before `interruptTurn()`, and in `finish()` before `classifyEvidence()`; `expire()` (only with a timeout set) reads the decision file before declaring expiry; `--decide` re-reads after publishing and prints `LATE=` when the driver settled first; `finish()` scans for late decisions; the status lines read the mailbox with or without a report (F12); `resolved` and `outcome` are set from `serverRequest/resolved` and the matching `item/completed`. The decision record's `run.turnId` is the request's own turn id, root or grandchild.

`--pending` prints per request `REQUEST=`, `THREAD=`, `METHOD=`, `KIND=`, `CAUSE=`, `CWD=`, `REASON=` (whole), `ROOTS=` (the writable roots the sandbox holds, so a path or a `rm -rf` target can be compared), `FILES=` (for a file change: `add /path; update /path`), then the command whole between `COMMAND<<` and `COMMAND>>` (F5), then `REQUESTS=<n>`.

### What the driver answers, per decision

As v3's table, with one row changed: `accept` for a file-change request is sent by the driver under auto-yes and never by `--decide`; a file change offered because its paths lie outside the roots, or because no path was seen, can be answered `--accept` by the coordinator under the rule below (the owner: the coordinator decides whether the write was justified, 06-owner-round). `acceptForSession`, `acceptWithExecpolicyAmendment`, `applyNetworkPolicyAmendment` and `cancel` stay unexposed for v3's reasons; the refusal shape stays `decline`.

## The coordinator's side (orchestrate page)

The poll, the three commands and the re-arm are v3's (F6's one task over every alive Codex agent), and an armed agent runs in the background. The rule, for the page:

> An agent asks to run a command the sandbox stopped, or to write a file its rights do not cover. Approving it runs the command as you, with no sandbox, the way every Claude agent in this session already runs; the line for Codex is not stricter than for Claude. Read the request whole, between the markers `--pending` prints, and approve nothing you have not read. Approve a request that is non-destructive and in the plan's direction: a query, a read, a fetch of a source the plan named, a file written where the plan said files go, a deletion inside the agent's own temp root (`ROOTS=` names it). Take to the owner, while the turn waits, a request that is destructive or irreversible, or outside the plan: a deletion beyond the agent's own temp root, a signal to a process, a process tree the driver cannot stop (a nested `codex`, a server, a watcher), a write the plan did not place, a command that names `~/.codex` or the plugin's state directory. In a headless run decline it and name it in the answer. Two hazards ride with every approval and you accept them as you accept them for your own Bash: a `git` or `vcs` query runs the repository's configured hooks, monitors and pagers, and a script runs the bytes at its path when it runs, not the bytes you read. When you retell an approval, say what the entry's `outcome` says: "it ran and exited 0", or "whether it ran is not known".

And the synthesis rule:

> When the run had approvals, the synthesis says why in one sentence per cause and what avoids it next time: `rights`, the driver answered and nothing changes; `sandbox`, the tool needs a root or a setting the plan can grant (`vcs` its two store roots, `WRITABLE:` at read level; a certificate failure inside the sandbox, the fetch outside it); `policy`, Codex asks by its own rule and nothing on our side changes it; `outside`, the plan needs a `WRITABLE:` line or a different agent for that file.

The 37 requests in 00-escalations.md under the rule, with the cause the driver would have recorded:

| Decision | Cause | Count | Requests | Why |
| --- | --- | --- | --- | --- |
| auto-yes by the driver | `rights` | 10 | t3, V1 ×2, A2d, sol-r1, s2-sol-2 ×2, s3-sol-2, b1, round07-sol2 (file changes) | every one a write into the agent's own `$TMPDIR` (06-owner-round, level 3); never surfaces |
| approve | `sandbox` | 13 | A2-2, R1, a2 ×2, a9, b1, l2–l8 (`vcs` queries) | non-destructive reads of the checkout the plan named; the VCS client exits 1 inside the sandbox (P1 Q6, level 3); with the VCS-client grant below they do not arise |
| approve | `sandbox` | 2 | j1, s4 (`ps -o lstart=`) | a read of process state |
| approve | `sandbox` | 1 | I1 (`sed -n '29p' …; diff …`) | a read in the repository; the row is clipped, the live command is read whole |
| approve | `sandbox` | 2 | A1, sol-n2 (`curl … https://code.claude.com/…`) | a fetch of a documentation site, non-destructive; approve where the plan named sources, the certificate store being what the sandbox blocks (reading) |
| approve | `policy` | 3 | a2, l2, l3 (`rm -rf …/T/…`) | deletions inside the agent's own temp root, which `ROOTS=` shows; Codex asked by its own heuristic though the sandbox allows the write |
| approve, after reading the script | `sandbox` | 3 | A2b (`python3 …/run.py baseline-lock-unsandbox`), SYN (`python3 …/terse/runs/…`), V1 (`node …/e45-check.mjs <repo>`) | scripts the agents wrote for the task they were given, in the plan's direction; the F4 hazard accepted on parity; read whole first |
| ask the owner | `sandbox` | 2 | round04-astra, round07-astra (`CODEX_HOME=… codex sandbox …`) | a Codex of its own, unsandboxed, spending the owner's quota, in a process tree the driver cannot stop (F10); a nested sandbox fails inside the sandbox (P1's exit 71) |
| ask the owner | `sandbox` | 1 | t3 (`kill -9 44899`) | a signal to a process the coordinator cannot identify |

10 auto-yes, 24 approve, 3 ask the owner, 0 decline. By cause: 10 `rights`, 24 `sandbox`, 3 `policy`, 0 `outside`. Against v3: the ten file changes moved from decline to auto-yes; the thirteen `vcs` and the two `curl` moved from approve-with-conditions and read-whole-first to approve; the three deletions and the three scripts moved from decline to approve; the two nested `codex` and the `kill` moved from decline to the owner. In a headless run the three become declines the answer names. The causes for I1, the scripts and the two `curl` are readings from clipped rows; the driver would have decided them from the preceding item.

## `vcs` for Codex agents

### The grant P1 measured

Under the read profile, `vcs status --short` and `vcs log -n 1` exit 1: the VCS client opens `~/.vcs/store/.vcs/objects/objectdb/data.dat` read-write, fails, tries to delete `objectdb/index.dat` to re-create the cache, fails again, and reports "Not a mounted repository" (P1 Q6, stderr, level 3). With `permissions.entrust_read.filesystem = {":tmpdir"="write", "<home>/.vcs/store/.vcs/objects/objectdb"="write", "<home>/.vcs/store/.vcs/sync"="write"}`, `status`, `log`, `show --stat` and `diff --stat` exit 0 with the unsandboxed baseline's shape; `objectdb` alone fails on `sync`; `sync` alone was never run; the remaining denials are the VCS client's trace logs and are non-fatal (level 3 for each run made, five with the grant). The store path is per machine (`~/.vcs/store` on this one, named by the VCS client's mount points), and the runs did not carry the managed configuration (`codex sandbox` has no `--strict-config`; the app-server applies MDM).

### How a plan states it

`WRITABLE:` becomes legal at read level for narrow roots, and a root may be a file. Today `--writable` at read level is exit 2 (`:2277-2278`), and a root must be a directory (`resolveDir`, `:878`). The driver change: at read level each `--writable` passes `checkRoot` and is added to the read profile's filesystem table beside `":tmpdir"` (`:2352`), and `assertReadSandbox` (`:2167-2200`) expects `writableRoots` to be exactly `$TMPDIR` plus those roots, canonicalised, instead of `$TMPDIR` alone; `resolveDir` gains a file-accepting variant for a root that is a regular file. `checkRoot` treats `~/.vcs` as it treats `~/.ssh`: a directory inside the home, not the home, not an ancestor, not `~/.codex`, not the state directory, so it is accepted (`:888-940`; environment-and-internals.md:72-74, "Only those are protected", level 1). The header:

    RIGHTS: read ~/monorepo
    WRITABLE: ~/.vcs/store/.vcs/objects/objectdb
    WRITABLE: ~/.vcs/store/.vcs/sync

and the plan says, in words: "Codex Sol R1 reads the monorepo checkout with `vcs`, which gets write access to the VCS client's object cache and its sync file." A `TOOLS: vcs` header that expands to the two roots was considered: it hides two paths the user is being asked to approve, and the store's location comes from the VCS client's mount-point configuration, whose format nobody has read; it can be sugar later, once that file is measured. The codex page's Rights table gains the read row's `WRITABLE:` with "narrow roots a tool needs, settled with the user", and the header table's `WRITABLE:` row says "at read level only for a tool's own store, never a repository".

### The risk

The `objectdb` root makes a 33 GB cache writable (`data.dat`, 33,663,913,336 bytes, P1). The no-grant stderr shows the VCS client deleting `index.dat` to re-create the cache after a failed open (level 3 for the attempt); under the grant a failed open could therefore wipe the index, a hypothesis P1 named and did not observe (`index.dat` intact after the runs). Whether `sync` alone suffices is untested: the run was refused by the harness's classifier. Whether the grant survives the managed configuration the app-server applies is untested: `codex sandbox` ran without it. Whether two concurrent read agents writing the same store collide is untested; the VCS client's own locking is unread.

### Before shipping

Measure, in this order, each a level 3 before the page names the grant: the `sync`-only grant through the app-server (a live read agent, `vcs status` exit code); the two-root grant through the app-server under this machine's MDM (`thread/start`'s `writableRoots` echo and `vcs status` exit 0); two concurrent read agents running `vcs log` against one store; `index.dat`'s size and mtime before and after each; and that a `WRITABLE:` naming a file passes `checkRoot` and reaches `writableRoots` as the server reports it.

## The lock (C17, F10) and the trust boundary (C19, F1, F2)

As v3, with one change: a write agent's hold on its lock while a request waits is unbounded by default and ends when the coordinator answers or the agent is stopped; the peer exits 10 at once and the poll shows the `ASK=`. The survivor residual (an accepted command in its own process group after the server dies) and the boundary paragraph (any process that can write the mailbox is the user's, the boundary a Claude subagent's Bash already has) stand unchanged.

## The report and the exit ladder

Each entry:

    { "id": "1-9f3a2c1e" | null, "method": "…", "kind": "command" | null,
      "detail": "<the command whole, else reason, else message; the joined change list for a file change>",
      "thread": "thr_…", "subagent": false, "agentPath": null,
      "cause": "rights" | "sandbox" | "policy" | "outside",
      "offered": false, "decision": "accepted", "by": "driver", "why": "rights cover it",
      "askedAt": "…", "settledAt": "…", "waitMs": 0,
      "resolved": true, "outcome": { "status": "completed", "exitCode": null, "durationMs": null } | null,
      "cwd": "…", "reason": null, "fileChanges": [{ "path": "…", "kind": "add" }] | null }

`decision` is the decision; `by` is `driver` for auto-yes, expiry and not-offered, `coordinator` otherwise; `outcome` is the matching item's completion or null (F13). Counts beside the array: `approvalsAccepted`, `approvalsAutoAccepted`, `approvalsStale`, `approvalsLate`, `approvalDir`. The rung (`:253-254`) is `some((e) => e.decision !== "accepted")`: an auto-yes is not exit 6, an expired or declined request is, a coordinator's decline is (Open for the owner). `announceDeclinedApproval` (`:2553`) counts non-accepted entries. The retry guard (`:2955-2965`) treats an auto-accepted file change as observable work like any accepted request. `commandsDeclined` can undercount (P1's item-less attempt) and `escalations` is the record. The receipt sentence is v3's: `receiptOk` says the record exists, not that nothing wrote it. `RECEIPT=` carries `approvals=<accepted>/<declined>/<expired>/<open>` and `late=<n>`, from the mailbox's request files and, for auto-yes entries that never touch the mailbox, from the report; with no report and no mailbox entry the token is absent.

## C13–C20, each by name

**C13.** One poll task over every alive Codex agent's `exit` and `pending`; `--pending`, `--decide`, re-arm (F6). **C14.** The idle guard is paused while a request is open; with no deadline nothing but the coordinator, a wall clock or a signal settles it, each recorded with its `why`. **C15.** There is no bound to be not-a-bound: the wait is the coordinator's by the owner's choice, and `--approval-timeout` where set is armed per request and touched by nothing. **C16.** Asynchronous throughout: record, two files, one paused timer, one interval. **C17.** Answered for the peer (exit 10, the `ASK=` in the poll), open for the survivor (F10). **C18.** Identity per run, per turn and per request, `link()` publication, single consumption, stale rejection, an `O_EXCL` owner file per mailbox; a grandchild's request carries its own thread and turn ids in both files. **C19.** Containment is the driver's inode check; no root at, inside or above the state directory can be granted; the launcher is the authorised path; the residual is a peer under another state directory, forbidden by a page sentence. **C20.** No header arms, bounds or pre-approves; `WRITABLE:` at read level declares a root the user settles, which is the existing contract for a right, not an approval.

## The other critiques

C6: the owner accepts that a command's text does not establish its effects, on parity with a Claude subagent's Bash; the rule names the two hazards instead of refusing the class. C7: no session grant is sent; the survivor is F10's residual. C8: decision, receipt, outcome and cause are four fields. C11: offers reach grandchildren; evidence stays root-only; the two rules read different fields. C12: `outcome` is the execution record. C13, C18, C19, C21, C22: v3's answers. C23, C24: out of scope. C25: the suites. C1–C5, C9, C10: unchanged.

## The suites

`evals/fake-app-server.mjs` gains, beside v3's seven scenarios: `filechange-in-tmpdir` (an `item/started` fileChange naming `$TMPDIR/x.md` in the `/private` spelling, then the request 4 ms later, then `item/completed` on `accept`), `filechange-outside` (a path under `/etc`), `filechange-no-started` (the request with no preceding item), `filechange-symlink` (a path through a symlink the case plants inside `$TMPDIR` pointing outside), `filechange-child` (the same under `OTHER_THREAD` after a `subAgentActivity` announcement), `approval-child-command` (a command request under `OTHER_THREAD` after the announcement), `approval-after-failed-attempt` (a failed `item/completed` of the same command text, then the request) and `approval-no-attempt` (the request alone).

`evals/protocol.test.mjs`, beside v3's nineteen cases:
- `a file change inside $TMPDIR is accepted by the driver, spelled either way`: `filechange-in-tmpdir`, no request file, exit 0, `by === "driver"`, `why === "rights cover it"`, `cause === "rights"`, `approvalsAutoAccepted === 1`, the RPC log shows `accept`; run twice, `/private/var/…` and `/var/…`.
- `a file change outside the roots is offered with its paths`: `filechange-outside`, a request file with `fileChanges[0].path === "/etc/…"`, `cause === "outside"`.
- `a file change with no item/started is offered, not guessed`: `filechange-no-started`, `fileChanges === null`.
- `a symlink inside $TMPDIR pointing outside is outside`: `filechange-symlink`, offered.
- `a grandchild's request is offered and its acceptance is not root evidence`: `approval-child-command` with a planted `accept`; a request file with `thread === OTHER_THREAD`; `commandsSucceeded` unchanged; `subagentThreads[0].commands === 1`.
- `a grandchild's file change inside the roots is auto-accepted`: `filechange-child`, `by === "driver"`, `subagent === true`.
- `an unannounced thread's request is declined at once`: `why === "unknown thread"`.
- `cause is sandbox after a failed attempt and policy without one`: the two scenarios, `cause` read back.
- `with no timeout a request waits`: `approval-wait` with no `--approval-timeout`, the driver alive and the request open after 3 s, then `SIGTERM`, exit 1, `why === "signal SIGTERM"`.
- `--approval-timeout still expires when set`: v3's case, kept.
- `a grandchild's own turn/completed settles its requests`: `why === "turn ended"`.

`evals/cli.test.mjs`: `--writable` at read level is accepted for a directory and for a regular file under the home, refused for `~/.codex`, the state directory, the home and its ancestors as at write level, and `--help` says so; `--approval-timeout 0` is the default and legal. `evals/lock.test.mjs`: `a write run waiting on a decision with no timeout holds its lock until SIGTERM, and a peer exits 10 meanwhile`. `evals/conformance.test.mjs` or `cli.test.mjs`: the read profile's filesystem table carries each read-level root, and `assertReadSandbox` refuses a response that lacks one or carries one more.

`evals/agent-run.test.mjs`: `--pending` prints `THREAD=`, `CAUSE=`, `ROOTS=` and `FILES=`; `RECEIPT=` counts an auto-accepted entry from the report when the mailbox has none. `evals/orchestrate.test.mjs`: the rule paragraph's load-bearing sentences ("non-destructive and in the plan's direction", "take to the owner, while the turn waits", "in a headless run decline it and name it", the two hazards, the `outcome` retelling) and the synthesis rule's four causes. `evals/agent-contract.test.mjs`: the Rights table's read row names `WRITABLE:` for a tool's store.

Live gates, opt-in under `--require-live`, in `evals/fidelity.test.mjs`: v3's accepted-command gate with P1's `nested=` discriminator; a read agent asked to write `$TMPDIR/probe.md` through the edit tool in the `/private` spelling, asserting the file exists, `approvalsAutoAccepted === 1` and no request file; and, once the measurements above are made, a read agent with the two VCS-client roots running `vcs status --short` in the monorepo checkout, asserting exit 0 and `index.dat` unchanged.

## Implementation estimate

| File | Change | Lines |
| --- | --- | --- |
| `plugin/skills/codex/scripts/driver.mjs` | v3's channel (380–450) plus: the fileChange `item/started` map, the resolved-path containment, auto-yes, grandchild offer and settlement, the cause heuristic, no-deadline default, read-level `--writable` into the profile and `assertReadSandbox`, the file-root variant of `resolveDir`, report fields and help | 520–620 |
| `plugin/skills/codex/scripts/agent-run.mjs` | v3's (170–200) plus `THREAD=`, `CAUSE=`, `ROOTS=`, `FILES=`, the auto-yes count from the report | 190–230 |
| `evals/fake-app-server.mjs` | fifteen scenarios | 180–220 |
| `evals/protocol.test.mjs` | thirty cases, two `RUNGS` contexts | 280–340 |
| `evals/cli.test.mjs`, `lock.test.mjs`, `agent-run.test.mjs`, `agent-contract.test.mjs`, `orchestrate.test.mjs`, `fidelity.test.mjs`, `conformance.test.mjs` | as listed | 90 + 70 + 140 + 25 + 60 + 110 + 30 |
| `plugin/skills/codex/SKILL.md` | Rights and header tables, `escalations` bullet, exit-6 wording, `FILE=missing` bullet, receipt and survivor sentences | 45 |
| `plugin/skills/orchestrate/SKILL.md` | the poll, the three commands, the rule and the synthesis paragraphs, the exit-10 and `FILE=missing` rows, the state-directory sentence | 45 |
| `plugin/skills/codex/references/environment-and-internals.md`, `parity.md` | the mailbox, auto-yes, the VCS-client grant and its risk, the permission-prompt row | 40 |
| `CHANGELOG.md` | one Unreleased entry | 25 |

About 1,850–2,200 lines. Composition: one Opus write agent for the driver, the launcher, the fixture and the suites in one thread; one Sonnet agent for the pages after `--help` is final; one Codex Sol cross-reviewer on the driver diff; Codex Astra as refuter given this document and its F1–F13; the three VCS-client measurements by Opus P1 before the VCS-client page text lands; the live gates by the coordinator. Six agents, announced before spawning, the VCS-client measurements first.

## Alternatives rejected

v3's list stands (the `$TMPDIR` mailbox, a header ceiling, `auto_review`, decline-then-resume as the only path, a driver-side allowlist for commands, binding a script's bytes, killing survivors by a process walk, a JSON-RPC error as refusal, a blocking loop, a FIFO, exposing `cancel`, offering `writeStdin`, a shared nonce, always-on arming). Added:

**A standing-instruction sentence instead of auto-yes.** Compliance, not mechanism (P1 Q5a); and a shell write leaves no `fileChange` item.

**Auto-yes by spelling (accept when the path starts with `$TMPDIR` as written).** The edit tool already compares spellings, and that is the defect being worked around; a planted symlink would pass. Resolved paths on both sides, or nothing.

**Auto-yes for commands whose text names only paths inside the roots.** A command is not a path list (F3, F4); the coordinator keeps every command.

**A default deadline of any length.** The owner: a request the plan covers is answered in seconds and one it does not cover is the owner's question; a timer that declines the owner's question is a decline nobody made.

**`TOOLS: vcs` expanding to the store roots.** Hides two paths the user is asked to approve, and the store location's source is unread; sugar later.

**Declining a grandchild's request as today.** The owner's «внуки» get the same treatment; the evidence rule already keeps their success out of the root's account, so nothing else had to change.

## Open for the owner

1. **A request the coordinator declined still exits 6.** Kept at your word; you want such runs rare, and the rule sends the doubtful ones to you instead of declining them.
2. **The `sync`-only grant** was never run (the classifier refused it). If it suffices, the 33 GB `objectdb` root is not needed and its risk disappears; the measurement is first in the list.
3. **MDM and the VCS-client grant**: untested through the app-server, which applies the managed configuration `codex sandbox` did not.
4. **The auto-yes boundary**: every resolved path inside the writable roots, `$TMPDIR` at read level. It does not extend to a file change whose `item/started` never arrived (offered instead) or to any command (offered). Say if you want a `rm -rf` inside the agent's own `$TMPDIR` auto-answered too; the driver would have to parse the shell, and v4 does not.
5. **Nested `codex` and `kill` go to you** under the rule as written; say if the plan naming them is enough for the coordinator to approve them.
6. **`WRITABLE:` at read level** is the shape chosen for the VCS client; a `TOOLS: vcs` line can replace it once the VCS client's mount-point file is read.

## Found in passing, for the ledger

- v3's five items stand: the absent `*ApprovalResponse.json`; the scouting's nested-`codex` count; `escalations` versus `commandsDeclined` after an item-less attempt; the "nothing left running" promise against commands in their own process groups; `--writable ~/.claude` granting the plugin's data directory today.
- Codex's edit tool decides whether to ask for approval by comparing the patch path's spelling with the granted root's spelling, so a `/private/var/…` path inside `$TMPDIR` asks and the `/var/…` spelling does not (P1 Q5, level 3; the mechanism a hypothesis). Not the plugin's defect; the ten "patch rejected by user" entries on this machine are its cost, and auto-yes is the plugin's answer. Worth a note in `incidents.md` beside the here-document entry, which is the same shape: a path the sandbox allows and a tool spells differently.
- `thread/start` reports `$TMPDIR` in the `/private/var/…` spelling while the profile was written with `/var/…` (P1 Q5, level 3). `assertReadSandbox` compares through `canonPath` (`:2188-2199`), so the driver is unaffected; a reader of the report's `sandbox.writableRoots` sees the resolved spelling.
