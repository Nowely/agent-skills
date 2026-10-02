# OpenCode workers in a plan

Keep the orchestration workflow in [orchestrate](../../orchestrate/SKILL.md). Load this adapter only
for an external OpenCode worker. The host's native agent remains the wrapper, not the model doing
the work. Use the smallest approved pool, within both host capacity and router limits.

The common launcher accepts an extended plan alongside existing five-column Codex/Claude plans:

```text
id | adapter | model | role | writes | tokens
W1 | opencode | <provider/model from recent status> | implementer | worktree | unknown
R1 | opencode | <second provider/model from recent status> | verifier | nothing | unknown
```

Register with `node <skill-dir>/scripts/agent-run.mjs --plan --run-dir <run>`. Every OpenCode row
uses a concrete model ID, never `inherit` or a display name. Its prompt carries the same `MODEL:`.
The saved backend and plan model follow the detached keeper; mutable defaults cannot reroute it.
Amend the approved plan before adding a worker or changing its model or write scope.
Each prepared V2 prompt adds `API_FAMILY: v2` and `AGENT: <verified native profile>`; the resulting
session/report binds both. Continuations inherit them, and a changed API family or profile is refused.

Every invocation has `<run>/<id>/report.json`; a continuation has `<run>/<id>-2/report.json`, then
`-3`, and waits until its predecessor ended. One session can have several invocations, each with a
new report. Each concurrent worker has a different session. Local workers start private loopback
servers; workers explicitly attached to one remote endpoint share that server. A server is not a
concurrency slot.

Return [five fields](../../codex/schemas/five-fields.schema.json) through `OUTPUT_SCHEMA:`. The
driver validates them locally and allows one corrective turn. Give a fresh verifier the requirements
and raw artifacts. Attribute model, tool failures, callback decisions and unknown outcomes separately.
The advisor does not judge work it advised on.

For a bulk batch, pilot the selected model and check quality/usage before widening the pool. A
provider's model name establishes no tier, cost or throughput. The existing swarm launcher accepts
`--adapter opencode`, defaults to concurrency two and requires a pinned provider/model in its brief.
Without that flag it keeps its original Codex backend. Batch approval and pilot rules still apply.
