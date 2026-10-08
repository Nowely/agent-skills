# Rounds

| Round | Document | Critic | Findings | Regressions from the previous round |
| --- | --- | --- | --- | --- |
| 1 | [02-design-v1.md](02-design-v1.md) | Opus, [03-critique-c1.md](03-critique-c1.md) | 2 blocking, 8 major, 4 minor | none (first round) |

## Round 1

Every finding was taken into [04-design-v2.md](04-design-v2.md). Three were settled by probes run after the
critique, each on Haiku through the same scrubbed environment as 01 (spend under $0.01):

| # | What was run | What happened | Settles |
| --- | --- | --- | --- |
| P6 | `--safe-mode` with `--mcp-config <approval server>` and `--permission-prompt-tool` | exit 1 in 2 s: `Error: MCP tool mcp__entrust__approve (passed via --permission-prompt-tool) not found. Available MCP tools: none`; `system/init.mcp_servers` empty | finding 4: safe mode drops `--mcp-config` servers, so `SAFE_MODE: yes` runs without a mailbox |
| P7 | `--session-id U1` "remember 5150", then `--resume U1 --fork-session --session-id U2` | the second run answered "5150" and its `result.session_id` was U2 | finding 5: a continuation can fork into a session id the driver chose |
| P8 | a 70 s approval wait, `MCP_TOOL_TIMEOUT=60000` in the environment, the server's `timeout` 2,000,000 | the call waited, the allow was taken, the file was made, exit 0 in 73 s | finding 7 |
| P8b | the same without the server's `timeout` | the tool call timed out; Claude Code sent the server `notifications/cancelled` twice and retried, and reported "MCP server "entrust" tool "approve" timed out"; no file | finding 7: the per-server `timeout` is load-bearing; finding 2: a cancelled call reaches the server as `notifications/cancelled` |

The critic ran one `claude -p` with a credential-less HOME and `--max-budget-usd 0` against its brief; it stopped
at option parsing and called no model.

Two pre-existing defects it found go to `ISSUES.md`, not into this change: the plan registry checks a row's model
against every adapter's list (`x | codex | opus` registers), and OpenCode's worktree diff is a bare `git diff`.
