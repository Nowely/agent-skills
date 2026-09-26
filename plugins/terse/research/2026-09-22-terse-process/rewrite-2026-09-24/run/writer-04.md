# Writer report — round 04 (`04-shape.md`), G4, 2026-09-24

The verifier sent the round back once. The second build changes three sentences and one label, and re-pins or
adds the claims behind them. The sections down to *What I could not write* describe the build the verifier
read; *Sent back*, at the end, gives what changed and the counts now.

Run directory: `/var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T//terse/runs/20260924-002235-terse-readme-rewrite2`.
Written against skeleton 03 (`skeleton.md`, SHA-256 `c12bdc4f…` = the rethink run's `skeleton.03.md`, agreed on
`rounds.md`'s second line), after the owner's read of round 03 (the rethink run's `skeleton-read-02.md`).
Code: `/Users/ruliny/Git/agent-skills`, HEAD `cae5a38`, which is research-only after `f97eb4a`
(`git diff --stat f97eb4a HEAD -- plugins/ .claude-plugin/` is empty). The modified `rounds.md` in the checkout
is the coordinator's; this round wrote nothing there.

How the round was made:
- `edits/04.build.mjs` built the edits from 03's own bytes, and every check was dry-run first (15 checks, one per edit that carries claims, all
  match, all under 2000 characters, no NOT FOUND).
- `round.mjs 03-routes.md 04-shape.md edits/04.json --ledger ledger.json` exited 0 (`probe-04/round-04.log`).
- The round file equals the build's preview.
- `04-shape.md` SHA-256 `a97d37eb0739e69639e4c794e9fdfcfb784cbb483c9c4a2f5e5648b47410a567`.
- `ledger.04.json` (the state before the round) is `eca0e1cd…`. The ledger now holds 45 entries (41 − 5 + 9).

## The edits (17): 24 claims — 15 re-pinned, 9 new; 5 dropped; 4 with `qualifies`

A block whose sentences stand at different evidence levels is written by several edits over adjacent anchors,
because an edit's claims share one level.

| Block | Edit | Claims | Level, check |
|---|---|---|---|
| Quick start › Install | heading `### Install` | — | — |
| › Workflow | heading `### Workflow` and "In Claude Code:" ("where the Markdown files are" goes, `skeleton-read-02.md:12`) | R04a new | 3 by record: c4-1's session (round 02) listed and ran the slash commands; `probe-02/update.log`, Skills (3) |
| | the scope said outright: "It asks for the scope — the Markdown files to check, named one by one or as a folder, every tracked `.md` by default — and where your readers start." | R03a re-pinned | 3 by record, `probe-03/step1.sh`; `audit/SKILL.md:23–28, 91–92` |
| | the announcement moved into audit's paragraph (L6.3-02) and one clause for the report; the excerpt goes | R03b re-pinned, R04b new; R02b dropped | 2: `audit:88–89, 125, 166`; `rewrite:64–66, 70–72, 150–151`; `measure.md:59, 67–68` |
| | "If every answer from your text is already right, stop." (L6.3-13) | R04c new, `qualifies` | 2: `audit:122, 151–153` |
| | the shape question; "If it does, run this and, when it asks, give it the folder the report names:" | R04d new, R02c re-pinned | 2: `audit:166–171`; `rewrite:14, 37, 84` |
| | the rethink branch in its own fence ("…a skeleton, an outline you agree to and give rewrite when it asks", L6.3-25); the two command lines, moved from Skills; `### Update` in place of "Update:" | C09, C05 re-pinned | 2: `rethink:4–6, 13–15, 48–49, 148–149`; `measure.md:106–109`; `audit:100–102, 170–171`; `rewrite:24–28` |
| › Update | the fence and the restart clause, unchanged (R02e stands) | — | — |
| Skills | "You start each one yourself."; the command lines leave | R04e new | 2: `disable-model-invocation: true` in the three frontmatters; `audit:174` |
| How it works | **audit** — profile → every claim checked against the code or a named source → questions and an answer key → a fresh AI reader per question, with and without your text → a cause per wrong answer; link | C06, C07 re-pinned | 2: `audit:46–51, 56–58, 71–77, 88–97, 125–133`; `truth-pass.md:61–69, 73–77`; `measure.md:40`; the link resolves |
| | **rethink** — documents like yours, read by as many agents as you allow → the words chosen → about ten structures, ranked together by AI reviewers → a skeleton you agree to; link | R03e re-pinned, `qualifies` | 2: `rethink:25–27, 55–61, 80–84, 93–106, 148–149`; `briefs.md:37–38`; link |
| | **rewrite** — an adversarial first read of an existing text → by default three writers and two judges, never picking by word count → rounds of edits, each claim with a check that runs, a round refused if it silently loses a checked sentence → AI reviewers, each from its own angle → your read, a reason for every cut of twenty words or more; link | R03c, R03f re-pinned, R04f new, `qualifies` | 2: `rewrite:64–66, 70–72, 119–122, 127–129, 143–144, 164–165, 197, 212, 235–236`; `bake-off.md:13–15, 19–22`; link |
| Checks and guarantees | heading, over What was measured | — | — |
| | the table's head, the writing rules row, the content rules row | R03d re-pinned, R04g new; C33, C44 dropped | 2: `writing-rules.md:3, 6–7, 9–10, 12–13, 21, 29–30`; `bake-off.md:114`; `research/2026-09-10-chain/README.md:16`; `stages.md:311–316`; two links |
| | the scripted checks row | R04h new; C24 dropped | 3: `probe-04/scripted.sh`. The self-test ran 50 checks, all caught; the five scripts' headers; `measurements.md:3–4, 79, 116`; the link |
| | the field's practices, linked by what they are | R04i new; R03h dropped | 2: `prior-art.md:7, 14–15, 299–303`; the link |
| | **Guaranteed:** the folder, and the refusal | C15, R03g re-pinned, `qualifies` | 3: `probe-04/guaranteed.sh` (below); `ledger.mjs:6–8`; `rewrite:143–144` |
| | the Guaranteed line's page-backed half; **Not guaranteed** | R02g, R02f re-pinned | 2: `audit:44`; `rethink:31–32, 46`; `rewrite:88–89, 172–173, 222–223`; `audit.md:993, 995`; `measure.md:40`; `prior-art.md:130–132`; `research/README.md:10` |

`probe-04/guaranteed.sh` runs two probes and prints a summary that stays whole in `saw`:
- **`probe-02/rundir-rewrite.sh`, over the three pages:**
  - 9 of 9 renders stopped at login, at cost 0;
  - 9 of 9 run folders were made outside the working directory;
  - the data directories were `terse-nowely` (installed) and `terse-inline` (`--plugin-dir`);
  - with the page read as a plain file, the run falls back to `$TMPDIR/terse/runs` (3 of 3), or to `/tmp/terse/runs` with TMPDIR unset (3 of 3);
  - 0 entries were added to the working directory.
- **`probe-03/guard.sh`:** its five cases.

**Unchanged pins** (their text stands): C01, C03, C10, C11, C19, C23, R02a, R02d, R02e, R03i. The eleven retired
phrasings are absent.

**Dropped, for `rounds.md`:**
- **R02b**, the excerpt. Skeleton 2.2 excludes "any report excerpt" (`skeleton.md:114`); rule 6 item 7 reads
  "no excerpt, no invented example" (`:268`); part 7, taken 3 (`:365–367`).
- **C33**, p = 0.25, and **C44**, the same questions not run without the text. Part 5, ":62–86 '## What was
  measured', all but its link" (`skeleton.md:344`); part 7, taken 4 (`:368`); whole page, "Not on the page.
  What was measured" (`:198`).
- **C24**, 2,725 → 2,571. The same lines, and part 5's ":53–56" row (`skeleton.md:342`: the size change is kept
  only in `research/2026-09-10-chain/README.md:20, 24`).
- **R03h**, 5 of 7 against 0 of 7. `skeleton.md:198, 344, 368`; the figures stay in
  `research/2026-09-22-terse-process/audit-2026-09-22/audit.md:993` (`skeleton.md:356`).

No passage of twenty words or more was cut whose content does not stand elsewhere, except What was measured.
That section was removed whole on the owner's read (`skeleton-read-02.md:22–26`); its figures live in the
references and the research record (`skeleton.md:356`).

## Where skeleton 03's device words were not used, and why

- **The rewrite and rethink steps.** "AI reviewers, each checking one thing" (`skeleton.md:160`, and rule 7's
  must-use, `:290`) became "each from its own angle": lens 1 showed it false in round 02 (L6.2-11), and
  R03c's wording held on the verifier's reads. "three writers and two judges, who never pick by length" became
  "by default three writers and two judges, never picking by word count" (the verifier V5: the user may refuse
  the fan-out; R03f, the page's words). "an adversarial read" became "an adversarial first read of an existing
  text" (`rewrite/SKILL.md:64–66`, "On a document that already exists").
- **The Guaranteed line.** "a round that loses a sentence an earlier round checked true, or brings back one
  found false, is refused" (`skeleton.md:185–187`) became R03g's verified sentence, "silently loses … or repeats
  one found false … before you see it". The verifier refuted "brings back" on round 03 (paraphrase, guard case
  e) and required "silently" (a declared drop, case d).
- **The writing rules row.**
  - "where a reader decides" (`skeleton.md:178`) became "where your readers decide", because the skeleton's own
    rule 7 reader-pair grep flags "a reader".
  - Its origin "a rewriting chain measured on one README" became "Part two of a four-part rewrite, measured on
    one README", because "chain" is on rule 7's must-not list.
- **The scripted checks row.** "each tested against a planted violation" became "a deliberate violation",
  because "planted" is on the must-not list. For "Where it comes from" I followed the skeleton's
  `measurements.md` (`:183`), not the `skills/rewrite/scripts/` of your message. The concept "where the
  methods come from" lists `measurements.md`; the row's run executes the scripts themselves (the self-test,
  50 of 50).
- **The prior-art line** says "gathered and ranked", not "surveyed": "survey" is a renamed term (terms row 58).

## Checks (`probe-04/checks-04.log`)

| Check | Result | Exit |
|---|---|---|
| `rule1.mjs 04-shape.md --cut "How it works" --except "Quick start"` | 0 violation(s) | 0 |
| the same without `--except`, skeleton 03's rule 1 | 0 violation(s) | 0 |
| `dup.mjs 04-shape.md concepts.json` | 0 concept(s) in three or more sections | 0 |
| `sections.mjs 04-shape.md budgets.json` | 778 of 645, four over (below) | 0 |
| `ledger.mjs ledger.json 00 01 02 03 04` | 0 failure(s) in 04-shape.md, 45 entries | 0 |

Skeleton 03's part-3 rules, as a grep reads them:
- **Headings:** `# terse`, `## Quick start`, `### Install`, `### Workflow`, `### Update`, `## Skills`,
  `## How it works`, `## Checks and guarantees`, and nothing else.
- **Fences:** 2 `bash` (Install, Update) and 3 `text` (audit, rewrite, rethink), all under Quick start;
  `/plugin` count 0.
- **The blocks:** the first line under `### Install` and under `### Update` opens the `bash` fence.
- **Words:** qualifiers 0; must-not words outside the fences 0; "pipeline" absent; reader pairs 0.
- **Required phrases:** weight and meaning in the opening; "until you say so", "rounds of edits", "documents
  like yours", "AI reviewers" and "### Workflow" each present.
- **Glosses:** the first lines holding skeleton, shape and diff (34, 26, 32) hold outline, order and change;
  "fresh AI reader" comes first; terse appears only as the name.

`diff -u 00-original.md 04-shape.md > diff-04.patch`: 149 lines. No `saw` is clipped, and none is provisional.

## Words (`sections.mjs`; the block counts by skeleton 03's awk, the `###` line excluded)

| Section / block | 03 | 04 | Budget |
|---|---|---|---|
| (opening) | 65 | 65 | 70 |
| Quick start | 215 | 248 | 190 (+58) |
| › Install | — | 17 | 26 |
| › Workflow | — | 208 | 140 (+68) |
| › Update | — | 17 | 18 |
| Skills | 137 | 114 | 110 (+4) |
| How it works | 163 | 164 | 115 (+49) |
| What was measured | 107 | — | — |
| Checks and guarantees | — | 187 | 160 (+27) |
| Total | 687 | 778 | 645 (+133) |

Not padded, and not cut below what the device and your message ask each block to carry.
- **Workflow (+68).** It holds the device's eight items with three fences (9 tokens), the two command lines you
  moved here (17), and the announcement sentence you kept here (30), whose rewrite half the device does not
  list.
- **How it works (+49).** It holds the skeleton's steps for three skills with a link each.
- **Checks (+27).** It holds the three rows, the practices line and both guarantee lines.

Rule 4 makes the overrun the owner's question.

## What I could not write, and what is open

- **The budget:** 778 of 645, four sections over, as above.
- **Concepts.** `concepts.json`, regenerated from skeleton 03's part 3, again carries "make it worse" in "a fix is
  not undone". The opening's "touching it may make it worse" counts, so the concept reads (opening) | Checks
  and guarantees. How it works avoids "checked true/found false", which keeps the count at two. Round 02 fixed
  this pattern (`concepts.01.json`); the regeneration brought it back. The instrument is the agreed skeleton's,
  so it is not changed here.
- **The must-use list** (`skeleton.md:290`) still names "AI reviewers, each checking one thing", which is false.
  `skeleton.md` is not edited: its SHA-256 is the agreement's.
- **The scope.** "a selection" is not named (skeleton part 7, default 1); the audit page takes files.
  "or as a folder" rests on the page's "which files are the documentation" (level 2); no run named a folder.
- **Not named in How it works:** audit's task readers (step 5b), rethink's calibration file and the owner's named
  documents before its survey (L6.3-21, the owner's), and rewrite's verifier by name ("AI reviewers" covers it).
  rethink's second announcement, before its structures (`rethink:96`), is not stated; its consent sits in the
  first step's "as many agents as you allow".
- **No permission clause.** No run here showed a permission prompt: signed out, the skills stop at login.
- **Evidence limits:**
  - R04a and R03a rest on one recorded signed-in session (round 02's c4-1, Sonnet, on main's 0.1.1, whose step 1
    is HEAD's word for word).
  - The Guaranteed line's "nothing … until you say so" is the pages' instruction at level 2; no signed-in run
    exercised it.
- **Round-03 wave findings the restructure answered in passing:** L6.3-02 (audit's announcement in its own
  paragraph), L6.3-04 (claims checked against the code, in the audit item), L6.3-08 ("both orders" gone),
  L6.3-13 ("from your text"), L6.3-25 (the skeleton given to rewrite when it asks).
- **Not answered:** L6.3-03 (rethink's announcement), L6.3-05's third item (the repository behind the files),
  L6.3-16 ("new draft" twice), L6.3-17 (STRUCTURE), L6.3-21 (UNSETTLED).

## Sent back

`reviews/04/verifier-sol-v6.md` (Codex Sol V6, first read): 24 claims, 18 HOLD, 1 REFUTED, 5 DOES NOT ANSWER;
duty 1 clean.

Regenerated by the page's recipe:
1. `04-shape.md` removed.
2. `ledger.04.json` copied back over `ledger.json`.
3. The first build kept as `edits/04.sent-back.json` and `edits/04.sent-back.build.mjs`, with its logs as
   `probe-04/round-04.sent-back.log` and `checks-04.sent-back.log`.
4. The build fixed, then `round.mjs` (exit 0), the four checks and `diff-04.patch`.

`04-shape.md` is now SHA-256 `9588d64ae5c063d755b0c337de4d107771a27fed5e1187fa81ff92fb14121a25`. The first build
was `a97d37eb…`. The second build has 19 edits, 25 claims (15 re-pinned, 10 new) and 5 drops, as before; 6
edits carry `qualifies`. The ledger holds 46 entries.

**What changed in the text:**
- **R04b, REFUTED.** "each with its cause, file and line" was false for a missing answer, which has no line
  (`audit/SKILL.md:130`; the audit's own C02, `audit.md:80`). Line 24 now reads: "Its report lists the
  questions your text answers wrong, why, and where — file and line when a sentence is at fault."
  - `qualifies`: the missing case has no line; a sentence at fault is reported at the line the reader answered
    from (`ledgers.md:106–110`, `measure.md:59`).
  - The claim is renamed to fit the new words.
  - Its edit is split from R03b's, so the qualification rides on R04b alone.
- **The Skills audit row said the same.** It now reads "A report: which questions the text answers wrong, why,
  and where — file and line when a sentence is at fault; no rewording". Its claim is R04j, new, with the same
  check and `qualifies`; "no rewording" rests on `audit/SKILL.md:18–19`.
- **R03a.** The verifier found no form "named one by one or as a folder" on the page. The scope now reads as the
  page gives it: "It asks for the scope — which files to check, every tracked `.md` by default — and where your
  readers start."
  - I kept the default: `audit/SKILL.md:25` reads "Default to every tracked `.md`." Your note says the page
    gives no default; that line does. It is quoted in the run.
  - The folder form is gone; the owner's wish for it stays a page question.
- **C09.** "and give rewrite when it asks" is cut. The sentence ends "a skeleton, an outline you agree to."
  Its `asks` says how the skeleton reaches rewrite is not claimed (D21).
- **C15 and R02g, DOES NOT ANSWER.** The label "**Guaranteed:**" is now "**What the skills promise:**". The
  sentences are unchanged, and `asks` is split by part:
  - the promise is the pages' (level 2);
  - the folder line, run, is level 3 (`probe-04/guaranteed.sh`, 9 of 9);
  - the refusal is level 3 (`guard.sh`, R03g);
  - "nothing … until you say so" is the pages' rule at level 2, with c4-1's partial record
    (`reviews/02/c4-1.md:56, 73, 78`: audit ran to its first question, `git status --porcelain` stayed empty,
    the data directory unchanged). That covers audit's first step only.
  - "**Not guaranteed:**" is kept; R02f held.
- **C05, text unchanged.** Its `asks` is in the page register: the two lines give the order the pages set for
  commands the reader runs, and no page step orders the closing audit. The run now prints
  `measure.md:106–111`, re-measuring after a rewrite and the three ways it fails.

The changed sentences, verbatim:
- Line 24: "It asks for the scope — which files to check, every tracked `.md` by default — and where your
  readers start. … Its report lists the questions your text answers wrong, why, and where — file and line when
  a sentence is at fault."
- Line 34: "If the shape does not stand, run this first to decide a new one: a skeleton, an outline you agree
  to."
- Line 56, the Skills row: "| `/terse:audit` | You cannot tell whether your document is fine | A report: which
  questions the text answers wrong, why, and where — file and line when a sentence is at fault; no rewording |"
- Line 78: "**What the skills promise:** Each run is written in the plugin's own folder. A round that silently
  loses a sentence checked true, or repeats one found false, is refused before you see it. Nothing in your
  repository changes until you say so."

**Checks** (`probe-04/checks-04.log`):
- all 17 claim checks were dry-run first: all match, all under 2000 characters, no NOT FOUND;
- `rule1.mjs`: 0 violations, exit 0, both forms;
- `dup.mjs`: 0 concepts in three or more sections, exit 0;
- `sections.mjs`: exit 0 (words below);
- `ledger.mjs` over 00–04: 0 failures, exit 0, 46 entries;
- the skeleton's part-3 rules: all clean, as before;
- `diff-04.patch`: 149 lines.

Words:

| Section / block | First build | Second build | Budget |
|---|---|---|---|
| (opening) | 65 | 65 | 70 |
| Quick start | 248 | 239 | 190 |
| › Install | 17 | 17 | 26 |
| › Workflow | 208 | 199 | 140 |
| › Update | 17 | 17 | 18 |
| Skills | 114 | 123 | 110 |
| How it works | 164 | 164 | 115 |
| Checks and guarantees | 187 | 190 | 160 |
| Total | 778 | 781 | 645 |

**Checkout.** Its `git status` shows copies of this run's files under
`research/2026-09-22-terse-process/rewrite-2026-09-24/run/` and modified `code-defects.md`, `ledger.json` and
`rounds.md`. Those are the coordinator's record; this round wrote nothing in the checkout.

### Second read (V6b)

`reviews/04/verifier-sol-v6b.md` (Codex Sol V6b): 25 claims, 3 DOES NOT ANSWER (R04b, C05, R04j), 0 REFUTED.
Regenerated by the same recipe. The second build is kept as `edits/04.sent-back-2.json` and
`edits/04.sent-back-2.build.mjs`, its logs as `probe-04/round-04.sent-back-2.log` and `checks-04.sent-back-2.log`.

`04-shape.md` is now SHA-256 `1e6eed3b993a06180f90c7e28aad4bed5d0bb580daba2124b71981b59a8d64e0`. It differs from the
second build by line 40 and the blank line after it: the second build's edits file, rebuilt, gives `9588d64a…` again,
and `diff` against it prints only those two lines. The build still has 19 edits, 25 claims (15 re-pinned, 10 new),
5 drops and 6 `qualifies`; the ledger holds 46 entries.

- **R04b, R04j.** The sentences stand. The shared `qualifies` reason follows the page's table of causes
  (`audit/SKILL.md:129–133`): a false, a misplaced or a hard-to-find answer names a sentence, so the report gives
  its file and line, the line the reader quoted; a missing answer has no line; misleading steps are a sequence of
  true sentences, several lines and no single one. Both `asks` say the same. Their check now also prints
  `measure.md:67–68`, which the reason cites: the reader's quote "names the line that misled the reader, and that
  line is where the repair goes". That line, not `ledgers.md`'s refuted example alone, carries the file and line.
- **C05.** The two command lines get a lead-in, line 40: "Recommended orders, each command run by you:". `asks`
  claims only the recommendation: each command is one the user runs (the three pages' `disable-model-invocation:
  true`); every arrow's step is on the pages, the closing audit's scope included (`audit/SKILL.md:23–25`); a
  re-audit reuses the same questions (`measure.md:106–111`). It states that no page is claimed to order either
  closing audit. The check C05 shares with C09 now also prints the frontmatter and `audit/SKILL.md:23–25`, so C09's
  `saw` gains those lines; C09's words and `asks` are unchanged.

Checks: all 17 claim checks dry-run first (all match, all under 2000 characters, no NOT FOUND); `round.mjs` exit 0;
`checks.sh` exit 0, with `rule1.mjs` 0 violations in both forms, `dup.mjs` 0 concepts in three or more sections,
`sections.mjs` exit 0, `ledger.mjs` over 00–04 0 failures, the skeleton's part-3 rules clean; `diff-04.patch` 151
lines.

Words: opening 65, Quick start 246 (Install 17, Workflow 206, Update 17), Skills 123, How it works 164, Checks and
guarantees 190; 788 against 645. The lead-in adds 7.
