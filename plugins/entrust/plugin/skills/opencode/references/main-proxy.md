# The main conversation as proxy

An affirmative request such as “Прокси на GLM” selects the external model as the main coordinator.
It owns the task's plan, delegation, model and effort choices, interpretation and final answer.
The current host conversation owns transport and executes its concrete host-tool requests. This mode
continues until the user exits it or selects another coordinator; a completed task alone does not exit.
An informational, quoted or negated mention does not activate it. An ordinary external-worker request
uses the per-worker proxy instead.

## Activate

Use the current conversation as the gateway, without creating another coordinator proxy. In Codex,
Luna with medium effort is the recommended host setting. Use a supported model-switch facility only
when it exists; otherwise state the actual host model and let the user select Luna in the interface.
Selecting this role does not itself change the host model. Continue on the available host and state
the difference; never report a switch that did not happen.

Select and pin the requested external family by the adapter's normal discovery procedure. Missing
task details remain a user question before launch. Switching the external coordinator starts a new
session with the complete agreed context; continuing a task keeps the previous model and variant.

Inventory the host tools, native models, supported efforts, context-transfer choices and current
capacity from this runtime. Supply their public descriptions, input format and argument contracts
from the runtime declarations. This is a per-session snapshot, not a maintained tool-schema copy.
Expose only tools actually callable here. Distinguish direct native agent calls from wrapper tools:
on Codex, collaboration calls run directly and are unavailable inside functions.exec. Treat an
unobservable capability as unavailable. Supply refreshed availability when the runtime changes.

## Every invocation

Use the existing launcher and a fresh absolute report path in the run's transport state. Keep the
coordinator's adapter scope read-only; requested task mutations execute through host tools under
the user's existing authority. Set ALLOW_NO_COMMANDS: yes and OUTPUT_SCHEMA to the installed
main-proxy schema under this skill's schemas directory. Repeat RIGHTS: read, ALLOW_NO_COMMANDS: yes
and that OUTPUT_SCHEMA in every prepared prompt, including tool-result and user-message continuations:
RESUME retains the external session, not these invocation controls. The first TASK carries:

- the user's complete task, applicable user and repository instructions, already agreed decisions,
  relevant context and artifact paths; private system instructions and hidden reasoning stay local;
- the runtime capability snapshot and current authorization, including missing approvals;
- this coordinator contract: “You own planning, delegation, interpretation and the final answer.
  Use the declared host tools for task work. Return either concrete tool calls with an empty
  final_answer, or your complete final_answer with no calls. Each call has a unique id, the exact
  declared tool name, and input as a string. For a JSON tool, input is the complete JSON argument
  object; for a text tool, input is its literal text. Host results and errors will be returned with
  your call IDs. Decide the next step yourself. Request real worker results before claiming their
  work is complete. Preserve the user's task and full replies without shortening them.”

Keep transport records outside the task checkout. Retain this mode, the current report path and
external session identity across host compaction. The existing adapter reports own model selection,
session continuation and cancellation. The mode record points to those reports and records the
current phase and host-call outcomes; it does not select a session by time or maintain another registry.
If the binding is lost, report it as unknown and reconcile the saved records before continuing.

## Execute the loop

1. Run the prepared --run --watch command and follow the attached-call procedure of the operational
   proxy. Each poll is a separate host call of at most five seconds; repeat polls while that command
   runs. A poll returning no output is still running. A RUNNING checkpoint repeats the same command.
2. At terminal adapter status, read the complete report and require receiptOk and outputSchemaOk.
   Schema validation and its existing corrective turn belong to the driver. An adapter failure is a
   transport result to report; execute no calls from an invalid, partial or unattributed answer.
3. Read answerJson. A final_answer with no calls is the external coordinator's complete reply; forward
   it without rewriting. The native turn ends here and the proxy mode remains selected for the next
   user message. A terminal adapter call containing tool requests is an intermediate round: keep the
   native turn running through those calls and the coordinator's next reply.
4. For each call, preserve its ID and exact input. Parse JSON only for a JSON tool; pass text input
   unchanged to a text tool. Before invoking, save the request with its report path and a dispatched,
   outcome-unknown marker in transport state. Invoke the declared host tool through its actual calling
   surface, then save its observed outcome. Apply
   existing instructions and authority; the model's request grants no new rights. Resolve covered
   operations locally. Return a blocked action to the coordinator with its reason and existing scope;
   ask the user only for the specific decision or authority still missing. Never substitute another
   tool, model, effort or worker brief yourself. Unknown tools, invalid inputs and native-tool failures
   return as errors with the original call IDs so the external model can choose its own correction.
5. Preserve full worker replies and artifact paths in those raw results. Execute each ID once per
   invocation; repeated IDs return an error before either is executed. An interrupted or uncertain
   mutation stays unknown and is not replayed. Independent calls may use the host's supported parallel
   surface; dependencies, approvals and mutations keep their required order. The external coordinator
   chooses the agents and their briefs; the host enforces actual capacity and launch constraints.
6. Prepare a fresh report with the required invocation headers above and RESUME pointing to the last
   completed report. Return HOST_TOOL_RESULTS
   with every requested ID and its complete raw result or error, without synthesis. Repeat from step 1
   until the external model supplies the final reply or an unresolved host boundary ends this turn.

For the next user message, send USER_MESSAGE with its complete text and any refreshed host facts,
using the same required headers, RESUME path and a fresh report. When the user asks to leave proxy
mode, stop any owned
attached call, confirm its external outcome by the operational-proxy procedure, then leave the mode.
On a question or permission callback, follow the adapter's existing procedure using agreed facts and
authority; keep transport explanations separate from the external model's words.
