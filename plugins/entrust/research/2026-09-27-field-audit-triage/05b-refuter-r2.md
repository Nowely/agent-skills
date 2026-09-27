# 05b. Refuter R2, of O1

Codex Sol R2, five fields verbatim from its report (`sol-r2`). Run: 715313 tokens (642048 cached input), 232 s, 45 commands, 0 declined, exit 0, receipt true, network off.

## status

done

## result

Codex Sol R2: done, 24 rows, 19 upheld, 5 refuted, 0 unknown
F3 | upheld | - | The one-agent bound conflicts with mandatory independent checks and the final critic; clarifying the count is warranted.
F4 | upheld | - | Timing and scope exist, but a later edit can invalidate an unversioned verdict.
F5 | refuted | partial / fix-now | roles.md:18 already limits a refuter to one claim; reviewer overlap and prerefutation deduplication remain unaddressed.
F6 | refuted | partial / fix-now | SKILL.md:117 already requires critique before fan-out; the missing part is reliable completion and application of its result.
F9 | refuted | partial / fix-now | SKILL.md:32 bounds the coordinator’s read-back to five lines; agent command output remains unbounded.
F10 | refuted | partial / fix-now | codex/SKILL.md:337–338 already warns agents about pager status; the coordinator’s tail rule still omits exit status.
F15 | upheld | - | “Targeted bounded checks” has no countable boundary for coordinator work.
F21 | upheld | - | The plan prices agents but gives inline context growth no budget.
P2 | upheld | - | A five-line read-back covers only one inline check; the proposed budget and enforcement are absent.
P3 | upheld | - | No capture-check script or flood replay exists in the inspected scripts and evals.
P4 | upheld | - | Codex status output is bounded, while full return handling and synthesis remain with the coordinator; fidelity needs measurement.
P8a | upheld | - | Separate verification and critic requirements remain; a combined-check experiment is absent.
P8b | upheld | - | The critic is assigned the final answer, but no version binds its verdict to that answer.
P8c | upheld | - | The answer carries the verdict; publication is not gated by it.
P8d | upheld | - | Deduplication follows a wave, and the current refuter rule turns uncertainty into refutation.
P8e | upheld | - | The driver’s session receipt is not a reusable test receipt; measuring duplicate work first is reasonable.
P11a | upheld | - | The five-field schema has no size limits, and the driver does not independently check maxLength.
Q3a | upheld | - | The split-critic step exists, but no inspected fixture checks ownership repair before workers launch.
Q3c | upheld | - | Cross-review exists; its brief does not require the owning unit and consumers.
Q3e | upheld | - | The strong-reader role lacks revision, stopping evidence and a missing-input distinction.
Q3f | refuted | partial / fix-after-measurement | roles.md:9 already bounds a scout to one area and says one per area; disjoint interfaces and the pilot remain open.
Q3j | upheld | - | Proposers cannot see peers, but no selection criterion is declared in advance.
Q4 | upheld | - | The six-part contract and its held-out protocol are absent; the issue calls for a trial.
Q5 | upheld | - | The critic receives request, answer and evidence; no contract-fed critic is mandated.

## evidence

- Repository: `git rev-parse --short HEAD` exit 0 → 882bcf3. Read `plugins/entrust/plugin/skills/orchestrate/SKILL.md` (155 lines), `references/roles.md` (26 lines), `references/foreman.md`, both issue files and `03-split.md`; reads exit 0. The cited main-tree addresses below resolved.
- F3: `orchestrate/SKILL.md:24,53,87,90–95,123` and `evals/orchestrate.test.mjs:267–278,516–530` read, exit 0; one-agent bound and critic pin confirmed.
- F4/P8b/P8c: `orchestrate/SKILL.md:123` and `roles.md:26` read, exit 0; final-answer timing and verdict text confirmed. `rg -n -i 'digest|invalidat'` on orchestration pages yielded 0 matches (exit 1).
- F5/P8d: `roles.md:18,25` read, exit 0; the exact line is “attacks one claim; `refuted` when uncertain.” `orchestrate/SKILL.md:119` retains the uncertainty default. This existing one-claim rule changes F5 from still-true to partial.
- F6/Q3a: `orchestrate/SKILL.md:117` says “Critique the split before the fan-out”; `roles.md:10` says before every wider fan-out. Reads exit 0. `rg` of `evals/orchestrate-live.test.mjs` for split-critic terms found 0 matches (exit 1). The existing instruction changes F6 to partial.
- F9/P2/P3: `orchestrate/SKILL.md:32` says “read back only a 5-line tail”; `rg --files` listed 6 relevant script files and no capture-check script (exit 0). `rg -l 'capture-check|context growth' plugins/entrust/evals` found 0 files (exit 1). The existing coordinator bound changes F9 to partial.
- F10: `orchestrate/SKILL.md:32` omits exit status; `codex/SKILL.md:337–338` warns about pagers; `codex/references/result-gates.md:21–26` explains tail status. Reads exit 0. `sh -c 'exit 7' | tail -n 5` started and returned pipeline exit 0. Existing agent guidance changes F10 to partial.
- F15/F21: `orchestrate/SKILL.md:21–26,40` read, exit 0; inline checks are called “targeted bounded,” and expected tokens are required by tier and role, with no inline cost formula.
- P4: `codex/scripts/agent-run.mjs:81,241–269` read, exit 0; ANSWER_MAX=600 and statusLines emits nine lines. `orchestrate/SKILL.md:15,106–107,146` and `roles.md:25` retain coordinator synthesis and broader Claude returns.
- P8a/P8e: `orchestrate/SKILL.md:24,53,90–91,102,123` and `experiment/references/protocols.md` read, exit 0; the protocol file contains E1–E5, with no combined-assurance or test-receipt protocol. `codex/scripts/driver.mjs:3791–3793` describes a session receipt.
- P11a: `orchestrate/SKILL.md:146,155` and `codex/scripts/driver.mjs:862–875,3130–3160,3750–3754` read, exit 0. Re-ran the analyst’s `$TMPDIR` fake-server probe: command exit 0, 2 output lines; driver exit 0, outputSchemaOk true, schemaKeywordsUnchecked ["maxLength"] for a two-character value against maxLength 1.
- Q3c/Q3e/Q3j: `orchestrate/SKILL.md:90–91,142` and `roles.md:17,19,23` read, exit 0; reviewer inputs, reader stopping rule and proposer selection criterion are absent at those addresses.
- Q3f: `roles.md:9` reads “bounded findings over one area” and “one per area”; read exit 0. `experiment/references/protocols.md` has 5 protocols and no disjoint-area scout pilot. The existing per-area rule changes Q3f to partial.
- Q4/Q5: Issue #16 `issues/16.md:41–76` and `orchestrate/SKILL.md:36–42,123`, `roles.md:26` read, exit 0; the proposed six-part contract is absent and the critic’s current inputs omit it.
- Commands: `node .../agent-run.mjs --help` exit 0, 57 lines; `node .../driver.mjs --help` exit 0, 161 lines; `node plugins/entrust/evals/orchestrate.test.mjs` exit 0, observed “all 70 passed” (72 output lines). Logs are in the listed temporary artifacts.
- Release comparison: `git show entrust@0.20.0:plugins/entrust/skills/orchestrate/SKILL.md` exit 0, 156 lines; corresponding roles file exit 0, 29 lines. The 0.20.0 files sit under `plugins/entrust/skills/`, while main moved them under `plugins/entrust/plugin/skills/`.
- Command unable to read a nonexistent release path: `git show entrust@0.20.0:plugins/entrust/plugin/skills/orchestrate/SKILL.md`; started, exit 128; diagnostic: “fatal: path 'plugins/entrust/plugin/skills/orchestrate/SKILL.md' exists on disk, but not in 'entrust@0.20.0'”. Continued using the release path above.
- Command unable to read a nonexistent test path: `rg -n '^(.*)(F2|B4|C12|E5|P11|schema|maxLength)(.*)$' plugins/entrust/evals/orchestrate.test.mjs plugins/entrust/evals/driver.test.mjs`; started, exit 2; diagnostic: “rg: plugins/entrust/evals/driver.test.mjs: No such file or directory (os error 2)”. The existing orchestrate test file was read separately.

## artifacts

- $TMPDIR/r2-agent-help.OMc5gm
- $TMPDIR/r2-driver-help.EQLJJW
- $TMPDIR/r2-orchestrate-eval.FtPvU2
- $TMPDIR/r2-maxlen.w1jh3T
- $TMPDIR/r2-old-orch.3raOT9
- $TMPDIR/r2-old-roles.4vR251

## open

- P11a: Live Codex server and Claude Workflow enforcement of maxLength/maxItems is unknown; the fake-server probe establishes only the driver’s independent validation gap.
- Q3a/F6: The paid orchestrate-live gate was not run; actual prevention of a premature fan-out is unknown.
- P4/P8a/P8c/Q3f/Q4: Proposed comparative outcomes remain unknown; this read-only refutation did not run new experiments.
