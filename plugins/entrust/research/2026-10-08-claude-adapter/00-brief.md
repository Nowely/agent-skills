# Brief: Claude as an external agent

**Question.** How should entrust run Claude agents the way it runs Codex and OpenCode agents, through the shared
launcher (`orchestrate/scripts/agent-run.mjs`), a proxy and the approval mailbox, from any host, and do it better
than those two adapters?

**The owner's decisions (2026-10-08).**

1. The adapter is the existing `claude` skill, extended: one adapter per model family. In a Claude Code host its
   agents stay native; a plan row whose adapter column says `claude` is an external run.
2. Version 1 covers `read`, `write` and `worktree` rights, the five-field return, continuation, cost, and
   approvals through the mailbox.
3. By default an external Claude agent runs with the user's own configuration (hooks, MCP servers, CLAUDE.md,
   memory); a prompt field turns on Claude Code's `--safe-mode` for a role that must not see them.

**Constraints.** The scripts have no dependencies (`plugin/package.json`). Only documented Claude Code interfaces:
the `claude` CLI in print mode, not the Agent SDK's alpha control protocol. The launcher's driver contract stays
as it is: `--check-prompt-file`, `--prompt-file … --report-file … [--approval-dir …]`, the pid line naming
`reportPath=`, the two refusals the launcher sorts on, an exclusive report, and the mailbox files.

**What "better" has to mean, checkably.**

- A driver an order of magnitude smaller than Codex's 4,918 lines and OpenCode's 1,363, with no pinned protocol
  schema and no server of its own.
- The return validated by the CLI (`--json-schema`), not extracted from text.
- Continuation, cost and limits taken from the CLI's own result, not reconstructed.
- A context-free agent on request, which no native Claude subagent can be.

**Where it is used.** A Codex host (no Claude route today: the advisor in Codex cannot reach the other family);
OpenCode's main proxy mode; and a Claude Code host that needs an agent outside its own context.
