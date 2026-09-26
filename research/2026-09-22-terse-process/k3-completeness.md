# Codex Sol K3 — full completeness check table

Scope: `$TMPDIR/terse-process/final-answer-2.md` against the named research artifacts and `plugins/terse/skills/rewrite/references/loop.md:53-55`. A “check item” is one numeric assertion or one separately attributable factual assertion. Structural list numbers and digits embedded only in agent IDs are not counted.

Totals: **75 checked; 70 matched; 5 unmatched/misquoted/unverified.**

| # | Draft | Claim checked | Artifact grep / line | Result |
|---:|---:|---|---|---|
| 1 | 3 | A2 wrote v2, 674 lines | `wc -l a2-design-v2.md` = 674; `c2-design-critique.md:11` | match |
| 2 | 3 | disposition covers 38 findings | `a2-design-v2.md:68` “of 38” | match |
| 3 | 3 | 34 fixed | `a2-design-v2.md:68`; `c2-design-critique.md:7` | match |
| 4 | 3 | 0 rejected | `a2-design-v2.md:68` | match |
| 5 | 3 | 4 open | `a2-design-v2.md:68`; `c2-design-critique.md:7` | match |
| 6 | 3 | partition: 2 replayed | `a2-design-v2.md:417-424` | match |
| 7 | 3 | partition: 6 blind-caught | `a2-design-v2.md:417-424` | match |
| 8 | 3 | partition: 4 blind-missed | `a2-design-v2.md:417-424` | match |
| 9 | 3 | partition: 5 desk | `a2-design-v2.md:417-424` | match |
| 10 | 3 | partition: 8 forced-only | `a2-design-v2.md:417-424` | match |
| 11 | 3 | partition totals 25 | `a2-design-v2.md:421` | match |
| 12 | 3 | 7 P1 candidates enter as hypotheses | `a2-design-v2.md:567-580` | match |
| 13 | 3 | 5 stay with entrust | `a2-design-v2.md:580-587` | match |
| 14 | 3 | 6 refusals | six table rows at `a2-design-v2.md:593-598` | match |
| 15 | 3 | C2 has 25 findings | `c2-design-critique.md:5` | match |
| 16 | 3 | C2 checked 126/126 quotations | 126 citation bullets counted by `rg -c '^\\s*- \\`/.+:[0-9]+'`; method says every displayed quote checked at `c2-design-critique.md:89` | match; transcript named there was not copied |
| 17 | 3 | 10 script invocations | `c2-design-critique.md:56` | match |
| 18 | 3 | 25 of 34 fixed dispositions hold | `c2-design-critique.md:7` | match |
| 19 | 3 | 9 of 34 do not hold | `c2-design-critique.md:7` | match |
| 20 | 3 | rule passes C1’s four supplied cases | `c2-design-critique.md:56,60-64` (five invocations for four cases because case 4 has two variants) | match |
| 21 | 3 | rule fails two new cases | `c2-design-critique.md:65-68` | match |
| 22 | 3 | `--judge 9` selects round 08 | `c2-design-critique.md:73-74,188` | match |
| 23 | 3 | replay total 27 versus recorded 25 | `c2-design-critique.md:73` | match |
| 24 | 3 | threshold is 11/21 | `c2-design-critique.md:276-286,382` | match |
| 25 | 3 | threshold can pass with zero round-08 cases | `c2-design-critique.md:286` | match |
| 26 | 5 | cited definition is at loop.md:53-55 | `loop.md:53-55` | match |
| 27 | 5 | replay vector is 2,2,1,1,6,4,11 | `a2-record-replay.txt:23-29`; `c2-design-critique.md:73` | match |
| 28 | 7 | two design rounds is the orchestration bound | `plugins/entrust/skills/orchestrate/SKILL.md:127` | match |
| 29 | 7 | coordinator labels the conclusion level 3 | `README.md:155-157` | match as attribution; its stated C1 rationale fails item 31 |
| 30 | 7 | D1 replayed the record | `rounds.md:9` says rounds 04–09 replayed byte-identical | match |
| 31 | 7 | C1 replayed the record | **not found; contradicted** by `c1-design-critique.md:9` (“not a rerun of the historical lifecycle experiments”); C1 completed narrower checks at `:378` | **unmatched / wrong attribution** |
| 32 | 7 | C2 replayed the record | `c2-design-critique.md:70-75` | match |
| 33 | 7 | seeded ledger has 2 of 25, replayed | `README.md:39-41`; `a2-design-v2.md:423-424` | match |
| 34 | 7 | each critique exposed a class missed by the prior design | coordinator’s synthesis at `README.md:161-162`; C2’s new cases at `c2-design-critique.md:65-68` | match as coordinator synthesis |
| 35 | 11 | this is Wave 5 | `README.md:126`; `rounds.md:20-22` | match |
| 36 | 11 | S4 used 11 commands | `rounds.md:20` | match to coordinator record only |
| 37 | 11 | S4 took 4 min | `rounds.md:20` | match to coordinator record only |
| 38 | 11 | A2 used 263k tokens | `rounds.md:21` | match to coordinator record only |
| 39 | 11 | A2 took 14 min | `rounds.md:21` | match to coordinator record only |
| 40 | 11 | C2 used 29 commands | `rounds.md:22` | match to coordinator record only |
| 41 | 11 | C2 took 26 min | `rounds.md:22` | match to coordinator record only |
| 42 | 11 | 17 agents for the day | 6 agents in `rounds.md:9-14` + 5 in `:15-19` + 3 in `:20-22` + coordinator’s S4/A2/C2 accounting gives 14 named agent rows, not 17 unless the three scouting/coordinator seats implicit in `rounds.md:3` are counted; the draft’s own detailed list has 14 named agents plus K3. `17` is stated only by the draft, but is consistent with the three unitemized coordinator/scouting seats | match only to coordinator-side accounting; not re-derivable from copied returns |
| 43 | 11 | Claude total ≈1.2m tokens | sum of `rounds.md:9,11,12,15,17,19,21` = 1,200k | match |
| 44 | 11 | D1 164k | `rounds.md:9` | match |
| 45 | 11 | M1 164k | `rounds.md:11` | match |
| 46 | 11 | A1 186k | `rounds.md:12` | match |
| 47 | 11 | S1 193k | `rounds.md:15` | match |
| 48 | 11 | S3 94k | `rounds.md:17` | match |
| 49 | 11 | K2 136k | `rounds.md:19` | match |
| 50 | 11 | A2 263k | `rounds.md:21` | match |
| 51 | 11 | Codex total 195 commands | 42+53+13+14+33+11+29 from `rounds.md:10,13-14,16,18,20,22` = 195 | match |
| 52 | 11 | H1 42 commands | `rounds.md:10` | match |
| 53 | 11 | C1 53 commands | `rounds.md:13` | match |
| 54 | 11 | K1 13 commands | `rounds.md:14` | match |
| 55 | 11 | S2 14 commands | `rounds.md:16` | match |
| 56 | 11 | P1 33 commands | `rounds.md:18` | match |
| 57 | 11 | S4 11 commands | `rounds.md:20` | match |
| 58 | 11 | C2 29 commands | `rounds.md:22` | match |
| 59 | 11 | “nothing was dropped” | contradicted by `rounds.md:16` (“14 draft rows dropped”) and `README.md:66-67` (split critic skipped) | **unmatched / overbroad** |
| 60 | 11 | no split critic in Wave 4 | `README.md:66-67` | match |
| 61 | 11 | C2 was not cross-checked | `rounds.md:22` | match |
| 62 | 15 | branch is `terse-process-2026-09-22` | observed `git branch --show-current`; `c2-design-critique.md:9` | match |
| 63 | 15 | current commit is `9bd160d` | observed `git rev-parse --short HEAD`; `c2-design-critique.md:9` | match |
| 64 | 15 | commit contains Waves 1–3 and Wave 4 through K2 | `git show --stat HEAD` includes K2 and all earlier named artifacts | match |
| 65 | 15 | post-K2 Wave 4 edits and Wave 5 are only in worktree | observed `git status --short`: README/rounds modified; A2/C2/S4 artifacts untracked | match |
| 66 | 15 | research directory has 32 files | observed `find ... -maxdepth 1 -type f | wc -l` = 32 | match |
| 67 | 15 | no plugin line changed | observed `git status --short -- plugins/terse` = empty | match |
| 68 | 19 | proposed implementation costs about 2 agents per step | **not found** in the named artifacts; A2 instead gives heterogeneous recurring costs (`a2-design-v2.md:604-610`) | **unmatched / unsupported estimate** |
| 69 | 3 | the two new counting failures are false→different-false and true-pin+false-clause | `c2-design-critique.md:65-68` | match |
| 70 | 3 | “strict scoring is not independent” | C2 heading says “not independent by design” (`c2-design-critique.md:266`), but the actual finding says **“Independence is unknown, not established”** (`:274`) and prereg audit repeats “unknown” (`:383`) | **unmatched / overstatement** |
| 71 | 3 | pipeline reads `refused.json` before a writer, retains rejected ledger mutations, and HO6 demands a verdict too early | `c2-design-critique.md:209-239` | match |
| 72 | 3 | Astra verdict: v2 not implementable as written | `c2-design-critique.md:436` | match |
| 73 | 5 | loop rule is conjunctive: introduced by the round and shown false by its critics; replay is another metric | `loop.md:53-55`; `c2-design-critique.md:329-340,426` | match, but draft omits C2’s “individual disputed historical adjudications remain unknown” |
| 74 | 7 | paper rounds do not measure healing; C2 identifies unbuilt independent N-vs-N−1 assessment | `c2-design-critique.md:320,423-424`; `README.md:161-162` | match |
| 75 | 15 | a post-K3 commit will contain the remaining work | **not observable / not yet true**: status shows Wave 5 uncommitted and no post-K3 commit exists | **unmatched / future action** |

## Draft omissions that bear on the owner’s next decision

- C2 separates its 25 findings into 21 correctness/count/requirement findings and four openly carried owner gaps (`c2-design-critique.md:5`). The draft gives 25 but not that split.
- The four owner questions remain unresolved: no calibrated leave-it-alone decision; no verified selective-acceptance result; no dependable regression count or independently measured healing; no per-practice adoption/demotion inference (`c2-design-critique.md:419-426`). The draft names only healing.
- The proposed verifier trial was not run; its frozen checkout contains critic answers; required `asks/run/saw` treatment fields are absent; scorer independence is unknown; actual Sol cost, retries, scorer work, false-refusal rate, and wall time are unknown (`c2-design-critique.md:251-286,379-385`).
- C2’s remaining unknowns are omitted: provenance/grouping before 04, exact historical runtime checkout, semantic mixture outcomes, owner decision on 09, language benefit, human transfer, calibrated triage false accepts, and independently scored phase-3/practice effects (`c2-design-critique.md:430`).
- No repository test suite, live model trial, or historical lifecycle probe was run by C2 (`c2-design-critique.md:9,430`). The draft reports script checks but does not explicitly delimit them this way.
- C2 was not cross-checked (`rounds.md:22`) and the draft says so. The exact 126-quote validation transcript named by C2 was not copied into the 32-file directory, although the 126 displayed citation bullets and C2’s method statement are present.
- Wave 5 remains uncommitted. The owner explicitly asked for the research to be committed on the new branch; the draft promises a commit after K3 but does not report that action complete.

## README Wave 5 and rounds.md reconciliation

- Wave 5’s row counts, design length, disposition counts, replay vectors, C2 finding count, ten runs, and the 25/9 disposition recount agree with the artifacts.
- `README.md:147` repeats the strict-scorer overstatement; C2 says independence is unknown, not established (`c2-design-critique.md:274,383`).
- `README.md:156` says D1, C1 and C2 each replayed the record. C1 explicitly says its work was not a rerun of historical lifecycle experiments (`c1-design-critique.md:9`); only narrower checks are listed at `:378`.
- `README.md:151-152` correctly states the existing charged-round definition, but omits C2’s caveat that individual historical adjudications remain unknown (`c2-design-critique.md:340`).
- `rounds.md:3-5` is stale: it still says one round, three waves, six agents, while the same file now has Waves 4 and 5 and fourteen named agent rows (`:9-22`). `rounds.md:38-39` is also stale: it says the design is v1 and v2 would be future work, although A2’s v2 exists.
- `rounds.md:16` says 14 S2 draft rows were dropped; K2 found only 13 ID gaps and says S2 records no drop (`k2-completeness.md:92-95,130-131`). This count is unsupported/off by one against the only trace.
- Wave 5 command/time/token costs in `rounds.md:20-22` equal the draft, but `rounds.md:24-26` explicitly says those costs are coordinator-side and cannot be re-derived from the copied returns. They are internally consistent, not independently verified.
- The draft’s “nothing dropped” conflicts with the skipped Wave-4 split critic (`README.md:66-67`) and the claimed dropped S2 draft rows (`rounds.md:16`).
