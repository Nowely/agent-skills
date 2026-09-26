# truth-2: draft.md lines 39–84 (Commands, four tables) against sharpdeveye/maestro @ 00f9115

Levels: 1 the line resolves · 2 an independent reader of the code would say the same · 3 made to happen (command given).
Paths below are relative to the snapshot unless they start with `$T` = `$TMPDIR/truth2-work`.

## What was run

All in `$T` (a `cp -R` of the snapshot, `diff -r` identical before any build). The snapshot and the draft were not modified: the snapshot still has 140 files, none newer than 2026-09-24 22:00.

- MCP server: `npm_config_cache=$T/npm-cache npm ci --prefix $T/maestro/mcp-server`. `npm run build` on its own fails from a clean copy with `Could not resolve "@maestro/core"` because packages/core has no `dist/`. I compiled core first (`$T/maestro/mcp-server/node_modules/.bin/tsc -p $T/maestro/packages/core/tsconfig.json`; it reports type errors for the missing @types/node and still emits JS), then ran `npm --prefix $T/maestro/mcp-server run build`. The server was driven over stdio by `node $T/maestro/mcp-server/probe-mcp.mjs`, which uses the SDK client (log: `$T/logs/mcp-probe.log`).
- Extension: `node $T/maestro/maestro-extension/scripts/bundle-skills.js`, then `NODE_PATH=$T/maestro/mcp-server/node_modules node $T/maestro/maestro-extension/esbuild.config.js`. The built bundle ran against a mock `vscode` module (`$T/mockmods/node_modules/vscode/index.js`) whose fake language model records every `sendRequest`. Harnesses were run with `NODE_PATH=$T/mockmods/node_modules node $T/<harness>`:
  - `harness.js` (log: `ext-vscode.log`)
  - `harness-route.js` with `MOCK_APPNAME=Cursor|Antigravity` (log: `ext-routes.log`)
  - `harness-compose.js` (log: `ext-compose.log`)
  - `harness-turbo.js` (log: `ext-turbo.log`)
- Skill files: `node $T/maestro/scripts/build.js`, then `diff -r source/skills <folder>/skills` for each of the ten agent folders. `node $T/cmp-ext-skills.js` checked the files the extension writes when it activates.
- No language model was run. None of these commands shows what a real agent does to a real workflow.

## Two findings behind most verdicts

**D. Every route hands the agent the SKILL.md text unchanged (level 3).**
- MCP prompts: 24 of 24 are identical to the source body (`mcp-probe.log`: "IDENTICAL 24 of 24").
- `npm run build` output is identical to `source/skills` in all ten folders.
- The bodies of the SKILL.md files the extension writes match the source in 250 of 250.

So each level-1 line cited below is exactly what the agent is told. A "What it does" cell is confirmed as the instruction the agent gets. Whether the agent carries it out was not run.

**V. Through `@maestro` in VS Code, a command gets one reply, with no tools and no earlier turns (level 3, mock).**
- In VS Code, the sidebar and the palette send `@maestro /<command>` (extension.ts:275-280; S7 in `ext-vscode.log` shows `{"query":"@maestro /teach-maestro"}`). Cursor and Antigravity send a bare `/<command>` to their own agent (`ext-routes.log`).
- The chat participant calls `model.sendRequest(messages, {}, token)`, with no tools (participant.ts:195, 268). Every recorded call has `options {}`.
- The participant never reads `chatContext`: it is declared at participant.ts:49 and not used. A marker placed in the history reached no model call.
- The model sees only the skill text, the prompt, a slice of `.maestro.md` and the active file's import list. The only files the participant writes are `.maestro/audit.jsonl` and `.maestro/decisions.jsonl` (participant.ts:317, 329).
- A wave advances whatever the model answers (wave-engine.ts:256-264). The chat participant is not sticky (maestro-extension/package.json:180).
- For the rows that change code (53–56, 63–69, 71, 78–81), this means that through `@maestro` the agent prints plans and diffs and nothing is applied. For example, a reply containing the full `.maestro.md` with "Save this file…" left no file behind (S2).

## Guarantee words in 39–84

- "only" (line 56, "handles only the happy path") is the only one of the four words present. It describes the reader's workflow, not something Maestro does, so there is nothing to make happen. The cell is confirmed at level 2 as a paraphrase of fortify's trigger.
- "for the rest of the session" (line 57) is a lifecycle guarantee. It does not reach level 3; see item 1.
- "each gap" (line 45) is a universal about the model's output. It holds only as an instruction (level 2); see row 45.

## Per row (W = What it does, U = Use it when)

| Line | Command | W | U |
|---|---|---|---|
| 45 | /diagnose | Confirmed as instruction. Scores: L1, diagnose/SKILL.md:16 "across 5 dimensions… score 1-5". Each gap: L2, from :97 "Every recommended action MUST reference the specific Maestro command", the mapping at :99-107, and the scoring guide at :114-120, which names a command for every score below 5 | L1, teach-maestro/SKILL.md:96 and onboard-agent/SKILL.md:72, "baseline health check" |
| 46 | /evaluate | **Overstated**, see item 7. L1 as instruction: evaluate/SKILL.md:55, :59-63, :69 | L2, :3, :17 |
| 47 | /reflect | **Overstated**, see item 3. L1 as instruction: reflect/SKILL.md:16, :22-23, :29-49 | L2, :3, :16 "which commands work, which fail", cost per command :44 |
| 53 | /refine | L1, refine/SKILL.md:16, :20-57 | L1, :3 |
| 54 | /streamline | L1–2, streamline/SKILL.md:18, :24 "remove it", :31-53; the output is a report plus removals (:55-61, :75) | L1, :3 |
| 55 | /calibrate | L1, calibrate/SKILL.md:22-48, :54 | L1, :3 |
| 56 | /fortify | L1, fortify/SKILL.md:21-65 | L2, :3 "lacks error handling, has been failing in production" |
| 57 | /zero-defect | **Overstated / refuted through @maestro**, see item 1. The counts are L1: 8 rules at :20-33, the gate at :35-46 | L1, :3 |
| 63 | /amplify | L1, amplify/SKILL.md:18, :22-48 | L1, :3 |
| 64 | /chain | L1, chain/SKILL.md:22-24, :39-41. The skill also has "iterative" at :25, which the cell omits | L2, :3 |
| 65 | /compose | **Overstated**, see item 2. Agents, handoffs and supervisor are L1: compose/SKILL.md:29-65 | L1, :3 |
| 66 | /enrich | L1, enrich/SKILL.md:31-58; attribution at :40, :49, :58, :62 | L1, :3 |
| 67 | /guard | L1, guard/SKILL.md:35-76 | L1, :3 |
| 68 | /iterate | L1, iterate/SKILL.md:22-66 | L1, :3 |
| 69 | /accelerate | L1, accelerate/SKILL.md:18, :37, :43-47, :49-54, :58 | L1, :3 |
| 70 | /turbocharge | **Overstated through @maestro**, see item 8. L1 as instruction: turbocharge/SKILL.md:29-31 | L2, :3, :77 |
| 71 | /temper | L1, temper/SKILL.md:42-61 | L1, :3 |
| 77 | /teach-maestro | **Overstated through @maestro**, see item 4. L1 as instruction: teach-maestro/SKILL.md:16-20, :53, :75 | L1, :3 "Run once per project", :10 |
| 78 | /onboard-agent | L1, onboard-agent/SKILL.md:18-62; golden test at :60 | L1, :3 |
| 79 | /adapt-workflow | L1, adapt-workflow/SKILL.md:3, :16, :20-41 | L1, :3 |
| 80 | /specialize | L1, specialize/SKILL.md:18-51 | L2, :3 |
| 81 | /extract-pattern | L1, extract-pattern/SKILL.md:16, :27-42 | L2, :3, :65 |
| 82 | /capture | **Overstated through @maestro**, see item 5. L1 as instruction: capture/SKILL.md:20-30. The skill also records issues (:25) and adds a decisions.jsonl entry (:58) | L1, recap/SKILL.md:25 |
| 83 | /recap | **Overstated through @maestro**, see item 6. L1 as instruction: recap/SKILL.md:16, :20-23 | L1, capture/SKILL.md:71 |

The headings at lines 41, 49, 59 and 73 are not behaviour sentences. Their membership matches every skill's `category:` field (L1) and the grouping returned by the MCP tool `maestro_list_commands` (L3, `mcp-probe.log`). The VS Code sidebar differs in one place: it lists /temper under Utility (maestro-extension/webview-ui/src/components/command-list.tsx:35-47).

## Refuted and overstated

1. **Line 57.** "Holds the agent to eight precision rules and a pre-commit gate for the rest of the session."
   - The counts are right.
   - The false part is "Holds … for the rest of the session". The skill only instructs it (zero-defect/SKILL.md:22 "Follow these for the **entire session**", :63), and no route has anything that keeps the agent to it.
   - Refuted through `@maestro` (L3):
     - Turn 1 carried the rules. The follow-up turn in the same session carried neither the rules nor the history: one message, "The 8 Precision Rules": false (`ext-vscode.log`, S1).
     - The Zero-Defect state stayed off. Only the sidebar switch puts the rules into every request (S1b: rules present and `CLAUDE.md` written; extension.ts:76-97, participant.ts:58-66).
   - Through skill files or MCP: unverifiable, because it needs a live agent session and depends on the model and on the text staying in context.
   - Narrower: "Tells the agent to follow eight precision rules and a pre-commit gate for the rest of the session; through `@maestro` they cover one reply, and the sidebar's Zero-Defect switch keeps them on."

2. **Line 65.** "after checking one agent really fails"
   - The check is questions the agent answers itself: compose/SKILL.md:21-27, "Has a single agent been tried and failed? (If no, try single agent first)". Nothing tests a single agent (L2).
   - Through `@maestro`, the answer does not stop the run (L3). The mock model answered "FAIL… a single agent has NOT been tried". All four phases still ran (MAP → VALIDATE → SCAFFOLD → TEST), and the chat printed "Gate check passed" and "Wave complete — all 4 phases executed successfully" (`ext-compose.log`; wave-engine.ts:51, :256-264).
   - Narrower: "Designs agents, handoffs and a supervisor, after asking whether a single agent was tried and failed."

3. **Line 47.** "Builds a scorecard from Maestro's logs: usage, completion, cost, time"
   - The skill reads `.maestro/audit.jsonl` and `.maestro/decisions.jsonl` (reflect/SKILL.md:22-23).
   - Cost and duration are written only by the VS Code participant, whose `appendAudit` at participant.ts:317 is the only call site. The MCP server imports `appendAudit` but never calls it (mcp-server/src/tools.ts:11).
   - MCP run (L3): after `maestro_write_decision`, `maestro_read_audit` still returns "No audit data found. Use Maestro commands via the VS Code extension to generate audit entries." The decision it wrote carries `"token_cost":{"input":0,"output":0},"duration_ms":0` (tools.ts:445-446; `mcp-probe.log`).
   - `@maestro /reflect` cannot read the logs (L3): with 4 audit lines on disk, no audit field reached the model (S4).
   - The logged input tokens also count only the `.maestro.md` slice (participant.ts:313). All six entries in the harness logged input 0.
   - Narrower: "Builds a scorecard of usage, completion, cost and time from `.maestro/audit.jsonl` and `.maestro/decisions.jsonl`; cost and time are logged for commands run through `@maestro` in VS Code, which cannot read them itself."

4. **Line 77.** "Interviews you and saves `.maestro.md`"
   - L1 as instruction: teach-maestro/SKILL.md:20, :75.
   - Refuted through `@maestro` (L3), S2:
     - The answering turn reached the model with neither the skill nor the questions: one message, "Section 1 — Models & Providers": false.
     - The mock model then printed the whole file and "Save this file to the project root as `.maestro.md`". No `.maestro.md` or `.maestro/context.md` appeared.
   - Narrower: "Interviews you and saves `.maestro.md`, in an agent that keeps the conversation and can write files; `@maestro` asks one round and can only print the file."

5. **Line 82.** "Saves commands run, decisions, changed files and next steps to `.maestro/sessions/`"
   - L1 as instruction: capture/SKILL.md:20-30.
   - Refuted through `@maestro` (L3), S3: the conversation marker reached no model call. Afterwards `.maestro/sessions/` was empty; the only record was the extension's own decisions.jsonl entry `["capture","/capture completed in 0.0s"]`.
   - Narrower: "Saves commands run, decisions, changed files and next steps to `.maestro/sessions/`, in an agent that sees the conversation and can write files; not through `@maestro`."

6. **Line 83.** "Summarizes the last saved session and what to do next"
   - L1 as instruction: recap/SKILL.md:16, :20-23.
   - Refuted through `@maestro` (L3), S5: a session file in `.maestro/sessions/` never reached the model (session marker: false).
   - Narrower: "Summarizes the last saved session and what to do next, in an agent that can read `.maestro/`; `@maestro` never sees the session file."

7. **Line 46.** "Runs normal, edge, error, stress and adversarial scenarios; grades A–F"
   - L1 as instruction: evaluate/SKILL.md:55, :59-63, :88 "run actual scenarios".
   - "Runs" is refuted through `@maestro` (L3), S6: three calls with no tools (MAP → VALIDATE → REPORT, `options {}` each), so there is nothing to run anything with.
   - Narrower: "Has your agent run normal, edge, error, stress and adversarial scenarios and grade them A–F; `@maestro` can only describe them."

8. **Line 70.** "builds the one you pick"
   - L1 as instruction: turbocharge/SKILL.md:29-31.
   - Refuted through `@maestro` (L3). Turn 2, "Go with option B", reached the model as one message, with neither "Propose Before Building" nor the proposals (`ext-turbo.log`).
   - Narrower: "Proposes two or three advanced directions and, in an agent that keeps the conversation, builds the one you pick."

## Unverifiable

- What any row does to a real workflow. No model was run, so every W cell stops at L1–2 as an instruction.
- Line 57, "for the rest of the session", through skill files or MCP. It needs a live agent session, and it depends on the model obeying and on the text staying in context.

## Disclosures

- One early read-only command had `cd <snapshot> 2>/dev/null;` inside a compound line, followed by `git -C`. That breaks the brief's rule on compound `cd`s. The command wrote nothing.
- One grep printed two lines of `maestro-extension/README.md` and one of `maestro-extension/CHANGELOG.md`, both inside the snapshot. They were not used as evidence, and later greps excluded them.
