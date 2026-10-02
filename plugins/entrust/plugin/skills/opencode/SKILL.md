---
name: opencode
description: >-
  Delegate work to external OpenCode agents through one existing HTTP server. Use for an
  OpenCode worker, continuation, permission or question callback, or an orchestration plan
  using router models. Native subagents use the host's delegation tools.
metadata:
  version: "0.23.0"
license: MIT
---

Resolve `<skill-dir>` to this installed directory. The adapter attaches to one existing server;
every worker gets its own session. Continuing a worker reuses that session under a fresh report path.
Server startup and shutdown belong to the owner, never to an agent's lifecycle.

## Select and launch

1. Set `ENTRUST_OPENCODE_URL`, with `OPENCODE_SERVER_USERNAME` / `OPENCODE_SERVER_PASSWORD` when
   needed, or `ENTRUST_OPENCODE_CONNECTION` to a private JSON file containing `url`, `username`,
   `password`. Keep credentials out of prompts and reports. Run `node <skill-dir>/scripts/status.mjs`.
   It shows two recent models, in their saved order, and checks availability without printing the
   full catalogue. `--limit N` explicitly widens discovery.
   For native V2 use `--api-family v2 --directory <cwd> --agent <profile>` to check that location,
   exact model SDK and profile. The owner configures the profile; workers do not change the server.
2. Choose `MODEL: inherit` for an ordinary new invocation: it selects the first recent model.
   A continuation retains its previous model and variant. Explicit `MODEL: provider/model` overrides selection;
   preserve slashes inside the model ID. A failed model is reported rather than replaced by the second.
   `VARIANT:` must be advertised by that model; `EFFORT:` is an alias for an explicit variant.
3. For orchestration, read [orchestration.md](references/orchestration.md). Resolve and pin the model
   before registering the approved plan. Use the shared [five-field schema](../codex/schemas/five-fields.schema.json).
4. Choose an absolute report path under `ENTRUST_STATE_DIR` (or `CLAUDE_PLUGIN_DATA`), outside the
   worker's checkout. Prepare the prompt verbatim:

   ```sh
   node <skill-dir>/scripts/agent-run.mjs --new --report-file <report> <<'PROMPT'
   RIGHTS: read <cwd>
   MODEL: <resolved provider/model>
   OUTPUT_SCHEMA: <absolute five-field schema path>
   TASK: <one deliverable, input paths, checks and expected return>
   PROMPT
   ```

   New invocations default to the V1 compatibility path. Select native V2 explicitly with
   `API_FAMILY: v2` and `AGENT: <verified native profile>` after `RIGHTS:`. V2 must expose the exact
   model through a supported native SDK; there is no transport or API-family fallback.
   A continuation inherits its recorded family and agent when those headers are absent.

5. Launch one host-native wrapper that runs `node <skill-dir>/scripts/agent-run.mjs --run
   --report-file <report>`. A `RUNNING=` return means rerun the same command; it waits for the same
   invocation. A waiting request means read [interactions.md](references/interactions.md), decide,
   then rerun that command. Preserve the wrapper's completion, continuation and Stop facilities.
   Claude hosts may use [opencode-agent](../../agents/opencode-agent.md); Codex hosts use their native
   delegation tool with the same relay instructions and an available host model.

## Scope and results

`RIGHTS: read <cwd>`, `write <cwd>` and `worktree <repo>` declare the worker's scope. Escalations
carry the complete native request; grant one action within the approved scope or ask its owner.
Each concurrent writer gets a distinct worktree. Rights changes need their own authority.
Read-only agents may share a directory when its tooling permits it.

Continue with `RESUME: <previous report path>` under a fresh report path; use an explicit session ID
only when its server, directory and scope are known. Read the report even when the exit is nonzero:
partial answers, native command outcomes and callback decisions remain useful evidence.
`receiptOk` establishes attribution, while independent gates establish the result.
The report's `model` is observed attribution; `requestedModel` preserves the selection even after Stop.
V2 also records the native profile's permission hash and refuses a changed profile on continuation.

For V2, use a dedicated primary/all agent whose first native rule is
`{"action":"*","resource":"*","effect":"deny"}`. Subsequent rules may ask for the shipped
`read`, `glob`, `grep`, `bash`, `edit`, `write`, `apply_patch`, `todowrite` and `question` actions at
resource `*`; only `question` may be allowed. The adapter verifies the returned effective rules.
The pinned session-create handler ignores its advertised `permissions` field: rules must belong
to the native agent. Scope declarations do not configure a sandbox. Custom/MCP tools and native
task delegation are outside this V2 profile; the host launches independent workers for fan-out.

Stop the wrapper while it is waiting, or signal the adapter driver identified by that invocation's
pid line. The driver aborts its own sessions and records cancellation; the singleton stays running.
After a waiting hand-back there is no wrapper call in flight: rerun it to regain Stop or decline the
request and rerun. A missing report or uncertain cancellation is unknown, never success.

Read [parity.md](references/parity.md) before relying on active clarification, schema delivery,
attachments, tool selection or billing. API presence alone is not evidence of working execution.
See [v2-pilot.md](references/v2-pilot.md) for the recorded native API and adapter acceptance results.
