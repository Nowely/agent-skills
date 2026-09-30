---
name: codex
description: >-
  Delegates tasks to Codex as a subagent with per-call rights: analysis that writes nothing of yours, or
  writing and tests in a managed git worktree, each reaching the network unless the call denies it. Use
  when a panel, refuters, or competing designs need an agent that does not share Claude's bias;
  when fanning out reviewers or adversarial verifiers; after two hypotheses fail;
  when a second independent implementation is wanted; or when the user names Codex, GPT, or "the other
  model" (через codex, через gpt, вторая имплементация, панель ревьюеров), or names a Codex model by its
  short name (Astra, Sol, Terra, Luna; астра, сол, терра, луна). It also governs requested
  mixes ("one of them codex", "half codex", "only codex") and refusals ("no codex", "just you"). Skip
  trivia and mechanical fact-gathering.
metadata:
  version: "0.23.0"
license: MIT
allowed-tools: Bash(node *codex/scripts/status.mjs*)
---

# Delegating to Codex

The **user** requests the work; the **coordinator** chooses and synthesises the composition; one Codex
**agent** performs one deliverable under rights declared in its prompt.

Everything below is addressed to the coordinator. What reaches the user is prose you write in their own
language: name the agent, say what it did, and say in ordinary words what it may write and where.

The Codex this machine can run, asked of its server as this page loaded:

!`node "${CLAUDE_SKILL_DIR}/scripts/status.mjs"`

## Composition

Apply all six rules:

1. Announce the composition **before** starting any Codex run, naming the count and which agents are Codex; a
   read agent's rights need no sentence, since nothing is being approved.
2. Treat refusal as composition: for “no codex” or “just you”, run zero Codex agents and say the resulting
   panel is all-Claude and shares one model bias.
3. Attribute every finding; if a Codex agent failed or returned nothing, say so and never backfill it with
   a Claude answer.
4. Knowing the answer is not a reason to skip a requested second opinion.
5. Never add allow-rules on the user's behalf.
6. Compose from the Codex status the codex page printed as it loaded: a `CODEX=` line and, when it reads
   `ready`, one `MODEL=` line per model the account lists.
   - `ready`: every Codex agent's `MODEL:` is a listed short name. A model the user, a page or a tier names
     that is not listed is taken by the nearest listed one below it in Astra, Sol, Terra, Luna, or above it
     when none is below, and the plan says in one clause who stands in for whom.
   - `signed-out`, `missing`, or `MODEL=none`: zero Codex agents; the plan's first line says Codex is not
     signed in, not installed, or lists no model, and that the panel is all-Claude and shares one model bias.
   - `unchecked`: compose by the other rules, and the plan says Codex was not checked. A launch is no check:
     a signed-out server lists Astra and Sol too (measured 2026-09-29).
   - The command itself in place of those lines was not run: run it with the Bash tool before composing.

   The status lines stay with you: the plan names Codex's state only where it changed the composition.

| What the user says | Composition |
| --- | --- |
| “no codex”, “just you” | zero Codex agents |
| nothing | panels, refutation, competing designs: one dissenting Codex agent; mechanical fan-out or one ordinary task: zero |
| “a codex agent”, “one of them codex” | exactly one |
| “half codex” | half the agents, rounded up |
| “mostly codex” | every agent except the coordinator |
| “only codex”, “all codex” | every agent, including a one-agent task |
| “two of five codex” | exactly as stated |

A dissenting agent pays for decorrelation; mechanical fan-out does not. “Only codex” means Codex does the
task while the coordinator orchestrates and checks it.

## One call

One Agent call per agent: a native subagent, the **wrapper**, that launches the driver, waits for
it and returns when the run has ended. A Bash task, whatever its description says, is not on the agent map,
is not stopped from it and is not continued by a message
([the agent map](references/incidents.md#the-agent-map)); the wrapper gives a Codex agent what a Claude agent
has: one card under its description, Stop on the card, one completion notification, and a message to continue it.

Write the prompt with one Bash call, the launcher's `--new`, the heredoc quoted so nothing in it expands:

    CLAUDE_PLUGIN_DATA="${CLAUDE_PLUGIN_DATA}" node "${CLAUDE_SKILL_DIR}/scripts/agent-run.mjs" --new --report-file "<REPORT>" <<'PROMPT'
    MODEL: terra
    TASK: …
    CHECK: …
    RETURN: …
    PROMPT

A refusal prints its reason on an `ERROR=` line and no `PROMPT=`: spawn no wrapper on that result, and take a
mode the device refuses back to the user as a question, never to another mode. On `PROMPT=`, spawn the wrapper
with the Agent tool: `subagent_type: entrust:codex-agent`, `run_in_background: false` for the one agent you
wait for and `true` for agents that run side by side or while you work ([foreground and
background](references/incidents.md#foreground-background-and-the-ceiling)), and a `description` of
`Codex <short name> <id>: <task in a few words>` — `Astra`, `Sol`, `Terra` or `Luna`, the name on the
`MODEL:` line — so the card the user sees names the agent, its vendor and its task, and not the command
line. Pass it no `model`: the wrapper, [agents/codex-agent.md](../../agents/codex-agent.md), pins its own,
and the agent's model is the `MODEL:` line in its prompt file.

The wrapper's message is the block below with its two placeholders filled in and nothing added or
removed; the wrapper's own file repeats the steps
([the wrapper's message](references/incidents.md#the-wrappers-message)), and it never sees the agent's
prompt. The command is the launcher, one foreground call and no `&` of your own; its `--help` says what the
run does, what it refuses and what its nine status lines mean.

The Agent call, its message this block:

    1. Run this command with the Bash tool, in the foreground, with timeout 600000, and description "<DESCRIPTION>". Write no text before it.

    CLAUDE_PLUGIN_DATA="${CLAUDE_PLUGIN_DATA}" node "${CLAUDE_SKILL_DIR}/scripts/agent-run.mjs" --run --report-file "<REPORT>"

    2. If its result ends with RUNNING=, or is the harness's notice that it moved the command to the background, run the very same command again at once, and again each time either comes back. Each run is safe: the command waits for the run it already started. Do not open, tail or wait on the output file that notice names, and write nothing in between. Any other result, an empty one included, goes to step 3 as it is.

    3. Call SubagentHandback with exactly the lines that result printed, nothing added, nothing removed.

    4. After the hand-back result, and whenever the harness asks you for a visible response, write exactly one line, "<DESCRIPTION>: report delivered", and nothing else.

Both calls may go in one turn: the launcher waits ten seconds for a prompt a `--new` has not written yet. A
wrapper started beside a refused `--new` spends that report path: relaunch under `<run>/<id>-2/report.json`
after `<run>/<id>/agent/exit` exists (then `-3` after `-2` ends, and so on).
`<DESCRIPTION>` is the Agent call's own description. `<REPORT>` is an absolute path of this agent's own: put it
under the driver's state directory, `<state>/reports/<run>/report.json` with `<run>` unique, or, under the
orchestrate mode, `<run>/<agent>/report.json` in the run directory that page names, one directory per agent.
The launcher and the driver make every directory it needs, so it may name a root your own Write and `mkdir`
are refused. A relaunch takes a fresh report path, because the launcher refuses a directory that ran for
another report ([a reused agent directory](references/incidents.md#a-reused-agent-directory)). `<DIR>` is the
agent's directory, `agent/` beside `<REPORT>`. Files an agent leaves in its `$TMPDIR` are its own and stay
after the run, at the report's `tmpDir` ([Environment](references/environment-and-internals.md#environment)).

The wrapper's completion notification is the agent's completion: read the wrapper's own lines first, and
read the file itself after a `PATH=own` when those lines leave a question
([the wrapper's message](references/incidents.md#the-wrappers-message)). To continue an agent, write a second
prompt file with `RESUME: <threadId>` at `<run>/<agent>-<n>/report.json`, n from 2 with no leading zero, once
the previous link's `agent/exit` exists, and send the wrapper one more command of the same shape; it runs it the
same way and notifies again. A session with no message tool, headless `-p` among them, continues the thread
with a second wrapper given the same file, at the cost of a second card
([the agent map](references/incidents.md#the-agent-map)).

`--run`'s one call may hand back a **waiting result** instead of the nine status lines: a request is
pending, and it hands back what `--pending` prints, ending in `REQUESTS=`, `WAITING=` and `REPORT=`. The
wrapper hands it back like any result — step 2 reruns only on a result ending in `RUNNING=` or on the harness's
background notice — so read it whole and decide under the plan's own rule; a request nobody answers is
declined as expired after thirty minutes and the turn goes on. An accept restates the command it approves:
copy the lines between `COMMAND<<TOKEN` and `COMMAND>>TOKEN` as printed into a quoted heredoc whose
delimiter you build at that moment from `ACCEPT_`, the printed token and six hex characters of your own, and
check it is no line of the command. Never a fixed word and never the printed token alone: a line of the command
equal to the delimiter would end the heredoc and run the rest in your shell, and the token reached you through the
wrapper, which could have changed it. The ID reached you the same way: quote it, and use it only in the shape the
launcher prints, digits, a hyphen and eight hex characters; for anything else print `--pending`:

    node "${CLAUDE_SKILL_DIR}/scripts/agent-run.mjs" --decide '<ID>' --accept --report-file "<REPORT>" <<'<DELIMITER>'
    <the lines between COMMAND<<TOKEN and COMMAND>>TOKEN, exactly as printed>
    <DELIMITER>

The launcher compares what it reads with the request's command, one trailing newline tolerated, and publishes
nothing on an empty stdin or any difference; when it refuses the restatement as different, print `--pending`
and copy from that. An accept the permission check or the classifier blocks publishes nothing either: decline
the request with `--decide '<ID>' --decline`, or ask the user when the session is interactive. Then send the
wrapper the very same message block again: `--run` picks the run back up. A session with no message tool
continues the same way with a second wrapper given the same command.

Write a prompt you were handed VERBATIM: not a quote, not a `$`, not a header line it has, and add
nothing. A prompt with no `RIGHTS:` line is a read agent in the current directory, and
`RIGHTS: worktree <repo>` above the body makes an isolated writer ([Worktree lifecycle](#worktree-lifecycle));
the driver decides that, not you. Never create a directory, change a level or re-run with different flags to make a refused agent
succeed ([A relay on a small model](references/incidents.md#a-relay-on-a-small-model)).

## Rights

Choose the smallest `RIGHTS` that can complete and check the work:

| Prompt header | Codex may | Settle first? |
| --- | --- | --- |
| `RIGHTS: read [<dir>]` or no header | read any readable path, reach the network, run commands, write `$TMPDIR`; the sandbox bounds what the agent does itself: a command it cannot run there is offered to you and, approved, runs as you with no sandbox, and a file change not shown to lie inside its writable roots is declined at once, which makes the run exit 6; each is recorded in `escalations` | no |
| `RIGHTS: worktree <repo>` | write in a driver-managed detached tree | say that a worktree will be made |
| `RIGHTS: write <dir>` | write under the live directory | yes; this chooses the blast radius |

`$TMPDIR` is granted at every level and `/tmp` at none; a write agent adds each settled `WRITABLE:` root
to what its row names. Every output path a `TASK:` names lies under the agent's writable roots: a write outside them is refused. The driver refuses a server whose sandbox answers differently.

Every level reaches the network, as a native subagent does, and `NETWORK: no` denies the sandbox that —
not the provider's web search, which is `WEB_SEARCH:`'s own channel. Egress moves nothing on disk:
whatever an agent can read it can send, which at read level is every readable path. Each `WRITABLE: <dir>`
widens a write agent, as does removing a `NETWORK: no` the user settled: settle each with the user before
adding it, and never translate a refusal into broader rights: an approval under the plan is a decision on
one request, not a rights change. Every field is in
[Header fields](#header-fields) below; model, effort, gates, continuation and answer-shape choices
belong in that header, and the agent's rights in its `RIGHTS:` line, which is why the prompt is copied
into the file rather than rewritten
([A relay on a small model](references/incidents.md#a-relay-on-a-small-model)).

Read agents may share one cwd, and each has a `$TMPDIR` of its own, but a repository whose tooling keeps a
daemon, a socket, or a pid/state file in the tree needs a distinct cwd per concurrent agent; the failure is a
native crash, not a sandbox refusal.

A write agent sharing a live tree must not change what the tree shares: no stash, branch switch, reset,
clean or rebase while another writer holds part of it. Those move or discard work the other agent is
still editing, and no sandbox refuses them.

An accepted escape runs as the user, so two hazards ride with every accept, as they do with your own Bash:
a version-control query runs the repository's configured hooks, monitors and pagers, and a script runs the
bytes at its path when it runs, not the bytes you read.

## Header fields

The header is the leading run of upper-case `NAME: value` lines at column 0; the body starts at `TASK:` or
at the first line that is not one; a non-field upper-case `NAME:` above it is exit 2 naming it.

| Field | Value (booleans: `yes`, `true` or `1`; no line means off, and for `NETWORK:` means on) | A coordinator sets it when |
| --- | --- | --- |
| `RIGHTS:` | `read [<dir>]`, `worktree <repo>`, `write <dir>` | first, or not at all: no header is a read agent in the current directory |
| `NETWORK:` | `no` | this agent's own commands must not reach the network; no line leaves it the egress every level has, and `WEB_SEARCH:` is untouched either way |
| `WRITABLE:` | `<dir>`, repeatable | a write agent needs one more root than the directory it was given |
| `RESUME:` | `<threadId>`, `last` | this agent continues an earlier thread instead of opening one |
| `EXPECT:` | `<regex>` | the answer is only evidence if a command matching it ran AND succeeded; a matching command that exited non-zero does not count, and none matching is exit 5. Do not point it at a check whose failure IS the finding |
| `OUTPUT_SCHEMA:` | `<path to a strict JSON Schema file>`; the five-field schema for orchestrated agents ships at `${CLAUDE_SKILL_DIR}/schemas/five-fields.schema.json` | the answer must parse as one JSON object |
| `MODEL:` | `astra`, `sol`, `terra`, `luna`: the newest model of that name the catalogue lists, resolved before the turn; a full slug from the catalogue pins one version | this agent needs a model other than the configured default; in prose the name is capitalised |
| `EFFORT:` | `low`, `medium`, `high`, `xhigh`, `max`, and `ultra` where the model lists it, checked against the catalogue before the turn; no line inherits `~/.codex/config.toml` | the task is worth more or less thinking than the configured default; `low` for a one-line task |
| `WEB_SEARCH:` | `cached`, `indexed`, `live`: the provider's search tool, not the network, which every level reaches with no line and `NETWORK: no` denies | the user asked for the provider's web search; "the network is allowed" is not that ask. A mode the device refuses goes back to the user as a question, never to another mode |
| `BRIEF:` | `yes` | a short answer is enough; omit it beside an output schema — it clips only the inline `answer` on a valid return and still asks the model for 20 lines |
| `ALLOW_NO_COMMANDS:` | `yes` | the agent is recall-only and will run nothing |

One field is missing from that table on purpose. `VERIFY` is refused in a prompt file without `--allow-prompt-verify`,
a flag the one call above does not pass: it runs a caller-declared command after the turn, so an agent that could
write its own would be grading itself. Declare gates on the command line instead
([result-gates.md](references/result-gates.md)).

## Worktree lifecycle

- A new thread's worktree starts at current `HEAD`; a resumed worktree starts at its recorded base and
  restores its harvested diff and untracked files; neither copies live edits nor applies a stash.
- Staged, unstaged, untracked, ignored and installed files are absent. To put current work in, commit it
  first with the user's approval, or use an authorised live tree.
- The driver creates the tree under the repository's own `.claude/worktrees/`, and removes it after a
  successful harvest.
- A completed turn harvests tracked work to `worktreeDiffPath`.
- It archives non-ignored untracked files at `worktreeUntrackedPath`; `worktreeCommitsRef` is populated
  only where the caller's own `--verify` committed — an agent cannot commit without `WRITABLE: <repo>/.git`,
  a widening to settle first.
- After a successful harvest the driver removes the worktree.
- When the turn failed or harvest failed, the driver preserves it and reports `worktreePreserved`.
- A worktree run cut or refused before its turn reports those same two fields: `worktreePath` is the
  path the run named, and `worktreePreserved` the reason it was left there, or `null` where it was
  removed. A `git worktree add` that failed over a destination already on disk names that destination,
  which is not a tree this run made; a `--resume` rebuild that could not finish tries to remove its
  half-restored tree and reports `null` where it did, or the refusal where git kept it.
- A preserved tree is not a harvest: `worktreeDiffPath`, `worktreeUntrackedPath` and `worktreeCommitsRef`
  can all be null, so the landing recipe has nothing to apply. The tree itself is the artifact, at
  `worktreePath`; read it, take what is worth keeping, then remove it with
  `git -C <repo> worktree remove --force <path>`. Removing it discards whatever was never harvested.

## Reading the result

- `<REPORT>` is the report, the same JSON the run also wrote to `<DIR>/out.json` once a turn ran. Read
  the file: it is written whole or not at all, and a missing one means unknown, never success.
- Under a background call, the hand-back message and the task notification that follows it are one
  completion: read the first, and give the second the shortest reply the harness accepts
  ([foreground and background](references/incidents.md#foreground-background-and-the-ceiling)). A
  foreground call has no notification.
- On `EXIT=0` what reaches the user is the agent's name and its answer; the other lines are yours and stay with
  you ([the wrapper's message](references/incidents.md#the-wrappers-message)).
- `PATH=taken` means the file at `<REPORT>` is an earlier run's, whatever the numbers beside it say, and
  `PATH=none` that no file of this run's exists. `DRIVER_EXIT` is what this invocation's driver exited with,
  `EXIT` the code inside the file.
- `FILE=missing` beside a `DRIVER_EXIT` is a run that ended without a report of its own: read
  `<DIR>/err.txt` for the reason and `<DIR>/out.json` for the report a turn wrote where publication
  failed. Read `RECEIPT=` first: an `approvals=` token whose first number is not 0 says a command ran with
  your rights and no report says how it ended — that count is a decision, not an execution outcome. Read
  `<DIR>/approvals/` and check the tree and whatever the command touched before any relaunch, and never
  relaunch a prompt that would ask for the same thing again; then relaunch under a fresh report path where
  the work still needs doing.
- `RUNNING=` in place of `REPORT=` is a run still going whose wrapper handed back early: send the wrapper the
  same message again, or wait on `<DIR>/exit`; nothing was lost.
- `exitCode: 0` means the completed turn passed its declared evidence gates. `answer` is the agent's text;
  with an `OUTPUT_SCHEMA:` line, `answerJson` is that answer already parsed, and `answerPath` holds the
  complete answer where a size cap clipped either.
- Exit 2 and exit 4 each have two shapes. With `turnStatus: null` no turn ran: the reason is in `error` and
  `<DIR>/err.txt`, and a `threadId` beside it means the thread had started and its rollout is the only record.
  With any other `turnStatus` the turn ran, and its commands, any retained answer and the
  receipt are real: read them before relaunching, or a paid turn is thrown away.
- `exitCode: 6` is a request declined or expired unanswered, never one accepted; `escalations` holds one entry
  per approval request, its fields in
  [Observability](references/environment-and-internals.md#observability).
- Any other non-zero is a verdict on the run, and a cut (exit 3) keeps the answer or partial and a `RESUME:`
  hint: read the answer before deciding what to do. `driver.mjs --help` lists every code.
- `receiptOk: false` on a run that claims success is a red flag; what the receipt proves and does not
  prove is in
  [environment-and-internals.md](references/environment-and-internals.md#receipt-validation-and-reporting).
- Evidence of success is root-thread-only: a Codex subagent thread's commands are liveness, not evidence.
- To stop an agent, stop its wrapper — Stop on the agent map or `TaskStop` — or send `SIGTERM` to the pid on the first line of `<DIR>/err.txt`:
  the driver cuts the turn, sweeps the codex app-server's own process group and publishes the report as
  `turnStatus: interrupted`, exit 1. A command the agent was running inside the sandbox ends with it (measured
  once, 2026-09-29); a command run after an approval, outside the sandbox, has not been measured, so before a
  second writer enters a directory where a command was approved, run `pgrep -fl '<the approved command>'`
  yourself and wait for it — no driver code checks this for you. The driver runs under a keeper outside the
  wrapper's process tree, so only a forwarded signal reaches it, never a `SIGKILL` of the launcher; after a
  waiting result no call holds it, so stop it with `--decide 'ID' --decline` and the same `--run` again, or
  `kill -TERM` that same pid.

## Prompt shape

Write a concrete, checkable body:

    TASK:   what to do
    CHECK:  the ground truth, preferably something the agent cannot guess
    RETURN: exactly what to hand back
    ENVIRONMENT: staged inputs and their paths; known daemon or socket limits and runnable alternatives; flags that avoid an unwritable cache

For a write agent, or where repository tools need a daemon, fill `ENVIRONMENT:` with observed facts and staged paths, including the diff and trunk files when supplied. It is a body line after `TASK:`, not a header field. Give one deliverable per agent. Split a return that asks for unrelated artifacts or decisions.
A task that reads files names the read: one command per file, and `max_output_tokens` at the tool's output
cap, 10,000 today (`codex debug models` lists it under `truncation_policy`); a model left to choose sets its own
cap, often 1,000, and reads fragments ([A read cut to fragments](references/incidents.md#a-read-cut-to-fragments)).
Write `TASK:` in the
user's language: the agent answers in the language it is asked in
([language and name](references/incidents.md#language-and-name-in-a-return)). Whatever `RETURN:`
asks for, its first line is one sentence a reader can take on its own: the name you gave the agent in the prompt
("you are Codex Terra T1"), its status and what it did. Give the name; the model does not know its short name and
answers with whatever it calls itself ([language and name](references/incidents.md#language-and-name-in-a-return)).
That line is what the coordinator
retells, and not itself a message to the user; the rest is the return's own shape.

The standing rules are already on the thread — unattended, its effective writable roots and that `/tmp` is not one, its egress and its web search each named
whichever way they went, a one-line record for a step that cannot run (the command, whether it started, its
exit status if any, the exact diagnostic), never claim a test passed without the count — so do not repeat them. A follow-up continues a thread with `RESUME: <threadId>`; a
recall-only one runs no commands, so it also needs `ALLOW_NO_COMMANDS: yes` (`--allow-no-commands` on a
command line).

## What the user reads

Every word on this page is addressed to the coordinator, and an agent's return is too. What reaches the user is
prose the coordinator writes: in the user's own language, naming an agent by its model and id and saying what it
did ("Sonnet W5 replaced four flaky width checks", "Codex Astra A6 reviewed the retry instructions") and not by
this page's own vocabulary. Keep `Codex` on a Codex agent: it is the only word in the name that says whose model ran. The sentence about an agent has one shape: the agent by name is the subject and what it does or did is the verb ("Codex Sol R1 reads the diff"); whatever runs beside it, and how long, follows in the user's own words for the tools. The model slug is machinery too, and so are `wrapper` and `driver`: the name is `Codex Sol R1`, never the slug the report carries. A header field name, a status block, an internal
table's row name and an absolute path are machinery; they belong in a prompt or a report, and putting them in
front of a person says nothing they can act on. Rights are the one thing that must survive the translation: say
what an agent may write, and where, in ordinary words, because that is what the user is being asked to approve.

## Traps

- Phrase defensive work as robustness under unusual states; attack wording can trip a safety classifier.
- Read a non-zero result's answer; the exit judges evidence, not whether the answer exists.
- Treat `commandsPipedToPager` as sliced evidence: `head`, `tail`, and `less` can hide a failure and supply
  the pipeline status.
- Arm cleanup before background load and record each pid as it starts; trailing cleanup can orphan load.

## References

- `node "${CLAUDE_SKILL_DIR}/scripts/driver.mjs" --help` is the canonical inventory of the flags a coordinator sets; `--help-all` adds the rarely needed ones, the `ENTRUST_*` variables and the internals.
- `node "${CLAUDE_SKILL_DIR}/scripts/agent-run.mjs" --help` is what the wrapper's one command does: the run, its refusals and the nine status lines.
- Flags, fields, delivery, bounds, environment, receipts, and worktree internals:
  [environment-and-internals.md](references/environment-and-internals.md).
- Evidence gates and verifier semantics: [result-gates.md](references/result-gates.md).
- Capability and concurrency parity: [parity.md](references/parity.md).
- The measured failures behind the rules: [incidents.md](references/incidents.md).
- Commit blast radius: [environment-and-internals.md](references/environment-and-internals.md#git-directory-grant).
- Locks: [environment-and-internals.md](references/environment-and-internals.md#lock-design).
- Config drift: [environment-and-internals.md](references/environment-and-internals.md#configuration-key-oracle).
- Pasted images: [parity.md](references/parity.md#pasted-media-handling).
- Browser tests: [parity.md](references/parity.md#browser-mode-sandbox).
- Adversarial review: [adversarial-review.md](references/adversarial-review.md).
- Integration alternatives: [why-not-the-plugin.md](references/why-not-the-plugin.md).
- Installation and upgrades: [README.md](../../README.md).
