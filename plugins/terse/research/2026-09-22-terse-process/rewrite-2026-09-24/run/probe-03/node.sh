#!/bin/sh
# Round 03, R02a narrowed to the Node line: what the skills need Node for, made to happen. A skill script
# run with no node on PATH, then with Node 24.11.0 on it; which pages run node; the floor the plugin
# declares. `env -i` keeps this session's variables out; TMPDIR is a directory under this probe, removed
# at the end. The checkout is only read.
set -u
P=/var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T//terse/runs/20260924-002235-terse-readme-rewrite2/probe-03
REPO=/Users/ruliny/Git/agent-skills
SK=$REPO/plugins/terse/skills
NODE=/Users/ruliny/.nvm/versions/node/v24.11.0/bin/node
NP=/usr/bin:/bin:/usr/sbin:/sbin
T="$P/tmp-node"; case "$T" in "$P"/tmp-node) rm -rf "$T"; mkdir -p "$T";; *) exit 9;; esac
env -i PATH="$NP" sh -c 'command -v node >/dev/null && echo "node on PATH: yes" || echo "node on PATH: no"'
env -i PATH="$NP" TMPDIR="$T/" sh -c "node '$SK/rewrite/scripts/selftest.mjs'" >/dev/null 2>&1; echo "a skill script with no node on PATH: exit $?"
out=$(env -i PATH="$(dirname "$NODE"):$NP" TMPDIR="$T/" sh -c "node '$SK/rewrite/scripts/selftest.mjs'" 2>&1); rc=$?
echo "the same script with node $("$NODE" --version) on PATH: exit $rc; $(printf '%s' "$out" | tail -1)"
echo "pages that run node: $(grep -l 'node "\$' "$SK"/*/SKILL.md | sed "s#$SK/##; s#/SKILL.md##" | tr '\n' ' ')"
echo "rethink: node commands $(grep -c 'node ' "$SK/rethink/SKILL.md"), scripts directory $( [ -d "$SK/rethink/scripts" ] && echo present || echo absent )"
echo "declared: $(tr -d '\n ' < "$REPO/plugins/terse/package.json")"
rm -rf "$T"
