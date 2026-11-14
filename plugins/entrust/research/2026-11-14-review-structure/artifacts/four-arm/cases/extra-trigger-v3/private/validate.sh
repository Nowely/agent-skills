#!/bin/sh
set -eu

ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
cd "$ROOT"

run() {
  printf '\n$'
  printf ' %s' "$@"
  printf '\n'
  "$@"
}

printf '# Validation log\n'
run node --version
run node --test base/test/*.test.js
run node --test head/test/*.test.js
run node --test reviewer-repo/test/*.test.js

printf '\n$ CASE_IMPL=head/src/intake.js node --test private/acceptance.test.mjs\n'
CASE_IMPL=head/src/intake.js node --test private/acceptance.test.mjs
printf '\n$ CASE_IMPL=private/alternative/src/intake.js node --test private/acceptance.test.mjs\n'
CASE_IMPL=private/alternative/src/intake.js node --test private/acceptance.test.mjs
run node --test private/coordination.test.mjs
run node private/compare.mjs
run node private/check-mutations.mjs

printf '\n$ CASE_IMPL=base/src/intake.js node --test private/acceptance.test.mjs (negative control)\n'
if CASE_IMPL=base/src/intake.js node --test private/acceptance.test.mjs >private/.base-acceptance.log 2>&1; then
  echo 'ERROR: base unexpectedly passed acceptance'
  exit 1
else
  grep -E '^ℹ (tests|pass|fail) ' private/.base-acceptance.log
  echo 'expected: base failed independent acceptance'
fi
rm -f private/.base-acceptance.log

printf '\n$ reviewer repository checks\n'
test "$(git -C reviewer-repo rev-list --count HEAD)" = 2
test -z "$(git -C reviewer-repo status --porcelain)"
test ! -e reviewer-repo/brief.md
test ! -e reviewer-repo/private/RUBRIC.md
diff -ru -x .git head reviewer-repo
rm -rf private/.base-repo-check
mkdir -p private/.base-repo-check
git -C reviewer-repo archive HEAD~1 | tar -x -C private/.base-repo-check
diff -ru base private/.base-repo-check
rm -rf private/.base-repo-check
echo 'PASS: exactly 2 commits; clean worktree; snapshots match commits; brief/rubric absent'
run git -C reviewer-repo log --reverse --format='%h %s'
printf 'base_commit=%s\n' "$(git -C reviewer-repo rev-parse HEAD~1)"
printf 'head_commit=%s\n' "$(git -C reviewer-repo rev-parse HEAD)"
printf 'base_tree=%s\n' "$(git -C reviewer-repo rev-parse HEAD~1^{tree})"
printf 'head_tree=%s\n' "$(git -C reviewer-repo rev-parse HEAD^{tree})"
printf '\nALL VALIDATION CHECKS PASSED\n'
