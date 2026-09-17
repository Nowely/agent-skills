# Changelog

Hand-written per release from the tagged git log. Dates are the tagged commit dates; detailed
forensics remain in the repository references and release notes.

## Unreleased

### Changed

- The codex page's `EFFORT:` row lists what the catalogue advertises and says that no line inherits
  `~/.codex/config.toml`; the driver's `--help` says the same, and its comment beside the set records that no
  model on codex 0.153.4 advertises `none` or `minimal`. The set itself is unchanged: those two still reach
  model/list and are refused there, exit 2 before a turn. Why: a coordinator picked `minimal` for a one-line task
  straight from the table and paid a wrapper launch for the refusal (measured 2026-09-17), and a driver that
  clamped instead would re-create the silent downgrade incidents.md records.

## 0.16.0 — 2026-09-17

### Changed

- **Breaking: the plugin is `entrust`.** It installs as `entrust@nowely`, its skills are `/entrust:codex`,
  `/entrust:orchestrate` and `/entrust:cleanup`, its wrapper is `entrust:codex-agent`, its data directory is
  `~/.claude/plugins/data/entrust-nowely/`, its environment variables are `ENTRUST_*` (`ENTRUST_STATE_DIR` and
  the eleven others), the driver's stderr prefix is `entrust:`, the worktree refs it writes into your
  repository are `refs/entrust/*`, the sandbox profile is
  `entrust_read`, and the app-server sees `clientInfo.title: "entrust"`. Release tags start a new series,
  `entrust@0.16.0`; the seventeen `codex-delegate@*` tags stay where they are. Nothing is aliased: an exported
  `CODEX_DELEGATE_STATE_DIR` is ignored, a prompt file is unchanged, and the old data directory is neither
  read nor moved. The one hand back: `/entrust:cleanup` lists a `codex-delegate-<marketplace>` directory beside
  the plugin's own as "the data directory of this plugin under its previous name" and proposes it for removal.
  Why the name: a plugin whose name says "Codex" is a Codex plugin, and this one is the contract that lets
  Claude Code run another vendor's agent as its own subagent under declared rights, with a verdict derived
  from evidence and a plan the user approves; three blind naming rounds on 2026-09-17 (seven coiners, eighteen
  recognition readers, two judges) put `entrust` first for carrying rights and the plan gate, read
  «поручи», and found it clean in the agent-tooling niche, where `delegate` collides with Claude Code's own
  delegate mode and four plugins. To move a machine: `claude plugin uninstall --keep-data codex-delegate@nowely`,
  `mv ~/.claude/plugins/data/codex-delegate-nowely ~/.claude/plugins/data/entrust-nowely`, install
  `entrust@nowely`; never `marketplace remove`, which deletes the data.
- **Breaking: the word "seat" is gone.** The concept is an agent, the main skill is `codex`
  (`/entrust:codex`, directory `skills/codex/`), the wrapper is `entrust:codex-agent`, the
  prompt-file rights line is `RIGHTS: read | worktree <repo> | write <dir>`, and the driver flags are
  `--prompt-file` and `--allow-prompt-verify`. No alias: a prompt file that still starts with `SEAT:` exits 2
  naming the field, and the old flags are unknown arguments. The report field `seatFileFields` is
  `promptFileFields`; the cleanup listing's row kind `seat` is `agent`. Why: a coordinator writing to a
  Russian-speaking owner translated the page's noun word for word into the one that means a chair
  (measured 2026-09-09 on 0.11.1, and again in a session on 0.15.0 reported 2026-09-16), and the
  "What the user reads" section that shipped after the first time had not named the word it was banning.
  The name form in prose is unchanged: "Codex Sol R1", never "Codex agent Sol R1".
- The codex page says what shape the sentence about an agent has: the agent by name is the subject and what
  it does or did is the verb, whatever runs beside it and how long follows in the user's own words for the
  tools, and the model slug, `wrapper` and `driver` are machinery like a field name. Measured on
  2026-09-16 with three Sonnet readers given the same Russian situation before and after: the name form
  "Codex Sol R1" appeared verbatim in none of three before and all three after, the model slug leaked in one
  before and none after, "seat" in none either way; one run each, not a rate.

### Fixed

- The README and parity.md no longer say an agent is a background Bash call of the driver: since 0.14.0 it
  is the `codex-agent` wrapper, an Agent call with a card on the agent map, whose own Bash task runs the
  driver; the One call block said so and the two sentences contradicted it.
- A `--resume` turn no longer overwrites the earlier turn's answer file. The answer log named its file for
  the thread, so after a second turn the first report's `answerPath` held the second turn's answer
  (measured 2026-09-15 on a resumed review: a 4,501-byte second answer where the first turn's was 6,734
  chars). Every answer file is now named for the run, `<threadId>-<startedAtMs>`, `.partial` and
  `.commentary` with it; the turn diff and the worktree harvest stay thread-named, because the harvest is
  rebuilt per turn and `disposeWorktree` guards on that one path. A flow in `evals/cli.test.mjs` runs two
  turns on one thread and reads the first file back; reverting the name turns it red.
- `commandsDeclined` is a report field of its own, and `commandsFailed` counts only commands that ran and
  failed. The one count held both and overlapped `escalations`, and no help text said so (2026-09-14: a
  seat reported `commandsFailed: 10` over 8 failed and 2 declined). The exit ladder reads neither count and
  is unchanged; `--help-all` and `references/result-gates.md` say the two are disjoint and that
  `commandsDeclined` counts commands where `escalations` counts approval requests. A case in
  `evals/protocol.test.mjs` pins the split at the same exit 6.
- `tokenUsage.total` is documented as the current turn's cost, not thread-cumulative across `--resume`:
  `--help-all`, the driver's comment and `references/environment-and-internals.md` said cumulative, while
  the same reference paragraph two lines down said a single turn (measured 2026-09-15 on codex 0.153.4: a
  resumed turn reported 658,350 on a thread whose first turn had reported 3,722,152). To cost a thread, sum
  one report per turn.
- The wrapper's `FIRST=` line reads the first line of `answerJson.result` when the seat ran under an
  `OUTPUT_SCHEMA:`, capped at 300 characters. It read `answer`, which under a schema is the JSON text, so
  the line was `{` or the whole answer on one line in seven of seven orchestrated runs (2026-09-14/15) and
  never the sentence the seat page promises.

### Changed

- The orchestrate page waits on a Codex seat by its driver's exit marker, through a quiet background Bash
  task and `TaskOutput` on that task, instead of a blocking `TaskOutput` on the running wrapper: the
  blocking call returned about 32 KB of the wrapper's transcript at the ten-minute timeout, seven of seven
  (measured 2026-09-15/16 in three sessions, and twice more on 2026-09-16 under extension 2.1.272), where a
  poll on the marker returned one line, seven of seven. A Claude seat has no marker and is waited on by its
  Agent task as before. Case F6 in `evals/orchestrate.test.mjs` pins the new sentences.

## 0.15.0 — 2026-09-13

### Changed

- The orchestrate page gains three rules from the 2026-09-12 ledger-verification round. A top-row seat
  critiques the decomposition before any fan-out: the Fable critique caught two claims true at 0.13.0
  and false at 0.14.0 that a fan-out would have returned as "false" and the synthesis read as findings
  refuted. The bulk tier has a unit: one claim, one address, a verbatim quote, a verdict from a closed
  set that describes the subject and never the brief; nineteen of twenty Luna seats answered a broken
  path in their prompt with the same verdict word. A unanimous fan-out is read as evidence about the
  prompt first, one return whole before the tally. The page's line budget in
  `evals/orchestrate.test.mjs` moves from 150 to 155 for a page of 152 lines.
- Cleanup lists what it never listed. Its rows came from orchestrate runs, seat scratch, the suites'
  scratch, saved conversations, worktrees, locks, the shared home and other copies' data, never from
  `<state>/reports/`, where the standalone recipe sends every report, nor from `<state>/answers/`: so
  `--list --json` answered `rows: []` and "Nothing this cleanup covers is on this machine" one minute
  after a report had been written there (measured 2026-09-12). Each standalone report run is now a row of
  its own — size, last change, selectable by its number, never proposed, since a report carries no
  project slug and may be evidence the coordinator still wants — and it is kept while a live seat names
  it or while its `report.json` is absent: the driver publishes that file whole or not at all, so a run
  directory without one is a run still in flight, refused at the listing and again at deletion. The
  answers store is one kept row, never selectable, because the driver prunes it itself. Neutering the
  live-seat guard or the unpublished-run guard turns a case red. The README's count of what cleanup
  removes and reports moves with it.
- A write seat DECLARES the two implicit grants a `workspace-write` sandbox otherwise carries, so the
  rights it asks for are `--cwd`, each `--writable` root and `$TMPDIR`:
  `sandbox_workspace_write.exclude_slash_tmp=true` takes `/tmp` out of the grant, and
  `exclude_tmpdir_env_var=false` keeps the temp directory the caller — or this driver — chose. What was
  measured, on codex-cli 0.153.4, 2026-09-12: a `thread/start` carrying neither key answers
  `writableRoots []`, `excludeSlashTmp false` and `excludeTmpdirEnvVar false`, so the directory a caller
  picked as the blast radius was never all the sandbox allowed and no report field said so; each field
  mirrors its own key, on the running server and in the test fixture alike, pinned by two differential
  cases that send the opposite value; and the write-level assertion refuses a response that differs
  either way, since deleting either check, or the key it checks, turns suite cases red. What this change
  did NOT measure: a write into `/tmp` attempted from inside a live turn. A narrower sandbox is refused
  as loudly as a wider one, because a seat whose `$TMPDIR` is unwritable cannot run a here-document and
  reports that failure as a finding about the task.
- The private 0700 `$TMPDIR` the driver makes when the caller exported none is made at BOTH levels, not
  at read alone. With `/tmp` now excluded from the write sandbox and no `TMPDIR` in the environment,
  `os.tmpdir()` and zsh's `TMPPREFIX` both fall back to `/tmp`. That a `TMPPREFIX` outside the grant
  costs a seat its here-documents is not a new claim: it was measured failing every `<<EOF` with "can't
  create temp file for here document" across 15 rollouts between 2026-08-31 and 2026-09-08, which is why
  this driver sets the variable at all. What the new case measures is the precondition — a write run
  whose caller exported no `TMPDIR` now reports a private `tmpDir` and hands the seat a `TMPPREFIX`
  inside it, where the same run before this change handed over `/tmp/zsh` and reported no `tmpDir`.
  A caller's own `$TMPDIR` takes the protected-root guard at
  write level too, as it already did at read — `exclude_tmpdir_env_var=false` makes that directory an
  acknowledged part of the grant, so `TMPDIR=~/.codex/x --level write` is refused like any other root
  inside the receipt store. The report's `tmpDir` is therefore non-null on a write run whose caller
  exported no temp directory.
- The comments explaining `escalations` say what the code does. Two of them still carried the diagnosis
  0.14.0 had already corrected at the exit-6 rung itself — "an escalation request means the sandbox was
  sized wrong for the task" and "refused permission requests — the sandbox was sized too small". An
  entry is an approval request this driver DECLINED, recorded whichever thread asked; a command the
  sandbox denied outright need not raise one; `detail` is the server's own wording clipped to 200
  characters and is empty where the request carried none; and exit 6 sits below timeout and the other
  higher-priority outcomes, so a cut run can carry entries and still report 3. Widening the rights is
  not the implied remedy. Comments only: the generated help is unchanged, and the exit-6 rung still
  reads "an approval request was declined; inspect the report, if delivered, before judging task
  completeness", byte for byte as 0.14.0 shipped it.

### Fixed

- The cleanup page's two commands run `${CLAUDE_SKILL_DIR}/../seat/scripts/cleanup.mjs`. They ran
  `${CLAUDE_PLUGIN_ROOT}/skills/seat/scripts/cleanup.mjs`, and that placeholder is substituted for an
  installed plugin alone: on the clone-and-symlink route it was empty and the command resolved to
  `/skills/seat/scripts/cleanup.mjs`. `${CLAUDE_SKILL_DIR}` is substituted on both routes. Node
  normalises the `..` lexically, so on the clone route the command reaches the seat skill only through
  the link the install recipe makes beside the cleanup one; the page says so now, and two cases pin it
  by resolving the page's own expression through a layout with both links and through one with the
  cleanup link alone (measured 2026-09-12: the first resolves, the second does not).
- Cleanup runs with `TMPDIR` unset or empty. It exited 2 with "TMPDIR is not set to an absolute path …
  Nothing was deleted" (measured 2026-09-12 with `env -u TMPDIR`), while the driver tolerates the same
  environment by making a private directory, and the coordinator's seat scratch is made by
  `mktemp -d "${TMPDIR:-/tmp}/…"`, which puts it under `/tmp` then, exactly what `os.tmpdir()`
  answers. The scan now falls back to `os.tmpdir()`, the listing's text and `roots.tmpSource` say that
  it did, and a `TMPDIR` that is set, non-empty and relative is still refused with nothing deleted. The
  page says which seats that scan cannot see: one started under another temporary root leaves no row,
  while its report is kept until `report.json` is there.
- A pre-turn report names the worktree the run made and says what became of it. A run refused or cut
  before the turn published seven fields — `ok`, `exitCode`, `threadId`, `turnStatus`, `answer`,
  `error`, `reportPath` — while the tree's disposition was decided by the exit handler AFTER the report
  was out, and a PRESERVED tree was announced on stderr alone: a coordinator reading only the report,
  which is what every recipe tells it to do, could neither harvest that tree nor remove it. The
  disposition is now decided before the report is published, under the rule the exit handler already
  used in the last resort — removed only where no codex was ever started, `git status --porcelain`
  succeeds and is clean, and `git worktree remove` succeeds; a `--resume` rebuild that cannot finish
  removes its half-restored tree with `--force` — and the report carries `worktreePath` and
  `worktreePreserved` under the post-turn report's own names and types: the reason the tree was kept,
  or `null` where it was removed. Four paths that named nothing now name the tree, each measured as a case: an invalid
  `--writable` root, refused after the tree exists and before any codex does, exits 2 with a report
  naming a tree that is gone from disk; an app-server that never answers `thread/start`, cut at
  `--timeout 2`, exits 3 with a report naming a preserved tree that is still there; a `git worktree add`
  that fails with its destination already created — a directory previously known only to the ledger —
  exits 2 with a report naming it and saying it was kept; and a `--resume` whose rebuild cannot finish
  removes its tree and says so in the same two fields instead of publishing none. Where a codex was
  started in the tree the reason now says whether it is still running or has exited, and with what code,
  rather than calling a dead process live. Where none was, it names which of the three results kept the
  tree instead of listing them: `git found work in it (1 path, the first ?? seat-scratch.txt)`, `git
  could not read its status (…)` or `git refused to remove it (…)`, the last two quoting the head of
  what git said — three different things for its reader to do, where one sentence sent the reader of a
  half-made tree looking for work that was never in it. Measured 2026-09-13, one case each: a file
  planted in the tree the moment `worktree add` returns, a `status --porcelain` that exits 128 for that
  tree alone, and the half-made tree of the failed-add case above, which git will not remove because it
  never registered it. What is removed and what is preserved is unchanged. The stderr line stays, and the exit handler stays as the
  fallback for paths that never reach a report: a `disposed` flag on the tree makes the second caller a
  no-op, so the decision is taken once; the report carries it, and stderr announces a preserved tree.
- The exit-code help no longer says of `--report-file` what is only true of stdout. "an argument error
  prints none" and "like a 2 it then prints no report" described stdout alone: the report file is opened
  before argument parsing, and a pre-turn refusal is deliberately published there, so a caller waiting on
  the file is answered even where stdout is empty. Measured 2026-09-12: a missing state directory and a
  plain `--bogus` flag each exited 2 with empty stdout and a fresh report file carrying `turnStatus:
  null` and the refusal. The help now names the two delivery surfaces, says that stdout carries no report
  before a turn while the file carries the refusal as `{ok:false, exitCode, turnStatus:null, error}` once
  its path was accepted and no other run published there first, and that a REFUSED report path — not
  absolute, an unusable parent, or an entry already there, a symlink included — leaves no file anywhere
  and puts the reason on stderr.
- The read level's sandbox assertion inspects the implicit `/tmp` grant. It checked the profile, the
  sandbox type, egress, the workspace and the explicit writable roots, and `excludeSlashTmp` was among
  none of them — so with `$TMPDIR` outside `/tmp` a response that granted all of `/tmp` beside it passed,
  against that level's own promise that `$TMPDIR` is writable and nothing else is. `excludeTmpdirEnvVar`
  is deliberately not asserted there: `false` names the same directory the explicit root already names,
  and `true` is what the profile reports with `TMPDIR` unset, which the existing refusal catches first
  and by its own cause.
- The lock's ownership question is asked again immediately before the act, and about the second identity
  as well as the pid. `updateLock` read the body and then renamed a temp file over the PATH;
  `releaseLock` read the body and then unlinked the PATH — and between a read and its act, a peer that
  had reclaimed the lock and put its own file there lost it, to a rename it never saw or to an unlink by
  a run that owned nothing any more. It surfaced as a flake: the case "a run releases only the lock it
  owns" failed once in about twelve runs under concurrent load on 2026-09-12 and passed every time alone
  afterwards. Two cases now LAND that collision instead of waiting for it: `CODEX_DELEGATE_LOCK_SEAM_MS`
  — a test seam, documented in `--help-all`, which the driver reads and nothing in this repository sets
  outside those two cases — holds each window open and touches `<lock>.seam` while it does, so a case
  enters the window rather than racing it. Measured 2026-09-13 against the driver before the fix: a peer
  planted inside the update's window and one planted inside the release's window were both deleted; after
  it, both keep their file. Two further cases need no seam and pin the identity rule on its own: a lock
  carrying this run's own pid with a DIFFERENT start-time identity is left alone, where the pid-only
  check deleted it, and one carrying this run's pid and NO identity is still released, because a body
  without one is what an older driver and a failed `ps` both write and refusing there would leave those
  runs unable to release the lock they hold. The flaking case no longer swaps at acquisition — it waits
  for `appServerPgid` to appear in the body, which is this run's own update having happened, so what it
  measures is the release. What the fix cannot do: POSIX has no conditional rename and no conditional
  unlink, so the window between the last check and the syscall that acts is NARROWED to those two
  instructions and never closed, and a peer that replaces the lock inside it still loses the file.
  `node evals/lock.test.mjs` on this machine, 2026-09-13: six sequential runs and three concurrent ones
  green after the fix, and three more once the last case was added — all 58 passed.
- The wrapper's report is correlated to the invocation that produced it. Its wait ends on the driver's
  own exit status, written to `<DIR>/exit`, and step 3 prints `DRIVER_EXIT` and a `PATH=` line beside
  the report's `EXIT` and `FILE`: `own` where the driver's pid line names the path and nothing failed to
  publish, `taken` where stderr carries the refusal of an entry already there or the failure to publish
  behind another run, `none` where the path was never accepted. A retry that reused a report path was
  read as its own result — the driver refuses the taken path before it records it and before it prints
  its pid, so the old loop saw the previous file at once (measured 2026-09-13: `DRIVER_EXIT=2` against
  `EXIT=0`, `FIRST=PREVIOUS RUN ANSWER`) — and the numbers alone do not settle it: a previous report
  whose own `exitCode` was 2 prints `DRIVER_EXIT=2` beside `EXIT=2`, and `PATH=taken` tells them apart
  (measured 2026-09-13). The three strings the line greps are the driver's own, pinned by a case that
  reads them off the page and finds them in the driver.
- A startup failure that leaves neither report nor pid now ends the wait. A report path under an
  unwritable parent exits 2 with EACCES before any pid line; the old loop had no terminal branch and
  the instructions said to repeat it. Measured 2026-09-13: the new loop returned at once with
  `DRIVER_EXIT=2`, `PATH=none`, `FILE=missing`, the reason in `<DIR>/err.txt`; the wait tests the marker
  for content rather than existence, because `echo $? >` creates the file before it writes the byte.
- The seat page reads back what this release measured: `$TMPDIR` is granted at every level and `/tmp`
  at none (a live 0.153.4 read handshake on 2026-09-13 reported `writableRoots` of `$TMPDIR` alone with
  `excludeSlashTmp: true`), a worktree run cut or refused before its turn reports `worktreePath` and
  `worktreePreserved`, a refused report path makes no report for that run while an entry already there
  is left as it was, and `escalations` is documented with its truncation, its rung and what it does not
  prove.
- The source-install recipe enters `agent-skills/plugins/codex-delegate`, not the retired top-level
  `codex-delegate`. After the repository URL moved, a fresh clone was named `agent-skills` and the old
  `cd` failed before every `$PWD`-based link (measured 2026-09-13: exit 1 on a fresh clone); the page says
  so now, and says that cleanup reaches its seat script through the sibling `seat` link, because Node
  resolves `..` lexically (without the link the command throws, with it it runs).
- The `codex exec` comparison separates approval from sandbox. It said exec had neither because it
  forces `never`; codex-cli 0.153.4 does offer `-s, --sandbox <read-only|workspace-write|danger-full-access>`,
  and only `--approve-for-me` where a per-call approval policy would be; what it lacks is a policy that
  survives the managed clamp. The row now says which right is absent, the `never` measurement is dated to
  0.150.1 rather than repeated, and `app-server` remains the only surface with both per-call rights and
  a machine-checkable execution signal.
- The sign-in prerequisite names the account an isolated seat actually uses. A plain `codex login
  status` can follow a custom `CODEX_HOME`, while the driver links `auth.json` and `sessions` from the
  `~/.codex` in the home directory and reads the custom home for its configuration probe alone
  (measured 2026-09-12: a status check under an empty custom `CODEX_HOME` answered "Not logged in"
  while the same check against `~/.codex` answered "Logged in using ChatGPT"); the README and the
  internals now give the one account-check command and keep configuration apart from credentials.

## 0.14.0 — 2026-09-12

### Changed

- A Codex seat is launched through a shipped **wrapper**, the agent `codex-delegate:codex-seat`
  (`agents/codex-seat.md`: Haiku, the Bash tool alone, a body that never touches a prompt): one background
  Agent call whose message is the seat page's fixed block, running the driver as a background Bash task and
  waiting in a foreground loop until the report exists. The clone route links the same file into
  `~/.claude/agents/`, where the type is the bare `codex-seat`. Measured 2026-09-12 against the VS Code
  extension 2.1.269, whose agent map lists `local_agent` tasks alone, so a Bash task never had a card and
  could not be stopped or continued from there: with the wrapper a seat has a card under its description,
  Stop on it reaches the driver (the harness ends the wrapper's tasks, the driver takes the `SIGTERM`, cuts
  the turn, sweeps its codex and publishes the report), one completion notification arrives, and a message
  to the wrapper carrying a `RESUME:` seat file continues the thread (a picked integer came back plus one;
  a headless coordinator reading the page, given no message tool, continued it with a second wrapper
  instead, and the thread held). A subagent has no `TaskOutput`, and a
  wrapper that ends its turn with the driver running is resumed when the task ends, after thirteen minutes
  in one run, but shows as finished on the map meanwhile, which is why the wait is a repeated foreground
  command with the tool's ten-minute ceiling; eleven-minute seats took two of them, on Sonnet and on Haiku.
  Bash alone halves the wrapper's context, 8.2k tokens against 15.4k for `general-purpose` on the same
  seat, and Haiku ran the block seven times of seven, short, long and stopped, at three output tokens a
  turn, so it is the pin. The orchestrate page follows: pass the wrapper no `model`, a seat is counted by
  the `orchestrate-live` suite as an Agent call whose prompt names the driver, and the wrapper is exempt
  from the tag check. Under the orchestrate mode `<REPORT>` is the run directory that page names, said on the
  seat page now too, where the coordinator copies the path from.
- The orchestrator's model table gains a **bulk tier** where it used to say "not used": Luna
  (`gpt-5.6-luna`) and Haiku, up to fifty alive at once, **outside the pool and not counted against the
  one-Astra one-Fable alive cap**. They are fast, cheap and not clever, so the row is for work that is
  wide rather than deep and where a wrong answer does not quietly corrupt something; which work that is
  stays the orchestrator's judgement rather than a fixed list. Prefer Luna to Haiku — measured better and
  smarter, and four times cheaper.
- Several writers at once is stated as the normal way to go faster, with the procedure that was missing
  for when their work collides: stop, restate the contract, each owner repairs its own files, and a seat
  that wrote neither judges the combined tree. While another writer holds part of a checkout, nobody
  stashes, switches branch, resets, cleans or rebases.
- A user-facing agent name carries the vendor and the task: `Codex Astra A6: <task>`, on both pages,
  with the short-name mapping on the seat page as well as the tier table. Composition rules precede the
  launch recipe they gate. Scouting is scoped to repository exploration, with bounded inline checks
  still allowed. A step that cannot run is recorded rather than collapsed into one token, which erased
  the difference between refused and failed. `VERIFY` is explained in a sentence rather than named
  without explanation in a column heading. `modelMs` is documented as the remainder it is; no report
  field was renamed.
- The repository is now a marketplace holding plugins, and this plugin lives under
  `plugins/codex-delegate/`. History was rewritten so every commit shows it there; commit hashes
  therefore changed, and the upgrade recipe's schema-baseline commit is now `6bf21e6`.
- Release tags name the plugin they release: `codex-delegate@0.13.0`, not `v0.13.0`. One tag namespace
  serves every plugin in the marketplace, so a sibling's release cannot answer for this tree's version.
  Every published tag was renamed to the new form.
- The marketplace address is `Nowely/agent-skills`. Remove the old marketplace and add the new one;
  the marketplace still registers as `nowely`, so the plugin is still `codex-delegate@nowely` and its
  data directory does not move.
- The catalogue moved to the repository root, out of this plugin's payload. The case that compares it
  against the manifest announces itself as skipped when run from an installed plugin, where no
  marketplace sits above the tree.
- The manifest's homepage names the plugin's own directory in the marketplace rather than the
  repository it used to be. The published release notes that linked files and comparisons by the old
  `v*` tags were repointed at the renamed ones; those links had gone dead when the old tags did.

### Fixed

- The standalone recipe no longer puts a seat's report inside `$TMPDIR`, the one root a read seat may
  write. A file left at that name blocked publication, the driver refused to overwrite it, and the page
  still told the coordinator that a present report was the driver's own.
- A relaunched or `RESUME:`d seat is told it needs a report path of its own. The driver refuses a path
  already taken and exits before it announces its pid, so the documented recovery could not run, and its
  next step, reading that pid, had nothing to read.
- The worktree is described as it is built. A stash was named as an input and reaches no worktree, so a
  seat launched after one tested untouched code and reported success. A resumed tree starts at its
  recorded base, not today's `HEAD`. The tree is made inside the repository, which the orchestrator had
  the coordinator promise the user it was not. A preserved tree, whose harvest pointers can all be null,
  now has a recovery procedure instead of a landing recipe with nothing to apply.
- Exit 2 is no longer described as always pre-turn: the ladder has a post-turn rung with the same code
  whose report carries commands, an answer and a receipt, and the absolute wording had readers discard
  paid turns. `EXPECT:` says that it counts only commands that succeeded, so a verifier whose suite
  fails is not reported as a run where nothing happened. Parity names exits 9 and 12 for a verifier that
  cannot run, not exit 1, which belongs to the turn.
- A declined approval stops reading as a lost turn. Exit 6 kept its number and its symbol, while the
  help text, the ladder comment and a new closing line say what actually happened; the line is guarded
  by every condition it asserts, so it cannot promise a retained answer on a cut or answerless turn.
- Lock recovery no longer advises deleting the lock in the two cases where that is unsafe: after the
  holder was just proven alive, and for a file that cannot be read and so cannot be shown to be stale.
  The acquisition algorithm, which already checks holder and process group and reclaims by itself, is
  unchanged.
- A server killed beside the driver during a cut is the cut's verdict, not a crash. A harness that stops
  a seat signals the whole process tree, so codex took the `SIGTERM` next to the driver and died inside
  the one-second grace, and the child-exit handler reported `failed`, exit 4: a cancellation a coordinator
  could not tell from a server death (measured 2026-09-12 from the agent map's Stop). With a cut pending
  the server's death now settles the run on the cut's own reason, `interrupted`, exit 1, evidence kept;
  `lock.test.mjs` gains the tree-signal case, red on the previous driver.
- Three eval cases that had been red since earlier changes: `orchestrate.test.mjs` still expected the
  tier table's `unused` row after the bulk tier replaced it; `orchestrate-live.test.mjs` cloned the
  plugin directory, which has not been a repository since the marketplace restructure, so four of its
  five cases could not start, and it now clones the git toplevel and works in the plugin's subdirectory of
  the clone; and its plan check demanded a Codex slug where the page's own template names the seat
  "Codex Terra", so a plan written for the user failed it, and the short names now count.

## 0.13.0 — 2026-09-10

### Fixed

- The snapshot case that proves a number consents to an identity and not to a path could not build its
  own premise on Linux. It removed the directory and rebuilt it where it stood; ext4 hands a freed inode
  straight back, so the rebuilt tree carried the SAME `dev:ino`, the case's own precondition caught it
  and both Linux jobs went red the first time these commits reached CI. The replacement is now built
  beside the original, while the original still holds its inode, and renamed over it, which cannot
  collide on any filesystem.

### Changed

- **The network is on by default, at both levels.** A read seat had no egress at all and a write seat
  had it only when the caller asked; both reach the network now, and `NETWORK: no` (`--no-network`) is
  the only thing that takes it away. No host list narrows it. The reason is parity: a native Claude Code
  subagent holds web tools and runs with the coordinator's own rights and network, so a seat that cannot
  resolve a host was a defect here — and where a knob and a default compete, the default wins. Measured
  on 0.153.4: a seat launched with no rights line at all was given a sandbox with network access and
  fetched `example.com` at HTTP 200 and `google.com` at 301, no approval requested at any point, while a
  write outside its one writable root was still refused with `Operation not permitted`; with the network
  denied the same fetch cannot resolve the host. The
  read level's promise about files is therefore intact and only its promise about egress changed, which
  is what the rights tables now say in as many words: whatever a seat can read it can send, and at read
  level that is every readable path.
- Loopback TCP comes with the grant, at either level: vitest's Vite server binds where it used to get
  `EPERM`, so a browser run no longer has to ask for egress, and the reason a read seat still cannot
  run browser-mode tests is the one write it cannot make — the Chromium override at the tree root.
- Two channels, named apart. `NETWORK: no` denies the sandbox its network and leaves the provider's web
  search alone, which is `WEB_SEARCH:`'s own: a denied sandbox and a granted search mode are accepted
  together, and the standing rules name each whichever way it went. `--verify-sandboxed` hands the
  verifier the seat's egress, a denial included, so work a seat could not fetch for cannot be vouched
  for by a verifier that can, while the plain `--verify` keeps the coordinator's own rights, env and
  network. And since an absent line now grants egress, taking a settled `NETWORK: no` back out is a
  widening to agree with the user, like an extra writable root, rather than a return to the default.
- The identity's limit is stated where it is relied on instead of assumed away. `dev:ino` is the whole
  of it, so a filesystem that recycles inode numbers can present a replacement that answers to the old
  snapshot when the name, the paths, the count, the size and both ends of the time span also match; the
  times are what makes that improbable outside a test, and the snapshot is consent, not a security
  boundary. A new case pins the behaviour against whichever identity the platform hands back and prints
  which way it went, so the fact is measured on both platforms rather than inferred from a red job. It
  also prints what the creation time did, which is the evidence for deciding whether the identity should
  one day carry more than `dev:ino`; nothing is promised there until it is measured.

## 0.12.0 — 2026-09-10

Measured against codex-cli 0.153.4 on macOS. No driver behaviour changes: this release is a third skill,
the script behind it, a pass over everything the three skills put in front of a person, and a rename of
every name a user types or reads. **Upgrading is not `plugin update`** — the marketplace is now `nowely`,
so remove the old marketplace and add it again (below).

### Added

- A third skill, `codex-delegate:cleanup`, invoked by the user only (`disable-model-invocation: true`),
  and `skills/seat/scripts/cleanup.mjs` beside `attach-pasted.mjs`. It lists what the plugin
  has left on this machine, says of each item why it can go or is being kept, and removes only what
  the user picked by number. `--list`, `--list --json`, `--delete --from <listing.json> <number>...`,
  `--help`.
- Four kinds are removable, all of them plain directories: an orchestrate run directory of THIS
  project, a seat's scratch directory of this project, the test suites' scratch directories under
  `$TMPDIR`, and the saved conversations the suites leave in `<config>/projects/`. Four more are
  REPORTED and never removed — the managed worktrees and their ledger, the write locks, the shared
  Codex home, and the data directory of another copy of this plugin — because the driver reconciles
  the first two itself on its next worktree or lock run, the third is shared by every seat, and the
  last is the user's own to remove, with a ready `rm -rf` in the JSON's `manual` list. The script
  never runs git.
- Two statuses, and nothing between them. `removable` means nothing the plugin records under the item
  is in use and everything under it could be read; `kept` is everything else. Unreadable is not a
  status but a reason to keep, and the walk classifies every entry to establish it: a directory it
  can list, a regular file it can read, or a symlink, which is an entry and never followed. A read
  that permissions refuse, a FIFO, a socket, a device, malformed JSON, a symlink anywhere on the path
  from the root down, or a walk that could not be finished each keep the item and say so.
- ONE way to read anything, and one shape for the answer: a value, or the reason it could not be had.
  ENOENT is the only error that becomes a value, because "it is not there" is a fact the program has
  and every other error is a fact it does NOT have; every caller answers a reason by keeping the item.
  Four rounds of review each found another instance of the same shape — a permission error read as an
  empty directory, so a state directory whose permissions were refused became "no job records" and
  everything a live job protected was suggested and deleted; a name resolution that failed halfway and
  offered a transcript anyway; an ordinary file where a directory belonged, read as nothing there. The
  helper also stats before it reads, so a named pipe standing where a seat's startup record belongs
  can no longer block the whole listing on an open that never returns.
- One rule for "in use", asked of the driver's own exported helpers — `holderAlive`,
  `holderGroupAlive`, `reclaimable`, `processIdentity` — never of a second copy of the rule: a live
  pid recorded under the item or naming it. The recorded places are a seat directory's `err.txt`
  first line, a run's seat subdirectory with no `report.json` (the driver makes that directory at
  admission, so it is an unfinished marker) or ANY seat item whose report path points into the run
  and is itself in use, a job record under `<state>/jobs/` whose `cwd` or `repo` is the item or
  inside it, and, for the test rows only, a running suite. A record that cannot be read or parsed
  means in use, never absent; a failed process listing keeps every test row; and a seat whose own
  startup line cannot be read names no run this can see, so it keeps all of them.
- Every liveness fact is taken before anything is classified, so protection travels one way: from any
  live evidence outward to everything that contains it. A run judged before the job records that
  protect its seats were read was deleted while a live task held the seat writing into it.
- The claim is exactly as wide as that list, and the page and `--help` now say so. A process holding a
  directory open with no seat, job record or suite name behind it is invisible here, and so is a
  record in another copy's data directory.
- Numbers and a snapshot are the whole selection protocol: `--delete` takes the numbers the user
  chose and the file `--list --json` wrote, and removes a number only when the row it finds now
  matches the snapshot on kind, name, status, the set of paths, the `dev:ino` of each of them, the
  member count, the size and both ends of the last-change span. Anything else is refused untouched
  with a sentence saying it changed since it was listed. The identities are there because a
  replacement directory of the same size at the same second answered to the old snapshot otherwise;
  the lower end of the span is there because the listing shows it. There is no reference grammar, no
  fingerprint to copy and no file of ids.
- ONE inventory answers every number, and no number is acted on until all of them have been verified
  against it, so the order the user typed cannot decide the outcome. A fresh inventory per number made
  it decide: removing a run renamed the seat that pointed into it, and the seat's own number was then
  refused as changed, while the same two numbers the other way round removed both.
- Freshness is not what an inventory is for. Every liveness fact — the job records, the walk, a seat's
  startup line, a run's seat directories, AND the process listing — is re-taken immediately before
  each member goes, not once per row and not once per number. A suite that starts, or a job record
  that is written, while an earlier member of a collapsed row is being removed protects every member
  that has not gone yet.
- The item removed is the one the listing measured: its `dev:ino` is compared again at the removal, so
  a directory taken away and another put in its place after that inventory is refused rather than
  removed in the original's stead.
- The user's "yes" covers the suggested rows and nothing else: removable seat directories of this
  project and removable test scratch directories. A run or a saved conversation is deleted only when
  the user says its number. Another project's rows, everything in use or unreadable and the four
  reported kinds are never selectable, and age is never a criterion — it is displayed and never
  consulted.
- Rows of the same kind whose displayed name is identical collapse into one numbered row with a
  count, a total size, the span of their last-change times and all their paths. A collapsed row is
  removable only when every member is, and picking its number removes every member. On this machine
  the listing is 98 lines for 239 artifacts.

### Changed

- **Renamed, everything a user types or reads.** The marketplace is `nowely` instead of a second copy
  of the plugin's own name, so the install is `codex-delegate@nowely` and the plugin's data directory
  is `~/.claude/plugins/data/codex-delegate-nowely/`. The main skill is `seat`, so the Skill tool takes
  `codex-delegate:seat` instead of `codex-delegate:codex-delegate` (bare `seat` on the clone-and-symlink
  route). The cleanup is `cleanup`, not `clear`, which is a built-in Claude Code command that discards
  the conversation: `/codex-delegate:cleanup`, `skills/seat/scripts/cleanup.mjs`, and the seam variables
  `CODEX_DELEGATE_CLEANUP_PS` and `CODEX_DELEGATE_CLEANUP_COLUMNS`. The plugin's own name, the repository,
  `CODEX_DELEGATE_STATE_DIR` and the sandbox profile are unchanged.
- **Upgrade path.** `claude plugin marketplace remove codex-delegate`, then
  `claude plugin marketplace add Nowely/agent-skills` (it registers as `nowely`), then
  `claude plugin install codex-delegate@nowely`. The data directory moves with the marketplace name, so
  move `codex-delegate-codex-delegate/` to `codex-delegate-nowely/` first, with no seat running; a stale
  copy left behind is listed by `/codex-delegate:cleanup` as another copy's data.
- The pitch says what ships: three skills, only the first model-invoked, and a receipt per *completed*
  turn — a refusal before the turn has none.
- What the user reads is now stated once, in a `What the user reads` section on the delegation page:
  the coordinator writes that prose itself, in the user's own language, and names an agent by its
  model and id. A header field name, a status block, an internal table's row name and an absolute
  path are machinery and stay out of it; rights are the exception that must survive the translation,
  in ordinary words, because rights are what the user is being asked to approve. Measured on 0.11.1
  (2026-09-09): a Russian-speaking owner was shown a seat's raw five-field block, a plan reciting
  `SEAT: write` and a run-directory path, and this vocabulary's own noun translated into a Russian
  word meaning a chair.
- The three user-facing templates name the model instead. A Codex seat's Bash row is
  `Codex <model> <id>: <task in a few words>` on both pages, and the example first line of `result`
  is `"Sonnet W5: done, ..."`. The five fields are named the coordinator's own input, to be read and
  never forwarded, which settles a contradiction the two pages carried: one called a subagent's final
  text a return value and not a message to a human, the other called its first line what the user is
  told.
- The orchestrate plan is prose again. It states what will be done, who does each part by model name,
  what each may write, whether it needs the network, and that artifacts land outside the repository —
  and it names no path and no header field. The caps and the coordinator's own model are announced in
  a sentence rather than as a settings dump.
- `clear` no longer tells the model to repeat its example sentences as written: they are models of
  what to say, said in the user's language, keeping the command's own names, counts and reasons. Only
  a listing block is still shown exactly as printed.
- The live orchestrate gate stops requiring the plan to print a run directory, since a path is the
  thing being removed; the in-repository `.orchestrate/` check that needs no path and no English
  survives. Three of its heuristics read English words only and so changed their own verdict on a
  non-English plan — a self-description excluded from the seat count, a stated sequencing, a wave
  column — and each now carries the stems of both languages. Measured: `Я сам работаю на Fable как
  координатор.` counted as a second Fable seat and failed a cap the plan honoured.

### Notes

- A slug is never proof of ownership. `<state>/orchestrate/<slug>/` is the coordinator's working
  directory with every non-alphanumeric character replaced by `-`, and `a-b` and `a_b` share one, so
  a run belongs to this project only when its slug matches AND every `<seat>/report.json` that parses
  carries a `cwd` under this project. A run no record names is called that in the listing rather than
  being assigned to anybody. A seat belongs to the project of the run its report path names, else of
  the job record naming the same pid, else nobody.
- A test suite is recognised as a process that IS one — `node` running a file named `<name>.test.mjs`
  or `run-all.mjs` — rather than by the file name appearing anywhere on a command line: a monitoring
  shell whose line merely mentioned `evals/clear.test.mjs` marked all 178 test scratch directories as
  live (measured 2026-09-09). `ps` joins argv with spaces, so every leading run of words is tried as
  the executable: an interpreter installed under a path that holds a space is still `node`, and
  missing one deleted a running suite's scratch.
- Nothing this tool prints executes when it is pasted. The `rm -rf` it hands the user for another
  copy's data directory is single-quoted, as is the `find` for the entries outside this cleanup: a
  directory named `codex-delegate-$(touch PWNED)` is data, and JSON quoting is not shell quoting.
- Removal, in order: re-verify against the snapshot; re-take the item's liveness; walk the path from
  its kind's canonical root down, one `lstat` per component, refusing on any symlink or any component
  that is not a directory; `chdir` into the directory that holds it and compare that directory's
  `dev:ino` with what the walk saw; `lstat` and then `open`/`fstat` the leaf BY ITS BARE NAME,
  refusing unless its `dev:ino` is the one the walk saw; then `rm -rf` that bare name, which never
  follows a symlink inside — a link inside is unlinked, its target untouched. A root,
  `<state>/{answers,jobs,tmp,pasted,locks,worktrees,home,orchestrate}` and anything that resolved
  outside its own root are never removal targets, and an item that CONTAINS one of them is refused at
  the listing rather than suggested and then refused at the removal.
- The bare name is what closes the ancestor swap. `rm -rf` on an absolute path re-resolves every
  component, so an ancestor renamed after the check redirected the removal outside the root and
  deleted an unselected directory — measured, in all four kinds. `chdir` resolves the parent once and
  pins it to that inode; the kernel then resolves the bare name from that handle, and no later rename
  of an ancestor can move it — also measured, in the same fixture, which now survives.
- An emptied slug directory is left where it is. Sweeping it removed a directory the user never chose,
  and once the pinned parent had been renamed away the sweep removed whatever now stood in its place.
- Every chain starts at the OUTERMOST canonical root — `<state>` for a run, `<config>` for a saved
  conversation — so a link at `orchestrate` or at `projects` is met on the way down and keeps
  everything beneath it. `<config>/projects` replaced by a link elsewhere canonicalises to that
  elsewhere, and a chain that began there would have found nothing wrong with removing a personal
  directory outside the config tree. Those items are still listed, and each says it is reached through
  a link, rather than vanishing from a listing that claims to cover them.
- A saved conversation is offered on the SHAPE of its name and on nothing else. A slug is lossy —
  `/`, `-`, `_`, `.` and a space all become `-` — so `<tmp>/orchestrate-live-x` and
  `<tmp>-orchestrate-live-x` are one string, and a test that merely looked for the marker anywhere
  reached the second, which is somebody's own project and somebody's own transcripts. The rule is now:
  the slug must begin with the temp root's own slug and a separator, and the tail below it must have a
  shape a suite itself writes — `orchestrate-live-<ISO stamp>-<n>-<case>[-scratch]`
  (evals/orchestrate-live.test.mjs:87 builds the artifact directory, :88-89 the case directory,
  :167-168 the clone inside it) or `cdx-permprobe-<one bare word>` (Claude Code's own permission probe,
  pinned from what it leaves behind). A directory a person named `my-orchestrate-live-notes` under the
  temp root has neither shape. Nothing outside the temp root is read; in fact nothing is read at all,
  and whether the directory still exists changes nothing — a suite deletes its scratch when it ends,
  so requiring it to be there hid 28 of this machine's 44 conversations, exactly the ones worth
  removing.
- A number is consent for WHAT it named. Because the inventory is re-run per number, removing one row
  renumbers everything after it, so the snapshot's row is found in the fresh listing by its kind and
  name and then compared in full — never by its position.
- Exit codes: 0 everything asked for was removed; 1 a removal was attempted and failed; 2 bad
  arguments, an unreadable or stale snapshot, or no state directory; 10 something was refused and
  nothing about it was touched. 10 outranks 1, which outranks 0.
- What remains is one instruction wide: between the final `fstat` of the bare name and the `rm` of
  that same bare name, a same-user process could replace that entry inside the pinned parent. Every
  wider version of that race — an ancestor renamed, a parent swapped, a directory replaced between
  the listing and the removal — is closed by the pinned parent, the identity comparison and the
  snapshot's `dev:ino`.
- Run for real on the author's machine (2026-09-10), against 22 rows standing for 240 artifacts:
  `--list` exit 0, 103 lines, nothing on stderr, 152 ms, its text byte-identical to the JSON `text`;
  the suggested set removed 185 directories under `$TMPDIR` in one call, exit 0, and the listing
  printed after it. Kept, unasked: five seat directories of another project, that project's run, the
  shared Codex home, the uninstalled copy's data, and a seat directory made one minute earlier by
  another session in this project, which read "the seat using these files is still running". A run
  planted under the plugin's own data directory was then listed, selected by number and removed at
  exit 0 with the three real runs beside it untouched — which is also what measures that a subprocess
  may remove a directory under `~/.claude/plugins/data`, the last thing about the delivery route that
  was still unmeasured. Whether `${CLAUDE_PLUGIN_ROOT}` is substituted in a skill body remains
  unmeasured: it needs an installed copy that carries this page.

## 0.11.1 — 2026-09-09

The 0.11.0 release commit failed CI on both Node 18 jobs while both Node 24 jobs passed. The declared floor moves to
Node 22 (`package.json` engines, the CI matrix runs 22 and 24): Node 18 was declared, never measured locally, and is
not in use. Two suite cases failed only there: the protocol row that starves the report's reader relied on how much a
paused pipe absorbs, which differs by platform and Node version, so its body is now sized past any pipe (4 MB); the
lock case "a run releases only the lock it owns" failed once on macOS with Node 18 and was not diagnosed, since the
runtime is no longer supported. The driver is unchanged apart from its version string.

## 0.11.0 — 2026-09-09

Measured against codex-cli 0.153.4 on macOS. An orchestrated review on 2026-09-08 — two scouts, five
reviewers, three cross-side refuters, a judge and a completeness critic, half of them Codex seats — made
124 findings, of which 96 survived refutation and 27 were ranked for work. This release is that work: a
Codex seat is now a direct background call of the driver, and the flags no live run had used are gone.

### Compatibility notes

- The `codex-seat` agent and the whole relay and detach transport are retired: `--relay`,
  `--relay-collect`, `--detach`, `--run-dir`, `--wait`, `--wait-timeout`, `--jobs`, `--cancel`,
  `CODEX_DELEGATE_RELAY_WAIT_S`, the text envelope, the progress heartbeat, the `runs/` directory family
  and the launch handshake. Launch a seat directly instead, in a background Bash task:
  `node driver.mjs --seat-file <prompt> --report-file <report>`, and read that file when the task's exit
  notification arrives. A run no longer survives its caller and there is no collector; stop a seat by
  stopping its task, or by signalling the pid the driver announces on its first stderr line. `jobs/*.json`
  remains, private, as what `--resume last` and a worktree rebuild need, and loses its obsolete keys the
  first time this driver rewrites it: it is resume metadata only (`JOB_FIELDS`, fourteen keys), and what a
  run measured is in the report.
- `--report-file FILE` is new, and is the delivery that counts: an absolute path that does not exist yet,
  under a parent the run creates at 0700, all the way down, when it is absent; a relative path, a name
  already taken and a parent that cannot be made or written each exit 2 before anything is spawned. It is
  written to a sibling at 0600 and published by hard link before stdout, never over an existing entry, so
  a broken pipe neither loses the report nor changes the verdict. A second run that named the same path
  and lost the race says so on stderr, keeps the first run's file and exits 4 with its own report on
  stdout. A refusal reached before the turn — a usage error, an abort, a signal — writes
  `{ok:false, exitCode, threadId, turnStatus:null, answer:"", error, reportPath}` to the same path, so a
  missing file means unknown and never success. It is command-line-only: `REPORT_FILE:` in a header is
  exit 2 naming the flag.
- Removed, unused in 177 live runs: `--fork`, `--fork-through`, `--compact`, `--reasoning-summary`,
  `--mcp-server`, `--ephemeral`, `--steer-file` and `--progress`; native `--review` with its `REVIEW:`
  field; `--mcp` with its per-run private home; `--commit` with its `COMMIT:` field; and
  `scripts/stop-gate.mjs` with `CODEX_DELEGATE_STOP_GATE`. `thread/fork`, `thread/compact/start` and
  `review/start` are no longer sent, `thread/start` carries no `ephemeral` and `turn/start` no `summary`,
  and the report drops `forkedFrom` and `forkedThrough`. A retired flag is an unknown argument and a
  retired field an unknown header line; both are exit 2 naming the line or the flag.
- A Codex seat cannot commit under the grant a `SEAT:` line makes: a commit needs the git common dir,
  which no seat gets by default, and without it `git commit` inside the seat's sandbox fails at
  `index.lock: Permission denied` (measured). `WRITABLE: <repo>/.git` re-grants it — the grant the
  retired `--commit` made — and is settled with the user like any widening, because it hands the seat
  config, hooks and every ref. A worktree seat's work comes back as `worktreeDiffPath`
  and `worktreeUntrackedPath`; `worktreeCommitsRef` is still harvested and is now populated only where
  the caller's own `--verify`, which runs unsandboxed, committed.
- A seat that needs MCP tools uses `--host-home`, which brings the caller's whole configuration with
  them. The isolated home is one shared directory unconditionally: `<state>/homes/` is neither created
  nor reaped, and no `[mcp_servers]` table of the caller's is copied anywhere.
- Exit rung 11 (`COMMAND_FAILED`) is retired, and the code stays unallocated rather than free: a
  completed turn that answered exits 0 however many of its commands failed. `commandsFailed`,
  `commandsBlocked`, `commandsProbeNegative`, `fileChangesFailed` and `commandsPipedToPager` stay in the
  report, and `--expect-command` (exit 5) and `--verify` (9, or 12 when it could not be measured) are the
  gates that judge. `--allow-failed-commands` and `ALLOW_FAILED_COMMANDS:` waived that rung and only it,
  so both are exit 2.
- `--resume last` names the run most recently STARTED for this `--cwd`, or with `--worktree` this
  repository — not the one most recently written to, so a long seat still running no longer outranks a
  shorter one begun after it and already finished. A newest run that is still running is exit 10 as
  before.
- There is no built-in state directory any more. The state root is `CODEX_DELEGATE_STATE_DIR`, read
  first, else `CLAUDE_PLUGIN_DATA` — `${CLAUDE_PLUGIN_DATA}`, the plugin's own data directory, which the
  skill recipes forward on every driver call under its own name, so an exported
  `CODEX_DELEGATE_STATE_DIR` still wins; with neither set the run exits 2 naming both. The old default
  under the home directory held answers, an isolated Codex home and a worktree ledger that no plugin
  uninstall reached. Existing state under `~/.codex-delegate` is NOT migrated: `--resume last` and a
  worktree rebuild no longer find the runs recorded there, while `--resume <threadId>` still works because
  the rollout lives under `~/.codex/sessions`; the directory can be deleted. README › Install says where
  the state now lives, and what to add to `permissions.additionalDirectories` for it.
- A relative `CODEX_DELEGATE_STATE_DIR`, or a relative `CLAUDE_PLUGIN_DATA`, is exit 2 at parse time
  naming the variable. It used to be accepted, and the answer log and turn diff answered a bad root by
  silently dropping the artefact.
- A header that declares no `SEAT` — with or without other fields — is a read seat in the current
  directory, which is the default `--relay` used to supply; `SEAT`, where it appears, must be first.
- `schema-0.153.4/` tracks only the 12 files `evals/conformance.test.mjs` loads, down from 304. The full
  generated tree stays in history at commit 6bf21e6, and README › After a codex upgrade diffs the next
  regeneration against it.
- The driver exports `EXIT`, `FIELDS`, `LADDER`, `PINNED_CODEX`, `SEAT_FIELDS`, `VERSION` and `lockKey`.
  `ATTACH_KINDS`, `EFFORTS`, `LEVELS`, `STATE_SUBDIRS`, `WEB_SEARCH` and `helpText` had no reader
  anywhere and are no longer exported.

### Fixed

- Every zsh here-document in a seat failed with "can't create temp file for here document": zsh keeps the
  document under `TMPPREFIX`, default `/tmp/zsh`, which no grant covers. Measured in 15 rollouts between
  2026-08-31 and 2026-09-08. The app-server is now spawned with `TMPPREFIX` under the run's own `TMPDIR`,
  and a live seat proved it.
- Concurrent first runs against a fresh state directory could refuse with "exists but is not a symbolic
  link": `readlink` answers a transient `EINVAL` while a peer replaces the link by `rename`. The driver
  re-checks with `lstat` and re-links atomically; 3840 synchronised first links after the fix, no loser.
- The worktree ledger is written by temp+rename; an unparsable entry is quarantined as `<name>.json.bad`
  instead of deleted, so the tree it names survives; a ledger that cannot be written refuses the run
  before `git worktree add`; a re-harvest that takes nothing removes the previous turn's `.diff` and
  `.untracked.tgz` and says so, including a resumed seat that leaves the tree clean, whose record
  pointers go null with them; harvest diffs go through temp+rename; and `ps`, `plutil` and the harvest
  `tar` now carry the timeout git already had.
- A resumed thread kept the previous run's `endedAt`, which is what the busy-thread refusal reads, so a
  second seat could be waved onto a live thread. The closing fields are reset when a run starts.
- `run-all` fails on a signal-killed suite (a killed child reports `code` null, and `process.exit(null)`
  exits 0) and no longer counts a skipped or unparsed suite as green; the harness has a `skip(reason)`
  sentinel that prints its reason and is named in the summary. `package.test.mjs` is green from an
  installed plugin root, where there is no git metadata, and compares the version only against a `v*` tag
  on `HEAD`. `conformance.test.mjs` asserts that the schema directory it loads is the one `PINNED_CODEX`
  names (`CODEX_DELEGATE_SCHEMA_DIR` overrides it during an upgrade) and validates JSON-RPC error
  responses. An unknown scenario name is now fatal in the fixture instead of answered with a success.

### Changed

- The orchestrate mode's run directory moved out of the repository into the plugin's data directory,
  `${CLAUDE_PLUGIN_DATA}/orchestrate/<project-slug>/<run>/`, where the slug is the working directory's
  path as Claude Code spells it under `~/.claude/projects/`. A run therefore leaves the tree it works in
  untouched, and the self-ignoring `.gitignore` the old `.orchestrate/<run>/` needed is gone with it.
- The orchestrate run directory is made by the driver, through `--report-file`, and holds the seats'
  report files and nothing else: a seat's prompt, stdout and stderr go to a `mktemp -d` under `$TMPDIR`.
  A headless session refuses the coordinator's own `mkdir`, Write and shell redirect under the plugin's
  data directory as a sensitive file, with no prompt anyone can answer, while the driver handed the same
  path as an argument is not refused (measured 2026-09-08). The same session ends its background tasks
  with the turn that started them, so a headless coordinator waits on a seat with
  `TaskOutput(<task_id>, block: true, timeout: 600000)` and never ends a turn with one alive.
- The orchestrate page prefers background Agent calls, one notification per seat, over a Workflow, which
  reports nothing until its last agent returns (measured 2026-09-08: a seat's exit at minute 9 surfaced
  only when the user asked, while its sibling ran 18 minutes). Workflow stays for a chain a script must
  decide.
- A Codex seat and a Claude seat now read the same to the user, on both skill pages: the Bash call carries a `description`
  naming the seat and its model, every seat's return is retold in one short paragraph of the
  orchestrator's own instead of a pasted five-field block, and the first line of `result` is one human
  sentence with the seat's id, model, status and what it did. Two refusals measured 2026-09-08 are named
  beside the rights they belong to: a read seat is never asked to write, its artifact is its report, and
  browser or end-to-end runs go to a Claude seat or to a write seat with `NETWORK:` and the grants
  `references/parity.md` names, because a read seat asked for either is refused and exits 6.
- Driver structure: one `FIELDS` table derives the seat-field vocabulary; one `jsonRpcConn` serves the
  config probe and the main channel; every `LADDER` rung is a pure function of its own context; one
  `exitWith` funnel settles, closes the record, writes stdout under the drain watchdog and exits, so
  `process.exit` appears once; `main`, `parseArgs` and `handleMessage` are split into named units
  (`main` 362 lines to 125); one `LIMITS` table holds 39 tuning numbers with a reason each. The driver
  goes 4318 lines to 3819. Those refactors changed no byte the driver writes or prints; the removals
  above are what changed its help text.
- Eleven suites, cheapest first: the protocol suite splits into `protocol` (what the driver does with the
  server's events, 135 cases) and `cli` (what it does with its arguments and its output surface, 85), the
  lock suite into `lock` (53) and `worktree` (22), over the new `evals/lib/scenarios.mjs`. Every protocol
  table case runs on its own state root.

### Notes

- The two live gates, `evals/fidelity.test.mjs` and `evals/orchestrate-live.test.mjs`, were rewritten for
  the direct route and have not been run against a live binary since. RELEASING.md steps 5 and 6 run
  them, and no release is cut without them.
- `references/parity.md`'s memory and turn-overhead figures still carry their 2026-08-30/31 date and were
  not re-measured for the 0.153.4 pin; the page now says so and the release checklist asks only that the
  order of magnitude still holds.
- `references/why-not-the-plugin.md` keeps the code forensics and dates its upstream-activity snapshot;
  the routing rule is to read the issues rather than plan around them.
- `evals/README.md` now leads with how to run the suites and keeps the dated coverage ledger after it.

## 0.10.0 — 2026-09-07

Measured against codex-cli 0.153.4 on macOS (Node 24.11). The pinned protocol moves from 0.150.1 to
0.153.4; the protocol diff between the two is purely additive (9 new type files, 30 changed, nothing
removed). The orchestrate skill and its evals were measured on 0.153.4 against the 0.150.1 pin before it
moved.

### Added

- A second skill, `codex-delegate:orchestrate`, invoked by the user only (`disable-model-invocation:
  true`): the main conversation becomes an orchestrator that scouts inline, agrees one plan with the
  rights it needs, and delegates every verbose step to Claude and Codex seats. It is a delta over
  `codex-delegate` and repeats none of its seat mechanics.
- What the mode fixes in one place: the Claude/Codex model gradation and which tier does which work, the
  default half-Codex share for the judgement roles, the seat bounds (6 alive at once, one Fable and one
  `gpt-6-astra` seat alive at a time, one Codex write seat per directory), the five-field return template,
  the two-round cross-review loop, and `.orchestrate/<run>/` as the run directory, self-ignoring through
  a `.gitignore` of `*`. The pool is the same whatever the orchestrator's own model, its top pair takes
  the top-row roles in turn, and the bounds are defaults the plan states for the user to override in words.
- `evals/orchestrate.test.mjs` pins that text and runs in `npm test`; `evals/package.test.mjs` now ships
  the new skill in the payload and holds its `metadata.version` to the same agreement as the old one.

### Changed

- `schema-0.153.4/` replaces `schema-0.150.1/` as the pinned protocol reference; `PINNED_CODEX`, the
  fixture's version strings and the README prerequisite move with it. The drift warning that fired on
  every run under 0.153.4 is quiet again.
- `thread/resume` and `thread/fork` send `excludeTurns: true`: the driver never read `thread.turns`,
  every thread created under 0.153.4 is paginated, and for those an ephemeral fork without the flag was
  refused with -32600. Measured: a resume shrank from 1.5 MB to 58 KB.

### Fixed

- A question the model asks through `request_user_input_async` (0.153.0; offered to gpt-6-astra)
  arrives as an agentMessage carrying `questions`, phased `final_answer`. It used to become the seat's
  `answer` under exit 0, outranking the turn's real answer. It is now recorded as an interaction
  (exit 7, `item/agentMessage/questions: <title>`) and never selected as the answer.
- `--mcp` carries package-style server names (`@scope/pkg`, legal since 0.152.0) as quoted TOML keys
  instead of skipping the server.
- A Codex subagent thread is registered from the root's `subAgentActivity` announcement. Measured on
  0.153.4, a child never sends `thread/started`, so the old registration never fired: a delegating turn
  reported `subagentThreads: []` and no child's work at all, and the idle guard, blind while the children
  worked, could cut a long delegation as silence. The report now lists them as
  `{threadId, agentPath, status, items, commands}`, their events prove liveness, and a root that ran
  nothing still exits 5 with a cause that names them: "no command ran on the root thread; N subagent
  thread(s) ran (…, n commands): liveness, not evidence". Evidence and token accounting stay root-only.

### Notes

- A prompt seat gets no `BRIEF:` line. `BRIEF:` asks for 20 lines and clips at 20 lines or 4000 bytes,
  which the five-field return does not fit into; the template is the bound instead.
- Measured: `gpt-6-astra` delegates to its own Codex subagent threads at `xhigh` as readily as at
  `ultra` when the prompt invites it, so delegation is the model's choice and no effort keeps the work on
  the thread the driver started. The mode therefore sets no `EFFORT:` line for any seat, and every
  `MODEL:` inherits the configured effort. A seat that delegates comes back exit 5, "no command ran",
  carrying its answer: only the root thread is evidence, and the answer is still the seat's. The report's
  `subagentThreads` was blind to those children, which never arrive as a `thread/started` with a
  `parentThreadId`; fixed in this release, and the exit-5 cause now names them.
- The run directory is `.orchestrate/<run>/` at the repository root, not under `.claude/`: a write
  anywhere under `.claude/` is refused as a sensitive file, measured even with an explicit
  `Write(./.claude/**)` allow rule.
- Measured: a Workflow `schema` on a `codex-seat` call makes the relay wrap the whole envelope into
  `result`, losing the seat's own fields inside it. A Codex seat takes the five fields as an
  `OUTPUT_SCHEMA:` file and the answer is read below the envelope's `--- answer` line; the `schema`
  option is for Claude seats.
- Measured: `agent({model: 'fable'})` answers as Fable 5.1 from a Fable session and from an Opus session
  alike, so the one Fable seat is tagged like every other Agent call and is available to every
  orchestrator; its cap of one alive is policy, not a limit.
- The relay stays pinned to sonnet and the Agent tool's model option is still never passed to it.
- `evals/orchestrate-live.test.mjs` is the mode's live release gate, behind
  `CODEX_DELEGATE_LIVE_ORCHESTRATE=1` and out of CI: it spends five headless claude sessions, the
  subagents cases 3 and 5 spawn, and one `gpt-6-astra` Codex turn (a second one with
  `CODEX_DELEGATE_LIVE_ORCHESTRATE_DELEGATE=1`, the informational delegation probe). Its sessions run
  under `--permission-mode acceptEdits` with an explicit `--allowedTools` list and the prompt on stdin;
  bypass mode is not needed, and is ignored anyway where managed settings disable it.
- `CodexErrorInfo` gained `rateLimitExceeded` beside `usageLimitExceeded`; neither is retried, and the
  comments now say so.
- The bundled default model is gpt-6-astra when `config.toml` names none; the driver inherits only the
  keys the caller set, so a flagless seat's model changed with the upgrade. Pin `model` in `config.toml`
  or pass `MODEL:`.
- SKILL.md: the `--- answer (N bytes)` marker is the size to check; a relay on a small model was
  measured cutting long answers and altering escapes in JSON ones. Read `answerPath` when the bytes
  differ.

## 0.9.1 — 2026-09-03

- `--help` and `--help-all` no longer call `process.exit()` behind the write: on an asynchronous pipe
  (macOS) that truncated the text when the reader was slower than the exit. Found by CI on the 0.9.0
  release commit (macOS, Node 18); Linux and Node 24 did not show it. The process now exits on its own
  once stdout has drained, as every other refusal path already did.

## 0.9.0 — 2026-09-03

Measured against codex-cli 0.150.1 on macOS (Node 24.11; the free suites on Linux and macOS, Node 18 and 24, in CI). Three commits since 0.8.0: simplification round 3.

### Compatibility notes

- Refuse `--json` and `--footer` as unknown flags. The JSON report is the only report; the footer is
  gone.
- Show coordinator-facing flags under `--help`; use `--help-all` for every flag, the
  `CODEX_DELEGATE_*` variables, and internals.
- Keep the header-field table in `SKILL.md`. The relay names only `SEAT` and remains a mechanical
  transport.
- Correct the 0.8.0 relay measurement: the runs reported as haiku on 2026-09-03 were not verified by
  model id. The shipped agent's `model: sonnet` frontmatter overrides `claude -p --model haiku`, whose
  transcript shows `claude-sonnet-4-6`. A real haiku, selected through a copy with `model: haiku` or
  the Agent tool's model option, ignored the relay contract in four of four runs and answered the task
  itself on both the a156c52 body and the new one. Measure a lower model through a copy with its own
  model line; keep the shipped relay pinned to sonnet.

### Documentation

- Consolidate the 11 reference files into six. Move `lock-internals.md`,
  `commit-blast-radius.md`, and `config-drift.md` into `environment-and-internals.md`; move
  `browser-tests.md` and `pasted-images.md` into `parity.md`.

## 0.8.0 — 2026-09-03

Measured against codex-cli 0.150.1 on macOS (Node 24.11; the free suites on Linux and macOS, Node 18 and 24, in CI). Three commits since 0.7.0: the simplification round.

This simplification round removes coordinator decisions that had defaults and moves the relay
transport into the driver.

### Compatibility notes

- Removed the token budget, its steering and cut mode, and the report's `budget` key. The native limits
  remain 900 seconds of thread silence and 1,000 commands, with no wall clock unless the caller sets one.
- Reduced the seat-file vocabulary from 23 fields to 15. Bounds and transport are command-line-only;
  naming a removed field is exit 2 with the flag to use.
- Made read-level `--cwd` optional. An unset `TMPDIR` no longer exits 2: the driver creates a private
  0700 `<state>/tmp/<runId>`, grants exactly that, reports it as `tmpDir`, and prunes it with run state.
- Seat-file header names are case-sensitive upper-case names at column 0. A blank, comment, or other
  non-field line ends the header; `TASK:`, `CHECK:`, and `RETURN:` always open the body. Files are capped
  at 512 KB, and a review declaration cannot also carry a body.
- Removed the `npx skills` install route: it shipped the skill without the `codex-seat` relay agent.
  Install the plugin, or clone and symlink.
- Replaced the relay's three return shapes with one envelope, rendered by the driver: `exitCode` first,
  `--- answer (N bytes) ---` last. `exitCode: null` is the relay's own shape only when the driver could
  not start or could not run to completion.
- Made seven header fields exit 2 in a seat file: `TIMEOUT`, `IDLE_TIMEOUT`, `MAX_COMMANDS`, `DETACH`,
  `WAIT_TIMEOUT`, `COLLECT`, `PROGRESS`. The flags themselves stay.

### Relay

- Added `--relay <file>` and `--relay-collect <threadId>`. The driver launches one detached seat, waits,
  and renders one text envelope under the run's own exit code; a running envelope includes the complete
  collection command to repeat.
- A wrapper now writes ONE file containing header plus prompt, then chooses `--relay` for the envelope or
  `--seat-file` for JSON. Through `--relay`, a file without `SEAT` defaults to a read seat in the current
  directory; `--seat-file` still requires `SEAT`.
- Reduced the shipped agent to three mechanical steps: write the prompt verbatim, invoke `--relay`, and
  return its output verbatim. It repeats the driver's collection command at most 24 times and has one
  failure envelope.

### Documentation and evidence

- Reduced `SKILL.md` to the relay route, composition, rights, result reading, worktree lifecycle, prompt
  shape, and surviving traps; conditional operation remains in focused references.
- Re-measured the final relay body: sonnet passed the header-less, refused-write, and repeated-collection
  cases 3/3. Haiku relayed envelopes and collection commands but still added fields to header-less prompts,
  so the relay remains pinned to sonnet.

## 0.7.0 — 2026-09-02

Measured against codex-cli 0.150.1 on macOS (Node 24.11; the free suites also on Node 20.10).
Thirteen commits since 0.6.0: a five-goal review of the plugin (59 confirmed findings, each package
goal-checked before its commit) and the design for GitHub issue #1.

### Compatibility notes

- `--timeout` defaults to 0: no wall clock. A turn is bounded by `--idle-timeout` (900 s of silence)
  and `--max-commands` (1000); a caller that declared a clock keeps today's three-rung behaviour.
- The relay (`codex-seat`) runs every seat detached and repeats `--wait` until the report is final;
  its header is optional, `BRIEF` is no longer forced on read seats, and a `TIMEOUT` above 560 is no
  longer refused. Under a plugin install the agent is `codex-delegate:codex-seat`.
- Exit 11 now also covers a command that reached the client with no verdict; the probe exemption is
  judged on the command the server parsed, so a no-match `grep` no longer raises it. A verifier whose
  output overran the old 64 MB buffer used to exit 12; output is streamed now and a loud verifier that
  exits 0 passes.
- Report shape: `commands[]` entries carry `actions`; new keys `cut`, `timing`, `budget`,
  `answerPartial`, `commentaryPath`, `configInherited`, `codexVersion`, `commandsPipedToPager`,
  `verify.budgetMs/timedOut/sandboxed`, `resumedFrom`, `worktreeBase/worktreeRestored`, `rateLimits`,
  `turnDiffPath`, `driverVersion`.
- The lock body and the worktree ledger record a second identity and the app-server's process group;
  entries written by older drivers stay honoured.
- `npm test` replaces the six per-suite commands; `evals/lib/harness.mjs` is shared by every suite;
  the driver exports its constants and runs `main()` only as the entry point.
- Known issues: Node 18 is declared but not measured locally (CI is the first run); the relay's
  plugin-install route and the `TASK:` line fix are pinned by the contract suite but not re-measured
  live since the last body change; Linux is measured only by CI's free suites.

### Relay

- Made the header optional, preserved `TASK:` in the body, resolved the driver across install routes,
  returned the complete report envelope and verbatim answer, and distinguished gate verdicts from runs
  that never started.

### Documentation

- Rebuilt the skill as a compact Agent Skills entrypoint, added focused parity and incident references,
  and stated the governing goal: a native-style one-call subagent with nothing to configure.

### Evidence path

- Classified parsed command actions rather than shell wrappers, restored real negative-probe handling,
  treated unknown command verdicts as exit 11, aligned review shapes with the live server, and added a
  live-turn fidelity path.

### Robustness

- Hardened signal teardown, stdout framing and draining, config inheritance, lock identity, seat-file
  booleans, steering claims, protected roots, and verifier process groups; streamed verifier output and
  added the read-profile sandboxed verifier.

### Worktree lifecycle

- Made driver-owned git immune to hooks, fsmonitor, text conversion, and external diffs; recorded intent
  before checkout, retained refs before cleanup, reaped abandoned MCP homes, and allowed finished
  worktree threads to resume by rebuilding their harvested content.

### Issue #1

- Preserved answers at a caller-declared wall-clock cut with wrap-up steering, interrupt grace, partial
  capture, and timing; added token and silence bounds.
- Added detached seats and `--wait`, `--wait-timeout`, `--jobs`, and `--cancel`, plus relay fields
  `DETACH`, `WAIT_TIMEOUT`, and `COLLECT`. Job records expose mid-flight progress; `endedAt` follows the
  completed report. Locks and worktree ledgers retain `appServerPgid` and are reclaimed only after both
  driver and app-server group are gone.
- Changed native defaults to no wall clock, 15 minutes of silence, and 1,000 commands. The relay detaches
  and waits repeatedly so one Agent call lasts as long as the work.

### Parity

- Added fork, model/effort catalogue preflight, rate-limit snapshots, compact continuation, turn diffs,
  reasoning-summary control, MCP-server subsets, strict adversarial review, and an opt-in stop-time gate.

### Structure and CI

- Added `npm test` over seven suites, a shared harness, exported driver constants, generated help and
  exit-ladder text, package/version agreement checks, and CI for the six free suites across Linux and
  macOS on Node 18 and 24. Added `--allow-failed-commands` for expected probe failures.

## 0.6.0 — 2026-09-01

- Completed a documentation-only best-practice pass: corrected eleven drifted claims, reduced the
  entrypoint, defined terms, and moved conditional detail into focused references.
- Documented the non-zero-result trap, pasted-image handling, and relay-agent precision without
  changing the driver.
- Added license metadata to the plugin manifest and tightened the shipped relay-agent contract.

## 0.5.0 — 2026-09-01

- Added driver-owned worktree harvest and disposal, including staged work, untracked archives, crash
  ledger reconciliation, and retained refs for clean seats that commit.
- Added attachments, pasted-image relay, progress, job records and `--resume last`, native review,
  live steering, and optional isolated MCP-server carry-through.
- Added bounded transient retry, clean interruption, richer activity reporting, two contract suites,
  and extensive corrections from independent review.
- Measured `codex mcp-server` against this driver and documented why it is still not a substitute.

## 0.4.0 — 2026-09-01

- Hardened seat files: `SEAT` must be first, relayed `VERIFY` needs command-line authorization, and
  declared fields are reported.
- Made strict output schemas an admission rule, made an unmeasured verifier exit 12, and validated
  rollout receipts by opening their `session_meta` record.
- Added a `SIGHUP` handler and a full report on every signal, protected relocated state and worktree
  destinations, and isolated eval state. This release changed the signal, seat-file verifier, and
  strict-schema contracts.
- Corrected lock, token, verifier, answer-log, worktree, and protected-root documentation; added the
  coordinator-side background-load warning.

## 0.3.0 — 2026-08-31

- Shipped the repository as a Claude Code plugin with the `codex-seat` relay agent.
- Added `--seat-file` so wrappers pass literal fields instead of interpolating user values into a shell
  command; unknown and repeated fields are rejected.
- Added identity-based root guards, strict schema-verdict handling, and report integrity after a refused
  retry, with adversarial contract tests.

## 0.2.0 — 2026-08-31

- Made the driver wait for its child process group and own the managed-worktree lifecycle.
- Added rollout receipt location (`receiptPath`, `receiptOk`) and made JSON the default report output.
- Reworked installation and operating documentation, moving incident and plugin forensics into
  references and reducing the skill entrypoint.

## 0.1.0 — 2026-08-31

- Introduced the one-file Node app-server driver with per-call read/write rights, worktree support,
  cwd locking, evidence-derived exit codes, and commit/network controls.
- Added private `CODEX_HOME` isolation while inheriting resolved model, effort, personality, and service
  tier through `config/read`.
- Added web-search modes, JSON answers, answer logging, protocol and lock suites, and the first
  fidelity suite against codex-cli 0.150.1.
- Reshaped the returned report to match subagent handoff needs, capping the inline answer while the
  full text stays at `answerPath`.
