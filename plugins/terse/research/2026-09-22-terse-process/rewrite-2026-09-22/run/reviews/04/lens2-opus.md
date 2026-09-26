# Opus lens 2, round 04: the mechanical rules, the water, duplication and contradiction

## Files and decisions applied

- Judged: `R/04-terms.md` (130 lines). Rules: `R/skeleton.md` (budget note :3-6, Open decisions (a)–(l) :8-47), `R/budgets.json`, `R/concepts.json`, `plugins/terse/skills/rewrite/references/writing-rules.md` (rules :6-25). `R/00-original.md` read only to confirm the budget basis. None of the forbidden files opened.
- `S` = `~/Git/agent-skills/plugins/terse/skills/rewrite/scripts`. Plants and helpers: `$TMPDIR/lens2-opus-04/` (`$TMPDIR/lens2-opus-04/`).
- Where a rule and a younger decision collide, the decision governs. Applied:
  - budgets gate nothing (skeleton.md:5-6): over-budget sections are reported, not counted as violations;
  - (d)/(g) over writing-rules.md:12 (editing history): L77-79 checked only for a branch name, "still", the date and both commits;
  - (h) over (a)'s say-verb register: L78 "page wrote", L83 "instructions create", L87 "instructions place" are left alone and not counted;
  - (d) over writing-rules.md:21-22 (repetition at a decision point): the warning is not repeated at the head of *Where it writes*, so the pair in P2 stays and is reported as allowed by that decision;
  - (e)/(l): L5-6 not touched; (k): L74-76 treated as pinned at level 3; (b): L114-115 not touched.
- Evidence levels as in the repository's CLAUDE.md: 1 the line resolves, 2 a reader would say the same, 3 made to happen.

## Lens 1 — the mechanical rules

### The shipped checks, as run

```
$ node $S/rule1.mjs R/04-terms.md --cut Install --except Install
0 violation(s), 0 excused                                   (exit 0)

$ node $S/dup.mjs R/04-terms.md R/concepts.json
  1   three skills, user-invoked     (opening)
  2   fresh readers measure answerability (opening) | What each one does
  1   claims checked against the code (opening)
  1   audit never proposes wording   What each one does
  2   rethink stops at a skeleton    (opening) | What each one does
  1   bake-off: writers and judges   What each one does
  2   rounds and critics             What each one does | What was measured
  1   nothing written to your files without your word Where it writes
  1   announce agents and wait       What each one does
  1   install commands               Install
  1   node prerequisite              Install
  1   not a compressor               What it will and will not do to your text
  1   conditions, limits, warnings kept What it will and will not do to your text
  2   the 2026-09-10 measurement     What it will and will not do to your text | What was measured
  2   no no-document arm             What each one does | What was measured
  1   the ledger and the ratchet     What each one does
  0   the verifier before the freeze
  1   run directory location         Where it writes
  1   any language, any text         (opening)
0 concept(s) in three or more sections

$ node $S/sections.mjs R/04-terms.md R/budgets.json
  149 / 99   +50   (opening)
  392 / 324  +68   What each one does
  119 / 49   +70   Install
  156 / 120  +36   Where it writes
  104 / 127  -23   What it will and will not do to your text
  219 / 309  -90   What was measured
    1 / 1    0   Licence
 1140 TOTAL, 4 section(s) over budget
```

### Verdicts

- Rule 1 (no flag, header field, exit code, protocol, environment variable or absolute path above `## Install`): clean.
- One idea, one home: clean. My own matrix agrees (lens 3).
- Editing history (writing-rules.md:12): clean. `grep -n -i -E "previously|used to|moved out of|per PR|on this machine|formerly|no longer|anymore|\bnow\b|\bstill\b|\bsince\b|renamed|originally"` hits only L106 "the code has since changed", which is the rule's own wording.
- Capitals for emphasis: clean. The all-caps tokens are README (L3, L74, L113), PATH (L62), TMPDIR (L84), ISSUES (L89) and MIT (L130). All are names.
- Glossary opening: clean.
- Decisions as greps. (c): L93 has "the plugin's last installation" and there is no `--scope` — clean. (d)/(g): `grep -w -E "main|master|branch|HEAD|trunk|still"` finds nothing; L74 has `2f29a8f`, L77 has 2026-09-22 and `8c041b7`; *Where it writes* opens at L83 with "The `audit` instructions create the run…" — clean. (i): `grep -i -w -E "lies|lie|lied|clarity|confusion|confused|benchmarks?"` finds nothing — clean. (j): "guess" is absent, and L40-41 names the skeleton, the run file and a resumed run — clean. (k): L74-76 is present. (e)/(l): L5-6 is present. (a): see R1.
- Counts (writing-rules.md:25 treats them as a prompt to review, not a gate). Sentences over 30 words: L29 (33), L42 (32), L77 (31), L101 (35), L115 (31). Repeated four-word phrases: only the install command inside *Install* (L71, L75, L76) and "audit and rewrite pages" (L77, L95).

### Budgets (a report, not a gate — skeleton.md:5-6)

| Section | Budget | Words | Δ | Words a decision holds |
|---|---|---|---|---|
| (opening) | 99 | 149 | +50 | L5-6, 16, (e)/(l) |
| What each one does | 324 | 392 | +68 | L23, 18, (a)/(h) |
| Install | 49 | 119 | +70 | L74-79, 65, (d)/(g)/(k); +5 without them |
| Where it writes | 120 | 156 | +36 | — |
| What it will and will not do to your text | 127 | 104 | −23 | — |
| What was measured | 309 | 219 | −90 | (i) keeps three findings cut |
| Licence | 1 | 1 | 0 | — |
| Total | 1029 | 1140 | +111 | |

Basis: `node $S/sections.mjs R/00-original.md R/budgets.json` shows a difference of 0 on all six sections the original has. The budgets are the original's sizes, as skeleton.md:3-5 says. Words per paragraph come from counting whitespace-separated tokens per blank-line paragraph (awk).

### Findings

**R1** (level 1) — The frame sentence is not the one decision (a) records. skeleton.md:15 records "Each skill is a page of instructions for Claude; below is what each page says."; L23 reads "…below is what each page and its references say." `grep -n -F "below is what each page says." R/04-terms.md` → no match. No rule is broken, because (h), the younger decision, governs the frame without quoting it. But the record and the text differ, so one of them changed and the other did not.

**R2** (level 3) — rule1.mjs misses an environment variable written the way this document writes one, and four other rule-1 forms. Plant `rule1-plant.md`: lines 59-67 go above `## Install` — `${TMPDIR:-/tmp}/terse`, bare `PATH` and `TMPDIR`, `claude -p`, `plugins/data/terse-nowely/runs/`, `/tmp`, "exits non-zero", plus three controls. Output:
```
! line 65  flag name      --keep-data
! line 66  absolute path  $HOME/.claude/plugins.
! line 66  env var        $HOME
! line 67  exit code      exits 2
4 violation(s), 0 excused
```
It caught the controls and nothing else. Cause, rule1.mjs:26-29:
- the env-var pattern needs `$` followed by a capital, or a name with an underscore, so `${TMPDIR…}` and `PATH` get through;
- the path pattern needs two segments with no `}` between them, so `/tmp}/terse` and `/tmp` get through;
- the flag pattern needs `--`;
- the exit-code pattern needs a digit.

The relative path gets through because rule 1 names absolute paths only.

What this means here: in `rule1-moved.md`, *Where it writes* is moved back above *Install*. rule1 then reports only `line 71 flag name --keep-data` and misses `${TMPDIR:-/tmp}/terse` on line 62. skeleton.md:10 names an environment variable as one reason for the move, and in its current wording the check would not catch it.

**R3** (level 3) — `--except Install` does nothing under `--cut Install`, so "0 excused" says nothing about *Install*. rule1.mjs:22-24 keeps only the lines above the cut. :33-38 looks for the except heading in those lines only, finds none and drops it. Plant `rule1-install.md` puts `/usr/local/bin/node` and `--plant-flag` inside *Install*. The output is "0 violation(s), 0 excused" with `--except Install` and without it. Nothing from *Install* down is scanned. Even where the exception does apply, it excuses absolute paths only (rule1.mjs:45).

**R4** (level 3) — dup.mjs misses a repeated fact when the words differ from its concept pattern. Plant `dup-miss.md` adds "Nothing touches your files until you approve." after L19 and "It changes your document only once you approve." after L106. The approval fact is then in (opening), *Where it writes* and *What it will and will not do*. Output: `1   nothing written to your files without your word Where it writes`, "0 concept(s) in three or more sections". The script counts only regex matches (dup.mjs:18-23). The same limit shows in the run's own list: from `0   the verifier before the freeze` alone you cannot tell whether the concept left the text or only its wording left the pattern.

**R5** (level 3) — dup.mjs counts a concept inside unrelated words and lumps different facts under one concept. Plant `dup-over.md` adds "A background shell works too." in *Install*. Output: `3   rounds and critics   What each one does | Install | What was measured   <<<`, "1 concept(s) in three or more sections". The pattern `round|critic` in concepts.json has no word boundaries. In the real text, the concept "no no-document arm" matches both L29, the audit's baseline (a feature), and L113, the experiment's missing arm (a limit). It raises no flag today because that is two sections.

**R6** (level 3) — sections.mjs drops a section from the over-budget count when its heading changes, and says nothing when a budgeted section disappears. Plant `sec-rename.md` renames `## Install` to `## Installing`: the output shows `119 Installing   (no budget)` and "3 section(s) over budget" (it was 4). Plant `sec-drop.md` deletes *Licence*: no line for it and no warning. sections.mjs:19-24 walks only the headings in the document, so a budget key without a heading is never read.

## Lens 2 — water (ranked by words saved)

**W1** — L75-76 "…with the path of a local clone checked out at it in place of `Nowely/agent-skills`, then `claude plugin install terse@nowely`." → "…with the path of a local clone checked out at it, then `claude plugin install terse@nowely`." Saves 4. "with the path of a local clone" already says what the argument is. Both commands stay as they were run. (k) pins this sentence at level 3, so the cut needs the pin renewed.

**W2** — L19 "The plugin ships three user-invoked skills." → "All three are user-invoked." Saves 2. The diagram above already shows three skills. The only fact this sentence adds is "user-invoked".

**W3** — L120 "A separate experiment used ten agents" → "Another experiment used ten agents". Saves 1. L110 already says there were two experiments.

Total 7 words. Skipped, because each is a condition, limit or warning where a reader decides, or a decision holds it:
- L5-6 "The intended scope is…" — (e)/(l).
- L6-8 "…this weaker truth pass has not been measured." — a limit at the point where the reader decides whether to use the plugin on text that no code backs.
- L10-11, the two "Start with…" sentences — conditions for choosing a skill.
- L23, the frame — (a)/(h).
- L40-41 "that already holds rounds" (4 words) — reads as the condition for resuming.
- L46-47 "as it is" — the stop condition.
- L51 "That guard is not a promise that no regression can occur." — warning.
- L61 "Install Claude Code first." — prerequisite.
- L77-79 — warning, (d)/(g).
- L83-85 gives the run's location twice ("in the plugin's data directory when Claude Code supplies one" / "Installed, the runs land in `plugins/data/terse-nowely/runs/`…"). Merging them saves about 4 words but rewrites the sentence that carries the condition.
- L83-95 has six attributions, about 20 words: "The `audit` instructions", "The audit page", "its reference on measuring", "The `rewrite` instructions", "The `rethink` page", "The `audit` and `rewrite` pages warn that" — (h).
- L102 "— six percent —" — a dated measurement keeps its numbers (writing-rules.md:22-23).
- L113 "The experiment had no no-document arm." and L118-119 "nor separates what the text taught from prior knowledge" state one limit twice in one bullet, and about 6 words could go. Skipped because it is a limit where the reader decides how far to trust the result.
- L114-115 "The plugin's repository records…" — (b), and a limit on the evidence.

## Lens 3 — duplication and contradiction

### No fact appears in three or more sections

dup.mjs flags none. My term matrix (`node $TMPDIR/lens2-opus-04/terms.mjs R/04-terms.md`) finds eleven terms in three or more sections: bake-off, candidate, skeleton, run, diff, repository, measure, reader, Claude Code, code, page. In each case the sections state different facts. The two closest cases:
- *bake-off*: L42 (three candidates, two judges), L104-105 (vetoes a candidate that cuts a condition), L112 (the chain came before it), L126 (not measured against one careful pass). Four different facts.
- *skeleton*: "rethink's output is a skeleton" appears in (opening) L14 and in *What each one does* L37. L90-91 "The `rethink` page does not specify where its skeleton is stored." is a different fact, and it is the symptom-keyed row that a reader looking for the file reaches without reading the earlier section.

These repeat in two sections, which is allowed: the chain as one file in four passes (L101; L112-113), the approval gates (L38, L56-57; L87, L90), candidate + diff (L14-15; L48).

### Scope-word pairs

`grep -n -o -i -w` finds no "nothing", "never", "always" or "by default". "only" appears at L26, L114, L122; "every" at L48, L49, L123. The pairs, ranked:

**P1** (level 2) — The install block has no condition. Eight lines later the text says the same commands install a commit that this README does not describe.
- L64-69: "Inside Claude Code:" / "/plugin marketplace add Nowely/agent-skills" / "/plugin install terse@nowely"
- L77-78: "On 2026-09-22 the install commands with `Nowely/agent-skills` resolved to `8c041b7`, whose audit and rewrite pages differ from the ones described here"

A reader who copies the block has run it before reaching that sentence. (d), (g) and (k) fix what the text says and which section it is in, not the order inside the section.

**P2** (level 2) — "requires your word" against "without asking".
- L89-90: "Copying that defect into the repository's `ISSUES.md`, or applying the candidate to your document, requires your word."
- L78-79: "its rewrite page wrote into the document repository without asking."

A reader who goes straight to *Where it writes* to learn whether the repository is safe does not see there that this depends on the commit. Decision (d) keeps the pair ("no repeat at the head of *Where it writes*"), and I applied it over writing-rules.md:21-22. It is listed because the lens asks for every pair.

**P3** (level 2) — The chain is given as evidence of what "it" does, but another section says the chain came before the plugin's own process.
- L100-102: "It is not a compressor. … On one file measured on 2026-09-10, a four-pass rewrite chain moved 2,725 words to 2,571 — six percent —"
- L112-113: "The chain, four passes that preceded the plugin's bake-off and rounds, covered one README."

A reader of *What it will and will not do* alone takes the numbers as the plugin's.

**P4** (level 2) — Every audit writes its own answer key, yet a re-audit has to use the same one.
- L25: "`/terse:audit` writes a reader profile, a claim ledger, and an answer key before assigning one fresh reader, a model agent, to each question."
- L53-54: "When you re-audit after a rewrite, use the same questions, answer key, entry file, and model; changing one makes it a new measurement rather than a comparison."

No sentence says an audit can take questions or a key that it did not write.

**P5** (level 2) — Every round comes with a diff from the original, but one route has no original.
- L48: "A round is handed over as a candidate and its diff from the original."
- L10-11: "Start with `/terse:rethink` when the document is missing or its shape is wrong." L14 draws this route as "/terse:rethink → skeleton → /terse:rewrite → candidate + diff → /terse:audit".

When the document is missing, the diff can only be taken against nothing.

Checked, with no counter-sentence found:
- L6 "Markdown in any language"
- L19 "user-invoked"
- L26 "may open only Markdown"
- L29 "Each wrong answer gets a cause"
- L48 "Every cut of twenty words or more must carry a reason"
- L49 "every behavioural claim a round declares"
- L56 "All three skills announce … and wait for your word"
- L61-62 "for `audit` and `rewrite`, also put Node 22"
- L100 "Length does not select a candidate"
- L104 "The writing rules forbid cutting a condition"
- L114 "only the totals after it" (L116 "none after" is a total)
- L122 "punctuation only"
- L123 "every entry of the three published standards"

Two more were checked and not counted:
- L23 "below is what each page and its references say" also covers the script sentence at L50, which (a) keeps in the direct form. That is not a counter-sentence.
- L86-87 "forbids writing into the audited repository; … allows storing the score there on your word" states the exception in the same sentence and makes it depend on your word.
