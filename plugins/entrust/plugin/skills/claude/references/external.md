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
| `RIGHTS:` (first) | `read [dir]`, `write <dir>`, `worktree <repo>` | the table below; absent: the plan row's writes, else `read` in the current directory |
| `MODEL:` | `opus`, `sonnet`, `haiku`, `fable`, or a full `claude-…` id | absent: the plan row's, else the user's default |
| `EFFORT:` | `low`, `medium`, `high`, `xhigh`, `max` | absent: the user's default |
| `OUTPUT_SCHEMA:` | an absolute path | absent: the [five-field schema](../../orchestrate/schemas/five-fields.schema.json); Claude Code validates the answer against it |
| `RESUME:` | the absolute path of an earlier claude report | continues that run's session, in its directory, with its rights; a `RIGHTS:` line names the same or is left out |
| `SAFE_MODE: yes` | | no CLAUDE.md, memory, skills, plugins, hooks or MCP servers, and so no approvals |
| `ALLOW_NO_COMMANDS: yes` | | the agent may answer from what it knows; without it, a turn that ran no command and read no file is exit 5 |
| `TASK:` | the task, then every line after it | name absolute paths: Claude Code's prompt names a scratchpad, and "the current directory" alone can land there |

| `RIGHTS` | Working directory | Without asking | Tools |
| --- | --- | --- | --- |
| `read` | `dir`, else the caller's | reads inside it, and the read-only commands | Read, Grep, Glob, Bash |
| `write` | `dir` | edits inside `dir` too | and Edit, Write |
| `worktree` | a fresh detached worktree of `repo` under `<state>/worktrees/` | edits inside it | and Edit, Write |

Everything else a run tries asks: a command outside the read-only set, a write outside its directory. The
agent has no web tools and no Agent tool. It runs with the user's own configuration: their allow rules run
without asking, their hooks and MCP servers are there, and the report's `context` says which. A `write`
directory may not be your home or above it, nor lie inside or above `<state>` or `~/.claude`. An Edit or Write
outside the run's directory aimed inside `<state>` or `~/.claude` is declined at once, never offered, and no
redirect or `tee` may reach a mailbox; any other Bash write there (`cp`, `mv`, a script) still asks, unless the
user's own allow rules cover it.

## The call

Make, run, read, continue and stop it as the [shared call page](../../orchestrate/references/external.md) says;
without a plan, `--new` takes `--adapter claude`. What Claude adds:

- A request is a command or a whole tool call ([What each adapter adds](../../orchestrate/references/external.md#what-each-adapter-adds)):
  a Bash call with a timeout or in the background is a tool call too, and an accept restates its whole body.
- A run launched without a mailbox (a swarm) and a `SAFE_MODE` run deny whatever would ask, and exit 7 when they
  did.

## Continuing and reading

A continuation forks the session into one of its own, so two continuations of one report never share it; a run
still going is refused, as `ERROR=` at `--new` and with exit 10 at launch.

The report: `answerJson` the validated answer and `answerPath` its file; `sessionID`, `model`, `cost` (the
CLI's estimate), `usage`; `commands`, `fileChanges`, `permissionDenials`, `escalations`; `transcriptPath`, the
whole stream; a worktree's `worktreePath`, `base`, and `diff` against `base`, committed work included, with new
files in `untracked`. A refusal at launch is a report too, its reason on `ERROR=`. A stop or the time-out
ends the turn, `turnStatus: aborted` and exit 3.
