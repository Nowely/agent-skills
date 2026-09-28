#!/bin/sh
# Round 03, the code findings D2-D4 of code-defects.md, each reproduced on planted input under this probe
# directory with the repository's scripts. Nothing is written outside it.
set -u
P=${TMPDIR:-/tmp}/terse/runs/20260922-233021-terse-readme/probe-03
REPO=$(git -C "$(dirname "$0")" rev-parse --show-toplevel)
S=$REPO/plugins/terse/skills/rewrite/scripts
A=$REPO/plugins/terse/skills/audit/scripts
for d in "$P/d2" "$P/d3" "$P/d4"; do case "$d" in "$P"/*) rm -rf "$d"; mkdir -p "$d";; *) echo refused; exit 9;; esac; done
# D2: a retired pattern with a capital letter.
printf '%s\n' '[{"name":"pinned","pattern":"requires your word","want":true,"level":2},{"name":"retired","pattern":"nothing else is needed","want":false}]' > "$P/d2/ledger.json"
printf 'Applying it requires your word.\n' > "$P/d2/00-original.md"; cp "$P/d2/00-original.md" "$P/d2/01-candidate.md"
printf 'Applying it requires your word. Nothing else is needed.\n' > "$P/d2/02-capital.md"
printf 'Applying it requires your word. nothing else is needed.\n' > "$P/d2/02-lower.md"
out=$(node "$S/ledger.mjs" "$P/d2/ledger.json" "$P/d2/00-original.md" "$P/d2/01-candidate.md" "$P/d2/02-capital.md"); rc=$?
echo "D2 retired phrase with a capital: ledger.mjs exit $rc; retired row: $(printf '%s\n' "$out" | grep '^retired' | tr -s ' ')"
out=$(node "$S/ledger.mjs" "$P/d2/ledger.json" "$P/d2/00-original.md" "$P/d2/01-candidate.md" "$P/d2/02-lower.md"); rc=$?
echo "D2 retired phrase in lower case: ledger.mjs exit $rc; retired row: $(printf '%s\n' "$out" | grep '^retired' | tr -s ' ')"
echo "D2 scripts that write a flags field: $(grep -l 'flags' "$S/round.mjs" "$A/ledger-seed.mjs" | wc -l | tr -d ' ') of 2 (round.mjs, ledger-seed.mjs); ledger.mjs reads it: $(grep -c 'new RegExp(pattern, flags' "$S/ledger.mjs")"
# D3: an audit run file whose claim ledger has no entries.
printf '%s\n' '# Audit' '' '## Scope' '' 'x' '' '## Reader profile' '' 'x' '' '## Claim ledger' '' 'No sentence states a behaviour.' '' '```json claims' '[]' '```' '' '## Questions and answer key' '' 'x' > "$P/d3/audit.md"
out=$(node "$A/ledger-seed.mjs" "$P/d3/audit.md" "$P/d3/ledger.json" 2>&1); rc=$?
echo "D3 empty claim ledger: ledger-seed.mjs exit $rc: $(printf '%s' "$out" | sed "s#$P#<probe>#g")"
echo "D3 ledger.json written: $( [ -f "$P/d3/ledger.json" ] && echo yes || echo no)"
# D4: rule1 on the four forms, before the cut.
printf '%s\n' 'put Node 22 or newer on `PATH`' 'under `${TMPDIR:-/tmp}/terse` from a checkout' 'under `$TMPDIR/terse` from a checkout' 'unless you pass `--keep-data`' '' '## How it works' '' 'nothing' > "$P/d4/planted.md"
out=$(node "$S/rule1.mjs" "$P/d4/planted.md"); rc=$?
echo "D4 rule1 on planted lines 1-4: exit $rc; reported: $(printf '%s\n' "$out" | grep '^!' | tr -s ' ' | tr '\n' ';')"
