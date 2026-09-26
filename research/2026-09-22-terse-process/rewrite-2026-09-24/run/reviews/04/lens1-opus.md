# Opus lens 1: the code, with the right to run it. Round 04, `04-shape.md`

- **HEAD read:** `cae5a38a5c3d9a9c8cfb36be3fd0fa806a711fb9` on `terse-process-2026-09-22`. `plugins/terse/` and `.claude-plugin/` have no uncommitted changes (the working tree's changes are all under `research/`), and a `git archive HEAD` export of `plugins/terse` compares equal to the working tree with `diff -r`.
- **Standard:** level 2 (an independent reader of the code would state the same) everywhere; level 3 (made to happen) wherever the CLI or the scripts could run without cost or risk.
- **Repository not modified:** `git -C ~/Git/agent-skills status --porcelain` was saved before the first command and compared after the last. `diff` found no difference. The pre-existing entries (3 modified and 12 untracked, all under `research/2026-09-22-terse-process/`) are someone else's work in progress.
- **Where host-application commands ran:** all under `$TMPDIR/lens1-opus-r4/`, through `env -i` with `HOME` and `CLAUDE_CONFIG_DIR` both set to directories there (`cfg`, `cfg2`, `cfg3`). Nothing was signed in and no credentials were copied. `--dangerously-skip-permissions` was never used; one run was given `--allowedTools "Bash(printenv:*)" "Bash(echo:*)"` for a single tool call. `cfg` holds the public GitHub marketplace `Nowely/agent-skills`, cloned over HTTPS. `cfg2` and `cfg3` load HEAD, exported by `git archive` into `$TMPDIR/lens1-opus-r4/head`, as a local marketplace and through `--plugin-dir`. Every model call went to a local stub at `127.0.0.1:4873x` with a dummy key, so no model was called. The binary was `claude.exe` 2.1.280. For one update test the version was bumped to 0.1.2 in the TMPDIR export only and then reverted; `diff -r` against HEAD is clean again.

Counts: **35** behaviour sentences checked (the inventory is at the end). **9 findings:** FALSE 0, OVERSTATED 6, UNDERSTATED 3. Level-1 list: 4.

## Findings

**F1. Line 3.** "A Claude Code plugin for assessing and improving any text, in rounds of edits by several AI agents working from rules and best practices."
Verdict: **OVERSTATED** ("any text"). Level 2.
Check: `sed -n '91,92p' ~/Git/agent-skills/plugins/terse/skills/audit/SKILL.md` prints "Each one starts at the entry file, may open only `.md` files, may not read source". `sed -n '49p' …/skills/audit/references/measure.md` prints "You may open only .md files in <REPO>". The manifest description (`plugin.json:4`, and the marketplace entry) reads "Three user-invoked skills for documentation". The rewrite's checks read markdown `## ` sections: `sections.mjs:15`, `dup.mjs:13`, `rule1.mjs:22`. `stages.md:46-48` records "any text" as the aim, with the README now and "documentation and code later". The readers the audit measures with cannot open a text that is not a `.md` file.

**F2. Line 14.** "You need: Node 22 or newer."
Verdict: **OVERSTATED**. Level 3.
Check: `env PATH=~/.nvm/versions/node/v20.10.0/bin:/usr/bin:/bin ~/.nvm/versions/node/v20.10.0/bin/node ~/Git/agent-skills/plugins/terse/skills/rewrite/scripts/selftest.mjs | tail -1` prints "all checks caught their planted violation" with exit 0. That is all 50 checks, covering `rule1`, `dup`, `ledger`, `round`, `sections` and `audit/scripts/ledger-seed.mjs`, and the child `node` processes resolve to v20.10.0 through `PATH`. None of the post-20.10 APIs I grepped for appears in the scripts: `grep -E 'globSync|fromAsync|groupBy|withResolvers|import\.meta\.(dirname|filename)|styleText|getBuiltinModule' …/skills/*/scripts/*.mjs` exits 1 with no match. The number comes from `package.json:4-6` (`"engines": {"node": ">=22"}`), which is a declared floor that nothing enforces. It is not a floor the code needs.

**F3. Line 24.** "It asks for the scope — which files to check, every tracked `.md` by default — and where your readers start."
Verdict: **UNDERSTATED**. Level 2.
Check: `sed -n '23,28p;48,51p' …/skills/audit/SKILL.md`. Step 1 settles three things: the files, "Which repository backs them, if any", and where a reader arrives. Step 2 takes "One line … the user's alone, in their own words: what this document is for, and what it must make its reader able to do. Show the profile and ask for corrections before Step 3." The sentence names two of the four things the audit asks for before any reader is spawned. It omits the repository the claims are checked against, the purpose line in the user's own words, and the profile shown for correction.

**F4. Lines 24 and 58.** Line 24: "Its report lists the questions your text answers wrong, why, and where — file and line when a sentence is at fault." Line 58: "A report: which questions the text answers wrong, why, and where — file and line when a sentence is at fault; no rewording".
Verdict: **UNDERSTATED**. Level 2.
Check: `sed -n '166,167p' …/skills/audit/SKILL.md` prints "Report to the user: the score, the failures with their causes, the refuted claims, the count the seed printed, the absolute path, and the shape verdict." `sed -n '122p'` of the same file prints "The score is right answers over questions, reported as the difference from the no-document arm." Neither sentence mentions the refuted claims or the score. The refuted claims are sentences the truth pass found false, whether or not any reader's question reached them. (Line 26 covers the path and the shape verdict.)

**F5. Line 66.** "every claim checked against the code or a named source"
Verdict: **OVERSTATED**. Level 2.
Check: `sed -n '58p' …/skills/audit/SKILL.md` prints "Every sentence that states what the software does becomes one ledger entry". `sed -n '61,71p' …/skills/audit/references/truth-pass.md` excludes the argument for an instruction; voice, tone and ordering; illustrative examples; and "recipes for tools this repository does not ship". It adds: "They do not enter the ledger." The named-source form applies only "When no code backs the text" (`truth-pass.md:73-77`). When code backs the text, a claim that is not about what the software does goes unchecked, for example a measurement, a comparison, or a recipe for another tool.

**F6. Line 68.** "→ your read, with a reason for every cut of twenty words or more."
Verdict: **OVERSTATED** (a guarantee word with no step that produces it). Level 2.
Check: `grep -rn -i -e 'twenty words' -e 'cut ledger' ~/Git/agent-skills/plugins/terse/skills` matches only three places: `rewrite/SKILL.md:235` (the Step 6 list of what the run directory holds), `bake-off.md:117` (a judging-sheet row) and `ledgers.md:120` (the format). No step records a reason when a cut is made:
- the edit schema (`round.mjs:4-12`) has `old`, `new`, `check`, `claims`, `retire`, `drop` and `qualifies`, and no reason field;
- both writer briefs' CHECK lists (`bake-off.md:65-73`, `93-98`) ask only for "what you were tempted to cut and kept";
- the `rounds.md` row (`rewrite/SKILL.md:178`) has no cut column;
- the hand-over (`rewrite/SKILL.md:221-222`) names only the round and `diff-NN.patch`.

By `truth-pass.md:23-25`, a guarantee word must reach level 3 or be weakened.

**F7. Line 74,** writing-rules row, column "What it checks": "a condition, a limit or a warning cut or weakened where your readers decide"
Verdict: **OVERSTATED** (minor). Level 2.
Check: `grep -n -i weaken …/skills/rewrite/references/writing-rules.md` exits 1 with no match. The rule itself (`writing-rules.md:21`) is "Never cut a condition, a limit or a warning where a reader decides." "Weakened" comes from the bake-off judging sheet's veto row (`bake-off.md:114`), which is applied once, to the bake-off candidates. It is not in the rules that every round is written under.

**F8. Line 78.** "[The field's practices, each marked measured, argued or asserted](references/prior-art.md), gathered and ranked."
Verdict: **OVERSTATED**. Level 2.
Check:
- `awk 'NR>=297 && NR<664' ~/Git/agent-skills/plugins/terse/references/prior-art.md | grep -c -E '^[0-9]+\. \*\*'` gives **108** numbered practices in the ranked section.
- `awk 'NR>=297 && NR<664' …/prior-art.md | grep -o -E '\b(Measured|Argued|Asserted)\b' | sort | uniq -c` gives `6 Measured`, `3 Argued`, and no `Asserted`. Counting any case, only 13 of the 108 items contain one of the three words.
- The per-entry marking is in `practices-full.md`: `grep -c -E '^- \*\*'` finds 271 entries and `grep -c -E '^\s+- \*Evidence:\*'` finds 271 evidence fields, 237 of which name one of the three words. That file says "Nothing here is ranked" (`practices-full.md:10-11`).

"Each marked … and ranked" is true of neither file.

**F9. Line 80** (with line 32). Line 80: "Each run is written in the plugin's own folder." Line 32: "…in a folder of its own outside your repository."
Verdict: **UNDERSTATED** (the lifecycle). The location holds at level 3; the omission is shown at level 3.
Check, in the isolated `cfg2` with HEAD installed from the local export:
1. `claude -p "/terse:audit"`, and likewise `/terse:rewrite` and `/terse:rethink`, sent to the stub. The skill text the model receives reads `D="$TMPDIR/lens1-opus-r4/cfg2/plugins/data/terse-nowely"; RUN="${D:-…}/runs/…"`, recorded in `stub/log1/req.002.json`, `.004` and `.006`. Running that line created `…/cfg2/plugins/data/terse-nowely/runs/20260924-104138`.
2. `claude plugin marketplace update nowely`, then `claude plugin update terse@nowely`, printed "Plugin "terse" updated from 0.1.1 to 0.1.2 … Restart to apply changes." The run survived.
3. `claude plugin uninstall terse@nowely --keep-data`: the run survived.
4. `claude plugin uninstall terse@nowely`: `find …/cfg2/plugins/data` prints only the data root. The run is gone.
5. Reinstall, write a new run, then `claude plugin marketplace remove nowely`: the run is gone. `claude plugin marketplace remove --help` offers no keep-data option.

The skill pages tell the user this at the hand-over (`audit/SKILL.md:39-42`, `rewrite/SKILL.md:84-87`, `rethink/SKILL.md:48-53`). The README's promise names the folder but never says that a plain uninstall, or removing the marketplace, deletes every draft, diff and report in it.

## Level-1 list (claims that could not be settled past a resolving line)

1. **Line 26:** "Otherwise say whether the document's shape … stands. If it does, run this and, when it asks, give it the folder the report names". The open question is whether a word given *after* the report reaches rewrite.
   - The audit writes `$RUN/audit.md` (`audit/SKILL.md:155`) before "Report to the user … and the shape verdict" (`:166`), and no audit step asks for the shape or records a word given after the report.
   - Rewrite reads the verdict from the Score section of `audit.md` (`rewrite/SKILL.md:16-17`, `:37-38`; `ledgers.md:41`: "Score carries the shape verdict that decides whether it starts") and stops when the verdict is not agreed (`:18-20`). But `:14-16` also accepts "their words, quoted".
   - The pages leave open which rule wins when Score reads `shape: not agreed` and the user says in the rewrite session that the shape stands. Settling it needs a model run of audit followed by rewrite, which was not made because of its cost.
2. **Line 42:** "`/terse:audit` again with the same questions". `measure.md:106-109` requires the same questions, key, entry file and model, and `audit/SKILL.md:101-102` reuses the no-document score. But no audit step takes an earlier run's questions: Step 1 makes a new run directory (`:32-34`) and Step 4 writes questions from the profile (`:73-77`). The draft also sits outside the repository (line 32), while the readers start at the entry file inside it (`audit/SKILL.md:91`). Nothing says the draft must be applied, or pointed to, first. The mechanism is level 1.
3. **Line 74:** "measured on one README". `research/2026-09-10-chain/README.md` resolves, and its word counts reproduce (`wc -w` on the `chain/` files gives 2725, 2482, 2377, 2482 and 2571). What was measured beyond length is not in that directory: `chain/validation.json` records `"live_reader_experiments_run": 0`, and `grep -e '3/6' -e '6/6' -e McNemar` finds nothing under `chain/`.
4. **Line 75:** "What one owner changed on his documents". `stages.md:313-316` states it. The owner's changes are history, not code.

## Observed in passing (not claims of `04-shape.md`; for `code-defects.md` or `ISSUES.md` on the owner's word)

- **P1.** Line 10's install block installs GitHub `main` today: commit `8c041b7`, terse 0.1.1.
  - The audit formula in that release reaches the model unsubstituted: `RUN="${CLAUDE_PLUGIN_DATA:-${TMPDIR:-/tmp}/terse}/…"` (`stub/log1/req.010.json`).
  - During the skill, the Bash tool's shell holds neither `CLAUDE_PLUGIN_DATA` nor `CLAUDE_PLUGIN_ROOT`: `printenv` printed nothing (`stub/evidence/req.003.json`).
  - The release's rewrite works in "`research/<date>-<slug>/` at the root of the" repository (cached `rewrite/SKILL.md:66`).
  - Lines 32 and 80 are true of HEAD and false of the release a reader installs now. `stages.md` rule 12 gives this to the release, not to a sentence.
- **P2.** `audit/SKILL.md:36-37` and `rethink/SKILL.md:40-41` say "`D` is empty when this skill runs from a source checkout". With `claude --plugin-dir <checkout>/plugins/terse`, `D` arrives as `<config>/plugins/data/terse-inline` (`stub/log1/req.008.json`, isolated `cfg3`).
- **P3.** `$CLAUDE_PLUGIN_ROOT` (`rewrite/SKILL.md:93`, `audit/SKILL.md:161`) arrives literally in the skill text and is not in the Bash tool's environment on HEAD's install either (`stub/log4/`, where `printenv` printed nothing). `S` and `A` can only be derived from the "Base directory for this skill" line.
- **P4.** Audit Step 5b (`audit/SKILL.md:111-118`) gives its task readers, who act on the document's recipes, no place to act and no rights. Lens 4's brief (`critic-briefs.md:146-152`) creates the state under `$TMPDIR` and forbids writes outside it. This bears on line 80's "Nothing in your repository changes", which holds at level 2 through `audit/SKILL.md:44`, `rewrite/SKILL.md:88-89` and `rethink/SKILL.md:46`.
- **P5.** `audit/SKILL.md:39-42` and `rewrite/SKILL.md:84-87` name only `claude plugin uninstall` as what deletes a run. `claude plugin marketplace remove` deletes it too (F9, step 5); of the three pages, only `rethink/SKILL.md:49-51` names it.
- **P6.** `writing-rules.md:29` says the block is "reproduced byte for byte" from PART 2. PART 2 (`chain-source-prompt.txt:64-83`) is indented four spaces, and `diff` shows the block equal only once that indent is stripped. The SHA-256 recorded at `:31` does match the block as it stands (`sed -n '6,25p' | shasum -a 256` gives `7a577b29…635d`).
- **P7.** `prior-art.md:302` says "This is the curated forty", but the section numbers 108 practices (F8).

## Inventory: the 35 behaviour sentences

| # | Line | Sentence (short) | Verdict | Level | Evidence |
|---|---|---|---|---|---|
| 1 | 3 | plugin for assessing and improving any text | F1 | 2 | above |
| 2 | 3 | It is not a compressor | holds | 2 | `sections.mjs:4-5` (report, exit 0); the chain's `wc`: 2725→2571 |
| 3 | 9-12 | install block | holds | 3 | `cfg`: "Successfully added marketplace: nowely", "Successfully installed plugin: terse@nowely" |
| 4 | 14 | Node 22 or newer | F2 | 3 | above |
| 5 | 18-22 | `/terse:audit` in Claude Code | holds | 3 | headless run expands the skill (`req.002`) |
| 6 | 24 | asks for the scope… | F3 | 2 | above |
| 7 | 24 | audit announces count and model, waits | holds | 2 | `audit/SKILL.md:88-89` |
| 8 | 24 | rewrite announces before writers, judges, reviewers | holds | 2 | `rewrite/SKILL.md:70-71`, `150-151` |
| 9 | 24 | its report lists… | F4 | 2 | above |
| 10 | 26 | all answers right, stop | holds | 2 | `audit/SKILL.md:151-153` |
| 11 | 26 | say whether the shape stands | level-1 item 1 | 1 | above |
| 12 | 26 | rewrite asks for the folder the report names | holds (sequence in level-1 item 1) | 2 | `rewrite/SKILL.md:37`, `audit/SKILL.md:166` |
| 13 | 32 | new draft + diff against the original, own folder outside the repository | holds; lifecycle in F9 | 3 | `D` substituted; `rewrite/SKILL.md:76-81`, `221-222` |
| 14 | 32 | you decide whether the draft replaces the document | holds | 2 | `rewrite/SKILL.md:222-223` |
| 15 | 34 | rethink decides a skeleton you agree to | holds | 2 | `rethink/SKILL.md:17`, `148-151` |
| 16 | 40 | each command run by you | holds | 3 | model-visible skill list with terse enabled: no terse entry (`req.002`) |
| 17 | 42 | audit again with the same questions | level-1 item 2 | 1 | above |
| 18 | 43 | rethink → rewrite → audit | holds | 2 | `rewrite/SKILL.md` table row 2; `briefs.md:294-295` |
| 19 | 47-50 | update block | holds | 3 | `cfg` (GitHub) and `cfg2` runs |
| 20 | 52 | restart to apply | holds | 3 | "Restart to apply changes." |
| 21 | 58 | audit row | F4; "no rewording" holds | 2 | `audit/SKILL.md:18-19` |
| 22 | 59 | rethink row | holds | 2 | `rethink/SKILL.md:13-15`, `122-125` |
| 23 | 60 | rewrite row | holds | 2 | `rewrite/SKILL.md:14-28` |
| 24 | 62 | you start each one yourself | holds | 3 | as #16; `disable-model-invocation: true` ×3 |
| 25 | 66 | audit's chain | F5; the rest holds | 2 | `audit/SKILL.md` steps 2-6 |
| 26 | 67 | rethink's chain | holds | 2 | `rethink/SKILL.md` steps 1-4 |
| 27 | 68 | rewrite's chain | F6; "check that runs" and "refused if it loses" hold at 3 | 3/2 | selftest; ratchet run: `round.mjs` exit 0, then `ledger.mjs` "LOST", "YES", exit 1 |
| 28 | 74 | writing-rules row | F7; "Part two of a four-part rewrite" holds | 3 | PART 2 = block (indent aside), SHA matches |
| 29 | 75 | content-rules row | holds; provenance in level-1 item 4 | 2/1 | `stages.md:311-317` |
| 30 | 76 | scripted checks, each against a planted violation | holds | 3 | selftest 50/50 on Node 24 and on Node 20; planted env var, exit code, protocol, header field and `/abs` path all fire in `rule1` |
| 31 | 78 | prior-art: each marked, ranked | F8 | 2 | above |
| 32 | 80 | each run in the plugin's own folder | holds; F9 | 3 | above |
| 33 | 80 | a round that loses a pinned sentence or revives a retired one is refused before you see it | holds | 3/2 | `ledger.mjs` exit 1 (run); removal and gate `rewrite/SKILL.md:144-147`, `205-206` |
| 34 | 80 | nothing in your repository changes until you say so | holds | 2 | three pages (P4); no hooks, agents or MCP in the plugin tree |
| 35 | 82 | not guaranteed that a person reads better; AI readers measured | holds | 2 | `CHANGELOG.md:212-215` |
