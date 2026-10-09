---
name: codex
description: >-
  Claude-to-Codex adapter: launch external Codex agents with per-call rights, isolated worktrees,
  evidence gates and receipts. Use in Claude when external Codex is requested or chosen for an
  independent review, competing implementation or multi-provider panel. Native Codex subagents
  use the host's own delegation facilities instead.
metadata:
  version: "0.27.0"
license: MIT
allowed-tools: Bash(node *codex/scripts/status.mjs*)
---

# Delegating to Codex

Under `orchestrate`, first read [orchestration.md](references/orchestration.md) whole before
`--plan` or `--new`: it owns registration, schema, state and external lifecycle.
Its `<codex-skill-dir>` is `${CLAUDE_SKILL_DIR}` and `<state>` is the driver's state directory, `<tmp>/entrust-state`
(`ENTRUST_STATE_DIR` when set).

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
     a signed-out server lists models too.
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
| `RIGHTS: read [<dir>]` or no header | read any readable path, reach the network, run commands, write `$TMPDIR`; the sandbox bounds what the agent does itself: a command it cannot run there is offered to you and, approved, runs as you with no sandbox, and a file change it asks about, one outside its writable roots, is declined at once, which makes the run exit 6; each is recorded in `escalations` | no |
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
| `RESUME:` | the earlier run's report path, as `REPORT=` printed it | this agent continues that run's thread, in its directory, with its rights: `RIGHTS:` names the same or is left out, and `WRITABLE:` is left out |
| `EXPECT:` | `<regex>` | the answer is evidence only if a command matching it ran and succeeded; none is exit 5. Do not point it at a check whose failure IS the finding |
| `OUTPUT_SCHEMA:` | `<path to a strict JSON Schema file>`; the five-field schema for orchestrated agents ships at `${CLAUDE_SKILL_DIR}/../orchestrate/schemas/five-fields.schema.json` | the answer must parse as one JSON object |
| `MODEL:` | `astra`, `sol`, `terra`, `luna`, the newest listed model of that name, or a full slug | this agent needs a model other than the configured default; in prose the name is capitalised |
| `EFFORT:` | `low`, `medium`, `high`, `xhigh`, `max`, and `ultra` where the model lists it; no line inherits `~/.codex/config.toml` | the task is worth more or less thinking than the configured default; `low` for a one-line task |
| `WEB_SEARCH:` | `cached`, `indexed`, `live`: the provider's search tool, not the network | the user asked for the provider's web search; "the network is allowed" is not that ask |
| `BRIEF:` | `yes` | a short answer is enough; omit it beside an output schema — it clips only the inline `answer` on a valid return and still asks the model for 20 lines |
| `ALLOW_NO_COMMANDS:` | `yes` | the agent is recall-only and will run nothing |

Under a registered plan, a prompt with no `RIGHTS:` or `MODEL:` runs on its row's writes and model, and one naming
others, or a `WRITABLE:` root outside the row's writes, is refused at `--new`.

The launcher passes the driver nothing beyond the prompt file and the report path, and the driver runs no check
after the turn, so check the result yourself after you have read it
([result-gates.md](references/result-gates.md#checking-the-end-state)).

## Prompt shape

The body is the shared page's `TASK:`, `CHECK:` and `RETURN:`, with one more line where it helps:

    ENVIRONMENT: staged inputs and their paths; known daemon or socket limits and runnable alternatives; flags that avoid an unwritable cache

For a write agent, or where repository tools need a daemon, fill `ENVIRONMENT:` with observed facts and staged
paths, including the diff and trunk files when supplied. It is a body line after `TASK:`, not a header field.
A task that reads files names the read: one command per file, and `max_output_tokens` at the tool's output
cap, 10,000 today (`codex debug models` lists it under `truncation_policy`); a model left to choose sets its own,
often 1,000, and reads fragments
([A read cut to fragments](references/incidents.md#a-read-cut-to-fragments)). The agent answers in the language
it is asked in. Whatever `RETURN:` asks for, its first line is one sentence a reader can take on its own: the name
you gave the agent ("you are Codex Terra T1"), its status and what it did; give the name, since the model does not
know its short name ([language and name](references/incidents.md#language-and-name-in-a-return)). That line is
what the coordinator retells, not itself a message to the user. Phrase defensive work as robustness under unusual
states; attack wording can trip a safety classifier ([Safety classifier](references/incidents.md#safety-classifier)).

The standing rules are already on the thread — unattended, its effective writable roots and that `/tmp` is not
one, its egress and its web search each named whichever way they went, a one-line record for a step that cannot
run, never claim a test passed without the count — so do not repeat them.

## The call

Make, run, read, continue and stop every Codex agent as the [shared call page](../orchestrate/references/external.md)
says; read it whole before the first `--new`. On it, `<orchestrate>` is `${CLAUDE_SKILL_DIR}/../orchestrate`, the
orchestrate skill installed beside this one. What Codex adds to it:

- Without a plan, `--new` takes `--adapter codex`.
- The Agent call's description is `Codex <short name> <id>: <task in a few words>`, the name on the `MODEL:` line
  capitalised: `Codex Sol R1: review the diff`. The proxy gives a Codex agent what a Claude agent has, a card, Stop
  on it, one completion notification and a message to continue it, where a Bash task has none
  ([the agent map](references/incidents.md#the-agent-map)). The block's wording is measured
  ([the wrapper's message](references/incidents.md#the-wrappers-message),
  [a relay on a small model](references/incidents.md#a-relay-on-a-small-model)); copy it unchanged.
- A request is a command the sandbox would not run. An accept runs it as you, with no sandbox
  ([approvals.md](references/approvals.md)). A file change outside the writable roots is declined at once, never
  offered, and the run exits 6.

## The result's Codex part

- The report is also `<DIR>/out.json` once a turn ran; where publication failed, that file is the report the turn
  wrote.
- `receiptOk: false` on a run that claims success is a red flag
  ([receipts](references/environment-and-internals.md#receipt-validation-and-reporting)).
- `turnStatus: null`: no turn ran, and `error` says why
  ([Observability](references/environment-and-internals.md#observability)). With any other, read the turn's
  commands, answer and receipt before relaunching, or a paid turn is thrown away;
  `node "${CLAUDE_SKILL_DIR}/scripts/driver.mjs" --help` lists every exit code.
- A worktree agent's work comes back as `worktreeDiffPath` and, for untracked files not ignored,
  `worktreeUntrackedPath`. `worktreePreserved` not null: the tree is the artifact, not a harvest
  ([Worktree ledger and destination](references/environment-and-internals.md#worktree-ledger-and-destination)).
- After a waiting result or a `RUNNING=` hand-back no call holds the driver: Stop on the card reaches nothing, the
  pid in `<DIR>/err.txt` does
  ([Bounding or stopping an agent](references/environment-and-internals.md#bounding-or-stopping-an-agent)).

## What the user reads

As the shared page's [What the user reads](../orchestrate/references/external.md#what-the-user-reads) says, with
`Codex` kept on a Codex agent: the agent by name is the subject and what it does or did is the verb
("Codex Sol R1 reads the diff").

## References

- `node "${CLAUDE_SKILL_DIR}/scripts/driver.mjs" --help`: the flags, the fields and the exit codes; the launcher's `--help`: its refusals, the nine status lines, the waiting result and `--decide`.
- [models.md](references/models.md): the model and effort for each tier.
- [approvals.md](references/approvals.md): what an accepted command runs as, and what to read after.
- [environment-and-internals.md](references/environment-and-internals.md): environment, prompt files, stopping an agent, receipts, worktrees, locks, the commit grant, config drift.
- [result-gates.md](references/result-gates.md): how the evidence gates can be fooled, and checking the end state.
- [parity.md](references/parity.md): parity with native subagents, browser tests, pasted images.
- [incidents.md](references/incidents.md): the measured failures behind the rules.
- [adversarial-review.md](references/adversarial-review.md), [why-not-the-plugin.md](references/why-not-the-plugin.md), and the install page, [README.md](../../README.md).
