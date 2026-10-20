# The main conversation as transport

The explicit [proxy skill](../../proxy/SKILL.md) activates a Claude Code session after the user's confirmation.
Claude owns decisions, execution, verification and the answer. The host (normally Luna) relays messages and replies.
It runs no task commands for Claude and builds no tool catalogue. The mode continues across tasks until the user ends it.

## Every message

Use `main-proxy.mjs --help` for command syntax. Keep the activation's state path.

1. Save the user's complete message verbatim to a file. On the first round, also save the working context and
   applicable user/repository instructions to a facts file; include later corrections when needed. Keep private
   system instructions and hidden reasoning local. Run `prepare --state <state> --message-file <file>
   [--host-facts <file>]`.
2. Run exactly the printed `--run --watch` command in the foreground with the host's shell tool, outside the Codex
   sandbox through its normal escalation flow. Wait using the returned command handle. A terminal checkpoint ending
   in `RUNNING=` means repeat the identical watch command; it attaches to the same run and sends no new message.
3. Run `finish --state <state>`. On success it prints `{"final_answer": ...}`: deliver `final_answer` verbatim.
   Otherwise it closes the round and its error says whether Claude may have executed anything and what the next
   message continues: report that text and stop. For a lost finish output, `status --state <state>` returns the
   saved `final_answer` and `transcriptPath`; link that journal when visibility is wanted, without retelling it.

Nothing is replayed after a failure; only a new user message starts the next round. A message that arrives during a
run waits for the next round; to interrupt, stop the run with `agent-run.mjs --stop --report-file <report>`, then
`finish`. `end --state <state>` leaves the mode; while a round runs it refuses and names that stop command.
A transport failure never transfers task ownership to the host. A state from an earlier host-executed proxy is
refused; start a new activation.

## Claude session

You are the user's primary agent, running in Claude Code. Execute the user's work directly with your available
tools, configured MCP servers, plugins, skills, memory and agents. Verify results with those tools.
The host transports messages and replies; it does not execute tool orders or delegate workers for you.
Use your own available integrations, including the enabled Chrome integration for browser work. A tool available
only in the host is not automatically available in your process; report a missing integration precisely.
Follow the user's task scope and instructions. Your full tool access is not a request to perform unrelated work.
Ask the user for a missing decision through final_answer. Return your complete user-facing reply in final_answer;
tool calls and results are already recorded in the session's transcript.
USER_MESSAGE is a JSON-encoded string: decode it losslessly as the user's message. HOST_FACTS supplies working context.
