<!-- truth-2; 11.7 min; 39 tool uses -->

Four sentences in "## Commands" (01-draft.md, lines 49–96) are refuted or overstated. Everything else in that range holds.

**1. Line 51: "Each command ends by suggesting what to run next." Overstated.**
- "Each" is a guarantee about what the model outputs. No run can bring that to level 3.
- What does hold, at level 3 (I checked every file): all 24 user-invocable SKILL.md files have a `### Recommended Next Step` section. 23 name a command. recap's section points to the first command in its own "Pick up here" list.
- Where it fails, at level 3: I ran the real `participant.ts` with a stub model and a stub `vscode` module. Through VS Code's `@maestro`, /fortify, /refine, /compose and /chain end on a VERIFY or TEST phase. That phase's prompt asks for no next command (wave-prompts.ts:177–205).
- All six wave commands' replies end with the extension's own line, "Wave complete — all N phases executed successfully." (participant.ts:231–233). The six are /fortify, /refine, /compose, /chain, /diagnose and /evaluate.
- Shortest true: **"Each command's instructions name a next step."**

**2. Line 57, the /diagnose cell: "…and names the command for each gap". Overstated (the weakest of the four).**
- The skill text supports the intent, at level 1. diagnose/SKILL.md:97 says "Every recommended action MUST reference the specific Maestro command". There is a mapping table at :99–107 and a scoring guide at :114–120.
- But "each gap" is a guarantee about the report and cannot reach level 3. The skill's own report format lists three findings and three actions (:84–92).
- Shortest true: **"Scores five areas from 1 to 5 and maps gaps to commands"**

**3. Line 67, the /refine cell: "…without changing behavior". Overstated; the skill contradicts it (level 2).**
- The rule exists: refine/SKILL.md:84 says "NEVER: Suggest changes that alter behavior".
- The same checklist requires "Cost ceilings are set" (:56) and "Timeout values are set for all external calls" (:57). Every failing item must get a fix (:61–66). Adding a ceiling or a timeout where none exists changes behaviour.
- Shortest true: **"Polishes prompts, tool descriptions, errors, logs and config"**

**4. Line 71, the /zero-defect cell: "…for the rest of the session". Refuted on VS Code's `@maestro` (level 3); cannot be checked elsewhere.**
- Same harness run:
  - Turn 1, `@maestro /zero-defect …`, sent the rules to the model.
  - The follow-up turn sent only `["Now also change the timeout"]`.
  - The rules came back only once the Zero-Defect mode switch was on.
- Cause: `participant.ts` builds each request from three things: the mode switch (:58), the skill for the current slash command (:94–101) and the prompt (:120). `chatContext` (:49) is never read.
- VS Code's sidebar and command palette send exactly `@maestro /zero-defect` (extension.ts:275–279).
- In Claude Code, Cursor and the others, the skill asks for session-long rules (zero-defect/SKILL.md:22, :63). Nothing enforces that, and I did not run a model to test it.
- Shortest true: **"Tells your coding agent to follow eight precision rules"**

Notes:
- **The rest of 49–96 is confirmed.** All other rows and "Use it when" cells hold at level 1 against each SKILL.md. The table's 24 commands are exactly the 24 user-invocable skills.
- **/reflect's "@maestro in VS Code" cell holds at level 3.** An `@maestro` run wrote `.maestro/audit.jsonl` and `decisions.jsonl`. participant.ts:317 is the only call to `appendAudit`. The MCP server imports it (tools.ts:11) but never calls it.
- **Line 7 is outside the range but repeats the claims of lines 51 and 57:** "names the command for each gap, and each command suggests the next."
- **I ran no command through a real model** and started no agent sessions. The guarantees above fail the level-3 rule either way.
- **Harness:** `$TMPDIR/truth2/harness/` (`harness.ts`, `mock-vscode.js`), bundled with esbuild 0.24.0 via npx. The snapshot copy is `$TMPDIR/truth2/snap`; it differs from the snapshot only by the generated `skills-data.ts`. The snapshot itself is untouched.
