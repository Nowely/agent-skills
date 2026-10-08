# Audit B: the OpenCode adapter

At `8b518fc` (entrust 0.27.0), read-only. Paths are relative to `plugins/entrust/plugin/skills/` unless they
start with `evals/`. Runs: `node plugins/entrust/evals/opencode.test.mjs` passed 82/82 in 1 min 52 s. Each
reproduction below ran the driver against `evals/fake-opencode.mjs` from scratch scripts under `/tmp/audit-b/`.
No real `opencode`, `codex` or `claude` was started.

## Verdict

Rights are not where this adapter's weight is. They take about 45 lines of its own (`sessionPermissions`,
`outOfScope`), and the rest comes from `orchestrate/scripts/drivers.mjs`. The weight comes from four things:
a second API family (V2) that passed its pilot and was never adopted (about 270 lines of code, 290 lines of
pages and 285 lines of fake and tests); three `RESUME:` forms where one is documented and used, one of which
continues another worker's session; driver flags that no caller passes; and reference pages that read as lab
notebooks, one of which ships a corporate endpoint and private machine paths. The core V1 path is careful
and well tested. A decision is bound to the native request and re-read from the server before it is
applied. No model is substituted, and the receipt requires that the observed model match the requested
one. An unknown outcome never becomes success, and partial answers are kept. Two defects matter to a
coordinator:

- A `write` root may contain the state directory. Claude refuses this; OpenCode lets the agent's allowed edits
  reach its own mailbox.
- The SKILL's own prompt template exits 5 when the worker runs no command. Every bash command asks, so a
  read-only OpenCode worker either floods the coordinator with requests, fails, or (unattended) exits 7.

Removing V2, the extra resume forms, the unreached flags and the dead fields cuts roughly a quarter of the
code and two thirds of the pages. No defence that guards a reachable hazard is lost.

## Findings

### 1. The V2 family is a finished pilot carried as a second production path

- **Category.** Overcomplication.
- **Evidence.**
  - V1 is the default (`opencode/scripts/driver.mjs:875`). V2 is reached only through an explicit
    `API_FAMILY: v2` with `AGENT:` (`contract.mjs:78-90`). No page flow, swarm, launcher or eval outside
    `opencode.test.mjs` sets it.
  - V2 routes are "experimental" (`references/parity.md:29`), and V2 cannot run the owner's own router
    model. Its SDK, `@openrouter/ai-sdk-provider`, has no V2 dispatch (`references/v2-pilot.md:19-31`;
    `v2-client.mjs:5,137` refuses it). The pilot needed a per-model transport override.
  - V2 enforces no scope natively. Session-create permissions are ignored (`SKILL.md:106-107`), and the
    profile may only `ask` at resource `*` (`v2-client.mjs:10-18`). Every in-scope edit therefore goes to the
    coordinator, and `outOfScope` is its only scope check.
  - The pilot is closed: "Approved adapter acceptance: passed" (`v2-pilot.md:161-215`). Adopting V2 as the
    default "remain[s] separate owner actions" (`v2-pilot.md:213-215`, `parity.md:47-53`).
- **Cost.**
  - Code: about 270 lines. `v2-client.mjs` is 156. The driver has about 70 V2 lines (routes `97-110`,
    required routes `132-134`, `528-529`, `705-718`, `779`, `795-797`, `956-982`, `988-999`, `1085-1086`).
    `contract.mjs:78-90` is 13, and `status.mjs` has about 30 in its family, agent and directory matrix
    (`:7-27`, `:66-81`).
  - Pages: about 290 lines. `v2-pilot.md` is 215; there are about 40 V2 lines in `parity.md`, 15 in
    `SKILL.md`, 8 in `interactions.md:50-57` and 3 in `orchestration.md`.
  - Tests: `fakeOpenCodeV2` is 146 lines (`evals/fake-opencode.mjs:157-302`), plus 16 cases of about 138
    lines.
- **What it protects.** Nothing a coordinator can reach today. It is a hedge against a future removal of
  V1, and no removal date is known (`parity.md:29`).
- **Proposal.** Ship V1 only. Move `v2-client.mjs`, the V2 fake and tests, and `v2-pilot.md` to `research/`
  or leave them in git history. Then `resolveRoutes` becomes a constant, and `clientFor`, the family checks
  in `applyPrior` and `status.mjs --api-family/--agent` go. If V1 is ever deprecated, switch wholesale
  rather than keep two families.
- **Gain.** About 270 code lines, 290 page lines and 285 test lines. Status, resume and the report lose
  `apiFamily`, `agent` and `profileHash`.
- **Risk.** Re-porting V2 later, though the pilot record keeps the protocol facts.
- **Confidence.** High that V2 is unused. Medium on the strategic call, which is the owner's.

### 2. Three `RESUME:` forms, and `last` continues a sibling worker's session

- **Category.** Overcomplication and defect (D2).
- **Evidence.**
  - `resolveResume` (`driver.mjs:752-787`) takes `last`, an absolute report path, or a session ID.
  - `last` (`pickLastReport`, `:682-703`) scans the report's directory and its parent, and takes the newest
    OpenCode report with the same server and cwd. Under a plan that parent is `<run>`, so it holds every
    worker's report.
  - The session-ID form needs `<state>/opencode-sessions/<sid>.json`, written at `:671-680`, `:636` and
    `:1001`.
  - The pages document the report path and, with a caveat, the session ID (`SKILL.md:95-96`). `last` appears
    on no page and in no test. All 11 resume tests use a report path.
  - Claude has one form, the report path (`claude/scripts/driver.mjs:118-136`).
- **Cost.** About 50 lines.
- **What it protects.** The session-ID form covers a lost report whose session record survives, which is
  rare. `last` protects nothing and is wrong under a plan.
- **Proposal.** Keep only the absolute report path. Drop `pickLastReport`, the session records and the
  `RESUME` session-ID grammar (`contract.mjs:119-125`).
- **Gain.** About 50 lines and one rule shared with Claude.
- **Risk.** A coordinator that typed a session ID must give the report path instead.
- **Confidence.** High.

### 3. Driver flags no caller passes

- **Category.** Water.
- **Evidence.** The launcher spawns the driver with `--prompt-file`, `--report-file` and
  `[--approval-dir]` only (`orchestrate/scripts/agent-run.mjs:452-454`). The prompt grammar has no header
  for the flags below.
  - `--verify`: parsed at `:79`, run at `:1159-1168`, decides exit 9 or 12 at `:1190-1191`, and is
    reported at `:835`. No test or page uses it.
  - `--max-commands`: `:82`, `:499-500`, `:1048`, `:1221`. No test.
  - `--timeout` and `--idle-timeout` are used by tests only.
- **Cost.** About 26 lines (19 for `--verify`, 7 for `--max-commands`).
- **What it protects.** Nothing a caller can reach.
- **Proposal.** Drop `--verify` and `--max-commands`. Keep the two clocks for the tests.
- **Gain.** About 26 lines and two exit-code branches.
- **Risk.** None for current callers.
- **Confidence.** High.

### 4. Dead state, unread report fields, a computed-and-dropped `correction`, an unread sidecar

- **Category.** Water.
- **Evidence.**
  - Set and never read: `firstLine` (`driver.mjs:57`), `ctx.lastEvent` (`:1014`), `ctx.modelInfo`
    (`:954`), `ctx.abortReason` (`:1021`), and the parsed `effortAlias`, `expectSource`, `outputSchemaPath`
    and `taskSet` (`contract.mjs:77,116,136,144,151`).
  - Also unread: probe's `schemas` and `strictSteer` (`client.mjs:43-46`), and model's `name` and
    `capabilities` (`client.mjs:54`).
  - `contract.mjs` re-exports `REQUEST_ID`, `REQUEST_ID_SOURCE`, `parseRights`, `planWritesToRights`,
    `SCHEMA_KEYWORDS` and `validateValue` (`:14`, `:162`), and exports `isRequestId` (`:34`). No importer
    takes any of them from here.
  - Report fields that nothing outside `opencode.test.mjs` reads. The launcher reads only `exitCode`,
    `error`, `answer`, `answerJson`, `schemaOverflow`, `turnError`, `turnStatus`, `receiptOk`, `model` and
    `approvalsAutoAccepted` (`orchestrate/scripts/agent-run.mjs:564-578`). The unread ones:
    - constants: `strictSteer` (always false, `:798`), `costSource` (`:821`), `schemaOverflow` (always
      false: `base` never sets it, `:840`) and `approvalsAutoAccepted` (always 0, `:841`);
    - `approvalsAutoDeclined`, `admission`, `runtimePath`, `turnIds`, `invocationId`, `childUsage` and
      `verify`;
    - `tools`, which repeats `commands` and `fileChanges` and carries every tool's full `output` a second
      time (`:164`, `contract.mjs:232`, `driver.mjs:816-817`).
  - `report.runtime.json` is written five times during admission (`:554-574`) and read by nothing but a
    test that checks its name (`evals/opencode.test.mjs:487-492`).
  - `correction` is computed (`:1094-1130`) and put in `base` (`:1209`), but `buildReport` (`:792-845`)
    never copies it. A run showed exit 0 after 2 prompts, and the report has no `correction` key. The
    report therefore cannot say that a corrective turn ran or was lost.
  - `routeError` runs twice on a new run (`:919-922`, `:944-945`).
  - `fillRoute`'s fallback keys never match (`:62-63`).
  - `listOrEmpty`'s `r.data` branch is not reached, since V2's client already unwraps it (`:142`).
  - Three permission rules repeat the leading `"*": ask` (`:198`, `:205-206`).
- **Cost.** About 40 lines and about 12 report fields (48 top-level on a plain run, against Claude's 42).
- **What it protects.** Nothing.
- **Proposal.** Delete. Publish `correction` or delete its computation; publishing it costs one line.
- **Gain.** About 40 lines, and a report the coordinator can read whole.
- **Risk.** None. The launcher tolerates the absence of `schemaOverflow` and `approvalsAutoAccepted`.
- **Confidence.** High.

### 5. Reference pages that are lab notebooks

- **Category.** Water.
- **Evidence.**
  - `v2-pilot.md`, 215 lines, is a run log: session IDs, PIDs (`:146`, `:197`), a binary SHA,
    `/private/tmp/entrust-opencode-runtime/...` evidence paths (`:41`, `:77-79`, `:109`, `:147`, `:199`), a
    gate script "in this worktree" (`:203`), and a corporate model endpoint
    (`:18`, `:64`). All of it ships in the plugin payload.
  - `parity.md:7-53` is a measurement narrative. The facts a coordinator acts on in it fit in about five
    lines: schema by instruction plus one corrective turn, no strict steer, and an unknown cancellation
    blocking a continuation.
  - `interactions.md:40-57` describes the driver's Stop sequence and V2 pagination internals.
  - `SKILL.md` has hedges and internals: `:36-40` (why status is passive), `:85-86` ("Claude hosts may
    retain…until…verified"), `:100`, `:106-108` and `:117`.
  - `SKILL.md:111` is stale for the default mode. "The singleton stays running" holds only for a remote
    server. A local run stops its private server (`driver.mjs:1054`).
- **Cost.** About 335 of the adapter's 522 page lines.
- **What it protects.** The pilot's provenance, which belongs in `research/`.
- **Proposal.** Move `v2-pilot.md` and the parity log to `research/`. Cut `interactions.md` to what a
  decision needs. Fix `:111`.
- **Gain.** Pages fall to about 190 lines, and the endpoint and private paths leave the payload.
- **Risk.** None for a coordinator.
- **Confidence.** High for the move. Medium for the cuts.

### 6. Rights: small, mostly shared, with one gap and one unmeasured assumption

- **Category.** Rights.
- **Evidence.**
  - Enforcement layers:
    - the grammar and the plan pins, shared (`contract.mjs:92-97` calls
      `orchestrate/scripts/drivers.mjs:74-102`);
    - V1 session rules: read, list, glob and grep allow; everything else asks; edit and write deny on
      `read`, or allow under the roots on `write` and `worktree` (`driver.mjs:188-213`, 26 lines);
    - `outOfScope`, which auto-declines an edit request whose target lies outside the roots
      (`:217-230`, 18 lines);
    - the resume no-widen check, shared `scopeWithin` (`:946-949`), plus worktree re-attachment checks
      (`:727-742`);
    - decision binding (`contract.mjs:218-223`, `driver.mjs:347-355`).
  - What these duplicate:
    - `outOfScope` duplicates the V1 rules for edits inside the roots. It is cheap and is V2's only check.
    - `decisionFits` repeats the launcher's `typedRequest.fits`. These are two processes, so keep both.
    - `launch.mjs:20-30` re-implements `config.mjs:37-54` URL validation, about 10 lines.
  - The gap: no check keeps a write root off the state directory (D1). The inventory's "state directory kept
    out" (`01-inventory.md`, "How a right is enforced") is not borne out. `grep stateDir` shows only the
    worktree and session-record uses (`driver.mjs:665-669`, `:930`).
  - The unmeasured assumption: the only recorded live permission gates are V2's (`v2-pilot.md:117-180`). No
    record shows that V1's `POST /session` `permission` field is enforced: `edit: deny` on a read run, the
    root-scoped allow. That field is all of V1's rights enforcement. V2's equivalent field was found ignored
    (`SKILL.md:106`).
- **Cost.** About 45 lines of the adapter's own rights code.
- **What it protects.** The scope of the worker's file edits.
- **Proposal.**
  - Move Claude's overlap check (`claude/scripts/driver.mjs:152-155`) into `drivers.mjs`, next to
    `rightsScope`, and call it from both drivers, at `--check-prompt-file` too.
  - Have `launch.mjs prepare` call `connection()` instead of repeating it.
  - Measure once, live, that a V1 read session refuses an edit.
  - The minimal set keeping the same safety: the session rules, `outOfScope`, the shared overlap check,
    `scopeWithin` and `decisionFits`, about 50 lines.
- **Gain.** Closes D1. About 10 duplicated lines go.
- **Risk.** None.
- **Confidence.** High for the gap. Medium that the V1 rules hold live, since that is unmeasured.

### 7. The read right asks for every command, and the no-command gate turns that into a trap

- **Category.** Rights, unification and defect (D3).
- **Evidence.**
  - `bash` always asks (`driver.mjs:198`), even `ls` or `git diff`. Codex runs commands in its read-only
    sandbox, and Claude's `manual` mode runs the read-only commands unasked (`claude/references/external.md:28-34`).
  - Without `ALLOW_NO_COMMANDS: yes`, a turn with no successful command exits 5 (`contract.mjs:246`).
  - `SKILL.md:59-64`'s template has no `ALLOW_NO_COMMANDS`, and no OpenCode page names the header or exit 5.
    Only `main-proxy.md:71` adds it.
  - Run results:
    - The template prompt on a no-command turn: `exit 5 | receiptOk true | outputSchemaOk true | error: no
      successful command was recorded`.
    - With the header but no mailbox (a swarm), any command request ends in `exit 7`.
  - So an OpenCode read worker either asks the coordinator for every command or fails a valid answer.
- **Cost.** In lines, nil. In coordinator attention and failed runs, the largest of this adapter.
- **What it protects.** "Commands prove work", which is Codex's evidence model. Claude has no such gate.
- **Proposal.** Drop the implicit no-command gate for OpenCode, as Claude does, and keep `EXPECT:` for an
  explicit check. Failing that, put `ALLOW_NO_COMMANDS: yes` in the SKILL template and the swarm brief.
  Separately, measure whether OpenCode's bash patterns can safely allow a fixed read-only set (`git diff*`,
  `rg *`); its handling of redirects is unmeasured.
- **Gain.** Valid read-only answers stop failing. About 5 lines.
- **Risk.** A worker that ran nothing is no longer flagged, but the receipt, the schema and the
  coordinator's own verification remain.
- **Confidence.** High for the trap. Medium for the remedy, which needs one rule across adapters.

### 8. The idle clock ignores the server's busy status, and SSE exists only to feed it

- **Category.** Overcomplication and defect (D5).
- **Evidence.**
  - Progress is a change in message IDs or part counts (`driver.mjs:496-497`), or an SSE event whose
    top-level `sessionID` is owned (`:1012-1015`). A busy status is not progress (`:510`).
  - The SSE stream does nothing else: `ctx.lastEvent` is never read.
  - On `fakeOpenCode("intermediate")` with `--idle-timeout 2`, the run was cut after 3.9 s with "no progress
    before the idle timeout", while the server reported the session busy.
  - Live, a quiet command longer than the 600 s default survives only if OpenCode emits an event with a
    top-level `sessionID` during it. That is unmeasured.
- **Cost.** About 32 lines: `client.mjs:56-80`, `v2-client.mjs:153-155`, `driver.mjs:858`, `:1010-1015`.
- **What it protects.** Liveness detection for a long tool.
- **Proposal.** Count an owned busy session as progress, one line. Drop SSE. The 1,800 s wall clock remains
  the bound, as in Claude.
- **Gain.** About 32 lines and no false cut.
- **Risk.** A server hung while busy holds for 30 minutes instead of 10.
- **Confidence.** Medium.

### 9. Remote-server mode and its shared-server defences

- **Category.** Overcomplication; the owner decides.
- **Evidence.**
  - Since #52 the default is a private loopback server per run (`SKILL.md:14-18`, `local-server.mjs`).
  - Remote mode remains, which accounts for:
    - `config.mjs:37-54`;
    - `launch.mjs:20-51`;
    - the URL and mode checks in `applyPrior` (`driver.mjs:721-726`) and `pickLastReport`;
    - `status.mjs`'s probe branch;
    - `serverMode` in the report;
    - the foreign-request filters (`:415-416`) and the "every affected request owned" guards
      (`:276-283`, `:605-611`), whose hazard, another invocation's request on the same server, exists
      only on a shared server.
  - The pilot pages speak of "the original singleton" (`v2-pilot.md:6`, `:214`), so the owner may still run one.
- **Cost.** About 80 code lines, about 10 page lines and 3-4 tests.
- **What it protects.** Attaching to a server shared with others.
- **Proposal.** Ask the owner whether remote attachment is used. If not, keep only the local mode.
  Descendant discovery stays, because child sessions still need it.
- **Gain.** About 80 lines.
- **Risk.** A user who attaches remotely loses that mode.
- **Confidence.** Low to medium, since use is unknown.

### 10. The transport-uncertainty machinery is mostly earned

- **Category.** Strength.
- **Evidence.**
  - Admission reconciled by message ID without a resend (`driver.mjs:537-577`).
  - A stop that crosses admission is re-stopped (`:543-549`).
  - Group rejection, with sibling envelopes recorded as native (`:272-297`). This matches a live behaviour
    recorded at `parity.md:39-41`.
  - A changed request is not applied (`:347-355`).
  - Cancellation is observed for two stable polls, and "unknown" blocks a resume (`:640-660`, `:748`).
  - Each defends a real asynchronous-server hazard, and races are tested (`evals/opencode.test.mjs:540-620`).
  - The cost is concentrated in long functions, `execute` (185 lines) and `conclude` (139), and in about
    15 mutable `ctx` flags (`abortRequested`, `stopDuringAdmission`, `admissionInFlight`,
    `processingRequests`, `stopping`, `cleaned`, `unresolved`, `statusUnknown`, `discoveryComplete`,
    `needsInput`, …).
- **Cost.** About 300 lines across approvals, stop and admission.
- **What it protects.** Lost HTTP responses, races between Stop and decisions, and the server's
  session-wide reject.
- **Proposal.** Keep it. Split `execute` into setup, session and turn steps.
- **Gain.** Readability, not lines.
- **Risk.** None.
- **Confidence.** Medium.

### 11. The local server: right default, small duplication

- **Category.** Strength, with a minor water item.
- **Evidence.**
  - `local-server.mjs` (96 lines) gives a loopback server with random credentials, an ANSI-stripped URL
    announcement and a TERM-then-KILL close. It needs zero setup.
  - Duplication: `waitHealthy` (`:19-36`) polls `/global/health`, and `client.probe()` checks the same
    route again at once (`client.mjs:38-40`). `authorization` (`:15-17`) repeats `Client.headers`
    (`client.mjs:10-14`).
- **Cost.** About 15 duplicate lines.
- **What it protects.** Startup readiness.
- **Proposal.** Probe through `Client` with a short retry.
- **Gain.** About 15 lines.
- **Risk.** Low.
- **Confidence.** Medium.

### 12. Model routing from recent references, and `MODEL: inherit`

- **Category.** Overcomplication, minor.
- **Evidence.**
  - `recentModels` (`config.mjs:15-36`) feeds `status.mjs` and, through `inherit`, the run
    (`driver.mjs:1059-1070`).
  - `inherit` reads the machine's `model.json` at run time, so the model can change between status and run,
    and a plan refuses it anyway (`contract.mjs:97-99`).
  - The status list is useful. Model IDs are opaque, and the catalogue held 424 entries
    (`v2-pilot.md:22-23`).
- **Cost.** About 12 lines and 3 page lines for `inherit`.
- **What it protects.** Convenience.
- **Proposal.** Keep status's list. Have the coordinator always write the explicit `provider/model` it saw.
  Drop `inherit`.
- **Gain.** About 12 lines, and the model shown is the model run.
- **Risk.** Low.
- **Confidence.** Medium.

### 13. Question handling

- **Category.** Strength.
- **Evidence.**
  - Questions travel as typed requests. `--answer` is validated against choices and multiplicity
    (`launch.mjs:77-90`).
  - On the driver side the cost is about 15 lines (`driver.mjs:363-365`, `:416`, `:616-622`).
  - It is tested at `evals/opencode.test.mjs:232-237` and `:359-362`, and passed live
    (`v2-pilot.md:129`, `:171`).
  - No other adapter can ask the coordinator a question.
- **Cost.** About 35 lines.
- **What it protects.** The worker asking the coordinator instead of guessing.
- **Proposal.** Keep.
- **Gain.** None from a change.
- **Risk.** None.
- **Confidence.** High.

### 14. Steering

- **Category.** Water.
- **Evidence.**
  - There is no steering code. What remains is `strictSteer: false` in `client.mjs:46` and
    `driver.mjs:798`, `strictSteer:unsupported` in `status.mjs:76`, about 12 lines of disclaimers
    (`parity.md:33-35`, `:44-46`; `v2-pilot.md:152-158`), and the driver header (`driver.mjs:9-10`).
  - A coordinator acts on one fact: continue with `RESUME:` after the turn.
- **Cost.** 3 code lines and about 12 page lines.
- **What it protects.** Nothing.
- **Proposal.** Replace all of it with that one sentence.
- **Gain.** About 15 lines.
- **Risk.** None.
- **Confidence.** High.

### 15. The main proxy mode

- **Category.** Overcomplication; use unknown.
- **Evidence.**
  - `orchestrate/references/main-proxy.md` is 127 lines, `orchestrate/schemas/main-proxy.schema.json` 187
    lines and `orchestrate/scripts/agent-orders.mjs` 64 lines: 378 lines.
  - It is entered only by "Прокси на <model>" (`SKILL.md:22-25`), through OpenCode. There are two routing
    evals and four offline tests (`evals/opencode.test.mjs:93-154`, `:374-403`). No live run is recorded.
  - The driver has no code for the mode. It works through `OUTPUT_SCHEMA` and `oneOf`, which is a strength.
  - The schema is pretty-printed: compact, it is about 25 lines.
  - The page is dense with host-side rules.
  - `:96` says `node <skill-dir>/scripts/agent-orders.mjs` without naming the skill. A coordinator arriving
    from `opencode/SKILL.md`, whose `<skill-dir>` is opencode's (`:14`), finds no such file there. It moved
    in 0.26.0 (`CHANGELOG.md:134`).
- **Cost.** 378 lines.
- **What it protects.** An external model as coordinator.
- **Proposal.** Owner's call. Record one live round before investing more. Compact the schema, name
  `orchestrate` at `:96`, and cut the page to the loop steps (about 60 lines).
- **Gain.** About 160 schema lines (formatting) and about 65 page lines.
- **Risk.** Low.
- **Confidence.** Low to medium.

### 16. Against the Claude driver: what OpenCode could drop or share

- **Category.** Unification.
- **Evidence.**
  - Header parsing: `contract.mjs:40-75` and `claude/scripts/driver.mjs:70-92` are the same loop.
  - Report claim, pid line and `refuse`: `driver.mjs:895-903`, `:90-93` against Claude's `:253-256`,
    `:399-402`.
  - The scope and state-directory check: Claude's `scopeOf` (`:145-162`) also refuses a missing `read` or
    `write` directory offline. OpenCode's `--check-prompt-file` checks neither.
  - The report's `escalations`: Claude reads the settled state from the mailbox (`:221-229`). OpenCode's
    entries are pushed at offer time with no decision (`driver.mjs:316`), so its report cannot say what was
    decided.
  - Claude's claim carries `pid` (`:253`), so a `RESUME` of a running report exits 10 (`:125-127`).
    OpenCode's claim has no session or pid until it publishes, and the same case exits 2 with "RESUME
    produced no session id" (D6).
  - The approval deadline constant appears twice (`driver.mjs:30`, `claude/scripts/approvals.mjs:22`).
  - The entry scripts are line for line the same (`opencode/scripts/agent-run.mjs`,
    `claude/scripts/agent-run.mjs`).
- **Cost.** About 35 lines in OpenCode and about 20 in Claude are shareable.
- **What it protects.** n/a.
- **Proposal.** Put in `drivers.mjs`:
  - `parseHeaders(text, keys)`;
  - `claimReport(path, adapter)`, writing the pid line and a claim that carries `pid`;
  - the scope check;
  - `APPROVAL_DEADLINE_MS`;
  - a mailbox `escalations(box)` reader.
- **Gain.** About 35 lines in OpenCode and 20 in Claude. One refusal text and one escalations shape for the
  coordinator.
- **Risk.** Low. Both suites cover these paths.
- **Confidence.** Medium.

### 17. What OpenCode does better and should be shared

- **Category.** Strength and unification.
- **Evidence.**
  - The receipt requires that the reply's observed `provider/model` equal the requested model
    (`driver.mjs:1081-1087`, `:1150`, `:1181-1184`). Claude's `receiptOk` does not compare the two
    (`claude/scripts/driver.mjs:371`).
  - The exact model is checked as available and connected before any call, with no substitution
    (`client.mjs:48-55`).
  - A decision is re-read against the live request before it is applied (`driver.mjs:336-355`).
  - An unknown status, discovery or admission is exit 4, never 0 (`:1174-1179`).
  - The received partial answer is kept on cut or failure (`:1236-1243`, E119).
- **Cost.** n/a.
- **What it protects.** False success and silent model substitution.
- **Proposal.** Make "observed model matches requested" part of every adapter's `receiptOk`; aliases need
  Claude's alias-to-ID mapping.
- **Gain.** One receipt meaning across adapters.
- **Risk.** Claude aliases need care.
- **Confidence.** Medium.

### 18. Strengths

- **Category.** Strength.
- **Evidence.**
  - Dense code, 5% comments (`01-inventory.md`).
  - Rights, plan pins, worktree, exit codes and the JSON-schema subset are already shared
    (`contract.mjs:11-14`, `driver.mjs:21`).
  - The `presented` body is byte-exact, and a permission reply is always `once`, never `always`
    (`interactions.md:7-9`).
  - Lost mutations are never resent (`evals/opencode.test.mjs:247-256`).
  - Sidecars are named after their report (E120, `driver.mjs:1225-1227`).
  - 82 offline cases in under two minutes, including races at admission, request re-read and the final
    snapshot.
- **Cost.** n/a.
- **What it protects.** n/a.
- **Proposal.** Keep the suite's race cases as V2 leaves.
- **Gain.** n/a.
- **Risk.** n/a.
- **Confidence.** High.

## Lines each proposal would remove

| # | Proposal | Code | Pages | Tests and fake |
| ---: | --- | ---: | ---: | ---: |
| 1 | Ship V1 only; V2 to research | ~270 | ~290 | ~285 |
| 2 | `RESUME:` report path only | ~50 | ~2 | 0 |
| 3 | Drop `--verify`, `--max-commands` | ~26 | 0 | 0 |
| 4 | Dead state, unread fields, runtime sidecar, `correction` | ~40 | 0 | ~6 |
| 5 | Lab-notebook pages to research; trims | 0 | ~45 (beyond #1) | 0 |
| 6 | Shared state-directory check; `prepare` reuses `connection()` | ~10 (+5 shared) | 0 | +1 case |
| 7 | Drop the implicit no-command gate | ~5 | +1 | 0 |
| 8 | Busy counts as progress; drop SSE | ~32 | 0 | 0 |
| 9 | Local mode only (if the owner agrees) | ~80 | ~10 | ~30 |
| 11 | Local server probes through `Client` | ~15 | 0 | 0 |
| 12 | Drop `MODEL: inherit` | ~12 | ~3 | ~5 |
| 14 | Steering to one sentence | ~3 | ~12 | 0 |
| 15 | Main proxy: compact schema, shorter page | ~160 (schema formatting) | ~65 | 0 |
| 16 | Share parser, claim, deadline, escalations with Claude | ~35 (+~20 in Claude) | 0 | 0 |
| | **Total, adapter only (#1–14, 16, without #9)** | **~500 of ~2,160 (23%)** | **~355 of 522 (68%)** | **~295** |
| | With #9 | ~580 (27%) | ~365 | ~325 |

## Defects found in passing

**D1. A `write` root may contain, or lie inside, the state directory. Its edit allow then reaches the run's
own mailbox.**

- Where: `driver.mjs:924-937` and `:188-213`. Claude refuses the same prompt at
  `claude/scripts/driver.mjs:152-155`.
- How the forgery works:
  1. Under V1 the session allows `edit` and `write` on `<root>/**` unasked.
  2. The agent reads `<n>.request.json` (read is allowed everywhere) and writes `<n>.decision.json` with
     the same `id`, `run`, `requestHash` and `remote`, and `decision: "accept"`.
  3. The driver reads it (`:325-326`). `decisionFits` passes (`contract.mjs:218-223`), and the request is
     unchanged on the server (`:347`), so the driver replies `once` (`:361`).
  4. The agent has approved its own command.
- Evidence level 2: the rules come from a run, but the fake runs no tool.
- Reproduce:

  ```sh
  S=$(mktemp -d); mkdir -p $S/work/entrust-state; printf 'RIGHTS: write %s/work\nTASK: x\n' $S > $S/p.txt
  ENTRUST_STATE_DIR=$S/work/entrust-state node plugins/entrust/plugin/skills/opencode/scripts/driver.mjs --check-prompt-file $S/p.txt; echo $?   # 0
  ENTRUST_STATE_DIR=$S/work/entrust-state node plugins/entrust/plugin/skills/claude/scripts/driver.mjs --check-prompt-file $S/p.txt; echo $?     # 2: overlaps the state directory
  ```

  A full run on `fakeOpenCode("normal")` created the session with
  `{"permission":"edit","pattern":"$S/work/**","action":"allow"}` and the same rule for `write`, and exited
  0. A root inside the state directory (`write $S/work/entrust-state/run/a`) is accepted too.
- Fix: finding 6.

**D2. `RESUME: last` continues another worker's session.**

- Where: `pickLastReport` (`driver.mjs:682-703`) takes the newest OpenCode report in the report's directory
  or its parent with the same server and cwd. Under a plan the parent is `<run>`.
- Reproduce: on one `fakeOpenCode("normal")`, run the driver at `<state>/run/W1/report.json`, then at
  `<state>/run/W2/report.json`, both with `RIGHTS: read <cwd>`. Then run `<state>/run/W1-2/report.json` with
  `RESUME: last`. Result: W1 `ses_owned_1`, W2 `ses_owned_2`, and W1-2 resumed `ses_owned_2`, exit 0.
- Fix: finding 2.

**D3. The SKILL's prompt template fails a valid answer when no command ran, and an unattended worker fails
on any command.**

- Where: `SKILL.md:59-64`, `contract.mjs:246`, `driver.mjs:198`, `:1192`.
- Reproduce:
  - The template (`RIGHTS`, `MODEL`, `OUTPUT_SCHEMA`, `TASK`) on `fakeOpenCode("normal")`: exit 5, with
    `receiptOk true` and `outputSchemaOk true`.
  - With `ALLOW_NO_COMMANDS: yes`, on `fakeOpenCode("permission")` without `--approval-dir`: exit 7.
- Fix: finding 7.

**D4. An approval directory that cannot be made overwrites an existing report.**

- Where: `fail()` publishes through `atomicJson`'s rename (`driver.mjs:890-893`) before the exclusive claim
  (`:895-900`). This breaks USAGE's "No overwrite" (`:44`).
- The launcher makes the mailbox first, so only a direct call reaches this.
- Reproduce:

  ```sh
  S=$(mktemp -d); echo '{"answer":"EARLIER"}' > $S/report.json; touch $S/notadir
  printf 'RIGHTS: read %s\nMODEL: a/b\nTASK: x\n' $S > $S/p.txt
  ENTRUST_STATE_DIR=$S ENTRUST_OPENCODE_URL=http://127.0.0.1:9 node plugins/entrust/plugin/skills/opencode/scripts/driver.mjs \
    --prompt-file $S/p.txt --report-file $S/report.json --approval-dir $S/notadir/approvals; head -c 80 $S/report.json   # the earlier report is gone
  ```

- Fix: claim first, or refuse on stderr alone.

**D5. The idle clock cuts a session the server reports busy.**

- Where: `driver.mjs:496-497`, `:510`.
- Reproduce: `fakeOpenCode("intermediate")`, which keeps the session busy for 3.5 s after a first reply,
  with `--idle-timeout 2`. Result: exit 3, "no progress before the idle timeout", after 3.9 s, with one
  abort.
- Live: a quiet command longer than 600 s is at risk unless an SSE event carries a top-level `sessionID`.
  That is unmeasured.
- Fix: finding 8.

**D6. `RESUME:` of a report whose run is still going exits 2, not 10.**

- Where: the report holds only `{"adapter":"opencode","ok":false,"status":"starting"}` until it publishes
  (`driver.mjs:897`), so `resolveResume` fails with "RESUME produced no session id" (`:774`) in remote mode,
  or "another server mode" (`:722`) in local mode.
- Reproduce: start a run on `fakeOpenCode("permission")` with a mailbox, which leaves it waiting. Then
  launch a second run with `RESUME: <first report>`. Result: exit 2, "RESUME produced no session id".
  Claude returns 10 here (`claude/scripts/driver.mjs:125-127`).
- Fix: finding 16, a claim with `pid` and the session.

Known and not repeated: E139, an OpenCode worktree in no ledger (`ISSUES.md:332`).
