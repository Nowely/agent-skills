# Results

## DONE, RUNNING and the next report path

`DONE=<id>` is that agent's own exit marker: it says the run has ended even after a `RUNNING=` hand-back, and you read the report file after it (measured 2026-09-27). A continuation or a relaunch goes under the agent's next report path, `<run>/<agent>-<n>/report.json`, which a registered plan admits for a listed Codex agent once the run before it has ended. A wrapper that has handed back `RUNNING=` lines or a waiting block has no call in flight: stop that run with `SIGTERM` to the pid on the first line of `<DIR>/err.txt`, or spawn the wrapper again to get a card back.

## The result

Read the sibling's [Reading the result](../../codex/SKILL.md#reading-the-result) for the report's fields, the exit codes and `PATH=taken`; under this mode:

| Result | What to do |
| --- | --- |
| `FILE=missing`, or `PATH=taken` | Read `RECEIPT=` first: an `approvals=` token whose first number is not 0 says a command ran with your rights and no report says how it ended — that count is a decision, not an execution outcome. Read `<DIR>/approvals/` and check the tree and whatever the command touched before any relaunch, and never relaunch a prompt that would ask for the same thing again. Only once that is clear, treat the rest as unknown and relaunch once, same rights, under the agent's next report path where work remains. With `DRIVER_EXIT=unknown` nothing ended it: `kill -0 <pid>` with the pid on the first line of the stderr file says whether it is still running |
| a stderr file naming no driver | report it; no relaunch fixes an install |
| `exitCode: 3`, a cut | if the work is unfinished, continue that thread once with `RESUME:`, under the agent's next report path |
| `exitCode: 10` | a held lock or a busy thread: read `error` and the stderr file, wait for the holder, then run again; not a retry. A holder that waits on your own decision has an `ASK=` in your poll: answer it before you wait on the holder. Before a second writer enters a directory where a command was approved, check for its survivors yourself: `pgrep -fl '<the approved command>'` and wait for it — the lock does not prove they are gone |
| exit 2 or 4 | Exit 2 WITH a `turnStatus` is a turn the server rejected: read `turnError`. A `DRIVER_EXIT=2` beside `PATH=taken` says the path was already taken: nothing of this run reached the file, and the report there is an earlier run's |
| exit 4 with a `turnStatus` | the server died mid-turn or the report was not delivered: the report is complete, read it as a gate verdict |
| any other non-zero `exitCode` with an answer | a gate verdict: do not retry |
| a Claude agent that returns `blocked` | do not retry, report it |

## A worktree agent's harvest

Land the harvest by proposal: apply `worktreeDiffPath` and restore `worktreeUntrackedPath`, or merge or cherry-pick `worktreeCommitsRef` when the agent committed; show it, then wait, unless the plan said "land the winner". A preserved tree is not a harvest: check each of the three pointers first, and when they are null, propose from `worktreePath` instead.

## Writers collided

When two writers' work collides anyway, stop the writers, restate the contract, let each owner repair only its own files, then have an agent that wrote neither verify the combined tree.
