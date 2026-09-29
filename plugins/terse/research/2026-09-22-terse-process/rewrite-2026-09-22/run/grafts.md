# Grafts — round 02, `02-grafts.md` from `01-candidate.md`

`01-candidate.md` is candidate B (Codex Sol WC, frame-first), adopted whole. Round 02 grafts into it the
repairs the judges found B missing. Each graft takes the repair and not the paragraph around it, and each
was re-checked against the code at `2f29a8f` (the plugin tree at HEAD `f677303` is the same:
`git diff --stat 2f29a8f HEAD -- plugins/terse .claude-plugin` is empty). Candidate letters are as in
`candidates-mapping.txt`: A = Opus WB path-first, B = Codex Sol WC frame-first, C = Opus WA repair-first.
The edits are in `edits/02.json`, built by `edits/02.build.mjs` from 01's own bytes: 23 edits, 23 claims.

## Sent back twice by the verifier

Each time the page's recipe was followed: `02-grafts.md` removed, `ledger.02.json` copied back over
`ledger.json`, the edits fixed, and the round regenerated.

1. **First build** (`reviews/02-verifier-sol.md`; build kept as `edits/02.sent-back.json`): 17 holding,
   C44 does not answer, and six behaviour sentences unclaimed.
   - C44's check counted a `departed:` field, which is a neighbour of the sentence. Its new check reads the
     lines that state both of the sentence's clauses.
   - Six behaviour sentences sat in an edit's `new` with no claim in that edit (duty 1): the moved section
     and the re-audit paragraph. Now every edit's `new` holds only the sentences its claims are about. G1
     fills the place *Where it writes* leaves. The section is rebuilt below *Install* one sentence per
     edit, each inserted before the next heading with its claim.
   - Text change: at 02:74, `$TMPDIR/terse` became `${TMPDIR:-/tmp}/terse`, because the formula
     (`audit/SKILL.md:33`) falls back to `/tmp` when `TMPDIR` is unset.
2. **Second build** (`reviews/02-verifier-sol-rerun.md`; build kept as `edits/02.sent-back-2.json`): 23 of
   24 holding.
   - R02f1 does not answer. `measure.md:28-60` lets readers open Markdown and follow links, and says
     nothing about a temporary candidate, a copied tree, its relative location, or links after copying. The
     README may not state what no page states.
   - Text change: the placement sentence is cut: "When you re-audit a temporary candidate, keep it at the
     same relative location in a copy of its Markdown tree so its links still resolve." (25 words). The
     sentence after it keeps its claim (R02f2) and takes back the condition in the page's own words:
     "When you re-audit after a rewrite, use the same questions, answer key, entry file, and model; …"
     (`measure.md:106`, "Re-measuring after a rewrite").
   - The gap the cut sentence covered belongs to the pages, not the README, so it went to
     `code-defects.md` as D1, a proposal to the owner. It is the adversarial read's F4.

Words: 01 960 → 02 1014 (`wc -w`; the second build had 1033).

## The grafts

| Graft | Taken from | In 02 | Check behind it |
|---|---|---|---|
| G1 — "All three skills announce how many agents they are about to spawn, on which model, and wait for your word." | A:66-67 (C:48 and 00:38 have the same sentence ending "and wait.") | :48-49, end of *What each one does*, where *Where it writes* stood | level 2: `audit/SKILL.md:86-87`, `audit/references/measure.md:40-42`, `rethink/SKILL.md:30, 56-57`, `rewrite/SKILL.md:60-61, 131-132` |
| G2 — the chain's two dropped numbers, "one reader leaving the documentation before and none after, and neither control question broken", inside B's "Its pages report" | C:82-83 and A:103-104, both the original's words (00:66-67) | :99-101 | level 1: `audit/references/measure.md:3-5, 125-127` ("took departures from 1 to 0, and broke neither control"); `research/README.md:9` (3/6 → 6/6 only). `research/2026-09-10-chain/README.md` states neither number, and no reader record does (audit C31, unconfirmed at level 1), so the sentence says the pages report them |
| G3a — "Installed, `claude plugin uninstall` deletes the plugin data directory and the runs in it unless you pass `--keep-data`." | A:74-75 (A's restatement of where runs sit left out, because B states it at :73-75) | :80-81 | level 3: the check re-runs `probe-02/uninstall-probe.sh`. It installs from this checkout into an isolated `CLAUDE_CONFIG_DIR`, plants a run under `plugins/data/terse-nowely/runs/` with a decoy directory beside it, and uninstalls. Without the flag, terse's data directory is gone and the decoy stays; after reinstalling and planting again, uninstalling with `--keep-data` leaves it in place. `claude plugin uninstall --help` describes `--keep-data` as "Preserve the plugin's persistent data directory", and `audit/SKILL.md:36-38` puts the installed run there |
| G3b — "From a checkout, the operating system may purge the runs in the temporary directory. Copy a run you want to keep." | A:75-76 | :81-82 | level 2, a lifecycle claim, so provisional (L2~): `audit/SKILL.md:33, 39-42`; `rewrite/SKILL.md:71, 74-78`. Not run: the purge is the operating system's, on its schedule |
| G4 — *Where it writes* moved below *Install*; the version boundary's "above" becomes "below" | A's order (A:23 *Install* before A:69 *What it writes, and where*) | :71-82; :68 | `rule1.mjs 02-grafts.md --cut "Install" --except "Install"`: 0 violations (01 had 1: `$TMPDIR` at 01:52). The changed sentence is pinned at level 2: `21a225b:plugins/terse/skills/rewrite/SKILL.md:66-67` (run directory inside the document's repository) against today's `rewrite/SKILL.md:66-67` and `audit/SKILL.md:44` |

Why G4 moves the section rather than rewording `$TMPDIR`: the reword costs fewer words, but G3a puts
`--keep-data` in the same section. `rule1.mjs` counts a flag name before *Install* as a violation
(`rule1.mjs:27`), and `--except` excuses paths only (`rule1.mjs:45`). Keeping the section before
*Install* would mean writing the flag out of the sentence, which weakens the one condition a reader acts
on at uninstall. The move clears both and changes one word elsewhere. The reader meets where runs land
after deciding to install and before running anything.

## The sentences the move carries, and the re-audit rule, each with its claim

| Claim | Sentence in 02 | Check (level 2) |
|---|---|---|
| R02a | :73-74 "The `audit` instructions create the run under the plugin data directory when installed, or under `${TMPDIR:-/tmp}/terse` from a checkout, and forbid writing into the audited repository." | `audit/SKILL.md:33` (the formula), `:36-38` (installed: the data directory), `:44` (write nothing into the audited repository) |
| C15 (re-pin, on its sentence) | :74-75 "The `rewrite` instructions create their run there too." | `audit/SKILL.md:33`; `rewrite/SKILL.md:66-68, 71` |
| R02c | :75-76 "They instruct the agent to record a code defect in `code-defects.md` in the run and offer it to you." | `rewrite/SKILL.md:149-152` (step 4 item 6), `:203-204` (step 6) |
| R02d | :76-77, the protected on-your-word sentence, bytes unchanged | `rewrite/SKILL.md:78-79` (nothing into that repository without the user's word), `:153-154` (`ISSUES.md` only on the user's word), `:190-192` (applying the candidate needs their word) |
| R02e | :77-78 "The `rethink` page does not specify where its skeleton is stored." | `grep -c -i -E 'director\|\$RUN\|RUN=\|CLAUDE_PLUGIN_DATA\|TMPDIR\|/tmp\|mkdir\|skeleton\.md\|stored\|saved'` over `rethink/SKILL.md` prints 0; `ISSUES.md:183-188` (E13) is the record |
| R02f2 | :45-46 "When you re-audit after a rewrite, use the same questions, answer key, entry file, and model; changing one makes it a new measurement rather than a comparison." | `audit/references/measure.md:106-109`, the re-measurement rule |

## Re-pins

These are the thirteen seed claims round 01 reworded. Each is re-pinned under its seed name, at its seed
level, to B's own sentence, which stays unchanged. C15 sits on the edit that carries its sentence (see the
table above). The other twelve are edits whose `old` and `new` are the same text, because no graft touches
those sentences:

| Claim | Level | B's sentence in 02 | Check |
|---|---|---|---|
| C01 | 2 | :3-4 "`terse` is a Claude Code plugin that measures whether readers get the right answer and whether a document's claims agree with the code behind it." | `plugin.json:2-4`; `audit/SKILL.md:3-6` |
| C03 | 3 | :19 "The plugin ships three user-invoked skills." | `probe-02/details-probe.sh`: an isolated install, where `claude plugin details` prints "Skills (3)  audit, rethink, rewrite"; `disable-model-invocation: true` at `audit/SKILL.md:7`, `rethink/SKILL.md:7`, `rewrite/SKILL.md:8` (that line is all the "user-invoked" half rests on: level 2) |
| C06 | 2 | :23-24, the first two sentences of audit's paragraph | `audit/SKILL.md:13-16, 46, 54-57, 69, 74, 84, 89-90` |
| C07 | 2 | :27-28 "It returns the profile, ledger, score…" and the five causes | `audit/SKILL.md:5-6, 94-96, 120, 123-131` |
| C09 | 2 | :32-33 "works before prose. It compares…" | `rethink/SKILL.md:4-5, 13-15, 25, 30-32, 43, 45-46, 54-56` |
| C10 | 2 | :33-34 "Its output is a skeleton… It then waits for your word." | `rethink/SKILL.md:13-15, 76, 82-83` |
| C11 | 2 | :36 "starts from that skeleton or an audit run." | `rewrite/SKILL.md:16-20, 29` |
| C15 | 2 | :74-75, on *Where it writes* 2/5 | as in the table above |
| C24 | 3 | :87-88, inside the protected "not a compressor" passage, bytes unchanged | `wc -w` over `research/2026-09-10-chain/chain/`: 2725, 2482, 2377, 2482, 2571, so pass two −105, pass three +105, whole chain −154 = −5.65%; that README :1, 32-34; `chain/audit.md:25` |
| C33 | 3 | :101-102 "From those reported counts… McNemar *p* = 0.25." | computed: 3 improvements, 0 reversals give an exact two-sided *p* = 0.25; `prior-art.md:92-95`; `research/README.md:9` |
| C42 | 2 | :104-105 "A separate bake-off used ten agents in a 2 × 5 design…" | `research/2026-09-10-chain/README.md:1`; `run-2x5/v04PR6HL.prompt.txt:8, 13-20, 22` |
| C43 | 2 | :110 "Not measured: which pass produced…" | `audit/references/measure.md:130-132`; `rewrite/references/bake-off.md:8-9` |
| C44 | 2 | :98-99 "The experiment had no no-document arm, and the repository has no individual reader records for it." | `research/README.md:10` ("no arm ever ran without the document"); `audit/references/measure.md:125-127` (which measurement: the four-part chain, 3/6 → 6/6); `ISSUES.md:94-98`, E7, for the second clause ("the 3/6 → 6/6 figures have no per-reader record in the repository") |

None was refused: on the sources above, each reworded sentence is true at its seed level. One sentence is
pinned by no name: 02:102-103, "The result neither clears a significance threshold nor separates what the
text taught from prior knowledge." It carries half of C33's claim and half of C44's, and B made it a
sentence of its own.
