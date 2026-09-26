# Purpose — the owner's statement (the stand-in user, question set 01, 2026-09-24, verbatim)

The owner of this document for this run is the benchmark's stand-in user, a Claude Opus agent that has read the repository snapshot and never its published README (plugins/terse/references/benchmark.md). What follows is its answer to "what is this README for, and what must it make its reader able to do", and its reader profile, verbatim from standin/answers-01.md.

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
