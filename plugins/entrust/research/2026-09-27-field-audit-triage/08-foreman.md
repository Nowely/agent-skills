# 08. The foreman's report

Foreman, Opus, the first use of the unreleased foreman on a real task. Its `result` and `open` verbatim from its
return (harness: 286,335 tokens, 43 tool uses, 5,635 s); its `evidence` was the refuters', the prober's and the
judge's lines verbatim, which are 05a–05d and 06 here, and its `artifacts` the five Codex reports and the five
Claude files copied into 04b, 05a, 05c, 07a and 07b.

## result

Foreman, Opus: done, 9 workers, 0 failed
Codex Sol S1, analyst, group A: done, EXIT=0, 29 rows (partial 7, still-true 14, fixed-on-main 1, not-a-defect 1, not-applicable 5, unknown 1); 629,096 tokens (530,176 of them cached input), 207.5 s turn; wrapper 13,358 tokens, 222.7 s
Opus O1, analyst, group B: done, 24 rows (14 still-true, 9 partial, 1 not-a-defect); 252,932 tokens, 1,059.2 s
Codex Sol S2, analyst, group C: done, EXIT=0, 19 rows (13 still-true, 5 partial, 1 unknown); 679,296 tokens, 171.7 s; wrapper 13,478 tokens, 188.1 s
Opus R1, refuter of S1: done, 29 rows: 19 upheld, 10 refuted, 0 unknown; 227,011 tokens, 1,191.6 s
Codex Sol R2, refuter of O1: done, EXIT=0, 24 rows: 19 upheld, 5 refuted, 0 unknown; 715,313 tokens, 232.4 s; wrapper 13,430 tokens, 248.3 s
Codex Terra T1, live prober: done, EXIT=0, 22 rows: 22 confirmed, 0 not-confirmed, 0 could-not-run; 543,018 tokens, 381.7 s; wrapper 13,361 tokens, 400.2 s
Opus R3, refuter of S2: done, 19 rows: 13 upheld, 6 refuted, 0 unknown; 214,962 tokens, 927.3 s
Codex Astra A2, judge: done, EXIT=0, 72 rows: 1 fixed-on-main, 28 partial, 34 still-true, 4 not-a-defect, 3 not-applicable, 2 unknown (F2, Q7a); 42 fix-now in 19 ranked entries; overruled a refuter on 7 rows; says no fix-now removes a keep step; 3,249,660 tokens, 1,365.1 s; wrapper 14,128 tokens, 1,378.5 s
Fable F1, architect: done, 24 deltas covering all 42 fix-now rows (13 sentences, 9 mechanisms, 2 experiments); 251,452 tokens, 1,063.1 s
The 42 rows F1 drafted (analyst verdict, or the refuter's corrected verdict where it refuted) are exactly A2's 42 fix-now rows. A script compared the two sets: SAME.
Sources: Codex tokens and seconds are the report's tokenUsage.total.totalTokens and timing.wallMs. Claude tokens and seconds, and every wrapper figure, are the harness's subagent_tokens and duration_ms.

My own checks on the briefs and the returns (mechanical, no grading):
- All nine returns: status done. All five Codex reports: exitCode 0, turnStatus completed, receiptOk true, outputSchemaOk true, 0 escalations.
- Prompt counts checked before each launch. R2's prompt carries all 24 of O1's rows. T1's prompt carries 22 rows, each with 22 result and 22 evidence lines. A2's prompt is 89 KB and carries 72 analyst rows, 72 refuter lines and 22 prober lines.
- A script compared the fix-now set after refutation with A2's fix-now rows: both 42, SAME. F1's drafts file has 24 delta sections, D1 to D24.

## open

Deviations from the plan, and choices I made:
- entrust:codex was not loaded with the Skill tool, per the orchestrator's instruction. Every Codex worker used the launcher and the pages at 882bcf3.
- "No network and no server" was read as no network and no real Codex server. Suites that use evals/fake-app-server.mjs were allowed. T1, which chose its own suites, ran fidelity.test.mjs. By T1's account that suite tried the real rate-limit endpoint without the live-turn opt-in. It exited 1 with 15/15 failed, and the NETWORK: no sandbox kept it from reaching the endpoint (T1's statement; I have not verified it). The briefs written after that (R3, A2, F1) excluded fidelity.test.mjs.
- The R2, T1 and A2 prompts were built by a shell pipeline that copied the returns verbatim from their files and reports. The rows in the R1, R3 and F1 briefs were pasted verbatim from jq and grep output. Nothing was retyped by hand.
- A2's brief carried the refuters' result lines and open items verbatim, but only the paths of their evidence (R1 and R3 files, R2 report), to keep the prompt at 89 KB. A2 reports reading all three.
- The plan said both "a Claude worker never spawns agents" and "F1 tags any Agent call opus or sonnet (it should need none)". F1's brief said: it should need none; if one is unavoidable, one at a time, opus or sonnet, never Fable. F1's return names no agent it spawned; I cannot verify that further.
- F1's brief suggested which rows to draft together. Some pairs came from R3's open (F14+P9b, F16+P13a, M1+P12a, F13+P9a). The rest I named from the analysts' own cross-references (F9/F10/P3, F15/F21/P2, F4/P8b, F5/P8d, F6/Q3a, F1/P1, F18/P5, F19/P10a).
- No worker failed, was continued or was relaunched. A2's wrapper made 4 tool calls over 1,378 s, re-running the launcher after its 570 s early returns as designed.

Concerns:
- T1's 22/22 is unanimous, so read it as evidence about the prompt first. Its per-row checks are mostly greps of the quoted lines (level 1). They confirm the text at each address, not the analyst's status. A2 ruled three of those rows against the analyst despite T1's "confirmed": F7 is fixed-on-main, F12a still-true, Q3h not-a-defect. The only behaviour T1 actually made happen is in its standing probes.
- Three suites failed inside the Codex sandbox and were not run outside it: agent-run.test.mjs 28/29, failed on "pgrep -P <pid> gave status 3", which A2 reproduced; lock.test.mjs 70/72, cause not identified (T1 only); fidelity.test.mjs 15/15, see above. Whether these are sandbox artefacts or defects is unknown.
- Two rows are unknown by A2's ruling, each with its missing check: F2 needs a start-versus-end activation run in each client; Q7a needs the owner's overlap journal.
- Checks no worker ran: a live advisor lifecycle; cross-client notification, Stop and hand-back under the Bash-only wrapper; whether the provider or a Workflow enforces maxLength and maxItems; the paid orchestrate-live gate.
- F1's open items: D5 and D6 conflict (an all-Claude plan cannot name the launcher path for --plan before the codex page is loaded); five deltas (D4, D6, D7, D14, D16) break orchestrate's "prompt only" statement, a replacement sentence is drafted and pin A1 changes with it; D11's unknown verdict for refuters reverses orchestrate:119 and its F2 pin, the owner's call, and this run already used that rule; D16 needs a live check of the server's strict schema.
- 13 of F1's 24 deltas are sentences, the kind of change #15's M1 says has not held. O1 and A2 both flag this.
- The issues' measurements were cited as reported and never reproduced. The owner's local corpora were not read.
- Codex token totals include cached input: A2 used 3.25M in total.

Findings outside the task:
- Found independently by R3 and F1, pre-existing since 0.20.0, level 1: plugins/entrust/plugin/skills/experiment/SKILL.md:19 says "the four registered first are in protocols.md", but protocols.md:3 says "Five experiments" and lists E1 to E5. This could go in plugins/entrust/ISSUES.md; it has no entry yet.
- T1, hypothesis, not verified: fidelity.test.mjs tries the real rate-limit endpoint without the ENTRUST_LIVE_TURN opt-in.
- The agent-run.test.mjs and lock.test.mjs failures under the Codex sandbox, above.
