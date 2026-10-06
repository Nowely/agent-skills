---
name: opencode
description: >-
  OpenCode: use immediately when the user says “Задействуй модели OpenCode,” asks for an OpenCode worker,
  continuation, permission or question callback, selects the main session as a proxy (“Прокси на GLM”),
  or asks to call or pool a model family outside native Codex and Claude (for example, “Позови DeepSeek,
  GLM” or “Use deepseek, glm in pool”), even without a task; ask for missing task details after choosing
  OpenCode. For requests limited to Codex and Claude,
  use native agents.
metadata:
  version: "0.25.0"
license: MIT
---

Resolve `<skill-dir>` to this installed directory. By default, the adapter starts a private loopback
server with the installed `opencode` CLI for each worker and stops it when that worker finishes. It
uses the user's existing OpenCode configuration and credentials; no server URL or connection file is
needed. Every worker gets its own session. Continuing a worker reuses that session under a fresh report
path. Set `ENTRUST_OPENCODE_URL` or `ENTRUST_OPENCODE_CONNECTION` only when attaching to a remote server.

## Route named models

An affirmative “Прокси на GLM” selects the main conversation as a proxy, with GLM owning its substantive
decisions. Read [main-proxy.md](references/main-proxy.md) and use that loop instead of creating a
per-worker proxy; its return uses [main-proxy.schema.json](schemas/main-proxy.schema.json). An ordinary
request such as “Позови DeepSeek: проверь diff” delegates one worker and follows the launch steps below.
The proxy reads complete order batches with `node <skill-dir>/scripts/agent-orders.mjs <report> <mode>`;
that helper validates orders and saved binding shape, while the host verifies ownership and executes them.

When the user asks to call, use or include a named model outside Codex and Claude in an agent pool, route
that worker through OpenCode even when the user does not say “OpenCode” or has not stated the task yet.
Choose the route first; when task details are missing, ask for them before checking status or starting a
worker. “Позови DeepSeek, GLM” and “Use DeepSeek, GLM in pool” request one worker for each named family.
“Задействуй модели OpenCode” explicitly selects this adapter; choose its model by the ordinary recent-model
rule. A model mentioned only for information or discussion does not request a worker.

## Select and launch

1. Run `node <skill-dir>/scripts/status.mjs`. Status is passive: it reads at most two saved recent
   model references and checks only an already-configured remote endpoint; it never starts a server or
   requests a model catalogue. A default local setup reports `local_unprobed` and retains its saved
   recent references; whether a local server is already running remains unknown. Model availability remains unknown until the launch path
   validates the exact selection. To attach to a remote server, set
   `ENTRUST_OPENCODE_URL` (and `OPENCODE_SERVER_USERNAME` / `OPENCODE_SERVER_PASSWORD` if needed), or
   point `ENTRUST_OPENCODE_CONNECTION` at a private JSON file containing `url`, `username`, and
   `password`. Keep credentials out of prompts and reports. For native V2 use
   `--api-family v2 --directory <cwd> --agent <profile>` to check that location and the named profile;
   V2 requires that profile in the user's OpenCode configuration.
2. Choose `MODEL: inherit` only when the user did not name a model family: it selects the first recent
   model. When the user names a family such as DeepSeek or GLM, use a matching recent reference if
   present; never use `inherit` or a different recent model for that request. If no matching recent
   reference is listed, report the
   unresolved family before launching. A continuation retains its previous model and variant. Explicit
   `MODEL: provider/model` overrides selection; preserve slashes inside the model ID.
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

   New invocations default to the V1 compatibility path and start a private loopback server on the
   first run call. Select native V2 explicitly with
   `API_FAMILY: v2` and `AGENT: <verified native profile>` after `RIGHTS:`. V2 must expose the exact
   model through a supported native SDK; there is no transport or API-family fallback.
   A continuation inherits its recorded family and agent when those headers are absent.

5. Use one native proxy for each external session and reuse its thread for continuations. On Codex,
   explicitly select an available Luna with `medium` effort and a fresh context. Report unavailable
   settings before launching rather than silently inheriting another model. Name its task with the
   worker ID, external model and proxy role. Give it the agreed `TASK`, existing `RIGHTS`, applicable
   user instructions, prepared command and report path; no separate permissions configuration is needed.
   Use [proxy.md](references/proxy.md) for its operating instructions.

   The Codex proxy runs `node <skill-dir>/scripts/agent-run.mjs --run --watch --report-file <report>`.
   Callbacks are intermediate events; the proxy applies existing authority or messages the coordinator
   and keeps waiting. Read [interactions.md](references/interactions.md) for the complete decision
   procedure. A `RUNNING=` checkpoint repeats the same command without starting another turn.
   Its final return contains the worker's full answer or its complete artifact, with status separate.
   Claude hosts may retain [opencode-agent](../../agents/opencode-agent.md) and the ordinary `--run`
   hand-back until their streaming and intermediate-message facilities are verified.

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

Stop the attached watcher or signal the adapter driver identified by that invocation's pid line.
The driver aborts its own sessions and records cancellation; the singleton stays running. In ordinary
`--run` mode, a waiting hand-back leaves no wrapper call in flight: rerun it to regain Stop. The
coordinator cleans up an interrupted proxy whose watcher did not stop. Verify the external outcome;
a missing report or uncertain cancellation is unknown, never success.

Read [parity.md](references/parity.md) before relying on active clarification, schema delivery,
attachments, tool selection or billing. API presence alone is not evidence of working execution.
See [v2-pilot.md](references/v2-pilot.md) for the recorded native API and adapter acceptance results.
