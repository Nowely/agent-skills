# 11b. Writer W2, the mechanisms and the gate

Opus W2, its return file verbatim: the first round and the fix round (harness: 468k tokens, 141 tool uses, 3,025 s for the first round).

status: partial

result:
Opus W2: partial, 11 deltas done, 5 partial, 0 not done
D1 | done | evals/orchestrate-live.test.mjs (case 8), evals/lib/gate-checks.mjs | gate case 8 (4 turns); offline: gate-checks "the advisor's prompts" | advice before any other agent in turn 1, a second consultation on the first thread, none after "no advisor", back on "ask the advisor", tree and HEAD unchanged every turn
D2 | done | evals/lib/gate-checks.mjs (advisorPromptProblems), orchestrate-live case 8 | gate-checks "the advisor's prompts: MODEL: astra, the shipped schema, no EFFORT:, every continuation on the first thread" | the assembled prompt is read from each --new heredoc, RESUME checked against the first report's threadId
D4 | partial | lib/gate-checks.mjs (environmentProblems), orchestrate-live case 5/7 | gate-checks "a write agent's prompt carries an ENVIRONMENT: line…" | presence, not a placeholder, every absolute path it names exists; content is not checked against a staged fixture (none is staged)
D5 | done | evals/fragments.mjs, evals/fragments.test.mjs, plugin/skills/orchestrate/references/codex-composition.md (generated), gate cases 1/5/6 | fragments.test (11 cases, 6 mutations); gate-checks "the codex page is loaded before the launcher's first call…"; gate case 6 | codex Composition (whole) + Rights (heading through the paragraph after the table) between markers; schema inline copies; run-dir literal; linked-from and "nothing"-row checks
D6 | partial | lib/gate-checks.mjs (cardProblems, manifestProblems), orchestrate-live (planProblems, runDirProblems, stoppedAtPlan, runProblems) | gate-checks "the card…" and "the manifest…" | card's five rows, ids vs plan.txt, launches by id and model, amend-and-launch in one turn, dropped agent named; writes are not reconciled with the plan's writes column
D7 | done | plugin/skills/orchestrate/scripts/capture-check.mjs, evals/capture-check.test.mjs; gate runnerBriefProblems + inlineCost floods | capture-check.test (10 cases); gate-checks "a brief that asks for a check names the runner", "inline reads are priced…" | pipefail, full log under $TMPDIR 0600, ≤20-line tail clipped at 200 chars, EXIT= last, exit preserved, signals forwarded
D8 | partial | capture-check.mjs (--ledger, --summary), gate inlineCost + inline-cost.json | capture-check.test "--ledger: … a second command on the same question is refused … --summary charges both" | receipts per run (label, lines, bytes, shown lines/bytes, exit); the second command on a label is refused (delegated); later turns beyond the measured one are `unknown`
D9 | done | lib/gate-checks.mjs (cardProblems totals) | gate-checks "the card: … workers and checking agents counted as the plan counts them" | counts stated on the card compared with plan.txt roles (worker count skipped when the plan registers no worker)
D10 | partial | lib/gate-checks.mjs (criticDigestProblems), gate case 5/7 | gate-checks "the critic's digest: …" | shasum manifest named in the critic's brief, its sha256 first in the critic's evidence, every entry re-hashed, the answer equals a frozen file; a `not done` verdict's handling is not checked
D12 | done | lib/gate-checks.mjs (splitAdmissionProblems), orchestrate-live case 7 (splitProject fixture) | gate-checks "the split critic: …"; gate case 7 | no worker brief before the top-row critic returns, each names the critic's file, one owner of lib/shared.mjs (heuristic on ownership verbs)
D13 | done | lib/gate-checks.mjs (phaseProblems) | gate-checks "one paragraph per phase…" | root texts after "go" ≤ phases (4 for slug, 5 for split), none with unsupported success
D14 | partial | plugin/skills/orchestrate/scripts/lint-draft.mjs, evals/lint-draft.test.mjs; gate lintCallProblems + final lint | lint-draft.test (12 cases); gate-checks "the draft was linted before the critic…" | machinery, paths, length, bare ids, unnamed agents, unsupported success with receipts; claim-level attribution through normalized origins is name-level only (every agent the answer names ran)
D15 | done | lib/gate-checks.mjs (parseFiveFields, validate, fiveFieldProblems), gate case 5/7 | gate-checks "five fields: …" and "every return admitted in five fields…" | Codex prompts name the shipped schema, answerJson validated against it, Claude returns parsed and validated, repair or marked-unknown accepted, admission before the critic/final text, answer names only agents that ran
D17 | done | evals/README.md, orchestrate-live.test.mjs header | README "Regressions for recurring findings" + gate header index | policy, offline index, live index, "a case added is not a case run", F7 fixed before, F8 behind measurement
D18 | done | orchestrate-live case 9, research/2026-09-27-field-audit-triage/activation-position.md, lib activationRecord | gate-checks "activation: …"; gate case 9 | first-vs-last pair read from session files; VS Code protocol by hand; 07b's grep corrected
D24 | done | plugin/skills/experiment/references/protocols.md, evals/experiment.test.mjs | experiment.test F1 now E1–E6 | E6 registered with the seven fields; intro says six

evidence:
- node plugins/entrust/evals/capture-check.test.mjs → exit 0, "all 10 passed"
- node plugins/entrust/evals/lint-draft.test.mjs → exit 0, "all 12 passed"
- node plugins/entrust/evals/fragments.test.mjs → exit 0, "all 11 passed"; node plugins/entrust/evals/fragments.mjs --check → "OK=3 fragments, every copy equal to its source", exit 0
- node plugins/entrust/evals/gate-checks.test.mjs → exit 0, "all 17 passed"
- node plugins/entrust/evals/experiment.test.mjs → exit 0, "all 21 passed"
- node plugins/entrust/evals/orchestrate-live.test.mjs → exit 0, "live orchestrate gate: NOT RUN — set ENTRUST_LIVE_ORCHESTRATE=1 to spend real sessions on the orchestrate mode"
- W1's suites, run as they stand: orchestrate.test "all 79 passed" exit 0; advisor.test "all 13 passed" exit 0
- node plugins/entrust/evals/run-all.mjs → starts (list check passes), exit 1: "run-all: package FAILED (exit 1); 5/20 suites green: orchestrate 79 (0s), advisor 13 (0s), fragments 11 (0s), lint-draft 12 (0s), gate-checks 17 (0s)". package's two FAILs are untracked files: "not tracked, so not shipped: skills/codex/schemas/five-fields.schema.json, skills/orchestrate/scripts/capture-check.mjs, skills/orchestrate/scripts/lint-draft.mjs; SKILL.md links to files the payload does not carry: skills/orchestrate/references/codex-composition.md" and the no-.git copy lacking the untracked schema file. Before my run-all edit, package also failed "run-all: SUITES disagrees with evals/: capture-check.test.mjs is not listed; …"; that case now passes.
- Runner, flood: `node capture-check.mjs -- 'seq 1 100000'` → 25 lines printed, "LINES=100000", "BYTES=588895", tail ends "100000", "EXIT=0".
- Runner, masked failure: `--label pipe -- "sh -c 'echo failing; exit 1' | tail -1"` → "failing", "EXIT=1", exit=1. Mutant with pipefail removed (sed on a temp copy) → "EXIT=0", exit 0: the suite's case catches it.
- Runner, signal: `-- 'kill -TERM $$'` → "EXIT=signal SIGTERM", exit=143.
- Runner, 64 MB: `-- "yes '…' | head -c 67108864"` → 25 lines, 1,073 bytes printed, "LINES=1398102", "BYTES=67108864", "EXIT=141" (SIGPIPE of `yes` under pipefail, now documented in --help), real 0.50 s.
- Linter sample: a draft with a path, report.json, exit 6, a five-field block and a missing agent → "LINT=path: 1: …", "LINT=unsupported-success: 1: Opus W2 fixed the runner;", "LINT=five-fields: 3: status, result", "LINT=agent-not-named: 0: Codex Sol D0", "HITS=4", exit=1.
- Gate checks on a saved pre-fix session ($TMPDIR/orchestrate-live-2026-09-27T19-20-59-138Z/5-full-run, turn 2): card "the card has no work, writes, cost, checks row"; critic "names no shasum manifest"; lint "the draft was never linted before the critic read it"; agents ["Codex Terra C1","Opus K1"]; five-field problems [] — the reading works on a real stream.
- Activation reading measured on a real VS Code session file (87619683…jsonl): record 2 is `<command-name>/entrust:orchestrate</command-name>`, record 3 `isMeta: true` "Base directory for this skill: …/skills/orchestrate" with "## Your own hands" and no frontmatter; `grep -c disable-model-invocation` on that file gives 26, `grep -c '"text":"Base directory for this skill: [^"]*/skills/orchestrate'` gives 1.
- E6 mutation (node -e on the F1 logic): as is [], E6 Judge removed → ["E6 lacks Judge"], E6 removed → ["no section for E6"].

artifacts:
- changelog: /var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/w2-changelog.md
- this return: /var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/w2-return.md
- created: /Users/ruliny/Git/agent-skills-field-audit-triage/plugins/entrust/plugin/skills/orchestrate/scripts/capture-check.mjs
- created: /Users/ruliny/Git/agent-skills-field-audit-triage/plugins/entrust/plugin/skills/orchestrate/scripts/lint-draft.mjs
- created (generated): /Users/ruliny/Git/agent-skills-field-audit-triage/plugins/entrust/plugin/skills/orchestrate/references/codex-composition.md
- created: /Users/ruliny/Git/agent-skills-field-audit-triage/plugins/entrust/evals/capture-check.test.mjs
- created: /Users/ruliny/Git/agent-skills-field-audit-triage/plugins/entrust/evals/lint-draft.test.mjs
- created: /Users/ruliny/Git/agent-skills-field-audit-triage/plugins/entrust/evals/fragments.mjs
- created: /Users/ruliny/Git/agent-skills-field-audit-triage/plugins/entrust/evals/fragments.test.mjs
- created: /Users/ruliny/Git/agent-skills-field-audit-triage/plugins/entrust/evals/lib/gate-checks.mjs
- created: /Users/ruliny/Git/agent-skills-field-audit-triage/plugins/entrust/evals/gate-checks.test.mjs
- created: /Users/ruliny/Git/agent-skills-field-audit-triage/plugins/entrust/research/2026-09-27-field-audit-triage/activation-position.md
- changed: /Users/ruliny/Git/agent-skills-field-audit-triage/plugins/entrust/evals/orchestrate-live.test.mjs
- changed: /Users/ruliny/Git/agent-skills-field-audit-triage/plugins/entrust/evals/README.md
- changed: /Users/ruliny/Git/agent-skills-field-audit-triage/plugins/entrust/evals/run-all.mjs
- changed: /Users/ruliny/Git/agent-skills-field-audit-triage/plugins/entrust/evals/experiment.test.mjs
- changed: /Users/ruliny/Git/agent-skills-field-audit-triage/plugins/entrust/plugin/skills/experiment/references/protocols.md
- changed: /Users/ruliny/Git/agent-skills-field-audit-triage/plugins/entrust/plugin/README.md (Layout: orchestrate's scripts/ and the generated reference; protocols "the six registered")

open:
- Two files beyond the brief's list: evals/lib/gate-checks.mjs (the gate's reading of a session, moved out of orchestrate-live with parseStream and the call vocabulary) and evals/gate-checks.test.mjs (runs it offline, added to SUITES). The brief asked to make each gate case's logic testable offline; this is how. Includes one composite case: a whole good run must pass every check at once, and the pre-fix shape must fail eight named ones.
- run-all SUITES order: orchestrate, advisor, fragments, lint-draft, gate-checks, package, capture-check, … (timed: fragments 127 ms, gate-checks 137 ms, lint-draft 322 ms, capture-check 1,175 ms); fragments before package as 07b asks.
- capture-check decisions (documented in --help): the ledger is opt-in (`--ledger FILE`); a label already in it is refused with ERROR=, exit 2, recorded as refused, nothing runs (the "delegated" branch of 09's D8); the default label is the command; `--lines` 1–20 only (more is refused: the page's bound); clipped lines count cut bytes; a signal exits 128+n; a refusal ends with ERROR= and prints no EXIT=; `--summary` prints LATER_READS=unknown. W1's page already passes `--label <question> --ledger <file>`.
- lint-draft decisions (in --help): a success claim passes only if its sentence contains a receipt's label or is marked unverified; ledger receipts that failed or were refused support nothing; `--request` and quoted lines exempt the user's own words (without this every answer about the plugin itself lints red on "driver"); a pasted return needs two of the five labels at line starts; relative repository paths are allowed; one hit per rule per line; SHA256 of the bytes read is printed for the critic's manifest.
- fragments decisions: registry of three (the codex Composition section whole and Rights through the paragraph after its table → generated reference; the schema file → inline copies in orchestrate and swarm; the run-directory path literal in orchestrate, swarm, experiment). `--write` rewrites generated files whole and replaces only the located inline span on a page; I ran it for the reference only, never on a page. Deviation from 07b: its fragment 3 said the run-directory sentence is identical at orchestrate:26-27 and swarm:25; measured, the sentences differ, so only the path literal is checked. swarm/SKILL.md:19 was changed by someone else during the run to the capped schema; before that, fragments.test was red on exactly that line.
- Gate decisions: before "go" a run directory may hold plan.txt alone, and runDirProblems accepts it; a Codex plan must register with --plan, an all-Claude plan must not; case 8 does not require workers to wait for "go" (read-only reviewers need no word under the codex page), only that advice precedes every other agent; case 6 also requires a read of codex-composition.md; D4's ENVIRONMENT check added to cases 5/7 though the brief did not list it (07b assigns it to the gate).
- Heuristics that can misfire on a live run (each labelled in the lib): the card's row labels and count words (EN and RU), ownership of the shared file (a line naming it with an ownership verb, not negated), which briefs "ask for a check", the critic found by "completeness critic" in its description or brief, the advisor found by a Codex brief with MODEL: astra, every root text after "go" counted as a phase paragraph. W1's pages should keep "completeness critic" in that agent's description and the "<Model> <id>:" description form for Claude agents, or the gate cannot find them.
- Only a live run proves: every behaviour in cases 1–9 (none of cases 6–9, nor the new assertions in 1 and 5, has run). Offline proves the gate's reading of a stream, not a coordinator's behaviour.
- Partial deltas: D4 content is not checked against a staged fixture; D6 does not reconcile actual writes with the plan's writes column; D8 prices inline reads within the measured turn only, later turns `unknown`; D10 does not check what a `not done` verdict led to; D14 attribution is name-level (every agent the answer names ran), not per claim.
- Not verified: package.test green once the new files are tracked (it fails now on untracked files only); run-all past package (it stops there); the suites after package are W3's and I did not run them except capture-check and experiment.
- For the ledger (plugins/entrust/ISSUES.md, not mine to write): 07b D18's VS Code check `grep -c disable-model-invocation` measures the wrong thing (26 on a session whose expansion record holds 0 matches); 07b D5's claim that the run-directory sentence is identical on two pages is false. Both are recorded in activation-position.md and here.
- Not mine and still open: 09's uncovered F18/P5 (the smaller Codex-route recipe), D16's Luna probe (owner decision 5).

---

## Fix round (after Codex Sol R2's review and the orchestrator's decisions-fix-round.md), 2026-09-27/28

status: partial

result:
Opus W2: partial, 11 R2 findings: 8 done, 3 partial, 0 not done
R2-1 D7 (decision 7) | done | capture-check.mjs, capture-check.test.mjs | capture-check "a flood … twenty lines read back in all, fifteen of them the tail"; "the twenty-line bound holds at --lines 15 and for a multi-line command" | tail 15 by default and at most, receipt 5 lines, READ_BACK 20; the label prints on one line; orchestrate.test B9 passes
R2-2 D10 (decision 8) | done | gate-checks.test.mjs | gate-checks "the critic's digest…": draft edited and manifest rewritten to match after the verdict fails on the digest alone | the gate already recomputed the manifest's sha256; the case now pins a consistent rewrite
R2-3 D14 help (decision 9) | done | lint-draft.mjs, lint-draft.test.mjs | lint-draft "--help … SHA256 is the draft digest, not the manifest's" (a negative on "the digest the critic returns") | SHA256= is named the draft digest; the manifest digest is another number
R2-4 D15 schema copy (decision 13) | done | lib/gate-checks.mjs (schemaFileOf, fiveFieldProblems, advisorPromptProblems), gate-checks.test.mjs | gate-checks "a per-run OUTPUT_SCHEMA copy equal to the shipped schema apart from its caps…" | the named file is read; equal to the shipped schema with maxLength/maxItems removed is accepted, and its own caps validate the Codex return; a structural difference is refused
R2-5 D6 continuation (decision 3) | done | lib/gate-checks.mjs imports planRowOf from agent-run.mjs; manifestProblems | gate-checks manifest case: C1-2 admitted as C1's next link, C1-02 and X9-2 refused | launches are recorded by their row, so a continuation counts its row as run
R2-6 D9 classifier (decision 3) | done | lib/gate-checks.mjs imports classifyRole; cardProblems | gate-checks card case | the gate's WORKER/ASSURANCE regexes are gone
R2-7 D15 critic | done | lib/gate-checks.mjs fiveFieldProblems | gate-checks five-field case: a critic's prose return is red | the critic's Claude return is parsed and validated like every other, exempt only from the before-synthesis timing
R2-8 D12 corrected split | partial | lib/gate-checks.mjs (parseSplit, splitAdmissionProblems), gate-checks.test.mjs | gate-checks "the corrected split is read: an interface it omits, one its owner's brief omits, and a file a brief takes from its owner are each red" | the file is read and each brief checked against its owners and interfaces; the file's format is free text, parsed heuristically; live case 7 alone shows a real critic's file parses
R2-9 D4 capsule content | partial | lib/gate-checks.mjs environmentProblems (staged, tools) | gate-checks "the capsule against a staged fixture…" with three mutations | offline pinned; the live fixtures stage nothing and run no daemon, so live cases 5/7 still check presence and paths only
R2-10 D6 writes | done | lib/gate-checks.mjs writesProblems, runProblems, orchestrate-live runProblems (cwd, tmp) | gate-checks "writes against the plan…" (nothing, write <dir>, worktree out of scope) and the composite pre-fix run | Claude writes are the Write/Edit/NotebookEdit calls under an agent's call, Codex writes its report's filesTouched; a shell write is invisible
R2-11 D14 claim origins | partial | lib/gate-checks.mjs (originsOf, claimOriginProblems), runProblems | gate-checks "each claim in the answer is held by the return of the agent it credits…" | the answer is cut at each "<Model> <id>", and each fact in the stretch (backquoted span, file path, "N of M", a number of two digits or more) must be in that agent's return; a claim with no such fact is not checked

evidence:
- node plugins/entrust/evals/capture-check.test.mjs → exit 0, "all 11 passed"
- node plugins/entrust/evals/lint-draft.test.mjs → exit 0, "all 12 passed"
- node plugins/entrust/evals/fragments.test.mjs → exit 0, "all 11 passed"; node plugins/entrust/evals/fragments.mjs --check → "OK=3 fragments, every copy equal to its source" (run at the end, after W3b's caps and W1's regenerated lines)
- node plugins/entrust/evals/gate-checks.test.mjs → exit 0, "all 22 passed"
- node plugins/entrust/evals/experiment.test.mjs → exit 0, "all 21 passed"
- node plugins/entrust/evals/orchestrate-live.test.mjs → exit 0, "live orchestrate gate: NOT RUN — set ENTRUST_LIVE_ORCHESTRATE=1 to spend real sessions on the orchestrate mode"
- node plugins/entrust/evals/orchestrate.test.mjs (W1's) → exit 0, "all 80 passed" (B9 among them); advisor.test → "all 13 passed"
- node plugins/entrust/evals/run-all.mjs → exit 0, "run-all: 19/20 suites green, 1 not run — orchestrate 80 (1s), advisor 13 (0s), fragments 11 (0s), lint-draft 12 (0s), gate-checks 22 (0s), package 13 passed, 1 skipped (1s), capture-check 11 (1s), agent-contract 14 (0s), agent-run 32 (73s), swarm 19 (3s), attach-pasted 10 (0s), experiment 21 (1s), cleanup 49 (5s), worktree 30 (16s), cli 129 (23s), conformance 92 (35s), lock 72 (68s), protocol 147 (64s), fidelity 15 (15s), orchestrate-live not run (0s)"
- Runner re-measured: `seq 1 5000` → 20 lines; `seq 1 100000` → 20 lines; the 64 MB `yes | head -c 67108864` flood → 20 lines, 833 bytes, "LINES=1398102", "EXIT=141", real 0.44 s.
- lint-draft --help now reads: "SHA256=<the draft digest: the sha256 of the bytes read. It is one line of the critic's manifest; the manifest digest the critic returns is another number, the sha256 of the manifest file itself>".
- agent-run.mjs as W3b left it exports `classifyRole(role)` → "worker" | "checking" | null and `planRowOf(name, rows, runDir)` → { row, previous, ended } | null (agent-run.mjs:263-280); the gate imports both from ../../plugin/skills/codex/scripts/agent-run.mjs.

artifacts:
- changelog (adjusted): /var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/w2-changelog.md
- this return, appended: /var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/w2-return.md
- changed this round: plugins/entrust/plugin/skills/orchestrate/scripts/capture-check.mjs, plugins/entrust/plugin/skills/orchestrate/scripts/lint-draft.mjs, plugins/entrust/evals/capture-check.test.mjs, plugins/entrust/evals/lint-draft.test.mjs, plugins/entrust/evals/lib/gate-checks.mjs, plugins/entrust/evals/gate-checks.test.mjs, plugins/entrust/evals/orchestrate-live.test.mjs (all under /Users/ruliny/Git/agent-skills-field-audit-triage/)

open:
- planRowOf's signature is R3's own example, `planRowOf(name, rows, runDir)` (12c-reviewer-r3.md (d)); R3 gave no return shape, and W3b's is { row, previous, ended } or null. The gate calls it without runDir, so `ended` is true and the gate never probes a marker; the launcher's refusal of a continuation that has not ended is W3b's, not the gate's. The Claude-row refusal (R3 (c)) lives in --new, not in the matcher, so the gate does not repeat it.
- Only a live run can finish: R2-8, whether a real critic's corrected-split file parses under parseSplit (a line naming paths and one worker id, or the id after "owner"); R2-9, a live capsule against staged inputs (no live fixture stages any, and building one means the gate would have to hand the coordinator a staged input it must discover); R2-11, per-claim origins on a real answer (claims carrying no backquoted span, path or count are not checked).
- Heuristics added this round, each labelled in the lib: parseSplit's line rule; ownsPath's verbs (own, write, edit, change, modify, rename, update) and negation; claim facts; writes visible only through Write/Edit/NotebookEdit/MultiEdit and filesTouched, so a shell write is not reconciled.
- The temporary-directory allowance in writesProblems excludes the working tree when the tree lies under it, as every gate scratch does; without that the check passed every write.
- Decision 7 changed the runner's contract: `--lines` now takes 1 to 15; a coordinator that passed 20 is refused with ERROR=.
- Not done here and not mine: decision 14's D11/D19–D23 behavioural fixtures (live sessions), the page's word growth.
