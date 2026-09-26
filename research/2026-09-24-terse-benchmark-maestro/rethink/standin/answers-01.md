# Question set 01: answers from the stand-in owner

I answer as the owner of the snapshot (Maestro). Every quote carries its file and line, with paths relative to the snapshot. Anything not quoted is my own words as the owner. I read only the snapshot. Its root README is absent and I did not look for it. I did read the snapshot's other READMEs: `maestro-extension/README.md` (the Marketplace page), `mcp-server/README.md` (the npm page) and `maestro-extension/webview-ui/README.md` (the stock Vite template).

## 1. Purpose

This README is Maestro's front door on GitHub. It is the one page that covers the whole project: 25 skills (one core skill, 24 slash commands and 7 reference files) and the three ways to give them to an AI coding agent: the skill files themselves, the VS Code extension, and the MCP server. After reading it, a developer must be able to:

- tell whether Maestro fits their tool and their problem
- install it by the route that fits
- run `/teach-maestro` once, then a first command such as `/diagnose`
- find the command for their next problem in the command table

It links to the Marketplace page, the npm page and maestroskills.dev for depth rather than repeating them. It tells contributors that `source/skills/` is the only place to edit ("Source of truth: source/skills/", `scripts/build.js:4`).

## 2. The reader

**Who.** A developer who builds LLM features, agents or pipelines (prompts, tools, RAG, multi-agent setups) and does that work inside an AI coding tool: Claude Code, Cursor, Gemini CLI, Codex, Kiro, Trae, OpenCode, Pi, Antigravity, or VS Code's chat. They know their tool and what a slash command is. I don't assume they know what an MCP server or a skills folder is, and they have not picked an install route yet. The second group is people who already use the extension or the MCP server and come for the full command list, the source, or to contribute.

**From where.** I have no traffic numbers. These are the routes the snapshot shows:

- **GitHub itself.** The repo is the homepage in `package.json:23` and `mcp-server/package.json:33` ("https://github.com/sharpdeveye/maestro"). Its keywords are in `package.json:5-16`: ai, agents, workflows, skills, cursor, claude, gemini, codex, prompt-engineering, orchestration.
- **The VS Code Marketplace or Open VSX listing.** `maestro-extension/README.md:10` has "[Install](vscode:extension/sharpdeveye.maestro-workflow) · [Website](https://maestroskills.dev) · [GitHub](https://github.com/sharpdeveye/maestro) · [MCP Server](https://www.npmjs.com/package/maestro-workflow-mcp)". Line `:121` has "[GitHub](https://github.com/sharpdeveye/maestro) | Source code, skills, and contributions". Open VSX publishing is the "Publish to Open VSX" step in `.github/workflows/build-extension.yml`.
- **npm.** `mcp-server/README.md:11` says "MCP server for [Maestro](https://github.com/sharpdeveye/maestro) — exposes 25 workflow skills as tools, prompts, and resources for any MCP-compatible AI client."
- **The skills CLI.** `maestro-extension/CHANGELOG.md:11` mentions "users using `npx skills add`". `skills-lock.json:5-6` records `"source": "sharpdeveye/maestro"`, `"sourceType": "github"`.
- **The website.** maestroskills.dev is the extension's homepage (`maestro-extension/package.json:14`), described as "Interactive showcase and documentation" (`maestro-extension/README.md:120`). The only link inside a tool goes to the website, not to GitHub: the sidebar footer at `maestro-extension/webview-ui/src/App.tsx:75`.

**Entry file.** Every reader of this README starts at `README.md` in the repository root. The Marketplace page and the npm page are entry files for their own channels, and both send readers back to the repo. So the root README must not assume the reader has seen either one. Inside the product, every route starts at one command, `/teach-maestro`: "This is the entry point for Maestro." (`source/skills/teach-maestro/SKILL.md:12`).

## 3. Exemplars

I named these from memory and have not checked them, because I read nothing outside the snapshot. Drop any URL that no longer resolves.

1. **https://github.com/github/spec-kit.** One install puts slash commands into each agent's own folder. The README has a table of supported agents and a numbered getting-started path where every step is a command. It is the closest to Maestro's shape: ten provider folders, then `/teach-maestro` → `/diagnose` → a fix command.
2. **https://github.com/obra/superpowers.** A skills library for coding agents. The README says first what the skills do together, then how to install per agent, then lists the library by category.
3. **https://github.com/microsoft/playwright-mcp.** For the MCP route only: one standard config block, install steps per client, then the tools reference.

I don't want Impeccable's README as an exemplar. `NOTICE.md:15` says "Maestro is NOT a fork, derivative, or modified copy of any existing skill project." `scripts/validate.js:62-68` fails any skill that mentions "impeccable" or "pbakaus" (its comment says "copyright safety"). I don't want the README modelled on another skill project's README.

## 4. Survey size

I take the default that was offered: two slices per surveyor, and the third surveyor also reads the three exemplars.

## 5. What the README must say, and must never say

### The README must say

1. **The identity, in the project's own words.** "Workflow fluency for AI coding agents." (`package.json:4`). The product name is "Maestro — AI Workflow Fluency" (`maestro-extension/package.json:3`).
2. **The counts from the source tree.**
   - 25 skills: the core `agent-workflow` skill (`user-invocable: false`) plus 24 commands in four groups: Analysis, Fix & Improve, Enhancement, Utility (`mcp-server/src/tools.ts:19-24`).
   - 7 reference files.
   - The changelog counts the same way: "All 25 skills bumped to v2.0.0" (`CHANGELOG.md:10`).
3. **The three install routes, each with its command.**
   - **Skill files.** `npx skills add sharpdeveye/maestro` is my own wording of the command, inferred from `skills-lock.json:5-6`; I have not run it. The other way is to clone the repo and run `npm run build`, which copies `source/skills/` into the ten provider folders (`scripts/build.js:3`).
   - **The extension.** `sharpdeveye.maestro-workflow` on the Marketplace and on Open VSX.
   - **The MCP server.** `npx -y maestro-workflow-mcp` (`mcp-server/README.md:27-28`), or `npx maestro-workflow-mcp --http --port 3001` (`:66`).
4. **The first run: `/teach-maestro` once per project, then `/diagnose`.**
   - `/teach-maestro` "creates the `.maestro.md` context file that all other Maestro commands depend on" (`teach-maestro/SKILL.md:12`).
   - "After creating `.maestro.md`, run `/diagnose` for a baseline health check of your workflow." (`:96`).
   - Every command opens with "if no workflow context exists yet, you MUST run /teach-maestro first." (for example `diagnose/SKILL.md:12`).
   - The file `/teach-maestro` saves is `.maestro.md` (`:75`). If `.maestro/context.md` exists, it is read first (`CHANGELOG.md:44`).
5. **The memory layer, as the headline of 2.0.** It comes first under "Added" in the changelog (`CHANGELOG.md:14-20`): `/capture`, `/recap`, `/reflect`, `decisions.jsonl`, `audit.jsonl`, and "`.maestro/` directory — persistent memory that survives sessions". Show the loop: "your next session should start with `/recap`" (`capture/SKILL.md:71`).
6. **Where it runs.**
   - The ten provider folders: `.agents .claude .cursor .gemini .codex .kiro .trae .trae-cn .opencode .pi` (`scripts/build.js:14-25`).
   - The extension needs "VS Code 1.95+ (or compatible fork: Cursor, Antigravity, Windsurf)" (`maestro-extension/README.md:127`).
   - The MCP server needs Node 20 or later (`mcp-server/package.json:52`).
7. **What the extension writes into the project on its own.**
   - "On every activation, Maestro syncs all 25 bundled skills into 10 AI provider directories" (`maestro-extension/README.md:50`).
   - It writes a `maestro-workflow-mcp` server entry into the workspace's MCP config (`maestro-extension/src/adapters/mcp-config.ts:38-82`).
   - The Zero-Defect toggle writes a marked block of rules into `CLAUDE.md`. In Cursor it also writes to `.cursorrules`; in Antigravity it writes `.agents/rules/maestro-zero-defect.md` (`maestro-extension/src/extension.ts:84-91`, `maestro-extension/src/adapters/editor.ts:111-112`).
   - `.maestro/` gets its own `.gitignore`, headed "Maestro session data — opt-in to version control", and the context file stays versioned (`packages/core/src/decisions.ts:29-36`).
8. **Costs are estimates.**
   - "Accuracy: ±20% — useful for trends, not invoicing." (`packages/core/src/cost-estimator.ts:5`).
   - Token counts are a heuristic for "context budget display (not billing)" (`packages/core/src/token-estimator.ts:10`).
   - The audit trail comes from the extension: "Use Maestro commands via the VS Code extension to generate audit entries." (`mcp-server/src/tools.ts:521`).
9. **MCP waves live in memory.** "if the server restarts, active waves are lost" (`mcp-server/src/wave-state.ts:6`).

### The README must never say

1. **That Maestro is a fork, port or derivative of another skill project, or name any project as its origin** (`NOTICE.md:15-16`). It may name the shared convention of a core skill, reference files and commands (`NOTICE.md:6-11`).
2. **The stale or loose counts in the manifests.**
   - "21 commands" (`package.json:4`, a manifest still at version 1.4.2; also `mcp-server/src/tools.ts:147`).
   - "25 commands" (`maestro-extension/package.json:4`).
   - "25 prompt templates" (`mcp-server/README.md:90`, which lists only 24).
3. **A cost or token figure without "~" or "estimate".** This is `/reflect`'s own rule: "Show cost data without the "estimate" disclaimer (~)" is on its NEVER list (`reflect/SKILL.md:105`).
