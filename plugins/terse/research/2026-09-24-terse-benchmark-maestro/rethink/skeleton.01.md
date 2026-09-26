# Skeleton 01: `README.md` of sharpdeveye/maestro — 2026-09-24

No README exists (`document.md`); this one is written from scratch. `<R>` is this run directory,
`/var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/terse/runs/20260924-125421-maestro-readme-rethink`. The owner is the
benchmark's stand-in: `owner-words.md` is empty by the benchmark's rule, and `standin/answers-01.md` to
`answers-04.md` stand in for it. First skeleton: there is no `skeleton-read-00.md`.

**Keys.** P = `purpose.md`. A1–A4 = `standin/answers-01.md` … `answers-04.md`. D = a row of
`survey/synthesis.md`. T = a row of `terms.md`. G1 = the seven exact-genre READMEs (s1 slice 1: Superpowers,
Spec Kit, MCP servers, Cursor rules, agents, Playwright MCP, Templates); P5 = the five same-position READMEs
(s1 slice 2); U = the eight most-used (s2 slice 3); A = the seven agent READMEs of s3; H = its four hard-part
READMEs. Snapshot paths (`scripts/build.js:4` and the like) are quoted from the owner's answers or from
`terms.md`; no file of the snapshot was read for this skeleton.

## 1. The owner's words, the base, and the genre's order

### 1.1 The owner's statements, verbatim, each with its rendering

A rendering is what the statement becomes in the README, and the section of part 2 that carries it.

**P §1** (`purpose.md:7–14`)

> This README is Maestro's front door on GitHub. It is the one page that covers the whole project: 25 skills (one core skill, 24 slash commands and 7 reference files) and the three ways to give them to an AI coding agent: the skill files themselves, the VS Code extension, and the MCP server. After reading it, a developer must be able to:
>
> - tell whether Maestro fits their tool and their problem
> - install it by the route that fits
> - run `/teach-maestro` once, then a first command such as `/diagnose`
> - find the command for their next problem in the command table
>
> It links to the Marketplace page, the npm page and maestroskills.dev for depth rather than repeating them. It tells contributors that `source/skills/` is the only place to edit ("Source of truth: source/skills/", `scripts/build.js:4`).

Rendering: one page carrying every part. Fit → the opening (2.1) and the chooser's *Works in* column (2.2a).
Install → the three route blocks (2.2b–d). The first run → each route block's last lines and *First run*
(2.2e). The next command → *Commands*, one table (2.3). Depth → links, never restated: the store listings
in the badge row and the extension block, the npm listing in the badge row, maestroskills.dev and the two
channel pages in *Documentation* (2.5). Contributors → *Support and contributing* (2.6). The parenthesis
becomes the count line: 25 skills are one core skill and 24 commands, plus 7 reference files (A1 §5.2).

**P §2** (`purpose.md:18–28`)

> **Who.** A developer who builds LLM features, agents or pipelines (prompts, tools, RAG, multi-agent setups) and does that work inside an AI coding tool: Claude Code, Cursor, Gemini CLI, Codex, Kiro, Trae, OpenCode, Pi, Antigravity, or VS Code's chat. They know their tool and what a slash command is. I don't assume they know what an MCP server or a skills folder is, and they have not picked an install route yet. The second group is people who already use the extension or the MCP server and come for the full command list, the source, or to contribute.

Rendering: the opening names these tools and the AI workflow they build; "skills folder", "MCP server" and
"MCP client" first appear in Getting started's lead-in, glossed there; slash commands are not explained.
The second group gets the opening's three task links (Install · Commands · Contribute). "AI coding tool"
is written "AI coding agent" (A4 §1).

> **From where.** I have no traffic numbers. These are the routes the snapshot shows:
>
> - **GitHub itself.** The repo is the homepage in `package.json:23` and `mcp-server/package.json:33` ("https://github.com/sharpdeveye/maestro"). Its keywords are in `package.json:5-16`: ai, agents, workflows, skills, cursor, claude, gemini, codex, prompt-engineering, orchestration.
> - **The VS Code Marketplace or Open VSX listing.** `maestro-extension/README.md:10` has "[Install](vscode:extension/sharpdeveye.maestro-workflow) · [Website](https://maestroskills.dev) · [GitHub](https://github.com/sharpdeveye/maestro) · [MCP Server](https://www.npmjs.com/package/maestro-workflow-mcp)". Line `:121` has "[GitHub](https://github.com/sharpdeveye/maestro) | Source code, skills, and contributions". Open VSX publishing is the "Publish to Open VSX" step in `.github/workflows/build-extension.yml`.
> - **npm.** `mcp-server/README.md:11` says "MCP server for [Maestro](https://github.com/sharpdeveye/maestro) — exposes 25 workflow skills as tools, prompts, and resources for any MCP-compatible AI client."
> - **The skills CLI.** `maestro-extension/CHANGELOG.md:11` mentions "users using `npx skills add`". `skills-lock.json:5-6` records `"source": "sharpdeveye/maestro"`, `"sourceType": "github"`.
> - **The website.** maestroskills.dev is the extension's homepage (`maestro-extension/package.json:14`), described as "Interactive showcase and documentation" (`maestro-extension/README.md:120`). The only link inside a tool goes to the website, not to GitHub: the sidebar footer at `maestro-extension/webview-ui/src/App.tsx:75`.

Rendering: the badge row links the three listings a reader may arrive from; the skills CLI is the Skill
files block's first line; the website is named once, in *Documentation*.

> **Entry file.** Every reader of this README starts at `README.md` in the repository root. The Marketplace page and the npm page are entry files for their own channels, and both send readers back to the repo. So the root README must not assume the reader has seen either one. Inside the product, every route starts at one command, `/teach-maestro`: "This is the entry point for Maestro." (`source/skills/teach-maestro/SKILL.md:12`).

Rendering: every fact needed to install and run once is on this page (D10: "Root must still contain minimum
setup and first run"); every route block ends on `/teach-maestro`, and *First run* begins with it.

**A1 §5, what the README must say** (`answers-01.md:48–76`)

> 1. **The identity, in the project's own words.** "Workflow fluency for AI coding agents." (`package.json:4`). The product name is "Maestro — AI Workflow Fluency" (`maestro-extension/package.json:3`).

Rendering: the tagline, verbatim, is the first line under `# Maestro`; the product name is the banner's alt
text (A2 §9). "Fluency" appears nowhere else (T2).

> 2. **The counts from the source tree.**
>    - 25 skills: the core `agent-workflow` skill (`user-invocable: false`) plus 24 commands in four groups: Analysis, Fix & Improve, Enhancement, Utility (`mcp-server/src/tools.ts:19-24`).
>    - 7 reference files.
>    - The changelog counts the same way: "All 25 skills bumped to v2.0.0" (`CHANGELOG.md:10`).

Rendering: the opening's count line (25 skills = one core skill + 24 commands; 7 reference files); the four
groups, in *Commands*. No version in prose (A2 §3).

> 3. **The three install routes, each with its command.**
>    - **Skill files.** `npx skills add sharpdeveye/maestro` is my own wording of the command, inferred from `skills-lock.json:5-6`; I have not run it. The other way is to clone the repo and run `npm run build`, which copies `source/skills/` into the ten provider folders (`scripts/build.js:3`).
>    - **The extension.** `sharpdeveye.maestro-workflow` on the Marketplace and on Open VSX.
>    - **The MCP server.** `npx -y maestro-workflow-mcp` (`mcp-server/README.md:27-28`), or `npx maestro-workflow-mcp --http --port 3001` (`:66`).

Rendering: the CLI line in a `bash` fence (its unrun status stays in part 7, not on the page); the extension
ID in code; the local MCP command in a fence. Clone-and-build leaves the reader's routes (A3 (b)) and the
HTTP command becomes a link (A2 §8).

> 4. **The first run: `/teach-maestro` once per project, then `/diagnose`.**
>    - `/teach-maestro` "creates the `.maestro.md` context file that all other Maestro commands depend on" (`teach-maestro/SKILL.md:12`).
>    - "After creating `.maestro.md`, run `/diagnose` for a baseline health check of your workflow." (`:96`).
>    - Every command opens with "if no workflow context exists yet, you MUST run /teach-maestro first." (for example `diagnose/SKILL.md:12`).
>    - The file `/teach-maestro` saves is `.maestro.md` (`:75`). If `.maestro/context.md` exists, it is read first (`CHANGELOG.md:44`).

Rendering: *First run*: every command needs `.maestro.md` first; step 1 `/teach-maestro`, once per project,
writes it (and `.maestro/context.md` is read first if it exists, with no "legacy", "v1" or "v2", T31); step 2
`/diagnose`, ending on its report (A2 §11c).

> 5. **The memory layer, as the headline of 2.0.** It comes first under "Added" in the changelog (`CHANGELOG.md:14-20`): `/capture`, `/recap`, `/reflect`, `decisions.jsonl`, `audit.jsonl`, and "`.maestro/` directory — persistent memory that survives sessions". Show the loop: "your next session should start with `/recap`" (`capture/SKILL.md:71`).

Rendering: one clause of the opening, linked to *Memory across sessions* (2.4), which shows the loop in run
order. No "2.0" (A2 §3); the heading and the part names are A4's.

> 6. **Where it runs.**
>    - The ten provider folders: `.agents .claude .cursor .gemini .codex .kiro .trae .trae-cn .opencode .pi` (`scripts/build.js:14-25`).
>    - The extension needs "VS Code 1.95+ (or compatible fork: Cursor, Antigravity, Windsurf)" (`maestro-extension/README.md:127`).
>    - The MCP server needs Node 20 or later (`mcp-server/package.json:52`).

Rendering: the ten folders, as `<folder>/skills/` with their tools (A2 §11a, A4 §3), in the Skill files
block; VS Code 1.95 or later and Node 20 or later in the chooser's *Needs* column.

> 7. **What the extension writes into the project on its own.**
>    - "On every activation, Maestro syncs all 25 bundled skills into 10 AI provider directories" (`maestro-extension/README.md:50`).
>    - It writes a `maestro-workflow-mcp` server entry into the workspace's MCP config (`maestro-extension/src/adapters/mcp-config.ts:38-82`).
>    - The Zero-Defect toggle writes a marked block of rules into `CLAUDE.md`. In Cursor it also writes to `.cursorrules`; in Antigravity it writes `.agents/rules/maestro-zero-defect.md` (`maestro-extension/src/extension.ts:84-91`, `maestro-extension/src/adapters/editor.ts:111-112`).
>    - `.maestro/` gets its own `.gitignore`, headed "Maestro session data — opt-in to version control", and the context file stays versioned (`packages/core/src/decisions.ts:29-36`).

Rendering: the extension block's write list, four bullets, with A3 (c)'s corrections to the first: each
skill's `SKILL.md` only, into the first workspace folder, rewritten at every start. "The context file" of the
fourth is `.maestro/context.md`: the `.gitignore` sits inside `.maestro/` and cannot reach `.maestro.md` at
the project root (T35).

> 8. **Costs are estimates.**
>    - "Accuracy: ±20% — useful for trends, not invoicing." (`packages/core/src/cost-estimator.ts:5`).
>    - Token counts are a heuristic for "context budget display (not billing)" (`packages/core/src/token-estimator.ts:10`).
>    - The audit trail comes from the extension: "Use Maestro commands via the VS Code extension to generate audit entries." (`mcp-server/src/tools.ts:521`).

Rendering: the closing sentences of *Memory across sessions*; "audit trail" is written "command log
(`audit.jsonl`)" (A4 §7).

> 9. **MCP waves live in memory.** "if the server restarts, active waves are lost" (`mcp-server/src/wave-state.ts:6`).

Rendering: one sentence of the MCP block — a wave, one command run in checked phases, is held by the running
server; a restart loses it. "Memory" names only the section of that name (T rule 4, A4 §8).

**A1 §5, what the README must never say** (`answers-01.md:80–85`)

> 1. **That Maestro is a fork, port or derivative of another skill project, or name any project as its origin** (`NOTICE.md:15-16`). It may name the shared convention of a core skill, reference files and commands (`NOTICE.md:6-11`).
> 2. **The stale or loose counts in the manifests.**
>    - "21 commands" (`package.json:4`, a manifest still at version 1.4.2; also `mcp-server/src/tools.ts:147`).
>    - "25 commands" (`maestro-extension/package.json:4`).
>    - "25 prompt templates" (`mcp-server/README.md:90`, which lists only 24).
> 3. **A cost or token figure without "~" or "estimate".** This is `/reflect`'s own rule: "Show cost data without the "estimate" disclaimer (~)" is on its NEVER list (`reflect/SKILL.md:105`).

Rendering: checks W8, W11 and W6 of part 3. The page prints no cost or token figure; its one number of that
kind is "±20%".

**A2, the owner's decisions** (`answers-02.md`)

> **Default taken:** skill files → extension → MCP server, in that order everywhere they are listed. A reader who has not chosen is sent to the **skill files** first.

Rendering (§1): the chooser's rows, the route blocks and every list of routes, in this order; the lead-in
ends on the default.

> **Default taken:** all 24 command names appear in the README, in four groups, in this order:
>
> | Group | Commands |
> |---|---|
> | Analysis | `/diagnose`, `/evaluate`, `/reflect` |
> | Fix & Improve | `/refine`, `/streamline`, `/calibrate`, `/fortify`, `/zero-defect` |
> | Enhancement | `/amplify`, `/chain`, `/compose`, `/enrich`, `/guard`, `/iterate`, `/accelerate`, `/turbocharge`, `/temper` |
> | Utility | `/teach-maestro`, `/onboard-agent`, `/adapt-workflow`, `/specialize`, `/extract-pattern`, `/capture`, `/recap` |
>
> - The groups come from each skill's `category:` field in `source/skills/*/SKILL.md`.
> - Take the order and the one-line descriptions from my Marketplace page's tables (`maestro-extension/README.md:58-102`), without their 🆕 marks.
> - The frontmatter descriptions are written for the model ("Use when…"), not for the reader.

Rendering (§2): *Commands*, 24 rows in exactly this grouping and order; descriptions from those tables, 🆕
removed, A4's renames applied.

> **Default taken:** the memory layer is presented as a capability of the product, with no version named. `CHANGELOG.md` keeps the history.

Rendering (§3): no version anywhere in prose; the badges carry the live ones; `CHANGELOG.md` is linked from
*Documentation*.

> **Default taken:** the effects are listed in full beside the extension route.

Rendering (§4): the write list inside the extension block, and its summary in the chooser's *Writes into
your project* cell.

> **Decision:** the default one line, with `npm run check` added beside `npm run build`. No full Contributing section.

Rendering (§5): the contributor line of *Support and contributing*.

> **Default taken:** one line naming MIT, linking to `LICENSE`.

Rendering (§6): *License*.

> **Default taken:** a link to the repository's issues.

Rendering (§7): the help line of *Support and contributing*.

> **Default taken:** only the stdio command in the README, with a link to `mcp-server/README.md` for HTTP. This narrows item 3 of my set 01, which also listed the HTTP command.

Rendering (§8): the MCP block's fence holds `npx -y maestro-workflow-mcp`; HTTP is one linked clause; the
mode is called "local" (A4 §5).

> **Decision (not the default):** the banner from `assets/` at the top, with alt text "Maestro — AI Workflow Fluency". Under it goes one row of live version badges for the VS Code Marketplace, Open VSX and npm.

Rendering (§9): the opening's first two lines. D12 ("no live badges") gives way.

> **Default taken:** maestroskills.dev is named once, in the words my other pages use: "Interactive showcase and documentation" (`maestro-extension/README.md:120`).

Rendering (§10): the first link of *Documentation*, the domain's only mention.

> Each folder is listed with its tool:
>
> - `.claude`: Claude Code
> - `.cursor`: Cursor
> - `.gemini`: Gemini CLI
> - `.codex`: Codex
> - `.kiro`: Kiro
> - `.trae` and `.trae-cn`: Trae (global and China editions)
> - `.opencode`: OpenCode
> - `.pi`: Pi
> - `.agents`: Antigravity. The extension itself treats this as Antigravity's folder (`maestro-extension/src/adapters/mcp-config.ts:25-26`, `maestro-extension/src/adapters/editor.ts:111`).

Rendering (§11a): the Skill files block's inline list, each `<folder>/skills/` beside its tool.

> - **Skill files:** type `/teach-maestro`, then `/diagnose`, in the agent's chat.
> - **Extension:** run the same two from the Command Center sidebar, from the command palette ("Maestro: Teach — Generate .maestro.md" and "Maestro: Diagnose — Workflow quality audit", `maestro-extension/package.json:131,71`), or as `@maestro /teach-maestro` in VS Code's chat (`maestro-extension/README.md:34-42`).
> - **MCP server:** pick them as prompts ("Select from your client's prompt picker", `mcp-server/README.md:90`), or ask for them by name. The agent then fetches them with `maestro_run_command` (`mcp-server/src/tools.ts:154-157`).
>
> Reason: an MCP client shows the commands as prompts, not as the `/teach-maestro` a skills user types. The first-run block must not promise one interface for all three routes.

Rendering (§11b): each route block ends on its own surface — a chat fence, the sidebar, palette and
`@maestro` fence, the prompt menu — and *First run* names the two commands without a typed block.

> First a `.maestro.md` in the project root (`teach-maestro/SKILL.md:75`). Then `/diagnose` prints its report (`diagnose/SKILL.md:69-93`):
>
> - five dimensions, each scored 1–5
> - an overall score out of 25
> - a Maestro command to run for each gap
>
> Reason: the first-run block should end on something the reader can check.

Rendering (§11c): *First run*'s two steps, ending on the report, the gap commands linked to *Commands*.

> The extension is installed by its ID, `sharpdeveye.maestro-workflow`, from the editor's Extensions view. VS Code gets it from the Marketplace. Cursor, Windsurf and Antigravity get it from Open VSX; that is why CI publishes there (`.github/workflows/build-extension.yml`). That last part is in my own words. There is no terminal command.

Rendering (§11d): the extension block's install lines — the ID in code, the Extensions view, both registries
linked — and no fence.

**A3, how the skills reach the reader's project** (`answers-03.md`)

> - Run `npx skills add sharpdeveye/maestro` in the root of the project you work in. It installs Maestro's skills into that project and writes `skills-lock.json` there.
> - Install all 25 skills. Every command starts by invoking the core skill ("Invoke /agent-workflow", for example `diagnose/SKILL.md:12`).
> - Name no agents for this route; the CLI chooses the agent folders. A reader whose tool the CLI doesn't cover uses the manual line in (b).
> - Describe the project install only, not a global one. Maestro works per project: `/teach-maestro` is "Run once per project" (`teach-maestro/SKILL.md:3`), and `.maestro.md` and `.maestro/` live in the project.

Rendering ((a), `:34–37`): the Skill files block's fence and its one sentence; no global install; no agent
named for the CLI; the manual line follows as the way for a tool the CLI does not cover.

> - **Default taken.** Clone-and-build is the contributor's way to check a change, not a reader's install route, and the README says so.
>   - The contributor line is: edit `source/skills/`, run `npm run check`, then `npm run build`, then open an agent in the clone to try the change there.
>   - Offering clone-and-build to readers in set 01, item 3, was a mistake. That was wrong.
> - **Added: one manual line for readers.** Copy the skill folders from `source/skills/` into your agent's folder in your project, using the ten paths in `scripts/build.js:14-25` (for example `.claude/skills/`).

Rendering ((b), `:52–55`), which supersedes A1 §5.3's build line: the manual line and the ten-folder list in the Skill files block; clone-and-build
only in *Support and contributing*, said there to be a contributor's check that installs into no other project.

> 1. **Only each skill's `SKILL.md` reaches the project.** The bundler reads only `SKILL.md` (`maestro-extension/scripts/bundle-skills.js:71`), and the sync writes only `SKILL.md` (`extension.ts:240`). The seven reference files of `agent-workflow` are not copied, although its `SKILL.md` links to them (`agent-workflow/SKILL.md:66`, `:88`, `:110`, …).
> 2. **"The project" means the first workspace folder.** Nothing is written when no folder is open (`extension.ts:194-195`).
> 3. **The files are rewritten on every activation** (`extension.ts:236-240`). A reader's edits to the synced copies are gone at the next start.
>
> **Also.** The extension adds the MCP server to the workspace config (`maestro-extension/src/adapters/mcp-config.ts:42-45`, `:49-75`). So an extension user's agent can also fetch the skills from the server.

Rendering ((c), `:71–75`): the first two bullets of the extension's write list.

> **Served on request, never copied.**
>
> **Its one write into a project is not a skill.** It writes `.maestro/`, meaning the decision log, the sessions folder and `.gitignore`, when the agent calls `maestro_write_decision` (`tools.ts:426-466`, via `packages/core/src/decisions.ts:42-61`, `:85-104`).

Rendering ((c), `:85–92`): the chooser's MCP cell and one sentence of the MCP block: it serves the skills on
request and copies none into the project.

**A4, the renames and the memory heading** (`answers-04.md`)

§1, AI coding tool → AI coding agent:

> **Accepted (the default).** My tagline already uses this word: "Workflow fluency for AI coding agents." (`package.json:4`). "AI coding tool" was my own phrase in set 01, not the project's. Using both would give one thing two names.

§2, provider → coding agent:

> **Accepted (the default).** The command table uses "provider" for the LLM vendor: `/adapt-workflow`, "Port to a different AI provider" (`maestro-extension/README.md:98`). Calling Cursor or Claude Code a provider on the same page would give the word two meanings.

§3, provider folders → skills folders:

> **Accepted (the default).** Every one of the ten paths ends in `/skills` (`scripts/build.js:15-24`), and "provider" is already gone under item 2.

§4, the Marketplace → VS Code Marketplace:

> **Accepted (the default).** My own badge already labels that store "VS Code" and links to it (`maestro-extension/README.md:5`). A Claude Code user would read a bare "Marketplace" as the plugin marketplace.

§5, stdio → local:

> **Accepted (the default).** My MCP README already heads this mode "Local (stdio)" (`mcp-server/README.md:17`). `stdio` appears only inside a config block.

Rendering (§1–5): "AI coding agent", "coding agent" (the vendor sense of "provider" survives only in command
descriptions), "skills folders", "VS Code Marketplace", "local". Checks W1–W4.

§6, memory layer → session memory:

> **Neither.** I don't accept "session memory", and I don't keep "memory layer" either. The heading is in item 8.
>
> The parts keep the project's own names, each with its file:
>
> - **session summaries**: `.maestro/sessions/` ("save session summaries", `CHANGELOG.md:15`)
> - **the decision log**: `decisions.jsonl` ("append-only decision log", `CHANGELOG.md:18`)
> - **the command log**: `audit.jsonl` (item 7)
> - all three sit in **the `.maestro/` folder** (`CHANGELOG.md:20`)

§7, audit trail → command log (`audit.jsonl`):

> **Accepted (the default).** Always write it with the file name: "command log (`audit.jsonl`)".

§8, the heading of the memory section:

> **"Memory across sessions".**
>
> The first sentence under the heading says whose sessions these are: yours, with your coding agent.
>
> This replaces "memory layer" wherever I used it for the README in sets 01 and 02. The changelog keeps its own word.

Rendering (§6–8): the heading `## Memory across sessions`; its first sentence says the sessions are the
reader's, with their coding agent; the parts go by these four names; "command log (`audit.jsonl`)" always
with its file name (check W10).

### 1.2 The base and the grafts

The base is `structures/04-against-the-alternatives.md`, ranked 1st by the reader's-task critic (Codex Astra)
and 2nd by the genre-and-evidence critic (Opus): mean 1.5, against 3.0 for 05 and 08 (`base.md`). No
structure was disqualified: every one gives each of the four abilities a home (`critics/astra-reader-task.md`
§5). The owner-calibration critic is sized to zero by the benchmark's rule.

| Graft | From | What it displaces in 04 |
|---|---|---|
| The first-use surface of each route at the end of that route's block, and a lead-in that sends an undecided reader to skill files | `06-outside-the-field.md`, Getting started (Astra §4.1) | the first-use information 04 split between the chooser's fourth column and its First project block; 06's mixed terminal-and-chat block is not taken, and the success criteria stay in one place |
| Each command name a link to its `SKILL.md` | `09-claims-with-their-evidence.md`, Commands (Astra §4.2) | 04's name-only command cells |
| A consequence column in the chooser: what each route writes into the project | `05-change-without-harm.md`, Installation's "writes and records" column (Astra §4.3) | 04's section 2, *What Maestro adds*, a three-row comparison table; its product boundary moves into the opening's definition of the AI workflow |
| The first run ends on the report: five dimensions each scored 1–5, a score out of 25, a next command per gap | `08-the-process-as-the-spine.md`, the First project row (Opus §4, named for 09 and absent from 04's device) | 04's First project, which named "scored report" without its parts |

### 1.3 The failures found in all ten structures, and where each is repaired

1. **The clone/build-to-project handoff** (Astra §3: "All ten leave the clone/build-to-project handoff
   unspecified"). Repaired from A3: clone-and-build is no reader route and appears only in the contributor
   line; every reader route ends inside the reader's project — `npx skills` run in the project root, or the
   skill folders copied by hand into the coding agent's skills folder there; the extension writes into the
   first workspace folder; the MCP server copies nothing and is reached through the MCP client — and each
   route block ends on that route's first-use surface. Astra's added requirement, a separate entry path for
   the second reader group, is the opening's three task links.
2. **The memory heading** (Opus §3: "All ten structures file the owner's headline under a heading the owner
   never used"), and "audit trail" swapped for "command log" without the owner's word. Repaired from A4: the
   heading is *Memory across sessions*; the parts are session summaries, the decision log, the command log
   (`audit.jsonl`) and the `.maestro/` folder; the command-log rename is the owner's (A4 §7).
3. **Updating priced wrongly** (Opus §5, "Two notes that apply to all ten": eight priced the dropped Updating
   kind as having no owner semantics; the owner supplied the extension's). Repaired: the extension's one
   update fact — its `SKILL.md` copies are rewritten at every start — sits in its write list, and part 5
   prices the Updating kind at that line.
4. **Budgets with no count behind them** (Opus §5: every budget rests on the synthesis's admitted column,
   which "the surveys measured whole documents … never section lengths by kind"). Named with its cost:
   this skeleton's budgets are the same kind of ceiling, 04's adjusted by what the grafts and A3 add and
   remove; `sections.mjs` on the first draft is the measurement, and a section over its budget is a
   question to the owner, answered in the next skeleton.

### 1.4 The genre's order

N of M from s1's slice-1 order (G1, 7), corrected by Opus §5 where it recounted; P5, U and A from s1 slice 2,
s2 and s3. The owner's exemplars are Spec Kit, Superpowers and Playwright MCP (A1 §3), all three in G1.

| Place | What the genre puts there | N of M | The owner's exemplars there | This skeleton |
|---|---|---|---|---|
| 1 | Identity: a title and one tagline before any `##`; badges or a logo around it | 7/7 G1; 5/5 P5; 7/8 U, with badges or a logo before the first heading in 6/8 | Spec Kit: logo, title, tagline, then badges; Superpowers: title, identity line; Playwright MCP: title, identity line | **Follows**, with the banner and the badge row above the title (A2 §9) |
| — | A sponsor or commercial aside near the top | 3/7 G1 | Superpowers: *Commercial Services*, after *How it works* | **Departs**: none; no offer exists (D23) |
| — | An authored table of contents | 2/7 G1; 2/8 U | Superpowers: first, under the identity line | **Departs**: three task links (D13, D14) |
| 2 | Before setup: a rationale (how it works, why, versus the sibling tool, key features) or a chooser | 3/7 G1 rationale, 4/7 counting Spec Kit's chooser; 2/5 P5 channel tables | Spec Kit: *Choose your process*, a three-row table; Superpowers: *How it works*; Playwright MCP: *vs Playwright CLI*, *Key Features*, *Requirements* | **Follows the chooser, departs from the rationale**: the chooser opens *Getting started* with no heading of its own (T's headings check); 04's comparison rested on no owner fact (Opus §2), so its boundary is the opening's definition of the AI workflow (graft 3) |
| 3 | Install / getting started | 7/7 G1, inside the first four peer sections in 6; 4/5 P5 inline; A: a route choice as the first heading in 4/7 | Superpowers: *Installation*, 16 per-harness H3s; Spec Kit: *Get started*, prerequisites, a terminal fence, then where to type; Playwright MCP: *Getting started*, a standard config, then per-client blocks | **Follows**, as the first `##`; **departs** in the split: three route H3s, not one per agent (per agent or client in 3/7 G1: Superpowers, agents, Playwright MCP), because one route reaches all the agents it serves and ten blocks would repeat one step (D04) |
| 4 | The first run | 4/4 H give a first executable action; inside setup in 3 of 18 project READMEs (Spec Kit, Claude Code, Codex), "Usage" in 3 of 18 | Spec Kit: inside *Get started*, after its terminal fence, a line on where the skills are invoked, the agent's chat; Superpowers: *The Basic Workflow*, its own `##` after *Installation* | **Follows** Spec Kit: inside setup, as the last H3 of *Getting started* |
| 5 | The inventory | 7/7 G1, at the least consistent place: first in 2, right after install in 1, last or near-last in 2 | Superpowers: *What's Inside*, bold category lead-ins, near the end; Spec Kit: its processes as `##`s after setup; Playwright MCP: *Tools*, last | **Follows** the after-setup place (D07, D24); **departs** in device: one item-level table, which 0/7 G1 use (P §1: "the command table"; D08) |
| 6 | Feature or configuration detail | 3/7 G1 | Spec Kit: *Customize or bring your own process*; Playwright MCP: *Configuration* and four more sections | **Follows** the place with *Memory across sessions*; **departs** from configuration depth (D21) |
| 7 | Documentation, as links out | 4/7 G1; 3/5 P5 | Spec Kit: *Documentation* | **Follows**: depth is linked, not repeated (P §1, D10) |
| 8 | Social proof (star history) | 3/7 G1, always last or second to last | Spec Kit: *Star history* | **Departs** (D23) |
| 9 | Contributing, with or without help | 5/7 G1; 6/8 U | Spec Kit: *Support and contributing*; Superpowers: *Contributing* | **Follows**, under Spec Kit's joined heading |
| 10 | License | 4/7 G1; 6/8 U; 2/5 P5 | Superpowers: *License*; Spec Kit: one inline line at the end | **Follows**: a heading and one line |
| tail | Community 2/7; Security 2/7; held by the most-used G1 document only: *When Something Goes Wrong*, *Philosophy*, *Updating*, telemetry | — | Superpowers: all of them after its inventory; Playwright MCP: *Security* before *Tools* | **Departs** from each (part 5) |

## 2. Sections

**Unit.** A budget is a `sections.mjs` count on the visible copy of part 3 (rule V): whitespace-separated
tokens after images, link targets, HTML tags, table rules and pipes, and fence lines are removed. The `##`
line is not counted; `###` lines and `# Maestro` are. Block budgets under `###` are the awk count of part 3,
S3, which excludes the `###` line. The banner and the badges count zero.

### 2.1 The opening, under `# Maestro`, no `##` heading — 120

- **Purpose.** Say what Maestro is, what it works on and where it runs, how big it is, and where each reader
  group goes next.
- **Excludes.** "MCP", "skills folder" and every other route term (first used in 2.2); any warning, limit or
  write; a version or "new in 2.0"; any origin, fork or comparison with another skill project (never-say 1);
  a pitch or "how it works"; command names; the reference files' topics; a question; a table of contents.
- **Device**, top to bottom:
  - the banner from `assets/`, alt text "Maestro — AI Workflow Fluency";
  - under it, one row of three live version badges — VS Code Marketplace, Open VSX, npm — each linking to
    its listing;
  - `# Maestro`, then the tagline "Workflow fluency for AI coding agents." as a plain line of its own;
  - one plain paragraph: Maestro gives the reader's coding agent commands for the AI workflow they are
    building, defined here as its prompts, context, tools, agents, retrieval, evaluation and guardrails
    (T3); what the commands do to it — diagnose it, fix and improve it, extend it — and that Maestro carries
    a record of the reader's sessions into the next one, linked to *Memory across sessions*; then where it
    runs: Claude Code, Cursor, Gemini CLI, Codex, Kiro, Trae, OpenCode, Pi, Antigravity and VS Code's chat;
  - one count line: 25 skills — one core skill, `agent-workflow`, which every command loads first and the
    reader never runs, and 24 commands run by name — plus 7 reference files the core skill reads when it
    needs them (T9–T13);
  - one line of three links: Install (`#getting-started`) · Commands (`#commands`) · Contribute
    (`#support-and-contributing`).
- **Genre split.** Identity, counts, badges: the opening's own sub-blocks in the genre (D01, D02, D12, D13);
  marked by the image, the H1, a paragraph, a line.
- **Rests on.** P §1, first ability; P §2 *Who* (the tool list, the two reader groups); A1 §5.1, §5.2; A2 §9;
  D01 60 + D02 25 + D13 12, the title and tagline 8, the tool names 15; D15 ("short opening mention");
  graft 3 (04's boundary, as the definition); T1–T4, T9–T13; genre place 1.

### 2.2 `## Getting started` — 670, in five blocks

- **Purpose.** Take a reader who has not chosen a route to a checked first report, by the route that fits.
- **Excludes.** Install steps per coding agent (the folder list names each one's folder); clone-and-build as
  a reader's route; a global install; the HTTP command and port; `stdio`; the MCP tools and resources,
  `maestro_run_command` among them; the extension's UI tour, settings, status bar and Quick Pick; any claim
  that the CLI line was run; one typed block shared by all routes; update steps; the version of anything;
  "legacy", "v1", "v2".
- **Genre split.** The genre splits setup by agent or client with `###` in 3/7 G1, by method or environment
  in the agent READMEs (Codex, Gemini CLI, OpenHands); here by route, marked by `###` headings, with the
  first run as a fourth `###`.

**a. Lead-in and chooser, no heading — 140.**
- Two sentences. The three routes, in A2 §1's order, with *skill files* glossed as plain folders the
  reader's coding agent loads from its skills folder, and an *MCP server* as a small program the reader's
  MCP client — their coding agent, or an app such as Claude Desktop — starts on their machine (T7, T16,
  T23). Then the default: a reader who has not chosen starts with skill files.
- A table of three rows, in A2 §1's order, each route name linking to its `###`. Columns: **Route · Works
  in · Needs · Writes into your project**.
  - Skill files — Claude Code, Cursor, Gemini CLI, Codex, Kiro, Trae, OpenCode, Pi, Antigravity — `npx`, or
    this repository's files — the skill folders, into a skills folder of the project; `npx skills` also
    writes `skills-lock.json`.
  - VS Code extension — VS Code and its forks Cursor, Antigravity, Windsurf — VS Code 1.95 or later — at
    every start, each skill's `SKILL.md` into ten skills folders; an MCP server entry; with each `@maestro`
    run, the command log (`audit.jsonl`).
  - MCP server — any MCP client — Node 20 or later — no skill files: it serves them on request.
- **Rests on.** D03 (100), D05; graft 1 (06's lead-in); graft 3 (05's column); A1 §5.6; A2 §1; A3 (a), (c);
  T7, T16, T20, T23; rule 9.

**b. `### Skill files` — 130.**
- One line — run in your terminal, in the root of the project you work in — then a `bash` fence holding
  `npx skills add sharpdeveye/maestro`.
- One sentence: `npx skills` is a separate installer for agent skills, not part of Maestro; it installs the
  skills into that project, choosing the agent folders itself, and writes `skills-lock.json` there; install
  all 25, because every command loads the core skill first.
- The manual line, for a coding agent the installer does not cover: copy the skill folders from
  `source/skills/` into the coding agent's skills folder in the project; then the ten folders inline, each
  `<folder>/skills/` beside its tool (A2 §11a).
- The first use: in the coding agent's chat, a `text` fence of two lines, `/teach-maestro` and `/diagnose`;
  then a link to *First run* for what they give.
- **Rests on.** A1 §5.3, §5.6; A2 §11a, §11b; A3 (a), (b); D04, D05; T16–T18; rules 5, 10.

**c. `### VS Code extension` — 200.**
- Install: the ID `sharpdeveye.maestro-workflow`, in code, from the editor's Extensions view; VS Code gets it
  from the VS Code Marketplace, and Cursor, Windsurf and Antigravity from Open VSX, glossed as the open
  registry VS Code forks install from (T22); both linked. No fence.
- A bold lead-in, *What it writes into your project, without asking*, then four bullets, each bold-led by
  what is written; a time is stated only where A3 gives one:
  1. **Each skill's `SKILL.md`**, and only that file, into the ten skills folders of the first folder in
     the workspace, rewritten at every start — edits to those copies are lost.
  2. **An MCP server entry** in the workspace's MCP config, so the coding agent can also reach the skills
     through the MCP server.
  3. **Zero-Defect mode's rules**, when it is switched on: a marked block of 8 precision rules in
     `CLAUDE.md`, created if missing; also `.cursorrules` in Cursor, and
     `.agents/rules/maestro-zero-defect.md` in Antigravity (T41).
  4. **`.maestro/`**: with each `@maestro` run, a line in the decision log and in the command log
     (`audit.jsonl`); the folder's own `.gitignore` is headed "Maestro session data — opt-in to version
     control", and `.maestro/context.md` stays versioned.
- The first use: from the Command Center sidebar; from the command palette, "Maestro: Teach — Generate
  .maestro.md" and then "Maestro: Diagnose — Workflow quality audit"; or in VS Code's chat, a `text` fence
  of `@maestro /teach-maestro` and `@maestro /diagnose`. Then a link to *First run*.
- **Rests on.** A1 §5.6, §5.7; A2 §4, §11b, §11d; A3 (c), corrections 1–3 and "Also"; D26 (135) and D04's
  share; T20–T22, T41, T44, T45 (overridden for the sidebar and palette by A2 §11b); the synthesis's "1
  compact write-effects list with 4 bullets".

**d. `### MCP server` — 100.**
- One line — the MCP client runs it: add it to the client as a local server — then a `text` fence holding
  `npx -y maestro-workflow-mcp`.
- One sentence linking `mcp-server/README.md` for where Claude Desktop, Cursor, VS Code and Antigravity keep
  the entry, and for HTTP mode, which hosts one server for others.
- One sentence: it serves the skills on request and copies none into the project.
- One sentence: a wave — one command run in checked phases — is held by the running server; a restart
  loses it (T40).
- The first use: pick the two commands' prompts from the client's prompt menu, one prompt per command
  (T25), under the names `mcp-server/src/prompts.ts` gives them, or ask the coding agent for them by name.
  Then a link to *First run*.
- **Rests on.** A1 §5.3, §5.9; A2 §8, §11b; A3 (c) "Served on request, never copied"; D04, D28 (25); T7, T23,
  T25, T27, T28, T40; rule 10.

**e. `### First run` — 85.**
- One line: every command needs `.maestro.md` first.
- A numbered list of two steps, each bold-led by the command's name, with no typed block:
  1. `/teach-maestro`, once per project: Maestro interviews the reader about the project and saves the
     answers as `.maestro.md` in its root (T29, T30); if `.maestro/context.md` exists, it is read first.
  2. `/diagnose`: a report on the AI workflow — five dimensions, each scored 1–5; an overall score out of
     25; a Maestro command to run for each gap, linked to *Commands*.
- **Excludes.** Where to type (each route block holds it); the five dimensions' names; a sample report or
  score.
- **Rests on.** P §1, third ability; P §2 *Entry file*; A1 §5.4; A2 §11b (its reason), §11c; graft 4;
  D06 (90); T29–T32; genre place 4.

Total for 2.2: 140 + 130 + 200 + 100 + 85 = 655, plus the four `###` lines, 13: 668, budgeted at 670.

### 2.3 `## Commands` — 340

- **Purpose.** Let either reader find the command for their next problem, and reach its source.
- **Excludes.** The core skill as a row; the frontmatter's "Use when…" text; 🆕 marks; a number in the
  heading or anywhere as a count of commands; MCP prompts, tools and resources; a second table or per-group
  headings; "memory layer", "audit trail", "provider" for a coding agent (A4).
- **Device.** One table of 24 rows, **Group · Command · What it does**, in A2 §2's grouping and order
  (Analysis 3, Fix & Improve 5, Enhancement 9, Utility 7), each group named in its first row only; each
  command name a link to `source/skills/<name>/SKILL.md`; each description the one-liner of the Marketplace
  tables (`maestro-extension/README.md:58-102`), 🆕 removed, A4's renames applied.
- **Genre split.** The genre splits its inventory by bold category lead-ins (Superpowers) or category
  headings (Cursor rules; Playwright MCP's collapsed groups); here the Group cell of each group's first row
  marks it.
- **Rests on.** P §1, fourth ability ("in the command table"); A2 §2; D07 (340); D08 (bullets contradict
  the purpose); graft 2; T11, T14, T36; genre place 5.

### 2.4 `## Memory across sessions` — 150

- **Purpose.** Show the loop that carries a record of the reader's own sessions with their coding agent into
  the next one, where that record is kept, and what its numbers are worth.
- **Excludes.** "Memory layer", "session memory", "audit trail"; memory for the agents the reader builds; a
  version or "2.0"; the `.jsonl` fields; any cost or token figure; waves (2.2d); the `.gitignore` (2.2c).
- **Device.**
  - The first sentence: the sessions are the reader's own, with their coding agent, and their record is kept
    in the `.maestro/` folder of the project (A4 §8).
  - A numbered list of three, in run order, each bold-led by the command: `/capture` at the end of a session
    — a session summary in `.maestro/sessions/` and an entry in the decision log (`decisions.jsonl`);
    `/recap` at the start of the next — the latest summary and the last five decisions; `/reflect` —
    Maestro's own commands scored from the logs: usage, completion, ~cost and duration (T36, T37).
  - One sentence: the command log (`audit.jsonl`) gets a line per command run through `@maestro` in VS
    Code's chat, with its duration, ~tokens and ~cost; only the extension writes it (T38).
  - One sentence: costs and token counts are estimates (~) — costs within ±20%, useful for trends, not
    invoicing; token counts for the context budget, not billing (T42, T43).
- **Rests on.** A1 §5.5, §5.8, never-say 3; A2 §3; A4 §6–8; D15 (110), D27 (65); T33–T39, T42, T43; genre
  place 6.

### 2.5 `## Documentation` — 40

- **Purpose.** Send the reader to depth without repeating it.
- **Excludes.** The store and npm listings again (the badges and the extension block hold them); anything
  those pages say; a second route table.
- **Device.** A list of four links, each labelled by what it holds: maestroskills.dev — "Interactive
  showcase and documentation"; the extension's page, `maestro-extension/README.md` — its sidebar, command
  palette and settings; the MCP server's page, `mcp-server/README.md` — each client's settings, HTTP mode,
  and everything the server offers; `CHANGELOG.md` — what changed in each version.
- **Rests on.** P §1 ("links to the Marketplace page, the npm page and maestroskills.dev for depth"); A2 §3,
  §10; D10 (40); T47; genre place 7.

### 2.6 `## Support and contributing` — 70

- **Purpose.** Send a stuck reader to the issues, and a contributor to the one place to edit and the checks
  to run.
- **Excludes.** A code of conduct, pull-request template or first-issues list (none in the snapshot, D16);
  a chat channel (A2 §7); troubleshooting steps; a full contributing guide; what `npm run check` enforces.
- **Device.** Two plain lines. Help: the repository's issues, linked. Contributors: `source/skills/` is the
  only place to edit; after an edit, `npm run check`, then `npm run build`, which copies the skills into the
  ten skills folders of the clone so the change can be tried there with a coding agent — it installs into no
  other project. Commands inline, one line (A2 §5).
- **Rests on.** P §1, last sentence; A2 §5, §7; A3 (b); D16, D17; T19, T46; genre place 9.

### 2.7 `## License` — 12

- **Purpose.** Say whether the project may be reused.
- **Excludes.** The licence's text; commentary.
- **Device.** One line: MIT, linked to `LICENSE`.
- **Rests on.** A2 §6; D18; genre place 10.

### Whole page

- **Headings.** `#` once; six `##`; four `###`, all inside *Getting started*.
- **Tables.** Two: the chooser (3 rows) and *Commands* (24 rows).
- **Fences.** Four: one `bash` (`npx skills add sharpdeveye/maestro`) and three `text` (`/teach-maestro`
  with `/diagnose`; `@maestro /teach-maestro` with `@maestro /diagnose`; `npx -y maestro-workflow-mcp`).
- **Bold lead-ins.** Only in the extension's write list, the two steps of *First run* and the three of the
  memory loop.
- **Links.** The three task links; the chooser's three route names; each route block to `#first-run`;
  *First run* to `#commands`; the opening to `#memory-across-sessions`; 24 `SKILL.md` links; the two
  registries; `mcp-server/README.md`; *Documentation*'s four; the issues; `LICENSE`.
- **None of.** A table of contents, collapsed details, a diagram, a screenshot, emoji, a horizontal rule, an
  admonition box, a star-history chart, a sample output.

### Total — 1,402

120 + 670 + 340 + 150 + 40 + 70 + 12 = 1,402, against 04's 1,322 and the synthesis's ceiling of 1,454.
Out of 04: *What Maestro adds* (100), the chooser's first-use column, the clone-and-build fences. In: the
lead-in, the chooser's *Writes* column, each route's first-use lines, the manual line, A3's facts in the
extension and MCP blocks, the report's three parts, *First run*'s heading.

## 3. Mechanical rules

Run on each draft `D`, from any directory. The 37 inline commands, the visible-copy `sed` and the two JSON
files below were extracted from this file's text and run, with this machine's `sed`, `awk`, `grep` and Node
24, on two synthetic fixtures under `$TMPDIR/terse-skel01-check/`: one built to this skeleton, on which each
printed its passing output, and one with a violation planted for each check, on which each printed a
failure. The fixtures test the commands, not the README.

```bash
S=/Users/ruliny/Git/agent-skills/plugins/terse/skills/rewrite/scripts
D=<the draft README>
C="$TMPDIR/maestro-readme-checks"; mkdir -p "$C"
SNAP=/var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/terse-bench/snapshot
```

### 3.1 The visible copy, which the scripts read

**V.** The scripts count what a reader sees. On the raw file `rule1.mjs` reads badge URLs as absolute paths
(measured on the fixture: three badges, six false hits), and `sections.mjs` counts pipes and link targets.

```bash
sed -E -e 's/!\[[^]]*\]\([^)]*\)//g' -e 's/\]\([^)]*\)/]/g' -e 's/\[\]//g' -e 's/<[^>]*>//g' \
       -e '/^[ |:-]+$/d' -e 's/\|/ /g' -e '/^```/d' "$D" > "$C/visible.md"
```

Passes when it prints nothing and `$C/visible.md` exists.

### 3.2 The three scripts

**S1 — `rule1.mjs`, the opening only.**
`node "$S/rule1.mjs" "$C/visible.md" --cut "Getting started"` prints `0 violation(s), 0 excused`. No
`--except`: the opening carries no absolute path, flag, environment variable, exit code, protocol name
(`MCP`, `stdio`) or `ABC:` field. (On the fixture, a planted `MCP`, `--http` and `~/x/y` gave three hits.)

**S2 — `dup.mjs`, one idea in one home.**
`node "$S/dup.mjs" "$C/visible.md" "$C/concepts.json"` prints `0 concept(s) in three or more sections`, and
every concept's sections are among the homes its name gives. A concept at three because an owner-verbatim
command description holds it is a question to the owner, not a rewrite. `$C/concepts.json`:

```json
[
  {"name": "the AI workflow defined — (opening)", "pattern": "evaluation,? and guardrails"},
  {"name": "the core skill — (opening)", "pattern": "agent-workflow"},
  {"name": "reference files — (opening), Getting started", "pattern": "reference files"},
  {"name": "the ten skills folders — Getting started", "pattern": "\\.trae-cn"},
  {"name": "skills-lock.json — Getting started", "pattern": "skills-lock\\.json"},
  {"name": "the extension's writes — Getting started", "pattern": "CLAUDE\\.md|\\.cursorrules|maestro-zero-defect\\.md|every (start|activation)"},
  {"name": "the MCP server entry — Getting started", "pattern": "MCP (server )?entry|MCP config"},
  {"name": "the .gitignore — Getting started", "pattern": "\\.gitignore|version control"},
  {"name": "Open VSX — Getting started", "pattern": "Open VSX"},
  {"name": "requirements — Getting started", "pattern": "1\\.95|Node 20"},
  {"name": "the prompt menu — Getting started", "pattern": "prompt menu"},
  {"name": "waves — Getting started", "pattern": "\\bwaves?\\b"},
  {"name": "the context file read first — Getting started", "pattern": "\\.maestro/context\\.md"},
  {"name": "the report — Getting started", "pattern": "out of 25|scored 1"},
  {"name": "/teach-maestro — Getting started, Commands", "pattern": "/teach-maestro"},
  {"name": "/diagnose — Getting started, Commands", "pattern": "/diagnose"},
  {"name": "Command Center, palette — Getting started, Documentation", "pattern": "Command Center|command palette"},
  {"name": "group labels — Commands", "pattern": "Fix & Improve|Enhancement"},
  {"name": "session summaries — Memory across sessions, Commands", "pattern": "session summar"},
  {"name": "the decision log — Memory across sessions, Getting started", "pattern": "decisions\\.jsonl|decision log"},
  {"name": "the command log — Getting started, Memory across sessions", "pattern": "command log|audit\\.jsonl"},
  {"name": "estimates — Memory across sessions", "pattern": "±20|invoic|billing"},
  {"name": "maestroskills.dev — Documentation", "pattern": "maestroskills\\.dev"},
  {"name": "HTTP mode — Getting started, Documentation", "pattern": "\\bHTTP\\b"},
  {"name": "source/skills/ — Getting started, Support and contributing", "pattern": "source/skills/"},
  {"name": "npm run check, build — Support and contributing", "pattern": "npm run (check|build)"},
  {"name": "the issues — Support and contributing", "pattern": "\\bissues\\b"},
  {"name": "MIT — License", "pattern": "\\bMIT\\b"}
]
```

**S3 — `sections.mjs`, the budgets.**
`node "$S/sections.mjs" "$C/visible.md" "$C/budgets.json"` prints `0 section(s) over budget` and a TOTAL
of 1402 or less. The blocks of *Getting started*:
`awk '/^## /{b=$0;next} /^### /{b=$0;next} b!=""&&NF{w[b]+=NF} END{for(k in w)print w[k]"\t"k}' "$C/visible.md"`
prints `## Getting started` (the lead-in and chooser) ≤ 140, `### Skill files` ≤ 130, `### VS Code
extension` ≤ 200, `### MCP server` ≤ 100, `### First run` ≤ 85. `$C/budgets.json`:

```json
{
  "(opening)": 120,
  "Getting started": 670,
  "Commands": 340,
  "Memory across sessions": 150,
  "Documentation": 40,
  "Support and contributing": 70,
  "License": 12
}
```

### 3.3 The fourteen rules of `stages.md`, for this owner

1. **Open with the problem and the goal — adopted.** P §1 makes fit to "their problem" the first ability.
   `awk 'f&&NF{print ($0~/AI workflow/?"ok":"no"); exit} /^[*_]*Workflow fluency for AI coding agents\.[*_]*$/{f=1}' "$C/visible.md"`
   prints `ok`, and `awk '/^## /{exit} /\?/' "$C/visible.md"` prints nothing.
2. **The opening sells; it does not warn — adopted.** P §2: the reader may not know an MCP server or a
   skills folder, so those words start where they are glossed. S1 passes, and
   `awk '/^## /{exit} 1' "$C/visible.md" | grep -c -i -E 'estimate|±|lost|restart|without asking|rewritten|skills folder|MCP'`
   prints `0`.
3. **Technical detail in one section below the middle — set aside.** A2 §4 puts the extension's writes
   beside its route; the wave note belongs to the MCP route (A1 §5.9, D28), the estimate note to the memory
   loop (D27). The reader chooses a route by its consequences, so they sit where the choice is made.
4. **A prerequisite satisfied on nearly every machine is noise — adopted.** VS Code 1.95 and Node 20 gate a
   route (A1 §5.6) and stay, once each.
   `grep -o -E 'VS Code 1\.95|Node 20' "$C/visible.md" | sort | uniq -c` prints `1 Node 20` and
   `1 VS Code 1.95`; `grep -c -w -E 'PATH|macOS|Windows|Linux' "$C/visible.md"` prints `0`.
5. **Install is a block to copy, immediately — adopted where a terminal line exists.** The extension has
   none (A2 §11d); its ID is the block.
   `for h in '### Skill files' '### MCP server'; do awk -v h="$h" '$0==h{s=1;n=0;next} s&&/^```/{print h": "(n<=2?"ok":"late"); exit} s&&NF{n++}' "$D"; done`
   prints two lines ending `ok`.
6. **Update gets the same block — set aside.** No route has an update procedure on record: the installer's
   behaviour is the owner's inference (A3 (a)), the MCP command's is not shown, the owner named none; the
   extension's one update fact is in its write list (2.2c). Put to the owner, part 7.
7. **No invented examples — adopted.** Every fenced line is the owner's (A1 §5.3, A2 §11b), and no output is
   shown. `awk '/^```/{f=!f;next} f' "$D" | sort -u` prints exactly six lines: `/diagnose`,
   `/teach-maestro`, `@maestro /diagnose`, `@maestro /teach-maestro`, `npx -y maestro-workflow-mcp`,
   `npx skills add sharpdeveye/maestro`.
8. **The vocabulary agrees with the claim — adopted.** Maestro's parts are what the reader's coding agent
   already runs, so the page uses the agent's words (T's thesis) and the owner's renames (A4). Checks
   W1–W11.
9. **A comparison whose rows differ goes in a table — adopted.** The chooser's rows differ in reach, needs
   and writes; the commands differ by row. `grep -c -E '^\|? *:?-{3,}:? *\|' "$D"` prints `2`;
   `grep -c -E '\]\(source/skills/[a-z-]+/SKILL\.md\)' "$D"` prints `24`.
10. **A command goes in a fenced block, with a language, in the form that runs — adopted for the routes and
    the first run.** Terminal lines are `bash`, chat lines and the MCP client's line are `text`; the MCP
    prompts are picked, not typed, and get no fence; the contributor line keeps its commands inline, the
    one line of A2 §5. `awk '/^```/{c++; if (c%2==1) print $0}' "$D"` prints, in order, `` ```bash ``,
    `` ```text ``, `` ```text ``, `` ```text ``; and
    `awk '/^## Support and contributing/{s=1;next} /^## /{s=0} s&&/^```/' "$D"` prints nothing.
11. **A qualification is not a fix — adopted.** The owner's estimate words (A1 §5.8, never-say 3) are the
    numbers' definition, not caveats, and stay. `grep -c -i -w -E 'unless|only if|except when|as long as|provided that' "$C/visible.md"`
    prints `0`.
12. **A README describes the code as it is — adopted.** No version in prose (A2 §3); the badges are live.
    `grep -n -E '[0-9]+\.[0-9]+\.[0-9]+|\b2\.0\b|[Nn]ew in' "$C/visible.md"` prints nothing.
13. **A README carries no results — adopted.** None of P §1's four abilities needs a measurement of
    Maestro; *First run* says what the report holds instead of showing one.
14. **Nothing from a run on the page — adopted.** No output of a run, dated or not: every fence is an input
    (rule 7). For 13 and 14,
    `grep -c -E '[0-9]+ ?/ ?25|score of [0-9]|20[0-9]{2}-[0-9]{2}-[0-9]{2}' "$C/visible.md"` prints `0`.

### 3.4 The page's shape

- **H.** `grep -n '^#' "$D"` prints, in order and nothing else: `# Maestro`, `## Getting started`,
  `### Skill files`, `### VS Code extension`, `### MCP server`, `### First run`, `## Commands`,
  `## Memory across sessions`, `## Documentation`, `## Support and contributing`, `## License`.
- **T.** The *Commands* table has a header and 24 rows:
  `awk '/^## Commands/{s=1;next} /^## /{s=0} s&&/^\|/' "$D" | grep -c -v -E '^\|? *:?-{3,}'` prints `25`.
- **L1, anchors.** Every same-page link names a heading:
  `comm -23 <(grep -o -E '\]\(#[a-z0-9-]+\)' "$D" | sed -E 's/^\]\(#//; s/\)$//' | sort -u) <(grep -E '^#{1,3} ' "$D" | sed -E 's/^#+ //' | tr 'A-Z' 'a-z' | sed -E 's/[^a-z0-9 -]//g; s/ /-/g' | sort -u)`
  prints nothing.
- **L2, files.** Every relative Markdown link resolves in the snapshot:
  `grep -o -E '\]\([^)#:]+\)' "$D" | sed -E 's/^\]\(//; s/\)$//' | sort -u | while read -r p; do [ -e "$SNAP/$p" ] || echo "missing: $p"; done`
  prints nothing.

### 3.5 The words

- **W1, the renamed and the refused.**
  `grep -n -i -w -E 'memory layer|session memory|audit trail|AI coding tools?|provider folders?|harness(es)?|channels?|legacy|plugins?|slop|chat participant|Quick Pick|editor adapter|context slicing|transport|stdio|remote|public endpoint|derivative|impeccable|pbakaus' "$C/visible.md"`
  prints nothing (A4 §1, §3, §5–7; T5, T17, T31, T44, T45, T48–T50; never-say 1).
- **W2, "workflow" only as the reader's AI workflow, outside the owner's command descriptions.**
  `awk '/^## /{s=$0} s!="## Commands"' "$C/visible.md" | sed -E 's/(agent|adapt|maestro)-workflow//g; s/AI workflow//g; s/Workflow fluency//g; s/Workflow quality audit//g' | grep -n -i 'workflow'`
  prints nothing (T2, T3; the descriptions are A2 §2's).
- **W3, "provider" only in command descriptions.**
  `awk '/^## /{s=$0} s!="## Commands"' "$C/visible.md" | grep -n -i 'provider'` prints nothing (A4 §2).
- **W4, never a bare "Marketplace".**
  `grep -n -o -E '(VS Code )?Marketplace' "$C/visible.md" | grep -v 'VS Code Marketplace'` prints nothing
  (A4 §4).
- **W5, never a bare "agent", outside the owner's command descriptions.**
  `awk '/^## /{s=$0} s!="## Commands"' "$C/visible.md" | grep -o -i -E '\b[a-z]+ agents?( you build)?\b' | grep -v -i -E '^(coding agents?|the agents you build)$'`
  prints nothing (T rule 1: "coding agent", and "the agents you build" for the reader's own).
- **W6, a cost or token word only with "~" or "estimate".**
  `awk '/^## /{s=$0} s!="## Commands"' "$C/visible.md" | grep -i -E '\bcosts?\b|\btokens?\b' | grep -v -E '~|estimat'`
  prints nothing (never-say 3; T42, T43).
- **W7, one mention.** `grep -c 'maestroskills\.dev' "$C/visible.md"` prints `1`;
  `grep -c -i 'interactive showcase and documentation' "$C/visible.md"` prints `1` (A2 §10);
  `grep -c '±20%' "$C/visible.md"` prints `1`.
- **W8, no stale count.** `grep -n -E '21 commands|25 commands|25 prompt templates' "$C/visible.md"` prints
  nothing, and `for p in '25 skills' '24 commands' '7 reference files'; do grep -c -F "$p" "$C/visible.md"; done`
  prints `1` three times (A1 §5.2, never-say 2).
- **W9, "memory" only for the memory across sessions.**
  `awk '/^## /{s=$0} tolower($0)~/memory/{print (s==""?"(opening)":s)}' "$C/visible.md" | sort -u` prints
  `## Memory across sessions`, and at most `(opening)` and `## Commands` beside it (A4 §8; T rule 4).
- **W10, the command log with its file.**
  ``grep -o -E 'command log.{0,16}' "$C/visible.md" | grep -v -F 'command log (`audit.jsonl`)'`` prints
  nothing (A4 §7).
- **W11, no origin and no 🆕.**
  `grep -n -i -E 'fork of|port of|derivative|based on|inspired by|impeccable|pbakaus' "$C/visible.md"` prints
  nothing, and `grep -c '🆕' "$D"` prints `0` (never-say 1; A2 §2).

## 4. Terminology

From `terms.md` (row numbers in brackets), with A4 applied; rows marked *A4* are the owner's.

| Term | Decision | Rejected | Why |
|---|---|---|---|
| Maestro [1] · the tagline [2] | keep; the tagline verbatim, once; "fluency" never a noun in the body | a banner or badge before the identity (T1's order) | A2 §9 puts the banner and badges first; the tagline follows the title |
| workflow [3] | define at first use as the AI workflow the reader builds: prompts, context, tools, agents, retrieval, evaluation, guardrails; bare "workflow" never; no heading uses it | "LLM app", "AI system" | a rename contradicts the tagline, `agent-workflow`, `/adapt-workflow` and `maestro-workflow*` |
| AI coding agent [4, 5] *A4 §1* | "your coding agent"; never bare "agent"; "AI coding tool" gone | AI coding tool, AI assistant, harness, IDE | the tagline's word; one thing, one name |
| provider [6] *A4 §2* | "coding agent" for the tool; "provider" only as the LLM vendor, inside command descriptions | harness, integration | `/adapt-workflow`'s description uses the vendor sense |
| skills folder [17] *A4 §3* | "your coding agent's skills folder", e.g. `.claude/skills/` | provider folders, agent folders, harness folders | every path ends in `/skills` |
| VS Code Marketplace [21] *A4 §4* | always with "VS Code" | Marketplace, Visual Studio Marketplace | a Claude Code user reads a bare "Marketplace" as the plugin marketplace |
| local [27] *A4 §5* | the MCP mode; `stdio` nowhere, since no config block is shown | stdio, default | MCP jargon |
| memory layer [34] *A4 §6, §8* | neither "memory layer" nor "session memory": the heading is *Memory across sessions*; the parts are session summaries (`.maestro/sessions/`), the decision log (`decisions.jsonl`), the command log (`audit.jsonl`), the `.maestro/` folder | session memory, memory layer, persistent memory, project memory, history | "session memory" reads as memory inside one chat; "memory layer" as a component of the reader's own agent; "persistent memory" is mcp-servers' knowledge graph; "project memory" is Claude Code's `CLAUDE.md`; "history" is the extension's command history |
| command log (`audit.jsonl`) [38, 39] *A4 §7* | always with the file name | audit trail, audit log, telemetry, usage log | the core skill and `/guard` use "audit trail" for a log in the reader's product |
| MCP client [7] · MCP server [23] | glossed in the lead-in, in plain words | AI client, host; Maestro server, API | the reader may not know MCP (P §2) |
| editor [8] | the extension route only; Claude Code is never an editor | IDE | the project's word |
| skill [9] · core skill [10] · command [11] · slash command [12] | 25 skills = one core skill + 24 commands; the core skill glossed in the count line; "command" only for the 24, never a terminal line; "slash command" not a second noun | plugin, rules, bootstrap, base skill, prompt | a plugin is another package; "25 skills, 24 commands" must not read as 49 |
| reference files [13] | glossed in the count line: 7 files the core skill reads when it needs them | references, reference documentation, knowledge base | citations; docs for people; the reader's RAG store |
| the four groups [14] | Analysis, Fix & Improve, Enhancement, Utility, verbatim | frontmatter keys, problem-named groups | what the sidebar and `maestro_list_commands` show |
| route [15] · skill files [16] | keep; skill files glossed as plain folders the coding agent loads | channel, option, method; "Skills only" | the owner's words; Maestro's commands are skills |
| `npx skills` [18] | glossed as a separate installer for agent skills, not part of Maestro | skills CLI, undefined | reads as Maestro's own tool |
| build [19] | only in the contributor line: it copies the skills into the ten skills folders of the clone | install from source, generate | it installs into no project (A3 (b)) |
| VS Code extension [20] · Open VSX [22] | the chooser says it runs in VS Code, Cursor, Antigravity, Windsurf; Open VSX glossed as the open registry VS Code forks install from | IDE plugin; OpenVSX | the store's own spelling (`build-extension.yml:50`) |
| MCP tools [24] · resources [26] · `maestro_run_command` | left out | naming them | "tools" is the reader's LLM tools; "Resources" reads as a links heading |
| MCP prompts [25] | "one prompt per command, in your client's prompt menu" | prompts, prompt templates | the reader's own prompts are what Maestro works on |
| HTTP mode [28] | "HTTP", one linked clause | remote, public endpoint, transport | it is self-hosted and has no authentication (T28, L2) |
| `/teach-maestro` [29] · `.maestro.md` [30] | *First run* glosses both; the file always by its name | project profile, memory file, workflow context | every command's preamble names it |
| legacy, v1, v2 [31] | left out; say what is read first | — | the code's labels are reversed by what `/teach-maestro` writes |
| health check [32] | allowed for `/diagnose` only | audit, diagnostic scan | the `/health` endpoint stays on the MCP page |
| session [33] · `.maestro/` [35] · `/capture` `/recap` `/reflect` [36] · decision log [37] | keep; each glossed by what it holds or does | conversation; memory directory, data directory | the commands' own words |
| wave [40] | "one command run in checked phases", "held by the running server" | pipeline, multi-phase run, "in memory" | "memory" names only the section (T rule 4) |
| Zero-Defect mode [41] | glossed by what it writes, distinct from `/zero-defect` | — | the setting and the command share the name |
| cost, token estimates [42, 43] | "~", "estimate", "±20%", "not invoicing", "not billing" | cost tracking | reads as spend monitoring |
| `@maestro` [44] · Command Center, palette titles [45] | shown as what to type or click in the extension's first use only | chat participant, Quick Pick, status bar, editor adapter, context slicing | A2 §11b names these surfaces; T45's "leave out" stands for the rest |
| source of truth [46] · website [47] | keep; the website labelled "Interactive showcase and documentation" | Ecosystem | A2 §10 |
| Workflow Slop Test [48] · harness [49] · channel [50] | left out | — | the command table maps symptoms; test harness; release or chat channel |
| Writes into your project | the chooser's fourth column | "writes and records" (05's label) | "records" alone does not say which log |
| Headings | `# Maestro`; `## Getting started` with `### Skill files`, `### VS Code extension`, `### MCP server`, `### First run`; `## Commands`; `## Memory across sessions`; `## Documentation`; `## Support and contributing`; `## License` | Choose how to install, Installation, Usage, Quick start, What's inside, Key Features, Configuration, Ecosystem, Contributing alone, What Maestro adds, Session memory | T's headings check, with two departures: *First run* is the owner's phrase (A1 §5.4, A2 §11b–c) where T proposed no heading; *Memory across sessions* is A4 §8 |

## 5. What is refused outright

No document exists, so nothing is deleted from one; these are what the genre or the survey offered and this
skeleton does not take.

| Refused | Offered by | Cost of the refusal |
|---|---|---|
| An authored table of contents | 2/7 G1, Superpowers 290,955★; D14 | no in-page map; GitHub's outline and the three task links stand in |
| A sponsor or commercial aside | 3/7 G1, Superpowers; D23 | none to the four abilities; no offer exists |
| A rationale section: how it works, why, versus the sibling, key features — and 04's *What Maestro adds* | 3/7 G1 besides Spec Kit's chooser, Superpowers; Playwright MCP's *vs Playwright CLI* | no side-by-side answer to "what does this add to my coding agent's own skills or an MCP server I already run"; the reader infers it from the opening's definition and the command table |
| Install steps per coding agent | 3/7 G1 (Superpowers' 16 H3s, agents, Playwright MCP) | no restart, verify or update note per agent; one block per route and the folder list instead |
| Configuration or customization depth | 3/7 G1, Spec Kit 138,668★; D21 | settings, the extension's UI, the MCP tools and resources, HTTP flags are one link away |
| Star history | 3/7 G1, Spec Kit; D23 | no popularity signal; the badges show versions, not stars |
| Community | 2/7 G1, Superpowers | no chat or announcement channel; none exists (A2 §7) |
| Security | 2/7 G1, MCP servers 90,570★ and Playwright MCP | no single trust section; the writes sit beside the extension route; the HTTP server's lack of authentication (T28, L2) is not on this page, and HTTP is a link |
| *When Something Goes Wrong* | 1/7, Superpowers | no recovery steps; the issues link, and *First run*'s first line ("every command needs `.maestro.md` first") |
| *Philosophy* | 1/7, Superpowers; D21 | no stated principles |
| *Updating* | 1/7, Superpowers; D22 | no update block for any route; the extension's rewrite at every start is one bullet of its write list; the badges show the live versions |
| Telemetry disclosure | 1/7, Superpowers | no statement either way on whether data leaves the machine; the owner's material says nothing |
| A *Requirements* heading | 1/7, Playwright MCP, first by downloads | none; the chooser's *Needs* column holds both |
| Category bullets in place of the command table | 4/7 G1 (D08) | less scannable per category; the purpose names a table |
| Collapsed reference blocks | 1/7, Playwright MCP (D09) | none at 3 routes and 24 commands |
| Badge-only route tiles | 1/5 P5 (D11) | none; the badges sit beside instructions, not in place of them |
| The HTTP fence | D04's MCP HTTP option; the synthesis's fifth setup slot | a reader hosting one server for others follows a link (A2 §8) |
| Clone-and-build as a reader's route | D04's alternative; A1 §5.3 | a reader who wanted every skills folder generated at once copies by hand (A3 (b)) |
| A "what's new" spotlight near the top | s2's third gap (0/8 U) | returning readers do not see what changed on this page; `CHANGELOG.md` is linked (A2 §3, D29) |
| A role router | 1/8 U (Linux), s2 | no per-role sections; three task links (D13) |
| A heading of its own for the chooser | s3's "Choose how to use Maestro"; 2 of 3 exemplars head it | the chooser has no outline entry; it opens *Getting started* |
| A sample report or run | rules 13, 14 | the reader sees the report's parts, not a report |

## 6. Edits outside the document, for the owner

Not to be made by anyone in this run.

- **Stale counts** (never-say 2): "21 commands" at `package.json:4`, `mcp-server/src/tools.ts:147`, and "21"
  at `mcp-server/src/prompts.ts:5`; "25 commands" at `maestro-extension/package.json:4, :179` and
  `maestro-extension/README.md:20, :58`; "25 commands" and "25 prompt templates" at
  `mcp-server/README.md:77, :90`, which lists 24. The README's count line is the wording to align to. The
  root `package.json` also still says version 1.4.2 against 2.0.1 elsewhere (A2 §3).
- **`maestro-extension/README.md:50`** says "syncs all 25 bundled skills into 10 AI provider directories":
  only each skill's `SKILL.md` goes, into the first workspace folder, rewritten at every start (A3 (c)). The
  same page names neither the MCP config entry, the Antigravity rules file under `.agents/rules/`, nor
  `.maestro/` (A2 §4).
- **"Provider" for a coding agent**, seen by users at `maestro-extension/src/extension.ts:245` and
  `maestro-extension/README.md:48, :50`; in comments at `scripts/build.js:3, 13, 85`,
  `maestro-extension/src/extension.ts:188, 230`, `.gitignore:16` (T6, T17; optional).
- **"Audit trail"** at `mcp-server/src/tools.ts:508, :539`, `mcp-server/README.md:86`,
  `maestro-extension/package.json:4`, `reflect/SKILL.md:16`, where this README says "command log
  (`audit.jsonl`)" (T39, A4 §7; optional). `CHANGELOG.md` keeps its words (A4 §8).
- **`mcp-server/README.md:61, :63`** call the HTTP mode "Remote" and a "public HTTP endpoint"; the server has
  no authentication (T28, L2).
- **`maestro-extension/webview-ui/README.md`** is the stock Vite template (A1, preamble).
- **`skills-lock.json`** records the 22 skills from before 2.0 (A3 (a)); the owner's to refresh or leave.
- **Code questions, not text:** the core skill's 7 reference files never reach an extension user's project,
  although its `SKILL.md` links them (`maestro-extension/scripts/bundle-skills.js:71`, `extension.ts:240`;
  A3 (c)); every `@maestro` run is priced at the default rate because `participant.ts:314` passes no model
  (T42, L2); the MCP server never writes the command log (`mcp-server/src/tools.ts:11`; T38, L2);
  `maestro-extension/src/core/context.ts:5-9` says `/teach-maestro` will write `.maestro/context.md`, but it
  writes `.maestro.md` (T31).

## 7. The decisions

**Settled by the owner's answers**

| Decision | Where |
|---|---|
| Route order, skill files → extension → MCP server; the undecided reader starts with skill files | A2 §1 |
| All 24 commands, four groups, this order; the Marketplace one-liners, 🆕 removed | A2 §2 |
| Memory as a capability, no version; `CHANGELOG.md` keeps the history | A2 §3 |
| The extension's effects in full beside its route | A2 §4 |
| One contributor line with `npm run check` and `npm run build`; no Contributing section | A2 §5; A3 (b) |
| One licence line; the issues as the help destination | A2 §6, §7 |
| Only the local MCP command; HTTP by link | A2 §8 |
| Banner at the top, live badges under it | A2 §9 |
| maestroskills.dev once, "Interactive showcase and documentation" | A2 §10 |
| Each folder with its tool | A2 §11a |
| A first-use surface per route; no shared interface promised | A2 §11b |
| The first run ends on the report | A2 §11c |
| The extension by ID from the Extensions view, two registries, no terminal command | A2 §11d |
| The installer in the project root, all 25 skills, no agent named, no global install | A3 (a) |
| Clone-and-build is the contributor's check; one manual line for readers | A3 (b) |
| The extension writes only `SKILL.md`, into the first workspace folder, rewritten at every start; it adds the MCP entry | A3 (c) |
| The MCP server serves and copies nothing | A3 (c) |
| AI coding agent, coding agent, skills folders, VS Code Marketplace, local, command log (`audit.jsonl`) | A4 §1–5, §7 |
| *Memory across sessions*; its first sentence; the parts' names | A4 §6, §8 |
| Must say 1–9 and never say 1–3 | A1 §5 |
| Exemplars Spec Kit, Superpowers, Playwright MCP; no other skill project as a model | A1 §3 |

**Still the owner's, each with my default** — a default stands unless named.

1. **Where `# Maestro` and the tagline sit.** Default: under the badge row, reading A2 §9's "Under it" as
   directly under the banner. Alternative: title and tagline between banner and badges, Spec Kit's order.
2. **The MCP block's form.** Default: the command as A1 §5.3 gives it, one sentence on where it goes, and a
   link naming the four clients `mcp-server/README.md` covers. Alternative: one config block copied from
   that page, as Playwright MCP does.
3. **Updating.** Default: no section and no update block for any route.
4. **The extension's reference-file gap.** Default: not a sentence of the README ("only that file" in the
   first bullet carries it); raised with the owner as a code question (part 6).
5. **Length.** Default: 1,402 (part 2), against 04's 1,322.

**Kept against the owner's word, with the evidence**

1. A2 §1's reason, skill files are "the only route that reaches all ten tools", is not printed: the extension
   writes the same ten folders (A3 (c): "for all ten providers"), and the installer's reach is not shown (A3
   (a): "For which of the ten agents: not shown"). The default it supports stands.
2. A2 §11b's "The agent then fetches them with `maestro_run_command`" is not printed: the reader asks by
   name, and on this page "tools" means the reader's own LLM tools (T24).

**Routed outside the document**

Per-client MCP settings, HTTP mode, the MCP tools and resources → `mcp-server/README.md`. The extension's
sidebar, palette, settings and Zero-Defect's chat message → `maestro-extension/README.md`. Version history
→ `CHANGELOG.md`. The four code questions and the stale strings → part 6. The installer's behaviour → a run
(below).

**The five I am least sure of**

1. **The installer line, unrun** (A1 §5.3; A3 (a) marks where, what and for which agents as inferred).
   Settles it: one run of `npx skills add sharpdeveye/maestro` in an empty scratch project, recording the
   folders and `skills-lock.json` it writes and whether it asks which skills; the Skill files block then
   says what the run showed.
2. **Seven of the ten folder–tool pairs.** The snapshot ties only `.claude`, `.cursor` and `.agents` to a
   tool (T17; T's least-sure 4). Settles it: each agent's own skills documentation, or one run per agent; a
   folder that fails is listed as a plain folder.
3. **The MCP hand-off.** A reader new to MCP gets a command and a link, not a config block, and the prompts'
   names as a client shows them are unchecked (the synthesis's "Route-specific invocation/verification").
   Settles it: a task reader who does not know MCP adding the server to one client from this block alone,
   and the prompt list seen in that client.
4. ***First run* as a fourth `###`.** A Skill files reader passes two route blocks, by a link, to reach what
   the first run gives. Settles it: one task reader per route, from the chooser to the report, with no
   guess and no backtrack.
5. **"Workflow" defined, not renamed** (T's least-sure 1). The tagline may read as a development method
   before the definition lands. Settles it: T's cold-read probe, five readers of the title, tagline and
   first sentence; the decision stands if four answer "the LLM feature you are building", and otherwise the
   tagline goes back to the owner.
