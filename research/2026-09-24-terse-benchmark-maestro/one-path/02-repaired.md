# Maestro

Maestro helps your AI coding tool audit, fix, harden and speed up the LLM workflows you build: prompts, tools, RAG, multi-agent setups. It works through 24 slash commands.

- **Each command points to the next.** `/diagnose` recommends its fixes as commands to run; `/fortify` then suggests `/evaluate` to test them.
- **It knows your project.** One interview records your models, constraints and priorities, and the other commands tell your coding tool to read them first.
- **It talks you out of over-building.** `/compose` asks whether one agent was tried and failed before it designs several; `/temper` strips what your requirements don't need.
- **It fits the tool you use.** Skills for Claude Code, Cursor, Gemini CLI, Codex, Kiro, Trae, OpenCode, Pi and Antigravity, an extension for VS Code, and a server for apps like Claude Desktop.

## Quick start

For any of the nine coding tools above, run this in your project folder:

```bash
npx skills add sharpdeveye/maestro --skill '*'
```

To update, run the same command again. Then, in your coding tool:

```text
/teach-maestro
```

It interviews you and saves your answers as `.maestro.md`. Run it once per project.

```text
/diagnose
```

It scores prompts, context, tools, architecture and safety from 1 to 5, lists the critical findings and recommends a command for each fix. Start with the one for your lowest score.

**Other routes**

- **VS Code, Cursor, Antigravity:** install the extension from the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=sharpdeveye.maestro-workflow) or [Open VSX](https://open-vsx.org/extension/sharpdeveye/maestro-workflow). It adds a command sidebar and `@maestro` in VS Code's chat, writes the skills into your workspace, and rewrites `.vscode/mcp.json` to hold only its own server.
- **Claude Desktop and other MCP apps:** add a server entry that runs `npx -y maestro-workflow-mcp`. It lists the commands as prompt templates and returns any command's instructions through a tool ([setup](https://www.npmjs.com/package/maestro-workflow-mcp)).

## Commands

### Analysis

| Command | What it does | Use it when |
|---|---|---|
| `/diagnose` | Scores five areas and recommends a command for each fix | You need a baseline or a place to start |
| `/evaluate` | Runs normal, edge, error, stress and adversarial scenarios; grades A–F | You want a review of how it really behaves |
| `/reflect` | Builds a scorecard of the commands you've run from Maestro's command history in `.maestro/` | You want to see which commands pay off |

### Fix & Improve

| Command | What it does | Use it when |
|---|---|---|
| `/refine` | Final pass on prompts, tool descriptions, error messages, logging, config | It works and needs polish before shipping |
| `/streamline` | Cuts steps, tools, prompt text and config that add nothing | It feels too complex or its tools overlap |
| `/calibrate` | Aligns naming, prompt style, error format and logging | Its parts don't follow one convention |
| `/fortify` | Adds input validation, retries with backoff, fallbacks, circuit breakers, timeouts | It fails in production or handles only the happy path |
| `/zero-defect` | Tells your coding tool to follow precision rules and a pre-commit gate for the rest of the session | Mistakes are unacceptable: deploys, security, money |

### Enhancement

| Command | What it does | Use it when |
|---|---|---|
| `/amplify` | Adds capability through better prompts, tools, context or model | It works but misses harder cases |
| `/chain` | Designs sequential, parallel or conditional tool chains with explicit data flow | A task needs several tools |
| `/compose` | Designs agents, handoffs and a supervisor, after asking whether one agent was tried and failed | A single agent can't do the job |
| `/enrich` | Adds RAG, structured and real-time data, with source attribution | The model needs facts it wasn't trained on |
| `/guard` | Adds input, output, cost and permission guards | Before production, or with sensitive data |
| `/iterate` | Sets quality criteria, evaluators, correction loops and regression checks | It should correct itself and improve over time |
| `/accelerate` | Cuts latency, cost and tokens: shorter prompts, model cascading, caching, parallel calls | It's too slow or too expensive |
| `/turbocharge` | Proposes two or three advanced directions and builds the one you pick | It works and you want to push it further |
| `/temper` | Removes agents, abstractions and configuration you don't need | It's more complex than its requirements |

### Utility

| Command | What it does | Use it when |
|---|---|---|
| `/teach-maestro` | Interviews you and saves `.maestro.md` | First, once per project |
| `/onboard-agent` | Sets conventions, folder structure and a first agent with a golden test | Starting from scratch or adding an agent |
| `/adapt-workflow` | Ports a working workflow to another provider, model tier or environment | You're changing provider or deployment |
| `/specialize` | Adds a domain's terminology, regulations, evaluation and guardrails | The workflow serves one industry |
| `/extract-pattern` | Turns a working solution into a reusable template | Something worked and you'll need it again |
| `/capture` | Saves commands run, decisions, changed files and next steps | At the end of a session |
| `/recap` | Summarizes the last saved session and what to do next | At the start of the next one |

## How it works

- **One core skill.** `agent-workflow` holds the principles, a checklist of common workflow flaws and seven reference guides. Every command but `/teach-maestro` starts by telling your coding tool to load it and read `.maestro.md`.
- **What the skills write.** `/teach-maestro` writes `.maestro.md` and `/calibrate` adds your conventions to it; `/capture` adds a session summary and a decision-log entry under `.maestro/`.
- **The extension.**
  - On every start it writes the 25 `SKILL.md` files into the skill folders of ten coding tools and adds its MCP server to whichever of `.vscode/mcp.json`, `.claude/mcp.json` and `.agents/mcp.json` lack it. On a start where it adds it nowhere, normally every start after the first, it rewrites `.vscode/mcp.json` with that server alone.
  - Its sidebar switches Zero-Defect mode. Turning it on writes the precision rules into `CLAUDE.md`, and also into `.cursorrules` in Cursor or a rule file in Antigravity.
  - In VS Code the sidebar sends each command to `@maestro`, which gives the model no tools and no earlier turns: each command gets one reply that prints plans and files instead of applying them.
  - `@maestro` sends the command without the core skill but with the parts of `.maestro.md` that match it, runs six of the commands in checked phases, adds the precision rules while Zero-Defect is on, and keeps an audit log and a decision log in `.maestro/`.
- **The MCP server.** It lists the commands as prompt templates, offers the core skill and its references as documents to read, and has ten tools, listed on [npm](https://www.npmjs.com/package/maestro-workflow-mcp).

## Documentation

[maestroskills.dev](https://maestroskills.dev): an interactive showcase and documentation.

## Contributing

Skills live in `source/skills/`; edit them there and nowhere else. From the repository root:

```bash
npm run build   # wipes and refills skills/ in all ten tool folders
npm run check   # checks frontmatter for name: and description:, and (reference/…) links
```
