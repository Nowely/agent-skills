# D1 design: orchestrate-page edits from the 2026-09-17 research round

Fable D1, 2026-09-17. Subject: `plugins/entrust/skills/orchestrate/SKILL.md` at `7e7d9cc` (155 lines, SHA-256 `51e04421…f5a0`, identical in the working tree — checked with `git show 7e7d9cc:… | shasum -a 256`). Every quoted line below was asserted to occur exactly once in that file by the apply script (`apply.py` beside this file) before it was cited; the deltas were applied to a copy of `plugins/entrust` under this directory and the suite run there. Repository untouched (`git status`: only the round's own untracked files).

Evidence terms follow the research: CC = controlled comparison, CC-v = evaluator-validity study, VE = vendor experience report, RA = rationale, ME = mechanism; T1-nn = a local incident in `research/2026-09-17-orchestration-practices/t1-retrospective-ledger.md`; H-nn = a phase-3 hypothesis in `r-synthesis.md` §8. Line numbers are at `7e7d9cc` (O L) and, for the sibling, `plugins/entrust/skills/codex/SKILL.md` at the same revision (C L).

## §0 Summary

| item | decision | lines +/− | pins touched | reason |
|---|---|---|---|---|
| 1 | adopt | 0 / 0 (L103 extended) | E6 unchanged; new E7 | CC S2-02/03 turned into a rule about when not to fan out; T1-45 (16 agents, no name) against T1-19, T1-48 (own hands, landed) |
| 2 | adopt | 0 / 0 (L69 extended) | tier-table pin unchanged; new D9 | CC S2-05 (width not monotonic); T1-01 and T1-53 both preceded the cap; T1-26 is width without a stated need |
| 3 | defer | — | — | a measurement (H3, H18): per-claim correctness by tier on matched claims; a page sentence would prescribe a pilot per wave with no evidence it pays |
| 4 | adopt | 0 / 0 (L122 rewritten) | F2 regex; the `EXPECT:` row C L187 unchanged | CC-v S2-37/38, S2-46; T1-37 and T1-45: 2 of 6 judge verdicts fell to a check no agent ran |
| 5 | adopt | 0 / 0 (L127 extended) | F3 unchanged; new F8 | CC S2-09 (ablation) and M2; T1-45: the two-round rule never counted a stall |
| 6 | adopt | 0 / 0 (L37 extended) | A3 unchanged; new C11 | CC S2-30/31; T1-44 (2.65 M tokens on a check the sandbox could not complete), T1-51 (10 of 13 at exit 6) |
| 7 | adopt the brief half; reject the range half | +1 / 0 (new bullet after L118) | new F7; budget pin 155→156 | VE S1-08; T1-05 (outcome blocked), T1-09, T1-39: three assembly defects, one after the split-critic rule |
| 8 | adopt the findings half; defer the scope half | 0 / 0 (L119 rewritten) | F2 regex | VE S1-37; T1-50: 27 edits against 87 findings, 10 regressions |
| 9 | adopt the accounting; defer the cap | 0 / 0 (L41 extended) | C6 unchanged; new C10 | VE-n S1-15; T1-53, T1-07, T1-01; the owner's boundary: accounting only |
| 10 | adopt (= D2) | 0 / 0 (L123 rewritten) | F2 regex | RA S1-44; T1-49, T1-50; the owner's narrow spawn rule |
| 11 | adopt | 0 / 0 (L43 extended) | C1, C3 unchanged; new C9 | VE S1-52, RA S1-50; T1-23 (three times), T1-38 |
| 12 | reject | — | — | present: the driver already re-asks once (driver.mjs:2641, 2971) and reports exit 13; O L109 sends bulk Claude agents to Agent calls, O L124 names what was dropped |
| D1 | reject the change; L25 stays | — | B5 unchanged | the owner's boundary; the record's split (T1-04/11/30/31 vs T1-08/12/49) fits the page, none fits S1-39 |
| D2 | adopt via row 10 | — | — | — |
| D3 | adopt: L68 re-worded, the price half cut | 0 / 0 | new D10 (with a negative half) | no Haiku token count exists (T1-U3); the quality half has its trace (T1 §2.4) |

Totals: 11 deltas on the page (10 at zero lines, 1 at +1), page 155 → 156 lines, 3,138 → 3,672 words; eval 45 → 53 cases (1 pin renumbered, 1 case with three regexes rewritten, 8 cases added); suite on the modified copy: 53/53.

## §1 Per item

### Row 1 — a single-check or sequential task never enters a panel

Claims: S2-02 (CC: sequential-constraint work −39…−70 % for every multi-agent variant), S2-03 (CC: tool intensity predicts less benefit, β = −0.096), with S2-12/13 (team not separable from one agent at iso-cost), S1-56, S1-60. Incidents: T1-45 (three naming rounds, blind proposers on three tiers plus reviewers plus a judge; every round's winner killed by a collision check no agent could run; rounds 1–2 = 16 agents, no adopted name); T1-19 and T1-48 (the coordinator kept the edits and spent agents only on criticism; both landed). Mapping: S2-02 partial at O L100 (names the risk, no rule), S2-03 not located.

Decision: adopt. Two controlled null-or-adverse findings agree with the one local task that hinged on a check no panel could run.

Delta, O L103 (one line; the first sentence extended):
- old: `Allocate inside those bounds by judgement, not to fill a band. Several writers at once is how a task goes faster:`
- new: `Allocate inside those bounds by judgement, not to fill a band. A task that turns on one check, or whose steps each wait on the last, is one agent's or your own and never a panel's (measured 2026-09-17: sixteen agents over two naming rounds proposed, reviewed and judged, and each round's winner then fell to a collision check no agent had run). Several writers at once is how a task goes faster:`

Line balance: 0; the sentence joins the paragraph the page already keeps on one line (L103 is 897 characters at `7e7d9cc`).
Pins: E6 pins four later phrases of L103, all untouched. New case **E7** "a task that turns on one check goes to one agent or the orchestrator, never a panel": `says("A task that turns on one check, or whose steps each wait on the last, is one agent's or your own and never a panel's")`.
Phase 3: H1 — agents and paid turns per adopted outcome, with a single-agent or no-delegation comparator.

### Row 2 — the bulk count is derived from the units and the plan says why

Claims: S2-05 (CC: Flash optimum at 7, Pro ≤ 5; marginal agents not monotonic), S1-14 (VE: width keyed to the query class), S3-59 (ME). Incidents: T1-01 (80 Claude agents in one Workflow after "a bigger wave"; 76 returned, 6.75 M tokens; T1-03: 12 findings survived), T1-53 (a 51-agent workflow stopped by the owner: "Ты сжег почти все токены"), T1-26 (13 Luna, one entry each, then a judge who read the tree himself — R's "width without a stated need"), T1-U2 (the width comparison never run). Mapping: S2-05 present at O L103 ("by judgement, not to fill a band"); S1-14 partial. §6.3 R1: the cap was written after T1-01 and T1-53.

Decision: adopt, narrowly: the page already caps and announces; what it lacks is where the number comes from. "More" stays untested (theme c), so the sentence derives the count and asks for its reason, and claims nothing about yield.

Delta, O L69:
- old: `count against the alive cap and never takes a top-row role; announce its count before spawning, like any other fan-out.`
- new: `count against the alive cap and never takes a top-row role; announce its count before spawning, like any other fan-out, a count derived from the units with the plan saying why that many (measured 2026-09-11: eighty agents launched on the word "bigger" kept twelve findings; 2026-09-07: the user stopped a wave of fifty-one for what it had spent).`

Line balance: 0 (L68–69 are one wrapped paragraph; the line grows). Pins: the tier-table pin covers L63 only; no pin quoted L69 (see the defect note in §5). New case **D9** "the bulk count is derived from the units and the plan says why that many": `says("a count derived from the units with the plan saying why that many")`.
Phase 3: H2 — independently verified findings per agent at widths 5 / 10 / 20 / 50 on matched claims (H16 for the owner's 34-Luna-versus-one-Sol form).

### Row 3 — calibrate the cheap tier before widening it

Claims: S2-06 (CC: heterogeneous teams −12.6 pp on BrowseComp), S2-18 (CC: off-domain routers random; ~1,500 in-domain pairs fix it), S1-23, S1-13. Incidents: T1-U4 (Terra never used), T1-02, T1-03, T1-16. Mapping: S2-18 not located; S2-06 adverse against a present rule (O L61–63, L68).

Decision: defer to phase 3. The row's change type is a measurement; a page sentence that could execute it ("three units on Luna and one strong reader before every wave, compared by a judge") spends a strong agent per wave on the strength of one adverse benchmark whose task shape (deep search) the local record never gave Luna. The measurement phase 3 runs first: H3 (per-claim correctness by tier — Luna, Terra, Sol — on matched claims) and H18 (which closed-answer forms over a bounded input Luna carries). Mechanism for later, one line: a pilot of n units run on the bulk tier and on one strong reader, judged blind, before a wave on a task shape the record has not measured; the wave goes to the tier the pilot passed.

### Row 4 — a judge verdict that rests on a check the judge could not run is `unknown`

Claims: S2-37 (CC-v: frontier judges favour their own output), S2-38 (CC-v: order reversal flips 25 / 58 / 89 %), S2-33, S2-46 (execution-based checks are the definitive measure), S1-40. Incidents: T1-37 (judge Astra J2's "keep codex-delegate" adopted, then two collisions the judge had not established), T1-45 (J3's `proofbound` killed by a collision check); T1 §2.4: Astra "2 of 6 verdicts later overturned by evidence the agent could not gather". Mapping: S2-38 not located ("no order-swap or position control"); the mechanism exists at C L187 (`EXPECT:`: none matching is exit 5).

Decision: adopt. The page's own record shows the failure shape twice, and the gate that answers it is already on the sibling page.

Delta, O L122 (the bullet is rewritten in place):
- old (L122, verbatim):

        - Judge panel for a design task.

- new (verbatim):

        - Judge panel for a design task: a verdict that rests on a check the judge could not run is `unknown`, or the brief gates that check with `EXPECT:` (measured 2026-09-17: two of six judge verdicts fell to a collision check no agent had run).

Line balance: 0. Pins: **F2** "the six verification bullets, one line each" — regex `/^- Judge panel for a design task\.$/m` becomes `/^- Judge panel for a design task: a verdict that rests on a check the judge could not run is `unknown`, or the brief gates that check with `EXPECT:` \(measured 2026-09-17: .*\)\.$/m`. The order-swap control (S2-38) is not adopted: no local incident, and S2-43 says counterbalancing only reduces variance at double cost.
Phase 3: H4 — judge verdicts overturned by a later executed check.

### Row 5 — a stall is re-planned, not run a third time

Claims: S2-09 (CC ablation: without the full ledgers −31 %), M1/M2 (Magentic-One: progress ledger, stall counter with threshold 2, then re-plan), S1-51. Incidents: T1-45 (each round "progressed" to a new winner, so O L126's two-round rule never counted a stall; the name came at round 4 from a list built after an owner correction), T1-46 (seven turns answering notifications already read — linked by the shortlist, **not answered by this delta**: it is a notification-handling cost, covered by O L107's "the completion notification is when you read its status lines"). Mapping: M2 partial (a threshold of two, no counter); S2-09 partial.

Decision: adopt. The stall rule is keyed to "winners not adopted", T1-45's exact shape, so that it does not collide with the fix-round escalation on the same lines (a fix that fails twice still goes to the top row).

Delta, O L127 (the sentence at L126–127 is extended on L127):
- old: `that round fails too.`
- new: `that round fails too. Between rounds, say what the last one adopted and what changed; two rounds whose winners were not adopted are a stall, and a stall is a new plan shown for the word, not a third round (measured 2026-09-17: three naming rounds each crowned a winner and adopted none; the name came from a fourth, built after the user's correction).`

Line balance: 0. Pins: **F3** pins the L126–127 sentence, untouched. New case **F8** "two rounds that adopted nothing are a stall, re-planned and not run a third time": `says("Between rounds, say what the last one adopted and what changed; two rounds whose winners were not adopted are a stall, and a stall is a new plan shown for the word, not a third round")`.
Phase 3: H6 — rounds per adopted outcome; repeated-round incidents.

### Row 6 — the commands each check needs, listed against the rights row before the plan

Claims: S2-30 (CC: separating policy generation from the permission audit +15.8 %), S2-31 (CC: more reasoning does not fix a rights mismatch), S1-28, S3-24. Incidents: T1-44 (Codex Sol N2, `network:true`, exit 6, 2,649,693 tokens: the collision check failed on SSL inside its sandbox and the coordinator redid it), T1-51 (work project: 10 of 13 agents ended at exit 6 carrying 1–3 declined requests each), T1-14 (agent type did not resolve; probed cheaply first — linked, **not answered here**: it is a launch probe, not a rights inventory). Mapping: S2-30 partial ("rights declared per agent … no separate audit step").

Decision: adopt, on the orchestrate page (step 1 is where the composition is decided); the sibling's rights table is unchanged and stays authoritative for what each row allows.

Delta, O L37:
- old: `1. Load the sibling skill with the Skill tool if it is not loaded yet, scout, then decide the composition and the agents.`
- new: the same sentence, then ` For each agent, list the commands its check needs against what its rights row and the sandbox allow: a command they refuse makes the check yours, under the redirect rule, or a write agent's, never a read agent's refused turn (measured 2026-09-17: a Sol reviewer spent 2.65 million tokens on a collision check its sandbox could not complete, and the coordinator redid it).`

Line balance: 0. Pins: **A3** pins the old sentence as a substring, untouched. New case **C11** "the commands each check needs are listed against the rights row before the plan is shown": `says("For each agent, list the commands its check needs against what its rights row and the sandbox allow: a command they refuse makes the check yours, under the redirect rule, or a write agent's, never a read agent's refused turn")`.
Phase 3: H7 — exit-6 rate per run by declared rights; checks redone by the coordinator; tokens on blocked turns.

### Row 7 — open one assembled brief whole and resolve its paths before the fan-out

Claims: S1-08 (VE, Cursor: more agents under an instruction amplify its defects), S1-09 (VE: a number range in the brief), S3-09, S3-19, S3-46. Incidents: T1-05 (the coordinator's script joined all twelve Codex reports to the wrong paragraph; 6 Luna and part of 6 Opus burned, two `TaskStop`, the measurement withdrawn — the only outcome-blocked incident caused by the coordinator alone), T1-09 (a doubled `plugins/codex-delegate` segment in all twenty bulk prompts; 20 paid turns, 19 of 20 verdict words unusable), T1-39 (a zsh quoting slip in the prompt generator gave each of three Luna one set of four; all three `partial`). Mapping: S1-08 partial — O L118's critic "reads the decomposition, not the subject", i.e. the split's content and not the assembled prompt; §6.3 R2: three recurrences, one after the rule.

Decision: adopt the brief half as a page sentence the coordinator executes with Read and one command (`ls`/`test -e` on each path): the change type is "mechanism" in the shortlist, but no driver change is needed. Reject the range half (S1-09): one vendor report, low local confidence (T1-01, T1-54), and row 2's derived count answers the local quantity defect better than a range would.

Delta, a new bullet after O L118 (becomes L119; the bullets after it shift by one):
`- Open one assembled brief whole before the fan-out and resolve every path it names by a command: the critic reads the split, not the file your generator wrote, and a defect there reaches every agent (measured 2026-09-11, 2026-09-12 and 2026-09-17: a join that paired all twelve reports with the wrong paragraph, a doubled path segment in all twenty prompts, and a quoting slip that gave each of three agents one set of four).`

Line balance: +1, paid by the budget pin 155 → 156 (precedent `df8942a`, 0.15.0: 150 → 155 for +3 lines). Alternative payment, not recommended: drop L117 `- Scout inline first: the work-list is yours, before any fan-out.`, a rule the page states at L22, L27 and L37, with F2 losing that regex; it is the first item of the list a coordinator reads while composing, so the owner should decide (§5).
Pins: F2's six regexes are unaffected by an inserted line. New case **F7** "one assembled brief is opened whole and its paths resolved before the fan-out": `shows(/^- Open one assembled brief whole before the fan-out and resolve every path it names by a command: .*\(measured 2026-09-11, 2026-09-12 and 2026-09-17: .*\)\.$/m)`.
Phase 3: H5 — stage-1 contract defects reaching a fan-out per run; agents burned on a defective brief.

### Row 8 — a finding is one that changes correctness or a stated requirement

Claims: S1-37 (VE, Claude Code best practices: "flag only gaps that affect correctness or the stated requirements"), S1-40 (VE: verifiers declare early victory without a scope clause), S2-08. Incidents: T1-50 (`research/2026-09-11-markup-round-0/rounds.md` round 08: 27 edits against the wave's 87 findings, 10 regressions of the writer's own — 4 false, 5 overstated, 1 vaguer; 4 of 27 stated checks did not hold), T1-08 and T1-12 (the coordinator's own early victories, cut by agents). Mapping: S1-37 not located on the two pages (the adversarial-review reference bounds findings for code review only: "Report only material, actionable findings", `references/adversarial-review.md:23`); S1-40 partial.

Decision: adopt the findings half. Defer the scope half ("the verifier's scope is named in full"): its local anchors are the coordinator's early victories, not a verifier's, and the sibling's `CHECK:` line and O L147 ("a test without its count is not evidence") already carry what the record supports; H8 measures the bounded brief first.

Delta, O L119 (rewritten in place):
- old (L119, verbatim):

        - Adversarial verify: a refuter defaults to `refuted` when it is uncertain.

- new (verbatim):

        - Adversarial verify: a refuter defaults to `refuted` when it is uncertain, and a finding is one that changes correctness or a stated requirement, the rest its `open` (measured 2026-09-11: twenty-seven edits against a wave's eighty-seven findings brought ten regressions of their own).

Line balance: 0. Pins: **F2** regex `/^- Adversarial verify: a refuter defaults to `refuted` when it is uncertain\.$/m` becomes `/^- Adversarial verify: a refuter defaults to `refuted` when it is uncertain, and a finding is one that changes correctness or a stated requirement, the rest its `open` \(measured 2026-09-11: .*\)\.$/m`. The `refuted` default (S2-23's instructed bias) stays: §6.1 P5 says the two coexist.
Phase 3: H8 — regressions per round under a bounded against an unbounded reviewer brief; owner corrections at stage 6.

### Row 9 — the plan states what the run is expected to spend, by tier and role

Claims: S1-15 (VE-n, Anthropic: ~4× / ~15× tokens; delegate above a value threshold), S3-35 (ME: MetaGPT budget stop), S2-15/16 (CC: cascades under a fixed budget). Incidents: T1-53 (owner stopped a 51-agent wave for cost), T1-07 (Astra at 1 % quota with the only reproduction path on Astra), T1-01 (6.75 M tokens), T1-44 (2.65 M on one blocked check). Mapping: S1-15 and S3-35 not located; T1 §2.4 has the per-tier medians (report fields, level 3): Luna 90,065 over 53 agents, Astra 903,705 over 6, Sol 3,032,161 over 18; Claude agents unrecorded (T1-U3).

Decision: adopt the accounting, as the owner bounded it; defer the run cap (H11) — a cap the coordinator can sum only from Codex reports after each return, and the owner said no capacity model yet.

Delta, O L41 (extended between the two pinned sentences):
- old (L41, the tail): `… at a time, six alive. A cap the user overrides in words ("two Fable")`
- new: `… six alive. Beside them, what the run is expected to spend, by tier and role (measured over five runs to 2026-09-17, Codex tokens per agent at the median: a Luna unit 90 thousand, an Astra judge 900 thousand, a Sol writer or reviewer 3 million; a Claude agent's count is not recorded). A cap the user overrides in words ("two Fable")`

Line balance: 0. Pins: **C6** pins both neighbouring sentences as substrings, untouched. New case **C10** "the plan states what the run is expected to spend, by tier and role": `says("Beside them, what the run is expected to spend, by tier and role (measured over five runs to 2026-09-17, Codex tokens per agent at the median: a Luna unit 90 thousand, an Astra judge 900 thousand, a Sol writer or reviewer 3 million; a Claude agent's count is not recorded).")`.
Known weakness, for §5: the Luna median hides a 50× spread by task shape (T1 §2.1: a quote check 124 k median, a tree verification of one fix 742 k mean, a recognition read 13.6 k median).
Phase 3: H11 — owner corrections at stage 2, runs stopped for cost, paid turns per outcome.

### Row 10 / D2 — the completeness critic is spawned, once, before text a human reads

Claims: S1-44 (RA, Anthropic: attribution as its own pass after synthesis), S1-46, S2-07. Incidents: T1-49 (a research README asserted round one's returns were lost; they were intact in another directory; inferred from absence and published unchecked), T1-50, T1-08, T1-20; T1 §4: "never assigned anywhere in the corpus"; owner corrections at stage 6: 8 of 27. Mapping: S1-44 partial (O L25 makes attribution the coordinator's duty); §6.3 R12.

Decision: adopt as the owner decided on 2026-09-17: one Opus reader, before any text a human will read, never per return.

Delta, O L123 (rewritten in place):
- old: `- Completeness critic at the end: what is missing, unverified, unread.`
- new: `- Completeness critic at the end: what is missing, unverified, unread; one Opus reader of any text a human will read, spawned once before it is published and never per return (measured 2026-09-17: none of seven runs had spawned one, and a README had published an inference from absence unchecked).`

Line balance: 0. Pins: **F2** regex `/^- Completeness critic at the end: what is missing, unverified, unread\.$/m` becomes `/^- Completeness critic at the end: what is missing, unverified, unread; one Opus reader of any text a human will read, spawned once before it is published and never per return \(measured 2026-09-17: .*\)\.$/m`.
Phase 3: H12 — stage-6 incidents; owner corrections at stage 6, against the coordinator's own completeness pass.

### Row 11 — every fork is a numbered choice with its cost

Claims: S1-52 (VE-n, Magentic-UI: the agent decides when to ask and carries the context), S1-50 (RA: escalate on irreversibility), S3-24. Incidents: T1-23 (a bare "го" read as approval over forks the coordinator had left open, three times: 30a:204, 30a:848, 426:92; the coordinator announced the reading each time and no objection followed), T1-38 ("wait for a second backend" presented as a free option; the owner challenged it, the coordinator retracted). Mapping: S1-52 and S1-50 partial; §6.3 R8: O L44 "present, read loosely".

Decision: adopt. Two vendor rationales and two local incidents with traces, at a line the page already has.

Delta, O L43 (the wrapped sentence's last line, extended):
- old: `   recommendation and let the user pick.`
- new: `   recommendation and let the user pick. Every fork left in the plan is a numbered choice with its cost beside it and the recommendation marked, so that "go" alone takes the recommendation and a number takes another (measured 2026-09-13 to 2026-09-17: a bare "го" over open forks three times, and a wait offered as free that was not).`

Line balance: 0. Pins: **C1** ("One plan when there is one; … let the user pick") and **C3** ("The user's "go" covers only what the plan listed") untouched — "go" taking the marked recommendation is "go" covering what the plan listed. New case **C9** "every fork in the plan is a numbered choice with its cost, and "go" alone takes the recommendation": `says("Every fork left in the plan is a numbered choice with its cost beside it and the recommendation marked, so that \"go\" alone takes the recommendation and a number takes another")`.
Phase 3: H13 — owner corrections after "go".

### Row 12 — a schema failure on a bulk return is re-asked once

Claims: S3-52 (ME: Workflow schema validation with retries, five by default per the docs), S3-68, S3-31. Incident: T1-02 (4 of 50 Haiku returns in the 2026-09-11 Workflow lost to output-schema validation — arrays as strings, a required field dropped — no re-run).

Decision: reject as present. Counter-evidence: (a) `skills/codex/scripts/driver.mjs:2641` "turns STARTED under --output-schema; at most one corrective retry" and `:2971` `if (errs.length && outputAttempts < 2) { startCorrectiveTurn(errs); return; }` (level 1: the lines resolve), so a Codex agent's schema failure is already re-asked once by the driver; `driver.mjs --help` line 149 "13  the answer failed --output-schema" (level 3: ran on 2026-09-17), and O L137 reads any other non-zero exit with an answer as a gate verdict, i.e. the prose answer is read, not lost; (b) O L109 sends independent Claude agents to background Agent calls, where the five fields are text and nothing validates them away; (c) O L124 "No silent caps: name every agent, check or item you dropped" already forbids the silent drop T1-02 records. What remains unmeasured is the metric: returns lost to schema per wave (phase 3), and T1-U1 (whether the four lost returns held findings that would have survived).

### D1 — S1-39 against O L25

Keep L25 `verify: you never grade your own work, a fresh agent does` unchanged (owner, 2026-09-17). The contradiction dissolved on re-reading: L25 forbids grading one's own work; O L27 "targeted bounded checks stay allowed inline after it" and L103 "or from you under the redirect rule" already allow inline checks of agents' work. The record's split — T1-04, T1-11, T1-30, T1-31 (the coordinator caught agent errors inline) against T1-08, T1-12, T1-49 (agents cut the coordinator's own claims) — fits the page and none of it fits S1-39's "without a separate verification step" (RA, no measurement; S2-37/38 side with the page). No delta; pin B5 untouched. Counter-evidence id: S2-37.

### D3 — O L68 "measured better and smarter, and four times cheaper"

The price half has no trace: no Haiku token count is recorded anywhere (T1-U3; T1 §2.4 "not recorded per agent"), so it cannot be re-worded into a measured number and cannot be re-measured from the record. The quality half has its trace (T1 §2.4: Haiku 4/50 lost to the schema, most candidate findings dead under Opus refutation; Luna 20/20 located the file under a broken path, 13/13 agreed with a judge who read the tree itself). Under the owner's rule — cut or link, never qualify — the price half is cut and the quality half carries its trace and dates.

Delta, O L68:
- old: `**Prefer Luna to Haiku in the bulk row**: measured better and smarter, and four times cheaper. The bulk row does not`
- new: `**Prefer Luna to Haiku in the bulk row**: measured better (2026-09-11 to 2026-09-13: four of fifty Haiku returns lost to the schema and most of the rest dead under refutation; twenty of twenty Luna quoted the right file under a broken path and thirteen of thirteen agreed with a judge who read the tree itself). The bulk row does not`

Removed, quoted: `and smarter, and four times cheaper` ("smarter" has no measurement of its own; the parenthetical is what "better" rests on). Line balance: 0. Pins: none quoted L68 (see §5); new case **D10** "Luna over Haiku carries its trace and no price claim": `says("**Prefer Luna to Haiku in the bulk row**: measured better (2026-09-11 to 2026-09-13: … read the tree itself).")` plus the negative half `if (/four times cheaper/.test(text)) return "the page claims a price it never measured again"`.
Option B, if the owner wants a price sentence rather than a cut: `… and the only cost on record is Luna's, ninety thousand tokens at the median over fifty-three agents` — true (T1 §2.4) but says nothing about Haiku, which is why it is not recommended.
Luna's uses (mass, the quota fallback, the task shapes) stay off the page as H16–H18 until phase 3 measures them; the bulk row's L63 wording is unchanged.

## §2 Line ledger

| step | lines | note |
|---|---|---|
| page at `7e7d9cc` | 155 | budget pin 155; suite 45/45 on the unchanged tree (`node --test plugins/entrust/evals/orchestrate.test.mjs`, 2026-09-17) |
| rows 1, 2, 5, 6, 9, 11 | +0 | sentences extend L103, L69, L127, L37, L41, L43 — each already a paragraph line or the tail of a wrapped one |
| rows 4, 8, 10, D3 | +0 | bullets L122, L119, L123 and the sentence at L68 rewritten in place |
| row 7 | +1 | a new bullet after L118 |
| page after | **156** | one heading level (7 `## ` headings), no fence — checked on the modified copy |

Budget pin: `the page stays inside its budget: 155 lines, one heading level, no fence` → `156 lines`, and `lines.length > 155` → `> 156`. Reason: one rule paid for by the record's only coordinator-caused outcome-blocked incident (T1-05) and two recurrences (T1-09, T1-39), one of them after the split-critic rule; precedent `df8942a` (0.15.0) moved the pin from 150 to 155 for three added lines.

Words, because the pin counts lines and the deltas extend them: 3,138 → 3,672 (+534); the eleven dated parentheticals are 288 of those. A lean variant that keeps every rule and moves the parentheticals to the CHANGELOG entry's "Why" clauses would add about 246 words; the page's own convention (L30, L33, L70, L80–81, L107–109, L118, L121 carry their measurements inline) argues for keeping them, and §5 asks.

Eval: 45 → 53 cases; on the modified copy `all 53 passed`. Changed: the budget case (name and number) and F2 (three of six regexes). Added: C9, C10, C11, D9, D10, E7, F7, F8 (their names do not collide with any existing case: the file has C1–C8, D2–D5, D7, D8, E1–E6, F1–F6). Unchanged and re-verified passing beside the edits: A3, B5, C1, C3, C6, E6, F3, the tier-table pin, D4, D5. Full text of both diffs: `page.diff`, `eval.diff` beside this file; the script that produced them and asserted every anchor once: `apply.py`.

## §3 CHANGELOG entry (`plugins/entrust/CHANGELOG.md`, above `## 0.17.0`)

```
## Unreleased

### Changed

- The orchestrate page gains seven rules and loses one claim, from the 2026-09-17 research round
  (`research/2026-09-17-orchestration-practices/`: 185 survey claims mapped to the two pages and 54
  coordinator incidents from the local record; the ids below are that round's). A task that turns on one
  check, or whose steps each wait on the last, goes to one agent or stays with the coordinator, never to a
  panel. Why: sixteen agents over two naming rounds proposed, reviewed and judged, and each round's winner
  then fell to a collision check no agent had run (T1-45), while the two tasks the coordinator kept in its
  own hands that week landed (T1-19, T1-48); the controlled comparisons say the same of sequential and
  tool-heavy work (S2-02, S2-03). A judge is briefed to answer `unknown` where its verdict rests on a
  check it could not run, or the brief gates that check with `EXPECT:`. Why: two of six judge verdicts
  were overturned by a check no agent had run (T1-37, T1-45). Two rounds whose winners were not adopted
  are a stall and become a new plan, not a third round. Why: the two-round rule counts fix rounds, and
  three naming rounds each crowned a winner and adopted none (T1-45). Before the plan is shown the
  coordinator lists the commands each check needs against the agent's rights row and the sandbox. Why: a
  Sol reviewer spent 2.65 M tokens on a collision check its sandbox could not complete and the coordinator
  redid it (T1-44); ten of thirteen agents in one run ended at exit 6 on declined requests (T1-51). One
  assembled brief is opened whole and its paths resolved by a command before any fan-out. Why: the split
  critic reads the decomposition, not the file the generator wrote, and three assembly defects each reached
  every agent — a join that paired all twelve reports with the wrong paragraph (T1-05, the one
  outcome-blocked incident of the coordinator's own), a doubled path segment in all twenty prompts (T1-09)
  and a quoting slip that gave each of three agents one set of four (T1-39). A refuter's finding is one
  that changes correctness or a stated requirement, the rest goes to `open`. Why: twenty-seven edits
  against a wave's eighty-seven findings brought ten regressions of their own (T1-50). Every fork left in
  the plan is a numbered choice with its cost beside it and the recommendation marked. Why: a bare "го" was
  read as approval over open forks three times (T1-23) and a wait was offered as free that was not
  (T1-38).
- The bulk row's count is derived from the units and the plan says why that many; the plan also states
  what the run is expected to spend by tier and role, in the record's medians. Why: eighty agents were
  launched on the word "bigger" and kept twelve findings (T1-01, T1-03), the user stopped a wave of
  fifty-one for its cost (T1-53), and an Astra ran at 1 % quota with the only reproduction path on it
  (T1-07); a number in the plan moves that stop before "go". No cap and no capacity weights yet: the
  record's ratios (Luna 1 : Astra 10 : Sol 34 at the median) disagree with a per-tier price order on Sol,
  and Claude agents' tokens are unrecorded (T1-U3).
- The completeness critic is one Opus reader of any text a human will read, spawned once before it is
  published and never per return. Why: no run in the record had spawned one (T1 §4), and a research README
  published an inference from absence unchecked (T1-49).
- "Prefer Luna to Haiku" keeps the half it can show — four of fifty Haiku returns lost to the schema and
  most of the rest dead under refutation, twenty of twenty Luna at the right file under a broken path,
  thirteen of thirteen agreed with a judge who read the tree — and drops "four times cheaper". Why: no
  Haiku token count exists anywhere in the record (T1-U3), so the price half was a claim, not a
  measurement.
- The page's line budget in `evals/orchestrate.test.mjs` moves from 155 to 156 for a page of 156 lines;
  eight cases pin the new sentences (C9–C11, D9, D10, E7, F7, F8), and the three verification bullets that
  changed carry their new text in F2.
```

## §4 Left unchanged, and why

- **O L25** (D1): kept as the owner decided; the record's split fits it (§1 D1).
- **Row 12**: present in the driver (one corrective retry, exit 13) and on the page (L109, L124, L137); §1 row 12.
- **Row 3**: deferred; the calibration is the phase-3 measurement itself (H3, H18).
- **Row 7's range half, row 8's scope half, row 9's run cap**: no local incident of the shape the claim names, or an owner boundary; each has its H-row.
- **O L63, the bulk row's wording** ("work that is wide rather than deep … What to spend them on is yours to decide"): Luna's task shapes are H18 until measured; the pin on the row is unchanged.
- **O L116–117 (adversarial and diverse verify) beyond row 8**, **O L118 (critique the split)**, **O L121 (one return whole)**, **O L70 (the bulk unit)**, **O L100/L103's ownership contract**: mapped "present" and shown firing (r-synthesis §3.3: T1-13, T1-52, T1-10, T1-16, T1-24); nothing to add.
- **The role table (theme a, H14)**, **the persistent advisor (theme b, H10)**, **a capacity model (theme d)**: untested or contested with no local incident attributed to their absence; the owner set "no capacity weights on the page yet".
- **The do-not-adopt list** (debate, phase-cut roles, standing advisor, mixed teams on deep search, identical refuters with a vote, a green gate at width, off-domain routers, handoffs): the page already avoids each; the only sentence it named, L68, is D3.
- **The codex page**: no delta needed it; every rule found a line on the orchestrate page. For the record, that page is pinned by `evals/agent-contract.test.mjs` (`const SKILL = path.join(ROOT, "skills", "codex", "SKILL.md")`, line 16), not by the orchestrate suite.
- **O L117 "Scout inline first"**: a duplicate of L22, L27 and L37, left in place; it is the offered alternative payment for row 7's line (§2), the owner's call.
- **The F2 case's name** ("the six verification bullets") and the pins missing for L68–70, L118, L121: a defect found in passing, recorded below for `ISSUES.md`, not fixed in this change (repository rule).

## §5 Questions only the owner can answer

1. Parentheticals on the page or in the CHANGELOG? The eleven dated facts are 288 of the +534 words; the page's convention keeps measurements inline, the lean variant keeps every rule at about +246 words.
2. Row 7's line: the budget change 155 → 156 (recommended, precedent 0.15.0) or paying with L117 "Scout inline first", a rule the page states three times elsewhere but the first item of the checklist a coordinator reads?
3. Row 9: should the page carry the three medians at all (Luna 90 k / Astra 900 k / Sol 3 M), or only ask the plan for an expectation and let the coordinator take it from earlier reports in the run directory? The Luna median hides a 50× spread by task shape (13.6 k a recognition read, 124 k a quote check, 742 k a tree verification); by-role numbers on the page would be truer and longer.
4. Row 10: the critic fixed to Opus as you said on 2026-09-17, or "one strong-row reader", which under the composition rule (half the judgement agents beyond the implementers are Codex) would sometimes be a Sol?
5. D3: cut the price half (recommended) or option B, "and the only cost on record is Luna's, ninety thousand tokens at the median over fifty-three agents"?
6. Row 6: the command inventory sits in step 1 (before the plan is shown, the coordinator's own step). Should it be visible to you in the plan (step 2, "what each may write" beside it), at the cost of one more sentence a user reads?
7. Row 5's stall rule sends a stall to a new plan and the word; the fix-round rule beside it escalates to the top row first. Is that the split you want, or should a stall also try one top-row round before returning to you?
8. A defect found in passing, for `ISSUES.md` (not written: this run is read-only) — issue-ready text:

> **E2. `orchestrate.test.mjs` pins none of the rules 0.15.0 added, and its F2 case says six bullets where the page has eight.** Evidence, level 3: at `7e7d9cc`, `grep -c` over `plugins/entrust/evals/orchestrate.test.mjs` returned 0 for each of "one claim, one address" (O L70), "Critique the split" (O L118), "unanimous" (O L121), "Prefer Luna" (O L68) and "announce its count" (O L69) on 2026-09-17; commit `df8942a` (0.15.0) changed that suite only at its budget number. The case named "F2 the six verification bullets, one line each" lists six regexes; the page's list at L117–124 has eight bullets. Issue text: three rules the 0.15.0 changelog names as the round's result — the bulk unit, the split critique and reading one return whole before a tally — and the Luna-over-Haiku sentence have no pin, so an edit that drops any of them leaves the suite green; F2 should pin every bullet of the list and say how many there are, and the unpinned sentences should each get a case. (This design adds pins only for its own sentences and for the three bullets it rewrites; the missing pins for L70, L118 and L121 are left for the fix that names this entry.)

## Verification record

- Files read whole: repository `CLAUDE.md` (24 lines); `research/2026-09-17-orchestration-practices/README.md` (85), `rounds.md` (20), `c0-split-critique.md` (51); `r-synthesis.md` §1.4 (L50–243), §2 (L244–439), §3 (L440–552), §5 (L573–650), §6 (L651–696), §7–§8 (L697–756); `t1-retrospective-ledger.md` §1 (L74–146), §2–§7 (L147–349); `plugins/entrust/skills/orchestrate/SKILL.md` (155); `plugins/entrust/skills/codex/SKILL.md` (321); `plugins/entrust/evals/orchestrate.test.mjs` (453); `plugins/entrust/evals/README.md` (250); `plugins/entrust/CHANGELOG.md` L1–130; `skills/codex/references/adversarial-review.md` (37); `research/2026-09-11-markup-round-0/rounds.md` L1–20; survey rows S1-08/09/11/15/37/39/40/44/46/50/52/56/60, S2-02/03/05/06/09/18/30/31/37/38/46, S3-24/31/35/52/68 by grep; `driver.mjs` L2641, 2971, 3005–3050, 3600–3625 and `--help`.
- Greps run to verify quotes: every old string of the eleven deltas asserted `count == 1` against the `7e7d9cc` page by `apply.py`; every pin edit asserted `count == 1` against the eval file; 20 phrase counts over the eval file (the table in the transcript: "Prefer Luna" 0, "announce its count" 0, "Critique the split" 0, "unanimous" 0, "one claim, one address" 0, "Completeness critic" 1, "Judge panel" 1, "Adversarial verify" 1, …).
- Suite: unchanged tree `node --test plugins/entrust/evals/orchestrate.test.mjs` → `all 45 passed`; modified copy under this directory → `all 53 passed`; page 156 lines, 7 `## ` headings, 0 fences.
