# The main conversation as proxy

The explicit [proxy skill](../../proxy/SKILL.md) starts this mode, and the user's one answer to its final
confirmation activates it. Nothing else does: not a request outside that skill, an informational, quoted or negated
mention, or a page read. The selected external model then owns the plan, delegation, worker selection,
interpretation and final answer. The current host conversation executes its concrete agent orders with every right
and capability of the primary session and owns their transport and lifecycle. This mode continues until the user
leaves it or confirms another coordinator; finishing one task keeps the mode. An ordinary external-worker request uses
the per-worker proxy instead. A mode started before the proxy skill existed keeps its read-run coordinator and gets
no consent after the fact.

## Activate

Use the current conversation as the proxy: Luna at medium effort on Codex; Opus owns coordination
when selected by the user. Selecting this role does not switch the host model. Use a supported switch facility when
available; otherwise state the actual setting and let the user select that model. Continue on the
available host without reporting a switch that did not happen.

The proxy skill's steps propose the activation, show its confirmation and record the user's answer. The coordinator
runs Claude Code's coordinator profile: no tool, MCP server, installed or custom plugin or memory of its own, so every
action it takes is an order the host executes. Platform built-ins and admin policy that safe mode keeps stay, recognized
only by the provenance init reports (path `builtin`, source `<name>@builtin`), never by name alone; an installed, custom or
unproven plugin fails the round. Keep its exact model for continuations; another coordinator or provider is a new
activation with its own confirmation. After the activation, forward the next user message, even a greeting, to the
coordinator. Every user message, annotation, choice and approval is forwarded verbatim. The host speaks only
transport status and platform approval prompts; user-facing task content comes only from final_answer.

Write a fresh capability catalogue JSON from runtime-advertised tools, skills and agent routes for each
invocation: schemaVersion: 1, observedAt, source, capabilities, workerModels, proxyModel, coordinatorModel.
Each capability carries id, kind (tool|skill|agent-route|model), description, optional argumentsSchema and
short authority text such as “host platform approval applies”. inputKind defaults to object; explicit string
entries may carry a short inputDescription instead of argumentsSchema. Each workerModels entry carries an exact
model and its available efforts. Preserve additional runtime metadata; unobserved capabilities are unavailable.
Refresh the catalogue file and host facts before prepare; no extra permissions configuration is created.

## Agent orders

You coordinate for the host session with no tool of your own: every action is one of the requests below, which the
host executes with its own tools, returning each complete result in RESULTS. CONSENT is the user's confirmed
delegation to you: every capability in the catalogue, in the session's actual scope, and the working context, files
and results sent to your provider. Request what the task needs without asking the user to approve it again; the
platform's own checks still apply, and a refusal returns as that request's result. Later prompts carry
CAPABILITY_CHANGES since the previous one, entries added or changed in full and removed ids; everything else stands.
An image in a result arrives as an image block of the prompt as well, in order of first appearance; RESULTS itself stays
exactly as recorded, the image's base64 included.

The schema has plan, requests and final_answer. A request batch has an empty final_answer; a final
reply has no requests. Each request has a unique id and one action:

| Action | Coordinator supplies | Proxy does |
|---|---|---|
| delegate | agent_id, complete task, scope, model and effort | resolves the chosen worker route, launches it and records its native identity |
| continue | known agent_id and complete follow-up task | continues that worker with its existing model, scope and context |
| collect | known agent_ids | obtains their statuses and complete replies, using bounded native waits when needed |
| stop | known agent_ids | interrupts only those workers and reports the observed outcome |
| invoke | capability, arguments object or input string, purpose | executes the catalogue capability exactly under existing authority and platform approvals |

An agent_id is the coordinator's logical identity for a worker. The proxy binds it to the actual
native thread and, for an external worker, its session and report. It is not a path prefix: collect
and stop reach only workers created in this mode. Preserve that binding across continuations.

For delegate, supply an explicit non-null model and effort listed in workerModels. Only an explicit
mode.defaultWorker with model and effort may fill null fields; inheritance is never a default.
On Codex use Luna for mechanical/relay work and Sol for analysis/implementation. Resolve a named family to an available exact
model through its adapter; never silently substitute a model. The scope must fit existing authority.
Every task includes its necessary inputs, expected result and applicable constraints; “find some
agent” is not an executable order. The proxy forwards the task without rewriting it and carries
the existing user instructions and granted scope in the worker brief.

The proxy selects technical invocation details from the host and adapter procedures. Native agents
use direct native delegation; external workers use their adapter and per-session lifecycle owner.
The coordinator selects additional work or a different plan after an error. The proxy handles
identifiers, authorized defaults and transport state without becoming another task planner.

For invoke, capability must exist in the catalogue. Object entries take arguments matching argumentsSchema
when present; string entries take input byte-for-byte as the tool’s raw input. The host passes arguments as
JSON arguments. A kind mismatch is refused. A catalogue entry grants nothing, and a request grants no right the
session lacks. Host execution retains native tool validation and platform approvals; the reader checks arguments
only against a schema whose every keyword it enforces, and leaves any other to the tool's own validation.
Return a request the session itself cannot make as refused and an unavailable one as unsupported, with the
original id. The reader rejects an unknown capability before dispatch; return that validation error with its
request id instead of executing the batch. An order the user's end revoked returns with status revoked.
Freeform JavaScript is not an invoke capability unless explicitly advertised and already authorized.

For each substantive native-worker turn in this mode, assign a fresh permitted scratch file for its
complete reply. Add that delivery instruction to the brief separately from the coordinator's task.
The worker authors one canonical reply artifact; its native final links that file instead of creating
a second version. Continuations keep previous reply files. External workers use their adapter's full
answer artifact. A terminal delegate/continue bind or record reads the bound reply file and serializes
its complete UTF-8-decoded text into AGENT_RESULTS, along with identifiers from the saved request and mode data.
This delivery needs no collect order. An absent or unreadable
artifact is a delivery error; completeness rests on an observed terminal worker status
(completed|failed|cancelled). sha256 hashes the raw file bytes, not the decoded text, and does not prove completeness; keep it explicit rather than reconstructing the answer. Ordinary
waiting, refusal and transport statuses need no reply artifact.

## Every invocation

Use `main-proxy.mjs --help` for the subcommand usage. Build the catalogue mechanically: dump the runtime’s
own advertised tools to a JSON array by code (name, full description, inputKind and optional parameters/schema),
and the namespaces the host exposes directly beside them, such as its JavaScript runtime, its waits and its
agent collaboration tools, in an extra JSON array. Read that file directly; clipped printed output is not metadata.
Run `catalogue --from <tools.json|-> --extra <declared.json> --out <runtime.json> --proxy-model
<exact-model> --coordinator-model <exact-model> --worker-models '<JSON array>'`. Advertise every entry actually
present in the runtime, with its native schema as it is; inputKind defaults to object, and a freeform tool takes
`"inputKind": "string"`. Extra entries use the same metadata shape, with optional id, kind, authority and
inputDescription. First occurrence of each id wins.

Use [main-proxy.mjs](../scripts/main-proxy.mjs) for every step; it keeps one mode.json outside the checkout.
The host executes orders through its native facilities; the helper owns identifiers and artifacts.

1. The proxy skill's `propose` and `confirm` record the activation; `cancel` drops it. Selecting another
   coordinator uses a new state directory, and its confirmation ends the replaced mode of this host session.
2. `prepare --state <state> --message-file <verbatim-user-message> --host-facts <facts> [--results <results.json>]`
   checks the consent (not ended, this host session, the confirmed route) and builds and preflights a fresh launcher
   prompt. USER_MESSAGE is a lossless JSON string so launcher
   newline parsing cannot strip trailing newlines or normalize CRLF in the user text. The first prompt takes the complete Agent orders section
   from this page; every prompt carries the catalogue, in full or as changes, and facts. Keep applicable user/repository instructions,
   approved scope and workers' actual checkout paths in facts. Private system instructions and hidden reasoning
   stay local. For a transport-only continuation, the message file may be empty; genuine user messages stay exact.
   An image in RESULTS (MCP ImageContent, an image block or a `data:image/…;base64,` URL of PNG, JPEG, GIF or
   WebP) goes to the coordinator as an image block added beside RESULTS, which is not rewritten. A generic `application/octet-stream` label (what `view_image` returned) is resolved by the bytes' own PNG, JPEG, GIF or WebP signature. Any other media type, SVG, or unrecognized bytes stay as text, which the coordinator cannot see as an image.
3. Run exactly the printed `--run --watch` command through the [attached-call procedure](proxy.md).
   The driver admits the round again right before it starts the coordinator, so a round prepared before an end, a
   switch or a drift sends nothing. Keep the watcher attached; RUNNING repeats that command.
4. At terminal status, `finish --state <state>` requires receiptOk/outputSchemaOk and validates orders against
   the catalogue before publishing orders.json and request records. A confirmed mode's orders start as published;
   a legacy mode's as dispatched_outcome_unknown. The first complete round makes a confirmed mode active; a failed
   round closes with its reason, dispatches nothing and keeps the coordinator, and the next prepare continues it.
   A partial or invalid report executes no orders. A valid report whose request batch fails the reader
   is rejected whole without dispatch: finish exits 2, records refused/unsupported for every id, and results
   can return those errors through the next prepare. Lineage records report, parentReport, parentSession, session
   and evidence: report-link; this proves report linkage, never physical parent restoration. Claude forks on RESUME.
   The published orders file is beside the round's report; recover its exact path from `status.ordersPath`.
5. Execute the validated requests in dependency order. Run `begin --state <state> --request-id <id>` right before
   executing each one: it refuses after the mode ended or from another host session, claims the order once, and
   prints the `justification` a platform check of the action is shown. `bind --state <state> --agent-id <logical-id>
   --native-json <file|-> --model <exact-model> --effort <effort> --reply-path <canonical-reply-file>` preserves
   the observed native result verbatim and records a delegate/continue outcome. Native JSON identity must be under
   `agent_id`, `native_agent`, `id` or `task_name`, for example `{"agent_id":"worker-1"}`. Its model and effort must
   match the validated order. The request retains its own replyPath across later worker bindings. A non-terminal
   binding records the spawn outcome without reading the artifact; it permits the next prepare and one later
   terminal record for that request. A terminal binding publishes the reply immediately. Add the canonical reply
   delivery instruction separately from the coordinator task.
6. `record --state <state> --request-id <id> --outcome-json <file|->` preserves the complete native/tool result.
   After a spawn binding, record the delegate/continue's observed terminal root `status`
   (completed|failed|cancelled), e.g. `{"status":"completed"}`. The helper reads that request's bound replyPath
   and publishes `agent_id`, `replyPath`, full `content` and `sha256` under `replies`, beside the verbatim native
   outcome and outcomeJson. Terminal outcomes are immutable; missing/unreadable artifacts produce delivery_error.
   An unbound delegate/continue may record its raw refusal, unsupported result or error once without replies or
   delivery_error; it then permits the next prepare and accepts no later terminal update. An unbound completed
   outcome is refused because no worker identity or artifact is bound. Collect requires the same terminal status
   and reads each requested agent's current bound replyPath. Preserve
   unknown/refused/unsupported outcomes; never replay an uncertain mutation. A platform's refusal is recorded as
   it was given; a native validation error is that tool's result, not a platform refusal.
   An interrupt acknowledgement alone does not prove stopped work.
7. `results --state <state>` prints AGENT_RESULTS/REQUEST_RESULTS with every original id and full outcome.
   Save this output by redirection and pass it to the next prepare with an empty message file unless a user
   message arrived. prepare refuses continuation while an order is published or its outcome unknown.
8. Repeat prepare → attached run → finish until final_answer. Forward that complete validated text or its
   complete artifact without retelling. A later user message follows the same loop; finishing a task keeps the mode.

Read identifiers from saved orders/mode records by code rather than retyping them. A lost binding requires
reconciliation against observed records. Ordinary waiting continues with bounded host waits; a timeout alone
establishes no worker state. When the user leaves the mode, stop the owned attached call, verify its outcome and run
`end --state <state>` from the mode's own host session. A round starts when the driver claims it under the state lock
(`launch` in `status`): an end before the claim refuses the round, so nothing is sent; an end after it finds the round in
flight, which may finish and keep its report, but `finish` of an ended mode publishes none of its orders. Orders not yet
begun are revoked, begun ones are still recorded, and a round is claimed once. A claimed round whose driver died is
closed as failed by `finish`, and `prepare` restarts under the same consent.

Mutating state commands take one exclusive lock before reading mode.json. A live lock waits up to 30 seconds;
a dead owner is reported as stale and requires reconciliation, never automatic replay. finish persists publication
before stdout. After a lost stdout or “already finished”, use `status --state <state>` to read ordersPath,
publication records and every request state; reconcile the saved batch rather than calling finish to replay it.
A repeated confirm finishes a confirmation a crash interrupted from the saved consent and asks the user nothing.
