# Codex's models by tier

Orchestrate's tiers describe the work; this table names the Codex model for each, as a `MODEL:` line and a
native Codex subagent take it, with the `EFFORT:` an external agent carries for that work. Its last row is no
tier: it is the host's smallest model, which relays an external agent's run, as the shared call page's
[Run it](../../orchestrate/references/external.md#3-run-it) says.

| Tier | Model | `MODEL:` | `EFFORT:` |
| --- | --- | --- | --- |
| top | Astra | `astra` | none: it inherits the configured effort; a model standing in for Astra carries `xhigh` |
| strong | Sol | `sol` | `medium` for review, refutation and judgement |
| cheap | Terra | `terra` | `medium`; `low` for mechanical work only |
| bulk | Luna | `luna` | `high` for extraction, classification and verification |
| proxy | Luna | — | `medium`; the native subagent that relays one external agent's run when Codex is the host |

Luna is fast and low-cost, not limited to shallow reasoning: it is the first choice for scouting and
independent units once its model/task pilot passes, with Sol as the same-material pilot reference. Astra
takes consequential plan and architecture critique. Every external agent but Astra carries an `EFFORT:` line
([measured](incidents.md#effort-inherited-by-a-bulk-agent)).
