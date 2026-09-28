#!/bin/sh
# Round 02 (sent back), R02d: this run's own record — the directory rewrite's recipe made for it and what
# the directory holds: the first round, a whole document, and its diff from the original. Reads only.
set -u
R=${TMPDIR:-/tmp}/terse/runs/20260924-002235-terse-readme-rewrite2
d=$(printf '%s' "$R" | sed -e 's#//*#/#g' -e "s#^${TMPDIR%/}/#\$TMPDIR/#")
echo "this run's directory: $d, the form of the fallback \${TMPDIR:-/tmp}/terse/runs/<stamp>-<slug>"
echo "its 01-candidate.md, headings: $(grep '^#' "$R/01-candidate.md" | tr '\n' '|' | sed 's/|$//; s/|/ | /g')"
echo "its diff-01.patch: $(sed -n '1p' "$R/diff-01.patch" | cut -f1 | sed 's#^--- .*/#--- #') → $(sed -n '2p' "$R/diff-01.patch" | cut -f1 | sed 's#^+++ .*/#+++ #'), both in that directory: $(sed -n '1,2p' "$R/diff-01.patch" | cut -f1 | grep -c -F "$R/")"
