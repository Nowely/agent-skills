# Maestro

Maestro gives your AI coding agent 24 slash commands for the LLM workflows you build: prompts, tools, RAG, multi-agent setups. Your agent can audit a workflow, fix what the audit finds, harden it for production or cut its cost.

- **Each command points to the next.** `/diagnose` maps each gap it finds to a command, and every command ends with the one to run next.
- **It knows your project.** One interview records your models, constraints and priorities; every command after it reads them first.
- **It talks you out of over-building.** `/compose` checks that one agent really fails before it designs several; `/temper` strips what your requirements don't need.
- **It fits the tool you use.** Skill files for Claude Code, Cursor, Gemini CLI, Codex, Kiro, Trae, OpenCode, Pi and Antigravity, and an extension for VS Code.

## Quick start

From your project folder:

```bash
npx skills add sharpdeveye/maestro --skill '*'
```

`--skill '*'` installs all 25 skills together; every command loads the core one first. To update, run the same command again.

Then, in your agent:

```text
/teach-maestro
```

It asks about your models, workflow, quality checks, constraints and priorities, one section at a time, and saves the answers as `.maestro.md`. Run it once per project.

```text
/diagnose
```

It scores prompts, context, tools, architecture and safety from 1 to 5, lists the critical findings and names the command to run for each. Run that one next.

**Other routes**

- **VS Code, Cursor, Antigravity:** install [Maestro — AI Workflow Fluency](https://marketplace.visualstudio.com/items?itemName=sharpdeveye.maestro-workflow). It adds a command sidebar and `@maestro` in VS Code's chat, and writes the skills into your workspace.
- **Any MCP client:** add a server that runs `npx -y maestro-workflow-mcp`; the commands arrive as prompts. [Setup for each client](https://www.npmjs.com/package/maestro-workflow-mcp).

## Commands

### Analysis

| Command | What it does | Use it when |
|---|---|---|
| `/diagnose` | Scores five areas from 1 to 5 and names a command for each gap | You need a baseline or a place to start |
| `/evaluate` | Runs normal, edge, error, stress and adversarial scenarios; grades A–F | You want a review of how it really behaves |
| `/reflect` | Builds a scorecard from Maestro's logs: usage, completion, cost, time | You want to see which commands pay off |

### Fix & Improve

| Command | What it does | Use it when |
|---|---|---|
| `/refine` | Final pass on prompts, tool descriptions, error messages, logging, config | It works and needs polish before shipping |
| `/streamline` | Cuts steps, tools, prompt text and config that add nothing | It feels too complex or its tools overlap |
| `/calibrate` | Aligns naming, prompt style, error format and logging | Its parts don't follow one convention |
| `/fortify` | Adds input validation, retries with backoff, fallbacks, circuit breakers, timeouts | It fails in production or handles only the happy path |
| `/zero-defect` | Holds the agent to eight precision rules and a pre-commit gate for the rest of the session | Mistakes are unacceptable: deploys, security, money |

### Enhancement

| Command | What it does | Use it when |
|---|---|---|
| `/amplify` | Adds capability through better prompts, tools, context or model | It works but misses harder cases |
| `/chain` | Designs sequential, parallel or conditional tool chains with explicit data flow | A task needs several tools |
| `/compose` | Designs agents, handoffs and a supervisor, after checking one agent really fails | A single agent can't do the job |
| `/enrich` | Adds RAG, structured and real-time data, with source attribution | The agent needs facts it wasn't trained on |
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
| `/capture` | Saves commands run, decisions, changed files and next steps to `.maestro/sessions/` | At the end of a session |
| `/recap` | Summarizes the last saved session and what to do next | At the start of the next one |

## How it works

- **One core skill.** `agent-workflow` holds the principles, a checklist of common workflow flaws and seven references: prompt engineering, context management, tool orchestration, agent architecture, feedback loops, knowledge systems, guardrails. Every command except `/teach-maestro` loads it and reads `.maestro.md` before it starts.
- **What the skills write.** `/teach-maestro` writes `.maestro.md`; `/capture` adds a session summary and a decision-log entry under `.maestro/`.
- **The extension.**
  - On every start it writes the 25 `SKILL.md` files into ten agent folders in your workspace (`.agents`, `.claude`, `.cursor`, `.gemini`, `.codex`, `.kiro`, `.trae`, `.trae-cn`, `.opencode`, `.pi`) and adds its MCP server to the workspace's MCP config; from the second start on it rewrites `.vscode/mcp.json` with Maestro's entry alone.
  - Its sidebar sends any command to chat and switches Zero-Defect mode. Turning that on writes the precision rules into `CLAUDE.md`, and also into `.cursorrules` in Cursor or a rule file in Antigravity.
  - In VS Code, `@maestro` runs `/diagnose`, `/evaluate`, `/fortify`, `/refine`, `/chain` and `/compose` in checked phases, adds the precision rules to every request while Zero-Defect is on, and logs each command under `.maestro/`.
- **The MCP server.** The 24 commands as prompts, the core skill and its references as resources, and ten tools: list and run commands, read the project context, step through phased runs, read the logs and add to the decision log.

Showcase and documentation: [maestroskills.dev](https://maestroskills.dev).

## Contributing

Skills live in `source/skills/`; edit them there and nowhere else. The extension and the MCP server bundle that folder when they build, and the root scripts work from it:

```bash
npm run build   # regenerates the ten agent folders from source/skills/, deleting what was in them
npm run check   # validates each skill's frontmatter and reference links
```
