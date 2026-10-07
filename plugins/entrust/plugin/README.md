# entrust

A plugin for native subagent orchestration in Codex and Claude Code. `orchestrate` owns the plan,
roles, independent verification and synthesis. In Claude, the existing `codex` adapter can also
launch external OpenAI Codex agents with per-call rights, worktrees, evidence gates and receipts.

## In Codex

```bash
codex plugin marketplace add Nowely/agent-skills
codex plugin add entrust@nowely
```

Invoke `$entrust:orchestrate`. It uses native delegation without loading the `codex` adapter.
Models, concurrency and nested delegation follow the current host's capabilities. The coordinator
is a role in `skills/orchestrate/references/foreman.md`, not a separate skill. Other skills can be
used when the task needs them. The external-run helpers described below retain their Claude
adapter requirements; native compatibility of every installed skill is not implied.

Asking for an external model as the main coordinator (“Прокси на <model>”) makes that model, through
[opencode](skills/opencode/SKILL.md), own the plan, the choice of subagents and the interpretation of
results; the current conversation forwards complete messages, executes its agent orders and manages
worker lifecycle, and the same external session continues across user messages. This selects a role,
not the host's model. Asking to call one external model (“Позови <model>: проверь diff”) delegates one
worker. In Codex, each external session gets one native bulk-tier proxy thread, with intermediate
callbacks and full replies.

## In Claude

The sections below describe the external Codex adapter and its dependent features.

## Goal

A coordinator agent that has loaded this skill must be able to launch a Codex subagent
on the first attempt and get a finished, verifiable answer back, with nothing to configure and nothing
to know in advance. The defaults have to produce what a native Claude Code subagent does: one call, it
waits as long as the work takes, it returns the answer, and it is stopped only by silence or by the
coordinator. Everything else here serves that. Rights are declared per call so the coordinator never
wonders what the agent may touch; exit codes are derived from evidence so an agent that did nothing cannot
report as though it had; a prompt with no header at all is a read agent in the current directory. Where a
knob and a default compete, the default wins. Where a rule must be known to succeed, that is a defect in
this repository, not in the coordinator.

A second, user-invoked skill applies the same goal to the whole session. `/entrust:orchestrate`
turns the main conversation into an orchestrator that scouts inline, agrees one plan, and pushes every
verbose step onto agents; its common protocol is independent of the external adapter ([skills/orchestrate/SKILL.md](skills/orchestrate/SKILL.md)).

A third, `/entrust:cleanup`, lists what the plugin has left on this machine, suggests what is safe to remove
and deletes only the items you pick by number; the listing gives the reason it keeps each other item
([skills/cleanup/SKILL.md](skills/cleanup/SKILL.md)).

Two more are experiments with a page of their own. `/entrust:advisor` adds a standing top-row advisor of
the other model family to one run, asked one question at each decision point, with every decision
recorded before and after ([skills/advisor/SKILL.md](skills/advisor/SKILL.md)); it states no benefit until
[protocol E3](https://github.com/Nowely/agent-skills/blob/main/plugins/entrust/research/protocols.md#e3-the-standing-advisor-against-per-call-advice) has run.
`/entrust:swarm` has one script make up to fifty bulk agents over a file of units through the sibling
launcher, with a concurrency cap and one summary for a cheap reducer
([skills/swarm/SKILL.md](skills/swarm/SKILL.md)); an orchestrate plan may also propose one for a bulk batch, which
the user's "go" starts. Shared state and free messaging between agents are E4's arms, never the default.

A sixth, `/entrust:prepare-feedback`, turns your own Claude Code sessions into a report on a plugin: it finds
the sessions where entrust or terse loaded, has orchestrated agents read them under one focus (a release, one
run, where its time and tokens went, your feedback on a topic, all of these at once, or a question of your own) and
hands back an issue title and body, or, inside a checkout of this repository, a research run on a worktree branch
([skills/prepare-feedback/SKILL.md](skills/prepare-feedback/SKILL.md)). What it reads stays in a private folder
under the plugin's data directory, and an agent that wrote none of the report checks every detail before it
leaves.

## Prerequisites

- **`codex` CLI, installed and authenticated.** `codex` must be on `PATH`, and the `~/.codex` in your
  home directory must be signed in — an agent borrows that sign-in whatever `CODEX_HOME` says. Check it
  with `CODEX_HOME=~/.codex codex login status`.
- **The codex-cli build the driver pins.** Every report names it as `codexVersionPinned`, and the
  `schema-<version>/` directory beside the plugin in the repository is that build's protocol reference. After
  upgrading codex, run the fidelity suite (below) before trusting a run.
- **Node at or above the floor `package.json` declares** (`engines`); CI runs that floor and a current
  release, Linux and macOS. No dependencies: shipped scripts use only `node:` builtins and sibling modules.
- **macOS and Linux are both measured.** CI runs every suite that needs no `codex` binary on both;
  the macOS-only call (the managed-preferences plist) is guarded. On both, an agent's `$TMPDIR` is its
  run's own directory, never your whole one: the driver makes it fresh at 0700 inside the system's
  temporary directory `<tmp>`, Node's `os.tmpdir()`: your `TMPDIR`, else `TMP` or `TEMP`, else `/tmp`.
  Its path is `<tmp>/entrust/<project>/<run>/agents/<agent>`, sharing the initiating project and run
  with its coordinator or swarm while keeping each agent's writable leaf exclusive. The report names it as `tmpDir`
  ([Environment](skills/codex/references/environment-and-internals.md#environment)); it outlives the run,
  and the driver never removes it: it stays until the system clears its temporary directory or
  `/entrust:cleanup` removes its selected entry (below). At read level it is
  the only place an agent may write; at write level it is one more writable root beside the directories
  you chose. An earlier version kept these folders in the state directory's `tmp/`; the cleanup offers
  what is left there too.
- **Your `~/.codex/config.toml` is the default policy** — or the one in the home `CODEX_HOME` names.
  Model, reasoning effort and the other keys the driver inherits come from it unless a call overrides
  them (`--model`, `--effort`); the driver sets no defaults of its own
  ([the isolated home](skills/codex/references/environment-and-internals.md#the-isolated-home)).

Temporary artifacts are grouped by project, then run:

```text
<tmp>/entrust/<project>/<run>/
  agents/<agent>/             # exclusive agent TMPDIR; child checks live here under checks/
  checks/check-<random>/      # coordinator check logs
  swarm/swarm-<random>/summary.json
  evals/<suite>-<random>/
<tmp>/entrust/.cleanup/snapshot-<random>/listing.json
```

Projects use the directory name of the canonical repository root (canonical cwd outside git),
without a hash or truncation. Same-named projects share that folder; the filesystem root is named `root`.
Run keys use the full canonical structured report/run path with a hash, or a fresh
random ID for standalone invocations. `temp-dir.mjs run` emits the internal `ENTRUST_TEMP_CONTEXT`
JSON that a native coordinator passes to subsequent commands; drivers and swarms create or inherit it
and forward it to children. This keeps a changed cwd or agent worktree in the initiating run.
A marked child evaluation directory narrows the local scope; changing `TMPDIR` to an unrelated root
starts a separate context. A caller's `--summary` or `--ledger` path remains its choice.

Cleanup lists invocation leaves, keeps active or uncertain owners and approval snapshots, and never
selects project/run parents. Each agent invocation gets a unique scratch leaf, including retries to the same report path; publication
still refuses report overwrites. New agent scratch is selected separately from state reports; legacy
mirrored scratch still goes with its report. Earlier type-first and root-level scratch remain covered.
Each cleanup listing has its own snapshot directory, for example
`<tmp>/entrust/.cleanup/snapshot-Ab12Cd/listing.json`. `.cleanup` is the service directory name;
`listing.json` is the file, and the six-character suffix separates successive or concurrent listings.

## Install

As a plugin — the full set: all eight skills and the driver (the repo is its own marketplace):

```
/plugin marketplace add Nowely/agent-skills
/plugin install entrust@nowely
```

This route exposes the adapters as `entrust:claude`, `entrust:codex` and `entrust:opencode`, the modes as `/entrust:orchestrate`,
`/entrust:cleanup`, `/entrust:advisor`, `/entrust:swarm` and `/entrust:prepare-feedback`, which only the user can
turn on, and the wrappers their runs go through as `entrust:codex-agent` and `entrust:opencode-agent`.

The same two steps from a shell: `claude plugin marketplace add Nowely/agent-skills`, then
`claude plugin install entrust@nowely`. To update, update the plugin, which refreshes
the marketplace clone itself, and restart Claude Code:

```bash
claude plugin update entrust@nowely
```

**Where the driver's state lives.** `${CLAUDE_PLUGIN_DATA}`, the plugin's own data directory, which
Claude Code substitutes into the skill's recipes and which this install resolves to
`~/.claude/plugins/data/entrust-nowely/` (the plugin's name, then the marketplace's). The answers
and the isolated Codex home, the write locks, the worktree ledger and the orchestrator mode's run
directories are all there. It survives plugin updates. `/entrust:cleanup` lists what is there and removes
only the items you pick by number. A run or standalone report it removes takes its `<tmp>/entrust/`
folder with it, and a run still going keeps both. A folder there whose run is gone from the state
directory, or whose process has ended, is an item of its own and is suggested; so is what an earlier
version left in `tmp/`, once no process its `owner.json` names is alive. Here `<tmp>` is what the cleanup
sees: a non-empty `TMPDIR`, else Node's `os.tmpdir()`. Report folders under `prepare-feedback/`, and
experiment records an earlier version left under `experiments/`, it neither lists nor removes.
The driver keeps no default of its own: with neither that variable nor `ENTRUST_STATE_DIR` it
exits 2. Add that directory to `permissions.additionalDirectories` once to read the agents' reports
without prompts — this plugin adds no rules on your behalf. You never need to write there: the plugin's
own scripts do, and a write there by Claude Code's own tools still asks in the `default` and
`acceptEdits` modes whatever your settings say, because the directory is under `.claude`, a protected
path. Claude Code's [permissions page](https://code.claude.com/docs/en/permissions.md) says files in
additional directories "become readable without prompts, and file editing permissions follow the current
permission mode", and its [permission modes page](https://code.claude.com/docs/en/permission-modes.md)
says "`permissions.allow` rules in settings files do not pre-approve protected-path writes". A shell outside Claude Code has no `CLAUDE_PLUGIN_DATA`; to run the driver by hand, as under
First run, export an absolute path of your own. The driver reads `ENTRUST_STATE_DIR` first, so wherever it is set it overrides the plugin's directory:

```bash
export ENTRUST_STATE_DIR="$HOME/.local/state/entrust"
```

The suites do not install with the plugin; they run from a checkout of this repository, cost nothing
and call no model:

```bash
git clone https://github.com/Nowely/agent-skills.git && cd agent-skills
node plugins/entrust/evals/run-all.mjs    # every suite, one per core at a time, longest first
```

The `fidelity` suite is what to watch after a `codex` upgrade: it performs a real handshake and diffs
it against the fixture, so protocol drift shows up as a failing case instead of a confident wrong
answer. Without `codex` on `PATH` it skips and exits 0, which is what CI does; after a `codex` upgrade the
release checklist ([RELEASING.md](https://github.com/Nowely/agent-skills/blob/main/RELEASING.md)) runs it
locally, where the skip becomes a failure.

The plugin root, where First run starts, is the install path announced when the skill loads, or
`installPath` in `installed_plugins.json`.

## First run

From the plugin root, with the state directory exported as Install says:

```bash
node skills/codex/scripts/driver.mjs --cwd . --brief \
  --prompt 'TASK: describe this repository in two sentences, after listing its files.
CHECK: name three real files.
RETURN: the two sentences.'
```

The JSON report — the only report — ends with the verdict: `exitCode: 0` means the turn completed, every
declared check passed, and a command really ran; anything else is a specific complaint — the driver's
`--help` documents the full ladder. `threadId` continues the conversation via `--resume`; `receiptPath` and
`receiptOk` locate and validate the run's rollout
([receipt details](skills/codex/references/environment-and-internals.md#receipt-validation-and-reporting)
say what that does and does not prove).

Inside Claude Code you rarely type this yourself: the skill's `SKILL.md` is the operating manual the
agent reads mid-task, including when to give a panel agent to Codex at all. With the plugin installed it
is `entrust:codex`. An agent is the
`codex-agent` wrapper, an Agent call (foreground for the one agent you wait for, background for those that run side by
side) that runs that same driver through the launcher in one foreground Bash call: the prompt through the launcher's
`--new`, the report at `--report-file`; add `RIGHTS: worktree <repo>`
above `TASK:` for a managed writer. The
driver parses that header, launches one agent, waits as long as the work takes, makes the directories the
report path needs at 0700, and publishes the report there by hard link, never over an existing entry: the
coordinator reads the file when the call's exit notification arrives, and a missing file means unknown,
never success.

## Rights, per call

| Call | Codex may |
| --- | --- |
| `--level read` (the default; `--cwd DIR` is optional and defaults to the current directory) | read any readable path, reach the network, run commands, write only `$TMPDIR` — enough to run tests |
| `--worktree REPO` | write level in a managed detached tree the driver creates, harvests and removes; what it starts from and lacks is in [parity.md](skills/codex/references/parity.md#read-and-isolated-write) |
| `--level write --cwd DIR` | write anywhere under a directory you chose, plus `$TMPDIR`; `/tmp` is excluded |
| `+ --writable DIR` / `--no-network` | an extra root, an explicit opt-in; or a sandbox that reaches nothing |

Egress is on at both levels, as it is for a native subagent, and no host list narrows it; `--no-network`
is what takes it away, from the sandbox — the provider's own web search is a separate channel, off until
`--web-search` asks for it, and a denied sandbox and a granted search mode are accepted together. Egress
moves nothing on disk — a read agent still writes only `$TMPDIR` — but whatever an agent can read it can
send, and at read level that is every path you can read.

## The run's lifetime

A run lives exactly as long as its call: there is no run registry and no collector, and the caller that
started an agent owns its lifetime. `--report-file` is the delivery that survives a broken pipe, and an
agent is stopped by `SIGTERM` to the pid the driver prints on its first stderr line — the turn is
interrupted, the report it had earned is written anyway, and the codex process group is swept.

## Trust and verification

- **Exit codes from evidence.** The `codex` process always exits 0; the driver derives an ordered
  ladder of exit codes from the event stream. The driver's `--help` is the complete ladder;
  `SKILL.md` gives the decisions a coordinator makes on it.
- **Evidence gates.** `--verify '<shell>'` runs after the turn, executed by the driver, never authored by
  the model — but with the coordinator's own rights, env and network, so a verifier that executes tree
  contents (`npm test` runs the agent's `package.json` script) is running the agent's code; prefer one
  that does not, or add `--verify-sandboxed` to put it behind the read profile, which confines its
  writes to `$TMPDIR` and hands it the agent's own egress, a denial included;
  `--expect-command <regex>` demands the work matched a declared signature;
  `--output-schema <file>` demands a JSON answer matching a schema. Semantics, and how each gate can
  be fooled: the driver's `--help` and [references/result-gates.md](skills/codex/references/result-gates.md).
- **Sandbox asserted, not assumed.** The sandbox the server reports — its type, the network, every
  writable directory, `/tmp` included — is compared with what was asked for, and a mismatch refuses
  the run.
- **A receipt per run.** `receiptPath`/`receiptOk` locate the rollout and check it names this thread;
  what that does and does not prove is in
  [the internals reference](skills/codex/references/environment-and-internals.md#receipt-validation-and-reporting).
- **Isolation by default.** Runs use a private `CODEX_HOME`, so your plugins, skills and MCP servers
  stay out of the turn and no trust records are written back; `--host-home` opts out.

## Why not the official plugin

The official `openai-codex` plugin is architecturally the same idea and richer in places — background
jobs, resume UX, a stop-time review gate. It is not a substitute where rights matter: it hardcodes an
approval policy that managed (MDM) machines clamp into deny-everything, and it always sends an explicit
`sandbox` parameter, which suppresses the permission profile that makes read-level test runs possible —
on every machine, managed or not. Both defects are silent: the run still exits 0. The `codex
exec`-based skills and the official SDK hit the same walls. Full forensics, upstream issue state, and
what the plugin does better: [references/why-not-the-plugin.md](skills/codex/references/why-not-the-plugin.md).

## Limitations

Read level cannot run browser-mode tests: Chromium needs a one-file override at the tree root, which is
a write a read agent does not have — they run at write level
([Browser-mode sandbox](skills/codex/references/parity.md#browser-mode-sandbox)). Node-environment vitest at read level
needs `--configLoader runner`. Concurrency is memory-bound (figures in
[parity.md](skills/codex/references/parity.md#fan-out-and-reporting)) and exceeding the machine
budget gets runs killed by the OS, not throttled. The app-server protocol is `[experimental]` and
carries no stability promise — hence the pinned schema and the fidelity suite.

## After a codex upgrade

```bash
codex app-server generate-json-schema --out <tmp-new>/
git archive 1674a5f plugins/entrust/schema-0.159.3 | tar -x --strip-components=2 -C <tmp-old>/
diff -r <tmp-old>/schema-<old-version>/ <tmp-new>/
```

Read the diff for anything structural. Commit `<tmp-new>/` as `plugins/entrust/schema-<new-version>/` in a commit of its
own: that commit holds the full tree the next upgrade diffs against. After that upgrade, point the archive command
above at its full-schema commit and path.
`ENTRUST_SCHEMA_DIR=schema-<new-version> node plugins/entrust/evals/conformance.test.mjs` validates it
while `schema-<old-version>/` is still the pinned one; once that is green, move `PINNED_CODEX`, prune the
new directory to the files
[conformance](https://github.com/Nowely/agent-skills/blob/main/plugins/entrust/evals/conformance.test.mjs)
loads in a second commit, and delete the old one. Then `node plugins/entrust/evals/run-all.mjs` and
`node plugins/entrust/evals/fidelity.test.mjs --require-live`, inspect any fixture/live difference, and
re-check [the dated parity reference](skills/codex/references/parity.md).

## Layout

```
skills/codex/                    the main skill: SKILL.md (the operating manual), scripts/ (the driver
                                 and its companions, each self-describing under --help), references/
skills/orchestrate/              the orchestrator mode: SKILL.md (the common orchestration protocol), scripts/
                                 (capture-check.mjs, the check runner; lint-draft.mjs, the answer's linter;
                                 each self-describing under --help), references/ (roles, the foreman, the
                                 plan, the answer); agents/openai.yaml keeps explicit invocation in Codex.
                                 External mechanics live in codex/references/orchestration.md
skills/claude/                   the Claude Code host adapter: SKILL.md (Agent calls, waiting, Workflow, the
                                 foreman), references/ (the model table, the incidents behind its rules)
skills/cleanup/SKILL.md          the cleanup mode: runs scripts/cleanup.mjs, shows its listing and
                                 deletes what the user chose
skills/advisor/SKILL.md          the advisor mode: one standing top-row thread per run, prompt only
skills/swarm/                    the swarm mode: SKILL.md (units, launch, reducer, arms), scripts/swarm.mjs (the launcher)
skills/prepare-feedback/         the report mode: SKILL.md (focus, corpus, two ways of reading, output),
                                 scripts/prepare-feedback.mjs (the private folder under the data directory),
                                 references/focuses.md (each focus's unit, labels and layout)
.claude-plugin/                  plugin + marketplace manifests
../evals/                        not installed: the suites, one file each; run-all.mjs lists them and runs them
                                 side by side, longest first, lib/harness.mjs and lib/scenarios.mjs are their
                                 shared machinery
package.json                     private; the Node floor
.github/workflows/ci.yml         the suites that need no `codex` binary, on its OS × Node matrix
../schema-<version>/             not installed: the files ../evals/conformance.test.mjs loads out of the
                                 pinned protocol schema; the driver reads none of them at run time, it
                                 names the pinned version itself. The full generated tree is not kept
                                 here: the commit named in the upgrade recipe holds the last one
                                 (1674a5f for 0.159.3), and the recipe diffs the next regeneration
                                 against it.
```

Canonical homes for repeated stories:

| Subject | Canonical home |
| --- | --- |
| external composition, rights, workflow | [`SKILL.md`](skills/codex/SKILL.md), [orchestration.md](skills/codex/references/orchestration.md) |
| OpenCode router workers, recent models and callbacks | [OpenCode skill](skills/opencode/SKILL.md), [measured API limits](skills/opencode/references/parity.md) |
| common orchestration: roles, capacity, returns | [`skills/orchestrate/SKILL.md`](skills/orchestrate/SKILL.md) |
| Claude Code delegation and Claude's models | [`skills/claude/SKILL.md`](skills/claude/SKILL.md), [models](skills/claude/references/models.md) |
| what the plugin leaves behind, and removing it | [`skills/cleanup/SKILL.md`](skills/cleanup/SKILL.md), `node skills/codex/scripts/cleanup.mjs --help` |
| experiments on these rules: protocol, verdicts, the record | [`plan.md`](skills/orchestrate/references/plan.md#an-experiment-on-these-rules), [open protocols](https://github.com/Nowely/agent-skills/blob/main/plugins/entrust/research/protocols.md) |
| the standing advisor | [`skills/advisor/SKILL.md`](skills/advisor/SKILL.md) |
| swarms: units, launch, reducer, coordination arms | [`skills/swarm/SKILL.md`](skills/swarm/SKILL.md), `node skills/swarm/scripts/swarm.mjs --help` |
| feedback reports: focuses, scope, the private folder, the export | [`skills/prepare-feedback/SKILL.md`](skills/prepare-feedback/SKILL.md), `node skills/prepare-feedback/scripts/prepare-feedback.mjs --help` |
| flags and field formats | `node skills/codex/scripts/driver.mjs --help` (`--help-all` for the rest) |
| environment, prompt files, receipts, worktree internals | [`environment-and-internals.md`](skills/codex/references/environment-and-internals.md) |
| native capability parity and dated measurements | [`parity.md`](skills/codex/references/parity.md) |
| measured failures behind rules | [Codex](skills/codex/references/incidents.md), [Claude Code](skills/claude/references/incidents.md) |
| suite coverage and mutations | [`plugins/entrust/evals/README.md`](https://github.com/Nowely/agent-skills/blob/main/plugins/entrust/evals/README.md) |

## Status

Young code, adversarially reviewed by mixed Claude/Codex panels. What that produced is checkable in the
repository rather than in the claim: the home-directory guard is pinned against case variants, symlinks
and a hostile `$HOME`; the lock's critical section is pinned against overlapping holders; a prompt file
cannot introduce a verifier; every run's `$TMPDIR` is its own, whatever the caller exported; and each suite is
mutation-checked, with the surviving mutants and what was done about them listed in
[`plugins/entrust/evals/README.md`](https://github.com/Nowely/agent-skills/blob/main/plugins/entrust/evals/README.md).
Changes are in the [changelog on GitHub](https://github.com/Nowely/agent-skills/blob/main/plugins/entrust/CHANGELOG.md); release notes and known issues also live on the
[releases page](https://github.com/Nowely/agent-skills/releases). The Codex build each release was
measured against is stated there because that axis — not the skill's own code — is what usually breaks.
MIT — see [LICENSE](LICENSE).
