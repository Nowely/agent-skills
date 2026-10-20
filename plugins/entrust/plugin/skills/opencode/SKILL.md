---
name: opencode
description: >-
  Runs OpenCode workers: launches, continues and stops workers, answers their permission and question callbacks, and picks a recent model. Use when the user asks
  for OpenCode or for a model outside native Codex and Claude, to call or pool (“Позови DeepSeek, GLM”, “Use
  deepseek, glm in pool”, “Задействуй модели OpenCode”), even before the task is stated. A request to make a
  model the coordinator (“Прокси на GLM”) is answered with the explicit proxy command; ordinary native
  Codex/Claude delegation uses native agents.
metadata:
  version: "0.32.0"
license: MIT
---

Resolve `<skill-dir>` to this installed directory. The adapter starts a private loopback server with the
installed `opencode` CLI for each worker and stops it when that worker finishes. It uses the user's
existing OpenCode configuration and credentials; there is no server to configure. Every worker gets its
own session. Continuing a worker reuses that session under a fresh report path.

## Route named models

A request to make a model the coordinator (“Прокси на <model>”) starts nothing here: the explicit proxy skill,
`/entrust:proxy` (`$entrust:proxy` in Codex), owns that switch and its one confirmation, and it activates Claude
sessions only, since the direct proxy transport is implemented for Claude
([main proxy mode](../orchestrate/references/main-proxy.md)). An ordinary request such as “Позови <model>: проверь diff”
delegates one worker and follows the launch steps below.

When the user asks to call, use or include a named model outside Codex and Claude in an agent pool, route
that worker through OpenCode even when the user does not say “OpenCode” or has not stated the task yet.
Choose the route first; when task details are missing, ask for them before checking status or starting a
worker. “Позови DeepSeek, GLM” and “Use DeepSeek, GLM in pool” request one worker for each named family.
“Задействуй модели OpenCode” explicitly selects this adapter; choose its model by the ordinary recent-model
rule. A model mentioned only for information or discussion does not request a worker.

## Select and launch

1. Run `node <skill-dir>/scripts/status.mjs`. Status is passive: it reads at most three saved recent
   model references and reports `local_unprobed`; it never starts a server or requests a model
   catalogue. Model availability remains unknown until the launch path validates the exact selection.
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

5. The proxy follows the shared page's host-specific continuation rule: in Claude Code use the `entrust:relay`
   agent; in Codex use a native subagent on Luna at `medium` effort ([models](../codex/references/models.md)).
   Reuse an existing native task through an explicit follow-up when the host supports it, and verify that the new
   turn ran the requested command. Use a fresh context for a measured stale-hand-back case. Report unavailable
   settings before launching rather than silently inheriting another model. Name it as the shared page says. An
   OpenCode worker asks through permissions and questions, which you decide: read
   [interactions.md](references/interactions.md) for the decision procedure.

## Scope and results

`RIGHTS: read <cwd>` selects the working directory and grants no file-tool writes; it does not limit which paths
the worker may read. `write <cwd>` scopes file-tool changes; reads remain unrestricted. `worktree <repo>` gives
write access to a fresh copy. Entrust allows OpenCode external-directory reads without a path prompt, while
edit/write rules still govern file-tool changes. Bash remains unbounded by those file rules.
Other permission requests carry the complete native request; grant one action within the approved scope or ask its owner.
Each concurrent writer gets a distinct worktree. Rights changes need their own authority.
Read-only agents may share a directory when its tooling permits it.

Read the report even when the exit is nonzero:
partial answers, native command outcomes and callback decisions remain useful evidence.
`receiptOk` establishes attribution, while independent gates establish the result.
The report's `model` is observed attribution; `requestedModel` preserves the selection even after Stop.
Scope declarations do not configure a sandbox.

Where the host delivers Stop on the proxy to its command as a signal, the driver aborts its own sessions, records
cancellation and stops its server. A waiting hand-back leaves no proxy in flight: start one to regain Stop. A proxy
the host interrupted without a signal (one measured Codex host did not signal its command) leaves its driver to the keeper, which cuts it when the proxy does not
call again, and to `--stop --report-file <report>`, which you run once the proxy's task ends interrupted; both are in
the shared page's [Stop an agent](../orchestrate/references/external.md#7-stop-an-agent), and a hand-made signal on
the driver's pid is the recovery for what neither reaches. Verify the external outcome;
a missing report or uncertain cancellation is unknown, never success.

Read [parity.md](references/parity.md) before relying on active clarification, schema delivery,
attachments, tool selection or billing. API presence alone is not evidence of working execution.
The adapter speaks OpenCode's V1 API only; the V2 pilot and the retired V2 path are in the repository's research.
