---
name: claude
description: >-
  Claude adapter for entrust. In Claude Code it holds Claude's model tiers, Agent-tool delegation, background
  and headless agents, Workflow and the foreman's launch; from any host it runs external Claude agents through
  `claude -p`, with rights, approvals, continuation and a report. Use when entrust's orchestrate, swarm, advisor
  or prepare-feedback plans Claude agents, natively in Claude Code or as a plan row whose adapter is `claude`.
metadata:
  version: "0.28.0"
license: MIT
---

# Claude Code

The rules for delegating to Claude subagents from a Claude Code session. Orchestrate owns the plan,
roles, verification and the return; this page owns how Claude Code runs them. Models for each tier:
[models.md](references/models.md). The measurements behind these rules:
[incidents.md](references/incidents.md). A Claude agent the host cannot run natively, or one that must run
outside this session, is an external run: [external.md](references/external.md).

## Agent calls

- Tag every Agent call with an explicit `model` from the tier table; untagged, a subagent inherits the
  session's model. Give it a description of the form "<Model> <id>: <task in a few words>", the id the
  card gave it.
- Subagents may spawn subagents, but a top-tier agent never spawns another top-tier one: it tags its own
  Agent calls with a strong or cheap model. Only you, or a foreman you launched, launch top-tier agents.
- A subagent's final text is its return value, not a message to a human: say so in the brief.
- A Claude agent starts with the user's and the project's CLAUDE.md and the memory index in its context,
  whatever its brief says, so a blind or independent Claude role still sees them; an external run with
  `SAFE_MODE: yes` does not ([external.md](references/external.md)).
- Claude agents launched together share the session's `$TMPDIR`. A file an agent must leave goes in a
  directory of its own that it makes with `mktemp -d`, with the path in its return.
- Continue an agent with SendMessage; give independent verification a fresh agent.

## Waiting

- Launch independent agents as background Agent calls, one notification each, and the one agent you
  wait for in the foreground. Wait for background agents, never on them: each return arrives on its
  own, its message first and its completion notification after. Never read an Agent task's output
  file for that return: it is the agent's whole transcript.
- In an interactive session you may end your turn with agents alive: they go on, and each completion
  arrives as a turn of its own.
- A headless session kills its background tasks when its turn ends. There, never end a turn with an
  agent or a long-running script alive: launch each in the foreground.
- A long-running script, such as a swarm, runs as one background Bash task described by what it runs:
  the task is on the agent map, and Stop on it reaches everything it started. In a headless session
  run it in the foreground.

## Workflow

The user's invocation of orchestrate authorises Workflow. Use it only for a chain a script must decide,
such as refute then judge. A Workflow reports nothing until its last agent returns, so an agent that
ends early stays invisible behind its siblings. Load the `workflow-authoring` skill before writing the
script when the session lists it. In a Workflow, `effort: 'low'` is for mechanical cheap-tier stages
only.

## The foreman

A Claude foreman is a `general-purpose` Agent on the strong tier. An explicit-only skill loads only in
a turn whose user message typed its command, and nobody types one to a subagent: pass it orchestrate's
pages and the adapters' pages it needs as files to read. Its workers run in the foreground, parallel
calls for independent workers of similar length. An approval relayed mid-run is quoted exactly, and an
approved external action is run by a fresh worker whose first brief carries it and the concrete
command.

## Skills

A skill marked `disable-model-invocation` loads with the Skill tool only in a turn whose user message
typed its command; in any other turn, read its SKILL.md with the Read tool. A page read by path has
nothing filled in: write `${CLAUDE_SKILL_DIR}` into its commands yourself, and resolve `<skill-dir>` to
the skill's installed directory as on any page.
