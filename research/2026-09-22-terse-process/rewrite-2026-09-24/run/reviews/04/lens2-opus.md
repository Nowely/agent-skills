# Opus lens 2, round 04: the mechanical rules, the water, duplication and contradiction

## Files and decisions applied

- R = `$TMPDIR/terse/runs/20260924-002235-terse-readme-rewrite2`;
  S = `~/Git/agent-skills/plugins/terse/skills/rewrite/scripts`;
  T = `$TMPDIR/lens2-r4-opus` (plants and helpers, all listed at the end).
- Document: `R/04-shape.md`, 82 lines.
- Rules: `R/skeleton.md` (skeleton 03), parts 2, 3, 4 and 7; `R/budgets.json` and `R/concepts.json`;
  `plugins/terse/skills/rewrite/references/writing-rules.md` lines 6–25. The two JSON files equal part 3's
  blocks: `node T/cmp.mjs R` → `concepts.json == skeleton part 3 concepts: true`,
  `budgets.json == skeleton part 3 budgets: true`.
- The agreement line: taken from the coordinator's note (skeleton 03, agreed 2026-09-24). `R/rounds.md` was not
  opened, because the brief forbids it. The other forbidden paths were not opened either: `R/reviews/` (this file
  is written there), `R/ledger*.json`, `R/edits/`, `R/code-defects.md`, `R/cuts.md`. `R/00-original.md` was
  read, and no finding rests on it.
- Where rules collided, and which one I applied:
  1. **Rule 1's command.** The brief adds `--except "Quick start"`. skeleton.md:212 says "No `--except`". I applied
     the skeleton, since the coordinator says part 3 gives the rules and the cut heading. I ran both forms: on this
     round they print the same thing, and they differ only on a planted path (M4).
  2. **The chains of commands.** skeleton.md:113 excludes "the commands again in prose" from Quick start.
     skeleton.md:141–142 gives the chains of commands one home, the Workflow block, and skeleton.md:205–206
     counts "the chains in the Workflow block" in. I applied the Workflow home, so L40–43 are not charged.
  3. **"text" versus "document".** skeleton.md:285 says "text (the mission) and document (the unit)", but the
     section devices themselves use "the text" for the reader's document (skeleton.md:124–125, 144, 155, 187–188).
     I applied the devices. No grep can separate the two senses, so nothing is charged.
  4. **The length.** skeleton.md:380 leaves the length to the owner, with 645 as the default. skeleton.md:248–249
     says an overrun is a question answered in skeleton.md, and no answer is there. The budgets stand.

## Lens 1: the mechanical rules

### The checks as shipped

```
$ node S/rule1.mjs R/04-shape.md --cut "How it works" --except "Quick start"
0 violation(s), 0 excused                      exit 0
$ node S/rule1.mjs R/04-shape.md --cut "How it works"
0 violation(s), 0 excused                      exit 0
$ node S/dup.mjs R/04-shape.md R/concepts.json
  2   consent — Quick start, Checks and guarantees Quick start | Checks and guarantees
  2   the plugin's own folder — Quick start, Checks and guarantees Quick start | Checks and guarantees
  1   agents announced, then it waits — Quick start Quick start
  1   every word carries weight — opening (opening)
  1   not a compressor — opening     (opening)
  1   the scope — Quick start        Quick start
  2   what a report holds — Quick start, Skills Quick start | Skills
  1   you start each one — Skills    Skills
  1   back to audit — Quick start    Quick start
  2   a fix is not undone — How it works, Checks and guarantees (opening) | Checks and guarantees
  1   condition, limit, warning — Checks and guarantees Checks and guarantees
  2   AI readers — How it works, Checks and guarantees How it works | Checks and guarantees
  1   answer key; without your text — How it works How it works
  1   claims against the code — How it works How it works
  1   the five causes — How it works How it works
  2   best practices; documents like yours — opening, How it works (opening) | How it works
  2   writers, judges, reviewers — How it works Quick start | How it works
  2   the diff — Quick start, Skills Quick start | Skills
  1   where the methods come from — Checks and guarantees Checks and guarantees
  1   a person — Checks and guarantees Checks and guarantees
  1   Node — Quick start             Quick start

0 concept(s) in three or more sections       exit 0
$ node S/sections.mjs R/04-shape.md R/budgets.json
   65 / 70   -5   (opening)
  246 / 190  +56   Quick start
  123 / 110  +13   Skills
  164 / 115  +49   How it works
  190 / 160  +30   Checks and guarantees
  788 TOTAL, 4 section(s) over budget        exit 0
$ awk '/^## /{b=""} /^### /{b=$0;next} b&&NF{w[b]+=NF} END{for(k in w)print w[k]"\t"k}' R/04-shape.md
206	### Workflow
17	### Update
17	### Install
```

| Section | Words | Budget | Difference |
|---|---|---|---|
| (opening) | 65 | 70 | −5 |
| Quick start | 246 | 190 | +56 |
| › Install | 17 | 26 | −9 |
| › Workflow | 206 | 140 | +66 |
| › Update | 17 | 18 | −1 |
| Skills | 123 | 110 | +13 |
| How it works | 164 | 115 | +49 |
| Checks and guarantees | 190 | 160 | +30 |
| Total | 788 | 645 | +143 |

### Findings

**R1. Budgets (rule 4, skeleton.md:246–249).** Four sections are over budget: Quick start +56, Skills +13, How
it works +49, Checks and guarantees +30. The total is 788 against 645 (+143), and the Workflow block is 206
against 140 (+66). Evidence is in the output above. skeleton.md:248–249 says "An overrun is a question to the
owner, answered in this file", and skeleton.md holds no answer for this round.

**R2. Rule 3 passes only because L68 paraphrases the concept "a fix is not undone".** The concept list homes it
in How it works and Checks and guarantees. As the pattern reads this round, it sits in the opening and is absent
from How it works. `node T/homes.mjs R/04-shape.md R/concepts.json` prints
`found in: (opening) | Checks and guarantees; outside its named homes: (opening); named home not found: how it works`.
L68 says "a round refused if it silently loses a checked sentence", where skeleton.md:160 says "a round refused
if it loses a sentence checked true". With the skeleton's wording, dup.mjs flags the concept in three sections
(plant p1, M1). The third section is L3 "touching it may make it worse", which the concept's pattern
(`make it worse`) counts.

**R3. Rewrite's internals appear in Quick start.** L24 says "rewrite does so before its writers and judges, and
before a round's reviewers". Three rules forbid this:
- skeleton.md:114 excludes "what happens inside a skill (2.4)" from Quick start.
- Rule 6.3 (skeleton.md:266) allows "technical detail only at or after How it works".
- The concept "writers, judges, reviewers — How it works" is found in `Quick start | How it works` (dup row
  above; homes.mjs prints `outside its named homes: Quick start`).

dup.mjs lets it through because the concept is in only two sections.

**R4. "reviewer" is not introduced in its required form.** skeleton.md:290 requires the first use to read
"AI reviewers, each checking one thing". `grep -n -o -i 'reviewers\?'` finds 24, 67, 68, so the first use is
L24 "a round's reviewers". `grep -c -F 'each checking one thing'` returns 0. L68 has "AI reviewers, each from its
own angle".

**R5. The opening omits "the README first".** The 2.1 purpose (skeleton.md:99–100) asks for "any text, the
README first". `sed -n 3p R/04-shape.md | grep -c README` returns 0. L3 has "assessing and improving any text"
and nothing after it.

**R6. Rewrite's claim check is missing.** The 2.4 purpose (skeleton.md:159) lists "each new claim checked
against the code" for rewrite. `sed -n 68p R/04-shape.md | grep -c 'against the code'` returns 0. L68 has "each
claim with a check that runs". The page's only "against the code" belongs to audit, at L66.

**R7. The guarantee lead-in has the wrong label.** skeleton.md:184 requires "Two bold lead-ins: **Guaranteed**
— …". `grep -c '\*\*Guaranteed' R/04-shape.md` returns 0, and L80 opens with "**What the skills promise:**".
W3 fixes the same line.

**R8. The refusal gains a condition the skeleton does not have.** The skeleton states it unconditionally:
skeleton.md:160 "a round refused if it loses a sentence checked true", and skeleton.md:186–187 "a round that
loses a sentence an earlier round checked true, or brings back one found false, is refused".
`grep -c -i silently R/skeleton.md` returns 0. The round adds "silently" twice: L68 "a round refused if it
silently loses a checked sentence", and L80 "A round that silently loses a sentence checked true, or repeats one
found false, is refused before you see it." The word narrows a guarantee at the point where a reader decides
whether to trust it. Whether the code refuses only silent losses is for the fact lens.

**R9. The scope sentence departs from the device.** The Workflow device (skeleton.md:121–122) asks for "the
Markdown files to check, named one by one or as a folder (every tracked `.md` by default)", and part 4
(skeleton.md:305) asks for "Markdown once, as the scope fact". `grep -c Markdown` returns 0, and
`grep -c -E 'one by one|as a folder'` returns 0. L24 says "which files to check, every tracked `.md` by
default".

**R10. The Skills row drops "beside the reader's".** The Skills device (skeleton.md:147) says "a new draft of
the whole document beside the reader's, and its diff". `grep -c beside` returns 0, and L60 says "A new draft of
the whole document, and its diff". This row is read without Quick start, and only L32 and L80 say the draft
does not replace the reader's document.

**R11. Workflow order.** The Workflow device (skeleton.md:121–123) orders "the scope …; `/terse:audit` in a
`text` fence". In the round the fence comes first (L20–22), and the scope sentence follows at L24 ("It asks for
the scope").

**R12. The content rules' origin departs from the device.** The 2.5 device (skeleton.md:180) says "one owner's
changes to one document". L75 says "What one owner changed on his documents", and `grep -c 'one document'`
returns 0. Whether it was one document or several is for the fact lens.

### Clean

- Rule 1: both forms print `0 violation(s), 0 excused`.
- Rule 2: `grep -n '^#'` prints `1:# terse`, `5:## Quick start`, `7:### Install`, `16:### Workflow`,
  `45:### Update`, `54:## Skills`, `64:## How it works`, `70:## Checks and guarantees`, and nothing else.
- Rule 3 as shipped: `0 concept(s) in three or more sections` (see R2, M1–M3).
- Rule 5: the fences are L9 `bash`, L20, L28 and L36 `text`, and L47 `bash`. `grep -c '/plugin'` returns 0.
- Rule 6:
  - Item 1: `grep -c '?'` returns 0.
  - Item 2: the dup rows put consent, the plugin's own folder and the announced agents outside the opening.
  - Item 4: `grep -c -w PATH` returns 0; L14 is one line.
  - Items 5 and 6: L7 and L45 are each followed by a blank line and then a `bash` fence (L9, L47).
  - Items 7 and 8: `grep -c '^>'` returns 0.
  - Item 9: the two tables have different rows.
  - Item 11: the unless/only-if grep outside the fences returns 0.
  - Item 3 fails: see R3.
- Rule 7:
  - The words grep, run outside the fences, prints nothing (exit 1). BSD grep and the shell's ugrep agree.
  - The pipeline awk prints nothing, and the `[a-z]+ readers?` grep minus `ai|your` prints nothing.
  - Required phrases are present: "until you say so" 2, "rounds of edits" 2, "documents like yours" 1, "AI
    reviewers" 2, "### Workflow" 1.
  - First uses: `skeleton` first at L34, which holds "outline"; `shape` first at L26, which holds "order";
    `diff` first at L32, which holds "change"; `AI reader` first at L66, as "fresh AI reader".
  - `terse` appears only in the H1 and the commands.
  - Every must-use term is present except the form of "reviewer" (R4).
- Whole page: `###` appears only under Quick start, and bold only at L66–68, L80 and L82. There is no image, no
  rule line, and no non-ASCII symbol other than — and →.
- Writing rules, as far as a grep can read them: no editing-history marker (exit 1). The capitals are AI, README
  and SKILL (an acronym, a name and a link path), none of them for emphasis.
- Quick start exclusions: `commit`, `version`, `/plugin`, "nothing else", `dependenc` and "where the Markdown
  files are" each return 0.

### What the checks miss

**M1. dup.mjs matches one wording per concept, so paraphrases escape it.**

- Plant p1 rewrites L68 in skeleton.md:160's words:
  `sed 's/a round refused if it silently loses a checked sentence/a round refused if it silently loses a sentence checked true/' R/04-shape.md > T/p1-checked-true.md`.
  Running dup.mjs with `R/concepts.json` then prints
  `3   a fix is not undone — How it works, Checks and guarantees (opening) | How it works | Checks and guarantees   <<<`
  and `1 concept(s) in three or more sections`.
- Widening the patterns to cover the round's own paraphrases (`T/concepts-wide.json`) on the unmodified round:

```
$ node S/dup.mjs R/04-shape.md T/concepts-wide.json
  3   A what a report holds + its paraphrase 'wrong answer' Quick start | Skills | How it works   <<<
  3   B a skeleton you agree to      Quick start | Skills | How it works   <<<
  3   C what it says, in what order  Quick start | Skills | Checks and guarantees   <<<
  3   D2 best practices + 'field's practices' (opening) | How it works | Checks and guarantees   <<<
  2   E agents announced + 'as many agents' Quick start | How it works
  2   F you start each one + 'run by you' Quick start | Skills
  2   G a round refused + 'checked sentence' How it works | Checks and guarantees

4 concept(s) in three or more sections
```

  What the widened rows mean:
  - A, B and C are handled in lens 3; the Skills row excuses each of them.
  - D2 merges two facts that the concept list files under one name: "rules and best practices" (L3, L78) and
    "documents like yours" (L67). As facts, one is in two sections and the other in one. The Checks and
    guarantees line uses skeleton.md:183–184's own wording ("the field's practices").
  - E and F sit outside the homes their concepts name, at L67 "read by as many agents as you allow" and L40
    "each command run by you", in two sections each.

**M2. dup.mjs ignores the homes that the concept names list.** `T/homes.mjs` uses dup.mjs's matching and
compares the result with the named homes:

```
a fix is not undone — How it works, Checks and guarantees
   found in: (opening) | Checks and guarantees
   outside its named homes: (opening); named home not found: how it works
writers, judges, reviewers — How it works
   found in: Quick start | How it works
   outside its named homes: Quick start; named home not found: -
```

**M3. A code span inside a phrase defeats a pattern.** Plant p4:
`sed 's/`\/terse:audit` again with the same questions/`\/terse:audit` again/' R/04-shape.md > T/p4-backtick.md`.
dup.mjs then prints `0   back to audit — Quick start`. Today the round is matched only through the
"again with the same questions" alternative.

**M4. The brief's `--except "Quick start"` excuses an absolute path that skeleton.md:212 forbids.** Plant p5
replaces "in a folder of its own outside your repository" at L32 with "in ~/.claude/plugins/data/terse,
outside your repository":

```
brief form:    line 32  absolute path  ~/.claude/plugins/data/terse   [stated exception]
               0 violation(s), 1 excused      exit 0
skeleton form: ! line 32  absolute path  ~/.claude/plugins/data/terse
               1 violation(s), 0 excused      exit 1
```

**M5. rule1.mjs misses some environment variables and flags.** It does not catch a variable written without
`$` and without `_`, or a single-dash flag. Rule 6.4 ("PATH is not named", skeleton.md:266) has no command in
part 3, and rule 7's word list does not include PATH. Plant p6 changes two lines: L14 becomes "You need: Node 22
or newer on your PATH." and L52 becomes "Restart Claude Code, or run `claude -c` to apply it." rule1 then prints
`0 violation(s), 0 excused` (exit 0), and the rule-7 words grep prints nothing (exit 1).

**M6. sections.mjs and dup.mjs exit 0 even when they find a failure.**
- sections.mjs: on this round, with four sections over budget, it exits 0; sections.mjs:4 says "A report, not
  a gate".
- dup.mjs: with the four widened concepts flagged (M1), it exits 0; dup.mjs:17–25 has no exit on a flag.

Only rule1.mjs exits 1. Anything that gates on exit codes lets R1 through.

**M7. The rule-7 words grep matches whole words, so plurals of its singular entries pass.** Plant p8 changes L3
to "It is not a compressor, across versions, genres, surveys, waves, chains, baselines and ledgers.", and the
grep prints nothing (exit 1). The control,
`echo 'across version, genre, survey, wave, chain, baseline and ledger' | grep -o -i -w -E 'baseline|ledger|wave|chain|genre|survey|version'`,
prints all seven.

## Lens 2: water

Ranked by words saved. The counts come from `node T/save.mjs`, which splits words the way sections.mjs does.

**W1. L59**, "A skeleton: an outline of sections, each with its purpose and size, to agree to before the text is
written" → "A skeleton, an outline to agree to before the text is written". **Saves 8.** This gloss is the
second: the first is at L34, "a skeleton, an outline you agree to". The short form still glosses the term for
a reader who reaches Skills first. Skills is 13 over.

**W2. L24**, "It asks for the scope — which files to check, every tracked `.md` by default — and where your
readers start." → "It asks which files to check, every tracked `.md` by default, and where your readers
start." **Saves 5.** "the scope" is a label used once and never referred to again (`grep -c -w scope` returns
1). The condition stays whole: which files, the default, and where readers start.

**W3. L80**, "**What the skills promise:**" → "**Guaranteed:**". **Saves 3.** The short form pairs with L82
"**Not guaranteed:**" and meets skeleton.md:184 (R7).

**W4. L78**, "…(references/prior-art.md), gathered and ranked." → cut ", gathered and ranked". **Saves 3.** "each
marked measured, argued or asserted" already is the ranking.

Water total: 19.

**Skipped**, because each is a condition, a limit or a warning at a point where a reader decides. The number is
the tokens a cut would have saved:
- **L40–43, the chains (24).** skeleton.md:141–142 and 205–206 home them in the Workflow block. They hold the
  page's only "again with the same questions" and the limit "each command run by you".
- **L24, "rewrite does so before its writers and judges, and before a round's reviewers" (13).** It says when
  rewrite stops for your word before it starts agents. Its placement is charged as R3, not as water.
- **L67, "read by as many agents as you allow" (8).** The reader's limit on rethink's agents.
- **L74, "Part two of a four-part rewrite," (6).** A limit on the evidence: four parts were measured together,
  not these rules alone.
- **L68, "of an existing text" (4).** A condition: rewrite working from a skeleton has no existing text to read.
- **L80, "before you see it" (4).** How far the guarantee reaches.
- **L52, "to apply it" (3).** The content of the warning: the update does not apply before the restart.
- **L26, "If every answer from your text is already right, stop.", and L58, "when a sentence is at fault".**
  The stop condition and a limit on the report.
- **The report clause repeated at L24 and L58.** It is about 17 words, nearly identical in both places. Both are
  required (skeleton.md:124–125, 144–145), and the Skills row is the allowed repeat.

The water comes to 19 tokens against an overrun of 143 (R1), and the skipped conditions hold 62. The overrun is
therefore not water, and rule 4 sends it to the owner.

## Lens 3: duplication and contradiction

### Facts in three or more sections

None is charged. Three facts reach three sections, and in each case one of the three is the Skills row. That
row is the "When to run it" row, which a reader reaches without Quick start, so it is the allowed repeat. The
widened dup rows are in M1.
- **What the report holds.** L24 "Its report lists the questions your text answers wrong, why, and where"; L58
  (Skills) "which questions the text answers wrong, why, and where"; L66 "a cause for each wrong answer: false,
  missing, misplaced, hard to find, misleading steps".
- **The skeleton you agree to.** L34 "a skeleton, an outline you agree to"; L59 (Skills) "A skeleton: an outline
  of sections, each with its purpose and size, to agree to before the text is written"; L67 "a skeleton you agree
  to".
- **What a document says, in what order.** L26 "the document's shape — what it says, in what order — stands";
  L59 (Skills) "it says the wrong things in the wrong order"; L75 "What a document says, and in what order".

As a fact, the refusal of a round is in two sections: L68, and L76 with L80. The third section behind R2's
concept is L3's risk clause.

### Scope words

**P1. A claim with "every": the stop, and the recommended order that skips it.**
- L26: "If every answer from your text is already right, stop."
- L42: "`/terse:audit` → `/terse:rewrite` → `/terse:audit` again with the same questions" (under L40, "Recommended
  orders").
- L60 (Skills): "After audit, once you say the shape stands; or from a skeleton you agreed to".

The recommended order and the Skills row both take the reader from audit to rewrite with no stop. The stop
appears only at L26 (`grep -n -o -i -w stop` finds 26). The Skills row is read without Quick start.

**P2. A claim with "never": word count.**
- L68: "never picking by word count". L3: "It is not a compressor."
- L76: "| The scripted checks | Mechanism before the decision, one idea in three sections, words against a
  budget, …".

The page makes word count a check but never says what an overrun does, so a reader cannot tell whether a
longer draft loses.

**P3. The opening's scope ("It is for when"; none of the listed scope words) and a case outside it.**
- L3: "It is for when you cannot tell whether a document is fine, and touching it may make it worse."
- L59 (Skills): "| `/terse:rethink` | No document yet, or it says the wrong things in the wrong order |".

The opening's one stated use assumes a document exists. Rethink's first case has none.

**Checked, and no sentence elsewhere says it can happen:**
- L3, "every word carries weight and meaning": the aim.
- L24, "every tracked `.md` by default": the same sentence names the override, "which files to check".
- L58, "no rewording".
- L62, "You start each one yourself.": agreed by L26 and L34 ("run this") and by L40 ("each command run by you").
- L66, "every claim checked against the code or a named source".
- L68, "by default three writers and two judges": agreed by L24, where rewrite announces and waits.
- L68, "a reason for every cut of twenty words or more".
- L80, "Each run is written in the plugin's own folder.": agreed by L32, "in a folder of its own outside your
  repository".
- L80, "Nothing in your repository changes until you say so.": agreed by L32, "You decide whether the draft
  replaces your document."
- "only" and "always" do not occur (`grep -c -i -w -E 'only|always'` returns 0).

## Scratch, all under T

`cmp.mjs`, `homes.mjs`, `save.mjs`, `sentences.mjs`, `concepts-wide.json`, `p1-checked-true.md`,
`p4-backtick.md`, `p5-abspath.md`, `p6-path-flag.md`, `p8-inflections.md`.
