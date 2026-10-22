# Native requests, immutable decisions

An OpenCode request is a permission or a question. The waiting result prints its type, server, session,
invocation, deadline and complete JSON between `REQUEST_BODY<<TOKEN` and `REQUEST_BODY>>TOKEN`; these
identifiers bind the decision to the request. Read it whole and decide it with the commands of the shared
call page's [Decide a request](../../orchestrate/references/external.md#5-decide-a-request); what an accept
and an answer do is its [What each adapter adds](../../orchestrate/references/external.md#what-each-adapter-adds).
This page holds the mechanics behind them. Grant only the displayed action within the approved task and scope.
Entrust allows external-directory reads without prompts: `RIGHTS` selects the working directory or writable
roots, not a read boundary. The edit rules still govern file-tool changes. Shell is allowed without prompts,
so no shell command reaches this decision flow; the shell is not a filesystem sandbox.
A question is a V2 form: its text is the form's title, each field is one question, and the answer is one
list of choices per field, validated against the form's own options. An answer grants no command or
permission. An edit with no exact target, or one aimed inside OpenCode's configuration or data directory,
is declined at once.
Publication is exclusive: stale identities, changed request contents, wrong decision types and late answers
are refused.

Native permission rejection affects every pending permission in its session, including ordinary
decline, automatic denial and expiry. The driver serializes decisions and requires an exact owned
match for every affected request. Sibling envelopes record the native rejection and its causing
request; they are not fabricated as separate coordinator decisions. A changed payload or unmatched
request leaves the outcome unknown without a rejection. A lost group-rejection response leaves
every affected outcome unknown and is not resent. Questions are cancelled individually.

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
