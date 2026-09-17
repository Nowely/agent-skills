---
name: codex
description: >-
  Delegates tasks to Codex as a subagent with per-call rights: analysis that writes nothing of yours, or
  writing and tests in a managed git worktree, each reaching the network unless the call denies it. Use
  when a panel, refuters, or competing designs need an agent that does not share Claude's bias;
  when fanning out reviewers or adversarial verifiers; after two hypotheses fail;
  when a second independent implementation is wanted; or when the user names Codex, GPT, or "the other
  model" (через codex, через gpt, вторая имплементация, панель ревьюеров). It also governs requested
  mixes ("one of them codex", "half codex", "only codex") and refusals ("no codex", "just you"). Skip
  trivia and mechanical fact-gathering.
metadata:
  version: "0.15.0"
license: MIT
---

# Delegating to Codex

The **user** requests the work; the **coordinator** chooses and synthesises the composition; one Codex
**agent** performs one deliverable under rights declared in its prompt.

Everything below is addressed to the coordinator. What reaches the user is prose you write in their own
language: name the agent, say what it did, and say in ordinary words what it may write and where.

## Composition

Apply all five rules:

1. Announce the composition **before** starting any Codex run, naming the count and which agents are Codex.
2. Treat refusal as composition: for “no codex” or “just you”, run zero Codex agents and say the resulting
   panel is all-Claude and shares one model bias.
3. Attribute every finding; if a Codex agent failed or returned nothing, say so and never backfill it with
   a Claude answer.
4. Knowing the answer is not a reason to skip a requested second opinion.
5. Never add allow-rules on the user's behalf.

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

One background Agent call per agent: a native subagent, the **wrapper**, that launches the driver, waits for
it and returns when the report exists. Only a subagent is a subagent to Claude Code: a Bash task, whatever
its description says, is not on the agent map, is not stopped from it and is not continued by a message
(measured 2026-09-12 against the VS Code extension 2.1.269, whose map lists `local_agent` tasks alone). The
wrapper is what makes a Codex agent read like a Claude agent: one card under its description, Stop on the
card, one completion notification, and a message to continue it.

Write the prompt to a file with the Write tool, then spawn the wrapper with the Agent tool:
`subagent_type: codex-delegate:codex-agent`, `run_in_background: true`, and a `description` of
`Codex <short name> <id>: <task in a few words>` — `Astra` for `gpt-6-astra`, `Sol` for `gpt-5.6-sol`,
`Terra` for `gpt-5.6-terra`, `Luna` for `gpt-5.6-luna` — so the card the user sees names the agent, its
vendor and its task, and not the command line. That type is the agent this plugin ships,
[agents/codex-agent.md](../../agents/codex-agent.md): a relay with the Bash tool alone and its model pinned
in its own file, so its context is half a `general-purpose` subagent's (measured 2026-09-12: 8.2k against
15.4k tokens on the same agent). Pass it no `model`; the agent's model is the `MODEL:` line in its prompt
file. A clone-and-symlink install links that file into `~/.claude/agents/` ([README](../../README.md#install)),
where its type is the bare `codex-agent`.

The wrapper's message is the block below with its three placeholders filled in and nothing added or
removed; it never sees the agent's prompt. Inside it the driver runs as a background task,
`run_in_background: true` and no `&` of your own, and its exit status lands in a file of its own beside
the two output files; the wait after it is a foreground command the wrapper repeats until that status is
there, so the card stays working for as long as the agent does (measured: an eleven-minute agent took two
waits). That wait only reads and sleeps: this harness moves a wait that reaches the tool's ten-minute
ceiling into the background instead of ending it (measured 2026-09-12), so that one and the next run
together, and neither modifies a file. The driver prints its pid on the first line of `<DIR>/err.txt`
once it has accepted the report path, and a refusal before that point prints none. A `SIGTERM` to that
pid cuts the turn, sweeps its codex and publishes the report as `turnStatus: interrupted`, exit 1,
nothing left running.

    1. Run this exact command with the Bash tool, with run_in_background: true, and description "<DESCRIPTION>":

    CLAUDE_PLUGIN_DATA="${CLAUDE_PLUGIN_DATA}" node "${CLAUDE_SKILL_DIR}/scripts/driver.mjs" --prompt-file "<DIR>/prompt.txt" --report-file "<REPORT>" > "<DIR>/out.json" 2> "<DIR>/err.txt"; echo $? > "<DIR>/exit"

    2. Then run this exact command with the Bash tool, in the foreground, with timeout 600000, and description "<DESCRIPTION>, waiting":

    while [ ! -s "<DIR>/exit" ]; do sleep 5; done; echo WAIT_DONE=exit

    If that command ends without printing a WAIT_DONE line, run the very same command again, as many
    times as needed, until a WAIT_DONE line is printed. Never end your turn before a WAIT_DONE line is
    printed.

    3. Then run this one command in the foreground:

    D=unknown; test -s "<DIR>/exit" && D=$(cat "<DIR>/exit"); echo "DRIVER_EXIT=$D"; P=none; grep -qF "reportPath=<REPORT>" "<DIR>/err.txt" 2>/dev/null && P=own; grep -Eq 'already exists, or is a symbolic link|could not be published at' "<DIR>/err.txt" 2>/dev/null && P=taken; echo "PATH=$P"; node -e 'try{const r=require("<REPORT>");console.log("EXIT="+r.exitCode);const a=r.answerJson&&typeof r.answerJson.result==="string"?r.answerJson.result:r.answer;console.log("FIRST="+String(a||"").split("\n")[0].slice(0,300))}catch(e){console.log("EXIT=unknown");console.log("FIRST=")}'; test -f "<REPORT>" && echo FILE=exists || echo FILE=missing

    4. Your final message is exactly the WAIT_DONE line, the five lines step 3 printed, then one line
       REPORT=<REPORT>. Nothing else.

`<DESCRIPTION>` is the Agent call's own description. `<DIR>` is one `mktemp -d "${TMPDIR:-/tmp}/codex-agent.XXXXXXXX"` per agent: Write and Read expand nothing,
so they need the absolute path it prints. `<REPORT>` is an absolute path of this agent's own and never under `<DIR>`:
`<DIR>` sits in `$TMPDIR`, the one root a read agent may write, and a file the agent leaves at that name blocks publication
and then sits where you would read it as the agent's own report. Put it under the driver's state directory,
`<state>/reports/<run>/report.json` with `<run>` unique, or, under the orchestrate mode, `<run>/<agent>/report.json`
in the run directory that page names, one directory per agent; the driver makes every directory that path
needs, at 0700, so it may name a root your own Write and `mkdir` are refused.
The wrapper's completion notification is the agent's completion: read the wrapper's own lines first —
what the driver exited with, whose run the file at `<REPORT>` belongs to, whether it is there, the first
line of its answer — and read the file itself after a `PATH=own`. To continue an agent, write a second
prompt file with `RESUME: <threadId>` and send the wrapper one more command of the same shape; it runs it the same way and notifies again (measured 2026-09-12). A session with no
message tool, headless `-p` among them, continues the thread with a second wrapper given the same file,
at the cost of a second card (measured: the thread held both ways).

Every driver call forwards that variable under its own name — the plugin's own data directory, where the
driver's state and every Codex artifact the report names (`answerPath`, a worktree harvest) live. The
driver reads `CODEX_DELEGATE_STATE_DIR` first and that variable second, and with neither it exits 2; only
`--help` needs none. A clone-and-symlink install substitutes nothing for the placeholder, so the forwarded
value is empty there and the `CODEX_DELEGATE_STATE_DIR` the user exports decides ([README](../../README.md)
says where).

A read agent's prompt needs no header at all:

    TASK: …
    CHECK: …
    RETURN: …

For an isolated writer, one rights line above it (see
[Worktree lifecycle](#worktree-lifecycle) for what it contains):

    RIGHTS: worktree <repo>

Write a prompt you were handed VERBATIM: not a quote, not a `$`, not a header line it has, and add
nothing. A prompt with no `RIGHTS:` line is a read agent in the current directory; the driver decides that,
not you. Never create a directory, change a level or re-run with different flags to make a refused agent
succeed: measured, a wrapper that created the missing directory ran Codex with rights nobody granted.

## Rights

Choose the smallest `RIGHTS` that can complete and check the work:

| Prompt header | Codex may | Settle first? |
| --- | --- | --- |
| `RIGHTS: read [<dir>]` or no header | read any readable path, reach the network, run commands, write only `$TMPDIR`; the sandbox refuses a write anywhere else, and an approval request in its place is declined and recorded in `escalations` | no |
| `RIGHTS: worktree <repo>` | write in a driver-managed detached tree | say that a worktree will be made |
| `RIGHTS: write <dir>` | write under the live directory | yes; this chooses the blast radius |

`$TMPDIR` is granted at every level and `/tmp` at none; a write agent adds each settled `WRITABLE:` root
to what its row names. The driver refuses a server whose sandbox answers differently.

Every level reaches the network, as a native subagent does, and `NETWORK: no` denies the sandbox that —
not the provider's web search, which is `WEB_SEARCH:`'s own channel. Egress moves nothing on disk:
whatever an agent can read it can send, which at read level is every readable path. Each `WRITABLE: <dir>`
widens a write agent, as does removing a `NETWORK: no` the user settled: settle each with the user before
adding it, and never translate a refusal into broader rights. Every field is in
[Header fields](#header-fields) below; model, effort, gates, continuation and answer-shape choices
belong in that header, and the agent's rights in its `RIGHTS:` line, which is why the prompt is copied
into the file rather than rewritten: measured, a wrapper that rewrote one widened malformed rights and
reported false success
([A relay on a small model](references/incidents.md#a-relay-on-a-small-model)).

Read agents may share one cwd, but a repository whose tooling keeps a daemon, a socket, or a pid/state
file needs a distinct cwd or its own `TMPDIR` per concurrent agent; the failure is a native crash, not a
sandbox refusal.

A write agent sharing a live tree must not change what the tree shares: no stash, branch switch, reset,
clean or rebase while another writer holds part of it. Those move or discard work the other agent is
still editing, and no sandbox refuses them.

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
| `OUTPUT_SCHEMA:` | `<path to a strict JSON Schema file>` | the answer must parse as one JSON object |
| `MODEL:` | `<slug>`: `gpt-6-astra` (Astra), `gpt-5.6-sol` (Sol), `gpt-5.6-terra` (Terra), `gpt-5.6-luna` (Luna) | this agent needs a model other than the configured default; the short name is for prose, the slug for this line |
| `EFFORT:` | `none`, `minimal`, `low`, `medium`, `high`, `xhigh`, `max`, `ultra` | the task is worth more or less thinking |
| `WEB_SEARCH:` | `cached`, `indexed`, `live` | the agent needs sources it cannot read locally |
| `BRIEF:` | `yes` | a short answer is enough; omit it beside an output schema — it clips only the inline `answer` (`answerJson` is parsed from the whole one) yet still asks the model for 20 lines |
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
- `PATH=own` says the driver accepted `<REPORT>` and published there; `PATH=taken` says an entry was
  already there or another run published first, so the file is an earlier run's, whatever the numbers
  beside it say; `PATH=none` says the path was never accepted and no file of this run's exists.
  `DRIVER_EXIT` is what this invocation's driver exited with, `EXIT` the code inside the file.
- A refused path — not absolute, an unusable parent, an entry already there, a symlink included — makes
  no report for this run; an entry already there is left as it was, and `<DIR>/err.txt` names the
  refusal. Once the path is accepted, a refusal before the turn does reach the file, as
  `{ok: false, exitCode, turnStatus: null, error}`, while `out.json` stays empty.
- `FILE=missing` beside a `DRIVER_EXIT` is a run that ended without a report of its own: read
  `<DIR>/err.txt` for the reason and `<DIR>/out.json` for the report a turn wrote where publication
  failed; otherwise treat the result as unknown, and relaunch under a fresh report path where the work
  still needs doing.
- `exitCode: 0` means the completed turn passed its declared evidence gates. `answer` is the agent's text;
  with an `OUTPUT_SCHEMA:` line, `answerJson` is that answer already parsed.
- `exitCode: 3` is a cut; read the retained answer or partial and the `RESUME:` hint. Give the continuation a
  report path of its own: the driver refuses one already taken and exits 2 without publishing, which
  reaches you as `PATH=taken` over the earlier run's file.
- `exitCode: 10` is a held lock or a busy resumed thread: the report says `ok: false` and carries the
  refusal in `error`, and `<DIR>/err.txt` has it in full.
- Exit 2 has two shapes, and the report tells them apart. With `turnStatus: null` no turn ran: the reason
  is in `error` and there is no receipt. With any other `turnStatus` the turn ran and the server rejected
  the request: the reason is in `turnError`, and the commands, any retained answer and the receipt are
  real. Read them before relaunching, or a paid turn is thrown away.
- Exit 4 has two shapes. With `turnStatus: null` it is a refusal or an abort (a sandbox assertion, a
  signal before the thread, a transport failure): read `error` and `<DIR>/err.txt`; a `threadId` beside
  it means the thread had started and its rollout is the only record. With any other `turnStatus` — the
  server died mid-turn, or the report could not be published — the report is complete: read it like any
  post-turn code (commands, `answer`, `answerPath`, receipt).
- `escalations` is one entry per approval request the driver declined, whichever thread asked, and
  `exitCode: 6` is its rung — below timeout and the other cuts, so a cut run carries its entries and
  exits 3. An entry says a request was made and refused and no more: `detail` is the server's own wording
  clipped to 200 characters and is empty where it sent none, a command the sandbox denied outright need
  not raise one, and an entry is neither evidence that work was lost nor a reason to widen the rights.
- Any other non-zero is a gate verdict on the run; read the answer before deciding what to do.
- `receiptOk: false` on a run that claims success is a red flag; what the receipt proves and does not
  prove is in
  [environment-and-internals.md](references/environment-and-internals.md#receipt-validation-and-reporting).
- Evidence of success is root-thread-only: a Codex subagent thread's commands are liveness, not evidence.
- To stop an agent, stop its wrapper — Stop on the agent map or `TaskStop` — or send `SIGTERM` to the pid on the first line of `<DIR>/err.txt`:
  the driver interrupts the turn, writes the report it had earned and sweeps the codex process group.

## Prompt shape

Write a concrete, checkable body:

    TASK:   what to do
    CHECK:  the ground truth, preferably something the agent cannot guess
    RETURN: exactly what to hand back

Give one deliverable per agent. Split a return that asks for unrelated artifacts or decisions. Whatever `RETURN:`
asks for, its first line is one sentence a reader can take on its own, the agent's model and id, its status and
what it did; it is what the coordinator retells, and not itself a message to the user; the rest is the return's
own shape.

The standing rules are already on the thread — unattended, its egress and its web search each named
whichever way they went, a one-line record for a step that cannot run (the command, whether it started, its
exit status if any, the exact diagnostic), never claim a test passed without the count — so do not repeat them. A follow-up continues a thread with `RESUME: <threadId>`; a
recall-only one runs no commands, so it also needs `ALLOW_NO_COMMANDS: yes` (`--allow-no-commands` on a
command line).

## What the user reads

Every word on this page is addressed to the coordinator, and an agent's return is too. What reaches the user is
prose the coordinator writes: in the user's own language, naming an agent by its model and id and saying what it
did ("Sonnet W5 replaced four flaky width checks", "Codex Astra A6 reviewed the retry instructions") and not by
this page's own vocabulary. Keep `Codex` on a Codex agent: it is the only word in the name that says whose model ran. The sentence about an agent has one shape: the agent by name is the subject and what it does or did is the verb ("Codex Sol R1 reads the diff"); whatever runs beside it, and how long, follows in the user's own words for the tools. The model slug is machinery too, and so are `wrapper` and `driver`: the name is `Codex Sol R1`, never `gpt-5.6-sol`. A header field name, a status block, an internal
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

- `node "${CLAUDE_SKILL_DIR}/scripts/driver.mjs" --help` is the canonical inventory of the flags a coordinator sets; `--help-all` adds the rarely needed ones, the `CODEX_DELEGATE_*` variables and the internals.
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
