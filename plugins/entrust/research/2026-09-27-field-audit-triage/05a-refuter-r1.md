# 05a. Refuter R1, of S1

Opus R1, its full return verbatim (harness: 227,011 tokens, 1,192 s).

status:    done

result:
Opus R1: done, 29 rows, 19 upheld, 10 refuted, 0 unknown
F1 | upheld | - | advisor:13 now loads codex, which is model-invocable; advisor:17 still stops for "go" before the first advice, pinned by advisor.test D1.
F2 | upheld | - | Placement is harness behaviour that no tree command decides; orchestrate:6 hides the skill from the model's list, so T8's remark is expected anyway.
F7 | refuted | fixed-on-main / already-fixed | TaskOutput is gone (0 matches, pinned by F9); the recipe now matches #15's level-3 facts; a single wait mechanism is P7's proposal, not F7's claim.
F8 | refuted | partial / fix-after-measurement | The launcher's 570 s return removes the ceiling-to-background trigger behind T6's tail-and-poll breach; T7's report-open breach and the compliant relay cost remain.
F11 | upheld | - | Still guarded by the orchestrate:36 sentence alone (M1); but exit 6 fires only on completed turns, so the fix is P10a's capsule, not classification.
F12a | refuted | still-true / fix-now | codex:64-69 is unchanged since 0.20.0; orchestrate:106 still makes every Codex agent background, a lone waited-on one included; only a headless clause was added.
F12b | refuted | not-a-defect / do-not-fix | orchestrate:90-91 and :142, unchanged since 0.20.0, already bind cross-review to the five fields; the proposed sentence exists; compliance belongs to F20b.
F12c | refuted | still-true / fix-now | On main the advisor loads codex alone; its page never mentions EFFORT and codex:212 invites one, so the top-row rule never reaches it.
F17 | upheld | - | Addresses hold; this subagent's harness offers SubagentHandback and TaskStop, and the pages give SIGTERM and report-file fallbacks, so the probe is cheap.
F18 | upheld | - | orchestrate:12 still loads the whole codex page first; the three pages grew from 9,044 to 9,441 words (wc -w).
F19 | upheld | - | Only orchestrate:36, the sentence 0.20.0's CHANGELOG:94 added, guards it; the driver's standing rules omit writable roots and daemons; a mechanism fits M1.
P1 | upheld | - | Load fixed; the stop before first advice remains (advisor:17, D1 pin), with no opt-out and no lifecycle check; K6 kept at roles.md:12.
P5 | upheld | - | orchestrate:12 still cold-loads codex. Any recipe must carry the codex composition table, which the plan itself uses (orchestrate:41, :85).
P6 | upheld | - | codex:54-59 still routes every Codex turn through the wrapper; no A/B in the tree; the issue itself orders P6 behind experiments.
P7 | upheld | - | Notifications are the default and TaskOutput is gone, but a DONE poll remains for Codex, and the path is chosen by session type, not detected.
P9b | upheld | - | agent-run.mjs has no manifest (0 matches); note it gates Codex launches only, which covers one of F14's four incidents.
P10a | upheld | - | Standing rules (driver.mjs:3922-3960) name network and web search, not writable roots, staged inputs or daemons; no role-compiled brief exists.
P10b | upheld | - | --max-commands caps volume (driver.mjs:2947), not repeated failures; no breaker and no trial exist.
P10c | refuted | partial / fix-after-measurement | Exit 6 fires only after a completed turn (driver.mjs:249-256); status lines already print FIRST and turnStatus; no misreading is recorded.
P11b | refuted | partial / do-not-fix | "Registration" is entrust's --new: a refused prompt leaves none (made to happen); an unrun one is recognised and swept by cleanup (cleanup.mjs:412).
P12b | refuted | partial / fix-now | FIELDS is one constants table and agent-contract.test.mjs:87-103 fails the suite on page-driver drift; page-to-page fragments are still hand-copied.
P14a | upheld | - | run-all lists no position suite; the live gate already drives headless claude -p with the command first (orchestrate-live.test.mjs:515); VS Code needs manual runs.
K7 | refuted | not-a-defect / do-not-fix | Batched registration is several entrust --new calls in one Bash call; nothing on main forbids it, so the keep holds inside entrust.
K8 | upheld | - | No mount surface in the plugin (4 "mount" hits, all driver comments); nothing on main forbids the owner's scheme.
H1 | upheld | - | The start package is the harness's; no plugin page controls it; P5 covers entrust's own reading tax.
H2 | upheld | - | Session creation and compaction are harness controls absent from the plugin; the fork costs are reported, not reproduced.
Q3g | upheld | - | roles.md:20 has no capture barrier and no revision, mode, platform or control fields; one incident, causation unknown.
Q3h | refuted | not-a-defect / do-not-fix | roles.md:22 already returns only ranks or recognitions, for wording decisions; behaviour claims go to the live prober (roles.md:20); no incident is recorded.
Q3i | upheld | - | roles.md:12-13 keep both advisor roles, E3 sits at protocols.md:25-33, and standing activation is still gated (advisor:17).

evidence:
Paths below are under ~/Git/agent-skills-field-audit-triage/plugins/entrust/plugin/ unless marked; "0.20.0:" means `git show entrust@0.20.0:plugins/entrust/<path>`.
Setup: `git rev-parse --short HEAD` exit 0, 882bcf3. S1's source: `jq '.answerJson.result' .../sol-s1/report.json` exit 0, 29 rows, identical to the brief's copy; report exitCode 0, turnStatus completed. Suites (network-free): evals/orchestrate.test.mjs exit 0, all 70 passed; evals/advisor.test.mjs exit 0, all 11 passed; evals/agent-contract.test.mjs exit 0, all 14 passed; evals/package.test.mjs exit 0, 12 passed, 1 skipped (tag case). `agent-run.mjs --help` exit 0, 57 lines; `driver.mjs --help` exit 0, 161 lines; `driver.mjs --help-all` exit 0, 310 lines. Diffs 0.20.0 to HEAD of codex-agent.md, orchestrate/SKILL.md, advisor/SKILL.md, roles.md, codex/SKILL.md: each exit 1 (they differ), codex diff 72 lines; each hunk is cited below by row.
F1: skills/advisor/SKILL.md:13 "Load [codex](../codex/SKILL.md) now (Skill tool, `entrust:codex`) ... needs no other page" (level 1). `grep -n disable-model-invocation skills/*/SKILL.md` exit 0, 5 hits (advisor, cleanup, experiment, orchestrate, swarm); codex is not one of them, so the load is allowed (level 2). advisor:17 "Before its first question, show a plan ... and stop until "go"" against advisor:21 "Ask it at the decision points: the split before a fan-out, the composition" (level 1). evals/advisor.test.mjs:72-77 (D1) pins that stop.
F2: orchestrate/SKILL.md:6 `disable-model-invocation: true` (level 1). A skill with that flag is left out of the model's skill list (level 2; foreman.md:24 says the Skill tool refuses it), so T8's "not in the available skill list" is what that flag produces, wherever the command sits. No live session was run.
F7: `grep -rn TaskOutput plugins/entrust/plugin` gives 0 matches. 0.20.0: orchestrate/SKILL.md:108 had "call `TaskOutput(<poll_task_id>, block: true, timeout: 600000)`" and "never end your turn with an agent alive". HEAD orchestrate:107 has "Wait for the agents ... never on them", "Never read an Agent task's output file", and "In an interactive session you may end your turn with agents alive". These are #15 F7's level-3 facts (no TaskOutput; background agents notify and survive the turn). The poll is a background task, not a foreground sleep. Pinned by F6 (evals/orchestrate.test.mjs:347-356) and F9 (:358-363), inside the 70 passed. CHANGELOG:149-154 (plugins/entrust/CHANGELOG.md). Residual risk (level 2): the new guard against reading an output file is a sentence.
F8: the codex-agent.md diff shows one change, the clause in step 2: "the harness moved the command into the background at its ceiling" became "it ends with RUNNING= instead". Line 21, "Do not open, quote, or summarise any file", is unchanged. `agent-run.mjs --help`: "A call that has waited 570 s prints them with RUNNING=pid <pid> ... this is the early return, before the tool's ten-minute ceiling". CHANGELOG:76-88. #15 F19 reports T6's run R1 at 44 min, which crosses the ceiling four times; that the tail-and-poll breach came from the ceiling is an inference (level 2).
F11: orchestrate:36 "check the required commands against its planned rights and environment" is the claimed fix at 0.20.0: CHANGELOG.md:94-95 (git show exit 0). skills/codex/scripts/driver.mjs:249 has the TURN_NOT_COMPLETED rung (when turnStatus !== "completed"), which comes before :255, ESCALATED. `--help-all` line 297: "6  an approval request was declined; inspect the report, if delivered, before judging task completeness". codex/SKILL.md:289-290: "a cut run carries its entries and exits 3". So every exit 6 is a completed turn (level 2).
F12a: the codex/SKILL.md diff has no hunk in the foreground/background sentence at HEAD 64-69; the only nearby hunk is the short-name lines, 0.20.0 68-69 to HEAD 70-71. Line 0.20.0:107 of orchestrate, "A Codex agent is one background Agent call ... background here, because agents run side by side", is HEAD:106 with "(in a headless session every agent call is foreground)" added and nothing else. The smallest fix: one sentence on orchestrate saying whether a lone waited-on Codex agent follows the sibling's foreground rule; cost S.
F12b: the orchestrate diff has no hunk at HEAD 90-91 ("a cross-review agent is a prompt agent with the diff's path in `TASK:` and the template below in `OUTPUT_SCHEMA:`") or at 142 ("Ask every prompt agent, Claude and Codex alike, for exactly these five fields"). codex/references/adversarial-review.md:3 "This prompt plus its schema is the review route", which is codex-only; orchestrate:12-13 "this page re-cuts only what the mode changes". #15's keep list names run:sol-r1 as cross-review with yield.
F12c: `grep -c -i effort skills/advisor/SKILL.md` gives 0. `grep -c -i 'top-row|top row' skills/codex/SKILL.md` gives 0. codex:212: the EFFORT row is set when "the task is worth more or less thinking than the configured default". orchestrate:77-79: "only a top-row agent goes without one". CHANGELOG:105-109 lists what advisor carries from orchestrate: caps, run directory, plan-and-stop, five fields, and not effort. The smallest fix: one clause in advisor/SKILL.md:17 plus a case in advisor.test.mjs; cost S.
F17: this subagent's own tool list, on 2026-09-27 at commit 882bcf3's run, defines SubagentHandback, and its deferred tools list TaskStop (level 3 for this client only; this is not the wrapper's tools: Bash profile). codex:298 "stop its wrapper ... or send `SIGTERM` to the pid". codex:140-142: the headless continuation. codex:87-93: the early return and the keeper. codex-agent.md:17: SubagentHandback.
F18: `wc -w` exit 0. At 0.20.0: orchestrate 3,546, codex 4,308, roles 1,190, total 9,044, which matches #15. At HEAD: 3,649, 4,511, 1,281, total 9,441, plus foreman.md 950 when a foreman is proposed. orchestrate:12 "Load [codex] now".
F19: driver.mjs:3922-3960 developerInstructions gives sentences for unattended running, the clock, web search, network, failed commands, tests and uncertainty. None names writable roots, /tmp, staged inputs or daemons (level 1).
P1: as F1. `grep -c -i 'opt-out|opt out|stop consulting|no advisor' advisor/SKILL.md` gives 0. advisor.test.mjs has 10 text cases plus a link check (`grep '^test('`), and none is the lifecycle check #16 names: advisor alone, no confirmation, a later verdict, opt-out, no writes. K6: roles.md:12 "advisor, per call".
P5: orchestrate:12 (the load); :41 "composition words ... follow the sibling's table"; :85 "This mode replaces one row of the sibling's composition table". #15's acceptance check (a repeated dry run) is absent from the tree.
P6: codex:54 "One Agent call per agent: a native subagent, the wrapper". #15's acceptance check (A/B over 20 read turns) is absent. The implementation order in #15 step 5 puts 6 behind experiments.
P7: orchestrate:107, both the poll and the notifications, and the headless/interactive split. orchestrate.test.mjs:347-363 pins text, not delivery across harnesses.
P9b: `grep -c -i -E 'manifest|approv' skills/codex/scripts/agent-run.mjs` gives 0. foreman.md:48-49 is a sentence ("Never change the plan"). F14's incidents per #15: T7 an unplanned Codex cross-review (a launcher can catch it), T8 a Sonnet verifier (Claude, bypasses the launcher), T8 memory written before go (no launch), T3 a dropped review (no launch).
P10a: driver.mjs:3922-3960 as F19; roles.md:7-30 has no environment column.
P10b: driver.mjs:2947-2948 cuts on `commands.length >= opts.maxCommands` (volume). `grep -c -i -E 'breaker|consecutive' driver.mjs` gives 0.
P10c: driver.mjs:249-256 as F11. skills/codex/scripts/agent-run.mjs:252-260: EXIT=, FIRST= (the first line of answerJson.result, whose first sentence carries the agent's status by orchestrate:142-143) and RECEIPT=turnStatus=... are on the nine status lines. orchestrate:137 "any other non-zero `exitCode` with an answer | a gate verdict: do not retry, read the answer". #15 records no exit-6 misreading.
P11b: I made it happen under $TMPDIR (level 3). (1) `printf 'FOO: bar\nTASK: x\n' | agent-run.mjs --new --report-file $W/run/a1/report.json` printed "ERROR=unknown header field FOO ...", exit 2, and left agent/ empty. (2) The same path with a valid prompt printed PROMPT=..., exit 0. (3) A third --new on that path was refused, "already exists: one prompt per report path, a relaunch gets a fresh one", exit 2. So a correction to an accepted prompt still leaves one unrun. cleanup.mjs:408-413 "a prompt with neither is a --new nobody ran", read as not in use. 0.20.0: CHANGELOG.md:154-161 "/entrust:cleanup reads them: an agent directory ... its prompt was never run". `grep -rn -i 'registr|register|orphan'` over the plugin and CHANGELOG gives 44 hits, none a prompt registration. That this is what #15 means is an inference (level 2).
P12b: driver.mjs:177 "The prompt-file vocabulary, ONE table", FIELDS at :193. evals/agent-contract.test.mjs:87-103 "SKILL.md's table names every field the driver accepts, and the driver accepts every field it names", passing in the 14. The five-field schema is copied in orchestrate/SKILL.md and swarm/SKILL.md (`grep -l`, 2 files) and pinned separately (orchestrate.test.mjs:377; swarm.test.mjs:103-114).
P14a: evals/run-all.mjs:23 SUITES has 16 entries, none about placement. evals/orchestrate-live.test.mjs:206 builds `claude -p`, and :515 has a prompt beginning "/entrust:orchestrate TASK:". Not run (paid gate).
K7: `agent-run.mjs --help`: "--new --report-file REPORT < prompt", one directory per report path. codex:61 and :122 "Both calls may go in one turn". Nothing in codex/SKILL.md (read whole) or the help forbids several --new calls in one Bash call.
K8: `grep -rn -i mount skills` gives 4 hits, all comments in driver.mjs (:1263, :1356, :1494, :4162). orchestrate:43-52 covers worktrees only.
H1: orchestrate/SKILL.md and codex/SKILL.md, read whole, have no start-package control. #15 files it under "Harness suggestions, outside entrust".
H2: as H1, no session or compaction control. #15 reports the fork costs, 11.2M/0.6M and 12.8M/4.7M.
Q3g: roles.md:20 (the live prober). `grep -c -i -E 'barrier|freeze|revision' roles.md` gives 0. #16 records one incident, "exact race causation unknown".
Q3h: roles.md:22, recognition reader: "a blind read of a frozen artifact; ranks or recognises | ... | ranks or recognitions | a wording decision needs a measurement". roles.md:20 has the live prober "when a claim about behaviour must be proven". #16's journal gives the recognition reader no harm or miss ("no strict decisive total").
Q3i: roles.md:12-13; experiment/references/protocols.md:25-29 (E3, hypothesis and arms); advisor:17.

artifacts:
$TMPDIR/fat-r1-return.ZVaKBu
$TMPDIR/r1-ar-help.4PdgIK
$TMPDIR/r1-drv-help.K42hte
$TMPDIR/r1-drv-helpall.CcqqGF
$TMPDIR/r1-orchestrate.qbhKax
$TMPDIR/r1-advisor.GocK9M
$TMPDIR/r1-agent-contract.lRjrj2
$TMPDIR/r1-package.0pQhgg
$TMPDIR/r1-diff.0cygiU
$TMPDIR/r1-diffcodex.RvV7NY
$TMPDIR/r1-new.pt2ySK (the --new probe's scratch run directory)

open:
F2: no start-versus-end activation run in any client; a live harness session is outside this run.
F7, F17, P7: notification delivery, the Stop card and SubagentHandback were seen only in this subagent's own client and tool profile. The Bash-only wrapper profile and the CLI, headless and JetBrains clients were not probed.
F8: that T6's tail-and-poll breach followed a ceiling move is inferred from run R1's reported 44 min; the transcripts were not available.
F12a: T6 9d2fd317:130 was not available, so what the coordinator did there is unknown.
P11b, K7: reading "prompt registration" as agent-run --new is level 2. #15 does not record what caused the two orphans; a cause outside --new would reopen both rows.
P10c: whether coordinators misread completed exit-6 runs is not recorded anywhere; that measurement decides whether a mechanism is worth building.
Q3h: #16's journal was not available; a recorded case of a recognition reader inferring behaviour would turn this row to partial.
All rows: the issues' measurements are cited as reported, not reproduced.
