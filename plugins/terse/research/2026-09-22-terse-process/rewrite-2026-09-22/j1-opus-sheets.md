# Opus J1: judging sheets for the terse README bake-off, candidates A, B, C

Code judged: commit 2f29a8f. `git diff 2f29a8f -- plugins/ .claude-plugin/` is empty against HEAD 214fb0d, whose only change is ISSUES.md. Between the audit's 1a24018 and 2f29a8f only the audit and rewrite SKILL.md pages, loop.md and the CHANGELOG changed (ef69fdf, 9efef3d, 3b71b62), so the scripts the audit ran at level 3 are the ones judged here. Ground truth: audit.md "Claim ledger" (46 entries), the Questions and answer key, the Open section, and candidates/what-broke.md. Line numbers are `cat -n` of each candidate. "orig N" is a line of 00-original.md, which is byte-identical to README.md at 2f29a8f.

Not supplied: the writers' cut ledgers and prerequisite inventories. Row 5 is therefore judged by whether a reason for each cut of twenty words or more can be derived from the audit or the brief. Row 4 is judged against the inventory below, which I assembled from What broke and the audit.

## The measured failures (row 3), 19 items

1 Q2 (C16 refuted: what needs your word). 2 Q7 missing (any language, any text). 3 Task TB harmful: its source is rewrite/SKILL.md, repaired there by ef69fdf; the README's part is to state the boundary. 4 C12. 5 C13. 6 C20. 7 C21. 8 C27. 9 C30. 10 C39. 11 C41. 12 C45. 13 C46. 14 C15 Position (where the run directory is). 15 C44 Position. 16 L3: the install revision. 17 L3: the Claude login. 18 L3: what the truth pass excludes (truth-pass.md:61-71). 19 L3 (plausible): re-auditing a candidate with its links intact.
R = repaired at the source line; Rdel = repaired by deleting the refuted sentence rather than correcting it.

## The prerequisite inventory (row 4), 9 items

I1 Claude login. I2 node on PATH on both routes, in the setup paragraph (curse-of-knowledge.md:33-34). I3 installed revision and write boundary. I4 what the truth pass excludes. I5 re-audit with links intact. These four are L3 lens E. I6 which skill to run first; the audit key says the README "answers it by inference only". I7 how a skill is invoked; forced guess of both task readers. I8 the permission prompts for writes (TA forced guess; ISSUES.md E11). I9 vocabulary defined where first met (writing-rules.md:15-16; the profile: "NOT NECESSARILY AN ENGINEER").

---

## Sheet A

### Row 1, new false claims (veto): FAIL
- **A:57-58, refuted at level 3.** "each claim its edits add carries a check that is run". round.mjs:66-67 skips every edit that declares no claims. My run: an edit adding "and deletes nothing" with no `claims` wrote 01-x.md, exit 0, ledger `[]`. Audit C14 (probe/round) found the same. A itself uses "claims" at A:9 for statements in the text, so the reader takes "each claim" as every behavioural sentence a round adds. This re-asserts C14's unconfirmed guarantee, which the brief says must not be strengthened. The second half ("a check that finds nothing refuses the round") holds: round.mjs:89-92.
- A:4, overstated (minor). "fresh model agents that have never seen your project". "Fresh" holds (measure.md:30-31). "Never seen" is the brief's premise (measure.md:47), and the no-document arm exists because a reader may already know the subject (audit/SKILL.md:94-98).
- A:71, tension (minor). "`/terse:audit` writes nothing into your repository" matches audit/SKILL.md:44 and the Q2 key. measure.md:117-121 lets a score be stored there on the user's word.
- Checked and holding, 53 claims:
  - A:3-6 (C01; audit/SKILL.md:56; truth-pass.md:61-71; :123).
  - A:8-9 (no language condition in measure.md:46-60; audit/SKILL.md:26-27; truth-pass.md:73-80).
  - A:11 (C03 L3; disable-model-invocation; C04 retained).
  - A:19-21 (rethink/SKILL.md:6; measure.md:106-109).
  - A:25-31 (commands unchanged).
  - A:33-36 (C20/C21 L3 exit 127; L3 "Not logged in"; package.json:4-6; bake-off.md:26-27; rewrite/SKILL.md:147-148).
  - A:40-46 (C06, C07; audit/SKILL.md:94-100, 149-151, 153; C08 retained).
  - A:48-51 (C09, C10).
  - A:53-56 (bake-off.md:44-49, 106-132).
  - A:58-60 (ledger.mjs:6-9, 22, self-test; rewrite/SKILL.md:164-175).
  - A:60-64 (rewrite/SKILL.md:188-209; ledger-seed.mjs:61-62; round.mjs:112-117; retire entries carry no level, round.mjs:118, minor).
  - A:66-67 (C17 retained).
  - A:71-76 (rewrite/SKILL.md:29, 66-79, 149-154; audit/SKILL.md:33-44; `claude plugin uninstall --help` 2.1.280 lists --keep-data).
  - A:78 (C10).
  - A:82-84 (C23, C24; sections.mjs:4, 25; self-test).
  - A:86-90 (writing-rules.md:6-10, 21-23; bake-off.md:60-62, 108-114).
  - A:92-94 (loop.md:137-139; self-test all caught, exit 0). My rule1.mjs probes: English "exits 2" flagged, Russian "завершается с кодом 2" missed, the path flagged in both.
  - A:98-122 (C30 sources; C44; C31-C38 retained or attributed; measure.md:20-21; E7; v04PR6HL.prompt.txt:13-24; J2 o8eHzS6U.answer.md:3 ranks P9 2, P10 3 against P2 5, P7 7, P8 8, P1 10; J1 v04PR6HL.answer.md:3 ranks P10 3 against P7 4, P2 6, P8 9, P1 10, with P9 7; J2's 116-word counts P1-P10; C42, C43; prior-art.md:87-126).

### Row 2, protected passages (veto): pass
- Commands A:25-31 and pipeline A:14-16 are verbatim.
- What audit returns, A:43-45, is verbatim.
- The hand-over with the word, A:60-64, is kept and repeated at A:71-72.
- "It is not a compressor" and the figure, A:82-83, are verbatim.
- C22, C25 and C26, all unconfirmed, were cut from inside the protected span orig 53-56. The key's elements (C23, C24) remain, and C23 is made explicit at A:83-84.
- No condition, limit or warning was cut. The size warnings stay at A:101, 105-107 and 118.

### Row 3, failures repaired (primary): 19/19
- 1 R A:63-64, 71-72.
- 2 R A:8-9, with the exception at A:92-94.
- 3 R A:71-76.
- 4 R A:55-56, 59-60, 63.
- 5 Rdel (orig 34-35 removed).
- 6 R A:33-35.
- 7 R A:33-34.
- 8 R A:86-90.
- 9 R A:98-99.
- 10 R A:113-114.
- 11 R A:116-118.
- 12 Rdel (orig 84).
- 13 R A:121-122.
- 14 R A:73-76.
- 15 R A:99-101.
- 16 R: states the branch, the finding's first option, which the release makes true.
- 17 R A:33.
- 18 R A:5-6.
- 19 R A:20-21.

### Row 4, prerequisites (secondary): 7.5/9
- Answered: I1 A:33. I2 A:33-34. I4 A:5-6. I5 A:20-21. I6 A:19-20 and A:45-46. I7 A:11. I9: the passes at A:54-55, the levels at A:62-63, the control question at A:104-105.
- I3 half: the boundary is at A:71-76; the revision is not named.
- I8 nowhere.

### Row 5, cuts justified (secondary): 3 of 4 have a derivable reason
- The rethink origin, orig 27-29 (44 words): writing-rules.md:9-10, since the case lives in rethink/SKILL.md:17-21.
- C22, C25, C26 at orig 53, 55-56 (38 words): unconfirmed.
- C12 and C13 at orig 32-35 (46 words): refuted, replaced at A:55-63.
- C45 plus "The reference files say so where it matters", orig 84-85 (20 words): C45 is refuted, but the held half of C46 went with no reason.

### Row 6, length: 933 to 1389 words (wc -w). sections.mjs: 909 to 1359. Out on row 1.

---

## Sheet B

### Row 1, new false claims (veto): pass. 47 claims checked, none contradicted.
- B:3-7 (C01/C02; the profile's intent, audit.md:20-22; truth-pass.md:73-80).
- B:9-11 (rethink/SKILL.md:6; measure.md:106-109).
- B:19 (C03).
- B:23-30 (audit/SKILL.md:46-131, 153-164; ledgers.md:113-114; truth-pass.md:61-71).
- B:32-34 (rethink/SKILL.md:13-83).
- B:36-38 (rewrite/SKILL.md:54-58, 119-124, 179-188). This is the weakest line: lenses 4 and 5 may be sized to zero in a round (rewrite/SKILL.md:131-133). It is true of the gate (:179-186), and it carries no guarantee word.
- B:40-43 (rewrite/SKILL.md:190-209; ledger.mjs:6-9, 22; self-test; loop.md:74-76).
- B:45-47 (measure.md:36-37, 49, 106-109; the recipe is untested but not contradicted).
- B:51-56 (audit/SKILL.md:33-44; rewrite/SKILL.md:66-71, 149-154, 191-192; C10).
- B:60-61 (L3 login; C20/C21 L3; package.json:4-6).
- B:73-76 (What broke L3 CONFIRMED; `git show 8c041b7` rewrite/SKILL.md:66 and :113 write into the repository).
- B:80-86 (C23, C24; bake-off.md:47, 60-62, 108-114; writing-rules.md:21-23).
- B:90-103 (C30, C44, C31-C33 attributed "Its pages report"; E7; v04PR6HL.prompt.txt:13-24; the judges' answers as in Sheet A; C43). The unconfirmed C08, C14, C28, C29 and C40 are reworded and none is strengthened.

### Row 2, protected passages (veto): pass, with two risks
- Commands B:65-71, pipeline B:14-16, and the compressor sentence with the figure B:80-82 are kept. B:63 adds "Inside Claude Code:".
- Risk 1, a hypothesis, not counted as damage without a re-audit: the word-gate for applying the candidate moved out of the hand-over (B:40) to B:54-55. audit/SKILL.md:146-147 warns against moving a fact from where it was read correctly.
- Risk 2: B:92-95 keeps the dated chain measurement and drops two of its numbers ("readers leaving … one to zero, … broke neither control question", orig 66-67). This conflicts with writing-rules.md:22-23 (safeguard 3), which is outside the wording of this row.
- C17 is cut (orig 38, 17 words). It is a reassurance, not a condition addressed to the reader.

### Row 3, failures repaired (primary): 19/19, three of them by deletion
- 1 R B:54-55.
- 2 R B:4-5.
- 3 R B:51-55.
- 4 R B:36-38.
- 5 Rdel.
- 6 R B:60-61.
- 7 R B:61.
- 8 R B:84-85.
- 9 R B:90, 92, 97.
- 10 R B:97-98.
- 11 R B:98-100.
- 12 Rdel.
- 13 Rdel (the prior-art link is gone too).
- 14 R B:51-53.
- 15 R B:92.
- 16 R B:73-76, the explicit option.
- 17 R B:60.
- 18 R B:29-30.
- 19 R B:45-47.

### Row 4, prerequisites (secondary): 6.5/9
- Answered: I1 B:60. I2 B:60-61. I3 B:49-56, 73-76. I4 B:29-30. I5 B:45-47. I6 B:9-11.
- I7 half: only the install gets "Inside Claude Code" (B:63).
- I8 nowhere.
- I9 fails: terms are undefined at first use. "truth pass" and "guarantee-shaped claims" at B:6. "claim ledger" and "answer key" at B:23. The five cause names at B:28, which replace the plain meanings of orig 19-21. "pinned" and "retired" at B:42-43.

### Row 5, cuts justified (secondary): 5 of 7 have a derivable reason
- With a reason:
  - The rethink origin (44 words).
  - C22, C25, C26 (38 words).
  - C12 and C13 (46 words).
  - The lies bullet, orig 70-72 (34 words): unconfirmed C34/C35, though a dated measurement.
  - The clarity bullet, orig 73-75 (38 words): unconfirmed C36-C38.
- No derivable reason:
  - The plain meanings of the five causes, orig 19-21 (32 words; C07 is confirmed).
  - The C45/C46 tail with the prior-art link, orig 84-86 (27 words). C45 and C46 are refuted, but the held half of C46 and the link went with no reason.

### Row 6, length: 933 to 960 words (wc -w). sections.mjs: 909 to 932.

---

## Sheet C

### Row 1, new false claims (veto): pass. 50 claims checked, none contradicted.
- C:3-7 (C01; audit/SKILL.md:56; measure.md:46-60; truth-pass.md:73-80).
- C:9 (C03; C04 retained).
- C:12-14, 19-25 (C05-C07; C08 retained; audit/SKILL.md:33-38; rewrite/SKILL.md:29).
- C:27-32 (C09, C10; rethink/SKILL.md:17-21; stages.md:38-43 dates it 2026-09-11).
- C:34-39 (bake-off.md:106-132; rewrite/SKILL.md:58, 81, 124-133, 164-175; round.mjs:54 and the self-test "round refuses to overwrite a round"; audit C13 probe/lifecycle, level 3).
- C:41-46 (rewrite/SKILL.md:66-79, 153-154, 188-209; measure.md:36-37, 106-109).
- C:48 (C17 retained).
- C:53-61 (commands verbatim; C20/C21 L3; L3 login; C20 "what holds").
- C:65-68 (verbatim; C22, C25, C26 retained, not strengthened).
- C:70-73 (rewrite/SKILL.md:212-215).
- C:77-106 (C30 sources; C44; C31-C38 retained; v04PR6HL.prompt.txt:13-24; o8eHzS6U.prompt.txt:6 is the readability axis; the judges' answers as in Sheet A, J1 P3 first; C42, C43; prior-art.md:87-126 and 104-107, level 1 since the papers themselves were not read).
- Retained unconfirmed wording: "a failure arrives with a line number" (C:5-6, C02). A `missing` failure has none. This is kept at its level and not a new claim.

### Row 2, protected passages (veto): pass
- Commands C:53-58 and pipeline C:12-14 are verbatim.
- What audit returns, C:21-24, is verbatim.
- The hand-over with the word, C:41-45, is kept.
- The compressor sentence with the figure, C:65-67, is verbatim.
- The safeguards are stated at C:70-73. No limit or size warning was cut.

### Row 3, failures repaired (primary): 19/19, none by deletion
- 1 R C:44-45.
- 2 R C:6-7.
- 3 R C:43-45.
- 4 R C:35-37, 41.
- 5 R C:37-39.
- 6 R C:58-61.
- 7 R C:58-59.
- 8 R C:70-71.
- 9 R C:77-78.
- 10 R C:92-94.
- 11 R C:95-97.
- 12 R C:103-105.
- 13 R C:105-106.
- 14 R C:43-44.
- 15 R C:78-80, repeated at C:101-103 (audit/SKILL.md:143-147).
- 16 R: states the branch, the first option.
- 17 R C:60.
- 18 R by scope, C:4-5. "the sentences that say what your software does" is the scope of audit/SKILL.md:56. The exclusion itself is not stated.
- 19 R C:45-46.

### Row 4, prerequisites (secondary): 5.5/9
- Answered: I1 C:60. I2 C:58-59. I5 C:45-46.
- Half each:
  - I3: the boundary is at C:24-25, 43-45; the revision is not named.
  - I4: implicit only, C:4-5.
  - I6: only by the pipeline, C:12-14, as the original.
  - I7: "You invoke" at C:9.
  - I9: the plain cause meanings are kept at C:21-23; "control question" at C:83 and "lenses" at C:36 are undefined.
- I8 nowhere.

### Row 5, cuts justified (secondary): no cut of twenty words or more without a reason
Every removal replaces a refuted or unconfirmed sentence:
- orig 32-35 by C:34-39
- orig 47-49 by C:57-61
- orig 58-60 by C:70-73
- orig 64 by C:77-80
- orig 76-79 by C:92-98
- orig 84-86 by C:103-106

### Row 6, length: 933 to 1215 words (wc -w). sections.mjs: 909 to 1191.

---

## Survivors and winner

B and C survive. A is out on row 1 (A:57-58).

By failures repaired it is a tie, B 19/19 and C 19/19. The tie stays a tie: bake-off.md:136-139 says to break it by re-auditing both surviving candidates. The secondary rows split the other way from each other:
- Prerequisites: B 6.5, C 5.5.
- Cuts justified: C clean, B has two cuts with no derivable reason.
- Length: B 960, C 1215 (never selects).

Two readings would break the tie:
- If a refuted claim deleted counts for less than one corrected, C leads: 0 deletions against B's 3.
- If item 18 requires the exclusion to be written out, B leads: C drops to 18.5.

If A's veto falls, all three tie at 19.

The seeded ledger, run over the candidates:
- All 11 refuted entries are absent from A, B and C.
- Confirmed sentences reworded: A 2 (C15, C44), B 13, C 0. The brief allows rewording confirmed entries, so this is a check, not a score.
