# Rounds

| Round | Document | Critic | Findings | Regressions from the previous round |
| --- | --- | --- | --- | --- |
| 1 | [02-design-v1.md](02-design-v1.md) | Opus, [03-critique-c1.md](03-critique-c1.md) | 2 blocking, 8 major, 4 minor | none (first round) |
| 2 | the implementation, `b89ab98..f2ea528` | Opus, [05-review-r1.md](05-review-r1.md) | 2 major, 5 minor | none of round 1's fixes undone |

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

## The implementation

Built from [04-design-v2.md](04-design-v2.md) in `6c8cf7c`, with one departure: a stopped run's `turnStatus` is
`aborted`, the OpenCode driver's word for it, not `interrupted`. `evals/claude.test.mjs` passes 17 cases on the fake
`claude`. Its opt-in live case passed on 2026-10-08 against Claude Code 2.1.294 on Haiku, level 3: `RIGHTS: read`,
a `touch` offered through the approval server, handed back by `--run`, accepted with `--decide`, and the run ended
`EXIT=0`, `approvals=1/0/0/0`, `model=Haiku`, the file made.

## Round 2

Two fixes came first from another session's review (#69, merged into this branch as `f2ea528`): a missing run
directory refused at `--check-prompt-file`, and a worktree's `diff` taken against its base (E136). Then the
review, each finding settled:

| # | Outcome |
| --- | --- |
| 1 | fixed: the driver claims the report before any other check, so every later refusal is a published report and `--run` prints its reason on `ERROR=`; a case removes the directory between `--new` and `--run` |
| 2 | fixed: the deny rules name this run's mailbox and each top-level entry of the state directory but `worktrees`; a case pins them |
| 3 | fixed, the docs confirming it (level 1): no `Write(...)` rules; the `Edit(//…)` ones cover the Write tool, redirects and `tee` |
| 4 | fixed on the page (reads inside the directory, the busy refusal at `--new` and at launch, the diff against the base); the claim stub now carries the driver's pid, and a stub whose driver is gone is refused as a run that ended without a report rather than busy forever; the signal handlers are set at the claim |
| 5 | probed, P9 below; the fake's other gaps (deny rules, tools, mode) are left to the live case, which ran again after these fixes |
| 6 | the server is `entrust-approvals`, as designed, P9 showing a hyphenated name works; the `AGENT=` line was left as it is, the round-1 critic having called that change optional |
| 7 | the `scopeWithin` copy is gone; the approval server's own check of a decision's identity stays, as the OpenCode driver keeps its own: the writer checks independently of the reader |

| # | What was run | What happened |
| --- | --- | --- |
| P9 | a server named `entrust-approvals` holding a `touch` for 120 s, SIGINT to `claude` while it waits | the call reached the hyphenated server; `claude` exited 0 in 0.75 s with `result` `error_during_execution`, `terminal_reason: aborted_streaming`, one denial; the server got no `notifications/cancelled` |

After the fixes `evals/claude.test.mjs` passes 19 cases and its live case passed again on Haiku, with the renamed
server and the narrowed rules.
