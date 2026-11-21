# Five more iterations: the plan, written before them

The owner gave a quota of five more iterations. This plan is written before them, so that the results are read
against it and not fitted to it.

## Where things stand

- **Draft 27 on Terra,** on the owner's full task ([31-terra-real-task.md](31-terra-real-task.md)):
  - the builds looked close to the references;
  - the first checkpoint was returned for a consumer-path defect, an observer left on a removed element;
  - the checker's own `transition:none` broke four sheet journeys;
  - the run cost about four times the earlier v19 run.
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

## The iterations

| # | The question | The work | Read as done when |
|---|---|---|---|
| 5 (in progress) | Can the measurement be trusted? | Draft 28.2, mechanics first, then text (see below) | Both benches: the clean builds pass and every known class is caught; the full suite passes |
| 6 | Do the rules cut the cost? | Sonnet A/B, 28.2 against 28.1, on the server card and the listing, two runs each; a blind review | Responses and tokens per round down by at least 30 %, quality no worse, no failure the checker itself causes |
| 7 | Does the consumer-path check work? | Sonnet on the stateful case: the consumer rule and the comparison with a fresh load | The builder finds the stale observer itself before handing over |
| 8 | Does it hold on the real task? | The owner's one pinned Terra run through a real consumer, registered before: a budget, the criteria, the record's eight fields ([30-terra-run.md](30-terra-run.md)), the environment and permissions set up beforehand | The owner's verdict on the first checkpoint, and its cost |
| 9 | Reserve | Fix what Terra shows, or stop | — |

**If iteration 6 shows that the loop still dominates the cost,** iteration 7 instead tests the next hypothesis:
restarting the builder in a fresh context at the first full check with a short handover, or a check-runner role. That
would be draft 29. Draft 28.2 holds only fixes to draft 28.

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
  - a handover note at the first full check.

Each mechanics fix comes with a failing bench control first.

## When to stop

- **Success:** Terra's first checkpoint on the real task is accepted by the owner. It is handed over at `pass` or
  `pending`, with no failure the checker itself caused, at about v19's cost (in the order of 200 calls and 40
  minutes, against 527 and 1:39).
- **An honest stop:** if by iteration 8 the rules have not cut the cost and consumer paths still slip through, the
  skill is frozen as experimental. It keeps what proved useful (the frame check, the bench, the independent review),
  and the reasons not to go further are written down.
- **Within each iteration:** a change that does not move its measure is reverted, not stacked on.
