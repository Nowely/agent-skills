# 12b. Reviewer R2, of W2

Codex Sol R2, five fields verbatim from its report. Run: 1772773 tokens, 212 s, 81 commands, exit 6, network off.

## result

Codex Sol R2: done, 11 findings
D7 | The default flood read-back is 25 lines, so orchestrate case B9 fails | Decision 7 caps the entire read-back at twenty lines | Set the default tail to fifteen and pin the total output bound.
D10 | The offline digest case never rewrites the manifest | Decision 8 requires a regression that fails a rewritten manifest | Mutate the manifest after the critic return and assert rejection.
D14 | lint-draft --help calls its draft SHA256 the digest the critic returns | Decision 9 says the critic returns the distinct manifest digest | Correct the help text and its pin.
D15 | The gate rejects every per-run OUTPUT_SCHEMA path outside /schemas/five-fields.schema.json | Decision 13 permits a schema equal to the shipped one apart from caps | Parse the named file, compare its non-cap structure, and validate with its configured caps.
D6 | The gate treats W1-2 as unlisted even when it is a valid continuation of W1 | Decision 3 requires the gate to use the launcher’s continuation matcher | Import planRowOf into gate-checks.mjs at the imports and use it in manifestProblems at the --new lookup.
D9 | The gate counts roles with its own WORKER and ASSURANCE regexes | Decision 3 requires the launcher’s single role classifier | Import classifyRole into gate-checks.mjs at the imports and use it in cardProblems for WORKERS/CHECKING totals.
D15 | fiveFieldProblems skips the completeness critic’s Claude return | The amended D15 contract requires every return to be admitted in five fields | Validate the critic return too and add a malformed-critic fixture.
D12 | Split admission checks the corrected file path in briefs but never reads its ownership or interfaces | The amended D12 contract requires briefs checked against the completed corrected split | Read the file and compare each brief’s assigned ownership and interfaces; add the omitted-interface fixture.
D4 | ENVIRONMENT validation checks presence and path existence only | The amended D4 contract requires content checked against staged inputs, grants, and named alternatives | Compare the capsule with the staged fixture and add a content mutation.
D6 | Manifest reconciliation checks ids and models but never actual writes against each row’s writes column | The amended D6 contract requires writes reconciled with the approved plan | Compare observed writes and scope with the registered rows and add an out-of-scope-write fixture.
D14 | Final success attribution accepts a receipt label or an agent name without linking each claim to its source | The amended D14 contract requires claim attribution through normalized D15 origins | Preserve origins per claim and check each final claim against them.

## evidence

- node plugins/entrust/evals/capture-check.test.mjs: exit 0, all 10 passed.
- node plugins/entrust/evals/lint-draft.test.mjs: exit 0, all 12 passed.
- node plugins/entrust/evals/fragments.test.mjs: initially exit 0, all 11 passed; later exit 1, 1/11 failed after shared schema/page changes.
- node plugins/entrust/evals/gate-checks.test.mjs: exit 0, all 17 passed.
- node plugins/entrust/evals/experiment.test.mjs: exit 0, all 21 passed.
- node plugins/entrust/evals/orchestrate-live.test.mjs without the live flag: exit 0, printed NOT RUN; no live case was run.
- node plugins/entrust/evals/orchestrate.test.mjs: exit 1, 1/80 failed; B9 says a 5,000-line command printed 25 lines, over twenty.
- node plugins/entrust/evals/advisor.test.mjs: exit 0, all 13 passed.
- node plugins/entrust/evals/run-all.mjs: exit 1, stopped at orchestrate, 0/20 suites green.
- Runner probes: seq 1 100000 exit 0 and 25 printed lines; failing pipeline exit 1 with EXIT=1; kill -TERM $$ exit 143 with EXIT=signal SIGTERM; 64 MB yes/head flood exit 141 with EXIT=141 and 25 printed lines. capture-check.mjs:26 and :226-230 show the default and metadata.
- Draft probe: node lint-draft.mjs draft.txt exited 1 with five hits covering report path, header field, and unsupported success. lint-draft.mjs:29 and criticDigestProblems at gate-checks.mjs:367-369 show the digest mismatch in --help.
- gate-checks.test.mjs:213-239 tests a wrong returned digest and changed draft but contains no rewritten-manifest case; gate-checks.mjs:367-379 performs the digest check.
- gate-checks.mjs:435-437 imposes the schema-path suffix; :447-448 skips the completeness critic.
- agent-run.mjs:263-279 exports classifyRole and planRowOf; gate-checks.mjs:211-212, :230-231 and :260-273 use independent classification and byId lookup.
- gate-checks.mjs:309-320 checks only the corrected split file path and a brief ownership heuristic; :507-512 checks ENVIRONMENT presence and path existence; :257-287 reconciles launches without writes.
- lint-draft.mjs:803-845 checks receipt labels and agent names; gate-checks.mjs:407-426 gathers receipt strings without claim origins.
- node plugins/entrust/evals/fragments.mjs --check: exit 1, two inline schema copies drifted in orchestrate and swarm; these page/schema files are outside W2’s owned diff.
- The 2,951-line w2.diff was read. Its changed-file headers contain only W2-owned paths; no out-of-ownership edit was found.

## artifacts

- /private$TMPDIR/codex-sol-r2/

## open

- The paid live gate was intentionally not armed, so live coordinator behavior remains unknown.
- The later fragment drift arose in concurrently edited schema and page files; attribution to a particular writer is unknown.
- apply_patch for a temporary draft did not start; exit status unknown; exact diagnostic: "patch rejected by user". A shell printf created the draft under the granted temporary root instead.
