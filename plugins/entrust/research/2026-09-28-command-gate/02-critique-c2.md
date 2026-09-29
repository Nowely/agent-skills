# 02 — critique C2 (Opus): simplicity, lifecycle, what the owner lives with

Design under review: 01-design-v1.md (Fable D2). Worktree `entrust-approval-rules`, codex-cli 0.155.1.
Evidence levels: 1 the line resolves, 2 an independent reader would say the same, 3 made to happen.
My checks are under `$TMPDIR/command-gate/c2/`. I ran no Codex turn. I ran one handshake with no turn
(initialize and thread/start, empty private CODEX_HOME, no auth link).

## Verdict

Step 1, the subtraction, is the right shape. Keep it, with the list fixed (F9). Step 2 as drawn makes
the wrapper the executor, and that brings the lifecycle problems in F1, F2 and F6. The line it builds
breaks on command shapes found in the corpus (F4). The standing instruction it ships is the one probe arm
that did not use the tool (F5). The simplest shape the principle allows is step 2 with the coordinator
as executor, running the same grouped line (F3). The wrapper stays a stateless relay and needs no new
step, M1 goes away, and `--decide` goes away (F11). The cost is one coordinator turn per refused command,
which the corpus puts at 27 reports of 914.

## Findings, most severe first

### F4 — The RUN line's composition does not hold for real command shapes (level 3, high)
Scenario: the model calls `run_as_user {command: "vcs status --short; vcs log -n 1 --format='%H %ad %s'"}`,
a command shape taken from the corpus (00-escalations.md, branch-audit/a2). The line from §3.2 step 5
is `<command> > "$TMPDIR/entrust-<id>.out" 2>&1; node … --answer …`. It redirects only the last simple
command, so `vcs status`'s output goes to the wrapper's stdout and the model never sees it.
Check `c2/compose.sh`, with an echo standing in for `--answer`:
- `echo a; echo b`: the file holds only `b`.
- `echo one⏎echo two`: the file holds only `two`.
- `echo hi # note`: the comment swallows the redirect and the `--answer` call. No answer, so the driver
  waits for the 30-minute expiry.
- A heredoc: its terminator line is broken, and the `--answer` call is printed as heredoc body.
- `sleep 0 &`: zsh runs its NULLCMD `cat` on `> file` and blocks on stdin until the Bash ceiling (my run
  was moved to the background at 120 s).
Smallest change: group the command with a newline before the brace, and close stdin:
`{ <command>⏎} > "<out>" 2>&1 < /dev/null; node … --answer <id> --exit $? …`. All six shapes then capture
whole, with the right exit code (`c2/group.sh`). M2 must test this grouped form, because whether
`Bash(vcs status *)` matches a first segment of `{ vcs status` is unknown.

### F1 — The wrapper stops being safe to rerun: double execution, and Stop no longer ends the run (level 2, high)
- `waitingRequests` (agent-run.mjs:642-646) skips a request only when `<id>.decision.json` exists. A tool
  call waiting for its answer is therefore handed back with its RUN block on every `--run`.
- The RUN line has no early return. RETURN_MS (agent-run.mjs:107, 570 s) lives only in `--run`.
- The wrapper's step 2 (codex-agent.md:13-16) says to run "the very same command again" when a result
  was cut.

Scenario A: the model calls `run_as_user` on an `npm ci` or `vcs checkout` that takes 12 minutes. The
harness moves the Bash call to the background at 600 s. Haiku either reruns the RUN line (step 2) or goes
back to `--run`, which hands out the same RUN block again. Either way the command runs a second time,
concurrently, as the user.

Scenario B: the owner presses Stop on the card while the RUN line runs. The shell dies, and `--answer`
never runs. Signal forwarding to the driver exists only inside `--run` (agent-run.mjs:717). The driver
keeps waiting, with the idle guard paused, then expires the call and continues the turn unattended. The
page's promise "Stop on that card reaches the driver" (orchestrate/SKILL.md:106) is false for that window.

Scenario C: the same holds when a headless session continues with a second wrapper (codex/SKILL.md: "a
session with no message tool continues … with a second wrapper"). The second wrapper runs the same line
again.

Today none of this can happen: the escape runs inside the app-server under the detached keeper, and the
wrapper holds nothing. Smallest change: F3, where no relay executes anything. If the wrapper stays the
executor, hand the block out once (a `<id>.handed` link on the first print; later `--run` calls wait for
the answer with their usual signal forwarding and early return). Stop B then still needs a rule for a
handed call whose executor died, which is the start of a crutch.

### F2 — Tool calls in `pending` wake the coordinator in a loop, and `--decide` can wedge them (level 1/2, high)
Design step 4 has `pending` list the tool call. The orchestrate poll (orchestrate/SKILL.md:107) prints
`ASK=<id>` whenever `approvals/pending` is non-empty, and the page tells the coordinator to relaunch the
poll. Relaunched while the wrapper is still executing, the poll fires again at once. That is one wake per
poll cycle until the answer lands, so §3.7's "zero turns per command" inverts.

If the coordinator runs `--decide ID --accept` on the call (decideRequest accepts any pending id), it
publishes `<id>.decision.json`. The driver does not read that for a tool call, and `waitingRequests` now
hides the call from the wrapper, so the call waits out the expiry.

Smallest change: under F3 this is correct behaviour (ASK means "run the line"). Otherwise tool calls
stay out of `pending`, and `--decide` refuses the method.

### F5 — The instruction the design ships is the arm that did not use the tool (level 3, n=1; high for step 2's value)
- The design's sentence (§3.2 step 2) is T1's steering sentence reworded ("use it for" becomes "call it
  with the exact command"). Its "must succeed" clause goes out with the E77 sentence (driver.mjs:4860).
- T1 (steering, no must-succeed): 0 tool calls, 0 escapes (probe/run-t1.txt).
- T4 (must-succeed, no steering): the tool was used (run-t4.txt).
- T1 and T2/T4 also differ in the task prompt: T2/T4 add "a failure report is not an answer"
  (probe/cfg-t*.json). The attribution is confounded.
- The driver keeps "If a command cannot run, record it in one line … then continue" (driver.mjs:4851),
  which the probe also carried (probe-dyn.mjs:153).

T1's model behaved correctly. Its task asked for the output, and the standing rule says record and
continue. The defect is the design's claim. On a T1-shaped task way 2 runs nothing, where way 1 would
still receive the escape: 27 escapes arrived before 0.21.0 without the sentence. "Always declined"
suppressed that escape in T1.

Smallest change: keep a generic success norm, not tool-specific ("a command the task needs that the
sandbox refused is not an answer: run it with run_as_user"), in the tool description or as the standing
sentence, and drop the steering sentence. M5 must measure the shipped instruction set, on a task that
needs the output without saying so, with a way-1 arm. M5 as written re-measures T2 and T4, which do not
ship.

### F3 — The coordinator as executor is simpler, and §3.3's reason against it does not hold for the RUN line (level 2; medium-high, simplicity)
§3.3 rejects the coordinator because the output would enter its context and the gate would see
`node capture-check.mjs -- 'vcs status'`. With the grouped RUN line neither holds:
- The output goes to the file, and the coordinator's Bash result is `--answer`'s one line.
- The gate (the owner's rules, the classifier, the prompt) sees the same first segment as the wrapper's
  call would.

What this removes: the wrapper's new step and refused branch, Haiku's transcription (M1), F1, F2 (the ASK
poll becomes the trigger), the codex-agent.md contract change, and "Do not create or edit files" versus
a redirecting line (F8). The existing hand-back, poll and continue loop stays as it is: `--decide ID
--accept` is replaced by "run the RUN line; if the gate refused, `--answer ID --refused`".

Cost: one coordinator turn per refused command. The corpus has 27 reports with escalations out of 914
(00-escalations.md header), so this is rare. Recommendation: make this step 2, and add the wrapper as
executor only if per-command turns prove costly in use.

### F11 — `--decide` and the coordinator approval rule survive for a request kind never observed (level 3 corpus; medium, simplicity)
After way 2 the escape is declined at once, so `--decide`, the coordinator's half of `--pending` and the
Approvals paragraph serve only file changes outside the roots. The corpus has 0 of 37 such requests: all
10 file changes were into the agent's own `$TMPDIR` and are now auto-answered (brief, lines 53-57). §7.2
leaves this as the owner's call.

Smallest change: decline a file change outside the roots at once, with the reason naming `WRITABLE:`,
and delete `--decide` and the paragraph. Under F3 the coordinator's only action is running the line, so
`--decide` has no use there either.

### F6 — The 30-minute expiry misreports a tool call (level 2, medium)
The deadline was sized for a coordinator decision. For a tool call it covers the owner's prompt time plus
the command's runtime.

Scenario: default mode, and the owner answers the surfaced prompt after 31 minutes, or a build runs 40
minutes. The driver has already told the model "no answer" and settled the entry `expired`. Then the
command runs as the user, `--answer` has no open entry, and RECEIPT says expired for a command that ran.
statusLines exists precisely to say whether a command ran with the user's rights (agent-run.mjs:479).

Smallest change: once a call is handed to an executor, record a late answer as `ran` (late plus
outcome), not dropped. Under F3, keep the expiry for calls not yet run.

### F7 — `cd` plus the redirect forces a dialog, and M3 tests the wrong case (level 1 for the rule, 2 for applicability; medium)
The owner's global CLAUDE.md, Shell section, records that `cd` with an output redirect forces an approval
dialog (`cd-compound-redirect`) while any Read() deny rule exists, and MDM ships 7. Every RUN line has a
redirect. So every call from an agent whose cwd differs from the session's gets a dialog whatever the
owner's rules say. That covers every worktree or write agent, and §7.4 proposes routing their
`git commit` through the tool.

M3 (`cd /tmp && ls`) is the read case. Smallest change: M3 runs the actual grouped line with the cd
inside, from a background subagent. §7.4 waits for its result.

### F8 — The wrapper's own rules forbid what the RUN line does (level 1, medium-low)
codex-agent.md:21-22 says "Do not create or edit files. Do not change any flag, path…". A line that
redirects into `$TMPDIR/entrust-<id>.out` creates a file, and a Haiku obeying its rules may drop or
alter the redirect. That is the "dropped redirect" failure §3.9 lists, with its cause in our own text.
Moot under F3. Otherwise the wrapper file and the message block change together, and M1 covers this.

### F9 — The subtraction list is incomplete, and one item should stay (level 1, medium-low)
Missing from §1's table:
- `codex/references/environment-and-internals.md`: the §"Feature probe, for the widening" section
  (lines 90-110+), and the escalation fields `permissions`, `granted`, `repeatOf` and `sandboxWidened`
  (lines 39-51).
- `codex/references/parity.md:28`: the "permission prompt" row names the widening, and becomes way 2's
  parity claim.
- `orchestrate/references/codex-composition.md:40`: the rights row names "a widening for named paths".

Should stay: `serverWarnings` is not widening-only. driver.mjs:3898-3900 keeps every server `warning` for
the root and subagent threads, and step 2's experimental `dynamicTools` field is exactly what it would
reveal drifting. The suites are also undercounted. protocol.test.mjs has widening blocks at about
718-787 and 1367-1540, some 240 lines, against the "85 matching lines" in the table.

Cleared: switching `experimentalApi` to false does not strip `activePermissionProfile` or
`runtimeWorkspaceRoots` from thread/start on 0.155.1 (`c2/hs.mjs`, level 3), so the driver's assertions
at driver.mjs:2466/2507 hold in step 1.

### F10 — Step 2's size estimate is low (level 2, low)
0.21.0's channel, the calibration, added about 2200 suite lines and about 1370 lines to the driver and
launcher (`git show --stat 9c8a9c9`). Step 2 adds a new server request, a launcher mode, a block, and
settle, expiry and decline semantics. Expect 400-800 suite lines, not about 150. The claimed net of about
−190 is then likely near zero.

### F12 — A refused call is retried re-wrapped, so the owner is asked twice (level 3, low)
In T3 the model called again with `zsh -c '…'` after "a refusal is final" (run-t3.txt). In default mode
the owner answers the same command twice. Open: refuse further `run_as_user` calls in the turn after a
gate refusal, without text matching.

## Measurement plan

| Item | Does it decide what it claims? | What it needs |
|---|---|---|
| M1 | Only the happy path. A random-token line is easier than real commands | Use the corpus's 27 command texts, with their quotes, pipes, `$$` and `\|`. Add the refused branch, a line over 600 s, and Stop mid-line. Moot under F3 |
| M2 | Partly | Run the grouped shape, from a background subagent (its prompts surface in the main session, per code.claude.com sub-agents docs). Record what "don't ask again" writes to the session's rules |
| M3 | No: it tests the read case | See F7 |
| M4 | Open, as the design says | — |
| M5 | No: it measures configurations that will not ship | See F5 |
| M6 | Yes for the path | Add a way-1 arm on the same task |

Before the pages claim anything, also measure:
- a late answer after expiry (F6);
- whether the auto-mode classifier's review of a subagent's final report changes anything for a wrapper
  that ran user commands (docs: "the classifier also reviews its work and its final report").

## What the owner lives with, per mode (compared with a Claude subagent running `vcs status`)

| Mode | Claude subagent | Way 1 | Way 2, wrapper executes (as drawn) | Way 2, coordinator executes (F3) |
|---|---|---|---|---|
| auto | allowed by rule or judged by the classifier; nothing surfaces | a coordinator turn; the classifier sees only an id | the classifier judges the wrapper's compound line; the coordinator is woken by the poll (F2) | a coordinator turn; the classifier judges the command text |
| default | a prompt with `vcs status` if no rule matches | nothing per command | a prompt showing the redirect, the launcher path and `$?`; after 30 min it is misreported (F6) | the same prompt in the main session |
| headless | allowed by rule, or denied | declined by page rule | allowed if both segments match rules; otherwise refused and reported | the same |
