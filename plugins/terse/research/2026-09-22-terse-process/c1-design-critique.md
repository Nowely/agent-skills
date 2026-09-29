# Codex Astra C1 — critique of the terse design

Status: done — six-front review complete; revision required. No competing design proposed.

Counts: Front 1: 5, Front 2: 2, Front 3: 18, Front 4: 3, Front 5: 2, Front 6: 4; total 34 numbered findings.

All repository access was read-only. All generated files are beneath $TMPDIR/astra-c1.aLxaNH. No network fetch, subagent, live model call, repository test suite, or destructive behavior probe was run.

The blind refusal list was written and SHA-256 recorded before opening the design, D1, H1, M1, reviews/08, or the prior method attack. Then D1 (613 lines), H1 (86), M1 (586), design (550) and both appendix files were read whole before judging. Current audit/rethink/rewrite skill texts, displaced references, the previous attack and the cited research record were read. Current and historical code was available; 846197c contains the Round 08 edit file and code whose cited ranges match, but the exact Round 08 runtime checkout is unknown. This is not a rerun of the historical lifecycle experiments.

Blind artifact: $TMPDIR/astra-c1.aLxaNH/blind-round08.md; SHA-256 ba89fe38828452bf40a40fac8513bf66c6072f91cd3cc136e688c97bbf129051.

Every retained finding below quotes the design and an evidence file at named lines. The first six whitespace-separated words of every displayed source quote were checked with actual `grep -n -F --` subprocess calls; the full transcript is grep-validation.log. Extra quotes are checked too. These matches establish quotation provenance, not behavioral truth.

## Front 4 blind run — fixed input and later scoring

List A — pre-autopsy refusals (zero-based edits/08.json indices; reasons preserved verbatim in blind-round08.md):

- [0]: sandbox comparison leaves excludeSlashTmp unchecked.
- [1]: last-measured/pinned wording exceeds the dated measurements.
- [3]: first-run permission claim remains an unmeasured harness guarantee.
- [10]: .gitignore is not the standard-ignore boundary; cut-short wording also drops completed save failures.
- [11]: proof-only comparison is not established as exhaustive.
- [12]: plugin standing instructions conflict with the unqualified ordinary-codex comparison.
- [13]: private home also inherits configuration; scratch fallback was omitted.
- [16]: retention wrongly includes caller-owned TMPDIR.
- [18]: declined approval does not necessarily win the exit ladder.
- [20]: a later successful expected match can follow a failed named command.
- [25]: most-likely-memory diagnosis has no observed cause distribution.
- [26]: mutation claim still encompasses tests added after the dated audit.

List B — mapping only after opening D1 Round 08:

| Outcome | D1 id | edits/08.json index | Basis |
|---|---|---:|---|
| caught | R08-1 | 0 | same unchecked sandbox field |
| caught | R08-4 | 10 | same wrong Git exclusion boundary |
| caught, qualified | R08-5 | 11 | same exclusivity rejected as unsupported; specific decorrelated-model counterexample NOT found blind |
| caught | R08-6 | 13 | same inherited configuration beyond only auth/sessions |
| caught | R08-8 | 16 | same caller TMPDIR outside pruning |
| caught | R08-10 | 26 | same unbounded historical mutation coverage |
| missed | R08-2 | 6 | targeted versus tree-wide greps distinction not checked |
| missed | R08-3 | 7 | report deletion inside a selected run directory not detected |
| missed | R08-7 | 14 | ignored-only files not preserving a worktree not detected |
| missed | R08-9 | 24 | three lock-holder cases and lost automatic cure not detected |

Primary refusal-level score: 6 caught / 4 missed of 10. Extra refusals outside D1’s ten are [1,3,12,18,20,25], not silently called false positives: D1 itself leaves additional 08 regressions unresolved at 609-613. Strict explicit-counterexample score: 5 caught / 5 missed, with R08-5 moved to missed. Part 6’s seven desk cases: 5/7 by refusal, 4/7 by explicit counterexample. The single run is n=1; the selected model was Astra, not the design’s Sol, and it cannot determine Sol’s rate. No hindsight additions changed List A.

## Findings by front

### Front 1

F1.1. **T1 requires an unobserved counterfactual to overturn its ban**

- Design: `$TMPDIR/tmp.iUPMIn91WR/fable-a1-terse-design.md:49` — “*Refuted by:* a triage `no change` verdict later contradicted by an audit, where the contradicting”
- Evidence: `~/Git/agent-skills/plugins/terse/skills/audit/references/measure.md:62` — “Ask nothing else. In particular, **never ask whether the text was clear**. On 2026-09-10 that self-report”

The outcome is a failure that a clarity question “would have flagged”, but T1 forbids asking that question and S5 collects keyed answers only. A subsequent audit can expose an error; it cannot reveal what an unasked question would have diagnosed. No comparison arm collects the missing signal. This leaves the ban protected against the very diagnostic benefit at issue, rather than specifying an observable refutation.

F1.2. **HO3 can fail compliance, but its category-fit refutation cannot occur**

- Design: `$TMPDIR/tmp.iUPMIn91WR/fable-a1-terse-design.md:165` — “the same words.** *Refuted by:* a later round re-proposing a refused hunk verbatim, or the owner's”
- Evidence: `$TMPDIR/codex-sol-h1-terse-survey-harvest.md:85` — “- No entry gives a protocol for refusing the whole rewrite while retaining valid individual corrections, or records refusal reasons in a form that improves a second handover.”
- Additional: `$TMPDIR/tmp.iUPMIn91WR/fable-a1-terse-design.md:164` — “`content`, `wording`, `unclear`, `other` — plus their text, and the next round may not re-propose it in”

“Other” admits every refusal reason, so reasons outside all four categories cannot exceed a quarter (or any positive fraction). A verbatim repeat merely violates the instruction not to repeat; it does not test whether recording four labels helps the second handover. Both offered tests leave the substantive format claim untested.

F1.3. **G5 allows a reader that misses every paraphrase to survive its refutation test**

- Design: `$TMPDIR/tmp.iUPMIn91WR/fable-a1-terse-design.md:270` — “paraphrases of retired claims, the reader finds fewer than the regex does. *Evidence:* D1 fact 3 —”
- Evidence: `$TMPDIR/tmp.JZamtTvIcT/regression-autopsy.md:360` — “08 satisfied that pin by **paraphrase**: the pattern is the literal string `The one place the two differ”
- Additional: `$TMPDIR/astra-c1.aLxaNH/checks.log:30` — “G5 zero-baseline counterexample: if each planted paraphrase evades the regex, regex matches=0; reader matches=0 does not satisfy fewer-than-regex (0 < 0 is false).”

The problem being repaired is paraphrases the regex does not catch. For three such plants the regex score is zero. A reader finding zero is not “fewer than” zero, so the worst possible reader passes this stated refutation criterion. This is a logical counterexample, not a prediction of model performance; checks.log:30 evaluates the zero comparison.

F1.4. **G6 makes expressibility, not correct counting, its refutation**

- Design: `$TMPDIR/tmp.iUPMIn91WR/fable-a1-terse-design.md:282` — “confirmed false sentence that no pattern-plus-proposition entry can express — then the count undercounts,”
- Evidence: `$TMPDIR/tmp.JZamtTvIcT/regression-autopsy.md:609` — “- `rounds.md:17` counts 10 for round 08; `ledger.json` carries **11** `NEG` entries whose single `YES` is”
- Additional: `$TMPDIR/tmp.iUPMIn91WR/fable-a1-terse-design.md:283` — “and the ratio "pins written / findings verified" reports it. *Evidence:* D1 fact 2 (`:569-574`): the”

Any finite quoted false sentence can be represented by an escaped literal regex and a prose proposition. There is no substantive counterexample in which a critic has quoted the sentence but no pattern-plus-proposition can express it. The evidence actually shows competing counts (10 versus 11), a problem of units and attribution that expressibility cannot expose. F3.8 gives a concrete miscount.

F1.5. **S2 restates row membership as its refutation**

- Design: `$TMPDIR/tmp.iUPMIn91WR/fable-a1-terse-design.md:416` — “a mapper verdict later overturned because the row's quote was not in the source. *Evidence:* M1 axis 1”
- Evidence: `$TMPDIR/tmp.aasWWgOKbX/m1-two-surveys-compared.md:75` — “**Newer: fetched is a precondition, not a marking, and the quote is machine-checked.**”
- Additional: `$TMPDIR/tmp.iUPMIn91WR/fable-a1-terse-design.md:415` — “(benefit / harm / null), fetch status; a row without a quote that matches is not a row.** *Refuted by:*”

The rule defines an admitted row as one whose quote occurs in the fetched source. Its refutation asks for an admitted row whose quote does not occur there. With the same immutable fetched source and the promised match, this is excluded by definition; with a broken implementation it tests the matcher, not whether the schema supports a sound bounded claim or mapping. A verbatim but misleading extraction survives this test.

### Front 2

F2.1. **T1 repeats the single-run clarity generalisation the earlier attack identified**

- Design: `$TMPDIR/tmp.iUPMIn91WR/fable-a1-terse-design.md:48` — “**Rule T1. Triage asks no agent whether the text is clear, and its only agent signal is a keyed answer.**”
- Evidence: `~/Git/agent-skills/research/2026-09-12-skill-review/astra-method-attack.md:353` — “Anecdote: two confident readers answered incorrectly and one confused reader answered correctly in one run (AUDIT:98–100). That defeats substituting clarity ratings for correctness. It does not establish that asking both questions has no value.”
- Additional: `$TMPDIR/codex-sol-h1-terse-survey-harvest.md:22` — “| 9 | `research/2026-09-11-terse-survey/round2-returns/protocol-evaluation-theory.json:94` | measured; opened | “Never use an LLM's own readability rating as a metric. Asking a frontier model to grade a text on a 1-12 scale or a 1-100 scale produced no significant relationship with measured reading effort.” | Gruteke Klein et al., arXiv:2502.11150, six models × four prompts; result CSVs and paper |”
- Additional: `$TMPDIR/tmp.iUPMIn91WR/fable-a1-terse-design.md:51` — “no confusion answered wrong, the confused one answered right (`audit/SKILL.md:98-101`, `measure.md:62-65`);”

The design cites three self-reports from the September 10 pilot, without bounding its prohibition to that one incident. H1 a#9 adds evidence against a numeric readability rating as a metric, not against asking a diagnostic clarity question alongside an objective answer. Neither supports the blanket ban on collecting that signal in triage. This is the prior attack’s D9 fault again, separately from F1.1’s unobservable refutation.

F2.2. **S1 makes the newer survey’s one role split mandatory without marking the transfer as n=1**

- Design: `$TMPDIR/tmp.iUPMIn91WR/fable-a1-terse-design.md:399` — “**Rule S1. Surveyors never map; the mapper never surveys; the split critic reads the cut before any”
- Evidence: `$TMPDIR/tmp.aasWWgOKbX/m1-two-surveys-compared.md:264` — “- Net: the older run has the completeness check and lacks the split check; the newer has the split check”
- Additional: `$TMPDIR/tmp.aasWWgOKbX/m1-two-surveys-compared.md:265` — “and lacks the completeness check. Neither run had both.”
- Additional: `$TMPDIR/tmp.iUPMIn91WR/fable-a1-terse-design.md:401` — “survey for what nobody mentioned.** *Refuted by:* three surveys where the split critic changes no brief”

The mapping-separation success is one newer survey; the completeness success is the older survey, and neither run used both critics. The rule does not label this combined mandatory protocol “one incident” or unmeasured, while nearby S3 explicitly labels its document transfer unmeasured. M1 shows what those assignments produced, not a comparison establishing that surveyors must never map or mappers must never survey. The unconditional separation repeats the anecdote-to-law fault; the explicit single-incident label on lens 7 avoids it.

### Front 3

F3.1. **The central trigger measurement is 18/25 with the stated mask, not 19/25**

- Design: `$TMPDIR/tmp.iUPMIn91WR/fable-a1-terse-design.md:540` — “**19 of 25**. Misses: R04-1, R06-4, R07-2, R08-1, R08-5, R08-10. One known false alarm class in the hits:”
- Evidence: `$TMPDIR/tmp.JZamtTvIcT/regression-autopsy.md:229` — “> "worktree ledger, images you attached, the scratch of read-only agents started from a shell that names”
- Additional: `$TMPDIR/tmp.iUPMIn91WR/fable-a1-terse-design.md:539` — “when|ends|killed|dies|crashed|dead)\b`, case-insensitive, `read-only` masked. Hits: ABS 6, LIFE 15, either”
- Additional: `$TMPDIR/astra-c1.aLxaNH/checks.log:2` — “Trigger recount with the exact JavaScript regexes and stated read-only mask: total=25 ABS=4 LIFE=15 either=18.”
- Additional: `$TMPDIR/astra-c1.aLxaNH/checks.log:3` — “Trigger misses: R04-1, R06-4, R07-2, R07-3, R08-1, R08-5, R08-10.”

I reran the exact JavaScript expressions on all 25 q.txt rows with read-only masked as Appendix A specifies. ABS=4, LIFE=15, either=18; the seventh miss is R07-3, whose sole would-be absolute match is “only” inside read-only. The unmasked expressions yield ABS=6/either=19, explaining the stated numbers. This changes T3/G3’s supporting recall and the miss list. It is a quotation-level count, not sensitivity on a representative corpus.

F3.2. **The promised appendix reproduction does not execute as supplied**

- Design: `$TMPDIR/tmp.iUPMIn91WR/fable-a1-terse-design.md:549` — “Reproduce: `q.txt` (ids and D1's quotes) and `gateload.mjs` beside this file; the quotes are”
- Evidence: `$TMPDIR/astra-c1.aLxaNH/checks.log:10` — “ReferenceError: require is not defined in ES module scope, you can use import instead”
- Additional: `$TMPDIR/astra-c1.aLxaNH/checks.log:5` — “Command: node $TMPDIR/tmp.iUPMIn91WR/gateload.mjs ~/Git/agent-skills/research/2026-09-11-markup-round-0 — started; exit 1; exact diagnostic follows:”
- Additional: `$TMPDIR/astra-c1.aLxaNH/checks.log:17` — “Unchanged .cjs copy command started; exit 0; gate-load output follows:”

The .mjs file uses const fs=require("fs") at line 2. The documented node command started and exited 1 on Node v24.11.0 with the quoted diagnostic. An unchanged copy named gateload.cjs under TMPDIR ran with exit 0 and reproduced gate-load refusals 3,2,6,7,9,2 and densities 27/48,27/50. The results can be recovered, but the supplied reproduction is broken.

F3.3. **Triage promotes resolution checks to behavioral level 3**

- Design: `$TMPDIR/tmp.iUPMIn91WR/fable-a1-terse-design.md:59` — “| `broken` | S1 fired | `audit`, with the hits as ledger entries pre-filled `refuted`, level 3 |”
- Evidence: `~/Git/agent-skills/plugins/terse/skills/audit/references/truth-pass.md:16` — “| 3 | the behaviour happens | a check that runs and shows it |”
- Additional: `~/Git/agent-skills/plugins/terse/skills/audit/references/truth-pass.md:14` — “| 1 | the line exists | the path and line number resolve |”
- Additional: `$TMPDIR/tmp.iUPMIn91WR/fable-a1-terse-design.md:42` — “| S1 | resolution | every path, command and link in inline code or a link target: does it exist in the checkout; a path the sentence tells the reader to create, and a block that discloses its own pin, are exempt | 0 agents | H1 a#23 (two-layer split, asserted), a#26 (deterministic first, argued), a#24 (211-finding noise, measured), a#25 (pin exemption, argued) |”

S1 checks existence/resolution, then the broken verdict pre-fills claim entries as refuted at level 3. In the repository taxonomy resolution is level 1; level 3 requires making the claimed behavior happen. A missing local path can prove a broken local link, but it does not execute the sentence’s behavior, and paths/commands referring to an installed host can be valid outside the checkout. Pre-filling the behavioral ledger at level 3 misstates what the script observed.

F3.4. **S3 compares against the document edit date, not the evidence revision**

- Design: `$TMPDIR/tmp.iUPMIn91WR/fable-a1-terse-design.md:44` — “| S3 | staleness | for each sentence the prior ledger backed with `file:lines`, whether those lines changed since the sentence's own last commit (`git log -L` on the source range, `git log` on the doc line); with no prior ledger, whether any tracked non-`.md` file changed since the doc's last commit | 0 agents | H1 a#4 (fingerprint, argued), a#5 (co-change mining, argued); `unmeasured` here |”
- Evidence: `$TMPDIR/codex-sol-h1-terse-survey-harvest.md:17` — “| 4 | `research/2026-09-11-terse-survey/round2-returns/repo-wshobson-agents.json:11` | argued; opened | “Stamp each document with the commit it was written against and the list of code paths it describes ('Fingerprint: git:5b237fa' / 'Monitored: src/auth/jwt.ts, package.json'), then decide whether to re-audit by running `git diff --stat <fingerprint>..HEAD -- <monitored paths>`: empty output means the document still describes the code it was compiled against, any output means recompile and re-stamp.” | wshobson/agents grounded-vault, SKILL.md:41–53,67–75 and details.md:136–138 |”

The H1 fingerprint is the commit the document’s evidence was checked against. S3 instead asks whether source lines changed since the sentence’s own last commit. After an audited source changes, a later wording-only doc commit puts that change before S3’s lower bound, although no revalidation occurred. S3 can then report clean while the old ledger is stale. Doc authorship time cannot substitute for evidence provenance; this changes the no-change decision.

F3.5. **The triage verdict table has no result for a failed re-score**

- Design: `$TMPDIR/tmp.iUPMIn91WR/fable-a1-terse-design.md:58` — “| `no change` | S1 clean; S3 shows no source change under any claim the prior ledger confirmed; S4 exists; S5 scores at or above the prior score with every control held and no reader departed | nobody; the owner sends |”
- Evidence: `~/Git/agent-skills/plugins/terse/skills/audit/references/measure.md:113` — “- the score falls by more than the measured noise floor, or by anything at all if no floor was measured”
- Additional: `$TMPDIR/tmp.iUPMIn91WR/fable-a1-terse-design.md:62` — “| `unmeasured` | S1–S3 clean and no S4 | the owner, with the audit's cost; triage cannot say `no change` |”
- Additional: `~/Git/agent-skills/plugins/terse/skills/audit/references/measure.md:114` — “- a control question that passed now fails”

Consider S1 clean, S3 clean, S2 absent (or all triggered claims backed), S4 present, and S5 below its old score or with a broken control/departure. No-change fails; broken, stale and unbacked do not fire; unmeasured requires no S4. None of the five emitted verdicts applies. This is precisely an existing re-measure failure the current protocol handles, so the triage state machine is incomplete.

F3.6. **T4’s “2×2” conflates abstention with acceptance and changes unit mid-table**

- Design: `$TMPDIR/tmp.iUPMIn91WR/fable-a1-terse-design.md:102` — “verdict, and the report carries a 2×2: `no change`/`unmeasured` × audit failure = false accept; flagged”
- Evidence: `$TMPDIR/codex-sol-h1-terse-survey-harvest.md:71` — “- No entry validates a cheap triage instrument against the full reader test on a representative documentation corpus, so sensitivity, specificity, false-accept cost, false-reject cost, calibration, and an abstention rule are unanswered.”
- Additional: `$TMPDIR/tmp.iUPMIn91WR/fable-a1-terse-design.md:62` — “| `unmeasured` | S1–S3 clean and no S4 | the owner, with the audit's cost; triage cannot say `no change` |”
- Additional: `$TMPDIR/tmp.iUPMIn91WR/fable-a1-terse-design.md:104` — “false-accept count above zero — then `no change` is withdrawn from the verdict set until the condition”

Unmeasured hands the decision and audit cost to the owner; it is not an acceptance. Counting a failure after unmeasured as a false accept can withdraw no-change even when no document was accepted. The other cell is a flagged line with no failure at that line, changing the unit from documents to lines, and no true-positive/true-negative cells are defined. The proposed calculation cannot measure the promised acceptance/alarm instrument.

F3.7. **G3 removes the existing fallback for text that has no executable code**

- Design: `$TMPDIR/tmp.iUPMIn91WR/fable-a1-terse-design.md:242` — “**Rule G3. A sentence in `new` text that carries a guarantee or lifecycle word (the S2 lists) is refused”
- Evidence: `~/Git/agent-skills/plugins/terse/skills/audit/references/truth-pass.md:75` — “Level 3 is unreachable for a claim about the world rather than about software. The rule degrades to:”
- Additional: `~/Git/agent-skills/plugins/terse/skills/audit/references/truth-pass.md:76` — “a guarantee-shaped claim carries a named source the reader can check, or it is weakened. Everything”
- Additional: `~/Git/agent-skills/plugins/terse/skills/audit/SKILL.md:26` — “- Which repository backs them, if any. Text with no code behind it still gets audited; the truth pass”

G3 applies to every new sentence with a trigger and requires an executed level-3 claim, without the existing truth-pass exception for world claims or source-only documents. The plugin expressly audits text with no code (audit/SKILL.md:26-27). A sourced statement in that supported input class cannot clear this new gate even when the previous contract accepts it. T3 also labels such statements unbacked indefinitely.

F3.8. **G6 computes a different quantity from introduced false or overstated sentences**

- Design: `$TMPDIR/tmp.iUPMIn91WR/fable-a1-terse-design.md:280` — “its failure count on that round is the round's regression count, and the next round starts from a red”
- Evidence: `~/Git/agent-skills/plugins/terse/skills/rewrite/SKILL.md:117` — “category; **regressions** is the count of sentences the round introduced that its critics showed”
- Additional: `$TMPDIR/tmp.iUPMIn91WR/fable-a1-terse-design.md:281` — “ledger.** Regressions(N) = rows whose first `YES` is at N + rows `LOST` at N. *Refuted by:* a critic-”
- Additional: `$TMPDIR/astra-c1.aLxaNH/checks.log:36` — “G6 proposed first-YES formula for round 3: first YES is at round 1, no positive rows exist, so computed regressions=0; the previously removed false sentence was reintroduced at round 3, so definition in rewrite/SKILL.md:117-118 counts 1.”
- Additional: `$TMPDIR/astra-c1.aLxaNH/checks.log:37` — “G6 persistent-error check: negative pattern present in rounds 1 and 2 gives failure count 1 on round 2 but first-YES formula 0; the two stated counts disagree.”

Failure rows, sentence regressions, and first appearances are not interchangeable. In an executed four-round toy ledger a retired false sentence appears, is removed, then returns: the existing ledger reports one failure on the last round; G6’s first-YES formula gives zero because its first YES was two rounds earlier. Conversely a persistent old false sentence produces a failure row without being newly introduced. Multiple pins for one sentence and a wanted phrase lost by a true paraphrase further separate row counts from the retained definition. This is a correctness defect in the proposed verdict, not disagreement about which critic to believe.

F3.9. **The “one untouched” classification contradicts the stated gates and the actual edit**

- Design: `$TMPDIR/tmp.iUPMIn91WR/fable-a1-terse-design.md:320` — “| R06-4 | e | — | — | no trigger word, no citation; **untouched** |”
- Evidence: `$TMPDIR/tmp.JZamtTvIcT/regression-autopsy.md:172` — “- **Edit:** `edits/06.json[8]` "troubleshooting rows 2 and 3". **Declared check:** none.”
- Additional: `$TMPDIR/tmp.iUPMIn91WR/fable-a1-terse-design.md:220` — “- (i) every sentence in `new` that states behaviour has a claim; an edit filed as "water" whose sentence”
- Additional: `$TMPDIR/tmp.iUPMIn91WR/fable-a1-terse-design.md:514` — “G2 duty (i), which is a judgement that the sentence "states behaviour".”
- Additional: `$TMPDIR/astra-c1.aLxaNH/checks.log:29` — “R06-4 input is edits/06.json[8]; its new text has ABS=false LIFE=true; contains behavioural assertion about a report path.”

R06-4 is in edits/06.json[8], an added behavioral troubleshooting claim; G2(i) requires a claim for every such sentence and G2(ii) requires a run answering it. Moreover the enclosing edit contains lifecycle wording (the executed check found LIFE=true), so the appendix’s edit-level gate refuses that edit too. The design itself concedes at 513-514 that G2(i) reaches R06-4. “Untouched” is therefore not an exhaustive disjoint class that closes 13+11+1.

F3.10. **HO2 gives a previous-round edit file to the document-original base**

- Design: `$TMPDIR/tmp.iUPMIn91WR/fable-a1-terse-design.md:156` — “**Rule HO2. Every hunk is separately acceptable; `apply.mjs original.md edits/NN.json --accept ids`”
- Evidence: `~/Git/agent-skills/plugins/terse/skills/rewrite/SKILL.md:95` — “3. **Produce the round**: `node "$S/round.mjs" <NN-1>-<pass>.md <NN>-<pass>.md edits/NN.json --ledger ledger.json`.”
- Additional: `$TMPDIR/astra-c1.aLxaNH/checks.log:26` — “HO2 base check: edits/08.json[0].old occurs 0 times in 00-draft.md and 1 time in 07-lifecycle.md.”
- Additional: `$TMPDIR/astra-c1.aLxaNH/checks.log:27` — “HO2 first-round-original matches (zero-based index:count): 0:0, 1:0, 2:0, 3:0, 4:0, 5:0, 6:0, 7:0, 8:0, 9:0, 10:0, 11:0, 12:0, 13:0, 14:0, 15:0, 16:0, 17:0, 18:0, 19:0, 20:0, 21:0, 22:0, 23:0, 24:0, 25:0, 26:0”

HO1’s diff is against the document original, and HO2 explicitly invokes apply.mjs original.md edits/NN.json. Those edit files are incremental against NN-1. In the actual record, all 27 old strings from edits/08.json occur zero times in 00-draft.md; edit [0] occurs once in 07-lifecycle.md. Partial acceptance against the original cannot use that file unchanged. If “original.md” means the previous round instead, it cannot selectively accept the original-to-candidate handover hunks as promised.

F3.11. **HO2’s textual dependency rule does not preserve the verified document**

- Design: `$TMPDIR/tmp.iUPMIn91WR/fable-a1-terse-design.md:139` — “`new` this hunk's `old` occurs in — computed by the script, not declared). *Evidence:* H1 b#6”
- Evidence: `$TMPDIR/tmp.JZamtTvIcT/regression-autopsy.md:447` — “- **Compound damage:** this edit's sibling (`edits/08.json[16]`) retired `killed run's lock reclaimed`,”
- Additional: `~/Git/agent-skills/plugins/terse/skills/rewrite/references/bake-off.md:143` — “writer would have written, and no judge has scored it. Re-check every graft against the code, because a”
- Additional: `$TMPDIR/astra-c1.aLxaNH/checks.log:28` — “HO2 semantic-coupling check for lock edits [16] and [24]: old[16] in new[24]=false; old[24] in new[16]=false. Both are false although D1:447-448 identifies compound damage.”

An old substring appearing inside another edit’s new substring captures application order, not semantic dependence between edits in separate sections. D1 records coupled damage between 08 indices [16] and [24]; neither old occurs inside the other new (checks.log:28). The current bake-off also requires rechecking a graft because a true sentence can become false in different surrounding text. HO2 allows an arbitrary clean-applying mix and specifies no re-verification or updated handover metrics for that mixed document. Its “new sentence no round carried” test also misses contradictions composed entirely of previously seen sentences.

F3.12. **HO3 weakens the refusal memory to an exact-word ban**

- Design: `$TMPDIR/tmp.iUPMIn91WR/fable-a1-terse-design.md:165` — “the same words.** *Refuted by:* a later round re-proposing a refused hunk verbatim, or the owner's”
- Evidence: `~/Git/agent-skills/plugins/terse/skills/rewrite/references/loop.md:108` — “by someone other than the writer. It also records what was deliberately refused, so the next round does”
- Additional: `$TMPDIR/tmp.JZamtTvIcT/regression-autopsy.md:576` — “3. **The pin is a phrase, so a paraphrase walks through it — twice, provably.**”

The displaced map records what was deliberately refused so it is not re-proposed. HO3 permits the same rejected content again after any paraphrase. The design’s own evidence already demonstrates the failure of exact-phrase protection twice (D1’s fact 3); G5 fixes that weakness for false claims but no corresponding rule covers owner refusals. This is a loss of the existing refusal requirement, separate from F1.2’s defective refutation.

F3.13. **The replacement return contract drops the prerequisite inventory and current decision artifacts**

- Design: `$TMPDIR/tmp.iUPMIn91WR/fable-a1-terse-design.md:151` — “`diff-NN.patch`"; the return list at `:154-163` becomes the sections above; the cut ledger”
- Evidence: `~/Git/agent-skills/plugins/terse/skills/rewrite/SKILL.md:160` — “- `diff-NN.patch` against the original; the cut ledger — every removed passage of twenty words or more,”
- Additional: `~/Git/agent-skills/plugins/terse/skills/rewrite/SKILL.md:161` — “with its reason; the invisible-prerequisite inventory from the curse-of-knowledge pass, on rounds that”
- Additional: `~/Git/agent-skills/plugins/terse/skills/audit/references/ledgers.md:103` — “**Invisible prerequisites.** One numbered item per thing a reader must already know, each with the”
- Additional: `~/Git/agent-skills/plugins/terse/skills/rewrite/references/curse-of-knowledge.md:4` — “keep the inventory from step one; it is one of the artifacts `rewrite` returns.”

The design explicitly says the return list at 154-163 becomes the six handover sections. It folds the cut ledger into why, but provides no home for the invisible-prerequisite inventory, the maintained skeleton/structure map, or the verbatim review archive that the displaced list requires. In particular the still-retained writer brief’s prerequisite inventory remains a required artifact and a judging input. Counts of unchanged claims are not that inventory. The replacement must preserve those required outputs or state their removal; it currently does neither.

F3.14. **S5 demotes individual practices using a measurement that cannot attribute their effects**

- Design: `$TMPDIR/tmp.iUPMIn91WR/fable-a1-terse-design.md:436` — “count it should move, and a practice whose number did not move across two documents is moved to the”
- Evidence: `~/Git/agent-skills/plugins/terse/skills/audit/references/measure.md:130` — “**Not measured:** which part of the chain produced the gain. The experiment that would isolate it —”
- Additional: `$TMPDIR/tmp.iUPMIn91WR/fable-a1-terse-design.md:448` — “hypothesis is settled slowly, across documents, by S5 — not in the round that adopted it. What is not”
- Additional: `$TMPDIR/tmp.aasWWgOKbX/m1-two-surveys-compared.md:555` — “**What it is.** README.md:5 — "Only phase 3 — matched tasks, independent outcome assessment, a”
- Additional: `$TMPDIR/tmp.aasWWgOKbX/m1-two-surveys-compared.md:560` — “the evidence calls for it the comparator is a single agent or no delegation (H1, H15); cells need n ≥ 50 or”

Two documents whose bundled re-audit number did not move do not establish that a particular adopted practice failed: there is no per-practice comparator, independent attribution, or allowance for a ceiling, noise, or another harmful change. Lines 444-449 admit the re-audit measures the document rather than the practice, yet call S5 a way of settling that practice’s hypothesis. The current evidence explicitly forbids this component attribution; M1 phase 3 requires comparators and matched assessment. Labelling the later decision non-causal does not make the demotion evidence sound.

F3.15. **S4 changes the meaning of M1’s evidence categories while claiming to adopt them**

- Design: `$TMPDIR/tmp.iUPMIn91WR/fable-a1-terse-design.md:428` — “**Rule S4. Effect claims are ranked by study design (controlled > varied-evidence > reasoned > mentioned)”
- Evidence: `~/Git/agent-skills/research/2026-09-17-orchestration-practices/r-synthesis.md:9` — “**Mapping values** (C0's set): `present` = the pages instruct the practice; `partial` = part of it, or a different mechanism aimed at the same failure; `conditional` = the pages have it or avoid it only under a condition the claim does not share (width, mode, rights level); `not located` = not in the two pages as read; `unknown` = no page counterpart is expected (measurement-method claims); `contradicts` = incompatible instructions under the same conditions. For a claim whose direction is harm or no-benefit, `present` means the pages already avoid the practice the source warns against. **Strength** (C0: study design, separate from source type): `CC` controlled comparison (S2-A rows with a comparator; S2-B validity studies tagged `CC-v`); `VE` vendor experience report (`VE-n` when the vendor reports a number of its own); `RA` rationale; `ME` mechanism only (exists; no effectiveness claim).”
- Additional: `$TMPDIR/tmp.aasWWgOKbX/m1-two-surveys-compared.md:208` — “- Shortlist: `r-synthesis.md:697-699` — "Ranking key: study-design strength first (CC > VE > RA > ME),”

M1’s cited ranking is CC > VE > RA > ME; its actual source defines VE as vendor experience report, RA as rationale, and ME as mechanism only. The design substitutes “varied-evidence”, “reasoned”, and “mentioned”. Varied evidence is not a vendor report, and an executable mechanism is not mere mention. Those changed categories can reorder the adoption shortlist; no evidence supports the relabelled hierarchy.

F3.16. **S5 cites nonexistent lines in M1**

- Design: `$TMPDIR/tmp.iUPMIn91WR/fable-a1-terse-design.md:439` — “*Evidence:* M1 `:440-442`, `:734-736`; phase 3 never ran for the newer run (`:568-582`). *Displaces:*”
- Evidence: `$TMPDIR/tmp.aasWWgOKbX/m1-two-surveys-compared.md:226` — “- §8, the register: `r-synthesis.md:734-736` — fifteen hypotheses, each with *stage*, *metric*,”
- Additional: `~/Git/agent-skills/research/2026-09-17-orchestration-practices/r-synthesis.md:736` — “Each names its metric (C0's ruler: unique coordinator incidents per comparable run by stage, owner corrections, independently verified outcomes, agents and paid turns) and its comparator. Where the evidence calls for it, the comparator is a single agent or no delegation. Each names a T1 incident or says "no local counterpart". These are hypotheses; nothing above tests them.”

M1 has 586 lines, so M1:734-736 does not exist. Those are r-synthesis.md’s hypothesis-register lines, quoted and attributed by M1:226-228. M1:440-442 describes attaching local incidents as hypotheses, not a two-document demotion threshold. The existing citation therefore cannot substantiate the decision rule as written.

F3.17. **The executable pipeline orders a post-critic verdict before its evidence**

- Design: `$TMPDIR/tmp.iUPMIn91WR/fable-a1-terse-design.md:467` — “/terse:rewrite → per round: verifier → scripts G1/G3/G4/G6 → wave → pins reader → proxy reader”
- Evidence: `~/Git/agent-skills/plugins/terse/skills/rewrite/SKILL.md:110` — “6. **Verify every finding yourself** from the check it carries — a finding without one is discarded —”
- Additional: `$TMPDIR/tmp.iUPMIn91WR/fable-a1-terse-design.md:278` — “**Rule G6. After the critics, every finding the coordinator verified as false or overstated is written as”
- Additional: `$TMPDIR/tmp.iUPMIn91WR/fable-a1-terse-design.md:207` — “fails, and stores the output as `check.saw` — the writer pastes nothing.** *Refuted by:* a citation that”
- Additional: `$TMPDIR/tmp.iUPMIn91WR/fable-a1-terse-design.md:267` — “one cheap reader is given the frozen round and every retired proposition plus one planted proposition”
- Additional: `~/Git/agent-skills/plugins/terse/skills/rewrite/SKILL.md:115` — “7. **Record the round** in `rounds.md`, one table row: `| file | words | produced by | findings against”

The pipeline places G6 among scripts before the wave, although G6 at 278-280 requires coordinator-verified critic findings and re-running the ledger after the critics. It also places G2 before G1 even though G1 creates the observed output G2 must assess, and the blanket 198 statement says all these gates precede freezing while G5 explicitly reads a frozen round. A literal implementation cannot satisfy these orders together. The current skill verifies critic findings and then records the round; that dependency remains necessary.

F3.18. **HO4 treats an owner’s content/unclear label as a causal diagnosis the record rejects**

- Design: `$TMPDIR/tmp.iUPMIn91WR/fable-a1-terse-design.md:183` — “count of `unclear` refusals per handover is the format's score; the count of `content` refusals is the”
- Evidence: `~/Git/agent-skills/plugins/terse/skills/rethink/references/stages.md:148` — “Before deleting a fact a reader called noise, try it in another form. The reader is reporting what the”
- Additional: `~/Git/agent-skills/plugins/terse/skills/rethink/references/stages.md:157` — “the version that was measured. Shown that, the same reader restored all three and said: *"possibly I did”
- Additional: `$TMPDIR/tmp.iUPMIn91WR/fable-a1-terse-design.md:184` — “loop's.** *Refuted by:* after three handovers `unclear` has not fallen while `content` has — then the”

The rule assigns unclear counts to the handover format and content counts to the loop, and diagnoses a format failure from their trends. The recorded owner first rejected prerequisite content, then restored it and said the objection may have been its presentation. Thus a content-labelled refusal can be a format failure, and an unclear refusal can arise from missing content. Raw counts also change with the number of hunks. The proposed score cannot support the claimed format-versus-text diagnosis.

### Front 4

F4.1. **Part 6 claim 1: the blind verifier misses two of the seven claimed desk catches**

- Design: `$TMPDIR/tmp.iUPMIn91WR/fable-a1-terse-design.md:518` — “1. **"G2 catches 11 of 25."** It assumes an agent given `edits/NN.json` and the code finds at desk what”
- Evidence: `$TMPDIR/tmp.JZamtTvIcT/regression-autopsy.md:296` — “- **Edit:** `edits/08.json[6]` "commands: orchestrate row shorter (F71)".”
- Additional: `$TMPDIR/tmp.JZamtTvIcT/regression-autopsy.md:434` — “- **Edit:** `edits/08.json[24]`, claims `lock cure names the process group`.”
- Additional: `$TMPDIR/astra-c1.aLxaNH/checks.log:38` — “Blind refusal list caught 6/10 by edit and disputed proposition: R08-1 -> edits/08.json[0]; R08-4 -> edits/08.json[10]; R08-5 -> edits/08.json[11]; R08-6 -> edits/08.json[13]; R08-8 -> edits/08.json[16]; R08-10 -> edits/08.json[26].”
- Additional: `$TMPDIR/astra-c1.aLxaNH/checks.log:39` — “Blind refusal list missed 4/10: R08-2 -> edits/08.json[6]; R08-3 -> edits/08.json[7]; R08-7 -> edits/08.json[14]; R08-9 -> edits/08.json[24].”
- Additional: `$TMPDIR/astra-c1.aLxaNH/checks.log:40` — “R08-5 qualification: blind refusal challenged exclusivity as unsupported; it did not identify the decorrelated-model counterexample. Strict explicit-counterexample scoring is 5 caught / 5 missed, adding R08-5 to misses.”
- Additional: `$TMPDIR/tmp.iUPMIn91WR/fable-a1-terse-design.md:521` — “Fewer than five and the claim falls to "forced", not "caught".”

The frozen blind list refused indices [0,1,3,10,11,12,13,16,18,20,25,26]. Against D1, the refusal-level match is 6/10 caught and 4/10 missed; the two lists below give every id and edit index. For the seven cases Part 6 specifically predicts, it caught five and missed R08-2/[6] and R08-9/[24]. Its “fewer than five” threshold therefore is not triggered under that generous refusal metric, but five of seven is still not all seven and cannot validate 11/25. R08-5 was challenged as an unsupported exclusive claim without the specific decorrelated-model counterexample; strict counterexample scoring is 5/10 overall and 4/7 of the named subset, which does trip that threshold. This is n=1, on Astra, not a measured Sol success rate. G4’s two replayable pins do not turn the eleven desk possibilities into observed catches. “13 caught” must remain a retrospective hypothesis.

F4.2. **Part 6 claim 2: a prior failed audit can still satisfy “no change”**

- Design: `$TMPDIR/tmp.iUPMIn91WR/fable-a1-terse-design.md:522` — “2. **"`no change` is safe when a prior audit still holds."** Six to eight questions and two tasks passed”
- Evidence: `~/Git/agent-skills/plugins/terse/skills/rewrite/references/measurements.md:63` — “<a id="m12"></a>**M12. What the task gate cannot see.** Three readers, three tasks, all passed, on a round”
- Additional: `$TMPDIR/tmp.iUPMIn91WR/fable-a1-terse-design.md:58` — “| `no change` | S1 clean; S3 shows no source change under any claim the prior ledger confirmed; S4 exists; S5 scores at or above the prior score with every control held and no reader departed | nobody; the owner sends |”
- Additional: `~/Git/agent-skills/plugins/terse/skills/audit/references/truth-pass.md:42` — “- **unconfirmed** — you could not settle it.”
- Additional: `$TMPDIR/tmp.JZamtTvIcT/regression-autopsy.md:170` — “> "a report path already used" — `06-preexisting.md:187` (troubleshooting row 2)”

The no-change conditions at 58 require stable sources under confirmed claims and a score at least as high as before. They do not require the prior audit’s refuted, unconfirmed, missing or harmful items to be resolved, or its tasks to pass now. A prior audit can truthfully record a non-trigger false claim outside the sampled questions; the same failed document and unchanged source still satisfy those conditions. M12 proves task/question coverage is not whole-document truth; source stability does not repair a known prior failure. The proposed three-document check has not run and its matrix is also defective (F3.6).

F4.3. **Part 6 claim 3: comparing the proxy on 08 with the owner on repaired 09 cannot measure prediction**

- Design: `$TMPDIR/tmp.iUPMIn91WR/fable-a1-terse-design.md:526` — “3. **"The proxy reader's 'would you send it' predicts the owner's."** One reader, one round, and the”
- Evidence: `~/Git/agent-skills/research/2026-09-11-markup-round-0/README.md:36` — “who had never seen the plugin, on round 08: **not yet** — nothing said how to choose the model or the”
- Additional: `$TMPDIR/tmp.iUPMIn91WR/fable-a1-terse-design.md:527` — “owner has not read round 09. Test: the owner's read of 09 against the Sol items at”
- Additional: `~/Git/agent-skills/research/2026-09-11-markup-round-0/README.md:38` — “first and softens the second; the owner has not read it.”
- Additional: `~/Git/agent-skills/research/2026-09-11-markup-round-0/rounds.md:171` — “candidate the ten-section map recorded. It adds the one thing the naive reader could not find — say”

The sole proxy judged round 08. The proposed owner test judges round 09, which explicitly fixes the proxy’s model/rights gap and softens its pin concern. Agreement or disagreement across those different treatments cannot establish whether the proxy predicts the owner on the same document. The evidence states the owner had not read 09; the present owner outcome is unknown. This invalidates the proposed decisive comparison, without claiming the proxy is useless.

### Front 5

F5.1. **T4 understates the cost of the promised full baseline audits**

- Design: `$TMPDIR/tmp.iUPMIn91WR/fable-a1-terse-design.md:107` — “audits, ~10 agents each (`measurements.md` M21). *Displaces:* nothing.”
- Evidence: `~/Git/agent-skills/plugins/terse/skills/audit/SKILL.md:94` — “this arm found the effect large enough to swallow a result our size. It doubles the reader agents, so it”
- Additional: `~/Git/agent-skills/plugins/terse/skills/audit/SKILL.md:105` — “Beside the question readers, two readers carrying a task: a starting state and an outcome they want,”
- Additional: `~/Git/agent-skills/plugins/terse/skills/rewrite/references/measurements.md:121` — “<a id="m21"></a>**M21. What one wave costs.** On 2026-09-12, on a 1600-word README: Opus with execution”

With q=5-8, a full baseline audit needs q documented-question readers + q no-document readers + two task readers: 2q+2 = 12-18 agents, before any separately staffed truth pass. Three never-audited documents therefore cost 36-54, not roughly 30. At the measured six-question size that is 14 each / 42 total. The cited M21 is a rewrite wave’s bill, not a full baseline audit. A prior audit can make a re-measure cheaper, but that is a different condition and no-document reuse must be stated.

F5.2. **The claimed implementation payoff ranking has no measured cost-benefit comparison**

- Design: `$TMPDIR/tmp.iUPMIn91WR/fable-a1-terse-design.md:487` — “| 1 | G2 verifier: brief 0, `asks` field, step 4b | Q3 | `critic-briefs.md`, `rewrite/SKILL.md` step 4, `round.mjs` header | ~40 lines of text; +1 agent/round | 11 of 25 for no script work; the largest count at the least cost |”
- Evidence: `$TMPDIR/tmp.aasWWgOKbX/m1-two-surveys-compared.md:555` — “**What it is.** README.md:5 — "Only phase 3 — matched tasks, independent outcome assessment, a”
- Additional: `$TMPDIR/tmp.iUPMIn91WR/fable-a1-terse-design.md:234` — “`unmeasured`; nearest measured, lens 1 Opus ~180k tokens, 17 min (`measurements.md` M21). Lens 2 already”
- Additional: `$TMPDIR/tmp.aasWWgOKbX/m1-two-surveys-compared.md:558` — “independently verified outcomes judged cross-family or by a human (S2-37); agents and paid turns under”
- Additional: `~/Git/agent-skills/plugins/terse/skills/rewrite/SKILL.md:125` — “| 1. the code, with the right to run it | every behavioural claim; level 3 for anything about a lifecycle | Claude Opus | one | ~180k tokens, 17 min |”
- Additional: `$TMPDIR/tmp.iUPMIn91WR/fable-a1-terse-design.md:176` — “you send it; (6) what reads as written for the author. Model: Codex Sol, one agent, ~5 min (the record:”
- Additional: `~/Git/agent-skills/research/2026-09-11-markup-round-0/rounds.md:17` — “| [08-review.md](08-review.md) | 1711 | the coordinator, 27 edits against the wave's list and the owner's five decisions, each with a check; `budgets.json`, `tasks.json`, `questions.json` written; then 3 critics — Opus with a stub codex, Astra, a Sol reader who had never seen the plugin — see [reviews/08/](reviews/08/) | Opus 14, Astra 9 (7 shared), the reader: "not yet" | **10** of its own: 4 false, 5 overstated, 1 vaguer; 4 of the writer's 27 stated checks did not hold |”

The first item is ranked as the largest catch count at the least cost, but its 11 catches are desk counterfactuals and its Sol cost is expressly unmeasured. The two seeded-ledger catches have a replay, G1 has zero catches alone, and G5 duplicates a claimed G2 catch; those facts support different confidence levels, not a measured economic optimum. The full wave is retained and the design adds recurring work. No measured reduction in later rounds, owner time, severity-weighted harm, or paid turns offsets that bill. The proxy’s roughly five minutes is cited to rounds.md:17, which names the three critics but records no duration; the task-reader timing is a different role. G5 last has a defensible marginal-count rationale; the claim that the full ordering pays back most does not follow. The cost accounting below supplies the missing totals, without proposing a replacement design.

### Front 6

F6.1. **Assess before changing:** The owner still lacks a calibrated rule for when a previous audit, unresolved items, untested sections and changed dependencies make leaving the whole document alone acceptable (F3.4-6, F4.2). design $TMPDIR/tmp.iUPMIn91WR/fable-a1-terse-design.md:67 — “**Rule T2. `no change` is issued only when a prior measurement exists and still holds; on a never-audited”; evidence $TMPDIR/codex-sol-h1-terse-survey-harvest.md:72 — “- No entry establishes when “no change” is safe for an entire text, how many areas must be sampled, how recent evidence must be, or how to combine clean structural checks with unmeasured semantic risk.”

F6.2. **How to present:** The owner still lacks a verified selective-acceptance result with correct cross-round provenance, semantic dependencies and a score for the actual accepted mixture; the format’s human acceptance/error-detection performance is unknown. design $TMPDIR/tmp.iUPMIn91WR/fable-a1-terse-design.md:156 — “**Rule HO2. Every hunk is separately acceptable; `apply.mjs original.md edits/NN.json --accept ids`”; evidence $TMPDIR/codex-sol-h1-terse-survey-harvest.md:83 — “- No entry studies selective acceptance of individual changes, dependencies among changes, or how to show that accepting one hunk requires another.”

F6.3. **Iterations that heal:** The owner still lacks an independently measured improvement between rounds and a demonstrated reduction in total work to acceptance; a retrospective catch partition and a miscounting ledger do not settle healing. design $TMPDIR/tmp.iUPMIn91WR/fable-a1-terse-design.md:350 — “**The design's claim: 13 of 25 refused before the freeze; 11 more refused until a run exists; 1 reached”; evidence ~/Git/agent-skills/research/2026-09-11-markup-round-0/rounds.md:219 — “An independent judge on the whole diff — *did round N read better than round N−1* — is not built. The”

F6.4. **Collecting practice:** The owner still lacks a valid adoption/demotion decision for an individual practice: the proposed two-document rule uses bundled outcomes, while the cited method’s causal comparison remained unrun. design $TMPDIR/tmp.iUPMIn91WR/fable-a1-terse-design.md:435 — “**Rule S5. Every adopted practice is registered as a hypothesis with the audit question or the regression”; evidence $TMPDIR/tmp.aasWWgOKbX/m1-two-surveys-compared.md:469 — “16. **Phase 3: do not claim improvement; register the protocols and stop.** Out: 15 + 3 hypotheses and,”

## Front 5 cost accounting

Let q be questions (current audit default 5–8), r the number of full rewrite rounds, h the number of handovers, and t be 1 when triage re-scores a prior audit and 0 otherwise. Counts are agent invocations, excluding the coordinator. These are arithmetic from the required roles, not measured new costs.

| Work | Current skills | Design |
|---|---|---|
| Full rewrite wave | q+6 = 11–14: 2 Opus, 1 Astra, 2 Sol, q Luna, 1 Fable | q+9 = 14–17 under the per-round schedule at design 368–369: adds 1 Sol verifier, 1 Luna proposition reader, 1 Sol proxy |
| Proxy only at handover, as design 173 says | none required | alternative total for rounds: r(q+8)+h; at 368–369 it is r(q+9). This frequency conflict must be priced explicitly |
| First candidate on an existing document | 1 initial adversarial read + 3 writers + 2 judges = 6; third judge optional | retained, 6 (no savings specified) |
| Baseline full audit | 2q+2 = 12–18, excluding separately staffed truth pass | same, before seed creation; no extra seed agent specified |
| Triage on a prior audit | no separate stage | q = 5–8 readers; no prior audit means 0, but cannot issue no change |
| Full re-audit after apply | if run, q+2 = 7–10; not separately required by the rewrite cost table | explicitly specified at 444–447, q+2 = 7–10; design’s 8–10 assumes at least 6 questions |
| Survey stage | default 6 surveyors; whether “one synthesis” is coordinator or one agent is unspecified, so 6 or 7 | 4–6 surveyors + split critic + mapper + completeness critic = 7–9 |
| Structure stage if needed | recorded 14 agents (10 proposals, 3 critics, 1 synthesis); current rethink says about ten proposals | retained; not displaced by Part 4, which replaces only survey step 1 |

For an audited existing document with a full r-round rewrite and a separate final re-audit, charge current baseline (2q+2)+6+r(q+6), plus q+2 if that final audit is also commissioned. Charge the design (2q+2)+6+r(q+8)+h+(q+2)+tq; add the optional survey/structure costs separately to both. If the per-round proxy schedule is intended, set h=r. The added round/handover burden is 2r+h (3r with h=r), not merely the gate table’s +2 per round. Any credit for reusing the wave’s question results as a re-audit is unknown; the current critic readers read one file whereas audit readers can navigate linked .md files.

Example q=6, r=3, no triage re-score or survey: current audit+initial candidate+waves = 14+6+36 = 56 agents; design with proxy every round and a separate final re-audit = 14+6+45+8 = 73. If the current process also commissions the final re-audit, its total is 64 and the like-for-like increment is 9. If the proxy runs only once, the design total is 71 (increment 7 against 64). These are conditional totals, not a claim that three rounds suffice.

The current full wave’s three Claude seats have reported approximately 410k tokens in total (180k code, 70k rules/water, 160k dedup); Codex token spend is not provided by that cost table. It reports about 17/7/15 minutes for those seats, around five minutes per task/adversarial seat and one per question. The design retains them, adds an unmeasured Sol verifier (17 minutes for a different Opus lens is only a nearest observation), about one minute of Luna work per round and a budgeted five minutes of Sol proxy work per handover; the cited round row supplies no measured proxy duration. Currency totals and end-to-end elapsed time are unknown. Sequential pre-freeze verification lengthens the critical path; unmeasured retry rounds add further unknown cost.

Implementation order verdict: it is a plausible hypothesis about where to start, not the demonstrated highest-payback order. Its first-place claim uses 11 hypothetical catches and unknown recurring cost. The seed has two retrospective replay catches without a new per-round agent; G1 is a dependency with zero independent catches; G3 precision and behavioral case coverage remain unknown; G5’s one claimed catch overlaps G2, explaining its last-place marginal-count rationale. No evidence compares paid turns or owner effort to an adopted document across these orders. The record’s round-09 reduction was not critic-read, so it cannot be promoted into a proven cheaper alternative either.

## Rule-by-rule audit coverage and exclusions

All 21 named rules were examined: T1–T4, HO1–HO4, G1–G8, S1–S5. Front 1 retains only the specified non-observability/circularity defects in T1, HO3, G5, G6 and S2. T2/T3/T4, HO1/HO2/HO4, G1/G2/G3/G4/G7/G8 and S1/S3/S4/S5 have outcomes that could in principle occur and be observed, although several would test the wrong inference or require a comparison the design has not scheduled. Those defects are put in the relevant evidence/requirement front or left open, not relabelled impossible.

Front 2 does not call the explicitly one-incident proxy result a disguised general law. Nor does it count every proposed threshold as an anecdotal inference: T3 states precision unmeasured, T4 and HO4 identify their trial proposal as unmeasured, S3 names its document transfer unmeasured, and G3 admits zero certain catches alone. The problematic unqualified efficacy count is attacked under Part 6 (Front 4), not counted twice as a second generalisation finding.

D1 has its own defects: R08-8 is c at 419 and e in its aggregate; the design explicitly discloses its choice, so that discrepancy is not a design finding. D1’s 21 at 479 does not equal e12+c7=19, while its table closes at 25; the design does not repeat 21, so that inherited arithmetic error is not charged to it. R02-1’s identity is uncertain at D1:602-608. These limit certainty about an exact 25-item retrospective but do not change the requested denominator for the blind check.

## Checks, limitations and open/taste

- Completed: the 27-edit blind read, full evidence/design reading, quoted-source validation, JavaScript trigger recount, unchanged .cjs gate-load rerun, incremental-base and dependency string checks, and the concrete ledger recurrence counterexample. The failed original .mjs command and exact diagnostic are recorded in checks.log:5-16; the ledger’s exit 1 is the expected observed refusal, not an inability to run it.
- No repository tests are reported as passing. The cited historical selftest 24/24 belongs to D1; it was not rerun here. No installed Codex/Claude CLI behavior, lifecycle deletion, sandbox behavior, network source, owner decision or Sol verifier performance was measured in this turn.
- Historical-source caution: 846197c driver line 2360 already contains process.stderr.write, so the design’s G1 illustrative expect-stderr failure cannot be reproduced on that reachable snapshot. The exact pre-review runtime snapshot is unknown; this is not counted as proof that the historical critic was wrong.
- Unknown: exact runtime checkout of Round 08; the present owner decision on 09; triage precision, cost savings and representative false-accept rate; model/human validity; Sol verifier tokens/time; end-to-end savings from fewer rounds; effect of a single survey practice.
- Unknown: validity of the six additional blind refusals outside D1’s chosen ten. The initial refusal list is deliberately retained even where the later record would disagree; no autopsy-informed correction is counted as a blind catch.
- The stated first-six-word greps validate displayed excerpts at their lines; they do not certify all external-source originals cited by H1/M1. No web search or external fetch was used.
- Taste only: whether triage deserves a fourth slash command, effect-first versus diff-first visual arrangement when facts are equivalent, fixed headings, field names, and the precise model preferences. No finding is based on those preferences.

Verdict on the central number: **13 of 25 caught before the freeze does not survive as an established result.** It is 11 retrospectively desk-refutable cases plus two replayable phrase pins, with one of the latter’s regression identity uncertain. The requested n=1 blind run returned six matching refusals of ten (five explicit counterexamples), missed two of the seven claimed desk cases (three under strict counterexample scoring), and cannot establish a future 13/25 catch rate. The honest status of that number is a hypothesis to be tested, not a measured intercept count.
