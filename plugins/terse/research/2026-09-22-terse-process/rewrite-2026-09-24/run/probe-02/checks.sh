#!/bin/sh
# Round 02: step 4 item 4's four checks with the document's own headings, then the skeleton's part 3
# rules 2, 5, 6.11 and 7 as a grep would read them. Reads only.
set -u
R=$TMPDIR/terse/runs/20260924-002235-terse-readme-rewrite2
S=~/Git/agent-skills/plugins/terse/skills/rewrite/scripts
F="$R/02-grafts.md"
echo "# round 02 checks, $(date '+%Y-%m-%d %H:%M:%S'); 02-grafts.md sha256 $(shasum -a 256 "$F" | cut -d' ' -f1)"
echo "ledger.02.json sha256 $(shasum -a 256 "$R/ledger.02.json" | cut -d' ' -f1) (ledger.json before the round: $(cut -d' ' -f1 "$R/probe-02/ledger-before-02.sha"))"
echo; echo '$ node rule1.mjs 02-grafts.md --cut "How it works" --except "Quick start"'; node "$S/rule1.mjs" "$F" --cut "How it works" --except "Quick start"; echo "exit $?"
echo; echo '$ node rule1.mjs 02-grafts.md --cut "How it works"   (the skeleton'"'"'s rule 1 form, no --except)'; node "$S/rule1.mjs" "$F" --cut "How it works"; echo "exit $?"
echo; echo '$ node dup.mjs 02-grafts.md concepts.json'; node "$S/dup.mjs" "$F" "$R/concepts.json"; echo "exit $?"
echo; echo '$ node sections.mjs 02-grafts.md budgets.json'; node "$S/sections.mjs" "$F" "$R/budgets.json"; echo "exit $?"
echo; echo '$ node ledger.mjs ledger.json 00-original.md 01-candidate.md 02-grafts.md'; node "$S/ledger.mjs" "$R/ledger.json" "$R/00-original.md" "$R/01-candidate.md" "$F"; echo "exit $?"
echo; echo "# the skeleton's part 3, rules 2, 5, 6.11 and 7"
echo '$ grep -n "^#"'; grep -n '^#' "$F"
echo '$ opening fence lines'; awk '/^```/{ if (!o) { o=1; print "  " NR ": " $0 } else o=0 }' "$F"
echo "\$ grep -c '/plugin': $(grep -c '/plugin' "$F")"
out() { awk '/^```text$/{f=1;next} /^```$/{f=0;next} !f' "$F"; }
echo "rule 6 item 11, qualifiers outside the text fences: $(out | grep -c -i -w -E 'unless|only if|except when|as long as|provided that')"
echo "rule 7, must-not words outside the text fences: $(out | grep -c -i -w -E 'invoke[sd]?|invocation|user-invoked|spawn(s|ed)?|documentation|task readers?|entry file|baseline|no-document|arm|controls?|planted|ledger|pinned|pins?|retired|truth pass|evidence levels?|refuted|placement|findability|harmful|run director(y|ies)|run files?|your tree|code defects?|defects?|checkout|candidates?|bake-off|critics?|lens(es)?|wave|verifier|regressions?|ratchet|pipeline|chain|pilot|McNemar|genre|survey|water|repairs?|prior art|TMPDIR|consent|your word|version') line(s)"
echo "rule 7, reader pairs other than AI/your: $(grep -o -i -E '\b[a-z]+ readers?\b' "$F" | grep -c -v -i -E '^(ai|your) ')"
echo "opening holds weight: $(sed -n '3p' "$F" | grep -c -w weight), meaning: $(sed -n '3p' "$F" | grep -c -w meaning)"
for p in 'until you say so' 'rounds of edits' 'documents like yours' 'AI reviewers'; do echo "'$p': $(grep -o -F "$p" "$F" | wc -l | tr -d ' ')"; done
echo "first line holding skeleton: $(grep -n -m1 -w skeleton "$F" | cut -d: -f1); outline in it: $(grep -m1 -w skeleton "$F" | grep -c -w outline)"
echo "first line holding shape: $(grep -n -m1 -w shape "$F" | cut -d: -f1); order in it: $(grep -m1 -w shape "$F" | grep -c -w order)"
echo "first line holding diff: $(grep -n -m1 -w diff "$F" | cut -d: -f1); change in it: $(grep -m1 -w diff "$F" | grep -c -w change)"
echo "score used: $(grep -c -i -w score "$F")"
echo "first AI reader: $(grep -o -m1 -E '[a-z]+ AI reader' "$F" | head -1)"
node -e 'const t=require("fs").readFileSync(process.argv[1],"utf8").split("\n"); let n=0; t.forEach((l,i)=>{ for (const m of l.matchAll(/terse/gi)) { const pre=l[m.index-1]||"", post=l[m.index+5]||""; if (!((pre==="/"&&post===":")||post==="@"||(i===0&&l==="# terse"))) { n++; console.log("  line "+(i+1)+": "+l); } } }); console.log("terse outside the H1 and the commands: "+n);' "$F"
