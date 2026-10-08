# Probes of `claude -p`, 2026-10-08

Claude Code 2.1.294, Linux container, signed in by OAuth (`claude auth status`: `"authMethod": "oauth_token"`).
Every probe ran `claude -p --model haiku --output-format stream-json --verbose` in a scratch directory under an
environment holding only `PATH`, `HOME`, the proxy and CA variables, as a terminal or a Codex host would hand it;
the session's own `CLAUDE_CODE_*` variables were left out. Prompts went in on stdin. Spend for all probes:
about $0.02 (each run's `total_cost_usd`). Evidence level 3 for every row: the behaviour was made to happen.

| # | What was run | What happened |
| --- | --- | --- |
| P0 | `--json-schema "<five-field schema>"`, "read note.txt and report it" | exit 0 in 7.6 s; events `system/init`, `assistant`, `user`, …, `result/success`; `result.structured_output` held the five fields, `result.result` the same as text; `total_cost_usd` 0.0042; `modelUsage` named `claude-haiku-5-5`; `system/init` gave `model`, `permissionMode`, `tools`, `plugins`, `session_id` |
| P1 | a `CLAUDE.md` saying "answer BANANA first", once plain and once with `--safe-mode` | plain: "BANANA OK", `system/init.memory_paths` set; `--safe-mode`: "OK", no `memory_paths`, OAuth still accepted |
| P3 | `--safe-mode --resume <session_id>` after "remember 4217" | answered "4217"; the result carried the same `session_id` |
| P2 | `--tools Read,Bash --mcp-config <one stdio server> --permission-prompt-tool mcp__entrust__approve`, "run `touch made-by-probe.txt`" | `ls` ran without a prompt; `touch` reached the tool as `{"tool_name":"Bash","input":{"command":"touch made-by-probe.txt","description":"…"},"tool_use_id":"toolu_…"}`. Answer `{"behavior":"deny","message":"…"}`: no file, the denial listed in `result.permission_denials` with `tool_name`, `tool_use_id`, `tool_input`. Answer `{"behavior":"allow","updatedInput":<input>}` after a 20 s wait: the file was made, exit 0 in 23 s |
| P4 | `--permission-mode acceptEdits --effort low`, Write to an absolute path inside the working directory and one outside | the inside write ran without a prompt; the outside one reached the tool, and its denial was listed. `--effort low` was accepted for Haiku. Given "the current directory" without a path, Haiku first wrote under `/tmp/claude-0/<slug>/`, the path Claude Code's prompt names as its scratchpad: a brief names absolute paths |
| P5 | a foreground `node -e "setTimeout(()=>{},45000)"`, then SIGINT, then the same with SIGTERM, 15 s in | SIGINT: exit 0 after 1.6 s with `result` `subtype: error_during_execution`, `is_error: true`, `terminal_reason: aborted_tools`. SIGTERM: exit 143 after 1.4 s and no `result` line |
| P5b | the same, `claude` in a process group of its own, `ps -eo pid,pgid,sid` 15 s in and 3 s after SIGINT | the command ran under `/bin/bash -c … eval '<command>'` in a session of its own (its own pgid and sid, not `claude`'s); 3 s after `claude` exited on SIGINT it was gone. A kill of `claude`'s group would not have reached it |

From the documentation (level 1), not probed:

- `MCP_TOOL_TIMEOUT` defaults to 100,000,000 ms (about 28 hours); a stdio server has no per-request timer; a
  per-server `timeout` in the MCP config overrides it and sets the floor of the tool-call idle window
  ([env-vars](https://code.claude.com/docs/en/env-vars)). A 30-minute approval wait fits under both.
- `--permission-prompts none` denies whatever would prompt, removes `AskUserQuestion`, and lists the denials;
  requires 2.1.259 ([headless](https://code.claude.com/docs/en/headless)).
- `--bare` reads no OAuth credential, only `ANTHROPIC_API_KEY` or an `apiKeyHelper`; `--safe-mode` keeps
  authentication, model selection, built-in tools and permissions ([CLI reference](https://code.claude.com/docs/en/cli-reference)).
- SIGTERM leaves the turn unfinished and records no result; SIGINT ends the turn
  ([headless](https://code.claude.com/docs/en/headless)).
- A background subagent or workflow keeps `claude -p` open until it completes, up to
  `CLAUDE_CODE_PRINT_BG_WAIT_CEILING_MS` (10 minutes idle) ([headless](https://code.claude.com/docs/en/headless)).
