# Defects found in passing: entrust

Recorded per the repository rule: evidence at file:line, an evidence level (1: the line resolves; 2: an
independent reader of the code would say the same; 3: the behaviour was made to happen), and wording that
can become an issue unchanged. An entry leaves when its fix lands and the changelog names it. Ids are
shared with terse's ledger, `plugins/terse/ISSUES.md`, so one id names one entry in both. A path
pinned to a commit is that commit's address, with today's beside it.

## E64. The server's `availableDecisions` never offers `decline`, the shape every refusal of this driver sends

**Evidence, level 3 for the list and for the refusal being honoured today, level 1 for the schema.**

- 2026-09-27, Opus P1's probe on codex 0.155.1
  (`plugins/entrust/research/2026-09-27-approval-channel/01-probe.md:13-15`): five
  `item/commandExecution/requestApproval` requests each carried `availableDecisions: ["accept",
  {acceptWithExecpolicyAmendment: …}, "cancel"]` and never `decline`; the field is absent from the generated
  0.155.1 `CommandExecutionRequestApprovalParams.json`.
- `driver.mjs:2729-2730` answers both `item/*` methods with `{ decision: "decline" }`; the 27 reports with exit 6 on
  this machine (`00-escalations.md` in the same run) each went on to `turnStatus: completed` after it, so the server
  honours it.
- A JSON-RPC error in place of a decision is honoured as a rejection too, but the model reads
  `exec_command failed: … Rejected("approval request failed")` and the item completes `status: "failed",
  exitCode: null` (P1, Q3 error), which the classifier counts under `commandsFailed` (`:3318`, `:3336`).

**Check.** On 2026-09-27 Opus P1 answered five command requests from codex 0.155.1 and read the list each one
advertised: `accept`, `acceptWithExecpolicyAmendment` and `cancel`, never `decline`. A probe that prints the
`availableDecisions` of one command request on the pinned version repeats it.

**Issue text.** The refusal the driver sends is not among the decisions the server advertises for the request. It is
honoured on 0.153.4 and 0.155.1, but nothing promises it: a server that enforced its own list would turn every
refusal into an error the model reads as a broken tool while the report counts a failed command, and the offline
fixture, which accepts any decision, would stay green. Record the fact where the refusal shapes are chosen, make the
fixture carry the server's list, and let the live fidelity gate compare the two.

## E65. `escalations` can hold an entry with no declined or failed command beside it, because a sandboxed attempt can emit no item notifications

**Evidence, level 3 for the gap (seen once), level 2 for the consequence.**

- 2026-09-27, P1's 180 s hold thread on codex 0.155.1
  (`plugins/entrust/research/2026-09-27-approval-channel/01-probe.md:23`, `:31`): the rollout showed the sandboxed first
  attempt run and fail (`exec_command`, exit 1, `Operation not permitted`), while the thread's only
  `commandExecution` item was the escalated one: `item/started`, then the request, then `item/completed` with
  `status: "completed"` after the accept.
- `driver.mjs:3318` and `:3336` count `commandsFailed` and `commandsDeclined` from `item/completed`; the help at
  `:427-432` says `commandsDeclined` and `escalations` "can differ" and names one cause, a refused request with no
  command, not this one.

**Check.** Record the app-server messages of one turn whose sandboxed command fails and is escalated, and read
its rollout beside them: on 2026-09-27 the rollout held the failed attempt, and the messages held no
`commandExecution` item before the request.

**Issue text.** A report can show one escalation beside zero declined and zero failed commands, because the sandboxed
attempt that raised the request produced no item at all. The help's "can differ" covers it by accident; the report's
reader has no way to tell this case from a request raised with no attempt. Name the cause in the help, and let the
entry carry what the request itself says about the command, since the item may never come.

## E67. "Nothing left running" after `SIGTERM` is not established for a command executing at the signal

**Evidence, level 3 for the process groups, level 1 for the kill, level 2 for the consequence.**

- `plugins/entrust/plugin/skills/codex/SKILL.md:93` (at `c828b7f`): a `SIGTERM` to the driver's pid "cuts the turn,
  sweeps its codex and publishes the report … nothing left running".
- `driver.mjs:2400-2403`: `killGroup` signals `-child.pid`, the app-server's own process group, and `groupAlive`
  asks the same group.
- 2026-09-27, Opus P1's probe on codex 0.155.1 (`plugins/entrust/research/2026-09-27-approval-channel/01-probe.md`,
  Q2): each command the server runs shows "directly under the app-server pid, each in its own process group, with no
  sandbox-exec or codex wrapper". Whether the server ends those groups on its own exit or abort was not measured.

**Check.** `grep -n 'process.kill(-' plugins/entrust/plugin/skills/codex/scripts/driver.mjs` prints the two calls on
`child.pid` alone; the probe's process-list observation is at the line the entry cites.

**Issue text.** The teardown signals and polls the app-server's process group, while the commands the server runs
live in groups of their own. Whether they die with the server is unmeasured, so the page's promise is a guess for
any command still executing at the signal, a long test run first of all. Measure it (a `sleep` run through a live
turn, then `SIGTERM`, then `pgrep`), and either sweep the children or narrow the sentence.

## E51. A Codex agent picks its own output cap when it reads a file, and no page tells the coordinator to set one, so a read can return a fragment

**Evidence, level 3.**

- codex-cli 0.155.1 runs commands through a JavaScript `exec` tool whose `tools.exec_command({cmd, max_output_tokens, yield_time_ms})`
  the model fills in itself. `codex debug models` gives every gpt-6 model `truncation_policy: {mode: tokens, limit: 10000}`.
- 2026-09-26, a one-line probe on gpt-6-luna (rollout `~/.codex/sessions/2026/09/26/rollout-2026-09-26T20-51-43-01a0ded8-2b3b-7ca3-be1e-de3c54d965dd.jsonl`):
  asked only to run `echo probe-ok`, the model wrote `max_output_tokens:1000` on its own.
- Same day, a gpt-6-sol read agent (rollout `rollout-2026-09-26T22-51-18-01a0df45-a320-7fb1-9081-a446b9843a16.jsonl`)
  opened 95 pages of about 18,000 characters in one loop with `max_output_tokens: 1000`; each output was 19–60
  characters and 419 of the 1,745 message ids on those pages ever reached the model
  (`plugins/terse/research/2026-09-26-writing-replication/measures/A2-1-reading-check.md`). With
  "`max_output_tokens: 10000`, one `cat` per page" in the brief, all 1,584 page reads by 374 Luna agents arrived
  whole at the first launch, by the replication's `tools/coverage.py` now that it matches
  JSON-escaped text. The 1,583 recorded before that fix came from a tool that decoded only the first JSON object of
  an output. One agent, `col-P036-B`, read all ten pages of its part in one loop and got the combined output cut;
  its rollout shows it then read the eight pages the cut had lost, one `cat` each.
- `grep -rn max_output_tokens plugins/entrust/plugin/skills` finds nothing: neither `codex` nor `orchestrate` says it.

**Check.** `jq -r 'select(.payload.type=="custom_tool_call") | .payload.input' <the second rollout> | grep -o 'max_output_tokens[^,}]*'`
prints the 1000.

## E52. A read agent's report of what it read is taken on trust; its own rollout can contradict it and nothing compares them

**Evidence, level 3.**

- The same gpt-6-sol agent as in E51 answered "95 pages opened by separate cat commands with max_output_tokens:
  10000; no truncation found" (`answerJson.evidence`, report `A2-1`); its rollout holds 28 custom tool outputs, 2 wait outputs and
  419 of 1,745 message ids, and its gap findings came from keyword regexes over the messages
  (`plugins/terse/research/2026-09-26-writing-replication/measures/A2-1-reading-check.md`).
- The receipt proves the thread ran, not what it read: `codex/references/environment-and-internals.md:219-222`.
  No page names a check that a page an agent was given reached its context.
- A check that works: `plugins/terse/research/2026-09-26-writing-replication/tools/coverage.py` counts a page as
  read only when its whole text is a substring of one command output in the agent's own rollout, raw or
  JSON-escaped. Re-run on the 13 recorded sets,
  it flags 1 of 500 stress agents, `cx-P102`, which had reported itself `partial`, none of 356 collection agents
  (1,508 of 1,508 pages read) and none of 13 relaunched stress agents. Among the Luna runs it found no report that
  hid a miss; the hidden miss that stands is the Sol agent above. The records made before the fix, 13 of 500, 1 of
  356 and 1 of 13 flagged, came from a tool that decoded only the first JSON object of an output, and an earlier
  version that decoded none also flagged two agents that had read everything.

**Check.** Run `coverage.py` on a map that pairs agent `A2-1` with the 94 human pages: it reports the pages unread.

## E53. A Claude agent starts with the owner's global and project CLAUDE.md and memory index loaded, which `orchestrate` never mentions when it assigns blind or independent roles

**Evidence, level 3.**

- 2026-09-26, the bottom-up analyst (Opus), told to work from episodes only and not to open CLAUDE.md or memory:
  record 7 of its transcript,
  `~/.claude/projects/-Users-user-Git-agent-skills/261eafc8-ba46-48af-8111-f9e6784dfc05/subagents/agent-a7f1e1fb08cb1091e.jsonl`,
  is an `attachment` of type `instructions` whose files include `~/.claude/CLAUDE.md`, the
  repository's `CLAUDE.md` and the memory `MEMORY.md`. The agent had not opened them; the harness put them there.
- A Codex agent's context is its prompt file, the driver's standing rules and codex's own AGENTS.md files; on this
  machine `~/.codex/AGENTS.md` is empty (0 bytes) and the repository has no `AGENTS.md`.
- `orchestrate/SKILL.md` and `references/roles.md` give Claude and Codex agents the same judgement roles and state
  no difference in what each starts with; `grep -n "CLAUDE.md" plugins/entrust/plugin/skills/*/SKILL.md` finds none.

**Check.** `sed -n 7p <that transcript> | jq -r '.attachment.type, (.attachment.files[]?.path // empty)'` prints
`instructions` and the three paths.

## E56. The launcher runs nothing and exits 0 when its own path goes through a symlink

**Evidence, level 3.**

- `plugins/entrust/plugin/skills/codex/scripts/agent-run.mjs:396` (at `e99cdb6`): `const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);` — `path.resolve` keeps the path as typed, `fileURLToPath(import.meta.url)` is the module's real path, so they differ when the typed path crosses a symlink, and every mode of the launcher is skipped.
- 2026-09-27, macOS, where `/var` is a symlink to `/private/var`: `node /var/folders/…/scripts/agent-run.mjs --help` printed 0 lines and exited 0; `node /private/var/folders/…/scripts/agent-run.mjs --help` printed the 57-line help; `--new` through the `/var` path printed no `PROMPT=` line, wrote nothing and exited 0; `driver.mjs --help` through the `/var` path printed its 161 lines, so the driver has no such check.

**Check.** `node <a copy of scripts/ under $TMPDIR, whose path starts with /var/>/agent-run.mjs --help | wc -l` prints `0`; the same through `$(realpath …)` prints `57`.

**Issue text.** The launcher decides whether it was run as a program by comparing the path it was invoked with against its module's real path, so an invocation through a symlink — `$TMPDIR` on macOS, any linked checkout — is a silent no-op with exit 0: no lines, no prompt, no run, and a wrapper told to run the command again "until a result has a REPORT= line" runs it again without end (E57). The comparison should resolve both sides with `fs.realpathSync`, or the launcher should refuse loudly when it is not the main module.

## E57. The wrapper loops without bound on a command that prints nothing

**Evidence, level 3.**

- `plugins/entrust/plugin/agents/codex-agent.md:13-16` and the message block in `plugins/entrust/plugin/skills/codex/SKILL.md` (step 2): "If its result has no REPORT= line — it ends with RUNNING= instead, or it was cut — run the very same command again at once, as many times as needed, until a result has one." No bound, and no rule for a result that is empty.
- 2026-09-27: a wrapper given the launcher through a `/var` path (E56) ran it 64 times over 352 s, then handed back "(no output produced by command after 75+ attempts)"; the harness ended the loop, not the rule.

**Check.** Give the wrapper a command that prints nothing and exits 0 (`true`): step 2 as written never ends.

**Issue text.** The wrapper's rerun rule has no bound and no case for an empty result, so a launcher that prints nothing (E56, or any refusal that reaches neither stdout nor the report) is rerun until the harness gives up, at one tool call every few seconds. The rule should stop after a small fixed number of reruns, and hand back an empty result as its own line, so the coordinator reads the refusal instead of a hung card.

## E58. The generated composition reference tells its reader to run a script the plugin does not install

**Evidence, level 1.**

- `plugins/entrust/plugin/skills/orchestrate/references/codex-composition.md` (generated by `evals/fragments.mjs`,
  landed in commit `080b1df`) carries a note telling the reader to regenerate it with `node evals/fragments.mjs
  --write`; `evals/` is not part of the installed plugin (`plugins/entrust/plugin/` is what installs, see the
  0.21.0-era changelog entry "What installs is now `plugins/entrust/plugin/`"), so on an installed copy the path
  does not exist.
- Found in passing by Opus E1, the changelog editor of the 2026-09-27 fix run, while verifying paths.

**Check.** `grep -n 'fragments.mjs' plugins/entrust/plugin/skills/orchestrate/references/codex-composition.md`
prints the note; `ls plugins/entrust/plugin/evals` fails.

**Issue text.** The composition reference the orchestrate page plans from is generated from a constants module under
`evals/`, and its header tells a reader to regenerate it with that module, which an installed plugin does not carry.
The note should say the file is generated in the repository and name nothing a user cannot run, or the generator
should live under the installed tree.

## E59. The live gate takes the split critic's own report for the corrected split and reads ownership from any line that quotes a path

**Evidence, level 3.**

- `plugins/entrust/evals/lib/gate-checks.mjs:466` takes as the corrected split the first absolute path ending in
  `.md`, `.txt` or `.json` in the critic's hand-back and report text; a Codex critic's hand-back opens with its
  status lines, whose `REPORT=` names its own `report.json`, so that file is what the gate reads as the split, and
  the file the critic published in `artifacts` (`corrected-split.md`) is never opened.
- `plugins/entrust/evals/lib/gate-checks.mjs:420-422` (`ownsPath`) counts a brief as owning a path when any one
  line holds the path and a verb from a list (`own`, `rename`, `update`, …) without a negation; a brief's "Why"
  line quoting the user's request ("rename fmt in lib/shared.mjs … and update lib/a.mjs") qualifies.
- 2026-09-28, the live gate's case 7 rerun (artifacts `$TMPDIR/orchestrate-live-2026-09-27T21-56-26-891Z/7-split-critic`):
  Codex Astra X1 returned exit 0 with `corrected-split.md` and `validate-split.py` in `artifacts`, and the split
  gives U1–U3 and interface I1 to Sonnet W1, W2 and W3; every worker brief names that file. The gate reported
  "4 worker brief(s) do not name the corrected split …/X1/report.json", three interfaces with 0 owners
  (`corrected-split.md`, `./shared.mjs`, `validate-split.py`: the report's artifact paths and an import string),
  nine lines "W<n>'s brief owns lib/…, which the corrected split gives to V1" (the report's result text says V1
  owns the review and the test run), and "4 worker briefs own lib/shared.mjs" where W2's and W3's briefs say
  "Write no file other than lib/a.mjs" and quote the request in their "Why" line. The case's ordering check
  itself passed: no worker brief before the critic returned.

**Check.** Run `splitAdmissionProblems` over that case's `turn2.jsonl` with its report reader: the problems above
appear; replace the file lookup with the critic's `artifacts` entry ending in `.md` and they go, except the
ownership count, which needs `ownsPath` to skip a line that quotes the request or names another agent as the owner.

**Issue text.** The gate's split check reads the critic's report file as the corrected split whenever the critic
is a Codex agent, because its hand-back's `REPORT=` line is the first absolute path it finds, and its ownership
reading counts any line that holds a path beside a verb like `rename` or `update`, so a brief that quotes the
user's request owns every file the request names. The check should read the file the critic's `artifacts` name
and count ownership only from a line whose subject is the brief's own agent.

## E60. The live gate's attribution check credits an agent with the next list item's path

**Evidence, level 3.**

- `plugins/entrust/evals/lib/gate-checks.mjs:757-760` cuts the answer at each "<Model> <id>" mention and reads
  the stretch up to the next mention or the next sentence end (`[.!?]` followed by whitespace); a list whose
  items end with the attribution in parentheses and no period runs the stretch into the next item's path.
- 2026-09-28, the live gate's case 7 rerun (same artifacts): the answer's list "`lib/shared.mjs`: … (Sonnet W1)
  / `lib/a.mjs`: … (Sonnet W2) / `lib/b.mjs`: … (Sonnet W3)" drew "the answer credits Sonnet W1 with lib/a.mjs,
  which only sonnet w2's return holds" and the same for W2 and `lib/b.mjs`, each twice.

**Check.** `claimOriginProblems` over a three-item list in that shape reports the shifted paths; a stretch that
ends at the line's end as well as at a sentence end reports none.

**Issue text.** The gate's attribution reading treats a line break as part of the sentence, so a list whose items
end with "(Model id)" credits each agent with the path of the item below it and reports a misattribution the
answer does not make. The stretch an agent is the subject of should end at the end of its line.

## E61. The draft linter reads a sentence about what will happen as a success claim

**Evidence, level 3.**

- `plugins/entrust/plugin/skills/orchestrate/scripts/lint-draft.mjs:94` (`SUCCESS`) matches `passes` and its kin
  anywhere in a sentence, and `:165` reports the sentence as `unsupported-success` when no receipt label is in it;
  tense and mood are not read.
- 2026-09-28, the live gate's final run of case 5 (artifacts `$TMPDIR/orchestrate-live-2026-09-27T22-21-50-483Z/5-full-run`,
  log `orchestrate-live-fixrun-3.log:4`): the coordinator's phase paragraph "The final answer goes out once its new
  verdict arrives and the digest check passes." was reported as "an update claims success with no receipt".

**Check.** `printf 'The answer goes out once the check passes.\n' | node lint-draft.mjs -` reports
`unsupported-success`; the sentence claims nothing.

**Issue text.** The linter's success rule matches the verb alone, so a sentence that says what will happen once a
check passes is reported as an unsupported success claim. The rule should skip a clause introduced by `once`,
`when`, `if`, `until` or `after`, or read the sentence's tense, and the gate's phase check inherits whichever the
linter does.

## E62. The gate's plan record turns `unknown` tokens into NaN

**Evidence, level 1.**

- `plugins/entrust/evals/lib/gate-checks.mjs:203` builds each plan row with `tokens: Number(tokens)`; the launcher
  admits `unknown` in that column since 2026-09-28 (Codex Sol W3b's fix round, 13c-writer-w3b.md), and
  `Number("unknown")` is `NaN`.
- Opus R3 named it among its fourteen findings (12c-reviewer-r3.md); W3b left it as the gate's, and the gate's
  fix round did not take it (rounds.md, "W2 fix round returns").

**Check.** `node -e 'import("./plugins/entrust/evals/lib/gate-checks.mjs").then(m => console.log(m.planRecord("A1 | opus | worker | lib/a.mjs | unknown")))'`
prints `tokens: NaN`.

**Issue text.** The gate reads a registered plan's tokens column with `Number`, so a row the launcher admits with
`unknown` carries `NaN` into every check that sums or compares tokens. The record should keep `null` for
`unknown` and the checks should skip it.

## E68. The mailbox's owner reclaim checks the holder is dead and then removes the owner file by path, the pattern E44 removed from the lock

**Evidence, level 2.**

- `driver.mjs:3435-3441` (`claimOwner`, reached through `claimMailbox`): under the reclaim marker, `const now =
  readJson(owner); if (!holderAlive(now)) { fs.rmSync(owner, { force: true }); … }` reads `owner.json`, decides
  liveness, and unlinks it by its shared pathname — not the descriptor-held, identity-checked act that update and
  release now use for the lock's own link after E44.
- `driver.mjs:1887` documents the same shape as residual for the *lock's* owner file even after the E44 fix ("the
  owner file, checked the same way, still goes"), because POSIX has no unlink by inode: a file swapped in between
  the check and the unlink is not the one removed. The mailbox's `owner.json` reclaim has no rename or identity
  check between its liveness read and its `rmSync`, so the same window is open here, one level up from where E44
  closed it for the lock's link.

**Check.** `grep -n "now = readJson(owner)" plugins/entrust/plugin/skills/codex/scripts/driver.mjs` shows the read
and the `rmSync` a few lines apart, both keyed on the shared path `owner`, with nothing that binds the removal to
the value just read.

**Issue text.** `claimOwner`'s takeover path reads `owner.json`, decides its holder is dead, and then unlinks that
path — the check-then-act-on-the-pathname shape E44's fix removed from the lock's own update and release, and for
the same reason: a peer that replaces the file between the read and the unlink loses its claim to a taker that
never looked at what it removed. The reclaim marker serialises two takers against each other, not the owner
file's removal against a fresh write from the holder it just pronounced dead. Mitigating: the launcher claims one
launch per agent directory through `err.txt` (`wx`, `agent-run.mjs:367`), so two `claimOwner` calls racing on the
very same mailbox path is not the ordinary case this driver runs today.

## E74. The README gives the data directory's lifetime as "an uninstall deletes it unless `--keep-data`", and `claude plugin marketplace remove` deletes it with no such option

**Evidence, level 3.** `plugins/entrust/plugin/README.md:106-107`: "It survives plugin updates; an uninstall deletes
it unless you pass `claude plugin uninstall --keep-data`". On 2026-09-11, during the marketplace restructure, `claude
plugin marketplace remove` deleted this plugin's data directory, under its earlier name, with 28 agent reports in it.
On Claude Code 2.1.280, `plugins/terse/research/2026-09-22-terse-process/rewrite-2026-09-22/run/probe-04/lifetime-probe.sh`
measured the same mechanism on a plugin's data directory in fresh configurations
(`…/probe-04/lifetime-probe.log`): `marketplace remove` deleted it and offers no `--keep-data`, and uninstalling one
of two installations kept it until the last was removed. Found on 2026-09-28 while planning the fix of the same
sentence in terse's `references/run.md` (E21).

**Check.** `sed -n '106,107p' plugins/entrust/plugin/README.md; claude plugin marketplace remove --help` shows the
sentence and a command with no `--keep-data`.

**Issue text.** The README tells the user that the data directory, which holds every agent's answer, the worktree
ledger and the orchestrate runs, goes only with `claude plugin uninstall` and stays with `--keep-data`. Removing the
marketplace deletes it too, with no option to keep it, and uninstalling one of two installations keeps it. A user who
removes the marketplace to tidy up loses every report without warning. The README should say the directory goes when
the plugin's last installation is removed, by `claude plugin uninstall` without `--keep-data` or by `claude plugin
marketplace remove`, which has no such option.

## E75. The README tells the user that `permissions.additionalDirectories` stops the prompts for writes into the data directory, which Claude Code protects

**Evidence, level 2.** `plugins/entrust/plugin/README.md:110-111`: "In every permission mode but auto and bypass, a
write outside the working directory prompts, so add that directory to `permissions.additionalDirectories` once".
The data directory is `~/.claude/plugins/data/entrust-nowely/` (`README.md:104`). Claude Code's documentation,
`https://code.claude.com/docs/en/permission-modes.md`, section "Protected paths", lists `.claude` among the
protected directories, gives `default` and `acceptEdits` as "Prompted" for writes there, and says
"`permissions.allow` rules in settings files do not pre-approve protected-path writes";
`https://code.claude.com/docs/en/permissions.md` says files in additional directories "follow the same permission
rules as the original working directory: they become readable without prompts". Read on 2026-09-28; not run
against entrust.

**Check.** `sed -n '104p;110,111p' plugins/entrust/plugin/README.md` and the two documentation sections above.

**Issue text.** The README sends the user to `permissions.additionalDirectories` to stop prompts for writes into
entrust's data directory. That directory is under `~/.claude`, a protected path: the setting makes it readable
without prompts, and a write there by Claude Code's own file tools still asks in `default` and `acceptEdits`
whatever the settings say, until the user allows `~/.claude` edits for the session. The README should say what
the setting does, reads without prompts, and what it does not.

## E76. `protocol.test.mjs` requires a refusal made at once to take 0 ms, and a slow macOS runner records 1 ms

**Evidence, level 3.** `plugins/entrust/evals/protocol.test.mjs:658` fails the `approval-wait` scenario unless
`e.waitMs === 0`. The driver declined the request at once, but on CI it recorded `askedAt` …36.470Z and
`settledAt` …36.471Z, so `waitMs` was 1, and the suite failed with "the entry's fields are wrong". This happened in
run 36417631361 of PR #29 (macos-latest, node 24) and in run 36387062335 on main at c920b97 (macos-latest, node 22); the
other jobs of both runs passed, and PR #29 changes no entrust code.

**Check.** `gh run view 36387062335 -R Nowely/agent-skills --log-failed | grep 'FAIL  approval-wait'` prints the failure
with `"waitMs":1`.

**Issue text.** The test asserts that a refusal with no channel takes zero milliseconds, which a millisecond clock
does not guarantee: a refusal that spans a clock tick records 1 ms, and the macOS jobs fail intermittently with
nothing wrong in the driver. It should assert that the refusal did not wait, for example that `waitMs` is far below
the approval timeout, rather than an exact 0.

## E77. After a compaction, Claude Code keeps only the first 5,000 tokens of `codex` and `orchestrate`, and their last sections are lost for the rest of the session

**Evidence, level 3.** Claude Code's skills page: after auto-compaction it "re-attaches the most recent invocation of
each skill after the summary, keeping the first 5,000 tokens of each". `plugins/entrust/plugin/skills/codex/SKILL.md`
is 5,510 words in 414 lines and `orchestrate/SKILL.md` 5,516 words in 165 lines. In the session of
`plugins/terse/research/2026-09-28-vendor-guides/` both were re-attached marked "skill content truncated for
compaction": `codex` 0.21.0 ended at line 269 after 3,415 words, so "Prompt shape" (`codex/SKILL.md:357`), "What the
user reads" (`:380`), "Traps" (`:390`) and "References" (`:398`) were not in context; `orchestrate` 0.20.0 ended at
line 143 of 156 after 3,416 words. At HEAD `orchestrate` has grown, and "Verification" (`orchestrate/SKILL.md:124`)
and "The agent's return" (`:150`) lie past the same word count (level 2 for HEAD).

**Check.** `wc -w plugins/entrust/plugin/skills/{codex,orchestrate}/SKILL.md` prints 5510 and 5516; a page past about
3,400 words loses its tail after a compaction.

**Issue text.** The two skills a coordinator relies on for the whole of a long session are longer than what Claude
Code keeps of a skill after compaction. Past the first compaction, the coordinator writes briefs and relays returns
without the sections that define them: the prompt shape, what the user reads, the traps and the reference list in
`codex`, verification and the agent's return in `orchestrate`. Each page should keep its standing rules within the
first 5,000 tokens and move the rest into the files it links.

## E78. Four of `codex`'s reference files are over 100 lines and open with no list of their contents

**Evidence, level 2.** `plugins/entrust/plugin/skills/codex/references/environment-and-internals.md` (447 lines),
`incidents.md` (223), `parity.md` (203) and `why-not-the-plugin.md` (131) open without a contents list; `codex/SKILL.md:402-411`
routes to sections deep in the first two by anchor. Anthropic's skill authoring page: a reference file longer than 100
lines opens with its contents, because a model may preview it with `head -100`.

**Check.** `head -100 plugins/entrust/plugin/skills/codex/references/environment-and-internals.md | grep -c '^## '`
shows the sections a preview reaches; the locks, the git grant and the receipt come after it.

**Issue text.** A model that previews a long reference file sees only its opening sections and cannot tell what the
rest holds. Each reference file over 100 lines should open with a list of its sections.

## E79. `codex` and `orchestrate` carry 27 inline "measured …" asides that the vendor would move off the page (tension)

**Evidence, level 1.** `grep -c measured` gives 18 on `plugins/entrust/plugin/skills/codex/SKILL.md` and 9 on
`orchestrate/SKILL.md`, for example `codex/SKILL.md:56-57` "(measured 2026-09-12 against the VS Code extension 2.1.269,
whose map lists `local_agent` tasks alone)". Claude Code's skills page: "State what to do rather than narrating how or
why". The repository's `CLAUDE.md` asks for an evidence level on every behavioural claim, and
`codex/references/incidents.md:3` already holds "the measured failures that produced SKILL.md's imperatives". A tension
with the vendor's guidance, recorded for the owner's audit; each aside also counts toward E77.

**Issue text.** The skill pages give the measurement behind an instruction on the instruction's own line. The vendor
advises stating what to do and keeping the story elsewhere; the repository's rule asks for the evidence. Decide whether
the line keeps its level and the incident moves to `incidents.md`.

## E80. `codex/SKILL.md:251` uses a dated catalogue snapshot as the instruction for `EFFORT:` values (tension)

**Evidence, level 1.** `plugins/entrust/plugin/skills/codex/SKILL.md:251`: "(the catalogue of 2026-09-17: `none` and
`minimal` are on no model and exit 2 before the turn)". Anthropic's skill authoring page advises against time-sensitive
information, and its example is an instruction that turns false when a date passes. This line tells the reader which
values to write, from a snapshot of an external catalogue; when the catalogue changes, the line is wrong and the reader
cannot tell. Unlike a dated measurement, which stays a true record, this one is used as a rule.

**Issue text.** The page's list of effort values rests on a catalogue read on 2026-09-17 and presented as current. It
should name where the current values come from, and move the snapshot to an old-patterns note.

## E81. `orchestrate` sends verification to a fresh agent, and Anthropic's page for Opus 5 says not to verify with subagents (tension)

**Evidence, level 1.** `plugins/entrust/plugin/skills/orchestrate/SKILL.md:24` "verify: you never grade your own work, a
fresh agent does" and `:133` the completeness critic. Anthropic's Opus 5 page lists "use a subagent to verify" among
instructions to remove and says not to use subagents to verify or double-check; its Fable 5 page says fresh-context
verifier subagents tend to outperform self-critique. The page pins no coordinator model (`:23` "whatever your own
model"). The rule is the owner's; the vendor's advice is measured per model.

**Issue text.** On an Opus 5 coordinator the page's verification rule and the vendor's guidance for that model collide;
on Fable 5 they agree. Decide whether the rule stands for every coordinator model, as the owner's, or names the model it
holds for.

## E82. The foreman is told to read `orchestrate`, a user-only skill, by path, and Claude Code tells a model not to reproduce a user-only skill another way (tension)

**Evidence, level 1.** `plugins/entrust/plugin/skills/orchestrate/references/foreman.md:24-26`: "It cannot load this skill:
the Skill tool refuses a skill marked `disable-model-invocation`. Name this file, the page and the sibling's page by
absolute path in its brief". Claude Code's skills page: when Claude tries a user-only skill, it is instructed not to
reproduce the steps another way. The user invoked `/entrust:orchestrate` and approved a plan naming the foreman
(`foreman.md:15`), so the host's block does not describe this case, but the page does not say so.

**Issue text.** A foreman that meets Claude Code's rule for user-only skills could refuse to follow the page it was
given by path. The brief should say that the user started the skill and approved this plan.

## E83. `codex` names neither the `codex` CLI nor Node as something that must be installed (tension)

**Evidence, level 1.** `plugins/entrust/plugin/skills/codex/SKILL.md:414` "Installation and upgrades:
[README.md](../../README.md)." and no other line names what must be installed. Anthropic's skill authoring page lists
required packages in SKILL.md and advises against assuming them. A refused launch reaches the coordinator as
`DRIVER_EXIT` and `err.txt` (`codex/SKILL.md:279-281`), so the page has a path for the failure but not for its cause.

**Issue text.** A coordinator on a machine without the `codex` CLI or Node meets a failed launch the page does not
explain. The page should name its dependencies in one line.

## E89. The launcher's plan registration refuses 12 of the 22 role names `orchestrate`'s roles reference defines

**Evidence, level 3.**

- `plugins/entrust/plugin/skills/codex/scripts/agent-run.mjs:416-419` (`classifyRole`) knows a role only by a worker
  word (`implement|writ|worker|build|fix|…`) or a checking word (`critic|verif|review|refut|judge|check|test|advis|…`),
  and `:445` refuses a row whose role has neither: `invalid role for <id>: <role>`, exit 2.
- `plugins/entrust/plugin/skills/orchestrate/SKILL.md:37` registers every agent, Claude or Codex, through `--plan`
  once the plan has a Codex agent, and `orchestrate/references/roles.md:3` has the coordinator choose the role from
  that reference's table, or name a new one the same way.
- 2026-09-29, `classifyRole` over the first column of that table returned no class for 12 of its 22 rows: area scout,
  architect, foreman, strong reader, live prober, recognition reader, blind proposer, dedup-and-rank, surveyor,
  measurer, retrospective analyst, swarm reducer. The row `A1 | opus | architect | nothing | unknown` through
  `--plan --run-dir <dir>` printed `ERROR=invalid role for A1: architect` and exited 2; the same row as
  `split critic` registered with `CHECKING=1`.

**Check.** Import `classifyRole` from `agent-run.mjs` in a `node` one-liner and run it over the first column of
the table in `roles.md`: 12 of 22 come back `null`.

**Issue text.** The coordinator names each agent's role from the roles reference, and the launcher refuses more than
half of those names when the plan is registered: a plan with an architect, an area scout, a measurer or the foreman
exits 2 before its card can be shown, and a coordinator that renames the role to a word the pattern knows gets a
card that no longer says what the agent does. The launcher should accept every role the reference defines, counting
each as a worker, a checker or neither, or the plan step should say which words the launcher counts. The bulk row's
extraction agent, which the orchestrate page's unit now allows, has no row in the reference and no name the pattern
accepts: "bulk extractor", "extractor" and "bulk reader" are all refused, while "bulk verifier" counts as a checker.

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

## E92. Codex agents running side by side share one `$TMPDIR`, and the pages send each agent's overflow there as if it were its own

**Evidence, level 3 for the collision, level 1 for the pages.** `plugins/entrust/plugin/skills/orchestrate/SKILL.md:152`
"A field past the schema's cap goes whole into a file under the agent's temporary directory", and
`plugins/entrust/plugin/skills/codex/SKILL.md:161` "a read agent's own writable root stays there"; the driver grants a
read agent the whole `$TMPDIR` (`plugins/entrust/plugin/skills/codex/scripts/driver.mjs:350`), and a report names no
temporary directory of the agent's own. On 2026-09-28 twelve Codex Luna read agents ran side by side on one brief
that allowed one findings file under `$TMPDIR`; two of them named the same `$TMPDIR/episodes-findings.txt` in
`artifacts`, the file held one agent's list, and the other agent's list was lost, leaving only the counts in its report.

**Issue text.** Codex agents that run side by side share the coordinator's `$TMPDIR`, while the orchestrate and codex
pages describe it as each agent's own temporary directory. Two agents that pick the same file name overwrite each
other, and a finding written there is lost without an error. Each agent should get a temporary directory of its own,
or the pages should have every file an agent leaves carry the agent's id.

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

## E93. `protocol.test.mjs:646` expects `waitMs` of 0 for an approval the fake server settles at once, and the driver computes it from two clock reads

**Evidence, level 3.** `plugins/entrust/evals/protocol.test.mjs:646` fails the case `approval-wait` unless
`e.waitMs === 0`; `plugins/entrust/plugin/skills/codex/scripts/driver.mjs:3108` sets
`entry.waitMs = Date.parse(entry.settledAt) - Date.parse(entry.askedAt)`. On 2026-09-29 Opus R2 of the prepare-feedback
run saw the case fail in 5 of 13 protocol runs across `main` and a branch whose protocol inputs were byte-identical,
each time with `"waitMs":1`, while another full suite ran on the same machine.

**Issue text.** The approval-wait case fails whenever the two timestamps fall on either side of a millisecond, so
`run-all` goes red on an unchanged tree and stops before the suites after protocol. The case should accept a wait of
at most one millisecond.

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
