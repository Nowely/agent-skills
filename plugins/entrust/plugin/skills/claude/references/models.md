# Claude's models by tier

This table names the Claude model for each tier, as an Agent call's
`model` takes it. Its last row is no tier: it is the host's smallest model, which relays an external agent's run.
For orchestrate, its [default model and effort](../../orchestrate/SKILL.md#capacity-and-models) take precedence.

| Tier | Model | Agent `model` |
| --- | --- | --- |
| top | Fable | `fable` |
| strong | Opus | `opus` |
| cheap | Sonnet | `sonnet` |
| bulk | Haiku | `haiku` |
| relay | Haiku | none: `entrust:relay`, which relays one external agent's run, pins its own |
