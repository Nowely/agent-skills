#!/bin/sh
# Round 04, L6.3-04: what the shipped ledger check does with a new round that loses a sentence an earlier
# round verified, and with one that brings back wording one retired as false. A planted ledger under this
# probe directory: one pinned sentence (want: true, as round.mjs:112 writes a claim) and one retired phrase
# (want: false, as round.mjs:118 writes a retirement), over rounds 00 and 01 that carry the
# pin and not the phrase. Three candidates for round 02: one that loses the pin, one that revives the
# phrase as the ledger holds it, and one that does neither. The repository's ledger.mjs judges the last
# file it is given. Nothing is written outside this directory.
set -u
P=${TMPDIR:-/tmp}/terse/runs/20260922-233021-terse-readme/probe-04
S=$(git -C "$(dirname "$0")" rev-parse --show-toplevel)/plugins/terse/skills/rewrite/scripts
G="$P/guard"
case "$G" in "$P"/*) rm -rf "$G"; mkdir -p "$G";; *) echo refused; exit 9;; esac
printf '%s\n' '[{"name":"verified","pattern":"Applying the candidate requires your word\\.","want":true,"level":2},{"name":"retired","pattern":"Nothing else is needed","want":false}]' > "$G/ledger.json"
printf 'Applying the candidate requires your word.\n' > "$G/00-original.md"; cp "$G/00-original.md" "$G/01-candidate.md"
printf 'Applying the candidate is up to you.\n' > "$G/02-loses.md"
printf 'Applying the candidate requires your word. Nothing else is needed.\n' > "$G/02-revives.md"
printf 'Applying the candidate requires your word. Install it first.\n' > "$G/02-keeps.md"
for f in loses revives keeps; do
  out=$(node "$S/ledger.mjs" "$G/ledger.json" "$G/00-original.md" "$G/01-candidate.md" "$G/02-$f.md"); rc=$?
  echo "round 02 that $f: ledger.mjs exit $rc; rows: $(printf '%s\n' "$out" | grep -E '^(verified|retired) ' | tr -s ' ' | tr '\n' ';') $(printf '%s\n' "$out" | grep 'failure(s)' | sed "s#$G/##")"
done
echo "the page on it, rewrite/SKILL.md:124-126:"; sed -n '124,126p' "$S/../SKILL.md"
echo "ledger.mjs:6-8:"; sed -n '6,8p' "$S/ledger.mjs"
