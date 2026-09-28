# Design v2: the approval channel

Run `2026-09-27-approval-channel`, Fable D1, against the tree at b3872b4 (`plugins/entrust/plugin/skills/codex/scripts/driver.mjs`, 4198 lines, version 0.20.0, pinned codex 0.153.4; the installed binary is 0.155.1). v2 folds in Opus P1's probe ([01-probe.md](01-probe.md), five paid turns on 0.155.1, level 3 throughout unless a line says otherwise). Evidence levels as the repository defines them: 1 the line resolves, 2 an independent reader would say the same, 3 made to happen; a lifecycle claim not made to happen is a guess and says so. Line numbers are the driver's unless a file is named. [02-design-v1.md](02-design-v1.md) stays as written.

## Changes from v1

1. The two-branch `accept` section is gone. `accept` re-runs the command with no Seatbelt at all (P1 Q2: nested `sandbox-exec` exit 71 inside, 0 after accept). The decision rule now says that approving a request is running that command yourself, with the user's rights and, by hypothesis, the user's network.
2. The server waits for a decision with no bound of its own (180 s tested, longer unknown); the driver's deadline is the only bound and the text says so.
3. The refusal shape stays `decline`, with the reason: a JSON-RPC error is honoured as a rejection but reaches the model as an exec failure and the report as a failed command; `availableDecisions` never lists `decline` and is not in the schema, both recorded.
4. Teardown order is stated against the stdin-close result: every open request is settled in `cutTurn` before `turn/interrupt` and in `finish()` before anything else, so `shutdown()`'s `stdin.end()` never meets a pending request; what a pending request does when the driver dies first is a paragraph.
5. File-change requests stay never offered; the request names no path and there is no sandboxed attempt first, so per-file approval would join two messages by `itemId`. The entry's `detail` for such a request is defined.
6. Every field of an entry comes from the request's params, never from `item/*` notifications, which the sandboxed attempt can omit entirely (P1, seen once). `commandsDeclined` is named as a count that can undercount.
7. `acceptWithExecpolicyAmendment` keeps its rejection and gains the measured reason: the proposed prefix (`["sleep","25"]` for `sleep 25; touch …`) would let every command opening with those tokens through, including the one under review.
8. The trust boundary has its own paragraph: the sandbox cannot write the mailbox; any process that can is the user's, the boundary a Claude subagent's Bash already has; the launcher checks nothing more, and why.
9. The entry gains `resolved` from `serverRequest/resolved`, `availableDecisions` where the server sends it, and the record keeps `waitingOnApproval` as the thread status the coordinator can read in `err.txt`.
10. The 37 requests are classified again: one moves (I1) from approve to read-then-decide, because its detail is clipped and the rule is now "read it whole because you are running it".
11. The owner's two choices and the 600 s default sit in "Open for the owner" at the end.

## In one paragraph

The coordinator arms a channel per agent at `--new` with one flag; the launcher then hands the driver a mailbox directory inside the agent's own `<DIR>`, which no Codex sandbox can write because the driver refuses everything under the state directory as a writable root. When the server asks to run a command the sandbox denied, the driver writes a request file and a `pending` marker there, answers nothing, arms a request timer of its own, and lets the turn wait; the server itself waits without bound. The coordinator's existing poll task wakes on the marker as it wakes on the exit marker, reads the request through a launcher subcommand, decides under a rule the plan pre-authorised, and writes the decision with a second launcher subcommand, atomically and once. The driver validates the decision against this run and this request, sends `accept` or `decline`, and records the request, the decision, who made it and when in the report's `escalations` array. An accepted command runs with no sandbox and the user's rights. An unanswered request expires as a decline. Exit 6 is "a request was declined or expired", never "a request was accepted". File-change requests, the legacy pair and permission-profile requests are declined at once as today; the channel carries command approvals and two decisions.

## Names

- **channel**: the whole mechanism. **mailbox**: `<DIR>/approvals/`, the directory the driver writes requests into and reads decisions from. **request**: one `item/commandExecution/requestApproval` the driver offered. **decision**: the coordinator's `accept` or `decline` for one request. **offered**: a request the driver wrote to the mailbox and held open; a request declined at once is recorded and not offered. **expired**: an offered request the deadline or a cut settled as `decline`.

## What `accept` grants

The command re-runs with no Seatbelt at all. P1 Q2, level 3: under the `entrust_read` profile a nested `sandbox-exec -p "(version 1)(allow default)" /usr/bin/true` exits 71 (`sandbox_apply: Operation not permitted`); after `accept` the same line printed `nested=0` and the `/tmp` sentinel appeared. Neither the process list nor the item notifications carry a sandbox field, so the driver cannot observe the change; the entry's `decision: "accepted"` is the one record that a command ran outside the sandbox the report's `sandbox` field still describes (C12). The network: a hypothesis by P1, drawn from "no Seatbelt at all", since the profile had egress on; the design treats an accepted command as having the user's network. The request follows a sandboxed attempt that failed (P1 Q1: `touch: Operation not permitted`, then `exec_command` with `sandbox_permissions "require_escalated"`), so the model is asking for the escalation by name. Codex also appends `[projects."<cwd>"] trust_level = "trusted"` to the config of the home it runs in; the driver's private home takes that today (`:1063-1065`), and the channel changes nothing there.

## The mechanism, end to end

### Arming

`agent-run.mjs --new --approvals --report-file <REPORT>` makes `<DIR>/approvals/` at 0700 beside `prompt.txt`, inside the `<DIR>` it already makes at 0700 (`agent-run.mjs:193-207`, level 1). `--run` (`agent-run.mjs:121-157`) spawns the driver with `--approval-dir <DIR>/approvals` when that directory exists and with today's two flags when it does not. Nothing else in the wrapper's command or message changes; `codex-agent.md` is unchanged. A run without the mailbox declines every request at once, as today (`:2714-2769`, level 1), so a coordinator who did not arm the channel gets 0.20.0 behaviour, and the report's entries say `offered: false` so it can see what it could have answered.

The flag is the coordinator's own command line, never the prompt: `APPROVAL_DIR` and `APPROVAL_TIMEOUT` join `FIELDS` as `cli-only` rows (`:180-200`), which `argvFromPromptFile` refuses in a prompt file naming the flag to use (`:652-653`, level 1), and `agent-contract.test.mjs:54` already checks that every `cli-only` name is refused. The arming is per agent, chosen when the plan is written, which is what "the plan covers it" means here. Given up: a coordinator that forgets `--approvals` cannot arm the channel mid-turn; the agent declines as today and the coordinator resumes it if the work needs the command.

### What the driver checks before the turn

`--approval-dir D` must be absolute, exist, and lie outside every root the sandbox may write: `cwd` at write level, each `--writable`, `$TMPDIR` at either level, and a `--worktree` tree. Each of those already passes `checkRoot` (`:2290`, `:2333`, `:2313`, `:1807-1826`), which refuses anything inside `stateDir()` by inode walk (`:888-940`, `protectedRoots` at `:921-924`, level 1). The new check is the inverse walk, D's ancestors against each writable root's inode, exit 2 before the turn on a hit. The launcher always puts D under the state directory; the check makes the driver refuse a hand-typed D that is not. `--approval-timeout S` without `--approval-dir` is exit 2 (a bound for a channel that is not there); `S` of 0 is exit 2 (the server has no bound of its own, so a channel with no deadline is a hang); `S` at or above `--idle-timeout` when that is non-zero is exit 2: the idle cut would answer the request as exit 3 (C14), and the repository refuses silent substitution.

### When a request arrives

`handleServerRequest` (`:2714`) gains one branch before `REFUSALS`. A request is **offered** when all of these hold: `msg.method === "item/commandExecution/requestApproval"`; `opts.approvalDir` is set; `msg.params.threadId === rootThreadId` and `ownedTurns.has(msg.params.turnId)` (the strict attribution success evidence already uses, `:2673-2675`, C11); `settled` and `pendingCut` are both false (`:2384`, `:2650`, C21). Every other request takes today's path unchanged: declined at once with the schema's refusal and recorded, with `offered: false` and a `why` (`subagent thread`, `no channel`, `file changes are rights`, `legacy method`, `permission profile`, `turn closing`).

For an offered request the driver:

1. Builds the record from the request's params alone and writes it whole: `<DIR>/approvals/<id>.request.json`, written to `<id>.request.json.<hex>.tmp` and renamed over (the driver is the only writer of request files, so rename is the right primitive here; the report keeps `link` because two runs can name one path, `:991-1010`). `id` is `<seq>-<8 hex>`, `seq` per run from 1.
2. Rewrites `<DIR>/approvals/pending`, one open id per line, by the same rename. When the last open request settles the file is unlinked, so `[ -s pending ]` is the coordinator's test.
3. Holds `{ rpcId: msg.id, record, timer }` in a `Map` keyed by `id`. Nothing blocks: the dispatcher returns (C16).
4. Arms the request timer, `setTimeout(expire, deadlineMs).unref?.()`, independent of `idleTimer` and of any event on any thread (C15).
5. Prints one stderr line, which lands in `<DIR>/err.txt`: `entrust: approval request <id> (<method>) waits for a decision in <D> until <deadlineAt>; the thread reports waitingOnApproval`.
6. Starts, if not running, a 250 ms `setInterval` that looks for `<id>.decision.json` for every open id and stops when none is open. A poll rather than `fs.watch`: bounded, portable, and the loop is already alive on the child's pipes.

The idle timer was touched when the request arrived (`:2868`, level 1) and is not touched again while the request waits: a waiting request is silence, and the deadline is what bounds it. The server bounds nothing: P1 held a request 180 s and saw no line, no cancel, no repeat, the status `["waitingOnApproval"]` throughout, and a late `accept` still ran the command (Q3 hold, level 3; longer than 180 s is unknown). So the deadline is the only bound the wait has.

Request record, the JSON shape (every field a copy of the server's params, `schema-0.153.4/ServerRequest.json:353-465`, level 1, plus the run's identity; P1's live params carried `kind`, `environmentId`, `reason`, `command`, `cwd`, `commandActions`, `proposedExecpolicyAmendment` and `availableDecisions`, and omitted `approvalId`, `networkApprovalContext` and `proposedNetworkPolicyAmendments`, level 3):

    { "id": "1-9f3a2c1e",
      "run": { "pid": 4242, "identity": "<selfIdentity()>", "startedAtMs": 1790000000000, "threadId": "thr_…", "turnId": "turn_…" },
      "rpcId": 9002,
      "method": "item/commandExecution/requestApproval",
      "itemId": "item_a", "approvalId": null, "kind": "command", "environmentId": "local",
      "command": "/bin/zsh -lc 'vcs show 719d…:src/…'", "commandActions": ["vcs show 719d…:src/…"], "cwd": "/Users/…/monorepo/…",
      "reason": "<the model's justification, or null>", "networkApprovalContext": null,
      "proposedExecpolicyAmendment": null, "proposedNetworkPolicyAmendments": null,
      "availableDecisions": ["accept", {"acceptWithExecpolicyAmendment": {"execpolicy_amendment": ["…"]}}, "cancel"],
      "level": "read", "sandbox": { …effectiveSandbox… },
      "askedAt": "2026-09-27T12:40:00.000Z", "deadlineAt": "2026-09-27T12:50:00.000Z" }

`command` is clipped at 4000 characters and `commandActions` at 20 entries. The two proposed amendments and `availableDecisions` are recorded for the reader and gate nothing. Nothing in the record comes from `item/started` or `item/completed`: P1 saw one sandboxed attempt run (the rollout shows the EPERM) and emit neither notification, so a record built from items would sometimes be empty.

### The deadline

`LIMITS.DEFAULT_APPROVAL_TIMEOUT_S: 600`, in the table at `:60-130` with its reason. Ten minutes because that is how long the coordinator can be blind to a marker: it waits on one `TaskOutput(…, block: true, timeout: 600000)` at a time (orchestrate `SKILL.md:107`), and a request raised while it blocks on another agent's task is seen when that block returns. It sits under the 900 s idle default (`:72`) with margin, and the usage check above keeps the order whatever the caller sets. The server would wait forever (P1 Q3 hold), so this number is the whole of the bound. What it costs: an armed agent whose coordinator never answers waits ten minutes per request before the same decline it would have got at once.

### Expiry, cuts, signals, and the driver dying first

`expire(id)`: if the request is still open, send `{ decision: "decline" }` on its `rpcId`, settle the record with `decision: "expired", by: "driver", why: "deadline"`, rewrite `pending`, clear the timer. The turn goes on: the server answers a decline in a millisecond and the model continues (P1 Q3 error: `serverRequest/resolved` +1 ms and `turn/completed` 2.9 s later for the error shape; the 27 production runs for `decline`, coordinator's note, level 3).

Order matters because closing stdin with a request pending aborts the turn: the server logs `TurnAborted`, sends no `turn/completed`, and exits 0 within 43 ms (P1 Q3 stdin close, level 3). The driver closes stdin only in `shutdown()` (`:2531`), which runs from `exitWith` after the report is written (`:2562-2600`), so the report never depends on a `turn/completed` that the abort would withhold. Still, every path that ends the run settles open requests **first**:

- `cutTurn` (`:3276`), before `interruptTurn()`: each open request gets `decline` and `expired` with `why: "cut idle" | "cut wall" | "cut commands" | "signal SIGTERM"`, then the interrupt goes out. The server processes stdin in order, so the decline lands before the interrupt (level 2; the protocol case `approval-during-cut` reads the RPC log for the order and makes it level 3 against the fixture).
- `finish()` (`:3544`), before `classifyEvidence()`: the catch-all for `abort()` with a thread (`:2594-2615`), for a turn that completed with a request somehow open, and for the signal path's second-signal shortcut (`:4174`). Whatever reached `finish()` finds no request open afterwards.
- `shutdown()` clears the interval and every timer; by then nothing is open, so its `stdin.end()` closes a quiet channel. Where the interrupt's grace expired without a `turn/completed`, the stdin close makes the server exit at once (P1), which shortens `quiesceGroup()` rather than lengthening it.

If the driver dies first, `SIGKILL` or a crash before `finish()`: no report, as today (environment-and-internals.md:150). The launcher writes `<DIR>/exit` from the driver's exit status (`agent-run.mjs:152-156`), the request file stays on disk without a `settled` object, and `pending` still lists it: the coordinator's poll wakes on `exit`, and `--pending` on a directory whose `exit` exists prints those ids as `ORPHANED=<id>` and `--decide` refuses them. The server's stdin pipe closes with the driver, and a pending request makes the server abort the turn and exit 0 on its own (level 2, from the stdin-close measurement), so the stranded-descendant failure documented for `SIGKILL` is, for a turn waiting on a request, shorter than today's. A decision file that lands after settlement is read once, ignored, and counted as `approvalsLate` (C21).

### How a decision travels back

`agent-run.mjs --decide <id> --accept | --decline [--why TEXT] --report-file <REPORT>`:

1. Reads `<DIR>/approvals/<id>.request.json`; refuses with exit 2 and a `REFUSED=` line when the file is missing, when `<id>` is not in `pending`, or when `<DIR>/exit` exists (the run is over, the request orphaned).
2. Writes `<id>.decision.json.<hex>.tmp` at 0600, then `link()`s it to `<id>.decision.json` and removes the temp: the same no-clobber publication the report uses (`:991-1010`, level 1). `EEXIST` is "already decided" and prints the existing decision; a second decision for one id is therefore impossible, whoever writes it (C18, single consumption).
3. Prints `DECIDED=<id> <accept|decline>`.

Decision record:

    { "id": "1-9f3a2c1e", "run": { "pid": 4242, "startedAtMs": 1790000000000 },
      "decision": "accept", "by": "coordinator", "why": "plan: VCS reads in the monorepo checkout", "decidedAt": "…" }

`id` and `run` are copied from the request file by the launcher, never typed. The driver accepts a decision file only when `id` is an open request of this run and `run.pid === process.pid && run.startedAtMs === startedAtMs`; anything else is left in place, counted as `approvalsStale`, and the request keeps waiting (C18, stale rejection). The driver then sends `{ decision: "accept" }` or `{ decision: "decline" }` on the request's `rpcId`, settles the record (`decision: "accepted" | "declined", by: "coordinator", why, settledAt, waitMs`), rewrites the request file with a `settled` object, and rewrites `pending`. `serverRequest/resolved` for that id, which the server sends within a few milliseconds of the answer (P1, +1 to +3 ms, level 3) and the driver ignores today, sets `resolved: true` on the entry; an accepted request whose `resolved` stays false is a fact the report shows.

`agent-run.mjs --pending --report-file <REPORT>` prints each open request in six lines, `REQUEST=<id>`, `METHOD=`, `COMMAND=` (the bare command from `commandActions` where the server parsed one, else the wrapper text, clipped at 600), `CWD=`, `REASON=` (the model's justification, clipped at 300), `DEADLINE=`, and `REQUESTS=<n>` last; zero requests prints `REQUESTS=0` alone; after `exit`, `ORPHANED=<id>` per open id. The coordinator never opens the JSON.

### What the driver answers, per decision

| Decision (0.153.4 pin `:265-343`; 0.155.1 identical) | Command request | File-change request | Exposed | Why |
| --- | --- | --- | --- | --- |
| `accept` | `--decide --accept` | no | yes, commands only | the one grant the plan can cover for one command, and it is the user running that command unsandboxed; a file write outside the roots is a rights question, and `RIGHTS:`/`WRITABLE:` on a `RESUME:` continuation is the existing path for it (parity.md:20, "rights are declared again per call") |
| `acceptForSession` | no | no | no | it hides every later matching request from the record: the session cache stops prompting, so the report could not list what ran under it (C7, C8) |
| `acceptWithExecpolicyAmendment` | no | — | no | a rule "so future matching commands run without prompting"; where it persists is not established (A5 Q4), the page forbids allow-rules on the user's behalf (codex `SKILL.md`, Composition rule 5), and the proposed prefix is far wider than the command: for `sleep 25; touch /tmp/…` the server proposed `["sleep","25"]` (P1 Q1, level 3), which admits every future command opening with those two tokens, the `touch` under review included |
| `applyNetworkPolicyAmendment` | no | — | no | persistent, host-scoped, store unknown (A5 Q4); network policy stays the `NETWORK:` line's |
| `decline` | `--decide --decline`, expiry, cut, not offered | at once, as today | yes | the turn continues; honoured in 27 production runs (coordinator's note, level 3) |
| `cancel` | no | no | no | a decline plus an interrupt; the coordinator's interrupt is Stop on the card or `SIGTERM` to the pid, which already writes the report (codex `SKILL.md`, Reading the result, last bullet) |

The refusal shape stays `{ decision: "decline" }` and never the JSON-RPC error. The error is honoured (P1 Q3 error: the command does not run, the turn completes), but the model sees `exec_command failed: CreateProcess { message: "Rejected(\"approval request failed\")" }` and the item completes `status: "failed", exitCode: null`, which the driver's classifier counts among `commandsFailed` (`:3318`, `:3336`), laundering a refusal into a failure and telling the model the tool broke rather than that it was told no. Two facts are recorded and gate nothing: `availableDecisions` lists `accept`, the execpolicy amendment and `cancel` and never `decline` (P1 Q1 flag), and the field is absent from the generated 0.155.1 schema (P1, level 1). `item/permissions/requestApproval` answers with a granted profile, not a decision; it stays refused as today (`:2733`). The legacy `applyPatchApproval` / `execCommandApproval` pair stays `abort` (`:2731-2732`); none of the 37 requests on this machine took that form (00-escalations, level 1).

### File-change requests

Never offered, kept. The request carries `reason: null` and `grantRoot: null` and names no path; the path is only in the `item/started` two milliseconds before it, and there is no sandboxed attempt first (P1 Q4, level 3). Per-file approval would therefore have to join two messages by `itemId` and approve a write the sandbox never even refused, and its `accept` writes the file with no sandbox (the probe's `/tmp` file appeared, and which process applies the patch is not established). Every one of the ten on this machine was a read agent trying to write. The entry's `detail`, empty today for all ten (`:2755` reads `command ?? reason ?? message`, and a file-change request carries none), becomes the joined change list, `add /tmp/x.txt; update src/a.ts`, when an `item/started` fileChange with that `itemId` was seen, kept in a small map keyed by item id and dropped at `item/completed`; when none was seen, `detail` is `""` as today and the entry says `fileChanges: null`. Level 3 that the join is available once; a guess that it always is, so the empty case stays defined.

## The coordinator's side (orchestrate page)

The armed agent runs as a **background** Agent call: a foreground wrapper blocks the coordinator's turn until the run ends, so every request would expire (level 2, from the foreground call's shape at codex `SKILL.md`, One call). The poll task becomes:

    until [ -s "<DIR>/exit" ] || [ -s "<DIR>/approvals/pending" ]; do sleep 5; done; if [ -s "<DIR>/exit" ]; then echo DONE=<id>; else echo ASK=<id>; fi

launched as a background Bash task with `TaskOutput(<poll_task_id>, block: true, timeout: 600000)` on it, as today (`SKILL.md:107`). On `ASK=<id>`:

1. `node "${CLAUDE_SKILL_DIR}/scripts/agent-run.mjs" --pending --report-file "<REPORT>"` and read the lines.
2. Decide under the rule below. `node "${CLAUDE_SKILL_DIR}/scripts/agent-run.mjs" --decide <request-id> --accept --why "<the plan line that covers it>" --report-file "<REPORT>"`, or `--decline --why "<the rule that refuses it>"`.
3. Re-arm: launch the same poll command again as a new background task and `TaskOutput` on it.

Reading under the data directory is what the coordinator does already (`<REPORT>` lives there, orchestrate `SKILL.md:29`); writing is the launcher's, a subprocess handed the path, which the page's measured rule permits (`SKILL.md:29`, measured 2026-09-08, level 3 for `--new`, level 2 for `--decide`: same route, not yet made to happen). The rule "never run `mkdir`, Write or a redirect under that directory yourself" stays true and gains "and never write a decision file by hand: `--decide` is the one path".

A headless `-p` session runs the same three commands; it has no user to ask, so a request the rule sends to the user is declined with `--why "needs the user"` and the answer names it. The wrapper's ten-minute rerun is unaffected: `--run` waits on `<DIR>/exit` (`agent-run.mjs:223-266`, level 1) and a pending request does not end its call; the second call finds the driver's pid and waits as today. `RESUME:`: a continuation gets a fresh report path and a fresh `agent/` (codex `SKILL.md`, One call), so the channel is armed again at its `--new` or not at all; no grant carries across because `acceptForSession` is never sent. Whether the server's own approval cache remembers a plain `accept` across a resume stays a guess.

The wrapper's nine status lines stay nine (`agent-run.mjs:57`). `RECEIPT=` gains a fourth token only when the report's array is non-empty: `RECEIPT=turnStatus=completed receiptOk=true model=Sol approvals=1/0/0`, accepted/declined/expired. The user hears the sentence the coordinator writes, in their language: "Codex Sol R1 asked to run `vcs show` outside the sandbox; I ran it for it under the plan's monorepo line."

## The lock (C17)

A write agent waiting on a decision holds its directory lock (`acquireLock` at `:2329`, released in `shutdown()` after the group is waited out, `:2525-2546`, level 1). What bounds the hold is the request deadline, 600 s by default and always below the idle timeout, so the longest a peer waits behind a request is one deadline plus the turn's own work. The page adds one sentence to the exit-10 row: "a holder that waits on your decision has an `ASK=` in your poll loop; answer it before you wait on the holder." The scenario C17 describes, writer B exits 10 while A waits on the coordinator, ends when the coordinator answers A or A's request expires; the page already forbids two Codex write agents on one directory (orchestrate `SKILL.md`, Composition and bounds table).

## The trust boundary (C19)

The mailbox is under `<DIR>`, which is under the run directory, which is under the state directory (`<state>/orchestrate/…` or `<state>/reports/…`, codex `SKILL.md`, One call). `checkRoot` refuses any writable root inside `stateDir()` by inode identity, walking the candidate's ancestors (`:888-940`), and every root the sandbox can write passes it: `--cwd` at write level (`:2290`), `--writable` (`:2333`), `$TMPDIR` at both levels (`:2313`), the worktree's repository and destination (`:1807-1826`). Level 1 for each refusal; level 2 for the consequence that no Codex sandbox at read, worktree or write level can write a decision file. The new inverse check at start-up makes the same guarantee hold for a hand-typed `--approval-dir`. The coordinator's own Write, `mkdir` and redirects there are refused in a headless session and the launcher handed the path writes unopposed (orchestrate `SKILL.md:29`, measured 2026-09-08, level 3). So the authorised submission path is the same one `--new` already uses, and the requester cannot manufacture its approval.

What the boundary is, said whole. The sandbox cannot write the mailbox. Any process that can is running as the user outside every sandbox: the coordinator's launcher, a Claude subagent's Bash, any program of the user's. That process already holds everything an accepted command would gain, since an accepted command runs as that same user with no Seatbelt; writing a decision file gives it nothing it could not do by running the command itself. It is the boundary the harness gives a Claude subagent's Bash today, and the channel neither widens nor narrows it. The launcher therefore checks nothing beyond what is stated: request open, run alive, `exit` absent, publication by `link()` at 0600. A shared nonce printed by `--new` and demanded by `--decide` was considered and rejected: it stops only a process that lacks the nonce, which no process of the user's is prevented from reading out of `<DIR>` at 0700, and it puts a secret into the coordinator's tool output, one paste away from a brief. What stays a rule and not a wall: the coordinator decides, and no brief carries the `--decide` command.

## The report and the exit ladder

`escalations` keeps its name and becomes one entry per approval request, whatever happened to it. Renaming was considered and rejected: every reader, six suite cases (`protocol.test.mjs:66-82, 147-158, 249-251, 770`), the pages and three changelog corrections know the name, and a rename is a second meaning change with no gain. Each entry, every field from the request's params or the driver's own clock, none from an item notification:

    { "id": "1-9f3a2c1e" | null, "method": "…", "detail": "<200 chars: command, else reason, else message; a joined change list for a file change>",
      "thread": "thr_…", "subagent": false,
      "offered": true, "decision": "accepted" | "declined" | "expired", "by": "coordinator" | "driver", "why": "…",
      "askedAt": "…", "settledAt": "…", "waitMs": 1234, "resolved": true,
      "cwd": "…", "reason": "…", "fileChanges": null }

A request declined at once has `id: null, offered: false, by: "driver", waitMs: 0`. Beside the array: `approvalsAccepted`, `approvalsStale`, `approvalsLate` counts, and `approvalDir` (the mailbox or null). `commandsDeclined` stays what it is, a count of items the server completed as `declined` (`:3336`): P1 saw a sandboxed attempt emit no item at all, so that count can undercount, and `escalations` is the record of requests.

The rung (`:253-254`) becomes `when: (c) => c.escalations.some((e) => e.decision !== "accepted")`, help text "an approval request was declined or expired unanswered; inspect the report, if delivered, before judging task completeness". An entry with no `decision` (an older fixture) still hits it. So: an accepted request is not exit 6; an expired one is; a request the coordinator declined is exit 6 too (Open for the owner, below). `announceDeclinedApproval` (`:2553`) counts non-accepted entries. An accepted command completes as a root item with its exit code and counts as any root command does (`:2805-2815`, `:3310-3340`).

The transient retry guard (`:2955-2965`) adds `&& !escalations.some((e) => e.decision === "accepted")`: an approved command ran unsandboxed with the user's rights before the failure, and a replay would repeat it (C22).

Unaffected: the receipt (the rollout's `session_meta`, `:3580`), `receiptOk`, and the root-thread-only rule: a subagent's request is never offered, and an accepted root command is root evidence exactly as an unapproved one is. The thread start is unchanged: `approvalPolicy: "on-request"`, `approvalsReviewer: "user"`, both asserted (`:4035-4059`); the driver is the user's client, and answering a request is what a client at `"user"` does.

## The decision rule, as page sentences

For the orchestrate page, after the poll loop:

> An agent asks to run a command the sandbox stopped. Approving it is running that command yourself: it re-runs with no sandbox, with your user's rights and your user's network, so read every word of it first, and a command that runs a script is the script, so open the script whole. Approve it when the plan named the tree it reads and the command is a read of it: a `git`, `vcs`, `hg` or `svn` query (`status`, `log`, `show`, `diff`, `blame`, `grep`), a `ps`, a `sed -n`, `cat`, `grep`, `diff` over paths inside that tree. Never approve a write outside the declared rights, a deletion, a `kill`, a nested `codex`, a command that names `~/.codex` or the plugin's state directory, a network policy amendment, or a command you cannot read whole; decline it with the reason in a clause. A fetch of a public URL is approved when the plan named the site as a source and the command only reads it; otherwise ask the user. A file write is never an approval: it is a rights line, so decline it and continue the agent with `RESUME:` and the right added when the user has settled it. The plan pre-authorises a class by naming it in ordinary words ("Codex Sol R1 reads the monorepo checkout with `vcs`"), and "go" covers exactly those classes.

The 37 requests in 00-escalations.md under that rule, the details there being the server's wording clipped:

| Class | Count | Rule | Requests |
| --- | --- | --- | --- |
| `vcs` reads in the monorepo checkout the plan named | 13 | approve: `vcs status`, `vcs log`, `vcs diff`, `vcs show <sha>:<path>` read by shape whatever the clip cut | A2-2 `vcs log`; R1 `vcs diff`; a2 `vcs status; vcs log` ×2; a9, b1, l2, l3, l4, l5, l6, l7, l8 `vcs show` |
| `ps` reads | 2 | approve | j1 `ps -o lstart= -p 1`; s4 `ps -o lstart= -p $$` |
| file writes by read agents (`fileChange`, empty detail) | 10 | decline: rights, not approvals | t3, V1 ×2, A2d, sol-r1, s2-sol-2 ×2, s3-sol-2, b1, round07-sol2 |
| deletions of the agent's own temp directories | 3 | decline: unsandboxed, a wrong path deletes anything the user can; a deletion buys the deliverable nothing, and the driver prunes its temp roots | a2, l2, l3 `rm -rf …/T/…` |
| a nested `codex sandbox` with its own `CODEX_HOME` | 2 | decline: a Codex of its own, unsandboxed, outside the driver's bounds | round04-astra, round07-astra |
| a signal to a pid | 1 | decline | t3 `kill -9 44899` |
| a script the agent wrote, named "unsandbox" | 1 | decline: an escape probe by design | A2b `python3 …/run.py baseline-lock-unsandbox` |
| a command clipped before its end, or a script the agent wrote | 3 | read the whole command or script first; approve if it reads, else decline | I1 `sed -n '29p' …/writing-rules.md; diff …` (moved from approve in v1: its tail is cut); SYN `python3 …/terse/runs/…`; V1 `node …/e45-check.mjs <repo>` |
| fetches of a public documentation URL after a certificate failure inside the sandbox | 2 | approve where the plan named the site, else ask the user; unsandboxed, `curl` sees the user's keychain, which is the likely reason the request was raised (hypothesis) | A1 `curl --head https://code.claude.com/…`; sol-n2 `curl -fsSL https://code.claude.com/… \| rg` |

Fifteen approved, seventeen declined, three read-then-decide, two plan-or-user.

## C13–C20, each by name

**C13, no wake-up path.** Answered. The coordinator's poll task already wakes on `<DIR>/exit` (orchestrate `SKILL.md:107`, pinned by `orchestrate.test.mjs:339-347`); the loop gains a second `-s` on `<DIR>/approvals/pending` and echoes `ASK=` or `DONE=`. The servicing contract is the three commands above, on the page, with the re-arm step. The wrapper needs no wake: `--run` waits on `exit` alone.

**C14, the idle timer cuts the wait and reports exit 3.** Answered. The request deadline is below the idle timeout by construction (usage error otherwise), so an unanswered request expires as a decline before silence is cut, the turn continues, and the idle guard rearms on the thread's next event. Where a cut comes first anyway (a wall clock, a signal), every open request is settled as `expired` with `why: "cut <kind>"` before `interruptTurn()`, and the report carries the entry under exit 3 (or 1 on a signal), as today's entries ride under a cut (`:253`, help text, level 1). The server itself never times the wait out (P1), so nothing but the driver can settle it.

**C15, the bound is not a bound.** Answered. The request timer is armed per request from `Date.now()` and touched by nothing: not by root events, not by subagent events, not by `touchIdle`. `--idle-timeout 0` leaves it in force; `--approval-timeout 0` is exit 2.

**C16, a synchronous wait inside the dispatcher.** Answered. The dispatcher records, writes two files, arms a timer and returns; the decision arrives on a 250 ms interval callback; timers, signals and later frames run throughout. `shutdown()` clears the interval; a `SIGKILL` of the driver loses the in-memory report as it does today, the request file on disk still says what was asked, and the server, seeing its stdin close with the request pending, aborts and exits on its own (P1, level 3 for the server; level 2 that the driver's death closes that pipe).

**C17, the lock turns delay into blocked peers.** Answered above: the hold is bounded by the deadline, the peer exits 10 as today, and the page tells the coordinator to answer the holder's `ASK=` first.

**C18, identity, atomic publication, single consumption, stale rejection.** Answered. Identity is `<seq>-<8 hex>` per run plus the run's `pid` and `startedAtMs` in both files; publication is `link()` over a temp file, refusing every existing entry; consumption is once by construction (a second decision for one id cannot be created) and the driver ignores a decision whose `run` or `id` does not match an open request of this run, counting it as stale. Each agent has its own `<DIR>` (one per report path, codex `SKILL.md`, One call), so two agents never share a mailbox name; a late answer after `--resume` addresses a run that no longer exists and is stale by `startedAtMs`. `approvalId`, where the server sends one (it did not on 0.155.1, P1), is copied into the record and is not the key: the driver's own id is.

**C19, the answer-file location.** Answered above: the mailbox is under the state directory, which no sandbox root can include (`:888-940`), the launcher is the authorised submission path (`SKILL.md:29`, measured), the driver refuses a mailbox inside any of its own writable roots before the turn, and the boundary a process must cross to write there is the user's own, which an accepted command crosses anyway.

**C20, a header ceiling is not authorisation.** Answered. No header field arms the channel, sets its deadline or pre-approves anything: `APPROVAL_DIR` and `APPROVAL_TIMEOUT` are `cli-only` and refused in a prompt file (`:652-653`), the arming is the coordinator's own `--new --approvals`, and pre-authorisation lives in the plan the user agreed to, which the coordinator applies per request. A copied value with a newline cannot reach any of it. `SKILL.md:176`, "never translate a refusal into broader rights", stays: an approval is a decision on one command under the plan, and the rights lines are unchanged.

## The other critiques

C1–C4, C5–C7 (network grants, host scoping, grant lifetime): not touched; the channel sends no network amendment and no session or rule grant, `networkApprovalContext` is recorded only, and an accepted command's network is the user's by the "no Seatbelt" fact, which the rule says out loud. C8: answered by the one array with `decision`, `by` and timestamps. C9: the ladder's order is unchanged; a cut settles requests as expired and still wins. C10: `commandsRan` counts as today; an accepted command that ran counts as a root command; `commandsDeclined` is named as an undercount. C11: offers use the strict root attribution; refusals stay inclusive. C12: the entry carries id, decision, deadline, wait and `resolved`; `sandbox` stays what the server applied, and `decision: "accepted"` is the record of a command run with none. C21: settled/pendingCut guard on offer, late decisions counted. C22: the retry guard reads accepted requests. C23 and C24: not touched, out of scope (loss of work; web search). C25: the suites below.

## The suites

`evals/fake-app-server.mjs` gains scenarios beside `escalated` (`:800-810`): `approval-wait` (raises the request with P1's live params, `reason`, `commandActions`, `proposedExecpolicyAmendment` and `availableDecisions` included, and no `item/started`; emits the command as `completed`/exit 0 on `accept`, as `declined` on `decline`, then `serverRequest/resolved`, a message and `turn/completed`), `approval-wait-error` (answers a JSON-RPC error with `item/completed status failed exitCode null`, P1's shape, so a case can show the driver never sends one), `approval-subagent-wait` (the same request under `OTHER_THREAD`), `approval-stdin-close` (exits 0 with no `turn/completed` when stdin closes with a request open, P1's shape), and a `FAKE_RPC_LOG` line for the response's decision.

`evals/protocol.test.mjs` (`CASES`, and the `RUNGS` table at `:757-795`):
- `approval accepted by a planted decision`: `--approval-dir` armed, a helper reads the request file and plants `<id>.decision.json`; exit 0, `escalations[0].decision === "accepted"`, `by === "coordinator"`, `resolved === true`, `approvalsAccepted === 1`, the command in `commandsSucceeded`.
- `approval declined by the coordinator`: the same with `decline`, exit 6, `by === "coordinator"`.
- `approval expired`: `--approval-timeout 1`, no decision, exit 6, `decision === "expired"`, `why === "deadline"`, the RPC log shows `decline`.
- `the refusal is decline, never an error`: `approval-wait-error` with no channel; the RPC log shows a `result` with `decision: "decline"` and no `error` frame.
- `a stale decision is ignored`: a decision naming another `startedAtMs`, then expiry; `approvalsStale === 1`.
- `a late decision is counted, not sent`: decision planted after `turn/completed`; `approvalsLate === 1`, one response in the RPC log.
- `a request pending at the wall-clock cut is settled before the interrupt`: `--timeout 1`, exit 3, entry `expired` with `why: "cut wall"`, RPC log order `decline` then `turn/interrupt`.
- `a request pending at a signal is settled before the interrupt`: `SIGTERM` during the wait, exit 1, the same RPC order, `why: "signal SIGTERM"`.
- `a request pending when the server exits without turn/completed`: `approval-stdin-close` driven by `--approval-timeout 1` after the fixture is told to ignore the decline; the report is the collected one (exit 4, `turnStatus: failed`), the entry says `expired`.
- `a subagent's request is not offered`: `approval-subagent-wait`, no request file, exit 6, `offered === false`.
- `an accepted request blocks the transient retry`: `approval-wait` followed by a `serverOverloaded` completion; no second `turn/start` in the RPC log.
- `no channel declines at once`: `approval-wait` without `--approval-dir`, exit 6, `offered === false`, `waitMs === 0`, `detail` equal to the request's `command`.
- `a file-change entry names its paths`: `escalated-file-change` preceded by an `item/started` fileChange with the same `itemId`; `detail === "add /tmp/…"`; and the same scenario without the `item/started`, `detail === ""`.
- `RUNGS`: the `EXIT.ESCALATED` context becomes `escalations: [{ decision: "expired" }]`, and a new context `escalations: [{ decision: "accepted" }]` must fall through to no rung (the "completed turn that tripped no rung exits 0" flow at `:805` gets that context).

`evals/cli.test.mjs`: `--approval-dir` inside `--cwd`, inside `--writable`, inside `$TMPDIR`, relative, and missing are each exit 2 naming the root; `--approval-timeout` without `--approval-dir`, at 0, and at or above `--idle-timeout` are exit 2; both flags appear in `--help` (the flow at `:883` catches an unlisted one); `--help` says what `exit 6` means now. `evals/agent-contract.test.mjs:54` covers the two `cli-only` rows; `:133` and `evals/agent-run.test.mjs:227` move to the new spawn shape (`--approval-dir` present iff the mailbox exists).

`evals/agent-run.test.mjs`: `--new --approvals` makes `approvals/` at 0700 and `--new` without it does not; `--run` passes `--approval-dir` iff the directory exists; `--pending` prints `REQUESTS=0` on an empty mailbox, six lines per open request, and `ORPHANED=` after `exit`; `--decide` publishes at 0600 by link, refuses a second decision for one id, refuses an id not in `pending`, refuses after `exit`, and prints `DECIDED=`; `RECEIPT=` carries `approvals=a/d/e` only when the array is non-empty and stays nine lines.

`evals/lock.test.mjs`: `a write run waiting on a decision holds its lock and a peer exits 10 at once` (`approval-wait` with `--approval-timeout 3`, peer launched during the wait).

`evals/orchestrate.test.mjs`: F6 pins the new poll command and the re-arm sentence; F4 gains the exit-6 row's new wording; a new case pins the decision-rule paragraph's load-bearing sentences ("Approving it is running that command yourself", the approve list, the never list, "a file write is never an approval").

One live gate, in `evals/fidelity.test.mjs` beside the live turn at `:575-635`, opt-in under `--require-live`: a read agent, `--approval-dir` set, prompt "run `touch <LIVE_PROBE_FILE>` outside `$TMPDIR`; when the sandbox refuses, request approval and then run it"; the harness answers with `--decide --accept` when the request file appears; asserts `escalations[0].decision === "accepted"`, `resolved === true`, exit 0, `receiptOk true`, and that `LIVE_PROBE_FILE` exists (the "no Seatbelt" fact, re-measured on the pinned version at every release), then removes it.

## Implementation estimate

| File | Change | Lines |
| --- | --- | --- |
| `plugin/skills/codex/scripts/driver.mjs` | two `FIELDS` rows, two flags and their checks, `LIMITS` entry, the offer branch, request/decision/pending writers, the interval, expiry and settle-first hooks in `cutTurn` and `finish`, `serverRequest/resolved`, the fileChange `item/started` map, report fields, rung and help text, retry guard, stderr line | 300–360 |
| `plugin/skills/codex/scripts/agent-run.mjs` | `--approvals` on `--new`, `--approval-dir` in `launch`, `--pending` with `ORPHANED=`, `--decide`, `RECEIPT=` token, usage text | 130–160 |
| `evals/fake-app-server.mjs` | four scenarios, decision logging | 80–100 |
| `evals/protocol.test.mjs` | fourteen cases, two `RUNGS` contexts | 130–160 |
| `evals/cli.test.mjs`, `evals/agent-run.test.mjs`, `evals/lock.test.mjs`, `evals/agent-contract.test.mjs`, `evals/orchestrate.test.mjs`, `evals/fidelity.test.mjs` | as listed | 40 + 90 + 30 + 10 + 30 + 50 |
| `plugin/skills/codex/SKILL.md` | Rights row, `escalations` bullet, exit-6 wording, Reading the result | 25 |
| `plugin/skills/orchestrate/SKILL.md` | the poll command, the three commands, the rule paragraph, the exit-10 sentence, "armed agents run in the background" | 25 |
| `plugin/skills/codex/references/environment-and-internals.md`, `parity.md` | the mailbox, the permission-prompt row | 20 |
| `CHANGELOG.md` | one Unreleased entry | 15 |

About 1,000–1,150 lines. Composition: one Opus write agent for the driver, the launcher, the fixture and the suites in one thread (dependent execution stays in one agent), run offline to green; one Sonnet agent for the pages after the driver's `--help` text is final, since the pins quote it; one Codex Sol cross-reviewer on the driver diff; one Codex Astra refuter given C13–C22, P1's return and the diff; the live gate run by the coordinator. Five agents, announced before spawning.

## Alternatives rejected

**A mailbox in `$TMPDIR`.** It is the read level's one writable root and beside the cwd at write level (`--help`, `:305-309`), so the requesting agent could write its own decision; C19 named this and it stands.

**A header ceiling (`APPROVALS: …` or a deadline in the prompt).** A newline is the field separator and the wrapper cannot tell an injected line from its own (`:566-575`, incidents.md, "prompt-file newline injection"); the same boundary already forced `VERIFY` onto the command line. C20 stands; arming and bounding are command-line-only.

**`approvalsReviewer: "auto_review"`.** The server's own subagent approves, the driver never sees a request, `escalations` stays empty, the sandbox object is byte-identical under both settings (`:4030-4034`, measured), and the run exits 0 over a command that ran with no sandbox at all. It replaces the coordinator's judgement with the model's, which is the opposite of the ask.

**Decline, then resume with wider rights.** It is the existing path and it stays for file writes. As the only path it costs a second turn per request, widens the whole continuation rather than one command, and does not fit a command that is not a right at all: thirteen `vcs` reads in a tree the agent may already read need no `WRITABLE:`, and the sandbox denies the VCS client for a reason no rights line names.

**A driver-side allowlist (auto-approve `vcs show`, `ps`).** It moves the policy into the driver, whose comment says the decision "is the caller's call, not this driver's" (`:2745`), hides an unsandboxed run from the coordinator's transcript, and the list would be wrong for the next repository.

**Answering with a JSON-RPC error as the refusal.** Honoured, but the model reads it as a broken tool and the report as a failed command (above); `decline` says no and is counted as a decline.

**A blocking loop in the dispatcher.** C16: timers, signals and frames stop; a stalled child cannot be reported. The asynchronous wait costs one `Map` and one interval.

**A FIFO or socket between launcher and driver.** Bound to a process lifetime, so the ten-minute rerun and a `-p` session lose the endpoint; files survive both and are what the poll loop already reads.

**Exposing `cancel` as a third decision.** Stop on the card and `SIGTERM` to the pid already interrupt the turn and write the report the run earned (codex `SKILL.md`, Reading the result); a second interrupt path with a different exit code is a second thing to keep true.

**Offering file-change requests.** The request names no path and the sandbox never refused the write; joining it to the `item/started` by `itemId` and approving writes the file with no sandbox; every one of the ten on this machine was a read agent trying to write.

**A shared nonce between `--new` and `--decide`.** Above, under the trust boundary: it excludes nothing the user's processes cannot read, and it puts a secret into tool output.

**Always-on arming from `--run`.** Every unattended run would wait ten minutes per request before today's decline; the opt-in at `--new` keeps 0.20.0 behaviour for every coordinator that did not plan for approvals and costs one flag for those that did.

## Open for the owner

1. **A request the coordinator declined still exits 6.** The rung reads evidence, and a declined request is the same evidence whoever declined it; the coordinator knows it declined and reads the answer under the page's "any other non-zero with an answer is a gate verdict" row. The alternative is exit 0 with an answer the coordinator deliberately narrowed and nothing in the code saying so.
2. **File-change requests are never offered.** The remedy for a needed write is a rights line on a `RESUME:` continuation, settled with the user. The alternative is per-file approval, which joins two server messages and lets a read agent write one file unsandboxed on the coordinator's word alone.
3. **The default deadline is 600 s.** Sized to one blocking `TaskOutput`; the server would wait forever without it. A coordinator that polls several agents in one loop would do with 300 s, and the page could say so.

## Found in passing, for the ledger

- `driver.mjs:2726` says the refusal shapes "are taken from the pinned `schema-<version>/*ApprovalResponse.json`"; `plugins/entrust/schema-0.153.4/` holds `ServerRequest.json`, `ServerNotification.json`, `JSONRPCError.json`, `v1/InitializeResponse.json` and `v2/`, and no `*ApprovalResponse.json` (level 1: `ls`). The file-change decision enum is therefore not pinned in the tree; `codex app-server generate-json-schema` on 0.155.1 produces the ten `*Approval*.json` files and they match the pinned tokens.
- 00-scouting.md counts "1 nested `codex sandbox` launches"; 00-escalations.md lists two (round04-astra, round07-astra), and the "5 other" is then four. Level 1.
- `commandsDeclined` and `commandsFailed` are counted from `item/completed` (`:3318`, `:3336`), and P1 saw a sandboxed attempt run with neither `item/started` nor `item/completed` (once, cause not established). A report can therefore show `escalations: 1` with `commandsDeclined: 0`, which `--help-all`'s "the first and the third can differ" (`:427-432`) covers by accident rather than by name. Level 3 for the gap, level 2 for the consequence.
