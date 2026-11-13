# Release-candidate verification

Local Node: 24.15.0. These are deterministic/offline checks, not new model-review experiments.

| Check | Result |
| --- | --- |
| `node scripts/skills.test.mjs` | 8 passed; all entrypoints fit the compaction limit and links resolve |
| `node plugins/entrust/evals/review-report.test.mjs` | 12 passed; check-only and delayed-render immutability, locale catalogs, mechanism references/counts/escaping, legacy reports and existing report behavior |
| `node plugins/entrust/evals/review-eval.test.mjs` | 11 passed; synthetic fixture/instrument invariants, no model call |
| `node plugins/entrust/evals/orchestrate.test.mjs` | 13 passed; installed links and orchestration contracts |
| `node plugins/entrust/evals/fragments.test.mjs` | 2 passed; shared-path consistency |
| `node plugins/entrust/evals/package.test.mjs` | 21 passed, 1 skipped because HEAD was not yet tagged; all version owners agree |

The final exact-head PR CI is a separate mandatory release gate; see PR #95 checks. An earlier macOS run failed while preparing a temporary synthetic Git repository. That suite passed locally; the cause was not established, and no speculative retry or product-code change was added. A repeated final CI failure must be investigated before publication.

No new reviewer cohort, implementation-outcome round, fresh-session/live orchestration, cross-plugin live probe, browser/application check or new protocol conformance measurement was run. The driver change is its release-version constant. These skips follow the owner's release scope and are not passes.

The baseline manifest hashes the released skill/tooling and public evaluation inputs. Its release instruction and data-contract copies match the installed payload byte for byte. Frozen older draft text is preserved, including its original metadata. The public additions were inspected for internal identifiers, personal paths and credential forms; private source, raw reports and HTML were excluded. This is an allowlisted publication, not a claim that keyword scanning alone proves anonymization.
