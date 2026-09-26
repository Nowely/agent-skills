# Codex Astra P1 — survey merge and target map

Completed against commit `8c041b76d7f30196441285d77985b81ae9c9e59f` (`8c041b7`). The repository was read only; all extracted snapshots, checks and this report live under `$TMPDIR`. No network fetch, survey fan-out, model experiment or application test was performed by P1. I used the three supplied surveys as inputs, reopening saved source text for quotations, conditions and tensions. The OpenAI Docs skill was read; the task’s saved-source/no-web-search instructions controlled the workflow.

Declared bias: I am the model named in the OpenAI post. All verdicts concern target text. C11, C14 and C16 explicitly identify support consisting only of a vendor description/recommendation of Astra. I do not use my own compliance in this turn as evidence for those claims.

**173 rows in (S1 59, S2 46, S3 68) → 85 claims out → 255 target verdicts. 173/173 rows placed; 0 unplaced; 0 source quotes unresolved.** S2’s 46 real IDs are sparse through S2-59; missing numeric IDs are not invented. Compound rows contribute to multiple claims: S1-21 (brevity/scope), S1-29 (ordered workflow/brief/output), S1-45 (role/tests/tool examples/Markdown), S1-46 (role/tool action), S1-51 (persistence/preambles/tracking). There are 182 row-to-claim memberships, not 182 source rows. Descriptive rows are retained as premises of their practice, not counted as independent experimental support.

| Target | present | partial | conditional | not located | unknown | contradicts | Total |
|---|---:|---:|---:|---:|---:|---:|---:|
| A | 8 | 20 | 3 | 2 | 51 | 1 | 85 |
| B | 21 | 21 | 32 | 4 | 6 | 1 | 85 |
| C | 16 | 21 | 27 | 9 | 12 | 0 | 85 |

`present` includes a harm claim whose target already avoids the harm. `partial` includes another mechanism addressing only part of the failure. `conditional` preserves a different applicability condition; as requested it also gates every single-model claim for B/C, even when the note describes what is present or absent within that model condition. `not located` means a relevant counterpart was not found in the complete scoped text. `unknown` means the target has no reason to carry that mechanism. An absence cannot be proved by one line: the cited scope/nearest line anchors the decision, and all scoped text was read. `contradicts` is reserved for incompatible instructions under shared conditions.

For A I used writing-rules.md, curse-of-knowledge.md, and stages.md’s content rules (with their stated owner-specific limit), not its fan-out workflow as a substitute for a content rule. For B I judged how the three skill documents execute/instantiate a practice; a link alone does not establish the unread reference’s contents. For C I used only codex Header fields / Prompt shape / What the user reads and orchestrate Verification / The agent’s return; absence here is not a claim of absence from all of entrust.

Aliases below resolve to pinned snapshots, not the dirty working copy:

| Alias | Target | Repository file |
|---|---|---|
| W | A | `plugins/terse/skills/rewrite/references/writing-rules.md` |
| K | A | `plugins/terse/skills/rewrite/references/curse-of-knowledge.md` |
| S | A | `plugins/terse/skills/rethink/references/stages.md` |
| A | B | `plugins/terse/skills/audit/SKILL.md` |
| T | B | `plugins/terse/skills/rethink/SKILL.md` |
| R | B | `plugins/terse/skills/rewrite/SKILL.md` |
| D | C | `plugins/entrust/skills/codex/SKILL.md` |
| O | C | `plugins/entrust/skills/orchestrate/SKILL.md` |
| P | record | `plugins/terse/README.md` |
| I | record | `research/README.md` |

Every target/record citation links to an exact quoted `sed -n` extraction in the citation ledger. Source quotations and grep results are in the row ledger. Typographic normalization is disclosed rather than called verbatim matching.

## The record read before ranking

[P:64](#quote-record) “One run, on 2026-09-10, on one README in one repository. Read the size of it before the numbers:  - The four-pass chain took six reader questions from three right answers to six, took readers leaving   the documentation from one to zero, and broke neither control question. **Six questions, one trial   each.** Three improvements and no reversals over six paired items gives an exact two-sided McNemar   *p* = 0.25, so this result is not distinguishable from chance. It is a pilot, not a rate. - Two of the six failures were lies rather than findability. A reader repeated two guarantees from   `README.md:5-9` that the code does not make. A structural rewrite would have carried both forward in   better prose. - A reader's own sense of clarity ran against the truth. Two who reported no confusion answered wrong;   the one who called a section scattered and confusing answered right. Neither skill asks a reader   whether the text was clear. - Five published writing standards were put against two unguided controls across ten agents, models   hidden from the judges. Both controls beat both entries of both standards. On the first 116 words,   seven of ten agents proposed nothing and the only agent that shortened the passage was a control. **Ten   agents, one run, one passage** — one observation per cell, not a rate.”

[P:81](#quote-limits) “Not measured: which of the four passes produced the gain, and whether a bake-off beats one careful pass. Also not measured, and worth knowing before you trust any of the above: there was no arm that ran the same questions with no document at all, so none of this separates what the text taught a reader from what the reader already knew. Two published benchmarks that did run that arm found it large. The reference files say so where it matters, and [references/prior-art.md](references/prior-art.md) collects every finding against these numbers.”

[I:10](#quote-humanlimit) “\| [2026-09-11-terse-survey](2026-09-11-terse-survey/) \| what does the field already know? \| three rounds, 37 agents, 108 ranked practices; the plugin's own numbers measure model answerability, not human improvement; no arm ever ran without the document \|”

The README literally says “five published writing standards” and later “both entries of both standards.” I preserve that inconsistency rather than reconstruct its experimental cells. What is established here is the record’s rejection of adopting a standard on reputation, not a causal refutation of every individual source practice. Its 3/6 → 6/6 pilot has p = 0.25, lacks a no-document arm, and does not establish human improvement. Current audit text now requires the missing arm; that later requirement is not retroactive evidence that the pilot ran one.

Evidence ranking is **measured > argued > asserted**, using source-reported observations, not vendor identity. “Measured” below is a reported experiment unless stated otherwise; none was reproduced. Numeric API limits (S1-23, S1-40, S2-19) are specifications, not measured improvement. “We’ve found” (S1-50) is a weak empirical claim without design/counts. S2-22’s ~100% has no test report and stays asserted. Reopening S2-46 supplied an empirical claim absent from its heading-only quote; that promotion and its Fable 5.1 restriction are explicit.

## Candidates — adopt only as testable hypotheses

The first ten are the requested shortlist. The last two are lower-priority experiments. Changes to measured fixed prose mean a separately labelled experimental variant/addendum; no existing provenance digest may continue to claim an altered block is byte-identical. Each experiment retains the current text as control, changes one mechanism, records the model and task, and measures reader answers or false/overstated-sentence regressions. No effect size is predicted. Human transfer remains unmeasured until people are tested.

| Rank | Claim / target line to change | Source evidence | Concrete trial | Audit question | Observation to compare |
|---:|---|---|---|---|---|
| 1 | C45; C [D:296](#quote-shape) | measured (reported, up to 30%; unknown design) | Add a 20k+ multi-document exception: keep the parser header first, put labelled source data in the body, and restate the concrete question at the body’s end. Do not apply this order to a human README. | After reading all exhibits, which task, constraints and answer must I carry out? | Matched long-context brief dry runs; question accuracy versus the original order, with the same sources and models. |
| 2 | C63; C [O:148](#quote-returnevidence) | measured (reported, Fable 5 only) | For Fable 5 long runs, require each completed/progress claim to name a tool result from the current session; retain counts and explicitly mark unverified claims. Other models are a separate hypothesis. | Which claimed completed actions are backed by a command result from this run? | Count unsupported completion statements and false/overstated return claims; do not count a schema-valid answer as verified. |
| 3 | C60; C [O:143](#quote-returnscope) | measured (reported, Fable 5.1 only) | In a Fable 5.1 coding brief distinguish required/necessary changes from discovered unrelated work to report in open, while requiring the entire requested behaviour. | Which discovered pre-existing issues must I change, and which must I report without changing? | Reader answers to scope cases; retained requested behaviours are controls. No transfer to Astra assumed. |
| 4 | C06; B [R:80](#quote-rsetup) | argued | Trial a conditional link for one-time rewrite setup, keeping the universal round/check sequence visible; resumed runs reuse the existing files. | On a resumed rewrite run, which setup files already exist and where is the next action? | Fresh skill-reader answers, missed setup dependencies and unnecessary reinitialisation; preserve all check coverage. |
| 5 | C07; B [T:23](#quote-tmethod) | argued | Make the stages pointer name the exact decision that needs it and when it must be read; test that wording before inlining more method text. | When deciding a heading’s vocabulary, which reference must I open and what answer must I take from it? | Findability question and forced-guess count; compare the existing pointer with one explicit trigger. |
| 6 | C12; B [T:45](#quote-tterms) | argued | End terminology review with a checkable inventory: every load-bearing term has a reader interpretation, source/meaning and a decision. Preserve the owner’s stop at the skeleton. | How can I tell the terminology step is complete, and which term decisions are still missing? | Missing-term answers and downstream terminology regressions; do not reward raw word-count cuts. |
| 7 | C73; A [W:15](#quote-firstdef) | argued | Trial a separately labelled experimental variant of the term-placement rule: co-locate its definition and relevant qualifications, retaining repeated warnings at independent decisions. | At this action, what does the term mean and which condition limits the instruction? | Placement answers and regressions under the existing ledger; retain control questions. Keep the historical fixed block/hash as control; an adopted changed block would need revised provenance. |
| 8 | C25; C [D:296](#quote-shape) | argued | Add an optional one-clause intent or reason for a consequential/surprising constraint to TASK, not a compulsory essay. | Why does this constraint matter, and which choice preserves that intent in a new case? | Constraint-application answers; compare briefs with identical tasks/checks and only the reason changed. |
| 9 | C24; C [O:119](#quote-assembly) | argued | Add a one-clause role to each non-obvious input pointer and omit sources that cannot affect the result. Keep checking every quoted claim and path. | Which supplied file answers this subquestion, and what should I extract from it? | Source-selection question accuracy, wrong-file departures and forced guesses. |
| 10 | C02; B [R:49](#quote-rcopy) | argued | For maintainers, trial a model-release ablation note next to fixed-copy instructions; compare a candidate deletion against the intact measured wording before adopting it. Runtime readers still copy the approved baseline. | Which instruction can be removed without losing correct answers, required checks or a stopping boundary? | False/overstated-sentence regression count plus retained-control answers; model-by-model comparison against unchanged instructions. |
| 11 | C48; B [T:45](#quote-tterms) | argued | Where a dry run actually misreads a prohibition, pair it with the desired action; keep hard permission and truth guardrails explicit. | After seeing this prohibition, what action am I supposed to take? | Action-selection answers and observed violation count; no global negation purge. |
| 12 | C81; B [T:4](#quote-tdesc) | asserted host mechanics; argued load tradeoff | Keep disable-model-invocation: true and trial a short human-facing purpose summary without the Use when trigger list. Do not enable autonomous invocation. | Which of audit, rethink and rewrite should I invoke for this starting state? | Human choice task is needed to test human transfer; model skill selection alone cannot establish it. |

## Do not adopt

| Rank | Claim(s) | Rejected transfer | Target/record counter | Why |
|---:|---|---|---|---|
| 1 | C11 | Do not remove required verification because a model is described as self-verifying. | [R:96](#quote-rchecks), [O:124](#quote-complete), [I:12](#quote-regrecord) | Astra/Opus 5 defaults do not establish that checks are redundant here; the local history contains false lifecycle claims and rising regressions. |
| 2 | C77 | Do not adopt one-copy-only meaning as a universal deduplication rule. | [W:21](#quote-safeguard), [R:167](#quote-rpreserve), [A:139](#quote-repeat) | Independently entered decision points need the same condition or warning. Keep one authority and controlled local repeats. |
| 3 | C14 | Do not relax authorisation based on Astra being called aligned or safe. | [R:146](#quote-rstop), [D:318](#quote-user), [D:201](#quote-rights) | The sole supporting premise describes this mapper’s model. It is not evidence of user consent or bounded filesystem rights. |
| 4 | C78 | Do not delete setup facts merely because an agent could look them up. | [A:85](#quote-readers), [S:277](#quote-prereqexception), [W:21](#quote-safeguard) | The target reader is restricted to documentation; runtime/version facts may make an upgrade warning actionable. This is a condition mismatch, not a same-condition refutation of S3. |
| 5 | C79 | Do not replace checkable criteria with stronger words such as relentless. | [D:296](#quote-shape), [R:115](#quote-rregress) | The source supplies no measured improvement; observable criteria are already the target’s stronger counter to vague demand. |
| 6 | C08 | Do not delete ordered steps indiscriminately in the name of modern-model autonomy. | [A:13](#quote-auditorder), [K:11](#quote-prereq) | The advice itself permits process-critical steps; the audit’s profile → answer key → readers sequence is the method. |
| 7 | C15 | Do not erase the skeleton or application approval stops. | [T:17](#quote-tstop), [R:146](#quote-rstop) | These stops protect actual user decisions; the source only questions unneeded review. |
| 8 | C43 | Do not impose a 3–5-example quota or add fabricated commands to meet it. | [S:284](#quote-noinvent), [W:25](#quote-counts) | No measured support for this count in the supplied quote; real examples and observed failure should decide. |
| 9 | C36 | Do not impose coding-Markdown instructions on every delegated return. | [O:152](#quote-strict) | Strict JSON is the required wire format; the advice is Astra coding-specific and can apply only inside suitable text fields. |
| 10 | C45 | Do not move a human document’s goal to the end using long-context model evidence. | [W:18](#quote-purpose), [S:270](#quote-problem) | The 20k+ model-prompt test does not measure how people orient themselves in a README. |
| 11 | C29 C30 | Do not turn host context caps or AGENTS override placement into document length rules. | [W:25](#quote-counts), [A:4](#quote-adesc), [D:196](#quote-header) | These targets do not carry the AGENTS discovery mechanism, and specified numeric caps are not measured writing gains. |
| 12 | C50 C55 C56 C62 | Do not add prefill, thinking-mode or image-crop policy to these prose targets by default. | [S:265](#quote-content_scope), [D:296](#quote-shape) | No corresponding mechanism is required by the scoped targets; model/API-specific advice needs its actual integration point. |
| 13 | C16 | Do not privilege Astra as the auditor because the post recommends Astra. | [A:62](#quote-evidencelevels), [W:44](#quote-modelcheck) | No instruction-audit measurement is supplied; re-check claims with observable evidence regardless of model name. |
| 14 | C75 | Do not replace explicit shared contracts with words expected to activate pretrained behaviour. | [S:286](#quote-vocab), [D:296](#quote-shape) | A term may have a different human meaning; defined TASK/CHECK/RETURN fields provide an explicit contract. |
| 15 | C31 | Do not reinterpret code-lint-to-CI advice as a mandatory prose-lint pass. | [W:49](#quote-nolinters), [P:64](#quote-record) | The scope is code-review rules; the local record and writing rules reject importing generic prose standards as gates. |
| 16 | C74 | Do not split every sequence into hidden contexts. | [T:82](#quote-thandoff), [D:302](#quote-one) | S3 first requires a sharpened bound, irreducible fuzziness and observed rushing; neither fragmentation nor a fresh context is automatically a benefit. |
| 17 | C70 | Do not promote every speculative review concern into a verified finding. | [O:120](#quote-adversarial), [O:123](#quote-unknown), [R:110](#quote-rverify) | The Opus 4.8 advice assumes a later filter. Preserve uncertain concerns in open and keep the check requirement for findings. |

Existing present practices need no new rule merely to credit a source. Model/API claims outside A–C belong at an actual integration point if such work is commissioned, not in a general writing standard.

## Gaps

These are specific missing treatments for A–C in the supplied surveys, checked with targeted searches of all 17 saved/local source files. They are not claims that the vendors never discuss the subject elsewhere. S2 itself says its evaluation-row extraction is incomplete; generic success criteria, human graders, context and source-checking are therefore not called absent. A definitive exhaustive negative about every unsurveyed paragraph remains unknown.

1. **Human transfer evidence.** The sources offer model-performance advice and a colleague-comprehension heuristic, but no demonstrated improvement in people performing these documentation tasks. A needs novice task outcomes; B/C model dry runs cannot substitute for them. Needed at [I:10](#quote-humanlimit), [A:105](#quote-task).
2. **Documentation truth across revisions.** Source-grounding is covered; the missing document-specific treatment is claim-by-claim evidence levels, lifecycle execution and a ratchet that prevents verified facts disappearing or false wording returning. Needed at [A:62](#quote-evidencelevels), [R:96](#quote-rchecks), [R:115](#quote-rregress).
3. **Independent entry and local warnings.** No treatment was located for a reader entering at several independent decisions and needing a condition repeated at each. S3’s one-place rule needs this explicit exception in A/B. Needed at [W:21](#quote-safeguard), [A:139](#quote-repeat).
4. **Human genre and maintenance shape.** Prompt advice does not decide this document’s install/update blocks, actionable runtime requirements, comparison tables or which internal term makes the wrong human claim. A needs those content decisions. Needed at [S:282](#quote-update), [S:277](#quote-prereqexception), [S:286](#quote-vocab), [S:290](#quote-table).
5. **Documentation-specific measurement coverage.** Generic eval guidance does not supply terse’s combined no-document arm, unanswerable question, correctly answered controls, unvisited task sections and score-ceiling stop. B needs this ruler; C needs to keep unknown/skipped coverage visible. Needed at [A:90](#quote-baseline), [A:73](#quote-controls), [A:76](#quote-unanswerable), [A:105](#quote-task), [A:145](#quote-baselineceiling), [O:125](#quote-caps).

## Adjudication of S1-6 versus S1-44

1. **Scope:** saved `main.txt:734` says “many skills were written as elaborate itineraries or recipes” before “Models have gotten much better at understanding nuance and ambiguity, so overly specific guidance can now hinder results where it previously helped.” It targets unnecessary process prescription, and explicitly speaks of models broadly.
2. **Compatible core:** saved `prompt-engineering.txt:813` asks for “precise instructions that explicitly provide the logic and data required to complete the task”; `prompting.txt` S1-33/34 says result first and process only when it matters. Precise goals, evidence, constraints and outputs can coexist with freedom over method. C08 and C32 therefore remain distinct.
3. **Residual uncertainty:** `prompt-engineering.txt:855–858` contrasts reasoning models with GPT models as senior/junior coworkers, while its Astra agentic sample at 847 demands extensive planning/reflection. Neither saved page gives a comparison defining the right specificity threshold or reconciling that taxonomy for Astra. Keep required contracts and test itinerary deletions per model; do not decide by this mapper’s identity.

## Other tensions and contradictions

| Source claims | Finding | Resolution for A–C |
|---|---|---|
| S1-11 vs S1-45/47 | Direct prescription conflict within Astra coding: main.txt:745 says encouragement can cause unnecessary testing; prompt-engineering.txt:820/822 explicitly requires testing and patch validation. Neither provides counts or a tested threshold. | Do not delete [R:96](#quote-rchecks) or [O:124](#quote-complete) on the post alone. A targeted experiment can remove redundant self-reminders while retaining external task gates. |
| S1-6 / S2-25 vs S3-1/23/28 | S3 seeks repeatable process and exhaustive completion; model guides favour freedom over internal reasoning. This is not a contradiction when steps are required by the work. | [A:13](#quote-auditorder) explains an essential order. Keep that; trial removal only of unsupported itineraries. |
| S2-5/38 vs S3-45 / target reason pruning | All allow reasons; the writing rule cuts the argument repeated everywhere, not the authoritative explanation. | [W:9](#quote-reason) is compatible. C25 adds a missing reason in C rather than duplicating every justification. |
| S3-42/43 vs A/B decision repetition | This is an actual incompatible universal when the same meaning is needed at two independent decisions. | [W:21](#quote-safeguard) and [R:167](#quote-rpreserve) explicitly preserve those repetitions. Narrow single-source advice to authority/maintenance, not number of appearances. |
| S3-44/45 vs S1-35 / S2-5 | A tension only if cheap lookup is used to remove result-changing context or reasons. S3 allows undiscoverable reasons; prompts may also carry inaccessible facts. | Retain [A:85](#quote-readers) access conditions. Historical measurements and reader prerequisites are not disposable current-environment caches. |
| S3-51 vs S2-25 and S1-6 | S3 says a weak leading word should always be strengthened instead of changing technique; “think thoroughly” is offered as sufficient in S2, and S1 cautions against obsolete scaffolding. Different defaults can explain examples, but the always-strengthen remedy lacks evidence. | Use C02’s baseline test; no lexical escalation without an observed gain. [D:296](#quote-shape) is already concrete. |
| S2-26 vs S2-40 | Apparent conflict resolves by condition: manual chain-of-thought is only a thinking-off fallback; Fable always has thinking on and rejects requests to reproduce internal reasoning as visible text. | Keep task rationale/evidence distinct from hidden reasoning; neither requires changing the five-field return. |
| S2-12/13 vs A purpose-first | Different audiences and sizes: 20k+ model prompt retrieval versus a person arriving at a document. | C45 is a C experiment, not a rewrite of [W:18](#quote-purpose). |
| S1-14/15 vs S2-37 | Astra relaxation and Fable explicit-boundary advice concern different named models, so not a same-condition contradiction. Neither establishes a portable permission policy. | Preserve [D:201](#quote-rights) and user agency; model traits do not supply authorisation. |
| S1-53 and its adjacent example | Source prose says “only at notable steps”; prompt-engineering.txt:851’s example says “Before you call a tool explain why you are calling it.” The example is broader than the stated condition. | Keep the narrow notable-step condition; do not expand C39 to every call. |
| S3-67/68 vs user-only skill links | Suggesting another skill to the person is not executing it, and reading its ordinary reference files is not invoking it. | [R:18](#quote-rbranches) / [T:82](#quote-thandoff) do not violate the invocation barrier. No installed-host experiment was performed. |

## Merge table

| Claim | Merged practice | Every contributing row | Source evidence and preserved condition |
|---|---|---|---|
| C01 | Revisit and prune instructions whose relevance has expired | S1-1, S1-8, S3-46, S3-47 | argued; General in S3; S1 explicitly says each release. |
| C02 | Remove default-behaviour no-ops only after a run against the model baseline | S2-39, S3-48, S3-49, S3-50 | argued; S3 general and model-relative; S2-39 is only Fable 5 migration, not independent general proof. |
| C03 | Prune always-loaded skill descriptions to preserve context and matching | S1-2, S1-21, S1-23, S3-6, S3-10, S3-55 | argued; numeric host budget is specified, not an observed treatment effect; Initial skill list only; 2% / 8,000 characters is a host mechanism, not a length target. |
| C04 | Describe precise task branches and boundaries without contradictory or duplicate triggers | S1-3, S1-4, S1-21, S1-57, S3-3, S3-5, S3-8, S3-9 | argued; General description/pointer guidance from build-skills, tools-skills and S3, not an Astra-only inference. |
| C05 | Front-load the use case or trigger word in a pointer | S1-22, S3-7 | argued; Description truncation and context pointers, general sources. |
| C06 | Disclose branch-specific reference; keep shared steps and necessary context visible | S1-5, S1-58, S3-2, S3-12, S3-13, S3-14, S3-15, S3-16, S3-17, S3-21, S3-22, S3-52 | argued; General tools-skills/S3 support; the minimal-router version is for multiple workflows. |
| C07 | Repair a weak required pointer before deciding to inline its target | S3-4 | argued; Only inline if stronger wording still fails to retrieve required material. |
| C08 | Specify the result; prescribe process only where process matters | S1-6, S1-33, S1-34, S2-25 | argued; S1-6 explicitly says models broadly; S1-34 generalises beyond Astra. S2-25 is about thinking prompts, not all procedures. |
| C09 | Calibrate instruction specificity to the models that will share it | S1-7, S1-55 | argued; Cross-model comparison, not a universal GPT-versus-reasoning taxonomy proved by data. |
| C10 | Read task-relevant documents instead of a full stack before every edit | S1-9, S1-10 | argued; Astra is the post’s subject; contextual reading is the worked example, not proof for every model. |
| C11 | Remove inherited test or verification encouragement for models said to self-verify | S1-11, S2-28 | argued (S2); asserted capability (S1); Only Astra / Opus 5. S1 support is solely the vendor’s description of Astra, including this mapper; not mapper self-evidence. |
| C12 | Define completion with checkable, exhaustive bounds and a stated exploration stop | S1-12, S1-16, S1-17, S1-19, S3-23, S3-24, S3-26, S3-27, S3-28 | argued; General support is S3; Astra tentativeness in S1-12/16 is descriptive motivation only, not independent proof. |
| C13 | Grant standing permission for a named known-safe workflow | S1-13 | argued (worked example); Astra post example; disposable fixtures and no production access are required facts. |
| C14 | Relax inherited ask-first boundaries because Astra is said to have better judgment | S1-14, S1-15 | asserted capability; argued migration consequence; Astra only. Sole support is a vendor description of this mapper’s model as aligned/safe; no measurement or generalisation. |
| C15 | Remove first-pass review stops only when that review is not a needed decision | S1-18 | argued; Astra post; the source explicitly asks whether the review decision is needed. |
| C16 | Ask Astra to audit accumulated instructions | S1-20 | asserted; Astra only; exhortation based on this model’s described capability, no reported audit outcome. |
| C17 | Give each skill or agent one coherent job | S1-24 | asserted; General skill guidance. |
| C18 | Use skills for repeatable approaches; stabilise process rather than identical output | S1-28, S3-1 | asserted; General skill/workflow claim, not a universal recipe for human prose. |
| C19 | Prefer instructions to scripts unless determinism or external tooling is needed | S1-25 | asserted; Explicit exception for deterministic work or external tooling. |
| C20 | Use imperative ordered steps and explicit inputs/outputs where completeness or order matters | S1-26, S1-29, S2-4 | asserted; argued workflow example in S1-29; General skills; S2 specifies order/completeness-critical conditions. S1-29 also contributes output/constraints facets to C28/C32. |
| C21 | Test a realistic draft against declared empirical success criteria, then refine | S1-30, S2-1 | argued; General prompt/skill development; not evidence that any particular wording helps. |
| C22 | Test skill-description trigger behaviour with realistic prompts | S1-27 | asserted; Implicit matching must actually be enabled. |
| C23 | Scale prompt detail to task size and omit fields or boundaries that do not help | S1-31, S1-32, S1-36 | argued; General ChatGPT prompt framework is optional; one/two important boundaries is advice, not a safety maximum. |
| C24 | Include only context that can change the result and say what each source supplies | S1-35 | argued; General prompting, with source relevance and purpose together. |
| C25 | Explain consequential instructions with the intent that makes them matter | S2-5, S2-38 | argued; General current-Claude support in S2-5; Fable multi-workstream variant in S2-38 does not limit it to Fable. |
| C26 | For important work ask for a final check against the task criteria | S1-37 | argued; General ChatGPT guidance; important-work condition, not every minor action. |
| C27 | Iterate on an actual result with a specific requested change | S1-38 | argued; General prompt refinement. |
| C28 | State behaviour, relevant code/reproduction, constraints and a verification method in a coding brief | S1-29, S1-39 | argued / asserted; General Codex coding prompt; S1-29 contributes goal/constraints/format for skill drafting. |
| C29 | Handle the AGENTS.md byte cap by a configured limit or directory-scoped instructions | S1-40, S1-41 | argued; 32 KiB is specified, not an observed benefit; Codex project_doc_max_bytes mechanism, default 32 KiB; raising/splitting advice does not prove any target is truncated. |
| C30 | Place AGENTS overrides close to the specialised directory they govern | S1-42 | argued; Codex directory search stops at current directory. |
| C31 | Keep code-review rules concise, include safe exceptions, and leave lint to CI | S1-43 | argued; Only AGENTS.md Code Review Rules; not a requirement to add CI prose linting. |
| C32 | Provide precise desired outputs and necessary task logic/data | S1-29, S1-44, S1-56, S2-3 | asserted; metaphor in S1-56 is argument, not measurement; S1-44 explicitly generalises to GPT models; S2-3 says all current Claude. No inference from Astra identity needed. |
| C33 | Give the model a concise role with defined responsibilities | S1-45, S1-46, S2-11 | asserted; worked guidance in S1-46; General current-Claude support in S2-11; Astra-specific coding is a narrower example, not cross-model proof. |
| C34 | Instruct code tests and validate patch results instead of trusting a tool’s Done | S1-45, S1-47 | asserted; GPT-6 Astra coding only; no reported patch experiment. Conflicts with C11 within coding tasks. |
| C35 | Include concrete tool-invocation examples | S1-45, S1-48 | argued; GPT-6 Astra coding section; no generalisation stated for this recommendation. |
| C36 | Specify Markdown conventions including backticks for paths and identifiers | S1-45, S1-49 | asserted; GPT-6 Astra coding output; not a rule for every document or structured return. |
| C37 | For large frontend work supply principles, UI/UX, structure, component and page guidance | S1-50 | measured claim (we have found), no protocol or counts; Astra-labelled front-end section; no measured effect size or generalisation. |
| C38 | For long agentic work require full resolution, decomposition and reflection after calls | S1-51, S1-52 | argued; GPT-6 Astra long-running rollouts; no generalisation of the prescribed per-call reflection. |
| C39 | Explain notable tool-use decisions with brief preambles | S1-51, S1-53 | argued; GPT-6 Astra agentic section; only notable steps, despite a broader adjacent sample. |
| C40 | Use a TODO tool or rubric to track an extended workflow | S1-51, S1-54 | argued; GPT-6 Astra agentic section; rubric is an alternative to TODO tool. |
| C41 | Name a skill explicitly when its use must be deterministic | S1-59 | asserted; Mounted skill; explicit invocation requested when appropriate, not universal auto-triggering. |
| C42 | Consider non-prompt fixes when a failure is model choice, latency or cost | S2-2 | argued; General prompt engineering; concrete alternative is model selection. |
| C43 | Use relevant diverse few-shot examples; the source suggests 3–5 | S2-6, S2-7, S2-57 | asserted; Current-Claude general claim; Sonnet 5 adds a positive-concision example preference. The fixed count has no measured backing here. |
| C44 | Separate mixed prompt content with descriptive consistent XML tags | S2-9, S2-10 | argued; General current-Claude guidance for complex mixed content; not evidence XML beats other delimiters. |
| C45 | For long multi-document inputs put data first and the query last | S2-12, S2-13 | measured claim: up to 30% in tests; design/sample/model breakdown unknown; 20k+ token context; source expressly says all models, so not pinned to one Claude model. |
| C46 | Request a brief summary after tool work when the person wants visibility | S2-15 | asserted; General latest-Claude communication; optional visibility request. |
| C47 | Ask explicitly for concise visible output on Opus 5 | S2-16 | asserted; Opus 5 only; effort is not a reliable verbosity control. |
| C48 | Phrase the desired behaviour positively; retain unavoidable hard guardrails with a positive target | S2-17, S3-38, S3-39, S3-40, S3-41 | argued (negation mechanism); asserted recommendation; S2 is output formatting; S3 generalises, with a hard-guardrail exception. The elephant analogy is not a measured effect. |
| C49 | Match prompt style to desired output when formatting steering fails | S2-18 | asserted; Only after observed output-format steering problems; current Claude. |
| C50 | Avoid final assistant prefills on models whose API rejects them | S2-19 | specified API behaviour: 400; no experiment disclosed; Claude 4.6+ / Mythos Preview API restriction, not a prose practice. |
| C51 | Request schema conformance rather than migrating formatting through prefills | S2-20 | asserted; Newer models; migration from unsupported formatting prefills. |
| C52 | Explicitly identify the tool action when tool use is required | S1-46, S2-21 | asserted / argued; S2 latest-Claude guidance supplies broader scope than the Astra coding example; no single-model-only claim. |
| C53 | Batch independent tool calls; do dependent work sequentially | S2-22, S2-43 | asserted; ~100% claim has no test protocol; General latest-Claude independent calls; Fable 5.1 repeats it for loops. |
| C54 | Replace blanket tool defaults with task-relevant use when Opus 4.6 over-explores | S2-23 | argued; Opus 4.6 only; over-exploration condition. |
| C55 | Use adaptive instead of extended thinking where evaluations favour it | S2-24 | measured claim: internal evaluations, no counts/design; Claude 4.6+ / Mythos Preview thinking API; family-scoped capability. |
| C56 | When thinking is disabled, consider manual step-by-step reasoning prompting | S2-26 | asserted; Thinking-disabled Claude fallback; not a demand to expose hidden reasoning. |
| C57 | When the harness compacts reliably, do not stop just because the context is nearly full | S2-29 | asserted; Only a harness that actually compacts/saves context; indefinite continuation is conditional. |
| C58 | Delegate independent/context-isolated work; keep dependent simple work local | S2-31 | argued; General latest-Claude subagent guidance. |
| C59 | Use separate calls when intermediate inspection or a mandated pipeline matters | S2-32 | asserted; Explicit external stages, not internal reasoning narration. |
| C60 | Limit changes and tests to requested or necessary work | S2-33, S2-46 | measured claim in re-opened S2-46 context: extras/test additions drop with no measurable task-success change; no counts/design; Opus 4.5/4.6 and Fable 5.1 coding guidance; no generalisation established by these quotes. |
| C61 | Open the relevant source before making code claims | S2-34 | asserted; General latest-Claude source-grounding guidance. |
| C62 | Provide crop/zoom tools for image tasks | S2-35 | measured claim: consistent uplift, no counts/design; Opus 4.5/4.6 image evaluation condition; no generalisation. |
| C63 | Audit progress and completion claims against actual tool results from this session | S2-36 | measured claim: nearly eliminated fabricated status reports; no denominator/design; Fable 5 / Mythos 5 only. Source does not generalise to Astra or other models. |
| C64 | State permitted and prohibited actions where the model may act unasked | S2-37 | asserted; Fable 5 / Mythos 5 only; unrequested-action behaviour. |
| C65 | Do not request reproduction of internal reasoning as response text | S2-40 | asserted API/model consequence; Fable 5 only; source names reasoning_extraction refusal and a structured thinking alternative. |
| C66 | Specify the state that compaction summaries must preserve | S2-45 | asserted; Fable 5.1 / Mythos 5.1 CLIENT-SIDE compaction; saved page says server-side compaction already does this. Not generalised. |
| C67 | Reserve enough output allowance for high-effort long results | S2-48 | asserted; Fable 5.1 / Mythos 5.1 at xhigh/max. |
| C68 | For observed shallow complex reasoning raise effort before adding prompt scaffolding | S2-49, S2-59 | asserted; Opus 4.8 or Sonnet 5 only; observed shallowness on complex tasks. |
| C69 | State explicitly when an instruction must cover every item | S2-50 | asserted; Opus 4.8 literal-following behaviour only. |
| C70 | In a review-before-filter pipeline report every issue, including uncertain/low-severity ones | S2-51 | asserted; Opus 4.8 review harness with a later filter. |
| C71 | Compare observed thinking length rather than effort labels when benchmarking models | S2-58 | asserted; Sonnet 5 cross-model migration benchmarking; not generalised to all serving systems. |
| C72 | Spend human cognitive effort where human judgment matters | S3-11 | argued; Explicit human-agency tradeoff; minimisation is not universal. |
| C73 | Co-locate a concept’s definition, rules and caveats under a useful heading | S3-18, S3-19, S3-20 | argued; Scattered fragments differ from intentional repetition at separate decisions. |
| C74 | First sharpen a vague completion bound; hide later steps across a real context boundary only if rushing persists | S3-25, S3-29, S3-30, S3-31 | argued; Requires both irreducible fuzziness and observed rushing; inline calls do not hide later context. |
| C75 | Use stable leading words as compact behavioural and retrieval anchors | S3-32, S3-33, S3-35, S3-36, S3-37 | argued; pretraining mechanism unmeasured; Claims tokens recruit pretrained concepts; no behavioural comparison supplied. |
| C76 | Prefer established words and clearly define coined terms | S3-34 | argued; S3 motivates this through pretraining; transfer must test the actual reader’s meaning. |
| C77 | Keep each meaning in one authoritative place and remove duplicated meaning | S3-42, S3-43 | argued; S3 says each meaning/one-place edit, without a decision-point repetition exception. |
| C78 | Avoid restating discoverable environment facts except when lookup is expensive; preserve undiscoverable reasons | S3-44, S3-45 | argued; S3-44 allows expensive lookups; S3-45/next sentence otherwise send one-file/one-command facts to the environment. |
| C79 | If a leading word does not beat defaults, intensify the word instead of changing technique | S3-51 | argued; no measured comparison; Model-relative no-op test; be thorough → relentless is an example, not evidence. |
| C80 | For needed autonomous discovery keep a model-facing description and allow model invocation | S3-53, S3-54, S3-57 | argued / asserted host mechanics; Host-specific disable-model-invocation semantics; human naming remains possible. |
| C81 | Use user-only invocation for manual skills and make its description a short human summary without triggers | S3-58, S3-59, S3-60, S3-61, S3-62 | argued / asserted host mechanics; Only when skills fire by hand; S3 says this removes context load and shifts discovery to the person. |
| C82 | Use a model-invoked all-reference skill as a shared reference home | S3-56 | argued; Only where autonomous invocation by other skills is needed; not required for user-only tools. |
| C83 | Share reference used by user-only skills through ordinary files, not cross-invocation | S3-63, S3-64 | argued; The invocation barrier concerns calling the skill, not reading a file inside another skill directory. |
| C84 | Create a separately invocable skill only when independent reach earns its description cost | S3-65, S3-66 | argued; Distinct used trigger or another skill needs autonomous reach. |
| C85 | Offer a human-invoked router when people cannot remember their user-only skills | S3-67, S3-68 | argued; Only after recall burden is observed; router suggests names but cannot invoke them. |

## Full mapping table

The bracketed target line opens its exact quoted source in the ledger below. Transfer `stated` requires actual human-reading/agency language, not merely a survey audience labelled “human” because a person writes the prompt. `plausible` supplies one reason, not evidence of an effect. `unknown` does not mean the claim is false.

| Claim | A — document writing rules | B — executable skill texts | C — delegated brief / return | Transfer to text people read |
|---|---|---|---|---|
| C01 Revisit and prune instructions whose relevance has expired | **present** — [W:44](#quote-modelcheck). Explicitly re-check old rules against the current model. | **partial** — [R:157](#quote-rstate). Maintains the skeleton after decisions; no scheduled review of the skill instructions themselves. | **not located** — [D:310](#quote-standing). Reuses standing rules; does not ask whether they remain needed. | plausible — stale instructions misdirect human decisions |
| C02 Remove default-behaviour no-ops only after a run against the model baseline | **partial** — [W:44](#quote-modelcheck). Re-checks model-relative rules but gives no sentence ablation protocol. | **partial** — [A:90](#quote-baseline). Measures document versus no document; does not ablate skill instructions against defaults. | **partial** — [D:310](#quote-standing). Avoids repeating known standing rules, but has no baseline comparison for a proposed instruction deletion. | unknown — model-default behaviour is the stated mechanism |
| C03 Prune always-loaded skill descriptions to preserve context and matching | **unknown** — [W:6](#quote-live). Document sentence value is not a host skill-list budget. | **conditional** — [A:4](#quote-adesc). All three set disable-model-invocation: true; the claimed always-loaded discovery condition does not hold per S3. | **unknown** — [D:296](#quote-shape). A delegated brief is not an always-loaded skill catalogue. | unknown — always-loaded context budgets concern the host/model |
| C04 Describe precise task branches and boundaries without contradictory or duplicate triggers | **partial** — [K:18](#quote-framing). Requires what this is and when needed; no trigger-branch or synonym rule. | **partial** — [R:18](#quote-rbranches). Entry routes and linked reference purposes are explicit; not every reference states its load condition. | **partial** — [D:196](#quote-header). Header fields encode conditions; TASK/CHECK/RETURN has no explicit source-pointer branch contract. | plausible — precise link labels tell readers when to follow them |
| C05 Front-load the use case or trigger word in a pointer | **partial** — [W:18](#quote-purpose). Purpose goes first, but pointer labels have no such rule. | **present** — [A:155](#quote-arefs). Reference labels lead with the work they support, before the link. | **present** — [D:196](#quote-header). Headers lead with named fields and a condition table. | plausible — the first words help a scanning reader choose a link |
| C06 Disclose branch-specific reference; keep shared steps and necessary context visible | **partial** — [S:275](#quote-detail). Places technical detail below the middle; does not prescribe branch-based external reference. | **partial** — [R:80](#quote-rsetup). References are disclosed, but one-time setup remains inline for resumed runs that are explicitly told to reuse those files. | **partial** — [D:213](#quote-gateowner). Links gate mechanics out; header and body instructions remain largely inline rather than branch-disclosed. | plausible — readers can follow the relevant path without losing required steps |
| C07 Repair a weak required pointer before deciding to inline its target | **not located** — [K:18](#quote-framing). Repairs missing framing, not the strengthen-pointer-before-inline sequence. | **not located** — [T:23](#quote-tmethod). The method link gives a subject, without an explicit test or escalation for a missed read. | **not located** — [D:213](#quote-gateowner). The gate reference is linked; no pointer-repair rule is stated. | plausible — a clear link can repair navigation without duplicating content |
| C08 Specify the result; prescribe process only where process matters | **present** — [K:11](#quote-prereq). This fixed procedure makes its ordered inventory/rebuild/failure-point steps the method; it does not add an unrelated itinerary. | **present** — [A:13](#quote-auditorder). The target explicitly explains why the prescribed order is method-critical, matching the process-matters exception. | **present** — [D:296](#quote-shape). Defines task, ground truth and return without an internal reasoning itinerary. | plausible — a required outcome leaves room for an expert reader to choose the method |
| C09 Calibrate instruction specificity to the models that will share it | **present** — [W:44](#quote-modelcheck). Explicit current-model recheck. | **partial** — [R:104](#quote-rdispatch). Allows different execution models; does not review wording for their defaults. | **partial** — [D:207](#quote-model). Selects the model explicitly; no instruction-specificity calibration. | unknown — the comparison concerns model behaviour |
| C10 Read task-relevant documents instead of a full stack before every edit | **partial** — [S:275](#quote-detail). Moves optional detail away from first contact; no pre-edit reading policy. | **conditional** — [R:18](#quote-rbranches). For Astra: routes by existing inputs; first whole-document review still belongs to the document-rewrite task. | **conditional** — [O:119](#quote-assembly). For Astra: checks the assembled brief and its paths; no blanket full-repository pre-read. | plausible — irrelevant pre-reading delays a simple human task |
| C11 Remove inherited test or verification encouragement for models said to self-verify | **unknown** — [W:44](#quote-modelcheck). The writing layer is not a code-test prompting policy. | **conditional** — [R:96](#quote-rchecks). Astra/Opus 5 only; within that scope rewrite still requires checks before critics, so removal would oppose its method. | **conditional** — [O:124](#quote-complete). Astra/Opus 5 only; C explicitly retains independent completeness verification. | unknown — self-verification defaults are model-specific |
| C12 Define completion with checkable, exhaustive bounds and a stated exploration stop | **partial** — [K:11](#quote-prereq). Asks for an inventory and rebuilt framing; does not require an explicit end condition for each step. | **partial** — [T:45](#quote-tterms). Some steps have exact artifacts/gates; terminology review has no exhaustive completion check. | **partial** — [D:296](#quote-shape). Defines overall completion with ground truth and exact return; no every-intermediate-step completion rule. | plausible — explicit completion conditions prevent a reader stopping before the required outcome |
| C13 Grant standing permission for a named known-safe workflow | **unknown** — [W:6](#quote-live). No agent runtime authorisation mechanism in document writing rules. | **conditional** — [R:60](#quote-rperm). Astra only: permission gates here buy fan-outs and repository application; not the example’s disposable local workflow. | **conditional** — [D:201](#quote-rights). Astra only: explicit write/read rights exist, but do not assert that a particular test workflow is safe. | plausible — bounded authorisation avoids needless handoffs |
| C14 Relax inherited ask-first boundaries because Astra is said to have better judgment | **unknown** — [W:21](#quote-safeguard). Human decision-point safeguards are not model permission defaults. | **conditional** — [R:146](#quote-rstop). Astra only; explicit user approval for applying the candidate remains a task contract. | **conditional** — [D:318](#quote-user). Astra only; rights must remain visible in the user approval, independent of assumed judgment. | unknown — a model trait is the entire premise |
| C15 Remove first-pass review stops only when that review is not a needed decision | **unknown** — [S:265](#quote-content_scope). Content rules are not an agent stop policy. | **conditional** — [T:17](#quote-tstop). Astra context; this stop is justified by a measured wrong skeleton and belongs to the deliverable. | **conditional** — [O:127](#quote-crossreview). Astra context; bounded review and escalation are explicit protocol decisions. | plausible — a needed human review can prevent expensive work against the wrong decision |
| C16 Ask Astra to audit accumulated instructions | **unknown** — [W:44](#quote-modelcheck). Re-checking rules does not choose a branded auditor. | **conditional** — [A:52](#quote-ledger). Astra only; audit here concerns document claims, not an instruction-default audit. | **conditional** — [D:207](#quote-model). Astra can be selected; no instruction-audit task is specified. | unknown — delegation to this model is the mechanism |
| C17 Give each skill or agent one coherent job | **partial** — [W:18](#quote-purpose). One purpose is stated, without a one-job boundary rule. | **present** — [A:4](#quote-adesc). audit measures, rethink makes a skeleton, rewrite proposes text; descriptions separate jobs. | **present** — [D:302](#quote-one). Explicit one-deliverable rule and split for unrelated returns. | plausible — one purpose makes responsibility easier to identify |
| C18 Use skills for repeatable approaches; stabilise process rather than identical output | **unknown** — [S:265](#quote-content_scope). Content rules do not choose which workflows deserve skills. | **present** — [A:13](#quote-auditorder). Ordered measurement protocol makes the approach repeatable. | **partial** — [D:296](#quote-shape). A repeatable brief/return contract exists, with no requirement to repeat the internal process. | unknown — the claimed predictability concerns agent execution |
| C19 Prefer instructions to scripts unless determinism or external tooling is needed | **unknown** — [W:49](#quote-nolinters). Rejecting prose linters is a different decision from instruction/script packaging. | **present** — [R:74](#quote-selftest). Uses scripts for mechanical checks with planted violations; human/model judgment stays in prose. | **present** — [O:152](#quote-strict). Uses a schema for deterministic output parsing and prose for the task. | unknown — skill packaging mechanism |
| C20 Use imperative ordered steps and explicit inputs/outputs where completeness or order matters | **present** — [K:11](#quote-prereq). Three numbered imperative steps and a retained inventory. | **present** — [A:13](#quote-auditorder). Named ordered steps, profile, ledger, answer key and readers. | **partial** — [D:296](#quote-shape). Task/check/return names output and validation, but does not request dependency order when it matters. | plausible — named inputs and step order make a procedure executable |
| C21 Test a realistic draft against declared empirical success criteria, then refine | **partial** — [W:44](#quote-modelcheck). Calls for rechecking rules without specifying a representative execution test. | **present** — [A:105](#quote-task). Fresh readers act from text, and produced state is checked. | **partial** — [O:119](#quote-assembly). Preflight checks paths/counts/quotes, but does not execute a sample task from the brief. | plausible — testing actual reader tasks catches missed steps |
| C22 Test skill-description trigger behaviour with realistic prompts | **unknown** — [W:18](#quote-purpose). No skill host discovery mechanism. | **conditional** — [A:4](#quote-adesc). All three disable model invocation, so testing implicit triggers is not their current route. | **unknown** — [D:296](#quote-shape). Named delegated tasks are not a skill-description matcher. | unknown — automatic skill discovery is the mechanism |
| C23 Scale prompt detail to task size and omit fields or boundaries that do not help | **partial** — [W:6](#quote-live). Requires each sentence to carry value; no task-size framework. | **partial** — [R:18](#quote-rbranches). Skips earlier steps on resume and branches by available inputs; mandatory large fan-outs remain. | **conditional** — [O:143](#quote-returnscope). Optional header fields coexist with mandatory five-field returns; this protocol requires a format that general chat does not. | plausible — irrelevant form fields burden a reader without changing the decision |
| C24 Include only context that can change the result and say what each source supplies | **partial** — [W:6](#quote-live). Requires meaningful content; no source-role contract. | **present** — [R:34](#quote-rbrief). Enumerates each brief input and the work it governs. | **partial** — [O:119](#quote-assembly). Verifies input paths and quotes; does not require a one-clause purpose for every source. | plausible — purposeful references reduce searching through irrelevant material |
| C25 Explain consequential instructions with the intent that makes them matter | **present** — [W:9](#quote-reason). Keeps the case in one place; does not ban reasons. | **present** — [A:13](#quote-auditorder). Explains why the answer key and profile precede readers. | **not located** — [D:296](#quote-shape). TASK/CHECK/RETURN does not ask for intent or a reason for a surprising constraint. | plausible — a reason lets readers apply a rule to an unfamiliar case |
| C26 For important work ask for a final check against the task criteria | **unknown** — [S:265](#quote-content_scope). These are content rules, not the full execution/check loop. | **present** — [R:137](#quote-rgates). Requires no regressions plus task and question gates. | **present** — [O:124](#quote-complete). Final critic sees request, answer and evidence once. | plausible — a last check catches a missed obligation |
| C27 Iterate on an actual result with a specific requested change | **unknown** — [S:265](#quote-content_scope). The scoped content rules do not own the iterative workflow. | **present** — [R:115](#quote-rregress). Rounds record edits, checks and regressions against the previous result. | **present** — [O:127](#quote-crossreview). Fix/cross-review rounds retain gained evidence and blocker. | plausible — a concrete draft gives a human reviewer something specific to correct |
| C28 State behaviour, relevant code/reproduction, constraints and a verification method in a coding brief | **partial** — [K:18](#quote-framing). Supplies what/when and prerequisites, not a coding-brief template. | **present** — [R:34](#quote-rbrief). Profile, failures with lines, accuracy floor, and expected evidence are explicit inputs. | **partial** — [D:296](#quote-shape). Task/check/return and rights exist; code/reproduction/context are not requested explicitly. | plausible — a reproducible task brief removes missing starting assumptions |
| C29 Handle the AGENTS.md byte cap by a configured limit or directory-scoped instructions | **unknown** — [W:6](#quote-live). No AGENTS.md host budget. | **unknown** — [A:4](#quote-adesc). These are user-invoked skill files, not AGENTS.md discovery files. | **unknown** — [D:196](#quote-header). Header limits concern a delegated prompt, not AGENTS.md discovery. | unknown — host context loading mechanism |
| C30 Place AGENTS overrides close to the specialised directory they govern | **unknown** — [S:265](#quote-content_scope). No directory override mechanism. | **unknown** — [A:4](#quote-adesc). Skill bodies do not implement AGENTS overrides. | **unknown** — [D:196](#quote-header). The scoped prompt protocol does not specify AGENTS file placement. | unknown — directory-scoped instruction loading |
| C31 Keep code-review rules concise, include safe exceptions, and leave lint to CI | **conditional** — [W:49](#quote-nolinters). A preserves exceptions but explicitly rejects mandatory prose linters/CI punctuation gates; code lint differs. | **partial** — [R:96](#quote-rchecks). Keeps deterministic checks apart from critics but runs them locally rather than assigning CI. | **partial** — [O:120](#quote-adversarial). Restricts findings to correctness or requirements; no code-lint routing policy. | plausible — concise rules with exceptions prevent overbroad rejection |
| C32 Provide precise desired outputs and necessary task logic/data | **partial** — [K:11](#quote-prereq). Inventories missing mental model/context; does not tell authors to supply model task logic. | **present** — [T:76](#quote-toutput). Names exact skeleton contents and constraints. | **present** — [D:296](#quote-shape). Concrete task, ground truth and exact return. | stated — the saved Claude general-principles section asks a minimally informed colleague to follow the prompt; this is a human-comprehension heuristic, not measured transfer |
| C33 Give the model a concise role with defined responsibilities | **unknown** — [W:18](#quote-purpose). Document purpose is not model system-role framing. | **present** — [A:85](#quote-readers). Defines reader role, allowed files, prohibited source access and return. | **present** — [D:302](#quote-one). Requires named agents and one deliverable; verifier scope is specified in the return contract. | plausible — a named responsibility makes a delegated human task less ambiguous |
| C34 Instruct code tests and validate patch results instead of trusting a tool’s Done | **unknown** — [S:265](#quote-content_scope). Document content rules do not prescribe patch-tool checks. | **conditional** — [R:96](#quote-rchecks). Astra only: actual checks and regression gates implement validation; not the specific apply_patch warning. | **conditional** — [D:205](#quote-expect). Astra only: EXPECT verifies a successful command ran, but does not prove that the intended patch landed. | plausible — observing the changed state is stronger than a success message |
| C35 Include concrete tool-invocation examples | **present** — [S:294](#quote-fenced). Requires runnable fenced commands, narrower than all tool protocols. | **conditional** — [R:96](#quote-rchecks). Astra only: concrete node commands are supplied. | **conditional** — [O:152](#quote-strict). Astra only: concrete schema and header values are supplied; other tool calls remain outside this scope. | plausible — an executable example removes command syntax guessing |
| C36 Specify Markdown conventions including backticks for paths and identifiers | **partial** — [S:294](#quote-fenced). Requires language-tagged command fences; not blanket backticks for all paths/classes. | **conditional** — [R:96](#quote-rchecks). Astra only: skill examples use fenced commands and code spans, but do not mandate all named formatting. | **conditional** — [O:152](#quote-strict). Astra only: the return is strict JSON and user prose; blindly imposing Markdown would conflict with that contract. | plausible — consistent code typography distinguishes commands from prose |
| C37 For large frontend work supply principles, UI/UX, structure, component and page guidance | **unknown** — [S:265](#quote-content_scope). No frontend design implementation task in content rules. | **conditional** — [T:13](#quote-tskeleton). Astra frontend only: skeleton purpose is documentation; this package has no frontend generation role. | **conditional** — [D:296](#quote-shape). Astra frontend only: TASK could carry the categories, but C does not require them. | unknown — frontend generation performance, not human documentation |
| C38 For long agentic work require full resolution, decomposition and reflection after calls | **unknown** — [S:265](#quote-content_scope). Content rules do not govern agent persistence. | **conditional** — [R:146](#quote-rstop). Astra only: work continues through rounds to explicit user/cap stops; no per-call reflection rule. | **conditional** — [O:124](#quote-complete). Astra only: final completeness checking and continuation exist; no per-call reflection instruction. | unknown — agent reasoning/control behaviour |
| C39 Explain notable tool-use decisions with brief preambles | **unknown** — [W:18](#quote-purpose). Document opening purpose is not a live tool-use preamble. | **conditional** — [R:60](#quote-rperm). Astra only: announces major fan-out decisions and their cost. | **conditional** — [D:318](#quote-user). Astra only: coordinator explains agents to the user; does not require preambles for every notable tool call. | plausible — visible reasons help a person follow major tool-use decisions |
| C40 Use a TODO tool or rubric to track an extended workflow | **unknown** — [W:25](#quote-counts). Review counts are not an extended-workflow tracker. | **conditional** — [R:115](#quote-rregress). Astra only: rounds and regression tables implement a tracking rubric. | **conditional** — [O:127](#quote-crossreview). Astra only: records candidates, evidence and blockers, but no TODO tool. | plausible — a visible checklist reduces missed obligations |
| C41 Name a skill explicitly when its use must be deterministic | **unknown** — [S:265](#quote-content_scope). Document content rules do not invoke host skills. | **conditional** — [T:82](#quote-thandoff). Names rewrite, but requires the user’s agreed skeleton and stops; naming does not override user-only invocation. | **not located** — [D:296](#quote-shape). No explicit skill-use field or rule in this body template. | unknown — host skill invocation is the mechanism |
| C42 Consider non-prompt fixes when a failure is model choice, latency or cost | **unknown** — [S:265](#quote-content_scope). Not a model service-selection layer. | **partial** — [R:110](#quote-rverify). Routes non-sentence problems to structure or code instead of rewriting everything; does not optimise model cost. | **present** — [D:207](#quote-model). MODEL/EFFORT expose non-prose remedies, selected for the task. | unknown — model service configuration is the mechanism |
| C43 Use relevant diverse few-shot examples; the source suggests 3–5 | **conditional** — [S:284](#quote-noinvent). Real examples are allowed, fabricated paths forbidden; no 3–5 quota. | **partial** — [R:96](#quote-rchecks). Commands and output formats have examples, but no 3–5 diverse input/output set. | **partial** — [D:302](#quote-one). Examples show the required first sentence and schema, without the prescribed count or diverse cases. | plausible — real examples show an expected format concretely |
| C44 Separate mixed prompt content with descriptive consistent XML tags | **unknown** — [S:294](#quote-fenced). Human command typography is not an XML prompt protocol. | **partial** — [R:34](#quote-rbrief). Numbered labelled inputs separate content by role without XML. | **partial** — [D:296](#quote-shape). Header/body and TASK/CHECK/RETURN distinguish fields without XML. | plausible — clear section boundaries distinguish instructions from evidence |
| C45 For long multi-document inputs put data first and the query last | **unknown** — [S:270](#quote-problem). Human opening with problem/goal has a different audience and purpose; not a contradiction. | **not located** — [R:34](#quote-rbrief). Brief order is fixed by role, with no long-context query-last exception. | **not located** — [D:296](#quote-shape). TASK leads; no long-data-first/query-last rule. | unknown — the source reports model response quality, not human reading |
| C46 Request a brief summary after tool work when the person wants visibility | **unknown** — [W:18](#quote-purpose). Static document purpose does not summarise a live task. | **present** — [A:149](#quote-areturn). Returns score, failures and artifact path after the work. | **present** — [D:318](#quote-user). Coordinator retells who did what in ordinary user-facing prose. | stated — the source addresses the human preference for visibility |
| C47 Ask explicitly for concise visible output on Opus 5 | **unknown** — [W:6](#quote-live). Human document value is not an Opus verbosity knob. | **conditional** — [T:76](#quote-toutput). Opus 5 only: skeleton/output bounds exist, but no per-model concision instruction. | **conditional** — [D:210](#quote-brief). Opus 5 only: BRIEF and schema bounds exist; BRIEF is not the Claude mechanism and is omitted for schemas. | stated — this is explicitly about user-facing response length |
| C48 Phrase the desired behaviour positively; retain unavoidable hard guardrails with a positive target | **partial** — [K:18](#quote-framing). Pairs do-not-add-text with missing-framing repair; other rules use strong negation without a general positive-wording discipline. | **partial** — [T:45](#quote-tterms). Gives positive diagnostic questions alongside a prohibition; not every prohibition has that treatment. | **partial** — [D:302](#quote-one). Positive TASK/CHECK/RETURN and naming examples coexist with bans; no universal pairing rule. | plausible — a concrete action is easier to follow than an isolated ban |
| C49 Match prompt style to desired output when formatting steering fails | **unknown** — [S:265](#quote-content_scope). No model response-format steering layer. | **not located** — [T:76](#quote-toutput). Defines the output separately; no observed-style-failure repair rule. | **not located** — [O:152](#quote-strict). Provides a literal schema; no instruction to imitate prompt prose style when steering fails. | unknown — prompt-to-output style contagion is the mechanism |
| C50 Avoid final assistant prefills on models whose API rejects them | **unknown** — [S:265](#quote-content_scope). No assistant-message API layer. | **unknown** — [A:13](#quote-auditorder). No assistant-prefill API calls in the target texts. | **unknown** — [O:152](#quote-strict). C uses schemas, not assistant prefills; no prefill API is needed. | unknown — API mechanism |
| C51 Request schema conformance rather than migrating formatting through prefills | **unknown** — [S:265](#quote-content_scope). Human content rules do not need a response schema. | **partial** — [T:76](#quote-toutput). Defines an output contract in prose, not a parsed JSON response schema. | **present** — [O:152](#quote-strict). Strict JSON Schema, required properties and no extra properties. | unknown — API/output protocol mechanism |
| C52 Explicitly identify the tool action when tool use is required | **partial** — [S:294](#quote-fenced). Requires exact runnable commands where a command belongs. | **present** — [R:96](#quote-rchecks). Names commands for each required mechanical check. | **partial** — [D:205](#quote-expect). EXPECT checks that a required command ran; body does not explicitly distinguish tool-action requests from advice. | plausible — naming the necessary instrument removes procedural ambiguity |
| C53 Batch independent tool calls; do dependent work sequentially | **unknown** — [S:265](#quote-content_scope). No tool scheduling layer. | **partial** — [R:104](#quote-rdispatch). Independent critics launch as a wave before dedup; does not state the general tool-call independence test. | **not located** — [D:296](#quote-shape). Scoped brief/return/verification sections do not specify tool-call batching. | unknown — tool scheduler behaviour |
| C54 Replace blanket tool defaults with task-relevant use when Opus 4.6 over-explores | **unknown** — [S:265](#quote-content_scope). No tool-selection policy. | **conditional** — [R:18](#quote-rbranches). Opus 4.6 only: routes by available inputs, but has no over-exploration tool policy. | **conditional** — [D:205](#quote-expect). Opus 4.6 only: EXPECT is conditional on required evidence; no blanket tool default in scope. | unknown — model tool-selection behaviour |
| C55 Use adaptive instead of extended thinking where evaluations favour it | **unknown** — [S:265](#quote-content_scope). No thinking API. | **unknown** — [R:104](#quote-rdispatch). Model selection does not select thinking API modes. | **unknown** — [D:208](#quote-effort). EFFORT is a separate control; no adaptive-versus-extended Claude API contract. | unknown — thinking API mechanism |
| C56 When thinking is disabled, consider manual step-by-step reasoning prompting | **unknown** — [S:265](#quote-content_scope). Not a reasoning-mode control. | **unknown** — [A:13](#quote-auditorder). Numbered workflow steps are not chain-of-thought prompting. | **not located** — [D:208](#quote-effort). EFFORT exists, but no thinking-disabled fallback instruction in scope. | unknown — model thinking mode |
| C57 When the harness compacts reliably, do not stop just because the context is nearly full | **unknown** — [S:265](#quote-content_scope). No model context state. | **partial** — [R:18](#quote-rbranches). Resumption reuses saved rounds/inputs; does not promise automatic compaction. | **partial** — [O:134](#quote-resume). Continues a cut thread once where work remains, not indefinite automatic compaction. | unknown — context-management mechanism |
| C58 Delegate independent/context-isolated work; keep dependent simple work local | **unknown** — [S:265](#quote-content_scope). Content rules do not assign agents. | **partial** — [R:104](#quote-rdispatch). Critics have independent lenses and dedup follows them; routine work still mandates a sizable fan-out unless declined. | **partial** — [O:118](#quote-split). Critiques decomposition for lost work and rights; does not state the independent-versus-simple local-work test in the scoped sections. | plausible — independent responsibilities avoid coordination overhead |
| C59 Use separate calls when intermediate inspection or a mandated pipeline matters | **unknown** — [S:265](#quote-content_scope). Content rules do not define call boundaries. | **present** — [T:82](#quote-thandoff). Skeleton is handed over and agreed before rewrite starts. | **present** — [O:127](#quote-crossreview). Bounded fix/cross-review rounds with recorded evidence and escalation. | plausible — inspecting an intermediate artifact can catch errors before the next stage |
| C60 Limit changes and tests to requested or necessary work | **partial** — [W:6](#quote-live). Requires value per sentence, not a coding change-scope rule. | **conditional** — [R:110](#quote-rverify). Named Claude models only: routes findings outside prose back to their owners rather than quietly changing code. | **conditional** — [O:143](#quote-returnscope). Named Claude models only: a verifier brief names its whole scope; no rule separates required coding changes/tests from unrelated extras. | plausible — scope limits protect the requester from unrelated changes |
| C61 Open the relevant source before making code claims | **partial** — [W:6](#quote-live). Permits contracts/reasons code cannot state but does not itself require code inspection. | **present** — [A:62](#quote-evidencelevels). Distinguishes line existence, code reading and execution. | **present** — [O:119](#quote-assembly). Checks quoted claims against their sources before fan-out. | plausible — inspecting evidence avoids confident secondhand errors |
| C62 Provide crop/zoom tools for image tasks | **unknown** — [S:265](#quote-content_scope). No image analysis task in the content rules. | **conditional** — [A:85](#quote-readers). Named models/image tasks only: target readers use markdown; no image zoom mechanism expected. | **conditional** — [D:296](#quote-shape). Named models/image tasks only: no vision capability contract in the scoped prompt sections. | unknown — model visual-tool capability |
| C63 Audit progress and completion claims against actual tool results from this session | **unknown** — [S:265](#quote-content_scope). Document content rules are not progress-report execution rules. | **conditional** — [R:110](#quote-rverify). Fable only: findings carry checks and are verified; no explicit per-status-claim/session linkage. | **conditional** — [O:148](#quote-returnevidence). Fable only: evidence requires commands/counts; exact linkage from each result claim to its current-session tool result is not explicit. | stated — the experiment concerns status reports people receive |
| C64 State permitted and prohibited actions where the model may act unasked | **unknown** — [W:21](#quote-safeguard). Document decision safeguards do not grant agent runtime permissions. | **conditional** — [A:40](#quote-nowrite). Fable only: audit explicitly forbids writes to the audited repository. | **conditional** — [D:201](#quote-rights). Fable only: rights and writable roots explicitly constrain action. | plausible — explicit authorisation prevents scope misunderstandings |
| C65 Do not request reproduction of internal reasoning as response text | **unknown** — [S:265](#quote-content_scope). Human content rules have no hidden-reasoning mechanism. | **conditional** — [T:76](#quote-toutput). Fable only: asks for decisions and evidence, not an internal-reasoning transcript. | **conditional** — [O:146](#quote-return). Fable only: result/evidence contract asks for work and checks, not a hidden-reasoning transcript. | unknown — hidden-reasoning API policy |
| C66 Specify the state that compaction summaries must preserve | **unknown** — [S:265](#quote-content_scope). No compaction mechanism. | **conditional** — [R:157](#quote-rstate). Fable 5.1 only: external skeleton/round artifacts retain decisions; no compaction-summary contract. | **conditional** — [O:134](#quote-resume). Fable 5.1 only: resumes a thread; does not name a compaction-state payload. | unknown — model context-management mechanism |
| C67 Reserve enough output allowance for high-effort long results | **unknown** — [W:25](#quote-counts). Human sentence-length review is not a token allowance. | **conditional** — [T:76](#quote-toutput). Fable 5.1 only: output contents are named, but token allowance is not configured. | **conditional** — [D:210](#quote-brief). Fable 5.1 only: avoids BRIEF with schemas, but the generic return still has a 30-line result cap. | unknown — model output-token allowance |
| C68 For observed shallow complex reasoning raise effort before adding prompt scaffolding | **unknown** — [S:265](#quote-content_scope). No reasoning effort setting. | **conditional** — [R:104](#quote-rdispatch). Named models only: selects execution models, not a shallow-reasoning effort remedy. | **conditional** — [D:208](#quote-effort). Named models only: EFFORT exists for Codex; this is not evidence it fixes those Claude cases. | unknown — model effort control |
| C69 State explicitly when an instruction must cover every item | **partial** — [W:21](#quote-safeguard). Names independently read decision points; no general all-items scope rule. | **conditional** — [A:52](#quote-ledger). Opus 4.8 only: every behavioural sentence becomes a ledger entry. | **conditional** — [O:143](#quote-returnscope). Opus 4.8 only: verifier brief must name its whole scope and report what it did not cover. | plausible — explicit scope prevents a human reader applying a rule to just the example |
| C70 In a review-before-filter pipeline report every issue, including uncertain/low-severity ones | **unknown** — [S:265](#quote-content_scope). Not an issue-review/filter pipeline. | **conditional** — [R:110](#quote-rverify). Opus 4.8 only: preserves critic reports but discards findings without a check at verification. | **conditional** — [O:120](#quote-adversarial). Opus 4.8 only: correctness findings enter result and others open, preserving some concerns rather than treating all as defects. | plausible — a later decision-maker cannot assess omitted concerns |
| C71 Compare observed thinking length rather than effort labels when benchmarking models | **unknown** — [S:265](#quote-content_scope). No model benchmark procedure. | **conditional** — [R:60](#quote-rperm). Sonnet 5 only: announces unknown writer/judge costs; does not match thinking lengths. | **conditional** — [D:208](#quote-effort). Sonnet 5 only: labels are exposed but no cross-model benchmark protocol is specified. | unknown — model benchmark resource matching |
| C72 Spend human cognitive effort where human judgment matters | **present** — [W:21](#quote-safeguard). Keeps conditions and warnings at the reader’s decisions despite word cost. | **present** — [T:17](#quote-tstop). Reserves skeleton choice for the person before writing proceeds. | **present** — [D:318](#quote-user). Translates mechanism into prose while retaining the rights decision the user must approve. | stated — S3 explicitly discusses human cognitive load and agency |
| C73 Co-locate a concept’s definition, rules and caveats under a useful heading | **partial** — [W:15](#quote-firstdef). Defines at first need and protects decision warnings, without an explicit co-location instruction. | **partial** — [R:167](#quote-rpreserve). Safeguards are repeated at the end, after the relevant checks; some reading requires jumping. | **present** — [D:196](#quote-header). Values, defaults and setting conditions share each header row. | plausible — adjacent qualifications reduce incomplete readings |
| C74 First sharpen a vague completion bound; hide later steps across a real context boundary only if rushing persists | **unknown** — [S:265](#quote-content_scope). Content rules do not manage separate model contexts. | **partial** — [T:82](#quote-thandoff). Separate named skills and handoff exist, but do not promise a fresh context or observed-rushing test. | **partial** — [D:302](#quote-one). One deliverable per agent can isolate scope; does not specify the diagnose/sharpen/hide sequence. | unknown — attention/legwork effect is claimed for agents |
| C75 Use stable leading words as compact behavioural and retrieval anchors | **conditional** — [S:286](#quote-vocab). Requires vocabulary to match the reader/claim; explicitly reserves internal jargon for agent readers. | **partial** — [R:115](#quote-rregress). Uses stable labels such as regressions and ledger with definitions; does not instruct latent shorthand to replace explicit contracts. | **partial** — [D:296](#quote-shape). TASK/CHECK/RETURN are stable explicit labels; no reliance on undefined pretrained behaviour. | unknown — latent model-prior recruitment is the claimed mechanism |
| C76 Prefer established words and clearly define coined terms | **present** — [W:15](#quote-firstdef). Defines where first needed and requires vocabulary to agree with the claim. | **present** — [T:45](#quote-tterms). Checks domain meaning rather than inheriting internal vocabulary. | **present** — [D:318](#quote-user). Uses ordinary user words and model names instead of slugs/internal machinery. | plausible — familiar terms reduce unexplained vocabulary |
| C77 Keep each meaning in one authoritative place and remove duplicated meaning | **contradicts** — [W:21](#quote-safeguard). Requires repeated meaning at independently read decisions under the same human-document condition. | **contradicts** — [R:167](#quote-rpreserve). Explicitly repeats the safeguards and preserves decision-point repetition; duplicated meaning is intentional. | **partial** — [D:310](#quote-standing). Suppresses duplicate standing rules, but repeats the five-field/first-line contract for independently read sections. | plausible — one authority reduces inconsistent updates |
| C78 Avoid restating discoverable environment facts except when lookup is expensive; preserve undiscoverable reasons | **partial** — [W:6](#quote-live). Keeps contracts, constraints and reasons code cannot state; does not use cheap environment lookup as a deletion criterion. | **conditional** — [A:85](#quote-readers). Source assumes accessible environment facts; target explicitly restricts readers to markdown and forbids source access. Under that condition facts must remain in text. | **partial** — [D:196](#quote-header). Restates parser grammar and defaults in the prompt contract; lookup expense is not given as its justification. | unknown — assumes an agent can inspect the environment directly |
| C79 If a leading word does not beat defaults, intensify the word instead of changing technique | **not located** — [W:6](#quote-live). Requires informational value, not stronger adjectives. | **not located** — [R:115](#quote-rregress). Measures false/overstated claims; does not intensify exhortations. | **not located** — [D:296](#quote-shape). Uses concrete ground truth instead of lexical escalation. | unknown — model activation is the proposed mechanism |
| C80 For needed autonomous discovery keep a model-facing description and allow model invocation | **unknown** — [S:265](#quote-content_scope). No skill invocation metadata. | **conditional** — [A:4](#quote-adesc). All three are user-invoked; autonomous discovery is intentionally disabled. | **unknown** — [D:296](#quote-shape). Task briefs are not the invocation frontmatter of a skill. | unknown — human invocation availability does not establish a prose comprehension benefit |
| C81 Use user-only invocation for manual skills and make its description a short human summary without triggers | **unknown** — [S:265](#quote-content_scope). No invocation metadata. | **partial** — [T:4](#quote-tdesc). All three disable model invocation, but rethink still says Use when and descriptions are multiline. | **unknown** — [D:296](#quote-shape). The scoped sections define delegated brief/return shape, not skill frontmatter. | stated — description and recall burden are explicitly human-facing |
| C82 Use a model-invoked all-reference skill as a shared reference home | **unknown** — [S:265](#quote-content_scope). No skill invocation graph. | **unknown** — [A:4](#quote-adesc). All three are user-invoked and use ordinary links; no reference skill needs auto-invocation. | **unknown** — [D:296](#quote-shape). No all-reference skill invocation mechanism in scope. | unknown — model skill invocation is the mechanism |
| C83 Share reference used by user-only skills through ordinary files, not cross-invocation | **unknown** — [S:265](#quote-content_scope). No user-invoked skill graph. | **present** — [R:34](#quote-rbrief). rewrite reads ordinary audit/rewrite reference files without invoking audit. | **unknown** — [D:296](#quote-shape). Prompt sections are not sharing user-only skill invocations. | plausible — one linked reference avoids inaccessible duplicate procedures |
| C84 Create a separately invocable skill only when independent reach earns its description cost | **unknown** — [S:265](#quote-content_scope). No skill packaging decision. | **conditional** — [T:4](#quote-tdesc). The separate skills serve distinct user decisions, not separately model-triggered discovery. | **unknown** — [D:302](#quote-one). Splits agent deliverables, not skill descriptions. | unknown — agent discovery/context-cost tradeoff |
| C85 Offer a human-invoked router when people cannot remember their user-only skills | **unknown** — [S:265](#quote-content_scope). No skill menu/router mechanism. | **partial** — [R:18](#quote-rbranches). rewrite names audit/rethink if inputs are absent, but no dedicated router or observed recall criterion. | **unknown** — [D:296](#quote-shape). Delegated prompt contract has no user skill menu. | stated — human memory/discovery is the explicit problem |

## Pinned citation ledger — every target line opened with sed and quoted

<a id="quote-live"></a>

**W:6–7** — `plugins/terse/skills/rewrite/references/writing-rules.md` at `8c041b7`.

```sh
sed -n '6,7p' '$TMPDIR/astra-p1-map-2026-09-22/pinned/plugins/terse/skills/rewrite/references/writing-rules.md'
```

````text
Default: no sentence that carries nothing. One earns its place by carrying a
contract, a constraint, or a reason the code cannot state.
````

<a id="quote-reason"></a>

**W:9–10** — `plugins/terse/skills/rewrite/references/writing-rules.md` at `8c041b7`.

```sh
sed -n '9,10p' '$TMPDIR/astra-p1-map-2026-09-22/pinned/plugins/terse/skills/rewrite/references/writing-rules.md'
```

````text
Cut first: the argument for an instruction, restated wherever the instruction
appears. Give the instruction; the case for it lives in one place.
````

<a id="quote-firstdef"></a>

**W:15–16** — `plugins/terse/skills/rewrite/references/writing-rules.md` at `8c041b7`.

```sh
sed -n '15,16p' '$TMPDIR/astra-p1-map-2026-09-22/pinned/plugins/terse/skills/rewrite/references/writing-rules.md'
```

````text
Define a term where the reader first needs it, not before. A page does not open
with a glossary.
````

<a id="quote-purpose"></a>

**W:18–19** — `plugins/terse/skills/rewrite/references/writing-rules.md` at `8c041b7`.

```sh
sed -n '18,19p' '$TMPDIR/astra-p1-map-2026-09-22/pinned/plugins/terse/skills/rewrite/references/writing-rules.md'
```

````text
A document states its purpose once, at the top, in the reader's words. That is not
the argument for an instruction, and it is not cut.
````

<a id="quote-safeguard"></a>

**W:21–23** — `plugins/terse/skills/rewrite/references/writing-rules.md` at `8c041b7`.

```sh
sed -n '21,23p' '$TMPDIR/astra-p1-map-2026-09-22/pinned/plugins/terse/skills/rewrite/references/writing-rules.md'
```

````text
Never cut a condition, a limit or a warning where a reader decides. Repetition at
an independently read decision point is not redundancy. A dated measurement keeps
its date and its numbers, including ones the code has since changed.
````

<a id="quote-counts"></a>

**W:25–25** — `plugins/terse/skills/rewrite/references/writing-rules.md` at `8c041b7`.

```sh
sed -n '25,25p' '$TMPDIR/astra-p1-map-2026-09-22/pinned/plugins/terse/skills/rewrite/references/writing-rules.md'
```

````text
Counts - sentence length, repeated phrases - prompt a review. They are not gates.
````

<a id="quote-fixed"></a>

**W:3–4** — `plugins/terse/skills/rewrite/references/writing-rules.md` at `8c041b7`.

```sh
sed -n '3,4p' '$TMPDIR/astra-p1-map-2026-09-22/pinned/plugins/terse/skills/rewrite/references/writing-rules.md'
```

````text
Part two of the four-part chain. The text below is fixed. Apply it as written; do not restate it in
your own words, and do not extend it with rules you like better. It was measured in this form.
````

<a id="quote-modelcheck"></a>

**W:44–47** — `plugins/terse/skills/rewrite/references/writing-rules.md` at `8c041b7`.

```sh
sed -n '44,47p' '$TMPDIR/astra-p1-map-2026-09-22/pinned/plugins/terse/skills/rewrite/references/writing-rules.md'
```

````text
These rules were themselves written against models as they behaved in September 2026. Anthropic's own
guidance now warns that anti-formatting instructions written for earlier models push newer ones the wrong
way, and the mechanism applies here: a rule aimed at a failure the model no longer has becomes a rule
that causes one. Re-check them against the model in front of you before treating them as fixed.
````

<a id="quote-nolinters"></a>

**W:49–51** — `plugins/terse/skills/rewrite/references/writing-rules.md` at `8c041b7`.

```sh
sed -n '49,51p' '$TMPDIR/astra-p1-map-2026-09-22/pinned/plugins/terse/skills/rewrite/references/writing-rules.md'
```

````text
Already rejected on that evidence, so do not reach for them here: Diataxis or a house style guide as a
mandatory pass; a hard word limit per sentence; a prose linter (Vale, textlint, proselint); a
punctuation gate in CI.
````

<a id="quote-prereq"></a>

**K:11–16** — `plugins/terse/skills/rewrite/references/curse-of-knowledge.md` at `8c041b7`.

```sh
sed -n '11,16p' '$TMPDIR/astra-p1-map-2026-09-22/pinned/plugins/terse/skills/rewrite/references/curse-of-knowledge.md'
```

````text
  1. Inventory the invisible prerequisites: what must a reader already know for this to make sense -
     vocabulary, mental model, context, prior steps. The items you almost did not list are the curse.
  2. Rebuild from the reader's actual state, not yours minus a bit: what do they see first, what will
     they try first.
  3. Write to the failure point: wherever a non-knower stalled, that is where the melody was playing
     silently in your head.
````

<a id="quote-framing"></a>

**K:18–20** — `plugins/terse/skills/rewrite/references/curse-of-knowledge.md` at `8c041b7`.

```sh
sed -n '18,20p' '$TMPDIR/astra-p1-map-2026-09-22/pinned/plugins/terse/skills/rewrite/references/curse-of-knowledge.md'
```

````text
Its own warnings: do not fix by adding more text, because the curse hides missing framing rather than
missing detail, and one sentence of "what this is and when you need it" beats three paragraphs of how.
Every "obviously", "simply" or "just" hides a prerequisite.
````

<a id="quote-realexamples"></a>

**K:33–34** — `plugins/terse/skills/rewrite/references/curse-of-knowledge.md` at `8c041b7`.

```sh
sed -n '33,34p' '$TMPDIR/astra-p1-map-2026-09-22/pinned/plugins/terse/skills/rewrite/references/curse-of-knowledge.md'
```

````text
- **Two installations.** The host tool being installed does not establish that the second one is
  installed and authenticated. Name both, and the language runtime, in the first setup paragraph.
````

<a id="quote-content_scope"></a>

**S:265–268** — `plugins/terse/skills/rethink/references/stages.md` at `8c041b7`.

```sh
sed -n '265,268p' '$TMPDIR/astra-p1-map-2026-09-22/pinned/plugins/terse/skills/rethink/references/stages.md'
```

````text
Derived from what one owner changed on one document, on 2026-09-11 and 12, not from a standard. They are
that owner's rules and the calibration target for their next document; another owner's are learned the
same way, and none of them is a law of the genre. They are about content and order; the rules about
sentences are in [writing-rules.md](../../rewrite/references/writing-rules.md) and are a different layer.
````

<a id="quote-problem"></a>

**S:270–272** — `plugins/terse/skills/rethink/references/stages.md` at `8c041b7`.

```sh
sed -n '270,272p' '$TMPDIR/astra-p1-map-2026-09-22/pinned/plugins/terse/skills/rethink/references/stages.md'
```

````text
1. **Open with the problem and the goal.** What is this for, what is it trying to achieve. The project's
   own purpose — parity between a delegated seat and a native one — was absent from a ten-section draft
   about it.
````

<a id="quote-detail"></a>

**S:275–276** — `plugins/terse/skills/rethink/references/stages.md` at `8c041b7`.

```sh
sed -n '275,276p' '$TMPDIR/astra-p1-map-2026-09-22/pinned/plugins/terse/skills/rethink/references/stages.md'
```

````text
3. **Technical detail lives in one section of its own, below the middle.** Whoever reaches it came for
   it. Spread through the early sections it reads as a warning notice.
````

<a id="quote-prereqexception"></a>

**S:277–279** — `plugins/terse/skills/rethink/references/stages.md` at `8c041b7`.

```sh
sed -n '277,279p' '$TMPDIR/astra-p1-map-2026-09-22/pinned/plugins/terse/skills/rethink/references/stages.md'
```

````text
4. **A prerequisite that is satisfied on nearly every machine is noise — unless the document depends on
   it elsewhere.** `PATH` and credential files went; the runtime version and the wrapped tool's version
   came back when the survey showed the upgrade warning is unactionable without them.
````

<a id="quote-copycmd"></a>

**S:280–281** — `plugins/terse/skills/rethink/references/stages.md` at `8c041b7`.

```sh
sed -n '280,281p' '$TMPDIR/astra-p1-map-2026-09-22/pinned/plugins/terse/skills/rethink/references/stages.md'
```

````text
5. **Install is a block to copy, immediately.** This is the one thing in the rejected draft the owner
   said he liked.
````

<a id="quote-update"></a>

**S:282–283** — `plugins/terse/skills/rethink/references/stages.md` at `8c041b7`.

```sh
sed -n '282,283p' '$TMPDIR/astra-p1-map-2026-09-22/pinned/plugins/terse/skills/rethink/references/stages.md'
```

````text
6. **Update gets the same block, in the same form.** A document that says how to start and not how to
   move forward is half a document.
````

<a id="quote-noinvent"></a>

**S:284–285** — `plugins/terse/skills/rethink/references/stages.md` at `8c041b7`.

```sh
sed -n '284,285p' '$TMPDIR/astra-p1-map-2026-09-22/pinned/plugins/terse/skills/rethink/references/stages.md'
```

````text
7. **No invented examples.** A fabricated file path in a sample command is water; use something real or
   nothing.
````

<a id="quote-vocab"></a>

**S:286–289** — `plugins/terse/skills/rethink/references/stages.md` at `8c041b7`.

```sh
sed -n '286,289p' '$TMPDIR/astra-p1-map-2026-09-22/pinned/plugins/terse/skills/rethink/references/stages.md'
```

````text
8. **The vocabulary has to agree with the claim.** A document arguing that a delegated agent is the
   equal of a native one, while calling it by a different word throughout, denies its own thesis in
   every sentence. Internal jargon — a skill's name, a term the reference files use — is for readers who
   are agents. Where the reader is a person, the word that names the claim is the word to use.
````

<a id="quote-table"></a>

**S:290–293** — `plugins/terse/skills/rethink/references/stages.md` at `8c041b7`.

```sh
sed -n '290,293p' '$TMPDIR/astra-p1-map-2026-09-22/pinned/plugins/terse/skills/rethink/references/stages.md'
```

````text
9. **Where a section states a comparison whose rows differ, a table beats prose.** The claim is either
   visible in the rows or it is not true, and a reader checks a table in seconds and an argument in
   paragraphs. A table whose rows all say the same thing proves sameness by looking identical, and the
   one built for this document was cut for exactly that.
````

<a id="quote-fenced"></a>

**S:294–298** — `plugins/terse/skills/rethink/references/stages.md` at `8c041b7`.

```sh
sed -n '294,298p' '$TMPDIR/astra-p1-map-2026-09-22/pinned/plugins/terse/skills/rethink/references/stages.md'
```

````text
10. **A command goes in a fenced block, with a language, in the form that runs.** Not prose around it,
    not the in-application shorthand. `/plugin install …` works only for a reader already inside Claude
    Code; `claude plugin install …` works for the reader arriving at the page. The language tag is not
    decoration: an untagged block is unhighlighted, and highlighting is what makes a command legible as
    a command rather than as a quotation.
````

<a id="quote-caveat"></a>

**S:299–302** — `plugins/terse/skills/rethink/references/stages.md` at `8c041b7`.

```sh
sed -n '299,302p' '$TMPDIR/astra-p1-map-2026-09-22/pinned/plugins/terse/skills/rethink/references/stages.md'
```

````text
11. **A qualification is not a fix.** A sentence that needs a caveat to be true says too much: say less, or
    link the source that carries the detail. Five rounds of one document added caveats to make sentences
    truer and each caveat was contradicted by a finer detail of the code — regressions rose from one to
    ten. The owner named it: an *оговорка* is an anti-pattern.
````

<a id="quote-adesc"></a>

**A:4–7** — `plugins/terse/skills/audit/SKILL.md` at `8c041b7`.

```sh
sed -n '4,7p' '$TMPDIR/astra-p1-map-2026-09-22/pinned/plugins/terse/skills/audit/SKILL.md'
```

````text
  Measures a document against two rulers: whether fresh readers get the right answer, and whether every
  claim about behaviour is true of the code. Returns a reader profile, a claim ledger, reader scores and
  the list of what broke. It never proposes wording; `rewrite` does that.
disable-model-invocation: true
````

<a id="quote-tdesc"></a>

**T:4–7** — `plugins/terse/skills/rethink/SKILL.md` at `8c041b7`.

```sh
sed -n '4,7p' '$TMPDIR/astra-p1-map-2026-09-22/pinned/plugins/terse/skills/rethink/SKILL.md'
```

````text
  Decides what a document should be before a sentence of it is written: what comparable documents already
  solved, what things are called, and what is said in what order. Returns a skeleton and stops there —
  the writing is `rewrite`'s. Use when a document's shape is wrong, or when starting one.
disable-model-invocation: true
````

<a id="quote-rdesc"></a>

**R:4–8** — `plugins/terse/skills/rewrite/SKILL.md` at `8c041b7`.

```sh
sed -n '4,8p' '$TMPDIR/astra-p1-map-2026-09-22/pinned/plugins/terse/skills/rewrite/SKILL.md'
```

````text
  Writes the text in rounds: one candidate, then critics with lenses that differ, then edits declared
  with the check behind each, until the owner reads a round and says whether they would send it as it
  is. Starts from a skeleton `rethink` agreed, or from the failures an `audit` measured. Proposes; writes
  into your tree only on your word.
disable-model-invocation: true
````

<a id="quote-auditorder"></a>

**A:13–16** — `plugins/terse/skills/audit/SKILL.md` at `8c041b7`.

```sh
sed -n '13,16p' '$TMPDIR/astra-p1-map-2026-09-22/pinned/plugins/terse/skills/audit/SKILL.md'
```

````text
An audit here is a measurement, not an opinion. You run seven steps in order, and the order carries the
method: the profile decides which questions are worth asking, the code decides what the right answers
are, and both exist before the first reader is spawned. A reader sent out before the answer key is
written measures the text against your memory of it, and your memory has already read the code.
````

<a id="quote-scope"></a>

**A:23–28** — `plugins/terse/skills/audit/SKILL.md` at `8c041b7`.

```sh
sed -n '23,28p' '$TMPDIR/astra-p1-map-2026-09-22/pinned/plugins/terse/skills/audit/SKILL.md'
```

````text
Settle three things with the user in one exchange, not six:

- Which files are the documentation. Default to every tracked `.md`.
- Which repository backs them, if any. Text with no code behind it still gets audited; the truth pass
  runs in its weaker form, described in [truth-pass.md](references/truth-pass.md).
- Where a reader arrives. Usually `README.md`. This is the entry file for every reader.
````

<a id="quote-nowrite"></a>

**A:40–40** — `plugins/terse/skills/audit/SKILL.md` at `8c041b7`.

```sh
sed -n '40,40p' '$TMPDIR/astra-p1-map-2026-09-22/pinned/plugins/terse/skills/audit/SKILL.md'
```

````text
Write nothing into the audited repository. Not a report, not a note, not a fix.
````

<a id="quote-profile"></a>

**A:44–45** — `plugins/terse/skills/audit/SKILL.md` at `8c041b7`.

```sh
sed -n '44,45p' '$TMPDIR/astra-p1-map-2026-09-22/pinned/plugins/terse/skills/audit/SKILL.md'
```

````text
Build it from the repository and from the user's own words, following
[reader-profile.md](references/reader-profile.md). Show it and ask for corrections before Step 3.
````

<a id="quote-ledger"></a>

**A:52–55** — `plugins/terse/skills/audit/SKILL.md` at `8c041b7`.

```sh
sed -n '52,55p' '$TMPDIR/astra-p1-map-2026-09-22/pinned/plugins/terse/skills/audit/SKILL.md'
```

````text
Every sentence that states what the software does becomes one ledger entry: the claim, the doc line,
the code that backs it, an evidence level and a verdict. Follow
[truth-pass.md](references/truth-pass.md) for the levels, the rule on guarantee words, and the three
verdicts. Use the entry format in [ledgers.md](references/ledgers.md).
````

<a id="quote-evidencelevels"></a>

**A:62–63** — `plugins/terse/skills/audit/SKILL.md` at `8c041b7`.

```sh
sed -n '62,63p' '$TMPDIR/astra-p1-map-2026-09-22/pinned/plugins/terse/skills/audit/SKILL.md'
```

````text
- A citation that resolves proves only that a line exists. Reading the code proves what it says.
  Running it proves what it does. Do not report the first as the third.
````

<a id="quote-controls"></a>

**A:73–74** — `plugins/terse/skills/audit/SKILL.md` at `8c041b7`.

```sh
sed -n '73,74p' '$TMPDIR/astra-p1-map-2026-09-22/pinned/plugins/terse/skills/audit/SKILL.md'
```

````text
At least two of the questions must be ones the current text answers correctly. These are the controls.
Without them a later rewrite can raise the score by breaking something nobody asked about.
````

<a id="quote-unanswerable"></a>

**A:76–78** — `plugins/terse/skills/audit/SKILL.md` at `8c041b7`.

```sh
sed -n '76,78p' '$TMPDIR/astra-p1-map-2026-09-22/pinned/plugins/terse/skills/audit/SKILL.md'
```

````text
Plant at least one question the documentation genuinely does not answer, and record it as unanswerable in
the key. A confident answer to it is a failure, and it is the only thing that separates a reader who read
from a reader who knew. Benchmarks that do this plant about one in ten.
````

<a id="quote-readers"></a>

**A:85–88** — `plugins/terse/skills/audit/SKILL.md` at `8c041b7`.

```sh
sed -n '85,88p' '$TMPDIR/astra-p1-map-2026-09-22/pinned/plugins/terse/skills/audit/SKILL.md'
```

````text
One fresh reader per question, per [measure.md](references/measure.md). Each one starts at the entry
file, may open only `.md` files, may not read source, and may not see another reader's work. It returns
its answer, the files it opened, how many steps from the entry file it took, and whether it left the
documentation to find out.
````

<a id="quote-baseline"></a>

**A:90–96** — `plugins/terse/skills/audit/SKILL.md` at `8c041b7`.

```sh
sed -n '90,96p' '$TMPDIR/astra-p1-map-2026-09-22/pinned/plugins/terse/skills/audit/SKILL.md'
```

````text
**The baseline measurement runs a second arm with no documentation at all**: the same questions, the same
model, no files. Its score is what a reader already knew, and the number this audit reports is the
difference between the two. A raw score without that arm cannot tell a document that teaches from a
document that is merely about something the reader has seen before; the two published benchmarks that ran
this arm found the effect large enough to swallow a result our size. It doubles the reader agents, so it
runs once, at the baseline. A re-measurement after a rewrite reuses the same no-document score and does
not pay again.
````

<a id="quote-task"></a>

**A:105–112** — `plugins/terse/skills/audit/SKILL.md` at `8c041b7`.

```sh
sed -n '105,112p' '$TMPDIR/astra-p1-map-2026-09-22/pinned/plugins/terse/skills/audit/SKILL.md'
```

````text
Beside the question readers, two readers carrying a task: a starting state and an outcome they want,
acting from the documentation alone, with no answer key and no source. Check the state they produce, not
what they say. It is the only evidence at level 3 an audit makes, and it finds the failure a question
cannot: a recipe whose every sentence is true and whose sequence leaves the reader worse off — measured
on 2026-09-12, "commit or stash first" reverted a reader's tree and showed the agent nothing. Report
beside the result which sections no task reached; a gate that passes everything has described the tasks,
not the document. The readers' forced guesses are the yield: ask for every place the text made them
invent something, and treat a guess that turned out right exactly like one that turned out wrong.
````

<a id="quote-repeat"></a>

**A:139–143** — `plugins/terse/skills/audit/SKILL.md` at `8c041b7`.

```sh
sed -n '139,143p' '$TMPDIR/astra-p1-map-2026-09-22/pinned/plugins/terse/skills/audit/SKILL.md'
```

````text
**Placement is repaired by repetition as often as by relocation.** Written procedure in the field where
a misreading kills settles it this way: state the fact early, and require it again at the point of use.
A local warning belongs immediately before its action; a global one is stated once and repeated locally.
Do not move a fact away from where it is currently read correctly in order to put it where it is also
needed — put it in both places.
````

<a id="quote-baselineceiling"></a>

**A:145–147** — `plugins/terse/skills/audit/SKILL.md` at `8c041b7`.

```sh
sed -n '145,147p' '$TMPDIR/astra-p1-map-2026-09-22/pinned/plugins/terse/skills/audit/SKILL.md'
```

````text
Report the score with its own limits beside it. If the baseline is a perfect score, say so and stop: an
instrument with no room above cannot register an improvement, and a later "the score did not fall" will
mean nothing. A zero can rise; report it and go on.
````

<a id="quote-areturn"></a>

**A:149–151** — `plugins/terse/skills/audit/SKILL.md` at `8c041b7`.

```sh
sed -n '149,151p' '$TMPDIR/astra-p1-map-2026-09-22/pinned/plugins/terse/skills/audit/SKILL.md'
```

````text
Write the run file to `$RUN/audit.md` using the section contract in
[ledgers.md](references/ledgers.md), then report to the user: the score, the failures with their
causes, the refuted claims, and the absolute path. Offer `rewrite` as the next step; do not run it.
````

<a id="quote-arefs"></a>

**A:155–158** — `plugins/terse/skills/audit/SKILL.md` at `8c041b7`.

```sh
sed -n '155,158p' '$TMPDIR/astra-p1-map-2026-09-22/pinned/plugins/terse/skills/audit/SKILL.md'
```

````text
- Building the profile, with a worked example: [reader-profile.md](references/reader-profile.md).
- Evidence levels, guarantee words, verdicts: [truth-pass.md](references/truth-pass.md).
- The reader protocol and re-measurement: [measure.md](references/measure.md).
- Entry formats and the run file contract: [ledgers.md](references/ledgers.md).
````

<a id="quote-tskeleton"></a>

**T:13–15** — `plugins/terse/skills/rethink/SKILL.md` at `8c041b7`.

```sh
sed -n '13,15p' '$TMPDIR/astra-p1-map-2026-09-22/pinned/plugins/terse/skills/rethink/SKILL.md'
```

````text
Three decisions, in order, each cheap to change here and expensive to change later. The output is a
skeleton: section titles, what each is for, what each deliberately leaves out, a word budget, and the
rules that will gate the writing. No prose.
````

<a id="quote-tstop"></a>

**T:17–21** — `plugins/terse/skills/rethink/SKILL.md` at `8c041b7`.

```sh
sed -n '17,21p' '$TMPDIR/astra-p1-map-2026-09-22/pinned/plugins/terse/skills/rethink/SKILL.md'
```

````text
**Then it stops.** Putting a skeleton in front of the person before two thousand words are written
against it is the point, not a courtesy. Measured on 2026-09-11: a ten-section draft written at ordinary
quality was abandoned by its reader at the third section, and nine of his nine objections were about what
the document contained, where it sat, or how much of it there was. None was about phrasing. Every
sentence in it was written against a shape nobody had agreed.
````

<a id="quote-tmethod"></a>

**T:23–23** — `plugins/terse/skills/rethink/SKILL.md` at `8c041b7`.

```sh
sed -n '23,23p' '$TMPDIR/astra-p1-map-2026-09-22/pinned/plugins/terse/skills/rethink/SKILL.md'
```

````text
The method, with the measurements behind each stage: [stages.md](references/stages.md).
````

<a id="quote-tfan"></a>

**T:27–28** — `plugins/terse/skills/rethink/SKILL.md` at `8c041b7`.

```sh
sed -n '27,28p' '$TMPDIR/astra-p1-map-2026-09-22/pinned/plugins/terse/skills/rethink/SKILL.md'
```

````text
A fan-out, not one reader. One agent searching for good examples returns the genre's folklore; six agents
on six slices return a sample.
````

<a id="quote-tpermission"></a>

**T:30–32** — `plugins/terse/skills/rethink/SKILL.md` at `8c041b7`.

```sh
sed -n '30,32p' '$TMPDIR/astra-p1-map-2026-09-22/pinned/plugins/terse/skills/rethink/SKILL.md'
```

````text
Announce the count and the models before spawning, and wait for the user's word. Default slices, one
surveyor each: the exact genre, the same structural position, the most used regardless of genre, vendor
guidance, whatever this document's hard part is, and one slice whose job is what *not* to copy.
````

<a id="quote-tsources"></a>

**T:34–35** — `plugins/terse/skills/rethink/SKILL.md` at `8c041b7`.

```sh
sed -n '34,35p' '$TMPDIR/astra-p1-map-2026-09-22/pinned/plugins/terse/skills/rethink/SKILL.md'
```

````text
Two rules the surveyors carry, both learned by getting them wrong: **fetch, do not recall** — every
document reported carries its URL and its headings in order — and **weight by use, not by taste**.
````

<a id="quote-tterms"></a>

**T:45–47** — `plugins/terse/skills/rethink/SKILL.md` at `8c041b7`.

```sh
sed -n '45,47p' '$TMPDIR/astra-p1-map-2026-09-22/pinned/plugins/terse/skills/rethink/SKILL.md'
```

````text
Do not inherit a project's vocabulary because the project uses it. For each load-bearing term: who parses
it and as what, where it comes from, and whether its commonest sense in the reader's own field is a
different thing.
````

<a id="quote-ttermref"></a>

**T:49–52** — `plugins/terse/skills/rethink/SKILL.md` at `8c041b7`.

```sh
sed -n '49,52p' '$TMPDIR/astra-p1-map-2026-09-22/pinned/plugins/terse/skills/rethink/SKILL.md'
```

````text
Where the document's thesis is that A is like B, call A by B's word. Any other choice is an argument
against the document, made in every sentence. The worked example — a project that called its delegated
agents "seats" while claiming they were the equal of native subagents — is in
[stages.md](references/stages.md#stage-2-the-words-themselves).
````

<a id="quote-tcritics"></a>

**T:59–61** — `plugins/terse/skills/rethink/SKILL.md` at `8c041b7`.

```sh
sed -n '59,61p' '$TMPDIR/astra-p1-map-2026-09-22/pinned/plugins/terse/skills/rethink/SKILL.md'
```

````text
Critics see **all of them at once**, because ranking is the judgement being asked for and it cannot be
made from isolated reviews. Give each critic a different lens and require a fatal flaw for every
structure including the one it ranks first.
````

<a id="quote-tcommon"></a>

**T:63–65** — `plugins/terse/skills/rethink/SKILL.md` at `8c041b7`.

```sh
sed -n '63,65p' '$TMPDIR/astra-p1-map-2026-09-22/pinned/plugins/terse/skills/rethink/SKILL.md'
```

````text
Ask each critic one more thing: what all of them got wrong. That answer is usually worth more than the
ranking — a failure every angle shares is a failure of the brief. On the run this method came from, it
was the three critics' shared answer that found the real defect, and none of the ten proposals had.
````

<a id="quote-toutput"></a>

**T:76–80** — `plugins/terse/skills/rethink/SKILL.md` at `8c041b7`.

```sh
sed -n '76,80p' '$TMPDIR/astra-p1-map-2026-09-22/pinned/plugins/terse/skills/rethink/SKILL.md'
```

````text
- each section: title, one sentence of purpose, what it deliberately excludes, a word budget
- the mechanical rules the writing must pass, written so that passing is a fact rather than an opinion
- the terminology decisions from step 2, including the ones you rejected and why
- what was deleted outright rather than moved, and the stated cost of deleting it
- any edit this structure requires in a file that is not the document
````

<a id="quote-thandoff"></a>

**T:82–83** — `plugins/terse/skills/rethink/SKILL.md` at `8c041b7`.

```sh
sed -n '82,83p' '$TMPDIR/astra-p1-map-2026-09-22/pinned/plugins/terse/skills/rethink/SKILL.md'
```

````text
Then stop and wait. `rewrite` starts from the skeleton the user agreed to, and routes back here anything
it finds that belongs to a stage above it.
````

<a id="quote-rbranches"></a>

**R:18–21** — `plugins/terse/skills/rewrite/SKILL.md` at `8c041b7`.

```sh
sed -n '18,21p' '$TMPDIR/astra-p1-map-2026-09-22/pinned/plugins/terse/skills/rewrite/SKILL.md'
```

````text
| a run directory with rounds in it already — whatever else you have | step 4, at the next round; steps 1 to 3 are not repeated | the last round's review under `reviews/NN/` |
| a skeleton `rethink` agreed | step 2 | the skeleton's purpose, exclusions and budget per section |
| an `audit` run file | step 1 | the named failures, each at its line, with its cause |
| neither | say so, offer `/terse:audit` or `/terse:rethink`; if the user declines both, continue on your own guesses and say so in the report | — |
````

<a id="quote-rbackground"></a>

**R:23–25** — `plugins/terse/skills/rewrite/SKILL.md` at `8c041b7`.

```sh
sed -n '23,25p' '$TMPDIR/astra-p1-map-2026-09-22/pinned/plugins/terse/skills/rewrite/SKILL.md'
```

````text
Why it is rounds and not a pass, and the measurements behind every rule here:
[loop.md](references/loop.md) and [measurements.md](references/measurements.md). Neither is needed to
act; this file is.
````

<a id="quote-rbrief"></a>

**R:34–47** — `plugins/terse/skills/rewrite/SKILL.md` at `8c041b7`.

```sh
sed -n '34,47p' '$TMPDIR/astra-p1-map-2026-09-22/pinned/plugins/terse/skills/rewrite/SKILL.md'
```

````text
Assemble it once, for every writer, in this order; a resumed run does not reassemble it. On the
skeleton route parts 2 and 5 do not exist; say so in the report rather than inventing them.

1. **The skeleton**, if there is one — its purpose, exclusions and budget for the section being written,
   unedited.
2. **Who reads this** — the profile from the run file, unedited.
3. **The writing rules** — [writing-rules.md](references/writing-rules.md), copied in as written.
4. **The curse of knowledge** — [curse-of-knowledge.md](references/curse-of-knowledge.md), likewise.
5. **Where the readers failed** — the entries under *What broke*, each with its line, its cause and its
   quote, plus the passages that worked and must not be damaged.
6. **The accuracy floor**: every statement about behaviour must be true of the code in this checkout,
   and the writer records the level of evidence it reached — the three levels are in
   [truth-pass.md](../audit/references/truth-pass.md#three-levels-of-evidence). A claim about a lifecycle
   (what stays, what is removed, what a continued or retried run sees) at level 2 is a guess: run it.
````

<a id="quote-rcopy"></a>

**R:49–50** — `plugins/terse/skills/rewrite/SKILL.md` at `8c041b7`.

```sh
sed -n '49,50p' '$TMPDIR/astra-p1-map-2026-09-22/pinned/plugins/terse/skills/rewrite/SKILL.md'
```

````text
Copy the fixed parts; do not paraphrase them. The wording a critic receives is in
[bake-off.md](references/bake-off.md); do not write a third.
````

<a id="quote-rfirst"></a>

**R:54–58** — `plugins/terse/skills/rewrite/SKILL.md` at `8c041b7`.

```sh
sed -n '54,58p' '$TMPDIR/astra-p1-map-2026-09-22/pinned/plugins/terse/skills/rewrite/SKILL.md'
```

````text
On a document that already exists, the first thing that runs is the adversarial whole-document read —
lens 3 of step 4's table — with the right to run the code. On the audit route its findings are added
under *What broke*; on the skeleton route they become the first round's edits. Then the bake-off: three writers, one whole candidate each with a different stance, and two judges — the
briefs and the judging sheet, for both routes, are in [bake-off.md](references/bake-off.md). That is the
only bake-off; every round after it edits the round before.
````

<a id="quote-rperm"></a>

**R:60–62** — `plugins/terse/skills/rewrite/SKILL.md` at `8c041b7`.

```sh
sed -n '60,62p' '$TMPDIR/astra-p1-map-2026-09-22/pinned/plugins/terse/skills/rewrite/SKILL.md'
```

````text
Announce before spawning: the count, the models, and that the cost of a writer or a judge has not been
measured (the critics' costs have; see the table). Wait for the user's word. If the user refuses the
fan-out, write one candidate yourself from the same brief and report that the comparison was skipped.
````

<a id="quote-selftest"></a>

**R:74–74** — `plugins/terse/skills/rewrite/SKILL.md` at `8c041b7`.

```sh
sed -n '74,74p' '$TMPDIR/astra-p1-map-2026-09-22/pinned/plugins/terse/skills/rewrite/SKILL.md'
```

````text
node "$S/selftest.mjs"      # once per session: every check against its planted violation
````

<a id="quote-rchecks"></a>

**R:96–103** — `plugins/terse/skills/rewrite/SKILL.md` at `8c041b7`.

```sh
sed -n '96,103p' '$TMPDIR/astra-p1-map-2026-09-22/pinned/plugins/terse/skills/rewrite/SKILL.md'
```

````text
4. **Run the checks**, before any critic, with `R=<NN>-<pass>.md`:
   - `node "$S/rule1.mjs" "$R" --cut "<technical section heading>" --except "<section that may carry paths>"` — the rule that keeps mechanism out of the sections a reader meets first, with the document's own headings;
   - `node "$S/dup.mjs" "$R" concepts.json` — one idea, one home;
   - `node "$S/sections.mjs" "$R" budgets.json` — words per section against the budget, reported, never blocking;
   - `node "$S/ledger.mjs" ledger.json $(ls [0-9][0-9]-*.md | sort)` — the ratchet over every round in order; exit 1 when the new round loses a verified claim or revives a retired phrase.
   A failure the round introduced is fixed before the critics see it: remove the round file, fix
   `edits/NN.json`, regenerate. A failure the previous round already had is a finding for this round's
   edits, not a block. A round is frozen the moment its critics launch, not before.
````

<a id="quote-rdispatch"></a>

**R:104–109** — `plugins/terse/skills/rewrite/SKILL.md` at `8c041b7`.

```sh
sed -n '104,109p' '$TMPDIR/astra-p1-map-2026-09-22/pinned/plugins/terse/skills/rewrite/SKILL.md'
```

````text
5. **Announce the wave** — the lenses, their sizes from the table, the models, the cost — and wait for
   the user's word; the user may size any lens to zero, and the least that still counts as a round is
   lenses 1 and 2. Then **launch the critics**, one agent per lens, with the briefs in
   [critic-briefs.md](references/critic-briefs.md), and the dedup agent over their reports; everything
   they return is kept verbatim under `reviews/NN/`. The Codex lenses need the `entrust` plugin;
   without it, run those lenses on Claude agents and say so.
````

<a id="quote-rverify"></a>

**R:110–114** — `plugins/terse/skills/rewrite/SKILL.md` at `8c041b7`.

```sh
sed -n '110,114p' '$TMPDIR/astra-p1-map-2026-09-22/pinned/plugins/terse/skills/rewrite/SKILL.md'
```

````text
6. **Verify every finding yourself** from the check it carries — a finding without one is discarded —
   and route each by the table in [loop.md](references/loop.md#where-a-finding-goes): a sentence to the
   next round's edits, a boundary or a term back to `rethink`, a code defect to the repository's
   `ISSUES.md`, a question the document does not answer to the user. When a finding routes to stage 3,
   make the structure map loop.md describes before the next round.
````

<a id="quote-rregress"></a>

**R:115–118** — `plugins/terse/skills/rewrite/SKILL.md` at `8c041b7`.

```sh
sed -n '115,118p' '$TMPDIR/astra-p1-map-2026-09-22/pinned/plugins/terse/skills/rewrite/SKILL.md'
```

````text
7. **Record the round** in `rounds.md`, one table row: `| file | words | produced by | findings against
   it | regressions |` — *produced by* names the pass and the wave; *findings* is the dedup's count by
   category; **regressions** is the count of sentences the round introduced that its critics showed
   false or overstated. That number is the round's verdict.
````

<a id="quote-rgates"></a>

**R:137–144** — `plugins/terse/skills/rewrite/SKILL.md` at `8c041b7`.

```sh
sed -n '137,144p' '$TMPDIR/astra-p1-map-2026-09-22/pinned/plugins/terse/skills/rewrite/SKILL.md'
```

````text
Before the user reads a round, three things, none tradeable against another:

- **no regression in the round**: the ledger passes, and no sentence the round introduced was shown
  false or overstated by its critics;
- **the task gate**: lens 4's two readers achieved their goals, and the sections no task reached are
  named;
- **the question readers**: lens 5, one per question, answered from the document; where they guessed is
  listed.
````

<a id="quote-rstop"></a>

**R:146–150** — `plugins/terse/skills/rewrite/SKILL.md` at `8c041b7`.

```sh
sed -n '146,150p' '$TMPDIR/astra-p1-map-2026-09-22/pinned/plugins/terse/skills/rewrite/SKILL.md'
```

````text
**The loop stops when the user reads the round and says whether they would send it as it is.** Two
consecutive rounds with no regression is the signal to hand a round over, not a finish; a cap on rounds
is set in the first announcement, and a cap reached is reported as a result. Hand over the round and
`diff-NN.patch`, the diff against `00-original.md`, written into the run directory. Then stop: applying
the candidate to the user's files needs their word, and a diff they have read is what earns it.
````

<a id="quote-rstate"></a>

**R:157–158** — `plugins/terse/skills/rewrite/SKILL.md` at `8c041b7`.

```sh
sed -n '157,158p' '$TMPDIR/astra-p1-map-2026-09-22/pinned/plugins/terse/skills/rewrite/SKILL.md'
```

````text
- `skeleton.md`, kept current with every decision taken after it was agreed — a section added, a fact
  restored, a budget changed
````

<a id="quote-rpreserve"></a>

**R:167–170** — `plugins/terse/skills/rewrite/SKILL.md` at `8c041b7`.

```sh
sed -n '167,170p' '$TMPDIR/astra-p1-map-2026-09-22/pinned/plugins/terse/skills/rewrite/SKILL.md'
```

````text
The safeguards are the last lines of [writing-rules.md](references/writing-rules.md) and override the
rest of the rules wherever they collide: never cut a condition, a limit or a warning where a reader
decides; repetition at an independently read decision point is not redundancy; a dated measurement
keeps its date and its numbers.
````

<a id="quote-rscripts"></a>

**R:179–179** — `plugins/terse/skills/rewrite/SKILL.md` at `8c041b7`.

```sh
sed -n '179,179p' '$TMPDIR/astra-p1-map-2026-09-22/pinned/plugins/terse/skills/rewrite/SKILL.md'
```

````text
- The checks as scripts with a planted-violation self-test: [scripts/](scripts/).
````

<a id="quote-header"></a>

**D:196–197** — `plugins/entrust/skills/codex/SKILL.md` at `8c041b7`.

```sh
sed -n '196,197p' '$TMPDIR/astra-p1-map-2026-09-22/pinned/plugins/entrust/skills/codex/SKILL.md'
```

````text
The header is the leading run of upper-case `NAME: value` lines at column 0; the body starts at `TASK:` or
at the first line that is not one; a non-field upper-case `NAME:` above it is exit 2 naming it.
````

<a id="quote-rights"></a>

**D:201–201** — `plugins/entrust/skills/codex/SKILL.md` at `8c041b7`.

```sh
sed -n '201,201p' '$TMPDIR/astra-p1-map-2026-09-22/pinned/plugins/entrust/skills/codex/SKILL.md'
```

````text
| `RIGHTS:` | `read [<dir>]`, `worktree <repo>`, `write <dir>` | first, or not at all: no header is a read agent in the current directory |
````

<a id="quote-expect"></a>

**D:205–205** — `plugins/entrust/skills/codex/SKILL.md` at `8c041b7`.

```sh
sed -n '205,205p' '$TMPDIR/astra-p1-map-2026-09-22/pinned/plugins/entrust/skills/codex/SKILL.md'
```

````text
| `EXPECT:` | `<regex>` | the answer is only evidence if a command matching it ran AND succeeded; a matching command that exited non-zero does not count, and none matching is exit 5. Do not point it at a check whose failure IS the finding |
````

<a id="quote-schema"></a>

**D:206–206** — `plugins/entrust/skills/codex/SKILL.md` at `8c041b7`.

```sh
sed -n '206,206p' '$TMPDIR/astra-p1-map-2026-09-22/pinned/plugins/entrust/skills/codex/SKILL.md'
```

````text
| `OUTPUT_SCHEMA:` | `<path to a strict JSON Schema file>` | the answer must parse as one JSON object |
````

<a id="quote-model"></a>

**D:207–207** — `plugins/entrust/skills/codex/SKILL.md` at `8c041b7`.

```sh
sed -n '207,207p' '$TMPDIR/astra-p1-map-2026-09-22/pinned/plugins/entrust/skills/codex/SKILL.md'
```

````text
| `MODEL:` | `<slug>`: `gpt-6-astra` (Astra), `gpt-5.6-sol` (Sol), `gpt-5.6-terra` (Terra), `gpt-5.6-luna` (Luna) | this agent needs a model other than the configured default; the short name is for prose, the slug for this line |
````

<a id="quote-effort"></a>

**D:208–208** — `plugins/entrust/skills/codex/SKILL.md` at `8c041b7`.

```sh
sed -n '208,208p' '$TMPDIR/astra-p1-map-2026-09-22/pinned/plugins/entrust/skills/codex/SKILL.md'
```

````text
| `EFFORT:` | `low`, `medium`, `high`, `xhigh`, `max`; `ultra` on Astra, Sol and Terra (the catalogue of 2026-09-17: `none` and `minimal` are on no model and exit 2 before the turn); no line inherits `~/.codex/config.toml` | the task is worth more or less thinking than the configured default; `low` for a one-line task |
````

<a id="quote-brief"></a>

**D:210–210** — `plugins/entrust/skills/codex/SKILL.md` at `8c041b7`.

```sh
sed -n '210,210p' '$TMPDIR/astra-p1-map-2026-09-22/pinned/plugins/entrust/skills/codex/SKILL.md'
```

````text
| `BRIEF:` | `yes` | a short answer is enough; omit it beside an output schema — it clips only the inline `answer` (`answerJson` is parsed from the whole one) yet still asks the model for 20 lines |
````

<a id="quote-gateowner"></a>

**D:213–216** — `plugins/entrust/skills/codex/SKILL.md` at `8c041b7`.

```sh
sed -n '213,216p' '$TMPDIR/astra-p1-map-2026-09-22/pinned/plugins/entrust/skills/codex/SKILL.md'
```

````text
One field is missing from that table on purpose. `VERIFY` is refused in a prompt file without `--allow-prompt-verify`,
a flag the one call above does not pass: it runs a caller-declared command after the turn, so an agent that could
write its own would be grading itself. Declare gates on the command line instead
([result-gates.md](references/result-gates.md)).
````

<a id="quote-shape"></a>

**D:296–300** — `plugins/entrust/skills/codex/SKILL.md` at `8c041b7`.

```sh
sed -n '296,300p' '$TMPDIR/astra-p1-map-2026-09-22/pinned/plugins/entrust/skills/codex/SKILL.md'
```

````text
Write a concrete, checkable body:

    TASK:   what to do
    CHECK:  the ground truth, preferably something the agent cannot guess
    RETURN: exactly what to hand back
````

<a id="quote-one"></a>

**D:302–308** — `plugins/entrust/skills/codex/SKILL.md` at `8c041b7`.

```sh
sed -n '302,308p' '$TMPDIR/astra-p1-map-2026-09-22/pinned/plugins/entrust/skills/codex/SKILL.md'
```

````text
Give one deliverable per agent. Split a return that asks for unrelated artifacts or decisions. Write `TASK:` in the
user's language: the agent answers in the language it is asked in (measured 2026-09-17: a task written in English
about a Russian «хай» came back in English). Whatever `RETURN:`
asks for, its first line is one sentence a reader can take on its own: the name you gave the agent in the prompt
("you are Codex Terra T1"), its status and what it did. Give the name; the model does not know its short name and
answers with whatever it calls itself (measured 2026-09-17: «GPT-5 Codex, id T1»). That line is what the coordinator
retells, and not itself a message to the user; the rest is the return's own shape.
````

<a id="quote-standing"></a>

**D:310–314** — `plugins/entrust/skills/codex/SKILL.md` at `8c041b7`.

```sh
sed -n '310,314p' '$TMPDIR/astra-p1-map-2026-09-22/pinned/plugins/entrust/skills/codex/SKILL.md'
```

````text
The standing rules are already on the thread — unattended, its egress and its web search each named
whichever way they went, a one-line record for a step that cannot run (the command, whether it started, its
exit status if any, the exact diagnostic), never claim a test passed without the count — so do not repeat them. A follow-up continues a thread with `RESUME: <threadId>`; a
recall-only one runs no commands, so it also needs `ALLOW_NO_COMMANDS: yes` (`--allow-no-commands` on a
command line).
````

<a id="quote-user"></a>

**D:318–324** — `plugins/entrust/skills/codex/SKILL.md` at `8c041b7`.

```sh
sed -n '318,324p' '$TMPDIR/astra-p1-map-2026-09-22/pinned/plugins/entrust/skills/codex/SKILL.md'
```

````text
Every word on this page is addressed to the coordinator, and an agent's return is too. What reaches the user is
prose the coordinator writes: in the user's own language, naming an agent by its model and id and saying what it
did ("Sonnet W5 replaced four flaky width checks", "Codex Astra A6 reviewed the retry instructions") and not by
this page's own vocabulary. Keep `Codex` on a Codex agent: it is the only word in the name that says whose model ran. The sentence about an agent has one shape: the agent by name is the subject and what it does or did is the verb ("Codex Sol R1 reads the diff"); whatever runs beside it, and how long, follows in the user's own words for the tools. The model slug is machinery too, and so are `wrapper` and `driver`: the name is `Codex Sol R1`, never `gpt-5.6-sol`. A header field name, a status block, an internal
table's row name and an absolute path are machinery; they belong in a prompt or a report, and putting them in
front of a person says nothing they can act on. Rights are the one thing that must survive the translation: say
what an agent may write, and where, in ordinary words, because that is what the user is being asked to approve.
````

<a id="quote-assembly"></a>

**O:119–119** — `plugins/entrust/skills/orchestrate/SKILL.md` at `8c041b7`.

```sh
sed -n '119,119p' '$TMPDIR/astra-p1-map-2026-09-22/pinned/plugins/entrust/skills/orchestrate/SKILL.md'
```

````text
- Open one assembled brief whole before the fan-out; check its input paths in the agent's planned tree, its item count and each quoted claim against its source.
````

<a id="quote-split"></a>

**O:118–118** — `plugins/entrust/skills/orchestrate/SKILL.md` at `8c041b7`.

```sh
sed -n '118,118p' '$TMPDIR/astra-p1-map-2026-09-22/pinned/plugins/entrust/skills/orchestrate/SKILL.md'
```

````text
- Critique the split before the fan-out: a top-row agent reads the decomposition, not the subject, for what the cut lost, what the wording added, which items are two and which the fan-out's rights cannot decide; twenty agents on a bad split agree and are all wrong (measured 2026-09-12: it caught two claims true at one release and false at the next, and they never reached the fan-out).
````

<a id="quote-adversarial"></a>

**O:120–120** — `plugins/entrust/skills/orchestrate/SKILL.md` at `8c041b7`.

```sh
sed -n '120,120p' '$TMPDIR/astra-p1-map-2026-09-22/pinned/plugins/entrust/skills/orchestrate/SKILL.md'
```

````text
- Adversarial verify: a refuter defaults to `refuted` when it is uncertain, and a finding is one that changes correctness or a stated requirement, the rest its `open`.
````

<a id="quote-diverse"></a>

**O:121–121** — `plugins/entrust/skills/orchestrate/SKILL.md` at `8c041b7`.

```sh
sed -n '121,121p' '$TMPDIR/astra-p1-map-2026-09-22/pinned/plugins/entrust/skills/orchestrate/SKILL.md'
```

````text
- Perspective-diverse verify: vary the angle across verifiers instead of N identical refuters.
````

<a id="quote-unanimous"></a>

**O:122–122** — `plugins/entrust/skills/orchestrate/SKILL.md` at `8c041b7`.

```sh
sed -n '122,122p' '$TMPDIR/astra-p1-map-2026-09-22/pinned/plugins/entrust/skills/orchestrate/SKILL.md'
```

````text
- Read a unanimous fan-out as evidence about the prompt first: open one return whole before you trust the tally (measured 2026-09-12: nineteen of twenty verdicts answered one broken path in every prompt).
````

<a id="quote-unknown"></a>

**O:123–123** — `plugins/entrust/skills/orchestrate/SKILL.md` at `8c041b7`.

```sh
sed -n '123,123p' '$TMPDIR/astra-p1-map-2026-09-22/pinned/plugins/entrust/skills/orchestrate/SKILL.md'
```

````text
- Judge panel for a design task: a verdict missing its decisive check is `unknown` in `result`; name the missing check in `open`. Use the sibling's `EXPECT:` rule for a Codex check.
````

<a id="quote-complete"></a>

**O:124–124** — `plugins/entrust/skills/orchestrate/SKILL.md` at `8c041b7`.

```sh
sed -n '124,124p' '$TMPDIR/astra-p1-map-2026-09-22/pinned/plugins/entrust/skills/orchestrate/SKILL.md'
```

````text
- Completeness critic at the end: one fresh strong-row reader chosen by the agreed composition and named in the plan, given the user's request, the final answer and its evidence once, before the answer goes out, never per return; it returns done, partial or not done with what is missing, unverified or unread, and the answer carries its verdict. A publication (a README, a changelog, a synthesis) is read the same way before it goes out.
````

<a id="quote-caps"></a>

**O:125–125** — `plugins/entrust/skills/orchestrate/SKILL.md` at `8c041b7`.

```sh
sed -n '125,125p' '$TMPDIR/astra-p1-map-2026-09-22/pinned/plugins/entrust/skills/orchestrate/SKILL.md'
```

````text
- No silent caps: name every agent, check or item you dropped.
````

<a id="quote-crossreview"></a>

**O:127–128** — `plugins/entrust/skills/orchestrate/SKILL.md` at `8c041b7`.

```sh
sed -n '127,128p' '$TMPDIR/astra-p1-map-2026-09-22/pinned/plugins/entrust/skills/orchestrate/SKILL.md'
```

````text
Fix, then cross-review, at most two rounds; then escalate to the Fable agent or the `gpt-6-astra` agent, and to the user only when
that round fails too. Between selection rounds, record the candidates rejected, the evidence gained and the remaining blocker. Two rounds repeating the same blocker are a stall: show a new plan and wait for the word.
````

<a id="quote-resume"></a>

**O:134–134** — `plugins/entrust/skills/orchestrate/SKILL.md` at `8c041b7`.

```sh
sed -n '134,134p' '$TMPDIR/astra-p1-map-2026-09-22/pinned/plugins/entrust/skills/orchestrate/SKILL.md'
```

````text
| `exitCode: 3`, a cut | read the partial; if the work is unfinished, continue that thread once with `RESUME:`, under a report path of its own |
````

<a id="quote-returnscope"></a>

**O:143–144** — `plugins/entrust/skills/orchestrate/SKILL.md` at `8c041b7`.

```sh
sed -n '143,144p' '$TMPDIR/astra-p1-map-2026-09-22/pinned/plugins/entrust/skills/orchestrate/SKILL.md'
```

````text
Ask every prompt agent, Claude and Codex alike, for exactly these five fields, and send no `BRIEF:` line: the template is the bound, and `BRIEF:` would clip the answer at 20 lines. A verifier's brief names its target and the whole scope it must cover; its return says what it checked and, in `open`, what it did not. The first line of `result` is one sentence a
reader can take on its own: the agent's model and id, its status and what it did ("Sonnet W5: done, four flaky width checks replaced by threshold checks"); the rest of the fields follow unchanged, and all five are yours to read, never to forward.
````

<a id="quote-return"></a>

**O:146–150** — `plugins/entrust/skills/orchestrate/SKILL.md` at `8c041b7`.

```sh
sed -n '146,150p' '$TMPDIR/astra-p1-map-2026-09-22/pinned/plugins/entrust/skills/orchestrate/SKILL.md'
```

````text
    status:    done | partial | blocked
    result:    at most 30 lines
    evidence:  what ran, with counts; a test without its count is not evidence
    artifacts: paths
    open:      questions and risks
````

<a id="quote-strict"></a>

**O:152–156** — `plugins/entrust/skills/orchestrate/SKILL.md` at `8c041b7`.

```sh
sed -n '152,156p' '$TMPDIR/astra-p1-map-2026-09-22/pinned/plugins/entrust/skills/orchestrate/SKILL.md'
```

````text
In a Workflow they are a JSON schema, and a Claude agent takes the `schema` option. A Codex agent takes the same five fields
as a strict JSON Schema file (`additionalProperties: false` on every object, every property in `required`) named on its
`OUTPUT_SCHEMA:` line, and you read them from `answerJson` in its report file:

    {"type":"object","additionalProperties":false,"required":["status","result","evidence","artifacts","open"],"properties":{"status":{"type":"string","enum":["done","partial","blocked"]},"result":{"type":"string"},"evidence":{"type":"array","items":{"type":"string"}},"artifacts":{"type":"array","items":{"type":"string"}},"open":{"type":"array","items":{"type":"string"}}}}
````

<a id="quote-record"></a>

**P:64–79** — `plugins/terse/README.md` at `8c041b7`.

```sh
sed -n '64,79p' '$TMPDIR/astra-p1-map-2026-09-22/pinned/plugins/terse/README.md'
```

````text
One run, on 2026-09-10, on one README in one repository. Read the size of it before the numbers:

- The four-pass chain took six reader questions from three right answers to six, took readers leaving
  the documentation from one to zero, and broke neither control question. **Six questions, one trial
  each.** Three improvements and no reversals over six paired items gives an exact two-sided McNemar
  *p* = 0.25, so this result is not distinguishable from chance. It is a pilot, not a rate.
- Two of the six failures were lies rather than findability. A reader repeated two guarantees from
  `README.md:5-9` that the code does not make. A structural rewrite would have carried both forward in
  better prose.
- A reader's own sense of clarity ran against the truth. Two who reported no confusion answered wrong;
  the one who called a section scattered and confusing answered right. Neither skill asks a reader
  whether the text was clear.
- Five published writing standards were put against two unguided controls across ten agents, models
  hidden from the judges. Both controls beat both entries of both standards. On the first 116 words,
  seven of ten agents proposed nothing and the only agent that shortened the passage was a control. **Ten
  agents, one run, one passage** — one observation per cell, not a rate.
````

<a id="quote-limits"></a>

**P:81–86** — `plugins/terse/README.md` at `8c041b7`.

```sh
sed -n '81,86p' '$TMPDIR/astra-p1-map-2026-09-22/pinned/plugins/terse/README.md'
```

````text
Not measured: which of the four passes produced the gain, and whether a bake-off beats one careful pass.
Also not measured, and worth knowing before you trust any of the above: there was no arm that ran the
same questions with no document at all, so none of this separates what the text taught a reader from what
the reader already knew. Two published benchmarks that did run that arm found it large. The reference
files say so where it matters, and
[references/prior-art.md](references/prior-art.md) collects every finding against these numbers.
````

<a id="quote-humanlimit"></a>

**I:10–10** — `research/README.md` at `8c041b7`.

```sh
sed -n '10,10p' '$TMPDIR/astra-p1-map-2026-09-22/pinned/research/README.md'
```

````text
| [2026-09-11-terse-survey](2026-09-11-terse-survey/) | what does the field already know? | three rounds, 37 agents, 108 ranked practices; the plugin's own numbers measure model answerability, not human improvement; no arm ever ran without the document |
````

<a id="quote-regrecord"></a>

**I:12–12** — `research/README.md` at `8c041b7`.

```sh
sed -n '12,12p' '$TMPDIR/astra-p1-map-2026-09-22/pinned/research/README.md'
```

````text
| [2026-09-11-markup-round-0](2026-09-11-markup-round-0/) | can the method produce a README its owner would send as it is? | nine rounds; regressions per round 1, 2, 1, 0, 6, 5, 10 — every one a lifecycle sentence written from reading, not running; an eleven-agent wave found 41 defects after six rounds; the first naive reader said "not yet" for content, not phrasing; round 09 says less and awaits the owner's read |
````

<a id="quote-dryrun"></a>

**I:13–13** — `research/README.md` at `8c041b7`.

```sh
sed -n '13,13p' '$TMPDIR/astra-p1-map-2026-09-22/pinned/research/README.md'
```

````text
| [2026-09-12-skill-review](2026-09-12-skill-review/) | can a fresh agent execute the skill from its text? | 9,650 words to the first action and 19 gaps; after restructuring, 677 words; the dry-run prompt is the ruler for skill text |
````

<a id="quote-rsetup"></a>

**R:80–90** — `plugins/terse/skills/rewrite/SKILL.md` at `8c041b7`.

```sh
sed -n '80,90p' '$TMPDIR/astra-p1-map-2026-09-22/pinned/plugins/terse/skills/rewrite/SKILL.md'
```

````text
1. **Once per document**, write four files and copy in `skeleton.md`:
   - `concepts.json` — one regex per idea the document carries, for the duplication count;
   - `budgets.json` — every `##` heading of the document mapped to the skeleton's number, or one you set
     and write back into `skeleton.md` where a section was added later. The comparison is a report the
     owner reads, not a gate: growth per section per round is the number that showed four sections
     swelling while every fix made them truer;
   - `tasks.json` — two starting states and goals for lens 4, from the workflow the document most wants
     a reader to perform; `questions.json` — the questions a reader arrives with, from the audit's key
     when there is one, otherwise from the skeleton's purpose per section, one line each.
   On a resumed run reuse all four; the readers are new agents and stay fresh even where the questions
   repeat. `ledger.json` starts empty and grows from the rounds.
````

<a id="quote-rprovenance"></a>

**R:160–164** — `plugins/terse/skills/rewrite/SKILL.md` at `8c041b7`.

```sh
sed -n '160,164p' '$TMPDIR/astra-p1-map-2026-09-22/pinned/plugins/terse/skills/rewrite/SKILL.md'
```

````text
- `diff-NN.patch` against the original; the cut ledger — every removed passage of twenty words or more,
  with its reason; the invisible-prerequisite inventory from the curse-of-knowledge pass, on rounds that
  ran a writer brief; the sections no task reached; and the structure map, when a stage-3 finding called
  for one
````

<a id="quote-returnevidence"></a>

**O:148–148** — `plugins/entrust/skills/orchestrate/SKILL.md` at `8c041b7`.

```sh
sed -n '148,148p' '$TMPDIR/astra-p1-map-2026-09-22/pinned/plugins/entrust/skills/orchestrate/SKILL.md'
```

````text
    evidence:  what ran, with counts; a test without its count is not evidence
````

## Source manifest and quote verification

P1 fetched nothing from the network. Original survey fetches were on 2026-09-22; the source URLs below identify those saved responses. S1’s four /codex URLs redirected to learn.chatgpt.com. Only the original surveyors’ fetch status is claimed. The local S3 files were read directly and SHA-256 checked.

| Saved file | Source URL / identity | Survey rows | SHA-256 of saved text |
|---|---|---:|---|
| `$TMPDIR/tmp.G7GcVkrbLb/pages/main.txt` | https://developers.openai.com/blog/rethinking-skills-and-prompts-for-gpt-6-astra | 20 | `5b84e77d2bb2a6c108d698d35d7795da56c628500c01915663eb47a42eb301ad` |
| `$TMPDIR/tmp.G7GcVkrbLb/pages/build-skills.txt` | https://learn.chatgpt.com/docs/build-skills | 7 | `82b842ab4424f9022806395f93eade7b19ae8694471a6a5093427ed441d7e1a2` |
| `$TMPDIR/tmp.G7GcVkrbLb/pages/skills-and-plugins.txt` | https://learn.chatgpt.com/docs/skills-and-plugins | 3 | `fabc9621a74d0376f5e9183c7fe5e43ed9f0f925ee4a164dc10983175cf826cc` |
| `$TMPDIR/tmp.G7GcVkrbLb/pages/prompting.txt` | https://learn.chatgpt.com/docs/prompting | 9 | `2b447d7e9dca194535189506aad5440e3c3be8180d1e02dfdf4eb988b0a52e32` |
| `$TMPDIR/tmp.G7GcVkrbLb/pages/agents-md.txt` | https://learn.chatgpt.com/docs/agent-configuration/agents-md | 4 | `b6e2b7a4419dfbb91c0b6e6aad72e9dff226dff8c92def02b3187418e21d15b0` |
| `$TMPDIR/tmp.G7GcVkrbLb/pages/prompt-engineering.txt` | https://developers.openai.com/api/docs/guides/prompt-engineering | 13 | `29ab16d08ee05294a94c9874589f456bdcd40d163f82e158fa60273e6397dc7a` |
| `$TMPDIR/tmp.G7GcVkrbLb/pages/tools-skills.txt` | https://developers.openai.com/api/docs/guides/tools-skills | 3 | `5f6379a310347c1562bf6ffe66de6903aaa55a6ca3241e8f8be1c06421c70d69` |
| `$TMPDIR/terra-s2-2026-09-22/pages/claude-prompting-best-practices.md` | https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices | 29 | `f98aa130a7974b2edf98f8c3babe806ab140d5cdd3933a506f5211335b431c5f` |
| `$TMPDIR/terra-s2-2026-09-22/pages/develop-tests.md` | https://platform.claude.com/docs/en/test-and-evaluate/develop-tests | 0 | `007bdee68b71817910e7a5ceefca77dcc6d36768a4fafd6de5f89dcc9c215c21` |
| `$TMPDIR/terra-s2-2026-09-22/pages/overview.md` | https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview | 2 | `bbd9883560196e845718d2e3160b50afbfc828eb62d4674164536e38610d5c33` |
| `$TMPDIR/terra-s2-2026-09-22/pages/prompting-claude-fable-5-1.md` | https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5-1 | 4 | `4aa645dd26fe9efebdaaff7462563bfac1f27782ce2d71dd5afffeaf02a80c62` |
| `$TMPDIR/terra-s2-2026-09-22/pages/prompting-claude-fable-5.md` | https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5 | 5 | `cfa1c5d6e2d27731febc2c4ce5845f9439d9dabf99b4cb0192cc9a1be6e7e594` |
| `$TMPDIR/terra-s2-2026-09-22/pages/prompting-claude-opus-4-8.md` | https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-4-8 | 3 | `ed0c1c467d33ebffcea4b2616514a6464dc61c9c6f9892478c44538d30c44d86` |
| `$TMPDIR/terra-s2-2026-09-22/pages/prompting-claude-opus-5.md` | https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5 | 0 | `65be3e0b437cbe23cc41bb4f9b7a5031c5a71cd49ab91ec4d19c62738762b086` |
| `$TMPDIR/terra-s2-2026-09-22/pages/prompting-claude-sonnet-5.md` | https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-sonnet-5 | 3 | `07e7db846f96915a1d533fe6f62f7812790a966361b9982b6522557e74d08127` |
| `~/.claude/plugins/cache/claude-plugins-official/mattpocock-skills/1.2.3/skills/productivity/writing-for-agents/SKILL.md` | local writing-for-agents v1.2.3 | 51 | `a842323e664e5af104eac5c97ad22fda929ebeb62d81c501161ac1f6f482db58` |
| `~/.claude/plugins/cache/claude-plugins-official/mattpocock-skills/1.2.3/skills/productivity/writing-for-agents/SKILL-MECHANICS.md` | local writing-for-agents v1.2.3 | 17 | `b4c54a0aaad3f6eddefde6d06770a0e401fbb8fc6a8f49ce18af816bd144d14d` |

Full-quote fixed-string searches: **128/173 raw matches**. The other **45/173** are located after deterministic normalization of Markdown wrappers/links/fences, whitespace, curly quotation marks, backslash escapes and a final period/colon added by a surveyor. No interior word is replaced or omitted. Examples: S2-43/45/46/48 are heading text with an added full stop; S2-10/40/50 end just before a source continuation; S2-15 spans prose and a fenced example. These are located quotations, but not byte-for-byte verbatim quotes. All 173 were then localized to original source line ranges and opened with sed. There are **0 unresolved quotes and 0 excluded rows**; using a stricter byte-only rule would exclude those 45, whose IDs/match class remain visible below.

| Row | Merged into | Source lines / match | Survey quote (unaltered) |
|---|---|---|---|
| S1-1 | C01 | `$TMPDIR/tmp.G7GcVkrbLb/pages/main.txt:719–719`; normalized (format/typography/terminal punctuation only) | If you've been using agents like Codex for your projects over the last year, you've likely accumulated a lot of instructions as you worked to steer the models toward good outcomes. |
| S1-2 | C03 | `$TMPDIR/tmp.G7GcVkrbLb/pages/main.txt:723–723`; raw exact | But many descriptions are far too long, and when you add too many skills, Codex starts shortening their descriptions to fit. |
| S1-3 | C04 | `$TMPDIR/tmp.G7GcVkrbLb/pages/main.txt:724–724`; normalized (format/typography/terminal punctuation only) | What's worse is that descriptions can often contradict each other or over-emphasize when skills should be used, leading the model to load instructions that don't actually help the task. |
| S1-4 | C04 | `$TMPDIR/tmp.G7GcVkrbLb/pages/main.txt:732–732`; raw exact | Here, the bad skill description can push the model to use it anytime it touches anything related to a database, rather than only when it has to handle a migration. |
| S1-5 | C06 | `$TMPDIR/tmp.G7GcVkrbLb/pages/main.txt:733–733`; raw exact | Second, one of the key markers of a useful skill is progressive disclosure. |
| S1-6 | C08 | `$TMPDIR/tmp.G7GcVkrbLb/pages/main.txt:734–734`; raw exact | Models have gotten much better at understanding nuance and ambiguity, so overly specific guidance can now hinder results where it previously helped. |
| S1-7 | C09 | `$TMPDIR/tmp.G7GcVkrbLb/pages/main.txt:735–735`; normalized (format/typography/terminal punctuation only) | Repository skills also guide other contributors' agents, which may use different models. Guidance that helps Sol or Luna may overconstrain GPT-6 Astra, so consider which models will use the instructions you leave behind. |
| S1-8 | C01 | `$TMPDIR/tmp.G7GcVkrbLb/pages/main.txt:737–737`; normalized (format/typography/terminal punctuation only) | Because AGENTS.md applies whenever the model works in your repository, you should frequently revisit each instruction and ask yourself whether it's still needed. |
| S1-9 | C10 | `$TMPDIR/tmp.G7GcVkrbLb/pages/main.txt:738–738`; raw exact | Requiring a stack of docs or a full repo map before every edit is excessive for a typo fix. GPT-6 Astra can work out what it needs to read without being pushed to review the whole project before every change. |
| S1-10 | C10 | `$TMPDIR/tmp.G7GcVkrbLb/pages/main.txt:744–744`; raw exact | Prompting the model to read files before every edit is a great way to burn context and slow work down. Pointing to some docs can still be helpful, however, so long as it is contextual. |
| S1-11 | C11 | `$TMPDIR/tmp.G7GcVkrbLb/pages/main.txt:745–745`; raw exact | Previous models needed encouragement to run tests and check their work. GPT-6 Astra does that on its own, so the same instructions can lead to unnecessary testing. |
| S1-12 | C12 | `$TMPDIR/tmp.G7GcVkrbLb/pages/main.txt:746–746`; raw exact | GPT-6 Astra is thorough, but it can be more tentative about how far to take a task. Sometimes it needs a little push to keep going. |
| S1-13 | C13 | `$TMPDIR/tmp.G7GcVkrbLb/pages/main.txt:747–747`; raw exact | The local tests use disposable fixtures and have no production access. Run them, fix failures caused by the requested change, and rerun affected tests without asking for approval at each step. |
| S1-14 | C14 | `$TMPDIR/tmp.G7GcVkrbLb/pages/main.txt:749–749`; raw exact | That can be useful, but GPT-6 Astra, as our most aligned model, has much better judgment and will not perform tasks unless it knows it is safe – so you should treat it as such. |
| S1-15 | C14 | `$TMPDIR/tmp.G7GcVkrbLb/pages/main.txt:750–750`; normalized (format/typography/terminal punctuation only) | If you stated boundaries previously because you wanted to prevent other models from going too far and you're now switching to GPT-6 Astra, consider updating that language: Astra could take it too seriously and may stop work where you'd actually be happy for it to continue. |
| S1-16 | C12 | `$TMPDIR/tmp.G7GcVkrbLb/pages/main.txt:752–752`; normalized (format/typography/terminal punctuation only) | If you're used to GPT-5.6 Sol taking a request and continuing for long stretches, GPT-6 Astra can feel more tentative about when to stop. It may reach a first implementation and come back for your review while there's still work to do. |
| S1-17 | C12 | `$TMPDIR/tmp.G7GcVkrbLb/pages/main.txt:753–753`; normalized (format/typography/terminal punctuation only) | This is where it helps to define completion before starting. You might need to push Astra to continue until it's fully done. |
| S1-18 | C15 | `$TMPDIR/tmp.G7GcVkrbLb/pages/main.txt:753–753`; normalized (format/typography/terminal punctuation only) | A requirement to stop for review after the first implementation will pull the model toward an earlier stopping point, so check whether that's a decision you actually need to make. |
| S1-19 | C12 | `$TMPDIR/tmp.G7GcVkrbLb/pages/main.txt:754–754`; raw exact | If you want it to keep exploring beyond a first pass, say what you want explored and where it should stop. |
| S1-20 | C16 | `$TMPDIR/tmp.G7GcVkrbLb/pages/main.txt:755–755`; normalized (format/typography/terminal punctuation only) | A new model is a good opportunity to clean your house, but you don't need to review everything manually: ask GPT-6 Astra to do an audit based on what was discussed in this article, then go build something you wouldn't have attempted before! |
| S1-21 | C03, C04 | `$TMPDIR/tmp.G7GcVkrbLb/pages/build-skills.txt:701–701`; raw exact | Because implicit matching depends on description, write concise descriptions with clear scope and boundaries. |
| S1-22 | C05 | `$TMPDIR/tmp.G7GcVkrbLb/pages/build-skills.txt:701–701`; raw exact | Front-load the key use case and trigger words so a host can still match the skill if descriptions are shortened. |
| S1-23 | C03 | `$TMPDIR/tmp.G7GcVkrbLb/pages/build-skills.txt:686–686`; normalized (format/typography/terminal punctuation only) | To avoid crowding out the rest of the prompt, this list uses at most 2% of the model's context window, or 8,000 characters when the context window is unknown. |
| S1-24 | C17 | `$TMPDIR/tmp.G7GcVkrbLb/pages/build-skills.txt:752–752`; raw exact | Keep each skill focused on one job. |
| S1-25 | C19 | `$TMPDIR/tmp.G7GcVkrbLb/pages/build-skills.txt:753–753`; raw exact | Prefer instructions over scripts unless you need deterministic behavior or external tooling. |
| S1-26 | C20 | `$TMPDIR/tmp.G7GcVkrbLb/pages/build-skills.txt:754–754`; raw exact | Write imperative steps with explicit inputs and outputs. |
| S1-27 | C22 | `$TMPDIR/tmp.G7GcVkrbLb/pages/build-skills.txt:755–755`; raw exact | Test prompts against the skill description to confirm the right trigger behavior. |
| S1-28 | C18 | `$TMPDIR/tmp.G7GcVkrbLb/pages/skills-and-plugins.txt:679–679`; raw exact | Skills are most useful when good results depend on a repeatable approach. |
| S1-29 | C20, C28, C32 | `$TMPDIR/tmp.G7GcVkrbLb/pages/skills-and-plugins.txt:686–686`; raw exact | Explain the goal, the steps to follow, the expected format, and anything the skill should always include or avoid. |
| S1-30 | C21 | `$TMPDIR/tmp.G7GcVkrbLb/pages/skills-and-plugins.txt:687–687`; raw exact | Check the instructions, test the skill with a realistic request, and refine it if the result misses a step or drifts from the format you want. |
| S1-31 | C23 | `$TMPDIR/tmp.G7GcVkrbLb/pages/prompting.txt:672–672`; raw exact | A short prompt is often enough. For larger or more important tasks, include the parts that matter: |
| S1-32 | C23 | `$TMPDIR/tmp.G7GcVkrbLb/pages/prompting.txt:677–677`; normalized (format/typography/terminal punctuation only) | Use only the parts that help. You don't need to fill in every item or follow a required format. |
| S1-33 | C08 | `$TMPDIR/tmp.G7GcVkrbLb/pages/prompting.txt:679–679`; raw exact | Start with the result, not a detailed list of steps. Include the audience or format when those details change what ChatGPT should produce. |
| S1-34 | C08 | `$TMPDIR/tmp.G7GcVkrbLb/pages/prompting.txt:681–681`; raw exact | Describe a process when the process itself matters. Otherwise, leave ChatGPT room to search, compare information, and adjust its approach. |
| S1-35 | C24 | `$TMPDIR/tmp.G7GcVkrbLb/pages/prompting.txt:683–683`; raw exact | Share the information that could change the result. Add only the sources that matter, and explain what ChatGPT should take from each one. |
| S1-36 | C23 | `$TMPDIR/tmp.G7GcVkrbLb/pages/prompting.txt:706–706`; normalized (format/typography/terminal punctuation only) | Focus on the one or two boundaries that matter most. You don't need to control every step ChatGPT takes. |
| S1-37 | C26 | `$TMPDIR/tmp.G7GcVkrbLb/pages/prompting.txt:712–712`; normalized (format/typography/terminal punctuation only) | For important work, ask ChatGPT for a final check, such as confirming every action item has an owner and due date or flagging information it couldn't verify. |
| S1-38 | C27 | `$TMPDIR/tmp.G7GcVkrbLb/pages/prompting.txt:714–714`; normalized (format/typography/terminal punctuation only) | Your first prompt doesn't need to be perfect. Review the result, then ask for the specific change you want. |
| S1-39 | C28 | `$TMPDIR/tmp.G7GcVkrbLb/pages/prompting.txt:761–761`; raw exact | A useful Codex prompt names the behavior you want, points to the relevant code or reproduction steps, preserves important constraints, and says how to verify the change. |
| S1-40 | C29 | `$TMPDIR/tmp.G7GcVkrbLb/pages/agents-md.txt:674–674`; raw exact | Codex skips empty files and stops adding files once the combined size reaches the limit defined by project_doc_max_bytes (32 KiB by default). |
| S1-41 | C29 | `$TMPDIR/tmp.G7GcVkrbLb/pages/agents-md.txt:674–674`; raw exact | Raise the limit or split instructions across nested directories when you hit the cap. |
| S1-42 | C30 | `$TMPDIR/tmp.G7GcVkrbLb/pages/agents-md.txt:694–694`; raw exact | Codex stops searching once it reaches your current directory, so place overrides as close to specialized work as possible. |
| S1-43 | C31 | `$TMPDIR/tmp.G7GcVkrbLb/pages/agents-md.txt:709–709`; raw exact | Keep rules concise, explain the behavior to flag and any safe path or exception, and reserve formatting and lint checks for CI. |
| S1-44 | C32 | `$TMPDIR/tmp.G7GcVkrbLb/pages/prompt-engineering.txt:813–813`; raw exact | GPT models like gpt-6-astra benefit from precise instructions that explicitly provide the logic and data required to complete the task in the prompt. |
| S1-45 | C33, C34, C35, C36 | `$TMPDIR/tmp.G7GcVkrbLb/pages/prompt-engineering.txt:820–820`; normalized (format/typography/terminal punctuation only) | Prompting gpt-6-astra for coding tasks is most effective when following a few best practices: define the agent's role, enforce structured tool use with examples, require thorough testing for correctness, and set Markdown standards for clean output. |
| S1-46 | C33, C52 | `$TMPDIR/tmp.G7GcVkrbLb/pages/prompt-engineering.txt:821–821`; raw exact | Frame the model as a software engineering agent with well-defined responsibilities. Provide clear instructions for using tools like functions.run for code tasks, and specify when not to use certain modes—for example, avoid interactive execution unless necessary. |
| S1-47 | C34 | `$TMPDIR/tmp.G7GcVkrbLb/pages/prompt-engineering.txt:822–822`; normalized (format/typography/terminal punctuation only) | Instruct the model to test changes with unit tests or Python commands, and validate patches carefully since tools like apply_patch may return "Done" even on failure. |
| S1-48 | C35 | `$TMPDIR/tmp.G7GcVkrbLb/pages/prompt-engineering.txt:823–823`; raw exact | Include concrete examples of how to invoke commands with the provided functions, which improves reliability and adherence to expected workflows. |
| S1-49 | C36 | `$TMPDIR/tmp.G7GcVkrbLb/pages/prompt-engineering.txt:824–824`; raw exact | Guide the model to generate clean, semantically correct markdown using inline code, code fences, lists, and tables where appropriate—and to format file paths, functions, and classes with backticks. |
| S1-50 | C37 | `$TMPDIR/tmp.G7GcVkrbLb/pages/prompt-engineering.txt:836–836`; normalized (format/typography/terminal punctuation only) | For front-end engineering work in larger codebases, we've found that adding these categories of instruction to your prompts delivers the best results: |
| S1-51 | C38, C39, C40 | `$TMPDIR/tmp.G7GcVkrbLb/pages/prompt-engineering.txt:845–845`; raw exact | For agentic and long-running rollouts with gpt-6-astra, focus your prompts on three core practices: plan tasks thoroughly to ensure complete resolution, provide clear preambles for major tool usage decisions, and use a TODO tool to track workflow and progress in an organized manner. |
| S1-52 | C38 | `$TMPDIR/tmp.G7GcVkrbLb/pages/prompt-engineering.txt:846–846`; raw exact | Instruct the model to resolve the full query before yielding control, decomposing it into sub-tasks and reflecting after each tool call to confirm completeness. |
| S1-53 | C39 | `$TMPDIR/tmp.G7GcVkrbLb/pages/prompt-engineering.txt:849–849`; raw exact | Ask the model to explain why it is calling a tool, but only at notable steps. |
| S1-54 | C40 | `$TMPDIR/tmp.G7GcVkrbLb/pages/prompt-engineering.txt:852–852`; raw exact | Use a TODO list tool or rubric to enforce structured planning and avoid missed steps. |
| S1-55 | C09 | `$TMPDIR/tmp.G7GcVkrbLb/pages/prompt-engineering.txt:855–855`; raw exact | Generally speaking, reasoning models will provide better results on tasks with only high-level guidance. This differs from GPT models, which benefit from very precise instructions. |
| S1-56 | C32 | `$TMPDIR/tmp.G7GcVkrbLb/pages/prompt-engineering.txt:858–858`; normalized (format/typography/terminal punctuation only) | A GPT model is like a junior coworker. They'll perform best with explicit instructions to create a specific output. |
| S1-57 | C04 | `$TMPDIR/tmp.G7GcVkrbLb/pages/tools-skills.txt:673–673`; normalized (format/typography/terminal punctuation only) | Write a description that explains both what the skill does and when to use it. For example, "Review and redline vendor agreements using the fallback clauses" gives the model more useful context than "Helps with legal work." |
| S1-58 | C06 | `$TMPDIR/tmp.G7GcVkrbLb/pages/tools-skills.txt:674–674`; raw exact | Keep the main instructions in SKILL.md and link to supporting files as needed: |
| S1-59 | C41 | `$TMPDIR/tmp.G7GcVkrbLb/pages/tools-skills.txt:698–698`; normalized (format/typography/terminal punctuation only) | Once a skill is mounted, the model can decide when to use it. If you want more deterministic behavior, explicitly instruct the model to "use the <skill name> skill" when appropriate. |
| S2-1 | C21 | `$TMPDIR/terra-s2-2026-09-22/pages/overview.md:9–13`; normalized (format/typography/terminal punctuation only) | This guide assumes that you have: 1. A clear definition of the success criteria for your use case 2. Some ways to empirically test against those criteria 3. A first draft prompt you want to improve. |
| S2-2 | C42 | `$TMPDIR/terra-s2-2026-09-22/pages/overview.md:31–31`; raw exact | Not every success criteria or failing eval is best solved by prompt engineering. For example, you can sometimes improve latency and cost more easily by selecting a different model. |
| S2-3 | C32 | `$TMPDIR/terra-s2-2026-09-22/pages/claude-prompting-best-practices.md:35–35`; raw exact | Claude responds well to clear, explicit instructions. Being specific about your desired output can help enhance results. |
| S2-4 | C20 | `$TMPDIR/terra-s2-2026-09-22/pages/claude-prompting-best-practices.md:42–42`; raw exact | Provide instructions as sequential steps using numbered lists or bullet points when the order or completeness of steps matters. |
| S2-5 | C25 | `$TMPDIR/terra-s2-2026-09-22/pages/claude-prompting-best-practices.md:60–60`; raw exact | Providing context or motivation behind your instructions, such as explaining to Claude why such behavior is important, can help Claude better understand your goals and deliver more targeted responses. |
| S2-6 | C43 | `$TMPDIR/terra-s2-2026-09-22/pages/claude-prompting-best-practices.md:80–80`; raw exact | Examples are one of the most reliable ways to steer Claude's output format, tone, and structure. A few well-crafted examples (known as few-shot or multishot prompting) improve accuracy and consistency. |
| S2-7 | C43 | `$TMPDIR/terra-s2-2026-09-22/pages/claude-prompting-best-practices.md:89–89`; raw exact | Include 3–5 examples for best results. You can also ask Claude to evaluate your examples for relevance and diversity, or to generate additional ones based on your initial set. |
| S2-9 | C44 | `$TMPDIR/terra-s2-2026-09-22/pages/claude-prompting-best-practices.md:94–94`; raw exact | XML tags help Claude parse complex prompts unambiguously, especially when your prompt mixes instructions, context, examples, and variable inputs. Wrapping each type of content in its own tag (for example, `<instructions>`, `<context>`, `<input>`) reduces misinterpretation. |
| S2-10 | C44 | `$TMPDIR/terra-s2-2026-09-22/pages/claude-prompting-best-practices.md:98–99`; normalized (format/typography/terminal punctuation only) | Use consistent, descriptive tag names across your prompts. Nest tags when content has a natural hierarchy. |
| S2-11 | C33 | `$TMPDIR/terra-s2-2026-09-22/pages/claude-prompting-best-practices.md:103–103`; normalized (format/typography/terminal punctuation only) | Setting a role in the system prompt focuses Claude's behavior and tone for your use case. Even a single sentence makes a difference. |
| S2-12 | C45 | `$TMPDIR/terra-s2-2026-09-22/pages/claude-prompting-best-practices.md:243–243`; normalized (format/typography/terminal punctuation only) | Put longform data at the top: Place your long documents and inputs near the top of your prompt, above your query, instructions, and examples. This improves performance across all models. |
| S2-13 | C45 | `$TMPDIR/terra-s2-2026-09-22/pages/claude-prompting-best-practices.md:246–246`; raw exact | Queries at the end can improve response quality by up to 30 percent in tests, especially with complex, multidocument inputs. |
| S2-15 | C46 | `$TMPDIR/terra-s2-2026-09-22/pages/claude-prompting-best-practices.md:328–331`; normalized (format/typography/terminal punctuation only) | If you prefer more visibility into its reasoning: After completing a task that involves tool use, provide a quick summary of the work you've done. |
| S2-16 | C47 | `$TMPDIR/terra-s2-2026-09-22/pages/claude-prompting-best-practices.md:334–334`; normalized (format/typography/terminal punctuation only) | Claude Opus 5 is an exception on verbosity: its default user-facing responses run longer than prior models', and raising or lowering effort does not reliably change visible response length. Prompt explicitly for conciseness instead. |
| S2-17 | C48 | `$TMPDIR/terra-s2-2026-09-22/pages/claude-prompting-best-practices.md:340–340`; normalized (format/typography/terminal punctuation only) | Tell Claude what to do instead of what not to do. |
| S2-18 | C49 | `$TMPDIR/terra-s2-2026-09-22/pages/claude-prompting-best-practices.md:351–351`; raw exact | The formatting style used in your prompt may influence Claude's response style. If you are still experiencing steerability issues with output formatting, try matching your prompt style to your desired output style as closely as possible. |
| S2-19 | C50 | `$TMPDIR/terra-s2-2026-09-22/pages/claude-prompting-best-practices.md:404–404`; normalized (format/typography/terminal punctuation only) | Starting with Claude 4.6 models and Claude Mythos Preview, prefilled responses (providing a partial assistant message for Claude to continue from) on the last assistant turn are no longer supported. Requests with prefilled assistant messages to these models return a 400 error. |
| S2-20 | C51 | `$TMPDIR/terra-s2-2026-09-22/pages/claude-prompting-best-practices.md:411–411`; raw exact | Try asking the model to conform to your output structure first, as newer models can reliably match complex schemas when told to, especially if implemented with retries. |
| S2-21 | C52 | `$TMPDIR/terra-s2-2026-09-22/pages/claude-prompting-best-practices.md:442–442`; raw exact | Claude's latest models are trained for precise instruction following and benefit from explicit direction to use specific tools. |
| S2-22 | C53 | `$TMPDIR/terra-s2-2026-09-22/pages/claude-prompting-best-practices.md:498–498`; normalized (format/typography/terminal punctuation only) | While the model has a high success rate in parallel tool calling without prompting, you can boost this to ~100% or adjust the aggression level. |
| S2-23 | C54 | `$TMPDIR/terra-s2-2026-09-22/pages/claude-prompting-best-practices.md:526–526`; normalized (format/typography/terminal punctuation only) | Replace blanket defaults with more targeted instructions. Instead of "Default to using [tool]," add guidance like "Use [tool] when it would enhance your understanding of the problem." |
| S2-24 | C55 | `$TMPDIR/terra-s2-2026-09-22/pages/claude-prompting-best-practices.md:545–545`; raw exact | In internal evaluations, adaptive thinking reliably drives better performance than extended thinking. Consider moving to adaptive thinking. |
| S2-25 | C08 | `$TMPDIR/terra-s2-2026-09-22/pages/claude-prompting-best-practices.md:776–776`; normalized (format/typography/terminal punctuation only) | Prefer general instructions over prescriptive steps. A prompt like "think thoroughly" often produces better reasoning than a hand-written step-by-step plan. |
| S2-26 | C56 | `$TMPDIR/terra-s2-2026-09-22/pages/claude-prompting-best-practices.md:778–778`; normalized (format/typography/terminal punctuation only) | Manual chain-of-thought (CoT) prompting as a fallback. When thinking is off, you can still encourage step-by-step reasoning by asking Claude to think through the problem. |
| S2-28 | C11 | `$TMPDIR/terra-s2-2026-09-22/pages/claude-prompting-best-practices.md:779–779`; raw exact | Claude Opus 5 is the exception: it verifies its own work well without explicit instruction, and verification instructions carried over from prompts tuned for earlier models can cause over-verification, adding tokens and latency. |
| S2-29 | C57 | `$TMPDIR/terra-s2-2026-09-22/pages/claude-prompting-best-practices.md:804–806`; normalized (format/typography/terminal punctuation only) | Your context window will be automatically compacted as it approaches its limit, allowing you to continue working indefinitely from where you left off. Therefore, do not stop tasks early due to token budget concerns. |
| S2-31 | C58 | `$TMPDIR/terra-s2-2026-09-22/pages/claude-prompting-best-practices.md:928–931`; normalized (format/typography/terminal punctuation only) | Use subagents when tasks can run in parallel, require isolated context, or involve independent workstreams that don't need to share state. For simple tasks, sequential operations, single-file edits, or tasks where you need to maintain context across steps, work directly rather than delegating. |
| S2-32 | C59 | `$TMPDIR/terra-s2-2026-09-22/pages/claude-prompting-best-practices.md:936–936`; raw exact | Explicit prompt chaining (breaking a task into sequential API calls) is still useful when you need to inspect intermediate outputs or enforce a specific pipeline structure. |
| S2-33 | C60 | `$TMPDIR/terra-s2-2026-09-22/pages/claude-prompting-best-practices.md:958–959`; normalized (format/typography/terminal punctuation only) | Avoid over-engineering. Only make changes that are directly requested or clearly necessary. |
| S2-34 | C61 | `$TMPDIR/terra-s2-2026-09-22/pages/claude-prompting-best-practices.md:1003–1004`; normalized (format/typography/terminal punctuation only) | Never speculate about code you have not opened. If the user references a specific file, you MUST read the file before answering. |
| S2-35 | C62 | `$TMPDIR/terra-s2-2026-09-22/pages/claude-prompting-best-practices.md:1017–1017`; raw exact | Testing has shown consistent uplift on image evaluations when Claude is able to "zoom" in on relevant regions of an image. |
| S2-36 | C63 | `$TMPDIR/terra-s2-2026-09-22/pages/prompting-claude-fable-5.md:69–69`; normalized (format/typography/terminal punctuation only) | In Anthropic's testing, this nearly eliminated fabricated status reports even on tasks designed to elicit them. |
| S2-37 | C64 | `$TMPDIR/terra-s2-2026-09-22/pages/prompting-claude-fable-5.md:77–77`; normalized (format/typography/terminal punctuation only) | Define explicit constraints on what Claude Fable 5 should and should not do. |
| S2-38 | C25 | `$TMPDIR/terra-s2-2026-09-22/pages/prompting-claude-fable-5.md:123–123`; normalized (format/typography/terminal punctuation only) | Provide context about why you're asking, especially for long-running agents drawing on multiple workstreams. |
| S2-39 | C02 | `$TMPDIR/terra-s2-2026-09-22/pages/prompting-claude-fable-5.md:174–174`; raw exact | Skills developed for prior models are often too prescriptive for Claude Fable 5 and can degrade output quality. Review and consider removing older instructions if default performance is better. |
| S2-40 | C65 | `$TMPDIR/terra-s2-2026-09-22/pages/prompting-claude-fable-5.md:175–175`; normalized (format/typography/terminal punctuation only) | Don't instruct Claude to reproduce its reasoning in the response. Prompts, skills, or harness instructions that tell the model to echo, transcribe, or explain its internal reasoning as response text can trigger the reasoning_extraction refusal category. |
| S2-43 | C53 | `$TMPDIR/terra-s2-2026-09-22/pages/prompting-claude-fable-5-1.md:13–13`; normalized (format/typography/terminal punctuation only) | Batch independent tool calls in agent loops. |
| S2-45 | C66 | `$TMPDIR/terra-s2-2026-09-22/pages/prompting-claude-fable-5-1.md:19–19`; normalized (format/typography/terminal punctuation only) | Tell the model what to preserve in compaction summaries. |
| S2-46 | C60 | `$TMPDIR/terra-s2-2026-09-22/pages/prompting-claude-fable-5-1.md:20–20`; normalized (format/typography/terminal punctuation only) | Keep changes and tests to what the task asks for. |
| S2-48 | C67 | `$TMPDIR/terra-s2-2026-09-22/pages/prompting-claude-fable-5-1.md:24–24`; normalized (format/typography/terminal punctuation only) | Leave room for long outputs at xhigh and max effort. |
| S2-49 | C68 | `$TMPDIR/terra-s2-2026-09-22/pages/prompting-claude-opus-4-8.md:39–39`; raw exact | If you observe shallow reasoning on complex problems, raise effort to `high` or `xhigh` rather than prompting around it. |
| S2-50 | C69 | `$TMPDIR/terra-s2-2026-09-22/pages/prompting-claude-opus-4-8.md:69–69`; normalized (format/typography/terminal punctuation only) | If you need Claude to apply an instruction broadly, state the scope explicitly. |
| S2-51 | C70 | `$TMPDIR/terra-s2-2026-09-22/pages/prompting-claude-opus-4-8.md:149–149`; raw exact | Report every issue you find, including ones you are uncertain about or consider low-severity. |
| S2-57 | C43 | `$TMPDIR/terra-s2-2026-09-22/pages/prompting-claude-sonnet-5.md:25–25`; raw exact | Positive examples showing how Claude can communicate with the appropriate level of concision tend to be more effective than negative examples or instructions that tell the model what not to do. |
| S2-58 | C71 | `$TMPDIR/terra-s2-2026-09-22/pages/prompting-claude-sonnet-5.md:37–37`; raw exact | When benchmarking, match by observed thinking length rather than effort name. |
| S2-59 | C68 | `$TMPDIR/terra-s2-2026-09-22/pages/prompting-claude-sonnet-5.md:41–41`; raw exact | If you observe shallow reasoning on complex problems, raise effort to `high` or `xhigh` rather than prompting around it. |
| S3-1 | C18 | `~/.claude/plugins/cache/claude-plugins-official/mattpocock-skills/1.2.3/skills/productivity/writing-for-agents/SKILL.md:6–6`; raw exact | The packaging differs; the writing does not: the same levers make each one predictable — the agent taking the same _process_ every run, not producing the same output. |
| S3-2 | C06 | `~/.claude/plugins/cache/claude-plugins-official/mattpocock-skills/1.2.3/skills/productivity/writing-for-agents/SKILL.md:8–8`; raw exact | When the document you're writing is a skill, read [`SKILL-MECHANICS.md`](SKILL-MECHANICS.md) for frontmatter, invocation choice, and router skills. |
| S3-3 | C04 | `~/.claude/plugins/cache/claude-plugins-official/mattpocock-skills/1.2.3/skills/productivity/writing-for-agents/SKILL.md:12–12`; raw exact | A **context pointer** is a reference held in the agent's context that names some out-of-context material and encodes the condition for reaching it. |
| S3-4 | C07 | `~/.claude/plugins/cache/claude-plugins-official/mattpocock-skills/1.2.3/skills/productivity/writing-for-agents/SKILL.md:12–12`; raw exact | A must-have target behind a weakly worded pointer is a variance bug: sharpen the wording first, and inline the material only if sharpening fails. |
| S3-5 | C04 | `~/.claude/plugins/cache/claude-plugins-official/mattpocock-skills/1.2.3/skills/productivity/writing-for-agents/SKILL.md:14–14`; raw exact | A pointer does two jobs — state what the material is, and list the **branches** that should trigger reaching it (a branch is a distinct case the document handles, so different runs take different paths through it). |
| S3-6 | C03 | `~/.claude/plugins/cache/claude-plugins-official/mattpocock-skills/1.2.3/skills/productivity/writing-for-agents/SKILL.md:14–14`; raw exact | Every word of an always-loaded pointer costs on every turn, so it earns even harder pruning than the body: |
| S3-7 | C05 | `~/.claude/plugins/cache/claude-plugins-official/mattpocock-skills/1.2.3/skills/productivity/writing-for-agents/SKILL.md:16–16`; raw exact | **Front-load the leading word** — the pointer is where it does its triggering work. |
| S3-8 | C04 | `~/.claude/plugins/cache/claude-plugins-official/mattpocock-skills/1.2.3/skills/productivity/writing-for-agents/SKILL.md:17–17`; raw exact | **One trigger per branch.** Synonyms that rename a single branch are one branch written twice; collapse them and keep only genuinely distinct branches. |
| S3-9 | C04 | `~/.claude/plugins/cache/claude-plugins-official/mattpocock-skills/1.2.3/skills/productivity/writing-for-agents/SKILL.md:18–18`; raw exact | **Cut identity the body already carries.** |
| S3-10 | C03 | `~/.claude/plugins/cache/claude-plugins-official/mattpocock-skills/1.2.3/skills/productivity/writing-for-agents/SKILL.md:24–24`; raw exact | - **Context load** — the cost of always-loaded material on the agent's window: an `AGENTS.md` line, a skill description, anything sitting in context every turn, spending tokens and attention whether or not it fires. |
| S3-11 | C72 | `~/.claude/plugins/cache/claude-plugins-official/mattpocock-skills/1.2.3/skills/productivity/writing-for-agents/SKILL.md:25–25`; raw exact | Not a cost to minimise — it is the price of human agency; spend it where human judgement matters, remove it where it does not. |
| S3-12 | C06 | `~/.claude/plugins/cache/claude-plugins-official/mattpocock-skills/1.2.3/skills/productivity/writing-for-agents/SKILL.md:27–27`; raw exact | Material reached only through a pointer escapes context load at the price of the pointer's own line; material with no pointer at all rides entirely on cognitive load. |
| S3-13 | C06 | `~/.claude/plugins/cache/claude-plugins-official/mattpocock-skills/1.2.3/skills/productivity/writing-for-agents/SKILL.md:37–37`; raw exact | Push too little down and the top bloats; push too much and you hide material the agent actually needs. |
| S3-14 | C06 | `~/.claude/plugins/cache/claude-plugins-official/mattpocock-skills/1.2.3/skills/productivity/writing-for-agents/SKILL.md:39–39`; raw exact | **Progressive disclosure** is the move down the ladder — out of the main file and behind a pointer — so the top stays legible. |
| S3-15 | C06 | `~/.claude/plugins/cache/claude-plugins-official/mattpocock-skills/1.2.3/skills/productivity/writing-for-agents/SKILL.md:39–39`; raw exact | Not primarily a token optimisation: it is how the hierarchy is protected. |
| S3-16 | C06 | `~/.claude/plugins/cache/claude-plugins-official/mattpocock-skills/1.2.3/skills/productivity/writing-for-agents/SKILL.md:39–39`; raw exact | Branching is the cleanest disclosure test: inline what every branch needs, and push behind a pointer what only some branches reach. |
| S3-17 | C06 | `~/.claude/plugins/cache/claude-plugins-official/mattpocock-skills/1.2.3/skills/productivity/writing-for-agents/SKILL.md:39–39`; raw exact | When a document has steps, in-file reference that should be disclosed buries them and turns attending to them into a coin-flip — a variance lever, not just a legibility one. |
| S3-18 | C73 | `~/.claude/plugins/cache/claude-plugins-official/mattpocock-skills/1.2.3/skills/productivity/writing-for-agents/SKILL.md:41–41`; raw exact | **Co-location** is the within-file companion: where the ladder decides _how far down_ a piece sits, co-location decides _what sits beside it_ once there. |
| S3-19 | C73 | `~/.claude/plugins/cache/claude-plugins-official/mattpocock-skills/1.2.3/skills/productivity/writing-for-agents/SKILL.md:41–41`; raw exact | Keep a concept's definition, rules, and caveats under one heading rather than scattered, so reading one part brings its neighbours with it. |
| S3-20 | C73 | `~/.claude/plugins/cache/claude-plugins-official/mattpocock-skills/1.2.3/skills/productivity/writing-for-agents/SKILL.md:41–41`; raw exact | The test: the document should read like documentation written for the agent — grouped material reads that way; scattered material does not. |
| S3-21 | C06 | `~/.claude/plugins/cache/claude-plugins-official/mattpocock-skills/1.2.3/skills/productivity/writing-for-agents/SKILL.md:43–43`; raw exact | **Sprawl** is the failure mode here: a document simply too long, even when every line is live and unique. |
| S3-22 | C06 | `~/.claude/plugins/cache/claude-plugins-official/mattpocock-skills/1.2.3/skills/productivity/writing-for-agents/SKILL.md:43–43`; raw exact | The cure is the ladder: disclose reference behind pointers, and split by branch or sequence so each path carries only what it needs. |
| S3-23 | C12 | `~/.claude/plugins/cache/claude-plugins-official/mattpocock-skills/1.2.3/skills/productivity/writing-for-agents/SKILL.md:47–47`; raw exact | Every step ends on a **completion criterion** — the condition that tells the agent the work is done. |
| S3-24 | C12 | `~/.claude/plugins/cache/claude-plugins-official/mattpocock-skills/1.2.3/skills/productivity/writing-for-agents/SKILL.md:49–49`; raw exact | A vague bound ("understanding reached") invites **premature completion**: ending the step before it is genuinely done, attention slipping to _being done_. |
| S3-25 | C74 | `~/.claude/plugins/cache/claude-plugins-official/mattpocock-skills/1.2.3/skills/productivity/writing-for-agents/SKILL.md:49–49`; raw exact | Defend in order: **sharpen the bound first** (local and cheap); only if it is irreducibly fuzzy _and_ you observe the rush, hide the later steps by splitting the sequence — and hiding only works across a real context boundary (a hand-off or a subagent dispatch; an inline call leaves the later steps in context and clears nothing). |
| S3-26 | C12 | `~/.claude/plugins/cache/claude-plugins-official/mattpocock-skills/1.2.3/skills/productivity/writing-for-agents/SKILL.md:50–50`; raw exact | "Every modified model accounted for" forces thorough work where "produce a change list" does not. |
| S3-27 | C12 | `~/.claude/plugins/cache/claude-plugins-official/mattpocock-skills/1.2.3/skills/productivity/writing-for-agents/SKILL.md:50–50`; raw exact | Demand drives **legwork** — the digging the agent does within the work, latent in the wording rather than written as its own step — and it is not step-bound: |
| S3-28 | C12 | `~/.claude/plugins/cache/claude-plugins-official/mattpocock-skills/1.2.3/skills/productivity/writing-for-agents/SKILL.md:52–52`; raw exact | The strongest criteria are both checkable and exhaustive. |
| S3-29 | C74 | `~/.claude/plugins/cache/claude-plugins-official/mattpocock-skills/1.2.3/skills/productivity/writing-for-agents/SKILL.md:58–58`; raw exact | **By sequence** — split a run of steps where the post-completion steps tempt the agent to rush the one in front of it. |
| S3-30 | C74 | `~/.claude/plugins/cache/claude-plugins-official/mattpocock-skills/1.2.3/skills/productivity/writing-for-agents/SKILL.md:58–58`; raw exact | Keeping them out of view drives more legwork on the current task. |
| S3-31 | C74 | `~/.claude/plugins/cache/claude-plugins-official/mattpocock-skills/1.2.3/skills/productivity/writing-for-agents/SKILL.md:58–58`; raw exact | Beware the reverse: merging sequences exposes each step's later steps to what follows, inviting premature completion. |
| S3-32 | C75 | `~/.claude/plugins/cache/claude-plugins-official/mattpocock-skills/1.2.3/skills/productivity/writing-for-agents/SKILL.md:63–63`; raw exact | A **leading word** is a compact concept already living in the model's pretraining that the agent thinks with while running the document (_lesson_, _fog of war_, _tracer bullets_). |
| S3-33 | C75 | `~/.claude/plugins/cache/claude-plugins-official/mattpocock-skills/1.2.3/skills/productivity/writing-for-agents/SKILL.md:63–63`; raw exact | Repeated as a token, never as a sentence, it accumulates a distributed definition and anchors a whole region of behaviour in the fewest tokens, by recruiting priors the model already holds. |
| S3-34 | C76 | `~/.claude/plugins/cache/claude-plugins-official/mattpocock-skills/1.2.3/skills/productivity/writing-for-agents/SKILL.md:63–63`; raw exact | Coining your own works if you define it clearly, but a made-up word recruits no priors — you pay in definition tokens what a pretrained word gives free; reach for an existing word first. |
| S3-35 | C75 | `~/.claude/plugins/cache/claude-plugins-official/mattpocock-skills/1.2.3/skills/productivity/writing-for-agents/SKILL.md:65–65`; raw exact | In the body, _execution_: the agent reaches for the same behaviour every time the word appears, and inside flat reference it focuses attention on a class of thing to look for. |
| S3-36 | C75 | `~/.claude/plugins/cache/claude-plugins-official/mattpocock-skills/1.2.3/skills/productivity/writing-for-agents/SKILL.md:65–65`; raw exact | In a pointer, _invocation_: when the same word lives in your prompts, your docs, and your codebase, the agent links that shared language to the material and reaches it more reliably. |
| S3-37 | C75 | `~/.claude/plugins/cache/claude-plugins-official/mattpocock-skills/1.2.3/skills/productivity/writing-for-agents/SKILL.md:72–72`; raw exact | You win twice: fewer tokens, and a sharper hook for the agent to hang its thinking on. |
| S3-38 | C48 | `~/.claude/plugins/cache/claude-plugins-official/mattpocock-skills/1.2.3/skills/productivity/writing-for-agents/SKILL.md:74–74`; raw exact | **Negation** is the failure mode beside this lever: steering by prohibition drags the forbidden behaviour into context and makes it _more_ available, not less. |
| S3-39 | C48 | `~/.claude/plugins/cache/claude-plugins-official/mattpocock-skills/1.2.3/skills/productivity/writing-for-agents/SKILL.md:74–74`; raw exact | _Don't think of an elephant_, and the elephant is all there is; the negation is a weak modifier the strongly-activated concept overruns, so the ban half-reads as an instruction to do the thing. |
| S3-40 | C48 | `~/.claude/plugins/cache/claude-plugins-official/mattpocock-skills/1.2.3/skills/productivity/writing-for-agents/SKILL.md:74–74`; raw exact | Prompt the **positive** — state the target behaviour ("write one-line comments") so the banned one is never spoken. |
| S3-41 | C48 | `~/.claude/plugins/cache/claude-plugins-official/mattpocock-skills/1.2.3/skills/productivity/writing-for-agents/SKILL.md:74–74`; raw exact | A prohibition earns its place only as a hard guardrail you cannot phrase positively; even then, pair it with the positive target so attention lands on what to do. |
| S3-42 | C77 | `~/.claude/plugins/cache/claude-plugins-official/mattpocock-skills/1.2.3/skills/productivity/writing-for-agents/SKILL.md:78–78`; raw exact | Keep each meaning in a **single source of truth**: one authoritative place, so changing the behaviour is a one-place edit. |
| S3-43 | C77 | `~/.claude/plugins/cache/claude-plugins-official/mattpocock-skills/1.2.3/skills/productivity/writing-for-agents/SKILL.md:78–78`; raw exact | **Duplication** — the same meaning in more than one place — costs maintenance and tokens, and inflates a meaning's prominence on the ladder past its real rank. |
| S3-44 | C78 | `~/.claude/plugins/cache/claude-plugins-official/mattpocock-skills/1.2.3/skills/productivity/writing-for-agents/SKILL.md:79–79`; raw exact | The **environment** is a source of truth too — `package.json` scripts, config files, the directory layout, `--help` output — and a document that restates it is a **cache**: a copy of a lookup, earning its load only when the lookup is expensive. |
| S3-45 | C78 | `~/.claude/plugins/cache/claude-plugins-official/mattpocock-skills/1.2.3/skills/productivity/writing-for-agents/SKILL.md:79–79`; raw exact | Cache what the agent cannot find by looking: the unwritten convention, the reason behind a choice, the gotcha no config confesses. |
| S3-46 | C01 | `~/.claude/plugins/cache/claude-plugins-official/mattpocock-skills/1.2.3/skills/productivity/writing-for-agents/SKILL.md:80–80`; raw exact | - Check every line for **relevance**: does it still bear on what the document does? |
| S3-47 | C01 | `~/.claude/plugins/cache/claude-plugins-official/mattpocock-skills/1.2.3/skills/productivity/writing-for-agents/SKILL.md:80–80`; raw exact | Without a pruning discipline the default fate is **sediment**: stale layers that settle because adding feels safe and removing feels risky, until you must core down through them to find what is still live. |
| S3-48 | C02 | `~/.claude/plugins/cache/claude-plugins-official/mattpocock-skills/1.2.3/skills/productivity/writing-for-agents/SKILL.md:81–81`; raw exact | - Hunt **no-ops** sentence by sentence: an instruction the model already obeys by default pays load to say nothing. |
| S3-49 | C02 | `~/.claude/plugins/cache/claude-plugins-official/mattpocock-skills/1.2.3/skills/productivity/writing-for-agents/SKILL.md:81–81`; raw exact | The test — does it change behaviour versus the default? — is model-relative, not reader-relative: two people disagreeing about a no-op disagree about the default, and settle it by running the document, not by debate. |
| S3-50 | C02 | `~/.claude/plugins/cache/claude-plugins-official/mattpocock-skills/1.2.3/skills/productivity/writing-for-agents/SKILL.md:81–81`; raw exact | When a sentence fails, delete the whole sentence rather than trim words from it. |
| S3-51 | C79 | `~/.claude/plugins/cache/claude-plugins-official/mattpocock-skills/1.2.3/skills/productivity/writing-for-agents/SKILL.md:81–81`; raw exact | The test also grades leading words: a word too weak to beat the default (_be thorough_ when the agent is already thorough-ish) is a no-op, and the fix is a stronger word (_relentless_), not a different technique. |
| S3-52 | C06 | `~/.claude/plugins/cache/claude-plugins-official/mattpocock-skills/1.2.3/skills/productivity/writing-for-agents/SKILL-MECHANICS.md:3–3`; raw exact | The skill-specific branch of [`writing-for-agents`](SKILL.md): what changes when the document is a skill — frontmatter, the invocation choice, and router skills. |
| S3-53 | C80 | `~/.claude/plugins/cache/claude-plugins-official/mattpocock-skills/1.2.3/skills/productivity/writing-for-agents/SKILL-MECHANICS.md:9–9`; raw exact | - A **model-invoked** skill keeps a `description`, so the agent can fire it autonomously — and other skills can reach it. |
| S3-54 | C80 | `~/.claude/plugins/cache/claude-plugins-official/mattpocock-skills/1.2.3/skills/productivity/writing-for-agents/SKILL-MECHANICS.md:9–9`; raw exact | You can still type its name: model-invocation always _includes_ user reach; a description only ever adds agent discovery, never removes the human's. |
| S3-55 | C03 | `~/.claude/plugins/cache/claude-plugins-official/mattpocock-skills/1.2.3/skills/productivity/writing-for-agents/SKILL-MECHANICS.md:9–9`; raw exact | The description is the skill's top-level context pointer, forced to stay loaded at all times — permanent context load in exchange for discoverability. |
| S3-56 | C82 | `~/.claude/plugins/cache/claude-plugins-official/mattpocock-skills/1.2.3/skills/productivity/writing-for-agents/SKILL-MECHANICS.md:9–9`; raw exact | A model-invoked skill whose content is all reference is also one home for shared reference: another skill can invoke it, so reference needed by several skills lives in one place. |
| S3-57 | C80 | `~/.claude/plugins/cache/claude-plugins-official/mattpocock-skills/1.2.3/skills/productivity/writing-for-agents/SKILL-MECHANICS.md:9–9`; raw exact | Mechanics: omit `disable-model-invocation`, and write a model-facing description carrying the trigger branches (the pointer-writing rules in `SKILL.md` apply in full). |
| S3-58 | C81 | `~/.claude/plugins/cache/claude-plugins-official/mattpocock-skills/1.2.3/skills/productivity/writing-for-agents/SKILL-MECHANICS.md:10–10`; raw exact | - A **user-invoked** skill strips the description from the agent's reach: only the human typing its name can invoke it, and no other skill can. |
| S3-59 | C81 | `~/.claude/plugins/cache/claude-plugins-official/mattpocock-skills/1.2.3/skills/productivity/writing-for-agents/SKILL-MECHANICS.md:10–10`; raw exact | Zero context load, but it spends cognitive load — you are the index that must remember it exists. |
| S3-60 | C81 | `~/.claude/plugins/cache/claude-plugins-official/mattpocock-skills/1.2.3/skills/productivity/writing-for-agents/SKILL-MECHANICS.md:10–10`; raw exact | Mechanics: set `disable-model-invocation: true`; the `description` becomes human-facing — a one-line summary, trigger lists stripped. |
| S3-61 | C81 | `~/.claude/plugins/cache/claude-plugins-official/mattpocock-skills/1.2.3/skills/productivity/writing-for-agents/SKILL-MECHANICS.md:12–12`; raw exact | Pick model-invocation only when the agent must reach the skill on its own, or another skill must. |
| S3-62 | C81 | `~/.claude/plugins/cache/claude-plugins-official/mattpocock-skills/1.2.3/skills/productivity/writing-for-agents/SKILL-MECHANICS.md:12–12`; raw exact | If it only ever fires by hand, make it user-invoked and pay no context load. |
| S3-63 | C83 | `~/.claude/plugins/cache/claude-plugins-official/mattpocock-skills/1.2.3/skills/productivity/writing-for-agents/SKILL-MECHANICS.md:14–14`; raw exact | Shared reference that two user-invoked skills both need can live in neither — with no descriptions, neither can fire the other. |
| S3-64 | C83 | `~/.claude/plugins/cache/claude-plugins-official/mattpocock-skills/1.2.3/skills/productivity/writing-for-agents/SKILL-MECHANICS.md:14–14`; raw exact | Push it to a plain file outside the skill system: external reference any skill can point at. |
| S3-65 | C84 | `~/.claude/plugins/cache/claude-plugins-official/mattpocock-skills/1.2.3/skills/productivity/writing-for-agents/SKILL-MECHANICS.md:18–18`; raw exact | The invocation cut of splitting (the sequence cut lives in `SKILL.md`): split off a model-invoked skill when you have a distinct leading word that should trigger it on its own — a trigger word you actually use in your prompts — or another skill must reach it. |
| S3-66 | C84 | `~/.claude/plugins/cache/claude-plugins-official/mattpocock-skills/1.2.3/skills/productivity/writing-for-agents/SKILL-MECHANICS.md:18–18`; raw exact | You pay context load for the new always-loaded description, so that independent reach has to be worth it. |
| S3-67 | C85 | `~/.claude/plugins/cache/claude-plugins-official/mattpocock-skills/1.2.3/skills/productivity/writing-for-agents/SKILL-MECHANICS.md:22–22`; raw exact | When user-invoked skills multiply past what you can remember, that piled-up cognitive load is cured by a **router skill**: one user-invoked skill that names the others and when to reach for each, so the human has one skill to remember instead of many. |
| S3-68 | C85 | `~/.claude/plugins/cache/claude-plugins-official/mattpocock-skills/1.2.3/skills/productivity/writing-for-agents/SKILL-MECHANICS.md:22–22`; raw exact | It can only hint, never fire them: user-invoked skills have no description, so nothing but the human can reach them. |

## Verification evidence and limits

- Coverage observed: 173 unique survey rows, 85 unique claims, 182 memberships, 255 target verdicts, 0 invalid verdicts, 0 unplaced IDs, 0 invented IDs.
- Citation extraction: 102 distinct pinned target/record sed ranges and 173 localized source sed ranges; every extraction exited 0 and its bytes matched the stored quote.
- Source grep protocol: `rg -n -F -- <complete survey quote> <saved source>` for all 173; 128 literal matches. For the 45 remaining rows, `rg -c -F -- <normalized complete quote without added terminal punctuation> <normalized saved source>` returned 1 matching line and exit 0 in every case. These are quotation checks, not application or model tests.
- Read scope: W 1–51, K 1–42, stages 1–320 (only content rules used for A), audit 1–158, rethink 1–89, rewrite 1–183; C codex 194–217 and 294–325; C orchestrate 115–156. Records: terse README 1–90 and research README 1–22, extracted with `git show 8c041b7:<path>`.
- Read the entire S1-findings.md (183 lines), survey.md (83 lines) and S3_report.md (88 lines); the initially truncated display was completed with separate sed reads. No rows were inferred from missing S2 numbers.
- Commands that failed while constructing the report (both started): `python3 $TMPDIR/astra-p1-map-2026-09-22/build_report.py` — exit 1 — `ValueError: ('tpermission', [30, 57], 'Announce the count')`; same command — exit 1 — `ValueError: ('strict', [81, 152], 'In a Workflow')`. Both ambiguous anchors were made unique and the generator then completed. These were local report-generation errors, not failed product tests.
- No product test suite or model experiment was run. Improvement, human-transfer effect sizes, model-specific defaults, current installed-host invocation semantics and undocumented source experiment designs remain unknown.
- The repository started with an existing modification to research/README.md and an untracked research/2026-09-22-terse-process/ directory. P1 neither used those as pinned evidence nor wrote them. The artifact validation records final status separately.

## Unsettled

The saved pages do not settle the Astra testing contradiction, the GPT/reasoning taxonomy’s applicability to Astra, or any candidate’s gain on this repository. Reported vendor measurements lack protocols/denominators. S2’s missing evaluation rows and its sparse numbering are preserved, not repaired into a new survey. The standards-count wording in the pinned README is internally inconsistent. Forty-five survey quotations are not byte-verbatim; their complete words are located after the explicitly logged formatting/punctuation normalization. No source row is otherwise unplaced. Gaps are bounded to these surveys and the saved-page checks, not a claim of exhaustive knowledge of vendor guidance.
