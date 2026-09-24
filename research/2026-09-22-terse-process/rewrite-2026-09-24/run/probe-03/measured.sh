#!/bin/sh
# Round 03, R03h: the 2026-09-22 audit's figures, counted now from its reader rows, and which README it
# measured — the README at 1a24018, the one this draft replaces. Reads only.
set -u
R=/var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T//terse/runs/20260924-002235-terse-readme-rewrite2
REPO=/Users/ruliny/Git/agent-skills
A="$R/audit.md"
s=$(grep -n -m1 '^## Reader results' "$A" | cut -d: -f1); e=$(grep -n -m1 '^## Score' "$A" | cut -d: -f1)
sed -n "${s},${e}p" "$A" | awk -F'|' '$2 ~ /^ *[0-9]+ *$/ { a=$3; r=$6; gsub(/^ +| +$/,"",a); gsub(/^ +| +$/,"",r); n[a]++; if (r=="yes") y[a]++ } END { printf "reader rows counted under Reader results: docs %d of %d right, no-doc %d of %d right\n", y["docs"], n["docs"], y["no-doc"], n["no-doc"] }'
echo "the report's score line: $(grep -n -o -m1 'docs 5/7, no-document 0/7' "$A"); its target: $(grep -o -m1 '2026-09-22, README at 1a24018' "$A")"
git -C "$REPO" show 1a24018:plugins/terse/README.md | cmp -s - "$R/00-original.md" && echo "the README at 1a24018 = R/00-original.md, the text this draft replaces: yes (cmp)" || echo "the README at 1a24018 = R/00-original.md: NO"
cmp -s "$A" "$REPO/research/2026-09-22-terse-process/audit-2026-09-22/audit.md" && echo "R/audit.md = research/2026-09-22-terse-process/audit-2026-09-22/audit.md: yes (cmp)"
