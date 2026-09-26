# Writer G3 — round 04, `04-terms.md` (2026-09-23)

**Sent back once by the verifier and regenerated; see *Sent back* at the end. The sections before it record the first build, kept as `edits/04.sent-back.json`.**

Round 04 of the rewrite of `plugins/terse/README.md`, the last under the cap of four. Built from
`03-review.md` (SHA-256 `36621028…159b`, the one the dedup read) by `edits/04.build.mjs` → `edits/04.json`,
produced by `round.mjs`, checked by the four checks. Repository `/Users/ruliny/Git/agent-skills` at `b7a17da`
(the owner committed it at 15:30 during this round; it changes `ISSUES.md` only); its `plugins/terse` and
`.claude-plugin` are byte-identical to `2f29a8f`'s (`git diff --quiet 2f29a8f HEAD -- plugins/terse
.claude-plugin`, exit 0). Read before writing: `rewrite/SKILL.md` (all), `round.mjs` (all), `ledger.mjs`,
`dup.mjs`, `sections.mjs`, `rule1.mjs`, `reviews/03/lens6-fable-dedup.md` (all), `reviews/03/routing.md`,
`rounds.md`, `skeleton.md`, `code-defects.md` D1–D6, `edits/03.build.mjs`, the 51 ledger entries.

## What changed, per finding

All 15 SENTENCE findings, the SCOPE line, the METHOD fix and the coordinator's decisions are applied. 16 edits,
16 claims: 10 re-pinned under their ledger names, 6 new; one `drop`.

| Finding | Edit in `04-terms.md` | Claim, level |
|---|---|---|
| L6.3-01 | cut "A writer may reword one or correct it when it is false." (`03:101-102`, 12 words; the dedup counted 10). No page grants it; the pages' conflict is D8. R03l, the sentence before it, untouched | none (a cut) |
| L6.3-02 (SCOPE) | new: "To install that commit, run `claude plugin marketplace add` with the path of a local clone checked out at it in place of `Nowely/agent-skills`, then `claude plugin install terse@nowely`." (`04:74-76`) | R04c new, L3 |
| L6.3-03, 15, 20 | "This README describes commit `2f29a8f`." (`04:74`) | R03i re-pinned, L2 (its check kept) |
| L6.3-03, 15 | "On 2026-09-22 the install commands with `Nowely/agent-skills` resolved to `8c041b7`, whose audit and rewrite pages differ from the ones described here; its rewrite page wrote into the document repository without asking." (`04:77-79`). No branch name, no review event; l75 cut | R03j re-pinned, L2; R04d new, L2; **G4 dropped** |
| L6.3-04 | "The shipped check rejects a new round that loses a sentence an earlier round verified, or brings back wording one retired as false." (`04:50-51`); "That guard is not a promise…" kept | R04b new, L3 |
| L6.3-08 | "…before assigning one fresh reader, a model agent, to each question." (`04:25-26`) | C06 re-pinned, L2 |
| L6.3-08 | "…nor separates what the text taught from prior knowledge, nor says whether a human reader improved." (`04:118-119`). No pin covered this sentence (C33 covers the McNemar sentence only), so the claim is new | R04e new, L2 |
| L6.3-09 | "The chain, four passes that preceded the plugin's bake-off and rounds, covered one README." (`04:112-113`); l97 unchanged (C24 stays). The old sentence had no pin | R04f new, L2 |
| L6.3-10, 20 | "The experiment had no no-document arm. The plugin's repository records each of the experiment's six readers before the rewrite, and only the totals after it." (`04:113-115`) | C44 re-pinned, L2 |
| L6.3-11 | "Its output is a skeleton: each section's title, purpose, exclusions, and word budget, and the rules the writing must pass. It then waits for your word." (`04:37-38`) | C10 re-pinned, L2 |
| L6.3-12 | "**`/terse:rewrite`** starts from that skeleton or an audit's run file, or resumes a run of its own that already holds rounds." (`04:40-41`); the guess route not named, decision (j) | C11 re-pinned, L2, marked provisional by `round.mjs` |
| L6.3-13, 14 | "**`/terse:rethink`** surveys documents in and beyond the genre, settles terms, and explores structures." (`04:36-37`); "works before prose" cut | C09 re-pinned, L2 |
| L6.3-17 | "Each skill is a page of instructions for Claude; below is what each page and its references say." (`04:23`) | R03a re-pinned, L2 |
| L6.3-18 | "…and every behavioural claim a round declares must carry its source and evidence." (`04:49-50`) | R03g re-pinned, L2 (its check kept) |
| L6.3-19 | "A separate experiment used ten agents in a 2 × 5 design…" (`04:120`) | C42 re-pinned, L2 (its check kept) |
| L6.3-21 | "A round is handed over as a candidate and its diff from the original." (`04:48`); it had no pin | R04a new, L2 |
| L6.3-27 (METHOD) | `concepts.json`: "conditions, limits, warnings kept" → `condition, (a )?limit,? or (a )?warning\|repetition`; "rethink stops at a skeleton" → `returns a skeleton\|output is a skeleton\|→\s*skeleton`. The old file kept as `concepts.03.json` (byte-identical to the committed round-03 copy) | — |

Not edited, by decision: L6.3-16 (decision (a) reaches its section only), L6.3-28 (the language sentence
stays), L6.3-05/06/07/23/24/25/26/29 (code). Decision (d) now covers `main`: no branch name is left
(`grep '`main`' 04-terms.md` finds none; the build refuses it).

### Where the wording departs from the dedup's or the coordinator's

- R03j's sentence says "the install commands **with `Nowely/agent-skills`**": it now follows the clone route,
  and "the install commands" alone would read as the ones just given.
- C44's sentence says "each of **the experiment's** six readers", not "each of its six readers": with "The
  plugin's repository" as the subject, "its" binds to the repository.
- R03g's sentence repeats "must carry": "every behavioural claim a round declares its source and evidence"
  reads as the clause "a round declares its source".
- The install line names the shell command, the form the probe ran. The in-app `/plugin marketplace add`
  form was not run (not runnable here without a sign-in; the audit did not run it either, `audit.md:209`).
- The concept pattern is `→\s*skeleton`, not the dedup's "→  skeleton": `dup.mjs` normalises whitespace
  before matching (`dup.mjs:20`), so two spaces never match.
- R03j's round-03 run is kept in what it shows, reordered and trimmed (the 2f29a8f `rewrite/SKILL.md:67`
  line dropped), with the brief's dated heading (`brief.md:196`) and the diff added, so the output (1715
  characters) stays under `round.mjs`'s 2000-character clip of `saw` (`round.mjs:22-23`). C44's run is
  trimmed likewise (1647) and reads `ISSUES.md` by pattern: `b7a17da` moved E7's lines from 96-99 to 98-101,
  so C44's round-03 check no longer resolved (`probe-04/pins-rerun-before-04.log`).

## Claims, by name

- New (6): `R04a a round is handed over as a candidate and its diff from the original`; `R04b the shipped check
  rejects a new round that loses a sentence an earlier round verified or brings back wording one retired as
  false`; `R04c to install commit 2f29a8f, marketplace add takes the path of a local clone checked out at it
  in place of Nowely/agent-skills, then plugin install terse@nowely`; `R04d at 8c041b7 the audit and rewrite
  pages differ from the ones this README describes`; `R04e the result neither clears a significance threshold,
  nor separates what the text taught from prior knowledge, nor says whether a human reader improved`;
  `R04f the chain, four passes that preceded the plugin's bake-off and rounds, covered one README`.
- Re-pinned (10), names reused exactly: C06, C09, C10, C11, C42, C44, R03a, R03g, R03i, R03j.
- **Drop, for `rounds.md`:** `G4 version boundary: the write boundary below is this checkout's, not 8c041b7's`
  — its sentence, `03:75` "The section below describes this commit, not that one.", is cut (L6.3-03, lens 2 W1).
- Provisional: `round.mjs` marks C11 (L2~) because its pattern contains "resum" (`round.mjs:33-36, 117`).
  The sentence states the page's route (`rewrite/SKILL.md:18, 74`) under decision (a)'s frame; running a
  resume at level 3 needs a signed-in skill session, which this round's rights do not allow.

## Probes (all under `probe-04/`, exit 0)

- `install-checkout.sh` → `install-checkout.log` (R04c). Two Claude configurations under `probe-04/`, `env -i`,
  not signed in (gated on `"loggedIn": false`), Claude Code 2.1.280. A: the checkout by absolute path; B: a
  clone of it made here and checked out at `2f29a8f`, by a relative path. Both `marketplace add` and
  `plugin install terse@nowely` exit 0; both installed trees (28 files) are identical to their source's
  `plugins/terse` and to `git archive 2f29a8f` (`diff -rq` prints nothing, exit 0); B records commit
  `2f29a8f`. About 2 seconds, well inside the 60-second limit.
- `ledger-guard.sh` → `ledger-guard.log` (R04b). A planted ledger: the round that loses the pin exits 1
  (LOST), the round that revives the retired phrase exits 1 (YES), the round that does neither exits 0.
- `lifetime-probe.sh` → `lifetime-probe.log` (D7): `probe-03/lifetime-probe.sh` with its probe directory under
  `probe-04/` and the sign-in gate added; its log is byte-identical to `probe-03/lifetime-probe.log`.
- `d7-d8-check.sh` → `d7-check.out`, `d8-check.out`: the D7 and D8 checks as written in `code-defects.md`,
  both regexes matching.
- `cut-counts.mjs` → `cut-counts.log`, `sentences-gone.mjs`: the word counts and sentence lists behind `cuts.md`.

## Checks (outputs in `probe-04/checks-04.log`)

| Command | Exit | Result |
|---|---|---|
| `round.mjs 03-review.md 04-terms.md edits/04.json --ledger ledger.json` | 0 | 15 checks ran, all exit 0; 16 edits ok; ledger 56 entries (45 pinned, 11 retired); `ledger.04.json` = the ledger before (SHA-256 `4f939622…1e84`) |
| `rule1.mjs 04-terms.md --cut Install --except Install` | 0 | 0 violations, 0 excused |
| `dup.mjs 04-terms.md concepts.json` | 0 | 0 concepts in three or more sections (round 03 under the old patterns: 1, the "skeleton" false positive; under the new: 0) |
| `sections.mjs 04-terms.md budgets.json` | 0 | 1139 words, 4 sections over: opening 149/99 (+0 against 03), *What each one does* 392/324 (+31), *Install* 119/49 (+28), *Where it writes* 156/120 (+0); under: *What it will…* 104/127 (−12), *What was measured* 218/309 (+14) |
| `ledger.mjs ledger.json 00 01 02 03 04` | 0 | 0 failures in `04-terms.md` |
| `wc -w` | — | `03-review.md` 1106, `04-terms.md` 1167 (+61) |
| `selftest.mjs` | 0 | 45 ok, 0 MISS |
| `diff -u 00-original.md 04-terms.md > diff-04.patch` | 1 | the files differ; 185 lines |

## Also written

- `code-defects.md`: D7 (level 3, the pages' lifetime sentences) and D8 (level 2, the veto against the
  correction rule), in the file's register, every cited line opened; the header's mapping extended to "D7–D8
  (round 04) as E21–E22" — a change to line 8, outside the append. The file before this round is kept as
  `probe-04/code-defects.before-04.md`.
- `cuts.md`: rounds 01–04. Round 01: the three passages the coordinator named, with decision (i) and C45/C46;
  also, from the judges' sheets and the audit, `00:27-29` (44 words) and `00:55-56` with `:53` (29 + 9), the
  three passages removed as refuted and corrected in place (62, 23 and 48 words), and `00:19-21` (32 words,
  restored in round 03). Round 02: the placement sentence (25). Rounds 03 and 04: none of twenty words or more.

## What I could not do, and what is open

- `2f29a8f` is on no remote ref: `git ls-remote origin` (2026-09-23) lists `main` at `8c041b7`, PR refs and
  tags, and no `terse-process-2026-09-22`; `git branch -r --contains 2f29a8f` prints nothing. The install line
  works where the commit exists, this checkout, until the owner publishes it; a squash merge never would.
  The owner's SCOPE, as the dedup said of L6.3-02.
- R04b and D2: a retired phrase brought back with a capital letter passes `ledger.mjs` (D2, level 3,
  `probe-03/d-probes.log`). The probe revives the phrase as the ledger holds it; the kept "That guard is not a
  promise that no regression can occur" is what covers the rest. A verifier may read this as DOES NOT ANSWER.
- R02e's check reads `ISSUES.md:183-188`, which no longer holds E13 at `b7a17da` (E13 starts at 189); its
  sentence is unchanged, so it is not re-pinned here. The same drift broke C44's check, fixed by its re-pin.
- No verifier, critic or reader was launched (not mine to launch). The round is not frozen.
- Guarantee words in this round's `new` text, for the verifier's fourth duty: "every" (R03g), "only" (C06, C44).
- `.git/index` in the repository has mtime 15:44:29, right after a `git status` of mine: git's stat-cache
  refresh, no content change (`git status` clean). `.git/FETCH_HEAD` (15:55) and `.git/gk/` (15:57) are not
  mine; I ran no fetch.

## Sent back

The verifier (Codex Sol V3, `reviews/04/verifier-sol-v3.md`) read the first build: 16 claims, 9 DOES NOT
ANSWER, 0 REFUTED, 0 UNREACHABLE, duty 1 clean. Regenerated by the page's recipe
(`rewrite/SKILL.md:139-141`): the first build kept as `edits/04.sent-back.json` and
`edits/04.sent-back.build.mjs`; `04-terms.md` removed; `ledger.04.json` copied back over `ledger.json`
(SHA-256 of both `4f939622…1e84`); `edits/04.build.mjs` fixed and run; `round.mjs` run again; the checks
appended to `probe-04/checks-04.log`; `diff-04.patch` written again. After it, one edit's name and a comment in
`edits/04.build.mjs` were corrected (the R02e history in the table below) and the round regenerated once more by the same
recipe: `04-terms.md` and `ledger.json` came out byte-identical (SHA-256 `34cc4cb0…efa5`, `41ace865…3b50`),
only `edits/04.json` changed, and the four checks gave the same results.

### What changed, per claim

| Claim | V3 | What changed in the second build |
|---|---|---|
| R03a | DOES NOT ANSWER | `asks` now says what the run shows: three pages of instructions for Claude, each a SKILL.md whose frontmatter disables model invocation, each with a `references/` directory the section draws on. The run prints `ls …/skills/*/references` (in place of my per-skill loop) and `expect` holds the three listings |
| C06 | DOES NOT ANSWER | `asks` in the page's register: the audit page instructs Claude to write the profile, the claim ledger and the key before it spawns one fresh reader, a model agent, per question, and says each reader starts at the entry file and may open only `.md` files. Sentence and run unchanged |
| C10 | DOES NOT ANSWER | `asks`: the rethink page says the skeleton it hands over holds each section's title, purpose, exclusions and word budget and the rules the writing must pass, and instructs Claude to stop and wait. Sentence and run unchanged |
| C11 | DOES NOT ANSWER | `asks`: the rewrite page names three starts — the agreed skeleton, an audit's run file, a run of its own that already holds rounds. Not "only three": the page's fourth row, the guess route, is left unnamed by decision (j). Still L2~ by `round.mjs` ("resum") |
| R04a | DOES NOT ANSWER | `asks`: the rewrite page instructs Claude to hand a round over as the candidate and its diff against the original. Sentence and run unchanged |
| R03i | DOES NOT ANSWER | `asks`: the plugin tree this README's statements are checked against is 2f29a8f's; HEAD's `plugins/terse` and `.claude-plugin` equal it, which the run's first line shows. Sentence and run unchanged |
| R03j | DOES NOT ANSWER | `asks` is a record claim and an instruction claim. The record: the adversarial read of 2026-09-22 ran both commands, fetched `main` at `8c041b7` and installed terse 0.1.1 (`research/2026-09-22-terse-process/rewrite-2026-09-22/l3-adversarial-findings.md:3, 11, 13, 23-24`; `brief.md:196-198`; `audit.md:209`). The instruction: 8c041b7's `rewrite/SKILL.md:64-67` puts the run in `research/<date>-<slug>/` at the root of the document's repository. The run prints every line of that page that asks, waits or needs the user's word — 7, 29, 61, 104, 105, 150 — and counts those in step 4's run-directory block, 64-78: 0. Line 7 is the description's "writes into your tree only on your word", which no step carries for the run directory; the others concern the audit's run directory, spawning agents and applying the candidate. The record bounds itself: "This confirms the fetched payload and its instructions, not that a model performed the unapproved writes" (`:13`), and the run prints that line too |
| R04d | HOLDS | Untouched in `asks`, pattern and level. It shares R03j's edit, so its check is the new run. That run still prints its evidence, the diff (`--shortstat` 10 files; `audit/SKILL.md` 27 lines, `rewrite/SKILL.md` 92). Dropped to stay under the 2000-character clip: 8c041b7's `rewrite/SKILL.md:112-113` and `audit/SKILL.md:33`, 2f29a8f's `audit/SKILL.md:33, 44` and `rewrite/SKILL.md:78-79`. Output 1893 characters |
| C44 | DOES NOT ANSWER | The negative half now searches the whole repository (`.md`, `.txt`, `.json`, `.git` excluded) for a line in the before-record's form, `N. "question" - ANSWERED VERDICT`. Two files hold six each: `chain-source-prompt.txt` and `run-2x5/Faf2geGl.prompt.txt`, which are byte-identical (`cmp`); the second is the chain seat's prompt the record was copied from. Lines in that form that are not lines of the before-record: 0. The chain-only `6/6` search is dropped. `asks` and the positive half unchanged. Output 1784 characters |
| C42 | DOES NOT ANSWER | Text: "four writing standards, one an unpublished draft," → "four writing standards, one of them a draft," (+1 word, `04:120-121`). `asks` says what the source says: five conditions of two agents, four of them standards, one of the four "a draft rule block for the owner's CLAUDE.md" (`v04PR6HL.prompt.txt:18`, not `:15` as the message had it), and a control given no standard. Run and `expect` unchanged. "Unpublished" came from the audit's C39 verdict at `audit.md:377` (the message called it C41's; C41's verdict is at `:393`) |
| R02e | not raised | Re-pinned under its name, sentence unchanged: `new` equals `old`, and `round.mjs` accepts it (`round.mjs:99-104` checks only that `old` occurs once; the run printed `ok`). Its run keeps the rethink-page grep (0) and finds E13 with `grep -n -A6 '^## E13' ISSUES.md`. E13 sat at line 183 when R02e was pinned (`f677303`), moved to 187 at `1af4160` and to 189 at `b7a17da`, so the old run has not matched since `1af4160`, not only since `b7a17da` (the old `expect` tested against `git show <commit>:ISSUES.md`). `asks` unchanged |
| C09, R03g, R04b, R04c, R04e, R04f | HOLDS | Edits byte-identical to the first build |

Count: 17 edits, 17 claims — 11 re-pinned (C06 C09 C10 C11 C42 C44 R02e R03a R03g R03i R03j), 6 new
(R04a–R04f); the drop is G4, as before. Ledger entries written differently from the first build: 11 — the
nine sent back, R04d (its shared check) and R02e (added). Against the first build the text differs in one
line, `04:120`.

### Checks, second build (appended to `probe-04/checks-04.log`)

| Command | Exit | Result |
|---|---|---|
| `round.mjs 03-review.md 04-terms.md edits/04.json --ledger ledger.json` | 0 | 16 checks ran, all exit 0; 17 edits ok; ledger 56 entries (45 pinned, 11 retired), C11 provisional; `ledger.04.json` still `4f939622…1e84` |
| `rule1.mjs 04-terms.md --cut Install --except Install` | 0 | 0 violations |
| `dup.mjs 04-terms.md concepts.json` | 0 | 0 concepts in three or more sections |
| `sections.mjs 04-terms.md budgets.json` | 0 | 1140 words; over: opening 149/99, *What each one does* 392/324, *Install* 119/49, *Where it writes* 156/120; *What was measured* 219/309 |
| `ledger.mjs ledger.json 00 01 02 03 04` | 0 | 0 failures |
| `wc -w` | — | `03-review.md` 1106, `04-terms.md` 1168 (+62; the first build had 1167) |
| `diff -u 00-original.md 04-terms.md > diff-04.patch` | 1 | the files differ; 185 lines |
| every pinned entry's run against its `expect`, from `R` | — | 36 of 36 runnable match (`probe-04/pins-rerun-after-04.log`). C03, G3a, G3b, R03h, R03b not run: their `probe-03` scripts run host commands outside `probe-04/`. C05, C18, C19, C23 carry no run (audit seed) |

### Third build, before the verifier's second read

At the coordinator's word, for the risk named on R03j (the verb "wrote" against a claim only about what the page
instructs): the sentence is kept and the claim strengthened. Same recipe: `04-terms.md` removed,
`ledger.04.json` copied back (`4f939622…1e84`), the build fixed, `round.mjs` exit 0, the four checks exit 0,
`diff-04.patch` written again (185 lines). `04-terms.md` came out byte-identical, SHA-256 `34cc4cb0…efa5`;
`ledger.json` is now `50c8982e…172e`. Only the edit that carries R03j and R04d changed.

- R03j's `asks` names three parts and says which is which. **Record, 2026-09-22:** the adversarial read ran
  both commands, which fetched `main` at `8c041b7`. **Instruction, 8c041b7's page, level 2:** step 4
  (`:64-67`) puts the run in `research/<date>-<slug>/` at the repository's root; no asking line in that block;
  the asking lines 7, 29, 61, 104-105 and 150 are about other things. **Record, this repository:** the page
  shipped at 0.1.0 (`b29e921`) with `8c041b7`'s lines 64-67 unchanged. `research/2026-09-11-markup-round-0/` is a
  rewrite run of this repository's `plugins/codex-delegate/README.md`, and its README lists every round there
  (`README.md:43, 45`). Its rounds 08 and 09 (`a4238a5` 20:29, `0eb7762` 20:45) were committed after the page
  first put runs under `research/` (`1e3f5b2` 19:03, the only commit on `terse-plugin` that adds the phrase).
  The directory reached `main` in `b29e921`.
- What the order shows, and no more: rounds 00-07 of that run were committed before `1e3f5b2`, so for them the
  directory came first and the instruction after. The claim names only rounds 08 and 09 as written under it.
  One other `research/2026-09-1*/` directory holds numbered versions of a document of this repository:
  `2026-09-12-issues-verification` has `00-ledger-as-found.md`, `01-marked-up.md` and `02-proposed.md` of
  `ISSUES.md`, committed in `2270cef`. Its record calls it a verification in five waves and does not say it
  followed the rewrite page, so the claim does not rest on it. The rest (`chain`, `calibration-bank`,
  `terse-survey`, `skill-review`, `orchestration-practices`) hold no rounds of a document.
- To stay under the 2000-character clip, three things were dropped from the run: `brief.md:198` (the same
  record as `l3-adversarial-findings.md:11`), the HEAD-equals-2f29a8f line, and 2f29a8f's `rewrite/SKILL.md:66`.
  The asking lines now print their phrase only. Output: 1873 characters. R04d keeps its `asks`; its evidence,
  the diff, is still printed.

### Fourth build, after the verifier's second read

V3b (`reviews/04/verifier-sol-v3b.md`): 17 claims, 16 HOLD, and one DOES NOT ANSWER: R03a, because its
`asks` weakened "what each page and its references say" to "draws on", and its run never opened a reference.
Only R03a changed, by the same recipe. `04-terms.md` came out byte-identical (`34cc4cb0…efa5`), `ledger.json` is
`7197618a…1793`, and the four checks exit 0.

R03a's `asks` now says what the sentence says. The run keeps the frontmatter and `references/` listings and adds
a one-liner (readable as `probe-04/r03a-section.js`) that works out the section *What each one does*:

- **Claims.** 14 pinned claims match in the section, the 12 the message named plus C07 and G1. Their runs cite
  only files under `plugins/terse/skills`; R04b cites its probe, which reads `rewrite/scripts`. **Cited outside:
  0.**
- **Sentences with no claim: 3.** "A baseline asks…", "Audit states what a repair must achieve without proposing
  wording.", and "That guard is not a promise that no regression can occur." The run quotes their page lines:
  `audit/SKILL.md:6, 94, 109-110`, `audit/references/ledgers.md:114` and `rewrite/SKILL.md:181-182`.
- **Why the `asks` differs from the message.** The message's version said every such sentence carries a claim,
  which is false for these three. The `asks` states it as it is.

### Open, added

- C42: `run-2x5/EKalWntb.prompt.txt:21-22`, the prompt of a seat that carried the draft standard, says the block
  was "drafted for this owner's always-loaded instruction file. It has no website." R03k's check already quotes
  it. That would have backed "unpublished" at level 2; the coordinator keeps the smaller claim, "a draft".
- While composing C44's run I wrote one scratch file to `/tmp`, outside the directories I may write to, and
  deleted it at once. Every other file is under `R` or `$TMPDIR`.
