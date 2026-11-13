# Review baseline: draft 23

## Motivation

The goal is a review that helps an author reach a necessary, understandable solution: reuse the information and utilities already present, remove machinery whose premise is false, and improve ownership and readability where the code demonstrates a cost. Finding many rubric items is not enough if the recommended solution remains unnecessarily complicated. Decomposition is useful when it makes reasoning or a concrete change independent; extracting a prescribed number of helpers is not the goal.

This release freezes a usable baseline rather than claiming that the architecture problem is solved. The owner requested release after the completed round, without more experiments or live checks. Further improvements will be compared against this version.

## Material

- [Rounds and results](rounds.md): the paired snapshot comparison and the report-to-Astra probe.
- [Aggregate data](results.json): observed counts, with unmeasured formats marked separately.
- [Carbon agreement](agreement.md): four corrections and explicit final approval, with verification limits.
- [Design decisions](decisions.md): what entered draft 23, what did not, and why.
- [Round-5 control draft 20](../2026-11-11-review-skill/drafts/20-together.md), [frozen draft 21](drafts/21-connected-map.md), [draft 22](drafts/22-canonical-report.md), [submitted draft 23](drafts/23-submitted.md), [its data contract](drafts/23-submitted-data.md), [agreed candidate](drafts/23-agreed.md), [agreed data contract](drafts/23-agreed-data.md), and the [release instructions](drafts/23-release.md) with their [data contract](drafts/23-release-data.md). These copies preserve text; their installed-relative links resolve in the original skill layout. The released entrypoint is [review/SKILL.md](../../plugin/skills/review/SKILL.md).
- [Offline verification](validation.md): what ran and what was deliberately skipped.
- [Release manifest](baseline.json): hashes of released instructions, report tooling and evaluation inputs.
- [Public evaluation instrument](../../evals/review/README.md): fictional repositories, briefs, acceptance checks, design probes and clean controls for future comparisons.
- [Earlier drafts and research](../2026-11-11-review-skill/README.md): preserved as historical evidence, not silently upgraded to the new protocol.

## Privacy and reproducibility

The real snapshots, internal task, source code, raw reviewer/judge returns, local paths, screenshots and interactive reports remain private. This directory contains newly written, anonymized aggregate observations and general instructions. It cannot independently reproduce the private round. Public synthetic cases are available for reproducible future measurements; they are not the private task with identifiers replaced. No secrets or source from the private project are intentionally published.

## What remains unproven

Draft 23 has not been run as a new reviewer cohort. Its mechanism inventory, cost framing and semantic read-back are design changes motivated by observed failures, not measured improvements. The structural validator can check links and line coverage; it cannot establish the truth of a finding or the coherence of natural-language descriptions. Human-readable English and Russian controls are built in; translation of review prose remains the reviewer's job.

The architecture objective still needs an outcome measure: can a fresh author acting on the review simplify a flawed solution while preserving required behavior and leaving coherent code alone? Future comparisons need task-only controls, independently judged change-locality probes, complete pinned source packets, and evidence separating unjustified removal from legitimate cost/benefit decisions. No such additional round was run for this release.
