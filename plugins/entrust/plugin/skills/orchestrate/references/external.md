# Calling an external agent

An external agent is one run of another CLI (Codex, OpenCode or Claude) that entrust starts, watches and reports
on for you. Every external agent is called the same way, from any host, with the steps on this page. What one
adapter adds is on its own page: [codex](../../codex/SKILL.md), [opencode](../../opencode/SKILL.md),
[claude](../../claude/references/external.md). Read the adapter's page for its models and its extra fields, and
this page for everything else.

The steps: [1. the prompt](#1-write-the-prompt), [2. `--new`](#2-make-the-agent---new), [3. the run](#3-run-it),
[4. the result](#4-read-the-result), [5. a request](#5-decide-a-request), [6. continuing](#6-continue-an-agent),
[7. stopping](#7-stop-an-agent), [8. the budget](#8-the-budget), [9. what differs](#9-what-still-differs-by-adapter),
and [what the user reads](#what-the-user-reads).

Two paths appear in the commands. Replace them before running anything:

- `<orchestrate>` is the installed directory of the orchestrate skill: the directory that holds `SKILL.md`, one
  level above the `references/` directory this page is in.
- `<state>` is the state directory: `$ENTRUST_STATE_DIR` when it is set, else `entrust-state` inside the system's
  temporary directory.

## 1. Write the prompt

A prompt is a few header lines, then `TASK:` and the task. Header lines come first, one per line, each
`NAME: value` at the start of the line.

| Line | Value | When it is left out |
| --- | --- | --- |
| `RIGHTS:` (first, when present) | `read [<dir>]`: read only; `write <dir>`: may change files under `<dir>`; `worktree <repo>`: may change files in a fresh copy of the git repository `<repo>` | the plan row's writes; without a plan, `read` in the directory you run `--new` in |
| `MODEL:` | a model name from the adapter's models page | the plan row's model; without a plan, the CLI's default |
| `EFFORT:` | an effort name from the adapter's page | the CLI's default |
| `OUTPUT_SCHEMA:` | the absolute path of a JSON Schema; for an orchestrated agent always `<orchestrate>/schemas/five-fields.schema.json` | the adapter's default |
| `RESUME:` | the `REPORT=` path of an earlier run of this agent | a new agent |
| `ALLOW_NO_COMMANDS:` | `yes` | a turn that ran no command and read no file fails with exit 5 |

A yes-or-no line takes `yes`, `true` or `1`, or `no`, `false` or `0`. After the header comes the body:

    TASK: what to do, naming every input by its absolute path
    CHECK: how the agent can tell it is right
    RETURN: exactly what to hand back

Write one deliverable per agent. Write the task in the user's language. Choose the smallest `RIGHTS` that lets
the agent finish and check the work, and agree any write right with the user before launching.

## 2. Make the agent: `--new`

Choose the report path, `<REPORT>`:

- under a registered plan: `<run>/<id>/report.json`, where `<run>` is the run directory you registered with
  `--plan` and `<id>` the agent's row;
- without a plan: `<state>/reports/<a name used once>/report.json`.

Run one shell command. Keep the quotes around `'PROMPT'`, so nothing inside the prompt is expanded:

    node "<orchestrate>/scripts/agent-run.mjs" --new --report-file "<REPORT>" <<'PROMPT'
    RIGHTS: read /path/to/project
    MODEL: <model>
    OUTPUT_SCHEMA: <orchestrate>/schemas/five-fields.schema.json
    TASK: …
    PROMPT

Under a plan the row names the adapter. Without a plan, add `--adapter codex`, `--adapter opencode` or
`--adapter claude` before `--report-file`. Copy a prompt you were given exactly, adding and removing nothing.

- It prints `PROMPT=` and `APPROVALS=`: the agent is made. Go to step 3.
- It prints `ERROR=` and no `PROMPT=`: no agent exists. Fix the prompt and run the same command again. Never
  widen `RIGHTS`, create a directory or change the command to get past a refusal: a refusal about rights or a
  directory goes to the user as a question.
- It exits 2 with `refused:` on stderr: the command itself is wrong, most often a missing `--adapter`. Fix the
  command, not the prompt.

The agent's directory, `<DIR>`, is `agent/` beside `<REPORT>`.

## 3. Run it

The run needs a proxy: a small agent of the host that runs one command, `--run`, waits for it, and hands back
what it printed. The proxy never writes the prompt and never reads the result; that is your work.

### In Claude Code

Make one call of the Agent tool, the tool that starts a Claude Code subagent:

- `subagent_type`: `entrust:proxy`. Give it no `model`: the proxy pins its own small model, and the agent's
  model is the `MODEL:` line of its prompt.
- `description`: `<Vendor> <Model> <id>: <the task in a few words>`, for example `Codex Sol R1: review the diff`.
- `run_in_background`: `false` for the one agent you wait for; `true` for agents that run side by side or while
  you work.
- `prompt`: the block below, with `<DESCRIPTION>` replaced by the description above and `<orchestrate>` and
  `<REPORT>` by their paths, and nothing else changed.

The block, copied whole:

    1. Run this command with the Bash tool, in the foreground, with timeout 600000, and description "<DESCRIPTION>". Write no text before it.

    node "<orchestrate>/scripts/agent-run.mjs" --run --report-file "<REPORT>"

    2. If its result ends with RUNNING=, or is the harness's notice that it moved the command to the background, run the very same command again at once, and again each time either comes back. Each run is safe: the command waits for the run it already started. Do not open, tail or wait on the output file that notice names, and write nothing in between. Any other result, an empty one included, goes to step 3 as it is.

    3. Call SubagentHandback with exactly the lines that result printed, a complete pending request included, nothing added, nothing removed.

    4. After the hand-back result, and whenever the harness asks you for a visible response, write exactly one line, "<DESCRIPTION>: report delivered", and nothing else.

`--new` and this call may go in the same turn: `--run` waits ten seconds for a prompt `--new` has not written yet.
The proxy's hand-back (its `SubagentHandback`, the tool a Claude Code subagent returns its result with) is the
agent's result. A background call also sends a task notification after it; give that the shortest reply.

### In Codex or OpenCode

Start one native subagent per external agent: an agent the host itself starts and lets you message. Put it on
the host's smallest model, the proxy row of the host's models page ([Codex](../../codex/references/models.md));
on another host, its smallest model. Give it [proxy.md](proxy.md), the agreed task and rights, the user's
instructions that apply, and the command:

    node "<orchestrate>/scripts/agent-run.mjs" --run --watch --report-file "<REPORT>"

It decides a request the task already covers and sends you the rest. Continue the same subagent for the
agent's continuations.

## 4. Read the result

`--run` ends with one of these:

| It ends with | It means | Do |
| --- | --- | --- |
| nine status lines, the last `REPORT=` | the run is over | read the lines, then the report |
| `RUNNING=` | the run is going on; the call returned before its tool's ten-minute limit | run the same `--run` again (in Claude Code, send the proxy the same block again) |
| `REQUESTS=`, `WAITING=` and `REPORT=`, after one or more `REQUEST=` blocks | the agent waits on your decision | step 5 |

The nine lines:

| Line | It says |
| --- | --- |
| `DRIVER_EXIT=` | the driver's exit code, or `unknown` |
| `PATH=` | `own`: the file at `<REPORT>` is this run's; `taken`: it is an earlier run's, whatever the other lines say; `none`: the run was refused |
| `EXIT=` | the report's `exitCode` |
| `FIRST=` | the first line of the answer |
| `ANSWER=` | the whole answer on one line, or a pointer to the report when it is longer than 600 characters |
| `ERROR=` | why the exit code is not 0 |
| `RECEIPT=` | the turn's status, whether the CLI's own record confirms the run (`receiptOk`), the model, and `approvals=A/D/E/O`: requests accepted, declined, expired and still open |
| `FILE=` | `exists`, or `missing`: the run ended without a report |
| `REPORT=` | the report's path |

The report is JSON, written whole or not at all; a missing report means unknown, never success. Every adapter's
report has `ok`, `exitCode`, `error`, `turnStatus` (`null` when no turn ran), `turnError`, `receiptOk`, `model`,
`requestedModel`, `answer`, `answerJson` (the parsed answer, with `OUTPUT_SCHEMA:`), `answerPath` (the whole
answer, when a cap clipped `answer`), `cwd`, `rights`, `commands`, `fileChanges` and `escalations` (one entry per
request and its outcome). The adapter's page lists the rest.

| `exitCode` | It means | Do |
| --- | --- | --- |
| 0 | the turn completed and passed its gates | check the answer yourself |
| 1 | the model's turn failed | read `turnError` |
| 2 | refused before a turn, or the CLI refused the request | read `error`; fix the prompt |
| 3 | cut by the budget (step 8); the answer or partial is kept | continue once with `RESUME:` if work remains |
| 4 | the CLI or its server failed, or reported rights other than the ones asked for | with a `turnStatus`, the report is complete: read it; without one, report it |
| 5 | the agent observed nothing, or no command matched `EXPECT:` | do not retry the same prompt |
| 6 | a request was declined or expired | read `escalations` |
| 7 | the agent needed an answer it could not get (a question, or a request with no mailbox) | read `error` |
| 8 | no answer | read the report before relaunching |
| 10 | busy: another run holds the directory, or the run to continue has not finished | wait for it, then run again |
| 13 | the answer does not fit `OUTPUT_SCHEMA:` | continue once asking for the fields |

`FILE=missing` or `PATH=taken`: read `RECEIPT=` first. An `approvals=` whose first number is not 0 means a command
ran with your rights and no report says how it ended: read `<DIR>/approvals/`, check what the command touched, and
never relaunch a prompt that would ask for the same thing. `<DIR>/err.txt` holds the reason.

## 5. Decide a request

A waiting result prints each request between marker lines with a fresh token, `TOKEN` below:

- a command, between `COMMAND<<TOKEN` and `COMMAND>>TOKEN`;
- any other call (an OpenCode permission, a Claude tool call), its whole JSON between `REQUEST_BODY<<TOKEN` and
  `REQUEST_BODY>>TOKEN`;
- an OpenCode question, marked `TYPE=opencode.question`.

Read the request whole before deciding. An accepted request runs as you, outside the agent's sandbox. Accept what
is non-destructive and inside the plan: a query, a read, a fetch of a source the plan names, a file written where
the plan puts files, a deletion inside the agent's own temporary directory. Take to the user anything destructive,
irreversible or outside the plan, and decline it when nobody can be asked.

Accept by restating what was printed between the markers, on stdin, in a heredoc whose delimiter you make now
from `ACCEPT_`, the printed token and six hex characters of your own, checking it is no line of the request.
Never use a fixed word or the token alone: a line of the request equal to the delimiter would end the heredoc
and run the rest in your shell. The ID is digits, a hyphen and eight hex characters; quote it, and for anything
else run `--pending --report-file "<REPORT>"` and take the request from there:

    node "<orchestrate>/scripts/agent-run.mjs" --decide '<ID>' --accept --report-file "<REPORT>" <<'<DELIMITER>'
    <the lines between the markers, exactly as printed>
    <DELIMITER>

The launcher compares what it reads with the request and publishes nothing on an empty stdin or any difference:
on that refusal, run `--pending` and copy from what it prints. When your own host blocks the accept, decline.

Decline with `--decide '<ID>' --decline --why "<reason>" --report-file "<REPORT>"`. Answer a question with
`--decide '<ID>' --answer --report-file "<REPORT>"` and `{"answers":[["<choice>"]]}` on stdin, one list per
question. Then run the same `--run` again: in Claude Code, send the proxy the same block again. A request nobody
answers is declined after thirty minutes. A decline answers that one request; the run goes on.

## 6. Continue an agent

Write a new prompt with `RESUME: <its REPORT= path>` and run `--new` under a fresh report path: under a plan
`<run>/<id>-2/report.json`, then `-3`, and so on; without a plan, a new name. The continuation runs in the
earlier run's directory with its rights: leave `RIGHTS:` out or name the same rights. Then run it as in step 3,
sending the same proxy the new block where the host lets you message it.

## 7. Stop an agent

In Claude Code, stop its proxy (Stop on its card). Anywhere, send `kill -TERM` to the pid on the first line of
`<DIR>/err.txt`, which reads `entrust: pid=<n> identity=… reportPath=…`. The agent's turn is cut and its report
is still written. Declining a request does not stop the run.

## 8. The budget

Every agent is bounded three ways; none is set in the prompt.

| | Codex | OpenCode | Claude |
| --- | --- | --- | --- |
| silence | 15 minutes | 10 minutes; a session its server reports busy is not silent | — |
| volume | 1,000 commands | 1,000 commands | 1,000 tool calls |
| wall clock | none | 30 minutes | 30 minutes |

Silence and the wall clock stand still while a request waits for you. A cut is exit 3.

## 9. What still differs by adapter

- The models and efforts, and the extra header lines: the adapter's page.
- What a read agent does without asking: Codex runs any command inside its sandbox, network included; OpenCode
  reads and searches files, and asks for every shell command; Claude runs its read-only commands and whatever
  the user's own settings allow.
- The requests: Codex asks for commands; a Codex file change outside its rights is declined, never offered,
  since its request carries no body to restate. OpenCode asks for permissions and questions, Claude for commands
  and other tool calls, an edit outside the agent's roots included, with the whole edit as the body. In every
  adapter an edit aimed inside `<state>` or a directory the adapter protects (the CLI's own configuration, which
  each adapter's page names) is declined at once, never offered.
- The worktree: Codex makes it under `<repo>/.claude/worktrees/` and reports the diff as a file,
  `worktreeDiffPath`; OpenCode and Claude make it under `<state>/worktrees/` and report `worktreePath`, `base`,
  the `diff` inline and the `untracked` files.
- `EXPECT:`, a pattern a successful command's output must match, exists for Codex and OpenCode.
- Egress: a Codex agent reaches the network unless `NETWORK: no`; OpenCode asks; a Claude agent has no web tools.
- The user's MCP servers: a Codex agent runs in an isolated Codex home and has none of them, and no prompt line
  opens them; a Claude agent has the user's, unless `SAFE_MODE: yes`; an OpenCode agent has its user's OpenCode
  configuration and asks before any tool but its file reads.
- Writers on one tree: under a plan, `--plan` refuses two rows whose trees overlap and `--new` a live tree over
  another row's, in every adapter, so give each writer its own directory or a worktree. Without a plan, only a
  Codex write agent refuses a directory another Codex writer holds (exit 10).

## What the user reads

Tell the user, in their own language, which agent did what, by vendor, model and id ("Codex Sol R1 reviewed the
diff"): the model's name capitalised, never the model slug the report carries. Keep header lines, status lines,
report fields and absolute paths out of it, and say what an agent may write, and where, in plain words, so the
user knows what they approve.
