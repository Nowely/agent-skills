# Defects found in passing: entrust

Recorded per the repository rule: evidence at file:line, an evidence level (1: the line resolves; 2: an
independent reader of the code would say the same; 3: the behaviour was made to happen), and wording that
can become an issue unchanged. An entry leaves when its fix lands and the changelog names it. Ids are
shared with terse's ledger, `plugins/terse/ISSUES.md`, so one id names one entry in both. A path
pinned to a commit is that commit's address, with today's beside it.

## E67. A command run after an approval, outside the sandbox, is not established to end when its agent is stopped

**Evidence, level 3 for the sandboxed case (measured), level 1 for the escaped case (unmeasured).**

- 2026-09-29, measured once: `/bin/zsh -c 'sleep 913 && echo done-913'` run inside the sandbox, in its own process
  group; `SIGTERM` to the driver's pid; neither the shell nor `sleep` alive 10 s later. `driver.mjs:2676-2681`
  records it in the comment above `killGroupOf`/`killGroup`, and `plugins/entrust/plugin/skills/codex/SKILL.md:288`
  says so: "A command the agent was running inside the sandbox ends with it (measured once, 2026-09-29)".
- The same sentence continues, `:289`: "a command run after an approval, outside the sandbox, has not been
  measured", and the page keeps the manual step for it: before a second writer enters a directory where a command
  was approved, run `pgrep -fl '<the approved command>'` yourself and wait for it (`codex/SKILL.md:289-291`);
  `orchestrate/SKILL.md:145` carries the same check in its Result table's `exitCode: 10` row.
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

## E77. After a compaction, Claude Code keeps only the first 5,000 tokens of `codex` and `orchestrate`, and their last sections are lost for the rest of the session

**Evidence, level 3 for the mechanism, level 2 for HEAD's word counts.** Claude Code's skills page: after
auto-compaction it "re-attaches the most recent invocation of each skill after the summary, keeping the first 5,000
tokens of each". At HEAD, `codex/SKILL.md` is 4,461 words (4,242 after this branch's own trims, `22777dc` and
`b1056f9`, from 5,602, itself up from the 5,510 first measured after the E51, E57, E65, E67, E80 and E92 fixes added
material; main's Codex status lines and sixth composition rule, merged after, added 208): the 3,400th word falls in
"Reading the result" (`codex/SKILL.md:273`), so "Prompt shape" (`:295`), "What the user reads" (`:323`), "Traps"
(`:333`) and "References" (`:341`), about 750 words, lie past it. `orchestrate/SKILL.md` is 5,938 words (5,668 after
this branch's `887759a`, from 6,001, up from the 5,516 first measured after the E53, E65, E89, E90 fixes and the
Verification analysis bullet; main's swarm route, stand-in rule and critic read count, merged after, added 270): the
3,400th word falls in "Mechanism" (`:106`); "Approvals" starts at word 3,875 (`:114`), "Verification" at 4,312
(`:124`) and "The agent's return" at 5,682 (`:151`).

**Check.** `wc -w plugins/entrust/plugin/skills/{codex,orchestrate}/SKILL.md` prints 4461 and 5938; a page past
about 3,400 words loses its tail after a compaction.

**Issue text.** The two skills a coordinator relies on for the whole of a long session are still longer than what
Claude Code keeps of a skill after compaction, though each fix round has cut into both: `codex` from 5,602 to
4,242 words and `orchestrate` from 6,001 to 5,668, before later additions brought them to 4,461 and 5,938. Past the
first compaction, `codex` loses the prompt shape, what the user reads, the traps and the reference list;
`orchestrate` loses verification, the Result table included, and the agent's return. Candidates the page writers
named for the next cut: `codex`'s "Worktree lifecycle" section (`:224-247`, 286 words, repeats the driver's help and
the internals reference's worktree section) and the Rights paragraphs after the generated block (`:177-198`, about
250 words), and moving "Prompt shape" and "What the user reads" up; `orchestrate`'s `--pending` markers paragraph (`:120`, about 75 words) and the Result table
(`:140-149`). Each page should keep its standing rules within the first 5,000 tokens and move the rest into the
files it links.

## E90. The swarm, the bulk row's batch route, is called an experiment, holds fifty units at most, and reports no tokens

**Evidence, level 1 for the lines, level 3 for the refused registration.**

- `plugins/entrust/plugin/README.md:51` introduces it with "Two more are experiments with a page of their own."
- `swarm/scripts/swarm.mjs:30` `const MAX = 50;` and `:84` refuses a longer unit file: "a swarm is 50 at most".
  A batch wider than fifty units takes several swarms.
- `swarm.mjs:113-117` and `:150`: the summary holds per agent its number, unit, report path, the launcher's status
  lines and times, and no tokens, which the plan's re-estimate and per-agent stop line (`orchestrate/SKILL.md:40`)
  read; each report has to be opened for them.
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

## E91. `foreman.md:24` gives a broader cause than observed: the Skill tool loads a user-only skill whose command the user typed

**Evidence, level 3 for the pairing; the mechanism is a guess.** `plugins/entrust/plugin/skills/orchestrate/references/foreman.md:24-25`:
"It cannot load this skill: the Skill tool refuses a skill marked `disable-model-invocation`." On 2026-09-29 Opus O1 of
the prepare-feedback design run (`plugins/entrust/research/2026-09-29-prepare-feedback/`) counted the Skill tool's
results for entrust's user-only skills in one machine's transcripts: 13 loads (orchestrate 11, advisor 2), each with
the skill's command in the user's last message, and 6 refusals, none with it. The same day the Skill tool loaded
`entrust:orchestrate` in a session whose user had typed `/entrust:orchestrate`. The foreman's own conclusion may still
hold, since nobody types a command to a subagent; the stated cause does not. E82 is the neighbouring tension.

**Issue text.** The foreman page says the Skill tool refuses every user-only skill, but it loads one whose command the
user typed. A reader who takes the stated cause as the rule will route around a load that works. The sentence should
state the observed condition, or only the conclusion.

## E94. The entrust README says two more skills ship beside the main one; the plugin ships five more

**Evidence, level 1.** `plugins/entrust/plugin/README.md:8-9`: "Two more skills ship beside it, both described below
and both invoked by the user rather than by the model." `plugins/entrust/plugin/skills/` on `main` holds `codex` and
five more: `advisor`, `cleanup`, `experiment`, `orchestrate` and `swarm`.

**Issue text.** The README's opening undercounts the plugin's skills, so a reader who stops there misses three of
them. The sentence should give the count the directory holds, or not count.

## E95. `research/2026-09-28-command-gate/` has no README and no row in the research index

**Evidence, level 1.** `plugins/entrust/research/2026-09-28-command-gate/` holds ten numbered files and no README,
and `plugins/entrust/research/README.md` has no row for it, while its opening says "Each directory has its own README
with the result; this is the index."

**Issue text.** The command-gate run cannot be found from the research index, and its folder does not say what it
found. It needs a README with the result and a row in the index, as its neighbours have.

## E96. The harness's token figure for a Claude subagent is its last call's context, and the plan's comparables are built on it

**Evidence, level 3.** On 2026-09-29 Opus R2 of the prepare-feedback run compared, for 233 subagents in one machine's
transcripts, the Agent tool's `totalTokens` with the usage summed over the subagent's own transcript: 203 were within
1% of the last API call (78 exactly), none equalled the sum, and the median of sum over figure was 2.8. The research
cost tables that `orchestrate/SKILL.md:40` sends a plan to as comparables ("name the comparable runs behind each
estimate") quote that figure, for instance `research/2026-09-27-field-audit-triage/README.md:157` ("Claude 1.5M by the
harness's per-subagent count"), whose own line 160 already guessed it was not the cache-inclusive total.

**Issue text.** A Claude agent's cost in a plan or a research table is the size of its last call, not the tokens it
processed, which are about 2.8 times more, mostly cache reads. Estimates built on those tables understate a run, and
Claude and Codex figures side by side do not compare. The page should say which figure it states, and a spend should
come from the subagent's transcript, as `prepare-feedback.mjs process` sums it.

## E100. A coordinator session inside a worktree has the launcher's heredoc calls refused when their text names git

**Evidence, level 3 for plan rows, level 2 for prompts.** `plugins/entrust/plugin/skills/orchestrate/SKILL.md:37` has the
coordinator register the plan with the launcher's `--plan --run-dir <run>`, which reads its rows on stdin, and a write
agent's row names its absolute directory (`write <absolute dir>`). `plugins/entrust/plugin/skills/codex/SKILL.md:104-106`
writes every Codex agent's prompt with `--new` from a quoted heredoc, and `:129` does the same for `--decide --accept`.
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

## E101. entrust's evals README says `claude plugin eval` is missing from the build, and the build has it

**Evidence, level 3.** `plugins/entrust/evals/README.md:115-117`: "There is no harness for those. `claude plugin eval`
exists in the documentation but is early access and absent from this build — `claude plugin --help` lists no `eval`
subcommand." On 2026-09-29 `claude plugin --help` of Claude Code 2.1.280 lists `eval [options] [target]  Run eval cases
… against a plugin and report scored results`, and terse's trigger suite has run it through
`plugins/terse/evals/clarity-trigger.official.mjs` since 2026-09-26
(`plugins/terse/research/2026-09-26-writing-replication/measures/clarity-trigger.md:33`). The documentation isolates each
run: "Your user settings, hooks, `CLAUDE.md` files, MCP servers, other installed plugins, memory, and skills are absent"
(code.claude.com/docs/en/plugin-evals.md, "How runs are isolated").

**Check.** `claude plugin --help` lists an `eval` command.

**Issue text.** entrust's evals README says the trigger cases have no harness because `claude plugin eval` is missing
from the build. The build has it now, and it runs each case in a configuration with no installed plugins or user
instructions, the harness terse already uses for its own trigger suite. The README should say so, and the trigger
cases could run through it instead of through a reading of a real invocation's transcript.

## E102. A Codex agent can run as one background Bash task, as the swarm runs fifty, but the codex page offers only the Haiku wrapper, for a reason the swarm page contradicts

**Evidence, level 1 for the pages and scripts, level 3 for the task list.** `plugins/entrust/plugin/skills/codex/SKILL.md:54-57`
makes the wrapper the one route: "One Agent call per agent … a Bash task, whatever its description says, is not on the
agent map, is not stopped from it and is not continued by a message (measured 2026-09-12 against the VS Code extension
2.1.269 …)". `plugins/entrust/plugin/skills/swarm/SKILL.md:25` says the opposite of the same kind of task: "the swarm's
agents are not on the agent map, the task is, and Stop on it … reaches every running agent". The swarm already runs
Codex agents with no wrapper: `swarm.mjs:135-140` calls the launcher's `--new`, its plain mode, which waits for the run
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

**Evidence, level 3.** `plugins/entrust/plugin/skills/codex/SKILL.md:29` runs `scripts/status.mjs` through Claude Code's
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

## E104. The effort policy is stated twice: codex's parity reference and orchestrate's own EFFORT bullet

**Evidence, level 1.** `plugins/entrust/plugin/skills/codex/references/parity.md:87-92` carries the effort table
(`low` fact lookup, `medium` ordinary review, `high`/`xhigh` refutation and competing designs, `max`/`ultra` the
hardest problems); `plugins/entrust/plugin/skills/orchestrate/SKILL.md:77-81` states the same policy in its own
words: `high` for the bulk row's extraction, classification and verification, `low` for mechanical work only,
`medium` for review, refutation and judgement in the strong and cheap rows. Found by Fable F1.

**Check.** `sed -n '85,92p' plugins/entrust/plugin/skills/codex/references/parity.md` and
`sed -n '77,81p' plugins/entrust/plugin/skills/orchestrate/SKILL.md` print the two statements.

**Issue text.** Two pages each carry the rule for which effort a role gets, in their own words; a later change to
one is a drift from the other unless both are edited by hand. `orchestrate` should link the table rather than
restate it, or the table should move to a file both pages point at.

## E105. "On the first line of `<DIR>/err.txt`" names a line `kill` cannot take a pid from

**Evidence, level 3.** `plugins/entrust/plugin/skills/codex/SKILL.md:268` and
`plugins/entrust/plugin/skills/orchestrate/SKILL.md:106,116,142` tell the reader to signal or check an agent by the
pid "on the first line of" `<DIR>/err.txt`. `driver.mjs:4723-4724` writes that line as
`entrust: pid=<n> identity=lstart:<…> reportPath=<…>`, not the bare number. Measured 2026-09-29 by the coordinator
during the E67 probe: `kill -TERM $(head -1 err.txt)` failed with "kill: entrust: … arguments must be process or
job IDs".

**Check.** `head -1 <any agent's err.txt>` prints the `entrust: pid=… identity=…` line, not a bare number;
`kill -TERM $(head -1 <that file>)` reports the error above.

**Issue text.** Both pages tell the reader to take the pid from the first line of `err.txt`, and the first line is
not the pid alone: a reader who follows the instruction literally, with `$(head -1 …)`, hands `kill` a string it
refuses. The pages should say to read the number after `pid=` on that line, or the driver should put the bare pid
on a line of its own.

## E108. A Claude agent's overflow file goes under the coordinator's own `$TMPDIR`, the collision E92 fixed for Codex agents

**Evidence, level 1 for the page line, level 2 for the collision.** `plugins/entrust/plugin/skills/orchestrate/SKILL.md:30`:
"A Claude agent's artifact is its returned text, and a file it must leave goes under `$TMPDIR` with the path in that
text". E92's fix gives every Codex run its own private `$TMPDIR` under the state directory
(`plugins/entrust/plugin/skills/codex/scripts/driver.mjs`), so two Codex agents launched together no longer share
one; a Claude agent is a native subagent of the coordinator's own process, with no driver to give it a directory of
its own, so several launched together still write under the one `$TMPDIR` the coordinator's session holds. Found
by Fable J1.

**Check.** `grep -n 'a file it must leave goes under' plugins/entrust/plugin/skills/orchestrate/SKILL.md` finds the
line at :30; nothing in the codex or orchestrate pages gives a Claude agent a temporary directory of its own.

**Issue text.** The page tells a Claude agent to leave an overflow file under `$TMPDIR`, the same directory E92
found two side-by-side Codex agents colliding on. E92's fix reaches only Codex runs, through the driver; a Claude
agent has no driver to grant it a private directory, so two Claude agents told to leave a file under `$TMPDIR` in
the same brief can still overwrite each other's file with no error. The page should give each Claude agent's
artifact a name, or a subdirectory, that cannot collide with a sibling's.
