<p align="center">
  <img src="assets/banner.png" alt="Maestro" width="720">
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/maestro-workflow-mcp"><img src="https://img.shields.io/npm/v/maestro-workflow-mcp?label=MCP%20server" alt="MCP server on npm"></a>
  <a href="https://marketplace.visualstudio.com/items?itemName=sharpdeveye.maestro-workflow"><img src="https://img.shields.io/visual-studio-marketplace/v/sharpdeveye.maestro-workflow?label=VS%20Code" alt="VS Code Marketplace"></a>
  <a href="https://open-vsx.org/extension/sharpdeveye/maestro-workflow"><img src="https://img.shields.io/open-vsx/v/sharpdeveye/maestro-workflow?label=Open%20VSX" alt="Open VSX"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-green" alt="MIT license"></a>
</p>

# Maestro

Maestro is a set of agent skills for designing, auditing, and hardening AI agent workflows: the prompts, context, tools, agents, evaluation, retrieval, and guardrails of an LLM application. It gives your coding agent 24 slash commands, such as `/diagnose`, `/fortify`, and `/compose`. Each command is a Markdown instruction set that the agent carries out on your project — what to check, what to change, how to report, and which command to run next. All commands build on one core skill, `agent-workflow`, and its seven reference documents.

Maestro ships in three forms, all generated from the skills in [`source/skills/`](source/skills):

| Form | What you get |
|---|---|
| **Skill files** | 25 `SKILL.md` folders for agents that load skills: Claude Code, Codex, Cursor, Gemini CLI, Kiro, Trae, OpenCode, Pi, and others that read `.agents/skills/`. |
| **MCP server** [`maestro-workflow-mcp`](https://www.npmjs.com/package/maestro-workflow-mcp) | The commands as MCP prompts, the references as resources, and tools for decision and audit logs and staged "wave" runs. |
| **VS Code extension** [`sharpdeveye.maestro-workflow`](https://marketplace.visualstudio.com/items?itemName=sharpdeveye.maestro-workflow) | A command sidebar, an `@maestro` chat participant, and zero-defect mode. It also writes the skill files and an MCP server entry into your workspace. |

## Quick start

1. Install the skills into your project with the [`skills`](https://www.npmjs.com/package/skills) CLI. It installs into the skills folders of the agents you choose; `-g` installs for your user instead of the project.

   ```bash
   npx skills add sharpdeveye/maestro
   ```

   To install by hand, copy the folders in `source/skills/` into your agent's skills directory, for example `.claude/skills/` for Claude Code.

2. Run `/teach-maestro` once per project. The agent interviews you about your models, workflow architecture, evaluation, constraints, and priorities, and saves the answers as `.maestro.md` in the project root. Every other command reads this file first and sends you to `/teach-maestro` if it is missing.

3. Run `/diagnose`. It scores the workflow on five dimensions, lists the critical findings, and names the command that fixes each gap. The sequence it suggests for general improvement is `/fortify` → `/streamline` → `/refine`.

Every command takes an optional argument that narrows it, such as `/fortify the payment webhook handler` or `/specialize legal`. To carry work across sessions, end a session with `/capture` and start the next one with `/recap`.

Using an MCP client or VS Code instead? See [MCP server](#mcp-server) or [VS Code extension](#vs-code-extension).

## Commands

### Analysis

| Command | What it does |
|---|---|
| `/diagnose` | Scores prompt quality, context efficiency, tool health, architecture fitness, and safety and reliability from 1 to 5, and maps each gap to a command. |
| `/evaluate` | Runs the workflow through happy-path, edge, error, stress, and adversarial scenarios and grades the results. |
| `/reflect` | Builds a scorecard from the logs in `.maestro/`: usage, completion rate, common command sequences, cost, and duration. |

### Fix and improve

| Command | What it does |
|---|---|
| `/refine` | Final pass before shipping: prompt structure, output schemas, tool descriptions, error messages, logging, and configuration. |
| `/streamline` | Cuts pipeline steps, merges overlapping tools, and simplifies prompts and configuration. |
| `/calibrate` | Aligns naming, prompt style, error handling, and logging across the workflow. |
| `/fortify` | Adds input validation, retries with backoff, fallback responses, circuit breakers, and timeouts. |
| `/zero-defect` | Holds the agent itself to eight precision rules and a pre-commit checklist for the rest of the session. |

### Enhancement

| Command | What it does |
|---|---|
| `/amplify` | Makes a working workflow handle harder cases through better prompts, tools, context, or models. |
| `/chain` | Designs sequential, parallel, conditional, or iterative tool chains with explicit data flow and error handling. |
| `/compose` | Designs a multi-agent system (topology, handoffs, supervisor), but only after a single agent has demonstrably fallen short. |
| `/enrich` | Grounds the workflow in knowledge sources: RAG pipelines, structured data, and real-time data. |
| `/guard` | Adds defenses against prompt injection, PII leakage, runaway cost, unauthorized actions, and hallucination. |
| `/iterate` | Sets up quality criteria, evaluators, self-correction loops, and regression detection. |
| `/accelerate` | Cuts latency, cost, and token use with caching, model cascading, parallelization, and leaner context, measured before and after. |
| `/turbocharge` | Proposes, then builds, advanced techniques such as parallel orchestration, streaming pipelines, and adaptive routing. |
| `/temper` | Removes over-engineering: unneeded agents, premature abstractions, and configuration nobody changes. |

### Utility

| Command | What it does |
|---|---|
| `/teach-maestro` | Interviews you and writes the project context file `.maestro.md`. |
| `/onboard-agent` | Sets up a new agent workflow, from conventions to a first verified agent, or adds an agent to an existing system. |
| `/adapt-workflow` | Ports a workflow to another provider, model tier, deployment environment, or team. |
| `/specialize` | Adds domain terminology, evaluation criteria, and guardrails for a field such as law, medicine, or finance. |
| `/extract-pattern` | Turns a solution that works into a documented, reusable pattern. |
| `/capture` | Saves the session's commands, decisions, changed files, open issues, and next steps to `.maestro/sessions/`. |
| `/recap` | Summarizes the last captured session and the latest decisions, leading with what to do next. |

### The core skill

`agent-workflow` is not a command; every command loads it first. It sets the context protocol (read the project context file and the last five decisions, or else ask for the model, task, and priorities), five design principles, do and don't rules for seven areas, and a ten-point "workflow slop test" that maps each symptom to a command. Its [reference documents](source/skills/agent-workflow/reference) cover prompt engineering, context management, tool orchestration, agent architecture, feedback loops, knowledge systems, and guardrails and safety.

## Project files

Maestro keeps its state in your project:

| Path | Written by | Read by |
|---|---|---|
| `.maestro.md` or `.maestro/context.md` | `/teach-maestro` (writes `.maestro.md`) | every command; `.maestro/context.md` wins if both exist |
| `.maestro/decisions.jsonl` | `/capture`, the extension after each `@maestro` command, the MCP tool `maestro_write_decision` | the core skill, `/recap`, `/reflect`, the MCP tool `maestro_read_decisions` |
| `.maestro/audit.jsonl` | the extension after each `@maestro` command | `/reflect`, the MCP tool `maestro_read_audit` |
| `.maestro/sessions/*.md` | `/capture` | `/recap` |

When the extension or the MCP server first writes a log entry, it also creates `.maestro/.gitignore`, which keeps the logs and sessions out of version control and leaves `context.md` tracked. Token counts in the logs are estimated as characters ÷ 3.7, and the extension prices them at a flat $2 per million input tokens and $8 per million output tokens, so the costs `/reflect` reports are rough estimates.

## MCP server

`maestro-workflow-mcp` needs Node.js 20 or later and talks stdio by default.

Claude Code:

```bash
claude mcp add maestro -- npx -y maestro-workflow-mcp
```

Claude Desktop (`claude_desktop_config.json`) or Cursor (`.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "maestro": { "command": "npx", "args": ["-y", "maestro-workflow-mcp"] }
  }
}
```

VS Code (`.vscode/mcp.json`):

```json
{
  "servers": {
    "maestro": { "type": "stdio", "command": "npx", "args": ["-y", "maestro-workflow-mcp"] }
  }
}
```

To serve Streamable HTTP instead of stdio:

```bash
npx -y maestro-workflow-mcp --http --port 3001
```

Clients connect to `http://<host>:3001/mcp`, and `GET /health` returns the server name and version; without `--port` the port is 3001. The HTTP endpoint has no authentication, and the tools that take a `projectPath` read and write files on the machine running the server.

The server exposes:

- **24 prompts**, one per command, each with an optional `focus` argument.
- **8 resources**: `maestro://skill/agent-workflow`, and `maestro://reference/<name>` for each of the seven references.
- **10 tools**:

| Tool | What it does |
|---|---|
| `maestro_list_commands` | Lists the commands by category. |
| `maestro_run_command` | Returns a command's full instructions. Given `projectPath` (and optionally `activeFile`), it prepends the matching sections of the project context file. |
| `maestro_read_context` | Returns the project context file, cut down to the sections relevant to `skill` and `activeFile` when those are given. |
| `maestro_init` | Returns a context-file template for the agent to save. It writes nothing itself. |
| `maestro_wave_start`, `maestro_wave_advance`, `maestro_wave_status` | Run a command as a staged wave; see below. |
| `maestro_write_decision` | Appends an entry to `.maestro/decisions.jsonl`. |
| `maestro_read_decisions` | Returns the latest decisions, 20 by default. |
| `maestro_read_audit` | Returns the latest audit entries, 50 by default, with total cost and average duration. |

### Waves

Six commands can run in stages, one phase at a time, with each phase's output carried into the next:

| Commands | Phases |
|---|---|
| `/compose`, `/chain` | map → validate → scaffold → test |
| `/fortify`, `/refine` | audit → validate → apply → verify |
| `/diagnose`, `/evaluate` | map → validate → report |

After each phase a quick heuristic check (length, headings, code blocks, pass/fail wording) hands its issues and suggestions to the next phase; it never stops a wave. Over MCP the client drives: `maestro_wave_start` returns the first phase's instructions, and each `maestro_wave_advance` call submits a phase's output and returns the next phase. The server keeps waves in memory, so a restart loses them. In the VS Code extension, `@maestro` runs these six commands as waves by itself.

## VS Code extension

Install **Maestro — AI Workflow Fluency** from the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=sharpdeveye.maestro-workflow) or [Open VSX](https://open-vsx.org/extension/sharpdeveye/maestro-workflow). It needs VS Code 1.95 or later, or a compatible editor such as Cursor, Windsurf, or Antigravity.

- **Command Center.** The Maestro view in the activity bar lists the commands by category. Clicking one sends it to the editor's AI chat: as `@maestro /<command>` in VS Code, and as a plain `/<command>` in Cursor and Antigravity, whose own agent runs it from the installed skill files. `Maestro: Quick Pick` in the Command Palette does the same, recent commands first.
- **`@maestro` chat participant.** In VS Code chat, `@maestro /fortify the webhook handler` sends the skill and your request to the first chat model the editor lists, not the one picked in the chat's model menu. If a context file exists, it adds the sections that match the command and the active file, and a list of the files the active file imports or is imported by. Wave commands stream phase by phase, and every command run is logged to `.maestro/`.
- **Zero-defect mode.** Toggle it from the sidebar header or with `Maestro: Toggle Zero-Defect Mode`; while it is on, the status bar reads `Maestro · Zero-Defect`. `@maestro` then prepends the eight precision rules to every request, and the extension writes them into `CLAUDE.md`, and into `.cursorrules` in Cursor or `.agents/rules/maestro-zero-defect.md` in Antigravity, so the editor's own agent follows them too.
- **Context status.** The sidebar shows whether a context file exists and offers to run `/teach-maestro`.

| Setting | Default | Effect |
|---|---|---|
| `maestro.editorAdapter` | `auto` | How commands reach the chat: `vscode`, `cursor`, `antigravity`, or `claude-code`. `auto` detects Cursor and Antigravity by application name and treats every other editor as VS Code. |
| `maestro.zeroDefectAutoInject` | `false` | Not read by the extension; zero-defect mode follows the toggle alone. |

### Files the extension writes

Each time it activates, which is at editor startup with a folder open, the extension writes into the first workspace folder:

- `SKILL.md` for all 25 skills in `.agents/skills/`, `.claude/skills/`, `.cursor/skills/`, `.gemini/skills/`, `.codex/skills/`, `.kiro/skills/`, `.trae/skills/`, `.trae-cn/skills/`, `.opencode/skills/`, and `.pi/skills/`, replacing earlier copies and any edits to them.
- A `maestro-workflow-mcp` server entry (`npx -y maestro-workflow-mcp@latest`) in each of `.vscode/mcp.json`, `.claude/mcp.json`, and `.agents/mcp.json` that exists, parses as JSON, and lacks the entry. If no file gains the entry, the extension writes `.vscode/mcp.json` from scratch with Maestro as its only server. That happens when none of the files exists, but also on every startup after the first and whenever `.vscode/mcp.json` contains comments; any other servers in that file are then lost.

Toggling zero-defect mode on appends a marked block to `CLAUDE.md` (and to `.cursorrules` in Cursor), creating the file if needed. Toggling it off removes the block, except when the block is all the file contains, as it is in a file the toggle created. In Antigravity the rule file stays and switches between `trigger: always_on` and `trigger: manual`.

## Repository layout

```text
source/skills/              the 25 skills; every other form is built from here
  agent-workflow/reference/ the seven reference documents
scripts/                    build.js, validate.js, and bundle-skills.js (for the MCP server)
mcp-server/                 the MCP server, published to npm as maestro-workflow-mcp
maestro-extension/          the VS Code extension; webview-ui/ is its React sidebar
packages/core/              @maestro/core: context slicing, token and cost estimates, decision and audit logs
assets/                     banner and logo
skills-lock.json            lock file written by the skills CLI
```

## Development

Change skills only in `source/skills/`. A skill is a folder with a `SKILL.md` whose frontmatter sets `name`, `description`, `category` (`analysis`, `fix`, `enhancement`, `utility`, or `core`), `version`, `user-invocable`, and `argument-hint`.

The root scripts need only Node.js:

```bash
npm run check   # validate every SKILL.md in source/skills
npm run build   # copy source/skills into the ten provider directories (.agents/, .claude/, …), which git ignores
```

`npm run check` fails when a skill lacks `name` or `description`, links a missing `reference/` file, or contains `impeccable`, `frontend-design`, `pbakaus`, or `anthropic` in any letter case (an originality guard; see [NOTICE.md](NOTICE.md)). It warns when a command lacks `user-invocable: true`.

Build the shared library before the MCP server, which bundles `@maestro/core` from `packages/core/dist`:

```bash
cd packages/core
npm install && npm run build
npm test                      # vitest

cd ../../mcp-server
npm install && npm run build  # bundles the skills, then builds dist/index.js
npm start                     # stdio; npm run start:http serves HTTP on port 3001
```

The extension compiles the library from source, so it needs no separate step:

```bash
cd maestro-extension
npm install
cd webview-ui && npm install && cd ..
npm run build     # bundle the skills, build the extension and the sidebar
npm run package   # produce a .vsix
npm run dev       # rebuild on change
```

CI builds a `.vsix` for pushes and pull requests to `main` that touch `maestro-extension/`. Pushing a tag `ext-v*` also publishes the extension to Open VSX, and pushing `mcp-v*` publishes the MCP server to npm. `npm run publish` in `maestro-extension/` publishes to the VS Code Marketplace.

## License

MIT © 2026 sharpdeveye. See [LICENSE](LICENSE) and [NOTICE.md](NOTICE.md).

[Website](https://maestroskills.dev) · [Changelog](CHANGELOG.md) · [Extension README](maestro-extension/README.md) · [MCP server README](mcp-server/README.md)
