# Findings: the four audits, deduplicated and checked

Sources: [02](02-audit-codex.md) (A, Codex), [03](03-audit-opencode.md) (B, OpenCode), [04](04-audit-call-path.md)
(C, the call path), [05](05-audit-rights.md) (D, rights). "Checked" means re-run or re-read in this session, at
`eb7a0f0`, after the auditors finished; the level is the evidence level of `ISSUES.md`.

## The owner's questions, answered

| Question | Answer | Where |
| --- | --- | --- |
| Water? | Yes, concentrated. The Codex driver's comments are 1,569 lines and a sample of 57 blocks found 42% narrative, repetition or stale; its `HELP` is 406 lines for a command line only the launcher types. OpenCode's references are two-thirds run logs. The call path is told per adapter in about 4,800 words, with the steps themselves only on the Codex page. | A2, A3, B5, C2, C11 |
| One way to call any agent? | Mostly there already in code: after `--new` the launcher routes by `agent/backend.json`, and under a plan the row names adapter, model and writes. The differences a coordinator meets are mostly accidental and mostly in the pages: three `RESUME:` forms, two `RIGHTS` and schema defaults, three boolean spellings, three budgets, three report shapes, call steps only on one page. | C table, C1–C6 |
| Overcomplication? | In specific places, not everywhere: features the one call cannot reach (Codex `--verify`, wall clock, `--host-home`, `--answer-json`; OpenCode `--verify`, `--max-commands`), a second OpenCode API family never adopted, three mailbox writers for one protocol, a Codex write lock precise for the narrowest case, report fields with no reader. | A1, A4, A5, B1, B3, B4, D1, D5 |
| The proxy? | Keep it, and keep it dumb. It never writes the prompt or reads the result, so reading the adapter's skill would spare the coordinator nothing and add about 7k tokens to each relay; a small model given rules is the failure the incidents recorded. What needs fixing is the message: one source instead of a hand-filled block on the Codex page, whose copy in `agents/proxy.md` has drifted. | C7, C8 |
| Too much on rights? | Partly. The core (one grammar pinned to the plan, each CLI's own enforcement, the restated accept) is proportionate. The rest is uneven: about 1,000 lines of Codex guards against races between well-behaved runs, three lines or none in the other two, and the likeliest harm, read then send, open for Codex. | D verdict, D ledger |

## Defects

Each to `ISSUES.md` unless the proposal fixes it in its first change.

| # | Defect | Found | Checked | Level |
| --- | --- | --- | --- | --- |
| X1 | An OpenCode `write` root may contain the state directory; the agent's allowed edits then reach its own mailbox and it can approve its own requests | B D1, D D1 | `--check-prompt-file` on `RIGHTS: write <R>` with the state directory at `<R>/state`: OpenCode exit 0, Claude exit 2. The forged accept ran on the fake (D). | 3 |
| X2 | Under a registered plan, a Codex `WRITABLE:` line grants a root the plan does not name | D D2 | `ENTRUST_PLAN_WRITES="write A"`, `RIGHTS: write A` + `WRITABLE: B`: exit 0; `RIGHTS: write B`: exit 2 | 3 |
| X3 | Claude's approval server answers allow when the settlement cannot be written; OpenCode answers before it records | D D3 | `claude/scripts/approvals.mjs` `settle` swallows the write (`try { writeRequest… } catch {}`) and `poll` answers allow after it | 2 (3 on D's run) |
| X4 | The driver runs in the directory of whoever calls `--run` (the relay), not where `--new` checked the prompt; a `live tree`, `nothing` or bare `read` lands there | C defect 1 | `spawnDetached` and the driver spawn set no `cwd` (`agent-run.mjs:407-411`, `:454`); C ran it on the fake | 3 on the fake, unmeasured on a host |
| X5 | The default state root follows `$TMPDIR`: two writers with different `TMPDIR` take different locks, and a write grant can reach another session's state directory and mailboxes | A D1 | `stateDirectory(root = os.tmpdir())` (`temp-dir.mjs:90-97`); A ran both cases on the fake | 3 |
| X6 | OpenCode `RESUME: last` continues a sibling worker's session under a plan | B D2 | B's run | 3 |
| X7 | OpenCode's own prompt template exits 5 on a valid answer when no command ran; an unattended worker exits 7 on any command | B D3 | `contract.mjs:240-247` and the template at `opencode/SKILL.md:59-64`, which has no `ALLOW_NO_COMMANDS` | 3 (B) |
| X8 | Codex `--check-prompt-file` passes `RESUME: <path>`, which fails only at run time | C defect 5 | exit 0 | 3 |
| X9 | Claude's page says a resume keeps its rights; outside a plan the driver demands `RIGHTS:`, and a different `read` directory is silently ignored | C defect 4 | C's run | 3 |
| X10 | The shared `git()` that diffs an OpenCode or Claude worktree runs without the Codex driver's `GIT_SAFE`, in a tree the agent wrote | A 14, D ledger | `drivers.mjs:124-127` against `codex/scripts/driver.mjs:1872-1879` | 2 |
| X11 | The isolated Codex home does not carry `model_provider`; a custom provider runs against the default | A D3 | code reading | 2 |
| X12 | An OpenCode approval directory that cannot be made overwrites an existing report (direct calls only) | B D4 | B's run | 3 |
| X13 | OpenCode's idle clock cuts a session the server reports busy | B D5 | B's run on the fake; live unmeasured | 3 on the fake |
| X14 | OpenCode `RESUME:` of a running report exits 2, not 10 | B D6 | B's run | 3 |
| X15 | Pages give instructions the one call cannot carry out: "declare gates on the command line", `--host-home`; `main-proxy.md:96` names `<skill-dir>/scripts/agent-orders.mjs` under the wrong skill | A D2, B 15 | `agent-run.mjs:454` passes three flags | 1 |
| X16 | The relay's steps exist in two copies that differ (`agents/proxy.md:8`, `:18-19` against `codex/SKILL.md:195`); no OpenCode page gives a Claude Code coordinator the message | C defects 2, 3 | read | 1 |
| X17 | Stale text: the lock's anchor comment, the "22 of 64" ledger reason, `TaskOutput`, `LIMITS` "every number", `ISSUES.md` addresses of E113 and E115, the agent told its coordinator is Claude Code on every host | A D4–D6 | read | 1 |
| X18 | `opencode/references/v2-pilot.md`, shipped in the plugin, carries a corporate model endpoint and private machine paths | B 5 | `v2-pilot.md:18`, `:64`, `:41` | 1 |

## Agreements and conflicts between the auditors

- **The Codex write lock.** A keeps its algorithm ("replacing it reopens races that were measured") and fixes
  its anchor (X5); D replaces it with a shared lock of unique per-holder files that also covers nested and
  `--writable` roots and the two drivers that have none. D's shape has no shared path to steal, which is what
  the measured races were about, but it is untested. Both agree the lock now guards less than it costs.
- **The file-change auto-accept.** A would delete it after a live count on macOS; D keeps it as small. Keep it
  until counted.
- **Resume rights.** D drops the no-widen check (a resume declares its rights like any run); C wants one rule
  stated once. The directory must still carry over for Claude, whose sessions are stored per working
  directory.
- **The no-command gate.** B drops it for OpenCode, C extends `ALLOW_NO_COMMANDS` to Claude as a no-op. Both
  aim at one rule; which rule is the owner's (07).
- **Egress.** Only D raises it. A and C did not look at it.

## Strengths every auditor named

- One launcher contract for three backends: nine status lines, one mailbox, one byte-exact restated accept
  (C13, D F9).
- Refusals before tokens: `--new` runs the driver's offline check before any relay exists (C13).
- The plan pins model and writes in all three drivers (C13, D F9).
- Codex: it checks the sandbox the server applied, attributes evidence by root thread and owned turn, keeps
  its contracts as data (`FIELDS`, `LADDER`, `LIMITS`), publishes the report whole or not at all, and disarms
  the git it runs (A14).
- OpenCode: the receipt requires the observed model to equal the requested one, a decision is re-read against
  the live request, an unknown outcome is never success, the suite runs 82 races offline (B10, B17, B18).
- Claude: the smallest driver, the answer validated by the CLI (C, D).
