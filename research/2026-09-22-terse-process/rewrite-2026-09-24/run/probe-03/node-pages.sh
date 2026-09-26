#!/bin/sh
# Round 03, second build, R02a: which skills run Node. Each skill's directory as it ships, and each page's
# Node command lines: audit and rewrite carry scripts/ and run them with node; rethink has no scripts/
# directory and no node command. Reads only.
set -u
SK=~/Git/agent-skills/plugins/terse/skills
for s in audit rethink rewrite; do echo "skills/$s/: $(ls -1 "$SK/$s" | tr '\n' ' ')"; done
for s in audit rethink rewrite; do echo "$s/SKILL.md lines running node \"\$…/scripts…\": $(grep -n 'node "\$' "$SK/$s/SKILL.md" | cut -d: -f1 | tr '\n' ' ')($(grep -c 'node "\$' "$SK/$s/SKILL.md"))"; done
