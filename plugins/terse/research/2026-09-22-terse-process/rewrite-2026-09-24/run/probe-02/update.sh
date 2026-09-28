#!/bin/sh
# Round 02: the plugin as this checkout ships it, installed; and the Quick start's update fence made to
# happen with a newer version to fetch, and what it prints. One Claude configuration isolated under this
# probe directory, never signed in: the gate stops before anything else unless the configuration reports
# "loggedIn": false, so nothing reaches a model. `env -i` keeps this session's variables out. The
# marketplace is a copy of this checkout's .claude-plugin/ and plugins/ taken here, so a newer version can
# be published into it: terse is installed from the copy at the checkout's version, Claude Code lists what
# it installed, the copy's plugin.json is bumped by one patch, and the README's two update commands run,
# byte for byte. The checkout is only read; its status for the copied paths is printed at the end.
set -u
P=${TMPDIR:-/tmp}/terse/runs/20260924-002235-terse-readme-rewrite2/probe-02
REPO=$(git -C "$(dirname "$0")" rev-parse --show-toplevel)
CL=$HOME/.nvm/versions/node/v24.11.0/lib/node_modules/@anthropic-ai/claude-code/bin/claude.exe
NP=/usr/bin:/bin:/usr/sbin:/sbin
for d in "$P/config-upd" "$P/home-upd" "$P/work-upd" "$P/mkt-upd"; do case "$d" in "$P"/*) rm -rf "$d"; mkdir -p "$d";; *) echo "refused"; exit 9;; esac; done
iso() { (cd "$P/work-upd" && env -i HOME="$P/home-upd" PATH="$NP" CLAUDE_CONFIG_DIR="$P/config-upd" "$CL" "$@" < /dev/null); }
echo "claude: $(iso --version 2>&1)"
if iso auth status 2>&1 | grep -q '"loggedIn": false'; then echo "auth status: not logged in"; else echo "auth status: logged in or unknown, stopping"; exit 8; fi
cp -R "$REPO/.claude-plugin" "$P/mkt-upd/" && mkdir -p "$P/mkt-upd/plugins" && cp -R "$REPO/plugins/terse" "$REPO/plugins/entrust" "$P/mkt-upd/plugins/"
diff -rq "$REPO/plugins/terse" "$P/mkt-upd/plugins/terse" >/dev/null 2>&1 && echo "the copy's plugins/terse against the checkout's: identical"
PJ="$P/mkt-upd/plugins/terse/.claude-plugin/plugin.json"
v0=$(grep -o '"version": "[^"]*"' "$PJ" | sed 's/.*: "//; s/"$//')
iso plugin marketplace add "$P/mkt-upd" >/dev/null 2>&1; echo "marketplace add <copy> -> exit $?"
iso plugin install terse@nowely >/dev/null 2>&1; echo "plugin install terse@nowely -> exit $?; installed $v0"
out=$(iso plugin details terse@nowely 2>&1); rc=$?; printf '%s\n' "$out" | grep -E '^terse |Skills \('; echo "plugin details terse@nowely -> exit $rc"
v1=$(printf '%s' "$v0" | awk -F. '{printf "%d.%d.%d", $1, $2, $3 + 1}')
sed "s/\"version\": \"$v0\"/\"version\": \"$v1\"/" "$PJ" > "$PJ.new" && mv "$PJ.new" "$PJ"; echo "the copy's plugin.json now: $(grep -o '"version": "[^"]*"' "$PJ")"
out=$(iso plugin marketplace update nowely 2>&1); rc=$?; echo '$ claude plugin marketplace update nowely'; printf '%s\n' "$out" | tr '\r' '\n'; echo "exit $rc"
out=$(iso plugin update terse@nowely 2>&1); rc=$?; echo '$ claude plugin update terse@nowely'; printf '%s\n' "$out" | tr '\r' '\n'; echo "exit $rc"
echo "installed versions now: $(ls "$P/config-upd/plugins/cache/nowely/terse" | tr '\n' ' ')"
echo "help: $(iso plugin update --help 2>&1 | grep -o 'Update a plugin to the latest version ([^)]*)')"
echo "checkout status for plugins/ and .claude-plugin/: [$(git -C "$REPO" status --porcelain -- plugins .claude-plugin | tr '\n' ' ')]"
rm -rf "$P/config-upd" "$P/home-upd" "$P/work-upd" "$P/mkt-upd"
