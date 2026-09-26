#!/bin/sh
# Round 03, G3b and the installed run path: where the audit page's run-directory line (audit/SKILL.md:33)
# lands as Claude Code hands the page to the model, in three loads, each in a Claude configuration
# isolated under this probe directory; then the line itself run by the shell. The page as the model
# received it is read from the session record Claude Code writes under the isolated configuration.
# No sign-in: the gate stops before any invocation unless the isolated configuration reports
# "loggedIn": false, so nothing reaches a model (each invocation exits 1, "Not logged in").
# `env -i` keeps this session's variables out.
set -u
P=/var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T//terse/runs/20260922-233021-terse-readme/probe-03
REPO=/Users/ruliny/Git/agent-skills
CL=/Users/ruliny/.nvm/versions/node/v24.11.0/lib/node_modules/@anthropic-ai/claude-code/bin/claude.exe
iso() { c="$1"; shift; env -i HOME="$P/home-$c" PATH=/usr/bin:/bin:/usr/sbin:/sbin TMPDIR="$P/tmp-$c/" CLAUDE_CONFIG_DIR="$P/config-$c" "$@"; }
reset() { for d in "$P/config-$1" "$P/home-$1" "$P/tmp-$1" "$P/work-$1"; do case "$d" in "$P"/*) rm -rf "$d"; mkdir -p "$d";; *) echo "refused: $d outside the probe dir"; exit 9;; esac; done; }
gate() { if iso "$1" "$CL" auth status 2>&1 | grep -q '"loggedIn": false'; then echo "$1: isolated configuration not logged in"; else echo "$1: logged in or unknown, stopping before any invocation"; exit 8; fi; }
invoke() { c="$1"; shift; out=$(cd "$P/work-$c" && iso "$c" "$CL" -p "$@" --output-format stream-json --verbose < /dev/null 2>&1); rc=$?
  echo "$c: $1 exit $rc, $(printf '%s' "$out" | grep -o 'Not logged in[^"]*' | head -1), cost $(printf '%s' "$out" | grep -o '"total_cost_usd":[0-9.]*' | head -1 | cut -d: -f2)"; }
seen() { l=$(cat "$P/config-$1"/projects/*/*.jsonl 2>/dev/null | grep -o 'D=\\"[^;]*;' | head -1 | sed 's/\\"/"/g; s#/var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/*terse/runs/20260922-233021-terse-readme/probe-03#<probe>#g'); echo "$1: the page's line as received begins ${l:-(not found)}"; }
dir() { echo "$1: $2 $( [ -d "$P/config-$1/plugins/data/$2" ] && echo exists || echo absent)"; }
# 1. Installed from this checkout's marketplace.
reset installed; gate installed
(cd "$P/work-installed" && iso installed "$CL" plugin marketplace add "$REPO" >/dev/null 2>&1; echo "installed: marketplace add exit $?")
(cd "$P/work-installed" && iso installed "$CL" plugin install terse@nowely >/dev/null 2>&1; echo "installed: install exit $?")
invoke installed "/terse:audit"; seen installed; dir installed terse-nowely
# 2. The checkout loaded for one session with --plugin-dir.
reset plugindir; gate plugindir
invoke plugindir "/terse:audit" --plugin-dir "$REPO/plugins/terse"; seen plugindir; dir plugindir terse-inline
# 3. The page copied into a project's .claude/skills, no plugin loader.
reset skills; gate skills
mkdir -p "$P/work-skills/.claude/skills/audit" && cp "$REPO/plugins/terse/skills/audit/SKILL.md" "$P/work-skills/.claude/skills/audit/SKILL.md"
invoke skills "/audit"; seen skills
# 4. The line itself, as the shell runs it.
reset formula
L=$(sed -n '33p' "$REPO/plugins/terse/skills/audit/SKILL.md")
echo "formula, no data directory, TMPDIR set: $(env -i PATH=/usr/bin:/bin TMPDIR="$P/tmp-formula" sh -c "$L" | sed "s#$P#<probe>#g; s#[0-9]\{8\}-[0-9]\{6\}#<stamp>#")"
echo "formula, no data directory, TMPDIR unset: $(env -i PATH=/usr/bin:/bin sh -c "$(printf '%s' "$L" | sed 's/ \&\& mkdir -p "\$RUN"//')" | sed "s#[0-9]\{8\}-[0-9]\{6\}#<stamp>#")"
echo "formula, data directory written in: $(env -i PATH=/usr/bin:/bin TMPDIR="$P/tmp-formula" sh -c "$(printf '%s' "$L" | sed "s#\${CLAUDE_PLUGIN_DATA}#$P/data-formula#")" | sed "s#$P#<probe>#g; s#[0-9]\{8\}-[0-9]\{6\}#<stamp>#")"
