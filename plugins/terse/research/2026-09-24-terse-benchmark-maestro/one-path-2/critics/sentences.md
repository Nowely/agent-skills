<!-- sentences; 7.1 min; 11 tool uses -->

Reviewed /var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/terse-bench-D2/writer/01-draft.md against writing-rules.md and curse-of-knowledge.md (applied as written) and against rules.md's first section ("## First: a pleasant read", lines 18-29 — the only `##`-headed block literally named "First"), for sentences a reader would hit twice.

10 sentences found, all across 9 lines. None qualify for "cut" — each carries needed information; the fix is restructuring, not deletion.

**Line 3** (2nd sentence, 26 words) — three parallel verbs (check/fix/add) hung off one relative clause, the first verb carrying its own 4-item list:
> It gives your coding agent 24 slash commands that check your prompts, context, tools and agent design, fix what is weak, and add what is missing.
Plainer: "It gives your coding agent 24 slash commands. Each one checks your prompts, context, tools and agent design, then fixes what's weak and adds what's missing."

**Line 39** (1st sentence) — a 5-item list runs straight into a second action ("then saves…") with a filename tacked on; "then" reads at first as though the list continues:
> It asks about your models, workflow, quality checks, constraints and priorities, then saves the answers to `.maestro.md` in your project.
Plainer: "It asks about your models, workflow, quality checks, constraints and priorities. Then it saves your answers to `.maestro.md`."

**Line 47** (1st sentence, 27 words) — elliptical: "then the most serious findings…" has no verb of its own, so the reader must reuse "get" from clause one, then trace "them" back to "findings":
> You get a score from 1 to 5 for prompts, context, tools, architecture and safety, then the most serious findings and the commands to run for them.
Plainer: "You get a score from 1 to 5 for prompts, context, tools, architecture and safety. You also get the most serious findings, each with the command that fixes it."

**Line 59** (table, "Use it when" for `/reflect`) — `@maestro` used here before it's ever explained; the definition doesn't arrive until line 121 (verified by grep: lines 59, 121, 122 are its only occurrences, first use unglossed):
> You run commands through the extension's `@maestro` in VS Code
Plainer: "You run commands from VS Code's chat, through the extension."

**Line 112** (1st sentence) — elliptical: "and Maestro's principles and seven reference guides as resources" has no verb of its own, reader must reach back to "offers":
> Your client then offers each command as a prompt, and Maestro's principles and seven reference guides as resources.
Plainer: "Your client can then use each command as a prompt. It can also use Maestro's principles and seven reference guides as resources."

**Line 116** (2nd sentence) — three code-formatted names in one 13-word clause, plus an exception ("All but X") whose subject ("commands") is carried over from the prior sentence rather than stated:
> All but `/teach-maestro` first load `agent-workflow`, the core skill, and read your `.maestro.md`.
Plainer: "Every command except `/teach-maestro` follows the same first steps: load the core skill (`agent-workflow`), then read your `.maestro.md`."

**Line 116** (3rd sentence, 25 words) — a 3-item list whose third item alone takes a 7-item sub-list after the colon; easy to misjudge which items the colon covers:
> The core skill holds Maestro's principles, a checklist of common mistakes and seven reference guides: prompts, context, tools, agent architecture, feedback loops, retrieval and guardrails.
Plainer: "The core skill holds Maestro's principles and a checklist of common mistakes. It also holds seven reference guides: prompts, context, tools, agent architecture, feedback loops, retrieval and guardrails."

**Line 121** (26 words) — two actions (runs/logs), each with two prepositional riders, plus three code-formatted names in one clause:
> **`@maestro` in VS Code's chat**, which runs a command on the editor's chat model with your project context and logs each run in `.maestro/` for `/reflect`.
Plainer: "**`@maestro` in VS Code's chat** runs a command on the editor's chat model, using your project's context. It logs each run in `.maestro/`, which `/reflect` reads."

**Line 122** — three code-formatted names (`/zero-defect`, `@maestro`, `CLAUDE.md`) packed into one clause behind an appositive ("a switch that…"):
> **Zero-Defect mode**, a switch that adds the `/zero-defect` rules to every `@maestro` request and to `CLAUDE.md`.
Plainer: "**Zero-Defect mode** turns on the `/zero-defect` rules for every `@maestro` request, and adds them to `CLAUDE.md`."

**Line 124** (2nd sentence, 34 words — the longest sentence in the document) — three parallel "writes A into B" objects, the first carrying a parenthetical of two more paths plus "eight more":
> The extension also writes the skills into each agent's folder (`.claude/skills/`, `.cursor/skills/` and eight more), its server entry into your MCP config, and the Zero-Defect rules into `CLAUDE.md` and Cursor's or Antigravity's rules file.
Plainer: "The extension also writes the skills into each agent's folder (`.claude/skills/`, `.cursor/skills/` and eight more). It adds its own entry to your MCP config, and the Zero-Defect rules to `CLAUDE.md` and to Cursor's or Antigravity's rules file."

Word counts verified with `wc -w` (not eyeballed) for the five longest. Checked and left unflagged as acceptable genre convention: the flat 5-item colon-list at line 5, the 9-tool enumeration at line 8, and all other table-cell fragments except line 59 (which fails on the forward-reference to `@maestro`, not on density).

Constraints honored: no `cd`, no writes, no edits to the snapshot; only the four files named in the brief (plus a few more lines of rules.md for section context, still inside the permitted `terse-bench-D2/in/` — not `terse-bench-D`, which is on the forbidden list); no fetch of github.com/sharpdeveye/maestro, maestroskills.dev, or any forbidden directory.
