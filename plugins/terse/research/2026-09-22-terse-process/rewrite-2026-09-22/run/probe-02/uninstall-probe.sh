#!/bin/sh
# Round 02, graft 3: what `claude plugin uninstall` does to terse's data directory, with and without
# --keep-data, in a Claude configuration isolated under this probe directory (CLAUDE_CONFIG_DIR).
# A decoy directory beside terse's shows the deletion is terse's own and not the whole data root.
set -u
P=${TMPDIR:-/tmp}/terse/runs/20260922-233021-terse-readme/probe-02
C="$P/config-uninstall"
case "$C" in "$P"/config-*) ;; *) echo "refused: config outside the probe dir"; exit 9;; esac
rm -rf "$C"; mkdir -p "$C"
export CLAUDE_CONFIG_DIR="$C"
D="$C/plugins/data/terse-nowely"; X="$C/plugins/data/decoy-other"; M="$D/runs/probe-run/marker.txt"
run() { out=$(claude "$@" 2>&1); rc=$?; echo "\$ claude $* -> exit $rc: $(printf '%s' "$out" | tr '\n' ' ')"; }
state() { echo "state $1: plugins/data/terse-nowely $( [ -d "$D" ] && echo present || echo absent ), its run marker $( [ -f "$M" ] && echo present || echo absent ), decoy $( [ -f "$X/marker.txt" ] && echo present || echo absent )"; }
echo "CLAUDE_CONFIG_DIR=probe-02/config-uninstall"
run --version
run plugin marketplace add "$(git -C "$(dirname "$0")" rev-parse --show-toplevel)"
run plugin install terse@nowely
state "after install"
mkdir -p "$D/runs/probe-run" "$X" && echo planted > "$M" && echo planted > "$X/marker.txt"
state "planted"
run plugin uninstall terse@nowely
state "after uninstall without --keep-data"
run plugin install terse@nowely
mkdir -p "$D/runs/probe-run" && echo planted > "$M"
state "reinstalled, planted again"
run plugin uninstall terse@nowely --keep-data
state "after uninstall with --keep-data"
