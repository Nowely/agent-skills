# Codex's models by tier

Orchestrate's tiers describe the work; this table names the Codex model for each, as a `MODEL:` line and a
native Codex subagent take it, with the `EFFORT:` an external agent carries for that work.

| Tier | Model | `MODEL:` | `EFFORT:` |
| --- | --- | --- | --- |
| top | Astra | `astra` | none: it inherits the configured effort; a model standing in for Astra carries `xhigh` |
| strong | Sol | `sol` | `medium` for review, refutation and judgement |
| cheap | Terra | `terra` | `medium`; `low` for mechanical work only |
| bulk | Luna | `luna` | `high` for extraction, classification and verification |

Luna is fast and low-cost, not limited to shallow reasoning: it is the first choice for scouting and
independent units once its model/task pilot passes, with Sol as the same-material pilot reference. Astra
takes consequential plan and architecture critique. Every external agent but Astra carries an `EFFORT:` line
([measured](incidents.md#effort-inherited-by-a-bulk-agent)).
