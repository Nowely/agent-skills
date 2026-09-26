# Lens 6 — dedup and rank of the round-03 wave on `03-review.md`

Fable (claude-fable-5-1), 2026-09-23. Document: `$R/03-review.md`, 126 lines, SHA-256
`366210288342aa9edce8d74424b7521d8730e422bc27236acfa2b3e92f84159b`. Code: `~/Git/agent-skills`,
branch `terse-process-2026-09-22`, HEAD `bdac0ef` (one commit after the `1af4160` the brief names: the
round-03 record itself, 32 files under `research/`; `git diff --stat 2f29a8f HEAD -- plugins/terse` is
empty, `git status --short` empty). Line numbers are `cat -n` lines of `03-review.md`. `$R` = the run
directory, `$S` = `plugins/terse/skills/rewrite/scripts`, `$P` = `plugins/terse`.

Inputs: 9 critic reports (`reviews/03/lens1-opus.md`, 6 findings F1–F6 + 5 notes P1–P5 + 2 level-1 items;
`lens2-opus.md`, 12 findings R1–R4 W1–W2 P1–P6 + 3 check notes + 4 "noted, not counted" + 1 skipped item
whose condition I resolved; `c5-1..7`, 7 answers, 2 GUESSED), 2 verifier reads (`verifier-sol-v2.md`,
`verifier-sol-v2b.md`; context) and `verifier-sol-1.md`; the record (`skeleton.md` decisions (a)–(e),
`rounds.md`, `code-defects.md` D1–D6, `edits/03.json` 21 edits / 24 claims, `ledger.json` 51 entries:
40 pinned, 11 retired, 0 provisional, `diff -u 02-grafts.md 03-review.md` run here); `reviews/02/`
`lens6-fable-dedup.md` (35), `routing.md`, `c5-1..7`; `ISSUES.md` E1–E14; `00-original.md`; the audit's
key and reader rows for Q5–Q7 (`audit.md:924-960, 980-985`); `research/2026-09-10-chain/README.md:1-34`,
`research/README.md:5-12`; the page lines the critics cite (listed under *Reproduced*).

**Raised: 33** (lens 1: 11; lens 2: 20; readers: 2 GUESSED). **Deduplicated: 29. Raised by two or more
lenses: 6** (L6.3-01, 02, 03, 04, 05, 06). Plus 1 carried item outside the count (L6.3-30).

Rank = lenses that raised it, then the level of the check (a run over a read), then whether it overturns
a pinned sentence. "Edit (mine)" = wording composed here from the critic's evidence; the finding is the
critic's. YOURS marks the two places where evidence of mine, not a critic's, is load-bearing.

Reproduced here (exit codes as stated): lens 2's four runs on 03 — `node $S/rule1.mjs $R/03-review.md
--cut Install --except Install` → 0 violations, exit 0; `node $S/dup.mjs $R/03-review.md $R/concepts.json`
→ 1 concept in three or more sections ("rethink stops at a skeleton"), the 19 rows as lens 2 lists them;
`node $S/sections.mjs $R/03-review.md $R/budgets.json` → 1078 words, 4 sections over (+50, +37, +42, +36);
`node $S/ledger.mjs $R/ledger.json 00 01 02 03` → 0 failures. Lens 2's greps: `` grep -n '`main`' `` → 74;
`grep -n -E "instructions|page|rules forbid"` → 23 34 47 73 74 79 82 83 86 91 100 111; `pinned` → 49,
`retired as false` → 50, `run file` → 15, `four-pass` → 97, `chain` → 97 109, `declared` → 48;
`grep -c '](' ` → 0. Lens 1's `grep -rn -i -E 'reword|rephrase' $P/skills` → 0 hits; `grep -n -i -E
'human|model reader' $R/03-review.md` → 0 hits. Page lines read: rethink/SKILL.md:13-15, 27-32, 76-80;
rewrite/SKILL.md:16-21, 44-47, 52-58, 120-124, 131-133, 177-192; writing-rules.md:12, 15, 21-23, 37-40;
bake-off.md:60-62, 106-114; truth-pass.md:23-25; critic-briefs.md:100-101; CHANGELOG.md:100-103;
prior-art.md:131; audit/SKILL.md:39-42, 86; measure.md:40; loop.md:41, 50-56. Not run: lens 1's
isolated-config CLI runs and stub renders (level 3 in its report; the probes `probe-03/*.sh` exist).

Definition used for the regression column (rewrite/SKILL.md:181-182, loop.md:52-55): a sentence the
round introduced that its critics showed false or overstated. Understated is not counted (rounds.md,
round 02). "Introduced by round 03" is read off `diff -u 02-grafts.md 03-review.md`.

---

## The list, ranked

### L6.3-01. "A writer may reword one or correct it when it is false" — no page grants either
- **Lines:** l101-102 — "A writer may reword one or correct it when it is false." after l100-101 — "The writing rules forbid cutting a condition, limit, or warning where a reader decides, and the bake-off vetoes a candidate that cuts or weakens one."
- **Finding:** no page says "reword" (0 hits over the skills), `writing-rules.md:21` has no exception, `bake-off.md:114` vetoes any weakened warning with no exception for a false one, and the only support for "correct" is the general accuracy floor (`bake-off.md:60-62`, `truth-pass.md:23-25`) — so the README states a permission the pages do not give and its own previous sentence contradicts.
- **Raised by:** lens 1 F6 (OVERSTATED, level 2); lens 2 P2 (contradiction l100 ↔ l101-102). 2 lenses. Round 02's L6-07 named this README pair in its CODE side (lens 1 note c) and the edit applied in round 03 touched only l100-101.
- **Check:** lens 1: `grep -rn -i -E 'reword|rephrase' $P/skills` (0 hits, reproduced); `sed -n '21p' $P/skills/rewrite/references/writing-rules.md; sed -n '60,62p;114p' $P/skills/rewrite/references/bake-off.md; sed -n '23,25p' $P/skills/audit/references/truth-pass.md`. Lens 2: `sed -n '100,102p' $R/03-review.md`.
- **Category:** SENTENCE. CODE side → L6.3-06.
- **Introduced:** earlier — byte-identical at `02-grafts.md:90-91` (no diff hunk), from candidate B. Its wording is the audit key's own: `audit.md:945-946` (Q6) "though it may reword or correct one (C27)". Not pinned (no ledger pattern matches "reword") — free to edit.
- **Edit (mine):** cut the sentence (10 words). The README may not state what no page states (`grafts.md:27-36`); the pages' own conflict goes to `code-defects.md` (L6.3-06). Not a regression of round 03.

### L6.3-02. Install gives no route to the commit the page describes; the published one differs in ten files
- **Lines:** l66-67, l70-71 (the four install commands); l73 — "This page describes commit `2f29a8f`."; l74.
- **Finding:** the only install recipe still resolves the marketplace's `main` at `8c041b7` on 2026-09-23 (both commits call themselves 0.1.1), and `git diff --stat 8c041b7 2f29a8f -- plugins/terse` is 10 files (+487/−50): no `ledger-seed.mjs`, no verifier, `audit` runs no Node, `rewrite` writes into the document's repository — so for the plugin a reader installs, l41-42, l49, l60-61 and l79-92 describe something else, and no line installs `2f29a8f` (`grep -n 2f29a8f` → l73 only).
- **Raised by:** lens 1 F5 (a: level 3 install on 2026-09-23; b: level 2 diff); lens 2 P1 (l85-86 ↔ l74, reconciled only by l73). 2 lenses. = round-02 L6-04 (SCOPE, routed to the owner; decision (d) settled only where the boundary sentence lives, not the install route).
- **Check:** lens 1: `T2=$(mktemp -d); export CLAUDE_CONFIG_DIR=$T2/cfg; claude plugin marketplace add Nowely/agent-skills; claude plugin install terse@nowely; grep gitCommitSha $T2/cfg/plugins/installed_plugins.json` → `8c041b76…`; `git -C ~/Git/agent-skills diff --stat 8c041b7 2f29a8f -- plugins/terse`; `git ls-tree -r --name-only 8c041b7 -- plugins/terse/skills/audit/scripts` → nothing. Lens 2: `grep -n 2f29a8f $R/03-review.md` → 73; `grep -n -E "plugin (marketplace add|install)" $R/03-review.md` → 66 67 70 71.
- **Category:** SCOPE — the durable fix is a release, the owner's. The README-side option is round 02's L6-04 edit, unchanged and still level 3 (c4-1, c4-2, lens 1 `cc3`): after l71, "To install the commit this page describes, give the checkout's path in place of `Nowely/agent-skills`."

### L6.3-03. The boundary sentence names one page and one section where two pages and the whole page differ, and l75 repeats l73
- **Lines:** l73-75 — "This page describes commit `2f29a8f`. At the 2026-09-22 audit, the install commands resolved the marketplace's `main` at `8c041b7`, whose rewrite page wrote into the document repository without asking. The section below describes this commit, not that one."
- **Finding:** at `8c041b7` the audit page also differs — its run line carries `${CLAUDE_PLUGIN_DATA:-…}` unsubstituted, so its runs land in `${TMPDIR:-/tmp}/terse` and l80-81 is false for the install the page gives (lens 1 charges l74-75, not l80-81) — and l75 says in 9 words what l73 already says of the whole page.
- **Raised by:** lens 1 F5 b/c (UNDERSTATED; c at level 3, stub renders under `8c041b7` and `2f29a8f`); lens 2 W1 (cut l75). 2 lenses; compatible.
- **Check:** lens 1: `claude -p "/terse:audit" --max-turns 1` under a local marketplace from `git archive 8c041b7` with `ANTHROPIC_BASE_URL` at a stub → request body carries `RUN="${CLAUDE_PLUGIN_DATA:-${TMPDIR:-/tmp}/terse}/runs/…"` unsubstituted, no `plugins/data/terse-nowely` created; the same under `2f29a8f` → `D="…/plugins/data/terse-nowely"`, directory created. Lens 2: `sed -n '73,75p' $R/03-review.md`.
- **Category:** SENTENCE.
- **Introduced:** round 03 (reworded from `02-grafts.md:66-69`; the claim is round 02's G4, the words round 03's). Understated → not a regression by the definition. Pins: G4 is exactly l75, R03j is l74 → the edit must drop G4 and re-pin R03j.
- **Edit (mine, folding F5 and W1; R1's opening optional, see L6.3-15):** l74-75 → "…resolved the marketplace's `main` at `8c041b7`, whose audit and rewrite pages differ from the ones described here; its rewrite page wrote into the document repository without asking." and cut l75.

### L6.3-04. "pinned sentence" and "wording retired as false" are never defined, and the Q5 reader guessed for that reason
- **Lines:** l49-50 — "The shipped check rejects a new round that loses a pinned sentence or restores wording retired as false. That guard is not a promise that no regression can occur."
- **Finding:** "pinned" occurs once (l49) and "retired as false" once (l50), neither defined; the round-03 Q5 reader ("Will a second pass undo what the first one fixed?") reported GUESSED and "wished the document said whether the second pass specifically preserved the first pass's fixes" — which is what l49 says, in words the reader could not tie to "the first pass's fixes"; the key (`audit.md:926-929`) is "guarded against, not ruled out: every verified sentence is pinned … `ledger.mjs` fails any round that loses a pinned sentence".
- **Raised by:** lens 2 R4 (two of its four terms); c5-5 (GUESSED). 2 lenses (2 and 5).
- **Check:** lens 2: `for t in pinned "retired as false"; do grep -n -i "$t" $R/03-review.md; done` → 49, 50 (reproduced). `cat $R/reviews/03/c5-5.md $R/reviews/02/c5-5.md`; `sed -n '924,931p' $R/audit.md`.
- **Category:** SENTENCE.
- **Introduced:** earlier — byte-identical at `02-grafts.md:42-43`. Not pinned (no ledger pattern covers l49-50) — free to edit.
- **Edit (mine):** "The shipped check rejects a new round that loses a sentence an earlier round verified, or brings back wording one retired as false." The Q5 reader's wish in its own words; C-level claim unchanged (`rewrite/SKILL.md:124`).

### L6.3-05. Three plugin pages repeat the 2026-09-10 counts the README now corrects
- **Lines:** l107, l116-120 against `writing-rules.md:37-40` ("five writing standards", "both published standards", "seven of the ten proposed nothing", "two produced a longer text"), `measurements.md:97-99` (M19), `research/README.md:9` ("five published writing standards lost to unguided controls").
- **Finding:** the plugin ships two texts that disagree on one measurement; the README's set (four standards, three published, one draft, one control pair; five unchanged, one punctuation-only, three longer, one shorter) is the raw record's (`o8eHzS6U.answer.md`, `v04PR6HL.prompt.txt`), the pages' is the original README's refuted set (C39, C41 retired in the ledger, `want:false`).
- **Raised by:** lens 2 R2 (as a rule question: "a dated measurement keeps its numbers" — which set is true is outside its lens); lens 1 P1 (the README right, the pages wrong; adds `research/README.md:9`, which E6 does not name — `grep -c research/README` over E6 → 0). 2 lenses. = round-02 L6-15.
- **Check:** lens 2: `grep -n -E "One run|seven|Five published|both entries" $R/00-original.md` → 64 76 77 78; `grep -n -E "Two experiments|five agents|four writing|three published" $R/03-review.md` → 107 116 118 120; `grep -n -E "A run on|five writing|seven of the ten|longer text" $P/skills/rewrite/references/writing-rules.md` → 37 39. Lens 1: `sed -n '37,40p' …/writing-rules.md; sed -n '97,99p' …/measurements.md; sed -n '9p' research/README.md`; the SHA of `sed -n '6,25p' writing-rules.md` is unchanged (`7a577b29…f635d`), lines 37-40 sit outside the frozen block.
- **Category:** CODE (recorded, ISSUES E6 — add `research/README.md:9` to its evidence). The README side is settled: R2's rule holds because the change is a recorded correction (the audit retired C39/C41). No README edit.

### L6.3-06. The bake-off vetoes any weakened warning while two pages require a false claim to be weakened, and no rule says which wins
- **Lines:** none the README can fix; its l100-102 pair carries the tension (L6.3-01).
- **Finding:** `bake-off.md:114` ("was a condition, limit or warning at a decision point cut or weakened?" → veto) has no exception for a false one, while `bake-off.md:60-62` ("Correct what the current file gets wrong") and `truth-pass.md:23-25` (a guarantee-shaped claim is weakened to what the evidence supports) require exactly that; a candidate that narrows a false warning is vetoed as written.
- **Raised by:** lens 1 P4 (level 2); lens 2 P2's page side. 2 lenses. Round 02's L6-07 CODE side (lens 1 note c) was to go to `code-defects.md` ("06/07's page sides", lens6 count table) and is in neither D1–D6 nor E1–E14.
- **Check:** `sed -n '60,62p;114p' $P/skills/rewrite/references/bake-off.md; sed -n '23,25p' $P/skills/audit/references/truth-pass.md`.
- **Category:** CODE — new for `code-defects.md` (D8): either the veto row excepts a warning the ledger holds as refuted, or the accuracy floor names the veto as the exception.

### L6.3-07. The pages' lifetime sentences omit the last-installation rule and `marketplace remove`
- **Lines:** none in the README (l89-90 is right at level 3); `audit/SKILL.md:39-41`, `rewrite/SKILL.md:74-76` — "deleted by `claude plugin uninstall` unless `--keep-data` is passed".
- **Finding:** at level 3 removing one of two installations keeps the data, and `claude plugin marketplace remove` deletes it with no `--keep-data`; neither page says either.
- **Raised by:** lens 1 P2 (level 3). 1 lens this wave. Round 02's L6-06 CODE side (lens 1 F9/F10, level 3; F10 re-run by the coordinator) was to go to `code-defects.md` and is in neither D1–D6 nor E1–E14 (D5 covers `--plugin-dir` only).
- **Check:** `sh $R/probe-03/lifetime-probe.sh` (four cases: uninstall, `--keep-data`, two scopes, `marketplace remove`); `sed -n '39,42p' $P/skills/audit/SKILL.md; sed -n '74,77p' $P/skills/rewrite/SKILL.md`.
- **Category:** CODE — new for `code-defects.md` (D7). The README's G3a already states the rule the pages lack.

### L6.3-08. "readers" are model agents, and the plugin's own known limit is absent from the README
- **Lines:** l3-5 — "`terse` is a Claude Code plugin that measures whether readers get the right answer and whether a document's claims agree with the code behind it, and proposes a rewrite."; l114-115 (the pilot's two limits).
- **Finding:** the readers are spawned model agents and the plugin's record says its ruler measures whether a model can answer, not whether a human reader improved (`CHANGELOG.md:100-103`, `prior-art.md:131`); the README never says so (`human` → 0 hits) and a person asking "Is my README any good?" reads "readers" as their own.
- **Raised by:** lens 1 F1 (OVERSTATED, level 2). 1 lens. Against it: the verifier's C01 HOLDS — the pages use the same word (`audit/SKILL.md:3-7` "fresh readers"); see Conflicts 1.
- **Check:** `sed -n '100,103p' $P/CHANGELOG.md; sed -n '131p' $P/references/prior-art.md; sed -n '86p' $P/skills/audit/SKILL.md; sed -n '40p' $P/skills/audit/references/measure.md; grep -n -i -E 'human|model reader' $R/03-review.md` (0 hits, reproduced).
- **Category:** SENTENCE.
- **Introduced:** the sentence was modified by round 03 (", and proposes a rewrite" appended, C01 re-pinned); the faulted word is the original's (`00-original.md:3` "gives readers the right answer") and round 02's (`02-grafts.md:3-4`). Not charged to round 03 by the definition as round 02 applied it; 1 regression if the coordinator counts a re-pinned sentence as introduced — the coordinator's call, stated both ways.
- **Edit (mine, minimal):** l25-26 "before assigning one fresh reader, a model agent, to each question" (C06 pinned → re-pin). Optional, the CHANGELOG's own limit at l115: "…nor separates what the text taught from prior knowledge, nor says whether a human reader improved."

### L6.3-09. The measured chain is not the procedure the page describes, and the text does not say so
- **Lines:** l97 — "a four-pass rewrite chain moved 2,725 words to 2,571"; l109 — "The chain covered one README."; l122 — "which pass produced the reported answer gain, or whether a bake-off beats one careful pass"; against l40-45 (adversarial read, bake-off, rounds).
- **Finding:** the 2026-09-10 chain was reader-profile → writing-rules → curse-of-knowledge → repair passes, "the evidence the `terse` plugin was built on" (`research/2026-09-10-chain/README.md:3-4, 18-30`), with no bake-off and no critic rounds; the README's *What was measured* therefore measures a predecessor of the shipping loop, and a reader "cannot tell whether the measured procedure is the one that ships" (lens 2's words) — it is not.
- **Raised by:** lens 2 R4 (third item: the chain "never tied to the rewrite l40-45 describes"). 1 lens. YOURS: the fact that the two differ, read from the chain's README (level 2; lens 1 and the verifier read the same file for C24 and did not raise it).
- **Check:** `sed -n '3,4p;18,30p' ~/Git/agent-skills/research/2026-09-10-chain/README.md; grep -n -i -E "chain|\bpass\b|\bround" $R/03-review.md`.
- **Category:** SENTENCE.
- **Introduced:** l97 modified by round 03 (L6-16 applied: "a four-pass rewrite chain"); l109 earlier. C24 pinned on l97 → re-pin if changed there.
- **Edit (mine):** l109 "The chain, four passes that preceded the plugin's bake-off and rounds, covered one README." (`chain/README.md:3-4`); l97 unchanged.

### L6.3-10. "holds no record of its readers after it" reads as no record of the after result, which the next sentence reports
- **Lines:** l109-112 — "The repository records its six readers before the rewrite one by one and holds no record of its readers after it. Its pages report six questions, one trial per question, with 3/6 answers right before and 6/6 after…"
- **Finding:** decision (b)'s content (no per-reader record of the after-arm) is right; the wording "no record" collides with "Its pages report … 6/6 after".
- **Raised by:** lens 2 P4. 1 lens.
- **Check:** `sed -n '109,113p' $R/03-review.md`.
- **Category:** SENTENCE.
- **Introduced:** round 03 (edit 19, decision (b)). Not false → not a regression by the definition; a wording defect the round introduced, for the coordinator to count or not. C44 pinned → re-pin.
- **Edit (mine):** "The repository records each of its six readers before the rewrite, and only the totals after it."

### L6.3-11. The skeleton's contents are understated
- **Lines:** l37 — "Its output is a skeleton: each section's title, purpose, exclusions, and word budget."
- **Finding:** the page's own definition adds "the rules that will gate the writing" (`rethink/SKILL.md:13-15`) and its hand-over list adds the mechanical rules, the terminology decisions with the rejected ones, what was deleted with its cost, and edits required elsewhere (`:76-80`); `rewrite` reads the rules from the skeleton (`critic-briefs.md:100-101`).
- **Raised by:** lens 1 F3 (UNDERSTATED, level 2). 1 lens.
- **Check:** `sed -n '13,15p;76,80p' $P/skills/rethink/SKILL.md; sed -n '100,101p' $P/skills/rewrite/references/critic-briefs.md`.
- **Category:** SENTENCE. **Introduced:** earlier (unchanged since 01). C10 pinned → re-pin.
- **Edit (mine):** "Its output is a skeleton: each section's title, purpose, exclusions, and word budget, and the rules the writing must pass."

### L6.3-12. `rewrite` has four ways in, the page names two and no way back into a run; and the audit's input has three names
- **Lines:** l40 — "**`/terse:rewrite`** starts from that skeleton or an audit run."; l13-17 (the diagram); l15 "run file" vs l40 "an audit run" vs l79 "the run".
- **Finding:** (a) `rewrite/SKILL.md:16-21` starts from a run directory that already holds rounds (step 4, steps 1-3 not repeated), a skeleton, an audit run file, or neither ("offer … if the user declines both, continue on your own guesses and say so"); the line and the diagram imply one of two inputs is required. (b) "run file" appears only in the diagram (l15), which is protected and pinned (C05).
- **Raised by:** lens 1 F4 (UNDERSTATED, level 2); lens 2 R4 (fourth item, "run file"). Two lenses on one sentence for two different faults — ranked as single-lens.
- **Check:** `sed -n '16,21p' $P/skills/rewrite/SKILL.md`; `grep -n -i "run file" $R/03-review.md` → 15 (reproduced).
- **Category:** SENTENCE. **Introduced:** earlier (unchanged since 01). C11 pinned → re-pin.
- **Edit (mine):** "**`/terse:rewrite`** starts from that skeleton or an audit's run file, or resumes a run of its own that already holds rounds." Whether the README should advertise the guess route ("neither") is the coordinator's — UNSETTLED facet.

### L6.3-13. "compares documents in the same genre" — four of six default slices look outside it
- **Lines:** l36-37 — "It compares documents in the same genre, settles terms, and explores structures."
- **Finding:** the default survey is six slices: the exact genre, the same structural position, the most used regardless of genre, vendor guidance, the document's hard part, and what not to copy (`rethink/SKILL.md:30-32`).
- **Raised by:** lens 1 F2 (UNDERSTATED, level 2, minor). 1 lens.
- **Check:** `sed -n '27,32p' $P/skills/rethink/SKILL.md`.
- **Category:** SENTENCE. **Introduced:** earlier. C09 pinned → re-pin. One edit with L6.3-14.
- **Edit (mine):** "**`/terse:rethink`** surveys documents in and beyond the genre, settles terms, and explores structures."

### L6.3-14. Water: "works before prose" (4 words)
- **Lines:** l36 — "**`/terse:rethink`** works before prose."
- **Finding:** carried by l11 ("when the document is missing or its shape is wrong") and l37 ("Its output is a skeleton").
- **Raised by:** lens 2 W2. 1 lens. **Check:** `sed -n '11p;36,37p' $R/03-review.md`. NO CHECK beyond the reading.
- **Category:** SENTENCE. **Introduced:** earlier. C09 pinned → re-pin (same edit as L6.3-13).

### L6.3-15. Decision (d) read literally: l74 names a branch and the document's own review event
- **Lines:** l73-74 — "At the 2026-09-22 audit, the install commands resolved the marketplace's `main` at `8c041b7`, …"
- **Finding:** `skeleton.md:22-23` says "no branch name, no 'still', the date and both commits kept"; l74 names `main`, and "At the 2026-09-22 audit" names the review event, the class `writing-rules.md:12` cuts.
- **Raised by:** lens 2 R1. 1 lens.
- **Check:** `` grep -n '`main`' $R/03-review.md `` → 74 (reproduced); `sed -n '22,23p' $R/skeleton.md`.
- **Category:** UNSETTLED — decision (d) was written against round 02's "on branch `terse-process-2026-09-22`" (the checkout's branch, editing history); `main` is the branch the install resolves, a fact about the install, not the document's history. Whether (d) meant any branch name is the coordinator's. Introduced by round 03; not false. R03j pinned → re-pin if changed.
- **Edit (lens 2's, 23 → 18 words, if adopted):** "On 2026-09-22 the install commands resolved to `8c041b7`, whose …" — combine with L6.3-03.

### L6.3-16. Decision (a)'s rule, read page-wide: five sentences state a page's instruction as fact outside the l23 frame
- **Lines:** l7 "guarantee-shaped claims need a named source or weaker wording" (`truth-pass.md:23-25`, a page); l85-86 "Copying that defect … requires your word." (`rewrite/SKILL.md:153-154, 191-192`, a page; R02d pinned); l96 "Length does not select a candidate" (`bake-off.md:118`, a page; "section budgets are reports" is `sections.mjs`, level 3, direct is right); l100 "the bake-off vetoes" (`bake-off.md:114`, a page); l101-102 (no page — L6.3-01).
- **Finding:** `skeleton.md:13-14` gives the rule as "the instructions say … where the source is a page (level 2), direct where a script does it (level 3)"; its application note applied it to *What each one does* and "adds none" elsewhere; lens 2 leaves it UNSETTLED whether the note means exactly that.
- **Raised by:** lens 2 R3. 1 lens.
- **Check:** `grep -n -E "instructions|page|rules forbid" $R/03-review.md` → 23 34 47 73 74 79 82 83 86 91 100 111 (reproduced); none of l7, l85-86, l96, l101-102 attribute.
- **Category:** UNSETTLED — the scope of decision (a): one section or the page. No edit until decided. The one script-backed clause (l96 budgets) is direct by the rule already.

### L6.3-17. The frame says "what each page says" over a script's behaviour and a reference document's rule
- **Lines:** l23 — "Each skill is a page of instructions for Claude; below is what each page says." ↔ l49 (a script, direct) and l82-83 ("its reference on measuring allows…").
- **Finding:** the script half is answered by the page itself — `rewrite/SKILL.md:124` describes `ledger.mjs`'s exit 1 — so only the reference half stands: `measure.md` is the audit skill's second document, and the frame calls everything below "the page".
- **Raised by:** lens 2 P5. 1 lens. **Check:** `sed -n '23p;49,50p;82,83p' $R/03-review.md; sed -n '124p' $P/skills/rewrite/SKILL.md`.
- **Category:** SENTENCE, low. **Introduced:** round 03 (edit 3; decision (a)'s verbatim text, R03a pinned → the coordinator's to change). Not false.
- **Edit (mine):** "Each skill is a page of instructions for Claude; below is what each page and its references say."

### L6.3-18. "declared" is undefined, and l6-7 lets a guarantee stand on weaker wording
- **Lines:** l47-49 — "Every cut of twenty words or more must carry a reason, and every declared behavioural claim its source and evidence."; l6-7 — "guarantee-shaped claims need a named source or weaker wording".
- **Finding:** "declared" (a claim the round's edits file declares) is never explained, so the reader cannot tell which claims the guarantee "every" covers; l6-7 is about the audited text, l47-48 about the rewrite's own claims — two subjects the page does not separate.
- **Raised by:** lens 2 P6. 1 lens. **Check:** `sed -n '6,7p;47,49p' $R/03-review.md`.
- **Category:** SENTENCE, low. **Introduced:** l47-49 reworded by round 03 (edit 9, W3); "declared" is round 02's (`02-grafts.md:40-42`). R03g pinned → re-pin.
- **Edit (mine):** "…and every behavioural claim a round declares its source and evidence."

### L6.3-19. "bake-off" names rewrite's step and the 2026-09-10 standards experiment
- **Lines:** l41 (the step), l100 (its veto), l122 ("whether a bake-off beats one careful pass") against l116 — "A separate bake-off used ten agents in a 2 × 5 design…"
- **Finding:** round 03 named the step "bake-off" (L6-18 applied) and l116 now calls a different experiment by the same word, so l122's limit reads as if the 2 × 5 run were the step it names.
- **Raised by:** lens 2 ("noted, not counted"). 1 lens. **Check:** `grep -n -i bake-off $R/03-review.md` → 41 100 116 122 (reproduced).
- **Category:** SENTENCE, low. **Introduced:** earlier (l116 = `02-grafts.md:104`). C42 pinned → re-pin.
- **Edit (mine):** l116 "A separate experiment used ten agents in a 2 × 5 design…"

### L6.3-20. "page" in three senses and "the repository" in two
- **Lines:** "page": l23, l74, l82, l86, l91 (a skill's instructions), l73 (this README: "This page describes commit"), l111 (the research pages); l73 and l74 use two senses in adjacent sentences. "the repository": l34, l82, l85 (the audited one), l109 (the plugin's: "The repository records its six readers").
- **Raised by:** lens 2 ("noted, not counted"). 1 lens. **Check:** `grep -n -w -i 'page\|pages' $R/03-review.md; grep -n repository $R/03-review.md` (reproduced).
- **Category:** SENTENCE, low. **Introduced:** l73 and l109 by round 03 (edits 11, 19); the others earlier. R03i, C44 pinned → re-pin.
- **Edit (mine):** l73 "This README describes commit `2f29a8f`."; l109 "The plugin's repository records…"

### L6.3-21. "The instructions say to" is redundant under the frame, and the sentence is not pinned
- **Lines:** l47 — "The instructions say to hand over a candidate and its diff from the original."
- **Finding:** under l23 the four words repeat the frame; lens 2 skipped the cut on the ground that decision (a) keeps "the pinned sentences' words" and left "whether l47 is pinned" unchecked — no ledger pattern covers l47 (the 40 pinned patterns read here; R03g starts at "Every cut"), so decision (a)'s reason does not reach it.
- **Raised by:** lens 2 (skipped item, 4 words). 1 lens. YOURS: the pin check. **Check:** `node -e 'JSON.parse(require("fs").readFileSync("'$R'/ledger.json")).forEach(e=>{if(/hand over a candidate/.test(e.pattern))console.log(e.name)})'` → nothing.
- **Category:** SENTENCE, low. **Introduced:** earlier (`02-grafts.md:40`).
- **Edit (mine):** "A round is handed over as a candidate and its diff from the original."

### L6.3-22. Three dated findings of the original were dropped, and no reason is recorded
- **Lines:** `00-original.md:70-72` ("Two of the six failures were lies rather than findability…", 37 words), `:73-75` ("Two who reported no confusion answered wrong…", 36 words), `:84` ("Two published benchmarks that did run that arm found it large", refuted C45). `grep -c -E "lies rather|Two who reported|benchmarks that did" $R/03-review.md` → 0.
- **Finding:** the audit left C34–C37 unconfirmed (level 1–2, `audit.md:331-361`), not refuted; candidate B (round 01, adopted whole) cut them where C kept both (`candidates/C.md:86-89`) and A kept the second (`A.md:110`); no `.md` in the run outside `audit.md`/`brief.md` names C34–C37, so two cuts of more than twenty words carry no recorded reason against the README's own l47-48 rule, and `writing-rules.md:22-23` ("a dated measurement keeps … its numbers") may protect the counts.
- **Raised by:** lens 2 R2 (the "dropped with their numbers" part; it did not open `edits/`). 1 lens.
- **Check:** `grep -rn -E "C3[4567]\b" --include='*.md' $R | grep -v -E '/audit\.md:|/brief\.md:'` → nothing (reproduced); `sed -n '331,361p' $R/audit.md`.
- **Category:** UNSETTLED — the coordinator either records the reason in the hand-over's cut ledger ("unconfirmed at level 1, no per-reader record; unconfirmed claims must not be strengthened", judge sheet) or restores the two sentences. Round 01's, not round 03's.

### L6.3-23. l82 reports two of the plugin's documents disagreeing
- **Lines:** l82-83 — "The audit page forbids writing into the audited repository; its reference on measuring allows storing the score there on your word."
- **Finding:** `audit/SKILL.md:44` against `measure.md:117-121`; the text leaves the operative rule to the reader.
- **Raised by:** lens 2 P3. 1 lens. = round-02 L6-12. **Check:** `sed -n '82,83p' $R/03-review.md; sed -n '44p' $P/skills/audit/SKILL.md; sed -n '117,121p' $P/skills/audit/references/measure.md`.
- **Category:** CODE (recorded, ISSUES E12). The sentence, introduced by round 03 (edit 13), is true as attributed (verifier R02a HOLDS); no README edit until E12 is settled.

### L6.3-24. Audit step 5b gives task readers no isolation
- **Raised by:** lens 1 P3 (level 2). 1 lens. = round-02 L6-34. **Check:** `sed -n '107,116p' $P/skills/audit/SKILL.md | grep -c -E 'TMPDIR|isolated|CONFIG_DIR'` → 0; `sed -n '141,142p;147p' $P/skills/rewrite/references/critic-briefs.md`.
- **Category:** CODE (recorded, `code-defects.md` D6). Nothing new.

### L6.3-25. The rendered pages keep `$CLAUDE_PLUGIN_ROOT` literal
- **Raised by:** lens 1 P5 (level 3 for the literal in the stub request bodies; hypothesis for the Bash environment, unobserved). 1 lens. = round-02 L6-35. **Check:** the `$T/stub-out-audit`, `$T/stub-out-rewrite` request bodies; `sed -n '61,62p' $P/CHANGELOG.md`.
- **Category:** CODE (recorded, ISSUES E10; adds the rendered-body evidence).

### L6.3-26. `rule1.mjs` misses `${TMPDIR:-/tmp}/terse` before the cut
- **Raised by:** lens 2 (check note; planted at l55 → 0 violations). 1 lens. = round-02 L6-13. **Check:** `` sed '55s|$| under `${TMPDIR:-/tmp}/terse` and `plugins/data/terse-nowely/runs/`.|' $R/03-review.md > $T/planted3.md; node $S/rule1.mjs $T/planted3.md --cut Install --except Install `` → 0 violations.
- **Category:** CODE (recorded, `code-defects.md` D4). Harmless this round (l80 is after the cut); a "clean" verdict does not cover that form.

### L6.3-27. `concepts.json`, replaced in round 03, still has two patterns that miss or over-match
- **Lines:** `$R/concepts.json` — "conditions, limits, warnings kept": `condition, a limit or a warning|repetition`; "rethink stops at a skeleton": `skeleton`.
- **Finding:** the first alternative matches 0 times because l100 says "condition, limit, or warning", so the concept is found only through `repetition` (l102); the bare `skeleton` flags the storage sentence l86-87, so the one 3-section hit `dup.mjs` reports is a false positive. Round 02's L6-14 (five blind patterns) was applied by replacing five patterns; these two are the residue.
- **Raised by:** lens 2 (check notes). 1 lens. **Check:** `node $S/dup.mjs $R/03-review.md $R/concepts.json` → 1 concept in three or more sections (reproduced); `grep -n -E 'condition, a limit|"skeleton"' $R/concepts.json`.
- **Category:** METHOD (the run's own instrument).
- **Edit (mine):** patterns `condition, (a )?limit,? or (a )?warning|repetition` and `returns a skeleton|output is a skeleton|→  skeleton`.

### L6.3-28. The Q7 reader guessed on the unchanged language sentence, which reaches level 1 only
- **Lines:** l5-6 — "The intended scope is Markdown in any language, whether or not the document is about software."; l26 — "Readers start at the entry file and may open only Markdown."
- **Finding:** round 03's c5-7 reports GUESSED ("Probably yes … the document does not explicitly confirm that Russian readers proceed identically") from the same two sentences round 02's c5-7 answered "Yes" from; both sentences are byte-identical across the rounds; lens 1 lists l5-6 among claims reached only at level 1 (intent; no page states a language scope). The key (`audit.md:955-958`): UNANSWERABLE, "A confident yes or no is a failure. The right answer is that the documentation does not say." — so by the key round 03's GUESSED is the right answer and round 02's "Yes" was the failure the 2026-09-22 docs reader also made (`audit.md:984`).
- **Raised by:** c5-7 (GUESSED); lens 1 level-1 item 1 (not a finding in its words). 1 finding-lens.
- **Check:** `grep -n -E "any language|may open only Markdown" $R/02-grafts.md $R/03-review.md`; `sed -n '953,957p' $R/audit.md; cat $R/reviews/02/c5-7.md $R/reviews/03/c5-7.md`.
- **Category:** UNSETTLED — decision (e) left the sentence and made Q7's key the coordinator's; ISSUES E14 records the key-versus-rewrite collision. No edit; the gate should read Q7's guess as the key's answer, not as a failure of the text.

### L6.3-29. No line says how a re-audit reuses the answer key
- **Lines:** l25 "writes … an answer key" ↔ l52 "use the same questions, answer key, entry file, and model".
- **Raised by:** lens 2 ("noted, not counted"). 1 lens. **Check:** `sed -n '106,109p' $P/skills/audit/references/measure.md` (same key; no route named).
- **Category:** CODE (recorded — `code-defects.md` D1 covers where the candidate stands for its re-audit, E14 the planted question under the same key; this adds the key's own route). No README edit: the README may not state what no page states.

---

## Carried, un-routed (outside the count)

### L6.3-30. *What was measured* points at no record — round-02 L6-31, STRUCTURE, low
- `grep -c '](' $R/03-review.md` → 0 (reproduced). `reviews/02/routing.md` routes 18 SENTENCE + 3, 5 CODE, 3 recorded, 5 owner, 2 method and drops 1 SUPERSEDED = 34 of 35; L6-31 is in no row. No round-03 critic raised it. For the coordinator's routing, not a round-03 finding.

---

## Conflicts between critics

1. **Lens 1 F1 against the verifier's C01 HOLDS (L6.3-08).** The verifier checked that `plugin.json:4` and `audit/SKILL.md:3-7` say "readers"; lens 1 says the word hides that the readers are models and that the plugin's own known limit (`CHANGELOG.md:100-103`) is missing from the README. Both hold on their evidence; whether the README must carry the limit is the owner's (the CHANGELOG is the owner's statement).
2. **Lens 1 F6 against the audit key Q6 and the verifier's R03l HOLDS (L6.3-01).** `audit.md:945-946` wrote "though it may reword or correct one (C27)"; R03l covers l100-101 only. The grep over the skills finds no "reword"; the key's clause was a reading of `bake-off.md:60-62`, not a page's sentence. Lens 1 wins: cut.
3. **Lens 1 F5 against lens 2 W1 on l75 (L6.3-03).** W1 cuts it as a repeat of l73; F5 says the whole boundary paragraph understates. Compatible: one edit widens l74 and cuts l75.
4. **Lens 2 R1 against decision (d) (L6.3-15).** Lens 2 reads "no branch name" as covering `main`; the decision's context (round-02 L6-03: "on branch `terse-process-2026-09-22`") was the checkout's branch. For the coordinator.
5. **Lens 2 R2 against lens 1 P1 (L6.3-05, L6.3-22).** Lens 2: the rule is broken unless the changed numbers are a recorded correction; lens 1: they are, and the pages are wrong. Resolved for the README; the residue is the three dropped findings (L6.3-22), which lens 1 did not examine.
6. **Lens 2 R3 against decision (a)'s application note (L6.3-16).** Lens 2 reads the rule page-wide; the note applied it to one section and "adds none". For the coordinator.
7. **c5-7 (GUESSED) against round-02's c5-7 ("Yes") on identical text (L6.3-28).** The key sides with the guess. c5-5 (GUESSED) against round-02's c5-5 (answered) on identical text (L6.3-04): the key sides with both answers' content; the label differs because the mechanism's name is undefined.
8. **Lens 1 F4 against the diagram (L6.3-12).** Four routes against the diagram's two; the diagram is a protected passage and pinned (C05). Only l40 can change.
9. **The verifier's R03b/G3b HOLDS against lens 1 F5c (L6.3-03).** l80-81 is true of `2f29a8f` installed (lens 1 held it at level 3 too) and false for the install the page gives; lens 1 charges l74-75, not l80-81. No conflict on the fact.

## What the wave did not cover

- **Lenses 3 and 4 sized to zero.** No adversarial read of round 03; no task readers, so the task gate (0/2 in round 02, both blocked at the isolated configuration's login) is still unmet and untested, and the sections no task reached are unnamed for this round. The gate of step 5 cannot be read as met.
- **No authenticated skill run anywhere in the wave** (lens 1: stub only, 0 tokens): G1 announce-and-wait, the first question `audit` asks, the live Bash environment of a skill session (L6.3-25's hypothesis), the in-app `/plugin` forms (lens 1 level-1 item 2).
- **Lens 2 by its own account** opened no `edits/` (cut reasons), no `02-grafts.md` or diff (decision (e) "left as it is" unchecked — checked here: l5-6 byte-identical), no ledger (l47's pin — checked here: not pinned), and checked no fact against code.
- **Whether the measured chain is the shipping procedure** — no critic checked it (L6.3-09, read here from `chain/README.md`).
- **The after-readers' 6/6** (level 1 only, no record); the OS purge of `$TMPDIR` (unobservable; G3c now attributed); "Models were hidden" (dossier not kept); `main` at `8c041b7` observed on 2026-09-23 against a 2026-09-18 commit, not on 2026-09-22.
- **The Node 22 floor**: declared, not enforced (round 02: `selftest.mjs` passed under 20.16.0); nobody checked whether any skill needs 22 (l60-61 says "22 or newer").
- **A curse-of-knowledge pass**: no critic in this wave either; R4 covers four terms, and "adversarial read", "candidate", "arm", "entry file", "no-document baseline", "trial" are untested on a reader.
- **`stages.md` content rules** (untagged fences at l13 and l65; warnings in the opening at l6-8): not applied, no skeleton adopts them — as in round 02.
- **Round-02's un-routed L6-31** (L6.3-30).
- **`ledger.mjs` after any edit above**: pins hit — C01 or C06 (08), C09 (13/14), C10 (11), C11 (12), C24 (09 if l97), C42 (19), C44 (10, 20), G4 drop + R03j (03/15), R03a (17), R03g (18), R03i (20) — each needs `retire`/re-pin in `edits/04.json`; l101-102 (01), l49-50 (04) and l47 (21) are unpinned.
- **Budgets**: 4 sections over (+50, +37, +42, +36; `sections.mjs`, a report); no critic weighed whether the growth — conditions, prerequisites, the boundary — is warranted. Not a finding.

## The two GUESSED readers against round 02

| Q | Round 02 (`reviews/02/`) | Round 03 (`reviews/03/`) | Text changed? | The key (`audit.md`) |
|---|---|---|---|---|
| Q5 "Will a second pass undo what the first one fixed?" | c5-5 answered: "not guaranteed to preserve what the first fixed; regression can occur", from l42-43, one section | c5-5 GUESSED: "not necessarily, but regression remains possible", from l113-114 (McNemar) and l50, two sections; wished the text said whether the second pass preserved the first's fixes | No — l49-50 byte-identical to 02:42-43 | :926-929 "guarded against, not ruled out … every verified sentence is pinned … `ledger.mjs` fails any round that loses a pinned sentence". Both rounds' content matches; the round-03 label says the guard's name was illegible (L6.3-04). The reader also took the McNemar sentence, which is about reader answers, as evidence about passes — "pass" and "round" name two procedures (L6.3-09) |
| Q7 "My documentation is in Russian — do the readers go through it the same way?" | c5-7 answered: "Yes", from l4-5 and l24 | c5-7 GUESSED: "Probably yes … the document does not explicitly confirm", from l5-6 and l26 | No — both sentences byte-identical | :955-958 UNANSWERABLE, "A confident yes or no is a failure. The right answer is that the documentation does not say." Round 03's guess is the key's answer; round 02's "Yes" was the failure (as the 2026-09-22 docs reader's, :984). Decision (e) and E14 govern what happens next (L6.3-28) |

Same model, same text, opposite labels on both: one trial per question is noise at this size; the Q5 flip has a textual cause (an undefined term), the Q7 flip has none.

## Count by category (primary)

| Category | Entries |
|---|---|
| SENTENCE | 15 — L6.3-01, 03, 04, 08, 09, 10, 11, 12, 13, 14, 17, 18, 19, 20, 21 |
| CODE | 8 — L6.3-05 (E6), 06 (new, D8), 07 (new, D7), 23 (E12), 24 (D6), 25 (E10), 26 (D4), 29 (D1/E14) |
| UNSETTLED | 4 — L6.3-15, 16, 22, 28 |
| SCOPE | 1 — L6.3-02 |
| METHOD | 1 — L6.3-27 |
| STRUCTURE | 0 in the count (L6.3-30 carried) |
| SUPERSEDED | 0 |
| **Total** | **29** |

SENTENCE findings on sentences round 03 introduced or reworded: L6.3-03 (l74-75, understated — not counted), 10 (l110, ambiguous — not false), 17 (l23, decision (a)'s text), 20 (l73, l109 word senses); modified with the fault inherited: 08 (l3-5), 09 (l97), 18 (l47-49). **Regressions charged to round 03 by the definition: 0** (none shown false or overstated among the sentences it introduced); 1 if the coordinator counts L6.3-08's re-pinned sentence as introduced.

Ledger of raised → merged: lens 1 F1→08, F2→13, F3→11, F4→12, F5→02+03, F6→01, P1→05, P2→07, P3→24, P4→06, P5→25; level-1 items: 1→28 (context), 2→not covered. Lens 2 R1→15, R2→05+22, R3→16, R4→04+09+12(b) (its "skeleton" item, "lowest", not carried), W1→03, W2→14, P1→02, P2→01+06, P3→23, P4→10, P5→17, P6→18; check notes: rule1→26, concepts ×2→27; noted: page→20, repository→20, bake-off→19, key reuse→29; skipped l47→21. Readers: c5-5→04, c5-7→28; c5-1, 2, 3, 4, 6 answered (c5-4 from two sections, as in round 02). Verifier V2/V2b: G3c DOES NOT ANSWER → attributed before the freeze; context, no finding.
