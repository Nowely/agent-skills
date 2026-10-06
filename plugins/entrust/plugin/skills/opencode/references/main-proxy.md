# The main conversation as proxy

An affirmative request such as “Прокси на GLM” selects the external model as the coordinator.
It owns the plan, delegation, worker selection, interpretation and final answer. The current host
conversation executes concrete agent orders and owns their transport and lifecycle. This mode
continues until the user leaves it or selects another coordinator; finishing one task keeps the mode.
An informational, quoted or negated mention does not activate it. An ordinary external-worker request
uses the per-worker proxy instead.

## Activate

Use the current conversation as the proxy. Luna with medium effort is the recommended Codex host.
Selecting this role does not switch the host model. Use a supported switch facility when available;
otherwise state the actual setting and let the user select Luna in the interface. Continue on the
available host without reporting a switch that did not happen.

Resolve the selected external family through the adapter's discovery procedure. Keep its exact model
and variant for continuations. A different coordinator starts a new session with the agreed context.
Missing task details remain a user question before launch.

Supply the available worker models, routes, efforts, capacity and already approved defaults. Use the
current runtime and selected adapters as their source; an unobservable capability is unavailable.
The coordinator needs these capabilities and the existing authority, not native tool signatures,
process handles, polling commands or JavaScript. No additional permissions configuration is created.

## Agent orders

The schema has plan, requests and final_answer. A request batch has an empty final_answer; a final
reply has no requests. Each request has a unique id and one action:

| Action | Coordinator supplies | Proxy does |
|---|---|---|
| delegate | agent_id, complete task, scope, model and effort | resolves the chosen worker route, launches it and records its native identity |
| continue | known agent_id and complete follow-up task | continues that worker with its existing model, scope and context |
| collect | known agent_ids | obtains their statuses and complete replies, using bounded native waits when needed |
| stop | known agent_ids | interrupts only those workers and reports the observed outcome |

An agent_id is the coordinator's logical identity for a worker. The proxy binds it to the actual
native thread and, for an external worker, its session and report. It is not a path prefix: collect
and stop reach only workers created in this mode. Preserve that binding across continuations.

For delegate, null model or effort means an already approved default. If no applicable default
exists, return the missing choice to the coordinator. Resolve a named family to an available exact
model through its adapter; never silently substitute a model. The scope must fit existing authority.
Every task includes its necessary inputs, expected result and applicable constraints; “find some
agent” is not an executable order. The proxy forwards the task without rewriting it and carries
the existing user instructions and granted scope in the worker brief.

The proxy selects technical invocation details from the host and adapter procedures. Native agents
use direct native delegation; external workers use their adapter and per-session lifecycle owner.
The coordinator selects additional work or a different plan after an error. The proxy handles
identifiers, authorized defaults and transport state without becoming another task planner.

Workers own task execution with their available tools. This coordinator protocol exposes agent
orders only; arbitrary host tool calls and freeform JavaScript are unsupported. Return an incomplete
or unsupported order with its original id so the coordinator can choose an actionable replacement.

For each substantive native-worker turn in this mode, assign a fresh permitted scratch file for its
complete reply. Add that delivery instruction to the brief separately from the coordinator's task.
The worker authors one canonical reply artifact; its native final links that file instead of creating
a second version. Continuations keep previous reply files. External workers use their adapter's full
answer artifact. Read the reply file and serialize its complete contents into AGENT_RESULTS by code,
along with identifiers from the saved request and mode data. An absent, unreadable or incomplete
artifact is a delivery error; keep it explicit rather than reconstructing the answer. Ordinary
waiting, refusal and transport statuses need no reply artifact.

## Every invocation

Prepare a fresh report through the existing launcher. Keep the coordinator's adapter scope read-only
and repeat RIGHTS: read, ALLOW_NO_COMMANDS: yes and OUTPUT_SCHEMA pointing to this skill's main-proxy
schema on every prompt. RESUME points to the last completed report; it retains the session, not those
invocation controls. The first TASK carries the full user task, relevant context, applicable user and
repository instructions, agreed decisions, available worker capabilities and the full Agent orders
section above. For file work, include the workers' actual checkout and permitted source paths; their
scope is separate from the coordinator's read-only cwd. The coordinator issues orders through its
structured reply; workers use execution tools.
Private system instructions and hidden reasoning stay local. Workers do task work; the external
coordinator issues orders and interprets the returned evidence.

Keep mode records outside the task checkout: current report, external session, logical worker
bindings, each request and its observed outcome. Reports remain the adapter's source for attribution
and continuation. If a binding is lost, reconcile the saved records rather than starting another
session or guessing a worker identity.

## Execute the loop

1. Run the prepared --run --watch command and follow the operational proxy's attached-call procedure.
   Repeat separate polls while it runs. Empty output is still running; a RUNNING checkpoint repeats
   that command. End this stage only when the adapter is terminal.
2. Read the complete report. Require receiptOk and outputSchemaOk before executing orders. The driver
   owns schema validation and its corrective turn. Forward failure or partial data separately from
   success; execute no order from an invalid, partial or unattributed reply.
3. For the first reply, pin external_session only after verifying the attributed terminal report from
   this mode's prepared launch. An existing missing binding is unknown, not a bootstrap opportunity.
   Run agent-orders.mjs with the complete report and mode record before any action. The mode record's
   agents object maps logical agent_ids to objects with an observed, nonempty native_agent; model,
   scope and external session/report metadata may stay in that object. external_session names this
   coordinator. Redirect the reader's validated stdout to a fresh file for this report and use it only
   after exit code 0; preserve these values directly instead of recreating the JSON. The reader checks
   the complete envelope, identity references and saved binding shape. The host verifies ownership
   against observed launch records and reconciles uncertain bindings before native actions. Then check
   scope/model/defaults against existing authority and runtime capacity. Missing decisions and unsupported
   requests go back to the coordinator. Dependencies execute in order; a failed delegate makes dependent
   orders fail without guessing a binding.
4. Preserve each structured request from the validated file. Before an action, record its id, report and dispatched/outcome-
   unknown state; then invoke the actual host or adapter procedure and record its complete result.
   Resolve covered operations locally; reach the user only for authority or a decision still missing.
   A request grants no new rights. An uncertain mutation is not replayed automatically.
5. For collect, return the exact worker statuses and full replies or complete artifacts, with display
   limits marked. The proxy may wait using the host's bounded event mechanism and then read status;
   a timeout alone does not establish that a worker is still running. Continue ordinary waiting
   without asking the user. For stop, verify the worker's actual outcome; interrupt acceptance alone
   does not prove stopped work. Keep partial or unknown outcomes explicit.
6. Prepare a fresh report with the same invocation controls and RESUME path. Send AGENT_RESULTS with
   every original request id and its full outcome/error, without synthesis. Repeat until the external
   coordinator supplies final_answer or a host boundary requires the user's decision. A terminal
   adapter reply containing requests is an intermediate round; keep this native turn running.
7. Forward the complete final_answer from the validated data or its complete artifact without retelling
   or manually recreating it. The native turn ends, and the mode remains
   selected. A later USER_MESSAGE contains the user's full text and refreshed host facts under a new
   report in the same external session. Copy host identifiers from the saved mode/report data rather
   than retyping them into the continuation context.

When the user leaves the mode, stop an owned attached call and confirm its outcome before leaving.
Handle question and permission callbacks with existing agreed facts and authority through the adapter
procedure. Keep transport explanations separate from the coordinator's and workers' words.
