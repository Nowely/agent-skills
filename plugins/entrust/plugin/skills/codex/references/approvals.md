# Approvals: the coordinator's steps

A Codex agent can ask before it runs a command, and every agent has a mailbox, so the request waits for your
decision instead of being declined at once. The mechanism — the mailbox, the request and decision files, the
thirty-minute clock — is [Approval mailbox](environment-and-internals.md#approval-mailbox); the exact syntax of
`--pending` and `--decide` is `node "${CLAUDE_SKILL_DIR}/scripts/agent-run.mjs" --help`, `${CLAUDE_SKILL_DIR}`
the codex skill's directory, the one the page's own call names; the report's `escalations` fields are
[Observability](environment-and-internals.md#observability). This page is what you do, in the order it happens.

## The waiting result

The wrapper hands back what `--pending` prints for each request waiting: `REQUEST=<id>`, `THREAD=`, `METHOD=`,
`CAUSE=`, `CWD=`, `REASON=`, `ROOTS=`, `DEADLINE=`, then the command whole between `COMMAND<<TOKEN` and
`COMMAND>>TOKEN`, then `REQUESTS=`, `WAITING=` and `REPORT=`; `--help` has each field. The wrapper hands it back
like any result — its step 2 reruns only on a result ending in `RUNNING=` or on the harness's background notice
— so read it whole and decide under the plan's own rule. An accept runs the command as you, with no sandbox.

## Accept

An accept restates the command it approves: copy the lines between `COMMAND<<TOKEN` and `COMMAND>>TOKEN` as
printed into a quoted heredoc whose delimiter you build at that moment from `ACCEPT_`, the printed token and six
hex characters of your own, and check it is no line of the command. Never a fixed word and never the printed
token alone: a line of the command equal to the delimiter would end the heredoc and run the rest in your shell,
and the token reached you through the wrapper, which could have changed it. The ID reached you the same way:
quote it, and use it only in the shape the launcher prints, digits, a hyphen and eight hex characters; for
anything else print `--pending`:

    node "${CLAUDE_SKILL_DIR}/scripts/agent-run.mjs" --decide '<ID>' --accept --report-file "<REPORT>" <<'<DELIMITER>'
    <the lines between COMMAND<<TOKEN and COMMAND>>TOKEN, exactly as printed>
    <DELIMITER>

The launcher compares what it reads with the request's command, one trailing newline tolerated, and publishes
nothing on an empty stdin or any difference; when it refuses the restatement as different, print `--pending`
and copy from that. An accept the permission check or the classifier blocks publishes nothing either: decline
the request with `--decide '<ID>' --decline`, or ask the user when the session is interactive. Then send the
wrapper the very same message block again: `--run` picks the run back up. A session with no message tool
continues the same way with a second wrapper given the same command.

An accepted escape runs as the user, so two hazards ride with every accept, as they do with your own Bash:
a version-control query runs the repository's configured hooks, monitors and pagers, and a script runs the
bytes at its path when it runs, not the bytes you read.

## After the run

`exitCode: 6` is a request declined or expired unanswered, never one accepted; `escalations` holds one entry
per approval request, its fields in [Observability](environment-and-internals.md#observability).

A run that ended without a report of its own — `FILE=missing` beside a `DRIVER_EXIT`, or `PATH=taken` — still
says whether a command ran with your rights. Read `RECEIPT=` first: an `approvals=` token whose first number is
not 0 says a command ran with your rights and no report says how it ended — that count is a decision, not an
execution outcome. Read `<DIR>/approvals/` and check the tree and whatever the command touched before any
relaunch, and never relaunch a prompt that would ask for the same thing again; then relaunch under a fresh
report path where the work still needs doing.
