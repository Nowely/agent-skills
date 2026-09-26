![Maestro — AI Workflow Fluency](assets/banner.svg)

[![VS Code Marketplace](https://img.shields.io/visual-studio-marketplace/v/sharpdeveye.maestro-workflow?label=VS%20Code%20Marketplace)](https://marketplace.visualstudio.com/items?itemName=sharpdeveye.maestro-workflow) [![Open VSX](https://img.shields.io/open-vsx/v/sharpdeveye/maestro-workflow?label=Open%20VSX)](https://open-vsx.org/extension/sharpdeveye/maestro-workflow) [![npm](https://img.shields.io/npm/v/maestro-workflow-mcp?label=npm)](https://www.npmjs.com/package/maestro-workflow-mcp)

# Maestro

Workflow fluency for AI coding agents.

Maestro gives your coding agent commands for the AI workflow you are building: its prompts, context, tools, agents, retrieval, evaluation, and guardrails. The commands diagnose it, fix and improve it, extend it, and [carry a record of your sessions into the next](#memory-across-sessions). Maestro runs in Claude Code, Cursor, Gemini CLI, Codex, Kiro, Trae, OpenCode, Pi, Antigravity, and VS Code's chat.

25 skills: one core skill, `agent-workflow`, which every command loads first and you never run, and 24 commands run by name; plus 7 reference files the core skill reads when needed.

[Install](#getting-started) · [Commands](#commands) · [Contribute](#support-and-contributing)

## Getting started

Choose among skill files—plain folders your coding agent loads from its skills folder—the VS Code extension, or an MCP server, a small program that an MCP client such as your coding agent or Claude Desktop starts on your machine. If you have not chosen, start with skill files.

| Route | Works in | Needs | Writes into your project |
|---|---|---|---|
| [Skill files](#skill-files) | Claude Code, Cursor, Gemini CLI, Codex, Kiro, Trae, OpenCode, Pi, Antigravity | `npx`, or this repository's files | Skill folders; `npx skills` also writes `skills-lock.json` |
| [VS Code extension](#vs-code-extension) | VS Code, Cursor, Antigravity, Windsurf | VS Code 1.95 or later | At every start, each skill's `SKILL.md` in ten skills folders; an MCP server entry; when enabled, Zero-Defect rules in `CLAUDE.md`; `.maestro/` with the decision log and command log (`audit.jsonl`) |
| [MCP server](#mcp-server) | Any MCP client | Node 20 or later | No skill files; it serves them on request |

### Skill files

In a terminal, from the root of the project you work in:

```bash
npx skills add sharpdeveye/maestro
```

`npx skills` is a separate installer for coding-agent skills, not part of Maestro. Install the complete set into the project: the installer chooses the skills folders and writes `skills-lock.json`, and every command needs the core skill.

If the installer does not cover your coding agent, copy the folders from `source/skills/` into its project skills folder: `.claude/skills/` for Claude Code; `.cursor/skills/` for Cursor; `.gemini/skills/` for Gemini CLI; `.codex/skills/` for Codex; `.kiro/skills/` for Kiro; `.trae/skills/` and `.trae-cn/skills/` for Trae's global and China editions; `.opencode/skills/` for OpenCode; `.pi/skills/` for Pi; `.agents/skills/` for Antigravity.

Then use the coding agent's chat:

```text
/teach-maestro
/diagnose
```

See [First run](#first-run) for what they produce.

### VS Code extension

Install `sharpdeveye.maestro-workflow` from the editor's Extensions view: VS Code uses the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=sharpdeveye.maestro-workflow); Cursor, Windsurf, and Antigravity use [Open VSX](https://open-vsx.org/extension/sharpdeveye/maestro-workflow), the open registry for VS Code forks.

**What it writes into your project, without asking**

- **Each skill's `SKILL.md`**, and only that file, in the ten skills folders of the first workspace folder. It rewrites them at every start, so edits to those copies are lost.
- **An MCP server entry** in the workspace's MCP config, letting the coding agent reach the skills through the server too.
- **Zero-Defect mode's rules**, when switched on: a marked block of 8 precision rules in `CLAUDE.md`, which is created if missing; also `.cursorrules` in Cursor and `.agents/rules/maestro-zero-defect.md` in Antigravity.
- **`.maestro/`**: a completed or failed `@maestro` run adds a line to the decision log and the command log (`audit.jsonl`); a direct cancellation can return before either line is written. The folder's `.gitignore` says “Maestro session data — opt-in to version control”; `.maestro/context.md` stays versioned.

First use the Command Center sidebar; the command palette entries “Maestro: Teach — Generate .maestro.md” then “Maestro: Diagnose — Workflow quality audit”; or VS Code's chat:

```text
@maestro /teach-maestro
@maestro /diagnose
```

See [First run](#first-run) for the result.

### MCP server

Add this block to the MCP client's configuration—`claude_desktop_config.json` for Claude Desktop or `.cursor/mcp.json` for Cursor:

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

See the [MCP server page](mcp-server/README.md) for VS Code's `servers` form, used by VS Code and Antigravity, other clients, and HTTP mode for hosting one server for others. The server serves skills on request and copies no skill files into the project.

A wave—one command run in checked phases—is held by the running server; restarting it loses the wave. For a first use, choose the `teach-maestro` prompt and then `diagnose` from the client's prompt menu, or ask your coding agent for them by name.

See [First run](#first-run) for the result.

### First run

Every command needs `.maestro.md` first.

1. **`/teach-maestro`**, once per project: Maestro interviews you about the project and saves the answers as `.maestro.md` in its root. If `.maestro/context.md` exists, it is read first.
2. **`/diagnose`**: a report on the AI workflow with five dimensions scored 1–5, an overall score out of 25, and a Maestro command for each gap; find those commands [below](#commands).

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

These are your own sessions with your coding agent; their record is kept in the project's `.maestro/` folder.

1. **`/capture`**, at the end of a session, writes a summary in `.maestro/sessions/` and an entry in the decision log (`decisions.jsonl`).
2. **`/recap`**, at the start of the next, reads the latest summary and the last five decisions.
3. **`/reflect`** scores Maestro's commands from the logs by usage, completion, ~cost, and duration.

After an `@maestro` run completes or fails, the command log (`audit.jsonl`) gets its duration, ~tokens, and ~cost; only the extension writes it, and direct cancellation can return before logging. Costs and token counts are estimates: costs are accurate to ±20% and useful for trends, not invoicing; token counts measure context budgets, not billing.

## Documentation

- [maestroskills.dev](https://maestroskills.dev) — Interactive showcase and documentation
- [Extension page](maestro-extension/README.md) — sidebar, command palette, and settings
- [MCP server page](mcp-server/README.md) — client settings, HTTP mode, and everything the server offers
- [Changelog](CHANGELOG.md) — changes in each version

## Support and contributing

For help, open a [repository issue](https://github.com/sharpdeveye/maestro/issues).

Contributors: edit only `source/skills/`, run `npm run check`, then `npm run build`; the build copies skills into the clone's ten skills folders so you can try the change there with a coding agent, and installs into no other project.

## License

[MIT](LICENSE).
