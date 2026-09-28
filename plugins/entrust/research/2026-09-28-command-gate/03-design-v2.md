# Command gate: design v2

Run `2026-09-28-command-gate`, Fable D2, 2026-09-28, after Opus C1 ([02-critique-c1.md](02-critique-c1.md),
safety and parity) and Opus C2 ([02-critique-c2.md](02-critique-c2.md), simplicity and lifecycle).
Ground truth stays [00-brief.md](00-brief.md); v1 is [01-design-v1.md](01-design-v1.md) and everything of it
not named here stands. No Codex turn this round: no disposition turned on model behaviour that T1–T4 had not
measured. Four local shell checks under `$TMPDIR/command-gate/v2check/` (§8). Evidence levels as the repository
defines them.

## 0. What changed, plainly

The critiques change the recommendation. v1 recommended way 2 with the wrapper as the executor of the
composed line. C2 F1 kills that executor (a wrapper that runs a long line is no longer safe to rerun and Stop
no longer reaches the command), and C1 F8, C2 F2 and C2 F8 add that the relay would be executing text from a
tool result against its own rules. With the wrapper out, way 2's executor is the coordinator (C2 F3), and then
way 2 costs exactly what way 1 costs — one coordinator turn per refused command — while adding an experimental
field, a request kind, a launcher verb, capture plumbing, expiry semantics and 400–800 suite lines, for one
gain that is unlikely on inspection: the owner's prefix rules matching a line that has to begin with `{ (` to
capture real command shapes (C2 F4; §4.4).

So v2 recommends **way 1 with the accept restating the command it approves**: the subtraction of the widening
layer, and `--decide ID --accept` taking the approved command's bytes on stdin so the auto-mode classifier
judges the text and not an id. Nothing else is added. Way 2 with the coordinator as executor is kept fully
designed (§4), with every fix the critics asked for, behind one measurement that would make it worth its size.

What v1 got right and stays: the subtraction as step 1 and its list (now complete, C2 F9); the measured Codex
facts of way 2 (dynamicTools accepted only under experimentalApi, the tool used instead of the escape in three
of three turns, graceful failure on refusal); the fail-closed drift behaviour; swarm and headless readings.

## 1. Dispositions

A: accepted with the change named. R: rejected, with the reason. M: merged into another finding's change.
"Y" is way 1 with the restated accept (§3), "X" is way 2 with the coordinator as executor (§4).

| # | Finding | Disposition |
| --- | --- | --- |
| C1 F1 | Refusal text teaches rephrasing; nothing bounds calls per turn; the subtraction removes the refusal memory | **A for X**: (a) the refusal text says only "not run; will not be run in this turn"; (b) one constant `LIMITS.MAX_GATE_CALLS_PER_TURN = 3` — the corpus maximum per run is 2 (a2-console, level 3) and T3 stopped at 2, so 3 admits one retry and stops a loop; past it the driver answers `success: false` without a hand-back and records the entry. (c) **R**: a text memory is defeated by the rephrasing it is meant to catch (T3, level 3); the cap covers the loop. **M for Y** with C2 F12: the escape's decline carries no text to the model (the server says "rejected"), the coordinator sees each re-ask and declines it; no cap now — corpus maximum 2 — and the same constant if a loop is ever measured. |
| C1 F2 | The gate judges a name, the bytes behind it are the agent's; §3.4 deleted the reader; register at read level only | **A, both ways**: the two sentences (the gate judges a line's text, not the behaviour of what it names; a repository query runs its hooks) move to the codex page's rights section and are not deleted from orchestrate. **A for X**: the tool registers only where the agent's writable roots are its own temp root (read level); §7.4 of v1 is answered **no**, a worktree agent's commit stays a `WRITABLE:` rights line. **Y**: the escape exists at every level today with the same hazard and the same reader; unchanged. |
| C1 F3 | The tool is a general unsandboxed-exec channel, not a retry channel | **A for X**: a call is offered only when the driver saw the same text fail in the sandbox this turn (`cause: sandbox`, the test at driver.mjs:3664-3666); otherwise answered `success: false` "run it inside the sandbox first" and recorded; a rephrased call costs a refusal, never a hole. **Y**: `CAUSE=` is in every hand-back and the reader decides; unchanged. |
| C1 F4 | The rights row stops being true | **A, both ways**: `codex/SKILL.md:190` and `codex-composition.md:40` say: the sandbox bounds what the agent does itself; a command it cannot run is offered to the coordinator (Y) / to the session's own gate (X), and an approved one runs as you, with no sandbox. |
| C1 F5 | Parity is claimed for a line that is not the command; M2 must test both directions | **A for X**: M2 tests both directions and is a gate on X, not a cost. Added, level 2: the grouped line begins with `{ (` (C2 F4's fix), so a prefix rule written for the bare command cannot match its first segment unless the matcher strips grouping — one reason X is not recommended (§4.4). **Y**: moot, rules never apply. |
| C1 F6 | Model bytes interpolated into a double-quoted line; `cwd` | **A by removal**: the tool takes `command` alone; `cwd` leaves the schema. The driver knows the agent's cwd (its own `cwd`, driver.mjs:2681) and records it; the launcher composes from the record. Every launcher-composed value is single-quoted with `'` doubled; the command text is not quoted — it is the shell code inside the subshell, and it is what the gate judges. |
| C1 F7 | `RUN` block lacks the token discipline; refuse newlines | **A (a)**: fresh token per print, absent from the command, as `COMMAND<<` (agent-run.mjs:612-615). **R (b)**: the grouped shape captures multi-line commands whole (v2check, 13 cases, zsh and bash, level 3) and the corpus has multi-line scripts; the token prevents forging, not a one-line rule. |
| C1 F8 | The relay executes text from a tool result; M4 before deciding; `-p` with permissions bypassed has no gate | **A**: M4 runs before X is chosen (§4.6); under Y the equivalent is one call — the classifier on a restated accept (§3.7). **A**: one page sentence for both: in a session run with permissions bypassed there is no gate but the coordinator's reading. |
| C1 F9 | A failure path that writes no answer stalls silently | **M with C2 F6**: under X the executor is the coordinator's own Bash call, so a cut call is the coordinator's own and visible; the deadline stays one constant (a shorter one races real commands, C2 F6); `--run`/`--pending` print `HANDED=<id>` for a call handed out and unanswered. **Y**: n/a. |
| C1 F10a | Answer file under `$TMPDIR` is the agent's writable root; redirect follows a planted symlink (level 3) | **A by removal**: no file. The output flows by pipe into `--answer`'s stdin, and the launcher writes the mailbox (a subprocess handed the path writes unopposed; a shell redirect into the data directory is refused headless — orchestrate/SKILL.md:29, measured 2026-09-08). Shape checked (§8). |
| C1 F10b | Wrapper instructions collide with a redirecting line | **A as moot**: the wrapper executes nothing. |
| C1 F10c | `by: gate` overstates | **A**: `by: session`; the page says which of rule, classifier or prompt allowed a line is not knowable from inside the driver. |
| C1 F10d | Anything with Bash can `--answer`; refuse non-tool ids; never take a path from the caller | **A**: stated on the page as for `--decide`; `--answer` refuses an id whose request is not a tool call; there is no path argument. |
| C2 F1 | The wrapper stops being safe to rerun; double execution; Stop does not reach the command | **A**: decisive; the wrapper executor is withdrawn. |
| C2 F2 | Tool calls in `pending` wake the poll in a loop; `--decide` wedges them | **A**: under X `ASK=` is the trigger ("run the line") and `--decide` is deleted (C2 F11), so nothing wedges; Y unchanged. |
| C2 F3 | The coordinator as executor of the grouped line | **A as X's shape**, then weighed (§4.4): what it keeps is the classifier and the owner's prompt on the executed text; what it loses is rules (grouping), the zero-turn path, Stop reaching the command, and the run inside the server; the cost is what way 1 costs. The weighing is what moves the recommendation to Y. |
| C2 F4 | The RUN line breaks on real command shapes; group with a newline before the brace, close stdin | **A, extended**: `{ ( <command>⏎) 2>&1 </dev/null; printf '__entrust_exit=%s\n' "$?"; } \| node … --answer <id> …` — a subshell so an `exit N` or a `cd` inside the command stays inside it, a pipe so no file exists (C1 F10a). All of C2's six cases plus `cat`, `exit 7` and `cd /tmp; pwd` capture whole with the right status under zsh and bash (§8). |
| C2 F5 | The shipped sentence is T1's arm, which made no call; M5 measures what does not ship | **A**: X ships one generic sentence, "a command the task needs that the sandbox refused is not an answer: run it with run_as_user", and no "always declined" sentence; M5 measures that set on a task that needs the output without saying so, with a way-1 arm. **Y**: no sentence at all — 27 escapes arrived with none (corpus, level 3). |
| C2 F6 | The expiry covers the gate's wait plus the command's runtime; a late answer is misreported | **A**: a `--answer` after expiry is recorded as `late` with its outcome, never dropped — `countLateDecisions`/`approvalsLate` already exist (driver.mjs:3124, :3363-3367, :4670); RECEIPT counts it. **Y**: n/a — the decision is instant and the command is the server's. |
| C2 F7 | `cd` plus redirect forces a dialog; M3 tests the wrong case | **A**: no redirect remains; `cd` still composes where the agent's cwd differs from the session's; M3 runs the actual composed line from a background subagent. With C1 F2's read-level-only registration, worktree and write agents never route through it. |
| C2 F8 | The wrapper's rules forbid what the line does | **A as moot**. |
| C2 F9 | Subtraction list incomplete; `serverWarnings` stays; suites undercounted | **A**: list extended (§2); `serverWarnings` stays (driver.mjs:3898-3900 keeps every server warning, level 1); protocol.test blocks 26-36, 100, 237-245, 718-787, 1367-1540 ≈ 240 lines, suites ≈ 320 lines in all; `why-not-the-plugin.md:93` uses the word in another sense and stays. |
| C2 F10 | Step 2's size estimate is low | **A**: X's suites 400–800 lines; X's net against 0.21.0 is near zero or positive. Y adds ~15 launcher lines and one test. |
| C2 F11 | `--decide` survives for a kind never observed; decline a file change outside the roots at once | **A, both ways**: a file change outside the roots is declined at once, `why` naming `WRITABLE:` (0 of 37 in the corpus; a mid-run grant would widen rights without the user's word, `codex/SKILL.md:200-202`). Under X `--decide` is deleted; under Y it stays for the escape, the one kind the mailbox then carries. |
| C2 F12 | A refused call is retried re-wrapped; the owner is asked twice | **M** into C1 F1: the cap. |

The coordinator's own reading of the critiques, confirmed or refuted: the subtraction stays (confirmed); the
wrapper executor is the weakest part (confirmed, withdrawn); the coordinator executor is the simplest shape of
way 2 (confirmed) and it makes way 2 no cheaper than way 1 (the consequence the critiques did not draw);
`--decide` survives under Y and not under X (§1, C2 F11); the composed line needs grouping, closed stdin, safe
quoting and no writable-root file (all taken, by grouping in a subshell, closing stdin, quoting nothing of the
model's and having no file); the tool call tied to a refusal, capped per turn and read-level only (all taken
for X); the instruction set decided from the probes (C2 F5); the expiry covers the runtime (C2 F6).

## 2. Step 1, the subtraction, list completed

v1 §1's table stands with these additions and one removal:

| Add | Where | Lines |
| --- | --- | --- |
| The escalation fields `permissions`, `granted`, `repeatOf` and the `sandboxWidened` paragraph | `codex/references/environment-and-internals.md:39-41`, `:49-51` | ~8 |
| The section "Feature probe, for the widening" | `environment-and-internals.md:90-110` | ~20 |
| The "permission prompt" row's widening clause | `codex/references/parity.md:28` | 1 |
| The rights row's widening clause | `orchestrate/references/codex-composition.md:40` | 1 |
| Suites, recounted: protocol.test.mjs blocks 26-36, 100, 237-245, 718-787, 1367-1540; fake-app-server 39 lines; the rest as in v1 | `evals/` | ~320, not 170 |

Stays: `serverWarnings` (driver.mjs:158-160, :3898-3900, :4628) — it keeps every server warning and is what
shows an experimental field drifting. Changed in step 1 beyond v1: a file change outside the roots is declined
at once with `why: "outside the writable roots: a WRITABLE: line in the plan grants it"` (C2 F11), and its
page prose (`codex/SKILL.md:313-327`'s `outside` sentences, `orchestrate/SKILL.md:116` "a file written where
the plan said files go", `:118` `outside`) becomes one sentence. `experimentalApi` returns to `false`
(`driver.mjs:181`); C2's handshake shows `activePermissionProfile` and `runtimeWorkspaceRoots` still arrive
without it on 0.155.1, so the sandbox assertions at `:2465`/`:2505` hold (`c2/hs.mjs`, level 3). The rights
row sentence of C1 F4 and the two moved sentences of C1 F2 land in this step.

Size: ~570 code and page lines and ~320 suite lines out; ~6 page lines in.

## 3. Y: way 1 with the accept restating the command (recommended)

### 3.1 Flow

Steps 1–6 of v1 §2.1 unchanged, with step 4 now: the coordinator reads the request whole, decides under the
page's rule, and accepts with

    node "<launcher>" --decide <id> --accept --report-file "<REPORT>" <<'COMMAND'
    <the bytes of the COMMAND block, as printed>
    COMMAND

The launcher compares stdin to the request record's `command` (the server's own string, `/bin/zsh -lc '…'` in
every live turn, spread into the record at driver.mjs:3230; a trailing newline tolerated) and refuses a
mismatch, `REFUSED=<id> the restated command differs`. A decline takes no restatement. The quoted heredoc is
the shape the codex page already uses for `--new` (`codex/SKILL.md:106-111`), and it puts the approved bytes
inside the Bash call the auto-mode classifier judges. The server then runs the command as the user, no
Seatbelt (P1 Q2, level 3); the turn continues; the report entry is as today.

Not a flag, by the repository's rule: the restatement is the accept's shape, and the sentence exists — the
coordinator supplies it on every accept; the id alone cannot decide because the gate that judges the call sees
no command in it (brief, level 3); without it the classifier judges an opaque id.

### 3.2 Delta against 0.21.0

Step 1 (§2), then: launcher `decideRequest` reads stdin on `--accept` and compares (~15 lines); one launcher
test; the codex page's `--decide` sentence (`codex/SKILL.md:121`) shows the heredoc; the orchestrate Approvals
paragraph loses its widening and cache sentences and keeps: read it whole, approve a non-destructive request in
the plan's direction, take a destructive or off-plan one to the owner, headless declines, the two hazards
(hooks and bytes-at-path), the `outcome` retelling. The synthesis sentence for `cause: sandbox` becomes "the
tool needed the user's own environment; nothing on our side changes it".

### 3.3 Who sees the command, under which rules

The coordinator, whole, under the page's rule; the auto-mode classifier, in the restated accept; the owner, in
default mode, in the prompt for that call if no rule allows the launcher, and in chat when the page sends the
request up. The owner's `Bash(...)` rules never apply to the command. `RIGHTS: read` now reads as C1 F4 says.

### 3.4 Parity with a Claude subagent

Kept: the same judge on the text in auto mode (the classifier), the same owner prompt in default mode (on the
accept call). Lost: the owner's allow rules, and the absence of a coordinator turn — a Codex agent's refused
command costs one hand-back and one decision that a Claude agent's does not. This is what the owner gives up
under Y, and it is what they have today.

### 3.5 Owner, coordinator, headless, swarm, failures, experimental surfaces

As v1 §2.5–2.8, with: the expiry is a wait for a decision only, the command's runtime is the server's, Stop
reaches it through the driver (`codex/SKILL.md:350-355`); no experimental surface at all; swarm and headless
unchanged. One pre-existing observation, level 2, for the ledger and not this design: with
`item/commandExecution/outputDelta` opted out (driver.mjs:189), a long silent accepted command may trip the
idle guard (`DEFAULT_IDLE_TIMEOUT_S` 900) — unmeasured.

### 3.6 Size

Step 1's subtraction, +~15 launcher lines, +~20 test lines, ~6 page lines. Net ≈ −850 lines against 0.21.0.

### 3.7 What must be measured

One call: the auto-mode classifier on a restated accept whose heredoc holds a corpus command
(`/bin/zsh -lc 'arc status --short; arc log -n 1 …'`) — through or blocked. Blocked is a decline the page
already records, never a hole; through is the design working. Everything else is 0.21.0's measured channel.

## 4. X: way 2 with the coordinator as executor (designed, held)

### 4.1 Mechanism, corrected

- Registration: only when the driver holds a mailbox **and** the level is read (C1 F2); `experimentalApi`
  true, load-bearing, `-32600` at `thread/start` is exit 4.
- Tool: `run_as_user`, input `{command}` only (C1 F6); description as v1 without "a refusal is final" and with
  "for a command your sandbox refused".
- Standing sentence (C2 F5): "A command the task needs that the sandbox refused is not an answer: run it with
  run_as_user." No sentence about escapes; the escape is declined at once by the driver with `why: "the
  run_as_user tool is the gate"` and recorded.
- Offer: only with `cause: sandbox` (C1 F3); otherwise `success: false` "run it inside the sandbox first".
  At most `MAX_GATE_CALLS_PER_TURN = 3` offered per turn (C1 F1); the refusal text carries no reason.
- Hand-back: `REQUEST=`, `METHOD=item/tool/call`, `CAUSE=`, `CWD=`, `HANDED=` where already handed, then
  `RUN<<TOKEN … RUN>>TOKEN` with a fresh token absent from the command (C1 F7), the block holding:

      { ( <command>
      ) 2>&1 </dev/null; printf '__entrust_exit=%s\n' "$?"; } | node '<launcher>' --answer '<id>' --report-file '<REPORT>'

  prefixed `cd '<cwd>' && ` only where the agent's recorded cwd differs from the launcher's own. Nothing of
  the model's is quoted or interpolated; every launcher value is single-quoted with `'` doubled (C1 F6).
- Executor: the coordinator runs the block with its own Bash tool (C2 F3): the gate judges that call; the
  output and the exit marker flow into `--answer`, which strips the marker (a missing one is exit unknown,
  success false), publishes `<id>.answer.json` into the mailbox by link(2) (C1 F10a), refuses an id that is
  not a tool call's (C1 F10d). If the gate refused the call, the coordinator runs `--answer <id> --refused`.
- Driver: answers `{success, contentItems:[{inputText: "exit=<n>\n<output>"}]}`; expiry stays the one
  constant; an answer after expiry is recorded `late` with its outcome (C2 F6); entries carry `by: session`
  (C1 F10c). `--decide` and the file-change offer are deleted (C2 F11); `pending` lists the call and the
  orchestrate poll's `ASK=` means "run the line" (C2 F2).

### 4.2 Flow

Sandboxed failure → tool call → mailbox → hand-back or `ASK=` → the coordinator reads the block, decides
whether it is in the plan's direction, runs it → the gate judges → the launcher answers → the driver responds
→ the turn continues → the coordinator re-sends the wrapper block. One coordinator turn per refused command.

### 4.3 Delta and size

Step 1, then: driver ~130 lines; launcher ~80 (`--answer`, the block, the cwd prefix, `HANDED=`); pages ~20;
suites 400–800 (C2 F10). Net against 0.21.0 near zero or positive. The wrapper is untouched.

### 4.4 Parity kept and lost, against Y

Kept over Y: the classifier and the owner's prompt judge the *executed* line rather than a restated one; in
default mode the prompt is the real command (inside the grouping). Lost against a Claude subagent: the owner's
prefix rules — the line begins `{ ( ` and a rule written for the bare command cannot match it unless the
matcher strips grouping (level 2; M2 decides); the zero-turn path (the coordinator still reads and acts);
Stop from the agent map (the command runs in the coordinator's own Bash call, ten-minute ceiling then
background, `codex/SKILL.md:87-89`'s shape); the run inside the server, where the driver's cut, signal and
report already cover it. Against Y specifically, X adds nothing the owner can see in auto mode and costs the
plumbing above.

### 4.5 Owner, coordinator, headless, swarm

Owner, auto: nothing while the classifier allows; on a block, `--answer --refused` and the agent reports.
Owner, default: a prompt in the main session showing the grouped line. Coordinator: one turn per command, as
Y. Headless: the coordinator runs the line; allowed by rule or refused. Swarm: no mailbox, no tool, escapes
declined.

### 4.6 What must be measured before X is chosen

- M2, both directions (C1 F5): with an allowed prefix rule, does `{ ( <allowed> … ) … } | node …` run
  silently, and does an allowed first segment carry a second segment that would not be allowed alone; from a
  background subagent so its prompts surface (C2). A matcher that does not split, or that never matches the
  grouped first segment, closes X.
- M3: the actual composed line with a `cd` prefix, in default mode (C2 F7).
- M4 (C1 F8): the classifier on a coordinator Bash call whose text arrived in a subagent's hand-back, with a
  deny-rule match as the harmless refusal; and the classifier's review of a wrapper's final report.
- M5 (C2 F5): the shipped instruction set on a task that needs the output without saying so, one way-1 arm.
- M6: the live gate, with a way-1 arm on the same task.

## 5. Comparison

| Criterion | Y: way 1, restated accept | X: way 2, coordinator executes | v1's wrapper executor |
| --- | --- | --- | --- |
| Coordinator turns per refused command | 1 | 1 | 0 — withdrawn (C2 F1) |
| Who judges the text | coordinator; classifier on the accept | coordinator; classifier and rules (if M2) on the run | — |
| Owner's rules apply | no | only if the matcher strips `{ (` (M2) | — |
| Where the command runs | inside the server, under the driver's cut, signal and report | the coordinator's Bash call | — |
| Expiry semantics | decision only | wait plus runtime; late answers recorded | — |
| Experimental surface | none | `dynamicTools` (fail-closed) | — |
| New machinery | ~15 lines | ~230 code + 400–800 suite lines | — |
| Measured | production channel; one call open | D1, D2, T2–T4; M2–M6 open | — |
| Net against 0.21.0 | ≈ −850 | ≈ 0 | — |

## 6. Recommendation

Y: step 1 as one commit (releasable, E77 closed, ledger entry removed with the changelog line), the restated
accept as a second commit on the same branch, and one classifier call before the page claims it. What the
owner gives up: their allow rules never make a Codex command free, and a refused command costs a coordinator
turn — both true of 0.21.0 today, so nothing is lost against what they have; what they gain against the brief's
way 2 is nothing to maintain. X is worth its size only if M2 shows the matcher honours a prefix rule on the
grouped line **and** the owner wants rule-governed silence for Codex commands in default mode; then §4 is the
design, and the tool's Codex side is already measured.

## 7. Open

1. The classifier call of §3.7, one call in the owner's session.
2. Whether the driver should record the bare command beside the server's wrapped string so a restatement can
   name it without the `/bin/zsh -lc` shell; the record already spreads `commandActions` (driver.mjs:3230).
3. The pre-existing idle-guard observation of §3.5 (level 2), for the ledger, not this design.
4. X's M2–M6 stay unrun unless X is wanted.
5. The cap constant's number, 3, rests on two data points; it is not shipped under Y.

## 8. Checks this round (local, no Codex turn; level 3 each)

- `v2check/pipe.sh`: the brace-grouped pipe line on C2's six cases plus `cat` (stdin closed) and `exit 7`,
  under zsh and bash: every output captured whole with `__entrust_exit=<status>`, except `exit 7`, which
  exits the group before the marker (`p-zsh.*`, `p-bash.*`).
- `v2check/pipe-sub.sh`: the subshell variant of §4.1 on `exit 7`, `cd /tmp; pwd`, a comment, a heredoc and
  `sleep 0 &`, under zsh and bash: all captured whole with the right status; `cd` stays inside (`s-*`).
- Anchors for C2 F9 resolved by grep (§2). `consumedDecisions`/`countLateDecisions`/`approvalsLate` at
  driver.mjs:3124, :3338, :3363-3367, :4670. The output-delta opt-out at :189.
- Read: c1check (redirect follows a symlink; `$` expands in double quotes), c2 (`compose.sh`, `group.sh`,
  `hs.mjs` and their outputs).
