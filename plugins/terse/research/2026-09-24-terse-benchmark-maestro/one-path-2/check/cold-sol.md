<!-- Codex Sol; 33 s; 28299 tokens; commands: /bin/zsh -lc 'cat /var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/readme-review -->

Overall: High-quality, well-structured README with a clear purpose, fast onboarding, comprehensive command reference, and useful implementation details. Its main weakness is that several production-readiness claims are asserted rather than demonstrated.

Strengths

1. The opening quickly explains the product, audience, and scope.
Quote: “**Maestro** helps you build LLM apps and agents that hold up in production. It gives your coding tool 24 slash commands.”

2. The key benefits are concrete and task-oriented rather than generic.
Quote: “**From finding to fix.** `/diagnose` maps the problems it finds to the commands that fix them.”

3. Installation is short and immediately actionable.
Quote: “Run this from your project's root:”
Quote: “npx skills add sharpdeveye/maestro”

4. The first-run workflow gives readers a clear sequence and explains persisted configuration.
Quote: “It asks about your models, workflow, quality checks, constraints and priorities. Then it saves your answers to `.maestro.md` in your project. The other commands read this file first.”

5. The README tells users what to do after diagnosis instead of leaving them with unexplained results.
Quote: “It scores five areas from 1 to 5, lists the most serious findings and names the commands to run. Start with the one for your lowest score.”

6. The command tables are easy to scan because they explain both behavior and appropriate timing.
Quote: “| Command | What it does | Use it when |”

7. The commands use specific descriptions that help distinguish similar capabilities.
Quote: “| `/streamline` | Cuts duplicate steps, overlapping tools and instructions the model follows anyway | Redundant parts have piled up |”
Quote: “| `/temper` | Removes over-engineering: needless agents, premature optimization, one-implementation abstractions | Your app is built for needs it doesn't have |”

8. Support beyond the editor extension is documented with a complete MCP configuration example.
Quote: “Other AI clients can run Maestro as an MCP server. Add it to your client's MCP config:”

9. The architecture is explained in accessible language.
Quote: “Each command is a skill: a Markdown file of instructions your coding tool follows.”

10. Files written into the user’s project are disclosed clearly.
Quote: “What gets written to your project: `.maestro.md` from `/teach-maestro`, session notes and logs in `.maestro/`, and with the extension, the command files for each coding tool and its server in `.vscode/mcp.json`.”

Weaknesses

1. The main production-quality promise is broad and is not supported here by an example, benchmark, or sample result.
Quote: “**Maestro** helps you build LLM apps and agents that hold up in production.”

2. The command-file installation does not state prerequisites such as the required Node.js/npm version.
Quote: “```bash
npx skills add sharpdeveye/maestro
```”

3. The extension instructions are slightly ambiguous: one command is presented for three editors, followed by a note that two obtain it from a different marketplace.
Quote: “**VS Code extension** for VS Code, Cursor and Antigravity:”
Quote: “Cursor and Antigravity get it from Open VSX.”

4. Automatic project modification is disclosed, but this README does not explain how to disable, remove, or reverse those generated files.
Quote: “Each time you open a project, the extension writes Maestro's command files into it for every supported coding tool.”

5. The MCP section sends readers elsewhere for the complete tool list and remote-server setup, making that part less self-contained.
Quote: “The [npm page](https://www.npmjs.com/package/maestro-workflow-mcp) lists every tool and the HTTP mode for remote clients.”

6. The contributing guidance is very brief and covers validation/building but not tests, style expectations, or the contribution process.
Quote: “Edit skills only in `source/skills/`. The other copies are built from it.”
Quote: “npm run check   # validate every SKILL.md”
Quote: “npm run build   # copy the skills into each coding tool's folder”
