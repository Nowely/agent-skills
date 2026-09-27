# 05d. Live prober T1

Codex Terra T1, five fields verbatim from its report (`terra-t1`). Run: 543018 tokens (483072 cached input), 381 s, 16 commands, 0 declined, exit 0, receipt true, network off.

## status

done

## result

Codex Terra T1: done, 22 rows, 22 confirmed, 0 not-confirmed, 0 could-not-run
F1 | confirmed | rg -n -e 'standing|consult|go' plugins/entrust/plugin/skills/advisor/SKILL.md | exit 0; line 17: "stop until \"go\""
F7 | confirmed | rg -n -e 'notification|exit-marker|TaskOutput|background' plugins/entrust/plugin/skills/orchestrate/SKILL.md | exit 0; line 107: "also launch the poll ... <DIR>/exit"
F12a | confirmed | sed -n '60,70p' plugins/entrust/plugin/skills/codex/SKILL.md | exit 0; "run_in_background: false for the one agent you wait for and true for agents that run side by side"
F17 | confirmed | rg -n -e 'Stop|SubagentHandback|foreground ceiling|TaskOutput' plugins/entrust/plugin/skills/orchestrate/SKILL.md plugins/entrust/plugin/agents/codex-agent.md | exit 0; line 106 says "Stop on that card reaches the driver" and codex-agent.md:17 says "Call SubagentHandback"
P1 | confirmed | rg -n -e 'standing|consult|go' plugins/entrust/plugin/skills/advisor/SKILL.md | exit 0; line 13 loads codex alone and line 17 requires "go" before the first question
P7 | confirmed | rg -n -e 'notification|exit-marker|TaskOutput|background' plugins/entrust/plugin/skills/orchestrate/SKILL.md | exit 0; line 107 prohibits TaskOutput but retains the background exit-marker poll
Q3h | confirmed | sed -n '8,35p' plugins/entrust/plugin/skills/orchestrate/references/roles.md | exit 0; recognition reader is "a blind read of a frozen artifact" with no interaction-claim boundary
Q3i | confirmed | sed -n '20,38p' plugins/entrust/plugin/skills/experiment/references/protocols.md | exit 0; E3 defines arms for standing advisor, per-call advice, and no advice
F4 | confirmed | rg -n -e 'final answer|completeness critic|invalidat|digest|sha-?256' plugins/entrust/plugin/skills/orchestrate/SKILL.md plugins/entrust/plugin/skills/orchestrate/references/roles.md plugins/entrust/plugin/skills/orchestrate/references/foreman.md | exit 0; line 123 requires the critic once before send, while no digest/sha/invalidation match was emitted
P2 | confirmed | rg -n -e 'cost|tail -n 5|at most 30 lines|maxLength|maxItems|schemaKeywordsUnchecked' plugins/entrust/plugin/skills/orchestrate/SKILL.md plugins/entrust/plugin/skills/codex/scripts/driver.mjs | exit 0; driver line 3754 emits schemaKeywordsUnchecked, with no maxLength/maxItems page-schema match
P4 | confirmed | rg -n -e 'ANSWER_MAX|answerPath|600' plugins/entrust/plugin/skills/codex/scripts/agent-run.mjs | exit 0; line 258 prints "(long: ${s.length} chars, read the report)" above 600 characters
P8b | confirmed | rg -n -e 'final answer|completeness critic|invalidat|digest|sha-?256' plugins/entrust/plugin/skills/orchestrate/SKILL.md plugins/entrust/plugin/skills/orchestrate/references/roles.md plugins/entrust/plugin/skills/orchestrate/references/foreman.md | exit 0; line 123 has final-version timing but no digest/sha/invalidation match
P8d | confirmed | rg -n -e 'dedup-and-rank|refuted|uncertain|shared prerequisite|unknown' plugins/entrust/plugin/skills/orchestrate/SKILL.md plugins/entrust/plugin/skills/orchestrate/references/roles.md | exit 0; line 119 says "a refuter defaults to `refuted` when it is uncertain"
P11a | confirmed | rg -n -e 'cost|tail -n 5|at most 30 lines|maxLength|maxItems|schemaKeywordsUnchecked' plugins/entrust/plugin/skills/orchestrate/SKILL.md plugins/entrust/plugin/skills/codex/scripts/driver.mjs | exit 0; line 4122 says the validator "does not check" listed schema keywords
Q3a | confirmed | rg -n -i -e 'split critic|split critique|critique the split|before every fan-out|cross-review|criterion|criteria|rejected candidates' plugins/entrust/plugin/skills/orchestrate/SKILL.md plugins/entrust/plugin/skills/orchestrate/references/roles.md plugins/entrust/evals/orchestrate.test.mjs plugins/entrust/evals/orchestrate-live.test.mjs | exit 0; roles.md:10 says "before every fan-out wider than one agent" but contains no wait/apply rule
Q3c | confirmed | rg -n -i -e 'split critic|split critique|critique the split|before every fan-out|cross-review|criterion|criteria|rejected candidates' plugins/entrust/plugin/skills/orchestrate/SKILL.md plugins/entrust/plugin/skills/orchestrate/references/roles.md plugins/entrust/evals/orchestrate.test.mjs plugins/entrust/evals/orchestrate-live.test.mjs | exit 0; line 91 gives the reviewer only "the diff's path in `TASK:`"
Q3j | confirmed | rg -n -i -e 'split critic|split critique|critique the split|before every fan-out|cross-review|criterion|criteria|rejected candidates' plugins/entrust/plugin/skills/orchestrate/SKILL.md plugins/entrust/plugin/skills/orchestrate/references/roles.md plugins/entrust/evals/orchestrate.test.mjs plugins/entrust/evals/orchestrate-live.test.mjs | exit 0; roles.md:23 says "candidates without seeing the others'" and emitted no criterion/criteria match
F20a | confirmed | rg -n -e 'attribut|says\(|shows\(|measurer|retrospective|metrics|matched arms|frozen' plugins/entrust/plugin/skills/orchestrate/SKILL.md plugins/entrust/plugin/skills/orchestrate/references/foreman.md plugins/entrust/plugin/skills/experiment/SKILL.md plugins/entrust/plugin/skills/experiment/references/protocols.md | exit 0; foreman.md:33 says "attributing each finding to the worker"
P12a | confirmed | rg -n 'says\(|shows\(' plugins/entrust/evals/orchestrate.test.mjs | exit 0; COUNT=59
Q3k | confirmed | sed -n '8,35p' plugins/entrust/plugin/skills/orchestrate/references/roles.md | exit 0; measurer returns "the table and the method's caveats" and retrospective analyst returns "incidents with traces", without fixed-input/recomputation requirements
Q3m | confirmed | rg -n -e 'attribut|says\(|shows\(|measurer|retrospective|metrics|matched arms|frozen' plugins/entrust/plugin/skills/orchestrate/SKILL.md plugins/entrust/plugin/skills/orchestrate/references/foreman.md plugins/entrust/plugin/skills/experiment/SKILL.md plugins/entrust/plugin/skills/experiment/references/protocols.md | exit 0; experiment/SKILL.md:21 requires frozen material, while roles.md contains no usefulness-accounting fields
Q7b | confirmed | rg -n -e 'attribut|says\(|shows\(|measurer|retrospective|metrics|matched arms|frozen' plugins/entrust/plugin/skills/orchestrate/SKILL.md plugins/entrust/plugin/skills/orchestrate/references/foreman.md plugins/entrust/plugin/skills/experiment/SKILL.md plugins/entrust/plugin/skills/experiment/references/protocols.md | exit 0; experiment/SKILL.md:21 specifies frozen matched arms, while protocols.md lists E1/E3/E4 rather than the requested single-reader protocol

## evidence

- Standing probe 1: `node plugins/entrust/plugin/skills/codex/scripts/agent-run.mjs --help` exited 0; help states `--status` "Prints nine lines" and that a missing report reads as unknown.
- Standing probe 2: `node plugins/entrust/plugin/skills/codex/scripts/agent-run.mjs --status --report-file "$TMPDIR/terra-t1-probe/none/report.json"` exited 0; exactly nine lines: DRIVER_EXIT=unknown, PATH=none, EXIT=unknown, FIRST=, ANSWER=, ERROR=, RECEIPT=, FILE=missing, REPORT=…/none/report.json. `find "$TMPDIR/terra-t1-probe" -maxdepth 2 -mindepth 1 -print` exited 0 and listed no `none/` path.
- Standing probe 3: `node plugins/entrust/plugin/skills/codex/scripts/driver.mjs --help` exited 0; decisive text: "one corrective turn is spent on a mismatch before exit 13".
- Standing probe 4, `orchestrate.test.mjs`: exit 0; all 70 passed, 0 failed.
- Standing probe 4, `advisor.test.mjs`: exit 0; all 11 passed, 0 failed.
- Standing probe 4, `package.test.mjs`: exit 0; all 12 passed, 0 failed, 1 skipped.
- Standing probe 4, `agent-contract.test.mjs`: exit 0; all 14 passed, 0 failed.
- Standing probe 4, `agent-run.test.mjs`: exit 1; 28 passed, 1 failed of 29. Diagnostic: `process inspection could not run: pgrep -P 60277 gave status 3 and ""`.
- Standing probe 4, `swarm.test.mjs`: exit 0; all 18 passed, 0 failed.
- Standing probe 4, `attach-pasted.test.mjs`: exit 0; all 10 passed, 0 failed.
- Standing probe 4, `experiment.test.mjs`: exit 0; all 21 passed, 0 failed.
- Standing probe 4, `cleanup.test.mjs`: exit 0; all 43 passed, 0 failed, 4 skipped.
- Standing probe 4, `worktree.test.mjs`: exit 0; all 30 passed, 0 failed.
- Standing probe 4, `cli.test.mjs`: exit 0; all 123 passed, 0 failed.
- Standing probe 4, `conformance.test.mjs`: exit 0; all 89 scenarios conform, 0 failed.
- Standing probe 4, `lock.test.mjs`: exit 1; 70 passed, 2 failed of 72.
- Standing probe 4, `protocol.test.mjs`: exit 0; all 147 passed, 0 failed.
- Standing probe 4, `fidelity.test.mjs`: exit 1; 15/15 failed or diverged; it attempted the real rate-limit endpoint despite no live-turn opt-in, then printed `live turn: NOT RUN — set ENTRUST_LIVE_TURN=1 to spend one turn on the real server`. `orchestrate-live.test.mjs` was not run, per instruction.
- Standing probe 5: `rg` over advisor, orchestrate, and codex pages exited 0 with MATCH_COUNT=7. Changelog claims matched advisor/SKILL.md:13 (codex-only load), orchestrate/SKILL.md:106-107 (completion notifications and exit poll), and codex/SKILL.md:69 (no foreground ceiling).
- Further focused outputs, including all row commands and exit markers, are preserved in the temporary artifact directory.

## artifacts

- $TMPDIR/terra-t1-probe/standing-1-agent-run-help.out
- $TMPDIR/terra-t1-probe/standing-2-agent-run-status.out
- $TMPDIR/terra-t1-probe/standing-2-directory-list.out
- $TMPDIR/terra-t1-probe/standing-3-driver-help.out
- $TMPDIR/terra-t1-probe/eval-final-details.out
- $TMPDIR/terra-t1-probe/changelog-page-matches.out
- $TMPDIR/terra-t1-probe/row-F4-P8b.out
- $TMPDIR/terra-t1-probe/row-Q3a-Q3c-Q3j.out
- $TMPDIR/terra-t1-probe/row-P12a-count.out

## open

- `agent-run.test.mjs` did not complete green because sandbox process inspection failed: `pgrep -P 60277 gave status 3 and ""`.
- `lock.test.mjs` exited 1 with 2/72 failed; its detailed failure lines are in the retained output, but the observed summary does not identify their cause.
- `fidelity.test.mjs` was not a safe offline suite in this environment: it attempted a real Codex rate-limit request and exited 1 with 15/15 failed or diverged. No real Codex turn was intentionally started, and `orchestrate-live.test.mjs` was not run.
