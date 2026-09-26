# The stand-in's note for the runner, 2026-09-24 — from its reply to question set 05, not from answers-05.md

Verbatim from the reply; the stand-in marked it "not part of the answer":

> **Different server names for the same MCP server.** The config block I chose names the server `maestro` (`mcp-server/README.md:26`). The extension writes its entry under `maestro-workflow-mcp` (`maestro-extension/src/adapters/mcp-config.ts:30`). If an extension user also pastes the README's block into a config the extension wrote to, they end up with two entries for the same server. This is an existing inconsistency in the code, not a README decision, so I kept it out of the answer.
