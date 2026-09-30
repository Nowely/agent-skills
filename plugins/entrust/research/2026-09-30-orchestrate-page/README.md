# The orchestrate page fits a compaction: results, method and what carries over to the next cut

2026-09-30, branch `orchestrate-page`, rebased onto main after the codex run merged. The orchestrate half of E77: after a compaction Claude Code re-attaches a skill
whole only up to 20,001 characters (`evals/skills.test.mjs`, rule 4), and `orchestrate/SKILL.md` was 36,075, cut at line
106 of 166, so a coordinator lost Approvals, Verification with its Result table, and the agent's return for the rest of
the session. Written for the session that cut the codex page, E77's other half, for the owner, and for the next cut of a page.

## Result

| | Before (main 4a3f0d7) | After (branch head) |
| --- | --- | --- |
| `SKILL.md` re-attached | 36,075 characters, cut at line 106 of 166 | 19,556 characters, whole; 108 lines |
| where the moment procedures live | on the page, past the cut | four references, each linked from the sentence where its moment comes |
| removed sentences | not measured | 215 checked; each has a home or was deleted by a named decision, see [Checks](#checks) |
| entrust suites | 4 of 22 run on main by Opus W1 before the cut (orchestrate, agent-contract, fragments, swarm), each EXIT=0 | `run-all` 21 of 22 green on the writer's first tree, 1 not run (the paid live gate); on the rebased branch the six suites that read the changed files pass |
| `evals/skills.test.mjs` | orchestrate and codex fail rule 4 | 8 of 8 rules pass on the rebased branch: orchestrate 19,556, codex 19,867 from main |

The page keeps the standing rules and the five steps of the plan. The new references, named by the moment a coordinator
opens them:

| File | Opened when | Lines, characters |
| --- | --- | --- |
| `references/plan.md` | step 1, and every amendment of the plan: composition, pool, card, estimates, worktree fitness, bulk row, effort | 39, 7,151 |
| `references/results.md` | `DONE=`, a hand-back, a failed report, a harvest, writers that collided | 28, 3,408 |
| `references/approvals.md` | `ASK=` or a waiting block, and the synthesis after approvals | 13, 2,695 |
| `references/answer.md` | the draft answer: the checks before it goes out, the options analysis, the completeness critic | 13, 3,527 |

## Method

1. **The question first.** The page served two readers at once: the standing contract a coordinator needs on every call,
   and procedures needed only when their moment comes. And its tests pinned where a sentence stood, not the fact it
   states, so every fix added a sentence to the page and nothing took one away (Codex Terra A1, Fable A2). The fix was
   that boundary and the tests, not the wording.
2. **The criterion** (Fable A2). A rule stays on the page when it is broken silently, with no event that would make the
   coordinator open a file: never grade your own work, the runner redirect, no writes under the data directory, the
   model tag, no `BRIEF:`. A procedure moves to a reference when its moment has a visible trigger (`ASK=`, `DONE=`, a
   return, a draft answer), and the link sits in the sentence that names the trigger, not in a list at the top.
3. **Moving alone does not fit.** The three tail sections moved still leave about 23,600 characters. The rest came from
   deleting duplicates that another file already states (the result rows the codex page owns, the roles' brief content,
   the `--pending` markers the launcher's `--help` prints, the inline schema the shipped file holds) and from moving
   plan-time text behind step 1.
4. **A map, not a rewrite.** Fable F1 wrote one row per paragraph (keep, move verbatim, delete with the owner's address,
   tighten with the new text) and a script that builds the kept page from verbatim line ranges; Fable A2 rebuilt it
   byte-identical. Ten decisions went to the owner with an options analysis each, Codex Luna L1 as the dissenting
   critic, and two advisors (Codex Luna A3, Fable A2).
5. **Three commits by kind** (Fable A2 for the first two, decision (c) for the ledger's): the verbatim moves and owner
   deletions first, then the rewordings, then the ledger and changelog. The audit of the first is mechanical; only the
   second needs a reader, which is where "no edit may lose needed text" bites.

## Checks

- **Removed sentences** ([removed-lines.mjs](removed-lines.mjs)). Every sentence of every line removed under
  `plugins/entrust/plugin/` is looked up verbatim in the plugin's tracked Markdown files at the head, whitespace collapsed
  and link targets blanked; a home in a script's `--help` or in the schema file is left to Opus V2. First pass: 208
  sentences, 160 found. Opus V2 judged the other 48 against the old and new text: 25 reworded with the same meaning,
  16 stated by an owner (12 at the same moment, 3 elsewhere, 1 split), 4 changed, 3 lost. Deleted on purpose: the three
  lost, the Workflow signatures, which the Workflow tool's own description and the harness's workflow-authoring skill state, and two of the changed, the
  maintainer's clause on where driver changes are logged (the owner doubted it) and the Workflow return's schema detail.
  The other two changed and the three stated elsewhere were fixed (below); the split one kept its rule on the codex page
  and its list of reasons in the driver's `--help-all`. After the fix round: 213 sentences, 168 found, and the 45 left
  are all among the 48 already judged. After the rebase: 215 sentences, 165 found; the five new ones are the owner-approved
  edits below (the driver's pid line in three sentences, the accept link, "worktrees").
- **A fresh reader** (Sonnet R1). Given the new page alone and fifteen situations written by Fable F1 from the old page,
  R1 first named the file it would open, then opened it and answered. In every procedural situation it named the right
  file before opening it; fourteen answers led to the rule of the old page's key; one did not (situation 6, below).
- **Cross-review** (Fable L4): three findings on the first three commits; eleven fixes in the first fix round, of which
  L4 confirmed ten; the eleventh was corrected in a second round (below).
- **Suites**: `run-all` once on the writer's tree, 21 of 22 green, 1 not run; after the fix round the five suites that
  read the changed files (orchestrate 89, agent-contract 21, fragments 11, package 13 with 1 skipped, swarm 20), each
  EXIT=0, and `evals/skills.test.mjs` 7 of 8 with codex alone failing. On the rebased branch: those five, terse's
  `pages.test.mjs` 10 of 10 and `evals/skills.test.mjs` 8 of 8, each EXIT=0.

## What the checks caught

| Found by | What | Fix |
| --- | --- | --- |
| Sonnet R1, Opus V2 | the survivors check before a second writer enters a directory where a command was approved (`pgrep`) was deleted as the codex page's; the codex page states it under its stop bullet, not at exit 10, and R1 at exit 10 found it there and did not apply it | restored verbatim in the exit-10 row |
| Opus V2, Fable L4 | "A finding is one that changes correctness or a stated requirement" kept only on the cross-reviewer's row, so refuters lost it | defined once on the page, beside the verifier's brief |
| Opus V2, Fable L4 | the judge's "use the sibling's `EXPECT:` rule for a Codex check" gone; the codex page owns the field, not the instruction | restored on the judge's row |
| Fable L4 | the writers-collided procedure was linked only from plan.md, which is not re-attached | a trigger sentence on the page |
| Fable L4 | one test cut the card sentence on a phrase no case pinned, so losing it passed silently | keyed on a pinned phrase, fails on an empty cut |
| Fable L4, Opus V2 | two dangling references ("is neither", "the top pair"), two pointers that said more than their file does, one duplicate re-poll sentence, three unpinned clauses, a wrong attribution in E117 | each fixed and pinned |
| Fable L4, on the fix round | the repair of "is neither" was itself false: a run refused over a taken path is a turn that never ran | main's facts restored without "neither" |

## What carries over to the next cut

1. **Delete a duplicate only when its owner states the same fact, in the same words, at the same moment.** An owner
   that holds the fact at another step is not enough: both restored rules (`pgrep`, `EXPECT:`) had an owner, at the
   wrong trigger. The codex run found the other half, an owner that held the topic and not the words. Record, for each
   owner deletion, whether the owner states it at the same moment; Opus V2's brief did, and that column found both.
2. **Pins follow the fact.** A line-count pin was a second owner of the page's size (removed; rule 4 in CI owns it). A
   pin that cuts text by an unpinned key passes on an empty cut.
3. **A fresh reader given the page alone, naming the file before opening it**, tests the route the cut creates, which
   the suites cannot see. Word its brief so the sibling pages count as the skill's text: R1's miss may partly come from
   "answer from the skill's own text only" (hypothesis, not tested).
4. **The margin is thin by construction**: orchestrate is at 19,556 of 20,001, so a sentence added to the page now costs
   a sentence moved. The next addition belongs behind its trigger.

## After the codex run merged

The codex run (`e77-codex`, now on main as cf6f92f) and this branch cut the two halves of E77 the same day. Rebased
onto it, this branch merges second and closes what both fix:

- **E77 and E105 are removed from the ledger**, and the changelog lines that said each stays open now say it is fixed
  on both pages. E105's three orchestrate sentences take the codex page's wording, the driver's pid line.
- **orchestrate reads results and accepts from the codex skill.** `references/results.md` sends a coordinator to the
  codex page's `#reading-the-result` and keeps only the mode's deltas; `references/approvals.md` links the codex
  skill's `references/approvals.md#accept`; `references/roles.md`'s judge row links `#header-fields`.
- **The exit-10 survivors check is stated twice, on purpose.** The codex run keeps it in
  `codex/references/environment-and-internals.md`, reached from where the codex page places write agents; orchestrate's
  exit-10 row states it at the moment the mode runs a second writer again.
- **The page no longer names the codex page's "worktree lifecycle"**, a section the codex run removed.
- **Kept as it was:** the `FILE=missing` row of `references/results.md` still restates the relaunch precondition
  (read `RECEIPT=` and `<DIR>/approvals/` first) that the codex run moved, in the same words, to its
  `references/approvals.md#after-the-run`, and that the codex run's report names for this session; the codex page
  itself gives it one line with that link.
- **The genre note** `plugins/terse/plugin/references/genres/skill-page.md` gains the rule of point 1 of
  [What carries over](#what-carries-over-to-the-next-cut), and its E77 example now says E77 is closed.
- **Ledger ids.** This branch's new entry is E117. The unmerged branch `prepare-feedback-constitution` uses E115, E116
  and, since its 5880f40, E117 too, and main's E115 came from the codex run: that branch renumbers when it merges.
- **Not in this branch:** the research index on main has no row for the codex run's directory.

## Not measured

- Whether a coordinator in a real compacted session opens the file at its trigger. R1 read the whole page as a
  re-attached page would stand, but no session was compacted; only a live session can show it, and it is paid.
- The fresh-reader test is weaker than the codex run's: R1 read the page file as it stands, frontmatter included and
  placeholders unsubstituted, in one arm with no old-page baseline, and the coordinator graded its answers against the
  key, not blind. The codex run's `inject.mjs`, its three arms and its blind grader are the stronger form.
- How the codex page's own fix changes the route into `#reading-the-result`.
- The route through `/entrust:prepare-feedback`, which reads the orchestrate page by path with the Read tool
  (`prepare-feedback/SKILL.md:14`). Rule 4 measures what Claude Code re-attaches of an invoked skill; a page read by
  path is not an invocation, so what of orchestrate survives a compaction there is not known, and this cut may not
  reach it.

## Agents and cost

Codex tokens are the reports' totals; Claude agents' tokens are not counted by any report.

| Agent | Role | Tokens |
| --- | --- | --- |
| Codex Terra A1 | advisor on the approach | 316,928 |
| Fable A2 | second advisor, asked by the owner; approach and map | unknown |
| Fable F1 | architect: map, decisions, scenarios, build script | unknown |
| Codex Luna L1 | dissenting critic of the map and the decisions | 501,947, twice the card's 250,000 |
| Codex Luna A3 | advisor on adopting the map | 285,208 |
| Opus W1 | writer: the cut, two fix rounds, the approved additions and the rebase; eleven commits | unknown |
| Codex Luna V1, Codex Luna L3 | removed-text audit, cross-review | 0: the account's Codex rate-limit window was full, no thread started |
| Opus V2 | removed-text audit, replacing V1 by the owner's word | unknown |
| Sonnet R1 | fresh reader | unknown |
| Fable L4 | cross-review and the fix round's check, replacing L3 by the owner's word | unknown |
| Opus C1 | completeness critic of this report and the coordinator's answer, two reads | unknown |

Codex Terra L2 was planned and dropped before launch when the owner ruled Terra out. After the rate limit, every check
of the written text ran on Claude alone and shares one model's bias.
