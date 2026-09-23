#!/bin/sh
# Round 03, the Install prerequisites: what the two install commands need, and what running a skill needs.
# One Claude configuration isolated under this probe directory, no sign-in, and a PATH with no Node on it
# (/usr/bin:/bin:/usr/sbin:/sbin; claude is called by its absolute path, a native binary). The gate stops
# before any invocation unless the configuration reports "loggedIn": false, so nothing reaches a model.
# `env -i` keeps this session's variables out. Installed from this checkout's marketplace.
set -u
P=/var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T//terse/runs/20260922-233021-terse-readme/probe-03
REPO=/Users/ruliny/Git/agent-skills
SK=$REPO/plugins/terse/skills
CL=/Users/ruliny/.nvm/versions/node/v24.11.0/lib/node_modules/@anthropic-ai/claude-code/bin/claude.exe
NP=/usr/bin:/bin:/usr/sbin:/sbin
for d in "$P/config-install" "$P/home-install" "$P/work-install"; do case "$d" in "$P"/*) rm -rf "$d"; mkdir -p "$d";; *) echo "refused"; exit 9;; esac; done
iso() { (cd "$P/work-install" && env -i HOME="$P/home-install" PATH="$NP" CLAUDE_CONFIG_DIR="$P/config-install" "$@" < /dev/null); }
echo "claude: $(iso "$CL" --version 2>&1)"
if iso "$CL" auth status 2>&1 | grep -q '"loggedIn": false'; then echo "auth status: not logged in"; else echo "auth status: logged in or unknown, stopping"; exit 8; fi
env -i PATH="$NP" sh -c 'command -v node >/dev/null && echo "node on PATH: yes" || echo "node on PATH: no"'
iso "$CL" plugin marketplace add "$REPO" >/dev/null 2>&1; echo "marketplace add, not signed in, no node on PATH: exit $?"
iso "$CL" plugin install terse@nowely >/dev/null 2>&1; echo "plugin install, not signed in, no node on PATH: exit $?"
for s in audit rethink rewrite; do
  out=$(iso "$CL" -p "/terse:$s" 2>&1); rc=$?
  echo "/terse:$s, not signed in: exit $rc, $(printf '%s' "$out" | grep -o 'Not logged in[^"]*' | head -1)"
done
env -i PATH="$NP" sh -c "node '$SK/rewrite/scripts/selftest.mjs'" >/dev/null 2>&1; echo "a skill script with no node on PATH: exit $?"
echo "pages that run node: $(grep -l 'node "\$' "$SK"/*/SKILL.md | sed "s#$SK/##; s#/SKILL.md##" | tr '\n' ' ')"
echo "rethink: node commands $(grep -c 'node ' "$SK/rethink/SKILL.md"), scripts directory $( [ -d "$SK/rethink/scripts" ] && echo present || echo absent )"
echo "declared: $(tr -d '\n ' < "$REPO/plugins/terse/package.json")"
