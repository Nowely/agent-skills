# Critic against the code: 02-repairs.md (lens 1, Opus)

Document: `/var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/terse/runs/20260924-150946-maestro-readme-rewrite/02-repairs.md` (152 lines).
Code: `/var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/terse-bench/snapshot` (paths below are relative to it). Read in full: source/skills (25 SKILL.md, 7 references), scripts/, packages/core/src, mcp-server/src and README, maestro-extension/src, package.json, README, CHANGELOG, bundler, webview command list, manifests, CHANGELOG.md, .github/workflows.
Level 3 for the extension means the extension's own code, bundled from a copy of the snapshot, run against a mocked `vscode` module. Only the host API is mocked, and the mock model records every `sendRequest(messages, options)` call. No real agent and no real VS Code were run. Claims about what a command does through skill files rest on the SKILL.md instructions, which is level 2.

## Reproduction

```
S=/var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/terse-bench/snapshot
W=/var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/lens1-opus-02
export npm_config_cache=$W/npm-cache
cp -R $S $W/snap
npm --prefix $W/snap run check                    # C1: "Results: 0 errors, 0 warnings"
npm --prefix $W/snap run build                    # C1: "10 providers x 25 skills = 250 skill copies"
npm --prefix $W/snap/packages/core ci && npm --prefix $W/snap/packages/core run build
    # core must be built first; without it the MCP build stops at: src/tools.ts:13:7: ERROR: Could not resolve "@maestro/core"
npm --prefix $W/snap/mcp-server ci && npm --prefix $W/snap/mcp-server run build
npm --prefix $W/snap/maestro-extension ci --ignore-scripts && npm --prefix $W/snap/maestro-extension run bundle-skills
node $W/harness/build-ext.cjs                     # unminified bundle, vscode external -> $W/harness/ext/extension.js
M=$W/snap/mcp-server/dist/index.js
node $W/harness/mcp-wave.mjs $M "$(mktemp -d)" "$(mktemp -d)"                       # C2 (log: $W/logs/mcp-wave.txt)
node $W/harness/mcp-writes.mjs $M <empty dir> <dir holding only .maestro/context.md> <home>   # C3 (log: $W/logs/mcp-writes.txt)
node $W/harness/mcp-both.mjs $M <dir holding .maestro/context.md and .maestro.md> <home>     # C4 (log: $W/logs/mcp-both.txt)
bash $W/harness/run-ext-checks.sh $W              # C5, sections E1-E6 (log: $W/logs/ext-checks.txt)
bash $W/harness/run-ext-tokens.sh $W              # C6 (log: $W/logs/ext-tokens.txt)
```
Mock host: `$W/harness/ext/node_modules/vscode/index.js`. One editor start is one `node $W/harness/ext/start.cjs <project> <appName> <stateFile> <actionsJson>` process. The state file stands in for workspaceState across restarts.

## Findings

**F1. Line 9. OVERSTATED.** Level 3 (mocked host) plus level 2.
> "The commands diagnose it, fix and improve it, or extend it, and Maestro carries a record of your sessions into the next one (see [Memory across sessions](#memory-across-sessions))."

The sentence before it lists "VS Code's own chat" as one of the agents. For that route (`@maestro`), no record carries over, and fixes are only printed:
- The participant sends the model only the skill text, the sliced context file and the prompt (maestro-extension/src/chat/participant.ts:57-122; core/context-slicer.ts:47-90).
- It never reads `.maestro/sessions/` or `decisions.jsonl`.
- It never passes chat history: `chatContext` appears only at participant.ts:49.
- It passes no tools: `model.sendRequest(messages, {}, token)` at participant.ts:195 and :268.

C5/E4, after seeding a session file (SESSION-MARKER) and a decision (DECISION-MARKER), `@maestro /recap` gives `any message contains "SESSION-MARKER": false` and `"DECISION-MARKER": false`. Every call shows `options passed: [{}]`.

**F2. Line 22. UNDERSTATED.** Level 3 (mocked) plus level 2.
> "| [VS Code extension](#vs-code-extension) | VS Code, and its forks Cursor, Antigravity, Windsurf | VS Code 1.95 or later | ..."

The "Needs" cell leaves out a chat model. The document's chat route needs one reachable through VS Code's language-model API. In VS Code the palette and sidebar also open `@maestro /<command>` (maestro-extension/src/extension.ts:275-280). With no model, every command stops (participant.ts:127-133). C5/E6: `chat shows: "*Maestro* — Applying **/diagnose** skill...\n\n---\n\n*Maestro* — No language model available. Ensure a model is configured in your editor.\n"`, `.maestro exists: false`.

**F3. Line 23. UNDERSTATED.** Level 3.
> "| [MCP server](#mcp-server) | Any MCP client | Node 20 or later | No skill files — it serves them on request |"

This is the "Writes into your project" column, and the server does write into the project. The chain:
1. `maestro_write_decision` (mcp-server/src/tools.ts:426-449) calls `appendDecision`.
2. `appendDecision` calls `ensureMaestroDir` (packages/core/src/decisions.ts:42-61, 85-101).
3. That creates `.maestro/`, `.maestro/sessions/` and `.maestro/.gitignore`, then appends `.maestro/decisions.jsonl`.

The /capture skill asks the agent for such an entry (source/skills/capture/SKILL.md:58). C3: `before write_decision: []` becomes `after write_decision: ["decision/.maestro/","decision/.maestro/.gitignore","decision/.maestro/decisions.jsonl","decision/.maestro/sessions/"]`.

**F4. Line 55 (same claim at line 22: "Also an MCP server entry"). UNDERSTATED.** Level 3 (mocked).
> "**An MCP server entry** in the workspace's MCP config, so your coding agent can also reach the skills through the MCP server."

At every start the extension adds its entry to each of `.vscode/mcp.json`, `.claude/mcp.json` and `.agents/mcp.json` that exists (maestro-extension/src/adapters/mcp-config.ts:20-27, 49-64). If no existing file got a new entry at that start, it rewrites `.vscode/mcp.json` from scratch with only Maestro's server, which deletes every other server in it (mcp-config.ts:58-60, 66-75, 136-151). That happens:
- at the first start when there is no config;
- at every later start once the entry is present;
- when a file fails `JSON.parse`, for example one with `//` comments (mcp-config.ts:97-104).

C5/E1:
- `after start 1 servers: github,maestro-workflow-mcp`; the user then adds `mine`; `after start 2 servers: maestro-workflow-mcp`.
- A config with a `//` comment: `commented config after start 1 servers: maestro-workflow-mcp`.
- A project whose only config is `.claude/mcp.json`: `.vscode/mcp.json exists=no` after start 1, `exists=yes` after start 2.

**F5. Line 55. OVERSTATED.** Level 3 (mocked) for what is written; level 2 for what Cursor reads.
> "so your coding agent can also reach the skills through the MCP server."

The extension never writes `.cursor/mcp.json` (mcp-config.ts:20-27). This document (line 70) and mcp-server/README.md:34 both give that file as Cursor's MCP config. C5/E1 with appName "Cursor": `.cursor/mcp.json exists=no` after start 1 and after start 2.

**F6. Line 56 (same claim at line 22). UNDERSTATED.** Level 3 (mocked).
> "**Zero-Defect mode's rules**, when you switch it on: a marked block of 8 precision rules in `CLAUDE.md`, created if missing; also `.cursorrules` in Cursor, and `.agents/rules/maestro-zero-defect.md` in Antigravity."

The block is the whole /zero-defect skill body, not 8 rules (extension.ts:81 `skills.getContent('zero-defect')` into adapters/editor.ts:64; source/skills/zero-defect/SKILL.md:10-83). It puts standing instructions into CLAUDE.md, including "Invoke /agent-workflow — ... if no workflow context exists yet, you MUST run /teach-maestro first" and a "Session Directive". C5/E3: `after ON: 76 lines; headings: ## MANDATORY PREPARATION|### The 8 Precision Rules|### The Pre-Commit Gate|### Anti-Pattern Table|### Session Directive|### Recommended Next Step|**NEVER**:|` and `4:Invoke /agent-workflow — it contains workflow principles, ...`.

**F7. Line 56 (and line 22, "when switched on"). UNDERSTATED.** Level 3 (mocked).
> Same sentence as F6.

Switching the mode off removes the block only from a file that has other text:
- If switching on created `CLAUDE.md` or `.cursorrules`, the full block stays after switch-off. Cutting the block leaves empty text, and the write is then skipped (editor.ts:51-74, the `if (existing.trim())` at :68).
- In Antigravity, switch-off rewrites the rule file with `trigger: manual` and keeps it (editor.ts:114-120).

C5/E3:
- `after OFF: state={"maestro.zeroDefectActive":false}; CLAUDE.md lines=76; markers=2`
- `Cursor ON+OFF: .cursorrules markers=2`
- `Antigravity OFF: file kept=yes, trigger: manual`
- A CLAUDE.md the user wrote is restored: `user CLAUDE.md after ON+OFF: # Mine|`

**F8. Line 66. OVERSTATED.** Level 3 (mocked) plus level 2.
> "See [First run](#first-run) for what these two give you." (after `@maestro /teach-maestro` and `@maestro /diagnose`)

First run (line 93) says /teach-maestro interviews you and saves `.maestro.md`. Through `@maestro` it can do neither. In VS Code this covers the palette and sidebar too, since they open `@maestro /<command>` (extension.ts:275-280).
- The model gets no tools (participant.ts:195 and :268 pass `{}`), so it cannot write the file.
- A follow-up turn reaches it without the skill or the earlier turns. Only `request.prompt` is added (participant.ts:119-122), and `chatContext` is unused (:49).
- The participant is not sticky (maestro-extension/package.json:180 `"isSticky": false`), so a reply without `@maestro` goes to another participant.

C5/E4:
- Turn 1: `options passed: [{}] | messages per call: [2] | chars per call: [3106]`.
- Turn 2, with two history entries passed: `messages per call: [1] | chars per call: [58]`, `"Interview Questions": false`, `"What AI model(s) are you using": false`.
- Afterwards: `.maestro.md exists: no`.

**F9. Line 83. OVERSTATED.** Level 2.
> "For VS Code's `servers` form (also used by Antigravity), the other clients, and HTTP, see [`mcp-server/README.md`](mcp-server/README.md)."

mcp-server/README.md configures three clients: Claude Desktop (:21), Cursor (:34) and VS Code / Antigravity (:47), plus HTTP (:61). Two of the three are already in this document, and the README has no other clients. `grep -n '^\*\*.*\*\* (' mcp-server/README.md` returns lines 21, 34 and 47 only.

**F10. Line 91. OVERSTATED.** Level 3 (MCP) plus level 2.
> "Every command needs `.maestro.md` in place first — except this one."

`.maestro/context.md` is accepted instead of `.maestro.md`, and read first, by:
- the core skill every command loads (source/skills/agent-workflow/SKILL.md:13-16);
- the extension (maestro-extension/src/core/context.ts:11);
- the MCP server (tools.ts:99-102).

The commands' own condition is "if no workflow context exists yet" (for example source/skills/diagnose/SKILL.md:12). With neither file, the core skill goes on with "Minimum viable context" questions (agent-workflow/SKILL.md:17, 23-29). Through `@maestro` nothing checks: /capture, /recap, /reflect and /diagnose each called the model with no context file (C5/E4). C3: `read_context with only .maestro/context.md -> "# Ctx\n\n## Tech Stack\nMARKER-CONTEXT-MD-ONLY\n" isError= false`, and `run_command diagnose includes context marker: true`.

**F11. Line 93. FALSE.** Level 2, plus level 3 through the MCP prompt.
> "**`/teach-maestro`**, once per project: asks your coding agent to interview you about the project and save the answers as `.maestro.md` in its root; if `.maestro/context.md` already exists, that is read first instead."

/teach-maestro never reads `.maestro/context.md`:
- It skips the core protocol: "No other preparation is needed — this IS the preparation" (source/skills/teach-maestro/SKILL.md:12).
- It always interviews and saves `.maestro.md` (:53, :75).
- `grep -rn 'context.md' source/skills` returns only agent-workflow/SKILL.md:14.

C4: `teach-maestro prompt mentions ".maestro/context.md": false`.

If `.maestro/context.md` exists, every reader uses it, and the `.maestro.md` that /teach-maestro writes is ignored. C4: `read_context with both files -> "# v2\nMARKER-A-CONTEXT-MD\n"`. Read as a statement about the other commands, the clause is true of them but contradicts line 91.

**F12. Line 107. OVERSTATED.** Level 3 (mocked).
> "| | [`/zero-defect`](source/skills/zero-defect/SKILL.md) | Activate maximum precision mode — zero mistakes allowed |"

In the extension, running /zero-defect sends the rules with that one request and does not switch Zero-Defect mode on. This applies to the palette "Maestro: Zero-Defect — Maximum precision" and to `@maestro /zero-defect`.
- Skill commands only inject their slash command (extension.ts:114-125).
- Only `maestro.toggleZeroDefect` changes the mode (extension.ts:76-98).
- Later requests carry the rules only while the mode is on (participant.ts:57-67).
- The skill's "entire session" (zero-defect/SKILL.md:22, 63) cannot hold without history (participant.ts:49).

C5/E5:
- `command maestro.zeroDefect` opens chat with `"@maestro /zero-defect"`; that turn: `"The 8 Precision Rules": true`.
- Next turn: `messages per call: [1] | chars per call: [23]`, `"The 8 Precision Rules": false`, `"Zero-Defect Mode Active": false`.
- `workspaceState: {"maestro.commandHistory":[...]}`, with no `maestro.zeroDefectActive`; `CLAUDE.md written: no`.

**F13. Line 129. OVERSTATED.** Level 3 (mocked).
> "**`/capture`**, at the end of a session — saves a session summary to `.maestro/sessions/` and appends an entry to the decision log (`decisions.jsonl`)."

Through `@maestro` no summary is saved, because the model has no tools (participant.ts:268). The only decision line is the one the extension writes automatically after any command (participant.ts:329-338). C5/E4: `sessions after @maestro /capture: 2026-09-20_seed.md` (only the seeded file); `decision written for /capture: /capture completed in 0.0s`.

**F14. Line 130. OVERSTATED.** Level 3 (mocked).
> "**`/recap`**, at the start of the next one — reads back the latest summary and the last five decisions."

Through `@maestro` the model receives neither. The participant injects only the sliced context file and the active file's imports (participant.ts:69-91; context-slicer.ts:47-90), and it has no tools. C5/E4: `@maestro /recap` gives `"SESSION-MARKER": false` and `"DECISION-MARKER": false`.

**F15. Line 131. OVERSTATED.** Level 3 (mocked).
> "**`/reflect`** — scores Maestro's own commands from those logs: usage, completion rate, ~cost, and duration."

Through `@maestro` the logs never reach the model, for the same reason as F14. C5/E4: `@maestro /reflect` gives `any message contains "a-33os2lkm": false` (the id of the first audit row) and `"DECISION-MARKER": false`.

**F16. Line 131. UNDERSTATED.** Level 2.
> Same sentence as F15.

/reflect scores five dimensions, and the list leaves out command flow: common command sequences and abandonment rate per command (source/skills/reflect/SKILL.md:37-40; output rows "Most Abandoned" at :60 and "STRONGEST PIPELINES" at :64-67).

**F17. Line 133. OVERSTATED.** Level 3 (mocked).
> "Only the extension writes the command log (`audit.jsonl`): its lines come from commands run through `@maestro` in VS Code's chat, each with the command's duration, ~tokens and ~cost."

The recorded input count is only the estimate of the injected context slice (participant.ts:311-313, `const inputTokens = sliced.tokenEstimate`). It leaves out:
- the skill instructions;
- the Zero-Defect block;
- the user's prompt;
- the repeat of the messages at each wave phase.

The cost uses the default price whatever model ran (participant.ts:314 `estimateCost(null, ...)`; packages/core/src/cost-estimator.ts:66).

C5/E4 audit rows, as input tokens / output tokens / cost:
- `teach-maestro 0 84 0.0007` for 3,106 characters sent
- `capture 0 84` for 2,656
- `recap 0 84` for 2,318
- `reflect 0 84` for 3,699
- `diagnose 0 252 0.002 phases=3` for three calls of 6,580 + 6,881 + 6,900 characters

C6, with a 2,088-character `.maestro.md`: `audit: diagnose input=1` for the same 20,361 characters, about 5,503 tokens by the repository's own 3.7 characters per token (token-estimator.ts:22). `audit: refine input=1` for four calls totalling 16,147 characters.

The first clause holds. The MCP server imports `appendAudit` but never calls it: `grep -rn appendAudit mcp-server/src` finds only tools.ts:11.

**F18. Line 135. OVERSTATED.** Level 3 (mocked).
> "Costs and token counts are estimates (~): costs are useful for trends, not for invoicing; token counts are for the context budget, not for billing."

Input is recorded as 0 or 1 token (F17), so the recorded cost is in effect output tokens × the default $8 per million. Examples: /teach-maestro with 84 output tokens gives `0.0007` (84 × 8 / 1e6 = 0.000672), and /diagnose with 252 gives `0.002`. A trend in these figures is a trend in reply length. Neither the repeated calls (3 to 4 model calls per wave command, C5/C6) nor the model used changes them.

**F19. Line 140. OVERSTATED.** Level 2.
> "[Extension](maestro-extension/README.md) — its sidebar, command palette, and settings"

The extension README has nothing on the command palette: `grep -ci palette maestro-extension/README.md` returns `0`. It covers the sidebar (:18-22) and settings (:106-111).

**F20. Line 141. OVERSTATED.** Level 2.
> "[MCP server](mcp-server/README.md) — each client's settings, HTTP, and everything the server offers"

The README has settings for three clients only (mcp-server/README.md:21, 34, 47), as in F9.

**F21. Line 142. OVERSTATED.** Level 2.
> "[Changelog](CHANGELOG.md) — what changed in each version"

CHANGELOG.md has entries for 2.0.0, 1.4.2 and 1.3.1 only (`grep -n '^## \[' CHANGELOG.md` returns :5, :57, :71). The shipped extension and MCP server are at 2.0.1, which has no entry (maestro-extension/package.json:5, mcp-server/package.json:3, mcp-server/src/version.ts:2). Extension versions 1.0.0, 1.3.0, 1.4.0 and 1.4.1 appear only in maestro-extension/CHANGELOG.md.

**F22. Line 148. UNDERSTATED.** Level 3.
> "After a change, run `npm run check`, then `npm run build`, which copies the skills into the ten skills folders of this clone so you can try the change there with a coding agent — it installs into no other project."

The build deletes each of the ten folders before copying (scripts/build.js:46-50, 76-80: `fs.rmSync(dir, { recursive: true, force: true })`), so any other skill in the clone's `.claude/skills/` and the other nine is lost. C1 seeded `.claude/skills/my-own-skill/SKILL.md`, then:
- `ls $W/snap/.claude/skills | grep -c .` gave `26` before the build and `25` after it;
- `ls -d .../my-own-skill` gave `No such file or directory`.

**F23. Line 148. OVERSTATED.** Level 2.
> "To contribute: `source/skills/` is the only place to edit."

This holds for editing an existing skill's text. A command added or renamed there does not appear in the extension without edits elsewhere:
- The palette commands and the `@maestro` slash commands are listed by hand (maestro-extension/package.json:55-173, :181-278).
- The sidebar shows only the names hardcoded for each category (maestro-extension/webview-ui/src/components/command-list.tsx:7-49, filtered at :82-84).

## Claims reached at level 1 only

- **Lines 9 and 21:** that Claude Code, Cursor, Gemini CLI, Codex, Kiro, Trae, OpenCode, Pi and Antigravity load skills from these folders. The code only writes the folders (scripts/build.js:14-25; maestro-extension/src/extension.ts:197-208).
- **Lines 21 and 33:** that `npx skills` installs into this project, chooses the agent's folders itself and writes `skills-lock.json` there. It is an outside tool, and I did not run it, because `npx skills add sharpdeveye/maestro` fetches the repository from GitHub, which the brief excludes. The only trace in the repository is its own `skills-lock.json` (22 entries, source `sharpdeveye/maestro`, sourceType `github`).
- **Line 22:** that the extension runs in Cursor, Antigravity and Windsurf, and whether those editors offer the chat-participant and language-model APIs the `@maestro` route needs (participant.ts:38-40, 127-133). Windsurf is detected as `vscode` (adapters/editor.ts:22-27).
- **Line 37:** which agent reads which folder, for example `.agents/skills/` for Antigravity or `.trae-cn/skills/` for Trae. The folder names match scripts/build.js:14-25, but no code maps them to agents.
- **Line 50:** that VS Code installs from the Marketplace and Cursor, Windsurf and Antigravity from Open VSX. The repository publishes to Open VSX on `ext-v*` tags (.github/workflows/build-extension.yml:50-54) and to the Marketplace through a manual `vsce publish` script (maestro-extension/package.json:313). Which registry each editor uses is outside the code.
- **Line 55 (Claude Code):** whether Claude Code reads `.claude/mcp.json`, where the extension writes its entry "Claude Desktop / Claude Code" (mcp-config.ts:23-24).
- **Line 70:** that Claude Desktop reads `claude_desktop_config.json` and Cursor reads `.cursor/mcp.json`. This matches mcp-server/README.md:21 and :34, but it is client behaviour.
- **Line 83:** that Antigravity uses VS Code's `servers` form. mcp-server/README.md:47 and mcp-config.ts:25-26 say so, but Antigravity's actual format is outside the code.
- **Line 139:** that maestroskills.dev is an "Interactive showcase and documentation". I did not open it, since the brief excludes it. It appears only as the extension's homepage (maestro-extension/package.json:14).
