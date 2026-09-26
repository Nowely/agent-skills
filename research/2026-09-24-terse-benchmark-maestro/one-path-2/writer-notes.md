## Result

I wrote the draft and the budgets, and nothing else:
- `$TMPDIR/terse-bench-D2/writer/01-draft.md` (1230 words)
- `$TMPDIR/terse-bench-D2/writer/budgets.json` (written before the text)

I only read and grepped. I installed nothing, used no network and ran none of the project's code. **One slip:** my first word-count command wrote six scratch files to `/tmp/terse-sec-*`, which is outside `$TMPDIR`. I deleted them straight away, and `ls` confirms they are gone.

## Plan

Words are counted with `wc -w` over each section's markdown, so headings, code and table pipes count.

| Section | What it gives the reader | Device | Budget | Actual |
|---|---|---|---|---|
| (opening) | What it is, the job it does, why it beats prompting alone, whether it fits their tool | Banner as H1, two-sentence mission, five bold-led advantages, link row | 150 | 154 |
| Quick start | Install by the route that fits, then the first two commands and what comes back | H3 Install: two bold-led routes, each with a bash block. H3 First run: two text blocks with one outcome sentence each | 200 | 152 |
| Commands | The command for their next problem | Four H3 groups named by problem; each is a 3-column table (command, what it does, use it when) | 560 | 630 |
| MCP server | The narrower route | One sentence, a JSON config, what the client gets, npm link for depth | 120 | 88 |
| How it works | How the commands work, what the extension adds, what gets written | A paragraph, three bold-led bullets, one "what it writes" paragraph | 190 | 163 |
| Contributing | Where to edit, how to check and build | Two sentences and a bash block | 55 | 43 |

**Left out on purpose:**
- the staged execution ("waves")
- context slicing and token savings
- cost estimates
- the status bar, Quick Pick and extension settings
- the HTTP mode, which is left to the npm page

## Evidence notes

Paths are relative to `.../terse-bench/snapshot`. Levels: **L1** the line resolves, **L2** an independent reader would agree. Nothing here reached level 3, because I ran nothing.

**Opening**
- **"24 slash commands"**: 24 SKILL.md files carry `user-invocable: true` (grep count); `agent-workflow/SKILL.md:6` is false. L2.
- **"check / fix / add"**: the frontmatter categories (e.g. `diagnose:5`, `fortify:5`, `amplify:5`) and `mcp-server/src/tools.ts:19-24`. L2.
- **What breaks** (unstructured prompts, stuffed context, too many tools, no evaluation, no guardrails): `agent-workflow/SKILL.md:180-216`. L2.
- **"/teach-maestro asks once… others build on the answers"**: `teach-maestro/SKILL.md:3,22-49`. All 23 other skills say "Invoke /agent-workflow… Follow the protocol" (grep 23/23, e.g. `diagnose:12`), and the protocol is at `agent-workflow:13-17`. L2.
- **"/diagnose names the command for each gap"**: `diagnose:97-110`.
- **"each command suggests the next"**: `### Recommended Next Step` is in 24 of 24 command files. L2.
- **Tool list**: the ten folders at `scripts/build.js:14-25` and `maestro-extension/src/extension.ts:197-208`. `.agents` maps to Antigravity per `adapters/mcp-config.ts:25-26` and `editor.ts:98-111`. L2 for the folder-to-tool mapping; whether each tool actually loads the folder is outside the code.
- **/capture and /recap**: `capture:18-58`, `recap:16-42`. L2.
- **Links**: maestroskills.dev from `maestro-extension/package.json:14` and `webview-ui/src/App.tsx:75`; the Marketplace URL from `maestro-extension/README.md:5`. L1.

**Quick start**
- **`npx skills add sharpdeveye/maestro`**: `maestro-extension/CHANGELOG.md:11` and `skills-lock.json:5-6`. L2. Not run: it downloads the repo from GitHub, which the brief forbids.
- **`code --install-extension sharpdeveye.maestro-workflow`**: the ID comes from `maestro-extension/package.json:2,6` and `src/test/suite/extension.test.ts:7`. L2. Not run: it would change the editor.
- **Open VSX**: `.github/workflows/build-extension.yml:50-54`. L2. It publishes on `ext-v*` tags; that Cursor and Antigravity use that store is outside the code.
- **"Each time you open a project… writes skills… for every supported agent"**: `package.json:32-34` (onStartupFinished) and `extension.ts:38-39,186-252`. L2.
- **"Sidebar sends any command"**: `command-list.tsx:10-49` (all 24), `sidebar/provider.ts:46-50`, `extension.ts:114-125,261-310`. L2 for VS Code. L1 for Cursor, where the code only attempts it and falls back to an error at `:283-294`.
- **/teach-maestro** (once per project, five topics, saves `.maestro.md`): `teach-maestro:3,18-49,53-75`. L2 in agents that have file tools; see Q1.
- **/diagnose** (1–5 on five areas, findings, commands, lowest score first): `diagnose:16-67,71-93,97-110,130-132`. L2.

**Commands table**
- The "use it when" cells rest on each skill's `description` at line 3. The "what it does" cells rest on:
  - `diagnose:16-67,97-110`
  - `evaluate:55-63,69`; the "after a change" cell rests on the next-step lines of refine, fortify, streamline, temper, accelerate, amplify, guard and turbocharge
  - `reflect:20-49`
  - `fortify:11-52`; `guard:20-76`
  - `refine:10-49` plus its rule against changing behavior
  - `calibrate:12-40,56`; `streamline:23-45`; `temper:22-29`
  - `zero-defect:16,20-33,61-63`
  - `amplify:10-32`; `enrich:9-32`; `chain:12-33`; `compose:11-19`
  - `iterate:20-76`; `accelerate:10,23-66`; `turbocharge:19-23,27-58`
  - `onboard-agent:10-60`; `adapt-workflow:10-18`; `specialize:18-52`; `extract-pattern:8,27-41`
  - `capture:18-30,71`; `recap:16-42`
  - All L2.
- **/reflect condition**: `.maestro/audit.jsonl` is written only at `chat/participant.ts:317`, the only `appendAudit` call; `tools.ts:521` says the same. L2.

**MCP server**
- **The config**: `mcp-server/README.md:21-32`; `bin` at `mcp-server/package.json:6-8`. L2.
- **What the client gets**: prompts at `prompts.ts:8-43`; resources at `resources.ts:8-56` and `scripts/bundle-skills.js:98-113`; ten tools (ten `server.tool(` calls counted), with run_command at `:155-217`, read_context at `:220-257`, decisions at `:427-503`. L2.
- **"Extension registers it"**: `extension.ts:41-42` and `mcp-config.ts:38-82`. L2.
- **npm page content**: the page is `mcp-server/README.md` (shipped via `files` at `package.json:46-50`); tools are at `:73-86`, HTTP at `:61-69`. L2.

**How it works**
- **"All but /teach-maestro first load agent-workflow"**: grep 23/23. L2.
- **Core skill content**: `agent-workflow:38-44,202-217` and the seven `reference/` files. L1.
- **@maestro**: `package.json:174-280`; `participant.ts:69-91,93-117,124-140` (first model from `selectChatModels`) and `295-342` (logs each run). L2.
- **Zero-Defect**: `package.json:57-60`, `header.tsx:45-66`, `extension.ts:76-98`, `participant.ts:57-67`, `editor.ts:33-121`. L2.
- **What it writes**: `teach-maestro:75`, `capture:30,58`, `packages/core/src/decisions.ts:29-104`, `audit.ts:48-65`, `extension.ts:197-241`, `mcp-config.ts:88-151`, `editor.ts:80-121`. Every write call resolves under the workspace or project root (grep). L2.

**Contributing**
- `scripts/build.js:4,72-83`; `maestro-extension/scripts/bundle-skills.js:12-15` with `package.json:305-308`; `scripts/bundle-skills.js:12-15` with `mcp-server/package.json:11-12`; `package.json:24-27`; `validate.js:19-81`; `.gitignore:11-27`. L2.

**Words like "every" and "all" that critics should run** (rule 20): I showed each one only by reading every instance, not by running.
- "each command suggests the next"
- "All but /teach-maestro"
- "every supported agent"
- "any command"
- "every @maestro request"
- "every tool"
- "validate every SKILL.md"
- "all build their copies"

## Rules set aside, with the reason

- **rules.md 9 (Update):** set aside. The code has no update command for any route, and rule 18 forbids inventing one.
- **rules.md 13 (order):** kept, with two sections added.
  - "MCP server" sits between the table and How it works. Rule 8 sends a narrower route "further down", and an install route reads better before the internals.
  - "Contributing" closes the page, as in 5 of 7 of the surveyed READMEs, and the purpose asks for it.
- **rules.md 3 (the rationalizer's check):** that step is a critic's, so I only ran it on myself. The first two sections keep one path, `.maestro.md`, which the reader gets and the commands need. They keep one store name, Open VSX, which Cursor and Antigravity readers need. There are no versions and no protocol names.
- **Title:** there is no text H1; the banner is the H1 (`# ![Maestro](assets/banner.png)`). The snapshot's own two READMEs open with this banner, and the first sentence names Maestro in bold.
- **writing-rules "contract, constraint or reason":** not set aside, but in tension with rules.md 5's selling bullets. I kept each bullet as a contract: it names a command and states what it does, checked against the file.
- **writing-rules "a dated measurement keeps its numbers":** does not apply, because the text has no measurements (rule 16).
- **curse-of-knowledge example "name… the language runtime in the first setup paragraph":** not applied. It is an example from another README, and rules.md 3 and the owner's Node remark say the runtime is noise here.
- **Budget:** Commands came to 630 against 560 (+12%). Counts prompt a review, not a gate. Table syntax is about 220 of those words and the cells average about 17. Cutting further would drop the details that tell similar rows apart (rule 10). The total is 1230 against 1275.
- **Forbid-list judgment:** the purpose asks for a maestroskills.dev link, and the brief says never to cite that site. I kept the bare link without reading it or saying anything about its content. The install command necessarily names `sharpdeveye/maestro`. Drop the link if the owner counts a link as citing.

## Hidden-knowledge inventory (step 1 of curse-of-knowledge.md)

These are the things a reader would need to know already, and how the draft handles each:
1. **What a "skill" is.** Framed at the install choice ("the command files themselves") and defined in How it works.
2. **Two different agents.** The commands act on the app you build, not on your coding agent. The draft says "your app" throughout; the /zero-defect row says "your coding agent".
3. **Cursor fits both routes.** The two labels say what each route gives.
4. **The extension writes into your repo.** Stated where you decide to install.
5. **Run /teach-maestro first.**
6. **What comes back.** Stated for both first commands.
7. **/reflect needs logs that only `@maestro` writes.** Stated in its "use it when" cell.
8. **`@maestro`.** First met in the /reflect row, framed as the extension's.
9. **MCP.** Confined to its own section.
10. **How your tool invokes a skill** (Codex may differ). Not covered: the reader knows their tool, and I can't verify it.
11. **"Pre-commit gate".** The zero-defect skill's term would suggest a git hook, so the draft avoids it.

## Questions for the owner (rule 23)

- **Q1.** "Run /teach-maestro once, then /diagnose" works in agents that load skills and have file tools. Through the extension's `@maestro` in VS Code chat, the interview cannot finish (L2):
  - the handler ignores chat history (`participant.ts:47-52`, `chatContext` is unused);
  - the participant is not sticky (`package.json:180`);
  - `sendRequest(messages, {}, token)` passes no tools (`:195,:268`).
  - So the answers never come back to /teach-maestro, and nothing can save `.maestro.md`. The draft says "In your agent's chat" and does not point VS Code users to `@maestro /teach-maestro`. What should a VS Code reader who only has Copilot type first?
- **Q2.** Keep or drop the maestroskills.dev link?

## Bugs spotted in the code (already there before this work; not in the README, not fixed)

- **D1. MCP config can be overwritten** (`mcp-config.ts:47-75`). `configured` becomes true only when the entry is "added". On the next start the entry already exists, so `createDefaultConfig` rewrites `.vscode/mcp.json` with Maestro's entry alone and drops the user's other servers. This contradicts the comment at `:35-36`. L2.
- **D2. Reference files never installed** (`extension.ts:215-241`). The extension writes only each SKILL.md, so `agent-workflow/reference/*.md` is never installed, though `agent-workflow/SKILL.md:66-198` links to those files. L2.
- **D3. Dead setting.** `maestro.zeroDefectAutoInject` is declared (`package.json:284-288`) but never read in `src`. L1.
- **D4. Leftover placeholder.** `agent-workflow/SKILL.md:225` still ends in a raw `{{available_commands}}`, which `maestro-extension/CHANGELOG.md:11` says was removed. L1.
- **D5. Stale counts.** `tools.ts:147` and `prompts.ts:5` say 21, and `mcp-server/README.md:90` says 25; the code registers 24. L1.
- **D6. Unwritten context path.** `context.ts:9` says `/teach-maestro` writes `.maestro/context.md`, but the skill saves `.maestro.md` (`teach-maestro:75`), and nothing writes the first path. L1.
- **D7. Open HTTP mode.** It has no authentication and `app.listen(port)` binds every interface (`http.ts:14-50`). Its tools read and append under any `projectPath` a client sends (`tools.ts:93-112,427-449`), while the README at `:63` calls it "a public HTTP endpoint". L2.
- **D8. UI inconsistencies.**
  - The sidebar puts /temper under Utility (`command-list.tsx:35-48`), while its frontmatter says enhancement (`temper:5`).
  - `maestro.debugChatCommands` is contributed (`package.json:153-156`) and the test expects it (`extension.test.ts:46`), but `extension.ts` never registers it.
  - L1.
