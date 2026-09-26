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

## E41. `sections.mjs` finds no budget when `budgets.json` keys carry the `## ` that brief 1 names

**Evidence, level 3.**

- `plugins/terse/skills/rewrite/scripts/sections.mjs:15` (at `e38699a`) keeps a heading's text without its `## `,
  and `sections.mjs:20` looks the budget up by that text alone; its usage line, `sections.mjs:3`, reads
  `BUDGETS.json = {"<heading text>": <words>, ...}`.
- `plugins/terse/references/roles.md:55-56`, brief 1, tells the writer to write the budgets "to <OUT>/budgets.json,
  every `## ` heading mapped to its words".
- 2026-09-26: both writers of the second checks keyed the file as `"## Install"`
  (`research/2026-09-26-terse-second-checks/dust-readme/budgets.json`, `…/dir-walker-comments/budgets.json`). On the
  repaired README the script printed "(no budget)" beside every section and "0 section(s) over budget"
  (`…/dust-readme/check/scripts.txt`).

**Check.**

    T=$(mktemp -d); printf '# t\n\n## Install\n\none two three\n' > "$T/t.md"; printf '{"## Install": 1}' > "$T/b.json"; node /Users/ruliny/Git/agent-skills/plugins/terse/skills/rewrite/scripts/sections.mjs "$T/t.md" "$T/b.json"

prints `3 Install   (no budget)` and `0 section(s) over budget`; with the key `"Install"` the same section prints
`+2` and `1 section(s) over budget`.

**Issue text.** `rewrite` runs `sections.mjs` to report the words of each section against the writer's own
budgets, and the script looks each budget up by the heading's text. Brief 1 asks the writer for "every `## `
heading mapped to its words", and writers key the file as `"## Install"`; the script then finds no budget for any
section and reports none over, with nothing to say it matched nothing. It should strip the leading `#`s from a key
and name any key that matches no heading, and brief 1 should ask for each heading's text.

## E42. The genre scout's brief asks for "raw markdown", which a kind of text that is not markdown does not have

**Evidence, level 1.** `plugins/terse/references/roles.md:76-78` (at `e38699a`), brief 2, asks for five to eight
documents of the kind "as raw markdown with curl, never through a summarising tool". On 2026-09-26 the kind was the
comments of a Rust source file, and the coordinator filled the brief as "raw text"
(`research/2026-09-26-terse-second-checks/dir-walker-comments/briefs/G1.codex.txt`); the scout fetched eight source
files and rebuilt the table's places for comments by itself.

**Check.** `grep -n 'raw markdown' /Users/ruliny/Git/agent-skills/plugins/terse/references/roles.md` prints line 77.

**Issue text.** `rules.md` is for any text, and the genre scout is how a writer sees the best texts of a kind the
notes do not cover yet; its brief asks for them "as raw markdown with curl". For the comments of a source file, a
man page or a story there is no markdown to fetch, and the coordinator has to rewrite the brief before the scout can
run. The brief should ask for each document's raw text, fetched with curl and never through a summarising tool.

## E43. An `agent-run` case fails on CI: SIGTERM to the waiting `--run` finds a driver that already finished

**Evidence, level 3 for the failure, level 2 for the cause.**

- `plugins/entrust/evals/agent-run.test.mjs:290` (at `01d1158`), "--run refuses a directory that ran for another
  report path, … and forwards SIGTERM to a driver it only waits for", sends SIGTERM to the second, waiting call at
  `:320` and requires `DRIVER_EXIT=1` in both outputs at `:322`.
- CI on main failed on this case alone, "1/15 failed", with the lines `["DRIVER_EXIT=0","DRIVER_EXIT=0"]`: run
  35277743392 (9a539d3, macOS, Node 22), 35319899766 (8983268, Ubuntu, Node 24), 36249088680 (0f05244, Ubuntu,
  Node 22); it also failed CI on PR #12 and PR #14. Three OS and Node pairs, one line.
- Exit 0 in both outputs says the fake turn completed before the signal landed; nothing in the case holds the turn
  open until the signal is sent (level 2).

**Check.** `gh run view 36249088680 --repo Nowely/agent-skills --log-failed | grep -A1 'FAIL  --run refuses'`
prints the failure with `["DRIVER_EXIT=0","DRIVER_EXIT=0"]`.

**Issue text.** The `agent-run` case that forwards SIGTERM to a driver the second `--run` only waits for fails on
CI about one run in three, on macOS and Linux and on Node 22 and 24, always the same way: both calls print
`DRIVER_EXIT=0`, so the turn had completed before the signal arrived. A red main has become ordinary, which hides a
real failure among these. The case should hold the fake turn open until the signal is sent, or wait for a state
that proves the driver is still in its turn, before it sends SIGTERM.

## E44. Two `lock` cases fail on CI now and then, and the lock concurrency failure was never diagnosed

**Evidence, level 3 for the failures; no cause established.**

- `plugins/entrust/evals/lock.test.mjs:142` (at `01d1158`), "a run releases only the lock it owns", failed CI run
  34710644138 (3960788, macOS, Node 22) with "releaseLock removed or changed the peer's replacement lock".
- `lock.test.mjs:352`, "two concurrent runs: exactly one wins", failed CI run 35320724153 (8c041b7, Ubuntu,
  Node 24) with "expected one 0 and one 10, got [0,0]", 1/58 failed.
- Commit `fc20cf5` already recorded a lock case as "not diagnosed" after a red CI.

**Check.** `gh run view 35320724153 --repo Nowely/agent-skills --log-failed | grep 'FAIL '` prints the concurrency
failure; `gh run view 34710644138 --repo Nowely/agent-skills --log-failed | grep 'FAIL '` prints the release one.

**Issue text.** Two lock cases fail on CI from time to time: two concurrent runs both won the lock (`[0,0]` where one
0 and one 10 are required), and a run's release removed a peer's replacement lock. Either is a real double run or a
race in the case itself, and nothing so far says which. Until it is diagnosed, a red main cannot be read, and a
release rule that waits for a green one would stop about every second release.

## E45. At the tool's ten-minute ceiling the `codex-agent` wrapper handed back the harness notice instead of rerunning, and its exit killed the driver

**Evidence, level 3 for the wrapper's steps, level 2 for the kill.**

- `plugins/entrust/agents/codex-agent.md:13-15` (at `01d1158`): with no `REPORT=` line, "run the very same command
  again at once … Do not open, tail or wait on the output file".
- 2026-09-26, session `97a19b68`, agent D1 (Astra), wrapper transcript
  `~/.claude/projects/-Users-ruliny-Git-agent-skills/97a19b68-24e5-4b0a-ae89-8670eef7d23a/subagents/agent-a299e6bb74c8b457c.jsonl`:
  at 15:38:35Z the Bash result was "Command did not complete within its 600s timeout and was moved to the
  background"; the wrapper wrote "I'm waiting for the background task to complete", ran `cat` on the output file,
  and at 15:38:58Z called SubagentHandback with the notice as its lines. It never reran the command.
- The launcher forwards SIGTERM to its driver (`plugins/entrust/skills/codex/scripts/agent-run.mjs:145`). The
  driver's stderr ends "interrupted by SIGTERM"; `out.json` was written at 15:39:01Z and the `exit` marker at
  15:39:02Z, seconds after the wrapper ended. The report: exit 1, `turnStatus: interrupted`, no answer,
  1,824,779 tokens spent.

**Check.** `jq -r 'select(.type=="assistant") | .message.content[]? | select(.type=="tool_use") | .name' <that
transcript>` prints `Bash`, `Bash`, `SubagentHandback`: one run of the command, one `cat`, the hand-back.

**Issue text.** The wrapper's rerun at the ceiling is an instruction to a small model, and on 2026-09-26 the model
did not follow it: it narrated, read the output file, and handed back the "moved to the background" notice with no
`REPORT=` line. Ending its turn ended the backgrounded launcher, whose SIGTERM reached the driver, so a ten-minute
Astra turn was lost with its tokens. Measured on 2026-09-17 the same step held three runs of three; it is not
reliable. A turn that reaches the ceiling should survive the wrapper that started it, or the rerun should not
depend on the model's compliance.
