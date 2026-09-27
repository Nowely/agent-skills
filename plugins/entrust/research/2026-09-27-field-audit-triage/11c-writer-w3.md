# 11c. Writer W3, driver, launcher, schema (first round)

Codex Sol W3, write right on the worktree, five fields verbatim from its report. Run: 12418799 tokens, 1429 s, 110 commands, exit 6, network off.

## result

Codex Sol W3: partial, 4 deltas done, 0 partial, 0 not done
D4 | done | driver.mjs, codex/SKILL.md, cli.test.mjs | CLI capsule case | Effective writable roots and the staged-input rule appear in developer instructions; ENVIRONMENT remains a body line.
D6 | done | agent-run.mjs, cleanup.mjs and their suites | plan, refusal, amendment and cleanup cases | plan.txt gates Codex --new before prompt creation.
D15 | done | five-fields.schema.json, codex/SKILL.md, package.test.mjs | strict schema and payload cases | The five-field schema ships at the documented path.
D16 | done | driver.mjs, schema, cli.test.mjs, agent-run.test.mjs, fake-app-server.mjs | size retry, stripping, overflow and prompt cases | Local caps preserve the complete answer at answerPath.

## evidence

- node plugins/entrust/evals/cli.test.mjs: exit=0
ok    D16 maxLength and maxItems use a corrective turn, strip server keywords, and preserve overflow
ok    D16 invalid size limits are refused before a turn
ok    D16 help documents both local size keywords and per-run schema copies

all 127 passed
- node plugins/entrust/evals/agent-run.test.mjs: exit=0
ok    --new with a prompt the driver refuses prints the driver's reason on ERROR= and no PROMPT=, exits 2, gives a --run nothing to start, and takes the corrected prompt on the same report path
ok    --new refuses a report path a --run has already launched in after a refused --new: ERROR= names the earlier launch's file, and no PROMPT=
ok    --new whose driver check neither passes nor refuses names a driver fault on ERROR= and leaves no prompt

all 30 passed, 1 skipped: a run outlives the launcher that started it and the teardown of that launcher's tree
- node plugins/entrust/evals/cleanup.test.mjs: exit=0
ok    44 · a released link under a reclaim marker: one whose pid is gone or older than the backstop is taken over, a live one refuses
ok    45 · a record swapped for a link after its lstat is unrecognised, and nothing is removed
ok    46 · a reclaim marker replaced after the take by another carrying the same pid is not cleanup's, and the link stays

all 44 passed, 4 skipped: 3 · an agent's line parses whole: running it is kept, gone it is suggested; 4 · a recycled pid is not that agent: a live pid whose recorded identity differs is gone; 8 · every agent naming a run is examined: one published report does not hide a live agent writing to the same path; 11 · an unreadable finding does not cancel the liveness checks that come after it
- GIT_INDEX_FILE=$TMPDIR/w3-package-index node plugins/entrust/evals/package.test.mjs: exit=1
ok    parseCount tells a suite that ran from one that did not
FAIL  run-all fails on a suite a signal killed: the summary does not name the signal: run-all: SUITES disagrees with evals/: capture-check.test.mjs is not listed; fragments.test.mjs is not listed; lint-draft.test.mjs is not listed
      a killed child reports `code` null and `process.exit(null)` exits 0, so a suite that was killed — out of memory, out of a sandbox — used to end run-all green

1/14 failed
- node plugins/entrust/evals/agent-contract.test.mjs: exit=0
ok    what the user reads is prose the coordinator writes, in the user's language, naming an agent by its model
ok    the shipped wrapper is the agent the page names: Bash alone, a pinned model, and a body that never answers the task
ok    the launcher sorts a report by the driver's own words, so the two move together

all 14 passed
- node plugins/entrust/evals/conformance.test.mjs: exit=0
2087 message(s) validated: 1541 notification(s), 11 server request(s), 533 response(s), 2 error response(s)
keywords the validator does not check: definitions, minLength, minimum
excluded, deliberately malformed — unknown-response-id: a response to an id nobody sent; a well-formed one would not test that it is discarded

all 90 scenarios conform to schema-0.155.1
- node plugins/entrust/evals/protocol.test.mjs: exit=0
ok    exit 5: a declared --expect-command with no successful match matches rung 7 and nothing above it
ok    exit 8: a turn that produced no answer matches rung 8 and nothing above it
ok    exit 13: an answer that failed --output-schema matches rung 9 and nothing above it

all 147 passed
- node plugins/entrust/evals/lock.test.mjs: exit=1
ok    the answer reaches the answer log before the turn ends, so a SIGKILL cannot take it with it
ok    a lock is reclaimed only when the driver AND its app-server group are both gone
ok    a lock whose app-server group was recycled by an unrelated process refuses the run

2/72 failed
- node plugins/entrust/evals/worktree.test.mjs: exit=0
ok    a `worktree add` that died after creating the directory leaves its ledger entry behind
ok    a rebuild that cannot finish leaves no tree and no ledger entry
ok    a PRESERVED tree keeps its ledger entry, so something still names it

all 30 passed
- D4 fake-server developer-instruction probe: read exit=0
Your writable roots are: /private$TMPDIR; /tmp is not one. Put generated files under a granted root and name their paths.
If a task says a daemon, socket, or mounted checkout is unavailable, use its staged inputs and named alternative commands; record an unavailable command's exact diagnostic instead of guessing.
- D4 fake-server developer-instruction probe: write exit=0
Your writable roots are: /private$TMPDIR, ~/Git/agent-skills-field-audit-triage, /private$TMPDIR/w3-capsule.sp3l3Z; /tmp is not one.
- D6 --plan: exit=0
PLAN=$TMPDIR/w3-manifest-demo/plan.txt
AGENT=A sol worktree
- D6 unlisted --new: exit=2
ERROR=B is not in the approved plan at $TMPDIR/w3-manifest-demo/plan.txt; amend it with --plan --amend and show the amendment
- D16 --new with capped schema: exit=0
PROMPT=$TMPDIR/w3-cap-demo/A/agent/prompt.txt
- D16 driver.mjs --check-prompt-file on that prompt: exit=0; stdout/stderr=(empty)
- git diff --check on scoped tracked files: exit=0; output=(empty)

## artifacts

- $TMPDIR/w3-changelog.md
- $TMPDIR/w3-return.md
- ~/Git/agent-skills-field-audit-triage/plugins/entrust/plugin/skills/codex/scripts/driver.mjs
- ~/Git/agent-skills-field-audit-triage/plugins/entrust/plugin/skills/codex/scripts/agent-run.mjs
- ~/Git/agent-skills-field-audit-triage/plugins/entrust/plugin/skills/codex/scripts/cleanup.mjs
- ~/Git/agent-skills-field-audit-triage/plugins/entrust/plugin/skills/codex/SKILL.md
- ~/Git/agent-skills-field-audit-triage/plugins/entrust/plugin/skills/codex/schemas/five-fields.schema.json
- ~/Git/agent-skills-field-audit-triage/plugins/entrust/evals/cli.test.mjs
- ~/Git/agent-skills-field-audit-triage/plugins/entrust/evals/agent-run.test.mjs
- ~/Git/agent-skills-field-audit-triage/plugins/entrust/evals/cleanup.test.mjs
- ~/Git/agent-skills-field-audit-triage/plugins/entrust/evals/package.test.mjs
- ~/Git/agent-skills-field-audit-triage/plugins/entrust/evals/fake-app-server.mjs

## open

- D4 decision: daemon and socket wording is conditional on facts in the task. The coordinator supplies staged paths and alternatives in ENVIRONMENT; the driver names configured grants.
- D6 decision: plan.txt uses id | model | role | writes | tokens rows; --amend adds new ids. Registration cannot observe the user's approval word. Cleanup does not infer project ownership from a manifest without a report cwd.
- D16 decision: copy the shipped schema under $TMPDIR to change caps for one run. The server receives a cap-free copy pending a live probe. The bounded summary previews the first 180 result characters and first three evidence items; the complete answer remains at answerPath.
- Actual server acceptance of maxLength and maxItems is unknown; no live Luna probe was run in this scoped work.
- Package remains red because W2-owned run-all.mjs has not listed three concurrent new suites. Its payload and schema cases passed using an isolated temporary index. git add -N started, exited 128, and reported: fatal: Unable to create '~/Git/agent-skills/.git/worktrees/agent-skills-field-audit-triage/index.lock': Operation not permitted. The escalated retry was not started: exec_command failed: CreateProcess { message: "Rejected(\"rejected by user\")" }.
- Lock remains red on two process lifecycle cases. A process inspection command started and reported 'zsh:1: operation not permitted: ps'; its exact ps exit is unknown. The escalated lock rerun was not started: exec_command failed: CreateProcess { message: "Rejected(\"rejected by user\")" }. The suite is outside W3's edit scope.
- The agent-run teardown case skipped because pgrep -P <suite pid> returned status 3 with empty stdout in this sandbox.
- Earlier runs before fixes or concurrent suite registration were red: cli 1/125, agent-run 2/31 then 1/31, cleanup 1/48, package 1/13 then 4/14.
- Return-file validation command node -e require($TMPDIR/w3-return.md) started and exited 1: SyntaxError: Unexpected token ':' at w3-return.md:2. Corrected JSON.parse validation exited 0.
