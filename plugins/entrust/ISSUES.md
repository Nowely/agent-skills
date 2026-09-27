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

## E46. The driver's refusal-shape comment points at `schema-<version>/*ApprovalResponse.json`, files the pinned tree does not hold

**Evidence, level 1.**

- `plugins/entrust/plugin/skills/codex/scripts/driver.mjs:2726` (at `b3872b4`): "Refusal shapes differ per method;
  they are taken from the pinned schema-<version>/*ApprovalResponse.json."
- `plugins/entrust/schema-0.153.4/` holds `ServerRequest.json`, `ServerNotification.json`, `JSONRPCError.json`,
  `v1/InitializeResponse.json` and nine `v2/*Response.json`, none of them an approval response.
- The enum the comment means is pinned inside `ServerRequest.json`: `CommandExecutionApprovalDecision` at
  `:266-343`, with `decline` at `:332`. `codex app-server generate-json-schema` on 0.155.1 writes ten separate
  `*Approval*.json` files, which is the layout the comment describes and the tree never had.

**Check.** `find plugins/entrust/schema-0.153.4 -iname '*Approval*'` prints nothing;
`grep -n '"decline"' plugins/entrust/schema-0.153.4/ServerRequest.json` prints 332.

**Issue text.** The comment that justifies the driver's five refusal shapes names files that are not in the tree, so
a reader who follows the pointer finds nothing and cannot tell whether the shapes were checked against the pin.
The enums are in `ServerRequest.json`; the comment should say so, or the generator's per-method files should be
pinned beside it.

## E47. The server's `availableDecisions` never offers `decline`, the shape every refusal of this driver sends

**Evidence, level 3 for the list and for the refusal being honoured today, level 1 for the schema.**

- 2026-09-27, Opus P1's probe on codex 0.155.1
  (`plugins/entrust/research/2026-09-27-approval-channel/01-probe.md`, transcripts under `01-probe/`): five
  `item/commandExecution/requestApproval` requests each carried `availableDecisions: ["accept",
  {acceptWithExecpolicyAmendment: …}, "cancel"]` and never `decline`; the field is absent from the generated
  0.155.1 `CommandExecutionRequestApprovalParams.json`.
- `driver.mjs:2729-2730` answers both `item/*` methods with `{ decision: "decline" }`; the 27 reports with exit 6 on
  this machine (`00-escalations.md` in the same run) each went on to `turnStatus: completed` after it, so the server
  honours it.
- A JSON-RPC error in place of a decision is honoured as a rejection too, but the model reads
  `exec_command failed: … Rejected("approval request failed")` and the item completes `status: "failed",
  exitCode: null` (P1, Q3 error), which the classifier counts under `commandsFailed` (`:3318`, `:3336`).

**Check.** `grep -o 'availableDecisions[^]]*]' plugins/entrust/research/2026-09-27-approval-channel/01-probe/transcript-q12.jsonl | head -1`
prints the list without `decline`.

**Issue text.** The refusal the driver sends is not among the decisions the server advertises for the request. It is
honoured on 0.153.4 and 0.155.1, but nothing promises it: a server that enforced its own list would turn every
refusal into an error the model reads as a broken tool while the report counts a failed command, and the offline
fixture, which accepts any decision, would stay green. Record the fact where the refusal shapes are chosen, make the
fixture carry the server's list, and let the live fidelity gate compare the two.

## E48. `escalations` can hold an entry with no declined or failed command beside it, because a sandboxed attempt can emit no item notifications

**Evidence, level 3 for the gap (seen once), level 2 for the consequence.**

- P1's 180 s hold thread (`plugins/entrust/research/2026-09-27-approval-channel/01-probe/transcript-q3a.jsonl`, and
  the rollout it names): the rollout shows the sandboxed first attempt run and fail (`exec_command`, exit 1,
  `Operation not permitted`), while the transcript's only `commandExecution` item is the escalated one, `item/started`
  at line 58, the request at line 60, `item/completed` with `status: "completed"` at line 70 after the accept.
- `driver.mjs:3318` and `:3336` count `commandsFailed` and `commandsDeclined` from `item/completed`; the help at
  `:427-432` says `commandsDeclined` and `escalations` "can differ" and names one cause, a refused request with no
  command, not this one.

**Check.** `grep -n -o 'item/started\|requestApproval\|"type\\":\\"commandExecution\\"' <that transcript> | head` shows no
`commandExecution` item before the request.

**Issue text.** A report can show one escalation beside zero declined and zero failed commands, because the sandboxed
attempt that raised the request produced no item at all. The help's "can differ" covers it by accident; the report's
reader has no way to tell this case from a request raised with no attempt. Name the cause in the help, and let the
entry carry what the request itself says about the command, since the item may never come.

## E49. A writable root between the home and the state directory grants the plugin's data directory, locks and answer log included

**Evidence, level 1 for the walk's direction, level 2 for the consequence.**

- `plugins/entrust/plugin/skills/codex/scripts/driver.mjs:900-936` (at `b3872b4`): `checkRoot` refuses the passwd home
  and every ancestor of it, an exact `$HOME`, and any candidate whose ancestor walk reaches `~/.codex` or the state
  directory by inode. A candidate that *contains* the state directory without being the home or above it, `~/.claude`
  on a plugin install, hits none of the three walks.
- `plugins/entrust/plugin/skills/codex/references/environment-and-internals.md:72-74` names `~/.claude` a legitimate
  root, and the state directory on a plugin install is `~/.claude/plugins/data/entrust-nowely` (orchestrate page, the
  run directory paragraph).
- Found by Fable D1 while designing the approval channel (`plugins/entrust/research/2026-09-27-approval-channel/02-design-v3.md`,
  "Found in passing"), independent of that channel.

**Check.** Read the three loops at `driver.mjs:902-936`: the first walks the home's ancestors, the second is an exact
`$HOME` match, the third walks the candidate's ancestors against the protected inodes; none walks the candidate's
descendants. A `lock.test.mjs` case that grants `--writable <parent of the state directory>` and writes a lock file
from inside the sandbox would make it level 3.

**Issue text.** `--writable ~/.claude` (or any root between the home and the state directory) is accepted, and the
sandbox it produces can write the driver's locks, answer log, isolated home and every agent's report directory,
which the same guard refuses when named directly. The guard should refuse a root that is, or is an ancestor of, a
protected root, as it already refuses an ancestor of the home.

## E50. "Nothing left running" after `SIGTERM` is not established for a command executing at the signal

**Evidence, level 3 for the process groups, level 1 for the kill, level 2 for the consequence.**

- `plugins/entrust/plugin/skills/codex/SKILL.md:93` (at `b3872b4`): a `SIGTERM` to the driver's pid "cuts the turn,
  sweeps its codex and publishes the report … nothing left running".
- `driver.mjs:2400-2403`: `killGroup` signals `-child.pid`, the app-server's own process group, and `groupAlive`
  asks the same group.
- 2026-09-27, Opus P1's probe on codex 0.155.1 (`plugins/entrust/research/2026-09-27-approval-channel/01-probe.md`,
  Q2): each command the server runs shows "directly under the app-server pid, each in its own process group, with no
  sandbox-exec or codex wrapper". Whether the server ends those groups on its own exit or abort was not measured.

**Check.** `grep -n 'process.kill(-' plugins/entrust/plugin/skills/codex/scripts/driver.mjs` prints the two calls on
`child.pid` alone; the probe's process-list observation is at the line the entry cites.

**Issue text.** The teardown signals and polls the app-server's process group, while the commands the server runs
live in groups of their own. Whether they die with the server is unmeasured, so the page's promise is a guess for
any command still executing at the signal, a long test run first of all. Measure it (a `sleep` run through a live
turn, then `SIGTERM`, then `pgrep`), and either sweep the children or narrow the sentence.
