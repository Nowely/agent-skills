# External Codex in an orchestrated Claude session

Read this only when the orchestration plan uses this adapter. Native Codex agents use the
host's delegation facilities and do not use these commands. The orchestration skill owns the
plan, roles, five-field return and verification; this page owns the external transport.

Resolve `<codex-skill-dir>` from the loaded codex skill and `<orchestrate-skill-dir>` from its
sibling installed directory. `<state>` is the driver's state directory named by the codex
skill; substitute the resolved paths in commands. Dynamic skill variables are not expanded
when a reference is read as a plain file.

## Contents

- [Composition](#composition), [registering the plan](#registering-the-plan), [state](#state-and-artifacts)
- [Models](#model-tiers), [bounds](#bounds), [Workflow](#a-workflow), [mechanism](#mechanism)
- [Coordinator](#delegated-coordinator), [completion](#done-running-and-the-next-report-path), [result](#the-result)
- [Harvest](#a-worktree-agents-harvest), [collisions](#writers-collided), [request](#deciding-a-request), [rule](#the-rule), [synthesis](#the-synthesis)

## Composition
This mode replaces one row of the sibling's [composition table](../SKILL.md#composition), the "nothing" row: when the user states no allocation, half the agents beyond the implementers, rounded up, are Codex, in the judgement roles: plan critique, review, skeptics and refuters, judges. A one-agent task has no judgement agent beyond the completeness critic, and so no Codex agent unless cross-review adds one. Everything else there holds: an allocation or refusal the user states, the announcement, attribution, no backfill, no allow-rules. Implementers are not duplicated: one per task, split by ownership, and which side takes which is your call. Cross-review runs the other way round, a Claude implementer's diff to a Codex agent and a Codex agent's diff to a Claude agent.

Allocate inside the page's bounds by judgement, not to fill a band; [roles.md](../../orchestrate/references/roles.md) defines the responsibility, rights and return of each role seen so far, and a new one is named the same way. Run a decisive check before commissioning a panel. Keep dependent execution in one agent; keep its verification independent. Several writers at once is how a task goes faster: split by file ownership, as Claude agents on one live tree or as Codex agents in separate worktrees, never two Codex write agents on one directory. Disjoint filenames do not make work independent, so settle the contract between the owners before they start; work that collides anyway is repaired as [results.md](#writers-collided) says.


## Registering the plan

After the adapter's status check has established the available models, register every agent,
Claude or Codex, with `node "<orchestrate-skill-dir>/scripts/agent-run.mjs" --plan --run-dir <run>`
(the launcher's `--help` defines the rows). Build the card from those rows before presenting it.
Use `--plan --amend` for an approved amendment; the launcher refuses an unlisted Codex agent.
An all-native plan needs no driver registration or state directory.

Every external worker uses `OUTPUT_SCHEMA: <codex-skill-dir>/../orchestrate/schemas/five-fields.schema.json`
for the shared return, without `BRIEF:` (which would clip its answer). Read those fields from
`answerJson` in the report. A requested larger return uses a copied schema with adjusted caps.

## State and artifacts

The run directory is `<state>/orchestrate/<project-slug>/<run>/`, `<state>` the driver's state directory,
`<run>` unique and `<project-slug>` the working directory's absolute path with every character that is not a
letter or a digit replaced by `-`. It is outside every repository, so no `.gitignore`. The launcher and the
driver create it, through `--report-file`, and it is what they make of it: a report per agent and, beside it,
the launcher's `agent/` with the four files of the run, and the plan the launcher registered; nothing else is
written there, by you included, and never a decision file by hand: `--decide` is the one path.
A Claude agent's artifact is as the [claude adapter](../../claude/SKILL.md#agent-calls) says. Codex artifacts
are the paths the agent's own report names, under the state directory; they stay until the system clears its
temporary directory or the cleanup removes them. A read agent is never asked to write, not under the
repository and not in the run directory: its artifact is its report, and a brief that asks a Codex read agent
for a file there costs a refused write and exit 6 ([measured](incidents.md#a-read-agent-asked-for-a-file)).

## Model tiers

A Codex agent's model and effort come from [models.md](models.md), a Claude agent's from the
[claude adapter](../../claude/SKILL.md). Every Codex agent carries a `MODEL:` line with a name from the
table, never the config default, and the `EFFORT:` line its row gives; pass its Agent call no `model` and
no `effort`: either is spent on the wrapper alone and never reaches Codex. Its card description is
"Codex <short name> <id>: <task in a few words>". Use current or user-supplied price estimates with their
source; do not hard-code volatile ratios. For bulk batches, keep the unit and pilot rules in
[plan.md](../../orchestrate/references/plan.md#a-bulk-row). The adapter's pool and launch protocol remain
authoritative for an actual swarm.

## Bounds

Orchestrate's [bounds](../../orchestrate/SKILL.md#capacity-and-models) hold, and one Codex write agent per
directory: a second on the same directory exits 10 at once, before its turn runs. A waiting thread frees a slot
only when the runtime says so. A Codex agent starts without the user's and the project's CLAUDE.md and memory
index, which every Claude agent has. While another writer holds part of a checkout, nobody changes what they
share: no stash, branch switch, reset, clean or rebase, and that binds you too when you run a check of your own.
When two writers' work collides, repair it as [results.md](../../orchestrate/references/results.md#writers-collided)
says. A brief names the checks that read the files its writer changed, not the whole suite.

## A Workflow

Use a Workflow as the [claude adapter](../../claude/SKILL.md#workflow) says; in the script, a Codex agent's
`agentType` is `entrust:proxy`.

## Mechanism


A Codex agent is one Agent call, the sibling's `One call` verbatim: in the background when agents run side by side and you work while they do, in the foreground for the one agent you wait for and for every agent in a headless session. `<REPORT>` is `<run>/<agent>/report.json` under the run directory above, and `<DIR>` the agent's directory, `agent/` beside it.
Wait for background agents as the [claude adapter](../../claude/SKILL.md#waiting) says. For the Codex agents in the background, also launch one poll as a background Bash task over every alive one's `exit` and `approvals/pending` markers, one wake per event: `while :; do for d in <DIR>...; do [ -s "$d/exit" ] && { echo "DONE=<id>"; exit 0; }; [ -s "$d/approvals/pending" ] && { echo "ASK=<id>"; exit 0; }; done; sleep 5; done` — one task for the whole batch, not one per agent, and it exits the moment it prints either marker rather than looping on. Its line arrives as a notification beside the wrappers' hand-backs. `DONE=<id>` is that agent's own exit marker: read its report as [the result](#the-result) says, which also holds the next report path, a failed result and a harvest. `ASK=<id>` is that agent's own request waiting on your decision, as a wrapper's hand-back may be: decide it as [the rule](#the-rule) says. In a headless session launch each agent in the foreground, as the [claude adapter](../../claude/SKILL.md#waiting) says; its hand-back arrives inside the same turn.
Never launch an agent under another state directory while an armed agent is alive: containment is the driver's own inode check against its one state directory, and a peer under another one is outside what that check can see.


## Delegated coordinator

A foreman is launched as the [claude adapter](../../claude/SKILL.md#the-foreman) says. Give it the
approved plan and quoted user authority, the generic foreman role and this adapter's paths and rules; it
keeps the parent's user conversation out of its return. Its `entrust:proxy` wrappers run in the
foreground like its Claude workers.

## DONE, RUNNING and the next report path

`DONE=<id>` is that agent's own exit marker: it says the run has ended even after a `RUNNING=` hand-back, and you read the report file after it (measured 2026-09-27). A continuation or a relaunch goes under the agent's next report path, `<run>/<agent>-<n>/report.json`, which a registered plan admits for a listed Codex agent once the run before it has ended. A wrapper that has handed back `RUNNING=` lines or a waiting block has no call in flight: stop that run with `SIGTERM` to the pid on the driver's pid line in `<DIR>/err.txt`, `entrust: pid=<n> identity=… reportPath=…`, or spawn the wrapper again to get a card back.

## The result

Read the sibling's [Reading the result](../SKILL.md#reading-the-result) for the report's fields, the exit codes and `PATH=taken`; under this mode:

| Result | What to do |
| --- | --- |
| `FILE=missing`, or `PATH=taken` | Read `RECEIPT=` first: an `approvals=` token whose first number is not 0 says a command ran with your rights and no report says how it ended — that count is a decision, not an execution outcome. Read `<DIR>/approvals/` and check the tree and whatever the command touched before any relaunch, and never relaunch a prompt that would ask for the same thing again. Only once that is clear, treat the rest as unknown and relaunch once, same rights, under the agent's next report path where work remains. With `DRIVER_EXIT=unknown` nothing ended it: `kill -0 <pid>` with the pid on the driver's pid line in the stderr file, `entrust: pid=<n> identity=… reportPath=…`, says whether it is still running |
| a stderr file naming no driver | report it; no relaunch fixes an install |
| `exitCode: 3`, a cut | if the work is unfinished, continue that thread once with `RESUME:`, under the agent's next report path |
| `exitCode: 10` | a held lock or a busy thread: read `error` and the stderr file, wait for the holder, then run again; not a retry. A holder that waits on your own decision has an `ASK=` in your poll: answer it before you wait on the holder. Before a second writer enters a directory where a command was approved, check for its survivors yourself: `pgrep -fl '<the approved command>'` and wait for it — the lock does not prove they are gone |
| exit 2 or 4 | Exit 2 WITH a `turnStatus` is a turn the server rejected: read `turnError`. A `DRIVER_EXIT=2` beside `PATH=taken` says the path was already taken: nothing of this run reached the file, and the report there is an earlier run's |
| exit 4 with a `turnStatus` | the server died mid-turn or the report was not delivered: the report is complete, read it as a gate verdict |
| any other non-zero `exitCode` with an answer | a gate verdict: do not retry |
| a Claude agent that returns `blocked` | do not retry, report it |

## A worktree agent's harvest

Land the harvest by proposal: apply `worktreeDiffPath` and restore `worktreeUntrackedPath`, or merge or cherry-pick `worktreeCommitsRef` when the agent committed; show it, then wait, unless the plan said "land the winner". A preserved tree is not a harvest: check each of the three pointers first, and when they are null, propose from `worktreePath` instead.

## Writers collided

When two writers' work collides anyway, stop the writers, restate the contract, let each owner repair only its own files, then have an agent that wrote neither verify the combined tree.


## Deciding a request

`ASK=<id>` is that agent's own request waiting on your decision, and the wrapper's own hand-back may carry the same waiting block instead of the nine lines: read it whole from that hand-back or with `--pending`, decide it as the rule below says, send the wrapper the very same message block again, then launch the poll again over the agents still alive and keep waiting; an armed agent is launched and waited for like any other. The block's other lines, `LATE=`, `STALE=` and `ORPHANED=`, mean what the launcher's `--help` says under `--pending`, and an accept restates the command between `COMMAND<<TOKEN` and `COMMAND>>TOKEN` as the sibling's [Accept](../references/approvals.md#accept) shows.

## The rule

A Codex agent can ask before it runs a command. Approving it runs the command as you, with no sandbox, the way every Claude agent in this session already runs; the line for Codex is not stricter than for Claude. Read the request whole and approve nothing you have not read. Decide from the waiting result the wrapper handed back, and answer with the sibling's [`--decide` call](../references/approvals.md#accept). Approve a request that is non-destructive and in the plan's direction: a query, a read, a fetch of a source the plan named, a file written where the plan said files go, a deletion inside the agent's own temp root (`ROOTS=` names it), a signal to a process the agent started (`ps -o pid,ppid` shows it below the driver, the pid on its pid line in `<DIR>/err.txt`, `entrust: pid=<n> identity=… reportPath=…`), a `codex sandbox` check the plan named, which runs one command under Codex's sandbox and ends with it. Take to the owner, while the turn waits, a request that is destructive or irreversible, or outside the plan: a deletion beyond the agent's own temp root, a signal to a process the agent did not start or whose parentage `ps` cannot show, a process tree the driver cannot stop (a nested Codex agent, a server, a watcher), a write the plan did not place, a command that names `~/.codex` or the plugin's state directory. In a headless run decline it and name it in the answer. When you retell an approval, say what the entry's `outcome` says: "it ran and exited 0", or "whether it ran is not known".

## The synthesis

When the run had approvals, the synthesis says why in one sentence per cause and what avoids it next time: `rights`, the driver answered and nothing changes; `asked`, Codex asked before running the command, and nothing on our side changes it; `outside`, the plan needs a `WRITABLE:` line or a different agent for that file, or, for a permissions request, the rights the plan sets at launch.
