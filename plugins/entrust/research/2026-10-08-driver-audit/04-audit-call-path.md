# Audit C: the call path, and whether it can be one shape

At `50c66c2` (entrust 0.27.0 plus the audit's brief). Read-only. Runs were offline, in `/tmp/auditC`, on
`evals/fake-claude.mjs` and the drivers' own `--check-prompt-file`; no real `codex`, `opencode` or `claude` ran.
The three suites are green: `agent-run` 55/55, `claude` 19/19 (live case skipped), `agent-contract` 13/13.

## Verdict

The code already has one call path. After `--new`, every mode of the launcher works out the adapter from
`agent/backend.json`, whichever entry script runs it. Under a plan, the row already names the adapter, the model
and the writes, and the nine status lines and the mailbox are the same for all three backends. What the
coordinator has to know per adapter is mostly accidental, and most of it is in the pages, not the code:

- The call steps (the Agent message, reading the status lines, deciding, the poll, the result table) are written
  once, on the Codex page. The Claude and OpenCode pages send the reader there, or say nothing.
- Three RESUME forms, two defaults for RIGHTS and OUTPUT_SCHEMA, three spellings of a boolean, and three
  wall-clock defaults turn one prompt template into three.

The smallest unification has three parts:

- One shared page holds the call.
- `--new` takes the adapter from the plan row, and prints the relay's message ready to paste.
- All three drivers accept `RESUME: <report path>`, the five-field default schema and `ALLOW_NO_COMMANDS: yes`.

None of this touches the driver contract. On the proxy: keep both, because the two hosts handle messages
differently. Keep the Claude Code relay a dumb Haiku relay, and do not have it read the adapter's skill. That
reading is for composing the prompt and reading the result, which the relay never does. It would roughly double
the relay's context for every agent, and a small model that is given rules is the failure the incidents
recorded. The pasted steps are justified by one measurement of three runs against three, seven weeks old, and
the two copies have since drifted apart. Generate the message from one source, and measure again before
dropping the paste. Along the way I found one real defect: the agent's directory comes from the relay's
working directory, not the coordinator's.

## What a coordinator must know per adapter today

All page sizes are in words.

| Point | Codex | OpenCode | Claude (external) | Kind |
| --- | --- | --- | --- | --- |
| Pages read to call, in Claude Code | `codex/SKILL.md` 2,982 + `orchestration.md` "whole" 2,255 + `approvals.md` 583, and `--help` 1,992 | `SKILL.md` 1,161 + `orchestration.md` 493 + `interactions.md` 609; the relay's message is on no OpenCode page | `claude/SKILL.md` 703 + `external.md` 833, then codex's "One call" and codex's `approvals.md` | accidental |
| Entry script at `--new` | `codex/scripts/agent-run.mjs` | `opencode/scripts/agent-run.mjs` | `claude/scripts/agent-run.mjs`; after `--new`, any entry works, or orchestrate's own | accidental |
| `RIGHTS` missing, no plan | read, in the current directory | refused | refused | accidental |
| Where the body starts | at the first non-field line, or at `TASK:`/`CHECK:`/`RETURN:` | `TASK:` required | `TASK:` required | accidental |
| `MODEL:` | astra / sol / terra / luna, or a slug | provider/model, or `inherit` | opus / sonnet / haiku / fable, or a `claude-…` id | essential; under a plan it can be left out in all three (already unified) |
| `EFFORT:` | the catalogue's set, `ultra` included | an alias for `VARIANT` | low … max | essential |
| `OUTPUT_SCHEMA` default | none; `answerJson` only when the line is given | five-field | five-field | accidental |
| "A command must have run" gate | exit 5 unless `ALLOW_NO_COMMANDS` or `EXPECT` | the same | no gate; `ALLOW_NO_COMMANDS` refused | accidental |
| Boolean values | yes / true / 1, no / false / 0 | `yes` only | `yes` only | accidental |
| Fields of its own | `NETWORK`, `WEB_SEARCH`, `WRITABLE`, `BRIEF` | `VARIANT`, `API_FAMILY`, `AGENT`, `BRIEF` | `SAFE_MODE` | essential |
| `RESUME:` | a thread id, or `last` | a session id, an absolute report path, or `last` | an absolute report path | accidental |
| Rights on a resume | set per call, so a resume may widen them | may not widen | the same kind, and a `RIGHTS` line is still needed without a plan | accidental |
| Default wall clock (the launcher passes none) | none; idle 900 s | 1800 s; idle 600 s | 1800 s; no idle bound | accidental |
| Status lines | nine; model shown as Astra… | nine; model as the report wrote it | nine; model shown as Opus… | already unified |
| Report fields to read | no `adapter`, `error`, `rights` or `requestedModel`; usage is `tokenUsage` | the shared fields, plus `usage` and `cost` | the same as OpenCode | accidental |
| Worktree result | `worktreeDiffPath` / `UntrackedPath` / `CommitsRef`, with a ledger | `worktreePath`, `base`, `diff` inline, `untracked` | the same as OpenCode | the ledger is a real difference; the field names are accidental |
| Kinds of approval request | command | `opencode.permission`, `opencode.question` (answered with `--answer`) | command, `claude.permission` | essential; one decide procedure already serves all |
| Which page says how to decide | codex `approvals.md` | `interactions.md` | points to codex `approvals.md` | accidental |
| Continuation | the thread id, which the status lines do not show | the `REPORT=` path | the `REPORT=` path | accidental |
| Agent call `description` | "Codex \<Short\> \<id\>: …" | not stated for Claude Code | not stated | accidental |
| Agent call message | the four steps, on the codex page | none given | "codex's four steps, with this adapter's path" | accidental |
| Background DONE/ASK poll | codex `orchestration.md:81` | not stated | not stated | accidental |

## Findings

### 1. The launcher already routes every call by the backend; only `--new` asks for the adapter

- **Category:** unification. **Confidence:** high.
- **Evidence:**
  - Each launcher mode reads the adapter back from `agent/backend.json` (`agent-run.mjs:98-108`, `:668-670`,
    `:928`).
  - Run: I made a prompt with orchestrate's shared launcher (`--new --adapter claude`), then ran it through the
    **codex** entry script. That ran the Claude driver and printed `model=Haiku`. `--status` through the shared
    launcher, with no adapter named, also worked.
  - The OpenCode entry refused the same directory: "this invocation belongs to claude, not opencode".
  - Under a plan whose row is `C1 | claude | …`, `--new` without `--adapter` is refused at `:922-923`. The codex
    entry is refused with "C1 belongs to adapter claude, not codex" (`:609`).
- **Cost:** each page has to name its adapter's own entry script. The coordinator has to repeat the row's
  adapter by choosing the right script. The three entry scripts (48 lines) and the `FALLBACK`/`ENTRY` code exist
  only for that.
- **Proposal:**
  - When a plan holds the report, `--new` takes the adapter from the plan row. `--adapter <id>` is needed only
    without a plan.
  - The pages name one path, `orchestrate/scripts/agent-run.mjs`.
  - The three entry scripts stay, as aliases.
- **Gain:** under a plan, no command the coordinator writes names an adapter.
- **Risk:** low. The page pins in `agent-contract.test.mjs` move, since the codex page names
  `${CLAUDE_SKILL_DIR}/scripts/agent-run.mjs`.

### 2. The call steps live on the Codex page, and the other two point there or say nothing

- **Category:** unification. **Confidence:** high.
- **Evidence:**
  - `claude/references/external.md:50-52` says the Agent message is "the four steps of the codex adapter's one
    call". `:58` says to decide command requests "as the codex adapter's approvals say".
  - `opencode/SKILL.md:85-86` gives a Claude Code coordinator no message at all.
  - Several parts are written for Codex agents but apply to all three in Claude Code:
    - the run directory (`codex/references/orchestration.md:37-40`);
    - the poll (`:81`);
    - the result table (`:96-109`);
    - the deciding rule (`:124-126`).
  - In all, the call-path text is about 4,800 words: codex `SKILL.md` 1,066, its `orchestration.md` 1,294, its
    `approvals.md` 583, `external.md` 331, `opencode/SKILL.md` 388, plus `interactions.md`,
    `orchestrate/references/proxy.md` 531 and `agents/proxy.md` 309. Much of it is the same mechanics told per
    adapter.
- **Cost:** to call an external Claude agent, a coordinator reads its own two pages and then the Codex page,
  which runs the Codex status script as it loads (E103). Calling Codex under orchestrate costs about 5,800 words,
  plus a 12.8 KB `--help`.
- **Proposal:**
  - Write one page, `orchestrate/references/external.md`, of about 900 words. It holds the prompt core, `--new`,
    the Agent call or the operational proxy, the status lines, the waiting result and the decision, continuing,
    stopping, and the report core.
  - Each adapter page keeps only its own part: composition, models, its extra fields and its report remainder.
- **Gain:** a Codex call reads about 3,700 words instead of 5,800. A Claude or OpenCode call no longer needs the
  Codex page at all.
- **Risk:** the page pins move. The live fidelity gate should run again, since the block is the part measured
  live.

### 3. RESUME has three forms, and the status lines do not show the one Codex needs

- **Category:** unification. **Confidence:** high.
- **Evidence:**
  - Codex accepts a thread id or `last` (`codex/SKILL.md:108`). OpenCode accepts a session id, a report path or
    `last` (`opencode/scripts/contract.mjs:119-125`). Claude accepts a report path only
    (`claude/scripts/driver.mjs:119-121`).
  - Run: Codex's `--check-prompt-file` passes `RESUME: /abs/report.json` (exit 0). The run would then send that
    path to `thread/resume` as a thread id (`codex/scripts/driver.mjs:4769`). Claude refuses a session id.
  - The nine status lines include `REPORT=` but no thread id (`agent-run.mjs:132`). So continuing a Codex agent
    means opening its report, while the other two continue from the `REPORT=` line alone.
  - `orchestrate/references/main-proxy.md:72` prescribes "RESUME points to the last completed report", which
    Codex cannot take.
- **Cost:** a third template, an extra file read for each Codex continuation, and a refusal that only arrives
  at run time.
- **Proposal:** all three accept `RESUME: <absolute report path>`. Codex reads `threadId` from the report, and its
  worktree record from the job store as now, and refuses a report that is not a finished Codex run, as Claude
  does (`claude/scripts/driver.mjs:122-127`). Thread ids and `last` stay.
- **Gain:** one continuation form, taken straight from the status lines.
- **Risk:** low. The rules for rights on a resume still differ (Codex per call, `incidents.md:194-197`; OpenCode
  no widening, `opencode/scripts/driver.mjs:947`; Claude the same kind). The shared page can only say "a
  continuation keeps its rights" once Codex adopts `scopeWithin`. That decision belongs to auditor D.

### 4. Shared fields that the three drivers parse differently

- **Category:** unification. **Confidence:** high for the differences; medium for the defaults to choose.
- **Evidence (runs of `--check-prompt-file`):**
  - No `RIGHTS` line: Codex passes; OpenCode and Claude refuse with "RIGHTS is required".
  - A prose body with no `TASK:` label: Codex passes; the others refuse with "unrecognized line before TASK".
  - `ALLOW_NO_COMMANDS: true`: Codex accepts it; OpenCode says it "takes only yes"; Claude says "unsupported
    header ALLOW_NO_COMMANDS".
  - The five-field schema is the default in OpenCode and Claude (`contract.mjs:127-146`,
    `claude/scripts/driver.mjs:108-114`). Codex has no default, so `orchestration.md:34` makes the line
    mandatory.
  - Exit 5 for a run with no successful command applies in Codex and OpenCode (`contract.mjs:240-247`), not in
    Claude.
  - `main-proxy.md:70-72` puts `ALLOW_NO_COMMANDS: yes` on every coordinator prompt, so the main-proxy mode could
    not run on Claude.
- **Proposal:** one core grammar.
  - `RIGHTS` comes first, and can be left out only under a plan.
  - Then `MODEL`, `EFFORT`, `OUTPUT_SCHEMA`, `RESUME`, and `TASK:` followed by the body.
  - The five-field schema is the default everywhere; for Codex, in prompt-file mode only.
  - Claude accepts `ALLOW_NO_COMMANDS: yes` and does nothing with it.
  - `yes` works everywhere, and OpenCode also takes true / 1.
- **Gain:** one prompt template, and the main-proxy controls work on every adapter.
- **Risk:** a launched Codex agent outside orchestrate would return five fields instead of prose. If the owner
  values the plain answer, keep Codex's default opt-in.

### 5. The default wall clock depends on the vendor, and nothing tells the coordinator

- **Category:** unification. **Confidence:** high from reading the code; the effect on a real run was not
  measured.
- **Evidence:**
  - Claude has a 1800 s wall clock (`claude/scripts/driver.mjs:30`, `:200`, `:310`).
  - OpenCode has 1800 s wall and 600 s idle (`opencode/scripts/driver.mjs:28-29`).
  - Codex has no wall clock and 900 s idle (`codex/scripts/driver.mjs:78`, `:842`). It dropped its wall clock
    after "Five of seven agents lost to the wall clock" (`codex/references/incidents.md:261-267`).
  - The launcher passes no `--timeout` (`agent-run.mjs:454`), and no Claude or OpenCode field sets one.
  - No page states the 30 minutes. `opencode/references/interactions.md:32-33` calls it "a declared wall
    deadline".
  - Approvals also expire after 30 minutes, and a pending request does not stop Claude's clock. So a request
    offered at minute 10 is cut off at minute 30.
- **Proposal:** one default for all three, Codex's: no wall clock, plus an idle bound that pauses while a request
  waits. State it once.
- **Gain:** an agent's lifetime no longer depends on its vendor.
- **Risk:** Claude would need an idle bound in place of its wall clock. Its event stream is enough to measure
  silence, but this is unmeasured.

### 6. Report core

- **Category:** unification. **Confidence:** high.
- **Evidence:**
  - Fourteen fields are shared (`01-inventory.md`).
  - Codex's report (`codex/scripts/driver.mjs:4314-4433`) has no `adapter`, `error`, `rights` or
    `requestedModel`. It calls usage `tokenUsage`, and carries `answerJson` only with a schema (`:4430`).
  - The worktree fields differ: compare `drivers.mjs` `worktreeFacts` with Codex's ledger pointers.
  - The `commands`, `fileChanges` and `escalations` records have three different shapes.
- **Proposal:** the shared page names a core of about 12 fields. Codex adds `adapter`, `error`, `rights` and
  `requestedModel`; OpenCode adds `resumedFrom`. The rest stays on each adapter's page.
- **Gain:** one "reading the result" paragraph, alongside the status lines, which already make the reading the
  same for all three (`agent-run.mjs:547-586`).
- **Risk:** additive; low.

### 7. Keep two proxies, keep the Claude Code relay dumb, and do not give it the adapter's skill

- **Category:** proxy. **Confidence:** high.
- **Evidence:**
  - The relay's context was measured at 8.2k tokens, against 15.4k for `general-purpose`
    (`codex/references/incidents.md:277-284`; `CHANGELOG.md:1668-1671`). The Codex page plus its orchestration
    reference add about 5,200 words, roughly 7k tokens, for every agent.
  - The skill's content is what the coordinator needs to compose the prompt (rights, model, fields) and to read
    the result. The relay does neither, because it never sees the prompt (`agent-run.mjs:40-41`). So the relay
    reading the skill would spare the coordinator nothing.
  - A small model given room to decide created a directory and ran under rights nobody had granted
    (`incidents.md:73-78`). Haiku paraphrased its instructions when the steps were only in its file
    (`incidents.md:286-292`).
  - A Claude Code subagent cannot send a message in the middle of its call. A request ends the relay's call
    (`agents/proxy.md:24-26`), so the decision is the coordinator's, and the coordinator holds the plan's
    authority. On Codex and OpenCode hosts, the operational proxy decides the requests the task already covers
    (`orchestrate/references/proxy.md:13-21`). The split follows the host's messaging model, not the adapter.
- **Proposal:**
  - (a) `agents/proxy.md` stays: Haiku, Bash only.
  - (b) `--new` also prints the relay's message, already filled in: the four steps with the exact `--run` command
    and `REPORT`, between `MESSAGE<<T` and `MESSAGE>>T`. The coordinator pastes the launcher's output instead of
    copying a block from the Codex page and filling three placeholders.
  - (c) The operational proxy links one decide section on the shared page, not three adapter pages. The Codex
    page it links today is written for Claude Code's wrapper (`codex/references/approvals.md:12-36`).
- **Gain:** the relay's message carries nothing adapter-specific, and no Codex page is needed to call Claude or
  OpenCode.
- **Risk:** a coordinator can paraphrase a printed block just as it can a page block, so this is no worse. `--new`
  prints more lines; `PROMPT=` and `APPROVALS=` stay.

### 8. The pasted steps: justified by one small, old measurement, in two copies that have drifted

- **Category:** proxy. **Confidence:** medium.
- **Evidence:**
  - The only measurement was on 2026-09-17, on Haiku: three of three runs kept the steps when they were in the
    message, one of three when they were only in the agent's file (`incidents.md:286-292`;
    `CHANGELOG.md:1317-1320`). It predates the relay's rewrite and merge in 0.26 (`CHANGELOG.md:134`).
  - `agents/proxy.md:8` says the message "carries one command and a description".
  - Step 3 in the agent's file (`:18-19`) says "a complete pending request included"; the page's step 3
    (`codex/SKILL.md:195`) does not.
  - No suite compares the two copies: `agent-contract.test.mjs:129` pins only the page.
- **Cost:** 926 bytes typed into every Agent call, and two copies to keep equal.
- **Proposal:** keep the paste, but generate it from one source (finding 7b). Make the agent file's body the same
  text, with a test comparing the two. Measure "steps in the file alone" again on today's Haiku before removing
  the paste: about six relay runs, a few cents.
- **Gain:** one copy, resting on a measurement that is current.
- **Risk:** none in keeping it. Removing it without measuring again risks the paraphrasing measured before.

### 9. E102: the relay exists for the agent card

- **Category:** proxy / overcomplication. **Confidence:** low until measured.
- **Evidence:**
  - `ISSUES.md:124-148`: a background Bash task ran 105 minutes, with no ceiling, and the swarm already runs
    agents without a relay.
  - The relay costs:
    - its context, 8.2k tokens;
    - a Haiku turn for every `RUNNING=` rerun;
    - the paste;
    - the "report delivered" line (`agents/proxy.md:20-21`).
- **Proposal:** measure whether Stop on a background Bash task in the current extension reaches the driver. If
  it does, offer a route with no relay in Claude Code. `--run` runs as a background Bash task, with a flag that
  turns off the 570 s early return, since a background task has no ceiling. Each waiting request and each end
  arrives as one notification.
- **Gain:** no relay, no paste, no `RUNNING=` reruns.
- **Risk:** the agent card on the agent map is lost, and that card is the owner's parity test
  (`CHANGELOG.md:1328-1330`).

### 10. The background poll repeats what the relays already report

- **Category:** overcomplication. **Confidence:** medium.
- **Evidence:**
  - `codex/references/orchestration.md:81` adds a background poll of each agent's `exit` and
    `approvals/pending` markers. `:122` launches it again after every event.
  - The relay already reruns on `RUNNING=` (`agents/proxy.md:13-17`) and hands back every waiting result and
    every end.
  - The poll was added for "a request that comes after a RUNNING= hand-back" (`CHANGELOG.md:782-784`), which
    means a relay that has broken step 2.
  - It is written for Codex agents only, although Claude and OpenCode relays in Claude Code behave the same way.
- **Cost:** one more task for each batch, a second notification for each event, and a relaunch after each one.
- **Proposal:** remove it. If `RUNNING=` hand-backs are still seen with the pasted steps, move it to the shared
  page for every adapter instead.
- **Risk:** without the poll, a relay that breaks step 2 leaves a request nobody sees until it expires.

### 11. Water: the call path is told several times, and `--help` explains internals

- **Category:** water. **Confidence:** high.
- **Evidence:**
  - How to stop an agent is told in five places: `codex/SKILL.md:239-243`, `orchestration.md:94`,
    `opencode/SKILL.md:110-114`, `orchestrate/references/proxy.md:37-39`, and `--help` at
    `agent-run.mjs:214-215`. Two of them repeat E115's wrong claim that a decline stops a run.
  - The paragraph "approvals= … not 0" appears word for word twice (`approvals.md:47-52`,
    `orchestration.md:102`) and in part a third time (`codex/SKILL.md:231-234`).
  - The pid line is written out in full five times.
  - `RUNNING=` is explained in four places.
  - The Codex page sends the coordinator to `--help` (`codex/SKILL.md:184-185`, `approvals.md:6`). That text is
    142 lines and 12.8 KB, and about 40 of those lines describe internals no coordinator acts on:
    - the launch-only mode and `--orphan` (`:216-231`);
    - the relative-REPORT cases (`:279-284`);
    - the keeper and signal mechanics (`:188-193`, `:206-215`).
  - `README.md:41` says "every external run goes through `entrust:proxy`". On a Codex host, it goes through a
    native subagent.
- **Proposal:** say each of these once, on the shared page. Split `--help` in two, as the Codex driver already
  does: the coordinator's part, and the rest under `--help-all`.
- **Gain:** fewer words, and one place to fix E115.
- **Risk:** none.

### 12. The Agent call's description is stated only for Codex

- **Category:** unification. **Confidence:** high.
- **Evidence:**
  - Codex: "Codex \<Short\> \<id\>: …" (`codex/SKILL.md:175`).
  - Native Claude: "\<Model\> \<id\>: …" (`claude/SKILL.md:23-25`).
  - External Claude and OpenCode in Claude Code: nothing (`external.md:50-52`, `opencode/SKILL.md:73-86`).
- **Proposal:** "\<Vendor\> \<Model\> \<id\>: \<task in a few words\>" for every external agent, on the shared
  page.
- **Gain:** every card names its vendor and model the same way.
- **Risk:** none.

### 13. Strengths

- **Category:** strength. **Confidence:** high.
- **One contract for three backends.** One launcher, nine status lines, one mailbox, and one byte-exact
  `--decide` (`agent-run.mjs:132`, `:547-586`, `:681-695`, `:755-771`). Each adapter adds its typed requests
  through a hook (`launch.mjs`, `typedRequest`).
- **Refusals before tokens.** `--new` runs the driver's offline check before a relay exists
  (`agent-run.mjs:648-664`), and the relay never reads the prompt (`:40-41`, `:588-590`). Both were learned from
  incidents.
- **The plan pins model and writes in all three drivers** (`drivers.mjs:74-102`). Run: under a plan, a prompt of
  just `TASK: hi` ran a Claude agent on its row's model and writes.
- **The keeper and `--run`.** `--run` can be repeated safely and returns early, and the driver runs under a
  keeper outside the relay's process tree. This was measured against the harness's teardown
  (`agent-run.mjs:18-38`, `:820-908`).
- **A small relay.** 26 lines, Bash only, on Haiku, measured seven runs of seven (`CHANGELOG.md:1670`).

## Defects found along the way

1. **The agent's directory follows the relay, not the coordinator.**
   - `--new` checks the prompt in the coordinator's working directory. `--run` then starts the keeper and the
     driver in the relay's working directory: `spawnDetached` and the driver spawn set no `cwd`
     (`agent-run.mjs:407-411`, `:454`, `:864`), and `backend.json` records none.
   - So a `live tree` or `nothing` row (`drivers.mjs:62-66`), `RIGHTS: read` with no directory, or Codex's
     default when the prompt has no header all resolve against the relay's directory.
   - Reproduce:
     1. Register the plan row `W1 | claude | haiku | implementer | live tree | unknown`.
     2. Run `cd treeA && … --new` with `TASK: edit`.
     3. Run `cd treeB && … --run`.
     4. The report says `cwd: treeB` and `rights.roots: [treeB]`, while the check ran in treeA.
   - Not measured on a real host. In Claude Code the relay's shell probably starts where the coordinator's does,
     but not after a `cd` or `EnterWorktree`. E100 proposes exactly `live tree` as its workaround.
   - Fix: `--new` records the resolved working directory in `backend.json`, and the keeper starts the driver in
     it.
2. **The OpenCode page gives a Claude Code coordinator no Agent message** (`opencode/SKILL.md:85-86`). The four
   steps are only on the Codex page and in `agents/proxy.md`, and the OpenCode page does not link the Codex
   page's "One call" section.
3. **The two copies of the relay's steps differ** (`agents/proxy.md:8`, `:18-19` against `codex/SKILL.md:195`).
   See finding 8.
4. **What the Claude page says about RESUME is not what the driver does.**
   - `external.md:24` says a resume "continues that run's session … with its rights". Outside a plan, the driver
     refuses a prompt with `RESUME:` and no `RIGHTS:` ("RIGHTS is required", `claude/scripts/driver.mjs:94`).
   - A `RIGHTS: read <other dir>` line passes the check and is then silently ignored: the run uses the earlier
     directory (`:146-149`).
   - Run: resuming with `RIGHTS: read /tmp/auditC/treeB` produced a report whose `cwd` was `/tmp/auditC/work`.
5. **Codex's offline check passes a `RESUME:` that cannot be a thread id** (`codex/scripts/driver.mjs:2536-2545`).
   An absolute path passes the check and only reaches the server at run time (`:4769`), which is what `--new`'s
   check exists to prevent (`agent-run.mjs:648-651`). Reproduce: `--check-prompt-file` on
   `RESUME: /abs/report.json` + `TASK: x` exits 0.
6. **OpenCode's page calls its wall clock "declared"** (`opencode/references/interactions.md:32-33`), but it is
   the driver's 1800 s default, which no coordinator can change; Claude's is the same. See finding 5.
   E115 (a decline does not stop a run) is already open; finding 11 lists where it is repeated.

## The proposed one-call shape

```text
orchestrate/references/external.md — the one page a coordinator reads to call any external agent

Prompt (all three drivers):
  RIGHTS: read [<dir>] | write <dir> | worktree <repo>   first; omit only under a plan (the row's)
  MODEL: <the adapter's model>                           omit under a plan (the row's)
  EFFORT: <the adapter's effort>                         optional
  OUTPUT_SCHEMA: <abs path>                              default: the five-field schema
  RESUME: <the earlier run's REPORT= path>               continues it, with its rights
  ALLOW_NO_COMMANDS: yes                                 recall-only (Claude ignores it)
  TASK: <task>                                           then CHECK:, RETURN:, ENVIRONMENT: as body lines
  Extra fields, and the model and effort names: the adapter's page.

Make it:  node <orchestrate>/scripts/agent-run.mjs --new --report-file <run>/<id>[-n]/report.json <<'PROMPT'
          (adapter from the plan row; --adapter <id> only without a plan)
          prints PROMPT=, APPROVALS=, and MESSAGE<<T … MESSAGE>>T (the relay's message, filled in)
  ERROR= → fix the prompt, never the rights; no relay.

Run it:
  Claude Code:  Agent(subagent_type: entrust:proxy, description: "<Vendor> <Model> <id>: <task>",
                message: the MESSAGE block, verbatim; foreground for the one you wait on)
  Codex/OpenCode host: a native subagent briefed with proxy.md and the --run --watch command

Read it:  nine lines — DRIVER_EXIT PATH EXIT FIRST ANSWER ERROR RECEIPT FILE REPORT
  waiting → REQUEST= blocks: --decide '<ID>' --accept (restate the block, own delimiter)
            | --decline [--why] | --answer (questions); then the same message again
  PATH=taken / FILE=missing → read RECEIPT= approvals= before any relaunch
  Report core: ok exitCode error turnStatus turnError receiptOk model requestedModel
               answer answerJson answerPath cwd rights escalations fileChanges worktree*

Continue:  RESUME: <REPORT=> under <run>/<id>-<n>/report.json; the same relay, one more message
Stop:      Stop on the card, or kill -TERM <pid> from DIR/err.txt; a decline answers one request only
Budget:    no wall clock; an idle bound, paused while a request waits; the same for every adapter

Each adapter page keeps: models and efforts, its extra fields, its composition rules, its report remainder.
Changes: launcher (adapter from the row, MESSAGE, cwd in backend.json); Codex (RESUME by report path,
  five-field default in prompt-file mode, adapter/error/rights/requestedModel in the report); Claude
  (accepts ALLOW_NO_COMMANDS, an idle bound); OpenCode (true/1, no default wall clock). Driver contract unchanged.
```
