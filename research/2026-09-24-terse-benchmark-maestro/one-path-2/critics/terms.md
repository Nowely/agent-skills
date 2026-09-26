<!-- terms; 13.1 min; 8 tool uses -->

Reader (purpose.md §2): builds LLM apps/agents/pipelines (their own vocabulary: prompts, tools, RAG, multi-agent setups), works inside an AI coding tool, knows their tool and slash commands, does not know "MCP server" or "skills folder," no install route picked.

## 1. Words this reader would parse differently

- **L8** "tools" in "**Fits the tools you use.**" — means "AI coding tool" here, but "tool(s)" means LLM function-calling elsewhere 11 times (L3, 5, 47, 67, 69, 77, 79, 112, 116) — including the line directly above it (L5: "too many tools"). This reader, primed by L5, reads the header as being about LLM tool integrations. → **coding tool**

- **"agent"** meaning the hosting tool, not the reader's own product — L3 "your coding agent", L17 "any supported agent", L29 "every supported agent", L33 "your agent's chat", L71 "your coding agent", L116 "your agent follows", L124 "each agent's folder", L128 "The agent folders", L132 "the ten agent folders". This reader's whole profile is built on "agent" meaning *their* LLM product, and the draft uses it that way just as often and correctly: L3 "agents that hold up in production" / "agent design", L70 "needless agents", L80 "multi-agent system" / "one agent" (×2), L90 "a first agent" / "add an agent". Nothing in the bare word marks which sense applies at each site. → **coding tool** (matches purpose.md's own term for this reader)

- **L112** "a prompt" in "offers each command as a prompt" — this reader's sense of "prompt" (per purpose.md: prompts, tools, RAG) is text written to instruct a model. An MCP "prompt" is an invokable template that shows up in the client's UI the way a slash command does — which this reader already has a word for. → **a slash command**

## 2. Internal names where the reader has a word of their own

- **L116** `agent-workflow` — a bare internal skill-slug, apposed in the same clause to its own plain gloss: "first load `agent-workflow`, the core skill". The reader never needs the slug to use Maestro; the sentence already supplies the word they'd use. → drop it, keep **the core skill**

- **L8** "**Skills**" — capitalized proper noun, used bare 9 lines before it's ever defined (L17: "**Skills**, the command files themselves"). This reader already has "commands"/"slash commands" — from L3 two bullets up, and from their own prior knowledge (purpose.md: "know... what a slash command is"). → **Commands**

## 3. Terms used twice under two names

- **skill / command** — L116 states the equivalence outright: "Each command is a skill." Yet the same artifact is "Skills" at L8, 17, 29, 124, 128, 132, and "commands"/"slash commands" at L3, 6, 7, 9, 39, 47, and the whole Commands table. → **command** (purpose.md's own goal for this reader: "find the command... in the command table")

- **the hosting tool** — "(coding) agent" (L3, 17, 29, 33, 71, 116, 124, 128, 132), "editor" (L120, 121), "client" (L99, 112), all for the same referent. Its chat surface alone: "the chat" (L29), "your agent's chat" (L33), "your editor's chat" (L120), "VS Code's chat" (L121). → **coding tool**; **your coding tool's chat**

- **the record `/capture` writes** — "a session's decisions and next steps" (L9), "what the session did, decided and left open" (L94), "the last saved session" (L95), "a decision log" (L112), "session notes and logs" (L124). Read together these name one artifact five ways. → **session log**

- **the `/zero-defect` rule set** — "eight precision rules" (L71), "the `/zero-defect` rules" (L122), "the Zero-Defect rules" (L124). → **the eight precision rules**

- **two of the five scored/reference topics** — "architecture" (L47) vs. "agent architecture" (L116); "safety" (L47) vs. "guardrails" (L5, L116) vs. "safeguards" (L92). Three of the five scored areas already match the seven reference-guide names verbatim (prompts, context, tools); these two don't. → **architecture**; **guardrails** (the forms already used twice)

- **the MCP config block** — "your client's configuration" (L99) vs. "your MCP config" (L124), same JSON block. → **your MCP config**

Scope note: excluded from the above — "logs" at L67/68 (reader's own app's logs) vs. Maestro's own logs at L112/121/124 read as different things in context each time, not a same-thing-two-names case; "resources" (L112) and "prompt"-as-MCP-primitive are protocol-mandated terms the writer has no real substitute for, so only the "prompt" misparse risk (item 1 above) was kept, not a rename demand.
