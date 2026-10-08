# The owner's decisions on 09 (2026-10-08)

The recommendations of [09-proposal-v2.md](09-proposal-v2.md), with three of them changed or made precise:

1. **Egress stays on by default.** `NETWORK` and `WEB_SEARCH` keep today's defaults; the shared page states them.
   Whether the plan row pins them is designed in step 4, against this default.
5. **OpenCode runs on the private server its driver starts** (`local-server.mjs`), which is how it is used.
   Attaching to a remote server (`ENTRUST_OPENCODE_URL`, a connection file) is not, and goes.
7. **The proxy is the host's smallest model, not a named one.** Haiku in Claude Code, Luna in Codex; in principle
   any model can relay. The shared page names the role, and each adapter's `models.md` names the model.

Decisions 2, 3, 4, 6 and 8 as recommended: writers on one tree share a state directory and overlapping write rows
are refused at plan time, the Codex lock kept for runs with no plan; `--verify` deleted; OpenCode V1 only, V2 to
`research/`; Codex agents' lack of MCP servers stated; the endpoint left in git history. The step-5 measurements
that spend tokens are still each asked for before they run.

**A constraint on every page change (the owner, same day).** The plugin is not only for Claude: a Codex or OpenCode
model reads the same pages as a coordinator or a proxy. What is obvious to the model writing a page may not be to
the one reading it. Every page states each step as an action with its command, names a host's own terms (Agent,
SubagentHandback, a native subagent) only in that host's section and says what they are, and leaves nothing to
an inference the writer would make. terse's clarity rules are a check on this, not a substitute for it.
