# Lens 2: mechanical rules, water, duplication and contradiction, round 02 (`02-grafts.md`)

Critic: Claude Opus 5.5 (1M), 2026-09-23. Document: `$R/02-grafts.md` (114 lines, 65 sentences, 986 words by
`sections.mjs`). SHA-256 `66cc182c5836688f8994ad59ed6c927a0ea27b730a2072ad66db4c9d2411fec7` at the end of the review. Its size and mtime
(6410 bytes, Sep 23 11:54) were the same at the start. Line numbers are `cat -n` lines of that file. Facts were not checked against code. Not
read, per critic-briefs.md:18-19: `rounds.md`, `ledger.json`, `ledger.02.json`, `reviews/`; nor `grafts.md`
or `edits/`.

- `$R` = `/var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T//terse/runs/20260922-233021-terse-readme`
- `$S` = `/Users/ruliny/Git/agent-skills/plugins/terse/skills/rewrite/scripts`
- `$T` = `/var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/tmp.f1yYhx5BVj` (this report and its helper files)

**Younger decision applied.** skeleton.md:10 (2026-09-23, rounds 01/02) is the only recorded decision.
"Where it writes" exists, sits below "Install" so that rule 1 holds, and its budget (120) is its size at
round 02. I applied it like this. The section is not a structural deviation. The rule-1 cut is `Install`,
as the coordinator set it, so `PATH` (L53), `${TMPDIR:-/tmp}` (L74) and `--keep-data` (L81) all come
after the cut. The section's 0 against its budget holds by construction and is not evidence. Every other
section is read against its size at `1a24018`.

**What "score" means in lens 2.** Words that help none of the seven reader questions (`questions.json`) or
the two tasks (`tasks.json`), and that carry no contract, constraint or reason (writing-rules.md:6-7).

## 1. The mechanical rules

### As run

```
$ node $S/selftest.mjs                                   45 ok, 0 MISS, exit 0
$ node $S/rule1.mjs $R/02-grafts.md --cut "Install" --except "Install"
0 violation(s), 0 excused                                exit 0
$ node $S/dup.mjs $R/02-grafts.md $R/concepts.json
  3   rethink stops at a skeleton    (opening) | What each one does | Where it writes   <<<
1 concept(s) in three or more sections
$ node $S/sections.mjs $R/02-grafts.md $R/budgets.json   exit 0 (a report, not a gate)
```

**Rule 1: clean** as the grep reads it. It is also clean as a person reads it: L1-L49 hold no flag,
header field, exit code, protocol name, environment variable or absolute path. The writing rules, read
as a grep would:

- Capitals for emphasis: clean. The all-caps tokens are README (L3, L98), PATH (L53), TMPDIR (L74),
  ISSUES (L76) and MIT (L114), and none is emphatic.
- Opening with a glossary: clean. L3 opens with the reader's two questions.
- Purpose stated once, at the top: clean (L3-4).
- An argument restated beside its instruction: clean. L45-46 and L82 each carry their reason once.

### Budget

| section | round 02 | budget | diff | where it moved |
|---|---|---|---|---|
| (opening) | 158 | 99 | +59 | new sentences L4-7 (39 words) and L9-11 (42); the rest shrank by 22 |
| What each one does | 303 | 324 | -21 | |
| Install | 108 | 49 | +59 | new L66-69 (47), L53-54 (32), L56 (3); the original's two sentences at 00:48-49 (23) went |
| Where it writes | 120 | 120 | 0 | by construction (skeleton.md:10) |
| What it will and will not do to your text | 106 | 127 | -21 | |
| What was measured | 190 | 309 | -119 | |
| Licence | 1 | 1 | 0 | |
| TOTAL | 986 | 1029 | | 00-original 909, 01-candidate 932; 2 sections over |

With the water items of lens 2 applied, the opening falls to 141 (+42) and Install to 88 (+39). What
remains of both overages is conditions, limits and warnings (see the skipped list in lens 2).

### Findings

**R1. Editing history** (writing-rules.md:12-13), at L66-69. The text is from round 01 and was kept in
round 02.

- L66: "this page describes commit `2f29a8f` on branch `terse-process-2026-09-22`"
- L67-68: "whose rewrite page still wrote into the document repository without asking"
- L69: "describes this checkout, not that published revision"

Check: `grep -n -E "on branch|still|this checkout" $R/02-grafts.md` prints 66, 68 and 69.

The paragraph is also a warning at the install decision and a dated observation ("At the 2026-09-22
audit", L66-67). writing-rules.md:21-23 governs those parts, and the safeguard overrides the other rules
(rewrite SKILL.md:212-215). As applied: the warning, its date and both commits stay. The branch name,
"still" and "this checkout" are what the rule targets. The shorter form is W2.

**R2. A term never defined** (writing-rules.md:15, "Define a term where the reader first needs it"): "the
chain" and its passes.

- L87: "the chain moved 2,725 words to 2,571"
- L88: "the second pass cut 105 words and the third added 105 back"
- L98: "The chain covered one README."
- L110: "which pass produced the reported answer gain"

No line says what the chain is or how many passes it has. 00-original.md:66 said "The four-pass chain".

Check: `grep -n -E "chain|\bpass\b" $R/02-grafts.md` prints 6 (truth pass), 81 (the verb), 87, 88, 98
and 110.

**R3. The same rule: five failure labels.** L27-28: "A wrong answer is classified as refuted, missing,
placement, findability, or harmful." None of the five is defined. "Placement" and "findability" appear
nowhere else and are opaque to a reader who is not an engineer. 00-original.md:19-21 gave each cause in
plain words.

Check: `grep -n -E "placement|findability" $R/02-grafts.md` prints 28 only.

**R4. The same rule: one word for two things.** "Bake-off" at L104 ("A separate bake-off used ten agents
in a 2 × 5 design") names the 2026-09-10 experiment. At L110 ("whether a bake-off beats one careful
pass") it names the limit on rewrite's own step. The page describes that step at L36-37 ("three
whole-file candidates and two judges") without ever calling it a bake-off. So the reader cannot tie the
limit at L110 to rewrite.

Check: `grep -n -E "bake-off|whole-file candidates" $R/02-grafts.md` prints 37, 104 and 110.

**R5. The same rule: one instrument under several names.**

- L23: "a claim ledger"
- L27: "the profile, ledger"
- L29: "Its behaviour ledger excludes"
- L38: "check its ledger" (this one is rewrite's)

The reader cannot tell whether L29's ledger is L23's, or whether rewrite's ledger is audit's. The route is
stage 2 (loop.md:39).

Check: `grep -n "ledger" $R/02-grafts.md` prints 23, 27, 29 and 38.

**R6. METHOD: a hole in the check, not in the document.** rule1.mjs:28, the environment-variable pattern,
misses a bare name and the braced form. Planted, level 3:

```
$ printf 'put Node 22 or newer on `PATH`\nunder `${TMPDIR:-/tmp}/terse` from a checkout\nunder `$TMPDIR/terse` from a checkout\nunless you pass `--keep-data`\n\n## How it works\n\nnothing\n' > $T/planted.md
$ node $S/rule1.mjs $T/planted.md
! line 3  env var        $TMPDIR
! line 4  flag name      --keep-data
2 violation(s), 0 excused                                exit 1
```

Planted lines 1 (`PATH`) and 2 (`${TMPDIR:-/tmp}`) pass unreported.

What this means for this run:

- Round 01's `$TMPDIR/terse` did fire. `node $S/rule1.mjs $R/01-candidate.md --cut Install --except Install`
  prints "! line 52 env var $TMPDIR" and exits 1.
- Round 02's `${TMPDIR:-/tmp}/terse` (L74) would read clean even above the cut. The clean verdict for round
  02 therefore depends on the section's move alone.
- It is harmless for round 02, because both tokens sit after the cut. A later round that moves L53 or
  L73-74 above "Install" would still pass the grep.

The planted rule-1 input at selftest.mjs:13 holds only a flag and a tilde path. The route is
`code-defects.md`.

**R7. METHOD: stale concepts.json.** Five patterns match nothing although the idea is on the page, so the
zeros from dup.mjs are blind rather than clean:

- "claims checked against the code" (`against the code|true of the code|line number`) matches 0. The idea
  is at L4: "whether a document's claims agree with the code behind it".
- "audit never proposes wording" matches 0. The idea is at L28-29: "without proposing wording".
- "nothing written to your files without your word" (`needs your word|without your word|on your word`)
  matches 0. The idea is at L76-77: "requires your word".
- "run directory location" (`run directory`) matches 0. The idea is at L73-82.
- "three skills, user-invoked" reports 1 section and misses L19, "three user-invoked skills".

Check: `node $S/dup.mjs $R/02-grafts.md $T/concepts-widened.json` (13 widened patterns) flags one concept.
That flag is three different facts (see D in lens 3), so the verdict does not change.

## 2. Water

The items are ranked by words saved. Counts split on whitespace, the way sections.mjs counts
(`node $T/wc.mjs`). None of them cuts a condition, a limit or a warning, and each says where the
protected part survives. Total: 58 words.

**W1. L10-11, 13 words.** "Both feed `/terse:rewrite`; audit the candidate again to see whether it held
up." Cut it. The diagram just below (L14-16) already shows both routes into rewrite, the re-audit and
"did it hold". The cut also removes an "again" that row 1 of the diagram (L14, the rethink route) does not
have. Alternative: cut the diagram (34 tokens with its fences) and keep L9-11.

**W2. L66-69, 10 words.** Three changes:

- "Version boundary: this page describes commit `2f29a8f` on branch `terse-process-2026-09-22`." becomes
  "This page describes commit `2f29a8f`." (5 words saved)
- "whose rewrite page still wrote" becomes "whose rewrite page wrote" (1)
- "The outside-repository write boundary below therefore describes this checkout, not that published
  revision." becomes "The section below describes this commit, not that one." (4)

The date, both commits and the warning stay. The change removes the history markers of R1 and the
overstatement in P2.

**W3. L40-42, 7 words.** "The return contract calls for every cut of twenty words or more to have a
reason, and for declared behavioural claims to record their source and evidence." becomes "Every cut of
twenty words or more must carry a reason, and every declared behavioural claim its source and evidence."
It keeps the scope word "declared" and the instruction's force ("must"). It drops the name of an internal
document the reader never meets.

**W4. L74-76, 7 words.** "The `rewrite` instructions create their run there too. They instruct the
agent to record a code defect in `code-defects.md` in the run and offer it to you." becomes "The
`rewrite` instructions put their run there too, with a code defect recorded in its `code-defects.md` and
offered to you." The attribution to the instructions stays.

**W5. L54, 6 words.** "Node is required for an installed plugin and for a source checkout." becomes
"A source checkout needs it too." The installed case is already the condition one sentence up, at L53
("put Node 22 or newer on `PATH`").

**W6. L53, 4 words.** "Before the two install commands," becomes "First". The sentence already stands
before both forms of the command. This rewords the condition without cutting it (writing-rules.md:21; the
README's own L90-91 allows rewording).

**W7. L101, 4 words.** "From those reported counts, three improvements" becomes "Three improvements".
The limit that the counts come from the pages, not from records, is stated in the sentence before, at L99:
"Its pages report".

**W8. L4-5, 4 words.** "The intended scope is Markdown in any language, whether or not the document is
about software." becomes "It is meant for Markdown in any language, about software or not." "Meant"
keeps the limit that "intended" carried.

**W9. L40, 3 words.** "The instructions say to hand over a candidate and its diff from the original."
becomes "It hands over a candidate and its diff against the original." This drops an attribution, and
lens 1 decides whether "the instructions say" is what keeps the claim true. The same framing recurs at
L40 ("The return contract calls for"), L73 ("The `audit` instructions"), L74 ("The `rewrite`
instructions") and L75 ("They instruct the agent"). Meanwhile L23-38 and L48 state behaviour directly, so
a reader may take the attributed claims for the weaker ones.

### Skipped for the safeguard

Each of these is a condition, a limit or a warning at a point where a reader decides.

- **L29-30 (21 words).** "Its behaviour ledger excludes voice and ordering, illustrative examples,
  arguments for instructions, and recipes for tools the repository does not ship." It limits what audit
  checks. It answers none of the seven questions and its decision point is unclear, so the call is the
  coordinator's.
- **L53 (8 words).** "install Claude Code, sign in to it, and". This is a condition at the install
  decision. The reader profile allows the writer to assume Claude Code is installed (audit.md:31-32), which
  would make these words water, but I applied the safeguard.
- **L98 and L102-103: one limit, stated twice.** "The experiment had no no-document arm" is the admission
  the owner named (audit.md:54-55). "nor separates what the text taught from prior knowledge" is the only
  plain wording of what that means. Which copy to keep is the coordinator's call.
- **The rest:** L43 (Q5); L45-46 (re-auditing); L5-7 (text with no code behind it, not measured); L80-82
  (uninstall and purge); L90-92 (what it will not cut, Q6); the core warning at L66-68; and every dated
  number (L87-88, L96, L99-102, L105-108).

## 3. Duplication and contradiction

**D. Duplication.** dup.mjs flags "rethink stops at a skeleton" in three sections: the opening (L14),
"What each one does" (L33, L36) and "Where it writes" (L77-78). This is not a finding. L77-78, "The
`rethink` page does not specify where its skeleton is stored.", carries a different fact: where the file
goes.

With the widened patterns (R7), one more concept is flagged, "your word", in three sections:

- "What each one does": L34 "It then waits for your word", L48-49 "wait for your word"
- "Install": L68 "without asking"
- "Where it writes": L76-77 "requires your word"

These are three different facts: waiting before the work goes on, the published revision writing
without being asked, and approval before a copy or an apply. No fact reaches three sections. The repeats
within a section are water items W1, W5 and W7 and the skipped pair at L98 and L102-103.

### Contradiction pairs

**P1. "Where it writes" against "Install".** Both sides are round-02 text.

- L73-75: "The `audit` instructions create the run under the plugin data directory when installed, ... The
  `rewrite` instructions create their run there too." L76-77: "... applying the candidate to your
  document, requires your word."
- L66-68: "At the 2026-09-22 audit, the install commands resolved the marketplace's `main` at `8c041b7`,
  whose rewrite page still wrote into the document repository without asking."

A reader who types the commands at L58-64 gets the revision that L67-68 describes, and for that revision
L74-75 is false. L68-69 limits the section to "this checkout". But the section's own "when installed"
(L73) and "Installed," (L80) then describe an install the page gives no command for. And the sentence that
limits the section sits in Install, not in L71-82, which is where a reader asking "If I run it, can it
change my files?" (Q2) lands. That is the independently reached decision point where a repeat is allowed
(writing-rules.md:21-22).

Check: `sed -n '58,69p;73,82p' $R/02-grafts.md`

**P2. "Outside-repository" against rethink.** L68 changed in round 02 from "above" to "below".

- L68-69: "The outside-repository write boundary below therefore describes this checkout"
- L77-78: "The `rethink` page does not specify where its skeleton is stored."

The label claims a boundary that the section below establishes for only two of the three skills.

Check: `grep -n -E "outside-repository|does not specify" $R/02-grafts.md` prints 68 and 77.

**P3. The bake-off counts do not add up on the page.**

- L104-105: "ten agents in a 2 × 5 design: four writing standards, one an unpublished draft, and one
  unguided control condition with two agents"
- L107-108: "One judge put both controls above both entries for the two published standards"

Four standards less one unpublished draft leaves three. L108 names two published ones, and the page
never says what the third is. And with two agents per condition, two standards have four entries, not
the two that "both entries" implies.

Check: `sed -n 104,108p $R/02-grafts.md`

**P4. Weak: "vetoed" against "not a promise".**

- L90: "A candidate that cuts or weakens a condition, limit, or warning where a reader decides is vetoed."
- L43: "That guard is not a promise that no regression can occur."

L90 reads as a guarantee and names no mechanism. The one mechanism the page does name (L42) is declared
not to be a guarantee. The two reconcile only if a judge applies the veto, and the page does not say so.

Check: `sed -n '42,43p;90p' $R/02-grafts.md`

**P5. Weak, and it depends on R3: "excludes ordering" against "placement".**

- L29: "Its behaviour ledger excludes voice and ordering"
- L28: "A wrong answer is classified as refuted, missing, placement, findability, or harmful."

If "placement" means where a sentence sits (00-original.md:20, "the true sentence sat where it
misleads"), then audit does report ordering failures. The ledger and the classification are different
instruments, but the page does not say so. Defining "placement" (R3) will bring this pair into view.

Check: `sed -n 27,30p $R/02-grafts.md`

**X1. Outside the document: the README's bake-off numbers against writing-rules.md, a page of the same
plugin.** The README's numbers changed in round 01; 00-original.md:76-78 carries the numbers that
writing-rules.md still has. Which set is right is a question of fact, for lens 1.

- Standards: writing-rules.md:37 "put five writing standards against two unguided controls", against L104
  "four writing standards, one an unpublished draft, and one unguided control condition with two agents".
- Verdict: writing-rules.md:38-39 "Both controls beat both entries of both published standards.", against
  L107-108 "One judge put both controls above both entries for the two published standards; the other did
  not."
- Counts: writing-rules.md:39-40 "seven of the ten proposed nothing at all, two produced a longer text",
  against L106 "five agents proposed no change, one changed punctuation only, three made it longer".

Check: `sed -n 37,40p /Users/ruliny/Git/agent-skills/plugins/terse/skills/rewrite/references/writing-rules.md; sed -n 104,108p $R/02-grafts.md`

### Scope-word claims with no counter-sentence found

I searched 02-grafts.md only, with `grep -n -i -o -E
"\b(nothing|never|only|always|by default|every|all|none|no|not|any|without|cannot|alone|forbid|requires|excludes|unless|vetoed|rejects)\b"`,
which matched 30 lines. No sentence elsewhere on the page says these can happen:

- L5 "Markdown in any language"
- L24 "may open only Markdown"
- L28-29 "without proposing wording"
- L41 "every cut of twenty words or more"
- L42 "rejects a new round that loses a pinned sentence" (L43 qualifies it)
- L48 "All three skills announce"
- L74 "forbid writing into the audited repository"
- L80 "unless you pass `--keep-data`"
- L86 "Length does not select a candidate" and "reports rather than gates"
- L92 "A dated measurement keeps its date and numbers"
- L98 "no individual reader records" (L99-100 give reported counts, not records)
- L110 "Not measured"

## Evidence

**Read:**

- `$R`: 02-grafts.md (114 lines), 00-original.md (90), 01-candidate.md (through a diff: 6 hunks),
  skeleton.md (1 decision), budgets.json (7 keys), concepts.json (19), questions.json (7), tasks.json (2),
  audit.md:1-61 and :855-1010
- The rewrite skill: writing-rules.md (51 lines), SKILL.md, critic-briefs.md, loop.md
- rethink/references/stages.md:240-320
- The scripts rule1.mjs, dup.mjs, sections.mjs and selftest.mjs

**Ran:**

- selftest.mjs, 3 times: 45 ok, 0 MISS, exit 0
- rule1.mjs, 4 times: on 02, 0 violations (exit 0); on 01, 1 violation (exit 1); on 02 with the cut moved,
  1; on the planted file, 2 of 4 caught
- dup.mjs, 2 times: 19 concepts, 1 flag; 13 widened, 1 flag
- sections.mjs, 3 times: 909, 932 and 986 words
- greps: editing history, capitals, bold, fences, 25 terms, scope words
- A sentence splitter (`$T/sent.mjs`, 65 sentences) and a word counter (`$T/wc.mjs`, 17 phrases)

## Open

- Facts were not checked against code, because that is lens 1's job. This covers which set of numbers in
  X1 is right, and whether `${TMPDIR:-/tmp}/terse`, `2f29a8f` and `8c041b7` are correct.
- The ledger was not read, by design, so I cannot say whether a water cut removes a pinned sentence. W2 and
  W5 touch sentences that a correction may have pinned. Run ledger.mjs on any round that applies them.
- The content rules in stages.md were not applied, because no skeleton on this route adopts them. Rule 10
  would flag both fences at L13 and L58 as untagged, and the fenced block as holding the in-app form while
  the shell form is in prose (L63-64). Rule 2 would flag the warnings in the sections read first (L5-7,
  L42-43).
- Jargon a reader who is not an engineer meets ("return contract", "gates", "arm", "adversarial read",
  "pinned") belongs to the curse-of-knowledge pass, not to this lens.
- Nothing outside `$TMPDIR` was written. selftest.mjs made its own `mkdtemp` directories under `$TMPDIR`.
