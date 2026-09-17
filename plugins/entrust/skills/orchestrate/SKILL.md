---
name: orchestrate
description: >-
  User-invoked mode that turns this conversation into an orchestrator: scout inline, agree one plan, then push every verbose
  step (tests, tree-wide greps, source files, diffs, logs) onto Claude and Codex agents so the main context stays small.
disable-model-invocation: true
metadata:
  version: "0.16.0"
license: MIT
---

Load [codex](../codex/SKILL.md) now (Skill tool, `entrust:codex`; bare `codex` on a
clone-and-symlink install) and follow it for every Codex agent: rights, header fields, worktree lifecycle, the report and the exit
ladder live there and stay authoritative; this page re-cuts only what the mode changes. The mode is prompt only: no driver
change, no new header field or flag, the agent's own prompt file and the driver's state directory unchanged. You are the
orchestrator; the work-list, the plan, the composition and the synthesis are yours, the rest is an agent's.

## Your own hands

| You do this yourself | You send this to an agent |
| --- | --- |
| scout the work-list with cheap commands (`ls`, `git status`, targeted `grep`) before any fan-out | test output, greps over the tree, reading source files, diffs, logs |
| a quick targeted edit that needs no exploration | any edit that needs exploring first |
| plan | design: the Fable agent, whatever your own model |
| synthesise, attributing every finding to the agent that produced it | verify: you never grade your own work, a fresh agent does |

Scouting is the only repository exploration you do, and targeted bounded checks stay allowed inline after it; report a failed agent and never backfill it. The run directory is
`<state>/orchestrate/<project-slug>/<run>/`, `<state>` the driver's state directory (`${CLAUDE_PLUGIN_DATA}` on a plugin install, the exported `ENTRUST_STATE_DIR` on the clone route), `<run>` unique and `<project-slug>` the working directory's absolute path with every character that is not a letter or
a digit replaced by `-`, the name Claude Code gives it under `~/.claude/projects/`. It is outside every repository, so no `.gitignore`; not the repository root, not the project's
`.claude/`, whose writes prompt whatever the allow rules say. The driver creates it, through `--report-file`, and it is what those report files make of it: nothing else is written there. Never run `mkdir`, Write or a shell redirect under that data directory yourself, because a headless session refuses each of them as a sensitive file with no prompt anyone can answer, while a subprocess handed the same path as an argument writes it unopposed (measured 2026-09-08).
A Claude agent's artifact is its returned text, and a file it must leave goes under `$TMPDIR` with the path in that text; Codex artifacts are the paths the agent's
own report names, under the same data directory; it is kept after the task and the user deletes it. A read agent is never asked to write, not under the repository and not in the
run directory: its artifact is its report, and a brief that asks a Codex read agent for a file there costs a refused write and exit 6 (measured 2026-09-08). Redirect a check you run yourself into a `mktemp` file and read back only a 5-line tail with the counts.

## The plan

1. Load the sibling skill with the Skill tool if it is not loaded yet, scout, then decide the composition and the agents.
2. Show the plan and stop, in the user's own language and in ordinary words: what will be done, who does each part by model name, what each may write, that the agents reach the network and any you are keeping off it, and that
   reports and artifacts land outside the repository, except a worktree agent's own tree, which the driver makes and removes inside the repository under its `.claude` directory. Name no path and no header field. A worktree agent is named as such, because a worktree will be made. Browser and end-to-end runs go to a Claude agent, or to a write agent with the grants parity.md's
   [Browser-mode sandbox](../codex/references/parity.md#browser-mode-sandbox) section names; a read agent cannot, because that section's Chromium override is a file in the tree it may not write.
   Announce the composition here, and the caps beside it in a sentence: your own model, one Fable and one `gpt-6-astra` at a time, six alive. A cap the user overrides in words ("two Fable")
   replaces the default for this run; composition words ("only codex", "no codex") follow the sibling's table. One plan when there is one; when several approaches are viable, show them all with a
   recommendation and let the user pick.
3. The user's "go" covers only what the plan listed. After it, live-tree implementers write in the live working directory and an
   agent the plan put in a worktree stays there; no commit to the live tree without a separate word from the user.
4. A new thread's worktree is cut at `HEAD`, so a worktree agent suits only work that starts there: competing implementations, a suite on
   committed code, atomically parallel work that must run its own tests. Never use one to test uncommitted live edits: it sees
   none of them and passes untouched code. When a plan needs both, the commit that feeds the worktree is a live-tree
   commit and goes into the plan; a stash feeds it nothing. Use one only where a fresh tree can run: dependencies installable inside it under the planned
   rights (the live checkout's are absent), no daemon or socket. You decide; ask when unsure. A Codex worktree agent cannot
   commit under the rights a `RIGHTS:` line makes: its sandbox ends at the tree, so its work comes back as a diff. Land the harvest by proposal: apply `worktreeDiffPath` and
   restore `worktreeUntrackedPath`, or merge or cherry-pick `worktreeCommitsRef` when the agent committed; show it, then wait,
   unless the plan said "land the winner". A preserved tree is not a harvest: check each of the three pointers first, and when they are null, propose from `worktreePath` instead.
5. Fan out, verify, cross-review, then synthesise; name the composition that actually ran and what you dropped. After any agent returns, Claude or Codex, write one short paragraph of your own, in the user's language and naming the agent by its model, in the same shape for both sides, the agent by name as the subject and what it did as the verb; the five fields are your own input, so never paste a five-field block, a header field name or a path into user-facing text.

## Model tiers

| Tier | Claude | Codex `MODEL:` | Codex short name | Work |
| --- | --- | --- | --- | --- |
| top | Fable | `gpt-6-astra` | Astra | design, mentoring, final review and verdict, decomposition you cannot do, a case stuck after two failed attempts. Never implementation |
| strong | Opus | `gpt-5.6-sol` | Sol | write agents, non-trivial analysis |
| cheap | Sonnet | `gpt-5.6-terra` | Terra | mechanical, hard-to-get-wrong work |
| bulk | Haiku | `gpt-5.6-luna` | Luna | **outside the pool, with a pool of its own**: up to 50 alive at once. Fast, cheap and not clever — work that is wide rather than deep, and where a wrong answer does not quietly corrupt something. What to spend them on is yours to decide |

Your own model is in your system prompt ("You are powered by the model named ..."); nothing else carries it. You are outside the
pool, and the pool is the same whatever you are: at most one Fable agent and one `gpt-6-astra` agent alive at a time, each taking
the top-row roles in turn, architect for one task and judge for the next, and the strong and cheap agents the alive cap admits.
**Prefer Luna to Haiku in the bulk row**: measured better and smarter, and four times cheaper. The bulk row does not
count against the alive cap and never takes a top-row role; announce its count before spawning, like any other fan-out.
The unit of a bulk fan-out is one claim, one address, a verbatim quote, and a verdict from a closed set that describes the subject and never the brief: whether an address moved or was wrong is a judgement about your own input, and it stays out of the set (measured 2026-09-12: a broken path in every brief drew the same verdict from nineteen of twenty agents).

- Tag every Claude Agent call with an explicit `model`: `opus` or `sonnet`, and `fable` only for the one Fable agent;
  untagged, a subagent inherits your session model. A Codex agent's model is its `MODEL:` line, and every Codex agent carries one
  with a slug from the table, never the config default: a Codex agent runs inside the `codex-agent` wrapper, whose model is pinned in its
  own file, so pass that Agent call no `model`; one written there, or an `effort`, is spent on the wrapper alone and never reaches Codex.
- Subagents may spawn subagents, but a Fable agent never spawns Fable: it tags its own Agent calls `opus` or `sonnet`; only you launch
  the pool's Fable agent.
- Every Codex agent carries an `EFFORT:` line chosen for its work, as it carries its `MODEL:` line: `low` for the bulk row
  and for mechanical work, `medium` for review, refutation and judgement in the strong and cheap rows; only a top-row agent
  goes without one and inherits the configured effort. Measured 2026-09-17: two Luna read agents at an inherited `xhigh`
  took 480 and 557 seconds and 1.2M and 2.3M tokens for a ledger and a grep task. In a Workflow, `effort: 'low'` is
  for mechanical Claude Sonnet stages only.

## Composition and bounds

This mode replaces one row of the sibling's [composition table](../codex/SKILL.md#composition), the "nothing" row:
when the user states no allocation, half the agents beyond the implementers, rounded up, are Codex, in the judgement roles: plan
critique, review, skeptics and refuters, judges. A one-agent task has no judgement agent and so no Codex agent unless cross-review
adds one. Everything else there holds: an allocation or refusal the user states, the announcement, attribution, no backfill, no
allow-rules. Implementers are not duplicated: one per task, split by ownership, and which side takes which is your call.
Cross-review runs the other way round, a Claude implementer's diff to a Codex agent and a Codex agent's diff to a Claude agent; a
cross-review agent is a prompt agent with the diff's path in `TASK:` and the template below in `OUTPUT_SCHEMA:`.

| Bound | Default |
| --- | --- |
| simple task | 1 agent |
| comparison or design | 2 to 4 agents |
| complex | 5 agents or more, launched in batches inside the alive cap |
| alive at once | 6, Claude and Codex together, the top pair counted in |
| Fable agents, `gpt-6-astra` agents | 1 each, alive at a time |
| Codex write agents per directory | 1: a second on the same directory exits 10 at once, before its turn runs |

Allocate inside those bounds by judgement, not to fill a band. Several writers at once is how a task goes faster: split by file ownership, as Claude agents on one live tree or as Codex agents in separate worktrees, never two Codex write agents on one directory. Disjoint filenames do not make work independent, so settle the contract between the owners before they start; when their work collides anyway, stop the writers, restate the contract, let each owner repair only its own files, then have an agent that wrote neither verify the combined tree. While another writer holds part of a checkout, nobody changes what they share: no stash, branch switch, reset, clean or rebase, and that binds you too when you run a check of your own. A writer may run the suite while it iterates, but the evidence that decides comes from an agent that did not write the code, or from you under the redirect rule.

## Mechanism

A Codex agent is one background Agent call, the sibling's `One call` verbatim: the `entrust:codex-agent` wrapper, its message the sibling's block with `<DIR>`, `<REPORT>` and the description filled in, which runs the driver as a background Bash task and waits for its exit status. `<DIR>` is the sibling's own `mktemp -d`, holding `prompt.txt`, `out.json`, `err.txt` and the driver's `exit` marker, and `<REPORT>` is `<run>/<agent>/report.json` under the run directory above, which the driver creates. The wrapper's completion notification is when you read its status lines, and the report after a `PATH=own`. The wrapper is an `agentType` of its own, `entrust:codex-agent` (bare `codex-agent` on the clone route); what the agent map shows is its card under the description, and Stop on that card reaches the driver. Stop one by stopping its wrapper. The Agent call carries a `description` of the form "Codex <short name> <id>: <task in a few words>", so the card the user sees names the agent, its vendor and its task, not the command line.
Wait on every agent you launch in the background, Claude or Codex, and never end your turn with an agent alive: a headless session ends with the turn and the task is killed with it (measured 2026-09-08). For a Codex agent, launch `until [ -s "<DIR>/exit" ]; do sleep 5; done; echo DONE=<id>` as a background Bash task and call `TaskOutput(<poll_task_id>, block: true, timeout: 600000)` on that task, again while it runs; then read the wrapper's own lines at its completion notification. For a Claude agent, call the same `TaskOutput` on its Agent task, again while it runs, and read its return when it finishes. A blocking `TaskOutput` on a running wrapper returned 32 KB of its transcript at the timeout and the poll one line (measured 2026-09-15 and 2026-09-16, seven of seven each).
Your user's invocation of this skill authorises Workflow. A Workflow reports nothing until its last agent returns, so an agent that ends early stays invisible behind its siblings (measured 2026-09-08: an agent's exit at minute 9 surfaced only when the user asked, while its sibling ran 18 minutes). Launch independent Claude agents as background Agent calls, one notification each; use Workflow only for a chain a script must decide (refute, then judge), and the Agent tool for continuing an agent. Load the `workflow-authoring` skill before writing the script when the session lists it.
`agent(prompt, {label, phase, schema, model, effort, agentType, isolation})` returns the agent's final text, or the validated
object when `schema` is given. `pipeline(items, ...stages)` runs items through stages with no barrier, `parallel(thunks)` is a barrier for when
every result must exist before the next decision. A subagent's final text is its return value, not a message to a human: say so
in the brief.

## Verification

- Scout inline first: the work-list is yours, before any fan-out.
- Critique the split before the fan-out: a top-row agent reads the decomposition, not the subject, for what the cut lost, what the wording added, which items are two and which the fan-out's rights cannot decide; twenty agents on a bad split agree and are all wrong (measured 2026-09-12: it caught two claims true at one release and false at the next, and they never reached the fan-out).
- Adversarial verify: a refuter defaults to `refuted` when it is uncertain.
- Perspective-diverse verify: vary the angle across verifiers instead of N identical refuters.
- Read a unanimous fan-out as evidence about the prompt first: open one return whole before you trust the tally (measured 2026-09-12: nineteen of twenty verdicts answered one broken path in every prompt).
- Judge panel for a design task.
- Completeness critic at the end: what is missing, unverified, unread.
- No silent caps: name every agent, check or item you dropped.

Fix, then cross-review, at most two rounds; then escalate to the Fable agent or the `gpt-6-astra` agent, and to the user only when
that round fails too.

| Result | What to do |
| --- | --- |
| `FILE=missing`, or `PATH=taken` | `DRIVER_EXIT` is the driver's own status: with one, this run is over and `<DIR>/err.txt` says why — a refused report path, an unusable parent, a path another run published to first — so read `<DIR>/out.json` for a report a turn wrote where publication failed, otherwise treat the result as unknown and relaunch once, same rights, under a fresh report path where work remains. With `DRIVER_EXIT=unknown` nothing ended it: `kill -0 <pid>` with the pid on the first line of the stderr file says whether it is still running |
| a stderr file naming no driver | report it; no relaunch fixes an install |
| `exitCode: 3`, a cut | read the partial; if the work is unfinished, continue that thread once with `RESUME:`, under a report path of its own |
| `exitCode: 10` | a held lock or a busy thread: read `error` and the stderr file, wait for the holder, then run again; not a retry |
| exit 2 or 4 | with `turnStatus: null` no turn ran, or it was aborted: read `error` and the stderr file. Exit 2 WITH a `turnStatus` is a turn the server rejected: read `turnError`, the commands and any answer before relaunching, or a paid turn is thrown away. A `DRIVER_EXIT=2` beside `PATH=taken` is neither: the path was already taken, nothing of this run reached the file, and the report there is an earlier run's |
| exit 4 with a `turnStatus` | the server died mid-turn or the report was not delivered: the report is complete, read it as a gate verdict |
| any other non-zero `exitCode` with an answer | a gate verdict: do not retry, read the answer |
| a Claude agent that returns `blocked` | do not retry, report it |

## The agent's return

Ask every prompt agent, Claude and Codex alike, for exactly these five fields, and send no `BRIEF:` line: the template is the bound, and `BRIEF:` would clip the answer at 20 lines. The first line of `result` is one sentence a
reader can take on its own: the agent's model and id, its status and what it did ("Sonnet W5: done, four flaky width checks replaced by threshold checks"); the rest of the fields follow unchanged, and all five are yours to read, never to forward.

    status:    done | partial | blocked
    result:    at most 30 lines
    evidence:  what ran, with counts; a test without its count is not evidence
    artifacts: paths
    open:      questions and risks

In a Workflow they are a JSON schema, and a Claude agent takes the `schema` option. A Codex agent takes the same five fields
as a strict JSON Schema file (`additionalProperties: false` on every object, every property in `required`) named on its
`OUTPUT_SCHEMA:` line, and you read them from `answerJson` in its report file:

    {"type":"object","additionalProperties":false,"required":["status","result","evidence","artifacts","open"],"properties":{"status":{"type":"string","enum":["done","partial","blocked"]},"result":{"type":"string"},"evidence":{"type":"array","items":{"type":"string"}},"artifacts":{"type":"array","items":{"type":"string"}},"open":{"type":"array","items":{"type":"string"}}}}
