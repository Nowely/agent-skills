# Codex Astra C2 — critique of terse design v2

Codex Astra C2: done, read v2 and C1 whole, audited every fixed disposition, ran all six counting cases and the record, and checked geometry, pipeline, freeze and the proposed test. Revision required; no competing design proposed.

Findings by front: 1: 6, 2: 3, 3: 1, 4: 3, 5: 5, 6: 5, 7: 2; total 25. Four (C2-6.1–6.4) are openly carried owner gaps; the other 21 change correctness, counts or requirements. Each issue is counted once, even where it defeats a disposition.

Disposition recount: of 34 marked fixed, 25 hold and 9 do not: F3.5, F3.7, F3.8, F3.11, F3.12, F3.18, F4.2, K2-c, K2-d. The four marked open remain open.

Read-only repository: /Users/ruliny/Git/agent-skills, branch terse-process-2026-09-22, HEAD 9bd160d. Pre-existing tracked/untracked changes are in start-state.txt. All generated artifacts are under this TMPDIR directory. No web search, external fetch, subagent, live model trial, repository test suite or historical lifecycle probe was run. Historical experiments are cited as historical, not re-measured.

V2 (674 lines) and C1 (386 lines as wc -l observes; described as 387 in v2) were read whole before judgments. K2 was read whole; relevant v1, evidence, inherited contracts, scripts and record were opened. Input hashes are in input-hashes.txt. Exact historical runtime environment is unknown.

## Disposition audit — all 34 fixed rows

Holds means the original defect was repaired, not that every replacement rule is proved. Disclosed deferral is acknowledged: F3.11 fails because even the mixture part claimed fixed is inadequate, not because its coupling deferral was hidden.

| Original id | Original finding line | Opened v2 rules/lines | Recount | Reason |
|---|---:|---|---|---|
| F1.1 | c1:53 | 108–112 | holds | Observable audit failure replaces the unasked-question counterfactual. |
| F1.2 | c1:60 | 233–238 | holds | All-inclusive taxonomy removed; semantic detector misses are observable. F3.12 separately concerns preserving the no-reproposal requirement. |
| F1.3 | c1:68 | 333–340 | holds | Absolute two-of-three floor rejects a zero-catching reader. C2-7.2 is a new scheduling problem. |
| F1.4 | c1:76 | 344–351 | holds | Refutation now concerns misattribution, not impossible expressibility. |
| F1.5 | c1:84 | 467–473 | holds | A matching quote severed from its condition can occur; not excluded by the matcher. |
| F2.1 | c1:94 | 108–112 | holds | One incident explicit; H1 a#9 now applies only to ratings. |
| F2.2 | c1:103 | 454–461 | holds | One incident per role explicit; split-critic exception disclosed. |
| F3.1 | c1:114 | 123–124; 660–662 | holds | Corrected 18/25 and seven misses agree with C1’s recorded check. |
| F3.2 | c1:124 | 664–670 | holds | New regress.mjs uses import and executed here. The obsolete gateload.mjs is not claimed repaired. |
| F3.3 | c1:133 | 87; 98 | holds | Resolution is level 1; installed-host paths are unresolved, not refuted. |
| F3.4 | c1:142 | 89 | holds | Audit commit fingerprint replaces document wording date. |
| F3.5 | c1:149 | 97; 102; 105–106 | does not hold | No verdict for correct departures or falls inside the noise floor: C2-1.1. |
| F3.6 | c1:158 | 136–146 | holds | Four document-level cells, abstention and line report separate. |
| F3.7 | c1:167 | 121; 313–320 | does not hold | T3 still permanently flags supported no-code claims: C2-1.2. |
| F3.8 | c1:176 | 344–361 | does not hold | Original toys fixed, but valid sentence groups still miscount: C2-2.1 and C2-2.2. |
| F3.9 | c1:186 | 395 | holds | R06-4 now reached by G2(i); enclosing edit also forces a run. |
| F3.10 | c1:196 | 201–215 | holds | Original-to-candidate diff replaces wrong-base edit application; byte composition reproduced. |
| F3.11 | c1:205 | 217–225; 624–625 | does not hold | Coupling detection openly deferred; even the claimed mixture fix misses the motivating cross-section dependency: C2-3.1. |
| F3.12 | c1:214 | 227–238 | does not hold | Notification does not preserve the no-reproposal requirement: C2-1.6. |
| F3.13 | c1:222 | 186–190 | holds | Inventory, cut ledger and map named; full existing artifact list retained. |
| F3.14 | c1:232 | 491–499 | holds | No demotion from bundled deltas. Per-practice attribution honestly remains open. |
| F3.15 | c1:242 | 482–489 | holds | CC/VE/RA/ME definitions corrected. |
| F3.16 | c1:250 | 497–498 | holds | 734–736 correctly attributed to r-synthesis via M1. |
| F3.17 | c1:258 | 530–544 | holds | Exact C1 inversions repaired: G1 before G2; verified critic findings before G6. New blockers in Front 4. |
| F3.18 | c1:269 | 252–259 | does not hold | Format-versus-text causal conclusion remains at 255: C2-1.3. |
| F4.1 | c1:280 | 381–438 | holds | 13/25 withdrawn; replay, blind, desk and forced separated. New trial defects in Front 5. |
| F4.2 | c1:292 | 97; 114–119; 643–645 | does not hold | Known Open/unconfirmed items omitted from operational no-change predicate: C2-1.4. |
| F4.3 | c1:302 | 252–259; 647–648 | holds | Prediction explicitly withdrawn; comparison now same handover. |
| F5.1 | c1:314 | 143–146 | holds | 14 baseline + 6 rescore + 8 reaudit = 28 each, 84 for three; extra truth-pass agents excluded explicitly. |
| F5.2 | c1:323 | 600–614 | holds | Evidence-class order explicitly replaces payoff ranking. |
| K2-a | k2:79 | 575 | holds | Both definition and safeguard anchors named. |
| K2-b | k2:80 | 576 | holds | Candidate R:49–50 distinguished from verdict A:90. |
| K2-c | k2:101 | 261–264 | does not hold | Four handover sections do not settle document language: C2-1.5. |
| K2-d | k2:107 | 266–270 | does not hold | Blanket first-line rule conflicts with file timing/contracts: C2-4.3. |

## Counting results — every number

regress-runs.log records every invocation, exact arguments, stdout, stderr and exit. Ten invocations: five for four supplied cases (case 4 has two variants), two new cases, one exact record replay, one record --judge 9 check, one altered record grouping. All started. Nine reporting invocations exited 0; --judge 9 exited 1 by selecting 08. Existing-ledger comparisons in legacy-ledger-runs.log all started, reported the failing final files, and exited 1. These are observed outcomes, not test-suite passes.

| Case | Failing groups from r0 | Regressions from r1 | Existing ledger final failures | Assessment |
|---|---|---|---:|---|
| 1: retired falsehood returns | 0,1,0,1 | 1,0,1 | 1 | v2 reproduced |
| 2: persistent falsehood | 0,1,1 | 1,0 | 1 | v2 reproduced |
| 3: two pins, one sentence | 0,1 | 1 | 2 | v2 reproduced |
| 4a: true paraphrase, no re-pin | 0,1 | 1 | 1 | v2 reproduced |
| 4b: same case with re-pin | 0,0 | 0 | not run; old script lacks histories | v2 reproduced |
| 5: false sentence replaced by another | 0,1,1 | 1,0 | not run | new false sentence hidden at r2 |
| 6: new true pin plus false clause | 1,1 | 0 | not run | prior good sentence retroactively bad; new regression hidden |

Cases 5 and 6 stipulate checker-confirmed truth. They test the function after verification, not an agent's discovery ability. Both use documented fields, one legitimate sentence group, simple regexes and well-formed JSON. Their .md files and ledgers are in toy/. They are the two added counting cases; the separate regeneration fixture tests pipeline state.

Record: 66 entries, unchanged, no groups/re-pins. Each pair is failing-groups/regressions:

- Instructions: 28/–; draft: 29/1; 01: 39/11; 02: 39/2; 03: 37/2; 04: 34/1; 05: 33/1; 06: 32/6; 07: 28/4; 08: 23/11; 09: 0/0.
- Recorded 02–08 regression row: 1,2,1,0,6,5,10, total 25. Replay: 2,2,1,1,6,4,11, total 27. The instructions file is not a documentation round.
- --judge 9 on the appendix input list exits 1 by selecting 08's 11, despite displayed 09=0.
- Group only the two negative parity-exclusivity phrasings: all failing counts remain unchanged, 08's transition count falls to 10 by losing R08-5, every other transition count unchanged. This altered ledger is a counterexample, not an authoritative adjudicated grouping.

## Hunk geometry — observed results and limits

geometry-commands.log contains exact git diff commands and six round.mjs commands. geometry-checks.py/geometry-summary.txt contain the span/group arithmetic. Diff exits 1 mean files differ, as expected. All six round.mjs commands exited 0 and all six generated files matched their recorded destination bytes.

- All 27 old strings in edits/08.json occur once in 07-lifecycle.md and zero times in 00-draft.md. 07→08 replay matches exactly. V2:201–203 and the original-base correction hold.
- Zero-context diffs: 00→08 has 57 hunks; 07→08 has 22; 00→07 has 56. Applying all 57 original/candidate intervals reproduces 08; applying none reproduces 00. Mechanical composition holds.
- Using only direct round-08 replacement spans and named ledger links gives 55 groups from 57 hunks. Edit 08[9] spans H21–H23; a group need not be one contiguous original interval. All 55 single-group mixtures were constructed; no semantic or owner acceptance was measured.
- Available files 04–09 contain 4,3,9,8,27,15 edits and replay exactly. Files 01–03 are absent. Full original→08 provenance and final group count are unknown, not 55. Partial replay from 03 is not fabricated ancestry before 03.
- Direct 08 spans place [16] in H33 and [24] in H53, different sections, with no shared edit or direct claims-to-retire/drop name. Available 04–08 ancestry paths also differ. This exposes HO2's same-section coverage gap without claiming to have run an unimplemented apply.mjs or a verified semantic mixture.

## Findings by front

Every displayed quotation is emitted from its named source line. Before inclusion, actual grep -n -F -- subprocess calls check its first six whitespace-separated words (whole quote if shorter) and verify the named line in the matches. Full command/output transcript: grep-validation.log. Matching proves quotation provenance, not historical behavioral truth.

### Front 1

#### C2-1.1. F3.5 remains: triage still has states with no verdict

- `/tmp/fable-a2.cB3Zls/a2-design-v2.md:97` — “| `no change` | S1 clean; S3 empty for every source the ledger cites; S4 exists; every prior `refuted` ledger entry and every *What broke* item is closed (its line changed since the audit and a later confirmed re-score covers it); S5 at or above the prior score, every control held, no reader departed, and the fall — if any — inside a measured noise floor | nobody; the owner sends |”
- `/tmp/fable-a2.cB3Zls/a2-design-v2.md:102` — “| `regressed` | S4 exists and S5 fails one of `measure.md:111-115`'s three ways | `audit` step 6: cause per wrong answer, from the readers' quotes; the truth pass scoped to the quoted lines |”
- `/Users/ruliny/Git/agent-skills/plugins/terse/skills/audit/references/measure.md:113` — “- the score falls by more than the measured noise floor, or by anything at all if no floor was measured”
- `/Users/ruliny/Git/agent-skills/plugins/terse/skills/audit/references/measure.md:114` — “- a control question that passed now fails”
- `/Users/ruliny/Git/agent-skills/plugins/terse/skills/audit/references/measure.md:115` — “- a claim confirmed before is refuted now, which means the rewrite introduced a false statement”
- `/Users/ruliny/Git/agent-skills/plugins/terse/skills/audit/references/measure.md:87` — “right answer found by reading the source is a documentation failure with a correct answer attached.”

Take clean S1/S3, backed S2, a complete prior audit, no open failure, unchanged controls and no newly refuted claim. A fresh reader departs to code but answers correctly: no change is forbidden, while none of measure.md:111–115 fires regressed. A small score fall inside a measured noise floor gives the same hole: line 97 demands at or above, but line 102 only routes a fall beyond the floor. The added verdict fixes the original large-fall example, not the state machine C1 challenged. Disposition F3.5 does not hold.

#### C2-1.2. F3.7 is only partly repaired: source-backed text remains unbacked in triage

- `/tmp/fable-a2.cB3Zls/a2-design-v2.md:121` — “**Rule T3. A sentence with a trigger word and no level-3 evidence is `unbacked`, whatever its truth.**”
- `/tmp/fable-a2.cB3Zls/a2-design-v2.md:315` — “directory declares no code, with `source:` naming what the reader can check.** *Refuted by:* over three”
- `/Users/ruliny/Git/agent-skills/plugins/terse/skills/audit/references/truth-pass.md:75` — “Level 3 is unreachable for a claim about the world rather than about software. The rule degrades to:”
- `/Users/ruliny/Git/agent-skills/plugins/terse/skills/audit/references/truth-pass.md:76` — “a guarantee-shaped claim carries a named source the reader can check, or it is weakened. Everything”
- `/Users/ruliny/Git/agent-skills/research/2026-09-22-terse-process/c1-design-critique.md:174` — “G3 applies to every new sentence with a trigger and requires an executed level-3 claim, without the existing truth-pass exception for world claims or source-only documents. The plugin expressly audits text with no code (audit/SKILL.md:26-27). A sourced statement in that supported input class cannot clear this new gate even when the previous contract accepts it. T3 also labels such statements unbacked indefinitely.”

G3 now admits a source when a run declares no code. T3 still labels every triggered sentence without level-3 evidence unbacked, even after a supported source-only audit confirms it. C1 explicitly included this T3 consequence; its resolution is not addressed in the fixed row. Moreover the new G3 condition is directory-wide, while the cited fallback is for a claim about the world. An otherwise code-backed document can contain such a sourced claim. This is a narrowed fix, not a complete disposition of F3.7.

#### C2-1.3. F3.18 survives in HO4’s conclusion

- `/tmp/fable-a2.cB3Zls/a2-design-v2.md:253` — “refused groups per handover and refused propositions re-proposed; no refusal is attributed to format or to”
- `/tmp/fable-a2.cB3Zls/a2-design-v2.md:254` — “content.** *Refuted by:* three handovers of one document in which the transition count falls and the”
- `/tmp/fable-a2.cB3Zls/a2-design-v2.md:255` — “owner's refusals do not — then the handover, not the text, is what the rounds fail on, and the format is”
- `/Users/ruliny/Git/agent-skills/plugins/terse/skills/rethink/references/stages.md:148` — “Before deleting a fact a reader called noise, try it in another form. The reader is reporting what the”
- `/Users/ruliny/Git/agent-skills/research/2026-09-22-terse-process/c1-design-critique.md:276` — “The rule assigns unclear counts to the handover format and content counts to the loop, and diagnoses a format failure from their trends. The recorded owner first rejected prerequisite content, then restored it and said the objection may have been its presentation. Thus a content-labelled refusal can be a format failure, and an unclear refusal can arise from missing content. Raw counts also change with the number of hunks. The proposed score cannot support the claimed format-versus-text diagnosis.”

The rule says no refusal is attributed to format or content, then infers that the handover, not the text, failed whenever the transition count falls and refusals do not. A document can introduce fewer new falsehoods while retaining a missing prerequisite, an old falsehood, an unwanted scope, or more groups to refuse. Those counts cannot identify format as the cause. The causal attribution C1 rejected remains, with different labels. Disposition F3.18 does not hold.

#### C2-1.4. F4.2 is narrower than nothing left open

- `/tmp/fable-a2.cB3Zls/a2-design-v2.md:97` — “| `no change` | S1 clean; S3 empty for every source the ledger cites; S4 exists; every prior `refuted` ledger entry and every *What broke* item is closed (its line changed since the audit and a later confirmed re-score covers it); S5 at or above the prior score, every control held, no reader departed, and the fall — if any — inside a measured noise floor | nobody; the owner sends |”
- `/tmp/fable-a2.cB3Zls/a2-design-v2.md:114` — “**Rule T2. `no change` needs a prior measurement that still holds with nothing left open; a never-audited”
- `/tmp/fable-a2.cB3Zls/a2-design-v2.md:643` — “2. **"`no change` is safe under T2 as rewritten."** v1's claim 2, not settled; F4.2's hole is closed by”
- `/Users/ruliny/Git/agent-skills/plugins/terse/skills/audit/references/ledgers.md:33` — “One entry per wrong answer, each with a cause.”
- `/Users/ruliny/Git/agent-skills/plugins/terse/skills/audit/references/ledgers.md:36` — “What could not be settled, and anything the steps contradicted each other about.”
- `/Users/ruliny/Git/agent-skills/plugins/terse/skills/audit/references/truth-pass.md:42` — “- **unconfirmed** — you could not settle it.”

The emitted no-change verdict closes only prior refuted entries and What broke. What broke contains wrong answers; the separate Open section and unconfirmed ledger verdict still exist. A prior audit can have an unresolved non-trigger claim or a correct answer obtained by departure, no wrong answer, and clean subsequent keyed answers, and meet line 97. Current tasks are also not run by S5. This is broader than the undiscovered M12 hole v2 openly retains: known unresolved items are omitted from the predicate. T2’s nothing-left-open sentence and Part 6’s assertion that F4.2 is closed disagree with the executable verdict table. Disposition F4.2 does not hold.

#### C2-1.5. K2-c changes four handover sections, not the document’s language

- `/tmp/fable-a2.cB3Zls/a2-design-v2.md:261` — “**Rule HO5. Sections 1–4 of the handover are written in the language the owner asked in.** *Refuted by:*”
- `/Users/ruliny/Git/agent-skills/research/2026-09-22-terse-process/k2-completeness.md:101` — “1. **The natural language the document is written in.** `grep -i -w language` over all 17 saved sources:”
- `/Users/ruliny/Git/agent-skills/research/2026-09-22-terse-process/k2-completeness.md:103` — “for a reader whose language differs from the document's. The targets already carry a *measured* rule”
- `/tmp/fable-a2.cB3Zls/a2-design-v2.md:172` — “`$RUN/handover-NN.md`, fixed headings, beside `candidate-NN.md` (the whole text) and `diff-NN.patch`”

K2 named the natural language of the document its reader receives. HO5 covers handover sections 1–4 only; candidate-NN.md, accepted-NN.md and the hunk text have no language requirement. A Russian handover around an English deliverable complies with HO5 while leaving K2’s gap untouched. The scope reduction is not disclosed in the fixed row. Disposition K2-c does not hold.

#### C2-1.6. F3.12 replaces the no-reproposal requirement with notification

- `/tmp/fable-a2.cB3Zls/a2-design-v2.md:233` — “**Rule HO3. A refused group is recorded with its proposition and the owner's words; the next writer”
- `/tmp/fable-a2.cB3Zls/a2-design-v2.md:234` — “receives the list; lens 7 receives it too and quotes any sentence that re-proposes a refused proposition,”
- `/tmp/fable-a2.cB3Zls/a2-design-v2.md:235` — “in any words.** *Refuted by:* a refused proposition re-proposed within two rounds and reaching the owner”
- `/Users/ruliny/Git/agent-skills/plugins/terse/skills/rewrite/references/loop.md:108` — “by someone other than the writer. It also records what was deliberately refused, so the next round does”
- `/Users/ruliny/Git/agent-skills/plugins/terse/skills/rewrite/references/loop.md:109` — “not re-propose it, and the blocks that fail with the cost of fixing each, including the ones with no”

The next writer receives propositions and lens 7 quotes repetitions. No rule prohibits re-proposing them; a writer may repeatedly return all refused content as long as the proxy quotes it. The displaced map requires that the next round not re-propose what was deliberately refused. Recording semantics repairs the exact-string representation, but detection alone does not preserve that requirement. F1.2’s impossible taxonomy test is removed; F3.12’s preservation claim does not hold.


### Front 2

#### C2-2.1. A bad-to-bad rewrite is invisible to the transition count

- `/tmp/fable-a2.cB3Zls/a2-design-v2.md:344` — “**Rule G6. A round's regression count is the number of sentence groups that are bad at N and were not bad”
- `/tmp/fable-a2.cB3Zls/a2-design-v2.md:345` — “at N−1, where a group is bad when any pin in it fails — a `want:false` pattern present, or a `want:true`”
- `/var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/astra-c2.n1oboI/regress-runs.log:44` — “c5-r2.md: failing groups=1 regressions=0”
- `/Users/ruliny/Git/agent-skills/research/2026-09-22-terse-process/d1-regression-autopsy.md:358` — “version of this claim had *already* been found false”
- `/Users/ruliny/Git/agent-skills/research/2026-09-22-terse-process/d1-regression-autopsy.md:360` — “08 satisfied that pin by **paraphrase**: the pattern is the literal string `The one place the two differ”
- `/var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/astra-c2.n1oboI/regress-runs.log:98` — “08-review.md: failing groups=23 regressions=10 [NEG 'grants a different sandbox'; NEG 'pinned to'; NEG 'not your answers, run records or reports'; NEG '.gitignore covers'; NEG 'sharing only'; NEG 'a copy with unsaved files is left as it is'; NEG 'trimmed when a later run starts'; NEG 'asked for that command by name'; NEG 'That the thread existed is backed'; NEG 'stop the Codex processes']”

Own case 5 uses one stable sentence group: a true limited claim, then a false always guarantee, then a new false never guarantee. Both negative pins are legitimate verified findings. Regressions are 1 then 0, although round 2 introduced a different false sentence. No rule requires a new sentence id for each textual revision; imposing that now would be an additional rule. The record supplies the same failure: group its two negative exclusivity phrasings under parity-exclusivity, and 08 falls from 11 to 10 solely because R08-5 disappears, despite D1 recording its paraphrase recurrence as a regression. Agreement with the headline ten would be for the wrong reason. F3.8’s sentence-count defect is not fixed by an OR over pins.

#### C2-2.2. A future true pin retroactively spoils a good sentence and hides a new false clause

- `/tmp/fable-a2.cB3Zls/a2-design-v2.md:345` — “at N−1, where a group is bad when any pin in it fails — a `want:false` pattern present, or a `want:true`”
- `/tmp/fable-a2.cB3Zls/a2-design-v2.md:347` — “`00..N` after the coordinator has written the round's verified findings as `want:false` entries with a”
- `/tmp/fable-a2.cB3Zls/a2-design-v2.md:531` — “| 2 | script | G1 runs every `run`, writes `saw`, refuses on `expect`; G3 refuses trigger sentences without a level-3 run or `source:`; writes `NN-pass.md`; grows the ledger | `edits/NN.json` | `NN-pass.md`, `ledger.json` |”
- `/tmp/fable-a2.cB3Zls/regress.mjs:15` — “const bad = [...groups].map(([g, cs]) => [g, texts.map((t, i) => cs.some((c) => new RegExp(patAt(c, i), c.flags ?? "").test(t) !== c.want))]);”
- `/var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/astra-c2.n1oboI/regress-runs.log:50` — “c6-r0.md: failing groups=1 regressions=-”
- `/var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/astra-c2.n1oboI/regress-runs.log:51` — “c6-r1.md: failing groups=1 regressions=0”

Own case 6 starts with a true limited cleanup sentence. Round 1 adds a verified timestamp clause and a false never-deletes clause. The grown ledger has want:true for the timestamp fact and want:false for the false clause, both S1. Replaying that ledger makes S1 bad at round 0 because the later timestamp phrase was absent, and bad at round 1 because the new false clause is present. Result: failing groups 1,1; regressions(1)=0 instead of the one introduced false sentence. Neither rule nor script has pin activation history: re-pin history only changes patterns. This independent counterexample also defeats F3.8.

#### C2-2.3. The supplied record command makes --judge NN select the wrong round

- `/tmp/fable-a2.cB3Zls/a2-design-v2.md:668` — “re-pin at r1. Record: `node regress.mjs ledger.json 00-draft-instructions.md 00-draft.md 01…09` →”
- `/tmp/fable-a2.cB3Zls/a2-design-v2.md:537` — “| 7 | script | G6: `ledger.mjs --judge NN` over `00..NN` → regressions(NN) | `ledger.json`, the rounds | the number for `rounds.md` |”
- `/tmp/fable-a2.cB3Zls/regress.mjs:19` — “if (judge !== null) process.exit(reg[judge]?.length ? 1 : 0);”
- `/var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/astra-c2.n1oboI/regress-runs.log:71` — “STARTED: yes; EXIT: 1”
- `/var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/astra-c2.n1oboI/regress-runs.log:82` — “08-review.md: failing groups=23 regressions=11 [NEG 'grants a different sandbox'; NEG 'pinned to'; NEG 'not your answers, run records or reports'; NEG '.gitignore covers'; NEG 'The one thing it has'; NEG 'sharing only'; NEG 'a copy with unsaved files is left as it is'; NEG 'trimmed when a later run starts'; NEG 'asked for that command by name'; NEG 'That the thread existed is backed'; NEG 'stop the Codex processes']”
- `/var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/astra-c2.n1oboI/regress-runs.log:83` — “09-reduction.md: failing groups=0 regressions=0”

Appendix A includes both 00-draft-instructions.md and 00-draft.md. regress.mjs indexes the FILE list directly rather than resolving a round number. With that input list, --judge 9 examines index 9, 08-review.md with 11 regressions, and exits 1; requested 09-reduction.md is index 10 with zero. All rows are printed, so the wrong selected row is hidden in the exit status. The instructions file also produces an extra non-round transition into 00-draft. The unqualified --judge N contract and published invocation are incompatible.


### Front 3

#### C2-3.1. HO2’s same-section neighbour check misses its own motivating dependency

- `/tmp/fable-a2.cB3Zls/a2-design-v2.md:218` — “through the ledger over `00..NN, accepted-NN`, the verifier re-reads every sentence in an accepted group”
- `/tmp/fable-a2.cB3Zls/a2-design-v2.md:219` — “whose neighbouring group in the same section was refused, and the re-score runs on the mixture, not on”
- `/tmp/fable-a2.cB3Zls/a2-design-v2.md:624` — “- F6.2 — selective acceptance. The group rule is mechanical; the coupling D1 `:447-448` shows leaves no”
- `/Users/ruliny/Git/agent-skills/research/2026-09-22-terse-process/d1-regression-autopsy.md:447` — “- **Compound damage:** this edit's sibling (`edits/08.json[16]`) retired `killed run's lock reclaimed`,”
- `/Users/ruliny/Git/agent-skills/research/2026-09-22-terse-process/d1-regression-autopsy.md:448` — “a **true** claim, so the round both added a wrong cure and deleted the right one.”
- `/var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/astra-c2.n1oboI/geometry-summary.txt:62` — “Edit 08[16] candidate span occurs 1 times; hunks [33]; groups [33]”
- `/var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/astra-c2.n1oboI/geometry-summary.txt:63` — “Edit 08[24] candidate span occurs 1 times; hunks [53]; groups [53]”
- `/Users/ruliny/Git/agent-skills/plugins/terse/skills/rewrite/references/bake-off.md:143` — “writer would have written, and no judge has scored it. Re-check every graft against the code, because a”

The record places 08[16] at candidate lines 124–125 (storage) and 08[24] at line 190 (troubleshooting). Under observed round-08 provenance they inhabit H33 and H53, with no shared edit or claims-to-retire/drop name link. Available ancestry from 03 also differs; full original ancestry is unknown. Refusing a group in one section does not trigger re-reading a kept group in the other under HO2. The known cross-section compound damage therefore does not support the assertion that re-verification catches untracked coupling. This is a coverage defect, not a claim that an unrun mixture passed readers. The inherited bake-off requires rechecking every graft; v2 narrows this to same-section neighbours. F3.11’s disclosed open coupling detection is honest, but its claimed mixture fix does not hold.


### Front 4

#### C2-4.1. First handover reads refused.json before anything writes it

- `/tmp/fable-a2.cB3Zls/a2-design-v2.md:535` — “| 5 | agents | the wave (lenses 1–6); G5's proposition reader on the frozen round; on a handover round, lens 7 with `refused.json` | the frozen round | `reviews/NN/` |”
- `/tmp/fable-a2.cB3Zls/a2-design-v2.md:539` — “| 9 | owner | accepts groups; `apply.mjs` writes `accepted-NN.md`; HO2's re-verification; the tree only on the word | | `refused.json`, `accepted-NN.md` |”
- `/tmp/fable-a2.cB3Zls/a2-design-v2.md:227` — “**Across rounds.** A refusal does not fork the chain. `refused.json` records the group, its candidate”
- `/Users/ruliny/Git/agent-skills/plugins/terse/skills/rewrite/SKILL.md:80` — “1. **Once per document**, write four files and copy in `skeleton.md`:”

On the first handover, step 5 runs lens 7 with refused.json; step 9 is its first writer. Across rounds defines it only after a refusal; inherited setup initializes different files. No first-run empty-list convention is specified. Subsequent handovers can read the previous list; the first execution cannot satisfy the declared input contract. This is a new dependency defect, not the old G1/G2 or findings/G6 inversion, both now repaired.

#### C2-4.2. Pre-freeze rejection deletes the round but retains its ledger mutations

- `/tmp/fable-a2.cB3Zls/a2-design-v2.md:531` — “| 2 | script | G1 runs every `run`, writes `saw`, refuses on `expect`; G3 refuses trigger sentences without a level-3 run or `source:`; writes `NN-pass.md`; grows the ledger | `edits/NN.json` | `NN-pass.md`, `ledger.json` |”
- `/tmp/fable-a2.cB3Zls/a2-design-v2.md:533` — “| 4 | verifier (G2) | verdicts per claim; re-pins for LOST-by-true-paraphrase; `refuted` or `does not answer` → delete `NN-pass.md`, back to 1 | `edits/NN.json` with `saw`, the code | `reviews/NN/verifier.md`, re-pins |”
- `/Users/ruliny/Git/agent-skills/plugins/terse/skills/rewrite/scripts/round.mjs:31` — “const ledger = fs.existsSync(ledgerFile) ? JSON.parse(fs.readFileSync(ledgerFile, "utf8")) : [];”
- `/Users/ruliny/Git/agent-skills/plugins/terse/skills/rewrite/scripts/round.mjs:34` — “for (const c of e.claims ?? []) byName.set(c.name, { name: c.name, pattern: c.pattern, want: true,”
- `/Users/ruliny/Git/agent-skills/plugins/terse/skills/rewrite/scripts/round.mjs:38` — “for (const n of e.drop ?? []) { if (!byName.delete(n)) console.error(`${e.name}: drop names a ledger entry that does not exist: ${n}`); }”
- `/var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/astra-c2.n1oboI/pipeline-probe.log:25` — “1 failure(s) in /var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/astra-c2.n1oboI/pipeline-probe/candidate.md”

Step 2 grows the shared ledger; step 4 deletes only NN-pass.md before regenerating. Rejected attempts can add, replace, retire or drop entries. No rollback or temporary-ledger commit at freeze is specified. Executed existing-script fixture: A adds one pin; delete only its candidate, regenerate B from the same base, and the ledger contains two pins. B has one LOST row for never-frozen A. This tests mutation order, not a model verdict. A corrected attempt can be blocked by an abandoned attempt; a dropped protection can likewise remain missing.

#### C2-4.3. HO6 demands verdicts in files written before the verdict exists

- `/tmp/fable-a2.cB3Zls/a2-design-v2.md:266` — “**Rule HO6. The first line of every file and every agent return in this design carries its verdict —”
- `/tmp/fable-a2.cB3Zls/a2-design-v2.md:267` — “the effect tuple, the verifier's count, the proxy's yes/not yet — so a clip at any line keeps the”
- `/tmp/fable-a2.cB3Zls/a2-design-v2.md:531` — “| 2 | script | G1 runs every `run`, writes `saw`, refuses on `expect`; G3 refuses trigger sentences without a level-3 run or `source:`; writes `NN-pass.md`; grows the ledger | `edits/NN.json` | `NN-pass.md`, `ledger.json` |”
- `/tmp/fable-a2.cB3Zls/a2-design-v2.md:534` — “| **freeze** | coordinator | announces the wave; **the round is frozen when the critics launch** (`rewrite/SKILL.md:103`, `loop.md:66-68`) | | |”
- `/tmp/fable-a2.cB3Zls/a2-design-v2.md:537` — “| 7 | script | G6: `ledger.mjs --judge NN` over `00..NN` → regressions(NN) | `ledger.json`, the rounds | the number for `rounds.md` |”
- `/Users/ruliny/Git/agent-skills/plugins/entrust/skills/orchestrate/SKILL.md:143` — “Ask every prompt agent, Claude and Codex alike, for exactly these five fields, and send no `BRIEF:` line: the template is the bound, and `BRIEF:` would clip the answer at 20 lines. A verifier's brief names its target and the whole scope it must cover; its return says what it checked and, in `open`, what it did not. The first line of `result` is one sentence a”
- `/Users/ruliny/Git/agent-skills/plugins/entrust/skills/orchestrate/SKILL.md:144` — “reader can take on its own: the agent's model and id, its status and what it did ("Sonnet W5: done, four flaky width checks replaced by threshold checks"); the rest of the fields follow unchanged, and all five are yours to read, never to forward.”

Every file includes NN-pass.md, emitted at step 2 and frozen before step 5; its final regression count is produced at step 7 from step-6 findings. A final effect tuple cannot occupy its first line when written. Adding it after critics launch changes the frozen file; a placeholder does not preserve the decision on clipping. The blanket instruction also includes JSON arrays, patches and original text with existing first-line contracts. The cited source applies to the first line of result, not every file. HO6 needs an unresolved scope/timing exception; K2-d’s fixed disposition does not hold as written.


### Front 5

#### C2-5.1. Frozen historical inputs cannot exercise the new verifier contract

- `/tmp/fable-a2.cB3Zls/a2-design-v2.md:429` — “**The pre-registered test.** Brief 0 run blind, twice — once on Sol, once on Astra — on `edits/06.json`,”
- `/tmp/fable-a2.cB3Zls/a2-design-v2.md:430` — “`07.json`, `08.json` at `b29e921` (`c1:9`), each refusal list frozen by SHA-256 before D1 is opened, then”
- `/tmp/fable-a2.cB3Zls/a2-design-v2.md:377` — “this duty is `unmeasured` as a catch and is what the pre-registered test measures. *Displaces:* `how`.”
- `/var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/astra-c2.n1oboI/prereg-input-summary.txt:1` — “Pinned round 06: edits=9, checks=0, asks=0, run=0, saw=0.”
- `/var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/astra-c2.n1oboI/prereg-input-summary.txt:2` — “Pinned round 07: edits=8, checks=0, asks=0, run=0, saw=0.”
- `/var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/astra-c2.n1oboI/prereg-input-summary.txt:3` — “Pinned round 08: edits=27, checks=27, asks=0, run=0, saw=0.”

Pinned rounds 06/07/08 have 9/8/27 edits, 0/0/27 check objects, but zero asks, run and saw fields in all three. G2 reads saw and G8 compares it with asks; v2 says the test measures that duty. No frozen conversion, execution transcript or versioned brief-0 artifact supplies these fields. Historical how-citation inspection is a different input treatment. Writing missing asks/runs after seeing the answers changes the test. Filenames are pinned; the new treatment is not.

#### C2-5.2. Withholding D1 does not blind a checkout containing target answers

- `/tmp/fable-a2.cB3Zls/a2-design-v2.md:430` — “`07.json`, `08.json` at `b29e921` (`c1:9`), each refusal list frozen by SHA-256 before D1 is opened, then”
- `/tmp/fable-a2.cB3Zls/a2-design-v2.md:300` — “the document and the repository's `.md` files are searched for the sentence that says otherwise, quote or”
- `/var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/astra-c2.n1oboI/prereg-input-summary.txt:4` — “Pinned b29e921 includes all three reviews/08 files and rounds.md; saved pinned-review-08.md is its Opus report.”
- `/var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/astra-c2.n1oboI/pinned-review-08.md:7` — “- **F-a FALSE (L3).** "a copy with unsaved files is left as it is, commits and all" (L121). Dirtiness is `git status --porcelain` (`driver.mjs:1650-1656`), blind to ignored files; a preserved copy holding only a `.gitignore`d file was judged clean, removed by the next `--worktree` run, the file destroyed. The dirty case with an untracked file behaves as claimed.”
- `/var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/astra-c2.n1oboI/pinned-review-08.md:8` — “- **F-b FALSE (L3).** cleanup row "not your answers, run records or reports" (L59). An orchestrate seat's report lives inside a run directory (`orchestrate/SKILL.md:103`) and run rows are selectable (`cleanup.mjs:867-869`); seeded `<state>/orchestrate/<slug>/run-42/seat-a/report.json`, selected the run: "I deleted the run 42", report gone, answers survive. The listing on a seeded state dir produced only *kept* rows.”
- `/var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/astra-c2.n1oboI/pinned-review-08.md:11` — “- **F-e OVERSTATED, and a regression against the retired sentence (L3).** Row 2's cure "when that run is dead, stop the Codex processes the refusal names" (L190). Three cases in `acquireLock` (`driver.mjs:1444-1456`): a live holder's refusal says the opposite ("leave it there, a lock whose holder is gone is reclaimed on the next attempt without your help"); only a dead driver with a live codex group names a process; a plain dead holder is reclaimed silently (planted, exit 0). 07's "reclaimed by the next" was true and was retired.”

git ls-tree and git show confirm b29e921 already contains all three reviews/08 reports and rounds.md. The saved Opus report supplies counterexamples for the target items. G2 duty (iv) searches repository Markdown; only D1 is withheld by the test. No rule excludes the target reviews, the autopsy-derived design or equivalent outcome files. Hashing the later refusal list does not establish blindness. A high score cannot distinguish independent verification from finding the stored critic report.

#### C2-5.3. Strict scoring is not independent by design

- `/tmp/fable-a2.cB3Zls/a2-design-v2.md:431` — “scored against D1's 21 items in those rounds by explicit counterexample. Rounds 06 and 07 declare no”
- `/Users/ruliny/Git/agent-skills/research/2026-09-22-terse-process/m1-two-surveys-compared.md:555` — “**What it is.** README.md:5 — "Only phase 3 — matched tasks, independent outcome assessment, a”
- `/Users/ruliny/Git/agent-skills/research/2026-09-22-terse-process/m1-two-surveys-compared.md:558` — “independently verified outcomes judged cross-family or by a human (S2-37); agents and paid turns under”
- `/Users/ruliny/Git/agent-skills/research/2026-09-22-terse-process/s4-evaluation-guide-and-agents-md.md:27` — “| S4-21 | Guide — Tone and style (customer service) - LLM-based Likert scale | # Generally best practice to use a different model to evaluate than the model used to generate the evaluated output | Use a separate evaluator model. | Model-generated output. | asserted | benefit | model | supplied, hash verified |”
- `/Users/ruliny/Git/agent-skills/research/2026-09-22-terse-process/c1-design-critique.md:47` — “Primary refusal-level score: 6 caught / 4 missed of 10. Extra refusals outside D1’s ten are [1,3,12,18,20,25], not silently called false positives: D1 itself leaves additional 08 regressions unresolved at 609-613. Strict explicit-counterexample score: 5 caught / 5 missed, with R08-5 moved to missed. Part 6’s seven desk cases: 5/7 by refusal, 4/7 by explicit counterexample. The single run is n=1; the selected model was Astra, not the design’s Sol, and it cannot determine Sol’s rate. No hindsight additions changed List A.”

The protocol says then scored without naming a scorer, separating it from verifier/designer, freezing an item-level rubric, or explaining extra correct findings and disputed D1 items. C1’s 6 refusal matches versus 5 explicit counterexamples shows that scoring choices change the outcome. Independence is unknown, not established. Six Codex verifier runs and an estimated two hours are stated; independent scoring is not allocated. This review did not run the proposed verifier trial.

#### C2-5.4. 11/21 can pass while missing every round-08 and G8 case

- `/tmp/fable-a2.cB3Zls/a2-design-v2.md:431` — “scored against D1's 21 items in those rounds by explicit counterexample. Rounds 06 and 07 declare no”
- `/tmp/fable-a2.cB3Zls/a2-design-v2.md:432` — “checks, so the verifier's duty (i) is what is measured there. Threshold, stated now: fewer than 11 of 21”
- `/tmp/fable-a2.cB3Zls/a2-design-v2.md:433` — “strict on the model chosen for the live verifier — then `caught` collapses to `forced`, G2 becomes a”
- `/tmp/fable-a2.cB3Zls/a2-design-v2.md:377` — “this duty is `unmeasured` as a catch and is what the pre-registered test measures. *Displaces:* `how`.”
- `/Users/ruliny/Git/agent-skills/research/2026-09-11-markup-round-0/rounds.md:15` — “| [06-preexisting.md](06-preexisting.md) | 1578 | the coordinator, 9 edits against the 8 confirmed pre-existing defects; then 1 Opus critic against the code, who measured 4 of the claims by running the driver, the CLI and `codex exec` | 9 verdicts, 10 regressions listed, 4 unsettled | **4**, plus 2 overstatements |”
- `/Users/ruliny/Git/agent-skills/research/2026-09-11-markup-round-0/rounds.md:16` — “| [07-lifecycle.md](07-lifecycle.md) | 1611 | the coordinator, 8 edits against 06's review, each re-verified from the code; then a wave of eleven — 2 Opus, 1 Astra, 2 Sol, 5 Luna, 1 Fable to dedup — see [reviews/07/](reviews/07/) | 87 deduplicated: 41 sentence, 12 unsettled, 9 scope, 7 structure, 7 superseded, 6 code, 5 method | **5** of its own: 2 false, 3 overstated |”
- `/Users/ruliny/Git/agent-skills/research/2026-09-11-markup-round-0/rounds.md:17` — “| [08-review.md](08-review.md) | 1711 | the coordinator, 27 edits against the wave's list and the owner's five decisions, each with a check; `budgets.json`, `tasks.json`, `questions.json` written; then 3 critics — Opus with a stub codex, Astra, a Sol reader who had never seen the plugin — see [reviews/08/](reviews/08/) | Opus 14, Astra 9 (7 shared), the reader: "not yet" | **10** of its own: 4 false, 5 overstated, 1 vaguer; 4 of the writer's 27 stated checks did not hold |”

The denominator is correctly 6+5+10=21. Catch all six 06 and all five 07 items but zero of ten 08 items, and the model passes 11/21. It can fail every wrong-case-check challenge the test is said to measure. The aggregate cannot distinguish that result from a verifier covering the new duty. There is no penalty or acceptance criterion for extra unsound refusals, though they cause regeneration and cost. This is a threshold/claim mismatch, not a preferred sample-size objection.

#### C2-5.5. A failed verifier test cannot convert catches into forced runs

- `/tmp/fable-a2.cB3Zls/a2-design-v2.md:433` — “strict on the model chosen for the live verifier — then `caught` collapses to `forced`, G2 becomes a”
- `/tmp/fable-a2.cB3Zls/a2-design-v2.md:434` — “critic lens after the freeze, and the design's central claim is the two replayed pins. Cost: six Codex”
- `/tmp/fable-a2.cB3Zls/a2-design-v2.md:383` — “hypothesis; `forced` — G3 refuses the edit until a level-3 run exists (regex hit replayed; whether the run”
- `/tmp/fable-a2.cB3Zls/a2-design-v2.md:130` — “the 25 carry no trigger word (R04-1, R06-4, R07-2, R07-3, R08-1, R08-5, R08-10); triage says so in its”
- `/Users/ruliny/Git/agent-skills/research/2026-09-22-terse-process/c1-checks.log:3` — “Trigger misses: R04-1, R06-4, R07-2, R07-3, R08-1, R08-5, R08-10.”

Forced is defined as G3 requiring a missing level-3 run. The failed-test branch moves G2 after freeze and says caught collapses to forced. Known G2-caught R08-1, R08-5 and R08-10 have no trigger in their defective sentences, as the design’s own miss list states. Moving a verifier does not add a G3 predicate. They become post-freeze findings, not pre-freeze forced cases. This branch misstates the count/category requirement.


### Front 6

#### C2-6.1. Assess before changing — carried owner gap

- `/tmp/fable-a2.cB3Zls/a2-design-v2.md:621` — “- F6.1 — when leaving a whole document alone is safe. v2 adds `unrepaired`, `regressed` and the audit”
- `/Users/ruliny/Git/agent-skills/research/2026-09-22-terse-process/h1-survey-harvest.md:72` — “- No entry establishes when “no change” is safe for an entire text, how many areas must be sampled, how recent evidence must be, or how to combine clean structural checks with unmeasured semantic risk.”

The owner still cannot use no change as calibrated permission to leave the whole document alone; known-open coverage has C2-1.4’s defect and whole-text false-accept performance is unmeasured. This is openly carried F6.1, not a concealed new claim.

#### C2-6.2. How to present — carried owner gap

- `/tmp/fable-a2.cB3Zls/a2-design-v2.md:624` — “- F6.2 — selective acceptance. The group rule is mechanical; the coupling D1 `:447-448` shows leaves no”
- `/Users/ruliny/Git/agent-skills/research/2026-09-22-terse-process/h1-survey-harvest.md:83` — “- No entry studies selective acceptance of individual changes, dependencies among changes, or how to show that accepting one hunk requires another.”

The owner still cannot rely on a verified selective-acceptance result or demonstrated review benefit: byte composition works, complete record provenance is unavailable, semantic coverage is incomplete and no owner-format comparison has run. This is openly carried F6.2.

#### C2-6.3. Iterations that heal — carried owner gap

- `/tmp/fable-a2.cB3Zls/a2-design-v2.md:626` — “- F6.3 — healing measured between rounds. The transition count reproduces the record within four seams,”
- `/Users/ruliny/Git/agent-skills/research/2026-09-11-markup-round-0/rounds.md:219` — “An independent judge on the whole diff — *did round N read better than round N−1* — is not built. The”

The owner still cannot infer that another round improves the whole text or reduces total work to acceptance; the transition count is defective and independent N-versus-N−1 assessment remains unbuilt. This is openly carried F6.3.

#### C2-6.4. Collecting practice — carried owner gap

- `/tmp/fable-a2.cB3Zls/a2-design-v2.md:630` — “- F6.4 — adoption of a practice. S5 now forbids demotion without an arm; the arm per practice”
- `/Users/ruliny/Git/agent-skills/plugins/terse/skills/audit/references/measure.md:130` — “**Not measured:** which part of the chain produced the gain. The experiment that would isolate it —”

The owner still cannot adopt or demote an individual practice from a bundled document delta; isolated practice arms are unrun. This is openly carried F6.4; v2 correctly stops attributing bundled outcomes to individual practices.

#### C2-6.5. The record does not charge the critics’ round

- `/tmp/fable-a2.cB3Zls/a2-design-v2.md:627` — “each a place where "its critics" and "the introducing round" disagree; the owner has to choose which”
- `/tmp/fable-a2.cB3Zls/a2-design-v2.md:649` — “the introducing round; the skill's definition charges the round whose critics found it”
- `/tmp/fable-a2.cB3Zls/a2-design-v2.md:650` — “(`loop.md:53-55`); the record shows the two disagree at 02, 05, 07 and 08 (Appendix A(ii)). Test: run”
- `/Users/ruliny/Git/agent-skills/plugins/terse/skills/rewrite/references/loop.md:53` — “something worse: **a sentence the round introduced that its critics showed false or overstated is a”
- `/Users/ruliny/Git/agent-skills/plugins/terse/skills/rewrite/references/loop.md:54` — “regression, and one regression is a failing round however many findings it also produced**, because”
- `/Users/ruliny/Git/agent-skills/research/2026-09-22-terse-process/d1-regression-autopsy.md:217` — “**R07-2 (overstated) — ADDED.** (same sentence, second clause)”
- `/Users/ruliny/Git/agent-skills/research/2026-09-22-terse-process/d1-regression-autopsy.md:609` — “- `rounds.md:17` counts 10 for round 08; `ledger.json` carries **11** `NEG` entries whose single `YES` is”
- `/Users/ruliny/Git/agent-skills/research/2026-09-11-markup-round-0/reviews/07/fable-dedup-and-rank.md:23` — “**F9 · L8, L155** "the run stops if the server grants anything else" — the assertion ignores `excludeSlashTmp` (schema ThreadStartResponse.json:1086; `grep excludeSlashTmp driver.mjs` → none). Raised by astra (A1). CODE (ISSUES C5); README can only narrow: "…if Codex grants a different sandbox or network than that."”

The existing definition is conjunctive: a sentence the round introduced that its critics showed false. It does not charge every later discovery to the critics’ round. A pre-existing 05 sentence discovered while reviewing 07 is not an introduced regression of 07. The four differences are not four timing disagreements: 02 has an uncertain identity; 07 collapses clauses and lacks a pin; 08 uses different finding sets/tallies. Even 05 chronology is wrong at v2:358: F9 in the 07 dedup already refutes grants anything else. The record settles the existing rule, not a preference the owner must supply. An owner could authorize a new metric, but that changes the requirement. Individual disputed historical adjudications remain unknown.


### Front 7

#### C2-7.1. HO5 again needs an unobserved counterfactual

- `/tmp/fable-a2.cB3Zls/a2-design-v2.md:261` — “**Rule HO5. Sections 1–4 of the handover are written in the language the owner asked in.** *Refuted by:*”
- `/tmp/fable-a2.cB3Zls/a2-design-v2.md:262` — “an owner refusal or a question about wording that the owner's language would have removed, twice.”
- `/Users/ruliny/Git/agent-skills/research/2026-09-22-terse-process/c1-design-critique.md:58` — “The outcome is a failure that a clarity question “would have flagged”, but T1 forbids asking that question and S5 collects keyed answers only. A subsequent audit can expose an error; it cannot reveal what an unasked question would have diagnosed. No comparison arm collects the missing signal. This leaves the ban protected against the very diagnostic benefit at issue, rather than specifying an observable refutation.”

When HO5 is obeyed, these sections already use the owner’s language; a wording question does not show that using that same language would have removed it. When disobeyed, the question establishes noncompliance, not the unobserved alternative. No paired-language comparison is scheduled. Requiring this twice repeats C1’s T1 defect. The one-incident evidence label itself is honest.

#### C2-7.2. G5 schedules one self-test but needs two failures for refutation

- `/tmp/fable-a2.cB3Zls/a2-design-v2.md:333` — “**Rule G5. A retired entry carries `proposition:` beside `pattern:`; once per round one cheap reader is”
- `/tmp/fable-a2.cB3Zls/a2-design-v2.md:335` — “and returns per item: asserted (quote) or not.** Self-test, once per document: three planted paraphrases”
- `/tmp/fable-a2.cB3Zls/a2-design-v2.md:338` — “self-test, two readers in a row discarded — the lens does not work on this document. *Evidence:* D1 fact”
- `/tmp/fable-a2.cB3Zls/a2-design-v2.md:339` — “3 (`:576-583`), M8 (`measurements.md:44-46`); `one incident` each. Cost: one Luna, ~1 min. *Displaces:*”

One reader per round, a three-paraphrase self-test once per document, but two readers in a row must be discarded on that self-test to refute the lens on this document. No second self-test or replacement reader after discard is scheduled. Under that schedule the decisive observation cannot occur; a second attempt requires an unstated operation and budget. The absolute 2-of-3 threshold repairs F1.3, but the higher-level refutation is not executable as scheduled.

## Pipeline dependency and freeze audit

| Step | Input availability as written |
|---|---|
| 1 | Previous round and prior review exist in the inherited rewrite stage. First-candidate creation is a separate inherited stage. |
| 2 | Edits exist; G1 produces saw before G2. Shared-ledger mutations are not transactional with rejection in step 4. |
| 3 | NN-pass and ledger exist. LOST must be reported to the verifier, not abort before re-pinning; the table says listed, permitting this order. |
| 4 | saw/code and preceding ledger report exist. The reads cell omits the report, but it is available. Rejection leaves mutated ledger state. |
| freeze | Correctly placed at critic launch. No later candidate edit is allowed. |
| 5 | Frozen text exists. First refused.json is produced only at step 9. G5's second self-test is unscheduled. Inherited lens 6 remains after the other critics. |
| 6 | Reviews exist, so verified findings can create negative pins. |
| 7 | New pins exist; unlike v1, G6 has its evidence. Appendix --judge still selects by file offset. |
| 8 | Final effect tuple, proxy and patch can now be produced. HO6 demanded decisions in earlier files. |
| 9 | Candidate/original exist. Subsets compose mechanically; semantic coverage and refusal history have the stated limits. |

The smaller routing diagram also says apply→tree whereas HO2 and the table restrict apply.mjs to the run directory. The surrounding owner's-word condition is explicit, so this shorthand is recorded as clarity/taste rather than an additional finding.

## Pre-registered test audit

- Inputs frozen: partly. Historical edits/code have a commit, but new fields, observed check outputs and a versioned brief are not supplied; the tree contains target critic answers.
- Threshold before run: yes, 11/21. Sol is already named as the live model at v2:306; there is no evidence of post-hoc model selection, and this review does not allege it.
- Scorer independent: unknown, not required by the written protocol. The historical 6-versus-5 split shows scoring matters.
- Cost stated: six Codex verifier runs, about two hours extrapolated from six times C1's whole nineteen-minute turn, no Claude tokens. These are stated assumptions, not measured verifier cost or a fixed budget. Actual time/tokens, scorer work, retries and scheduled wall time are unknown.
- Indistinguishable outcomes: new-contract verification versus old how-citation review; independent discovery versus retrieving stored reviews; 06/07-only success versus actual G8 coverage; useful recall versus many unsound refusals. The same-round live comparison helps but is work inside the already charged verifier/critic round, not evidence that total cost is free.

## All 23 rule refutations and incident disclosures

A possible but weak or mistargeted test is not labelled impossible.

| Rule | Observability and disclosure |
|---|---|
| T1 | Audit contradiction observable; counterfactual removed. One incident and rating/question distinction explicit. |
| T2 | Observable; operational predicate is the defect. Rate unmeasured. |
| T3 | Flagged/unflagged error comparison possible. Known-defect 18/25 distinguished from unmeasured precision. |
| T4 | False accept observable; four cells and abstention coherent. Trial unrun and cost stated. |
| HO1 | Locate/refusal and effect contradiction observable; order unmeasured; sole proxy incident identified before rule. |
| HO2 | A later critic can expose a mixture missed by narrow checks; possible refutation, deficient coverage. Transfer unmeasured. |
| HO3 | Semantic detector misses are observable, unlike the old all-inclusive taxonomy. It changes the preserved no-reproposal requirement; efficacy of memory remains unmeasured. |
| HO4 | Trend observable, causal conclusion unsupported. Format measurement explicitly unrun. |
| HO5 | Unobserved language counterfactual, C2-7.1. One incident expressly labelled. |
| HO6 | Clip failure observable on a suitably scoped return; file-wide contract has a freeze conflict. Clip fact and unmeasured benefit explicit. |
| G1 | Missing citation can pass a weak command/regex; not impossible. Illustration labelled one incident. |
| G2 | Later critic contradiction observable. Blind n=1, Astra/Sol distinction and unknown Sol cost explicit. |
| G3 | Equal false rates can occur. Record scope and unmeasured no-code form explicit. |
| G4 | Compression miss possible; two replay cases and uncertain identity disclosed. |
| G5 | Absolute plant floor repaired; two-discard test unscheduled, C2-7.2. One incident each explicit. |
| G6 | Misattribution observable, observed here. Toy/record scope explicit. |
| G7 | New-regression concentration after claim verification observable. Lines 365–369 expressly locate evidence in 06/08 and M22, not a concealed multi-document trial. |
| G8 | A covered false case after verifier approval observable. Historical misses and unmeasured efficacy explicit. |
| S1 | Critics adding nothing over three surveys observable; each component labelled one incident. |
| S2 | Matching quote cut from context possible; no longer the excluded nonmatching-row test. |
| S3 | Quarter disagreement possible; second mapper unmeasured. |
| S4 | Equal phase-3 failure rates possible, though unmatched practices/tasks would not isolate ranking efficacy. Category definitions now correct. |
| S5 | Later controlled benefit can contradict a rejected practice. Bundle attribution forbidden; register alone proves no benefit. |

No additional rule was retained as concealing a single-incident efficacy result: v2 labels the incident/unmeasured transfer or names its finite record directly. This does not establish that a universal policy works. No extra purely restated refutation is retained: HO3's detector miss is observable even though detecting a repeat does not preserve the former prohibition. The retained Front 7 defects are HO5's counterfactual and G5's unreachable scheduled two-discard outcome.

## Owner questions — one line each

- Assess before changing: no calibrated whole-text leave-it-alone decision; known-open predicate still incomplete.
- How to present: no verified selective-acceptance result with complete provenance/semantic coverage; no measured owner-format benefit.
- Iterations that heal: no dependable regression count, independent whole-diff improvement result or demonstrated reduction in work to acceptance.
- Collecting practice: no individual adoption/demotion inference from bundled deltas; per-practice comparisons unrun.

The record settles the existing charged-round definition: introduction and confirmation by that round's critics. Authorizing retrospective attribution of eventual findings would change the metric. Individual uncertain historical adjudications cannot be recovered from a wording preference.

## Limitations, failures and taste

Unknown: full provenance/grouping before 04; exact historical runtime checkout; semantic mixture outcomes; owner decision on 09; Sol verifier behavior, cost and false-refusal rate; language benefit; human transfer; calibrated triage false accepts; independently scored phase-3/practice effects. No unknown is inferred from historical prose or a syntactic script result. No repository test suite is reported passing. Six byte-exact replay comparisons were executed and observed; all numeric counting output is logged.

Two initial report-generation commands failed (a nested string delimiter, then missing generated file). Their command, started state, exit and diagnostic are in command-failures.log. Direct heredoc creation recovered the generator; no counting or geometry run failed to start. Nonzero diff and ledger exits were expected observed verdicts, not unavailable commands.

Taste/open choices: fourth command versus stage; heading order, field names, model preferences, diff rendering; displaying multi-span groups; mapping zero-length deletion spans and ancestry through overwritten replacements. Missing early edit files prevent a complete record answer for provenance. Empty refused-list initialization, transactional regeneration, a verdict metadata convention and a self-test retry may be easy implementation choices, but are absent from the claimed executable sequence; their concrete missing requirements are retained as findings.

Verdict: v2 is not implementable as written. Incomplete triage predicates, defective sentence-group counting, narrow semantic mixture checks, missing first-handover/rollback contracts and a file-wide verdict rule conflicting with freeze block it. The verifier test also fails to isolate and independently score the claimed treatment.
