---
name: codex
description: >-
  Claude-to-Codex adapter: launch external Codex agents with per-call rights, isolated worktrees,
  evidence gates and receipts. Use in Claude when external Codex is requested or chosen for an
  independent review, competing implementation or multi-provider panel. Native Codex subagents
  use the host's own delegation facilities instead.
metadata:
  version: "0.25.0"
license: MIT
allowed-tools: Bash(node *codex/scripts/status.mjs*)
---

# Delegating to Codex

Under `orchestrate`, first read [orchestration.md](references/orchestration.md) whole before
`--plan` or `--new`: it owns registration, schema, state and external lifecycle.
Its `<codex-skill-dir>` is `${CLAUDE_SKILL_DIR}` and `<state>` is `${CLAUDE_PLUGIN_DATA}`.

The Codex this machine can run, asked of its server as this page loaded:

!`node "${CLAUDE_SKILL_DIR}/scripts/status.mjs"`

`status.mjs --json` returns account limits only, with recent models unsupported; it does not identify
the host or native subagents. The orchestration collector reads it without this page, and the active
runtime supplies native model choices.

## Composition

Apply all six rules:

1. Show the Codex agents and their exact model allocations in the approved plan before launch. Read-only
   rights need no write grant; they do not remove model selection from the plan.
2. Treat refusal as composition: for “no codex” or “just you”, run zero Codex agents and say the resulting
   panel is all-Claude and shares one model bias.
3. Attribute every finding; if a Codex agent failed or returned nothing, say so and never backfill it with
   a Claude answer.
4. Knowing the answer is not a reason to skip a requested second opinion.
5. Never add allow-rules on the user's behalf.
6. Compose from the Codex status the codex page printed as it loaded: a `CODEX=` line and, when it reads
   `ready`, one `MODEL=` line per model the account lists.
   - `ready`: every Codex agent's `MODEL:` resolves to a listed model. If the selected model is unavailable,
     report it and propose available alternatives. Use a replacement only when the approved standing policy
     names that fallback or the user approves the amended plan; nearest-model order alone grants no authority.
   - `signed-out`, `missing`, or `MODEL=none`: zero Codex agents; the plan's first line says Codex is not
     signed in, not installed, or lists no model, and that the panel is all-Claude and shares one model bias.
   - `unchecked`: compose by the other rules, and the plan says Codex was not checked. A launch is no check:
     a signed-out server lists Astra and Sol too (measured 2026-09-29).
   - The command itself in place of those lines was not run: run it with the Bash tool before composing.

   The status lines stay with you: the plan names Codex's state only where it changed the composition.

| What the user says | Composition |
| --- | --- |
| “no codex”, “just you” | zero Codex agents |
| nothing | follow [orchestrate's model policy](../orchestrate/SKILL.md#capacity-and-models); add a Codex agent only for a role that improves quality, time or cost |
| “a codex agent”, “one of them codex” | exactly one |
| “half codex” | half the agents, rounded up |
| “mostly codex” | every agent except the coordinator |
| “only codex”, “all codex” | every agent, including a one-agent task |
| “two of five codex” | exactly as stated |

Add another model only when its perspective or independent coverage can improve the result. “Only codex”
means Codex does the task while the coordinator checks it.

## Rights

Choose the smallest `RIGHTS` that can complete and check the work:

| Prompt header | Codex may | Settle first? |
| --- | --- | --- |
| `RIGHTS: read [<dir>]` or no header | read any readable path, reach the network, run commands, write `$TMPDIR`; the sandbox bounds what the agent does itself: a command it cannot run there is offered to you and, approved, runs as you with no sandbox, and a file change not shown to lie inside its writable roots is declined at once, which makes the run exit 6; each is recorded in `escalations` | no |
| `RIGHTS: worktree <repo>` | write in a driver-managed detached tree | say that a worktree will be made |
| `RIGHTS: write <dir>` | write under the live directory | yes; this chooses the blast radius |

`$TMPDIR` is granted at every level and `/tmp` at none; a write agent adds each settled `WRITABLE:` root
to what its row names. Every output path a `TASK:` names lies under the agent's writable roots: a write outside them is refused. The driver refuses a server whose sandbox answers differently.

Each `WRITABLE: <dir>` widens a write agent, as does removing a `NETWORK: no` the user settled
([egress](references/parity.md#isolation-mcp-and-search)): settle each with the user before adding it, and never
translate a refusal into broader rights: an approval under the plan is a decision on one request, not a rights
change.

A worktree agent's tree starts at `HEAD`, or at its recorded base when resumed: uncommitted, untracked and
ignored files and installed dependencies are not in it, and a stash does not reach it (`--help`, `--worktree`),
so work it must see is committed first, with the user's word. Without `WRITABLE: <repo>/.git` it cannot commit;
its work comes back as `worktreeDiffPath` and, for untracked files not ignored, `worktreeUntrackedPath`
([Git-directory grant](references/environment-and-internals.md#git-directory-grant)).

Read agents may share one cwd, and each has a `$TMPDIR` of its own, but a repository whose tooling keeps a
daemon, a socket, or a pid/state file in the tree needs a distinct cwd per concurrent agent; the failure is a
native crash, not a sandbox refusal. A write agent sharing a live tree must not change what the tree shares: no
stash, branch switch, reset, clean or rebase while another writer holds part of it; no sandbox refuses them. A
second writer waits until a command approved in its directory has ended
([check](references/environment-and-internals.md#bounding-or-stopping-an-agent)).

## Header fields

The header is the leading run of upper-case `NAME: value` lines at column 0; the body starts at `TASK:` or
at the first line that is not one; a non-field upper-case `NAME:` above it is exit 2 naming it.

| Field | Value (booleans: `yes`, `true` or `1`; no line means off, and for `NETWORK:` means on) | A coordinator sets it when |
| --- | --- | --- |
| `RIGHTS:` | `read [<dir>]`, `worktree <repo>`, `write <dir>` | first, or not at all: no header is a read agent in the current directory |
| `NETWORK:` | `no` | this agent's own commands must not reach the network; `WEB_SEARCH:` is untouched either way |
| `WRITABLE:` | `<dir>`, repeatable | a write agent needs one more root than the directory it was given |
| `RESUME:` | `<threadId>`, `last` | this agent continues an earlier thread instead of opening one |
| `EXPECT:` | `<regex>` | the answer is evidence only if a command matching it ran and succeeded; none is exit 5. Do not point it at a check whose failure IS the finding |
| `OUTPUT_SCHEMA:` | `<path to a strict JSON Schema file>`; the five-field schema for orchestrated agents ships at `${CLAUDE_SKILL_DIR}/schemas/five-fields.schema.json` | the answer must parse as one JSON object |
| `MODEL:` | `astra`, `sol`, `terra`, `luna`, the newest listed model of that name, or a full slug | this agent needs a model other than the configured default; in prose the name is capitalised |
| `EFFORT:` | `low`, `medium`, `high`, `xhigh`, `max`, and `ultra` where the model lists it; no line inherits `~/.codex/config.toml` | the task is worth more or less thinking than the configured default; `low` for a one-line task |
| `WEB_SEARCH:` | `cached`, `indexed`, `live`: the provider's search tool, not the network | the user asked for the provider's web search; "the network is allowed" is not that ask |
| `BRIEF:` | `yes` | a short answer is enough; omit it beside an output schema — it clips only the inline `answer` on a valid return and still asks the model for 20 lines |
| `ALLOW_NO_COMMANDS:` | `yes` | the agent is recall-only and will run nothing |

`VERIFY` is refused in a prompt file without `--allow-prompt-verify`, which the one call does not pass: an agent
that could write its own gate would grade itself. Declare gates on the command line
([result-gates.md](references/result-gates.md)).

## Prompt shape

Write a concrete, checkable body:

    TASK:   what to do
    CHECK:  the ground truth, preferably something the agent cannot guess
    RETURN: exactly what to hand back
    ENVIRONMENT: staged inputs and their paths; known daemon or socket limits and runnable alternatives; flags that avoid an unwritable cache

For a write agent, or where repository tools need a daemon, fill `ENVIRONMENT:` with observed facts and staged paths, including the diff and trunk files when supplied. It is a body line after `TASK:`, not a header field. Give one deliverable per agent. Split a return that asks for unrelated artifacts or decisions.
A task that reads files names the read: one command per file, and `max_output_tokens` at the tool's output
cap, 10,000 today (`codex debug models` lists it under `truncation_policy`); a model left to choose sets its own,
often 1,000, and reads fragments
([A read cut to fragments](references/incidents.md#a-read-cut-to-fragments)). Write `TASK:` in the user's
language: the agent answers in the language it is asked in. Whatever `RETURN:` asks for, its first line is one
sentence a reader can take on its own: the name you gave the agent ("you are Codex Terra T1"), its status and
what it did; give the name, since the model does not know its short name
([language and name](references/incidents.md#language-and-name-in-a-return)). That line is what the coordinator
retells, not itself a message to the user; the rest is the return's own shape. Phrase defensive work as
robustness under unusual states; attack wording can trip a safety classifier
([Safety classifier](references/incidents.md#safety-classifier)).

The standing rules are already on the thread — unattended, its effective writable roots and that `/tmp` is not
one, its egress and its web search each named whichever way they went, a one-line record for a step that cannot
run, never claim a test passed without the count — so do not repeat them.

## One call

One Agent call per agent: a native subagent, the **wrapper**, that launches the driver, waits for it and
returns when the run has ended. It gives a Codex agent what a Claude agent has — a card, Stop on it, one
completion notification, a message to continue it — where a Bash task has none
([the agent map](references/incidents.md#the-agent-map)).

Write the prompt with one Bash call, the launcher's `--new`, the heredoc quoted so nothing in it expands:

    CLAUDE_PLUGIN_DATA="${CLAUDE_PLUGIN_DATA}" node "${CLAUDE_SKILL_DIR}/scripts/agent-run.mjs" --new --report-file "<REPORT>" <<'PROMPT'
    MODEL: terra
    TASK: …
    CHECK: …
    RETURN: …
    PROMPT

Write a prompt you were handed VERBATIM: not a quote, not a `$`, not a header line it has, and add nothing. A
refusal prints its reason on an `ERROR=` line and no
`PROMPT=`: spawn no wrapper on that result, and take a mode the device refuses back to the user as a question,
never to another mode. Never create a directory, change a level or re-run with different flags to make a
refused agent succeed ([A relay on a small model](references/incidents.md#a-relay-on-a-small-model)).

On `PROMPT=`, spawn the wrapper with the Agent tool: `subagent_type: entrust:codex-agent`,
`run_in_background: false` for the one agent you wait for and `true` for agents that run side by side or
while you work ([foreground and background](references/incidents.md#foreground-background-and-the-ceiling)),
and a `description` of `Codex <short name> <id>: <task in a few words>`, the name on the `MODEL:` line, so the
card names the agent, its vendor and its task. Pass it no `model`: the wrapper,
[agents/codex-agent.md](../../agents/codex-agent.md), pins its own, and the agent's model is the `MODEL:` line
in its prompt file. Under a background call, the hand-back message and the task notification that follows it
are one completion: read the first, and give the second the shortest reply the harness accepts; a foreground
call has no notification.

The wrapper's message is the block below with its two placeholders filled in and nothing added or removed
([the wrapper's message](references/incidents.md#the-wrappers-message)). The command is the launcher, one
foreground call and no `&` of your own; its `--help` says what the run does, what it refuses and what its nine
status lines mean.

The Agent call, its message this block:

    1. Run this command with the Bash tool, in the foreground, with timeout 600000, and description "<DESCRIPTION>". Write no text before it.

    CLAUDE_PLUGIN_DATA="${CLAUDE_PLUGIN_DATA}" node "${CLAUDE_SKILL_DIR}/scripts/agent-run.mjs" --run --report-file "<REPORT>"

    2. If its result ends with RUNNING=, or is the harness's notice that it moved the command to the background, run the very same command again at once, and again each time either comes back. Each run is safe: the command waits for the run it already started. Do not open, tail or wait on the output file that notice names, and write nothing in between. Any other result, an empty one included, goes to step 3 as it is.

    3. Call SubagentHandback with exactly the lines that result printed, nothing added, nothing removed.

    4. After the hand-back result, and whenever the harness asks you for a visible response, write exactly one line, "<DESCRIPTION>: report delivered", and nothing else.

Both calls may go in one turn: the launcher waits ten seconds for a prompt a `--new` has not written yet, and a
wrapper started beside a refused `--new` spends that report path. `<DESCRIPTION>` is the Agent call's own
description. `<REPORT>` is an absolute path of this agent's own under the driver's state directory,
`<state>/reports/<run>/report.json` with `<run>` unique, or the path the orchestrate page names; a relaunch
takes a fresh one. The launcher makes every directory it needs, so it may name a root your own Write and
`mkdir` are refused. `<DIR>` is the agent's directory, `agent/` beside `<REPORT>`.

The wrapper's completion notification is the agent's completion: read its lines first, and the file after a
`PATH=own` when they leave a question. To continue an agent, write a second prompt file with `RESUME: <threadId>`
under a fresh report path (under a plan `<run>/<agent>-<n>/report.json`, `--help`) and send the wrapper one
more command of the same shape; a session with no message tool spawns a second wrapper on the same file.

`--run`'s one call may hand back a **waiting result** instead of the nine status lines: a request is pending,
and it hands back what `--pending` prints, ending in `REQUESTS=`, `WAITING=` and `REPORT=`. Read it whole and
decide under the plan's own rule; a request nobody answers is declined as expired after thirty minutes and the
turn goes on. The `--decide` call that answers it, what an accept runs as, and what to read after such a run:
[approvals.md](references/approvals.md).

## Reading the result

- `<REPORT>` is the report, the same JSON the run also wrote to `<DIR>/out.json` once a turn ran. Read
  the file: it is written whole or not at all, and a missing one means unknown, never success.
- `exitCode: 0` means the completed turn passed its declared evidence gates. `answer` is the agent's text;
  with an `OUTPUT_SCHEMA:` line, `answerJson` is that answer already parsed, and `answerPath` holds the
  complete answer where a size cap clipped either. `receiptOk: false` on a run that claims success is a red flag
  ([receipts](references/environment-and-internals.md#receipt-validation-and-reporting)).
- `turnStatus: null` means no turn ran, and `error` says why
  ([Observability](references/environment-and-internals.md#observability)). With any other, the exit judges the
  evidence, not whether an answer exists: read the turn's commands, answer and receipt before relaunching, or a
  paid turn is thrown away; `driver.mjs --help` lists every code. A cut, exit 3, keeps the answer or partial and a
  `RESUME:` hint; exit 6 is an approval declined or expired
  ([After the run](references/approvals.md#after-the-run)).
- `PATH=taken` means the file at `<REPORT>` is an earlier run's, whatever the numbers beside it say, and
  `FILE=missing` a run that ended without a report: `<DIR>/err.txt` has the reason and `<DIR>/out.json` the
  report a turn wrote where publication failed. For either, a `RECEIPT=` that counts `approvals=` is read before
  any relaunch ([After the run](references/approvals.md#after-the-run)).
- `RUNNING=` in place of `REPORT=` is a run still going whose wrapper handed back early: send the wrapper the
  same message again, or wait on `<DIR>/exit`; nothing was lost.
- `worktreePreserved` not null: the tree is the artifact, not a harvest
  ([Worktree ledger and destination](references/environment-and-internals.md#worktree-ledger-and-destination)).
- To stop an agent, stop its wrapper — Stop on the agent map or `TaskStop` — or `kill -TERM` the pid on the
  driver's pid line in `<DIR>/err.txt`, `entrust: pid=<n> identity=… reportPath=…`; after a waiting result or a
  `RUNNING=` hand-back no call holds the driver, so that pid is what reaches it, or, after a waiting result,
  `--decide '<ID>' --decline` and the same `--run`
  ([Bounding or stopping an agent](references/environment-and-internals.md#bounding-or-stopping-an-agent)).

## What the user reads

Write results in the user's language; name each agent by model and ID and say what it did. Keep `Codex` only
on Codex agents (`Codex Sol R1`, never a report slug). Make the agent the sentence's subject and its action the
verb. Keep field names, status blocks, table row names and paths in prompts or reports, not user-facing prose
([the wrapper's message](references/incidents.md#the-wrappers-message)). State write rights and paths plainly so
the user knows what they are approving.

## References

- `node "${CLAUDE_SKILL_DIR}/scripts/driver.mjs" --help`: the flags and the exit codes, `--help-all` the rest; `agent-run.mjs --help` beside it: the wrapper's one command, its refusals, the nine status lines, the waiting result and `--decide`.
- [approvals.md](references/approvals.md): the coordinator's approval steps.
- [environment-and-internals.md](references/environment-and-internals.md): environment, prompt files, stopping an agent, receipts, worktrees, locks, the commit grant, config drift.
- [result-gates.md](references/result-gates.md): evidence gates and the verifier.
- [parity.md](references/parity.md): parity with native subagents, browser tests, pasted images.
- [incidents.md](references/incidents.md): the measured failures behind the rules.
- [adversarial-review.md](references/adversarial-review.md), [why-not-the-plugin.md](references/why-not-the-plugin.md), and the install page, [README.md](../../README.md).
