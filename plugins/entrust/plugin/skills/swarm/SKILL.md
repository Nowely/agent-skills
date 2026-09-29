---
name: swarm
description: >-
  Runs a swarm: up to fifty bulk agents over a file of units, launched by one script with a
  concurrency cap, and reduced by one cheap agent to a single summary the orchestrator reads; shared
  state and free messaging between agents are experiment arms, never the default.
disable-model-invocation: true
metadata:
  version: "0.22.0"
license: MIT
---

Load the sibling [codex](../codex/SKILL.md) now (Skill tool, `entrust:codex`); this page holds every other rule a swarm needs. A swarm starts two ways: the user types `/entrust:swarm`, or an orchestrate plan proposes one for a bulk batch, with its count and cost on the card, and the user's "go" on that plan starts it; under a plan it takes a run directory of its own, since the plan's registration refuses its agent ids. A swarm is a bulk fan-out at its widest: the units, the brief template and the reducer are yours; the launches and the waits are the script's. The mode adds no driver change, no header field and no flag; its one script makes each agent through the sibling's launcher, runs them and writes their summary. Its agents are a pool of their own. A Terra swarm counts as a Luna one does, against the swarm's own cap and never against the alive cap of six, and the plan says so.

## The units and the brief

A unit is one claim, one address, a verbatim quote, and a verdict from a closed set that describes the subject and never the brief, or one part of the material for extraction, with a fixed answer schema the brief states. Write the units to a file, one per line, fifty at most, and one brief template with `{{UNIT}}` where the unit goes and `{{UNIT_ID}}` where its number goes. Assemble one brief and open it whole before the launch, checking its paths, its count and each quote against its source. Every brief carries `MODEL: luna` or `MODEL: terra`, `EFFORT: high` for Luna and `medium` for Terra. Its `OUTPUT_SCHEMA:` file, under your temporary directory, holds the five fields' schema below. A swarm never carries a top-row or strong-row model, and it never writes: every agent is a read agent. Announce the count, derived from the units with the plan saying why that many, before the launch. Show the plan, the pilot's units in it, and stop; "go" covers the pilot and the swarm as announced and nothing else. Pilot first: a stronger model marks the pilot's units, the swarm's model runs the same units, and recall, false positives and tokens against that marking decide the brief's fixes and its effort; then launch the swarm at that effort.

    {"type":"object","properties":{"status":{"type":"string","enum":["done","partial","blocked"]},"result":{"type":"string","maxLength":4800},"evidence":{"type":"array","items":{"type":"string","maxLength":1000},"maxItems":40},"artifacts":{"type":"array","items":{"type":"string","maxLength":300},"maxItems":40},"open":{"type":"array","items":{"type":"string","maxLength":1000},"maxItems":20}},"required":["status","result","evidence","artifacts","open"],"additionalProperties":false}

## The launch

    CLAUDE_PLUGIN_DATA="${CLAUDE_PLUGIN_DATA}" node "${CLAUDE_SKILL_DIR}/scripts/swarm.mjs" --units <file> --brief <template> --run <run directory> --concurrency <n>

The run directory is `<state>/orchestrate/<project-slug>/<run>/`: `<run>` unique, `<project-slug>` the working directory's absolute path with every character but letters and digits replaced by `-`. For each unit the script has the sibling's launcher make agent `<id>` at `<run directory>/<id>/report.json` with its `agent/` beside it, the shape the cleanup expects of a run, runs it with at most `--concurrency` at once, fifty at most, waits for every one, and writes `summary.json` outside the run, in an agent-scratch directory under your temporary directory: per agent its number, the unit, the report path, the launcher's four status lines and when it ran. Run the script as one background Bash task described as the swarm and wait for its completion notification; the swarm's agents are not on the agent map, the task is, and Stop on it stops further launches and reaches every running agent, the summary still written. `--agents <n>` in place of `--units` launches n agents on one identical brief, for the queue arm below.

## The reducer

After the summary, the reducer, one Sonnet or Terra agent, gets the summary path. It reads every report whose status line says the report is this run's own, opens one return whole, and tallies the verdicts by unit; for extraction parts it counts each part's answers instead. It names the units whose answer did not parse, whose exit was not zero or whose report was not this run's. It returns the five fields with the tally in `result`. Read one return whole yourself before trusting the tally; a unanimous tally is evidence about the brief first.

## Coordination: shared state and free messaging are arms, not the default

The default swarm shares nothing: each agent has its unit and returns its verdict. Two arms run only under protocol E4 of the experiment skill, in an experiment the user starts with `/entrust:experiment`; E4 is in [protocols.md](../experiment/references/protocols.md#e4-swarm-coordination-none-shared-state-free-messaging). In shared state, fewer agents than units claim each unit by making a directory of its name under a queue in the temporary directory. Each writes the result beside it, so the swarm drains the queue. In free messaging, agents may append to one messages file under the queue and read it before each unit. The 2026-09-17 research put peer messaging and debate as verification on its do-not-adopt list and found shared state supported by mechanism rationale only; the arm that E4 measures as better becomes the default, and the other stays an arm.
