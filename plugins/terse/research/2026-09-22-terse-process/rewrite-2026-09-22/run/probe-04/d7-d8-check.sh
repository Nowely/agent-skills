#!/bin/sh
# The checks of code-defects.md D7 and D8 (round 04), as written there, with their outputs matched against
# the regexes written there. Nothing is written outside this probe directory.
set -u
R=${TMPDIR:-/tmp}/terse/runs/20260922-233021-terse-readme
SK=$(git -C "$(dirname "$0")" rev-parse --show-toplevel)/plugins/terse/skills
D7=$(sh $R/probe-04/lifetime-probe.sh; sed -n '39,42p' $SK/audit/SKILL.md; sed -n '74,77p' $SK/rewrite/SKILL.md; echo "page lines naming marketplace remove, a scope or the last installation: $(cat $SK/audit/SKILL.md $SK/rewrite/SKILL.md | grep -c -E 'marketplace remove|last (installation|scope)|--scope')")
printf '%s\n' "$D7" > $R/probe-04/d7-check.out
D8=$(sed -n '60,62p;108,109p;114p' $SK/rewrite/references/bake-off.md; sed -n '23,25p' $SK/audit/references/truth-pass.md; sed -n '21p' $SK/rewrite/references/writing-rules.md; sed -n '44,47p;212,215p' $SK/rewrite/SKILL.md; echo "page lines on a false or refuted condition, limit or warning: $(grep -rh -i -E '(false|refuted|wrong) (condition|limit|warning)|(condition|limit|warning)[^.]{0,40}(is|are|was) (false|refuted|wrong)' $SK | wc -l | tr -d ' ')")
printf '%s\n' "$D8" > $R/probe-04/d8-check.out
node -e '
const fs=require("fs"); const R=process.argv[1];
const re7=/A state after uninstall: terse-nowely absent, run marker absent[\s\S]*B state after uninstall --keep-data: terse-nowely present, run marker present[\s\S]*C state after uninstall of the user installation, the project one left: terse-nowely present, run marker present[\s\S]*C state after uninstall of the last installation: terse-nowely absent, run marker absent[\s\S]*D \$ claude plugin marketplace remove nowely -> exit 0\nD state after marketplace remove: terse-nowely absent, run marker absent[\s\S]*marketplace remove options: --help --scope\s*\n[\s\S]*deleted by `claude plugin uninstall` unless `--keep-data` is passed[\s\S]*deleted by `claude plugin uninstall`\s+unless `--keep-data` is passed[\s\S]*page lines naming marketplace remove, a scope or the last installation: 0\s*$/;
const re8=/Correct what the current file gets wrong rather than\s+carrying it forward[\s\S]*The first two rows are vetoes: a candidate that fails either is out[\s\S]*\| protected passages \| was a condition, limit or warning at a decision point cut or weakened\?[\s\S]*\| veto \|[\s\S]*must reach level 3 or be\s+weakened to what levels 1 and 2 support\. There is no third option[\s\S]*Never cut a condition, a limit or a warning where a reader decides\.[\s\S]*The accuracy floor\*\*: every statement about behaviour must be true of the code in this checkout[\s\S]*override the\s+rest of the rules wherever they collide: never cut a condition, a limit or a warning where a reader\s+decides[\s\S]*page lines on a false or refuted condition, limit or warning: 0\s*$/;
for (const [k,re] of [["D7",re7],["D8",re8]]) console.log(k, re.test(fs.readFileSync(R+"/probe-04/"+k.toLowerCase()+"-check.out","utf8")) ? "regex matches" : "REGEX DOES NOT MATCH");
' "$R"
