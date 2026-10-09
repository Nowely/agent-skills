# Approvals: what a Codex accept runs as

A Codex agent asks before it runs a command its sandbox would not, and every agent has a mailbox, so the request
waits for your decision instead of being declined at once. Read the request, accept, decline and run on as the
shared call page's [Decide a request](../../orchestrate/references/external.md#5-decide-a-request) says. The
mechanism — the mailbox, the request and decision files, the thirty-minute clock — is
[Approval mailbox](environment-and-internals.md#approval-mailbox); the report's `escalations` fields are
[Observability](environment-and-internals.md#observability). What an accept runs, and what is never offered, is
the shared page's [What each adapter adds](../../orchestrate/references/external.md#what-each-adapter-adds); this
page is what to read after a run.

## After the run

`exitCode: 6` is a request declined or expired unanswered, never one accepted; `escalations` holds one entry
per approval request, its fields in [Observability](environment-and-internals.md#observability).

A run that ended without a report of its own — `FILE=missing` beside a `DRIVER_EXIT`, or `PATH=taken` — still
says whether a command ran with your rights. Read `RECEIPT=` first: an `approvals=` token whose first number is
not 0 says a command ran with your rights and no report says how it ended — that count is a decision, not an
execution outcome. Read `<DIR>/approvals/` and check the tree and whatever the command touched before any
relaunch, and never relaunch a prompt that would ask for the same thing again; then relaunch under a fresh
report path where the work still needs doing.
