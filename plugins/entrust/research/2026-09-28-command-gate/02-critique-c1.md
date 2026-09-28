# Critique C1 — safety and parity (Opus C1)

Lens: does way 2 (and the shared subtraction) put the command in front of the same gate a Claude
subagent's Bash call faces, and does any path give a sandboxed Codex agent more than that gate grants.
Read: 00-brief.md, 01-design-v1.md, driver.mjs, agent-run.mjs, agents/codex-agent.md, codex and
orchestrate SKILL.md, all in the worktree `entrust-approval-rules`. Two local shell checks under
`$TMPDIR/command-gate/c1check/`. No Codex turn, no arc.

Summary of the verdict: way 2's mechanism is sound on the Codex side and the subtraction is right, but
"the same gate as Claude's" is true of the *text* and not of the *act*. Four things need to change before
way 2 ships (F1–F4), three are quoting/placement defects in the composed line (F5–F7), and two are
measurement order (F8, F9). None of them argues for way 1 as it stands; F3 and F8 decide whether way 2 is
better than way 1 at all.

## F1 — The refusal text teaches the model to rephrase, and nothing bounds the attempts

Failure scenario. A read-level Luna agent calls `run_as_user`; the owner's rules do not cover the command;
the owner (default mode) declines or the classifier blocks. The wrapper answers `--refused`, the driver
returns `success: false` with a reason, and the model — as measured — tries a variant of the same command
(T3: second call wrapped in `zsh -c '…'`). Each variant is a fresh `item/tool/call`, a fresh hand-back, a
fresh Bash call, and in default mode a fresh prompt to the owner. Nothing in §3.2–3.9 caps the calls per
turn, and §1 removes the only memory of a refusal the plugin had (`declinedCovering`, `rememberDecline`,
`repeatOf`, driver.mjs:3475-3580). A user who is prompted repeatedly for near-identical lines stops
reading them; that is the failure, not any single command.

Evidence. T3, level 3, design §8 (`probe/transcript-t3.jsonl`): refusal → rephrase → refusal. §4's last
bullet declines to add any guard. §1's table removes the repeat-of machinery. Level 2 that no cap exists
in the design as written.

Smallest fix. (a) The text returned on a refusal says only that the command was not run and that it will
not be run in this turn — no reason, no hint of the rule that stopped it. (b) One constant in `LIMITS`
(`MAX_USER_TOOL_CALLS`, a number, not a flag): past it the driver answers the tool `success: false`
"no further requests this turn" and records the entries. (c) Keep a per-turn memory of refused command
texts and answer a repeat from it without a hand-back — the code for "this text was seen this turn" already
exists (`attemptKey`, `failedAttempts`, driver.mjs:3142-3147).

## F2 — The gate judges a name; the bytes behind the name are the agent's own

Failure scenario. The sandboxed agent writes a script or a config inside a writable root (read level:
`$TMPDIR` whole, driver.mjs:2686-2705, 2744), then calls the tool with a short line that runs an
interpreter, a build tool or a VCS client on that path. What the gate matches is the short line; what runs
unsandboxed is whatever the agent authored a moment earlier. At `worktree`/`write` level the same shape
covers repository-local hooks and config that a `git`/`arc`/`make` line executes as a side effect.

This hazard is not new — way 1 has it, and the orchestrate page names it in the sentence "a script runs the
bytes at its path when it runs, not the bytes you read" (orchestrate/SKILL.md, Approvals). What is new is
that §3.4 deletes that paragraph ("nothing here approves it") and removes the reader it was written for.
The hazard survives the reader.

Evidence. Level 1: the page sentence exists and §3.4 removes the paragraph. Level 1: read level grants the
whole of `$TMPDIR` (driver.mjs:2686-2699; standing instruction at :4849 names the roots). Level 2 for the
compounding at write level.

Smallest fix. (a) Keep two sentences on the codex page, moved from orchestrate: the gate judges the text of
a line, not the behaviour of what the line names, and a repository query runs that repository's hooks.
(b) Answer open question §7.4 with **no**: register the tool only where the agent's writable roots are its
own temp root (read level). A worktree agent's `git commit` is a `WRITABLE:` line in the plan, which is a
rights decision made before the run, not a gate decision made during it.

## F3 — The tool is a general unsandboxed-exec channel, not a retry channel

Failure scenario. Nothing ties the tool's `command` to a command the sandbox refused. A model may call it
first, for anything, including work it was never blocked on; the description asks it not to, and T1 shows
the description alone does not decide behaviour (the "must succeed" clause did). The entry records
`cause: policy` afterwards, which nobody reads before the line runs, because §3.4 removes the coordinator
from this path.

Way 1's escape is a retry by construction: the model re-issues the command that failed, and the driver's
`cause` distinguishes the two cases. Way 2 as written loses that property, so the sandbox level stops
bounding the run in either direction.

Evidence. Level 1: `cause` is computed from `failedAttempts` (driver.mjs:3654-3657, `commandTexts`/
`attemptKey` at :3142-3147) and is descriptive only. Level 1: §4's last bullet says the guard is "not
proposed". Level 3 (T1 vs T2/T4) that the description does not decide.

Smallest fix. Offer the tool call through the mailbox only when `cause` is `sandbox` — the same one-line
test that already labels the entry. A call with `cause: policy` is answered `success: false`, "this command
was not refused by your sandbox; run it inside the sandbox", and recorded. Brittleness against rephrasing
costs a refusal, never a hole, and the objection in §4 (the gate judges the command anyway) is exactly the
claim F2 shows to be weaker than it reads.

## F4 — The rights table stops being true, and only the widening clause is being changed

Failure scenario. A coordinator reads `RIGHTS: read` as codex/SKILL.md:190 documents it — "the sandbox
refuses every other write" — and sizes an agent accordingly. Under way 2 a read-level agent can obtain
unsandboxed execution, and therefore writes anywhere the user can write, whenever a rule or the classifier
allows the line. §3.4 changes only the widening clause of that row.

Evidence. Level 1: codex/SKILL.md:190 as quoted; §3.4's table lists no change to the rights row. Level 2 on
the consequence.

Smallest fix. The rights row says what is now true: the sandbox bounds what the agent does *itself*, and a
command it cannot run is offered to the session's own permission gate, where the user's rules decide. One
sentence, and the honest version of way 2's selling point.

## F5 — Parity is claimed for a line that is not the command

The gate sees `<command> > "<out>" 2>&1; node "<launcher>" --answer …`, optionally prefixed with
`cd "<cwd>" && ` (§3.2 step 5). Two directions, both unmeasured, and M2 as designed measures only the
first:

- A narrow allow rule written for a bare command may stop matching the compound line: the owner is
  prompted where they used to be silent. A cost, as §3.9 says.
- A prefix-shaped allow rule may match the compound line *whole*, in which case what the owner allowed for
  one command now covers the segments appended after it. Whether Claude Code splits a compound line into
  segments and judges each is not established anywhere in the design; the owner's CLAUDE.md shows the
  checker has compound-command classes (`cd-compound-read`, `multi-cd`), which says it parses, not how it
  authorises. Unsure, and decisive: if it does not split, the composed shape widens every prefix rule the
  owner owns, for a first segment supplied by an external model.

Smallest fix. Extend M2 to the second direction (an allow rule for a harmless first segment, a second
segment that would not be allowed alone — run it as the owner, in their session, and read the card), and
treat the result as a gate on the design, not a cost. If the matcher does not split, the fallback in §4
(the coordinator executes) is the only shape that keeps parity honest.

## F6 — Model-supplied values are interpolated into a double-quoted shell line

`cd "<cwd>"` and `"$TMPDIR/entrust-<id>.out"` are double-quoted in §3.2 step 5. `cwd` is the tool call's own
argument, i.e. bytes the model chose. Inside double quotes `$`, backticks and `\` are still live: a `cwd`
carrying them changes what the wrapper's shell does, ahead of the command, in the unsandboxed shell.
Checked locally (level 3): a `$`-bearing string inside double quotes expanded in the running shell
(`$TMPDIR/command-gate/c1check`).

Smallest fix. Single-quote every interpolated value with `'` doubling, and refuse a `cwd` that is not an
existing directory equal to or inside the agent's own cwd or roots (`agentRoots()`, driver.mjs:3151) — the
model has no business naming any other, and the launcher can resolve it without asking anyone.

## F7 — The `RUN` block inherits none of `COMMAND`'s marker discipline

`requestLines` prints a command between `COMMAND<<TOKEN`/`COMMAND>>TOKEN` with a token drawn fresh per
print and absent from the command, precisely so a command cannot end its own block and forge the fields
after it (agent-run.mjs:604-619, and the page states the rule). §3.2 step 5 and §3.4 write `RUN<<T … RUN>>T`
and say nothing about the token. The `RUN` block is worse than the `COMMAND` block, because its content is
meant to be executed by a small model: a command that closes the block early leaves the rest of the line
outside the markers, and text that reads like a hand-back field is read by the coordinator.

Smallest fix. (a) Same fresh-token rule, stated in the design and tested. (b) The `RUN` path refuses a
command containing a newline or the token shape: it is recorded and answered `success: false` with "one
line only", and the multi-line case stays what it is today, a script the agent writes and names (F2).

## F8 — The relay is being asked to execute text that arrived in a tool result

This is the pattern Claude Code's own defences exist for, and the brief already records the classifier
blocking a wrapper continuation as "Auto-Mode Bypass" (level 3). Two outcomes, and neither is a cost:

- The classifier blocks the `RUN` line. Then way 2's normal path in auto mode is a block, and the only way
  to "fix" it is to make the relay more insistent, which is the thing not to build.
- It does not block. Then entrust ships a general conduit from an external model's output to an executed
  Bash call, in a session whose defences assume the caller's own intent.

M4 is currently "read the wrapper's card on the first real block; no probe designed". That puts the
decisive measurement after the decision.

Smallest fix. Run M4 before choosing way 2, with a line the owner's rules deny (a deny-rule match is
harmless and reaches the same code path as a block: the wrapper needs a refusal it can turn into
`--answer --refused`). Record what the wrapper does when the tool call is refused *and* when the subagent
is stopped. Treat a classifier block on the ordinary path as disqualifying.

Related, and worth one page sentence rather than a fix: in a `-p` session run with permissions bypassed the
gate is nothing at all, and way 2 has no reader; way 1 in that same session still had one.

## F9 — Failure paths that write no answer stall the run silently

If the harness refuses the Bash call in a way that ends the wrapper turn (a stop, a hard block) rather than
returning a tool error, nothing runs `--answer`. The driver then holds the tool call open for thirty
minutes (§3.9) while the coordinator holds no call at all: after a hand-back no call is waiting
(agent-run.mjs:170-171). Way 1's hand-back left the coordinator holding the decision, so a stall was
visible at once.

Smallest fix. A shorter deadline for this request kind (minutes, in `LIMITS`, derived not flagged), and a
`--run`/`--pending` line that says a tool call was handed back and not answered, so a coordinator rerun
reports a stall instead of waiting for the expiry.

## F10 — Smaller, still real

- **Answer file placement.** The output path sits in the session's `$TMPDIR`, which at read level *is* the
  agent's writable root (the launcher passes the environment through, agent-run.mjs:388; the driver keeps a
  caller's `TMPDIR`, driver.mjs:2692-2705). A shell redirect follows a pre-existing symlink at the target
  name — checked locally, level 3, `$TMPDIR/command-gate/c1check` — so an unsandboxed write is aimed by
  whatever is at that name, and the file's contents are editable by the agent between the write and
  `--answer`. Name guessing bounds the first (8 hex digits), nothing bounds the second. Fix: put the file
  under the run's agent directory inside the state directory, which no sandbox may write
  (driver.mjs:3370-3397). §3.2 justifies `$TMPDIR` by "the data directory the sensitive-file check refuses",
  which is asserted with no probe — measure it, since it is the only reason given.
- **Wrapper instructions collide.** The wrapper file today says: run *the* command with the description
  given, do not open or wait on the output file, do not create or edit files, do not change any flag or
  path (agents/codex-agent.md). Step 6 of §3.2 tells it to run a different line, one that creates a file and
  carries no description. The 3-of-3 fidelity measurement cited (codex/SKILL.md:79-81) was made on the
  one-shape block. Fix: the launcher composes the description too (naming the agent id and that the line
  runs outside the sandbox, per the seat-naming rule), the wrapper's steps are restated as one shape with
  two cases, and M1 covers the collision case, not only verbatim transcription.
- **`by: gate` overstates.** When an allow rule matched, nobody judged anything; the launcher cannot learn
  which of rule, classifier or prompt allowed the line. Record `by: session` and say in the page that which
  gate decided is not knowable from inside the driver.
- **Who may answer.** `--answer` is runnable by anything with a Bash call in the session, including another
  subagent, and can forge `--exit 0` with an empty output. Not an escalation (such a caller can already run
  commands), but it should be stated, and `--answer` must refuse an id whose request is not a tool call and
  must never accept an output path from its caller — §3.2 already says the latter; keep it.

## Not findings (checked, and they hold)

- The mailbox stays outside every writable root by inode, at or above (driver.mjs:3370-3397), and `--new`
  refuses a report or agent directory outside the state directory (agent-run.mjs:541-547). The agent cannot
  write a decision or an answer while sandboxed. The invariant behind the guard — "no sandbox this driver
  grants can write here" — still holds for the sandbox; F2/F4 are about what runs outside it.
- Request ids keep the driver's shape (`REQUEST_ID`, agent-run.mjs:302) and `--decide` refuses anything
  else, so an id cannot walk out of the mailbox; the same test must be applied to `--answer`.
- Every hand-back field but the command block is escaped onto one line (`field`, `item`,
  agent-run.mjs:334-340), so the new fields of a tool-call request forge nothing as long as F7 is fixed.
- The subtraction removes no guard way 2 needs, with one exception already listed in F1 (the refusal
  memory). Keeping `item/permissions/requestApproval` in `REFUSALS` (driver.mjs:3603) is right: a server
  that sends one anyway is answered with the empty profile.
- Swarm (no mailbox): no tool is registered, escapes are declined at once (`why: "no channel"`,
  driver.mjs:3676). Fail-closed, level 1.
- `experimentalApi` becoming load-bearing is fail-closed: `thread/start` refuses with `-32600` (D2, level 3)
  and the design asserts on it, exit 4 before a token is spent.
