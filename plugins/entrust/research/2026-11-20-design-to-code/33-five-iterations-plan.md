# Five more iterations: the plan, written before them

The owner gave a quota of five more iterations. This plan is written before them, so that the results are read
against it and not fitted to it. It was revised twice: before the first of them ended, after Fable's review of the
goal, the measures and the critic's timing; and after iteration 6, by the critic's and Fable's reading
([35-iteration-7.md](35-iteration-7.md)).

## The goal

**The owner accepts the first submission, as seen and as read, without having to find the defect himself.**

The implementer is Terra, in the owner's Codex or OpenCode, with Figma MCP or only screenshots, building or changing a
responsive component. "Done" means checked, not claimed. The owner's stance:

- the layout is built on logic, not hacks, and a moderate mismatch is fine;
- text over text is the main real failure;
- the container limits the width, and the component grows downward with N entries;
- what belongs together stays together, as a price with its period;
- no type of another size, and no popover cut by the window;
- the component works in the real consumer: a remount, a parent's width, a transition.

Review and tidying of internals as separate uses are left out of these five iterations: they cannot be tested in them.

**"As read":** the blind reviewer who already runs at handover also reads the diff, and answers five questions yes or
no, each with a file and line:

1. One rendering path for each thing shown: is there no duplicated price view?
2. Do observers and listeners follow the mounted element, and are they cleaned up?
3. Does it use the kit's public surface, not its internals?
4. Is there no later rule overriding an earlier one for the same mode, and no selector reaching outside the component?
5. Is what the layout hides still available to a screen reader?

A "no" is a note for the owner, not an automatic return. This is a reviewer's brief, not a detector.

## Where things stand

- **Draft 27 on Terra,** on the owner's full task ([31-terra-real-task.md](31-terra-real-task.md)):
  - the builds looked close to the references;
  - the first checkpoint was returned for a consumer-path defect, an observer left on a removed element;
  - the checker's own `transition:none` broke four sheet journeys;
  - the run cost about four times the earlier v19 run, whose inputs differed.
- **The measured cost** ([32-efficiency-forensics.md](32-efficiency-forensics.md)):
  - the loop after the first full check took 85 % of the cached input, and the same first finding came back in 18 of
    31 rounds;
  - polling took 27 %;
  - the context grew mostly with tool text and inline scripts, then images;
  - the permission helper took about 13 %.
- **Draft 28.1:**
  - findings in two tiers;
  - conditions the check makes itself;
  - "wraps with room";
  - the type's size;
  - a simpler ledger;
  - a 750-word page.

  On a bench of an accepted control's mutants and frozen submissions it caught 13 of 14 known return classes, and both
  clean builds passed. With Sonnet, the listing case was accepted in 4 rounds, and server card A was handed over at
  `pending` in 11.

## The direction

No new detectors. Three things, in this order:

1. the measurement can be trusted;
2. fewer rounds, and each one tells the builder something new;
3. the check sees the consumer paths where things actually broke.

Separate roles are a hypothesis, tested only if rules are not enough.

Steps inside the approved plan go ahead without waiting for approval; only the owner's own actions wait for him.

## The measures

Each run records the eight fields in [30-terra-run.md](30-terra-run.md#the-record-every-run-keeps), and with them:

- **the first-submission verdict, as seen and as read:** each code question with its answer;
- **what the owner had to do:** minutes of review, and each decision handed to him, marked by the owner as one of
  two kinds:
  - a fair question: the design or the contract is silent or contradicts itself (a missing state, an unbounded value,
    frames that disagree, the kit against the drawing);
  - unfinished work presented as a question: the builder could have fixed it;
- **the full cost:** the builder's, plus every role's (reviewer, coordinator, helpers);
- **the spread across runs:** an effect is shown only if the arms' ranges do not overlap.

## The iterations

| # | The question | The work | Read as done when |
|---|---|---|---|
| 5 (in progress) | Can the measurement be trusted? | Draft 28.2, mechanics first, then text (see below) | Both benches: the clean builds pass and every known class is caught; the full suite passes |
| 6 | Do the rules cut the cost? | Sonnet A/B, 28.2 against 28.1, on the server card and the listing, three runs each; a blind review that also reads the code | Responses and tokens per round down by at least 30 %, the ranges not overlapping; quality, as seen and as read, no worse; no failure the checker itself causes |
| — | The architecture critic | Once, after iteration 6, before choosing iteration 7 | Its reading decides between more rules and a change of approach |
| 7 | Do the consumer paths and the stop rule work, and does Terra obey? | Draft 28.3 ([35-iteration-7.md](35-iteration-7.md)). Part A: Sonnet, three runs each on the stateful case with a defect it has not seen, and on the server card with a planted first finding it cannot fix. Part B: a Terra dry run in the owner's Codex, capped at about 30 calls | The builder finds the unseen defect itself and proposes the planted finding within three rounds, 3 of 3; the control in each blind set is accepted; part B's numbers register iteration 8 |
| 8 | Does it hold on the real task? | The owner's one pinned Terra run through a real consumer, registered before: the budget, the criteria, the record, the environment and permissions set up beforehand | The owner's verdict on the first checkpoint, as seen and as read, and its full cost |
| 9 | Reserve | A second Terra run if the first was accepted; otherwise fix what Terra showed, or stop | — |

**After iteration 6,** the critic and Fable chose more rules over a change of approach: draft 28.3 holds fixes to
28.2. Draft 29, restarting the builder in a fresh context at the first full check with a short handover, comes before
iteration 8 only if Terra ignores the stop rule in part B.

**The critic out of schedule,** on any of these:
- a second failure that the checker itself causes;
- the same return class coming back after a fix aimed at it;
- a mechanics fix that needs a third special case;
- the code read and the visual check disagreeing about the same build.

It does not run after iteration 8: by then there is no room left to act on it.

**Draft 28.2:**
- **Mechanics:**
  - the collapsed-gap false pass;
  - transitions that run in journeys;
  - a comparison with a fresh load after a lifecycle or parent-width path;
  - the critic's checker items;
  - a digest of at most 15 lines, what changed first;
  - stopping when the first finding is unchanged over two rounds;
  - an exit for a finding the checker caused;
  - each round's duration and output in the history.
- **Text:**
  - the consumer-level handoff rule;
  - each control's supported interactions;
  - the price and its period;
  - waiting in the foreground;
  - crops, not whole pages;
  - probes as one script on disk;
  - a handover note at the first full check;
  - the reviewer's five code questions.

Each mechanics fix comes with a failing bench control first.

## When to stop

- **Success:** Terra's first checkpoint on the real task is accepted by the owner. It is:
  - accepted as seen and as read, with no unanswered "no" among the code questions;
  - handed over at `pass`, or at `pending` with no unfinished work presented as a question. Fair questions are not
    capped, since designs have gaps: they come as one list, each with its options and their cost, and none repeats a
    ruling the owner already gave;
  - free of any failure the checker itself caused;
  - within a budget in the order of 200 calls and 40 minutes for the builder, with every role's cost counted beside it.
    The budget is not a baseline: v19's inputs differed.

  One accepted run is "accepted once". A second run in the reserve iteration says whether it holds.
- **An honest stop:** if by iteration 8 the rules have not cut the cost and consumer paths still slip through, the
  skill is frozen as experimental. It keeps what proved useful (the frame check, the bench, the independent review),
  and the reasons not to go further are written down.
- **Within each iteration:** a change that does not move its measure is reverted, not stacked on.
