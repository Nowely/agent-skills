<!-- truth-3; 18.1 min; 71 tool uses -->

Three sentences in lines 97–133 don't hold up: lines 116, 121 and the second sentence of 124. Every other behaviour sentence in that range checked out; the list is at the end.

S = $TMPDIR/terse-bench/snapshot

**Line 116, second sentence: overstated**
> All but `/teach-maestro` first load `agent-workflow`, the core skill, and read your `.maestro.md`.
- **What the files say (level 3):** 23 of the 24 commands open with "Invoke /agent-workflow". `teach-maestro` never mentions it. I checked this with a script over S/source/skills/*/SKILL.md.
- **What `@maestro` does (level 3):** it never loads the core skill, and the sidebar in VS Code goes through `@maestro`. I ran /guard through the extension against a stand-in VS Code API. The request carried the guard skill and a slice of `.maestro.md`, but no core-skill text ("## Core Principles" and "The Workflow Slop Test" were both absent).
  - Cause: S/maestro-extension/src/chat/participant.ts:93-101 sends only `skills.getContent(request.command)`.
  - `agent-workflow` appears nowhere in S/maestro-extension/src outside `generated/`.
- **Shortest true sentence:** "All but `/teach-maestro` tell your agent to load `agent-workflow`, the core skill, first." (89 vs 98 chars. Line 39 already says the commands read `.maestro.md` first.)

**Line 121: "each" refuted, "the editor's chat model" overstated**
> …runs a command on the editor's chat model with your project context and logs each run in `.maestro/` for `/reflect`.
- **"logs each run" is refuted (level 3).** A wave command (/diagnose, /evaluate, /fortify, /refine, /chain, /compose) cancelled mid-run writes nothing. A cancelled /diagnose added 0 lines to `.maestro/audit.jsonl`.
  - Cause: participant.ts returns at 184 and 202 on cancellation. `emitAudit` is called only at 237, 244, 250, 277, 282 and 290.
- **"the editor's chat model" is overstated.** participant.ts:127 and :134 take `vscode.lm.selectChatModels({})[0]` and never read `request.model`. The VS Code API documents `request.model` as "the model that is currently selected in the UI" (@types/vscode 1.95.0, index.d.ts:19118).
  - Level 3 that the user's pick is ignored: in the stand-in run I set `request.model` to the second model, and the first model ran.
  - Level 2 that VS Code's first-listed model differs from the user's pick; not run in real VS Code.
- **Shortest true sentence:** "- **`@maestro` in VS Code's chat**, which runs a command on a VS Code chat model with your project context and logs runs in `.maestro/` for `/reflect`." (151 vs 158 chars)

**Line 124, second sentence: overstated twice**
> The extension also writes the skills into each agent's folder (…), its server entry into your MCP config, and the Zero-Defect rules into …
- **The skills (level 3).** Only each skill's SKILL.md is written. The core skill's seven reference guides are not, so its seven `reference/*.md` links point at nothing. All ten folders got 25 SKILL.md files and no reference guides.
  - Cause: S/maestro-extension/scripts/bundle-skills.js:64-88 bundles SKILL.md bodies only, and S/maestro-extension/src/extension.ts:215-241 writes only SKILL.md.
- **The MCP config (level 3).** It always writes `.vscode/mcp.json`. It adds itself to `.claude/mcp.json` and `.agents/mcp.json` only if they already exist, and never touches `.cursor/mcp.json`, which S/mcp-server/README.md:34 names as Cursor's file.
  - From the second start it replaces `.vscode/mcp.json` with its own entry alone. The servers went from ["my-db","maestro-workflow-mcp"] after the first start to ["maestro-workflow-mcp"] after the second.
  - Cause: S/maestro-extension/src/adapters/mcp-config.ts:58-60 sets `configured` only when it adds an entry. When the entry already exists, lines 66-75 fall back to `createDefaultConfig`, which overwrites the file (136-151).
- **The Zero-Defect part is correct (level 3).** It writes to `CLAUDE.md` always, to `.cursorrules` in Cursor, and to `.agents/rules/maestro-zero-defect.md` in Antigravity.
- **Shortest true sentence:** "The extension writes the skills, minus reference guides, into ten agent folders, its server into `.vscode/mcp.json`, replacing that file on later starts, and the Zero-Defect rules into `CLAUDE.md` and Cursor's or Antigravity's rules file." (238 vs 240 chars, 34 vs 34 words)

**Confirmed, not returned:**
- **Line 99 and the config block (level 3):** the server starts over stdio, and also through `npx -y maestro-workflow-mcp` from the locally packed package.
- **Line 112 (level 3):**
  - 24 prompts, one per command; 8 resources (the core skill and 7 guides); 10 tools, all exercised.
  - The published README, the snapshot's mcp-server/README.md (npm pack puts it in the package), names all 10 tools and `--http`, and HTTP mode answered. I did not fetch the live npm page.
  - "Registers the server" holds in VS Code; I couldn't run Cursor.
- **Line 116, sentences 1 and 3 (level 3).**
- **Line 120 (level 3):** in VS Code, all 24 sidebar commands reach the chat as `@maestro /cmd`. The Cursor and Antigravity paths are level 2.
- **Line 122 (level 3):** the Zero-Defect rules come first in every model request (single-shot, each wave phase, no command), and the `CLAUDE.md` block is written.
- **Line 124, sentence 1:** level 3 for the logs, level 2 for the files the agent is told to write.
- **Line 128 (level 3):** an edit made in `.claude/skills` was wiped by the build, and all three bundlers read `source/skills`.
- **Line 131 (level 3):** 25 of 25 SKILL.md files checked.
- **Line 132 (level 3):** 10 folders × 25 skills.

**How I ran it:** everything ran in a copy at $TMPDIR/truth3-work/snap, and the snapshot itself is unchanged.
- The extension ran in Node against a stand-in `vscode` module: truth3-work/harness.cjs and harness2.cjs, with NODE_PATH=truth3-work/fake/node_modules.
- The MCP server was probed with truth3-work/mcp-probe.mjs and npx-probe.mjs.
- From a clean copy, the mcp-server build fails with "Could not resolve @maestro/core" until packages/core is compiled, so I compiled it in the copy.

**Deviation from the brief:** `npm ci` and `npm pack @types/vscode` used the default npm cache in ~/.npm, which is outside $TMPDIR. The later npx run used a cache under truth3-work.
