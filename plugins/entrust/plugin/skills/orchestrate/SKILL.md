---
name: orchestrate
description: >-
  User-invoked mode that turns this conversation into an orchestrator: scout inline, agree one plan, then push every verbose
  step (tests, tree-wide greps, source files, diffs, logs) onto Claude and Codex agents so the main context stays small.
disable-model-invocation: true
metadata:
  version: "0.23.0"
license: MIT
---

Plan from [codex-composition.md](references/codex-composition.md), the sibling's composition rules and rights table generated into this page's references. Load [codex](../codex/SKILL.md) (Skill tool, `entrust:codex`) once the plan has a Codex agent, before its launcher's `--plan`, and follow it for every Codex agent: rights, header fields, worktrees, the report and the exit
ladder live there and stay authoritative; this page re-cuts only what the mode changes. The mode adds no header field or flag and leaves the agent's own prompt file where the sibling puts it, and its own scripts, the runner and the linter, run a command or read a draft and write only under `$TMPDIR`. Every agent has a mailbox, so it can ask instead of
being declined at once. You are the
orchestrator; the work-list, the plan, the composition and the synthesis are yours, the rest is an agent's.

## Your own hands

| You do this yourself | You send this to an agent |
| --- | --- |
| scout the work-list with cheap commands (`ls`, `git status`, targeted `grep`) before any fan-out | test output, greps over the tree, reading source files, diffs, logs |
| a quick targeted edit that needs no exploration | any edit that needs exploring first |
| plan | design: the Fable agent, whatever your own model |
| synthesise, attributing every finding to the agent that produced it | verify: you never grade your own work, a fresh agent does |

What you read inline is re-read by every call after it: its cost is its size times the calls left in the session, so a 500-line diff read at the twentieth call of a hundred is read eighty more times, where an agent reads it once and returns thirty lines. Scouting is the only repository exploration you do. After it, an inline check is one command through the runner, answering one yes-or-no or one number in at most twenty lines read back; a second command on the same question goes to an agent. Redirect every check you run yourself through the runner, `node "${CLAUDE_SKILL_DIR}/scripts/capture-check.mjs" --label <question> --ledger <file> -- '<command>'`, one ledger file under `$TMPDIR` for the run (its `--help` has the rest): the whole output goes to a log under `$TMPDIR`, you read back its tail and its `EXIT=` line, and a pipeline's status is its failing stage's, not `tail`'s. Every brief, Claude or Codex, names the runner by the path above for any command whose output may pass twenty lines, and the return quotes each run's `EXIT=` line. Report a failed agent and never backfill it. The run directory is
`<state>/orchestrate/<project-slug>/<run>/`, `<state>` the driver's state directory (`${CLAUDE_PLUGIN_DATA}`), `<run>` unique and `<project-slug>` the working directory's absolute path with every character that is not a letter or
a digit replaced by `-`, the name Claude Code gives it under `~/.claude/projects/`. It is outside every repository, so no `.gitignore`; not the repository root, not the project's
`.claude/`, whose writes prompt whatever the allow rules say. The launcher and the driver create it, through `--report-file`, and it is what they make of it: a report per agent and, beside it, the launcher's `agent/` with the four files of the run, and the plan the launcher registered; nothing else is written there. Never run `mkdir`, Write or a shell redirect under that data directory yourself, because a headless session refuses each of them as a sensitive file with no prompt anyone can answer ([measured 2026-09-08](references/incidents.md#writes-under-the-data-directory)); and never write a decision file by hand: `--decide` is the one path.
A Claude agent's artifact is its returned text, and a file it must leave goes under `$TMPDIR` with the path in that text; Codex artifacts are the paths the agent's
own report names, under the same data directory; it is kept after the task and the user deletes it. A read agent is never asked to write, not under the repository and not in the
run directory: its artifact is its report, and a brief that asks a Codex read agent for a file there costs a refused write and exit 6 ([measured 2026-09-08](references/incidents.md#a-read-agent-asked-for-a-file)).

## The plan

1. First read `${CLAUDE_SKILL_DIR}/references/codex-composition.md` whole with the Read tool, before any decision: it holds the composition rules and the rights table the plan is made from. Read [plan.md](references/plan.md) the same way, `${CLAUDE_SKILL_DIR}/references/plan.md`: the plan's own rules, the composition and the pool, the card and its estimates, the caps, the environment check, a worktree agent's fitness and a bulk row. Scout, then decide the composition and the agents from it; load the sibling skill with the Skill tool once the plan has a Codex agent, and compose again by the Codex status it prints as it loads, the sixth rule, before anything is registered or shown.
2. With a Codex agent in the plan, register every agent, Claude or Codex, through the sibling's launcher, `--plan --run-dir <run>` (its `--help` gives the rows), and build the card from the rows it prints. An all-Claude plan skips the registration. Then show the plan as a card of five rows and stop; its rows are written as [plan.md](references/plan.md#the-card) says. The launcher refuses a Codex agent the registered plan does not list, and a Claude agent the card does not list is one you do not launch: amend the plan (`--plan --amend` when it was registered), show the amendment and wait for a word, as for the plan. A plan with three workers or more proposes a foreman, one Opus subagent that runs them for you so the user sees one card per worker instead of every call: [foreman.md](references/foreman.md).
3. The user's "go" covers only what the plan listed. After it, live-tree implementers write in the live working directory and an
   agent the plan put in a worktree stays there; no commit to the live tree without a separate word from the user.
4. A worktree agent's fitness is decided in the plan, as [plan.md](references/plan.md#a-worktree-agent) says: its tree is cut at `HEAD` and sees no live edit. A Codex worktree agent cannot commit under the rights a `RIGHTS:` line makes: its sandbox ends at the tree, so its work comes back as a diff, landed as [results.md](references/results.md#a-worktree-agents-harvest) says.
5. Fan out, verify, cross-review, then synthesise; name the composition that actually ran and what you dropped. Before the synthesis, read every return, Claude or Codex, into the five fields, each claim keeping the agent it came from; a return that does not parse is continued once for them, and after that its result is `unknown`. At the end of each phase — a fan-out's returns, a verification round, the synthesis — write one short paragraph of your own, in the user's language, naming each agent by its model, in the same shape for both sides, the agent by name as the subject and what it did as the verb, carrying what a verifier confirmed, what is pending and what blocks; a return arriving alone earns no paragraph unless it is a failure or a question for the user; the five fields are your own input, so never paste a five-field block, a header field name or a path into user-facing text. Draft the answer into a file under your temporary directory and lint it with `node "${CLAUDE_SKILL_DIR}/scripts/lint-draft.mjs" --agents "<Model> <id>, …" --receipts <ledger> <file>` until it exits 0, `--agents` naming every agent that ran and `--receipts` the run's ledger (its `--help` lists the rules). Before it goes out, check the run against the card and have the completeness critic read the frozen draft, both as [answer.md](references/answer.md) says; a run that had approvals says why, as [approvals.md](references/approvals.md#the-synthesis) says. What goes out is the draft's text and one line after it, the critic's verdict, "<Model> <id>: done", "partial" or "not done", counted in the draft's word bound. Nothing else follows the lint, no paragraph on the critic's return included: anything you must add is linted and frozen again, and the critic reads again.

## Model tiers

| Tier | Claude | Codex | Work |
| --- | --- | --- | --- |
| top | Fable | Astra | design, mentoring, [final review](references/roles.md) and verdict, decomposition you cannot do, a case stuck after two failed attempts. Never implementation |
| strong | Opus | Sol | write agents, non-trivial analysis |
| cheap | Sonnet | Terra | mechanical, hard-to-get-wrong work |
| bulk | Haiku | Luna | **outside the pool, with a pool of its own**: up to 50 alive at once. Fast, cheap and not clever — work that is wide rather than deep, and where a wrong answer does not quietly corrupt something. What to spend them on is yours to decide |

**Prefer Luna to Haiku in the bulk row**: measured better. The bulk row does not count against the alive cap and never takes a top-row role; announce its count before spawning, like any other fan-out. Its unit, its pilot, its count and its effort are set as [plan.md](references/plan.md#a-bulk-row) says, whether the batch runs as a swarm the plan proposed or as ordinary Codex agents launched as Mechanism says. Read [swarm](../swarm/SKILL.md) at `${CLAUDE_SKILL_DIR}/../swarm/SKILL.md` whole with the Read tool and launch it as that page says, forwarding the data directory, `CLAUDE_PLUGIN_DATA="${CLAUDE_PLUGIN_DATA}" node "${CLAUDE_SKILL_DIR}/../swarm/scripts/swarm.mjs" --units <file> --brief <template> --run <run directory> --concurrency <n>`, each swarm in a run directory of its own, since the launcher refuses a swarm's agent ids under a registered plan (E90).

- Tag every Claude Agent call with an explicit `model`: `opus` or `sonnet`, and `fable` only for Fable agents within the agreed cap;
  untagged, a subagent inherits your session model. Give it a description of the form "<Model> <id>: <task in a few words>", the id the card gave it, as a Codex agent's card carries "Codex <short name> <id>: <task in a few words>". A Codex agent's model is its `MODEL:` line, and every Codex agent carries one
  with a name from the table, never the config default; pass its Agent call no `model` and no `effort`: either is spent on the wrapper alone and never reaches Codex.
- Subagents may spawn subagents, but a Fable agent never spawns Fable: it tags its own Agent calls `opus` or `sonnet`; only you, or a
  foreman you launched, launch Fable agents.
- Every Codex agent carries an `EFFORT:` line chosen for its work, as it carries its `MODEL:` line, by the row [plan.md](references/plan.md#effort) gives it; only Astra in the top row goes without one.

## Bounds

| Bound | Default |
| --- | --- |
| simple task | 1 worker; the completeness critic beside it, not counted, and its verifier is you under the redirect rule or one agent when the check cannot run there |
| comparison or design | 2 to 4 agents |
| complex | 5 agents or more, launched in batches inside the alive cap |
| alive at once | 6, Claude and Codex together, the top pair counted in |
| Fable agents, Astra agents | 1 each, alive at a time |
| Codex write agents per directory | 1: a second on the same directory exits 10 at once, before its turn runs |

The caps count turns in progress: separate advisor, critic and architect threads may take turns within them, and a thread waiting for another message uses no slot. A Claude agent starts with the user's and the project's CLAUDE.md and the memory index in its context, whatever its brief says, and a Codex agent starts without them, so a blind or independent role on the Claude side still sees them. While another writer holds part of a checkout, nobody changes what they share: no stash, branch switch, reset, clean or rebase, and that binds you too when you run a check of your own. When two writers' work collides, repair it as [results.md](references/results.md#writers-collided) says. Run a check only when its result can change what happens next: a writer runs the checks that read the files it changed while it iterates, and the evidence that decides is those same checks run once on the tree that goes out, by an agent that did not write the code or by you under the redirect rule; a brief names those checks, not the whole suite.

## Mechanism

A Codex agent is one Agent call, the sibling's `One call` verbatim: in the background when agents run side by side and you work while they do, in the foreground for the one agent you wait for and for every agent in a headless session. `<REPORT>` is `<run>/<agent>/report.json` under the run directory above, and `<DIR>` the agent's directory, `agent/` beside it.
Wait for the agents you launch in the background, Claude or Codex, never on them: each one's return arrives on its own, its message first and its completion notification after (measured 2026-09-26). Never read an Agent task's output file for that return: it is the agent's whole transcript. For the Codex agents in the background, also launch one poll as a background Bash task over every alive one's `exit` and `approvals/pending` markers, one wake per event: `while :; do for d in <DIR>...; do [ -s "$d/exit" ] && { echo "DONE=<id>"; exit 0; }; [ -s "$d/approvals/pending" ] && { echo "ASK=<id>"; exit 0; }; done; sleep 5; done` — one task for the whole batch, not one per agent, and it exits the moment it prints either marker rather than looping on. Its line arrives as a notification beside the wrappers' hand-backs. `DONE=<id>` is that agent's own exit marker: read its report as [results.md](references/results.md) says, which also holds the next report path, a failed result and a harvest. `ASK=<id>` is that agent's own request waiting on your decision, as a wrapper's hand-back may be: decide it as [approvals.md](references/approvals.md) says. In an interactive session you may end your turn with agents alive: they go on, and each completion arrives as a turn of its own (measured 2026-09-27). A headless session ends with the turn and its background tasks are killed with it (measured 2026-09-08), so there never end a turn with an agent alive: launch each agent in the foreground, and its hand-back arrives inside the same turn ([measured 2026-09-17](../codex/references/incidents.md#foreground-background-and-the-ceiling)).
Launch independent Claude agents as background Agent calls, one notification each (in the foreground in a headless session); use Workflow only for a chain a script must decide (refute, then judge), as [plan.md](references/plan.md#a-workflow) says, and the Agent tool for continuing an agent. A subagent's final text is its return value, not a message to a human: say so in the brief.
Never launch an agent under another state directory while an armed agent is alive: containment is the driver's own inode check against its one state directory, and a peer under another one is outside what that check can see.

## Verification

- Scout inline first: the work-list is yours, before any fan-out.
- Critique the split before the fan-out: a top-row agent reads the decomposition, not the subject; twenty agents on a bad split agree and are all wrong ([measured 2026-09-12](references/incidents.md#the-split-critique)). It returns the corrected split as a file, the split critic row of [roles.md](references/roles.md). No worker brief exists before that file: each is written from it and names its path, and before a worker launches you check the files and interfaces its brief touches against the file's owners.
- Open one assembled brief whole before the fan-out; check its input paths in the agent's planned tree, its output paths against the agent's writable roots, its item count and each quoted claim against its source.
- Adversarial verify: a refuter returns `refuted` when its check ran and contradicted the claim and `unknown` when its decisive check could not run, never `refuted` for want of evidence; its brief is the refuter row of [roles.md](references/roles.md).
- Perspective-diverse verify: vary the angle across verifiers instead of N identical refuters.
- Read a unanimous fan-out as evidence about the prompt first: open one return whole before you trust the tally ([measured 2026-09-12](references/incidents.md#nineteen-of-twenty-on-one-broken-path)).
- Recommend only what an analysis stands behind: for each item the user must decide, the options analysis [answer.md](references/answer.md#a-recommendation) describes; an item with no such analysis goes to the user as a question with the options known so far, never as a recommendation.
- No silent caps: name every agent, check or item you dropped.

Fix, then cross-review, at most two rounds; then escalate to the Fable agent or the Astra agent, and to the user only when
that round fails too. Between selection rounds, record the candidates rejected, the evidence gained and the remaining blocker. Two rounds repeating the same blocker are a stall: show a new plan and wait for the word.

## The agent's return

Ask every prompt agent, Claude and Codex alike, for exactly these five fields, and send no `BRIEF:` line: the template is the bound, and `BRIEF:` would clip the answer at 20 lines. A field past the schema's cap goes whole into a file under the agent's temporary directory, named in `artifacts`, and the field keeps a summary with every material finding. A brief that wants a longer return names a copy of the schema file with larger caps. A verifier's brief names its target and the whole scope it must cover; its return says what it checked and, in `open`, what it did not. A finding is one that changes correctness or a stated requirement, the rest its `open`. The first line of `result` is one sentence a
reader can take on its own: the agent's model and id, its status and what it did ("Sonnet W5: done, four flaky width checks replaced by threshold checks"); the rest of the fields follow unchanged, and all five are yours to read, never to forward.

    status:    done | partial | blocked
    result:    at most 30 lines
    evidence:  what ran, with counts; a test without its count is not evidence
    artifacts: paths
    open:      questions and risks

In a Workflow they are a JSON schema, and a Claude agent takes the `schema` option. A Codex agent's `OUTPUT_SCHEMA:` line names
the five-field schema file the sibling ships, the path its `OUTPUT_SCHEMA:` row gives, and you read the fields from `answerJson` in
its report file. The file is `${CLAUDE_SKILL_DIR}/../codex/schemas/five-fields.schema.json`, strict (`additionalProperties: false` on every object, every property in `required`) and capped.
