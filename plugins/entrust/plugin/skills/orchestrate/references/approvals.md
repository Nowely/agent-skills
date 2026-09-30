# Approvals

## Deciding a request

`ASK=<id>` is that agent's own request waiting on your decision, and the wrapper's own hand-back may carry the same waiting block instead of the nine lines: read it whole from that hand-back or with `--pending`, decide it as Approvals below says, send the wrapper the very same message block again, then launch the poll again over the agents still alive and keep waiting; an armed agent is launched and waited for like any other.

## The rule

A Codex agent can ask before it runs a command. Approving it runs the command as you, with no sandbox, the way every Claude agent in this session already runs; the line for Codex is not stricter than for Claude. Read the request whole and approve nothing you have not read. Decide from the waiting result the wrapper handed back, and answer with the sibling's `--decide` call. Approve a request that is non-destructive and in the plan's direction: a query, a read, a fetch of a source the plan named, a file written where the plan said files go, a deletion inside the agent's own temp root (`ROOTS=` names it), a signal to a process the agent started (`ps -o pid,ppid` shows it below the driver whose pid is the first line of `<DIR>/err.txt`), a `codex sandbox` check the plan named, which runs one command under Codex's sandbox and ends with it. Take to the owner, while the turn waits, a request that is destructive or irreversible, or outside the plan: a deletion beyond the agent's own temp root, a signal to a process the agent did not start or whose parentage `ps` cannot show, a process tree the driver cannot stop (a nested Codex agent, a server, a watcher), a write the plan did not place, a command that names `~/.codex` or the plugin's state directory. In a headless run decline it and name it in the answer. When you retell an approval, say what the entry's `outcome` says: "it ran and exited 0", or "whether it ran is not known".

## The synthesis

When the run had approvals, the synthesis says why in one sentence per cause and what avoids it next time: `rights`, the driver answered and nothing changes; `asked`, Codex asked before running the command, and nothing on our side changes it; `outside`, the plan needs a `WRITABLE:` line or a different agent for that file, or, for a permissions request, the rights the plan sets at launch.
