# Defects found in passing: entrust

Recorded per the repository rule: evidence at file:line, an evidence level (1: the line resolves; 2: an
independent reader of the code would say the same; 3: the behaviour was made to happen), and wording that
can become an issue unchanged. An entry leaves when its fix lands and the changelog names it. Ids are
shared with terse's ledger, `plugins/terse/ISSUES.md`, so one id names one entry in both. A path
pinned to a commit is that commit's address, with today's beside it.

## E51. A Codex agent picks its own output cap when it reads a file, and no page tells the coordinator to set one, so a read can return a fragment

**Evidence, level 3.**

- codex-cli 0.155.1 runs commands through a JavaScript `exec` tool whose `tools.exec_command({cmd, max_output_tokens, yield_time_ms})`
  the model fills in itself. `codex debug models` gives every gpt-6 model `truncation_policy: {mode: tokens, limit: 10000}`.
- 2026-09-26, a one-line probe on gpt-6-luna (rollout `~/.codex/sessions/2026/09/26/rollout-2026-09-26T20-51-43-01a0ded8-2b3b-7ca3-be1e-de3c54d965dd.jsonl`):
  asked only to run `echo probe-ok`, the model wrote `max_output_tokens:1000` on its own.
- Same day, a gpt-6-sol read agent (rollout `rollout-2026-09-26T22-51-18-01a0df45-a320-7fb1-9081-a446b9843a16.jsonl`)
  opened 95 pages of about 18,000 characters in one loop with `max_output_tokens: 1000`; each output was 19–60
  characters and 419 of the 1,745 message ids on those pages ever reached the model
  (`plugins/terse/research/2026-09-26-writing-replication/measures/A2-1-reading-check.md`). With
  "`max_output_tokens: 10000`, one `cat` per page" in the brief, 1,583 of 1,584 page reads by 374 Luna agents
  arrived whole at the first launch; the one miss had read all ten pages of its part in one loop and got the
  combined output cut (`measures/coverage/col.json`, agent `col-P036-B`).
- `grep -rn max_output_tokens plugins/entrust/plugin/skills` finds nothing: neither `codex` nor `orchestrate` says it.

**Check.** `jq -r 'select(.payload.type=="custom_tool_call") | .payload.input' <the second rollout> | grep -o 'max_output_tokens[^,}]*'`
prints the 1000.

## E52. A read agent's report of what it read is taken on trust; its own rollout can contradict it and nothing compares them

**Evidence, level 3.**

- The same gpt-6-sol agent as in E51 answered "95 pages opened by separate cat commands with max_output_tokens:
  10000; no truncation found" (`answerJson.evidence`, report `A2-1`); its rollout holds 28 custom tool outputs, 2 wait outputs and
  419 of 1,745 message ids, and its gap findings came from keyword regexes over the messages
  (`plugins/terse/research/2026-09-26-writing-replication/measures/A2-1-reading-check.md`).
- The receipt proves the thread ran, not what it read: `codex/references/environment-and-internals.md:160-166`.
  No page names a check that a page an agent was given reached its context.
- A check that works: `plugins/terse/research/2026-09-26-writing-replication/tools/coverage.py` counts a page as
  read only when its whole text is a substring of one command output in the agent's own rollout (decoding a
  JSON-printed output too); over the run it flagged 13 of 500 stress agents, 1 of 356 collection agents (inspected: nine of ten pages
  whole, the tenth only inside a cut loop output) and the false self-report above; before it learned to decode a
  JSON-printed output it also flagged two agents that had read everything.

**Check.** Run `coverage.py` on a map that pairs agent `A2-1` with the 94 human pages: it reports the pages unread.

## E53. A Claude agent starts with the owner's global and project CLAUDE.md and memory index loaded, which `orchestrate` never mentions when it assigns blind or independent roles

**Evidence, level 3.**

- 2026-09-26, the bottom-up analyst (Opus), told to work from episodes only and not to open CLAUDE.md or memory:
  record 7 of its transcript,
  `~/.claude/projects/-Users-ruliny-Git-agent-skills/261eafc8-ba46-48af-8111-f9e6784dfc05/subagents/agent-a7f1e1fb08cb1091e.jsonl`,
  is an `attachment` of type `instructions` whose files include `/Users/ruliny/.claude/CLAUDE.md`, the
  repository's `CLAUDE.md` and the memory `MEMORY.md`. The agent had not opened them; the harness put them there.
- A Codex agent's context is its prompt file, the driver's standing rules and codex's own AGENTS.md files; on this
  machine `~/.codex/AGENTS.md` is empty (0 bytes) and the repository has no `AGENTS.md`.
- `orchestrate/SKILL.md` and `references/roles.md` give Claude and Codex agents the same judgement roles and state
  no difference in what each starts with; `grep -n "CLAUDE.md" plugins/entrust/plugin/skills/*/SKILL.md` finds none.

**Check.** `sed -n 7p <that transcript> | jq -r '.attachment.type, (.attachment.files[]?.path // empty)'` prints
`instructions` and the three paths.
