#!/bin/sh
# Round 04, R04h: the scripted checks the Checks table names, made to run. The shipped self-test runs every
# check against a violation planted on purpose; the lines kept here are the ones for the five checks the row
# names, the count of passing checks and the self-test's last line. Then each script's own header, and the
# lines of measurements.md the row links to. The self-test writes only under $TMPDIR. Reads the checkout.
set -u
R=${TMPDIR:-/tmp}/terse/runs/20260924-002235-terse-readme-rewrite2
S=$(git -C "$(dirname "$0")" rev-parse --show-toplevel)/plugins/terse/skills/rewrite/scripts
N=$HOME/.nvm/versions/node/v24.11.0/bin/node
Q() { "$N" "$R/probe-02/quote.mjs" "$@"; }
out=$("$N" "$S/selftest.mjs" 2>/dev/null); rc=$?
echo "selftest.mjs: exit $rc; checks passed: $(printf '%s\n' "$out" | grep -c '^ok ')"
printf '%s\n' "$out" | grep -E '^ok +(rule1 reports the planted flag|rule1 exits 1 on a violation|dup flags three sections|sections reports a section over its budget and still exits 0|a check whose expect does not match writes nothing|ledger reports a lost claim in the last file|ledger reports an unwanted phrase)$' | sed 's/^ok  */ok: /'
printf '%s\n' "$out" | tail -1
Q "$S/rule1.mjs" 3-4 "no flag name, header field, exit code, protocol name, environment variable" "or absolute path before the technical section"
Q "$S/dup.mjs" 2-2 "One idea, one home. Counts in how many \`## \` sections each concept appears."
Q "$S/sections.mjs" 2-4 "Word count per \`## \` section, against a budget" "A report, not a gate"
Q "$S/round.mjs" 22-23 "One \`expect\` that does not match" "refuses the whole round: no TO, no ledger write."
Q "$S/ledger.mjs" 6-7 "want true : a verified claim that must be present (LOST when absent)" "want false : a phrasing found false, which must be absent (YES when present)"
M=$(git -C "$(dirname "$0")" rev-parse --show-toplevel)/plugins/terse/skills/rewrite/references/measurements.md
Q "$M" 3-4 "Every rule in \`SKILL.md\` and [loop.md](loop.md) rests on something that happened, dated."
Q "$M" 79-79 "**M15. One idea, one home, counted.**"
Q "$M" 116-116 "**M22. Budgets are a report.**"
[ -f "$M" ] && echo "link skills/rewrite/references/measurements.md: resolves"
