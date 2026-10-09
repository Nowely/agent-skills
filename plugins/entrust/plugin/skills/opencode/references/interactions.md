# Native requests, immutable decisions

An OpenCode request is a permission or a question. The waiting result prints its type, server, session,
invocation, deadline and complete JSON between `REQUEST_BODY<<TOKEN` and `REQUEST_BODY>>TOKEN`; these
identifiers bind the decision to the request. Read it whole and decide it with the commands of the shared
call page's [Decide a request](../../orchestrate/references/external.md#5-decide-a-request). What OpenCode
adds:

- A permission accept restates that JSON byte for byte and replies `once`; it never saves an `always`
  rule. Grant only the displayed action within the approved task and scope.
- An edit outside the worker's roots is offered with `CAUSE=outside`, its target in the JSON: accepting it
  writes there once, outside the rights the prompt granted. One aimed inside `<state>`, OpenCode's
  configuration or data directory, or with no exact target, is declined at once and never offered.
- A question's answer is `{"answers":[["answer"]]}`, one array for each displayed question; its choices
  and multiplicity are validated, and an answer grants no command or permission.
- Publication is exclusive: stale identities, changed request contents, wrong decision types and late
  answers are refused, and the driver checks the native request again before sending.

Native permission rejection affects every pending permission in its session, including ordinary
decline, automatic denial and expiry. The driver serializes decisions and requires an exact owned
match for every affected request. Sibling envelopes record the native rejection and its causing
request; they are not fabricated as separate coordinator decisions. A changed payload or unmatched
request leaves the outcome unknown without a rejection. A lost group-rejection response leaves
every affected outcome unknown and is not resent. Questions are rejected individually.

Without a mailbox the driver rejects the request and reports it. An accepted decision is permission to
proceed, not proof that its tool executed or succeeded: read the observed result in the report. A lost
HTTP response is reconciled, not retried blindly; an outcome that cannot be established stays unknown.
Investigate it before repeating the action.

Cancellation is session-scoped. Its report separates request acceptance from observed stopped work.
Neither idle nor a successful abort rolls back an external effect that already happened.
Stop aborts owned sessions before rejecting exact owned pending callbacks. Native permission rejection
affects the whole session's pending permissions; an unmatched request prevents that cleanup. The driver
then checks owned status, callbacks and tools. Discovery must be complete, and known owned
descendants are retained across read failures. If Stop crosses admission, the driver reconciles
again after that admission without resending the prompt. It also rechecks Stop before publishing
a completed result. An unknown outcome prevents resuming that session.
These observations do not establish a server-side generation fence.
