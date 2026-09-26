# Critic CF — the owner's calibration

Run `R=$TMPDIR/terse/runs/20260923-212113-terse-readme-rethink`.
Lens: would the owner send a document written from this structure, and which of his words does it satisfy
or break. `owner:N` is line N of `R/owner-readme-words.md`; `purpose:N` of `R/purpose.md`; `audit:N` of
`R/audit.md`; `structure-map` is `research/2026-09-11-markup-round-0/structure-map.md`, the round the owner
called better (purpose:28) — the coordinator's writing, not his. Every quotation is verbatim; every line
cited was read this turn. What the owner *said* is level 1; what he *would* do is a hypothesis (level 2).

## The ruler

The owner's words that decide a README, in the order he applies them when he reads one:

- **R1 — the first screen is the mission, goal, task.** owner:44 «самое начало - его важнейшая часть»;
  owner:45 «Вместо того, чтобы сказать самое важное - про его миссию, цель или задачу (для чего вообще
  этот плагин нужен) ты начинаешь перегружать терминами, определениями и техническими деталями»;
  owner:100 «нет блока с целями или его заменяющий блок с философией проекта. Не очень понятно, какую
  цель, задачу мы решаем».
- **R2 — the opening sells, it does not warn.** owner:101 «почти с самого начала идет технические
  детали, а ведь это вводный блок призванный продать, а не напугать»; owner:119 «как сделать так, чтобы
  вступление было продающим. Я бы уповал на нашу главную философию».
- **R3 — rights and mechanism early are poor delivery; mechanism has one place.** owner:159 «2 и 3 будто
  бы нужно переосмыслить. 2ф говорит про throwaway copy, про read only и так далее. Возможно, это важно,
  но подача не очень»; owner:104 «Если хочешь рассказать про технические детали, то нужна отдельная
  секция из разряда "как это работает"».
- **R4 — the parts of a plugin README.** owner:142 «заголовок, что это и какую задачу выполняет, быстрый
  старт, набор команд … нет таблицы с командами скилов, хотя по сути эта база для плагина (как
  пользователю понять, что вызывать)»; owner:105 «понравилось что есть Install and first run»; owner:106
  «не хватает такого же блока на обновление»; owner:130, :136 commands in a code block, language-tagged,
  the full `claude plugin` form.
- **R5 — no trash, no water, a reader who may not be technical.** owner:46 «$TMPDIR - серьезно? Что это
  скажет человеку, который впервые сюда зашел и который может даже не технарь»; owner:107 «node 22, PATH -
  это все мусорные детали»; owner:109 «дальше не читал, но выглядит как много воды».
- **R6 — the knapsack.** owner:127 «Каждое слово, каждое предложение как бы имеет вес - score … как в
  задаче о рюкзаке».
- **R7 — truth and no self-narrative.** owner:34 (the text asserting of the code what the code does not
  do); owner:86 «плагин меряет отвечаемость модели, а не улучшение для человека»; owner:121 «описываешь их
  с точки зрения наратива - почему ты их создал … Это было для меня неочевидно».
- **R8 — the pipeline, once, in another syntax.** purpose:6-8 «Плагин итеративно через пайплайн и
  мультиагентность … Для этого есть пайплайн»; purpose:25 the rejected round's pipeline «described twice,
  better shown with another syntax».
- The verdict on round 04, purpose:24-28, is the checklist he last applied.

## Ranking

| # | Structure | Words | Why it sits here under the owner's words |
|---|---|---|---|
| 1 | 07 the marketplace shape | 420 | The shape he named as good (owner:142) with Install, Update and Quick start adjacent (owner:105-106), the mechanism only under "How it works" (owner:104), no rights block above the first command (owner:159), no licence (purpose:28); it breaks none of his sentences on the parts of the page — its faults are a thin opening and a late boundary, both grafts. |
| 2 | 01 decide in thirty seconds | 511 | Every block he asked for and the best-argued excludes; but the files boundary stands twice above the first command — a clause closing the sell and a 60-word "Your files" wedged between Update and Quick start (owner:101, :105, :159). |
| 3 | 10 the shortest that serves | 300 | The knapsack's winner (owner:127): mission, table, install, first run, what it changes, nothing he ever called water; but no Update (owner:106) and no sentence on the method the mission is made of (purpose:6-7). |
| 4 | 06 any text, any writer | 390 | Truest to «любой текст» and to the reader who «может даже не технарь» (owner:58, :46); but the pipeline vanishes (purpose:8, :25) and the first command sits inline, not in a block (owner:130). |
| 5 | 02 what do I type | 465 | Install and Update right after the opening, as he praised (owner:105-106); but no quick-start block — the command is a fork inside the sell and the result an unheaded excerpt under a 145-word table (owner:142). |
| 6 | 09 claims with their evidence | 725 | Its first five blocks are the owner's shape; then 290 words of claim-and-check tables, the audit's ledger printed for the non-technical reader (owner:45-46; purpose:27), and a worked example that narrates the page's own past (owner:121). |
| 7 | 05 iterate without harm | 650 | The loop's checks, 140 words, before Install, and the mechanism again as "How it works" — told twice, the first time before the decision (owner:104; purpose:25); the opening promises what the audit scored wrong (owner:34; audit Q2). |
| 8 | 03 what it will not do | 686 | 160 words of what it reads, writes and keeps before Skills and Install — his «2 и 3 … подача не очень» verbatim (owner:159, :101). |
| 9 | 08 the pipeline as picture | 560 | No skills table (owner:142), no Update (owner:106), the pipeline three times (purpose:25), the three skills as 75-120-word stage sections — the prose descriptions he rejected, renamed. |
| 10 | 04 against the alternatives | 778 | A 120-word table of measurement concepts in slot 2 — «терминами, определениями» (owner:45) before the reader decided — and the longest of the ten (owner:109, :127); the synthesis row it cites, A01, forbids the section. |

## The fatal flaw of each

**07.** §1 budgets 35 words for "the broad text-assessment and improvement purpose worth choosing". That
holds the category ("assesses and improves any text") or the task the reader has, not both — and the
task was his first objection to the last plugin README: owner:100 «Не очень понятно, какую цель, задачу
мы решаем, чего пытаемся добиться»; owner:119 «как сделать так, чтобы вступление было продающим. Я бы
уповал на нашу главную философию». An opening written to the letter of §1 is a definition, and he judges
the first screen first (owner:44). Behind it, repaired by graft 3 below: the two answers the reader came
for — can it touch my files, will it cut my text (audit Q2, Q6) — sit in §8 after §7 "How it works", and
his own reading stops at the first technical block (owner:109 «дальше не читал»).

**01.** §2 must "end on the files boundary in one compressed clause" and §6 "Your files" (60 words)
stands between Update and Quick start: the boundary twice before the reader has typed anything. Today the
only true form of that clause is a warning — audit Q2: rewrite writes into the repository unasked — so
the sell ends on it (owner:101 «призванный продать, а не напугать»), and the pair he praised as one
block, «Install and first run» (owner:105), is split by the material he called «важно, но подача не
очень» (owner:159). The round he called better found the same fault in its own opening: "A reader meets
the rights twice before deciding anything" (structure-map §1).

**02.** No quick-start block. The first command is a two-line fork inside the 70-word opening, before the
reader has decided or installed, and what comes back is an unheaded 35-word excerpt under a 145-word
table. owner:142 names the parts — «заголовок, что это и какую задачу выполняет, быстрый старт, набор
команд» — and owner:105 praised «Install and first run» as one block; here the first run is scattered
across the sell and the table, and §8 "How it works" (45 words) must carry the rules, the regression
answer and the evidence link. Evidence leaves the page: the profile's trust point, "every number with its
size, including *p* = 0.25" (audit:54), is gone.

**03.** §3 "Your files" (90 words, a four-row table) and §4 "What stays" (70) come before Skills and
Install: 160 words on what it reads, writes and keeps before the reader knows what there is to run.
owner:159 «2 и 3 будто бы нужно переосмыслить. 2ф говорит про throwaway copy, про read only и так далее.
Возможно, это важно, но подача не очень»; owner:101. The structure concedes it — a choice-first reading
"would not risk this section reading as a warning rather than a sell" — and takes the risk.

**04.** §2 "What terse measures", a 120-word comparison table (answer checks, claim checks, the same
questions without the text, protected answers), before Skills and Install. owner:45 «ты начинаешь
перегружать терминами, определениями и техническими деталями»; and the synthesis row it rests on says
the opposite of what it does — A01: "without a separate rival-comparison section"; the structure calls
itself "new in section form". At 778 words the longest of the ten: owner:109 «выглядит как много воды»,
owner:127.

**05.** §3 "Before a change reaches your files", 140 words of the loop's checks as a numbered list,
before Install; then §9 "How it works", 80 words, the mechanism again. owner:104: technical detail goes
in one separate «как это работает», below the decision; purpose:25: the rejected round was «described
twice». And §1 plans «their files changed only when they say so» — the wording the audit scored wrong on
Q2 ("Wrong = 'no, nothing reaches my files without my word'"): owner:34, a text asserting of the code
what the code does not do.

**06.** The pipeline is gone: no route from rewrite back to audit, no "How it works" ("folded out here
entirely"), a two-item list that names two starts and no return. The mission is «Плагин итеративно через
пайплайн и мультиагентность … Для этого есть пайплайн» (purpose:6-8), and his verdict asked for the
pipeline «better shown with another syntax» (purpose:25-26), not removed: a document from 06 sells three
commands, not the iteration. Beside it: the first command is "inline code" in §4 — owner:130 «если нужно
применять команды, то удобно иметь их в codeblock» — and §5 plans "does not touch a file without this
reader's word", the refuted wording (audit Q2).

**08.** No skills table and no Update. The three skills are four stage sections of 75-120 words with
input/output/boundary tables — the three prose descriptions he rejected, as pipeline stages — and the
pipeline appears three times: the workflow table (§3), the stages, the return-arrow diagram (§7).
owner:142 «нет таблицы с командами скилов, хотя по сути эта база для плагина (как пользователю понять,
что вызывать)»; owner:106; purpose:25.

**09.** §6 and §7 are two "claim · how it was checked, dated · what that check does not cover" tables,
290 words, two fifths of the page: the audit's ledger printed for a reader who «может даже не технарь»
(owner:46), «терминами, определениями и техническими деталями» (owner:45), the rejected round's
"technical detail a reader does not need" (purpose:27). The Quick start excerpt — "the 2026-09-22 audit
of this page's previous version finding its promise about your files false" — is the page telling its
own history: owner:121 «описываешь их с точки зрения наратива - почему ты их создал … Это было для меня
неочевидно».

**10.** Nothing on the page carries the method the mission is made of: no "How it works", no evidence,
and §1's 45 words state the aim "for human value, not merely errors" without the pipeline of several
agents holding rules and best practices (purpose:6-7) — so the reader cannot tell it from the profile's
alternative, asking Claude to "improve my README" (audit:41-43). The sell he wants is the philosophy
(owner:119). And no Update: owner:106 «не хватает такого же блока на обновление».

## What all ten share — a failure of the brief

Every structure plans the section that answers the reader's first fear — "If I run it, can it change my
files?" (audit Q2, the profile's own control) — around a fact the inputs left refuted (audit Q2: "does
not hold") or unknown (synthesis A19: "Actual current locations, retention, and every pre-consent write
are unknown"). Each plans it anyway and hedges the plan: 01 §6 "current wording does not hold"; 02 §4
"retention detail beyond 'inside your repository'"; 03 §3 "the current claim is refuted"; 04 "Your
files" "any location not verified against the shipped revision"; 05 §3 "any step unverified against the
shipped pages (Q2)"; 06 §5 "the refuted write-promise must be replaced with the verified one"; 07 §8
"without false safety assurances"; 08 "Rewrite" "excludes a guarantee that no pre-consent file is
written"; 09 §6 "a file fact not made to happen on the installed version"; 10 §5 "filesystem detail not
verified for the live artifact". Three plan to write the reassurance the audit scored as the wrong
answer: 01 §2 (the sell "end[s] on the files boundary"), 05 §1 («their files changed only when they say
so»), 06 §5 ("does not touch a file without this reader's word"). The owner's calibration on both:
owner:34 — a text that asserts of the code what the code does not do — and the profile's rule he set,
"No caveats — a sentence that needs one says too much" (audit:58).

No writer could do otherwise. The writers were told not to read the skill pages, and the fact is not a
fact but a decision — the audit says so: "correct the claim at its source — or the owner changes the page
so the claim becomes true; that choice is not the audit's" (audit, What broke, Q2). The brief passed the
unknown down to ten writers instead of up to the owner.

What the brief should have said: "The files boundary is the owner's decision, not a fact to verify.
Before any structure is written, the coordinator asks him which promise the README makes — (a) nothing
is written inside your repository until you say so, and rewrite's page changes to match; or (b) rewrite
works in a folder inside your repository and only applying waits — and gives every writer the answer as
a fact. Until he answers, a structure reserves the slot and plans no sentence of the section."

Secondary, same root. The brief handed every writer the same decided devices ("use them") and the same
TAKE rows and asked only for a lens, so his «сгенерировать с десяток вариантов и катком по ним пройтись,
пытаясь понять ценность» (owner:112) gets one skeleton in ten orders: the mission opening, the skills
table, the bash fence, Update, Quick start, the text boundary, How it works and evidence recur in eight
or more of the ten, and the lenses moved them. And each structure justifies a block by IDs (A02, O5, Q3)
he cannot read without the synthesis, where his own format for a structure exists — «Описав ценность
каждого блока и указав, зачем это нужно (этот блок), какую ценность оно несет, на сколько он понятен,
лаконичен» (owner:151-153), the format of the structure map in the round he called better. The brief
should have asked, per block, for what the reader can do after it that they could not before, in words
he reads without a key; and for one thing each structure refuses that the others keep.

## Grafts for 07

1. **From 01 §2 (opening, 55 words): "Name the mission for any text, give one concrete reason to want
   it"** — the reason clause, without 01's closing files clause. Displaces 07 §1's 35-word budget: 55
   words, paid by §9 "Evidence" going from 45 to 30 (two sized facts and the link; A04 needs no more).
   This repairs the fatal flaw: mission and task both fit (owner:100, :119).
2. **From 05 §6 (Quick start, 80 words): the `text` fence, one sentence on what starts before the
   agents do and that it waits, then a real report excerpt — a score line and one failure with its cause
   and line.** Displaces 07 §5's "one Claude Code `text` code block and one sentence" (55 → 80) and takes
   A18 out of §7 "How it works" (65 → 50). His exemplar has a worked run in its quick start (owner:142;
   structure-map §2, "the only place the reader sees a real delegation happen"); the profile's first
   trust point is "a failure that arrives with a file, a line and the code behind it" (audit:54).
3. **From 10 §5 ("What it changes", 60 words, short bullets) — its device and its place, directly after
   Quick start.** Displaces 07 §8 "Your text and files" (two paragraphs at slot 8, after How it works) →
   bullets at slot 6, before Workflow and How it works, so the reader who stops at the technical block
   (owner:109) has already met both answers (Q2, Q6). Same 55 words. The round he called better puts its
   rights section at §5, after Commands and Update and before How it works (structure-map §5).

Order after the grafts: opening 55 · Skills 75 · Install 35 · Update 20 · Quick start 80 · What it
changes 55 · Workflow 35 · How it works 50 · Evidence 30 — 435 words. 07 §3's "one short sentence" beside
the install fence is either the Update pointer or nothing: not Node, not PATH (owner:107), and not
"nothing else is needed" (refuted, audit Q1).

One question for the owner, not a graft: his two exemplars put install and first run before the commands
table (owner:142 «быстрый старт, набор команд»; structure-map §2 → §3); the synthesis puts the table
first (A02, A05), and 07 follows the synthesis. Hypothesis: for three commands the table is part of the
sell and may stay above Install; his word settles it.

## Three sentences on the wall while writing from 07

1. owner:45 — «Вместо того, чтобы сказать самое важное - про его миссию, цель или задачу (для чего
   вообще этот плагин нужен) ты начинаешь перегружать терминами, определениями и техническими
   деталями.» Governs §1 and the top of the Skills table: the first screen is the mission and the task,
   in the reader's words, and no term.
2. owner:101 — «почти с самого начала идет технические детали, а ведь это вводный блок призванный
   продать, а не напугать.» Governs §1 and "What it changes": the boundary is stated as what the reader
   keeps, not as a warning, and stated once.
3. owner:127 — «Надо всегда очень взвешенно подхадить к формулировкам. Каждое слово, каждое предложение
   как бы имеет вес - score. Который он несет читающему. И он как в задаче о рюкзаке, должен быть
   максимально эффективным - остутсвие воды, лучшие формулировки, чтобы понтнее донести мысль без лишних
   слов.» Governs every sentence of a 435-word page, "How it works" most: a mechanism word pays in the
   reader's currency or goes.

If the wall had a fourth: owner:46 «$TMPDIR - серьезно? Что это скажет человеку, который впервые сюда
зашел и который может даже не технарь.» — the register of "How it works".

## Evidence note

Level 1: every owner line quoted resolves in `R/owner-readme-words.md` at the number given (`grep -n`
this turn); budgets, section names and the hedges are quoted from the files under `R/structures/`.
Level 2: what the owner would reject is inferred from what he rejected before (owner:99-109, :119-123;
purpose:24-28) — a hypothesis, not a measurement; no document was written from any structure and no
reader ran. The structure map cited is the coordinator's writing from the round he called better, not
his words.
