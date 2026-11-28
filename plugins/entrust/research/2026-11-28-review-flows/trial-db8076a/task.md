# The task: commit db8076a

review: a continuation carries a block only while what it was kept for stands, drops sources that pointed into the previous record, and matches a conditional question with its parent's condition

An external review of PR 109 showed a consumer carried and kept though the unit it uses had changed, a carried
requirement's ref silently naming another entry, and an answer offered to a child question whose parent condition had
changed. Carry and check now share one rule for a stale carried block through units and their uses, carry leaves out
refs into the previous record and says so, and the answer offer reads the parent's question and variants.

## CHANGELOG lines the commit adds

- A kept block is carried only while what it was kept for stands: a block of a unit that changed, or that uses one that did through `uses`, and a block with no unit in a file that changed, are read again, and such a unit is judged again; `check` refuses such a block marked carried.
- a source that pointed into the previous record by `ref` left out, so it is cited again
- the question with its context, variants, consequences, recommendation and the parent's condition, the finding with its evidence
