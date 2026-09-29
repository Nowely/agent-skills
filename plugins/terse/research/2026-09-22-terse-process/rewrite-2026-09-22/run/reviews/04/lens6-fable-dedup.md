# Lens 6 — dedup and rank of the round-04 wave on `04-terms.md`

Fable (claude-fable-5-1), 2026-09-23. Document: `$R/04-terms.md`, 130 lines, SHA-256
`d3f681d9817f4149e9b26cfd00e458791a88c4b1fc613a63cf5247fbc3812400` (matches `probe-04/freeze-04.sha`, frozen
17:06:39). Code: `~/Git/agent-skills`, branch `terse-process-2026-09-22`, HEAD `b7a17da`;
`git status --short` empty when this work began; at its end it lists 18 entries, every one under
`research/2026-09-22-terse-process/` with mtime 17:33–17:36 — the coordinator's copy of the round-04 record into the
repository, made while this ran; none of my commands wrote into the repository. `git diff --stat 2f29a8f HEAD --
plugins/terse` empty, so the plugin tree read is 2f29a8f's. Line numbers are `cat -n` lines of `04-terms.md`. `$R` = the run directory,
`$S` = `plugins/terse/skills/rewrite/scripts`, `$P` = `plugins/terse`, `$X` = `$TMPDIR/terse-r04-lens1-opus`
(lens 1's scratch), `$L` = `$TMPDIR/lens2-opus-04` (lens 2's plants). Nothing in the repository was modified;
this file and one scratch directory (removed) are the only writes.

Inputs read, all 14 wave files: `verifier-sol-v3.md`, `-v3b.md`, `-v3c.md` (context: 16 claims / 9 not
holding, then 17 / 1, then 17 / 0); `lens1-opus.md` (F1–F10, seven level-1 items, "Held at level 3", "Code,
not the document"); `lens2-opus.md` (R1–R6, W1–W3, P1–P5); `c4-1.md`, `c4-2.md`; `c5-1.md` … `c5-7.md`. The
record: `skeleton.md` (decisions (a)–(l)), `rounds.md`, `code-defects.md` D1–D8, `cuts.md`, `edits/04.json`
(17 edits, 17 claims, one `drop`: G4), `ledger.json` (56 entries; R03h R03i R03j R04b R04c C11 G3a read in
full with `asks`/`run`/`expect`/`saw`), `diff -u 03-review.md 04-terms.md` (run here), `00-original.md`,
`writer-04.md`, `audit.md:855-995` (the key Q1–Q7, reader rows, task readers), `reviews/03/lens6-fable-dedup.md`
(29 findings), `reviews/03/routing.md`, `reviews/03/c5-1..7.md`, `ISSUES.md` E1–E14 (E3, E6, E8, E10, E11, E12,
E14 in full), `probe-04/` (`ledger-guard.sh` + log, `install-checkout.sh`, `lifetime-probe.log`,
`real-data-dir-before-lens4.txt`, `-after-lens4.txt`, `freeze-04.sha`), `$X/config4/plugins/*.json`,
`$TMPDIR/terse-fresh-reader-config/plugins/installed_plugins.json`. Page lines: `rewrite/SKILL.md:14-35,
44-47, 50-70, 119-131, 147-156, 175-210`; `loop.md:45-60`; `bake-off.md:18-26, 55-62, 85-90, 110-116`;
`critic-briefs.md:44, 80, 132, 147`; `audit/SKILL.md:1-12, 18-29, 30-44, 84-92`; `measure.md:45-52, 104-125`;
`truth-pass.md:20-27`; `writing-rules.md:1-30`; `$S/rule1.mjs`, `ledger.mjs`, `dup.mjs`, `sections.mjs` (all),
`round.mjs:15-40, 80-125`, `selftest.mjs:1-12`; `$P/package.json`; `$P/CHANGELOG.md:30-36, 60-66, 100-105`;
`research/2026-09-10-chain/README.md:1, 36-44`; `research/README.md:9`.

**Reproduced here** (exit codes as printed): the four shipped checks on the frozen file — `node $S/rule1.mjs
$R/04-terms.md --cut Install --except Install` → `0 violation(s), 0 excused`, exit 0; `node $S/dup.mjs
$R/04-terms.md $R/concepts.json` → the 19 rows as lens 2 lists them, `0 concept(s) in three or more sections`;
`node $S/sections.mjs $R/04-terms.md $R/budgets.json` → 1140 words, 4 sections over (+50, +68, +70, +36);
`node $S/ledger.mjs $R/ledger.json 00-original.md 01-candidate.md 02-grafts.md 03-review.md 04-terms.md` → 56
rows, `0 failure(s)`, exit 0. Lens 1: F1 (`git branch -a --contains 2f29a8f` → only the local branch;
`git ls-remote` → `main` at 21a225b, 13 PR heads, none with 2f29a8f as ancestor; `git fetch --depth 1 <url>
2f29a8fecec…` → `fatal: remote error: upload-pack: not our ref`, the same fetch of 21a225b succeeds); F3 (both
extra cases, see L6.4-01); F5 (`env -i PATH=~/.nvm/versions/node/v20.10.0/bin:/usr/bin:/bin
/bin/sh -c 'node --version; node "$0/rewrite/scripts/selftest.mjs"' $X/skills-copy` → `v20.10.0`, 45 `ok`,
"all checks caught their planted violation", exit 0); F7 (`node $S/rule1.mjs $X/lang/{en,ru,zh}.md` → 2, 1, 0
violations; `sections.mjs $X/lang/zh.md` → `1 介绍`); F6, F8, F9, F10 and level-1 items 5–7 by reading the
cited lines (all resolve). Lens 2: R1 (the diff), R2 (`rule1-plant.md` → 4 controls only; `rule1-moved.md` →
only `--keep-data`), R3 (`rule1-install.md` → 0 with and without `--except`), R4 (`dup-miss.md` → 1 section, 0
flagged), R5 (`dup-over.md` → `3 rounds and critics`), R6 (`sec-rename.md` → `119 Installing (no budget)`,
3 over; `sec-drop.md` → no line for Licence), P1–P5 (the lines). The writer's `ledger-guard.log`,
`lifetime-probe.log` and `install-checkout` `saw` read, not re-run.

**Not run**: lens 1's F2 and F4 (host sessions against a stub; would need the stub server and four isolated
configurations — level 3 in its report, its scratch and `stub.log` exist under `$X`), its "Held at level 3"
lifetime table (six cases; the writer's `probe-04/lifetime-probe.log` covers four of them), and every in-app
`/plugin` form (interactive only).

Definition used for the regression column (`rewrite/SKILL.md:181-182`, `loop.md:52-55`): a sentence the
round introduced that its critics showed false or overstated; understated is not counted (`rounds.md`, round
02); decision (f): a reworded or re-pinned sentence counts as introduced only in the words the round changed.
"Introduced/reworded by round 04" is read off `diff -u 03-review.md 04-terms.md`: the hunks touch L23, L26,
L36-38, L40-41, L48-51, L74-79, L104-105 (a cut), L112-115, L118-121; every other line is byte-identical to
`03-review.md`.

**Raised: 42** (lens 1: 15 — F1–F10, level-1 items 5–7, two "Code, not the document" notes; lens 2: 14;
c4-1: 3 guesses that bear on the text; c4-2: 9 guesses; readers: 1, c5-7's confident answer). **Deduplicated:
32**, of which 1 is YOURS (L6.4-32, implied by c5-2's two answers against the key). **Raised by two or more
lenses: 6** (L6.4-02, 05, 10, 11, 17, 28). Rank = lenses, then a run over a read, then whether it overturns a
pinned sentence.

---

## The list, ranked

### L6.4-01. The ratchet sentence claims a rejection the shipped check does not make, and this round is its own counter-example — REGRESSION
- **Lines:** L50-51 — "The shipped check rejects a new round that loses a sentence an earlier round verified, or brings back wording one retired as false." (L51 continues: "That guard is not a promise that no regression can occur.")
- **Finding:** a round that drops the entry in its own edits, or re-declares the same name with a weaker pattern, loses the verified sentence and passes `ledger.mjs` with exit 0, because `round.mjs:119` deletes a dropped entry, `:112` replaces an entry under a reused name, and `ledger.mjs:18-22` tests only the entries left — so "rejects a new round that loses a sentence an earlier round verified" is overstated at level 3, and the hedge that follows does not name the way through.
- **Raised by:** lens 1 F3 (OVERSTATED, level 3). 1 lens. YOURS: the run's own record shows the same case — round 04 cut "The section below describes this commit, not that one." (`03-review.md:75`, pinned G4 at level 2 in round 03) with `"drop": ["G4 …"]` in `edits/04.json[10]`; `grep -c '"G4 ' ledger.03.json ledger.json` → 1, 0; the ledger over 00–04 prints `0 failure(s)`. The drop was legitimate (L6.3-03: a repeat), which is the point: the check is built to let a round release a pin with its sentence, and the sentence says it is not.
- **Check (lens 1's, reproduced):** `node $S/ledger.mjs $X/ratchet/ledger.json $X/ratchet/00-original.md $X/ratchet/01-a.md $X/ratchet/02-b.md` → `0 failure(s)` (02-b lost "until uninstall"; the entry was re-pinned under its name with pattern `keeps runs`); the same files under `$X/ratchet/ledger.02.json` (the ledger before that round) → `keeps-until-uninstall L2 LOST yes LOST`, `1 failure(s)`, exit 1. The drop case, built here in a scratch copy: an edit `{"old":"The tool keeps runs until uninstall.","new":"The tool keeps runs.","drop":["keeps-until-uninstall"]}` → `round.mjs` exit 0 ("ledger: 1 claim(s)"), then `ledger.mjs` → only the `for-ever` row, `0 failure(s)`. Verifier's `probe-04/ledger-guard.sh` (R04b's pin) plants loses / revives / keeps and no drop or re-pin.
- **Introduced:** reworded by round 04 (`edits/04.json[7]`: "loses a pinned sentence or restores wording retired as false" → "loses a sentence an earlier round verified, or brings back wording one retired as false"). The fault lies in the words the round changed: "pinned" named a state the round's own edits can end, and a dropped entry is no longer a pinned sentence when the check runs; "a sentence an earlier round verified" is a property no drop removes. Round 03's wording was already wrong for the re-pin case; round 04's is wrong for both, and the round pinned it as a new level-3 claim (R04b) on a probe that plants neither case.
- **Pin:** R04b (level 3, new this round) — the sentence's own pin; re-pin with a probe that adds lens 1's two cases.
- **Category:** SENTENCE. **Regression charged to round 04: yes** (see the regression section).
- **Edit (mine, two options):** (i) "The shipped check rejects a new round that loses a verified sentence its own edits have not released, or brings back wording one retired as false." (ii) keep the sentence and name the way through in the next one: "That guard is not a promise that no regression can occur: a round may release or re-pin an entry in its own edits, and the check does not see that." Either needs R04b re-pinned with the widened probe.

### L6.4-02. The install route names a clone no reader can obtain: the commit is on no remote
- **Lines:** L74-76 — "This README describes commit `2f29a8f`. To install that commit, run `claude plugin marketplace add` with the path of a local clone checked out at it in place of `Nowely/agent-skills`, then `claude plugin install terse@nowely`."
- **Finding:** 2f29a8f exists only on this machine's local branch — no remote branch, tag or PR head contains it and a fetch by SHA is refused — so the precondition "a local clone checked out at it" cannot be met by any reader on 2026-09-23, and a squash merge would keep it that way.
- **Raised by:** lens 1 F1 ("FALSE as of 2026-09-23", level 3); c4-2 guess 7 (where the pinned clone should live — the reader had no way to have one). 2 lenses. Context, not findings: the writer's open item (`writer-04.md:119-122`, the same facts before the freeze), the round-03 routing (L6.3-02, SCOPE to the owner) and decision (k), which added the line at level 3.
- **Check (lens 1's, reproduced):** `git -C ~/Git/agent-skills branch -a --contains 2f29a8f` → `* terse-process-2026-09-22` only; `git ls-remote https://github.com/Nowely/agent-skills.git` → `main` 8c041b7, `refs/pull/2..14/head`, tags; `for r in <every listed sha>; do git merge-base --is-ancestor 2f29a8f $r; done` → none; `git -C <fresh init> fetch --depth 1 https://github.com/Nowely/agent-skills.git 2f29a8fecec8d74c43a805cc580b7052a69b9523` → `fatal: remote error: upload-pack: not our ref …`; the same for 8c041b76… → `FETCH_HEAD`; `git log --merges --oneline origin/main` → empty.
- **Introduced:** by round 04 (`edits/04.json[9]`, new). The claim as pinned (R04c, level 3: the two commands with a clone at the commit install that commit's tree, 28 files identical) holds — the writer's probe B and lens 1's config4 (`installed_plugins.json` records `gitCommitSha 2f29a8fecec…`) both ran it. What lens 1 shows is that the object the instruction names is unobtainable, not that the instruction is false.
- **Pin:** R04c (level 3).
- **Category:** SCOPE — the durable fix is publishing the commit (the owner's). README side, if the coordinator will not send readers to an object that does not exist: cut L74's second sentence until the branch is pushed, keeping "This README describes commit `2f29a8f`." (R04c dropped; L6.3-02's gap reopens and is recorded), or condition it: "To install that commit where a clone of it exists, …". **Regression: not by the definition** (judged in the regression section).

### L6.4-03. The install from a clone does not pin the commit: Claude Code reads the clone's working tree at every session start
- **Lines:** L74-76 (the same sentence); L77-79 says what 21a225b's pages do.
- **Finding:** after `marketplace add <clone>` and `plugin install terse@nowely` the skill pages are read from the clone in place, so `git checkout 21a225b` in the clone, with no plugin command, makes the next session run the page L78-79 warns about while `installed_plugins.json` still says 2f29a8f — the sentence is understated: "install that commit" holds only while the clone stays on it.
- **Raised by:** lens 1 F2 (UNDERSTATED, level 3); lens 2 W1 (4 words of the same sentence: "in place of `Nowely/agent-skills`" repeats what "with the path of a local clone" says). Two lenses on one sentence for two faults — ranked single-lens.
- **Check (lens 1's, not re-run; its records read):** config4 `known_marketplaces.json` → `"source": "directory", "path": "$X/clone-live"`, `"installLocation": "$X/clone-live"`; `installed_plugins.json` → `installPath …/cache/nowely/terse/0.1.1`, `gitCommitSha 2f29a8f…`; stub request after `git -C $X/clone-live checkout -q 21a225b` carries 21a225b's rewrite page ("Work in a run directory of the document's own — `research/<date>-<slug>/` …"); the CLI's own line "it loads in place from …/plugins/terse, so edits there take effect at the next session start or /reload-plugins" (config2, config3). Note the cache directory exists in every install (c4-1 found it too); lens 1's evidence is about which path the loaded page comes from.
- **Introduced:** by round 04. Understated → not a regression by the definition.
- **Pin:** R04c (level 3) — an edit here re-pins it; the added clause is a lifecycle claim and needs a run (lens 1's steps 1–4) as its check, not a read.
- **Category:** SENTENCE.
- **Edit (mine, folding W1):** "To install that commit, run `claude plugin marketplace add` with the path of a local clone checked out at it, then `claude plugin install terse@nowely`; Claude Code reads the plugin from that clone at each session start, so keep the clone at the commit." (−4 +18 words.)

### L6.4-04. The install block sits eight lines before the sentence that says what it installs
- **Lines:** L64-69 — "Inside Claude Code:" / "/plugin marketplace add Nowely/agent-skills" / "/plugin install terse@nowely"; L71-72 the shell form; L77-78 — "On 2026-09-22 the install commands with `Nowely/agent-skills` resolved to `21a225b`, whose audit and rewrite pages differ from the ones described here".
- **Finding:** the block carries no condition, so a reader who copies it has installed 21a225b before reaching the sentence that says the pages then differ; decisions (d), (g) and (k) fixed the words and the section, not the order inside it.
- **Raised by:** lens 2 P1 (level 2). 1 lens. Evidence from the readers, not a finding of theirs: round 04's c5-2 needed two sections and answered Q2 about 21a225b's pages ("A version resolved from the default install commands could write into the document repository"), where round 03's c5-2 answered from *Where it writes* alone.
- **Check:** `sed -n '64,69p;77,79p' $R/04-terms.md`; `cat $R/reviews/03/c5-2.md $R/reviews/04/c5-2.md`.
- **Introduced:** the block inherited (C18, C19, level 2); the order is round 02's (G4 moved *Where it writes* below *Install*), the boundary paragraph's position round 03's.
- **Pin:** none broken by a move — `ledger.mjs` tests presence over whitespace-normalised text, and rule 1 applies above the cut only.
- **Category:** STRUCTURE — UNSETTLED for the coordinator: the order inside *Install*.
- **Edit (mine):** move L74-79 (the boundary paragraph, as it is) above L64 "Inside Claude Code:", so the reader meets "This README describes commit `2f29a8f`. To install that commit, …" before the block that installs something else.

### L6.4-05. "Markdown in any language" is overstated at level 3: two shipped checks read English words and spaces, and no shipped file states the scope
- **Lines:** L5-6 — "The intended scope is Markdown in any language, whether or not the document is about software."; L6-8 qualify the no-code case only.
- **Finding:** `rule1.mjs:29`'s exit-code words are English (a Russian "завершается с кодом 2" passes that part) and `sections.mjs:13` splits on whitespace (a 26-character Chinese sentence counts as one word, so budgets and growth mean nothing for scripts without spaces); the sentence after it limits the no-code case and nothing limits other languages; and the "intended scope" rests on no shipped file, only `ISSUES.md:119-120`.
- **Raised by:** lens 1 F7 (OVERSTATED, level 3) and its level-1 item 7; c5-7 (round 04) took the sentence as a confident "Yes" to Q7. 2 lenses.
- **Check (lens 1's, reproduced):** `node $S/rule1.mjs $X/lang/en.md` → `--force`, `exits 2` (2 violations); `$X/lang/ru.md` → `--force` only; `node $S/sections.mjs $X/lang/zh.md` → `1 介绍`; `sed -n '29p' $S/rule1.mjs; sed -n '13p' $S/sections.mjs`; `grep -rn -i "intended scope\|any language" $P` → nothing in the shipped pages (the phrase is the README's).
- **Introduced:** inherited — byte-identical since round 02 (round-03 dedup L6.3-28 checked it). Decision (e) left the sentence on the ground that Q7's key is the coordinator's matter; decision (l) reads the gate. Neither decision saw a level-3 truth defect in the sentence, which is new ground.
- **Pin:** none (no ledger pattern covers L5-6; checked: `grep -c "any language" $R/ledger.json` → 0).
- **Category:** UNSETTLED — whether (e) stands against level-3 evidence is the coordinator's. CODE side: the `rule1.mjs` half is recorded (ISSUES E8); the `sections.mjs` half (whitespace tokenising) is new for `code-defects.md`.
- **Edit (mine, if (e) is reopened):** L7-8 "…this weaker truth pass has not been measured, and two of the shipped checks read English words and space-separated text." Otherwise none, and the `sections.mjs` half goes to the code.

### L6.4-06. The Q7 reader answered "Yes." on unchanged text — by decision (l) the failure is round 04's
- **Lines:** L5-6 and L26 — "Readers start at the entry file and may open only Markdown." — the two sentences c5-7 quoted in rounds 03 and 04.
- **Finding:** round 02's c5-7 said "Yes", round 03's GUESSED "Probably yes … the document does not explicitly confirm", round 04's "answered: Yes. Russian documentation is within scope, and readers follow the documented reading procedure." — on sentences byte-identical across the three rounds (L26's first sentence gained ", a model agent," in round 04; the quoted second sentence did not change); the key (`audit.md:955-958`) is UNANSWERABLE, "A confident yes or no is a failure", so under decision (l) round 04's question gate reads 6 of 7, and the flip has no textual cause.
- **Raised by:** c5-7 (round 04). 1 lens. = round-03 L6.3-28's instrument note, third occurrence.
- **Check:** `cat $R/reviews/02/c5-7.md $R/reviews/03/c5-7.md $R/reviews/04/c5-7.md; grep -n -E "any language|may open only Markdown" $R/02-grafts.md $R/03-review.md $R/04-terms.md; sed -n '955,958p' $R/audit.md; sed -n '46,47p' $R/skeleton.md`.
- **Category:** METHOD — one trial per question on a planted unanswerable is noise at this size (Yes / GUESSED / Yes on one text); the text cannot fix it without changing the sentence (e) keeps. No edit. Recorded under E14.

### L6.4-07. "Running a skill needs you signed in to it" — an API key runs it too
- **Lines:** L61 — "Install Claude Code first. Running a skill needs you signed in to it; for `audit` and `rewrite`, also put Node 22 or newer on `PATH`."
- **Finding:** configurations never signed in ran `-p "/terse:audit"` and `-p "/terse:rewrite"` to `"subtype":"success"` with `ANTHROPIC_API_KEY` set (against a local stub), and printed "Not logged in · Please run /login" only without a key — sign-in is one of two ways to authenticate.
- **Raised by:** lens 1 F4 (OVERSTATED, level 3 against the stub). 1 lens.
- **Check (lens 1's, not re-run):** `$X/cl.sh` with `EXTRA_ENV="ANTHROPIC_BASE_URL=http://127.0.0.1:48123 ANTHROPIC_API_KEY=sk-ant-stub-000"`, config and config3, `-p "/terse:audit"` / `-p "/terse:rewrite"` → `STUB-REPLY`; `$X/stub.log` holds the request bodies. R03h's probe (`probe-03/install-probe.sh`) tested the no-key path only ("/terse:audit, not signed in: exit 1, Not logged in").
- **Introduced:** inherited — L61-62 byte-identical to `03-review.md:60-61`.
- **Pin:** R03h (level 3) → re-pin with the API-key run added to its probe.
- **Category:** SENTENCE.
- **Edit (mine):** "Running a skill needs Claude Code authenticated, by sign-in or an API key; for `audit` and `rewrite`, …" (+5 words).

### L6.4-08. "Node 22 or newer" is the declared floor, not what the scripts need: Node 20 runs them clean
- **Lines:** L61-62 — "…for `audit` and `rewrite`, also put Node 22 or newer on `PATH`."
- **Finding:** with only Node 20.10.0 on `PATH` the self-test runs all 45 checks and exits 0; the six scripts use no API newer than Node 20; the 22 is `package.json:4-6`'s `"node": ">=22"`, a declaration the text presents as a need.
- **Raised by:** lens 1 F5 (OVERSTATED, level 3). 1 lens. The round-03 dedup listed the floor under "not covered" ("declared, not enforced"); the audit key Q1 (`audit.md:872-873`) already said "the package declares 22 or newer".
- **Check (lens 1's, reproduced):** `env -i PATH=~/.nvm/versions/node/v20.10.0/bin:/usr/bin:/bin /bin/sh -c 'node --version; node "$0/rewrite/scripts/selftest.mjs"' $X/skills-copy` → `v20.10.0`, `all checks caught their planted violation`, exit 0; `cat $P/package.json`.
- **Introduced:** inherited (same line). **Pin:** R03h (level 3; its probe tested "no node on PATH → exit 127", not a version) → re-pin.
- **Category:** SENTENCE.
- **Edit (mine):** "…also put Node on `PATH`; the package declares 22 or newer." (−3 +5 words.)

### L6.4-09. `rewrite` also needs `/bin/sh`, which the prerequisites do not say
- **Lines:** L61-62 (the same sentence).
- **Finding:** `round.mjs:86` runs every edit's check with `spawnSync("/bin/sh", ["-c", …])` and `:87` refuses the round when the spawn errors, so on a host without `/bin/sh` every round whose edits carry a claim is refused.
- **Raised by:** lens 1 F6 (UNDERSTATED, level 2; no Windows host). 1 lens.
- **Check:** `sed -n '86,87p' $S/round.mjs`.
- **Introduced:** inherited. **Pin:** R03h. **Category:** SENTENCE, low; the pages do not state it either (a page gap the coordinator may add to `code-defects.md`).
- **Edit:** none proposed — every macOS and Linux host has it; if wanted, "…and a POSIX `/bin/sh`" (+4 words).

### L6.4-10. "two judges" and the announce line hide two branches the page has: a third judge on a split, one candidate when you refuse the fan-out
- **Lines:** L41-42 — "For an existing document, an adversarial read precedes a bake-off: three whole-file candidates and two judges."; L56-57 — "All three skills announce how many agents they are about to spawn, on which model, and wait for your word."
- **Finding:** `bake-off.md:22` gives "judges | 2 | a third only when the two split" — this run's own round 01 used three (`rounds.md` row 01: "Fable J3 (third, on a split)") — and `rewrite/SKILL.md:61-62` says a refused fan-out means "write one candidate yourself from the same brief and report that the comparison was skipped"; the README says neither, and the task reader guessed "the run does not start".
- **Raised by:** lens 1 F9 (UNDERSTATED, minor, level 2); c4-2 guess 6 ("What a decline at Word Point 1 does"). 2 lenses.
- **Check:** `sed -n '22p' $P/skills/rewrite/references/bake-off.md; sed -n '60,62p' $P/skills/rewrite/SKILL.md; grep -n "J3" $R/rounds.md`.
- **Introduced:** inherited (L41-42 = `03-review.md:40-41`; L56-57 unchanged since round 02). **Pins:** R03d (level 2), G1 (level 2) → re-pin.
- **Category:** SENTENCE.
- **Edit (mine):** L42 "…three whole-file candidates and two judges, a third when they split."; L57 "…and wait for your word; refuse it and `rewrite` writes one candidate itself, without the comparison." (+5, +12 words.)

### L6.4-11. The README names one stop per skill; the pages have more, and both task readers hit the difference
- **Lines:** L25-26 — "**`/terse:audit`** writes a reader profile, a claim ledger, and an answer key before assigning one fresh reader, a model agent, to each question."; L56-57 (the announce sentence).
- **Finding:** (a) `audit/SKILL.md:21-28` step 1 is "Settle three things with the user in one exchange" — files, backing repository, entry file — before the profile, and c4-1's live run stopped exactly there at turn 7 with zero writes, a stop the README never previews; (b) `rewrite/SKILL.md:54-56` runs the adversarial read, an agent, before the announce paragraph at `:60-62`, and only a parenthesis suggests the announcement covers it; (c) `rewrite/SKILL.md:131-132` announces the wave before every round, so the announce fires per phase, where c4-2 guessed once per invocation.
- **Raised by:** c4-1 guess 3 (the scope check, level 3 observed) and guess 1 (audit takes no argument — held; the page settles scope in the exchange instead); c4-2 guess 3; lens 1 level-1 item 6. 3 lenses.
- **Check:** `sed -n '21,28p;86,87p' $P/skills/audit/SKILL.md; sed -n '54,62p;131,132p' $P/skills/rewrite/SKILL.md; sed -n '78,93p' $R/reviews/04/c4-1.md`.
- **Introduced:** inherited — L25's words before ", a model agent," are round 02's; L56-57 round 02's (G1). **Pins:** C06 (level 2), G1 (level 2) → re-pin.
- **Category:** SENTENCE. (b) is the page's own ambiguity — a line for `code-defects.md` if the coordinator wants it.
- **Edit (mine):** L25 "**`/terse:audit`** settles the scope with you in one exchange, then writes a reader profile, …" (+9); L56-57 "All three skills announce how many agents they are about to spawn, on which model, and wait for your word — `rewrite` before its bake-off and again before each round's critics." (+11).

### L6.4-12. Ending the loop and applying the candidate are two words, and the text lets them read as one
- **Lines:** L45-46 — "The loop stops when you read a round and say whether you would send it as it is."; L89-90 — "Copying that defect into the repository's `ISSUES.md`, or applying the candidate to your document, requires your word."
- **Finding:** `rewrite/SKILL.md:188-192` makes them two moments ("The loop stops when the user … says whether they would send it as it is. … Then stop: applying the candidate to the user's files needs their word"), and the reader planning the stop point had to guess that.
- **Raised by:** c4-2 guess 2. 1 lens.
- **Check:** `sed -n '188,192p' $P/skills/rewrite/SKILL.md; sed -n '88,94p' $R/reviews/04/c4-2.md`.
- **Introduced:** inherited (R03f, R02d). **Pins:** R03f (level 2) → re-pin if L46 changes.
- **Category:** SENTENCE, low.
- **Edit (mine):** L46 "…say whether you would send it as it is; applying it needs a second word." (+7.)

### L6.4-13. How `rewrite` is pointed at an audit run: the page asks you for the path, the README says nothing
- **Lines:** L40-41 — "**`/terse:rewrite`** starts from that skeleton or an audit's run file, or resumes a run of its own that already holds rounds."
- **Finding:** `rewrite/SKILL.md:29` "Ask the user for the run directory from `audit`" and `:74` (a resumed run is given its path by the user); the reader guessed a path argument.
- **Raised by:** c4-2 guess 1. 1 lens. The 2026-09-22 audit's task reader TB listed "the invocation syntax" among its forced guesses (`audit.md:989`) — context.
- **Check:** `sed -n '29p;74p' $P/skills/rewrite/SKILL.md`.
- **Introduced:** reworded by round 04 (`edits/04.json[4]`); the fault — no mention that the skill asks — is inherited from "starts from that skeleton or an audit run". **Pin:** C11 (level 2, provisional by `round.mjs`'s "resum") → re-pin.
- **Category:** SENTENCE, low.
- **Edit (mine):** "…or an audit's run file, whose path it asks you for, or resumes…" (+6.)

### L6.4-14. `rewrite`'s fourth way in (no skeleton, no run: guesses, and says so) — SUPERSEDED
- **Lines:** L40-41. **Raised by:** lens 1 F8 (UNDERSTATED, level 2; `rewrite/SKILL.md:21`). 1 lens. = round-03 L6.3-12's UNSETTLED facet.
- **Category:** SUPERSEDED — decision (j) (round 04): "the README does not name rewrite's guess route". No edit.

### L6.4-15. What the writers and critics write never reaches the run directory, so "copy a run" does not keep it
- **Lines:** L87 — "The `rewrite` instructions place their run by the same rule,"; L95-96 — "…copy a run you want to keep."
- **Finding:** writers put candidates and drafts in "your own temporary directory" (`bake-off.md:57-58, 87`), critics write under `$TMPDIR` (`critic-briefs.md:44, 80, 132, 147`), and the run directory's return list (`rewrite/SKILL.md:196-208`) has rounds, ledgers and reviews, not the three candidates or the judges' sheets.
- **Raised by:** lens 1 F10 (UNDERSTATED, minor, level 2). 1 lens.
- **Check:** `sed -n '57,58p;87p' $P/skills/rewrite/references/bake-off.md; sed -n '44p;80p;132p;147p' $P/skills/rewrite/references/critic-briefs.md; sed -n '196,208p' $P/skills/rewrite/SKILL.md`.
- **Introduced:** inherited (R02c, G3c). **Category:** SENTENCE, low. The README does not claim the run holds everything; the gap is the page's return list. No README edit; a line for `code-defects.md` if the coordinator routes it.

### L6.4-16. The chain's numbers stand as the plugin's in the one section that lacks the qualifier
- **Lines:** L100-102 — "It is not a compressor. … On one file measured on 2026-09-10, a four-pass rewrite chain moved 2,725 words to 2,571 — six percent — …"; L112-113 — "The chain, four passes that preceded the plugin's bake-off and rounds, covered one README."
- **Finding:** a reader of *What it will and will not do* alone takes the 2,725 → 2,571 as what "it" (the plugin) does; the sentence that says the chain preceded the plugin's procedure sits in the next section.
- **Raised by:** lens 2 P3 (level 2). 1 lens. = the residue of round-03 L6.3-09, which the writer applied at L112-113 and left L101 "unchanged (C24 stays)".
- **Check:** `sed -n '100,102p;112,113p' $R/04-terms.md`.
- **Introduced:** L101 inherited (round 03's "a four-pass rewrite chain"). **Pin:** C24 (level 3, `wc -w` over the chain files) → re-pin with the same run.
- **Category:** SENTENCE.
- **Edit (mine):** L101 "On one file measured on 2026-09-10, the four-pass chain that preceded the plugin moved 2,725 words to 2,571 …" (+3 −2; repetition at a decision point, `writing-rules.md:21-22`).

### L6.4-17. Every audit writes its own key, a re-audit must use the same one, and no page says how a candidate in the run directory is re-audited under it
- **Lines:** L25 (audit "writes … an answer key"); L53-54 — "When you re-audit after a rewrite, use the same questions, answer key, entry file, and model; changing one makes it a new measurement rather than a comparison."; L14-15 the diagram's "candidate + diff → /terse:audit again".
- **Finding:** no sentence says an audit can take a key it did not write (lens 2), and no page says how audit measures a candidate that is still in the run directory, since readers start at the entry file in the repository (`measure.md:49`) and the candidate reaches it only on the user's word (`rewrite/SKILL.md:191-192`) (lens 1).
- **Raised by:** lens 2 P4 (level 2); lens 1 level-1 item 5. 2 lenses. = round-03 L6.3-29 and round-02 L6-31/D1.
- **Check:** `sed -n '106,109p;49p' $P/skills/audit/references/measure.md; sed -n '191,192p' $P/skills/rewrite/SKILL.md; grep -n -i "same key\|answer key" $R/code-defects.md ~/Git/agent-skills/ISSUES.md`.
- **Category:** CODE, recorded — `code-defects.md` D1 (the candidate's location) and ISSUES E14 (the planted question under the same key), per the round-03 routing. The grep shows neither entry's text names the key-reuse route itself (D1:15 quotes "Same questions, same key"); one clause in D1 would close that. No README edit: the README may not state what no page states.

### L6.4-18. "its diff from the original" on the route where there is no original
- **Lines:** L48 — "A round is handed over as a candidate and its diff from the original."; L10-11 — "Start with `/terse:rethink` when the document is missing or its shape is wrong."; L14 (the rethink row of the diagram).
- **Finding:** `rewrite/SKILL.md:191` hands over "`diff-NN.patch`, the diff against `00-original.md`" on both routes, and on the missing-document route there is nothing to diff against.
- **Raised by:** lens 2 P5 (level 2). 1 lens.
- **Check:** `sed -n '190,191p' $P/skills/rewrite/SKILL.md; sed -n '10,11p;48p' $R/04-terms.md`.
- **Introduced:** L48 reworded by round 04 (`edits/04.json[5]`, R04a new, level 2) — the register changed, the claim did not; it restates the page under the L23 frame and was not shown false.
- **Category:** CODE, new, low — the page's gap. README side: none.

### L6.4-19. "requires your word" against "without asking" — SUPERSEDED
- **Lines:** L89-90 against L78-79. **Raised by:** lens 2 P2 (level 2), listed by its own account "because the lens asks for every pair". 1 lens.
- **Category:** SUPERSEDED — decision (d) ("no repeat at the head of *Where it writes*") and (g). The reader-side effect is L6.4-04's.

### L6.4-20. The record's decision (a) quotes a frame sentence the text no longer has
- **Lines:** L23 — "Each skill is a page of instructions for Claude; below is what each page and its references say." against `skeleton.md:15` — "Each skill is a page of instructions for Claude; below is what each page says."
- **Finding:** round 04 applied the round-03 dedup's L6.3-17 (`edits/04.json[0]`, R03a re-pinned) and `skeleton.md`, which `rewrite/SKILL.md:199-200` says is "kept current with every decision taken after it was agreed", still quotes the round-03 wording; decision (h) governs the frame without quoting it, so no rule is broken and the record is stale.
- **Raised by:** lens 2 R1 (level 1). 1 lens. Lens 2 could not say which side changed (it was forbidden the edits and the ledger); resolved here: the text changed, the record did not.
- **Check:** `grep -n -F "below is what each page says." $R/04-terms.md` → nothing; `sed -n '15p' $R/skeleton.md`; `node -e 'console.log(JSON.parse(require("fs").readFileSync("'$R'/edits/04.json"))[0].new)'`.
- **Category:** METHOD (the run's record).
- **Edit (mine, to `skeleton.md`, under (h)):** "Round 04 (L6.3-17): the frame reads '…below is what each page and its references say.'; R03a re-pinned."

### L6.4-21. `rule1.mjs` misses the forms this document writes — a recorded defect plus four unrecorded ones
- **Lines:** none violated in the frozen file (nothing of the kind sits above `## Install`); `skeleton.md:10` names an environment variable as one reason *Where it writes* moved below the cut.
- **Finding:** a plant of nine lines above the cut catches only the three controls: `${TMPDIR:-/tmp}/terse`, bare `PATH` and `TMPDIR` (the env-var pattern `rule1.mjs:28` needs `$` + capitals or an underscore — D4), `/tmp` and `/tmp}/terse` (the path pattern `:26` needs two segments with no `}` between), `claude -p` (the flag pattern `:27` needs `--`), "exits non-zero" (the exit pattern `:29` needs a digit); with *Where it writes* moved back above *Install* the check reports only `--keep-data` and misses `${TMPDIR:-/tmp}/terse` — the reason the section was moved is one the check cannot see.
- **Raised by:** lens 2 R2 (level 3). 1 lens. = round-02 L6-13, round-03 L6.3-26 for the braced form.
- **Check (lens 2's, reproduced):** `node $S/rule1.mjs $L/rule1-plant.md --cut Install --except Install` → lines 65, 66, 66, 67 only, `4 violation(s)`; `node $S/rule1.mjs $L/rule1-moved.md --cut Install --except Install` → `! line 71 flag name --keep-data`, 1 violation; `sed -n '26,29p' $S/rule1.mjs`.
- **Category:** CODE — D4 records the bare name and the braced form; the single-segment path, the path after `}`, the short flag and the digitless exit code are new evidence for the same entry.

### L6.4-22. `--except Install` under `--cut Install` does nothing, so every round's "0 excused" says nothing about *Install*
- **Lines:** none; the run's own command, `rule1.mjs … --cut Install --except Install`, in every round's checks (`writer-04.md:98, 173`, `rounds.md`, the round-03 dedup's reproduction, this file's).
- **Finding:** `rule1.mjs:22-24` keeps only the lines above the cut and `:33-38` looks for the excepted heading among those lines, so an `--except` naming the cut heading is dropped and a path or flag planted inside *Install* is reported neither with nor without it; the page's form (`rewrite/SKILL.md:121`, `--except "<section that may carry paths>"`) means a section *before* the cut.
- **Raised by:** lens 2 R3 (level 3). 1 lens.
- **Check (lens 2's, reproduced):** `diff $R/04-terms.md $L/rule1-install.md` → one planted line inside *Install* (`/usr/local/bin/node`, `--plant-flag`); `node $S/rule1.mjs $L/rule1-install.md --cut Install --except Install` and the same without `--except` → `0 violation(s), 0 excused` both; `sed -n '22,24p;33,38p;45p' $S/rule1.mjs`.
- **Category:** METHOD — the run's command line carries a dead flag and the record reports its output as if *Install* were scanned; CODE, minor: the script could warn when an excepted heading is not found before the cut.

### L6.4-23. `dup.mjs` counts pattern hits, so its "0 in three or more sections" is bounded by `concepts.json`, and a `0` row cannot say whether the idea or only its wording left
- **Lines:** none; the run's dup output row `0   the verifier before the freeze`.
- **Finding:** the approval fact planted in three sections in words outside the pattern is reported in one (`dup.mjs:18-23` matches regexes only, as its header `:5-6` says: the judgement is the reader's); and the `0` row for the verifier concept is, on inspection, the idea gone from the text (`grep -n -i verifier $R/04-terms.md` → nothing since round 03), which the row cannot distinguish from a pattern miss.
- **Raised by:** lens 2 R4 (level 3). 1 lens.
- **Check (lens 2's, reproduced):** `diff $R/04-terms.md $L/dup-miss.md` (two planted approval sentences); `node $S/dup.mjs $L/dup-miss.md $R/concepts.json` → `1   nothing written to your files without your word   Where it writes`, `0 concept(s) in three or more sections`.
- **Category:** METHOD — an instrument limit by design; the verdict "clean" in the record is a verdict on nineteen patterns.

### L6.4-24. Two `concepts.json` patterns over-match: `round|critic` inside other words, and one concept holds two facts
- **Lines:** none violated; `concepts.json` rows "rounds and critics" (`round|critic`) and "no no-document arm" (`no document at all|no-document`).
- **Finding:** "A background shell works too." planted in *Install* raises "rounds and critics" to three sections (no word boundaries), and "no no-document arm" matches both L29 (the audit's baseline, a feature) and L113 (the experiment's missing arm, a limit) — two facts under one name, unflagged today only because that is two sections.
- **Raised by:** lens 2 R5 (level 3). 1 lens. = the residue of round-03 L6.3-27 (two patterns replaced in round 04; these two were not).
- **Check (lens 2's, reproduced):** `node $S/dup.mjs $L/dup-over.md $R/concepts.json` → `3   rounds and critics   What each one does | Install | What was measured   <<<`; `grep -n "no-document" $R/04-terms.md` → 29, 113.
- **Category:** METHOD (the run's own file).
- **Edit (mine, to `concepts.json`):** `\\brounds?\\b|\\bcritics?\\b`; split the second: "no no-document arm" → `no no-document arm|no document at all` (the limit), and a new row "no-document baseline" → `no-document baseline` if the feature is to be tracked at all.

### L6.4-25. `sections.mjs` loses a renamed section from the over-budget count and says nothing when a budgeted section disappears
- **Lines:** none. **Raised by:** lens 2 R6 (level 3). 1 lens.
- **Check (lens 2's, reproduced):** `node $S/sections.mjs $L/sec-rename.md $R/budgets.json` → `119 Installing   (no budget)`, `3 section(s) over budget` (was 4); `node $S/sections.mjs $L/sec-drop.md $R/budgets.json` → no Licence line, no warning; `sed -n '19,24p' $S/sections.mjs`.
- **Category:** CODE, new, low — a report, not a gate, but a silent one.

### L6.4-26. Water: 3 words in two pinned sentences
- **Lines:** L19 — "The plugin ships three user-invoked skills." (→ "All three are user-invoked.", −2); L120 — "A separate experiment used ten agents…" (→ "Another experiment…", −1).
- **Raised by:** lens 2 W2, W3. 1 lens. NO CHECK beyond the reading.
- **Introduced:** L19 inherited (C03, level 3, pattern is the whole sentence); L120 reworded by round 04 (C42 re-pinned, level 2).
- **Category:** SENTENCE, low. Both edits break a pin's pattern; recommend skipping — 3 words are not worth two re-pins, one of them level 3.

### L6.4-27. The "achieved" task ran on the owner's signed-in profile, not the isolated configuration, and left a directory there
- **Lines:** none in the document. `tasks.json` task 1's start: "An isolated Claude configuration directory under $TMPDIR keeps the install off the machine's real one."
- **Finding:** c4-1 installed into the isolated configuration and then ran `/terse:audit` on the real profile ("real (signed-in) profile, no `CLAUDE_CONFIG_DIR` override", `c4-1.md:47-53`) with `--plugin-dir` pointing at the isolated cache; the coordinator's snapshots show `~/.claude/plugins/data/terse-inline` (empty, `drwxr-xr-x 2 … 64`) created at 17:12, between the before (17:06) and after (17:18) listings, while c4-1's isolated install was recorded at 14:11:24Z (17:11 local) — the directory is that run's; c4-1 checked `terse-nowely` for change and did not list the parent. The isolated install recorded `gitCommitSha b7a17da` (the checkout's HEAD; its `plugins/terse` equals 2f29a8f's), not 2f29a8f, which c4-1 could not tell ("no version number").
- **Raised by:** c4-1's own report (the profile choice; the harness facts it was given: `--plugin-dir`, the non-interactive flags, the before/after requirement). YOURS: the attribution of `terse-inline` from the coordinator's `probe-04/real-data-dir-{before,after}-lens4.txt` and the timestamps.
- **Check:** `cat $R/probe-04/real-data-dir-before-lens4.txt $R/probe-04/real-data-dir-after-lens4.txt; ls -la ~/.claude/plugins/data/terse-inline; grep -n gitCommitSha $TMPDIR/terse-fresh-reader-config/plugins/installed_plugins.json; sed -n '47,56p' $R/reviews/04/c4-1.md`.
- **Category:** METHOD — the task gate's "achieved" rests on a run outside the task's own isolation; the directory is the second time this wave's tooling wrote into the real profile's plugin data (lens 1's "Code, not the document" describes the same creation in an isolated config4). Nothing to edit; the coordinator decides whether the empty directory is removed and whether the gate counts the run.

### L6.4-28. A `--plugin-dir` checkout gets a data directory the pages do not name, and it is created at load, before any run
- **Lines:** L83-85 — "The `audit` instructions create the run in the plugin's data directory when Claude Code supplies one, and otherwise under `${TMPDIR:-/tmp}/terse`. Installed, the runs land in `plugins/data/terse-nowely/runs/` inside Claude Code's configuration directory."
- **Finding:** under `claude --plugin-dir <checkout>/plugins/terse` the audit page arrives with `D="<CLAUDE_CONFIG_DIR>/plugins/data/terse-inline"` (lens 1, level 3, stub) — not the `$TMPDIR` fallback `audit/SKILL.md:36-37` and `CHANGELOG.md:34-35, 63-64` describe — and the directory exists after a session that wrote nothing (L6.4-27), so c4-1's guess 4 ("where a `--plugin-dir`-loaded run's output lands") has an answer the README and the pages do not give.
- **Raised by:** lens 1 "Code, not the document" (i) (level 3); c4-1 guess 4 (unresolved by its run). 2 lenses.
- **Check:** `find $X/config4/plugins/data -maxdepth 1` → `terse-inline`, `terse-nowely`; `ls -la ~/.claude/plugins/data/` (read-only); `sed -n '36,37p' $P/skills/audit/SKILL.md`.
- **Introduced:** L83-85 inherited (R02a, R03b, level 3 for the installed and empty-`D` cases). Not false for the two cases it names.
- **Category:** CODE, recorded — `code-defects.md` D5 ("A checkout loaded with `claude --plugin-dir` puts its runs in a data directory the pages do not name"); this wave adds that the directory is made before any run and once landed in the real profile. No README edit (decision: the README names the installed and the checkout-in-shell cases; `--plugin-dir` is the pages' gap).

### L6.4-29. The bare `$CLAUDE_PLUGIN_ROOT` arrives unsubstituted in the rendered page
- **Lines:** none in the README. **Raised by:** lens 1 "Code, not the document" (ii) (level 3 for the substitution half; the export half not run). 1 lens. = round-02 L6-35, round-03 L6.3-25.
- **Check:** `$X/stub.log` (line 149 of the audit text the stub received); `sed -n '159p' $P/skills/audit/SKILL.md; sed -n '83p' $P/skills/rewrite/SKILL.md`.
- **Category:** CODE, recorded — ISSUES E10 (level 2 there; lens 1's stub body raises the substitution half to level 3, evidence to add).

### L6.4-30. Three things the task reader needed that no page states
- **Lines:** L48 (no filenames for the candidate and diff); L40-41 (whether a run from another commit is valid input); L89-90 (who performs the write after the word).
- **Finding:** the pages name `diff-NN.patch` and `NN-<pass>.md` (`rewrite/SKILL.md:119, 191`) but the README does not (guess 4); no page says whether an audit run from one commit is input to another commit's `rewrite` (guess 8); `rewrite/SKILL.md:191-192` says applying "needs their word" and not who applies (guess 9).
- **Raised by:** c4-2 guesses 4, 8, 9. 1 lens. NO CHECK beyond the reading (`grep -rn -i "apply\|applies" $P/skills/rewrite/SKILL.md`; `grep -rn "commit" $P/skills/rewrite/SKILL.md` → nothing on run validity).
- **Category:** CODE, new, low for 8 and 9 (page gaps; the README may not state what no page states); SCOPE for 4 (the README does not list files). No README edit.

### L6.4-31. "copy a run you want to keep" — the page adds "somewhere durable"
- **Lines:** L95-96 — "The `audit` and `rewrite` pages warn that the operating system may purge a run in the temporary directory; copy a run you want to keep."
- **Finding:** `audit/SKILL.md:41-42` says "a run which must outlive either is the user's to copy somewhere durable"; the reader guessed "anywhere outside the repository".
- **Raised by:** c4-2 guess 5. 1 lens. **Check:** `sed -n '41,42p' $P/skills/audit/SKILL.md`.
- **Introduced:** inherited (G3c, round 03). **Pin:** G3c (level 2) → re-pin. **Category:** SENTENCE, low.
- **Edit (mine):** "…copy a run you want to keep somewhere durable." (+2.)

### L6.4-32. YOURS — the key's Q2 answer is for the pages the install block fetches, not the ones this README describes, and the two rounds' readers answered from different commits
- **Lines:** L77-79 (21a225b's rewrite page "wrote into the document repository without asking") and L86-90 (2f29a8f's: "forbids writing into the audited repository"; "requires your word").
- **Finding:** the key (`audit.md:883-894`) answers Q2 "yes, `rewrite` does, without a word about files. It works in `research/<date>-<slug>/` at the root of the repository" from `rewrite/SKILL.md:66-67` at 1a24018 — the page 21a225b still ships — and scores "nothing reaches my files without my word" wrong; at 2f29a8f the same lines say "outside the repository that holds it". Round 03's c5-2 answered from 2f29a8f's sentences (right for the described commit, wrong by the key's letter); round 04's c5-2 answered from 21a225b's sentence at L77-79 (right by the key, about the commit the block installs, which the README says it does not describe). Both are labelled "answered", and the gate cannot score Q2 without deciding which commit the question is about. `measure.md:108` ("Same questions, same key") has no provision for the code changing between the audit and the re-measure — E14's sibling for a code change rather than a planted question.
- **Raised by:** implied by c5-2 (rounds 03 and 04) against the key; no critic named it. YOURS.
- **Check:** `sed -n '881,897p' $R/audit.md; cat $R/reviews/03/c5-2.md $R/reviews/04/c5-2.md; git -C ~/Git/agent-skills show 21a225b:plugins/terse/skills/rewrite/SKILL.md | sed -n '64,67p'; sed -n '66,67p' $P/skills/rewrite/SKILL.md; sed -n '106,109p' $P/skills/audit/references/measure.md`.
- **Category:** METHOD (the run's gate reads Q2 against a key for other code); CODE side new for `code-defects.md` (the same-key rule against a code change), or a clause in E14.

---

## Conflicts between critics

1. **Lens 1 F3 against the verifier's R04b HOLDS (L6.4-01).** The verifier ran `ledger-guard.sh` (loses / revives / keeps → 1 / 1 / 0) and held the sentence at level 3; lens 1 planted a drop and a re-pin and both pass. Both true; the pin's cases are a subset. Lens 1 wins: the sentence claims the superset.
2. **Lens 1 F1 "FALSE" against R04c HOLDS, the writer's open item and decision (k) (L6.4-02).** The label is the dispute: lens 1's evidence shows the clone cannot be obtained; R04c's shows the commands with such a clone install that commit. The sentence is unfollowable, not false. For the coordinator; my reading is SCOPE, 0 regressions, with the README-side options stated.
3. **Lens 1 F2 (pages loaded from the clone in place) against the writer's install probe and c4-1's cache tree (L6.4-03).** Not contradictory: config4 records both `installPath …/cache/nowely/terse/0.1.1` and the marketplace's `installLocation: clone-live`, and the stub request shows the clone's path as the skill's base directory. Nobody ran both readings in one session; lens 1's level 3 stands unrebutted.
4. **Lens 1 F4/F5 against R03h HOLDS (L6.4-07, 08).** R03h's probe tested the no-key and no-node paths; it never tried an API key or Node 20. Both true; the sentence is overstated on the untested branches.
5. **Lens 1 F7 against decisions (e)/(l) (L6.4-05).** The decisions settled the sentence against the Q7 key; F7 is level-3 evidence about the checks. New ground; for the coordinator.
6. **c5-7 "Yes" against the key and against round 03's GUESSED (L6.4-06).** The key sides with the guess; by (l) the confident answer is the failure and it is round 04's.
7. **Lens 1 F8 against decision (j); lens 2 P2 against decision (d)/(g) (L6.4-14, 19).** Superseded; lens 2 says so of its own item.
8. **Lens 2 W1 against decision (k)'s level-3 pin (L6.4-03).** Low; the cut needs the pin renewed, which L6.4-03's edit does anyway.
9. **c4-1 "GOAL achieved" against `tasks.json`'s start (L6.4-27).** Achieved as reported, on the real profile with `--plugin-dir`; whether that meets the task gate is the coordinator's.
10. **Lens 2 P3 against the verifier's R04f HOLDS (L6.4-16).** No conflict on fact: R04f pins L112-113; P3 is about L101 lacking the qualifier.
11. **Lens 2 R1 against the writer's report (L6.4-20).** No conflict: the writer recorded the L23 change (`writer-04.md:33`); `skeleton.md` was not updated. Resolved here.

## What the wave did not cover

- **No lens 3.** The 14 files are the verifier ×3, lenses 1 and 2, two task readers, seven question readers: no adversarial whole-document read of round 04, as in round 03.
- **No signed-in skill run inside the wave's isolation.** The one live run (c4-1) used the owner's profile and stopped at audit's step-1 exchange after seven turns and zero writes; so G1's announce-and-wait, the first spawn, the profile, the ledger, the key and every later audit step are unobserved live in this run; `rethink` was run by nobody in four rounds; the in-app `/plugin` forms remain level 1 (lens 1 item 1).
- **Not re-run here:** F2 and F4 (stub sessions), the six-case lifetime table.
- **Level-1 residue** (lens 1 items 2–4): the chain's 2026-09-10 date rests on `research/2026-09-10-chain/README.md:1` (`grep -rl 2026-09-10` finds it in the chain README and ten `run-2x5/` files, none in `chain/`); "Models were hidden from the judges" rests on the prompts, the dossier is not archived; the 116-word counts are judge J2's and cannot be re-counted from returns. No critic could move them.
- **Windows** (F6), the after-readers' 6/6, the OS purge, the 2026-09-22 date of the 21a225b resolution (lens 1 dates it from `FETCH_HEAD` and the `origin/main` reflog: held).
- **Lens 2 by its own account** opened no `edits/`, no ledger, no diff (forbidden files): R1's "which side changed" and W1's pin are resolved here.
- **A curse-of-knowledge pass**: none; "adversarial read", "candidate", "arm", "entry file", "no-document baseline", "trial", "ratchet" untested on a reader.
- **The `sections.mjs` half of F7** is in no ledger; the `rule1.mjs` half is E8.
- **Budgets**: four sections over (+50, +68, +70, +36; lens 2 attributes 65 of *Install*'s +70 to (d)/(g)/(k)); no critic weighed the growth. Not a finding.
- **No critic read another critic's report**; every cross-reference above is mine.

## The two task readers

| Reader | GOAL line | Outside the document | Sections reached |
|---|---|---|---|
| c4-1 (Sonnet), task 1 install-and-first-audit | **achieved** — "repo made, plugin installed in an isolated config per the doc's own commit-pinning steps, `/terse:audit` run via `--plugin-dir` on the signed-in real profile, stopped cleanly (exit 0) at its first question after 7 turns" | given harness facts (2: `--plugin-dir`; 3: the non-interactive flags `-p --max-turns --output-format --verbose --model --allowedTools`; 5: before/after listings); ran on the real profile; installed from `~/Git/agent-skills` at HEAD b7a17da (tree = 2f29a8f; recorded commit b7a17da); `env -C` in place of `cd`; the audit skill's own `Read` of `truth-pass.md` observed through the transcript | opening L3-8 (the no-code sentence, via the skill's behaviour); *What each one does* L25-27 (audit only); *Install* L61-62, L74-76 (the clone route, with the checkout as the clone); *Where it writes* L83-86 |
| c4-2 (Sonnet), task 2 audit-to-candidate-without-touching-the-tree | **partly** — "write/stop points are explicit, but invocation syntax, output filenames, and whether 'send it' equals 'apply' are guesses" | nothing run (a plan); dated itself 2026-09-22 | opening L10-11, L14-15; *What each one does* L25, L29, L36-57 (rewrite, the hand-over, the loop, re-audit, announce); *Install* L61-62, L74-79; *Where it writes* L83-96 (all) |

Untrue sentences: c4-1 "None"; c4-2 names none. GUESSED points: c4-1 four (1 held on the run; 2 was the harness fact's, not the document's; 3 → L6.4-11; 4 → L6.4-28); c4-2 nine (1 → L6.4-13; 2 → L6.4-12; 3 → L6.4-11; 4, 8, 9 → L6.4-30; 5 → L6.4-31; 6 → L6.4-10; 7 → L6.4-02).

**Sections no task reached:** *What it will and will not do to your text* (L98-106), *What was measured* (L108-126), *Licence* (L128-130); inside *What each one does*, the `rethink` paragraph (L36-38) and the audit paragraph's second half (L29-34: the five causes, the ledger's exclusions). The diagram (L13-17) was read by c4-2 only; the truth-pass sentence (L6-8) reached c4-1 through the skill, not the page.

**The task gate** (`rewrite/SKILL.md:183-184`, "lens 4's two readers achieved their goals"): not met — c4-2 partly; c4-1 achieved outside the task's isolation (L6.4-27).

## The seven question readers against round 03

| Q | Round 03 | Round 04 | Did the quoted sentences change 03→04? | Key (`audit.md`) |
|---|---|---|---|---|
| Q1 install | answered, shell form (L71-72) | answered, in-app block (L67-68) | no (neither form changed) | either form right; both right |
| Q2 change my files | answered from L86-87 + L89-90 ("Yes, if you explicitly authorize…") | answered from L77-79 + L89-90 ("Yes … the default install commands could write …; applying … requires your approval"), two sections | L77-79 reworded by round 04; L86-90 unchanged | "yes, rewrite writes into your repository without asking" — for 1a24018's pages, which 21a225b ships; see L6.4-32. Round 04's answer is about the commit the block installs |
| Q3 which first | answered (L10) | answered (L10) | no | audit; right |
| Q4 fixes or whole file | answered from L41-42, `03:47`, L89-90 | answered from L41-42, L48, L89-90 | L48 reworded (`03:47` "The instructions say to hand over…" → "A round is handed over as…") | a whole candidate + diff, applied on your word; right both |
| Q5 second pass undo | **GUESSED** from L117-118 (McNemar) + L51 | answered from L50-51 ("No … regression is still possible") | yes — L50-51 is the L6.3-04 edit aimed at this reader | "guarded, not ruled out"; round 04's content matches — and rests on the sentence L6.4-01 shows overstated |
| Q6 cut it down | answered (L100) | answered (L100) | no | not as an aim; right both |
| Q7 Russian | **GUESSED** ("Probably yes … does not explicitly confirm") from L5-6 + L26b | answered **"Yes."** from the same two sentences | no (L26's first sentence gained ", a model agent,"; the quoted second sentence is byte-identical) | UNANSWERABLE; by (l) round 04's confident yes is the failure (L6.4-06) |

By label 7/7 answered; by the key **6/7** (Q7 failed). Two flips GUESSED → answered: Q5 with a textual cause, Q7 with none — the same pair that flipped the other way between rounds 02 and 03.

## Count by category (primary)

| Category | Entries |
|---|---|
| SENTENCE | 13 — L6.4-01, 03, 07, 08, 09, 10, 11, 12, 13, 15, 16, 26, 31 |
| STRUCTURE | 1 — L6.4-04 |
| CODE | 7 — L6.4-17 (recorded: D1/E14), 18 (new), 21 (D4 + new forms), 25 (new), 28 (recorded: D5), 29 (recorded: E10), 30 (new, low) |
| METHOD | 7 — L6.4-06, 20, 22, 23, 24, 27, 32 |
| SUPERSEDED | 2 — L6.4-14 (j), 19 (d)/(g) |
| UNSETTLED | 1 — L6.4-05 (CODE side: E8 recorded, `sections.mjs` new) |
| SCOPE | 1 — L6.4-02 |
| **Total** | **32** (1 YOURS: L6.4-32) |

CODE, by record: recorded 4 (D1/E14, D4, D5, E10 — each with new evidence to add), new 3 (L6.4-18, 25, 30) plus the `sections.mjs` half of L6.4-05 and the same-key-against-a-code-change side of L6.4-32 if the coordinator routes them.

## Regressions charged to round 04

Definition: `rewrite/SKILL.md:181-182`, `loop.md:52-55` — a sentence the round introduced that its critics showed false or overstated; decision (f) — a reworded or re-pinned sentence counts as introduced only in the words the round changed.

**Charged: 1.**

- **L50-51 (L6.4-01, lens 1 F3).** Reworded by round 04 (`edits/04.json[7]`) and pinned new at level 3 (R04b). Shown overstated at level 3: a round that drops or re-pins the entry in its own edits loses the verified sentence and `ledger.mjs` exits 0 — reproduced here in both forms, and shown by the round's own record (G4 dropped with its sentence; the ledger over 00–04 passes). Under (f), the words the round changed are where the fault lies: "a pinned sentence" (round 03) named a state a round's edits can end; "a sentence an earlier round verified" (round 04) is a property no drop removes, so the round widened the claim to cover the case it does not. Check: `node $S/ledger.mjs $X/ratchet/ledger.json $X/ratchet/00-original.md $X/ratchet/01-a.md $X/ratchet/02-b.md` → `0 failure(s)` against `ledger.02.json` → `1 failure(s)`; the drop case in a scratch copy (L6.4-01). Against it, for the coordinator: round 03's wording was already overstated for the re-pin case, and L51's hedge stands under both wordings; if the coordinator reads the fault as inherited, the count is 0 — I do not: the round replaced the one word that was right for the drop case and declared a level-3 pin on a probe that plants neither case.

**Judged explicitly, not charged:**

- **L74-76 (L6.4-02, lens 1 F1, "FALSE").** Introduced by round 04. Lens 1's evidence proves the commit is on no remote; the claim R04c makes — the two commands with a clone at that commit install that commit's tree — holds at level 3 in the writer's probe B and in lens 1's own config4. An instruction whose named input no reader can obtain is unfollowable, which the writer flagged before the freeze and decision (k) accepted as the owner's SCOPE; it is not shown false or overstated in what it says the commands do. If the coordinator reads "false" from the reader's seat — a route offered that no reader can take — the count is 2 and the fix is L6.4-02's cut or condition. F2 on the same sentence is understated, which the definition does not count.
- **L23** (frame, "and its references say") — no critic showed it false; lens 2 R1 is about the record.
- **L26** (", a model agent,"), **L36-38** (rethink surveys in and beyond the genre; the rules the writing must pass), **L40-41** (three starts — F8 understated, superseded by (j)), **L48** (handed over as candidate + diff — P5 is the page's gap, not shown false), **L49-50** (every behavioural claim a round declares…), **L74** ("This README describes commit `2f29a8f`", R03i), **L77-79** (held at level 3 by lens 1: a fresh GitHub install records 21a225b; its `rewrite/SKILL.md:66-67, 112-113` write without asking), **L112-113** (R04f, verifier HOLDS), **L113-115** (C44, repository-wide search HOLDS), **L118-119** (R04e HOLDS), **L120-121** (C42 HOLDS): none shown false or overstated.
- Inherited sentences shown overstated at level 3 this wave — L61 (sign-in, L6.4-07), L61-62 (Node 22, L6.4-08), L5-6 (any language, L6.4-05) — are not the round's by the definition; they are the next round's edits or the coordinator's.

**The gate of step 5 on round 04, read by the record's definitions:** no regression — **failed** (1); the task gate — **not met** (c4-2 partly; c4-1 outside the isolation); the question readers — 6 of 7 by the key (Q7's confident yes under (l)). Two consecutive rounds without regression (round 03: 0; round 04: 1) — not reached. The cap of four is reached; `rewrite/SKILL.md:189-190`: a cap reached is reported as a result.

## Ledger of raised → merged

Lens 1: F1→02, F2→03, F3→01, F4→07, F5→08, F6→09, F7→05, F8→14, F9→10, F10→15; level-1 items 5→17, 6→11, 7→05 (items 1–4 context, under *not covered*); "Held at level 3" → context (extends G3a's cases: update, marketplace update, disable keep the data); "Code, not the document" (i)→28, (ii)→29. Lens 2: R1→20, R2→21, R3→22, R4→23, R5→24, R6→25, W1→03, W2+W3→26, P1→04, P2→19, P3→16, P4→17, P5→18; counts and budgets → context. c4-1: guesses 1, 3→11, 4→28 (guess 2 outside the document); the profile choice→27. c4-2: 1→13, 2→12, 3→11, 4→30, 5→31, 6→10, 7→02, 8→30, 9→30. Readers: c5-7→06; c5-2 (both rounds) → 32 (YOURS); c5-1, 3, 4, 5, 6 answered, c5-5 from the sentence 01 concerns. Verifier V3/V3b/V3c: context — nine `asks` sent back for register, R03a's third read HOLDS by mapping 14 claims to the skill tree; R04b's three-case probe is the pin L6.4-01 widens.
