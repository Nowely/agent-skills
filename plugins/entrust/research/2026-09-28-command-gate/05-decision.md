# Command gate: the design the round settles on

The coordinator's synthesis of [03-design-v2.md](03-design-v2.md) with the verifications
[04-verify-c1.md](04-verify-c1.md) and [04-verify-c2.md](04-verify-c2.md) folded in. Nothing here is implemented;
it waits for the owner's word.

## The shape

The sandbox holds what a Codex agent does on its own. A command the sandbox refuses reaches the coordinator as an
escape request; the coordinator reads it whole, decides under the orchestrate page's rule, and an accept restates
the command, so the auto-mode classifier judges the command's text and not a request id. The server then runs it
as the user, as in the terminal, under the driver's cut, signal and report. Nothing names a tool, a path of a
tool's state or a cache.

## Step 1: the subtraction (one commit, releasable alone)

- The widening layer of 0.21.0 goes whole: v2 §2's list, plus what the verifications add: `serverWarnings` and the
  report's `experimentalApi` field, both added by 0.21.0 for the features alone (driver.mjs:3896-3897 says so);
  the launcher's `FILES=` and `KIND=`, constant once the mailbox carries escapes only; the permissions branch of
  `requestLines`; the test ranges C2 lists (agent-run.test.mjs:1115-1165, protocol.test.mjs:693-714 and
  :1159-1190, agent-contract.test.mjs:427).
- `experimentalApi` goes back to `false`; measured safe at read level on 0.155.1 (C2's handshake); worktree and
  write level are to be checked by the suites' live fidelity turn.
- A file change the driver cannot show to lie inside the writable roots is declined at once, not offered; its
  reason says "not shown to lie inside the writable roots" and names `WRITABLE:`; the codex page's rights row says
  it is exit 6. Zero of 37 historical requests were of this kind.
- The `item/permissions/requestApproval` row of `REFUSALS` stays: a server that sends one anyway is refused and
  recorded.
- E77's cause is gone; its ledger entry leaves with the changelog line.

## Step 2: the restated accept (second commit)

- `--decide ID --accept` reads the command on stdin, between the fresh token `--pending` printed for that request
  (`COMMAND<<TOKEN` … `COMMAND>>TOKEN`), never a fixed word: a model-written line equal to a fixed delimiter ends
  the heredoc and runs the rest in the coordinator's shell before any comparison (made to happen by both critics).
- The comparison is exact against the request record's `command`, one trailing newline tolerated and nothing
  normalised; a mismatch is refused and publishes nothing. A decline takes no restatement.
- The coordinator copies the command from `--pending`'s print, not from the wrapper's relay of it.
- A page sentence: an accept the classifier blocks publishes nothing, so the coordinator declines the request
  with `--decide ID --decline`, or asks the owner when the session is interactive; otherwise the turn waits out the
  thirty minutes.
- The codex page's line that Stop reaches an accepted command through the driver is reconciled with its own E67
  lines.

## What stays, and why

`--decide`, the mailbox, the keeper's hand-back and the thirty-minute expiry are each still needed: the escape's
accept or decline, the only channel from a detached driver, the only signal in foreground and headless sessions,
and the only end of an abandoned request (C2, verification §2).

## What must be measured

1. The classifier on one restated accept in a live run, after the delimiter fix: through, or blocked and then
   declined. Whether it judges the heredoc's command or treats a node call with stdin as opaque is the one parity
   question Y leaves (C1).
2. The live gate: one Codex Luna read agent through the real driver and wrapper on a toy tool that the sandbox
   refuses, accepted through the restated accept.
3. arc through the escape only with the owner's word: arc's cache is in the state the incident left.

## Held: the client-run tool with the coordinator executing

[03-design-v2.md](03-design-v2.md) §4 stays designed with every fix. It costs the coordinator the same turn per
refused command, adds an experimental protocol field and hundreds of lines, and its one gain, the owner's
`Bash(...)` rules matching a Codex command, needs a line that begins with a grouping the matcher is unlikely to
see through. It is worth reopening only if a measurement shows the matcher does, and the owner wants rule-governed
silence for Codex commands in default mode.

## Open, outside this design

- In default permission mode no rule allows the launcher on this machine, so `--run` and every accept prompt; the
  plugin never adds allow rules on the owner's behalf (C2 N5).
- A long silent accepted command may trip the idle guard with output deltas opted out (v2 §3.5, level 2); for the
  ledger.
