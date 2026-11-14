# Four historical review-skill variants

These are snapshots from the four named arms of the 2026-11-14 review-structure
work. Each `<arm>/plugins/entrust/plugin/skills/review/` contains the 14 files
from that arm's `review` directory, copied byte for byte. They are historical
instructions, not the installed skill or a recommendation to run a new review.

- `control` is the supplied control snapshot.
- `alpha` adds guidance and an example distinguishing a required rule from an
  unestablished automatic trigger.
- `beta` adds a preliminary solution sketch before the complete changed-line map.
- `gamma` separates semantic analysis from final line mapping and introduces a
  focused mapping mode.

The gamma tree also contains its contemporaneous `review-report.test.mjs`,
the harness and its import dependencies, `review/prepare.mjs`, and the
synthetic `currency-contract` fixture's `brief.md`, `base/`, and `clean/`.
The fixture's `node_modules` are small synthetic packages, not installed
downloads; the `example.invalid` registry URLs in its lockfiles are placeholders.
Preserve those directories when packaging the test. No real-case materials or
review runs are included here.

## Deterministic gamma test

From this directory, with Node.js and Git available:

```sh
node gamma/plugins/entrust/evals/review-report.test.mjs
```

This test creates temporary synthetic Git repositories and invokes the gamma
report scripts; it does not call a model. It passed all 25 cases with Node
v24.15.0 and Git 2.50.1 in the preparation environment. This verifies the test
in that environment, not reproduction of the historical research outcomes.

## Known limits

- The review skills link to `../orchestrate/SKILL.md` and
  `../orchestrate/references/roles.md`, which are not included. The few gamma
  orchestrate scripts included here are test-harness imports, not the full skill.
- Only the gamma report test and its exercised synthetic fixture are packaged.
  The fixture's `head` variant, acceptance checks and rubric, other cases,
  other eval suites, and the harness's fake app server are absent. In particular,
  `prepare.mjs` offers `head`, but that variant cannot be prepared from this
  package.
- The snapshots and test do not include the original experimental environment,
  model settings, private inputs or run outputs. Historical results and complete
  review workflows have not been reproduced or verified by this package.
