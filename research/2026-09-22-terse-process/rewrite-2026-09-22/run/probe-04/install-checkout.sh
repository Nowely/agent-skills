#!/bin/sh
# Round 04, the SCOPE line of Install: a reader who wants the commit this README describes runs
# `claude plugin marketplace add` with the path of a local clone checked out at it in place of
# `Nowely/agent-skills`, then `claude plugin install terse@nowely`. Two Claude configurations isolated
# under this probe directory, never signed in: the gate stops before anything else unless the
# configuration reports "loggedIn": false, so nothing reaches a model. `env -i` keeps this session's
# variables out. Case A installs from the checkout the rounds ran on, by its absolute path; its
# plugins/terse tree is byte-identical to 2f29a8f's. Case B installs from a clone of that checkout made
# here and checked out at 2f29a8f, by a relative path. Each installed tree is compared with diff -rq
# against its source's plugins/terse and against `git archive 2f29a8f`. Nothing is written outside this
# directory; the checkout is only read.
set -u
P=/var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T//terse/runs/20260922-233021-terse-readme/probe-04
REPO=/Users/ruliny/Git/agent-skills
C=2f29a8f
CL=/Users/ruliny/.nvm/versions/node/v24.11.0/lib/node_modules/@anthropic-ai/claude-code/bin/claude.exe
NP=/usr/bin:/bin:/usr/sbin:/sbin
for d in "$P/config-A" "$P/home-A" "$P/work-A" "$P/config-B" "$P/home-B" "$P/work-B" "$P/clone-$C" "$P/archive-$C"; do
  case "$d" in "$P"/*) rm -rf "$d"; mkdir -p "$d";; *) echo "refused: $d"; exit 9;; esac
done
iso() { c="$1"; shift; (cd "$P/work-$c" && env -i HOME="$P/home-$c" PATH="$NP" CLAUDE_CONFIG_DIR="$P/config-$c" "$CL" "$@" < /dev/null); }
echo "claude: $(iso A --version 2>&1)"
for c in A B; do
  if iso $c auth status 2>&1 | grep -q '"loggedIn": false'; then echo "$c auth status: not logged in"; else echo "$c auth status: logged in or unknown, stopping"; exit 8; fi
done
# The source trees against the commit.
echo "checkout HEAD: $(git -C "$REPO" rev-parse --short HEAD); plugins/terse, HEAD against $C: $(git -C "$REPO" diff --stat "$C" HEAD -- plugins/terse | wc -l | tr -d ' ') lines of diff --stat"
git -C "$REPO" diff --quiet "$C" -- plugins/terse .claude-plugin; echo "working tree against $C, plugins/terse and .claude-plugin: diff exit $?"
echo "untracked or ignored files under plugins/terse: $(git -C "$REPO" ls-files --others -- plugins/terse | wc -l | tr -d ' ')"
git clone -q --no-hardlinks --no-checkout "$REPO" "$P/clone-$C" && git -C "$P/clone-$C" checkout -q "$C" && echo "clone B: HEAD $(git -C "$P/clone-$C" rev-parse --short HEAD)"
git -C "$REPO" archive "$C" plugins/terse | tar -x -C "$P/archive-$C" && echo "archive of $C: $(find "$P/archive-$C/plugins/terse" -type f | wc -l | tr -d ' ') files"
# The two installs.
inst() { c="$1"; src="$2"; shown="$3"
  iso $c plugin marketplace add "$src" >/dev/null 2>&1; echo "$c \$ claude plugin marketplace add $shown -> exit $?"
  iso $c plugin install terse@nowely >/dev/null 2>&1; echo "$c \$ claude plugin install terse@nowely -> exit $?"
  ip=$(grep -o '"installPath": "[^"]*"' "$P/config-$c/plugins/installed_plugins.json" | sed 's/^"installPath": "//; s/"$//')
  echo "$c installed at: $(printf '%s' "$ip" | sed "s#^.*/config-$c/#<config-$c>/#"); recorded commit: $(grep -o '"gitCommitSha": "[0-9a-f]\{7\}' "$P/config-$c/plugins/installed_plugins.json" | sed 's/.*"//')"
  echo "$c installed files: $(find "$ip" -type f | wc -l | tr -d ' ')"
  out=$(diff -rq "$ip" "$4/plugins/terse" 2>&1); rc=$?; printf '%s' "$out" | sed 's/^/  /'; [ $rc -eq 0 ] && echo "$c installed tree against its source's plugins/terse: identical (diff -rq exit 0)" || echo "$c installed tree against its source's plugins/terse: differs (diff -rq exit $rc)"
  out=$(diff -rq "$ip" "$P/archive-$C/plugins/terse" 2>&1); rc=$?; printf '%s' "$out" | sed 's/^/  /'; [ $rc -eq 0 ] && echo "$c installed tree against git archive $C: identical (diff -rq exit 0)" || echo "$c installed tree against git archive $C: differs (diff -rq exit $rc)"
}
inst A "$REPO" "<checkout, absolute path>" "$REPO"
inst B "../clone-$C" "../clone-$C (relative to the working directory)" "$P/clone-$C"
