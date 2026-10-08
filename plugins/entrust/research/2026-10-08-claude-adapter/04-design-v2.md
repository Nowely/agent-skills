# Design v2: the claude adapter's external run

v1 with every round-1 finding taken ([rounds.md](rounds.md)). Paths under `plugins/entrust/plugin/skills/`; "C1.n"
is the critique's finding n, "Pn" a probe.

## 0. A commit before the adapter: what every external driver shares

`orchestrate/scripts/drivers.mjs` takes, moved and not rewritten, from the OpenCode adapter: the exit-code table,
the request-id shape, the RIGHTS grammar (`parseRights`, `planWritesToRights`), and the worktree code
(`makeWorktree`, `worktreeFacts`, its `git` helper). OpenCode's `contract.mjs` and `driver.mjs` import them from
there, so OpenCode's suite passes unchanged. The Codex driver keeps its own copies (its exit names differ, its
numbers do not); that and OpenCode's bare-`git diff` facts (C1.10) are ledger entries. (C1.10, C1.11)

## 1. Files of the adapter

| File | What it is |
| --- | --- |
| `claude/scripts/driver.mjs` | runs one `claude -p` and publishes the report |
| `claude/scripts/approvals.mjs` | the stdio MCP server Claude Code starts for `--permission-prompt-tool`: the mailbox's only writer |
| `claude/scripts/launch.mjs` | driver path, short names, `prepare` (the plan's pins), the typed request `claude.permission` |
| `claude/scripts/agent-run.mjs` | the entry to the shared launcher, as OpenCode's |
| `claude/scripts/status.mjs` | passive status; `outdated` below Claude Code 2.1.259 (`--permission-prompts`) |
| `claude/adapter.json` | adds `status`, `launcher`, `launch`, and `swarm` with `briefModel` and no `concurrency` (C1.Q4) |
| `claude/references/external.md` | the recipe for a coordinator on any host, including how to decide a `claude.permission` request |
| `plugins/entrust/evals/claude.test.mjs`, `fake-claude.mjs` | the suite and a fake `claude` |

Also changed: the launcher (§6), `orchestrate/references/proxy.md` (the claude adapter's request procedure beside
the others, C1.14), `agents/proxy.md`'s description, `claude/SKILL.md`'s description and one section,
`agent-contract.test.mjs` (the new driver's strings, C1.3c), `run-all.mjs` and the README's row.

## 2. The prompt

As v1: `RIGHTS` (first), `MODEL`, `EFFORT`, `OUTPUT_SCHEMA`, `RESUME`, `SAFE_MODE: yes`, then `TASK:`.
`--check-prompt-file` is silent with exit 0 on a pass and prints one `entrust: refused: <reason>` with exit 2 on a
refusal (C1.3c). It refuses, offline:

- a `MODEL` or `RIGHTS` that differs from the plan's pins (`ENTRUST_PLAN_MODEL`, `ENTRUST_PLAN_WRITES`, set from
  `backend.json`, which `prepare` writes; C1.8). The plan pins an alias; `MODEL:` matches it exactly.
- a `RIGHTS` directory, or a worktree's repository, that contains the state directory (C1.1);
- `RESUME:` that is not the absolute path of an earlier claude report, or whose report is not final (C1.5);
- with `SAFE_MODE: yes`, nothing more: the run has no mailbox (P6), and `--check-prompt-file` passes it.

`RESUME` names a report, not a bare session id: the report carries the session, the directory, the worktree and
the rights a continuation must keep (C1.5). A continuation runs in that report's directory, with
`--resume <its session> --fork-session --session-id <new uuid>` (P7), so two continuations of one report never
write one session file; a `RIGHTS` wider than the report's is refused. A report still being written (its claim
stub, no `exitCode`) is a live run: exit 10, busy.

## 3. Rights

| `RIGHTS` | Working directory | `--permission-mode` | `--tools` |
| --- | --- | --- | --- |
| `read [dir]` | `dir`, else the caller's | `manual` (C1.13) | `Read,Grep,Glob,Bash` |
| `write <dir>` | `dir` | `acceptEdits` | `Read,Grep,Glob,Bash,Edit,Write` |
| `worktree <repo>` | a detached worktree from `drivers.mjs`, under `<state>/worktrees/<invocation>` | `acceptEdits` | as `write` |

Every run also gets `--disallowedTools "Edit(<state>/**)" "Write(<state>/**)"`: a deny rule outranks any allow
rule (C1.1). What still reaches the state directory is a Bash write, which prompts unless the user's own allow
rules cover it: the risk decision 3 accepts, stated on the page. The Agent tool and the web tools stay out (C1.Q3).

## 4. Approvals

With `--approval-dir` and without `SAFE_MODE`, the driver writes an MCP config naming `approvals.mjs` as
`entrust-approvals`, `timeout` 1,860,000 ms (31 minutes; load-bearing, P8b), and passes
`--permission-prompt-tool mcp__entrust-approvals__decide`. Otherwise it passes `--permission-prompts none`, and
a run that was denied something for want of a mailbox exits 7 (needs input).

The server is the mailbox's only writer (C1.2). Its identity comes from its environment: the driver's pid, the
run's `startedAtMs`, the mailbox path. For each `tools/call`:

1. It makes `<seq>-<8 hex>.request.json` (temporary file and rename, C1.3e) with `run: {pid, startedAtMs,
   turnId: null}` (C1.3b), `cwd` the run's directory, `roots`, `deadlineAt` 30 minutes on, `settled: null`, then
   rewrites `pending`. A `Bash` call whose input keys are within `{command, description}` is a command request:
   `command` the command, `reason` the description, `method` `Bash`, `cause` `asked`. Any other call, a `Bash`
   call with `timeout` or `run_in_background` included, is a typed `claude.permission`: `payload`
   `{tool_name, input}`, `presented` its two-space JSON, `requestHash` its SHA-256 (C1.6).
2. It polls for `<id>.decision.json` every 500 ms and takes one whose identity fits (id, run, and for a typed
   request the hash).
3. It settles the request, `settled: {decision: accepted|declined|expired, by: coordinator|driver, why,
   settledAt}` (C1.3a), rewrites `pending`, and answers `{behavior: "allow", updatedInput: <the input as
   offered>}` or `{behavior: "deny", message}`.
4. On `notifications/cancelled` for a call (P8b), past the deadline, or on stdin's end or a signal, it settles
   each open request `expired` by `driver` and exits on the last two.

The driver reads the mailbox only to list `escalations` in the report. A server killed outright leaves its open
requests open; once the launcher's `exit` marker exists they read as orphaned, as for any driver.

## 5. The run and the report

As v1, with:

- the environment handed to `claude` is the launcher's minus the variables that bind a process to a parent Claude
  Code session: `CLAUDECODE`, `CLAUDE_CODE_ENTRYPOINT`, `CLAUDE_CODE_CHILD_SESSION`, `CLAUDE_CODE_SESSION_ID`,
  `CLAUDE_CODE_MESSAGING_SOCKET`, `CLAUDE_CODE_MESSAGING_TOKEN`, `CLAUDE_PID`, `CLAUDE_EFFORT` (C1.7). The
  driver's spawn of `claude` is its one owner. Authentication and provider variables pass.
- the report's fields the launcher and the proxy read: `adapter`, `exitCode`, `error`, `turnError`,
  `schemaOverflow`, `answer`, `answerJson`, `answerPath`, `turnStatus`, `receiptOk`, `model`,
  `approvalsAutoAccepted` (C1.3d); the claim is a stub, the final report replaces it by rename.
- `turnStatus: interrupted` only when the driver sent SIGINT (C1.12).
- exit codes: 0; 1 when `result.is_error` and the driver did not stop it; 2 usage; 3 timeout; 4 transport
  (`claude` missing, killed, no `result`); 6 a request declined or expired; 7 a prompt with no mailbox; 8 no
  answer; 10 busy; 13 no `structured_output` (C1.11).

## 6. The launcher

Three changes (C1.9): the set of plan-row adapters becomes `native` plus every planned adapter with a launcher,
hoisted to one constant that `--help` prints too; the `AGENT=` line names the adapter when it is not native. A
five-column `opus` row stays native; a six-column `claude` row is external.

## 7. Tests

As v1, plus: `--check-prompt-file` refusals (plan pins, the state directory inside RIGHTS, RESUME of a live report);
the server's cancellation and end-of-stdin settlements; a `Bash` call with `timeout` offered as `claude.permission`;
the environment strip; `SAFE_MODE` without a mailbox. The live case, opt-in, repeats P0, P2 and P7 through the
launcher.
