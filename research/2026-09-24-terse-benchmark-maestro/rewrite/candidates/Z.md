![Maestro — AI Workflow Fluency](assets/banner.png)

[![VS Code Marketplace](https://img.shields.io/visual-studio-marketplace/v/sharpdeveye.maestro-workflow?label=VS%20Code%20Marketplace)](https://marketplace.visualstudio.com/items?itemName=sharpdeveye.maestro-workflow) [![Open VSX](https://img.shields.io/open-vsx/v/sharpdeveye/maestro-workflow?label=Open%20VSX)](https://open-vsx.org/extension/sharpdeveye/maestro-workflow) [![npm](https://img.shields.io/npm/v/maestro-workflow-mcp?label=npm)](https://www.npmjs.com/package/maestro-workflow-mcp)

# Maestro

Workflow fluency for AI coding agents.

Maestro gives your coding agent commands for the AI workflow you are building: its prompts, context, tools, agents, retrieval, evaluation and guardrails. The commands diagnose it, fix and improve it, and extend it, and Maestro [carries a record of your sessions into the next one](#memory-across-sessions). It runs in Claude Code, Cursor, Gemini CLI, Codex, Kiro, Trae, OpenCode, Pi, Antigravity and VS Code's chat.

25 skills: one core skill, `agent-workflow`, that the commands build on and you never run, and 24 commands you run by name — plus 7 reference files the core skill reads when it needs them.

[Install](#getting-started) · [Commands](#commands) · [Contribute](#support-and-contributing)

## Getting started

Three routes: skill files, plain folders your coding agent loads from its skills folder, such as `.claude/skills/`; the VS Code extension; or an MCP server, a small program your MCP client (your coding agent, or an app like Claude Desktop) starts on your machine. If undecided, start with skill files.

| Route | Works in | Needs | Writes into your project |
|---|---|---|---|
| [Skill files](#skill-files) | Claude Code, Cursor, Gemini CLI, Codex, Kiro, Trae, OpenCode, Pi, Antigravity | `npx`, or this repository's files | Skill folders, into a skills folder; `npx skills` adds `skills-lock.json` |
| [VS Code extension](#vs-code-extension) | VS Code and its forks Cursor, Antigravity, Windsurf | VS Code 1.95 or later | At every start, each skill's `SKILL.md` into ten skills folders; an MCP server entry, replacing `.vscode/mcp.json` at later starts; Zero-Defect's block in `CLAUDE.md`, when on; `.maestro/`: decision log, command log (`audit.jsonl`) |
| [MCP server](#mcp-server) | Any MCP client | Node 20 or later | No skill files: it serves them on request |

### Skill files

Run in your terminal, in the root of the project you work in:

```bash
npx skills add sharpdeveye/maestro
```

`npx skills` is a separate installer, not part of Maestro: it installs into that project, picks the skills folders itself, and writes `skills-lock.json` there. Install all 25: every command but `/teach-maestro` starts by invoking the core skill.

If the installer does not cover your coding agent, copy the folders in this repository's `source/skills/` into its skills folder in your project: `.claude/skills/` (Claude Code), `.cursor/skills/` (Cursor), `.gemini/skills/` (Gemini CLI), `.codex/skills/` (Codex), `.kiro/skills/` (Kiro), `.trae/skills/` and `.trae-cn/skills/` (Trae, global and China editions), `.opencode/skills/` (OpenCode), `.pi/skills/` (Pi), `.agents/skills/` (Antigravity).

Then, in your coding agent's chat, one at a time:

```text
/teach-maestro
/diagnose
```

What they give: [First run](#first-run).

### VS Code extension

Install `sharpdeveye.maestro-workflow` from your editor's Extensions view: VS Code takes it from the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=sharpdeveye.maestro-workflow), and Cursor, Windsurf and Antigravity from [Open VSX](https://open-vsx.org/extension/sharpdeveye/maestro-workflow), the open registry VS Code forks use.

**What it writes into your project, without asking:**

- **Each skill's `SKILL.md`**, and only that file, into the ten skills folders of your workspace's first folder, rewritten at every start, losing edits to those copies.
- **An MCP server entry** in the workspace's MCP config, giving your coding agent the MCP server too. Later starts rewrite `.vscode/mcp.json` to hold only that entry, losing everything else in it.
- **Zero-Defect mode's rules**, when you switch it on: `/zero-defect`'s text, 8 precision rules included, as a marked block in `CLAUDE.md`, created if missing, plus `.cursorrules` in Cursor and `.agents/rules/maestro-zero-defect.md` in Antigravity.
- **`.maestro/`**: a line in the decision log and the command log (`audit.jsonl`) per command run through `@maestro`; its `.gitignore`, headed "Maestro session data — opt-in to version control", leaves `.maestro/context.md` versioned.

Then run `/teach-maestro` and `/diagnose` from the Command Center sidebar, the command palette ("Maestro: Teach — Generate .maestro.md", then "Maestro: Diagnose — Workflow quality audit"), or VS Code's chat:

```text
@maestro /teach-maestro
@maestro /diagnose
```

What they give: [First run](#first-run).

### MCP server

Add this block to your MCP client's configuration, `claude_desktop_config.json` for Claude Desktop or `.cursor/mcp.json` for Cursor:

```json
{
  "mcpServers": {
    "maestro": {
      "command": "npx",
      "args": ["-y", "maestro-workflow-mcp"]
    }
  }
}
```

For VS Code's `servers` form, which VS Code and Antigravity use, and for HTTP mode, which hosts one server for others, see [`mcp-server/README.md`](mcp-server/README.md). The server serves the skills on request and copies none into your project. A wave, one command run in checked phases, is held by the running server; a restart loses it.

Then pick `teach-maestro` and then `diagnose` from your client's prompt menu, one prompt per command, or ask your coding agent for them by name. What they give: [First run](#first-run).

### First run

Every command but `/teach-maestro` needs `.maestro.md` first.

1. **`/teach-maestro`**, once per project: your coding agent interviews you about the project and saves your answers as `.maestro.md` in its root. If `.maestro/context.md` exists, commands read that file instead.
2. **`/diagnose`**: your coding agent's report on your AI workflow — five dimensions, each scored 1–5; an overall score out of 25; and a Maestro command to run for each gap, from [Commands](#commands).

## Commands

| Group | Command | What it does |
|---|---|---|
| Analysis | [`/diagnose`](source/skills/diagnose/SKILL.md) | Systematic workflow quality audit with scored dimensions |
| | [`/evaluate`](source/skills/evaluate/SKILL.md) | Holistic review of workflow interaction quality |
| | [`/reflect`](source/skills/reflect/SKILL.md) | Analyze command history — which skills work, which fail |
| Fix & Improve | [`/refine`](source/skills/refine/SKILL.md) | Final quality pass on prompts, tools, and configuration |
| | [`/streamline`](source/skills/streamline/SKILL.md) | Remove unnecessary complexity, flatten over-engineering |
| | [`/calibrate`](source/skills/calibrate/SKILL.md) | Align workflow components to project conventions |
| | [`/fortify`](source/skills/fortify/SKILL.md) | Add error handling, retries, fallbacks, circuit breakers |
| | [`/zero-defect`](source/skills/zero-defect/SKILL.md) | Activate maximum precision mode — zero mistakes allowed |
| Enhancement | [`/amplify`](source/skills/amplify/SKILL.md) | Boost capabilities with better tools and context |
| | [`/chain`](source/skills/chain/SKILL.md) | Build effective tool chains and pipelines |
| | [`/compose`](source/skills/compose/SKILL.md) | Design multi-agent orchestration and delegation |
| | [`/enrich`](source/skills/enrich/SKILL.md) | Add knowledge sources, RAG, and grounding |
| | [`/guard`](source/skills/guard/SKILL.md) | Add safety constraints and security boundaries |
| | [`/iterate`](source/skills/iterate/SKILL.md) | Set up feedback loops and evaluation cycles |
| | [`/accelerate`](source/skills/accelerate/SKILL.md) | Optimize for speed, reduce latency and cost |
| | [`/turbocharge`](source/skills/turbocharge/SKILL.md) | Push past conventional limits — advanced techniques |
| | [`/temper`](source/skills/temper/SKILL.md) | Reduce over-engineering, simplify overbuilt workflows |
| Utility | [`/teach-maestro`](source/skills/teach-maestro/SKILL.md) | Generate `.maestro.md` for your project |
| | [`/onboard-agent`](source/skills/onboard-agent/SKILL.md) | Set up a new project from scratch |
| | [`/adapt-workflow`](source/skills/adapt-workflow/SKILL.md) | Port to a different AI provider |
| | [`/specialize`](source/skills/specialize/SKILL.md) | Domain-specific expertise (legal, medical, etc.) |
| | [`/extract-pattern`](source/skills/extract-pattern/SKILL.md) | Build reusable templates from working workflows |
| | [`/capture`](source/skills/capture/SKILL.md) | Save a session summary — persist decisions and next steps |
| | [`/recap`](source/skills/recap/SKILL.md) | Quick summary of the last session |

## Memory across sessions

The sessions are yours, with your coding agent; Maestro keeps their record in your project's `.maestro/` folder:

1. **`/capture`**, at the end of a session: a session summary in `.maestro/sessions/` and an entry in the decision log (`decisions.jsonl`).
2. **`/recap`**, at the start of the next: the latest summary and the last five decisions.
3. **`/reflect`**: Maestro's own commands scored from the logs, for usage, completion, ~cost and duration.

The command log (`audit.jsonl`) gets a line for each command run through `@maestro` in VS Code's chat, with its duration, ~tokens and ~cost; only the extension writes it.

Costs and token counts are estimates (~), useful for trends, not invoicing or billing. Maestro rates its price table at ±20%, but prices each `@maestro` run at the table's default rate, whatever the model.

## Documentation

- [maestroskills.dev](https://maestroskills.dev): Interactive showcase and documentation
- [`maestro-extension/README.md`](maestro-extension/README.md): the extension's sidebar, Zero-Defect mode, `@maestro` and settings
- [`mcp-server/README.md`](mcp-server/README.md): client settings, HTTP mode, and everything the server offers
- [`CHANGELOG.md`](CHANGELOG.md): what changed in each version

## Support and contributing

For help, see the repository's [issues](https://github.com/sharpdeveye/maestro/issues).

Edit skills only in `source/skills/`. After an edit, run `npm run check`, then `npm run build`, which copies the skills into the ten skills folders of this clone so you can try the change there with a coding agent; it installs into no other project.

## License

Maestro is released under the [MIT License](LICENSE).
