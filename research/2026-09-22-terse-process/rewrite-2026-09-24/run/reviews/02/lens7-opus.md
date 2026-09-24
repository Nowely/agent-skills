# Opus lens 7, round 02: purpose and content

Document: `R/02-grafts.md`, 72 lines, 661 tokens by `sections.mjs`;
R = `/var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T//terse/runs/20260924-002235-terse-readme-rewrite2`.

## Read against

**Purpose.**
- The owner's first statement, the Russian governing (`skeleton.md:7–10` = `purpose.md:5–8`): the mission is
  «оценка и улучшение текста», of any kind — «Документация, комментарии, проза, текст и даже код, и тд - не
  важно»; iteratively, «через пайплайн и мультиагентность», «храня множество правил, бестпрактис и быть
  способными их найти»; «Без признака нейрослопа, неся истинную ценность».
- The second (`skeleton.md:22–31` = `purpose.md:32–41`): «научить работать и улучшать любой текст»; «Нигде не
  требуется проза, вода, нейрослоп и прочее. За каждым словом должна быть причина. Каждое слово должно нести
  смысл»; «Сейчас мы работаем на реадме, но позже будем эксперементировать с документацией, кодом»; take a
  text apart into «скелет, суть, структуру, смыслы»; «REAMDE всегда должен соответствовать коду … без везкой
  причины привязка к версии».
- The Reader profile (`audit.md:17–60`): the line under the heading (:19–22 — any document, not only code;
  the owner's intent: any text in any language, code or not); what brings them (:34–39); what earns trust
  (:54–56); voice (:58–60).

**Rules.** `skeleton.md` part 3 (:197–281): 1 `rule1.mjs --cut "How it works"`; 2 headings; 3 one idea, one
home (`concepts.json`); 4 budgets; 5 fences; 6 rules 1–11 of `stages.md`, adopted by number; 7 words, must
use and must not. Rule 12 of `stages.md` comes in through part 1 (:43, "The README describes the code in the
repository as it is") and "version" on part 3's must-not list (:279). Part 4's terms (:282–318). Calibration:
`owner-readme-words.md`, the round-04 verdict (`purpose.md:24–28`) and the rejected file.

**Inputs beyond the brief.** `R/04-terms-rejected.md` is not in R. I read
`/Users/ruliny/Git/agent-skills/research/2026-09-22-terse-process/rethink-2026-09-23/04-terms-rejected.md`
instead (sha256 `34cc4cb0…1da0efa5`, identical to the rethink run's copy). I read `R/01-candidate.md` for the
word diff behind "added this round". `R/concepts.json` drops `make it worse` from the pattern of part 3's
"a fix is not undone"; rule 3 prints 0 under either list.

**Mechanical results** (`plugins/terse/skills/rewrite/scripts/`, read-only):
- Rule 1: `0 violation(s), 0 excused`.
- Rule 2: `# terse`, `## Quick start`, `## Skills`, `## How it works`, `## What was measured`.
- Rule 3: `0 concept(s) in three or more sections`, with either list.
- Rule 4: fails. See P8.
- Rule 5: `bash` at 7 and 37, `text` at 16, 22 and 29, all under Quick start. `grep -c '/plugin'` → 0.
- Rule 6: items 1–11 hold. For 7, the excerpt is verbatim at
  `research/2026-09-22-terse-process/audit-2026-09-22/audit.md:1014–1015`. For 11, the count is 0.
- Rule 7: both greps print nothing. The first sentence with "skeleton" (27) holds "outline"; the first with
  "shape" (27) holds "order"; the first with "diff" (33) holds "change". "AI reader" first appears as
  "fresh AI reader" (59). "score" is not used.

## Findings

Kinds: 1 what a section buys · 2 a rule broken · 3 paragraph-level water · 4 technical detail above the
middle · 5 the opening's first sentence. Counts: 1 — 3 (P3, P4, P7); 2 — 3 (P5, P6, P8); 3 — 0; 4 — 1 (P2);
5 — 1 (P1). "Repeats round 04" marks something the owner has already rejected (`purpose.md:24–28`).

**P1. Kind 5, line 3. Repeats round 04.**
Quote: "A Claude Code plugin for assessing and improving any text, a README first, in rounds of edits by several
AI agents working from rules and best practices."
Fails: the round-04 verdict, "tied to "README" where the plugin is for any text" (`purpose.md:25`), and the
profile's voice, "Never narrow the subject" (`audit.md:59`). The Russian says the kind of text does not
matter: «Документация, комментарии, проза, текст и даже код, и тд - не важно» (`purpose.md:6`).
«Сейчас мы работаем на реадме» (`purpose.md:34`) says where the owner's work stands today. "First" takes that
stage, and the promise of a next one, and makes it part of what the plugin is. The rest of the sentence gives
the mission in the owner's own terms (оценка и улучшение, любой текст, итеративно, мультиагентность, правила и
бестпрактис). It passes `stages.md` rule 1 and part 3 rule 6, item 1.
Cut: "a README first," — 3 words (opening 68 → 65). What was measured (69, 71) already says both runs were on
READMEs. The cut contradicts 2.1's purpose line (`skeleton.md:80–81`), and least-sure #4
(`skeleton.md:405–406`) leaves the question to the owner's reading of this sentence.
Evidence: level 1 for the lines. That a reader takes the sentence as README-only is a hypothesis.

**P2. Kind 4, line 12. Repeats round 04.**
Quote: "You need: Node 22 or newer, and a signed-in Claude Code."
The Node half is the line the skeleton kept (part 3 rule 6, item 4; `skeleton.md:383`). This round added
", and a signed-in Claude Code" (word diff 01 → 02).
Fails: `stages.md` rule 4, "A prerequisite that is satisfied on nearly every machine is noise — unless the
document depends on it elsewhere." It applies here because the profile allows one assumption, "Claude Code is
installed" (`audit.md:32`). The reader's next step runs inside Claude Code (line 14), and nothing else on the
page depends on being signed in (`grep -n -i sign` → line 12 only). The clause brings back the rejected
round's "Running a skill needs you signed in to it" (`04-terms-rejected.md:61`), from the Install the owner
called verbose (`purpose.md:26`), and a prerequisite of the kind he called «мусорные детали»
(`owner-readme-words.md:107`). It also goes beyond 2.2's device, "'You need: Node 22 or newer' as one line"
(`skeleton.md:107`).
Cut: ", and a signed-in Claude Code" — 5 words (Quick start).
Evidence: level 1 for both lines. That a reader inside Claude Code is already signed in is a hypothesis; this
lens did not check it.

**P3. Kind 1, lines 20 and 22–25.**
Quote: "From its report on this plugin's README, 2026-09-22:" / "`missing`: the owner's intent — the method holds
for any text / in any language, code or not — appears in no page"
Fails: this is the page's only sample of what audit hands back, and it has no question, no file and no line.
Row 48 promises all three ("which questions the text answers wrong, why, file and line"), and the trust clause
names them: "A failure that arrives with a file, a line and the code behind it" (`audit.md:54`). "The owner's
intent" means the plugin owner's intent, which the reader has to work out from "this plugin's README". The
excerpt also says "in any language". The line under the profile records that as the owner's intent
(`audit.md:21–22`), and the skeleton leaves it to the owner (`skeleton.md:374–375`). The opening makes no such
claim, so the page states it only inside a quotation that reports it missing.
Cut: none that keeps part 3 rule 5 (the excerpt is one of the three `text` fences) and 2.2's device. Which
finding to quote is least-sure #5 (`skeleton.md:407–411`), the owner's pick.
Evidence: level 1 for the text and its source lines. The reader's inference is a hypothesis.

**P4. Kind 1, lines 27 and 33 against 49–55. Repeats round 04.**
Quote: 27 "If it does, run this and give it the folder the report names; if not, run `/terse:rethink` first to
decide a new one: a skeleton, an outline you agree to." · 33 "It hands back a new draft of your whole document
and its diff" · 49 "A skeleton: an outline of sections, each with its purpose and budget, to agree to before
anything is written" · 50 "After audit, or a skeleton you agreed to | A new draft of the whole document, and
its diff" · 54–55, the two chains.
Fails: the verdict "the pipeline described twice, better shown with another syntax" (`purpose.md:25–26`). The
order (audit → rewrite, or rethink → rewrite) is told at 27, again in the When column (49–50) and a third time
in the chains (54–55). What rethink hands back is told at 27 and at 49; what rewrite hands back, at 33 and at
50. Both second tellings in Quick start were added this round (word diff 01 → 02: "a skeleton, an outline you
agree to"; "new … of your whole document"). Rule 3's check cannot see this, because no concept in
`concepts.json` covers the order or the returns.
Cut: ": a skeleton, an outline you agree to" at 27 (7 words), and "new" and "of your whole document" at 33
(5 words) — 12 words from Quick start. Row 49 then holds the first "skeleton" and its "outline", and rule 7
still passes (checked on the copy in P8). No cut is proposed for the order itself: any cut there loses either
the path from a report to a draft (27) or the return to audit (54). Least-sure #1 (`skeleton.md:395–398`)
leaves that to the owner.
Evidence: level 1 for the lines and the diff. The owner's reaction is a hypothesis.

**P5. Kind 2, line 49.**
Quote: "each with its purpose and budget"
Fails: `stages.md` rule 8, "Internal jargon — … a term the reference files use — is for readers who are
agents. Where the reader is a person, the word that names the claim is the word to use." It applies here
because "budget" is the skeleton's own term for a section's word count (`skeleton.md:75–76`, "Budgets are
`sections.mjs` counts"). The reader is a person, "NOT NECESSARILY AN ENGINEER" (`audit.md:31`), and the page
has already named agents and a model (line 20); next to those, an unqualified "budget" reads as cost. Rule 7's
grep does not list the word, so the mechanical check passes.
Cut: "and budget" — 2 words (Skills). What is lost: that each section of a skeleton has a set length.
Evidence: level 1 for where the term comes from. The cost reading is a hypothesis.

**P6. Kind 2, lines 52 and 55.**
Quote: 52 "both orders end in audit:" · 55 "- `/terse:rethink` → `/terse:rewrite` → `/terse:audit` for the first
time"
Fails: `stages.md` rule 11, "A sentence that needs a caveat to be true says too much: say less." It applies
here because this round added a narrowing clause, "for the first time" (word diff), and the page's own line 27
contradicts it, which is the pattern the rule records. At 27, audit runs first; if the shape does not stand,
rethink and then rewrite follow, so the closing audit is not the first. Row 49's second case, "it says the
wrong things in the wrong order", is the same existing document. "Both orders" leaves that third order out.
The clause also departs from 2.3's device, "two chains of commands, each ending in audit again with the same
questions" (`skeleton.md:134–135`).
Cut: "for the first time" — 4 words (Skills). The chain then holds for a new document and a reshaped one.
Evidence: level 2. An independent reader of 27, 49, 52 and 55 would say the same.

**P7. Kind 1, line 62, with line 3.**
Quote: 3 "Its aim is text in which every word carries weight and meaning, without AI slop." · 62 "The rules forbid
cutting or weakening a condition, a limit or a warning where your readers decide; rethink reads documents like
yours first."
Fails: How it works names the rules once, by one thing they forbid, and that rule protects words from being
cut. Nothing says how the rules reach the aim the opening sets: "slop" and "weight" occur only on line 3, and
"filler" occurs nowhere. The purpose puts that aim at the centre: «Без признака нейрослопа, неся истинную
ценность» (`purpose.md:8`); «Нигде не требуется проза, вода, нейрослоп и прочее. За каждым словом должна быть
причина» (`purpose.md:33`). The skeleton meant this section to carry it: "slop as what the rules forbid (2.1,
2.4)" (`skeleton.md:186`), and "writing rules named by what they forbid — among them cutting or weakening a
condition …" (`skeleton.md:145–146`).
Cut: none, since a cut cannot add what is missing.
Evidence: level 1 for the lines and the grep. What a reader concludes from the gap is a hypothesis.

**P8. Kind 2, the whole page.**
Quote (`sections.mjs` against `budgets.json`): "201 / 180 +21 Quick start", "133 / 130 +3 Skills", "148 / 140
+8 How it works", "111 / 105 +6 What was measured", "661 TOTAL, 4 section(s) over budget".
Fails: part 3 rule 4 (`skeleton.md:234–235`) requires every section within its budget and a total of 625 or
less, and says "an overrun is a question to the owner, answered in this file". `skeleton.md` holds no answer
(`grep -n overrun` → :235 only). Round 01 came to 601, with How it works the only section over. This round
added 60 words, 47 of them in Quick start (154 → 201). Quick start holds Install, which the owner called
verbose in round 04 (`purpose.md:26`). The growth is in the first-run prose and the prerequisite line, not in
the install fence.
Cut: P1, P2, P4, P5 and P6 together bring the page to 635: opening 65, Quick start 184 (+4), Skills 127, How
it works 148 (+8), What was measured 111 (+6). Rules 1, 3 and 7 still pass on that copy. This lens proposes no
cut in How it works or What was measured, so the remaining overrun is the owner's question. To reproduce:

```bash
R=/var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T//terse/runs/20260924-002235-terse-readme-rewrite2
S=/Users/ruliny/Git/agent-skills/plugins/terse/skills/rewrite/scripts
sed -e '3s/any text, a README first, in rounds/any text, in rounds/' \
    -e '27s/to decide a new one: a skeleton, an outline you agree to\./to decide a new one./' \
    -e '33s/It hands back a new draft of your whole document and its diff/It hands back a draft and its diff/' \
    -e '55s/ for the first time$//' \
    -e '12s/Node 22 or newer, and a signed-in Claude Code\./Node 22 or newer./' \
    -e '49s/each with its purpose and budget,/each with its purpose,/' \
    "$R/02-grafts.md" > "$TMPDIR/lens7-opus/02-cuts.md"
node "$S/sections.mjs" "$TMPDIR/lens7-opus/02-cuts.md" "$R/budgets.json"
```

Evidence: level 3. Both counts were run.

**Checked, nothing found.** Kind 3: no paragraph can be removed without losing something the purpose needs.
The nearest, line 70 (2,725 → 2,571 words), is the only measured evidence for "not a compressor", so it
stays. Kind 4, apart from P2: rule 1 finds nothing above How it works. How it works starts at token 403 of 661
and at line 57 of 72, below the middle by either count. "Node 22" (12), "the folder the report names" (27) and
the folder clause at 33 are all the skeleton's own (part 3 rule 6, item 4; 2.2's purpose; the folder concept
in rule 3).

## What each section buys

- **Opening** (1–3, 68): what terse does — works on any text, in rounds, by several AI agents, from rules and
  best practices — plus its aim, that it is not a compressor, and the situation it is for. Enough to decide
  whether it is for you (P1).
- **Quick start** (5–42, 201): install in two lines; the prerequisite; the first run, including what audit asks
  and announces before it starts agents; a sample finding; the choice to stop, rewrite or rethink; what
  rewrite hands back, with the repository untouched; the update. The path from nothing to a reviewed draft
  (P2, P3, P4, P8).
- **Skills** (44–55, 133): which skill for which situation and what each hands back, then the orders and the
  return to audit. How to pick a skill (P4, P5, P6).
- **How it works** (57–65, 148): how an answer is judged; how a draft is made and picked; the guard that refuses
  a round that loses a checked claim; where runs are written. The method and the trust points for a reader who
  came for them, minus any mechanism for the aim (P7).
- **What was measured** (67–72, 111): each figure with its date, sample and *p*; the size change; the plugin's
  own run with and without the text; what was never measured. Trust sized to the evidence, as the profile asks
  (`audit.md:54–55`).
