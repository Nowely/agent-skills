# Claude's models by tier

Orchestrate's tiers describe the work; this table names the Claude model for each, as an Agent call's
`model` takes it.

| Tier | Model | Agent `model` |
| --- | --- | --- |
| top | Fable | `fable` |
| strong | Opus | `opus` |
| cheap | Sonnet | `sonnet` |
| bulk | Haiku | `haiku` |

At most one top-tier worker is alive at a time; a standing advisor is not counted.
