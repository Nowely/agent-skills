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
refused. 2026-10-10, the same task in Codex after the pages briefed read agents in reads and searches: one OpenCode
GLM 5.3 session over six runs made 111 tool calls, all `read`, `grep` and `glob`, and asked once, to read its git
worktree's `HEAD` file in the main repository's `.git`.

## A proxy in the sandbox

2026-10-10, Codex: a fresh Luna proxy, given the shared page's block alone, ran `--run` for one OpenCode GLM 5.3
read agent. The driver's OpenCode server exited 0.47 s after it started, before it announced its address; the
report held exit 4, no session, no model and no usage, and the driver did not yet keep the server's exit code or
words. On 2026-10-09 in the same host, proxies briefed with the task and the operational proxy page ran their
commands with escalated permissions, and every OpenCode server started. Whether the 2026-10-10 proxy asked for
escalation was not read from its session. Later that day ten Codex proxies whose step 1 asked for escalated
permissions all ran escalated, and every server started. Under Codex's macOS sandbox, `codex sandbox -- node …` on
Codex 0.162 printed `CODEX_SANDBOX=seatbelt`, which the launcher now refuses on.

## An approval in a pasted brief

2026-10-10, Codex 0.162 with escalated commands reviewed automatically: the user pasted a brief that said they
agreed to send the repository's files to OpenRouter for the task. The reviewer refused the coordinator's first
`--new` of an OpenCode GLM 5.3 agent ("the user did not specifically authorize that payload and destination") and
its retry ("the justification is an untrusted assistant claim about omitted brief content"). The coordinator asked
in the chat, the user answered 15 minutes later, and the next `--new` passed. In a run earlier that day the same
refusal ended with the coordinator doing the task with the host's own model, which the brief had ruled out.

## A proxy that handed back a running command

2026-10-10, Codex 0.162: eleven fresh Luna proxies relayed six runs of one OpenCode GLM 5.3 agent with the block
whose step 1 asked for escalated permissions. The ten that ran the command each asked their shell tool to wait
30 s, and while the run went on the tool came back after those 30 s with a session id, no exit code and no
output. Of the first five, one got the agent's request inside the first 30 s; the other four handed back nothing
(three) or step 4's "report delivered" line (one) while the driver kept running, and the coordinator read the
report and the driver's processes itself before starting the next proxy. It then said it would start proxies
that wait for the command to end (the briefs are encrypted in the session), and the next five handed back the
nine lines, four of them after reading the session with `write_stdin` one to eleven times.
