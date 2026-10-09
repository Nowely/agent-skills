# Incidents behind the rules

The measurements behind this adapter's rules.

## Waiting for background agents

- 2026-09-26: a background agent's return arrived as its message and then its completion notification, with no
  tool called to wait for it.
- 2026-09-27: in an interactive session, agents left alive at the end of a turn went on, and each completion
  arrived as a turn of its own.
- 2026-09-08: a headless session killed its background tasks when its turn ended.

## A Workflow hid an early exit

2026-09-08: an agent in a Workflow exited at minute 9, and its exit surfaced only when the user asked, while its
sibling ran 18 minutes. A Workflow reports nothing until its last agent returns.

## Explicit-only skills

2026-09-29: the Skill tool loaded an explicit-only skill in each of 13 turns whose user message typed its
command, and refused it in each of 6 that did not.

## A resent block

2026-10-09, three external Sonnet agents in a headless Claude Code 2.1.295 session, each run by an `entrust:proxy`
on Haiku: every proxy ran its first block. After the coordinator decided a request and sent a proxy the same block
again, two of the three answered with their earlier hand-back and ran nothing, and the coordinator took over the
runs itself. The same day in Codex, Luna proxies that kept one attached call and decided requests themselves
started a second watcher on one driver, accepted a clipped request, and left `--why` empty on 26 accepts; the run
took close to three hours for a read-only check that native agents finished in seven minutes.

## A subagent without the Agent tool

2026-10-09, a Claude Code 2.1.295 cloud session: a `general-purpose` subagent on Opus found no Agent tool in its
list or through ToolSearch, and stopped. The same brief run as a top-level `claude -p` session launched its workers.

## Read agents and the shell

2026-10-09, the same three Sonnet read agents: the two whose commands held a variable assignment, a
loop or `awk` asked for 11 commands, all read-only; the one that only chained `cd`, `sed -n`, `grep`, `wc`
and `echo` asked for none. The same day in Codex, three OpenCode GLM read agents briefed to check with
the shell asked 43 times, 37 of them for bash, though their standing rules said every shell command needs approval.
One of them, given single files outside its directory to read, asked six times for the whole directory and was
refused.
