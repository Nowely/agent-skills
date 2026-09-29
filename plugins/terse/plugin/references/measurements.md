# The measurements behind the rules

- [M1. No block-local critic can see across blocks](#m1)
- [M2. The outer loop runs first on an inherited document](#m2)
- [M3. Compression is how regression enters](#m3)
- [M4. A claim about a lifecycle is level 3 or a guess](#m4)
- [M5. Every round is its own file](#m5)
- [M6. A round is frozen when its critics launch](#m6)
- [M7. A level-2 ledger entry about a lifecycle is provisional](#m7)
- [M8. A retired phrase is searched for everywhere it could survive](#m8)
- [M9. A repair is a new draft of every sentence it touches](#m9)
- [M10. No count of findings stops the loop](#m10)
- [M11. The task gate](#m11)
- [M12. What the task gate cannot see](#m12)
- [M13. The map is not the gate](#m13)
- [M14. Contradiction is its own defect class](#m14)
- [M15. One idea, one home, counted](#m15)
- [M16. A check is worth its pattern](#m16)
- [M17. When a rule fires, the rule may be wrong](#m17)
- [M18. Two safeguards](#m18)
- [M19. Four standards and a control pair](#m19)
- [M20. A reader seat told not to run commands reads nothing](#m20)
- [M23. A qualification is not a fix](#m23)
- [M22. Budgets are a report](#m22)
- [M21. What one wave costs](#m21)
- [M24. The verifier of the edits, once, blind](#m24)
- [M25. A clean round held back, on a shape nobody agreed](#m25)
- [M26. Shape, speed and pleasantness](#m26)
- [M27. Reader evidence changes the diagnosis](#m27)
- [M28. A one-path repair needs a check](#m28)
- [M29. A draft can polish the wrong shape](#m29)
- [M30. Context outranks a rule checklist](#m30)
- [M31. A changing number can burden the next maintainer](#m31)
- [M32. A benefits list can lose the choice](#m32)
- [M33. A problem line can help an opening](#m33)
- [M34. Inherited example rule, limited provenance](#m34)

These entries keep dated observations and inherited provenance behind the advice. A principle drawn
from owner feedback is identified as such; it is not a measured rate. M1–M23 concern one README and one
owner in 2026-09-10 to 2026-09-12 (`plugins/terse/research/2026-09-11-markup-round-0/`). M24–M25
cover the 2026-09-22/23 terse README run; M26–M33 cover the maestro, light-trial, second-checks and
writing-replication work of 2026-09-24 to 2026-09-27. M34 records inherited provenance whose primary
event has not been isolated. One document can motivate advice; it cannot establish a general rate.

<a id="m1"></a>**M1. No block-local critic can see across blocks.** A water critic reading an assembled
draft end to end found one claim stated four times in four sections, each defensible where it stood —
roughly 120 words of repetition that every per-block pass had passed.

<a id="m2"></a>**M2. The outer loop runs first on an inherited document.** On 2026-09-12 an adversarial
reader given the whole document and an isolated `CLAUDE_CONFIG_DIR` found thirteen defects older than the
round it was asked about, which three earlier reading-only reviews had all passed. A wave of eleven
critics on round 07 then found forty-one sentence defects in a document six rounds of one or two critics
had reviewed.

<a id="m3"></a>**M3. Compression is how regression enters.** A repair that applied nine verified fixes
correctly turned "your system temp directory is the only thing it may write" (true) into "a scratch space
of its own, one per agent" — shorter, cleaner, and false of `driver.mjs:2001-2015`, which grants exactly
the caller's own shared `$TMPDIR`. The sentence got better by every measure the method had and became a
lie.

<a id="m4"></a>**M4. A claim about a lifecycle is level 3 or a guess.** Round 06 made nine edits, each
checked against a resolving line; four were false and two overstated, every one about what stays on
disk, what is removed and when, or what a continued run sees. The rule was recorded. Round 07 then
introduced five more of the same kind, found by a critic who ran a stub Codex and killed drivers
mid-run. Reading the lines a rule names is not running them.

<a id="m5"></a>**M5. Every round is its own file.** `01-candidate.md` was overwritten in place several
times before the rule existed — the parity table cut, the commands table added, the section names
changed — and those states do not exist; the ratchet could not have been applied to them.

<a id="m6"></a>**M6. A round is frozen when its critics launch.** Two refinements were applied to round
04 while its critics were reading it. The file was regenerated from its deterministic script to the state
they saw, and the refinements became round 05.

<a id="m7"></a>**M7. A level-2 ledger entry about a lifecycle is provisional.** Three claims — a crashed
run's commits kept under a ref, a killed run's lock reclaimed by the next, no report left by an
out-of-memory kill — were entered as verified at level 2 and each fell to a level-3 run in the next
wave. A ratchet on that ledger would have rejected the fixes.

<a id="m8"></a>**M8. A retired phrase is searched for everywhere it could survive.** The retired phrase
"cleanup lists what the plugin left" survived in a table cell with a capital letter; the ledger's
pattern did not match, and the ledger stayed green while the claim stood.

<a id="m9"></a>**M9. A repair is a new draft of every sentence it touches.** A writer handed nine verified
fixes applied all nine and, rewriting one sentence for fix 5, made two neighbouring sentences false;
neither task in that round's gate touched storage layout, so the gate passed it.

<a id="m10"></a>**M10. No count of findings stops the loop.** Seven rounds of one README never met the
earlier stopping rule — two rounds with no regression and no new class of defect — and the wave after
round 07 found forty-one sentence defects and five regressions of the round's own. The owner had not
read any round since the draft; that read is the measurement the rounds were for.

<a id="m11"></a>**M11. The task gate.** A draft's only alert said "Commit or stash first." Run it:
`git stash` takes the changes out of the working tree, a detached worktree made afterwards is still at
`HEAD`, so the agent sees nothing and the reader's own tree has been reverted. Every sentence was
individually true; the recipe as a sequence destroyed work, and no reader answering a question would
have found it.

<a id="m12"></a>**M12. What the task gate cannot see.** Three readers, three tasks, all passed, on a round
that still carried four false sentences no task had to act on and three sections with no level-3
evidence at all. In the wave on round 07 both task readers passed again while five introduced claims
were wrong.

<a id="m13"></a>**M13. The map is not the gate.** An architect-critic given the first structure map raised
four objections that hold: its first column is circular (intended benefit, from the skeleton); provenance
kept standing in for justification; the stopping rule measured exhausted discovery, not correctness;
requiring every map to name weaknesses makes criticism a performance. The first map had marked two blocks
sound that its reader rejected within a minute.

<a id="m14"></a>**M14. Contradiction is its own defect class.** One section of a draft said an agent
reaches the network by default; the next section, "What it stores, and what leaves your machine", opened
with "Nothing leaves your machine." Both passed per-block critics; the duplication counter scored them
as unrelated, sharing no vocabulary. `network: true` is the default and the opt-out is one flag.

<a id="m15"></a>**M15. One idea, one home, counted.** On a draft that had grown from 1158 to 1436 words
because two sections were added and nothing they duplicated was removed, the count read: quota /
sign-in in six sections, the prompt file and its permission in six, the last-commit warning in five.

<a id="m16"></a>**M16. A check is worth its pattern.** The rule-1 check was written as `(?<![\w~])/…`,
whose lookbehind excluded paths beginning with `~` — every path in the document. It reported clean for
three rounds, through two independent reviews, while four violations stood; an auditor found them by
reading. Three more checks in the same project had a line-wrap hole until text was whitespace-normalised.

<a id="m17"></a>**M17. When a rule fires, the rule may be wrong.** The fixed checker flagged
`~/.claude/plugins/data/…` inside the section whose job is to say where things are kept, where the survey
of comparable documents had established literal paths as the convention. Two rules in conflict; the
younger one, the survey's, won as a stated exception.

<a id="m18"></a>**M18. Two safeguards.** A true sentence moved to line 8 met two readers before they
knew what the tool was, and both remarked on it: position is not repaired by truth. And a stronger claim
beats a truer one when a reader meets both, so a weakened claim has to be the only claim left standing.

<a id="m19"></a>**M19. Four standards and a control pair.** On 2026-09-10 a two-by-five comparison gave two agents each of Diataxis, implementation verification, a draft rule block for the owner's CLAUDE.md, a published technical-writing house style, and no standard. The models were hidden from the judges. Both controls beat both entries of both published standards, while one entrant using the unpublished owner draft outranked both controls. This single run gives no general rate. On the selected 116-word README opening, six entrants left its length at 116, three lengthened it, and one control shortened it to 97. These counts concern that opening, not the whole README. Sources: `plugins/terse/research/2026-09-10-chain/run-2x5/v04PR6HL.prompt.txt:13-20` and `plugins/terse/research/2026-09-10-chain/run-2x5/o8eHzS6U.answer.md:10-19`; the latter's word counts are a judge's analysis, evidence level 2. The chain that moved a README from 3/6 to 6/6 ran once, one trial per question; its parts were not isolated.

<a id="m20"></a>**M20. A reader seat told not to run commands reads nothing.** Five Codex `gpt-5.6-luna`
readers briefed "do not run commands" returned "I could not read the document": Codex reads files
through the shell. Told "read it with `cat` and run nothing else", the same five answered thirteen of
fifteen questions with a quote.

<a id="m23"></a>**M23. A qualification is not a fix.** Rounds 04 to 08 of one README repaired findings by
qualifying sentences — "not your reports", "sharing only your sign-in", "a copy with unsaved files is
left as it is", "trimmed when a later run starts" — and two critics with a stub server showed each
qualification wrong at the next level of detail; the regression count went 1, 0, 6, 5, 10. The sections
that regressed were the three that transcribe mechanism, against the skeleton's own rule that generated
reference is linked, never transcribed. Round 09 removed the sentences instead.

<a id="m22"></a>**M22. Budgets are a report.** The owner asked what a budget does for the text; the answer is nothing
directly. Rounds 04 to 07 grew from 1383 to 1611 words, every added word in four sections and every one
of them making a claim truer; a per-section count per round shows that as it happens, which is the
whole use. So `sections.mjs` reports and never blocks.

<a id="m21"></a>**M21. What one wave costs.** On 2026-09-12, on a 1600-word README: Opus with execution
rights ~180k tokens and 17 minutes; Opus on rules and water ~70k and 7 minutes; the Fable dedup ~160k
and 15 minutes; the Astra adversarial seat about forty commands in five minutes; each Sol task seat about
twenty commands in five minutes; each Luna question seat about a minute. Eleven agents, about 410k Claude
tokens plus eight Codex seats.

<a id="m24"></a>**M24. The verifier of the edits, once, blind.** On 2026-09-22 one Codex `gpt-6-astra`
agent was given round 08's twenty-seven edits and the code, no critic's report and no autopsy, and its
list was frozen before the autopsy was read: it refused six of that round's ten regressions, five of
them strictly. The four it missed were one sentence that declared no claim at all and three whose
level-3 runs had answered a narrower case than the sentence made. One round, one model, one run — a
hypothesis about the four duties, not a rate; and the model measured was Astra, while the brief names
Sol for decorrelation from the Claude writer, so nothing here is evidence about Sol. Its own cost was
not measured; the nearest observation is that agent's whole turn, 53 commands in 19 minutes. The run is
`plugins/terse/research/2026-09-22-terse-process/` in this repository.

<a id="m25"></a>**M25. A clean round held back, on a shape nobody agreed.** On 2026-09-22/23 the pages ran
live on this plugin's own README: an audit, a bake-off, then rounds 02 to 04 on the audit route with no
skeleton agreed, each read by a verifier before the freeze and by a wave after it. The rounds regressed
3, 0 and 2 times — three sentences about where a run is written and what deletes it, then a wording
taken from the dedup and a scope line the coordinator decided — four of the five shown at level 3. The
verifier sent the rounds back 2, 1 and 2 times, each on a real defect of the evidence; the question
readers answered 7/7, 5/7 and 7/7 at one trial each, two labels flipping on unchanged text; the task
gate went from 0 of 2 to not run to 1 achieved, on the harness's route, and 1 partly. The writer, the
Claude lenses and the dedup cost about 1.0M, 1.2M and 1.6M tokens a round. Round 03 had no regression
and was held back, its task readers sized to zero and the page asking for two clean rounds; the owner
then read round 04 and rejected it for its shape and content — the opening, no statement of what the
plugin is for, the pipeline told twice, a verbose install, no table of the skills, water by the
paragraph, technical detail, a licence line — and not for one phrase. Scanned afterwards, the
qualification regex of `round.mjs` fires on 4 of the 127 edits recorded in this run and the 2026-09-11
one: twice on a sentence that regressed (G3a here, R06-5 there), once beside one (the edit that carried
R08-5), once on none — a signal, not a rate. A hypothesis the run did not separate: the same verifier
model held 23 of 24 claims on round 03's thread and refused 9 of 16 on round 04's, and the two writers
worded their `asks` differently. The run is `plugins/terse/research/2026-09-22-terse-process/` in this repository.

<a id="m26"></a>**M26. Shape, speed and pleasantness.** On 2026-09-24 the sequential maestro README path took 6 h 38 min; the owner rated its result around parity with the repository README and above a bare agent's 14-minute version. A later one-path run took 70 minutes. The first run's cold readers found a contradiction introduced by repair and two indistinct table rows; their pleasantness marks did not separate the owner's first and second choices. This supports checking a repair and treating cold readers as defect finders, not human preference judges. Sources: `plugins/terse/research/2026-09-24-terse-benchmark-maestro/` and its `one-path/` run.

<a id="m27"></a>**M27. Reader evidence changes the diagnosis.** On 2026-09-10 two readers who reported no confusion answered wrongly, while one who called a section confusing answered correctly. Two of six audited failures were refuted claims, not path-to-answer failures; a true sentence under Prerequisites was read as a requirement. Answer and quoted source were more useful than self-report. The task-gate case has its own home in [M11](#m11). Source: `plugins/terse/research/2026-09-10-chain/`.

<a id="m28"></a>**M28. A one-path repair needs a check.** The 2026-09-25 first run took 70 minutes; its writer spent 33 minutes running code truth critics ran again, while the repair brought in a contradiction no role read for. Sentence rules had no assigned reader. The second run took 1 h 33 min; separate truth critics rebuilt the same harness and held the critical path for 24 and 20 minutes. These observations motivated a sentence critic, check after repair, reading-only light mode and one shared full-mode harness. Sources: `plugins/terse/research/2026-09-24-terse-benchmark-maestro/one-path/` and `one-path-2/`.

<a id="m29"></a>**M29. A draft can polish the wrong shape.** On 2026-09-11 and 2026-09-23 the owner rejected drafts for their content and order rather than phrasing when nobody had agreed the shape. On 2026-09-24 the sequential rethink stages took about three hours before prose and produced a 13,000-word skeleton. The measured scope is those documents and runs. Sources: `plugins/terse/research/2026-09-22-terse-process/` and `plugins/terse/research/2026-09-24-terse-benchmark-maestro/`.

<a id="m30"></a>**M30. Context outranks a rule checklist.** On 2026-09-26, for a disk-usage tool README, a bare agent's text beat the one-path text in the owner's read. The writer lacked a clear picture of what the tool was to its reader; rules treated as requirements removed the demo, one-line pitch and installation routes the owner valued. That case motivated context first, genre precedent and advice rather than mandatory forms. Source: `plugins/terse/research/2026-09-26-terse-light-trial/`.

<a id="m31"></a>**M31. A changing number can burden the next maintainer.** In feedback collected for the 2026-09-26 writing study, the owner objected that a number repeated in a comment must be edited separately whenever its source changes. Avoid that duplicate when it gives the reader nothing new. Keep a number when compatibility, reproduction or the reader's decision depends on it, with its scope or source. This is owner feedback, not an observed rate. See P29 in `plugins/terse/research/2026-09-26-writing-replication/publication/issue-comment.md`.

<a id="m32"></a>**M32. A benefits list can lose the choice.** In a blind read of two maestro README openings on 2026-09-25, 21 of 37 readers objected to badges, stats and navigation before the tool's purpose; 21 of 37 also objected to bullets that listed parts instead of what a reader could do. The counts concern those openings, not all benefit lists. Source: `plugins/terse/research/2026-09-24-terse-benchmark-maestro/one-path-2/README.md:63-71`.

<a id="m33"></a>**M33. A problem line can help an opening.** In the same blind read, readers praised the reference README's problem line, including one judge who called it the strongest selling line in either file. The rule critic had cut the draft's own problem line under a broad ban on failure modes. This supports judging an opening by what it gives its reader, not banning mention of a problem. Source: `plugins/terse/research/2026-09-24-terse-benchmark-maestro/one-path-2/README.md:69-72`.

<a id="m34"></a>**M34. Inherited example rule, limited provenance.** The earlier `rules.md` marked “no invented examples” as measured on 2026-09-11. The exact triggering event was not isolated in this round; do not treat this label as a measured rate or proof that every hypothetical example is harmful. A fabricated command presented as real can still misdirect a practical reader. Prior form: `plugins/terse/research/2026-09-24-terse-benchmark-maestro/one-path-2/in/rules.md:113`.
