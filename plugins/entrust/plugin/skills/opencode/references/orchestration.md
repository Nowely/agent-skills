# OpenCode workers in a plan

Keep the orchestration workflow in [orchestrate](../../orchestrate/SKILL.md). Load this adapter only
for an external OpenCode worker. Each worker uses the native proxy from the adapter's launch step;
the external model does the task. Count each active proxy against host capacity and each external
session against router limits. Use the smallest approved pool.

Record the native proxy's model and thread alongside the external worker's model, session and report.
The plan's model column names the external worker; it must not be replaced with the proxy's Luna.
Reuse that native thread when a session continues. Its brief uses the agreed task, rights and user
instructions already present in the run. An interrupted proxy is the coordinator's cleanup duty:
stop only the driver bound to that report and verify its external outcome before another invocation.

The common launcher accepts an extended plan alongside existing five-column Codex/Claude plans:

```text
id | adapter | model | role | writes | tokens
W1 | opencode | <provider/model from recent status> | implementer | worktree | unknown
R1 | opencode | <second provider/model from recent status> | verifier | nothing | unknown
```

Register with `node <skill-dir>/scripts/agent-run.mjs --plan --run-dir <run>`. Every OpenCode row
uses a concrete model ID, never `inherit` or a display name. Its prompt carries the same `MODEL:` or none,
which runs on the row's; `inherit` or another model is refused.
Model selection and launch-time validation follow [Select and launch](../SKILL.md#select-and-launch).
If a requested family cannot be resolved from recent references, report the gap and ask for an exact
`provider/model` or an approved wider lookup; do not expand a catalog or substitute another recent
model silently.
The saved backend and plan model follow the detached keeper; mutable defaults cannot reroute it.
Amend the approved plan before adding a worker or changing its model or write scope.
Each prepared V2 prompt adds `API_FAMILY: v2` and `AGENT: <verified native profile>`; the resulting
session/report binds both. Continuations inherit them, and a changed API family or profile is refused.

Every invocation has `<run>/<id>/report.json`; a continuation has `<run>/<id>-2/report.json`, then
`-3`, and waits until its predecessor ended. One session can have several invocations, each with a
new report. Each concurrent worker has a different session. Local workers start private loopback
servers; workers explicitly attached to one remote endpoint share that server. A server is not a
concurrency slot.

Return [five fields](../../orchestrate/schemas/five-fields.schema.json) through `OUTPUT_SCHEMA:`. The
driver validates them locally and allows one corrective turn. Give a fresh verifier the requirements
and raw artifacts. Attribute model, tool failures, callback decisions and unknown outcomes separately.
The advisor does not judge work it advised on.

For a bulk batch, pilot the selected model and check quality/usage before widening the pool. A
provider's model name establishes no tier, cost or throughput. The existing swarm launcher accepts
`--adapter opencode`, defaults to concurrency two and requires a pinned provider/model in its brief.
Without that flag it keeps its original Codex backend. Batch approval and pilot rules still apply.
