# Defects found in passing: entrust

Recorded per the repository rule: evidence at file:line, an evidence level (1: the line resolves; 2: an
independent reader of the code would say the same; 3: the behaviour was made to happen), and wording that
can become an issue unchanged. An entry leaves when its fix lands and the changelog names it. Ids are
shared with terse's ledger, `plugins/terse/ISSUES.md`, so one id names one entry in both. A path
pinned to a commit is that commit's address, with today's beside it.

## E51. The experiment page counts "the four registered first" while protocols.md registers five

**Evidence, level 1.**

- `plugins/entrust/plugin/skills/experiment/SKILL.md:19` (at `882bcf3`): "… the four registered first are in
  [protocols.md](references/protocols.md)."
- `plugins/entrust/plugin/skills/experiment/references/protocols.md:3`: "Five experiments the 2026-09-17 research
  round left as hypotheses …", with the headings `## E1` to `## E5` at lines 5, 15, 25, 35 and 45.
- Found in passing twice, independently, by Opus R3 and Fable F1 in the triage run
  `plugins/entrust/research/2026-09-27-field-audit-triage/` (05c-refuter-r3.md, 07b-architect-deltas.md).

**Check.** `grep -n 'four registered first' plugins/entrust/plugin/skills/experiment/SKILL.md; grep -c '^## E[0-9]' plugins/entrust/plugin/skills/experiment/references/protocols.md`
prints line 19 and `5`.

**Issue text.** The experiment skill page tells a coordinator that "the four registered first" protocols are in
protocols.md, and that file registers five, E1 to E5: a reader who counts on the page misses E5, the mixed team on
one deep task. One word on the page, or the count dropped.

## E52. The launcher runs nothing and exits 0 when its own path goes through a symlink

**Evidence, level 3.**

- `plugins/entrust/plugin/skills/codex/scripts/agent-run.mjs:396` (at `e99cdb6`): `const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);` — `path.resolve` keeps the path as typed, `fileURLToPath(import.meta.url)` is the module's real path, so they differ when the typed path crosses a symlink, and every mode of the launcher is skipped.
- 2026-09-27, macOS, where `/var` is a symlink to `/private/var`: `node /var/folders/…/scripts/agent-run.mjs --help` printed 0 lines and exited 0; `node /private/var/folders/…/scripts/agent-run.mjs --help` printed the 57-line help; `--new` through the `/var` path printed no `PROMPT=` line, wrote nothing and exited 0; `driver.mjs --help` through the `/var` path printed its 161 lines, so the driver has no such check.

**Check.** `node <a copy of scripts/ under $TMPDIR, whose path starts with /var/>/agent-run.mjs --help | wc -l` prints `0`; the same through `$(realpath …)` prints `57`.

**Issue text.** The launcher decides whether it was run as a program by comparing the path it was invoked with against its module's real path, so an invocation through a symlink — `$TMPDIR` on macOS, any linked checkout — is a silent no-op with exit 0: no lines, no prompt, no run, and a wrapper told to run the command again "until a result has a REPORT= line" runs it again without end (E53). The comparison should resolve both sides with `fs.realpathSync`, or the launcher should refuse loudly when it is not the main module.

## E53. The wrapper loops without bound on a command that prints nothing

**Evidence, level 3.**

- `plugins/entrust/plugin/agents/codex-agent.md:13-16` and the message block in `plugins/entrust/plugin/skills/codex/SKILL.md` (step 2): "If its result has no REPORT= line — it ends with RUNNING= instead, or it was cut — run the very same command again at once, as many times as needed, until a result has one." No bound, and no rule for a result that is empty.
- 2026-09-27: a wrapper given the launcher through a `/var` path (E52) ran it 64 times over 352 s, then handed back "(no output produced by command after 75+ attempts)"; the harness ended the loop, not the rule.

**Check.** Give the wrapper a command that prints nothing and exits 0 (`true`): step 2 as written never ends.

**Issue text.** The wrapper's rerun rule has no bound and no case for an empty result, so a launcher that prints nothing (E52, or any refusal that reaches neither stdout nor the report) is rerun until the harness gives up, at one tool call every few seconds. The rule should stop after a small fixed number of reruns, and hand back an empty result as its own line, so the coordinator reads the refusal instead of a hung card.
