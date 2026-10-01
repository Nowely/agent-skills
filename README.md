# Nowely's agent skills

A marketplace of plugins for Codex and Claude Code. Each plugin is a set of skills an agent loads when the work calls
for it.

## Codex

```bash
codex plugin marketplace add Nowely/agent-skills
codex plugin add entrust@nowely
codex plugin list --marketplace nowely --available --json
```

Invoke `$entrust:orchestrate` to coordinate native Codex subagents. The `codex` skill is the
Claude-to-Codex adapter and is not needed for native Codex delegation. The other external-run
features still depend on that adapter; installing them does not establish native compatibility.
Install `terse` with `codex plugin add terse@nowely`; its four skills use native host instructions.
Invoke `$terse:rethink`, `$terse:rewrite`, or `$terse:audit` explicitly; `$terse:clarity` may also be selected automatically.

The existing `.claude-plugin/marketplace.json` is a
[Codex-supported catalogue format](https://learn.chatgpt.com/docs/enterprise/plugin-management).
For local development, pass the repository root to `codex plugin marketplace add`; installing
copies the payload into the plugin cache, so reinstall after editing it.

## Claude Code

```text
/plugin marketplace add Nowely/agent-skills
```

Then install what you need:

| Plugin | Install | What it does |
| --- | --- | --- |
| [entrust](plugins/entrust/plugin/) | `/plugin install entrust@nowely` | Orchestrates native agents in either host; in Claude, also runs external Codex agents with per-call rights and evidence. |
| [terse](plugins/terse/plugin/) | `/plugin install terse@nowely` | Assesses and improves any text — a README, code comments, an essay. Fresh readers find where it stumbles, each claim is checked against what backs it, and one writer with independent critics rewrites it on your word. |

## Layout

```text
.claude-plugin/marketplace.json   the catalogue: one entry per plugin
plugins/<name>/plugin/            one plugin as it installs: its manifest, skills and docs
plugins/<name>/                   beside it, what does not install: changelog, suites, ledger, research,
                                  entrust's protocol schema
```

A plugin owns everything under `plugins/<name>/`, and an install copies only its `plugin/`. The
catalogue at the root is the repository's, not any one plugin's.

## Releases

One tag namespace serves every plugin, so a tag names the plugin it releases:
`entrust@0.16.0`. [RELEASING.md](RELEASING.md) is the procedure for cutting any of them.
