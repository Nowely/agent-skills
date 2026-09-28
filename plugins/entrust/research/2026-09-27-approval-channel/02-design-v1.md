# Design v1: the approval channel

Run `2026-09-27-approval-channel`, Fable D1, against the tree at b3872b4 (`plugins/entrust/plugin/skills/codex/scripts/driver.mjs`, 4198 lines, version 0.20.0, pinned codex 0.153.4; the installed binary is 0.155.1 and its generated schema carries the same six command decisions and four file-change decisions). Evidence levels as the repository defines them: 1 the line resolves, 2 an independent reader would say the same, 3 made to happen; a lifecycle claim not made to happen is a guess and says so. Line numbers are the driver's unless a file is named.

## In one paragraph

The coordinator arms a channel per agent at `--new` with one flag; the launcher then hands the driver a mailbox directory inside the agent's own `<DIR>`, which no Codex sandbox can write because the driver refuses everything under the state directory as a writable root. When the server asks to run a command the sandbox denied, the driver writes a request file and a `pending` marker there, answers nothing, arms a request timer of its own, and lets the turn wait. The coordinator's existing poll task wakes on the marker as it wakes on the exit marker, reads the request through a launcher subcommand, decides under a rule the plan pre-authorised, and writes the decision with a second launcher subcommand, atomically and once. The driver validates the decision against this run and this request, sends `accept` or `decline` to the server, and records the request, the decision, who made it and when in the report's `escalations` array. An unanswered request expires as a decline. Exit 6 is now "a request was declined or expired", never "a request was accepted". File-change requests, the legacy pair and permission-profile requests are declined at once as today; the channel carries command approvals and two decisions, accept and decline.

## Names

- **channel**: the whole mechanism. **mailbox**: `<DIR>/approvals/`, the directory the driver writes requests into and reads decisions from. **request**: one `item/commandExecution/requestApproval` the driver offered. **decision**: the coordinator's `accept` or `decline` for one request. **offered**: a request the driver wrote to the mailbox and held open; a request declined at once is recorded and not offered. **expired**: an offered request the deadline or a cut settled as `decline`.

## The mechanism, end to end

### Arming

`agent-run.mjs --new --approvals --report-file <REPORT>` makes `<DIR>/approvals/` at 0700 beside `prompt.txt`, inside the `<DIR>` it already makes at 0700 (`agent-run.mjs:193-207`, level 1). `--run` (`agent-run.mjs:121-157`) spawns the driver with `--approval-dir <DIR>/approvals` when that directory exists and with today's two flags when it does not. Nothing else in the wrapper's command or message changes; `codex-agent.md` is unchanged. A run without the mailbox declines every request at once, as today (`:2714-2769`, level 1), so a coordinator who did not arm the channel gets 0.20.0 behaviour, and the report's entries say `offered: false` so it can see what it could have answered.

The flag is the coordinator's own command line, never the prompt: `APPROVAL_DIR` and `APPROVAL_TIMEOUT` join `FIELDS` as `cli-only` rows (`:180-200`), which `argvFromPromptFile` refuses in a prompt file naming the flag to use (`:652-653`, level 1), and `agent-contract.test.mjs:54` already checks that every `cli-only` name is refused. The arming is per agent, chosen when the plan is written, which is what "the plan covers it" means here. Given up: a coordinator that forgets `--approvals` cannot arm the channel mid-turn; the agent declines as today and the coordinator resumes it if the work needs the command.

### What the driver checks before the turn

`--approval-dir D` must be absolute, exist, and lie outside every root the sandbox may write: `cwd` at write level, each `--writable`, `$TMPDIR` at either level, and a `--worktree` tree. Each of those already passes `checkRoot` (`:2290`, `:2333`, `:2313`, `:1807-1826`), which refuses anything inside `stateDir()` by inode walk (`:888-940`, `protectedRoots` at `:921-924`, level 1). The new check is the inverse walk, D's ancestors against each writable root's inode, exit 2 before the turn on a hit. Belt and braces: the launcher always puts D under the state directory, and the check makes the driver refuse a hand-typed D that is not. `--approval-timeout S` without `--approval-dir` is exit 2 (a bound for a channel that is not there). `S` at or above `--idle-timeout` when that is non-zero is exit 2: the idle cut would answer the request as exit 3 (C14), and the repository refuses silent substitution.

### When a request arrives

`handleServerRequest` (`:2714`) gains one branch before `REFUSALS`. A request is **offered** when all of these hold: `msg.method === "item/commandExecution/requestApproval"`; `opts.approvalDir` is set; `msg.params.threadId === rootThreadId` and `ownedTurns.has(msg.params.turnId)` (the strict attribution success evidence already uses, `:2673-2675`, C11); `settled` and `pendingCut` are both false (`:2384`, `:2650`, C21). Every other request takes today's path unchanged: declined at once with the schema's refusal and recorded, with `offered: false` and a `why` (`subagent thread`, `no channel`, `file changes are rights`, `legacy method`, `permission profile`, `turn closing`).

For an offered request the driver:

1. Builds the record and writes it whole: `<DIR>/approvals/<id>.request.json`, written to `<id>.request.json.<hex>.tmp` and renamed over (the driver is the only writer of request files, so rename is the right primitive here; the report keeps `link` because two runs can name one path, `:991-1010`). `id` is `<seq>-<8 hex>`, `seq` per run from 1.
2. Rewrites `<DIR>/approvals/pending`, one open id per line, by the same rename. When the last open request settles the file is unlinked, so `[ -s pending ]` is the coordinator's test.
3. Holds `{ rpcId: msg.id, record, timer }` in a `Map` keyed by `id`. Nothing blocks: the dispatcher returns (C16).
4. Arms the request timer, `setTimeout(expire, deadlineMs).unref?.()`, independent of `idleTimer` and of any event on any thread (C15).
5. Prints one stderr line, which lands in `<DIR>/err.txt`: `entrust: approval request <id> (<method>) waits for a decision in <D> until <deadlineAt>`.
6. Starts, if not running, a 250 ms `setInterval` that looks for `<id>.decision.json` for every open id and stops when none is open. A poll rather than `fs.watch`: bounded, portable, and the loop is already alive on the child's pipes.

The idle timer was touched when the request arrived (`:2868`, level 1) and is not touched again while the request waits: a waiting request is silence, and the deadline is what bounds it.

Request record, the JSON shape:

    { "id": "1-9f3a2c1e",
      "run": { "pid": 4242, "identity": "<selfIdentity()>", "startedAtMs": 1790000000000, "threadId": "thr_…", "turnId": "turn_…" },
      "rpcId": 9002,
      "method": "item/commandExecution/requestApproval",
      "itemId": "item_a", "approvalId": null, "kind": "command",
      "command": "/bin/zsh -lc 'arc show 719d…:src/…'", "commandActions": ["arc show 719d…:src/…"], "cwd": "/Users/…/arcadia/…",
      "reason": null, "networkApprovalContext": null,
      "proposedExecpolicyAmendment": null, "proposedNetworkPolicyAmendments": null,
      "level": "read", "sandbox": { …effectiveSandbox… },
      "askedAt": "2026-09-27T12:40:00.000Z", "deadlineAt": "2026-09-27T12:50:00.000Z" }

Every field is a copy of the server's params (`schema-0.153.4/ServerRequest.json:353-465`, level 1) plus the run's identity; `command` is clipped at 4000 characters and `commandActions` at 20 entries. The two proposed amendments are recorded for the reader and never sent back.

### The deadline

`LIMITS.DEFAULT_APPROVAL_TIMEOUT_S: 600`, in the table at `:60-130` with its reason. Ten minutes because that is how long the coordinator can be blind to a marker: it waits on one `TaskOutput(…, block: true, timeout: 600000)` at a time (orchestrate `SKILL.md:107`), and a request raised while it blocks on another agent's task is seen when that block returns. It sits under the 900 s idle default (`:72`) with margin, and the usage check above keeps the order whatever the caller sets. What it costs: an armed agent whose coordinator never answers waits ten minutes per request before the same decline it would have got at once. Given up: a shorter default that suits an attentive coordinator and expires under an ordinary block.

### Expiry

`expire(id)`: if the request is still open, send `{ decision: "decline" }` on its `rpcId`, settle the record with `decision: "expired", by: "driver", why: "deadline"`, rewrite `pending`, clear the timer. The turn goes on, as it does today after a decline (00-scouting, level 3 for the continuation after a driver decline; the same server response, so the same continuation, level 2). A cut (`cutTurn`, `:3276`) and a signal (`:4150-4175`) settle every open request the same way **before** `interruptTurn()` runs, with `why: "cut idle" | "cut wall" | "cut commands" | "signal SIGTERM"`, so no request is left open across teardown (C14) and the exit stays the cut's (C9). `shutdown()` (`:2525`) clears the interval and every timer. A decision file that lands after settlement is read once, ignored, and counted in the report as `approvalsLate` (C21).

### How a decision travels back

`agent-run.mjs --decide <id> --accept | --decline [--why TEXT] --report-file <REPORT>`:

1. Reads `<DIR>/approvals/<id>.request.json`; refuses with exit 2 and a `REFUSED=` line when the file is missing, when `<id>` is not in `pending`, or when `<DIR>/exit` exists (the run is over).
2. Writes `<id>.decision.json.<hex>.tmp` at 0600, then `link()`s it to `<id>.decision.json` and removes the temp: the same no-clobber publication the report uses (`:991-1010`, level 1). `EEXIST` is "already decided" and prints the existing decision; a second decision for one id is therefore impossible, whoever writes it (C18, single consumption).
3. Prints `DECIDED=<id> <accept|decline>`.

Decision record:

    { "id": "1-9f3a2c1e", "run": { "pid": 4242, "startedAtMs": 1790000000000 },
      "decision": "accept", "by": "coordinator", "why": "plan: arc reads in the Arcadia checkout", "decidedAt": "…" }

`id` and `run` are copied from the request file by the launcher, never typed. The driver accepts a decision file only when `id` is an open request of this run and `run.pid === process.pid && run.startedAtMs === startedAtMs`; anything else is left in place, counted as `approvalsStale`, and the request keeps waiting (C18, stale rejection). The driver then sends `{ decision: "accept" }` or `{ decision: "decline" }` on the request's `rpcId`, settles the record (`decision: "accepted" | "declined", by: "coordinator", why, settledAt, waitMs`), rewrites the request file with a `settled` object, and rewrites `pending`.

`agent-run.mjs --pending --report-file <REPORT>` prints each open request in five lines, `REQUEST=<id>`, `METHOD=`, `COMMAND=` (the bare command from `commandActions` where the server parsed one, else the wrapper text, clipped at 600), `CWD=`, `DEADLINE=`, and `REQUESTS=<n>` last; zero requests prints `REQUESTS=0` alone. The coordinator never opens the JSON.

### What the driver answers, per decision the schema allows

| Decision (0.153.4 pin `:265-343`; 0.155.1 identical) | Command request | File-change request | Exposed | Why |
| --- | --- | --- | --- | --- |
| `accept` | `--decide --accept` | no | yes, commands only | the one grant the plan can cover for one command; a file write outside the roots is a rights question, and `RIGHTS:`/`WRITABLE:` on a `RESUME:` continuation is the existing path for it (parity.md:20, "rights are declared again per call") |
| `acceptForSession` | no | no | no | it hides every later matching request from the record: the session cache stops prompting, so the report could not list what ran under it (C7, C8) |
| `acceptWithExecpolicyAmendment` | no | — | no | a rule "so future matching commands run without prompting"; where it persists is not established (A5 Q4), and the page forbids allow-rules on the user's behalf (codex `SKILL.md`, Composition rule 5) |
| `applyNetworkPolicyAmendment` | no | — | no | persistent, host-scoped, store unknown (A5 Q4); network policy stays the `NETWORK:` line's |
| `decline` | `--decide --decline`, expiry, cut, not offered | at once, as today | yes | the turn continues (schema text, level 2) |
| `cancel` | no | no | no | it is a decline plus an interrupt; the coordinator's interrupt is Stop on the card or `SIGTERM` to the pid, which already writes the report (codex `SKILL.md`, Reading the result, last bullet) |

`item/permissions/requestApproval` answers with a granted profile, not a decision; it stays refused as today (`:2733`). The legacy `applyPatchApproval` / `execCommandApproval` pair stays `abort` (`:2731-2732`); none of the 37 requests on this machine took that form (00-escalations, level 1).

### `accept` semantics, two branches until the probe lands

**Replace this section with 01-probe.md's result.**

(a) The command re-runs outside the sandbox with the driver's, that is the user's, rights. More likely: 35 of the 37 requests name no root and no host, every request the scouting traced follows a sandboxed failure of the same command (00-scouting, level 2), and re-running inside the same sandbox would fail the same way, so the only thing the server can widen to without a grant in the request is no sandbox. Level 2. Under (a) the decision rule below stands as written: approve only a command whose every word the coordinator read and whose effect is a read, because the command runs with everything the user can do; the report's `sandbox` field is unchanged by the grant, and the entry's `decision: "accepted"` is the one record that a command ran outside it (C12).

(b) The command re-runs inside a widened sandbox (the roots the request carries, or a network grant). Under (b) the rule can approve a `rm -rf` of the agent's own `$TMPDIR` path, because the write stays inside the grant; nothing else in the rule changes, and the report gains a `grant` object copied from the request (`grantRoot`, `networkApprovalContext`) beside `decision`. What (b) requires that (a) does not: the probe must show the re-run's sandbox policy, which the driver cannot observe from the protocol, so the page would say "measured on 0.155.1" and pin the version.

Either way the retry guard, the ladder and the mailbox are the same.

## The coordinator's side (orchestrate page)

The armed agent runs as a **background** Agent call: a foreground wrapper blocks the coordinator's turn until the run ends, so every request would expire (level 2, from the foreground call's shape at codex `SKILL.md`, One call). The poll task becomes:

    until [ -s "<DIR>/exit" ] || [ -s "<DIR>/approvals/pending" ]; do sleep 5; done; if [ -s "<DIR>/exit" ]; then echo DONE=<id>; else echo ASK=<id>; fi

launched as a background Bash task with `TaskOutput(<poll_task_id>, block: true, timeout: 600000)` on it, as today (`SKILL.md:107`). On `ASK=<id>`:

1. `node "${CLAUDE_SKILL_DIR}/scripts/agent-run.mjs" --pending --report-file "<REPORT>"` and read the lines.
2. Decide under the rule below. `node "${CLAUDE_SKILL_DIR}/scripts/agent-run.mjs" --decide <request-id> --accept --why "<the plan line that covers it>" --report-file "<REPORT>"`, or `--decline --why "<the rule that refuses it>"`.
3. Re-arm: launch the same poll command again as a new background task and `TaskOutput` on it.

Reading under the data directory is what the coordinator does already (`<REPORT>` lives there, orchestrate `SKILL.md:29`); writing is the launcher's, a subprocess handed the path, which the page's measured rule permits (`SKILL.md:29`, measured 2026-09-08, level 3 for `--new`, level 2 for `--decide`: same route, not yet made to happen). The rule "never run `mkdir`, Write or a redirect under that directory yourself" stays true and gains "and never write a decision file by hand: `--decide` is the one path".

A headless `-p` session runs the same three commands; it has no user to ask, so a request the rule sends to the user is declined with `--why "needs the user"` and the answer names it. The wrapper's ten-minute rerun is unaffected: `--run` waits on `<DIR>/exit` (`agent-run.mjs:223-266`, level 1) and a pending request does not end its call; the second call finds the driver's pid and waits as today. `RESUME:`: a continuation gets a fresh report path and a fresh `agent/` (codex `SKILL.md`, One call), so the channel is armed again at its `--new` or not at all; no grant carries across because `acceptForSession` is never sent. Whether the server's own approval cache remembers an `accept` across a resume is a guess the probe can settle.

The wrapper's nine status lines stay nine (`agent-run.mjs:57`). `RECEIPT=` gains a fourth token only when the report's array is non-empty: `RECEIPT=turnStatus=completed receiptOk=true model=Sol approvals=1/0/0`, accepted/declined/expired. The user hears the sentence the coordinator writes, in their language: "Codex Sol R1 asked to run `arc show` outside the sandbox; I approved it under the plan's Arcadia line."

## The lock (C17)

A write agent waiting on a decision holds its directory lock (`acquireLock` at `:2329`, released in `shutdown()` after the group is waited out, `:2525-2546`, level 1). What bounds the hold is the request deadline, 600 s by default and always below the idle timeout, so the longest a peer waits behind a request is one deadline plus the turn's own work. The page adds one sentence to the exit-10 row: "a holder that waits on your decision has an `ASK=` in your poll loop; answer it before you wait on the holder." The scenario C17 describes, writer B exits 10 while A waits on the coordinator, ends when the coordinator answers A or A's request expires; the page already forbids two Codex write agents on one directory (orchestrate `SKILL.md`, Composition and bounds table).

## The trust boundary (C19)

The mailbox is under `<DIR>`, which is under the run directory, which is under the state directory (`<state>/orchestrate/…` or `<state>/reports/…`, codex `SKILL.md`, One call). `checkRoot` refuses any writable root inside `stateDir()` by inode identity, walking the candidate's ancestors (`:888-940`), and every root the sandbox can write passes it: `--cwd` at write level (`:2290`), `--writable` (`:2333`), `$TMPDIR` at both levels (`:2313`), the worktree's repository and destination (`:1807-1826`). Level 1 for each refusal; level 2 for the consequence that no Codex sandbox at read, worktree or write level can write a decision file. The new inverse check at start-up makes the same guarantee hold for a hand-typed `--approval-dir`. The coordinator's own Write, `mkdir` and redirects there are refused in a headless session and the launcher handed the path writes unopposed (orchestrate `SKILL.md:29`, measured 2026-09-08, level 3). So the authorised submission path is the same one `--new` already uses, and the requester cannot manufacture its approval. What is not enforced: any process of the user's, including a Claude subagent with Bash, can run `--decide`. The page says the coordinator decides and no brief carries the command; that is a rule, not a wall, and the design says so.

## The report and the exit ladder

`escalations` keeps its name and becomes one entry per approval request, whatever happened to it. Renaming was considered and rejected: every reader, six suite cases (`protocol.test.mjs:66-82, 147-158, 249-251, 770`), the pages and three changelog corrections know the name, and a rename is a second meaning change with no gain. Each entry:

    { "id": "1-9f3a2c1e" | null, "method": "…", "detail": "<200 chars as today>", "thread": "thr_…", "subagent": false,
      "offered": true, "decision": "accepted" | "declined" | "expired", "by": "coordinator" | "driver", "why": "…",
      "askedAt": "…", "settledAt": "…", "waitMs": 1234 }

A request declined at once has `id: null, offered: false, by: "driver", waitMs: 0`. Beside the array: `approvalsAccepted`, `approvalsStale`, `approvalsLate` counts, and `approvalDir` (the mailbox or null).

The rung (`:253-254`) becomes `when: (c) => c.escalations.some((e) => e.decision !== "accepted")`, help text "an approval request was declined or expired unanswered; inspect the report, if delivered, before judging task completeness". An entry with no `decision` (an older fixture) still hits it. So: an accepted request is not exit 6; an expired one is; a request the coordinator declined is exit 6 too. The last was a choice: the rung reads evidence, a declined request is the same evidence whoever declined it, and the coordinator already knows it declined and reads the answer under the page's "any other non-zero with an answer is a gate verdict" row. Given up: a run the coordinator deliberately narrowed exits 6 and its answer is read, not trusted. `announceDeclinedApproval` (`:2553`) counts non-accepted entries. `commandsDeclined` is unchanged: a command an accepted request re-ran completes as a root item with its exit code and counts as any root command does (`:2805-2815`, `:3310-3340`).

The transient retry guard (`:2955-2965`) adds `&& !escalations.some((e) => e.decision === "accepted")`: an approved command may have run with wider rights before the failure, and a replay would repeat it (C22).

Unaffected: the receipt (the rollout's `session_meta`, `:3580`), `receiptOk`, and the root-thread-only rule: a subagent's request is never offered, and an accepted root command is root evidence exactly as an unapproved one is. The thread start is unchanged: `approvalPolicy: "on-request"`, `approvalsReviewer: "user"`, both asserted (`:4035-4059`); the driver is the user's client, and answering a request is what a client at `"user"` does.

## The decision rule, as page sentences

For the orchestrate page, after the poll loop:

> An agent asks to run a command the sandbox stopped. Approve it yourself when the plan named the tree it reads and the command is a read of it: a `git`, `arc`, `hg` or `svn` query (`status`, `log`, `show`, `diff`, `blame`, `grep`), a `ps`, a `sed -n`, `cat`, `grep`, `diff` over paths inside that tree. Read the whole command first; a command that runs a script is the script, so open the script whole and approve it only when it reads. Never approve a write outside the declared rights, a deletion, a `kill`, a nested `codex`, a command that names `~/.codex` or the plugin's state directory, a network policy amendment, or a command you cannot read whole; decline it with the reason in a clause. A fetch of a public URL is approved when the plan named the site as a source and the command only reads it; otherwise ask the user. A file write is never an approval: it is a rights line, so decline it and continue the agent with `RESUME:` and the right added when the user has settled it. The plan pre-authorises a class by naming it in ordinary words ("Codex Sol R1 reads the Arcadia checkout with `arc`"), and "go" covers exactly those classes.

The 37 requests in 00-escalations.md under that rule:

| Class | Count | Rule | Requests |
| --- | --- | --- | --- |
| `arc` reads in the Arcadia checkout the plan named | 13 | approve | A2-2 `arc log`; R1 `arc diff`; a2-console `arc status; arc log` ×2; a9, b1, l2, l3, l4, l5, l6, l7, l8 `arc show` |
| `ps` reads | 2 | approve | j1 `ps -o lstart= -p 1`; s4 `ps -o lstart= -p $$` |
| a read in the repository | 1 | approve | I1 `sed -n '29p' …/writing-rules.md; diff …` |
| file writes by read agents (`fileChange`, empty detail) | 10 | decline: rights, not approvals | t3, V1 ×2, A2d, sol-r1, s2-sol-2 ×2, s3-sol-2, b1, round07-sol2 |
| deletions of the agent's own temp directories | 3 | decline: a deletion buys the deliverable nothing, and the driver prunes its temp roots | a2-console, l2, l3 `rm -rf …/T/…` |
| a nested `codex sandbox` with its own `CODEX_HOME` | 2 | decline: an agent of its own outside the driver's bounds | round04-astra, round07-astra |
| a signal to a pid | 1 | decline | t3 `kill -9 44899` |
| a script the agent wrote, named "unsandbox" | 1 | decline: an escape probe by design | A2b `python3 …/run.py baseline-lock-unsandbox` |
| scripts the agent wrote in `$TMPDIR` | 2 | read the script whole, approve if it reads, else decline | SYN `python3 …/terse/runs/…`; V1 `node …/e45-check.mjs <repo>` |
| fetches of a public documentation URL after a certificate failure | 2 | approve where the plan named the site, else ask the user | A1 `curl --head https://code.claude.com/…`; sol-n2 `curl -fsSL https://code.claude.com/… \| rg` |

Sixteen approved, seventeen declined, two read-then-decide, two plan-or-user. Under branch (b) the three deletions move to approve where the path is inside the agent's `$TMPDIR`; nothing else moves.

## C13–C20, each by name

**C13, no wake-up path.** Answered. The coordinator's poll task already wakes on `<DIR>/exit` (orchestrate `SKILL.md:107`, pinned by `orchestrate.test.mjs:339-347`); the loop gains a second `-s` on `<DIR>/approvals/pending` and echoes `ASK=` or `DONE=`. The servicing contract is the three commands above, on the page, with the re-arm step. The wrapper needs no wake: `--run` waits on `exit` alone.

**C14, the idle timer cuts the wait and reports exit 3.** Answered. The request deadline is below the idle timeout by construction (usage error otherwise), so an unanswered request expires as a decline before silence is cut, the turn continues, and the idle guard rearms on the thread's next event. Where a cut comes first anyway (a wall clock, a signal), every open request is settled as `expired` with `why: "cut <kind>"` before `interruptTurn()`, and the report carries the entry under exit 3 (or 1 on a signal), as today's entries ride under a cut (`:253`, help text, level 1). Level 2 for the ordering; the protocol case `approval-during-cut` makes it level 3.

**C15, the bound is not a bound.** Answered. The request timer is armed per request from `Date.now()` and touched by nothing: not by root events, not by subagent events, not by `touchIdle`. `--idle-timeout 0` leaves it in force; `--approval-timeout` cannot be 0 (exit 2: a channel with no deadline is a hang).

**C16, a synchronous wait inside the dispatcher.** Answered. The dispatcher records, writes two files, arms a timer and returns; the decision arrives on a 250 ms interval callback; timers, signals and later frames run throughout. `shutdown()` clears the interval; a `SIGKILL` of the driver loses the in-memory report as it does today (environment-and-internals.md:150), and the request file on disk still says what was asked.

**C17, the lock turns delay into blocked peers.** Answered above: the hold is bounded by the deadline, the peer exits 10 as today, and the page tells the coordinator to answer the holder's `ASK=` first.

**C18, identity, atomic publication, single consumption, stale rejection.** Answered. Identity is `<seq>-<8 hex>` per run plus the run's `pid` and `startedAtMs` in both files; publication is `link()` over a temp file, refusing every existing entry; consumption is once by construction (a second decision for one id cannot be created) and the driver ignores a decision whose `run` or `id` does not match an open request of this run, counting it as stale. Each agent has its own `<DIR>` (one per report path, codex `SKILL.md`, One call), so two agents never share a mailbox name; a late answer after `--resume` addresses a run that no longer exists and is stale by `startedAtMs`. `approvalId`, where the server sends one, is copied into the record and is not the key: the driver's own id is.

**C19, the answer-file location.** Answered above: the mailbox is under the state directory, which no sandbox root can include (`:888-940`), the launcher is the authorised submission path (`SKILL.md:29`, measured), and the driver refuses a mailbox inside any of its own writable roots before the turn.

**C20, a header ceiling is not authorisation.** Answered. No header field arms the channel, sets its deadline or pre-approves anything: `APPROVAL_DIR` and `APPROVAL_TIMEOUT` are `cli-only` and refused in a prompt file (`:652-653`), the arming is the coordinator's own `--new --approvals`, and pre-authorisation lives in the plan the user agreed to, which the coordinator applies per request. A copied value with a newline cannot reach any of it. `SKILL.md:176`, "never translate a refusal into broader rights", stays: an approval is a decision on one command under the plan, and the rights lines are unchanged.

## The other critiques

C1–C4, C5–C7 (network grants, host scoping, grant lifetime): not touched; the channel sends no network amendment and no session or rule grant, and `networkApprovalContext` is recorded only. C8: answered by the one array with `decision`, `by` and timestamps. C9: the ladder's order is unchanged; a cut settles requests as expired and still wins. C10: `commandsRan` counts as today; an accepted command that ran counts as a root command. C11: offers use the strict root attribution; refusals stay inclusive. C12: the entry carries id, decision, deadline and wait; `sandbox` stays what the server applied, and `decision: "accepted"` is the record of a command run beyond it. C21: settled/pendingCut guard on offer, late decisions counted. C22: the retry guard reads accepted requests. C23 and C24: not touched, out of scope (loss of work; web search). C25: the suites below.

## The suites

`evals/fake-app-server.mjs` gains scenarios beside `escalated` (`:800-810`): `approval-wait` (raises the request, then emits the command as `completed`/exit 0 when it receives `accept` and as `declined` when it receives `decline`, then a message and `turn/completed`), `approval-subagent-wait` (the same request under `OTHER_THREAD`), and a `FAKE_RPC_LOG` line for the response's decision so a case can read which decision was sent.

`evals/protocol.test.mjs` (`CASES`, and the `RUNGS` table at `:757-795`):
- `approval accepted by a planted decision`: the case arms `--approval-dir`, plants `<id>.decision.json` with a helper that reads the request file, expects exit 0, `escalations[0].decision === "accepted"`, `by === "coordinator"`, `approvalsAccepted === 1`, the command in `commandsSucceeded`.
- `approval declined by the coordinator`: the same with `decline`, exit 6, `by === "coordinator"`.
- `approval expired`: `--approval-timeout 1`, no decision, exit 6, `decision === "expired"`, `why === "deadline"`, the RPC log shows `decline`.
- `a stale decision is ignored`: a decision naming another `startedAtMs`, then expiry; `approvalsStale === 1`.
- `a late decision is counted, not sent`: decision planted after `turn/completed`; `approvalsLate === 1`, one response in the RPC log.
- `a request pending at the wall-clock cut is settled before the interrupt`: `--timeout 1`, exit 3, entry `expired` with `why: "cut wall"`, RPC log order `decline` then `turn/interrupt`.
- `a subagent's request is not offered`: `approval-subagent-wait`, no request file, exit 6, `offered === false`.
- `an accepted request blocks the transient retry`: `approval-wait` followed by a `serverOverloaded` completion; no second `turn/start` in the RPC log.
- `no channel declines at once`: `approval-wait` without `--approval-dir`, exit 6, `offered === false`, `waitMs === 0`.
- `RUNGS`: the `EXIT.ESCALATED` context becomes `escalations: [{ decision: "expired" }]`, and a new context `escalations: [{ decision: "accepted" }]` must fall through to no rung (the "completed turn that tripped no rung exits 0" flow at `:805` gets that context).

`evals/cli.test.mjs`: `--approval-dir` inside `--cwd`, inside `--writable`, inside `$TMPDIR`, relative, and missing are each exit 2 naming the root; `--approval-timeout` without `--approval-dir`, at 0, and at or above `--idle-timeout` are exit 2; both flags appear in `--help` (the flow at `:883` catches an unlisted one); `--help` says what `exit 6` means now. `evals/agent-contract.test.mjs:54` covers the two `cli-only` rows; `:133` and `evals/agent-run.test.mjs:227` move to the new spawn shape (`--approval-dir` present iff the mailbox exists).

`evals/agent-run.test.mjs`: `--new --approvals` makes `approvals/` at 0700 and `--new` without it does not; `--run` passes `--approval-dir` iff the directory exists; `--pending` prints `REQUESTS=0` on an empty mailbox and five lines per open request; `--decide` publishes at 0600 by link, refuses a second decision for one id, refuses an id not in `pending`, refuses after `exit`, and prints `DECIDED=`; `RECEIPT=` carries `approvals=a/d/e` only when the array is non-empty and stays nine lines.

`evals/lock.test.mjs`: `a write run waiting on a decision holds its lock and a peer exits 10 at once` (`approval-wait` with `--approval-timeout 3`, peer launched during the wait).

`evals/orchestrate.test.mjs`: F6 pins the new poll command and the re-arm sentence; F4 gains the exit-6 row's new wording; a new case pins the decision-rule paragraph's load-bearing sentences (the approve list, the never list, "a file write is never an approval").

One live gate, in `evals/fidelity.test.mjs` beside the live turn at `:575-635`, opt-in under `--require-live`: a read agent, `--approval-dir` set, prompt "run `touch <LIVE_PROBE_FILE>` outside `$TMPDIR`; when the sandbox refuses, request approval and then run it"; the harness answers the request with `--decide --accept` when the request file appears; asserts `escalations[0].decision === "accepted"`, exit 0, `receiptOk true`, and records whether `LIVE_PROBE_FILE` exists, which is branch (a) when it does and (b) or neither when it does not. This is the probe and the gate in one file; Opus P1's result decides the section above before it is written.

## Implementation estimate

| File | Change | Lines |
| --- | --- | --- |
| `plugin/skills/codex/scripts/driver.mjs` | two `FIELDS` rows, two flags and their checks, `LIMITS` entry, the offer branch, request/decision/pending writers, the interval, expiry and cut hooks, report fields, rung and help text, retry guard, stderr line | 260–320 |
| `plugin/skills/codex/scripts/agent-run.mjs` | `--approvals` on `--new`, `--approval-dir` in `launch`, `--pending`, `--decide`, `RECEIPT=` token, usage text | 120–150 |
| `evals/fake-app-server.mjs` | two scenarios, decision logging | 60–80 |
| `evals/protocol.test.mjs` | nine cases, two `RUNGS` contexts | 90–120 |
| `evals/cli.test.mjs`, `evals/agent-run.test.mjs`, `evals/lock.test.mjs`, `evals/agent-contract.test.mjs`, `evals/orchestrate.test.mjs`, `evals/fidelity.test.mjs` | as listed | 40 + 80 + 30 + 10 + 30 + 50 |
| `plugin/skills/codex/SKILL.md` | Rights row, `escalations` bullet, exit-6 wording, Reading the result | 25 |
| `plugin/skills/orchestrate/SKILL.md` | the poll command, the three commands, the rule paragraph, the exit-10 sentence, "armed agents run in the background" | 25 |
| `plugin/skills/codex/references/environment-and-internals.md`, `parity.md` | the mailbox, the permission-prompt row | 20 |
| `CHANGELOG.md` | one Unreleased entry | 15 |

About 900–1000 lines. Composition: one Opus write agent for the driver, the launcher, the fixture and the suites in one thread (dependent execution stays in one agent), run offline to green; one Sonnet agent for the pages after the driver's `--help` text is final, since the pins quote it; one Codex Sol cross-reviewer on the driver diff; one Codex Astra refuter given C13–C22 and the diff; the live gate run by the coordinator after the probe lands. Five agents, announced before spawning.

## Alternatives rejected

**A mailbox in `$TMPDIR`.** It is the read level's one writable root and beside the cwd at write level (`--help`, `:305-309`), so the requesting agent could write its own decision; C19 named this and it stands.

**A header ceiling (`APPROVALS: …` or a deadline in the prompt).** A newline is the field separator and the wrapper cannot tell an injected line from its own (`:566-575`, incidents.md, "prompt-file newline injection"); the same boundary already forced `VERIFY` onto the command line. C20 stands; arming and bounding are command-line-only.

**`approvalsReviewer: "auto_review"`.** The server's own subagent approves, the driver never sees a request, `escalations` stays empty, the sandbox object is byte-identical under both settings (`:4030-4034`, measured), and the run exits 0 over an approved escape. It replaces the coordinator's judgement with the model's, which is the opposite of the ask.

**Decline, then resume with wider rights.** It is the existing path and it stays for file writes. As the only path it costs a second turn per request, widens the whole continuation rather than one command, and does not fit a command that is not a right at all: thirteen `arc` reads in a tree the agent may already read need no `WRITABLE:`, and the sandbox denies the arc client for a reason no rights line names.

**A driver-side allowlist (auto-approve `arc show`, `ps`).** It moves the policy into the driver, whose comment says the decision "is the caller's call, not this driver's" (`:2745`), hides it from the coordinator's transcript, and the list would be wrong for the next repository.

**A blocking loop in the dispatcher.** C16: timers, signals and frames stop; a stalled child cannot be reported. The asynchronous wait costs one `Map` and one interval.

**A FIFO or socket between launcher and driver.** Bound to a process lifetime, so the ten-minute rerun and a `-p` session lose the endpoint; files survive both and are what the poll loop already reads.

**Exposing `cancel` as a third decision.** Stop on the card and `SIGTERM` to the pid already interrupt the turn and write the report the run earned (codex `SKILL.md`, Reading the result); a second interrupt path with a different exit code is a second thing to keep true.

**Offering file-change requests.** Every one of the ten on this machine was a read agent trying to write; a write outside the roots is the plan's rights question, and answering it per file at run time is how a read agent becomes a write agent without the user's word.

**Always-on arming from `--run`.** Every unattended run would wait ten minutes per request before today's decline; the opt-in at `--new` keeps 0.20.0 behaviour for every coordinator that did not plan for approvals and costs one flag for those that did.

## Found in passing, for the ledger

- `driver.mjs:2726` says the refusal shapes "are taken from the pinned `schema-<version>/*ApprovalResponse.json`"; `plugins/entrust/schema-0.153.4/` holds `ServerRequest.json`, `ServerNotification.json`, `JSONRPCError.json`, `v1/InitializeResponse.json` and `v2/`, and no `*ApprovalResponse.json` (level 1: `ls`). The file-change decision enum is therefore not pinned in the tree at all; `codex app-server generate-json-schema` on 0.155.1 produces the ten `*Approval*.json` files and they match the pinned tokens.
- 00-scouting.md counts "1 nested `codex sandbox` launches"; 00-escalations.md lists two (round04-astra, round07-astra), and the "5 other" is then four. Level 1.
