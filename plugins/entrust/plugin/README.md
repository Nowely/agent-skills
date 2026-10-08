# entrust

Subagent orchestration for Claude Code and Codex. `orchestrate` agrees a plan with you, delegates scoped
tasks to agents, has their work verified by agents that did not write it, and synthesises what they found
with attribution. Adapters run agents the host does not: external Codex agents with per-call rights,
worktrees, evidence gates and receipts, and OpenCode workers, including an external model as coordinator.

## Install

In Claude Code:

```text
/plugin marketplace add Nowely/agent-skills
/plugin install entrust@nowely
```

To update, run `claude plugin update entrust@nowely` and restart Claude Code.

In Codex:

```bash
codex plugin marketplace add Nowely/agent-skills
codex plugin add entrust@nowely
```

Then invoke `$entrust:orchestrate`; it uses Codex's own subagents.

## Skills

| Skill | Started by | What it does |
| --- | --- | --- |
| [orchestrate](skills/orchestrate/SKILL.md) | you: `/entrust:orchestrate`, `$entrust:orchestrate` | plans, delegates, verifies and synthesises; an external model can coordinate instead (“Прокси на <model>”) |
| [cleanup](skills/cleanup/SKILL.md) | you: `/entrust:cleanup` | lists what entrust left on this machine and deletes the items you pick by number |
| [advisor](skills/advisor/SKILL.md) | you: `/entrust:advisor` | a standing top-tier advisor, of the other model family where a route exists, for one run; an experiment |
| [swarm](skills/swarm/SKILL.md) | you: `/entrust:swarm`, or an approved plan | up to fifty bulk agents over a file of units, reduced to one summary; an experiment |
| [prepare-feedback](skills/prepare-feedback/SKILL.md) | you: `/entrust:prepare-feedback` | reads your sessions where entrust or terse loaded and returns findings and proposals for the skill |
| [claude](skills/claude/SKILL.md) | orchestrate, in Claude Code | Claude's model tiers, Agent calls, waiting on agents, Workflow |
| [codex](skills/codex/SKILL.md) | the assistant, in Claude Code | external Codex agents; why not the official plugin: [why-not-the-plugin.md](skills/codex/references/why-not-the-plugin.md) |
| [opencode](skills/opencode/SKILL.md) | the assistant | OpenCode workers and an OpenCode model as coordinator |

Every external run goes through one relay agent, `entrust:proxy`.

## Prerequisites

- Node at or above the `engines` floor in `package.json`. The scripts have no dependencies.
- For Codex agents: the `codex` CLI on `PATH`, signed in through `~/.codex`
  (`CODEX_HOME=~/.codex codex login status`), at the build the driver pins; each report names it as
  `codexVersionPinned`. Your `~/.codex/config.toml` sets the model and effort a call does not.
- For OpenCode workers: the `opencode` CLI with its own configuration and credentials.
- macOS or Linux.

## Where things live

In the system's temporary directory `<tmp>`, Node's `os.tmpdir()`: scratch under `<tmp>/entrust/` and what
outlives one command (reports, mailboxes, write locks, the worktree ledger, the isolated Codex home, feedback
runs) under `<tmp>/entrust-state/`, both made 0700 and refused when they are someone else's or a link. They
stay until the system clears its temporary directory or `/entrust:cleanup` removes what you pick.
`ENTRUST_STATE_DIR`, an absolute path, moves the state elsewhere. An earlier version kept the state in
`~/.claude/plugins/data/entrust-nowely/`; nothing reads it any more, and the cleanup lists it and leaves its
removal to you.

## A Codex agent by hand

From the plugin root (the install path announced when a skill loads):

```bash
node skills/codex/scripts/driver.mjs --cwd . --brief \
  --prompt 'TASK: describe this repository in two sentences, after listing its files.
CHECK: name three real files.
RETURN: the two sentences.'
```

The JSON report ends with the verdict: `exitCode: 0` means the turn completed, every declared check passed
and a command really ran. `node skills/codex/scripts/driver.mjs --help` gives every flag, right and exit
code; [the codex skill](skills/codex/SKILL.md) is what a coordinator follows.

## Development

The suites run from a checkout of this repository, cost nothing and call no model:

```bash
git clone https://github.com/Nowely/agent-skills.git && cd agent-skills
node plugins/entrust/evals/run-all.mjs
```

Releases, the Codex upgrade recipe and the live gates are in
[RELEASING.md](https://github.com/Nowely/agent-skills/blob/main/RELEASING.md). Changes are in the
[changelog](https://github.com/Nowely/agent-skills/blob/main/plugins/entrust/CHANGELOG.md) and open defects in
[ISSUES.md](https://github.com/Nowely/agent-skills/blob/main/plugins/entrust/ISSUES.md). MIT — see
[LICENSE](LICENSE).
