# Skill page or standing agent instructions (provisional)

Start with the vendor's guidance for the model that will load the text: Anthropic's [skill authoring best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices) and its [prompting guide](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices) with the page for that model, OpenAI's [skills](https://learn.chatgpt.com/docs/build-skills) and [prompting](https://learn.chatgpt.com/docs/prompting) guides. The reader of a SKILL.md, a plugin's agent file, or a CLAUDE.md or AGENTS.md section is that model, so these pages are the authority; where a rule is measured on one model, check it against the page for yours.

The model reads the description to decide whether to load the skill, then follows the body for the rest of the session. Say in the description what the skill does and when to use it, trigger words first, and keep it short: hosts budget descriptions and cut them. Let the body route: the steps and standing rules in SKILL.md, detail in files it links directly, a long file opening with its contents. State the result, and fix the process only where the work is fragile, with the reason on that line. Name what to run, what to read, and what must be installed. After a compaction, Claude Code re-attaches the most recent invocation of each skill and keeps its first 5,000 tokens, so a rule past that point is lost for the rest of a long session; the re-attached skills share a combined budget of 25,000 tokens. In Claude Code 2.1.280's code a token is counted as four characters, so about 20,000 characters of the body survive, counted without the frontmatter and with its `${CLAUDE_…}` paths filled in; the most recent skill comes first, and a skill's first load is never cut. Anthropic's pages add mechanical limits:

- a `name` of lowercase letters, digits and hyphens only;
- a SKILL.md body under 500 lines;
- `description` and `when_to_use` together within 1,536 characters, where Claude Code's skill listing cuts them;
- every reference file linked from SKILL.md itself, not through another reference;
- a table of contents at the top of a reference over 100 lines, so that a model previewing it with `head -100` still sees every section;
- forward slashes in file paths, even on Windows.

Do not restate what the model already does unprompted, turn a dated measurement into an instruction that expires, or add emphasis in capitals. Test the page on realistic requests, with each model that will load it, against a run without it.

## Example

Before: a delegation skill of 5,510 words kept its prompt template, its traps and its reference list after line 357. In a long session the compaction cut it at line 269, and the coordinator went on without those sections. After: the steps a coordinator takes only on an event, such as an approval, a preserved worktree or stopping an agent, moved into the files that own them, each linked at the line where its event comes up, and the page re-attaches whole: 259 lines and 19,867 characters by `evals/skills.test.mjs`'s count, where 20,001 are kept. Recorded as E77 in `plugins/entrust/ISSUES.md`, from `plugins/terse/research/2026-09-28-vendor-guides/`.
