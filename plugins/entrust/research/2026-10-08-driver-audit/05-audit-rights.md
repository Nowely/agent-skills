# Audit D: rights, sandboxing and approvals across the three drivers

At `8b518fc` (entrust 0.27.0), read-only. Paths are under `plugins/entrust/plugin/skills/` unless they say
otherwise. Runs used the suites' fakes only; the scratch scripts named below sit in `/tmp/audit-d-rZfAm4/`
and are quoted in [Defects](#defects-found-in-passing) closely enough to recreate.

## Verdict

The suspicion is partly right. The core is proportionate and does real work: one `RIGHTS` grammar
resolved against the registered plan in `drivers.mjs` (about 50 lines), each CLI's own enforcement, and a
mailbox whose accepts must restate the command byte for byte. The problem is where everything else goes.
Codex alone carries about 1,000 lines of guards: a 357-line write lock with a reclaim protocol, a 62-line
root guard that walks inodes, mailbox ownership and location rules, and checks on the sandbox's reported
effect. It adds 41 lock test cases and a 72-line lock page. OpenCode and Claude face the same threats with
3 lines or none. Most of that attention went to filesystem races between runs that follow the rules, not to
the paths a delegated agent is most likely to take. Three such paths are open today:

- An OpenCode agent whose write root contains the state directory can approve its own requests
  (reproduced).
- A Codex `WRITABLE:` line widens past a registered plan (reproduced).
- A Codex read agent can read any file and send it over the network without raising a request (egress is
  on by default).

The inventory's "rights" area (495 lines) also counts about 200 lines that are not rights: the isolated
Codex home, config inheritance and the managed web-search policy. The Codex rights proper is about 300
lines, roughly 6% of the driver.

What pays:
- Cut the lock to a shared lock of about 50 lines that also covers overlapping roots.
- Move the root and mailbox guards into one shared check used by all three adapters.
- Drop the Codex mailbox ownership claim, which duplicates the launcher.
- Give the three adapters one mailbox writer with one rule: record the decision, then answer.
- Spend part of the saving on the gaps: the plan pins every write root and egress, and every driver checks
  the effect its CLI reports back.

## Ledger

Lines are code / page text. Page text includes help output and references, and excludes the CHANGELOG.

| Mechanism | Where | Lines | Threat (a real path to harm) | Already stopped by | Verdict |
| --- | --- | --- | --- | --- | --- |
| `RIGHTS` grammar, plan pin of writes and model | `orchestrate/scripts/drivers.mjs:50-102` | 53 / ~15 | the coordinator declares rights wider than the user approved | nothing else | **keep**; extend it to `WRITABLE:` (D2) |
| Codex sandbox request (read profile; workspace-write keys) | `codex/scripts/driver.mjs:2554-2648` | ~45 / 31 (SKILL Rights) | the agent writes outside its grant | this is the OS sandbox's invocation | **keep** |
| Check of the sandbox the server reports | `codex/scripts/driver.mjs:2398-2479` | 63 / — | a misspelt key drops a grant; an unsent key leaves `/tmp` writable, and on Linux `/tmp` holds the state directory and mailboxes | nothing (`--strict-config` misses it, `:2380-2386`) | **keep**, as one table comparison |
| `checkRoot`: home and its ancestors, `~/.codex`, state directory, by inode | `codex/scripts/driver.mjs:1041-1105`, `:1195` | 52 / 17 + 10 incidents | a grant of `~`; a forged receipt; a forged decision or lock | Claude: 3-line overlap check `claude/scripts/driver.mjs:152-155`; OpenCode: **nothing** | **merge** into one shared check |
| Write lock, owner file, reclaim marker, identity, group liveness | `codex/scripts/driver.mjs:1515-1860` | 234 code + 114 comment / 72 + 10 incidents; 41 of 72 lock-suite cases | two writers in one tree | the plan's one-owner rule (`orchestrate/references/plan.md:5`, `opencode/SKILL.md:92`); OpenCode and Claude have no lock; nested and `--writable` overlaps are not covered (run below) | **replace** with a ~50-line shared lock |
| Isolated `CODEX_HOME`, inherited config | `codex/scripts/driver.mjs:1221-1314`, `:1429-1513` | ~140 / 23 + 8 | the caller's plugins, skills and MCP servers steer the turn; trust records pile up | — | keep; **not a rights mechanism** |
| Managed web-search policy | `codex/scripts/driver.mjs:1316-1365` | ~40 / — | the server silently substitutes a mode | — | keep; a capability, not a right |
| Worktree ledger, harvest, disposal | `codex/scripts/driver.mjs:1968-2366` | 279 / 35 | lost work, orphaned trees | OpenCode and Claude: a 10-line `makeWorktree`, no ledger (E139) | lifecycle, not rights (auditors A, C); its rights part, `checkRoot` on the repository and on the destination three times, **merges** with the shared check |
| `GIT_SAFE` on the driver's own git | `codex/scripts/driver.mjs:1872-1884` | 6 / 13 + 9 | hooks or fsmonitor an agent planted run under the driver's git with the caller's rights (measured, `codex/references/incidents.md:118-125`) | nothing; the shared `git()` in `drivers.mjs:124-127` lacks it | **keep**; extend to the shared helper |
| `coveredByRights`: auto-accept of an in-root file change | `codex/scripts/driver.mjs:3026-3071` | ~35 / ~5 | none of its own: the edit tool asks on spelling, and the server writes an approved patch *outside* the sandbox, so the symlink walk is the guard | the sandbox would allow the same bytes by shell | keep (small) |
| Auto-decline of a file change outside the roots | Codex `:3043`, `:3394-3396`; OpenCode `outOfScope` `opencode/scripts/driver.mjs:215-230` | ~20 / ~5 | a grant made mid-run that no rights line made | the same write by shell is offered anyway; Claude offers it | **merge** into one rule |
| Mailbox location rules | Codex `claimMailbox` `:3234-3265`; Claude `:286`; launcher `--new` | 30 / 10 | the agent writes a decision into its own mailbox | no root may overlap the state directory (row above); the launcher puts the box there | **merge** into one line: inside the state directory |
| Mailbox owner claim (`owner.json` by link(2), checked before every write) | `codex/scripts/driver.mjs:3267-3290`; calls `:3092`, `:3112`, `:3157` | ~25 / 3 | two drivers share one mailbox | the launcher's one-launch-per-directory claim on `err.txt` (`orchestrate/scripts/agent-run.mjs:437-441`) | **drop** |
| Claude deny rules on the mailboxes | `claude/scripts/driver.mjs:164-174` | 9 / 2 | an edit or a redirect into a mailbox | the root may not overlap the state directory, so such an edit prompts | keep (cheap) |
| OpenCode session permission rules | `opencode/scripts/driver.mjs:188-213`, `:991` | 22 / ~5 | an edit outside scope; a command run unasked | no OS sandbox. V2's handler ignores session rules (`opencode/references/parity.md:62`); whether V1 enforces them is not measured anywhere in the repo (the fake echoes them, `evals/fake-opencode.mjs:60`) | keep; **check what the server echoes back**, and measure V1 once |
| Claude flags (mode, tools, prompt tool) | `claude/scripts/driver.mjs:177-191` | 13 / ~20 | an edit outside scope; a command run unasked | Claude Code's permission system, but the user's own allow rules apply (`claude/references/external.md:35-36`) | keep; measure the Bash sandbox (F7) |
| Mailbox writers, three of them | Codex `:3073-3232`; OpenCode `:233-437`; Claude `approvals.mjs` | 160 + ~150 + 100 / codex `approvals.md` 52, opencode `interactions.md` 57, internals 41, Claude 9, orchestrate 14 | a request nobody sees; an accept with no record | — | **merge** into one module and one page |
| `--pending` / `--decide`, the restated accept, field escaping, typed requests | `orchestrate/scripts/agent-run.mjs:360-405`, `:676-805`; `typedRequest` in `opencode/scripts/launch.mjs:57-92` and `claude/scripts/launch.mjs:163-177` | ~200 + 55 / ~45 help | a command approved without being seen; a command whose text forges fields; a command line equal to the heredoc delimiter that runs in the coordinator's shell; the host's classifier judging an id instead of a command | nothing else | **keep** |
| Decision bound to id, pid, start, turn and hash | launcher `:362-367`; Codex `:3174-3185`; OpenCode `contract.mjs:218-223`; Claude `approvals.mjs:59-61` | ~15 / — | a stale or foreign decision is taken | one launch per directory; random ids | keep (cheap) |
| A resume may not widen its rights | `drivers.mjs:116-122`; OpenCode `:947-948`; Claude `:129-134` | ~15 / — | a resumed session with wider rights | a fresh launch can do the same; Codex allows the widening (`codex/references/incidents.md:194-197`) | **drop** (the plan pin binds a planned continuation) |
| 30-minute deadline; no mailbox means decline | all three | ~10 / ~6 | a run waiting forever; an accept nobody gave | — | keep |
| Egress | Codex `:837-842`, on at both levels by default; OpenCode: webfetch and bash ask; Claude: no web tools, `curl` asks | — | prompt injection → read a secret → send it out | **nothing, for Codex** | **add it to the rights** (F4) |

## Analogues

| Tool | How it bounds a delegated agent | What it guarantees | Source |
| --- | --- | --- | --- |
| Claude Code subagents | `tools` / `disallowedTools` narrow the inherited tools; `permissionMode` (inherited unless the parent is in `default`, `dontAsk` or `plan`); the parent's rules apply; prompts pass through to the user | a tool the agent lacks cannot be called; anything not pre-approved prompts the human; `isolation: worktree` is "an isolated copy", not a permission boundary | https://code.claude.com/docs/en/sub-agents |
| Claude Code permission modes (including `-p`) | Manual (`default`) "reads only"; `acceptEdits` adds edits and `mkdir`/`touch`/`rm`/`mv`/`cp`/`sed`, inside the working directory only; `dontAsk` denies whatever would prompt; protected paths are never auto-approved; deny rules hold in every mode | one mode plus rules decides every call; no wrapper-side re-check | https://code.claude.com/docs/en/permission-modes |
| Claude Code Bash sandbox | OS-enforced writes limited to cwd, a per-user temp directory and added directories; a network domain allowlist; `allowUnsandboxedCommands: false` closes the retry escape; in a linked worktree, commits work while `.git/hooks` and `config` stay denied | writes and egress bounded by the OS whatever the allow rules say; the `.git` grant the codex page calls unsayable (`codex/references/environment-and-internals.md:399-400`) is said here | https://code.claude.com/docs/en/sandboxing |
| Claude Agent SDK | hooks → deny → ask → mode → allow → one `canUseTool` callback; `dontAsk` turns the callback into a deny | a single callback decides everything the rules leave open: the shape of entrust's mailbox, with no file protocol | https://code.claude.com/docs/en/agent-sdk/permissions |
| `codex exec` / app-server | `--sandbox read-only\|workspace-write\|danger-full-access`; approval policies `untrusted`/`on-request`/`never`; `sandbox_workspace_write.writable_roots`; network off by default in workspace-write | an OS sandbox bounds every command; `on-request` escalates past it | https://developers.openai.com/codex/concepts/sandboxing, https://developers.openai.com/codex/noninteractive (read through the search index; this environment's proxy refuses the host) |
| OpenCode `permission` | `allow`/`ask`/`deny` per tool and pattern, the last match wins; most keys default to allow; `external_directory` and `doom_loop` ask; per-agent rules | a tool-level gate only: the docs describe no OS sandbox | https://raw.githubusercontent.com/sst/opencode/dev/packages/web/src/content/docs/permissions.mdx (source of opencode.ai/docs/permissions) |
| GitHub Copilot coding agent | an ephemeral Actions environment; a firewall on by default "to manage data exfiltration risks"; pushes to `copilot/` branches only; review before merge | containment by environment and branch, with egress closed by default | https://docs.github.com/en/copilot/how-tos/use-copilot-agents/coding-agent/customize-the-agent-firewall (search index; host refused here) |
| aider | no sandbox; asks before shell commands; a git commit per edit; `/undo` | reversibility rather than confinement | https://aider.chat/docs/git.html |

Each analogue relies on one enforcement layer (the CLI's own mode and rules, or the OS sandbox) and one
approval callback. None re-checks its own sandbox in userland, locks directories against its own peers, or
claims ownership of its approval channel. The one thing the analogues spend on and entrust does not is
egress: the Codex default, the Copilot firewall and the Claude Code sandbox each close or allowlist the
network.

## Findings

**F1. The lock is the largest rights-adjacent mechanism, and it guards the narrowest case.**

- *Evidence.*
  - Code: 234 code and 114 comment lines (`codex/scripts/driver.mjs:1515-1860`), taken for `--level write`
    only (`:2608`) and keyed on the cwd's own dev:ino (`:1711`, `:1717-1722`). Page:
    `codex/references/environment-and-internals.md:307-378`, 72 lines. Tests: 41 of the 72 cases in
    `evals/lock.test.mjs`. `cleanup/scripts/cleanup.mjs:34` imports its predicates.
  - The guarded harm is two agents editing one tree: a coordination error, recoverable from git. The plan
    already forbids it ("Give each deliverable one owner", `plan.md:5`; "Each concurrent writer gets a
    distinct worktree", `opencode/SKILL.md:92`). OpenCode and Claude have no lock at all.
  - Run (`nested.mjs`, fake app server). Same cwd: the second writer exits 10. A subdirectory cwd: both
    exit 0. Another cwd with `--writable` set to the tree: both exit 0.
  - The "stale-lock stampede" that justified the reclaim marker (`incidents.md:224-227`) was 8 contenders
    on a planted lock. In real use it takes a crash, a coordinator error and simultaneous starts, all three.
- *Cost.* About 350 driver lines, 72 page lines, 41 cases, the coupling to cleanup, and E114.
- *Proposal.* One lock in `drivers.mjs`, used by all three adapters:
  - Each holder writes a file with a unique name, `<state>/locks/<hash>.<random>.json`, holding
    `{pid, identity, pgid, roots}`.
  - After creating it, the holder scans the other lock files. If any live holder's roots overlap its own
    (either contains the other), it removes its file and exits 10.
  - A dead holder's file (pid gone or its identity changed, and its group gone) is unlinked. Its name is
    unique, so no fresh lock can be lost that way.
  - No reclaim marker, no owner-file link, no update through a descriptor, no test seams. About 10 shared
    cases replace the Codex ones.
- *Gain.* About 300 lines fewer. OpenCode, Claude, nested roots and `--writable` roots become covered.
- *Risk.* The on-disk shape changes, so `cleanup.mjs` has to be reworked, and during an upgrade an old
  driver and a new one do not see each other's locks. Two overlapping writers that start in the same instant
  may both refuse (exit 10); that is the safe direction.
- *Confidence.* High on the evidence; medium on the replacement's size.

**F2. Mailbox integrity rests on one invariant that two of the three adapters enforce.**

- *Evidence.*
  - In every adapter a decision is any file in the mailbox that carries the identity the request already
    shows (`opencode/scripts/contract.mjs:218-223`, `claude/scripts/approvals.mjs:59-61`,
    `codex/scripts/driver.mjs:3174-3185`). So the only protection is that no agent can write its mailbox.
  - Codex enforces that three times: `checkRoot` (`:1078-1103`), `claimMailbox` (`:3234-3265`) and
    `excludeSlashTmp` (`:2437-2438`). Claude enforces it twice: `scopeOf` (`:152-155`) and its deny rules.
    OpenCode does not enforce it at all (`opencode/scripts/driver.mjs:925-936`).
  - Run `forge.mjs`: D1.
- *Cost.* Codex spends 62 + 45 lines; OpenCode is exposed.
- *Proposal.* One `checkWriteRoots(roots, stateDir, protected)` in `drivers.mjs`, called by each driver at
  `--check-prompt-file` and at launch. It walks inodes in both directions over the state directory, `$HOME`
  and its ancestors, and any adapter-supplied directory (Codex: `~/.codex`). The run's own tree under
  `<state>/worktrees` is exempt. The rule "the mailbox lies inside the state directory" stays, as one shared
  line.
- *Gain.* Closes D1; about 80 lines fewer.
- *Risk.* OpenCode and Claude start refusing `write ~`, `write /` and any root above the state directory,
  which is the right outcome.
- *Confidence.* High.

**F3. `WRITABLE:` escapes the plan pin.**

- *Evidence.* D2. The pages ask the coordinator to settle each `WRITABLE:` root with the user
  (`codex/SKILL.md:80-83`), but a plan row's writes hold one directory (`orchestrate/scripts/agent-run.mjs:157`),
  so nothing records the settlement.
- *Cost.* The pin `drivers.mjs:71-73` promises does not hold for extra roots.
- *Proposal.* A plan row's writes take a list, `write <dir> [<dir> …]`, and `resolveRights` checks every
  root against it. Alternatively, refuse `WRITABLE:` under a registered plan. About 5 lines.
- *Gain.* The plan becomes the one record of what may be written.
- *Risk.* A plan that relied on adding `WRITABLE:` after approval must now list the root.
- *Confidence.* High.

**F4. The most plausible harm path, reading and then sending, is unguarded for Codex.**

- *Evidence.*
  - A Codex read agent may "read any readable path, reach the network, run commands" without raising a
    request (`codex/SKILL.md:73`), and egress is on at both levels by default (`codex/scripts/driver.mjs:837-842`).
  - In OpenCode, bash and webfetch ask (`opencode/scripts/driver.mjs:192-198`). An external Claude agent
    has no web tools, and `curl` is outside the read-only set, so it asks (`claude/scripts/driver.mjs:28`,
    `external.md:34`).
  - A delegated agent reads untrusted text: the repository, its issues, pages it fetches. So injection →
    read a secret → send it out is the likeliest harm, and it bypasses the mailbox entirely. None of the
    roughly 1,000 lines of Codex guards touches it.
  - Codex's own default, the Copilot firewall and the Claude Code sandbox each close egress or allowlist
    it (Analogues).
- *Cost.* One flag default, plus page lines.
- *Proposal.* Make egress a right that the plan row pins like writes. The plan card already carries
  "network constraints" (`plan.md:22`). Default to no egress for read agents at least; a command that needs
  the network then raises a request in the mailbox.
- *Gain.* Closes the one path that skips approvals.
- *Risk.* A behaviour change: read agents that install packages or fetch documentation raise requests or
  fail. Egress-on was the owner's deliberate choice, for parity with Claude subagents (`:837-839`), so this
  is the owner's decision to make.
- *Confidence.* High on the gap; medium on the default.

**F5. Three mailbox writers settle in two different orders.**

- *Evidence.*
  - Codex writes the settlement before an accept goes out, and declines if it cannot write it
    (`codex/scripts/driver.mjs:3150-3169`). `codex/references/approvals.md:47-50` tells the coordinator to
    rely on that record.
  - Claude swallows the write failure and answers allow anyway (`claude/scripts/approvals.mjs:63-71`,
    `:94-97`): D3. OpenCode answers the server first and records afterwards
    (`opencode/scripts/driver.mjs:360-369`).
  - The file protocol is identical across all three: `request.json`, `pending`, `decision.json`. Five
    pages tell the same procedure (Ledger).
- *Cost.* About 410 code lines and about 170 page lines for one protocol.
- *Proposal.* One shared mailbox module covering offer, poll, record-then-answer, the deadline and the
  `pending` rewrite. Each adapter supplies only how to answer its CLI; OpenCode's session-wide rejection
  (`:271-302`) stays its own. One page, in orchestrate, describes the procedure.
- *Gain.* About 150 code lines and about 80 page lines fewer. The record-before-accept rule holds in every
  adapter, and the poll interval (250 ms against 500 ms) is one number.
- *Risk.* A regression in a security path; port the three adapters' approval cases to the shared module
  first.
- *Confidence.* Medium.

**F6. The same act has three different outcomes.**

- *Evidence.*
  - A file-tool write outside the roots: Codex declines it at once (`:3043`, `:3394-3396`), and so does
    OpenCode (`:217-230`, `:421-434`); Claude offers it to the coordinator (`approvals.mjs:47-55`).
  - A resume with wider rights: Codex allows it, OpenCode and Claude refuse it (Ledger).
  - A read agent's commands: Codex runs them freely inside its sandbox; OpenCode asks for every command
    (`:198`); Claude runs its read-only set, asks for the rest, and lets the user's allow rules through.
- *Cost.* The coordinator has to know which adapter it is calling, against brief ask 2.
- *Proposal.* One rule: anything outside the rights becomes one request, whatever the tool. Drop
  `OUTSIDE_WHY` and `outOfScope`, so file writes outside the roots are offered like commands. A resume
  declares its rights like any run, so drop `scopeWithin`. Read agents' commands cannot be made equal
  (OpenCode has no OS sandbox); say that once, on the shared page.
- *Gain.* About 35 lines fewer, and one rule for the coordinator.
- *Risk.* Slightly more requests reach the coordinator. Out-of-root file writes are rare: none of the 37
  declined requests measured before 0.21.0 was one (`CHANGELOG.md:590-593`).
- *Confidence.* Medium.

**F7. Only Codex checks that the rights it asked for took effect.**

- *Evidence.*
  - Codex compares the sandbox the server reports with what it asked for (`:2398-2479`).
  - Claude records `init.permissionMode` in its report (`claude/scripts/driver.mjs:386`) but never compares
    it.
  - OpenCode sends its session rules (`:991`) and never reads them back. For V2 the pinned handler ignores
    them (`opencode/references/parity.md:62`). For V1, enforcement is unmeasured.
  - Claude's read agents run the user's own allow rules without asking (`external.md:35-36`).
- *Cost.* A claimed right that is not shown to apply.
- *Proposal.*
  - Each driver checks the effect its CLI reports: Claude, the permission mode and tool list from `init`;
    OpenCode V1, the session's permission rules read back; Codex, one table comparison in place of two
    functions.
  - Measure once that OpenCode V1 enforces session rules.
  - Measure Claude Code's Bash sandbox, `--settings '{"sandbox":{"enabled":true,"allowUnsandboxedCommands":false}}'`,
    as an OS layer under Claude agents. It would bound their writes whatever the user's allow rules say.
- *Gain.* The rights the drivers claim are shown applied.
- *Risk.* The Claude sandbox is unavailable on native Windows, and the measurement costs a little.
- *Confidence.* Medium; low for the Claude sandbox.

**F8. The Codex mailbox owner claim duplicates the launcher.**

- *Evidence.* Codex claims `owner.json` by link(2) and checks it before every write (`:3267-3290`, used at
  `:3092`, `:3112`, `:3157`). `claimMailbox` adds rules about subdirectories and other agents' temp
  directories (`:3248-3262`). The launcher already allows one driver per directory, through its exclusive
  `err.txt` claim (`agent-run.mjs:437-441`), and makes a fresh mailbox at every `--new`. Claude and OpenCode
  have neither rule and do not need one.
- *Proposal.* Drop both, and keep "inside the state directory".
- *Gain.* About 45 code lines and about 8 page lines (`environment-and-internals.md:91-101`) fewer.
- *Risk.* A caller who runs the Codex driver by hand with another run's `--approval-dir` is no longer
  refused. That is not a supported caller.
- *Confidence.* High.

**F9. What earns its place, and stays.**

- *The plan pin* (`drivers.mjs:74-102`).
- *The restated accept*: a heredoc on a delimiter the coordinator builds fresh, plus field escaping
  (`agent-run.mjs:398-405`, `:757-772`). It stops a command line equal to the delimiter from running in the
  coordinator's shell, and it makes the host's own classifier judge the command rather than an id.
- *Decision binding.*
- *`GIT_SAFE`*, which a measured attack justifies. Extend it to the shared `git()` that OpenCode and
  Claude use (`drivers.mjs:124-127`), at the cost of one line.
- *The symlink walk in `coveredByRights`*, because an approved patch is written outside the sandbox.
- *The sandbox-effect check.*
- *The 30-minute deadline, and decline when no mailbox exists.*

## Minimal model (one model for all three adapters)

```
GRAMMAR, first line, pinned field by field by the plan row when a plan is registered
  RIGHTS: read [dir] | write <dir> [<dir> …] | worktree <repo>     WRITABLE: folds into write
  NETWORK: yes | no                                                 a right; default no for read
  A resume declares its rights like any run; the plan pin binds a planned continuation.

SHARED CHECKS, drivers.mjs, at --check-prompt-file and again at launch
  1 resolveRights: every root and NETWORK equal to or inside the plan row's; roots canonical.
  2 checkWriteRoots: refuse a root that is, contains, or lies inside the state directory,
    $HOME or any ancestor of it, or an adapter's protected directory (Codex: ~/.codex);
    compared by dev:ino; the run's own <state>/worktrees/<name> is exempt.
  3 The mailbox lies inside the state directory.
  4 One writer per tree: <state>/locks/<hash>.<random>.json {pid, identity, pgid, roots};
    create it, then scan; a live holder with overlapping roots → remove ours, exit 10;
    a dead holder's file (pid gone or identity changed, and group gone) is unlinked.
  5 Every git the driver runs carries core.fsmonitor=false, core.hooksPath=/dev/null, diff.external=.

ENFORCEMENT: the CLI's own layer, then check the effect it reports
  Codex     read: :read-only plus $TMPDIR; write: workspace-write, the roots, /tmp excluded;
            network per NETWORK. Compare thread/start's sandbox with one expected object.
  Claude    read: manual mode, Read/Grep/Glob/Bash; write: acceptEdits in the root; Edit denied
            on the mailboxes; [measure: Bash sandbox, allowUnsandboxedCommands false].
            Compare init's permissionMode and tools.
  OpenCode  session rules (V1) or the verified native profile (V2); no OS sandbox, so every
            bash command asks. Compare the session's echoed rules with those sent.

APPROVALS: one rule, one module, one page
  Anything the rights do not cover is one request in the run's mailbox, whatever the tool.
  The driver itself answers only a Codex file change that the walk shows inside the roots.
  mailbox.mjs: offer writes <id>.request.json and pending; poll reads <id>.decision.json,
    bound to {id, pid, start, turn, hash}; settle records first, then answers;
    a record that cannot be written answers decline.
  Unanswered for 30 minutes → declined. No mailbox → declined (exit 6 or 7, as now).
  Coordinator: --pending; --decide --accept, restating the presented body in a heredoc
    on a fresh delimiter, or --decline. An accept is once, never "always", and runs as the user.
```

What changes, in total:
- *Code.* About 500 lines fewer: the lock about −300, the root and mailbox guards about −80, the mailbox
  writers about −150, the auto-declines and resume checks about −35. About 120 lines are added: the shared
  lock and check, the plan list, and the effect checks.
- *Pages.* About 150 lines fewer: the lock design 72 → ~8; one approvals page in place of five; one rights
  section in orchestrate, linked from each adapter.
- *Tests.* 41 lock cases → about 10 shared cases; the approval cases are ported once.
- *Risk.* An on-disk change to the lock (cleanup has to follow), more requests reaching the coordinator,
  and the egress default, which is a behaviour change for the owner to decide.

## Defects found in passing

**D1. An OpenCode agent can approve its own requests when its write root contains the state directory.**

- *Where.* `opencode/scripts/driver.mjs:925-936` admits any write root. `:207-210` allows edit and write
  under `<root>/**` without asking. `contract.mjs:218-223` accepts a decision from any writer. Contrast
  `claude/scripts/driver.mjs:152-155` and `codex/scripts/driver.mjs:1078-1103`, which refuse such a root.
- *How it arises.* The default state directory is `<tmp>/entrust-state`, so `RIGHTS: write /tmp` on Linux,
  `write $TMPDIR`, `write /`, or any root above `ENTRUST_STATE_DIR` qualifies.
- *Reproduce* (`forge.mjs`). With `ENTRUST_STATE_DIR=<R>/state`, a prompt `RIGHTS: write <R>` passes the
  OpenCode `--check-prompt-file` (exit 0), while Claude refuses it ("overlaps the state directory"). Then run
  the OpenCode driver against `fakeOpenCode("permission")` with `--approval-dir <R>/state/inv/approvals`.
  When the request file appears, write `{id, run, requestHash, remote, decision: "accept"}`, copied from it,
  straight into `<id>.decision.json` without `--decide`. Observed: the session rules sent were
  `edit|write <R>/** allow`; the fake server received `{"reply":"once"}`; the request was settled
  `accepted` `by: coordinator`; the driver exited 0.

**D2. Under a registered plan, `WRITABLE:` widens a Codex agent past the plan's writes.**

- *Where.* `codex/scripts/driver.mjs:815-822` checks only `RIGHTS` against `ENTRUST_PLAN_WRITES`, and
  `:867` and `:2612` grant every `WRITABLE:` root.
- *Reproduce* (`writable.mjs`, fake app server, `ENTRUST_PLAN_WRITES="write A"`). `RIGHTS: write B` is
  refused, exit 2, "widens past the approved plan write". `RIGHTS: write A` plus `WRITABLE: B` passes
  `--check-prompt-file` with exit 0, the run exits 0, and the report shows
  `sandbox.writableRoots: [B]`.

**D3. Claude's approval server answers allow when the settlement cannot be recorded.**

- *Where.* `claude/scripts/approvals.mjs:63-71` swallows the write failure, and `:94-97` then answers
  allow. The launcher's `approvals=` count then shows nothing accepted, although a command ran with the
  user's rights, which `codex/references/approvals.md:47-50` tells the coordinator to rely on. OpenCode
  answers before it records (`opencode/scripts/driver.mjs:360-369`), the same class of defect.
- *Reproduce* (`settle.mjs`). Start `approvals.mjs` with `ENTRUST_APPROVAL_DIR` set and send one
  `tools/call` for `Bash` `touch /x/y`. When `<id>.request.json` appears, replace it with a directory of the
  same name, then write a fitting `decision.json`. Observed: `{"behavior":"allow",…}` was sent, and no
  settlement exists.

**Not a defect, for the record.** `evals/lock.test.mjs` ran 66 of its 73 cases ok in this container (2 skipped). Every
root-guard, sandbox-assertion and lock-acquire case passed; the 5 failures are process-group sweeps, which `CHANGELOG.md:78-80`
already records as failing in a container running as root.
