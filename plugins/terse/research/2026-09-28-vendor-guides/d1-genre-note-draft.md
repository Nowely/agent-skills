# Draft 1 — the genre note for text an agent executes, and two lines around it

A draft for the owner's read, built from M1's sections 4 and 5 (`m1-map.md`). Nothing below is in the pages yet.

## New file: `plugins/terse/plugin/references/genres/skill-page.md`

```markdown
# Skill page or standing agent instructions (provisional)

Start with the vendor's guidance for the model that will load the text: Anthropic's [skill authoring best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices) and its [prompting guide](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices) with the page for that model, OpenAI's [skills](https://learn.chatgpt.com/docs/build-skills) and [prompting](https://learn.chatgpt.com/docs/prompting) guides. The reader of a SKILL.md, a plugin's agent file, or a CLAUDE.md or AGENTS.md section is that model, so these pages are the authority; where a rule is measured on one model, check it against the page for yours.

The model reads the description to decide whether to load the skill, then follows the body for the rest of the session. Say in the description what the skill does and when to use it, trigger words first, and keep it short: hosts budget descriptions and cut them. Let the body route: the steps and standing rules in SKILL.md, detail in files it links directly, a long file opening with its contents. State the result, and fix the process only where the work is fragile, with the reason on that line. Name what to run, what to read, and what must be installed. Claude Code keeps only the first 5,000 tokens of a skill after compaction, so a rule past that point is lost for the rest of a long session.

Do not restate what the model already does unprompted, turn a dated measurement into an instruction that expires, or add emphasis in capitals. Test the page on realistic requests, with each model that will load it, against a run without it.

## Example

Before: a delegation skill of 5,510 words kept its prompt template, its traps and its reference list after line 357. In a long session the compaction cut it at line 269, and the coordinator went on without those sections. After: not repaired yet; finding 4.14 in `plugins/terse/research/2026-09-28-vendor-guides/m1-map.md`, made level 3 in `v1-verification.md` beside it.
```

Rows behind each sentence (M1 §5a unless marked): the authority and the model page — 5a.8, M-89; description — 5a.1, 5a.3;
routing — 5a.2, and Anthropic only: one level deep and a contents list (N-10, N-11); result over process — 5a.4, N-3;
run, read, install — Anthropic only (M-78, M-81); the 5,000 tokens — Claude Code's skills page (M-210); unprompted
behaviour — 5a.7, 5a.18; dated instructions — N-15 as M1 §4 decided it (4.5 against 4.16); capitals — M-101 and
`writing-rules.md:13`; testing — 5a.9, M-60.

## `plugins/terse/plugin/references/genres/agent-brief.md`, one sentence added to its first paragraph

> The receiving model's vendor guidance is the authority on its conventions: Anthropic's [prompting guide](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices) with the page for that model, or OpenAI's [prompting guide](https://learn.chatgpt.com/docs/prompting).

## `plugins/terse/plugin/skills/clarity/SKILL.md:72`, the genre list

`[agent brief](../../references/genres/agent-brief.md).` becomes
`[agent brief](../../references/genres/agent-brief.md), or [skill page or standing agent instructions](../../references/genres/skill-page.md).`
(with the `or` moved from the line before). The description is not touched: it already covers "text for a person or
another agent", and a changed description changes the trigger measurement.

## Not in this draft

M1 §5e items 3–8 — the reason line, scope and the blocked case, the stops, the return as a contract, what the agent
cannot see, untrusted material — are about briefs, and `agent-brief.md` is provisional with one check behind it. They
wait for the owner's word on whether that note grows.
