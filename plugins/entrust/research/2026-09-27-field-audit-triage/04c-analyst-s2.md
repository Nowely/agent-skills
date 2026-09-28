# 04c. Analyst S2, group C

Codex Sol S2, five fields verbatim from its report (`sol-s2`). Run: 679296 tokens (583808 cached input), 171 s, 41 commands, 0 declined, exit 0, receipt true, network off.

## status

done

## result

Codex Sol S2: done, 19 rows, 13 still-true, 5 partial, 1 unknown
F13 | still-true | fix-now | Compile a short plan card from the proposed agents, costs, rights and checks; retain the plan stop. | M | mechanism
F14 | still-true | fix-now | Compare work against the approved plan and require an explicit amendment for added or dropped work. | M | mechanism
F16 | still-true | fix-now | Batch progress by phase and publish verified changes in plain language. | S | mechanism
F20a | partial | fix-now | Make synthesis retain each finding's originating worker through foreman and coordinator returns. | M | mechanism
F20b | still-true | fix-now | Validate every agent return against the five-field schema before synthesis; repair or mark malformed returns. | M | mechanism
M1 | still-true | fix-now | Add behavioural regressions for recurring failures and use mechanisms where page instructions alone failed. | L | mechanism
P9a | still-true | fix-now | Generate and check a five-row approval card before the existing plan stop. | M | mechanism
P12a | partial | fix-now | Replace selected wording pins with offline behavioural fixtures that reproduce the recurring failures. | M | mechanism
P13a | still-true | fix-now | Emit one phase update from verified changes, pending work and blockers. | S | mechanism
P13b | still-true | fix-now | Lint draft user messages for machinery, length, paths and unsupported success claims. | M | mechanism
P14b | still-true | fix-now | Index completed run costs by role and task shape for comparable plan estimates. | M | mechanism
Q2a | still-true | fix-now | Generate Light, Balanced and Max options with one deliverable, fixed rights and an explicit default; preserve the plan stop. | M | mechanism
Q2b | still-true | fix-after-measurement | Freeze C1–C8 and test tier picks on held-out tasks before adopting discriminating criteria. | M | experiment
Q3k | partial | fix-now | Require fixed inputs, reproducible computations, trace addresses and explicit unknowns in measurer and retrospective briefs. | S | sentence
Q3l | still-true | fix-after-measurement | Compare merged and separate evidence packaging on identical captures with provenance and seeded artifact errors. | M | experiment
Q3m | partial | fix-after-measurement | Record unique contributions, misses, corrections and full cost separately; leave unobserved role usefulness unknown. | M | experiment
Q6 | still-true | fix-after-measurement | Trial a reporter triggered by owner-facing deliverables, using an approved reference and claim-level evidence. | M | experiment
Q7a | unknown | undecided | Obtain the overlap journal and independently recount clusters, memberships and adoption before changing policy. | unknown | experiment
Q7b | partial | fix-now | Register a held-out single-reader versus full-policy protocol with frozen inputs, blinded scoring, cost and owner-time measures. | M | experiment

## evidence

- F13: #15 reports a heavy plan whose required form was repeatedly broken; plugins/entrust/plugin/skills/orchestrate/SKILL.md:34-44 still prescribes many elements without a compiled card (level 1). The reported session failures were not reproduced here. K1 is present at line 37; the proposed card retains that stop.
- F14: #15 reports added agents, an early memory write and an unreported dropped review after approval; plugins/entrust/plugin/skills/orchestrate/SKILL.md:43-44 limits “go” to listed work, while references/foreman.md:48-49 blocks foreman deviations only (level 1). The general coordinator path still relies on compliance with a sentence, so enforce amendments.
- F16: #15 reports verbose, unverified and machinery-heavy owner-facing text; plugins/entrust/plugin/skills/orchestrate/SKILL.md:53 requires a paragraph after every return, and plugins/entrust/plugin/skills/codex/SKILL.md:323-331 supplies presentation rules (level 1). Those rules do not batch progress or verify each reported change; the issue's session examples are reported, not reproduced.
- F20a: #15 reports lost attribution; plugins/entrust/plugin/skills/orchestrate/SKILL.md:24 requires attribution, and references/foreman.md:32-34 now explicitly attributes findings to workers rather than the foreman (level 1). That answers the foreman path, but there is no checked provenance through general synthesis, so a mechanism is warranted.
- F20b: #15 reports prose and malformed returns despite the five-field rule; plugins/entrust/plugin/skills/orchestrate/SKILL.md:140-155 defines the fields and a strict Codex schema, but describes Claude schema use specifically for Workflow (level 1). A universal return validator is absent; page wording alone cannot establish compliance.
- M1: #15 reports eight recurring findings after sentence-based changelog fixes; plugins/entrust/CHANGELOG.md:105-111 adds more page rules and pins, while plugins/entrust/evals/orchestrate.test.mjs:134-153 and :176-178 check exact plan and return wording (level 2). The unreleased changes fix some distinct mechanics, but do not establish that the eight reported behaviours stopped recurring.
- P9a: #15 proposes a compiled five-row approval card; plugins/entrust/plugin/skills/orchestrate/SKILL.md:37-44 has the plan stop and prose requirements, with no compiled card (level 1). Acceptance is a complete, internally consistent approval card; the tree does not have that check. K1 remains at line 37 and the card must precede it.
- P12a: #15 proposes behavioural regressions instead of wording pins; plugins/entrust/evals/orchestrate.test.mjs:134-153 and :176-178 pin page phrases, though :611-640 parses and checks a schema (level 2). The offline suite reported 70 passed, and a count found 59 lines calling `says` or `shows`; recurrence behaviour is not its acceptance check. The tree has some structural checks, not the proposed behavioural regressions.
- P13a: #15 proposes phase-batched progress with verified changes only; plugins/entrust/plugin/skills/orchestrate/SKILL.md:53 instead requires a paragraph after every agent return (level 1). Acceptance is fewer progress paragraphs without unverified claims; the tree has neither batching nor a check for that result.
- P13b: #15 proposes a draft linter for machinery, length, paths and unsupported success; plugins/entrust/plugin/skills/codex/SKILL.md:323-331 states presentation rules, and plugins/entrust/evals/orchestrate.test.mjs:176-178 pins another rule (level 1). Acceptance is a linter that catches those draft defects; none was located in the inspected skill and eval surfaces.
- P14b: #15 proposes a cost index of past runs; plugins/entrust/plugin/skills/orchestrate/SKILL.md:40 asks for comparable runs, and plugins/entrust/research/README.md:7-11 indexes research questions rather than per-run costs (level 1). Acceptance is estimates drawn from a past-run cost index; the tree has the instruction but no such index.
- Q2a: #16 requests Light, Balanced and Max in every plan, a comparable plan card, and defined authorization behaviour; plugins/entrust/plugin/skills/orchestrate/SKILL.md:41-44 offers alternatives only when several approaches are viable and retains the plan stop (level 1). Acceptance is a fixture showing all three tiers, roles, models, scope, cost or unknown, default and unchanged authority; the tree has no such fixture or three-tier plan.
- Q2b: #16 proposes C1–C8 and reports an in-sample 8/9 fit explicitly without held-out validation; plugins/entrust/plugin/skills/orchestrate/SKILL.md:93-102 has agent-count bounds and ownership guidance, not tier-selection criteria (level 1). Acceptance is frozen criteria tested on held-out outcomes against always-Balanced and historical baselines, with disagreements published; the tree has no such validation.
- Q3k: #16 requests reproducible measurer checks and trace-ledger retrospectives; plugins/entrust/plugin/skills/orchestrate/references/roles.md:28-29 already defines both roles and limits retrospectives to retrospective work (level 1). Acceptance is recomputation from fixed inputs, incident traces and missing observations marked unknown; those details are not required by the rows.
- Q3l: #16 proposes a trial of consolidated evidence packaging; plugins/entrust/plugin/skills/orchestrate/references/roles.md:7-30 has implementer, live-prober and completeness-critic rows but no packaging responsibility or consolidation trial (level 1). Acceptance compares merged and separate work on identical captures and catches seeded caption, crop and destination errors; the tree has no such trial.
- Q3m: #16 separates decisive contribution, misses, adoption and costs, and leaves unobserved roles unknown; plugins/entrust/plugin/skills/experiment/SKILL.md:17-24 requires metrics and independent outcomes, while references/roles.md:7-30 records roles without the proposed usefulness accounting (level 1). Acceptance is separate contribution, miss and cost measures with unknowns preserved; the tree has only a generic experiment framework. The issue's numerical journal is reported, not reproduced.
- Q6: #16 proposes a triggered reporter using an owner-approved reference and verified evidence; plugins/entrust/plugin/skills/orchestrate/references/roles.md:7-30 has no reporter role, while plugins/entrust/plugin/skills/orchestrate/SKILL.md:53 only retells agent returns (level 1). Acceptance is the next comparable visual or comment deliverable with no reference-rule correction or uncited caption claim; the tree has no trigger or trial.
- Q7a: #16 reports a recorded simulation of 14 reviewers, 67 clusters and 43 adopted clusters; plugins/entrust/research/README.md:7-11 has no indexed overlap journal, and plugins/entrust/plugin/skills/experiment/references/protocols.md:1-53 has no overlap result (level 1). The owner says source records are available on request; those counts could not be independently checked. Acceptance is a reconciled cluster and adoption recount; the tree does not supply its inputs.
- Q7b: #16 requests a prospective single-reader versus full-orchestration pilot; plugins/entrust/plugin/skills/experiment/SKILL.md:17-34 supports matched arms, frozen material, judging and budgets, but plugins/entrust/plugin/skills/experiment/references/protocols.md:5-53 registers different experiments (level 1). Acceptance is the specified held-out, blinded comparison with material coverage, false alarms, full cost and observed owner time; the framework exists, but this protocol and its result do not.
- commands: `git rev-parse --short HEAD` exit 0, 882bcf3; `node plugins/entrust/plugin/skills/codex/scripts/agent-run.mjs --help` exit 0, 57 output lines; `node plugins/entrust/plugin/skills/codex/scripts/driver.mjs --help` exit 0, 161 output lines; `node plugins/entrust/evals/orchestrate.test.mjs` exit 0, 70 passed; `rg -c '^test\(' plugins/entrust/evals/orchestrate.test.mjs` exit 0, 70; `rg -c 'says\(|shows\(' plugins/entrust/evals/orchestrate.test.mjs` exit 0, 59; `rg -c 'spawn\(|execFile\(|execSync\(' plugins/entrust/evals/orchestrate.test.mjs` started, exit 1, exact diagnostic: none (no matches). Other read and search commands started and exited 0.

## artifacts

- /var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/entrust-s2-agent-run-help.txt
- /var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/entrust-s2-driver-help.txt
- /var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/entrust-s2-orchestrate-eval.txt

## open

- Q7a: obtain the owner's overlap journal and source records, then independently recount the reported reviewers, clusters, memberships and adoption.
- Live compliance with the plan, attribution and presentation rules at 882bcf3 is unknown from this read-only tree analysis; the issue's 0.20.0 session measurements were cited as reported.
