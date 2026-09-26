# Writer report: README for sharpdeveye/maestro (arm D) — as returned by the writer

The writer could not save this file itself ("Subagents should return findings as text, not write report files", a harness refusal on the name `report.md`); the coordinator saved its returned text here, unchanged in substance.

Text: `$TMPDIR/terse-bench-D/writer/draft.md`. S = the snapshot; X = `$TMPDIR/terse-bench-D-scratch` (all runs and copies). Levels: 1 the line resolves; 2 an independent reader of the code would say the same; 3 the behaviour was made to happen.

## Plan

| # | Section | What it gives the reader | Device | Budget | Actual |
|---|---|---|---|---|---|
| 1 | Title and opening | What Maestro is and what it's for: slash commands for the LLM workflows the reader builds | H1 plus a two-sentence paragraph; no protocol names, no warnings | 45 | 40 |
| 2 | Advantages | Why use it rather than asking the agent ad hoc: chained commands, project context, guards against over-building, fits their tool | Bold-led list, 4 items | 90 | 95 |
| 3 | Quick start | One install to copy; first use (`/teach-maestro`, then `/diagnose`) and what each returns; update in one line; the other two routes, one line each | H2, `bash` and `text` fences, bold-led "Other routes" list | 150 | 144 |
| 4 | Commands | Find the command for the next problem | 4 tables under H3s, grouped by the code's categories; columns: command, what it does, when to use it; 24 rows | 460 | 467 |
| 5 | How it works | The core skill, what the skills write, what the extension writes and does, what the MCP server exposes, and the link to the website | Bold-led bullets; sub-bullets for the extension | 200 | 220 |
| 6 | Contributing | `source/skills/` is the only place to edit skills; how to build and check | One sentence plus a `bash` fence with comments | 55 | 55 |

Default route: `npx skills add sharpdeveye/maestro --skill '*'` — native skills for every tool in the reader profile; the MCP route gives the commands as prompts instead.

## Rules set aside, with reasons

- Rule 15, bent: what gets written is stated in two places of How it works (skills; extension), plus `.maestro.md` in Quick start as what `/teach-maestro` returns (rule 7). One line cannot truthfully hold everything the extension writes, and a reader choosing that route needs to know `.vscode/mcp.json` loses its other entries. Rule 20 wins.
- Rule 14, set aside twice: the MCP route line keeps `npx -y maestro-workflow-mcp` inline, because rule 8 wants other routes on one line; the inventory tables name commands, nobody runs them from the table.
- Rule 5, narrowed: the four items say what Maestro does, with no claims about alternatives, which nothing in the inputs surveys (rule 20).
- Rule 3's check, done by the writer in the absence of a rationalizer: kept `.maestro.md` (what the first command produces and every later command reads); kept `--skill '*'` (without it the installer's picker starts empty, `cli.mjs:5318-5328`, and a partial pick breaks the commands); kept "MCP" in the route line (it names the route); kept `npx -y maestro-workflow-mcp` (the setting the client needs); no versions, no Node prerequisite.
- Rule 9 used as one line; every other rule followed as written.

## Runs (all in copies under X; npm and npx with HOME=X/home and npm_config_cache=X/npm-cache)

- R1, skills CLI 1.7.0 on a local copy of the snapshot (GitHub not fetched): `--list` → "Found 25 skills"; `-a claude-code -y` → 25 skills in `.claude/skills/` including `agent-workflow/reference/` (7 files), plus `skills-lock.json`; `--skill '*' -a cursor` → "Installing all 25 skills"; update test with a marker: `skills update -y` → "No project skills to update", re-running `add` → the marker appeared; copy restored, `diff -r` identical to S. Valid agents include antigravity, claude-code, codex, cursor, gemini-cli, kiro-cli, opencode, pi, trae.
- R2, root scripts: `npm run build` → "10 providers x 25 skills", each with 7 references; a pre-seeded `.claude/skills/my-own-skill` was deleted; `npm run check` → 0 errors, 0 warnings.
- R3, MCP server built from a copy: the build FAILS ("Could not resolve @maestro/core") until `packages/core` is built; a stdio SDK client saw 10 tools, 24 prompts (no `agent-workflow`), 8 resources; `maestro_init` writes nothing; two `maestro_write_decision` calls → `.maestro/decisions.jsonl` (2 lines) plus `sessions/` and `.gitignore`; `read_audit` → no data; a wave for `diagnose` → map, validate, report; `guard` → an error listing 6 supported commands.
- R4, published packages: `npm view maestro-workflow-mcp` → 2.0.1; an `npx -y maestro-workflow-mcp` probe → server 2.0.1 with 10 tools, 24 prompts, 8 resources; `code --extensions-dir X/vsc-ext --user-data-dir X/vsc-user --install-extension sharpdeveye.maestro-workflow` → v2.0.1, its manifest matching S (its readme not opened); Open VSX API → 2.0.1.
- R5, the extension's `activate()` under a mock `vscode` module, bundled from the copy's `src/`: start 1 → 10 folders × 25 `SKILL.md`, no `reference/`, the user's own skill kept, `.vscode/mcp.json` = other-server + maestro; start 2 → the user's edit to Maestro's `diagnose` overwritten, own skill kept, `.vscode/mcp.json` = maestro only. With only `.claude/mcp.json` present, start 1 adds there and start 2 creates `.vscode/mcp.json` with maestro only; with no MCP config, start 1 creates `.vscode/mcp.json`. Zero-Defect: no prior `CLAUDE.md` → on writes the block, off leaves it; own `CLAUDE.md` → on appends, off removes the block and keeps own text; Cursor adds `.cursorrules`; Antigravity adds `.agents/rules/maestro-zero-defect.md`. `@maestro /recap` and `/diagnose` → 2 lines each in `.maestro/audit.jsonl` and `decisions.jsonl`; the sidebar sends `@maestro /diagnose` (VS Code), `/diagnose` (Cursor), the agent panel (Antigravity). With Zero-Defect off the rules are absent from model requests; on, present in all 4. A mock, not VS Code: it proves the extension's own code paths only.

## Claims and evidence (draft line → source)

| Line | Claim | Evidence | Level |
|---|---|---|---|
| 3 | 24 slash commands | 24/25 `SKILL.md` `user-invocable: true`; R3 24 prompts | 3 |
| 3 | audit, fix, harden, cut cost | `diagnose:3`, `fortify:3`, `guard:3`, `accelerate:3` | 1 |
| 5 | `/diagnose` maps each gap to a command | `diagnose:95-110` | 1 |
| 5 | every command ends with the next one | "Recommended Next Step" in 24/24; `recap:58-60` | 1 |
| 6 | the interview records models, constraints, priorities | `teach-maestro:22-49` | 1 |
| 6 | every command after it reads them first | 23/23 other commands "Invoke /agent-workflow …"; `agent-workflow:13-17`; instruction only | 1 |
| 7 | `/compose` checks first; `/temper` strips | `compose:19-27`; `temper:3,20,42-56` | 1 |
| 8 | skill files for 9 tools; VS Code extension | `build.js:14-25`; R1 agent list; `maestro-extension/package.json:2-6` | 2 |
| 15 | install command | R1 (local copy); the GitHub form not run | 3 local / 2 GitHub |
| 18 | `--skill '*'` installs all 25 | `cli.mjs:5280-5282`; R1 | 3 |
| 18 | to update, run the same command again | R1 marker test (local) | 3 local |
| 26 | five sections, one at a time; saves `.maestro.md`; once per project | `teach-maestro:3,18-49,20,53-75` | 1 |
| 32 | 1–5 scores, critical findings, a command per gap | `diagnose:16-67,84-92,95-110,130-132` | 1 |
| 36 | Marketplace link; sidebar; `@maestro`; writes the skills | `maestro-extension/README.md:5`; R4; `package.json:36-54,174-280`; `participant.ts:37-45`; `extension.ts:186-252`; R5 | 3 |
| 37 | `npx -y maestro-workflow-mcp` gives the commands as prompts | R4; `mcp-server/README.md:15-69`; `mcp-server/package.json:46-50` | 3 / 2 |
| 41–83 | groups and rows | frontmatter `category:`; `tools.ts:19-27`; per-row skill lines; "when" from each `description:` | 1 |
| 87 | core skill; every command but `/teach-maestro` loads it and reads `.maestro.md` | `agent-workflow:38-44,48-198,202-217`; 7 references; the 23/23 grep | 1 |
| 88 | `/teach-maestro` and `/capture` writes | `teach-maestro:75`; `capture:30,58`; instruction only | 1 |
| 90 | every start writes 25 `SKILL.md` into 10 folders; adds the MCP server; from start 2, `.vscode/mcp.json` has Maestro alone | `package.json:32-34`; `extension.ts:38-42,194-241`; `mcp-config.ts:20-27,38-82,136-151`; R5 | 3 |
| 91 | sidebar sends commands, toggles Zero-Defect; `CLAUDE.md`, `.cursorrules`, Antigravity rule | `provider.ts:41-56`; `editor.ts:33-121`; R5 | 3 |
| 92 | phased `@maestro` for 6 commands; rules on every request while on; logs | `wave-engine.ts:49-61`; `participant.ts:57-67,142-148,295-341`; R5 | 3 |
| 93 | 24 prompts, 8 resources, 10 tools | `tools.ts:145-507`; `prompts.ts:8-44`; `resources.ts:7-57`; R3, R4 | 3 |
| 95 | maestroskills.dev is the showcase and docs | `maestro-extension/README.md:120`; `package.json:14`; `App.tsx:75`; not fetched | 1 |
| 99 | skills live in `source/skills/`; the bundles and scripts use it | `build.js:4,11`; `validate.js:10`; both `bundle-skills.js`; R3, R5 | 3 |
| 102 | build regenerates the 10 folders, deleting what was there | `build.js:46-50,72-83`; R2 | 3 |
| 103 | check validates frontmatter and reference links | `validate.js:35-78`; R2 | 3 |

## The owner's requirements, checked as claims (rule 23)

25 skills = 1 core + 24 commands plus 7 reference files: true, the 7 belong to the core skill. Three routes: true. `/teach-maestro` once, then `/diagnose`: true (`teach-maestro:3,96`). Links to the Marketplace, npm and maestroskills.dev: done; the website not fetched. "`source/skills/` is the only place to edit": true for skill content; narrowed to "Skills live in `source/skills/`". The purpose's file:line quotes: every one resolves; none went back to the owner as false.

## Not verified

`npx skills add` against GitHub (forbidden by the brief; the same CLI run on a local copy); `skills update` for a GitHub source; agent-driven skill behaviour (`/teach-maestro`, `/capture`, `/recap`), instruction lines only; real VS Code, Cursor and Antigravity, mock only; maestroskills.dev not fetched. Side effects: nothing newer under `~/.vscode`, `~/Library/Application Support/Code`, `~/.npm/_cacache`; a home-wide check was blocked by a hook; the snapshot has 0 files newer than the scratch start.

## Defects of maestro found in passing (questions for its owner, not in the README)

1. The extension wipes the user's other MCP servers from `.vscode/mcp.json` from the second start on (`mcp-config.ts:47-75,136-151`), level 3.
2. Turning Zero-Defect off leaves the rules in a `CLAUDE.md` Maestro created (`editor.ts:51-74`), level 3.
3. Extension installs have broken reference links: only `SKILL.md` is written, the core skill's seven links point at files never written, level 3.
4. The MCP server does not build from a clean checkout: `packages/core` is never built, including by `publish-mcp.yml:23-33`, level 3.
5. `maestro.zeroDefectAutoInject` is declared but never read, level 2.
6. Stale counts: `package.json:3-4` 1.4.2 and "21 commands"; `tools.ts:147`, `prompts.ts:5` "21"; `mcp-server/README.md:90` "25 prompt templates", the server has 24.
7. `agent-workflow/SKILL.md:225` ends with a literal `{{available_commands}}`.
8. `maestro-extension/README.md:26` says Zero-Defect toggles from the status bar; the status bar opens the Command Center.
9. `/reflect` has no audit data outside the extension (`participant.ts:317`; `tools.ts:11` imports `appendAudit` and never calls it).
10. The sidebar puts `/temper` under Utility; its frontmatter says enhancement; the README follows the frontmatter.
11. `context.ts:9` says `/teach-maestro` writes `.maestro/context.md`; `teach-maestro:75` says `.maestro.md`.
