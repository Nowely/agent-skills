---
name: experiment
description: >-
  Runs one registered experiment on the orchestrator's own rules: arms on matched material,
  a judge that does not see which arm it reads, the orchestrator's conclusion and the
  user's verdict. A script records them under the plugin's data directory; the repository gets a copy later.
disable-model-invocation: true
metadata:
  version: "0.24.2"
license: MIT
---

Load the sibling [codex](../codex/SKILL.md) now (Skill tool, `entrust:codex`); every arm runs under that page and this one. This page holds the rules an arm needs. An experiment adds a protocol before any agent, matched material, a judge that does not see the arm, two verdicts, and a record kept by a script. The mode adds no driver change, no header field and no flag; its one script writes the record and nothing else. A run needs no checkout of the repository: the record lives on the machine and is copied into a checkout later.

## The protocol

Register the experiment before any agent, in a protocol the user reads as the plan:

1. Hypothesis: an id and one sentence that can be false, from the research round's list of 2026-09-17 or written the same way; those registered so far are in [protocols.md](references/protocols.md).
2. Arms: each a composition named by model, tier, effort, count and rights. One arm is the comparator the hypothesis calls for, a single agent or no delegation where the question is whether delegation pays. The tiers are top Fable and Astra, strong Opus and Sol, cheap Sonnet and Terra, bulk Haiku and Luna. Each arm's plan is in the protocol, so one "go" covers every arm and no arm stops for a plan of its own.
3. Material: the same tasks or claims for every arm, frozen before the run, with the ground truth or the acceptance check written down before any arm sees it; the arms never see each other's returns.
4. Metrics: what the research's ruler names, unique coordinator incidents by stage with their severity, owner corrections, outcomes verified independently, and agents and paid turns counted per outcome so that arms of different cost compare; for a bulk hypothesis, correctness per claim; n stated, with an interval where n is under fifty, and paired where the material is the same across arms.
5. Judge: cross-family or human. It gets each arm's returns with their first line removed, the line every brief asks to name the agent's model and id, and the arms named by letters. Where the returns name the model in their body, the judge is cross-family with the arm named and the protocol says so. Its verdict names the check it ran or is `unknown`.
6. Stop rule and budget: the tokens and paid turns each arm may spend, and what ends the run early.

Show the protocol and stop; "go" covers the arms as listed and nothing else.

## The run

Each arm is one run with a run directory of its own, `<state>/orchestrate/<project-slug>/<run>/`, the same brief text in every arm except the composition, and the plan's cap for that arm. `<run>` is unique; `<project-slug>` is the working directory's absolute path with every character but letters and digits replaced by `-`. An arm keeps six alive at most, one Fable and one Astra among them; its bulk agents are a pool of their own, fifty at most, outside that cap. Tag every Claude Agent call with its `model`. The coordinator keeps the material's ground truth out of every brief that must not see it. A failed arm is reported with its reason and never re-run to a better number; a repeat is a new experiment with the first in its record.

## The two verdicts

The orchestrator writes the metric table and a conclusion that says what the numbers show and what they do not: n, what stayed unmeasured, the confounds it can name; a conclusion states no cause the design cannot carry. Then the user writes the verdict, kept, refuted, inconclusive or run again, in their own words; the record holds both, the user's is the one that decides what changes, and neither is rewritten afterwards.

## The record

The record lives where the driver's own artifacts live: `experiments/<date>-<slug>/` under the state directory, beside the orchestrate runs, written by `scripts/experiment.mjs` and never by hand, because a coordinator's own write under that directory is refused as a sensitive file (measured 2026-09-08) while a script handed the path writes it unopposed. Draft each piece in your temporary directory, then: `init` makes the record from the protocol; `arm` copies an agent's report or returned text and its brief into `arms/<arm>/`; `add` places `metrics.md`, `conclusion.md` and then `verdict.md`, and after `verdict.md` the script refuses every change; `export` copies the record unchanged, as `plugins/entrust/research/<date>-<slug>/` in a checkout, where a row goes into `plugins/entrust/research/README.md`, the index the repository keeps. Every call forwards the data directory the way the sibling's commands do:

    CLAUDE_PLUGIN_DATA="${CLAUDE_PLUGIN_DATA}" node "${CLAUDE_SKILL_DIR}/scripts/experiment.mjs" <command> …

`--help` lists the commands and their refusals. Codex reports stay where the driver put them and are copied in by path. Cleanup neither lists nor removes a record.
