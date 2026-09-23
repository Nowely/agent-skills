# Defects found in passing

Recorded per the repository rule: evidence at file:line, an evidence level (1: the line resolves; 2: an
independent reader of the code would say the same; 3: the behaviour was made to happen), and wording that
can become an issue unchanged. An entry leaves when its fix lands and the changelog names it.

## E1. The codex page lists three `WEB_SEARCH:` values without saying a device policy may allow only some

**Evidence, level 3.** `plugins/entrust/skills/codex/SKILL.md:191` (at `7e7d9cc`) reads
`| `WEB_SEARCH:` | `cached`, `indexed`, `live` | the agent needs sources it cannot read locally |`. On
2026-09-17 two read agents whose prompt files carried `WEB_SEARCH: live` exited 2 before any turn; the
driver's stderr said: `entrust: --web-search live is not permitted by this device's managed policy, which
allows cached; the server would silently apply one of those and no response field would say so`. Both ran
after the line was changed to `cached` (`research/2026-09-17-orchestration-practices/rounds.md`, the
Planning row).

**Issue text.** The `WEB_SEARCH:` row of the header-fields table names `cached`, `indexed` and `live` as if
all three were always available. On a device whose managed policy allows only `cached`, a prompt file with
`live` is refused with exit 2 before the turn, and the coordinator learns the constraint from stderr after
writing the brief. The row should say that the driver refuses a mode the device policy forbids, name the
stderr line that says which modes are allowed, and name `cached` as the value that runs everywhere.

## E2. `orchestrate.test.mjs` pins none of the rules 0.15.0 added, and F2's "six bullets" is eight on the page

**Evidence, level 3.** On 2026-09-17, against `7e7d9cc`, deleting from the page in memory the bulk-unit
sentence (O L70), "Critique the split" (O L118), "open one return whole" (O L121) and "Prefer Luna" with
"announce its count" (O L68–69), singly and all five together, left all 45 registered cases of
`plugins/entrust/evals/orchestrate.test.mjs` green
(`research/2026-09-17-orchestration-practices/d1-design-v2.md`, §8, `mutation-baseline`); commit
`df8942a` (0.15.0) changed that suite only at its budget number. The case named "F2 the six verification
bullets, one line each" lists six regexes where the page's list has eight bullets (nine after the
2026-09-17 change; F2 pins six, F7 one, the two 0.15.0 bullets none).

**Issue text.** Three rules the 0.15.0 changelog names as that round's result and the Luna-over-Haiku
sentence have no pin, so an edit that drops any of them leaves the suite green. F2 should pin every
bullet of the verification list and say how many there are, and each unpinned sentence should get a
case. The 2026-09-17 change added pins only for its own sentences and the bullets it rewrote.

## E3. `round.mjs`'s provisional mark tests the claim's name and pattern, so a lifecycle claim worded without one of its eight words is never marked

**Evidence, level 3.** `plugins/terse/skills/rewrite/scripts/round.mjs:117` tests
`/lifecycle|stays|removed|continu|resum|reclaim|kept|prun/i` against `c.name + " " + c.pattern` and
nothing else. The record's R08-8 is a pruning claim named `"retention numbers"` with pattern
`"14 days or 400 entries"`: no word matches, no mark
(`research/2026-09-22-terse-process/d1-regression-autopsy.md:578-582`). Replaying
`research/2026-09-11-markup-round-0/edits/04.json`…`09.json` through the script on 2026-09-22 produces
40 ledger entries and zero marked provisional.

**Issue text.** A level-2 claim about a lifecycle is meant to be marked provisional, because three such
claims were pinned as true and each fell to a run in the next wave. The mark is decided by a regex over
the claim's own name and pattern, which are the writer's words, so a claim about retention, expiry,
eviction or cleanup written in any other vocabulary is pinned as settled. The `new` text of the edit —
the sentence the claim is about — is never read. Either the test reads the sentence, or the mark is
declared by the writer and the regex only warns.

## E4. `rewrite` step 4 gives no procedure for a ledger entry written by hand, and the one recorded run wrote 26 of them

**Evidence, level 3.** On 2026-09-22, replaying `research/2026-09-11-markup-round-0/edits/04.json`…
`09.json` through `plugins/terse/skills/rewrite/scripts/round.mjs` from an empty ledger produces 40
entries; `research/2026-09-11-markup-round-0/ledger.json` as shipped holds 66. The 26 in the file and
not in the replay were written by a hand no step describes. `plugins/terse/skills/rewrite/SKILL.md`
step 4 gives `round.mjs` as the only writer after initialisation — item 1 seeds the file with
`audit/scripts/ledger-seed.mjs` on the audit route (`plugins/terse/skills/rewrite/SKILL.md:104`), item 2
declares `claims`, `retire` and `drop`, item 3 runs the script, item 4 runs `ledger.mjs` over the
result — and `plugins/terse/skills/rewrite/references/loop.md:68-70` says the ledger is grown from each
edit's `claims` and `retire`. No step says a pin may be added outside an edit, by whom, or when.

**Issue text.** The record shows the coordinator adding ledger entries directly — retired phrasings a
critic found after the round was frozen, and pins for claims no edit introduced — which is the only way
those 26 entries exist. The page presents the ledger as a file its two scripts own, so a coordinator
following it has no route for a pin that arrives after the edits are written. The fields such an entry
needs are documented — `plugins/terse/skills/rewrite/scripts/ledger.mjs:3-4` gives the ledger's shape
and `plugins/terse/skills/rewrite/scripts/round.mjs:4-11` the edits file's — but the page a coordinator
executes gives no procedure for writing one: no step names who may add an entry between rounds, at what
point, or which round's regression count it is charged to. Either step 4 states that procedure, or the
pins that arrive late get an edits-file route of their own.

## E6. `writing-rules.md` and `measurements.md` repeat two counts from 2026-09-10 that the run's own prompts and judge contradict

**Evidence, level 2.** `plugins/terse/skills/rewrite/references/writing-rules.md:37-40` and
`plugins/terse/skills/rewrite/references/measurements.md:97-99` (M19) say five published writing
standards were put against two unguided controls and that seven of ten seats proposed nothing. The run's
prompts under `research/2026-09-10-chain/run-2x5/` (`v04PR6HL.prompt.txt:13-20`) describe a 2×5 design —
four standards, one of them an unpublished CLAUDE.md draft, plus one control pair — and the judge's own
count on the 116-word passage (`o8eHzS6U.answer.md:10-19`) reaches six at most, with three seats
lengthening it. Found by the 2026-09-22 truth pass (entries C39, C41, both refuted at README.md:76-78).

**Issue text.** The two reference pages restate the README's refuted numbers. `writing-rules.md` carries
the SHA-256 of its own text, so the correction changes the measurement it was made under and the SHA line
and the note beside it move together with the text, per the repository's rule on frozen blocks.

## E7. `prior-art.md` says every 2026-09-10 number traces to the bake-off directory, and the reader numbers do not

**Evidence, level 2.** `plugins/terse/references/prior-art.md:910-911` calls `run-2x5/` "forty Codex seat
returns from the bake-off" and says "Every 2026-09-10 number quoted anywhere in this file traces there".
`research/2026-09-10-chain/README.md` and `chain/` hold summaries of the reader run; the six readers of
the *before* measurement are recorded one by one, with verdicts, quoted lines and the one departure, in
`research/2026-09-10-chain/chain-source-prompt.txt:103-132` — not under `run-2x5/` — and no per-reader
record of the *after* measurement (6/6) exists anywhere in the repository. Found by the 2026-09-22 truth
pass (entries C31, C32, C36, C37 unconfirmed) and corrected on 2026-09-23 by the wave's lens 1, which
found the before-records this entry had said did not exist.

**Issue text.** The sentence overstates the record: the bake-off returns are there, the reader run's
before-records are in the chain's source prompt and its after-records are nowhere, and the claim should
name what traces and what does not.

## E8. `rule1.mjs` misses an exit code written in Russian, because its exit-code pattern is English; paths and flags are caught in either language

**Evidence, level 3.** `plugins/terse/skills/rewrite/scripts/rule1.mjs:26-31` matches absolute paths,
flags, environment variables, exit codes, protocol names and header fields; the exit-code pattern is
`/\bexits?\s+\d+\b|\bexit\s+(?:code|status)\b|\bexit\s+ladder\b/gi`, English words. Four probes on
2026-09-22 and 2026-09-23: three (the bake-off writers WA and WB, the judge J1, each in a scratch copy)
ran the script on an English line carrying a path, a flag and "exits 2" and on the same line in Russian
with «завершается с кодом 2» — the path and the flag were flagged in both languages, the exit code only in
English; the truth-pass agent's earlier probe reported the whole Russian line passing, which the three later
probes do not reproduce (`research/2026-09-22-terse-process/rewrite-2026-09-22/j1-opus-sheets.md`,
`audit-2026-09-22/audit.md` What broke). The owner's stated intent is that `terse` works on any text in
any language.

**Issue text.** Rule 1 — mechanism stays out of the sections a reader meets first — is checked by a script
whose path, flag, variable and header patterns are language-neutral and whose exit-code words are English,
so a document in another language that names an exit code in its own words passes that part of the check.
Either the exit-code pattern takes a word list per language, or the page says which of rule 1's six kinds
are checked for English text only.

## E9. `measure.md` does not say how the planted unanswerable question scores in the no-document arm

**Evidence, level 2.** `plugins/terse/skills/audit/references/measure.md:22-24` keys the planted question
as unanswerable and calls a confident answer a reader failure; `measure.md:70-81` defines the
no-document arm and says the reported score is the difference. A no-document reader answering "I do not
know" to the planted question is honest and matches the key, and the page does not say whether that
counts as knowledge. On 2026-09-22 the coordinator scored it as not right, which put the delta at 5/7
instead of 4/7 (`audit-2026-09-22/audit.md`, Open).

**Issue text.** The scoring of the planted question in the no-document arm changes the delta by one
question and the page leaves it to the scorer. The page should say whether the no-document arm counts a
correct "cannot tell" as a right answer, and the run-file contract should carry the choice.

## E10. Two pages set the scripts directory from a bare `$CLAUDE_PLUGIN_ROOT`, which Claude Code neither substitutes nor exports

**Evidence, level 2.** `plugins/terse/skills/rewrite/SKILL.md:83` ("installed, it is
`$CLAUDE_PLUGIN_ROOT/skills/rewrite/scripts`") and `plugins/terse/skills/audit/SKILL.md:159` ("installed,
`$CLAUDE_PLUGIN_ROOT/skills/audit/scripts`") tell the executor to set `S` and `A` from a bare variable.
`plugins/entrust/evals/agent-contract.test.mjs:160-161` states the contract: Claude Code substitutes the
exact `${...}` placeholder inline in a skill body and exports nothing to the Bash tool; a bare `$VAR` is
neither, so an agent that follows the line gets `/skills/rewrite/scripts`. `plugins/entrust/CHANGELOG.md:372-375`
records the same defect fixed on entrust's cleanup page by moving to `${CLAUDE_SKILL_DIR}`, which is
substituted on both the installed and the clone routes. Found on 2026-09-22 by the writer of the
run-directory fix (commits `9efef3d`, `3b71b62`); recorded, not fixed.

**Issue text.** On an installed plugin the two lines that locate the scripts resolve to a path under `/`,
so every `node "$S/..."` and `node "$A/..."` on the pages fails with a missing file. The fix is the form
entrust already uses: `${CLAUDE_SKILL_DIR}/scripts` for `S` and `${CLAUDE_SKILL_DIR}/../audit/scripts`
for `A`, with the checkout sentence kept.

## E11. Both run directories are outside the working directory, where the Write tool and shell redirects prompt, and neither page says so

**Evidence, level 1.** After `9efef3d`, `plugins/terse/skills/audit/SKILL.md:33` and
`plugins/terse/skills/rewrite/SKILL.md:71` place every run under the plugin's data directory or
`$TMPDIR/terse`, outside the repository and outside the session's working directory.
`plugins/entrust/README.md:137-138`: "In every permission mode but auto and bypass, a write outside the
working directory prompts, so add that directory to `permissions.additionalDirectories` once". The two
terse pages tell the coordinator to `mkdir -p "$RUN"` and to write the run file, the rounds, the edits and
the reviews there, and say nothing about the prompts or the setting. Found on 2026-09-22 by the writer of
the run-directory fix; the audit's placement predates it.

**Issue text.** A coordinator following either page in the default permission mode meets a permission
prompt for every file the run writes. The pages should say where the run lands, that writes there prompt
outside auto and bypass, and name `permissions.additionalDirectories` as the one-time setting, as
entrust's README does for its own data directory.

## E12. `measure.md` lets the audit store its score in the audited repository on the user's word, and the audit page says it writes nothing there

**Evidence, level 2.** `plugins/terse/skills/audit/SKILL.md:44`: "Write nothing into the audited
repository. Not a report, not a note, not a fix."
`plugins/terse/skills/audit/references/measure.md:117-121` ("Keeping the number as a regression test"):
"A score sitting in the audited repository turns documentation rot into a failing check … Storing it
there requires the user's word, because it means writing into their tree." Found on 2026-09-23 by the
bake-off judge Opus J1 while checking a candidate's sentence that the audit writes nothing into the
repository.

**Issue text.** The two pages disagree on whether the audit may ever write into the audited repository:
the skill page says never, the reference says on the user's word. A README that repeats either one is
refuted by the other. The pages should say one thing — the reference's rule, stated on the skill page as
the one exception with its consent step, or the reference's section removed.

## E13. `rethink` hands over "one file" and no page says where it is written

**Evidence, level 2.** `plugins/terse/skills/rethink/SKILL.md:70-83` (step 4, "What you hand over"):
"One file, and it describes the document rather than arguing for itself" — the section lists what the
file contains and ends "Then stop and wait", with no path, no run directory and no statement of whether
the file lands inside or outside the user's repository; `rewrite/SKILL.md` step 4 says only to copy
`skeleton.md` in. Found on 2026-09-22 by the truth pass (open item) and on 2026-09-23 by the writers WA
and WB and the judge J1, each of whom had to say in a README candidate that the location is unstated.

**Issue text.** `audit` and `rewrite` now name their run directory and its lifetime; `rethink` names
nothing, so a reader asking "can it change my files?" gets no answer for one skill of three. The page
should place the skeleton — the same formula as the other two, with a slug — and say so at the hand-over.
