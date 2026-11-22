# Iteration 7: draft 28.3, Sonnet on two cases, and a capped Terra dry run

## Before

### The architecture critic, after iteration 6

It read [the plan](33-five-iterations-plan.md), [iteration 6](34-iteration-6.md), the Terra run and its cost record
([31](31-terra-real-task.md), [32](32-efficiency-forensics.md)) and draft 28.2. In short: the seen side has nearly
converged, the read side never reached the builder, and the cost rules were never tested where the cost occurs.

- **The ranking** (28.2 first and 28.1 last in both blind sets) would happen by chance 1 time in 9. Neither set held a
  control, so "all returned" cannot be told from a reviewer who returns everything.
- **The code faults** recur because only the review prompt names them, and no one ran the review pass.
- **The type 2 px off** decided 5 of 6 cards: about 10 % of one text, under the check's 20 % single-text rule.
- **The stop rule,** replayed on Terra's [recorded rounds](32-checker-rounds.json), fires only at round 31, the last. It
  ignores quick rounds (24 of 31), and every change of spec or journeys restarts it.
- **Polling is Codex's,** not Terra's: each empty poll resends the whole history, so any model in Codex reproduces it.
- **Over-built:** a page of about 1,000 words against 28.1's 750, and more than a dozen causes of `incomplete`.
  **Under-built:** everything as read, and intermediate states (`sameAsFresh` compares only the end).
- **The likeliest ending:** iteration 8 accepted as seen, and as read after review, but over 200 calls and 40 minutes.

Its recommendations, ranked:

1. code rules on the page, about 60 words, paid for by cutting the implementation review;
2. the review pass run by whoever starts the builder;
3. iteration 8's environment registered beforehand: a longer wait for empty polls in Codex, Chromium pre-approved,
   Figma specs where frames have them;
4. a stop rule that counts quick rounds and matches the first finding by its key across bases;
5. type size per text: width and ink height both departing the same way;
6. iteration 7 on Sonnet, three runs each on the stateful case and the server card, with 1, 2, 4, 5 and 7;
7. a control in each blind set, with as seen and as read reported apart;
8. container queries by default, with a script that measures width counted as a construct.

### Fable's reading of it

It agrees with 7, 3, 1 and 8:

- **7 first:** primed with the 2 px precedent, the reviewer returned 6 of 6, so "as seen" cannot be read now.
- **3:** the largest cost lever. But only 28 of the 134 polls returned nothing, so "fewer than 20 polls" may be the wrong
  target. Both links to the Codex setting are mirrors, so the dry run must confirm it exists.
- **1:** move the implementation review to a reference instead of deleting it.
- **8:** as a default. Terra's card switched on `scrollWidth`, a content fit that container queries cannot express, so the
  observer rule stays.

It changes 2, 4, 5 and 6:

- **2, the review pass:** in real use, whoever starts the builder is the owner, which defeats the goal. The limit that a
  subagent cannot start a second agent belongs to the Sonnet harness. The dry run tests whether Terra in Codex can start
  a reviewer; the pass moves to the coordinator only if it cannot.
- **4, the stop rule:** the round-31 claim replays correctly (`design.mjs:1769-1770`). But:
  - on quick rounds the check prints "unchanged for 3 rounds: fix it or propose it", not "stop";
  - rounds 28–31 were the checker's own `transition:none` fault, which 28.2 removed. The replay's target is the
    −16.69 px finding, first in 19 of rounds 1–21, with a stop by round 4.
- **5, the type size:** needing width and ink height to depart the same way misses c282c's price, which was smaller and
  bold, so its width partly cancelled. Instead:
  - the ink height of the same string at the 2× reference is the primary signal (10 % of 13 px is 2.6 px);
  - the width only vetoes an opposite departure;
  - where a Figma spec exists, the computed size is compared directly, which covers iteration 8.
- **6, iteration 7:** keep the cases and add part B, below.

What the critic missed:

- **Fair questions were never classified.** All six server-card runs ended `pending` with 1–2 proposals. They are now
  [marked provisionally](34-iteration-6.md#the-proposals-handed-to-the-owner-marked).
- **Context size, not the count of rounds, drives the cost:** Terra's input was 180k tokens at round 1 and 501k at
  round 31. A stop rule does not touch this; only the handover note or a fresh context does.
- **A recorded failed launch still reproduces:** `design.mjs check --help` fails with ENOENT and exits 0.
- **The page's text rules showed no measurable effect in iteration 6.** Rule 1's criterion needs the same scepticism.

## The plan

Draft 28.3, not 29. Steps inside this plan go ahead without waiting for approval; only the owner's own run waits for
him.

**Draft 28.3, the mechanics,** each with a failing bench control first:

- **The stop rule** counts quick rounds and matches the first finding by its key across bases. On quick rounds it prints
  "unchanged for 3 rounds: fix it or propose it". Replayed on Terra's recorded rounds, it must stop on the −16.69 px
  finding by round 4.
- **The type per text:** the ink height at the 2× reference first, the width only vetoing, and a Figma spec's sizes
  compared directly. *Shown when* the five iteration-6 cards are flagged at the reviewer's text, and the control and the
  clean builds stay silent.
- **The launch failure:** `check --help`, and any launch that fails, exit non-zero.

**Draft 28.3, the text:**

- **Code rules on the page:**
  - one element for each thing shown, never a hidden copy;
  - units and periods hidden visually, not with `display: none`;
  - selectors scoped to the component, the kit restyled through its props;
  - a journey on `many` that expects its last entry.
- **Container queries by default;** a script that measures width is a construct. The observer rule stays.
- **The implementation review** moves to a reference.

**The measurement:**

- a control, an accepted card, in each blind set, with as seen and as read scored apart;
- each proposal marked fair or unfinished, provisionally by the coordinator from the owner's rulings, with doubtful ones
  left to him.

**Part A, Sonnet,** three runs each:

- the stateful case, with a defect the builder has not seen;
- the server card with a planted first finding the builder cannot fix.

Read as done when:

- the builder finds the unseen defect itself, 3 of 3;
- it proposes the planted finding within three rounds, 3 of 3;
- code questions 1, 4 and 5 get a "no" in at most 1 of 3 runs;
- the control in each blind set is accepted;
- no failure the checker itself causes.

**Part B, Terra in the owner's Codex:** a dry run on the planted card, from a pre-built arm (an iteration 6 build, its check set up, an empty ledger), stopped 3 rounds after the notice or at 60 calls, after Fable found that 30 calls would end before the first full check
([36-terra-dry-run.md](36-terra-dry-run.md)). It tests:

- whether Terra obeys the stop rule;
- whether the Codex wait for empty polls exists in the installed version, and works;
- how many turns go to permissions;
- whether Terra can start a reviewer.

**Iteration 8** is registered from part B's numbers. If Terra ignores the rule in part B, draft 29 (a fresh context at
the first full check) comes before the one real run.

## Results
