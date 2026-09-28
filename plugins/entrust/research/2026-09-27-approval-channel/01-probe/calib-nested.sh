#!/bin/sh
# Does codex's seatbelt profile (entrust_read) refuse a nested sandbox-exec? No model call.
D=${TMPDIR:-/tmp}/entrust-p1.54JBSVGo09
export CODEX_HOME="$D/home-dry"
codex sandbox -c 'permissions.entrust_read.extends=":read-only"' \
  -c 'permissions.entrust_read.filesystem={":tmpdir"="write"}' \
  -c 'permissions.entrust_read.network={enabled=true}' \
  -c 'default_permissions="entrust_read"' \
  -P entrust_read -C "$D/scratch-q12" -- \
  /bin/sh -c '/usr/bin/sandbox-exec -p "(version 1)(allow default)" /usr/bin/true; echo nested=$?; touch /tmp/entrust-calib-probe; echo touch=$?'
echo codex-sandbox-exit=$?
ls -la /tmp/entrust-calib-probe 2>&1
