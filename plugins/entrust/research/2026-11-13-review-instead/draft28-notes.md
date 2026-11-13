# Draft 28: peer consistency and bounded visual evidence

## Motivation

A correct local improvement can leave a related group inconsistent. The important question is whether the
changed and unchanged members still satisfy the same behavioral contract under a reachable state transition,
not whether every declaration uses the same syntax. The new case exercises this gap without the lookup/timer
mechanisms that dominated the earlier private snapshot.

Visual work has a different cost boundary. A visible change does not itself justify capturing more screenshots,
starting an application or comparing every supplied image. Begin with the concrete visual question and reuse
relevant evidence already collected during the task. Leave an important missing comparison unchecked; do not
create visual work merely to populate the report.

## Prepared artifacts

- [Draft 28 entrypoint](drafts/28-peer-consistency.md), based on the frozen draft 27: one behavior-pass rule
  covers unchanged peers sharing an invariant; the visual rule points to bounded evidence guidance.
- [Draft 28 data contract](drafts/28-report-data.md): `screens` is optional even for visible changes when no
  requested/material visual question needs it. Reuse task images, verify their revision/state/viewport, and
  inspect only relevant states. Distinguish a requirement, an unexplained difference and an unspecified state.
  New capture must fit existing authorization; ask only for a real scope expansion, not repeated permission.
- [locale-options](../../evals/review/cases/locale-options/brief.md): a newly written fictional fixture with
  base/head/reference trees, independent acceptance checks and a reviewer rubric.

No new JSON field, renderer/checker code or invocation mode is added. Assemble the complete package from
`9ee0189c`, put the draft-28 entrypoint at `skills/review/SKILL.md`, the new contract at
`skills/review/references/report-data.md`, and the unchanged draft-27 structural examples at
`skills/review/references/structure-examples.md`. Other report scripts/references remain from draft25.
The shipping entrypoint and installed plugin are unchanged; drafts 26/27 and old results stay frozen.

## Synthetic case and rubric

Four existing labels are evaluated when the module loads; two added labels use read-time getters. After a
locale change, a fresh read mixes languages. The old eager-evaluation flaw predates the change, while the
partial repair introduces the mixed-group symptom. The task's public read contract applies to all six options.
A saved historical selection deliberately retains the text at creation time: it is a different lifetime
contract, not another field to make reactive.

The rubric asks for the concrete lifecycle, complete behavior-preserving repair of the connected group and
the test gap that lets new labels pass while old ones stay stale. It does not require the reviewer to discuss
base pre-existence or mention an unaffected historical API to receive full credit. Two failing acceptance
checks expose one root cause; duplicate findings for each label/reader are not rewarded. Getter syntax is not
required: a second temporary implementation using direct translation calls also passes every acceptance check.

UI rendering/memoization is deliberately absent. The public functions return data; no image, browser or new
reactivity mechanism is needed. The rubric rejects undoing valid lazy reads merely for uniform syntax and
requires historical records to retain their stated semantics.

## Carbon consultation and corrections

Carbon read the synthetic code, acceptance checks, rubric and draft instructions and supported the approach,
subject to three corrections that were applied:

1. Test every option ID, cover individual reads and the historical-record contract, and make the reference's
   own tests cover both languages through both readers. Keep the buggy head's intended missing old-label
   coverage so the case still demonstrates the defect rather than unrelated missing tests.
2. Remove stale image wording that restricted omission only to invisible changes or assumed every picture
   was directly supplied. Restore explicit distinction between supported requirements, unspecified states and
   visual differences.
3. Grade the behavioral diagnosis/remedy, not whether the reviewer recites historical provenance or names an
   unaffected saved-selection function. Preserve bounded scope as behavior, not a required phrase.

The suggested reverse-language check for individual reads was also included. A short, equivalent visual-rule
pointer keeps the entrypoint within the repository's compaction limit; its details remain in the already
required data contract. Carbon's advice is not a blind review experiment or a claim of improved detection.

## Validation and limits

- Full review-instrument checks: 14 passed, including the new fixture's expected head failures, passing
  reference and isolation of the review packet from the rubric/reference.
- Independent acceptance: head fails exactly the two declared current-locale checks; reference passes 4/4.
  A behavior-equivalent implementation without getters also passes 4/4.
- Fixture's own suites: base 3/3, head 4/4, reference 5/5. The head suite passes despite the intended bug.
- Candidate documentation, assembled in a temporary installed layout: 8/8 repository checks passed. The
  existing generic skill-creator frontmatter allowlist incompatibility is unchanged; explicit-only invocation
  was preserved. No private application, browser or screenshot capture ran.

The private motivating snapshots and identifiers remain local; no proprietary source was copied into the
fixture. This case and the instruction were designed together, so this is formative/regression material,
not a held-out transfer test. No model cohort has run, and the case is not admitted as a discriminating benchmark.
Its reference tree is required by the deterministic instrument, not authorization for clean-target model runs.
The existing draft27 pilot/control plan is unchanged; draft28 and this case need their own explicitly selected
packages/cells before any future launch.
