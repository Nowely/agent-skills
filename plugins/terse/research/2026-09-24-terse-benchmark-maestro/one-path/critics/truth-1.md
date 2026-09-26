# truth-1: draft.md lines 1–38 against sharpdeveye/maestro @ 00f9115

Checked: `terse-bench-D/writer/draft.md` lines 1–38 against the snapshot `terse-bench/snapshot` (paths below are relative to it). Runs used copies under `$TMPDIR/truth1-work`; nothing was fetched from GitHub; the snapshot and the draft were not modified.

Levels: 1 the line resolves · 2 an independent reader of the code would say the same · 3 made to happen.

Runs (commands under Reproduction):

- **R1** The MCP server was built from the copy and driven over stdio with: initialize, prompts/list, tools/list, resources/list, prompts/get ×24 and tools/call `maestro_run_command` ×24. The tool calls used a project whose `.maestro.md` follows /teach-maestro's own template (`truth1-work/proj-ctx/.maestro.md`).
- **R2** The same server was packed with `npm pack` and started as `npx -y --package=<tgz> maestro-workflow-mcp`. The fresh install resolved `@modelcontextprotocol/sdk` 1.30.1.
- **R3** The extension was built from the copy with esbuild and activated against a mock `vscode` module in empty workspaces, under the app names VS Code, Cursor and Antigravity. It was also activated in a workspace holding that `.maestro.md`. There the `@maestro` handler was called for all 24 commands, with a mock model that records what it is sent.
- **R4** `skills@1.7.0` (the package `npx skills` resolves to) ran `skills add <local copy of the snapshot> --skill '*'` in an empty project folder. It ran again after one skill in the copy was edited. The local path stands in for `sharpdeveye/maestro`; the GitHub fetch itself was not run.
- **R5** npm's abbreviated metadata for `maestro-workflow-mcp` (that format carries no README).

## Sentence by sentence

- **L3** "24 slash commands": **confirmed, 3.**
  - R1: prompts/list returns 24, one per command, and no agent-workflow.
  - 24 of 25 SKILL.md have `user-invocable: true`; agent-workflow has `false` (source/skills/agent-workflow/SKILL.md:6).
  - The VS Code participant declares the same 24 (maestro-extension/package.json:181-278).
- **L3** "for the LLM workflows you build: prompts, tools, RAG, multi-agent setups": **confirmed, 2.**
  - Prompts: refine. Tools: chain and streamline. RAG: enrich/SKILL.md:3. Multi-agent: compose/SKILL.md:3.
- **L3** "Your agent can audit a workflow, fix what the audit finds, harden it for production or cut its cost": **confirmed, 2.**
  - Audit and fix: diagnose/SKILL.md:3 and its command mapping at :95-110.
  - Harden: fortify/SKILL.md:3 and guard/SKILL.md:3.
  - Cost: accelerate/SKILL.md:3 and :18.
- **L5** "Each command points to the next": **confirmed, 3, for the command text.**
  - R1, prompts/get ×24: all 24 texts have a "Recommended Next Step" section.
  - 23 of them name a command. /recap points to its own "Pick Up Here" list (recap/SKILL.md:60).
  - What the agent then says was not observed.
- **L5** "`/diagnose` maps each gap it finds to a command": **overstated, 2.**
  - The rule ties commands to the actions it recommends, not to gaps or findings: "Every recommended action MUST reference the specific Maestro command" (diagnose/SKILL.md:97; format at :109-110).
  - Findings and actions are separate lists (:84-92).
- **L5** "every command ends with the one to run next": **refuted.** "every" is a guarantee word, and it cannot reach level 3:
  - No code adds or enforces a next step. MCP prompts return the skill text unchanged (mcp-server/src/prompts.ts:21-40). The extension streams the model's text and records `next_step_surfaced: null` (maestro-extension/src/chat/participant.ts:268-274, :326).
  - In the texts themselves (R1 ×24), a NEVER list follows the next-step section every time.
  - Of the 24 next steps, 7 name one command and 7 a sequence, 9 offer a choice, and /recap names none. /diagnose's choice is "the command mapped to your lowest-scoring dimension" (diagnose/SKILL.md:132).
- **L6** "One interview records your models, constraints and priorities": **confirmed, 2.** teach-maestro/SKILL.md:22-26, :40-49, :53-75.
- **L6** "every command after it reads them first": **refuted, 3.**
  - R3, the `@maestro` chat: the model receives only a keyword-sliced part of `.maestro.md`. Workflow Architecture is always kept (packages/core/src/context-utils.ts:92-99, :186-213; participant.ts:69-91).
  - The model gets no tool to read the file itself: `sendRequest(messages, {}, token)` (participant.ts:195, :268).
  - With a file in /teach-maestro's template, across the other 23 commands:

    | Section | Missing for |
    |---|---|
    | Models & Providers | 15 commands |
    | Constraints | 14 commands |
    | Priorities | 13 commands |

  - Seven commands get none of the three: /calibrate, /extract-pattern, /iterate, /onboard-agent, /refine, /streamline and /temper.
  - R1: `maestro_run_command` with projectPath injects the same slice, with identical counts (mcp-server/src/tools.ts:198-208).
  - In the skills route it is only an instruction, level 2. All 23 commands say "Invoke /agent-workflow … Follow the protocol", and that protocol reads `.maestro/context.md` or `.maestro.md` (agent-workflow/SKILL.md:13-17).
- **L7** "`/compose` checks that one agent really fails before it designs several": **confirmed, 2.** compose/SKILL.md:17-27.
- **L7** "`/temper` strips what your requirements don't need": **confirmed, 2.**
  - temper/SKILL.md:18 and :33-38.
  - It keeps error handling, logging, validation, guardrails and golden tests regardless (:63-69).
- **L8** "Skill files for Claude Code, Cursor, Gemini CLI, Codex, Kiro, Trae, OpenCode, Pi and Antigravity, and an extension for VS Code": **confirmed, 2** (3 for Claude Code and for the extension's writes).
  - scripts/build.js:14-25 and extension.ts:197-208 write .agents, .claude, .cursor, .gemini, .codex, .kiro, .trae, .trae-cn, .opencode and .pi.
  - The code treats `.agents/` as Antigravity's folder (adapters/editor.ts:98-111, adapters/mcp-config.ts:25-26).
  - Cross-check: skills@1.7.0's agent table maps all nine tools to these skill folders (dist/cli.mjs:1453-2039).
  - Whether each tool actually loads them is outside the code.
- **L12/L15** "From your project folder: npx skills add sharpdeveye/maestro --skill '*'": **confirmed, 3, with the local path.**
  - R4 installed into the folder it ran in: `.agents/skills/` holding 25 skills, symlinks in `.claude/skills/`, and `skills-lock.json`.
  - The GitHub fetch was not run.
- **L18** "`--skill '*'` installs all 25 skills together": **confirmed, 3.**
  - R4 produced 25 folders, including agent-workflow with its 7 reference files; the lock file lists 25.
  - The CLI help says "use '*' for all skills" (dist/cli.mjs:8188).
- **L18** "every command loads the core one first": **refuted, 1 and 3.**
  - /teach-maestro does not load it: "No other preparation is needed — this IS the preparation" (teach-maestro/SKILL.md:10-12). The other 23 instruct it.
  - R1: none of the 24 MCP prompts contains the core text.
  - R3: the chat sends the core text to the model for none of the 24 commands.
- **L18** "To update, run the same command again": **confirmed, 3, for a local source.**
  - A marker added to the copy's diagnose/SKILL.md reached the installed file after the re-run.
  - The CLI printed "overwrites: …".
- **L26** "asks about your models, workflow, quality checks, constraints and priorities, one section at a time, and saves the answers as `.maestro.md`": **confirmed, 2.** teach-maestro/SKILL.md:20, :22-49, :75.
- **L26** "Run it once per project": **confirmed, 1.** teach-maestro/SKILL.md:3.
- **L32** "scores prompts, context, tools, architecture and safety from 1 to 5, lists the critical findings": **confirmed, 2.** diagnose/SKILL.md:16-67 and :84-87.
- **L32** "names the command to run for each. Run that one next.": **overstated, 2.**
  - Commands are named per recommended action (:89-92, :97, :109-110), not per finding.
  - The command to run next is the one for the lowest-scoring dimension (:132), which "that one" does not say.
- **L36** "install [Maestro — AI Workflow Fluency](…itemName=sharpdeveye.maestro-workflow)": **name and id confirmed, 1** (maestro-extension/package.json:2-6). For whether the listing exists, and for Cursor and Antigravity, see Unverifiable.
- **L36** "adds a command sidebar and `@maestro` in VS Code's chat": **confirmed, 3.**
  - R3: activation registers the webview view `maestro.commandCenter` in the Maestro activity-bar container (package.json:37-54).
  - It creates participant `maestro.chat`, named `maestro` (package.json:174-179).
  - The webview lists the commands and runs them (webview-ui/src/components/command-list.tsx:61-84).
  - The participant exists only where the chat API does (participant.ts:38-40).
- **L36** "writes the skills into your workspace": **confirmed, 3, with gaps the sentence does not mention.**
  - R3: 250 SKILL.md files, 25 skills × 10 folders (extension.ts:186-252), rewritten on every start (package.json:32-34).
  - Not said: the core skill's 7 reference files are not written, and `.vscode/mcp.json` is written too (see Observed in passing).
- **L37** "Any MCP client: add a server that runs `npx -y maestro-workflow-mcp`; the commands arrive as prompts": **refuted for "any", 3.**
  - R2: the server starts via npx and lists 24 prompts.
  - A `prompts/get` without `arguments` is rejected, although the MCP schema marks that field optional (SDK 1.30.1 dist/cjs/types.js:1033-1042). The error: "MCP error -32602: Invalid arguments for prompt diagnose: Required".
  - With `arguments: {}` the prompt comes back.
  - The same happens on the lockfile's SDK 1.29.0 (R1).
  - R5: npm's latest is 2.0.1, the same version as the snapshot, with bin `maestro-workflow-mcp`.
- **L37** "[Setup for each client]": **overstated, 1.**
  - The package README that npm shows (mcp-server/README.md:15-69; version 2.0.1 is npm's latest) covers Claude Desktop, Cursor and "VS Code / Antigravity", plus remote HTTP.
  - The live page was not fetched.

## Refuted and overstated: narrower sentences that would be true

1. **L5**, which says "`/diagnose` maps each gap it finds to a command, and every command ends with the one to run next." Narrower: "`/diagnose` is told to name a command for each action it recommends, and each command's instructions include a recommended next step."
2. **L6**, which says "every command after it reads them first." Narrower: "the other 23 commands tell the agent to read that file first; in the VS Code chat each command gets only the sections the extension matches to it."
3. **L18**, which says "every command loads the core one first." Narrower: "every command except `/teach-maestro` tells the agent to load the core one first."
4. **L32**, which says "names the command to run for each. Run that one next." Narrower: "lists the critical findings and recommends a command for each action. Start with the one for your lowest-scoring area."
5. **L37**, which says "Any MCP client: … the commands arrive as prompts." Narrower: "MCP clients: add a server that runs `npx -y maestro-workflow-mcp`; it lists the 24 commands as prompts and serves each command's instructions through its `maestro_run_command` tool."
6. **L37**, which says "Setup for each client." Narrower: "Setup for Claude Desktop, Cursor, VS Code and Antigravity."

## Unverifiable

- **L36 for Cursor and Antigravity.** The link points to the VS Code Marketplace.
  - The repo publishes to Open VSX on `ext-v*` tags (.github/workflows/build-extension.yml:50-53). It publishes to the Marketplace only through the local `publish` script (maestro-extension/package.json:313).
  - Hypothesis, not checked: Cursor and Antigravity install from Open VSX, so for them the link would not install.
  - The listings were not fetched, because store pages show the package README.
- **Agent-side behaviour of the instruction-level claims** (L3, L7, L26, L32). No agent was run, so level 2 is the ceiling.
- **Published artifacts.** Whether npm's 2.0.1 tarball matches the snapshot's build was not checked.

## Observed in passing (not claims of the draft)

- **The MCP server does not build from a clean checkout.**
  - `npm run build` fails with `Could not resolve "@maestro/core"` until packages/core is built. The package's main is `dist/index.js` (packages/core/package.json:6), and `dist/` is gitignored (.gitignore:6).
  - publish-mcp.yml:23-33 runs the same steps (level 2).
- **Activation replaces an existing `.vscode/mcp.json`** (R3, `ws-mcp`).
  - The file listed `my-db` and `maestro-workflow-mcp`; after activation it held only the Maestro entry.
  - Cause: an existing entry returns 'exists', which leaves `configured` false, and `createDefaultConfig` then overwrites the file (adapters/mcp-config.ts:49-75).
- **The core skill's links break in the extension's copies.** Its seven "Consult … reference" links point to files that are never written (extension.ts:215-241 writes SKILL.md only).

## Reproduction

Work directory: `/var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/truth1-work`, with `npm_config_cache=$W/npm-cache`. Environment: node 24.11.0, npm 11.6.1.

```
cp -R <snapshot> $W/snap; cp -R <snapshot> $W/src-maestro
npm ci --prefix $W/snap/mcp-server --ignore-scripts; npm run build --prefix $W/snap/mcp-server   # fails: @maestro/core
npm ci --prefix $W/snap/packages/core --ignore-scripts; npm run build --prefix $W/snap/packages/core
npm run build --prefix $W/snap/mcp-server                                                        # ok
REQS='[…]' node $W/drive-mcp.cjs node $W/snap/mcp-server/dist/index.js                           # mcp-lists.json, mcp-prompts.json, mcp-run.json
npm pack $W/snap/mcp-server --pack-destination $W/npx-test
REQS='[…]' node $W/drive-mcp.cjs npx -y --package=$W/npx-test/maestro-workflow-mcp-2.0.1.tgz maestro-workflow-mcp   # npx-run.json
npm ci --prefix $W/snap/maestro-extension --ignore-scripts; node $W/snap/maestro-extension/scripts/bundle-skills.js; node $W/snap/maestro-extension/esbuild.config.js
node $W/run-ext.cjs $W/ws-empty 'Visual Studio Code'            # mock: $W/mock-vscode.cjs
node $W/run-ext.cjs $W/ws-ctx 'Visual Studio Code' <24 commands>   # ext-chat-all.jsonl
npm pack skills@1.7.0 --pack-destination $W/skills-cli
DISABLE_TELEMETRY=1 DO_NOT_TRACK=1 node $W/run-in.cjs $W/proj-skills npx -y --package=$W/skills-cli/skills-1.7.0.tgz skills add $W/src-maestro --skill '*'   # run twice; skills-rerun.log
curl -H 'Accept: application/vnd.npm.install-v1+json' https://registry.npmjs.org/maestro-workflow-mcp   # npm-abbrev.json
```
