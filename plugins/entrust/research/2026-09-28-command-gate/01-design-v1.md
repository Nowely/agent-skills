# Command gate: design v1

Run `2026-09-28-command-gate`, Fable D2, 2026-09-28. Ground truth: [00-brief.md](00-brief.md); code as in the
worktree `entrust-approval-rules` (driver.mjs 5243 lines, agent-run.mjs 804 lines, plugin version 0.21.0);
codex-cli 0.155.1. Evidence levels as the repository defines them: 1 the line resolves, 2 an independent
reader would say the same, 3 made to happen. Four paid Codex turns on gpt-5.6-luna at effort low and two
dry handshakes were spent; every probe is in §8.

## 0. The answer in five lines

- Both ways start with the same subtraction: the widening layer of 0.21.0 goes whole (§1). That alone
  removes E77's cause and is releasable on its own; it is way 1.
- Way 2 is measured possible on 0.155.1: `thread/start` takes `dynamicTools` under `experimentalApi`,
  `item/tool/call` arrives with the exact command and cwd, the model uses the tool instead of its escape
  in three of three turns, and the turn continues on what the client returns (§8, level 3, n=1 each).
- Way 2's one unsettled part is not Codex but Claude Code: whether a Bash-only Haiku wrapper runs a
  handed line verbatim and whether the owner's `Bash(...)` rules match the line's shape (§3.9, M1–M3).
- Recommendation (§6): way 2, delivered as the subtraction first and the tool second, after M1–M3.
- Gives up: the coordinator's reading of every command before it runs; an experimental field at
  `thread/start` (fail-closed); in default permission mode the owner is prompted where the coordinator
  used to decide — which is what a Claude agent costs them today.

## 1. The subtraction both ways share

What the principle does not need, and what 0.21.0 carries only for the widening (level 1, file:line in
the worktree):

| Component | Where | Lines |
| --- | --- | --- |
| The two under-development features, their probe and its bound | `driver.mjs:152-166` (`FEATURES_PROBE_MS`, `PERMISSION_FEATURES`), `:2545-2588` (`featuresRequested`, `featuresProbe`, `permissionFeatures()`), `:2718`, `:2736` (`-c features.*=true`), `:2921`, `:5234` (probe kill) | ~60 |
| The instruction that names "state or cache files" and `request_permissions` | `driver.mjs:4851-4866` | 12 |
| The widening block: `requestedPermissions`, `profileEntries`, `checkedEntries`, `pathClause`, `networkWord`, `accessClauses`, `unsupportedWidening`, `protectedWidening`, `declinedWidenings`, `rememberDecline`, `declinedCovering` | `driver.mjs:3475-3580` | ~105 |
| Widening branches in the request handler: protected root, unsupported kind, the repeat-of test, `widening ? "sandbox"` | `driver.mjs:3648-3663` | ~15 |
| The grant bookkeeping: `sandboxWidened`, `granted`, `repeatOf`, the `permissions` copy, the turn-scoped profile answer | `driver.mjs:3127`, `:3233`, `:3287-3295`, `:3306-3311`, `:3461-3472`, `:3871`, `:4613` | ~30 |
| Report fields `featuresRequested`, `serverWarnings` (kept only for the features' warnings) | `driver.mjs:158-160`, `:3898-3900`, `:4628` | ~8 |
| Help text on widenings and the features | `driver.mjs:497-511`, `:621-637`, `:673-681` | ~40 |
| Launcher: `ACCESS=`/`NETWORK=` lines, `REPEAT_OF=`, their usage text | `agent-run.mjs:205`, `:209-213`, `:590-602`, `:608`, `:617` | ~25 |
| codex page: the widening clause in the rights row and the widening bullet | `codex/SKILL.md:190`, `:328-344` | ~20 |
| orchestrate page: "prefer a widening…", "approve a write into a tool's own state or cache under the home…", the `sandboxWidened` sentence, `REPEAT_OF` | `orchestrate/SKILL.md:116`, `:118`, `:120` | ~8 |
| Suites: fixtures and cases for widenings | `evals/protocol.test.mjs` (85 matching lines), `fake-app-server.mjs` (35), `agent-run.test.mjs` (17), `agent-contract` (9), `fidelity` (7), `cli` (5), `orchestrate` (5), `lock` (1) | ~170 |

What stays of 0.21.0 after the subtraction: the mailbox for every agent, the hand-back through `--run`,
`--pending`/`--decide`, the driver's auto-yes for a file change inside the agent's roots, the escape
offer, the 30-minute expiry, the containment guards, `escalations` in the report, the exit ladder. The
`item/permissions/requestApproval` row of `REFUSALS` (`driver.mjs:3603`) stays as a refusal: a server that
sends one anyway is answered with the empty profile and the entry recorded, never offered.

Why the whole layer and not a repair: it exists only to let a tool write its own state from inside the
sandbox; the arc run showed that a request names a tool's first failure, not its state, so a coordinator
granting requests one at a time is granting blind (E77, level 3), and the fix the pages would need is
tool knowledge ("grant arc's objectdb whole"), which the owner refuses. Both ways below make the command
run in the user's environment whole, as in the terminal.

`experimentalApi` (`driver.mjs:181`): it was switched on for `additionalPermissions` alone
([02-design-v7.md](../2026-09-27-approval-channel/02-design-v7.md) §1). Way 1 can turn it back to `false`;
way 2 needs it `true` (§3.1).

## 2. Way 1: the coordinator is the gate

### 2.1 Flow, from the first refused command to its result (level 1 for the code path, level 3 where marked)

1. The agent runs `arc status` inside Seatbelt; exit 1, "Operation not permitted" on the store. The
   driver records the failed text (`driver.mjs:3853-3855`).
2. The model re-issues the command with `require_escalated`; the server sends
   `item/commandExecution/requestApproval` with the command whole, no `additionalPermissions` (features
   off). The driver classifies `cause: sandbox` because that text just failed (`:3664-3666`), writes
   `<id>.request.json` and `pending` in the mailbox, pauses the idle guard (`:3226-3268`).
3. `--run` sees `pending`, prints the request block (`REQUEST=`, `CAUSE=`, `CWD=`, `COMMAND<<T … COMMAND>>T`,
   `REQUESTS=`, `WAITING=`, `REPORT=`) and exits (`agent-run.mjs:725-726`, `:770-771`); the wrapper hands
   the lines back (`codex-agent.md:17`).
4. The coordinator reads the command, decides under the orchestrate page's rule, runs
   `--decide ID --accept` (`agent-run.mjs:650-693`); the decision file is published by link(2).
5. The driver polls, takes it, settles the entry, answers `{decision: "accept"}` (`driver.mjs:3271-3300`).
   The server re-runs the command with no Seatbelt, as the user (P1 Q2, nested `sandbox-exec` 0,
   level 3); the output reaches the model as any command output; the turn continues.
6. The coordinator sends the wrapper the same block again; `--run` waits for the next request or the
   end. The report carries the entry: method, kind, detail (the command), cause, decision, by
   `coordinator`, why, waitMs, `outcome` from the item's completion (`:3850-3852`).

Measured today on this machine (level 3): 13 arc escapes and 14 others declined before 0.21.0
([00-escalations.md](../2026-09-27-approval-channel/00-escalations.md)); an accept re-runs with no
sandbox (P1 Q2); the wait had no server-side bound at 180 s (P1 Q3); the arc run's two decisions took
35 s and 14 s of coordinator time each ([21-arc-measure.md](../2026-09-27-approval-channel/21-arc-measure.md)).

### 2.2 Delta against 0.21.0

Removed: §1. Added: nothing. Changed: `experimentalApi` back to `false` (`driver.mjs:181`) and the report
line that echoes it; the orchestrate page's Approvals paragraph loses its widening sentences and keeps
the rest; the codex page's rights row reads "a command escape or a file change is offered or declined";
CHANGELOG under Unreleased names the removal and E77 leaves the ledger with it.

Option 1b, a refinement and not a way: `--decide ID --accept` takes the command it approves, byte for
byte, and the launcher refuses a mismatch. The sentence the Flags rule demands: the coordinator sets it
on every accept; the default, the id alone, cannot decide because the auto-mode classifier judges the
`--decide` call and sees no command in it (brief, level 3: today's two passed on the id alone); without it
the classifier judges an opaque id. Cost ~15 launcher lines and one page sentence. It gives the
classifier the text; it gives the owner's `Bash(...)` rules nothing, since the call is still
`node agent-run.mjs …`.

### 2.3 Who sees the command before it runs, and under which rules

The coordinator, in the hand-back, under the orchestrate page's prose rule (`orchestrate/SKILL.md:116`).
The auto-mode classifier sees `node agent-run.mjs --decide <id> --accept` (level 3, the brief); the
owner's permission rules never match it. With 1b the classifier also sees the text. The owner sees
nothing unless the coordinator asks in chat.

### 2.4 Parity with a Claude subagent in the same session

None for the gate: a Claude agent's `arc status` is judged by the owner's rules
(`~/.claude/settings.json` allows `Bash(arc status *)`, `Bash(arc log:*)`, `Bash(arc show:*)`,
`Bash(arc diff *)`, level 1) or the classifier, with no coordinator turn; a Codex agent's costs a
hand-back and a decision by a different, hand-written policy.

### 2.5 What the owner sees, what the coordinator spends

Owner: nothing per command; a chat question for what the page sends up. Coordinator: one hand-back, one
`--decide`, one continuation per refused command, plus the reading; 14–35 s of wall clock measured per
decision (level 3, n=2), plus the coordinator's own turn latency; the command text and the request lines
enter the coordinator's context every time.

### 2.6 Headless and swarm

Headless (`claude -p`): the page says decline it and name it in the answer (`orchestrate/SKILL.md:116`,
level 1). Swarm (launch-only, no mailbox): declined at once, `why: "no channel"` (`driver.mjs:3676`,
level 1); the entry is in the report.

### 2.7 Failure modes and the report

Unanswered request: expired after 30 minutes, `decision: expired, by: driver, why: deadline`
(`driver.mjs:3344-3351`). Coordinator gone: same, the run ends on its own bounds. Accepted command that
outlives the turn: E67, unchanged. Coordinator misjudges: the command runs as the user with no record
beyond `escalations` and `outcome`; the classifier saw an id. Mailbox write failure: settled as expired
at once (`:3210-3224`).

### 2.8 Experimental surfaces

None after the subtraction: `experimentalApi` off, both features off. The escape is the stable
`item/commandExecution/requestApproval` (pinned schema).

### 2.9 What must be measured, cheapest probe

- Nothing for the mechanism: it is 0.21.0 minus the widening, and the fixtures cover the escape.
- 1b, if taken: one `--decide … --accept --command 'arc status'` in an auto-mode session; does the
  classifier let it through (it let the id-only form through: brief, level 3).
- Unmeasured and left so: arc through the accepted escape (L2 was not run; the owner asked to leave arc
  alone). Level 2 that it works: the escape runs with no Seatbelt at all, which is the terminal.

### 2.10 Size

A deletion of roughly 550 lines across driver, launcher, pages and suites (§1's table), no addition;
with 1b, +15 launcher lines and one launcher test.

## 3. Way 2: the same gate as Claude's

### 3.1 What is measured about the mechanism (level 3, §8)

- `thread/start` with `dynamicTools: [{type: "function", name, description, inputSchema}]` under
  `experimentalApi: true` starts the thread; the response does not echo the tools (D1). Under
  `experimentalApi: false` it is refused, `-32600 "thread/start.dynamicTools requires experimentalApi
  capability"` (D2). No feature flag is involved: `codex features list` has none for it (level 1,
  `$TMPDIR/command-gate/features-list.txt`).
- After a sandboxed failure the model calls the tool with `{command: "<the exact command>", cwd: "<its
  own cwd>"}`; the server sends `item/started` for a `dynamicToolCall` item and the server request
  `item/tool/call {threadId, turnId, callId, tool, namespace: null, arguments}` (T2, T3, T4).
- The client's `{success: true, contentItems: [{type: "inputText", text}]}` completes the item
  (`status: completed`, `success: true`, `durationMs`), the model continues with the text and answers
  with it (T2, T4). `success: false` completes the item `failed`; the model tried the tool once more
  with the command wrapped in `zsh -c '…'`, was refused again, and reported "unable to complete" with
  every attempt's output; no loop (T3).
- Escape requests: zero in three turns with the tool exposed and success required; zero permissions
  requests, zero file changes. With the steering sentence (T2, T3) and without it, tool description
  alone plus "must succeed" (T4).
- T1, success not required: the model reported the sandboxed failure as its answer and used nothing.
  The tool was exposed (rollout: 2 hits on `run_as_user`).
- The item `dynamicToolCall` is already counted by the driver's `otherItemCounts` with `it.tool` as its
  detail (`driver.mjs:3768-3773`, level 1). Today, an `item/tool/call` request would fall to the last
  branch of `handleServerRequest`: a JSON-RPC error and an `interactions` entry, exit 7 (`:3684-3687`,
  `:287`, level 1); no tool is registered today, so it never arrives.

### 3.2 Flow, from the first refused command to its result

1. The driver registers one tool at `thread/start`, only when it holds a mailbox (the shape decides,
   no flag): `run_as_user` — "runs one shell command in the user's own environment, outside your
   sandbox, with the user's own rights and state, through the user's permission gate; use it only for a
   command your sandbox has refused and that must run in the user's environment (a version-control
   client, any tool that keeps its own state or cache); a refusal is final for that command; returns
   exit status, stdout and stderr" — input `{command, cwd?}`. Nothing in it names a tool or a path.
2. The standing instructions gain one sentence in place of the removed one: "A request to run a command
   outside the sandbox is always declined; the one way to run a command in the user's own environment is
   the run_as_user tool: call it with the exact command the sandbox refused, then continue with its
   output." (T2/T3's wording, level 3 that it worked.)
3. The agent runs `arc status` inside Seatbelt; exit 1. It calls `run_as_user {command: "arc status",
   cwd}`. `item/tool/call` arrives.
4. The driver offers it through the mailbox exactly as a request: `<id>.request.json` with
   `method: item/tool/call`, `callId`, the command whole, `cwd`, `cause` (sandbox where the text just
   failed, policy otherwise), the same `run` identity, deadline 30 minutes; `pending` lists it; the idle
   guard pauses. An escape request (`item/commandExecution/requestApproval`) is declined at once, `why:
   "the run_as_user tool is the gate"`, and recorded.
5. `--run` hands back the request. New in the block: one `RUN<<T … RUN>>T` section holding the whole
   line the wrapper is to run, composed by the launcher:

       <command> > "$TMPDIR/entrust-<id>.out" 2>&1; node "<launcher>" --answer <id> --exit $? --report-file "<REPORT>"

   prefixed by `cd "<cwd>" && ` only when the call's `cwd` is not the launcher's own working directory
   (the wrapper's Bash runs where the launcher ran: level 2). `$?` is the command's own status, the
   redirect does not change it; the output file is under the session's `$TMPDIR`, outside the data
   directory the sensitive-file check refuses; the launcher derives the path from the id, never from the
   wrapper.
6. The wrapper's steps gain one: "If the result has a `RUN<<` block, run the line between the markers
   with the Bash tool, exactly as written; if the harness refused to run it, run
   `node … --answer <id> --refused --report-file <REPORT>` instead; then go back to step 2." The Bash
   call whose text is `arc status > … ; node … --answer …` is what Claude Code's gate judges: the owner's
   rules, the auto-mode classifier, or a prompt to the owner, as for any Claude agent's call.
7. `--answer` reads the output file, publishes `<id>.answer.json {id, run, exit, outputPath}` (or
   `{refused: true}`) by link(2) like a decision; the driver polls it as it polls decisions, settles the
   entry (`accepted` ran, `declined` refused, `expired`), and responds `{success: exit === 0,
   contentItems: [{type: "inputText", text: "exit=<n>\n<stdout+stderr>"}]}`. The server completes the
   item; the model continues.
8. The wrapper's rerun of `--run` waits for the next event; the coordinator is not involved until the
   run ends or a file-change request arrives. The report's `escalations` carries the entry with method
   `item/tool/call`, `detail` the command, `decision`, `by: gate` (a name for "Claude Code's gate through
   the wrapper"), `outcome {exitCode}` from the answer and the item's `status`; `RECEIPT=approvals=A/D/E/O`
   keeps counting it, since the launcher reads `settled.decision` from the request files
   (`agent-run.mjs:481-484`).

### 3.3 Why the executor is the wrapper and not the launcher or the coordinator

The gate sees the text of a Bash tool call. A launcher that ran the command itself would show the gate
`node agent-run.mjs --exec <id>`, the same opacity as today's `--decide` (the brief's finding). The
coordinator as executor works and is reliable, but restores the round trip and puts the output in the
coordinator's context, and through the runner the gate would see `node capture-check.mjs -- 'arc status'`;
that keeps only the classifier's view, which 1b gives for 15 lines. The wrapper is already the process
that runs one line and hands lines back, its Bash call is a subagent's tool call the classifier judges
(brief: it blocked one wrapper continuation as "Auto-Mode Bypass", level 3), and its cwd is the
session's. The one-line shape in §3.2 step 5 exists so that the wrapper transcribes nothing: no output
through Haiku, no exit code through Haiku, one line verbatim, which is the fidelity the block already
relies on (3 of 3 with the steps in the message: `codex/SKILL.md:79-81`).

### 3.4 Delta against 0.21.0

Removed: §1, and the escape offer (the escape is declined at once with a reason; the request kind stays
recorded). Changed: `experimentalApi` stays `true` and is now load-bearing (assert on `thread/start`'s
`-32600` as a refusal, exit 4, never a silent loss). Added:

| Where | What | Lines |
| --- | --- | --- |
| driver | the tool spec and its registration when a mailbox is held; the `item/tool/call` branch in `handleServerRequest` before the fallback (same ownership and current-turn tests as a command approval, `:3639-3647`); the answer form; the settle-on-turn-end and expiry for the kind (reuse `settleOpenApprovals`); the escape's at-once decline; the instruction sentence; help and report words | ~120 |
| launcher | `--answer ID (--exit N \| --refused)`; the `RUN<<`/`RUN>>` block in `requestLines`/`handBack`; the cwd comparison; usage | ~70 |
| wrapper | one step (run the block; the refused branch) | ~6 |
| codex page | the widening bullet becomes the tool-call bullet: what the block is, that the wrapper runs it under the session's own permission gate, what the entry records | ~15 |
| orchestrate page | the Approvals paragraph shrinks: a command the sandbox refused runs through the same gate as your own Bash, so nothing here approves it; the paragraph keeps the file-change rule | −10 |
| suites | fake-app-server: a `dynamicToolCall` item and `item/tool/call` request; protocol: registration only with a mailbox, the branch, the answer, expiry, the escape decline; launcher: `--answer`, the block, the cwd prefix; agent-contract: the wrapper's step text | ~150 |

### 3.5 Who sees the command before it runs, and under which rules

Claude Code's permission system, on the wrapper's Bash call whose first segment is the command: an allow
rule (`Bash(arc status *)` etc., level 1 that they exist on this machine) runs it silently; a deny rule
refuses it; otherwise the auto-mode classifier judges the text, or in default mode the owner is prompted
with the text. The coordinator does not see it before it runs; it sees the entry afterwards. The model
sees it, and T3 shows it may rephrase a refused command (`zsh -c '…'`): a text-matching gate must be
read as one that judges each call; a rule broad enough to match the rephrasing (`Bash(python3 -c ":*)`
is on this machine, level 1) is the same exposure a Claude agent already has.

### 3.6 Parity with a Claude subagent in the same session

The same: a subagent's Bash call, the same rules, the same classifier, the same prompt, the same card
(subagent Bash calls render inline, memory 2026-09-17). The cwd is the one difference and the `cd`
prefix covers it (§3.9 M3).

### 3.7 What the owner sees, what the coordinator spends

Owner, default mode: a prompt per command no rule covers, showing the command — what a Claude agent
costs; with their rules, nothing for arc's queries. Owner, auto mode: nothing while the classifier
allows; on a block, whatever auto mode does on a block (§3.9 M4). Coordinator: zero turns per command;
the wrapper's two Bash calls and a rerun; latency the wrapper's own, a few seconds each (unmeasured), no
context spent.

### 3.8 Headless and swarm

Headless: the wrapper's Bash call is judged as any call in a `-p` session — allowed by rule, or refused
with no prompt; a refusal becomes `--answer --refused` and the model reports it (T3's shape, level 3 for
the model's side). Swarm (no mailbox): no tool is registered, so nothing changes from today: an escape is
declined at once.

### 3.9 Failure modes, what the report records, and what must be measured

- Wrapper runs a different line (paraphrase, a dropped redirect): the gate judges what it ran, the
  transcript shows it, the answer file carries whatever the line produced; undetectable by the driver.
  **M1**, decisive and cheapest: ten wrapper hand-backs against the fake app-server, the `RUN` line
  printing a random token, `--answer` compared byte for byte; no Codex turn.
- The owner's rule does not match the line's shape (`arc status > … 2>&1; node …`): a prompt or a
  classifier judgement instead of silence — a cost, not a hole. **M2**: one call in a default-mode
  session with an allowed prefix rule, `ya tool jq --version > "$TMPDIR/m2.out" 2>&1; node … --help`,
  prompts or not.
- The `cd` prefix trips the checker (`cd-compound-*`, the owner's CLAUDE.md, level 3 for the read case):
  **M3**: one default-mode call `cd /tmp && ls`. All 13 historic arc escapes were read agents in the
  current directory, where no prefix is needed.
- Auto mode blocks the line: does the wrapper get a refusal it can act on, or is the owner prompted?
  **M4**: read the wrapper's card on the first real block; no probe designed that is harmless and blocked.
- The model never calls the tool and reports failure (T1's shape when success is optional): the entry
  is absent, the report shows the failed command as today; the brief's "must succeed" wording is what
  moved it (T2 vs T1, level 3, n=1 each). **M5**: T2 and T4 on Terra and Sol, one turn each, before the
  page claims the behaviour beyond Luna.
- Nobody answers (wrapper killed mid-line): expiry after 30 minutes, `success: false` "no answer from
  the gate", the entry `expired`; the run ends on its own bounds.
- The field drifts on a later codex: `thread/start` refuses, exit 4 before a token is spent; the fidelity
  differential notes any key the response gains.
- The command outlives the answer (a daemon started as the user): E67's shape, unchanged; the answer
  file carries only what the line captured.
- **M6**, the live gate: the real driver, the real wrapper, the toy tool of §8 through the whole path,
  one Luna turn.

### 3.10 Experimental surfaces

`dynamicTools` on `thread/start`: experimental-only (level 1: present in the `--experimental`
`ClientRequest.json:6689`, absent from the stable generation; level 3: refused without the capability).
`item/tool/call`, `DynamicToolCallParams`, `DynamicToolCallResponse`, the `dynamicToolCall` item: in both
generations (level 1). `experimentalApi` is already `true` in 0.21.0.

### 3.11 Size

The subtraction of §1 (~550 lines out), then ~360 lines in across driver, launcher, wrapper, pages and
suites (§3.4). Net roughly −190 lines against 0.21.0.

## 4. Other shapes weighed

- **1b** (§2.2): the decision carries the command. A refinement of way 1 for the classifier; not a gate
  of the owner's rules; not needed if way 2 lands.
- **`approvalPolicy: never` plus the tool**: would remove the escape at the protocol level. Killed: a
  managed device clamps `never` and every command is then denied while the run exits 0 (driver header,
  level 3 for the clamp); the driver asserts `on-request` (`driver.mjs:5096`).
- **The driver executes the tool call after the coordinator's yes**: way 1 with a second request kind;
  the native escape already asks the same question. Dropped.
- **The coordinator executes the tool call**: §3.3; keeps the round trip and loses the rules. Dropped as
  the design, kept as the fallback where a wrapper cannot run the line (M1 fails).
- **A guard that refuses a tool call whose command did not fail in the sandbox this turn**: five lines,
  brittle on rephrasing (T3), and the gate judges the command regardless; not proposed — the description
  decides, and `cause` in the entry says whether an attempt was seen.

## 5. Comparison

| Criterion | Way 1: coordinator gate | Way 2: Claude's gate (wrapper executes) |
| --- | --- | --- |
| Flow per refused command | escape → hand-back → coordinator decides → server runs unsandboxed | tool call → hand-back → wrapper runs the line under the gate → `--answer` → model continues |
| Delta vs 0.21.0 | subtraction only (~550 lines out) | subtraction, then ~360 in; escape offer removed |
| Who sees the command first, under what | the coordinator, under a page rule; classifier sees an id (1b: the text) | the owner's rules, the classifier, or the owner's prompt — the text itself |
| Parity with a Claude subagent | none: a separate hand-written gate and a coordinator turn | full: the same tool call, rules, classifier, prompt, card |
| Owner sees | nothing per command; chat escalations | default mode: prompts as for Claude agents; auto mode: nothing while allowed |
| Coordinator spends | one round trip, 14–35 s measured, context per command | nothing per command |
| Headless | declined by page rule | judged as any `-p` call; refused → agent reports |
| Swarm | declined at once | declined at once (no tool without a mailbox) |
| Failure shapes | expiry, misjudgement, E67 | wrapper deviation (M1), rule shape (M2), cd (M3), expiry, drift fail-closed, E67 |
| Experimental surface | none (experimentalApi off) | `dynamicTools` field (experimental); call/response stable |
| Measured | 0.21.0's live gates and 27 production declines | D1, D2, T2–T4 (level 3, n=1 each); M1–M6 open |
| Size | −550 | −190 net |
| E77's cause | removed | removed |
| Policy kept in the plugin | a prose approval rule on the page | none for commands; the file-change rule only |

## 6. Recommendation

Way 2, delivered in two commits on the same branch: first the subtraction (§1), which is way 1 and
stands on its own — releasable, E77 closed, the escape kept as the gate meanwhile; then the tool
(§3.2–3.4) once M1 and M2 have run, at which point the escape offer goes and the orchestrate page's
approval prose for commands goes with it.

Why: the principle asks for a gate, and the user already owns one; the plugin's own policy prose was
E77's cause and way 1 keeps writing it. The Codex side is measured (§8); what is left is Claude Code
plumbing, cheap to measure and fail-closed where it fails (a prompt, a refusal, never an unrecorded run).

What the owner gives up with way 2: the coordinator's reading of every command before it runs, replaced
by the same judgement their Claude agents get; in default permission mode, prompts where the coordinator
used to answer; one experimental field at `thread/start`, refused loudly when it drifts; Haiku running one
line verbatim, the fidelity already relied on for `--run`. What they give up with way 1 instead: parity,
their own rules, and a coordinator turn per refused command for as long as the plugin lives.

## 7. Open

1. M1–M6 (§3.9), none run; M1 and M2 decide whether the wrapper is the executor or the coordinator falls
   back to it.
2. The file-change request outside the roots: kept as a coordinator decision here (a rights question the
   plan settles with `WRITABLE:`); it could instead be declined with the tool named, making the mailbox
   carry tool calls only. Owner's call.
3. Whether the tool's output text should carry only a bounded tail of a large output, and where the whole
   goes (the launcher's file is already on disk; a path in the text would do).
4. Whether the tool is offered at write level too (a worktree agent's `git commit` in its own tree runs as
   the user through it; today that needs `WRITABLE: <repo>/.git`). Proposed: yes, one tool, one gate.
5. `by: gate` as the name in `escalations` for a decision Claude Code's permission system made; the
   launcher's `approvals=A/D/E/O` reading is unchanged.
6. n=1 per variant on Luna at effort low; T1 shows the "must succeed" clause is load-bearing.

## 8. Probe record (all level 3; paths under `$TMPDIR/command-gate/`)

Client `probe/probe-dyn.mjs` (adapted from P1's): private `CODEX_HOME` per run with `auth.json` linked to
`~/.codex` as the driver does and sessions kept private; read profile with `TMPDIR` set to
`agent-tmp*/` so the toy's state at `state/state.log` lies outside the writable root; the client stands in
for the gate. Toy `tool/probe-tool`: appends to its state file, prints `nested_sandbox_exec` (71 under
Seatbelt, 0 outside) and `status: ok`; calibrated as the user (exit 0, nested 0) and under
`codex sandbox -P entrust_read` (exit 1, "Operation not permitted", nested 71; `calib-sandboxed.txt`).

| Run | Config | Exit / what arrived |
| --- | --- | --- |
| D1 | `experimentalApi: true`, `dynamicTools`, dry | thread started, `approvalPolicy on-request`, sandbox `workspaceWrite` with `agent-tmp` as root, response keys without the tools; exit 0 |
| D2 | `experimentalApi: false`, `dynamicTools`, dry | `thread/start` refused `-32600 "thread/start.dynamicTools requires experimentalApi capability"`; exit 0 |
| T1 | steering sentence, success optional | sandboxed run exit 1; no tool call, no escape; reported the failure; `turn/completed completed`; rollout shows `run_as_user` exposed (2 hits) |
| T2 | steering sentence, "must succeed" | sandboxed exit 1 → `item/started dynamicToolCall` → `item/tool/call` id 0 `{command: "<exact>", cwd: "<its cwd>"}` → client ran it (exit 0, nested 0, state line written) → item `completed, success true, durationMs 363` → answer quoted both attempts; toolCalls 1, escapes 0 |
| T3 | steering sentence, "must succeed", client refuses | two tool calls (second wrapped in `zsh -c`), both refused, items `failed`; no escape; "Unable to complete" with every attempt; `completed` |
| T4 | no steering sentence, "must succeed" | same path as T2: one tool call, ran, answered; toolCalls 1, escapes 0 |

Transcripts `probe/transcript-<name>.jsonl`, stdout `probe/run-t*.txt`, configs `probe/cfg-*.json`,
rollouts under `probe/home-<name>/sessions/`. Nothing outside `$TMPDIR` was written except the
`auth.json` link target's own refresh, if codex made one; arc was not run.
