# Writer report — Codex Sol, frame-first (candidates/sol.md), 2026-09-24, verbatim; commands 27 ok / 2 failed

Path: /var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/terse/runs/20260924-002235-terse-readme-rewrite2/candidates/sol.md

CHECK a — behavioural evidence, against branch terse-process-2026-09-22 at 34fc8ed:

- Line 3, “plugin to assess and improve any text”: level 2; audit/SKILL.md:3-6, rethink/SKILL.md:3-6, rewrite/SKILL.md:3-7, rethink/references/stages.md:46-48.
- Line 3, agents making rounds under rules and best practices: level 2; rewrite/SKILL.md:64-72,74-195 and writing-rules.md:6-25.
- Line 3, aim rather than compression: level 2; stages.md:46-48 and measurements.md:19-29.
- Lines 8 and 9, installation commands: level 3. Each command ran separately with isolated CLAUDE_CONFIG_DIR and exited 0. The initial marketplace add fetched https://github.com/Nowely/agent-skills.git.
- Line 12, Node 22 requirement: level 2; package.json:4-6.
- Line 14, signed-in session requirement: level 3. `CLAUDE_CONFIG_DIR=… claude -p '/terse:audit'` started, exited 1, exact diagnostic: `Not logged in · Please run /login`.
- Line 20, audit scope questions and agent announcement/wait: level 2; audit/SKILL.md:23-29,88-89.
- Lines 22-25, dated report excerpt: level 1; audit.md:991-995 resolves and contains it verbatim.
- Line 28, stop/shape/rethink/rewrite route: level 2; audit/SKILL.md:151-174, rewrite/SKILL.md:14-29, rethink/SKILL.md:90-110.
- Line 34, draft and diff handed over for the reader’s decision: level 2; rewrite/SKILL.md:212-238.
- Lines 39 and 40, update commands: level 3. Each ran separately under the isolated configuration and exited 0.
- Line 47, audit report, ordered causes, file/line, no rewording: level 2; audit/SKILL.md:18-19,120-170.
- Line 48, rethink’s skeleton output: level 2; rethink/SKILL.md:13-21,90-110.
- Line 49, rewrite’s whole draft and diff: level 2; rewrite/SKILL.md:221-238.
- Line 51, each skill started by the reader: level 2; `disable-model-invocation: true` in all three SKILL.md files.
- Lines 53-54, both routes returning to audit with the same questions: level 2; audit/SKILL.md:166-174, rewrite/SKILL.md:22-29, measure.md:106-115.
- Line 58, fresh AI readers, starting point and answer key: level 2; audit/SKILL.md:71-102 and measure.md:8-42.
- Line 58, same questions without the text and score definition: level 2; measure.md:70-86.
- Line 58, five ordered causes: level 2; audit/SKILL.md:125-134.
- Line 59, three writers, two judges and focused AI reviewers: level 2; rewrite/SKILL.md:64-72,150-195 and bake-off.md:17-31.
- Line 59, protected conditions, limits and warnings: level 2; rewrite/SKILL.md:242-245 and writing-rules.md:21-25.
- Line 59, rethink reading comparable documents first: level 2; rethink/SKILL.md:29-52.
- Line 59, length not selecting and reasons for large cuts: level 2; bake-off.md:13-15,101-118 and rewrite/SKILL.md:235-237.
- Line 60, refusal when checked-true claims disappear or false wording returns: level 3; `node plugins/terse/skills/rewrite/scripts/selftest.mjs` exercised both cases and ended with `all checks caught their planted violation`.
- Line 61, run folder and repository boundary: level 3 for this draft—the candidate was written under the supplied external run folder and `git status --short -- plugins/terse` printed nothing. The universal contract and bug branch reached level 2 at rewrite/SKILL.md:76-89,168-177,221-223; a signed-in bug-routing run was not permitted, so that branch was not independently reproduced.
- Line 65, 2026-09-10 answer result and its limits: level 1; measure.md:3-6,123-132 and measurements.md:97-102 resolve. The historical experiment was not rerun.
- Line 66, 2,725 to 2,571 words: level 1; research/2026-09-10-chain/README.md:20,24 resolves. Not rerun.
- Line 67, 2026-09-22 5/7 versus 0/7 result: level 1; audit.md:991-995 resolves. Not rerun.
- Line 69, no measured human-reading improvement: level 1; audit.md:995 and references/prior-art.md:132 resolve.

CHECK b — Nothing required by a section purpose was omitted. I did not add reload/restart or permission-prompt clauses because the isolated runs showed neither. Full signed-in skill execution was unavailable by instruction; that limits the lifecycle evidence noted above.

CHECK c — I kept the Node requirement, signed-in-session requirement, agent-count/model announcement and wait, shape agreement gate, protected condition/limit/warning, reasons for cuts of twenty words or more, repository-write boundary, sample sizes, chance result, missing 2026-09-10 no-text comparison, and absence of human-reader measurement.

CHECK d — sections.mjs:

(opening): 70 / 70
Quick start: 160 / 180
Skills: 124 / 130
How it works: 140 / 140
What was measured: 104 / 105
Total: 598 / 625; 0 sections over budget.
