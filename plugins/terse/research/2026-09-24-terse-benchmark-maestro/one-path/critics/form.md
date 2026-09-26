# form.md — draft.md vs rules 4-16 (in/rules.md) and genre-order.md

## Answers

1. Opening (lines 1-8): what-it-is, what-it-is-for, and a bold-led advantages list are all present. But line 3's first sentence ("24 slash commands... prompts, tools, RAG, multi-agent setups") names a count and categories rather than a mission; the job (audit/fix/harden/cut cost) only arrives in the second sentence. Hypothesis, rule 4.
2. Quick start (line 10) follows the opening directly: install (12-18), then first use (20-32, /teach-maestro then /diagnose, each showing what to type and what comes back). Compliant, rule 7.
3. The inventory (## Commands, 39-83) is four tables, each with the three columns rule 10 names: Command / What it does / Use it when. Compliant, rule 10.
4. Sections and sub-blocks mostly match genre formatting, with two breaks: line 37 (a runnable command left as inline code, not fenced) and line 95 (a bare sentence inside a section that is otherwise a bold-led bullet list). Rule 14.
5. Missing: none of the four canonical blocks — what it is, Quick start, inventory, how it works (rule 13) — is missing. Extra: none of rule 15's junk sections (licence, troubleshooting, "your files") appear; Contributing matches the genre's Tail (genre-order.md, Tail row: 5/7 and 6/8 contributing headings). Out of place: line 95, the documentation link, which sits inside How it works instead of the genre's Tail block.

## Findings

- Line 3 — rule 4: "Maestro gives your AI coding agent 24 slash commands for the LLM workflows you build: prompts, tools, RAG, multi-agent setups" names a count and categories, not a mission; "what it is for" only comes in the next sentence. Hypothesis.
- Lines 34-37 — rule 8: both "Other routes" bullets add a second sentence of feature description past the action itself ("It adds a command sidebar... and writes the skills into your workspace"; "the commands arrive as prompts"), beyond "one line... or a link." Hypothesis.
- Line 37 — rule 14: `npx -y maestro-workflow-mcp` is given as inline code, not a fenced block with a language, unlike the install command at lines 14-16. Proven.
- Lines 18, 26 vs 87-88 — rule 12: skill-loading order and the `.maestro.md` filename are stated in Quick start (18, 26) and restated in How it works (87-88) — technical detail spread across two sections instead of held in one. Hypothesis.
- Line 95 — rule 14: "Showcase and documentation: [maestroskills.dev](https://maestroskills.dev)." is a bare sentence, breaking the bold-led bullet-list format every other item in How it works uses (87-93). Proven.
- Line 95 — rule 13: the documentation link sits inside How it works; genre-order.md's Tail row places documentation in its own trailing block, not inside the technical section. Hypothesis.

No violations found for rules 7, 9, 10, 11, 15, 16 in this draft.
