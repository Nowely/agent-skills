#!/bin/sh
# Round 04: step 4 item 4's four checks with the document's own headings, then skeleton 03's part 3 rules
# 2 (headings), 4 (the block budgets), 5 (fences), 6 (items 5, 6, 11) and 7 (words), as a grep reads them.
# The file is the first argument, 04-shape.md by default. Reads only.
set -u
R=/var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T//terse/runs/20260924-002235-terse-readme-rewrite2
S=/Users/ruliny/Git/agent-skills/plugins/terse/skills/rewrite/scripts
F="${1:-$R/04-shape.md}"
echo "# round 04 checks, $(date '+%Y-%m-%d %H:%M:%S'); $(basename "$F") sha256 $(shasum -a 256 "$F" | cut -d' ' -f1)"
[ -f "$R/ledger.04.json" ] && echo "ledger.04.json sha256 $(shasum -a 256 "$R/ledger.04.json" | cut -d' ' -f1) (ledger.json before the round: $(cut -d' ' -f1 "$R/probe-04/ledger-before-04.sha" 2>/dev/null))"
echo; echo '$ node rule1.mjs F --cut "How it works" --except "Quick start"'; node "$S/rule1.mjs" "$F" --cut "How it works" --except "Quick start"; echo "exit $?"
echo; echo '$ node rule1.mjs F --cut "How it works"   (skeleton 03 rule 1, no --except)'; node "$S/rule1.mjs" "$F" --cut "How it works"; echo "exit $?"
echo; echo '$ node dup.mjs F concepts.json'; node "$S/dup.mjs" "$F" "$R/concepts.json"; echo "exit $?"
echo; echo '$ node sections.mjs F budgets.json'; node "$S/sections.mjs" "$F" "$R/budgets.json"; echo "exit $?"
echo '$ block budgets (rule 4): Install <= 26, Workflow <= 140, Update <= 18'
awk '/^## /{b=""} /^### /{b=$0;next} b&&NF{w[b]+=NF} END{for(k in w)print "  " w[k] "\t" k}' "$F"
if [ "$F" = "$R/04-shape.md" ]; then echo; echo '$ node ledger.mjs ledger.json 00-original.md 01-candidate.md 02-grafts.md 03-routes.md 04-shape.md'; node "$S/ledger.mjs" "$R/ledger.json" "$R/00-original.md" "$R/01-candidate.md" "$R/02-grafts.md" "$R/03-routes.md" "$F"; echo "exit $?"; fi
echo; echo "# skeleton 03, part 3, rules 2, 5, 6 and 7"
echo '$ grep -n "^#"'; grep -n '^#' "$F"
echo '$ opening fence lines, with the heading above them'; awk '/^## /{h=$0} /^### /{b=$0} /^```/{ if (!o) { o=1; print "  " NR ": " $0 "   under " h " " b } else o=0 }' "$F"
echo "\$ grep -c '/plugin': $(grep -c '/plugin' "$F")"
for b in Install Update; do echo "rule 6 item $( [ $b = Install ] && echo 5 || echo 6 ): first non-blank line under ### $b: $(awk -v h="### $b" '$0==h{f=1;next} f&&NF{print;exit}' "$F")"; done
out() { awk '/^```/{f=!f;next} !f' "$F"; }
echo "rule 6 item 11, qualifiers outside the fences: $(out | grep -c -i -w -E 'unless|only if|except when|as long as|provided that')"
echo "rule 7, must-not words outside the fences: $(out | grep -c -i -w -E 'invoke[sd]?|invocation|user-invoked|spawn(s|ed)?|documentation|task readers?|entry file|baseline|no-document|arm|controls?|planted|ledger|pinned|pins?|retired|truth pass|evidence levels?|refuted|placement|findability|harmful|run director(y|ies)|run files?|your tree|code defects?|defects?|checkout|candidates?|bake-off|critics?|lens(es)?|wave|verifier|regressions?|ratchet|chain|pilot|McNemar|genre|survey|water|repairs?|prior art|TMPDIR|consent|your word|version') line(s)"
echo "rule 7, pipeline outside How it works: [$(awk '/^## /{s=$0} tolower($0)~/pipeline/{print s}' "$F" | sort -u | grep -v '^## How it works$' | tr '\n' ' ')]"
echo "rule 7, reader pairs other than AI/your: $(grep -o -i -E '\b[a-z]+ readers?\b' "$F" | grep -c -v -i -E '^(ai|your) ')"
echo "opening holds weight: $(sed -n '3p' "$F" | grep -c -w weight), meaning: $(sed -n '3p' "$F" | grep -c -w meaning)"
for p in 'until you say so' 'rounds of edits' 'documents like yours' 'AI reviewers' '### Workflow'; do echo "'$p': $(grep -o -F "$p" "$F" | wc -l | tr -d ' ')"; done
echo "first line holding skeleton: $(grep -n -m1 -w skeleton "$F" | cut -d: -f1); outline in it: $(grep -m1 -w skeleton "$F" | grep -c -w outline)"
echo "first line holding shape: $(grep -n -m1 -w shape "$F" | cut -d: -f1); order in it: $(grep -m1 -w shape "$F" | grep -c -w order)"
echo "first line holding diff: $(grep -n -m1 -w diff "$F" | cut -d: -f1); change in it: $(grep -m1 -w diff "$F" | grep -c -w change)"
echo "first AI reader: $(grep -o -m1 -E '[a-z]+ AI reader' "$F" | head -1)"
node -e 'const t=require("fs").readFileSync(process.argv[1],"utf8").split("\n"); let n=0; t.forEach((l,i)=>{ for (const m of l.matchAll(/terse/gi)) { const pre=l[m.index-1]||"", post=l[m.index+5]||""; if (!((pre==="/"&&post===":")||post==="@"||(i===0&&l==="# terse"))) { n++; console.log("  line "+(i+1)+": "+l); } } }); console.log("terse outside the H1 and the commands: "+n);' "$F"
