# Probe, second round: the edit tool inside `$TMPDIR`, and arc under the sandbox

Opus P1, 2026-09-27, the same probe client and private Codex home as [01-probe.md](01-probe.md); three paid turns on gpt-5.6-terra at effort low for Q5, no model turn for Q6. Verbatim return; the transcripts and the arc runner it names are copied under [01-probe/](01-probe/).

---

status: done

result:

Opus P1: done. Q5: whether the file-edit tool asks for approval depends on how the path is spelled, not on whether it is outside the cwd. /private/var/folders/.../T/... asks; /var/folders/.../T/... does not, even outside the cwd. Q6: arc fails under entrust_read because it opens its object store read-write; granting write on two paths (the objectdb directory and the sync file) makes status, log, show and diff exit 0.

Q5a (level 3): Target /private/var/folders/mf/.../T/entrust-p1-q5-24613f46/note.md, outside the cwd, in the /private spelling.
- item/started changes: [{"path":"/private/var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/entrust-p1-q5-24613f46/note.md","kind":{"type":"add"},"diff":"q5a\n"}].
- item/fileChange/requestApproval followed 4 ms later. Its params were {threadId, turnId, itemId, startedAtMs, "reason":null, "grantRoot":null}; they do not name the path.
- I answered {"decision":"decline"}. item/completed came back status "declined".
- The model did not fall back to a shell write. It ran only `test -f ... && printf exists || printf missing`: no request, exit 0, output "missing". Its answer: "Patch creation was rejected; file does not exist." The file is absent.

Q5b (level 3): note2.md inside the cwd (the cwd is under $TMPDIR, spelled /var/folders/...). changes [{"path":"/var/folders/.../scratch-q5b/note2.md","kind":{"type":"add"},"diff":"q5b\n"}]. No request came; the item completed 36 ms later and the file exists.

Q5c-shell (level 3): the shell command `printf 'x' > /private/var/folders/.../T/entrust-p1-q5-070f431d/note3.md` raised no request, exit 0, and the file exists (1 byte).

Q5c-path (level 3; third turn, used as a discriminator instead of repeating 5a): /var/folders/.../T/entrust-p1-q5-0f5490c1/note.md, outside the cwd, in the $TMPDIR spelling. changes [{"path":"/var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/entrust-p1-q5-0f5490c1/note.md","kind":{"type":"add"},"diff":"q5c\n"}]. No request came, the item completed, and the file exists with "q5c". This refutes the "any path outside the cwd" hypothesis.
- Mechanism (hypothesis): the edit tool's approval check compares the patch path as written against a root spelled /var/folders/.../T, the $TMPDIR spelling, without resolving symlinks. thread/start reports the root as /private/var/..., yet it is the /private spelling that asks.
- Consequence (level 2): any /private/var/... path a read agent is told to write through the edit tool gets a fileChange request, and the driver declines it. That matches the production "patch rejected by user" entries. The shell write goes through because Seatbelt resolves the path.

Q6 without grant (level 3): `arc status --short` and `arc log -n 1` both exit 1. The stderr, whole:
"Error opening ObjectDB store on attempt 0: (Error 1: Operation not permitted) util/system/file.cpp:936: can't open "/Users/ruliny/.arc/store/.arc/objects/objectdb/data.dat" with mode RdWr|OpenAlways|CloseOnExec (0x0000081A)" [attempts 1 and 2 identical] / "All attempts opening server cache failed; it will be re-created" / "[WARN] Failed initializing repository: Caught: (TIoException) (Error 1: Operation not permitted) util/folder/path.cpp:411: failed to delete /Users/ruliny/.arc/store/.arc/objects/objectdb/index.dat" / "Not a mounted arc repository. Did you forget to mount arcadia?"

Q6 grants (level 3):
- Adding only /Users/ruliny/.arc/store/.arc/objects/objectdb = write: exit 1, `can't open "/Users/ruliny/.arc/store/.arc/sync" with mode RdWr|OpenAlways|CloseOnExec`.
- Adding objectdb plus the file /Users/ruliny/.arc/store/.arc/sync = write: `arc status --short` 0; `arc log -n 1` 0 (printed fde7ff0f35a3…); `arc show fde7ff0f35a3f520e8ef2db73f70398fc121d660 --stat` 0; `arc diff --stat HEAD~1` 0. All outputs match the unsandboxed baseline shape (baseline `arc status --short` exit 0, empty output).
- With --log-denials under that grant, arc's remaining denials were only its trace logs, and they are non-fatal: file-write-data /Users/ruliny/.arc/store/.arc/traces/2026-09-27.log and /Users/ruliny/.arc/traces/2026-09-27.log.

Q6 risk (hypothesis): the objectdb grant makes the 33 GB object cache (data.dat 33663913336 bytes) writable. The no-grant path shows arc tries to delete index.dat to "re-create" the cache when opening fails, so under this grant a failed open could wipe it. After my runs index.dat is intact (1933072 bytes, dated Sep 25 12:39).

evidence:
- Q5: 3 paid turns (gpt-5.6-terra, low; threads 01a0e3b6-7103…, 01a0e3b6-71cc…, 01a0e3b7-feae…).
- Q5 approval requests: 1 fileChange (declined), 0 commandExecution.
- Q5 files: 3 appeared (note2.md, note3.md, q5c note.md); 1 did not (q5a note.md).
- Q6: 0 model turns, 10 recorded command runs:
  - 1 unsandboxed baseline, exit 0.
  - 1 refused by codex: "`--strict-config` is not supported for `codex sandbox`". All sandbox runs therefore omit --strict-config and use an empty private CODEX_HOME.
  - 2 with no grant, exit 1.
  - 1 with objectdb only, exit 1.
  - 5 with objectdb plus sync, all exit 0 (status, log, show, diff, status with --log-denials).
- Checkout present (/Users/ruliny/arcadia, mount-points names Store /Users/ruliny/.arc/store); arc version 21203362 (2026-09-25).
- Cleanup: the Q5 target and scratch directories are removed, and the auth.json symlinks are deleted from home-q5a/b/c. No probe processes are left (ps shows none).

artifacts:
/var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/entrust-p1.54JBSVGo09/probe.mjs
/var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/entrust-p1.54JBSVGo09/transcript-q5a.jsonl (declined edit, /private path)
/var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/entrust-p1.54JBSVGo09/transcript-q5b.jsonl (edit inside cwd + shell printf)
/var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/entrust-p1.54JBSVGo09/transcript-q5c.jsonl (edit outside cwd, /var path)
/var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/entrust-p1.54JBSVGo09/cfg-q5a.json, cfg-q5b.json, cfg-q5c.json (the prompts)
/var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/entrust-p1.54JBSVGo09/arc-run.mjs (builds and runs every sandbox command line)
/var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/entrust-p1.54JBSVGo09/arc-transcript.jsonl (10 records: full argv, cwd, exit, stdout, stderr)
Note: transcript-q5.jsonl in the same directory belongs to the earlier fifth turn (nested-sandbox test and stdin close), not to this Q5.

open:
- Whether the objectdb grant is needed together with sync, or sync alone is enough: the sync-only run was refused by Claude Code's permission classifier ("Security Weaken") and never ran. objectdb alone is proven insufficient.
- The Q5 mechanism is unconfirmed: I have no codex source here and its log shows no patch-safety decision line. One turn per arm; the request is decided server-side by the path, so model variance should not matter, but it was not repeated.
- The production shell fallback after a decline did not reproduce (n=1); this model accepted the refusal. Whether an agent falls back depends on its prompt and model.
- Q6 ran without `--include-managed-config`, and `--strict-config` is unavailable for `codex sandbox`, so MDM requirements were not applied to these runs. The app-server applies them; the grant's effect under MDM is untested.
- I did not inspect arc's daemon sockets. `mount` was refused by the classifier, and lsof was not needed because every failure was a file open; network was on throughout.
