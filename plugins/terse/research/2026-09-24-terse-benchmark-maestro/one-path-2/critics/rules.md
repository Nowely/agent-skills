<!-- rules; 10.3 min; 11 tool uses -->

Checked /var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/terse-bench-D2/writer/01-draft.md against every rule in /var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/terse-bench-D2/in/rules.md (First section plus rules 1–23). Breaks only:

**First: a pleasant read** — compromised by the rule 12 break below: the draft explains the same mechanism twice, which reads as restatement rather than a single clean pass.

**Rule 2 — Write for the reader's actual experience** (don't assume unexplained internals). Line 59, in the Commands table: `| \`/reflect\` | Shows which commands you run, finish or abandon | You run commands through the extension's \`@maestro\` in VS Code |` uses `` `@maestro` `` with no gloss. It is only explained one full section later, at line 121: `- **\`@maestro\` in VS Code's chat**, which runs a command on the editor's chat model...`. A reader hits the term 62 lines before its meaning.

**Rule 6 — The opening sells; no failure modes.** Line 5: `- **Made for LLM work.** It targets what breaks in AI systems: unstructured prompts, overstuffed context, too many tools, no evaluation, no guardrails.` This bullet is inside "the opening" (rule 5 defines the advantages list as part of the opening), and it lists five failure modes there — exactly what rule 6 bars ("no failure modes").

**Rule 12 — Technical detail lives in one section below the middle.** The Quick Start/Install and First-run text restates, almost verbatim, facts that "How it works" gives again:
- Line 29: "Each time you open a project, the extension writes Maestro's skills into it for every supported agent. Its sidebar sends any command to the chat in one click." — duplicated at line 120 ("**A sidebar** that sends any command to your editor's chat.") and line 124 ("The extension also writes the skills into each agent's folder...").
- Line 39: "The other commands read this file first." — duplicated at line 116: "All but `/teach-maestro` first load `agent-workflow`, the core skill, and read your `.maestro.md`."
Mechanism detail is spread across an early section instead of living only in How it works.

**Rule 13 — The order follows the genre, and a departure says why.** Named order: "What it is, Quick start, the inventory, how it works." Actual heading order: `## Quick start`(13) → `## Commands`(49, the inventory) → `## MCP server`(97) → `## How it works`(114) → `## Contributing`(126). "MCP server" is inserted between the inventory and How it works, and nowhere does the text say why (checked: no "because"/narrative sentence anywhere in the document).

**Rule 20 — Every claim is true of the code; guarantee words are shown or narrowed.** Line 8 names exactly nine agents receiving "Skills": "Claude Code, Cursor, Codex, Gemini CLI, Kiro, Trae, OpenCode, Pi and Antigravity" (VS Code is named separately as getting "an extension," not skills). But line 124 says the extension writes skills into "`.claude/skills/`, `.cursor/skills/` and eight more" (=10), and line 132 says "copy the skills into the ten agent folders" (=10). No tenth agent is named anywhere in the document, so the two counts (9 named vs. 10 claimed) don't reconcile from the text itself.

Rules checked and holding, not included above per "return only the breaks": 1, 3, 4, 5, 7, 8, 9, 10, 11, 14, 15, 16, 17, 18, 19, 21, 22, 23.

Note: per your constraints I did not fetch or open the real sharpdeveye/maestro repo, maestroskills.dev, or any of the listed off-limits paths — verification above is entirely internal (line-to-line textual evidence within the draft and rules.md, confirmed with grep), so rules 17/18/20/23 were checked only for internal self-consistency, not against ground truth.
