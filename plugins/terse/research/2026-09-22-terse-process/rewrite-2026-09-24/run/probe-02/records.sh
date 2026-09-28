#!/bin/sh
# Round 02 (sent back), C11: the two ways into rewrite, each as a run on record that reached a whole draft
# and its diff — the skeleton route in this run, the audit route in the run of 2026-09-22/23 (its record
# in the repository, its run directory still on disk) — then the page's table of ways in and its hand-over.
# Reads only.
set -u
R=${TMPDIR:-/tmp}/terse/runs/20260924-002235-terse-readme-rewrite2
REPO=$(git -C "$(dirname "$0")" rev-parse --show-toplevel)
OLD=$REPO/research/2026-09-22-terse-process/rewrite-2026-09-22/run
OLDRUN=${TMPDIR:-/tmp}/terse/runs/20260922-233021-terse-readme
AUD=$REPO/research/2026-09-22-terse-process/audit-2026-09-22/audit.md
Q() { "$HOME/.nvm/versions/node/v24.11.0/bin/node" "$R/probe-02/quote.mjs" "$@"; }
hdr() { sed -n '1,2p' "$1" | cut -d' ' -f1-2 | sed -e 's#\t.*##' -e "s#${TMPDIR%/}//*terse/runs/#<runs>/#" | tr '\n' ' '; }
echo "skeleton route, this run:"
echo "  R/rounds.md:1: $(sed -n '1p' "$R/rounds.md")"
echo "  R/skeleton.md sha256 $(shasum -a 256 "$R/skeleton.md" | cut -c1-16)…, the one line 1 records: $(sed -n '1p' "$R/rounds.md" | grep -c "$(shasum -a 256 "$R/skeleton.md" | cut -d' ' -f1)")"
echo "  R/01-candidate.md: $(wc -l < "$R/01-candidate.md" | tr -d ' ') lines, first \"$(head -1 "$R/01-candidate.md")\"; R/diff-01.patch: $(hdr "$R/diff-01.patch")"
echo "audit route, 2026-09-22/23, under the pages at 2f29a8f (record: research/2026-09-22-terse-process/rewrite-2026-09-22/run):"
echo "  its run directory holds audit.md: $( [ -f "$OLDRUN/audit.md" ] && echo yes || echo no), identical to research/2026-09-22-terse-process/audit-2026-09-22/audit.md: $(cmp -s "$OLDRUN/audit.md" "$AUD" && echo yes || echo no); its score: $(grep -o -m1 'docs 5/7, no-document 0/7' "$AUD")"
echo "  rounds.md row 00: $(grep -m1 '^| 00-original.md' "$OLD/rounds.md" | cut -c1-96)"
echo "  rounds.md row 01: $(grep -m1 '^| 01-candidate.md' "$OLD/rounds.md" | cut -c1-58)…"
echo "  01-candidate.md: first \"$(head -1 "$OLD/01-candidate.md")\"; diff-01.patch: $(hdr "$OLD/diff-01.patch")"
echo "  handed over: diff-04.patch $(hdr "$OLD/diff-04.patch"); rounds.md: \"$(grep -o -m1 'round 04 and `diff-04.patch` go to the owner' "$OLD/rounds.md")\""
echo "the page:"
Q "$REPO/plugins/terse/skills/rewrite/SKILL.md" 14-16 "Nothing is written on a shape the user has not agreed to"
Q "$REPO/plugins/terse/skills/rewrite/SKILL.md" 24-28 "| a skeleton the user agreed to | step 2 |" "| an \`audit\` run file | step 1 |"
Q "$REPO/plugins/terse/skills/rewrite/SKILL.md" 221-223 "Hand over the round and \`diff-NN.patch\`, the diff against \`00-original.md\`, written into the run directory."
