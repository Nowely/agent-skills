# Truth pass: Q.md

Q.md is a README of sharpdeveye/maestro at 00f9115. Paths are relative to the snapshot root, `$TMPDIR/terse-bench/snapshot`. The snapshot was not modified.

**How level 3 was reached.** Everything ran in a fresh copy under `$TMPDIR/truthQ-work/repo`, with npm's cache at `$TMPDIR/truthQ-work/npm-cache`. The copy was built with its own scripts: `npm run check`, `npm run build`, core `tsc`, `mcp-server` `npm run build`, and the extension's `bundle-skills` and `build:ext`.

The drivers are in `$TMPDIR/truthQ-work/drivers/`:
- `stdio.mjs`, `memory.mjs`, `wave.mjs` and `refs.mjs` drive the MCP server over stdio with the SDK client.
- `http.mjs` and raw `curl` test the HTTP transport; `reuse.mjs` reproduces its error in isolation.
- `ext.cjs`, `ext2.cjs` and `ext3.cjs` drive the extension's built `dist/extension.js` through a mock `vscode` module (`$TMPDIR/truthQ-work/mock-vscode`).

"Proxy" means the command ran against the local copy instead of the npm registry or GitHub, which this pass may not fetch: a packed tarball, or a local path. After the whole run was rebuilt from a fresh copy, every result below reproduced.

**Reading the Level column.** For confirmed rows it is the level reached. For refuted rows it is the level at which the contradiction was established.

| Line | Claim (quoted) | Verdict | Level | Evidence |
|---|---|---|---|---|
| 15 | "MCP Compatible" (badge) | confirmed | 3 | The built server answered `initialize`, `tools/list`, `prompts/list` and `resources/list` from the SDK client over stdio, as serverInfo `maestro-workflow-mcp` 2.0.1 (`stdio.mjs`). For HTTP, see L239/245. |
| 16 | "skills 25" (badge) | confirmed | 3 | `npm run check` prints "Checking 25 skills". The bundler prints "Total: 25 skills, 7 references". |
| 17 | "commands 25" (badge) | refuted | 3 | 24 SKILL.md files carry `user-invocable: true`; `source/skills/agent-workflow/SKILL.md:6` has `false`. `prompts/list` returns 24, and `maestro_list_commands` lists 24. |
| 18 | "providers 10" (badge) | confirmed | 3 | `npm run build` printed "10 providers x 25 skills = 250 skill copies" (`scripts/build.js:14-25`). Activating the extension wrote the same 10 directories (`extension.ts:197-208`). |
| 20 | "1 core skill · 25 commands · 7 domain references · memory layer · audit trail" | refuted | 3 | "25 commands" is wrong for the reason in L17. The other four parts hold: 1 core skill, 7 `maestro://reference/*` resources, and `packages/core/src/decisions.ts` and `audit.ts`. |
| 34 | "A comprehensive **agent-workflow** skill with 7 domain-specific reference files" | confirmed | 3 | `npm run check` lists 7 files in `agent-workflow/reference/`. `resources/list` returns 7 reference URIs. |
| 35 | "**25 commands** to diagnose, evaluate, refine, streamline, fortify, capture, reflect, and more" | refuted | 3 | There are 24 commands (see L17). |
| 36 | "**Persistent memory** — decisions, audit trail, and session history survive across sessions" | confirmed | 3 | Two `maestro_write_decision` calls were made, the server process was ended, and a new process's `maestro_read_decisions` returned both (`memory.mjs`). The audit trail and sessions are plain files under `.maestro/` (`packages/core/src/audit.ts:60-62`, `source/skills/capture/SKILL.md:30`). |
| 37 | "Curated **anti-patterns** that explicitly tell the AI what NOT to do" | confirmed | 3 | The served `maestro://skill/agent-workflow` carries seven DON'T lists (`agent-workflow/SKILL.md:58-64` … `190-196`). Every reference ends with an "Anti-Patterns" section. All seven items from L191–197 were found in the served text (`wave.mjs`). |
| 38 | "A **context gathering protocol** (`.maestro.md` or `.maestro/context.md`) that ensures every command has project-specific awareness" | refuted | 3 | `maestro_wave_start {command:"fortify"}` returns only a generic AUDIT phase prompt: no protocol, no project context, no skill text (`wave.mjs`). `projectPath` is optional (`mcp-server/src/tools.ts:294`). In `@maestro /accelerate` with no context file, the model gets 2 messages, no protocol body and no tools (`options {}`), yet is told to "Invoke /agent-workflow" (`ext2.cjs`; `maestro-extension/src/chat/participant.ts:57-122,268`). The protocol exists (`agent-workflow/SKILL.md:9-29`), and 23 of 24 command skills point to it; teach-maestro does not. |
| 39 | "**Every command recommends a next step** — no dead ends" | refuted | 3 | All 24 command skills have a "### Recommended Next Step" section. But a fortify wave run through the MCP tools ends with "All 4 phases executed successfully." and no next step, and none of its phase prompts asks for one (`mcp-server/src/wave-state.ts:54-63`, `tools.ts:353`; `wave.mjs`). |
| 46 | "`npx skills add sharpdeveye/maestro`" | confirmed | 3 (proxy) | Not run against GitHub, which the brief forbids. `npx skills@1.7.0 add <clean copy> --list` printed "Found 25 skills". Run with `-a claude-code -s '*' -y --copy`, it installed 25 SKILL.md files and the 7 references into `./.claude/skills`. |
| 49 | "Then use any command in your AI coding agent" | unverifiable | — | Checking this needs a run in a host agent. Whether the installed skills appear as slash commands is the agent's behaviour; the guarantee in "any" was not reached. |
| 52–55 | "/diagnose # Find workflow issues", "/streamline # Remove unnecessary complexity", "/fortify # Add error handling", "/refine # Final quality pass" | confirmed | 2 | `diagnose/SKILL.md:16`, `streamline/SKILL.md:18`, `fortify/SKILL.md:17-48`, `refine/SKILL.md:16`. |
| 58 | "Most commands accept an optional argument to focus on a specific area" | confirmed | 3 | All 24 prompts declare an optional `focus` argument. `prompts/get diagnose {focus:"prompts"}` returns text that starts "Focus area: prompts" (`refs.mjs`, `stdio.mjs`). All 24 skills have `argument-hint`, and `@maestro` passes the text on as the user message (`ext.cjs` S5). |
| 66–70 | "Combine Commands": "`/diagnose /calibrate /refine` # Full workflow: audit → standardize → polish" and "`/evaluate /fortify /accelerate` # Review → harden → optimize" | refuted | 3 | Through `@maestro`, `/diagnose /calibrate /refine` loads only diagnose's skill. Calibrate's and refine's texts are absent from the messages sent (the base messages are reused for all three wave phases, `wave-prompts.ts:15`). "/calibrate /refine" arrives as plain user text, and only `diagnose` is logged (`ext.cjs` S5; `participant.ts:94-117`). The MCP server takes one command per call (`tools.ts:159-161`, `prompts.ts:12`), and no skill mentions combining commands (grep). Host agents were not run. |
| 77 | "A comprehensive workflow design skill with 7 domain references" | confirmed | 3 | Same evidence as L34. |
| 81 | "prompt-engineering — Prompt structure, few-shot, CoT, output schemas" | confirmed | 3 | The served `maestro://reference/prompt-engineering` contains the 4-Zone Pattern, Few-Shot, Chain-of-Thought and schema (`refs.mjs`). |
| 82 | "context-management — Window optimization, memory, state management" | confirmed | 3 | The served text has Context Window Optimization, Memory Patterns and State Management. |
| 83 | "tool-orchestration — Tool design, chaining, error handling, sandboxing" | refuted | 3 | Neither the served text nor `reference/tool-orchestration.md:1-100` covers sandboxing: grep for sandbox, isolat, permission and restrict finds 0 hits. Sandboxing is in `reference/guardrails-safety.md:52-60`. |
| 84 | "agent-architecture — Topologies, handoffs, multi-agent patterns" | confirmed | 3 | The served text has Agent Topology Patterns, Handoff Protocols and Supervisor + Workers. |
| 85 | "feedback-loops — Evaluation, self-correction, regression detection" | confirmed | 3 | The served text has Evaluation-Driven Development, Self-Correction Loops and Regression Detection. |
| 86 | "knowledge-systems — RAG, chunking, embeddings, source attribution" | confirmed | 3 | The served text has RAG, Chunking Strategies, Embedding Models and Source Attribution. |
| 87 | "guardrails-safety — Validation, prompt injection, cost ceilings" | confirmed | 3 | The served text has Input Validation, prompt injection and a cost ceiling. |
| 93 | "Analysis — read-only, generate reports" | confirmed | 2 | diagnose, evaluate and reflect give no write instruction (grep for write, save, modify, create, append, edit, apply; `evaluate/SKILL.md:55` "Create and run test scenarios" fills in a table). L3 was not reached. Note that every `@maestro` run, analysis commands included, appends to `.maestro/audit.jsonl` and `decisions.jsonl` (`participant.ts:299-341`; `ext.cjs` S5). |
| 97 | "/diagnose — Systematic workflow quality audit with scored dimensions" | confirmed | 2 | `diagnose/SKILL.md:16` scores 5 dimensions from 1 to 5; the report format is at `:69-93`. |
| 98 | "/evaluate — Holistic review of workflow interaction quality" | confirmed | 2 | `evaluate/SKILL.md:17`. |
| 99 | "/reflect — Analyze command history — which skills work, which fail" | refuted | 3 | The skill asks for this (`reflect/SKILL.md:16-49`), but none of the three surfaces delivers the history to it on its own; see L172. |
| 101 | "Fix & Improve — make targeted changes" | refuted | 2 | True of refine, streamline, calibrate and fortify. /zero-defect changes nothing; it sets a session discipline (`zero-defect/SKILL.md:16-20`). |
| 105 | "/refine — Final quality pass on prompts, tools, and configuration" | confirmed | 2 | `refine/SKILL.md:16,20,29,51`. |
| 106 | "/streamline — Remove unnecessary complexity, flatten over-engineering" | confirmed | 2 | `streamline/SKILL.md:18`. |
| 107 | "/calibrate — Align workflow components to project conventions" | confirmed | 2 | `calibrate/SKILL.md:18,56`. |
| 108 | "/fortify — Add error handling, retries, fallbacks, circuit breakers" | confirmed | 2 | `fortify/SKILL.md:19-48`: layers for validation, retry with backoff, fallbacks and circuit breakers. |
| 109 | "/zero-defect — Activate maximum precision mode — zero mistakes allowed" | confirmed | 2 | `zero-defect/SKILL.md:16,20`. "Zero mistakes" is the rule the text sets; no code can enforce it. |
| 111 | "Enhancement — add capabilities" | refuted | 2 | /temper is listed in this group (`temper/SKILL.md:5`, category enhancement) but removes rather than adds (`temper/SKILL.md:18`). |
| 115 | "/amplify — Boost capabilities with better tools and context" | confirmed | 2 | `amplify/SKILL.md:18`. |
| 116 | "/compose — Design multi-agent orchestration and delegation" | confirmed | 2 | `compose/SKILL.md:17`. |
| 117 | "/enrich — Add knowledge sources, RAG, and grounding" | confirmed | 2 | `enrich/SKILL.md:17`. |
| 118 | "/accelerate — Optimize for speed, reduce latency and cost" | confirmed | 2 | `accelerate/SKILL.md:18`. |
| 119 | "/chain — Build effective tool chains and pipelines" | confirmed | 2 | `chain/SKILL.md:18`. |
| 120 | "/guard — Add safety constraints and security boundaries" | confirmed | 2 | `guard/SKILL.md:18`. |
| 121 | "/iterate — Set up feedback loops and evaluation cycles" | confirmed | 2 | `iterate/SKILL.md:18`. |
| 122 | "/temper — Reduce over-engineering, simplify overbuilt workflows" | confirmed | 2 | `temper/SKILL.md:18`. |
| 123 | "/turbocharge — Push past conventional limits — advanced techniques" | confirmed | 2 | `turbocharge/SKILL.md:23`. |
| 129 | "/extract-pattern — Extract reusable patterns from working workflows" | confirmed | 2 | `extract-pattern/SKILL.md:16`. |
| 130 | "/adapt-workflow — Adapt workflows for different providers/contexts" | confirmed | 2 | `adapt-workflow/SKILL.md:16` and its provider table. |
| 131 | "/onboard-agent — Set up new agent configurations from scratch" | confirmed | 2 | `onboard-agent/SKILL.md:16`. |
| 132 | "/specialize — Make workflows domain-specific (legal, medical, etc.)" | confirmed | 2 | `specialize/SKILL.md:16,40-41,49`. |
| 133 | "/teach-maestro — One-time context gathering, saves to `.maestro.md`" | confirmed | 2 | `teach-maestro/SKILL.md:3` says "Run once per project"; `:75` says "Save this file to the project root as `.maestro.md`". See position flag P1. |
| 134 | "/capture — Save a session summary — persist what happened" | confirmed | 2 | `capture/SKILL.md:16,30,58`. |
| 135 | "/recap — Quick summary of the last session" | confirmed | 2 | `recap/SKILL.md:16-25`. |
| 143 | "Maestro now remembers what happened across sessions" | confirmed | 3 | Same evidence as L36: a new server process read the decisions back. The `@maestro` chat never gives this history to the model (`ext3.cjs`). |
| 147 | "`context.md` ← project context (replaces .maestro.md)" | refuted | 3 | Nothing writes `.maestro/context.md`. Grep finds only readers: `agent-workflow/SKILL.md:14`, `mcp-server/src/tools.ts:100`, `maestro-extension/src/core/context.ts:11`. Every path that creates a context file still writes `.maestro.md`: `teach-maestro/SKILL.md:75`, and `maestro_init`, which replies "Here is the generated .maestro.md content. Save this to your project root" (`memory.mjs`). The extension's init command, "Initialize .maestro.md", runs /teach-maestro (`maestro-extension/package.json:67`, `extension.ts:107-112`). |
| 148 | "`decisions.jsonl` ← append-only decision log" | confirmed | 3 | Two writes produced 2 lines, with the first preserved (`memory.mjs`). Only `appendFileSync` touches the file (`packages/core/src/decisions.ts:99-101`). The guarantee was reached. |
| 149 | "`audit.jsonl` ← every command invocation with cost + duration" | refuted | 3 | Same evidence as L160. |
| 150–151 | "`sessions/2026-04-26_fix_auth.md` ← session summaries" | confirmed | 2 | `capture/SKILL.md:30` names the file `.maestro/sessions/{date}_{topic}.md`. `ensureMaestroDir` creates `sessions/`, which was observed in `memory.mjs`. |
| 154 | "**Backward compatible** — `.maestro.md` users change nothing" | confirmed | 3 | In a project with only `.maestro.md`, `maestro_read_context` returns it and `maestro_run_command` injects it (`memory.mjs`, real filesystem). `@maestro /accelerate` injects it too (`ext.cjs` S6, mock vscode). When both files exist, `context.md` wins. The guarantee was reached on both code paths. |
| 155 | "**Opt-in** — `.maestro/` is created only when you run `/capture` or use the extension" | refuted | 3 | The MCP server's `maestro_write_decision` created `.maestro/` with `.gitignore`, `decisions.jsonl` and `sessions/` (`memory.mjs`; `tools.ts:427-465` calls `decisions.ts:42-61`). |
| 156 | "**Git-friendly** — session data is gitignored by default, context file is versioned" | refuted | 2 | This holds where Maestro code creates `.maestro/`: `git check-ignore` matched `sessions/`, `decisions.jsonl` and `audit.jsonl`, and `context.md` stayed visible to git (L3). But the only writer of `.maestro/.gitignore` is `ensureMaestroDir` (`decisions.ts:54-58`), which runs from the MCP write tool and the extension. On the Quick Start path the agent carries out `/capture` from `capture/SKILL.md:30,58`, which never mentions `.gitignore`, so session files and `decisions.jsonl` are not ignored. |
| 160 | "Every command invocation is logged with duration, token usage, and estimated cost" | refuted | 3 | `appendAudit` has one caller, `participant.ts:317`. Runs that leave no audit entry: `maestro_run_command` and a full MCP wave, which create no `.maestro/`, and `maestro_read_audit` answers "No audit data found. Use Maestro commands via the VS Code extension…". A wave cancelled mid-stream and a run with no model leave the audit count unchanged (`ext.cjs` S3–S4; `participant.ts:128-133,180-185,199-203`). The Quick Start skills log nothing, since no code runs. Palette commands in Cursor and Antigravity are routed to those editors' own agents (`extension.ts:265-296`). Where an entry is written, input tokens count only the context slice: 0 logged against ≈796 sent (`ext.cjs` S2; `participant.ts:313`). |
| 163 | `{"command":"fortify","duration_ms":8200,"cost_estimate_usd":0.019,"exit_status":"completed"}` | confirmed | 3 | A real line from `ext.cjs` S2 has these four keys. It also has id, ts, phases_completed, phases_total, token_usage, context_tokens_saved and next_step_surfaced. |
| 168 | "Approximate cost tracking for Claude, GPT-4, Gemini, and more." | refuted | 3 | The only call is `estimateCost(null, …)` (`participant.ts:314`), so every run is priced at the default $2/$8 per million tokens (`cost-estimator.ts:39,66`). A run on a model named `claude-opus-4` logged $0.016, which is 2000 output tokens × $8/M (`ext.cjs` S2). The per-model table (`cost-estimator.ts:18-40`) is never used. |
| 168 | "Accuracy: ±20% — useful for trends, not invoicing." | refuted | 3 | In the same run, $0.016 was logged; the table's own claude-opus-4 prices on the estimated tokens give $0.1619, about 10× more. Input tokens exclude the skill text and the prompt: 0 logged against ≈796 sent, and 22 against ≈844 with a context file (S6). No test measures accuracy (`packages/core/tests/cost-estimator.test.ts`); the ±20% is only asserted at `cost-estimator.ts:5`. |
| 172 | "Analyze your command history to see which skills work, which fail, and where to improve" | refuted | 3 | /reflect reads `.maestro/audit.jsonl` (`reflect/SKILL.md:22-23`), which only the VS Code `@maestro` path writes (`participant.ts:317,329`). On that same path, `@maestro /reflect` gives the model neither the log entries nor tools to read them: 2 entries were on disk, 0 reached the prompt, and the request options were `{}` (`ext3.cjs`). The MCP server writes no audit and says so via `maestro_read_audit`; the Quick Start skills write none. It works only when a file-reading agent runs /reflect in a workspace that the extension has logged. |
| 191 | "Don't dump entire codebases/databases into context" | confirmed | 3 | In the served core skill: `agent-workflow/SKILL.md:82` (`wave.mjs`). |
| 192 | "Don't use multi-agent systems for single-agent problems" | confirmed | 3 | `agent-workflow/SKILL.md:126`, served. |
| 193 | "Don't skip error handling (happy path only = production failure)" | confirmed | 3 | `agent-workflow/SKILL.md:106,210`, served. |
| 194 | "Don't retry the same prompt hoping for different results" | confirmed | 3 | "The retry clone" in the served `reference/feedback-loops.md:128`; also `iterate/SKILL.md:93`. |
| 195 | "Don't deploy without cost controls" | confirmed | 3 | `agent-workflow/SKILL.md:194`, served. |
| 196 | "Don't use vague tool descriptions that confuse the model" | confirmed | 3 | `agent-workflow/SKILL.md:105`, served. |
| 197 | "Don't ship without evaluation ("it seems to work" ≠ tested)" | confirmed | 3 | `agent-workflow/SKILL.md:148`, served. |
| 205 | "Cursor \| `.cursor/skills/`" | confirmed | 3 | `npm run build` wrote 25 skills here (`scripts/build.js:14-25`). Activating the extension wrote the same 10 directories into the workspace (`extension.ts:197-241`). For all ten rows, only Maestro's side was checked; whether each tool loads from its directory was not. |
| 206 | "Claude Code \| `.claude/skills/`" | confirmed | 3 | Same evidence as L205. The skills CLI also installs Claude Code skills here (L46 proxy). |
| 207 | "Gemini CLI \| `.gemini/skills/`" | confirmed | 3 | Same evidence as L205. |
| 208 | "Codex CLI \| `.codex/skills/`" | confirmed | 3 | Same evidence as L205. |
| 209 | "VS Code Copilot / Antigravity \| `.agents/skills/`" | confirmed | 3 | Same evidence as L205. |
| 210 | "Kiro \| `.kiro/skills/`" | confirmed | 3 | Same evidence as L205. |
| 211 | "Trae \| `.trae/skills/`" | confirmed | 3 | Same evidence as L205. |
| 212 | "Trae China \| `.trae-cn/skills/`" | confirmed | 3 | Same evidence as L205. |
| 213 | "OpenCode \| `.opencode/skills/`" | confirmed | 3 | Same evidence as L205. |
| 214 | "Pi \| `.pi/skills/`" | confirmed | 3 | Same evidence as L205. |
| 220 | "Any MCP-compatible client can connect" | refuted | 3 | The SDK client connects over stdio, but no client can connect over HTTP (see L239/245). |
| 220 | "no file copying required" | confirmed | 3 | A fresh install of the packed server, which contains only `dist/index.js`, served 10 tools, 24 prompts and 8 resources from its bundle. |
| 224 | "Add to your MCP client config (Claude Desktop, Cursor, VS Code, etc.)" (with the snippet keyed `mcpServers`) | refuted | 2 | For VS Code, the repository's own extension writes `.vscode/mcp.json` keyed `servers` (`maestro-extension/src/adapters/mcp-config.ts:21-22,140-143`). The activation run wrote `{"servers":{…}}`. The same file uses `mcpServers` only for `.claude/mcp.json` (`:23-24`). VS Code itself was not run. |
| 226–235 | `"command": "npx", "args": ["-y", "maestro-workflow-mcp"]` | confirmed | 3 (proxy) | The built copy was packed with `npm pack` and installed fresh; `npm exec -- maestro-workflow-mcp` started a stdio server that listed 10 tools. The registry package was not fetched. |
| 242 | "`npx maestro-workflow-mcp --http --port 3001`" | confirmed | 3 (proxy) | The bin starts. `lsof` shows `TCP *:<port> (LISTEN)`, and `GET /health` returns `{"status":"ok",…}`. |
| 239, 245 | "Host Maestro as a public MCP endpoint" and "Clients connect to `http://your-server:3001/mcp`." | refuted | 3 | The first POST (initialize) returns 200, and every later POST returns HTTP 500. The SDK client therefore fails on its first follow-up request ("Error POSTing to endpoint"), and a second client fails as well. This happens both with SDK 1.29.0 from the lockfile and with 1.30.1, which is what `^1.12.0` resolves to today. The cause is one stateless transport shared by all requests (`mcp-server/src/http.ts:18-32`): the SDK throws "Stateless transport cannot be reused across requests" (`@modelcontextprotocol/sdk/dist/esm/server/webStandardStreamableHttp.js:137-142`, reproduced in `reuse.mjs`). |
| 251 | "**Prompts** \| 25 \| One per command" | refuted | 3 | `prompts/list` returns 24. "One per command" is right; the count is not. |
| 252 | "**Tools** \| 10 \| `list_commands`, `run_command`, `read_context`, `init`, `wave_start`, `wave_advance`, `wave_status`, `write_decision`, `read_decisions`, `read_audit`" | refuted | 3 | The count of 10 is right, but every name carries a `maestro_` prefix (`tools.ts:146,156,221,261,290,332,388,428,470,507`). Calling `run_command` or `list_commands` returns "MCP error -32602: Tool run_command not found". |
| 253 | "**Resources** \| 8 \| Core skill + 7 domain references" | confirmed | 3 | `resources/list` returns `maestro://skill/agent-workflow` and 7 `maestro://reference/*` URIs. |
| 259–266 | "copy the appropriate provider directory to your project root", with `cp -r .claude/skills/ your-project/.claude/skills/` and the Cursor equivalent | refuted | 3 | In a fresh copy, `.claude/` and `.cursor/` do not exist, and both `cp` lines exit 1. These directories are build output and gitignored (`.gitignore:16-27`, "generated by scripts/build.js"). After `npm run build`, the copy works only once `your-project/.claude/` already exists (BSD cp, this machine). |
| 275 | "`source/skills/` # 25 source skill definitions" | confirmed | 3 | `npm run check` counts 25. |
| 276 | "`agent-workflow/` # Core skill + 7 reference files" | confirmed | 3 | `npm run check` lists 7 reference files. |
| 278–301 | Tree labels: the analysis, fix, enhancement and utility groups; reflect "Effectiveness analysis", capture "Session persistence", recap "Session recovery" | confirmed | 2 | The `category:` field in each SKILL.md frontmatter, and the reflect, capture and recap bodies at line 16. |
| 302–308 | `packages/core/src`: context-utils "Section parser + matcher", token-estimator, decisions "Decision log", audit "Audit trail", cost-estimator "Cost estimation" | confirmed | 2 | `context-utils.ts:105,149`, `token-estimator.ts:20`, `decisions.ts:85,112`, `audit.ts:48,73`, `cost-estimator.ts:50`. |
| 309 | "`maestro-extension/` # VS Code extension" | confirmed | 3 | Built with its own esbuild config. `activate()` ran under the mock `vscode` and registered the `@maestro` participant (`ext.cjs`). |
| 312 | "`index.ts` # Entry point (stdio + HTTP)" | confirmed | 3 | Both transports start (`mcp-server/src/index.ts:19-37`). The HTTP one serves only a single request (see L245). |
| 313 | "`http.ts` # HTTP transport wrapper" | confirmed | 2 | `mcp-server/src/http.ts:10-51`. |
| 314 | "`tools.ts` # 10 MCP tools" | confirmed | 3 | `tools/list` returns 10. |
| 315 | "`prompts.ts` # 25 MCP prompts" | refuted | 3 | `prompts/list` returns 24. The file's own comment says 21 (`prompts.ts:5`). |
| 316 | "`resources.ts` # 8 MCP resources" | confirmed | 3 | `resources/list` returns 8. |
| 319 | "`build.js` # Multi-provider build pipeline" | confirmed | 3 | `npm run build` made 10 × 25 = 250 copies. |
| 320 | "`bundle-skills.js` # MCP skill bundler" | confirmed | 3 | `npm run build` in `mcp-server` generated `src/generated/skills-data.ts` with 25 skills and 7 references. |
| 321 | "`validate.js` # Skill validation checks" | confirmed | 3 | `npm run check` runs it. |
| 334 | "Run `npm run check` to validate before submitting" | confirmed | 3 | It exits 0 with "0 errors, 0 warnings". It does not check the rules listed just above it. A copy with a bare code fence and a description not starting "Use when" also passes. Three shipped skills (capture, recap, reflect) already break the "Use when" rule. It does not parse YAML (`scripts/validate.js:36-55`). |

## Counts

- Claims: 105.
- Confirmed: 79.
  - Level 1: 0.
  - Level 2: 29.
  - Level 3: 50. Three of these are proxies: L46, L226–235 and L242.
- Refuted: 25.
- Unverifiable: 1 (L49).

These claims contain a guarantee word:
- **Reached level 3:** L148 ("append-only") and L154 ("change nothing").
- **Refuted:** L38, L39, L149, L155, L156, L160 and L220 (the words are "ensures every", "every", "only", "by default" and "any").
- **Not reached:** L49 ("any").
- **Universal claims without a listed guarantee word, not reached at level 3:** L93 ("read-only") and L109 ("zero mistakes"), both at level 2.

## Refuted claims, ranked by what a reader who acted on them would lose

1. **L239/245 and L220 ("Any … client can connect"): the HTTP endpoint.** A reader who deploys the remote server gets a `/health` that reports ok and an `/mcp` that returns HTTP 500 to every request after the first. No client can finish connecting. The whole remote setup is lost, and the green health check points away from the cause.
2. **L168, both claims: cost tracking for Claude, GPT-4 and Gemini, and ±20% accuracy.** A reader who budgets from the logged costs underestimates spend, measured at about 10× for a claude-opus-4 run. The model is never priced, and input tokens are mostly not counted.
3. **L160 and L149: every invocation is logged.** A reader relying on the audit trail has no record of runs from the Quick Start skills, the MCP server, Cursor or Antigravity, cancelled waves, or runs without a model. Nothing tells them the record is incomplete.
4. **L172 and L99: /reflect analyzes command history.** In `@maestro`, the model is asked for a scorecard from logs it cannot see, which invites invented numbers. On MCP alone or skills alone there is no history to analyze.
5. **L147: `context.md` replaces `.maestro.md`.** A reader who creates `.maestro/context.md` as told shadows the `.maestro.md` that /teach-maestro, `maestro_init` and /calibrate keep writing (`context.ts:11`, `tools.ts:99-102`). Later context updates silently stop taking effect.
6. **L156: session data is gitignored by default.** On the Quick Start path, `/capture` session summaries and `decisions.jsonl` are not ignored, so `git add .` commits session notes.
7. **L66–70: combining commands.** Through `@maestro` only the first command runs, while the reader believes the audit → standardize → polish pipeline ran.
8. **L38: the protocol ensures project awareness.** MCP waves, and `@maestro` without a context file, run with no project context and no protocol. Generic advice is taken as tailored.
9. **L252: tool names.** Calls and permission allowlists written from the README get "Tool run_command not found" until the reader lists the real tools.
10. **L259–266: manual installation.** The fallback install fails in a fresh clone. The reader has to discover `npm run build` and create the destination's parent directory.
11. **L224: VS Code config.** The `mcpServers` snippet is not the `servers` shape the repository itself writes for VS Code, so the server does not register. The cost is setup time.
12. **L155: `.maestro/` is created only by /capture or the extension.** The MCP write tool creates it too, so an unexpected directory appears.
13. **L39: every command recommends a next step.** MCP wave runs end without one, and the reader picks the next command alone.
14. **L17, L20, L35, L251 and L315: 25 commands and 25 prompts.** The reader looks for a 25th command that does not exist. There are 24 commands plus the non-invocable core skill.
15. **L83: tool-orchestration covers sandboxing.** The reader looks in the wrong file; sandboxing is in `guardrails-safety.md`.
16. **L101 and L111: group labels.** /zero-defect changes nothing, and /temper removes rather than adds. The loss is negligible.

## Position flags: true claims read in the wrong place

- **P1, L133 against L147.** L133 is true: /teach-maestro saves `.maestro.md`, as do `maestro_init` and the extension's init command. But L147, read later in the What's New section, tells the reader that `.maestro/context.md` replaces that file, and on read `context.md` takes priority. The claim the reader will act on is the one that contradicts what the software writes.
- **P2, L158–183.** The audit trail, the cost figures and /reflect exist only through the VS Code extension's `@maestro` participant. It is the sole caller of `appendAudit` (`participant.ts:317`) and `estimateCost` (`participant.ts:314`), and the command palette reaches it only when the editor is detected as VS Code (`extension.ts:275-281`). Q never says this. The extension appears only at L155 and L309. The true sentence exists only at runtime, where `maestro_read_audit` answers "Use Maestro commands via the VS Code extension to generate audit entries" (`tools.ts:521`).

## Notes

- **Claims about other software.** Two kinds of claim here describe other software and were not run: which directory each tool in L205–214 reads, and VS Code's config shape in L224. For comparison, the independent installer `skills@1.7.0` maps Cursor, Codex, Gemini CLI, GitHub Copilot and OpenCode to `.agents/skills`, not to the per-tool directories in L205–213. That is not a refutation, since a tool may read several directories. The weaker rule for claims about the world has not been measured.
- **Excluded as not behaviour:**
  - the license, version, npm and marketplace badges (L11–14);
  - the argument in L30;
  - the illustrations at L60–64 and L174–183;
  - the contributor rules at L331–333;
  - the license line at L340.
