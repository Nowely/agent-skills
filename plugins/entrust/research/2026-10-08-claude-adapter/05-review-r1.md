# Review R1 of the implementation

An Opus subagent that wrote none of the code, given the diff `b89ab98..f2ea528`, AGENT.md, CONSTITUTION.md and this
run's design and probes. A first launch was cut by a session limit and lost when the session restarted; this is the
second launch's return, verbatim.

---

**1. Driver refusals at run time reach the launcher as `ERROR=` with no reason. Major.** driver.mjs:241-243 and :390, read by agent-run.mjs:578-580.
- Evidence, level 3 (I ran it): `--new` with `RIGHTS: read <dir>`, then `rmdir <dir>`, then `--run`. The output was `DRIVER_EXIT=2 PATH=none EXIT=unknown ERROR= FILE=missing`. The reason sits only in err.txt, as `entrust: refused: …`. statusLines only looks for lines starting `entrust agent-run: refused`, so it never finds this one.
- Which refusals: `scopeOf` errors (including the HEAD fix's missing-directory check, which still applies at launch), `--approval-dir` outside the state directory, and a RESUME that is still busy (exit 10). All of them happen before the report is claimed, so there is no pid line and no report.
- The launcher's --help promises "the reason on ERROR=". OpenCode makes the same checks after its claim and publishes a report (opencode driver.mjs:897-940).
- Scenario: the RIGHTS directory is removed between `--new` and `--run`, or a continuation's prior run is still going. The coordinator gets exit 2 or 10 with no reason.
- Fix: in `run()`, claim the report and print the pid line first. Then `publish({exitCode: USAGE|BUSY, error})`, as the makeWorktree failure already does at :263.

**2. The mailbox deny rule also blocks any `approvals/` directory inside a worktree run. Major.** driver.mjs:170, with worktrees placed by drivers.mjs:123.
- Evidence, level 2. The rule is `Edit(//<state>/**/approvals/**)`, and worktrees live at `<state>/worktrees/<inv>`. In gitignore syntax `**` crosses that, so `<state>/worktrees/inv_x/src/approvals/a.ts` matches.
- Scenario: `RIGHTS: worktree <repo>` on a repo with `src/approvals/`.
  - Every Edit, Write, redirect or `tee` there is denied outright. It is never offered to the mailbox.
  - With a mailbox, denials do not change the exit code, so the run can end `EXIT=0` with the task undone.
  - The fake ignores `--disallowedTools`, so no test can see this.
- Why the glob is only needed in part: outside the working directory, acceptEdits already prompts, and the prompt goes to the coordinator. The deny rule only matters where something would otherwise be auto-approved.
- Fix: emit `Edit(//<box>/**)` for the run's own mailbox, plus one `Edit(//<state>/<entry>/**/approvals/**)` per top-level state entry other than `worktrees`. Add an args test with a repo that holds `approvals/x`.

**3. The `Write(...)` deny rules are never consulted. Minor, needless code.** driver.mjs:170, and the test pins it at claude.test.mjs:105.
- Evidence, level 1. The permissions docs say: "Claude Code checks file permissions against `Edit(path)` and `Read(path)` rules only. If you write a path rule for `Write` … accepts the rule but never consults it, and warns at startup." They also say "`Edit` rules apply to all built-in tools that edit files."
- So the `//abs/**` spelling is right, and the Edit rule already covers the Write tool. Edit deny rules also cover Bash redirection targets and `tee`.
- Self-approval is therefore blocked for the Edit and Write tools, redirects and `tee`. `cp`, `mv` and scripts prompt and go to the coordinator, unless the user's allow rules or `additionalDirectories` cover the state directory. That is the risk the page already accepts.
- Fix: drop the two `Write(...)` rules and the assertion.

**4. Page text the code does not match. Minor.**
- external.md:72 says the diff is "the unstaged edits only". drivers.mjs:139 now diffs against the base commit, so it includes committed, staged and unstaged changes, with untracked files listed separately. Level 1.
- external.md:30 lists "reads" as needing no approval. The permissions doc says reads run without approval only "within the working directory"; reads elsewhere prompt. Level 1.
- external.md:68 says a running continuation exits 10. At `--new` it is actually `ERROR=` with exit 2.
- The "still running" check is only "the report has no `exitCode`" (driver.mjs:123). If the driver dies before publishing, the stub stays, and every RESUME treats it as running forever. Ways to die:
  - a SIGTERM during `git worktree add`, because the signal handlers are registered only at :290;
  - an uncaught throw.

**5. Where the fake differs from the real CLI. Minor.** fake-claude.mjs.
- It does not evaluate deny rules, `--tools` or the permission mode, so findings 2 and 3 pass the suite.
- It starts the approval server per call and closes it after one answer. The real CLI keeps one server per session and, per P8b, retries a call after `notifications/cancelled`; the fake never retries.
- A stop while a request is waiting is neither probed nor tested. That is the stop the launcher's --help tells the coordinator to use for a waiting run (`kill -TERM` the driver). What claude does with an in-flight permission-tool call on SIGINT is a guess. The 10 s SIGTERM and 15 s SIGKILL escalation bounds the wait. After a SIGKILL, Bash commands that run in their own session (P5b) may outlive claude.

**6. Departures from the design that rounds.md does not record. Minor.**
- rounds.md says there was "one departure".
- The server is named `entrust` with tool `mcp__entrust__decide`; design §4 says `entrust-approvals`. The run loads the user's own MCP servers (there is no `--strict-mcp-config`), so a user server named `entrust` could collide. What happens then is unprobed; hypothesis.
- Design §6's change to name the adapter on the `AGENT=` line was not made (agent-run.mjs:537).

**7. One fact with two owners. Minor.**
- approvals.mjs:59-61 `fits` restates the launcher's `decisionFits` (agent-run.mjs:362-367).
- driver.mjs:127-130 restates `scopeWithin` (drivers.mjs:108).

**No defect found in these areas:**
- **OpenCode move:** `resolveRights`, `rightsScope`, `scopeWithin`, `git` and `makeWorktree` match the removed code line for line, and the only change in OpenCode's behaviour is the intended diff fix.
- **Launcher's `ROW_ADAPTERS`:** for codex and opencode the set is unchanged.
- **Approval server against `--decide`:** it writes the request before `pending`, settles before dropping the id from `pending`, deletes the entry before answering, and ignores a second cancel. Single-threaded, so I found no double-settle and no lost approval.

**Suites I ran:** claude.test.mjs 17 passed, 1 skipped (the live case); agent-contract 13/13; adapter-status 5/5; opencode 82/82 when rerun alone; scripts/skills.test.mjs 8/8. The first opencode run, alongside the other suites in a shared TMPDIR, stopped after 37 cases with exit 1 and no message. It did not happen again when run alone.
