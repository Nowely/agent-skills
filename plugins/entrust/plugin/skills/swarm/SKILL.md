---
name: swarm
description: >-
  Runs a swarm: up to fifty bulk agents over a file of units, launched by one script with a
  concurrency cap, and reduced by one cheap agent to a single summary the orchestrator reads; shared
  state and free messaging between agents are experiment arms, never the default.
disable-model-invocation: true
metadata:
  version: "0.25.1"
license: MIT
---

For a Codex batch, load the sibling [codex](../codex/SKILL.md) now (`entrust:codex`); for an OpenCode batch, load [opencode](../opencode/SKILL.md) instead; this page holds every other rule a swarm needs. A swarm starts two ways: the user types `/entrust:swarm`, or an orchestrate plan proposes one for a bulk batch, with its count and cost on the card, and the user's "go" on that plan starts it; under a plan it takes a run directory of its own, since the plan's registration refuses its agent ids. A swarm is a bulk fan-out at its widest: the units, the brief template and the reducer are yours; the launches and the waits are the script's. Its one script makes each agent through the sibling's launcher, runs them and writes their summary. Its agents are a pool of their own: they count against the swarm's own cap, never the plan's cap on agents alive at once, and the plan says so.

## The units and the brief

For an approved OpenCode batch, load the [OpenCode adapter](../opencode/SKILL.md) instead of the
Codex adapter and pass `--adapter opencode` below. Pin one provider/model from its recent-model status
in the brief, use an advertised `VARIANT:` and run a pilot before widening the pool; every agent gets a
separate session. Each adapter's default concurrency is its own.

A unit is one claim, one address, a verbatim quote, and a verdict from a closed set that describes the subject and never the brief, or one part of the material for extraction, with a fixed answer schema the brief states. Write the units to a file, one per line, fifty at most, and one brief template with `{{UNIT}}` where the unit goes and `{{UNIT_ID}}` where its number goes. Assemble one brief and open it whole before the launch, checking its paths, its count and each quote against its source. Every brief carries the `MODEL:` and `EFFORT:` of the bulk or cheap row of the adapter's model table ([Codex](../codex/references/models.md)). Its `OUTPUT_SCHEMA:` is the shipped five-field schema, `${CLAUDE_SKILL_DIR}/../orchestrate/schemas/five-fields.schema.json`. A swarm never carries a top- or strong-tier model, and it never writes: every agent is a read agent. Announce the count, derived from the units with the plan saying why that many, before the launch. Show the plan, the pilot's units in it, and stop; "go" covers the pilot and the swarm as announced and nothing else. Pilot first: a stronger model marks the pilot's units, the swarm's model runs the same units, and recall, false positives and tokens against that marking decide the brief's fixes and its effort; then launch the swarm at that effort.

## The launch

    CLAUDE_PLUGIN_DATA="${CLAUDE_PLUGIN_DATA}" node "${CLAUDE_SKILL_DIR}/scripts/swarm.mjs" --adapter <codex|opencode> --units <file> --brief <template> --run <run directory> --concurrency <n>

The run directory is `<state>/orchestrate/<project-slug>/<run>/`: `<run>` unique, `<project-slug>` the working directory's absolute path with every character but letters and digits replaced by `-`. For each unit the script has the sibling's launcher make agent `<id>` at `<run directory>/<id>/report.json` with its `agent/` beside it, the shape the cleanup expects of a run, runs it with at most `--concurrency` at once, fifty at most, waits for every one, and writes `summary.json` outside the run, under `<temp>/entrust/<project>/<run>/swarm/swarm-<random>/`: per agent its number, the unit, the report path, the launcher's four status lines and when it ran. The script inherits the temporary context or resolves one from the working project and full run path, then forwards it to its agents. Run the script as the host adapter runs a long-running script ([Claude Code](../claude/SKILL.md#waiting)) and wait for it to end; stopping it stops further launches and reaches every running agent, the summary still written. A swarm left running when a headless turn ends is cut, its agents interrupted with no answers. `--agents <n>` in place of `--units` launches n agents on one identical brief, for the queue arm below.

## The reducer

After the summary, the reducer, one cheap-tier agent, gets the summary path. It reads every report whose status line says the report is this run's own, opens one return whole, and tallies the verdicts by unit; for extraction parts it counts each part's answers instead. It names the units whose answer did not parse, whose exit was not zero or whose report was not this run's. It returns the five fields with the tally in `result`. Read one return whole yourself before trusting the tally; a unanimous tally is evidence about the brief first.

## Coordination arms

The default swarm shares nothing: each agent has its unit and returns its verdict. Shared state (agents claim units from a queue directory under the temporary directory and write each result beside it) and free messaging (agents append to and read one messages file under that queue) run only in an experiment the user asks for; `--agents <n>` launches the agents on one brief for the queue.
