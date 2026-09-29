# H2: live invocation check (manual, before release)

This spends Claude tokens. Do not run it as part of the page check. Record model, Claude Code version, plugin version, settings, date, and the full trace for each trial. A `Skill terse:clarity` tool use must succeed before the final answer text or the first target Write, Edit, or Bash action, whichever comes first. Report the fractions; the owner sets any release threshold after seeing the first run.

The exact thirteen positive and two negative prompts, with their small fictional fixtures, live in
[`clarity-trigger/cases.json`](clarity-trigger/cases.json). Both the official eval and live probe read
that file. Facts are in each prompt because an eval session may not have file-reading tools.
Three held-out sets sit beside it, each written by an agent that saw neither the description nor `cases.json`:
`holdout.json` (short texts written during coding, plus an identifier rename and a verbatim copy as
negatives), `holdout-relay.json` (an agent's or tool's result passed on to the user or to a named
third person) and `holdout-ui.json` (interface text and error messages, plus an identifier rename and a
constant change as negatives). Run one with `node evals/clarity-trigger.official.mjs --cases evals/clarity-trigger/holdout.json --run`.
After a change to the description, write a fresh set: one the writer has seen is no longer held out.

The thirteen positive requests cover:

1. “Answer both questions from this issue: what changed, and what should I do next?”
2. “Explain this failed check to the person who requested the change.”
3. “Write a short plan for adding this option; the maintainer will approve it.”
4. “Report today's outcome, evidence and remaining uncertainty to the owner.”
5. “Write the title for this staged commit using the repository's recent commits.”
6. “Describe this diff for reviewers in a PR.”
7. “Write a comment beside this branch in the source file explaining the constraint.”
8. “Send the API team a message asking for the one decision this change needs.”
9. “Brief an agent in chat to review this draft against its source.”
10. “Write that agent brief into the task file in the fixture.”
11. “Tell me what this agent's report established and what remains uncertain.”
12. “Write a review comment on the line that contradicts the API contract.”
13. “Check where this ticket stands.”

The two negative requests are “Reply only OK to acknowledge receipt” and “Run the specified read-only
status command, then reply only done” (with `pwd` as the command). Do not use a standalone README or
document as a negative example; those belong to the deep skills. These are boundary probes, not a
test that the skill never affects short prose in an already loaded session.

Preview the ordinary-environment probe without spending tokens:

```sh
node evals/clarity-trigger.live.mjs
```

Run it only when ready to spend Claude tokens. The output must be a new file inside `$TMPDIR`:

```sh
node evals/clarity-trigger.live.mjs --run --out "$TMPDIR/clarity-live.jsonl"
node evals/clarity-trigger.live.mjs --run --without-plugin --repeat 3 --out "$TMPDIR/clarity-blind.jsonl"
```

Each command covers all 15 cases and three repetitions (45 fresh sessions per arm). The second
command runs only the control arm, without `--plugin-dir`; `--candidate DIR` changes the candidate.
Both arms use the ordinary owner profile, including neighboring skills and user-level `CLAUDE.md`.
They differ only in the explicit `--plugin-dir` flag. Hooks are disabled with
`--settings '{"disableAllHooks":true}'`, MCP configuration is excluded with `--strict-mcp-config`,
and `--no-session-persistence` avoids saved sessions. `dontAsk` denies permission prompts. Tool
grants are case-specific: `Edit(task.md)` permits the Write tool for `task.md` relative to the fresh
temporary working directory, and Bash only for `pwd` in the status case. [Claude Code's permission
rules](https://code.claude.com/docs/en/permissions) check Write file paths against `Edit(path)`;
`Write(path)` does not grant access. Other file, code, web, and agent tools are
disallowed; the blocked list includes `ListAgents` and `SendMessage` so the agent-brief case cannot
message a real agent where those tools exist. The relative `Edit(task.md)` rule is the documented form chosen here. Its action has
not been checked in a model run; the documented absolute alternative is
`Edit(//<absolute cwd without its leading slash>/task.md)`, for example
`Edit(//private/var/tmp/task.md)`. The coordinator can compare these forms if the relative rule
still denies Write. The trace check rejects any attempted tool outside this case policy.

On 2026-09-27 with Claude Code 2.1.280, the coordinator observed that `--safe-mode --restricted`
loaded the explicit terse plugin in `init.plugins` but hid all its skills from `init.skills`; that
form could not measure clarity invocation. In the ordinary environment, `init.skills` listed 69
skills, including `terse:clarity`, and the measured session invoked it first. The current form keeps
the ordinary skill inventory while disabling hooks, MCP configuration, and session persistence.

Each JSONL line records one run, including start time, model, Claude Code version, candidate plugin
version, settings, final text, and trace path. The last line records positive trigger and negative
non-trigger fractions. Raw stream traces and stderr are beside the output file in `<out>.traces/`.
The `system/init.skills` trace must list `terse:clarity` in the candidate arm and omit it in the
control arm. This result is recorded as `isolationConfirmed`; a missing inventory or failed check
excludes that run from fractions. If an already
installed plugin exposes clarity in the control arm, those runs are excluded rather than treated as
an ablation.
The script also excludes runs whose trace shows an attempted tool outside that case's narrow policy.
`invokedBeforeTarget` is the main measure: the successful `Skill terse:clarity` result came before
the last assistant text that forms the final answer and before the first Write, Edit, or Bash action,
if one occurred. It feeds the positive fraction. `invokedBeforeText` is the stricter diagnostic:
the result came before any assistant text, including a short preface. A visible Skill line alone
proves loading, not that the rules were applied or the text improved.

The clean `CLAUDE_CONFIG_DIR` cannot run `claude -p` here (`Not logged in`), so use the official eval
for that environment. The live arms use the ordinary credential. Also run
one longer session with compaction followed by another positive request; record whether the page
returned, was called again, or was absent.

`clarity-trigger.count.mjs` is a **historical H1 proxy**, not the live measure. It searches older
session logs for selected agent and publishing tool actions, plus final replies of at least 40 words.
It misses short replies, ordinary first text, and file edits without those tools. Its fractions must
not be combined with the live first-text-or-action fractions; validate it against hand labels before
using it as a rate.

For quality, compare a blind sample of output with and without `clarity` under identical tasks and
settings, checking factual completeness and the owner's pleasant-read judgment separately. Do not
infer this from trigger counts. Keep traces outside the repository and publish only aggregate counts
and examples with private content removed.
