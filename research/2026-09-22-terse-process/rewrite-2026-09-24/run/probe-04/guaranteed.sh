#!/bin/sh
# Round 04, the Guaranteed line's two run-backed halves, summarised so the ledger's 2000-character `saw`
# keeps all of it: probe-02/rundir-rewrite.sh over the three pages (each page's run line rendered as Claude
# Code hands it to the model, in three isolated signed-out loads, then run by the shell) and
# probe-03/guard.sh (five planted rounds judged by the shipped check). Both are run here, not read from a
# log; their full output is in probe-02/rundir-rewrite.log and probe-03's round-03 record. Reads the checkout only.
set -u
R=/var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T//terse/runs/20260924-002235-terse-readme-rewrite2
out=$(sh "$R/probe-02/rundir-rewrite.sh" rewrite audit rethink 2>&1); rc=$?
echo "rundir-rewrite.sh (rewrite audit rethink): exit $rc"
echo "  renders stopped at login, cost 0: $(printf '%s\n' "$out" | grep -c 'exit 1, Not logged in, cost 0') of 9"
echo "  run folders made outside the working directory: $(printf '%s\n' "$out" | grep -c 'made, outside <work>') of 9"
printf '%s\n' "$out" | grep -o '<data> = [^,]*, exists' | sed 's/^/  /'
echo "  the page read as a plain file, D left as written, TMPDIR set: $(printf '%s\n' "$out" | grep -c 'as written; run → <probe>/tmp-skills/terse/runs/') of 3 → \$TMPDIR/terse/runs/…"
echo "  the same, TMPDIR unset: $(printf '%s\n' "$out" | grep -c 'TMPDIR unset → /tmp/terse/runs/') of 3 → /tmp/terse/runs/…"
printf '%s\n' "$out" | grep -E '^<work> = |^checkout status' | sed 's/^/  /'
g=$(sh "$R/probe-03/guard.sh" 2>&1); rc=$?
echo "guard.sh: exit $rc"
printf '%s\n' "$g" | sed 's/^/  /'
