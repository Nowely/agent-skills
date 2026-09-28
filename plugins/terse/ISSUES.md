# Defects found in passing: terse

Recorded per the repository rule: evidence at file:line, an evidence level (1: the line resolves; 2: an
independent reader of the code would say the same; 3: the behaviour was made to happen), and wording that
can become an issue unchanged. An entry leaves when its fix lands and the changelog names it. Ids are
shared with entrust's ledger, `plugins/entrust/ISSUES.md`, so one id names one entry in both. A path
pinned to a commit is that commit's address, with today's beside it.

## E7. `prior-art.md` says every 2026-09-10 number traces to the bake-off directory, and the reader numbers do not

**Evidence, level 2.** `plugins/terse/plugin/references/prior-art.md:910-911` calls `run-2x5/` "forty Codex seat
returns from the bake-off" and says "Every 2026-09-10 number quoted anywhere in this file traces there".
`plugins/terse/research/2026-09-10-chain/README.md` and `chain/` hold summaries of the reader run; the six readers of
the *before* measurement are recorded one by one, with verdicts, quoted lines and the one departure, in
`plugins/terse/research/2026-09-10-chain/chain-source-prompt.txt:103-132` — not under `run-2x5/` — and no per-reader
record of the *after* measurement (6/6) exists anywhere in the repository. Found by the 2026-09-22 truth
pass (entries C31, C32, C36, C37 unconfirmed) and corrected on 2026-09-23 by the wave's lens 1, which
found the before-records this entry had said did not exist.

**Issue text.** The sentence overstates the record: the bake-off returns are there, the reader run's
before-records are in the chain's source prompt and its after-records are nowhere, and the claim should
name what traces and what does not.

## E9. `measure.md` does not say how the planted unanswerable question scores in the no-document arm

**Evidence, level 2.** `plugins/terse/plugin/skills/audit/references/measure.md:22-24` keys the planted question
as unanswerable and calls a confident answer a reader failure; `measure.md:70-81` defines the
no-document arm and says the reported score is the difference. A no-document reader answering "I do not
know" to the planted question is honest and matches the key, and the page does not say whether that
counts as knowledge. On 2026-09-22 the coordinator scored it as not right, which put the delta at 5/7
instead of 4/7 (`audit-2026-09-22/audit.md`, Open).

**Issue text.** The scoring of the planted question in the no-document arm changes the delta by one
question and the page leaves it to the scorer. The page should say whether the no-document arm counts a
correct "cannot tell" as a right answer, and the run-file contract should carry the choice.

## E12. `measure.md` lets the audit store its score in the audited repository on the user's word, and the audit page says it writes nothing there

**Evidence, level 2.** `plugins/terse/plugin/skills/audit/SKILL.md:44`: "Write nothing into the audited
repository. Not a report, not a note, not a fix."
`plugins/terse/plugin/skills/audit/references/measure.md:117-121` ("Keeping the number as a regression test"):
"A score sitting in the audited repository turns documentation rot into a failing check … Storing it
there requires the user's word, because it means writing into their tree." Found on 2026-09-23 by the
bake-off judge Opus J1 while checking a candidate's sentence that the audit writes nothing into the
repository.

**Issue text.** The two pages disagree on whether the audit may ever write into the audited repository:
the skill page says never, the reference says on the user's word. A README that repeats either one is
refuted by the other. The pages should say one thing — the reference's rule, stated on the skill page as
the one exception with its consent step, or the reference's section removed.

## E14. A `missing` failure on the planted unanswerable question cannot be repaired and re-measured under "the same key"

**Evidence, level 2.** `plugins/terse/plugin/skills/audit/SKILL.md:82-84` plants "at least one question the
documentation genuinely does not answer, and record it as unanswerable in the key"; step 6's cause table
(`audit/SKILL.md:127-133`) makes `missing` a failure a rewrite must repair by writing the answer;
`plugins/terse/plugin/skills/audit/references/measure.md:106-109` says a re-measurement uses "Same questions, same
key" and that changing any of them makes "a new measurement with a new baseline, not a result". On
2026-09-22 the live audit's planted question ("My documentation is in Russian — do the readers go through
it the same way?") was keyed unanswerable and, on the owner's ground truth, recorded as `missing`; the
rewrite wrote the answer, and on 2026-09-23 the round-02 question reader answered it from the text
(`plugins/terse/research/2026-09-22-terse-process/rewrite-2026-09-22/run/reviews/02/c5-7.md`). Under the old key that
right answer is a failure; under a corrected key the re-measurement is "a new measurement".

**Issue text.** The three rules collide whenever the planted question's answer is what the rewrite is
asked to write. The page should say which gives way: the planted question is excluded from the score
delta once its answer is written (and the re-measure reports it beside the score), or the key entry is
rewritten and the re-measure says so, or the planted question must be one the owner does not intend the
document to answer. Found while executing the pages live.

## E15. `rewrite` keeps its candidate outside the repository, and no page says where the candidate stands when it is re-audited

**Evidence, level 2.** `plugins/terse/skills/audit/references/measure.md:35-37` (at d7a1f37; now `plugins/terse/plugin/skills/audit/references/measure.md`) says a reader opens "the `.md` files in the repository", starts "at the entry file" and follows "links it finds in the text"; `plugins/terse/plugin/skills/audit/references/measure.md:49-50` says "You may open only .md files in <REPO>"; and `plugins/terse/plugin/skills/audit/references/measure.md:106-109` says a re-measurement uses the same questions, key, entry file and model. `plugins/terse/skills/rewrite/SKILL.md:33-37` (at 829c235; now `plugins/terse/plugin/skills/rewrite/SKILL.md`) writes every run "Outside the repository that holds the text", and `plugins/terse/plugin/skills/rewrite/SKILL.md:78-83` hands the final text over and applies it only on the user's word. A final text in the run directory is neither the entry file nor one of the repository's `.md` files, and neither page says where it stands for a re-audit.

**Check.** From any directory:

    sed -n '35,37p;49p;106,109p' /Users/ruliny/Git/agent-skills/plugins/terse/plugin/skills/audit/references/measure.md; sed -n '33,37p;78,83p' /Users/ruliny/Git/agent-skills/plugins/terse/plugin/skills/rewrite/SKILL.md; echo "pages saying where a candidate stands for its re-audit: $(grep -rl -i -E 'temporary candidate|copy of (the|its) (markdown )?tree|relative (link|location)|links? (still )?resolve' /Users/ruliny/Git/agent-skills/plugins/terse/plugin/skills | wc -l | tr -d ' ')"

At 829c235 it prints the reader and re-audit rules, the run directory outside the repository and the hand-over, and ends `pages saying where a candidate stands for its re-audit: 0`.

**Issue text.** `rewrite` keeps its final text outside the user's repository and applies it only on their word. `audit` re-measures with the same entry file and lets its readers open only the repository's `.md` files. Between the two, no page says how a candidate is re-audited before it is applied: where it must stand, and what keeps its relative links pointing where the original's did. A user who re-audits the text where `rewrite` leaves it gives the readers a file outside the repository, with relative links that resolve against the run directory. The pages should say where a candidate stands for its re-audit (for example, at the original's path in a copy of the repository's Markdown tree), and `rewrite`'s hand-over should say so next to the diff.

_From plugins/terse/research/2026-09-22-terse-process/rewrite-2026-09-22/run/code-defects.md, D1._

## E29. A re-audit "with the same questions" is required by `measure.md` and no audit step takes an earlier run as input

**Evidence, level 2.** `plugins/terse/skills/audit/references/measure.md:106-109` (at d7a1f37; now `plugins/terse/plugin/skills/audit/references/measure.md`) requires the same questions, key, entry file and model. `plugins/terse/plugin/skills/audit/SKILL.md:23-34` makes a new run directory and `plugins/terse/plugin/skills/audit/SKILL.md:71-77` writes questions and the key without reading an earlier run. The only "same questions" line on the audit page is the no-document baseline at `plugins/terse/plugin/skills/audit/SKILL.md:96-102`, not a previous audit input.

**Check.** From any directory:

    grep -n -i -E 'previous run|earlier run|same questions' /Users/ruliny/Git/agent-skills/plugins/terse/plugin/skills/audit/SKILL.md; sed -n '106,109p' /Users/ruliny/Git/agent-skills/plugins/terse/plugin/skills/audit/references/measure.md

On HEAD it exited 0; grep printed only line 96's baseline-arm "same questions", no "previous run" or "earlier run", and sed printed the re-measurement rule.

**Issue text.** `measure.md` requires a re-audit to reuse the questions, the key, the entry file and the model of the first audit, and the audit page has no step that takes a first audit's run as input: step 1 makes a fresh run directory and step 4 writes fresh questions from the profile. A user who audits again after a rewrite gets a new measurement, not a comparison, unless they carry the questions over by hand. Step 1 should accept a previous run directory and steps 4 and 5 should reuse its questions, key and baseline when one is given.

_From plugins/terse/research/2026-09-22-terse-process/rewrite-2026-09-24/run/code-defects.md, D15._

## E36. `prior-art.md` overstates its own body: "every practice marked measured, argued or asserted" and "the curated forty"

**Evidence, level 2.** `plugins/terse/references/prior-art.md:14-18` (at d7a1f37; now `plugins/terse/plugin/references/prior-art.md`) says practices are marked measured, argued or asserted, and `plugins/terse/plugin/references/prior-art.md:299-304` calls the curated section "the curated forty". The check counts 115 numbered entries and only 34 lines carrying one of the marks, which supports neither "every" nor "forty".

**Check.** From any directory:

    sed -n '14,15p;302p' /Users/ruliny/Git/agent-skills/plugins/terse/plugin/references/prior-art.md; grep -c -E '^\s*[0-9]+\. \*\*' /Users/ruliny/Git/agent-skills/plugins/terse/plugin/references/prior-art.md; grep -c -i -E '\b(measured|argued|asserted)\b' /Users/ruliny/Git/agent-skills/plugins/terse/plugin/references/prior-art.md

On HEAD it exited 0 and printed the two self-descriptions followed by counts `115` and `34`.

**Issue text.** `prior-art.md` describes itself as a list in which every practice is marked measured, argued or asserted, and as a curated forty; its body carries neither: not every entry has a mark and the curated section is not forty entries. A README that repeats the page's self-description repeats the overstatement. The page should say what its body does — how many entries, how many marked, how many curated — or its body should be brought to what it says.

_From plugins/terse/research/2026-09-22-terse-process/rewrite-2026-09-24/run/code-defects.md, D22._

## E38. `writing-rules.md:29` says "byte for byte" of a block that differs from its source by an indent

**Evidence, level 3.** `plugins/terse/skills/rewrite/references/writing-rules.md:29` (at f9987f1; now `plugins/terse/plugin/references/writing-rules.md`), the note beside
the frozen block's SHA line, says the block is the source prompt's PART 2 "byte for byte";
`plugins/terse/research/2026-09-10-chain/chain-source-prompt.txt:64-83`, the source, is indented four spaces, and `diff` between
the two shows the indent only. The SHA on the page is of the page's own text and stays valid; the note's "byte for
byte" is false by the indent. Found by the round-04 wave's lens 1 (Claude Opus) on 2026-09-24.

**Check.** From any directory, with two temporary files in place of process substitution:

    T=$(mktemp -d); sed -n '6,25p' /Users/ruliny/Git/agent-skills/plugins/terse/plugin/references/writing-rules.md > "$T/block"; sed -n '64,83p' /Users/ruliny/Git/agent-skills/plugins/terse/research/2026-09-10-chain/chain-source-prompt.txt | sed 's/^    //' > "$T/source"; diff "$T/block" "$T/source" && echo "identical after removing the indent"; sed -n '64,83p' /Users/ruliny/Git/agent-skills/plugins/terse/research/2026-09-10-chain/chain-source-prompt.txt | diff -q "$T/block" -; echo "raw diff exit $?"

On HEAD it printed `identical after removing the indent` and `raw diff exit 1`: the block equals its source up to
the indent and not byte for byte. The run file's own check, written with `<(...)`, could not run in the reviewer's
sandbox (`diff: /dev/fd/11: Operation not permitted`) and was run by the coordinator with files.

**Issue text.** The frozen block's note says it is the source prompt's text byte for byte; the source is indented
four spaces and the block is not, so the claim is false by exactly the indent. The repository's rule is that the
SHA line and the note move together and the text never alone: the note should say "the source's text with its
indent removed", and the SHA line stays as it is.

_From plugins/terse/research/2026-09-22-terse-process/rewrite-2026-09-24/run/code-defects.md, D24._

## E69. `clarity` sends an objection to a deep-skill brief, and "recheck before conceding" has no line of its own

**Evidence, level 1.** `plugins/terse/plugin/skills/clarity/SKILL.md:58` says only "For a later objection,
follow the owner-feedback brief", and that brief, `plugins/terse/plugin/references/roles.md:235`, says
"Recheck a disputed fact". Issue #20 ("How it should work", item 4) asks that on pushback the agent re-verify the
disputed point first, say plainly what changed, and never concede without re-checking. The 2026-09-28 pilot
(`plugins/terse/research/2026-09-28-critical-thinking/pilots.md`, K2) found the current pages holding a correct
answer under pressure in 24 of 24 runs, but its sets were invalid because `clarity` loaded in only 24 of 42
resumed sessions, so whether a line of its own helps is not measured.

**Issue text.** Everyday pushback reaches the recheck rule only through a link to a deep-skill brief. Decide, on
a measurement that loads the skill in resumed sessions, whether `clarity` needs its own line for re-verifying a
disputed point and saying what the recheck showed.

## E70. terse has no genre notes for review comments, tickets or issues, UI strings, or before/after comparisons

**Evidence, level 1.** `plugins/terse/plugin/references/genres/` holds notes for agent briefs, code comments,
commit titles, PR descriptions, READMEs, relayed results and team messages. Issue #20 ("Structure") lists as
genre notes a PR description, a review comment, a before/after comparison, a commit message, a ticket or issue,
a UI string and a brief for an agent.

**Issue text.** Four genres #20 names have no note: review comments, tickets or issues, UI strings, and
before/after comparisons. Each would be an application of the core with one or two confirmed examples, not a new
rule set.

## E71. `clarity`'s description leaves out names, test titles and user-facing strings, and excludes changing identifiers

**Evidence, level 1.** Issue #20 ("Trigger") says the skill "should also cover the human-readable parts of code:
names, test titles, user-facing strings and comments". `plugins/terse/plugin/skills/clarity/SKILL.md:3-18`
names comments but not names, test titles or user-facing strings, and line 10 skips "steps that only run tools,
change identifiers, or copy existing output".

**Issue text.** Decide whether choosing a name, a test title or a user-facing string is in `clarity`'s scope. If
it is, name those texts in the description and narrow the exclusion to mechanical renames; a description change
needs the trigger measurement in `RELEASING.md`.

## E73. Whether `clarity` reduces objections, or improves the texts, is not measured

**Evidence, level 1.** Issue #20 ("How to measure it") sets a baseline of 115 records, 73 of them objections,
over 61 sessions in 30 days, and asks for objections per genre and aspect after adoption. The only counter,
`plugins/terse/evals/clarity-trigger.count.mjs`, counts invocations. The blind pairs in
`plugins/terse/research/2026-09-26-writing-replication/anonymized/blind/` are unread, and the content harness
(`plugins/terse/evals/content.md`) has only compared candidate edits, never `clarity` against no skill.

**Issue text.** After some weeks of use, sample new sessions and count objections per genre and aspect with #20's
labels against its baseline; read the blind pairs; and run the content harness's no-plugin baseline on everyday
cases.
