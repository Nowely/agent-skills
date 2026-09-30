# E77, the codex page: what was cut, how it was checked, what we learned

A run of 2026-09-30 on branch `e77-codex`. It shortened `plugins/entrust/plugin/skills/codex/SKILL.md` so that
Claude Code re-attaches it whole after a compaction, and checked that a coordinator does no worse with the new page.
This report is written for the session that does the same for `orchestrate/SKILL.md`, and for the owner.

## Result

- The page re-attaches at **19,867 characters** by the skill test's count (`node evals/skills.test.mjs`, rule 4,
  each `${CLAUDE_…}` counted as 120), under the 20,001 Claude Code keeps whole; it was 28,393 and cut at line 262 of
  358. It is 259 lines. The margin is 134 characters, so the next addition to the page fails rule 4 and has to go
  to a reference.
- What a coordinator does at every launch and completion stays on the page. Each event (a waiting approval request,
  `FILE=missing` or `PATH=taken`, exits 2, 3, 4 and 6, a preserved worktree, stopping an agent) keeps a line at its
  place, and its procedure sits behind a link on that line: the approval steps in a new `references/approvals.md`,
  stopping an agent and a preserved worktree in `references/environment-and-internals.md`, which already owned
  them. Restatements of `driver.mjs --help` and `agent-run.mjs --help` went, and the sections follow the order of a
  launch: rights, fields, prompt, call, result.
- E105 is fixed on the codex page: it names the `pid=` field of the driver's pid line instead of "the first line of
  `<DIR>/err.txt`". The driver is unchanged, because the launcher and `cleanup.mjs` read that line as one record.
  E105 stays open for orchestrate's three sentences.
- A pre-existing defect was found and recorded, not fixed: E115, the page and the launcher's `--help` offer a decline
  and a second `--run` as a way to stop an agent after a waiting result, and the driver's code does not stop the run
  on a decline (level 2).
- Every entrust suite that reads the page passes, `run-all.mjs` passes 21 of 22 suites on the final branch (the
  paid live gate was not run), and the skill test fails on `orchestrate` alone.

## Method

1. **Measure.** Rule 4 of `evals/skills.test.mjs` gives the re-attached length and the cut line.
2. **Advice before design.** Two advisors of different families answered the approach question: Fable F1 first,
   then Codex Luna LA1 (xhigh), which was given the plan as F1 had shaped it and corrected several of F1's figures
   and line references against the files. Both supported the cut by purpose; neither recommended orchestrate in the
   same change.
3. **Design with an account of every line.** Fable A1 wrote a cut map: each line of the old page is KEEP, MOVE to
   a file and anchor, or CUT with the file and line that already owns the fact. It applied the design to a copy of
   the tree and ran the suites there before any edit. Fable F1 accepted it with five numbered amendments and three
   smaller corrections; one amendment removed a sentence A1 had added that was false for four of the header table's
   eleven rows.
4. **A regression test written from the old page, before the edit.** `scenarios.md` holds seven situations as the
   coordinator sees them (six events the cut moves behind links, one ordinary launch) with a frozen answer key.
   Each reader gets the page as Claude Code puts it in context (`inject.mjs`: the base-directory line, the body
   without frontmatter, placeholders substituted), may read files under the skill's directory and run the two
   `--help`s, and nothing else (`reader-brief.md`, filled by `brief.mjs`). Arms: old page whole, old page as
   compaction leaves it (first 19,900 characters and the truncation marker), new page; readers Sonnet and Opus.
   One blind grader scored the five anonymised, shuffled answer sets against the key (`grader-brief.md`).
5. **Independent checks of the implementation.** Opus U2 classified every removed line of the diff; Fable X1
   cross-reviewed the diff against `driver.mjs`, `agent-run.mjs` and `cleanup.mjs`; the coordinator ran the suites.
   One fix round took their findings, and X1 re-checked it. A last advisor, Opus OA1, who had advised on nothing
   before, weighed the verdict and found one more defect; X1 checked that fix too.

## The scenario scores

Out of 66; each reader answered once.

| Reader | Old page, whole | Old page, after compaction | New page |
| --- | --- | --- | --- |
| Sonnet | 52 | 50, one critical error | 61 |
| Opus | 64 | — | 64 |

The new page scored no lower than the old one on any of the seven scenarios, for either model. Sonnet gained on the
approval request (6 to 10), stopping an agent (5 to 8) and the continuation after exit 3 (8 to 10); Opus scored the
same on every scenario. The only critical error came from the reader of the compacted old page, on S5: it stopped
the wrapper's card and told the user the agent was stopped, although the driver runs outside the wrapper's process
tree. Full table and notes: `grades.md`.

Limits: one answer per reader and arm; the key was written by the designer of the cut; the grader could tell the
new page's answers by the file names they cite. The scores were taken on the page before the review fixes, which
added clauses, shortened three lines and narrowed one.

## What the checks caught

- **Two lost facts in 149 sentence units**, both cut as "owned elsewhere" by an owner that held the topic and not
  the fact: "non-ignored" in "archives non-ignored untracked files" (ignored files are not harvested and are removed
  with the tree), and "`EXIT` the code inside the file", which `agent-run.mjs --help` listed and never defined. Both
  were restored in the file that owns them. The rest: 37 moved verbatim, 67 replaced with the meaning kept, 34 cut
  with an owner shown at file:line, 9 cut as unneeded.
- **An event with no line.** Exits 2 and 4 before a turn had lost their line, and the page's "any other exit judges
  the evidence" was false for them. Restored as one clause with a link.
- **Rules reachable only from the wrong line.** The `pgrep` check before a second writer enters a directory where a
  command was approved was reachable only from the stop line; it now has a clause where write agents are placed.
- **A widening in a rewrite.** Rewording the stop line, the cut extended "decline the request and run `--run`
  again" from after a waiting result to after a `RUNNING=` hand-back too, where no request waits. The old scope was
  restored; whether a decline stops a run at all is E115's question and was left to it.
- **One test assertion lost its target.** `agent-contract.test.mjs` pins page wording; the pins moved with their
  sentences, and one assertion no longer read the page line it described. It was re-pinned by its purpose.

## Findings for the next cut

1. Cut by purpose, then check that every event the page handles still has a line. The one event without a line was
   the cross-reviewer's first finding.
2. Verify "owned elsewhere" at the exact words, not the topic: `grep` the fact in its owner before cutting it. Both
   lost facts failed this.
3. A rewritten sentence can widen its scope; compare its conditions with the old sentence's, not only its words.
4. Leave room for the review. The design landed at 19,269 against a 17,500 target, and the amendments and review
   fixes added 598 characters; the page ended 134 under the limit.
5. Readers follow a link placed at the point of need. Both new-page readers opened `approvals.md` and
   `environment-and-internals.md` on their own.
6. The compacted-page reader read the whole `SKILL.md`, as the truncation marker asks. It scored 50 against 52 for
   the whole old page and made the only critical error; with one answer per arm the run does not show whether the
   cut caused either.
7. A command moved from a SKILL.md into a reference keeps `${CLAUDE_SKILL_DIR}` unsubstituted; `approvals.md` says
   what it stands for, and the readers used it correctly.
8. The test's 120 characters per placeholder overstate this machine's paths by about 350 characters on this page;
   the test is the bound to meet, not the machine.
9. One Codex Luna answer at xhigh cost 836,000 tokens (666,000 cached) and 15 minutes. When Codex could no longer
   run, its roles went to Claude agents.

## For the orchestrate session

The orchestrate page re-attaches at 36,075 characters, 16,074 over the limit, and is cut at line 106 of 166.

- Kept for orchestrate: `## Composition` (`#composition`), `## One call`, `## Rights`, `## Header fields` (its
  `EXPECT:` row and the `OUTPUT_SCHEMA:` path), the composition table's rows and the description template
  "Codex <short name> <id>: <task in a few words>". `orchestrate/references/codex-composition.md` is unchanged
  (`fragments.mjs --check`).
- `orchestrate/SKILL.md:12` names a "worktree lifecycle" that no longer exists on the codex page: a worktree agent's
  launch facts are under its Rights, a preserved tree is
  `environment-and-internals.md#worktree-ledger-and-destination`, and the exit ladder is `driver.mjs --help`. The
  rationale of `evals/orchestrate.test.mjs:103` says the same ("the worktree lifecycle and the exit ladder have
  exactly one home" on the sibling page) and no longer matches.
- `:116` "the sibling's `--decide` call": the call is now in `codex/references/approvals.md#accept`, which
  orchestrate's Approvals section can link instead of restating. `:120` restates `--pending`'s fields, which
  `agent-run.mjs --help` owns and `approvals.md#the-waiting-result` points to.
- `:106`, `:116`, `:142`: E105 is still open there; the codex page's wording is "the pid on the driver's pid line in
  `<DIR>/err.txt`, `entrust: pid=<n> identity=… reportPath=…`".
- `:142` restates what `approvals.md#after-the-run` now holds for `FILE=missing` and `PATH=taken`; `:146` is, with
  `environment-and-internals.md#observability`, the remaining place for the pre-turn `turnStatus: null` shape.
- E115 (a decline does not stop the run) concerns orchestrate's stop wording too, if it offers a decline as a stop.
- E77 stays in the ledger for orchestrate; whichever change closes it removes the entry and the changelog's note
  that E77 stays open for orchestrate.

## Files here

- `scenarios.md` — the seven scenarios with their answer keys, written from the old page before the edit.
- `reader-brief.md`, `grader-brief.md` — the briefs as used (the grader's for five answer sets).
- `grades.md` — the blind grader's table, flags and notes; its sets are A, Sonnet on the old page after compaction;
  B, Opus on the new page; C, Sonnet on the new page; D, Sonnet on the old page whole; E, Opus on the old page whole.
- `inject.mjs`, `brief.mjs` — build the page as Claude Code puts it in context, and fill the reader brief.

## Cost

By the harness's per-agent figure, which counts one call's context and understates the total: Fable A1 333,000;
Opus I1 225,000 and 313,000 (two rounds); Opus U2 229,000; Fable X1 178,000, 228,000 and 238,000 (the review and
two re-checks); Fable F1 125,000 and 197,000; Opus OA1 175,000; Opus R4 115,000 and R5 123,000; Sonnet R1 79,000,
R2 81,000 and R3 105,000; Opus J2 100,000. Codex Luna LA1 836,000 by the driver's count. Codex Terra, the first
Codex advisor, was stopped by the owner's choice before it answered; its tokens were not counted.
