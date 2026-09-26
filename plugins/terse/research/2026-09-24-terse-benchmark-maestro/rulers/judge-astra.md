# Blind README judging sheets

Snapshot: the supplied local snapshot at commit 00f9115, with its root README absent. Candidates: P.md, Q.md and R.md in the supplied texts directory. I do not recognize any candidate and have no knowledge of its authorship.

I used the supplied bake-off judging sheet, adapted to independently written texts. There is no prior draft, protected-passage audit or measured reader study against which to score repairs. No network requests were made, no forbidden directory was opened, and the snapshot was not modified.

## Method

Candidate citations use P:line, Q:line and R:line. Source citations below are relative to $TMPDIR/terse-bench/snapshot/.

False-claim counts count distinct propositions, grouping repeated occurrences. An omitted prerequisite or warning can veto a text without adding an affirmative false claim. Unobserved external-client behavior is unknown, not automatically false. Ordinary skill descriptions are instructions for a capable host agent, not guarantees of LLM obedience; explicit route-specific promises are also checked against the runtime. Immediately adjacent qualifications are read together; a contradictory later section does not silently replace an initial instruction.

All word counts are whitespace-delimited words in literal Markdown, including code and Markdown tokens, computed with Python str.split(). Counts are reported, never used to select.

Runtime evidence: a local harness completed **16 checks: 16 passed, 0 failed**. It used actual snapshot TypeScript function bodies transformed by Node, mocked VS Code/model/MCP registration interfaces, and real filesystem operations in temporary fixtures. These are not live-editor, live-LLM, published-package or transport integration tests. The snapshot tree hash before and after the checks was identical: ace46e95be4345438558628b4e77cce2adebc7c0370a8913ebd00a4829f703e2.

## Ranking

1. **P** — P:32, P:141 and P:191 give the reader the strongest basis for an informed installation, including a usable manual source and the actual HTTP and MCP-configuration hazards, although P:191 overstates one hazard's trigger.
2. **R** — R:19–23 and R:93–94 make route selection and expected first-run results easy to find, but the extension route at R:62–66 cannot deliver the saved context promised at R:93.
3. **Q** — Q:263 and Q:266 send the reader to nonexistent installation sources, while Q:49–55 also skips mandatory first-run preparation.

**All three are vetoed.** No surviving text is ranked below a vetoed text. These are not ties: the distinctions concern usable installation, accurate limitations and achievable first-run outcomes, not length or simply fault counts.

| Text | False claims | Decision-point vetoes | Words |
|---|---:|---|---:|
| P | 4 | P:34; P:99–100, P:177 | 2,404 |
| Q | 9 | Q:49–55; Q:149–168; Q:224–235; Q:239–245; Q:252; Q:259–266 | 1,477 |
| R | 1 | R:55; R:62–66 with R:93 | 1,379 |

## Sheet P

### 1. False claims and vetoes

**P-F1 — P:34: every other command reads .maestro.md first and sends the reader to /teach-maestro if that file is missing.** The actual protocol checks .maestro/context.md first, then .maestro.md, and asks for setup only when no context exists: source/skills/agent-workflow/SKILL.md:13–17. MCP implements that order at mcp-server/src/tools.ts:99–114. The harness returned v2 context with and without .maestro.md. P:98 correctly describes the order later, making P:34 internally inconsistent. **Veto: first-run/context prerequisite.** A reader with supported v2 context is incorrectly told the old filename is required.

**P-F2 — P:90: “every command loads [the core skill] first.”** The bootstrap starts directly with its interview at source/skills/teach-maestro/SKILL.md:10–20, without a core invocation; compare the explicit invocation in source/skills/diagnose/SKILL.md:10–12. The universal exceeds the bootstrap instructions. P:14's broader “build on” principles language is not counted again. This inaccurate universal is not independently needed for the decision-point veto.

**P-F3 — P:99–100 and P:177: logs are written after each @maestro command / “every command run is logged.”** Wave cancellation returns without emitAudit at maestro-extension/src/chat/participant.ts:180–184 and :199–202; model-selection failure also returns at :128–139. The harness observed no audit or decisions for a cancelled /diagnose and no audit for a no-model invocation. The writes at :317–338 only happen if emitAudit is reached. These repeated statements count as one universal logging-coverage claim. **Veto: logging limit.** The records cannot be treated as complete invocation history for P:50's scorecard.

**P-F4 — P:191: fallback rewriting happens “whenever .vscode/mcp.json contains comments,” and unconditionally on every later startup.** maestro-extension/src/adapters/mcp-config.ts:49–60 sets configured if any other config gains an entry; :66–75 rewrites the default only if none did. A fixture with commented .vscode/mcp.json and a newly added entry in .claude/mcp.json preserved the commented file. P:191's initial conditional is correct, but the subsequent universal examples overstate the trigger. The actual destructive fallback is real. This warning-scope error is not independently needed for P's veto.

**False-claim count: 4.**

Checked warnings that matter: P:141's HTTP authentication/filesystem boundary is supported by mcp-server/src/http.ts:14–32 and mcp-server/src/tools.ts:99–107, :426–449. P:191's underlying data-loss warning is supported by maestro-extension/src/adapters/mcp-config.ts:115–117, :66–75 and :140–150; a second activation in the harness deleted an unrelated server preserved on the first. P:193's retained block in an otherwise empty rules file is supported by maestro-extension/src/adapters/editor.ts:51–74 and was reproduced.

### 2. Four reader needs

| Need | Judgment | Evidence in P |
|---|---|---|
| Decide fit for tool and problem | Yes, substantially | P:14 identifies the LLM application components and Markdown instructions; P:18–22 distinguishes all three forms; P:174 and P:183 explain extension version and adapter limits. |
| Install by fitting route | Mostly, with inaccuracies | P:26–32 provides CLI/manual routes; P:107–133 separates MCP client configurations; P:174 gives extension registries. P:141 and P:188–193 disclose consequential side effects, with the P:191 overstatement above. External CLI behavior at P:26–29 was not run. |
| First command and visible success | Yes for native skills; partial across routes | P:34–36 supplies /teach-maestro then /diagnose, a saved file, scores and recommendations, but P:34 mishandles v2 context. P:105–158 configures MCP without a first prompt/tool invocation; P:176–179 describes extension controls without an explicit successful first-run sequence. |
| Find the next command | Yes | P:44–86 groups all 24 commands with concrete distinctions; P:68 preserves /compose's single-agent prerequisite; P:72 identifies measured optimization; P:38 and P:85–86 supply capture/recap. |

### 3. Words that do not earn their space

| Passage | Words | Judgment |
|---|---:|---|
| P:90, exact clause: five design principles, do and don't rules for seven areas, and a ten-point "workflow slop test" that maps each symptom to a command. | 23 | Counts the core document's internal organization without improving selection; P:14 and P:44–86 already explain purpose and choices. Keep P:90's context protocol and reference link. |
| P:149–158, MCP tool table | 134 | Detailed protocol inventory occupies space where a first MCP prompt invocation is missing. P:145 identifies the normal prompt interface; move the tool inventory to the linked MCP documentation. |
| P:195–244, layout/development | 331 | Contributor build dependencies, validation internals and publication automation exceed this reader's four jobs; move behind a contributor link. Keep installation warnings at P:188–193. |

Flagged total: **488 words**, an editorial assessment, not a deletion quota or ranking metric.

### 4. Length

**2,404 words**, P:1–250. Not used for selection.

## Sheet Q

### 1. False claims and vetoes

**Q-F1 — Q:17, Q:20, Q:35, Q:91: 25 commands separate from the core.** There are 25 skill files and 24 invocable commands. source/skills/agent-workflow/SKILL.md:4–6 marks core non-invocable; scripts/bundle-skills.js:85–93 preserves the flag; maestro-extension/src/core/skills.ts:20–23 filters it. The harness counted 25 skills and 24 invocable registrations. Repetitions count once. Wrong inventory; not independently needed for veto.

**Q-F2 — Q:251 and Q:315: 25 MCP prompts.** mcp-server/src/prompts.ts:8–13 registers only invocable skills, excluding the core marked non-invocable at source/skills/agent-workflow/SKILL.md:6. The registration harness observed 24. Wrong protocol inventory; not independently needed for veto.

**Q-F3 — Q:252: tool identifiers list_commands, run_command, read_context, init, wave_start, wave_advance, wave_status, write_decision, read_decisions, read_audit.** The names all have a maestro_ prefix: mcp-server/src/tools.ts:145–146, :155–156, :220–221, :260–261, :289–290, :331–332, :387–388, :427–428, :469–470 and :506–507. The harness captured all ten registered names. Counted as one systematic naming error. **Veto: executable/tool lookup guidance.** The literal listed names are not registered identifiers.

**Q-F4 — Q:149 and Q:160: every invocation is logged with duration, tokens and estimated cost.** mcp-server/src/tools.ts:175–216 returns instructions without an audit write; :521 explicitly sends users to the VS Code extension to generate audit entries. Native source/skills/diagnose/SKILL.md:16–132 specifies an audit of the user's workflow, not a Maestro invocation log. Even extension wave cancellation can skip logging at maestro-extension/src/chat/participant.ts:180–184. The harness observed an MCP command that created no .maestro/ and a cancelled extension command with no logs. **Veto: route/logging limit.** The skill-file route at Q:46 does not deliver the promised universal tracking.

**Q-F5 — Q:155: .maestro/ is created only by /capture or extension use.** MCP maestro_write_decision calls appendDecision at mcp-server/src/tools.ts:438–449. packages/core/src/decisions.ts:85–101 calls ensureMaestroDir; :42–57 creates the directory, sessions and ignore file. The harness reproduced creation by MCP alone. **Veto: opt-in/project-write boundary.** A real writing route is excluded from the asserted list.

**Q-F6 — Q:156: session data is gitignored by default, without a route qualification.** The ignore file is created by packages/core/src/decisions.ts:54–57. The skill-only /capture instead instructs the agent to save a summary at source/skills/capture/SKILL.md:30 and append a decision at :58; it requires neither that helper nor an ignore file. The guarantee exceeds instructions for the route Q:46 installs. This does not assert that an LLM can never choose to create an ignore file. **Veto: version-control limit.** Skill-only users cannot rely on the stated default.

**Q-F7 — Q:168: ±20% cost accuracy.** maestro-extension/src/chat/participant.ts:312–314 uses sliced-context input tokens and estimateCost(null, ...), omitting full skill/request/wave input and the selected model. packages/core/src/cost-estimator.ts:39 and :65–66 use $2/$8 fallback rates. That file's :23 prices Opus at $15/$75: the harness computed $2 versus $15 for the same million input tokens, far outside ±20%. The comment at :5 is not evidence of measured accuracy. **Veto: cost-estimate limit.** Real billing accuracy is unknown, but the claimed bound is contradicted by the implementation and its own price table.

**Q-F8 — Q:224–235: the shown mcpServers configuration applies to VS Code as well as Claude Desktop and Cursor.** The VS Code shape is servers: maestro-extension/src/adapters/mcp-config.ts:20–26 and :140–144; the local MCP README supplies servers and type: stdio at mcp-server/README.md:47–58. **Veto: installation.** Q:224 sends VS Code users to the wrong shape.

**Q-F9 — Q:259–266: fallback installation copies .claude/skills/ or .cursor/skills/ from this checkout.** The directories are absent. They are generated targets in scripts/build.js:14–24 and :72–80, ignored at .gitignore:16–20. Q:259–266 gives no preceding build. Both absolute equivalents of Q:263/Q:266 were run against temporary destinations and exited 1 with “No such file or directory.” Counted once as the repeated missing-generated-source prerequisite. **Veto: installation.**

**False-claim count: 9.**

Additional omissions, not extra affirmative false claims:

- **Q:49–55 — first-run veto.** The quick start starts with /diagnose and says to use any command without the setup required by source/skills/diagnose/SKILL.md:10–12. /teach-maestro is only described later at Q:133. Q:52 gives the intent “Find workflow issues,” not a success check.
- **Q:239–245 — public-hosting warning veto.** The instruction to host a public endpoint omits authentication and filesystem boundaries. mcp-server/src/http.ts:14–32 adds no authentication and :47 listens on the supplied port; mcp-server/src/tools.ts:99–107 reads caller-selected project paths, while :426–449 writes to them. The problem is the missing boundary at the deployment decision, not an assertion that HTTP cannot start.

Q:69–70's same-line multi-command syntax is **unknown across external native clients**. The extension handles one request.command at maestro-extension/src/chat/participant.ts:93–100 and :143–148; MCP resolves one command at mcp-server/src/tools.ts:61–64. That does not establish each external agent's interpretation, so this was not added to the false count.

### 2. Four reader needs

| Need | Judgment | Evidence in Q |
|---|---|---|
| Decide fit for tool and problem | Partial | Q:30–39 lists problems/features and Q:205–214 lists target directories. Q:34–39 does not clearly explain that the main deliverable is instructions executed by the agent; MCP only appears at Q:220. Q:14 is the extension-install pointer rather than a explained route. |
| Install by fitting route | No, reliably across offered routes | Q:46 supplies the external CLI command; Q:224–235 misroutes VS Code configuration; Q:259–266 gives broken manual copies; Q:239–245 omits the public-endpoint warning. |
| First command and visible success | Partial, with a vetoed prerequisite omission | Q:49–55 supplies commands but no setup or expected context/report artifact; Q:133 describes setup later. Q:174–182 shows /reflect output, not first /diagnose success. |
| Find the next command | Yes, substantially | Q:93–135 provides grouped, linked commands; the incorrect title at Q:91 does not prevent lookup in Q:97–135. Q:69–70's shorthand requires client verification. |

### 3. Words that do not earn their space

| Passage | Words | Judgment |
|---|---:|---|
| Q:30–32 | 41 | The broad “AI agents are only as good...” premise and “fights that pattern” framing delay the concrete deliverable for this LLM developer. |
| Q:187–197 | 76 | A second general-advice list duplicates the role of the core/reference links at Q:75–87 and comes before compatibility/MCP guidance at Q:201–245. |
| Q:271–323 | 256 | The tree repeats command names indexed at Q:97–135 and exposes internal modules without fixing the omitted build step at Q:259–266. |
| “comprehensive” at Q:34 and Q:77 | 2 | Repeated evaluation without a criterion; the named subjects and links convey the useful information. |

Flagged total: **375 words**. Q:174–182's scorecard illustration is not flagged: it shows an output the reader may later seek.

### 4. Length

**1,477 words**, Q:1–346. Not used for selection.

## Sheet R

### 1. False claims and vetoes

**R-F1 — R:62–66 explicitly routes @maestro /teach-maestro to the shared result at R:93: an interview whose answers are saved as .maestro.md.** maestro-extension/src/chat/participant.ts:47–53 receives history but does not add it to messages; :119–122 adds only the current prompt. :268–274 calls the model with empty options and streams text, without advertising/executing file-editing tools or saving context. Its writes at :317–338 are audit/decisions, not .maestro.md. The handler fixture received history, streamed context-like text, omitted history from messages and wrote no context file. source/skills/teach-maestro/SKILL.md:20 and :75 are instructions a capable native agent can follow, not implementation of those capabilities in @maestro. **Veto: first run.** The route cannot deliver its stated persistence success criterion.

**False-claim count: 1.**

Additional omission, not another affirmative false claim:

- **R:52–57, specifically R:55 — installation-warning veto.** The prominent “What it writes ... without asking” list describes an MCP entry but omits replacement of existing .vscode/mcp.json and loss of other servers. maestro-extension/src/adapters/mcp-config.ts:115–117 returns exists; :58–60 sets configured only for added; :66–75 calls the default writer at :140–150. The repeated-activation fixture demonstrated data loss. This matters before choosing the extension at R:22/R:50; it is not optional internal detail.

R:91 is read with the immediate alternative-file qualification at R:93, supported by source/skills/agent-workflow/SKILL.md:13–17; I do not count it as a second old-filename-only claim. R:107's “zero mistakes allowed” is a requested standard corresponding to source/skills/zero-defect/SKILL.md:16–33, not a claim of model infallibility.

R:54's “only that file” and overwrite warning match maestro-extension/src/extension.ts:215–240; the harness saw 250 SKILL.md files, no reference directory, and replacement of an edit. R:85's volatile wave state matches mcp-server/src/wave-state.ts:67–93 and :141–142; a fresh manager had no prior wave. R:133 correctly locates the audit writer in the extension, matching maestro-extension/src/chat/participant.ts:317–327 and mcp-server/src/tools.ts:521.

### 2. Four reader needs

| Need | Judgment | Evidence in R |
|---|---|---|
| Decide fit for tool and problem | Yes, substantially | R:9 identifies the developer's LLM workflow as target; R:11 distinguishes skills from commands; R:17–23 puts routes and requirements together. |
| Install by fitting route | Mostly, with a consequential omission | R:27–37 gives CLI/manual sources; R:50 identifies extension registries; R:70–83 separates shown MCP clients from linked VS Code config. R:54 explains overwritten skill copies, but R:55 omits MCP-config loss. R:33's exact external-installer behavior is unknown. |
| First command and visible success | Yes for a capable native skill/MCP agent; no for the prescribed @maestro route | R:39–46 and R:87 lead to setup/diagnosis; R:93–94 names the saved file and five 1–5 scores plus /25 total. R:62–66 directs extension users to the unsupported persistence result in R-F1. |
| Find the next command | Yes | R:98–123 is a grouped linked index; R:129–133 gives capture/recap/reflect and identifies which route supplies audits. R:115 could describe /turbocharge's use case concretely. |

### 3. Words that do not earn their space

| Passage | Words | Judgment |
|---|---:|---|
| R:7: Workflow fluency for AI coding agents. | 6 | Slogan adding no decision information beyond R:9. |
| R:107: — zero mistakes allowed | 4 | Repeats “maximum precision” without a use condition or limit. |
| R:115: Push past conventional limits — advanced techniques | 7 | Gives no concrete problem or technique; examples such as streaming or adaptive routing exist in source/skills/turbocharge/SKILL.md:35–58. |

Flagged total: **17 words**. The repeated links at R:46 and R:66 are not penalized: they serve different installation paths.

### 4. Length

**1,379 words**, R:1–152. Not used for selection.

## Unknowns and observation limits

- P:26–29; Q:46; R:21, R:30–33: published skills-CLI selection, discovery, global flag and lockfile behavior are **unknown in execution**. The installer is absent from the snapshot; forbidden repository-download commands were not run.
- P:20, P:174; Q:205–214; R:9, R:21–23, R:37, R:50: live compatibility/availability across every named editor and fork registry routing are **unknown**. Distribution targets and declared engines are not proof of all external integrations.
- Q:69–70: same-line command sequencing in external native agents is **unknown**, not counted false.
- P:112, P:115–133; Q:224–235; R:70–87: live client acceptance, external CLI syntax and prompt-picker UX were **not integration-tested**. Q-F8's schema contradiction is separately supported by the snapshot adapter and local client example.
- P:244: actual remote CI/publication success is **unknown**. Trigger/script intent is visible in .github/workflows/build-extension.yml:3–13, :39–54; .github/workflows/publish-mcp.yml:3–6, :31–37; maestro-extension/package.json:313. No CI run was fetched or executed.
- P:250; R:139: linked website content and availability are **unknown**, deliberately not fetched.
- P:103; Q:168; R:135: real provider billing accuracy is **unknown**. The estimator implementation and Q's counterexample were checked; no real model bill was observed.
- P:48–86, Q:97–135, R:100–123: live agent obedience and output quality are **unknown**. Command descriptions were checked against instruction files, not treated as measured success guarantees.

## Execution evidence

The complete shell-command/exit-code ledger is in the adjacent judge-astra-commands.json. The local harness is judge-astra-checks.cjs and its observed output is judge-astra-checks.txt.

Read-only inspections used pwd, the supplied judging-sheet cat, ls, rg --files, numbered candidate reads and Python numbered-source/count inspections; all exited 0. node --version exited 0 with v24.11.0. printenv TMPDIR exited 0 and confirmed the permitted temporary root.

Command: node $TMPDIR/terse-bench-rulers/out/judge-astra-checks.cjs; started: yes; exit: 0; result: 16 checks passed, 0 failed. Non-fatal diagnostic: (node:64042) ExperimentalWarning: stripTypeScriptTypes is an experimental feature and might change at any time. Next line: (Use node --trace-warnings ... to show where the warning was created).

Expected failing probes:

- Command: cp -r $TMPDIR/terse-bench/snapshot/.claude/skills/ $TMPDIR/judge-astra-fixtures-0NGwWt/manual-claude; started: yes; exit: 1; exact diagnostic: cp: $TMPDIR/terse-bench/snapshot/.claude/skills/: No such file or directory
- Command: cp -r $TMPDIR/terse-bench/snapshot/.cursor/skills/ $TMPDIR/judge-astra-fixtures-0NGwWt/manual-cursor; started: yes; exit: 1; exact diagnostic: cp: $TMPDIR/terse-bench/snapshot/.cursor/skills/: No such file or directory

Artifact-writing orchestration attempt: functions.exec containing the first sheet apply_patch; shell command started: no; exit status: unknown/not supplied; exact diagnostic: Script error: SyntaxError: Unexpected identifier 'str'. No patch ran; the corrected invocation wrote this sheet.

No dependency installation, repository download, live editor launch, network fetch or repository test suite was run. No repository-suite pass is claimed.

