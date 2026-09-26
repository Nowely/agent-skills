#!/bin/sh
# Round 02 (sent back): where a page's run line lands. The page is rendered as Claude Code hands it to
# the model, then the rendered line is run by the shell. Adapted from the 2026-09-23 probe
# (research/2026-09-22-terse-process/rewrite-2026-09-22/run/probe-03/rundir-probe.sh). No stub is needed:
# signed out, each invocation stops at "Not logged in" before any model call (cost 0), and the session
# record Claude Code writes under the isolated configuration already holds the page as rendered.
# Arguments: the pages, rewrite's first; default all three.
# Three loads, each in a Claude configuration isolated under rd/:
#   installed  terse installed from a copy of this checkout's .claude-plugin/ and plugins/
#   plugindir  the copy's plugins/terse loaded for one session with --plugin-dir
#   skills     the pages as plain files in a project's .claude/skills, with no plugin loader
# The skills load is how the pages read as a source checkout rather than an installed plugin
# (audit/SKILL.md:36–38). Each rendered line is run from the load's working directory, which stands for
# the user's repository, with <slug> as readme. Gate: nothing runs unless the configuration reports
# "loggedIn": false. `env -i` keeps this session's variables out. Every write is under rd/, which is
# removed at the end; the checkout is only read, and its status for plugins/ and .claude-plugin/ is printed.
set -u
P=/var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T//terse/runs/20260924-002235-terse-readme-rewrite2/probe-02
REPO=/Users/ruliny/Git/agent-skills
CL=/Users/ruliny/.nvm/versions/node/v24.11.0/lib/node_modules/@anthropic-ai/claude-code/bin/claude.exe
NODE=/Users/ruliny/.nvm/versions/node/v24.11.0/bin/node
NP=/usr/bin:/bin:/usr/sbin:/sbin
PAGES="${*:-rewrite audit rethink}"
B="$P/rd"
case "$B" in "$P"/rd) rm -rf "$B"; mkdir -p "$B";; *) echo "refused"; exit 9;; esac
B1=$(printf '%s' "$B" | sed 's#//*#/#g')
short() { sed "s#$B1#<probe>#g; s#$B#<probe>#g; s#[0-9]\{8\}-[0-9]\{6\}#<stamp>#g; s#//*#/#g"; }
M="$B/mkt"; mkdir -p "$M/plugins" && cp -R "$REPO/.claude-plugin" "$M/" && cp -R "$REPO/plugins/terse" "$REPO/plugins/entrust" "$M/plugins/"
diff -rq "$REPO/plugins/terse" "$M/plugins/terse" >/dev/null 2>&1 && c0="identical" || c0="DIFFERENT"
iso() { c="$1"; shift; env -i HOME="$B/home-$c" PATH="$NP" TMPDIR="$B/tmp-$c/" CLAUDE_CONFIG_DIR="$B/config-$c" "$@"; }
mk() { mkdir -p "$B/config-$1" "$B/home-$1" "$B/tmp-$1" "$B/work-$1"; iso "$1" "$CL" auth status </dev/null 2>&1 | grep -q '"loggedIn": false' || { echo "$1: logged in or unknown, stopping"; exit 8; }; }
seen() { "$NODE" -e '
const fs = require("fs"), path = require("path"), dir = process.argv[1]; const got = new Set();
const walk = (v) => { if (typeof v === "string") { for (const l of v.split("\n")) if (l.includes("RUN=\"${D:-")) got.add(l.trim()); } else if (v && typeof v === "object") for (const k in v) walk(v[k]); };
if (fs.existsSync(dir)) for (const d of fs.readdirSync(dir)) { const p = path.join(dir, d); if (!fs.statSync(p).isDirectory()) continue;
  for (const f of fs.readdirSync(p).filter((f) => f.endsWith(".jsonl"))) for (const line of fs.readFileSync(path.join(p, f), "utf8").split("\n")) { try { walk(JSON.parse(line)); } catch {} } }
console.log([...got].join("\n"));' "$B/config-$1/projects"; }
page() { c="$1"; s="$2"; cmd="$3"; shift 3
  rm -rf "$B/config-$c/projects"
  out=$(cd "$B/work-$c" && iso "$c" "$CL" -p "$cmd" "$@" --output-format stream-json --verbose </dev/null 2>&1); rc=$?
  printf '%s' "$out" | grep -q 'Not logged in' && gate="Not logged in" || gate="NOT stopped at login"
  cost=$(printf '%s' "$out" | grep -o '"total_cost_usd":[0-9.]*' | head -1 | cut -d: -f2)
  L=$(seen "$c" | head -1)
  d=$(printf '%s' "$L" | sed -n 's/^D="\([^"]*\)".*/\1/p')
  X=$(printf '%s' "$L" | sed 's/<slug>/readme/')
  run=$(cd "$B/work-$c" && env -i PATH="$NP" TMPDIR="$B/tmp-$c/" sh -c "$X" 2>&1)
  W=$(cd "$B/work-$c" && pwd -P)
  case "$run" in "$B/work-$c"/*|"$W"/*) where="INSIDE <work>";; /*) where="outside <work>";; *) where="(no path)";; esac
  [ -d "$run" ] && made="made" || made="NOT made"
  if [ "$d" = '${CLAUDE_PLUGIN_DATA}' ]; then
    un=$(env -i PATH="$NP" sh -c "$(printf '%s' "$X" | sed 's/ && mkdir -p "$RUN"//')" 2>&1)
    echo "  $s: $cmd exit $rc, $gate, cost ${cost:-?}; D=\"$d\" as written; run → $(printf '%s' "$run" | short), $made, $where; TMPDIR unset → $(printf '%s' "$un" | short)"
  else
    [ -z "$DATA" ] && DATA="$d"
    if [ "$d" = "$DATA" ]; then dd="<data>"; rr=$(printf '%s' "$run" | sed "s#^$d#<data>#" | short); else dd=$(printf '%s' "$d" | short); rr=$(printf '%s' "$run" | short); fi
    echo "  $s: $cmd exit $rc, $gate, cost ${cost:-?}; D=\"$dd\"; run → $rr, $made, $where"
  fi
}
data() { [ -n "$DATA" ] && echo "  <data> = $(printf '%s' "$DATA" | short), $( [ -d "$DATA" ] && echo exists || echo absent)"; DATA=""; }
echo "claude: $("$CL" --version 2>&1); copy of plugins/terse = checkout's: $c0"
mk installed
iso installed "$CL" plugin marketplace add "$M" </dev/null >/dev/null 2>&1; a=$?; iso installed "$CL" plugin install terse@nowely </dev/null >/dev/null 2>&1; i=$?
echo "installed (marketplace add <copy> exit $a, plugin install terse@nowely exit $i):"
DATA=""; for s in $PAGES; do page installed "$s" "/terse:$s"; done; data
mk plugindir; echo "plugindir (--plugin-dir <copy>/plugins/terse):"
for s in $PAGES; do page plugindir "$s" "/terse:$s" --plugin-dir "$M/plugins/terse"; done; data
mk skills; echo "skills (<work>/.claude/skills/<name>/SKILL.md, no plugin loader):"
for s in $PAGES; do mkdir -p "$B/work-skills/.claude/skills/$s" && cp "$M/plugins/terse/skills/$s/SKILL.md" "$B/work-skills/.claude/skills/$s/SKILL.md"; page skills "$s" "/$s"; done
n=0; for c in installed plugindir skills; do n=$((n + $(find "$B/work-$c" -mindepth 1 -not -path "$B/work-$c/.claude" -not -path "$B/work-$c/.claude/*" | wc -l))); done
echo "<work> = each load's working directory, for the repository; entries added to the three: $n"
echo "checkout status for plugins/ and .claude-plugin/: [$(git -C "$REPO" status --porcelain -- plugins .claude-plugin | tr '\n' ' ')]"
rm -rf "$B"
