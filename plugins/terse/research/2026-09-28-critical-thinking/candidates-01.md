# Critical-thinking candidates for terse 0.4.0 — draft 1

## What this is

A first list of critical-thinking traits terse could give the agent's writing, each with a place, a wording, a boundary, its evidence and a test. Nothing ships from it. It rests on three inputs: the session in which Claude listed twelve traits and rated itself (`source/session-66f5dc64.md`; the owner did not react, so hypotheses only); `literature.md` (L1), the measured record on LLMs and people; and CT1's read of 323 owner feedback episodes, which gives each trait T1–T12 its support and counter-evidence by episode id. Each candidate names the page and line it would extend. `clarity` is still under Unreleased in the changelog; 0.4.0 is the release after it.

One design rule runs through every candidate: each is a named check with a visible result, never an adjective. The generic form — "be careful", "think critically", a persona — measured null or harmful (literature 8: GSM8K 91.5→88.0 and 62.0→43.5 under "review carefully"; a caution prompt n.s. in Schoenegger 2025), and terse's M23 shows what an instruction to be careful produced here: caveats, regressions 1, 0, 6, 5, 10. So no line says "think critically"; each says what to look at and what to write down when the look fails.

Where the owner's reactions and the literature disagree, the entry says so. Every "would help" below is a hypothesis until §5 runs.

## Candidates

### K1 — Name the observation that would overturn the conclusion, and say whether you looked

**Trait.** Knows what would change its mind (session sign 2; the owner's pick).

**Mechanism.** A reader acting on a conclusion needs its one weak point and whether it was tested; truth.md's "work to refute" stance stays in the writer's head today. Literature 1 is precise about where the gain is: models improved (42→56%) when they *ran* the opposite test, not when told to consider it — so the line asks for the observation and the look, not a paragraph of doubt.

**Where.** `clarity/SKILL.md`, After writing, a new item after lines 51–52 ("Does each factual or numerical claim say no more than the evidence supports…"). One clause in `genres/relayed-result.md:5`, extending "what remains uncertain". Links `truth.md:50–51`, unchanged.

**Draft wording (clarity).** "For a conclusion the reader will act on: which one observation would overturn it, and did I look for it? When I did not, or could not, say so beside the conclusion; a conclusion nothing could overturn is a guess."

**Draft wording (relayed-result).** "…what remains uncertain, including the observation that would overturn the conclusion when nobody looked for it…"

**Boundary.** Only a conclusion this reader acts on now; one observation, never a list (Sanna 2002: listing 10 alternatives backfired, 2 did not). Not in a text that introduces a thing, a commit title, a code comment or a defect list sent as observations. The owner rejected a speculative breaking-change warning (E0041), a risk not shown to be a problem (E0087) and telling README readers every limit (E0305); the test counts each as a regression.

**Evidence.** Literature: moderate in people (Lord 1984 [PR]: consider-the-opposite beat "be fair"), weak in LLMs as a written instruction (Schoenegger 2025 counterfactual prompt −0.004 n.s.), moderate as an executed test (Jhaveri 2026 [pre], mainly thinking-mode models). Owner: T2 "some" — E0016, E0052, E0181, E0297 support material weaknesses and what could not be checked; CT1 finds no episode asking for a falsifier on every conclusion. Plainly: K1 is the owner's pick and a people-result; the LLM evidence supports it only as a look, which is why the wording asks whether you looked.

**Overlap.** truth.md's verdicts and refutation stance (deep skills); clarity 51–52; relayed-result "what remains uncertain". K1 adds the overturning observation, named at the everyday conclusion.

**Test.** Planted errors: eight report or recommendation fixtures in the `cases.json` style, each holding a conclusion plus one observation that overturns it (a local speed-up with the CI run available; "no other consumer" with a second consumer greppable). Two blind arms per fixture — clarity as now, clarity with K1 — judged in a fresh context by another model: overturning observation named (y/n), looked for when the fixture allowed (y/n), risk sentences tied to no observation (count). Leakage: both held-out everyday sets run under K1, counting any new caution sentence. Drop if naming-and-looking does not exceed control across the eight, or leakage appears in two held-out cases, or the owner prefers control in a blind read of three pairs.

### K2 — On a disputed fact, recheck at the source and say what the recheck showed

**Trait.** Changes the answer on new evidence and only on it (session sign 8; Claude's own note that pressure makes it yield where it was right).

**Mechanism.** Under challenge the model flips without new data, the strongest measured failure in the literature, and a flip without a named reason teaches the reader nothing. The visible result is one clause: the observation that changed the answer, or that none did.

**Where.** `roles.md` §13, line 235, replacing "Recheck a disputed fact;". `clarity/SKILL.md:58` already routes a later objection there.

**Draft wording.** "When a point disputes a fact, go back to its source — the file, the command, the record — before the next version, and say what the recheck showed: the observation that changed the answer, or that none did and the answer stands. A challenge that brings no new observation is a reason to recheck, not to change."

**Boundary.** A point that states a preference, a decision or a scope is not a disputed fact: apply it (E0137: a reframing rejected, the plan to follow the work under discussion; E0210: a broad analysis missed the concrete question). A challenge carrying a real new observation is right to change the answer — Fanous 2025 found 43.5% of flips progressive; K2 must not make the model stubborn, and the test measures that side.

**Evidence.** Literature strong: Sharma 2024 [PR] (Claude 1.3 wrongly admitted mistakes on 98% of questions); Laban 2023 [pre] ("are you sure?" flipped 46%, −17% accuracy); Fanous 2025 [PR] (58% sycophantic, 14.7% regressive, citation-shaped rebuttals worst); Wei 2023 (scaling increases it). All 2023–2025 models; frontier rates unchecked. Owner: T8 "some" — E0194, E0207, E0228, E0256 update on concrete evidence, E0273 resists overcorrection; CT1 finds no case of the owner pushing back wrongly, so the owner side of K2 is unmeasured.

**Overlap.** §13 says recheck; it does not say what to write down. rules.md:69 covers the caveat failure, not the flip.

**Test.** Pushback probe: ten factual fixtures with a checkable correct first answer. Three pushes each, in separate sessions: bare "are you sure?"; a wrong rebuttal shaped as a citation; a right rebuttal carrying a new observation from the fixture. Arms: §13 as now versus with K2. Measures: regressive flips, progressive flips, and whether the reply names the recheck's observation. Drop if regressive flips are not fewer, or progressive flips are fewer, or the observation is named in under half of the replies.

### K3 — Take the expected answer out of a brief or review request

**Trait.** Does not hint the answer in the question (session item 6).

**Mechanism.** A brief that names its verdict, calls a change safe or assigns a cause pulls the receiving agent to it, and its reasoning rationalises without mentioning the pull. The visible result: the open question with its evidence standard.

**Where.** `genres/agent-brief.md:9`, extending "Do not bury the objective under background, imply permission to edit from a request to review, or ask for a conclusion without specifying its evidence." Reaches `clarity` case 9 (a review brief) and entrust's coordinator briefs through it.

**Draft wording.** "Before sending, find each place the brief already gives the answer it wants — a verdict named, a change called safe or done, a cause assigned — and turn it into the open question with its evidence standard. A hypothesis stays only labelled as one, beside what would refute it; a decision already made stays as a constraint."

**Boundary.** Questions to the owner keep options and a visible recommendation (E0106, E0107; rules.md:53, P16): K3 is for briefs to an agent or a reviewer. A decided scope is a constraint, not a hypothesis to reopen (E0137).

**Evidence.** Literature strong: Sharma 2024 (a suggested wrong answer −27%); Turpin 2023 [PR] (biased examples −36%, never mentioned in the reasoning); Zhou 2023 [PR] (certainty markers −7%); Mitropoulos 2026 [pre] (a change framed as bug-free cut vulnerability detection 16–93%; v4 partly reverses the template form, refined framing still 32 of 33). Owner: T11 "some" on one episode, E0190 (a clean agent to be briefed on what the coordinator had smuggled into its decomposition; outcome unclear). Plainly: the evidence is the literature's; the owner has asked once.

**Overlap.** agent-brief line 9 forbids a conclusion without an evidence standard, not the conclusion itself. Nothing else on the pages covers the leading brief.

**Test.** Held-out brief: six review tasks with a planted defect, unseen by the brief writer. The coordinator writes each brief under both arms; a blind reader counts leading sentences per brief. Then one fresh Claude and one Codex agent run each brief; measure planted-defect detection. Drop if K3 briefs are not less leading; detection across 6×2 is directional only and cannot drop the candidate alone.

### K4 — Check the premise the request rests on before answering it

**Trait.** Checks the question, not only the answer (session sign 5).

**Mechanism.** An answer to a request whose premise the evidence at hand contradicts is wasted, and the model answers inside the frame it is given. The visible result: "X does not hold, because Y; so the answer is Z", then the task.

**Where.** `clarity/SKILL.md`, Before writing, a fourth item after line 32, or a clause in item 2. Links `rules.md:13` ("a fact… the world has not established goes to the owner as a question"). The one candidate that adds a line to the light path; if the pleasant-read measure regresses, it goes first.

**Draft wording.** "What does the request take as given? When what I can see contradicts it, say which fact and where, then answer the task as it stands; when the premise holds, answer without restating it."

**Boundary.** Not a licence to reframe: the owner rejected a reframing that displaced the work under discussion (E0137) and a broad analysis that missed the concrete question (E0210). The check fires on a contradiction in evidence at hand, never on a preference.

**Evidence.** Owner strong: E0046 (a plan's premise that Codex did not load its config), E0132 (a review redirected from error-hunting to usefulness), E0211 (a brief that had substituted a proxy goal), E0313 (required README sections rejected as a rule for every text). Literature thin: Kim 2023 (QA)² [PR] measures that models fail on false-premise questions; Lou & Sun 2024 [pre] finds "ignore the hint" insufficient; no study measures a premise-check instruction. Plainly: K4 is carried by the owner's record, not by a measured intervention.

**Overlap.** rules.md:19 and clarity's Before-writing items ask who, what for and where, not whether the premise holds; truth.md sends an unestablished fact to the owner as a question, and K4 applies that to the request.

**Test.** Planted premises: eight requests whose premise the fixture contradicts, four whose premise holds, one with a decided scope (E0137 shape). Blind arms as in K1. Measures: false premise named with its evidence before the answer; no reframing on the controls. Drop if catches do not exceed control, or one reframing appears on a control, or the owner's blind read of three pairs prefers control.

## Rejected or deferred

- **T12, predict the result before running the check.** No supporting episode in 323 (CT1: "none"); a process step — see below.
- **Generic caution, "think critically", personas, "think step by step".** Literature 8: null or harmful; chain-of-thought helps mainly maths and can cost up to 36 points. rules.md:69 handles the caveat form. This is the document's design rule, not a candidate.
- **Premortem and risk lists (the list form of T2).** Literature 7 weak (Brier −0.008 n.s.; Veinott unverified); the owner rejects speculative risks (E0041, E0087, E0305). K1 keeps the one-observation form; the list is out.
- **T3, the strong version of every rejected view.** The owner wants real alternatives examined (E0090, E0322) and objects when detail displaces the useful part (E0195, E0270); rules.md:53 (P16) covers the real choice. Deferred; K1 carries the one-opposite form.
- **T4, confidence numbers and hedges.** Hedges do not track internal uncertainty (Yona 2024 [PR]); stated confidence stays overconfident (Xiong 2024 [PR]); the owner called caveats an anti-pattern (E0188). One preregistered study (Kim 2024 [PR], N=404) found first-person "I'm not sure" helped readers where impersonal hedges did not — a side count in K1's pairs, not a line. rules.md:69 and clarity 51–52 hold the honest-range form.
- **T1 provenance, T6 reports against their basis, T7 scope and confounders.** Strong or "some" with the owner, and already on the pages: clarity item 2 and lines 51–52 (E0297 is the "comparison named" line), truth.md levels and guarantee words, relayed-result:7, examples.md claim-strength. No new line; the 0.4 baseline measures whether these lines work.
- **Same-context self-review as a line.** Literature 3 strong against (75.8→38.1). Rejected.

## Process, not writing

- **A critic in a fresh context, other-model verifiers, varied refuters** (T9; literature 3 strong): entrust `orchestrate/SKILL.md:119–123`; terse's rewrite critics and the blind edit verifier (M24).
- **Another model with a different bias** (session item 7): entrust `codex`.
- **Prediction before the check** (T12): an orchestrate verify step if an episode ever supports it; nowhere now.
- **Push in both directions** (session item 5): K2's probe in the evals.
- **Effort rising with the cost of a wrong claim** (T10; E0052, E0100, E0267 against E0055, E0057): the harness's effort setting and orchestrate's caps.
- **Answer each check without the draft in view** (literature 2) and **sample several times and compare** (+12): rewrite's truth critics and the audit's pre-reader truth pass, `truth.md:7–8`.

## Test plan for 0.4

**Order.** (0) Baseline first: the fourteen `cases.json` prompts and both held-out sets under clarity as it is and under no skill, blind pairs judged in a fresh context; without it no candidate has a control, and the changelog says clarity's effect on the text is unmeasured. (1) K3 — cheapest, strongest evidence, one provisional page. (2) K2 — a mechanical probe. (3) K1 — the owner's pick and the highest leakage risk. (4) K4 — the only added line on the light path, last.

**Measures**, the same three for every candidate: the planted-target rate; leakage on the held-out everyday sets (new caution or risk sentences, words per point, the M23 caveat count); and the owner's blind read of three pairs, which decides the pleasant read (rules.md:9). The first is the reason to keep a candidate; the other two are vetoes.

**Agents.** Per candidate at most four writers at a time (Opus in `claude plugin eval`, Fable in the owner's environment, as the trigger runs were), one Codex Sol judge and one fresh Claude judge, disagreements to the owner; counts and models announced before each spawn.

**Stop rule.** One rewording per candidate; a candidate that fails its drop condition twice is dropped and recorded here with its numbers. If two of the four drop, 0.4 ships the survivors; no candidate is rescued by adding a step to the light path, and none ships on its target rate alone.

## Open

- The T1–T12 mapping to the session's signs is mine, inferred from CT1's verdict wording; I did not see the brief that defined T1–T12 for CT1. If, say, T6 was defined as "source and its interests" rather than "reports checked against their basis", the "Rejected or deferred" bullet for T6 changes.
- Episode contents are known only through CT1's paraphrases; I did not open `episodes.jsonl`, so the ids are cited as CT1 gave them and its "no clean case" claims (T8 wrong pushback, T12) are its findings, not mine.
- Every literature number is taken as L1 reported it; I opened none of the sources. L1's own unverified list (Veinott 2010, several venues, Mitropoulos v4 full text, frontier sycophancy rates) carries through.
- 0.4.0 is assumed to be the release after the current Unreleased block that ships `clarity` (SKILL.md metadata still says 0.2.0); the number the owner intends was not checked.
- "`clarity` case 9" refers to the ninth positive prompt in `evals/clarity-trigger.live.md`; its id in `cases.json` was not checked (E55 suggests `agent-chat-brief`).
- entrust's `experiment` skill was not read; the T12 pointer to orchestrate's verify step may belong there instead.
- Line numbers are from the worktree `agent-skills-writing-replication` as of today and may differ on `main`.
- Whether adding an After-writing or Before-writing item to `clarity` needs the trigger evals (H1/H3) re-run was not checked; they measure invocation, not content.
- Word count: 2,549 whitespace tokens including markdown markers; prose is under 2,500.
