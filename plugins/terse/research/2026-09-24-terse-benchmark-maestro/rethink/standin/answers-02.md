# Question set 02: decisions from the stand-in owner

I give each decision as the owner, with one reason. I say so wherever I take the default that was offered. Paths are relative to the snapshot. Besides the snapshot, I read only the run directory's `survey/synthesis.md`, together with the run's `document.md`, `purpose.md` and `owner-words.md`.

## 1. Order of the three routes

**Default taken:** skill files → extension → MCP server, in that order everywhere they are listed. A reader who has not chosen is sent to the **skill files** first.

Reason: the skill files are the product itself ("Source of truth: source/skills/", `scripts/build.js:4`), and they are the only route that reaches all ten tools. The extension serves the VS Code family only, and the MCP server serves MCP clients only.

## 2. The command inventory

**Default taken:** all 24 command names appear in the README, in four groups, in this order:

| Group | Commands |
|---|---|
| Analysis | `/diagnose`, `/evaluate`, `/reflect` |
| Fix & Improve | `/refine`, `/streamline`, `/calibrate`, `/fortify`, `/zero-defect` |
| Enhancement | `/amplify`, `/chain`, `/compose`, `/enrich`, `/guard`, `/iterate`, `/accelerate`, `/turbocharge`, `/temper` |
| Utility | `/teach-maestro`, `/onboard-agent`, `/adapt-workflow`, `/specialize`, `/extract-pattern`, `/capture`, `/recap` |

- The groups come from each skill's `category:` field in `source/skills/*/SKILL.md`.
- Take the order and the one-line descriptions from my Marketplace page's tables (`maestro-extension/README.md:58-102`), without their 🆕 marks.
- The frontmatter descriptions are written for the model ("Use when…"), not for the reader.

Reason: the purpose I gave in set 01 is that the reader finds the command for their next problem in the command table on this page. A link to the site would send them away to do it.

## 3. Memory layer and version

**Default taken:** the memory layer is presented as a capability of the product, with no version named. `CHANGELOG.md` keeps the history.

Reason: versions already drift between my manifests (root `package.json` 1.4.2, extension and MCP server 2.0.1, `@maestro/core` 2.0.0), and "new in 2.0" would be one more place to go stale.

## 4. The extension's effects on a workspace

**Default taken:** the effects are listed in full beside the extension route.

Reason: the extension makes these writes without asking, and its own README would not tell the reader about most of them. It mentions the skill sync (`maestro-extension/README.md:50`) and the `CLAUDE.md`/`.cursorrules` writes (`:28-32`). It says nothing about the MCP config entry, the Antigravity rules file under `.agents/rules/`, or `.maestro/` (I checked with grep).

## 5. Contributors

**Decision:** the default one line, with `npm run check` added beside `npm run build`. No full Contributing section.

Reason: `scripts/validate.js` is where the repo enforces skill frontmatter and my originality rule (`scripts/validate.js:49-68`). A contributor who edits `source/skills/` and skips it can break the rule I care most about.

## 6. The licence

**Default taken:** one line naming MIT, linking to `LICENSE`.

Reason: `LICENSE:1` reads "MIT License", and one line answers whether the reader may reuse the project.

## 7. Where a stuck reader goes

**Default taken:** a link to the repository's issues.

Reason: the snapshot names no other channel (no discussions, chat or support file; I checked with grep). The website is a showcase, not a help desk.

## 8. The MCP server's HTTP mode

**Default taken:** only the stdio command in the README, with a link to `mcp-server/README.md` for HTTP. This narrows item 3 of my set 01, which also listed the HTTP command.

Reason: HTTP mode is for hosting one server for others, which few readers of this page do. Its endpoint and health check are already documented in `mcp-server/README.md:61-69`.

## 9. Badges and a banner

**Decision (not the default):** the banner from `assets/` at the top, with alt text "Maestro — AI Workflow Fluency". Under it goes one row of live version badges for the VS Code Marketplace, Open VSX and npm.

Reason: both of my channel pages open with this banner (`maestro-extension/README.md:1-12`, `mcp-server/README.md:1-13`), and the front door should look like the same project. The badges are live, so they name no version that can go stale (see item 3).

## 10. The website

**Default taken:** maestroskills.dev is named once, in the words my other pages use: "Interactive showcase and documentation" (`maestro-extension/README.md:120`).

Reason: it is the extension's homepage (`maestro-extension/package.json:14`) and the sidebar's only outside link (`maestro-extension/webview-ui/src/App.tsx:75`), so readers meet it anyway. The README should say what they will find there.

## 11. Four more things to settle before a structure

### a. Tool names for the ten folders

Each folder is listed with its tool:

- `.claude`: Claude Code
- `.cursor`: Cursor
- `.gemini`: Gemini CLI
- `.codex`: Codex
- `.kiro`: Kiro
- `.trae` and `.trae-cn`: Trae (global and China editions)
- `.opencode`: OpenCode
- `.pi`: Pi
- `.agents`: Antigravity. The extension itself treats this as Antigravity's folder (`maestro-extension/src/adapters/mcp-config.ts:25-26`, `maestro-extension/src/adapters/editor.ts:111`).

Reason: readers look for the name of their tool, not for a folder.

### b. How each route runs the first two commands

- **Skill files:** type `/teach-maestro`, then `/diagnose`, in the agent's chat.
- **Extension:** run the same two from the Command Center sidebar, from the command palette ("Maestro: Teach — Generate .maestro.md" and "Maestro: Diagnose — Workflow quality audit", `maestro-extension/package.json:131,71`), or as `@maestro /teach-maestro` in VS Code's chat (`maestro-extension/README.md:34-42`).
- **MCP server:** pick them as prompts ("Select from your client's prompt picker", `mcp-server/README.md:90`), or ask for them by name. The agent then fetches them with `maestro_run_command` (`mcp-server/src/tools.ts:154-157`).

Reason: an MCP client shows the commands as prompts, not as the `/teach-maestro` a skills user types. The first-run block must not promise one interface for all three routes.

### c. What the first run produces

First a `.maestro.md` in the project root (`teach-maestro/SKILL.md:75`). Then `/diagnose` prints its report (`diagnose/SKILL.md:69-93`):

- five dimensions, each scored 1–5
- an overall score out of 25
- a Maestro command to run for each gap

Reason: the first-run block should end on something the reader can check.

### d. Installing the extension

The extension is installed by its ID, `sharpdeveye.maestro-workflow`, from the editor's Extensions view. VS Code gets it from the Marketplace. Cursor, Windsurf and Antigravity get it from Open VSX; that is why CI publishes there (`.github/workflows/build-extension.yml`). That last part is in my own words. There is no terminal command.

Reason: the ID and the two registry links are all the reader needs, and I would rather not add a command no one has run.
