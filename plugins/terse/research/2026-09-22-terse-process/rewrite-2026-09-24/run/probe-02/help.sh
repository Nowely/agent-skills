#!/bin/sh
# Round 02: what the host prints for the update commands' help. One Claude configuration isolated under
# this probe directory, never signed in; the gate stops before anything else unless the configuration
# reports "loggedIn": false. `env -i` keeps this session's variables out. Nothing is installed.
set -u
P=${TMPDIR:-/tmp}/terse/runs/20260924-002235-terse-readme-rewrite2/probe-02
CL=$HOME/.nvm/versions/node/v24.11.0/lib/node_modules/@anthropic-ai/claude-code/bin/claude.exe
NP=/usr/bin:/bin:/usr/sbin:/sbin
for d in "$P/config-help" "$P/home-help" "$P/work-help"; do case "$d" in "$P"/*) rm -rf "$d"; mkdir -p "$d";; *) echo "refused"; exit 9;; esac; done
iso() { (cd "$P/work-help" && env -i HOME="$P/home-help" PATH="$NP" CLAUDE_CONFIG_DIR="$P/config-help" "$CL" "$@" < /dev/null); }
echo "claude: $(iso --version 2>&1)"
if iso auth status 2>&1 | grep -q '"loggedIn": false'; then echo "auth status: not logged in"; else echo "auth status: logged in or unknown, stopping"; exit 8; fi
echo '$ claude plugin update --help'; iso plugin update --help 2>&1; echo "exit $?"
echo '$ claude plugin marketplace update --help'; iso plugin marketplace update --help 2>&1; echo "exit $?"
rm -rf "$P/config-help" "$P/home-help" "$P/work-help"
