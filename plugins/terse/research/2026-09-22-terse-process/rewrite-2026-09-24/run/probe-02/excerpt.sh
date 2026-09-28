#!/bin/sh
# Round 02: the Quick start's excerpt against the report it quotes. excerpt.txt beside this script holds
# the excerpt's two lines exactly as the round writes them into its `text` fence (edits/02.build.mjs writes
# both from one constant). Checked here: each line is found verbatim (grep -F) in the report, the two lines
# joined are found once in the report's whitespace-normalised text, the report lines sit under *What broke*
# in the Q7 entry, the report's date, the excerpt's size, and the skeleton's must-not words (part 3, rule 7)
# and its reader-pair rule over the excerpt. Reads only.
set -u
P=${TMPDIR:-/tmp}/terse/runs/20260924-002235-terse-readme-rewrite2
A="$P/audit.md"; X="$P/probe-02/excerpt.txt"
n=0; while IFS= read -r l; do n=$((n+1)); echo "excerpt line $n found at audit.md:$(grep -n -F -- "$l" "$A" | cut -d: -f1 | tr '\n' ' ')"; done < "$X"
j=$(tr '\n' ' ' < "$X" | sed 's/ *$//'); echo "joined, in the normalised report: $(tr '\n' ' ' < "$A" | tr -s ' ' | grep -o -F -- "$j" | wc -l | tr -d ' ') time(s)"
echo "headings around it: $(grep -n -E '^## What broke|^### Q7 |^### Task TB|^## Open' "$A" | tr '\n' ' ')"
echo "the report's date: $(grep -n -o -F '2026-09-22, README at 1a24018' "$A")"
echo "the sentence ends: $(sed -n '1015,1016p' "$A" | tr '\n' ' ' | grep -o -E 'appears in no page, and no question can be answered on it from the documentation\.')"
echo "excerpt size: $(wc -w < "$X" | tr -d ' ') whitespace tokens, $(tr -d '—' < "$X" | wc -w | tr -d ' ') words"
echo "must-not words in the excerpt: $(grep -c -i -w -E 'invoke[sd]?|invocation|user-invoked|spawn(s|ed)?|documentation|task readers?|entry file|baseline|no-document|arm|controls?|planted|ledger|pinned|pins?|retired|truth pass|evidence levels?|refuted|placement|findability|harmful|run director(y|ies)|run files?|your tree|code defects?|defects?|checkout|candidates?|bake-off|critics?|lens(es)?|wave|verifier|regressions?|ratchet|pipeline|chain|pilot|McNemar|genre|survey|water|repairs?|prior art|TMPDIR|consent|your word|version' "$X")"
echo "reader pairs in the excerpt: $(grep -o -i -E '\b[a-z]+ readers?\b' "$X" | grep -c -v -i -E '^(ai|your) ')"
