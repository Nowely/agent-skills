# Changelog

Hand-written per release from the tagged git log. Dates are the tagged commit dates; detailed
forensics remain in the repository references and release notes.

## Unreleased

### Changed

- **A proxy relays one run and decides nothing, on every host, and a fresh one runs each call of the launcher.**
  Three pages gave the proxy three contracts: the shared call page's relay that never reads the result, the
  operational proxy that decides covered requests and reads the report, and the shipped agent that hands every
  request back. In Codex the proxy was the deciding one, kept one attached call and polled; on 2026-10-09 three
  Luna proxies started a second watcher on one driver, accepted a clipped request and left `--why` empty on 26
  accepts, and a read-only check took close to three hours. In Claude Code two Haiku proxies of three, sent the
  same block after a decision, answered from their earlier turn and ran nothing. Now every host runs the same
  block in a fresh small agent for each `--run` (the first, the one after a decision, a continuation's first),
  names it after the external agent on every host, and the coordinator decides every request; the operational
  proxy page is the main proxy mode's alone.
- **A read agent checks with its file tools, and its inputs sit inside its directory.** Orchestrate told the
  coordinator to give every worker `capture-check.mjs`, a shell command, while an OpenCode read agent asks for
  every shell command and a Claude one for any command outside Claude Code's read-only set; on 2026-10-09 read
  agents briefed that way asked 11 times (Claude, Sonnet) and 43 times (OpenCode, GLM) in one read-only task,
  each question a stop for the coordinator. The script now goes to native workers and Codex agents; the shared
  call page tells the coordinator to brief an OpenCode or Claude read agent in reads and searches, and to put an
  OpenCode read agent's inputs inside its directory, since for one file outside it the agent asked for the whole
  directory. Both drivers now tell a read agent that its read, grep and glob tools need no approval, and the
  coordinator runs a check that needs a command before the launch and puts the result, the commit included, in
  the task. On 2026-10-10 the same task asked once, from 111 calls of read, grep and glob and none of the shell.
- **Four rules a coordinator had to guess are on the pages.** Read against one task on two hosts, the pages left
  these to what a Claude coordinator already knew or a Codex one did not: whether a subagent can launch agents
  (the Claude adapter said it can; a cloud session's subagent had no Agent tool), whether a pre-approved team lifts
  the usage stop (a Codex coordinator read it so and ran past three times the pilot), which text the completeness
  critic must have read (in both hosts a shorter message went out than the one it read), and whose `TMPDIR` an
  external agent's checks write to (orchestrate promised each agent its own; only the Codex driver makes one).
  Each now says what holds.
- **A refused accept of an OpenCode or Claude request names the frame it was printed in.** `--decide --accept`
  compared a typed request's body but told the caller to copy the lines between `COMMAND<<` and `COMMAND>>`,
  which such a request does not print; on 2026-10-09 a proxy that restated an OpenCode permission's command
  alone was sent looking for them twice. It now names `REQUEST_BODY<<` and `REQUEST_BODY>>` for a typed request.
- **The usage stop compares usage per unit.** It compared an agent's total with the pilot's median per agent, so an
  agent carrying more units than a pilot agent crossed it by size alone: on 2026-10-10 a Codex coordinator's pilot
  agent read one ledger entry for 376,319 tokens, was continued for the other twelve for 2,470,884, six and a half
  times the pilot and about half of it per entry, and the audit of that run reported the stop as missed.
  The line is now three times the pilot's median per unit, counted in tokens from the agent's report, since a
  second audit could not tell whether "usage" meant tokens or the catalog cost an OpenCode report also carries.
- **In Codex, a proxy runs the launcher outside the sandbox.** The proxy's block was written for Claude Code's Bash
  tool and said nothing of a sandbox; the driver starts the agent's CLI, which writes its state under the home
  directory and reaches its provider, and Codex's sandbox allows neither by default. On 2026-10-10 a Codex proxy
  given the block alone handed back an OpenCode server that had exited before its run began, where the day before
  proxies that asked for escalated permissions had started theirs. The shared call page now gives a Codex proxy a
  step 1 that asks for them, with a justification naming the agent, and the launcher refuses a `--run` or a launch
  made under Codex's macOS sandbox, which marks its commands `CODEX_SANDBOX=seatbelt`, before it starts anything:
  its `ERROR=` says to run the same command again with escalated permissions, and the agent's directory stays
  fresh for that call. The suites' own launches drop the mark.
- **In Codex, a proxy waits for the run to end before it hands back.** Codex's shell tool comes back while a long
  command runs, with a session id and no exit code, and the block's step 2 sent such an empty result on as it was.
  On 2026-10-10 four of the first five Codex proxies that ran handed back nothing, or step 4's "report delivered"
  line, while their agent went on working, and the coordinator read the report and the driver's processes itself.
  A Codex proxy's step 2 now reads the command's session again with `write_stdin` until an exit code comes, and
  its step 4 is left out, since its final message is its hand-back.
- **The proxy's command goes as written, with no variables before it.** Orchestrate told the coordinator to pass
  its temporary context on "worker commands", and on 2026-10-10 a Codex coordinator put `TMPDIR`,
  `ENTRUST_STATE_DIR` and `ENTRUST_TEMP_CONTEXT`, over 400 characters, before every proxy's `--run`; one brief
  mistyped the launcher's path and its proxy was stopped. `--run` starts the driver in the working directory and
  with the state directory `--new` recorded, which a new case in the launcher's suite checks from another directory
  and another `TMPDIR`, and the pages now say the launcher's calls take none of it.
- **In Codex, the user approves an outside provider in the chat.** Codex's automatic reviewer of escalated commands
  read a `--new` that sends the project's files to OpenRouter as a transfer the user had not approved, though the
  brief the user pasted said they had: on 2026-10-10 it refused the launch twice, and the run waited 15 minutes for
  the user's chat answer; earlier that day the same refusal ended with the coordinator doing the task with the
  host's own model. Orchestrate now tells a Codex coordinator to get that approval in the chat, naming the provider.
- **After a passing pilot, the rest runs side by side.** The plan said only to expand when the pilot's rule passes,
  and on 2026-10-10 a Codex coordinator continued its one GLM agent over the twelve remaining ledger entries in
  three batches of four, one after another (6.1, 5.0 and 2.9 minutes), under a bound of six alive. The plan now
  gives the remaining independent units to agents that run side by side within the bound, unless usage rather
  than time is the limit.
- **An OpenCode server that ends before it serves says why.** The driver read the server's output only for its
  address and reported "exited before announcing its local URL" alone; on 2026-10-10 a Codex rerun of the
  orchestrate task stopped there half a second after the server started, and its report held no exit code and
  none of the server's words. The error now carries the exit code or signal and the last lines the server printed.

## 0.28.0 — 2026-10-09

### Changed

- **Every external agent is told its rights, how to ask for more, and what to do with a refusal.** Only Codex agents
  had standing rules, and none of them said how to ask: an OpenCode or Claude agent was given its task alone, and
  a Codex agent under `NETWORK: no` whose fetch failed asked nobody, since Codex raises a request for a network
  failure only when the agent asks for escalated permissions (measured on the owner's machine). The three drivers
  now give one set of rules (`drivers.mjs` `standingRules`): what the rights let the agent do, that anything else
  is asked of the coordinator and how (a Codex agent reruns the refused command with escalated permissions; an
  OpenCode or Claude call waits for the decision), and that a refused or declined action is recorded with what
  it blocked, never worked around. A run with no mailbox is told that nothing more can be granted. A live Claude
  read agent asked to write a file made one request, was declined, and answered `blocked` naming what it needed.
- **Under a plan, `--new` takes the adapter from the row.** A coordinator named the adapter twice, in the row and by
  choosing that adapter's `agent-run.mjs`, and a wrong entry script was refused. Now any entry script, or
  orchestrate's own launcher, makes a planned agent with its row's adapter; `--adapter` is needed only without a
  plan, and one that disagrees with the row is refused.
- **A prompt with no `RIGHTS:` is a read agent in the current directory, in every adapter.** OpenCode and Claude
  refused it outside a plan while Codex read; all three now read, the narrowest grant, unless a plan row pins the
  writes. Yes-or-no fields (`ALLOW_NO_COMMANDS`, `BRIEF`, `SAFE_MODE`) take yes, true or 1 and no, false or 0 in
  every adapter, as Codex's always did.
- **A Codex agent continues from its report path, as the others do.** `RESUME:` in a Codex prompt took a thread id
  or `last`, which the status lines do not print, and the offline check passed a report path that failed only at
  run time (X8). It now takes the earlier run's `REPORT=` path: the driver reads the thread from the report at
  `--check-prompt-file`, and the continuation keeps the run's directory, rights and `WRITABLE:` roots, so a
  `RIGHTS:` line names the same or is left out. A bare thread id is still taken; `RESUME: last` is refused, since
  under a plan the last run in a directory may be another worker's.
- **One evidence rule: a turn that observed nothing is exit 5, in every adapter, unless `ALLOW_NO_COMMANDS: yes`.**
  An observation is a command that succeeded or a file read. OpenCode counted only shell commands, so its own
  page's template failed a valid answer from an agent that only read files, and Claude had no such gate; OpenCode
  now counts its read, list, glob and grep tools, and Claude counts Bash, Read, Grep and Glob and takes the field
  (X7, the exit-5 half).
- **One budget in three parts, in every adapter.** Each agent is bounded by silence, by volume and by a wall clock
  that stands still while a request waits for the coordinator. Codex already was (900 s idle, 1,000 commands, no
  wall clock unless asked); Claude had only a 30-minute wall clock that kept running through an approval wait, and
  OpenCode had no volume bound. Claude now cuts at 1,000 tool calls and OpenCode at 1,000 commands, both with exit
  3, and both wall clocks pause while a request is open. OpenCode counts a session its server reports busy as
  progress, so a long quiet command is no longer cut as idle (X13). The numbers are unchanged until a live run
  measures better ones.
- **One report core.** A Codex report now carries `adapter`, `error` (the turn's own error, else the reason for
  its exit code), `rights` (`{kind, roots}`) and `requestedModel`, which the OpenCode and Claude reports already
  had, so a coordinator reads the same fields whichever adapter ran. Its own fields stay; `usage` keeps each CLI's
  shape and is not part of the core.
- **The Codex driver's `--help` is one page of 80 lines, and `--help-all` is gone.** The two tiers ran to 170 and 370
  lines for a command line the launcher types, and restated `environment-and-internals.md`. The help now gives the
  usage forms, the fields and the command-line-only flags (rendered from the field table), each flag in a line or
  two, the exit ladder (rendered from the rungs), the state layout and the environment. The prompt-file grammar,
  the output-schema caps, the wall-clock grace and the suites' seams, which only the old help carried, are on
  that page.
- **The Codex driver's comments state each reason once.** The narrative, the history and the restatements went
  (about 280 comment lines, from 1,461): a fact the file told up to seven times is told where it applies and
  pointed at elsewhere, measurements are summarised beside the code they justify, and the details a page already
  explains are a link to it. The driver is about 4,000 lines, from 4,600 before the help and the comments.
- **The launcher's `--help` is the coordinator's part, 65 lines from 142.** Each mode in a paragraph, pointing at
  the shared call page for the steps; the launch-only mode, the keeper and the edge cases are under `--help-all`.
- **The shared call page says which of the user's MCP servers an agent has**: a Codex agent none, since it runs
  in an isolated Codex home, a Claude agent the user's unless `SAFE_MODE: yes`, an OpenCode agent its user's
  OpenCode configuration (decision 6 of the driver audit).
- **One page for calling an external agent.** `orchestrate/references/external.md` holds the steps every adapter
  shares, written for a coordinator of any host: the prompt's core lines, `--new`, the run in Claude Code (the
  Agent call and its block) or in Codex and OpenCode (a native proxy on the host's smallest model), the status
  lines, the report's core, the exit codes, deciding a request, continuing, stopping, the budget, and what still
  differs by adapter. The Codex, OpenCode and Claude pages keep their models, extra fields and their part of the
  report, and link it; a Claude or OpenCode call no longer needs the Codex page. Every page names one launcher,
  orchestrate's `agent-run.mjs`; the adapters' own entry scripts still work. `agents/proxy.md` carries the block's
  four steps word for word, and a test compares the two (X16). Each host's models page names its proxy model.
- **One approval mailbox for the three drivers.** The files a driver writes into `<DIR>/approvals`, the rule a
  decision must fit, the record kept before any answer and the thirty-minute deadline are one module,
  `orchestrate/scripts/mailbox.mjs`, which the launcher's `--decide` shares too; each adapter keeps only how its CLI
  is answered. Three differences went with it: an OpenCode driver now refuses a mailbox outside its state directory,
  as the other two did; a decision file that fits no request of the run no longer keeps an OpenCode request open
  past its deadline; and an OpenCode accept or answer that cannot be recorded is declined at once, as in Codex and
  Claude, instead of waiting out the deadline. `pending` is absent, not empty, when no request is open, in every
  adapter.
- **An OpenCode edit outside the worker's roots is offered, not declined; a guarded one is declined in every
  adapter.** OpenCode declined every edit outside the roots, though its request carries the whole edit a coordinator
  can restate; it is now offered with `CAUSE=outside`, as a Claude edit outside its directory already was. Codex
  still declines a file change outside its rights, since its request carries no body. An edit aimed inside the
  state directory, where the mailboxes are, or the CLI's own configuration (OpenCode's configuration and data,
  `~/.claude`) is declined at once and never offered; Claude's approval server now checks that too, where before
  only the mailboxes were denied.
- **Each driver checks the rights its CLI reports, and stops a run under others (exit 4).** Codex already compared the
  sandbox its server reports with the one asked for; that check is one table for both levels now. OpenCode now
  reads back the permission rules a session holds, at creation and on a resume, and runs none whose rules differ
  from the ones its rights need, wider or narrower, since those rules are all of OpenCode's enforcement; a server
  that reports no rules is said on stderr. Claude stops a run whose `init` reports another permission mode or
  another set of built-in tools than its rights give, measured live on 2.1.295 (`manual` comes back as `default`,
  and `--json-schema` adds `StructuredOutput`).
- **Two rows of a plan never write one tree, in every adapter.** `--plan` refuses rows whose `write` directories
  overlap, compared by inode so a link or another spelling is the same directory, and two `live tree` rows; `--new`
  refuses a `live tree` agent whose directory overlaps another row's. Only Codex writers kept off each other, by
  their lock, and only when they shared a state directory; OpenCode and Claude writers did not at all (X5). Writers
  in sequence on one tree are one row and its continuations. The Codex lock stays for runs with no plan.
- **What each adapter adds to a request is one section of the shared call page.** The operational proxy, the
  Codex or OpenCode subagent that relays a run, linked three adapter pages for it; it now links "What each
  adapter adds" under Decide a request, which says what an accept runs and what is never offered for Codex,
  OpenCode and Claude. The adapter pages keep only their mechanics.
- **The pages say what the owner's machine measured.** Under `NETWORK: no` a Codex fetch fails inside the sandbox,
  and the agent asks for one the task needs (the Codex field table and the shared page). OpenCode keeps a session's rules as sent, and its bash rules let a redirect through under an allowed
  prefix (`git diff > file` under `git diff*`), which is why the adapter allows no shell command unasked
  (`opencode/references/parity.md`).

### Fixed

- **No page offers a decline as a way to stop a run (E115).** The codex page and the launcher's `--help` said to stop
  an agent by declining its waiting request and running `--run` again, though a decline answers that one request
  and the turn goes on. The shared call page, which replaced both, says so: a decline answers one request, and Stop
  is the proxy's Stop or a SIGTERM to the driver's pid.
- **A refused permission no longer ends an OpenCode agent's turn.** OpenCode ends the turn when a permission is
  rejected with no message, and reports a rejection with one to the model as feedback while the turn goes on
  (v1.18.34, `session/processor.ts`). The driver rejected with no message, so an agent whose request was declined,
  or refused for want of a mailbox, stopped before it answered: on the owner's machine a read agent asked to write
  exited 13 with no answer. The driver now rejects with the reason and what to do with it; a Stop still ends the
  turn.
- **A relay with no `SubagentHandback` tool writes the status lines as its final message.** A subagent of `claude
  -p` (2.1.295) has no such tool, and the relay, told to call it, wrapped the lines in prose about the missing
  tool, in all seven runs of the step-5 measurement. Step 3 of `agents/proxy.md` and of the shared page's block
  now says what to do without it; three runs with that sentence handed back the lines alone.
- **An OpenCode report says whether a corrective turn ran.** The driver computed the outcome of the one corrective
  turn it spends on an answer that failed `OUTPUT_SCHEMA`, then dropped it; the report now carries it as
  `correction`.
- **A write root is checked the same way in all three drivers, before any agent exists.** An OpenCode `write` root
  could contain the state directory, and its allowed edits then reached the run's own mailbox, so the agent could
  write its own accept; Codex refused such a root only at run time, after the pid line. One check in
  `orchestrate/scripts/drivers.mjs`, `writeRootProblem`, now runs in every driver's `--check-prompt-file` and
  again at launch: no home directory or ancestor of it, nothing equal to, inside or above the state directory, and
  each adapter's own directories (`~/.codex`; `~/.claude`; OpenCode's configuration and data), compared by
  dev:ino. An OpenCode write session also denies edits to `.git`, `.opencode/` and `opencode.json` inside its
  roots, after the allows, so a rewritten gitlink cannot point the driver's own git at a repository the agent made
  (research/2026-10-08-driver-audit, X1).
- **The git a driver runs in an agent's worktree cannot be turned against the caller.** The shared `git()` that
  OpenCode and Claude worktree reports use ran plain `git diff` and `git status` in the tree, so an agent that
  rewrote its tree's `.git` file to point at a repository of its own had its fsmonitor run under the driver, with
  the caller's rights (run on the fake `claude`). Every shared git now carries the Codex driver's overrides (no
  fsmonitor, no hooks, no external diff or textconv), and a worktree is read through the git directory its
  repository records, never through the tree's own `.git` (X10).
- **An agent runs where its prompt was checked.** `--new` checks a prompt in the coordinator's directory, but `--run`
  started the driver in the directory of whoever called it, the relay, so a bare `RIGHTS: read`, a `live tree`
  or a `nothing` row could run in another tree than the one checked (run on the fake app server). `--new` now
  records its working directory and state directory in `agent/launch.json`, and the driver runs there, under
  that state directory (X4).
- **A Codex `WRITABLE:` root is bound by the plan.** Under a registered plan only the `RIGHTS:` line was checked
  against the row's writes, so `RIGHTS: write A` with `WRITABLE: B` passed and the run wrote B. A `WRITABLE:` root
  must now lie inside the row's write root (X2).
- **No accept is answered before the mailbox holds it.** Claude's approval server answered allow even when the
  request's record could not be rewritten, and OpenCode answered the server first and recorded afterwards, so a
  command could run with the user's rights while the mailbox, and the launcher's `approvals=` count, showed no
  accept. Both now record the settlement first: Claude answers deny when it cannot, OpenCode leaves the request
  unanswered for its deadline. The Codex driver already worked this way (X3).
- **A continuation keeps its rights.** OpenCode sets a session's permission rules when it creates the session, so a
  write session resumed with `RIGHTS: read` reported read while the server still allowed writes; Claude demanded a
  `RIGHTS:` line on a resume and then ignored a different `read` directory. In both, a resume now keeps the earlier
  run's rights: a `RIGHTS:` line names the same or is left out, and anything else is refused (N1, X9).
- **OpenCode resumes and refusals.** `RESUME: last` took the newest report beside this one, which under a plan is
  another worker's, and is now refused (X6). A resume of a run still going exits 10, as in Claude, and one whose
  run died before publishing says so (X14). The report is claimed before any refusal, so a run that cannot make
  its mailbox no longer writes over an earlier report at its path (X12).
- **An isolated Codex agent answers on the caller's provider.** The isolated home carried the model, effort,
  personality and service tier but not `model_provider`, so a caller whose config selects a provider of its own ran
  against the default one. It now carries `model_provider` and that provider's `[model_providers.<name>]` table
  (its scalars, string lists and one-level string maps). Checked on the fake app server; the shape the real
  `config/read` gives a provider table is unmeasured (X11).
- **Pages and comments that no longer held.** The codex page told the coordinator to declare gates on the command
  line, and `parity.md` offered `--host-home` for MCP tools, though the one call passes the driver nothing but its
  prompt, report and mailbox; both now say what a coordinator can do. `main-proxy.md` named `agent-orders.mjs`
  under whichever skill the reader came from; it names orchestrate's. The swarm page says an OpenCode worker in a
  batch cannot run a shell command. The Codex driver's comments on the lock's anchor, the worktree ledger's reason,
  the approval deadline and `LIMITS` are corrected, its standing rules no longer tell the agent its coordinator is
  Claude Code, and `ISSUES.md` E113 and E115 cite the code where it now is (X15, X17, X7).

### Removed

- **The V2 pilot's run log left the plugin.** `opencode/references/v2-pilot.md` shipped a private model endpoint
  and machine paths with every install. It is now `research/2026-10-02-opencode-v2-pilot/01-pilot-record.md`, with
  the endpoint and the evidence paths removed; the earlier text remains in the repository's history (X18).
- **The driver features no call reaches.** The Codex driver's `--verify` (with `--verify-sandboxed`,
  `--allow-prompt-verify` and the `VERIFY` field), its exit codes 9 and 12, the wrap-up steer that asked an agent
  for its answer before a declared wall clock ran out, and `--answer-json` are gone, as is the OpenCode driver's
  `--verify`. The one call passes the driver no flag, so none of them could run, and a verifier in a write agent's
  tree runs the agent's own code with the caller's rights (decision 3 of the driver audit). `--output-schema`
  still asks for one bare JSON object; `--timeout`, `--idle-timeout` and `--max-commands` stay as driver flags.
  Check an end state yourself after reading the report (codex `result-gates.md`). The suites' agent writes its
  tree through the fake server's `FAKE_AGENT_SH` instead.
- **OpenCode's V2 path.** The adapter speaks OpenCode's V1 API only: `API_FAMILY` and `AGENT` are no longer
  fields, `status.mjs` takes no `--api-family` or `--agent`, and a report or session an earlier release recorded as
  V2 is refused on continuation. V2's client, its fake server, its cases and the pilot that measured it are in
  `research/2026-10-02-opencode-v2-pilot/` (decision 4 of the driver audit).
- **Attaching OpenCode workers to a remote server.** The driver always starts a private loopback server with the
  user's `opencode` CLI and stops it when the worker ends, which is how the adapter is used.
  `ENTRUST_OPENCODE_URL` and `ENTRUST_OPENCODE_CONNECTION` are no longer read, `status.mjs` probes nothing and
  takes only `--format`, and a report made on a remote server is refused on continuation (decision 5).
- **OpenCode's dead state.** The `report.runtime.json` sidecar, written five times during admission and read by
  nothing, is gone with the report's `runtimePath`, as are values set and never read (in the driver, the contract
  and the client), re-exports no importer takes, a second route check on every new run, and a route-filling
  fallback no route reaches. The steer disclaimers are one sentence: there is no steer, continue with `RESUME:`.
  `interactions.md` and `parity.md` keep what a decision needs and point at the shared call page for the commands.
- **Report fields nothing read.** The Codex report drops `expectationOk` and `commentaryOnly` (each derived from a
  field beside it), `answerPhase`, `answerPartialPath`, the rollout's `receiptOriginator`, `receiptModelProvider`
  and `receiptCwd` (`receiptOk` is the verdict on them), `unparsedLines`, the echo `schemaSizeCaps`, and the
  worktree's `worktreeDiffStat` and `worktreeFleet` (the diff itself is at `worktreeDiffPath`). The OpenCode and
  Claude reports drop the constant `costSource`, and OpenCode its constant `schemaOverflow` and
  `approvalsAutoAccepted`, and both the `invocationId` echo. Fields a driver reads back on a continuation stay.
- **The Codex driver's web-search policy reader and three approval counters.** The reader ran `plutil` over a
  managed macOS profile to refuse a `WEB_SEARCH:` mode the profile would narrow, a freshness difference it twice
  led coordinators to answer with a mode nobody asked for; where such a profile exists the driver now says so on
  stderr, and `ENTRUST_POLICY_SEAM` is gone. `approvalsStale`, `approvalsLate` and `approvalsDuplicate` counted
  what the mailbox already records: a stale decision file is left in place and its request file says so, which
  the launcher's `RECEIPT=` counts, and a request id sent twice is still one request, answered once and said on
  stderr.
- **The Codex mailbox's owner claim.** A Codex driver wrote `owner.json` into its mailbox, refused a mailbox that
  had ever had one, and checked it before every write, so that two drivers could not rewrite one `pending`. The
  launcher already starts one driver per agent directory, by its exclusive `err.txt`, and makes each mailbox
  there, so no supported caller could hand two drivers one mailbox. The claim, its checks and its case are gone;
  the driver still refuses a mailbox outside its state directory or inside a root the agent may write.

## 0.27.0 — 2026-10-08

### Added

- **External Claude agents.** The `claude` adapter runs a Claude agent as the launcher runs Codex and OpenCode agents:
  one `claude -p` per launch, from any host, through `claude/scripts/agent-run.mjs`, a proxy and the mailbox. A
  plan row whose adapter column is `claude` is an external run; a five-column row naming a Claude model stays native.
  The prompt takes `RIGHTS`, `MODEL`, `EFFORT`, `OUTPUT_SCHEMA`, `RESUME` and `SAFE_MODE: yes`, which runs Claude
  Code's `--safe-mode`: no CLAUDE.md, memory, skills, plugins, hooks or MCP servers, so no approvals. Claude Code
  validates the answer against the schema (`--json-schema`); a continuation forks the earlier session
  (`--resume --fork-session --session-id`); a stop is SIGINT, which ends the turn with a result. Each permission
  prompt reaches the mailbox through a stdio MCP server, `claude/scripts/approvals.mjs`, the mailbox's only
  writer: a plain Bash command comes back as a command request, any other call as `claude.permission` with the
  whole call to restate. The plan pins the model and the writes; a `write` directory may not overlap the state
  directory, and Edit deny rules keep every file tool, redirect and `tee` out of the mailboxes. A refusal at launch
  is a published report, its reason on `ERROR=`. The driver is 425 lines, measured against Claude Code
  2.1.294 (research/2026-10-08-claude-adapter); `evals/claude.test.mjs` runs it on a fake `claude`, and
  `ENTRUST_LIVE_CLAUDE=1` runs one approval through the real one on Haiku. The advisor in a Codex host reaches
  Claude through it.

### Changed

- **What an external driver shares is orchestrate's.** The exit-code table, the request-id shape, the RIGHTS grammar,
  its check against a registered plan's writes and the scope it grants, and the worktree a `worktree` agent runs in moved, unchanged, from the OpenCode adapter to
  `orchestrate/scripts/drivers.mjs`, which the OpenCode driver imports, so a second driver does not copy them.
- **The Codex driver's exit codes and RIGHTS grammar are the shared ones (E137).** It defined the same exit numbers
  under names of its own (`OK`, `TURN_NOT_COMPLETED`, `ESCALATED`, `INTERACTION`, `VERIFY_UNMEASURABLE`) and parsed
  RIGHTS itself; it now imports `EXIT`, `parseRights` and `resolveRights` from `orchestrate/scripts/drivers.mjs`.
  No exit code changed its number; a bare `RIGHTS: write` or `worktree` is refused in the shared words. Its
  worktree code stays its own: it is not a copy of the shared `makeWorktree` but more of it, a ledger written
  before `git worktree add`, reconciliation after a crash and a continuation rebuilt at its base (E139 records
  that the other drivers' trees have none of it).
- **A prompt with no `MODEL:` runs on its plan row's model.** Under a registered plan the OpenCode and Claude
  drivers refused a prompt that named no model; it now takes the row's, as an absent `RIGHTS:` takes the row's
  writes. A prompt naming another model, or OpenCode's `inherit`, is still refused. The rule is one function,
  `resolveModel` in `orchestrate/scripts/drivers.mjs`.

### Fixed

- **A worktree report carries committed work (E136).** `worktreeFacts` diffed the worktree against its index, so an
  OpenCode or Claude agent that staged or committed its work reported an empty `diff`. It now diffs against the
  recorded base commit, as the Codex driver does.
- **A missing run directory is refused, not reported as a missing `claude`.** A `RIGHTS: read` or `write` directory
  that does not exist, or a `RESUME` whose run's directory is gone, passed `--check-prompt-file` and then failed the
  spawn with ENOENT, which the Claude driver reported as "claude is not on PATH", exit 4. `--check-prompt-file` now
  refuses it.
- **A plan row's model is its own adapter's (E135).** The registry checked a row's model against every adapter's
  list, so `x | codex | opus` registered and the Codex driver would have run a row approved as a Claude model. A
  row's model is now checked against its adapter's declaration alone, and a `native` row's against a native
  adapter's.
- **A Codex row's model and writes bind its prompt (E138).** A registered plan bound a Codex agent's id alone: its
  prompt could name another model and wider rights than its row, and `--new` admitted it. The Codex adapter now
  records the row's model and writes, as OpenCode and Claude do, and its driver refuses a prompt that departs
  from them; a prompt naming neither runs on the row's. A Codex model named by its slug, `gpt-…-sol`, matches a
  `sol` row.

### Compatibility

- External Claude agents need the `claude` CLI at 2.1.259 or later, signed in; nothing else changes for a host that
  does not use them.
- Under a registered plan a Codex prompt is held to its row (E138): one naming another model or other writes than the
  row is refused at `--new`, as OpenCode and Claude prompts already were, so a coordinator that relied on naming
  another amends the plan. A prompt naming no `MODEL:` or `RIGHTS:` runs on the row's, in all three adapters; an
  OpenCode or Claude prompt with no `MODEL:` used to be refused.
- A plan row naming another adapter's model, `x | codex | opus`, no longer registers (E135), and a `plan.txt` already
  holding one is refused at `--new`.
- The Codex driver's exported `EXIT` uses the shared names, `SUCCESS`, `MODEL`, `COMMANDS`, `APPROVAL`, `NEEDS_INPUT`
  and `VERIFY_UNMEASURED` for `OK`, `TURN_NOT_COMPLETED`, `NO_COMMANDS`, `ESCALATED`, `INTERACTION` and
  `VERIFY_UNMEASURABLE`; no number changed. A Codex `--new` now writes `agent/backend.json`, as the others do.

### Validation

- Locally, in a Linux container running as root on Node 22: every entrust suite but protocol, lock and cli is green,
  agent-run at 55, claude at 19 with its live case skipped and opencode at 82; the failing cases of those three
  (process-group sweeps and permission refusals) fail the same way on the tree before this release's Codex changes
  and passed in CI on #68. `scripts/skills.test.mjs` passes 8 of 8 and terse's pages 12 of 12. CI's four jobs run on
  the release PR, and a red run stops the release.
- The Claude driver's live case passed twice on Haiku against Claude Code 2.1.294 during #68, before the model pin
  moved to the shared rule; the pin is covered offline.
- Not run: the live fidelity gate, the live orchestrate gate and the cross-plugin terse brief, which this release's
  launcher and driver changes call for; the preparing machine has no Codex CLI. The Codex plan binding is covered
  by the fake app server only.

### Known issues

- Open ledger entries remain E67, E90, E96, E100, E102–E104, E110, E111, E113–E115, E117 and E139; see
  [`ISSUES.md`](ISSUES.md).

### Release environment

- Release preparation used Node.js `v22.22.0` and Claude Code `2.1.294`, with no Codex CLI. The CLI protocol pin,
  `0.159.3`, is unchanged.

## 0.26.0 — 2026-10-08

### Removed

- **The `/entrust:experiment` skill and its record script.** None of its six registered protocols ran in the three weeks since 0.20.0 shipped it, and the two experiments recorded in that time (`research/2026-10-05-codex-profile-plans` and its rerun) were Codex-native runs, while the page opened by loading the Claude-only `codex` adapter. The method is one paragraph in the orchestrate plan, [An experiment on these rules](plugin/skills/orchestrate/references/plan.md#an-experiment-on-these-rules), and the record goes straight to `research/<date>-<slug>/` in a checkout. The protocols E1 to E6 moved unchanged to [`research/protocols.md`](research/protocols.md); the swarm page, the prepare-feedback focuses and the README point there. Records an earlier version wrote under the data directory's `experiments/` stay where they are; cleanup never listed them.

### Added

- **A `claude` adapter skill, the Claude Code counterpart of `codex` and `opencode` (most of E124).** It owns what was Claude-specific and lived in the Codex adapter's orchestration reference or on the shared pages: Claude's tier table, the Agent-call rules (an explicit `model`, the card's description, no top-tier agent spawning another), waiting on background and headless agents, Workflow, the foreman's launch, explicit-only skills and the protected data directory. Orchestrate loads it before composing in Claude Code; Codex never selects it implicitly. Orchestrate's incidents page, which no orchestrate page linked, is gone (E128): its Claude Code entries are this adapter's incidents, its driver entries the codex adapter's.

### Fixed

- **The README is the install page (E132).** 344 lines and 3,163 words restating the codex adapter's rights, gates, run lifetime and limitations, the scratch layout, the cleanup's inventory and a table of where each story really lives are now install, one row per skill, prerequisites, where the state lives, one driver call by hand and the development links; the pages it restated keep their content. The Codex upgrade recipe moved to `RELEASING.md`, the only place that sent a reader to it. The plugin's and the marketplace's description say the same in one sentence each.
- **The opencode adapter's description says what it does (E134).** It opened with "use immediately when the user says…" and never said what the adapter does; it now says that, then when, in the third person, with every trigger phrase kept. The `evals/opencode-routing/` cases, which run through `claude plugin eval` and spend tokens, were not rerun.
- **The launcher is orchestrate's, and each adapter adds only its own part (the rest of E123).** `orchestrate/scripts/agent-run.mjs` registers plans, makes an agent's directory and mailbox, keeps the keeper and the status read, and names no adapter. Each adapter's `scripts/launch.mjs`, named by `launch` in its `adapter.json`, gives its driver, the environment the driver gets, what `--new` records (OpenCode's server or connection file) and the request types it adds (OpenCode's permission and question); a plan row's models are the adapters' `plan` declarations, not the launcher's own lists. `codex/scripts/agent-run.mjs` and `opencode/scripts/agent-run.mjs` enter it in-process, the OpenCode one no longer through a second Node process. `--plan` runs from orchestrate's directory, and an external launch into a native row is refused as "a native agent", not "a Claude agent".
- **What every route uses has left the Codex adapter (most of E123), and the linter's model slugs are the adapters' own (E122).** The five-field schema is `orchestrate/schemas/five-fields.schema.json`; the cleanup script is `cleanup/scripts/cleanup.mjs`; the session's bounds (team sizes, six alive at once, one top-tier agent per model family) are orchestrate's. Each adapter declares itself in `skills/<id>/adapter.json` (status probe, launcher, swarm defaults, model-slug shape), replacing `orchestrate/adapters.json`: the status collector, the swarm and the answer linter read those declarations, the swarm takes `--adapter <id>` with no default, and orchestrate's page says "skip the adapter whose provider is the active host" instead of naming Codex. The undefined "redirect rule" left the bounds table. The fragment registry lost its inline-schema kind and `--write`, which no page used any more.
- **The shared skills name no model (most of E122).** Orchestrate's profiles, its effort default, the advisor, the swarm, prepare-feedback, the cleanup page's examples and the README spoke of Luna, Astra, Sol, Terra, Sonnet, Opus, GLM or DeepSeek; they now speak of the top, strong, cheap and bulk tiers, and each adapter names its models in `references/models.md` (Claude Code's and Codex's, with Codex's `EFFORT:` per row; OpenCode keeps its recent-model rule). The answer linter names an agent by its model's last word instead of special-casing `Codex`. A Claude-hosted plan now fills a tier from Claude's table unless it routes the role to an adapter.
- **Orchestrate states each rule once (E127).** "Never substitute a model silently" was written five times across the page and `plan.md`, the card's display rules three times, the pilot for a new model/task pairing and "stale is not unlimited" twice each; each now has one owner, the card's rules in `plan.md` and the substitution rule in Capacity and models. The swarm page names the shipped five-field schema instead of pasting a copy of it.
- **The cleanup page says what the coordinator does, not what the script decides (E131).** Its 39-line "What it never touches" retold which locks, legacy folders and old names the script keeps; each listing row already gives its reason. The README's cleanup paragraph is three lines.
- **Skill pages no longer carry their history or this repository's procedures (part of E128 and E129).** Dated measurements, issue numbers and the E4 research verdict left the codex, swarm, orchestrate and prepare-feedback pages (the codex one moved to its incidents reference); the completeness critic's procedure is a list of steps; `answer.md` no longer copies AGENT.md's design principles and `plan.md` no longer names this repository's research paths.
- **`evals/evals.json` no longer says `claude plugin eval` is missing from the build (E101).** The build has it, and `opencode-routing/` already runs through it; the legacy Codex cases stay manual because the command does not read their format, as the evals README already said. The file also names the README's section by its current title, "Running the trigger cases".
- **The README says what the cleanup does with write locks (E112).** It removes a released lock's leftover link, an abandoned lock with its record, and a lock record no link names, and only reports a lock still held or in the previous shape, as `cleanup.mjs --help` and the cleanup page say. Before, the README put every write lock among what the cleanup only reports, so a reader of it alone would not expect it to delete anything lock-shaped.
- **The command-gate research run has a README and a row in the research index (E95).** `research/2026-09-28-command-gate/` held ten numbered files and nothing that said what they found; its README now gives the question, the result, the measurements with their files, how the recommendation turned and what stayed open.
- **A file a Claude agent leaves goes in a directory of its own (E108).** The codex orchestration reference sent it under `$TMPDIR`, which Claude agents launched together share with the session, so two told to leave a file there could overwrite each other's with no error; the agent now makes its directory with `mktemp -d` and names it in its return, as the driver gives each Codex agent a fresh one.
- **The foreman's line on explicit-only skills gives the cause that was observed (E91).** The Skill tool loaded an explicit-only skill in each turn whose user message typed its command and refused it in each one that did not (13 loads, 6 refusals, 2026-09-29), and nobody types a command to a subagent, so the conclusion stands: pass the files directly. Before, the codex orchestration reference said the tool refuses every such skill, a cause a reader would route around where the load works.
- **A `--decide` that lands while the driver settles the request is refused as already settled (E121).** The launcher read the request and then `pending`, and the driver writes the settlement and then rewrites `pending`, so a decision between the two was refused with "is not waiting". It now reads `pending` first, and in that order a request missing there is settled or truly not waiting. Nothing was ever published twice or lost; only the stated reason was wrong.
- **Each OpenCode report has answer, transcript and runtime files of its own (E120).** They were `answer.txt`, `transcript.json` and `runtime.json` beside the report, so a continuation's report in the same directory overwrote the files the earlier report names, and its `answerPath` showed the later answer. Contract: the three files are named after the report, `report.answer.txt`, `report.transcript.json` and `report.runtime.json` beside `report.json`; read them by the paths the report gives.
- **An OpenCode run that fails after its prompt was admitted keeps the answer text it already received (E119).** A transport error mid-turn published the report with `answer`, `answerJson` and `answerPath` null although the driver held the reply; the failure now reports that text as a cut run already did, still `partial: true`, with its failing exit and no receipt. Nothing is fetched or guessed for it.
- **The README names every skill the plugin ships (E94).** The opening that counted two skills went in #46, but the install paragraph still left out `entrust:opencode` and its `entrust:opencode-agent` wrapper; it now lists them, and "all seven skills" matches `plugin/skills/` with the experiment skill gone.

### Changed

- **prepare-feedback is a tool for reflecting on a skill (E130, E129, the rest of E124).** On request it reads one session or several where entrust or terse loaded, under the user's question or, without one, "where did the skill fail or limit the work, what worked, what would improve it", and returns findings with transcript addresses, evidence levels and a refuter's verdict, what worked, and proposals for the skill, in the answer. The page is 46 lines where it was 99 lines of up to 1,900 characters each. Gone: the five focuses and their layouts (`references/focuses.md`), extraction swarms with their pilot, stress test, judge and two analyses, the numbered drafts with a publication reviewer, the research run committed on a worktree branch of this repository, and the script's `parts`, `add`, `coverage`, `tokens` and `export` (and `PARTS_EST=` from `corpus`); `corpus`, `timeline`, `process` and `quotes` stay. The page names no Claude Code tool: it reads orchestrate as the host adapter reads an explicit-only skill.
- **State lives in the temporary directory (E126).** With no `ENTRUST_STATE_DIR`, the driver, the launcher, the OpenCode driver, the paste stager, the cleanup and prepare-feedback keep their state in `<tmp>/entrust-state`, beside the scratch tree under `<tmp>/entrust` and outside it, since every agent's grant lies there; it is made 0700 and refused when it is someone else's or a link, through the same chain the scratch tree uses. `CLAUDE_PLUGIN_DATA` is read nowhere, the recipes forward nothing, and the rule that the coordinator must never write under the protected data directory is gone with it. What the state holds now goes when the system clears its temporary directory: the isolated Codex home is rebuilt on the next run, while saved answers, preserved worktrees' ledger entries and old reports for `RESUME:` do not come back. An earlier version's data directory, `~/.claude/plugins/data/entrust-nowely/`, is no longer read; the cleanup lists it and leaves it to you. The cleanup and swarm pages take `<skill-dir>` in their commands, as orchestrate's do (most of E124).
- **A scout gathers what the planner needs (E133).** The area scout, which wrote nothing and returned ranked findings, is now the scout: it collects the information available for the task (the files, documents, configurations and sources the task names or implies, earlier results when the task builds on them) into a folder the coordinator names, and returns its path, an index ranked for the planner's question and what it could not reach. The page dry run, the recognition reader and the retrospective analyst, which only this repository's research and feedback runs used, moved to `research/roles.md`; orchestrate offers 24 roles.
- **The proxy is orchestrate's, and one agent relays every external run (E125).** The main proxy mode (an external model as coordinator, the host executing its agent orders), the operational proxy that accompanies one external session, their schema `main-proxy.schema.json` and the order reader `agent-orders.mjs` moved from the OpenCode adapter to orchestrate; the adapter is the coordinator's transport, and the reader accepts a Codex report's `threadId` as the session. The JSON-schema subset both use is `orchestrate/scripts/json-schema.mjs`. **Breaking:** the relays `entrust:codex-agent` and `entrust:opencode-agent` are one agent, `entrust:proxy`; a Workflow script or saved prompt naming either old type must name `entrust:proxy`. The relay's steps stay in its message as well as its file, as measured.
- The page suites (advisor, orchestrate, agent-contract, experiment and swarm) no longer pin the pages sentence by sentence. They keep what a coordinator or a tool reads off a page: frontmatter, page budgets, the skill a page loads, command lines, the field table against the driver, placeholders, schema lines and links. The two advisor checks that could not fail went with the advisor's sentence pins (E118).

### Compatibility

- **Breaking:** the `/entrust:experiment` skill is gone; its method and protocols stay in the repository's research.
- **Breaking:** the relays `entrust:codex-agent` and `entrust:opencode-agent` are one agent, `entrust:proxy`. A Workflow
  script or saved prompt naming an old type must name `entrust:proxy`.
- **Breaking:** state is in `<tmp>/entrust-state`, or `ENTRUST_STATE_DIR`, an absolute path. Reports, saved answers, the
  worktree ledger and write locks that 0.25.x kept in `~/.claude/plugins/data/entrust-nowely/` are not read: finish or
  clean up a 0.25.x run before updating, and a `RESUME:` of one does not find it. `/entrust:cleanup` lists the old
  directory and removes it only when picked.
- Moved paths: the five-field schema is `skills/orchestrate/schemas/five-fields.schema.json` (was under `codex/`), the
  main-proxy schema and `agent-orders.mjs` are orchestrate's (were OpenCode's), the cleanup script is
  `skills/cleanup/scripts/cleanup.mjs`, and `orchestrate/adapters.json` is replaced by each adapter's
  `skills/<id>/adapter.json`. The launcher is `skills/orchestrate/scripts/agent-run.mjs`; the codex and opencode
  `scripts/agent-run.mjs` still take every mode. `swarm.mjs` needs `--adapter <id>`. prepare-feedback's `parts`, `add`,
  `coverage`, `tokens` and `export` commands are gone.

### Validation

- PR #66 passed all four CI jobs on Node 24: the skill pages, the entrust suites on Ubuntu and on macOS, and terse.
- Locally, in a Linux container running as root on Node 22: every entrust suite but protocol, lock and cli is green;
  their 10 failing cases (process-group sweeps and permission refusals) fail the same way on the tree before this
  release and pass in CI. `scripts/skills.test.mjs` passes 8 of 8 and terse's pages 12 of 12.
- Not run: the live fidelity gate, the live orchestrate gate and the cross-plugin terse brief, which this release's
  skill pages, agent file and launcher call for; the preparing machine has no Codex CLI. The launcher split is
  covered by the fake app server and the fake OpenCode server only.

### Known issues

- Open ledger entries remain E67, E90, E96, E100, E102–E104, E110, E111, E113–E115 and E117; see [`ISSUES.md`](ISSUES.md).

### Release environment

- Release preparation used Node.js `v22.22.0` and Claude Code `2.1.294`, with no Codex CLI. The CLI protocol pin,
  `0.159.3`, is unchanged.

## 0.25.1 — 2026-10-06

### Changed

- Orchestration can collect read-only status from registered adapters before composing a plan, without loading every adapter skill. `--skip codex` excludes the external Codex adapter when the active host already supplies its native route. Planning remains in the active host.
- OpenCode status now inspects at most two saved recent model references and an already-configured endpoint. It does not start a local server or request a model catalogue; cached references retain unknown availability until the launch path validates the exact model.
- Adapter-specific model selection guidance has one owner in each adapter skill. Unavailable recent-model data is distinguished from an empty saved list.

### Validation

- The implementation in PR #58 passed all eight CI jobs: skill checks on Node 22/24, the full suite matrix on Linux/macOS with Node 22/24, and terse checks on Node 22/24.
- Release metadata must pass the release PR's CI before publication. The version and annotated tag are checked against the published tree.
- Opt-in live fidelity, orchestration and cross-plugin sessions were skipped for this accelerated release. No new model sessions or live routing reliability claims are included.

### Known issues

- Open ledger entries remain E67, E90–E91, E94–E96, E100–E104, E108, E110–E115 and E117–E120; see [`ISSUES.md`](ISSUES.md).
- Passive status is a bounded planning observation, not a complete model inventory or proof that a model can run. Native model inventory still comes from the active host. Advisor continuation reliability remains unverified.

### Release environment

- Release preparation used Node.js `v24.11.0`, Codex CLI `0.159.3` and Claude Code `2.1.280`. The CLI protocol pin is unchanged.

## 0.25.0 — 2026-10-06

### Changed

- OpenCode workers on Codex use one native Luna medium proxy per external session. Continuations reuse that native thread; callbacks remain intermediate while the attached watcher waits. Tasks and full replies are forwarded without summaries, and existing authorization governs callback decisions.
- “Прокси на GLM” selects the external model as coordinator. It plans, gives concrete agent orders and interprets full results; the host resolves native/adapter invocations and owns lifecycle. The order protocol supports delegation, continuation, collection and Stop. It exposes worker capabilities and existing authority rather than arbitrary host tools or JavaScript. This instruction-driven mode does not switch the host model automatically.
- The OpenCode output validator enforces `oneOf`, so the main proxy envelope accepts either agent requests or a complete final answer. Invalid envelopes use the driver's existing corrective turn.
- An explicit advisor request now authorizes its consultation without another approval. Advice remains separate from implementation authority.
- Orchestration plans now recommend balanced, speed or quality model profiles, keep model roles in one team row, and omit default effort and cost estimates from approval cards.
- The standing advisor now covers every material decision within one approved scope without a preset question count; approval cards show the selected route and model without unused resource inventory or transport details.
- Codex model selection follows the approved plan, preserves the current coordinator, and requires approval for unavailable-model fallbacks.

### Fixed

- The OpenCode answer artifact now keeps the full latest reply, including a failed correction or a partial answer received after an earlier completed step.

### Validation

- Targeted offline checks: OpenCode 77/77, launcher 53/53, advisor 8/8, orchestration 12/12, gates 24/24, fragments 4/4, skill pages 8/8; package 13 passed with the release-tag check skipped before publication.
- A native Luna medium emulation used GLM through one external session, two native reviewers and existing-worker continuations. Earlier manual copying changed technical escaping; after switching native returns to canonical artifacts, two substantive turns forwarded 15,140 and 11,276 bytes with decoded equality, matching source identifiers and preserved previous files. Root resolved one automatic-review rejection through verified offline RESUME preparation. This is bounded transport evidence, not an uninterrupted autonomous pass or a primary-host model switch.

### Known issues

- Open ledger entries: E67, E90–E91, E94–E96, E100–E104, E108, E110–E115 and E117–E120; evidence and details are in [`ISSUES.md`](ISSUES.md). E118 is a pre-existing text-check weakness; E119 loses a partial answer on admitted transport failure; E120 overwrites sidecar artifacts when reports share a directory. The producer defects are recorded for separate fixes.
- The broad live orchestration, routing and cross-plugin gates have not run. Main-mode Stop, interrupted-operation recovery and arbitrary-task reliability remain unverified. GLM's final text contained a native-name typo; recorded host bindings and forwarded identifiers matched their sources, and the model's answer was preserved without correction.

### Release environment

- Targeted offline checks used Node.js `v24.11.0`, with available Codex CLI `0.159.3` and Claude Code `2.1.280`. No CLI protocol-pin change is included.

## 0.24.2 — 2026-10-05

### Changed

- The advisor now checks the host's available resources, proposes its route and model roster for approval, and waits for approval before launch. The accepted plan names consultation points and turns; every listed turn is used, routine choices stay inline, and advisor prompts omit the coordinator's provisional answer.

### Known issues

- Open ledger entries at release: E67, E90–E91, E94–E96, E100–E104, E108, E110–E115 and E117; evidence and details are in [`ISSUES.md`](ISSUES.md).

### Release environment

- Offline checks used Node.js `v24.11.0`; the available Codex CLI was `0.159.3` and Claude Code was `2.1.280`.

## 0.24.1 — 2026-10-03

### Changed

- OpenCode runs now start and stop a private loopback server from the installed CLI by default, using the user's existing configuration and credentials. Remote servers remain an explicit option; local agents need no endpoint setup.
- OpenCode workers launched through the shared agent launcher save the local-server mode and can continue a session across a fresh ephemeral server URL. Package and marketplace descriptions now describe the default accurately.
- Requests to use named models outside Codex and Claude now route to OpenCode without requiring its name; each requested model family must resolve to an exact available ID before launch.

### Known issues

- Open ledger entries at release: E67, E90–E91, E94–E96, E100–E104, E108, E110–E115 and E117; evidence and details are in [`ISSUES.md`](ISSUES.md).

### Release environment

- Offline checks used Node.js `v24.11.0` and the schema generated by `codex-cli 0.159.3`.

## 0.24.0 — 2026-10-02

### Added

- `/entrust:opencode` adds an external worker adapter backed by one existing OpenCode server, with an independent session per worker. It supports recent-model selection, continuation, question and permission callbacks, Stop, attributable reports, and explicit native V2; orchestration and swarm can select it while Codex stays the default. Active V2 steer has no atomic generation fence, so a provider-turn transition can race delivery. See [the OpenCode skill](plugin/skills/opencode/SKILL.md) and its [measured API limits](plugin/skills/opencode/references/parity.md).

### Known issues

- Open ledger entries at release: E67, E90–E91, E94–E96, E100–E104, E108, E110–E115 and E117; evidence and details are in [`ISSUES.md`](ISSUES.md).

### Changed

- The Codex app-server driver's protocol pin advances to `0.159.3`; the offline conformance fixtures validate against the schema generated by that CLI version.

- Temporary artifacts are grouped by project and run under
  `<temp>/entrust/<project>/<run>/{agents,checks,swarm,evals}/`; cleanup snapshots use
  `<temp>/entrust/.cleanup/`. Project folders use only the directory name, without a path hash
  or truncation. An inherited context keeps child operations in the initiating run,
  and each agent retains an exclusive TMPDIR with child checks beneath it. Cleanup selects leaves,
  preserves active or uncertain owners and snapshots, and continues to recognize legacy scratch paths.
  Agent scratch is fresh per invocation, including repeat deliveries; publication still refuses overwrites.
  New agent scratch is selected separately from state reports. Standalone native orchestration remains supported.
- `orchestrate` now uses native delegation without requiring the external `codex` adapter.
  Its coordinator remains a role, models and capacity follow the host, and the existing adapter
  owns Claude-to-Codex transport, registration, state, approvals and external results.
- Codex keeps `orchestrate` explicit-only through skill policy metadata. The common draft linter
  no longer imports the external driver. The existing marketplace is documented for both hosts.

- **prepare-feedback's list of its script's commands moves to `skills/prepare-feedback/references/commands.md`**,
  which the page links in a line naming the nine commands. Why: `evals/skills.test.mjs` counts 20,602 characters in
  what Claude Code re-attaches of the page after a compaction, past the 20,001 it keeps whole, so the page's last
  lines would have been cut; it now counts 17,930.
- **`codex/SKILL.md` fits in what Claude Code re-attaches after a compaction**: `evals/skills.test.mjs` counts
  19,867 characters against the 20,001 it keeps whole, where the page counted 28,393 and was cut at line 262 of 358
  (E77, now fixed on both pages). What the coordinator does at every launch and completion stays on the
  page; what it does on an event stands as one line at the event's place with its procedure behind a link: the
  approval steps — the waiting result, the accept's heredoc, a blocked accept, what an accept runs as, the
  `approvals=` count and exit 6 after a run — in the new `references/approvals.md`; stopping an agent and a
  preserved worktree in the `environment-and-internals.md` sections that own the signal contract and the worktree
  ledger, the latter now naming every case that preserves a tree, what a harvest leaves out (a file under an ignored
  path, deleted with the tree) and the `worktreeRemoveCommand` a report written after the turn carries. The
  launcher's `--help` now defines `EXIT=`, which only the page had. The Worktree lifecycle section is gone: its
  launch-time facts are one paragraph under Rights, and the rest the driver's `--help` and the internals reference
  already said. Traps dissolve into the sections they belong to or the references that already said them, the Header
  fields rows stop restating the flags' `--help`, and the reference list drops five deep anchors the files' own
  contents lists carry. Sections now follow launch order: rights and fields, the body, the call, the result. Why:
  after the first compaction a long session had lost the prompt shape, what the user reads, the traps and the
  reference list.
- **The codex page's stop instruction names the pid on the driver's pid line, `entrust: pid=<n> …`**, where it
  said "the first line of `<DIR>/err.txt`", which is that line and not a bare number: `kill -TERM $(head -1 …)`
  failed on it (E105, now fixed on both pages). The line is one record the launcher and
  the cleanup script parse whole, so the page changes and the driver does not.
- **The orchestrate page keeps its standing rules and its five steps, and what a coordinator does at one moment of a
  run moves into four references named by that moment**: `references/plan.md`, read at step 1 beside the composition
  page, holds the composition, the card, the estimates and the stop line, the environment check, a worktree agent's
  fitness, the bulk row's unit, count and pilot, the effort rows and a Workflow's facts; `results.md` holds `DONE=`,
  the next report path, the Result table, the harvest and the repair of colliding writers; `approvals.md` the waiting
  request, the approval rule and its synthesis; `answer.md` the checks before the answer goes out, the options analysis and the completeness
  critic. The sentence on the page where each moment comes links its file. What another file already said leaves the
  page for that file: the brief and return of the split critic, the refuter, the cross-reviewer and the judge for
  `roles.md`, whose rows gain the three clauses they lacked; the Result table's restatements of the codex page's
  "Reading the result", which the table now links and adds to; the `--pending` markers for the launcher's `--help`;
  the Workflow signatures for the `workflow-authoring` skill; and the inline five-field schema for the shipped file,
  which the page names by path. The maintainer's clause on where driver changes are logged goes. Why:
  `evals/skills.test.mjs` counted 36,075 characters in what Claude Code re-attaches of the page after a compaction,
  past the 20,001 it keeps whole, so a long session lost the approvals, verification, the Result table and the
  agent's return at its first compaction; it now counts 19,556 (E77, now fixed on both pages).
- **Orchestrate's stop, liveness and process-parent instructions name the pid on the driver's pid line, `entrust:
  pid=<n> identity=… reportPath=…`**, where they said "the first line of `<DIR>/err.txt`", which is that whole line and
  not a bare number, so `kill -TERM $(head -1 …)` failed on it (E105, now fixed on both pages).

### Release environment

- Offline checks used Node.js `v24.11.0` and the schema generated by `codex-cli 0.159.3`.

## 0.23.0 — 2026-09-30

### Added

- `/entrust:prepare-feedback` turns the sessions where entrust or terse loaded into a report on the plugin under one
  focus (a release, one run, where its time and tokens went, the user's feedback on a topic, all of these at once, or
  a question in their own words), handed back as an issue title and body, or as a research run inside a checkout of
  this repository, because the reports behind #1, #15, #16, #20 and #22 were each assembled by hand and #21 asked for
  them as one repeatable run; the design is in `plugins/entrust/research/2026-09-29-prepare-feedback/`. The `process`
  focus reports where the runs' time and tokens went and whether each role earned its place, and `all` runs every
  focus over one corpus into one report with a section per focus, because #15 found the coordinator's own context at
  51% of the tokens, #16 asked which roles were useful, #22 kept its costs as comparables for later estimates, and
  the owner asked for every focus in one run and one report.
- Every prepare-feedback report keeps the facts `timeline` extracts from the transcript, the owner's messages with the
  queued ones, the pages read before each draft and what each agent read itself, apart from the writing model's own
  account, which it marks a hypothesis, and each reader's brief names its task's slice of the timeline, because in a
  field report on terse's clarity skill (2026-09-29) those facts changed the conclusions while the model's own account
  held neither and contradicted itself three times.
- `evals/prepare-feedback.test.mjs` checks the skill's script on synthetic transcripts and reports; `package.test.mjs`
  includes `skills/prepare-feedback/scripts` in the payload check, because the list there is written by hand and a new
  scripts directory would otherwise go unchecked.
- `prepare-feedback.mjs corpus` records per task the calls, the time split by what ends each pause (the run working,
  waiting for the person, gaps over ten minutes), the tool uses, the repeated commands and the largest outputs, and
  per Codex run the report's model, effort, tokens, timing and command counts, and `process --run <run>` sums them
  into `measures/process.json` with MCP tool names and non-built-in agent types folded, because the `process` focus
  asks where a run's time and tokens went and no page or script counted it before.
- **The codex page sees which Codex models the account can run before a plan is made.** The page runs
  `scripts/status.mjs` as it loads, through Claude Code's `` !`…` `` substitution, and it prints whether codex
  is installed, whether an account is signed in, and the models the account lists under Astra, Sol, Terra and
  Luna with their efforts. The orchestrate page, which plans before it loads the codex page, composes again by
  that status once it does, before the plan is registered or shown. A sixth composition rule reads it: a
  model the account does not list is taken by the nearest listed one below it, and the plan says in one
  clause who stands in for whom; with Codex not installed or not signed in the plan has no Codex agents and
  says so in its first line; a status that could not be read makes the plan say Codex was not checked.
  Otherwise the plan says nothing about Codex's state. A model standing in for Astra, the advisor included,
  carries `EFFORT: xhigh`, where Astra inherits the configured effort. The page's frontmatter pre-approves
  that one command, without which Manual mode cancels the page (measured 2026-09-29, with Manual and auto
  mode loading it with the grant); `dontAsk` mode does not count that grant and cancels the page, which E103
  records. Why: on 2026-09-29 an account on the free plan listed Luna and Terra and no Astra or Sol, the
  pages named Astra for every top-row role, and its user had to say which models were available in every
  session. The script asks for the account before the catalogue, because a signed-out server still lists
  Astra and Sol.

### Changed

- `skills/orchestrate/references/roles.md` has a page dry run row: an agent walks one scenario through a plugin's pages
  without running anything and counts the words, calls, agents and user stops before the first action, as the two dry
  runs of #15 did; prepare-feedback calls it for a `version` report.
- The plugin README names the seventh skill in its overview, install list, layout, table of canonical homes and the
  list of what cleanup leaves, and `plugin.json` and the marketplace entry add it to the description they share, so
  that every place a user learns what the plugin ships from names it.
- **An orchestrate plan may propose a swarm for a bulk batch, of verdict units or of extraction parts with a fixed
  answer schema.** The card names it with its count and cost, the user's "go" on the plan starts it, and the
  coordinator reads the swarm page by path and launches it with the data directory forwarded, each swarm in a run
  directory of its own; `/entrust:swarm` still starts one directly. The swarm page takes an extraction part as a unit
  and says how it starts under a plan, `references/roles.md` has a swarm row in the bulk tier that writes nothing, and
  prepare-feedback runs its extraction batches this way instead of overriding orchestrate. Why: the owner made the
  swarm a role the planner may propose, and the writing replication and issue #22 ran their bulk batches by batch
  launch, with no wrapper per agent. This lifts two of E90's limits, that only the user starts a swarm and that an
  extraction batch has no batch route; the others stay: fifty units per swarm, no tokens in its summary, agent ids the
  plan's registration refuses, and the README's place for it among the experiments.
- **A headless session runs the swarm in the foreground.** The swarm page said to run the script as a background
  task and wait for its notification; a headless session ends its background tasks with the turn, and on 2026-09-29 a
  headless orchestrate run that launched a plan's swarm that way ended its turn and cut all three Luna agents, each
  interrupted with no answer.
- **The coordinator asks the advisor for the premises its recommendation rests on.** The advisor page now has
  the coordinator ask it to list in `evidence` the premises it relied on, those in the coordinator's own message
  included, each marked checked at a source or taken as given, and count its agreement as independent only on
  the checked ones. Why: in a terse field report on 2026-09-29, an advisor asked whether a list was complete
  refuted the premise its question pointed at, then kept another item in a wrong group its context had set,
  though it had opened the file that showed where the item lives.
- **A check runs when its result can change what happens next.** The orchestrate page let a writer "run the suite" and
  gave the verdict to an agent that did not write the code; a writer now runs the checks that read the files it
  changed, the deciding run is those checks once on the tree that goes out, and a brief names them. Why: on 2026-09-29
  the full suite, about six minutes, ran seven times after page, ledger and rebase changes that five suites of a few
  seconds read.
- **The completeness critic writes its fixes into a copy of the draft.** It returned only what was missing, and the
  orchestrator rewrote each fix in its own words; now the critic returns the copy's path and one diff hunk per gap
  citing its source, the orchestrator takes the copy, whole or without the hunks it objects to, the first draft is
  frozen after the last decision and return, and a later read covers the changed lines, the lines stating the same
  facts and what they contradict. Why: in the issue #22 run two critics read the draft four and five times, and every
  read after the first found errors the orchestrator's own rewording or a block added after the first read had put
  there; the read that closed the last loop applied the critic's wording verbatim.
- **The completeness critic reads an answer or publication three times at most.** The critic's bullet called two
  reads repeating the same gap a stall and said nothing of what it does; now the reads are counted across the drafts,
  and after the third, or after two that repeat a gap, the answer or publication goes out with its remaining gaps
  named as open, with no further read and none of the fix rounds' escalation or new plan. Why: in the first live run
  of prepare-feedback on 2026-09-29, the five completeness reads of a report on one eight-minute session found 9, 3,
  2, 1 and 0 gaps; in the second to fourth reads one gap each was a line about the review itself, the fourth's only
  gap, and the report and its README took eight reads, an hour and 43 minutes from the first review read to the
  commit.
- **The bulk row's extraction, classification and verification run at `EFFORT: high`; `low` is for mechanical work
  only.** The orchestrate page's effort bullet and the swarm page's Luna brief said `low` for the whole bulk row; the
  strong and cheap rows keep `medium` for review, refutation and judgement. Why: in the pilot reported in issue #22,
  Luna on a classification task marked 11 false positives in 22 at `low` against 1 in 13 at `medium` (Fisher, p =
  0.013), with recall 11 and 12 of 15 and 3.48M against 3.63M tokens; in the writing replication's pilot
  (`plugins/terse/research/2026-09-26-writing-replication/measures/pilot-decision.md`) `high` and `medium` both found
  21 of 21, with 1 extra in 31 against 4 in 34 (p = 0.36) at median tokens per run of 129,873 and 128,657. `high` over
  `medium` is the owner's choice, not a significant result; neither pilot ran `low` on a verification unit.
- **The orchestrate page's bulk unit is either one part of the material for extraction, with a fixed answer schema, or
  the closed-set verdict it was.** The effort line names extraction, and the unit said only the verdict. Why: the bulk
  work of issue #22's run and of the writing replication was extraction, one part of the material per agent (in the
  replication, a part and one angle) with a shared answer schema.
- **Experiment protocols E1 and E2 run their Luna arms at `high` and E2's Terra arm at `medium`.** They said `low`,
  which the bulk row's verification no longer is, and E2's Terra arm, a closed-set judgement, already disagreed with
  the cheap row's `medium` for judgement. Why: an arm at an effort no coordinator uses measures a configuration whose
  result does not transfer.
- **Every bulk fan-out, a swarm included, is piloted first.** A stronger model marks a few units, the bulk model runs
  the same units, and recall, false positives and tokens against that marking decide the brief's fixes and its effort.
  The swarm page's plan names the pilot's units, and its "go" covers the pilot and then the swarm. The orchestrate
  page carries the rule beside the bulk unit in Model tiers, not in Verification, which lies past what a compaction
  keeps (E77). Why: issue #22's pilot chose the effort and exposed a brief that counted process complaints; the
  replication's first pilot, on the brief as first assembled, found 12 extras in 22 and the brief gained four
  exclusions (`plugins/terse/research/2026-09-26-writing-replication/measures/pilot-protocol.md`). Both runs had
  critiqued the split before the pilot, and that critique reads the decomposition, not the subject.
- **The plan estimates the bulk row per unit and again after the pilot, and states a per-agent stop line.** The
  estimate is a comparable unit's tokens times the units, plus the pilot and a margin for re-runs; the stop line is
  three times the pilot's median tokens per agent, and an agent whose report's `tokenUsage` total passes it stops
  further launches until the user has seen a new estimate. It fires only when an agent ends, so it stops the
  launches after it, not the agent; it is a plan line, and no driver or swarm option, because 0.8.0 removed the
  token budget on purpose. Why: the bulk row of issue #22 was planned at 25–30M tokens and spent 38.7M, pilots and
  re-runs included, and one agent spent 2.09M on a chunked read; the replication forecast its collection per part
  with a 1.15 relaunch margin at 57.1M and spent about 53.8M (`measures/pilot-decision.md`, `measures/tokens.md`), and
  3 of its 356 collection runs passed its stop line at three times the pilot median. The issue's second trigger, a
  forecast at twice the plan, is left out: it fired in neither run.
- **The orchestrate page names the swarm as the batch route for verdict units.** A batch of verdict units runs as a
  swarm, which only the user starts, with `/entrust:swarm`: one script launches its agents under a concurrency cap,
  and one Stop ends the batch. A batch of extraction units runs as ordinary Codex agents, because the swarm's unit is
  the closed-set verdict alone. Why: the 456 Luna runs of issue #22 and the replication's collection
  (`plugins/terse/research/2026-09-26-writing-replication/tools/batch.py`) both launched their batches by hand,
  launch-only and with no wrapper, and the page named no route; the issue counts about 13k tokens per wrapper. The
  swarm's limits, recorded as E90, are not changed here.
- **Every output path a `TASK:` names lies under the agent's writable roots.** The codex page's Rights section says
  so, and its generated copy, `skills/orchestrate/references/codex-composition.md`, follows; the orchestrate check
  that opens one assembled brief checks its output paths against those roots beside its input paths. Why: in issue
  #22 a write agent's brief put its output one level above its `RIGHTS: write` root, the write was refused and the
  run exited 6; since 0.22.0 no approval grants a root mid-run, so the brief is where the path is caught.
- **The completeness critic's manifest also carries the run's ledger and the runner's log behind each number the
  draft states.** Both already sit under `$TMPDIR`, so nothing new is written in the run directory, and the draft
  keeps citing a check by its label. Why: in issue #22 a publication reviewer could not verify a number that existed
  only in the coordinator's command output; since 0.21.0 the runner keeps that output in a log, and the manifest did
  not name it.
- **The orchestrate Verification list gains a bullet.** A recommendation to the user now rests on an analysis of its
  options — the problem, its cost, two or more options with closing among them, each judged by minimalism, no
  crutches and clean architecture, an outside critic, and a top-row judge where they disagree; an item without one
  goes to the user as a question. Why: the repository's design principles asked for this analysis, and the
  coordinator's own recommendations had gone out without one.
- **An option in that analysis now names what it removes or moves and who relies on it** — users, coordinators,
  tools, tests, leftover state — and what stays and how a user finds it is made to happen or `unknown`; the roles
  reference gains a final-reviewer row that reads the whole change's consequences first. Why: on this run an E92 fix
  passed the judge, who overruled the critic's objection, and every review, and moved every Codex agent's scratch to where `/entrust:cleanup` never looked; no
  stage had asked what the change removed or who relied on it.

### Fixed

- **The coordinator asks the advisor for the shape of its `result`** (E98). Why: the page described the shape, a
  recommendation with its reasons, one alternative and what would change the advisor's mind, in a sentence the
  advisor never receives; its prompt block and the driver's rules do not name it.
- **The protocol suite's `approval-wait` case accepts any whole non-negative `waitMs` for a request declined at once**
  (E76). It required 0, and two clock reads with no wait between them can straddle a millisecond tick: this Mac
  recorded 1 on 2026-09-29, as a macOS CI runner had. `offered: false`, `by: driver` and `why: no channel` already
  show that no wait ran.
- **The launcher runs when invoked through a symbolic link** (a `$TMPDIR` path on macOS, a linked checkout), by
  resolving both sides of its own-module check to their real paths (E56). It used to compare the path as typed
  against the module's real path, so a symlinked invocation looked like a foreign import, and the launcher printed
  nothing and exited 0.
- **The wrapper runs its command again only when the result ends in `RUNNING=` or is the harness's notice that the
  command moved to the background; any other result, an empty one included, is handed back at once** (E57). It used
  to rerun any result without a `REPORT=` line, without bound — 64 reruns in one incident. The codex page's
  waiting-result paragraph says the same. Not measured live.
- **The generated `orchestrate/references/codex-composition.md` no longer tells its reader to run
  `evals/fragments.mjs`**, which an installed plugin does not carry (E58).
- **The live gate reads the corrected split from the split critic's `artifacts` and counts the shared file's owners
  from the agents seen writing it**; its free-text split and ownership readers are gone (E59) — 14 false problems on
  a correct case 7, now 0.
- **The live gate's attribution check ends an agent's stretch at the end of its line**, so a list whose items end in
  "(Model id)" no longer credits it with the next item's path (E60).
- **`lint-draft.mjs` no longer reports a success word in a clause opening with once, when, whenever, if, until,
  unless or before as an unsupported claim**; `after` and a bare claim still count (E61).
- **The live gate's plan record drops the tokens column**, which no check read and which turned `unknown` into NaN
  (E62).
- **Behaviour change: `agent-run.mjs --plan` accepts any non-empty role** and prints `PLAN=` (or `AMENDED=`) and one
  `AGENT=` line per row, without `WORKERS=` and `CHECKING=`; an empty role is still refused, `missing role for <id>`,
  exit 2; it used to refuse 12 of the 22 roles in `roles.md` (E89). The live gate no longer compares the card's
  counts with the launcher's; the orchestrate card is built from the rows.
- **Behaviour change: an approval request for a command reports the cause `asked` in place of `sandbox` and
  `policy`**, in the report's `escalations`, the request file, `CAUSE=` and the pages (E65). The driver could not
  tell the two apart reliably, since a sandboxed attempt can leave no trace, and both called for the same advice.
- **The driver's comment and help and the codex page say what stopping an agent was measured to do**: a command
  running inside the sandbox ends with the agent (measured once, 2026-09-29); a command run after an approval,
  outside the sandbox, is still unmeasured, so the `pgrep` check before a second writer stays (E67, narrowed to
  that unmeasured case and stays open).
- **Behaviour change: a driver handed a mailbox that already has an `owner.json` exits 2 whether its owner is
  running or has ended**; the takeover of a dead owner's mailbox is gone, since the launcher gives every launch a
  mailbox of its own (E68).
- **Behaviour change: every Codex run gets its own `$TMPDIR`, created fresh at 0700 inside the system temporary directory** —
  `os.tmpdir()` (the caller's `TMPDIR`, `TMP` or `TEMP`, else the OS default) — and named after the run:
  `<tmp>/entrust/<rel>` for a report at `<state>/<rel>/report.json`, else `<tmp>/entrust/runs/<startedAtMs>-<pid>`.
  The agent is granted that directory only, never the caller's whole `TMPDIR`. The report's `tmpDir` names it, it
  outlives the run, and the driver never removes it. A leaf that already exists is refused with exit 2. The driver
  refuses a `<tmp>/entrust` base that is a symbolic link, not a directory, or another user's, with exit 2. The
  driver no longer creates `<state>/tmp`; one left by an earlier version can be deleted by hand or through
  `/entrust:cleanup`. Agents of one coordinator no longer share, and overwrite, one temp directory. (E92)
- **Behaviour change: `/entrust:cleanup` removes a run's or standalone report's temporary folder** (`<tmp>/entrust/<rel>`) together
  with the run, on the same number and under the run's own liveness. It lists and suggests the folders there whose
  run is gone from the state directory or whose report-less run has stopped, and it offers what an earlier driver
  left in `<state>/tmp` once no agent of that version still uses it. Its closing line no longer says nothing is
  left while those folders stand.
- **The EFFORT row and `driver.mjs --help` drop the 2026-09-17 catalogue snapshot**; the value is checked against
  the live catalogue before each turn (E80).
- **A brief that reads files names the read: one command per file with `max_output_tokens` at the tool's cap,
  10,000 today** (E51). Why: left to choose, the model set 1,000, and a Sol read agent saw 19–60 characters of each
  of 95 pages without noticing, while 374 Luna agents briefed this way read all 1,584 pages whole.
- **The orchestrate page says a Claude agent starts with the user's and the project's CLAUDE.md and the memory
  index in its context, whatever its brief says; a Codex agent starts without them** (E53).
- **The README no longer says when the data directory is deleted and points to `/entrust:cleanup`**; it named only
  an uninstall without `--keep-data`, while `claude plugin marketplace remove` deleted the directory (E74).
- **The README says what `permissions.additionalDirectories` does for the data directory: reports read without
  prompts**; a write there by Claude Code's own tools still asks in `default` and `acceptEdits`, since `.claude` is
  a protected path (E75).
- **`codex/SKILL.md` is 1,338 words shorter than on main (5,799 → 4,461) and `orchestrate/SKILL.md` 263 shorter
  (6,240 → 5,977)**: they stop restating the launcher's and the driver's `--help`, and orchestrate stops restating the codex
  page; the escalations fields live only in the internals reference (E77, stays open).
- **The four codex references over 100 lines open with a contents list** (E78).
- **The measurement stories of both pages move to `incidents.md`** (codex's, and a new
  `orchestrate/references/incidents.md`); each line keeps its date or a link (E79).
- **Closed without a code change**, one line naming each and why: E52 (the rollout check already lives in the
  internals reference; the cause was E51), E64 (the schema lists `decline`; the fact is recorded in the driver and
  the fixture), E81 (the vendor line is about checking one's own work; here a fresh agent checks others'), E82 (the
  vendor line is about a blocked Skill call, not reading a file), E83 (the README lists the prerequisites the page
  links to; the driver names a missing `codex`).

## 0.22.0 — 2026-09-28

Contracts that change in this release, each detailed in its entry below. The driver no longer switches on Codex's
permission features or tells the model to ask for a failing tool's files, and `initialize` asks `experimentalApi:
false`. The report loses `sandboxWidened`, `experimentalApi`, `featuresRequested` and `serverWarnings`; an
`escalations` entry loses `permissions`, `granted` and `repeatOf`; `--pending` and the waiting result lose `ACCESS=`,
`NETWORK=`, `REPEAT_OF=`, `FILES=` and `KIND=`. A file change the driver cannot show inside the writable roots, and a
permissions request, are declined at once with cause `outside`, and the run exits 6. `--decide ID --accept` needs the
approved command on stdin and refuses any byte of difference. Measured with codex-cli 0.155.1 and Node 24.11.0.

### Fixed

- The README's update step is one command, `claude plugin update entrust@nowely`. It refreshes the marketplace
  itself: on 2026-09-28 it found terse 0.4.0 with no separate `claude plugin marketplace update nowely`, which the
  README asked for first.

### Changed

- **The coordinator approves a signal to a process its agent started, and a `codex sandbox` check the plan named.**
  The orchestrate page used to send every signal and every nested `codex` to the owner. Now a `kill` whose target
  `ps` shows below the agent's own driver, and a `codex sandbox` run the plan names, which runs one command under
  Codex's sandbox and ends with it, are the coordinator's; a signal to any other process, or one whose parentage
  `ps` cannot show, and a nested Codex agent still go to the owner. Why: of the 37 requests the driver declined on
  this machine before 0.21.0, one `kill` and both nested `codex` runs were of this kind, and the owner's rule sends
  to them only what is destructive or outside the plan.
- **A file change the driver cannot show inside the agent's writable roots is declined at once, never offered.**
  Its `why` is "not shown to lie inside the writable roots; a WRITABLE: line grants a root", and like every
  declined request it makes the run exit 6; the codex page's rights row says so. A permissions request, which the
  driver no longer invites, is declined the same way with the empty profile, `why: "rights are set at launch"`, and
  its cause is `outside`, not `sandbox`. `initialize` asks `experimentalApi: false` again. Why: a yes would grant a
  path mid-run that no settled `WRITABLE:` line granted, and none of the 37 requests declined on this machine
  before 0.21.0 was of this kind.
- **An accept restates the command it approves.** `agent-run.mjs --decide ID --accept` reads the command on stdin
  and compares it with the request's `command` byte for byte, one trailing newline tolerated and nothing else
  normalised; an empty stdin or any difference publishes nothing and prints `REFUSED=ID` with the two lengths and
  the first byte where they differ. `--decline` reads no stdin. The codex and orchestrate pages show the call as a
  quoted heredoc on a delimiter the coordinator builds at that moment from `ACCEPT_`, the printed token and hex of
  its own and checks is no line of the command, never the printed token alone, which reaches it through the
  wrapper; the request ID is quoted and used only in the shape the launcher prints; a request with no command is
  refused, and the pages say to decline it. They say that an accept the permission check or the classifier blocks
  is followed by a decline, or by the owner's word in an interactive session; the codex page's Stop line now says
  an accepted command in a process group of its own is E67, and its Rights section names the two hazards every
  accept carries, as the orchestrate page does, now in words that name no tool. Contract: `--decide ID --accept`
  with no command on stdin is refused. Why: the auto-mode classifier judged the accept and saw only an id, and a
  fixed delimiter would let a line of the agent's command end the heredoc and run the rest in the coordinator's
  shell, which both verifications of the design made happen.

### Removed

- **The widening.** The driver no longer asks `codex features list`, no longer switches on Codex's
  `request_permissions_tool` and `exec_permission_approvals` features, and no longer tells the model to ask for the
  state or cache files a failing tool names; the orchestrate page no longer approves such a write, and its
  synthesis for cause `sandbox` says the tool needed the user's own environment. Contracts: the report loses
  `sandboxWidened`, `experimentalApi`, `featuresRequested` and `serverWarnings`, an `escalations` entry loses
  `permissions`, `granted` and `repeatOf`, and `--pending` and the waiting result lose `ACCESS=`, `NETWORK=`,
  `REPEAT_OF=`, `FILES=` and `KIND=`. Why: a request names the path a tool failed on first, not its whole state, so
  grants made one at a time left a VCS client with an object store able to write part of its cache, and it deleted
  its own index (E77, now closed); through the plain escape the same commands ran as in the terminal and deleted
  nothing (`research/2026-09-28-command-gate/06-vcs-escape.md`).

## 0.21.0 — 2026-09-28

Contracts that change in this release, each detailed in its entry below. The lock's on-disk shape is a symlink to
an owner file, and a driver from before this release that meets it exits 2. Exit 6 now means an approval request
was declined or expired, never one accepted; `escalations` entries carry the request whole with its decision,
cause and outcome, and `detail` is no longer clipped. The launcher's `--run` prints one of three results and the
last line of each is `REPORT=`: the waiting one is an approval request handed back to the caller. Every agent the
wrapper runs has an approval mailbox, so `--new` needs the state directory on its command line, and a mailbox
request waits thirty minutes at most. The driver switches on Codex's `request_permissions_tool` and
`exec_permission_approvals` features where the installed codex lists them and sends `experimentalApi: true`. A
writable root at or above `~/.codex` or the state directory is refused, so `--writable ~/.claude` on a plugin
install exits 2 where it used to pass, and a state directory that is `$TMPDIR` or lies under it refuses every run.
Measured with codex-cli 0.155.1 and Node 24.11.0.

### Fixed

- **The experiment page no longer counts its protocols.** `skills/experiment/SKILL.md` said "the four registered
  first are in protocols.md" while the file registered five, and now six with E6; it says "those registered so far".
  Why: a ledger entry of this branch (its E51, which never reached main and left the ledger on this fix), found twice in passing during the 2026-09-27 triage; the count had drifted at every
  registration.

### Added

- **`/entrust:orchestrate` can hand a run to a foreman.** A plan with three workers or more now proposes one
  Opus subagent, the foreman, that briefs and launches the workers, has their work verified, handles their
  failures and hands back one report; the orchestrator keeps the user, the plan, the synthesis and the
  completeness critic. In the timeline each worker then shows as one card inside the foreman's, with its task
  and its report, instead of every call it makes; the agent map still shows every agent. The user's approval
  words travel down verbatim, and an action approved mid-run is run by a fresh worker. The rules are in
  `skills/orchestrate/references/foreman.md`, with a foreman row in `references/roles.md`, and the page lets a
  foreman launch the one Fable agent the cap allows. `evals/orchestrate.test.mjs` pins them (I1–I8, D7
  widened). Why: on 2026-09-26 the owner saw every worker's Bash cards in the timeline and asked for a
  coordinator one level down; a probe on extension 2.1.280 showed a subagent's foreground worker stays out of
  the timeline while a background one comes in whole, and Anthropic's own coordinator prompt inside Claude Code
  2.1.280 supplied the rules on approvals and briefs. The run is in
  `plugins/entrust/research/2026-09-26-coordinator-practices/`.
- `driver.mjs --check-prompt-file <path>`: the run's own header parsing and the web-search policy refusal,
  offline, with no state directory, no lock and no codex: exit 0 and silent, or exit 2 with one stderr line
  `entrust: refused: <reason>`. `agent-run.mjs --new` runs it after writing the prompt: on a pass `PROMPT=`, on
  a refusal `ERROR=<reason>`, no `PROMPT=`, exit 2 and no prompt left to run; a report path that a `--run` has
  already launched in is spent, and `--new` refuses it and names the earlier launch's file. Why: the refusal now comes before an agent is spawned (E1).
- `ENTRUST_POLICY_SEAM`: a second plist read like the device's, which a mode must also pass; it narrows the
  allowed modes and never widens them, so a suite can exercise the policy path on any macOS machine.
- **The coordinator's own checks run through `skills/orchestrate/scripts/capture-check.mjs`, and every brief names
  it.** After scouting, an inline check is one command through the runner answering one yes-or-no or one number in
  at most twenty lines read back, and a second command on the same question goes to an agent. The page prices what
  the coordinator reads inline as its size times the calls left in the session, and the answer shows the runner's
  `--summary` of the run's ledger beside the agents' tokens. Every brief, Claude or Codex, the foreman's included,
  names the runner by its absolute path for any command whose output can pass twenty lines, and the return quotes
  each run's `EXIT=` line; the sentence that redirected a check into a `mktemp` file and read back a 5-line tail is
  gone. The runner runs one command under `bash -o pipefail -c`, writes its whole output to a log under `$TMPDIR`
  (0600) and prints twenty lines at most in all: five receipt lines, `LABEL=`, `LOG=`, `LINES=`, `BYTES=` and
  `EXIT=` last (the command's status or `signal <NAME>`), around a tail of fifteen lines at most (`--lines` takes 1
  to 15), each clipped to 200 characters; its own exit is the command's. With `--ledger <file>` each run's receipt
  is appended as one JSON line, a second command on a label the ledger already holds is refused with `ERROR=` and
  runs nothing, and `--summary` totals what was logged and what was shown, with `LATER_READS=unknown`, since what a
  shown tail costs depends on the calls after it. `--help` is the reference. `evals/capture-check.test.mjs` pins
  it: a 100,000-line flood prints 20 lines, fifteen of them the tail; `--lines 15` and a multi-line command stay at
  twenty; `sh -c 'echo failing; exit 1' | tail -1` reads `EXIT=1` beside a plain `bash -c` control that says 0; a
  signal reads `EXIT=signal SIGTERM` and exit 143; a SIGTERM to the runner still prints the receipt; a 2 MB
  unterminated line prints 200 characters and the bytes cut; the ledger's refusal runs nothing. In
  `evals/orchestrate.test.mjs`, B4 and B8 pin the page's rule and its pricing, B9 runs the page's own command line
  on a 5,000-line flood, a failing pipeline and a repeated question, and I9 pins the runner's path in the foreman's
  brief; the live gate checks that every brief asking for a check names the runner. Measured on 2026-09-27: a 64 MB
  flood took 0.44 s and printed 20 lines, 833 bytes. Why: #15 recorded a grep over 64 MB in T3's coordinator, 23.5
  MB for one key in a T2 subagent and a critic's 31.1 MB grep in T7 (F9), a Playwright run through `tail` that read
  exit 0 while reporting a failed test and a 14-error typecheck shown as exit 0 (F10); "bounded" was never a number
  and inline work was never priced (F15, F21), and #15 asked for this runner by name (P2, P3).
- **A Codex agent names the five-field schema the codex skill ships, and a field past its cap goes to a file.**
  `skills/codex/schemas/five-fields.schema.json` is strict (`status`, `result`, `evidence`, `artifacts` and `open`,
  all required, `additionalProperties: false`) and capped: `result` at 4,800 characters, each `evidence` and `open`
  item at 1,000, each `artifacts` item at 300, and at most 40 `evidence`, 40 `artifacts` and 20 `open` items. The
  codex page's `OUTPUT_SCHEMA:` row names it, and the orchestrate and swarm pages' schema lines are that file, caps
  included. A field past its cap goes whole into a file under the agent's temporary directory, named in
  `artifacts`, and the field keeps a summary with every material finding; a brief that wants a longer return names
  a per-run copy of the file with larger caps. The driver enforces `maxLength` and `maxItems` itself: a size error
  states the observed length and the limit and spends the existing corrective turn, which asks for the complete
  field in a file under `$TMPDIR`, named in `artifacts`; the first answer is kept as `.attempt1.md` and listed in
  `answerAttemptPaths`; on a final overflow `answerJson` and `answer` are clipped to the caps, `schemaOverflow`
  lists each cut, and `answerPath` holds the whole object. The copy sent to the server carries neither keyword:
  Codex 0.155.1 accepted both in two Luna turns and cut a field at its cap (a Luna probe returned exactly 40
  characters against a request for about 400 under `maxLength` 40, 2026-09-27), so a cut would pass the local check
  with nothing kept, and `--help` states that measurement. Pinned by the package case "the shipped five-field
  schema is strict and carries the default size caps", G8 in `evals/orchestrate.test.mjs`, U3 in
  `evals/swarm.test.mjs`, the `five-field-schema` case of `evals/fragments.test.mjs` (both pages' lines against the
  file), five D16 flows in `evals/cli.test.mjs` (no `turn/start` carries the keywords, a large overflow keeps the
  whole answer and clips every inline field, a repaired attempt stays beside the corrected answer, invalid limits
  are refused before a turn, the help) and a D16 case in `evals/agent-run.test.mjs`. Why: #15 F20b: coordinators
  wrote the schema by hand each run and once used the review schema instead; P11a: returns overran "at most 30
  lines", and a limit in prose bounds no structured return.
- **The answer is a draft linted by `skills/orchestrate/scripts/lint-draft.mjs`, and it names every agent that
  ran.** Before the synthesis the coordinator reads every return, Claude or Codex, into the five fields, each claim
  keeping the agent it came from; a return that does not parse is continued once, and after that its result is
  `unknown`. The answer is drafted into a file and linted with every agent that ran (`--agents`) and the runner's
  ledger (`--receipts`) until it exits 0: it names every agent that ran, or names it as dropped, and each success
  claim rests on a receipt or says it is unverified. The linter prints one `LINT=<rule>: <line>: <text>` per hit,
  then `WORDS=`, `SHA256=` (the draft digest, one line of the completeness critic's manifest; the digest the critic
  returns is the manifest's own, another number) and `HITS=`, and exits 1 on any hit. The rules: an absolute
  machine path, a header field name from the driver's own field table or a launcher status key, a pasted five-field
  block, the driver's vocabulary (wrapper, driver, `report.json`, `threadId`, `exit <n>`), a model slug, a harness
  or thread id, more than 400 words, an agent from `--agents` never named or named by its id alone, and a success
  claim that neither contains a receipt's label (`--receipt`, or `--receipts` with a capture-check ledger, where a
  check that failed or was refused supports nothing) nor says it is unverified. The user's quoted lines and the
  words of their own request (`--request`) are not machinery. `--help` lists the rules. `evals/lint-draft.test.mjs`
  pins the shapes #15 recorded as red and their false positives as green; in `evals/orchestrate.test.mjs`, C14 pins
  the page's rule and C15 runs the page's lint command on a clean draft and on three failing ones. The live gate
  checks that the draft is linted before the critic, that every return, the critic's included, is in the five
  fields against its schema (the shipped file, or a per-run copy equal to it apart from its caps, whose caps then
  apply) before the synthesis, that the answer lints clean and names every agent that ran, and that each fact the
  answer credits to an agent is held by that agent's return. Why: the page's sentence against machinery in
  user-facing text dates from 0.20.0, and #15 counted agent ids, report paths, exit mechanics, a RESUME id and a
  3,000-word wall in eight later sessions (F16, P13b); agents that ran went unnamed (F20a), and returns reached the
  synthesis unparsed (F20b).
- **Protocol E6 in `skills/experiment/references/protocols.md`: one strong reader against the full policy.** A
  preregistered, blinded comparison on held-out review tasks: one Sol strong reader, the orchestrate page's full
  policy, and one Opus strong reader as the same-family control, with material frozen before any arm, an
  independent key of material findings, two cross-family judges and a refuter for lost findings; a cheaper arm wins
  only on the preregistered coverage and false-alarm criteria, and a trade of cost against quality is the owner's
  word. The reference now registers six protocols, and the plugin README's layout says so.
  `evals/experiment.test.mjs` F1 holds E1 to E6 with the seven fields each. Why: #16 asks for a prospective pilot
  the recorded overlap simulation cannot replace (Q7b).
- **An approval channel, with no flag of its own.** `agent-run.mjs --new` makes `<DIR>/approvals` beside the
  prompt for every agent it launches, not only ones asked for by a flag, and `--run` always hands the driver
  `--approval-dir` for it; the launch-only form a caller runs itself still gets no mailbox, so a run nobody
  attends (swarm's own launches) is declined at once as before. The keeper `--run` starts is that same form in
  a session of its own, and the orphan step that starts it marks it `--keeper`, set by that step alone, so it
  is the one launch-only run that hands the driver the mailbox. `--new` needs the state directory to check the mailbox's
  containment before the agent's directory even exists — `CLAUDE_PLUGIN_DATA` on the call, or
  `ENTRUST_STATE_DIR` — and refuses without it. `--approval-timeout` is gone with it: the driver's own
  `LIMITS.APPROVAL_TIMEOUT_S` is a constant, 1800 seconds, the owner's figure of thirty minutes — three
  times the coordinator's longest blind spot and short enough that a run nobody attends still delivers its
  report within the hour; the idle guard pauses for as long as any request stays open, so the two clocks
  never compete. Neither flag had a sentence naming who would set it and why the default could not decide,
  and CLAUDE.md now carries the rule that a flag without one goes unbuilt (2026-09-28). A command request, a
  file change the rights do not cover, a permissions request (the model's own `request_permissions` tool) or
  a command approval carrying added paths is offered through the mailbox, from the root thread's own turn or
  a subagent thread the root announced; the driver's own words for what an accept does are now: "An accepted
  command runs with no sandbox, as you; an accepted widening — a request for paths or the network rather
  than to leave the sandbox — runs the command inside the sandbox with the paths added." `--run` hands a
  pending request straight back instead of waiting on it silently: it returns as soon as one is pending,
  printing what `--pending` would for it and ending in `REQUESTS=`, `WAITING=` and `REPORT=`, so the
  wrapper's own hand-back may be that waiting result instead of the nine status lines; the coordinator
  decides with `--decide ID --accept|--decline` and sends the wrapper the very same message block again,
  which `--run` picks up where it left off. The driver runs the launched turn under a detached keeper so a
  hand-back does not end it: a hard kill of the wrapper's task, or a `SIGKILL` of the launcher, no longer
  reaches it, only the forwarded `SIGTERM` does. The keeper's own exit marker still tells the two cases
  apart: on `SIGTERM`, `SIGINT` or `SIGHUP` the driver's own handler catches the signal and exits with its
  own chosen code — 1 once a thread exists, the turn `interrupted` — so the marker holds that code, not the
  signal; only an uncatchable signal (`SIGKILL`, a crash) bypasses the handler and leaves the marker holding
  128 plus the signal number (137 for `SIGKILL`), and a request still open at that moment is left
  `ORPHANED` in the mailbox, read from `--pending` once the marker exists. `--pending` prints every request the same way it always
  did — thread, cause, cwd, reason, the writable roots, the command or the file-change list, between
  markers — and a widening's profile as one `ACCESS=<access> <type>:<value>` line per filesystem entry and
  `NETWORK=on|off|none`; `REPEAT_OF=<id>` names an earlier request you declined that a re-ask for other
  paths follows. `--new` checks that both the report and the agent's directory lie strictly inside the state
  directory, and refuses a mailbox placed under one of the driver's own subtrees there (`tmp/`, `home/`,
  `locks/`, `answers/`, `jobs/`, `worktrees/`, `pasted/`); a mailbox writing itself under `reports/<run>` or
  an orchestrate run directory is fine, since neither is one of those. A request the mailbox itself cannot
  write is settled at once as expired, `why: "mailbox write failed: <error>"`, and an accept reaches the
  server only once that settlement record has landed. The orchestrate page's poll is one background task over
  every alive Codex agent's `exit` and `approvals/pending` markers, and its `ASK=<id>` line arrives as a
  notification beside `DONE=<id>`, because a request that comes after a `RUNNING=` hand-back has no call in
  flight to hand it back. The orchestrate page's `## Approvals` section states
  the owner's rule: approve what is non-destructive and in the plan's direction, prefer a widening to an
  escape when either would do, take the rest to the owner while the turn waits, decline and name it in a
  headless run, approve nothing unread. Why: every request was declined by default, so a plan that needed a
  tool's own state file or a script the agent wrote for its own task failed silently, and the owner's
  principle is that a non-destructive request in the plan's direction should not need a second turn to ask
  for it by hand, without teaching the driver the name of a single tool.
- **The widening runs under two Codex features the driver turns on itself.** `codex features list`, probed
  once per run (bounded 5 seconds, the process group killed if it does not return in time), and where it
  names both `request_permissions_tool` and `exec_permission_approvals` — under development and off by
  default on 0.155.1 — the driver sends `-c features.request_permissions_tool=true` and
  `-c features.exec_permission_approvals=true`, at both levels; without both names the model has no tool to
  ask for a path at all (measured 2026-09-28, Opus P1: three turns with the features off, across three
  standing-instruction variants, each ran the tool into "Operation not permitted" and asked for nothing,
  neither a path nor an escape). `initialize` also asks for `experimentalApi: true`: without it, the paths a
  command approval would add are invisible to the client and the approval cannot be told from a true escape;
  with it, the same shape of approval carries `additionalPermissions` and an accept runs the command inside
  Seatbelt with the paths added, never outside one (measured 2026-09-28). Three checks watch the drift an
  under-development feature carries: the fidelity handshake replays the driver's exact `spawnArgs` and
  asserts the server's own `warning` notification naming the two features; the rollout's head carries the
  availability line while they are on; and the report keeps `featuresRequested`, `serverWarnings` (the
  server's own warnings, twenty at most, kept unsuppressed) and `experimentalApi`. Only where both features
  are actually sent do the standing instructions gain a steering paragraph — the driver's own words: "Only
  with both sent do the standing instructions tell the model to ask for the exact path a failing tool names,
  and to ask to leave the sandbox only when no path would do"; ask for the exact path a failing tool needs
  before asking to run outside the sandbox, and ask to run outside it only when no path would make the
  command succeed — softened from an outright ban after Opus P1 measured that the model still asks for the
  path first under the softer wording and only escapes when no path could fix the failure (2026-09-28).
  Where the run's codex lacks either feature the standing instructions are as they were before this channel,
  and the escape is the only path there is. `--decide --accept` on a permissions
  request copies the request's own `fileSystem` and `network` at `scope: "turn"`, never more than was asked
  and never `session`: the coordinator cannot grant a tool's whole layout, only what it named for itself;
  `sandboxWidened` records one `{itemId, permissions, scope, at}` per grant, `turn` for a permissions request
  and `command` for a command approval that carried added paths. An entry is refused unoffered before any of
  this: `why: "protected root"` for one naming `~/.codex`, the state directory, the home or the filesystem
  root, and, new in this round, `why: "unsupported entry kind"` for one that names a glob pattern or any
  special kind other than a root — the filter reads the request's legacy read/write lists as well as its
  `entries`, so neither shape hides an entry from it. Declining a permissions request is not the
  end of it: the model re-issues the same need as a command approval, and the driver itself declines one
  whose added paths lie wholly inside a permissions request you declined in the same turn (that turn only:
  a later turn's re-ask is offered fresh), naming the
  earlier decision in `why` and `repeatOf`; a re-ask for other paths is offered fresh. Nothing here names a
  tool: a request that cannot be answered by a path stays on the escape it always had, decided on the plan's
  own terms.

### Changed

- **The Codex CLI pin moves to 0.155.1.** `PINNED_CODEX`, the pinned schema directory (`schema-0.155.1/`, the
  twelve files conformance loads; the full 312-file tree is commit `b5c1b81`, which the README's upgrade recipe now
  names) and the fixtures' server version (the fake app-server's default, the cli case and the receipt scenario)
  move together. The 0.155.1 protocol against 0.153.4, in the twelve files the driver's conformance loads, only
  adds: `originator` and `ThreadEnvironment` on thread responses, `normalModelSlug` and `ordinaryUsageAllowed` on
  rate limits, thread-attachment notifications, and the path type `AbsolutePathBuf` renamed `LegacyAppPathString`;
  nothing removed, no type changed (8 files new, 27 changed, none removed across the whole tree). Measured on
  2026-09-27: 89 conformance scenarios, the live fidelity gate "all 15 agree" with one real turn, cli 123 and
  protocol 147 green. parity.md's dated figures were not re-measured, as its header already says of the 0.153.4
  pin. Why: this machine's codex-cli had been 0.155.1 against a 0.153.4 pin since the CLI moved, the driver warned
  on every run, seven Codex turns of the 2026-09-27 triage ran on the mismatch, and RELEASING.md makes the move a
  prerequisite of the release.
- **The live orchestrate gate no longer counts a plan's statement of the caps as agents.** Its Fable and Astra
  counter skips a line that states the limits ("the limits are one Fable and one Astra at a time", "uses
  neither Fable nor Astra"), as it already skipped a coordinator's description of itself. Why: on 2026-09-27
  the release candidate's full-run case was failed for "2 fable agents in one wave" by a plan that used neither
  and said so in one sentence, and that sentence's two words were the count; 0.20.0 never ran the gate (its
  Codex quota was out), so the miscount had not been seen. The same case's run-directory check now accepts the
  launcher's `agent/` beside each `report.json`, holding exactly its four files (`prompt.txt`, `out.json`,
  `err.txt`, `exit`), which the page has promised since the launcher of 0.19.0; the check still dated from
  the time the driver alone wrote there, and the rerun after the counter fix failed on it with a Codex agent
  that had run and reported.
- **What installs is now `plugins/entrust/plugin/`.** The marketplace entry's `source` is
  `./plugins/entrust/plugin`: the skills, the agent, the driver and its companions, the README, the
  LICENSE and `package.json`. The suites, the pinned protocol schema and this changelog no longer install;
  they stay in the repository beside it, at `plugins/entrust/evals/`, `plugins/entrust/schema-0.153.4/`
  (516 KB, 45% of the old payload; the driver reads none of it at run time, and its protocol-drift error
  now names the pinned codex version itself instead of pointing at the directory) and
  `plugins/entrust/CHANGELOG.md`, with the plugin's
  defects ledger (`plugins/entrust/ISSUES.md`) and its research runs (`plugins/entrust/research/`).
  `package.json` has no `test` script and an installed copy has no suites: run them from a checkout with
  `node plugins/entrust/evals/run-all.mjs`, as CI now does. The README links this
  changelog on GitHub. A new case in `evals/package.test.mjs` checks that every marketplace entry's
  `source` is a directory holding that plugin's `plugin.json` and no `evals/`, `research/`, `ISSUES.md`,
  `CHANGELOG.md` or `schema-*/`. Why: an install copies the whole source directory, so every install carried
  the suites, the schema and the changelog; the owner's rule is that the installed plugin carries what the plugin needs and the
  working material lives beside it.
- **Breaking: `claude plugin install` is the only supported install.** The clone-and-symlink route —
  linking a checkout's `skills/*` into `~/.claude/skills/` and `agents/codex-agent.md` into
  `~/.claude/agents/` — is no longer documented or supported: the README's block and its notes are gone,
  and the skill pages name only the plugin's spellings (`entrust:codex`, `entrust:orchestrate`,
  `entrust:codex-agent`), which a linked install does not have. This breaks every machine installed that
  way. To move: `claude plugin marketplace add Nowely/agent-skills`, then
  `claude plugin install entrust@nowely`, and remove the old links — `codex`, `orchestrate`, `cleanup`,
  `experiment`, `advisor` and `swarm` under `~/.claude/skills/`, and `~/.claude/agents/codex-agent.md`.
  The driver still reads `ENTRUST_STATE_DIR` first, so one still exported keeps the state where it was;
  unset it to use the plugin's data directory. The README keeps the variable for running the driver by
  hand. Pinned by the updated page cases in `evals/orchestrate.test.mjs` and
  `evals/agent-contract.test.mjs`. Why: the owner chose one supported install; the linked route carried
  its own names, its own state variable and its own warnings through the README and six skill pages.
- A Codex agent's `MODEL:` line, and the driver's `--model`, take a short name (`astra`, `sol`, `terra`,
  `luna`, in any case) and run the newest model of that name the server's own `model/list` shows: versions
  compare as numbers (6.10 after 6.9), and a hidden model is never chosen. A full slug still pins one
  version, and a name no listed model carries is exit 2 before the turn with the catalogue in the message,
  as before. The driver writes what the name became on stderr, and the report keeps the slug. The skill
  pages name Codex models by short name only: the orchestrate tier table's Codex column, the codex page's
  `MODEL:` row and example, the roles reference, and the advisor, swarm and experiment pages. The
  `RECEIPT=` line takes its short name from the slug's family (`gpt-6-sol` and `gpt-5.6-sol` are both Sol)
  instead of a table of slugs, and the live gate's Astra case launches `--model astra` and accepts any
  Astra. Pinned by four cases in `evals/cli.test.mjs` against a fake catalogue of several generations
  (`FAKE_MODEL_FAMILIES`), by a case in `evals/package.test.mjs` that fails when a page under `skills/`
  names a `gpt-<n>` model, and by the updated page cases. Why: on 2026-09-26 the catalogue listed GPT-6
  Sol and GPT-6 Luna while every page, the status line's table and the tests still named `gpt-5.6-sol`
  and `gpt-5.6-luna`, so a coordinator asked for Sol kept launching the older model; the Claude names
  beside them (Opus, Sonnet, Haiku) had moved on their own.
- **A Codex agent's run outlives the wrapper that started it, and the launcher returns before the tool's
  ceiling.** `agent-run.mjs --run` starts the driver under a keeper orphaned into its own session, waits, and
  after 570 s prints its nine lines with `DRIVER_EXIT=running` and `RUNNING=pid <pid>, <n> s so far; run the
  same command again` where `REPORT=` would be, exit 0; the same command run again reads the run it started.
  Every call in flight forwards SIGTERM, SIGINT and SIGHUP to the driver's pid, a signal that arrives before
  the pid line is kept until the line appears, and a signal after the return deadline is dropped. The wrapper's
  step 2 and the codex page's block say "it ends with RUNNING= instead". Why: measured 2026-09-27, 45 ms after a
  foreground subagent's final response the harness sends SIGTERM to the backgrounded command's process group
  and to every descendant it finds by a ppid walk, then SIGKILL, and only a process in its own session and
  already orphaned survives; on 2026-09-26 a ten-minute Astra turn was lost that way when the Haiku wrapper
  handed back the harness notice instead of rerunning (E45). Measured after: the teardown check leaves the
  driver alive and its report published, and a live eleven-minute Luna turn under a foreground wrapper took two
  calls, one driver, one report. Pinned by eight cases in `evals/agent-run.test.mjs`.
- **The agent-run SIGTERM case no longer flaps on CI.** It waits for `turn/start` in the fake server's RPC log
  on the idle-silence scenario instead of the pid line plus 500 ms on a 1200 ms turn, which left a margin of
  one Node spawn (E43; three CI failures on three OS and Node pairs). 20 of 20 loop runs.
- **The lock concurrency case holds one run in a slow turn.** "two concurrent runs: exactly one wins" starts
  the contender only once the holder's lock is on disk and checks the roles, not the sorted codes; two fast
  turns could run one after the other and both exit 0 (E44's second case, CI run 35320724153). 100 runs under
  load, 0 failures; a copy without the wait fails 21 of 40. E44 now names the first case's cause, an
  ownership check followed by an action on the shared pathname, with the fix on hand and its cost.
- **`WEB_SEARCH:` is the provider's search tool, and the row says so.** The Header fields row now says the
  network needs no line and every level has it, that the field is set only when the user asks for the
  provider's search, and that a mode the device refuses goes back to the user as a question, never to another
  mode. The driver's refusal of a mode the managed policy narrows ends with "another mode is the user's
  choice to make, not the coordinator's, and the network is unaffected". The read-level `--writable`
  refusal moved from setup into argument parsing, so it comes first among the refusals and prints no pid line. Why: twice, 2026-09-17 and
  2026-09-25, a coordinator read "the network is allowed" as this field, the device refused `live` after an
  agent was spawned, and the coordinator swapped in `cached` (E1).
- **`advisor`, `experiment` and `swarm` load `codex` alone.** Each page opens by loading the codex page
  through the Skill tool and carries the orchestrate rules it relies on: the caps, the run directory, the
  plan-and-stop, the five-field return, and for swarm protocol E4 with its link. None asks the Skill tool for
  `orchestrate`, which is marked `disable-model-invocation` and refused (E39; the advisor did not start on
  2026-09-25). Pinned by an A0 case in each suite, which fails on the previous text and names the load.
- **`orchestrate.test.mjs` pins every rule.** F2 pins the nine Verification bullets and their count; D12 and
  D13 pin the bulk-unit sentence and "announce its count before spawning" (E2). 12 of 12 mutations red.
- The stray `evals/orchestrate.test.mjs.orig`, a patch leftover that came in with #14, is gone.
- **Breaking: the lock's on-disk shape changes.** `<state>/locks/<hash>.lock` is now a relative symlink, created
  exclusively, to a 0600 owner file beside it; the run keeps a descriptor on that file and records its identity,
  an update writes through the descriptor and never renames over a path, and a release removes the link and the
  file under the reclaim marker, so nothing is left after a normal run (three `--worktree` runs leave no entry, as
  with the previous shape) at a cost of about one millisecond per release. A lock in the previous shape is
  still honoured live and reclaimed dead. A driver from before this change that meets the link exits 2 with "is a
  symbolic link, not a lock file; remove it and retry": do not follow that advice while the holder lives; upgrade
  every driver that shares a state directory together. Why: update and release checked the owner and then acted
  on the shared pathname, so a peer's lock written between the two steps was what they renamed or unlinked,
  proven on an instrumented copy (10 of 10 update runs and 10 of 10 release runs; E44), and the same window
  between the check and the act on the owner file is closed by the identity check. The reclaim marker is taken
  over by a rename checked before use and dropped only when its body is this run's, so two takers cannot both
  hold it. Pinned by twelve cases in `evals/lock.test.mjs`, two of them through `evals/lib/lock-window.mjs`,
  which pauses a temporary copy of the driver before the lock's act. Residual, documented in the driver and in
  `references/environment-and-internals.md`: a process that ignores the marker can still lose a file between
  the release's check and its unlink, because POSIX has no unlink by inode. An owner file whose
  body does not parse now refuses the directory with exit 10 naming both files, where the previous shape reclaimed
  it: the run cannot know whether the writer is alive.
- **The managed-policy reader fails closed on a file that is not a plist.** A failed key extraction reads as
  "no policy" only when `plutil -convert xml1` succeeds on the file and its root is a dictionary; anything else
  refuses every `WEB_SEARCH:` mode as unreadable. `plutil -lint` accepts a file holding `garbage`, and the
  no-key message is the same for that file and for a dictionary without the key, so neither remedy the ledger
  named works (E46). Pinned by two cli cases through `ENTRUST_POLICY_SEAM`.
- **A `--run` for another report path never writes into the directory it refuses.** The refusal goes to the
  caller alone, on its own nine lines; a launch claims `err.txt` exclusively before it records any refusal; a
  call decides whose run a directory holds from the driver's pid line, whose report path must match the call's
  whole, and forwards no signal before that line names its own report (E47 and two defects found beside it: a
  prefix of the report path read as the same run, and a foreign call arriving before the pid line waited on
  another run and forwarded its signals to it). Pinned by seven cases in `evals/agent-run.test.mjs`; a
  relative-report launch into a live directory once appended to its `err.txt` and overwrote its exit marker.
- The fake server's `slow-turn` scenario ends on `turn/interrupt` as `idle-silence` does (E48: SIGTERM 200 ms
  into the turn now reports `interrupted` 58 ms later), and the protocol `stalled-turn` row's budget is 1 s
  instead of 0.25 s (E49: the 250 ms budget expired before the driver had processed `thread/start` on a loaded
  runner, 1 failure in 120 loaded runs at 0.25 s and 0 at 1 s, which does not separate the two by itself; the
  mechanism does, the failing run having no thread id, and a pre-thread abort publishes no stdout JSON by the
  driver's own contract; the rate at 1 s on CI is unmeasured).
- **The orchestrate page waits for completion notifications, never on `TaskOutput`**, which Claude Code 2.1.277
  removed: a background agent's return arrives as a message and its notification, the Codex poll's `DONE=` line
  is the signal that a run ended, an interactive session may end its turn with agents alive, and a headless
  session launches every agent in the foreground, the foreman included (E50). The live gate recognises the
  `entrust:codex-agent` wrapper, finds a run's pid in `agent/err.txt` beside its report, and fails a wrapper
  launched in the background. Pinned by F6, F9 and I4 in `evals/orchestrate.test.mjs`.
- **`/entrust:cleanup` understands the lock's shape.** It tells apart a held lock, a released link, an abandoned
  pair, a stray record and the record of a running agent, proposes the released and the stray, removes an
  abandoned pair by number, removes anything only under the driver's own reclaim marker (imported from the
  driver) with the identity re-checked just before each unlink, and reads records through a descriptor opened
  under a pinned directory handle, so a record swapped for a link is listed as unrecognised and kept. Row names
  pluralise the noun. Pinned by cases 42 to 45 in `evals/cleanup.test.mjs`.
- **The orchestrate plan is a card of five rows, and an agent off the card is not launched.** Work; who, each agent
  by model and role, with the workers and the checking agents counted apart; writes, where a worktree agent's tree
  is "made and removed inside the repository, in a hidden folder" and the driver and `.claude` are no longer named;
  cost, the tokens by agent with the coordinator's own inline work beside them; checks, who verifies what, the
  critic, and in a design round the criterion that picks the survivors. The simple-task row counts one worker, with
  the completeness critic beside it and its verifier named. With a Codex agent in the plan, every agent, Claude or
  Codex, is first registered through the launcher's `agent-run.mjs --plan --run-dir <run>`, and the card is built
  from what it prints: an `AGENT=` line per row and the `WORKERS=` and `CHECKING=` counts, which its role
  classifier derives. The launcher writes the rows (`id | model | role | writes | tokens`) to `<run>/plan.txt` at
  0600 and rejects a duplicate id or one that differs only in case, an id shaped like a continuation, an unknown
  model, a role it cannot class as worker or checking, and bad writes or tokens (a number or `unknown`); the plan
  records the declared scope and checks neither the caps nor the cost figures. Under a registered plan, `--new`
  admits only `<run>/<listed id>/report.json`, or a continuation `<run>/<id>-<n>/report.json` (n from 2, no leading
  zero) once the previous link's `agent/exit` exists; a continuation inherits the listed row's model, so a Claude
  row cannot launch a Codex agent, and a `RESUME:` after a cut, a relaunch and each advisor question after the
  first need no amendment. An agent added later is a `--plan --amend`, marked as an amendment in the file, shown,
  and launched only after a word. A Claude agent off the card is not launched, and its description carries the
  card's id ("<Model> <id>: <task in a few words>"). An all-Claude plan skips the registration and still shows the
  card. Before the answer, the coordinator checks the run against the card: every launch, every write and every
  dropped agent. `/entrust:cleanup` reads the plan file as run evidence: a run holding only a plan is listed and
  kept until a published report proves whose it is, and a finished owned run with a plan stays selectable. Pinned
  by C13, E5 and F11 in `evals/orchestrate.test.mjs` (F11 registers a plan and shows `-2` refused while the first
  run is going and admitted after), two D6 cases in `evals/agent-run.test.mjs` and two in `evals/cleanup.test.mjs`;
  the live gate checks the card against the registered plan with the launcher's own `classifyRole`, every launch
  against that plan with its `planRowOf`, and each agent's writes against its row's writes column. Why: #15 F13 and
  F14 (P9a, P9b): a plan of ten elements was approved unread and agents it never listed ran anyway (T7, 1.38M
  tokens unplanned); F3: the simple-task row said "1 agent" beside a critic and a verifier; #16 Q3j: no criterion
  was declared before blind proposers ran.
- **The orchestrate page plans from a generated composition reference and loads the codex skill only when the plan
  has a Codex agent.** Its first step no longer loads the codex page on every run: it plans from
  `skills/orchestrate/references/codex-composition.md` and loads `entrust:codex` before the launcher's `--plan`, so
  an all-Claude run never reads the codex page and a run with a Codex agent reads it as before. The reference holds
  the codex page's `## Composition` section and its `## Rights` table with the paragraph after it, between markers
  naming each source, generated by `evals/fragments.mjs`, which also keeps the five-field schema's inline copies in
  the orchestrate and swarm pages equal to `skills/codex/schemas/five-fields.schema.json` and the run-directory
  path equal in the three pages that name it; `node evals/fragments.mjs --write` regenerates the copies.
  `evals/fragments.test.mjs` fails on drift and on a mutation per fragment, and `run-all` runs it before `package`,
  so a release stops on it. A3 in `evals/orchestrate.test.mjs` pins the page's order, and the live gate's case 6
  runs a plan under "no codex" that never loads the codex page, registers nothing and still shows the card. Why:
  #15 F18 and P5: the page ordered the whole codex page loaded, 4,511 words, before a plan with no Codex agent in
  it; P12b: hand copies of shared page text drift. A plan with a Codex agent still loads the codex page, later: the
  reduction #15 targets for that route, 4,308 to 7,044 words, is not made here.
- **`/entrust:advisor` advises from the first decision, on the invocation's word, and its prompt names Astra and
  the shipped five-field schema with no effort line.** The page no longer stops for "go" before the advisor's first
  question: the user's invocation is the word for its turns, the composition included, and a stop stays for what
  the invocation did not grant (the workers' plan, an edit, a commit, a publication). "No advisor" (без советника)
  ends the thread for the run and "ask the advisor" (спроси советника) starts it again. The advisor is no longer
  "chosen by the agreed composition" it was meant to advise on. The page shows the prompt block, `MODEL: astra`, an
  `OUTPUT_SCHEMA:` line naming the schema file the codex skill ships and no `EFFORT:` line, since a top-row agent
  inherits the configured effort; a continuation is the same block under `RESUME:`, at the next report path
  (`<run>/<id>-<n>/report.json`). `evals/advisor.test.mjs` D1 pins the start with the removed sentences as its
  negative half, D3 the prompt's lines, and D4 fills the block the way a coordinator does and registers it, and a
  continuation's `RESUME:` header, through the launcher's `--new`, which runs the driver's own prompt check. The
  live gate's case 8 runs a four-turn advisor session: advice before any stop, a later consultation on the same
  thread, silence after "no advisor" and a return on "ask the advisor", every advisor prompt with `MODEL: astra`,
  the shipped schema and no `EFFORT:` line. Why: #15 F1 and #16's advisor section (P1, which includes Q1): the
  advisor never advised the first decision, because the page stopped for a word the invocation had already given;
  #15 F12c: the advisor page loads codex alone, so orchestrate's top-row effort rule never reached it, and an
  advisor with no schema once answered in 111 lines of prose.
- **A Codex agent is told its writable roots, and its brief carries what the plan found about its environment.**
  The driver's developer instructions name the effective writable roots, the temporary directory and, at write
  level, the working tree and every extra write grant, and say that `/tmp` is not one; they add the staged-input
  rule: where a task says a daemon, socket or mounted checkout is unavailable, use its staged inputs and the named
  alternative commands, and record the exact diagnostic of a command that cannot run. The plan's first step writes
  what the coordinator found into the agent's `ENVIRONMENT:` line, a body line after `TASK:` and not a header
  field: what is staged and where, and the daemon or socket a tool needs with the command to run instead. Pinned by
  the D4 flow in `evals/cli.test.mjs`, which runs through a real git worktree with `--writable` and checks the
  whole sentence, "/tmp is not one" included; the live gate checks that a write agent's `ENVIRONMENT:` line names
  every staged input and every daemon tool with what to run instead, and `evals/gate-checks.test.mjs` runs that
  check on a staged fixture. Why: #15 F11 and F19 (P10a): agents guessed at unavailable mounts, wrote to `/tmp` and
  fought a VCS daemon the coordinator already knew about.
- **The one Codex agent the coordinator waits for is a foreground call.** The orchestrate page now says what the
  codex page says: background when agents run side by side, foreground for the one agent waited for and for every
  agent in a headless session. F6 in `evals/orchestrate.test.mjs` pins it. Why: #15 F12a: the two pages
  contradicted each other.
- **The split critic's correction is a file every worker brief is written from.** It names each unit's owner and
  every shared interface's one owner; no worker brief exists before it, each brief is written from it and names its
  path, and each is checked against it before its worker launches. The foreman's brief carries the file
  (`skills/orchestrate/references/foreman.md`), and the split critic's row in `references/roles.md` says the same.
  Pinned by F2 and I9 in `evals/orchestrate.test.mjs`; the live gate's case 7 runs two units sharing one interface
  and reads the corrected split file itself: a worker brief written before the critic returns, an interface the
  file omits, one its owner's brief omits and a file a brief takes from its owner are each a failure. Why: #15 F6
  and #16 Q3a: a fan-out started before the critique finished (T5), and ownership of a shared interface escaped the
  implementer, the reviewer and the critic.
- **The roles reference asks each brief for what #16 found missing.** A cross-review brief names the requirement,
  the unit that owns the change and its consumers, and a valid change in the wrong unit is a finding (Q3c); a
  strong reader's brief names the source, its revision, the decision it feeds and the evidence that ends the read,
  and its return tells a negative from an input it could not reach (Q3e); a live prober freezes its baseline
  capture, with its digest, revision, mode, platform and control, before any write (Q3g); the judge rules by the
  criterion the plan named before the proposers ran (Q3j); measurers and retrospective analysts work from inputs
  fixed by path and digest and write `unknown` for what those inputs lack (Q3k). E10 in
  `evals/orchestrate.test.mjs` pins them. Why: #16's role table: each was a clause a brief writer could act on and
  the row did not have.
- **A refuter answers `unknown` when its decisive check could not run.** `refuted` now means a check ran and
  contradicted the claim, never "uncertain"; claims reach refuters as the dedup-and-rank's one-claim clusters with
  their origins kept, and a prerequisite the refuters share runs once, its receipt in each brief. F2 in
  `evals/orchestrate.test.mjs` pins the bullet and fails on the old default. Why: the owner's decision of
  2026-09-27 on #16's "preserve unknown"; #15 F5 and P8d: duplicate claims were refuted over and over (T5, T2), and
  "could not check" was folded into "false".
- **The user hears one paragraph per phase, of verified work.** At the end of a fan-out, a verification round or
  the synthesis, one paragraph carries what a verifier confirmed, what is pending and what blocks; a return
  arriving alone earns one only when it failed or asks the user something. C7 in `evals/orchestrate.test.mjs` pins
  it, and the live gate checks one paragraph per phase. Why: #15 F16 (P13a): fourteen paragraphs a run.
- **The completeness critic's verdict is bound to the draft it read.** The critic reads the linted draft, frozen
  with a `shasum -a 256` manifest over the draft and every artifact it cites, and returns the manifest's digest
  first in its `evidence`. Before the answer goes out, the manifest's digest is computed again and compared with
  the critic's, and `shasum -a 256 -c` runs on the manifest: a different digest or a failed check voids the
  verdict, and the changed part is read again. A `not done` verdict means fixing the answer or naming the gap, and
  what goes out is the draft's text. `evals/orchestrate.test.mjs` F10 shows the page's check catching a changed
  cited artifact, and the digest comparison catching a manifest rewritten after the change, which `-c` alone
  passes; the live gate recomputes the manifest's digest, compares it with the one the critic returned and checks
  that the answer is the draft the manifest froze. Why: #15 F4 and P8b: the critic read one version and another
  went out (T3, T8).
- **The orchestrate page no longer calls itself prompt only.** The sentence says what holds now: the mode adds no
  header field or flag, what it asks of the driver and the launcher is the codex skill's and changes there, and its
  own two scripts, the runner and the linter, write only under `$TMPDIR`. The plugin README's layout lists them and
  the generated reference. `evals/orchestrate.test.mjs` A1 changes with it. Why: the owner's decision of
  2026-09-27; the fixes for #15 and #16 add the runner and the linter and change the driver and the launcher.
- **The live orchestrate gate checks what the fix run changed, and its reading of a session is tested offline.**
  Four cases join `evals/orchestrate-live.test.mjs`: a plan under "no codex" (case 6), the split critic (7), a
  four-turn advisor session (8), and activation by position (9), a pair of cheap Sonnet sessions with
  `/entrust:orchestrate` first and last, read from their session files, the first required to expand the page and
  the last recorded. The plan and full-run cases gain the checks the entries above name: the card and every launch
  against the registered plan, each agent's writes, a write agent's `ENVIRONMENT:` line, the runner, the draft
  linted before the critic, the critic's digest, one paragraph per phase, every return in the five fields, and the
  answer's attribution. The gate's logic moved to `evals/lib/gate-checks.mjs`, which imports the launcher's
  `planRowOf` and `classifyRole`, and the new `evals/gate-checks.test.mjs` runs it on fixture streams in the shape
  of the gate's saved sessions: per check one stream built to pass and one built to fail (a rewritten manifest, a
  malformed critic return, an out-of-scope write, a misattributed fact and a capsule that omits a staged input
  among them), and one whole good run that passes them all at once. The first live run over the fixed tree
  (2026-09-28) corrected four readings of the gate's own, each since pinned by a fixture from that run: the card's
  worker and checker counts are read from its who row and compared with the launcher's WORKERS= and CHECKING=
  lines; a Fable or Astra agent counts only where the plan names one as an agent, never in a cost row; a critic
  continued by message is judged by its second verdict, and after the frozen draft the answer may carry one line,
  the critic's verdict in the page's form; a lint passed by the linter's last HITS=0 line or by the runner's
  EXIT=0, and a passed lint of the coordinator's own is a receipt. The VS
  Code half of the activation measurement is a manual protocol in
  `plugins/entrust/research/2026-09-27-field-audit-triage/activation-position.md`, which also corrects the drafted
  check: the session file's expansion record does not carry the page's frontmatter. Why: the findings that came
  back after a page sentence (M1) need a regression that watches the behaviour, and the command's position is F2
  and P14a.
- **`evals/README.md` states the regression rule and indexes the recurring findings to their cases.** A finding
  that came back after a page sentence gets a regression that observes the behaviour, offline where a script owns
  it and in the live gate where only a session shows it; a wording pin is never its only check. The offline half of
  the index is in the README, the live half in the gate's header, and each says which cases have run. `run-all.mjs`
  lists twenty suites, the four new ones among them. Why: M1 showed eight findings answered by a sentence in
  0.16.0–0.20.0 and back in 0.20.0 sessions, and P12a asked for behavioural regressions instead of wording pins; F7
  is listed as fixed before this round and F8 as waiting on its measurement, not as repaired.
- **The driver answers yes itself to a file change whose every path lies inside the agent's writable
  roots**, recorded with `by: "driver"` and `cause: "rights"`, and never shown to anyone. All ten declined
  file changes measured on this machine before this change were writes into the agent's own `$TMPDIR`
  (06-owner-round, level 3), because Codex's edit tool asks for approval by comparing the patch path's
  spelling against the granted root's spelling: a `/private/var/…` path inside `$TMPDIR` asked and the
  `/var/…` spelling for the same file did not (P1, level 3). Auto-yes runs with or without a mailbox armed,
  compares resolved paths through symlinks on both sides, and offers the request instead where a path
  resolves outside the roots or no `item/started` named one, so the coordinator still sees it. The guard
  that contains a mailbox now also refuses a writable root that is, or is an ancestor of, `~/.codex` or the
  state directory (E66): `--writable ~/.claude` is refused on a plugin install, where it used to grant the
  plugin's own locks and answer log. The auto-yes's own `why` is now
  `"rights cover it (checked as the answer was sent)"`: every directory the resolved path crosses must be a
  plain one, never a symlink, nothing under a `.git`, `.codex` or `.agents` in any spelling (matched by
  inode and by a case-folded name), and the whole check runs again, fresh, at the moment the answer is
  sent rather than only when the request arrived — a directory swapped for a symlink in between is
  followed by the server, not caught here, and whether the server itself re-resolves that swap is
  unmeasured. A subagent thread's own request, offer or auto-yes alike, lives only while that thread's own
  turn stays open; once it closes, a further request from it is declined at once as `"turn ended"` or
  `"not the current turn"`.
- **The report's `escalations` array, per entry.** Exit 6 is now "a request was declined or expired
  unanswered", never one that was accepted, matching the help's own wording; `detail` carries the server's
  wording, the command, or the joined file-change list whole, no longer clipped to 200 characters; every
  entry gains `cause` (`rights`, `outside`, `sandbox` or `policy`) so a coordinator's synthesis can say why
  approvals were needed and what avoids them next time, and `by` now also reads `driver` for an auto-yes.
  `RECEIPT=` gains `stale=N` beside `late=N`; the report gains `approvalsDuplicate` (a request id the
  server sent twice is answered once, and the repeat is counted, not treated as a second request) and each
  request's own `settled.decisionFile` (`taken`, `none`, `stale` or `late`: what the decision file held as
  the request settled). Why: a clipped `detail` hid the very command a coordinator had to read before approving it, and an
  unnamed cause left every approval's synthesis guessing.
- **E63 fixed**: the driver's refusal-shape comment now names `ServerRequest.json`, where the enum it means
  actually lives, instead of a `schema-<version>/*ApprovalResponse.json` layout the pinned tree never had.

## 0.20.0 — 2026-09-18

### Added

- A fourth skill, `/entrust:experiment`: one registered experiment on the orchestrator's own rules. A
  protocol before any agent (a hypothesis that can be false, arms with the comparator the question calls
  for and one "go" for all of them, material frozen with its ground truth before any arm sees it, the
  research ruler's metrics counted per outcome with n and an interval, a judge that reads the returns with
  their first line removed and the arms lettered, a stop rule and budget), each arm an orchestrated run
  with its own directory and the same brief, a failed arm never re-run to a better number, the
  orchestrator's conclusion that states no cause the design cannot carry, then the user's verdict that
  decides, and neither rewritten afterwards. The record is `experiments/<date>-<slug>/` under the state
  directory, beside the orchestrate runs, written only by `skills/experiment/scripts/experiment.mjs`
  (`init`, `arm`, `add`, `export`, `list`; every write create-only, the record closed by its verdict, a
  records root that is a symbolic link refused, an export destination under the state directory refused),
  because a coordinator's own write there is refused as a sensitive file (measured 2026-09-08) while a
  script handed the path is not; `export` copies a record unchanged into a checkout as
  `research/<date>-<slug>/`, the layout the repository already keeps. Cleanup neither lists nor removes a
  record. Five protocols are registered in `references/protocols.md`: E1 one Sol against thirty-four Luna,
  E2 the cheap-first cascade, E3 the standing advisor against per-call advice, E4 swarm coordination, E5 a
  mixed team on one deep task. Pinned by `evals/experiment.test.mjs`: page cases by the words that carry
  each rule, a negative case against a sentence that would let a record change, and nine script cases in
  a scratch state directory. Why: the 2026-09-17 research round produced fifteen hypotheses and a rule
  that only matched runs with an independent judge measure improvement; without a vehicle they stay opinions.

- A fifth skill, `/entrust:advisor`, prompt only: one standing top-row advisor of the other model family
  for one run, named in the plan with its turns, asked one question at each decision point (the split,
  the composition, a verdict about to be adopted, a stall) with the coordinator's own decision in the
  question; it returns a recommendation with reasons, one alternative and what would change its mind,
  never implements, never judges its own advice, holds a slot only while a turn of its runs, and every
  decision point is written down before and after in a notes file the synthesis names. The page states
  no benefit until protocol E3 has run. Pinned by `evals/advisor.test.mjs`, including a case against any
  sentence that would hand the advisor a role it must never take. Why: the owner asked for a standing
  advisor by a separate command to test its effectiveness; the 2026-09-17 research found no source that
  had measured one.
- A sixth skill, `/entrust:swarm`: up to fifty bulk agents over a file of units, each made and run by
  `skills/swarm/scripts/swarm.mjs` through the sibling launcher as agent `<id>` at `<run>/<id>/report.json`
  with its `agent/` beside it, the layout the cleanup lists as a run; at most `--concurrency` at once,
  fifty enforced by the script; a summary written outside the run, in an agent-scratch directory, from the
  launcher's status lines, so a stale report under a taken path is never this run's outcome; a signal
  stops further launches and reaches every running agent. A Terra swarm counts as the bulk row does,
  against the swarm's own cap, stated on the page as this mode's one override; every brief is a read agent
  on Luna or Terra at the effort the orchestrate page sets. Sharing nothing is the default; shared state
  (a queue claimed by `mkdir`) and free messaging are protocol E4's arms, and peer messaging as
  verification stays on the research's do-not-adopt list. Pinned by `evals/swarm.test.mjs`: page cases
  by the words that carry each rule, a case that no strong or top model is admitted, and swarms against
  the fake app server for the layout, the dollar-quote substitution, serial concurrency, a stale report
  and a signal. The roles reference gains the standing advisor and the swarm reducer, and the orchestrate
  suite's roles case pins that neither may write on a tree. Why: the owner asked for a swarm mode that
  offloads the orchestrator's launches and waits, and for both coordination shapes to be tried as
  experiments rather than decreed.
### Changed

- The caps count turns in progress: separate advisor, critic and architect threads may take turns within
  them, and a thread waiting for another message uses no slot; `fable` is for Fable agents within the agreed
  cap. A plan may propose a cap of its own with its reason, and the user's word sets it for the run. Why: the
  owner's reading of the pool on 2026-09-17, after a design that counted idle threads against the cap.
- The completeness critic reads the user's request, the final answer and its evidence before every final
  answer of an orchestrated run, one fresh strong-row reader named in the plan, and returns done, partial or
  not done with what is missing, unverified or unread; a publication is read the same way; a one-agent task
  has no judgement agent beyond it. Why: the owner's corrections at the synthesis stage were 8 of 27 in the
  record, and a README once published an inference from absence unchecked (T1-49).
- A roles reference, `skills/orchestrate/references/roles.md`, linked from the bounds paragraph: 19 roles
  with what each does, may write and returns, when it is spawned, its tier and the runs that used it; no role
  is a phase of one piece of work. Why: the role set was in practice the tier table's four rows; the
  2026-09-17 survey found role catalogues in ten of thirteen frameworks and the record twelve roles assigned
  without a table.
- The orchestrate page gains eight rules from the 2026-09-17 research round
  (`research/2026-09-17-orchestration-practices/`: 185 survey claims mapped to the two pages and 54
  coordinator incidents from the local record; the T1 ids below are that round's, and `426:973` is a
  line of the session transcript T1 cites). Each rule and the defect that paid for it:
  - A decisive check runs before any panel is commissioned; dependent execution stays in one agent and
    its verification stays independent. Why: two naming rounds put sixteen agents on proposals, reviews
    and a verdict before the check that decided had run, and the second round's winner fell to a
    collision check after the verdict (T1-45; 426:973, 426:1208), while the two tasks the coordinator
    kept in its own hands landed with critics only (T1-19, T1-48); the controlled comparisons say the
    same of sequential and tool-heavy work (S2-02, S2-03). The rule orders the check; the fresh verifier
    of "you never grade your own work" stays, and a new eval case fails if the page ever says otherwise.
  - A judge's verdict that lacks its decisive check is `unknown` in `result`, the missing check named in
    `open`; a Codex judge's check goes under the sibling's `EXPECT:` rule. Why: judge Astra J3's
    `proofbound` was disqualified by a collision check no agent had run (426:1208); judge J2's "keep"
    was reaffirmed on new evidence (426:1005) and then set aside by the owner's rule that the plugin
    name carries no vendor (426:1018) — one verdict of six fell to a check, not the two that T1 §2.4
    counts; T1-37's own row says the conclusion held.
  - Between selection rounds the coordinator records what was rejected, what was learned and what
    still blocks; two rounds on the same blocker are a stall and become a new plan for the word. Repair
    rounds keep their ladder: two rounds, the top row, then the user. Why: the naming rounds each ended
    on the same blocker and the two-round rule, which counts fix rounds, never tripped (T1-45).
  - Before the plan is shown, each agent's required commands are checked against its planned rights and
    environment; uncertain prerequisites are probed cheaply and unmet ones go into the plan. Why: a Sol
    review turn spent 2,649,693 tokens and left its collision check unrun because SSL failed in its
    sandbox, and the coordinator redid it (T1-44; 426:1005); ten of thirteen agents in one run ended at
    exit 6 on declined requests (T1-51). Nothing is reassigned after a refusal: the sibling's rule
    against widening rights on a refusal stands.
  - One assembled brief is opened whole before any fan-out, its input paths checked in the agent's
    planned tree, its item count and each quoted claim against its source. Why: the split critic reads
    the decomposition, not the file the generator wrote, and three generator defects each reached every
    agent — a join that paired all twelve reports with the wrong paragraph (T1-05, 2026-09-11, the one
    outcome-blocked incident of the coordinator's own), a doubled path segment in all twenty prompts
    (T1-09, 2026-09-12) and a quoting slip that gave each of three agents one set of four (T1-39,
    2026-09-17); a path check alone would have caught only the second.
  - A refuter's finding is one that changes correctness or a stated requirement; the rest goes to
    `open`. A verifier's brief names its target and whole scope, and its return separates what it
    checked from what it did not. Why: round 08 of the markup round made twenty-seven edits against a
    wave's eighty-seven findings and five owner decisions and brought ten regressions of its own (T1-50;
    `research/2026-09-11-markup-round-0/rounds.md`); the coordinator once bounded a report clipped at
    50,000 characters to the parts it had read (T1-30; 426:33), where three earlier claims from partial
    evidence were cut by agents (T1-08, T1-12, T1-49).
  - Every alternative in the plan is numbered with its cost, the recommendation marked, and the plan
    says what "go" selects. Why: a bare "го" was read as assent over forks the plan had left open three
    times (T1-23; 30a:204 on 2026-09-12, 30a:848 on 2026-09-13, 426:92 on 2026-09-16; no objection
    followed) and a wait was offered as free that was not (T1-38; 426:1214, 2026-09-17).
  - The bulk row's count is derived from the units and the plan says why that many; the plan states
    expected tokens by tier and role from comparable runs, `unknown` where unmeasured. Why: eighty
    agents were launched on the word "bigger" against a page that already said six alive, and twelve
    findings survived (T1-01, T1-03); the user stopped a wave of fifty-one for its cost before any cap
    existed (T1-53); an Astra ran at 1 % quota with the only reproduction path on it (T1-07). No
    number sits on the page: the record's pooled medians mix roles and task shapes (Luna 13.6 k for a
    recognition read, 742 k for a tree verification; Astra 585,186 over six agents under the
    conventional median, where T1 §2.4's 903,705 is the upper-middle value), and Claude agents' tokens
    are unrecorded (T1-U3).
  - The completeness critic is one fresh strong-row reader chosen by the agreed composition and named
    in the plan, given the whole publication and its evidence once, before it goes out, never per
    return. Why: no run of seven had spawned one (T1 §4) and a research README published an inference
    from absence unchecked (T1-49).
- "Prefer Luna to Haiku in the bulk row" drops "and smarter, and four times cheaper". Why: no Haiku token count exists
  anywhere in the record (T1-U3), so the price half was a claim, not a measurement, and nothing in the record measures "smarter". The preference
  stays as the owner's: four of fifty Haiku returns were lost to the schema and, of about thirty-six
  candidate findings from sixty-six cheap extractors, twenty-four were refuted (T1-02, T1-03); twenty
  of twenty Luna located the file under a broken path (T1 §2.3a) and thirteen of thirteen agreed with
  a judge who read the tree (T1-26). Two unmatched cohorts, not a comparison; the matched one is
  phase 3's.
- The page's line budget in `evals/orchestrate.test.mjs` moves from 155 to 156 for a page of 156
  lines; ten cases pin the new rules by the words that carry them (B7, C9–C11, D9, D10, E7, F7, F8,
  G7), the three verification bullets that changed carry their new text in F2, and B7 fails if the
  page ever tells the orchestrator to grade its own work.

## 0.19.0 — 2026-09-18

### Changed

- **One agent, one turn, one message.** The Agent call for the one agent the coordinator waits for is a
  foreground call: the hand-back message arrives inside the same turn and no notification follows, so the
  coordinator answers once; agents that run side by side stay background calls. Why: with a background call the
  harness delivers one completion as two events, a hand-back message and a task notification, and the
  coordinator answered each with text («Готово.»), while the wrapper's forced closing line landed as a block of
  its own after the answer; measured 2026-09-17 on a native subagent and on the wrapper, and a foreground call
  ran eleven minutes with no ceiling of its own.
- **The prompt goes in with one call.** `agent-run.mjs --new --report-file R` takes the prompt on stdin and
  makes the agent's directory beside the report, `agent/` at 0700 with the prompt at 0600; `--run` and `--status`
  find that directory from the report path, so `--dir` is optional and `mktemp` is gone from the page. A `--new`
  and the Agent call may go in one turn: `--run` waits ten seconds for the prompt. None of the launcher's files
  is left in `$TMPDIR`; a run's four files sit next to its report, and `/entrust:cleanup` reads them: an agent
  directory with no report is no longer "still running" forever when its `exit` marker says the run ended or
  its prompt was never run. Why: the coordinator spent two tool calls and eight seconds making a
  directory and writing a file before every agent (measured 2026-09-17).
- **The wrapper's four steps are back in the message.** The page's block carries them and the agent file repeats
  them. Why: with the steps in the file alone, Haiku kept them in one run of three and paraphrased the nine
  lines, narrated after the hand-back and read the output file in the other two; with them in the message, three
  of three (measured 2026-09-17).

## 0.18.1 — 2026-09-17

### Changed

- **The wrapper runs one command.** `scripts/agent-run.mjs --run` launches the driver, waits for it and prints
  the nine status lines in one foreground call, and the wrapper hands those lines back; its procedure — run,
  run again while the result has no `REPORT=` line, hand back, one closing line — lives in `agents/codex-agent.md`
  and the message carries only the command and the description. The call is idempotent: a second call on a
  directory whose driver is running waits for it, on one that ran prints, so the tool's ten-minute ceiling costs a
  long agent one more identical call, and the wrapper's file forbids anything between the two (measured
  2026-09-17: an eighteen-minute agent, one driver, one report; the first wording drew a text line and two
  improvised reads before the rerun, the shipped wording is unmeasured). Why: a Codex agent's card showed three Bash steps and their
  thinking rows where a native subagent that runs one command shows one Bash and its return; parity with native
  subagents is the plugin's fitness test, and the three steps were the ceiling's price, not the task's.
- The composition line for a read agent names no rights, since nothing is being approved. Why: «только чтение,
  ничего не пишет, команд не запускает» was retold to the user for a greeting (measured 2026-09-17).

## 0.18.0 — 2026-09-17

### Changed

- The wrapper's two commands are `scripts/agent-run.mjs`: a launch that takes the directory and the report path
  and runs the driver with the same two flags, the same environment, the same four files and the exit marker
  written last, and a status read that prints the nine hand-back lines. The block a coordinator fills in
  shrinks from about 2700 characters to about 1400, the directory named four times instead of nine. The launcher
  never opens `prompt.txt` except as the driver's argument, refuses a directory whose exit marker exists, and
  forwards a signal to the driver; `evals/agent-run.test.mjs` measures each of those against the fake server.
  Why: the coordinator typed the block for 14 to 16 seconds of every launch (measured 2026-09-17), a fifth of a
  one-line task's wall clock.
- The status read names the model by its short name (`model=Terra`), the slug staying in the report. Why: two
  coordinators retold the slug they had just read to the user (measured 2026-09-17), against the page's rule.
- The codex page says where the final message's shape is decided: on a clean run the user gets the agent's name
  and its answer and nothing about the run; the notification after a hand-back is answered with nothing; the
  task is written in the user's language; and the agent's name is given in the prompt, since the model does not
  know its short name (measured 2026-09-17: «GPT-5 Codex, id T1», and an English answer to a Russian greeting).
- The wrapper writes no text before or between its steps. Why: a wrapper opened with an English sentence about
  what it was about to do (measured 2026-09-17).

## 0.17.0 — 2026-09-17

### Changed

- The codex page's `EFFORT:` row lists what the catalogue advertises and says that no line inherits
  `~/.codex/config.toml`; the driver's `--help` says the same, and its comment beside the set records that no
  model on codex 0.153.4 advertises `none` or `minimal`. The set itself is unchanged: those two still reach
  model/list and are refused there, exit 2 before a turn. Why: a coordinator picked `minimal` for a one-line task
  straight from the table and paid a wrapper launch for the refusal (measured 2026-09-17), and a driver that
  clamped instead would re-create the silent downgrade incidents.md records.
- The wrapper's hand-back carries ten lines: the answer where it is short, the refusal where no turn ran, and the
  receipt (`ANSWER=`, `ERROR=`, `RECEIPT=` beside the earlier five and `WAIT_DONE`/`REPORT=`). Why: on a one-line
  task and on a pre-turn refusal, the five-line hand-back sent the coordinator back to the report file for one
  more turn each (measured 2026-09-17: 327 and 220 output tokens, 9.4 and 5.1 seconds). `PATH=` stays: it is the
  only line that tells an earlier run's file at the same path from this run's.
- The wrapper answers the harness's request for a visible response after its hand-back with one constant line,
  the agent's own description and "report delivered". Why: the harness asks every subagent that ends on an empty
  message after its hand-back for a visible response, native ones included (measured 2026-09-17 on a Haiku
  baseline), and the wrapper answered it with an English paragraph that narrated its bash steps, named an absolute
  path and used the word the 0.16.0 release banned.
- The codex skill triggers on a Codex model's short name (Astra, Sol, Terra, Luna, and the Russian forms). Why:
  «отправь хай терре» did not load the skill; the coordinator read the name as an addressee and asked.
- `<DIR>` is one per launch, a relaunch included. Why: step 1's redirects overwrite `err.txt` and `out.json`, and a
  relaunch in the same directory lost the refused run's stderr (measured 2026-09-17).
- The orchestrate page has every Codex agent below the top row carry an `EFFORT:` line chosen for its work instead
  of inheriting the configured one. Why: two Luna read agents at an inherited `xhigh` took 480 and 557 seconds and
  1.2M and 2.3M tokens for a ledger and a grep task (measured 2026-09-17).

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
  therefore changed, and the upgrade recipe's schema-baseline commit is now `12c620a`.
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
  generated tree stays in history at commit 12c620a, and README › After a codex upgrade diffs the next
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
