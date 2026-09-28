# The VCS client through the escape, with the widening switched off

2026-09-28, on the owner's word «Так давай проверим. Измерь». One read agent, Codex Luna L2, `EFFORT: low`, in the
owner's monorepo checkout; task: the working copy's status, the branch's last commit and its files, through
`vcs status`, `vcs log -n 1`, `vcs show <full hash> --stat`, and "without the VCS client's output the task is not done".

## How step 1 was stood in for

The installed 0.21.0 driver switches the two permission features on when `codex features list` names both, and
then tells the model to ask for a failing tool's files. The run pointed the driver's own `ENTRUST_CODEX` seam at a
four-line shim under `$TMPDIR` that answers `features list` with nothing and passes every other call to the real
codex. The report confirms the effect: `featuresRequested: []`, `sandboxWidened: []`. No plugin file changed.
This is the behaviour step 1 of [05-decision.md](05-decision.md) ships, minus the restated accept.

## What happened (level 3)

| Request | Command | Cause | Decided after | Outcome |
|---|---|---|---|---|
| 1 | `vcs status` | sandbox: it had failed inside first, exit 1, its object store could not be opened, Operation not permitted | 57 s | exit 0, 1.5 s |
| 2 | `vcs log -n 1` | policy: asked outside at once | 42 s | exit 0, 3.2 s |
| 3 | `vcs show <full hash> --stat` | policy: asked outside at once | 40 s | exit 0, 0.3 s |

- Every request was a plain command approval: no paths named, no permissions request, no cache file mentioned.
  The model's reason text named `~/.vcs` as the store the VCS client needs, and asked to run the command outside.
- The coordinator accepted all three with `--decide`; the auto-mode classifier let all three through.
- The run exited 0, `receiptOk: true`, `approvals=3/0/0/0`. The answer reports the owner's branch,
  working copy clean, and its last commit, the hash the 2026-09-27 probe recorded
  ([01-probe-2.md](../2026-09-27-approval-channel/01-probe-2.md)).
- Wall time from launch to exit about three minutes, of which about two and a half were the three round trips
  through the wrapper and the coordinator.

## The VCS client's cache (level 3 for the sizes, level 2 for the reading)

| File | Before | After the first `vcs status` | After the run |
|---|---|---|---|
| `data.dat` | 33,663,913,336 | 33,665,543,347 | unchanged |
| `index.dat` | 0 | 112 | unchanged |
| `lookup.dat` | 4,096 | 61,440 | unchanged |
| `objectdb.dat` | 16 | 16 | unchanged |

Run as the user, the VCS client took the empty index left by the incident of [21-vcs-measure.md](../2026-09-27-approval-channel/21-vcs-measure.md)
as a fresh cache, appended about 1.6 MB of objects to the data file and indexed them; it deleted nothing. The
mount daemon still holds the old index and lookup inodes; what it does on its next start is the VCS client's own recovery
and was left alone, as the owner asked.

## What it settles

- With no instruction to name paths, the model asks for the escape, as it did in all 13 VCS requests before
  0.21.0; after one sandboxed failure it asks for the next VCS command outside at once.
- The VCS client works through the escape as it does in the terminal, and the escape never leaves the VCS client half able to write its
  state.
- The price is one coordinator round trip per VCS command, about 40 to 57 seconds here.
