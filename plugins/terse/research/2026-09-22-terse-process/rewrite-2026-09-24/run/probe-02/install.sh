#!/bin/sh
# Round 02: the Quick start's install fence, its "You need" line and its update fence on the GitHub
# route, made to happen. One Claude configuration isolated under this probe directory, never signed in:
# the gate stops before anything else unless the configuration reports "loggedIn": false, so nothing
# reaches a model. `env -i` keeps this session's variables out; PATH carries no Node (claude is a native
# binary, called by its path). The install and update commands are the README's, byte for byte, so the
# marketplace is fetched from GitHub. The checkout is only read.
set -u
P=${TMPDIR:-/tmp}/terse/runs/20260924-002235-terse-readme-rewrite2/probe-02
REPO=$(git -C "$(dirname "$0")" rev-parse --show-toplevel)
SK=$REPO/plugins/terse/skills
CL=$HOME/.nvm/versions/node/v24.11.0/lib/node_modules/@anthropic-ai/claude-code/bin/claude.exe
NODE=$HOME/.nvm/versions/node/v24.11.0/bin/node
NP=/usr/bin:/bin:/usr/sbin:/sbin
for d in "$P/config-inst" "$P/home-inst" "$P/work-inst"; do case "$d" in "$P"/*) rm -rf "$d"; mkdir -p "$d";; *) echo "refused"; exit 9;; esac; done
iso() { (cd "$P/work-inst" && env -i HOME="$P/home-inst" PATH="$NP" CLAUDE_CONFIG_DIR="$P/config-inst" "$CL" "$@" < /dev/null); }
echo "claude: $(iso --version 2>&1)"
if iso auth status 2>&1 | grep -q '"loggedIn": false'; then echo "auth status: not logged in"; else echo "auth status: logged in or unknown, stopping"; exit 8; fi
env -i PATH="$NP" sh -c 'command -v node >/dev/null && echo "node on PATH: yes" || echo "node on PATH: no"'
say() { printf '%s' "$1" | tr '\r' '\n' | grep -o -E "$2" | tail -1; }
out=$(iso plugin marketplace add Nowely/agent-skills 2>&1); rc=$?; echo "\$ claude plugin marketplace add Nowely/agent-skills -> exit $rc; $(say "$out" 'Successfully added marketplace: [a-z]+')"
out=$(iso plugin install terse@nowely 2>&1); rc=$?; echo "\$ claude plugin install terse@nowely -> exit $rc; $(say "$out" 'Successfully installed plugin: [^ ]+')"
ip=$(grep -o '"installPath": "[^"]*terse[^"]*"' "$P/config-inst/plugins/installed_plugins.json" | sed 's/^"installPath": "//; s/"$//')
echo "installed at <config>/$(printf '%s' "$ip" | sed 's#^.*/config-inst/##'); skills there: $(ls "$ip/skills" | tr '\n' ' ')($(ls "$ip/skills" | wc -l | tr -d ' '))"
out=$(iso plugin marketplace update nowely 2>&1); rc=$?; echo "\$ claude plugin marketplace update nowely -> exit $rc; $(say "$out" 'Successfully updated marketplace: [a-z]+')"
out=$(iso plugin update terse@nowely 2>&1); rc=$?; echo "\$ claude plugin update terse@nowely -> exit $rc; $(say "$out" 'terse is already at the latest version \([^)]*\)|updated from [^ ]+ to [^ ]+|Restart to apply changes')"
for s in audit rethink rewrite; do
  out=$(iso -p "/terse:$s" 2>&1); rc=$?
  echo "/terse:$s, not signed in: exit $rc, $(printf '%s' "$out" | grep -o 'Not logged in[^"]*' | head -1)"
done
env -i PATH="$NP" sh -c "node '$SK/rewrite/scripts/selftest.mjs'" >/dev/null 2>&1; echo "a skill script with no node on PATH: exit $?"
out=$(env -i PATH="$(dirname "$NODE"):$NP" sh -c "node '$SK/rewrite/scripts/selftest.mjs'" 2>&1); rc=$?; echo "the same script with node $("$NODE" --version) on PATH: exit $rc; $(printf '%s' "$out" | tail -1)"
echo "pages that run node: $(grep -l 'node "\$' "$SK"/*/SKILL.md | sed "s#$SK/##; s#/SKILL.md##" | tr '\n' ' ')"
echo "rethink: node commands $(grep -c 'node ' "$SK/rethink/SKILL.md"), scripts directory $( [ -d "$SK/rethink/scripts" ] && echo present || echo absent )"
echo "declared: $(tr -d '\n ' < "$REPO/plugins/terse/package.json")"
rm -rf "$P/config-inst" "$P/home-inst" "$P/work-inst"
