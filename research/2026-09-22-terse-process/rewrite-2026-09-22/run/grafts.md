# Grafts — round 02, `02-grafts.md` from `01-candidate.md`

`01-candidate.md` is candidate B (Codex Sol WC, frame-first), adopted whole. Round 02 takes into it the
repairs the judges found B missing, each as the repair and not the paragraph around it, re-checked
against the code at `2f29a8f` (the plugin tree at HEAD `448b920` is identical: `git diff --stat 2f29a8f
448b920 -- plugins/terse` is empty). Candidate letters as in `candidates-mapping.txt`: A = Opus WB
path-first, B = Codex Sol WC frame-first, C = Opus WA repair-first. Edits: `edits/02.json`, built by
`edits/02.build.mjs` from 01's own bytes.

| Graft | Taken from | In 02 | Check behind it |
|---|---|---|---|
| G1 — "All three skills announce how many agents they are about to spawn, on which model, and wait for your word." | A:66-67 (C:48 and 00:38 have the same sentence ending "and wait.") | :49-50, end of *What each one does* | level 2: `audit/SKILL.md:86-87`, `audit/references/measure.md:40-42`, `rethink/SKILL.md:30, 56-57`, `rewrite/SKILL.md:60-61, 131-132` |
| G2 — the chain's two dropped numbers, "one reader leaving the documentation before and none after, and neither control question broken", inside B's "Its pages report" | C:82-83 and A:103-104, both the original's words (00:66-67) | :100-102 | level 1: `audit/references/measure.md:3-5, 125-127` ("took departures from 1 to 0, and broke neither control"); `research/README.md:9` (3/6 → 6/6 only). `research/2026-09-10-chain/README.md` does not state either number; no reader record does (audit C31, unconfirmed at level 1), so the sentence says the pages report them |
| G3a — "Installed, `claude plugin uninstall` deletes the plugin data directory and the runs in it unless you pass `--keep-data`." | A:74-75 (A's restatement of where runs sit left out: B already states it at :74-76) | :81-82 | level 3: `probe-02/uninstall-probe.sh`, re-run by the check — isolated `CLAUDE_CONFIG_DIR`, install from this checkout, a run planted under `plugins/data/terse-nowely/runs/`, a decoy beside it; uninstall without the flag: terse's data directory absent, decoy present; reinstall, plant, uninstall with `--keep-data`: present. `claude plugin uninstall --help` names `--keep-data` "Preserve the plugin's persistent data directory"; `audit/SKILL.md:36-38` puts the installed run there |
| G3b — "From a checkout, the operating system may purge the runs in the temporary directory. Copy a run you want to keep." | A:75-76 | :82-83 | level 2, a lifecycle, provisional (L2~): `audit/SKILL.md:33, 39-42`; `rewrite/SKILL.md:71, 74-78`. Not run: the purge is the operating system's, on its schedule |
| G4 — *Where it writes* moved below *Install*; the version boundary's "above" becomes "below" | A's order (A:23 *Install* before A:69 *What it writes, and where*) | :72-83; :69 | `rule1.mjs 02-grafts.md --cut "Install" --except "Install"`: 0 violations (01: 1, `$TMPDIR` at 01:52). The changed sentence pinned at level 2: `git show 8c041b7:plugins/terse/skills/rewrite/SKILL.md` :66-67 (run directory inside the document's repository) against `rewrite/SKILL.md:66-67` and `audit/SKILL.md:44` today |

Why G4 moves the section rather than rewording `$TMPDIR`: rewording that one variable is fewer words, but
G3a puts `--keep-data` in the same section, and `rule1.mjs` counts a flag name before *Install* as a
violation (`rule1.mjs:27`) that `--except` does not excuse (`rule1.mjs:45`, paths only). Keeping the
section before *Install* would then mean writing the flag out of the sentence, which weakens the one
condition a reader acts on at uninstall. Moving the section clears both with one word changed elsewhere,
and the reader meets where runs land after deciding to install, before running anything.

## Re-pins

The thirteen seed claims round 01 reworded, each re-pinned under its seed name to B's own sentence,
unchanged, at its seed level — by an edit whose `old` and `new` are the same text, since no graft touches
these sentences:

| Claim | Level | B's sentence in 02 | Check |
|---|---|---|---|
| C01 | 2 | :3-4 "`terse` is a Claude Code plugin that measures whether readers get the right answer and whether a document's claims agree with the code behind it." | `plugin.json:2-4`; `audit/SKILL.md:3-6` |
| C03 | 3 | :19 "The plugin ships three user-invoked skills." | `probe-02/details-probe.sh`: isolated install, `claude plugin details` "Skills (3)  audit, rethink, rewrite"; `disable-model-invocation: true` at `audit/SKILL.md:7`, `rethink/SKILL.md:7`, `rewrite/SKILL.md:8` (the "user-invoked" half is that line: level 2) |
| C06 | 2 | :23-24, the first two sentences of audit's paragraph | `audit/SKILL.md:13-16, 46, 54-57, 69, 74, 84, 89-90` |
| C07 | 2 | :27-28 "It returns the profile, ledger, score…" and the five causes | `audit/SKILL.md:5-6, 94-96, 120, 123-131` |
| C09 | 2 | :32-33 "works before prose. It compares…" | `rethink/SKILL.md:4-5, 13-15, 25, 30-32, 43, 45-46, 54-56` |
| C10 | 2 | :33-34 "Its output is a skeleton… It then waits for your word." | `rethink/SKILL.md:13-15, 76, 82-83` |
| C11 | 2 | :36 "starts from that skeleton or an audit run." | `rewrite/SKILL.md:16-20, 29` |
| C15 | 2 | :75-76 "The `rewrite` instructions create their run there too." | `audit/SKILL.md:33`; `rewrite/SKILL.md:66-68, 71` |
| C24 | 3 | :88-89, inside the protected "not a compressor" passage, bytes unchanged | `wc -w` over `research/2026-09-10-chain/chain/`: 2725, 2482, 2377, 2482, 2571 → pass two −105, pass three +105, whole chain −154 = −5.65%; that README :1, 32-34; `chain/audit.md:25` |
| C33 | 3 | :102-103 "From those reported counts… McNemar *p* = 0.25." | computed: 3 improvements, 0 reversals → exact two-sided *p* = 0.25; `prior-art.md:92-95`; `research/README.md:9` |
| C42 | 2 | :105-106 "A separate bake-off used ten agents in a 2 × 5 design…" | `research/2026-09-10-chain/README.md:1`; `run-2x5/v04PR6HL.prompt.txt:8, 13-20, 22` |
| C43 | 2 | :111 "Not measured: which pass produced…" | `audit/references/measure.md:130-132`; `rewrite/references/bake-off.md:8-9` |
| C44 | 2 | :99-100 "The experiment had no no-document arm, and the repository has no individual reader records for it." | `research/README.md:10`; `prior-art.md:104-107`; `chain/validation.json:19-21`; `research/2026-09-10-chain/README.md:38-40`; `measure.md:40`; no file under `research/` or `plugins/` but the reader brief carries its `departed:` field |

None refused: on the sources above each reworded sentence is true at its seed level. Not pinned by any
name: 02:103-104, "The result neither clears a significance threshold nor separates what the text taught
from prior knowledge." — half of C33's claim and half of C44's, split by B into a sentence of its own.
