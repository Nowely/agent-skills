# Judge Opus — bake-off sheets, Maestro README, skeleton route

- Skeleton: `skeleton.02.md`, SHA-256 `c7c9a4f7…a46` — re-hashed, matches.
- Candidates, SHA-256: X `ac553dfe…e5d`, Y `20dd2a0c…474`, Z `1fbc4ba0…0d0`.
- Snapshot: `$TMPDIR/terse-bench/snapshot`.
- The sheet's rules: `plugins/terse/skills/rewrite/references/bake-off.md`, the skeleton-route judging sheet.
- Candidate lines are written `X:n`. Snapshot paths are relative to the snapshot. Levels: 1 = the line resolves; 2 = the code says this; 3 = made to happen.
- My working files are in `$TMPDIR/opus-judge-work/`.

## Evidence runs, level 3

The snapshot's own code was run with `node` 24 (type stripping) and a stubbed `vscode` module.

- **E1 — `maestro-extension/src/adapters/mcp-config.ts`, verbatim** (`mcpcfg/`).
  - Start 1 on an empty workspace creates `.vscode/mcp.json` with only the `maestro-workflow-mcp` entry.
  - The user then adds a server and `inputs`. Start 2 rewrites the file to the `maestro-workflow-mcp` entry alone; the user's server and `inputs` are gone.
  - With a pre-existing `.vscode/mcp.json`, start 1 keeps the user's server and start 2 erases it.
  - Cause: only `'added'` sets `configured` (`:58-60`). An `'exists'` result leaves it false, so `createDefaultConfig` overwrites the file (`:66-75`, `:136-151`).
- **E2 — `packages/core/src/cost-estimator.ts` and `token-estimator.ts`, verbatim** (`cost/`).
  - The run: `/diagnose`, whose skill text is 1,509 tokens; a `.maestro.md` of 153 tokens used whole as the slice; an 811-token report.
  - What gets logged: `estimateCost(null, slice, output)`, following `participant.ts:313-314`.
  - Error of the logged figure against the table price of what was sent (slice plus skill text, the output unchanged):
    - GPT-4.1, whose table price equals the default rate: −31%.
    - Gemini 2.5 Pro: −33%.
    - GPT-4o: −45%.
    - Claude Sonnet 4: −60%.
    - Claude Opus 4: −92%.
    - GPT-4o-mini: +871%.
  - On the first run, with no `.maestro.md` yet, the logged input is 0 tokens (`context-slicer.ts:51-58`).
- **E3 — `maestro-extension/src/chat/participant.ts:161-342`, verbatim** (`audit/`). The dependencies were stubbed.
  - A wave cancelled through the token, before or during streaming, writes neither the command log nor the decision log (`:180-184`, `:199-202`).
  - A wave whose request throws "cancelled" logs `cancelled`. A failure logs `failed`. A completed wave logs `completed`.
  - A single-shot run cancelled while streaming logs `completed` (`:271`, `:276-278`).
  - A plain `@maestro` message with no slash command logs nothing.
- **E4 — `maestro-extension/src/extension.ts:190-252`, verbatim** (`sync/`).
  - It writes into the ten folders.
  - An edit to a synced `SKILL.md` is gone after the next start.
  - Another file in the same skill folder is kept.

## Mechanical checks of skeleton part 3, run on all three

| Check | X | Y | Z |
|---|---|---|---|
| V, S1 (`0 violation(s)`), rules 1, 2, 4, 5, 7 (`json` fence identical to `mcp-server/README.md:24-31`), 9, 10, 11, 12, 13/14, H, T (25), L1, L2, W1–W11 | pass | pass | pass |
| S2 (`0 concept(s) in three or more sections`) | pass; but `agent-workflow` sits outside its home, at X:33 | pass | pass |
| S3, `0 section(s) over budget` | pass | pass | pass |
| S3 block budgets | lead-in and chooser 171/150; VS Code extension 204/200 | all within | all within; two blocks exactly at budget |

The three *Commands* sections are byte-identical. The 24 rows match `maestro-extension/README.md:64-102` with 🆕 removed. The grouping matches every `category:` field.

## Findings shared by all three, not applied as vetoes

- **S-a. `/teach-maestro` "saves the answers as `.maestro.md`"** (X:93, Y:91, Z:89).
  - Each candidate's extension block sends its reader there (X:66, Y:64, Z:64).
  - In VS Code, the sidebar, the palette and the chat all reach `@maestro` (`extension.ts:275-280`, `sidebar/provider.ts:55`). The participant's model call gets no tools (`participant.ts:195`, `:268`: `sendRequest(messages, {}, token)`). It writes only through `emitAudit` (`:299-342`).
  - So in VS Code no `.maestro.md` is saved by Maestro. This is level 2 on a claim about what gets written, so a hypothesis: I could not run VS Code.
  - The wording is skeleton 2.2e's. It is a skeleton question, and it cannot separate the candidates.
- **S-b. "A line per `@maestro` run"** (X:57, X:133, Z:55, Z:129; skeleton 2.2c item 4 and 2.4).
  - A token-cancelled wave writes neither line (E3, level 3).
  - This is an edge path, so an imprecision, not a veto. Y:55 and Y:131 have it right.
- **S-c. The `npx skills` behaviour** (X:33, Y:33, Z:33). This is the owner's inference (A3 (a)), stated at its source's level. The skeleton accepts it unrun (part 7, #1). Not a veto.
- **S-d. "8 precision rules"** (X:56, Y:54). The block is the whole `/zero-defect` text (`extension.ts:81`, `editor.ts:64`). The text holds the 8 rules, the pre-commit gate, the anti-pattern table and the "Invoke /agent-workflow" preamble. This understates the block; it is not false. Z:54 is exact.
- **S-e. "Rewritten at every start; edits … lost"** (X:54, Y:52, Z:52). Confirmed (E4).
- **S-f. "A restart loses it"** for waves (X:85, Y:83, Z:81). The waves live in an in-memory `Map` (`mcp-server/src/wave-state.ts:5-6`, `:68`). Level 2.

---

## Sheet X

**1. VETO — new false claims: FAILS.**
- X:135 "costs are within ±20%" is false.
  - `participant.ts:314` prices every logged run at the default rate, whatever the model (`cost-estimator.ts:66`, `:39`).
  - `participant.ts:313` counts only the context slice as input. The skill text is sent (`:95-100`) but not counted.
  - E2 measured −31% to +871% (level 3).
  - The source, `cost-estimator.ts:5` "Accuracy: ±20%", rates the price table, not the logged figures. The claim exceeds it.
  - The wording is skeleton 2.4's.
- Checked and true:
  - X:33: every command except `/teach-maestro` loads the core skill. 23 of 24 commands carry "Invoke /agent-workflow" at `SKILL.md:12`; `teach-maestro/SKILL.md:12` has none.
  - X:11 "shared principles you never run directly" (`agent-workflow/SKILL.md:3`, `:6`, `:36`).
  - X:85 "installs none of them", "held only by the running server" (`tools.ts:155-216`, `wave-state.ts:68`).
  - X:93 "read first instead" (`context.ts:4`, `:55-67`; `tools.ts:91-112`; `CHANGELOG.md:44`).
  - X:37 the ten folders (`scripts/build.js:14-25`).
  - X:148 the build (`scripts/build.js:72-83`, `package.json:24-27`).
- Shared S-a and S-b apply.

**2. VETO — protected passages: passes.**
- Kept in the chooser: *Needs*, and the four writes (X:22).
- Kept in the extension block: "without asking", "edits to those copies are lost", "created if missing", the `.gitignore` (X:52-57).
- Kept in the MCP block: "installs none", and the restart loss (X:85).
- Kept: "every command needs `.maestro.md`" (X:91), and the estimates warning (X:135).
- Kept: "installs into no other project" (X:148).

**3. PRIMARY — purpose met: 7 of 7.**

| Section | Met | Line |
|---|---|---|
| Opening | yes | what it is and what it works on, X:9; where it runs, X:9; size, X:11; next steps, X:13 |
| Getting started | yes | default route X:17; chooser X:19-23; each route ends on first use, X:39-46, X:59-66, X:87; report X:94. X:91 "except this one" has no antecedent: friction, not failure |
| Commands | yes | X:98-123, 24 rows linked to `SKILL.md` |
| Memory across sessions | yes | loop X:129-131; where it is kept X:127; worth X:135. The stated worth is false: veto 1 |
| Documentation | yes | X:139-142. X:140 promises "command palette", which `maestro-extension/README.md` never mentions (grep: 0) |
| Support and contributing | yes | X:146, X:148 |
| License | yes | X:152 |

**4. Exclusions:** none restored. Device deviations:
- Bold route names at X:17, outside the three permitted places.
- `agent-workflow` repeated at X:33 (S2 home).

**5. Budget (the skeleton's unit):**
- Opening 112/120. Getting started 695/700; the lead-in and chooser block is 171/150 and the extension block 204/200, both over.
- Commands 192/340. Memory 139/150. Documentation 37/40. Support 54/70. License 3/12.
- Total 1,232/1,432. The raw file is 1,390 words.

---

## Sheet Y

**1. VETO — new false claims: FAILS.**
- Y:131 "costs are accurate to ±20%" is false, on the same evidence as X:135: `participant.ts:313-314`, `cost-estimator.ts:66`, E2 (level 3). The wording is a rewording of skeleton 2.4.
- Y:11 "which every command loads first" and Y:33 "every command needs the core skill" are false for `/teach-maestro`.
  - `teach-maestro/SKILL.md:10-12`: "This is the entry point … No other preparation is needed — this IS the preparation." It has no "Invoke /agent-workflow" line; the other 23 commands carry it at `:12`.
  - Level 1-2. The wording is skeleton 2.1 and 2.2b's. X:33 and Z:33 carry the exception.
- Checked and true:
  - Y:55 and Y:131: "a completed or failed `@maestro` run adds a line …; a direct cancellation can return before either line is written" (E3, level 3).
  - Y:81, Y:83 (`mcp-server/README.md:47`, `:61-69`; `prompts.ts:9-14`).
- Shared S-a applies.

**2. VETO — protected passages: passes.**
- The chooser, with the four writes (Y:22).
- The write list (Y:50-55).
- The MCP block: "copies no skill files", and the restart loss (Y:81, Y:83).
- Y:89. The estimates warning (Y:131). Y:144.

**3. PRIMARY — purpose met: 7 of 7.**

| Section | Met | Line |
|---|---|---|
| Opening | yes | Y:9, Y:11, Y:13 |
| Getting started | yes | Y:17; Y:19-23; Y:37-44, Y:57-64, Y:83-85; report Y:92 |
| Commands | yes | Y:96-121 |
| Memory across sessions | yes | loop Y:127-129; where it is kept Y:125; worth Y:131. The ±20% is false: veto 1 |
| Documentation | yes | Y:135-138. Y:136 promises "command palette", as X:140 does |
| Support and contributing | yes | Y:142, Y:144 |
| License | yes | Y:148 "[MIT](LICENSE)." |

**4. Exclusions:** none restored. Minor deviations:
- Y:22 drops "and its forks".
- Y:131 drops "(~)" from the estimates sentence. The figures keep "~" at Y:129 and Y:131.

**5. Budget:**
- Opening 104/120. Getting started 651/700; blocks 140/150, 121/130, 198/200, 117/120, 62/85.
- Commands 192/340. Memory 123/150. Documentation 37/40. Support 45/70. License 1/12.
- Total 1,153/1,432. The raw file is 1,311 words.

---

## Sheet Z

**1. VETO — new false claims: passes.** Every claim Z adds or rewords beyond the skeleton was checked against the snapshot:
- Z:22, Z:53: "Later starts rewrite `.vscode/mcp.json` to hold only that entry, losing everything else in it." True, E1 (level 3).
- Z:54: "`/zero-defect`'s text, 8 precision rules included" (`extension.ts:81`, `editor.ts:64`, `zero-defect/SKILL.md:20-33`).
- Z:33, Z:87: the `/teach-maestro` exception (`teach-maestro/SKILL.md:12`; grep, 23 of 24).
- Z:89: "commands read that file instead" (`context.ts:4`, `:55-67`; `tools.ts:91-112`; `CHANGELOG.md:44`).
- Z:131: "Maestro rates its price table at ±20%, but prices each `@maestro` run at the table's default rate, whatever the model." Sources: `CHANGELOG.md:23`, `cost-estimator.ts:5`, `:16`, `:66`, `participant.ts:314`. It leaves out the slice-only input count (`:313`), which is an omission, not a false claim.
- Z:83 "one prompt per command" (`prompts.ts:9-14`).
- Z:136, the Documentation label, matches `maestro-extension/README.md:18-42`, `:106-111`.
- Shared S-a and S-b apply: Z:89, Z:55, Z:129.

**2. VETO — protected passages: passes.**
- The chooser, with the four writes plus the overwrite (Z:22).
- The write list (Z:50-55).
- The MCP block: "copies none", and the restart loss (Z:81).
- Z:87. Z:144.
- The estimates warning at Z:131 is strengthened, not weakened. "Estimates (~)", "not invoicing or billing" and "±20%" stay, and the default-rate caveat is added. Only "for the context budget" is gone; "not billing" stays.

**3. PRIMARY — purpose met: 7 of 7.**

| Section | Met | Line |
|---|---|---|
| Opening | yes | Z:9, Z:11, Z:13 |
| Getting started | yes | Z:17; Z:19-23; Z:37-44, Z:57-64, Z:83; report Z:90 |
| Commands | yes | Z:94-119 |
| Memory across sessions | yes | loop Z:125-127; where it is kept Z:123; worth Z:131 |
| Documentation | yes | Z:135-138 |
| Support and contributing | yes | Z:142, Z:144 |
| License | yes | Z:148 |

**4. Exclusions:** one item restored.
- Z:131's default-rate sentence is a part-6 "code question, not text", routed outside the document by part 7. Restoring it is what makes the sentence true. Reported; it does not select.
- Borderline, not counted: Z:22 and Z:53 name `.vscode/mcp.json`. 2.2 excludes VS Code's `servers` form and the other clients' files. Z names the file only as the target of a write and gives no configuration.
- Device deviations:
  - Z:53 states a time ("Later starts") that A3 does not give, against 2.2c.
  - Z:81 drops "the other clients" from the link sentence. `mcp-server/README.md` covers no other clients anyway (`:21`, `:34`, `:47`).

**5. Budget:**
- Opening 111/120. Getting started 665/700; blocks 150/150, 120/130, 200/200, 112/120, 70/85.
- Commands 192/340. Memory 131/150. Documentation 34/40. Support 51/70. License 7/12.
- Total 1,191/1,432. The raw file is 1,349 words.

---

## Result

- **Winner: Z.** It is the only candidate that survives veto 1. X fails at X:135. Y fails at Y:131, Y:11 and Y:33.
- **Sections meeting their purpose:** X 7, Y 7, Z 7.
- **If the owner exempts skeleton-dictated wording from veto 1,** all three survive and tie at 7/7. Length never breaks a tie. X:135, Y:131, Y:11 and Y:33 all follow skeleton sentences.
- **Grafts under the rule:** none. Z meets every purpose that X or Y meets.
- **Outside the rule, an accuracy repair from a loser,** re-checked against the code (E3):
  - Y:55's clause "a completed or failed `@maestro` run adds a line … a direct cancellation can return before either line is written".
  - It would replace Z:55's "per command run through `@maestro`". Z:129 would get the same repair: Y:131 "After an `@maestro` run completes or fails … direct cancellation can return before logging".
- **For the skeleton, not the candidates:**
  - S-a: `/teach-maestro` via `@maestro` in VS Code, a level-2 hypothesis.
  - The ±20% sentence of 2.4.
  - "Every command loads the core skill first" in 2.1 and 2.2b.
  - The "command palette" label in 2.5.
