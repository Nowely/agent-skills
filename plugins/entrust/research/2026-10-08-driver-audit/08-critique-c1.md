# Critique, round 1: the proposal against the code

Critic of [07-proposal.md](07-proposal.md), at `c67f4e6`. Read: 00–07, the drivers, the launcher, `drivers.mjs`,
`temp-dir.mjs`, `agents/proxy.md`, the Codex incidents, CHANGELOG, ISSUES. Runs were offline, on the suites' fakes
and plain git, with scratch under `/tmp/critic-c1/` (scripts in `/tmp/critic-c1/scripts/`). No real `codex`,
`opencode` or `claude` was started. Line numbers are the file's own. `07:n` and `06:n` are lines of this
directory's files.

## Verdict

The direction is right, and most of the evidence holds. A shared call page, one `RESUME:` form, the adapter taken
from the plan row, the defects in step 1 and the cuts of water are well founded, and every defect I re-ran
reproduced. Four recommendations should not reach the owner as written. Each either loses a protection or rests on
a premise the code contradicts:

- **The lock.** The recommended lock (2b) leaves X5 open, though 07:28 says steps 2 and 4 close it.
- **Resume rights.** "A continuation declares its rights like any run" is not what OpenCode or Claude enforce on a
  resume. In Claude it moves a write grant onto a directory nobody checked.
- **The budget.** "One budget" drops the volume bound the Codex default relies on. Together with step 1's fix for
  X13, it leaves OpenCode and Claude agents with no upper bound at all.
- **`--verify`.** Wiring it rests on "the one gate the model cannot author". For a write agent that is false, and
  the verifier would run agent-written code with the user's rights, outside the host's permission checks.

Seven more findings are major: changes that do less than claimed, or that conflict with something kept, or a
defect claimed closed that is not. With those four corrected and X5 moved into step 1, the proposal can go to the
owner. The unification also needs a true list of what a coordinator must still know per adapter (finding 10).

## Findings

### 1. The recommended lock leaves X5 open, and its closure is claimed anyway (blocking)

- **Concerns.** Decision 2 (07:82-85) and the sentence "X5 (the state root follows `$TMPDIR`) … closed by steps
  2 and 4" (07:28).
- **Evidence.**
  - D's lock keeps its files in `<state>/locks/<hash>.<random>.json` (05-audit-rights.md:102). `<state>` is
    `stateDirectory(root = os.tmpdir())` (temp-dir.mjs:91-97), the very anchor X5 is about. Only option (a)
    mentions moving the anchor. The recommended (b) does not.
  - I re-ran A's reproduction on `fake-app-server.mjs`. Two writers with the same `TMPDIR`: the second exits 10
    ("is in use by entrust pid …"). Two writers with different `TMPDIR` values: both run to their idle cut (exit 3,
    exit 3), in one directory at once.
  - X5's second half is that a write grant can reach another session's state directory. Step 1's `checkWriteRoots`
    does not touch it: it compares a root with the driver's own state directory, and that is the one `TMPDIR`
    chose.
  - This repeats a recorded incident. "State split the lock: two state roots derived from two `HOME` values
    produced two locks and simultaneous writers" (codex/references/incidents.md:204-207). The driver's own comment
    still says `$TMPDIR` was rejected as the anchor for this reason (codex/scripts/driver.mjs:1107-1115).
- **The anchor is not a one-line fix.** A's sketch uses "/tmp on Linux" (02:448-450). But an entrust Codex agent's
  sandbox writes `$TMPDIR` and not `/tmp` ("`$TMPDIR` is granted at every level and `/tmp` at none",
  CHANGELOG.md:1626). A coordinator that is itself such an agent could then not make its state directory.
- **Instead.**
  1. Take X5 out of decision 2 and give it its own small design in step 1, whichever lock is chosen.
  2. At least pin the state directory `--new` validated: record the resolved state directory in `backend.json`
     and hand it to the keeper and the driver as `ENTRUST_STATE_DIR`. That closes the split within one launch
     (finding 14).
  3. For writers in different sessions, either anchor on a path every host can write, or state plainly that
     writers must share a `TMPDIR`, which is A's fallback.
  4. Do not tell the owner X5 is closed until one of these lands.

### 2. "Declares its rights like any run" is not what two of the three CLIs enforce on a resume (blocking)

- **Concerns.** The `RESUME:` row (07:38), D's drop of the no-widen check, and 06:50-52.
- **Evidence for OpenCode.** It sets permission rules only when it creates a session (`sessionPermissions(ctx.scope)`
  in `POST /session`, opencode/scripts/driver.mjs:988-991), and a resume reuses the session without sending them
  again. I ran this on `fakeOpenCode("normal")` (`scripts/oc-resume.mjs`):
  - Run 1, `RIGHTS: write <cwd>`, then run 2, `RESUME:` of it with `RIGHTS: read <cwd>`. Run 2 exits 0 and its
    report says `rights: {kind: read}`. The session on the server still holds `edit <cwd>/** allow` and
    `write <cwd>/** allow`, and only one `POST /session` was made.
  - So a narrowed resume is not enforced today. This is a new defect, **N1**, which no auditor found:
    `scopeWithin` lets every `read` through (drivers.mjs:118).
  - The reverse direction, read then a resume with write, is refused today: "the requested RIGHTS widen the scope
    recorded for the resumed session" (driver.mjs:947, exit 2). Under the proposal it would pass, the report would
    claim write, and the server would still deny every edit.
- **Evidence for Claude.** A resume runs in `prior.cwd` with `prior.rights` (claude/scripts/driver.mjs:146-149), and
  the kind check refuses a change of kind (`:129-130`). Under the proposal the kind check goes, while "a
  continuation keeps its directory".
  - Take `RIGHTS: read $HOME` (a read directory is never checked against home or the state directory), then a
    resume with `RIGHTS: write /proj`.
  - The resume runs `--permission-mode acceptEdits` in `$HOME` (`:180`). That auto-approves edits in the working
    directory: `$HOME`.
  - `checkWriteRoots` checks `/proj`, the root as declared. Nothing checks `$HOME`, the root as enforced.
- **Instead.** One rule that all three CLIs can enforce: **a continuation keeps its rights**. A `RIGHTS:` line on a
  resume is either absent or equal to the session's, and the plan pin stays as it is.
  - Codex then gives up its per-call widening (incidents.md:194-197), the opposite of 07. That is what C asked for
    (04:137-139).
  - The step-4 effect check, "OpenCode the session rules read back" (07:63), should also run on a resume and refuse
    a mismatch. That closes N1. Add N1 to `ISSUES.md`.

### 3. "One budget" removes the volume bound, and with the X13 fix leaves two adapters unbounded (blocking)

- **Concerns.** The one-budget row (07:39), step 3's deletion of `--max-commands` (07:53), and step 1's X13 fix
  (07:24).
- **What the Codex default really is.** "What bounds an agent whose caller sized nothing: silence, then volume.
  Neither is a wall clock" (codex/scripts/driver.mjs:77-79). The volume part is `DEFAULT_MAX_COMMANDS: 1000`. It is
  on by default under the launcher (`:842`) and cuts the turn at `:3461-3462`.
  - C's table describes Codex as "none; idle 900 s" (04:52), and 07 copies the omission into its one rule.
  - Step 3 lists `--max-commands` among the "unreachable" flags. For OpenCode that is true (default 0,
    opencode/scripts/driver.mjs:70). For Codex the flag is unreachable, but the bound it sets fires on every run.
- **Claude.** Its only bound is the 1,800 s wall clock (claude/scripts/driver.mjs:30). If an idle bound replaces it,
  an agent that keeps calling tools never ends.
- **OpenCode.** Step 1 counts "a busy owned session as progress". B priced that change on the wall clock remaining:
  "A server hung while busy holds for 30 minutes instead of 10" (03:245). Step 2 then removes the wall clock, and
  OpenCode has no volume bound. A session the server reports busy forever runs forever. The relay reruns it every
  570 s, a Haiku turn each time.
- **Instead.** One budget made of three parts, stated once:
  - an idle bound that pauses while a request waits;
  - a volume bound in every adapter: commands for Codex, tool calls or `--max-turns` for Claude, tool parts for
    OpenCode;
  - a long wall-clock backstop that pauses during approval waits, measured in hours. "Five of seven lost to the
    wall clock" was a 540 s wrapper ceiling (incidents.md:261-267), not a backstop of that size.

  Keep Claude's wall clock until its replacement is measured. Keep Codex's `--max-commands` default; delete only
  the flag, if anything.

### 4. Wiring `--verify` rests on a false premise and adds unsandboxed execution of agent-written code (blocking)

- **Concerns.** Decision 3 (07:86-88): "wire it as `--run --verify <cmd>` … it is the one gate the model cannot
  author".
- **Evidence.**
  - The driver says the opposite of safe. "VERIFY runs an unsandboxed shell with your own rights"
    (codex/scripts/driver.mjs:779). `--verify-sandboxed` is opt-in and Codex-only (`:451`, `:2598-2603`).
  - After a write or worktree turn, the coordinator's command (`npm test`, `make`, `node --test`) runs what the agent
    wrote: tests, package scripts, Makefiles. So the model authors much of what the gate executes. That also lets it
    pass the gate by editing the test.
  - It runs in the keeper, outside the host's own permission checks and sandbox, before anyone reads the report.
    Today a coordinator that verifies does it through its own Bash tool, after reading.
  - It changes the launcher's driver contract, which passes exactly `--prompt-file`, `--report-file` and
    `[--approval-dir]` (orchestrate/scripts/agent-run.mjs:454). 07 does not say so, against the brief's constraint
    (00:25-27).
  - `--run` is rerun by the relay and launches only on a fresh directory, so the command would have to be recorded
    at `--new`, not passed at `--run`.
  - Claude has no verifier, so the gate would differ by adapter, against ask 2.
- **Instead.** Recommend deleting it with the other unreachable flags. If the owner wants it, wire it only
  sandboxed, record it at `--new` in `backend.json`, and say which adapters have it.

### 5. Offering out-of-root file writes does nothing usable for Codex and offers writes into the mailbox (major)

- **Concerns.** The step-4 row "File writes outside the roots are offered like commands" (07:62).
- **Evidence.**
  - A Codex file-change request carries no `command`. The request record is the server's params plus `fileChanges`
    (codex/scripts/driver.mjs:3109-3113). `--pending` prints an empty `COMMAND` block, without even the paths, and
    `--decide --accept` refuses it: "the request carries no command to restate" (agent-run.mjs:764).
  - I ran it on a hand-made mailbox (`/tmp/critic-c1/fc.*`): `COMMAND<<…` followed by an empty line, then
    `REFUSED=1-abcdef01 … decline it with --decline`, exit 2. So for Codex the change only adds a request that can
    be declined and nothing else: a pause, since the idle guard waits while a request is open, and a coordinator
    turn.
  - Making it acceptable would need a typed request carrying the diff. An accepted patch is then written by the
    server outside the sandbox, which D's own ledger notes (05:51). That costs more code, not the −35 lines 07
    counts.
  - In OpenCode the auto-decline (`outOfScope`, opencode/scripts/driver.mjs:217-230) also refuses edits aimed at
    the state directory and its mailboxes. Offered instead, those reach a coordinator as a question it can get
    wrong.
- **Instead.**
  - Keep Codex's auto-decline (`OUTSIDE_WHY`, codex/scripts/driver.mjs:3043).
  - Offer out-of-root edits only where the typed body carries the payload: OpenCode, and Claude, which already does.
  - In all three, still decline at once any target inside the state directory or the protected set of finding 8.

### 6. Dropping the no-command gate leaves "evidence attribution", kept on purpose, with almost nothing to feed (major)

- **Concerns.** Decision 6 (07:92-94) against "Kept on purpose: … Codex's … evidence attribution" (07:100-103).
- **Evidence.**
  - Attribution by root thread and owned turn exists so that "no child, stale turn or earlier resumed turn can
    satisfy a gate" (02:373-377). With no implicit gate, it serves only `EXPECT:`, which no template uses: the only
    page mention is codex/SKILL.md:109.
  - The Codex gate also says something the other gates do not. A root that handed all its work to Codex sub-threads
    exits 5, "liveness, not evidence" (CHANGELOG.md:2190-2196). For a Codex agent, which reads files only through
    commands, no command means it looked at nothing.
  - OpenCode's false positive (X7) arises because the gate counts bash alone (contract.mjs:246), while its read,
    grep and glob tools run without asking.
- **Instead.** Use one rule that all three can implement: **a turn that observed nothing fails unless
  `ALLOW_NO_COMMANDS: yes`**, where an observation is a command or a read tool. That fixes OpenCode's false
  positive, gives Claude the gate its tool events already allow, and keeps a consumer for attribution. If the owner
  drops the gate anyway, say that attribution then guards only `EXPECT:` and is a candidate for step 3.

### 7. X7 is claimed closed, and its exit-7 half stays open (major)

- **Concerns.** 07:28 ("X6–X9 … closed by steps 2 and 4") and decision 6.
- **Evidence.**
  - X7 has two halves (06:29). Decision 6 removes the exit 5.
  - The other half comes from OpenCode's `bash: ask` on every command (opencode/scripts/driver.mjs:198) and from a
    run with no mailbox declining every request. An unattended OpenCode worker therefore exits 7 on its first
    command (B's run, 03:516-518).
  - The swarm has no mailbox, and it documents OpenCode batches (swarm/SKILL.md:13, :17).
  - B's remedy was to measure an allowed read-only command set (03:222-223). Neither 06 nor 07 carries it.
- **Instead.** Keep X7 open in `ISSUES.md` under its exit-7 half, and add B's measurement to step 5. Until then,
  the swarm page should say that an OpenCode worker cannot run commands.

### 8. The shared root check protects Codex's own trust anchors only; OpenCode and Claude have the same ones (major)

- **Concerns.** Step 1's `checkWriteRoots(..., protected)` (07:18) and step 4's "one model for three adapters".
- **Evidence.**
  - Codex refuses a root that is or holds `~/.codex` (codex/scripts/driver.mjs:1077-1080). Its sandbox also keeps
    `.git`, `.codex` and `.agents` read-only inside every writable root (`GUARDED_NAMES`, `:3039`, and the comment
    at `:3035-3036`).
  - The proposal fills the protected list for Codex alone. Equivalent directories exist for the other two:
    - Claude: `~/.claude` (settings and hooks, and the plugin install holding the launcher and these drivers);
    - OpenCode: `~/.config/opencode` and `~/.local/share/opencode` (config, plugins, credentials);
    - inside a root: `.opencode/` and `opencode.json`.
  - OpenCode's write rules allow `edit` and `write` on `<root>/**` with no exception (opencode/scripts/driver.mjs:207-210).
    By those rules, an OpenCode write or worktree agent may write `<root>/.git`: hooks, config, or a worktree's
    gitlink file.
  - Plain git, run here, follows an agent-written gitlink. With `<wt>/.git` rewritten to `gitdir: <wt>/.fakegit`,
    `git -C <wt> rev-parse --git-dir` printed `<wt>/.fakegit`, and `git diff` reported whatever that repository
    said. Everything the driver and the coordinator later run with git in that tree then reads config and hooks
    the agent chose. Codex's sandbox prevents this for Codex agents.
  - Claude Code's own protected paths may cover `.git` and `.claude` under `acceptEdits` (05:70). That is
    unmeasured here.
- **The wording is also wrong.** "No write root may be, contain or lie inside … `$HOME` or an ancestor of it"
  (07:18), read literally, refuses every project under the home directory. Codex refuses the home and its
  ancestors only (`:1058-1067`).
- **Instead.**
  - Give each adapter its protected list.
  - Add OpenCode deny rules for `<root>/.git`, `<root>/**/.git/**` and `<root>/.opencode/**`, placed after the
    allows, since the last match wins.
  - Have the shared `git()` name the worktree's real gitdir (`--git-dir`, `--work-tree`) instead of trusting the
    gitlink.
  - Spell the home rule out: equal to `$HOME` or an ancestor of it; equal to, containing or inside the state
    directory or a protected directory.

### 9. Option (b) has design gaps beyond the anchor; a cheaper path gives most of its gain (major)

- **Concerns.** Decision 2(b) (07:84-85).
- **Evidence.**
  - D's lock compares roots by "either contains the other" (05:104-105). Unless that is an inode walk, it reopens
    the alias class measured in "Protected-root aliases": "a `~/.CODEX` spelling defeated a string-prefix guard"
    (incidents.md:229-232). Today's lock keys on dev:ino (02:192-194).
  - A holder file that is created and then written can be read half-written. Treated as dead and unlinked, it lets
    two writers in. It must be published whole by link(2), as the rest of the code does. D's sketch does not say
    so.
  - `cleanup.mjs` imports four lock predicates from the Codex driver (cleanup/scripts/cleanup.mjs:10).
  - The lock suite ran 67 of 73 here. The 6 failures are the process-group sweep cases the changelogs record as
    failing as root in a container. So "its own cases written before the Codex lock goes" needs CI, not a local
    run.
  - About 50 lines leaves out the identity and process-group liveness helpers it needs, which now live in the
    Codex driver.
- **Instead.**
  1. In step 1, the X5 anchor (finding 1).
  2. A's 5(c), about 20 lines in the launcher: `--plan` and `--new` refuse overlapping write rows. That covers all
     three adapters under a plan, before any token.
  3. Keep the Codex lock for runs with no plan.
  4. Take up (b) only once its cases exist and pass in CI, with the inode containment and the whole-file
     publication written into its specification.

### 10. The one call shape unifies the call; what comes back still differs, and 07 understates it (major)

- **Concerns.** The "What the coordinator must know per adapter" row (07:113): "models and efforts, extra fields,
  composition". That covers the call, not what it returns or how to decide on it.
- **What a coordinator still has to know per adapter**, beyond models, efforts and extra fields:
  1. Without a plan, it must still name the adapter with `--adapter`.
  2. What a read agent does without asking:
     - Codex runs any command inside its sandbox, network included;
     - OpenCode asks for every bash command, so it has many requests and none when unattended (finding 7);
     - Claude runs a read-only set, plus whatever the user's allow rules admit.
  3. The request kinds and how to answer each:
     - command blocks;
     - `opencode.permission` and `opencode.question` (`--answer`);
     - `claude.permission`;
     - Codex file changes, which can only be declined (finding 5).
  4. Resume: what carries over (finding 2).
  5. Worktree location and report fields: a ledgered tree under the project for Codex, `<state>/worktrees` and an
     inline diff for the others (04:55; E139).
  6. The evidence gates: `EXPECT:` exists in Codex and OpenCode only, and `VERIFY` in Codex only.
  7. The exit codes each can return (Claude has no 5, 9 or 12).
  8. Egress (finding 17), and the write lock (Codex only, unless 2b).
- **Instead.** Put this list on the shared page. Without it, a coordinator that "ignores which adapter it calls" will
  misread an OpenCode request flood, a Codex file-change block or a Claude resume. Items 2, 3, 4 and 6 can be made
  equal by the fixes above. The rest are real differences that the page should state.

### 11. The relay: keep it dumb, but printing its message from `--new` costs a turn, and the other proxy is not dumb (major)

**Concerns.** Decision 7 and the `--new` row (07:36, 07:95-96).

**The other side, argued.** The case for the relay reading the adapter's skill:

- It would take the per-adapter call knowledge out of the coordinator's context.
- The relay could check a prompt before running it.
- On Codex and OpenCode hosts the proxy already decides requests, so it already needs adapter knowledge.

**Weighed against the evidence:**

- The first is mostly removed by step 2's page, about 900 words.
- The second is done better, offline, by `--new`'s check, before any relay exists (agent-run.mjs:648-664).
- Against both: a small model given rules is the recorded failure. Haiku created a directory and ran under rights
  nobody granted (incidents.md:73-78), and it paraphrased steps it held only in its file (`:286-292`).
- So I agree with C for the Claude Code relay: keep it on Haiku, with Bash only, reading no skill.

**What 07 misses:**

- **The two-turn cost.** Today `--new` and the Agent call "may go in one turn" (codex/SKILL.md:199). If the message
  comes from `--new`'s output, the coordinator must wait for it: two turns per launch. A fan-out can batch them, but
  it still takes two turns.
- **The description.** `--new` does not know the Agent call's `<DESCRIPTION>`, which steps 1 and 4 of the message
  carry. It needs a flag, or a placeholder is left, which defeats "nothing to fill by hand".
- **A cheaper fix for X16.** Keep the block as a constant on the shared page, and have a test compare it with the
  body of `agents/proxy.md`.
- **The proxy on other hosts.** The operational proxy on Codex and OpenCode hosts decides covered requests itself,
  following "the adapter's request procedure", with links to all three adapters' pages
  (orchestrate/references/proxy.md:13-18). That proxy does read adapter pages today. Decision 7 should say that it
  moves to step 4's one approvals section, and that it is the one proxy whose knowledge matters.

### 12. X10's "one line" breaks every OpenCode and Claude worktree diff (minor)

- **Concerns.** The step-1 row "`GIT_SAFE` in the shared `git()` | 1" (07:22).
- **Evidence.**
  - On git 2.43, run here, `git -c diff.external= diff HEAD` (one of `GIT_SAFE`'s three overrides) fails:
    "error: cannot run : No such file or directory / fatal: external diff died", exit 128.
  - With `--no-ext-diff --no-textconv` it exits 0. That is why Codex pairs `GIT_SAFE` with `GIT_DIFF_SAFE`
    (codex/scripts/driver.mjs:1872-1875).
  - Added alone, it makes `worktreeFacts` publish `diff: null` (drivers.mjs:147, :154). `claude.test.mjs:166` would
    catch it for Claude. No OpenCode worktree pin would.
- **Instead.** `GIT_SAFE` on `git()` and `GIT_DIFF_SAFE` on its diff, plus finding 8's gitdir pin.

### 13. X1's evidence omits Codex, and the "refusals before any relay" strength is overstated for it (minor)

- **Concerns.** 06:23 and 06:61.
- **Evidence.** Codex's `--check-prompt-file` passes `RIGHTS: write <R>` with the state directory at `<R>/state`
  (exit 0, run). The same prompt is refused only at run time, after the pid line: "it is an ancestor of this
  driver's state directory" (exit 2, run).
- **Instead.** Step 1's `checkWriteRoots` at `--check-prompt-file` fixes it. 06 should say that all three drivers
  need it at check time, not only OpenCode.

### 14. X4 has a twin: the driver's environment also comes from the relay (minor)

- **Concerns.** The step-1 X4 row (07:21).
- **Evidence.** `spawnDetached` passes `env: process.env` (agent-run.mjs:408), which is the `--run` caller's
  environment, the relay's. `backend.json` records only the plan's model and writes (`:110-114`).
  - So `ENTRUST_STATE_DIR` and `TMPDIR`, which decide the state directory, the protected-root check and Claude's
    mailbox deny rules (claude/scripts/driver.mjs:168-174), may differ from those `--new` validated.
  - This is unmeasured on a host, like X4.
- **Instead.** Record the resolved state directory with the working directory at `--new`, and pass both. This is
  also the in-launch half of finding 1.

### 15. Step 3's field cuts collide with step 2's report core (minor)

- **Concerns.** The step-3 report row (07:49) against the step-2 core (07:40).
- **Evidence.**
  - A's "echoes" include `cwd` and `resumedFrom` (02:166-167). `cwd` is one of the 14 shared fields, and C's core
    keeps it (04:399-400).
  - A's worktree extras include `worktreeRepo` and `worktreeBase`, which the shared `worktreeFacts` emits for the
    other two (drivers.mjs:150-153).
  - The Codex report would add `usage`, while prepare-feedback reads `tokenUsage` (prepare-feedback.mjs:582).
- **Instead.** Fix the core first, and filter step 3's list against it. Keep `tokenUsage` beside `usage`, or move
  its reader.

### 16. "Unreachable" is true of the launcher, not of the suites or of a capability (minor)

- **Concerns.** The step-3 row of unreachable flags (07:53).
- **Evidence.**
  - Counted with grep over `evals/`: `--timeout` appears 45 times in 10 suites, `--verify` 52 times in 5,
    `--max-commands` 10 times, `--host-home` 8 times. The suites use these flags as their hermetic bounds.
  - `--host-home` is also the only route to the caller's MCP servers: "an agent that needs those servers runs
    `--host-home`" (incidents.md:234-238).
- **Instead.** Size the eval rework. Present `--host-home` as a decision ("Codex agents get no MCP servers"), not as
  dead code. Keep the Codex `--max-commands` default (finding 3).

### 17. The egress decision has two unmeasured premises (minor)

- **Concerns.** Decision 1 (07:78-81).
- **Evidence.**
  - "A command that needs the network asks" is unmeasured for Codex. A command the sandbox stops leaves no trace
    and raises no request unless the model asks for escalation (codex/scripts/driver.mjs:3380-3381).
  - "The only one that bypasses the mailbox" holds for Codex's defaults only. A Claude read agent also skips the
    mailbox when the user's allow rules cover `curl` or `gh` (claude/references/external.md:34-38).
  - `WEB_SEARCH` sends query text out too.
- **Instead.** Say both. Cover `WEB_SEARCH` with the same right. Add one Codex measurement to step 5: does a
  network-denied command raise a request?

### 18. Order (minor)

- **Concerns.** The step order (07:3-5).
- **Evidence.**
  - Step 3 cuts lock comments (A counts about 50 in its finding 3), and step 4 may then delete the lock.
  - Step 1 fixes X3 in two writers that step 4 then replaces.
  - X6 (`RESUME: last` across workers, level 3) waits for step 2, though refusing `last` is one line.
- **Instead.**
  - Decide 2 before step 3.
  - Write the X3 cases so that they become the mailbox module's acceptance cases.
  - Move the `last` refusal and the X5 anchor into step 1.

### 19. Moving `v2-pilot.md` does not remove the endpoint (minor)

- **Concerns.** X18 (07:26).
- **Evidence.** The corporate endpoint is at opencode/references/v2-pilot.md:18 and is in the repository's history.
- **Instead.** Moving and redacting the file ends its shipping. Whether the history matters is the owner's call,
  and 07 should name it.

## Checked and found sound

- **Re-run as stated.**
  - X1: OpenCode exit 0, Claude exit 2.
  - X2: `WRITABLE:` exit 0 under a plan; `RIGHTS: write B` exit 2.
  - X5: the TMPDIR split.
  - X8: Codex `RESUME: /abs/report.json` exit 0.
- **Read as stated.**
  - X3 (approvals.mjs:69, then the allow at `:96`; OpenCode responds before `settleRequestFile`).
  - X4 (agent-run.mjs:408, :454).
  - X10 (drivers.mjs:124-127).
  - X11 (`INHERITED`, codex/scripts/driver.mjs:1258).
  - X7's exit 5 (contract.mjs:246, and the template at opencode/SKILL.md:59-64).
  - X15 (main-proxy.md:96).
  - X16 (agents/proxy.md:8, :18-19 against codex/SKILL.md:195).
  - X18.
- **Suites, offline, on the fakes.** `agent-run` 55/55, `claude` 19/19 (1 live case skipped), `agent-contract`
  13/13, `opencode` 82/82, `lock` 67/73. The lock failures are the 6 process-group sweep cases already recorded as
  failing as root in a container.
- **Dropping the Codex mailbox owner claim.** It is sound for every supported caller:
  - the launcher claims `err.txt` exclusively (agent-run.mjs:433);
  - `--new` refuses a second prompt in a directory;
  - `--run` refuses a directory whose run is for another report path;
  - swarm and `attach-pasted.mjs` pass no mailbox.

  Say that the 10 references to `owner.json` in `evals/` move.
- **Other changes found sound.**
  - `checkWriteRoots` at check time and at launch, as the shape of the X1 fix (with finding 8's list).
  - Refusing `WRITABLE:` under a plan (X2).
  - `--new` taking the adapter from the plan row, with the entry scripts kept as aliases.
  - `RESUME: <report path>` as the one form (the form is right; the rights rule is finding 2).
  - The Agent description; `yes`, `true` and `1`; the five-field default, whose risk is stated.
  - Recording before answering in every mailbox writer.
  - V2 to `research/` (decision 4).
  - The Codex comment and `HELP` cuts (with finding 18's order).
  - Keeping the Claude Code relay on Haiku and reading no skill.
