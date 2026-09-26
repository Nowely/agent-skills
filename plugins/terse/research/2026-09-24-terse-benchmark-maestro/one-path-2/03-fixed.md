# ![Maestro](assets/banner.png)

**Maestro** helps you build LLM apps and agents that hold up in production. It gives your coding tool 24 slash commands. Together they check your prompts, context, tools and agent design, fix what is weak, and add what is missing.

- **Starts from your project.** `/teach-maestro` asks once about your models, constraints and priorities, and the other commands build on the answers.
- **From finding to fix.** `/diagnose` maps what it finds to Maestro commands.
- **Fits your coding tool.** Commands for Claude Code, Cursor, Codex, Gemini CLI, Kiro, Trae, OpenCode, Pi and Antigravity, an extension for VS Code, and a server for other AI clients.
- **Picks up where you left off.** `/capture` saves a session's decisions and next steps, and `/recap` restores them.

[Website](https://maestroskills.dev) · [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=sharpdeveye.maestro-workflow)

## Quick start

### Install

**Command files** for any supported coding tool. Run this from your project's root:

```bash
npx skills add sharpdeveye/maestro
```

**VS Code extension** for VS Code, Cursor and Antigravity. In VS Code, run:

```bash
code --install-extension sharpdeveye.maestro-workflow
```

Cursor and Antigravity get it from Open VSX. Each time you open a project, the extension writes a fresh copy of Maestro's command files into it for every supported coding tool.

### First run

Once per project:

```text
/teach-maestro
```

It asks about your models, workflow, quality checks, constraints and priorities. Then it saves your answers to `.maestro.md` in your project. The other commands read this file first.

Then get a baseline:

```text
/diagnose
```

It scores prompts, context, tools, architecture and safety from 1 to 5, lists the most serious findings and names the commands to run. Start with the one for your lowest score.

## Commands

### Find problems

| Command | What it does | Use it when |
| --- | --- | --- |
| `/diagnose` | Scores five areas and maps gaps to commands | You need a baseline |
| `/evaluate` | Runs realistic scenarios, from normal to hostile input | After a change, to see how your app behaves |
| `/reflect` | Shows which commands you run, finish or abandon | You run commands in VS Code's chat through the extension |

### Fix and harden

| Command | What it does | Use it when |
| --- | --- | --- |
| `/fortify` | Adds input checks, retries, fallbacks, circuit breakers and timeouts | Your app breaks in production |
| `/guard` | Guards against prompt injection, data leaks, runaway cost and unauthorized actions | Before production, or with sensitive data |
| `/refine` | Gives prompts, tool descriptions, errors, logs and config a final polish | Your app works and you are about to ship |
| `/calibrate` | Makes names, prompt style, errors and logs follow one convention | Parts were built in different ways |
| `/streamline` | Cuts duplicate steps, overlapping tools and instructions the model follows anyway | Redundant parts have piled up |
| `/temper` | Removes over-engineering: needless agents, premature optimization, one-implementation abstractions | Your app is built for needs it doesn't have |
| `/zero-defect` | Asks your coding tool to follow eight precision rules | Critical work: deploys, security, money |

### Extend and speed up

| Command | What it does | Use it when |
| --- | --- | --- |
| `/amplify` | Adds capability through better prompts, tools, context or model | Your app works but fails on complex cases |
| `/enrich` | Adds knowledge sources: retrieval, grounding data, citations | Your app needs facts the model lacks |
| `/chain` | Designs a multi-step tool pipeline | One task takes several tool calls |
| `/compose` | Designs a multi-agent system | One agent has tried and failed |
| `/iterate` | Sets up feedback loops, evaluators and regression checks | Quality should improve on its own |
| `/accelerate` | Cuts latency, cost and tokens | Your app is too slow or too expensive |
| `/turbocharge` | Proposes advanced designs, such as parallel fan-out or adaptive routing, and builds your pick | Your app works and you want to push its limits |

### Set up and keep going

| Command | What it does | Use it when |
| --- | --- | --- |
| `/teach-maestro` | Interviews you and saves your project's context | First, once per project |
| `/onboard-agent` | Sets up conventions, folders, a first agent and its test | You start from scratch or add an agent |
| `/adapt-workflow` | Ports your app to another provider, model tier or environment | You switch provider or deploy somewhere new |
| `/specialize` | Adds a field's terminology, regulations, evaluation and guardrails | Your app serves law, medicine or another field |
| `/extract-pattern` | Turns a working solution into a reusable template | Something worked and you will need it again |
| `/capture` | Saves session notes: what you did, decided and left open | At the end of a session |
| `/recap` | Reads your last session notes back and says where to resume | At the start of the next |

## MCP server

Other AI clients can run Maestro as an MCP server. Add it to your client's MCP config:

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

Your client then offers each command as a prompt. The VS Code extension registers the server for you. The [npm page](https://www.npmjs.com/package/maestro-workflow-mcp) lists every tool and the HTTP mode for remote clients.

## How it works

Each command is a skill: a Markdown file of instructions your coding tool follows. All but `/teach-maestro` tell it to load the core skill first. The core skill holds Maestro's principles and a checklist of common mistakes. It also holds seven reference guides: prompts, context, tools, agent architecture, feedback loops, retrieval and guardrails.

The VS Code extension adds:

- **A sidebar** that sends any command to your editor's chat.
- **`@maestro` in VS Code's chat**, which runs commands with your project context and logs runs in `.maestro/` for `/reflect`.
- **Zero-Defect mode**, a switch that adds the eight precision rules to every `@maestro` request. It also writes them into `CLAUDE.md`, and in Cursor or Antigravity into their rules file.

As you work, `/teach-maestro` writes `.maestro.md` and `/capture` writes session notes and logs in `.maestro/`.

## Contributing

Edit skills only in `source/skills/`. The other copies are built from it.

```bash
npm run check   # validate every SKILL.md
npm run build   # copy the skills into each coding tool's folder
```
