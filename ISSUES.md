# Defects found in passing

Recorded per the repository rule: evidence at file:line, an evidence level (1: the line resolves; 2: an
independent reader of the code would say the same; 3: the behaviour was made to happen), and wording that
can become an issue unchanged. An entry leaves when its fix lands and the changelog names it.

## E1. The codex page lists three `WEB_SEARCH:` values without saying a device policy may allow only some

**Evidence, level 3.** `plugins/entrust/skills/codex/SKILL.md:191` (at `7e7d9cc`) reads
`| `WEB_SEARCH:` | `cached`, `indexed`, `live` | the agent needs sources it cannot read locally |`. On
2026-09-17 two read agents whose prompt files carried `WEB_SEARCH: live` exited 2 before any turn; the
driver's stderr said: `entrust: --web-search live is not permitted by this device's managed policy, which
allows cached; the server would silently apply one of those and no response field would say so`. Both ran
after the line was changed to `cached` (`research/2026-09-17-orchestration-practices/rounds.md`, the
Planning row).

**Issue text.** The `WEB_SEARCH:` row of the header-fields table names `cached`, `indexed` and `live` as if
all three were always available. On a device whose managed policy allows only `cached`, a prompt file with
`live` is refused with exit 2 before the turn, and the coordinator learns the constraint from stderr after
writing the brief. The row should say that the driver refuses a mode the device policy forbids, name the
stderr line that says which modes are allowed, and name `cached` as the value that runs everywhere.

## E2. `orchestrate.test.mjs` pins none of the rules 0.15.0 added, and F2's "six bullets" is eight on the page

**Evidence, level 3.** On 2026-09-17, against `7e7d9cc`, deleting from the page in memory the bulk-unit
sentence (O L70), "Critique the split" (O L118), "open one return whole" (O L121) and "Prefer Luna" with
"announce its count" (O L68–69), singly and all five together, left all 45 registered cases of
`plugins/entrust/evals/orchestrate.test.mjs` green
(`research/2026-09-17-orchestration-practices/d1-design-v2.md`, §8, `mutation-baseline`); commit
`df8942a` (0.15.0) changed that suite only at its budget number. The case named "F2 the six verification
bullets, one line each" lists six regexes where the page's list has eight bullets (nine after the
2026-09-17 change; F2 pins six, F7 one, the two 0.15.0 bullets none).

**Issue text.** Three rules the 0.15.0 changelog names as that round's result and the Luna-over-Haiku
sentence have no pin, so an edit that drops any of them leaves the suite green. F2 should pin every
bullet of the verification list and say how many there are, and each unpinned sentence should get a
case. The 2026-09-17 change added pins only for its own sentences and the bullets it rewrote.
