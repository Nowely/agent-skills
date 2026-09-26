# Question set 04: the seven renames and the memory heading

These are my decisions as the owner, each with one reason. Where I keep or replace a word, I cite where the project's own word comes from. Paths are relative to the snapshot. I read only the snapshot and the run directory's `terms.md`.

## 1. AI coding tool → AI coding agent

**Accepted (the default).** My tagline already uses this word: "Workflow fluency for AI coding agents." (`package.json:4`). "AI coding tool" was my own phrase in set 01, not the project's. Using both would give one thing two names.

## 2. provider → coding agent

**Accepted (the default).** The command table uses "provider" for the LLM vendor: `/adapt-workflow`, "Port to a different AI provider" (`maestro-extension/README.md:98`). Calling Cursor or Claude Code a provider on the same page would give the word two meanings.

## 3. provider folders → skills folders

**Accepted (the default).** Every one of the ten paths ends in `/skills` (`scripts/build.js:15-24`), and "provider" is already gone under item 2.

## 4. the Marketplace → VS Code Marketplace

**Accepted (the default).** My own badge already labels that store "VS Code" and links to it (`maestro-extension/README.md:5`). A Claude Code user would read a bare "Marketplace" as the plugin marketplace.

## 5. stdio → local

**Accepted (the default).** My MCP README already heads this mode "Local (stdio)" (`mcp-server/README.md:17`). `stdio` appears only inside a config block.

## 6. memory layer → session memory

**Neither.** I don't accept "session memory", and I don't keep "memory layer" either. The heading is in item 8.

The parts keep the project's own names, each with its file:

- **session summaries**: `.maestro/sessions/` ("save session summaries", `CHANGELOG.md:15`)
- **the decision log**: `decisions.jsonl` ("append-only decision log", `CHANGELOG.md:18`)
- **the command log**: `audit.jsonl` (item 7)
- all three sit in **the `.maestro/` folder** (`CHANGELOG.md:20`)

Reason: to a reader who builds LLM apps, both names mean memory for the agent they are building. "Session memory" reads as memory inside one conversation, and "memory layer" reads as a component they would add to their agent. What these parts actually do is carry a record of the reader's own sessions into the next one: "a record that survives session boundaries" (`capture/SKILL.md:16`).

## 7. audit trail → command log (`audit.jsonl`)

**Accepted (the default).** Always write it with the file name: "command log (`audit.jsonl`)".

Reason: the file logs Maestro's own command runs: duration, estimated tokens and cost. Meanwhile, the core skill and `/guard` use "audit trail" for a log the reader builds into their own product (`agent-workflow/SKILL.md:188`; `guard/SKILL.md:75,98`). On one page, the same words would name two different things. The file name in brackets keeps returning users connected to `audit.jsonl` and `maestro_read_audit`.

## 8. The heading of the memory section

**"Memory across sessions".**

Reason: it keeps the word I led 2.0 with (`CHANGELOG.md:14`, "Memory Layer"; `maestro-extension/package.json:4`, "Memory, audit trails, …"). It also says the one thing the section's parts do, in my changelog's words: "persistent memory that survives sessions" (`CHANGELOG.md:20`).

The first sentence under the heading says whose sessions these are: yours, with your coding agent.

This replaces "memory layer" wherever I used it for the README in sets 01 and 02. The changelog keeps its own word.
