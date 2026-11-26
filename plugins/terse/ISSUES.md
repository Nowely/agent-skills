# Defects found in passing: terse

Recorded per the repository rule: evidence at file:line, an evidence level (1: the line resolves, which is its
address holding what the claim quotes or states, not the line merely existing, and the same words at another
address are the claim moved; 2: an independent reader of the code would say the same; 3: the behaviour was made to
happen), and wording that can become an issue unchanged. An entry leaves when its fix lands and the changelog
names it. Ids are shared with entrust's ledger, `plugins/entrust/ISSUES.md`, so one id names one entry in both. A
path pinned to a commit is that commit's address, with today's beside it.

## E141. The plugin and marketplace descriptions still offer automatic clarity invocation

Evidence level: 1. `plugins/terse/plugin/.claude-plugin/plugin.json:4` and
`.claude-plugin/marketplace.json:20` say `clarity` is guidance "the assistant may choose".
`plugins/terse/plugin/skills/clarity/SKILL.md:7` instead says "Invoke clarity explicitly",
line 18 sets `disable-model-invocation: true`, and
`plugins/terse/plugin/skills/clarity/agents/openai.yaml:2` sets `allow_implicit_invocation: false`.
The descriptions predate this release preparation and contradict the invocation policy introduced in #86.

## E168. The skill-page genre note restates limits that entrust's skill checker now owns

Evidence level: 1. `plugins/terse/plugin/references/genres/skill-page.md:5` states the compaction figures (5,000
tokens, about 20,000 characters) and lines 7 to 12 list six mechanical limits. With skill-creator in the tree, the
numbers and the checks are owned by `plugins/entrust/plugin/skills/skill-creator/scripts/check.mjs`, which
`scripts/skills.test.mjs` imports, and that script also checks the open specification's limits on `name` (64
characters) and `description` (1,024), which the note does not mention. The note is in another plugin and cannot
link entrust's files, so the two can drift. Decide whether the note keeps its numbers with a pointer to the
suite as their check, or states the rules without numbers.
