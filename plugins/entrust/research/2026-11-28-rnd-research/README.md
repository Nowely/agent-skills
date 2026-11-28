# rnd research route: moving the research method into `rnd`

**Question.** Can `rnd` research and evaluate skills when the request carries no edit, choosing for each question
the evidence it needs (a practical run, an evaluation against requirements, a comparison between variants), without
letting an unsuitable control stop a check that is useful on its own?

**Approved direction.** The owner's [direction comment](https://github.com/Nowely/agent-skills/pull/120#issuecomment-7238644242)
([messages.md](messages.md)): move the shared research method into the installed `rnd` skill, make it discoverable
from the repository, add a read-only Research route, record what was available, selected and delivered, keep failed
and unknown outcomes visible, keep a mandatory requirement even when every variant fails it, report quality, harm,
time and cost separately, reuse a baseline only under comparable conditions, and say how an approved plan reaches a
child agent.

**What PR 120 changes.** The method moves to `plugins/entrust/plugin/skills/rnd/references/research.md`; `AGENTS.md`
points to `rnd`; `rnd` gains a Research route; the evaluation pages gain the marks above. The review of `c435d99`
added fixes: the rename of `AGENT.md` to `AGENTS.md`, this record, the check-cost rules, and the Research route's plan
step, result form and reader.

**Decisions.** The owner delegated (a) to (e) to the review of `c435d99`; (f) is the coordinator's:

- (a) every session of a check gets its own copy of the working tree; a practical run on the user's real task, with
  their authorization, is a use and runs where the task is;
- (b) `unknown` stays a mark, and the plan says beforehand how it counts toward the verdict; unsaid, it counts as
  `false`;
- (c) a statement no session could pass on that setup is fixed before the rest start;
- (d) the method stays in `rnd`, which may not link outside its installed files;
- (e) the review protocol still stops to agree on a next step.
- (f) The coordinator's decision, not one the owner delegated: "A correction" stays in `references/plan.md` and `SKILL.md`
  links to it there, a departure from the coordinator's own review item 10 ("move it back whole"): the section is 1,584 characters, `SKILL.md` has room for 148 under the 20001-character
  limit, and a following PR will rebalance the body. Every link that landed on the stub now lands on `plan.md`.

**Listed by the coordinator, accepted by a general word.** On 2026-11-28 the coordinator listed, in the review session,
seven changes of value that PR 120's first commit made and that the direction comment does not name
([messages.md](messages.md)); the owner gave a general word for what waited on it, not a word naming each:

1. answers the floor reaches now count; a floor pass the candidate misses is a regression (checks.md, transfer test);
2. `not needed` also requires no regression (checks.md, transfer test);
3. a statement every run passes stays in the absolute assessment and leaves only the relative difference (test cases item 5);
4. an unobserved selection is `unknown`, not a confirmed miss (selection check);
5. with no user, a child carries out a passed scope when it holds the paths of the plan and of the user's saved word; otherwise it returns its plan (SKILL.md standing rules);
6. readers of sources with no user follow a scope passed as the standing rule says (analysis.md);
7. the description no longer excludes reviewing a skill, which is now Research.

**Unverified.** The transcript of the Codex pilot that declined the practical check was not read, so the cause of
its refusal is an inference. Selection of the Research route, against near-miss requests, is unmeasured.

**Not comparable.** Until the rename, no session received the repository's rules on its own, since the rules sat in
`AGENT.md`, which no host reads. Since the rename every session does. A baseline recorded before the rename is not
comparable with a run after it.

## Findings during the work

**Which reference files sessions open.** Of 48 recorded sessions of earlier versions of `rnd`, the 33 of arm R (the arm that was given the skill) were scanned. In the
14 Create sessions, `SKILL.md` and nearly every reference file were opened, each whole (`analysis.md` in all 14,
`structure.md` and `checks.md` and `critics.md` in 13, `reflection.md` in 12, `hosts.md`, `writing.md` and `plan.md`
in 11). Of the 19 Change sessions, 10 opened only `SKILL.md` (a search of another file does not count as opening it);
the others opened `critics.md` (9), `analysis.md` (6), `checks.md` and `writing.md` (5 each). Limit: earlier versions,
not this one; some Change cases were small; and a file not opened shows nothing about whether it was needed. The script
is kept in this folder as [scan.py](scan.py); it reads the session folders given as arguments.

**The load check.** A fresh headless Claude Code session (2.1.332), started in this cloud container in a copy of the
branch, answered `none` when asked for the Fan-outs rule that `AGENTS.md` carries. A control, a plain `CLAUDE.md` holding
a marker in an empty folder, was also answered `unknown`. So here nested headless sessions receive no project
instructions under any name. The cause is not found, and Claude's loading of `AGENTS.md` is unverified here. The Codex
check is requested in the PR. Consequence: the harness sessions of earlier runs, started the same way, received no
project instructions either, so the rename does not by itself make their baselines incomparable on this host (the
**Not comparable** note above holds for hosts that do read the file).

**Prior art.** A read of five public sources (Hermes Agent, ACE, the Darwin Godel Machine, GEPA, and the Claude Code
memory documentation) gave five hypotheses for `rnd`. They are hypotheses only; none is applied, and none was seen in an
`rnd` run. Each is given with the test that would refute it:

- H1, the writer of an edit does not see the held-out part of the check: write the edit twice, with all cases visible and
  with half withheld, and judge both on the withheld half; refuted if the visible-cases text scores no better there.
- H2, screen an edit on a few cases before the full check: replay stored check records; refuted if more than one in five
  accepted edits would have been rejected, or if no record exists.
- H3, judge a retro's lessons only against evidence the acting agent did not produce: take the last three retro-born
  Changes; refuted if every one already stands on external evidence.
- H4, keep a rival text that wins a case the leader loses: compare the average winner with a merge of both on fresh cases;
  refuted if the merge does no better.
- H5, a "lessons, not logs" line test in the writing rule: count lines with dates, run ids or quoted words in edited
  skills; refuted if the count is near zero.

Limit: the sources report their authors' own measures, mostly single runs without variance and on tasks other than
skills. No source compares a human-gated change with the same change ungated, so the value of the owner's approval step
is unmeasured.

**The trials of Change and Create.** Two Change sessions and one Create session, on Sonnet, started through a scripted
operator with capped turns, each session run once (the sessions of the first head, `93f89d0`, and of the head with the
plan sentence, `8aea356`). Create, stopped at its plan (K1), held: one plan, every agent with its model and cost, the
plan page opened first. Change on a recorded case (C1) and a second Change (C2) delivered without the judges, the
close-out and `result.md` that step 9 names; both ran the preservation gate to green. C2 had the sentence in step 4
that names the judges as parts of the plan; it put the judges as a question under the Fan-outs rule of `AGENTS.md`
and, told to decide by the repository's principles, started none. The sentence was taken out. Limit: one session a
side, so the result is about these runs and not a rate; the operator was scripted, and the real owner answers such a
question differently; and the trials count the steps taken, not what the change was worth, so they do not show that
the skipped judges would have changed either patch.

**The selection check, two batches.** The first batch (3 requests meant, 3 near misses, Claude Code 2.1.332, three turns
each) is void: its set was written by someone who had read the description. The second, from a fresh writer: 2 of 3
requests meant selected `rnd`, 0 of 3 near misses did, and the one miss, a request to create a skill, went to a rival
skill. Limit: three a side, one run each, one host and model, a small neutral repository, and the two sets differ, so
the batches do not compare with each other or show a margin over any earlier description.

**The critic of direction.** On the branch head it returned `change direction`, in three lines: stop answering each
finding with more text, since three sentences for the same skipped judge have failed; run a subtraction test of a minimal
`rnd` against the present one, judged on outcome, which no run has done since the third measured version; keep the gate
script and the plan-then-wait rule, the two parts the sessions follow. Limit: one critic, commit subjects and sizes read
and not each line's origin, and no outcome measured in this PR.
