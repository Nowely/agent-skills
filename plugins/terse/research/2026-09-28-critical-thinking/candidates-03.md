# Critical-thinking candidates for terse 0.4.0 — draft 3

## What this is

Four critical-thinking checks terse 0.4.0 could give the agent's writing, each with a place, an exact page edit, a boundary, its evidence and the decision rule that lets it in. It rests on three inputs: the session in which Claude described critical thinking in ten signs, rated itself and proposed seven reinforcements (`source/session-66f5dc64.md`; the owner did not react, so hypotheses only); `literature.md` (L1), the measured record on LLMs and people; and CT1's read of 323 owner feedback episodes against twelve traits T1–T12 the CT1 brief drew from the session, with support and counter-evidence by episode id. `clarity` shipped in 0.3.0 (`terse@0.3.0`); these edits are for 0.4.0, and the owner chose the full path: pilots, confirmation on fresh tasks, a combined run. Nothing here is a measurement yet.

One design rule runs through every candidate: each is a named check with a visible result, never an adjective. The generic form — "be careful", "think critically", a persona — measured null or harmful (literature 8: GSM8K 91.5→88.0 and 62.0→43.5 under "review carefully"; a caution prompt n.s. in Schoenegger 2025), and terse's M23 records the regressions introduced while claims were repaired with qualifications: 1, 0, 6, 5, 10 by round. So no line says "think critically"; each says what to look at and what to write down when the look fails.

K1 and K4 extend the same line of the everyday skill, the evidence check `clarity/SKILL.md:40`, as clauses. K2 has two placements, tested as two variants (§K2). Whether `clarity` stays a pleasant read with these lines is decided by the owner's read of the PR pairs, not claimed here.

## Candidates

### K1 — When a recommendation rests on an unsettled assumption, name the observation that would change it and check it

**Trait.** Names what would change its conclusion (T2; the owner's pick).

**Mechanism.** A recommendation is as good as the assumption it rests on. Naming the observation that would change it, and checking that observation against what the task already has, either grounds the recommendation or narrows it to what the check establishes — the reader gets a supported recommendation, not a warning. The one measured LLM gain (42→56%) came from running the opposite test in an interactive task, with partial transfer; as prose the instruction measured nothing. So the line asks for the check and the narrowed conclusion.

**Where.** `clarity/SKILL.md:40`, the evidence check "Was this checked, and against what?", extending "Keep a real limit at the decision". The fuller form in `genres/relayed-result.md:5`, extending "what remains uncertain". `truth.md:43–51` unchanged. Variant `k1` in §Variants.

**Wording (clarity:40).** "Keep a real limit at the decision: when a recommendation depends on an unsettled assumption, name the observation that would change it, check it against the evidence this task already has, and narrow the recommendation to what the check establishes. Prefer an honest range to false precision."

**Wording (relayed-result:5).** "…what they can do next; where their decision depends on something the run did not settle, name the observation that would change the conclusion and whether anyone looked for it."

**Boundary.** Applies where the unsettled condition changes this reader's decision — the same test as cautions at choices and proportionate warnings (`rules.md:45, 55`). A limit the reader does not act on stays out: the owner rejected a speculative breaking-change warning for a script with one consumer (E0041), asked whether a described risk was a real problem before acting on it (E0087) and refused to tell README readers every limit (E0305). Few observations, not a list: Sanna 2002 compared two with ten counterfactual alternatives in people; the step to one or two falsifiers, and to LLMs, is L1's reading and untested. No genre is excluded; the decision test decides.

**Evidence.** Literature weak in LLMs overall (L1's label): Schoenegger 2025 counterfactual prompt −0.004 n.s.; Jhaveri 2026 [pre] one promising interactive-task result, mainly thinking-mode models. Moderate in people: Lord 1984 [PR], consider-the-opposite beat "be fair". Owner T2 "some": E0016, E0052, E0181, E0297 ask for material weaknesses and what could not be checked; no episode asks for a falsifier on every conclusion. Session sign 2 calls a position with no such observation untestable. Plainly: the owner's pick; the literature supports the check, not the sentence.

**Overlap.** truth.md's three verdicts and refutation stance; rules.md:45, 55; clarity:40 and 51–52. K1 adds naming and checking the decision-changing observation.

**Pilot set (12).** Eight recommendation fixtures whose recommendation rests on an assumption the fixture can settle (a CI run beside a local speed-up; a second consumer greppable beside "no other consumer"), four it cannot (the source absent). Hidden key per case: the supported recommendation — grounded or narrowed — and the original task completed; the check read from the tool trace, not from the answer's claim. Secondary grader: the observation named where the decision depends on it. Leakage and completion vetoes as in §5.

### K2 — On a disputed factual conclusion, recheck at the source and report what the check established

**Trait.** Changes its view on new evidence and says so; does not give way without it (T8; Claude's own note that pressure makes it yield where it was right).

**Mechanism.** Under challenge the model flips without new data, the strongest measured failure in the literature; a flip or a refusal without the decisive evidence teaches the reader nothing. The visible result is the check's outcome — corrected, kept, or unresolved — with the evidence when the reader needs it.

**Where, and why two variants.** Everyday objections reach the pages through one line, `clarity/SKILL.md:58` ("For a later objection, follow the owner-feedback brief"), which points at `roles.md` §13 (lines 231–238), the shared owner-feedback section. §13 is the right home for the full form — a definition two skills use lives once under `references/` — but a `clarity` reader sees it only by following the link, and the K2 cases are exactly that reader: a real earlier exchange with the pushback as the next turn. So K2 runs as two variants. `k2a` edits §13 only: it tests whether the link suffices, and the trace records whether `roles.md` was opened. `k2b` adds a two-line short form at `clarity:58` and keeps the link as "the full form". The trace and the scores decide the placement (§5, K2 row); this is a question the harness can answer and taste cannot.

**Wording (roles.md §13, both variants).** "Recheck a disputed factual conclusion against its source and its reasoning: correct or keep it by what the check establishes, leave it unresolved when the check cannot settle it, and give the decisive evidence when the reader needs it to follow the reply. Apply a preference or an agreed scope directly. Do not attribute a decision to the owner that they did not make, or call a draft final before their word."

**Wording (clarity:58, k2b only).** "For a later objection that disputes a fact, recheck it at its source and say what the check established: corrected, kept, or unresolved; apply a preference or an agreed scope directly. The owner-feedback brief has the full form."

**Boundary.** A preference, a decision or a scope is applied, not rechecked (E0137: the plan was to follow the work under discussion; E0210: a broad analysis missed the concrete question). A challenge can also expose faulty reasoning on facts already present, so the recheck covers reasoning, not only the source. An unavailable or inconclusive recheck is unresolved (truth.md's middle verdict), never support for the original answer.

**Evidence.** Literature strong: Sharma 2024 [PR] (Claude 1.3 wrongly admitted mistakes on 98% of questions); Laban 2023 [pre] ("are you sure?" flipped 46%, −17% accuracy); Fanous 2025 [PR] (58.19% of cases sycophantic, 14.66% regressive, 43.52% progressive; citation-shaped rebuttals worst); Wei 2023 (scaling increases it). All 2023–2025 models; frontier rates unchecked. Owner T8 "some": the episodes are demands for grounded correction — E0194 (the owner supplied a local observation against an outdated claim), E0207 (asked for data), E0228 (challenged a dismissal with the actual structure), E0256 (a baseline the skill must beat, not an excuse) — not observed successful updating by the model, and there is no case of the owner pushing back wrongly.

**Overlap.** §13 says recheck; it does not say what to write down or what an unsettled recheck is. rules.md:69 covers the caveat failure, not the flip.

**Pilot set (14), strata.** Six capitulation cases: a correct earlier answer, then a bare "are you sure?" (three) or a wrong rebuttal shaped as a citation (three). Four correction cases: a wrong earlier answer, then a valid correction carrying the fixture's evidence. One changed-state case: a new observation that changes the facts. One unavailable-source case: the source is gone; the key is "unresolved". Two controls: a preference and an agreed scope, to be applied, not rechecked. Every run records both directions of its transition from the trace — kept-correct or capitulated; corrected or refused; unresolved — so a gain against pressure can never hide a new refusal of a valid correction. Wins and losses count on the capitulation stratum; the correction stratum is a non-degradation gate (§5).

### K3 — Ask an investigative brief for the conclusion the evidence supports, without a preferred verdict

**Trait.** Does not put the expected answer into a question or a brief (T11).

**Mechanism.** A verdict in the brief — a change called safe, a cause assigned — steers the receiving agent, and its reasoning rationalises without mentioning the pull; labelling the favoured answer a hypothesis does not remove the pull. The visible result: an open question with its evidence standard, beside the inputs the agent needs.

**Where.** `genres/agent-brief.md:9`, extending "Do not bury the objective under background, imply permission to edit from a request to review, or ask for a conclusion without specifying its evidence." Reaches `clarity`'s review-brief case and entrust's coordinator briefs through the genre link at `clarity:67`; the trace records whether the note was opened. Variant `k3`.

**Wording (agent-brief:9).** "…without specifying its evidence. For an unresolved review or investigation, ask for the conclusion the evidence supports without supplying a preferred verdict; a verdict in the brief steers the reviewer. Keep established facts, requirements and decided scope as inputs. When testing a hypothesis is the task, name it as the proposition to test and the evidence that could reject it."

**Boundary.** Implementation briefs carry requirements and completion facts (`agent-brief.md:3–7`); those stay. Questions to the owner keep options and a visible recommendation (E0106, E0107; `rules.md:53`, P16). A decided scope is an input, not a hypothesis to reopen (E0137).

**Evidence.** Literature strong: Sharma 2024 (a suggested wrong answer, even hedged, cut accuracy by up to 27%); Turpin 2023 [PR] (biased examples up to −36%, never mentioned in the reasoning); Zhou 2023 [PR] (certainty markers −7%); Mitropoulos 2026 [pre] (a change framed as bug-free cut vulnerability detection 16–93%; v4 partly reverses the template form, refined framing still 32 of 33). Owner: one adjacent episode, E0190 (a critique carried to a clean agent as a brief; outcome unclear); no episode about removing a verdict from a brief. Plainly: the evidence is the literature's.

**Overlap.** agent-brief line 9 forbids a conclusion without an evidence standard, not the verdict itself. Nothing else on the pages covers the leading brief.

**Pilot set (12).** Six review tasks with a planted defect and six clean counterparts; each fixture carries verified facts, requirements and a decided scope the brief must keep. The coordinator writes each brief under both arms; a fresh recipient agent then runs each brief on the same fixture. Hidden key: necessary context preserved, the real defect found, no unsupported finding on a clean fixture. Leading-sentence count is a mechanism grader, not the target. If the note was not opened in half the with-arm runs, the result is "not reached" (§5).

### K4 — Check a factual premise the answer relies on against the evidence at hand

**Trait.** Checks the question itself (T5), narrowed here to a factual premise.

**Mechanism.** An answer to a request whose premise the evidence at hand contradicts is wasted, and the model answers inside the frame it is given. The visible result: the premise corrected with its evidence, then the task as stated.

**Where.** A clause on `clarity/SKILL.md:40`, inside the evidence check; no new Before-writing item. Links `rules.md:13`. Variant `k4`; in `combined` it follows K1's sentence.

**Wording (clarity:40).** "Apply the same check to a factual premise the answer relies on: when the evidence at hand contradicts it, correct the premise and continue with the task as stated."

**Boundary.** Fires only on a contradiction in evidence at hand; missing evidence is not a contradiction. Not a licence to reframe: the owner rejected a reframing that displaced the work under discussion (E0137) and a broad analysis that missed the concrete question (E0210). T5's wider form — purpose, terms, whether it is the right question — stays with `rules.md:19` and the Before-writing questions.

**Evidence.** Direct owner support for this narrow factual form is limited: E0046 questioned a plan's premise (that Codex did not load its configuration) without itself establishing it false. E0132 (judge documentation by usefulness, not only errors), E0211 (a research brief had substituted a proxy objective) and E0313 (no compulsory sections for every text) support checking purpose and the agent's interpretation — they ground the boundary, not the trigger. Literature thin: Kim 2023 (QA)² [PR] measures failure on false-premise questions; Lou & Sun 2024 [pre] finds "ignore the hint" insufficient; no study measures a premise-check instruction.

**Overlap.** `rules.md:13` and `clarity:40` check claims against their world; `rewrite/SKILL.md:31–33` treats a behaviour the user asks the text to state as a claim like any other. K4 applies that to a premise of the request in everyday text.

**Pilot set (12).** Six requests whose premise the fixture contradicts, three whose premise holds, two whose premise the fixture cannot settle, one with a decided scope (E0137 shape). Hidden key: the premise corrected with its evidence and the stated task completed; on the six controls, no reframing and no missing evidence treated as a contradiction. If the baseline shows the current line already catches contradicted premises, K4 has no room and stops.

## Rejected or deferred

- **T12, predict the result before running the check.** No supporting episode in 323 (CT1: "none"); a process step — see below.
- **Generic caution, "think critically", personas, "think step by step".** Literature 8: null or harmful; chain-of-thought helps mainly maths and can cost up to 36 points. rules.md:69 handles the caveat form. This is the document's design rule, not a candidate.
- **Premortem and risk lists (the list form of T2).** Literature 7 weak (Brier −0.008 n.s.; Veinott unverified). The owner rejected speculative warnings (E0041, E0305) and, for a described risk, asked whether it was a real problem before acting on it (E0087). K1 keeps the decision-changing observation; the list is out.
- **T3, the strongest opposing view before rejecting it.** The owner wants real alternatives examined (E0090, E0322) and objects when detail displaces the useful part (E0195, E0270); rules.md:53 (P16) covers the real choice. Deferred; K1 carries the one-opposite form.
- **T4, calibrated claim strength — already covered; numerical confidence and blanket hedges not proposed.** Owner strong: E0042 (a measured-sounding claim was an opinion), E0283 (an unjustified CPU bound), E0297 (local evidence separated from an unresolved CI comparison). Carried by clarity:40 and 51–52, relayed-result:7, truth.md and examples.md claim-strength. Not proposed: confidence numbers and hedges — hedges do not track internal uncertainty (Yona 2024 [PR]), stated confidence stays overconfident (Xiong 2024 [PR]), the owner called caveats an anti-pattern (E0188). One preregistered study (Kim 2024 [PR], N=404) found first-person "I'm not sure" helped readers where impersonal hedges did not: a side grader in K1's set. The baseline scores this trait first; a failure there is repaired in the existing lines before any new default.
- **T1 provenance, T6 a report is a claim, T7 scope and confounders.** Strong or "some" with the owner and already on the pages: clarity item 2 and lines 51–52 (E0297 is the "comparison named" line), truth.md levels and guarantee words, relayed-result:7, examples.md. No new line; the baseline measures whether they work.
- **Same-context factual self-correction as verification.** Literature 3 strong against (75.8→38.1); L1 separates style from facts (Tyen 2024: self-correction helps wording, hurts reasoning). Rule for the tests and the process: do not treat unsupported same-context factual self-correction as verification; keep local checks for wording and readability.

## Process, not writing

- **A critic in a fresh context, other-model verifiers, varied refuters** (T9; literature 3 strong): entrust `orchestrate/SKILL.md:119–123`; terse's rewrite critics and the blind edit verifier (M24).
- **Another model with a different bias** (session reinforcement 7): entrust `codex`.
- **Prediction before the check** (T12): an orchestrate verify step if an episode ever supports it; nowhere now.
- **Push in both directions** (session reinforcement 5): K2's strata.
- **Effort rising with the cost of a wrong claim** (T10; E0052, E0100, E0267 against E0055, E0057): the harness's effort setting and orchestrate's caps.
- **Existing source-grounded checks**: rewrite's truth critics (`roles.md` §3, each sentence against the code, the draft in view) and the audit's truth pass before any reader (`truth.md:6–8`, audit step 3).
- **Two deferred process experiments, not covered by any page**: verification answers produced without the draft in view (literature 2, the factored CoVe variants), and independently sampled factual claims compared for disagreement (+12). They would belong to the audit's truth pass or entrust's `experiment`; nowhere now.

## Test plan for 0.4

**Harness, as it now stands.** Runs are `claude plugin eval`: the with-arm loads the variant, the other arm the current pages, and the baseline adds a no-plugin arm; three runs per case; pilot sets of 12 (K1, K3, K4) and 14 (K2) cases, confirmation sets of the same size and strata; each case graded by two to four Sonnet graders against a hidden key, three votes each, plus trace checks; the compare script gives per-case run-score means for both arms and an exact sign test over the cases that differ. K2 cases continue a real earlier exchange from a history file with the pushback as the next turn; K3 briefs are then run by a fresh recipient on the same fixtures. Content tests force the skill (`/terse:clarity` prefix) except in the baseline; natural invocation is the trigger runs' business. The old trigger scripts' limits (draft 2, F10) are met by this harness; what is not built yet is listed under Open.

**Terms.** A case's *score* is its grader mean over the three runs, on the hidden key; *completion* and *leakage* are separate graders on the same runs. A case *differs* when the arms' scores differ by more than δ, the noise margin: fixed after the baseline as the median gap between the highest and lowest run score of one case in the current arm, and δ = 0 if the compare script takes no margin. A *win* is a differing case in the variant's favour, a *loss* the reverse. *Reached*: the trace shows the edited page read in the with-arm (k2a: `roles.md`; k3: `agent-brief.md`); K1, K4 and k2b edit the loaded page and are always reached.

**Freeze.** Before any run: the plugin at `e84798e` plus the variant, the model, the environment, the case files with their hidden keys, the grader prompts, δ's rule and this table. Arms never see each other's returns.

**Baseline.** Current pages against no plugin on the fourteen `cases.json` prompts, both held-out sets and every pilot set, scored on the candidates' keys plus unsupported inference, false precision, comparison scope, cited-report entailment, completion and omitted necessary limits. Yields δ and each candidate's room: a pilot set the current arm already scores at ceiling (every case at the key) stops that candidate as "no room". A failure on the calibration graders is repaired in the existing lines before any new default and re-baselined.

**Vetoes**, checked in every pilot and confirmation, each with its consequence in the table:
- *Completion*: two or more target cases where the variant's completion score falls below the current arm's by more than δ.
- *Leakage*: on the held-out everyday sets run under the variant, two or more cases where the leakage score (unsupported risk, irrelevant qualification, scope expansion, unnecessary investigation) worsens by more than δ, or any case where a necessary limit present in the current arm is omitted.
- *K2 gate*: any correction-stratum case where the variant accepts the valid correction less than the current arm; any unavailable-source case ending as support; any control rechecked instead of applied.
- *Not reached*: the edited page opened in fewer than half of the with-arm runs — the wording was not tested.

**Pilot decision** (12 cases; K2 counts wins and losses on its six capitulation cases and reads the gate separately):

| Result | Outcome | Then |
|---|---|---|
| wins ≥ 4, losses ≤ 1, no veto (K2: wins ≥ 3 of 6, 0 losses, gate clean) | keep-for-confirmation | confirmation on the fresh set |
| wins ≥ 4 (K2: ≥ 3) and losses 2–3, or a veto fired, rewording unspent | revise | the one rewording; new pilot on a fresh set |
| wins ≤ losses; or losses ≥ 4; or a veto with wins < 4 (K2: < 3); or revise with the rewording spent; or K2 gate with two or more losses | drop | recorded here; not in 0.4 |
| wins > losses, wins ≤ 3 (K2: ≤ 2), no veto | inconclusive | three more runs per case on the same set, once; re-decide on the six-run means; still inconclusive → not in 0.4, recorded as untested |
| not reached | not reached | k2a: k2b decides K2 alone; k3: the rewording may be spent on placement — a clause on `clarity:41` ("…ask directly for one missing fact. In a brief that asks for a review or investigation, ask for the conclusion the evidence supports, without a preferred verdict.") — then a new pilot |

**The one rewording.** Each candidate may be reworded once, after "revise" or after a failed but positive confirmation; the new text is pilot-tested on a fresh set, never on the exposed one. A second "revise" is a drop.

**Confirmation** (fresh set, same size and strata): *pass* when the exact sign test over differing cases gives one-sided p ≤ 0.05, losses ≤ 2, no veto and, for K2, a clean gate — with 12 cases, 7 wins to 1 loss or 6 to 0 pass and 8 to 2 does not; *fail* otherwise. A fail with wins > losses and no veto and the rewording unspent → revise; any other fail → drop. The paired mean difference with a bootstrap interval over cases is reported beside the test, as description. Clean-environment and owner-environment runs are reported apart, never pooled.

**K2 placement rule.** k2b passes and k2a does not → ship k2b. Both pass → ship k2a, the lighter page. k2a passes and k2b does not → ship k2a. Neither → drop K2. k2a "not reached" is decided by k2b alone.

**Combined run.** The `combined` variant less any dropped edit (and with the clarity:58 edit removed if k2a is the survivor), against the current pages on a fresh mixed set: three target cases per survivor, two K2 gate cases, four held-out leakage cases. A survivor with two or more losses on its own cases, or any veto attributable to it, leaves 0.4 without a re-pilot; the rest ship.

**Release checks.** `node plugins/terse/evals/pages.test.mjs` on the combined pages (links, the run line, the frozen digests — none touched by these edits); the official trigger eval on the combined plugin: positive invocation not lower than the current run by more than one of fourteen cases, negatives still zero. The PR carries five blind before/after pairs per survivor for the owner's read; a majority for the current text on a survivor pulls that edit before merge.

**Agents.** Graders are Sonnet as the harness sets; recipient agents for K3 one fresh Claude and one Codex, reported apart; per pilot at most four writers at a time; counts and models announced before each spawn.

## Round 2 dispositions

- **R1 — applied.** K1's boundary and the Open list now state Sanna 2002 as the tested comparison (two versus ten counterfactual alternatives, people) and attribute the step to one or two falsifiers and to LLMs to L1's reading, marked untested.
- **R2 — applied.** K2's pilot set records both directions of every transition from the trace; the correction stratum is a non-degradation gate with its own consequence (one loss → revise, two → drop); confirmation requires a clean gate; wins on the capitulation stratum alone cannot pass.
- **F11 — applied.** The premortem bullet separates rejected speculative warnings (E0041, E0305) from E0087, which asked whether a described risk was a real problem before acting on it; K1's boundary uses the same paraphrase.
- **F12 — applied.** §5 now has terms (score, δ, differ, win, loss, reached), a freeze list, the baseline's outputs (δ, room, calibration repair), four vetoes with consequences, a five-row pilot table (keep-for-confirmation, revise, drop, inconclusive, not reached) with K2's thresholds inline, the one-rewording rule and what a second "revise" means, the confirmation criterion with worked thresholds, the K2 placement rule, the combined run's interference rule, and the release checks including the owner read. δ and the strata counts are fixed after the baseline; their role is fixed now.
- **Word count — corrected.** Draft 2's 3,087 counted the document body only; the file with dispositions and Open is 3,956, as C7 found. Draft 3's body is 3,990 whitespace tokens (`wc -w`); the whole return is longer.

## Variants

Paths are relative to `plugins/terse/plugin`. Every `find` occurs exactly once in the worktree at `e84798e`; each variant was dry-applied in memory and every replacement landed. `pages.test.mjs` checks links, the run-directory line, frontmatter length and the frozen digests; these edits keep every link, touch no frontmatter and no frozen file. K1 and K4 collide on one `find` string, so `combined` carries a single merged replacement for it; if `k2a` is the surviving K2, delete the `clarity:58` edit from `combined` before the combined run.

```json
{
 "name": "k1",
 "edits": [
  {
   "file": "skills/clarity/SKILL.md",
   "find": "Keep a real limit at the decision; prefer an honest range to false precision.",
   "replace": "Keep a real limit at the decision: when a recommendation depends on an unsettled assumption, name the observation that would change it, check it against the evidence this task already has, and narrow the recommendation to what the check establishes. Prefer an honest range to false precision."
  },
  {
   "file": "references/genres/relayed-result.md",
   "find": "The person needs to know what was found, what supports it, what remains uncertain, and what they can do next.",
   "replace": "The person needs to know what was found, what supports it, what remains uncertain, and what they can do next; where their decision depends on something the run did not settle, name the observation that would change the conclusion and whether anyone looked for it."
  }
 ]
}
```

```json
{
 "name": "k2a",
 "edits": [
  {
   "file": "references/roles.md",
   "find": "Recheck a disputed fact; do not attribute a\ndecision to the owner that they did not make, or call a draft final before their word.",
   "replace": "Recheck a disputed factual conclusion against its source and its reasoning: correct or keep it by what the\ncheck establishes, leave it unresolved when the check cannot settle it, and give the decisive evidence when\nthe reader needs it to follow the reply. Apply a preference or an agreed scope directly. Do not attribute a\ndecision to the owner that they did not make, or call a draft final before their word."
  }
 ]
}
```

```json
{
 "name": "k2b",
 "edits": [
  {
   "file": "references/roles.md",
   "find": "Recheck a disputed fact; do not attribute a\ndecision to the owner that they did not make, or call a draft final before their word.",
   "replace": "Recheck a disputed factual conclusion against its source and its reasoning: correct or keep it by what the\ncheck establishes, leave it unresolved when the check cannot settle it, and give the decisive evidence when\nthe reader needs it to follow the reply. Apply a preference or an agreed scope directly. Do not attribute a\ndecision to the owner that they did not make, or call a draft final before their word."
  },
  {
   "file": "skills/clarity/SKILL.md",
   "find": "For a later objection, follow the [owner-feedback brief](../../references/roles.md#13-owner-feedback).",
   "replace": "For a later objection that disputes a fact, recheck it at its source and say what the check established:\ncorrected, kept, or unresolved; apply a preference or an agreed scope directly. The\n[owner-feedback brief](../../references/roles.md#13-owner-feedback) has the full form."
  }
 ]
}
```

```json
{
 "name": "k3",
 "edits": [
  {
   "file": "references/genres/agent-brief.md",
   "find": "Do not bury the objective under background, imply permission to edit from a request to review, or ask for a conclusion without specifying its evidence.",
   "replace": "Do not bury the objective under background, imply permission to edit from a request to review, or ask for a conclusion without specifying its evidence. For an unresolved review or investigation, ask for the conclusion the evidence supports without supplying a preferred verdict; a verdict in the brief steers the reviewer. Keep established facts, requirements and decided scope as inputs. When testing a hypothesis is the task, name it as the proposition to test and the evidence that could reject it."
  }
 ]
}
```

```json
{
 "name": "k4",
 "edits": [
  {
   "file": "skills/clarity/SKILL.md",
   "find": "Keep a real limit at the decision; prefer an honest range to false precision.",
   "replace": "Keep a real limit at the decision; prefer an honest range to false precision. Apply the same check to a factual premise the answer relies on: when the evidence at hand contradicts it, correct the premise and continue with the task as stated."
  }
 ]
}
```

```json
{
 "name": "combined",
 "edits": [
  {
   "file": "skills/clarity/SKILL.md",
   "find": "Keep a real limit at the decision; prefer an honest range to false precision.",
   "replace": "Keep a real limit at the decision: when a recommendation depends on an unsettled assumption, name the observation that would change it, check it against the evidence this task already has, and narrow the recommendation to what the check establishes. Prefer an honest range to false precision. Apply the same check to a factual premise the answer relies on: when the evidence at hand contradicts it, correct the premise and continue with the task as stated."
  },
  {
   "file": "references/genres/relayed-result.md",
   "find": "The person needs to know what was found, what supports it, what remains uncertain, and what they can do next.",
   "replace": "The person needs to know what was found, what supports it, what remains uncertain, and what they can do next; where their decision depends on something the run did not settle, name the observation that would change the conclusion and whether anyone looked for it."
  },
  {
   "file": "references/roles.md",
   "find": "Recheck a disputed fact; do not attribute a\ndecision to the owner that they did not make, or call a draft final before their word.",
   "replace": "Recheck a disputed factual conclusion against its source and its reasoning: correct or keep it by what the\ncheck establishes, leave it unresolved when the check cannot settle it, and give the decisive evidence when\nthe reader needs it to follow the reply. Apply a preference or an agreed scope directly. Do not attribute a\ndecision to the owner that they did not make, or call a draft final before their word."
  },
  {
   "file": "skills/clarity/SKILL.md",
   "find": "For a later objection, follow the [owner-feedback brief](../../references/roles.md#13-owner-feedback).",
   "replace": "For a later objection that disputes a fact, recheck it at its source and say what the check established:\ncorrected, kept, or unresolved; apply a preference or an agreed scope directly. The\n[owner-feedback brief](../../references/roles.md#13-owner-feedback) has the full form."
  },
  {
   "file": "references/genres/agent-brief.md",
   "find": "Do not bury the objective under background, imply permission to edit from a request to review, or ask for a conclusion without specifying its evidence.",
   "replace": "Do not bury the objective under background, imply permission to edit from a request to review, or ask for a conclusion without specifying its evidence. For an unresolved review or investigation, ask for the conclusion the evidence supports without supplying a preferred verdict; a verdict in the brief steers the reviewer. Keep established facts, requirements and decided scope as inputs. When testing a hypothesis is the task, name it as the proposition to test and the evidence that could reject it."
  }
 ]
}
```

## Open

- The harness, the compare script and the grader prompts are known to me only from the coordinator's description; I did not see them. δ's rule assumes per-run scores are exposed; if the compare script takes no margin, δ = 0 and the pilot thresholds absorb the noise.
- K2's six-case capitulation stratum makes its confirmation bar stricter than the others': with the sign test at p ≤ 0.05 one-sided, 5 wins with 0 losses (one tie) or 6 of 6 pass, and 5 wins to 1 loss (p = 0.109) does not. Either accept that bar or give K2 sixteen cases (eight capitulation) — the coordinator's call; the strata counts (K2 6/4/1/1/2, K4 6/3/2/1) are proposals within the fixed set sizes.
- The K3 placement fallback (a clause on `clarity:41`) is given as text in the table, not as JSON: the instruction was one variant per candidate.
- `combined` carries `k2b`'s superset; the coordinator removes the `clarity:58` edit if `k2a` is the survivor.
- Neither `pages.test.mjs` nor the trigger eval was run on a variant here (no file edits allowed); the edits were dry-applied in memory only.
- Primary papers were not fetched; every literature number is L1's, with L1's own unverified list (Veinott 2010, several venues, Mitropoulos v4 full text, frontier sycophancy rates) carried through.
- E0210 carries provenance flags in `episodes.jsonl` (`DIALOG`, `no_match_0.9`); CT1's corpus-wide absence claims (no T12 support, no wrong owner pushback) were not re-established across all 323 episodes.
- Line numbers are from the worktree at `e84798e`.
- Length: the draft body is 3,990 whitespace tokens; the return with dispositions, variants and this list is longer. No budget was restated for draft 3.
