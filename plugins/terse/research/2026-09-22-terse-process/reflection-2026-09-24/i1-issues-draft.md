
## E15. `rewrite` keeps its candidate outside the repository, and no page says where the candidate stands when it is re-audited

**Evidence, level 2.** `plugins/terse/skills/audit/references/measure.md:35-37` (at d7a1f37) says a reader opens “the `.md` files in the repository”, starts “at the entry file” and follows “links it finds in the text”; `plugins/terse/skills/audit/references/measure.md:49-50` says “You may open only .md files in <REPO>”; and `plugins/terse/skills/audit/references/measure.md:106-109` says a re-measurement uses the same questions, key, entry file and model. `plugins/terse/skills/rewrite/SKILL.md:76-78` writes every round into “a run directory of the document's own, outside the repository that holds it”, and `plugins/terse/skills/rewrite/SKILL.md:221-230` hands the round over and applies it only on the user's word. `plugins/terse/skills/rewrite/references/bake-off.md:138-139` breaks a tie “by re-auditing each surviving candidate”. A candidate in the run directory is neither the entry file nor one of the repository's `.md` files, and none of those pages says where it stands for that re-audit. The former README pipeline citation is excluded because that page changed; the three surviving pages still make the gap.

**Check.** From any directory:

    sed -n '35,37p;49p;106,109p' /Users/ruliny/Git/agent-skills/plugins/terse/skills/audit/references/measure.md; sed -n '66,67p;190,192p' /Users/ruliny/Git/agent-skills/plugins/terse/skills/rewrite/SKILL.md; sed -n '138,139p' /Users/ruliny/Git/agent-skills/plugins/terse/skills/rewrite/references/bake-off.md; echo "pages saying where a candidate stands for its re-audit: $(grep -rl -i -E 'temporary candidate|copy of (the|its) (markdown )?tree|relative (link|location)|links? (still )?resolve' /Users/ruliny/Git/agent-skills/plugins/terse/skills | wc -l | tr -d ' ')"

On HEAD it exited 0, printed the reader and re-audit rules, printed unrelated text at the moved `rewrite` ranges, printed the bake-off rule, and ended `pages saying where a candidate stands for its re-audit: 0`; the moved `rewrite` evidence is at lines 76-78 and 221-230 above.

**Issue text.** `rewrite` keeps every candidate outside the user's repository and applies it only on their word. `audit` re-measures with the same entry file and lets its readers open only the repository's `.md` files. Between the two, no page says how a candidate is re-audited before it is applied: where it must stand, and what keeps its relative links pointing where the original's did. `bake-off.md` calls for one to break a tie. A user who re-audits the candidate where `rewrite` leaves it gives the readers a file outside the repository, with relative links that resolve against the run directory. The pages should say where a candidate stands for its re-audit (for example, at the original's path in a copy of the repository's Markdown tree), and `rewrite`'s hand-over should say so next to the diff.

_From research/2026-09-22-terse-process/rewrite-2026-09-22/run/code-defects.md, D1._

## E16. A retired phrase is matched case-sensitively, because `ledger.mjs` reads a `flags` field that no script writes

**Evidence, level 3.** `plugins/terse/skills/rewrite/scripts/ledger.mjs:3-4` (at d7a1f37) documents an optional `"flags": "i"` per entry, and `plugins/terse/skills/rewrite/scripts/ledger.mjs:18-20` builds each pattern as `new RegExp(pattern, flags ?? "")`. The two scripts that write ledger entries never set it: `plugins/terse/skills/rewrite/scripts/round.mjs:149-156` writes a retirement with no flags, and `plugins/terse/skills/audit/scripts/ledger-seed.mjs:61-62` writes `{ name, pattern, want, level, how }`. Every retired phrase in a ledger those scripts built is therefore matched with its case as written. `plugins/terse/skills/rewrite/references/measurements.md:44-46` records the miss once already: a retired phrase “survived in a table cell with a capital letter; the ledger's pattern did not match”.

**Check.** From any directory:

    sh /var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T//terse/runs/20260922-233021-terse-readme/probe-03/d-probes.sh

On HEAD it exited 0 and printed `D2 retired phrase with a capital: ledger.mjs exit 0; retired row: retired L? - - -`, `D2 retired phrase in lower case: ledger.mjs exit 1; retired row: retired L? - - YES`, and `D2 scripts that write a flags field: 0 of 2`.

**Issue text.** `ledger.mjs` supports a `flags` field on a ledger entry, but neither `round.mjs` nor `ledger-seed.mjs` writes one, so every retired phrase is matched case-sensitively. A round that brings a retired wording back with a capital letter — the first word of a sentence, a table cell — passes the ratchet with exit 0, the miss M8 already records. Retirements should be matched without regard to case (`round.mjs` and `ledger-seed.mjs` writing `flags: "i"` on `want: false` entries, or `ledger.mjs` defaulting them to it), and `selftest.mjs` should plant a capitalised revival.

_From research/2026-09-22-terse-process/rewrite-2026-09-22/run/code-defects.md, D2._

## E17. An audit whose claim ledger is honestly empty cannot be seeded, so its document has no audit route into `rewrite`

**Evidence, level 3.** `plugins/terse/skills/audit/scripts/ledger-seed.mjs:41-42` (at d7a1f37) refuses a `## Claim ledger` with no `### C..` entries: “no ### C.. entries under ## Claim ledger”, exit 1, and no ledger is written. `plugins/terse/skills/audit/references/truth-pass.md:61-71` keeps the argument for an instruction, voice, tone and ordering, illustrative examples and recipes for tools the repository does not ship out of the ledger, and `plugins/terse/skills/audit/SKILL.md:23-27` audits text with no code behind it; a document made only of such sentences has a claim ledger with no entries, truthfully. `plugins/terse/skills/rewrite/SKILL.md:115-118` seeds `ledger.json` from the audit on the audit route and starts it empty only when there is no audit, while `plugins/terse/skills/audit/SKILL.md:155-164` requires the seed command.

**Check.** The same command as D2 was run exactly:

    sh /var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T//terse/runs/20260922-233021-terse-readme/probe-03/d-probes.sh

On HEAD it exited 0 and printed `D3 empty claim ledger: ledger-seed.mjs exit 1: <probe>/d3/audit.md: no ### C.. entries under ## Claim ledger` and `D3 ledger.json written: no`.

**Issue text.** An audit whose truth pass finds no sentence that states a behaviour — a document made only of what `truth-pass.md` keeps out of the ledger, which the plugin's stated scope invites — cannot be handed to `rewrite`. `ledger-seed.mjs` refuses a Claim ledger with no entries and writes nothing; `rewrite` seeds its ledger from the audit on that route and starts empty only from a skeleton. Either the seed should accept a ledger that is empty and says so, writing `[]`, or `rewrite`'s audit route should say how to start without a seed.

_From research/2026-09-22-terse-process/rewrite-2026-09-22/run/code-defects.md, D3._

## E18. `rule1.mjs` does not report a bare environment-variable name or the braced `${VAR:-default}` form

**Evidence, level 3.** `plugins/terse/skills/rewrite/scripts/rule1.mjs:28` (at d7a1f37), the environment-variable pattern, is `/\$[A-Z_]{2,}|(?<![\w$])[A-Z][A-Z0-9]*_[A-Z0-9_]+(?![\w])/g`: it matches `$TMPDIR` and a name with an underscore, and neither a bare name without one (`PATH`) nor the braced form `${TMPDIR:-/tmp}`. `plugins/terse/skills/rewrite/scripts/selftest.mjs:11-13` plants only a flag and a tilde path.

**Check.** The same command as D2 was run exactly:

    sh /var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T//terse/runs/20260922-233021-terse-readme/probe-03/d-probes.sh

On HEAD it exited 0 and printed `D4 rule1 on planted lines 1-4: exit 1; reported: ! line 3 env var $TMPDIR;! line 4 flag name --keep-data;`, omitting planted `PATH` and `${TMPDIR:-/tmp}` lines 1 and 2.

**Issue text.** Rule 1 keeps environment variables out of the sections a reader meets first, and `rule1.mjs` checks it with a pattern that needs either `$NAME` or an underscore in the name. A bare `PATH`, `HOME` or `EDITOR` and the braced `${TMPDIR:-/tmp}` pass unreported, and the self-test plants neither, so a clean result on those forms is not evidence. The pattern should cover `${…}` and a backticked bare upper-case name, and `selftest.mjs` should plant both.

_From research/2026-09-22-terse-process/rewrite-2026-09-22/run/code-defects.md, D4._

## E19. A checkout loaded with `claude --plugin-dir` puts its runs in a data directory the pages do not name, and `claude plugin uninstall` cannot remove it

**Evidence, level 3.** `plugins/terse/skills/audit/SKILL.md:36-42` (at d7a1f37) says `D` is empty for a source checkout and gives only an installed-plugin data directory and a temporary-directory fallback. `plugins/terse/skills/rewrite/SKILL.md:76-87` uses the same formula and gives the same two lifetime cases. A checkout loaded with `claude --plugin-dir plugins/terse` is neither: Claude Code loads it as `terse@inline`, writes a configuration-local `plugins/data/terse-inline` into the line, and `claude plugin uninstall terse@inline` refuses it because it has no marketplace backing.

**Check.** From any directory:

    sh /var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T//terse/runs/20260922-233021-terse-readme/probe-03/plugindir-probe.sh; sed -n '36,42p' /Users/ruliny/Git/agent-skills/plugins/terse/skills/audit/SKILL.md; sed -n '74,77p' /Users/ruliny/Git/agent-skills/plugins/terse/skills/rewrite/SKILL.md

On HEAD it exited 0 under a freshly reset signed-out profile, printed `"source":"terse@inline"`, `D="<probe>/config-pdir/plugins/data/terse-inline"`, `data directory terse-inline: exists; temporary directory runs: absent`, uninstall exit 1 with “it cannot be uninstalled”, and `stub run after that uninstall: present`; the moved `rewrite` lifetime lines are now 76-87.

**Issue text.** `audit` and `rewrite` tell the agent where a run lives and how long it lasts in two cases: an installed plugin, whose data directory `claude plugin uninstall` deletes unless `--keep-data`, and a source checkout, whose data directory is empty so the run falls back to the temporary directory. A checkout loaded with `claude --plugin-dir` is a third case the pages call the second: Claude Code writes `plugins/data/terse-inline` under its configuration directory into the run line, the run lands there, and `claude plugin uninstall` refuses that plugin, so the run outlives the session and no command the pages name removes it. The pages should state the rule by what the line does — the data directory when Claude Code supplies one, the temporary directory otherwise — and say that a `--plugin-dir` run is the user's to remove.

_From research/2026-09-22-terse-process/rewrite-2026-09-22/run/code-defects.md, D5._

## E20. `audit`'s task readers are told to act and have their state checked, and nothing tells them where that state lives

**Evidence, level 2.** `plugins/terse/skills/audit/SKILL.md:109-118` (at d7a1f37) sends two readers with “a starting state and an outcome they want, acting from the documentation alone” and says “Check the state they produce, not what they say”; it names no place for that state and no isolated configuration for a host application's commands. `plugins/terse/skills/rewrite/references/critic-briefs.md:146-152` gives the same kind of reader both: “create it under $TMPDIR”, an isolated configuration there for a host-application task, and “Write nothing outside $TMPDIR.”

**Check.** From any directory:

    sed -n '107,116p' /Users/ruliny/Git/agent-skills/plugins/terse/skills/audit/SKILL.md | grep -c -E 'TMPDIR|isolated|CONFIG_DIR'; sed -n '141,142p;147p' /Users/ruliny/Git/agent-skills/plugins/terse/skills/rewrite/references/critic-briefs.md

On HEAD it exited 0, printed `0`, and then only a fragment because the critic brief moved from the stale ranges; the complete still-surviving comparison is at `plugins/terse/skills/rewrite/references/critic-briefs.md:146-152`.

**Issue text.** `audit`'s step 5b sends two task readers to act from the documentation and checks the state they produce, but does not say where that state lives: no `$TMPDIR`, no isolated host configuration. `rewrite`'s lens-4 brief, the same kind of reader, requires both. A task reader of a document that installs a plugin, edits a configuration or runs a recipe that resets a tree acts on the user's real machine. Step 5b should carry lens 4's isolation: the starting state under `$TMPDIR`, a host application's commands in an isolated configuration there, and nothing written outside it.

_From research/2026-09-22-terse-process/rewrite-2026-09-22/run/code-defects.md, D6._

## E21. The pages give a run's lifetime as deleted by `claude plugin uninstall` unless `--keep-data`, and it is not

**Evidence, level 3.** `plugins/terse/skills/audit/SKILL.md:39-42` (at d7a1f37) and `plugins/terse/skills/rewrite/SKILL.md:84-87` state that a run under the plugin data directory survives updates and is deleted by `claude plugin uninstall` unless `--keep-data`. Neither page names scope, the last installation, or `claude plugin marketplace remove`. In fresh signed-out Claude configurations, uninstalling one of two installations kept the data and run until the last installation was removed, while `claude plugin marketplace remove nowely` deleted them and offered no `--keep-data` option.

**Check.** From any directory:

    sh /var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T//terse/runs/20260922-233021-terse-readme/probe-04/lifetime-probe.sh; sed -n '39,42p' /Users/ruliny/Git/agent-skills/plugins/terse/skills/audit/SKILL.md; sed -n '74,77p' /Users/ruliny/Git/agent-skills/plugins/terse/skills/rewrite/SKILL.md; echo "page lines naming marketplace remove, a scope or the last installation: $(cat /Users/ruliny/Git/agent-skills/plugins/terse/skills/audit/SKILL.md /Users/ruliny/Git/agent-skills/plugins/terse/skills/rewrite/SKILL.md | grep -c -E 'marketplace remove|last (installation|scope)|--scope')"

On HEAD it exited 0 and printed all four expected states: A absent after uninstall, B present after `--keep-data`, C present after uninstalling one scope then absent after the last, D absent after marketplace removal, plus `marketplace remove options: --help --scope` and the final page count `0`; the moved `rewrite` lifetime text is at lines 84-87.

**Issue text.** `audit` and `rewrite` tell the agent that a run under the plugin's data directory is deleted by `claude plugin uninstall` unless `--keep-data` is passed, and the agent passes that on as the run's lifetime. Measured on Claude Code 2.1.280, it is wrong in two directions. With the plugin installed at two scopes, uninstalling one keeps the data directory and its runs; they go only when the last installation is removed. And `claude plugin marketplace remove` deletes them as well, with no `--keep-data` to stop it. A user who removes the marketplace to tidy up loses every run without being warned, and a user who reads “uninstall deletes it” while a second installation remains expects a deletion that does not happen. Both pages should say that the runs are deleted when the plugin's last installation is removed, by `claude plugin uninstall` without `--keep-data` or by `claude plugin marketplace remove`, which has no such option.

_From research/2026-09-22-terse-process/rewrite-2026-09-22/run/code-defects.md, D7._

## E22. The bake-off vetoes any weakened warning while the accuracy floor requires a false one to be corrected or weakened

**Evidence, level 2.** `plugins/terse/skills/rewrite/references/bake-off.md:108-114` (at d7a1f37) makes “was a condition, limit or warning at a decision point cut or weakened?” a veto with no exception for a false warning. The writer brief says “Correct what the current file gets wrong rather than carrying it forward” at `plugins/terse/skills/rewrite/references/bake-off.md:60-63`, the accuracy floor is at `plugins/terse/skills/rewrite/SKILL.md:54-57`, and `plugins/terse/skills/audit/references/truth-pass.md:23-25` gives a guarantee-shaped claim only two options: reach level 3 or be weakened. `plugins/terse/skills/rewrite/references/writing-rules.md:21-23` also says never cut a condition, limit or warning at a decision point. No page excepts a false or refuted one. The former evidence about a precedence sentence is excluded because that sentence changed; the direct conflict among the surviving pages remains.

**Check.** From any directory:

    sed -n '60,62p;108,109p;114p' /Users/ruliny/Git/agent-skills/plugins/terse/skills/rewrite/references/bake-off.md; sed -n '23,25p' /Users/ruliny/Git/agent-skills/plugins/terse/skills/audit/references/truth-pass.md; sed -n '21p' /Users/ruliny/Git/agent-skills/plugins/terse/skills/rewrite/references/writing-rules.md; sed -n '44,47p;212,215p' /Users/ruliny/Git/agent-skills/plugins/terse/skills/rewrite/SKILL.md; echo "page lines on a false or refuted condition, limit or warning: $(grep -rh -i -E '(false|refuted|wrong) (condition|limit|warning)|(condition|limit|warning)[^.]{0,40}(is|are|was) (false|refuted|wrong)' /Users/ruliny/Git/agent-skills/plugins/terse/skills | wc -l | tr -d ' ')"

On HEAD it exited 0, printed the surviving accuracy, veto, guarantee and safeguard lines, printed unrelated text at the moved `rewrite` ranges, and ended `page lines on a false or refuted condition, limit or warning: 0`.

**Issue text.** The bake-off's judging sheet vetoes any candidate that cuts or weakens a condition, limit or warning at a decision point, and nothing excepts one that is false. The writer brief beside it tells the writer to correct what the current file gets wrong, and the truth pass leaves a guarantee-shaped claim that cannot reach level 3 no option but to be weakened. A false warning at a decision point is caught between them: correcting it fails a veto row, keeping it fails the accuracy floor. The veto row should except a warning the claim ledger holds as refuted, and say that correcting it to what the evidence supports is not weakening it.

_From research/2026-09-22-terse-process/rewrite-2026-09-22/run/code-defects.md, D8._

## E23. A pinned claim's evidence is run once, when its round is written, and never again

**Evidence, level 3.** `plugins/terse/skills/rewrite/scripts/round.mjs:120-132` (at d7a1f37) executes every edit's `check.run`, refuses the round when an `expect` finds nothing, and keeps the output as `saw`; `plugins/terse/skills/rewrite/scripts/round.mjs:149-155` stores `run`, `expect` and `saw` in the ledger. `plugins/terse/skills/rewrite/scripts/ledger.mjs:18-24` reads only `pattern` and `want` of every entry against the round files and never executes `run`. `plugins/terse/skills/rewrite/SKILL.md:122-129` recommends line-based `sed -n 'A,Bp' <file>` checks, so a pin can stay green after its evidence citation moves.

**Check.** From any directory:

    node /var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T//terse/runs/20260922-233021-terse-readme/probe-04/rot-check.mjs

On HEAD it exited 0 and printed `R02e as written in round 02, run today: expect matches: false` followed by `ledger.mjs over the ledger that holds that entry, rounds 00-03: exit 0 | 0 failure(s)`.

**Issue text.** `round.mjs` runs a claim's check once, when the round that declares it is written, and `ledger.mjs` afterwards checks only that the pinned sentence is still present. The evidence behind a pin can therefore stop resolving — the cited file edited, its lines shifted by a commit above them — and nothing reports it: the pin stays green while its `saw` describes a file that no longer says that at those lines. The page's own advice to cite by `sed -n 'A,Bp'` makes this the common case. `ledger.mjs`, or `round.mjs` at every round, should re-run every pinned entry's `run` and report the entries whose `expect` no longer matches, as a report before it is a gate; and the page should prefer anchors that survive a line shift — a heading, a phrase — over line numbers wherever the cited file is one that changes.

_From research/2026-09-22-terse-process/rewrite-2026-09-22/run/code-defects.md, D9._

## E24. The hand-over gives every round's diff against `00-original.md`, and the skeleton route has no original

**Evidence, level 2.** `plugins/terse/skills/rewrite/SKILL.md:221-223` (at d7a1f37) hands over “`diff-NN.patch`, the diff against `00-original.md`” with no route distinction, and `plugins/terse/skills/rewrite/SKILL.md:22-29`, which names the routes, says nothing of an original on the skeleton route, where the document may be written for the first time. The original check's hard-coded line range moved, but the quoted hand-over survives unchanged at its new lines.

**Check.** From any directory:

    sh /var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T//terse/runs/20260922-233021-terse-readme/probe-04/d10-d13-check.sh

On HEAD it exited 0; its stale D10 range printed two unrelated critic-table lines, while its route count still printed `D10 rethink route named at rewrite/SKILL.md:16-21, 'original' mentions there: 0`; `sed -n '221,223p'` re-derived the surviving hand-over quote.

**Issue text.** `rewrite`'s hand-over names one artefact for every run, the diff against `00-original.md`, and one of its routes has no original: a document written from a skeleton `rethink` agreed. The page should say what the hand-over is on that route — the round file alone, or a diff against the skeleton — and what `00-original.md` holds there, if anything.

_From research/2026-09-22-terse-process/rewrite-2026-09-22/run/code-defects.md, D10._

## E25. `sections.mjs` drops a renamed section from its over-budget count and says nothing when a budgeted section disappears

**Evidence, level 3.** `plugins/terse/skills/rewrite/scripts/sections.mjs:19-24` (at d7a1f37) reports each heading it finds against `budgets.json` and counts over-budget sections only among those rows; a heading absent from the budget is printed as “(no budget)” and leaves the count, and a budgeted heading absent from the document is never mentioned.

**Check.** The same command as D10 was run exactly:

    sh /var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T//terse/runs/20260922-233021-terse-readme/probe-04/d10-d13-check.sh

On HEAD it exited 0 and printed `D11 sections.mjs on a copy whose Install heading is renamed: 119 Installing (no budget); 1140 TOTAL, 3 section(s) over budget;` and `D11 sections.mjs on a copy without the Licence section, lines naming Licence or a missing section: 0`.

**Issue text.** `sections.mjs` is the report that shows a section swelling round by round. It loses a section from the over-budget count the moment its heading changes, and it is silent when a budgeted section is gone. It should print every budgeted heading the document lacks, and count a “(no budget)” heading as a section the writer must map or the coordinator must budget, so that a rename cannot hide growth.

_From research/2026-09-22-terse-process/rewrite-2026-09-22/run/code-defects.md, D11._

## E26. `sections.mjs` counts space-separated words, so its budgets and growth mean nothing for text without spaces

**Evidence, level 3.** `plugins/terse/skills/rewrite/scripts/sections.mjs:13` (at d7a1f37) counts words as `buf.join(" ").split(/\s+/).filter(Boolean).length`. A Chinese sentence of twenty-six characters with no spaces counts as one word, so a section written in such a script is never measured by the intended unit.

**Check.** The same command as D10 was run exactly:

    sh /var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T//terse/runs/20260922-233021-terse-readme/probe-04/d10-d13-check.sh

On HEAD it exited 0 and printed `D12 sections.mjs on a Chinese sentence with no spaces: 1 介绍 (no budget)` and the whitespace-splitting implementation at `plugins/terse/skills/rewrite/scripts/sections.mjs:13`.

**Issue text.** The plugin says its scope is Markdown in any language, and its budget report counts words by splitting on whitespace, which counts a sentence in Chinese, Japanese or Thai as one word. `sections.mjs` should count by a unit that exists in every script — characters, or graphemes by `Intl.Segmenter` — or the pages should say the budgets are measured in space-separated words and hold for such languages only.

_From research/2026-09-22-terse-process/rewrite-2026-09-22/run/code-defects.md, D12._

## E27. `rewrite` does not say whether an audit run from one commit is valid input under another commit

**Evidence, level 2.** `plugins/terse/skills/rewrite/SKILL.md:35-39` (at d7a1f37) accepts an audit run directory and reads `audit.md`, but no line of the page says whether a run made under one commit of the plugin is valid input to `rewrite` under another. The original proposal's second concern is excluded: `plugins/terse/skills/rewrite/SKILL.md:225-230` now says the agent records the read and, on the user's word, replaces the repository document byte for byte; commit `d7a1f37` added those lines.

**Check.** The same command as D10 was run exactly:

    sh /var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T//terse/runs/20260922-233021-terse-readme/probe-04/d10-d13-check.sh

On HEAD it exited 0 and printed `D13 rewrite/SKILL.md lines on whether an audit run from another commit is valid input: 0`; its other line still found the old stop sentence, but the new post-word action at lines 225-230 fixes and excludes that half.

**Issue text.** A reader planning the audit-to-candidate path does not know whether the audit run they already have is usable when the plugin they run `rewrite` with is not the commit that made it. Step 1 should say what a run from another commit is worth: accepted, re-seeded, or refused.

_From research/2026-09-22-terse-process/rewrite-2026-09-22/run/code-defects.md, D13._

## E28. No audit step writes the user's shape verdict into the run file after the report, though `rewrite` reads it there

**Evidence, level 2.** `plugins/terse/skills/audit/SKILL.md:155-174` (at d7a1f37) writes `audit.md`, then reports the score, path and shape verdict; `shape: agreed` depends on the user's word, but no later step writes that later word back. `plugins/terse/skills/audit/references/ledgers.md:29-32` places the verdict under *Score*. `plugins/terse/skills/rewrite/SKILL.md:14-20` reads the verdict from `audit`, and `plugins/terse/skills/rewrite/SKILL.md:35-39` reads *Score* from `audit.md`.

**Check.** From any directory:

    sed -n '155,174p' /Users/ruliny/Git/agent-skills/plugins/terse/skills/audit/SKILL.md; sed -n '14,20p;37,38p' /Users/ruliny/Git/agent-skills/plugins/terse/skills/rewrite/SKILL.md; grep -n -i -E 'write.*(verdict|shape).*(Score|audit\.md)|Score.*(verdict|shape)' /Users/ruliny/Git/agent-skills/plugins/terse/skills/audit/SKILL.md

On HEAD it exited 1 after printing the write/report and rewrite-read passages; the final grep printed no step that writes the user's later word back.

**Issue text.** `audit` reports its shape verdict after writing the run file, and the user's word — the only thing that makes it `agreed` — comes after the report. No step writes that word into `audit.md`'s *Score*, where `ledgers.md` places the verdict and where `rewrite` reads it. `rewrite` also accepts the user's quoted words for `rounds.md`, so two sources exist and neither page says which governs when they differ. The audit page should say that the user's word is written into *Score* when it is given, with the words quoted, and `rewrite` should read that one place.

_From research/2026-09-22-terse-process/rewrite-2026-09-24/run/code-defects.md, D14._

## E29. A re-audit “with the same questions” is required by `measure.md` and no audit step takes an earlier run as input

**Evidence, level 2.** `plugins/terse/skills/audit/references/measure.md:106-109` (at d7a1f37) requires the same questions, key, entry file and model. `plugins/terse/skills/audit/SKILL.md:23-34` makes a new run directory and `plugins/terse/skills/audit/SKILL.md:71-77` writes questions and the key without reading an earlier run. The only “same questions” line on the audit page is the no-document baseline at `plugins/terse/skills/audit/SKILL.md:96-102`, not a previous audit input.

**Check.** From any directory:

    grep -n -i -E 'previous run|earlier run|same questions' /Users/ruliny/Git/agent-skills/plugins/terse/skills/audit/SKILL.md; sed -n '106,109p' /Users/ruliny/Git/agent-skills/plugins/terse/skills/audit/references/measure.md

On HEAD it exited 0; grep printed only line 96's baseline-arm “same questions”, no “previous run” or “earlier run”, and sed printed the re-measurement rule.

**Issue text.** `measure.md` requires a re-audit to reuse the questions, the key, the entry file and the model of the first audit, and the audit page has no step that takes a first audit's run as input: step 1 makes a fresh run directory and step 4 writes fresh questions from the profile. A user who audits again after a rewrite gets a new measurement, not a comparison, unless they carry the questions over by hand. Step 1 should accept a previous run directory and steps 4 and 5 should reuse its questions, key and baseline when one is given.

_From research/2026-09-22-terse-process/rewrite-2026-09-24/run/code-defects.md, D15._

## E30. `rule1.mjs` misses a one-dash flag, a header field inside a code span and “status 127”, and flags a document name before a colon

**Evidence, level 3.** `plugins/terse/skills/rewrite/scripts/rule1.mjs:27` (at d7a1f37) matches flags with two dashes only; `plugins/terse/skills/rewrite/scripts/rule1.mjs:31` excludes a header field preceded by a backtick even though `plugins/terse/skills/rewrite/scripts/rule1.mjs:9-10` says fences are not skipped; `plugins/terse/skills/rewrite/scripts/rule1.mjs:29` needs “exit” before a code; and the line-31 pattern reports `README:` as a header field.

**Check.** From any directory, with `S=/Users/ruliny/Git/agent-skills/plugins/terse/skills/rewrite/scripts`:

    T=$(mktemp -d); printf '# t\n\nRun it with -p and read `X-Api-Key:` in the header; on failure it ends with status 127, as README: says.\n\n## How it works\n\nmechanism\n' > "$T/plant.md"; node "$S/rule1.mjs" "$T/plant.md" --cut "How it works"; echo "exit $?"

On HEAD it exited 0 as a compound check and printed only `! line 3  header field   README:`, `1 violation(s), 0 excused`, and `exit 1`, missing the other three planted forms.

**Issue text.** Rule 1 keeps mechanism out of the sections a reader meets first, and `rule1.mjs` checks it with patterns that need a double-dash flag, a header field outside a code span and the word “exit” before a code, while it reports a document name followed by a colon as a header field. A section that says `-p`, names a header in backticks or writes “status 127” passes; a sentence that says “as README: shows” fails. The patterns should cover the one-dash flag, the code-span field and “status <code>”, and a capitalised word before a colon should count as a header field only when it looks like one (a hyphenated or lower-case name), with the self-test planting all four.

_From research/2026-09-22-terse-process/rewrite-2026-09-24/run/code-defects.md, D16._

## E31. `dup.mjs` never compares a concept with the section its name gives, so a concept outside its home passes short of three

**Evidence, level 3.** `plugins/terse/skills/rewrite/scripts/dup.mjs:2-6` (at d7a1f37) says it counts the sections a concept matches and flags only three or more; `plugins/terse/skills/rewrite/scripts/dup.mjs:17-25` implements that threshold without interpreting the home carried in a concept's name. A concept named “a fix is not undone — How it works” that also matches the opening therefore prints two sections and zero flagged concepts.

**Check.** From any directory, with `S=/Users/ruliny/Git/agent-skills/plugins/terse/skills/rewrite/scripts` and `R=/Users/ruliny/Git/agent-skills/research/2026-09-22-terse-process/rewrite-2026-09-24/run`:

    node "$S/dup.mjs" "$R/02-grafts.md" "$R/concepts.01.json"

On HEAD it exited 0 and printed `2   a fix is not undone — How it works (opening) | How it works` and `0 concept(s) in three or more sections`.

**Issue text.** The skeleton names a home for every concept (“one idea, one home”), and `dup.mjs` reports only a concept found in three or more sections: a concept that appears in its home and one other section passes, which is the duplication the rule forbids. Where a concept's name carries its home section, the script should report any match outside it; where it does not, the threshold should be two.

_From research/2026-09-22-terse-process/rewrite-2026-09-24/run/code-defects.md, D17._

## E32. `rewrite`'s adversarial read runs before the page's announce-and-wait, one agent the user never sized

**Evidence, level 2.** `plugins/terse/skills/rewrite/SKILL.md:64-68` (at d7a1f37) says the first thing that runs is the adversarial whole-document read, with the right to run code. `plugins/terse/skills/rewrite/SKILL.md:70-72` announces and waits only after that paragraph, and names the writers and judges rather than that reader.

**Check.** From any directory:

    sed -n '64,72p' /Users/ruliny/Git/agent-skills/plugins/terse/skills/rewrite/SKILL.md

On HEAD it exited 0 and printed the adversarial read as “the first thing that runs”, followed two paragraphs later by `Announce before spawning: the count, the models`.

**Issue text.** `rewrite` starts its adversarial reader — one agent with the right to run the code — before it announces anything, and its announce-and-wait names only the writers and the judges. Every other agent the three skills start is announced first. Step 3 should announce the adversarial reader with the bake-off, in one announcement, and wait once; a README that says the skills announce their agents and wait is then true of every agent.

_From research/2026-09-22-terse-process/rewrite-2026-09-24/run/code-defects.md, D18._

## E33. Only pinned sentences are protected by the ratchet, the ledger starts empty without an audit, and no step pins a bake-off winner's sentences

**Evidence, level 2.** `plugins/terse/skills/rewrite/scripts/ledger.mjs:17-25` (at d7a1f37) checks only entries of `ledger.json`; `plugins/terse/skills/audit/scripts/ledger-seed.mjs:60-62` writes the audit's confirmed and refuted sentences; `plugins/terse/skills/rewrite/scripts/round.mjs:144-158` adds what an edit declares; and `plugins/terse/skills/rewrite/SKILL.md:115-118` starts empty where there is no audit. No step in `plugins/terse/skills/rewrite/references/bake-off.md:134-142` pins the winner's behaviour sentences.

**Check.** From any directory, with `S=/Users/ruliny/Git/agent-skills/plugins/terse/skills/rewrite/scripts`:

    sed -n '17,25p' "$S/ledger.mjs"; sed -n '117,118p' /Users/ruliny/Git/agent-skills/plugins/terse/skills/rewrite/SKILL.md; grep -n -i -E 'pin|ledger' /Users/ruliny/Git/agent-skills/plugins/terse/skills/rewrite/references/bake-off.md | head

On HEAD it exited 0, printed the loop over ledger entries and `With no audit it starts empty`; the final grep printed only false substring matches in “opinion” and no bake-off pinning step.

**Issue text.** The README's guard sentence — a round that silently loses a sentence checked true is refused — is true of the sentences the ledger holds, and on the skeleton route those are the audit's original wording, most of which a new shape cannot keep, plus whatever later edits declare; the bake-off winner's sentences, the first text a reader will see, are pinned by no step. Step 3 should end with a pinning pass over the winner — every behaviour sentence declared as a claim with its check, by the same schema as `edits/NN.json` — so that round 02 starts under a ledger that guards the text it edits.

_From research/2026-09-22-terse-process/rewrite-2026-09-24/run/code-defects.md, D19._

## E34. `round.mjs`'s qualification signal is an English word list, so the same clause in another language is written without a reason

**Evidence, level 3.** `plugins/terse/skills/rewrite/scripts/round.mjs:92-101` (at d7a1f37) detects qualifying forms with an English-only regular expression (`unless`, `except when`, `only if`, and kin). The Russian clause «если только вы не передадите --prune» adds no matching form and is written with exit 0.

**Check.** From any directory, with `S=/Users/ruliny/Git/agent-skills/plugins/terse/skills/rewrite/scripts`:

    T=$(mktemp -d); printf 'The tool keeps runs.\n' > "$T/00.md"; printf '[{"name":"ru","old":"The tool keeps runs.","new":"The tool keeps runs, если только вы не передадите --prune.","claims":[{"name":"k","pattern":"keeps runs","asks":"runs are kept"}],"check":{"level":1,"run":"echo x","expect":"x"}}]' > "$T/e.json"; echo "[]" > "$T/l.json"; node "$S/round.mjs" "$T/00.md" "$T/01.md" "$T/e.json" --ledger "$T/l.json"; echo "exit $?"

On HEAD it exited 0 and printed `ran  ru`, `ok  ru`, the ledger write, and `exit 0`.

**Issue text.** `round.mjs` refuses an edit that adds a qualifying clause without a reason, and recognises the clause by an English word list, so a caveat written in any other language passes unseen. The list should carry the common forms of the languages the plugin claims, or the check should be handed to the verifier's fifth duty with the script marking every edit whose `new` grew a subordinate clause, in any language, by structure rather than by words.

_From research/2026-09-22-terse-process/rewrite-2026-09-24/run/code-defects.md, D20._

## E35. `rewrite`'s skeleton route never says how the skeleton reaches it

**Evidence, level 2.** `plugins/terse/skills/rewrite/SKILL.md:22-39` (at d7a1f37) sends “a skeleton the user agreed to” to step 2 and asks for an audit run directory only on the audit route; no line asks for the skeleton path or says where it is read from. `plugins/terse/skills/rethink/SKILL.md:142-150` now does say that the hand-over names the path and that `rewrite` is given it by the user, so the earlier claim that `rethink` hands it to nobody is excluded; the omission survives on the `rewrite` page itself.

**Check.** From any directory:

    sed -n '22,39p' /Users/ruliny/Git/agent-skills/plugins/terse/skills/rewrite/SKILL.md | grep -n -i -E 'skeleton' ; sed -n '22,39p' /Users/ruliny/Git/agent-skills/plugins/terse/skills/rewrite/SKILL.md | grep -c -i -E 'skeleton.{0,40}(path|directory|where)'

On HEAD it exited 1 after printing the route row and then `0` for a skeleton path, directory or location in that range.

**Issue text.** `rewrite` starts from a skeleton the user agreed to and never says how it gets it: not a path asked of the user, not the `rethink` run directory, not the audit run file's *Score* line. Step 1 should say, for the skeleton route, where the agreed skeleton is read from — the user names the file, or `rethink`'s run directory is given as `audit`'s is — and that its SHA-256 is compared with the one the agreement recorded.

_From research/2026-09-22-terse-process/rewrite-2026-09-24/run/code-defects.md, D21._

## E36. `prior-art.md` overstates its own body: “every practice marked measured, argued or asserted” and “the curated forty”

**Evidence, level 2.** `plugins/terse/references/prior-art.md:14-18` (at d7a1f37) says practices are marked measured, argued or asserted, and `plugins/terse/references/prior-art.md:299-304` calls the curated section “the curated forty”. The check counts 115 numbered entries and only 34 lines carrying one of the marks, which supports neither “every” nor “forty”.

**Check.** From any directory:

    sed -n '14,15p;302p' /Users/ruliny/Git/agent-skills/plugins/terse/references/prior-art.md; grep -c -E '^\s*[0-9]+\. \*\*' /Users/ruliny/Git/agent-skills/plugins/terse/references/prior-art.md; grep -c -i -E '\b(measured|argued|asserted)\b' /Users/ruliny/Git/agent-skills/plugins/terse/references/prior-art.md

On HEAD it exited 0 and printed the two self-descriptions followed by counts `115` and `34`.

**Issue text.** `prior-art.md` describes itself as a list in which every practice is marked measured, argued or asserted, and as a curated forty; its body carries neither: not every entry has a mark and the curated section is not forty entries. A README that repeats the page's self-description repeats the overstatement. The page should say what its body does — how many entries, how many marked, how many curated — or its body should be brought to what it says.

_From research/2026-09-22-terse-process/rewrite-2026-09-24/run/code-defects.md, D22._

## E37. `rewrite`'s step 6 returns a cut ledger that no step writes

**Evidence, level 2.** `plugins/terse/skills/rewrite/SKILL.md:232-245` (at d7a1f37) lists among what the skill returns “the cut ledger — every removed passage of twenty words or more, with its reason”. No step in `plugins/terse/skills/rewrite/SKILL.md` or `plugins/terse/skills/rewrite/references/loop.md` writes `cuts.md` or a cut ledger. The earlier evidence that step 4 stores every reason in `edits/NN.json` is excluded because the current page no longer says that; the promised but unwritten return remains.

**Check.** From any directory:

    grep -n -i 'cut ledger' /Users/ruliny/Git/agent-skills/plugins/terse/skills/rewrite/SKILL.md; grep -n -i -E 'write.*(cut ledger|cuts\.md)|cuts\.md' /Users/ruliny/Git/agent-skills/plugins/terse/skills/rewrite/SKILL.md /Users/ruliny/Git/agent-skills/plugins/terse/skills/rewrite/references/loop.md

On HEAD it exited 1: the first grep printed line 242's return promise and the second printed nothing.

**Issue text.** `rewrite` promises to return a cut ledger — every removed passage of twenty words or more with its reason — and no step produces it: the reasons live inside each round's edits file and nobody gathers them. A user reading the return list expects a file that does not exist unless the coordinator makes it by hand. Step 4 should write the cut ledger from the edits' reasons at each round, or step 6 should return the reasons where they are.

_From research/2026-09-22-terse-process/rewrite-2026-09-24/run/code-defects.md, D23._
