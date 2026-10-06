# Native requests, immutable decisions

Read each `--pending` or `--run` waiting result whole. An OpenCode request carries its type, server,
session, invocation, deadline and complete JSON between `REQUEST_BODY<<TOKEN` and
`REQUEST_BODY>>TOKEN`. These identifiers bind the decision to the displayed native request.

- Permission: `--decide <id> --accept --report-file <report>` reads that exact JSON on stdin and
  replies `once`. It never saves an `always` rule. Use a quoted heredoc; preserve the body byte for
  byte. Grant only the displayed action within the approved task and scope.
- Question: `--decide <id> --answer --report-file <report>` reads `{"answers":[["answer"]]}` on
  stdin, one array for each displayed question. Choices and multiplicity are validated. This does
  not grant a command or permission.
- Either type: `--decide <id> --decline --why <reason> --report-file <report>` rejects it.

Rerun the same `--run` after a decision. Decision publication is exclusive; stale identities,
changed request contents, wrong decision types and late answers are refused. A repeated operation
does not authorize a second native action. The driver checks the native request again before sending.

With `--run --watch`, a request is an intermediate `EVENT=waiting` frame and the call remains
attached. Publish the decision separately; the watcher observes continuation without relaunching.
An operational proxy may decide within the existing task authority and supplies its reason through
`--why`. Ambiguity goes to the coordinator. Keep the complete worker answer and technical status
separate; neither approval nor a successful command proves the task's content correct.

Native permission rejection affects every pending permission in its session, including ordinary
decline, automatic denial and expiry. The driver serializes decisions and requires an exact owned
match for every affected request. Sibling envelopes record the native rejection and its causing
request; they are not fabricated as separate coordinator decisions. A changed payload or unmatched
request leaves the outcome unknown without a rejection. A lost group-rejection response leaves
every affected outcome unknown and is not resent. Questions are rejected individually.

The default request deadline is thirty minutes. Pending requests pause idle accounting; a declared
wall deadline remains active. Without an interactive mailbox, reject and report the request.
Model questions and permissions have distinct outcomes and exits.

An accepted decision is permission to proceed, not proof that its tool executed or succeeded. Read
the observed command/tool result and report. A lost HTTP response is reconciled, not retried blindly;
an outcome that cannot be established stays unknown. Investigate it before repeating the action.

Cancellation is session-scoped. Its report separates request acceptance from observed stopped work.
Neither idle nor a successful abort rolls back an external effect that already happened.
Stop aborts owned sessions before rejecting exact owned pending callbacks. Native permission rejection
affects the whole session's pending permissions; an unmatched request prevents that cleanup. The driver
then checks owned status, callbacks and tools. Discovery must be complete, and known owned
descendants are retained across read failures. If Stop crosses admission, the driver reconciles
again after that admission without resending the prompt. It also rechecks Stop before publishing
a completed result. An unknown outcome prevents resuming that session.
These observations do not establish a server-side generation fence.

V2 callbacks are enumerated through each owned session's native route. Descendants may have another
location; root-location request lists cannot establish that their callbacks are cleared. Discovery
pages session metadata and filters exact parent IDs locally. Messages and durable history are also
paged to their empty terminal page (message pages 200, history pages 100); exceeding 10,000 items or an invalid cursor/sequence fails the
observation. Attribution follows promoted `session.next.prompted` inputs and subsequent
`session.next.step.started` events, never admission order or guessed timestamps. Native `wait` is
unused. Replies and interrupts require the installed 204 response; a different success status leaves
the mutation unknown and is not resent.
