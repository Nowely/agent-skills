#!/bin/sh
set -u
printf '%s\n' '$ node --version'
node --version
printf '%s\n' '$ (cd head && node --test)'
(cd head && node --test)
head_status=$?
printf 'head exit: %s\n' "$head_status"
printf '%s\n' '$ (cd mutations/no-automatic-expiry && node --test)'
(cd mutations/no-automatic-expiry && node --test)
auto_status=$?
printf 'no-automatic-expiry exit: %s\n' "$auto_status"
printf '%s\n' '$ (cd mutations/no-cleanup && node --test)'
(cd mutations/no-cleanup && node --test)
cleanup_status=$?
printf 'no-cleanup exit: %s\n' "$cleanup_status"
[ "$head_status" -eq 0 ] && [ "$auto_status" -ne 0 ] && [ "$cleanup_status" -ne 0 ]
