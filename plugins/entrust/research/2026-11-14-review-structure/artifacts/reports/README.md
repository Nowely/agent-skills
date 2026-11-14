# Synthetic review reports

This export contains **50 synthetic reviewer pairs**: six from the draft 30/31 pilot below,
[12 from the tradeoff rounds](tradeoff/), and [32 from the four-arm follow-up](four-arm/).
The four-arm and tradeoff exports also include selected source-grounded assessments and crosschecks.
No raw real-task materials or reports are included, and no new model runs were made for this export.

| Pair | Case | Arm | Draft | Input |
| --- | --- | --- | --- | --- |
| [r02](pilot/r02/) | A: workshop orders | candidate | 31 | [A](fixtures/A/) |
| [r03](pilot/r03/) | B: exhibit labels | baseline | 30 | [B](fixtures/B/) |
| [r05](pilot/r05/) | A: workshop orders | baseline | 30 | [A](fixtures/A/) |
| [r06](pilot/r06/) | B: exhibit labels | candidate | 31 | [B](fixtures/B/) |
| [r07](pilot/r07/) | corrected B | baseline | 30 | [corrected B](fixtures/B-corrected/) |
| [r08](pilot/r08/) | corrected B | candidate | 31 | [corrected B](fixtures/B-corrected/) |

Pair-to-arm mapping for r02–r06 comes from the pilot package manifest; r07/r08 follow the pilot follow-up record. [mapping.json](mapping.json) identifies source-relative artifact names, per-file original and published SHA-256 hashes, and fixture source-relative names and hashes. The `pilot` source alias denotes the review31 pilot's `review` directory; machine-specific roots and session IDs are intentionally omitted. The original files were not modified.

## Transformations and limits

- Each pilot pair is the original review Markdown and JSON, not a new review or a scoring result. Absolute machine-specific brief paths were replaced with relative references to the copied synthetic fixtures. Markdown links formerly pointing to the unavailable `../repo/order.js` were redirected to the corresponding copied A head. Other text, reported git object IDs, range expressions and diff hashes were retained. The fixture files are byte copies. Original Git objects for A and the first B are not included, so their recorded ranges cannot be resolved from the snapshots. The corrected B includes `history.bundle` with its original two-commit synthetic history, fixture-only author identity and `main` ref; `git clone --branch main fixtures/B-corrected/history.bundle <destination>` restores it. Its base and head trees match the published snapshots. None of these artifacts reproduces the original model environment or reviewer execution.
- The corrected B input was selected post hoc after a defect was found in the original control; it is not an independent held-out control. The corrected control does not establish a general quality or reliability claim. Original B is not a clean negative control.
- The six pairs and nine fixture files were individually read for publication and checked for local paths, session IDs and obvious secrets; JSON was parsed. Such checks cannot prove absence of all sensitive data. The real source and real reports are not included.
- Statements about tests and behavior inside these six historical reviewer reports are the reviewers' claims.
  The two corrected B JSON reports passed their respective historical checkers against a repository restored
  from the bundle; those historical checkers are not included in this pilot export. Their full evaluator
  reports are not included; consult the existing public pilot narrative for the previously recorded
  assessment and caveats.
