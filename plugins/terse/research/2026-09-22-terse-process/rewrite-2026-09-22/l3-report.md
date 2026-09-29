# Codex report L3

The five fields of the driver report, verbatim. Commands: 27.

## status

done

## result

Codex Astra L3: done, independently reviewed the README, ran isolated probes, then deduplicated against all 46 ledger entries; four additional findings.
CONFIRMED F1 — README:35–49; A/C/E; ADDS TO C18/C19: the advertised GitHub install fetches main at 21a225b, whose rewrite instructions still direct unapproved repository writes. The reviewed checkout repairs those instructions. Check: both exact install commands exited 0; installed rewrite/SKILL.md:66–67,112–113.
CONFIRMED F2 — README:48–49; A/C/E; ADDS TO C20: “no account anywhere” conceals host authentication. Check: isolated unauthenticated installation succeeded, but `claude --bare --print --no-session-persistence 'Say ok'` exited 1: “Not logged in · Please run /login”.
CONFIRMED F3 — README:4–5; A; ADDS TO C02: “every claim” conceals the explicit exclusion of external-tool recipes from the truth ledger. Check: audit/references/truth-pass.md:69–71.
PLAUSIBLE F4 — README:10–12,35–36; A/C/E; ADDS TO C05/C15: re-auditing an external candidate has no specified way to preserve its original reading context. Check: copying this README into a temporary round file changed its relative evidence link from existing to missing; measure.md:49,108 requires repository Markdown and the same entry file.
B: No additional internal contradiction established after deduplication.
PLAUSIBLE D — Weakest: Install, because authentication and delivered behavior differ from the stated readiness promise (F1/F2; C18–C20); What each one does, because its candidate handoff leaves re-audit staging unspecified (F4; C05/C15).
E: A new reader still cannot reliably determine the assumed authentication, installed revision and write boundary, external-recipe coverage, or how to validate a temporary candidate with its links intact (F1–F4).

## evidence

- 14 isolated Claude CLI invocations: 12 exited 0; auth status and the unauthenticated prompt exited 1. All used CLAUDE_CONFIG_DIR under TMPDIR.
- node plugins/terse/skills/rewrite/scripts/selftest.mjs: exit 0; 45 ok checks, 0 MISS checks, observed this turn with Node v24.11.0.
- Installed self-test without Node on PATH: started, exit 127, exact diagnostic “sh: node: command not found\n”. Existing C20/C21 finding excluded from new findings.
- Fetched https://github.com/Nowely/agent-skills.git through the documented install commands. git ls-remote and the fetched marketplace HEAD both identified 21a225b12f15221f978492718ecdc00eb7ea5924.
- Candidate probe: 2 link resolutions, 1 existing and 1 missing. Ledger comparison: 46 unique entries. Final git status --porcelain: exit 0, empty output.

## artifacts

- $TMPDIR/terse-astra-l3.Oa7q4P/findings.md

## open

- Paid model workflows and actual execution of the published write instructions were not run; runtime obedience is unknown.
- Actual candidate-staging behavior is unknown; F4 remains PLAUSIBLE.
- Alternative-provider authentication and the Node 22 minimum were not tested.
- The checkout contains seven matching .mjs scripts; the identity of the assignment's eighth script is unknown.
