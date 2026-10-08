# External Claude agents

An external Claude agent is one `claude -p` run that the shared launcher starts, a proxy relays and this
adapter's driver reports on, as Codex and OpenCode agents are. Use it where the host has no Claude subagent
(Codex, OpenCode's main proxy mode) or where a Claude agent must run outside this session: without its
CLAUDE.md and memory (`SAFE_MODE`), or under rights the driver sets. `<skill-dir>` is this skill's installed
directory; `<state>` the state directory, `ENTRUST_STATE_DIR`, else `<tmp>/entrust-state`.

It needs the `claude` CLI at 2.1.259 or later, signed in. `node <skill-dir>/scripts/status.mjs --json` says
`ready`, `signed-out`, `outdated` or `missing` and calls no model; orchestrate's adapter-status collects it.

## The plan row and the prompt

A plan row whose adapter column is `claude` is an external run: `<id> | claude | <opus|sonnet|haiku|fable> |
<role> | <writes> | <tokens>`. A five-column row naming a Claude model stays a native agent of the host. The row
pins the model and the writes: a prompt that names neither runs on the row's, one that names others is refused.

| Field | Values | Effect |
| --- | --- | --- |
| `RIGHTS:` (first) | `read [dir]`, `write <dir>`, `worktree <repo>` | the table below; absent: the plan row's writes |
| `MODEL:` | `opus`, `sonnet`, `haiku`, `fable`, or a full `claude-…` id | absent: the plan row's, else the user's default |
| `EFFORT:` | `low`, `medium`, `high`, `xhigh`, `max` | absent: the user's default |
| `OUTPUT_SCHEMA:` | an absolute path | absent: the [five-field schema](../../orchestrate/schemas/five-fields.schema.json); Claude Code validates the answer against it |
| `RESUME:` | the absolute path of an earlier claude report | continues that run's session, in its directory, with its rights |
| `SAFE_MODE: yes` | | no CLAUDE.md, memory, skills, plugins, hooks or MCP servers, and so no approvals |
| `TASK:` | the task, then every line after it | name absolute paths: Claude Code's prompt names a scratchpad, and "the current directory" alone can land there |

| `RIGHTS` | Working directory | Without asking | Tools |
| --- | --- | --- | --- |
| `read` | `dir`, else the caller's | reads inside it, and the read-only commands | Read, Grep, Glob, Bash |
| `write` | `dir` | edits inside `dir` too | and Edit, Write |
| `worktree` | a fresh detached worktree of `repo` under `<state>/worktrees/` | edits inside it | and Edit, Write |

Everything else a run tries asks: a command outside the read-only set, a write outside its directory. The
agent has no web tools and no Agent tool. It runs with the user's own configuration: their allow rules run
without asking, their hooks and MCP servers are there, and the report's `context` says which. A `write`
directory may not overlap `<state>`, and no file tool, redirect or `tee` may reach a mailbox; any other Bash
write there (`cp`, `mv`, a script) still asks, unless the user's own allow rules cover it.

## The launch

    node <skill-dir>/scripts/agent-run.mjs --new --report-file <report> <<'PROMPT'
    RIGHTS: read <dir>
    MODEL: sonnet
    TASK: …
    PROMPT

`<report>` is an absolute path under `<state>`, fresh for each launch, `<run>/<id>/report.json` when a plan is
registered. A refusal prints `ERROR=` and no `PROMPT=`: correct the prompt, never the directory. The run itself
is the proxy's: in Claude Code, one Agent call of type `entrust:proxy`, its message the four steps of the
codex adapter's [one call](../../codex/SKILL.md#one-call) with this adapter's `agent-run.mjs`; on another host,
orchestrate's [operational proxy](../../orchestrate/references/proxy.md).

## Approvals

Each prompt waits in the run's mailbox for thirty minutes, then is denied. A Bash call that is only a command
and its description comes back as a command request, its command between `COMMAND<<TOKEN` and
`COMMAND>>TOKEN`: decide it as the codex adapter's [approvals](../../codex/references/approvals.md) say, with
this adapter's `agent-run.mjs`. Every other call, a Bash call with a timeout or in the background included,
comes back as `TYPE=claude.permission` with the whole call between `REQUEST_BODY<<TOKEN` and
`REQUEST_BODY>>TOKEN`; an accept restates that whole body. What runs is the call as it was offered. A run
launched without a mailbox (a swarm) and a `SAFE_MODE` run deny whatever would ask, and exit 7 when they did.

## Continuing and reading

Continue with `RESUME: <its report>` under a fresh report path, `<run>/<id>-<n>/report.json` for a planned agent.
The continuation forks the session into one of its own, so two continuations of one report never share it, and
it keeps the earlier run's directory and rights; a run still going is refused, as `ERROR=` at `--new` and with
exit 10 at launch.

The report: `answerJson` the validated answer and `answerPath` its file; `sessionID`, `model`, `cost` (the
CLI's estimate), `usage`; `commands`, `fileChanges`, `permissionDenials`, `escalations`; `transcriptPath`, the
whole stream; a worktree's `worktreePath`, `base`, and `diff` against `base`, committed work included, with new
files in `untracked`. A refusal at launch is a report too, its reason on `ERROR=`. A stop or the time-out
ends the turn, `turnStatus: aborted` and exit 3. `node <skill-dir>/scripts/driver.mjs --help` lists the
exit codes.
