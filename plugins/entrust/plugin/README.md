# entrust

Subagent orchestration for Claude Code and Codex. `orchestrate` agrees a plan with you, delegates scoped
tasks to agents, has their work verified by agents that did not write it, and synthesises what they found
with attribution. Adapters run agents the host does not: external Codex agents with per-call rights,
worktrees, evidence gates and receipts, and OpenCode workers. `proxy` lets a Claude model coordinate the session.

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
| [design-to-code](skills/design-to-code/SKILL.md) | you: `/entrust:design-to-code`, `$entrust:design-to-code`; or an agent given a design or screenshots | builds UI from design references to match them at every frame and adapt between them, every remaining difference explained: a design pack, a script that compares the page with the design in numbers at every frame and checks the widths between for overflow, clipping, overlap and layout changes, a ledger of deliberate deviations, and a before/design/after gallery; experimental |
| [orchestrate](skills/orchestrate/SKILL.md) | you: `/entrust:orchestrate`, `$entrust:orchestrate` | coordinates: plans with you, has the host's own agents critique the plan, do the work and verify it, and synthesises; another provider only when you name it |
| [proxy](skills/proxy/SKILL.md) | you: `/entrust:proxy <model>`, `$entrust:proxy <model>` | starts full Claude Code execution after confirmation; the host relays messages and replies, with tool activity in the existing journal |
| [review](skills/review/SKILL.md) | you: `/entrust:review`, `$entrust:review` | proposes a plan for approval before reviewing behavior, necessity, design and tests, with evidence, questions and the smallest clean solution; one reviewer by default, or on request a coordinator that uses fresh-context helpers per direction and keeps the one map and report. A complete review has a structured report with a connected code map and mechanism costs; incomplete coverage is partial. On request, a complete review can have an interactive HTML view where you mark what to apply |
| [cleanup](skills/cleanup/SKILL.md) | you: `/entrust:cleanup` | lists what entrust left on this machine and deletes the items you pick by number |
| [advisor](skills/advisor/SKILL.md) | you: `/entrust:advisor` | a standing top-tier advisor for one run, on the host's own models unless you name another; an experiment |
| [swarm](skills/swarm/SKILL.md) | you: `/entrust:swarm`, or an approved plan | up to fifty bulk agents over a file of units, reduced to one summary; an experiment |
| [prepare-feedback](skills/prepare-feedback/SKILL.md) | you: `/entrust:prepare-feedback` | reads your sessions where entrust or terse loaded and returns findings and proposals for the skill |
| [rnd](skills/rnd/SKILL.md) | the assistant, when you ask for a skill or a change to one; or you: `/entrust:rnd`, `$entrust:rnd` | researches and develops a skill, creating one or changing one: a requirements sheet from your words before any design, the sources read and recorded, one plan with your open questions in it, a run of the job without the skill before any text, a fresh architecture critic, a quality critic and a check after the text, a lighter route for a small change, and a script that holds the skill to the open format's limits and lists every line an edit lost; experimental |
| [claude](skills/claude/SKILL.md) | orchestrate | in Claude Code, Claude's model tiers, Agent calls, waiting on agents, Workflow; from any host, external Claude agents through `claude -p` |
| [codex](skills/codex/SKILL.md) | the assistant, in Claude Code, when you name Codex | external Codex agents; why not the official plugin: [why-not-the-plugin.md](skills/codex/references/why-not-the-plugin.md) |
| [opencode](skills/opencode/SKILL.md) | the assistant, when you name OpenCode or a model it serves | OpenCode workers |

Claude Code re-attaches the orchestrate page after a compaction only in the process that invoked it (measured on
2.1.330). After you resume a session in a new process, type `/entrust:orchestrate` again: that loads the page again,
and the page tells the coordinator to re-read its approved card.

Every external run goes through a relay agent that decides nothing: `entrust:relay` in Claude Code, a native
subagent on the host's smallest model elsewhere, a fresh one for each run of the launcher.

## Prerequisites

- Node at or above the `engines` floor in `package.json`. The scripts have no dependencies.
- For Codex agents: the `codex` CLI on `PATH`, signed in through `~/.codex`
  (`CODEX_HOME=~/.codex codex login status`). Each report records the observed server build as
  `codexVersion`. Your `~/.codex/config.toml` sets the model and effort a call does not.
- For OpenCode workers: the `opencode` CLI with its own configuration and credentials.
- For external Claude agents: the `claude` CLI at 2.1.259 or later, signed in.
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
