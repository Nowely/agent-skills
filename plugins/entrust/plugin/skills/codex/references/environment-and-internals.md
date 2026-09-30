# Environment and internals

Moved out of `SKILL.md` because none of it is needed at the moment of deciding *whether* and *how* to
delegate — the recipes at the top of that file cover the decision.

The canonical flag inventory lives in `node "${CLAUDE_SKILL_DIR}/scripts/driver.mjs" --help`, with the rarely needed flags and the environment table under `--help-all`. This file
explains environment, state, wrappers, operational bounds, and lifecycle details behind those flags.

## Contents

- [Environment](#environment)
- [Observability](#observability)
- [Approval mailbox](#approval-mailbox)
- [The answer log, and what --brief does not deliver](#the-answer-log-and-what---brief-does-not-deliver)
- [What is protected, and what is not](#what-is-protected-and-what-is-not)
- [The isolated home](#the-isolated-home)
- [Prompt files and wrappers](#prompt-files-and-wrappers), with [The injection limit](#the-injection-limit)
- [Bounding or stopping an agent](#bounding-or-stopping-an-agent)
- [Receipt validation and reporting](#receipt-validation-and-reporting)
- [Worktree ledger and destination](#worktree-ledger-and-destination)
- [Lock design](#lock-design)
- [Git-directory grant](#git-directory-grant)
- [Configuration key oracle](#configuration-key-oracle)

## Environment

The variables, the subdirectories of the state directory `<state>` stands for below, the order the driver
resolves it in, and what `TMPDIR` grants a read agent are all under `--help-all`. There is no default: the
intended value is the plugin's own data directory, which the skill recipes pass on every call. `<state>`
must also be absolute.

`$TMPDIR` is the run's own directory, made fresh at 0700 inside the system's temporary directory (what
Node's `os.tmpdir()` returns for the driver's environment), never your whole one: a report at
`<state>/<rel>/report.json` gets `<tmp>/entrust/<rel>`, and a run with no report under `<state>` gets
`<tmp>/entrust/runs/<startedAtMs>-<pid>`; the report names it as `tmpDir`, it outlives the run, and the
driver never removes it: it stays until the system clears its temporary directory or `/entrust:cleanup`
removes it with its run. What `--help-all` does not carry: the agent's shell also receives `TMPPREFIX` under
the run's `$TMPDIR`, because zsh keeps here-document temp files at `$TMPPREFIX*`, default `/tmp/zsh`,
which no grant covers ([incidents](incidents.md#here-documents-under-the-grant)).

## Observability

`threadId` is printed to stderr as soon as the thread exists — tail the live rollout under
`~/.codex/sessions` during a long turn. A run that fails before `thread/start` (bad arguments, a held
lock, a sandbox assertion) prints none, because there is none.

The report's `tokenUsage` carries the server's own accounting for the ROOT thread; Codex's own subagent
threads are not included. `total` is the root thread's token use for the current turn, per turn as of
codex 0.153.4 (measured 2026-09-15); to cost a thread, sum one report per turn. `last` is the most recent
**API request**, not the whole turn — measured on a rollout, one turn emitted `last: 13584 / total: 13584`
then `last: 14273 / total: 27857`, so `last` is only the turn's tail.

The report's `escalations` array has one entry per approval request, whichever thread asked — not only the
ones the driver declined: `id`, `method`, `kind`, `detail`, `thread`, `subagent`, `agentPath`, `cause`
(`rights`: a file change the writable roots cover, which the driver accepted itself and never shows anyone;
`outside`: a file change not shown to lie inside them, or a permissions request, which the driver declined
itself, its `why` naming `WRITABLE:` for a file change and "rights are set at launch" for a permissions
request; `asked`: Codex asked before running the command, and nothing on our side changes it), `offered`, `decision`
(`accepted`, `declined` or `expired`), `by` (`driver` for an auto-yes, an expiry or a request never offered,
`coordinator` otherwise), `why`, `askedAt`, `settledAt`, `waitMs`, `resolved`, `outcome` (the matching
item's own completion, or null where none came), `cwd`, `reason` and `fileChanges`. `detail` is the server's
own wording whole — the command, else the reason, else the message, or the joined file-change list — never
clipped, and may still be empty where it sent none; a sandbox-denied command need
not raise a request, so an empty array does not prove that no command was denied. An entry does not diagnose
rights that were too narrow. Exit 6 means a request was declined or expired unanswered, never one accepted;
a cut run can carry entries and still exit 3. Beside the array, `approvalsAccepted`,
`approvalsAutoAccepted`, `approvalsStale` and `approvalsLate` count what their names say,
`approvalsDuplicate` counts a request id the server sent twice — the driver answers it once and the report
counts the repeat, not a second request.

Under an output schema, `schemaOverflow` is null unless the answer broke a size cap, and then
`{completeAnswerPath, clipped}`: the file holding the whole answer and each field cut, with its path, cap and
length; `answerAttemptPaths` lists the file of the first answer a corrective turn for size replaced.
`turnError` is the server's error for a turn that did not complete, its `codexErrorInfo` and `message`, or
the driver's own `aborted` or `crashed` in that shape; the launcher's `ERROR=` line falls back to it when the
report has no `error`. With `turnStatus: null` no turn ran and the reason is in `error` and the driver's
stderr, `DIR/err.txt` under `--run`; a `threadId` beside it means the thread had started and its rollout is the
only record.

An auto-yes carries `why: "rights cover it (checked as the answer was sent)"`: every component of the
resolved path between the writable root and the file must be an existing plain directory, never a symlink,
and the file itself regular or not there yet, with nothing under a `.git`, `.codex` or `.agents` directory
in any spelling — matched by inode and by a case-folded name, so `.Git` and `.GIT` are caught too — and the
whole check runs again, fresh, at the moment the driver sends the answer, not only when the request first
arrived. A writer that swaps one of those plain directories for a symlink between the driver's check and
the server's own write is followed by the server, not the driver; whether the server re-resolves that swap
before it writes is unmeasured.

## Approval mailbox

Every agent gets one: `agent-run.mjs --new` makes `<DIR>/approvals` beside the prompt for every launch, no
flag needed, and `--run` always hands the driver `--approval-dir` for it. `--approval-dir D` has to lie
inside the driver's own state directory, and so does `--report-file` beside it: `--new` checks both paths
strictly inside that directory before the agent's directory even exists, and refuses without the state
directory in `ENTRUST_STATE_DIR` or `CLAUDE_PLUGIN_DATA`; it also refuses a mailbox placed under one of the
driver's own subtrees there —
`home/`, `locks/`, `answers/`, `jobs/`, `worktrees/` or `pasted/` — or under `<tmp>/entrust`, where every
run's `$TMPDIR` is; `reports/<run>` and an orchestrate run directory are both fine, being neither. The
driver also refuses any writable root that is, or is an ancestor of, the state directory or `~/.codex` —
the inverse of the ancestor walk [Only those are protected](#what-is-protected-and-what-is-not) already
runs — so no sandbox the driver grants can reach in and write a decision itself. `D/owner.json` claims the
mailbox by `link(2)`; a second driver over the same `D` exits 2 whether that owner is alive or has ended,
so `D` serves one driver, ever, and each launch gets a `D` of its own. A request the
mailbox itself cannot write — its file, or its entry in `pending` — is settled at once as expired,
`why: "mailbox write failed: <error>"`, and an accept reaches the server only after that settlement record
landed; a request's own `settled` object then carries `decisionFile`, what the decision file held as it
settled: `taken`, `none`, `stale` or `late`. A subagent thread's request is offered, and its file change
auto-accepted, only while that thread's own turn is still open: once it closes, a further request from it
is declined at once, `why: "turn ended"` for one whose turn had been open and closed, `"not the current
turn"` for one from a turn never open at all. A request nobody answers waits on the single clock the driver
keeps for it, `LIMITS.APPROVAL_TIMEOUT_S`, a constant at 1800 seconds (thirty minutes, not a flag: nobody
could say who would set it or why the default could not decide) — a safety net for a run nobody attends, not
a policy choice, and the idle guard is paused for as long as any request stays open so the two clocks never
compete. `--run` can hand a pending request straight back instead of waiting on it: see the codex page's
`--new`/`--run` recipe and the launcher's own `--help`.

Codex delegates to subagent threads of its own whenever the model chooses to, at any effort. Measured on
0.153.4 a child never sends `thread/started` to the client: the ROOT announces it as a `subAgentActivity`
item carrying the child's `agentThreadId` and `agentPath`, before the child's first turn (one idle
`thread/status/changed` under the child's id can precede the announcement and is ignored), and the child
then sends everything else (its status changes, its turn, its items, its usage) under its own thread id.
The driver registers a child from that announcement, and from a `thread/started` carrying a
`parentThreadId` where a server still sends one (`agentPath` and `status` are null there). The report
lists them as `subagentThreads: [{threadId, agentPath, status, items, commands}]`. That buys liveness and
visibility, never evidence: a child's events rearm the idle guard, so a long delegation is not cut as
silence, while the commands that count as evidence and the tokens that are the accounting stay the root's.
A root that ran nothing is still exit 5, and the cause then names the children: `no command ran on the
root thread; N subagent thread(s) ran (<agentPath list>, <n> commands): liveness, not evidence`.

## The answer log, and what --brief does not deliver

Saved answers are `<state>/answers/<threadId>-<startedAtMs>.md`, `startedAtMs` the run's start in epoch
milliseconds, so a `--resume` leaves the earlier turn's file in place; the turn diff and the worktree
harvest stay named for the thread. They are pruned on the same age and
count bounds as the rest of the state directory (14 days, 400 entries); `--brief` clips the inline copy at the driver's `BRIEF_LINES` and
`BRIEF_BYTES` limits, 20 lines and 4000 bytes, **including** the "clipped" marker. `answerPath` is null
when there was no answer or the write failed, and `answerTruncated: true` beside `answerPath: null`
means the full text survives only in the rollout. Under `--brief` the model is ALSO asked to answer short and to park
evidence in `$TMPDIR` files — detail it never generated inline is not in `answerPath` either, which is
why a run whose working note you need should not be `--brief`.

`--attach` files go BEFORE the prompt text — the layout a pasted turn has — and every attachment is
checked before the turn, so a typo costs nothing.

## What is protected, and what is not

At write level every root the agent may write — `--cwd`, each `--writable`, and the tree a `--worktree`
lands in — refuses `~/.codex` and the resolved state directory, and anything inside them, by inode
identity. The first holds the receipts an agent is verified by, the second this driver's locks and answer
log. The run's own `$TMPDIR` takes no such check, wherever the system's temporary directory lies: it is a
directory the run has just made, empty, which grants nothing beside itself ([Environment](#environment)).
The driver also refuses your
home directory itself and every ancestor of it, up to `/`.

**Only those are protected, and what is above them.** The guard also refuses a candidate that is `~/.codex`
or the state directory itself, or an ancestor of either (E66): `~/.claude` is refused on a plugin install,
whose state directory sits under it, while `~/.ssh`, `~/.aws`, `~/Library` and the rest of your
home remain legitimate write roots as far as the driver is concerned. It stops you handing over
*everything* above what it protects; it does not curate what inside your home is precious otherwise.
Choose the blast radius deliberately.

## The isolated home

Unless `--host-home` is given, a run uses a private `CODEX_HOME` at `<state>/home` — one
directory shared by every run on the machine, not a fresh one per turn, because the caches and
databases codex keeps there are what make an isolated run faster than a host-home one. The caller's
plugins, skills and MCP servers stay out of the turn, and no trust records are written back.

For an isolated run, `auth.json` and `sessions` are symlinked from the `~/.codex` in your home
directory, whatever `CODEX_HOME` says; the rollout receipt lands there too, at `receiptPath`. Check that
account with `CODEX_HOME=~/.codex codex login status`.

Configuration is separate: it comes from `config.toml` in the home `CODEX_HOME` names, or from
`~/.codex/config.toml` when the variable is unset. The driver carries `model`,
`model_reasoning_effort`, `personality`, and `service_tier` into the private home through
`config/read` rather than parsing TOML. A failed probe warns, retries once, and keeps the last known
good config. A probe cancelled by a signal also fails, and an ending run writes nothing there.
`configInherited` reports `probe`, `last-known-good`, or `none`, with carried keys; the report also
carries `codexVersion` beside `codexVersionPinned`. No MCP server of the caller's is carried into it: an
agent that needs them runs `--host-home` and accepts the rest of the host configuration with them.

Because that file is shared, isolate test harness state with `ENTRUST_STATE_DIR`; concurrent
writers use atomic rename.

## Prompt files and wrappers

An agent is one driver process, launched by the coordinator itself. A wrapper is useful only when it adds
orchestration; whatever it is, it hands the prompt over unchanged, never answers the task itself, and
reports a failure as the failure it is.

Wrappers write ONE file: a header of `FIELD: value` lines, then the prompt. The driver caps the file's
size and exits 2 past it, naming the byte count. The header grammar — where it ends, which names open the
body, what an unknown name costs — is in `--help`; everything below the header is the body, verbatim, even
when a later line looks like a field.

`RIGHTS`, where it appears, must be first; a header that declares none — with or without other fields — is
a read agent in the current directory. A file with no body leaves the prompt to stdin or `--prompt`;
providing both is exit 2. Explicit command-line flags override file fields, and `promptFileFields` reports
the declared fields in their original order. The complete field list is in `--help`.

The format avoids constructing a shell command from relayed values: an injected quote stays literal
instead of becoming flags. Attachments, the bounds and `--report-file` remain command-line-only because
an injected field could otherwise upload, truncate or redirect a run that the user never named. A header
naming one exits 2 and names the flag to use.

The refused names, and the flag each must be passed as instead, are listed under `--help-all`. Boolean
fields take `yes|true|1` and `no|false|0`, and omitting the line leaves the field's own default. That
default is off everywhere except `NETWORK:`, where it is egress: `NETWORK: no` denies the sandbox its
network and an absent line grants it, so dropping that line is the opposite of writing it, not a
shorter way to write it.

### The injection limit

A newline is a field separator. Require `RIGHTS` first and refuse `VERIFY` unless the harness explicitly
passes command-line `--allow-prompt-verify`; a wrapper cannot distinguish an injected field from an
intended one. The measured failure is recorded in
[incidents.md](incidents.md#prompt-file-newline-injection).

`VERIFY` is refused from a prompt file unless the harness supplies `--allow-prompt-verify` on the command
line, because verification runs an unsandboxed `/bin/sh` with the coordinator's rights. Prefer passing
`--verify` explicitly rather than allowing a relayed value to introduce it.

## Bounding or stopping an agent

`--timeout`, `--idle-timeout` and `--max-commands`, their defaults and what each cut looks like are in
`--help` under Bounds; the report file and the signal contract are under Run. What help does not say:

- There is no token budget. `tokenUsage` in the report is the server's own accounting, not a bound, and
  `--brief` controls answer size and context consumption without stopping a turn.
- The bounds are command-line-only because their defaults let an agent run with no sizing header at all.
- `--report-file` is validated off the raw command line before the prompt file is expanded and before
  anything is spawned: an absolute path, a writable parent — created at 0700, all the way down, when it
  is absent — and a name that does not exist yet. Cleanup lists the standalone recipe's
  `<state>/reports/<run>` directories: a published run is selectable by number but never proposed, and
  an unpublished run or one held by a live agent is kept. Any other destination remains the caller's.
- A second signal escalates teardown, while `SIGKILL` of the driver can strand descendants. In the
  sub-second window before a turn id exists there is nothing to interrupt: the run exits 4, and the
  pre-turn refusal still reaches `--report-file`. When a worktree was already made, that report also
  carries `worktreePath` and `worktreePreserved`: the reason it was kept, or `null` where it was removed.
- The job record's `endedAt` is written only after the report has landed. Before then a live recorded
  pid means running and a dead one means crashed.
- Under `--run`, `DIR/exit` is written by the detached keeper from the driver's own exit status, and the two
  ways it can end differ: on `SIGTERM`, `SIGINT` or `SIGHUP` the driver's own handler catches the signal, cuts
  the turn and exits with its own chosen code — 1 once a thread exists, the turn `interrupted` — so the
  marker holds that code, never the signal; only an uncatchable signal (`SIGKILL`, a crash) bypasses the
  handler entirely and leaves the keeper computing 128 plus the signal number for the marker (137 for
  `SIGKILL`), and a request still open at that moment is left `ORPHANED` in the mailbox, which `--pending`
  reports once the marker exists.
- To stop an agent, stop its wrapper — Stop on the agent map or `TaskStop` — or `kill -TERM` the pid on the
  driver's pid line in `DIR/err.txt`, `entrust: pid=<n> identity=… reportPath=…`: the driver cuts the turn,
  sweeps the codex app-server's own process group and publishes the report as `turnStatus: interrupted`, exit 1.
  A command the agent was running inside the sandbox ends with it (measured once, 2026-09-29); a command run
  after an approval, outside the sandbox, has not been measured, so before a second writer enters a directory
  where a command was approved, run `pgrep -fl '<the approved command>'` yourself and wait for it — no driver
  code checks this for you.

## Receipt validation and reporting

Demand `threadId`, `exitCode`, and receipt state from every wrapper: an agent that did nothing is otherwise
indistinguishable from one that found nothing. The driver searches `~/.codex/sessions`, opens the rollout,
and verifies that its opening `session_meta` record names the reported thread. Thus `receiptOk: true`
proves that a session record exists for that id, not merely that a filename contains it.

The provenance fields `--help-all` lists under Report come from that record; `receiptWhy` explains why
validation failed. Treat `receiptOk: false` on a claimed success as a red flag. A process able to
fabricate the whole report can fabricate these fields too, so inspect the rollout directly when the
answer warrants stronger assurance.

These fields are coordinator instruments, not normal user-facing narration. Return the attributed answer
and mention ids, codes, or receipt state only when the agent failed or returned nothing, a claimed-success
receipt is false, the delegation machinery itself is under audit, or the user needs an id for `--resume`.

## Worktree ledger and destination

Each `--worktree` run creates a unique tree under `<repo>/.claude/worktrees/` and writes its ledger entry
in `<state>/worktrees/` before `git worktree add`; a ledger it cannot write refuses the run
before the tree exists. It rewrites the entry with the base commit, and an unreadable base refuses the
run before Codex starts. The next worktree run reconciles crashed entries oldest first, at most fifty: a
gone tree drops its entry, a dirty one remains and is named, a clean one is removed only after commits at
its HEAD get `refs/entrust/<name>`, and an entry that cannot be parsed is quarantined as
`<name>.json.bad` rather than deleted, so the tree it named survives with it. A preserved tree keeps
`state: "preserved"` and is later handled on the same terms once its owner is gone. The destination
guard prevents a `<repo>/.claude` symlink from escaping the repository's implied path.

Job records retain repository, base, diff, and untracked-archive paths so `--worktree --resume` can
rebuild content; a harvest that takes nothing removes the diff and untracked archive an earlier turn of
the same thread left under those names, and says so. Lock and ledger records also retain the app-server
process group and are reclaimed only when both it and the driver are gone.

A tree is preserved, and `worktreePreserved` says why, when the turn did not complete, when `git status` failed
in it, when it holds changes and the harvest failed, when `git worktree remove` refused, or when the run was cut
or refused before its turn with the tree already made; `worktreePath` is the path the run named, and
`worktreePreserved` is `null` where it was removed. A `git worktree add` that failed over a destination already on
disk names that destination, which is not a tree this run made; a `--resume` rebuild that could not finish tries
to remove its half-restored tree and reports `null` where it did, or the refusal where git kept it. A preserved
tree is not a harvest: `worktreeDiffPath`, `worktreeUntrackedPath` and `worktreeCommitsRef` can all be null, so
the landing recipe has nothing to apply. The tree itself is the artifact, at `worktreePath`; read it, take what
is worth keeping, then remove it with `git -C <repo> worktree remove --force <path>`, which the report written
after the turn carries ready to run as `worktreeRemoveCommand` and a pre-turn refusal's report does not.
Removing it discards whatever was never harvested.

## Lock design

At `--level write` the driver takes an exclusive lock keyed on the cwd. A second run in the same directory
exits 10 rather than racing the first one's edits, tests and cleanup. Resuming a thread whose turn is still
open exits 10 as well: its old events would otherwise satisfy the new invocation while the new prompt was
never consumed.

The lock lives in `<state>/locks/` (a state directory moved elsewhere relocates all of this driver's
state, so two runs under different values do NOT exclude each other), **not**
in the directory it protects — a lock inside the cwd
gets staged by a turn running `git add -A`. It is keyed on the directory's
identity (`dev:ino`), not on how the path was spelled, so a symlink, a rename or a case-variant cannot
produce a second lock for one directory. The lock is two entries: `<key>.lock`, a symbolic link created
exclusively, and the owner file it names beside it, `<key>.lock.<32 hex>.owner`, mode 0600. The owner file
holds the pid, a **second identity** for that pid (its
process start time, from `ps -o lstart=` or `/proc/<pid>/stat`), the cwd it locks, a start time and, once
the app-server runs, its process group. A pid
alone is not an identity: lock files outlive reboots and `SIGKILL`, so a recycled pid otherwise makes a
directory busy forever. A mismatched identity is stale; one that cannot be read proves nothing, so the
lock is honoured. A release removes both. When it cannot take the reclaim marker, or its owner file is not
the one it made, it leaves what it could not verify and says so on stderr; a link left naming nothing is
reclaimed by the next run in that directory, and the link of a directory no run comes back to, such as a
finished `--worktree` tree, stays.
The lock's exit-10 messages differ: a live holder's names the link and says to leave it; a gone driver
whose codex group still runs names that group and the `kill` that stops it, not the files; an owner file
whose body does not parse is named with its link, and both may be removed only when no run can be using
the directory; a lock that keeps changing hands names the link. Deleting the
link by hand while its holder lives lets a second run into the directory and leaves the holder's owner
file named by no link. `/entrust:cleanup` removes a released
link, a lock whose holder is gone together with its owner file, and an owner file no link names once its
run is gone. `$TMPDIR` was rejected as a home
for it: it is a mutable environment variable, so two runs on one cwd under different values would take two
different locks and both proceed, and it is the one place a `--level read` turn can write.

Reclaiming a stale lock is serialised by its own marker, and liveness is re-checked under it. Without
that, a run that judged the *stale* lock dead could arrive late and delete the *fresh* lock that had
replaced it ([measured](incidents.md#stale-lock-stampede)).

That marker is abandoned when its **owner** is gone: liveness, not a clock, ends it, and one mtime
backstop survives for the case where the pid is more likely recycled than stalled. The driver's comment
at that code carries the two ways a deadline got it wrong.

Update and release act only on what the run made. The owner file is told from any other file put at its
name by the `dev:ino` it had when it was published, and the run keeps it open throughout, so no other
file can be given that number meanwhile. The update, which records the app-server's process group, writes
through that open file and renames over no path, so a file put at the owner file's name is left as it
was. A reader can catch that body mid-write: an owner file whose body does not parse is left alone,
asked again, and the run refused with exit 10, never reclaimed. The release takes the reclaim marker,
checks that the link still names this run's owner file and that the owner file is still the one it made,
then unlinks the link and the owner file. Under the marker no run that follows these rules can remove the
link or make one for the marker's hour (the backstop after which a marker is taken over regardless), so the check
and the unlinks cannot be split by one within it; a process that ignores the marker
still can, because POSIX has no unlink that names an inode. On a mismatch the run says so on stderr and
leaves both where they are.

The lock covers the whole run, not just the turn: the job record is written and read inside it. The
isolated Codex home is written
**before** the lock: its config probe is a second process, and holding a write lock across it made an idle
directory report exit 10. Concurrent writers there are safe by atomic rename, not by the lock. Lock
records carry the app-server process group; a stale lock is reclaimed only when both driver and group are
gone.

The lock is released **after** the driver has waited its child process group out — SIGTERM, a short bounded
wait, then SIGKILL and a shorter one — so a next writer does not walk into a directory where the previous
run's test servers are still dying. A completed `--worktree` turn quiesces that group even earlier,
before the tree is harvested and removed, so a command the turn backgrounded cannot still be writing
into the bytes being archived. That wait is bounded: a group member alive after that wait
does not hold the lock any longer, and a driver killed with `SIGKILL` releases nothing at all
(the next run reclaims the stale lock after finding its pid dead). It still serialises invocations
rather than directories. What it does not cover at all is a shared scratch directory being deleted out
from under a run by other work on the machine; give every concurrent run its own uniquely named cwd.

## Git-directory grant

There is none by default, so an agent cannot commit under the grant a `RIGHTS:` line makes: committing needs
the main clone's common dir. Measured in a linked worktree whose main `.git` was read-only, `git commit`
fails at `Unable to create '.../worktrees/<name>/index.lock': Permission denied`. An agent's work comes
back as `worktreeDiffPath` and its untracked archive; `worktreeCommitsRef` is populated only where the
caller's own `--verify`, which runs unsandboxed, committed.

`WRITABLE: <repo>/.git` re-grants the common dir — it is the grant the retired `--commit` made, and
`checkRoot` accepts it — so it is a widening to settle with the user like any other, because it hands the
agent config, hooks and every ref. That a commit then succeeds is unmeasured on the 0.153.4 pin: 0.10.0
measured it under `--commit`, and nothing since.

A narrower grant was measured and **rejected** before that, so do not reach for one. Whitelisting
`{worktrees/<name>, objects, refs, logs/refs}` does let `git add` + `git commit` through for a linked
worktree on the `files` ref backend, but it breaks `git branch -D` and `git tag -d`
(`packed-refs.lock` sits at the `.git` root), breaks `git gc`, prints
`error: Unable to create '.../packed-refs.lock'` on every commit, and cannot be applied at all to a
reftable repo or to a main worktree, where `index.lock` and `COMMIT_EDITMSG` live at the root. It also
breaks any pre-commit hook that stashes (lint-staged runs `git stash`, which needs `refs/stash` at the
`refs/` root). `workspace-write` has no deny-list, so "grant `.git` but not hooks and config" cannot be
said with writable roots at all: it needs a permissions profile. Land a diff instead, or point
`--level write --cwd` at a worktree of a throwaway clone and settle that blast radius with the user.

The driver's own git is not exposed to what an agent writes in the tree it was given. Every git it
spawns carries
`-c core.fsmonitor=false -c core.hooksPath=/dev/null -c diff.external=`, every diff adds
`--no-ext-diff --no-textconv`, and each call has a bounded timeout with `SIGKILL`. Without that,
harvest, worktree removal, and the next checkout ran the agent's hooks, fsmonitor, and external diff with
the caller's rights before anyone read the report. This does not protect the agent's own commands or
`--verify`, which run with the rights granted to them.

## Configuration key oracle

Misspelled config keys are swallowed silently by both `-c` and the app-server. `tools.web_search` is a real
key that looks like the web-search switch and does nothing; the actual one is top-level `web_search`, which
the driver sets to whatever `--web-search` asked for and to `disabled` only when the flag is absent.

**There are two config surfaces, and this oracle covers one.** The `-c` payload carries the per-run
keys the driver assembles (web search, the read profile, effort, sandbox settings). The isolated home's
`config.toml` carries the inherited keys ([The isolated home](#the-isolated-home)). A key destined for
that file has to be validated by putting it in a config.toml and starting codex under
`--strict-config`, not with `-c`.

Validate any new `-c` key offline first:

```bash
codex exec --strict-config -s read-only --skip-git-repo-check -C /tmp \
  -c model_provider=zzz_nonexistent -c <KEY>=<VALUE> 'x'
```

`unknown configuration field` means the key is wrong; `Model provider ... not found` means it was accepted.
A third answer exists: an error naming the key and complaining about its *contents* — `data did not match
any variant of untagged enum WebSearchToolConfigInput in 'tools.web_search'` — means the key is real and
the value is wrong.

**The oracle is blind inside `permissions.<profile>.*`, which is exactly where this skill's newest patch
lives.** Measured:

```
-c 'permissions.foo.extendz=":read-only"'  -> Model provider ... not found      (ACCEPTED — and wrong)
-c 'web_serch=disabled'                    -> unknown configuration field       (caught)
-c 'default_permision="x"'                 -> unknown configuration field       (caught)
```

A misspelled field inside a profile survives `--strict-config` and silently drops what it was meant to
grant, while the profile still applies under its correct id:

```
-c 'permissions.pX.filesystem={":tmpdir"="write"}' -P pX  ->  TMPDIR_WRITABLE
-c 'permissions.pY.filesysten={":tmpdir"="write"}' -P pY  ->  TMPDIR_DENIED
```

This is why the driver's read-level assert checks the **effect** as well as the name. It requires
sandbox type `workspaceWrite`, the network access that was asked for, `excludeSlashTmp` true so `/tmp`
is not writable beside `$TMPDIR`, and the cwd present in `runtimeWorkspaceRoots`. It also requires
`writableRoots` equal to exactly `[$TMPDIR]`, the run's own directory, never the cwd, with paths
canonicalised on both sides. The
profile id is asserted first, but a name-only check passes in both cases above; verified live,
introducing exactly this typo now exits 4 before any model turn. Check a profile the same way yourself:

```bash
codex sandbox -c 'permissions.entrust_read.extends=":read-only"' \
  -c 'permissions.entrust_read.filesystem={":tmpdir"="write"}' \
  -c 'permissions.entrust_read.network={enabled=true}' \
  -P entrust_read -C /tmp -- /bin/sh -c \
  'printf x > "$TMPDIR/p" && echo TMPDIR_OK; printf x > /tmp/p 2>/dev/null && echo SLASHTMP_LEAK;
   curl -sS -o /dev/null -w "NET_%{http_code}\n" https://example.com || echo NET_DENIED; true'
# expect TMPDIR_OK, no SLASHTMP_LEAK, and NET_200.
# TMPDIR_DENIED -> the grant stopped applying; read-level vitest is broken again.
# SLASHTMP_LEAK -> ":read-only" widened upstream; re-check what else the profile now grants.
# NET_DENIED   -> the `network` table stopped applying, and every read agent is silently offline.
```
