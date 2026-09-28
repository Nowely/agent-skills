# Final principles: D1 draft after the J1 verdicts and the stress test

Inputs: 30 draft principles; J1 verdicts (keep 14 / revise 15 / unknown 1); 313 principle × episode stress pairs; 172 counterexample-search findings.

## How the verdicts and the stress test were applied

- **J1 verdict.** `keep`: the draft statement stands. `revise`: J1's revised statement and boundaries replace the draft's (J1 wrote them in Russian; the English rendering here is mine and stays as close as the sentence shape allows); the draft's boundaries that still hold are kept after J1's. `unknown`: the principle moves to the candidates section with J1's missing check.
- **Disagreement rule.** Where I read the evidence differently from J1, the verdict stands and the difference is recorded as a separate reading-difference line. There is no principle where I disagree with the verdict itself; three notes record a difference in reading (P02, P09) or a strength change that follows from the stress test (P15).
- **Stress test, pairs.** A citation the stress test marked `out_of_scope` or `insufficient_data` leaves the support list. Of the five `contradicts` pairs, J1 ruled four false (E0279 for P05, E0315 for P17, E0052 for P15, E0128 for P11); the first three stay in support, E0128 moves to boundaries where the draft already had it; E0308 (P18) narrows the scope and was already counter-evidence. Of the three `contradicts` from the counterexample search, J1 ruled two false (P07, P28) and one a scope boundary (P21). Independent dialogs and strength are recounted from what remains.
- **Stress test, counterexample search.** Findings are reported per principle (contradicts / narrows_scope / supports_new, with the number of new turns verified against source evidence and the dialogs they come from). They are turns, not merged episodes, so they are not added to the support lists; J1 also found that 91 of the 151 `supports_new` repeat turns already counted.
- **Strength.** strong ≥4 independent dialogs and no counter-evidence; moderate 2–3, or ≥4 with counter-evidence; weak 1. Recounted after the removals.

## Summary

| id | principle | J1 | strength (draft → final) | dialogs (draft → final) | removed by stress | cx contradicts / narrows / supports_new (verified turns) | template risk (J1) |
|---|---|---|---|---|---|---|---|
| P01 | Include what this reader will use; cut the rest | keep | strong → strong | 11 → 11 | 0 | 0 / 6 / 15 (15) | low |
| P02 | Account for every point the reader raised | keep | strong → strong | 8 → 5 | 3 | 0 / 0 / 2 (2) | low |
| P03 | Say why the thing exists or what it is for | keep | strong → strong | 6 → 6 | 0 | 0 / 0 / 7 (6) | low |
| P04 | Show a small concrete case | keep | moderate → moderate | 3 → 3 | 0 | 0 / 0 / 2 (2) | low |
| P05 | Assert only as far as it was checked, and say against what | keep | strong → strong | 9 → 9 | 0 | 0 / 1 / 9 (9) | low |
| P06 | Size an evaluation to the reader's actual situation | keep | strong → strong | 7 → 7 | 0 | 0 / 2 / 3 (2) | low |
| P07 | Report the reader's position only in their words; nothing is final before their word | keep | moderate → moderate | 3 → 3 | 0 | 1 / 0 / 0 (0) | low |
| P08 | Fewer words per point, not fewer points | keep | strong → strong | 10 → 9 | 1 | 0 / 1 / 19 (18) | low |
| P09 | Write as a person would; pleasant to read is a criterion | revise | strong → strong | 10 → 10 | 0 | 0 / 0 / 7 (7) | low |
| P10 | Use the reader's own terms; no coinages, no names of things that do not exist | revise | strong → strong | 5 → 5 | 1 | 0 / 2 / 6 (6) | high |
| P11 | Say what a label stands for | keep | strong → strong | 5 → 5 | 1 | 0 / 0 / 4 (4) | low |
| P12 | Say it once | keep | moderate → moderate | 4 → 3 | 1 | 0 / 0 / 1 (1) | low |
| P13 | Prose in the reader's language, artifacts in the repository's — not as a stored rule | revise | strong → strong | 8 → 8 | 0 | 0 / 0 / 5 (5) | high |
| P14 | Open with what it is for | revise | moderate → moderate | 3 → 3 | 1 | 0 / 0 / 7 (5) | high |
| P15 | State conclusions explicitly, and first | revise | strong → moderate | 4 → 2 | 2 | 0 / 0 / 3 (3) | high |
| P16 | For a decision, give the options and mark the recommendation | revise | strong → strong | 5 → 5 | 0 | 0 / 0 / 4 (4) | high |
| P17 | For a change, show what concretely changes and what it does for the reader | keep | strong → strong | 9 → 8 | 1 | 0 / 1 / 8 (8) | low |
| P18 | Tables to compare, not to dump | revise | moderate → moderate | 4 → 3 | 1 | 0 / 0 / 4 (4) | high |
| P19 | Give the text visible structure, at the level of good examples in its genre | revise | strong → strong | 7 → 7 | 1 | 0 / 1 / 10 (10) | high |
| P20 | Hand over transferable text as a self-contained block | revise | strong → strong | 11 → 8 | 4 | 0 / 0 / 3 (2) | high |
| P21 | A code comment says why the code exists, or it goes | revise | strong → strong | 6 → 6 | 6 | 1 / 0 / 4 (4) | high |
| P22 | Start from the genre's convention and the project's precedent, as a default | keep | strong → strong | 9 → 9 | 0 | 0 / 3 / 10 (10) | low |
| P23 | A title names the whole change | revise | moderate → moderate | 2 → 2 | 0 | 0 / 0 / 1 (1) | high |
| P24 | A PR description gives what, why and the measured effect, scaled to the change | revise | moderate → moderate | 3 → 3 | 0 | 0 / 0 / 2 (2) | high |
| P25 | To another team, give the facts they act on and what each blocks | revise | strong → strong | 7 → 5 | 2 | 0 / 1 / 0 (0) | high |
| P26 | Agent and tool output reaches the user as a human message | revise | strong → strong | 10 → 9 | 2 | 0 / 0 / 7 (6) | high |
| P27 | Write the conclusion where its next reader will look | keep | strong → strong | 6 → 6 | 0 | 0 / 0 / 4 (3) | low |
| P28 | Rules for future texts are direction with a reason and a scope, not required content | keep | moderate → moderate | 2 → 2 | 0 | 1 / 0 / 3 (3) | low |
| P29 | Durable text does not pin what will drift | revise | strong → strong | 5 → 5 | 0 | 0 / 0 / 0 (0) | high |
| P30 | When a sentence overstates, cut or replace it — do not add a qualifying clause | unknown | moderate → candidate | 2 → 2 | 0 | 0 / 0 / 1 (1) | high |

Totals: 29 principles — 20 strong, 9 moderate, 0 weak; 1 candidate (P30). Citations removed by the stress test: 27. Strength changed by the recount: P15 strong→moderate.

## Principles and candidate

### P01: Include what this reader will use; cut the rest (strong; J1 keep)

**Statement.** When choosing what goes into a text, keep what this reader will use to understand, decide or act (the evidence of the work included) and cut internals, side findings and anything kept without a concrete use, because every extra item is load the reader has to carry and sort before they reach what they came for.

**Mechanism.** Repeated feedback objected to irrelevant detail and technical backstory, while other cases asked for full decision lists, local measurements, and detailed PR evidence. The useful amount depends on what this reader needs.

**Boundaries.** Use, not length, is the criterion. A decision may need a full list, and a large PR may need local figures and a detailed report. Name the reader before cutting or keeping detail.

**J1.** keep; decisive episode E0197; template risk low. Reason (paraphrased): the user rejects report items that need no action; support spans 11 dialogs beyond the writing-topic sessions; the full-list and detailed-PR cases are boundaries the principle already carries.

**Evidence after the stress test.** 21 episodes: E0020, E0031, E0064, E0066, E0072, E0132, E0134, E0151, E0195, E0197, E0199, E0212, E0227, E0240, E0249, E0270, E0271, E0305, E0306, E0253, A2e-03. Independent dialogs: 11 (D007, D008, D029, D051, D078, D081, D093, D103, D110, D112, D115); draft had 11. Nothing removed.
Counterexample search: contradicts 0, narrows_scope 6, supports_new 15 (15 turns with a verified quote, dialogs D004, D029, D030, D050, D051, D076, D078, D081, D093, D110, D112, D115; not counted).
Boundary episodes: E0083, E0084, E0014, E0016, E0157, E0219, E0274, E0298, E0312, E0318, E0322, A2b-01, A2-01, A2-12.

**Template risk.** A blanket brevity rule could delete material the reader needs; check each item for reader use.

**Cited episode IDs.** E0195, E0197, E0132, E0270, E0134, E0305, A2e-03, E0084, E0298, E0312, A2b-01, A2-01, E0016, E0157, A2-12, E0020, E0031, E0064, E0066, E0072, E0151, E0199, E0212, E0227, E0240, E0249, E0271, E0306, E0253, E0083, E0014, E0219, E0274, E0318, E0322.

### P02: Account for every point the reader raised (strong; J1 keep)

**Statement.** When a reply or a revision follows a message with several points, account for each one — answer it, apply it, or say why not — before proposing next steps, because a dropped point comes back as a repeat request and reads as disregard rather than as an edit.

**Mechanism.** The reader returned to unanswered points, omitted questions, and forgotten revision requirements. A reply should account for the original request before moving to next steps.

**Boundaries.** A response to a neighboring question still misses the request. Accounting for a point can be brief and need not restate it.

**J1.** keep; decisive episode E0049; template risk low. Reason (paraphrased): the user sends the assistant back to the original questions; confirmed outside the writing-topic sessions; the stress remarks on E0222/E0231 hold for the multiple-point condition; E0274 is mainly a synthesis defect.

**Evidence after the stress test.** 7 episodes: E0003, E0024, E0049, E0127, E0130, E0249, E0270. Independent dialogs: 5 (D003, D007, D017, D078, D112); draft had 8. Removed: E0222 (out_of_scope), E0274 (insufficient_data), E0231 (out_of_scope).
Counterexample search: contradicts 0, narrows_scope 0, supports_new 2 (2 turns with a verified quote, dialogs D017, D085; not counted).

**Template risk.** A mandatory response checklist section could add noise; a single line may close every point.

**Cited episode IDs.** E0049, E0274, E0130, E0024, E0003, E0270, E0249, E0231, E0127, E0199, E0222.

### P03: Say why the thing exists or what it is for (strong; J1 keep)

**Statement.** When a text asks the reader to accept something — a list in code, a rule, a removal, a problem statement, a step — say why it exists or what it is for, because the reader judges whether it is needed and the reason is the input to that judgement.

**Mechanism.** Requests about code lists, removals, problem statements, and README openings asked for the purpose or reason so a reader could judge whether the item was needed.

**Boundaries.** Explaining a proposal’s purpose differs from diagnosing the cause of a defect. Put the reason at the point of use, without a story about the writer’s process.

**J1.** keep; decisive episode E0292; template risk low. Reason (paraphrased): the user separates the needed purpose of a list from an unneeded story about one package; questions of purpose recur in other dialogs; E0058 forbids diagnosing defects in a note to another team, not explaining a proposal; no mandatory purpose section follows.

**Evidence after the stress test.** 7 episodes: E0027, E0133, E0214, E0239, E0285, E0292, E0320. Independent dialogs: 6 (D007, D078, D101, D112, D115, D117); draft had 6. Nothing removed.
Counterexample search: contradicts 0, narrows_scope 0, supports_new 7 (6 turns with a verified quote, dialogs D004, D007, D036, D081, D117, D120; not counted).
Boundary episodes: E0058.

**Template risk.** A mandatory purpose heading on every document would overapply the rule; use it where the reader must judge a thing.

**Cited episode IDs.** E0292, E0285, E0239, E0320, E0214, E0027, E0133, E0058, E0171.

### P04: Show a small concrete case (moderate; J1 keep)

**Statement.** When a claim or a feature is abstract, show a small concrete case — a before/after snippet, a demo, a real failure — because the reader then sees what they will meet instead of decoding a description.

**Mechanism.** The reader valued a demo, before and after examples, and concrete failure cases because they made an abstract feature or claim visible.

**Boundaries.** A concrete case remedies abstraction; it does not require a demo in every README.

**J1.** keep; decisive episode E0312; template risk low. Reason (paraphrased): a concrete comparative reaction with the mechanism stated by the user; three dialogs; no proof that a demo is mandatory.

**Evidence after the stress test.** 3 episodes: E0013, E0241, E0312. Independent dialogs: 3 (D004, D112, D115); draft had 3. Nothing removed.
Counterexample search: contradicts 0, narrows_scope 0, supports_new 2 (2 turns with a verified quote, dialogs D061, D115; not counted).

**Template risk.** An example in every text would overapply a remedy meant for abstraction.

**Cited episode IDs.** E0312, E0013, E0241.

### P05: Assert only as far as it was checked, and say against what (strong; J1 keep)

**Statement.** When a sentence asserts something the reader may act on — a cause, a risk, a number, a comparison, a nonexistence claim, an impossibility claim — assert it only as far as it was checked and say against what (a codebase precedent, a measurement, the current version); otherwise mark it as a guess or give an honest range, because the reader acts on such sentences and comes back when they overreach.

**Mechanism.** The reader corrected claims that exceeded checks, stale facts, false constants, and unmeasured comparisons. Grounding the claim in the actual code, version, or measurement made it usable.

**Boundaries.** Domain corrections show the cost of unchecked assertions. An honest range is useful content rather than a hedge.

**J1.** keep; decisive episode E0244; template risk low. Reason (paraphrased): rejects an unsupported unsupported repair claim in an RFC; nine dialogs; the E0279 apparent contradiction is false — the principle limits claim strength to what was checked, not to maximal numeric precision.

**Evidence after the stress test.** 16 episodes: E0012, E0042, A2a-01, E0065, E0087, E0112, E0156, E0161, E0207, E0244, E0246, E0266, E0267, E0297, E0279, E0283. Independent dialogs: 9 (D002, D007, D029, D060, D062, D081, D097, D115, D117); draft had 9. Nothing removed.
Counterexample search: contradicts 0, narrows_scope 1, supports_new 9 (9 turns with a verified quote, dialogs D004, D007, D028, D060, D081, D097, D117; not counted).

**Template risk.** Labels on every claim would clutter text; qualify only actionable assertions that need grounding.

**Cited episode IDs.** E0267, E0161, E0042, E0297, A2a-01, E0207, E0112, E0156, E0279, E0283, E0284, E0246, E0244, E0194, E0319, E0224, E0056, E0012, E0065, E0087, E0266.

### P06: Size an evaluation to the reader's actual situation (strong; J1 keep)

**Statement.** When a text evaluates something — calls it a breaking change, a risk, a threat, a failure, an excuse — size the verdict to who is actually affected and to this reader's goal, because a verdict that ignores the reader's situation reads as noise or as a misreading of what they are trying to do.

**Mechanism.** The same severity label mattered in one context and overstated another. Reader goal and affected audience determined whether a verdict was proportionate.

**Boundaries.** A severity label may be correct for external integrators and excessive for a single consumer. The rule does not call for softer labels by default.

**J1.** keep; decisive episode E0041; template risk low. Reason (paraphrased): the same label (severity) is noise for a single-consumer script (E0041) and required for a library with integrators (E0098); this pair is stronger than a general wish to soften verdicts.

**Evidence after the stress test.** 8 episodes: E0041, E0098, E0065, E0087, E0181, E0216, E0256, E0273. Independent dialogs: 7 (D007, D029, D062, D067, D081, D103, D112); draft had 7. Nothing removed.
Counterexample search: contradicts 0, narrows_scope 2, supports_new 3 (2 turns with a verified quote, dialogs D007, D029; not counted).

**Template risk.** Avoiding strong words by default would hide real severity; check affected readers first.

**Cited episode IDs.** E0041, E0098, E0065, E0087, E0181, E0256, E0273, E0216.

### P07: Report the reader's position only in their words; nothing is final before their word (moderate; J1 keep)

**Statement.** When reporting what the user decided, wants or approved, use only what they said, and do not call a draft final before they have said so, because a position they never took tells them they were not heard.

**Mechanism.** The reader rejected a position attributed to them and a draft described as final before approval. Report decisions only at the strength the reader actually expressed.

**Boundaries.** Evidence comes mainly from two plugin design sessions; the pattern has not been observed in the code projects.

**J1.** keep; decisive episode E0025; template risk low. Reason (paraphrased): an attributed position is rejected outright; E0303 rejects a premature final; three dialogs, mostly one product, so moderate; the cx apparent contradiction shows the assistant violating the principle, not the user wanting invented decisions.

**Evidence after the stress test.** 4 episodes: E0025, E0205, E0303, A2e-01. Independent dialogs: 3 (D007, D097, D112); draft had 3. Nothing removed.
Counterexample search: contradicts 1, narrows_scope 0, supports_new 0 (0 turns with a verified quote, dialogs —; not counted).

**Template risk.** Fear of misattribution could erase real decisions; record decisions at their observed strength.

**Cited episode IDs.** E0025, E0205, E0303, A2e-01.

### P08: Fewer words per point, not fewer points (strong; J1 keep)

**Statement.** When making a point, use as few words as carry it and drop filler sentences — cut words per point, not the points the reader asked for — because the user reads padding as noise and asks for text that is relevant.

**Mechanism.** Feedback repeatedly requested shorter wording while also requesting missing examples, options, and results. The recurring issue was padding within a point, not completeness of the response.

**Boundaries.** Brevity applies to wording, not requested substance. Detailed analysis, a complete list before deletion, or experiment results may be needed; a short draft can still omit the useful point.

**J1.** keep; decisive episode E0241; template risk low. Reason (paraphrased): one reaction asks for less text and a useful example at once; ten dialogs across genres; A2b-01 and A2-12 bound it by the completeness of needed material.

**Evidence after the stress test.** 17 episodes: E0049, E0117, E0118, E0195, E0198, E0223, E0234, E0235, E0238, E0241, E0245, E0263, E0268, E0277, E0269, E0249, A2e-03. Independent dialogs: 9 (D017, D075, D093, D098, D111, D112, D113, D115, D117); draft had 10. Removed: E0221 (insufficient_data).
Counterexample search: contradicts 0, narrows_scope 1, supports_new 19 (18 turns with a verified quote, dialogs D001, D028, D030, D060, D075, D078, D081, D101, D111, D112, D113, D115, D117, D124; not counted).
Boundary episodes: E0014, E0083, E0084, E0219, E0274, E0298, E0312, E0322, A2b-01, A2-01, A2-12.

**Template risk.** A word budget could cut needed content; edit each sentence for contribution.

**Cited episode IDs.** E0235, E0245, E0263, E0223, E0277, E0268, E0117, E0198, E0251, E0171, E0014, E0219, E0322, A2b-01, A2-12, E0312, E0241, E0049, E0118, E0195, E0234, E0238, E0269, E0249, A2e-03, E0221, E0083, E0084, E0274, E0298, A2-01, E0187.

### P09: Write as a person would; pleasant to read is a criterion (strong; J1 revise)

**Statement.** When a technical or working text is meant for a person, choose phrasing that is natural for their language and the genre and check that it reads easily, because a machine register and heavy constructions get in the way of even the content the reader needs.

**Mechanism.** The reader reacted to heavy, unnatural wording across documentation, messages, PR text, and comments. Pleasant reading was a stated criterion, while the complaints also involved length and substance.

**Boundaries.** Observed in working correspondence, documentation, PRs, and comments. Transfer to literary genres and a causal priority over content remain unknown. A preference ranking was stated in one dialog; bans on punctuation or emphasis do not follow.

**J1.** revise; decisive episode E0262; template risk low. Reason (paraphrased): E0262 supports naturalness in a concrete PR description, but not that every text must sound like a colleague, nor that an unpleasant style is always rejected before content; the top-criterion ranking is one dialog; unnatural style complaints mix vocabulary, length and content.

**Evidence after the stress test.** 15 episodes: E0047, E0113, E0119, E0142, E0203, E0238, E0247, E0262, E0264, E0268, E0276, E0302, E0304, A2-07, A2c-05. Independent dialogs: 10 (D017, D074, D075, D078, D081, D084, D097, D112, D115, D117); draft had 10. Nothing removed.
Counterexample search: contradicts 0, narrows_scope 0, supports_new 7 (7 turns with a verified quote, dialogs D017, D076, D078, D112, D115, D117; not counted).

**Template risk.** Mechanical tone rules could replace the reader’s actual response to the text.

**Cited episode IDs.** E0304, E0047, E0113, E0262, E0264, E0247, E0203, A2-07, A2c-05, E0238, E0240, E0244, E0245, E0246, E0268, E0285, E0313, E0119, E0142, E0276, E0302.

### P10: Use the reader's own terms; no coinages, no names of things that do not exist (strong; J1 revise)

**Statement.** When naming a thing for a reader, prefer the term they already know that is exact in this context; introduce a new or internal name only where it helps tell apart things the reader needs to tell apart, because otherwise the reader spends effort decoding for no gain.

**Mechanism.** The reader questioned unfamiliar internal labels, unexplained jargon, and names for things that did not yet exist. Established terms and clear status reduced decoding work.

**Boundaries.** Respect established terms, public name continuity, and product versus component naming. Explain necessary terms and mark planned things as planned. Three of five dialogs concern one internal coinage; after a rename, related pages must be consistent.

**J1.** revise; decisive episode E0178; template risk high. Reason (paraphrased): E0178 supports familiar genre terminology, but three of five dialogs are the same coinage in one product; the counterexample search shows public-name continuity and different naming needs for a tool and its component; this is word choice by role and audience, not a ban on new or technical terms.

**Evidence after the stress test.** 10 episodes: E0120, E0134, E0175, E0178, E0179, E0203, E0208, A2d-01, E0288, E0143. Independent dialogs: 5 (D076, D078, D081, D097, D117); draft had 5. Removed: A2d-03 (insufficient_data).
Counterexample search: contradicts 0, narrows_scope 2, supports_new 6 (6 turns with a verified quote, dialogs D007, D017, D076, D077, D081, D097; not counted).

**Template risk.** A banned word list would miss the next unfamiliar coinage; check terminology against the reader’s field.

**Cited episode IDs.** E0120, E0175, E0178, E0179, E0288, E0208, A2d-01, A2d-03, E0143, E0134, E0203.

### P11: Say what a label stands for (strong; J1 keep)

**Statement.** When referring back to an option, an experiment, an agent or a step, say what it is and not only its label (short experiment, option, agent, or step codes), because the reader does not hold the writer's labels in memory.

**Mechanism.** The reader could not recover the meaning of experiment, option, or agent labels from shorthand alone. Short labels worked when the referent and role remained clear.

**Boundaries.** A short model label can work, but the role still needs to be visible. Expand a back reference when its meaning is no longer apparent.

**J1.** keep; decisive episode E0258; template risk low. Reason (paraphrased): the user names the lost meaning of a label; five dialogs; E0128 is a false contradiction (the id is shortened, but the user notes the role is not visible).

**Evidence after the stress test.** 5 episodes: E0077, E0124, E0126, E0214, E0258. Independent dialogs: 5 (D036, D077, D078, D101, D117); draft had 5. Removed: E0128 (contradicts).
Counterexample search: contradicts 0, narrows_scope 0, supports_new 4 (4 turns with a verified quote, dialogs D004, D078, D097, D117; not counted).
Boundary episodes: E0128.

**Template risk.** Expanding every abbreviation every time would be repetitive; clarify lost back references.

**Cited episode IDs.** E0258, E0077, E0126, E0214, E0124, E0128.

### P12: Say it once (moderate; J1 keep)

**Statement.** When the same thought would appear twice — two README sections, a rules file and a skill page, a comment and the line below it — say it once where the reader needs it, unless a separately read place justifies the repeat, because repetition makes the reader wonder why they are reading it again.

**Mechanism.** The reader noticed repeated ideas across README sections and duplicated rule locations. Repetition was acceptable when a separately read location justified it.

**Boundaries.** A justified reminder may be repeated at an independently read decision point. The evidence mixes prose repetition and rule placement; comments that repeat code are treated separately.

**J1.** keep; decisive episode E0310; template risk low. Reason (paraphrased): a concrete repeat is named; moderate: three of five records are from writing-topic sessions, E0044 is rule placement, E0215 is not a proven repeat; the stated exception already prevents an absolute repetition ban.

**Evidence after the stress test.** 4 episodes: E0044, E0177, E0310, A2e-02. Independent dialogs: 3 (D007, D081, D112); draft had 4. Removed: E0215 (out_of_scope).
Counterexample search: contradicts 0, narrows_scope 0, supports_new 1 (1 turns with a verified quote, dialogs D112; not counted).

**Template risk.** A never repeat rule would remove reminders from independently read places.

**Cited episode IDs.** E0177, E0310, A2e-02, E0044, E0215.

### P13: Prose in the reader's language, artifacts in the repository's — not as a stored rule (strong; J1 revise)

**Statement.** When choosing the language of a reply or of an artifact, follow the reader's current request and the language of the specific project or addressee, because the language must help this text be used; do not turn a one-off request into a standing preference without grounds.

**Mechanism.** The reader requested natural Russian for some reports and English for some artifacts, then refused turning a local language request into a stored preference. Language choice was local to reader and artifact.

**Boundaries.** Observed language requests applied to specific reports, commit titles, and examples. They do not set a default for all future work. A stored language preference conflicted with the reader’s explicit refusal.

**J1.** revise; decisive episode A2b-03; template risk high. Reason (paraphrased): A2b-03 directly limits the preceding request; eight dialogs show repeated local requests, but frequency does not make a permitted standing default; the draft still prescribed Russian for replies and English for all artifacts despite its own caveat.

**Evidence after the stress test.** 11 episodes: E0017, E0019, E0067, E0085, E0104, A2b-03, E0121, E0122, E0182, E0203, E0321. Independent dialogs: 8 (D007, D035, D060, D070, D076, D087, D097, D118); draft had 8. Nothing removed.
Counterexample search: contradicts 0, narrows_scope 0, supports_new 5 (5 turns with a verified quote, dialogs D007, D060, D076, D087, D118; not counted).
Boundary episodes: A2b-03.

**Template risk.** A stored language default would overgeneralize local requests; choose per reader and artifact.

**Cited episode IDs.** E0017, E0067, E0104, E0182, E0321, E0019, E0085, E0121, E0203, A2b-03, E0122.

### P14: Open with what it is for (moderate; J1 revise)

**Statement.** When a README introduces a tool to a new reader, make clear at the start what it is and why they might need it, before introducing optional mechanics, because without that the details do not add up to an understandable offer of value.

**Mechanism.** README feedback asked the opening to explain a tool’s purpose and value before mechanics. This was observed in technical tool introductions, not as a fixed opening for every genre.

**Boundaries.** Checked on technical tool README openings. A sentence, capability description, or demo can work; no fixed section order or marketing paragraph follows. Other genres have other opening tasks. Evidence is concentrated in writing sessions.

**J1.** revise; decisive episode E0134; template risk high. Reason (paraphrased): E0134 is a substantive reaction to a shown opening; E0043 does not prove order; the decisive support is concentrated in the writing-topic dialogs; a README guide is needed, not a universal mission paragraph.

**Evidence after the stress test.** 7 episodes: E0027, E0133, E0134, E0136, E0249, E0270, E0310. Independent dialogs: 3 (D007, D078, D112); draft had 3. Removed: E0043 (out_of_scope).
Counterexample search: contradicts 0, narrows_scope 0, supports_new 7 (5 turns with a verified quote, dialogs D078, D081, D112; not counted).
Boundary episodes: E0310.

**Template risk.** A fixed mission paragraph would overgeneralize technical README evidence; answer the new reader’s first question in a fitting form.

**Cited episode IDs.** E0134, E0133, E0270, E0249, E0310, E0136, E0168, E0171, E0043, E0027, E0313.

### P15: State conclusions explicitly, and first (moderate; J1 revise)

**Statement.** When a report is meant to help judge a result or choose the next step, state a visible short conclusion and the key results before discussing further action — usually it helps to put them near the start — because scattered numbers leave the synthesis to the reader.

**Mechanism.** Reports with scattered measurements left the reader asking for a visible conclusion and key results before further action. A specific audit once needed a more detailed structure.

**Boundaries.** The order of detailed results and conditions depends on task. A four-part audit structure was requested once; only a visible, early conclusion recurs.

**J1.** revise; decisive episode E0275; template risk high. Reason (paraphrased): conclusions existed but were lost among conditions and tables, so visibility of the synthesis is the point; E0052 asks for the verdict first, which does not prove that all results must precede data; E0158/E0186 support presence, not order.

**Evidence after the stress test.** 3 episodes: E0052, E0274, E0275. Independent dialogs: 2 (D028, D117); draft had 4. Removed: E0158 (out_of_scope), E0186 (insufficient_data).
Counterexample search: contradicts 0, narrows_scope 0, supports_new 3 (3 turns with a verified quote, dialogs D087, D117; not counted).

**Template risk.** A four-part audit template would overgeneralize one request; keep the conclusion visible before dense data.

**Cited episode IDs.** E0275, E0274, E0052, E0186, E0158.

### P16: For a decision, give the options and mark the recommendation (strong; J1 revise)

**Statement.** When the reader genuinely has a choice to make, show the substantive workable options, their consequences and a visibly marked recommendation with its reason, because that gives a basis for the decision; use numbering and wording variants where they make the specific choice easier.

**Mechanism.** The reader wanted substantive alternatives and a visible recommendation, then could choose a different option for their own reason. Variant lists were useful when a real choice existed.

**Boundaries.** Do not manufacture choices. Wording variants and numbering help only when searching among alternatives; the recommendation never substitutes for the reader’s decision.

**J1.** revise; decisive episode E0107; template risk high. Reason (paraphrased): a visible recommendation was wanted (it existed but was not found), and the user then chose the other option for a stated reason; help for a choice, not a mandatory menu; seven of thirteen records are variants in one session.

**Evidence after the stress test.** 13 episodes: E0021, E0089, E0090, E0106, E0107, E0280, E0281, E0261, E0284, E0287, E0290, E0293, E0322. Independent dialogs: 5 (D007, D036, D070, D117, D124); draft had 5. Nothing removed.
Counterexample search: contradicts 0, narrows_scope 0, supports_new 4 (4 turns with a verified quote, dialogs D036, D061, D087, D124; not counted).
Boundary episodes: E0107, E0089.

**Template risk.** A fixed three-option menu would invent choices; use options only for real decisions.

**Cited episode IDs.** E0090, E0106, E0107, E0021, E0280, E0281, E0322, E0261, E0284, E0290, E0293, E0287, E0008, E0109, E0089.

### P17: For a change, show what concretely changes and what it does for the reader (strong; J1 keep)

**Statement.** When proposing or reporting a change, show what concretely changes (before → after: the edited text, a small example, numbers per change) and what it means for the reader, including whether they must do anything, because the reader cannot judge a description of mechanism and asks what the change will do.

**Mechanism.** The reader asked for exact edits, before and after examples, measurements, and practical impact. An effect table alone did not satisfy a request to see the change itself.

**Boundaries.** An effect summary does not replace the concrete edit. The reader also needs to know whether the change extends beyond the requested scope.

**J1.** keep; decisive episode E0218; template risk low. Reason (paraphrased): E0218 is explicit praise, not moved_on; E0213 asks for the edits themselves when the effect is already tabled, which the existing boundary covers; E0315 is a false refutation.

**Evidence after the stress test.** 11 episodes: E0013, E0036, E0039, E0051, E0123, E0213, E0214, E0217, E0218, E0259, E0315. Independent dialogs: 8 (D004, D007, D017, D077, D101, D103, D117, D120); draft had 9. Removed: E0137 (out_of_scope).
Counterexample search: contradicts 0, narrows_scope 1, supports_new 8 (8 turns with a verified quote, dialogs D004, D007, D017, D061, D067, D079, D103; not counted).
Boundary episodes: E0213, E0036.

**Template risk.** A fixed impact format would obscure requests for exact edits; answer both change and consequence.

**Cited episode IDs.** E0123, E0039, E0217, E0218, E0315, E0036, E0259, E0213, E0051, E0013, E0214, E0137.

### P18: Tables to compare, not to dump (moderate; J1 revise)

**Statement.** When the reader needs to compare items on the same attributes, consider a table if rows and columns make the comparison easier; for a dense set of data choose the level of detail, a grouping or a list that fits, and state the conclusion the reader needs, because the table form by itself does not make material surveyable.

**Mechanism.** Some comparisons benefited from a table, but dense tables and large lists compressed into a cell were hard to scan. Form followed shared attributes and density.

**Boundaries.** Do not pack many independent items into one table cell. Measurements can be tabular; commands may work as a list. One dialog both requested and rejected different tables.

**J1.** revise; decisive episode E0308; template risk high. Reason (paraphrased): E0308 rejects a table with 26 packages in one cell despite a summary and grouping; other turns ask for a table; the split a fixed table versus summary split is not a universal law.

**Evidence after the stress test.** 3 episodes: E0051, E0173, E0258. Independent dialogs: 3 (D017, D081, D117); draft had 4. Removed: E0249 (out_of_scope).
Counterexample search: contradicts 0, narrows_scope 0, supports_new 4 (4 turns with a verified quote, dialogs D007, D070, D081, D117; not counted).

**Template risk.** Tables everywhere can make dense material harder to read; use them for comparable attributes.

**Cited episode IDs.** E0051, E0258, E0173, E0249, E0275, E0308.

### P19: Give the text visible structure, at the level of good examples in its genre (strong; J1 revise)

**Statement.** When the reader has trouble finding or comparing parts of a text, organise them in a visible way that is customary for the genre — paragraphs, a list, a table or highlighting — because layout helps the reader see connections and what matters; choose the structure by the material and by how it will be read.

**Mechanism.** Feedback linked readability to visible grouping and placement, including finding an entry under the expected heading. Several comparisons changed content and length as well as layout.

**Boundaries.** No fixed line threshold determines headings. A combined list can beat many sections. Comparisons were not controlled for equal content; follow good examples of the same genre.

**J1.** revise; decisive episode A2c-04; template risk high. Reason (paraphrased): A2c-04 compares texts that differ in content and length, so the independent effect of formatting is not established; a checklist was merged into one list; structure helps reading, but line count does not dictate sections.

**Evidence after the stress test.** 10 episodes: E0013, E0166, E0174, E0239, E0269, E0270, E0304, E0295, E0308, A2d-04. Independent dialogs: 7 (D004, D081, D111, D112, D115, D117, D120); draft had 7. Removed: A2c-04 (out_of_scope).
Counterexample search: contradicts 0, narrows_scope 1, supports_new 10 (10 turns with a verified quote, dialogs D074, D077, D081, D111, D112, D117, D120; not counted).

**Template risk.** Headings and bullets on every short reply would add structure without need; match the genre and material.

**Cited episode IDs.** E0304, E0013, E0174, E0295, E0269, E0166, E0308, A2c-04, A2d-04, E0239, E0270.

### P20: Hand over transferable text as a self-contained block (strong; J1 revise)

**Statement.** When a text is to be carried into another context, prepare a self-contained unit that can be pasted in the destination's format, because the conversation's history will not be there; split it the way the reader will move the parts, and use a Markdown block when it is needed to copy the markup.

**Mechanism.** The reader needed text that could move into a clean context, a file, a review comment, or separate RFC fields. The transfer destination determined the block and format.

**Boundaries.** The transferable unit can be a document, RFC field, or message. Use as many blocks as the transfer requires; copyable commands and openable links have separate formatting needs.

**J1.** revise; decisive episode E0243; template risk high. Reason (paraphrased): E0243 splits three parts of one RFC, not three addressees, so a fixed block rule does not follow; E0131 ties the self-contained block to a clean context; clickable links and copyable commands have their own conditions.

**Evidence after the stress test.** 10 episodes: E0003, E0131, E0150, A2c-03, E0158, E0172, E0190, E0198, E0234, A2-09. Independent dialogs: 8 (D003, D078, D081, D082, D084, D093, D111, D114); draft had 11. Removed: E0059 (out_of_scope), E0124 (out_of_scope), E0140 (out_of_scope), E0243 (out_of_scope).
Counterexample search: contradicts 0, narrows_scope 0, supports_new 3 (2 turns with a verified quote, dialogs D078, D082; not counted).

**Template risk.** Fencing every answer would confuse ordinary replies with transferable artifacts.

**Cited episode IDs.** E0131, E0150, E0003, E0243, E0172, E0124, A2-09, A2c-03, E0140, E0158, E0190, E0198, E0234, E0059.

### P21: A code comment says why the code exists, or it goes (strong; J1 revise)

**Statement.** When considering a code comment, keep it if it gives an understanding the reader needs at this point and cannot get from the code and its surroundings — the purpose, a constraint or the reason for a decision — and otherwise remove or rewrite it, because restating and extra detail add reading and maintenance for no gain.

**Mechanism.** The reader removed comments that restated nearby code and kept comments that explained a real purpose or constraint. A generic rule to comment only on invisible facts was insufficient on its own.

**Boundaries.** A causal explanation alone does not justify a comment. Useful exceptions explain a constraint or purpose. Nineteen support episodes come from one comment editing session, and five of six dialogs from one project.

**J1.** revise; decisive episode E0088; template risk high. Reason (paraphrased): E0088 removes a comment that already explained the consequence of a CSS change: a causal does not by itself make a comment needed; E0292 shows when a list's purpose is needed; E0004 allows substantive exceptions; 20 of 30 records are one session.

**Evidence after the stress test.** 24 episodes: E0004, E0005, E0088, A2b-02, E0119, E0144, A2c-01, E0233, E0279, E0280, E0281, E0282, E0283, E0284, E0285, E0286, E0287, E0288, E0289, E0290, E0291, E0292, E0293, E0294. Independent dialogs: 6 (D002, D062, D068, D075, D111, D117); draft had 6. Removed: E0117 (insufficient_data), E0118 (out_of_scope), E0264 (insufficient_data), E0268 (insufficient_data), E0276 (insufficient_data), A2-10 (insufficient_data).
Counterexample search: contradicts 1, narrows_scope 0, supports_new 4 (4 turns with a verified quote, dialogs D002, D075, D078, D117; not counted).
Boundary episodes: E0004, A2c-02.

**Template risk.** A blanket no-comment rule or required purpose opening would discard useful explanations; judge each comment at its location.

**Cited episode IDs.** E0292, E0280, E0004, E0119, E0088, E0233, E0144, A2c-01, A2b-02, A2c-02, E0291, E0293, E0005, E0279, E0281, E0282, E0283, E0284, E0285, E0286, E0287, E0288, E0289, E0290, E0294, E0117, E0118, E0264, E0268, E0276, A2-10.

### P22: Start from the genre's convention and the project's precedent, as a default (strong; J1 keep)

**Statement.** When writing in an established genre (a conventional commit, a changelog, a README, a license, a UI label, a team's PR), start from the project's own precedent and from how well-regarded analogues do it, then fit it to this text, because readers look for what the convention puts in its place — and treat the convention as a default, not as required sections.

**Mechanism.** Commit titles, changelog entries, licenses, README structure, and UI labels were judged against local precedent and genre conventions. The reader also rejected sections copied without a reason.

**Boundaries.** Local practice can override a generic convention. Badges, sections, and document length depend on context; a one-line commit and a long PR can each be appropriate.

**J1.** keep; decisive episode E0230; template risk low. Reason (paraphrased): local changelog practice decides where the reader finds a change; nine dialogs, several genres; the counterexample findings forbid mandatory sections, and the statement already names convention as a reference point.

**Evidence after the stress test.** 18 episodes: E0007, E0092, E0093, E0096, E0102, E0152, E0173, E0174, E0178, E0230, E0231, A2d-04, E0236, E0249, E0270, E0295, E0298, E0261. Independent dialogs: 9 (D002, D064, D067, D078, D081, D111, D112, D113, D117); draft had 9. Nothing removed.
Counterexample search: contradicts 0, narrows_scope 3, supports_new 10 (10 turns with a verified quote, dialogs D064, D067, D078, D112, D115, D117; not counted).
Boundary episodes: E0311, E0312, E0313.

**Template risk.** A fixed section list would turn genre precedent into a template; inspect the local pattern and good analogues.

**Cited episode IDs.** E0173, E0096, E0102, E0230, E0152, E0092, E0295, E0249, E0093, E0236, E0261, E0007, E0311, E0312, E0313, E0084, E0174, E0178, E0231, A2d-04, E0270, E0298.

### P23: A title names the whole change (moderate; J1 revise)

**Statement.** When titling a commit or PR, reflect the main change and its actual scope, because a title with a selective list of details can misstate the scale; generalise to the level that accurately covers the changes, and keep essential specifics when they are the point.

**Mechanism.** A title listing only some changed dependencies misrepresented the scope; the reader selected a broader accurate title. A key specific can still belong in a title when it is the change.

**Boundaries.** A broad title fits a broad dependency update, but a specific title may be right for a focused change. Support is limited to two PR dialogs.

**J1.** revise; decisive episode E0316; template risk high. Reason (paraphrased): a partial list in a title is rejected; two dialogs support matching the whole scope, not a ban on specifics and numbers in every title.

**Evidence after the stress test.** 3 episodes: E0301, E0316, E0317. Independent dialogs: 2 (D117, D120); draft had 2. Nothing removed.
Counterexample search: contradicts 0, narrows_scope 0, supports_new 1 (1 turns with a verified quote, dialogs D120; not counted).

**Template risk.** A title that is too general loses the kind of change; match the actual scope.

**Cited episode IDs.** E0316, E0317, E0301.

### P24: A PR description gives what, why and the measured effect, scaled to the change (moderate; J1 revise)

**Statement.** When a PR description must explain a change and give grounds to assess it, show what changed, why, and which checks or measurements matter for the conclusion, because the reviewer and a future reader need a verifiable sense of the work; choose the level of detail and the placement of the report by the review's task.

**Mechanism.** The reader asked for visible local measurements, checks, and reasons in substantial PRs, while asking for shorter descriptions of smaller changes. The report size followed review needs.

**Boundaries.** Comparable before and after measurements suit optimization; other changes need other evidence. Full experiment logs can live in PR comments. Smaller changes may need short descriptions. Preserve generated sections.

**J1.** revise; decisive episode E0298; template risk high. Reason (paraphrased): visible local results were demanded (present but not visible); five of seven records are one session; A2-12 asks for the full experiment report in PR comments; E0234 asks for a short description; a fixed measurement matrix cannot be prescribed to all PRs.

**Evidence after the stress test.** 7 episodes: E0084, E0259, E0298, E0299, E0300, E0320, A2-12. Independent dialogs: 3 (D004, D112, D117); draft had 3. Nothing removed.
Counterexample search: contradicts 0, narrows_scope 0, supports_new 2 (2 turns with a verified quote, dialogs D098, D111; not counted).
Boundary episodes: E0223, E0234.

**Template risk.** One optimization PR’s headings would not fit every review; retain the content questions and scale.

**Cited episode IDs.** E0298, E0259, E0299, E0300, E0320, E0084, A2-12, E0234, E0223, A2-11.

### P25: To another team, give the facts they act on and what each blocks (strong; J1 revise)

**Statement.** When writing to another team about a problem, select the information for their action — what is observed, under which material conditions, and what it prevents — because the recipient must understand the problem without the history of your conversation; add causes and workarounds if they are verified and help the addressee.

**Mechanism.** When writing to another team, the reader selected observable facts and their practical consequences, cut irrelevant estimates or detail, and sometimes requested no causal diagnosis.

**Boundaries.** A defect list may require only observable facts; joint diagnosis may need verified causes. Version, estimates, and format depend on recipient. Evidence comes from two projects in one workplace.

**J1.** revise; decisive episode E0199; template risk high. Reason (paraphrased): one fact and its consequence for the receiving team are selected while unneeded items are deleted; seven dialogs inside one company; a ban on diagnosis was said once; a fixed message format cannot be extended to every reviewer reply or ticket.

**Evidence after the stress test.** 7 episodes: E0058, E0071, E0072, E0193, E0198, E0199, E0227. Independent dialogs: 5 (D030, D051, D067, D093, D110); draft had 7. Removed: E0263 (out_of_scope), A2-09 (insufficient_data).
Counterexample search: contradicts 0, narrows_scope 1, supports_new 0 (0 turns with a verified quote, dialogs —; not counted).

**Template risk.** A no-diagnosis rule would suppress helpful verified causes; the defect-list request had a narrower scope.

**Cited episode IDs.** E0199, E0058, E0072, E0227, E0263, A2-09, E0193, E0071, E0198.

### P26: Agent and tool output reaches the user as a human message (strong; J1 revise)

**Statement.** When passing a tool's or an agent's result to a person, synthesise the conclusions and grounds they need in plain language, because a service protocol under the assistant's voice makes the result harder to understand; show internal details to the extent they are needed for checking or for the next action.

**Mechanism.** The reader disliked internal protocol and tool details appearing as the assistant’s answer. They wanted a human synthesis, with technical evidence available when it mattered.

**Boundaries.** Debugging may require IDs, exit codes, or full output. Native agent parity was a local requirement of one project. Synthesis should retain important uncertainty and keep evidence reachable.

**J1.** revise; decisive episode E0120; template risk high. Reason (paraphrased): the turn contains the machine report and the direct reaction; parity with a native subagent is one product's requirement repeated across most dialogs; the generalisable part is selection and synthesis for the addressee, not mandatory brevity or hiding all codes.

**Evidence after the stress test.** 10 episodes: E0042, E0064, E0110, E0113, E0120, E0126, E0212, E0215, A2-07, A2e-03. Independent dialogs: 9 (D007, D029, D070, D074, D076, D078, D084, D103, D112); draft had 10. Removed: A2d-01 (out_of_scope), A2d-03 (insufficient_data).
Counterexample search: contradicts 0, narrows_scope 0, supports_new 7 (6 turns with a verified quote, dialogs D070, D074, D076, D101, D103, D107; not counted).

**Template risk.** Synthesis can hide evidence if details are discarded; keep them reachable when needed.

**Cited episode IDs.** E0110, E0120, E0064, E0042, E0113, E0212, A2e-03, A2-07, E0220, E0126, E0215, A2d-01, A2d-03.

### P27: Write the conclusion where its next reader will look (strong; J1 keep)

**Statement.** When a conclusion, rule or decision will be needed later — by a future session, an agent or a teammate — write it into the artifact that reader opens at the moment of use (an ADR, a skill page, a repository CLAUDE.md, a ticket, a PR, a numbered iteration file), not into assistant memory or the chat, because otherwise it is lost and the same problems come back.

**Mechanism.** The reader asked for durable conclusions in the artifact a future reader would open, such as a design record, skill page, or repository rule file. A transient wish was not a standing preference.

**Boundaries.** Do not persist every wish or duplicate conclusions across files. Put each durable conclusion in one place where its next reader will need it.

**J1.** keep; decisive episode E0035; template risk low. Reason (paraphrased): a proposal to keep an instruction only in memory is corrected; E0015 independently asks for an ADR; seven of twelve records are writing-topic, but independent support remains; numbered iteration files are an example, not a format.

**Evidence after the stress test.** 12 episodes: E0015, E0016, E0035, E0044, E0086, E0133, E0170, E0184, E0185, A2-06, E0252, E0312. Independent dialogs: 6 (D004, D007, D061, D078, D081, D112); draft had 6. Nothing removed.
Counterexample search: contradicts 0, narrows_scope 0, supports_new 4 (3 turns with a verified quote, dialogs D004, D007, D061; not counted).
Boundary episodes: A2b-03.

**Template risk.** Recording everything everywhere would duplicate rules; choose one point of use.

**Cited episode IDs.** E0015, E0035, E0184, E0185, E0252, E0312, E0170, A2-06, A2b-03, E0016, E0044, E0086, E0133.

### P28: Rules for future texts are direction with a reason and a scope, not required content (moderate; J1 keep)

**Statement.** When turning feedback into rules for future texts, write each as direction with its reason and its scope (truth within the text's own world included), not as required sections or content, and do not persist a one-off wish as a standing rule, because what fits one text is wrong for another and the user judges each text in its context.

**Mechanism.** The reader rejected universal document sections and wanted rules that guide judgment in context. A one-line rule can also be too vague to guide action.

**Boundaries.** Pleasant reading may be a stronger recurring criterion, but specific section rules remain contextual. The direction must still be concrete enough to use. Evidence is concentrated in writing sessions.

**J1.** keep; decisive episode E0313; template risk low. Reason (paraphrased): carrying a mandatory section between genres is rejected; the cx apparent contradiction is aimed at a requirement P28 itself forbids; four of six records are one dialog.

**Evidence after the stress test.** 6 episodes: E0104, A2b-03, E0311, E0312, E0313, E0314. Independent dialogs: 2 (D070, D112); draft had 2. Nothing removed.
Counterexample search: contradicts 1, narrows_scope 0, supports_new 3 (3 turns with a verified quote, dialogs D112; not counted).
Boundary episodes: A2c-02.

**Template risk.** Advice can become too vague; each rule needs a reason and enough scope to act on.

**Cited episode IDs.** E0313, E0314, E0312, A2b-03, E0311, A2c-02, E0104.

### P29: Durable text does not pin what will drift (strong; J1 revise)

**Statement.** When a text is meant for reuse, check which details depend on the machine, a version or the current state, and pin them only where that helps the reader, because needless duplication of changeable facts goes stale quickly and needs separate maintenance.

**Mechanism.** The reader objected to versions, counts, and environment details that would drift without reason. Exact values still belong where needed for compatibility or reproduction.

**Boundaries.** Versions, numbers, and commands can be necessary for reproduction or compatibility. Mark their scope or source; do not erase useful examples just because they are specific.

**J1.** revise; decisive episode A2b-02; template risk high. Reason (paraphrased): the concrete cost of duplicating a changing number is named; E0026 says a conditional instruction; E0283 rejects a false constant — the issue is whether pinning is justified, not a ban on numbers; the unconditional an absolute claim about exact values exceeded the support.

**Evidence after the stress test.** 7 episodes: E0018, E0026, E0029, A2b-02, E0122, E0283, E0319. Independent dialogs: 5 (D007, D068, D076, D117, D123); draft had 5. Nothing removed.
Counterexample search: contradicts 0, narrows_scope 0, supports_new 0 (0 turns with a verified quote, dialogs —; not counted).

**Template risk.** Banning exact versions and numbers would erase necessary reproduction details; ask whether the value will still be useful and true.

**Cited episode IDs.** E0018, E0026, E0029, A2b-02, E0283, E0122, E0319, E0251.

## Candidates (not principles)

### P30: When a sentence overstates, cut or replace it — do not add a qualifying clause — J1 unknown

**Candidate statement (J1).** When a caveat fails to fix an overstatement or creates confusion, revisit the claim and choose a cut, replacement, or substantive qualification according to reader need.

**Boundaries.** Do not ban caveats as a form; keep material limits, ranges, and trade-offs. A preference for one correction technique remains unknown. One episode asked to retain a trade-off, and two asked for an honest range (E0016, E0279, E0283). Both supporting dialogs were writing-topic sessions (D081, D112).

**Why unknown (J1, paraphrased).** Neither dialog shows an accepted replacement of a specific overstatement by a cut or a link; the counterexamples test accuracy rather than a universal editing technique.

**Missing check (J1).** Compare a real overstatement, a correctly qualified version, and a cut or linked version against the reader’s reaction.

**Evidence.** E0188, A2e-01 (2 dialogs, both writing-topic sessions). Counter-evidence: E0016, E0279, E0283. Removed by stress: none.

The remaining single-dialog candidate themes stand unchanged: full list before a destructive decision; pleasant reading as the first criterion; a field table moved out of an agent prompt; a reviewer role that checks necessity; structure-first then block-by-block iteration; numbered iteration files; truth within the text’s own world; example phrases in the user’s language; a checklist shape found over three recorrections; estimates in the plan rather than tickets; both sides of a trade-off in a ticket; preservation of generated blocks; and proposals sized to the task (four dialogs, substance rather than wording).
