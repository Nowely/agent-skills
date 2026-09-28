#!/bin/sh
# Round 03, G3a: when terse's data directory, and a run planted in it, is deleted. Four cases, each in its
# own Claude configuration isolated under this probe directory (CLAUDE_CONFIG_DIR), installed from this
# checkout's marketplace. A decoy directory beside terse's shows a deletion is terse's own, not the whole
# data root. No model is invoked. `env -i` keeps this session's variables out.
set -u
P=${TMPDIR:-/tmp}/terse/runs/20260922-233021-terse-readme/probe-03
REPO=$(git -C "$(dirname "$0")" rev-parse --show-toplevel)
CL=$HOME/.nvm/versions/node/v24.11.0/lib/node_modules/@anthropic-ai/claude-code/bin/claude.exe
reset() { for d in "$P/config-life-$1" "$P/home-life-$1" "$P/work-life-$1"; do case "$d" in "$P"/*) rm -rf "$d"; mkdir -p "$d";; *) echo "refused: $d outside the probe dir"; exit 9;; esac; done; }
run() { c="$1"; shift; out=$(cd "$P/work-life-$c" && env -i HOME="$P/home-life-$c" PATH=/usr/bin:/bin:/usr/sbin:/sbin CLAUDE_CONFIG_DIR="$P/config-life-$c" "$CL" "$@" 2>&1); rc=$?
  echo "$c \$ claude $(printf '%s' "$*" | sed "s#$REPO#<checkout>#") -> exit $rc"; }
plant() { mkdir -p "$P/config-life-$1/plugins/data/terse-nowely/runs/probe-run" "$P/config-life-$1/plugins/data/decoy-other" && echo planted > "$P/config-life-$1/plugins/data/terse-nowely/runs/probe-run/marker.txt" && echo planted > "$P/config-life-$1/plugins/data/decoy-other/marker.txt"; }
state() { D="$P/config-life-$1/plugins/data"; echo "$1 state $2: terse-nowely $( [ -d "$D/terse-nowely" ] && echo present || echo absent ), run marker $( [ -f "$D/terse-nowely/runs/probe-run/marker.txt" ] && echo present || echo absent ), decoy $( [ -f "$D/decoy-other/marker.txt" ] && echo present || echo absent )"; }
# A. One installation, uninstalled without --keep-data.
reset A; run A plugin marketplace add "$REPO"; run A plugin install terse@nowely; plant A; state A planted
run A plugin uninstall terse@nowely; state A "after uninstall"
# B. One installation, uninstalled with --keep-data.
reset B; run B plugin marketplace add "$REPO"; run B plugin install terse@nowely; plant B; state B planted
run B plugin uninstall terse@nowely --keep-data; state B "after uninstall --keep-data"
# C. Two installations, user and project scope: the first uninstall is not the last installation.
reset C; run C plugin marketplace add "$REPO"; run C plugin install terse@nowely --scope user; run C plugin install terse@nowely --scope project; plant C; state C planted
run C plugin uninstall terse@nowely --scope user; state C "after uninstall of the user installation, the project one left"
run C plugin uninstall terse@nowely --scope project; state C "after uninstall of the last installation"
# D. One installation, its marketplace removed.
reset D; run D plugin marketplace add "$REPO"; run D plugin install terse@nowely; plant D; state D planted
run D plugin marketplace remove nowely; state D "after marketplace remove"
echo "D plugin list: $(cd "$P/work-life-D" && env -i HOME="$P/home-life-D" PATH=/usr/bin:/bin CLAUDE_CONFIG_DIR="$P/config-life-D" "$CL" plugin list 2>&1 | head -1)"
# The flags the two commands offer.
H() { env -i HOME="$P/home-life-D" PATH=/usr/bin:/bin CLAUDE_CONFIG_DIR="$P/config-life-D" "$CL" "$@" 2>&1; }
echo "uninstall option:$(H plugin uninstall --help | grep -- '--keep-data' | tr -s ' ')"
echo "marketplace remove options: $(H plugin marketplace remove --help | sed -n '/^Options:/,$p' | grep -o -- '--[a-z-]*' | tr '\n' ' ')"
