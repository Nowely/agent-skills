# Fable J3 — three judging sheets, terse README bake-off (run 20260922-233021-terse-readme)

Judged against: plugins/terse at commit 2f29a8f (verified: `git diff --stat 2f29a8f -- plugins/terse .claude-plugin`
empty at HEAD 448b920, the HEAD that existed when the sheets were written); the claim ledger C01–C46 in
research/2026-09-22-terse-process/audit-2026-09-22/audit.md (lines 62–854); candidates/what-broke.md; the
2026-09-10 research record for every number. Line numbers "A:12" are the candidate's; "orig:12" the original's;
everything else is a repository path at 2f29a8f.

## Ruling on the point the sheet leaves to the judge

Question: is a sentence that is true of the checkout at 2f29a8f and false of what `main` (21a225b) installs today
a "new false claim" (row 1), or a release-timing matter outside that row?

Ruling: outside the row. Reasons, each with its line:
1. The sheet defines the ruler: "Judge every behavioural claim of each candidate against the code at commit
   2f29a8f (the three skill pages …, the seven scripts, the three manifests)" (judge-tail.md:14). `main` is not
   that code.
2. The writer's accuracy floor is the same ruler: "every statement about behaviour must be true of the code in
   this checkout" (bake-off.md:60; rewrite/SKILL.md:44 "true of the code in this checkout").
3. The README ships in the same tree as the pages it describes, so at any released revision the README and the
   pages are one commit; the mismatch exists only between an unreleased branch and a released `main`, and no
   README sentence can remove it except by dating itself. The finding itself allows both routes: "the rewrite
   states the plugin as it is on this branch and the release makes it true, or says which version it describes"
   (what-broke.md:47).
4. The opposite ruling would veto all three candidates alike (each describes the branch's outside-repository
   run directory, which 21a225b's rewrite page does not have: `git show 21a225b:plugins/terse/skills/rewrite/SKILL.md`
   lines 66–67 "research/<date>-<slug>/ at the root of the repository", 112–113 "a code defect to the
   repository's ISSUES.md"), which would make the row measure the release calendar, not the text.

Applied the same way to all three: no candidate is vetoed for describing 2f29a8f; the finding's second route,
naming the version, is scored under row 3 (failures repaired) as the one textual repair, and only B has a line
for it (B:73-76).

What I verified about `main`: `git branch --list main` exists locally; `git log -1 main` = 21a225b ("Release
0.20.0 …"); `git log -1 origin/main` = 21a225b; 21a225b's plugin.json version is "0.1.1". The GitHub fetch the
install commands perform was not run by me (no network in my remit) nor by the truth pass (ledger C18: "The
GitHub fetch and the slash form were not run"); Astra's finding (what-broke.md:47) is the only run-backed source.

## Method common to the three sheets

- Row 1 checks every sentence that states what the software or the record does; each check names the candidate
  line, the source line, and the level (1 line resolves, 2 code says it, 3 made to happen). Unconfirmed ledger
  entries kept at their level are allowed (what-broke.md:60); strengthened ones would fail.
- Row 2 checks (a) the four passages what-broke.md:54-60 records as working, byte-checked where the passage is a
  block (install commands: the four command strings grepped verbatim; pipeline block: md5 of the five lines
  equals the original's c46c709a…), and (b) every condition, limit or warning of the original at an install,
  invoke or apply decision, for cut or weakening. The test I applied for (b): a sentence supported at level 2 by
  the pages that bounds what happens when the reader acts; an untested effect prediction (C25/C26, "a prediction
  no recorded run tested") is not such a limit and may be cut.
- Row 3 counts 17 items from what-broke.md: Q2 (C16 refuted + C15 Position), Q7 (missing), C12, C13, C20, C21,
  C27, C30, C39, C41, C45, C46, C44 Position, and the four adversarial items (installed version, Claude login,
  truth-pass exclusion, re-audit of a temporary candidate). Task TB's source is rewrite/SKILL.md:64-67, 136-140,
  already repaired at 2f29a8f; a README can only describe the repaired recipe, which is Q2's repair, so it is not
  counted twice. Removal of a refuted sentence counts as a repair at its source (audit/SKILL.md:127 "correct the
  claim at its source"; a claim that no longer reaches readers is corrected).
- Row 4 uses, as the inventory, the four things what-broke.md:52 says a new reader still cannot answer
  (authentication, installed revision and write boundary, what the truth pass excludes, validating a temporary
  candidate with links intact), plus the profile's two assumptions (Claude Code installed; Node). The writers'
  own invisible-prerequisite inventories did not reach me (bake-off.md:123 gives a judge What broke and the
  candidate only).
- Row 5 lists every original passage of twenty words or more that is absent from the candidate (not reworded:
  absent), with `wc -w` of the passage. No cut ledger reached me, so "reason shown" means shown in the candidate.
- Row 6: `wc -w` — original 933.

---

## Sheet A

### Row 1 — new false claims: PASS (54 claims checked, 0 contradict the code, 0 exceed their source's level)

1. A:3-4 measures, then repairs — C01 confirmed (L2).
2. A:4 readers are fresh model agents that have never seen your project — measure.md:40 (model), :47 (brief:
   "You have never seen this project") (L2).
3. A:4-6 checks what the text says your software does against the code, not recipes for tools the repository
   does not ship — audit/SKILL.md:56 (one entry per sentence that states what the software does);
   truth-pass.md:69 (L2). Repairs the C02 overclaim and what-broke.md:49.
4. A:6 a failure comes back with its cause and its evidence — audit/SKILL.md:123-131; ledgers.md:99-100 (L2).
5. A:8 takes any documentation kept in .md files, in any language — audit/SKILL.md:25 (.md); no page states a
   language; no gate in pages or scripts; the one English-bound pattern (rule1.mjs:29) is disclosed at A:92-94.
   Source of the intent: brief.md (owner's words). Level 2 by reading; not overstated given A:92-94.
6. A:8-9 text with no code is audited; weaker check; not measured — truth-pass.md:73-79 (L2).
7. A:11 you type each; none starts on its own — C04 unconfirmed, kept at its level (disable-model-invocation:
   audit/SKILL.md:7, rethink/SKILL.md:7, rewrite/SKILL.md:8).
8. A:19-20 audit when the document exists, rethink when none or shape wrong — rethink/SKILL.md:6 (L2).
9. A:20-21 apply, then audit again on the same questions — measure.md:108 (L2).
10. A:26-31 install commands — the four strings verbatim (grep), C18/C19.
11. A:33 Claude Code signed in; node on PATH — what-broke.md:48 (Astra, L3); C20/C21 (L3).
12. A:33-34 audit and rewrite run Node scripts installed or from a clone — audit/SKILL.md:159-161;
    rewrite/SKILL.md:82-88 (L2; C20/C21 ran it, L3).
13. A:34 the package declares 22 or newer — package.json:4-6 (L1).
14. A:35 nothing to npm install, no configuration file — C20 "what holds" (L3).
15. A:35-36 with entrust some rewrite agents go to Codex, else Claude — rewrite/SKILL.md:147-148;
    bake-off.md:26-27 (L2).
16. A:40-42 audit profile, answers from the code, one fresh reader per question, .md only, entry file — C06.
17. A:42-43 on a first audit each question also goes to a no-document reader; score is the difference —
    audit/SKILL.md:94-100 ("runs once, at the baseline"), :120 (L2).
18. A:43-45 score, failed questions, five causes — C07.
19. A:45 never suggests wording — C08 unconfirmed, kept at level.
20. A:45-46 every answer right: says so and stops — audit/SKILL.md:149-150 (L2).
21. A:46 kept in its run file audit.md — audit/SKILL.md:153 (L2).
22. A:48-51 rethink — C09, C10.
23. A:53-55 three writers; from an audit each takes the whole document through four passes (reader, rules,
    prerequisites, failures) — bake-off.md:47-49 (01-reader-pass, 02-writing-pass, 03-prerequisite-pass, final);
    rewrite/SKILL.md:37-43 (L2).
24. A:55-56 two judges on the measured failures, or on purpose from a skeleton — bake-off.md:106-132 (L2).
25. A:57 the winner is edited in rounds — rewrite/SKILL.md:58 (L2).
26. A:57-58 each claim an edit adds carries a check that is run; a check that finds nothing refuses the round —
    rewrite/SKILL.md:110-118; round.mjs:19-22, 89-92 (L2).
27. A:58-59 the ledger fails the round for dropping a verified sentence or keeping one found false —
    ledger.mjs:6-9 (want true → LOST, want false → YES); rewrite/SKILL.md:124; audit Open ("red by design:
    every refuted sentence reads YES", run) (L3 by the audit's run).
28. A:59-60 the critics' lenses differ (five named) — rewrite/SKILL.md:164-175 (C12 repaired).
29. A:60-63 hand-over: round, diff, cut list, ledger with check/source and level; the three levels —
    rewrite/SKILL.md:188-192, 205-206; truth-pass.md:12-16. Narrower than C14's "every behavioural claim" (L2).
30. A:63 the loop stops when you read a round and say whether you would send it — rewrite/SKILL.md:188.
31. A:63-64 applies the round only when you say so — rewrite/SKILL.md:191-192.
32. A:66-67 announce count and model, wait for your word — C17 unconfirmed, kept at level.
33. A:71 audit writes nothing into your repository — audit/SKILL.md:44 verbatim in meaning (L2). Conflict on
    record: measure.md:119-121 lets the score be stored in the audited repository on the user's word
    (ISSUES.md E12, found by the bake-off's other judge). Not vetoed: the sentence restates the executing page,
    and the reference's exception is a consented write, the same shape as rewrite's "without your word". The
    same standard was applied to B:52 and C:24-25.
34. A:71-72 rewrite puts nothing into it without your word; a code defect is offered as a proposal —
    rewrite/SKILL.md:78-79, 152-154 (L2). Repairs C16.
35. A:73-74 both run directories outside the repository; absolute path printed; rewrite asks for audit's —
    audit/SKILL.md:33-38; rewrite/SKILL.md:29, 66-74 (L2). Repairs C15 Position.
36. A:74-75 installed: plugin data directory, deleted by uninstall unless --keep-data — audit/SKILL.md:39-40
    (L2; the page's statement, not run).
37. A:75-76 from a clone: temporary directory, OS may purge; copy a run — audit/SKILL.md:36, 40-42 (L2).
38. A:78 rethink hands over one file; page does not say where — rethink/SKILL.md:72; audit Open; ISSUES E13.
39. A:82-84 not a compressor; 2,725→2,571; length reported not selecting; budget reported not blocking —
    C23, C24 confirmed.
40. A:86-89 the writers' fixed rules — writing-rules.md:6-10, 21-23 (L1, quoted).
41. A:89-90 a judge rejects a candidate that cuts or weakens such a passage; a false one is corrected —
    bake-off.md:113-114, 61-62 (L2). Repairs C27.
42. A:92-93 checks are scripts, each tested against a planted violation — loop.md:137-138; rewrite/SKILL.md:87.
43. A:93-94 rule1 recognises an exit code only in English — rule1.mjs:29; MY RUN (level 3): planted English
    line → path, flag, "exits 2" flagged, 3 violations; same line in Russian («завершается с кодом 2») → path and
    flag flagged, 2 violations, no exit code; Node v24.11.0. Matches ISSUES E8.
44. A:98-99 two experiments, both 2026-09-10, on another Claude Code plugin; chain once over its README;
    bake-off over its prose and comments — 2026-09-10-chain/README.md:1,16; chain/audit.md:3 (codex-delegate);
    run-2x5/zP378l2j.prompt.txt:9-15 ("a Claude Code plugin"; "The corpus is the whole of it"). Repairs C30.
45. A:99-101 no no-document arm, so nothing separates taught from known — C44 confirmed; now before the
    numbers (Position repaired).
46. A:103-107 3→6, 1→0 departures, controls held (defined), six questions one trial, McNemar 0.25, pilot;
    readers' answers not in the repository — C31-C33 kept at level, weakened by the last sentence (C31, E7).
47. A:108-109 two failures false claims; two guarantees from that README's opening — C34/C35 kept at level;
    chain/00-original.md:5-9 is the opening.
48. A:110-112 clarity ran against truth; three observations — C36-C38 kept; prior-art.md:99.
49. A:113-114 ten agents in pairs: Diataxis, a published house style, checking against the code, a draft rule
    block, no standard; models hidden from two judges — v04PR6HL.prompt.txt:13-24 (L1). Repairs C39.
50. A:114-116 both no-standard agents above all four published-standard agents on one judge's list; one of them
    on the other's — o8eHzS6U.answer.md:3 (J2: P9 2nd, P10 3rd; P2 5th, P7 7th, P8 8th, P1 10th);
    v04PR6HL.answer.md:3 (J1: P10 3rd above P7 4th, P2 6th, P8 9th, P1 10th; P9 7th below P7 and P2). Repairs
    the unconfirmed C40 by naming the split.
51. A:116-118 five proposed nothing, one punctuation only, three longer, the only shortener (116→97) had no
    standard — o8eHzS6U.answer.md:10-19 (P1, P2, P4, P5, P6 none; P8 punctuation; P3, P7, P10 longer; P9
    116→97). Repairs C41.
52. A:118 ten agents, one run, one passage — C42.
53. A:120 not measured: which pass, bake-off vs one pass — C43.
54. A:121-122 prior-art.md records an adversarial review of these numbers and what the field knows —
    prior-art.md:87-90 (L1). Repairs C46 (no longer "every finding").

### Row 2 — protected passages: PASS

- orig:42-49 install commands: A:26-31, the four command strings verbatim; prerequisite sentences replaced
  (A:33-36) as required.
- orig:11 pipeline line: A:14-16, md5 of the block identical to the original; A:19-21 adds the order in words.
- orig:21-22 and :31-36 (Q4): audit returns failures and never suggests wording (A:43-45); rewrite hands a
  round with its diff (A:60-61); applied only when you say so (A:63-64, A:71-72).
- orig:53-56 (Q6): "It is not a compressor." and the 2,725→2,571 figure verbatim at A:82-83; Q6's scoring rule
  ("not as an aim; 2,725→2,571 on the one file measured") is answerable from A:82-84.
- Conditions, limits, warnings at decision points, all present: none starts on its own A:11; stops for your
  word A:51; announce and wait A:66-67; nothing into your repository without your word A:71-72; uninstall
  deletes unless --keep-data, OS may purge A:74-76; Node/login A:33; one trial each, p = 0.25, pilot A:105-107;
  one observation per cell A:118; not measured A:120.
- Cut from the original and judged not to be such a limit: orig:55-56 (29 words, C25/C26 "a prediction no
  recorded run tested"); orig:27-29 (44 words, the rationale for rethink, not a condition); orig:84-86 (27 words,
  C45 refuted, C46 refuted).

### Row 3 — failures repaired: 16 of 17

| Item | Repaired | Where |
|---|---|---|
| Q2 (C16 refuted, C15 Position) | yes | A:71-76 |
| Q7 missing (any language, code or not; where it goes) | yes | A:8-9 at the top, limit at A:92-94 |
| C12 stop rule, lenses | yes | A:59-63 |
| C13 every round kept | yes, by removal | A:57-58 carries no such claim |
| C20 nothing else needed | yes | A:33-35 |
| C21 Node only for checkout | yes | A:33-34 |
| C27 will not touch | yes | A:87-90 |
| C30 one run, one README | yes | A:98-99 |
| C39 five published standards | yes | A:113-114 |
| C41 seven of ten | yes | A:116-118 |
| C45 two benchmarks found it large | yes, by removal | absent; A:120-122 |
| C46 collects every finding | yes | A:121-122 |
| C44 Position (before the numbers) | yes | A:99-101 |
| installed version (what-broke.md:47) | no line | describes the branch; the finding's first route |
| Claude login (what-broke.md:48) | yes | A:33 |
| truth-pass exclusion (what-broke.md:49) | yes, named | A:5-6 |
| re-audit a temporary candidate (what-broke.md:50) | yes | A:19-21 (apply, then the same questions) |

### Row 4 — prerequisites: 3 of 4 lens-E items, answered where met

- authentication: A:33, in Install — yes.
- installed revision and write boundary: boundary A:71-76 in its own section after "What each one does";
  revision — absent.
- what the truth pass excludes: A:5-6, in the opening sentence that makes the claim — yes.
- validating a temporary candidate: A:19-21, beside the pipeline line where "audit again" is met — yes.
- profile assumptions: Claude Code and Node at A:33-34, in Install — yes.

### Row 5 — cuts justified: 3 cuts of twenty words or more, 0 with a reason shown

- orig:27-29 "It exists because a draft … None was about phrasing." 44 words — absent; no reason in A.
- orig:55-56 "If your text is long because it is wrong … start being right." 29 words — absent; no reason in A.
- orig:84-86 "Two published benchmarks … collects every finding against these numbers." 27 words — replaced by
  A:121-122 with different content; no reason in A.
(The cut ledger, if the writer produced one, did not reach the judge.)

### Row 6 — length: 933 → 1389 (+456)

---

## Sheet B

### Row 1 — new false claims: PASS (46 claims checked, 0 contradict the code, 0 exceed their source's level)

1. B:3-4 measures readers' answers and claims against the code — C01; C02 scope (L2).
2. B:4-5 "The intended scope is Markdown in any language, whether or not the document is about software" —
   stated as intent, source brief.md (owner's words); audit/SKILL.md:25-27 (.md; text with no code) (L2).
3. B:5-7 where no code backs the text, guarantee-shaped claims need a named source or weaker wording; not
   measured — truth-pass.md:75-79 (L1, near-quote).
4. B:9-11 audit when you have a document; rethink when missing or shape wrong; both feed rewrite; audit again —
   rethink/SKILL.md:6; rewrite/SKILL.md:14-21; measure.md:106-109 (L2).
5. B:14-16 pipeline block — md5 identical.
6. B:19 three user-invoked skills — C03 (L3); plugin.json:4.
7. B:23-24 profile, claim ledger, answer key before one fresh reader per question — audit/SKILL.md:13-16,
   46-89 (L2).
8. B:24 readers start at the entry file, only Markdown — audit/SKILL.md:89-90 (L2).
9. B:24-25 baseline with no documentation; task readers from the documentation alone — audit/SKILL.md:94-95,
   109-110 (L2).
10. B:27 returns profile, ledger, score against the no-document baseline, failures — ledgers.md:9-37;
    audit/SKILL.md:120, 164-165 (L2).
11. B:27-28 five causes — audit/SKILL.md:125-131 (L1).
12. B:28-29 states what a repair must achieve without proposing wording — ledgers.md:114; audit/SKILL.md:18.
13. B:29-30 the behaviour ledger excludes voice and ordering, illustrative examples, arguments for
    instructions, recipes for tools the repository does not ship — truth-pass.md:66-69 (L1). Repairs
    what-broke.md:49.
14. B:32-34 rethink: compares genre, settles terms, explores structures; skeleton; waits — C09/C10;
    rethink/SKILL.md:56 (L2).
15. B:36-37 for an existing document an adversarial read precedes three whole-file candidates and two judges —
    rewrite/SKILL.md:54-57 (L2).
16. B:37-38 later rounds edit the selected candidate and check ledger, task outcomes, reader questions —
    rewrite/SKILL.md:58, 179-186 (L2).
17. B:38 you decide when a round is ready to send — rewrite/SKILL.md:188.
18. B:40 hand over a candidate and its diff — rewrite/SKILL.md:190-191.
19. B:40-42 cuts of twenty words with a reason; declared claims record source and evidence —
    rewrite/SKILL.md:205-206; round.mjs:112-117 (L2).
20. B:42-43 the shipped check rejects a round that loses a pinned sentence or restores retired wording —
    ledger.mjs:6-9 (L2).
21. B:43 not a promise that no regression can occur — C14 unconfirmed, weakened; loop.md:74-76.
22. B:45-46 re-audit a temporary candidate in a copy of its Markdown tree at the same relative location — an
    instruction to the user, no page states or contradicts it; measure.md:49 names a <REPO> the readers may
    open. Not a claim about the code.
23. B:46-47 same questions, key, entry file, model; else a new measurement — measure.md:108-109 (L1).
24. B:51-52 audit run under the plugin data directory installed, $TMPDIR/terse from a checkout; forbids writing
    into the audited repository — audit/SKILL.md:33-37, 44 (L2). (The formula is ${TMPDIR:-/tmp}/terse; the
    /tmp fallback is unstated, not contradicted.)
25. B:53 rewrite's run there too — rewrite/SKILL.md:66-71 (L2).
26. B:53-54 a code defect goes into code-defects.md in the run and is offered — rewrite/SKILL.md:151-153.
27. B:54-55 copying it into ISSUES.md, or applying the candidate, requires your word —
    rewrite/SKILL.md:153-154, 191-192. Repairs C16.
28. B:55-56 rethink page does not specify where its skeleton is stored — rethink/SKILL.md:70-83; E13.
29. B:60 install Claude Code, sign in, Node 22 or newer on PATH — what-broke.md:48 (L3); package.json:5;
    C20/C21.
30. B:61 Node required installed and from a checkout — C20/C21 (L3).
31. B:66-71 install commands — the four strings verbatim.
32. B:73 this page describes commit 2f29a8f on branch terse-process-2026-09-22 — true at judging (tree
    verified identical); self-dating, goes stale at the next change of the pages.
33. B:73-74 at the 2026-09-22 audit the install commands resolved the marketplace's main at 21a225b — main and
    origin/main are 21a225b (git log, L1); the fetch itself: what-broke.md:47 (Astra, CONFIRMED); the truth
    pass did not fetch (C18). Stated at the level the audit's What broke gives it.
34. B:74-75 21a225b's rewrite page wrote into the document repository without asking — `git show
    21a225b:plugins/terse/skills/rewrite/SKILL.md` 66-67 (run directory in the repository), 112-113 (ISSUES.md)
    (L2).
35. B:75-76 the boundary above describes this checkout, not that revision — follows from 24-27 and 34.
36. B:80-82 not a compressor; length does not select; budgets are reports; figure dated — C23, C24.
37. B:84-85 a candidate that cuts or weakens is vetoed; a writer may reword or correct a false one —
    bake-off.md:113-114, 61-62 (L2). Repairs C27.
38. B:85-86 repetition; dated measurement — writing-rules.md:21-23.
39. B:90 two experiments on 2026-09-10; pilots not rates — 2026-09-10-chain/README.md:1. Repairs C30.
40. B:92-93 one README; no no-document arm; no individual reader records — C30, C44, C31/E7.
41. B:93-94 "Its pages report six questions, one trial per question, with 3/6 … 6/6" — measure.md:3-5, 125-126;
    attributed to the pages (L1), which is C31/C32's level.
42. B:94-96 McNemar 0.25; neither clears a threshold nor separates taught from known — C33 (L3); C44.
43. B:97-98 2×5, four standards, one unpublished draft, control pair, models hidden — v04PR6HL.prompt.txt:13-24.
    Repairs C39.
44. B:98-100 five/one/three/one control to 97 — o8eHzS6U.answer.md:10-19. Repairs C41.
45. B:100-101 one judge put both controls above both entries of the two published standards; the other did not —
    o8eHzS6U.answer.md:3; v04PR6HL.answer.md:3 (P9 7th).
46. B:103 not measured — C43.

### Row 2 — protected passages: FAIL

Failing check (a limit at a decision point cut with no replacement):
- orig:38 "All three skills announce how many agents they are about to spawn, on which model, and wait." (17
  words; C17, level 2 on audit/SKILL.md:86-87, rewrite/SKILL.md:60-62 and 131-132, rethink/SKILL.md:30 and 57)
  is absent from B. Grep of B for announce/spawn/wait/your word finds only B:34 (rethink "waits for your word")
  and B:55 (applying needs your word). B:23-25 (one reader per question, a baseline arm, task readers) and
  B:36-37 (three candidates, two judges) describe the fan-outs with no sentence that they are announced and
  gated on the reader's word. The reader decides to invoke at "What each one does"; the sentence that bounded
  what invoking spends is gone. It was keepable at level 2 (A:66-67 and C:48 keep it); what-broke.md:60's
  "stays at level 2 or is cut" does not override writing-rules.md:21, which rewrite/SKILL.md:212-213 says
  overrides the rest wherever they collide.
- The reading this veto rests on: a page-supported limit on what the tool does when invoked is "a limit where a
  reader decides". If the coordinator reads that phrase as only the reader's own preconditions and consequences
  (files, commands), B passes this row and its other rows stand as scored below.

The four recorded passages themselves are intact:
- orig:42-49 install commands: B:66-71 verbatim; prerequisites replaced at B:60-61.
- orig:11 pipeline: B:14-16 md5 identical; order in words at B:9-11.
- orig:21-22 and :31-36 (Q4): no wording proposed B:28-29; candidate and diff B:40; applying needs your word
  B:54-55.
- orig:53-56 (Q6): "It is not a compressor." and the figure at B:80-82 (date inserted).
Other limits kept: user-invoked B:19; stops for your word B:34; six questions one trial B:93; p = 0.25 not a
threshold B:94-95; "pilots, not rates" B:90 stands in for orig:78-79's "one observation per cell" (14 words).
Cut and judged not to be limits: orig:55-56 (29, untested predictions), orig:27-29 (44, rationale), orig:70-72
(34, a measured finding, not a condition), orig:73-75 (39, same), orig:84-86 (27, refuted).

### Row 3 — failures repaired: 17 of 17

| Item | Repaired | Where |
|---|---|---|
| Q2 (C16, C15 Position) | yes | B:51-56 |
| Q7 missing | yes | B:4-7 at the top |
| C12 | yes | B:38 (stop rule); lens overlap claim absent |
| C13 | yes, by removal | no such claim |
| C20 | yes | B:60-61 |
| C21 | yes | B:61 |
| C27 | yes | B:84-85 |
| C30 | yes | B:90-92, 97 |
| C39 | yes | B:97-98 |
| C41 | yes | B:98-100 |
| C45 | yes, by removal | absent |
| C46 | yes, by removal | absent (no link to prior-art.md remains) |
| C44 Position | yes | B:92-93, before the numbers in the same bullet |
| installed version | yes | B:73-76 |
| Claude login | yes | B:60 |
| truth-pass exclusion | yes, named | B:29-30 |
| re-audit a temporary candidate | yes | B:45-47 |

### Row 4 — prerequisites: 4 of 4, answered where met

authentication B:60 (Install); revision and boundary B:49-56 and B:73-76 (own section, and Install);
exclusion B:29-30 (under audit); temporary candidate B:45-47 (under rewrite); Claude Code and Node B:60-61.

### Row 5 — cuts justified: 5 cuts of twenty words or more, 0 with a reason shown

- orig:27-29, 44 words (rethink's rationale) — absent.
- orig:55-56, 29 words (the two predictions) — absent.
- orig:70-72, 34 words (two failures were lies; README.md:5-9; structural rewrite) — absent.
- orig:73-75, 39 words (clarity self-report bullet) — absent.
- orig:84-86, 27 words (benchmarks; reference files; prior-art link) — absent.
Also: orig:19-21's 32-word list of causes in the reader's words is compressed to the five labels at B:28 (a
replacement, not counted as a cut). No cut ledger reached the judge.

### Row 6 — length: 933 → 960 (+27)

Note outside the rows, with its line: B:73-76 is editing history in the sense of writing-rules.md:12-13 (a
dated statement about another revision); a lens-2 matter for a round, not a veto row.

---

## Sheet C

### Row 1 — new false claims: PASS (44 claims checked, 0 contradict the code, 0 exceed their source's level)

1. C:3-4 measures, then repairs — C01.
2. C:4-6 fresh readers through .md; checks the sentences that say what your software does against its code;
   failure with a line number and a cause — audit/SKILL.md:56 (the ledger's scope in the page's own words),
   89-90, 123. "every claim" is gone (C02); "a line number" is the original's wording, level unchanged (C02
   notes a `missing` failure has no line).
3. C:6 readers get the same brief whatever language your files are in — measure.md:46-60: the brief has
   <ENTRY FILE>, <REPO>, <QUESTION> and no language term (L2).
4. C:6-7 text with no code is audited too, weaker check, not measured — truth-pass.md:73-79.
5. C:9 three skills; none starts on its own — C03, C04 unchanged.
6. C:12-14 pipeline — md5 identical.
7. C:19-24 audit paragraph — C06, C07, C08 unchanged.
8. C:24-25 run file in a run directory outside your repository; report names it; rewrite asks you for it —
   audit/SKILL.md:33-38; rewrite/SKILL.md:29 (L2). Repairs C15 Position for audit.
9. C:27-30 rethink — C09, C10.
10. C:30-32 "on 2026-09-11" a draft abandoned at the third section, nine of nine — rethink/SKILL.md:17-21 (L1;
    the date is added from the page).
11. C:34-36 three writers; two judges on the audit's failures or against the skeleton; winner edited in rounds
    read by the critics you agree to — bake-off.md:106-132; rewrite/SKILL.md:58, 131-132 (L2).
12. C:36-37 lenses that differ (five) — rewrite/SKILL.md:164-175. Repairs C12.
13. C:37 every round is its own file — rewrite/SKILL.md:81 (L1).
14. C:38-39 a round that loses a verified sentence or brings back one found false is made again before its
    critics read it — rewrite/SKILL.md:124-130; ledger.mjs:6-9 (L2; the audit ran the ledger, L3). Repairs C13.
15. C:41 the loop stops when you read a round and say — rewrite/SKILL.md:188.
16. C:41-43 round, diff, cut list, file/line/level behind each claim it checked — rewrite/SKILL.md:190-192,
    205-206; narrower than C14 (L2).
17. C:43 writes into its own run directory — C15.
18. C:43-44 outside your repository; report names it — rewrite/SKILL.md:66-74 (L2).
19. C:44-45 text into your files, or a code defect into your ISSUES.md, needs your word —
    rewrite/SKILL.md:78-79, 153-154, 191-192. Repairs C16.
20. C:45-46 audit again once the text stands where the original stood; readers start at your entry file and
    follow the links — measure.md:36-37 ("following links it finds in the text"), 108 (same entry file) (L2).
21. C:48 announce and wait — C17 unchanged.
22. C:53-58 install commands verbatim.
23. C:58-59 Node scripts; Node on PATH installed or from a checkout; package declares 22 or newer — C20/C21
    (L3); package.json:5.
24. C:60 Claude Code must be logged in for the skills to run — what-broke.md:48 (L3).
25. C:60-61 no npm packages, no configuration file, no other account — C20 "what holds"; rewrite/SKILL.md:147-148.
26. C:65 makes documentation truer and easier to answer from — C22 unconfirmed, unchanged (allowed).
27. C:65-67 not a compressor; figure — C23, C24.
28. C:67-68 the two predictions — C25, C26 unconfirmed, unchanged (allowed).
29. C:70-73 three rules override the rest — rewrite/SKILL.md:212-215; writing-rules.md:21-23 (L1). Repairs C27.
30. C:77-78 two experiments on 2026-09-10 in one repository; chain over its README; bake-off over its prose and
    comments — 2026-09-10-chain/README.md:1, 16; zP378l2j.prompt.txt:13-15. Repairs C30.
31. C:78-80 no no-document arm — C44, now before the numbers.
32. C:82-85 chain bullet unchanged — C31-C33 at their level (allowed).
33. C:86-88 unchanged — C34/C35 at their level; "A structural rewrite would have carried both forward" is
    audit/SKILL.md:133-134's own sentence.
34. C:89-91 unchanged — C36-C38 at their level.
35. C:92-94 four standards named, an unpublished draft, a no-standard control, two agents each, ten, models
    hidden from the two judges — v04PR6HL.prompt.txt:13-24. Repairs C39.
36. C:94-95 the readability judge put both controls above all four Diataxis and house-style entries —
    o8eHzS6U.answer.md:3 (P9 2nd, P10 3rd; P2 5th, P7 7th, P8 8th, P1 10th); o8eHzS6U.prompt.txt:20-25 (the
    readability axis).
37. C:95-97 five/one/three/one, a control — o8eHzS6U.answer.md:10-19. Repairs C41.
38. C:97 the other judge ranked a verification entry first — v04PR6HL.answer.md:3 ("1. P3 — Implementation
    verification").
39. C:97-98 ten agents, one run, one passage — C42.
40. C:100 not measured — C43.
41. C:101-103 no arm (repeated after the bullets) — C44; a repetition, not a contradiction.
42. C:103 the reference files say so where it matters — audit/SKILL.md:94-98; measure.md:70-81 (C46's first
    half, which holds).
43. C:103-105 Code-QA-Bench 0.56 to 0.68 with no document on tasks built to need one; SWD-Bench's no-document
    arm at chance — prior-art.md:104-107 (L1). Repairs C45.
44. C:105-106 prior-art.md records both and summarises an adversarial review — prior-art.md:87-90, 104-107.
    Repairs C46.

### Row 2 — protected passages: PASS

- orig:42-49: C:53-58 verbatim; prerequisites replaced at C:58-61.
- orig:11: C:12-14 md5 identical (no order in words added; C:45-46 says when to audit again).
- orig:21-22 and :31-36 (Q4): C:21-24, C:41-45.
- orig:53-56 (Q6): C:65-68, the whole passage kept including the two predictions.
- Limits kept: none starts on its own C:9; stops for your word C:30; announce and wait C:48; your word for
  files and ISSUES.md C:44-45; Node and login C:58-61; one trial, p = 0.25, pilot C:83-85; one observation per
  cell C:97-98; not measured C:100-103.
- No passage of twenty words or more is absent (see Row 5), so nothing was cut; the refuted sentences were
  corrected in place.

### Row 3 — failures repaired: 16 of 17

| Item | Repaired | Where |
|---|---|---|
| Q2 (C16, C15 Position) | yes | C:24-25, C:43-45 (location "outside your repository"; the lifetime the page adds at audit/SKILL.md:39-42 is not carried) |
| Q7 missing | yes, narrower (readers' brief; text with no code) | C:6-7 at the top |
| C12 | yes | C:36-41 |
| C13 | yes, corrected in place | C:37-39 |
| C20 | yes | C:58-61 |
| C21 | yes | C:58-59 |
| C27 | yes | C:70-71 |
| C30 | yes | C:77-78 |
| C39 | yes | C:92-94 |
| C41 | yes | C:95-97 |
| C45 | yes, corrected in place | C:103-105 |
| C46 | yes | C:105-106 |
| C44 Position | yes | C:78-80 (and repeated at C:101-103) |
| installed version | no line | describes the branch; the finding's first route |
| Claude login | yes | C:60 |
| truth-pass exclusion | yes, by scope wording only | C:4-5 "the sentences that say what your software does" (audit/SKILL.md:56); the exclusion is not named |
| re-audit a temporary candidate | yes | C:45-46 (apply, then audit; links followed from the entry file) |

### Row 4 — prerequisites: 3 of 4 lens-E items, answered where met

authentication C:60 (Install); boundary C:24-25, C:43-45 (under each skill), revision absent; exclusion C:4-5
by scope, not named; temporary candidate C:45-46 (under rewrite); Claude Code and Node C:58-60.

### Row 5 — cuts justified: 0 cuts of twenty words or more

Every original passage of twenty words or more is present or corrected in place; nothing to justify.

### Row 6 — length: 933 → 1215 (+282)

---

## Survivors and winner

- B fails Row 2 (orig:38 cut) and is out under the sheet; A and C survive.
- Failures repaired: A 16, C 16 (each lacks only the installed-version item); B 17.
- A and C tie on the primary row. bake-off.md:136-139: a tie stays a tie and is broken by re-auditing each
  surviving candidate, not by word count and not by the secondary rows; on those rows A names the exclusion
  (A:5-6) where C implies it (C:4-5), and C has no unreasoned cut where A has three.
- If the coordinator reads orig:38 as not a limit at a decision point, B survives and wins 17/17.
- Graftable from B whatever the reading (bake-off.md:141-145): the version paragraph B:73-76 and the
  temporary-candidate recipe B:45-47; from A into C or C into A: A:5-6 (the named exclusion), A:74-76 (the run
  directory's lifetime), C:37-39 (C13 corrected rather than removed), C:103-106 (C45 corrected rather than removed).
