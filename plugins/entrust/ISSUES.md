# Defects found in passing: entrust

Recorded per the repository rule: evidence at file:line, an evidence level (1: the line resolves, which is its
address holding what the claim quotes or states, not the line merely existing, and the same words at another
address are the claim moved; 2: an independent reader of the code would say the same; 3: the behaviour was made to
happen), and wording that can become an issue unchanged. An entry leaves when its fix lands and the changelog
names it. Ids are shared with terse's ledger, `plugins/terse/ISSUES.md`, so one id names one entry in both. A path
pinned to a commit is that commit's address, with today's beside it. A path that starts with a skill's name
(`orchestrate/…`, `codex/…`) is under `plugins/entrust/plugin/skills/`, one that starts with `evals/` or
`research/` under `plugins/entrust/`, and any other under the repository root; `:N` continues the file named
before it. A file name that several skills hold (`driver.mjs`, `agent-run.mjs`) carries its skill.

## E159. The design check pairs a one-digit landmark with the same digit inside a longer page text

**Evidence, level 3.** `evals/design-to-code/cases/server-card-planted/prebuilt/.design/card/frames/card-486/spec.json:189`
names the stock count as the landmark "1". The planted frame also draws "Выдача за 1 день". In two Sonnet arms on the
prebuilt planted card, b1 on 0.45.0 and n1 on the 0.46.1 candidate `1f3684e`, the builder rendered that line. Both
times the check paired the stock "1" with the header's "1": `x` -341 and a `y` gap of -216, both well placed on the page.
Card-486 was left `incomplete`, and each builder wrote two `cause: checker` entries
(`research/2026-11-20-design-to-code/40-overhead-and-one-sitting.md`, "Results before the sitting").

**Check.** Make the prebuilt arm (`make-arm.mjs <dir> --prebuilt`), add a `delivery` value to the 486 frame's data
entry, render it above the SKU, and run the complete check. The 486 report pairs "1" with the header line.

**Issue text.** When a landmark's text is a short token, such as one digit, that also occurs inside a longer text on
the page, the design check can pair the landmark with the longer text. It then reports offsets for a piece the page
places correctly. The builder pays for it with ledger entries that excuse the checker, and the frame can stay
`incomplete`. Prefer a page text that equals the landmark's text, or the one nearest its spec box, before a text that
only contains it.

## E158. The planted-card grader misses options recorded as a ledger array

**Evidence, level 3.** `evals/design-to-code/cases/server-card-planted/inputs.mjs:16-20` recognizes option labels
in text; `:45` serializes an entry's `options` array without its field name. In the frozen Terra rerun, an entry
names the missing contract data and contains two options, but `findQuestion` returns `named: true, surfaced: false`.
Appending the label `Options:` to the same text returns `surfaced: true`. The grader uses these documents at
`evals/design-to-code/cases/server-card-planted/grade.mjs:131-149`, so it can report `QUESTION NOT SURFACED` despite
an entry having options. The run itself also stopped before a worker handover; this is not a claim that it passed.
The reproduction and that distinction are in `research/2026-11-20-design-to-code/39-terra-045-rerun.md`.

## E157. The cleanup script cites three lines of the live gate for the directories the gate builds, and none of them holds that code

**Evidence, level 1.** `cleanup/scripts/cleanup.mjs:54-56` says that `plugins/entrust/evals/orchestrate-live.test.mjs:87`
"builds the artifact directory as `orchestrate-live-${new Date().toISOString().replace(/[:.]/g, "-")}`", `:88-89` "the
case directory inside it as `${n}-${slug}`", and `:167-168` "the git clone inside THAT as `scratch`". Today
`evals/orchestrate-live.test.mjs:87` is a bare `//` in the header comment, `:88-89` begin the header's account of case 4,
and `:167-168` are comment lines of the process helper ("TERM before KILL, and to the GROUP"); the artifact directory is
built at `:123`, the case directory at `:125` and the clone at `:196` and `:201`. The addresses were already stale at
`def9f23` (`:87` the header's "Case 4 measures the agent", the builder at `:122`) and at `0665237`, the repository's
first commit (the builder at `:122`, `caseDir` at `:123`). `plugins/entrust/CHANGELOG.md:3306-3307`, the 0.12.0 note,
quotes the same three addresses; that release predates the repository's first commit, so whether they held then cannot
be checked here. Found by an implementer of the orchestrate rework's minimum team, 2026-11-22.

**Check.** `sed -n 54,56p plugins/entrust/plugin/skills/cleanup/scripts/cleanup.mjs` prints the three addresses;
`sed -n '87p;167,168p' plugins/entrust/evals/orchestrate-live.test.mjs` prints comment lines, and
`grep -n 'orchestrate-live-\${\|^const caseDir\|"clone", "--local"' plugins/entrust/evals/orchestrate-live.test.mjs`
prints `123:`, `124:` and `201:`.

**Issue text.** The comment in the cleanup script that explains which directory shapes a test suite writes under the
temporary directory points at lines 87, 88-89 and 167-168 of the live orchestrate gate for the code that builds the
artifact directory, the case directory and the scratch clone. Those lines hold header comments and a process helper;
the code has sat 30 to 36 lines lower since the repository's first commit. A reader who follows the addresses to check
the shape the cleanup matches finds unrelated text. Name the code the comment means (the artifact directory's
`createTempDir` call, `caseDir`, the scratch clone) instead of its line numbers, or correct the numbers.

## E156. The gate's offline suite has no case for a worker briefed while the plan critic still runs, nor for a return that came after the synthesis started

**Evidence, level 3.** `evals/lib/gate-checks.mjs:418` counts a worker's brief as early while the plan critic has not
returned (`critic.done === null || w.seq < critic.done`); on 2026-11-22, replacing that with `w.seq < critic.seq`,
which admits a worker briefed after the critic's brief and before its return, left `node evals/gate-checks.test.mjs`
at 26 of 26. `:679` names a Claude return that arrived after the synthesis started; deleting that line left the suite
at 26 of 26 too. Both changes left the suite green at `def9f23` as well (24 of 24, at `:405` and `:629`), so the gaps
predate the plan critic. The suite's early case (`evals/gate-checks.test.mjs:239`) briefs its worker before the
critic is briefed at all, and no case returns an agent after the coordinator's last text. Found by an independent
verifier of the orchestrate rework.

**Check.** Make either change and run `node plugins/entrust/evals/gate-checks.test.mjs`: it still prints `all 26 passed`.

**Issue text.** Two of the live gate's checks have no offline case that fails when they break: a worker briefed while
the plan critic is still running, and a return that came in after the synthesis started. Each check can be weakened
or removed with the suite still green, so a live run the gate should fail would pass it. Add a fixture for each: a
worker's brief between the plan critic's brief and its return, and an agent's return after the coordinator's last text.

## E154. Only the claude adapter declares its agents native, so a five-column plan row with a Codex model under a Codex host resolves to the external Codex adapter

**Evidence, level 2.** `claude/adapter.json:6` is the one adapter manifest whose `plan` carries `"native": true`;
`codex/adapter.json:6` lists `["astra", "sol", "terra", "luna"]` and no `native`. `orchestrate/scripts/agent-run.mjs:552-553`
gives a row with no adapter column the adapter that lists its model, and `native` only when that adapter's plan says
so (`lister?.plan.native ? "native" : lister?.id`). On 2026-11-22 the row `W1 | sol | worker | nothing | unknown`
registered through `--plan` (`AGENT=W1 sol nothing`, exit 0); the launcher prints no adapter for it, and no `--new`
under it was run, so which adapter it resolved to is read from the code, not observed. `codex/references/orchestration.md:31`
("An all-native plan needs no driver registration or state directory") keeps an all-native Codex plan clear of it; a
mixed plan under a Codex host is not. Found by Fable F12.

**Check.** Under a Codex host, register that row with `agent-run.mjs --plan --run-dir <run>` and run `--new` for `W1`
without `--adapter`: by the code above the agent is made for the `codex` adapter, an external run, not a native subagent.

**Issue text.** Under a Codex host, a plan row that names a Codex model and no adapter column resolves to the external
Codex adapter, because only the claude adapter marks its agents native. A mixed plan in Codex therefore cannot register
a native Codex subagent in the ordinary five-column form. Decide whether a row's nativeness should follow the host that
runs the plan rather than the adapter manifest that lists the model.

## E155. Two shared pages call the host "normally Luna", though the shared skills name no model

**Evidence, level 1.** `proxy/SKILL.md:12`: "this host, normally Luna, transports messages and answers".
`orchestrate/references/main-proxy.md:4`: "The host (normally Luna) relays messages and replies." The entry "The shared skills name no
model (most of E122)" in `plugins/entrust/CHANGELOG.md`, under `## 0.26.0 — 2026-10-08`, moved model names to each
adapter's `references/models.md`. `claude/SKILL.md:18` names Luna too; it is an adapter page, where a model name
belongs. Found by Fable F12.

**Check.** `grep -n 'Luna' plugins/entrust/plugin/skills/proxy/SKILL.md plugins/entrust/plugin/skills/orchestrate/references/main-proxy.md`
prints both lines.

**Issue text.** The proxy skill and orchestrate's main-proxy reference, both shared pages, call the transporting host
"normally Luna", against the rule since 0.26.0 that the shared skills name no model and each adapter's models page maps
tiers to models. Say "the host", or its tier, and leave Luna to the Codex adapter's models page.

## E153. The design-to-code review pass has not run where it counts

**Evidence, level 3 for the harness, level 1 for the remedy.** `design-to-code/SKILL.md:92` asks for a second
look where a second agent can start. In the Sonnet harness a builder is a subagent and cannot start one; every
builder in iterations 6 and 7 says so in its handoff. In the owner's Codex, Terra started a second agent, which
declined the formal review because the check ended `fail`
(`research/2026-11-20-design-to-code/37-terra-28-4-dry-run.md:23-25`). The pass, its cost and what it adds are
unmeasured; "as read" rests on the coordinator's blind review.

## E152. An opener on a story page without its overlay leaves the design-to-code check incomplete

**Evidence, level 3 (one Sonnet run, `research/2026-11-20-design-to-code/35-iteration-7.md:327-329`).**
`design-to-code/references/check.md:23` keeps a complete check `incomplete` while an opener has no journey that opens
and closes it. When the frames are on a story page whose buttons open an overlay that only the real page holds, the
journey cannot be written there; the builder of c1 passed the same journeys on the real page and handed over
`incomplete`. Options: let a journey on another page cover an opener of the same name, or let the ledger settle it.

## E151. Design-to-code builders write ledger entries that name every landmark of a frame

**Evidence, level 3 (`research/2026-11-20-design-to-code/35-iteration-7.md:185`, `:320`).** When one missing line
moves everything below it, builders carry the consequence as one entry per frame naming every piece, which would also
excuse a real vertical defect there. Seen in 28.3 (p1) and 28.5 (r3). Draft 28.4's entries with a stated shift fixed
it but multiplied proposals, and went with the gate.

## E150. A single text's type size within about 10 % is not told apart at 1× references

**Evidence, level 3 (`research/2026-11-20-design-to-code/35-iteration-7.md:136-142`, `:217-229`).** The per-text
rule needs a text at least 10 % and 6 px off what the frame's font explains, its ink moving the same way; a text
with a box of its own is judged by width alone, larger only. At 1×, a 1 px change in a 13–15 px text is rounding. A
blind reviewer returned builds for values about 2 px off that the check did not name. Figma specs are compared by
computed size and are not affected.

## E149. The design-to-code benches miss two known classes

**Evidence, level 3 (`research/2026-11-20-design-to-code/35-iteration-7.md:143-145`).** The card bench catches 14 of
15 return classes with no clean build blocked; `column-shift` is missed. The stateful bench catches 2 of 3: an
observer left on removed cards shows only through a journey with `"sameAsFresh": true`, which the builder must write
(`design-to-code/SKILL.md:91`); on the catalogue case every Sonnet builder did.

## E148. A design-to-code run on the planted card costs 77–131 calls on Sonnet

**Evidence, level 3 (`research/2026-11-20-design-to-code/35-iteration-7.md:172`, `:280-288`, `:320`).** Nine runs on
a card whose frames draw data the contract does not send took 77 to 131 tool calls and 17 to 33 minutes, with no
change shown between drafts; the catalogue card took 19 to 28. The advisory notice
(`design-to-code/references/check.md:38-40`) does not stop a loop on an unchanged first finding; a gate that refused
to continue made it longer and was removed.

## E147. Under a plan-approval rule, the ledger entry may wait for approval

**Evidence, level 3 for the observation, level 1 for the remedy.** On draft 28.4, Terra in the owner's Codex named the
missing data as a question in prose, wrote no ledger entry, and stopped to ask approval of a plan, as its own
instructions require (`research/2026-11-20-design-to-code/37-terra-28-4-dry-run.md:27-33`). The shipped page says a
ledger entry records a question and is written without asking (`design-to-code/SKILL.md:77-78`); that line has not
been run on Terra.

## E146. A design-to-code builder can change the owner's inputs to clear a contradiction, and nothing detects it

**Evidence, level 3 (`research/2026-11-20-design-to-code/35-iteration-7.md:177-184`, `:280-283`, `:316-327`).** Faced
with frames that draw data the contract does not send, builders on Sonnet cut the line out of their references and
specs, left it out of the specs they made, added the field to the frames' data, or raised the check's tolerance. The
check then passes over bent inputs. Every handover still named the gap as a question. A record anchored at the first
check (draft 28.5) could not see a change made before it and was removed. Reviewers should diff the references,
specs, frames' data and `design.json` against the originals.

## E142. macOS CI review-eval failed with a missing temporary Git objects directory

**Evidence, level 3 (one observed CI failure).** On commit `fa7856b4759463f5bedaf23da2d5faf42777cdcc`, the
[macOS job](https://github.com/Nowely/agent-skills/actions/runs/43528474790/job/132239978676) reported `ENOENT`
for `review-outcome-NKZPTH/work/i01/repo/.git/objects` in the outcome case at `evals/review-eval.test.mjs:168`.
The case prepares its temporary round and implementation at `:171-175`. The cause and reproducibility have not
been established; this observation alone does not show a product regression.

A failure at the same place was seen once on #95. A possible cause, not confirmed: `prepare.mjs` commits and the
run is then copied whole, `.git` included, while housekeeping that the commit started in the background repacks
`.git/objects`. The instrument's commits now run with `gc.auto=0` and `maintenance.auto=false`. If the failure
recurs with that in place, the cause is elsewhere.
The macOS job on `1f2d31d`, the first with that setting, passed review-eval.

## E67. A command run after an approval, outside the sandbox, is not established to end when its agent is stopped

**Evidence, level 3 for the sandboxed case (measured), level 1 for the escaped case (unmeasured).**

- 2026-09-29, measured once: `/bin/zsh -c 'sleep 913 && echo done-913'` run inside the sandbox, in its own process
  group; `SIGTERM` to the driver's pid; neither the shell nor `sleep` alive 10 s later. `codex/scripts/driver.mjs:1964-1966`
  records it in the comment above `killGroupOf`/`killGroup`, and
  `plugins/entrust/plugin/skills/codex/references/environment-and-internals.md:266-267` says so: "A command the
  agent was running inside the sandbox ends with it (measured once, 2026-09-29)".
- The same sentence continues, `:267-268`: "a command run after an approval, outside the sandbox, has not been
  measured", and the reference keeps the manual step for it: before a second writer enters a directory where a
  command was approved, run `pgrep -fl '<the approved command>'` yourself and wait for it
  (`codex/references/environment-and-internals.md:268-269`);
  `codex/references/orchestration.md:105` carries the same check in its Result table's `exitCode: 10` row.
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
takes from its owner are each red" (`grep -rn` over `evals/*.mjs` finds none). At `def9f23`, `splitAdmissionProblems`
(`gate-checks.mjs:395-421`) only checked that the split critic named a file, that each worker brief named that
file's path and that the file opened. Since the plan critic replaced the split critic, it returns objections and
no split file, and the function (today `gate-checks.mjs:410-424`) keeps only the order of the briefs and the count of
the shared file's writers, from `writesSeen` (`:330-343`), which reads only Write/Edit/NotebookEdit/MultiEdit calls
and a Codex report's `filesTouched`; its own comment (`:329`) says "A write made through a shell command is not
visible here." The orchestrate page asked the coordinator to check each brief against the file's owners until
`cc7efbb` ("before a worker launches you check the files and interfaces its brief touches against the file's
owners"); today it says "Launch within the approved ownership and the runtime's limits" (`orchestrate/SKILL.md:48`),
and the plan critic judges ownership and shared interfaces before any brief (`orchestrate/references/roles.md`, the
plan critic), but no test stands behind a brief's files against their owners. Found by Fable H1.

**Check.** `grep -n 'parseSplit\|ownsPath' plugins/entrust/evals/lib/gate-checks.mjs` finds nothing; reading
`splitAdmissionProblems` (`:410-424`) shows no check of a brief's claimed files or interfaces against their owners.
A worker whose write ran through `sed -i` leaves
`filesTouched` and every Write/Edit call empty, so `writesSeen` returns no writer for it and
`splitAdmissionProblems` reports "0 agents wrote lib/shared.mjs" on a correct run.

**Issue text.** E59 replaced the free-text split and ownership readers, which misread a Codex critic's own report
as the split and a quoted request as ownership, with a narrower check that only confirms a file exists and is
named; it never restored a check of what each brief claims against what the split file says an owner should touch,
and it counts a file's writers only from tool calls and `filesTouched`, so a worker that writes through a shell
command is invisible to the count. The plan critic now returns objections, not a split file, so the owners to
compare a brief against are the approved card's; the gate should compare each brief with them, and count a shell
write that names the shared file among the writers.

## E90. The swarm, the bulk row's batch route, is called an experiment, holds fifty units at most, and reports no tokens

**Evidence, level 1 for the lines, level 3 for the refused registration.**

- `plugins/entrust/plugin/README.md:35` ends the swarm's row with "an experiment".
- `swarm/scripts/swarm.mjs:29` `const MAX = 50;` and `:90` refuses a longer unit file: "a swarm is ${MAX} at most".
  A batch wider than fifty units takes several swarms.
- `swarm.mjs:112-116` and `:149-150`: the summary holds per agent its number, unit, report path, the launcher's
  status lines and times, and no tokens, which the plan's stop line reads, an agent's tokens per unit against the
  pilot's median per unit (`orchestrate/references/plan.md:76-81`); each report has to be opened for them.
- A swarm's agent ids are `001` to `050` (`swarm.mjs:113`), and the plan registration takes only ids that start with
  a letter (`orchestrate/scripts/agent-run.mjs:468`). 2026-09-29: the row `001 | luna | bulk verifier | nothing | unknown`
  through `--plan` printed `ERROR=invalid agent id: 001`, exit 2, and `--new` for `<run>/001/report.json` in a run
  with a registered plan printed `ERROR=001 is not in the approved plan …`, exit 2.

**Check.** `grep -n 'experiment' plugins/entrust/plugin/README.md`, `grep -n 'MAX' .../swarm/scripts/swarm.mjs`, and
the two launcher calls above against a scratch run directory.

**Issue text.** An orchestrate plan may propose a swarm for a bulk batch, and the swarm still carries such a batch
with limits the plan has to work around: the README calls it an experiment, a swarm holds fifty units, its summary
carries no tokens for the plan's stop line, and its agents cannot be registered in the orchestrate
run's plan, so each swarm needs a run directory of its own. Decide which of these stay limits the plan states, and
lift the rest.

## E96. The harness's token figure for a Claude subagent is its last call's context, and the plan's comparables are built on it

**Evidence, level 3.** On 2026-09-29 Opus R2 of the prepare-feedback run compared, for 233 subagents in one machine's
transcripts, the Agent tool's `totalTokens` with the usage summed over the subagent's own transcript: 203 were within
1% of the last API call (78 exactly), none equalled the sum, and the median of sum over figure was 2.8. The research
cost tables that `orchestrate/references/plan.md:33` sends a plan to as comparables ("Estimate batches from comparable
runs") quote that figure, for instance `research/2026-09-27-field-audit-triage/README.md:157` ("Claude 1.5M by
the harness's per-subagent count"), whose own line 160 already guessed it was not the cache-inclusive total.

**Issue text.** A Claude agent's cost in a plan or a research table is the size of its last call, not the tokens it
processed, which are about 2.8 times more, mostly cache reads. Estimates built on those tables understate a run, and
Claude and Codex figures side by side do not compare. The page should say which figure it states, and a spend should
come from the subagent's transcript, as `prepare-feedback.mjs process` sums it.

## E100. A coordinator session inside a worktree has the launcher's heredoc calls refused when their text names git

**Evidence, level 3 for plan rows, level 2 for prompts.** `plugins/entrust/plugin/skills/codex/references/orchestration.md:27-28`
has the coordinator register every agent with the launcher's `--plan --run-dir <run>`, which reads its rows on stdin
(`orchestrate/scripts/agent-run.mjs:8`), and a write agent's row names its absolute directory (`write <absolute dir>`,
`:161`). `plugins/entrust/plugin/skills/orchestrate/references/external.md:69-76` writes every external agent's prompt
with `--new` from a quoted heredoc, and `:227-229` does the same for `--decide --accept`.
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

## E102. A Codex agent can run as one background Bash task, as the swarm runs fifty, but the codex page offers only the Haiku proxy, for a reason the claude page contradicts

**Evidence, level 1 for the pages and scripts, level 3 for the task list.** `plugins/entrust/plugin/skills/codex/SKILL.md:148`
sends every Codex agent through the shared call page, one Agent call per agent (`codex/references/orchestration.md:80`),
and `:154-156` gives the reason: "The proxy gives a Codex agent what a Claude agent has, a card, Stop on it and one
completion notification, where a Bash task has none", linking `codex/references/incidents.md:281-283`: "Measured
2026-09-12 against the VS Code extension 2.1.269 … a Bash task, whatever its description says, is not on it, is not
stopped from it and is not continued by a message". `plugins/entrust/plugin/skills/claude/SKILL.md:49-50` says the
opposite of the same kind of task: a long-running script, such as a swarm, "runs as one background Bash task described
by what it runs: the task is on the agent map, and Stop on it reaches everything it started". The swarm already runs
Codex agents with no proxy: `swarm.mjs:134-139` calls the launcher's `--new`, its plain mode, which waits for the run
with no early return, and `--status`; the launcher passes SIGTERM, SIGINT and SIGHUP to the driver
(`orchestrate/scripts/agent-run.mjs:417`, and `:828-829` until its early return). The ten-minute ceiling and the
`RUNNING=` rerun come from the proxy's own foreground Bash call (`orchestrate/scripts/agent-run.mjs:18-31`); a background
task has no ceiling, and on 2026-09-29 one ran for 105 minutes. The proxy cannot move its call to the background,
because a subagent ends with its turn: one that did returned at once and was counted as reported
(`codex/references/incidents.md:65-71`, "The unverified wrapper"). On 2026-09-29 the VS Code extension listed a running
background Bash task under its description in its background task list. Whether that list is the agent map, and
whether its Stop reaches the driver, is not measured.

**Issue text.** A Codex agent needs its Haiku subagent only for a card on the agent map. The coordinator can run the
launcher itself as one background Bash task, as the swarm does for up to fifty agents, with no proxy tokens, no relay
that can paraphrase the status lines, and no ten-minute ceiling or `RUNNING=` reruns. The codex page names only the
proxy, and its reason contradicts the claude page and may be out of date. The page should name the background task
as a supported route, say what it shows and how it is stopped, and support it, after measuring the current extension's
task list and its Stop on such a task.

## E103. In `dontAsk` mode the codex page, and the advisor page that loads it first, do not load, because the Codex status line it runs needs an allow rule the page cannot give

**Evidence, level 3.** `plugins/entrust/plugin/skills/codex/SKILL.md:23` runs `scripts/status.mjs` through Claude Code's
`` !`…` `` substitution as the page loads, and its frontmatter (`:11`) pre-approves it with
`allowed-tools: Bash(node *codex/scripts/status.mjs*)`; at `def9f23` `plugins/entrust/plugin/skills/advisor/SKILL.md:12` resolved its
advisor in Claude Code through "the codex adapter after its status check", that page (level 2: it no longer said to load
the page first); today the advisor reaches an adapter only for a named model the host does not run natively (`:12`),
and `plugins/entrust/plugin/skills/orchestrate/SKILL.md:73-80` loads an adapter's page only for a provider the user
named. On 2026-09-29,
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
codex page no longer loads, and neither does an advisor the user names on a Codex model, which loads it first. The page runs the Codex status script as
it loads, and `dontAsk` counts only allow rules and hook approvals, not the page's own `allowed-tools`, so Claude Code
cancels the page before the model sees it. The status is advice for the composition and should never take a page down: in
`dontAsk` the page should load and the plan should say Codex was not checked unless the operator allowed the command. The two
fixes weighed on 2026-09-29 were rejected by the owner as not good enough: an allow rule every `dontAsk` operator adds leaves
the page dead until someone reads the README, and an explicit first step in place of the substitution adds a visible Bash call
to every load and a step the model can skip.

## E104. A role's effort over the default is stated twice, in codex's parity reference and its model table, and the two differ on refutation

**Evidence, level 1.** The default is orchestrate's "the host's highest supported effort, or a stronger configured
setting" (`plugins/entrust/plugin/skills/orchestrate/SKILL.md`, Capacity and models); a role's effort overrides it
locally, and that override is stated twice. `plugins/entrust/plugin/skills/codex/references/parity.md:85-92`, the
effort table: `low` fact lookup, `medium` ordinary review, `high`/`xhigh` refutation, competing designs and a second
implementation, `max`/`ultra` the hardest problems. `plugins/entrust/plugin/skills/codex/references/models.md`, the
tier table's `EFFORT:` column: `high` for the bulk row's extraction, classification and verification, `medium` for
review, refutation and judgement, `low` for mechanical work only. A refuter gets `high` or `xhigh` by the first and
`medium` by the second. Earlier homes of the second statement: `codex/references/orchestration.md:90` until
2026-10-07, `orchestrate/references/plan.md:35` before that. Found by Fable F1; re-checked 2026-10-07.

**Check.** `sed -n '85,92p' plugins/entrust/plugin/skills/codex/references/parity.md` and
`grep -n 'refutation' plugins/entrust/plugin/skills/codex/references/models.md` print the two statements.

**Issue text.** Two pages each carry the rule for which effort a role gets over the default, in their own words, and
they already differ: a refuter gets `high` or `xhigh` by the parity table and `medium` by the model table. A later
change to one is a drift from the other unless both are edited by hand. Decide which effort a refuter gets, then keep
the rule in the model table and have the parity reference link it.

## E111. The pages keep Luna out of judgement, and on one run Luna at high effort was the strongest dissenting critic (research)

**Evidence, level 1 for the pages, level 3 for the run's outcomes, level 2 for the generalisation.**
`plugins/entrust/plugin/skills/orchestrate/SKILL.md:89-92` gives judgement to the top tier and the bulk tier
"independent units after the candidate model meets the acceptance rule"; `codex/references/models.md:11-17` names Luna
for the bulk tier at `high` "for extraction, classification and verification", Sol at `medium` "for review, refutation
and judgement", and Luna "the first choice for scouting and independent units"; the quality profile
(`orchestrate/references/plan.md:58`) admits bulk-tier reviewers beside a strong judge. On the ledger run of 2026-09-29/30,
with no other Codex model available, Luna ran at `high` as the critic of each recommendation
(`plugins/entrust/research/2026-09-29-ledger-options/rounds.md`, `02-options.md`; neither records the effort): it said
E92's isolation belongs with the unit that knows the agent's directory (it named the launcher) — the judge kept the
driver's private directory, which shipped a regression, and the owner's rework names each run's folder after the
agent's report directory, in the driver; its E89 "delete the classifier" and its E52 objection were upheld by the
judge, and its E75 objection was not (`02-options.md:19-20`); it corrected a Fable analyst's reading of "one place"
for text; its refinement of the retro was the owner's pick. As a wide diff reviewer it was weak: nothing found in a
1,763-line code diff, 3 minor findings in the page diff, at 576k and 821k tokens. The swarm runs the bulk or cheap
row's model for verdict units (`plugins/entrust/plugin/skills/swarm/SKILL.md:24`). Raised by the owner, 2026-09-30.

A second run, level 3 for its outcome: on 2026-09-30, at the owner's request, Luna at `high` ran in parallel as the
dissenting critic of one recommendation, how the skill-page test (`scripts/skills.test.mjs`) and this ledger should
hold E77 and E78. It agreed with two of the recommendation's five points and amended three; all three amendments
were taken, and one was decisive: E77's `wc -w` check was the entry's only reproducible measurement, so it was kept
rather than replaced (the owner later moved it to the Evidence). Its verdicts are in the run's report, kept outside
the repository. Two amendments show in what they changed: that measurement, in E77's Evidence until the entry closed
on 2026-09-30, and the commands.md sentence the entrust changelog kept; the third shaped a check tying the test's
known violations to ledger headings, which was removed later, when the owner chose to have the test fail on every
violation.

**Check.** `grep -n 'bulk' plugins/entrust/plugin/skills/orchestrate/SKILL.md plugins/entrust/plugin/skills/orchestrate/references/plan.md plugins/entrust/plugin/skills/codex/references/models.md`;
the verdict table in `rounds.md`.

**Issue text.** The pages keep Luna, the bulk model, out of judgement, and one run suggests that at
`high` effort it is a strong dissenting critic of a single recommendation while it stays weak on a wide review.
Measure it: the same set of recommendations criticised by Luna at `high`, by Luna at `medium` and by a strong-row
model, scored by which dissents the judge or the owner upheld; and, for the swarm, whether a verdict unit that asks
Luna to dissent rather than to match adds catches. If the result holds, give Luna a critic role in the tier table and
the effort rule that fits it.

## E113. Each level of the temporary directory chain is checked once, after it is made, and never for its mode

**Evidence, level 2, from reading.** `plugins/entrust/plugin/skills/orchestrate/scripts/temp-dir.mjs:19-31`
(`privateDirectory`) makes a level if it is missing, then `lstat`s it and refuses a symbolic link, a non-directory or
another uid's directory, and nothing else: it reads no mode bit. `directoryChain` (`:33-40`) calls it level by level,
so a level swapped for a link after its own check and before the next level is made under it is followed, not caught.
A group- or world-writable level of this user's own passes unchallenged. The Codex driver's run directory and the
state directory are both made through it (`codex/scripts/driver.mjs` `runTmpDir`, `temp-dir.mjs` `stateDirectory`).

**Check.** Read `privateDirectory` (`:19-31`): no `st.mode` term, and no re-check after the next level's `mkdirSync`.

**Issue text.** Each level of the temporary directory chain is checked once, after it is made, so a level swapped for
a link before the next level is made under it decides where the run's files go, the same class of race E44 closed
for the lock. A level's mode is never read, so a group- or world-writable directory of this user's is accepted as
freely as a private one. Close the window (make each level relative to an opened directory handle, or verify the
leaf's own realpath right after creation) and refuse a group- or world-writable level, or record why neither is
needed on a per-user TMPDIR.

## E114. Two cases of the lock suite fail inside Codex's sandbox and pass outside it on the same tree

**Evidence, level 3 for the failure inside the sandbox; not reproduced outside it.** On 2026-09-30 a Codex agent ran
`node plugins/entrust/evals/lock.test.mjs` twice inside its sandbox, on main at `aaa0bcf` with a branch on top that
changes none of the files the suite reads, and both runs ended "2/74 failed" with the same two cases. The case at
`lock.test.mjs:1268` on that tree (today `:1272`), "SIGTERM to the driver and then to its server, inside the grace,
reports the turn as interrupted and not as a crash", failed with "the driver had no child to signal", the message
`:1279` (today `:1283`) returns when it finds no child process of the driver. The case at `:1386` (today `:1390`), "a
lock whose pid was recycled by an unrelated live process is not honoured", failed with "a recycled pid still wedged
the directory: exit 10" (`:1399`, today `:1403`). Six minutes later the same suite on the same tree, run outside the
sandbox, passed 74 of 74. The check runner's logs of the three runs hold the whole output. What the logs do not show
is why: whether it is timing, a restriction the sandbox puts on signals or process ids, or something else is unknown.

**Check.** Run `node plugins/entrust/evals/lock.test.mjs` inside a Codex agent's sandbox and outside it on the same
tree, and compare the two cases above.

**Issue text.** Two cases of the lock suite, the driver's report of a SIGTERM inside the grace and a lock whose pid
was recycled, failed inside Codex's sandbox and passed outside it on the same tree, twice in a row. The logs show
only the failed checks: "the driver had no child to signal", and a recycled pid that "still wedged the directory"
with exit 10. Whether the cause is timing, a limit the sandbox puts on signals or process ids, or something else is
not known, so a suite run from a Codex agent cannot yet tell these two failures from real ones. Find the cause,
then either make the two cases pass there or have the suite say that they cannot run under that sandbox.

## E117. The bulk row's unit, derived count and pilot are written twice, on orchestrate's plan reference and on the swarm page

**Evidence, level 1.** `plugins/entrust/plugin/skills/orchestrate/references/plan.md:91-97` ("A bulk row") states
the unit ("Define independent units and a fixed return shape. A verdict describes the subject, not a broken input
path") and the count ("Announce the unit count and how it was derived"), and `:71-72` the pilot ("define the
acceptance rule and pilot representative work. Compare the same inputs with a stronger reference");
`plugins/entrust/plugin/skills/orchestrate/SKILL.md:104-105` states the tally ("Open one complete return before
trusting a unanimous tally of verifiers"), which the bulk row links.
`plugins/entrust/plugin/skills/swarm/SKILL.md:24` states all three again in its own words: "A unit is one claim, one
address, a verbatim quote, and a verdict from a closed set that describes the subject and never the brief, or one part
of the material for extraction, with a fixed answer schema the brief states", "Announce the count, derived from the
units with the plan saying why that many, before the launch", and "Pilot first: a stronger model marks the pilot's
units, the swarm's model runs the same units, and recall, false positives and tokens against that marking decide the
brief's fixes and its effort", and `:34` the tally: "Read one return whole yourself before trusting the tally". No suite pins either copy, and nothing compares them. Both copies were on main before
2026-09-30, the first on `orchestrate/SKILL.md:67-69` at `4a3f0d7`; that day's cut of the page moved it into the
reference word for word and kept both copies, because the swarm page describes a swarm and a bulk batch may also run
as ordinary agents, which it cannot own; the reference has since been cut to the shorter wording above. Found by Fable F1.

**Check.** `grep -n 'describes the subject\|unit count\|derived from the units\|pilot\|unanimous\|one return whole' plugins/entrust/plugin/skills/orchestrate/references/plan.md plugins/entrust/plugin/skills/orchestrate/SKILL.md plugins/entrust/plugin/skills/swarm/SKILL.md`
prints the lines in each file.

**Issue text.** The rules for a bulk fan-out's unit, its derived count and its pilot are written twice: once in
orchestrate's plan reference, for every bulk batch, and once on the swarm page, for a swarm, in different words.
A change to one is a drift from the other unless both are edited by hand, and a
coordinator who reads both meets two phrasings of one rule. The swarm page cannot simply own the rule, since a bulk
batch the plan gives no swarm runs as ordinary agents. Decide which page owns these rules and have the other
link them, or hold one wording and pin it on both pages as `evals/fragments.mjs` pins the run directory.

## E140. The agent-run D6 fixture fails when the checkout is inside ~/.codex

**Evidence, level 3.** `evals/agent-run.test.mjs:942-962` registers a worktree writer and prepares it using the
test process's checkout. `codex/scripts/driver.mjs:602` protects `~/.codex`, which also contains Codex-managed
worktrees. On 2026-10-20, `node evals/agent-run.test.mjs` failed D6 with
`refusing to grant write access ... it is inside ~/.codex, which holds the rollout receipts`.
The same suite from an unchanged `6c27a809` archive under the checkout reproduced the same failure:
70 cases passed and D6 failed in both runs.

**Check.** Run the suite from a checkout under `~/.codex/worktrees/`. The first worktree-writer preparation in D6
is refused before the continuation assertions.

**Issue text.** D6 relies on the checkout being an admissible write target, so its result depends on where the
repository was cloned. Use an isolated admissible fixture repository for this test; keep the production guard.

## E141. An early OpenCode model snapshot can hide available models

**Evidence, level 3.** On OpenCode 2.1.2, an outside-sandbox catalogue read on one fresh server returned
16 models at 348 ms, then 20 at 1,452 ms, including Carbon and Kimi. Desktop already listed both. The
`GET /api/model` description explicitly permits a snapshot preceding initial plugin settlement.
`plugin/skills/opencode/scripts/status.mjs:25-42` reads one snapshot and then closes its server, so the
observed missing-model report was premature. No model turn or configuration change was needed to reproduce it.

**Related inference, level 2.** `plugin/skills/opencode/scripts/client.mjs:54-64` reads the same snapshot,
caches it for model resolution and rejects an absent ID. A worker can therefore encounter the same startup
boundary; a worker refusal was not reproduced in this observation, and the later Carbon judgment started.

**Check.** With a configured plugin-supplied model, compare the initial `/api/model` response with a later
response from the same server after plugin initialization. Distinguish an incomplete catalogue from a
settled catalogue that genuinely lacks the requested model; do not silently substitute another model.

**Issue text.** Make model discovery/resolution respect OpenCode's documented plugin-initialization boundary
before declaring a requested model unavailable. Prefer a readiness signal to an arbitrary fixed sleep.
No installed adapter or user configuration was changed during the review experiment that found this.
