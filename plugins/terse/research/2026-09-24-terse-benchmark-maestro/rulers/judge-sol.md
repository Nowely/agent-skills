# Blind README judging sheets

Basis: the three supplied texts, the permitted snapshot at commit `00f9115`, and the adapted bake-off sheet. Word counts use `wc -w`; passage counts use whitespace-delimited `awk` fields. No candidate's authorship was recognized.

## P

### 1. VETO — false claims (5)

P is **vetoed**. Its decision-point error is P:34: it says every command first reads `.maestro.md`, although the shared protocol checks `.maestro/context.md` first and accepts either path (`source/skills/agent-workflow/SKILL.md:13-17`). The prescribed `/teach-maestro` then `/diagnose` sequence on P:34-36 remains runnable, but the prerequisite is stated falsely.

1. P:34 says every other command reads “this file” (`.maestro.md`) first. The protocol instead checks `.maestro/context.md` before `.maestro.md` and proceeds with either (`source/skills/agent-workflow/SKILL.md:13-17`).
2. P:90 says every command loads `agent-workflow` first. MCP prompt registration returns only the selected invocable skill's content (`mcp-server/src/prompts.ts:9-13,21-40`); the core is registered separately as a resource (`mcp-server/src/resources.ts:7-28`).
3. P:98 says every command reads the project context. An MCP prompt has only optional `focus` and returns skill content without a project path or context read (`mcp-server/src/prompts.ts:12-40`); context reading is instead an optional behavior of `maestro_run_command` when `projectPath` is supplied (`mcp-server/src/tools.ts:170-175,198-208`).
4. P:177 says every `@maestro` command is logged. A cancelled wave can return immediately before `emitAudit` (`maestro-extension/src/chat/participant.ts:179-184,197-203`), while successful wave logging occurs only later (`maestro-extension/src/chat/participant.ts:249-250`).
5. P:210 says every skill's frontmatter sets `argument-hint`. The core skill's complete frontmatter has no such field (`source/skills/agent-workflow/SKILL.md:1-7`).

### 2. The reader's four needs

- **Decide whether it fits — yes.** P:14 defines the workflow problems and P:16-22 distinguishes skills, MCP, and extension forms.
- **Install by the fitting route — yes, with the P:34 prerequisite error above.** Skill installation is at P:24-32, MCP configurations and HTTP are at P:105-141, and extension installation plus its material write/overwrite warnings are at P:172-193.
- **Run a first command and know it worked — yes.** P:34 says `/teach-maestro` produces `.maestro.md`; P:36 says `/diagnose` produces five scores, critical findings, and mapped follow-up commands.
- **Find the next command later — yes.** P:42-90 is a complete task-oriented command catalog; P:143-170 separately catalogs MCP tools and staged waves.

### 3. Every word carries weight

- P:195-206 spends **73 words** on repository layout after the user routes and command lookup are already complete; this is maintainer orientation, not help for the stated reader's next Maestro problem.
- P:208-244 spends **258 words** on contributor builds, packaging, CI, and publishing. It does not pay for its position in a product README aimed at fit, installation, first success, and command retrieval.

### 4. Length

**2,404 words** (reported only; not used to select).

## Q

### 1. VETO — false claims (15)

Q is **vetoed** at two immediate decision points. Q:49-56 tells a newly installed reader to use any command, including `/diagnose`, although `/diagnose` requires `/teach-maestro` first (`source/skills/diagnose/SKILL.md:10-12`). Q:259-267 tells a manual installer to copy generated provider directories that are ignored and absent from the checkout; the repository says they are generated (`.gitignore:16-27`) and the build script creates them only when run (`scripts/build.js:71-80`).

1. Q:17 says there are 25 commands. The extension's chat-participant command array contains the 24 invocable commands (`maestro-extension/package.json:181-278`), while the 25th skill, `agent-workflow`, is non-invocable (`source/skills/agent-workflow/SKILL.md:1-7`).
2. Q:20 repeats “25 commands”; the same 24-command array and non-invocable core contradict it (`maestro-extension/package.json:181-278`; `source/skills/agent-workflow/SKILL.md:1-7`).
3. Q:35 repeats “25 commands”; the same code establishes 24 (`maestro-extension/package.json:181-278`; `source/skills/agent-workflow/SKILL.md:1-7`).
4. Q:49-56 says the reader can use any listed command immediately after installation. `/diagnose` explicitly requires `/teach-maestro` first when context is absent (`source/skills/diagnose/SKILL.md:10-12`).
5. Q:66-71 presents several slash commands in one message as a supported combined workflow. The extension selects and loads one `request.command`; the remaining request is merely user prompt text (`maestro-extension/src/chat/participant.ts:93-121`). No command-composition behavior is implemented there.
6. Q:91 again calls the 24-command catalog “25 Commands” (`maestro-extension/package.json:181-278`; `source/skills/agent-workflow/SKILL.md:1-7`).
7. Q:147 says `.maestro/context.md` replaces `.maestro.md`. The actual `/teach-maestro` skill generates and saves `.maestro.md` (`source/skills/teach-maestro/SKILL.md:51-75`), and context resolution retains `.maestro.md` as a supported fallback (`maestro-extension/src/core/context.ts:3-11`).
8. Q:149 says `audit.jsonl` contains every command invocation. Audit writes are performed by the extension participant (`maestro-extension/src/chat/participant.ts:295-338`), not static-skill or MCP-prompt invocations; the MCP audit tool explicitly directs users to the extension to generate entries (`mcp-server/src/tools.ts:505-523`).
9. Q:155 says `.maestro/` is created only by `/capture` or use of the extension. The MCP `maestro_write_decision` tool calls `appendDecision` (`mcp-server/src/tools.ts:426-450`), which creates `.maestro/` (`packages/core/src/decisions.ts:38-60,85-101`).
10. Q:160 repeats that every command invocation is logged. Cancellation can return before any audit write (`maestro-extension/src/chat/participant.ts:179-184,197-203`), and MCP/static-skill invocations are not audit writers (`mcp-server/src/tools.ts:505-523`).
11. Q:251 says the server exposes 25 prompts. Prompt registration filters to user-invocable skills (`mcp-server/src/prompts.ts:8-13`), and the core skill is not invocable (`source/skills/agent-workflow/SKILL.md:1-7`), yielding 24.
12. Q:252 gives ten unprefixed tool names such as `list_commands` and `run_command`. The registered identifiers are prefixed, including `maestro_list_commands`, `maestro_run_command`, and `maestro_read_context` (`mcp-server/src/tools.ts:143-156,219-222`), with the remaining tools following the same `maestro_` naming in that file (for example `mcp-server/src/tools.ts:288-291,426-429,505-508`).
13. Q:259-267 says a manual installer can copy `.claude/skills/` or `.cursor/skills/` from the checkout. Those provider trees are ignored generated output (`.gitignore:16-27`) created by the build step (`scripts/build.js:71-80`), so they are unavailable in this snapshot until that omitted step runs.
14. Q:315 describes `prompts.ts` as providing 25 MCP prompts. It registers only user-invocable skills (`mcp-server/src/prompts.ts:8-13`), excluding the non-invocable core (`source/skills/agent-workflow/SKILL.md:1-7`), so it provides 24.
15. Q:332 says valid skill frontmatter requires `description` to start with “Use when...”. Validation checks only that a description exists (`scripts/validate.js:49-55`); the valid `capture` skill's description does not start that way (`source/skills/capture/SKILL.md:1-7`).

### 2. The reader's four needs

- **Decide whether it fits — yes.** Q:28-39 states the target workflow problems, core/reference model, persistence, context, and follow-up behavior.
- **Install by the fitting route — no.** Q:43-47 covers only skill installation, Q:218-253 covers MCP, and Q:257-267 gives the broken manual fallback; despite extension badges at Q:14, there is no extension-install/use route.
- **Run a first command and know it worked — no.** Q:49-56 starts with commands that require missing context, omits `/teach-maestro`, and supplies no first-run success artifact or report description.
- **Find the next command later — yes.** Q:91-135 lists all 24 actual commands by task despite the false “25” heading.

### 3. Every word carries weight

- Q:1-26 uses **68 words** on centered chrome, six badges, a count-heavy tagline, navigation, and separators before explaining the product.
- Q:75-87 uses **84 words** on a seven-row reference-file catalog that repeats the domain list before the actionable command catalog.
- Q:139-183 uses **174 words** on a “What's New” presentation, repeated storage claims, and an invented scorecard rather than installation or first-run evidence.
- Q:187-197 uses **76 words** to repeat selected core anti-patterns after the fit explanation.
- Q:271-323 uses **256 words** on an exhaustive repository tree after the manual-install instruction; the tree does not repair that instruction.
- Q:327-334 uses **47 words** on generic contribution requirements, including the false requirement at Q:332.

### 4. Length

**1,478 words** (reported only; not used to select).

## R

### 1. VETO — false claims (3)

R is **vetoed** by its first-run prerequisite at R:91: `.maestro.md` is not required when `.maestro/context.md` exists, because that path has priority (`source/skills/agent-workflow/SKILL.md:13-17`). The actual R:92-94 command sequence is still the correct fresh-project sequence.

1. R:57 says `@maestro` commands write both decision and audit logs without stating the cancellation exception. A cancellation can return before `emitAudit`, which writes both logs (`maestro-extension/src/chat/participant.ts:179-184,197-203,295-338`).
2. R:91 says every command except `/teach-maestro` needs `.maestro.md`. The core protocol accepts `.maestro/context.md` first and `.maestro.md` second (`source/skills/agent-workflow/SKILL.md:13-17`).
3. R:93 says `/teach-maestro` reads an existing `.maestro/context.md` first. The skill begins the interview directly and specifies `.maestro.md` as its output (`source/skills/teach-maestro/SKILL.md:10-20,51-75`); that broad claim is therefore false for the skill-file and MCP-prompt routes, even though the extension separately injects detected context.

### 2. The reader's four needs

- **Decide whether it fits — yes.** R:9-17 states the workflow scope, command/reference model, persistence, and three delivery routes.
- **Install by the fitting route — yes.** R:19-23 compares route compatibility, prerequisites, and project writes; R:25-87 gives skill, extension, and MCP instructions at the point of choice.
- **Run a first command and know it worked — yes, apart from the R:91 path error.** R:92-94 gives `/teach-maestro` then `/diagnose` and names both observable outputs: a context file and a five-dimension report with an overall score and next commands.
- **Find the next command later — yes.** R:96-123 is the complete command lookup, and R:125-135 explains the session-continuity commands and their data limits.

### 3. Every word carries weight

- R:144-148 spends **58 words** on support and contributor build mechanics after the reader's four routes are complete. The target reader did not need maintainer instructions here.

### 4. Length

**1,379 words** (reported only; not used to select).

## Ranking

1. **R** — R:19-23 gives the clearest route-selection table and R:89-94 reaches an observable first result with the least off-route material, despite its vetoed context-path wording at R:91.
2. **P** — P:172-193 uniquely exposes the extension's consequential workspace writes and overwrite behavior, but P:208-244 diverts into 258 words of maintainer detail and P has more false claims.
3. **Q** — Q:49-56 sends a fresh reader past the required setup and Q:259-267 gives a manual-install command whose source directories are not present, so its install and first-run path fails.

Length did not break any rank. All three texts are vetoed, so the ordering among them reflects how fully their cited passages serve the four stated reader needs after recording the vetoes.
