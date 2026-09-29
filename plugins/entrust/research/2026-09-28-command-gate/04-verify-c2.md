# 04 — verification C2 (Opus): design v2, lens simplicity, lifecycle, what the owner lives with

Under review: 03-design-v2.md. Worktree `entrust-approval-rules`. Evidence levels: 1 the line resolves,
2 an independent reader would say the same, 3 made to happen. My checks are under
`$TMPDIR/command-gate/c2v2/`. No Codex turn, no VCS client, nothing written outside `$TMPDIR`.

## Answer

1. v2's dispositions of my twelve findings are right. Two need more work:
   - F9: the subtraction list is still incomplete for Y's own change, and it keeps `serverWarnings`
     for a reason that applied only to X.
   - F11: the change under-states what it touches, and its `why` text is false for a case the suites
     already cover.
2. Y is the simplest shape the principle allows, once one new defect is fixed:
   - N1: the fixed `COMMAND` heredoc delimiter lets an agent's command run lines in the coordinator's
     shell (level 3).
   - Also: the fields that only the widening needed are removed (N3), and one page sentence is added
     for a blocked accept (N2).
   - `--decide`, the mailbox, the keeper hand-back and the 30-minute expiry are each still needed
     (§3 below).

## 1. My twelve findings under v2

| # | v2 disposition | Verdict |
| --- | --- | --- |
| F1 wrapper as executor | A: withdrawn | Right, closed. Under Y the accepted command runs in the server, and the wrapper stays a stateless relay. |
| F2 poll and `--decide` wedge | A | Right, closed. Under Y, `ASK=` stays the trigger for an escape, as in 0.21.0. |
| F3 coordinator as executor | A as X's shape, then weighed against Y | Sound, and I concede the recommendation. X costs the same coordinator turn as Y. The restated accept gives the classifier the same text, bound by the launcher's comparison, while the command stays under the driver. My F3 did not draw that consequence. |
| F4 the line's composition | A, extended with a subshell and a pipe (X only) | Right for X, moot under Y. Residual for X, if it is ever built (level 2): with a pipe, a `--answer` that refuses early (a settled id, a non-tool id) SIGPIPEs the user's command midway, so `--answer` must drain stdin before it refuses. |
| F5 the instruction | A; Y ships no sentence | Right, closed. The pre-0.21.0 driver's standing rules had no escape sentence, only "If a command cannot run, record it…" (`git show 9c8a9c9^:…/driver.mjs`, developerInstructions; c2v2/driver-pre021.mjs), and all 27 escapes in the corpus arrived under it. |
| F6 expiry and late answers | A for X; Y n/a | Right, closed. Under Y an accept published after expiry prints `LATE=… nothing ran on this decision` (agent-run.mjs `decideRequest`, the LATE branch), and the escape's runtime belongs to the server. |
| F7 `cd` plus redirect | A for X; moot under Y | Right. |
| F8 wrapper rules against the line | moot | Right, closed. |
| F9 subtraction list | A: list extended, `serverWarnings` stays | Partly. My reason to keep `serverWarnings` was X's experimental field drifting, and under Y there is no experimental surface. `serverWarnings` and the report's `experimentalApi` field were both added by 0.21.0 for the features: at `9c8a9c9^` the driver has neither in its report (`git grep`), and the code comment at driver.mjs:3896-3897 gives the features as its only reason. Under Y remove both, or write a reason that stands without the features. Also missing are the file-change surfaces of F11 below. |
| F10 size | A | Right. |
| F11 decline a file change outside the roots at once | A, both ways | Right in direction, with three gaps. (a) The `why` text "outside the writable roots" is false for a file change the driver could not place: no item/started, or a link. Today such a change is offered with `cause: outside` (protocol.test.mjs:1159-1190). Use the suites' own wording, "not shown to lie inside the writable roots" (agent-contract.test.mjs:427). (b) Not listed: the launcher's `FILES=` branch (agent-run.mjs:609), agent-run.test.mjs:1115-1165, protocol.test.mjs:693-714 and :1159-1190, agent-contract.test.mjs:427. (c) Exit 6 now fires on every such decline (driver.mjs:290-292: any decision other than accepted). That is consistent with the ladder, but the rights row should say it. RECEIPT's `approvals=` does not count these declines, since a driver-side decline writes no request file (driver.mjs:3677-3678). That is fine, because nothing ran. |
| F12 re-wrapped retry | M into the cap (X); Y: the coordinator declines each | Right. |

## 2. New findings on Y

### N1 — The fixed heredoc delimiter lets the agent's command run in the coordinator's shell (level 3, high)
§3.1's accept is `node … --decide <id> --accept … <<'COMMAND'`, followed by the restated bytes and a
`COMMAND` line. The bytes are the agent's. If the command holds a line that is exactly `COMMAND`, the
heredoc ends there, and every line after it runs in the coordinator's Bash as the user. That happens
before the launcher sees stdin and refuses the mismatch.

The `--new` heredoc it copies (`<<'PROMPT'`) is safe only because the coordinator writes that text
itself. The hand-back's own block already solves this: it prints a fresh token that is absent from the
command, "so no command can end its own block" (agent-run.mjs:585-588, :614).

Check `c2v2/heredoc2.sh`: a server string `/bin/zsh -lc "cat <<COMMAND⏎x⏎COMMAND⏎echo INJECTED > flag #'"`.
Restated in §3.1's shape, under both zsh and bash, the launcher received 30 bytes and `flag` was
written. With the block's token as the delimiter, the launcher received 165 bytes and no flag.

Smallest change, zero code: the accept's heredoc delimiter is the token of the print the coordinator
copies from, `<<'<TOKEN>'`. Every print's token is absent from the command.

### N2 — A blocked accept is not a decline, and the page has no rule for it (level 1/2, medium)
§3.7 says "blocked is a decline the page already records." A classifier block on the `--decide` call
publishes nothing (decideRequest never runs). The request stays pending, the idle guard stays paused
(driver.mjs:146, :538), and the turn waits until the 30-minute expiry. No page sentence covers this.

The restatement adds a second fail-closed path: a mismatch. The hand-back is Haiku's copy, and a long
command with a tab or trailing space can differ from the record.

Smallest change, one sentence: a blocked accept is declined with `--decide ID --decline` and named in
the synthesis (or taken to the owner in an interactive session). A `REFUSED=… differs` means restate from
`--pending`, the launcher's own print.

### N3 — Under Y some kept fields have one value or are dead (level 1, low, simplicity)
With file changes declined at once, the mailbox carries escapes only. As a result:
- `METHOD=` and `KIND=` in every block are constant.
- `FILES=` (agent-run.mjs:609) and the permissions branch of `requestLines` are dead.
- The report's `experimentalApi` is always false, and `serverWarnings` has lost its reason (F9).

Smallest change: remove these, which adds lines to step 1's "out" column and none to its "in".

### N4 — "Stop reaches it through the driver" overstates the lifecycle (level 1 against the page, low)
§3.5 and §5's "under the driver's cut, signal and report" contradict the codex page's own sentences.
The page says a command still running in its own process group "is not established to end with it
(E67)", and "an accepted command can outlive the agent, its server and this lock"
(codex/SKILL.md:99-101). The repository's rule makes a lifecycle claim level 3 or a guess. Smallest
change: say that Stop reaches the driver and the server's group, and that the accepted command is E67.

### N5 — The default-mode prompt on the accept depends on the owner never allowing the launcher (hypothesis, low)
§3.3 and §3.4 count "the owner prompt in default mode on the accept call" as parity kept. The
precondition holds on this machine today: no rule in ~/.claude/settings.json matches `agent-run.mjs`.
Under it, default mode already prompts on every wrapper `--run` too. But one "don't ask again" on any
launcher prompt could allow the launcher's prefix and make every future accept silent, whatever the
command. That is unmeasured: it depends on the rule Claude Code proposes for an env-prefixed `node`
line. Smallest change: none now. Measure it with §3.7's call, and state the precondition on the page.

## 3. Is each piece still needed under Y?

| Piece | Needed? | Why (evidence) |
| --- | --- | --- |
| `--decide` | yes | The escape needs an accept or a decline from the coordinator, and the restated accept is its one addition. |
| mailbox | yes | It is the only channel between a driver running under a detached keeper and the coordinator. `ASK=` polls it. |
| keeper hand-back (waiting result) | yes | A foreground or headless coordinator learns of a request only from it; the orchestrate poll serves background agents only. |
| 30-minute expiry | yes | The default `timeout` is 0 (driver.mjs:884), and the idle guard is paused while a request is open (:146, :538, :3207). Without the expiry, an abandoned request holds the run and the Codex turn forever. Under Y it bounds only the wait for a decision (F6). |
| restated accept | yes, as the one addition | It passes the Flags rule as §3.1 states it, and binds the text the classifier judges to what runs. Only with N1 fixed. |

## 4. `experimentalApi` back to false, and the file-change decline

- Schema, 0.155.1 stable against `--experimental`: the only experimental-only command-approval fields
  are `additionalPermissions` and `availableDecisions`. The driver reads neither outside comments
  (driver.mjs:3304, :3596). File-change params are identical in both. Every server notification is in
  the stable set, including `warning` and `serverRequest/resolved`. `optOutNotificationMethods` is
  stable.
- Handshake, level 3 at read level only: `activePermissionProfile` and `runtimeWorkspaceRoots` arrive with
  `experimentalApi` false (c2/hs.mjs).
- Before 0.21.0 the driver ran with `experimentalApi: false`, and fidelity.test asserted false
  (`9c8a9c9^`).
- Suites to flip: fidelity.test.mjs:363, and protocol.test.mjs:718-787 (the features blocks, already on
  the list).
- The file-change decline breaks nothing that stays, apart from the listed suite changes in F11 (b).

## 5. What the owner and the coordinator see per refused command, under Y

| Mode | Owner | Coordinator |
| --- | --- | --- |
| auto | The wrapper's hand-back and the coordinator's accept, with the command in a heredoc, render inline. Nothing to answer while the classifier allows it. On a block, nothing, unless N2's sentence sends it up. | One hand-back to read (about 12 lines plus the command), one accept with the command restated (the command enters its context twice), then one continuation. In background mode, also the `ASK=` wake and a relaunch of the poll. Measured at 14-35 s per decision (level 3, n=2). |
| default | The accept's prompt, showing the command, plus a prompt for the wrapper's continued `--run`: on this machine every launcher call prompts (no allow rule). A request the page sends up is asked in chat first and then prompted, so twice for one command. | The same as auto. |
| headless | The command never runs. The page declines it, and the answer names it. A Claude subagent would have run it if the owner's rules allow it: a gap that exists in 0.21.0 today and that Y keeps. | A decline with no restatement. |

Against a Claude subagent: no coordinator turn and the owner's allow rules would apply. Y keeps neither,
which is what 0.21.0 costs today (v2 §3.4 states it).

## Open

- The classifier on a restated accept (v2 §3.7). Not run: it needs the owner's session.
- The rule "don't ask again" writes for the accept call (N5). Not run.
- `experimentalApi: false` at worktree and write level, where the driver sends `sandbox`. Only the read
  level was made to happen.
- The X-only residuals (F4's SIGPIPE, M2-M6). Not examined further, because X is held.
