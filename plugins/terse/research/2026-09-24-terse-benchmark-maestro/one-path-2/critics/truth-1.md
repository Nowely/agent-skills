<!-- truth-1; 24.0 min; 74 tool uses -->

Three sentences in lines 1–48 of $TMPDIR/terse-bench-D2/writer/01-draft.md fail: two refuted, one overstated. Nothing else in the range was refuted. The only claims I could not check are about third-party tools, such as Cursor and Antigravity using Open VSX.

How I checked: everything ran on a copy of the snapshot in $TMPDIR/truth1-D2-work.
- **Extension:** bundled with esbuild and run against a fake `vscode` module (`harness/run.js`, `harness/run-chat.js`).
- **Sidebar:** its real source rendered in jsdom (`harness/webview-click.js`).
- **`npx skills add`:** pointed at the local copy, never at the GitHub slug.

No live agent sessions were run, so any claim about what a skill makes the model do stops at level 2.

**1. Line 29 — "Its sidebar sends any command to the chat in one click." Refuted (guarantee word "any").**
- **Level 3, sidebar:** the first render shows 8 of the 24 commands. The Enhancement (8) and Utility (8) groups start collapsed (`webview-ui/src/components/command-list.tsx:63-68`). So 16 commands, among them /teach-maestro, /capture and /recap, need a click on their group first. One click on each visible card did send it (8 of 8).
- **Level 3, fake host:** each of the 24 commands reaches the editor's chat command (`extension.ts:261-310`):
  - VS Code: `workbench.action.chat.open` with `@maestro /<name>`
  - Cursor: the same command with `/<name>`
  - Antigravity: `antigravity.sendPromptToAgentPanel` with `/<name>`
- **Level 3, fake model:** in VS Code the "chat" is Maestro's own `@maestro` participant. It calls the model with no tools (`participant.ts:268`) and ignores chat history (`participant.ts:49`). An answer to /teach-maestro reached the model without the skill text, and no `.maestro.md` was written.
- **Shortest true:** cut. The Quick start doesn't need it, and in VS Code it sends /teach-maestro to a chat that cannot save `.maestro.md`. If kept: "Its sidebar sends a clicked command to the chat." (48 characters vs 55)

**2. Line 29 — "Each time you open a project, the extension writes Maestro's skills into it for every supported agent." Overstated (minor).**
- **What holds (level 3, fake host):** each activation writes 25 SKILL.md files into each of 10 folders (`.agents`, `.claude`, `.codex`, `.cursor`, `.gemini`, `.kiro`, `.opencode`, `.pi`, `.trae`, `.trae-cn`), 250 files in all. Running activation again restored a deleted skill and overwrote an edited one, so "each time" and "every supported agent" are true.
- **What doesn't:** only the SKILL.md text is bundled and written (`maestro-extension/scripts/bundle-skills.js:70-85`, `extension.ts:215-241`).
  - agent-workflow's 7 reference files are missing, though its SKILL.md still links them.
  - 12 commands tell the agent to consult those files: accelerate, amplify, calibrate, chain, compose, enrich, evaluate, fortify, guard, iterate, streamline, temper.
  - `npx skills add` on the same copy installs all 7.
- **Shortest true:** "Each time you open a project, the extension writes every SKILL.md into it for each supported agent." (99 characters vs 102)

**3. Line 7 — "`/diagnose` names the command for each gap, and each command suggests the next." Refuted by the guarantee rule: it reaches level 2, not 3.**
- **Level 2:**
  - `diagnose/SKILL.md:97` says "Every recommended action MUST reference the specific Maestro command".
  - All 24 command files have a "### Recommended Next Step" section. 23 name a /command; `recap/SKILL.md:60` points to its "Pick Up Here" list instead.
  - Nothing contradicts the sentence.
- **Level 3 was not attempted:** it needs a live agent run of each of the 24 commands.
- **Shortest true:** "`/diagnose` maps gaps to commands, and commands suggest the next." (65 characters vs 79)
- Line 51, outside this range, makes the same guarantee: "Each command ends by suggesting what to run next."

**Writes outside $TMPDIR:**
- The first esbuild and npm calls ran with my real HOME, so they wrote to the `~/.npm` cache.
- One Playwright attempt timed out while launching its browser, whose profile is in `~/Library/Caches/ms-playwright-mcp`. No page loaded, and I switched to jsdom.

Nothing else was written outside $TMPDIR. The local HTTP server I started is stopped.
