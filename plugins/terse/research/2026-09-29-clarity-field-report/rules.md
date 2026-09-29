# Frozen rules

Each rule was written down before the run it governs. Only the paths, two working file names and a commit id are changed here.

## Pilot (first run)

Reading rule: Each case is read on its target grader (asks-owner, form-matches-neighbours, list-first, quotes-the-check, label-fit). After minus before >= 2 of 3 runs is a lead for that fix; 1 is noise; 3/3 in both arms is a ceiling and the case says nothing; a non-target grader lower by >= 2 in the after arm is a regression. Pilot A/A pairs crossed 2 in 4 of 90 cells, so a single-case lead needs a confirmation run before it is reported as an effect. The sign test is not read.

## Rerun

Reading rule: Each case is read on its target grader (asks-owner, form-matches-neighbours, list-first, quotes-the-check, label-fit), passes out of 3 runs per arm. After minus before >= 2 is a lead for that fix and before minus after >= 2 a regression of it; 1 either way is noise; 3/3 in both arms is a ceiling and the case says nothing about the fix. Cases 2, 3 and 4 are expected at ceiling, so this run can show a lead only for fixes 1 and 5 and is a harm check for 2–4. A non-target grader lower by >= 2 in the after arm is a regression. A lead or a regression in a single case needs a confirmation run before it is reported as an effect; the sign test is not read. Intent reading: the verifier (Opus) gets cases.json and the last message of each of the 30 runs as a file named by a fresh random label, shuffled within each case, with no trace path, result file or grader vote; the coordinator keeps the label-to-run map outside the directory it hands over. For each answer it writes yes or no with the deciding quote: case 1, the choice between the two courses is visibly the owner's; case 2, the entry has the neighbours' shape; case 3, the three writers come first, after at most a count-only lead-in, and are named together once; case 4, the check's text is in the message and its source is named after or beside it; case 5, the two not-needed facts sit outside the requirements list. The coordinator then maps labels to runs and arms and reports per case and arm the grader count and the intent count side by side; a disagreement is listed with its quote and decides nothing alone; a target grader that disagrees with the verifier on 2 or more of its 6 answers is reported as a grader defect and its case as unmeasured on that grader.

## Regrade and confirmation run

Frozen before the regrade and the confirmation run (2026-09-29), branch terse-pr35-followups.

Regrade: an echo case file (not kept), 12 saved rerun answers (case 1 facts-correct, case 3 list-first, new criteria from the branch), echoed by Haiku, judged by Sonnet, --criterion-only, --runs 1. Expected (Opus O8, the reader's proposal): case 3 PASS 061983 0b13c2 6d2442 ddf01b, FAIL d4af68 7bf9ed; case 1 PASS cfca44 9b0aed 08f275, FAIL b9e4cf d91611 6161a7. An echo that does not reproduce its source text exactly (whitespace aside) is excluded and named. The regrade checks the grader, not the fixes.

Confirmation run: the branch's pr35-field.json (new graders) and pr35-before.json, --force-skill terse:clarity --criterion-only, 3 runs per arm, Sonnet judge. Reading rule unchanged from design-notes-v2.md (target graders, >=2 lead or drop, ceiling, non-target regression, blind intent reading by Opus O8 with fresh labels). This run is the confirmation the v2 rule asks for: a lead or drop seen in both the rerun and this run is reported as a replicated result; one seen in only one run is not.
