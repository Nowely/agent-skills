# Nowely's agent skills

A marketplace of Claude Code plugins. Each plugin is a set of skills an agent loads when the work calls
for it.

```text
/plugin marketplace add Nowely/agent-skills
```

Then install what you need:

| Plugin | Install | What it does |
| --- | --- | --- |
| [entrust](plugins/entrust/plugin/) | `/plugin install entrust@nowely` | Runs OpenAI Codex as a subagent beside Claude's own agents. Each call declares what Codex may write; the report says what actually ran. |
| [terse](plugins/terse/plugin/) | `/plugin install terse@nowely` | Assesses and improves any text — a README, code comments, an essay. Fresh readers find where it stumbles, each claim is checked against what backs it, and one writer with critics working at once rewrites it on your word. |

## Layout

```text
.claude-plugin/marketplace.json   the catalogue: one entry per plugin
plugins/<name>/plugin/            one plugin as it installs: its manifest, skills and docs
plugins/<name>/                   beside it, what does not install: changelog, suites, ledger, research,
                                  entrust's protocol schema
research/                         research runs about the repository as a whole
```

A plugin owns everything under `plugins/<name>/`, and an install copies only its `plugin/`. The
catalogue at the root is the repository's, not any one plugin's.

## Releases

One tag namespace serves every plugin, so a tag names the plugin it releases:
`entrust@0.16.0`. [RELEASING.md](RELEASING.md) is the procedure for cutting any of them.
