# Defects found in passing: entrust

Recorded per the repository rule: evidence at file:line, an evidence level (1: the line resolves; 2: an
independent reader of the code would say the same; 3: the behaviour was made to happen), and wording that
can become an issue unchanged. An entry leaves when its fix lands and the changelog names it. Ids are
shared with terse's ledger, `plugins/terse/ISSUES.md`, so one id names one entry in both. A path
pinned to a commit is that commit's address, with today's beside it.

## E51. The experiment page counts "the four registered first" while protocols.md registers five

**Evidence, level 1.**

- `plugins/entrust/plugin/skills/experiment/SKILL.md:19` (at `882bcf3`): "… the four registered first are in
  [protocols.md](references/protocols.md)."
- `plugins/entrust/plugin/skills/experiment/references/protocols.md:3`: "Five experiments the 2026-09-17 research
  round left as hypotheses …", with the headings `## E1` to `## E5` at lines 5, 15, 25, 35 and 45.
- Found in passing twice, independently, by Opus R3 and Fable F1 in the triage run
  `plugins/entrust/research/2026-09-27-field-audit-triage/` (05c-refuter-r3.md, 07b-architect-deltas.md).

**Check.** `grep -n 'four registered first' plugins/entrust/plugin/skills/experiment/SKILL.md; grep -c '^## E[0-9]' plugins/entrust/plugin/skills/experiment/references/protocols.md`
prints line 19 and `5`.

**Issue text.** The experiment skill page tells a coordinator that "the four registered first" protocols are in
protocols.md, and that file registers five, E1 to E5: a reader who counts on the page misses E5, the mixed team on
one deep task. One word on the page, or the count dropped.
