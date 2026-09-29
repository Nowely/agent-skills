# entrust

A Claude Code plugin that runs another vendor's coding agent as one of Claude Code's own subagents, today
OpenAI Codex, with the rights for each call declared up front: analysis that reads and runs but writes nothing of yours, or writing
and running tests inside a git worktree the driver manages itself. Every completed turn leaves a receipt
— a rollout the driver locates, opens and checks — and the exit code is derived from what actually
happened rather than from a process status that says nothing about the task, so an agent that did nothing
cannot report as though it had. Two more skills ship beside it, both described below and both invoked by
the user rather than by the model.

## Goal

A coordinator agent, Sonnet or Opus, that has loaded this skill must be able to launch a Codex subagent
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
verbose step onto Claude and Codex agents; it is prompt only, adds no flag or field, and is a delta over
this skill ([skills/orchestrate/SKILL.md](skills/orchestrate/SKILL.md)).

A third, `/entrust:cleanup`, is the cleanup: it lists what the plugin has left on this machine and
removes only what you pick by number ([skills/cleanup/SKILL.md](skills/cleanup/SKILL.md)). It
removes five kinds — this project's orchestrate run directories and agent scratch, standalone report
runs, the test suites' scratch directories and the saved conversations they leave behind. Five more
it only ever reports: the driver's saved answers, managed worktrees and their ledger, write locks,
the shared Codex home, and another copy of the plugin's data, which is yours to remove with the
shell-quoted command the listing hands you. A report is never suggested: once the agent has written
it you can delete it by number, and until then it is kept. It suggests nothing that is running or
that it could not fully read, never another project's, never a run or a saved conversation without
your number, and never on age. It runs no git. "Running" means what this plugin records — an agent's
startup line, a run's unreported agent, a job record, a live test suite — so a process holding one of
these open with none of that behind it is not something it can see. With `TMPDIR` unset or empty,
the listing scans Node's fallback temporary directory and says that agent scratch elsewhere may not
have been seen.

A fourth, `/entrust:experiment`, runs one registered experiment on the orchestrator's own rules: a
protocol before any agent (hypothesis, arms with a comparator, frozen material, the ruler's metrics, a
judge that does not see the arm, a stop rule), each arm an orchestrated run, the orchestrator's
conclusion and then the user's verdict. Its one script keeps the record under the plugin's data
directory beside the orchestrate runs, and copies it unchanged into a checkout as
`plugins/entrust/research/<date>-<slug>/` ([skills/experiment/SKILL.md](skills/experiment/SKILL.md)); the five
protocols registered first are in its references.

Two more are experiments with a page of their own. `/entrust:advisor` adds a standing top-row advisor of
the other model family to one run, asked one question at each decision point, with every decision
recorded before and after ([skills/advisor/SKILL.md](skills/advisor/SKILL.md)); it states no benefit until
protocol E3 has run. `/entrust:swarm` has one script make up to fifty bulk agents over a file of units
through the sibling launcher, with a concurrency cap and one summary for a cheap reducer
([skills/swarm/SKILL.md](skills/swarm/SKILL.md)); an orchestrate plan may also propose one for a bulk batch, which
the user's "go" starts. Shared state and free messaging between agents are E4's arms, never the default.

A seventh, `/entrust:prepare-feedback`, turns your own Claude Code sessions into a report on a plugin: it finds
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
  release, Linux and macOS. No dependencies: the driver is one file importing only `node:` builtins.
- **macOS and Linux are both measured.** CI runs every suite that needs no `codex` binary on both;
  the macOS-only call (the managed-preferences plist) is guarded. On both, an agent's `$TMPDIR` is its
  run's own directory, never your whole one: the driver makes it fresh at 0700 inside the system's
  temporary directory `<tmp>` (your `TMPDIR` when exported, else the OS default). A report at
  `<rel>/report.json` under the driver's state directory gets `<tmp>/entrust/<rel>`, and a run with no
  report there gets `<tmp>/entrust/runs/<startedAtMs>-<pid>`. The report names it as `tmpDir`
  ([Environment](skills/codex/references/environment-and-internals.md#environment)); it outlives the run,
  and the driver never removes it. At read level it is the only place an agent may write; at write level
  it is one more writable root beside the directories you chose. An earlier version kept these folders in
  the state directory's `tmp/`; if that folder is still there, you can delete it by hand.
- **Your `~/.codex/config.toml` is the default policy** — or the one in the home `CODEX_HOME` names.
  Model, reasoning effort and the other keys the driver inherits come from it unless a call overrides
  them (`--model`, `--effort`); the driver sets no defaults of its own
  ([the isolated home](skills/codex/references/environment-and-internals.md#the-isolated-home)).

## Install

As a plugin — the full set: all seven skills and the driver (the repo is its own marketplace):

```
/plugin marketplace add Nowely/agent-skills
/plugin install entrust@nowely
```

This route exposes the skill as `entrust:codex`, the modes as `/entrust:orchestrate`, `/entrust:cleanup`,
`/entrust:experiment`, `/entrust:advisor`, `/entrust:swarm` and `/entrust:prepare-feedback`, which only the user
can turn on, and the wrapper every Codex run goes through as `entrust:codex-agent`.

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
directories are all there. `/entrust:cleanup` lists what is there and removes
only the items you pick by number; experiment records under `experiments/`, report folders under
`prepare-feedback/` and an old `tmp/` it neither lists nor removes, and it does not look at the runs'
`$TMPDIR` folders under `<tmp>/entrust/`.
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
node plugins/entrust/evals/run-all.mjs    # every suite, cheapest first, stops at the first red
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
git archive b5c1b81 plugins/entrust/schema-<old-version> | tar -x --strip-components=2 -C <tmp-old>/
diff -r <tmp-old>/schema-<old-version>/ <tmp-new>/
```

Read the diff for anything structural. Commit `<tmp-new>/` as `plugins/entrust/schema-<new-version>/` in a commit of its
own: that commit holds the full tree the next upgrade diffs against, so replace `b5c1b81` above with its
hash — and the path beside it, which commits made before the plugin was renamed spell differently.
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
skills/orchestrate/              the orchestrator mode: SKILL.md (a delta over the codex skill), scripts/
                                 (capture-check.mjs, the check runner; lint-draft.mjs, the answer's linter;
                                 each self-describing under --help), references/ (roles, the foreman, the
                                 incidents behind the page's dated rules, and codex-composition.md,
                                 generated from the codex page by ../evals/fragments.mjs)
skills/cleanup/SKILL.md          the cleanup mode: runs scripts/cleanup.mjs, shows its listing and
                                 deletes what the user chose
skills/experiment/               the experiment mode: SKILL.md (protocol, arms, two verdicts), scripts/experiment.mjs
                                 (the record under the data directory), references/protocols.md (the six registered)
skills/advisor/SKILL.md          the advisor mode: one standing top-row thread per run, prompt only
skills/swarm/                    the swarm mode: SKILL.md (units, launch, reducer, arms), scripts/swarm.mjs (the launcher)
skills/prepare-feedback/         the report mode: SKILL.md (focus, corpus, two ways of reading, output),
                                 scripts/prepare-feedback.mjs (the private folder under the data directory),
                                 references/focuses.md (each focus's unit, labels and layout)
.claude-plugin/                  plugin + marketplace manifests
../evals/                        not installed: the suites, one file each; run-all.mjs lists them and runs them
                                 cheapest first, lib/harness.mjs and lib/scenarios.mjs are their
                                 shared machinery
package.json                     private; the Node floor
.github/workflows/ci.yml         the suites that need no `codex` binary, on its OS × Node matrix
../schema-<version>/             not installed: the files ../evals/conformance.test.mjs loads out of the
                                 pinned protocol schema; the driver reads none of them at run time, it
                                 names the pinned version itself. The full generated tree is not kept
                                 here: the commit named in the upgrade recipe holds the last one
                                 (b5c1b81 for 0.155.1), and the recipe diffs the next regeneration
                                 against it.
```

Canonical homes for repeated stories:

| Subject | Canonical home |
| --- | --- |
| composition, rights, workflow | [`SKILL.md`](skills/codex/SKILL.md) |
| orchestration: tiers, Codex share, agent bounds, returns | [`skills/orchestrate/SKILL.md`](skills/orchestrate/SKILL.md) |
| what the plugin leaves behind, and removing it | [`skills/cleanup/SKILL.md`](skills/cleanup/SKILL.md), `node skills/codex/scripts/cleanup.mjs --help` |
| experiments: protocol, arms, verdicts, the record | [`skills/experiment/SKILL.md`](skills/experiment/SKILL.md), `node skills/experiment/scripts/experiment.mjs --help` |
| the standing advisor | [`skills/advisor/SKILL.md`](skills/advisor/SKILL.md) |
| swarms: units, launch, reducer, coordination arms | [`skills/swarm/SKILL.md`](skills/swarm/SKILL.md), `node skills/swarm/scripts/swarm.mjs --help` |
| feedback reports: focuses, scope, the private folder, the export | [`skills/prepare-feedback/SKILL.md`](skills/prepare-feedback/SKILL.md), `node skills/prepare-feedback/scripts/prepare-feedback.mjs --help` |
| flags and field formats | `node skills/codex/scripts/driver.mjs --help` (`--help-all` for the rest) |
| environment, prompt files, receipts, worktree internals | [`environment-and-internals.md`](skills/codex/references/environment-and-internals.md) |
| native capability parity and dated measurements | [`parity.md`](skills/codex/references/parity.md) |
| measured failures behind rules | [`incidents.md`](skills/codex/references/incidents.md), and orchestrate's own [`incidents.md`](skills/orchestrate/references/incidents.md) |
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
