# Inventory: the three drivers side by side

At `8b518fc` (entrust 0.27.0). Counts come from `measure.mjs`, run on 2026-10-08; a
keyword count is a proxy for attention, not a classification of each line.

## Size

| File | Lines | Comment lines | Code lines | Comment share |
| --- | ---: | ---: | ---: | ---: |
| `codex/scripts/driver.mjs` | 4,928 | 1,569 | 3,178 | 33% |
| `opencode/scripts/driver.mjs` | 1,314 | 63 | 1,147 | 5% |
| `opencode/scripts/{contract,client,v2-client,local-server,config,launch}.mjs` | 745 | 39 | 676 | 5% |
| `claude/scripts/driver.mjs` | 426 | 33 | 359 | 8% |
| `claude/scripts/{approvals,launch}.mjs` | 179 | 22 | 136 | 14% |
| `orchestrate/scripts/agent-run.mjs` (the launcher) | 941 | 199 | 710 | 22% |
| `orchestrate/scripts/drivers.mjs` (shared driver facts) | 158 | 20 | 122 | 14% |
| `orchestrate/scripts/temp-dir.mjs` | 198 | 6 | 177 | 3% |
| `agents/proxy.md` | 26 | | | |

A comment line is one that starts with `//` or sits in a `/* */` block; a line with code and a trailing
comment counts as code. Lines of the Codex driver's comments alone (1,569) are more than the whole OpenCode driver
(1,314) and nearly four Claude drivers.

### The Codex driver by area

Each top-level declaration's span, to the next one, summed by an area its name places it in (268
declarations; 12% unplaced, mostly small helpers of the lock, the reclaim marker and the protocol).

| Area | Lines | Share |
| --- | ---: | ---: |
| report, evidence, answer, schema | 647 | 13% |
| protocol and transport | 509 | 10% |
| rights, sandbox, isolated home, inherited config | 495 | 10% |
| arguments, prompt file, fields | 430 | 9% |
| help and usage text (`HELP` alone is 381) | 428 | 9% |
| worktree, its ledger and disposal | 417 | 8% |
| write lock and its reclaim | 347 | 7% |
| approvals and mailbox | 332 | 7% |
| entry (`main`, `setup`) | 327 | 7% |
| timing and stopping | 155 | 3% |
| `--verify` gate | 118 | 2% |
| model and standing instructions | 111 | 2% |
| unplaced | 571 | 12% |

Rights, worktree, lock and approvals together: 1,591 lines, a third of the driver. Its largest declarations:
`HELP` 381, `writeReport` 176, `handleMessage` 157, `main` 133, `setup` 132, `disposeWorktree` 128, `parseArgs`
123, `handleServerRequest` 101, `LIMITS` 94, `checkRoot` 89.

### Lines touching rights and approvals

Lines matching a rights pattern (`RIGHTS`, `writable`, `sandbox`, `level`, `grant`, `root`, `worktree`,
`scope`, `widen`, deny rules, permission mode, safe mode) or an approvals pattern (`approv*`, `mailbox`,
`decision`, `settle*`, `escalat*`, `pending`, `decide`, request ids, typed requests, `interaction`).

| File | Rights, code | Rights, comments | Approvals, code | Approvals, comments |
| --- | ---: | ---: | ---: | ---: |
| Codex driver | 180 (6%) | 180 (11%) | 166 (5%) | 94 (6%) |
| OpenCode driver | 38 (3%) | 5 (8%) | 72 (6%) | 5 (8%) |
| Claude driver | 42 (12%) | 4 (12%) | 22 (6%) | 5 (15%) |
| Claude approval server | 3 (3%) | 0 | 21 (20%) | 6 (43%) |
| launcher | 10 (1%) | 2 (1%) | 103 (15%) | 48 (24%) |
| `drivers.mjs` | 31 (25%) | 9 (45%) | 5 (4%) | 3 (15%) |

## What a prompt can say

| Field | Codex | OpenCode | Claude |
| --- | --- | --- | --- |
| `RIGHTS:` first | `read [dir]`, `write <dir>`, `worktree <repo>`; absent: read in cwd, or the plan row's | same grammar; absent: the plan row's, else refused | same; absent: the plan row's, else refused |
| `MODEL:` | `astra`/`sol`/`terra`/`luna`, newest of that name, or a slug | `provider/model` or `inherit` | `opus`/`sonnet`/`haiku`/`fable` or a `claude-…` id |
| `EFFORT:` | yes, checked against the catalogue | yes, alias of `VARIANT:` | yes |
| `RESUME:` | a thread id or `last` | a session id, an absolute report path or `last` | an absolute report path |
| `OUTPUT_SCHEMA:` | strict schema, checked by the driver | schema subset, checked by the driver | any schema, checked by Claude Code |
| `EXPECT:` | regex a successful command must match | same | — |
| `VERIFY:` | refused in a prompt file | — | — |
| `ALLOW_NO_COMMANDS:`, `BRIEF:` | yes | yes | — |
| `NETWORK:`, `WEB_SEARCH:` | yes | refused for the capability | — |
| `WRITABLE:` | extra roots | — | — |
| `API_FAMILY:`, `AGENT:`, `VARIANT:` | — | yes | — |
| `SAFE_MODE:` | — | — | yes |
| command-line only | `TIMEOUT`, `IDLE_TIMEOUT`, `MAX_COMMANDS`, `REPORT_FILE`, `APPROVAL_DIR` named and refused as fields | | |

## How a right is enforced

| | Codex | OpenCode | Claude |
| --- | --- | --- | --- |
| read | the app-server's read-only permission profile, extended to `$TMPDIR` | session permission rules: read/list/glob/grep allow, bash ask, edit/write deny | `--permission-mode manual`, tools Read/Grep/Glob/Bash, Edit deny rules on the mailboxes |
| write | `workspace-write` with the cwd root, `--writable` and `$TMPDIR` | edit/write ask inside the root | `acceptEdits` in the directory |
| worktree | own ledgered tree under the project's `.claude/worktrees` | shared `makeWorktree` under `<state>/worktrees` | shared `makeWorktree` under `<state>/worktrees` |
| guards beside it | `checkRoot` refusals, `assertReadSandbox`/`assertWriteSandbox`, an isolated `CODEX_HOME`, inherited config filtered, a write lock per directory with reclaim | the plan's pins, the state directory kept out | the plan's pins, a write root may not overlap the state directory |

## Approvals

All three publish requests into the same mailbox (`<id>.request.json`, `pending`, `<id>.decision.json` by
link(2)), read by the launcher's `--pending` and settled by `--decide`. Codex answers the app-server's
`requestApproval` server requests; OpenCode polls the server's permission and question lists; Claude runs a
stdio MCP server (`approvals.mjs`) that Claude Code calls as its permission prompt tool. Typed requests:
OpenCode's questions, Claude's `claude.permission`; everything else is a command request.

## Exit codes

One table, `orchestrate/scripts/drivers.mjs` `EXIT`: 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 13. Codex uses all
of them through its ladder; OpenCode and Claude use the subset their features have (no 5, 9, 12 in Claude).

## The report

A Codex report on the fake app server carried 69 top-level fields (3.4 KB); a Claude report on the fake CLI 42
(2.0 KB); OpenCode's builder names about 40 top-level fields. Fourteen are in all three: `ok`, `exitCode`, `cwd`,
`model`, `turnStatus`, `turnError`, `threadId`, `fileChanges`, `escalations`, `approvalsAutoAccepted`, `receiptOk`,
`answer`, `answerPath`, `commands`. Nineteen are shared by OpenCode and Claude and missing from Codex, among
them `adapter`, `error`, `answerJson`, `sessionID`, `requestedModel`, `usage`, `cost`, `partial`, `rights`,
`resume`, `transcriptPath`. 52 of Codex's are its own (`commandsSucceeded`, `commandsDeclined`, `receiptWhy`,
`codexHome`, `configInherited`, `cut`, `timing`, `answerPhase`, `commentaryOnly`, …).

## The call, as a coordinator makes it

| Host | Steps |
| --- | --- |
| Claude Code | read the adapter's page; Bash `agent-run.mjs --new --report-file R <<PROMPT`; on `PROMPT=`, an Agent call of type `entrust:proxy` whose message is the four steps of codex's [one call](../../plugin/skills/codex/SKILL.md#one-call) with that adapter's `agent-run.mjs --run --report-file R`; on a request, `--pending` and `--decide`; continue with a second prompt carrying `RESUME:` under a fresh report |
| Codex, OpenCode | the same `--new`, then a native subagent briefed with orchestrate's [operational proxy](../../plugin/skills/orchestrate/references/proxy.md), which runs `--run --watch`, decides covered requests itself and sends the rest to the coordinator |

The four steps the Claude Code coordinator pastes into the Agent message are also the body of
`agents/proxy.md`, which the same Agent call loads as the subagent's system prompt.

## Pages a coordinator reads

| Page | Lines |
| --- | ---: |
| `codex/SKILL.md` | 262 |
| `codex/references/` (11 files) | 1,624 |
| `opencode/SKILL.md` | 118 |
| `opencode/references/` (4 files) | 404 |
| `claude/SKILL.md` and `references/external.md` | 148 |
| `orchestrate/SKILL.md` | 171 |
| `orchestrate/references/{proxy,main-proxy,approvals,plan}.md` | 250 |

`node measure.mjs` beside this file prints the size, keyword and area tables; the report fields came from one
run of each driver on the suites' fakes (`evals/fake-app-server.mjs`, `evals/fake-claude.mjs`) and from
OpenCode's `buildReport`.
