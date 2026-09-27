# Design v3: the approval channel

Run `2026-09-27-approval-channel`, Fable D1, against the tree at b3872b4 (`plugins/entrust/plugin/skills/codex/scripts/driver.mjs`, 4198 lines, version 0.20.0, pinned codex 0.153.4; the installed binary is 0.155.1). v3 answers Codex Astra C1's critique of v2 ([03-critique-astra.md](03-critique-astra.md), F1–F13) with every citation resolved first, and keeps Opus P1's probe ([01-probe.md](01-probe.md)) as v2 folded it in. Evidence levels as the repository defines them: 1 the line resolves, 2 an independent reader would say the same, 3 made to happen; a lifecycle claim not made to happen is a guess and says so. Line numbers are the driver's unless a file is named. [02-design-v1.md](02-design-v1.md) and [02-design-v2.md](02-design-v2.md) stay as written.

## Changes from v2

Thirteen findings, thirteen accepted, none refuted: each one names a line that resolves as C1 read it, and no line in the tree contradicts it.

- **F1 accepted.** `checkRoot` walks the candidate's ancestors against the protected inode (`:921-936`), so a root that *contains* the state directory passes, and `~/.claude` is a legitimate root by the reference's own words (environment-and-internals.md:72-74). Changed: `checkRoot` gains the inverse walk and refuses any root that is the state directory or an ancestor of it; a peer under another `ENTRUST_STATE_DIR` is the named residual with the page sentence that forbids that launch.
- **F2 accepted.** The launcher takes any absolute report path (`agent-run.mjs:195-204`) and v2's inverse check tested only the run's own roots. Changed: the driver refuses an `--approval-dir` that is not inside `stateDir()` by inode walk; containment is a driver check, and the launcher refuses `--approvals` for a report outside the state directory as an early error.
- **F3 accepted.** The repository measured `core.fsmonitor=pwn.sh` running under `status`, `diff` and `ls-files` (incidents.md:76-81), and the driver's own git carries overrides for exactly that (environment-and-internals.md:266-272), which an accepted command does not. Changed: a VCS query is approved only in a checkout no agent of this run may write and after the coordinator's own config check; the receipt sentence says what `receiptOk` proves after an unsandboxed command.
- **F4 accepted.** The decision binds a request id, not bytes, and the server runs whatever is at the path when it runs (no line binds the reviewed bytes; none can). Changed: a command that runs a file in a location any agent of this run can write is declined; scripts in `$TMPDIR` leave the read-then-decide bucket.
- **F5 accepted.** v2 clipped `command` at 4000 and `--pending`'s `COMMAND=` at 600 while the rule said "read every word". Changed: no clip anywhere; `--pending` prints the command whole between marker lines; every clipped inventory row moves to read-whole-first.
- **F6 accepted.** A request raised as the coordinator begins a 600 s block expires at the moment the block returns (v2's own sizing). Changed: one poll task over every alive Codex agent's markers, the deadline 900 s, and the idle timer paused while a request is open, so the deadline no longer has to sit under it.
- **F7 accepted.** v2 had no mailbox ownership; two drivers on one directory would rewrite one `pending`. Changed: an owner file created `O_EXCL`; a second driver exits 2 unless the owner is dead by `holderAlive` (`:1388`).
- **F8 accepted.** `ownedTurns` only grows (`:2786`), `startCorrectiveTurn` nulls `rootTurnId` and starts a new turn without `finish()` (`:3079-3092`, `:2971-2975`). Changed: the offer predicate is the *current* turn, and every open request is settled when the root turn ends, whatever starts next.
- **F9 accepted.** The interval looked only at open ids and `--decide` printed `DECIDED=` after its checks, not after the driver consumed the file. Changed: `expire()` reads the decision file before declaring expiry; `--decide` re-reads after publishing and prints `LATE=` when the request is settled or the run is over; `finish()` scans the mailbox and counts late decisions.
- **F10 accepted.** P1 saw each command in its own process group under the app-server (01-probe.md:18), and `killGroup` signals `-child.pid` alone (`:2400-2403`); the lock survivor fixture puts its survivor inside the codex group (lock.test.mjs:724-730), so it measures nothing about this. Changed: the residual is stated with what the driver can and cannot do, a named unknown, and a page sentence.
- **F11 accepted.** `kind` is `command | writeStdin` with `command` the default (ServerRequest.json:345-352, :401-408). Changed: only `kind` absent or `"command"` is offered; `--pending` prints `KIND=`.
- **F12 accepted.** The `FILE=missing` row relaunches "once, same rights, under a fresh report path" (orchestrate/SKILL.md:131) and the launcher writes the marker from the driver's exit whatever it was (`agent-run.mjs:152-156`). Changed: the status lines read the mailbox, with or without a report, and the row reads them before any relaunch.
- **F13 accepted.** `send` is `try { proc.stdin.write(…) } catch {}` (`:2417`), no delivery confirmation, and v2 called the entry "the one record that a command ran outside the sandbox". Changed: `decision` is the decision, `resolved` is the server's receipt of it, `outcome` is what the item's completion said or null, and the user-facing sentence follows `outcome`.

## In one paragraph

The coordinator arms a channel per agent at `--new` with one flag; the launcher then hands the driver a mailbox directory inside the agent's own `<DIR>`, which the driver verifies lies inside its state directory and which no Codex sandbox under that state directory can write, because the driver refuses every root inside or above the state directory. When the server asks to run a command the sandbox denied, the driver writes a request file and a `pending` marker there, answers nothing, pauses its idle guard, arms a request timer of its own, and lets the turn wait; the server itself waits without bound. The coordinator's one poll task over every alive Codex agent wakes on any `pending` as it wakes on any exit marker, reads the request whole through a launcher subcommand, decides under a rule the plan pre-authorised, and writes the decision with a second launcher subcommand, atomically and once. The driver validates the decision against this run, this turn and this request, sends `accept` or `decline`, and records the request, the decision, the server's receipt of it and the command's reported outcome in the report's `escalations` array. An accepted command runs with no sandbox and the user's rights. An unanswered request expires as a decline. Exit 6 is "a request was declined or expired", never "a request was accepted". File-change requests, `writeStdin` requests, the legacy pair and permission-profile requests are declined at once as today; the channel carries command approvals and two decisions.

## Names

- **channel**: the whole mechanism. **mailbox**: `<DIR>/approvals/`, the directory the driver writes requests into and reads decisions from. **request**: one `item/commandExecution/requestApproval` of kind `command` the driver offered. **decision**: the coordinator's `accept` or `decline` for one request. **offered**: a request the driver wrote to the mailbox and held open; a request declined at once is recorded and not offered. **expired**: an offered request the deadline, a cut or the turn's end settled as `decline`. **late**: a decision published after its request was settled. **outcome**: what the server reported of an accepted command's run, or null.

## What `accept` grants

The command re-runs with no Seatbelt at all. P1 Q2, level 3: under the `entrust_read` profile a nested `sandbox-exec -p "(version 1)(allow default)" /usr/bin/true` exits 71; after `accept` the same line printed `nested=0` and the `/tmp` sentinel appeared. Neither the process list nor the item notifications carry a sandbox field, so the driver cannot observe the change; the entry records the decision, and `outcome` records what the server said of the run. The network: a hypothesis by P1, drawn from "no Seatbelt at all", since the profile had egress on; the design treats an accepted command as having the user's network, and a `NETWORK: no` line does not reach an accepted command (guess; C1's open list names the measurement). The request follows a sandboxed attempt that failed (P1 Q1: `touch: Operation not permitted`, then `exec_command` with `sandbox_permissions "require_escalated"`), so the model is asking for the escalation by name. Codex appends `[projects."<cwd>"] trust_level = "trusted"` to the config of the home it runs in; the driver's private home takes that today (`:1063-1065`), and the channel changes nothing there.

An accepted command reads files and runs what they say. A `git` query runs the repository's `core.fsmonitor`, hooks, `diff.external` and pager with the user's rights (incidents.md:76-81, level 3 for fsmonitor under `status`, `diff`, `ls-files`); a script runs the bytes at its path when the server starts it, not the bytes the coordinator read. Those two facts shape the decision rule below.

## The mechanism, end to end

### Arming

`agent-run.mjs --new --approvals --report-file <REPORT>` makes `<DIR>/approvals/` at 0700 beside `prompt.txt`, inside the `<DIR>` it already makes at 0700 (`agent-run.mjs:193-207`, level 1), and refuses `--approvals` (exit 2) when `<REPORT>` does not resolve under the state directory the environment names (`ENTRUST_STATE_DIR`, else `CLAUDE_PLUGIN_DATA`, the order the driver uses, `:1050-1051`): an early refusal in the coordinator's own call, while the driver's inode check below is the wall. `--run` (`agent-run.mjs:121-157`) spawns the driver with `--approval-dir <DIR>/approvals` when that directory exists and with today's two flags when it does not. Nothing else in the wrapper's command or message changes; `codex-agent.md` is unchanged. A run without the mailbox declines every request at once, as today (`:2714-2769`, level 1), and the report's entries say `offered: false`.

The flag is the coordinator's own command line, never the prompt: `APPROVAL_DIR` and `APPROVAL_TIMEOUT` join `FIELDS` as `cli-only` rows (`:180-200`), which `argvFromPromptFile` refuses in a prompt file naming the flag to use (`:652-653`, level 1), and `agent-contract.test.mjs:54` already checks that every `cli-only` name is refused. The arming is per agent, chosen when the plan is written.

### What the driver checks before the turn

Three checks, all exit 2 before anything is spawned:

1. **Containment.** `--approval-dir D` must be absolute and exist, and a walk of D's ancestors must meet `stateDir()`'s inode (the walk `checkRoot` already does for the protected roots, `:921-936`, in the same direction). A mailbox anywhere else is refused: under a `$TMPDIR` of some peer (F2), under a repository, under `/tmp`. This is what makes the guarantee the driver's rather than the launcher's.
2. **No root above the state directory.** `checkRoot` (`:888-940`) gains the inverse walk: from `stateDir()` upward, every ancestor's inode is compared with the candidate's, and a hit is refused as "an ancestor of this driver's state directory". Today the function refuses roots *inside* the state directory and `~/.codex` and roots at or above the home (`:900-911`); a root between the home and the state directory, `~/.claude` or `~/.claude/plugins`, passes and is named a legitimate root by the reference (environment-and-internals.md:72-74). With the inverse walk it is refused at write level for `--cwd`, `--writable`, `$TMPDIR` and a worktree's repository and destination, since all five pass `checkRoot` (`:2290`, `:2333`, `:2313`, `:1807-1826`). The same walk is applied to `~/.codex`, which closes the same hole for the receipt store.
3. **Ownership.** The driver creates `D/owner.json` with `O_EXCL` (`wx`), carrying `{pid, identity, startedAtMs, threadId: null}` and rewriting `threadId` once the thread exists. An existing owner file whose holder is alive by `holderAlive` (`:1388`, pid plus start-time identity, the lock's own test) is exit 2 naming the pid; a dead holder's file is replaced and the replacement is announced on stderr. The launcher never produces this case, since every `--new` makes its own `<DIR>`; a hand run can, and it costs a refusal rather than a shared `pending` (F7).

`--approval-timeout S` without `--approval-dir` is exit 2; `S` of 0 is exit 2 (the server has no bound of its own, P1 Q3 hold, so a channel with no deadline is a hang). The v2 rule "S below `--idle-timeout`" is gone: the idle guard is paused while a request is open (below), so the two no longer compete.

### When a request arrives

`handleServerRequest` (`:2714`) gains one branch before `REFUSALS`. A request is **offered** when all of these hold: `msg.method === "item/commandExecution/requestApproval"`; `msg.params.kind` is absent or `"command"` (F11; `writeStdin` is input to a terminal the rule cannot read, ServerRequest.json:345-352); `opts.approvalDir` is set; `msg.params.threadId === rootThreadId` and `msg.params.turnId === rootTurnId`, the turn now running, not merely one this invocation ever owned (F8; `rootTurnId` is nulled by `startCorrectiveTurn`, `:3082`, and by the transient retry, `:3066`, so nothing is offered between turns); `settled` and `pendingCut` are both false (`:2384`, `:2650`, C21). Every other request takes today's path unchanged: declined at once with the schema's refusal and recorded, with `offered: false` and a `why` (`subagent thread`, `no channel`, `file changes are rights`, `legacy method`, `permission profile`, `kind writeStdin`, `not the current turn`, `turn closing`).

For an offered request the driver:

1. Builds the record from the request's params alone, nothing clipped, and writes it whole: `<DIR>/approvals/<id>.request.json`, written to `<id>.request.json.<hex>.tmp` and renamed over. `id` is `<seq>-<8 hex>`, `seq` per run from 1.
2. Rewrites `<DIR>/approvals/pending`, one open id per line, by the same rename. When the last open request settles the file is unlinked, so `[ -s pending ]` is the coordinator's test.
3. Holds `{ rpcId: msg.id, record, timer }` in a `Map` keyed by `id`. Nothing blocks: the dispatcher returns (C16).
4. Pauses the idle guard: `clearTimeout(idleTimer)` and a flag that makes `touchIdle()` a no-op while any request is open; settlement re-arms it. A waiting request is the coordinator's time, and the deadline is what bounds it (F6, C14, C15).
5. Arms the request timer, `setTimeout(expire, deadlineMs).unref?.()`, independent of every event on every thread (C15).
6. Prints one stderr line, which lands in `<DIR>/err.txt`: `entrust: approval request <id> waits for a decision in <D> until <deadlineAt>; the thread reports waitingOnApproval`.
7. Starts, if not running, a 250 ms `setInterval` that looks for `<id>.decision.json` for every open id and stops when none is open.

Request record, the JSON shape (every field a copy of the server's params, `schema-0.153.4/ServerRequest.json:353-465`, level 1, plus the run's identity; P1's live params, level 3, carried `kind`, `environmentId`, `reason`, `command`, `cwd`, `commandActions`, `proposedExecpolicyAmendment` and `availableDecisions`):

    { "id": "1-9f3a2c1e",
      "run": { "pid": 4242, "identity": "<selfIdentity()>", "startedAtMs": 1790000000000, "threadId": "thr_…", "turnId": "turn_…" },
      "rpcId": 9002,
      "method": "item/commandExecution/requestApproval",
      "itemId": "item_a", "approvalId": null, "kind": "command", "environmentId": "local",
      "command": "<the whole wrapper string, never clipped>", "commandActions": ["<each parsed action, whole>"], "cwd": "/Users/…",
      "reason": "<the model's justification, or null>", "networkApprovalContext": null,
      "proposedExecpolicyAmendment": null, "proposedNetworkPolicyAmendments": null,
      "availableDecisions": ["accept", {"acceptWithExecpolicyAmendment": {"execpolicy_amendment": ["…"]}}, "cancel"],
      "level": "read", "sandbox": { …effectiveSandbox… },
      "askedAt": "2026-09-27T12:40:00.000Z", "deadlineAt": "2026-09-27T12:55:00.000Z" }

Nothing in the record comes from `item/started` or `item/completed`: P1 saw one sandboxed attempt run and emit neither, so a record built from items would sometimes be empty. The two proposed amendments and `availableDecisions` are recorded for the reader and gate nothing.

### The deadline

`LIMITS.DEFAULT_APPROVAL_TIMEOUT_S: 900`, in the table at `:60-130` with its reason: one `TaskOutput(…, block: true, timeout: 600000)` (orchestrate `SKILL.md:107`), the longest the coordinator can be away from its poll task, plus five minutes to wake, read the command whole and publish a decision. v2's 600 s expired at the moment such a block returned (F6). The number can exceed the 900 s idle default (`:72`) only because the idle guard is paused while a request is open; the wall clock, where one was declared, still cuts on schedule. The server would wait forever (P1 Q3 hold, 180 s tested, longer unknown), so this number is the whole of the bound. What it costs: an armed agent whose coordinator never answers waits fifteen minutes per request before the same decline it would have got at once; a request's deadline is the bound of that request only, so several requests in a row hold a write agent's lock for their sum (C1's last open item), which the lock section states.

### Expiry, cuts, signals, the turn's end, and the driver dying first

`expire(id)`: **first** look for `<id>.decision.json` and, when it is there and valid, take it as the coordinator's decision with `waitMs` equal to the deadline (F9: the file can land between the last interval tick and the timer). Otherwise send `{ decision: "decline" }` on the request's `rpcId`, settle the record with `decision: "expired", by: "driver", why: "deadline"`, rewrite `pending`, clear the timer, and re-arm the idle guard with `touchIdle()`. The turn goes on: the server answers a decline in a millisecond and the model continues (P1 Q3 error, and the 27 production runs, coordinator's note, level 3).

Order matters because closing stdin with a request pending aborts the turn: the server logs `TurnAborted`, sends no `turn/completed`, and exits 0 within 43 ms (P1 Q3 stdin close, level 3). The driver closes stdin only in `shutdown()` (`:2531`), which runs from `exitWith` after the report is written (`:2562-2600`), so the report never depends on a `turn/completed` the abort would withhold. Every path that ends the turn or the run settles open requests **first**, each with its own `why`:

- **The root turn's end** (`handleMessage`, `:2938-2976`, the `turn/completed && isRoot(p)` branch), before the cut, the transient retry, the corrective turn and `finish()` are considered: `why: "turn ended"`. Whatever starts next, no request of the ended turn stays open, and a decision for it published later is late (F8). Whether a server can complete a turn with a request open was not measured (P1's exec cell stayed blocked through the hold); the settlement costs nothing when it never happens.
- `cutTurn` (`:3276`), before `interruptTurn()`: `why: "cut idle" | "cut wall" | "cut commands" | "signal SIGTERM"`. The server processes stdin in order, so the decline lands before the interrupt (level 2; the protocol case `approval-during-cut` reads the RPC log for the order).
- `finish()` (`:3544`), before `classifyEvidence()`: the catch-all for `abort()` with a thread (`:2594-2615`), for the child-exit path (`:3976-3978`) and for the signal path's second-signal shortcut (`:4174`): `why: "run ended"`. `finish()` then scans the mailbox once for decision files whose request is already settled by the driver and counts them as `approvalsLate` (F9).
- `shutdown()` clears the interval and every timer; by then nothing is open, so its `stdin.end()` closes a quiet channel.

If the driver dies first, `SIGKILL` or a crash before `finish()`: no report, as today (environment-and-internals.md:150). The launcher writes `<DIR>/exit` from the driver's exit status (`agent-run.mjs:152-156`), the request file stays on disk without a `settled` object, `pending` still lists it, and the status lines say so (below, F12). The server's stdin pipe closes with the driver, and a pending request makes the server abort the turn and exit 0 on its own (level 2, from the stdin-close measurement).

### How a decision travels back

`agent-run.mjs --decide <id> --accept | --decline [--why TEXT] --report-file <REPORT>`:

1. Reads `<DIR>/approvals/<id>.request.json`; refuses with exit 2 and a `REFUSED=` line when the file is missing, when the request already carries a `settled` object, when `<id>` is not in `pending`, or when `<DIR>/exit` exists.
2. Writes `<id>.decision.json.<hex>.tmp` at 0600, then `link()`s it to `<id>.decision.json` and removes the temp: the same no-clobber publication the report uses (`:991-1010`, level 1). `EEXIST` is "already decided" and prints the existing decision; a second decision for one id is impossible, whoever writes it (C18, single consumption).
3. **Re-reads** the request file and `<DIR>/exit` after the link. When the request is now settled by the driver, or the run is over, it prints `LATE=<id> <accept|decline>: the driver settled this request as <expired|declined> at <time>` and exits 3; otherwise `DECIDED=<id> <accept|decline>` and exits 0 (F9). `DECIDED=` still means "published while the request was open", not "consumed": the driver's `resolved` and `outcome` say what happened next, and a decision the driver never consumed shows on the status lines after the run.

Decision record:

    { "id": "1-9f3a2c1e", "run": { "pid": 4242, "startedAtMs": 1790000000000, "turnId": "turn_…" },
      "decision": "accept", "by": "coordinator", "why": "plan: arc reads in the Arcadia checkout", "decidedAt": "…" }

`id` and `run` are copied from the request file by the launcher, never typed. The driver accepts a decision file only when `id` is an open request of this run and `run.pid === process.pid && run.startedAtMs === startedAtMs && run.turnId === rootTurnId`; anything else is left in place, counted as `approvalsStale`, and the request keeps waiting (C18). The driver then sends `{ decision: "accept" }` or `{ decision: "decline" }` on the request's `rpcId`, settles the record (`decision: "accepted" | "declined", by: "coordinator", why, settledAt, waitMs`), rewrites the request file with a `settled` object, rewrites `pending`, and re-arms the idle guard. `serverRequest/resolved` for that id, sent within milliseconds of the answer (P1, +1 to +3 ms, level 3) and ignored by the driver today, sets `resolved: true`; the root `item/completed` whose `item.id` equals the request's `itemId` sets `outcome: { status, exitCode, durationMs }`; each stays `false` or `null` where the notification never came (F13).

`agent-run.mjs --pending --report-file <REPORT>` prints each open request as `REQUEST=<id>`, `METHOD=`, `KIND=`, `CWD=`, `REASON=` (whole), `DEADLINE=`, then the command whole and verbatim between two marker lines, `COMMAND<<` and `COMMAND>>`, newlines included, so a script-shaped command is read as the script it is (F5); `REQUESTS=<n>` closes the listing, `REQUESTS=0` alone when nothing is open, and after `exit` each open id prints as `ORPHANED=<id>` and each unconsumed decision as `LATE=<id>`. The coordinator never opens the JSON.

### What the driver answers, per decision

| Decision (0.153.4 pin `:265-343`; 0.155.1 identical) | Command request, kind `command` | `writeStdin`, file-change | Exposed | Why |
| --- | --- | --- | --- | --- |
| `accept` | `--decide --accept` | no | yes | the one grant the plan can cover for one command, and it is the user running that command unsandboxed; input to an existing terminal cannot be read as a command (F11), and a file write outside the roots is a rights question, `RIGHTS:`/`WRITABLE:` on a `RESUME:` continuation being the existing path (parity.md:20) |
| `acceptForSession` | no | no | no | the session cache stops prompting, so the report could not list what ran under it (C7, C8) |
| `acceptWithExecpolicyAmendment` | no | — | no | a persistent rule of unknown store (A5 Q4), forbidden by the page's fifth composition rule, and far wider than the command: for `sleep 25; touch /tmp/…` the server proposed `["sleep","25"]` (P1 Q1, level 3), a prefix that admits every future command opening with those two tokens, the `touch` under review included |
| `applyNetworkPolicyAmendment` | no | — | no | persistent, host-scoped, store unknown (A5 Q4); network policy stays the `NETWORK:` line's |
| `decline` | `--decide --decline`, expiry, cut, turn end, not offered | at once, as today | yes | the turn continues; honoured in 27 production runs (coordinator's note, level 3) |
| `cancel` | no | no | no | a decline plus an interrupt; Stop on the card or `SIGTERM` to the pid already interrupt and write the report (codex `SKILL.md`, Reading the result, last bullet) |

The refusal shape stays `{ decision: "decline" }` and never the JSON-RPC error: the error is honoured (P1 Q3 error) but the model sees `exec_command failed: CreateProcess { message: "Rejected(\"approval request failed\")" }` and the item completes `status: "failed", exitCode: null`, which the classifier counts among `commandsFailed` (`:3318`, `:3336`), a refusal read as a broken tool. `availableDecisions` never lists `decline` (P1 Q1 flag) and is absent from the generated schema (P1, level 1); both are recorded and gate nothing. `item/permissions/requestApproval` stays refused as today (`:2733`); the legacy pair stays `abort` (`:2731-2732`).

### File-change requests

Never offered, kept. The request carries `reason: null` and `grantRoot: null` and names no path; the path is only in the `item/started` two milliseconds before it, and there is no sandboxed attempt first (P1 Q4, level 3). Per-file approval would have to join two messages by `itemId`, approve a write the sandbox never refused, and write the file with no sandbox. Every one of the ten on this machine was a read agent trying to write. The entry's `detail`, empty today for all ten (`:2755`), becomes the joined change list, `add /tmp/x.txt; update src/a.ts`, when a root `item/started` fileChange with that `itemId` was seen (a small map keyed by item id, dropped at that item's `item/completed`, a window C1 names as unmeasured); when none was seen, `detail` is `""` and the entry says `fileChanges: null`. This is the one place an entry reads an item, and it is a display aid on a request that is never offered.

## The coordinator's side (orchestrate page)

The armed agent runs as a **background** Agent call: a foreground wrapper blocks the coordinator's turn until the run ends, so every request would expire (level 2). One poll task covers every alive Codex agent of the wave (F6), launched as a background Bash task with `TaskOutput(<poll_task_id>, block: true, timeout: 600000)` on it:

    while :; do sleep 5; for d in <DIR-1> <DIR-2> …; do if [ -s "$d/exit" ]; then echo DONE="$d"; exit 0; fi; if [ -s "$d/approvals/pending" ]; then echo ASK="$d"; exit 0; fi; done; done

It sleeps first so a task re-armed within a second of a decision does not fire again on the marker the driver is still rewriting. On `ASK=`:

1. `node "${CLAUDE_SKILL_DIR}/scripts/agent-run.mjs" --pending --report-file "<REPORT>"` and read every line, the command between its markers whole.
2. Decide under the rule below. `node "${CLAUDE_SKILL_DIR}/scripts/agent-run.mjs" --decide <request-id> --accept --why "<the plan line that covers it>" --report-file "<REPORT>"`, or `--decline --why "<the rule that refuses it>"`. A `LATE=` line means the driver settled it first: nothing ran on your word, and the report's entry says `expired`.
3. Re-arm: launch the same poll command again, with the finished agent's directory removed on `DONE=`, and `TaskOutput` on it.

On `DONE=` the wrapper's own lines follow at its completion notification, as today. A Claude agent's `TaskOutput` block is where the coordinator can be away for 600 s; the 900 s deadline covers one such block, and the page says: while an armed Codex agent is alive, block on the poll task and let a Claude agent's completion reach you as its notification.

Reading under the data directory is what the coordinator does already (`<REPORT>` lives there, orchestrate `SKILL.md:29`); writing is the launcher's, a subprocess handed the path, which the page's measured rule permits (`SKILL.md:29`, measured 2026-09-08, level 3 for `--new`, level 2 for `--decide`). The rule "never run `mkdir`, Write or a redirect under that directory yourself" stays true and gains "and never write a decision file by hand: `--decide` is the one path".

A headless `-p` session runs the same commands; it has no user to ask, so a request the rule sends to the user is declined with `--why "needs the user"` and the answer names it. The wrapper's ten-minute rerun is unaffected: `--run` waits on `<DIR>/exit` (`agent-run.mjs:223-266`, level 1). `RESUME:`: a continuation gets a fresh run directory and a fresh `agent/` (codex `SKILL.md:118-125`: `<run>` unique, one directory per agent; a "fresh report path" in the same `agent/` is refused, `agent-run.mjs:237-239`), so the channel is armed again at its `--new` or not at all; no grant carries across because `acceptForSession` is never sent, and whether the server's own cache remembers a plain `accept` across a resume is a guess.

The wrapper's nine status lines stay nine (`agent-run.mjs:57`). `statusLines` reads the mailbox when it exists, report or no report, and `RECEIPT=` carries `approvals=<accepted>/<declined>/<expired>/<open>` plus `late=<n>` when any decision was never consumed: `RECEIPT=turnStatus=completed receiptOk=true model=Sol approvals=1/0/0/0`, and with no report `RECEIPT=approvals=1/0/0/0` (F12). The counts come from the request files' `settled` objects, which the driver writes before it sends the answer, so a driver that died between writing and sending shows an accepted request whose `outcome` is unknown, which is the honest state.

## The lock (C17, F10)

A write agent waiting on a decision holds its directory lock (`acquireLock` at `:2329`, released in `shutdown()` after the group is waited out, `:2525-2546`, level 1). What bounds one hold is the request deadline; several requests in one turn hold it for their sum, and the page says so. The page adds to the exit-10 row: "a holder that waits on your decision has an `ASK=` in your poll loop; answer it before you wait on the holder."

What the lock does not cover. P1 observed each command, sandboxed or accepted, running in its own process group under the app-server pid with no wrapper (01-probe.md:18, level 3). `killGroup` signals `-child.pid`, the app-server's group (`:2400-2403`), and `quiesceGroup` waits on that group alone (`:2500-2505`); so a command the server started is reached by neither, today's sandboxed commands included. What the driver can do: nothing it can prove. The protocol names no pid for a running command (P1: the item notifications carry no such field), so the driver cannot signal it; a walk of the process table by parent pid finds the server's children only while the server is alive, and after the server's death they are reparented and unfindable by that route. Named unknown: whether the app-server ends its command children on its own exit or abort (P1's stdin close ended a command that had not started; a running one was not tested). The page sentence, on the codex page beside the rule: "an accepted command can outlive the agent, its server and the lock: approve nothing that runs longer than its own output, never a watcher, a server or a daemon, and before a second writer enters a directory where a command was approved, `pgrep -fl '<the approved command>'` and wait for it." C17 is therefore answered for the wait and left open for the survivor, and the codex page's "sweeps its codex … nothing left running" sentence is a ledger item (below).

## The trust boundary (C19, F1, F2)

The mailbox is inside the state directory, and the driver checks that (containment, above). Every root a sandbox under that state directory may write passes `checkRoot`, which now refuses a root inside the state directory, the state directory itself, or any ancestor of it (`:888-940` plus the inverse walk): `--cwd` at write level (`:2290`), `--writable` (`:2333`), `$TMPDIR` at both levels (`:2313`), the worktree's repository and destination (`:1807-1826`). Level 1 for each refusal; level 2 for the consequence that no Codex sandbox under the same state directory, at read, worktree or write level, can write a decision file. The coordinator's own Write, `mkdir` and redirects there are refused in a headless session and the launcher handed the path writes unopposed (orchestrate `SKILL.md:29`, measured 2026-09-08, level 3).

What a peer can and cannot reach. A peer driver under the **same** state directory cannot be given a root at, inside or above it, and its `$TMPDIR` takes the same guard, so it cannot write the mailbox at any level (level 2). A peer under **another** `ENTRUST_STATE_DIR` is bound only by its own state directory: its `checkRoot` protects a different inode, and it can be given `--writable ~/.claude` or the first state directory itself; it can also be given a `$TMPDIR` inside it. That peer is a residual, the same one the lock already documents ("two runs under different values do NOT exclude each other", environment-and-internals.md:197-198), and it cannot arise from the pages: every launch passes `CLAUDE_PLUGIN_DATA` under its own name and the driver reads `ENTRUST_STATE_DIR` first and that variable second (codex `SKILL.md`, "Every launch forwards that variable"). The page gains the sentence: "never launch an agent under another state directory while an armed agent is alive: it shares neither the lock nor the mailbox guard."

Any process that can write the mailbox is running as the user outside every sandbox: the coordinator's launcher, a Claude subagent's Bash, any program of the user's. That process already holds everything an accepted command would gain, since an accepted command runs as that same user with no Seatbelt; writing a decision file gives it nothing it could not do by running the command itself. It is the boundary the harness gives a Claude subagent's Bash today, and the channel neither widens nor narrows it. The launcher therefore checks nothing beyond what is stated: request open and unsettled, run alive, `exit` absent, report under the state directory, publication by `link()` at 0600. A shared nonce was considered and rejected: readable in `<DIR>` by any process of the user's, and a secret in the coordinator's tool output. What stays a rule and not a wall: the coordinator decides, and no brief carries the `--decide` command.

## The report and the exit ladder

`escalations` keeps its name and becomes one entry per approval request, whatever happened to it. Renaming was considered and rejected: every reader, six suite cases (`protocol.test.mjs:66-82, 147-158, 249-251, 770`), the pages and three changelog corrections know the name. Each entry:

    { "id": "1-9f3a2c1e" | null, "method": "…", "kind": "command",
      "detail": "<the command whole, else reason, else message; a joined change list for a file change>",
      "thread": "thr_…", "subagent": false,
      "offered": true, "decision": "accepted" | "declined" | "expired", "by": "coordinator" | "driver", "why": "…",
      "askedAt": "…", "settledAt": "…", "waitMs": 1234,
      "resolved": true, "outcome": { "status": "completed", "exitCode": 0, "durationMs": 25055 } | null,
      "cwd": "…", "reason": "…", "fileChanges": null }

`decision` is the decision; `resolved` is the server saying it received it; `outcome` is what the item's completion said, and null when it never came (F13, C8, C12). A request declined at once has `id: null, offered: false, by: "driver", waitMs: 0`. Beside the array: `approvalsAccepted`, `approvalsStale`, `approvalsLate`, and `approvalDir`. `commandsDeclined` stays a count of items the server completed as `declined` (`:3336`) and can undercount, since a sandboxed attempt can emit no item (P1); `escalations` is the record of requests.

The rung (`:253-254`) becomes `when: (c) => c.escalations.some((e) => e.decision !== "accepted")`, help text "an approval request was declined or expired unanswered; inspect the report, if delivered, before judging task completeness". An accepted request is not exit 6; an expired one is; a request the coordinator declined is exit 6 too (Open for the owner). `announceDeclinedApproval` (`:2553`) counts non-accepted entries. An accepted command completes as a root item with its exit code and counts as any root command does (`:2805-2815`, `:3310-3340`).

The transient retry guard (`:2955-2965`) adds `&& !escalations.some((e) => e.decision === "accepted")` (C22 inside the driver). The coordinator's own replay is the status lines and the page row (F12): the `FILE=missing` row of the result table (orchestrate `SKILL.md:131`) becomes "read `RECEIPT=` first: an `approvals=` token whose first number is not 0 says a command ran with your rights and no report says how it ended; read `<DIR>/approvals/` and check the tree and whatever the command touched before any relaunch, and never relaunch a prompt that would ask for it again". The codex page's `FILE=missing` bullet gets the same sentence.

The receipt, corrected (F3, C12). `receiptOk` proves that the rollout's opening `session_meta` names this thread (`:3131-3170`); it proves nothing about what an accepted command did, and an accepted command runs as the user and can write `~/.codex`. The page's sentence becomes: "on a run with an accepted request, `receiptOk` says the record exists, not that nothing wrote it". The root-thread-only rule is unaffected: a subagent's request is never offered. The thread start is unchanged: `approvalPolicy: "on-request"`, `approvalsReviewer: "user"`, both asserted (`:4035-4059`).

## The decision rule, as page sentences

For the orchestrate page, after the poll loop:

> An agent asks to run a command the sandbox stopped. Approving it is running that command yourself: it re-runs with no sandbox, with your user's rights and your user's network, and it runs whatever the files it reads tell it to. So read the command whole, between the markers `--pending` prints, and decline one you cannot read whole. Approve a `ps`, a `sed -n`, `cat`, `grep` or `diff` over named files in a tree no agent of this run may write. Approve a `git` query (`status`, `log`, `show`, `diff`, `blame`, `grep`) only in a checkout no agent of this run may write, and only after `git -C <repo> config --show-origin --get-regexp 'fsmonitor|hooksPath|diff\.external|pager|sshCommand|askPass|credential|^alias\.'` prints nothing you did not put there, because the query runs those; an `arc` query on the same terms in the user's own mounted checkout, knowing that what `arc` runs from its configuration is not measured. Never approve a command that runs a file in a place an agent of this run can write, `$TMPDIR` and a write agent's tree first of all, because the file that runs is the file at that moment, not the one you read. Never approve a write outside the declared rights, a deletion, a `kill`, a nested `codex`, a command that names `~/.codex` or the plugin's state directory, a watcher, a server or a daemon, or a network policy amendment; decline it with the reason in a clause. A fetch of a public URL is approved when the plan named the site as a source and the command only reads it; otherwise ask the user. A file write is never an approval: it is a rights line, so decline it and continue the agent with `RESUME:` and the right added when the user has settled it. The plan pre-authorises a class by naming it in ordinary words ("Codex Sol R1 reads the Arcadia checkout with `arc`"), and "go" covers exactly those classes. When you retell an approval, say what the entry's `outcome` says: "it ran and exited 0", or "whether it ran is not known".

The 37 requests in 00-escalations.md under that rule. The inventory's details are the server's wording clipped, so a row whose command is cut cannot be approved from the row (F5):

| Class | Count | Rule | Requests |
| --- | --- | --- | --- |
| `arc` queries whose text the row holds whole, in the user's own checkout | 6 | approve, after the checkout-not-written check; `arc`'s configuration-driven execution unmeasured | A2-2 `arc log … AGENTS.md`; R1 `arc diff -- …`; a2-console `arc status --short; arc log …` ×2; b1 `arc show --stat b7548aa`; l6 `arc show e7eb…` |
| `ps` reads | 2 | approve | j1 `ps -o lstart= -p 1`; s4 `ps -o lstart= -p $$` |
| commands the row cuts before their end | 9 | read whole first, then the same rule | a9, l2, l3, l4, l5, l7, l8 `arc show …` (cut mid-path or mid-`&&`); I1 `sed -n '29p' …; diff …`; sol-n2 `curl -fsSL … \| rg …` (cut mid-pipe) |
| file writes by read agents (`fileChange`, empty detail) | 10 | decline: rights, not approvals | t3, V1 ×2, A2d, sol-r1, s2-sol-2 ×2, s3-sol-2, b1, round07-sol2 |
| scripts the agent wrote in `$TMPDIR` | 3 | decline: a file in a place the agent writes, whatever it held when read | A2b `python3 …/run.py baseline-lock-unsandbox`; SYN `python3 …/terse/runs/…`; V1 `node …/e45-check.mjs <repo>` |
| deletions of the agent's own temp directories | 3 | decline: unsandboxed, a wrong path deletes anything the user can | a2-console, l2, l3 `rm -rf …/T/…` |
| a nested `codex sandbox` with its own `CODEX_HOME` | 2 | decline | round04-astra, round07-astra |
| a signal to a pid | 1 | decline | t3 `kill -9 44899` |
| a fetch of a public documentation URL, whole | 1 | approve where the plan named the site, else ask the user | A1 `curl --silent --show-error --max-time 30 --head https://code.claude.com/docs/en/plugins/loading` |

Eight approve, nineteen decline, nine read-whole-first, one plan-or-user. What left v2's approve set: the seven clipped `arc` rows (to read-whole-first), and the two `$TMPDIR` scripts left read-then-decide for decline; every remaining VCS approval gained the checkout-not-written condition and, for `git`, the config check.

## C13–C20, each by name

**C13, no wake-up path.** Answered. The coordinator's poll task already wakes on `<DIR>/exit` (orchestrate `SKILL.md:107`, pinned by `orchestrate.test.mjs:339-347`); one task now covers every alive Codex agent's `exit` and `pending`, so the coordinator blocks on one thing and wakes within five seconds of any of them (F6). The servicing contract is the three commands above with the re-arm step. The wrapper needs no wake: `--run` waits on `exit` alone.

**C14, the idle timer cuts the wait and reports exit 3.** Answered. The idle guard is paused while a request is open and re-armed at settlement, so silence during a wait is never cut; the deadline settles the request as a decline, and the turn continues. Where a wall clock or a signal cuts first, every open request is settled as `expired` with `why: "cut <kind>"` before `interruptTurn()`, and the report carries the entry under exit 3 (or 1 on a signal), as today's entries ride under a cut (`:253`, level 1). The server never times the wait out (P1), so nothing but the driver can settle it.

**C15, the bound is not a bound.** Answered. The request timer is armed per request from `Date.now()` and touched by nothing: not by root events, not by subagent events, not by `touchIdle`, which is a no-op while a request is open. `--idle-timeout 0` changes nothing here; `--approval-timeout 0` is exit 2.

**C16, a synchronous wait inside the dispatcher.** Answered. The dispatcher records, writes two files, pauses one timer, arms another and returns; the decision arrives on a 250 ms interval callback; timers, signals and later frames run throughout. `shutdown()` clears the interval; a `SIGKILL` of the driver loses the in-memory report as it does today, the request file on disk still says what was asked, the status lines say what was accepted, and the server, seeing its stdin close with the request pending, aborts and exits on its own (P1, level 3 for the server; level 2 that the driver's death closes that pipe).

**C17, the lock turns delay into blocked peers.** Answered for the wait: bounded per request by the deadline, for the sum over a turn's requests by the page's sentence, and the peer exits 10 as today. Open for the survivor: an accepted command in its own process group outlives the lock, which no driver code can reach (F10, measured facts and the named unknown above).

**C18, identity, atomic publication, single consumption, stale rejection.** Answered. Identity is `<seq>-<8 hex>` per run plus the run's `pid`, `startedAtMs` and `turnId` in both files; publication is `link()` over a temp file; consumption is once by construction; a decision whose `run`, `turnId` or `id` does not match an open request of this run is stale and counted; a mailbox belongs to one driver by its `O_EXCL` owner file (F7). `approvalId`, where the server sends one (it did not on 0.155.1), is copied and is not the key.

**C19, the answer-file location.** Answered. Containment under the state directory is the driver's own inode check; no root at, inside or above the state directory can be granted to any sandbox under it; the launcher is the authorised submission path, measured; the residual is a peer under another state directory, forbidden by a page sentence and shared with the lock (F1, F2).

**C20, a header ceiling is not authorisation.** Answered. No header field arms the channel, sets its deadline or pre-approves anything: `APPROVAL_DIR` and `APPROVAL_TIMEOUT` are `cli-only` and refused in a prompt file (`:652-653`), the arming is the coordinator's own `--new --approvals`, and pre-authorisation lives in the plan the user agreed to, applied per request to a command read whole. `SKILL.md:176`, "never translate a refusal into broader rights", stays.

## The other critiques, with C1's list

C6: answered as far as a rule can: the approve set is commands whose effect is the reading of named files in a tree no agent writes, VCS queries behind a config check in a checkout no agent writes, and nothing that runs a file an agent can write; what `arc` runs from its configuration is a named unknown. C7: no session grant is sent; plain-`accept` lifetime across `RESUME:` is a guess and the survivor is F10's residual. C8: the entry distinguishes decision, receipt and outcome, and late decisions are counted at `finish()` and shown by the launcher. C11: the offer predicate is the current turn. C12: `outcome` is the execution record, `receiptOk` says what it proves. C13: one poll task. C17: the wait is answered, the survivor is open. C18: the owner file. C19: the driver's containment check. C21: settlement at turn end, at cut, at finish, plus the read-before-expire and the `LATE=` line. C22: the driver's guard plus the page row that reads `approvals=` before a relaunch. C23 and C24: out of scope, unchanged. C25: the suites below. C1–C5 and C9–C10: unchanged from v2 (no network amendment is sent; the ladder's order is unchanged; `commandsRan` counts as today).

## The suites

`evals/fake-app-server.mjs` gains scenarios beside `escalated` (`:800-810`): `approval-wait` (P1's live params, no `item/started`; on `accept` emits `serverRequest/resolved`, then the command `completed`/exit 0 under the request's `itemId`, a message and `turn/completed`; on `decline` the `declined` item), `approval-wait-no-outcome` (`accept` then `turn/completed` with no item), `approval-wait-error` (a JSON-RPC error answered with `item/completed status failed exitCode null`), `approval-subagent-wait`, `approval-writestdin` (`kind: "writeStdin"`), `approval-turn-end` (completes the turn with the request open, then answers a second `turn/start`), `approval-stdin-close` (exits 0 with no `turn/completed` when stdin closes with a request open), and a `FAKE_RPC_LOG` line for the response's decision.

`evals/protocol.test.mjs` (`CASES`, and `RUNGS` at `:757-795`):
- `approval accepted by a planted decision`: exit 0, `decision === "accepted"`, `by === "coordinator"`, `resolved === true`, `outcome.exitCode === 0`, `approvalsAccepted === 1`.
- `an accepted request with no completion has outcome null`: `approval-wait-no-outcome`, `outcome === null`, `resolved === true`.
- `approval declined by the coordinator`: exit 6, `by === "coordinator"`.
- `approval expired`: `--approval-timeout 1`, exit 6, `decision === "expired"`, `why === "deadline"`, RPC log `decline`.
- `a decision present at the deadline tick is the coordinator's`: the file planted 50 ms before a 1 s deadline with the interval stubbed slow; `by === "coordinator"`.
- `the refusal is decline, never an error`: `approval-wait-error` with no channel; RPC log has a `result` with `decision: "decline"` and no `error` frame.
- `a stale decision is ignored`: another `startedAtMs`, then another `turnId`; `approvalsStale === 2`.
- `a late decision is counted at finish`: planted after `turn/completed`; `approvalsLate === 1`, one response in the RPC log.
- `a request pending at the wall-clock cut is settled before the interrupt`: `--timeout 1`, exit 3, `why: "cut wall"`, RPC order `decline` then `turn/interrupt`.
- `a request pending at a signal is settled before the interrupt`: `SIGTERM` during the wait, exit 1, `why: "signal SIGTERM"`.
- `a request open when the root turn ends is settled, and nothing is offered before the next turn id`: `approval-turn-end`, `why: "turn ended"`, a decision planted after it counted late, the second turn's request offered with the new `turnId`.
- `a request pending when the server exits without turn/completed`: `approval-stdin-close`, the collected report (exit 4, `turnStatus: failed`), the entry `expired` with `why: "run ended"`.
- `the idle guard is paused while a request is open and re-armed at settlement`: `--idle-timeout 1 --approval-timeout 3`, the turn is not cut during the wait, and a silent server after settlement is cut with `cut.kind === "idle"`.
- `a writeStdin request is not offered`: exit 6, `offered === false`, `why === "kind writeStdin"`.
- `a subagent's request is not offered`; `an accepted request blocks the transient retry`; `no channel declines at once` (`detail` equals the whole `command`); `a file-change entry names its paths`, and without the `item/started`, `detail === ""`.
- `RUNGS`: `EXIT.ESCALATED` context `escalations: [{ decision: "expired" }]`; `[{ decision: "accepted" }]` falls through to no rung (the flow at `:805`).

`evals/cli.test.mjs`: `--approval-dir` outside the state directory, relative, missing, and under `$TMPDIR` are each exit 2 naming the reason; `--approval-timeout` without `--approval-dir` and at 0 are exit 2; both flags appear in `--help` (the flow at `:883`); two drivers on one `--approval-dir`: the second exits 2 naming the owner's pid, and a dead owner's file is replaced. `evals/lock.test.mjs`, beside "refuses ~/.codex and the state directory in use" (`:590`): `--writable` naming an ancestor of the state directory is refused and names it; `--cwd` at write level naming one is refused; a `$TMPDIR` above the state directory is refused at both levels; `a write run waiting on a decision holds its lock and a peer exits 10 at once`.

`evals/agent-run.test.mjs`: `--new --approvals` makes `approvals/` at 0700, refuses a report outside the state directory, and `--new` without the flag makes none; `--run` passes `--approval-dir` iff the directory exists; `--pending` prints `REQUESTS=0`, the per-request lines with `KIND=` and the command whole between `COMMAND<<`/`COMMAND>>` including a newline inside it, `ORPHANED=` and `LATE=` after `exit`; `--decide` publishes at 0600 by link, refuses a second decision, an unlisted id, a settled request and a finished run, prints `DECIDED=` when the request was open and `LATE=` with exit 3 when the driver settled it first; `RECEIPT=` carries `approvals=a/d/e/o` from the mailbox with and without a report, `late=` when a decision was never consumed, and the nine lines stay nine. `evals/agent-contract.test.mjs:54` covers the two `cli-only` rows; `:133` and `agent-run.test.mjs:227` move to the new spawn shape.

`evals/orchestrate.test.mjs`: F6 pins the one-task poll command and the re-arm sentence; F4 pins the new `FILE=missing` row and the exit-6 row; a new case pins the rule's load-bearing sentences ("Approving it is running that command yourself", the `git config` check, "a file in a place an agent of this run can write", "read the command whole", the never list, "a file write is never an approval", the `outcome` retelling). `agent-contract.test.mjs` pins the codex page's receipt sentence and the survivor sentence.

One live gate, in `evals/fidelity.test.mjs` beside the live turn at `:575-635`, opt-in under `--require-live`, with a probe path under `/tmp` (outside `$TMPDIR` and excluded from the write sandbox, `:2370`; `/etc` at `:486` needs root and is C1's open item): a read agent, `--approval-dir` set, prompt "run `sandbox-exec -p '(version 1)(allow default)' /usr/bin/true; echo nested=$? > /tmp/entrust-live-probe-<hex>`; when the sandbox refuses, request approval and then run it"; the harness answers with `--decide --accept` when the request file appears; asserts `decision === "accepted"`, `resolved === true`, `outcome.exitCode === 0`, exit 0, `receiptOk true`, and that the file holds `nested=0`, P1's discriminator for "no Seatbelt", re-measured on the pinned version at every release; then removes the file.

## Implementation estimate

| File | Change | Lines |
| --- | --- | --- |
| `plugin/skills/codex/scripts/driver.mjs` | two `FIELDS` rows, two flags, `LIMITS` entry, containment and inverse walks in `checkRoot`, the owner file, the offer branch with kind and current-turn checks, request/decision/pending writers, the interval, idle pause, read-before-expire, settle hooks at turn end, `cutTurn` and `finish`, the late scan, `serverRequest/resolved` and the `outcome` join, the fileChange `item/started` map, report fields, rung and help text, retry guard, stderr line | 380–450 |
| `plugin/skills/codex/scripts/agent-run.mjs` | `--approvals` with the state-directory check, `--approval-dir` in `launch`, `--pending` with markers, `KIND=`, `ORPHANED=`, `LATE=`, `--decide` with the re-read, `RECEIPT=` from the mailbox, usage text | 170–200 |
| `evals/fake-app-server.mjs` | seven scenarios, decision logging | 110–140 |
| `evals/protocol.test.mjs` | nineteen cases, two `RUNGS` contexts | 180–220 |
| `evals/cli.test.mjs`, `evals/lock.test.mjs`, `evals/agent-run.test.mjs`, `evals/agent-contract.test.mjs`, `evals/orchestrate.test.mjs`, `evals/fidelity.test.mjs` | as listed | 60 + 60 + 120 + 15 + 40 + 60 |
| `plugin/skills/codex/SKILL.md` | Rights row, `escalations` bullet, exit-6 wording, `FILE=missing` bullet, the receipt and survivor sentences | 35 |
| `plugin/skills/orchestrate/SKILL.md` | the one-task poll, the three commands, the rule paragraph, the exit-10 and `FILE=missing` rows, the state-directory sentence, "armed agents run in the background" | 35 |
| `plugin/skills/codex/references/environment-and-internals.md`, `parity.md` | the mailbox and its containment, the "only those are protected" paragraph, the permission-prompt row | 25 |
| `CHANGELOG.md` | one Unreleased entry | 20 |

About 1,350–1,550 lines. Composition: one Opus write agent for the driver, the launcher, the fixture and the suites in one thread, offline to green; one Sonnet agent for the pages after the driver's `--help` text is final; one Codex Sol cross-reviewer on the driver diff; Codex Astra C1 again as refuter, given this document, its own F1–F13 and the diff; the live gate run by the coordinator. Five agents, announced before spawning.

## Alternatives rejected

**A mailbox in `$TMPDIR`.** The read level's one writable root and beside the cwd at write level (`:305-309`); the requesting agent could write its own decision.

**A header ceiling.** A newline is the field separator (`:566-575`, incidents.md, "prompt-file newline injection"); arming and bounding are command-line-only.

**`approvalsReviewer: "auto_review"`.** The server's own subagent approves, the driver never sees a request, the sandbox object is byte-identical under both settings (`:4030-4034`), and the run exits 0 over an unsandboxed command.

**Decline, then resume with wider rights.** Stays for file writes. As the only path it costs a second turn per request, widens the whole continuation, and does not fit a command that is not a right at all.

**A driver-side allowlist.** Policy in the driver, whose comment says the decision "is the caller's call" (`:2745`), and an unsandboxed run hidden from the coordinator's transcript.

**Binding the decision to the script's bytes (a hash at `--decide`, checked by the driver).** The driver cannot check anything at execution: the server runs the command, and the driver learns of it afterwards. A hash proves what the coordinator read, not what ran (F4). The rule refuses the case instead.

**Killing an accepted command's survivors by a process-table walk at teardown.** Finds the server's children only while the server is alive; after its death they are reparented and the walk finds nothing (F10). What remains is the page sentence and `pgrep` by the coordinator.

**A deadline under the idle timeout, as in v2.** Made the deadline expire at the moment a 600 s block returned (F6). Pausing the idle guard during a wait is what lets the deadline exceed it.

**Answering with a JSON-RPC error as the refusal.** The model reads it as a broken tool and the report as a failed command.

**A blocking loop in the dispatcher.** C16.

**A FIFO or socket between launcher and driver.** Bound to a process lifetime; files survive the ten-minute rerun and a `-p` session.

**Exposing `cancel`.** Stop on the card and `SIGTERM` already interrupt and write the report.

**Offering file-change requests, or `writeStdin` requests.** No path in the request, no sandboxed attempt first; input to a terminal cannot be read as a command.

**A shared nonce between `--new` and `--decide`.** Readable in `<DIR>` by any process of the user's, and a secret in tool output.

**Always-on arming from `--run`.** Every unattended run would wait fifteen minutes per request before today's decline.

## Open for the owner

1. **A request the coordinator declined still exits 6.** The rung reads evidence, and a declined request is the same evidence whoever declined it; the alternative is exit 0 with an answer the coordinator narrowed and nothing in the code saying so.
2. **File-change requests are never offered.** The remedy for a needed write is a rights line on a `RESUME:` continuation, settled with the user.
3. **The default deadline is 900 s**, one blocking `TaskOutput` plus five minutes, with the idle guard paused meanwhile. The server would wait forever without it; a longer default costs an unattended agent that long per request.
4. **`arc` queries stay in the approve set** on the same terms as `git` minus the config check, because what `arc` runs from its configuration is not measured. Pulling them until it is would leave two `ps` reads in the historical approve set.

## Found in passing, for the ledger

- `driver.mjs:2726` says the refusal shapes "are taken from the pinned `schema-<version>/*ApprovalResponse.json`"; `plugins/entrust/schema-0.153.4/` holds no such file (level 1: `ls`). `codex app-server generate-json-schema` on 0.155.1 produces the ten `*Approval*.json` files and they match the pinned tokens.
- 00-scouting.md counts "1 nested `codex sandbox` launches"; 00-escalations.md lists two (round04-astra, round07-astra), and the "5 other" is then four. Level 1.
- `commandsDeclined` and `commandsFailed` are counted from `item/completed` (`:3318`, `:3336`), and P1 saw a sandboxed attempt emit neither `item/started` nor `item/completed` (once). A report can show `escalations: 1` with `commandsDeclined: 0`. Level 3 for the gap, level 2 for the consequence.
- The codex page promises that `SIGTERM` to the driver "sweeps its codex and publishes the report … nothing left running" (codex `SKILL.md`, One call), and `killGroup` signals the app-server's group alone (`:2400-2403`), while P1 observed each command the server runs in a process group of its own (01-probe.md:18, level 3). Whether the server ends those children on its own exit is not measured; until it is, "nothing left running" is a guess for any command still executing at the signal. Level 2 for the consequence.
- `checkRoot` refuses roots inside the state directory and `~/.codex` and at or above the home, and passes a root between the home and either of them (`:900-936`); environment-and-internals.md:72-74 names `~/.claude` a legitimate root. `--writable ~/.claude` therefore grants write access to the plugin's data directory, locks and answer log included, today, without the channel. Level 1 for the walk's direction, level 2 for the consequence; a `lock.test.mjs` case beside `:590` would make it level 3.
