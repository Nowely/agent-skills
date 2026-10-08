---
name: opencode
description: >-
  Runs OpenCode workers and an OpenCode model as the main coordinator: launches, continues and stops
  workers, answers their permission and question callbacks, and picks a recent model. Use when the user asks
  for OpenCode or for a model outside native Codex and Claude, to call or pool (“Позови DeepSeek, GLM”, “Use
  deepseek, glm in pool”, “Задействуй модели OpenCode”) or to make it the coordinator (“Прокси на GLM”), even
  before the task is stated; for Codex and Claude alone, use native agents.
metadata:
  version: "0.27.0"
license: MIT
---

Resolve `<skill-dir>` to this installed directory. By default, the adapter starts a private loopback
server with the installed `opencode` CLI for each worker and stops it when that worker finishes. It
uses the user's existing OpenCode configuration and credentials; no server URL or connection file is
needed. Every worker gets its own session. Continuing a worker reuses that session under a fresh report
path. Set `ENTRUST_OPENCODE_URL` or `ENTRUST_OPENCODE_CONNECTION` only when attaching to a remote server.

## Route named models

An affirmative “Прокси на <model>” makes that external model the coordinator and the main conversation
its proxy: follow orchestrate's [main proxy mode](../orchestrate/references/main-proxy.md), with this
adapter as the coordinator's transport. An ordinary request such as “Позови <model>: проверь diff”
delegates one worker and follows the launch steps below.

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
   `password`. Keep credentials out of prompts and reports.
2. Choose `MODEL: inherit` only when the user did not name a model family: it selects the first recent
   model. When the user names a family such as DeepSeek or GLM, use a matching recent reference if
   present; never use `inherit` or a different recent model for that request. If no matching recent
   reference is listed, report the
   unresolved family before launching. A continuation retains its previous model and variant. Explicit
   `MODEL: provider/model` overrides selection; preserve slashes inside the model ID.
   `VARIANT:` must be advertised by that model; `EFFORT:` is an alias for an explicit variant.
3. For orchestration, read [orchestration.md](references/orchestration.md). Resolve and pin the model
   before registering the approved plan. Use the shared [five-field schema](../orchestrate/schemas/five-fields.schema.json).
4. Make, run, read, continue and stop the worker as orchestrate's
   [shared call page](../orchestrate/references/external.md) says; without a plan, `--new` takes
   `--adapter opencode`. The prompt carries `MODEL: <resolved provider/model>`.

   Each invocation starts a private loopback server on its first run call.

5. The proxy, one per external session, reused for its continuations, is the shared page's: in Claude
   Code the `entrust:proxy` agent; in Codex a native subagent on Luna at `medium` effort with a fresh
   context ([models](../codex/references/models.md)). Report unavailable settings before launching rather
   than silently inheriting another model. Name its task with the worker ID, external model and proxy
   role. An OpenCode worker asks through permissions and questions: read
   [interactions.md](references/interactions.md) for the decision procedure.

## Scope and results

`RIGHTS: read <cwd>`, `write <cwd>` and `worktree <repo>` declare the worker's scope. Escalations
carry the complete native request; grant one action within the approved scope or ask its owner.
Each concurrent writer gets a distinct worktree. Rights changes need their own authority.
Read-only agents may share a directory when its tooling permits it.

Read the report even when the exit is nonzero:
partial answers, native command outcomes and callback decisions remain useful evidence.
`receiptOk` establishes attribution, while independent gates establish the result.
The report's `model` is observed attribution; `requestedModel` preserves the selection even after Stop.
Scope declarations do not configure a sandbox.

Stop the attached watcher or signal the adapter driver identified by that invocation's pid line.
The driver aborts its own sessions and records cancellation; the singleton stays running. In ordinary
`--run` mode, a waiting hand-back leaves no wrapper call in flight: rerun it to regain Stop. The
coordinator cleans up an interrupted proxy whose watcher did not stop. Verify the external outcome;
a missing report or uncertain cancellation is unknown, never success.

Read [parity.md](references/parity.md) before relying on active clarification, schema delivery,
attachments, tool selection or billing. API presence alone is not evidence of working execution.
The adapter speaks OpenCode's V1 API only; the V2 pilot and the retired V2 path are in the repository's research.
