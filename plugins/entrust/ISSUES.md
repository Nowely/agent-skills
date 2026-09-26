# Defects found in passing: entrust

Recorded per the repository rule: evidence at file:line, an evidence level (1: the line resolves; 2: an
independent reader of the code would say the same; 3: the behaviour was made to happen), and wording that
can become an issue unchanged. An entry leaves when its fix lands and the changelog names it. Ids are
shared with terse's ledger, `plugins/terse/ISSUES.md`, so one id names one entry in both. A path
pinned to a commit is that commit's address, with today's beside it.

## E44. The lock's update and release check the owner and then act on the shared pathname, so a peer's lock written between the two steps is what they rename or unlink

**Evidence, level 3 on an instrumented copy; the CI failure itself was not reproduced.**

- CI run 34710644138 (3960788, macOS, Node 22) failed `plugins/entrust/evals/lock.test.mjs:142`, "a run releases only
  the lock it owns", with "releaseLock removed or changed the peer's replacement lock". The second case this entry once
  named, "two concurrent runs: exactly one wins", was a race in the case itself: two fast turns could run one after the
  other and both exit 0; it holds one run in a slow turn since 2026-09-27 and is out of this entry.
- `plugins/entrust/plugin/skills/codex/scripts/driver.mjs`, `updateLock` (1561 at `b3872b4`) and `releaseLock` (1581):
  each reads the lock's ownership and then renames or unlinks the shared pathname as a second step, and the comment at
  1555-1560 names the gap (Codex Sol R1, reading, 2026-09-26; 40 runs of the unmodified case at concurrency 4 on this
  machine did not fail).
- 2026-09-27, Codex Astra A2, on a copy of the driver under `$TMPDIR` with a pause inserted after the final ownership
  read and a second process replacing the lock during the pause: 10 of 10 update runs and 10 of 10 release runs failed
  with the case's own assertion text.
- A2's fix, a 163-line diff kept at `$TMPDIR/entrust-a2-b3872b4/driver-owner-lock.diff` with its report beside it: the
  lock becomes an owner-unique 0600 file published through an exclusively created symlink at the shared pathname, and
  update and release address the owner file alone; 20 of 20 instrumented runs pass with it, and the dead-owner reclaim
  survives. It leaves the reclaim-marker protocol's own read-and-unlink ordering as it is (A2's open item). Its cost, measured: the on-disk shape changes, and a driver of the current version that meets the new pointer
  in a shared state directory exits 2 with "is a symbolic link, not a lock file; remove it and retry"; the case at
  `lock.test.mjs:188` asserts the opposite guarantee ("a lock carrying this run's own pid and no identity outlived the
  run that owned it") and changes with it.

**Check.** The copy, the scripts and the diff were kept under the run's temporary directory on 2026-09-27
(`$TMPDIR/entrust-a2-b3872b4/`, which macOS purges after days of disuse; they go under `research/` on the owner's word). To
repeat without them: copy the driver, insert a pause after the final ownership read in `updateLock` and `releaseLock`,
replace the lock from a second process during the pause, and run the case: its assertion fires. With the directory present, `A2=$TMPDIR/entrust-a2-b3872b4`: `python3 "$A2/run.py" observe-before node "$A2/observe.mjs" "$A2/observe" 10`
prints 20 runs and 20 failures against the unmodified copy; `python3 "$A2/run.py" observe-final node "$A2/observe.mjs" "$A2/fixed-observe" 10`
prints 20 passed against the fixed one; `git apply --check "$A2/driver-owner-lock.diff"` succeeds on `b3872b4`.

**Issue text.** The lock's release and update check who owns the lock and then act on the shared pathname, so a peer
that replaced the lock between the two steps loses it: proven on an instrumented copy, seen once on CI. The fix on
hand changes the lock's on-disk shape to an owner-unique file behind an atomic pointer, which a driver of the current
version refuses when it meets it in a shared state directory, so it needs a coordinated upgrade and its own release
note, and one existing case's contract changes with it. That is a decision to make, not a fix in passing: take the
diff, or keep the shape and accept the window.

## E46. `managedWebSearchModes` reads a policy file that is not a plist as "no policy", where its own contract says a malformed policy fails closed

**Evidence, level 3.**

- `plugins/entrust/plugin/skills/codex/scripts/driver.mjs`, function `managedWebSearchModes` (at branch
  `entrust-issues-2026-09-26`, line 1171; at `b3872b4` the same body sits at 1156-1178). The comment above it:
  "An unreadable or malformed policy must fail closed." Its first branch after `plutil`:
  `if (r.status !== 0) return /does not exist|Could not extract/i.test(String(r.stderr ?? "")) ? null : undefined;`,
  where `null` means "no policy narrows the modes" and `undefined` means "unreadable, refuse".
- 2026-09-26, found by Opus W2 and re-run by the coordinator: `plutil -extract requirements_toml_base64 raw -o - <file>`
  on a file holding the word `garbage` exits 1 with
  `Could not extract value, error: No value at that key path or invalid key path: requirements_toml_base64`,
  which the regex matches, so the function returns `null` and a `WEB_SEARCH: live` prompt passes on a device
  whose policy file cannot be read.

**Check.** `echo garbage > "$TMPDIR/x.plist"; plutil -extract requirements_toml_base64 raw -o - "$TMPDIR/x.plist"; echo $?`
prints the "Could not extract value" line and `1`; `node -e 'console.log(/does not exist|Could not extract/i.test("Could not extract value, error: No value"))'`
prints `true`.

**Issue text.** The managed-policy reader treats every `plutil` failure whose message says "Could not extract" as
"the key is absent", and `plutil` says that for a file that is not a plist at all, so a corrupt or truncated policy
file opens every web-search mode instead of refusing them, against the comment two lines above. The reader should
tell a missing key from an unreadable file: check the file parses first (`plutil -lint`), or match the "no such key"
wording alone, and return `undefined` for everything else.

## E47. A `--run` given another report path appends its refusal to an in-flight directory's `err.txt`, and the rightful run then reads `PATH=none`

**Evidence, level 2 (read by Opus W1 on 2026-09-27, not run).**

- `plugins/entrust/plugin/skills/codex/scripts/agent-run.mjs` (branch `entrust-issues-2026-09-26`): a `--run` whose
  `--report-file` differs from the one the directory was made for refuses with "another report path" and appends a
  `REFUSED` line to the directory's `err.txt`. The status lines of every call are read back from that file, so while
  the rightful run is still in flight, its own call, and the rerun after the early return, find the appended line and
  print `PATH=none` for a run that published to its own path.
- The case at `plugins/entrust/evals/agent-run.test.mjs` "--run refuses a directory that ran for another report path"
  covers a directory whose run has ended (the marker present), not one still running.

**Check.** Start a run on the slow scenario, and while its marker is absent run the launcher on the same directory with
`--report-file <other>`; then let the first finish and read its lines: `PATH=none` where `PATH=own` is due.

**Issue text.** A launcher call that refuses a directory for naming another report path writes its refusal into that
directory's `err.txt`, which the rightful run's status lines are read from, so a stray call during a run turns the
run's own `PATH=own` into `PATH=none`. The refusal should go to the caller alone, or the reader should take the driver's
lines and ignore a launcher refusal that names another path.

## E48. The fake server's `slow-turn` scenario ignores an interrupt, so a case that interrupts it sees the timer win

**Evidence, level 2 (Fable D1, 2026-09-27, reading).**

- `plugins/entrust/evals/fake-app-server.mjs:1034`: `slow-turn` answers `turn/start` with a 1200 ms timer and completes
  when it fires, with no check of `turn/interrupt`; `idle-silence` (`fake-app-server.mjs:359-361`) closes on the
  interrupt. A case that signals during a slow turn reports `completed` whenever the timer wins the race, which is
  what E43 measured on CI.

**Check.** `grep -n 'case "slow-turn"' -A3 plugins/entrust/evals/fake-app-server.mjs` shows the timer and no interrupt
handling; the same grep for `idle-silence` shows the close on interrupt.

**Issue text.** The fixture's slow turn cannot be interrupted, so a case that interrupts it races the timer and passes
or fails by the machine's speed. Either the scenario ends on `turn/interrupt` like `idle-silence`, or its name says it
cannot be interrupted and no interrupt case is written against it.

## E49. A `protocol` case fails on CI now and then: the driver cut at `--timeout 0.25` exits 3 and prints no JSON report

**Evidence, level 3 for the failure; no cause established.**

- `plugins/entrust/evals/protocol.test.mjs:97`, `stalled-turn --timeout 0.25 --verify true`, failed CI run 36278638362, job
  108506115593 (PR #23, macOS, Node 24) with "exit 3 correct, but the report is wrong: expected a JSON report, but stdout
  was not JSON [no JSON report: ; stderr: entrust: pid=24463 …]", 1 of 147; the same commit passed the case on the
  other three legs and on the job's rerun, and the three green runs of main before it (36251602999, 36257762767,
  36268663359) show no such failure. That leg's job took 6 min 7 s against 4 min 58 s for its Node 22 twin.

**Check.** `gh run view 36278638362 --repo Nowely/agent-skills --job 108506115593 --log-failed | grep 'FAIL  stalled-turn'`
prints the failure; the rerun of the same job prints none.

**Issue text.** With the turn budget at 250 ms, a driver on a loaded runner exits 3 as the case expects and publishes
no report, so the exit code is right and the file the coordinator reads is missing. Either the driver still owes a
report on that path and does not write it, or the case's budget is too tight for a cold start on a slow runner; which
it is has not been established. Until it is, a red main on this case cannot be read.
