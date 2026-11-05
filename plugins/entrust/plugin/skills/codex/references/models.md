# Codex's models by tier

Orchestrate's tiers describe the work; this table names the Codex model for each, as a `MODEL:` line and a
native Codex subagent take it, with indicative `EFFORT:` values for that work. The coordinator chooses the requested effort per task under the orchestration policy, and supplies it for each launch and continuation. Its last row is no
tier: it is the host's smallest model, which relays an external agent's run, as the shared call page's
[Run it](../../orchestrate/references/external.md#3-run-it) says.

| Tier | Model | `MODEL:` | `EFFORT:` |
| --- | --- | --- | --- |
| top | Astra | `astra` | `xhigh` for consequential critique when warranted |
| strong | Sol | `sol` | `medium` for review, refutation and judgement |
| cheap | Terra | `terra` | `medium`; `low` for mechanical work only |
| bulk | Luna | `luna` | `high` for extraction, classification and verification |
| relay | Luna | — | `medium`; the native subagent that relays one external agent's run when Codex is the host |

Luna is fast and low-cost, not limited to shallow reasoning: it is the first choice for scouting and
independent units once its model/task pilot passes, with Sol as the same-material pilot reference. Astra
takes consequential plan and architecture critique. Every external agent carries an `EFFORT:` line
([measured](incidents.md#effort-inherited-by-a-bulk-agent)).

## Native history

When a native Codex worker needs a new context without inherited conversation history, use
`fork_turns: "none"` if the host exposes it. Supply the task and necessary constraints in the brief;
this does not remove the worker's available skills or restrict its file access.
