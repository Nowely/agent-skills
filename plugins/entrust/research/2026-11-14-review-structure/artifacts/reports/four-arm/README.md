# Four-arm synthetic review outputs

This directory contains **32 synthetic review pairs** (Markdown and JSON): four synthetic cases × four arms × two repeats, plus seven assessment/crosscheck documents and one language-level coordinator probe. The real case and its reports are excluded. No LLMs or fixture code were run for this export.

[Mapping and hashes](mapping.json) identifies each case, arm, repeat and blind judge label. Each `review-NN` is the label used in the judging packet, not a session ID. The mapping joins the synthetic case's run map to its judge-label mapping; all 64 selected original outputs matched their judge-packet counterparts byte-for-byte and matched the source judge mapping's recorded output hashes. Paths beginning `judging/` in source fields are **source-relative labels**, not machine paths. Original per-run IDs and machine roots are intentionally omitted. Source/output SHA-256s are provided for unchanged, individually screened synthetic files; for the one file containing a machine-specific path only the published hash is recorded.

## Contents

- `cohesive/`, `structural/`, `required-trigger/`, `extra-trigger/`: eight labelled pairs per case. Their IDs match the corresponding assessment's `review-NN` labels.
- `judging/*-assessment.md`: the four main assessments. `required-trigger-addendum.md` revises the original assessment's judgment about `has`; read them together. The two `*-contract-crosscheck.md` files are separate source-based contract analyses, not replacements silently folded into the main assessments. `ecmascript-probe.md` is a coordinator's language-level check, not a judge score.
- The `structural` assessment and coordinator probe challenge review-04's newline-regex claim. The `extra-trigger` contract crosscheck qualifies the conclusion that an observed temporal gap necessarily violates an ambiguous contract. These are historical assessments and can disagree; none was re-adjudicated in this export.

## Provenance and limits

- Each review JSON retains its original `range` exactly, including symbolic `HEAD~1..HEAD`. The mapping records the **synthetic** base/head and diff hash from the run map separately; these metadata are not a substitute for resolving the range. The [synthetic case package](../../four-arm/cases/) provides briefs, tests, rubrics and original two-commit Git bundles; the [arm packages](../../four-arm/arms/) provide the matching checkers. Full evaluation packets and the original model environment are not included.
- The only content transformation in the review pairs is in `cohesive/review-03/review.json`: an absolute local path containing a run ID was replaced with `case/brief.md`, preserving the original line suffix. All other pair files and all eight assessment/support files are byte-identical to their selected synthetic sources. Reported synthetic commit/blob IDs, diff hashes, typos and substantive claims are retained, not silently corrected. Relative source citations such as `src/...`, `test/...`, `case/brief.md` and `private/RUBRIC.md` are synthetic fixture labels, not machine paths, and those files are not included here.
- Every selected file was screened individually for absolute paths, session identifiers, common secret patterns, URLs, emails, internal markers and other suspicious identifiers; review Markdown and flagged content were inspected. JSON was parsed before and after transformation. These checks do not guarantee that every possible sensitive value has been detected. Historical claims about execution are the original authors' claims.

All **32 published synthetic JSON reports** passed their corresponding arm's `report.mjs check` against
repositories restored from the published bundles with Node v24.15.0; all 32 mapped base, head and diff
identities also matched those restored repositories. For each mapping row, use its
`case` to select the restored repository, `arm` to select the checker, and `files` to locate the JSON;
run `node <arm>/plugins/entrust/plugin/skills/review/scripts/report.mjs check <report.json>` with the
restored repository as the working directory. `structural` and `extra-trigger` correspond to
`structural-v2` and `extra-trigger-v3` in the case package. A passing check establishes structure and
applicable coverage constraints, not semantic correctness.
