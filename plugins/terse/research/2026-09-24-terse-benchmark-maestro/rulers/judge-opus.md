# Judge sheets: judge-opus

Texts: P.md (250 lines), Q.md (346), R.md (152). Code: terse-bench/snapshot (sharpdeveye/maestro 00f9115, root README removed). The sheet is the judging sheet from bake-off.md, adapted by the brief for texts written independently. All paths below are relative to the snapshot.

**Recognition.** I don't recognise any of the texts from memory. **Hypothesis:** Q is either the project's own README or was written from its sibling READMEs. Its analysis, fix and enhancement one-liners match maestro-extension/README.md:64-90 word for word, its 🆕 markers match :66 and :101-102, and "public … endpoint" and the "25 prompts" come from mcp-server/README.md:63,90. R reuses the same one-liners: R:100-123 equals maestro-extension/README.md:64-102 without the 🆕 markers. P's descriptions were written from the SKILL.md files.

**Evidence levels** (the repo's scale): 1, the line resolves; 2, an independent reader of the code would say the same; 3, made to happen. The level-3 checks I ran:
- `node scripts/validate.js`: 0 errors, 0 warnings.
- `ls` for the provider directories in the snapshot: none exist.
- Q's manual-install `cp`: exits 1.

I did not run VS Code, the MCP server, or any `npx` command. Claims about third-party tools fall outside the snapshot and are not counted. Where a local copy of such a tool existed (skills 1.5.25 in ~/.npm/_npx), I cite it.

## Code facts used below (level 2 unless marked)

- **F1.** There are 24 commands: 24 SKILL.md files set `user-invocable: true`, and agent-workflow sets `user-invocable: false` (source/skills/agent-workflow/SKILL.md:6).
- **F2.** Every command except teach-maestro opens with "Invoke /agent-workflow … if no workflow context exists yet, you MUST run /teach-maestro first" (e.g. source/skills/diagnose/SKILL.md:12). teach-maestro/SKILL.md has no such line.
- **F3.** The MCP server registers prompts only for user-invocable skills (mcp-server/src/prompts.ts:9), so it has 24 prompts.
- **F4.** Only the extension's @maestro handler writes `.maestro/audit.jsonl` (maestro-extension/src/chat/participant.ts:317). The MCP server imports `appendAudit` but never calls it (mcp-server/src/tools.ts:11). No skill writes the file.
- **F5.** The only cost computation passes `estimateCost(null, …)`, which falls back to the default $2/$8 per million tokens (participant.ts:314; packages/core/src/cost-estimator.ts:39,66). Input tokens count only the sliced project context (participant.ts:313).
- **F6.** `.maestro/.gitignore` is written only by core `ensureMaestroDir` (packages/core/src/decisions.ts:29-36,54-58). That function runs from the extension (participant.ts:317,329) and from MCP `maestro_write_decision` (tools.ts:440). /capture run as a skill writes the session file and decisions.jsonl (source/skills/capture/SKILL.md:30,58) but no .gitignore.
- **F7.** @maestro sends each request to the first model the editor lists (participant.ts:127-134). It passes no tools (`model.sendRequest(messages, {}, token)` at :195 and :268) and never reads `chatContext` (received at :49, unused). Its only output is `stream.markdown`.
- **F8.** On every activation the extension adds its server entry to each of .vscode/.claude/.agents `mcp.json` that exists, parses as JSON and lacks the entry. If no file gained the entry, it rewrites `.vscode/mcp.json` with Maestro as the only server (maestro-extension/src/adapters/mcp-config.ts:47-75,93-104,115-118,136-150). That happens on every start after the first, and whenever the file contains comments.
- **F9.** The provider directories (.claude/, .cursor/, …) are build output and are gitignored (.gitignore:16-27; scripts/build.js:14-25,72-80). They are absent from the snapshot (level 3, `ls`).
- **F10.** The HTTP transport serves POST /mcp and GET /health with no authentication (mcp-server/src/http.ts:14-50). The default port is 3001 (mcp-server/src/index.ts:24).
- **F11.** VS Code's workspace MCP file uses the `servers` key (mcp-config.ts:21-22; mcp-server/README.md:47-58).

---

## Sheet P: 2404 words

### 1. Veto: false claims. Count: 1. Not vetoed.

| Line | Claim | Code |
|---|---|---|
| P:90 (loosely restated at P:14) | "every command loads it first" | Not true of teach-maestro, which has no `Invoke /agent-workflow` line (F2). This is not a decision point: P:26 and P:32 install every folder. |

**Checked and holding** (level 2 unless marked):

- Counts and first run:
  - P:14, P:145: F1, F3.
  - P:34: teach-maestro/SKILL.md:18-49,75; F2.
  - P:36, P:48: diagnose/SKILL.md:16-67,81,97-107,132.
- Command descriptions:
  - P:49: evaluate/SKILL.md scenario table.
  - P:50: reflect/SKILL.md:22-23 plus its five dimensions.
  - P:60: zero-defect/SKILL.md:20-46,61-63.
  - P:66-86: each checked against its SKILL.md.
- Project files and logs:
  - P:98-101: agent-workflow/SKILL.md:14-20; capture/SKILL.md:30,58; recap/SKILL.md:20-21; F4.
  - P:103: F5, F6; token-estimator.ts:22.
- MCP server:
  - P:107: mcp-server/package.json:51-53.
  - P:111-133: the config forms match mcp-server/README.md:21-59.
  - P:138-141: F10, including the no-auth warning.
  - P:146: resources.ts:9-56.
  - P:151-158: tools.ts:145-544. Defaults are 20 (:474) and 50 (:511); `maestro_init` writes nothing (:275-285).
  - P:164-170: wave-state.ts:43-50,99-136; wave-engine.ts:49-61,83-154,257-264; participant.ts:144.
- Extension behaviour:
  - P:174: maestro-extension/package.json:3,16.
  - P:176: extension.ts:129-173,261-310; sidebar/provider.ts:46-47.
  - P:177: F7; context-slicer.ts:47-159.
  - P:178: statusbar/manager.ts:21; participant.ts:57-67; extension.ts:76-97.
  - P:179: context-status.tsx:27-37 leads to extension.ts:108-111.
  - P:183: adapters/editor.ts:13-28.
  - P:184: `zeroDefectAutoInject` appears only in package.json:284 and the extension README (grep).
- Extension writes:
  - P:188-190: package.json:32-34; extension.ts:190-241.
  - P:191: F8.
  - P:193: editor.ts:33-75,104-121. On toggle-off, a file that holds only the block is left unwritten (:68-74).
- Development and CI:
  - P:210, P:219: validate.js:50-78; the check passes (level 3).
  - P:216: F9.
  - P:221-241: mcp-server/esbuild.config.cjs:20-26 with package.json:40; maestro-extension/esbuild.config.js:18-20; package.json:304-315.
  - P:244: build-extension.yml:3-54; publish-mcp.yml:3-37.

**Outside the snapshot, not counted:**
- P:26 matches skills 1.5.25: it prompts "Which agents do you want to install to?", and `-g` installs to the user directory.
- P:112 uses Claude Code CLI syntax, which the snapshot can't confirm.

### 2. The reader's four needs

- **Fit: yes.** P:14 says what Maestro is (24 commands, each an instruction set). P:16-22 names the three forms and the agents each serves. P:42-86 lists the commands.
- **Install: yes.**
  - Skill files: P:26-32.
  - MCP: P:107-141 covers each client, including Claude Code (P:111-113) and the no-auth warning (P:141).
  - Extension: P:174, with everything it writes, including the mcp.json wipe (P:188-193).
  - Gap: P never says to keep all 25 skills when the installer offers a subset. R:33 does.
- **First run: yes for skill files, partly for the other routes.**
  - Skill files: P:34 makes `.maestro.md` in the project root the success signal, and P:36 says what /diagnose returns.
  - MCP and extension: P:40 sends these readers elsewhere, and P:176-179 give only mechanisms. P:179 offers /teach-maestro through @maestro, with no first-run recipe and no success signal.
  - P:177 does describe @maestro as a bare model call, so it promises nothing false.
- **Next command: yes.**
  - P:44-86 gives specifics for every command.
  - P:36 gives the improvement sequence.
  - P:38 covers arguments and /capture → /recap.
  - P:90 describes the slop test, which maps symptoms to commands.

### 3. Words that do not pay

- **P:195-244, repository layout and development (331 words).** This is contributor and maintainer material the reader does not need: build order, CI triggers, and publishing (P:244, 45 words). It sits last, under its own headings.
- **P:170, first sentence (27 words).** The wave heuristic's list of checks.
- **P:103, "Token counts in the logs are estimated as characters ÷ 3.7" (12 words).** The formula; the reader needs only "rough estimates".

Total ≈370 words (15%). No marketing. Repetition is limited to reference restatements: P:34/P:80, P:38/P:85-86, P:22/P:186-191.

### 4. Length

2404 words (wc -w): 2135 outside code blocks, HTML and badges; 218 inside code blocks.

---

## Sheet Q: 1478 words

### 1. Veto: false claims. Count: 12. Vetoed.

| # | Line | Claim | Code | Decision point |
|---|---|---|---|---|
| 1 | Q:17, Q:20, Q:35, Q:91 | 25 commands | There are 24 (F1). Q's own tables list 24 (Q:97-135). | no |
| 2 | Q:49-55 | Right after install, "use any command", starting with /diagnose | diagnose/SKILL.md:12 says "you MUST run /teach-maestro first" (F2). The Quick Start never names /teach-maestro. | first run |
| 3 | Q:66-71 | "Combine Commands": `/diagnose /calibrate /refine` runs a pipeline | No code chains commands. The extension takes one `request.command` per message (participant.ts:71,94), and no skill chains either. | no |
| 4 | Q:147 | `.maestro/context.md` "replaces .maestro.md" | /teach-maestro writes `.maestro.md` (teach-maestro/SKILL.md:75), and `maestro_init` tells the agent to save `.maestro.md` (tools.ts:262,281). Nothing writes context.md. | no |
| 5 | Q:155 | `.maestro/` is created "only" by /capture or the extension | MCP `maestro_write_decision` creates it too (tools.ts:429,440; decisions.ts:42-47,89). Minor. | no |
| 6 | Q:156 | Session data is gitignored by default | Only `ensureMaestroDir` writes .gitignore (F6). On Q's skill-file route, /capture writes sessions and decisions.jsonl with no .gitignore. | no |
| 7 | Q:160 | "Every command invocation is logged" with duration, tokens and cost | Only @maestro runs in the VS Code extension are logged (F4), and Q never describes that route. | no |
| 8 | Q:168 | Cost tracking "for Claude, GPT-4, Gemini", accurate to "±20%" | The model is always null, so the price is flat, and input counts only the sliced context (F5). | no |
| 9 | Q:224 | The `mcpServers` block also serves "VS Code" | VS Code's workspace file uses `servers` (F11). | install |
| 10 | Q:251, Q:315 | 25 MCP prompts | There are 24 (F3). | no |
| 11 | Q:252 | Tools `list_commands` … `read_audit` | Every tool name carries the `maestro_` prefix (tools.ts:146,156,221,261,290,332,388,428,470,507). Minor. | no |
| 12 | Q:257-267 | Fallback install: `cp -r .claude/skills/ your-project/.claude/skills/` from the repository | The provider directories are gitignored build output (F9) and are absent from the snapshot. The `cp` exits 1 (level 3). | install |

**Vetoing claims:**
- **#12:** the fallback install fails as written.
- **#9:** VS Code users get a config key their editor does not read.
- **#2:** the first run goes to /diagnose, which sends the reader back to /teach-maestro.
- **Q:239, missing warning:** "Host Maestro as a public MCP endpoint" says nothing about the endpoint having no authentication (F10). Its tools create and append files at any path the caller gives (tools.ts:431-449; decisions.ts:42-58).

**Not counted:**
- Q:12, the static version badge.
- Q:332, a contributor rule that capture, recap and reflect break (their SKILL.md:3). It is a rule, not behaviour.
- Q:203-214, which agent reads which folder. This is outside the snapshot.

### 2. The reader's four needs

- **Fit: partly.** Q:30-39 names the problem and the features, and Q:201-214 names the tools. But the fit-relevant features at Q:160 and Q:168 are overstated (#7, #8).
- **Install: partly.**
  - Q:46 works.
  - The MCP block is wrong for VS Code (Q:224), and the fallback install fails (Q:257-267).
  - The extension route is only a badge (Q:14), with nothing on what the extension writes.
- **First run: no.**
  - Q:49-55 starts at /diagnose (#2).
  - /teach-maestro appears only as a table row (Q:133).
  - No success signal appears, apart from a sample /reflect scorecard (Q:174-183).
- **Next command: partly.**
  - Q:91-135 gives grouped one-liners, several of them empty: "Holistic review of workflow interaction quality" (Q:98), "Boost capabilities with better tools and context" (Q:115), "Push past conventional limits — advanced techniques" (Q:123).
  - Q:66-71 offers combinations that don't exist.

### 3. Words that do not pay

- **Q:1-24, banner, 8 badges, tagline, nav (67 words).** Decoration; the commands badge is false (Q:17).
- **Q:30-32 (41 words).** Marketing: "only as good as", "fights that pattern".
- **Q:66-71 (25 words).** A feature that does not exist.
- **Q:75-87 (84 words).** A reference list between the Quick Start and the commands.
- **Q:139-183, "What's New in v2" (174 words).** Changelog material in the README; it carries five of the false claims (#4-#8).
- **Q:187-197, anti-patterns (76 words).** Restates the skill.
- **Q:271-323, project structure (256 words).** A contributor's file tree.
- **🆕 markers** at Q:99, 134, 135, 280, 300, 301, 306, 307, 308.

Total ≈723 words (49%).

### 4. Length

1478 words (wc -w): 1017 outside code blocks, HTML and badges; 398 inside code blocks.

---

## Sheet R: 1379 words

### 1. Veto: false claims. Count: 1. Vetoed.

| Line | Claim | Code |
|---|---|---|
| R:59-66 with R:93-94 | On the extension route, `@maestro /teach-maestro` and `@maestro /diagnose` in VS Code's chat "give" what First run describes: an interview whose answers are saved as `.maestro.md`, and a report on your workflow. | @maestro sends each turn on its own to the first listed model, with no tools (F7). It cannot keep the interview, which /teach-maestro runs one section at a time, waiting for answers (teach-maestro/SKILL.md:20). It cannot write `.maestro.md` (:75). /diagnose receives no code to read (participant.ts:69-91), which diagnose/SKILL.md:138 forbids. Level 2: I did not run VS Code. |

**Veto:** this claim. On the VS Code route the first run ends with no `.maestro.md`, and every later command sends the reader back to /teach-maestro (F2).

**Also at a decision point, not counted as a false claim:** R:52-55 (and R:22) list what the extension writes "without asking" as "An MCP server entry in the workspace's MCP config". On every start after the first, the extension rewrites `.vscode/mcp.json` with Maestro as its only server (F8). The warning is missing at the point where the reader decides to install.

**Checked and holding:**
- Overview and install:
  - R:11: F1; agent-workflow/SKILL.md:6,66-198.
  - R:22-23, R:54, R:56-57: extension.ts:190-241; editor.ts:33-121; decisions.ts:29-36; mcp-server/package.json:51-53.
  - R:33, "every command except /teach-maestro loads the core skill first": F2.
  - R:35-37: build.js:14-25.
  - R:59, the palette titles: maestro-extension/package.json:71,131.
- MCP:
  - R:85: wave-state.ts:1-7,67-94.
  - R:87: prompts.ts:12-13.
- First run:
  - R:91: F2.
  - R:93, "if .maestro/context.md already exists, that is read first instead": true as the commands' lookup order (agent-workflow/SKILL.md:14-15; tools.ts:99-102; context.ts:11). Where it stands, it can read as /teach-maestro's own behaviour, which it is not.
  - R:94: diagnose/SKILL.md:16,81,97-107.
- Memory and contributing:
  - R:129-131: capture/SKILL.md:30,58; recap/SKILL.md:20-21; reflect/SKILL.md:22-23.
  - R:133: F4.
  - R:148: build.js:72-80.

**Outside the snapshot, not counted:**
- R:33, "chooses your coding agent's folders itself": the local skills 1.5.25 prompts "Which agents do you want to install to?", though its README says it detects installed agents.
- R:21 and R:33, `skills-lock.json`: the CLI writes `skills-lock.json` in the working directory, and the snapshot carries one.
- R:83, "the other clients": a claim about a document, recorded under need 2. mcp-server/README.md covers only Claude Desktop, Cursor and VS Code/Antigravity (:21-59).

### 2. The reader's four needs

- **Fit: yes.** R:9-11 says what Maestro is, for which agents, and what the 25 are (1 core + 24 commands + 7 references). R:17-23 compares the routes by where they work, what they need and what they write.
- **Install: partly.**
  - Skill files are complete: R:17 makes them the default, R:30-37 gives the install, R:33 says "Install all 25", and R:37 lists the folders.
  - Extension: R:50, with its writes (R:52-57), but without the mcp.json rewrite.
  - MCP: R:70-81 covers Claude Desktop and Cursor. R:83 sends Claude Code and HTTP readers to a README that has no Claude Code form and no warning for HTTP: mcp-server/README.md:63 calls it "a public HTTP endpoint".
- **First run: yes on skill files and MCP, no on the VS Code extension route.** R:39-46, R:87 and R:91-94 say what each command gives, so the reader can tell it worked. The VS Code route is the vetoed claim.
- **Next command: partly.**
  - R:98-123 is one table with groups and SKILL.md links, but its one-liners carry little, e.g. R:101 and R:115 ("Push past conventional limits — advanced techniques"; compare P:73).
  - R:125-135 describes the capture → recap → reflect loop.

### 3. Words that do not pay

- **R:66 and R:87 (18 words).** They repeat R:46's "See First run for what these two give you."
- **R:22, the extension's "writes" cell (33 words).** Restated in full at R:52-57.
- **R:57 (14 words).** Quotes the .gitignore's heading instead of saying the logs are ignored.
- **R:127 (18 words).** Tells the reader the sessions are theirs.
- **R:17 (32 words).** Defines skill files and an MCP server for a reader who builds LLM features.

Total ≈115 words (8%). No marketing.

### 4. Length

1379 words (wc -w): 1337 outside code blocks, HTML and badges; 23 inside code blocks.

---

## Ranking

1. **P:** it is the only text without a veto, and its one false claim (P:90, "every command loads it first") sits at no decision point.
2. **R:** it is vetoed for a single claim (R:66 → R:93, that `@maestro /teach-maestro` saves `.maestro.md` in VS Code), against Q's twelve false claims.
3. **Q:** it fails at the install itself: the fallback at Q:257-267 copies `.claude/skills/`, a gitignored build output the repository does not contain.

Length (P 2404, Q 1478, R 1379) played no part in the ranking.
