# Proposal: one call shape, the defects closed, the weight where the backend differs

From [06-findings.md](06-findings.md). Five steps, each one PR, in this order: each later step is cheaper once
the earlier one has landed, and the first two carry most of the value. Sizes are the auditors' estimates;
overlapping estimates are counted once.

## The rule behind it

A coordinator calls every external agent the same way. What differs is only what the backend really differs
in: its model names and efforts, its extra fields, how it enforces a right, and the remainder of its report.
Everything else lives once, in orchestrate. A mechanism stays when it defends a path that can still happen and
costs less than the harm; a feature stays when the one call can reach it.

## Step 1. Close the defects (small, no decision needed)

| Change | Closes | Size |
| --- | --- | --- |
| `checkWriteRoots(roots, stateDir, protected)` in `drivers.mjs`, called by all three drivers at `--check-prompt-file` and at launch: no write root may be, contain or lie inside the state directory, `$HOME` or an ancestor of it, or an adapter's protected directory (Codex: `~/.codex`); compared by dev:ino; a run's own `<state>/worktrees/<name>` exempt. Codex's `checkRoot` keeps only what is its own | X1 | +40 shared, −40 Codex |
| Under a registered plan, `WRITABLE:` is refused unless the plan row's writes name that root | X2 | +5 |
| Every mailbox writer records the settlement before it answers, and answers decline when it cannot (Claude `approvals.mjs`, OpenCode) | X3 | ~10 |
| `--new` records its resolved working directory in `backend.json`; `--run` starts the keeper and the driver there | X4 | ~6 |
| `GIT_SAFE` in the shared `git()` | X10 | 1 |
| Carry `model_provider` and `model_providers` into the isolated Codex home | X11 | 2 |
| OpenCode: claim the report before any refusal; count a busy owned session as progress; a running report's resume exits 10 | X12, X13, X14 | ~10 |
| The page instructions the one call cannot carry out, the wrong `<skill-dir>`, the stale comments and ledger addresses, the host named as Claude Code | X15, X17 | text |
| `v2-pilot.md` out of the plugin payload (moved to `research/` with the endpoint and paths removed) | X18 | −215 page |

X5 (the state root follows `$TMPDIR`), X6–X9 and X16 are closed by steps 2 and 4.

## Step 2. One call shape (the owner's ask 2)

| Change | Gain | Risk |
| --- | --- | --- |
| **One page,** `orchestrate/references/external.md`, about 900 words: the prompt core, `--new`, the Agent call or the operational proxy, the status lines, deciding, continuing, stopping, the budget, the report core. Adapter pages keep models and efforts, their extra fields, their composition rules and their report remainder; the call steps leave the Codex page | A Codex call reads about 3,700 words instead of 5,800; Claude and OpenCode calls stop needing the Codex page | the page pins in `agent-contract.test.mjs` move; the live orchestrate gate should run again, since this block is what it measures |
| **`--new` takes the adapter from the plan row,** and `--adapter` only without a plan; pages name one launcher path. The three entry scripts stay as aliases | under a plan no command the coordinator writes names an adapter | low |
| **`--new` prints the relay's message, filled in,** between `MESSAGE<<T` and `MESSAGE>>T`; the body of `agents/proxy.md` is the same text, and a test compares them | one copy of the steps (X16); no block to copy and fill by hand | `--new` prints more lines |
| **One prompt core.** `RIGHTS` first, left out only under a plan; `MODEL`, `EFFORT`, `OUTPUT_SCHEMA` (the five-field schema the default everywhere), `RESUME`, `TASK:` and the body. `yes`, `true` and `1` everywhere | one template | a Codex agent launched outside orchestrate returns five fields instead of prose |
| **`RESUME: <absolute report path>` in all three.** Codex reads `threadId` from the report and refuses one that is not a finished Codex run, offline; OpenCode drops `last` and the session-id form; Claude keeps its own. A continuation keeps its directory (Claude's sessions are stored per working directory) and declares its rights like any run, or takes the plan row's | one continuation, straight from `REPORT=` (X6, X8, X9) | a coordinator that typed a thread id writes the report path; Codex keeps accepting a thread id for one release |
| **One budget:** no wall clock by default, an idle bound that pauses while a request waits; stated once | an agent's lifetime no longer depends on its vendor | Claude needs an idle bound in place of its 30-minute wall clock, unmeasured |
| **One report core** of about 14 fields, the same names everywhere; Codex adds `adapter`, `error`, `rights`, `requestedModel`, `usage` | one "reading the result" paragraph | additive |
| **One Agent description:** `<Vendor> <Model> <id>: <task in a few words>` | every card names vendor and model alike | none |

## Step 3. Cut the water and the unreachable

| Change | Size | Confidence |
| --- | ---: | --- |
| Codex comments: each reason once, history and measurements to `incidents.md` | −570 | high on the share |
| Codex `HELP` to about 70 lines rendered from `FIELDS` and `LADDER`; the rest to `environment-and-internals.md` | −335 (−265 net) | high |
| Codex report: drop about 22 fields with no reader (echoes, derived fields, receipt provenance, worktree extras, `unparsedLines`) | −80 | high |
| OpenCode: dead state, unread fields, the `runtime.json` sidecar, the dropped `correction` (publish it, one line) | −40 | high |
| OpenCode: steering disclaimers to one sentence; `parity.md` and `interactions.md` to what a decision needs | −60 page | high |
| Launcher `--help`: the coordinator's part, and the rest under `--help-all`; each call fact told once (the stop, `approvals=`, the pid line, `RUNNING=`) | −40 help, −~1,000 words | high |
| Codex and OpenCode flags the launcher cannot pass (`--verify`, the wall clock and its steer, `--host-home`, `--answer-json`, `--max-commands`), unless the owner wants one wired (decision 3) | −290 | high that they are unreachable |
| Codex web-search policy reader, worktree reconciliation, duplicate and stale approval counters | −135 | medium |

## Step 4. Rights: one model for three adapters

| Change | Size | Risk |
| --- | --- | --- |
| **One mailbox module** in orchestrate: offer, poll, record-then-answer, the deadline, the `pending` rewrite; each adapter supplies only how to answer its CLI (OpenCode keeps its session-wide reject). One approvals section on the shared page in place of five | −150 code, −80 page | a regression in a security path; port the three adapters' approval cases first |
| **Drop the Codex mailbox owner claim**; the launcher's one-launch-per-directory claim already holds | −45 | a hand-run driver given another run's `--approval-dir` is no longer refused; not a supported caller |
| **One rule for what the rights do not cover:** one request, whatever the tool. File writes outside the roots are offered like commands, not auto-declined | −35 | slightly more requests; none of 37 measured declines was one |
| **Each driver checks the effect its CLI reports:** Claude the permission mode and tools from `init`; OpenCode the session rules read back; Codex one table comparison in place of two functions | ~+20 | none |
| **The write lock** (decision 2) | −300 or 0 | see the decision |

## Step 5. Measurements that spend tokens, each on the owner's word

| Measurement | What it settles | Cost |
| --- | --- | --- |
| The relay with its steps only in `agents/proxy.md`, about six Haiku runs | whether the pasted message can go | cents |
| OpenCode V1 refuses an edit in a read session | whether V1's session rules, all its enforcement, hold live | one short run |
| `auto=` on macOS under 0.26 or later | whether the Codex file-change auto-accept still fires | one Codex write run |
| Claude Code's Bash sandbox under an external Claude agent | an OS layer under Claude agents whatever the user's allow rules | one short run |
| Stop on a background Bash `--run` in Claude Code (E102) | whether a relay-less route is possible | one run |

## Decisions for the owner

1. **Egress for Codex read agents.** Today a read agent may read any file and send it out without a request:
   the likeliest harm, and the only one that bypasses the mailbox. Recommended: `NETWORK` becomes a right the
   plan row pins, off by default for read agents; a command that needs the network asks. This reverses the
   deliberate parity with Claude subagents.
2. **The write lock.** (a) Keep the Codex lock and anchor it on a per-user path `$TMPDIR` does not move (X5);
   OpenCode and Claude stay unlocked. (b) Replace it with D's shared lock, one file per holder with its roots,
   covering nested and `--writable` roots and all three adapters: about −300 lines, an on-disk change cleanup
   must follow. Recommended: (b), with its own cases written before the Codex lock goes.
3. **The unreachable features.** Delete them, or wire the ones worth keeping. Recommended: delete all but
   `--verify`, and wire it as `--run --verify <cmd>` on the coordinator's own command line, which keeps the
   injection argument; it is the one gate the model cannot author.
4. **OpenCode V2.** Recommended: V1 only, V2's client, fake and pilot to `research/`; about −270 code, −290 page,
   −285 test lines. Switch wholesale if V1 is ever deprecated.
5. **OpenCode attaching to a remote server.** If it is not used, local mode only: about −80 lines.
6. **The no-command gate.** Codex and OpenCode fail a turn that ran no command unless `ALLOW_NO_COMMANDS: yes`;
   Claude has no gate. Recommended: one rule, no implicit gate anywhere; `EXPECT:` stays the explicit check and
   the coordinator verifies as orchestrate already requires. `ALLOW_NO_COMMANDS` is accepted and ignored.
7. **The relay.** Recommended as in step 2: keep it on Haiku, Bash only, reading no skill; its message printed
   by `--new`; the paste dropped only if the step-5 measurement shows the file alone suffices.

## Kept on purpose

The restated accept on a fresh delimiter; decision binding by id, run and hash; the plan pins; `--new`'s
offline check before any relay; the keeper and the repeatable `--run`; Codex's sandbox-effect check, evidence
attribution, contracts as data, report publication and worktree harvest; OpenCode's model receipt, request
re-read and admission reconciliation; questions as typed requests; the isolated Codex home.

## In total

| | Now | After steps 1–4 with the recommended decisions |
| --- | ---: | ---: |
| Codex driver | 4,928 | about 3,350 |
| OpenCode adapter code | about 2,160 | about 1,600 |
| Shared code (`drivers.mjs`, a mailbox module, a lock) | 158 | about 400 |
| Pages a coordinator reads to call an external agent | about 4,800 words of call path | about 900 shared, plus each adapter's remainder |
| What the coordinator must know per adapter | the table in 04 | models and efforts, extra fields, composition |
