# Defects found and not yet fixed

One entry per defect, with the evidence that establishes it, written so that each can become an issue as
it stands. Found while working on something else; fixing belongs to its own change. Remove an entry when
the fix lands and the changelog names it.

Evidence levels are the ones `plugins/terse` uses: **1** the line resolves, **2** an independent reader of
the code says the same, **3** the behaviour was made to happen.

## codex-delegate

Paths below are relative to `plugins/codex-delegate/` unless a repository, tag or absolute path is explicitly named. V2 adjudication: 2026-09-12, release 0.14.0.

### C1. The clone-and-symlink cleanup recipe depends on a plugin-only root

`skills/cleanup/SKILL.md:29` and `:59` invoke
`${CLAUDE_PLUGIN_ROOT}/skills/seat/scripts/cleanup.mjs`. When the cleanup skill is loaded outside a plugin
and that variable is unset, the shell resolves this to `/skills/seat/scripts/cleanup.mjs`, rather than to
the checkout. The seat recipe uses `${CLAUDE_SKILL_DIR}` (`skills/seat/SKILL.md:80`). The clone route's
empty forwarded data placeholder is documented at `skills/seat/SKILL.md:114-116`; it is a different
placeholder, not a live test of cleanup loading. The shipped README DOES link cleanup (`README.md:89`),
so the unsupported command is part of the advertised clone route. This problem remains after correcting
that route's separate wrong `cd` command (N2). Level 2, verified by source reading on 2026-09-12; a fresh
native Claude Code invocation of the symlinked cleanup skill has not been reproduced by V2.

### C2. Cleanup omits standalone reports and does not surface their retention responsibility

`skills/seat/scripts/cleanup.mjs:846-847` creates no inventory rows for `<state>/reports/` or
`<state>/answers/`. Its `notCovered` inventory (`:874-887`) only searches the temporary directory, so it
also does not direct a caller to these state files. The standalone recipe sends reports to
`<state>/reports/<run>/report.json` (`skills/seat/SKILL.md:99-103`); orchestrate is an explicit exception,
using `<state>/orchestrate/<project-slug>/<run>/<seat>/report.json`
(`skills/orchestrate/SKILL.md:28,103`), inside the run directories cleanup does list.
`skills/seat/references/environment-and-internals.md:132-135` assigns report retention to the caller;
the driver does not prune those standalone reports. Answers have a separate lazy pruner
(`skills/seat/scripts/driver.mjs:2984-2991,3008-3021`) and are not an unbounded-retention claim.
`README.md:109` says cleanup lists what is in the state directory, while `README.md:29-33` defines a
narrower inventory. Measured by V2 on 2026-09-12: with only a seeded standalone report and answer,
`--list --json` returned `rows: []`, both files survived, and `notCovered.count` was 0. Level 3 for that
omission; the issue is the incomplete inventory/retention handoff, not a demand to delete every artifact.

### C4. The comparison table conflates approval policy and sandbox for `codex exec`

`skills/seat/references/why-not-the-plugin.md:69` gives `codex exec` "per-call approval / sandbox: no —
forces `never`". `codex exec --help` (0.153.4) offers `-s, --sandbox <read-only|workspace-write|…>` per
call; what it lacks is a per-call approval policy that survives the managed clamp. The sentence at `:74`,
"the only surface with both per-call rights and a machine-checkable execution signal", stands if "rights"
means both together; the row should say which. Level 2.

### C5. The read-sandbox assertion accepts an additional implicit /tmp grant

`assertReadSandbox` (`skills/seat/scripts/driver.mjs:1991-2018`) verifies profile, type, egress, workspace
and explicit writable roots, but does not inspect the implicit `/tmp` grant described by
`excludeSlashTmp` (`schema-0.153.4/v2/ThreadStartResponse.json:1086-1092`). With `$TMPDIR` outside `/tmp`,
a response whose declared writable roots contain only `$TMPDIR` still passes when `excludeSlashTmp`
is false. That contradicts the shipped assurance that a sandbox mismatch refuses the run
(`README.md:204-205`) and the assertion's own stated boundary (`driver.mjs:1934-1938`).
V2 ran the unchanged assertion body on 2026-09-12: all four boolean combinations of `excludeSlashTmp`
and `excludeTmpdirEnvVar` were accepted; a control with the wrong explicit roots was rejected.
Level 3 for the synthetic acceptance, not for a live sandbox escape. A separate live 0.153.4 handshake
returned a correct read grant with `excludeSlashTmp: true` AND `excludeTmpdirEnvVar: false`; the latter
flag alone is not an additional grant when the same `$TMPDIR` is already allowed. Do not repair this
by blindly requiring both fields to be true.

### C6. `cleanup.mjs` refuses to run when `TMPDIR` is unset, which the driver itself tolerates

`skills/seat/scripts/cleanup.mjs:227-230` dies with "TMPDIR is not set to an absolute path … Nothing was
deleted", while the driver substitutes `<state>/tmp/<runId>` in that case (`driver.mjs:2113-2114`). A
setup the seat supports cannot be cleaned up. Measured 2026-09-12 with `env -u TMPDIR`: exit 2. Level 3.

### C7. The sign-in check and isolated driver can select different credential homes

The README asks users to check `codex login status`, then says credentials are linked from the real
`~/.codex` (`README.md:41-42`). `isolatedHome()` uses the passwd home for both `auth.json` and `sessions`
(`skills/seat/scripts/driver.mjs:1218-1228`), whereas the configuration probe inherits the caller's
`CODEX_HOME` (`:1056-1058`); the actual run receives the isolated home (`:2138,3692-3695`).
A caller whose custom `CODEX_HOME/auth.json` selects a different account is therefore not assured that
the driver uses the account checked by the prerequisite command. V2 observed `codex login status`
reporting “Logged in using ChatGPT” in the default environment and “Not logged in” with an empty custom
home on 2026-09-12. Level 2 for the account-selection defect; spending another account's quota was not
observed, and the live check was not a two-authenticated-account test.

### C8. A pre-thread cut can preserve a worktree without naming it in the report

`skills/seat/SKILL.md:200-204` sends the caller to `worktreePreserved` and `worktreePath`. A pre-turn
report only contains `ok, exitCode, threadId, turnStatus, answer, error, reportPath`
(`skills/seat/scripts/driver.mjs:970-973`). In the exit helper (`:1919-1932`), a worktree is removed only
if no child object was created, git status succeeds and is clean, and git worktree remove succeeds.
Otherwise it is preserved and announced on stderr. The test is the presence of the child object,
not whether its process is still alive; shutdown does not reset it (`:3692,3950-3955`).
V2 reproduced both branches with the released driver in a disposable repository on 2026-09-12: an
invalid extra root before child creation exited 2 and removed the clean tree and ledger; a stalled
app-server stub cut with `--timeout 2` exited 3, preserved the clean tree and ledger, and emitted
“worktree PRESERVED … (run ended before disposition)” only on stderr. Its report still had the seven
pre-turn fields. A report-only caller cannot discover the preserved path and inspect or remove it.
Level 3; the stub exercised startup/teardown, not a paid model turn.

### C9. Help conflates stdout delivery with the pre-turn report file

The exit-code help says “an argument error prints none” and also “like a 2 it then prints no report”
(`skills/seat/scripts/driver.mjs:525-541`). Both are defensible statements about stdout, but the skill
calls `<REPORT>` the report and says it is the same JSON as stdout (`skills/seat/SKILL.md:208-211`).
V2 measured both a missing-state refusal and a plain `--bogus` flag on 2026-09-12: each exited 2 with
empty stdout and a populated fresh `--report-file`, containing `turnStatus: null` and the refusal.
The file is opened before argument parsing (`driver.mjs:2036-2054`) and `preTurnReport` deliberately
publishes refusals there (`:970-973`). Thus narrowing “argument error” to the flag parser does not repair
the wording. Document the two delivery surfaces and their pre-turn exception; report-path validation
itself can fail before a report destination exists (`:925-944`). Level 3. This is separate from R5's
already-corrected claim that exit 2 always means no turn ran.

### R1. A write seat's declared directory does not bound its temporary-directory writes

The rights row promises “write under the live directory” and calls choosing that directory the blast
radius (`skills/seat/SKILL.md:142`; also `README.md:175`). The write setup only sets network access and
explicit extra roots (`skills/seat/scripts/driver.mjs:2171-2174`); it leaves the temporary-directory
exclusions at their false defaults (`schema-0.153.4/v2/ConfigReadResponse.json:990-996`). The assertion
checks explicit roots and workspace, not these implicit grants (`driver.mjs:1977-1988`). V2's live
0.153.4 `thread/start` probe with those write settings on 2026-09-12 returned `writableRoots: []`,
`excludeSlashTmp: false` and `excludeTmpdirEnvVar: false`: the write grant includes `/tmp` and `$TMPDIR`
beyond the named directory. Level 3 for the returned grant; V2 did not run a write outside the named
directory. The earlier audit reports that write at 0.13.0; these setup/assertion mechanisms are unchanged
at 0.14.0. The official-plugin comparison (`skills/seat/references/why-not-the-plugin.md:46-48`)
is background about another plugin, not the evidence establishing this driver's grant.

### R4. The result instructions do not explain declined approvals or their diagnostic limits

`skills/seat/SKILL.md:140` says a write outside the read grant asks approval and the run exits 6.
A refused sandbox operation need not generate an approval request: the driver records `escalations`
only on an inbound approval method (`skills/seat/scripts/driver.mjs:2545-2556`), and the exit-6 rung is
below timeout and other higher-priority outcomes (`:232-248`). Each entry's `detail` is at most 200
characters and can be empty (`:2554`). The published field (`:3436`) is named in none of the README,
three skill pages, six seat references, two help outputs or wrapper instructions (V2 searched all 13
surfaces on 2026-09-12). The timeout hint (`:3473-3479`) does not tell the reader to inspect it.
The release corrected the exit-6 explanation (`:247`) and added a guarded completed-answer notice
(`:2355-2361`), but the old insufficient-sandbox diagnosis remains in comments (`:20-22,2431`).
Document the field, its truncation/absence limits and the distinction between a denied command and a
declined request, including on a cut run. Do not infer that widening rights is the remedy or that work
was lost. Level 2; a V2 synthetic ladder probe also confirmed timeout plus an escalation selects exit 3,
but a live timeout following an approval request was not reproduced.

### N2. The clone recipe changes into the old repository directory

`README.md:84-91` clones `Nowely/agent-skills.git` and then runs `cd codex-delegate`. A fresh clone is
named `agent-skills`; this plugin is under `plugins/codex-delegate`
(repository `.claude-plugin/marketplace.json:16`). The directory change therefore fails on a fresh
installation, and continuing the subsequent `$PWD`-based symlink commands points them at the wrong
directory. Use `cd agent-skills/plugins/codex-delegate`. The old tag cloned `Nowely/codex-delegate.git`
(`codex-delegate@0.13.0:plugins/codex-delegate/README.md:84-85`); 0.14.0 changed the clone URL without
changing the following cd. Level 2, verified from both tags and the current tree on 2026-09-12; V2 did
not clone over the network. This is independent of the cleanup placeholder problem C1.

### N5. The wrapper treats an existing report as this invocation's result

The wrapper's fixed loop tests report existence before checking driver liveness, then reads that file's
exit code and answer (`skills/seat/SKILL.md:84,92-95`). If a retry accidentally reuses a previous report
path, the driver refuses it before assigning `reportFilePath` (`skills/seat/scripts/driver.mjs:940-944`)
and before printing its pid (`:3749-3755`). V2 ran those exact wrapper shell commands against a seeded
previous report on 2026-09-12: the new driver exited 2 without writing a report; the loop printed
`WAIT_DONE=report`, and the read command printed `EXIT=0` and `FIRST=PREVIOUS RUN ANSWER`.
Level 3 for the deterministic command protocol. This violates the recipe's fresh-path precondition
(`skills/seat/SKILL.md:101,214-216`), so it is a recovery robustness defect, not every correct continuation's outcome.
The coordinator CAN inspect stderr (`:208-211`); the fixed wrapper does not perform or relay that check.
Correlate the result to the current invocation before presenting its predecessor's evidence.

### N6. The wrapper cannot finish when startup fails before both report and pid

Report-path validation precedes pid publication (`skills/seat/scripts/driver.mjs:925-944,2036-2042,
3749-3755`). On a validation refusal there may be neither a report nor a pid line. The wrapper's loop
only exits when a report appears or a non-empty pid disappears (`skills/seat/SKILL.md:84`), and
`:86-88` mandates repeating the wait after each tool timeout without ending the turn.
V2 reproduced this with a fresh report path under a mode-0500 parent on 2026-09-12: the driver exited 2
with EACCES and no pid or report, while the unmodified wait command produced no WAIT_DONE line through
six seconds and was stopped by the probe watchdog. Under those fixed inputs the loop has no terminal
branch; no infinite wall-clock run is claimed. Level 3 for the shell protocol, not a live Haiku/UI test.
Give startup failure a terminal signal independent of report creation and the driver's stderr pid.
