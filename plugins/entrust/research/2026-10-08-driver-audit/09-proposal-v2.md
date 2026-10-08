# Proposal v2: one call shape, the defects closed, the weight where the backend differs

[07-proposal.md](07-proposal.md) after the round-1 critique, [08-critique-c1.md](08-critique-c1.md). What changed is
listed at the end, by critique finding. Sizes are the auditors' estimates, overlaps counted once.

## The rule behind it

A coordinator calls every external agent the same way. What differs is only what the backend really differs in,
and that is stated once, on the shared page. A mechanism stays when it defends a path that can still happen and
costs less than the harm. A feature stays when the one call can reach it or the suites need it.

## Step 1. Close the defects (no decision needed)

| Change | Closes | Size |
| --- | --- | --- |
| **`checkWriteRoots`** in `drivers.mjs`, called by all three drivers at `--check-prompt-file` and at launch. A write root may not be `$HOME` or an ancestor of it, and may not be, contain or lie inside the state directory or one of the adapter's protected directories, compared by dev:ino; a run's own `<state>/worktrees/<name>` is exempt. Protected: Codex `~/.codex`; Claude `~/.claude`; OpenCode `~/.config/opencode`, `~/.local/share/opencode`. Codex's `checkRoot` keeps only what is its own | X1, and Codex's check-time half (c1 13) | +45 shared, −40 Codex |
| **OpenCode deny rules** after the allows (the last match wins): `<root>/.git`, `<root>/**/.git/**`, `<root>/.opencode/**`, `<root>/opencode.json` | an OpenCode agent rewriting a gitlink, hooks or its own config (c1 8) | ~5 |
| **The shared `git()`** carries `GIT_SAFE`, its diff `GIT_DIFF_SAFE`, and names the worktree's recorded gitdir and work tree instead of following the tree's `.git` file | X10, the gitlink redirect (c1 8, 12) | ~10 |
| **`WRITABLE:` refused under a registered plan** unless the row's writes name that root | X2 | ~5 |
| **Record the settlement, then answer,** in Claude's approval server and OpenCode's driver; decline when the record cannot be written. The cases written for it are the acceptance cases of step 4's mailbox module | X3 | ~10 |
| **`--new` records its working directory and its resolved state directory** in `backend.json`; `--run` starts the keeper and the driver in that directory with that `ENTRUST_STATE_DIR` | X4, its environment twin, X5 within one launch (c1 1, 14) | ~10 |
| **A continuation keeps its rights:** a `RIGHTS:` line on a resume is absent or equal to the session's; OpenCode reads its session's rules back on a resume and refuses a mismatch | N1 (c1 2): a write session resumed as read keeps its write rules on the server today | ~10 |
| **OpenCode `RESUME: last` refused** | X6 | 1 |
| **OpenCode:** claim the report before any refusal; a running report's resume exits 10 | X12, X14 | ~6 |
| **The isolated Codex home carries `model_provider` and `model_providers`** | X11 | 2 |
| **Pages:** the instructions the one call cannot carry out, the wrong `<skill-dir>` in `main-proxy.md`, the stale comments and `ISSUES.md` addresses, the host named as Claude Code; the swarm page says an unattended OpenCode worker cannot run commands | X15, X17, X7's exit-7 half (c1 7) | text |
| **`v2-pilot.md` out of the plugin payload,** into `research/` with the endpoint and private paths removed | X18 for the payload; the history is the owner's call (decision 8) | −215 page |

X5 across sessions (two coordinators whose `TMPDIR` differ) is decision 2. X13, OpenCode's idle cut of a busy
session, waits for step 2's budget, since counting busy as progress is safe only beside a volume bound (c1 3).

## Step 2. One call shape

| Change | Gain | Risk |
| --- | --- | --- |
| **One page,** `orchestrate/references/external.md`, about 900 words: the prompt core, `--new`, the Agent call or the operational proxy, the status lines, deciding, continuing, stopping, the budget, the report core, and **what still differs per adapter** (below). Adapter pages keep models and efforts, extra fields, composition rules and their report remainder | a Codex call reads about 3,700 words instead of 5,800; Claude and OpenCode calls stop needing the Codex page | the page pins move; the live orchestrate gate runs again |
| **`--new` takes the adapter from the plan row;** `--adapter` only without a plan; one launcher path on every page; the entry scripts stay as aliases | under a plan no command names an adapter | low |
| **The relay's message stays a constant block,** on the shared page, and a test compares it with the body of `agents/proxy.md` | one copy of the steps (X16) without a second turn per launch or a description placeholder (c1 11) | none |
| **One prompt core:** `RIGHTS` first, left out only under a plan; `MODEL`, `EFFORT`, `OUTPUT_SCHEMA` (the five-field schema the default everywhere), `RESUME`, `TASK:` and the body; `yes`, `true` and `1` everywhere | one template | a Codex agent outside orchestrate returns five fields instead of prose |
| **`RESUME: <absolute report path>` in all three;** Codex reads `threadId` from the report and checks it offline (X8); a continuation keeps its directory and its rights (step 1), so Codex gives up its per-call widening | one continuation from `REPORT=` (X8, X9) | a coordinator that widened a Codex resume launches a fresh agent instead |
| **One evidence rule:** a turn that observed nothing fails, exit 5, unless `ALLOW_NO_COMMANDS: yes`; an observation is a command or a read tool. Codex counts commands as now; OpenCode counts bash and its read, grep and glob tools; Claude gains the gate from its tool events | X7's exit-5 half; Codex's attribution keeps a consumer (c1 6) | Claude agents that answer from nothing start failing, which is the point |
| **One budget, three parts, stated once:** an idle bound that pauses while a request waits; a volume bound in every adapter (Codex's 1,000 commands as now; Claude `--max-turns` or a tool-call count; OpenCode tool parts); a wall-clock backstop that pauses during approval waits. Today's numbers stay until a replacement is measured; then OpenCode counts a busy session as progress (X13) | no agent unbounded, and an approval wait no longer eats the clock (c1 3) | the backstop's size needs one measurement |
| **One report core** of about 14 fields under the same names; Codex adds `adapter`, `error`, `rights`, `requestedModel`, and `usage` beside `tokenUsage`, which prepare-feedback reads | one "reading the result" paragraph (c1 15) | additive |
| **One Agent description:** `<Vendor> <Model> <id>: <task in a few words>` | every card alike | none |

What still differs per adapter, on the shared page (c1 10): the models and efforts; the extra fields; what a read
agent does unasked (Codex any command in its sandbox, network included; OpenCode only read tools, every command
asks; Claude its read-only set plus the user's allow rules); the request kinds (command; `opencode.permission`,
`opencode.question` answered with `--answer`; `claude.permission`; a Codex file change, decline only); the
worktree (a ledgered tree under the project for Codex, `<state>/worktrees` with an inline diff for the others);
the gates (`EXPECT:` in Codex and OpenCode); the exit codes each can return; egress; the write lock (Codex only).

## Step 3. Cut the water and the unreachable

Decide decision 2 first: the lock's comments are cut only if the lock stays (c1 18).

| Change | Size | Confidence |
| --- | ---: | --- |
| Codex comments: each reason once, history and measurements to `incidents.md` | −570 | high on the share |
| Codex `HELP` to about 70 lines rendered from `FIELDS` and `LADDER`, the rest to `environment-and-internals.md` | −335 (−265 net) | high |
| Report fields with no reader, filtered against the step-2 core (`cwd`, `resumedFrom`, `worktreeRepo`, `worktreeBase` stay) | Codex −70, OpenCode −40 | high |
| OpenCode: dead state, the `runtime.json` sidecar, `correction` published (one line); steering to one sentence; `parity.md` and `interactions.md` to what a decision needs | −40 code, −60 page | high |
| Launcher `--help`: the coordinator's part, the rest under `--help-all`; each call fact told once | −40 help, about −1,000 words | high |
| Driver features no caller reaches: Codex `--verify` and its two exit codes, the wrap-up steer, `--answer-json`; OpenCode `--verify`. `--timeout`, `--idle-timeout` and `--max-commands` stay as driver flags: the suites bound themselves with them and the defaults are the budget. `--host-home` is decision 6 | about −200; the eval rework is sized with it (`--verify` appears 52 times in 5 suites) | high that they are unreachable |
| Codex web-search policy reader, worktree reconciliation, duplicate and stale approval counters | −135 | medium |

## Step 4. Rights: one model for three adapters

| Change | Size | Risk |
| --- | --- | --- |
| **One mailbox module** in orchestrate: offer, poll, record-then-answer, the deadline, the `pending` rewrite; each adapter supplies how to answer its CLI (OpenCode keeps its session-wide reject). One approvals section on the shared page, which the operational proxy links in place of three adapter pages | −150 code, −80 page | a security path; step 1's cases go first |
| **Drop the Codex mailbox owner claim;** the launcher's one-launch-per-directory claim holds for every supported caller; its 10 eval references move | −45 | none for supported callers |
| **What the rights do not cover:** Codex keeps declining out-of-root file changes (its request carries no body a coordinator could accept); OpenCode and Claude offer them with the whole call as the typed body; all three decline at once a target inside the state directory or a protected directory | 0 to +10 | none (c1 5) |
| **Each driver checks the effect its CLI reports:** Claude the permission mode and tools from `init`; OpenCode its session rules read back, on a resume too; Codex one table comparison in place of two functions | ~+20 | none |
| **Overlapping writers refused at plan time:** `--plan` and `--new` refuse two write rows whose roots overlap, by dev:ino, for all three adapters; the Codex lock stays for runs with no plan | +20 | none (c1 9) |

## Step 5. Measurements that spend tokens, each on the owner's word

| Measurement | Settles | Cost |
| --- | --- | --- |
| The relay with its steps only in `agents/proxy.md`, about six Haiku runs | whether the pasted message can go | cents |
| OpenCode V1 refuses an edit in a read session | whether V1's session rules, all its enforcement, hold live | one short run |
| OpenCode bash patterns allowing a read-only set (`git diff*`, `rg *`), redirects included | X7's exit-7 half | one short run |
| A network-denied Codex command: does it raise a request? | decision 1's premise | one Codex run |
| `auto=` on macOS under 0.26 or later | whether the Codex file-change auto-accept still fires | one Codex write run |
| Claude Code under `acceptEdits`: are `.git` and `.claude` protected; the Bash sandbox under an external agent | the Claude half of c1 8, an OS layer for Claude agents | one short run |
| A wall-clock backstop that pauses during approval waits, in hours | the budget's third part | none extra; from live runs |
| Stop on a background Bash `--run` in Claude Code (E102) | whether a relay-less route exists | one run |

## Decisions for the owner

1. **Egress.** A Codex read agent may read any file and send it out with no request; a Claude read agent may too
   when the user's own allow rules cover `curl` or `gh`; `WEB_SEARCH` sends query text out. Recommended: `NETWORK`
   and `WEB_SEARCH` become rights the plan row pins; whether read agents default to no egress waits for the step-5
   measurement of whether a denied command raises a request. Until then the shared page states the default.
2. **Writers across sessions (X5) and the write lock.** Recommended: say plainly that writers on one tree share a
   state directory (`ENTRUST_STATE_DIR` or `TMPDIR`); refuse overlapping write rows at plan time (step 4); keep
   the Codex lock for runs with no plan. A fixed anchor such as `/tmp` does not work: a coordinator inside a Codex
   sandbox may write `$TMPDIR` only. The shared lock of 05 waits until its cases, with inode containment and
   link(2) publication, pass in CI.
3. **`--verify`.** Recommended: delete it with the other unreachable features. For a write agent it runs code the
   agent wrote, with the user's rights, outside the host's checks; wiring it would change the driver contract and
   differ by adapter.
4. **OpenCode V2.** Recommended: V1 only; V2's client, fake and pilot to `research/` (about −270 code, −290 page,
   −285 test lines).
5. **OpenCode attaching to a remote server.** If not used, local mode only: about −80 lines.
6. **Codex agents and the user's MCP servers.** Isolated, a Codex agent sees none of them, and `--host-home`, the
   only route, is unreachable through the one call. Either the shared page says so, or a field opens the host
   home the way Claude's agents run with the user's configuration by default and `SAFE_MODE: yes` isolates them.
   Recommended: state it, and add the field only when an agent needs a server.
7. **The relay.** Recommended: keep it on Haiku, Bash only, reading no skill; one copy of its steps (step 2); the
   paste dropped only if the step-5 measurement shows the file alone suffices.
8. **The endpoint in git history.** Moving `v2-pilot.md` ends its shipping; removing it from history would rewrite
   published commits.

## Kept on purpose

The restated accept on a fresh delimiter; decision binding by id, run and hash; the plan pins; `--new`'s offline
check before any relay; the keeper and the repeatable `--run`; the Codex write lock for runs with no plan;
Codex's sandbox-effect check, evidence attribution, contracts as data, report publication, worktree harvest and
`--max-commands` default; OpenCode's model receipt, request re-read and admission reconciliation; questions as
typed requests; the isolated Codex home; Claude's wall clock until its replacement is measured.

## In total

| | Now | After steps 1–4 with the recommended decisions |
| --- | ---: | ---: |
| Codex driver | 4,928 | about 3,700 |
| OpenCode adapter code | about 2,160 | about 1,650 |
| Shared code (`drivers.mjs`, the mailbox module) | 158 | about 350 |
| Call-path pages | about 4,800 words | about 900 shared, plus each adapter's remainder |

## What changed from 07, by critique finding

| c1 | Change |
| --- | --- |
| 1 | X5 is no longer claimed closed; its in-launch half moves to step 1, its cross-session half is decision 2 |
| 2 | "A continuation keeps its rights", in place of "declares its rights like any run"; N1 added to step 1 |
| 3 | The budget has a volume bound and a backstop; Codex's `--max-commands` default stays; X13 waits for it |
| 4 | `--verify` deleted, not wired |
| 5 | Codex keeps its out-of-root auto-decline; offering is only where the body can be restated |
| 6 | The evidence rule counts read tools; the gate stays, unified |
| 7 | X7's exit-7 half stays open: swarm page now, a measurement in step 5 |
| 8 | Per-adapter protected lists, OpenCode `.git` deny rules, a gitdir-pinned `git()`; the home rule spelled out |
| 9 | Plan-time overlap refusal and the Codex lock kept; the shared lock deferred to CI-passing cases |
| 10 | The shared page lists what still differs per adapter |
| 11 | The relay's message stays a constant block with a test, not printed by `--new` |
| 12 | `GIT_SAFE` with `GIT_DIFF_SAFE` |
| 13 | `checkWriteRoots` at check time in all three, Codex included |
| 14 | The state directory recorded at `--new` with the working directory |
| 15 | Field cuts filtered against the report core; `tokenUsage` kept beside `usage` |
| 16 | The suites' bounds stay as driver flags; `--host-home` is decision 6 |
| 17 | The egress decision states its two premises and covers `WEB_SEARCH` |
| 18 | Decision 2 before step 3; X3's cases become the mailbox module's; `last` and X5's in-launch half in step 1 |
| 19 | The history is decision 8 |
