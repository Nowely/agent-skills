# Opus lens 2, round 03: the mechanical rules, the water, duplication and contradiction

Paths: `R=/var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T//terse/runs/20260924-002235-terse-readme-rewrite2`,
`D=$R/03-routes.md`, `S=/Users/ruliny/Git/agent-skills/plugins/terse/skills/rewrite/scripts`,
`T=/var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/lens2-r3` (plants, widened concepts, and `perline.mjs`,
which counts tokens per line the way sections.mjs does). Per-line counts below come from `node $T/perline.mjs $D`.

## Files and decisions applied

Read:
- `$D`, `$R/skeleton.md`, `$R/budgets.json` and `$R/concepts.json`
- line 1 of `$R/rounds.md` only (the agreement line the brief points to)
- `plugins/terse/skills/rewrite/references/writing-rules.md` and `$R/00-original.md`
- the source of the three scripts
- `audit.md:1005–1020`, in `$R/` and in `research/2026-09-22-terse-process/audit-2026-09-22/`, for rule 6 item 7 only

Not opened: everything the brief excludes. I also left out `writer-*.md`, `diff-*.patch`, `probe-*`, `01-candidate.md` and `02-grafts.md`, to stay blind to the round record.

1. **The skeleton read is the agreed one.** `shasum -a 256 $R/skeleton.md` gives `2c27168c73d01378013590c09dc668cc6c545f564acfac4e39d8e326fca0c9e4`, the SHA on the agreement line ("согласен, стало гораздо лучше."). My reading, not a record: part 7's "Still the owner's" items were agreed with the rest.
2. **Line 12 (Node 22) is not a finding.** Part 7's "Kept though the owner once called it junk" governs; it is younger than «node 22, PATH - это все мусорные детали».
3. **`$R/concepts.json` governs over the JSON in skeleton part 3.** The only difference: "make it worse" was dropped from "a fix is not undone". No count changes. With the skeleton's JSON (`$T/skeleton-concepts.json`) that row reads `(opening) | How it works`, and the result is still `0 concept(s) in three or more sections`.
4. **`$R/budgets.json` equals skeleton part 3.** The diff shows only the fence lines. No answer to an overrun is recorded: `grep -n -i -E 'overrun|over budget|over its budget' $R/skeleton.md` returns only lines 234–235, which are rule 4 itself.
5. **Rule 1 has two forms.** The brief says `--except "Quick start"`; skeleton rule 1 says "No `--except`". I ran both, applied the skeleton's form, and both give `0 violation(s), 0 excused`, exit 0. The collision changes nothing on this page.
6. **Three items are open in the skeleton** and may be settled in the record I did not open:
   - Least-sure #1 (the route appears twice) bears on P4.
   - #4 ("the README first") is absent from the opening (`grep -c 'README first' $D` → 0); not counted.
   - #5 (the excerpt's source) bears on R5.

## Lens 1 — the mechanical rules

The shipped checks, as run:

```
node $S/rule1.mjs $D --cut "How it works" --except "Quick start"   ->  0 violation(s), 0 excused   exit 0
node $S/rule1.mjs $D --cut "How it works"                          ->  0 violation(s), 0 excused   exit 0
node $S/dup.mjs $D $R/concepts.json                                ->  0 concept(s) in three or more sections
   at 2: consent QS|HIW · own folder QS|HIW · not a compressor (opening)|WWM · AI readers HIW|WWM ·
         answer key HIW|WWM · best practices (opening)|HIW · writers, judges, reviewers QS|HIW · diff QS|Skills
node $S/sections.mjs $D $R/budgets.json
   65 / 70   -5   (opening)
  215 / 180  +35   Quick start
  137 / 130  +7   Skills
  163 / 140  +23   How it works
  107 / 105  +2   What was measured
  687 TOTAL, 4 section(s) over budget        exit 0
```

**R1. Rule 4 (Budgets) fails.** Four sections are over, and the total is 687 against 625 (+62). The heaviest lines:
- Quick start: 27 (56 tokens), 33 (35), 35 (30).
- How it works: 61 (37), 64 (34).

How it works is mostly the skeleton's own content. The 2.4 purpose alone is 184 tokens: `sed -n '141,151p' $R/skeleton.md | sed '1s/.*For the reader who came for the method: //' | wc -w` → 184. The section is 163. The end of lens 2 shows what the water closes.

**R2. Line 35 breaks exclusion 2.2, "what happens inside a round".** The line: "rewrite does so before its writers and judges, and before a round's reviewers". Check: `sed -n '5,45p' $D | grep -n -i -o -E "round'?s?|writers?|judges?|reviewers?"` → `31:writers 31:judges 31:round's 31:reviewers`, which is line 35. The same clause puts the concept "writers, judges, reviewers — How it works" into Quick start, a home its name does not list; dup prints `Quick start | How it works`.

**R3. Part 3 rule 7 (Must use) and part 4 row [44] fail twice.** The rule is "reviewer, first as 'AI reviewers, each checking one thing'".
- The first "reviewer" on the page is line 35, "a round's reviewers". `grep -n -i -o reviewer $D` → 35, 63.
- The required gloss is absent: `grep -c 'each checking one thing' $D` → 0. Line 63 has "checked by AI reviewers, each from its own angle".

No younger decision in the files I may open covers either.

**R4. The 2.2 device ("In this order") fails twice.**
- **(a) Audit's announcement comes too late.** The device puts "says how many agents it will start and on which model, and waits until the reader says so" in the `/terse:audit` item, before the excerpt. The page has it at line 35, after the `/terse:rewrite` fence: `grep -n -E 'which model|^/terse:rewrite' $D` → 30, 35. A reader who runs line 17 meets the prompt before reading about it.
- **(b) Line 44 is outside the device.** "Restart Claude Code to apply it." follows the update fence. The device ends Quick start with "the update as one lead word and a `bash` fence". It allows a restart clause only after the install, and "only if that run shows an open session must reload or restart".

No younger decision in the files I may open covers either.

**R5. The excerpt breaks part 7, Still the owner's #2 ("nothing about language").** Lines 23–24, inside the `text` fence, say "the method holds for any text / in any language, code or not". Check: `grep -n -i language $D` → 24. No shipped check can see it: rule 7's list lacks the word and skips `text` fences. This depends on decision 6: least-sure #5 left the excerpt to "the owner's pick".

What the checks miss (R6 has a live consequence on this page; R7–R9 are latent):

**R6. dup.mjs compares counts, not homes, and misses paraphrases.** `node $S/dup.mjs $D $T/concepts-wide.json` runs the shipped patterns plus the paraphrases found on this page:
```
  3   consent, + the paraphrases on the page Quick start | Skills | How it works   <<<
  2   agents announced, + 'as many agents as you allow' Quick start | How it works
  3   rounds of edits by agents      (opening) | Quick start | How it works   <<<
2 concept(s) in three or more sections
```
- The consent pattern misses "to agree to" (51), and "once you say the shape stands" and "a skeleton you agreed to" (52).
- "agents announced — Quick start" misses line 64, "with as many agents as you allow".
- A concept outside its named homes, like writers/judges/reviewers in Quick start, is printed without a flag.

**R7. rule1.mjs misses a bare `PATH`, a single-dash flag, and a field label in backticks.** Plants in `$T/plant-rule1.md`:
- line 12: "You need: Node 22 or newer. Add Node to PATH, then run it with -y."
- line 23: "`MISSING`: the owner's intent — …"

`node $S/rule1.mjs $T/plant-rule1.md --cut "How it works" --except "Quick start"` → `0 violation(s), 0 excused`. Control: the same label without backticks (`$T/plant-rule1b.md`) → `! line 23  header field   MISSING:`, `1 violation(s)`.

None of the three is on this page:
- `grep -c PATH $D` → 0.
- `sed -n '1,58p' $D | grep -n -o -E '(^|[[:space:]])-[A-Za-z][A-Za-z0-9-]*'` → exit 1.
- The excerpt's "`missing`:" is lowercase, and rule 1's form is `ABC:`.

**R8. sections.mjs never checks rule 4's total.** It prints `687 TOTAL` without comparing it to 625, and exits 0 with four sections over. The total is checked only by hand.

**R9. Rule 7's `grep -w` list matches only the forms it spells out.** Fed "The versions of both pipelines. / Two genres, three surveys. / A task-reader answers. / The verifiers and the critic.", it prints only `critic`. None of these forms is on this page: `grep -c -i -E 'versions|pipelines|genres|surveys|verifiers|chains' $D` → 0.

**Clean, with the check for each:**
- Rule 2: `grep -n '^#' $D` → lines 1, 5, 46, 59, 69, the five headings in order.
- Rule 5: fences open at 7 `bash`, 16/22/29 `text`, 39 `bash`, all in Quick start; `grep -c '/plugin'` → 0.
- Rule 6:
  - Item 1: line 3's first sentence says what terse is for, with no `?`.
  - Item 2: no consent, folder or announcement row reaches `(opening)`, widened rows included.
  - Items 3–4: rule 1 finds nothing; `PATH` count is 0; line 12 is one line.
  - Item 5: the first non-blank line under Quick start is `7: ```bash`.
  - Item 6: the update is lines 39–42.
  - Item 7: `grep -F` finds both excerpt lines at audit.md:1014–1015. The excerpt is clipped from inside one sentence: it starts after "Beside it," and stops before ", and no question can be answered on it from the documentation".
  - Item 9: the table has 3 distinct rows.
  - Item 11: count 0.
- Rule 7:
  - Both greps print nothing (exit 1).
  - Required words: weight/meaning at 3; until you say so at 35 and 67; rounds of edits at 3 and 63; documents like yours at 64; AI reviewers at 63.
  - First-use glosses: skeleton/outline at 27, shape/order at 27, diff/change at 33.
  - `score` is unused; "A fresh AI reader" is at 61; `terse` appears only as the name and in commands.
- Part 4:
  - Markdown appears once (14).
  - rethink's first mention says what it decides (27).
  - `rewrit` appears only as the skill (30, 35, 52, 56, 57).
  - `grep -c -i -E 'candidate|regression|pipeline|critic'` → 0.
- Writing rules: the only editing-history hit is line 73, "its previous README". I kept it because it names the subject of a dated measurement (writing-rules.md:22–23). The only capitals are AI and README.
- Must use: `claim` and `undo a fix` are absent. Line 66 words the idea as 2.4 does ("a sentence … checked true"), and 2.4 is the more specific rule.

## Lens 2 — water

Ranked by words saved in an over-budget section. Counts are sections.mjs tokens.

**W1. Line 54 (Skills).** "You start each one yourself, and both orders end in audit:" → "You start each one yourself:". Saves 6.
- Both chains at 56–57 already end in `/terse:audit`.
- The clause is also 2.3's excluded "a route in prose", and cutting it removes P4's closed count.

**W2. Line 64 (How it works).** Cut ", with as many agents as you allow", once the fact stands at line 35. Saves 7 in How it works.
- It is a true claim on the wrong line (writing-rules.md:13).
- Its decision point is the announcement at 35, which names only audit and rewrite.
- 35 is a decision point, so its new wording is left to the writer. It costs about 2.

**W3. Line 74, the link text (What was measured).** "What the field has measured, and its findings against the 2026-09-10 numbers" → "The field's measurements and findings against the 2026-09-10 numbers". Saves 3.

**W4. Line 71 (What was measured).** "the method this plugin was built from" → "the method behind this plugin". Saves 2. The date and numbers are untouched.

**W5. Lines 33 and 52.** "a new draft" / "A new draft" → "a draft" / "A draft". "draft" already says it is not the original. Saves 1 each.

Total: 20 saved, before W2's re-homing cost.

**Skipped** as a condition, a limit or a warning where a reader decides:
- 20, "and waits for your answer" (5 words): the promise that the run pauses, at the point where the reader answers.
- 27, the whole paragraph: stop; the shape stands; rethink first; "when it asks".
- 33, "in a folder of its own outside your repository" and "You decide whether the draft replaces your document."
- 35, all 30 tokens: the announcement and the wait. Its rewrite clause is R2's.
- 44: see R4.
- 50, "no rewording".
- 52, "once you say the shape stands".
- 63, "By default".
- 66, "silently": it keeps the guard true next to line 65's cuts that carry reasons.
- 71, "The same questions were not run without the text."
- 74, "— only whether a model does".

The opening is 2.1's purpose nearly word for word. Its only water is framing ("It is for when").

**Budgets after W1–W5:**

| Section | Tokens / budget | What is left |
|---|---|---|
| Skills | 130/130 | none |
| What was measured | 102/105 | none |
| How it works | 156/140 | 2.4's prescribed content (R1) |
| Quick start | 214/180 | 195 without R2's clause (13) and line 44 (6) |

The last two overruns remain a question for the owner under rule 4.

## Lens 3 — duplication and contradiction

**P1. "Several agents, in rounds" appears in three sections:**
- opening, 3: "in rounds of edits by several AI agents"
- Quick start, 35: "rewrite does so before its writers and judges, and before a round's reviewers"
- How it works, 63: "three writers draft and two judges pick, then rounds of edits, checked by AI reviewers"

Check: the `$T/concepts-wide.json` row → `(opening) | Quick start | How it works <<<`. None of the three is a symptom-keyed row. The opening and How it works are prescribed (2.1, 2.4); Quick start is R2's.

**P2. Consent appears in three sections, using the shipped concept's reading, which counts "say whether" the shape as consent:**
- Quick start, 27: "say whether the document's shape … stands" and "an outline you agree to"; 35: "waits until you say so"
- Skills, 51: "to agree to before the text is written"; 52: "once you say the shape stands; or from a skeleton you agreed to"
- How it works, 67: "nothing in your repository changes until you say so"

Check: the widened row → `Quick start | Skills | How it works <<<`. The Skills hits sit in rows keyed by the reader's situation (the When column), which a reader reaches without Quick start. That makes it the allowed repeat. Each narrower fact, consent to the shape and consent to changes, sits in two sections.

**Considered, two sections each:**
- draft and diff (33, 52)
- the skeleton you agree to (27, 51–52)
- own folder (33, 67)
- where your readers start (20, 61)
- without your text (61, 71/73)
- cannot tell whether a document is fine (3, 50)
- wrong answers with causes (50, 62; the excerpt at 23 is an instance, not a restatement)
- the agent count is yours (35, 64)

Length appears as three facts on one idea: "It is not a compressor." (3), "Word count never selects a draft" (65), "2,725 words → 2,571" (72). The skeleton's own fold splits it that way (part 2 Total; part 7 Still the owner's #4), so I did not count it.

Scope words come from `grep -n -o -i -w -E 'nothing|never|only|always|by default|every|any|both|alone|each|whole|no|none|all|cannot' $D`.

**P3. "Every" collides with the without-text run:**
- 27: "If every answer is already right, stop there."
- 61: "the same questions run without your text."
- 73: "5 of 7 right with the text, 0 of 7 without."

The page says a report also holds answers given without the text, and in its own example those are all wrong. Read literally, "every answer" never holds. The sentence is a condition at a decision point, so give it its scope ("every answer from your text") rather than cutting it.

**P4. "Both" collides with Quick start's route:**
- 54: "You start each one yourself, and both orders end in audit:" (chains at 56–57)
- 27: "if not, run `/terse:rethink` first to decide a new one", which is audit → rethink → rewrite, an order neither chain lists
- 27: "If every answer is already right, stop there.", which is audit alone

This is least-sure #1 (decision 6). W1 removes the count.

**P5. "Any" collides with the Markdown scope.** This pair is prescribed, so it is for the owner, not the writer:
- 3: "for assessing and improving any text"
- 14: "In Claude Code, where the Markdown files are:"

Both halves are the skeleton's own: the 2.1 purpose, part 4 row [7] ("Markdown once, as the scope fact"), and part 7 Still the owner's #2.

**P6. One report is described two ways.** There is no scope word here; the contradiction is for someone who reads line 20 alone:
- 20: "Its report on this plugin's README, 2026-09-22:"
- 73: "2026-09-22, this plugin's audit of its previous README"

Taken as being about this page, the excerpt at 23–24 says "the owner's intent — the method holds for any text … — appears in no page", while line 3 of this page says "any text". Only "previous", in the last section, resolves it.

**Checked, no counter-sentence found:**
- every word carries weight (3)
- "By default three writers draft and two judges pick" (63). No line names the non-default. The nearest are 35 ("waits until you say so") and 64 ("as many agents as you allow", which is rethink).
- "Word count never selects a draft" (65), checked against 51 ("each with its purpose and size") and 72
- "nothing in your repository changes until you say so" (67), checked against 27, 33 and the install/update fences
- "Never measured … only whether a model does" (74), checked against 71–73
- "from the text alone" (61)
- "no rewording" (50)
- "Each run is written in the plugin's own folder" (67), checked against 27 and 33
- "whole" (33, 52)

`always` does not occur.
