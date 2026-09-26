![Maestro — AI Workflow Fluency](assets/banner.png)

[![VS Code Marketplace](https://img.shields.io/visual-studio-marketplace/v/sharpdeveye.maestro-workflow?label=VS%20Code%20Marketplace&color=007ACC)](https://marketplace.visualstudio.com/items?itemName=sharpdeveye.maestro-workflow) [![Open VSX](https://img.shields.io/open-vsx/v/sharpdeveye/maestro-workflow?label=Open%20VSX&color=A60EE5)](https://open-vsx.org/extension/sharpdeveye/maestro-workflow) [![npm](https://img.shields.io/npm/v/maestro-workflow-mcp?label=npm&color=CB3837)](https://www.npmjs.com/package/maestro-workflow-mcp)

# Maestro

Workflow fluency for AI coding agents.

Maestro gives your coding agent — Claude Code, Cursor, Gemini CLI, Codex, Kiro, Trae, OpenCode, Pi, Antigravity, or VS Code's own chat — commands for the AI workflow you're building: its prompts, context, tools, agents, retrieval, evaluation and guardrails. The commands diagnose it, fix and improve it, or extend it, and Maestro carries a record of your sessions into the next one (see [Memory across sessions](#memory-across-sessions)).

25 skills: one core skill, `agent-workflow` — shared principles you never run directly — plus 24 commands you run by name, and 7 reference files the core skill reads when it needs them.

[Install](#getting-started) · [Commands](#commands) · [Contribute](#support-and-contributing)

## Getting started

Maestro reaches your coding agent by one of three routes: **skill files**, plain folders your coding agent loads from its skills folder; the **VS Code extension**; or an **MCP server**, a small program your MCP client — your coding agent, or an app such as Claude Desktop — starts on your machine. If you haven't picked one, start with skill files.

| Route | Works in | Needs | Writes into your project |
|---|---|---|---|
| [Skill files](#skill-files) | Claude Code, Cursor, Gemini CLI, Codex, Kiro, Trae, OpenCode, Pi, Antigravity | `npx`, or this repository's files | The skill folders, into a skills folder of the project; `npx skills` also writes `skills-lock.json` |
| [VS Code extension](#vs-code-extension) | VS Code, and its forks Cursor, Antigravity, Windsurf | VS Code 1.95 or later | At every start: each skill's `SKILL.md`, into the ten skills folders. Also an MCP server entry; Zero-Defect's block in `CLAUDE.md`, when switched on; and `.maestro/`, with the decision log and command log (`audit.jsonl`) |
| [MCP server](#mcp-server) | Any MCP client | Node 20 or later | No skill files — it serves them on request |

### Skill files

Run this in the root of the project you work in:

```bash
npx skills add sharpdeveye/maestro
```

`npx skills` is a separate installer, not part of Maestro; it installs the skills into this project, chooses your coding agent's folders itself, and writes `skills-lock.json` there. Install all 25 — every command except `/teach-maestro` loads the core skill first.

If your coding agent is not one `npx skills` covers, copy the skill folders from `source/skills/` into its skills folder in the project yourself:

`.agents/skills/` (Antigravity) · `.claude/skills/` (Claude Code) · `.cursor/skills/` (Cursor) · `.gemini/skills/` (Gemini CLI) · `.codex/skills/` (Codex) · `.kiro/skills/` (Kiro) · `.trae/skills/` and `.trae-cn/skills/` (Trae) · `.opencode/skills/` (OpenCode) · `.pi/skills/` (Pi)

In your coding agent's chat:

```text
/teach-maestro
/diagnose
```

See [First run](#first-run) for what these two give you.

### VS Code extension

Install the extension `sharpdeveye.maestro-workflow` from your editor's Extensions view. VS Code gets it from the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=sharpdeveye.maestro-workflow); Cursor, Windsurf and Antigravity get it from [Open VSX](https://open-vsx.org/extension/sharpdeveye/maestro-workflow), the open registry VS Code forks install from.

**What it writes into your project, without asking:**

- **Each skill's `SKILL.md`** — and only that file — into the ten skills folders of the first folder in your workspace, rewritten at every start; edits to those copies are lost.
- **An MCP server entry** in the workspace's MCP config, so your coding agent can also reach the skills through the MCP server.
- **Zero-Defect mode's rules**, when you switch it on: a marked block of 8 precision rules in `CLAUDE.md`, created if missing; also `.cursorrules` in Cursor, and `.agents/rules/maestro-zero-defect.md` in Antigravity.
- **`.maestro/`**: `@maestro` commands write to its decision log and command log (`audit.jsonl`); the folder's own `.gitignore` is headed "Maestro session data — opt-in to version control," and `.maestro/context.md` stays versioned.

Use it from the Command Center sidebar, from the command palette ("Maestro: Teach — Generate .maestro.md" and "Maestro: Diagnose — Workflow quality audit"), or in VS Code's chat:

```text
@maestro /teach-maestro
@maestro /diagnose
```

See [First run](#first-run) for what these two give you.

### MCP server

Add this block to your MCP client's configuration — `claude_desktop_config.json` for Claude Desktop, `.cursor/mcp.json` for Cursor:

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

For VS Code's `servers` form (also used by Antigravity), the other clients, and HTTP, see [`mcp-server/README.md`](mcp-server/README.md).

The server serves the skills on request; unlike the other two routes, it installs none of them into your project. A wave — one command run in checked phases — is held only by the running server, and a restart loses it.

Pick `teach-maestro` and `diagnose` from your client's prompt menu, or ask your coding agent for them by name. See [First run](#first-run) for what these two give you.

### First run

Every command needs `.maestro.md` in place first — except this one.

1. **`/teach-maestro`**, once per project: asks your coding agent to interview you about the project and save the answers as `.maestro.md` in its root; if `.maestro/context.md` already exists, that is read first instead.
2. **`/diagnose`**: a report on your AI workflow — five dimensions, each scored 1–5; an overall score out of 25; a [Maestro command](#commands) to run for each gap.

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

These are your own sessions, with your coding agent — kept in the `.maestro/` folder of your project.

1. **`/capture`**, at the end of a session — saves a session summary to `.maestro/sessions/` and appends an entry to the decision log (`decisions.jsonl`).
2. **`/recap`**, at the start of the next one — reads back the latest summary and the last five decisions.
3. **`/reflect`** — scores Maestro's own commands from those logs: usage, completion rate, ~cost, and duration.

Only the extension writes the command log (`audit.jsonl`): its lines come from commands run through `@maestro` in VS Code's chat, each with the command's duration, ~tokens and ~cost.

Costs and token counts are estimates (~): costs are useful for trends, not for invoicing; token counts are for the context budget, not for billing.

## Documentation

- [maestroskills.dev](https://maestroskills.dev) — Interactive showcase and documentation
- [Extension](maestro-extension/README.md) — its sidebar, command palette, and settings
- [MCP server](mcp-server/README.md) — each client's settings, HTTP, and everything the server offers
- [Changelog](CHANGELOG.md) — what changed in each version

## Support and contributing

Stuck? Check the [issues](https://github.com/sharpdeveye/maestro/issues).

To contribute: `source/skills/` is the only place to edit. After a change, run `npm run check`, then `npm run build`, which copies the skills into the ten skills folders of this clone so you can try the change there with a coding agent — it installs into no other project.

## License

Licensed under [MIT](LICENSE).
