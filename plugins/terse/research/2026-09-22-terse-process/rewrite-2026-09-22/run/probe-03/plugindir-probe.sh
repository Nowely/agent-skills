#!/bin/sh
# D5: a checkout loaded with --plugin-dir. Where the audit page's run line points, whether that data
# directory is created, and whether `claude plugin uninstall` can remove it. One Claude configuration
# isolated under this probe directory, no sign-in (gate below), `env -i`.
set -u
P=${TMPDIR:-/tmp}/terse/runs/20260922-233021-terse-readme/probe-03
REPO=$(git -C "$(dirname "$0")" rev-parse --show-toplevel)
CL=$HOME/.nvm/versions/node/v24.11.0/lib/node_modules/@anthropic-ai/claude-code/bin/claude.exe
C=pdir
for d in "$P/config-$C" "$P/home-$C" "$P/tmp-$C" "$P/work-$C"; do case "$d" in "$P"/*) rm -rf "$d"; mkdir -p "$d";; *) echo refused; exit 9;; esac; done
iso() { (cd "$P/work-$C" && env -i HOME="$P/home-$C" PATH=/usr/bin:/bin:/usr/sbin:/sbin TMPDIR="$P/tmp-$C/" CLAUDE_CONFIG_DIR="$P/config-$C" "$@" < /dev/null); }
if iso "$CL" auth status 2>&1 | grep -q '"loggedIn": false'; then echo "not logged in"; else echo "logged in or unknown, stopping"; exit 8; fi
out=$(iso "$CL" -p "/terse:audit" --plugin-dir "$REPO/plugins/terse" --output-format stream-json --verbose 2>&1); rc=$?
echo "--plugin-dir /terse:audit: exit $rc, $(printf '%s' "$out" | grep -o 'Not logged in[^"]*' | head -1); $(printf '%s' "$out" | grep -o '"source":"terse@[a-z]*"' | head -1)"
l=$(cat "$P/config-$C"/projects/*/*.jsonl 2>/dev/null | grep -o 'D=\\"[^;]*;' | head -1 | sed -e 's/\\"/"/g' -e "s#${TMPDIR%/}/*terse/runs/20260922-233021-terse-readme/probe-03#<probe>#g")
echo "the page's line as received begins $l"
echo "data directory terse-inline: $( [ -d "$P/config-$C/plugins/data/terse-inline" ] && echo exists || echo absent); temporary directory runs: $( [ -d "$P/tmp-$C/terse" ] && echo present || echo absent)"
mkdir -p "$P/config-$C/plugins/data/terse-inline/runs/stub" && echo stub > "$P/config-$C/plugins/data/terse-inline/runs/stub/marker.txt"
out=$(iso "$CL" plugin uninstall terse@inline 2>&1); rc=$?; echo "\$ claude plugin uninstall terse@inline -> exit $rc: $(printf '%s' "$out" | tr '\n' ' ')"
echo "stub run after that uninstall: $( [ -f "$P/config-$C/plugins/data/terse-inline/runs/stub/marker.txt" ] && echo present || echo absent)"
