#!/bin/sh
# Round 03, R03a: what audit does first, and when it waits. The run on record: task reader c4-1 of the
# round-02 wave (reviews/02/c4-1.md), a signed-in session of /terse:audit on the plugin the README's
# install commands fetched (0.1.1 from GitHub), which stopped at its own first question. That page's step 1
# is compared with this checkout's: the exchange it settles is the same text in both. Then the checkout's
# lines: the exchange (step 1) and the announcement of agents and model (step 5, after it). Reads only.
set -u
R=${TMPDIR:-/tmp}/terse/runs/20260924-002235-terse-readme-rewrite2
REPO=$(git -C "$(dirname "$0")" rev-parse --show-toplevel)
Q() { "$HOME/.nvm/versions/node/v24.11.0/bin/node" "$R/probe-02/quote.mjs" "$@"; }
C="$R/reviews/02/c4-1.md"
Q "$C" 37-37 '"source":"terse@inline","version":"0.1.1"'
Q "$C" 48-54 "Scope proposal for the audit:" "**Docs**: README.md (only tracked \`.md\` file)." "**Entry file**: README.md." "Confirm this, or correct it, before I build the reader profile."
Q "$C" 56-58 "\`stop_reason: \"end_turn\"\`" "It does not yet say how many agents or which model"
ex() { awk '/^Settle three things with the user/{f=1} /^Then make the run directory/{f=0} f'; }
a=$(git -C "$REPO" show 8c041b7:plugins/terse/skills/audit/SKILL.md | ex); b=$(ex < "$REPO/plugins/terse/skills/audit/SKILL.md")
[ -n "$a" ] && [ "$a" = "$b" ] && echo "step 1's exchange, 8c041b7 (the 0.1.1 the install fetched) against this checkout: identical, $(printf '%s\n' "$b" | wc -l | tr -d ' ') lines" || echo "step 1's exchange: DIFFERENT or missing"
Q "$REPO/plugins/terse/skills/audit/SKILL.md" 23-28 "Settle three things with the user in one exchange, not six:" "Which files are the documentation." "Where a reader arrives. Usually \`README.md\`."
Q "$REPO/plugins/terse/skills/audit/SKILL.md" 86-89 "## Step 5. The readers" "Announce the plan before spawning anything: how many readers, which model, roughly what it costs. Wait for the user's word."
