# truth-3: draft.md lines 85–104 checked against maestro at 00f9115

Levels: 1 = the line resolves, 2 = an independent reader of the code would say the same, 3 = I made it happen.

**How it was run.** The snapshot was copied to `$TMPDIR/truth3-run.OS6J2h/snap` (called W below), with npm's cache at `W/npm-cache`.
- **Root scripts:** `npm run build` and `npm run check` ran in the copy.
- **MCP server:** `npm ci` and `npm run build` in `mcp-server`. The build first failed with `Could not resolve "@maestro/core"`. It succeeded after `npm ci` and `npm run build` in `packages/core`. The server was then driven over stdio with the SDK client (`W/mcp-client.mjs`).
- **Extension:** `npm run bundle-skills` and `npm run build:ext`. `dist/extension.js` ran against a mock `vscode` module (`W/mockvscode/node_modules/vscode/index.js`) through `W/harness.js`. One "start" is one fresh `activate()` in a new process, with workspaceState kept in a JSON file.
- **Not run:**
  - real VS Code, Cursor or Antigravity (so level 3 for the extension means "under the mock");
  - any agent such as Claude Code (so whether an agent obeys a skill's text is not observed);
  - the webview UI.
- **Not fetched:** maestroskills.dev.
- **Integrity:** the SHA-256 of the snapshot tree and of the draft were identical before and after the runs.

## Refuted or overstated

1. **L87: "Every command except `/teach-maestro` loads it and reads `.maestro.md` before it starts." Overstated.**
   - **True as an instruction, level 3:** 23 of the 24 MCP prompts, and the matching 23 copies installed by `npm run build` and by the extension, contain "Invoke /agent-workflow … Follow the protocol before proceeding". teach-maestro does not (teach-maestro/SKILL.md:12). The protocol reads `.maestro/context.md`, otherwise `.maestro.md` (agent-workflow/SKILL.md:13-17).
   - **False for `@maestro`, level 3 under the mock:** `maestro-extension/src` never names agent-workflow (grep finds 0 hits). participant.ts:57-122 builds each request from these messages only: the Zero-Defect rules, a slice of `.maestro.md`, the command's skill and the user's prompt. `sendRequest(…, {}, …)` passes no tools (participant.ts:195, 268).
   - **Mock run:** across 8 commands, the core skill's body was in no model message. `.maestro.md` arrived sliced: `/refine`, `/chain` and `/compose` got 1 of its 5 sections, and `/diagnose` got 3.
   - **Not observed:** whether an agent actually loads the core skill.
   - **Narrower:** "Every command except `/teach-maestro` begins by telling the agent to load it and read `.maestro.md`; `@maestro` in VS Code skips the core skill and adds only the sections of `.maestro.md` that match the command."

2. **L90: "from the second start on it rewrites `.vscode/mcp.json` with Maestro's entry alone." The trigger is wrong in both directions.**
   - **The code:** mcp-config.ts:47-75 sets `configured` only when an entry is *added*. Otherwise `createDefaultConfig` overwrites `.vscode/mcp.json` (136-151).
   - **The usual case holds, level 3 under the mock:** a file holding `other-server` plus `inputs` kept both at start 1. At starts 2 and 3 it held only `maestro-workflow-mcp`.
   - **It can happen at the first start:** a `.vscode/mcp.json` with a `//` comment was replaced at start 1, because `JSON.parse` fails and the file is skipped.
   - **It can skip a later start:** in a workspace with `.claude/mcp.json`, a new empty `.agents/mcp.json` created before start 3 gained the entry, so a user-added server in `.vscode/mcp.json` survived start 3. It was dropped at start 4.
   - **Narrower:** "On any start where every MCP config it can parse already has its entry (normally every start after the first, and the first too if `.vscode/mcp.json` has comments), it replaces `.vscode/mcp.json` with Maestro's entry alone."

3. **L92: "and logs each command under `.maestro/`". Refuted for a stopped wave, level 3 under the mock.**
   - **The code:** participant.ts:180-184 and 199-203 return without calling `emitAudit`.
   - **The run:** `/diagnose` and `/fortify` stopped during phase 2 added 0 lines to `audit.jsonl` and 0 to `decisions.jsonl`. A completed `/diagnose` added 1 to each.
   - **A stopped single-shot command is logged wrongly:** it gets `"exit_status":"completed"` (the `break` at participant.ts:271, then 276-277).
   - **Narrower:** "and logs each command that finishes or fails to `.maestro/audit.jsonl` and `.maestro/decisions.jsonl`."

4. **L102: "`npm run build` # regenerates the ten agent folders from source/skills/, deleting what was in them". Overstated, level 3.**
   - **The code:** the targets are `<folder>/skills` (build.js:14-25), and `cleanDir` removes only those (build.js:77).
   - **The run:** before the build I seeded `.claude/settings.json`, `.cursor/rules/x.mdc` and `.claude/skills/my-own-skill/SKILL.md`. After it, the first two were still there and `my-own-skill` was gone. Each `skills/` then held 25 skills, 7 references and `.markdownlint.json`.
   - **Narrower:** "# regenerates skills/ in the ten agent folders from source/skills/, deleting whatever was in each skills/"

5. **L103: "`npm run check` # validates each skill's frontmatter and reference links". Overstated, level 3.**
   - **The code:** the frontmatter test checks only that the file starts with `---`, has a closing `---`, and contains the substrings `name:` and `description:` (validate.js:36-55). The link test matches only `](reference/…)` (validate.js:71).
   - **The run:** on a mutated copy I planted 7 defects and the check caught 1 (a broken `(reference/…)` link).
   - **Defects that passed:**
     - guard with no `name` key ("name:" appeared only inside its description);
     - temper with a `name` that differs from its folder;
     - turbocharge with an unterminated quote;
     - links to missing files written as `./reference/…` and `../agent-workflow/reference/…`.
   - **Narrower:** "# checks each skill's frontmatter mentions name: and description:, and that its (reference/…) links resolve"

6. **Minor. L99: "The extension and the MCP server bundle that folder when they build". Overstated for the extension, level 3.**
   - maestro-extension/scripts/bundle-skills.js:70-85 reads only `<skill>/SKILL.md`. It printed "25 skills bundled", against the MCP bundler's "25 skills, 7 references bundled".
   - An extension start wrote 0 reference files into all ten folders, so the core skill's 7 `reference/` links point to nothing.
   - **Narrower:** "The MCP server bundles that folder when it builds and the extension bundles its SKILL.md files; the root scripts work from it:"

7. **Minor, incomplete lists.**
   - **L88 "What the skills write."** `/calibrate` also updates `.maestro.md` (calibrate/SKILL.md:56, 73).
     - Narrower: "`/teach-maestro` writes `.maestro.md` and `/calibrate` adds conventions to it; `/capture` adds …"
   - **L93 "ten tools: …"** The list covers 9 of the 10. `maestro_init` is missing: it returns a `.maestro.md` template and writes nothing (tools.ts:275-285; run: the existing `.maestro.md` was left unchanged).
     - Narrower: "…read the project context or draft one, …"

## Confirmed

- **L87 "One core skill."** Level 1 (agent-workflow/SKILL.md:4-6). A frontmatter scan found 24 skills with `user-invocable: true` and one, agent-workflow (`category: core`), with `false`.
- **L87 "`agent-workflow` holds the principles, a checklist of common workflow flaws and seven references: …"**
  - Principles and checklist, level 1: Core Principles at agent-workflow/SKILL.md:38-44, and "The Workflow Slop Test" (10 items) at 202-217.
  - The seven references, level 3: `npm run check` lists the 7 files, and the MCP `resources/list` returns 7 `maestro://reference/*` entries with the same names.
- **L88 "`/teach-maestro` writes `.maestro.md`; `/capture` adds a session summary and a decision-log entry under `.maestro/`."** Level 1: teach-maestro/SKILL.md:53, 75 and capture/SKILL.md:30, 58. No agent was run.
- **L90 "On every start it writes the 25 `SKILL.md` files into ten agent folders in your workspace (…)"** Level 3 under the mock.
  - Activation is `onStartupFinished` (maestro-extension/package.json:32-34).
  - Three successive starts each reported "25 skills synchronized across 10 AI providers". After the first, each of the ten `<folder>/skills/` held 25 SKILL.md files.
  - A `diagnose/SKILL.md` edited between starts was restored, and a user's own skill folder was kept.
  - **Limits:**
    - it needs an open folder (a start with none wrote nothing);
    - it writes into the first folder only (extension.ts:194);
    - it writes SKILL.md files only (see item 6).
- **L90 "adds its MCP server to the workspace's MCP config"** Level 3 under the mock. It created `.vscode/mcp.json` in an empty workspace. It added its entry to an existing `.vscode/mcp.json` and to an existing `.claude/mcp.json`.
- **L91 "Its sidebar sends any command to chat and switches Zero-Defect mode."** Level 3 under the mock.
  - `run-command` sent 24 of 24 commands in each editor:
    - VS Code: `workbench.action.chat.open` with `@maestro /<cmd>`;
    - Cursor: the same command with `/<cmd>`;
    - Antigravity: `antigravity.sendPromptToAgentPanel`.
  - The webview's list (command-list.tsx:7-49) is exactly the 24 invocable skills. This is level 2: I compared the list with the frontmatter and did not render the UI.
  - Two toggles flipped the state true, then false.
- **L91 "Turning that on writes the precision rules into `CLAUDE.md`, and also into `.cursorrules` in Cursor or a rule file in Antigravity."** Level 3 under the mock.
  - The first toggle put the marked block in `CLAUDE.md` in all three editors.
  - It also put the block in `.cursorrules` in Cursor.
  - In Antigravity it wrote `.agents/rules/maestro-zero-defect.md` with `trigger: always_on`.
- **L92 "In VS Code, `@maestro` runs `/diagnose`, `/evaluate`, `/fortify`, `/refine`, `/chain` and `/compose` in checked phases"** Level 3 under the mock.
  - Model calls were 3, 3, 4, 4, 4 and 4, with a gate line after each phase. `/guard` and `/capture` made 1 call each.
  - A failed check does not stop the wave. `/compose` given the output "ok" failed its MAP check with 2 issues and still ran to "Wave complete".
- **L92 "adds the precision rules to every request while Zero-Defect is on"** Level 3 under the mock. Nine requests made 25 model calls, counting each wave phase and a plain prompt. All 25 began with the Zero-Defect message.
- **L93 "The 24 commands as prompts, the core skill and its references as resources, and ten tools: …"** Level 3 over stdio.
  - There are 24 prompts, 8 resources and 10 tools.
  - `maestro_list_commands` lists 24.
  - `maestro_run_command` returns the skill text together with the `.maestro.md` content.
  - `maestro_read_context` reads `.maestro.md`.
  - `wave_start` / `wave_advance` / `wave_status` step through phases.
  - `maestro_write_decision` appended 1 line to `.maestro/decisions.jsonl`.
  - `maestro_read_decisions` and `maestro_read_audit` answered.
  - The list is incomplete; see item 7.
- **L99 "Skills live in `source/skills/`; edit them there and nowhere else."** Level 3.
  - The build wipes and recopies `<folder>/skills` (item 4).
  - The extension rewrites the workspace's SKILL.md files on every start.
  - Both bundles are headed "AUTO-GENERATED … DO NOT EDIT" (scripts/bundle-skills.js:118, maestro-extension/scripts/bundle-skills.js:93).
- **L99 "the root scripts work from it"** Level 1 and 3. build.js:11, validate.js:10 and bundle-skills.js:13 all set `SOURCE_DIR` to `source/skills`, and both `npm run build` and `npm run check` ran from it.

## Unverifiable

- **L95 "Showcase and documentation: maestroskills.dev."** This is not a behaviour. The URL matches the extension's `homepage` (maestro-extension/package.json:14) and the sidebar's footer link (App.tsx:75-79). I did not fetch the site, because it may quote the README, which the brief forbids.

## Seen in passing, not claimed by the draft

- **Turning Zero-Defect off leaves the rules in place** in `CLAUDE.md` or `.cursorrules` when the file holds nothing else. editor.ts:68 skips the write when the remaining text is empty. Run: with no prior `CLAUDE.md`, the block remained after the second toggle.
- **In a clean checkout, `mcp-server`'s `npm run build` fails** until `packages/core` has been built.
- **The core skill served over MCP ends with an unresolved `{{available_commands}}`** (agent-workflow/SKILL.md:225).
- **The setting `maestro.zeroDefectAutoInject` is declared** (maestro-extension/package.json:284-288) **but never read.**
