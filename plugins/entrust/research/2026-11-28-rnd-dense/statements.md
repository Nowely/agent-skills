# Subtraction test on case E117: statements and rule, written before the runs (2026-11-28)

Arms, one session each, Sonnet, the v3 harness, case e117 ("fix E117 from ISSUES.md"), the same repository base as
the earlier trials C1 and C2:
- present rnd: C1 (skill at 93f89d0) and C2 (skill at 8aea356), already run;
- minimal rnd: M1, a minimal rnd written for this test (gate command, plan then wait, result list, one focused
  reader with a default rule), dense and structured;
- host alone: H1, arm N, no skill.

The reader gets the four patches under neutral names, not the arms, and the fact list
(v2/cp3a/reader-input/E117/fact-list.md), and marks:
- O1. For each fact of the list: `kept` (it stands in the tree after the patch, with its conditions and values),
  `changed` (it stands with a condition or value altered), or `lost`. Totals per patch.
- O2. Fact 23 (the condition that an earlier run dropped while its rule moved): its mark, quoted.
- O3. E117 is resolved: the duplicated row has one owner and the other page points to it (`yes`, `part`, `no`).
- O4. Lines the patch changes outside what E117 needs, with a short reason each.
- O5. Turns and cost (from the harness, not the reader).

Rule:
- Minimal rnd holds against present rnd on this case when its `lost` plus `changed` is no more than the better of
  C1 and C2, it keeps fact 23 wherever C1 or C2 keeps it, and O3 is `yes`.
- Present rnd shows an outcome gain over the host alone on this case only when H1 is worse on O1 or O2 or O3.
- One session a side decides only about this case. The decision on direction is taken with the critic of direction,
  not by this rule alone.
