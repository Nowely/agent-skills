# Live gate: one armed agent, one approval by the coordinator, one auto-yes by the driver

2026-09-27 22:42–22:44, run by the coordinator by hand with the worktree's new launcher and driver (Opus W1's uncommitted implementation of v4), codex-cli 0.155.1, agent Codex Terra G1 at effort low, a read agent in the worktree, network on. Level 3 throughout.

## What ran

1. `agent-run.mjs --new --approvals` with the state directory named on the command line made the agent's directory and `approvals/` beside the prompt (a first call without the variable was refused: "--approvals needs the state directory the driver will use").
2. `agent-run.mjs --run` in the background; a poll on the `exit` marker and on `approvals/pending`; it printed `ASK=G1`.
3. `agent-run.mjs --pending` printed one request: id `1-7dfb966a`, thread root, kind command, cause `sandbox`, the whole command `/bin/zsh -lc 'touch /tmp/entrust-gate-x1-marker'` between the markers, the roots (`$TMPDIR`), no deadline, the server's reason "Do you want to allow running the requested touch command outside the sandbox?".
4. `agent-run.mjs --decide 1-7dfb966a --accept --why "live gate: the planned touch outside the sandbox"` printed `DECIDED=1-7dfb966a accept`.
5. The run ended: driver exit 0, `PATH=own`, `EXIT=0`, `RECEIPT=turnStatus=completed receiptOk=true model=Terra approvals=1/0/0/0 auto=1`.

## What the report says

| Entry | method | offered | decision | by | cause | waitMs | resolved | outcome |
|---|---|---|---|---|---|---|---|---|
| `1-7dfb966a` | commandExecution/requestApproval | true | accepted | coordinator | sandbox | 34131 | true | completed, exit 0, 45 ms |
| (none) | fileChange/requestApproval | false | accepted | driver, "rights cover it" | rights | 0 | true | completed |

Counts: `approvalsAccepted 1`, `approvalsAutoAccepted 1`, `approvalsStale 0`, `approvalsLate 0`, `commandsDeclined 0`, `commandsFailed 1` (the sandboxed first attempt at the `touch`). The file-change entry carries `fileChanges: [{path: "/private/var/folders/…/T/entrust-gate-x1/note.md", kind: "add"}]`: the `/private` spelling that made Codex ask, resolved by the driver to a path inside `$TMPDIR`.

## What appeared on disk

`/tmp/entrust-gate-x1-marker` (0 bytes, 22:44), written by the accepted command outside the sandbox; `$TMPDIR/entrust-gate-x1/note.md` (5 bytes, "gate"), written by the edit tool after the driver's own yes. Both removed afterwards. The agent's answer: "step 1: approved then ran … step 2: written … Codex Terra G1: done".

## The second gate, after the fix round

23:53–23:55 the same day, agent Codex Terra G2, after Opus W1's twelve fixes (the `--pending` framing, `--decide`'s refusals, the mailbox containment and owner takeover, the auto-yes checks re-run at send). Same two steps. `--pending` printed the request `1-2492ab9a` with the command between `COMMAND<<6653b5ec8185` and `COMMAND>>6653b5ec8185`; `--decide … --accept` printed `DECIDED=1-2492ab9a accept`; the run ended exit 0, `RECEIPT=turnStatus=completed receiptOk=true model=Terra approvals=1/0/0/0 auto=1`. The report: the command entry accepted by the coordinator after 92,159 ms, `resolved: true`, outcome completed; the file-change entry accepted by the driver with `why: "rights cover it (checked as the answer was sent)"`, cause `rights`, `waitMs: 1`; `approvalsDuplicate 0`, `approvalsStale 0`, `approvalsLate 0`. `/tmp/entrust-gate-x2-marker` (0 bytes) and `$TMPDIR/entrust-gate-x2/note.md` ("gate two") appeared and were removed afterwards.

## What this gate does not establish

The deadline path, a coordinator's decline, a late or stale decision, a subagent thread's request, a cut or signal with a request open, two agents at once, the arc grant through the server, and any run under `-p`. Those are the offline suites' cases (green) and the measurements still listed in v4.
