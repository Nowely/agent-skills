# Opus lens 7, round 03: purpose and content

Document: `R/03-routes.md`, 74 lines, 687 words by `sections.mjs`;
R = `$TMPDIR/terse/runs/20260924-002235-terse-readme-rewrite2`.
A bare `Lnn` is a line of the document.

## Read against

**Purpose**
- The owner's first statement, `skeleton.md:7–10`, rendering `:14–18`; the Russian governs. It covers assessing and improving text, «Документация, комментарии, проза, текст и даже код, и тд - не важно», iteratively and with several agents, rules and best practices «и быть способными их найти», and «Без признака нейрослопа, неся истинную ценность».
- The second statement, `skeleton.md:22–31`, rendering `:35–40`: any text; «За каждым словом должна быть причина. Каждое слово должно нести смысл»; the README first, documentation and code later; the README matches the code as it is, with no binding to a version.
- The line under *Reader profile*, `audit.md:19–22`: the target reader documents any document, not only code, and "the owner's own intent, not in any page, is that terse works on any text in any language, code or not". A finding that cites another line of the profile (`audit.md:25–26`, `:46–47`, `:51–52`) says so.

**Rules**
- `skeleton.md` part 3, items 1–7 (`:197–280`): `rule1.mjs` with the cut at How it works; the headings; one idea, one home (`concepts.json`); the budgets; the fences; the eleven content rules of `stages.md`, all adopted (`:249–256`, `stages.md:319–351`); the words.
- Part 4, the terminology table (`skeleton.md:282–317`).
- Rule 12 (`stages.md:352–359`) is the last paragraph of the second statement, so I read it as part of the purpose.

**Calibration, and how each change is dated**
- Calibration: `owner-readme-words.md` and the verdict in `purpose.md:24–28`.
- The rejected round: `R/04-terms-rejected.md` does not exist. I read `.../runs/20260923-212113-terse-readme-rethink/04-terms-rejected.md` instead. Its SHA-256 (`34cc4cb0…`) matches `research/2026-09-22-terse-process/rethink-2026-09-23/04-terms-rejected.md`.
- Each change is dated with `diff 02-grafts.md 03-routes.md` and with `01-candidate.md`.
- Not opened: `R/reviews/` apart from this file, `rounds.md`, `ledger*.json`, `edits/`, and the reports of the verifier, critics, judges and writers.

**Mechanical checks**, run read-only on `03-routes.md` with `S=plugins/terse/skills/rewrite/scripts`:

    node $S/rule1.mjs … --cut "How it works"   0 violation(s), 0 excused
    grep -n '^#'                               # terse, ## Quick start, ## Skills, ## How it works, ## What was measured
    node $S/dup.mjs … concepts.json            0 concept(s) in three or more sections
    node $S/sections.mjs … budgets.json        65/70 · 215/180 +35 · 137/130 +7 · 163/140 +23 · 107/105 +2 — 687 TOTAL, 4 over
    fences                                     bash L7, text L16, text L22, text L29, bash L39; grep -c '/plugin' → 0
    rule-11 grep outside text fences           0
    words grep; "[a-z]+ readers?" grep         no output

`sections.mjs` totals by round: 01 601 (1 section over), 02 661 (4 over), 03 687 (4 over).

## Findings

### P1 — kind 2 — the route to a draft is told three times, and this round added the third

- L27: "Otherwise say whether the document's shape — what it says, in what order — stands. If it does, run this and, when it asks, give it the folder the report names; if not, run `/terse:rethink` first to decide a new one"
- L52: "After audit, once you say the shape stands; or from a skeleton you agreed to"
- L56–57: "`/terse:audit` → `/terse:rewrite` → `/terse:audit` again with the same questions" · "`/terse:rethink` → `/terse:rewrite` → `/terse:audit`"

**Fails:** part 3 item 3, "One idea, one home" (`skeleton.md:207`). `concepts.json` has no entry for the route, so `dup.mjs` cannot see it.

**Repeats** the verdict "the pipeline described twice" (`purpose.md:25–26`). The skeleton named this as its least sure point: "audit → rewrite is then seen twice … the round-04 fault" (`skeleton.md:395–396`).

**Proven** by the diff: "once you say the shape stands" is new in round 03 (`02-grafts.md:50` reads "After audit, or a skeleton you agreed to"). With it, the table cell restates L27's condition. The doubling the skeleton left for the owner's read is now told three times.

**Cut:** "once you say the shape stands;" (L52, 6 words), leaving "After audit, or from a skeleton you agreed to". That is the skeleton's own cell (`skeleton.md:132–133`). The doubling between L27 and L56–57 stays for the owner's read, as the skeleton planned.

### P2 — kind 4 — rewrite's internal roles appear in Quick start, in the standalone paragraph the owner rejected

- L35: "Before starting agents, audit says how many and on which model, and waits until you say so; rewrite does so before its writers and judges, and before a round's reviewers."

**Above the middle:** line 35 of 74, ending at word 265 of 700 by `awk '{c+=NF}'`. The midpoint (word 350) falls in the Skills table, at L51.

**Fails:**
- `stages.md` rule 3, "Technical detail lives in one section of its own, below the middle" (`:324`).
- Rule 2: no "process names … in the sections a reader meets first" (`:322–323`).
- Part 3 item 3: the concept "writers, judges, reviewers — How it works" (`skeleton.md:226`). `dup.mjs` finds it in "Quick start | How it works".

**Why these rules hold here:** the verdict names "technical detail a reader does not need" (`purpose.md:27`). The owner also wrote «почти с самого начала идет технические детали, а ведь это вводный блок призванный продать, а не напугать» (`owner-readme-words.md:101`).

**The repeat, proven from the files:**
1. The rejected round gave the announcement a paragraph of its own: "All three skills announce how many agents they are about to spawn, on which model, and wait for your word." (`04-terms-rejected.md:56–57`; also `00-original.md:38`).
2. The skeleton moved it into the sentence about audit's first run (`skeleton.md:109–110`), and rounds 01 and 02 kept it there (`01-candidate.md:20`, `02-grafts.md:20`).
3. Round 03 took it back out (L20 now ends "and waits for your answer"), made it a paragraph again, and added rewrite's writers, judges and reviewers.

L35 now comes after rewrite's output (L33), once the walk-through has ended. The skeleton says Quick start runs "in the order they act" (`skeleton.md:97`).

**Cut:** "before its writers and judges, and before a round's reviewers" (10 words), leaving "…waits until you say so; rewrite does so." On a copy with the cut applied, `dup.mjs` prints "writers, judges, reviewers — How it works  How it works".

### P3 — kind 2 — four sections are over budget, and this round moved further from it

- `sections.mjs`: Quick start (L5–44) 215/180, +35. Skills (L46–57) 137/130, +7. How it works (L59–67) 163/140, +23. What was measured (L69–74) 107/105, +2. Total 687, 4 sections over.

**Fails:** part 3 item 4: "no section over its budget and a total of 625 or less; an overrun is a question to the owner, answered in this file" (`skeleton.md:234–235`). `grep -n -i overrun skeleton.md` matches only line 235, so the file holds no answer. I did not open `rounds.md`, per the brief.

**Growth by round:** the total went 601 → 661 → 687. Quick start went 154 → 201 → 215. It is the largest overrun, and it is the section the verdict called verbose ("Install verbose", `purpose.md:26`).

**Why the budget matters here:** the owner agreed the skeleton at 625 (`stages.md:376–377`). He wrote «Каждое слово, каждое предложение как бы имеет вес … как в задаче о рюкзаке» (`owner-readme-words.md:127`).

**Cut:** the cuts in P1, P2, P4, P11 and P12, 31 words in all. On a copy with them applied (`$TMPDIR/lens7-r3/03-cuts.md`), `sections.mjs` prints a total of 656 with 3 sections still over: Quick start 200/180, How it works 159/140, What was measured 107/105. The rest of the overrun is a question for the owner.

### P4 — kind 2 — "By default" is a caveat added this round

- L63: "By default three writers draft and two judges pick, then rounds of edits, checked by AI reviewers, each from its own angle."

**Fails:** `stages.md` rule 11: "A qualification is not a fix. A sentence that needs a caveat to be true says too much: say less, or link the source" (`:348–349`).

**Why it holds here:**
- The rule came from rounds that added caveats while regressions rose from one to ten (`:349–351`).
- This round added two caveats: "By default" here and "silently" (P5). It also added three new conditions: L27 "when it asks", L52 "once you say the shape stands", L64 "with as many agents as you allow". Over the same round the total rose from 661 to 687.
- The skeleton's rule-11 check greps five other phrases (`skeleton.md:255–256`) and prints 0, so it catches none of these.
- "By default" also implies a setting that the page never names, while How it works excludes "a rule catalogue or configuration (there is none)" (`skeleton.md:153`).

**Cut,** following rule 11's "say less": "By default three" and "two" (4 words), giving "Writers draft and judges pick, then rounds of edits, …". The cut loses the counts, which the skeleton's purpose for How it works names ("three writers, two judges", `skeleton.md:145`). The choice between keeping the counts and keeping the caveat is the owner's.

### P5 — kind 2 — "silently" is a caveat on the guard

- L66: "A round that silently loses a sentence checked true, or repeats one found false, is refused before you see it."

**Fails:** rule 11, for the same reasons as in P4.

"silently" is new this round. `02-grafts.md:64` read: "A round that drops a claim checked true, or brings back one found false, is refused before you see it." With the word, the sentence reads as if a round that loses such a sentence and says so is not refused. That narrows the one guard the profile gives as a reason to choose this plugin: "a ledger and an executed check refuse a round that got worse" (`audit.md:47`, a profile line outside 19–22). The profile's "cannot silently break what worked" (`audit.md:46–47`) is about control questions, not about this guard.

**Cut:** none. Cutting "silently" brings back round 02's sentence, and this lens does not check whether that sentence is true. Rule 11's remedy, saying less or linking the source, needs a rewrite.

### P6 — kind 2 — reviewers are not first named in the decided words

- L35: "before a round's reviewers". This is the page's first "reviewer".
- L63: "checked by AI reviewers, each from its own angle".

**Fails:**
- Part 3 item 7, Must use: "reviewer, first as 'AI reviewers, each checking one thing'" (`skeleton.md:274–275`).
- Part 4 row [44], "rename critic ('AI reviewers, each checking one thing')", because "a critic judges taste" (`skeleton.md:304`).

`grep -c 'each checking one thing'` gives 0 for 03 and 1 for 02 (`02-grafts.md:61`). "each from its own angle" is "lens" in plain words. Part 4 drops "lens" (`skeleton.md:311`) and the words grep bans it (`skeleton.md:260`). "Angle" also invites the taste reading that the table was chosen to avoid.

**Cut:** none, since no cut restores the decided words. P2's cut removes the use at L35.

### P7 — kind 2 — consent to the agents is split across two sections

- L64: "rethink starts by reading documents like yours, with as many agents as you allow."

**Fails:** part 3 item 3.
- The concept "agents announced, then it waits — Quick start" (`skeleton.md:214`) has one home, Quick start. L64 puts the same idea for rethink into How it works, while L35 covers only audit and rewrite.
- The concept's pattern, "how many agents|which model|announce", does not match "as many agents as you allow", so `dup.mjs` counts it in one section only.
- L64 also carries three mechanisms (what the rules forbid, what rethink reads first, and the consent), where How it works is meant to have "one mechanism per item" (`skeleton.md:155`).

**Proven** new this round: `02-grafts.md:62` ends "rethink reads documents like yours first."

**Cut:** none. Cutting ", with as many agents as you allow" (7 words) would drop rethink's consent from the page, since L35 names only audit and rewrite.

### P8 — kind 1 — How it works leaves out half of what the profile says audit does

- L61: "…against an answer key written first from the code or a named source; the same questions run without your text."
- L62: "Wrong answers get a cause: false, missing, misplaced, hard to find, misleading steps."
- L66: "…loses a sentence checked true, or repeats one found false…"
- L50: "A report: which questions the text answers wrong, why, file and line; no rewording"

**Fails the profile** (lines outside 19–22): "one measures whether readers get the right answer and whether each sentence is true of the code" (`audit.md:25–26`), and the reader's own words «проверь, что в доке правда» (`audit.md:51–52`).

**The first gap:** the page never says that each sentence of the reader's document is checked against the code.
- Leaving out the excerpt and the product name, "code" appears once, at L61, as the source of the answer key.
- "claim" appears 0 times; this round changed the last one to "sentence" (`02-grafts.md:64`).
- "false" and "checked true" assume a check that the page never names.
- The concept "claims against the code — How it works" (`skeleton.md:223`) passes only because of "named source" at L61, and that phrase belongs to the answer key.

**The second gap:** the section also does not say that questions the text already answers right are asked every time. The profile puts it as "control questions are mandatory, so a repair cannot silently break what worked" (`audit.md:46–47`). The page has this only as a result from 2026-09-10 (L71).

**Cut:** none, because this is a gap. Both gaps go back to round 01 (`01-candidate.md:56–62`), and the skeleton's purpose for How it works (`skeleton.md:141–151`) mentions neither.

### P9 — kind 5 — the first sentence says "any text", and the rest of the owner's intent appears only inside the excerpt

- L3: "A Claude Code plugin for assessing and improving any text, in rounds of edits by several AI agents working from rules and best practices."

**Passes the rules on the opening:**
- It says what terse is for, with no "?" (`skeleton.md:249–250`).
- The opening holds none of consent, the folder, or the agents' announcement (`dup.mjs`; `skeleton.md:250–251`).
- It has no question, "documentation", README, version, command, number or date (`skeleton.md:85–88`).
- It does not repeat the verdict's "starting with a question", "tied to 'README'" or "silent on what the plugin is for" (`purpose.md:24–25`). This round cut "a README first" (`02-grafts.md:3`).

**Fails the line under *Reader profile*:** "the owner's own intent, not in any page, is that terse works on any text in any language, code or not" (`audit.md:21–22`), together with «Документация, комментарии, проза, текст и даже код, и тд - не важно» (`skeleton.md:8`).

The sentence carries "any text". The rest of the intent ("in any language, code or not") is on the page only at L23–24, inside the excerpt, where it is reported as something that "appears in no page". The excerpt has been there since round 02.
- L20 introduces the excerpt as "Its report on this plugin's README".
- L73 calls the subject of the same audit "its previous README". **Proven** same audit: the cited report is byte-identical to `R/audit.md` and holds "docs 5/7, no-document 0/7" at `:993`.
- L14 gives the scope as "where the Markdown files are".

A reader who asks whether a Russian document or code comments are covered gets three different answers. This is a **hypothesis**: the effect on readers has not been measured. The sentence follows the skeleton, which leaves language to the owner (`skeleton.md:374–375`) and keeps it out of the opening (`skeleton.md:87–88`). The excerpt settles that open decision on the page without him.

**Cut:** none. The excerpt is quoted word for word (rule 7: `grep -F` finds it at `research/2026-09-22-terse-process/audit-2026-09-22/audit.md:1014–1015`), and which excerpt to use is the owner's choice (`skeleton.md:407–410`).

### P10 — kind 2 — rethink is the one command given only in prose

- L27: "if not, run `/terse:rethink` first to decide a new one"

**Fails:** `stages.md` rule 10: "A command goes in a fenced block, with a language, in the form that runs. Not prose around it" (`:343`).

**Why it holds here:** the owner asked for commands in code blocks (`owner-readme-words.md:130–136`). The page fences `/terse:audit` (L16–18) and `/terse:rewrite` (L29–31), so the reader on the rethink path is the only one told to type a command that has no block.

The departure comes from the skeleton itself: item 5 allows exactly three `text` fences (`skeleton.md:247–248`). The line has been prose since round 01 (`01-candidate.md:26`).

**Cut:** none.

### P11 — kind 3, below paragraph level — audit's wait is told twice

- L20: "It asks which files and where your readers start, and waits for your answer."

**Fails** «За каждым словом должна быть причина» (`skeleton.md:23`). A question already implies waiting for the answer, and L35 says again that audit "waits until you say so". The clause is new this round; at the same place, `02-grafts.md:20` had the agents' announcement.

**Cut:** ", and waits for your answer" (5 words).

### P12 — kind 3, below paragraph level — the chains already show where they end

- L54: "You start each one yourself, and both orders end in audit:"

**Fails** «Каждое слово должно нести смысл» (`skeleton.md:23–24`). Both chains below it (L56–57) visibly end in `/terse:audit`. The clause has been there since round 01 (`01-candidate.md:49`).

**Cut:** "and both orders end in audit" (6 words), leaving "You start each one yourself:".

No whole paragraph is water. Removing any one of them loses a step, a fact or a device that the purpose or the skeleton names.

## What each section buys

- **Opening** (L1–3, 65/70): what terse is for and how it works, its aim in the owner's words, that it is not a compressor, and the reader's problem. This is the first screen the purpose asks for.
- **Quick start** (L5–44, 215/180): install and update blocks, the one prerequisite, a first run with a real report line, the way to a draft or to rethink, and what comes back for the reader to decide on. It is everything a start needs, but over budget, and it tells the route before Skills does and names rewrite's internal roles (P1, P2).
- **Skills** (L46–57, 137/130): each command chosen by situation, with what it returns (the owner's table), "you start each one yourself", and the re-audit with the same questions, which the page says nowhere else. Its rewrite cell and its chains retell Quick start's route (P1).
- **How it works** (L59–67, 163/140): for the reader who came for the method. It covers how a wrong answer is found and classed, how a draft is made and checked, what the rules forbid, the guard, and where runs are kept. It does not say that each sentence is checked against the code (P8), and it has three qualifiers that are new this round (P4, P5, P7).
- **What was measured** (L69–74, 107/105): each figure with its date and size, *p* = 0.25, the missing run without the text, the plugin's own 5 of 7 against 0 of 7, the one thing never measured, and the link.
