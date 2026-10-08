# Design v1: the claude adapter's external run

Paths are under `plugins/entrust/plugin/skills/` unless they say otherwise. Probe numbers are
[01-probes.md](01-probes.md)'s.

## 1. Files

| File | What it is | Size aimed at |
| --- | --- | --- |
| `claude/scripts/driver.mjs` | runs one `claude -p`, publishes the report | 450–600 lines |
| `claude/scripts/approvals.mjs` | the stdio MCP server Claude Code starts for `--permission-prompt-tool`; offers each prompt to the mailbox and answers from the decision | 150 lines |
| `claude/scripts/launch.mjs` | the launcher's hooks: driver, short names, the typed request `claude.permission` | 60 lines |
| `claude/scripts/agent-run.mjs` | the entry to the shared launcher, as OpenCode's: refuses another `--adapter`, appends `--adapter claude` | 18 lines |
| `claude/scripts/status.mjs` | passive status: `claude --version`, `claude auth status`; no model call | 60 lines |
| `claude/adapter.json` | gains `status`, `launcher`, `launch`, `swarm` | |
| `claude/references/external.md` | the recipe a coordinator on any host follows | 80 lines |
| `claude/SKILL.md` | its description and opening say it also runs external Claude agents; one section links `external.md` | +10 lines |
| `evals/claude.test.mjs`, `evals/fake-claude.mjs` | the suite, on a fake `claude` that speaks stream-json and drives the MCP server as the real one does | |

Nothing in the shared launcher changes but one line (§6). `agents/proxy.md` names the claude adapter beside codex
and opencode.

## 2. The prompt

Header lines first, then the task, as the other drivers read them:

| Field | Values | Maps to |
| --- | --- | --- |
| `RIGHTS:` (first) | `read [dir]`, `write <dir>`, `worktree <repo>` | §3 |
| `MODEL:` | an alias the adapter's plan lists (`opus`, `sonnet`, `haiku`, `fable`) or a full `claude-…` id | `--model` |
| `EFFORT:` | `low`, `medium`, `high`, `xhigh`, `max` | `--effort` |
| `OUTPUT_SCHEMA:` | an absolute path; absent: the five-field schema | `--json-schema <file's text>` |
| `RESUME:` | a session id, or the absolute path of an earlier report | `--resume <session_id>` |
| `SAFE_MODE: yes` | | `--safe-mode` |

`SAFE_MODE` is the one new field. Who sets it: the coordinator, for a role that must judge without the user's and
the project's context (a blind reviewer, a refuter of the coordinator's own reading). Why the default cannot decide:
the owner chose the user's configuration as the default (decision 3). What breaks without it: no Claude agent can
start without CLAUDE.md and memory (P1), so a "blind" Claude role is primed by the same context as the coordinator.

No `BRIEF`, `NETWORK`, `VERIFY`, `ATTACH` or budget in v1. A refused field gets the drivers' usual
`entrust: refused: <reason>` at `--check-prompt-file`.

## 3. Rights

| `RIGHTS` | Working directory | `--permission-mode` | `--tools` |
| --- | --- | --- | --- |
| `read [dir]` | `dir`, else the caller's | `default` | `Read,Grep,Glob,Bash` |
| `write <dir>` | `dir` | `acceptEdits` | `Read,Grep,Glob,Bash,Edit,Write` |
| `worktree <repo>` | a detached worktree the driver adds under `<state>/worktrees/<invocation>` | `acceptEdits` | as `write` |

What that gives, measured: in `default` mode the read-only command set runs and any other command prompts (P2);
in `acceptEdits` a write inside the working directory runs and one outside prompts (P4). Every prompt goes to the
mailbox (§4). A `read` agent has no Edit or Write tool at all. Web tools and the Agent tool are left out of `--tools`
in v1, as Codex agents have no network by default.

What the user's configuration adds (decision 3): their `permissions.allow` rules run without a prompt, their MCP
servers' tools are offered (each prompts unless allowed), their hooks run. The report lists the MCP servers and
plugins `system/init` named, so a coordinator can see what the agent had.

The worktree comes from one shared function, `orchestrate/scripts/worktree.mjs`, moved out of OpenCode's driver
(`makeWorktree`, `worktreeFacts`), which imports it from there: a third copy would make three owners. The Codex
driver keeps its own; that is recorded as an entry, not done here.

## 4. Approvals

`--approval-dir` given (the keeper's launch): the driver passes Claude Code an MCP config naming
`approvals.mjs` as server `entrust-approvals`, with a per-server `timeout` of 31 minutes, and
`--permission-prompt-tool mcp__entrust-approvals__decide`. The run's identity (driver pid, `startedAtMs`, the
mailbox path, the session id) reaches the server in its `env`. For each call (P2's shape):

1. Write `<seq>-<8 hex>.request.json`, then rewrite `pending`, as the other drivers do. A `Bash` call is a
   command request, the launcher's own kind: `command` is `input.command`, `method` `Bash`, `cause` `asked`,
   `cwd`, `roots`, `deadlineAt` 30 minutes on. Any other tool is a typed request `claude.permission`, `presented`
   being `JSON.stringify({tool_name, input}, null, 2)` and `requestHash` its SHA-256.
2. Poll for `<id>.decision.json` every 500 ms; take one that fits (the launcher's `decisionFits`, through the hook).
3. Settle the request file (`decision`, `by`, `why`, `settledAt`), drop it from `pending`, and answer
   `{"behavior":"allow","updatedInput":<input as offered>}` or `{"behavior":"deny","message":<why or a default>}`.
   An accept never carries the coordinator's text into the input: what runs is what was offered.
4. Past the deadline: settle `expired` by the driver and deny.

No `--approval-dir` (swarm, a launch-only caller): `--permission-prompts none`, so whatever would prompt is denied
at once, as the other drivers decline it. After `claude` exits, the driver settles any request still open as
`expired` and empties `pending`.

`launch.mjs`'s `typedRequest` for `claude.permission` gives the launcher `presented`, decisions `accept` and
`decline`, its `TYPE=`/`TOOL=`/`REQUEST_BODY` lines, `fits` (the hash), and an `envelopeError` that recomputes
the hash.

## 5. The run and the report

The driver claims the report path exclusively, prints `entrust: pid=… identity=… reportPath=…` to stderr, and
spawns, with the prompt's task on stdin and the environment as the launcher passed it:

    claude -p --output-format stream-json --verbose --model M [--effort E] --json-schema <schema>
      --permission-mode … --tools … (--session-id <new uuid> | --resume <id>) [--safe-mode]
      (--mcp-config <file> --permission-prompt-tool … | --permission-prompts none)

`--session-id` is chosen by the driver, so a run that dies still names its session. Every stdout line is copied
to `report.transcript.jsonl` beside the report. From the stream:

| Report field | From |
| --- | --- |
| `answerJson` | `result.structured_output` |
| `answer` | `result.result` |
| `threadId`, `sessionID` | `session_id` |
| `model` | `system/init.model` (the full id), `requestedModel` the `MODEL:` line |
| `turnStatus` | `completed`, or `interrupted` for `error_during_execution`, `failed` otherwise |
| `receiptOk` | a `result/success` with `structured_output` present |
| `commands` | each `Bash` `tool_use` and its `tool_result` (`is_error`) |
| `fileChanges` | each `Edit`/`Write` `tool_use`'s `file_path` |
| `cost`, `usage` | `total_cost_usd` (`costSource: "claude_estimate"`), `usage`, `modelUsage` |
| `permissionDenials`, `escalations` | `result.permission_denials`; the requests offered |
| `context` | `system/init`'s `plugins`, `mcp_servers`, `permissionMode`, `memory_paths`, `safeMode` |

Exit codes are the drivers' shared numbers (0 success, 2 usage, 3 timeout, 4 transport, 8 no answer, 13 schema).

Stop and time-out: on SIGTERM, SIGINT or SIGHUP from the launcher, or at `--timeout` (default 1800 s), the driver
sends `claude` SIGINT, which ends the turn with a `result` and kills the running command (P5, P5b), waits 10 s
for exit, then SIGTERM, then SIGKILL; the report is `partial` with `cancellation` set. Never SIGTERM first: it
records no result (P5).

## 6. Plans and the launcher

`adapter.json` keeps `"plan": {"models": [...], "native": true}`. The launcher's set of row adapters today is
`native` plus every planned adapter that is not native; it becomes `native` plus every planned adapter with a
launcher. A five-column row naming `opus` stays native, as now; a six-column row with adapter `claude` is an
external Claude agent, registered and launched as Codex and OpenCode rows are.

`swarm`: `{"concurrency": 4, "briefModel": "^MODEL:\\s*(opus|sonnet|haiku|fable|claude-\\S+)\\s*$"}`.

## 7. Tests

`fake-claude.mjs` on `PATH` as `claude`: reads the flags, emits `system/init`, assistant and user events and a
`result` per scenario, and for a scenario that prompts it starts the MCP server from `--mcp-config`, does the
`initialize`/`tools/call` exchange, and acts on the answer. Cases: the flag set for each `RIGHTS`; the report from a
success; a schema failure; `--resume`; SIGINT and the partial report; the mailbox round trip for a `Bash` request
(accept, decline, expire) and a typed `Write` request; `--permission-prompts none` without a mailbox; the launcher
end to end (`--plan` with a `claude` row, `--new`, `--run`, `--pending`, `--decide`). An opt-in live case,
`ENTRUST_LIVE_CLAUDE=1`, repeats P0 and P2 through the launcher.

## 8. Open questions for the critic

1. Should the driver strip the parent's `CLAUDE_CODE_*` variables when a Claude Code session launches it? The
   launcher passes its environment untouched; inside a Claude Code session that environment names the parent's
   session id and messaging socket. Not probed.
2. Is `Bash` as a command request right, given that an accept runs `input` exactly as offered?
3. `--tools` without the Agent tool: is losing subagents the right default for an external Claude agent?
4. Concurrency 4 is a guess; a pilot decides it.
