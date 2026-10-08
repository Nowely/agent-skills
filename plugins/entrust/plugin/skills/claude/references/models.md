# Claude's models by tier

Orchestrate's tiers describe the work; this table names the Claude model for each, as an Agent call's
`model` takes it. Its last row is no tier: it is the host's smallest model, which relays an external agent's run.

| Tier | Model | Agent `model` |
| --- | --- | --- |
| top | Fable | `fable` |
| strong | Opus | `opus` |
| cheap | Sonnet | `sonnet` |
| bulk | Haiku | `haiku` |
| proxy | Haiku | none: `entrust:proxy`, which relays one external agent's run, pins its own |
