#!/bin/sh
# Round 03, R03g: what the shipped check refuses, made to happen with the shipped scripts. One round with
# a pinned sentence (a claim checked true) and a retired phrasing (a sentence found false) is edited by
# round.mjs five ways, and ledger.mjs judges each new round against the one before:
#   a  the pinned sentence cut, no drop declared          (a silent loss)
#   b  the retired phrasing brought back word for word
#   c  neither                                          (the control)
#   d  the pinned sentence cut, its drop declared by name (a loss that is not silent)
#   e  the retired claim brought back in other words
# Everything is written under guard/ beside this script and removed at the end. Reads the checkout only.
set -u
P=$TMPDIR/terse/runs/20260924-002235-terse-readme-rewrite2/probe-03
S=~/Git/agent-skills/plugins/terse/skills/rewrite/scripts
NODE=~/.nvm/versions/node/v24.11.0/bin/node
G="$P/guard"; case "$G" in "$P"/guard) rm -rf "$G"; mkdir -p "$G";; *) exit 9;; esac
printf '# demo\n\nEvery run writes a receipt.\n\nThe tool asks before it deletes.\n' > "$G/01-base.md"
printf '[{"name":"T the tool asks before it deletes","pattern":"The tool asks before it deletes\\\\.","want":true},\n {"name":"F it deletes without asking","pattern":"It deletes without asking\\\\.","want":false}]\n' > "$G/ledger.seed.json"
case1() { k="$1"; e="$2"; d="$G/$k"; mkdir -p "$d"; cp "$G/ledger.seed.json" "$d/ledger.json"; printf '%s' "$e" > "$d/edits.json"
  "$NODE" "$S/round.mjs" "$G/01-base.md" "$d/02-round.md" "$d/edits.json" --ledger "$d/ledger.json" >/dev/null 2>&1; w=$?
  out=$("$NODE" "$S/ledger.mjs" "$d/ledger.json" "$G/01-base.md" "$d/02-round.md" 2>&1); rc=$?
  rows=$(printf '%s\n' "$out" | grep -E '^[TF] ' | sed 's/  */ /g' | tr '\n' ';')
  echo "$k: round.mjs exit $w; ledger.mjs exit $rc; ${rows:-no rows}"; }
case1 "a cut, no drop" '[{"name":"cut","old":"\n\nThe tool asks before it deletes.","new":""}]'
case1 "b retired phrasing back, word for word" '[{"name":"revive","old":"Every run writes a receipt.","new":"Every run writes a receipt. It deletes without asking."}]'
case1 "c neither" '[{"name":"title","old":"# demo","new":"# Demo"}]'
case1 "d cut, drop declared" '[{"name":"cut","old":"\n\nThe tool asks before it deletes.","new":"","drop":["T the tool asks before it deletes"]}]'
case1 "e retired claim back, other words" '[{"name":"revive","old":"Every run writes a receipt.","new":"Every run writes a receipt. It removes files without asking."}]'
echo "d's edit names its drop: $(grep -o '"drop":\[[^]]*\]' "$G/d cut, drop declared/edits.json")"
rm -rf "$G"
