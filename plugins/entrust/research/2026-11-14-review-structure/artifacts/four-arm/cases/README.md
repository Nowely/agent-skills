# Synthetic four-arm review cases

These four fictional, independently authored cases are the final-round
`extra-trigger-v3`, `required-trigger`, `structural-v2`, and `cohesive` inputs.
They are not the real internal task. Each directory contains the brief, the
original `base/` and `head/` snapshots, the author's assessment rubric, and
the available case-specific tests, controls, and validation scripts. The
`private/` label means **evaluator-only for a blind review**, not a claim that
these synthetic files are confidential; do not give it to a reviewer being
evaluated.

Each `history.bundle` preserves the actual two-commit synthetic history used
for the review, not a recreated history. Its sole advertised ref is
`refs/heads/main`; its first and second commit trees match `base/` and `head/`
byte for byte, respectively:

| Case | Base | Head |
| --- | --- | --- |
| extra-trigger-v3 | `8258a636c3d0054fbc3a1616255236d02bda30bd` | `79264c50cebd4767b5ddd05997c582381853becf` |
| required-trigger | `b37f5cadb2eed52449a72e9a0e1f906b7b87f7d0` | `77151c13ab761fc2465820c3d755e345af206c51` |
| structural-v2 | `e87e4d0a9f05c44c19923c00af768f0180887aa9` | `ceebf83a6f0b47dce2a82df0838176e3e55dedeb` |
| cohesive | `44aeeee4a6057b02eefa63bddfdfe637213e68c0` | `6b8eecdb8f9ad8ba4baeff4114a35c75a87aa16b` |

Authors and committers are synthetic: `Fixture Author
<fixture@example.invalid>`, except for `structural-v2`, which uses `Lab Systems
<labsystems@example.invalid>`. Inspection of each restored object database found
only objects reachable from its two commits. The snapshots contain the same
tracked files as the respective trees. No raw internal-task materials, reviewer
outputs, working `.git` directories, dependencies, or generated logs are
included.

## Restore and check

Requirements: Git, Node.js 20 or newer, Python 3, and standard shell tools.
No packages, network access, or LLM calls are needed. The checks below were
verified with Node v24.15.0; compatibility of their output parsing with every
Node 20+ test reporter has not been verified. Run from this directory;
the following first creates a **disposable copy**, because the original
validation scripts write reports and temporary files. The script paths and
repository names inside the copy are intentionally the original names.

```sh
work=$(mktemp -d)
shasum -a 256 -c SHA256SUMS
cp -R extra-trigger-v3 required-trigger structural-v2 cohesive "$work/"

for case in extra-trigger-v3 required-trigger structural-v2 cohesive; do
  case "$case" in
    extra-trigger-v3) repo=reviewer-repo ;;
    structural-v2) repo=repo ;;
    *) repo=reviewer ;;
  esac
  git clone --branch main "$work/$case/history.bundle" "$work/$case/$repo"
  git -C "$work/$case/$repo" bundle verify "$work/$case/history.bundle"
  git -C "$work/$case/$repo" log --reverse --format='%H %s'
  git -C "$work/$case/$repo" diff HEAD~1 HEAD
done

(cd "$work/extra-trigger-v3" && sh private/validate.sh)
(cd "$work/required-trigger" && sh checks.sh)
(cd "$work/structural-v2" && node private/run-verification.mjs)
```

Use `HEAD~1..HEAD` in each restored repository for the original review range.
The explicit `--branch main` is necessary: these bundles advertise `main`, not
a separate `HEAD` ref. The review repository should contain neither the brief
nor the evaluator rubric. The `required-trigger` base includes tests for the
new behavior, so its base tests fail; `checks.sh` instead expects head to pass
and both negative mutations to fail.

The original `cohesive/private/build_fixture.py` also creates a new Git
repository and **new commits** after its tests. To run only its original
baseline, mutation and optional-removal checks, without making any commits,
use the following in the disposable copy:

```sh
(
  cd "$work/cohesive"
  python3 - <<'PY'
from pathlib import Path
p = Path("private/build_fixture.py").resolve()
source = p.read_text().split('\nrepo = ROOT / "reviewer"', 1)[0]
exec(compile(source, str(p), "exec"), {"__file__": str(p), "__name__": "__main__"})
PY
)
```

That section writes `logs/` and temporary mutant copies under the disposable
case. It does not recreate the historical Git commits; use the bundle for
those. The original full builder would create different commits and must not
be used to reconstruct the original range.

## Packaging and limits

- Original snapshots, briefs, rubrics, tests, and selected scripts were copied
  without content changes. `private/alternative/` and mutation fixtures are
  included where used by the checks. `history.bundle` is newly generated from
  the original synthetic `main` ref.
- Original generated diffs, reports, logs, and checksum manifests were omitted.
  They described a different file selection; their hashes must not be applied
  to this package. The `SHA256SUMS` here is newly computed for this package.
- The unmodified rubrics refer to original output names. In `extra-trigger-v3`,
  `reviewer-repo/` is restored from the bundle, `VALIDATION.md` is omitted, and
  the original `manifest.sha256` is replaced by the package manifest. Its
  rubric heading still says `extra-trigger-v2`; the source was the named
  `extra-trigger-v3` case. In `structural-v2`, the verification script
  regenerates `private/verification-report.json` in the disposable copy.
  In `cohesive`, the pre-commit checks regenerate the test/mutant logs, but
  not the full builder's `logs/verification.json` or original manifest.
- On Node v24.15.0, restored head tests passed for all four cases. The original
  checks detected 6/6 extra-trigger mutants, both required-trigger mutants,
  and 14/14 structural mutants in each of its two suites. The cohesive
  pre-commit checks detected 26/26 mutants and passed the optional-removal
  control. These finite controls do not establish exhaustive correctness or
  reproduce reviewer judgments.
- Inspect the source and generated output before reuse. Simple path and
  credential-pattern checks are not proof that arbitrary future changes are
  free of sensitive data.
