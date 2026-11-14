# Round 11: draft 29 versus control — partial round

**Eight of twelve planned reviews and two of three Carbon assessments completed.** The two synthetic
comparisons are complete. The original private round-6 source/contracts packet and integrity manifest were
not recovered, and the owner confirmed there is no backup. Its four reviews and one assessment were not
launched. They are blocked cells, not failures or successful replications. No later solution was substituted.

## Verdict

On these two familiar synthetic cases, Terra without the skill already found the main behavioral defects.
Draft 29 produced fuller test-gap explanations, more explicit source-based mechanism rationale and a more
consolidated target description. It did not produce a full diagnosis of the concrete reading/change burden
in the importer's coupled responsibilities. It also cost more time and output. This supports the skill as a
structured review/report workflow; it does not establish general architectural superiority or an outcome
on the original private task.

## What ran

The [approved protocol](protocol.md) used fresh `gpt-6.1-terra` sessions at `xhigh`, two reviews per arm per
task. Native records confirm the model and effort. The exact package was pinned at
`843c2a392d31a7bb2129b61d7d74f226fafbb9c7`; its entrypoint and data contract equal frozen draft 29, and its
structural examples equal draft 27. Source, task and package hashes are in the [manifest](manifest.json).

Controls received the common review request and task/source only, with no skill or JSON obligation.
Candidates also received the matching skill package and produced canonical JSON. Both saved a concise
Russian Markdown review. Read-only source/Git operations and candidate report checking were allowed;
application, dependency, test, build and network execution were excluded. No implementations or HTML reports
were requested. Visible commands respected those limits; that is a transcript audit, not OS confinement.

Actual dispatch order was `r01, r04, r03, r02, r07, r08, r05, r06`, alternating arms and balancing repeated
case order. A stale pending host task reduced concurrency; two dispatch refusals occurred before a session
existed. Each measured reviewer ran once. All eight source/package trees remained unchanged, and all four
candidate records passed their pinned checker. Same-session artifact repairs remain included in the cost.

Carbon independently evaluated four full reviews per case using the previously frozen round-8/9 criteria,
rubrics and schemas plus the [round-11 addendum](evaluator-addendum.md). Neutral IDs and reordered packets
hid version labels and telemetry; output structure could still reveal the arm. Each judge read the same
source/task and full review content, with no implementation to grade. Both final structured responses have
verified attribution and schema results. Judge packets were unchanged, with no file changes reported.

## Findings, kept separate

| Outcome | Control | Draft 29 | Interpretation |
| --- | --- | --- | --- |
| Import: core parsing, validation, write-order, duplicate-counting and domain-filter findings | Present in both reviews | Present in both reviews | No new core behavioral discovery attributable to the skill here. |
| Import: D1 concrete maintainability diagnosis | 2 miss | 2 partial | No full D1 hit in either arm. Candidate phase descriptions did not establish a specific reading/change cost. |
| Import: D2 actionable target, raw Carbon rating | 2 partial | 2 hit | Candidate targets are more consolidated; the coordinator qualifies parts of the rating rationale below. |
| Import: F6 unnecessary modes/retry, raw Carbon rating | 2 partial | 2 hit | Candidates articulate more complete caller/store-based justification. Controls already criticize these mechanisms. |
| Locale: root defect and bounded repair, F1 | 2 hit | 2 hit | Both find old eager labels mixed with new lazy labels and preserve historical saved text. |
| Locale: explanation of the current test gap, F2 | 2 partial | 2 hit | Candidates explain the actual missing label coverage; controls suggest tests without identifying why the existing suite misses it. |
| Harmful rubric traps / unsupported recommendations | None reported | None reported | Observed on these eight answers only, not a false-positive guarantee. |

The complete unaltered final judgments are [contact](judgments/contact.json) and
[locale](judgments/locale.json). [Results](results.json) map neutral judge IDs back to runs and preserve the
coordinator's qualifications separately from raw ratings. There is no aggregate architecture-success score.

### Concrete differences and qualifications

- **Locale tests:** the suite checks option IDs, not list labels; its Russian-label checks cover only the two
  new IDs. Both candidate reviews explain those gaps and propose all IDs through both readers. Controls find
  the defect and recommend checking the public readers, but do not diagnose the existing test coverage.
- **Import targets:** candidates spell out whole-file parsing, validation/rejections, last-valid normalized
  selection, then one application/count per key. Controls already recommend whole-file parsing before writes
  and last-valid normalized selection before applying duplicates. The difference is completeness and explicit
  integration, not discovery of a wholly different solution.
- **Judge limits:** Carbon sometimes describes controls as not having inspected the store/tests. Native calls
  show they did read those files. What differs is the written explanation. D2 explicitly does not require an
  exact helper name or a single target paragraph; missing `normalizeEmail` naming and scattered presentation
  alone cannot justify a downgrade. Preserve the raw D2 ratings, but do not use that contrast as proof of
  architectural superiority. No second judge was requested; the disagreement remains explicit.
- **A control-only detail:** r05 calls out the unnecessary `rows` output field. Neither candidate highlights
  it as a separate removal. The skill did not dominate every necessity observation.
- **Schema-shaped target:** r08 initially marked `importContacts` as `split` while naming no new target unit.
  After the checker rejected that inconsistency, it added `planImport` to the target. This is a real final
  recommendation, but counting the new helper as an independent architecture finding would be misleading.
  The [audit](audit.json) preserves the diagnostic and before/after structure; the other candidate keeps
  understandable phases in the existing function.

The coordinator checked the cited parser/store contracts, import branches, locale readers and current test
suite, and compared the full reviews. These qualifications do not silently replace the judge's ratings.

## Cost observed in these runs

Means of two reviews per arm/case; timing is native task start to completion. Candidate report assembly and
checker repairs are included. The public [per-run usage](reviewer-usage.json) retains every sample.

| Case / arm | Seconds | Uncached input tokens | Output tokens | Delivered Markdown + JSON bytes |
| --- | ---: | ---: | ---: | ---: |
| Import / control | 92.0 | 14,885 | 1,710 | 5,043 |
| Import / draft 29 | 199.9 | 19,894 | 6,104 | 29,017 |
| Locale / control | 74.0 | 4,004 | 1,006 | 1,276 |
| Locale / draft 29 | 172.1 | 15,464 | 4,826 | 17,121 |

The candidate took about 2.2–2.3 times as long in these samples. Much of its extra output is the canonical
record, a deliberate part of the product. This is not a separate estimate of reasoning cost. Cache reuse,
dispatch order, shared host context and provider latency limit generalization. Native response usage was
deduplicated and reconciled with cumulative counters; cached input and reasoning are subsets, not additions.

The two Carbon sessions took approximately 10.1 and 12.0 minutes. Their raw adapter usage is retained
[separately](judge-usage.json); it is not added to native token totals or presented as a billing receipt.
Preparation, coordinator and relay costs are not included in these reviewer/judge figures.

## Reproduction and preservation

- Source fixtures remain at the pinned commit under `plugins/entrust/evals/review/cases/`; run the pinned
  `prepare.mjs` for the named `head` to reproduce the manifest's base/head commits and task/source hashes.
- The [run prompts](prompts) use `<RUN>` in place of local paths. Candidate prompts point to the full matching
  review package. The delivered [reviews](reviews) preserve substantive text; local source links are relocated
  to the pinned public fixture, and local output/tool paths are replaced. Raw artifact hashes are recorded.
- Evaluator criteria/schema/rubric hashes are in the manifest. Contact uses round 9 criteria/schema and the
  contact-import-v2 rubric; locale uses round 8 and locale-options. The addendum is the only protocol override.
- Exact input packets, raw reviewer outputs, native audit data and full adapter reports/transcripts are
  checkpointed privately in durable storage. Public artifacts contain no internal project source or private
  task/review text. Earlier drafts and rounds were not rewritten.

## What follows

Keep this partial result as evidence about the two completed cases. Finish the private comparison only if
the exact packet can be recovered and verified; a reconstructed or different snapshot needs a separately
identified experiment. The current outcome does not justify another round of wording changes merely to
increase scores. A later study seeking general architecture value needs unfamiliar tasks and, when
measuring code outcomes, fresh matched implementation arms rather than comparisons with old round-10 actors.
