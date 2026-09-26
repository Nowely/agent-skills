# Opus lens 2, round 02: the mechanical rules, the water, duplication and contradiction

R = `/var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/terse/runs/20260924-002235-terse-readme-rewrite2`;
S = `/Users/ruliny/Git/agent-skills/plugins/terse/skills/rewrite/scripts`;
W = `/var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/lens2-opus-r02` (my copies and plants). Bare line numbers are
`R/02-grafts.md`'s (72 lines). Text findings quote the line (evidence level 1); every claim about what a check does
was made to happen (level 3), with the command beside it.

## Files and decisions applied

Read: `R/02-grafts.md`; `R/skeleton.md` whole; `R/budgets.json`; `R/concepts.json`; `R/concepts.01.json` (only to
date the concepts change); line 1 of `R/rounds.md` (`head -n 1`, the agreement line the brief points to, nothing
else); `writing-rules.md`; `S/rule1.mjs`, `S/dup.mjs`, `S/sections.mjs`; the headings of `R/00-original.md`; the
report the excerpt cites and `R/audit.md`, by `grep -F` only. Not opened: `R/reviews/` (beyond writing this file),
the rest of `R/rounds.md`, `R/ledger*.json`, `R/edits/`, `R/code-defects.md`, `R/cuts.md`.

1. The skeleton is the agreed one: `shasum -a 256 R/skeleton.md` → `2c27168c73d01378013590c09dc668cc6c545f564acfac4e39d8e326fca0c9e4`,
   the SHA in the agreement line ("согласен, стало гораздо лучше.").
2. Concepts: `R/concepts.json` (01:48) applied over skeleton part 3's list (skeleton.md:211–231, byte-equal to
   `R/concepts.01.json`, 00:29). The one difference: "a fix is not undone" loses `make it worse`. Under the older
   list that concept also lands in the opening (line 3 "touching it may make it worse", which 2.1's purpose asks
   for, skeleton.md:83–84); still 2 sections, so no verdict changes.
3. Budgets: `R/budgets.json` is byte-equal to skeleton part 3 rule 4 (`diff` → identical); the total, 625, is part 7
   "Still the owner's" 5, inside the agreed skeleton.
4. Node: part 7 "Kept though the owner once called it junk" governs over «node 22, PATH - это все мусорные детали»;
   the line is not counted against 2.2.
5. Rule 1: the skeleton's invocation (skeleton.md:201, `--cut "How it works"`, no `--except`) governs. The brief's
   (`--cut Install --except Install`) fits `R/00-original.md`, whose `## Install` is its line 40; this page has none.
   Both were run.
6. No answer to a budget overrun is in skeleton.md (R1); if one exists it is in files closed to me.
7. The Skills table rows are the symptom-keyed allowed repeat.

## Lens 1 — the mechanical rules

The three checks as the brief ships them:

```
$ node S/rule1.mjs R/02-grafts.md --cut Install --except Install
! line 71  header field   README:

1 violation(s), 0 excused                                   (exit 1)

$ node S/dup.mjs R/02-grafts.md R/concepts.json
  2   consent — Quick start, How it works Quick start | How it works
  2   the plugin's own folder — Quick start, How it works Quick start | How it works
  1   agents announced, then it waits — Quick start Quick start
  1   every word carries weight — opening (opening)
  2   not a compressor — opening, What was measured (opening) | What was measured
  1   you start each one — Skills    Skills
  1   back to audit — Skills         Skills
  1   a fix is not undone — How it works How it works
  1   condition, limit, warning — How it works How it works
  2   AI readers — How it works, What was measured How it works | What was measured
  2   answer key; without your text — How it works, What was measured How it works | What was measured
  1   claims against the code — How it works How it works
  1   the five causes — How it works How it works
  2   best practices; documents like yours — opening, How it works (opening) | How it works
  1   writers, judges, reviewers — How it works How it works
  2   the diff — Quick start, Skills Quick start | Skills
  1   p = 0.25 — What was measured   What was measured
  1   a person, never measured — What was measured What was measured
  1   Node — Quick start             Quick start

0 concept(s) in three or more sections

$ node S/sections.mjs R/02-grafts.md R/budgets.json
   68 / 70   -2   (opening)
  201 / 180  +21   Quick start
  133 / 130  +3   Skills
  148 / 140  +8   How it works
  111 / 105  +6   What was measured
  661 TOTAL, 4 section(s) over budget                        (exit 0)
```

The skeleton's rule 1: `node S/rule1.mjs R/02-grafts.md --cut "How it works"` → `0 violation(s), 0 excused` (exit 0).

### Violations

**R1. Four sections over budget; total 661 against 625.** Quick start 201/180 (+21), Skills 133/130 (+3), How it
works 148/140 (+8), What was measured 111/105 (+6); the opening 68/70. Rule 4 (skeleton.md:234–235): "prints no
section over its budget and a total of 625 or less; an overrun is a question to the owner, answered in this
file". `grep -n -i -E 'overrun|over budget|661|question to the owner' R/skeleton.md` → 204, 234, 235, the rules
themselves; no answer. What water takes back and what it cannot: lens 2.

**R2. Rule 1 as the brief runs it checks the wrong span and its one hit is a false positive.** `grep -n '^#'` finds
no `## Install`, so rule1.mjs:22–23 fall back to the whole page ("absent heading = whole document", :7) and
:33–38 drop the `--except` range, with no notice either time. The hit, line 71 "this plugin's audit of its own
README: 5 of 7 right", is a document name before a colon, caught by the `ABC:` pattern (:31), in What was
measured, after the skeleton's cut. Under the skeleton's invocation: clean.

**R3. Skills, line 55, departs from the device.** skeleton.md:134–135: "two chains of commands, each ending in audit
again with the same questions". Line 55: "- `/terse:rethink` → `/terse:rewrite` → `/terse:audit` for the first
time". `grep -c -F 'again with the same questions'` → 1 (line 54). No younger decision visible to me. The
replacement is false on Quick start's own route (P1).

**R4. Quick start, line 42, departs from the device.** skeleton.md:106–107 put the one reload clause after the
install fence, "only if that run shows an open session must reload or restart"; :112–114 make the update "one
lead word and a `bash` fence"; the purpose ends on it, "and, last, the one line that updates" (:100). The page
has no clause after install (lines 7–12) and ends Quick start on "Restart Claude Code to apply it." after the
update fence (37–42): 6 of the section's words. Least-sure 3 (skeleton.md:402–404) leaves the clause to the
clean run; which run placed it here is not visible to me.

**R5. Quick start, line 12, carries more than the device's line.** Device (skeleton.md:107–108): "'You need: Node 22
or newer' as one line". Line 12: "You need: Node 22 or newer, and a signed-in Claude Code." Rule 6.4 passes (one
line; `grep -c -w PATH` → 0). The added clause is 5 words with no decision behind it that I can see.

**R6. Skills, line 50, drops the device's limit.** Device (skeleton.md:132–133): "a new draft of the whole document
beside the reader's, and its diff". Line 50: "A new draft of the whole document, and its diff". `grep -c -i
beside` → 0. The row is read on its own (the allowed repeat), so a reader who starts there is not told the
draft leaves their file alone; writing-rules.md:21–22.

### The rest of part 3, as a grep reads it: clean

- Rule 2: `grep -n '^#'` → `1:# terse`, `5:## Quick start`, `44:## Skills`, `57:## How it works`, `67:## What was measured`.
- Rule 3: 0 concepts in three or more sections; each concept sits exactly in the sections its name gives (above).
- Rule 5: opening fences 7 `bash`, 16 `text`, 22 `text`, 29 `text`, 37 `bash`, all inside Quick start (5–43);
  `grep -c '/plugin'` → 0.
- Rule 6: 6.1 `sed -n 1,4p | grep -c '?'` → 0; 6.2 per dup; 6.3 skeleton rule 1 → 0; 6.4 `PATH` → 0, Node alone on
  line 12; 6.5 line 6 blank, line 7 opens `bash`; 6.6 lines 37–40; 6.7 both excerpt lines found by `grep -n -F` at
  `research/2026-09-22-terse-process/audit-2026-09-22/audit.md:1014–1015` (and `R/audit.md:1014`), the excerpt
  ending mid-sentence at "appears in no page"; 6.9 three different rows; 6.11 → 0 outside the `text` fences and
  0 over the whole file.
- Rule 7: the words grep prints nothing (exit 1) under both ugrep and `/usr/bin/grep`; the readers grep prints
  nothing; the opening holds `weight` and `meaning`; `until you say so` 2, `rounds of edits` 2, `documents like
  yours` 1, `AI reviewers` 1; the first sentence with `skeleton` holds `outline` (27), `shape` → `order` (27),
  `diff` → `change` (33); `score` unused; `AI reader` first at 59, as "A fresh AI reader"; `terse` only in
  `# terse`, `terse@nowely` and `/terse:*`.
- Part 4: `Markdown` once (14); `Command` only as the column of typed lines (46); no verb `rewrite`.
- writing-rules.md:12–13: no editing-history word (`previously|used to|moved|per PR|on this machine|no longer|now|…`
  → nothing); capitals only `README`; emphasis only `*p*`.

### What the checks miss, planted in copies under W

**R7. rule1 misses five kinds of technical detail before the cut, and flags a name.** `W/plantA.md` adds to line 12
"Put Node on your PATH, or run `claude -p` once.", to line 14 "(README: first)", to line 52 "it prints `STATUS:
ok`, fails with status 127, and reads `plugins/terse/skills/audit/SKILL.md`". `node S/rule1.mjs W/plantA.md --cut
"How it works"` → `! line 14  header field   README:`, `1 violation(s)`. Missed: a bare environment variable
(`PATH`: no `$`, no `_`), a one-dash flag (`-p`), a field inside a code span (the lookbehind at :31 excludes a
backtick), an exit code worded "status 127", a relative path. Caught: the document name. Rule 6.4 gives no
command for PATH at all.

**R8. Nothing checks How it works' exclusions.** `W/plantD.md` line 64: "is refused by `round.mjs --check` before you
see it." rule1 with the cut → `0 violation(s)`; the rule-7 grep → nothing. 2.4 excludes "Script, file and check
names" (skeleton.md:152); rule 1 stops at the cut by design, and no other check reads the section for them.

**R9. dup.mjs counts patterns, not facts.** `W/plantB.md` line 52 adds "you decide whether a draft replaces your
document, and each run sits in the plugin's data folder" to Skills, putting both facts in three sections; dup →
consent 2, folder 2, `0 concept(s)`. `you decide` is outside the consent pattern, `plugin's data folder` outside
the folder pattern.

**R10. dup.mjs never compares a concept with the sections its name gives.** With the skeleton's own list
(`W/concepts.skeleton.json`): `2   a fix is not undone — How it works (opening) | How it works`, then
`0 concept(s)`. A concept one section outside its home, short of three, passes.

**R11. The rule-7 words grep misses inflected forms.** `W/plantC.md` line 52 adds "invoking them across versions,
with no pipelines and no spawning"; the grep prints nothing (exit 1). Under `-w`, `invoke[sd]?`, `spawn(s|ed)?`,
`version`, `pipeline` (and `chain`, `genre`, `survey`, `wave`, `pilot`, `verifier`, `baseline`, `ledger`,
`checkout`, `arm`) match no `-ing` form and no plural.

**R12. sections.mjs exits 0 with four sections over.** Exit 0 in the run above; sections.mjs:4, "A report, not a
gate". Rule 4 holds only for someone reading the output.

## Lens 2 — water

Ranked by words saved. Applied together in `W/water-applied.md`: `node S/sections.mjs W/water-applied.md
R/budgets.json` → opening 68/70, Quick start 198/180 (+18), Skills 115/130 (−15), How it works 148/140 (+8), What
was measured 107/105 (+2), total 636; dup → 0; rule1 with the cut → 0.

| # | Line | Now | Keep | Saved |
|---|---|---|---|---|
| W1 | 49 | "A skeleton: an outline of sections, each with its purpose and budget, to agree to before anything is written" | "A skeleton: an outline to agree to before anything is written" | 8 |
| W2 | 52 | "You start each one yourself, and both orders end in audit:" | "You start each one yourself:" | 6 |
| W3 | 55 | "`/terse:audit` for the first time" | "`/terse:audit`" | 4 |
| W4 | 70 | "The same run took that README from 2,725 words to 2,571." | "The same run: 2,725 words → 2,571." | 4 |
| W5 | 20 | "It asks which files to read and where your readers start" | "It asks which files and where your readers start" | 2 |
| W6 | 20 | "From its report on this plugin's README, 2026-09-22:" | "Its report on this plugin's README, 2026-09-22:" | 1 |

- W1: beyond the device (skeleton.md:132, "a skeleton to agree to before anything is written"); line 27 already
  glosses skeleton; "budget" is glossed nowhere (`grep -n -i budget` → 49 only) and sits against "Length never
  picks a draft" (P5).
- W2: the two items under it show both chains ending in audit (54–55), at the same decision point, so not a
  protected repeat. Removes "both" from P1.
- W3: removes the clause P1 shows false; the chain still ends in audit.
- W4: keeps the date link ("The same run") and both numbers (writing-rules.md:22–23); the arrow is the section's
  own notation (69, "3 of 6 → 6 of 6").
- W5: the skeleton's own words (skeleton.md:109, "it asks which files and where readers start").

Skipped as a condition, limit or warning where a reader decides:
- 12 "and a signed-in Claude Code" (5): a prerequisite.
- 27, all 53 words: the three branches (stop, rewrite, rethink first); its two glosses are rule 7's.
- 33 "outside your repository" (3) and "You decide whether the draft replaces your document." (8).
- 42 "Restart Claude Code to apply it." (6): the step that makes the update take effect.
- 48 "no rewording" (2).
- 62–65, all of How it works' limits and guarantees; 59–61 hold only what 2.4's purpose lists. No water in the
  section.
- 69 "One small trial; the gain could be chance (*p* = 0.25). The same questions were not run without the text." (20).
- 72 "— only whether a model does" (6), and in the link text "and its findings against the 2026-09-10 numbers" (7):
  the pointer to evidence against the numbers.

After W1–W6 the overrun left, Quick start +18, How it works +8, What was measured +2, is all in skipped text:
rule 4's question to the owner, not water. Without R4's and R5's clauses as well, Quick start is still 187 (+7).

## Lens 3 — duplication and contradiction

Three or more sections: no fact. dup → 0 (lens 1). `node W/ngrams.mjs R/02-grafts.md 1` (content n-grams per `##`
section, split as dup.mjs splits) finds one multi-word phrase in three sections: `3 "same questions" :: Skills |
How it works | What was measured`. It names two facts: line 54, audit rerun with its earlier questions; lines 59
and 69, the run without the text, which sits in its two named homes. Checked by reading, and each at two or
within the allowance: length, three facts on one theme ("It is not a compressor" 3, "Length never picks a draft"
63, "2,725 words to 2,571" 70), placed by the skeleton's fold (part 7, "Still the owner's" 4); a cause for each
wrong answer (Skills 48 "why", How it works 60; Quick start 22–24 shows one instance), the Skills row being the
allowed repeat.

Scope words: `grep -n -o -i -w -E 'nothing|never|only|always|by default|every|each|any|anything|no|none|all|alone|whole'`
→ lines 3, 23, 24, 27, 33, 48, 49, 50, 52, 59, 61, 63, 65, 72. P1 is proven by the text; P2–P4 are proven as
text, their effect on a reader a hypothesis; P5 is a hypothesis.

**P1. "both orders … for the first time" against Quick start's own route.** Skills 52: "You start each one yourself,
and both orders end in audit:"; 55: "- `/terse:rethink` → `/terse:rewrite` → `/terse:audit` for the first time".
Quick start 27: "Otherwise say whether the document's shape — what it says, in what order — stands. If it does,
run this and give it the folder the report names; if not, run `/terse:rethink` first to decide a new one". That
route is audit → rethink → rewrite → audit: its closing audit is the second, and it is neither listed order.
Scope words "both" and "for the first time", outside the brief's six. W2 and W3 remove both.

**P2. "before anything is written" against a written document and a written run.** Skills 49: "A skeleton: … to
agree to before anything is written"; the same row's When: "No document yet, or it says the wrong things in the
wrong order", where the document is written; How it works 65: "Each run is written in the plugin's own folder",
rethink's skeleton among it, before the agreement. The phrase is the device's (skeleton.md:132). "before the draft
is written" says what is meant, +1 word. Scope word "anything".

**P3. "any text" against "the Markdown files".** Opening 3: "A Claude Code plugin for assessing and improving any
text"; Quick start 14: "In Claude Code, where the Markdown files are:". The skeleton sets both (part 4 row [7],
"text for the mission, … Markdown once, as the scope fact"; part 7, "Still the owner's" 2); applied. The pair
stands for a reader whose text is not Markdown. Scope word "any".

**P4. The excerpt's "no page" against this page's opening.** Quick start 23–24, dated 2026-09-22 on line 20: "the
owner's intent — the method holds for any text in any language, code or not — appears in no page"; opening 3:
"for assessing and improving any text". On this page the "any text" half now appears and "in any language, code
or not" still does not (`grep -n -i -E 'language|code or not'` → 24 only). Only the date keeps the quote from
reading as a present claim. Scope word "no".

**P5 (hypothesis). "Length never picks a draft" against an unglossed "budget".** How it works 63: "Length never
picks a draft"; Skills 49: "an outline of sections, each with its purpose and budget". Read as a word budget, it
is a length each section is written to; the page never says what the budget is. W1 removes it.

Checked, and no sentence on the page says it can happen: 3 "every word carries weight and meaning"; 27 "If every
answer is already right, stop there."; 48 "no rewording"; 52 "You start each one yourself"; 59 "answers from the
text alone"; 61 "each checking one thing"; 64 "is refused before you see it"; 65 "nothing in your repository
changes until you say so"; 72 "Never measured: … — only whether a model does."
