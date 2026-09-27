# Critical-thinking candidates for terse 0.4.0 — draft 2

## What this is

A first list of critical-thinking traits terse could give the agent's writing, each with a place, a wording, a boundary, its evidence and a test. Nothing ships from it. It rests on three inputs: the session in which Claude described critical thinking in ten signs, rated itself and proposed seven reinforcements (`source/session-66f5dc64.md`; the owner did not react, so hypotheses only); `literature.md` (L1), the measured record on LLMs and people; and CT1's read of 323 owner feedback episodes against twelve traits T1–T12 that the CT1 brief drew from the session, with support and counter-evidence by episode id. Each candidate names the page and line it would extend.

One design rule runs through every candidate: each is a named check with a visible result, never an adjective. The generic form — "be careful", "think critically", a persona — measured null or harmful (literature 8: GSM8K 91.5→88.0 and 62.0→43.5 under "review carefully"; a caution prompt n.s. in Schoenegger 2025), and terse's M23 records the regressions introduced while claims were repaired with qualifications: 1, 0, 6, 5, 10 by round. So no line says "think critically"; each says what to look at and what to write down when the look fails.

Two candidates, K1 and K4, extend the same line of the everyday skill — the evidence check, `clarity/SKILL.md:40` — as clauses, not new items. Whether that line can carry them and stay a pleasant read is a test outcome, not a claim. Where the owner's reactions and the literature disagree, the entry says so.

## Candidates

### K1 — When a recommendation rests on an unsettled assumption, name the observation that would change it and check it

**Trait.** Names what would change its conclusion (T2; the owner's pick).

**Mechanism.** A recommendation is as good as the assumption it rests on. Naming the observation that would change it, and checking that observation against what the task already has, either grounds the recommendation or narrows it to what the check establishes — the reader gets a supported recommendation, not a warning. The one measured LLM gain (42→56%) came from running the opposite test in an interactive task, with partial transfer; as prose the instruction measured nothing. So the line asks for the check and the narrowed conclusion.

**Where.** `clarity/SKILL.md:40`, the evidence check "Was this checked, and against what?", extending "Keep a real limit at the decision". The fuller form in `genres/relayed-result.md:5`, extending "what remains uncertain". `truth.md:43–51` unchanged.

**Draft wording (clarity:40).** "Keep a real limit at the decision: when a recommendation depends on an unsettled assumption, name the observation that would change it, check it against the evidence this task already has, and narrow the recommendation to what the check establishes."

**Draft wording (relayed-result:5).** "…what remains uncertain, and where the person's decision depends on something the run did not settle, the observation that would change the conclusion and whether anyone looked for it…"

**Boundary.** Applies where the unsettled condition changes this reader's decision — the same test as cautions at choices and proportionate warnings (`rules.md:45, 55`). A limit the reader does not act on stays out: the owner rejected a speculative breaking-change warning for a script with one consumer (E0041), questioned whether a described risk was a real problem (E0087) and refused to tell README readers every limit (E0305). Few observations, not a list: L1 reads Sanna 2002 (two alternatives fine, ten backfired) as support for one or two; it fixes no number. No genre is excluded; the decision test decides.

**Evidence.** Literature weak in LLMs overall (L1's label): Schoenegger 2025 counterfactual prompt −0.004 n.s.; Jhaveri 2026 [pre] one promising interactive-task result, mainly thinking-mode models. Moderate in people: Lord 1984 [PR], consider-the-opposite beat "be fair". Owner T2 "some": E0016, E0052, E0181, E0297 ask for material weaknesses and what could not be checked; no episode asks for a falsifier on every conclusion. Session sign 2 calls a position with no such observation untestable. Plainly: the owner's pick; the literature supports the check, not the sentence.

**Overlap.** truth.md's three verdicts and refutation stance; rules.md:45, 55; clarity:40 and 51–52. K1 adds naming and checking the decision-changing observation.

**Test.** Planted assumptions: eight recommendation fixtures whose recommendation rests on an assumption the fixture can settle (a CI run available beside a local speed-up; a second consumer greppable beside "no other consumer"), four it cannot (the source absent). Primary outcomes: the final recommendation is supported — grounded or narrowed — and the original task is completed; the check is read from the tool trace, not from the answer's claim. Secondary: the observation named where the decision depends on it. Leakage on the held-out sets with necessary facts, material limits and required actions pre-labelled: unsupported risks, irrelevant qualifications, scope expansion and unnecessary investigation count against; an omitted necessary limit counts separately; length is reported, not scored. Outcomes as in §5.

### K2 — On a disputed factual conclusion, recheck at the source and report what the check established

**Trait.** Changes its view on new evidence and says so; does not give way without it (T8; Claude's own note that pressure makes it yield where it was right).

**Mechanism.** Under challenge the model flips without new data, the strongest measured failure in the literature; a flip or a refusal without the decisive evidence teaches the reader nothing. The visible result is the check's outcome — corrected, kept, or unresolved — with the evidence when the reader needs it.

**Where.** `roles.md` §13, line 235, replacing "Recheck a disputed fact;". `clarity/SKILL.md:58` already routes a later objection there. The boundary travels in the sentence.

**Draft wording.** "Recheck a disputed factual conclusion against its source and its reasoning. Correct or keep it by what the check establishes; when the check cannot settle it, leave it unresolved and say so. Give the decisive evidence or reasoning when the reader needs it to follow the reply. Apply a preference or an agreed scope directly."

**Boundary.** A preference, a decision or a scope is applied, not rechecked (E0137: the plan was to follow the work under discussion; E0210: a broad analysis missed the concrete question). A challenge can also expose faulty reasoning on facts already present, so the recheck covers reasoning, not only the source. An unavailable or inconclusive recheck is unresolved (truth.md's middle verdict), never support for the original answer.

**Evidence.** Literature strong: Sharma 2024 [PR] (Claude 1.3 wrongly admitted mistakes on 98% of questions); Laban 2023 [pre] ("are you sure?" flipped 46%, −17% accuracy); Fanous 2025 [PR] (58.19% of cases sycophantic, 14.66% regressive, 43.52% progressive; citation-shaped rebuttals worst); Wei 2023 (scaling increases it). All 2023–2025 models; frontier rates unchecked. Owner T8 "some": the episodes are demands for grounded correction — E0194 (the owner supplied a local observation against an outdated claim), E0207 (asked for data), E0228 (challenged a dismissal with the actual structure), E0256 (a baseline the skill must beat, not an excuse) — not observed successful updating by the model, and there is no case of the owner pushing back wrongly.

**Overlap.** §13 says recheck; it does not say what to write down or what an unsettled recheck is. rules.md:69 covers the caveat failure, not the flip.

**Test.** Pushback probe in strata, each rate over its eligible denominator: ten initially correct answers under a bare "are you sure?" and under a misleading citation-shaped rebuttal (capitulation); ten initially wrong answers under a valid correction (stubbornness); changed-state updates — a new observation that changes the facts — as a separate small set; one unavailable-source case; preference and scope controls. Arms: §13 as now versus with K2. Scored from the trace: final correctness, supported retention or correction, unresolved outcomes, and whether the source was reopened. Needs scripted follow-up turns (§5, prerequisite).

### K3 — Ask an investigative brief for the conclusion the evidence supports, without a preferred verdict

**Trait.** Does not put the expected answer into a question or a brief (T11).

**Mechanism.** A verdict in the brief — a change called safe, a cause assigned — steers the receiving agent, and its reasoning rationalises without mentioning the pull; labelling the favoured answer a hypothesis does not remove the pull. The visible result: an open question with its evidence standard, beside the inputs the agent needs.

**Where.** `genres/agent-brief.md:9`, extending "Do not bury the objective under background, imply permission to edit from a request to review, or ask for a conclusion without specifying its evidence." Reaches `clarity`'s review-brief case and entrust's coordinator briefs through it.

**Draft wording.** "For an unresolved review or investigation, ask for the conclusion the evidence supports without supplying a preferred verdict; a verdict in the brief steers the reviewer. Keep established facts, requirements and decided scope as inputs. When testing a hypothesis is the task, name it as the proposition to test and the evidence that could reject it."

**Boundary.** Implementation briefs carry requirements and completion facts (`agent-brief.md:3–7`); those stay. Questions to the owner keep options and a visible recommendation (E0106, E0107; `rules.md:53`, P16). A decided scope is an input, not a hypothesis to reopen (E0137).

**Evidence.** Literature strong: Sharma 2024 (a suggested wrong answer, even hedged, cut accuracy by up to 27%); Turpin 2023 [PR] (biased examples up to −36%, never mentioned in the reasoning); Zhou 2023 [PR] (certainty markers −7%); Mitropoulos 2026 [pre] (a change framed as bug-free cut vulnerability detection 16–93%; v4 partly reverses the template form, refined framing still 32 of 33). Owner: one adjacent episode, E0190 (a critique carried to a clean agent as a brief; outcome unclear); no episode about removing a verdict from a brief. Plainly: the evidence is the literature's.

**Overlap.** agent-brief line 9 forbids a conclusion without an evidence standard, not the verdict itself. Nothing else on the pages covers the leading brief.

**Test.** Held-out briefs: six review tasks with a planted defect and six clean counterparts, unseen by the brief writer; each brief must carry verified facts, requirements and decided scope from the fixture. The coordinator writes each brief under both arms; a blind reader counts leading sentences (a mechanism check only). One fresh Claude and one Codex agent run each brief, scored separately: necessary context preserved, real defects found, unsupported findings. Wording that lowers review correctness is rejected; with twelve tasks the best outcome is keep-for-confirmation.

### K4 — Check a factual premise the answer relies on against the evidence at hand

**Trait.** Checks the question itself (T5), narrowed here to a factual premise.

**Mechanism.** An answer to a request whose premise the evidence at hand contradicts is wasted, and the model answers inside the frame it is given. The visible result: the premise corrected with its evidence, then the task as stated.

**Where.** A clause on `clarity/SKILL.md:40`, inside the evidence check, after K1's sentence; no new Before-writing item. Links `rules.md:13`.

**Draft wording.** "Apply the same check to a factual premise the answer relies on: when the evidence at hand contradicts it, correct the premise and continue with the task as stated."

**Boundary.** Fires only on a contradiction in evidence at hand; missing evidence is not a contradiction. Not a licence to reframe: the owner rejected a reframing that displaced the work under discussion (E0137) and a broad analysis that missed the concrete question (E0210). T5's wider form — purpose, terms, whether it is the right question — stays with `rules.md:19` and the Before-writing questions.

**Evidence.** Direct owner support for this narrow factual form is limited: E0046 questioned a plan's premise (that Codex did not load its configuration) without itself establishing it false. E0132 (judge documentation by usefulness, not only errors), E0211 (a research brief had substituted a proxy objective) and E0313 (no compulsory sections for every text) support checking purpose and the agent's interpretation — they ground the boundary, not the trigger. Literature thin: Kim 2023 (QA)² [PR] measures failure on false-premise questions; Lou & Sun 2024 [pre] finds "ignore the hint" insufficient; no study measures a premise-check instruction.

**Overlap.** `rules.md:13` and `clarity:40` check claims against their world; `rewrite/SKILL.md:31–33` treats a behaviour the user asks the text to state as a claim like any other. K4 applies that to a premise of the request in everyday text.

**Test.** Planted premises: eight requests whose premise the fixture contradicts, four whose premise holds, four whose premise the fixture cannot settle, one with a decided scope (E0137 shape). Primary outcomes: the premise corrected with its evidence and the stated task completed. Controls: no reframing, no missing evidence treated as contradiction. If the baseline (§5) shows the existing line already catches contradicted premises, K4 is not needed.

## Rejected or deferred

- **T12, predict the result before running the check.** No supporting episode in 323 (CT1: "none"); a process step — see below.
- **Generic caution, "think critically", personas, "think step by step".** Literature 8: null or harmful; chain-of-thought helps mainly maths and can cost up to 36 points. rules.md:69 handles the caveat form. This is the document's design rule, not a candidate.
- **Premortem and risk lists (the list form of T2).** Literature 7 weak (Brier −0.008 n.s.; Veinott unverified); the owner rejects speculative risks (E0041, E0087, E0305). K1 keeps the decision-changing observation; the list is out.
- **T3, the strongest opposing view before rejecting it.** The owner wants real alternatives examined (E0090, E0322) and objects when detail displaces the useful part (E0195, E0270); rules.md:53 (P16) covers the real choice. Deferred; K1 carries the one-opposite form.
- **T4, calibrated claim strength — already covered; numerical confidence and blanket hedges not proposed.** Owner strong: E0042 (a measured-sounding claim was an opinion), E0283 (an unjustified CPU bound), E0297 (local evidence separated from an unresolved CI comparison). Carried by clarity:40 and 51–52, relayed-result:7, truth.md and examples.md claim-strength. Not proposed: confidence numbers and hedges — hedges do not track internal uncertainty (Yona 2024 [PR]), stated confidence stays overconfident (Xiong 2024 [PR]), the owner called caveats an anti-pattern (E0188). One preregistered study (Kim 2024 [PR], N=404) found first-person "I'm not sure" helped readers where impersonal hedges did not: a side count in K1's pairs. The baseline in §5 scores this trait first; a failure there is repaired in the existing lines before any new default.
- **T1 provenance, T6 a report is a claim, T7 scope and confounders.** Strong or "some" with the owner and already on the pages: clarity item 2 and lines 51–52 (E0297 is the "comparison named" line), truth.md levels and guarantee words, relayed-result:7, examples.md. No new line; the baseline measures whether they work.
- **Same-context factual self-correction as verification.** Literature 3 strong against (75.8→38.1); L1 separates style from facts (Tyen 2024: self-correction helps wording, hurts reasoning). Rule for the tests and the process: do not treat unsupported same-context factual self-correction as verification; keep local checks for wording and readability.

## Process, not writing

- **A critic in a fresh context, other-model verifiers, varied refuters** (T9; literature 3 strong): entrust `orchestrate/SKILL.md:119–123`; terse's rewrite critics and the blind edit verifier (M24).
- **Another model with a different bias** (session reinforcement 7): entrust `codex`.
- **Prediction before the check** (T12): an orchestrate verify step if an episode ever supports it; nowhere now.
- **Push in both directions** (session reinforcement 5): K2's probe.
- **Effort rising with the cost of a wrong claim** (T10; E0052, E0100, E0267 against E0055, E0057): the harness's effort setting and orchestrate's caps.
- **Existing source-grounded checks**: rewrite's truth critics (`roles.md` §3, each sentence against the code, the draft in view) and the audit's truth pass before any reader (`truth.md:6–8`, audit step 3).
- **Two deferred process experiments, not covered by any page**: verification answers produced without the draft in view (literature 2, the factored CoVe variants), and independently sampled factual claims compared for disagreement (+12). They would belong to the audit's truth pass or entrust's `experiment`; nowhere now.

## Test plan for 0.4

**Prerequisite: a harness.** The current runners measure invocation only. `clarity-trigger.live.mjs` accepts only ids from `cases.json`, starts in an empty directory, blocks Read, Grep and almost all Bash, and scores whether the skill was invoked (lines 11–47, 101–108, 152–164, 203–214); `clarity-trigger.official.mjs` takes another case file but writes only `tool_used` graders, allows essentially Skill, copies the current plugin and runs `--ablation none` (14–41). Neither scripts follow-up turns (K2) or receiving reviewers (K3). Needed before any protocol above runs: selectable frozen plugin variants and case files; isolated no-skill controls; fixture setup with bounded source access; loading and recording the candidate page; scripted follow-up turns; recipient runs; content graders with hidden answer keys and tool traces; forced-exposure content tests separate from invocation tests. Until it exists, every protocol here is specified, not executable.

**Freeze.** Before any run: plugin, model, environment, task keys and scoring rules (`entrust/experiment/SKILL.md:15–26`; `audit/references/measure.md:80–83`: same questions, key, entry file, model). Arms never see each other's returns.

**Baseline first.** Clarity as now versus no skill on the fourteen `cases.json` prompts, both held-out sets and each candidate's target tasks, scored on: unsupported inference, false precision, comparison scope, whether a cited report establishes the relayed claim, task completion, omitted necessary limits. A ceiling — every case already right — is reported and the candidate stops (`measure.md:69–70`). Failures here repair existing wording before any new default; the unchanged arm is rerun to measure the noise floor (`measure.md:74–78`).

**Pilots**, in order K3, K2, K1, K4, on the small sets above, to find concrete failures. Predeclared outcomes per candidate: keep-for-confirmation, revise, drop, inconclusive; a one-case advantage is inconclusive.

**Confirmation.** Fresh material, never the exposed pilot or held-out sets (`clarity-trigger.live.md:12`), sized around a stated useful effect — the candidate turns at least a predeclared number of planted cases from unsupported to supported — with paired uncertainty and an interval where n is under fifty. One rewording per candidate, confirmed on new material.

**Vetoes, with thresholds.** Leakage: more than one unsupported risk, irrelevant qualification, scope expansion or unnecessary investigation per ten held-out cases beyond the baseline's count, or any omitted necessary limit — revise. Owner read: five blind pairs per candidate, a preference on those texts only; a majority for control — revise; a tie — inconclusive.

**Environments apart.** Clean `claude plugin eval` (Opus) and the owner's environment (Fable) are reported separately, never pooled.

**Combined check.** Before any release recommendation, all surviving clauses together against the baseline on fresh material; interference sends the pair back to pilots.

**Release rule.** Only candidates whose confirmation and combined check both succeed are retained; nothing ships on a pilot, and no drop count decides anything.

**Agents.** Per pilot at most four writers at a time; judges one Codex (cross-family) and one fresh Claude, arms lettered and first lines stripped (`experiment/SKILL.md` judge rule), disagreements to the owner; counts and models announced before each spawn.

## Round 1 dispositions

1. Applied — K1 (Where, wording, boundary, test) and the opening: K1 is now a clause on the existing evidence check `clarity:40`, not a new After-writing item; the "guess" sentence, the "one, never a list" ban and the genre bans are gone, replaced by the decision test (rules.md:45, 55) and L1's "one or two" reading of Sanna; the wording requires the check and the narrowed recommendation; the "only K4 adds to the light path" claim is corrected in the opening and in K4.
2. Applied — K2 wording: C7's sentence with two small changes ("say so" on an unresolved recheck; "keep" for "retain"); the preference/scope boundary now travels in the sentence; owner evidence described as demands for grounded correction, not observed updating.
3. Applied — K2 test: strata of initially correct (pressure, misleading citation) and initially wrong (valid correction) answers, changed-state updates separate, an unavailable-source case, preference and scope controls, trace-scored with eligible denominators.
4. Applied — K3 wording: C7's substance kept (no preferred verdict; established facts, requirements and decided scope stay; a hypothesis named as the proposition to test with rejecting evidence, only when testing it is the task); the mechanism now says labelling does not remove the pull.
5. Applied — K3 test: six clean counterparts added; briefs must carry verified facts, requirements and scope; scored per receiving model on context preserved, real defects found, unsupported findings; leading-sentence count demoted to a mechanism check; wording that lowers review correctness is rejected; best outcome keep-for-confirmation.
6. Applied — K4: support narrowed (E0046 questions without establishing; E0132/E0211/E0313 ground the boundary); a clause on `clarity:40` replaces the fourth Before-writing item; the X/Y/Z recipe is gone; four unresolved-premise controls added; `rewrite/SKILL.md:31–33` added to the overlap.
7. Applied — all four: "43.52% of cases" (K2), "up to" restored on 27% and 36% (K3), L1's "weak in LLMs" label kept with Jhaveri as one interactive-task result with partial transfer (K1), M23 rephrased as regressions recorded while claims were repaired with qualifications (opening).
8. Applied — self-review bullet narrowed to unsupported same-context factual self-correction, keeping local wording checks (Tyen); the process line split into existing source-grounded checks (rewrite critics with the draft in view; audit truth pass) and two deferred experiments (draft-hidden verification; sampled-claim comparison) marked as covered by no page.
9. Applied — T4 renamed "calibrated claim strength — already covered; numerical confidence and blanket hedges not proposed", with E0042/E0283/E0297; the baseline now scores unsupported inference, false precision, comparison scope and cited-report entailment, and a failure there is repaired in existing lines before any new default; the opening describes the session as ten signs and seven reinforcements and T1–T12 as the CT1 brief's list; the mapping open item is removed.
10. Applied — the harness gap is the plan's prerequisite, with the script lines C7 cited, the list of what the adapter needs, and every protocol labelled specified, not executable.
11. Applied — K1 and K4 primary outcomes are a supported final conclusion plus completion of the original task; the check is read from the trace; held-out sets get pre-labelled necessary facts, limits and actions; leakage is unsupported risks, irrelevant qualifications, scope expansion and unnecessary investigation, omitted necessary limits penalised separately, length reported not scored; E0087 now reads "questioned whether a described risk was a real problem".
12. Applied — freeze step; baseline includes the candidates' target tasks and the ceiling and noise-floor rules from measure.md; pilots with predeclared keep-for-confirmation / revise / drop / inconclusive and a one-case advantage as inconclusive; confirmation on fresh material sized around a stated effect with paired uncertainty; leakage and owner-read vetoes with thresholds and tie handling (five pairs, majority/tie); environments reported apart; combined-survivor check; the two-drops shipping rule replaced by "retain only what confirmation and the combined check both pass".

## Open

- Primary papers were not fetched; every literature number is L1's, and L1's unverified list (Veinott 2010, several venues, Mitropoulos v4 full text, frontier sycophancy rates) carries through.
- E0210 carries provenance flags in `episodes.jsonl` (`DIALOG`, `no_match_0.9` on its draft quote); its summary supports the narrow-scope reading used in K2 and K4, the disputed draft context is unverified.
- CT1's absence claims (no T12 support, no wrong owner pushback) were not re-established across all 323 episodes here; I read the summaries of the thirteen episodes this draft leans on and C7 inspected the 54 CT1 cited.
- The harness adapter does not exist; no protocol in §5 has run, and nothing here is a measurement of a candidate.
- Whether `clarity:40` can carry K1's and K4's sentences and remain a pleasant read is untested; the baseline and the owner read decide, and K4 goes first if not.
- L1's reading that one or two falsifiers help and long lists do not is a human result (Sanna); its transfer to LLMs is untested (literature.md:32).
- 0.4.0 is assumed to be the release after the Unreleased block that ships `clarity` (SKILL.md metadata still 0.2.0); not checked with the owner.
- Line numbers are from the worktree `agent-skills-writing-replication` today; `main` may differ.
- Length: 3,087 whitespace tokens including markers (draft 1 was 2,795 by C7's count); the growth is the strata, harness prerequisite and predeclared outcomes; no budget was restated for draft 2.
