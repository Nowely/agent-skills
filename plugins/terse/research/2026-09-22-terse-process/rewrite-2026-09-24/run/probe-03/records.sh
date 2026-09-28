#!/bin/sh
# Round 03, C11: rewrite's two ways in, each a run on record that reached a whole draft and its diff —
# the skeleton route in this run, the audit route in the run of 2026-09-22/23 (its record in the
# repository, its run directory still on disk) — then the page's gate on the shape and its table of ways
# in. Adapted from probe-02/records.sh, which round 02's C11 ran; that file is left as it ran. Reads only.
set -u
R=${TMPDIR:-/tmp}/terse/runs/20260924-002235-terse-readme-rewrite2
REPO=$(git -C "$(dirname "$0")" rev-parse --show-toplevel)
SK=$REPO/plugins/terse/skills
OLD=$REPO/research/2026-09-22-terse-process/rewrite-2026-09-22/run
OLDRUN=${TMPDIR:-/tmp}/terse/runs/20260922-233021-terse-readme
AUD=$REPO/research/2026-09-22-terse-process/audit-2026-09-22/audit.md
Q() { "$HOME/.nvm/versions/node/v24.11.0/bin/node" "$R/probe-02/quote.mjs" "$@"; }
hdr() { sed -n '1,2p' "$1" | cut -f1 | sed 's#^\([-+]*\) .*/#\1 #' | tr '\n' ' '; }
echo "skeleton route, this run: R/rounds.md:1 \"$(sed -n '1p' "$R/rounds.md" | cut -c1-72)…\"; its SHA is R/skeleton.md's: $(sed -n '1p' "$R/rounds.md" | grep -c "$(shasum -a 256 "$R/skeleton.md" | cut -d' ' -f1)"); R/01-candidate.md first \"$(head -1 "$R/01-candidate.md")\"; R/diff-01.patch $(hdr "$R/diff-01.patch")"
echo "audit route, 2026-09-22/23, pages at 2f29a8f (research/2026-09-22-terse-process/rewrite-2026-09-22/run): its run directory holds audit.md $( [ -f "$OLDRUN/audit.md" ] && echo yes || echo no), = the repository's report $(cmp -s "$OLDRUN/audit.md" "$AUD" && echo yes || echo no), score $(grep -o -m1 'docs 5/7, no-document 0/7' "$AUD"); 01-candidate.md first \"$(head -1 "$OLD/01-candidate.md")\"; diff-01.patch $(hdr "$OLD/diff-01.patch"); handed over: diff-04.patch $(hdr "$OLD/diff-04.patch"); rounds.md \"$(grep -o -m1 'round 04 and `diff-04.patch` go to the owner' "$OLD/rounds.md")\""
echo "the pages:"
Q "$SK/rewrite/SKILL.md" 14-16 "Nothing is written on a shape the user has not agreed to" "their words, quoted, that the document's current shape stands"
Q "$SK/audit/SKILL.md" 166-171 "It is \`shape: agreed\` only on the user's word" "Agreed, offer \`rewrite\` as the next step. Not agreed, offer \`/terse:rethink\`"
Q "$SK/rewrite/SKILL.md" 24-28 "| a skeleton the user agreed to | step 2 |" "| an \`audit\` run file | step 1 |"
Q "$SK/rewrite/SKILL.md" 221-223 "Hand over the round and \`diff-NN.patch\`, the diff against \`00-original.md\`, written into the run directory."
