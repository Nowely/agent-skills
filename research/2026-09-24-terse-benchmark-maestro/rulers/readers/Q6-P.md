reader Q6-P: answered

The extension writes skill files and an MCP server entry each time it activates, at editor startup with a folder open. Zero-defect files are written when zero-defect mode is toggled on.

Section heading: “Files the extension writes”

“Each time it activates, which is at editor startup with a folder open, the extension writes into the first workspace folder:”

“- `SKILL.md` for all 25 skills in `.agents/skills/`, `.claude/skills/`, `.cursor/skills/`, `.gemini/skills/`, `.codex/skills/`, `.kiro/skills/`, `.trae/skills/`, `.trae-cn/skills/`, `.opencode/skills/`, and `.pi/skills/`, replacing earlier copies and any edits to them.”

“- A `maestro-workflow-mcp` server entry (`npx -y maestro-workflow-mcp@latest`) in each of `.vscode/mcp.json`, `.claude/mcp.json`, and `.agents/mcp.json` that exists, parses as JSON, and lacks the entry.”

“Toggling zero-defect mode on appends a marked block to `CLAUDE.md` (and to `.cursorrules` in Cursor), creating the file if needed.”

More than one section was needed: No, one section was sufficient.
