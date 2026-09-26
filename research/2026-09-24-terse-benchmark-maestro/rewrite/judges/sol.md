# Judge Sol — skeleton-route bake-off

Skeleton SHA-256 checked: `c7c9a4f783c85d1bf565e272ecc2270cd97a979caa5b72787c74550b403a2a46`.

The primary count has seven sections: opening, Getting started, Commands, Memory across sessions, Documentation, Support and contributing, and License. A veto removes a candidate before that count is used to select.

## Candidate X

### VETO — new false claims: FAIL

- X:57 says each `@maestro` run adds both log lines, and X:133 says a command run through `@maestro` adds a command-log line. A direct wave cancellation instead returns without calling `emitAudit`: the two early-return paths are `maestro-extension/src/chat/participant.ts:180-184` and `maestro-extension/src/chat/participant.ts:199-203`; log emission occurs only later at `maestro-extension/src/chat/participant.ts:249-250`. This is a behavioural contradiction, so X is vetoed.

No second contradiction was established. In particular, X:33 and X:91 correctly except `/teach-maestro`: `source/skills/teach-maestro/SKILL.md:12` says it creates the file all *other* commands depend on and needs no other preparation, while the other 23 invocable command files contain the mandatory `Invoke /agent-workflow` instruction (for example `source/skills/diagnose/SKILL.md:12`).

### VETO — protected passages: PASS

- The route decision retains the first-workspace-folder limit, rewrite/lost-edits warning, switch condition, and project-write disclosures at X:52-57; the MCP restart loss at X:85; the once-per-project/context precedence at X:91-94; the estimate limits at X:133-135; and the clone-only contributor limit at X:148. No skeleton-protected decision-point passage is cut or weakened at those lines.

### PRIMARY — purpose met: 7/7

- **Opening — Yes.** X:7 identifies the product; X:9 says what it works on and where it runs; X:11 gives its size; X:13 routes installers, command-list readers, and contributors.
- **Getting started — Yes.** X:17-23 gives an undecided reader a route choice; X:27-87 supplies each route's installation and first-use surface; X:91-94 ends at a checkable `/diagnose` report.
- **Commands — Yes.** X:98-123 maps each next problem to a description and links every command to its source.
- **Memory across sessions — Yes.** X:127 locates the reader's record; X:129-131 shows the session-to-session loop; X:133-135 states what the logged numbers are worth (notwithstanding the vetoed all-runs claim at X:133).
- **Documentation — Yes.** X:139-142 sends the reader to four sources of depth without reproducing them.
- **Support and contributing — Yes.** X:146 sends a stuck reader to issues; X:148 names the only edit location and both checks.
- **License — Yes.** X:152 says reuse is under MIT and links the licence.

### Exclusions respected: YES

- The opening at X:7-13 restores none of its exclusions; setup at X:17-94 restores no per-agent install blocks, global install, HTTP command, shared-interface block, version, or UI tour; the command table at X:98-123 restores no core row, count, second table, or MCP inventory; memory at X:127-135 restores no version, fields, wave, or `.gitignore`; X:139-152 restores none of the closing-section exclusions.

### Budget — reported, not selected

- Opening X:5-13: **112 / 120**.
- Getting started X:15-94: **695 / 700**. Its blocks are lead-in/chooser X:17-23 **171 / 150**; Skill files X:25-46 **126 / 130**; VS Code extension X:48-66 **204 / 200**; MCP server X:68-87 **114 / 120**; First run X:89-94 **67 / 85**.
- Commands X:96-123: **192 / 340**.
- Memory across sessions X:125-135: **139 / 150**.
- Documentation X:137-142: **37 / 40**.
- Support and contributing X:144-148: **54 / 70**.
- License X:150-152: **3 / 12**.
- Total X:1-152: **1,232 / 1,432** visible words; two Getting-started sub-block ceilings are exceeded at X:17-23 and X:48-66, but length does not select.

## Candidate Y

### VETO — new false claims: FAIL

- Y:11 says every command loads `agent-workflow` first, and Y:33 says every command needs the core skill. `/teach-maestro` is one of the 24 commands at Y:115, but its source calls it the entry point, says it creates the context all *other* commands depend on, and says no other preparation is needed at `source/skills/teach-maestro/SKILL.md:10-12`; unlike an ordinary command (`source/skills/diagnose/SKILL.md:10-12`), it has no core-skill invocation. Y:11 and Y:33 are behavioural contradictions.
- Y:89 says every command needs `.maestro.md` first. `/teach-maestro` cannot need the file it creates: `source/skills/teach-maestro/SKILL.md:12` says it creates `.maestro.md` for all other commands, and `source/skills/teach-maestro/SKILL.md:53-75` directs it to generate and save that file. Y:89 is a behavioural contradiction.

Y:55 and Y:131 do correctly preserve the logging lifecycle: ordinary completion/failure reaches `emitAudit` at `maestro-extension/src/chat/participant.ts:249-250` and `maestro-extension/src/chat/participant.ts:276-290`, while direct wave cancellation can return first at `maestro-extension/src/chat/participant.ts:180-184` and `maestro-extension/src/chat/participant.ts:199-203`.

### VETO — protected passages: PASS

- The route decision retains the first-workspace-folder limit, every-start/lost-edits warning, switch condition, and cancellation boundary at Y:50-55; the MCP restart loss at Y:83; the once-per-project/context precedence at Y:89-92; the estimate limits at Y:131; and the clone-only contributor limit at Y:144. No skeleton-protected decision-point passage is cut or weakened at those lines.

### PRIMARY — purpose met: 7/7

- **Opening — Yes.** Y:7 identifies the product; Y:9 says what it works on and where it runs; Y:11 gives its size; Y:13 routes both reader groups (despite the vetoed core-load clause at Y:11).
- **Getting started — Yes.** Y:17-23 gives the undecided reader a route choice; Y:27-85 supplies each route's installation and first-use surface; Y:89-92 ends at a checkable report (despite the vetoed universal prerequisite at Y:89).
- **Commands — Yes.** Y:96-121 maps next problems to descriptions and links all commands to their source.
- **Memory across sessions — Yes.** Y:125 locates the record; Y:127-129 shows the loop; Y:131 distinguishes trend-grade cost estimates from context-budget token estimates.
- **Documentation — Yes.** Y:135-138 sends the reader to four sources of depth without reproducing them.
- **Support and contributing — Yes.** Y:142 sends a stuck reader to issues; Y:144 names the only edit location and both checks.
- **License — Yes.** Y:148 names and links MIT.

### Exclusions respected: YES

- The opening at Y:7-13, setup at Y:17-92, table at Y:96-121, memory section at Y:125-131, and closing sections at Y:135-148 restore none of their section exclusions. In particular, Y:81 links rather than prints other-client and HTTP setup, and Y:55/Y:131 state a lifecycle condition rather than restoring a routed-out UI tour or log fields.

### Budget — reported, not selected

- Opening Y:5-13: **104 / 120**.
- Getting started Y:15-92: **651 / 700**. Its blocks are lead-in/chooser Y:17-23 **140 / 150**; Skill files Y:25-44 **121 / 130**; VS Code extension Y:46-64 **198 / 200**; MCP server Y:66-85 **117 / 120**; First run Y:87-92 **62 / 85**.
- Commands Y:94-121: **192 / 340**.
- Memory across sessions Y:123-131: **123 / 150**.
- Documentation Y:133-138: **37 / 40**.
- Support and contributing Y:140-144: **45 / 70**.
- License Y:146-148: **1 / 12**.
- Total Y:1-148: **1,153 / 1,432** visible words; no section or Getting-started sub-block exceeds its ceiling.

## Candidate Z

### VETO — new false claims: FAIL

- Z:55 says the two logs get one line per `@maestro` command, and Z:129 says the command log gets a line for each such command. Direct wave cancellation returns without logging at `maestro-extension/src/chat/participant.ts:180-184` and `maestro-extension/src/chat/participant.ts:199-203`; the completed-run log call is later at `maestro-extension/src/chat/participant.ts:249-250`. Z:55 and Z:129 are behavioural contradictions.
- Z:131 applies “useful for trends” to both cost and token counts. The snapshot supports that qualification for costs at `packages/core/src/cost-estimator.ts:2-5`, but says token counts are a context-budget display heuristic, not billing, at `packages/core/src/token-estimator.ts:2-11`. The token-trends claim at Z:131 exceeds its source.

The destructive MCP warning at Z:22 and Z:53 is supported by the code path: activation calls auto-configuration at `maestro-extension/src/extension.ts:38-42`; an existing Maestro entry returns `exists` at `maestro-extension/src/adapters/mcp-config.ts:115-118` without setting `configured`, which is set only on `added` at `maestro-extension/src/adapters/mcp-config.ts:58-60`; the false value reaches the fallback at `maestro-extension/src/adapters/mcp-config.ts:66-70`, whose writer replaces the file at `maestro-extension/src/adapters/mcp-config.ts:140-150`.

### VETO — protected passages: FAIL

- Z:131 weakens the numbers warning by replacing the skeleton's separate meanings—cost estimates are trend-grade and token estimates are for context budgets—with one shared “useful for trends” clause. The code itself preserves that distinction at `packages/core/src/cost-estimator.ts:2-5` and `packages/core/src/token-estimator.ts:8-11`.

The other protected limits remain: first-workspace-folder/every-start/lost-edits and MCP overwrite warnings at Z:50-55; MCP restart loss at Z:81; the `/teach-maestro` exception and context precedence at Z:87-90; and clone-only contribution at Z:144.

### PRIMARY — purpose met: 6/7

- **Opening — Yes.** Z:7 identifies the product; Z:9 says what it works on and where it runs; Z:11 gives its size; Z:13 routes both reader groups.
- **Getting started — No.** The chooser promises “Any MCP client” at Z:23, but the MCP hand-off at Z:68-83 covers Claude Desktop, Cursor, VS Code/Antigravity, and HTTP and omits the skeleton's link hand-off for other clients at Z:81. Thus the section does not take every reader on its promised route to the report.
- **Commands — Yes.** Z:94-119 maps next problems to descriptions and links all commands to source.
- **Memory across sessions — Yes.** Z:123 locates the reader's record; Z:125-127 gives the cross-session loop; Z:129-131 says the numbers are estimates and not billing, although Z:131 is vetoed for conflating their uses.
- **Documentation — Yes.** Z:135-138 sends the reader to four sources of depth.
- **Support and contributing — Yes.** Z:142 sends a stuck reader to issues; Z:144 names the only edit location and both checks.
- **License — Yes.** Z:148 says reuse is under MIT and links the licence.

### Exclusions respected: NO

- Z:131 restores the implementation defect that each `@maestro` run is priced with the default rate regardless of model. The skeleton explicitly routes that code question outside the document; its source is `maestro-extension/src/chat/participant.ts:313-314` together with the null-model fallback at `packages/core/src/cost-estimator.ts:65-66`.
- No other excluded item was found in the opening Z:7-13, setup Z:17-90, Commands Z:94-119, Documentation Z:135-138, Support Z:142-144, or License Z:148.

### Budget — reported, not selected

- Opening Z:5-13: **111 / 120**.
- Getting started Z:15-90: **665 / 700**. Its blocks are lead-in/chooser Z:17-23 **150 / 150**; Skill files Z:25-44 **120 / 130**; VS Code extension Z:46-64 **200 / 200**; MCP server Z:66-83 **112 / 120**; First run Z:85-90 **70 / 85**.
- Commands Z:92-119: **192 / 340**.
- Memory across sessions Z:121-131: **131 / 150**.
- Documentation Z:133-138: **34 / 40**.
- Support and contributing Z:140-144: **51 / 70**.
- License Z:146-148: **7 / 12**.
- Total Z:1-148: **1,191 / 1,432** visible words; no section or Getting-started sub-block exceeds its ceiling.

## Selection and grafts

- **Winner: none.** X is vetoed at X:57/X:133, Y at Y:11/Y:33/Y:89, and Z at Z:55/Z:129/Z:131. The purpose counts—X 7/7, Y 7/7, Z 6/7—cannot select among vetoed candidates.
- **Grafts: none.** There is no surviving winner into which a loser's unmet-purpose repair can be grafted. X:17-94 and Y:17-92 do meet Getting started where Z:17-90 does not, but neither X nor Y survives its veto.

## Open verification

- The project-install lifecycle claimed at X:30-35, Y:30-35, and Z:30-35 for `npx skills add sharpdeveye/maestro` is **unknown**. The snapshot only records the GitHub source at `skills-lock.json:5-6` and that users invoke `npx skills add` at `maestro-extension/CHANGELOG.md:11`; observing folders, selection, and lockfile writes would require fetching the repository the brief forbids fetching.
