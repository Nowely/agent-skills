---
name: swarm
description: >-
  Runs a swarm: up to fifty bulk agents over a file of units, launched by one script with a
  concurrency cap, and reduced by one cheap agent to a single summary the orchestrator reads; shared
  state and free messaging between agents are experiment arms, never the default.
disable-model-invocation: true
metadata:
  version: "0.19.0"
license: MIT
---

Load [orchestrate](../orchestrate/SKILL.md) now (Skill tool, `entrust:orchestrate`; bare `orchestrate` on a clone-and-symlink install), which loads codex. A swarm is the orchestrate page's bulk row at its widest: the units, the brief template and the reducer are yours; the launches and the waits are the script's. The mode adds no driver change, no header field and no flag; its one script makes each agent through the sibling's launcher, runs them and writes their summary. This mode moves one thing: under it a Terra swarm counts as the bulk row does, against the swarm's own cap and never against the alive cap of six, and the plan says so.

## The units and the brief

A unit is what the orchestrate page's bulk row says: one claim, one address, a verbatim quote, and a verdict from a closed set that describes the subject and never the brief. Write the units to a file, one per line, fifty at most, and one brief template with `{{UNIT}}` where the unit goes and `{{UNIT_ID}}` where its number goes; assemble one brief and open it whole before the launch, checking its paths, count and quotes as the orchestrate page requires. Every brief carries `MODEL: gpt-5.6-luna` or `gpt-5.6-terra`, `EFFORT: low` for Luna and `medium` for Terra as the orchestrate page sets them, and the `OUTPUT_SCHEMA:` of the five fields; a swarm never carries a top-row or strong-row model, and it never writes: every agent is a read agent. Announce the count, derived from the units with the plan saying why that many, before the launch.

## The launch

    CLAUDE_PLUGIN_DATA="${CLAUDE_PLUGIN_DATA}" node "${CLAUDE_SKILL_DIR}/scripts/swarm.mjs" --units <file> --brief <template> --run <run directory> --concurrency <n>

The run directory is the orchestrate run directory. For each unit the script has the sibling's launcher make agent `<id>` at `<run directory>/<id>/report.json` with its `agent/` beside it, the shape the cleanup expects of a run, runs it with at most `--concurrency` at once, fifty at most, waits for every one, and writes `summary.json` outside the run, in an agent-scratch directory under your temporary directory: per agent its number, the unit, the report path, the launcher's four status lines and when it ran. Run the script as one background Bash task described as the swarm and wait for its completion notification; the swarm's agents are not on the agent map, the task is, and Stop on it stops further launches and reaches every running agent, the summary still written. `--agents <n>` in place of `--units` launches n agents on one identical brief, for the queue arm below.

## The reducer

After the summary, one cheap agent, the reducer of roles.md, gets the summary path: it reads every report whose status line says the report is this run's own, opens one return whole, tallies the verdicts by unit, names the units whose answer did not parse, whose exit was not zero or whose report was not this run's, and returns the five fields with the tally in `result`. Read one return whole yourself before trusting the tally, as the orchestrate page says; a unanimous tally is evidence about the brief first.

## Coordination: shared state and free messaging are arms, not the default

The default swarm shares nothing: each agent has its unit and returns its verdict. Two arms run only under protocol E4 of the experiment skill: shared state, where fewer agents than units claim each unit by making a directory of its name under a queue in the temporary directory and write the result beside it, so the swarm drains the queue; and free messaging, where agents may append to one messages file under the queue and read it before each unit. The 2026-09-17 research put peer messaging and debate as verification on its do-not-adopt list and found shared state supported by mechanism rationale only; the arm that E4 measures as better becomes the default, and the other stays an arm.
