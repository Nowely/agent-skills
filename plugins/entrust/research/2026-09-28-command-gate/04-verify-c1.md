# Verify C1 — design v2, safety and parity (Opus C1, round two)

Read whole: 03-design-v2.md; re-read driver.mjs request path, agent-run.mjs decide path, both SKILL.md
pages; compared stable vs `--experimental` `CommandExecutionRequestApprovalParams`. Local checks under
`$TMPDIR/command-gate/c1v2/`. No Codex turn, no VCS client, no writes outside `$TMPDIR`.

## Q1 — dispositions of my ten findings

All ten dispositions are sound and, where accepted/merged, close the finding — with one exception that
the accepted fix RE-OPENS on the recommended path (NF1 below, the mirror of my F7a).

- **F1** — A for X (uninformative refusal, cap=3, reject text-memory) and M for Y with C2 F12. Sound. Under
  Y the escape's decline is decision-only (`REFUSALS["item/commandExecution/requestApproval"] =
  {decision:"decline"}`, driver.mjs:3599), so no rule leaks to the model, and a human coordinator gates each
  re-ask; corpus max 2. Cap-of-3 for X rests on two data points (their §7.5), acceptable as a stop-loop, not
  a security bound. Residual: "decline carries no text" assumes the server synthesises no reason of its own
  — level 2, worth one probe, not a hole.
- **F2** — A both ways (two hazard sentences kept/moved), read-level-only registration for X (§7.4 = no).
  Closes it. For Y the escape keeps its reader (the orchestrate Approvals paragraph stays, §3.2), so the
  "deleted reader" of v1 is undone. Correct.
- **F3** — A for X (offer only when `cause: sandbox`, the test at driver.mjs:3662-3666); Y relies on the
  coordinator reading `CAUSE=`. `cause` survives the subtraction (`failedAttempts`/`attemptKey`/
  `commandTexts` at :3142-3147, :3855 are not in the removal list). Sound.
- **F4** — A both ways, rights row reworded to the truth. Closes it; reword is accurate.
- **F5** — A for X (M2 both directions, a gate on X); moot for Y (rules never apply). Correct — see the
  parity caveat under Q2.
- **F6** — A by removal for X (`cwd` leaves the schema; cwd from the driver's record single-quoted; the
  command is raw shell code inside the subshell, judged by the gate — that is X's model, not a leak). Sound.
  Note the Y analogue is NOT closed: see NF1.
- **F7** — A(a) fresh token on X's `RUN` block; R(b) newline refusal, because multi-line commands are real
  (v2check confirms grouping captures them). Sound — and the accepted (a) is exactly the discipline the
  recommended Y path drops (NF1).
- **F8** — A (M4 before X; under Y one classifier call, §3.7) and a page sentence for bypassed-permission
  sessions. Sound as far as it goes; the bypassed-permissions case makes NF1 unmitigated (no classifier, no
  reader of the hidden line).
- **F9** — M with C2 F6; n/a for Y (instant decision). Correct.
- **F10a** — A by removal for X (no file; output pipes into `--answer` stdin; the mailbox write is a
  subprocess handed the path, inside the state dir). Closes the planted-symlink hole. F10b/c/d — A, sound
  (`by: session`; `--answer` refuses a non-tool id; no path argument).

I found no disposition whose stated reason is unsound.

## Q2 — is Y sound?

### NF1 (new, HIGH) — the restated-accept heredoc uses a FIXED delimiter; model-authored command bytes can end it early and inject code into the coordinator's un-sandboxed shell

Scenario. A sandboxed read-level agent re-issues, with `require_escalated`, a command whose stored bytes
(`record.command`, the server's `/bin/zsh -lc '…'` string, whose inner text the model authored and which may
contain newlines) include a line that is exactly `COMMAND`, followed by a payload. The coordinator reads the
block — a multi-line command, which the design deliberately permits (F7b rejected) — judges it in-plan
enough to accept, and composes the accept exactly as §3.1 prescribes:

    node "<launcher>" --decide <id> --accept --report-file "<REPORT>" <<'COMMAND'
    <the printed bytes>
    COMMAND

The embedded `COMMAND` line terminates the heredoc; every byte after it is parsed by the coordinator's own
shell and runs there — unsandboxed, and BEFORE the launcher ever reads stdin. The launcher's stdin/record
comparison (§3.1, the design's whole safety argument for the restatement) is downstream of the shell parse:
it will later see a truncated stdin, print `REFUSED=<id> the restated command differs`, and exit — but the
injected payload has already executed in the main session. In a permissions-bypassed session (F8's own case)
there is no classifier either, so the hidden `COMMAND` line runs with nothing between it and the shell.

Evidence. Local check `$TMPDIR/command-gate/c1v2/accept.sh` (level 3): a block whose body carries a bare
`COMMAND` line plus `touch pwned.marker`, pasted into `<<'COMMAND' … COMMAND`, created the marker while the
stdin reader saw only the pre-delimiter bytes. Design §3.1 shows the literal `<<'COMMAND'` delimiter. The
model authors the command bytes (driver.mjs:3855 records what failed; the inner of `/bin/zsh -lc '…'` is the
model's). The read path already defends against exactly this with a fresh per-print token absent from the
command (`requestLines`/`--pending`, agent-run.mjs:612-615; my F7a, ACCEPTED for X) — the discipline was not
carried to Y's accept.

Smallest fix. Draw a fresh random delimiter token in the same hand-back that prints the `COMMAND<<TOKEN`
block, print an `ACCEPT<<TOKEN` line the coordinator copies verbatim into `<<'TOKEN'`, and have the launcher
refuse a command that contains the token (as `--pending` already redraws until the token is absent). Or
drop the heredoc entirely: the launcher already holds `record.command`; the coordinator confirms by id +
a short digest the hand-back prints, and the launcher passes the recorded bytes to the classifier's view by
its own single-quoted argv (`'`-doubled) rather than through a shell-parsed heredoc. Either removes the
model's bytes from the coordinator's shell-parse surface, which is what F6/F7 already established for X.

### NF2 (small) — the stdin/record comparison must be exact, not normalised

§3.1 tolerates "a trailing newline." If implemented as a two-sided trim or any whitespace normalisation, the
classifier could judge one text while the server runs a different stored `record.command` (what runs on
accept is always the server's stored command, driver.mjs sends only `{decision:"accept"}`; stdin never
runs). Keep the tolerance to a single trailing `\n` on the stdin side only; anything looser breaks the "the
classifier judged what runs" claim. Level 2 (design states the tolerance; implementation unspecified).

### Parity caveat (not a finding; reinforces §3.7 as load-bearing)

Y's parity is "the classifier, maybe, on wrapped text; never the owner's rules." The classifier judges
`node agent-run.mjs --decide … <<'…' vcs status …` — a node invocation with the command as heredoc DATA, not
a Bash call whose program is `vcs`. Whether the classifier extracts and authorises the embedded command or
treats node-with-stdin as opaque (the very opacity §3.3 of v1 ascribed to `--decide <id>`) is the one thing
§3.7 measures and is unmeasured. The design is honest that rules never apply (§3.4) and marks this the sole
open measurement, so it is not a defect — but the whole parity claim for Y rests on that single call, and
NF1 must be fixed before it, or the measured call will itself carry the injection surface.

### Subtraction vs Y's needs — checked, holds

Y needs the escape handling, the mailbox, `--decide`/`--pending`/`--run`, and `cause` (sandbox vs policy).
None is in the removal list; `cause` and `failedAttempts` survive. `experimentalApi` → false does not remove
anything Y uses (Y needs no `additionalPermissions`); C2's handshake (their claim, level 3) shows the
sandbox assertions still hold without it. No guard Y needs is subtracted.

## Verdict

Q1: all ten dispositions sound. Q2: Y is sound in its channel and lifecycle EXCEPT NF1, a code-injection
path into the coordinator's own shell via the fixed heredoc delimiter — the mirror of the F7a fix that was
applied to X but not to Y. Fix NF1 (fresh-token delimiter or drop the heredoc) and NF2 (exact comparison)
and Y is clean under this lens; the residual parity question is the one classifier call the design already
schedules.
