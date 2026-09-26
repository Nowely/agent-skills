# Critic against the code: round 02 (02-grafts.md), Opus lens 1

Document: `$TMPDIR/terse/runs/20260922-233021-terse-readme/02-grafts.md` (114 lines).
Code: `~/Git/agent-skills` at `f677303`. The plugin tree is the same as at `2f29a8f`: `git diff --quiet 2f29a8f f677303 -- plugins/terse .claude-plugin` exited 0.
Host: Claude Code 2.1.280. Every host command ran under a fresh `CLAUDE_CONFIG_DIR` in `$T` = `$TMPDIR/tmp.nWWPOlquBO`. The skill invocations ran with no sign-in, returned "Not logged in", and cost `total_cost_usd` 0. The repository was not touched: `git status --short` printed 0 lines at the end.

Independence: I did not open the run's `rounds.md`, `ledger*.json`, `edits/`, `reviews/` or `grafts.md`, and I did not open the research copy of this run. Two repo-wide greps did print single lines from `research/2026-09-22-terse-process/rewrite-2026-09-22/{run/ledger.json, run/edits/02.json, run/grafts.md, j2-astra-sheets.md, j3-fable-sheets.md}` and from `audit-2026-09-22/audit.md`; I read nothing more of those files. I did read `~/Git/agent-skills/ISSUES.md`, the repository's defects ledger.

Coverage: 62 sentences that state a behaviour, 14 findings.

## Findings

**F1. L3-4.** "`terse` is a Claude Code plugin that measures whether readers get the right answer and whether a document's claims agree with the code behind it."
- Verdict: UNDERSTATED (minor).
- What the code does: two of the three skills write. `rethink` designs the skeleton, and `rewrite` "writes it in rounds".
- Check, level 2: `sed -n '4p' plugins/terse/.claude-plugin/plugin.json`; `sed -n '3,7p' plugins/terse/skills/rewrite/SKILL.md`.

**F2. L11 and L15 against L45-46.** L11: "audit the candidate again to see whether it held up". L15: "candidate + diff → /terse:audit again". L45-46: "use the same questions, answer key, entry file, and model".
- Verdict: OVERSTATED, because it is presented as a direct step.
- What the code does: the candidate sits in the run directory, outside the repository (`rewrite/SKILL.md:66`). The audit's readers start at the entry file and may open only `.md` files in the repository (`audit/references/measure.md:49-50`, `audit/SKILL.md:89-90`).
- So the candidate is at the entry file only after it is applied, and applying needs the user's word (`rewrite/SKILL.md:191-192`). Auditing the run-directory file where it sits changes the entry file, which L45-46 itself calls a new measurement. The README names neither the apply step nor this consequence.
- Check, level 2: `sed -n '66p;191,192p' plugins/terse/skills/rewrite/SKILL.md; sed -n '49,50p' plugins/terse/skills/audit/references/measure.md`.

**F3. L37-38.** "Later rounds edit the selected candidate and check its ledger, task outcomes, and reader questions."
- Verdict: OVERSTATED (minor).
- What the code does: the ledger check is the only one every round must run (step 4, item 4). Lens 4 (tasks) and lens 5 (questions) are sized by the user, and "any of them may be zero; the least that still counts as a round is lenses 1 and 2" (`rewrite/SKILL.md:131-133`). Tasks and questions are required only at the gate before the owner reads a round (`:179-186`).
- Check, level 2: `sed -n '131,133p;179,186p' plugins/terse/skills/rewrite/SKILL.md`.

**F4. L42-43.** "The shipped check rejects a new round that loses a pinned sentence or restores wording retired as false."
- Verdict: OVERSTATED (minor).
- What the code does: a retired pattern is a case-sensitive regex. `ledger.mjs:19` reads an optional `flags` field, but neither `round.mjs:118` nor `ledger-seed.mjs:61-62` ever writes it. So the retired wording, brought back with a capital letter, passes. This is the same miss M8 records (`measurements.md:44-46`).
- Check, level 3. The stub is in `$T/ratchet`. The ledger is `[{"name":"pinned","pattern":"requires your word","want":true,"level":2},{"name":"retired","pattern":"nothing else is needed","want":false}]`, and rounds 00 and 01 both contain "requires your word". Run `node plugins/terse/skills/rewrite/scripts/ledger.mjs ledger.json 00-original.md 01-candidate.md <02>`:
  - 02 without the pin: exit 1, `LOST`.
  - 02 containing "Nothing else is needed.": exit 0.
  - 02 containing "nothing else is needed.": exit 1, `YES`.

**F5. L53.** "Before the two install commands, install Claude Code, sign in to it, and put Node 22 or newer on `PATH`."
- Verdict: OVERSTATED (minor).
- What the code does: the shell pair of install commands needs neither sign-in nor Node. Node is needed when the scripts run (audit step 6, rewrite step 4), not to install.
- Check, level 3, in `$T/cc2`. `claude auth status` printed `loggedIn: false` (exit 1). With `PATH=/usr/bin:/bin:/usr/sbin:/sbin`, `which node` exited 1. Both `claude.exe plugin marketplace add Nowely/agent-skills` and `claude.exe plugin install terse@nowely` exited 0.
- Not tested: the in-app route, which needs a running session.

**F6. L68-69.** "The outside-repository write boundary below therefore describes this checkout, not that published revision."
- Verdict: UNDERSTATED.
- What the code does: the published revision also puts the installed audit's runs somewhere else. So the uninstall lifecycle in L80-81 does not hold for what the install commands install today.
- Check, level 3 except where marked:
  - `git ls-remote https://github.com/Nowely/agent-skills.git refs/heads/main` returns `8c041b76…`, committed 2026-09-18.
  - Installed from GitHub in `$T/cc2`, the unauthenticated `/terse:audit` transcript carries `RUN="${CLAUDE_PLUGIN_DATA:-${TMPDIR:-/tmp}/terse}/runs/…"` unsubstituted, and no `plugins/data` directory is created. Claude Code 2.1.280 substitutes only the exact form: the binary contains `replace(/\$\{CLAUDE_PLUGIN_DATA\}/g,…)`.
  - Level 2: the docs (plugins-reference) say these variables "aren't present in the environment of commands Claude runs through the Bash tool". So installed audit runs land in `$TMPDIR/terse`, which uninstall does not touch.
  - The `/terse:rewrite` transcript says to work in "`research/<date>-<slug>/` at the root of the repository that holds the document". Uninstall does not touch that either.

**F7. L73-74.** "The `audit` instructions … forbid writing into the audited repository."
- Verdict: OVERSTATED.
- What the code does: `audit/SKILL.md:44` forbids it, but the audit's own reference allows storing the score there on the user's word (`measure.md:117-121`). This is ISSUES.md E12.
- Check, level 2: `sed -n '44p' plugins/terse/skills/audit/SKILL.md; sed -n '117,121p' plugins/terse/skills/audit/references/measure.md`.

**F8. L73-74 and L81-82.** L73-74: "…or under `${TMPDIR:-/tmp}/terse` from a checkout". L81-82: "From a checkout, the operating system may purge the runs in the temporary directory."
- Verdict: FALSE for a checkout loaded with `claude --plugin-dir`.
- Check, level 3. Run `env -i HOME=$T/home4 PATH=/usr/bin:/bin:/usr/sbin:/sbin TMPDIR=$T/tmp4/ CLAUDE_CONFIG_DIR=$T/cc4 claude.exe -p "/terse:audit" --plugin-dir ~/Git/agent-skills/plugins/terse --output-format stream-json --verbose` (cwd `$T/work4`, not logged in, cost 0).
  - The init event shows `"source":"terse@inline"`.
  - The skill body in the transcript reads `D="$T/cc4/plugins/data/terse-inline"`, and that directory was created.
  - `claude plugin uninstall terse@inline` exited 1: "cannot be uninstalled". A stub run placed in that directory survived.
- The TMPDIR fallback does hold in two cases:
  - When no plugin loader is involved. A copy in a project's `.claude/skills` keeps the placeholder literal (`$T/cc5` transcript: `D="${CLAUDE_PLUGIN_DATA}"`, and no `plugins/` directory is created).
  - When the page is read by hand, as this run's own directory under `…/T//terse/runs/` shows.

**F9. L80-81.** "Installed, `claude plugin uninstall` deletes the plugin data directory and the runs in it unless you pass `--keep-data`."
- Verdict: OVERSTATED.
- What the code does: the directory is deleted only when the plugin is uninstalled from the last scope where it is installed.
- Check, level 3, in `$T/cc1`, with a stub run in `plugins/data/terse-nowely`:
  - Default uninstall: the directory is gone.
  - `--keep-data`: the directory is kept.
  - Installed at both user and project scope, `uninstall --scope user` keeps the directory and its file. A following `uninstall --scope project` removes it.
- The docs agree: "deleted automatically when you uninstall the plugin from the last scope where it is installed".

**F10. L80-81, same sentence.**
- Verdict: UNDERSTATED.
- What the code does: `claude plugin marketplace remove nowely` also deletes the data directory and its runs, and it has no `--keep-data` option (its `--help` lists only `--scope`).
- Check, level 3, in `$T/cc1`: with the plugin installed and a stub run in place, `marketplace remove` exited 0, the data directory was gone, and `plugin list` was empty.

**F11. L90.** "A candidate that cuts or weakens a condition, limit, or warning where a reader decides is vetoed."
- Verdict: OVERSTATED (scope).
- What the code does: the veto is a row of the bake-off judging sheet (`bake-off.md:108-114`), and the bake-off happens once.
- Edits in later rounds face no veto. The gate counts a regression as a sentence the round introduced that critics showed false or overstated (`loop.md:52-55`, `rewrite/SKILL.md:181-182`), and a deletion is not that. `ledger.mjs` catches a cut only if the sentence was pinned.
- Check, level 2: `sed` of those ranges.

**F12. L98-99.** "…and the repository has no individual reader records for it."
- Verdict: FALSE for the first half of the experiment.
- What the repository holds: `research/2026-09-10-chain/chain-source-prompt.txt:103-132` records the six "before" readers one by one: the question, the verdict (3 correct, 2 wrong, 1 partial), the lines each one quoted, and the one departure (question 2). No record of the "after" readers exists (6/6, no departures, controls intact).
- Check, level 2: `sed -n '103,132p' research/2026-09-10-chain/chain-source-prompt.txt`. Also, `grep -rn '6/6' research/2026-09-10-chain` finds only unrelated hits in `run-2x5/`.

**F13. L107-108.** "One judge put both controls above both entries for the two published standards; the other did not."
- Verdict: FALSE (the count).
- What the record says: three of the four standards were published, not two:
  - Diataxis (`run-2x5/zP378l2j.prompt.txt:21`, diataxis.fr).
  - Vercel's technical-writing skill (`oRfBREBF.prompt.txt:21`, a GitHub URL).
  - riekelt/technical-writer (`rCYUALAd.prompt.txt:21`).
  - Only the CLAUDE.md draft "has no website" (`EKalWntb.prompt.txt:21`).
- The judge's own phrase was "both published on-axis standards" (`o8eHzS6U.answer.md:3`), meaning Diataxis and the house style.
- The verdict itself holds:
  - J2 ranks the controls P9 and P10 2nd and 3rd, above all six published entries.
  - J1 ranks P3 (Vercel) 1st, and P9 7th, below P7 (4th) and P2 (6th) (`v04PR6HL.answer.md:3`).
- Check: level 2.

**F14. L107-108, same sentence.**
- Verdict: UNDERSTATED (minor).
- What the record says: the two judges were asked different questions. J1 ranked the entrants by findings verified against the repository (`v04PR6HL.prompt.txt:33-37`). J2 ranked them on "wording, redundancy, and relevance. Not factual accuracy." (`o8eHzS6U.prompt.txt:20-24`). So "the other did not" is not a disagreement on one criterion.
- Check: level 2.

## Claims reached only at level 1

1. L4-5, "Markdown in any language": no plugin page states this scope. The owner's intent is recorded only in `ISSUES.md:113-114` ("any text in any language"). The exit-code words in `rule1.mjs` are English only (E8).
2. L81-82, "the operating system may purge the runs in the temporary directory": this is operating-system behaviour and was not run.
3. L88, "as missing framing": this is the chain's description of itself (`chain/audit.md:21-25`). The counts reached level 3.
4. L96, "Two experiments ran on 2026-09-10": supported only by directory names and page text.
5. L99-101, "6/6 after, … none after, and neither control question broken": stated only by `measure.md:125-127`, with no record behind it.
6. L105, "Models were hidden from the judges.": the judge prompts say the names were stripped, but the dossier they read (`/tmp/bakeoff/dossier.txt`) is not in the repository.

## Confirmed, with the level reached (not findings)

- **Level 3:**
  - L87-88: `wc -w` gives 2725, 2482, 2377, 2482 and 2571; the drop is 5.65%, and the second and third passes are −105 and +105.
  - L101-102: an exact McNemar test with b=3, c=0 gives p = 0.25.
  - L19: `claude plugin details terse@nowely` lists "Skills (3) audit, rethink, rewrite".
  - L63-64: both shell commands exit 0.
  - L66-68: `main` is `8c041b7`, and that revision's rewrite page works in `research/<date>-<slug>/` at the repository root and sends defects to `ISSUES.md`.
  - L73: installed from the local marketplace (`$T/cc3`), the audit body reads `D=".../plugins/data/terse-nowely"`.
  - L86, "section budgets are reports": the selftest check "sections reports a section over its budget and still exits 0" passes.
- **Level 2:**
  - L105-107: the 116-word counts (`o8eHzS6U.answer.md:10-19`: P1, P2, P4, P5 and P6 unchanged; P8 punctuation only; P3 126, P7 125, P10 137; P9 97).
  - L104-105: the 2 × 5 design (`v04PR6HL.prompt.txt:13-20`).
  - Every other sentence I checked.

## Notes (not findings)

- **Node floor.** `package.json:4-6` declares `>=22`, and nothing enforces it. `selftest.mjs` passed under Node 20.16.0 (exit 0) and under 24.11.0 (45 ok, exit 0).
- **Code defects seen in passing**, for `code-defects.md`:
  a. Three places on the plugin's own pages are wrong for `--plugin-dir` (F8): `audit/SKILL.md:36-38` ("`D` is empty when this skill runs from a source checkout"), and the lifetime sentences at `audit/SKILL.md:39-42` and `rewrite/SKILL.md:74-77`. Those lifetime sentences also omit the last-scope rule (F9) and marketplace removal (F10). Level 3.
  b. Audit step 5b (`audit/SKILL.md:107-116`) gives the task readers no isolation: no state under `$TMPDIR` and no isolated config. Rewrite's lens-4 brief has both (`critic-briefs.md:141-142`). Level 2.
  c. `bake-off.md:114` vetoes any weakened condition, with no exception for a false one, while `bake-off.md:61-62` tells the writer to correct what the file gets wrong. Level 2.
  d. Bearing on ISSUES.md E10: the installed skill body the model receives begins "Base directory for this skill: <absolute path>" (transcripts in `$T/cc3` and `$T/cc4`). The binary also substitutes `${CLAUDE_SKILL_DIR}` in skill mode (`getPromptForCommand`). Level 3 for the prefix, level 2 for the substitution.

## Evidence

- **Read:**
  - Both README files (`02-grafts.md`, `00-original.md`).
  - The three `SKILL.md` pages and all 11 skill references.
  - The 7 scripts and the 3 manifests, plus `LICENSE`.
  - `research/2026-09-10-chain/README.md`, `chain/audit.md:1-75`, `chain/validation.json` and `chain-source-prompt.txt:100-140`.
  - The opening 400 bytes of each of the 40 `run-2x5` prompts, the two judge prompts in full, and both judge answers.
  - `ISSUES.md`.
  - From the published `8c041b7`: the audit and rewrite pages.
- **Ran:**
  - `git diff --quiet` (exit 0).
  - `wc -w` on 5 files.
  - The run-directory formula in the shell, 3 cases.
  - `selftest.mjs` twice (exit 0, exit 0).
  - `ledger.mjs` stub runs, 3 (exits 1, 0, 1).
  - The McNemar computation.
  - `git ls-remote` (main = `8c041b7`).
- **Isolated configs:**
  - `cc1`: marketplace add, 4 installs, 4 uninstalls and one marketplace remove, all exit 0.
  - `cc2`: auth status (exit 1, not logged in); add and install with no node on `PATH` (exit 0, exit 0); two skill invocations (exit 1, cost 0).
  - `cc3`: local marketplace add and install (exit 0); `details`; one invocation (exit 1, cost 0).
  - `cc4`: one `--plugin-dir` invocation (exit 1, cost 0); `uninstall terse@inline` (exit 1).
  - `cc5`: one skills-dir invocation (exit 1, cost 0).
- **Other:** 2 fetches of `code.claude.com/docs/en/plugins-reference`, and `strings` over the 2.1.280 binary (`vX`, `KSe`, the `@inline` sentinel).

## Open

- The in-app `/plugin …` route (interactive) was not run.
- F6: the claim that an installed session's Bash expands `${CLAUDE_PLUGIN_DATA:-…}` to empty rests on the docs. No authenticated session was run.
- The operating system's purge of `$TMPDIR` is not observable in a run.
- No record of the "after" readers exists to check L99-101.
