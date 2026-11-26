# What differs by host

The [open specification](https://agentskills.io/specification) holds on every host: the folder, the frontmatter,
the limits on `name` and `description`, a body it recommends keeping under 5,000 tokens and 500 lines, and
references one level from `SKILL.md`. This table holds what each host adds, as its vendor's guide states it.
Read the guide again before relying on a figure.

| | Claude Code | Codex and ChatGPT |
|---|---|---|
| The vendor's guide | [skills](https://code.claude.com/docs/en/skills), [authoring best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices) | [build skills](https://learn.chatgpt.com/docs/build-skills) |
| What the listing keeps of a description | `description` and `when_to_use` together are cut at 1,536 characters | the whole list of skills gets 2% of the context window, or 8,000 characters, and descriptions are shortened first |
| What is kept of a selected skill | the whole body; after a long session is compacted, the first 5,000 tokens of each skill invoked, which the check script counts as 20,001 characters | the whole `SKILL.md` |
| The field that makes a skill user-invoked only | `disable-model-invocation: true` in the frontmatter | `policy: allow_implicit_invocation: false` in the skill's `agents/openai.yaml` |
| Where skills live | `~/.claude/skills/<name>/` for a user, `.claude/skills/<name>/` in a project, `<plugin>/skills/<name>/` in a plugin | `.agents/skills/` from the working directory up to the repository's root, `$HOME/.agents/skills/` for a user, or a plugin |
| Two skills of one name | a plugin's skill is called `plugin:name`, so both load; between a user's and a project's, the user's runs | they are not merged, and both can appear |
| A built-in skill for making skills | `skill-creator`, where the account has Anthropic's skills | `skill-creator`, enabled by default |
| A tool that runs a selection check | `claude plugin eval` | none known |
| Where it lists its models | the model picker; with entrust, [its models page](../../claude/references/models.md) | the model picker; with entrust, [its models page](../../codex/references/models.md) |
| Reading the user's past sessions | with entrust, [prepare-feedback](../../prepare-feedback/SKILL.md) finds them and has them read | no tool known: read the session files the user points to |
