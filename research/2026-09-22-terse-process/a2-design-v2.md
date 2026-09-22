# Triage, handover, the healing loop, the survey: design v2 for `terse`

Fable A2, 2026-09-22. Read-only; the repository at `9bd160d` was not touched (`git diff --stat 8c041b7
HEAD -- plugins/terse` is empty: the plugin pages are the ones P1 mapped). Inputs read whole:
`a1-design-v1.md` (550 lines), `c1-design-critique.md` (387), `c1-blind-round08.md` (20), `c1-checks.log`
(43), `k2-completeness.md` (158), `s4-claims.md` (63, Terra S4, under `$TMPDIR`), `h1-survey-harvest.md`
(86), `rounds.md`, `README.md`; D1 `:1-120`, `:120-460`, `:460-613`; M1 `:155-280`, `:400-586`; P1
`:1-122` and the mapping rows of every claim named below; the plugin: `audit`, `rethink`, `rewrite`
SKILL.md, `truth-pass.md`, `measure.md`, `ledgers.md`, `loop.md`, `measurements.md`, `critic-briefs.md`,
`writing-rules.md`, `stages.md` (`:60-110`, `:140-160`, `:262-292`), `bake-off.md:138-148`,
`curse-of-knowledge.md:1-8`, `round.mjs`, `ledger.mjs`; `r-synthesis.md:9`, `:697-699`.

Conventions, unchanged from v1 (`a1-design-v1.md:11-13`): a rule is one bold sentence, then *Refuted by*,
*Evidence* (file:line, `unmeasured`, or `one incident`), *Displaces*. Evidence levels 1/2/3 as the
repository uses them. Three measurements are my own, made today under `$TMPDIR` and reproducible with
Appendix A: (i) the trigger recount, 18 of 25; (ii) the transition count on C1's four toy cases and on
the record's ledger; (iii) the regexes on the four edits the blind run missed. Every "caught" below is
labelled `replayed`, `blind` or `desk` (Part 3); nothing here has run on a live round.

---

## Part 0 — Disposition of C1's 34 findings and K2's four

`fixed` names the v2 rule or line; `open` is carried into Part 6. No finding is rejected: each was
re-checked against its cited line and held.

| id | C1 line | finding, in short | disposition |
|---|---|---|---|
| F1.1 | `c1:53` | T1's refutation needs an unasked question's answer | fixed — T1's *Refuted by* is a `no change` verdict followed by an audit failure, no clarity counterfactual; the ban is the record's (`measure.md:62`), labelled `one incident` |
| F1.2 | `c1:60` | HO3's four-word taxonomy cannot fail; a verbatim repeat tests nothing | fixed — HO3 records propositions, no taxonomy; *Refuted by* a refused proposition returning in any words within two rounds |
| F1.3 | `c1:68` | G5's "fewer than the regex" passes a reader that finds zero | fixed — G5's self-test is absolute: fewer than two of three plants quoted, or a `yes` on the plant, discards the reader |
| F1.4 | `c1:76` | G6 refuted by expressibility, not miscounting | fixed — G6 is the transition count; *Refuted by* a critic-confirmed regression the replay charges to another round |
| F1.5 | `c1:84` | S2's refutation restates membership | fixed — S2 *Refuted by* a completeness critic overturning a verdict on a row whose quote is present but split from its condition (K2's S2-15, `k2:30-34`) |
| F2.1 | `c1:94` | T1 generalises one run; a#9 is about ratings | fixed — T1 labelled `one incident` + a#9 as evidence against a rating, not against a question; triage inherits `measure.md:62` and does not extend it |
| F2.2 | `c1:103` | S1 makes an n=1 role split mandatory | fixed — S1 labelled `one incident` per role; the split critic is skipped for ≤ 3 named sources, as wave 4 did (`README.md:66-67`) |
| F3.1 | `c1:114` | 19/25 is 18/25 under the mask | fixed — 18/25, misses now include R07-3 (Appendix A(i), re-run today) |
| F3.2 | `c1:124` | appendix `.mjs` uses `require` | fixed — Appendix A ships `regress.mjs` with `import`, run today |
| F3.3 | `c1:133` | `broken` pre-fills refuted at level 3 | fixed — pre-filled `refuted`, level 1; a path outside the checkout is `unresolved in checkout`, not refuted |
| F3.4 | `c1:142` | S3 dates from the doc's last commit | fixed — S3's fingerprint is the audit's commit (`ledgers.md:12`), H1 a#4 as written |
| F3.5 | `c1:149` | no verdict for a failed re-score | fixed — `regressed` verdict |
| F3.6 | `c1:158` | T4's 2×2 counts abstention as acceptance and mixes units | fixed — T4's table is per document, four cells, `unmeasured` reported apart as abstention |
| F3.7 | `c1:167` | G3 drops the no-code fallback | fixed — G3 accepts `source:` when the run declares no code (`truth-pass.md:75-77`) |
| F3.8 | `c1:176` | G6's formula misses the returned sentence, counts the persistent one | fixed — G6 transition count; shown on the four toy cases (Appendix A(ii)) |
| F3.9 | `c1:186` | R06-4 "untouched" contradicts G2(i) and the regex on its edit | fixed — R06-4 is `desk` (duty i) and forced (LIFE hit on `edits/06.json[8]`, `c1-checks.log:29`) |
| F3.10 | `c1:196` | HO2 applies incremental edits to the original | fixed — HO2's geometry: hunks are regions of the original→candidate diff; edits are provenance, not units |
| F3.11 | `c1:205` | `old`-in-`new` misses semantic coupling; no re-verification of a mixture | fixed for the mixture (HO2: re-verification defined); coupling detection stays open (Part 6) |
| F3.12 | `c1:214` | HO3 weakens refusal memory to exact words | fixed — HO3 records the proposition; lens 7 receives the refused list |
| F3.13 | `c1:222` | the return list loses the prerequisite inventory and the map | fixed — HO1 orders the reading; `rewrite/SKILL.md:154-163` stays as the artifact list; section 6 names the inventory and the map |
| F3.14 | `c1:232` | S5 demotes a practice on a bundled number | fixed — S5 replaced: no demotion without an arm per practice (`measure.md:130-132`) |
| F3.15 | `c1:242` | S4 relabels CC/VE/RA/ME | fixed — S4 uses `r-synthesis.md:9`'s definitions |
| F3.16 | `c1:250` | S5 cites M1 lines that do not exist | fixed — `r-synthesis.md:734-736` via `m1:226-228`; `m1:440-442` is step 8 |
| F3.17 | `c1:258` | pipeline puts G6 before the critics and G2 before G1 | fixed — Part 5, one order a script could run; the freeze is named |
| F3.18 | `c1:269` | HO4 attributes `unclear`/`content` causally | fixed — HO4 counts refusals and re-proposals; no attribution (`stages.md:148-157`) |
| F4.1 | `c1:280` | 13/25 is a hypothesis; blind 6/10, strict 5/10 | fixed — Part 3's table is labelled `replayed`/`blind`/`desk`; the claim is restated in those terms with its test |
| F4.2 | `c1:292` | a prior failed audit still satisfies `no change` | fixed — `unrepaired` verdict; `no change` requires every prior `refuted` and *What broke* item closed |
| F4.3 | `c1:302` | proxy on 08 vs owner on 09 measures nothing | fixed — HO4: proxy and owner read the same handover; the prediction claim is withdrawn (Part 6) |
| F5.1 | `c1:314` | T4's cost is 2q+2 per baseline, not ~10 | fixed — costs recomputed with C1's formula (`c1:347-362`) |
| F5.2 | `c1:323` | the payoff ranking has no cost-benefit measurement | fixed — implementation order is by evidence class, no payoff claim |
| F6.1 | `c1:337` | no calibrated "leave it alone" rule | open — Part 6 |
| F6.2 | `c1:339` | no verified selective-acceptance result | open — Part 6 |
| F6.3 | `c1:341` | no measured between-round improvement | open — Part 6 |
| F6.4 | `c1:343` | no valid per-practice adoption/demotion | open — Part 6 |
| K2-a | `k2:79` | C73's safeguard half is at `W:21-23`, not `W:15` | fixed — Part 5 cites both lines |
| K2-b | `k2:80-82` | C02's candidate points at `R:49`, its B verdict was rendered at `A:90` | fixed — Part 5 names both; the line it would change is `R:49-50` |
| K2-c | `k2:101-106` | the document's natural language, unnamed by sources and mapper | fixed — HO5, a hypothesis on entrust's `one incident` |
| K2-d | `k2:107-110` | text that survives a hard clip, unnamed | fixed — HO6, a hypothesis; the clip is a fact (`orchestrate/SKILL.md:143,147`) |

Counts: fixed 34, rejected 0, open 4 (of 38).

---

## Part 1 — Triage: the step before `audit`

A fourth skill, `/terse:triage`: one `SKILL.md`, one script `triage.mjs`, no reference file; the plugin
grows by it. Zero agents by default; at most one cheap reader per question when a prior audit exists.
It emits verdicts and lines, never a number of its own (H1 a#7, `h1:20`: a screening device for an old
document, never a measuring one).

**Inputs.** The documentation files and the entry file (`audit/SKILL.md:25-28`); the repository; optionally
a prior `audit` run directory: `audit.md` with its header commit (`ledgers.md:12`), claim ledger, questions,
key, score, no-document score, *What broke*.

### The signals, in the order the script reads them

| # | Signal | Reads | Costs | Evidence |
|---|---|---|---|---|
| S1 | resolution | every path, command and link in inline code or a link target: does it resolve in the checkout. Exempt: a path the sentence tells the reader to create; a block that discloses its own pin. A path that names an installed host outside the checkout is reported `unresolved in checkout`, not a hit | 0 agents | H1 a#23 (`h1:36`, asserted), a#26 (`h1:39`, argued), a#24 (`h1:37`, 211-finding noise, measured), a#25 (`h1:38`, argued); level 1 is what a resolving path proves (`truth-pass.md:14`) |
| S2 | trigger words | every sentence with a guarantee word (`every, always, never, cannot, guarantees, ensures, nothing, only, by default`, `read-only` masked) or a lifecycle word (Appendix A's LIFE list) | 0 agents | `truth-pass.md:23`, `loop.md:121`, `round.mjs:36`; Appendix A(i): 18 of the record's 25 regression sentences hit |
| S3 | staleness | with a prior audit: `git diff --stat <audit commit>..HEAD -- <every source path the ledger cites>`; any output fires, per file. Without a prior audit S3 does not run — there is no fingerprint | 0 agents | H1 a#4 (`h1:17`, argued — the fingerprint is the commit the evidence was checked against); `ledgers.md:12` carries that commit; `unmeasured` here |
| S4 | prior measurement | whether `audit.md` exists with a key, a score, the no-document score and *What broke* | 0 agents | `ledgers.md:9-37` |
| S5 | re-score | only with S4: same questions, key, entry file, model; one fresh reader per question; the no-document score reused | q Luna, ~1 min each | `measure.md:106-115`, `:80-81`; S4-5 (`s4:11`, compare to an earlier version) is this comparison; S4-10 (`s4:16`) — the key makes it gradable |

### The verdicts

| Verdict | Issued when | Hands to |
|---|---|---|
| `no change` | S1 clean; S3 empty for every source the ledger cites; S4 exists; every prior `refuted` ledger entry and every *What broke* item is closed (its line changed since the audit and a later confirmed re-score covers it); S5 at or above the prior score, every control held, no reader departed, and the fall — if any — inside a measured noise floor | nobody; the owner sends |
| `broken` | S1 fired | `audit`, hits pre-filled `refuted`, level 1 |
| `stale` | S3 fired | `audit`, truth pass scoped to the sentences whose sources moved |
| `unbacked` | S2 fired on a sentence no prior ledger confirms at level 3 | `audit`, truth pass scoped to those sentences first |
| `unrepaired` | S4 exists and a prior `refuted` or *What broke* item is not closed | `rewrite`, from the prior `audit.md` |
| `regressed` | S4 exists and S5 fails one of `measure.md:111-115`'s three ways | `audit` step 6: cause per wrong answer, from the readers' quotes; the truth pass scoped to the quoted lines |
| `unmeasured` | S1–S2 clean and no S4 | the owner, with the audit's cost (2q+2 readers, `c1:321`); triage cannot say `no change` |

Verdicts stack except `no change`, which is single and needs every condition. Without a noise floor
(`measure.md:98-104`) any fall is `regressed` (`measure.md:113`).

**Rule T1. Triage's only scored agent signal is a keyed answer; it asks no reader whether the text is
clear.** *Refuted by:* a document triaged `no change` on which a full audit run the same day finds a
failure of any cause. *Evidence:* the record's rule (`measure.md:62-65`, `audit/SKILL.md:98-101`) —
`one incident`, three readers; H1 a#9 (`h1:22`, measured) is against a readability rating as a metric,
not against a diagnostic question, and is cited for that alone. *Displaces:* nothing; inherits.

**Rule T2. `no change` needs a prior measurement that still holds with nothing left open; a never-audited
document is `unmeasured`, a document with an open failure is `unrepaired`.** *Refuted by:* a `no change`
document on which an audit the same day finds `refuted`, `missing` or `harmful`, or a task reader fails.
*Evidence:* M12 (`measurements.md:63-66`) — a question set alone cannot certify a document; F4.2
(`c1:300`) — source stability does not repair a known failure; H1 gap `h1:72`. `unmeasured` as a rate.
*Displaces:* nothing.

**Rule T3. A sentence with a trigger word and no level-3 evidence is `unbacked`, whatever its truth.**
*Refuted by:* a corpus where S2-flagged sentences are refuted by the truth pass at no higher a rate than
unflagged ones. *Evidence:* 18/25 (Appendix A(i)) — a hit rate on known defects, not a precision;
`truth-pass.md:27-36`. Precision `unmeasured`: ~27 of ~48 units on `08-review.md` hit (`c1-checks.log:24`).
*Displaces:* nothing.

### What triage cannot decide

`missing`, `placement`, `findability`, `harmful` (`audit/SKILL.md:121-127`) are reader outcomes. Seven of
the 25 carry no trigger word (R04-1, R06-4, R07-2, R07-3, R08-1, R08-5, R08-10); triage says so in its
footer, "prose was not checked" (H1 a#23). H1 a#20 (`h1:33`, paraphrase testing) needs the key and stays
with `audit`.

### How triage is measured

**Rule T4. On the first three audited documents, a full audit runs after triage regardless of verdict;
the unit is the document; the table has four cells — `no change` × failure (false accept), `no change` ×
none (true accept), flagged × failure (true alarm), flagged × none (false alarm) — and `unmeasured` is
reported beside it as the abstention count, never inside it.** A second table, by line, lists flagged
lines against the lines readers quoted in a failure, as a report. *Refuted by:* one false accept in
three — then `no change` leaves the verdict set until its condition is found. *Evidence:* `unmeasured`;
H1 gap `h1:71` (no validation of a cheap triage against the full reader test). Cost, by C1's arithmetic
(`c1:321`, `:347-362`): each document needs a baseline audit first (2q+2 = 14 at q=6), then triage's
re-score (q = 6), then the full re-audit (q+2 = 8): 28 per document, 84 for three, before any truth-pass
agent. The corpus at hand has no audited document with a surviving run directory, so the baseline is
paid three times. *Displaces:* nothing.

### The S4 rows on (a) and (c), used or set aside

| row | says | disposition |
|---|---|---|
| S4-3 (`s4:9`) | quantitative metrics or defined scales, consistently | used: triage emits no scale of its own; the only number is `audit`'s ruler, reused unchanged (`measure.md:108-109`) |
| S4-5 (`s4:11`) | compare against a baseline or earlier version | used: S5 compares to the prior score; the no-document score is the baseline it reuses |
| S4-10 (`s4:16`) | structure for automated grading | used: keyed answers graded against the key |
| S4-11 (`s4:17`) | more lower-signal automated questions beat fewer hand-graded | set aside: q is fixed by the profile at 5–8 (`measure.md:12-13`) and a new question set is a new baseline (`measure.md:108-109`); registered as a phase-3 hypothesis, not adopted |
| S4-27, S4-28 (`s4:33-34`) | choose the grader by speed and reliability; code grading for simple checks | used: S1–S3 are the code layer, S5 the model layer — the two-layer split H1 a#23/a#26 already gives |
| S4-29 (`s4:35`) | avoid human grading | set aside: the owner's read is the loop's stop (`loop.md:83-84`); the design does not trade it |
| S4-30 (`s4:36`) | test LLM-grader reliability before scaling | used: the noise floor (`measure.md:98-104`) is that test; without it any fall is `regressed` |
| S4-32 (`s4:38`) | purely qualitative grading does not scale | used: T1 |
| (c) S4-5, S4-7, S4-9 (`s4:11,13,15`) | baseline; held-out set with a margin over baseline; mirror the task distribution | set aside for triage: none names a no-document arm (`s4:57`); the arm is the record's (`measure.md:72-81`) and triage reuses it. S4-7 and S4-9 are taken into phase 3 (Part 4) |

---

## Part 2 — Handover: what the owner sees to decide

The loop's stop is the owner's read (`rewrite/SKILL.md:146-150`, `loop.md:83-88`); the record has one
proxy "not yet" (`sol-naive-reader-would-you-ship.md:1-15`; `markup-round-0/README.md:35-38`) and no
owner read since the draft (M10, `measurements.md:52-55`).

### The file, in reading order

`$RUN/handover-NN.md`, fixed headings, beside `candidate-NN.md` (the whole text) and `diff-NN.patch`
(against `00-original.md`, as `rewrite/SKILL.md:148-149` already says).

1. **The effect, one line, a tuple**: `readers right a/n → b/n (no-document c/n); controls k/k; tasks
   t/2, sections no task reached: …; regressions this round: r (transition count); level-3 claims p of
   q; words W → W'`. *Evidence:* H1 b#7 (`h1:51`, measured), b#12 (`h1:56`, argued); `loop.md:90-96`.
2. **The proxy reader's line** (lens 7): "would send: yes | not yet — reason, reason".
3. **What changed for a reader, by where they notice it**: one sentence per hunk group, by section, with
   the quote that misled (H1 b#8, `h1:52`, measured; b#20, `h1:64`).
4. **What is unchanged and checked**: confirmed claims by count and level; the controls; the
   must-not-damage passages with the check that says each still stands (H1 b#1, `h1:45`, `one source`).
5. **The hunk groups**: id, section, `old → new` from the patch, `why`, `evidence` (level, `run`, `saw`
   excerpt), `provenance` (the edits, by round and index, the script traced into it), `with` (the hunks
   in the same acceptance group and why).
6. **Not tested, and the inventories**: sections no task reached; level-1-only claims; the noise floor;
   the date of the no-document score; the invisible-prerequisite inventory (`curse-of-knowledge.md:3-4`,
   `ledgers.md:103-110`); the cut ledger (`ledgers.md:92-101`); the structure map when one exists.

The artifact list at `rewrite/SKILL.md:154-163` is unchanged; this file is the reading order over it.

**Rule HO1. The owner sees the effect tuple and the proxy's line before any hunk, and the whole candidate
is a file beside the diff.** *Refuted by:* three handovers in which the owner's refusals cite text they
could not locate in the candidate, or the effect line is contradicted by their own read. *Evidence:* the
proxy read the whole round and returned content gaps, not diff objections (`sol-naive-reader:13-15`);
order `unmeasured` (H1 gaps `h1:80`, `:82`). *Displaces:* `rewrite/SKILL.md:148-149`'s "hand over the
round and the patch" becomes "hand over `handover-NN.md`, the candidate and the patch".

### Partial acceptance — the geometry

The edit files are incremental: `round.mjs:20-27` applies each `old` to the previous round, and all 27
`old` strings of `edits/08.json` occur 0 times in `00-draft.md` (`c1-checks.log:26-27`). The handover diff
is against the original. So:

- A **hunk** is a maximal contiguous region of `00-original.md` that differs from `candidate-NN.md`, from
  a zero-context diff of the two files. It is never an edit.
- **Provenance** of a hunk is the set of edits `(round, index)` whose replacement spans, replayed from
  `edits/01..NN.json` through the chain and mapped forward into candidate coordinates, intersect the hunk.
  Computed by the script, never declared.
- An **acceptance group** is the union of hunks that share an edit in their provenance, plus hunks whose
  provenance edits share a ledger entry (one edit's `claims` name is another's `retire` or `drop`).
  Groups are disjoint regions of the original, so any subset of groups composes.
- `apply.mjs 00-original.md candidate-NN.md --accept g1,g3` writes `accepted-NN.md` under `$RUN`: the
  original, with each accepted group's region replaced by its candidate text. It refuses a set that
  splits a group, and never writes into the tree.

**Rule HO2. Every acceptance group is separately acceptable; an accepted mixture is a round — it goes
through the ledger over `00..NN, accepted-NN`, the verifier re-reads every sentence in an accepted group
whose neighbouring group in the same section was refused, and the re-score runs on the mixture, not on
the candidate.** *Refuted by:* an accepted mixture that passes those three and that a critic then shows
carries a sentence made false by the refusal beside it. *Evidence:* `bake-off.md:143-145` and M9
(`measurements.md:48-50`) — a sentence true in one surrounding text is false in another; D1 `:447-448`
(edits `[16]` and `[24]` coupled with no textual trace, `c1-checks.log:28`) is why the group rule is
not enough and re-verification is required; H1 gap `h1:83` — `unmeasured`. Cost per mixture: 1
verifier, q Luna, 2 Sol. *Displaces:* nothing; `grows` by one script.

**Across rounds.** A refusal does not fork the chain. `refused.json` records the group, its candidate
text, its proposition in one sentence, and the owner's words; `edits/NN+1.json` opens with script-written
reverts (`old` = the refused candidate text, `new` = the original text, `drop` for the claims the reverted
edits introduced), so round NN+1 is one file produced by edits from NN and the ledger still applies. The
next handover's diff, against the original, no longer contains the refused region.

**Rule HO3. A refused group is recorded with its proposition and the owner's words; the next writer
receives the list; lens 7 receives it too and quotes any sentence that re-proposes a refused proposition,
in any words.** *Refuted by:* a refused proposition re-proposed within two rounds and reaching the owner
unquoted. *Evidence:* the map's refused list (`loop.md:108-109`), generalised to groups; D1 fact 3
(`:576-583`) — a phrase pin is walked through by paraphrase, so the refusal is a proposition and a reader
checks it; H1 gap `h1:85`. *Displaces:* the map's refused list, for groups.

### Lens 7, the proxy reader

The brief that produced the record's "not yet", fixed: (1) what would stop you sending it, quoted; (2) what
you doubted, quoted; (3) what you would cut, with word counts; (4) what you could not find and where you
looked; (5) would you send it; (6) what reads as written for the author; (7) every sentence that says what
a refused proposition said. Codex Sol, one agent, on the frozen round, only on a handover round. Cost
`unmeasured` (rounds.md:17 names the reader and no duration; `c1:333`). *Evidence:*
`sol-naive-reader-would-you-ship.md:1-15`, `one incident`; its two findings were not lifecycle sentences
and no other lens had them (`markup-round-0/README.md:35-38`).

### How the handover is measured

**Rule HO4. The measurement is the owner's decision per group with their words, and the numbers kept are
refused groups per handover and refused propositions re-proposed; no refusal is attributed to format or to
content.** *Refuted by:* three handovers of one document in which the transition count falls and the
owner's refusals do not — then the handover, not the text, is what the rounds fail on, and the format is
the first hypothesis to change. *Evidence:* `stages.md:148-157` — the owner's own content refusal was,
by the owner's later word, a format refusal; `unmeasured`; H1 gap `h1:81`. The proxy's line is compared
to the owner's on the same handover, per item; the record cannot compare them today (`c1:310`).
*Displaces:* nothing.

**Rule HO5. Sections 1–4 of the handover are written in the language the owner asked in.** *Refuted by:*
an owner refusal or a question about wording that the owner's language would have removed, twice.
*Evidence:* `one incident`, entrust's (`codex/SKILL.md:303-304`, measured 2026-09-17); K2 gap
(`k2:101-106`): no source and no target rule names it for documents. *Displaces:* nothing; `grows`.

**Rule HO6. The first line of every file and every agent return in this design carries its verdict —
the effect tuple, the verifier's count, the proxy's yes/not yet — so a clip at any line keeps the
decision.** *Refuted by:* a clipped return in a live round whose verdict the coordinator had to
reconstruct. *Evidence:* the clip is a fact (`orchestrate/SKILL.md:143`, `:147`); benefit `unmeasured`;
K2 gap (`k2:107-110`). *Displaces:* nothing.

---

## Part 3 — The healing loop

D1's headline (`d1:470-478`): of 25, the declared check reaches 4 (a), the ledger 2 (b), a desk rule 7
(c), a cap 0 (d), new evidence 12 (e). Rounds 04–07 declared zero checks (`d1:34-40`); `round.mjs:23-24`
reads `level` and never `how` (`d1:563-567`); retirements are written by the repairing round
(`d1:569-574`); phrase pins are paraphrased through (`d1:576-583`). Round 08's three level-3 checks that
regressed anyway (R08-3, R08-7, R08-9: `d1:320-325`, `:399-402`, `:434-448`) are the ceiling on any
script gate: a run can answer a narrower question than the sentence.

### G1 — the check runs, in the script

**Rule G1. An edit with claims declares `check.run` (a shell command; for level 1–2 a `sed -n 'A,Bp'`)
and `check.expect` (a regex over its output); `round.mjs` runs it, refuses the round when it fails, and
writes the output as `check.saw`.** *Refuted by:* a citation that does not exist passing G1. *Evidence:*
`d1:563-567`; R08-1 and R08-10 carry their refutation in `how` (the items at `d1:285-296`, `:450-460`). Catches alone: 0; it is
what G2 reads. Note C1's caution (`c1:380`): edit 19's `:2360` example is not reproducible at `b29e921`,
so the illustration is `one incident` from `d1:526`. *Displaces:* `round.mjs:23-24`; the schema line
`rewrite/SKILL.md:92-94`.

### G2 — the verifier of the edits, one agent, before the freeze

**Rule G2. Before the critics launch, one agent that is not the writer reads `edits/NN.json` with `saw`
and the code and returns, per claim, `holds`, `does not answer`, `refuted`, `unreachable`; a round with
`does not answer` or `refuted` is regenerated, not frozen.** Duties: (i) every sentence in `new` that
states behaviour has a claim; (ii) `asks:` is in the sentence's scope words and `run` answers it; (iii)
the cited range is opened with its enclosing block, call sites grepped; (iv) for each guarantee word,
the document and the repository's `.md` files are searched for the sentence that says otherwise, quote or
"none in <files>" written in; (v) a `want:true` entry the ledger reports LOST is re-read: if the
replacement sentence is true, the verifier writes a re-pin (G6). *Refuted by:* on a live round, a critic
finding of D1's class a or c that the verifier passed. *Evidence:* blind, n = 1, Astra
(`c1-blind-round08.md:5-18`; `c1-checks.log:38-41`): 6 of round 08's 10 by refusal, 5 strict; the 4
missed are R08-2 (no claim, "water"), R08-3, R08-7, R08-9 (level-3 runs on the wrong case). Model: Sol,
for decorrelation from the Claude writer (`markup-round-0/README.md:29`) — the blind run was Astra and
says nothing about Sol (`c1:47`). Cost `unmeasured`; nearest, C1's whole turn: 53 commands, 19 min
(`rounds.md:13`). *Displaces:* nothing in scripts; brief 0 in `critic-briefs.md`; step 4b in
`rewrite/SKILL.md`; `grows` by one agent per round.

### G3 — trigger words demand an executed level 3, or a source

**Rule G3. A sentence in `new` that carries a guarantee or lifecycle word is refused by `round.mjs`
unless a claim covers that sentence with `check.level: 3` and a `run` G1 executed — or, when the run
directory declares no code, with `source:` naming what the reader can check.** *Refuted by:* over three
rounds, sentences G3 forced to a run shown false by critics at the same rate as the untouched ones.
*Evidence:* Appendix A(i), 18/25; gate load on the record 3, 2, 6, 7, 9, 2 (`c1-checks.log:18-23`) — and
in round 08 the 7 level-3 hits were not refused, which is where R08-3, R08-7 and R08-9 sit (Appendix
A(iii)): G3 forces nothing that already ran. `truth-pass.md:23-25`, `rewrite/SKILL.md:46-47`; the no-code
form is `truth-pass.md:75-77`, itself `unmeasured` (`:79`). *Displaces:* `round.mjs:36` and `provisional`.

### G4 — the ledger is seeded from the audit

**Rule G4. `ledger.json` starts as the audit's claim ledger: every `confirmed` as `want:true` with its
level, every `refuted` as `want:false`, each with a `sentence` group id.** *Refuted by:* a compression
regression (M3) the critics show and the seeded ledger read green. *Evidence:* replayed — D1 ran
`ledger.mjs` and R02-1, R03-1 go LOST at 02 and 03 (`d1:68-71`, `:87-89`); the ledger did not exist until
round 04 (`markup-round-0/rounds.md:13`). R02-1's identity has a live alternative (`d1:602-608`).
*Displaces:* `rewrite/SKILL.md:90`; `audit/SKILL.md:149` gains a second output; `ledgers.md` its format.

### G5 — propositions beside phrases

**Rule G5. A retired entry carries `proposition:` beside `pattern:`; once per round one cheap reader is
given the frozen round, every retired proposition, and one planted proposition the document never made,
and returns per item: asserted (quote) or not.** Self-test, once per document: three planted paraphrases
of retired propositions; a reader that quotes fewer than two, or says `yes` on the plant, is discarded
for that round and the run says so. The regex count is printed beside, as a report. *Refuted by:* on the
self-test, two readers in a row discarded — the lens does not work on this document. *Evidence:* D1 fact
3 (`:576-583`), M8 (`measurements.md:44-46`); `one incident` each. Cost: one Luna, ~1 min. *Displaces:*
nothing in `ledger.mjs`; `grows` by one field and one agent.

### G6 — the transition count

**Rule G6. A round's regression count is the number of sentence groups that are bad at N and were not bad
at N−1, where a group is bad when any pin in it fails — a `want:false` pattern present, or a `want:true`
pattern absent and not re-pinned by the verifier for that round — computed by `ledger.mjs --judge N` over
`00..N` after the coordinator has written the round's verified findings as `want:false` entries with a
`sentence` id.** A persistent failure blocks the round as today (`ledger.mjs:22`) but is charged to the
round that introduced it; a re-pin is a `patterns: [{from, pattern}]` history on the entry, written by
the verifier with its verdict. *Refuted by:* a critic-confirmed regression of round N that the replay
charges to another round, or to none. *Evidence:* Appendix A(ii), run today. On C1's four toy cases: a
retired false sentence that returns at round 3 → regressions(3) = 1 (existing ledger 1, v1's first-YES
0); a persistent old false sentence at round 2 → 0 (existing ledger 1); two pins on one sentence → 1
(existing 2); a wanted phrase lost by a true paraphrase → 1 without a re-pin, 0 with one. On the record's
own 66-entry ledger, replayed over `00..09` with no groups and no re-pins: 02→2, 03→2, 04→1, 05→1,
06→6, 07→4, 08→11, 09→0 against `rounds.md`'s 1, 2, 1, 0, 6, 5, 10. The four differences are each a
known seam: 02 has a second candidate (`d1:602-608`); 05's extra is `NEG 'grants anything else'`, a
phrase 05 introduced and 08's critics found (`loop.md:53-55` says "its critics"; the replay says "the
introducing round"); 07 is one under because R07-2 shares its sentence with R07-1 and has no pin of its
own; 08 is D1's 11 versus 10 (`d1:609-613`). *Displaces:* `rewrite/SKILL.md:115-118`'s definition, now
computed, with the seam stated: the count charges the introducing round.

### The word cap — not a gate

Unchanged from v1 (`a1:291-302`): 06 and 08 carry 16 of 25 (`d1:537-557`); a cap would have refused
round 06's nine repairs. **Rule G7. Words per section stay a report; the unit gated is the added sentence,
through G2 duty (i).** *Refuted by:* a round where every added sentence carried a verified claim and the
critics still found regressions concentrated in added text. *Evidence:* `d1:553`; M22
(`measurements.md:116-119`). *Displaces:* nothing.

### The claim's own question

**Rule G8. `asks:` is written in the sentence's scope words before `run:`; a `run` whose `saw` does not
bear on every scope word in `asks` is `does not answer`.** *Refuted by:* a round where every `run` was
judged to answer its `asks` and a critic showed a sentence false on a case `asks` named. *Evidence:*
`d1:320-325`, `:399-402`, `:514-517`; the blind run missed all three such cases (`c1-checks.log:39`), so
this duty is `unmeasured` as a catch and is what the pre-registered test measures. *Displaces:* `how`.

### The table, re-derived

Labels: `replayed` — a script ran over the record and produced it; `blind` — C1's n = 1 run on Astra,
list frozen before D1 was read (`c1:9-11`); `desk` — D1's retrospective mechanism assignment, a
hypothesis; `forced` — G3 refuses the edit until a level-3 run exists (regex hit replayed; whether the run
finds the defect `unmeasured`).

| id | D1 mech. | v2 gate | label | basis |
|---|---|---|---|---|
| R02-1 | b | G4 | replayed | `d1:68-71`; identity `d1:602-608` |
| R03-1 | b | G4 | replayed | `d1:87-89` |
| R03-2 | e | G3 (`clears`) | forced | Appendix A(i) |
| R04-1 | c | G2 (i, iii) | desk | `d1:22-28`, D1's c |
| R06-1 | e | G3 (`keeps`) | forced | |
| R06-2 | e | G3 (`stay`, `remove`) | forced | |
| R06-3 | c | G2 (i, iii) | desk | `cleanup.mjs:256`, `d1:157-168` |
| R06-4 | e | G2 (i); G3 on its edit | desk; forced | `c1-checks.log:29` |
| R06-5 | e | G3 (`lasts`) | forced | |
| R06-6 | e | G3 (`continues`) | forced | |
| R07-1 | e | G3 (`kept`, `remove`) | forced | |
| R07-2 | c | G2 (iii) | desk | call-site count, `d1:217-226` |
| R07-3 | c | G2 (i, iii) | desk | no trigger under the mask (`c1-checks.log:3`) |
| R07-4 | e | G3 (`reclaimed`, `left`) | forced | |
| R07-5 | e | G3 (`killed`) | forced | |
| R08-1 | a | G2 (ii) | blind, caught | `c1-blind-round08.md:7` |
| R08-2 | c | G2 (i) | blind, missed | `c1-checks.log:39`; no trigger, level 1 (Appendix A(iii)) |
| R08-3 | e | G2 (ii), G8 | blind, missed | level 3 already; G3 does not fire (Appendix A(iii)) |
| R08-4 | a | G2 (ii) | blind, caught | `c1-blind-round08.md:10` |
| R08-5 | c | G2 (iv), G5 | blind, caught by refusal; strict: missed | `c1-checks.log:40` |
| R08-6 | c | G2 (iv) | blind, caught | `c1-blind-round08.md:13` |
| R08-7 | e | G2 (ii), G8 | blind, missed | level 3 already |
| R08-8 | e | G2 (ii); G3 (`trimmed`) | blind, caught | `c1-blind-round08.md:14` — v1 had it forced only |
| R08-9 | a | G2 (iii) | blind, missed | level 3 already; `only`, `dead` hit but G3 does not refuse a level-3 run |
| R08-10 | a | G2 (ii) | blind, caught | `c1-blind-round08.md:18` |

| class | count | which |
|---|---|---|
| replayed (G4) | 2 | R02-1, R03-1 |
| blind, caught (G2, n = 1, Astra) | 6 by refusal, 5 strict | R08-1, R08-4, R08-5*, R08-6, R08-8, R08-10 |
| blind, missed | 4 | R08-2, R08-3, R08-7, R08-9 — none refused by a script either |
| desk (G2 on rounds with no blind run) | 5 | R04-1, R06-3, R06-4, R07-2, R07-3 |
| forced only (G3; run outcome unmeasured) | 8 | R03-2, R06-1, R06-2, R06-5, R06-6, R07-1, R07-4, R07-5 |
| **total** | **25** | 2 + 6 + 4 + 5 + 8 |

**The design's claim, in those terms.** Two of 25 are refused before the freeze by a script whose replay
exists. Six of round 08's ten were refused by one verifier on one blind run on Astra (five with an
explicit counterexample); four were not, and no script in v2 reaches those four. Five in rounds 04–07 are
a desk hypothesis with no run behind it. Eight are forced to a run by a regex whose hit is replayed and
whose run is not. Nothing here says "13 of 25 caught".

**The pre-registered test.** Brief 0 run blind, twice — once on Sol, once on Astra — on `edits/06.json`,
`07.json`, `08.json` at `b29e921` (`c1:9`), each refusal list frozen by SHA-256 before D1 is opened, then
scored against D1's 21 items in those rounds by explicit counterexample. Rounds 06 and 07 declare no
checks, so the verifier's duty (i) is what is measured there. Threshold, stated now: fewer than 11 of 21
strict on the model chosen for the live verifier — then `caught` collapses to `forced`, G2 becomes a
critic lens after the freeze, and the design's central claim is the two replayed pins. Cost: six Codex
runs; nearest observation, 53 commands and 19 minutes for C1's whole turn (`rounds.md:13`); so about
two hours of wall time and no Claude tokens. A second, live test comes free with the first round on a
real document: the verifier's verdicts against the critics' findings on the same round, which is G2's
*Refuted by*.

### Fit with the owner's rules

Per round: the verifier (1 Sol) → the wave as the lens table sizes it (`rewrite/SKILL.md:120-130`) plus
the proposition reader (1 Luna) → on a handover round, the proxy (1 Sol). Per round q+8, per handover
+1, against q+6 today (`c1:351`); the wave is announced with count and model as now.

---

## Part 4 — The survey method

M1's sixteen steps (`m1:404-471`) against `rethink` step 1 (`rethink/SKILL.md:25-42`, `stages.md:66-108`)
and its fifteen gaps (`m1:511-527`). The take-on table of v1 (`a1:380-397`) stands; the rules below are
the corrections.

**Rule S1. Surveyors never map; the mapper never surveys; a split critic reads the cut before any
surveyor launches when the slices are more than three named sources; a completeness critic of the other
family reads everything after the map.** *Refuted by:* three surveys where the split critic changes no
brief and the completeness critic names no gap. *Evidence:* each role is `one incident`: the mapping
separation from the newer run (`m1:160-162`, `:175-179`), the completeness critic from the older
(`m1:237-248`); neither run had both (`m1:264-265`); wave 4 skipped the split critic for two URLs and
one file (`README.md:66-67`) and its completeness critic found four things the mapper did not
(`k2:78-110`). *Displaces:* `rethink/SKILL.md:40`; `stages.md:102-105`.

Roles and pool: 3–6 surveyors (Terra; Luna where the slice is fetch-and-quote), 1 split critic (Astra,
before), 1 mapper (Astra or Opus, the family the surveyors were not), 1 completeness critic (the other
family). Nine at most, three waves, announced with count and model.

**Rule S2. A survey row is one bounded claim: id, source and version with hash, verbatim quote
string-matched against the fetch, section, conditions, comparator, sample, outcome or cost, limitations,
direction, audience, fetch status.** *Refuted by:* a mapper verdict the completeness critic overturns
because the row's quote, though present, was cut from the condition beside it. *Evidence:* M1 axis 1–2
(`m1:21-57`, `:75-89`); K2's S2-15 — a quote welded across a fence marker, disclosed by the mapper and
not typographic (`k2:30-34`); S4's rows carry the schema (`s4:5`). *Displaces:* `stages.md:102`'s return
form, kept for the genre slice.

**Rule S3. The mapper's verdict per claim is one of `present`, `partial`, `conditional`, `not located`,
`unknown`, `contradicts` against the document pinned at a commit, with a line each; for a harm row
`present` means the document already avoids it.** *Refuted by:* two independent mappers on the same rows
disagreeing on more than a quarter of verdicts. *Evidence:* `r-synthesis.md:9`; P1 applied it to 85
claims on three targets and K2 found 15 of 15 sampled verdicts hold (`k2:58-78`); `unmeasured` for a
second mapper. *Displaces:* the absence grep with a binary outcome (`m1:489`).

**Rule S4. Effect claims are ranked by study design — `CC` controlled comparison, `VE` vendor experience
report (`VE-n` with a number), `RA` rationale, `ME` mechanism only — and genre-convention claims by use;
the two lists are not merged.** *Refuted by:* a `CC` practice failing phase 3 at the same rate as a `ME`
one. *Evidence:* `r-synthesis.md:9` (the definitions), `:697-699` (the key), cited through `m1:208-213`;
`stages.md:68-70` — convergence is evidence of what readers are used to. P1 used measured > argued >
asserted (`p1:46`), a coarser key; its twelve candidates re-sorted under this one put the three
measured rows (`p1:54-56`) in `VE-n`: vendor-reported numbers without a design. *Displaces:*
`rethink/SKILL.md:35` for effect claims only.

**Rule S5. Every adopted practice is registered as a hypothesis with the audit question it should move
and the line it changed; the register records, per document, the bundled delta and whether the practice
was in it; no practice is demoted from that record, and the do-not-adopt list takes a practice only with
a `CC` row against it or a local incident in which it produced a false sentence.** *Refuted by:* a
practice on the do-not-adopt list that a later controlled run shows effective — its counter was wrong.
*Evidence:* `measure.md:130-132` — which part of the chain produced the gain was designed and not run,
so a bundled number attributes nothing; `r-synthesis.md:734-736` via `m1:226-228` for the register's
fields; `m1:440-442` (step 8: hypotheses, never counterfactuals); P1's counters are of both kinds
(`p1:71-87`). *Displaces:* nothing; `grows`.

### Phase 3, for a document

The re-audit: same questions, key, entry file, model, the no-document score reused
(`measure.md:106-115`, `:80-81`). Designed against S4's (b) rows:

| row | says | in phase 3 |
|---|---|---|
| S4-1 (`s4:7`) | define criteria, then evaluate against them | present: questions and key exist before the writer (`audit/SKILL.md:65-71`) |
| S4-5 (`s4:11`) | compare to a baseline or earlier version | present: the prior round's score and the no-document score (the record's arm, `measure.md:72-73`) |
| S4-7 (`s4:13`) | a held-out set, a margin over baseline | new, hypothesis: two held-out questions written with the key and never shown to any writer or critic; scored only at phase 3. The writer today sees the failed questions through *What broke* (`rewrite/SKILL.md:42-43`). Cost: 2 Luna |
| S4-9 (`s4:15`) | mirror the task distribution; edge cases | present: tasks from the profile's *what brings them here* (`audit/SKILL.md:67`); the planted unanswerable question (`:76-78`) is the edge case |
| S4-16, S4-17 (`s4:22-23`) | ROUGE-L against reference summaries | set aside: no reference text exists and a rewrite is not a summary |
| S4-27 (`s4:33`) | choose the grader by speed and reliability | present: keyed answers; the noise floor as the reliability test |

Per document: q Luna + 2 held-out Luna + 2 Sol tasks + the verifier on changed sentences, about q+5
agents; the result is a delta beside the noise floor. What is not claimed: that any practice caused it.

Where it lives: `rethink/references/survey.md` (new: roles, briefs, row schema, verdict set, S1–S5);
`stages.md` stage 1 keeps its why; `prior-art.md` and `practices-full.md` stay with a header naming the
rules they predate.

---

## Part 5 — The pipeline, the skills, the vendor advice

### One round, in an order a script could execute

| step | who | does | reads | writes |
|---|---|---|---|---|
| 1 | writer | `edits/NN.json` with `asks`, `run`, `expect` | the previous round, the review | `edits/NN.json` |
| 2 | script | G1 runs every `run`, writes `saw`, refuses on `expect`; G3 refuses trigger sentences without a level-3 run or `source:`; writes `NN-pass.md`; grows the ledger | `edits/NN.json` | `NN-pass.md`, `ledger.json` |
| 3 | script | `rule1`, `dup`, `sections`; `ledger.mjs` over `00..NN` — LOST and YES rows listed | the rounds | report |
| 4 | verifier (G2) | verdicts per claim; re-pins for LOST-by-true-paraphrase; `refuted` or `does not answer` → delete `NN-pass.md`, back to 1 | `edits/NN.json` with `saw`, the code | `reviews/NN/verifier.md`, re-pins |
| **freeze** | coordinator | announces the wave; **the round is frozen when the critics launch** (`rewrite/SKILL.md:103`, `loop.md:66-68`) | | |
| 5 | agents | the wave (lenses 1–6); G5's proposition reader on the frozen round; on a handover round, lens 7 with `refused.json` | the frozen round | `reviews/NN/` |
| 6 | coordinator | verifies every finding from its check (`rewrite/SKILL.md:110`); writes each verified regression as `want:false` with `sentence` and `proposition` | the reviews | `ledger.json` |
| 7 | script | G6: `ledger.mjs --judge NN` over `00..NN` → regressions(NN) | `ledger.json`, the rounds | the number for `rounds.md` |
| 8 | coordinator | the row in `rounds.md`; on a handover round, `handover-NN.md`, `candidate-NN.md`, `diff-NN.patch` | | |
| 9 | owner | accepts groups; `apply.mjs` writes `accepted-NN.md`; HO2's re-verification; the tree only on the word | | `refused.json`, `accepted-NN.md` |

G1 before G2 because G2 reads `saw`; G6 after step 6 because it counts the pins step 6 writes; G5 and
lens 7 read the frozen round; the verifier's regenerate loop sits before the freeze, which is why a
verifier refusal is not a regression — the round file it refused never existed to the critics (M6,
`measurements.md:35-37`).

```
/terse:triage → no change | broken | stale | unbacked | unrepaired | regressed | unmeasured
      ↓ (anything but no change, on the owner's word)
/terse:audit  → audit.md + ledger.json (seed)          ← phase 3 after apply, on accepted-NN.md
      ↓
/terse:rethink (only when a finding routes to stages 1–3, or the document does not exist)
      ↓
/terse:rewrite → the nine steps above, per round
      ↓ owner's word, per group
apply.mjs → the tree
```

| Skill | Stays / grows | What changes |
|---|---|---|
| `audit` | stays | step 6 writes `ledger.json` with `sentence` ids (G4); step 4 writes two held-out questions; step 3 takes triage's flagged lines as its order |
| `rethink` | stays | step 1 on Part 4; `references/survey.md` |
| `rewrite` | stays | step 4 is the nine steps; `critic-briefs.md` gains brief 0 and lens 7; `apply.mjs`; `ledger.mjs --judge`; `round.mjs` runs checks |
| `triage` | new | `SKILL.md`, `scripts/triage.mjs` |

### The vendor advice: what enters, what stays with entrust, what is refused

From P1's twelve candidates (`p1:52-65`), those whose target is B or A enter as hypotheses; each names
the audit question P1 gave it and the line it would change. Nothing is adopted; each is an arm.

| P1 rank | claim | target line | hypothesis, and the line it would change | audit question it should move |
|---|---|---|---|---|
| 4 | C06 (`p1:132`, `:224`) | B `rewrite/SKILL.md:80-90` | the once-per-document setup at `:80-90` behind a conditional link, the round sequence `:91-118` staying inline; resumed runs reuse the four files (`:89`) | on a resumed run, which setup files exist and where is the next action |
| 5 | C07 (`p1:133`, `:225`) | B `rethink/SKILL.md:23` | the pointer names the decision that needs `stages.md` and when to open it; tested before any inlining | which reference must I open at this decision, and what do I take from it |
| 6 | C12 (`p1:138`, `:230`) | B `rethink/SKILL.md:45-47` | step 2 ends with an inventory: every load-bearing term, its reader's parse, its source, a decision | which term decisions are still missing |
| 7 | C73 (`p1:199`, `:291`) | A `writing-rules.md:15-16`, and the safeguard half at `:21-23` (K2-a) | a labelled variant that co-locates a term's definition and its qualification, keeping decision-point repetition; run as an arm in the bake-off against the fixed block, which stays the control; the SHA at `:29-33` changes only if the arm wins | at this action, what does the term mean and which condition limits it |
| 10 | C02 (`p1:128`, `:220`) | B `rewrite/SKILL.md:49-50` (K2-b: the B verdict was rendered at `audit/SKILL.md:90`) | a maintainer's ablation note beside "copy the fixed parts": a candidate deletion is compared against the intact wording before it lands | which instruction can go without losing a right answer, a check or a stop |
| 11 | C48 (`p1:174`, `:266`) | B `rethink/SKILL.md:45` | where a dry run misreads a prohibition, pair it with the action wanted; hard guardrails stay | after this prohibition, what do I do |
| 12 | C81 (`p1:207`, `:299`) | B `rethink/SKILL.md:4` | a short human purpose line without the "Use when" list; `disable-model-invocation` stays | which of the three skills do I invoke from this state |

Seven enter. Five stay with entrust, because their target lines are `plugins/entrust/skills/{codex,
orchestrate}/SKILL.md` and this design writes into `terse` only; each has a reason of its own: rank 1,
C45 (`p1:54`, `:263`) — query-last is a long-context model result and P1's own do-not-adopt row 10
(`p1:80`) forbids moving a human document's goal; rank 2, C63 (`p1:55`, `:281`) — Fable-only, a return
rule for delegated agents; rank 3, C60 (`p1:56`, `:278`) — Fable 5.1 coding scope, no document analogue;
rank 8, C25 (`p1:61`, `:243`) — A and B are already `present` (`writing-rules.md:18-19`,
`audit/SKILL.md:13-16`), only C lacks it; rank 9, C24 (`p1:62`, `:242`) — B is `present`
(`rewrite/SKILL.md:34-47`), only C lacks it. Entrust has its own vehicle (`m1:568-571`, `experiment`).

P1's do-not-adopt rows (`p1:69-87`) that touch v2's rules become v2's refusals:

| P1 row | refusal | the v2 rule it protects |
|---|---|---|
| 1, C11 (`p1:71`) | verification is not encouragement to be removed for a self-verifying model: G1 is a script that runs, G2 an agent that is not the writer; the 25 regressions are the counter (`rounds.md:36-37`, `d1:470-478`) | G1, G2 |
| 2, C77 (`p1:72`) | no universal one-copy rule: handover section 4 and `dup.mjs` keep the decision-point exception (`writing-rules.md:21-23`, `loop.md:128-131`) | HO1 §4, G7 |
| 3, C14 (`p1:73`) | ask-first stays: `apply.mjs` never writes into the tree; the word is the owner's | HO2 |
| 5, C79 (`p1:75`) | no stronger words: `expect` is a regex over `saw`, `asks` is scope words | G1, G8 |
| 13, C16 (`p1:83`) | the verifier's model is chosen for decorrelation from the writer, and the pre-registered test runs two models | G2 |
| 17, C70 (`p1:87`) | `unreachable` is a verdict, not a finding; a finding without a check is discarded (`rewrite/SKILL.md:110`) | G2, step 6 |

### Implementation, ordered by evidence class, not by payoff

| # | item | class | files | cost |
|---|---|---|---|---|
| 1 | G4 seed, `sentence` ids | replayed | `audit/SKILL.md` step 6, `ledgers.md`, `audit/scripts/ledger-seed.mjs` (new) | ~30 lines JS, ~15 text |
| 2 | G6 `ledger.mjs --judge`, re-pin histories; G1/G3 in `round.mjs`; selftest cases | replayed (toy + record) | `ledger.mjs`, `round.mjs`, `selftest.mjs`, `rewrite/SKILL.md` step 4 | ~90 lines JS |
| 3 | G2 brief 0, `asks`, step 4b — after the pre-registered test, or with its first live round as the test | blind, n = 1 | `critic-briefs.md`, `rewrite/SKILL.md` | ~40 lines text; +1 agent/round |
| 4 | handover contract, `apply.mjs`, lens 7, HO3–HO6 | unmeasured | `ledgers.md`, `rewrite/SKILL.md` 5–6, `critic-briefs.md`, `rewrite/scripts/apply.mjs` (new) | ~80 text, ~80 JS |
| 5 | G5 field and reader | one incident | `ledger.json` field, a brief | ~20 lines; +1 Luna/round |
| 6 | `triage` skill | unmeasured; pays only after an audit exists | `skills/triage/`, `README.md` | ~150 lines |
| 7 | `survey.md`, `rethink` step 1, the seven vendor arms | one incident each | `rethink/references/survey.md`, `rethink/SKILL.md` | ~120 lines |

No claim that this order pays back most (`c1:323-333`). Costs per C1's formula (`c1:347-362`): a round
goes from q+6 to q+8, a handover adds 1; a full audit is 2q+2; phase 3 q+5. Nothing is written into the
tree without the word; one theme per commit; the version bump its own commit; CHANGELOG under Unreleased.

---

## Part 6 — What v2 does not settle, and what to attack first

**Not settled.**
- F6.1 — when leaving a whole document alone is safe. v2 adds `unrepaired`, `regressed` and the audit
  commit as fingerprint; it still rests on a question set (M12) and T4 has not run: 84 agents for three
  documents.
- F6.2 — selective acceptance. The group rule is mechanical; the coupling D1 `:447-448` shows leaves no
  textual trace and is caught only by HO2's re-verification, which is a judgement and `unmeasured`.
- F6.3 — healing measured between rounds. The transition count reproduces the record within four seams,
  each a place where "its critics" and "the introducing round" disagree; the owner has to choose which
  the round's verdict is. An independent judge of round N against N−1 is still not built
  (`markup-round-0/rounds.md:219`).
- F6.4 — adoption of a practice. S5 now forbids demotion without an arm; the arm per practice
  (`measure.md:130-132`) is designed and unrun, so the register only grows.
- The verifier's cost and model: Sol chosen for decorrelation; the only run was Astra.
- G3's precision on a README that links rather than transcribes: `unmeasured`.
- Whether `asks` and `sentence` ids can be written honestly by the writer and the coordinator; G2 (ii)
  reads the first, nobody reads the second.
- HO5 and HO6 rest on one entrust incident and a fact about a clip; neither has a document measurement.

**Attack these first.**
1. **"The verifier reaches the desk class and holds on Sol."** v1's claim 1, not settled; restated: the
   five desk items are a hypothesis with no run, the six blind items are n = 1 on Astra, and duty (i) is
   what carries rounds 06–07. Test: the pre-registered one in Part 3, threshold 11 of 21 strict; cost six
   Codex runs.
2. **"`no change` is safe under T2 as rewritten."** v1's claim 2, not settled; F4.2's hole is closed by
   `unrepaired`, and the M12 hole is not: a document can pass every question and carry a false sentence
   no question touches. Test: T4 on three audited documents, 84 agents; the pre-registered number is
   18/25 for S2 and zero false accepts.
3. **"The transition count is the round's verdict."** New; it replaces v1's claim 3, which v2 withdrew —
   the proxy no longer claims to predict the owner, it is a lens with `one incident`. The count charges
   the introducing round; the skill's definition charges the round whose critics found it
   (`loop.md:53-55`); the record shows the two disagree at 02, 05, 07 and 08 (Appendix A(ii)). Test: run
   `regress.mjs` with `sentence` groups the coordinator writes for round 08's eleven pins and see whether
   ten, eleven or another number comes out — and whether a second coordinator writes the same groups.

---

## Appendix A — the three measurements made today

All under `$TMPDIR`, read-only on the repository; scripts and outputs beside this file.

**(i) Trigger recount.** The v1 regexes (`a1:536-539`) with `read-only` masked, over `a1-q.txt`'s 25
rows: ABS 4, LIFE 15, either **18 of 25**; misses R04-1, R06-4, R07-2, R07-3, R08-1, R08-5, R08-10. Same
as `c1-checks.log:2-3`.

**(ii) The transition count.** `regress.mjs` (ES module, `import`), the four toy cases under `toy/`, and
`record-replay.txt`. Existing `ledger.mjs` beside it for the failure counts. Toy results: case 1 (returns
at r3) regressions 1, 0, 1 for r1–r3; case 2 (persistent) 1, 0; case 3 (two pins, one `sentence`) 1
against the existing ledger's 2 failures; case 4 (true paraphrase) 1 without a re-pin, 0 with the verifier's
re-pin at r1. Record: `node regress.mjs ledger.json 00-draft-instructions.md 00-draft.md 01…09` →
01: 11 (the draft's pre-existing defects, never a round's), 02: 2, 03: 2, 04: 1, 05: 1, 06: 6, 07: 4,
08: 11, 09: 0.

**(iii) The four blind-missed edits under the regexes.** `edits/08.json[6]` (R08-2): level 1, no hit;
`[7]` (R08-3): level 3, `only`/`left`; `[14]` (R08-7): level 3, `until`; `[24]` (R08-9): level 3,
`only`/`dead`. G3 refuses only a hit below level 3, so it refuses none of the four.
