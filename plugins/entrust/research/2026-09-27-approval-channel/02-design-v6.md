# Design v6: the approval channel

Run `2026-09-27-approval-channel`, Fable D1, 2026-09-28. v6 finalises v5's pending section with Opus P1's third round ([01-probe-3.md](01-probe-3.md), six paid Terra turns, one dry handshake, level 3 with n=1 per variant). Everything else in [02-design-v5.md](02-design-v5.md) stands. Evidence levels as the repository defines them: 1 the line resolves, 2 an independent reader would say the same, 3 made to happen; a lifecycle claim not made to happen is a guess and says so. Line numbers are the current driver's (af4e82f) unless a file is named. v1–v5 stay as written.

## Changes from v5

1. **The widening exists only under two Codex features the driver now switches on itself**, `features.request_permissions_tool` and `features.exec_permission_approvals`, sent as `-c` keys with the rest of the per-run config. P1 Q7a–c: with the defaults the model never issues a permissions request, whatever the standing instructions say, because it has no tool to make one (`codex features list`: both "under development, false", level 3 on 0.155.1); Q7d: with both on, it calls `request_permissions` for exactly the file it needs and the request arrives.
2. **The keys are sent only where `codex features list` names both features**; on a codex without them nothing is sent, the request never arrives, and the escape path remains. The under-development cost is drift, and three checks watch it: the fidelity handshake, the rollout line, and the server's own `warning` notification, recorded in the report.
3. **The standing instructions gain P1's steering text verbatim**, the one form measured to produce the request; whether a shorter or gentler form works under the features is unmeasured, and the section says so.
4. **The grant is exactly the request**: `--decide --accept` copies the request's `fileSystem` and `network`, `scope: "turn"`; the coordinator cannot grant more than was asked. A tool that asks again for a sibling gets a second decision; a tool that cannot name what it needs stays on the escape. P1 Q7d/e: the copied grant made the tool succeed under Seatbelt (nested `sandbox-exec` 71) and a later plain command in the same turn ran under the widened sandbox without asking.
5. **The VCS client is undecided until P1's iterative run lands**: under the features the VCS client asked for `objectdb/data.dat` and `objectdb/index.dat` only (Q8), P1 declined it as unsafe, and what a grant of exactly that does to the index is being measured now. The two branches are named with what the measurement must show.
6. The report gains `sandboxWidened` beside `sandbox`, `serverWarnings`, and `featuresRequested`. Code, fixture, suite and gate moves are listed.

## In one paragraph

Every Codex agent runs with the two permission features on where its codex has them, and its standing instructions tell it to ask for the path a failing tool needs rather than to run outside the sandbox. When it asks, the request lands in the mailbox like an escape or a file change, `--run` hands it back, and the coordinator's `--decide --accept` grants exactly what was asked for the rest of the turn; the command then runs inside a wider sandbox, still under Seatbelt, and the report says so in `sandboxWidened`. The escape stays for what no path can widen, and the rule prefers the widening when either would do. Nothing in the driver knows a tool by name; a tool that cannot name what it needs is approved as an escape or declined, and P1's VCS-client run decides which of the two the VCS client is.

## 1. The two features, as the driver's own defaults

### What is sent

The per-run config list (`:2480-2511`) gains two rows, sent at both levels like `web_search`:

    ["features.request_permissions_tool", "true"],
    ["features.exec_permission_approvals", "true"],

but only when the run's `codex features list` names both. Level 3 that the server accepts them: P1's dry handshake and six turns passed them under `--strict-config` and the managed configuration (the flags-dry and Q7d configurations, `extraConfig`). Which of the two is necessary is unmeasured: P1 turned both on (n=1), the tool call is `request_permissions` and the re-run is `exec_command` with `sandbox_permissions "with_additional_permissions"`, so the reading is that the first makes the ask and the second makes the granted command; the design sends both.

### Why this passes the flags rule

CLAUDE.md:34: a flag, header field or option is born only with a sentence naming who sets it, why the default cannot decide, and what breaks without it. Nothing here is a flag, field or option: the driver writes these two values on every run, as it writes `web_search=disabled` and the read profile (`:2481-2492`), the user never sees them and cannot set them, and the default is the decision. What breaks without them is the whole widening: P1 Q7a–c, three turns with default features, no steering, a gentle sentence and the imperative sentence, and in all three the tool failed with `Operation not permitted`, zero permissions requests and zero escape requests arrived, and the model reported the failure as its answer.

### What "under development" costs, and the three checks

The cost is drift: a feature marked under development can change shape or vanish between codex versions, and the driver pins its protocol facts to one version (`PINNED_CODEX`, `schema-<version>/`, the `codexVersion` line in the report). Three checks, each already a place the plugin looks:

1. **The fidelity handshake** (`fidelity.test.mjs:43-100`, `:656-667`) replays the driver's exact `spawnArgs` against the real server. A key the server stops accepting fails there under `--strict-config` ("unknown configuration field", environment-and-internals.md, Configuration key oracle, level 3 for the oracle). The handshake case also asserts the server's `warning` notification, which names the enabled features: P1's dry handshake and q7d each received one, `Under-development features enabled: exec_permission_approvals, request_permissions_tool. Under-development features are incomplete and may behave unpredictably. To suppress this warning, set suppress_unstable_features_warning = true in <home>/config.toml.` (P1's Q7d, 1 hit, level 3). A codex that promotes the features to stable stops sending the warning, which the case reads as "still there, no longer under development" and reports, not fails.
2. **The rollout line.** With the features on, the rollout carries `The built-in request_permissions tool is available in this session.` (P1 Q7, 1 hit; in q7d's rollout at byte 27,242 of 67,245, level 3), inside the 64 KB head `findRollout` already reads for the receipt (`RECEIPT_HEAD_BYTES`, `:103`, `:3712-3713`). The fidelity live turn asserts the line in the receipt head of a turn run with the keys; the driver does not gate on it (a rollout is the receipt, not a config).
3. **The report.** The driver records every `warning` notification's `message` in `serverWarnings` (bounded to 20) and the keys it sent in `featuresRequested`; a coordinator reading a run where a widening never arrived sees whether the features were on.

The warning is deliberately not suppressed: `suppress_unstable_features_warning` would remove the one per-thread signal that says which under-development features the run held.

### A codex where the features are gone

`codex features list` is run once per driver start, `spawnSync` bounded by `SPAWN_TIMEOUT_MS` like `codex sandbox --help` (`:2456-2460`); its output on 0.155.1 is one row per feature, name first (`request_permissions_tool  under development  false`, level 3 this session). When either name is absent, or the command fails, neither key is sent, `featuresRequested` is `[]`, the standing sentence below is still sent (it costs nothing and asks for a request the model cannot make), the request never arrives, and a failing tool takes the escape path: the model asks to run outside the sandbox, the coordinator decides under the rule. Nothing breaks; the widening is simply not on offer, and the report says why. Rejected: sending the keys unconditionally, because `--strict-config` would refuse the spawn on a codex without them and every run would fail before its thread (`abort`, exit 4).

## 2. The steering sentence

`developerInstructions` (`:4367-4413`) gains P1's text as measured, one more element of the joined list:

> A tool failing with 'Operation not permitted' on its own state file is not an answer: you must make it succeed. When a tool you run fails because it cannot write its own state or cache files outside your writable roots, you MUST immediately issue a permissions request (the request_permissions tool, or a command with sandbox_permissions "with_additional_permissions" and additional_permissions) asking for file_system write access to exactly the path in the error message, and after it is granted run the same command again inside the sandbox. Never request to run outside the sandbox (never use require_escalated).

What is measured (level 3, n=1): with the features on and this text, the model issued the request for exactly the failing path, re-ran with the grant, and a later plain command needed nothing (Q7d, Q7e); with the features off and this text, nothing arrived (Q7c). What is not measured: whether the model asks under the features with no sentence or with the gentle one P1 used in Q7b, because Q7a–c all ran with the features off, so the sentence comparison is confounded by the tool's absence. The design ships the measured text and names the two turns that would let it shrink or go: the features on with no sentence, and with Q7b's gentle sentence. Until then, a longer instruction that is known to work beats a shorter one that is not.

The last clause, "never use require_escalated", is stronger than the rule: the escape stays for what a widening cannot cover (below), and a model told never to ask for it will fail such a command and report it. That is accepted for now, because the measured text is one piece; the two turns above may show which clauses carry the effect, and the clause can then be softened to "prefer".

## 3. The grant

### Exactly the request

`--decide --accept` on a widening makes the driver answer `{ permissions: { fileSystem: <the request's fileSystem, copied>, network: <the request's network, copied, or null> }, scope: "turn" }`, and nothing else; `--decide --decline` answers the empty profile, today's refusal (`:3212`). Level 3 for the grant's effect: P1 copied the request's `fileSystem` at `scope: "turn"`, the tool's re-run under `with_additional_permissions` raised no second request, exited 0, printed `nested_sandbox_exec=71`, and `state.log` got its line (Q7d); a later plain `exec_command` in the same turn, with no permissions on the call, exited 0 under Seatbelt and wrote again (Q7e). So a turn-scoped grant widens the sandbox for every later command in that turn and keeps the Seatbelt on. `session` is not sent: it outlives the turn and hides later matching requests from the record, the same defect as `acceptForSession`.

### The coordinator cannot grant more than asked

The request names what the tool said it needs; the coordinator's yes is a yes to that. There is no `--decide` argument that adds a path, for two reasons. A grant the model did not ask for cannot be traced to a need in the record: `sandboxWidened` would name a path no request names. And the only reason to widen beyond the request is knowledge of the tool's layout, the VCS client's `sync` beside its `objectdb`, which the owner does not want in the driver and which does not belong in the coordinator's rule either: a rule that says "for the VCS client, add sync" is the VCS client in the pages. So the rule for a tool's own state directory is:

> Grant what the tool asks for, exactly. If it asks again for a sibling in the same directory, grant that too: each request is one decision, and the turn's grant accumulates. A tool that cannot name what it needs, one that fails after every grant it asked for, is not a widening case: approve it as an escape when the command is non-destructive and in the plan's direction, or take it to the owner.

Iterative exact grants inside one turn are a reading (level 2): Q7e shows one grant persisting across later commands; two grants in one turn were not made to happen, and the fixture case below makes them happen offline.

### What P1's VCS-client run must show

the VCS client under the features asked for write on `objectdb/data.dat` and `objectdb/index.dat`, and nothing else (Q8, level 3). P1 declined: its reading is that with `index.dat` writable and `sync` still refused, the VCS client's observed re-create path (delete `index.dat`, then re-open) could wipe the 33 GB cache; the measured-safe grant is the whole `objectdb` directory plus the `sync` file (01-probe-2 Q6, 5 of 5), which the model did not ask for. P1 is now granting exactly what the VCS client asks, iteratively, in the owner's checkout, watching `index.dat`'s size and mtime.

- **Branch A, the VCS client asks its way to a working state.** After the exact grant the VCS client asks again (`sync`, `lookup.dat`, `objectdb.dat`, whatever it opens next), each is granted, `vcs status` exits 0 under Seatbelt, and `index.dat` is unchanged throughout. Then the VCS client is a widening case under the rule as written, the pages say nothing about the VCS client, and the plan says "reads the monorepo checkout". The measurement must show: the sequence of requests, each grant's `sandboxWidened` entry, exit 0, `nested_sandbox_exec=71` for the command, and `stat -f '%z %m'` of `index.dat` equal before and after.
- **Branch B, the exact grant destroys or stalls.** `index.dat` changes size or mtime under the partial grant, or the VCS client stops asking and fails. Then the VCS client is an escape case: the sandboxed `vcs status` fails, the model asks to run it outside (with the steering clause softened to "prefer", or the VCS client's request never arriving because the tool gave up), the coordinator approves a non-destructive query in the plan's direction as the rule already allows, and the command runs as the user. The pages still say nothing about the VCS client; the synthesis names the cause `sandbox` and the escape. The measurement must show: which file changed, at which grant, and whether the VCS client asked again.

Under either branch nothing tool-specific enters the driver or the pages.

## 4. The escape stays; the report shows the widening

The escape path (`item/commandExecution/requestApproval` of kind `command`, offered and accepted as an unsandboxed run) stays for what a widening cannot cover: a command that needs no path but a capability the sandbox withholds (process inspection, a nested sandbox, a socket), a tool that cannot name what it needs, and any codex without the features. The rule's first sentence on the subject stands from v5: prefer a widening to an escape when either would do, because a command under a widened sandbox stays sandboxed everywhere else.

The report: `sandbox` stays the server's echo at `thread/start`, which `assertSandbox` compared (`:2116-2200` at c828b7f); beside it `sandboxWidened: [{ itemId, permissions, scope, at }]`, one per accepted widening in the order granted, so a reader sees what the turn asked for and what it then held; the entry in `escalations` carries `method: "item/permissions/requestApproval"`, `permissions` (the request's profile), `granted` (the response), `cause: "sandbox"`, `detail` rendered one clause per entry (`write path:/Users/…/.entrust-probe-tool/state.log`), and the same `decision`, `by`, `why`, `resolved` and `outcome` as any entry. `RECEIPT=`'s `approvals=A/D/E/O` counts a widening like any request. The synthesis sentence: "Codex Terra T1 got write access to `<path>` for the turn; the plan needs no change."

## 5. What moves

### Code

| Where | Change |
| --- | --- |
| `driver.mjs` `setup()` (`:2480-2511`) | `codex features list` probed once, bounded; the two `-c` rows when both names are present; `featuresRequested` kept for the report |
| `driver.mjs` `developerInstructions()` (`:4367-4413`) | the steering text above, one element |
| `driver.mjs` `handleMessage` | `warning` notifications recorded into `serverWarnings` (bounded, 20) |
| `driver.mjs` `closeApproval` (`:3011`) | for a permissions request: `accept` builds the granted profile from the request, `scope: "turn"`; `decline` sends the empty profile; `sandboxWidened` appended on accept |
| `driver.mjs` `handleServerRequest` (`:3246-3274`) | the permissions request offered after the protected-root filter (v5), `cause: "sandbox"`, `permissions` and rendered `detail` on the entry |
| `driver.mjs` report (`:4165-4220`) | `sandboxWidened`, `serverWarnings`, `featuresRequested` |
| `driver.mjs` `--help-all` | the two keys under Isolation with their reason; `sandboxWidened` and the two new fields under Report |
| `agent-run.mjs` `--pending` (`:357-389`) | `ACCESS=<access> <type>:<value>` per entry and `NETWORK=` (v5) |
| `codex-agent.md` | unchanged beyond v5's description line |
| codex `SKILL.md`, orchestrate `SKILL.md` | v5's widening sentences; the synthesis clause; one sentence that the features are the driver's and a codex without them offers no widening |
| environment-and-internals.md | the two keys, the probe, the three drift checks, `sandboxWidened` |
| `CHANGELOG.md` | the Unreleased entry gains the features and the widening |

### Fixture and suites

`evals/fake-app-server.mjs`: `escalated-permissions` (`:910-916`) stays as the no-channel refusal; new `widening-wait` (a permissions request with `entries: [{path: {type: "path", path: <a file under the fixture's home>}, access: "write"}]` and `write: [<the same>]`, P1's shape; on a response whose `fileSystem` equals the request's and `scope === "turn"` the fixture emits the command `completed`/exit 0 and, after a second plain command, `completed` again with no new request; on the empty profile, `declined`); `widening-twice` (a second request for a sibling file after the first grant, then success); `widening-protected` (an entry under the fixture's `~/.codex`); `widening-network` (`network: {enabled: true}`); `widening-root` (`special: root`); the fixture also asserts the two `-c` keys in the driver's spawn args when the scenario's `FAKE_FEATURES` says the features exist, and their absence otherwise.

`evals/protocol.test.mjs`: `a widening is offered with cause sandbox and its entries rendered`; `--decide --accept on a widening sends the request's profile at scope turn, and sandboxWidened records it` (the RPC log carries the response body); `a second widening in the same turn is a second decision, and both grants stand`; `a protected entry is declined at once`; `a root special is declined at once`; `a network widening is offered`; `the two feature keys are sent when features list names both, and neither when it does not` (the `codex` shim answers `features list` from `FAKE_FEATURES`); `a warning notification lands in serverWarnings`. The `RUNGS` table is unchanged: a widening is `accepted`, `declined` or `expired` like any entry, and its contexts at `:1313-1316` already cover it; one flow asserts that a run with `sandboxWidened` non-empty and no non-accepted entry exits 0.

`evals/cli.test.mjs`: `--help-all` names the two keys and `sandboxWidened`. `evals/agent-run.test.mjs`: `--pending` prints `ACCESS=` and `NETWORK=` (v5). `evals/fidelity.test.mjs`: the handshake case asserts the `warning` notification names both features, or records their promotion; the live turn asserts the rollout head carries the `request_permissions` availability line. `evals/agent-contract.test.mjs`: the pages' new sentences.

### Live gates, run by the coordinator

1. **A widening on the toy tool.** P1's `~/.entrust-probe-tool/tool` (a script that appends to `state.log` under the home and prints `nested_sandbox_exec=$?` of a nested `sandbox-exec`), a read agent through the launcher in a background wrapper: the tool fails, the request arrives, `--run` hands it back with `ACCESS=write path:…/state.log`, `--decide --accept`, the continued wrapper hands back the nine lines with `approvals=1/0/0/0`; the report's `sandboxWidened` names the file, the entry's `outcome.exitCode === 0`, the tool's output shows `nested_sandbox_exec=71`, `state.log` has the line.
2. **The VCS client**, after P1's run, in the owner's checkout under whichever branch P1 decided: branch A as a widening with the requests granted in sequence and `index.dat` unchanged; branch B as an approved escape with `vcs status --short` exit 0 and `outcome` recorded.
3. v5's two gates (the foreground single agent, the orchestration with Stop) unchanged.

### Estimate, beyond v5

| File | Lines |
| --- | --- |
| `driver.mjs`: the features probe and keys, the sentence, `serverWarnings`, the grant builder, `sandboxWidened`, help | 110–140 |
| `fake-app-server.mjs`: five scenarios, `FAKE_FEATURES` | 80–100 |
| `protocol.test.mjs`: eight cases, one flow | 90–120 |
| `fidelity.test.mjs`: two assertions | 30–40 |
| `cli.test.mjs`, `agent-contract.test.mjs` | 15 + 15 |
| pages and reference | 30 |
| `CHANGELOG.md` | 10 |

About 380–470 lines on top of v5's 950–1,150. Composition unchanged from v5: one Opus write agent for code, fixture and suites; one Sonnet agent for the pages; one Codex Sol cross-reviewer; Codex Astra as refuter; the gates by the coordinator, the VCS-client gate after P1.

## Alternatives rejected

v5's list stands. Added:

**Sending the two keys unconditionally.** `--strict-config` refuses an unknown field and the spawn dies before the thread; every run on a codex without the features would exit 4. One `features list` per run is the price of not breaking them.

**Suppressing the under-development warning.** It is the one per-thread record of which unstable features the run held; the report keeps it.

**A shorter steering sentence.** Unmeasured; the measured text is what ships, with the two turns that would justify shortening it named.

**A `--decide --grant <path>` argument.** A grant no request names cannot be traced to a need, and the only reason to want one is a tool's layout, which is exactly the knowledge the owner keeps out of the driver and the pages.

**`scope: "session"`.** Outlives the turn, hides later matching requests, the `acceptForSession` defect.

## Open for the owner

1. **The features are under development.** The driver turns them on for every run where the codex has them, records the server's warning, and the fidelity gate watches for drift. If you prefer the widening off until Codex marks the features stable, the two rows are the only change, and every state-writing tool then takes the escape.
2. **The steering text is P1's paragraph**, four sentences; a shorter one is unmeasured. Two more Terra turns would settle whether it can shrink.
3. **"Never request to run outside the sandbox"** in that text is stronger than the rule; softened to "prefer" once the two turns show which clause carries the effect.
4. **The VCS client** stays undecided until P1's iterative run lands; both branches keep the VCS client out of the driver and the pages.

## Found in passing, for the ledger

- v5's items stand.
- `codex features list` marks `write_stdin_approval` under development and off as well (level 3 this session); the driver's refusal of `kind: writeStdin` (v3 F11) therefore guards a request that cannot arrive on 0.155.1's defaults, which is the right shape for a feature that may turn on.
- The server's `warning` notification names the config file where the warning can be suppressed by the private home's path in its `/private/var/…` spelling, while the driver writes that file by its `/var/…` spelling (P1's Q7d); one more place the two spellings of `$TMPDIR` meet.
