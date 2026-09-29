# Defects found in passing: terse

Recorded per the repository rule: evidence at file:line, an evidence level (1: the line resolves; 2: an
independent reader of the code would say the same; 3: the behaviour was made to happen), and wording that
can become an issue unchanged. An entry leaves when its fix lands and the changelog names it. Ids are
shared with entrust's ledger, `plugins/entrust/ISSUES.md`, so one id names one entry in both. A path
pinned to a commit is that commit's address, with today's beside it.

## E99. On a machine where terse is installed, the trigger suite's control arm cannot be isolated

**Evidence, level 3.** `plugins/terse/evals/clarity-trigger.live.md:51-52`: "Both arms use the ordinary owner profile,
including neighboring skills and user-level `CLAUDE.md`. They differ only in the explicit `--plugin-dir` flag." The
control arm counts only when the skill is absent: `plugins/terse/evals/clarity-trigger.live.mjs:184-185` sets its
isolation to `controlSkillAbsent === true`, and :207 keeps only isolated records. On 2026-09-29 the `ticket-check` case
ran both arms on a machine with terse 0.5.0 installed: all three control sessions loaded the installed terse
(`tersePluginVisible: true`, `controlSkillAbsent: false`, `isolationConfirmed: false`), so the arm counted nothing.

**Check.** On a machine with terse installed, `node evals/clarity-trigger.live.mjs --run --without-plugin --cases
ticket-check --repeat 1 --out "$TMPDIR/blind.jsonl"` records `isolationConfirmed: false`. This spends Claude tokens.

**Issue text.** The control arm runs on the owner's ordinary profile, so wherever terse is installed it loads there
too and every control record fails isolation. The owner's machine, where the suite is run, is such a machine. The
control arm needs the installed terse turned off for its sessions, or the page should say it needs a profile without
terse.
