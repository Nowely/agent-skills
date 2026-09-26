<!-- check-truth; 19.8 min; 91 tool uses -->

Two of the 30 changed lines fail: line 6 is overstated and line 121 is refuted. The other 28 hold.

**Line 6: overstated (level 2).** "`/diagnose` maps the problems it finds to the commands that fix them."
- The map is at diagnose/SKILL.md:99-107, but two of its rows send a gap to a command that does not fix it:
  - :106 sends "Test coverage, golden tests, evaluation" to `/guard`. guard/SKILL.md:18-87 contains only input, output, cost and permission guards, with nothing on tests. The README's own line 78 gives that job to `/iterate`.
  - :107 sends "Architecture boundaries, observability" to `/calibrate`, which covers only naming, prompt style, errors and logs (calibrate/SKILL.md:20-48).
- Shortest true sentence: "`/diagnose` maps what it finds to Maestro commands."

**Line 121: refuted as a list of what gets written (level 3).** "…and with the extension, the command files for each coding tool and its server in `.vscode/mcp.json`."
- **Server goes to more files.** The extension also adds its server to `.claude/mcp.json` and `.agents/mcp.json` when they exist (mcp-config.ts:20-27, :49-64). Run: a project with only `.claude/mcp.json` got `maestro-workflow-mcp` added there, and `.vscode/mcp.json` did not appear until the next open.
- **`.vscode/mcp.json` is replaced, not added to.** When the entry already exists, `configured` stays false (:115-118), so :67-75 rewrites the whole file with only Maestro's server. Run: after I added `my-own-server` to `.vscode/mcp.json`, the next activation left only `maestro-workflow-mcp`.
- **Command files don't come only from the extension.** I ran `skills add` (skills 1.7.0, cli.mjs:2430) on a local copy of the snapshot from a scratch project. It wrote 25 skills to `./.agents/skills`, linked them into `./.claude`, `./.kiro`, `./.pi` and `./.trae`, and created `./skills-lock.json`.
- Shortest true sentence (29 words against 31): "What gets written to your project: `.maestro.md` from `/teach-maestro`, session notes and logs in `.maestro/`, command files per coding tool, and with the extension, its server in MCP configs."
- The overwrite is a code defect at mcp-config.ts:67. No sentence within the length limit can state it truthfully, so either the code gets fixed or the owner adds a separate warning.
- `CLAUDE.md` and the rules files are stated on line 119, so I did not count their absence from this line.

**Found in passing (no sentence change proposed):** the extension writes only `SKILL.md` for each skill (extension.ts:215-241, maestro-extension/scripts/bundle-skills.js:70-85). Run: `.claude/skills/agent-workflow` holds `SKILL.md` and nothing else. So an extension-only install lacks the seven guides named on line 113, and the 12 commands that tell the tool to consult a guide find none.

**Not verified:**
- The extension ran in plain Node against a mocked `vscode` API, not inside VS Code, Cursor or Antigravity. That it runs each time a project opens rests on package.json:32-34 (`onStartupFinished`).
- Line 16's install ran on a local copy, because the brief bars fetching from GitHub.
- Line 109: the server built from the copy offers 24 prompts for the 24 commands, and all 10 of its tools are listed in mcp-server/README.md. I did not check whether a given client shows MCP prompts, or whether the live npm page matches that README.
- Line 28: publishing to Open VSX is at build-extension.yml:53. Whether Cursor and Antigravity install from there is outside the snapshot.

**Rule breach:** my first npm installs and `npm view` calls wrote to the npm cache in `~/.npm`, outside $TMPDIR, before I switched to a scratch cache. Nothing else was written outside $TMPDIR, and the snapshot is untouched.

The scripts are in $TMPDIR/check-truth-D2.uthhl7/tools/: `run-ext.js`, `run-ext-ctx2.js`, `probe-mcp.mjs` and `run-skills.mjs`.
