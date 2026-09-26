# ![Maestro](assets/banner.png)

**Maestro** helps you build LLM apps and agents that hold up in production. It gives your coding agent 24 slash commands that check your prompts, context, tools and agent design, fix what is weak, and add what is missing.

- **Made for LLM work.** It targets what breaks in AI systems: unstructured prompts, overstuffed context, too many tools, no evaluation, no guardrails.
- **Starts from your project.** `/teach-maestro` asks once about your models, constraints and priorities, and the other commands build on the answers.
- **From finding to fix.** `/diagnose` names the command for each gap, and each command suggests the next.
- **Fits the tools you use.** Skills for Claude Code, Cursor, Codex, Gemini CLI, Kiro, Trae, OpenCode, Pi and Antigravity, and an extension for VS Code.
- **Picks up where you left off.** `/capture` saves a session's decisions and next steps, and `/recap` restores them.

[Website](https://maestroskills.dev) · [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=sharpdeveye.maestro-workflow)

## Quick start

### Install

**Skills**, the command files themselves, for any supported agent:

```bash
npx skills add sharpdeveye/maestro
```

**VS Code extension**, for VS Code, Cursor and Antigravity:

```bash
code --install-extension sharpdeveye.maestro-workflow
```

Cursor and Antigravity get it from Open VSX. Each time you open a project, the extension writes Maestro's skills into it for every supported agent. Its sidebar sends any command to the chat in one click.

### First run

In your agent's chat, once per project:

```text
/teach-maestro
```

It asks about your models, workflow, quality checks, constraints and priorities, then saves the answers to `.maestro.md` in your project. The other commands read this file first.

Then get a baseline:

```text
/diagnose
```

You get a score from 1 to 5 for prompts, context, tools, architecture and safety, then the most serious findings and the commands to run for them. Start with the one for your lowest score.

## Commands

Each command ends by suggesting what to run next.

### Find problems

| Command | What it does | Use it when |
| --- | --- | --- |
| `/diagnose` | Scores five areas from 1 to 5 and names the command for each gap | You need a baseline |
| `/evaluate` | Runs realistic scenarios, normal to hostile, and grades them A to F | After a change, to see how your app behaves |
| `/reflect` | Shows which commands you run, finish or abandon | You run commands through the extension's `@maestro` in VS Code |

### Fix and harden

| Command | What it does | Use it when |
| --- | --- | --- |
| `/fortify` | Adds input checks, retries, fallbacks, circuit breakers and timeouts | Your app breaks in production |
| `/guard` | Guards against prompt injection, data leaks, runaway cost and unauthorized actions | Before production, or with sensitive data |
| `/refine` | Polishes prompts, tool descriptions, errors, logs and config without changing behavior | Your app works and you are about to ship |
| `/calibrate` | Makes names, prompts, errors and logs consistent and records the conventions in `.maestro.md` | Parts were built in different ways |
| `/streamline` | Cuts duplicate steps, overlapping tools and instructions the model follows anyway | Redundant parts have piled up |
| `/temper` | Removes over-engineering: needless agents, premature optimization, one-implementation abstractions | Your app is built for needs it doesn't have |
| `/zero-defect` | Holds your coding agent to eight precision rules for the rest of the session | Critical work: deploys, security, money |

### Extend and speed up

| Command | What it does | Use it when |
| --- | --- | --- |
| `/amplify` | Adds capability through better prompts, tools, context or model | Your app works but fails on complex cases |
| `/enrich` | Adds knowledge sources: retrieval, grounding data, citations | Your app needs facts the model lacks |
| `/chain` | Designs a multi-step tool pipeline and the data passed between steps | One task takes several tool calls |
| `/compose` | Designs a multi-agent system once one agent proves not enough | One agent has tried and failed |
| `/iterate` | Sets up feedback loops, evaluators and regression checks | Quality should improve on its own |
| `/accelerate` | Cuts latency, cost and tokens, measured before and after | Your app is too slow or too expensive |
| `/turbocharge` | Proposes advanced designs, such as parallel fan-out or adaptive routing, and builds your pick | Your app works and you want to push its limits |

### Set up and keep going

| Command | What it does | Use it when |
| --- | --- | --- |
| `/teach-maestro` | Interviews you and saves the answers to `.maestro.md` | First, once per project |
| `/onboard-agent` | Sets up conventions, folders, a first agent and its test | You start from scratch or add an agent |
| `/adapt-workflow` | Ports your app to another provider, model tier or environment | You switch provider or deploy somewhere new |
| `/specialize` | Adds a field's terminology, regulations, evaluation and safeguards | Your app serves law, medicine or another field |
| `/extract-pattern` | Turns a working solution into a reusable template | Something worked and you will need it again |
| `/capture` | Saves what the session did, decided and left open | At the end of a session |
| `/recap` | Reads the last saved session back and says where to resume | At the start of the next |

## MCP server

Maestro also runs as an MCP server. Add it to your client's configuration:

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

Your client then offers each command as a prompt, and Maestro's principles and seven reference guides as resources. Ten tools let the model fetch a command's instructions, read your `.maestro.md` and keep a decision log. The VS Code extension registers the server for you. The [npm page](https://www.npmjs.com/package/maestro-workflow-mcp) lists every tool and the HTTP mode for remote clients.

## How it works

Each command is a skill: a Markdown file of instructions your agent follows with its own tools. All but `/teach-maestro` first load `agent-workflow`, the core skill, and read your `.maestro.md`. The core skill holds Maestro's principles, a checklist of common mistakes and seven reference guides: prompts, context, tools, agent architecture, feedback loops, retrieval and guardrails.

The VS Code extension adds:

- **A sidebar** that sends any command to your editor's chat.
- **`@maestro` in VS Code's chat**, which runs a command on the editor's chat model with your project context and logs each run in `.maestro/` for `/reflect`.
- **Zero-Defect mode**, a switch that adds the `/zero-defect` rules to every `@maestro` request and to `CLAUDE.md`.

Maestro writes `.maestro.md` plus session notes and logs in `.maestro/`. The extension also writes the skills into each agent's folder (`.claude/skills/`, `.cursor/skills/` and eight more), its server entry into your MCP config, and the Zero-Defect rules into `CLAUDE.md` and Cursor's or Antigravity's rules file.

## Contributing

Edit skills only in `source/skills/`. The agent folders, the extension and the MCP server all build their copies from there.

```bash
npm run check   # validate every SKILL.md
npm run build   # copy the skills into the ten agent folders
```
