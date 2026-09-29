# Opus lens 7, round 04: purpose and content

Document: `04-shape.md` (82 lines, 788 tokens by `sections.mjs`). R = `$TMPDIR/terse/runs/20260924-002235-terse-readme-rewrite2`; S = `plugins/terse/skills/rewrite/scripts`.

## Read against

**Purpose.**
- The owner's first statement, `skeleton.md:7–10` (rendering 14–18): the mission is «оценка и улучшение текста», any text; «итеративно через пайплайн и мультиагентность, храня множество правил, бестпрактис и быть способными их найти»; «Без признака нейрослопа, неся истинную ценность».
- The second statement, `skeleton.md:22–31` (rendering 35–40): «Нигде не требуется проза, вода, нейрослоп и прочее. За каждым словом должна быть причина. Каждое слово должно нести смысл»; the README matches the code, with no binding to a version.
- The third governing input, the owner's read of round 03, `skeleton.md:44–51` (rendering 53–55): the user wants the result, not what the author did with the plugin; the README holds the pipeline's architecture, which methods it checks, where they come from and why, and the guarantees.
- *Reader profile*, `audit.md:19–22`: the target reader documents any document, not only code; the owner's intent is any text in any language, code or not. Also `audit.md:31` (NOT NECESSARILY AN ENGINEER) and 34–39 (what brings them here).

**Rules.** `skeleton.md` part 3, items 1–7 (lines 208–293). Item 6 adopts `stages.md` rules 1–11 (`stages.md:319–351`), and rule 12 comes in through the second statement (`skeleton.md:29–31`). Also the words decided in part 4 (`skeleton.md:295–328`).

**Also read.** `owner-readme-words.md`; the verdict at `purpose.md:24–28`; `skeleton-read-02.md`, the Quick-start half of the owner's read, which skeleton 2.2 rests on; `03-routes.md` for comparison. `R/04-terms-rejected.md` does not exist. I read `research/2026-09-22-terse-process/rethink-2026-09-23/04-terms-rejected.md` in the repository instead: its sha256, `d3f681d9…`, equals the rethink run's copy.

**Checks run.** rule1 prints `0 violation(s)`. The headings are exactly the eight listed. `dup.mjs` prints `0 concept(s) in three or more sections`. The fences are 2 `bash` and 3 `text`, and `/plugin` appears 0 times. The qualifier grep counts 0. Rule 7's grep, its `pipeline` check and its `[a-z]+ readers?` check print nothing, and its must-occur words and first-use glosses hold. Its Must-use list fails (P2–P4). The part 4 words fail (P7). The budgets fail (P6).

## Findings

**P1 — water, paragraph level; repeats the rejected "pipeline described twice".** Lines 40–43:

> Recommended orders, each command run by you:
> - `/terse:audit` → `/terse:rewrite` → `/terse:audit` again with the same questions
> - `/terse:rethink` → `/terse:rewrite` → `/terse:audit`

Lines 24–37 have just told the route with three fences: audit, then stop, or rewrite if the shape stands, or rethink first if it does not. These lines tell it again as arrows. The Skills column "When to run it" (58–60) tells it a third time, as skeleton 2.3 plans. Fails:
- The owner's verdict on the rejected draft, "the pipeline described twice, better shown with another syntax" (`purpose.md:25–26`). That draft did the same thing: two prose sentences on where to start (`04-terms-rejected.md:10–11`), then an arrow fence of the same routes (13–17).
- Skeleton 2.2's device, which gives one telling in order ending "whose skeleton rewrite then writes from; last, audit again with the same questions" (`skeleton.md:128–130`), and 2.3's "the chains of commands (the Workflow block holds them: one home)" (`skeleton.md:141–142`).
- «Нигде не требуется проза, вода» (`skeleton.md:23`).

Cut proposed: line 43, 6 tokens. Each of its steps is already on the page: rethink first at 34 and 59 ("run this first"; "No document yet"), rewrite from a skeleton at 60, and audit after rewrite at 42. Line 42 cannot be cut: `grep -n -w -i again 04-shape.md` prints only line 42. It is the page's one "audit again with the same questions", the device's last step.

**P2 — rule, by its words.** Line 40: "Recommended orders, each command run by you:". Fails:
- Part 3 item 7's Must use: "you start each one yourself" and "workflow (the route across the skills)" (`skeleton.md:286–287`; part 4 rows [6] and [51], lines 304 and 316).
- Part 3 item 3's one home for this idea, Skills (`skeleton.md:229`). Line 62 already says "You start each one yourself." The variant escapes the concept's pattern `start each one yourself|starts? (?:on its own|by itself)`, so `dup.mjs` prints the idea in 1 section while it stands in 2.

Cut proposed: ", each command run by you", 5 tokens. "orders" for the route stays, because no cut changes a name.

**P3 — technical detail above the middle.** Line 24: "Before starting agents, audit says how many and on which model, and waits until you say so; rewrite does so before its writers and judges, and before a round's reviewers." This is the page's first mention of rewrite, five lines before its fence (29). It arrives with rewrite's internal roles, which How it works explains 44 lines later (68). Fails:
- Part 3 item 6: `stages.md` rules 2 and 3 as adopted, "technical detail only at or after How it works" (`skeleton.md:266`).
- Skeleton 2.2's Excludes: "what happens inside a skill (2.4)" (`skeleton.md:114`).
- Part 3 item 3's home, "writers, judges, reviewers — How it works" (`skeleton.md:238`). `dup.mjs` prints "Quick start | How it works".
- Part 3 item 7: "reviewer, first as 'AI reviewers, each checking one thing'" (`skeleton.md:289–290`). This is the page's first "reviewer".

Why rules 2 and 3 hold for this document: they are this owner's calibration, and he named this exact fault: «почти с самого начала идет технические детали, а ведь это вводный блок призванный продать, а не напугать» (`owner-readme-words.md:101`). The reader is also "NOT NECESSARILY AN ENGINEER" (`audit.md:31`).

Cut proposed: "before its writers and judges, and before a round's reviewers", 10 tokens. "rewrite does so." remains, so the page still says rewrite also asks first.

**P4 — rule, by its words.** Line 68: "AI reviewers, each from its own angle". Fails part 3 item 7, "reviewer, first as 'AI reviewers, each checking one thing'" (`skeleton.md:289–290`), and part 4 row [44] (`skeleton.md:315`). The phrase comes from round 03 (`03-routes.md:63`) and was kept after the skeleton decided on the other one. `grep` for `checking one thing` prints nothing. The decided gloss says what each reviewer does; "its own angle" does not. Across the page, "reviewer" is bare at 24 (P3), unglossed at 67, and here glossed in words other than the decided ones.

Cut: none. The rule asks for its words.

**P5 — water, in a table cell.** Line 74: "Part two of a four-part rewrite, measured on one README: [the rules](...)". Fails:
- The owner's read of round 03: «Почему ему должно быть интересно, что создатель плагина там с ним делал. Ему главное результат.» (`skeleton.md:46–47`). Which pass of the author's experiment produced the rules is a record of what the author did with the plugin.
- «Каждое слово должно нести смысл» (`skeleton.md:23–24`). Everywhere else on the page, "rewrite" is the command (part 4 row [4], `skeleton.md:302`). "A four-part rewrite" gives the word a second meaning that nothing on the page introduces.

Cut proposed: "Part two of a four-part rewrite,", 6 tokens. "measured on one README" and the link still say where the rules come from and how much evidence stands behind them.

**P6 — rule 4, budgets.** `node "$S/sections.mjs" 04-shape.md budgets.json` prints:

```
   65 / 70   -5   (opening)
  246 / 190  +56   Quick start
  123 / 110  +13   Skills
  164 / 115  +49   How it works
  190 / 160  +30   Checks and guarantees
  788 TOTAL, 4 section(s) over budget
```

The block awk prints Workflow 206 (limit 140), Install 17 (limit 26) and Update 17 (limit 18). Fails:
- Part 3 item 4 (`skeleton.md:246–249`): "no section over and a total of 645 or less … An overrun is a question to the owner, answered in this file". `grep -n -i overrun skeleton.md` prints only line 248, so no answer is recorded.
- The purpose. `sections.mjs 03-routes.md` prints 687 TOTAL, so this round adds 101 tokens to a page the skeleton meant to shrink to 645. That goes against «Нигде не требуется … вода» and the verdict "water in paragraphs" (`purpose.md:27`).

Two facts for the owner's answer. First, skeleton 2.4's own device text, from "audit — a profile" to "twenty words or more" (`skeleton.md:153–161`), is 152 tokens against its budget of 115 (`skeleton.md:151`). The +49 in How it works therefore comes from the skeleton, not from this round. Second, the cuts in P1, P2, P3 and P5 save 27 tokens against 143 over.

Cut: none beyond those.

**P7 — rule, by its words; the scope the owner asked for.** Line 24: "It asks for the scope — which files to check, every tracked `.md` by default — and where your readers start." Fails:
- Part 4 row [7], "Markdown once, as the scope fact" (`skeleton.md:305`). `grep` for `Markdown` finds nothing in `04-shape.md`.
- The owner's read of round 03: «Нужно же указать скоуп, что нужно проверить. А это может быть как как-то выделенный текст, так и папка с md.» (`skeleton-read-02.md:12–13`). Skeleton 2.2's device carries this as "the Markdown files to check, named one by one or as a folder" (`skeleton.md:121–122`). The block names files and a default but no folder. The page's three "folder"s (26, 32, 80) are all the plugin's own.

Whether the audit page accepts a folder is for the code lens to check; skeleton part 7 says it does (`skeleton.md:374–375`).

Cut: none.

## Section by section

- **Opening (1–3):** what terse is for, its aim, what it is not, and when to want it. Item 5, the first sentence: it carries the first statement's mission. «Оценка и улучшение текста» becomes "assessing and improving any text", and «итеративно, мультиагентность, правила, бестпрактис» becomes "rounds of edits by several AI agents working from rules and best practices". It has no "?", no process name, and no tie to README. No finding.
- **Quick start › Install (7–14):** the two commands to copy and the one prerequisite, in 17 tokens.
- **Quick start › Workflow (16–43):** how to apply it. Audit, then stop or judge the shape, then rewrite, or rethink first; what comes back, and that you decide. Then the route again (P1, P2), rewrite's internals up front (P3), and no folder in the scope (P7). At 206 tokens it is the page's largest block.
- **Quick start › Update (45–52):** the two update commands and the restart.
- **Skills (54–62):** the table the owner asked for. It shows which of the three to run in which situation and what each hands back. It also names the one case the Workflow does not: no document yet.
- **How it works (64–68):** the architecture the owner asked for: each skill's steps in order, with a link to its page. It starts at token 435 of 788, below the middle.
- **Checks and guarantees (70–82):** which methods check the text, where each comes from, what is promised and what is not. This matches the owner's «какие методы проверяет, откуда эти методы и почему … гарантиях качества».

Counts by kind:
- 1, a section that buys nothing: 0
- 2, rules broken: 4 (P2, P4, P6, P7)
- 3, water: 2 (P1, P5)
- 4, technical detail above the middle: 1 (P3)
- 5, the opening's first sentence: 0
