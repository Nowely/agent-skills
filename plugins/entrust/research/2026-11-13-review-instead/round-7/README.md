# Round 7: mandatory line allocation

The owner approved a controlled diagnostic: three fresh Terra/xhigh reviews with full draft28 and three with
the same substantive instructions but no mandatory exhaustive changed-line `blocks` allocation. Carbon and
GLM independently judge the shared semantic sections. No implementation stage, clean target, locale-options
trial, browser, image capture or application/test execution is included.

## What differs

Full draft28 uses its normal complete report and checker. The reduced arm retains requirements, independent
parts/rules, units and connections, mechanisms and their costs, findings, refutation and current/target structure.
It omits only the block table, exact line ownership and associated derived links/validation; semantic links are
recorded in unit jobs. It writes an experimental analysis artifact, not production render-ready JSON. Source
reading is not reduced. The installed/shipping skill is unchanged.

The [exact ablation](light-ablation.patch) applies with `git apply --unidiff-zero` to an assembled draft28 package.
Assemble full from the draft25 runtime at `9ee0189c`, with the draft28 entrypoint/data contract and the draft27
structural examples from `af271cbb`. [Manifest](manifest.json) pins both complete packages and the preparation
checks. A separate synthetic checker fixture confirmed full line enforcement and preservation of non-block
reference/requirement/mechanism checks in the reduced arm. This was not a model or private application test.

## Shared conditions and evaluation

Both arms receive identical copies of the enriched original flawed snapshot/task from round6, the same neutral
prompt and allowed tools, and separate output directories. Source and package hashes were verified before
launch. Runs interleave the arms; every reviewer is fresh, with no previous result, suspected finding or final
solution. Every started attempt and repair remains in the record.

The judges receive the same original source and a common-field projection of all six reports under randomized
IDs. Block tables and UI label dictionaries are omitted from that view; source locations and substantive
claims are not rewritten. Raw originals stay private. Formats/prose may still reveal the method, so perfect
blinding is not claimed. Inspect unique block-only information separately when interpreting this projection
limit: this compares substantive review output, not full-report navigation or HTML usability.

Compare source-supported useful recommendations/targets, material misses and unsupported changes, plus
agent duration, tool/report-work steps and input/cache/output tokens separately. More findings, fewer lines
or shorter output are not success criteria. Keep both judges' original ratings and unresolved disagreements.
Preserve the full method unless a useful quality/cost signal appears without an identified coverage loss; a
tie or noisy sample is inconclusive. Existing round6 data is context, not a causal control for this ablation.

## Measured workload

[Per-run measurements and aggregates](usage.json) preserve all six attempts. Cached input is a subset of input;
reasoning is a subset of the native reviewer's output. These are summed request tokens, not unique context
lengths. Judge/coordinator/relay work is excluded from this comparison; no dollar-cost estimate is inferred.
[Judge workload](judge-usage.json) is recorded separately with raw adapter accounting and unconfirmed effective effort.

| Measure (three reviews per arm) | Full draft28 | Without line allocation |
| --- | ---: | ---: |
| Mean total tokens, including cached input | 1,178,861 | 1,070,754 |
| Mean uncached input tokens | 77,480 | 66,136 |
| Median uncached input tokens | 70,255 | 65,636 |
| Mean output tokens | 8,559 | 9,973 |
| Mean review duration | 188 s | 211 s |
| Median review duration | 185 s | 189 s |
| Duration range | 183–196 s | 188–257 s |
| Mean normalized artifact bytes | 23,012 | 23,769 |
| Mean common-field artifact bytes | 17,271 | 23,749 |
| Mean tool steps | 14.7 | 13.3 |

The reduced arm used 14.6% less uncached input on average, but 16.5% more output and produced 3.3% larger
artifacts. One reduced-arm run dominates the mean time difference. Three samples per arm on one target do
not establish a stable speed or cost effect. The reduced reports moved detail into units/rules, including
separate test/localization units; extra diagram nodes are not evidence of better code decomposition.

## Integrity and limits

- All six report checkers passed; all six source/package hashes remained unchanged. The reduced checker
  explicitly does not validate complete changed-line ownership. Checker success is not semantic correctness.
- Two runs (r04 full and r06 reduced) temporarily wrote their report under the source directory, then moved it
  into the allowed output directory and cleaned up. Both remain included, with the deviation disclosed.
- Visible reviewer and judge commands are audited separately from their prose. Reading existing tests is not
  running them. No application, test suite, build, browser or image work is part of this round.
- Full reports' block-only descriptions add exact line navigation and requirement/test links. The coordinator
  found no additional independent defect or target there. The shared projection still omits those useful
  navigational details; this round does not compare complete report usability or the HTML structure view.
- One reduced report contains a malformed repeated digest in its coverage prose, although the correct digest
  is also recorded elsewhere. Source identity was verified independently. Two other reports omit that digest
  but record both revisions; no report is silently repaired or excluded.
- The dependency bundle includes a reconstructed pinned library plus its checked-in patch, not a proven
  historical installation. Static library tracing cannot prove live lifecycle behavior.
- Private source, original reports, judge answers and session logs stay local. Public summaries are anonymized.

## Findings and interpretation

Both independent judges group all six reports as substantively equivalent. Each arm produced the same
source-supported recommendation in 3/3 runs: remove a redundant lookup, its intermediate classification set
and lookup-specific tests; make the decision directly from data already supplied by the contract. The lookup's
failure bypass and its redundancy are two aspects of one root finding, not separate detection wins.

Both judges support the proposed target's preservation, actionability and structural usefulness in every run,
with no unsupported changes or confirmed material misses reported. [Per-run ratings](results.json) preserve
both assessments separately. This is agreement about static recommendations, not a 100% completeness or
implementation-success score. No patch was produced or executed in this round.

All six retain the timer and ordered rules; none proposes further rule extraction. Removing the lookup reduces
cross-layer coupling, but this is the same simplification already observed in round6. The new instructions and
lighter output have not demonstrated the broader decomposition improvement sought by the owner. More semantic
units in a report do not demonstrate that its proposed code is easier to read or change.

The judges agree on ratings but differ in emphasis:

- Carbon distinguishes one full report's reliance on a neighboring contract from the installed dependency pin.
  The coordinator confirmed that its cited evidence uses the neighboring source without identifying that
  version boundary. Both contracts agree on the fact used; the recommendation remains supported.
- GLM separates redundancy and error bypass in its claim list; Carbon records one combined claim. Aggregation
  counts one root finding, preserving the original granular assessments privately.
- GLM calls a library trace “verified behaviorally” in one limitation, but explicitly says it ran no code.
  Its visible commands contain reads only. The public result therefore says **static trace**, never runtime proof.
- Both retain unresolved product/backend questions. A mapping visible in UI code is distinct from an absent
  backend policy. Neither missing policy nor a possible intentional fallback establishes a new confirmed bug.

The [frozen criteria](judging-criteria.md) and [answer schema](judging-schema.json) were identical for both judges.
GLM needed one same-session output-format correction; Carbon needed none. Initial permission rejections
happened before either external model ran; the owner approved the exact packet, and the same sessions were
launched. No judge was replaced, rerun for a preferred result, or shown the other's answer.

## Decision and next steps

Keep the full working method and its structural report view. This round does not support the hypothesis that
mandatory line allocation suppresses useful analysis. It also does not prove that line allocation causes
better analysis: semantic outcomes tied, costs were mixed, the sample is small, and navigation was not evaluated.
Do not add a production “light” switch on this evidence.

For the next owner-approved experiment, use the already prepared peer-consistency case to test a genuinely new
failure mode. If decomposition remains the main question, first admit a case with an independently explained
change/reading burden and a cohesive counterexample; assess the supported responsibility boundary and behavior
preservation, not extraction counts. Do not keep rerunning this saturated snapshot expecting an unmotivated split.
These are proposals, not newly launched work.

Completed: six reviews, two independent judges, static artifact/integrity checks. No application tests, live UI,
images, implementations, production-skill changes or release were performed.
