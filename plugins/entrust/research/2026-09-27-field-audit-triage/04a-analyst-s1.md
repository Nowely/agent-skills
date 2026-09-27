# 04a. Analyst S1, group A

Codex Sol S1, five fields verbatim from its report (`sol-s1`). Run: 629096 tokens (530176 cached input), 207 s, 51 commands, 0 declined, exit 0, receipt true, network off.

## status

done

## result

Codex Sol S1: done, 29 rows, partial 7, still-true 14, fixed-on-main 1, not-a-defect 1, not-applicable 5, unknown 1
F1 | partial | fix-now | Start read-only advice before composition approval; preserve the later plan stop for implementation. | M | mechanism
F2 | unknown | undecided | Compare command activation at the start and end of identical prompts in each client. | M | experiment
F7 | partial | fix-after-measurement | Test notification delivery across clients, then remove the extra exit-marker poll where completion alone is reliable. | M | experiment
F8 | still-true | fix-after-measurement | Compare direct waited-on turns with relayed turns before changing the default. | M | experiment
F11 | still-true | fix-now | Classify completed exit-6 turns from answer completeness and recorded denied requests. | S | mechanism
F12a | fixed-on-main | already-fixed | Keep the foreground rule for one waited-on agent and background calls for parallel work. | S | sentence
F12b | still-true | fix-now | Make the five-field schema authoritative for orchestrated reviews; label the shipped review schema as a separate route. | S | sentence
F12c | not-a-defect | do-not-fix | Keep top-row effort inheritance; check individual briefs against the rule. | S | sentence
F17 | partial | fix-after-measurement | Probe Stop and hand-back support per client; give each unsupported operation a tested fallback. | M | experiment
F18 | still-true | fix-now | Load a generated Codex route recipe only after the plan selects a Codex worker. | M | mechanism
F19 | still-true | fix-now | Add an environment capsule to write briefs and check required commands before launch. | M | mechanism
P1 | partial | fix-now | Bootstrap standing read-only advice on advisor invocation, consult before composition, retain later calls and opt-out. | M | mechanism
P5 | still-true | fix-now | Generate a short route recipe and load the full Codex page only for selected Codex work. | M | mechanism
P6 | still-true | fix-after-measurement | Run matched direct-versus-relay read turns; retain relay for parallel work, Stop and continuation. | M | experiment
P7 | partial | fix-after-measurement | Detect completion capabilities and choose one wait path per client, with no transcript polling. | M | experiment
P9b | still-true | fix-now | Make the launcher validate agent IDs against an approved manifest; record explicit amendments. | M | mechanism
P10a | still-true | fix-now | Compile role briefs with a rights-aware environment capsule covering staged inputs, daemon limits and lint cache. | M | mechanism
P10b | still-true | fix-after-measurement | Trial a bounded stop rule after repeated environment failures on matched write tasks. | M | experiment
P10c | still-true | fix-now | Classify exit 6 by answer completeness before deciding continuation or failure. | S | mechanism
P11b | not-applicable | do-not-fix | Put transactional prompt registration in the harness that owns registration. | unknown | mechanism
P12b | still-true | fix-now | Generate shared page fragments from one constants module and fail release checks on drift. | M | mechanism
P14a | still-true | fix-now | Add a per-client activation-position fixture with identical prompts and observable skill loading. | M | experiment
K7 | not-applicable | do-not-fix | Preserve batched registration in the owning harness; entrust has no registration operation to change. | unknown | sentence
K8 | not-applicable | do-not-fix | Preserve the owner's mount backup-and-swap workflow outside entrust. | unknown | sentence
H1 | not-applicable | do-not-fix | Trim the harness start package in its owner, outside entrust. | unknown | mechanism
H2 | not-applicable | do-not-fix | Compare fresh sessions and phase-boundary compaction in the harness. | unknown | experiment
Q3g | still-true | fix-now | Require a capture barrier before mutation and record revision, mode, platform and control. | S | sentence
Q3h | partial | fix-now | State that recognition readers report frozen-artifact observations and defer interaction claims to a live check. | S | sentence
Q3i | partial | fix-after-measurement | Keep per-call advice; repair standing activation, then compare unaided decisions, advice and outcomes. | M | experiment

## evidence

- F1: #15 says advisor's orchestrate Skill load was refused and no advice followed; plugins/entrust/CHANGELOG.md:105-109 and plugin/skills/advisor/SKILL.md:13 remove that load, but advisor/SKILL.md:17 still stops for a plan and go before advice (level 2). The bootstrap is repaired only in part; the read-only first consultation still needs a lifecycle change.
- F2: #15 reports failures when orchestrate appeared at the end of a prompt but says causation is unknown; plugins/entrust/plugin/skills/orchestrate/SKILL.md:1-15 defines the invocation without placement behavior (level 1). No client activation run was available, so the placement claim remains unknown.
- F7: #15 reports 41 TaskOutput calls and 161,448 bytes of dumps; plugins/entrust/CHANGELOG.md:149-154 and plugin/skills/orchestrate/SKILL.md:107 replace TaskOutput with notifications, yet line 107 still orders a background exit-marker poll (level 2). The dump path is answered on main; one reliable wait mechanism still requires client measurement.
- F8: #15 reports relay-only breaches and 13,166–23,033 tokens per compliant relay; plugins/entrust/plugin/agents/codex-agent.md:8-23 still defines the Haiku relay, and plugin/skills/codex/SKILL.md:54-59 still makes it the route (level 2). The historical breach is reported, not reproduced here; keep the route decision behind P6's comparison.
- F11: #15 reports 5/14 exit-6 runs with completed turns; plugins/entrust/plugin/skills/codex/scripts/driver.mjs:234-256 gives declined approval its own rung even after completion, while plugin/skills/codex/SKILL.md:288-293 says the denial alone does not show lost work (level 2). A completeness-based classification is still absent.
- F12a: #15 alleges foreground/background conflict; plugins/entrust/plugin/skills/codex/SKILL.md:64-69 now assigns foreground to a waited-on single agent and background to concurrent work, and plugin/skills/orchestrate/SKILL.md:106-107 specifies headless foreground behavior (level 2). The current text separates the cases; no live scheduling claim follows from that reading.
- F12b: #15 says a run used the shipped review schema instead of orchestrate's five fields; plugins/entrust/plugin/skills/codex/schemas/review-output.schema.json:5-10 requires verdict/summary/findings/next_steps, while plugin/skills/orchestrate/SKILL.md:142-155 requires five different fields (level 2). Both contracts remain available without an explicit route boundary.
- F12c: #15 cites a top-row advisor brief with EFFORT: high; plugins/entrust/plugin/skills/orchestrate/SKILL.md:77-80 already says only a top-row agent omits EFFORT, and evals/orchestrate.test.mjs:224-235 pins that rule (level 2). The cited brief violates the page rule; the two current pages do not contradict each other.
- F17: #15 says the pages assume a foreground ceiling, Stop cards, SubagentHandback and TaskOutput; plugins/entrust/CHANGELOG.md:76-88 addresses the ceiling, and :149-154 addresses TaskOutput, while plugin/skills/orchestrate/SKILL.md:106 and plugin/agents/codex-agent.md:17 still rely on Stop and SubagentHandback (level 2). Those remaining client capabilities were not probed here.
- F18: #15 reports a 9,044-word cold read before small work; plugins/entrust/plugin/skills/orchestrate/SKILL.md:12-15 still directs an immediate full Codex skill load (level 1). The reported word and token measurements were not reproduced; the loading cause is still present.
- F19: #15 reports write-agent daemon, sandbox and lint failures; plugins/entrust/plugin/skills/orchestrate/SKILL.md:36 checks commands against rights and environment, but plugin/skills/codex/SKILL.md:301-320 gives only general brief shape and plugin/skills/orchestrate/references/roles.md:15 has no compiled capsule (level 2). The page sentence has not become an environment mechanism.
- P1: #15 and #16 request automatic standing consultation from advisor invocation without an intervening command or confirmation, including later consultation and opt-out; plugins/entrust/CHANGELOG.md:105-109 and plugin/skills/advisor/SKILL.md:13 fix dependency loading, while advisor/SKILL.md:17 still requires go before its first question (level 2). Acceptance: activate advisor alone, observe advice before workers and later verdict advice, opt-out and no writes; the tree has the load fix but no such lifecycle check. K6's per-call advisor remains in plugin/skills/orchestrate/references/roles.md:12 and should remain available.
- P5: #15 requests a generated route recipe loaded only when a plan has a Codex agent; plugins/entrust/plugin/skills/orchestrate/SKILL.md:12-15 still loads the full sibling immediately (level 1). Acceptance: repeat the dry run and measure words saved; no route recipe or selective load is present.
- P6: #15 proposes direct agent-run for one waited-on turn and relay for parallel turns, Stop and continuation; plugins/entrust/plugin/skills/codex/SKILL.md:54-59 and :64-76 still route every turn through the wrapper (level 2). Acceptance: A/B over 20 read turns; no such comparison appears in the inspected tree, so changing the default should follow measurement.
- P7: #15 proposes one wait mechanism selected by harness capability, defaulting to notifications and avoiding TaskOutput polling; plugins/entrust/CHANGELOG.md:149-154 and plugin/skills/orchestrate/SKILL.md:107 remove TaskOutput but retain a background exit-marker poll (level 2). Acceptance: completion delivery across harnesses; the tree has page cases in evals/orchestrate.test.mjs:347-363, not that cross-client delivery test.
- P9b: #15 asks the launcher to refuse agents absent from an approved manifest and to require explicit amendments; plugins/entrust/plugin/skills/codex/scripts/agent-run.mjs:273-310 checks report paths and prompt validity but reads no approved manifest, while plugin/skills/orchestrate/references/foreman.md:48-52 only instructs a foreman not to change the plan (level 2). Acceptance: reject an unlisted launch and admit a recorded amendment; the tree has neither mechanism.
- P10a: #15 requests role-compiled briefs with an environment capsule for staged files, daemon limits and no-cache lint; plugins/entrust/plugin/skills/orchestrate/references/roles.md:7-29 defines roles, and plugin/skills/orchestrate/SKILL.md:36 only asks for a prerequisite check (level 2). Acceptance: lower exit-6 rate and failed-command count; no brief compiler or capsule is present.
- P10b: #15 requests a circuit breaker for repeated environment failures; plugins/entrust/plugin/skills/orchestrate/SKILL.md:129-137 handles individual failed returns but specifies no repeated-environment-failure threshold (level 2). Acceptance: compare failed commands and cost in a trial; no breaker or trial result is present.
- P10c: #15 requests exit-6 classification by answer completeness; plugins/entrust/plugin/skills/codex/scripts/driver.mjs:254-256 assigns exit 6 on a declined approval and plugin/skills/codex/SKILL.md:288-293 leaves completeness to the reader (level 2). Acceptance: distinguish a complete answer from blocked work in completed exit-6 reports; no classifier is present.
- P11b: #15 reports two orphan prompt registrations and proposes transactional registration; plugins/entrust/plugin/skills/codex/scripts/agent-run.mjs:270-310 implements one prompt file per report path and an offline check, not harness prompt registration (level 2). Acceptance: no orphan registration after failure; that operation is outside the inspected entrust launcher, so its owner must implement the transaction.
- P12b: #15 requests shared page fragments from one constants module and a release failure on drift; plugins/entrust/plugin/skills/orchestrate/SKILL.md:142-155 embeds a five-field schema, while plugin/skills/codex/scripts/driver.mjs:177-217 centralizes only driver header fields (level 2). Acceptance: mutation-driven drift failure; the inspected page suites pin wording, and no shared fragment generator was found.
- P14a: #15 asks for an activation-position eval per client to settle F2; plugins/entrust/evals/run-all.mjs:21-24 lists current suites, with no activation-position suite, and plugin/skills/orchestrate/SKILL.md:1-15 has no placement check (level 2). Acceptance: start-versus-end activation per client; absent and still needed.
- K7: #15 says fourteen prompts were registered from one template in one call; plugins/entrust/plugin/skills/codex/scripts/agent-run.mjs:270-310 handles per-agent prompt files, and the inspected plugin has no prompt-registration operation (level 2). The keep step belongs to the harness; no entrust proposal here requires removing batching.
- K8: #15 says the T8 mount backup-and-swap scheme should be kept; plugins/entrust/plugin/skills/orchestrate/SKILL.md:43-52 discusses worktrees and harvests, with no mount workflow, and plugin/skills/codex/scripts/driver.mjs:193-210 has no mount control field (level 2). Its operation is outside entrust; nothing inspected forbids the owner's scheme.
- H1: #15 suggests trimming the harness start package, including an unused Artifact tool, plugin listing and duplicated CLAUDE.md; plugins/entrust/plugin/skills/orchestrate/SKILL.md:1-15 is a skill page and has no start-package control (level 2). This is a harness change; the plugin can reduce its own reading tax through P5.
- H2: #15 suggests fresh sessions or phase-boundary compaction; plugins/entrust/plugin/skills/orchestrate/SKILL.md:26-32 defines run artifact placement, with no session creation or compaction control (level 2). The claimed fork costs are reported only; the operational change belongs to the harness.
- Q3g: #16 asks live probers to freeze capture state before mutation and name revision, mode, platform and control; plugins/entrust/plugin/skills/orchestrate/references/roles.md:20 says only to make behavior happen and return report fields (level 1). Acceptance: a delayed capture cannot race a writer; no barrier or regression is present.
- Q3h: #16 asks recognition readers to recognize frozen artifacts without inferring behavior; plugins/entrust/plugin/skills/orchestrate/references/roles.md:22 already limits the role to a blind frozen-artifact read, but has no explicit interaction-claim boundary (level 2). Acceptance: static color cannot establish disabled interaction without a live check; that check is not specified.
- Q3i: #16 asks for per-call advice on consequential decisions and repaired standing activation before usefulness evaluation; plugins/entrust/plugin/skills/orchestrate/references/roles.md:12-13 retains per-call and standing roles, plugin/skills/advisor/SKILL.md:17 still gates first advice on go, and plugin/skills/experiment/references/protocols.md:25-33 defines E3 (level 2). Acceptance: activation check followed by unaided/advice/outcome comparison; the protocol exists, but the activation behavior and pilot are not established. K6's one-off call is preserved.
- commands: git rev-parse --short HEAD exit 0, 882bcf3; node plugins/entrust/plugin/skills/codex/scripts/agent-run.mjs --help exit 0, count not applicable; node plugins/entrust/plugin/skills/codex/scripts/driver.mjs --help exit 0, count not applicable; node plugins/entrust/evals/orchestrate.test.mjs exit 0, all 70 passed; node plugins/entrust/evals/advisor.test.mjs exit 0, all 11 passed. rg --count-matches TaskOutput on orchestrate/SKILL.md exit 1, 0 matches; rg --count-matches SubagentHandback on codex/SKILL.md and codex-agent.md exit 0, 1 match in each; rg --count-matches 'manifest|approval' on agent-run.mjs exit 1, 0 matches. Other nl/sed/rg source reads exited 0 except no-match searches for fragment/constant/route/manifest/activation/registration filenames and harness-registration/compaction phrases, which exited 1 with 0 matches; no command was refused.

## artifacts

- /private/var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/entrust-agent-run-help.log
- /private/var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/entrust-driver-help.log
- /private/var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/entrust-orchestrate-test.log
- /private/var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/entrust-advisor-test.log

## open

- F2: run controlled start-versus-end activation tests in each client; the tree cannot establish the cause.
- Live recurrence of F8 and remaining F17 Stop/hand-back behavior on current clients is unknown.
- P6 and P7 need matched live measurements before their proposed default changes; reported savings were not reproduced.
- The owner's local corpora and historical transcripts were not available to reproduce the issue measurements.
