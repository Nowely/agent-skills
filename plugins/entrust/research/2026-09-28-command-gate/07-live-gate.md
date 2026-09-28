# The implemented design, live: arc through the restated accept

2026-09-28, after commits a92d0db (the widening layer removed) and 4c11870 (the accept restates the command), run
through the branch's own launcher and driver, no shim. One read agent, Codex Luna L3, `EFFORT: low`, in the owner's
Arcadia checkout: `arc status` and `arc log -n 1`, with "without arc's output the task is not done".

## What happened (level 3)

| Request | Command | Cause | Offered → decided | Outcome |
|---|---|---|---|---|
| 1 | `/bin/zsh -lc 'arc status'` | sandbox: failed inside first, exit 1 | 23 s | exit 0, 0.35 s |
| 2 | `/bin/zsh -lc 'arc log -n 1'` | sandbox: failed inside first, exit 1 | 25 s, 6 of them a pause of the coordinator's own | exit 0, 0.31 s |

- Each request was a plain command approval: no `KIND=`, no path, no permissions request.
- Each accept was the documented call: `--decide ID --accept` with the command in a quoted heredoc whose delimiter
  was the fresh token of the waiting result's `COMMAND<<TOKEN` line, copied from the wrapper's hand-back; the
  launcher printed `DECIDED=ID accept` both times. The auto-mode classifier let both calls through.
- The coordinator decided from the hand-back, printed no `--pending`, and sent the accept and the wrapper's
  continuation in one message.
- The run exited 0, `receiptOk: true`; the report carries none of `sandboxWidened`, `featuresRequested`,
  `serverWarnings`, `experimentalApi`.

## Against the earlier runs

The same arc queries took 40 to 57 seconds per round trip through 0.21.0's accept ([06-arc-escape.md](06-arc-escape.md)),
where the coordinator also re-printed each request; here 23 and 25.
