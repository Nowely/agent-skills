# Defects found in passing

Recorded per the repository rule: evidence at file:line, an evidence level (1: the line resolves; 2: an
independent reader of the code would say the same; 3: the behaviour was made to happen), and wording that
can become an issue unchanged. An entry leaves when its fix lands and the changelog names it.

## E1. A user's "the network is allowed" becomes `WEB_SEARCH:`, and a mode the device refuses is swapped for `cached` without asking

**Evidence, level 3.**

- `plugins/entrust/skills/codex/SKILL.md:209` (at `23036f0`) reads
  `| `WEB_SEARCH:` | `cached`, `indexed`, `live` | the agent needs sources it cannot read locally |`, a
  "when" that reads as "the agent needs the internet". The network is another channel, open at every level
  with no line: `SKILL.md:175-176`, "Every level reaches the network, as a native subagent does, and
  `NETWORK: no` denies the sandbox that — not the provider's web search, which is `WEB_SEARCH:`'s own
  channel."
- This device's managed policy, `/Library/Managed Preferences/com.openai.codex.plist`, carries
  `allowed_web_search_modes = ["cached"]` in its `requirements_toml_base64`. `driver.mjs:1156-1178` reads
  it and `driver.mjs:2333-2338` refuses any other mode at `--run`; `--new` accepts the prompt file.
- 2026-09-17: two read agents with `WEB_SEARCH: live` exited 2 before the turn, and both ran after the
  line became `cached` (`research/2026-09-17-orchestration-practices/rounds.md`, the Planning row).
- 2026-09-25: the owner answered a proposal of two review agents with «ходить в сеть можно», the network
  is allowed. The coordinator wrote `WEB_SEARCH: live` into both prompt files; `--new` printed `PROMPT=…`
  and exited 0 for each, and each `--run` ended with `DRIVER_EXIT=2` and
  `ERROR=--web-search live is not permitted by this device's managed policy, which allows cached; the server would silently apply one of those and no response field would say so`,
  15 s and one spawned agent each, no Codex turn. The coordinator relaunched both with
  `WEB_SEARCH: cached`, the provider's cache, which nobody had asked for. The owner: «Была четкая
  установка. Сеть разрешена», «Не кеш, а сеть». The network they allowed needed no line at all.

**Issue text.** A user who allows the network means the agent's own commands — `curl`, `git`, `npm` —
which reach it at every level with no header line. The `WEB_SEARCH:` row describes itself only as "the
agent needs sources it cannot read locally", so a coordinator reads "the network is allowed" as
`WEB_SEARCH:` and picks a mode. On a device whose managed policy narrows the modes, the mode is refused at
`--run`, after `--new` accepted it and an agent was spawned; the refusal names the allowed modes, and the
coordinator swaps in one of them, a channel the user did not allow. It happened on 2026-09-17 and again on
2026-09-25, the second time after this entry had proposed naming `cached` as the value that runs
everywhere. The row should say that `WEB_SEARCH:` is the provider's search tool, not the network; that
network access needs no line; and that the field is set only when the user asks for the provider's search.
A mode the device refuses goes back to the user as a question, never to another mode. `--new` should check
the mode against the device policy, so that the refusal comes before an agent is spawned, and the refusal
should say that the network is unaffected.

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

**Evidence, level 3.** `plugins/terse/skills/rewrite/scripts/round.mjs:155` tests
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

## E6. `writing-rules.md` and `measurements.md` repeat two counts from 2026-09-10 that the run's own prompts and judge contradict

**Evidence, level 2.** `plugins/terse/references/writing-rules.md:37-40` and
`plugins/terse/references/measurements.md:97-99` (M19) say five published writing
standards were put against two unguided controls and that seven of ten seats proposed nothing. The run's
prompts under `research/2026-09-10-chain/run-2x5/` (`v04PR6HL.prompt.txt:13-20`) describe a 2×5 design —
four standards, one of them an unpublished CLAUDE.md draft, plus one control pair — and the judge's own
count on the 116-word passage (`o8eHzS6U.answer.md:10-19`) reaches six at most, with three seats
lengthening it. Found by the 2026-09-22 truth pass (entries C39, C41, both refuted at README.md:76-78). The research
index repeated them until `29ae657`, which rewrote its row from the judges' own words.

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

## E10. `rewrite` sets its scripts directory from a bare `$CLAUDE_PLUGIN_ROOT`, which Claude Code neither substitutes nor exports

**Evidence, level 2.** `plugins/terse/skills/rewrite/SKILL.md:70-71` (at 829c235) ("installed,
`$CLAUDE_PLUGIN_ROOT/skills/rewrite/scripts`") and `plugins/terse/skills/audit/SKILL.md:161` ("installed,
`$CLAUDE_PLUGIN_ROOT/skills/audit/scripts`") tell the executor to set `S` and `A` from a bare variable.
`plugins/entrust/evals/agent-contract.test.mjs:160-161` states the contract: Claude Code substitutes the
exact `${...}` placeholder inline in a skill body and exports nothing to the Bash tool; a bare `$VAR` is
neither, so an agent that follows the line gets `/skills/rewrite/scripts`. `plugins/entrust/CHANGELOG.md:372-375`
records the same defect fixed on entrust's cleanup page by moving to `${CLAUDE_SKILL_DIR}`, which is
substituted on both the installed and the clone routes. Found on 2026-09-22 by the writer of the
run-directory fix (commits `9efef3d`, `3b71b62`); recorded, not fixed. Since 2026-09-25 `audit` runs no script,
so its line is gone; `rewrite`'s remains.

**Issue text.** On an installed plugin the line that locates `rewrite`'s scripts resolves to a path under
`/`, so every `node "$S/..."` on the page fails with a missing file. The fix is the form entrust already
uses: `${CLAUDE_SKILL_DIR}/scripts` for `S`, with the checkout sentence kept.

## E11. All three run directories are outside the working directory, where the Write tool and shell redirects prompt, and no page says so

**Evidence, level 1.** After `9efef3d`, `plugins/terse/skills/audit/SKILL.md:33` and
`plugins/terse/skills/rewrite/SKILL.md:37` (at 829c235) place every run under the plugin's data directory or
`$TMPDIR/terse`, outside the repository and outside the session's working directory; `plugins/terse/skills/rethink/SKILL.md:19-20` (at
829c235) does the same for `rethink`'s run.
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

## E14. A `missing` failure on the planted unanswerable question cannot be repaired and re-measured under "the same key"

**Evidence, level 2.** `plugins/terse/skills/audit/SKILL.md:82-84` plants "at least one question the
documentation genuinely does not answer, and record it as unanswerable in the key"; step 6's cause table
(`audit/SKILL.md:127-133`) makes `missing` a failure a rewrite must repair by writing the answer;
`plugins/terse/skills/audit/references/measure.md:106-109` says a re-measurement uses "Same questions, same
key" and that changing any of them makes "a new measurement with a new baseline, not a result". On
2026-09-22 the live audit's planted question ("My documentation is in Russian — do the readers go through
it the same way?") was keyed unanswerable and, on the owner's ground truth, recorded as `missing`; the
rewrite wrote the answer, and on 2026-09-23 the round-02 question reader answered it from the text
(`research/2026-09-22-terse-process/rewrite-2026-09-22/run/reviews/02/c5-7.md`). Under the old key that
right answer is a failure; under a corrected key the re-measurement is "a new measurement".

**Issue text.** The three rules collide whenever the planted question's answer is what the rewrite is
asked to write. The page should say which gives way: the planted question is excluded from the score
delta once its answer is written (and the re-measure reports it beside the score), or the key entry is
rewritten and the re-measure says so, or the planted question must be one the owner does not intend the
document to answer. Found while executing the pages live.

## E15. `rewrite` keeps its candidate outside the repository, and no page says where the candidate stands when it is re-audited

**Evidence, level 2.** `plugins/terse/skills/audit/references/measure.md:35-37` (at d7a1f37) says a reader opens "the `.md` files in the repository", starts "at the entry file" and follows "links it finds in the text"; `plugins/terse/skills/audit/references/measure.md:49-50` says "You may open only .md files in <REPO>"; and `plugins/terse/skills/audit/references/measure.md:106-109` says a re-measurement uses the same questions, key, entry file and model. `plugins/terse/skills/rewrite/SKILL.md:33-37` (at 829c235) writes every run "Outside the repository that holds the text", and `plugins/terse/skills/rewrite/SKILL.md:78-83` hands the final text over and applies it only on the user's word. A final text in the run directory is neither the entry file nor one of the repository's `.md` files, and neither page says where it stands for a re-audit.

**Check.** From any directory:

    sed -n '35,37p;49p;106,109p' /Users/ruliny/Git/agent-skills/plugins/terse/skills/audit/references/measure.md; sed -n '33,37p;78,83p' /Users/ruliny/Git/agent-skills/plugins/terse/skills/rewrite/SKILL.md; echo "pages saying where a candidate stands for its re-audit: $(grep -rl -i -E 'temporary candidate|copy of (the|its) (markdown )?tree|relative (link|location)|links? (still )?resolve' /Users/ruliny/Git/agent-skills/plugins/terse/skills | wc -l | tr -d ' ')"

At 829c235 it prints the reader and re-audit rules, the run directory outside the repository and the hand-over, and ends `pages saying where a candidate stands for its re-audit: 0`.

**Issue text.** `rewrite` keeps its final text outside the user's repository and applies it only on their word. `audit` re-measures with the same entry file and lets its readers open only the repository's `.md` files. Between the two, no page says how a candidate is re-audited before it is applied: where it must stand, and what keeps its relative links pointing where the original's did. A user who re-audits the text where `rewrite` leaves it gives the readers a file outside the repository, with relative links that resolve against the run directory. The pages should say where a candidate stands for its re-audit (for example, at the original's path in a copy of the repository's Markdown tree), and `rewrite`'s hand-over should say so next to the diff.

_From research/2026-09-22-terse-process/rewrite-2026-09-22/run/code-defects.md, D1._

## E16. A retired phrase is matched case-sensitively, because `ledger.mjs` reads a `flags` field that no script writes

**Evidence, level 3.** `plugins/terse/skills/rewrite/scripts/ledger.mjs:3-4` (at d7a1f37) documents an optional `"flags": "i"` per entry, and `plugins/terse/skills/rewrite/scripts/ledger.mjs:18-20` builds each pattern as `new RegExp(pattern, flags ?? "")`. The two scripts that write ledger entries never set it: `plugins/terse/skills/rewrite/scripts/round.mjs:149-156` writes a retirement with no flags, and `plugins/terse/skills/audit/scripts/ledger-seed.mjs:61-62` writes `{ name, pattern, want, level, how }`. Every retired phrase in a ledger those scripts built is therefore matched with its case as written. `plugins/terse/skills/rewrite/references/measurements.md:44-46` records the miss once already: a retired phrase "survived in a table cell with a capital letter; the ledger's pattern did not match".

**Check.** From any directory:

    sh /var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T//terse/runs/20260922-233021-terse-readme/probe-03/d-probes.sh

On HEAD it exited 0 and printed `D2 retired phrase with a capital: ledger.mjs exit 0; retired row: retired L? - - -`, `D2 retired phrase in lower case: ledger.mjs exit 1; retired row: retired L? - - YES`, and `D2 scripts that write a flags field: 0 of 2`. The script is kept at `research/2026-09-22-terse-process/rewrite-2026-09-22/run/probe-03/d-probes.sh`; its line 5 names the temporary run directory it was written for.

**Issue text.** `ledger.mjs` supports a `flags` field on a ledger entry, but neither `round.mjs` nor `ledger-seed.mjs` writes one, so every retired phrase is matched case-sensitively. A round that brings a retired wording back with a capital letter — the first word of a sentence, a table cell — passes the ratchet with exit 0, the miss M8 already records. Retirements should be matched without regard to case (`round.mjs` and `ledger-seed.mjs` writing `flags: "i"` on `want: false` entries, or `ledger.mjs` defaulting them to it), and `selftest.mjs` should plant a capitalised revival.

_From research/2026-09-22-terse-process/rewrite-2026-09-22/run/code-defects.md, D2._

## E18. `rule1.mjs` does not report a bare environment-variable name or the braced `${VAR:-default}` form

**Evidence, level 3.** `plugins/terse/skills/rewrite/scripts/rule1.mjs:28` (at d7a1f37), the environment-variable pattern, is `/\$[A-Z_]{2,}|(?<![\w$])[A-Z][A-Z0-9]*_[A-Z0-9_]+(?![\w])/g`: it matches `$TMPDIR` and a name with an underscore, and neither a bare name without one (`PATH`) nor the braced form `${TMPDIR:-/tmp}`. `plugins/terse/skills/rewrite/scripts/selftest.mjs:11-13` plants only a flag and a tilde path.

**Check.** The same command as D2 was run exactly:

    sh /var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T//terse/runs/20260922-233021-terse-readme/probe-03/d-probes.sh

On HEAD it exited 0 and printed `D4 rule1 on planted lines 1-4: exit 1; reported: ! line 3 env var $TMPDIR;! line 4 flag name --keep-data;`, omitting planted `PATH` and `${TMPDIR:-/tmp}` lines 1 and 2. The script is kept at `research/2026-09-22-terse-process/rewrite-2026-09-22/run/probe-03/d-probes.sh`; its line 5 names the temporary run directory it was written for.

**Issue text.** Rule 1 keeps environment variables out of the sections a reader meets first, and `rule1.mjs` checks it with a pattern that needs either `$NAME` or an underscore in the name. A bare `PATH`, `HOME` or `EDITOR` and the braced `${TMPDIR:-/tmp}` pass unreported, and the self-test plants neither, so a clean result on those forms is not evidence. The pattern should cover `${…}` and a backticked bare upper-case name, and `selftest.mjs` should plant both.

_From research/2026-09-22-terse-process/rewrite-2026-09-22/run/code-defects.md, D4._

## E19. A checkout loaded with `claude --plugin-dir` puts its runs in a data directory the pages do not name, and `claude plugin uninstall` cannot remove it

**Evidence, level 3.** `plugins/terse/skills/audit/SKILL.md:36-42` (at d7a1f37) says `D` is empty for a source checkout and gives only an installed-plugin data directory and a temporary-directory fallback. `plugins/terse/skills/rewrite/SKILL.md:31-43` (at 829c235) uses the same formula and gives the same two lifetime cases. A checkout loaded with `claude --plugin-dir plugins/terse` is neither: Claude Code loads it as `terse@inline`, writes a configuration-local `plugins/data/terse-inline` into the line, and `claude plugin uninstall terse@inline` refuses it because it has no marketplace backing. Since 2026-09-25 the three skills link one statement of it, `plugins/terse/references/run.md:9-13`.

**Check.** From any directory:

    sh /var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T//terse/runs/20260922-233021-terse-readme/probe-03/plugindir-probe.sh; sed -n '9,13p' /Users/ruliny/Git/agent-skills/plugins/terse/references/run.md

On HEAD it exited 0 under a freshly reset signed-out profile, printed `"source":"terse@inline"`, `D="<probe>/config-pdir/plugins/data/terse-inline"`, `data directory terse-inline: exists; temporary directory runs: absent`, uninstall exit 1 with "it cannot be uninstalled", and `stub run after that uninstall: present`; the moved `rewrite` lifetime lines are now 76-87. The script is kept at `research/2026-09-22-terse-process/rewrite-2026-09-22/run/probe-03/plugindir-probe.sh`; its line 6 names the temporary run directory it was written for.

**Issue text.** `audit` and `rewrite` tell the agent where a run lives and how long it lasts in two cases: an installed plugin, whose data directory `claude plugin uninstall` deletes unless `--keep-data`, and a source checkout, whose data directory is empty so the run falls back to the temporary directory. A checkout loaded with `claude --plugin-dir` is a third case the pages call the second: Claude Code writes `plugins/data/terse-inline` under its configuration directory into the run line, the run lands there, and `claude plugin uninstall` refuses that plugin, so the run outlives the session and no command the pages name removes it. The pages should state the rule by what the line does — the data directory when Claude Code supplies one, the temporary directory otherwise — and say that a `--plugin-dir` run is the user's to remove.

_From research/2026-09-22-terse-process/rewrite-2026-09-22/run/code-defects.md, D5._

## E20. The task reader's brief starts its state under `$TMPDIR` and names no isolated configuration for a host application's commands

**Evidence, level 2.** `plugins/terse/skills/audit/SKILL.md:109-118` (at d7a1f37) sends two readers with "a starting state and an outcome they want, acting from the documentation alone" and says "Check the state they produce, not what they say"; it names no place for that state and no isolated configuration for a host application's commands. `plugins/terse/skills/rewrite/references/roles.md:113-118` (at 829c235), `rewrite`'s task reader, has its starting state "created under $TMPDIR", and the page's header has every brief end "write only under `$TMPDIR`"; neither page names an isolated configuration for a host application's commands. Since 2026-09-25 `audit`'s task readers, now run only in a full run, are sent the same brief 9 of `plugins/terse/references/roles.md`, so both start under `$TMPDIR`; the brief still names no isolated configuration.

**Check.** From any directory:

    sed -n '107,116p' /Users/ruliny/Git/agent-skills/plugins/terse/skills/audit/SKILL.md | grep -c -E 'TMPDIR|isolated|CONFIG_DIR'; git -C /Users/ruliny/Git/agent-skills show 829c235:plugins/terse/skills/rewrite/references/roles.md | sed -n '113,118p'

At 829c235 it prints `0` for the audit's step and then the task reader's brief with its `$TMPDIR` starting state. On 2026-09-25, `grep -c -E 'isolated|CONFIG_DIR' /Users/ruliny/Git/agent-skills/plugins/terse/references/roles.md` printed `0` for the brief both skills now send.

**Issue text.** `audit` and `rewrite` send their task readers one brief, which starts the reader's state under `$TMPDIR` and names no isolated configuration for a host application's commands. A task reader of a document that installs a plugin, edits a configuration or runs a recipe that resets a tree acts on the user's real machine. The brief should say it: a host application's commands in an isolated configuration under `$TMPDIR`, and nothing written outside it.

_From research/2026-09-22-terse-process/rewrite-2026-09-22/run/code-defects.md, D6._

## E21. The pages give a run's lifetime as deleted by `claude plugin uninstall` unless `--keep-data`, and it is not

**Evidence, level 3.** `plugins/terse/skills/audit/SKILL.md:39-42` (at d7a1f37) and `plugins/terse/skills/rewrite/SKILL.md:40-43` (at 829c235) state that a run under the plugin data directory survives updates and is deleted by `claude plugin uninstall` unless `--keep-data`. Neither page names scope, the last installation, or `claude plugin marketplace remove`. In fresh signed-out Claude configurations, uninstalling one of two installations kept the data and run until the last installation was removed, while `claude plugin marketplace remove nowely` deleted them and offered no `--keep-data` option. Since 2026-09-25 the three skills link one statement of it, `plugins/terse/references/run.md:9-13`.

**Check.** From any directory:

    sh /var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T//terse/runs/20260922-233021-terse-readme/probe-04/lifetime-probe.sh; sed -n '9,13p' /Users/ruliny/Git/agent-skills/plugins/terse/references/run.md; echo "page lines naming marketplace remove, a scope or the last installation: $(cat /Users/ruliny/Git/agent-skills/plugins/terse/references/run.md | grep -c -E 'marketplace remove|last (installation|scope)|--scope')"

On HEAD it exited 0 and printed all four expected states: A absent after uninstall, B present after `--keep-data`, C present after uninstalling one scope then absent after the last, D absent after marketplace removal, plus `marketplace remove options: --help --scope` and the final page count `0`; the moved `rewrite` lifetime text is at lines 84-87. The script is kept at `research/2026-09-22-terse-process/rewrite-2026-09-22/run/probe-04/lifetime-probe.sh`; its line 8 names the temporary run directory it was written for.

**Issue text.** `audit` and `rewrite` tell the agent that a run under the plugin's data directory is deleted by `claude plugin uninstall` unless `--keep-data` is passed, and the agent passes that on as the run's lifetime. Measured on Claude Code 2.1.280, it is wrong in two directions. With the plugin installed at two scopes, uninstalling one keeps the data directory and its runs; they go only when the last installation is removed. And `claude plugin marketplace remove` deletes them as well, with no `--keep-data` to stop it. A user who removes the marketplace to tidy up loses every run without being warned, and a user who reads "uninstall deletes it" while a second installation remains expects a deletion that does not happen. `references/run.md`, which both pages link, should say that the runs are deleted when the plugin's last installation is removed, by `claude plugin uninstall` without `--keep-data` or by `claude plugin marketplace remove`, which has no such option.

_From research/2026-09-22-terse-process/rewrite-2026-09-22/run/code-defects.md, D7._

## E23. A pinned claim's evidence is run once, when its round is written, and never again

**Evidence, level 3.** `plugins/terse/skills/rewrite/scripts/round.mjs:120-132` (at d7a1f37) executes every edit's `check.run`, refuses the round when an `expect` finds nothing, and keeps the output as `saw`; `plugins/terse/skills/rewrite/scripts/round.mjs:149-155` stores `run`, `expect` and `saw` in the ledger. `plugins/terse/skills/rewrite/scripts/ledger.mjs:18-24` reads only `pattern` and `want` of every entry against the round files and never executes `run`. The edits format in the header of `round.mjs` recommends line-based `sed -n 'A,Bp'` checks, so a pin can stay green after its evidence citation moves; since 829c235 no step of `rewrite` runs the two scripts, which still ship.

**Check.** From any directory:

    node /var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T//terse/runs/20260922-233021-terse-readme/probe-04/rot-check.mjs

On HEAD it exited 0 and printed `R02e as written in round 02, run today: expect matches: false` followed by `ledger.mjs over the ledger that holds that entry, rounds 00-03: exit 0 | 0 failure(s)`. The script is kept at `research/2026-09-22-terse-process/rewrite-2026-09-22/run/probe-04/rot-check.mjs`; its line 4 names the temporary run directory it was written for.

**Issue text.** `round.mjs` runs a claim's check once, when the round that declares it is written, and `ledger.mjs` afterwards checks only that the pinned sentence is still present. The evidence behind a pin can therefore stop resolving — the cited file edited, its lines shifted by a commit above them — and nothing reports it: the pin stays green while its `saw` describes a file that no longer says that at those lines. The script's own advice to cite by `sed -n 'A,Bp'` makes this the common case. `ledger.mjs`, or `round.mjs` at every round, should re-run every pinned entry's `run` and report the entries whose `expect` no longer matches, as a report before it is a gate; and the page should prefer anchors that survive a line shift — a heading, a phrase — over line numbers wherever the cited file is one that changes.

_From research/2026-09-22-terse-process/rewrite-2026-09-22/run/code-defects.md, D9._

## E25. `sections.mjs` drops a renamed section from its over-budget count and says nothing when a budgeted section disappears

**Evidence, level 3.** `plugins/terse/skills/rewrite/scripts/sections.mjs:19-24` (at d7a1f37) reports each heading it finds against `budgets.json` and counts over-budget sections only among those rows; a heading absent from the budget is printed as "(no budget)" and leaves the count, and a budgeted heading absent from the document is never mentioned.

**Check.** The same command as D10 was run exactly:

    sh /var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T//terse/runs/20260922-233021-terse-readme/probe-04/d10-d13-check.sh

On HEAD it exited 0 and printed `D11 sections.mjs on a copy whose Install heading is renamed: 119 Installing (no budget); 1140 TOTAL, 3 section(s) over budget;` and `D11 sections.mjs on a copy without the Licence section, lines naming Licence or a missing section: 0`. The script is kept at `research/2026-09-22-terse-process/rewrite-2026-09-22/run/probe-04/d10-d13-check.sh`; its line 4 names the temporary run directory it was written for.

**Issue text.** `sections.mjs` is the report that shows a section swelling round by round. It loses a section from the over-budget count the moment its heading changes, and it is silent when a budgeted section is gone. It should print every budgeted heading the document lacks, and count a "(no budget)" heading as a section the writer must map or the coordinator must budget, so that a rename cannot hide growth.

_From research/2026-09-22-terse-process/rewrite-2026-09-22/run/code-defects.md, D11._

## E26. `sections.mjs` counts space-separated words, so its budgets and growth mean nothing for text without spaces

**Evidence, level 3.** `plugins/terse/skills/rewrite/scripts/sections.mjs:13` (at d7a1f37) counts words as `buf.join(" ").split(/\s+/).filter(Boolean).length`. A Chinese sentence of twenty-six characters with no spaces counts as one word, so a section written in such a script is never measured by the intended unit.

**Check.** The same command as D10 was run exactly:

    sh /var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T//terse/runs/20260922-233021-terse-readme/probe-04/d10-d13-check.sh

On HEAD it exited 0 and printed `D12 sections.mjs on a Chinese sentence with no spaces: 1 介绍 (no budget)` and the whitespace-splitting implementation at `plugins/terse/skills/rewrite/scripts/sections.mjs:13`. The script is kept at `research/2026-09-22-terse-process/rewrite-2026-09-22/run/probe-04/d10-d13-check.sh`; its line 4 names the temporary run directory it was written for.

**Issue text.** The plugin says its scope is Markdown in any language, and its budget report counts words by splitting on whitespace, which counts a sentence in Chinese, Japanese or Thai as one word. `sections.mjs` should count by a unit that exists in every script — characters, or graphemes by `Intl.Segmenter` — or the pages should say the budgets are measured in space-separated words and hold for such languages only.

_From research/2026-09-22-terse-process/rewrite-2026-09-22/run/code-defects.md, D12._

## E29. A re-audit "with the same questions" is required by `measure.md` and no audit step takes an earlier run as input

**Evidence, level 2.** `plugins/terse/skills/audit/references/measure.md:106-109` (at d7a1f37) requires the same questions, key, entry file and model. `plugins/terse/skills/audit/SKILL.md:23-34` makes a new run directory and `plugins/terse/skills/audit/SKILL.md:71-77` writes questions and the key without reading an earlier run. The only "same questions" line on the audit page is the no-document baseline at `plugins/terse/skills/audit/SKILL.md:96-102`, not a previous audit input.

**Check.** From any directory:

    grep -n -i -E 'previous run|earlier run|same questions' /Users/ruliny/Git/agent-skills/plugins/terse/skills/audit/SKILL.md; sed -n '106,109p' /Users/ruliny/Git/agent-skills/plugins/terse/skills/audit/references/measure.md

On HEAD it exited 0; grep printed only line 96's baseline-arm "same questions", no "previous run" or "earlier run", and sed printed the re-measurement rule.

**Issue text.** `measure.md` requires a re-audit to reuse the questions, the key, the entry file and the model of the first audit, and the audit page has no step that takes a first audit's run as input: step 1 makes a fresh run directory and step 4 writes fresh questions from the profile. A user who audits again after a rewrite gets a new measurement, not a comparison, unless they carry the questions over by hand. Step 1 should accept a previous run directory and steps 4 and 5 should reuse its questions, key and baseline when one is given.

_From research/2026-09-22-terse-process/rewrite-2026-09-24/run/code-defects.md, D15._

## E30. `rule1.mjs` misses a one-dash flag, a header field inside a code span and "status 127", and flags a document name before a colon

**Evidence, level 3.** `plugins/terse/skills/rewrite/scripts/rule1.mjs:27` (at d7a1f37) matches flags with two dashes only; `plugins/terse/skills/rewrite/scripts/rule1.mjs:31` excludes a header field preceded by a backtick even though `plugins/terse/skills/rewrite/scripts/rule1.mjs:9-10` says fences are not skipped; `plugins/terse/skills/rewrite/scripts/rule1.mjs:29` needs "exit" before a code; and the line-31 pattern reports `README:` as a header field.

**Check.** From any directory, with `S=/Users/ruliny/Git/agent-skills/plugins/terse/skills/rewrite/scripts`:

    T=$(mktemp -d); printf '# t\n\nRun it with -p and read `X-Api-Key:` in the header; on failure it ends with status 127, as README: says.\n\n## How it works\n\nmechanism\n' > "$T/plant.md"; node "$S/rule1.mjs" "$T/plant.md" --cut "How it works"; echo "exit $?"

On HEAD it exited 0 as a compound check and printed only `! line 3  header field   README:`, `1 violation(s), 0 excused`, and `exit 1`, missing the other three planted forms.

**Issue text.** Rule 1 keeps mechanism out of the sections a reader meets first, and `rule1.mjs` checks it with patterns that need a double-dash flag, a header field outside a code span and the word "exit" before a code, while it reports a document name followed by a colon as a header field. A section that says `-p`, names a header in backticks or writes "status 127" passes; a sentence that says "as README: shows" fails. The patterns should cover the one-dash flag, the code-span field and "status <code>", and a capitalised word before a colon should count as a header field only when it looks like one (a hyphenated or lower-case name), with the self-test planting all four.

_From research/2026-09-22-terse-process/rewrite-2026-09-24/run/code-defects.md, D16._

## E31. `dup.mjs` never compares a concept with the section its name gives, so a concept outside its home passes short of three

**Evidence, level 3.** `plugins/terse/skills/rewrite/scripts/dup.mjs:2-6` (at d7a1f37) says it counts the sections a concept matches and flags only three or more; `plugins/terse/skills/rewrite/scripts/dup.mjs:17-25` implements that threshold without interpreting the home carried in a concept's name. A concept named "a fix is not undone — How it works" that also matches the opening therefore prints two sections and zero flagged concepts.

**Check.** From any directory, with `S=/Users/ruliny/Git/agent-skills/plugins/terse/skills/rewrite/scripts` and `R=/Users/ruliny/Git/agent-skills/research/2026-09-22-terse-process/rewrite-2026-09-24/run`:

    node "$S/dup.mjs" "$R/02-grafts.md" "$R/concepts.01.json"

On HEAD it exited 0 and printed `2   a fix is not undone — How it works (opening) | How it works` and `0 concept(s) in three or more sections`.

**Issue text.** The skeleton names a home for every concept ("one idea, one home"), and `dup.mjs` reports only a concept found in three or more sections: a concept that appears in its home and one other section passes, which is the duplication the rule forbids. Where a concept's name carries its home section, the script should report any match outside it; where it does not, the threshold should be two.

_From research/2026-09-22-terse-process/rewrite-2026-09-24/run/code-defects.md, D17._

## E34. `round.mjs`'s qualification signal is an English word list, so the same clause in another language is written without a reason

**Evidence, level 3.** `plugins/terse/skills/rewrite/scripts/round.mjs:92-101` (at d7a1f37) detects qualifying forms with an English-only regular expression (`unless`, `except when`, `only if`, and kin). The Russian clause «если только вы не передадите --prune» adds no matching form and is written with exit 0.

**Check.** From any directory, with `S=/Users/ruliny/Git/agent-skills/plugins/terse/skills/rewrite/scripts`:

    T=$(mktemp -d); printf 'The tool keeps runs.\n' > "$T/00.md"; printf '[{"name":"ru","old":"The tool keeps runs.","new":"The tool keeps runs, если только вы не передадите --prune.","claims":[{"name":"k","pattern":"keeps runs","asks":"runs are kept"}],"check":{"level":1,"run":"echo x","expect":"x"}}]' > "$T/e.json"; echo "[]" > "$T/l.json"; node "$S/round.mjs" "$T/00.md" "$T/01.md" "$T/e.json" --ledger "$T/l.json"; echo "exit $?"

On HEAD it exited 0 and printed `ran  ru`, `ok  ru`, the ledger write, and `exit 0`.

**Issue text.** `round.mjs` refuses an edit that adds a qualifying clause without a reason, and recognises the clause by an English word list, so a caveat written in any other language passes unseen. The list should carry the common forms of the languages the plugin claims, or the check should be handed to the verifier's fifth duty with the script marking every edit whose `new` grew a subordinate clause, in any language, by structure rather than by words.

_From research/2026-09-22-terse-process/rewrite-2026-09-24/run/code-defects.md, D20._

## E36. `prior-art.md` overstates its own body: "every practice marked measured, argued or asserted" and "the curated forty"

**Evidence, level 2.** `plugins/terse/references/prior-art.md:14-18` (at d7a1f37) says practices are marked measured, argued or asserted, and `plugins/terse/references/prior-art.md:299-304` calls the curated section "the curated forty". The check counts 115 numbered entries and only 34 lines carrying one of the marks, which supports neither "every" nor "forty".

**Check.** From any directory:

    sed -n '14,15p;302p' /Users/ruliny/Git/agent-skills/plugins/terse/references/prior-art.md; grep -c -E '^\s*[0-9]+\. \*\*' /Users/ruliny/Git/agent-skills/plugins/terse/references/prior-art.md; grep -c -i -E '\b(measured|argued|asserted)\b' /Users/ruliny/Git/agent-skills/plugins/terse/references/prior-art.md

On HEAD it exited 0 and printed the two self-descriptions followed by counts `115` and `34`.

**Issue text.** `prior-art.md` describes itself as a list in which every practice is marked measured, argued or asserted, and as a curated forty; its body carries neither: not every entry has a mark and the curated section is not forty entries. A README that repeats the page's self-description repeats the overstatement. The page should say what its body does — how many entries, how many marked, how many curated — or its body should be brought to what it says.

_From research/2026-09-22-terse-process/rewrite-2026-09-24/run/code-defects.md, D22._

## E38. `writing-rules.md:29` says "byte for byte" of a block that differs from its source by an indent

**Evidence, level 3.** `plugins/terse/skills/rewrite/references/writing-rules.md:29` (at f9987f1), the note beside
the frozen block's SHA line, says the block is the source prompt's PART 2 "byte for byte";
`research/2026-09-10-chain/chain-source-prompt.txt:64-83`, the source, is indented four spaces, and `diff` between
the two shows the indent only. The SHA on the page is of the page's own text and stays valid; the note's "byte for
byte" is false by the indent. Found by the round-04 wave's lens 1 (Claude Opus) on 2026-09-24.

**Check.** From any directory, with two temporary files in place of process substitution:

    T=$(mktemp -d); sed -n '6,25p' /Users/ruliny/Git/agent-skills/plugins/terse/references/writing-rules.md > "$T/block"; sed -n '64,83p' /Users/ruliny/Git/agent-skills/research/2026-09-10-chain/chain-source-prompt.txt | sed 's/^    //' > "$T/source"; diff "$T/block" "$T/source" && echo "identical after removing the indent"; sed -n '64,83p' /Users/ruliny/Git/agent-skills/research/2026-09-10-chain/chain-source-prompt.txt | diff -q "$T/block" -; echo "raw diff exit $?"

On HEAD it printed `identical after removing the indent` and `raw diff exit 1`: the block equals its source up to
the indent and not byte for byte. The run file's own check, written with `<(...)`, could not run in the reviewer's
sandbox (`diff: /dev/fd/11: Operation not permitted`) and was run by the coordinator with files.

**Issue text.** The frozen block's note says it is the source prompt's text byte for byte; the source is indented
four spaces and the block is not, so the claim is false by exactly the indent. The repository's rule is that the
SHA line and the note move together and the text never alone: the note should say "the source's text with its
indent removed", and the SHA line stays as it is.

_From research/2026-09-22-terse-process/rewrite-2026-09-24/run/code-defects.md, D24._

## E39. `advisor`, `experiment` and `swarm` start by loading `orchestrate` through the Skill tool, which refuses a skill marked `disable-model-invocation`

**Evidence, level 3 for `advisor`, level 1 for the other two.**

- `plugins/entrust/skills/advisor/SKILL.md:13` (at `75ba5e9`) begins "Load [orchestrate](../orchestrate/SKILL.md) now
  (Skill tool, `entrust:orchestrate`; …)"; `experiment/SKILL.md:13` and `swarm/SKILL.md:13` begin the same way.
- `plugins/entrust/skills/orchestrate/SKILL.md:6` is `disable-model-invocation: true`.
- 2026-09-25: the owner invoked `/entrust:advisor`; the coordinator's Skill call for `entrust:orchestrate` returned
  "Skill entrust:orchestrate cannot be used with Skill tool due to disable-model-invocation. Ask the user to run
  /entrust:orchestrate themselves — it cannot be invoked via the Skill tool. Do not replicate this skill's workflow
  by other means — it is reserved for explicit user invocation." The advisor did not start.

**Check.** `grep -n 'disable-model-invocation' /Users/ruliny/Git/agent-skills/plugins/entrust/skills/orchestrate/SKILL.md; grep -n 'Skill tool, `entrust:orchestrate`' /Users/ruliny/Git/agent-skills/plugins/entrust/skills/*/SKILL.md`
prints line 6 of `orchestrate` and line 13 of `advisor`, `experiment` and `swarm`.

**Issue text.** Three user-invoked skills open by telling the model to load `orchestrate` with the Skill tool, and
`orchestrate` is marked `disable-model-invocation`, so the load is refused and none of the three starts as written.
The owner's direction for `advisor` (2026-09-25): «В целом advisor не считаю, что должен тянуть orchestrate» — the
advisor adds one thread of the other model family to whatever run it is invoked in and loads only `codex`, which the
Skill tool accepts. For `experiment` and `swarm` the page either asks the user to run `/entrust:orchestrate` first or
stops depending on it.

## E40. `rule1.mjs` reports a link's URL as an absolute path, and a flag in the install block that rule 7 requires

**Evidence, level 3.** On 2026-09-25, `node plugins/terse/skills/rewrite/scripts/rule1.mjs 02-repaired.md --cut "How it works"`
on the one-path maestro README (`research/2026-09-24-terse-benchmark-maestro/one-path/02-repaired.md`) reported
`/marketplace.visualstudio.com/items`, `/open-vsx.org/extension/sharpdeveye/maestro-workflow` and
`/www.npmjs.com/package/maestro-workflow-mcp` as absolute paths, from `https://…` link targets: the path pattern at
`rule1.mjs:26` (at `75ba5e9`) excludes a preceding word character, `.`, `~`, `$` and `)`, but not `/`, so it matches from
the second slash of `https://`. It also reported `--skill` in the Quick start block `npx skills add sharpdeveye/maestro
--skill '*'`, the only form that installs every skill; `rule1.mjs:9-10` scans fences on purpose and `rule1.mjs:45`
lets `--except` excuse absolute paths only, while `references/rules.md` rule 7 asks for the install "in the form that
runs".

**Issue text.** `rule1.mjs` keeps mechanism out of the first sections, and on a real README three of its five
reports were link URLs read as absolute paths, because its path pattern matches after the second slash of `https://`.
A fourth was a flag inside the install command that the rules require to be copyable as it runs, and no switch can
excuse a flag. The path pattern should skip a match preceded by `:/`, link targets should be stripped before
matching, and a flag in a fenced install block under the rules' Quick start should be exempt or excusable.
