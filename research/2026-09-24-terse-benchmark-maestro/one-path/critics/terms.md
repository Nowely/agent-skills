# terms.md — draft.md as its reader (in/purpose.md)

Reader (purpose.md #2): builds LLM features/agents/pipelines inside an AI coding tool; knows their tool
and "slash command"; purpose.md states directly "I don't assume they know what an MCP server or a
skills folder is," and they have not picked an install route.

## Words this reader would parse differently from what the text means

- L57 "the agent" (`/zero-defect` row: "Holds the agent to eight precision rules...") — by this point the
  reader has already met "agent" meaning something they build (L7 "one agent really fails"); here it
  means their coding assistant, confirmed only later by L91 ("writes the precision rules into
  `CLAUDE.md`"). Hypothesis. → use "your coding assistant".
- L93 "tools" ("...and ten tools: list and run commands...") — collides with L3's "tools" (the reader's
  own LLM tools, given as their domain vocabulary: "prompts, tools, RAG, multi-agent setups"); here it
  means the MCP server's own ten operations. Hypothesis. → use "operations".
- L37 "the commands arrive as prompts" and L93 "The 24 commands as prompts" — collides with L3's
  "prompts" (the LLM prompt text the reader writes); here it means the MCP prompts primitive, never
  explained. Hypothesis. → use "prompt templates".
- L93 "its references as resources" — unexplained MCP term for content the doc already named:
  "references" at L87. Hypothesis. → use "reference material".
- L93 "read the project context" — collides with L32/L87's "context" (LLM context management, one of the
  five areas `/diagnose` scores); here it means the `.maestro.md` profile. Hypothesis. → use "your
  `.maestro.md` profile".
- L47 "Maestro's logs" (and L93 "read the logs") — the row sits beside `/diagnose`/`/evaluate`, both
  about the reader's own workflow, so "logs" reads as the reader's application logs; it means Maestro's
  own command-usage history. Hypothesis. → use "its own command history".

## Internal names where the reader has a word of their own

- L8 "Skill files" (and L18, L36, L90, L99: "skill(s)", "`SKILL.md`") — purpose.md is explicit: the
  reader knows "slash command", not "a skills folder". 24 of the 25 "skills" are exactly the "24 slash
  commands" already named at L3. Proven (purpose.md's own line). → use "Command files" (reserve "skill"
  for the one non-command item, as L87 already does by calling it "core skill").
- L37 "Any MCP client" / "add a server" / "Setup for each client" — purpose.md is explicit: the reader
  does not know what an MCP server is. Their own word for their tool is L8's "the tool you use". "a
  server" also reads as infrastructure to run, not a one-line config entry. Proven (purpose.md's own
  line) for the unfamiliarity; Hypothesis for the "infrastructure" misreading. → use "your tool" in place
  of "MCP client"; "a local server entry" in place of "a server".
- L87 "`agent-workflow`" — internal package slug; the reader-facing name for the same thing, "the core
  skill", opens the very same sentence. Hypothesis. → drop the slug, keep "the core skill".

## Terms used twice under two names

- L3 "your AI coding agent" / "Your agent", L20 "your agent" vs. L8 "the tool you use" — same referent
  (the IDE/CLI the reader works in), two names, worsened by "agent" also meaning something the reader
  builds elsewhere (L7, L65, L66, L71, L78). Hypothesis. → use "tool" throughout — it matches purpose.md's
  own phrase "AI coding tool" and frees "agent" for what the reader builds.
- L92 "checked phases" vs. L93 "phased runs" — same sequenced-execution mechanism (the extension driving
  `/diagnose` → `/evaluate` → `/fortify` → `/refine` → `/chain` → `/compose`), named twice four lines
  apart, never tied together. Hypothesis. → use "phased runs" in both places.
