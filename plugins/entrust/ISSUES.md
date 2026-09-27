# Defects found in passing: entrust

Recorded per the repository rule: evidence at file:line, an evidence level (1: the line resolves; 2: an
independent reader of the code would say the same; 3: the behaviour was made to happen), and wording that
can become an issue unchanged. An entry leaves when its fix lands and the changelog names it. Ids are
shared with terse's ledger, `plugins/terse/ISSUES.md`, so one id names one entry in both. A path
pinned to a commit is that commit's address, with today's beside it.

## E1. A user's "the network is allowed" becomes `WEB_SEARCH:`, and a mode the device refuses is swapped for `cached` without asking

**Evidence, level 3.**

- `plugins/entrust/skills/codex/SKILL.md:209` (at `23036f0`; now `plugins/entrust/plugin/skills/codex/SKILL.md`) reads
  `| `WEB_SEARCH:` | `cached`, `indexed`, `live` | the agent needs sources it cannot read locally |`, a
  "when" that reads as "the agent needs the internet". The network is another channel, open at every level
  with no line: `SKILL.md:175-176`, "Every level reaches the network, as a native subagent does, and
  `NETWORK: no` denies the sandbox that — not the provider's web search, which is `WEB_SEARCH:`'s own
  channel."
- This device's managed policy, `/Library/Managed Preferences/com.openai.codex.plist`, carries
  `allowed_web_search_modes = ["cached"]` in its `requirements_toml_base64`. `driver.mjs:1156-1178` reads
  it and `driver.mjs:2333-2338` refuses any other mode at `--run`; `--new` accepts the prompt file.
- 2026-09-17: two read agents with `WEB_SEARCH: live` exited 2 before the turn, and both ran after the
  line became `cached` (`plugins/entrust/research/2026-09-17-orchestration-practices/rounds.md`, the Planning row).
- 2026-09-25: the owner answered a proposal of two review agents with «ходить в сеть можно», the network
  is allowed. The coordinator wrote `WEB_SEARCH: live` into both prompt files; `--new` printed `PROMPT=…`
  and exited 0 for each, and each `--run` ended with `DRIVER_EXIT=2` and
  `ERROR=--web-search live is not permitted by this device's managed policy, which allows cached; the server would silently apply one of those and no response field would say so`,
  15 s and one spawned agent each, no Codex turn. The coordinator relaunched both with
  `WEB_SEARCH: cached`, the provider's cache, which nobody had asked for. The owner: «Была четкая
  установка. Сеть разрешена», «Не кеш, а сеть». The network they allowed needed no line at all.

**Issue text.** A user who allows the network means the agent's own commands — `curl`, `git`, `npm` —
which reach it at every level with no header line. The `WEB_SEARCH:` row describes itself only as "the
agent needs sources it cannot read locally", so a coordinator reads "the network is allowed" as
`WEB_SEARCH:` and picks a mode. On a device whose managed policy narrows the modes, the mode is refused at
`--run`, after `--new` accepted it and an agent was spawned; the refusal names the allowed modes, and the
coordinator swaps in one of them, a channel the user did not allow. It happened on 2026-09-17 and again on
2026-09-25, the second time after this entry had proposed naming `cached` as the value that runs
everywhere. The row should say that `WEB_SEARCH:` is the provider's search tool, not the network; that
network access needs no line; and that the field is set only when the user asks for the provider's search.
A mode the device refuses goes back to the user as a question, never to another mode. `--new` should check
the mode against the device policy, so that the refusal comes before an agent is spawned, and the refusal
should say that the network is unaffected.

## E2. `orchestrate.test.mjs` pins none of the rules 0.15.0 added, and F2's "six bullets" is eight on the page

**Evidence, level 3.** On 2026-09-17, against `7e7d9cc`, deleting from the page in memory the bulk-unit
sentence (O L70), "Critique the split" (O L118), "open one return whole" (O L121) and "Prefer Luna" with
"announce its count" (O L68–69), singly and all five together, left all 45 registered cases of
`plugins/entrust/evals/orchestrate.test.mjs` green
(`plugins/entrust/research/2026-09-17-orchestration-practices/d1-design-v2.md`, §8, `mutation-baseline`); commit
`df8942a` (0.15.0) changed that suite only at its budget number. The case named "F2 the six verification
bullets, one line each" lists six regexes where the page's list has eight bullets (nine after the
2026-09-17 change; F2 pins six, F7 one, the two 0.15.0 bullets none).

**Issue text.** Three rules the 0.15.0 changelog names as that round's result and the Luna-over-Haiku
sentence have no pin, so an edit that drops any of them leaves the suite green. F2 should pin every
bullet of the verification list and say how many there are, and each unpinned sentence should get a
case. The 2026-09-17 change added pins only for its own sentences and the bullets it rewrote.

## E39. `advisor`, `experiment` and `swarm` start by loading `orchestrate` through the Skill tool, which refuses a skill marked `disable-model-invocation`

**Evidence, level 3 for `advisor`, level 1 for the other two.**

- `plugins/entrust/skills/advisor/SKILL.md:13` (at `75ba5e9`; now `plugins/entrust/plugin/skills/advisor/SKILL.md`) begins "Load [orchestrate](../orchestrate/SKILL.md) now
  (Skill tool, `entrust:orchestrate`; …)"; `experiment/SKILL.md:13` and `swarm/SKILL.md:13` begin the same way.
- `plugins/entrust/plugin/skills/orchestrate/SKILL.md:6` is `disable-model-invocation: true`.
- 2026-09-25: the owner invoked `/entrust:advisor`; the coordinator's Skill call for `entrust:orchestrate` returned
  "Skill entrust:orchestrate cannot be used with Skill tool due to disable-model-invocation. Ask the user to run
  /entrust:orchestrate themselves — it cannot be invoked via the Skill tool. Do not replicate this skill's workflow
  by other means — it is reserved for explicit user invocation." The advisor did not start.

**Check.** `grep -n 'disable-model-invocation' /Users/ruliny/Git/agent-skills/plugins/entrust/plugin/skills/orchestrate/SKILL.md; grep -n 'Skill tool, `entrust:orchestrate`' /Users/ruliny/Git/agent-skills/plugins/entrust/plugin/skills/*/SKILL.md`
prints line 6 of `orchestrate` and line 13 of `advisor`, `experiment` and `swarm`.

**Issue text.** Three user-invoked skills open by telling the model to load `orchestrate` with the Skill tool, and
`orchestrate` is marked `disable-model-invocation`, so the load is refused and none of the three starts as written.
The owner's direction for `advisor` (2026-09-25): «В целом advisor не считаю, что должен тянуть orchestrate» — the
advisor adds one thread of the other model family to whatever run it is invoked in and loads only `codex`, which the
Skill tool accepts. For `experiment` and `swarm` the page either asks the user to run `/entrust:orchestrate` first or
stops depending on it.

## E43. An `agent-run` case fails on CI: SIGTERM to the waiting `--run` finds a driver that already finished

**Evidence, level 3 for the failure, level 2 for the cause.**

- `plugins/entrust/evals/agent-run.test.mjs:290` (at `01d1158`), "--run refuses a directory that ran for another
  report path, … and forwards SIGTERM to a driver it only waits for", sends SIGTERM to the second, waiting call at
  `:320` and requires `DRIVER_EXIT=1` in both outputs at `:322`.
- CI on main failed on this case alone, "1/15 failed", with the lines `["DRIVER_EXIT=0","DRIVER_EXIT=0"]`: run
  35277743392 (9a539d3, macOS, Node 22), 35319899766 (8983268, Ubuntu, Node 24), 36249088680 (0f05244, Ubuntu,
  Node 22); it also failed CI on PR #12 and PR #14. Three OS and Node pairs, one line.
- Exit 0 in both outputs says the fake turn completed before the signal landed; nothing in the case holds the turn
  open until the signal is sent (level 2).

**Check.** `gh run view 36249088680 --repo Nowely/agent-skills --log-failed | grep -A1 'FAIL  --run refuses'`
prints the failure with `["DRIVER_EXIT=0","DRIVER_EXIT=0"]`.

**Issue text.** The `agent-run` case that forwards SIGTERM to a driver the second `--run` only waits for fails on
CI about one run in three, on macOS and Linux and on Node 22 and 24, always the same way: both calls print
`DRIVER_EXIT=0`, so the turn had completed before the signal arrived. A red main has become ordinary, which hides a
real failure among these. The case should hold the fake turn open until the signal is sent, or wait for a state
that proves the driver is still in its turn, before it sends SIGTERM.

## E44. Two `lock` cases fail on CI now and then, and the lock concurrency failure was never diagnosed

**Evidence, level 3 for the failures; no cause established.**

- `plugins/entrust/evals/lock.test.mjs:142` (at `01d1158`), "a run releases only the lock it owns", failed CI run
  34710644138 (3960788, macOS, Node 22) with "releaseLock removed or changed the peer's replacement lock".
- `lock.test.mjs:352`, "two concurrent runs: exactly one wins", failed CI run 35320724153 (8c041b7, Ubuntu,
  Node 24) with "expected one 0 and one 10, got [0,0]", 1/58 failed.
- Commit `fc20cf5` already recorded a lock case as "not diagnosed" after a red CI.

**Check.** `gh run view 35320724153 --repo Nowely/agent-skills --log-failed | grep 'FAIL '` prints the concurrency
failure; `gh run view 34710644138 --repo Nowely/agent-skills --log-failed | grep 'FAIL '` prints the release one.

**Issue text.** Two lock cases fail on CI from time to time: two concurrent runs both won the lock (`[0,0]` where one
0 and one 10 are required), and a run's release removed a peer's replacement lock. Either is a real double run or a
race in the case itself, and nothing so far says which. Until it is diagnosed, a red main cannot be read, and a
release rule that waits for a green one would stop about every second release.

## E45. At the tool's ten-minute ceiling the `codex-agent` wrapper handed back the harness notice instead of rerunning, and its exit killed the driver

**Evidence, level 3 for the wrapper's steps, level 2 for the kill.**

- `plugins/entrust/agents/codex-agent.md:13-15` (at `01d1158`; now `plugins/entrust/plugin/agents/codex-agent.md`): with no `REPORT=` line, "run the very same command
  again at once … Do not open, tail or wait on the output file".
- 2026-09-26, session `97a19b68`, agent D1 (Astra), wrapper transcript
  `~/.claude/projects/-Users-ruliny-Git-agent-skills/97a19b68-24e5-4b0a-ae89-8670eef7d23a/subagents/agent-a299e6bb74c8b457c.jsonl`:
  at 15:38:35Z the Bash result was "Command did not complete within its 600s timeout and was moved to the
  background"; the wrapper wrote "I'm waiting for the background task to complete", ran `cat` on the output file,
  and at 15:38:58Z called SubagentHandback with the notice as its lines. It never reran the command.
- The launcher forwards SIGTERM to its driver (`plugins/entrust/plugin/skills/codex/scripts/agent-run.mjs:145`). The
  driver's stderr ends "interrupted by SIGTERM"; `out.json` was written at 15:39:01Z and the `exit` marker at
  15:39:02Z, seconds after the wrapper ended. The report: exit 1, `turnStatus: interrupted`, no answer,
  1,824,779 tokens spent.

**Check.** `jq -r 'select(.type=="assistant") | .message.content[]? | select(.type=="tool_use") | .name' <that
transcript>` prints `Bash`, `Bash`, `SubagentHandback`: one run of the command, one `cat`, the hand-back.

**Issue text.** The wrapper's rerun at the ceiling is an instruction to a small model, and on 2026-09-26 the model
did not follow it: it narrated, read the output file, and handed back the "moved to the background" notice with no
`REPORT=` line. Ending its turn ended the backgrounded launcher, whose SIGTERM reached the driver, so a ten-minute
Astra turn was lost with its tokens. Measured on 2026-09-17 the same step held three runs of three; it is not
reliable. A turn that reaches the ceiling should survive the wrapper that started it, or the rerun should not
depend on the model's compliance.

## E46. A Codex agent picks its own output cap when it reads a file, and no page tells the coordinator to set one, so a read can return a fragment

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

## E47. A read agent's report of what it read is taken on trust; its own rollout can contradict it and nothing compares them

**Evidence, level 3.**

- The same gpt-6-sol agent as in E46 answered "95 pages opened by separate cat commands with max_output_tokens:
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

## E48. A Claude agent starts with the owner's global and project CLAUDE.md and memory index loaded, which `orchestrate` never mentions when it assigns blind or independent roles

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
