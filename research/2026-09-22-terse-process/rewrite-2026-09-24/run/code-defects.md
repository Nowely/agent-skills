# Code defects — rewrite of plugins/terse/README.md from the agreed skeleton, run 20260924-002235-terse-readme-rewrite2

Findings the rounds routed to the code, per `rewrite/SKILL.md` step 4 item 6 and `loop.md`'s routing table, each with its check, offered to the owner as a proposal. Nothing here is in the repository: `ISSUES.md` takes an entry only on the owner's word. Numbering continues the previous run's `code-defects.md` (D1–D13, `research/2026-09-22-terse-process/rewrite-2026-09-22/run/code-defects.md`), whose header maps D1–D13 to E15–E27; D14–D20 would be E28–E34. The pages are read at commit `f97eb4a` (the plugin tree; later commits on the branch touch `research/` only until noted).

## D14. No audit step writes the user's shape verdict into the run file after the report, though `rewrite` reads it there

**Evidence, level 2.** `plugins/terse/skills/audit/SKILL.md:155–174`: the audit writes `audit.md`, prints the score and the path, and reports the shape verdict — `shape: agreed` only on the user's word — but no step says that the user's word, given after the report, is written back into `audit.md`'s *Score*, which `references/ledgers.md:31–32` names as the verdict's place. `plugins/terse/skills/rewrite/SKILL.md:16–20` reads the verdict from `audit.md` and `:37–38` from *Score*; `:14–17` also accepts the user's words quoted for `rounds.md`. Which of the two a live turn settles is unwritten. Found by the round-02 wave's lens 1 (Claude Opus, level-1 list item 2), classed by the dedup as a page gap.

**Check.** From any directory:

    sed -n '155,174p' /Users/ruliny/Git/agent-skills/plugins/terse/skills/audit/SKILL.md; sed -n '14,20p;37,38p' /Users/ruliny/Git/agent-skills/plugins/terse/skills/rewrite/SKILL.md; grep -n -i -E 'write.*(verdict|shape).*(Score|audit\.md)|Score.*(verdict|shape)' /Users/ruliny/Git/agent-skills/plugins/terse/skills/audit/SKILL.md

The last command prints the lines that mention the verdict beside *Score* or the run file; none of them is a step that writes the user's later word back. Regex over the whole output: `shape: agreed` and no line matching `after (the|their) word.*writ`.

**Issue text.** `audit` reports its shape verdict after writing the run file, and the user's word — the only thing that makes it `agreed` — comes after the report. No step writes that word into `audit.md`'s *Score*, where `ledgers.md` places the verdict and where `rewrite` reads it. `rewrite` also accepts the user's quoted words for `rounds.md`, so two sources exist and neither page says which governs when they differ. The audit page should say that the user's word is written into *Score* when it is given, with the words quoted, and `rewrite` should read that one place.

## D15. A re-audit "with the same questions" is required by `measure.md` and no audit step takes an earlier run as input

**Evidence, level 2.** `plugins/terse/skills/audit/references/measure.md:106–109`: a re-measurement after a rewrite uses the same questions, key, entry file and model. `plugins/terse/skills/audit/SKILL.md:23–34` (step 1 makes a new run directory) and `:73–77` (step 4 writes the questions from the profile) — no step reads an earlier run's questions and key. `grep -n -i -E 'previous run|earlier run' plugins/terse/skills/audit/SKILL.md` prints nothing (exit 1). The README's route line "audit again with the same questions" states the rule the pages set. Found by the round-02 wave's lens 1 (level-1 list item 3); D1 of the previous run is the neighbouring gap (where the candidate stands for its re-audit).

**Check.** From any directory:

    grep -n -i -E 'previous run|earlier run|same questions' /Users/ruliny/Git/agent-skills/plugins/terse/skills/audit/SKILL.md; sed -n '106,109p' /Users/ruliny/Git/agent-skills/plugins/terse/skills/audit/references/measure.md

The grep prints no line with "previous run" or "earlier run"; the sed prints the same-questions rule.

**Issue text.** `measure.md` requires a re-audit to reuse the questions, the key, the entry file and the model of the first audit, and the audit page has no step that takes a first audit's run as input: step 1 makes a fresh run directory and step 4 writes fresh questions from the profile. A user who audits again after a rewrite gets a new measurement, not a comparison, unless they carry the questions over by hand. Step 1 should accept a previous run directory and steps 4 and 5 should reuse its questions, key and baseline when one is given.

## D16. `rule1.mjs` misses a one-dash flag, a header field inside a code span and an exit code worded "status 127", and flags a document name before a colon

**Evidence, level 3.** `plugins/terse/skills/rewrite/scripts/rule1.mjs:27` matches flags with two dashes only (`-p` passes); `:31`'s lookbehind excludes a backtick, so a header field inside a code span passes though `:9–10` says fences are not skipped; `:29` needs "exit" before a code, so "status 127" passes; and a document name before a colon ("README:") is reported as a header field. Planted by the round-02 wave's lens 2 (Claude Opus, R7) in a copy under its scratch directory: the one reported violation was the false positive `! line 14 header field README:`. D4 records the bare environment variable and the braced form; these four forms are new.

**Check.** From any directory, with `S=/Users/ruliny/Git/agent-skills/plugins/terse/skills/rewrite/scripts`:

    T=$(mktemp -d); printf '# t\n\nRun it with -p and read `X-Api-Key:` in the header; on failure it ends with status 127, as README: says.\n\n## How it works\n\nmechanism\n' > "$T/plant.md"; node "$S/rule1.mjs" "$T/plant.md" --cut "How it works"; echo "exit $?"

Prints one violation, the header field `README:`, and misses `-p`, `X-Api-Key:` and `status 127`. Regex: `header field README:[\s\S]*1 violation`.

**Issue text.** Rule 1 keeps mechanism out of the sections a reader meets first, and `rule1.mjs` checks it with patterns that need a double-dash flag, a header field outside a code span and the word "exit" before a code, while it reports a document name followed by a colon as a header field. A section that says `-p`, names a header in backticks or writes "status 127" passes; a sentence that says "as README: shows" fails. The patterns should cover the one-dash flag, the code-span field and "status <code>", and a capitalised word before a colon should count as a header field only when it looks like one (a hyphenated or lower-case name), with the self-test planting all four.

## D17. `dup.mjs` never compares a concept with the section its name gives, so a concept outside its home passes short of three

**Evidence, level 3.** `plugins/terse/skills/rewrite/scripts/dup.mjs` counts the sections a pattern matches and reports a concept only in three or more; a concept named with its home ("a fix is not undone — How it works", the skeleton's own list) that matches the opening as well prints `2 … (opening) | How it works` and `0 concept(s)`. Found by the round-02 wave's lens 2 (R10) with the skeleton's concept list; the judges' observation on the over-broad pattern (`judges/fable.md`) is the same fact from the other side.

**Check.** From any directory, with `S=/Users/ruliny/Git/agent-skills/plugins/terse/skills/rewrite/scripts` and `R` this run directory:

    node "$S/dup.mjs" "$R/02-grafts.md" "$R/concepts.01.json"

Prints the "a fix is not undone" concept in two sections and `0 concept(s) in three or more sections` (the pattern before round 02's fix; `concepts.json` after it counts one).

**Issue text.** The skeleton names a home for every concept ("one idea, one home"), and `dup.mjs` reports only a concept found in three or more sections: a concept that appears in its home and one other section passes, which is the duplication the rule forbids. Where a concept's name carries its home section, the script should report any match outside it; where it does not, the threshold should be two.

## D18. `rewrite`'s adversarial read runs before the page's announce-and-wait, one agent the user never sized

**Evidence, level 2.** `plugins/terse/skills/rewrite/SKILL.md:64–66`: "On a document that already exists, the first thing that runs is the adversarial whole-document read — lens 3 of step 4's table — with the right to run the code." `:70–72`: "Announce before spawning: the count, the models, and that the cost of a writer or a judge has not been measured … Wait for the user's word. If the user refuses the fan-out, write one candidate yourself". The announcement names the writers and the judges; the adversarial reader, a Codex Astra agent with the right to run the code, is spawned by the paragraph before it. The repository's rule (`CLAUDE.md`, "Fan-outs") and the audit page's own step 5 announce before spawning. Found by the verifier of round 03 (Codex Sol V5, refuting the README's "each skill … waits until you say so" on this one agent).

**Check.** From any directory:

    sed -n '64,72p' /Users/ruliny/Git/agent-skills/plugins/terse/skills/rewrite/SKILL.md

Prints the adversarial read as "the first thing that runs" and the announce-and-wait two paragraphs later, naming writers and judges only. Regex: `the first thing that runs is the adversarial[\s\S]*Announce before spawning: the count, the models`.

**Issue text.** `rewrite` starts its adversarial reader — one agent with the right to run the code — before it announces anything, and its announce-and-wait names only the writers and the judges. Every other agent the three skills start is announced first. Step 3 should announce the adversarial reader with the bake-off, in one announcement, and wait once; a README that says the skills announce their agents and wait is then true of every agent.

## D19. Only pinned sentences are protected by the ratchet, the ledger starts empty without an audit, and no step pins a bake-off winner's sentences

**Evidence, level 2.** `plugins/terse/skills/rewrite/scripts/ledger.mjs:17–25` checks the entries of `ledger.json` and nothing else; `plugins/terse/skills/audit/scripts/ledger-seed.mjs:60–62` writes the audit's confirmed and refuted sentences; `plugins/terse/skills/rewrite/scripts/round.mjs:144–158` adds what an edit declares; `plugins/terse/skills/rewrite/SKILL.md:117–118` starts the ledger empty on a skeleton route with no audit; no step of the bake-off (step 3, `references/bake-off.md`) pins the winner's sentences. On this run, 16 of the audit's 17 confirmed sentences could not survive the agreed skeleton by wording (`probe-01/ledger-01.out`), so the first round under the ratchet was guarded by one pin and eleven retirements, and the winner's own behaviour sentences stayed unpinned until a later round re-declared them. Found by the round-03 wave's lens 1 (Claude Opus, F7/F8 lines) and the dedup (L6.3-22).

**Check.** From any directory, with `S=/Users/ruliny/Git/agent-skills/plugins/terse/skills/rewrite/scripts`:

    sed -n '17,25p' "$S/ledger.mjs"; sed -n '117,118p' /Users/ruliny/Git/agent-skills/plugins/terse/skills/rewrite/SKILL.md; grep -n -i -E 'pin|ledger' /Users/ruliny/Git/agent-skills/plugins/terse/skills/rewrite/references/bake-off.md | head

Prints the ratchet's loop over the ledger's entries, the empty start on the skeleton route, and no bake-off step that pins the winner's sentences.

**Issue text.** The README's guard sentence — a round that silently loses a sentence checked true is refused — is true of the sentences the ledger holds, and on the skeleton route those are the audit's original wording, most of which a new shape cannot keep, plus whatever later edits declare; the bake-off winner's sentences, the first text a reader will see, are pinned by no step. Step 3 should end with a pinning pass over the winner — every behaviour sentence declared as a claim with its check, by the same schema as `edits/NN.json` — so that round 02 starts under a ledger that guards the text it edits.

## D20. `round.mjs`'s qualification signal is an English word list, so the same clause in another language is written without a reason

**Evidence, level 3.** `plugins/terse/skills/rewrite/scripts/round.mjs:93`: the qualifying forms are English (`unless`, `except when`, `only if`, …). An edit adding "unless you pass --prune" is refused ("a qualification is not a fix", exit 1); the same clause in Russian («если только вы не передадите --prune») is written, "ok", exit 0. Found by the round-03 wave's lens 1 (Claude Opus, F1), reproduced by the dedup; the plugin's stated scope is any language (ISSUES E8 records the same for `rule1.mjs`).

**Check.** From any directory, with `S=/Users/ruliny/Git/agent-skills/plugins/terse/skills/rewrite/scripts`:

    T=$(mktemp -d); printf 'The tool keeps runs.\n' > "$T/00.md"; printf '[{"name":"ru","old":"The tool keeps runs.","new":"The tool keeps runs, если только вы не передадите --prune.","claims":[{"name":"k","pattern":"keeps runs","asks":"runs are kept"}],"check":{"level":1,"run":"echo x","expect":"x"}}]' > "$T/e.json"; echo "[]" > "$T/l.json"; node "$S/round.mjs" "$T/00.md" "$T/01.md" "$T/e.json" --ledger "$T/l.json"; echo "exit $?"

Prints `ok  ru` and `exit 0`; the English form of the same edit exits 1.

**Issue text.** `round.mjs` refuses an edit that adds a qualifying clause without a reason, and recognises the clause by an English word list, so a caveat written in any other language passes unseen. The list should carry the common forms of the languages the plugin claims, or the check should be handed to the verifier's fifth duty with the script marking every edit whose `new` grew a subordinate clause, in any language, by structure rather than by words.
