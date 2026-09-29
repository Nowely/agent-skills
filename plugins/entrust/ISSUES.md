# Defects found in passing: entrust

Recorded per the repository rule: evidence at file:line, an evidence level (1: the line resolves; 2: an
independent reader of the code would say the same; 3: the behaviour was made to happen), and wording that
can become an issue unchanged. An entry leaves when its fix lands and the changelog names it. Ids are
shared with terse's ledger, `plugins/terse/ISSUES.md`, so one id names one entry in both. A path
pinned to a commit is that commit's address, with today's beside it.

## E77. After a compaction, Claude Code keeps only the first 5,000 tokens of `codex` and `orchestrate`, and their last sections are lost for the rest of the session

**Evidence, level 3 for the mechanism, level 2 for HEAD's word counts.** Claude Code's skills page: after
auto-compaction it "re-attaches the most recent invocation of each skill after the summary, keeping the first 5,000
tokens of each". At HEAD, `codex/SKILL.md` is 4,242 words (was 5,602 before this branch's own trims, `22777dc` and
`b1056f9`; 5,602 was itself up from the 5,510 first measured, after the E51, E57, E65, E67, E80 and E92 fixes added
material): the 3,400th word falls in the last bullet of "Reading the result" (`codex/SKILL.md:268-277`), so "Prompt
shape" (`:278`), "What the user reads" (`:306`), "Traps" (`:316`) and "References" (`:324`), about 750 words, lie
past it. `orchestrate/SKILL.md` is 5,668 words (was 6,001 before this branch's `887759a`, up from the 5,516 first
measured after the E53, E65, E89, E90 fixes and the Verification analysis bullet): the 3,400th word falls in
"Mechanism" (`:104`); "Approvals" starts at word 3,688 (`:114`), "Verification" at 4,125 (`:124`) and "The agent's
return" at 5,412 (`:151`).

**Check.** `wc -w plugins/entrust/plugin/skills/{codex,orchestrate}/SKILL.md` prints 4242 and 5668; a page past
about 3,400 words loses its tail after a compaction.

**Issue text.** The two skills a coordinator relies on for the whole of a long session are still longer than what
Claude Code keeps of a skill after compaction, though each fix round has cut into both: `codex` from 5,602 to
4,242 words and `orchestrate` from 6,001 to 5,668. Past the first compaction, `codex` loses the prompt shape, what
the user reads, the traps and the reference list; `orchestrate` loses verification, the Result table included, and
the agent's return. Candidates the page writers named for the next cut: `codex`'s "Worktree lifecycle" section
(`:207-230`, 286 words, repeats the driver's help and the internals reference's worktree section) and the Rights
paragraphs after the generated block (`:160-181`, about 250 words), and moving "Prompt shape" and "What the user
reads" up; `orchestrate`'s `--pending` markers paragraph (`:120`, about 75 words) and the Result table
(`:140-149`). Each page should keep its standing rules within the first 5,000 tokens and move the rest into the
files it links.

## E98. The shape of the advisor's `result` reaches the advisor only when the coordinator restates it

**Evidence, level 2.** `plugins/entrust/plugin/skills/advisor/SKILL.md:27` says "Its `result` is a recommendation with the
reasons that decide it, one alternative, and what it would need to see to change its mind", but the advisor is sent only
the prompt block at :21-23 and the driver's standing rules (`plugins/entrust/plugin/skills/codex/scripts/driver.mjs`),
which name no result shape; the block's `TASK:` line (:23) names "one question, the decision you would take without
advice, and the evidence in a few lines" and not that shape. The five-field schema the block names carries no field descriptions
(`plugins/entrust/plugin/skills/codex/schemas/five-fields.schema.json`). The sentence beside it on premises is written as
an instruction to the coordinator ("Ask it to list in `evidence` …"); this one describes the advisor, whose page the
advisor never reads. Found while reviewing the premises fix of 2026-09-29.

**Check.** `grep -n 'alternative' plugins/entrust/plugin/skills/advisor/SKILL.md` finds it only at :27, outside the prompt
block; `grep -c '"description"' plugins/entrust/plugin/skills/codex/schemas/five-fields.schema.json` prints 0.

**Issue text.** The advisor page describes the return it wants, a recommendation with its reasons, one alternative and
what would change the advisor's mind, in a sentence the advisor never receives. Unless the coordinator restates that
shape in `TASK:`, nothing the advisor receives asks for it. The sentence should tell the coordinator to ask for it, as
the premises sentence does, or the `TASK:` placeholder should name it.

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

## E103. A Claude agent's overflow file goes under the coordinator's own `$TMPDIR`, the collision E92 fixed for Codex agents

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
