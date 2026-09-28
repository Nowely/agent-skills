# The VCS client through the released channel: a partial grant made the VCS client delete its own cache index

2026-09-28, after entrust 0.21.0 was installed on the owner's machine. The owner asked to measure the VCS client through the
widening and through the escape before choosing a design, with Codex Luna the only model available. Two read
agents were planned, one after the other: Codex Luna L1 with every widening accepted, Codex Luna L2 with the
widening declined and the escape accepted. L2 was not run.

## What happened, in order (level 3)

Codex Luna L1, `RIGHTS: read` on the owner's monorepo checkout, `EFFORT: low`, task: the working copy's status, the
branch's last commit and its files, through `vcs status`, `vcs log`, `vcs show`. Both permission features were on.

| UTC | Event |
|---|---|
| 12:07:30 | driver started |
| 12:07:45 | `vcs status` has exited 1 in the sandbox; request 1, a permissions request, `write` on `~/.vcs/store/.vcs/objects/objectdb/data.dat` and `index.dat`, cause `sandbox`, handed back through the wrapper |
| 12:08:20 | the coordinator accepts request 1 with `--decide`; the auto-mode classifier did not stop it |
| 12:08:29 | `index.dat` is 0 bytes, read just before the second decision; before the run it was 1,933,072 bytes, dated 2026-09-25 |
| 12:08:34 | request 2, `write` on `objectdb/lookup.dat`; accepted at 12:08:48 |
| 12:08:51 | `index.dat` 0 bytes and `lookup.dat` 4,096 bytes, both new files |
| after | request 3, `write` on `objectdb/objectdb.dat`; the coordinator stopped the driver with SIGTERM instead of answering, and the driver recorded request 3 as expired |

The rollout holds the VCS client's errors, sixteen times each: its object store cannot be opened (Operation not
permitted, on attempts 0, 1 and 2), all attempts to open the server cache failed and it will be re-created, and
initializing the repository failed. "failed to delete …/index.dat" appears four times, all before the first grant;
"failed to delete …/lookup.dat" eight times and "…/objectdb.dat" four. Once `index.dat` was writable, the delete
that had been failing succeeded, and the VCS client made a new empty file in its place; the same happened to `lookup.dat` after
the second grant. Every command in the report exited 1: `vcs status` three times and `vcs log -1` once.

## The state it left (level 3 for the files, level 2 for what they mean)

- `data.dat`, 33,663,913,336 bytes, and `objectdb.dat`, 16 bytes, are untouched: same size, same date.
- `index.dat` and `lookup.dat` are new inodes, 0 and 4,096 bytes.
- The owner's `vcs mount` daemon, running since before the run, still holds the old inodes open: `lsof` shows
  `index.dat` at 1,933,072 bytes and `lookup.dat` at 989,736,960 bytes, inodes 810941 and 810942, while the
  directory now names inodes 121965499 and 121965500. The mount reads files normally. A new VCS process opens the
  empty files by path.
- The loose objects under `~/.vcs/store/.vcs/objects/00` … `ff`, 380,071 files, 10,111 of them from the last two
  weeks, sit outside `objectdb` and were not granted or touched. The VCS client calls `objectdb` its "server cache"; that the
  owner's local-only commits live in the loose objects and not there is a reading of the VCS client's message and of the
  client's documentation on GC keeping local-only objects, not a measurement.

## What it settles

- A request's paths are the tool's first failure, not its whole state. Granting them one at a time leaves the tool
  half-able to write, and a tool that resets state it cannot open turns that half into a deletion. The earlier probe
  that granted the whole `objectdb` directory plus `sync` at once ran five VCS commands with exit 0 and deleted
  nothing ([01-probe-2.md](01-probe-2.md)); [01-probe-3.md](01-probe-3.md) named this failure as a hypothesis and
  declined the same request. The coordinator's answer to the owner before this run compared the two conditions as
  if they were one, and was wrong.
- The orchestrate page's rule, "approve a write into a tool's own state or cache under the home when the path is
  not a repository, not `~/.codex` and not the state directory", is what the coordinator followed. Ledger E77.
- The escape path was not measured; with the cache in this state, running the VCS client again was not the coordinator's call.
