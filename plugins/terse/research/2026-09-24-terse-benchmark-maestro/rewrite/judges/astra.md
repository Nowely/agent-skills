# Astra — blind README judging sheets

Snapshot: `$TMPDIR/terse-bench/snapshot` (task identifies it as 00f9115; no Git metadata was present in its root listing, so commit identity was not independently verified). Candidate citations `X.md:9`, etc. resolve under `$TMPDIR/terse/runs/20260924-150946-maestro-readme-rewrite/candidates`. All source citations below are relative to the snapshot, never to an online repository. Skeleton citations resolve to `$TMPDIR/terse/runs/20260924-125421-maestro-readme-rethink/skeleton.02.md`.

The skeleton was read first. Its SHA-256 is `c7bb7d0579d69dbcf3ed94515dd1d131aa7cbe2a55a34f53042cc3996c16c583`, matching the brief. The judging rule is `plugins/terse/skills/rewrite/references/bake-off.md`, “The judging sheet, skeleton route.” No forbidden site, root README, research directory, other judge's sheet, or author identity was accessed. No network requests were made. Writes were confined to this temporary directory and its scratch projects; candidates and snapshot were not changed.

## Rule and result

There are **seven scored sections**, the seven explicit Purpose sentences in skeleton §2.1–2.7. Getting started's five blocks do not supply five additional Purpose sentences. Their budgets are reported separately. Purpose is scored for the stated reader task, independently of the accuracy veto; this is not a device-compliance score. A section can cover its task and still contain a disqualifying claim. In particular, estimate caveats in X.md:135 and Y.md:131 cover the requested numbers discussion, but make an inaccurate accuracy guarantee assessed below.

**No eligible winner.** X is vetoed at X.md:57,133,135; Y at Y.md:11,33,89,131; Z at Z.md:22,53,55,129. All score **7/7** for purpose coverage (the seven line-cited verdicts in each sheet). This is a tie in raw purpose scores, **not a surviving-candidate tie**. The rule cannot select a vetoed candidate. Length does not select.

**Grafts: none under the requested rule.** There is no surviving winner, and no candidate has a purpose-coverage deficit that another candidate fills (see the seven verdicts per sheet). No candidate text was merged or repaired. The narrow accuracy repairs noted below explain vetoes; they are not wholesale paragraph grafts and do not rescue eligibility.

## Evidence standard

- L1: a link/file/line resolves. All 30 relative links per candidate resolve, including the banner (X.md:1, Y.md:1, Z.md:1), command-source links (X.md:100–123, Y.md:98–121, Z.md:96–119), and License (X.md:152, Y.md:148, Z.md:148).
- L2: source code or skill instructions prescribe behavior. Command descriptions are evaluated as descriptions of those instructions, not guarantees that an arbitrary model will comply.
- L3-isolated: actual snapshot functions executed with mocked editor/model boundaries and real temporary files. `astra-evidence/probe.cjs` produced **14 passed, 0 failed**; `astra-evidence/lifecycle.cjs`, after correcting a fixture count to count directories, produced **4 passed, 0 failed**. This is not a live VS Code/MCP integration test or an upstream test-suite result.
- Writer-side evidence/run records were not supplied. Their existence or evidence level is **unknown**, not presumed absent. The judge's counterexamples are independently reproducible in the retained probes.
- Copying an erroneous skeleton sentence is not an accuracy exemption: the user asks whether *any* behavioral claim contradicts the snapshot, and the bake-off accuracy floor requires correcting inherited errors.

## Candidate X — OUT; purpose 7/7

### 1. VETO — new false claims: FAIL

1. **X.md:57 and X.md:133 — unconditional per-run logging.** “each `@maestro` run adds a line” / “Run a command ... the extension adds a line” overstates coverage. `maestro-extension/src/chat/participant.ts:180–184` and `:199–202` return directly on wave cancellation, before the completion logger at `:249–250`; the actual writes occur only inside `emitAudit`, `:317–338`. Both cancellation paths were executed: zero audit lines and zero decision lines, with an open writable workspace. Model-selection error also returns without logging (`:135–139`). **L3-isolated counterexamples**, probe checks 1, 2 and 7. Narrow repair: scope the claim to logged execution completion/failure and state that direct wave cancellation can bypass logging; Y.md:55 supplies that cancellation clause (not an exemption for every possible early return).
2. **X.md:135 — “costs are within ±20%.”** This promotes a code comment into an accuracy bound on the reported costs. `packages/core/src/cost-estimator.ts:5` merely states the intended accuracy. `maestro-extension/src/chat/participant.ts:314` always passes `null` for the model; `packages/core/src/cost-estimator.ts:65–66` selects the default price at `:39`, even when a known model has a very different rate at `:27`. Executing the estimator with the same one-million-input/one-million-output token counts produced 10 at the default rate versus 0.75 at its own gpt-4o-mini rate, far outside 20%. **L2 call-site + L3-isolated arithmetic counterexample**, probe check 11. This does not measure a real invoice; it disproves a universal bound from this implementation. Narrow repair: attribute the stated ±20% to Maestro's estimator documentation, without promising that bound for each run (compare Z.md:131's attribution).

### 2. VETO — protected passages: PASS

No skeleton-protected condition, limit or warning is cut: route needs remain at X.md:21–23; project-root/all-skills/manual fallback at X.md:27,33,35–37; unsolicited writes, first workspace folder, only SKILL.md and loss of edits at X.md:52–54; mode-on condition and affected files at X.md:56; opt-in ignore/context exception at X.md:57; restart loss at X.md:85; bootstrap sequence/context priority at X.md:91–94; estimate/non-billing limits at X.md:135; clone-only build at X.md:148. The bootstrap exception at X.md:33,91 corrects the skeleton's overbroad wording, consistent with `source/skills/teach-maestro/SKILL.md:10–12`, rather than weakening a real prerequisite. This PASS does not validate the separate false log/accuracy claims.

### 3. PRIMARY — purpose met

| Section and skeleton purpose | Verdict | Candidate evidence | Reason |
|---|---|---|---|
| Opening: “Say what Maestro is, what it works on and where it runs, how big it is, and where each reader group goes next.” (skeleton:434–435) | **Yes** | X.md:9,11,13 | Identifies the product, AI-workflow subject, supported coding agents, size, and the three next destinations. |
| Getting started: “Take a reader who has not chosen a route to a checked first report, by the route that fits.” (skeleton:462) | **Yes** | X.md:17–23,27–46,50–66,70–94 | Gives a default and a route chooser, install instructions and a first-use surface for each route, then an interview and a report the reader can recognize. The separate accuracy veto is not waived. |
| Commands: “Let either reader find the command for their next problem, and reach its source.” (skeleton:562) | **Yes** | X.md:100–123 | Every named problem/action has a command and a direct source link; all 24 rows are present. |
| Memory across sessions: “Show the loop that carries a record of the reader’s own sessions with their coding agent into the next one, where that record is kept, and what its numbers are worth.” (skeleton:578–579) | **Yes** | X.md:127–135 | Identifies whose sessions and where records live, orders capture → recap → reflect, and explains the estimate/non-billing interpretation. Accuracy of its numeric language is separately vetoed where applicable. |
| Documentation: “Send the reader to depth without repeating it.” (skeleton:598) | **Yes** | X.md:139–142 | Uses labeled links for deeper material without repeating those pages. |
| Support and contributing: “Send a stuck reader to the issues, and a contributor to the one place to edit and the checks to run.” (skeleton:610–611) | **Yes** | X.md:146,148 | Links help to issues, identifies source/skills/, and names check then build. |
| License: “Say whether the project may be reused.” (skeleton:622) | **Yes** | X.md:152 | Names MIT and links its terms. |

### 4. Exclusions respected

**Yes: no excluded material restored** in the sections listed below. X.md:33 repeats the core skill name outside the opening; that is a mechanical one-home departure, not a restored excluded subject or a purpose failure.

- X.md:1–14, Opening: no install route terms, warning, version history, origin story, command names, or authored contents list.
- X.md:15–94, Getting started: no global/clone-build reader install, per-agent setup blocks, HTTP command, servers-form block, MCP tool names, UI tour, or update procedure.
- X.md:96–123, Commands: no core-skill row, frontmatter Use-when descriptions, new marks, or extra table.
- X.md:125–135, Memory across sessions: no JSONL fields, version, actual cost/token figures, waves, or .gitignore explanation.
- X.md:137–142, Documentation: no repeated store/npm listing or copied depth.
- X.md:144–148, Support and contributing: no troubleshooting guide, check internals, community channel, or full contributing guide.
- X.md:150–152, License: no license text or commentary.

### 5. Budget — reported, never selecting

Counts use the skeleton V visible-copy sed pipeline followed by its specified `sections.mjs`; section headings `##` are excluded according to that script. Getting-started block counts use the skeleton whitespace rule, without `###` lines.

| Section | Candidate lines | Words / budget |
|---|---|---|
| Opening | X.md:1–14 | 112 / 120 |
| Getting started | X.md:15–94 | 695 / 700 |
| Commands | X.md:96–123 | 192 / 340 |
| Memory across sessions | X.md:125–135 | 139 / 150 |
| Documentation | X.md:137–142 | 37 / 40 |
| Support and contributing | X.md:144–148 | 54 / 70 |
| License | X.md:150–152 | 3 / 12 |
| **Total** | X.md:1–152 | **1232 / 1,432** |

| Getting-started block | Candidate lines | Words / budget |
|---|---|---|
| Lead-in/chooser | X.md:17–23 | 171 / 150 |
| Skill files | X.md:27–46 | 126 / 130 |
| VS Code extension | X.md:50–66 | 204 / 200 |
| MCP server | X.md:70–87 | 114 / 120 |
| First run | X.md:91–94 | 67 / 85 |

## Candidate Y — OUT; purpose 7/7

### 1. VETO — new false claims: FAIL

1. **Y.md:11,33,89 — universal core/context prerequisites include the bootstrap command.** Y.md:11 says “every command loads [the core skill] first”; Y.md:33 says “every command needs the core skill”; Y.md:89 says “Every command needs `.maestro.md` first.” `source/skills/teach-maestro/SKILL.md:10–12` instead establishes a bootstrap with “No other preparation is needed”; it directs the interview at `:16–20`, creation at `:53`, and saving at `:75`. There is no invoke-core preamble in that skill, unlike `source/skills/diagnose/SKILL.md:12`. The extension loads the requested skill at `maestro-extension/src/chat/participant.ts:93–101` and does not automatically prepend the core skill. The actual registered callback was invoked for teach-maestro with no context; it fetched only teach-maestro, made its model call, and logged completion. **L2 skill instructions + L3-isolated counterexample**, probe check 6. Narrow repair: the exception “but `/teach-maestro`” from Z.md:33,87; for the opening, Z.md:11's “commands build on” is backed by `source/skills/agent-workflow/SKILL.md:35–36`.
2. **Y.md:131 — “costs are accurate to ±20%.”** `packages/core/src/cost-estimator.ts:5` is a comment, not a proven bound. The extension uses `estimateCost(null, ...)` at `maestro-extension/src/chat/participant.ts:314`; the resolver selects default pricing at `packages/core/src/cost-estimator.ts:65–66`, using `:39`, not the known-model rate at `:27`. The executed same-token comparison is 10 default versus 0.75 gpt-4o-mini. **L2 call-site + L3-isolated counterexample**, probe check 11. No actual invoice was measured. Narrow repair: attribute the code's stated accuracy instead of guaranteeing per-run accuracy (Z.md:131 supplies attribution).

Y.md:55,131 do preserve the direct-cancellation exception that X.md:57,133 and Z.md:55,129 omit. Completion/failure writes inside the execution functions are supported by `maestro-extension/src/chat/participant.ts:234–250,276–290,317–338` and probe checks 3–5; cancellation returns by `:180–184,199–202`. These sentences should still be scoped to execution having started: model-selection failures return before logging at `:135–139`. The bootstrap and cost vetoes already decide eligibility.

### 2. VETO — protected passages: PASS

Conditions remain at Y.md:21–23 (requirements), :27,33,35 (project install, complete set, fallback), :50–52 (unsolicited writes, first folder, only SKILL.md, overwrite loss), :54 (mode condition and paths), :55 (opt-in ignore/context exception), :83 (wave restart loss), :89–92 (first-run dependency and context precedence), :131 (estimate and non-invoicing/non-billing language), :144 (clone-only build). The extra cancellation clause at Y.md:55,131 strengthens the logging limit. The overly broad prerequisite at Y.md:89 is an accuracy failure, not a cut of a protection.

### 3. PRIMARY — purpose met

| Section and skeleton purpose | Verdict | Candidate evidence | Reason |
|---|---|---|---|
| Opening: “Say what Maestro is, what it works on and where it runs, how big it is, and where each reader group goes next.” (skeleton:434–435) | **Yes** | Y.md:9,11,13 | Identifies the product, AI-workflow subject, supported coding agents, size, and the three next destinations. |
| Getting started: “Take a reader who has not chosen a route to a checked first report, by the route that fits.” (skeleton:462) | **Yes** | Y.md:17–23,27–44,48–64,68–92 | Gives a default and a route chooser, install instructions and a first-use surface for each route, then an interview and a report the reader can recognize. The separate accuracy veto is not waived. |
| Commands: “Let either reader find the command for their next problem, and reach its source.” (skeleton:562) | **Yes** | Y.md:98–121 | Every named problem/action has a command and a direct source link; all 24 rows are present. |
| Memory across sessions: “Show the loop that carries a record of the reader’s own sessions with their coding agent into the next one, where that record is kept, and what its numbers are worth.” (skeleton:578–579) | **Yes** | Y.md:125–131 | Identifies whose sessions and where records live, orders capture → recap → reflect, and explains the estimate/non-billing interpretation. Accuracy of its numeric language is separately vetoed where applicable. |
| Documentation: “Send the reader to depth without repeating it.” (skeleton:598) | **Yes** | Y.md:135–138 | Uses labeled links for deeper material without repeating those pages. |
| Support and contributing: “Send a stuck reader to the issues, and a contributor to the one place to edit and the checks to run.” (skeleton:610–611) | **Yes** | Y.md:142,144 | Links help to issues, identifies source/skills/, and names check then build. |
| License: “Say whether the project may be reused.” (skeleton:622) | **Yes** | Y.md:148 | Names MIT and links its terms. |

### 4. Exclusions respected

**Yes: no excluded material restored** in the sections listed below. Y.md:55,131 adds a cancellation condition; that is an accuracy qualification, not configuration/UI depth or an update procedure.

- Y.md:1–14, Opening: no install route terms, warning, version history, origin story, command names, or authored contents list.
- Y.md:15–92, Getting started: no global/clone-build reader install, per-agent setup blocks, HTTP command, servers-form block, MCP tool names, UI tour, or update procedure.
- Y.md:94–121, Commands: no core-skill row, frontmatter Use-when descriptions, new marks, or extra table.
- Y.md:123–131, Memory across sessions: no JSONL fields, version, actual cost/token figures, waves, or .gitignore explanation.
- Y.md:133–138, Documentation: no repeated store/npm listing or copied depth.
- Y.md:140–144, Support and contributing: no troubleshooting guide, check internals, community channel, or full contributing guide.
- Y.md:146–148, License: no license text or commentary.

### 5. Budget — reported, never selecting

Counts use the skeleton V visible-copy sed pipeline followed by its specified `sections.mjs`; section headings `##` are excluded according to that script. Getting-started block counts use the skeleton whitespace rule, without `###` lines.

| Section | Candidate lines | Words / budget |
|---|---|---|
| Opening | Y.md:1–14 | 104 / 120 |
| Getting started | Y.md:15–92 | 651 / 700 |
| Commands | Y.md:94–121 | 192 / 340 |
| Memory across sessions | Y.md:123–131 | 123 / 150 |
| Documentation | Y.md:133–138 | 37 / 40 |
| Support and contributing | Y.md:140–144 | 45 / 70 |
| License | Y.md:146–148 | 1 / 12 |
| **Total** | Y.md:1–148 | **1153 / 1,432** |

| Getting-started block | Candidate lines | Words / budget |
|---|---|---|
| Lead-in/chooser | Y.md:17–23 | 140 / 150 |
| Skill files | Y.md:27–44 | 121 / 130 |
| VS Code extension | Y.md:48–64 | 198 / 200 |
| MCP server | Y.md:68–85 | 117 / 120 |
| First run | Y.md:89–92 | 62 / 85 |

## Candidate Z — OUT; purpose 7/7

### 1. VETO — new false claims: FAIL

1. **Z.md:55 and Z.md:129 — “per command run” / “each command run” logging.** `maestro-extension/src/chat/participant.ts:180–184,199–202` returns on direct wave cancellation before `emitAudit` at `:249–250`; actual append calls are at `:317–338`. Executed cancellation before the first phase and during a streamed response both wrote zero audit/decision lines in an open writable project. **L3-isolated counterexamples**, probe checks 1 and 2. Narrow repair: the direct-cancellation clause from Y.md:55, with the positive logging statement scoped to completed/failed execution.
2. **Z.md:22 and Z.md:53 — unconditional overwrite at later starts.** A destructive overwrite exists, but not at every later start as these sentences state. `maestro-extension/src/adapters/mcp-config.ts:53–59` sets `configured=true` if *any* recognized file gets an added entry; only `:66–70` with `configured=false` calls the destructive default writer at `:140–150`. Existing entries return `exists` at `:115–117`. The exact function was run three times: first preserved unrelated configuration; second overwrote it when no entry was added anywhere; a later call preserved `.vscode/mcp.json` when a newly present `.claude/mcp.json` received Maestro's entry. **L3-isolated supporting case and counterexample**, probe checks 8–10. Narrow repair: “can replace `.vscode/mcp.json` when no recognized config receives a new Maestro entry,” retaining the warning without its unsupported universal timing. This repair is not available verbatim in another candidate.

Z.md:131's default-price statement is supported by `maestro-extension/src/chat/participant.ts:314` and `packages/core/src/cost-estimator.ts:39,65–66`; it attributes the ±20% statement instead of promising actual per-run accuracy. Its inclusion is assessed under exclusions below.

### 2. VETO — protected passages: PASS

Protected content remains at Z.md:21–23 (requirements and writes), :27,33,35 (project root, all skills, manual fallback), :50–52 (without asking, first workspace folder, only SKILL.md, rewrite/loss), :54 (mode-on condition and files), :55 (opt-in ignore/context exception), :81 (wave restart loss), :87–90 (bootstrap and context priority), :131 (estimates, not invoicing/billing), :144 (clone-only build). Z.md:131 drops the positive “context budget” explanation but retains the protected non-billing limitation; this is not a weakened warning. Z.md:87's bootstrap exception corrects the source-supported condition (`source/skills/teach-maestro/SKILL.md:10–12`). The new warning at Z.md:53 is not a replacement for the skill-overwrite warning at Z.md:52.

### 3. PRIMARY — purpose met

| Section and skeleton purpose | Verdict | Candidate evidence | Reason |
|---|---|---|---|
| Opening: “Say what Maestro is, what it works on and where it runs, how big it is, and where each reader group goes next.” (skeleton:434–435) | **Yes** | Z.md:9,11,13 | Identifies the product, AI-workflow subject, supported coding agents, size, and the three next destinations. |
| Getting started: “Take a reader who has not chosen a route to a checked first report, by the route that fits.” (skeleton:462) | **Yes** | Z.md:17–23,27–44,48–64,68–90 | Gives a default and a route chooser, install instructions and a first-use surface for each route, then an interview and a report the reader can recognize. The separate accuracy veto is not waived. |
| Commands: “Let either reader find the command for their next problem, and reach its source.” (skeleton:562) | **Yes** | Z.md:96–119 | Every named problem/action has a command and a direct source link; all 24 rows are present. |
| Memory across sessions: “Show the loop that carries a record of the reader’s own sessions with their coding agent into the next one, where that record is kept, and what its numbers are worth.” (skeleton:578–579) | **Yes** | Z.md:123–131 | Identifies whose sessions and where records live, orders capture → recap → reflect, and explains the estimate/non-billing interpretation. Accuracy of its numeric language is separately vetoed where applicable. |
| Documentation: “Send the reader to depth without repeating it.” (skeleton:598) | **Yes** | Z.md:135–138 | Uses labeled links for deeper material without repeating those pages. |
| Support and contributing: “Send a stuck reader to the issues, and a contributor to the one place to edit and the checks to run.” (skeleton:610–611) | **Yes** | Z.md:142,144 | Links help to issues, identifies source/skills/, and names check then build. |
| License: “Say whether the project may be reused.” (skeleton:622) | **Yes** | Z.md:148 | Names MIT and links its terms. |

### 4. Exclusions respected

**No, one reserved code question is restored:** Z.md:131 adds the default-model pricing implementation. The skeleton routes that question outside the README in §6 (“Code questions, not text,” the `participant.ts:314` item) and §7 (“Routed outside the document”). The statement is accurate; exclusion compliance and accuracy are different rows. This does not add a veto or break a tie. Z.md:22,53 describe automatic file effects, not update steps; I do not count them as a forbidden Updating section.

- Z.md:1–14, Opening: no install route terms, warning, version history, origin story, command names, or authored contents list.
- Z.md:15–90, Getting started: no global/clone-build reader install, per-agent setup blocks, HTTP command, servers-form block, MCP tool names, UI tour, or update procedure.
- Z.md:92–119, Commands: no core-skill row, frontmatter Use-when descriptions, new marks, or extra table.
- Z.md:121–131, Memory across sessions: no JSONL fields, version, actual cost/token figures, waves, or .gitignore explanation.
- Z.md:133–138, Documentation: no repeated store/npm listing or copied depth.
- Z.md:140–144, Support and contributing: no troubleshooting guide, check internals, community channel, or full contributing guide.
- Z.md:146–148, License: no license text or commentary.

### 5. Budget — reported, never selecting

Counts use the skeleton V visible-copy sed pipeline followed by its specified `sections.mjs`; section headings `##` are excluded according to that script. Getting-started block counts use the skeleton whitespace rule, without `###` lines.

| Section | Candidate lines | Words / budget |
|---|---|---|
| Opening | Z.md:1–14 | 111 / 120 |
| Getting started | Z.md:15–90 | 665 / 700 |
| Commands | Z.md:92–119 | 192 / 340 |
| Memory across sessions | Z.md:121–131 | 131 / 150 |
| Documentation | Z.md:133–138 | 34 / 40 |
| Support and contributing | Z.md:140–144 | 51 / 70 |
| License | Z.md:146–148 | 7 / 12 |
| **Total** | Z.md:1–148 | **1191 / 1,432** |

| Getting-started block | Candidate lines | Words / budget |
|---|---|---|
| Lead-in/chooser | Z.md:17–23 | 150 / 150 |
| Skill files | Z.md:27–44 | 120 / 130 |
| VS Code extension | Z.md:48–64 | 200 / 200 |
| MCP server | Z.md:68–83 | 112 / 120 |
| First run | Z.md:87–90 | 70 / 85 |

## Shared claim-to-source audit (part of each sheet)

These rows cover the remaining behavior claims rather than treating “no further veto found” as evidence. References in all three candidate columns identify the actual claim being checked. L2 prescriptions do not establish that a live coding agent executes them correctly.

| Claim checked | X lines | Y lines | Z lines | Snapshot file and line; evidence/outcome |
|---|---|---|---|---|
| Identity and AI-workflow subjects | X.md:7,9 | Y.md:7,9 | Z.md:7,9 | `package.json:4` tagline; `source/skills/agent-workflow/SKILL.md:3,35–36,48,70,92,114,136,158,180` domains. L2. |
| Coding-agent fit | X.md:9,21–23,37 | Y.md:9,21–23,35 | Z.md:9,21–23,35 | `scripts/build.js:14–25` ten folder targets; `maestro-extension/src/adapters/editor.ts:23–27` editor detection; `maestro-extension/README.md:127` declared compatible forks. L2 declared support, not live cross-tool compatibility. Folder-to-tool pairs are the owner's explicitly settled mapping (skeleton A2 §11a, A5). |
| 25 skills, 24 commands, seven references, core not user-invocable | X.md:11 | Y.md:11 | Z.md:11 | Enumerated `source/skills/*/SKILL.md`: 25, with 24 `user-invocable: true`; core `source/skills/agent-workflow/SKILL.md:6` is false. Seven actual files under its `reference/`; reference links include `:66,88,110,132,154,176,198`. Core universal-load clause in Y separately vetoed. |
| Skill installer behavior | X.md:21,27–33 | Y.md:21,27–33 | Z.md:21,27–33 | `skills-lock.json:4–7` records source/sourceType/hash, not installer runtime behavior. Skeleton A3 explicitly supplies an inference. Exact installer version, prompts, agent selection and resulting writes: **unknown**, not run; fetching this repository was forbidden. Not mislabeled L3 and not falsely marked as a tested command. |
| Manual project copy and contributor build | X.md:35–37,148 | Y.md:35,144 | Z.md:35,144 | `scripts/build.js:10–25,27–42,71–80`; scripts defined in `package.json:24–26`. L2 plus L3-isolated scratch build: ten copies, each 25 skill directories and seven core references. Manual loads in each actual agent remain untested. |
| Non-bootstrap commands invoke core first | X.md:33 | Y.md:33 | Z.md:33 | Each of the other 23 command files has `source/skills/<name>/SKILL.md:12` invoking core; bootstrap instead `source/skills/teach-maestro/SKILL.md:10–12`. X/Z accurately exempt teach; Y vetoed. |
| Extension identity, startup, VS Code requirement and registries | X.md:22,50 | Y.md:22,48 | Z.md:22,48 | `maestro-extension/package.json:2,6,15–16,32–33`; `.github/workflows/build-extension.yml:50–54` Open VSX publish step. L2. Live registry availability and fork-store selection not independently exercised; the latter is the owner's explicit mapping. |
| Automatic skill synchronization: only SKILL.md, first workspace, overwrite | X.md:22,52–54 | Y.md:22,50–52 | Z.md:22,50–52 | `maestro-extension/src/extension.ts:38–39,194–208,215–240`. L2 activation wiring plus L3-isolated function: ten paths in first folder; second call removes an edit; only SKILL.md created. No full editor was started. |
| Automatic MCP config entry | X.md:22,55 | Y.md:22,53 | Z.md:22,53 | `maestro-extension/src/extension.ts:41–42`; `maestro-extension/src/adapters/mcp-config.ts:38–75`. L3-isolated real writes. Z's universal later-start assertion is separately vetoed; X/Y do not claim the entry preserves other contents. |
| Zero-Defect rules and mode condition | X.md:22,56 | Y.md:22,54 | Z.md:22,54 | `maestro-extension/src/extension.ts:76–91` gets zero-defect content; `maestro-extension/src/core/skills.ts:31–32` returns full body; `maestro-extension/src/adapters/editor.ts:5–6,38–73,80–94,108–120` writes the paths; `source/skills/zero-defect/SKILL.md:20–33` contains eight precision rules. L2 and isolated file creation. Z correctly clarifies whole skill text; X/Y do not say “only eight rules.” |
| Logs, .maestro layout and own gitignore | X.md:57,133 | Y.md:55,131 | Z.md:55,129 | `maestro-extension/src/chat/participant.ts:308–338`; `packages/core/src/decisions.ts:25–35,42–60,85–101`; `packages/core/src/audit.ts:48–62`. L3 actual files. “Context stays versioned” is read as this local ignore file's `!context.md`, not a guarantee that Git has tracked it or no ancestor rule exists. Per-run claims vetoed where unconditional. |
| Sidebar/palette/chat first use | X.md:59–64 | Y.md:57–62 | Z.md:57–62 | `maestro-extension/src/extension.ts:59–62,107–124,177–179,255–275`; titles in `maestro-extension/package.json:71,131`; `maestro-extension/README.md:34–42` chat surface. L2; mocked callback exercised, live UI not exercised. |
| MCP runtime requirement, config and local process | X.md:17,23,70–83 | Y.md:17,23,68–81 | Z.md:17,23,68–81 | `mcp-server/package.json:51–52`; `mcp-server/README.md:19–58`. All JSON blocks match documented command/args/key. L1/L2; no npm install or live client. |
| HTTP documentation destination | X.md:83,141 | Y.md:81,137 | Z.md:81,137 | `mcp-server/README.md:61–69`. Link describes the documented mode; public hosting/authentication fitness is not claimed or tested. |
| MCP serves skills rather than copying skill files | X.md:23,85 | Y.md:23,81 | Z.md:23,81 | `mcp-server/src/prompts.ts:8–39`; `mcp-server/src/tools.ts:175–215` returns skill text. Server can separately write decisions at `:426–465`; candidates say **no skill files**, not “no project writes.” L2. |
| MCP wave state and restart loss | X.md:85 | Y.md:83 | Z.md:81 | `mcp-server/src/wave-state.ts:43–50,67–93,99–135,141–143,188–189`. L2 and isolated fresh-module state check. Full process/client restart untested. |
| Prompt-menu command names | X.md:87 | Y.md:83 | Z.md:83 | `mcp-server/src/prompts.ts:9–14,28–38` names by invocable skill; `source/skills/teach-maestro/SKILL.md:2`, `source/skills/diagnose/SKILL.md:2`. L2. |
| Interview and project-root output | X.md:91–93 | Y.md:89–91 | Z.md:87–89 | `source/skills/teach-maestro/SKILL.md:3,10–20,53,75,96`. L2 instructions; no live agent interview. Y universal prerequisite vetoed. |
| Context precedence | X.md:93 | Y.md:91 | Z.md:89 | `source/skills/agent-workflow/SKILL.md:13–16`; `maestro-extension/src/core/context.ts:11,54–66`. Isolated function loaded directory context rather than root context when both existed. X/Y attach this to first run loosely; it is the context-reading commands/manager, not an extra teach interview instruction. Z makes that subject explicit. |
| Diagnose report criteria | X.md:94 | Y.md:92 | Z.md:90 | `source/skills/diagnose/SKILL.md:16,69–97,124–128`: five scored dimensions, overall /25, action mapping. L2 output specification, not a fabricated observed report. |
| Capture/recap/reflect loop and storage | X.md:9,127–131 | Y.md:9,125–129 | Z.md:9,123–127 | `source/skills/capture/SKILL.md:16,30,58,71`; `source/skills/recap/SKILL.md:16,20–25`; `source/skills/reflect/SKILL.md:16,20–49`. L2 instructions. The stated latest-summary/last-five path follows a successful capture; fallback without a prior capture is outside the shown loop. |
| Only extension's production integration writes command log | X.md:133 | Y.md:131 | Z.md:129 | Production-source scan finds only `maestro-extension/src/chat/participant.ts:317` calling `appendAudit`; its library definition is `packages/core/src/audit.ts:48`. MCP reader says extension at `mcp-server/src/tools.ts:521`. L2; not a claim that a user cannot manually write the file. |
| Duration, token/cost estimates and non-billing meaning | X.md:133–135 | Y.md:131 | Z.md:129–131 | `maestro-extension/src/chat/participant.ts:311–325`; `packages/core/src/token-estimator.ts:1–11,20–22`; `packages/core/src/cost-estimator.ts:5,18–39,50–66`. L2 and actual isolated estimator. X/Y's actual ±20% bound separately vetoed; Z's attributed comment/default behavior supported. |
| Depth destinations | X.md:139–142 | Y.md:135–138 | Z.md:135–138 | Local extension and MCP pages resolve; extension sections `maestro-extension/README.md:34,106,120`, MCP config/mode `mcp-server/README.md:17–69`, local `CHANGELOG.md`. Website's live contents **unknown**; label is the owner's supplied text. |
| Reuse | X.md:152 | Y.md:148 | Z.md:148 | `LICENSE:1,5–13`: MIT and permission terms. L1/L2. |

### Command-row evidence, each candidate

Each following source is `source/skills/<name>/SKILL.md:3` (its description) and `:5` (category), except the already separately cited detailed report/loop specifications. The prescribed reader-facing one-liners are also present at the listed local extension-page lines. “Zero mistakes allowed” is a normative rule (`source/skills/zero-defect/SKILL.md:16,20–33`), not a promise of measured infallibility.

| Name | X | Y | Z | `maestro-extension/README.md` line |
|---|---|---|---|---|
| diagnose | X.md:100 | Y.md:98 | Z.md:96 | 64 |
| evaluate | X.md:101 | Y.md:99 | Z.md:97 | 65 |
| reflect | X.md:102 | Y.md:100 | Z.md:98 | 66 |
| refine | X.md:103 | Y.md:101 | Z.md:99 | 72 |
| streamline | X.md:104 | Y.md:102 | Z.md:100 | 73 |
| calibrate | X.md:105 | Y.md:103 | Z.md:101 | 74 |
| fortify | X.md:106 | Y.md:104 | Z.md:102 | 75 |
| zero-defect | X.md:107 | Y.md:105 | Z.md:103 | 76 |
| amplify | X.md:108 | Y.md:106 | Z.md:104 | 82 |
| chain | X.md:109 | Y.md:107 | Z.md:105 | 83 |
| compose | X.md:110 | Y.md:108 | Z.md:106 | 84 |
| enrich | X.md:111 | Y.md:109 | Z.md:107 | 85 |
| guard | X.md:112 | Y.md:110 | Z.md:108 | 86 |
| iterate | X.md:113 | Y.md:111 | Z.md:109 | 87 |
| accelerate | X.md:114 | Y.md:112 | Z.md:110 | 88 |
| turbocharge | X.md:115 | Y.md:113 | Z.md:111 | 89 |
| temper | X.md:116 | Y.md:114 | Z.md:112 | 90 |
| teach-maestro | X.md:117 | Y.md:115 | Z.md:113 | 96 |
| onboard-agent | X.md:118 | Y.md:116 | Z.md:114 | 97 |
| adapt-workflow | X.md:119 | Y.md:117 | Z.md:115 | 98 |
| specialize | X.md:120 | Y.md:118 | Z.md:116 | 99 |
| extract-pattern | X.md:121 | Y.md:119 | Z.md:117 | 100 |
| capture | X.md:122 | Y.md:120 | Z.md:118 | 101 |
| recap | X.md:123 | Y.md:121 | Z.md:119 | 102 |

## Open observations

- Installer behavior is **unknown**: X.md:21,30,33; Y.md:21,30,33; Z.md:21,30,33. The command was not run because it would fetch the repository prohibited by the brief. `skills-lock.json:5–7` and the owner's inference cannot establish prompts, current folder selection or writes for the external package.
- Live client/editor compatibility and the actual teach/diagnose/capture/recap/reflect results are **unknown**. Static skill instructions and isolated functions were checked; no model was asked to execute these skills. Candidate lines are identified in the shared audit above.
- The source comment's real-world ±20% accuracy is **unknown**. X.md:135 and Y.md:131 nevertheless cannot promise it: the implementation demonstrably uses the wrong known-model rate. Z.md:131 correctly attributes the statement and identifies default pricing.
- External badge values, registry state, website contents and issue availability are **unknown** (X.md:3,50,139,146; Y.md:3,48,135,142; Z.md:3,48,135,142). No external page was fetched. Local package IDs, declared requirements and linked local sources were checked.
- Actual tracked status of a user's context file is **unknown** (X.md:57; Y.md:55; Z.md:55); the local generated ignore rule `!context.md` is observed, not a claim about an arbitrary user's Git index.

## Commands and exit status

Path abbreviations here expand to the absolute paths in the header: S = snapshot, K = skeleton, C = candidate directory; E = this file's sibling `astra-evidence/`. Commands below describe the exact operations, with repeated reads grouped. Shell reads did not change directories inside compound commands.

| Command / operation | Exit and observed result |
|---|---|
| `cat K` | 0; first read, tool output truncated; subsequent bounded reads below supplied the omitted text. |
| `nl -ba K` piped to `sed -n '290,720p'` | 0. |
| `shasum -a 256 K` | 0; matched the required SHA-256. |
| `sed -n '1,289p' K`; `sed -n '721,1025p' K` | Both 0; batched tool presentation truncated; narrower reads below completed coverage. |
| `sed -n '721,810p' K`; `sed -n '248,290p' K`; `sed -n '810,866p' K` | All 0. |
| `cat plugins/terse/skills/rewrite/references/bake-off.md` | 0. |
| `ls -la S` | 0. |
| `nl -ba C/X.md`; same for Y.md and Z.md | All 0. |
| In S: `nl -ba maestro-extension/src/chat/participant.ts` piped to `sed -n '1,380p'` | 0. |
| In S: `nl -ba maestro-extension/src/adapters/mcp-config.ts`; `nl -ba source/skills/teach-maestro/SKILL.md` | Both 0. |
| In S: `rg --files -g 'AGENTS.md' -g 'package.json' -g '*test*' -g '*spec*' -g '*banner*' -g 'tsconfig*' -g 'node_modules/**' .` | Did not start rg; shell exit 127; exact diagnostic: `zsh:1: command not found: rg`. Continued using find/Python. |
| `node --version` | 0; v24.11.0. |
| In S: `find . -name AGENTS.md -o -name package.json -o -name '*test*' -o -name '*banner*'` | 0; no AGENTS.md returned; both banner assets present. |
| In S: `nl -ba maestro-extension/src/extension.ts` piped to `sed -n '1,275p'`; `nl -ba maestro-extension/src/adapters/editor.ts` piped to `sed -n '1,260p'` | Both 0. |
| In S: Python numbered reads of scripts/build.js, package.json, core decisions/audit/cost-estimator/token-estimator, MCP wave-state/prompts | 0. |
| In S: Python numbered reads of agent-workflow (1–120), diagnose/capture/recap/reflect SKILL.md and extension core/context.ts | 0. |
| `mkdir -p E` | 0. |
| Heredoc creation of `E/probe.cjs`; `node E/probe.cjs > E/probe.txt 2>&1`; `cat E/probe.txt` | All 0; **14 passed, 0 failed**. Experimental TypeScript stripping warning retained. |
| In S: Python numbered excerpts of extension README/package, MCP README/package/tools, build-extension.yml, skills-lock.json, LICENSE | 0. |
| Heredoc creation of `E/measure.py`; `python3 E/measure.py > E/measure.txt` | Both 0. The script ran skeleton V sed once per candidate (each 0) and `node ~/Git/agent-skills/plugins/terse/skills/rewrite/scripts/sections.mjs E/<X,Y,Z>.visible.md E/budgets.json` (each 0). Each reported zero top-level sections over budget; nested counts retained separately. |
| `sed -n '1,250p' E/measure.txt`; `sed -n '250,590p' E/measure.txt` | Both 0. |
| Python numbered excerpts of zero-defect SKILL.md, extension package titles/core skills, MCP tools; production-source appendAudit scan | 0. |
| Heredoc creation of `E/lifecycle.cjs`; first `node E/lifecycle.cjs > E/lifecycle.txt 2>&1` | Script started, exit 1; exact leading diagnostic: `AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:` followed by blank line and `26 !== 25`. Three checks ran before the fixture assertion failed. Full diagnostic/stack preserved in E/lifecycle-first-attempt.txt. The fixture counted a non-directory as a skill. |
| `cat E/lifecycle.txt` (first attempt) | 0; displayed failure, not a pass. |
| Python archived the failed log and corrected the fixture to count directories; second `node E/lifecycle.cjs > E/lifecycle.txt 2>&1`; `cat E/lifecycle.txt` | All 0; **4 passed, 0 failed**. Scratch-clone `node <scratch>/clone/scripts/build.js` child exit 0. |
| Heredoc creation of `E/write-sheet.py`; `python3 E/write-sheet.py`; heredoc append of shared audit to astra.md | All 0. |

Supporting outputs are retained beside this sheet. No upstream suite was run and no unrun test is reported as passing.

Final verification: a Python source-reference read and sheet-consistency check exited 0: **9 checks passed, 0 failed**, including three complete sheets, 21 line-cited purpose verdicts, candidate line bounds, cited source existence/line bounds, and no-winner/no-graft consistency. The core's seven reference links were also read at lines 66, 88, 110, 132, 154, 176 and 198. Appending this verification record exited 0.
