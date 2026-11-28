# rnd dense: does a dense `rnd` built up from a minimal probe hold against the present one?

**Question.** Does a dense `rnd`, built up from a minimal probe, hold against the present `rnd` on outcome? The
owner's decisions for the rewrite are in [messages.md](messages.md).

## The subtraction test on e117

One session a side, Sonnet, the v3 harness with a scripted operator, case e117 ("fix E117 from ISSUES.md"), the same
repository base. Statements and rule, written before the runs: [statements.md](statements.md). A fresh reader marked
the four patches blind, against a fact list of 54.

| Arm | Session | Kept of 54 | Changed | Fact 23 | E117 resolved | Cost (USD) |
|---|---|---|---|---|---|---|
| present `rnd` | C1, C2 | 54, 54 | 0 | kept | yes | 0.66 and 0.42 |
| minimal probe | M1 | 52 | 2, fact 23 among them | changed | part | 0.85 |
| host alone | H1 | 51 | 3, fact 23 among them | changed | yes | 0.28 |

By the rule written first, the minimal probe does not hold (changed 2 against 0, fact 23 changed), and the present
`rnd` shows a gain over the host alone on this case (H1 worse on O1 and O2).

## Limits

- One session a side, so the result decides only about this case.
- Sonnet only, with a scripted operator in place of the owner.
- e117 shaped `rnd`'s text in v2 and v3, so the case is in-sample: the present text passing it is a regression test
  passing, not evidence of a margin on a case that shaped nothing.

## The critic of direction

[direction.md](direction.md) reads the runs (its Cyrillic quotations of session replies are translated):

- The carrier is Change's rule on facts and values: a fact is never removed to make a change smaller, and a value
  changes only on the user's words naming it. C1 and C2 cited it before editing; M1 and H1 lacked it and changed the
  value.
- The probe's reader caught fact 23, but its loop did not close: the session kept the change on its own judgement.
- The gate script ran green over the changed value, so it is necessary and not sufficient.
- Plan: build up from the probe, adding a line only for a failure a run showed; add the invariant as a concept, not a
  case; close the reader's loop; test on a held-out case (arms: new `rnd`, present `rnd`, host alone) before anything
  else is added.
