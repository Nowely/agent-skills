<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/banner.svg">
  <source media="(prefers-color-scheme: light)" srcset="assets/banner.svg">
  <img src="assets/banner.svg" alt="Maestro — Workflow fluency for AI coding agents" width="100%">
</picture>

<br>

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-2.0.0-brightgreen.svg)](https://github.com/sharpdeveye/maestro/releases)
[![npm](https://img.shields.io/npm/v/maestro-workflow-mcp.svg?label=npm&color=cb3837)](https://www.npmjs.com/package/maestro-workflow-mcp)
[![VS Code Marketplace](https://img.shields.io/visual-studio-marketplace/v/sharpdeveye.maestro-workflow?label=VS%20Code&logo=visual-studio-code&color=007ACC)](https://marketplace.visualstudio.com/items?itemName=sharpdeveye.maestro-workflow)
[![MCP](https://img.shields.io/badge/MCP-Compatible-00D4AA?logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiPjxwYXRoIGQ9Ik0xMiAyTDIgN3Y1YzAgNS41IDQuMyAxMC40IDEwIDEyIDUuNy0xLjYgMTAtNi41IDEwLTEyVjdsLTEwLTV6Ii8+PC9zdmc+)](https://modelcontextprotocol.io)
[![Skills](https://img.shields.io/badge/skills-25-blueviolet.svg)](#the-skill-agent-workflow)
[![Commands](https://img.shields.io/badge/commands-25-orange.svg)](#25-commands)
[![10 Providers](https://img.shields.io/badge/providers-10-teal.svg)](#supported-tools)

1 core skill · 25 commands · 7 domain references · memory layer · audit trail

[Quick Start](#quick-start) · [Commands](#25-commands) · [What's New in v2](#whats-new-in-v2) · [Supported Tools](#supported-tools) · [Contributing](#contributing)

</div>

---

## What is Maestro?

AI agents are only as good as the workflows they operate in. Without guidance, you get the same predictable mistakes: unstructured prompts, context window overflows, tool sprawl, no error handling, and multi-agent systems for single-agent problems.

Maestro fights that pattern with:

- A comprehensive **agent-workflow** skill with 7 domain-specific reference files ([view source](source/skills/agent-workflow))
- **25 commands** to diagnose, evaluate, refine, streamline, fortify, capture, reflect, and more
- **Persistent memory** — decisions, audit trail, and session history survive across sessions
- Curated **anti-patterns** that explicitly tell the AI what NOT to do
- A **context gathering protocol** (`.maestro.md` or `.maestro/context.md`) that ensures every command has project-specific awareness
- **Every command recommends a next step** — no dead ends

---

