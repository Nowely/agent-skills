# Defects found in passing: entrust

Recorded per the repository rule: evidence at file:line, an evidence level (1: the line resolves; 2: an
independent reader of the code would say the same; 3: the behaviour was made to happen), and wording that
can become an issue unchanged. An entry leaves when its fix lands and the changelog names it. Ids are
shared with terse's ledger, `plugins/terse/ISSUES.md`, so one id names one entry in both. A path
pinned to a commit is that commit's address, with today's beside it.

## E120. OpenCode reports in one directory overwrite earlier answer and transcript artifacts

**Evidence, level 3. Pre-existing.**

`plugin/skills/opencode/scripts/driver.mjs:956-957` places runtime and transcript artifacts beside the
report under fixed names; `:1277` does the same for `answer.txt`. Distinct report files and agent
directories in one parent therefore share those sidecar paths. A live continuation with two reports
observed the same answerPath, transcriptPath and runtimePath: the answer file matched the newer
answerJson and no longer matched the earlier report. Both report payloads retained their own answerJson.
The same path construction exists in main. Historical artifact links can return a later invocation's
data; record this producer defect separately from the new agent-order loop.

## E67. A command run after an approval, outside the sandbox, is not established to end when its agent is stopped

**Evidence, level 3 for the sandboxed case (measured), level 1 for the escaped case (unmeasured).**

- 2026-09-29, measured once: `/bin/zsh -c 'sleep 913 && echo done-913'` run inside the sandbox, in its own process
  group; `SIGTERM` to the driver's pid; neither the shell nor `sleep` alive 10 s later. `driver.mjs:2676-2681`
  records it in the comment above `killGroupOf`/`killGroup`, and
  `plugins/entrust/plugin/skills/codex/references/environment-and-internals.md:251-252` says so: "A command the
  agent was running inside the sandbox ends with it (measured once, 2026-09-29)".
- The same sentence continues, `:252-253`: "a command run after an approval, outside the sandbox, has not been
  measured", and the reference keeps the manual step for it: before a second writer enters a directory where a
  command was approved, run `pgrep -fl '<the approved command>'` yourself and wait for it
  (`codex/references/environment-and-internals.md:253-254`);
  `orchestrate/references/results.md:16` carries the same check in its Result table's `exitCode: 10` row.
- An accepted command runs as the user, with no sandbox (the codex page's Rights section); whether the driver's
  `SIGTERM` to its own pid reaches a process running outside any sandbox that would otherwise bound it is what
  remains unmeasured.

**Check.** Run a live turn through an accepted command that sleeps well past the turn's own signal, `SIGTERM` the
driver, and `pgrep` for the sleep 10 s later: alive settles the question either way; the probe above measured only
the sandboxed case.

**Issue text.** The one case now measured, a command still executing inside the sandbox when the driver is
`SIGTERM`'d, dies with it. The other case the page has always hedged on, a command that ran after the user
accepted it and so runs outside the sandbox as the user, is still unmeasured: an accepted command could be a
long-running process the signal never reaches. The manual `pgrep` step before a second writer touches the same
directory stays for this reason, and should stay until that case is measured too.

## E110. E59's fix dropped the live gate's check of worker briefs against the split's owners, and a shell write of the shared file is invisible to it

**Evidence, level 2.** `plugins/entrust/evals/lib/gate-checks.mjs` has no `parseSplit` or `ownsPath` function, and no
test names "the corrected split is read: an interface it omits, one its owner's brief omits, and a file a brief
takes from its owner are each red" (`grep -rn` over `evals/*.mjs` finds none). `splitAdmissionProblems`
(`gate-checks.mjs:391-417`) only checks that the split critic named a file, that each worker brief names that
file's path, that the file opens, and counts the shared file's writers from `writesSeen` (`:327-339`), which reads
only Write/Edit/NotebookEdit/MultiEdit calls and a Codex report's `filesTouched`; its own comment (`:326`) says "A
write made through a shell command is not visible here." The orchestrate page still asks the coordinator to check
each brief against the file's owners (`orchestrate/SKILL.md:84`: "before a worker launches you check the files
and interfaces its brief touches against the file's owners"), with no test behind that instruction now. Found by
Fable H1.

**Check.** `grep -n 'parseSplit\|ownsPath' plugins/entrust/evals/lib/gate-checks.mjs` finds nothing; reading
`splitAdmissionProblems` (`:391-417`) shows no check of a brief's claimed files or interfaces against the split
file's contents, only that the brief names the split file's path. A worker whose write ran through `sed -i` leaves
`filesTouched` and every Write/Edit call empty, so `writesSeen` returns no writer for it and
`splitAdmissionProblems` reports "0 agents wrote lib/shared.mjs" on a correct run.

**Issue text.** E59 replaced the free-text split and ownership readers, which misread a Codex critic's own report
as the split and a quoted request as ownership, with a narrower check that only confirms a file exists and is
named; it never restored a check of what each brief claims against what the split file says an owner should touch,
and it counts a file's writers only from tool calls and `filesTouched`, so a worker that writes through a shell
command is invisible to the count. The gate should read the split file's own owner and interface list and compare
each brief against it, and count a shell write that names the shared file among the writers.

## E90. The swarm, the bulk row's batch route, is called an experiment, holds fifty units at most, and reports no tokens

**Evidence, level 1 for the lines, level 3 for the refused registration.**

- `plugins/entrust/plugin/README.md:51` introduces it with "Two more are experiments with a page of their own."
- `swarm/scripts/swarm.mjs:30` `const MAX = 50;` and `:84` refuses a longer unit file: "a swarm is 50 at most".
  A batch wider than fifty units takes several swarms.
- `swarm.mjs:113-117` and `:150`: the summary holds per agent its number, unit, report path, the launcher's status
  lines and times, and no tokens, which the plan's re-estimate and per-agent stop line
  (`orchestrate/references/plan.md:19`) read; each report has to be opened for them.
- A swarm's agent ids are `001` to `050` (`swarm.mjs:114`), and the plan registration takes only ids that start with
  a letter (`codex/scripts/agent-run.mjs:442`). 2026-09-29: the row `001 | luna | bulk verifier | nothing | unknown`
  through `--plan` printed `ERROR=invalid agent id: 001`, exit 2, and `--new` for `<run>/001/report.json` in a run
  with a registered plan printed `ERROR=001 is not in the approved plan …`, exit 2.

**Check.** `grep -n 'experiments' plugins/entrust/plugin/README.md`, `grep -n 'MAX' .../swarm/scripts/swarm.mjs`, and
the two launcher calls above against a scratch run directory.

**Issue text.** An orchestrate plan may propose a swarm for a bulk batch, and the swarm still carries such a batch
with limits the plan has to work around: the README calls it an experiment, a swarm holds fifty units, its summary
carries no tokens for the plan's re-estimate and stop line, and its agents cannot be registered in the orchestrate
run's plan, so each swarm needs a run directory of its own. Decide which of these stay limits the plan states, and
lift the rest.

## E121. A second `--decide` that lands while the driver settles the request is refused as "not waiting", not as already decided

**Evidence, level 3 for the refusal (CI, PR #61), level 2 for the window. Pre-existing.**

`decideRequest` in `plugin/skills/codex/scripts/agent-run.mjs:731-738` reads `<id>.request.json` for
`settled`, then reads `pending` in a second step. `closeApproval` in
`plugin/skills/codex/scripts/driver.mjs:3164-3173` writes the settlement and then rewrites `pending`.
A `--decide` whose first read comes before the settlement and whose second comes after it refuses with
`is not waiting: …/pending does not list it` for a request that was decided and settled a moment
earlier. Nothing is published and the exit is 2, so no decision is lost or doubled; only the stated
reason is wrong. On CI the agent-run case "--pending shows the waiting request whole…" hit this window
once on Linux under parallel suites; the case now polls every 4 s so it measures the duplicate-decision
refusal it names. A fix would re-read the request when `pending` does not list it and report the
settlement.

## E96. The harness's token figure for a Claude subagent is its last call's context, and the plan's comparables are built on it

**Evidence, level 3.** On 2026-09-29 Opus R2 of the prepare-feedback run compared, for 233 subagents in one machine's
transcripts, the Agent tool's `totalTokens` with the usage summed over the subagent's own transcript: 203 were within
1% of the last API call (78 exactly), none equalled the sum, and the median of sum over figure was 2.8. The research
cost tables that `orchestrate/references/plan.md:19` sends a plan to as comparables ("name the comparable runs behind
each estimate") quote that figure, for instance `research/2026-09-27-field-audit-triage/README.md:157` ("Claude 1.5M by
the harness's per-subagent count"), whose own line 160 already guessed it was not the cache-inclusive total.

**Issue text.** A Claude agent's cost in a plan or a research table is the size of its last call, not the tokens it
processed, which are about 2.8 times more, mostly cache reads. Estimates built on those tables understate a run, and
Claude and Codex figures side by side do not compare. The page should say which figure it states, and a spend should
come from the subagent's transcript, as `prepare-feedback.mjs process` sums it.

## E100. A coordinator session inside a worktree has the launcher's heredoc calls refused when their text names git

**Evidence, level 3 for plan rows, level 2 for prompts.** `plugins/entrust/plugin/skills/orchestrate/SKILL.md:37` has the
coordinator register the plan with the launcher's `--plan --run-dir <run>`, which reads its rows on stdin, and a write
agent's row names its absolute directory (`write <absolute dir>`). `plugins/entrust/plugin/skills/codex/SKILL.md:155-160`
writes every Codex agent's prompt with `--new` from a quoted heredoc, and `codex/references/approvals.md:27-29` does the
same for `--decide --accept`.
On 2026-09-29 a coordinator session entered its worktree with EnterWorktree, in a repository whose path contains a
directory named `Git`, and ran `--plan --amend` with the row `W2 | opus | implementer | write <worktree path> | unknown`
in a quoted heredoc. Claude Code refused it before it ran: "This session is isolated in the worktree <path>, but this
command feeds node text naming git in a plain command, which cannot be shown to stay inside the worktree." The same
row with `live tree` in place of `write <worktree path>` ran. No `--new` ran from that session, so a refusal of a prompt
that mentions git or the repository's path is inferred from the message, not measured.

**Check.** In a session entered into a worktree whose path contains `Git`, run `--plan --amend --run-dir <run>` with one
row `write <that worktree>` in a quoted heredoc: Claude Code refuses it before the launcher starts.

**Issue text.** When the coordinator's session works inside a worktree, Claude Code refuses a `node` call whose heredoc
text names git, and the orchestrate and codex pages feed the launcher exactly that way: plan rows that name a write
agent's directory, and agent prompts that mention the repository. The refusal comes before the command runs and names no
way around it, so the mode stops at registration unless the coordinator happens to write `live tree` instead. The pages
should give a form measured to pass in a worktree session.

## E102. A Codex agent can run as one background Bash task, as the swarm runs fifty, but the codex page offers only the Haiku wrapper, for a reason the swarm page contradicts

**Evidence, level 1 for the pages and scripts, level 3 for the task list.** `plugins/entrust/plugin/skills/codex/SKILL.md:148-151`
makes the wrapper the one route: "One Agent call per agent … It gives a Codex agent what a Claude agent has — a card,
Stop on it, one completion notification, a message to continue it — where a Bash task has none", linking
`codex/references/incidents.md:273-276`: "Measured 2026-09-12 against the VS Code extension 2.1.269 … a Bash task,
whatever its description says, is not on it, is not stopped from it and is not continued by a message".
`plugins/entrust/plugin/skills/swarm/SKILL.md:25` says the opposite of the same kind of task: "the swarm's agents are
not on the agent map, the task is, and Stop on it … reaches every running agent". The swarm already runs Codex agents
with no wrapper: `swarm.mjs:135-140` calls the launcher's `--new`, its plain mode, which waits for the run
with no early return, and `--status`; the launcher passes SIGTERM, SIGINT and SIGHUP to the driver (`agent-run.mjs:395`, and
`:720` until its early return). The ten-minute ceiling and the `RUNNING=` rerun come from the wrapper's own foreground Bash call
(`agent-run.mjs:18-31`); a background task has no ceiling, and on 2026-09-29 one ran for 105 minutes. The wrapper
cannot move its call to the background, because a subagent ends with its turn: one that did returned at once and was
counted as reported (`plugins/entrust/plugin/skills/codex/references/incidents.md:21`, "The unverified wrapper"). On 2026-09-29 the VS Code extension listed a
running background Bash task under its description in its background task list. Whether that list is the agent map,
and whether its Stop reaches the driver, is not measured.

**Issue text.** A Codex agent needs its Haiku subagent only for a card on the agent map. The coordinator can run the
launcher itself as one background Bash task, as the swarm does for up to fifty agents, with no wrapper tokens, no relay
that can paraphrase the status lines, and no ten-minute ceiling or `RUNNING=` reruns. The codex page names only the
wrapper, and its reason contradicts the swarm page and may be out of date. The page should name the background task
as a supported route, say what it shows and how it is stopped, and support it, after measuring the current extension's
task list and its Stop on such a task.

## E103. In `dontAsk` mode the codex page, and the advisor page that loads it first, do not load, because the Codex status line it runs needs an allow rule the page cannot give

**Evidence, level 3.** `plugins/entrust/plugin/skills/codex/SKILL.md:26` runs `scripts/status.mjs` through Claude Code's
`` !`…` `` substitution as the page loads, and its frontmatter (`:16`) pre-approves it with
`allowed-tools: Bash(node *codex/scripts/status.mjs*)`; `plugins/entrust/plugin/skills/advisor/SKILL.md:13` loads the codex
page first, and `plugins/entrust/plugin/skills/orchestrate/SKILL.md:36` loads it once a plan has a Codex agent. On 2026-09-29,
Claude Code 2.1.280, a `claude plugin eval` case that loaded `entrust:codex` ran in `permissionMode: dontAsk`, and the Skill
call's result was "Shell command permission check failed for pattern … Permission to use Bash has been denied because
Claude Code is running in don't ask mode": the model never received the page. The same case with the operator's
`--allow-tools "Bash(node *codex/scripts/status.mjs*)"` loaded it, so the pattern matches and the page's own grant is what
`dontAsk` ignores; the permission-modes page lists reads, `permissions.allow` rules and PreToolUse hook approvals as what
`dontAsk` runs, and no skill's `allowed-tools`. In headless `claude -p` sessions the codex page loaded in Manual
(`default`) and auto mode with the grant and was cancelled in Manual mode without it. Before the status line the codex page
loaded in `dontAsk` with no rule. The orchestrate page carries no status line and loads there; what an orchestrator does
when its plan has a Codex agent and the codex page it loads is cancelled was not measured.

**Check.** Run `claude plugin eval` on a case whose prompt loads `entrust:codex` with the Skill tool, with
`--ablation none --runs 1`: the Skill call's result is the permission failure above and no `CODEX=` line reaches the session.

**Issue text.** In `dontAsk` mode, the mode `claude plugin eval` runs every case in and the one locked-down CI uses, the
codex page no longer loads, and neither does the advisor page, which loads it first. The page runs the Codex status script as
it loads, and `dontAsk` counts only allow rules and hook approvals, not the page's own `allowed-tools`, so Claude Code
cancels the page before the model sees it. The status is advice for the composition and should never take a page down: in
`dontAsk` the page should load and the plan should say Codex was not checked unless the operator allowed the command. The two
fixes weighed on 2026-09-29 were rejected by the owner as not good enough: an allow rule every `dontAsk` operator adds leaves
the page dead until someone reads the README, and an explicit first step in place of the substitution adds a visible Bash call
to every load and a step the model can skip.

## E104. The effort policy is stated three times, and the three disagree

**Evidence, level 1.** `plugins/entrust/plugin/skills/codex/references/parity.md:85-92` gives effort by task: `low`
fact lookup, `medium` ordinary review, `high`/`xhigh` refutation, competing designs and a second implementation,
`max`/`ultra` the hardest problems. `plugins/entrust/plugin/skills/codex/references/orchestration.md:90`, under its
own Effort heading, gives it by row: `high` for the bulk row's extraction, classification and verification, `low` for
mechanical work only, `medium` for review, refutation and judgement in the strong and cheap rows, Astra inheriting
the configured effort and a stand-in for Astra `xhigh`; its line 68 says the same in one sentence.
`plugins/entrust/plugin/skills/orchestrate/SKILL.md:102-104` gives one default: "For Codex, use xhigh by default when
supported, and preserve a stronger configured max or ultra setting. On another host, use its highest supported
effort unless the user selects the speed profile." A review is `medium` on the first two pages and `xhigh` on the
third; refutation is `high` or `xhigh` on the first and `medium` on the second. When the entry was recorded the
second statement was `orchestrate/references/plan.md:35`; since then it moved and the third was added. Found by
Fable F1; re-checked 2026-10-07.

**Check.** `sed -n '85,92p' plugins/entrust/plugin/skills/codex/references/parity.md`,
`sed -n '90p' plugins/entrust/plugin/skills/codex/references/orchestration.md` and
`sed -n '101,104p' plugins/entrust/plugin/skills/orchestrate/SKILL.md` print the three.

**Issue text.** Three pages each carry the rule for which effort a Codex agent gets, and they no longer agree: the
codex parity and orchestration references set it per task or per row, from `low` to `xhigh`, and the orchestrate
page sets `xhigh` for every Codex agent by default. A coordinator that reads the orchestrate page and the adapter's
reference gets two answers for the same review agent. Decide which rule holds, keep it in one place, and have the
other pages link it.

## E111. The pages keep Luna out of judgement, and on one run Luna at high effort was the strongest dissenting critic (research)

**Evidence, level 1 for the pages, level 3 for the run's outcomes, level 2 for the generalisation.**
`plugins/entrust/plugin/skills/orchestrate/SKILL.md:50` puts Luna in the bulk row, "Fast, cheap and not clever — work
that is wide rather than deep", and `orchestrate/references/plan.md:35` gives `high` to the bulk row only for
"extraction, classification and verification", `medium` to review and judgement in the rows above. On the ledger
run of 2026-09-29/30, with no other Codex model available, Luna ran at `high` as the critic of each recommendation
(`plugins/entrust/research/2026-09-29-ledger-options/rounds.md`, `02-options.md`): it said E92's isolation belongs
with the unit that knows the agent's directory (it named the launcher) — the judge kept the driver's private
directory, which shipped a regression, and the owner's rework names each run's folder after the agent's report
directory, in the driver; its E89 "delete the classifier" and its E52 and E75 objections were upheld by the judge; it
corrected a Fable analyst's reading of "one place" for text; its refinement of the retro was the owner's pick. As a
wide diff reviewer it was weak: nothing found in a 1,763-line code diff, 3 minor findings in the page diff, at 576k
and 821k tokens. The swarm runs Luna for verdict units (`plugins/entrust/plugin/skills/swarm/SKILL.md`). Raised by the
owner, 2026-09-30.

A second run, level 3 for its outcome: on 2026-09-30, at the owner's request, Luna at `high` ran in parallel as the
dissenting critic of one recommendation, how the skill-page test (`evals/skills.test.mjs`) and this ledger should
hold E77 and E78. It agreed with two of the recommendation's five points and amended three; all three amendments
were taken, and one was decisive: E77's `wc -w` check was the entry's only reproducible measurement, so it was kept
rather than replaced (the owner later moved it to the Evidence). Its verdicts are in the run's report, kept outside
the repository. Two amendments show in what they changed: that measurement, in E77's Evidence until the entry closed
on 2026-09-30, and the commands.md sentence the entrust changelog kept; the third shaped a check tying the test's
known violations to ledger headings, which was removed later, when the owner chose to have the test fail on every
violation.

**Check.** `grep -n 'not clever' plugins/entrust/plugin/skills/orchestrate/SKILL.md`; the verdict table in `rounds.md`.

**Issue text.** The orchestrate page keeps Luna, the bulk model, out of judgement, and one run suggests that at
`high` effort it is a strong dissenting critic of a single recommendation while it stays weak on a wide review.
Measure it: the same set of recommendations criticised by Luna at `high`, by Luna at `medium` and by a strong-row
model, scored by which dissents the judge or the owner upheld; and, for the swarm, whether a verdict unit that asks
Luna to dissent rather than to match adds catches. If the result holds, give Luna a critic role in the tier table and
the effort rule that fits it.

## E113. The driver's check of the temporary base leaves a window before the run's folder is made, and never checks the base's mode

**Evidence, level 2, from reading.** `driver.mjs:1376-1381` (`tmpBaseProblem`) refuses a base that is a symbolic
link, not a directory, or another uid's, and nothing else: it reads no mode bit. `driver.mjs:1393-1404`
(`runTmpDir`'s `refuseBase`, called at `:1400` and `:1402`) calls `fs.lstatSync(base)` before the base is made
(`:1401`) and again right after, but nothing re-checks it after `fs.mkdirSync(path.dirname(dir), …)` (`:1403`) or
before the leaf itself is made, `fs.mkdirSync(dir, { mode: 0o700 })` (`:1404`): a base or an intermediate directory
swapped for a link between the second `lstat` and that last `mkdirSync` is followed, not caught. Separately, a
group- or world-writable base of this user's own passes `tmpBaseProblem` unchallenged, since only `isSymbolicLink`,
`isDirectory` and `uid` are read from the `lstat` result.

**Check.** Read `tmpBaseProblem` (`:1376-1381`): no `st.mode` term. Read `runTmpDir` (`:1382-1414`): the last write
before the leaf directory is created (`:1404`) is the intermediate `mkdirSync` at `:1403`, with no `lstat` between
them.

**Issue text.** The check-then-act shape `refuseBase`/`mkdirSync` repeats twice, but the window between the second
check and the final act — the leaf's own creation — is not covered, so a base or intermediate path swapped for a
link in that gap decides where the run's files go, the same class of race E44 closed for the lock. The base's mode
is never read, so a group- or world-writable directory of this user's is accepted as freely as a private one. Close
the window (make the run folder relative to an opened directory handle, or verify the leaf's own realpath right
after creation) and refuse a group- or world-writable base, or record why neither is needed on a per-user TMPDIR.

## E114. Two cases of the lock suite fail inside Codex's sandbox and pass outside it on the same tree

**Evidence, level 3 for the failure inside the sandbox; not reproduced outside it.** On 2026-09-30 a Codex agent
ran `node plugins/entrust/evals/lock.test.mjs` twice inside its sandbox, on main at `aaa0bcf` with a branch on top
that changes none of the files the suite reads, and both runs ended "2/74 failed" with the same two cases. The case
at `lock.test.mjs:1268`, "SIGTERM to the driver and then to its server, inside the grace, reports the turn as
interrupted and not as a crash", failed with "the driver had no child to signal", the message `:1279` returns when
it finds no child process of the driver. The case at `:1386`, "a lock whose pid was recycled by an unrelated live
process is not honoured", failed with "a recycled pid still wedged the directory: exit 10" (`:1399`). Six minutes
later the same suite on the same tree, run outside the sandbox, passed 74 of 74. The check runner's logs of the
three runs hold the whole output. What the logs do not show is why: whether it is timing, a restriction the sandbox
puts on signals or process ids, or something else is unknown.

**Check.** Run `node plugins/entrust/evals/lock.test.mjs` inside a Codex agent's sandbox and outside it on the same
tree, and compare the two cases above.

**Issue text.** Two cases of the lock suite, the driver's report of a SIGTERM inside the grace and a lock whose pid
was recycled, failed inside Codex's sandbox and passed outside it on the same tree, twice in a row. The logs show
only the failed checks: "the driver had no child to signal", and a recycled pid that "still wedged the directory"
with exit 10. Whether the cause is timing, a limit the sandbox puts on signals or process ids, or something else is
not known, so a suite run from a Codex agent cannot yet tell these two failures from real ones. Find the cause,
then either make the two cases pass there or have the suite say that they cannot run under that sandbox.

## E115. The codex page and the launcher's `--help` say a decline stops a run, and the driver only answers the request

**Evidence, level 2 (code reading; no live decline was run to see whether the turn ends).**
`plugins/entrust/plugin/skills/codex/SKILL.md:236-238`, in the stop bullet: "that pid is what reaches it, or, after a
waiting result, `--decide '<ID>' --decline` and the same `--run`"; `agent-run.mjs:169-170` (`--help`, under `--run`): "After a waiting result no call holds the driver, so stop it
with --decide --decline and the same --run, or kill -TERM the pid on its pid line in DIR/err.txt". A coordinator's
decision reaches the server through `closeApproval` (`driver.mjs:3181-3200`), which settles the entry, records it in
the mailbox and sends the server `{ decision: "decline" }` for that one request (`:3197`); nothing there cuts the
turn. The driver cuts a turn only through `cutTurn`, called at `:3008` (idle silence, which does not fire while a
request is open), `:3490` (the command budget), `:4633` (the wall clock) and `:4935` (a signal). Exit 6 is decided
after the turn ends (`driver.mjs --help`, "Decided after the turn"), so the declined command does not run and the
turn goes on for as long as the model continues it. `codex/references/approvals.md:33-35` already describes a decline
that way: decline, then send the same message again, and "`--run` picks the run back up".

**Check.** Launch an agent whose task needs one command outside its sandbox and more work after it, decline the
request with `--decide '<ID>' --decline`, run the same `--run` again, and read the report: `turnStatus: completed`
with exit 6 and commands after the declined one show the decline did not stop the turn; `driver.mjs:3181-3200` and
the four `cutTurn` calls show why.

**Issue text.** The codex page's stop instruction and the launcher's `--help` both offer "decline the waiting request
and run `--run` again" as a way to stop an agent. In the driver a decline answers that one request and nothing more:
the command is not run, and the turn goes on until the model ends it or a bound cuts it, with exit 6 decided at the
end. A coordinator who follows the instruction
to stop a runaway agent keeps it running. Stopping should be named as what the driver does stop on, its pid with
`kill -TERM` or Stop on the wrapper, and a decline described as an answer to one request.

## E117. The bulk row's unit, derived count and pilot are written twice, on orchestrate's plan reference and on the swarm page

**Evidence, level 1.** `plugins/entrust/plugin/skills/orchestrate/references/plan.md:31` ("A bulk row") states the unit
("one part of the material for extraction, with a fixed answer schema, or one claim, one address, a verbatim quote,
and a verdict from a closed set that describes the subject and never the brief"), the count ("a count derived from the
units with the plan saying why that many") and the pilot ("a stronger model marks a few units, the bulk model runs the
same units, and recall, false positives and tokens against that marking decide the brief's fixes and its effort").
`plugins/entrust/plugin/skills/swarm/SKILL.md:17` states all three again in its own words: "A unit is one claim, one
address, a verbatim quote, and a verdict from a closed set that describes the subject and never the brief, or one part
of the material for extraction, with a fixed answer schema the brief states", "Announce the count, derived from the
units with the plan saying why that many, before the launch", and "Pilot first: a stronger model marks the pilot's
units, the swarm's model runs the same units, and recall, false positives and tokens against that marking decide the
brief's fixes and its effort". No suite pins either copy, since the page suites stopped pinning prose, and
nothing compares them. Both copies were on main before 2026-09-30, the first on
`orchestrate/SKILL.md:67-69` at `4a3f0d7`; that day's cut of the page moved it into the reference word for word and
kept both copies, because the swarm page describes a swarm and a bulk batch may also run as ordinary Codex agents,
which it cannot own. Found by Fable F1.

**Check.** `grep -n 'closed set that describes the subject' plugins/entrust/plugin/skills/orchestrate/references/plan.md plugins/entrust/plugin/skills/swarm/SKILL.md`
prints one line in each file.

**Issue text.** The rules for a bulk fan-out's unit, its derived count and its pilot are written twice: once in
orchestrate's plan reference, for every bulk batch, and once on the swarm page, for a swarm, in different words.
A change to one is a drift from the other unless both are edited by hand, and a
coordinator who reads both meets two phrasings of one rule. The swarm page cannot simply own the rule, since a bulk
batch the plan gives no swarm runs as ordinary Codex agents. Decide which page owns these rules and have the other
link them, or generate the second copy from the first as the codex page's composition rules are generated into
orchestrate's references.
