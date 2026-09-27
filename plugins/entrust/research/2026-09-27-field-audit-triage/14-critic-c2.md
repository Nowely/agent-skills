# 14 — Completeness critic C2 (Opus), on the answer draft and the PR body

Launched 2026-09-28 at the branch head 41d1218 with the brief `critic-final.md` (the user's requests verbatim, the two publications, the branch, the research run, the changelog, the ledger, the three gate logs). Return verbatim; 230k tokens, 58 tool uses, 1,079 s. Every correction was applied to the answer, the PR body, the run README and rounds.md, except where the row below says otherwise.

status: partial

result:
Opus C2: partial, 18 corrections
1. The answer says at line 1 that PR #26 is updated to the branch head and carries "Closes #15, Closes #16". The files say otherwise (`gh pr view 26`, level 3): the PR head is still `entrust-0.21.0` at cda7a30 with 4 commits, and its title and body are the old ones about the pin. Local 41d1218 has no upstream, `origin/entrust-field-audit-triage` is at 0bb58f9, and #15 and #16 are OPEN. Push the branch and replace the title and body before sending, or say this step is still pending. The draft has no new title, and the current one ("the Codex CLI pin moves to 0.155.1…") misdescribes the PR.
2. The answer (line 3) and the PR (line 3) say "25 done". The PR table marks F18 and P5 (lines 28, 31) done. 09-delta-review.md:61-62 (Codex Sol D0) marks them "Uncovered", 07b's D5 says "0 words saved" on a Codex run, and the PR's own line 106 leaves them open. The table also marks F6 and Q3a done (lines 40, 50), but W2's fix round marks D12 partial (11b-writer-w2.md:93, :118), and E55 (ISSUES.md:50-79) is the defect in that very check. F16 and P13a are marked done (lines 56, 62), but the last case-5 run is red on the D13 count: "6 paragraphs … more than 4" (orchestrate-live-fixrun-3.log:4). With those six moved, the count is 19 done and 23 partial.
3. The PR (lines 38, 47) gives F4 and P8b as partial only because "what follows `not done`" is unchecked. Case 5 shows the delivered answer departing from the frozen file in all three runs, so the pending item is that D10's "what goes out is that file" does not hold for an Opus coordinator.
4. The PR's partial reason for F20a and P13b (lines 57, 63) should also name E56, the attribution check that misreads lists (ISSUES.md:81-97).
5. The answer (line 7) credits the fresh Sonnet verifier with "orchestrate 81 … gate-checks 25". Sonnet V1 reported 80 and 22 (rounds.md:64; PR:110). 81 and 25 are the counts at HEAD after f475c99 and 0784e43. I reran at 41d1218: orchestrate 81 and gate-checks 25. The 16 other offline suites are green with V1's counts. The PR (line 110) should say V1 ran before the last eight commits.
6. For case 7 of the rerun, the answer (line 7) says "2 — одна фраза координатора без квитанции", and the PR (line 111), README.md:184 and rounds.md:71 say "one coordinator claim without its receipt". The phrase quotes the coordinator's own receipt: line 1 of `$TMPDIR/orchestrate-rename-fmt-20260928.ledger.jsonl` has label "baseline suite passes", exit 0. The gate recorded that ledger as the literal, unexpanded `$TMPDIR/…` (run-evidence.json "ledgers"), which d39552c later fixed. lint-draft run with that ledger returns HITS=0 (level 3, my run). So all 20 lines are the gate's own readings: 14 E55, 4 E56 and 2 from the ledger path.
7. The answer (line 7), the PR (line 111), README:184 and rounds:72 say that in all three runs the coordinator reworded the text after the freeze "в 4–7 местах", with "9 из 9". In run 1 the frozen draft went out verbatim: it appears unchanged inside 5-full-run/report.txt (checked True). The coordinator appended two paragraphs after it rather than rewording. Runs 2 and 3 were reworded: seven and five places by rounds.md:71-72, and in run 3 none of the 8 paragraphs matches. No file gives "four". "9 of 9" applies to run 3's manifest3 only: run 2's manifest has 6 entries and run 1's has 8.
8. The last case-5 run's line "The final answer goes out once … the digest check passes", read as a success claim (fixrun-3.log:4), is called the linter's reading of a future tense in rounds.md:72. That makes it a gate defect found in passing, but ISSUES.md holds only E52–E56 and neither text mentions it.
9. The answer (line 9) says "по каждому писателю … один раунд закрыл всё, кроме живого", and the PR (line 113) says "all reproduced, fixed in one round; every return … is in the research run". The files say:
   - Only R3's 14 are recorded as each reproduced (rounds.md:55). R1 reproduces 3 of its 8 by command (12a:24-27). R2 reproduces the runner and help findings by command and only cites lines for the rest (12b:31-38).
   - R3's tokens-`unknown` finding is not fixed and not live-only (13c: "not fixed"; gate-checks.mjs:203 `tokens: Number(tokens)`).
   - Codex Sol W3b and the post-gate commits 0784e43, d39552c, f475c99 and f6029d4 had no cross-review.
   - V1, E1, the probes and W1/W2's post-gate rounds have no return file, only rows in rounds.md.
10. E54 appears without its finder (answer:11, PR:121). ISSUES.md:40 says "Found in passing by Opus E1".
11. The answer (line 13) and the PR (line 106) say the page grew by "примерно на 900 слов" / "about 900 words". `wc -w` gives 3,649 on main against 4,703 at HEAD, so +1,054; 900 was W1's first-round figure (rounds.md:51). The codex page is 4,653 words at HEAD, not 4,511. The answer's "по вашему решению 6" is also wrong: decision 6 accepted that D5 saves nothing on Codex runs (README.md:72, :122). The recipe as the next step is the architect's open item and the orchestrator's decision 14 (10-fix-round-decisions.md:16).
12. Cost (answer:15) does not follow from the files:
   - "W1 0,38M": 11a-writer-w1.md:3 gives 301k + 8k + 355k = 664k, before W1's gate rounds.
   - "W2 0,64M со всеми раундами": rounds.md:70 gives 666k.
   - The Claude total of about 1.6M therefore does not follow; by the files it is about 1.9M or more, unless 355k is cumulative, which no file says.
   - The named Codex parts sum to 24.88M. The probes' Codex tokens are in no file.
   - The live gate's 13 sessions and their Codex turns are counted nowhere, and the answer does not say so.
   - "около трёх часов" rests on file times only: e99cdb6 at 22:45 to 41d1218 at 01:33.
13. Machinery in the answer. The run's own lint-draft on the draft gives HITS=12: field ×1 (WORKERS=/CHECKING=, line 5) and machinery ×3 ("драйвер" line 5, "report.json"/"обёртки" line 11, "обёртки" line 15). The rest are unsupported-success hits, which I ran without receipts. W1, W2, W3, W3b, D0, E1 and V1 appear without a model (line 15). The judge is never named as Codex Astra A2 (lines 1, 3).
14. "17 записей CHANGELOG под Unreleased" (answer:5) is wrong as a count of the section. Unreleased holds 39 entries (1 Fixed, 7 Added, 31 Changed). The fix run's are 17 (4 Added, 13 Changed), or 18 with E51's Fixed entry.
15. "режет по капу (измерено двумя пробами)" (answer:5) is wrong. One probe, Codex Luna P6, measured the cut, in one attempt (10-fix-round-decisions.md:18). The earlier probes showed acceptance only (12c Fact 1: "Not measured: whether the server enforces the caps").
16. The PR (line 117) says "the regression count of each round are in rounds.md". rounds.md counts regressions only for the triage (lines 30-34). The fix-run section (lines 40-72) has none, although CLAUDE.md requires it.
17. The answer (line 3) and the PR (line 104) say F2 is measured for the headless client. That measurement is one pair of sessions (9-activation/activation.json), and the gate "records, not judged" (fixrun.log:26). activation-position.md at HEAD still says "Nothing here has been run yet", with the headless rows at 0 runs and unmeasured (lines 3, 40-41).
18. The answer (line 17) leaves out three things the user needs to act on. First, the accepted order "release 0.21.0 … before the fixes" (README.md:124-126) no longer holds once the fixes ride PR #26, and only the user can decide that. Second, decision 14's items marked "recorded for the PR body" appear in neither text: the manifest checks ids, not a prompt's RIGHTS or MODEL, and "approved" means "registered" (10:16; Opus R3's open item in 12c). Third, once #15 and #16 close, the 19 deferred rows, the live checks and E52–E56 are tracked only in the research run and the ledger. One pre-existing item: Unreleased has two "### Changed" headings (CHANGELOG.md:15, :141), inherited from cda7a30. Hypothesis, not recorded anywhere: in case 5 of run 1 the gate's session received a message from another local session (terse-clarity-live-ogxhqx-8f, report.txt), so another session could disturb the gate's sessions.

evidence:
- Read whole: answer-final-draft.md, pr-body-final.md, README.md, rounds.md, 03-split.md, 10, 12a, 12b, 12c, 11b, ISSUES.md, activation-position.md, the three gate logs, and the case-5 reports, drafts and manifests of all three runs. Read in part: 11a, 13c, 09, and 07b (D5, D10, D12, D13 and the tail).
- PR rows: 42 + 30 = 72 unique ids, equal to 06's 72 by script. The 30 not-fixed statuses and verdicts match 06, and their reasons are verbatim. The fixed table has 25 done and 17 partial. Deltas match 07b's headings.
- Gate logs: run 1 3/9 failed, run 2 2/3, run 3 1/1. Case 7 of the rerun has 20 lines. manifest3 (9 entries) and run 2's manifest (6) verify OK with `shasum -c`.
- Suites at 41d1218: orchestrate 81, gate-checks 25. Also green: advisor 13, fragments 11, lint-draft 12, package 13 + 1 skipped, capture-check 11, agent-contract 14, agent-run 32, swarm 19, attach-pasted 10, experiment 21, cleanup 49, worktree 30, cli 129, conformance 92, lock 72, protocol 147.
- git: 22 commits in main..HEAD, and every hash the texts cite exists. Tree still clean after my runs.
- Word counts: orchestrate page 3,649 on main, 4,703 at HEAD; codex page 4,653 at HEAD.
- Schema caps: result 4800; evidence and open items 1000; artifacts items 300.

artifacts: $TMPDIR/c2-suites-summary.txt, $TMPDIR/c2-orch.txt, $TMPDIR/c2-gate.txt and $TMPDIR/c2-suite-*.txt (one per suite); $TMPDIR/c2-unreleased.md.

open:
- Not run: fidelity (it contacts the Codex account) and the live gate.
- Could not tell whether the harness's W1/W2 counts are cumulative, what the probes' Codex tokens were, or when «Сделай их» was said.
- The E55/E56 code-path analysis is the ledger's reading; I checked only the line counts.
- Whether the orchestrator will push before sending is unknown.
- The worktree is a sibling directory, not under .claude/worktrees/ as the owner's memory rule asks. The two were set the same day, and I can't tell which came first.
- Triage-phase claims (foreman, C1) were not re-verified.

## What the orchestrator did with it

Applied: 2 (six rows to partial: 19 done, 23 partial), 3, 4, 5, 6, 7, 9, 10, 11, 12 (costs restated from the files, the probes' and the gate's tokens named as uncounted; «Сделай их» was at 22:50:57 local by the session transcript), 13 (the answer linted with the run's own linter before sending), 14, 15, 16 (a regression line for the fix round in rounds.md), 17 (the protocol's headless rows filled from case 9's record), 18 (the release order and the tracking of the deferred rows go to the user; decision 14's limits into the PR body; the two Changed headings merged in their own commit). 1 is the step after this file: the branch merged into `entrust-0.21.0`, pushed, PR #26 retitled and its body replaced. 8 is E57 and the `unknown` tokens of 9 are E58, in the ledger, not fixed here. The cross-session message hypothesis stands in rounds.md's first-run row as what happened.
