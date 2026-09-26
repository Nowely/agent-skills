# Ledger verification round, 2026-09-12 — every return, for adjudication

The document under verification is /Users/ruliny/Git/agent-skills/ISSUES.md (entries C1..C9).
The tree is branch codex-delegate-issues-verify, cut from main at codex-delegate 0.14.0 (tree == tag, proven by two agents).
Also in scope: seven findings R1..R7 from a 2026-09-11 audit of 0.13.0 that never reached the ledger.

## Bulk tier: 20 Luna seats, one atomic claim each

NOTE FROM THE COORDINATOR: the file path in every one of these 20 prompts was malformed — it carried a
doubled `plugins/codex-delegate` segment and did not exist. Each seat detected that, searched, found the
real file, verified the claim there, and reported the discrepancy in `open`. Because their instructions
said a claim whose line merely moved is not false, nearly all returned the verdict word MOVED while their
own prose says the claim holds at the address originally intended. Read their prose and quotes, not the
verdict word. Judge for yourself whether that reading is fair to them.

### L01
Codex finds claim L01 settled with status done: MOVED.
Settled location: plugins/codex-delegate/skills/cleanup/SKILL.md, lines 29 and 59; clone-route behavior is documented in README.md line 113.
I checked the cited path, the relocated cleanup skill, and the plugin subtree, ruling out a missing invocation; the file location is what moved.
quotes:
  - plugins/codex-delegate/skills/cleanup/SKILL.md:29:       CLAUDE_PLUGIN_DATA="${CLAUDE_PLUGIN_DATA}" node "${CLAUDE_PLUGIN_ROOT}/skills/seat/scripts/cleanup.mjs" --list --json >"$F" && cat "$F" && echo "snapshot: $F"
  - plugins/codex-delegate/skills/cleanup/SKILL.md:59:       CLAUDE_PLUGIN_DATA="${CLAUDE_PLUGIN_DATA}" node "${CLAUDE_PLUGIN_ROOT}/skills/seat/scripts/cleanup.mjs" --delete --from "<SNAPSHOT>" <numbers>
  - plugins/codex-delegate/README.md:113:clone-and-symlink route nothing substitutes the placeholder, so export an absolute path of your own
open: The cited path command started and exited 1; exact diagnostic: nl: plugins/codex-delegate/plugins/codex-delegate/skills/cleanup/SKILL.md: No such file or directory.

### L02
Codex, claim L02, status done: MOVED.
Settled location: /Users/ruliny/Git/agent-skills/plugins/codex-delegate/skills/seat/SKILL.md:80.
I checked the cited nested path and the rest of the plugin, ruling out `${CLAUDE_PLUGIN_ROOT}` in the seat launch recipe.
quotes:
  - plugins/codex-delegate/skills/seat/SKILL.md:80 — `    CLAUDE_PLUGIN_DATA="${CLAUDE_PLUGIN_DATA}" node "${CLAUDE_SKILL_DIR}/scripts/driver.mjs" --seat-file "<DIR>/prompt.txt" --report-file "<REPORT>" > "<DIR>/out.json" 2> "<DIR>/err.txt"`

### L03
Codex claim L03 is done: MOVED.
Location: plugins/codex-delegate/skills/seat/SKILL.md:114-115.
I checked the full current file and the plugin-wide matches; the cited nested path is absent, with no competing seat copy found.
quotes:
  - plugins/codex-delegate/skills/seat/SKILL.md:114: `--help` needs none. A clone-and-symlink install substitutes nothing for the placeholder, so the forwarded
  - plugins/codex-delegate/skills/seat/SKILL.md:115: value is empty there and the `CODEX_DELEGATE_STATE_DIR` the user exports decides ([README](../../README.md)

### L04
Codex, claim L04, status done: MOVED.
Settled location: /Users/ruliny/Git/agent-skills/plugins/codex-delegate/skills/seat/scripts/cleanup.mjs:846-847.
I checked the script’s inventory logic and ruled out answers or reports as row sources; they occur only in guards or report metadata.
quotes:
  - plugins/codex-delegate/skills/seat/scripts/cleanup.mjs:846: `  const rows = [...runs, ...seats, ...listEvals(roots, ps), ...listSessions(roots),`
  - plugins/codex-delegate/skills/seat/scripts/cleanup.mjs:847: `                ...listWorktrees(roots), ...listLocks(roots), ...listHome(roots), ...listDataDirs(roots)];`
  - plugins/codex-delegate/skills/seat/scripts/cleanup.mjs:82: `It removes orchestrate run directories and seat scratch directories of THIS project, the suites'`
  - plugins/codex-delegate/skills/seat/scripts/cleanup.mjs:83: `scratch directories, and the saved conversations the suites leave behind; it only REPORTS managed`
  - plugins/codex-delegate/skills/seat/scripts/cleanup.mjs:84: `worktrees and their ledger, write locks, the shared Codex home, and another copy's data directory.`
open: The supplied source path contained an extra plugins/codex-delegate segment and did not exist; the current file is at the settled path above.

### L05
GPT-5: claim L05 is done — MOVED.
Location: /Users/ruliny/Git/agent-skills/plugins/codex-delegate/skills/seat/scripts/cleanup.mjs:255-257.
I checked every answer/answers occurrence in the cleanup file and the codex-delegate subtree, ruling out any inventory row sourced from state/answers.
quotes:
  - plugins/codex-delegate/skills/seat/scripts/cleanup.mjs:255-257 — r.guards = [r.S, r.T, r.CFG, r.PROJECTS, r.DATA, r.ORCH, r.project,               ...["answers", "jobs", "tmp", "pasted", "locks", "worktrees", "home"]                 .map((n) => (r.S === null ?
  - plugins/codex-delegate/skills/seat/scripts/cleanup.mjs:846-847 — const rows = [...runs, ...seats, ...listEvals(roots, ps), ...listSessions(roots),                 ...listWorktrees(roots), ...listLocks(roots), ...listHome(roots), ...listDataDirs(roots)];
open: The cited source path contains an extra plugins/codex-delegate segment and is absent; the cleanup file is at the settled location above.

### L06
Codex GPT-5, claim L06, status done: FAILS.
Location settled: plugins/codex-delegate/skills/seat/SKILL.md:100-103, with the exception defined in plugins/codex-delegate/skills/orchestrate/SKILL.md:27-30.
I checked the full seat page and the rest of plugins/codex-delegate, ruling out a mere line move because orchestrate mode explicitly uses a different state subdirectory.
quotes:
  - plugins/codex-delegate/skills/seat/SKILL.md:100 — "and then sits where you would read it as the seat's own report. Put it under the driver's state directory,"
  - plugins/codex-delegate/skills/seat/SKILL.md:101 — "`<state>/reports/<run>/report.json` with `<run>` unique, or, under the orchestrate mode, `<run>/<seat>/report.json`"
  - plugins/codex-delegate/skills/orchestrate/SKILL.md:27 — "Scouting is the only repository exploration you do, and targeted bounded checks stay allowed inline after it; report a failed seat and never backfill it. The run directory is"
  - plugins/codex-delegate/skills/orchestrate/SKILL.md:28 — "`<state>/orchestrate/<project-slug>/<run>/`, `<state>` the driver's state directory (`${CLAUDE_PLUGIN_DATA}` on a plugin install, the exported `CODEX_DELEGATE_STATE_DIR` on the clone route), `<run>` uniq
open: The doubled source path is absent; the current file is at plugins/codex-delegate/skills/seat/SKILL.md. This initially suggested MOVED, but the explicit orchestrate-mode exception means the universal claim is false.

### L07
GPT-5, claim L07, status done: MOVED.
Settled location: /Users/ruliny/Git/agent-skills/plugins/codex-delegate/skills/seat/references/environment-and-internals.md:132-135.
I read all 312 lines and searched the plugin tree; I ruled out pruning of report-file outputs, with other pruning limited to answer logs, job records, and private TMPDIR trees.
quotes:
  - /Users/ruliny/Git/agent-skills/plugins/codex-delegate/skills/seat/references/environment-and-internals.md:132 — `--report-file` is validated off the raw command line before the seat file is expanded and before
  - /Users/ruliny/Git/agent-skills/plugins/codex-delegate/skills/seat/references/environment-and-internals.md:133 —   anything is spawned: an absolute path, a writable parent — created at 0700, all the way down, when it
  - /Users/ruliny/Git/agent-skills/plugins/codex-delegate/skills/seat/references/environment-and-internals.md:134 —   is absent — and a name that does not exist yet. Nothing prunes the directories or the files it makes;
  - /Users/ruliny/Git/agent-skills/plugins/codex-delegate/skills/seat/references/environment-and-internals.md:135 —   the caller that named the path owns them.
  -  /Users/ruliny/Git/agent-skills/plugins/codex-delegate/skills/seat/scripts/driver.mjs:3008-3011 — // Prune by PRUNE_DAYS and PRUNE_MAX_ENTRIES, always keeping the newest entry. Named for the directory // rather than for the answers: the job records and the pri
open: The supplied path is absent; the reference is now one `plugins/codex-delegate` directory higher.

### L08
Codex, claim L08, status done: MOVED.
Settled location: plugins/codex-delegate/skills/seat/SKILL.md, lines 99 and 140.
I checked the rest of the seat page and codex-delegate tree; no conflicting wording was found.
quotes:
  - plugins/codex-delegate/skills/seat/SKILL.md:99 — `<DIR>` sits in `$TMPDIR`, the one root a read seat may write, and a file the seat leaves at that name blocks publication
  - plugins/codex-delegate/skills/seat/SKILL.md:140 — | `SEAT: read [<dir>]` or no header | read any readable path, reach the network, run commands, write only `$TMPDIR`; a write elsewhere asks an approval nobody is there to give, and the run exits 6 | no |
open: The cited nested path plugins/codex-delegate/plugins/codex-delegate/... does not exist; the same claim is present in the shorter current path.

### L09
Codex: claim L09 is settled with status done — MOVED.
Settled location: plugins/codex-delegate/skills/seat/scripts/driver.mjs, at lines 1139–1146, 2113–2114, and 1991–2017.
I checked the cited path, searched the complete current driver and the rest of plugins/codex-delegate, and ruled out a conflicting implementation elsewhere.
quotes:
  - plugins/codex-delegate/skills/seat/scripts/driver.mjs:2113 — const ownTmp = !process.env.TMPDIR && (opts.level === "read" || opts.verifySandboxed);
  - plugins/codex-delegate/skills/seat/scripts/driver.mjs:2114 — if (ownTmp) process.env.TMPDIR = privateTmpDir();
  - plugins/codex-delegate/skills/seat/scripts/driver.mjs:1140 — const base = path.join(stateDir(), "tmp");
  - plugins/codex-delegate/skills/seat/scripts/driver.mjs:1142 — const dir = path.join(base, id);
  - plugins/codex-delegate/skills/seat/scripts/driver.mjs:2003 — const tmp = process.env.TMPDIR;
  - plugins/codex-delegate/skills/seat/scripts/driver.mjs:2005 — const want = canonPath(tmp);
  - plugins/codex-delegate/skills/seat/scripts/driver.mjs:2015 — const ok = cwdIsTmp ? got.length === 0 : (got.length === 1 && got[0] === want);
open: The original double-nested path does not exist in this tree; the implementation is at the single-nested path plugins/codex-delegate/skills/seat/scripts/driver.mjs.

### L11a
Codex concludes claim L11a is done, and the verdict is MOVED.
Location: `plugins/codex-delegate/skills/seat/scripts/driver.mjs:508-511`, in the Environment `--help-all` block.
I checked the cited area, the full driver, rendered `--help-all`, and the surrounding plugin tree; the cited location and other matches were ruled out as the occurrence.
quotes:
  - plugins/codex-delegate/skills/seat/scripts/driver.mjs:321:     more: `  $TMPDIR IS the read-level grant. An explicit one is honoured and takes the
  - plugins/codex-delegate/skills/seat/scripts/driver.mjs:508:   CLAUDE_PLUGIN_DATA            <state> where the variable above is unset: the
  - plugins/codex-delegate/skills/seat/scripts/driver.mjs:509:                                 plugin's own data directory, \${CLAUDE_PLUGIN_DATA}
  - plugins/codex-delegate/skills/seat/scripts/driver.mjs:510:                                 in a skill body, which Claude Code substitutes and
  - plugins/codex-delegate/skills/seat/scripts/driver.mjs:511:                                 the skill recipes pass on the command line; must be
open: The cited-path command started: yes; exit status: unknown; diagnostic: `nl: plugins/codex-delegate/plugins/codex-delegate/skills/seat/scripts/driver.mjs: No such file or directory`.

### L11b
Codex finds claim L11b done: MOVED.
Location: `/Users/ruliny/Git/agent-skills/plugins/codex-delegate/skills/seat/scripts/driver.mjs`, Rights `more` passage at lines 321–334; the source path has an extra directory segment.
I checked both help outputs and the renderer, confirming short help emits `text` while `--help-all` adds `more` and `all` blocks.
quotes:
  - /Users/ruliny/Git/agent-skills/plugins/codex-delegate/skills/seat/scripts/driver.mjs:295: // Two tiers over ONE list. Each subject is written once: --help prints `text`, --help-all prints `text`
  - /Users/ruliny/Git/agent-skills/plugins/codex-delegate/skills/seat/scripts/driver.mjs:321:     more: `  $TMPDIR IS the read-level grant. An explicit one is honoured and takes the
  - /Users/ruliny/Git/agent-skills/plugins/codex-delegate/skills/seat/scripts/driver.mjs:558:     if (b.all && !full) continue;
  - /Users/ruliny/Git/agent-skills/plugins/codex-delegate/skills/seat/scripts/driver.mjs:560:     out.push(full && b.more ? `${b.text}\n${b.more}` : b.text);
  - /Users/ruliny/Git/agent-skills/plugins/codex-delegate/skills/seat/scripts/driver.mjs:713:         process.stdout.write(helpText(a === "--help-all")); process.exitCode = EXIT.OK; settled = true; throw new Bail();
open: The prompt does not quote the passage itself; I mapped it to the cited Rights `more` passage beginning `$TMPDIR IS`.

### L14
Codex — claim L14 — status done — MOVED.
Settled location: /Users/ruliny/Git/agent-skills/plugins/codex-delegate/skills/seat/scripts/driver.mjs, assertReadSandbox at lines 1991–2017.
I checked the relocated assertion, the rest of driver.mjs, and the delegate plugin; the claim holds, and excludeSlashTmp/excludeTmpdirEnvVar are not read by the assertion.
quotes:
  - /Users/ruliny/Git/agent-skills/plugins/codex-delegate/skills/seat/scripts/driver.mjs:1993:  const applied = thread.activePermissionProfile?.id ?? null;
  - /Users/ruliny/Git/agent-skills/plugins/codex-delegate/skills/seat/scripts/driver.mjs:1996:  if (sb?.type !== "workspaceWrite") refuse(`sandbox type is ${JSON.stringify(sb?.type ?? null)}, so the $TMPDIR grant did not apply`);
  - /Users/ruliny/Git/agent-skills/plugins/codex-delegate/skills/seat/scripts/driver.mjs:2000:  assertEgress(sb, refuse);
  - /Users/ruliny/Git/agent-skills/codex-delegate/skills/seat/scripts/driver.mjs:2007:  const got = (sb.writableRoots ?? []).map(canonPath);
  - /Users/ruliny/Git/agent-skills/plugins/codex-delegate/skills/seat/scripts/driver.mjs:2010:  assertWorkspaceRoot(thread, refuse);
  - /Users/ruliny/Git/agent-skills/plugins/codex-delegate/skills/seat/scripts/driver.mjs:2015:  const ok = cwdIsTmp ? got.length === 0 : (got.length === 1 && got[0] === want);
  - /Users/ruliny/Git/agent-skills/plugins/codex-delegate/skills/seat/scripts/driver.mjs:2017:    refuse(`writable roots are ${JSON.stringify(sb.writableRoots ?? [])}, expected exactly [${JSON.stringify(want)}]`);
open: The cited nested path /Users/ruliny/Git/agent-skills/plugins/codex-delegate/plugins/codex-delegate/skills/seat/scripts/driver.mjs is absent; the attempted sed exited 2 with: sed: plugins/codex-delegate/plugins/codex-delegate/skills/seat/scr

### L15
Codex finds claim L15 settled with status done: MOVED.
Location: /Users/ruliny/Git/agent-skills/plugins/codex-delegate/schema-0.153.4/v2/ThreadStartResponse.json, lines 1086 and 1090.
The named double-nested source path is absent, while the current plugin tree contains the pinned schema there; I checked the rest of that file and plugin tree and ruled out the fields being absent.
quotes:
  - /Users/ruliny/Git/agent-skills/plugins/codex-delegate/schema-0.153.4/v2/ThreadStartResponse.json:1086:            "excludeSlashTmp": {
  - /Users/ruliny/Git/agent-skills/plugins/codex-delegate/schema-0.153.4/v2/ThreadStartResponse.json:1090:            "excludeTmpdirEnvVar": {
open: The source path contains an extra plugins/codex-delegate segment and is absent in this checkout; the equivalent pinned schema is one directory higher.

### L16
Codex model: claim L16 is settled — MOVED.
Location: /Users/ruliny/Git/agent-skills/plugins/codex-delegate/skills/seat/scripts/driver.mjs; the supplied path is absent.
Checked the full current driver and the rest of the plugin for both names; schema/eval occurrences and unrelated `excludeTurns` were ruled out as driver hits.
quotes:
  - ISSUES.md:48-54 — "### C5. The read-level sandbox assertion ignores `excludeSlashTmp` and `excludeTmpdirEnvVar`" ... `grep -n excludeSlashTmp driver.mjs` returns nothing.
  - plugins/codex-delegate/schema-0.153.4/v2/ThreadStartResponse.json:1086-1092 — "            \"excludeSlashTmp\": {\n              \"default\": false,\n              \"type\": \"boolean\"\n            },\n            \"excludeTmpdirEnvVar\": {\n              \"d
  - plugins/codex-delegate/skills/seat/scripts/driver.mjs:1991-2000 — "function assertReadSandbox(thread) {\n  const refuse = (why) => refuseSandbox(\"read\", why);\n  const applied = thread.activePermissionProfile?.id ?? null;\n  if (applied !== READ_PROFILE) ref
  - plugins/codex-delegate/skills/seat/scripts/driver.mjs:2001-2017 — "  // Check that setup() supplied TMPDIR before resolving it: path.resolve(\"\") would substitute the cwd\n  // and misidentify the expected writable root.\n  const tmp = process.env.TMPDIR;\n  
  - plugins/codex-delegate/skills/seat/scripts/driver.mjs:3802-3806 — "  // excludeTurns: the driver never reads thread.turns off the response, and every thread created under\n  // 0.153.4 is paginated — for those full-history hydration is deprecated. Measured: a 
open: Command `ls -l plugins/codex-delegate/plugins/codex-delegate/skills/seat/scripts/driver.mjs && nl -ba plugins/codex-delegate/plugins/codex-delegate/skills/seat/scripts/driver.mjs | sed -n '1,260p'` started; exit status unknown; diagnostic: 

### L18
Codex finds claim id L18 status done: MOVED.
Location: plugins/codex-delegate/skills/seat/scripts/cleanup.mjs:227-230.
I checked the cited path, the current cleanup script, and the rest of plugins/codex-delegate; the logic is present at the moved location and no contrary implementation was found.
quotes:
  - plugins/codex-delegate/skills/seat/scripts/cleanup.mjs:227-230 — "  const tmp = process.env.TMPDIR;\n  if (!tmp || !path.isAbsolute(tmp))\n    die("TMPDIR is not set to an absolute path, and the seat and test files live under it. "\n      + "Nothing was delete
open: The source’s cited nested path does not exist in this tree; the cleanup script is now at plugins/codex-delegate/skills/seat/scripts/cleanup.mjs.

### L19
GPT-5, claim L19, status done: MOVED.
Location: /Users/ruliny/Git/agent-skills/plugins/codex-delegate/skills/seat/scripts/driver.mjs:1218-1228.
I checked the relocated helper and searched the rest of the plugin; the configured isolated CODEX_HOME is stateDir()/home, while both auth.json and sessions target passwdHome()/.codex, and no competing implementation was found.
quotes:
  - /Users/ruliny/Git/agent-skills/plugins/codex-delegate/skills/seat/scripts/driver.mjs:1222:   const base = passwdHome("the isolated Codex home");
  - /Users/ruliny/Git/agent-skills/plugins/codex-delegate/skills/seat/scripts/driver.mjs:1224:   const home = path.join(stateDir(), "home");
  - /Users/ruliny/Git/agent-skills/plugins/codex-delegate/skills/seat/scripts/driver.mjs:1228:     const link = path.join(home, name), target = path.join(base, ".codex", name);
  - /Users/ruliny/Git/agent-skills/plugins/codex-delegate/skills/seat/scripts/driver.mjs:2138:   codexHome = opts.hostHome ? null : await isolatedHome();
  - /Users/ruliny/Git/agent-skills/plugins/codex-delegate/skills/seat/scripts/driver.mjs:3694:     env: { ...process.env, ...(codexHome === null ? {} : { CODEX_HOME: codexHome }),
open: The originally cited path with two consecutive plugins/codex-delegate segments does not exist; the exact command failed with: nl: plugins/codex-delegate/plugins/codex-delegate/skills/seat/scripts/driver.mjs: No such file or directory

### L20
Codex settles claim L20 with status done: MOVED.
Location: plugins/codex-delegate/skills/seat/scripts/driver.mjs:1056-1058.
I checked the current driver and plugin-wide matches, and ruled out the later turn spawn as applying its explicit CODEX_HOME override to the probe.
quotes:
  - plugins/codex-delegate/skills/seat/scripts/driver.mjs:1056:   // Read the caller's config without overriding CODEX_HOME, starting a thread or calling a model.
  - plugins/codex-delegate/skills/seat/scripts/driver.mjs:1058:   try { probe = spawn(codexBin, ["--strict-config", "app-server"], { stdio: ["pipe", "pipe", "pipe"], detached: true }); }
  - plugins/codex-delegate/skills/seat/scripts/driver.mjs:1257:   let probe = await inheritedConfig();
  - plugins/codex-delegate/skills/seat/scripts/driver.mjs:3694:     env: { ...process.env, ...(codexHome === null ? {} : { CODEX_HOME: codexHome }),
open: The cited source path contains a duplicated plugins/codex-delegate segment and does not exist; the driver is currently one directory higher at plugins/codex-delegate/skills/seat/scripts/driver.mjs.

### L21
Codex, claim L21, status done: MOVED.
Settled location: plugins/codex-delegate/skills/seat/SKILL.md:200.
I checked the cited path, the full current seat file, and the rest of plugins/codex-delegate; the claim remains true, and I ruled out a false verdict caused by the relocated path.
quotes:
  - plugins/codex-delegate/skills/seat/SKILL.md:200: - When the turn failed or harvest failed, the driver preserves it and reports `worktreePreserved`.
  - plugins/codex-delegate/skills/seat/SKILL.md:201: - A preserved tree is not a harvest: `worktreeDiffPath`, `worktreeUntrackedPath` and `worktreeCommitsRef`
open: Command started; exit status 0 (pipeline): `nl -ba plugins/codex-delegate/plugins/codex-delegate/skills/seat/SKILL.md | sed -n '180,220p'`; diagnostic: `nl: plugins/codex-delegate/plugins/codex-delegate/skills/seat/SKILL.md: No such file or

### L22
Codex (GPT-5), claim L22, status done: MOVED.
Location: /Users/ruliny/Git/agent-skills/plugins/codex-delegate/skills/seat/scripts/driver.mjs:970-973.
I checked all pre-turn report call sites and report shapes under plugins/codex-delegate; the seven-key pre-turn object has no worktree field, while worktree fields belong to the post-turn report.
quotes:
  - plugins/codex-delegate/skills/seat/scripts/driver.mjs:967: // A refusal reached before there is a turn to report is still an answer to whoever is waiting on the
  - plugins/codex-delegate/skills/seat/scripts/driver.mjs:970: function preTurnReport(code, msg) {
  - plugins/codex-delegate/skills/seat/scripts/driver.mjs:972:   publishReport(`${JSON.stringify({ ok: false, exitCode: code, threadId: rootThreadId,
  - plugins/codex-delegate/skills/seat/scripts/driver.mjs:973:     turnStatus: null, answer: "", error: msg, reportPath: reportFilePath }, null, 2)}\n`);
  - plugins/codex-delegate/skills/seat/scripts/driver.mjs:3372:   const worktree = disposeWorktree(turnStatus === "completed");
  - plugins/codex-delegate/skills/seat/scripts/driver.mjs:3460:     ...(worktree ?? {}),
open: The supplied nested source path does not exist in this tree; the code is at the location above, which is why the verdict is MOVED rather than HOLDS.

### L28
GPT-5 settled claim L28 with status done: MOVED.
Settled location: /Users/ruliny/Git/agent-skills/plugins/codex-delegate/skills/seat/scripts/driver.mjs:614.
I checked the parser and the rest of the plugin; WRITABLE is the only duplicate exception, and no alternate parser or exception was found.
quotes:
  - /Users/ruliny/Git/agent-skills/plugins/codex-delegate/skills/seat/scripts/driver.mjs:599:   const out = [], seen = new Set(), declared = [];
  - /Users/ruliny/Git/agent-skills/plugins/codex-delegate/skills/seat/scripts/driver.mjs:614:     if (field !== "WRITABLE" && seen.has(field)) fail(EXIT.USAGE, `--seat-file: ${field} appears more than once`);
  - /Users/ruliny/Git/agent-skills/plugins/codex-delegate/skills/seat/scripts/driver.mjs:617:     seen.add(field);
  - /Users/ruliny/Git/agent-skills/plugins/codex-delegate/skills/seat/scripts/driver.mjs:196:   { name: "WRITABLE", kind: "value", flag: "--writable" },
open: The named path contains an extra plugins/codex-delegate segment and does not exist; the implementation is at the settled path, with the relevant line now 614 rather than approximately 612.

## Codex Sol SA

GPT-5 Codex, id SA: done; five of the seven claims hold.

L10 — HOLDS
Correct location: current `driver.mjs:1139-1156` and caller `:2111-2114`. The named `privateTmpDir()` constructs `<state>/tmp/<id>`, returns it, and its caller assigns it to `process.env.TMPDIR` when the caller supplied none.

L12 — HOLDS
Correct location: `why-not-the-plugin.md:66-71`; local `codex exec --help` lines 54-60. The undivided table cell says “no” for “approval / sandbox,” supporting the broad reading that neither is per-call, while codex-cli 0.153.4 explicitly offers `--sandbox`; it offers automatic approval review but no general per-call approval-policy selector. Command: `codex exec --help 2>&1 | nl -ba`.

L13 — HOLDS
Correct location: `why-not-the-plugin.md:61-84`. Under the page’s combined meaning of “rights” (approval plus sandbox), the sentence stands: `exec` has the machine-checkable `--json` signal and a per-call sandbox but lacks an approval policy usable through the documented managed clamp, while `mcp-server` has rights parameters but returns no machine-checkable command status.

L17 — FAILS
Correct location: nowhere in the tracked plugin at HEAD or `codex-delegate@0.13.0`; the nearest README wording is current `README.md:152-154` and tag `README.md:148-150`, and it concerns report verdicts rather than server grants. Commands `git grep -n -i -F "the run stops if the server grants anything else" HEAD -- plugins/codex-delegate` and the same command with `codex-delegate@0.13.0` both started and exited 1 with no matches; broader searches found only the quoted, unrelated README wording.

L23 — FAILS
Correct location: current `driver.mjs:1916-1932` (tag `:1914-1930`). If there is no child, status succeeds, the tree is clean, and `git worktree remove` succeeds, the helper removes the tree and ledger silently; it preserves and writes stderr only when a child exists or that clean-removal sequence does not succeed, although the narrower observation that `preTurnReport` has no worktree field remains true.

L24 — HOLDS
Correct location: current `driver.mjs:525-541`, specifically `:539`; tag `codex-delegate@0.13.0` at `:523-539`, specifically `:537`. Both versions say verbatim that “an argument error prints none”; commands were `nl -ba plugins/codex-delegate/skills/seat/scripts/driver.mjs | sed -n '525,541p'` and `git show codex-delegate@0.13.0:plugins/codex-delegate/skills/seat/scripts/driver.mjs | nl -ba | sed -n '523,539p'`.

L25 — HOLDS
Correct location and chain: `main():3749-3750` → `readOpts():2036-2064`, which opens `--report-file` before calling `stateDir()` → missing-state failure at `:997-1004` → `fail():156-165` → `preTurnReport():970-973` → `publishReport():948-965`. A live run with both state variables unset exited 2 and published the complete nine-line report quoted in evidence. Diagnostic note: `mktemp -d /tmp/codex-ledger-c9.XXXXXX` — started: yes; exit: 1; diagnostic: `mktemp: mkdtemp failed on /tmp/codex-ledger-c9.QmQM6M: Operation not permitted`; the run continued in the permitted temporary root.

quotes:
  - plugins/codex-delegate/skills/seat/scripts/driver.mjs:39 — `const VERSION = "0.14.0";`
  - plugins/codex-delegate/skills/seat/scripts/driver.mjs:1139-1146 — 1139 `function privateTmpDir() {` 1140 `  const base = path.join(stateDir(), "tmp");` 1141 `  const id = `${Date.now().toString(36)}-${crypto.randomBytes(4).toString("hex")}`;` 1142 `  const dir = path.join(base, id);` 1143 `  try {` 
  - plugins/codex-delegate/skills/seat/scripts/driver.mjs:1155-1156 — 1155 `  privateTmp = dir;` 1156 `  return dir;`
  - plugins/codex-delegate/skills/seat/scripts/driver.mjs:2111-2114 — 2111 `  // $TMPDIR IS the read level's whole grant; a private directory of the run's own is narrower than /tmp.` 2112 `  // Set on process.env because the codex spawn and `codex sandbox :tmpdir` read it.` 2113 `  const ownTmp = !proce
  - plugins/codex-delegate/skills/seat/references/why-not-the-plugin.md:66-71 — 66 `| | `codex exec` | `codex mcp-server` | `codex app-server` |` 67 `| --- | --- | --- | --- |` 68 `| status | stable | stable, surface measured 2026-09-01 | `[experimental]` per `codex --help` |` 69 `| per-call approval / 
  - <codex exec --help>:54-60 — 54 `  -s, --sandbox <SANDBOX_MODE>` 55 `          Select the sandbox policy to use when executing model-generated shell commands` 56 `          ` 57 `          [possible values: read-only, workspace-write, danger-full-access]` 58 `` 59 `      --approve-for-me` 60 `       
  - <codex --version>:2 — `codex-cli 0.153.4`
  - plugins/codex-delegate/skills/seat/references/why-not-the-plugin.md:61-64 — 61 `wrappers around it. `codex exec` forces `approval_policy=Never` internally, after config is loaded, so` 62 `it hits the same clamp on managed machines — no `-c` override reaches it (three spellings tried, all` 63 ``appro
  - plugins/codex-delegate/skills/seat/references/why-not-the-plugin.md:74-84 — 74 ``app-server` is the only surface with both per-call rights and a machine-checkable execution signal —` 75 `and it is what the official plugin itself uses, so it is the de facto integration path despite the` 76 `label.` 7
  - ISSUES.md:54-56 — 54 `excludeSlashTmp driver.mjs` returns nothing. Level 2; a synthetic response through the unchanged function` 55 `was accepted either way (Astra, 2026-09-12). The README's "the run stops if the server grants anything` 56 `else" is stronger than the check.`
  - plugins/codex-delegate/README.md:152-154 — 152 `The JSON report — the only report — ends with the verdict: `exitCode: 0` means the turn completed, every` 153 `declared check passed, and a command really ran; anything else is a specific complaint — the driver's` 154 ``--help` documents the full ladde
  - codex-delegate@0.13.0:plugins/codex-delegate/README.md:148-150 — 148 `The JSON report — the only report — ends with the verdict: `exitCode: 0` means the turn completed, every` 149 `declared check passed, and a command really ran; anything else is a specific complaint — the driver's` 150 ``--help` do
  - plugins/codex-delegate/skills/seat/scripts/driver.mjs:1916-1932 — 1916 `// The synchronous last resort, for runs that end without reaching finish() — a usage error after the` 1917 `// tree was created, a Bail, a crash. A tree whose turn never started cannot hold work and is removed;` 1918 `// anythi
  - plugins/codex-delegate/skills/seat/scripts/driver.mjs:536-541 — 536 `  and 4 once more at the very end, if the report could not reach stdout — a closed` 537 `  pipe, or a consumer that never drained it within what was left of --timeout (at` 538 `  least ${LIMITS.STDOUT_DRAIN_MIN_MS / 1000} s, and ex
  - codex-delegate@0.13.0:plugins/codex-delegate/skills/seat/scripts/driver.mjs:534-539 — 534 `  and 4 once more at the very end, if the report could not reach stdout — a closed` 535 `  pipe, or a consumer that never drained it within what was left of --timeout (at` 536 `  least ${LIMITS.STDOUT_DRAIN_MI
  - plugins/codex-delegate/skills/seat/scripts/driver.mjs:2036-2042 — 2036 `  const argv = process.argv.slice(2);` 2037 `  // Opened FIRST, before any other refusal this function can raise, and off the raw command line: the` 2038 `  // file the caller waits on has to exist for every refusal, including t
  - plugins/codex-delegate/skills/seat/scripts/driver.mjs:2062-2064 — 2062 `  // The one place the state root is resolved. Here rather than at each use, so a root this driver cannot` 2063 `  // work with is refused at parse time rather than halfway through the run that needs it.` 2064 `  stateDir();`
  - plugins/codex-delegate/skills/seat/scripts/driver.mjs:997-1004 — 997 `function stateDir() {` 998 `  if (stateRoot !== null) return stateRoot;` 999 `  const named = process.env.CODEX_DELEGATE_STATE_DIR ? "CODEX_DELEGATE_STATE_DIR"` 1000 `    : process.env.CLAUDE_PLUGIN_DATA ? "CLAUDE_PLUGIN_DATA" : n
  - plugins/codex-delegate/skills/seat/scripts/driver.mjs:156-165 — 156 `function fail(code, msg) {` 157 `  process.stderr.write(`codex-delegate: ${msg}\n`);` 158 `  // A caller waiting on the report file is waiting on it for refusals too: an empty path reads as` 159 `  // "unknown", and a refusal that 
  - plugins/codex-delegate/skills/seat/scripts/driver.mjs:948-965 — 948 `function publishReport(text) {` 949 `  if (reportFilePath === null || reportFileWritten) return reportFileWritten;` 950 `  const tmp = `${reportFilePath}.${crypto.randomBytes(8).toString("hex")}.tmp`;` 951 `  try {` 952 `    fs.wri
  - plugins/codex-delegate/skills/seat/scripts/driver.mjs:970-973 — 970 `function preTurnReport(code, msg) {` 971 `  if (reportFilePath === null || reportFileWritten) return;` 972 `  publishReport(`${JSON.stringify({ ok: false, exitCode: code, threadId: rootThreadId,` 973 `    turnStatus: null, answer: 
  - /private/var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/codex-ledger-c9.RCsXfz/report.json:1 — `{`
  - /private/var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/codex-ledger-c9.RCsXfz/report.json:2 — `  "ok": false,`
  - /private/var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/codex-ledger-c9.RCsXfz/report.json:3 — `  "exitCode": 2,`
  - /private/var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/codex-ledger-c9.RCsXfz/report.json:4 — `  "threadId": null,`
  - /private/var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/codex-ledger-c9.RCsXfz/report.json:5 — `  "turnStatus": null,`
  - /private/var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/codex-ledger-c9.RCsXfz/report.json:6 — `  "answer": "",`
  - /private/var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/codex-ledger-c9.RCsXfz/report.json:7 — `  "error": "no state directory: set CODEX_DELEGATE_STATE_DIR, or pass CLAUDE_PLUGIN_DATA, the plugin's data directory ${CLAUDE_PLUGIN_DATA}, which the skill recipes carry; this driver keeps no default of
  - /private/var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/codex-ledger-c9.RCsXfz/report.json:8 — `  "reportPath": "/private/var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/codex-ledger-c9.RCsXfz/report.json"`
  - /private/var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/codex-ledger-c9.RCsXfz/report.json:9 — `}`

## Codex Sol SB

Codex GPT-5 SB is done: all eight claims are settled, and six of the eight hold at 0.14.0.

L26 — HOLDS — `skills/seat/SKILL.md:142`. The current write-seat rights row still promises writing “under the live directory” and calls that directory the blast radius.

L27 — HOLDS — `skills/seat/references/why-not-the-plugin.md:46-48`. The current reference still says `workspace-write` opens both `$TMPDIR` and `/tmp` as a side effect.

L33 — HOLDS — `skills/seat/scripts/driver.mjs:2169-2174,3810-3812`. The write configuration contains only network access and writable roots, omits both available temporary-directory exclusions, and the later comment explicitly calls the writable-root boundary escapable.

L34 — HOLDS — `skills/seat/scripts/driver.mjs:2111-2114`; `skills/seat/SKILL.md:155-157`. For read seats the driver creates private scratch only when inherited `TMPDIR` is absent; otherwise concurrent seats inherit the coordinator’s directory, and the seat page documents the resulting shared-state caveat.

L29 — FIXED — old `codex-delegate@0.13.0:skills/seat/SKILL.md:147-148`; current `skills/seat/SKILL.md:219-222`; deliberate change recorded at `CHANGELOG.md:77-81`. Old command: `git show 'codex-delegate@0.13.0:plugins/codex-delegate/skills/seat/SKILL.md' | nl -ba | sed -n '138,154p'`; current command: `nl -ba plugins/codex-delegate/skills/seat/SKILL.md | sed -n '206,228p'`. Version 0.13.0 said exit 2 was always pre-turn with null status; 0.14.0 explicitly distinguishes pre-turn and server-rejected post-turn forms.

L30 — HOLDS — `skills/seat/scripts/driver.mjs:239-240`. Exit 2 is selected for an invalid server request when `turnStatus !== "completed"`, which includes non-null statuses and is not a null-status test.

L31 — HOLDS — implementation at `skills/seat/scripts/driver.mjs:2431,2555,3436`. I counted 12 coordinator-facing operational surfaces: `README.md`; all three `skills/*/SKILL.md` pages; all six Markdown files under `skills/seat/references/`; driver `--help`; and driver `--help-all`. All returned zero matches for the literal report-field name `escalations`; the wrapper-facing `agents/codex-seat.md` was separately checked and also returned zero.

L32 — FIXED — old `codex-delegate@0.13.0:skills/seat/scripts/driver.mjs:247-248`; current `skills/seat/scripts/driver.mjs:247-248`; deliberate change recorded at `CHANGELOG.md:82-84`. Old command: `git show 'codex-delegate@0.13.0:plugins/codex-delegate/skills/seat/scripts/driver.mjs' | nl -ba | sed -n '243,249p'`; current command: `nl -ba plugins/codex-delegate/skills/seat/scripts/driver.mjs | sed -n '243,249p'`. The rung now describes a declined request without assigning that one cause, but the older “sandbox was sized too small” diagnosis survives in the current comment at line 2431, with synonymous wording at lines 20-22.

Write-boundary finding — The finding still stands at 0.14.0 and is both a code defect, because the driver leaves the available temporary-directory exclusions disabled, and a documentation contradiction, because the rights row promises a directory-only boundary while the reference acknowledges the wider one.

quotes:
  - plugins/codex-delegate/skills/seat/SKILL.md:142: `| `SEAT: write <dir>` | write under the live directory | yes; this chooses the blast radius |`
  - plugins/codex-delegate/skills/seat/references/why-not-the-plugin.md:46: `**Scope this honestly.** On an unmanaged machine the plugin's `--write` path is serviceable for`
  - plugins/codex-delegate/skills/seat/references/why-not-the-plugin.md:47: `in-repo tasks (`workspace-write` opens `$TMPDIR` and `/tmp` as a side effect). It is the read/review`
  - plugins/codex-delegate/skills/seat/scripts/driver.mjs:2169: `    // Send write-level sandbox settings unconditionally, unlike the optional --effort above:`
  - plugins/codex-delegate/skills/seat/scripts/driver.mjs:2170: `    // the sandbox must depend only on the declared flags, which assertWriteSandbox checks against the response.`
  - plugins/codex-delegate/skills/seat/scripts/driver.mjs:2171: `    ...(opts.level === "write" ? [`
  - plugins/codex-delegate/skills/seat/scripts/driver.mjs:2172: `      ["sandbox_workspace_write.network_access", String(opts.network)],`
  - plugins/codex-delegate/skills/seat/scripts/driver.mjs:2173: `      ["sandbox_workspace_write.writable_roots", `[${roots.map((r) => JSON.stringify(r)).join(",")}]`]`
  - plugins/codex-delegate/skills/seat/scripts/driver.mjs:2174: `    ] : [])`
  - plugins/codex-delegate/skills/seat/scripts/driver.mjs:3810: `  // Asked for above, asserted here, at BOTH levels — write level's writable-root boundary is escapable the`
  - plugins/codex-delegate/skills/seat/scripts/driver.mjs:3811: `  // same way. The field is `required` on the response in the pinned schema, so a server that stops sending`
  - plugins/codex-delegate/skills/seat/scripts/driver.mjs:3812: `  // it yields undefined and refuses: fail-closed by construction rather than by convention.`
  - plugins/codex-delegate/skills/seat/scripts/driver.mjs:2111: `  // $TMPDIR IS the read level's whole grant; a private directory of the run's own is narrower than /tmp.`
  - plugins/codex-delegate/skills/seat/scripts/driver.mjs:2112: `  // Set on process.env because the codex spawn and `codex sandbox :tmpdir` read it.`
  - plugins/codex-delegate/skills/seat/scripts/driver.mjs:2113: `  const ownTmp = !process.env.TMPDIR && (opts.level === "read" || opts.verifySandboxed);`
  - plugins/codex-delegate/skills/seat/scripts/driver.mjs:2114: `  if (ownTmp) process.env.TMPDIR = privateTmpDir();`
  - plugins/codex-delegate/skills/seat/SKILL.md:155: `Read seats may share one cwd, but a repository whose tooling keeps a daemon, a socket, or a pid/state`
  - plugins/codex-delegate/skills/seat/SKILL.md:156: `file needs a distinct cwd or its own `TMPDIR` per concurrent seat; the failure is a native crash, not a`
  - plugins/codex-delegate/skills/seat/SKILL.md:157: `sandbox refusal.`
  - codex-delegate@0.13.0:plugins/codex-delegate/skills/seat/SKILL.md:147: `- Exit 2 is always a refusal before the turn: `ok: false`, `turnStatus: null`, the reason in `error`,`
  - codex-delegate@0.13.0:plugins/codex-delegate/skills/seat/SKILL.md:148: `  no receipt.`
  - plugins/codex-delegate/skills/seat/SKILL.md:219: `- Exit 2 has two shapes, and the report tells them apart. With `turnStatus: null` no turn ran: the reason`
  - plugins/codex-delegate/skills/seat/SKILL.md:220: `  is in `error` and there is no receipt. With any other `turnStatus` the turn ran and the server rejected`
  - plugins/codex-delegate/skills/seat/SKILL.md:221: `  the request: the reason is in `turnError`, and the commands, any retained answer and the receipt are`
  - plugins/codex-delegate/skills/seat/SKILL.md:222: `  real. Read them before relaunching, or a paid turn is thrown away.`
  - plugins/codex-delegate/CHANGELOG.md:77: `- Exit 2 is no longer described as always pre-turn: the ladder has a post-turn rung with the same code`
  - plugins/codex-delegate/CHANGELOG.md:78: `  whose report carries commands, an answer and a receipt, and the absolute wording had readers discard`
  - plugins/codex-delegate/CHANGELOG.md:79: `  paid turns. `EXPECT:` says that it counts only commands that succeeded, so a verifier whose suite`
  - plugins/codex-delegate/skills/seat/scripts/driver.mjs:239: `  { code: EXIT.USAGE, help: "the server refused the request",`
  - plugins/codex-delegate/skills/seat/scripts/driver.mjs:240: `    when: (c) => c.turnStatus !== "completed" && invalidRequest(c.turnError) },`
  - plugins/codex-delegate/skills/seat/scripts/driver.mjs:2431: `const escalations = [];     // refused permission requests — the sandbox was sized too small`
  - plugins/codex-delegate/skills/seat/scripts/driver.mjs:2555: `    escalations.push({ method: msg.method, detail, thread: owner, subagent: foreign });`
  - plugins/codex-delegate/skills/seat/scripts/driver.mjs:3436: `    escalations, interactions, unparsedLines, expectCommand: opts.expect ?? null,`
  - plugins/codex-delegate/skills/seat/SKILL.md:22: `Everything below is addressed to the coordinator. What reaches the user is prose you write in their own`
  - plugins/codex-delegate/skills/seat/SKILL.md:275: `- `node "${CLAUDE_SKILL_DIR}/scripts/driver.mjs" --help` is the canonical inventory of the flags a coordinator sets; `--help-all` adds the rarely needed ones, the `CODEX_DELEGATE_*` variables and the internals.`
  - L31-search-output:1: `plugins/codex-delegate/README.md: 0 matches`
  - L31-search-output:2: `plugins/codex-delegate/skills/seat/SKILL.md: 0 matches`
  - L31-search-output:3: `plugins/codex-delegate/skills/orchestrate/SKILL.md: 0 matches`
  - L31-search-output:4: `plugins/codex-delegate/skills/cleanup/SKILL.md: 0 matches`
  - L31-search-output:5: `plugins/codex-delegate/agents/codex-seat.md: 0 matches`
  - L31-search-output:6: `plugins/codex-delegate/skills/seat/references/adversarial-review.md: 0 matches`
  - L31-search-output:7: `plugins/codex-delegate/skills/seat/references/environment-and-internals.md: 0 matches`
  - L31-search-output:8: `plugins/codex-delegate/skills/seat/references/incidents.md: 0 matches`
  - L31-search-output:9: `plugins/codex-delegate/skills/seat/references/parity.md: 0 matches`
  - L31-search-output:10: `plugins/codex-delegate/skills/seat/references/result-gates.md: 0 matches`
  - L31-search-output:11: `plugins/codex-delegate/skills/seat/references/why-not-the-plugin.md: 0 matches`
  - L31-search-output:12: `driver --help: 0 matches`
  - L31-search-output:13: `driver --help-all: 0 matches`
  - codex-delegate@0.13.0:plugins/codex-delegate/skills/seat/scripts/driver.mjs:247: `  { code: EXIT.ESCALATED, help: "an approval was refused: the sandbox was sized too small",`
  - codex-delegate@0.13.0:plugins/codex-delegate/skills/seat/scripts/driver.mjs:248: `    when: (c) => c.escalations.length > 0 },`
  - plugins/codex-delegate/skills/seat/scripts/driver.mjs:247: `  { code: EXIT.ESCALATED, help: "an approval request was declined; inspect the report, if delivered, before judging task completeness",`
  - plugins/codex-delegate/skills/seat/scripts/driver.mjs:248: `    when: (c) => c.escalations.length > 0 },`
  - plugins/codex-delegate/skills/seat/scripts/driver.mjs:20: `// Escalation policy: an escalation request means the sandbox was sized wrong for the task, so it is`
  - plugins/codex-delegate/skills/seat/scripts/driver.mjs:21: `// surfaced loudly rather than silently waved through or silently refused. Widen the sandbox with`
  - plugins/codex-delegate/skills/seat/scripts/driver.mjs:22: `// --writable, or drop the --no-network the seat was given, instead of trying to approve your way out.`
  - plugins/codex-delegate/CHANGELOG.md:82: `- A declined approval stops reading as a lost turn. Exit 6 kept its number and its symbol, while the`
  - plugins/codex-delegate/CHANGELOG.md:83: `  help text, the ladder comment and a new closing line say what actually happened; the line is guarded`
  - plugins/codex-delegate/CHANGELOG.md:84: `  by every condition it asserts, so it cannot promise a retained answer on a cut or answerless turn.`
  - plugins/codex-delegate/schema-0.153.4/v2/ConfigReadResponse.json:990: `        "exclude_slash_tmp": {`
  - plugins/codex-delegate/schema-0.153.4/v2/ConfigReadResponse.json:991: `          "default": false,`
  - plugins/codex-delegate/schema-0.153.4/v2/ConfigReadResponse.json:992: `          "type": "boolean"`
  - plugins/codex-delegate/schema-0.153.4/v2/ConfigReadResponse.json:994: `        "exclude_tmpdir_env_var": {`
  - plugins/codex-delegate/schema-0.153.4/v2/ConfigReadResponse.json:995: `          "default": false,`
  - plugins/codex-delegate/schema-0.153.4/v2/ConfigReadResponse.json:996: `          "type": "boolean"`

