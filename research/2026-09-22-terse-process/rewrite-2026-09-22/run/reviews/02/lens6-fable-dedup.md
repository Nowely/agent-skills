# Lens 6 — dedup and rank of the round-02 wave on `02-grafts.md`

Fable (claude-fable-5-1), 2026-09-23. Document: `$R/02-grafts.md`, 114 lines, SHA-256
`66cc182c5836688f8994ad59ed6c927a0ea27b730a2072ad66db4c9d2411fec7` (the same bytes lens 2 reviewed).
Code: `/Users/ruliny/Git/agent-skills` at `f677303`, plugin tree = `2f29a8f`. Line numbers are `cat -n`
lines of `02-grafts.md`. `$R` = the run directory, `$S` = `plugins/terse/skills/rewrite/scripts`,
`$A` = `plugins/terse/skills/audit/scripts`, `$T` = `/var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T//terse-lens6.OENx06`.

Inputs: 12 critic reports (`lens1-opus.md` 14 findings + 4 notes + 6 level-1 items; `lens2-opus.md` 22;
`c3.md`/`c3-astra-findings.md` 3 + D/E; `c4-1.md` 4 guesses; `c4-2.md` 5 guesses + 1 untrue sentence;
`c5-1..7` 7 answers, 0 findings), 3 verifier reads (context), the round's record (`skeleton.md`,
`grafts.md`, `rounds.md`, `code-defects.md` D1, `edits/02.json` 23 edits, `ledger.json` 38 entries),
`audit.md` (profile, key, results, what broke, open), `brief.md` parts 5–6, `ISSUES.md` E1–E13,
`00-original.md`, `01-candidate.md`, and the cited page, script and research lines.

**Raised: 49** (lens 1: 14; lens 2: 22; C3: 3; task readers: 9 guesses + 1 untrue sentence). Lens 1's
four code notes (a–d) and C3's D/E are folded in where they bear. **Deduplicated: 35. Raised by two or
more lenses: 5** (L6-01, 02, 03, 04, 07); by two or more reports: 7 (+ L6-28, 29).

Rank = lenses that raised it, then the level of the check (a run over a read), then whether it
overturns a pinned sentence. Category is the primary one; a second is named where it applies. "Edit:
mine" = wording composed here from the critic's evidence; the finding is the critic's.

Reproduced here under `$T` (exit codes as stated): lens 2's four runs on 02 (`rule1.mjs` 0 violations
with the cut, 1 without — `--keep-data` at L81; `dup.mjs` 1 concept in three sections and four zeros;
`sections.mjs` 986, two over; `ledger.mjs` 0 failures), lens 1's F4 (capital passes exit 0, lower case
YES exit 1; `grep -n flags` over `round.mjs` and `ledger-seed.mjs` exits 1), lens 2's R6 (planted
`PATH` and `${TMPDIR:-/tmp}` pass; 2 of 4 caught), C3's F2 (`ledger-seed.mjs` on an empty block exits 1,
no output file), and the four standards' line 21 (three carry a URL; the draft "has no website").

---

## The list, ranked

### L6-01. The judges' sentence: wrong count, and two different questions compared as one
- **Lines:** L107-108 — "One judge put both controls above both entries for the two published standards; the other did not."
- **Finding:** three of the four standards were published (Diataxis, Vercel's skill, riekelt/technical-writer; only the CLAUDE.md draft "has no website"), the judge's own phrase was "both published on-axis standards", "both entries" reads as two where four exist, and the two judges ranked on different criteria (J1 verified findings; J2 wording, "Not factual accuracy"), so "the other did not" is not a disagreement on one question.
- **Raised by:** lens 1 F13 (the count, FALSE) and F14 (criteria, UNDERSTATED); lens 2 P3 (the counts do not add up on the page); C3 F3 (CONFIRMED, criteria). 3 lenses.
- **Check:** lens 1: `sed -n '21p' research/2026-09-10-chain/run-2x5/{zP378l2j,oRfBREBF,rCYUALAd,EKalWntb}.prompt.txt; sed -n '3p' research/2026-09-10-chain/run-2x5/{o8eHzS6U,v04PR6HL}.answer.md`. C3: `nl -ba research/2026-09-10-chain/run-2x5/o8eHzS6U.prompt.txt` (:20-27) and `v04PR6HL.prompt.txt` (:32-45). Lens 2: `sed -n 104,108p $R/02-grafts.md`. Level 2; reproduced (line 21 of the four prompts).
- **Verdict on the ranks:** holds (lens 1): J2 has P9, P10 at 2, 3 above all six published entries; J1 has P9 at 7 below P7 (4) and P2 (6).
- **Category:** SENTENCE.
- **Edit (mine):** "Ranking on wording, one judge put both controls above every entry of the two published prose standards; ranking on verified findings, the other did not." Naming the two (Diataxis, riekelt/technical-writer) removes the count altogether. No pin covers L107-108; C39/C41 (retired) are not revived.

### L6-02. The prerequisites sentence puts sign-in and Node before the install commands, which need neither
- **Lines:** L53-54 — "Before the two install commands, install Claude Code, sign in to it, and put Node 22 or newer on `PATH`. Node is required for an installed plugin and for a source checkout."
- **Finding:** both install commands exit 0 with no sign-in and no `node` on `PATH`; sign-in and Node are conditions of running a skill, not of installing.
- **Raised by:** lens 1 F5 (OVERSTATED, level 3); c4-2 ("untrue sentence observed", level 3); lens 2 W5 + W6 (10 words of water on the same two sentences) and its safeguard note that L53's "sign in to it" was kept as a condition at the install decision. 3 lenses.
- **Check:** lens 1, `$T/cc2`: `claude auth status` → `loggedIn: false` (exit 1); `PATH=/usr/bin:/bin:/usr/sbin:/sbin which node` exit 1; `claude plugin marketplace add Nowely/agent-skills` and `claude plugin install terse@nowely` both exit 0. c4-2 commands 6-7 and 13 (isolated config, not signed in, both installs exit 0).
- **Category:** SENTENCE.
- **Edit (mine, folding W5/W6):** "Install with the two commands below. Running a skill needs Claude Code signed in and Node 22 or newer on `PATH`, installed or from a checkout." Keeps both conditions at the decision they govern; does not revive C20/C21 (retired patterns are the original's full sentences). Note lens 1's non-finding: `package.json` declares `>=22` and nothing enforces it; `selftest.mjs` passed under Node 20.16.0.

### L6-03. The version-boundary paragraph: editing history, and a label that is too narrow twice over
- **Lines:** L66-69 — "Version boundary: this page describes commit `2f29a8f` on branch `terse-process-2026-09-22`. At the 2026-09-22 audit, the install commands resolved the marketplace's `main` at `8c041b7`, whose rewrite page still wrote into the document repository without asking. The outside-repository write boundary below therefore describes this checkout, not that published revision."
- **Finding:** "on branch …", "still" and "this checkout" are editing history (writing-rules.md:12-13); and "outside-repository write boundary" understates what differs — the published revision's audit runs land in `$TMPDIR/terse` (its `${CLAUDE_PLUGIN_DATA:-…}` form is not substituted), so L80-81's uninstall lifetime is also not that revision's (F6), and the section below settles the boundary for two skills of three (P2).
- **Raised by:** lens 1 F6 (UNDERSTATED, level 3 transcript / level 2 docs); lens 2 R1 (history), W2 (the shorter form), P2 (the label against L77-78). 2 lenses, 4 items, one paragraph.
- **Check:** lens 2: `grep -n -E "on branch|still|this checkout" $R/02-grafts.md` → 66, 68, 69; `grep -n -E "outside-repository|does not specify"` → 68, 77. Lens 1: `git ls-remote https://github.com/Nowely/agent-skills.git refs/heads/main` → `8c041b76…`; the installed unauthenticated `/terse:audit` transcript in `$T/cc2` carries `RUN="${CLAUDE_PLUGIN_DATA:-${TMPDIR:-/tmp}/terse}/runs/…"` unsubstituted and creates no `plugins/data`; the binary substitutes only `/\$\{CLAUDE_PLUGIN_DATA\}/g`.
- **Category:** SENTENCE.
- **Edit (lens 2's W2, which also answers F6 and P2):** "This page describes commit `2f29a8f`." / "whose rewrite page wrote" / "The section below describes this commit, not that one." Pin G4 (L2) is on the last sentence → re-pin.

### L6-04. Install gives no route to the revision the page describes, and the boundary sentence sits away from where Q2's reader lands
- **Lines:** L58-64 (the commands), L66-69, L73 "when installed", L80 "Installed,".
- **Finding:** the only install recipe fetches `main` = `8c041b7` (both revisions call themselves 0.1.1), so "Where it writes" describes an install the page gives no command for; the sentence that limits it sits in Install, not in the section a reader asking "can it change my files?" reads.
- **Raised by:** C3 F1 (CONFIRMED, level 3); c4-1 guess 1 and c4-2 guess 1 (both substituted the checkout path for `Nowely/agent-skills` and wished the page said so); lens 2 P1; lens 1 F6. 4 lenses, 5 reports. Evidence for P1 (mine): c5-2 answered Q2 from "Where it writes" alone and gave this checkout's answer.
- **Check:** C3: `python3 "$P/run.py" published-marketplace-add claude plugin marketplace add Nowely/agent-skills; python3 "$P/run.py" published-install claude plugin install terse@nowely` → `installed_plugins.json` `gitCommitSha: 8c041b76…`, version 0.1.1; fetched `rewrite/SKILL.md:66-67` says `research/<date>-<slug>/` in the document's repository. Lens 2: `sed -n '58,69p;73,82p' $R/02-grafts.md`. c4-1 commands 10-11, c4-2 commands 6-7 (`claude plugin marketplace add /Users/ruliny/Git/agent-skills` then install, exit 0, 0).
- **Category:** SCOPE (the durable fix is a release — the owner's) with a STRUCTURE facet (P1).
- **Edit (mine, from the task readers' wish; level 3 by c4-1, c4-2, lens 1 `cc3`, `probe-02/uninstall-probe.sh`, the audit's TA):** after L63-64: "To install this checkout instead, give its path in place of `Nowely/agent-skills`." Installed that way the plugin is `terse@nowely`, its data directory `plugins/data/terse-nowely`, and L73-82 hold. Do not offer `--plugin-dir` for this: L6-05 shows its data directory is `terse-inline` and `uninstall` refuses it. For P1: repeat one sentence at the head of "Where it writes" ("This section describes commit `2f29a8f`; the published `8c041b7` writes into your repository.") — writing-rules.md:21-22 allows the repeat at an independently reached decision; UNSETTLED which of the two places carries it.

### L6-05. "from a checkout" → `${TMPDIR:-/tmp}/terse` is false for a checkout loaded with `--plugin-dir`
- **Lines:** L73-74 — "…or under `${TMPDIR:-/tmp}/terse` from a checkout…"; L81-82 — "From a checkout, the operating system may purge the runs in the temporary directory."
- **Finding:** with `claude --plugin-dir plugins/terse` the plugin loads as `terse@inline`, `${CLAUDE_PLUGIN_DATA}` is substituted to `…/plugins/data/terse-inline`, that directory is created, and `claude plugin uninstall terse@inline` exits 1 "cannot be uninstalled" — so those runs are neither in the temporary directory nor removable by uninstall; the fallback holds only for a `.claude/skills` copy and for a page followed by hand.
- **Raised by:** lens 1 F8 (FALSE, level 3). 1 lens. Against it: the verifier held R02a and G3b (G3b at L2~, provisional) on the page text (`audit/SKILL.md:33, 36-38`), which says the same as the README.
- **Check:** lens 1: `env -i HOME=$T/home4 PATH=/usr/bin:/bin:/usr/sbin:/sbin TMPDIR=$T/tmp4/ CLAUDE_CONFIG_DIR=$T/cc4 claude.exe -p "/terse:audit" --plugin-dir /Users/ruliny/Git/agent-skills/plugins/terse --output-format stream-json --verbose` (cwd `$T/work4`, not logged in, cost 0): init event `"source":"terse@inline"`, skill body `D="$T/cc4/plugins/data/terse-inline"`, directory created; `claude plugin uninstall terse@inline` exit 1; a stub run survived. Counter-cases: `$T/cc5` (`.claude/skills` copy) keeps `D="${CLAUDE_PLUGIN_DATA}"` literal.
- **Category:** CODE (lens 1 note a: `audit/SKILL.md:36-38` "`D` is empty when this skill runs from a source checkout", and the lifetime sentences `audit/SKILL.md:39-42`, `rewrite/SKILL.md:74-77`, are wrong for `--plugin-dir`) — not in ISSUES.md; route to `code-defects.md`. SENTENCE consequence: the README's "from a checkout" is the page's word and overbroad.
- **Edit (mine):** state the formula, not the route: L73-74 "…under the plugin data directory, or under `${TMPDIR:-/tmp}/terse` when no data directory is set, …"; L81-82 "In the temporary directory the operating system may purge the runs." True in every case lens 1 ran. Re-pin R02a and G3b.

### L6-06. The uninstall sentence: `marketplace remove` also deletes the runs (no `--keep-data`), and `uninstall` deletes only from the last scope
- **Lines:** L80-81 — "Installed, `claude plugin uninstall` deletes the plugin data directory and the runs in it unless you pass `--keep-data`."
- **Finding:** `claude plugin marketplace remove nowely` deletes the data directory and the runs too and has no `--keep-data` (F10, UNDERSTATED); the directory goes only when the plugin is uninstalled from the last scope it is installed in (F9, OVERSTATED).
- **Raised by:** lens 1 F10 and F9 (both level 3). 1 lens. The verifier's G3a HOLDS (level 3) covered the single-scope uninstall only (`probe-02/uninstall-probe.sh`).
- **Check:** lens 1, `$T/cc1`: with a stub run under `plugins/data/terse-nowely`: `marketplace remove` exit 0, directory gone, `plugin list` empty; installed at user and project scope, `uninstall --scope user` keeps the directory, a following `uninstall --scope project` removes it; docs: "deleted automatically when you uninstall the plugin from the last scope where it is installed".
- **Category:** SENTENCE; CODE side (lens 1 note a): the two pages' lifetime sentences omit both.
- **Edit (mine):** "Installed, `claude plugin uninstall` deletes the plugin data directory and the runs in it unless you pass `--keep-data`; `claude plugin marketplace remove` deletes them too and has no such flag." F9's last-scope rule: the profile's reader installs alone; the owner's rule is no caveats → say nothing in the README, put it on the pages. UNSETTLED. Re-pin G3a.

### L6-07. "is vetoed" names a guarantee the page elsewhere denies, and the veto is one bake-off row
- **Lines:** L90 — "A candidate that cuts or weakens a condition, limit, or warning where a reader decides is vetoed." against L43 — "That guard is not a promise that no regression can occur."
- **Finding:** the veto is a row of the judging sheet (`bake-off.md:108-114`) applied once; later rounds face no veto — the gate counts a regression as an introduced sentence shown false (`loop.md:52-55`, `rewrite/SKILL.md:181-182`), a deletion is not that, and `ledger.mjs` catches a cut only if the sentence was pinned; the page names no mechanism for L90, and the one it names (L42) it calls no guarantee.
- **Raised by:** lens 1 F11 (OVERSTATED scope, level 2); lens 2 P4 (weak contradiction). 2 lenses.
- **Check:** lens 1: `sed -n '108,114p' plugins/terse/skills/rewrite/references/bake-off.md; sed -n '52,55p' plugins/terse/skills/rewrite/references/loop.md; sed -n '181,182p' plugins/terse/skills/rewrite/SKILL.md`. Lens 2: `sed -n '42,43p;90p' $R/02-grafts.md`.
- **Category:** SENTENCE. CODE side (lens 1 note c): `bake-off.md:114` vetoes any weakened condition with no exception for a false one while `:61-62` tells the writer to correct what is wrong; the README's L90-91 pair carries the same tension.
- **Edit (mine):** "The rules forbid cutting or weakening a condition, limit, or warning where a reader decides (writing-rules.md:21), and the bake-off vetoes a candidate that does." C27 (retired) is not revived.

### L6-08. "no individual reader records" — the before-readers are recorded one by one
- **Lines:** L98-99 — "The experiment had no no-document arm, and the repository has no individual reader records for it."
- **Finding:** `research/2026-09-10-chain/chain-source-prompt.txt:103-132` records the six "before" readers one by one (question, verdict — 3 correct, 2 wrong, 1 partial — the lines quoted, the one departure); no record of the "after" readers exists.
- **Raised by:** lens 1 F12 (FALSE for the first half, level 2). 1 lens. Against it: the verifier's C44 HOLDS (third read) on `ISSUES.md` E7's wording "no per-reader record", and E7 itself ("summaries of the reader run, not the readers' returns").
- **Check:** `sed -n '103,132p' research/2026-09-10-chain/chain-source-prompt.txt`; `grep -rn '6/6' research/2026-09-10-chain` → only unrelated hits in `run-2x5/`. Reproduced: the block is there.
- **Category:** UNSETTLED — the word "records": :103-132 is the chain author's per-reader account inside the next pass's prompt, not a reader's return; both readings are defensible, and E7 already draws the line at "returns".
- **Edit (mine):** "…and the repository holds no reader's return for it." — true under both readings and E7's own word. Re-pin C44 (L2).

### L6-09. Later rounds do not check tasks and questions every round
- **Lines:** L37-38 — "Later rounds edit the selected candidate and check its ledger, task outcomes, and reader questions."
- **Finding:** only the ledger runs every round; lenses 4 and 5 are sized by the user and "may be zero; the least that still counts as a round is lenses 1 and 2" (`rewrite/SKILL.md:131-133`); tasks and questions are required at the gate before the owner reads a round (`:179-186`).
- **Raised by:** lens 1 F3 (OVERSTATED minor, level 2). 1 lens.
- **Check:** `sed -n '131,133p;179,186p' plugins/terse/skills/rewrite/SKILL.md`.
- **Category:** SENTENCE.
- **Edit (mine):** "Later rounds edit the selected candidate; the ledger is checked every round, task outcomes and reader questions before a round reaches you."

### L6-10. The retired-wording check is case-sensitive, so retired wording with a capital passes
- **Lines:** L42-43 — "The shipped check rejects a new round that loses a pinned sentence or restores wording retired as false. That guard is not a promise that no regression can occur."
- **Finding:** a retired pattern is a case-sensitive regex — `ledger.mjs:19` reads an optional `flags` field that neither `round.mjs:118` nor `ledger-seed.mjs:61-62` writes — so "Nothing else is needed." passes where "nothing else is needed." is caught; the miss M8 records (`measurements.md:44-46`).
- **Raised by:** lens 1 F4 (level 3). 1 lens.
- **Check:** ledger `[{"name":"pinned","pattern":"requires your word","want":true,"level":2},{"name":"retired","pattern":"nothing else is needed","want":false}]`; `node $S/ledger.mjs ledger.json 00.md 01.md 02.md` with 02 containing "Nothing else is needed." → exit 0; lower case → exit 1 YES. Reproduced under `$T/f4`.
- **Category:** CODE — not in ISSUES.md (E1–E13); route to `code-defects.md`. The README's L43 already denies the guarantee; no README edit.

### L6-11. A document with no eligible claim cannot be seeded on the audit route
- **Lines:** L4-5 (scope: any Markdown, about software or not) with L29-30 — "Its behaviour ledger excludes voice and ordering, illustrative examples, arguments for instructions, and recipes for tools the repository does not ship."
- **Finding:** a document made only of excluded categories has an empty claim ledger; `ledger-seed.mjs:42` refuses a ledger with no `### C..` entries (exit 1, no output), and the audit route to `rewrite` requires that seed (`rewrite/SKILL.md:103-106`; the empty-ledger start is the skeleton route's only).
- **Raised by:** C3 F2 (CONFIRMED, level 3). 1 lens.
- **Check:** `node $A/ledger-seed.mjs "$P/empty-audit.md" "$P/seed-output.json"` → exit 1 "no ### C.. entries under ## Claim ledger…"; output absent. Reproduced under `$T/c3f2`.
- **Category:** CODE — route to `code-defects.md`. The README cannot fix it; the scope sentence stays (the owner's stated intent).

### L6-12. "forbid writing into the audited repository" against the audit's own score-storing exception
- **Lines:** L73-74 — "The `audit` instructions … forbid writing into the audited repository."
- **Finding:** `audit/SKILL.md:44` forbids it and `measure.md:117-121` allows storing the score there on the user's word — ISSUES.md E12; a README repeating either is refuted by the other (E12's own words).
- **Raised by:** lens 1 F7 (OVERSTATED, level 2). 1 lens. The verifier's R02a HOLDS read `audit/SKILL.md:44` only.
- **Check:** `sed -n '44p' plugins/terse/skills/audit/SKILL.md; sed -n '117,121p' plugins/terse/skills/audit/references/measure.md`.
- **Category:** CODE (recorded, E12). The README sentence is attributed to "the instructions" and is true of `:44`; nothing to do in the README until E12 is settled.

### L6-13. `rule1.mjs` misses a bare `PATH` and the braced `${TMPDIR:-/tmp}` form
- **Lines:** L53 `PATH`, L74 `${TMPDIR:-/tmp}/terse` (both after the cut in round 02).
- **Finding:** the environment-variable pattern (`rule1.mjs:28`) catches `$TMPDIR` and not `PATH` or `${TMPDIR:-/tmp}`, so round 02's clean verdict rests on the section's move alone; a later round that moved L53 or L73-74 above "Install" would still pass; `selftest.mjs:13` plants only a flag and a tilde path.
- **Raised by:** lens 2 R6 (METHOD in its words; level 3). 1 lens.
- **Check:** `printf 'put Node 22 or newer on `PATH`\nunder `${TMPDIR:-/tmp}/terse` from a checkout\nunder `$TMPDIR/terse` from a checkout\nunless you pass `--keep-data`\n\n## How it works\n\nnothing\n' > planted.md; node $S/rule1.mjs planted.md` → lines 3 and 4 only, exit 1. Reproduced under `$T/r6`.
- **Category:** CODE — a script defect, not in ISSUES.md (E8 is the exit-code pattern); route to `code-defects.md`. The skeleton decision (move for rule 1) still stands: `--keep-data` at L81 fires without the cut (reproduced).

### L6-14. `concepts.json` is stale: five patterns match nothing although the idea is on the page
- **Lines:** L4, L19, L28-29, L73-82, L76-77.
- **Finding:** "claims checked against the code", "audit never proposes wording", "nothing written to your files without your word", "run directory location" report 0 and "three skills, user-invoked" misses L19, so `dup.mjs`'s zeros are blind, not clean; widened patterns flag "your word" in three sections, which are three different facts (not a finding).
- **Raised by:** lens 2 R7 (level 3). 1 lens.
- **Check:** `node $S/dup.mjs $R/02-grafts.md $R/concepts.json` (four zeros, reproduced); `node $S/dup.mjs $R/02-grafts.md $T/concepts-widened.json` (lens 2's file, 13 patterns; not in the run directory).
- **Category:** METHOD — the run's own instrument; widen the patterns in `$R/concepts.json` before the next round.

### L6-15. The README's bake-off numbers against `writing-rules.md` and `measurements.md`
- **Lines:** L104-108 against `writing-rules.md:37-40` ("five … standards", "seven of the ten proposed nothing"), `measurements.md:97-99` (M19).
- **Finding:** two plugin pages restate the numbers the audit refuted (C39, C41); the README's set is the one lens 1 confirmed at level 2 (F13 aside).
- **Raised by:** lens 2 X1 (fact left to lens 1); lens 1 confirms the README's counts (`o8eHzS6U.answer.md:10-19`, `v04PR6HL.prompt.txt:13-20`). = ISSUES.md E6.
- **Check:** `sed -n 37,40p plugins/terse/skills/rewrite/references/writing-rules.md; sed -n 104,108p $R/02-grafts.md`.
- **Category:** CODE (recorded, E6). Observation (mine, level 2): E6 says the correction changes the frozen block's SHA; `writing-rules.md:29-31` computes the SHA "over the block alone" (lines 6-25), so a correction at :37-40 leaves it unchanged — E6's wording overstates; for the owner, not fixed here.

### L6-16. "the chain" and its passes are never defined
- **Lines:** L87 "the chain moved 2,725 words to 2,571", L88 "the second pass … the third", L98 "The chain covered one README.", L110 "which pass produced the reported answer gain".
- **Finding:** no line says what the chain is or how many passes it has; the original said "The four-pass chain" (00:66).
- **Raised by:** lens 2 R2. 1 lens.
- **Check:** `grep -n -E "chain|\bpass\b" $R/02-grafts.md` → 6, 81, 87, 88, 98, 110.
- **Category:** SENTENCE (stage 2 term).
- **Edit (mine):** first use, L87: "the four-pass chain"; or at L98: "A four-pass rewrite chain covered one README." L87-88 is C24 (L3) → re-pin if changed there.

### L6-17. The five failure labels are undefined, and "placement" collides with "excludes ordering"
- **Lines:** L27-28 — "A wrong answer is classified as refuted, missing, placement, findability, or harmful."; L29 — "Its behaviour ledger excludes voice and ordering".
- **Finding:** none of the five is defined, "placement" and "findability" appear nowhere else and are opaque to a reader who is not an engineer (the original gave each cause in plain words, 00:19-21); and if "placement" means where a true sentence sits, audit does report ordering failures while its ledger "excludes ordering" — two instruments the page does not distinguish.
- **Raised by:** lens 2 R3 and P5 (weak, depends on R3). 1 lens.
- **Check:** `grep -n -E "placement|findability" $R/02-grafts.md` → 28 only; `sed -n 27,30p $R/02-grafts.md`.
- **Category:** SENTENCE.
- **Edit (mine):** "A wrong answer gets a cause: the text lied, the answer was nowhere, a true sentence sat where it misleads, it was there and not found, or every sentence was true and the sequence left the reader worse off." (~35 words; "What each one does" is 21 under budget.) L27-28 is C07 (L2) → re-pin. For P5: L29 "Its behaviour ledger" → "The claim ledger".

### L6-18. "bake-off" names the 2026-09-10 experiment at L104 and rewrite's own step at L110, and L36-37 never calls the step that
- **Lines:** L36-37 — "For an existing document, an adversarial read precedes three whole-file candidates and two judges."; L104; L110 — "or whether a bake-off beats one careful pass."
- **Finding:** the reader cannot tie the limit at L110 to rewrite's step.
- **Raised by:** lens 2 R4. 1 lens.
- **Check:** `grep -n -E "bake-off|whole-file candidates" $R/02-grafts.md` → 37, 104, 110.
- **Category:** SENTENCE.
- **Edit (mine):** L36-37 "…an adversarial read precedes a bake-off: three whole-file candidates and two judges."

### L6-19. One instrument under three names: "claim ledger", "ledger", "behaviour ledger", "its ledger"
- **Lines:** L23, L27, L29, L38.
- **Finding:** the reader cannot tell whether L29's ledger is L23's, or whether rewrite's (L38) is audit's — it is: `rewrite/SKILL.md:103-106` seeds it from the audit's.
- **Raised by:** lens 2 R5. 1 lens.
- **Check:** `grep -n "ledger" $R/02-grafts.md` → 23, 27, 29, 38.
- **Category:** SENTENCE.
- **Edit (mine):** L29 "That ledger excludes…"; L38 "check the ledger seeded from the audit".

### L6-20. Water W1: L10-11 repeats the diagram
- **Lines:** L10-11 — "Both feed `/terse:rewrite`; audit the candidate again to see whether it held up."
- **Finding:** the diagram (L14-16) already shows both routes, the re-audit and "did it hold"; 13 words.
- **Raised by:** lens 2 W1. 1 lens.
- **Check:** NO CHECK (a reading).
- **Category:** SENTENCE.
- **Edit (lens 2):** cut L10-11. Its alternative — cut the diagram — is blocked: the diagram is a protected passage (brief part 5: "README.md:11, the pipeline line — Q3 right, the only place the order is stated") and pinned as C05; c5-3 answered Q3 from L9.

### L6-21. Water W3: the return contract named to a reader who never meets it
- **Lines:** L40-42 — "The return contract calls for every cut of twenty words or more to have a reason, and for declared behavioural claims to record their source and evidence."
- **Raised by:** lens 2 W3 (7 words). 1 lens. **Check:** NO CHECK. **Category:** SENTENCE.
- **Edit (lens 2):** "Every cut of twenty words or more must carry a reason, and every declared behavioural claim its source and evidence." (`rewrite/SKILL.md:205` backs "every cut".)

### L6-22. Water W4: two sentences on rewrite's run
- **Lines:** L74-76 — "The `rewrite` instructions create their run there too. They instruct the agent to record a code defect in `code-defects.md` in the run and offer it to you."
- **Raised by:** lens 2 W4 (7 words). 1 lens. **Check:** NO CHECK. **Category:** SENTENCE.
- **Edit (lens 2):** "The `rewrite` instructions put their run there too, with a code defect recorded in its `code-defects.md` and offered to you." Pins C15 and R02c are these two sentences → re-pin both.

### L6-23. Water W7: the hedge "From those reported counts" repeats L99
- **Lines:** L101-102 — "From those reported counts, three improvements and no reversals give exact two-sided McNemar *p* = 0.25."
- **Raised by:** lens 2 W7 (4 words). 1 lens. **Check:** NO CHECK. **Category:** SENTENCE.
- **Edit (lens 2):** "Three improvements and no reversals give…". The sentence is C33 (L3) → re-pin. Note lens 1: the "after" counts reach level 1 only (no record), which is what the hedge marked; L99 "Its pages report" keeps that.

### L6-24. Water W8: "The intended scope is"
- **Lines:** L4-5 — "The intended scope is Markdown in any language, whether or not the document is about software."
- **Raised by:** lens 2 W8 (4 words). 1 lens. Lens 1 (not a finding): the claim reaches level 1 — no plugin page states it; the owner's intent is recorded only in `ISSUES.md:113-114`. **Check:** NO CHECK. **Category:** SENTENCE.
- **Edit (lens 2):** "It is meant for Markdown in any language, about software or not." See L6-33 for the key.

### L6-25. Which register: "the instructions say" against direct statement
- **Lines:** L40 "The instructions say to hand over…", L40 "The return contract calls for", L73 "The `audit` instructions", L74 "The `rewrite` instructions", L75 "They instruct the agent" — against L23-38 and L48, which state behaviour directly.
- **Finding:** a reader may take the attributed claims for the weaker ones; lens 2 leaves to lens 1 whether the attribution is what keeps a claim true — and lens 1's F7 and F8 show that at L73-74 it is (the page forbids, and is contradicted by `measure.md`; the page says "from a checkout", and is wrong for `--plugin-dir`).
- **Raised by:** lens 2 W9 (3 words). 1 lens; bears on lens 1 F7, F8.
- **Check:** NO CHECK.
- **Category:** UNSETTLED — one register for the page is the coordinator's call; a direct register at L73-74 needs L6-05's formula wording and E12 settled first.

### L6-26. "measures" understates: two of three skills write
- **Lines:** L3-4 — "`terse` is a Claude Code plugin that measures whether readers get the right answer and whether a document's claims agree with the code behind it."
- **Raised by:** lens 1 F1 (UNDERSTATED minor, level 2). 1 lens.
- **Check:** `sed -n '4p' plugins/terse/.claude-plugin/plugin.json; sed -n '3,7p' plugins/terse/skills/rewrite/SKILL.md`.
- **Category:** SENTENCE.
- **Edit (mine):** append "…and rewrites what it measured, in rounds you read." C01 (L2) is this sentence → re-pin. Low: the next paragraph (L9-11) says the same.

### L6-27. Re-auditing the candidate is shown as a direct step the code does not support
- **Lines:** L11 "audit the candidate again", L15 "candidate + diff → /terse:audit again", L45-46.
- **Finding:** the candidate sits in the run directory outside the repository (`rewrite/SKILL.md:66`); the audit's readers open only the repository's `.md` from the entry file (`measure.md:49-50`); so it is at the entry file only after applying, which needs the user's word (`:191-192`); the README names neither the apply step nor the consequence.
- **Raised by:** lens 1 F2 (OVERSTATED, level 2). 1 lens.
- **Check:** `sed -n '66p;191,192p' plugins/terse/skills/rewrite/SKILL.md; sed -n '49,50p' plugins/terse/skills/audit/references/measure.md`.
- **Category:** SUPERSEDED — round 02's record settled it before this read: the placement sentence was cut on the verifier's R02f1, the gap went to `code-defects.md` D1 (which names the README's pipeline line explicitly), and "the README may not state what no page states" (`grafts.md:27-36`). The diagram is a protected passage (brief part 5) and pinned (C05). Re-open only if the owner adopts D1.

### L6-28. Two task readers wished the installed run path were named
- **Lines:** L73 — "…create the run under the plugin data directory when installed…"
- **Finding:** both task readers could mark the run "outside the repository" and not name it; the path is `plugins/data/terse-nowely/runs/<timestamp>-<slug>` under Claude Code's configuration directory.
- **Raised by:** c4-1 guess 4, c4-2 guess 4. 1 lens (4), 2 readers. Evidence at level 3: lens 1 `$T/cc3` (audit body `D=".../plugins/data/terse-nowely"`), `probe-02/uninstall-probe.sh` (plants and observes that path).
- **Check:** `sh $R/probe-02/uninstall-probe.sh` (isolated config; prints the state lines).
- **Category:** SENTENCE ("Where it writes" is after the rule-1 cut; a path is allowed there).
- **Edit (mine):** L73 "…under the plugin data directory (`plugins/data/terse-nowely/runs/` in Claude Code's configuration directory) when installed…". Re-pin R02a.

### L6-29. Two task readers guessed the invocation syntax of `audit` and `rewrite`
- **Lines:** L9 "Start with `/terse:audit`…", L36 "starts from that skeleton or an audit run".
- **Finding:** c4-1 guessed `/terse:audit README.md`; c4-2 guessed `/terse:rewrite /abs/path/audit.md`; no page defines an argument — `audit` settles files, repository and entry file "with the user in one exchange" (`audit/SKILL.md:23-28`; the 2026-09-22 task reader TA reached that exchange live) and `rewrite` "is given that path by the user" (`audit/SKILL.md:38-39`).
- **Raised by:** c4-1 guess 2, c4-2 guess 3. 1 lens (4), 2 readers.
- **Check:** NO CHECK (both readers stopped at login; `audit.md` "Task readers", TA, level 3 on 2026-09-22).
- **Category:** SCOPE — the pages define no syntax; the README can only say what each skill asks first.
- **Edit (mine, optional):** "`/terse:audit` first asks which files are the documentation, which repository backs them, and where a reader arrives; `/terse:rewrite` asks for the run path the audit reported."

### L6-30. "You decide when a round is ready to send" read as an approval at every round
- **Lines:** L38 — "You decide when a round is ready to send."
- **Finding:** the reader planned to approve every round; the page waits for the user's word before each wave (`rewrite/SKILL.md:131-132`) and stops when the user reads a round and says whether they would send it (`:188`).
- **Raised by:** c4-2 guess 5. 1 reader. **Check:** NO CHECK. **Category:** SENTENCE, low.
- **Edit (mine):** "Each wave of critics waits for your word; the loop stops when you read a round and say you would send it."

### L6-31. "What was measured" points at no record
- **Lines:** L94-110.
- **Finding:** the page has zero Markdown links (the original linked `references/prior-art.md`, 00:86, inside a refuted sentence), so a reader who wants the two judges' prompts has no pointer.
- **Raised by:** C3 D2/E (navigation gap, stated as not adding to its count). 1 lens.
- **Check:** C3 `verified-facts.json` (link extraction over 114 lines → 0).
- **Category:** STRUCTURE, low.
- **Edit (mine):** L96 "Two experiments ran on 2026-09-10; their records are in `research/2026-09-10-chain/`. Read them as pilots, not rates." (After the cut; a repository path, not absolute.)

### L6-32. Task-reader guesses outside the README's scope
- **Items:** c4-1 guess 3 (a fresh `CLAUDE_CONFIG_DIR` needs first-run setup and authentication — the task's isolation, not the reader's machine); c4-2 guess 2 (the audit run-file schema — the reader synthesised an audit, which a user never does).
- **Raised by:** c4-1, c4-2. **Check:** NO CHECK. **Category:** SCOPE. No edit.

### L6-33. YOURS — Q7's key under the new text
- **Lines:** L4-5; L24 "Readers start at the entry file and may open only Markdown."
- **Finding (mine, implied by c5-7 + lens 1's level-1 note + E8):** the audit keyed Q7 as unanswerable from the documentation ("a confident yes or no is a failure"); round 02's README now states the scope, and c5-7 answered "Yes" from L4-5 and L24; whether that is now right needs the coordinator's key, and E8 (rule1's exit-code words are English) means the mechanical checks do not treat Russian "the same way" even if the readers do.
- **Raised by:** c5-7 (answer), lens 1 level-1 item 1. **Check:** `sed -n '953,964p' $R/audit.md` (the key); `cat $R/reviews/02/c5-7.md`.
- **Category:** UNSETTLED.

### L6-34. Audit step 5b gives task readers no isolation
- **Lines:** none in the README (L24-25 "task readers try workflows from the documentation alone").
- **Finding:** `audit/SKILL.md:107-116` names no state under `$TMPDIR` and no isolated configuration; rewrite's lens-4 brief has both (`critic-briefs.md:141-142`).
- **Raised by:** lens 1 note b (level 2; "not a finding" in its words). **Check:** `sed -n '107,116p' plugins/terse/skills/audit/SKILL.md; sed -n '141,142p' plugins/terse/skills/rewrite/references/critic-briefs.md`.
- **Category:** CODE — route to `code-defects.md`.

### L6-35. Evidence for E10: the installed skill body carries its base directory and substitutes `${CLAUDE_SKILL_DIR}`
- **Finding:** the skill body the model receives begins "Base directory for this skill: <absolute path>" (transcripts `$T/cc3`, `$T/cc4`), and the binary substitutes `${CLAUDE_SKILL_DIR}` in skill mode — the fix E10 proposes is available.
- **Raised by:** lens 1 note d (level 3 prefix, level 2 substitution). **Check:** the transcripts named; `strings` over the 2.1.280 binary (`getPromptForCommand`).
- **Category:** CODE (recorded, E10; adds evidence).

---

## Conflicts between critics

1. **Lens 1 F12 against the verifier's C44 (HOLDS, third read) and ISSUES.md E7** — L98-99 "no individual reader records". F12: `chain-source-prompt.txt:103-132` is a per-reader account of the before-arm (verdict, quotes, the departure). Verifier: E7's line is "no per-reader record… not the readers' returns", and the run identifies the archived summaries as summaries. Resolution: the contested word is "records"; "return" satisfies both (L6-08).
2. **Lens 1 F13 against lens 2 P3** — not a conflict on the count (three published, both say "two" is wrong or unexplained); they differ on "both entries": lens 1 reads it as both entries of each (four) and shows the verdict holds; lens 2 reads it as two. The edit in L6-01 removes both readings.
3. **Lens 1 F7 against the verifier's R02a (HOLDS)** — the verifier read `audit/SKILL.md:44`; lens 1 read `measure.md:117-121` too; E12 records the pages' disagreement. The README's attributed sentence is true of `:44` and refuted by `measure.md` (E12's own wording).
4. **Lens 1 F8 against the verifier's R02a and G3b (HOLDS, G3b L2~)** — level 2 page reading against a level-3 run; the brief's accuracy floor says a lifecycle claim at level 2 is a guess, and G3b was marked provisional for that reason. Lens 1 wins on level; the pages are wrong with the README.
5. **Lens 1 F9/F10 against the verifier's G3a (HOLDS, level 3)** — not contradictory: the probe ran single-scope uninstall with and without `--keep-data`; F9/F10 add two cases the probe did not run.
6. **Lens 1 F5 and c4-2 against lens 2's safeguard skip of L53** — lens 2 kept "sign in to it" as a condition at the install decision; the two runs show it is not a condition of installing. writing-rules.md:21 protects a true condition; L90-91 lets a false one be corrected. Move it to the run decision (L6-02).
7. **Lens 2 W9 against lens 1 F7/F8** — dropping "the instructions say" makes L73-74 false for `--plugin-dir` and for E12's exception; keeping it leaves two registers on one page (L6-25).
8. **Lens 2 W1's alternative (cut the diagram) against the protected-passages list and pin C05** — the diagram stays.
9. **C3 B ("no strict internal contradiction") against lens 2 P1–P5** — a threshold difference: lens 2's pairs are tensions and ambiguities; C3 reads L66-69 as resolving P1. Both agree the boundary sentence is what carries the weight.
10. **c5-7's "Yes" against the audit's Q7 key ("unanswerable")** — the text changed under the key (L6-33).

## What the wave did not cover

- **The task gate is not met by this wave**: both task readers stopped at Claude Code's login (c4-1 exit 1 "Not logged in"; c4-2 blocked at the OAuth prompt), 0 of 2 goals reached. Sections no task reached: "What it will and will not do to your text", "What was measured", "Licence", and in "What each one does" the rethink and rounds paragraphs (c4-2 planned from "Where it writes" and L38 only).
- **No authenticated skill run anywhere in the wave** (lens 1, C3, c4-1, c4-2 all cost 0): G1 (announce-and-wait), the audit's first question, the hand-over and the live run path stay at level 2 or at the 2026-09-22 audit's TA.
- The in-app `/plugin …` route (lens 1 open); the operating system's purge of `$TMPDIR` (not observable); the "after" readers (no record exists, so L99-101 stays at level 1); L105 "Models were hidden" (the dossier is not in the repository); L96 "Two experiments" (directory names only).
- The Node 22 floor: declared, not enforced (`selftest.mjs` passed under 20.16.0); nobody checked whether a skill needs 22.
- `stages.md` content rules (rule 10: the fences at L13 and L58 are untagged, and the in-app form is fenced while the shell form is prose; rule 2: warnings in the opening at L5-7 and L42-43) — not applied, no skeleton adopts them (lens 2 open).
- The curse-of-knowledge pass on jargon ("return contract", "gates", "arm", "adversarial read", "pinned") — no critic in this wave.
- `ledger.mjs` after any edit above: W2 (G4), W4 (C15, R02c), W7 (C33), L6-05 (R02a, G3b), L6-06 (G3a), L6-08 (C44), L6-16 (C24), L6-17 (C07), L6-26 (C01), L6-28 (R02a) each break a pin and need a re-pin in `edits/03.json`.
- Whether Q7's key changes with the new text (L6-33).

## Count by category (primary)

| Category | Entries |
|---|---|
| SENTENCE | 18 — L6-01, 02, 03, 06, 07, 09, 16, 17, 18, 19, 20, 21, 22, 23, 24, 26, 28, 30 |
| CODE | 8 — L6-05, 10, 11, 12, 13, 15, 34, 35 (recorded already: 12 = E12, 15 = E6, 35 = E10; new for `code-defects.md`: 05, 10, 11, 13, 34, and 06/07's page sides) |
| SCOPE | 3 — L6-04, 29, 32 |
| UNSETTLED | 3 — L6-08, 25, 33 |
| STRUCTURE | 1 — L6-31 (L6-04 has a STRUCTURE facet) |
| METHOD | 1 — L6-14 |
| SUPERSEDED | 1 — L6-27 |
| **Total** | **35** |

Ledger of raised → merged: lens 1 F1→26, F2→27, F3→09, F4→10, F5→02, F6→03+04, F7→12, F8→05, F9+F10→06, F11→07, F12→08, F13+F14→01; notes a→05/06, b→34, c→07, d→35. Lens 2 R1→03, R2→16, R3→17, R4→18, R5→19, R6→13, R7→14, W1→20, W2→03, W3→21, W4→22, W5+W6→02, W7→23, W8→24, W9→25, P1→04, P2→03, P3→01, P4→07, P5→17, X1→15. C3 F1→04, F2→11, F3→01, D/E→31. c4-1 g1→04, g2→29, g3→32, g4→28. c4-2 g1→04, g2→32, g3→29, g4→28, g5→30, untrue→02. c5-1..7: no findings (7/7 answered; c5-4 needed two sections; c5-7 see 33).
