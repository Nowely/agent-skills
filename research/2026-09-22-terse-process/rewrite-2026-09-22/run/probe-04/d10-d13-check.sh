#!/bin/sh
# D10–D13, round 04: page gaps and script misses the wave found, each made to happen or read at its line.
set -u
R=$TMPDIR/terse/runs/20260922-233021-terse-readme
S=~/Git/agent-skills/plugins/terse/skills/rewrite/scripts
P=~/Git/agent-skills/plugins/terse
T="$R/probe-04/d10-d13"; case "$T" in "$R"/*) rm -rf "$T"; mkdir -p "$T";; *) echo refused; exit 9;; esac
echo "D10 rewrite/SKILL.md:190-191:"; sed -n '190,191p' "$P/skills/rewrite/SKILL.md"
echo "D10 rethink route named at rewrite/SKILL.md:16-21, 'original' mentions there: $(sed -n '16,21p' "$P/skills/rewrite/SKILL.md" | grep -c -i original)"
sed 's/^## Install$/## Installing/' "$R/04-terms.md" > "$T/sec-rename.md"
echo "D11 sections.mjs on a copy whose Install heading is renamed: $(node "$S/sections.mjs" "$T/sec-rename.md" "$R/budgets.json" | grep -E 'Installing|over budget' | tr '\n' ';')"
awk 'BEGIN{skip=0} /^## Licence$/{skip=1} skip==0{print}' "$R/04-terms.md" > "$T/sec-drop.md"
echo "D11 sections.mjs on a copy without the Licence section, lines naming Licence or a missing section: $(node "$S/sections.mjs" "$T/sec-drop.md" "$R/budgets.json" | grep -c -i -E 'licence|missing|absent')"
printf '## 介绍\n这是一个没有空格的句子，二十六个字符，被当作一个词。\n' > "$T/zh.md"
echo "D12 sections.mjs on a Chinese sentence with no spaces: $(node "$S/sections.mjs" "$T/zh.md" "$R/budgets.json" | grep 介绍)"
echo "D12 sections.mjs:13: $(sed -n '13p' "$S/sections.mjs")"
echo "D13 rewrite/SKILL.md lines saying who applies the candidate: $(grep -n -i -E 'appl(y|ies|ied)' "$P/skills/rewrite/SKILL.md" | cut -c1-140 | tr '\n' ';')"
echo "D13 rewrite/SKILL.md lines on whether an audit run from another commit is valid input: $(grep -c -i -E 'same commit|another commit|different commit|commit the audit' "$P/skills/rewrite/SKILL.md")"
