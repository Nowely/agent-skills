# Results of the measurements run in the container (2026-10-09)

`claude` 2.1.295, model `claude-haiku-5-5`, through the entrust drivers and launcher at `main` after #74. Every run
cost under one cent; the whole set about six cents.

## A. What `init` reports (evidence level 3)

Two runs through the Claude driver, a trivial task, one per level, with and without a mailbox:

| Rights | `--permission-mode` sent | `init.permissionMode` | `init.tools` |
| --- | --- | --- | --- |
| read | `manual` | `default` | Bash, Glob, Grep, Read, StructuredOutput |
| write | `acceptEdits` | `acceptEdits` | Bash, Edit, Glob, Grep, Read, StructuredOutput, Write |

`StructuredOutput` is the tool `--json-schema` adds. With a mailbox, the approval server appears in
`init.mcp_servers` (`entrust-approvals`, connected) and not in `init.tools`: the permission-prompt tool is not one
the agent can call. **Changed:** the Claude effect check is exact now: a read run's mode must be `default` (or
`manual`, should a later CLI echo the flag), a write run's `acceptEdits`, and the built-in tools exactly the
granted ones besides `StructuredOutput`; MCP tools are left to `context`. Both runs pass the exact check live.

## B. What `acceptEdits` writes unasked (level 3)

One write run with a mailbox, in a scratch git repository, asked for five Write calls; the probe declined every
request (`02-claude-protected-probe.mjs`):

| Target | Written unasked |
| --- | --- |
| `<root>/plain.txt` | yes |
| `<root>/.git/hooks/post-commit` | no: asked, declined |
| `<root>/.git/config.probe` | no: asked, declined |
| `<root>/.claude/settings.json` | no: asked, declined |
| a directory outside the root | no: asked, declined |

So Claude Code itself keeps `.git` and `.claude` inside the working directory out of `acceptEdits`, as Codex's
sandbox and OpenCode's deny rules do: the Claude half of c1 finding 8 holds without a rule of the driver's. The run
exited 6, as a declined request makes it. The Bash sandbox could not be measured here (no `bwrap`).

## C. Stop on a background Bash `--run` (level 3, this harness)

A Claude agent whose task was `sleep 90`, launched by `agent-run.mjs --run --watch` as one background Bash task of
this session, stopped with the harness's TaskStop while the sleep ran. The launcher forwarded SIGTERM to the
driver (the keeper's child, in a session of its own); the driver stopped `claude` and published its report:
exit 3, `stopped by SIGTERM`, `turnStatus: aborted`; the exit marker was there at once and no launcher, keeper,
driver, `claude` or `sleep` process was left. This is the cloud session's harness; whether the VS Code
extension's task list shows such a task and stops it the same way (E102's other half) still needs that extension.

## D. The relay without the pasted steps (level 3)

`03-relay-alone-probe.mjs`: a `claude -p` coordinator on Haiku with this plugin loaded makes one Agent call to
`entrust:proxy` (Haiku); the command is a stub that prints `RUNNING=` twice, then eight status lines and `REPORT=`.

| Message | Runs | Ran until the final result (3 calls) | Command unchanged | Lines handed back whole | Ran anything else |
| --- | ---: | ---: | ---: | ---: | ---: |
| command and description only | 6 | 6 | 6 | 6 | 1 (`echo "placeholder" >/dev/null`) |
| the four pasted steps | 1 | 1 | 1 | 1 | 0 |

One run in six ran a command nobody asked for, so the file alone does not suffice: **the pasted block stays**
(decision 7).

Every run also showed that a subagent of `claude -p` 2.1.295 has no `SubagentHandback` tool, which step 3 tells
the relay to call; an Agent in this session's harness has it. Without it, the relay wrapped the status lines in
prose about the missing tool, and one run wrote the "report delivered" line anyway. **Changed:** step 3, in
`agents/proxy.md` and in the shared page's block alike, now says that a relay with no `SubagentHandback` writes
exactly the lines as its final message. Three runs of the pasted block with that sentence: 3 calls each, the
command unchanged, and nothing beside the lines but the harness's own frame.
