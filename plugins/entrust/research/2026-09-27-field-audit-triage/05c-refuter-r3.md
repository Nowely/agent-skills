# 05c. Refuter R3, of S2

Opus R3, its full return verbatim (harness: 214,962 tokens, 927 s).

status: done

result:
Opus R3: done, 19 rows, 13 upheld, 6 refuted, 0 unknown
F13 | upheld | - | Plan lines 34-44 unchanged since 0.20.0 except model names; the foreman proposal (SKILL.md:102) adds weight; no card anywhere; K1 holds at :37.
F14 | refuted | partial / fix-now | foreman.md:48-49 and :67, absent at 0.20.0, forbid foreman plan changes and require reporting deviations; coordinator path unchanged; the fix is P9b's.
F16 | upheld | - | SKILL.md:53 and codex SKILL.md:323-331 unchanged since 0.20.0 except one slug phrase; the path and field-name bans already existed, and the failures recurred.
F20a | upheld | - | Provenance already reaches synthesis (SKILL.md:142-143, foreman.md:64-66, roles.md:25); the gap is the coordinator's prose, which only P13b or P4 would check.
F20b | upheld | - | The driver validates, repairs once and exits 13 only when OUTPUT_SCHEMA is named; an advisor-shaped prompt with no schema passes --check-prompt-file, exit 0.
M1 | refuted | partial / fix-now | Unreleased gives F8 a launcher mechanism (CHANGELOG:76-88) and F7 a live-gate case (:149-154, orchestrate-live:856-858); F14 and F20 got sentences again; duplicates P12a.
P9a | upheld | - | No card in the plugin (0 hits); K1 at :37; the issue's measure is scope overruns, not S2's card-consistency check.
P12a | upheld | - | partial holds, but S2 missed orchestrate-live.test.mjs, a paid behavioural gate (plan stop, caps, tags); coordinator behaviour cannot be regressed offline, so the "how" needs revising.
P13a | upheld | - | SKILL.md:53 still asks for a paragraph after every return; pin C7 (orchestrate.test.mjs:176-178) enforces it and must change with the fix.
P13b | upheld | - | No linter and no hooks in the plugin; the issue's measure is brevity complaints and status requests; a pre-display hook is unavailable (hypothesis).
P14b | refuted | still-true / fix-after-measurement | #15 row 14's Measure column is "—"; the implementation order names only the activation eval; the run directory records no Claude agent's cost.
Q2a | refuted | partial / fix-after-measurement | SKILL.md:36-42 already has numbered, costed alternatives, a recommendation, what "go" selects, rights and unknowns; Light is P8a, which #15 defers to an experiment.
Q2b | refuted | partial / fix-after-measurement | C5, C6 and C8 are already page rules: split critique first (:117), a decisive check before a panel (:102, S2's own address), rights checked (:36).
Q3k | upheld | - | roles.md:28-29 already give the script, the traces and a spawn only for retrospectives; fixed inputs and unknown-for-missing are absent.
Q3l | upheld | - | No packaging role and no trial in the tree (0 hits under orchestrate); #16 itself asks only for a trial.
Q3m | upheld | - | experiment SKILL.md:22 measures corrections, independent outcomes and cost per outcome; per-role unique contribution is absent; roles.md keeps unobserved roles as "none yet".
Q6 | upheld | - | No reporter role and no reference routing (0 hits); #16 labels it a hypothesis with a trial protocol.
Q7a | refuted | not-applicable / do-not-fix | A reported measurement with no surface in the tree; #16 says it cannot replace the pilot, and its split hypothesis is untested.
Q7b | upheld | - | The framework already expects a single-agent comparator (experiment SKILL.md:20), and E5 (protocols.md:45-53) is a narrower relative; this pilot protocol is absent.

evidence:
all rows:
- `git -C <tree> rev-parse --short HEAD` exit 0: 882bcf3.
- `git -C <tree> diff -M entrust@0.20.0 882bcf3 -- <orchestrate SKILL.md, roles.md, codex SKILL.md, codex-agent.md, experiment/>` exit 0. The plan section (34-44) changed only `gpt-6-astra` to `Astra`. roles.md gained only the foreman row and short model names. The codex page's "What the user reads" changed only "never `gpt-5.6-sol`" to "never the slug the report carries". experiment changed its load line, arms wording and run-directory text (level 1).
- `node plugins/entrust/plugin/skills/codex/scripts/agent-run.mjs --help` exit 0, 57 lines; `node .../driver.mjs --help` exit 0, 161 lines; `node plugins/entrust/evals/orchestrate.test.mjs` exit 0, "all 70 passed"; `grep -c '^test('` exit 0, 70; `grep -cE 'says\(|shows\('` exit 0, 59. S2's counts reproduce.
- `ls plugins/entrust/plugin/` exit 0: LICENSE README.md agents package.json skills. No hooks directory.
- plugins/entrust/ISSUES.md:9 "No open entries".
F13:
- orchestrate/SKILL.md:36-42 still carries the elements: rights checked against commands, unmet prerequisites, stop, user's language, who by model, what each may write, network, reports outside the repository, no path or header field, worktree named, browser routing, composition plus caps sentence, tokens by tier and role with comparables and `unknown`, numbered alternatives, what "go" selects. :102 and foreman.md:14-15 add a foreman proposal to any plan with three workers or more (level 1).
- K1: SKILL.md:37 "Show the plan and stop" (level 1).
- orchestrate-live.test.mjs:406-498 (stoppedAtPlan, planProblems) heuristically checks the plan's composition, caps and stop. It was present at 0.20.0 (`git show entrust@0.20.0:... | grep -c 'inBackground\|stoppedAtPlan\|planProblems'` gives 7, main gives 10), so it did not prevent the field breakage. It is a paid gate and was not run.
F14:
- foreman.md:48-49 "Never change the plan. A worker, model, right or cap it does not name, or an action the user has not approved, is a hand-back with `status: blocked`". foreman.md:67 "`open` is every deviation from the plan and why". `git show entrust@0.20.0:plugins/entrust/skills/orchestrate/references/foreman.md` exit 128: the file is absent at 0.20.0 (level 1).
- The coordinator path is unchanged. SKILL.md:43 ("go" covers only what the plan listed), :53 ("name the composition that actually ran and what you dropped") and :124 ("No silent caps") are identical at 0.20.0:44, :54 and :125, and T3's unreported drop recurred under them (level 1).
- S2's how is P9b's (03-split.md: "P9b the launcher refuses an agent missing from the approved manifest and amendments are explicit").
F16:
- SKILL.md:53 is identical to 0.20.0:54, including "never paste a five-field block, a header field name or a path into user-facing text". codex SKILL.md:329-331 (header field names and absolute paths are machinery) predates 0.20.0 (level 1). The recurrence is reported by #15, not reproduced.
F20a:
- SKILL.md:24 is identical to 0.20.0:25. foreman.md:32-34 and :64-66 give "one line per worker with its model, id and status". SKILL.md:142-143: every return's first line names the model and id. roles.md:25: dedup-and-rank "attributes each finding" (level 1).
F20b:
- driver --help: "--output-schema F ... the driver checks the result independently, and one corrective turn is spent on a mismatch before exit 13"; ladder line "13 the answer failed --output-schema". driver.mjs:277-278 (exit on schemaErrs), :3099-3101 (corrective turn) (level 1).
- `node driver.mjs --check-prompt-file <prompt: MODEL: astra, EFFORT: high, TASK/CHECK/RETURN, no OUTPUT_SCHEMA>` exit 0, 0 output lines. The new check accepts the advisor's schema-less shape (level 3).
- SKILL.md:151: a Claude agent takes `schema` only in a Workflow (level 1).
M1:
- CHANGELOG.md:76-88: the launcher starts the driver "under a keeper orphaned into its own session", returns at 570 s with `RUNNING=`, and the wrapper's step 2 changed to match (E45). agent-run --help (exit 0) confirms "A call that has waited 570 s prints them with RUNNING=" and "a keeper in a session of its own" (level 1). That this removes F8's trigger is level 2.
- CHANGELOG.md:149-154: the live gate "fails a wrapper launched in the background". orchestrate-live.test.mjs:856-858 is on main, and `grep -c inBackground` on the 0.20.0 file gives 0 (level 1).
- Still sentences: CHANGELOG.md:10-22 (foreman rules, pinned as text I1-I8) and :110-111 ("12 of 12 mutations red", mutations of text). S2's addresses (CHANGELOG:105-111; orchestrate.test.mjs:134-153, :176-178) hold (level 1).
P9a:
- `grep -rniE 'plan card|approval card|five-row' plugins/entrust/plugin | wc -l`: 0 hits. #15's table row 9 Measure column: "scope overruns" (level 1).
P12a:
- orchestrate.test.mjs:6-10 "these cases pin its decisions as sentences"; :134-153, :176-178 and :611-640 hold (level 1).
- orchestrate-live.test.mjs:2-11 "Does a real session DO what skills/orchestrate/SKILL.md says ... it stops at a plan ... it tags every Claude agent, it touches nothing before \"go\"". It has 5 cases (`grep -c '^test('` exit 0, 5), is gated at :904 and listed in run-all.mjs:23. It was not run: paid gate (level 1).
- #15's measure is "mutation tests on recurrence"; the only mutations in the tree are of text (CHANGELOG:110-111).
P13a:
- SKILL.md:53; orchestrate.test.mjs:176-178 (C7) pins it, and its rationale at :177 is "a Codex agent ... otherwise reaches the user having said nothing at all" (level 1). #15's measure: "brevity complaints, status requests".
P13b:
- No hooks in the plugin (ls above). `grep -rni lint` over the plugin gives 3 hits, none a text linter (level 1). That no harness hook fires between an assistant's draft and its display is a hypothesis, unverified here.
P14b:
- #15's table row 14: "| 14 | An activation-position eval for command placement per client; a cost index of past runs for plans | F2, F13 | settles F2; −5 calls per plan | — |". The order's "1. Advisor bootstrap (1) plus the activation eval (14)" is the only mention of row 14 (level 1).
- SKILL.md:29: the run directory holds "a report per agent ... nothing else is written there", and those are the driver's Codex reports. SKILL.md:30: "A Claude agent's artifact is its returned text". So no store in the tree holds Claude roles' costs (level 2). SKILL.md:40 already tells the plan to "mark unmeasured roles `unknown`". research/README.md:7-11 holds (level 1).
Q2a:
- SKILL.md:36 "put unmet prerequisites in the plan"; :37 "who does each part by model name, what each may write"; :40 "State expected tokens by tier and role ... mark unmeasured roles `unknown`"; :41-42 "Number each alternative, show its cost and mark the recommendation; state in the plan what \"go\" selects" (level 1).
- #16: "Light's combined check is an exception to the separate-final-critic rule", "combined-check effectiveness is a proxy", "Max ... its superiority is unmeasured", "Proposed recipe and illustrative cost, not a measured tier run". #15's P8 ("a simple task gets one independent verifier covering cross-review and completeness") is gated by "5. Behind experiments ... proportional assurance ... (6, 7, 8, 10)". SKILL.md:123 keeps the completeness critic separate. Tier words in the plugin: `grep -w light` 0 hits, `Balanced` 0 hits.
Q2b:
- SKILL.md:102 "Run a decisive check before commissioning a panel" matches C6's "cheapest decisive check ... not a panel". :117 "Critique the split before the fan-out" matches C5's first half. :36 and :43 match C8 (level 1).
- #16: "keep necessary execution/authority rules regardless" and "8/9 is development-set fit, not validation". C1-C4 and C7 are absent.
Q3k:
- roles.md:28 measurer "a script over transcripts, reports or files; numbers with the method stated | its script and tables in a temporary file". roles.md:29 retrospective analyst "from traces | ... | incidents with traces | a retrospective" (level 1).
Q3l:
- `grep -rniE '\bpackag' plugins/entrust/plugin/skills/orchestrate | wc -l`: 0 hits. roles.md:7-30 has no packaging row (level 1).
Q3m:
- experiment SKILL.md:22 "unique coordinator incidents by stage ..., owner corrections, outcomes verified independently, and agents and paid turns counted per outcome". roles.md:13, :16, :30 read "none yet" (level 1).
Q6:
- `grep -rni reporter plugins/entrust/plugin/skills | wc -l`: 0 hits. SKILL.md:53 retells returns (level 1).
Q7a:
- #16's summary: "the completed overlap simulation cannot replace it". #16: "Hypothesis only: a disjoint split retains all adopted clusters ... this was not tested".
- In skills, `grep -rni overlap` gives 3 hits, none about reviews (incidents.md:175 is lock reclaim; the other two are driver comments) (level 1).
- This run's rule is that the issues' measurements are cited as reported, so a recount is not a status check.
Q7b:
- experiment SKILL.md:20 "One arm is the comparator the hypothesis calls for, a single agent or no delegation where the question is whether delegation pays". protocols.md:45-53 E5 "Sol alone" against "one Sol and four Luna". No full-policy pilot (level 1).

artifacts:
/var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T//fat-r3-return.XTmENZ
/var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T//r3-agentrun-help.0RZj6N
/var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T//r3-driver-help.sTL4Mr
/var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T//r3-orch-eval.CjgOYm

open:
- F13, P12a, M1: orchestrate-live.test.mjs was not run (paid gate), so whether its 5 cases pass at 882bcf3 is unknown.
- F14, F20a: the foreman sentences are partial by text only (level 1); no live foreman run was observed.
- M1: that the launcher's early return stops the relay's tail and poll behaviour (F8) is level 2, a hypothesis about the T6/T7 trigger.
- P13b: whether any Claude Code hook can intercept assistant text before display cannot be checked in the tree.
- Q7a: the owner's overlap journal was not seen, and is not needed for the status.
- Cross-row, for the judge: F13, P9a and Q2a define one plan card of conflicting size (five rows against three tiers of about ten items each); F14 duplicates P9b, F16 duplicates P13a, and M1 duplicates P12a.
- Found in passing, pre-existing since 0.20.0 and in no row: experiment/SKILL.md:19 says "the four registered first are in protocols.md", while protocols.md:3 says "Five experiments" and lists E1-E5. ISSUES.md has no entry.
