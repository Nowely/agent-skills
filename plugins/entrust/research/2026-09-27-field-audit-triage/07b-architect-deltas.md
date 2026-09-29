# 07b. Architect F1, the deltas

Fable F1's drafts file verbatim: one section per delta, D1 to D24, then the pins changed, the conflicts between deltas and the pre-existing defects it met.

# Fable F1: deltas for the 42 fix-now rows of #15 and #16

Tree: ~/Git/agent-skills-field-audit-triage at 1bbab5b (git rev-parse, exit 0; status clean but for the untracked research run). Baseline suites, run into mktemp files: orchestrate.test.mjs "all 70 passed" exit 0; advisor.test.mjs "all 11 passed" exit 0; agent-contract.test.mjs "all 14 passed" exit 0; swarm.test.mjs "all 18 passed" exit 0. Word counts (wc -w): orchestrate 3,649; codex 4,511; roles 1,281; foreman 950.

Paths below are under plugins/entrust/: `plugin/skills/...` is the installed part, `evals/...` sits beside it. A line number is the file at 1bbab5b, located by the quoted text. Cost classes: S = text or a few lines, one suite touched; M = a script, a launcher/driver change or a paid live-gate case; L = several of those.

Twenty-four deltas cover the 42 ids once each: 13 sentences, 9 mechanisms, 2 experiment protocols.

## Two things every delta below shares

**The prompt-only statement.** orchestrate/SKILL.md:13-14 says "The mode is prompt only: no driver change, no new header field or flag, the agent's own prompt file and the driver's state directory unchanged." (pinned verbatim by orchestrate.test A1 :81-83). D4 and D16 change the driver, D6 the launcher, D7 and D14 add a script under orchestrate. Each breaks that statement as written. One replacement, applied once if any of the five lands:

    The mode adds no header field or flag and leaves the agent's own prompt file where the sibling puts it; what it asks of the driver and the launcher is the sibling's and is changed there under its own changelog line, and its own scripts, the runner and the linter, run a command or read a draft and write only under `$TMPDIR`.

Pin A1 changes to that sentence. advisor:13 and experiment:13 carry the same statement for their modes and stay true (they make no driver change of their own). The precedent for a mode with a script is experiment/SKILL.md:13: "its one script writes the record and nothing else".

**The keep list.** K1 plan stop (:37), K2 split critique (:117, roles.md:10), K3 refuters (:119, roles.md:18), K4 the critic on the final version (:123, roles.md:26), K5 cross-review (:90-91, roles.md:17), K6 the one-off advisor (roles.md:12), K7 batched `--new` calls (codex:101-108 with "Both calls may go in one turn"), K8 mount backup-and-swap (not on any page; it is the owner's practice in T8). No delta removes or weakens one; D6 adds a step before K1, D10 and D12 tighten K4 and K2, D11 reorders work around K3, D20 adds inputs to K5. Where a delta touches one, it says so.

---

## D1 — F1, P1: the advisor starts advising on its own command

**File.** plugin/skills/advisor/SKILL.md:17, the paragraph "One top-row agent, chosen by the agreed composition, from the other model family than your own: … Before its first question, show a plan that names it as the advisor, with its expected turns, and stop until "go". It is one thread kept for the run: …".
**Kind.** Sentence, with one live-gate case as its regression.
**Old.** `One top-row agent, chosen by the agreed composition, from the other model family than your own: Astra under a Claude coordinator, and Fable only when the composition words rule Codex out. Before its first question, show a plan that names it as the advisor, with its expected turns, and stop until "go".`
**New.** `One top-row agent from the other model family than your own: Astra under a Claude coordinator, and Fable only when the user's composition words rule Codex out. Your user's invocation of this command is the word for its turns: consult it before the first decision, the composition included, with no plan stop of its own; the plan the run shows for its workers names it as the advisor with its expected turns, and a stop is for authority the invocation did not grant — the workers' plan, an edit, a commit, a publication — under the rules of the run it joins. "No advisor" (без советника) from the user ends the thread for the run, and "ask the advisor" starts it again.`
The rest of :17 ("It is one thread kept for the run: …") and :21 (the decision points, Q1 pin) stay verbatim. The bootstrap contradiction #15 names (chosen by the composition, consulted at the composition) goes with the words "chosen by the agreed composition".
**Evals.** advisor.test D1 (:72-77) pins both old sentences; its two regexes become `/One top-row agent from the other model family than your own/` and `/consult it before the first decision, the composition included, with no plan stop of its own/` plus `/a stop is for authority the invocation did not grant/`. Q2's negative scan (:104-105) does not fire on the new text (no may/can/should/will beside implement/judge/spawn/write under; checked by eye against the regex). Page budget (40 lines) holds: the page is 25 lines.
New live-gate case, orchestrate-live.test.mjs (paid, one Astra turn): headless `claude -p "/entrust:advisor …"` on a fixture whose review split crosses an interface (two files sharing lib/shared.mjs); asserts (a) the Skill tool loaded `entrust:codex` and never `entrust:orchestrate`; (b) an `entrust:codex-agent` call for Astra precedes every other Agent call and the session did not end its first turn before it (no stop for a word); (c) a second prompt "no advisor" followed by a task makes no further Astra call; (d) the scratch repository's HEAD and `git status` are unchanged. This is #16's acceptance check for the advisor, minus "resumed at a later verdict", which needs a longer session and is left to E3.
**Cost.** S for the page, M with the gate case.
**Why a sentence.** The page states something false for the owner's expectation (a stop before read-only advice the invocation already asked for); the reader acts on the new sentence without enforcement, and the gate case is the regression M1 asks for. The lifecycle (opt-out, later consultation) is otherwise E3's, an experiment the page already names.
**Keep list.** K6 untouched (roles.md:12 stays). K1 stays for the workers' plan; the delta says so in the text.
**Followed.** Analyst and refuter agree (R1 upheld).

## D2 — F12c: the advisor's prompt carries no `EFFORT:` line and the five-field schema

**File.** plugin/skills/advisor/SKILL.md:17, add after D1's first sentence ("… rule Codex out.").
**Kind.** Sentence.
**Add.** `Its prompt carries `MODEL: astra` (or the Fable agent's `model: "fable"` tag), an `OUTPUT_SCHEMA:` line with the five fields, and no `EFFORT:` line: a top-row agent inherits the configured effort, as the orchestrate page's tier rule says, and the advisor's thread is one.`
**Evals.** New advisor.test case D3: `says(/carries `MODEL: astra`/, /no `EFFORT:` line: a top-row agent inherits the configured effort/, /`OUTPUT_SCHEMA:` line with the five fields/)`, with a negative half failing on `EFFORT: (high|medium|low)` anywhere on the page. No existing pin changes.
**Cost.** S.
**Why a sentence.** The advisor page loads codex alone (CHANGELOG:105-109), so orchestrate:77-79's top-row rule never reaches it and codex:212's row invites an `EFFORT:`; the page is missing a rule the reader can act on. The schema half also answers the "no schema, 111 lines of prose" incident of #15 F12.
**Keep list.** None touched.
**Followed.** The refuter (R1 refuted S1's not-a-defect to still-true): `grep -c -i effort advisor/SKILL.md` gives 0 (R1's evidence; re-read here, level 1).

## D3 — F12a: the one waited-on Codex agent is a foreground call

**File.** plugin/skills/orchestrate/SKILL.md:106, "A Codex agent is one background Agent call, the sibling's `One call` verbatim — background here, because agents run side by side and you work while they do (in a headless session every agent call is foreground): the `entrust:codex-agent` wrapper, …".
**Kind.** Sentence.
**Old.** `A Codex agent is one background Agent call, the sibling's `One call` verbatim — background here, because agents run side by side and you work while they do (in a headless session every agent call is foreground): the `entrust:codex-agent` wrapper,`
**New.** `A Codex agent is one Agent call, the sibling's `One call` verbatim: in the background when agents run side by side and you work while they do, in the foreground for the one agent you wait for, as the sibling's call says, and in the foreground for every agent in a headless session: the `entrust:codex-agent` wrapper,`
**Evals.** orchestrate.test F1 (:286) says "A Codex agent is one background Agent call, the sibling's `One call` verbatim" → "A Codex agent is one Agent call, the sibling's `One call` verbatim"; F6 (:347) says "because agents run side by side and you work while they do (in a headless session every agent call is foreground):" → "in the background when agents run side by side and you work while they do, in the foreground for the one agent you wait for". codex:64-69 is unchanged and now agrees with the page.
**Cost.** S.
**Why a sentence.** The two pages contradict each other on a mechanic; a reader who follows either is right on one and wrong on the other, and one true sentence removes the contradiction. Nothing to enforce.
**Keep list.** None.
**Followed.** The refuter (R1 refuted S1's fixed-on-main): :106 at 1bbab5b still opens "one background Agent call" (read here, level 1).

## D4 — F11, F19, P10a: the environment capsule, half computed by the driver, half a body line the plan fills

**Files.** plugin/skills/codex/scripts/driver.mjs, `developerInstructions()` (:3922-3960, "The standing rules the thread is started with"); plugin/skills/codex/SKILL.md:301-321 (Prompt shape) and :317-319 ("The standing rules are already on the thread — unattended, its egress and its web search each named whichever way they went, …"); plugin/skills/orchestrate/SKILL.md:36 ("For each agent, check the required commands against its planned rights and environment.").
**Kind.** Mechanism: a driver standing rule (computed) plus a fixed body line the coordinator fills, and a live-gate check that the line is there.
**Mechanism.**
1. The driver adds two sentences to the standing rules after the network sentence, computed from the same options the sandbox is configured from (`opts.level`, `opts.worktree`/`cwd`, `roots` from `opts.writable`, `process.env.TMPDIR`; driver.mjs:2412-2467): "Your writable roots are: <TMPDIR path>[, <cwd or worktree path>][, <each --writable root>]; `/tmp` is not one. A write anywhere else is refused by the sandbox and an approval request in its place is declined unanswered, so do not retry it elsewhere: put the file under $TMPDIR and name the path." and "A tool that needs a daemon, a socket or a mounted checkout fails here as a crash, not a refusal: do not work around it; record it in one line and use the inputs the task staged." The first is what F11's three `/tmp` and scratchpad writes lacked; the second is the VCS-daemon incident of F11 and F19 (T8 sol-w2c, 14 failed commands).
2. The codex page's Prompt shape adds one body line after `RETURN:` for any write agent and for any agent in a repository whose tooling keeps a daemon: `ENVIRONMENT: what is staged and where (the diff, the trunk files), the tools that need a daemon and what to run instead, the lint or test flags that avoid a cache the sandbox cannot write (`--no-cache`)`. It is body, not a header field: the header ends at `TASK:` (codex:200-201), so the driver's parser and agent-contract's table reader (`documented`, :45, reads the Header fields table alone) are untouched.
3. orchestrate:36 keeps its sentence (C11 pin) and gains "and write what you found into the brief's `ENVIRONMENT:` line". codex:317-319 gains "its writable roots and that `/tmp` is not one" in the list of what the standing rules already say.
**Evals.** New cli.test.mjs case: a run against the fake server with `--writable <dir>` and a worktree; the fake server's RPC log's `thread/start` developer instructions contain the roots sentence with both paths and "`/tmp` is not one"; a read-level run names TMPDIR alone. New live-gate assertion in the full-run case: every `agent/prompt.txt` under the run whose `RIGHTS:` is worktree or write carries an `ENVIRONMENT:` line (presence only). Existing pins: none change (C11's regexes still match :36; agent-contract's field table unchanged).
**Cost.** M (driver change, one cli case, one gate assertion).
**Why a mechanism.** orchestrate:36 is the sentence 0.20.0 added for F11/F19 (CHANGELOG :94 in the issue's numbering) and both recurred (M1). The roots half needs no coordinator compliance: the driver knows the roots and says them on every thread. The daemon/staging half cannot be computed and stays a fixed line, whose presence the gate checks.
**F11.** Per R1, no exit-6 classifier: exit 6 fires only on completed turns (driver.mjs:249 before :255; codex:288-292 says an entry is not evidence of lost work), and orchestrate:137's row already reads such a run as a verdict. The capsule lowers the count; the acceptance measure is #15's "exit-6 rate, failed commands" over the next runs.
**Statement.** Breaks "no driver change" → the shared wording above.
**Keep list.** None.
**Followed.** R1 on all three rows (F11 redirected to the capsule; F19 and P10a upheld).

## D5 — F18, P5, P12b: generated fragments, and the codex page loaded when the plan has a Codex agent

**Files.** New evals/fragments.mjs and evals/fragments.test.mjs; new generated plugin/skills/orchestrate/references/codex-composition.md; plugin/skills/orchestrate/SKILL.md:12 ("Load [codex](../codex/SKILL.md) now (Skill tool, `entrust:codex`) and follow it for every Codex agent: …") and :36 step 1 ("1. Load the sibling skill with the Skill tool if it is not loaded yet, scout, then decide the composition and the agents."); evals/run-all.mjs:23 SUITES; evals/README.md's suite list.
**Kind.** Mechanism: a generator with a drift check, and the page's load deferred.
**Mechanism.** `evals/fragments.mjs` holds one FRAGMENTS table: source (file, `## ` section or a named line) → copies (file, marker). `--check` (the suite) fails when a copy differs from its source; `--write` regenerates the copies. Fragments registered first: (1) codex `## Composition` (the five rules and the table, :26-50) and the rights table (:49-58 of that section) → `orchestrate/references/codex-composition.md`, generated whole, with a first line "Generated from ../../codex/SKILL.md by evals/fragments.mjs; edit the source"; (2) the five-field schema: source `skills/codex/schemas/five-fields.schema.json` (D15) → the one-line copies at orchestrate:155 and swarm:19, minified; (3) the run-directory sentence, identical at orchestrate:26-27 and swarm:25 (as terse's pages.test.mjs checks its shared line). `fragments.test.mjs` runs `--check` per fragment and one mutation case (a temporary copy with a changed word is red). It goes into run-all's SUITES before `package`, so a release run (package.test's tag case) fails on drift.
The orchestrate page then defers the sibling:
**Old (:12).** `Load [codex](../codex/SKILL.md) now (Skill tool, `entrust:codex`) and follow it for every Codex agent:`
**New.** `Plan from [codex-composition.md](references/codex-composition.md), the sibling's composition rules and rights table generated into this page's references; load [codex](../codex/SKILL.md) (Skill tool, `entrust:codex`) once the plan has a Codex agent, before its first `--new`, and follow it for every Codex agent:`
**Old (:36).** `1. Load the sibling skill with the Skill tool if it is not loaded yet, scout, then decide the composition and the agents.`
**New.** `1. Scout, then decide the composition and the agents from the generated composition page; load the sibling skill with the Skill tool once the plan has a Codex agent.`
**Evals.** orchestrate.test A3 (:85-99) pins the step-1 sentence verbatim → the new one; its "(Skill tool, `entrust:codex`)" and "this page re-cuts only what the mode changes" stay. E3 (:255, the `#composition` link at :85) stays. The page-budget pin (156 lines) holds since the table lives in a reference. orchestrate-live `planProblems` (:436-437, "the sibling skill was never loaded") becomes "loaded before the first Codex call" (the SLUG_TASK plan names a Codex agent, so the load still happens in that case). package.test's payload case resolves linked references automatically (:161-165), so the new reference is covered once linked.
**Measured effect, honest.** For an all-Claude run the sibling's 4,511 words are not loaded; the fragment costs about 350. For a run with a Codex agent the load is deferred, not avoided: 0 words saved against #15's target of −4,308 to −7,044. A smaller launch recipe (One call, Header fields, Reading the result, about 1,500 words) would need those sections to be generated too and the page's "rights, header fields, worktree lifecycle … stay authoritative" sentence re-cut; left open below with the measurement it needs (words per section, `wc -w` on the split sections).
**Cost.** M.
**Why a mechanism.** #15 F18's cause is a load the page orders (:12) and P12b asks that copies never drift; a generator plus a red suite is what stops hand-copies, and a deferred load is a default, not a rule the reader must remember. R1's correction is met: the plan keeps the composition table, generated.
**Keep list.** None.
**Followed.** R1 on P12b (partial: FIELDS is already one table; page-to-page copies are what remains).

## D6 — F13, P9a, F14, P9b: the plan is a card of five rows, its agents a manifest the launcher enforces

**Files.** plugin/skills/codex/scripts/agent-run.mjs (`newAgent`, :273-310; the modes list at :1-11); plugin/skills/orchestrate/SKILL.md:37-42 (step 2, "Show the plan and stop, …"), :29 ("… a report per agent and, beside it, the launcher's `agent/` with the four files of the run; nothing else is written there"), :71 ("Tag every Claude Agent call with an explicit `model`"); plugin/skills/codex/scripts/cleanup.mjs (the run walk, :408-441); evals/agent-run.test.mjs, evals/cleanup.test.mjs, orchestrate-live.test.mjs.
**Kind.** Mechanism: a launcher subcommand and refusal, plus the plan's shape as five rows.
**Mechanism.**
1. `node agent-run.mjs --plan --run-dir <run> <<'PLAN'` reads rows `id | model | role | writes | tokens` on stdin (one per agent, Claude and Codex alike), refuses on `ERROR=` with exit 2 a duplicate id, a model outside the eight names, a `writes` outside `nothing`, `worktree`, `live tree`, `write <dir>`, and writes `<run>/plan.txt` at 0600 (making `<run>` at 0700 as it makes `agent/`), then prints `PLAN=<path>` and one `AGENT=<id> <model> <writes>` line per row. `--plan --amend` appends rows and prints them as `AMENDED=`. It never reads a prompt.
2. `--new --report-file <run>/<id>/report.json` with a `<run>/plan.txt` present refuses an `<id>` not listed: `ERROR=<id> is not in the approved plan at <path>; amend it with --plan --amend and show the amendment`, exit 2, no prompt.txt. Without plan.txt there is no check, so the codex skill alone, swarm.mjs (:135, which calls `--new`) and the experiment mode run as before.
3. Step 2 becomes a card of five rows; the pinned sentences stay verbatim inside the rows.
**Old (:37, first sentence).** `Show the plan and stop, in the user's own language and in ordinary words: what will be done, who does each part by model name, what each may write, that the agents reach the network and any you are keeping off it, and that reports and artifacts land outside the repository, except a worktree agent's own tree, which the driver makes and removes inside the repository under its `.claude` directory.`
**New.** `Register the agents with the launcher (`--plan`), then show the plan as a card of five rows and stop, in the user's own language and in ordinary words — work: what will be done; who: each agent by model name and role; writes: what each may write, that the agents reach the network and any you are keeping off it, and that reports and artifacts land outside the repository, except a worktree agent's own tree, which the driver makes and removes inside the repository under its `.claude` directory; cost: the tokens by agent; checks: which agent verifies what, and the critic. An agent the card did not list is refused by the launcher and, for a Claude agent, is one you do not launch: amend the plan, show the amendment and wait for a word, as for the plan; a listed agent you drop is named in the answer.`
The rest of step 2 (Name no path…, Announce the composition here, and the caps beside it in a sentence: …, State expected tokens by tier and role in the plan; …, One plan when there is one; …, Number each alternative, …) stays verbatim after it, so C2's other strings, C6, C9, C10 and C11 hold. :29 gains "and the plan the launcher registered" before "; nothing else is written there". :71 gains: `and a description of the form "<Model> <id>: <task in a few words>", the id the plan registered, as a Codex agent's card carries "Codex <short name> <id>"`.
**Evals.** orchestrate.test C2 (:138) says "Show the plan and stop" → "show the plan as a card of five rows and stop"; G6 (:411) says the "nothing else is written there" sentence → the new one; F5 (:343) unchanged. New agent-run.test cases: `--plan` registers and prints; `--new` for an unlisted id is refused with no prompt.txt; admitted after `--amend`; no plan.txt, no check; a plan row with a bad model is refused. New cleanup.test case: a run holding `plan.txt` is listed as the run's own, not unrecognised (cleanup.mjs :408-441 must learn the file). New live-gate assertions in the full-run case: `plan.txt` exists under the run and its `--plan` call precedes every `--new` and Agent call; every Agent call's description carries an id from it; every `--new` report path's `<id>` is in it (the launcher's refusal makes this redundant for Codex, so the assertion is on the Claude side).
**Cost.** M.
**Why a mechanism.** F14 was answered at 0.20.0 by :43-44's sentence (CHANGELOG :114 in the issue's numbering) and recurred four times (T7 1.38M tokens unplanned); a refusal in the launcher needs no compliance for the Codex half, and the id-in-description convention gives the gate something to check for the Claude half. F13's form is a sentence: the card reduces ten elements to five rows, and its five headings are what the gate and the user can check. What the manifest does not check: the caps (per moment alive, not per plan) and the cost figures' truth; see open.
**Statement.** Breaks "no driver change" only by the launcher (agent-run.mjs is the sibling's script) → the shared wording.
**Keep list.** K1 kept: the stop follows the card; the card is what "go" covers. The amendment stop is K1 applied again.
**Followed.** R3 on F14 (partial, the fix is P9b's) and upheld on F13, P9a, P9b; R1's note that the launcher gates Codex launches only is met by the description convention plus the gate, and stated as the weaker half.

## D7 — F9, F10, P3: the runner, `capture-check.mjs`

**Files.** New plugin/skills/orchestrate/scripts/capture-check.mjs; new evals/capture-check.test.mjs; plugin/skills/orchestrate/SKILL.md:32 ("Redirect a check you run yourself into a `mktemp` file and read back only a 5-line tail with the counts."); plugin/skills/orchestrate/references/foreman.md:54-55 (brief rules) and roles.md:3 (preamble); evals/run-all.mjs:23; evals/package.test.mjs:150-152 (the payload's `under(...)` list); evals/README.md's list.
**Kind.** Mechanism: a script and an offline suite.
**Mechanism.** `node "${CLAUDE_SKILL_DIR}/scripts/capture-check.mjs" [--lines N] [--label X] -- '<command>'` runs the command under `bash -o pipefail -c`, streams stdout and stderr merged into `mktemp "$TMPDIR/check-<label>.XXXXXX.log"`, and prints `LOG=<path>`, `LINES=<total>`, the last N lines (default 20, each clipped to 200 characters), and `EXIT=<status>` as its last line (`EXIT=signal SIGTERM` for a signal); its own exit status is the command's. Because the runner captures everything, no `| tail` is needed; where one is written anyway, pipefail carries the failing stage's status, which is F10's false exit 0 (result-gates.md:21-26 documents `| tail` returning tail's status).
**Old (:32).** `Redirect a check you run yourself into a `mktemp` file and read back only a 5-line tail with the counts.`
**New.** `Run a check you run yourself through the runner, `node "${CLAUDE_SKILL_DIR}/scripts/capture-check.mjs" -- '<command>'`: the whole output goes to a log under `$TMPDIR`, you read back its tail and its `EXIT=` line, and a pipeline's status is its failing stage's, not `tail`'s.`
foreman.md:54 gains: "Name the runner by absolute path in every brief, for any command whose output may exceed twenty lines, and read the agent's `EXIT=` line as the verdict." roles.md:3 gains one sentence of the same shape for every brief the coordinator writes. Codex agents are left out on purpose: the floods #15 F9 cites are Claude contexts (T3 and T8 coordinators, T2 and T7 Claude subagents), and Codex's own harness clips a command's output before the model sees it (hypothesis; not measured here).
**Evals.** New suite evals/capture-check.test.mjs: (1) `seq 1 100000` → the runner prints at most 24 lines and the log holds 100,000; (2) `sh -c 'echo failing; exit 1' | tail -1` → `EXIT=1`, beside a control `bash -c` of the same pipeline that exits 0; (3) a fourteen-line "error TS" fixture exiting 2 → `EXIT=2` is the last line; (4) a command killed by SIGTERM → `EXIT=signal SIGTERM`; (5) the log is under `$TMPDIR`. run-all SUITES gains `capture-check` (run-all refuses an unlisted suite, :24-30, which pins the listing); package.test's payload list gains `...under("skills/orchestrate/scripts")`. orchestrate.test B4 (:117-119) says "read back only a 5-line tail with the counts" → says("through the runner", "its `EXIT=` line", "not `tail`'s").
**Cost.** M.
**Why a mechanism.** #15 asks for it (P3) and F9 is the recurring one the 2026-09-17 research already recorded (inline output 16.4%); a runner that prints the exit itself does not depend on :32 being obeyed, and it is the enforcement D8's bound stands on.
**Statement.** A script under the mode → the shared wording.
**Keep list.** None.
**Followed.** R2's partial readings of F9 and F10 (the coordinator's rule exists, the agents' and the exit are the gaps); O1's design.

## D8 — F15, F21, P2: the cost model, and a countable inline bound the runner enforces

**File.** plugin/skills/orchestrate/SKILL.md:26 ("Scouting is the only repository exploration you do, and targeted bounded checks stay allowed inline after it; report a failed agent and never backfill it.") and a new paragraph under "## Your own hands" after the table (:24).
**Kind.** Sentence, enforced through D7's default tail.
**Old (:26).** `Scouting is the only repository exploration you do, and targeted bounded checks stay allowed inline after it; report a failed agent and never backfill it.`
**New.** `Scouting is the only repository exploration you do; after it, an inline check is one command through the runner, at most twenty lines read back, answering one yes-or-no or one number, and a second command on the same question goes to an agent; report a failed agent and never backfill it.`
**Add after the table (:24).** `What you read inline is re-read by every call after it: its cost is its size times the calls left in the session, so a 500-line diff read at the twentieth call of a hundred and twenty is read eighty more times, where an agent reads it once and returns thirty lines. Price inline work in the plan beside the agents' tokens.`
**Evals.** orchestrate.test B1 (:102) says "Scouting is the only repository exploration you do, and targeted bounded checks stay allowed inline after it" → says("Scouting is the only repository exploration you do; after it, an inline check is one command through the runner, at most twenty lines read back"). New case B8 pins the cost sentence ("its cost is its size times the calls left in the session") and a negative half: no number on the page other than "twenty lines" and "thirty lines" in that section (a tariff would be D10's mistake). No hook: a plugin-level PreToolUse hook would fire in every session with the plugin enabled and is not the smallest change (O1's hypothesis, shared); left open.
**Cost.** S beyond D7.
**Why a sentence.** F21 is an absence (the page prices agents, never inline work; `grep -nE 'inline|tokens|main context|re-read'` over the orchestrate pages gives 9 hits, none pricing inline output — O1, re-checked: 9), and F15's loophole is the undefined word "bounded"; a countable bound is what the runner's default tail then enforces, and what a reviewer of a transcript can count.
**Keep list.** None.
**Followed.** Analyst and refuter agree.

## D9 — F3: the simple-task row states the true count

**File.** plugin/skills/orchestrate/SKILL.md:95, the row `| simple task | 1 agent |`.
**Kind.** Sentence.
**Old.** `| simple task | 1 agent |`
**New.** `| simple task | 1 worker; the completeness critic beside it, not counted, and its verifier is you under the redirect rule or one agent when the check cannot run there |`
:87 ("A one-agent task has no judgement agent beyond the completeness critic, and so no Codex agent unless cross-review adds one") stays verbatim.
**Evals.** orchestrate.test E5 (:267-272) first regex `^\| simple task \| 1 agent \|$` → the new row. C12 (:516) keeps its three says() strings, all in :87 and :123, untouched.
**Cost.** S.
**Why a sentence.** A contradiction between a row and three sentences; stating the count the page already implies (E6 :102 lets the redirect rule decide; the live gate's own comment at orchestrate-live:508-511 records a one-agent run verified that way) removes it at no risk. Whether cross-review is dropped on a simple task is P8a, behind measurement, and this row leaves :87's "unless cross-review adds one" as it is.
**Keep list.** K4 stays (the critic is named in the row).
**Followed.** Analyst and refuter agree.

## D10 — F4, P8b: the critic's verdict is bound to a digest of the draft it read

**Files.** plugin/skills/orchestrate/SKILL.md:123 (the critic bullet); plugin/skills/orchestrate/references/roles.md:26 (the critic row's Returns cell); orchestrate-live.test.mjs.
**Kind.** Mechanism: a digest the critic returns and the send step recomputes, with a gate case.
**Old (:123).** `- Completeness critic at the end: one fresh strong-row reader chosen by the agreed composition and named in the plan, given the user's request, the final answer and its evidence once, before the answer goes out, never per return; it returns done, partial or not done with what is missing, unverified or unread, and the answer carries its verdict. A publication (a README, a changelog, a synthesis) is read the same way before it goes out.`
**New.** `- Completeness critic at the end: one fresh strong-row reader chosen by the agreed composition and named in the plan, given the user's request, the final answer and its evidence once, before the answer goes out, never per return; the answer it reads is a file under your temporary directory whose sha256 it returns as the first line of its `evidence`; it returns done, partial or not done with what is missing, unverified or unread, and the answer carries its verdict; what goes out is that file, or the changed part is re-read and a new digest returned, and `not done` means you fix it or name the gap in the answer. A publication (a README, a changelog, a synthesis) is read the same way before it goes out.`
roles.md:26 Returns: `the verdict and the missing items` → `the verdict, the draft's sha256 and the missing items`.
**Evals.** orchestrate.test F2 (:307-324) pins the critic bullet as one anchored regex; the insertion after "never per return;" breaks it → the regex takes the new clause. C12's says() strings ("given the user's request, the final answer and its evidence once, before the answer goes out, never per return"; "returns done, partial or not done with what is missing") stay in the line; its except/unless/skip/optional scan does not fire (checked by eye). New live-gate assertion in the full-run case: the critic's Agent call names a `$TMPDIR` path and "sha256"; the gate reads that file, computes its sha256, compares it to the digest in the critic's return, and compares the file's text to the session's final assistant text with whitespace collapsed; unequal text passes only when a second critic call follows the change. That is the regression for the three drift cases #15 F4 lists (T3 :641, T8 post-critic corrections, T8 synthesis without a critic).
**Cost.** S for the page, M with the gate case.
**Why a mechanism.** Timing and scope are on the page since 0.20.0 (:123, roles.md:26) and the drift cases still happened; a digest is the version link that was missing, it costs one `shasum -a 256`, and the gate can check it without reading anyone's intent. `grep -rE 'digest|sha-?256|invalidat'` over the orchestrate pages: 0 hits (O1; re-run here, 0).
**Keep list.** K4 kept and tightened: the critic still reads the final version once; the digest says which version.
**Followed.** Analyst and refuter agree (R2 upheld both).

## D11 — F5, P8d: deduplication before refutation, one refuter per cluster, prerequisites once

**Files.** plugin/skills/orchestrate/references/roles.md:25 (dedup-and-rank) and :18 (refuter); optionally plugin/skills/orchestrate/SKILL.md:119 (the adversarial bullet).
**Kind.** Sentence.
**roles.md:25, "Spawn it when".** Old `a wave wider than the coordinator can read whole` → New `before the refutation of a wave's claims, and a wave wider than the coordinator can read whole`.
**roles.md:25, "What it does".** Old `merges a wave's returns, attributes each finding, ranks; the coordinator synthesises from it` → New `merges a wave's returns into clusters of one claim each, keeps every origin on its cluster, ranks, and names the mechanical prerequisites (a build, a suite) the refuters share; the coordinator synthesises from it`.
**roles.md:18, "What it does".** Old `attacks one claim; `refuted` when uncertain` → New `attacks one claim, or one cluster the dedup-and-rank made, keeping its origins; a shared prerequisite runs once, by one agent, and its receipt goes into every refuter's brief; `refuted` when uncertain`.
**The verdict set, the owner's call.** #16 asks refuters to "preserve unknown"; :119 says "a refuter defaults to `refuted` when it is uncertain", pinned by F2 (:317), and this run itself departed from it (03-split.md:13-15). Option A: leave :119 and the pin. Option B: :119 becomes `- Adversarial verify: a refuter returns `refuted` when its check ran and failed and `unknown` when its check could not run, never `refuted` for want of evidence; a finding is one that changes correctness or a stated requirement, the rest its `open`.` and F2's fourth regex changes with it. Recommendation: B, because A folds "could not check" into "false" and the refuters of this run were told B; but it reverses a rule the owner wrote, so it waits for the word.
**Evals.** E9 (:535) counts columns and rows, unchanged; F2 changes only under option B. No behavioural case: which cluster a refuter got is a brief's content, not something a gate can read without the wave.
**Cost.** S.
**Why a sentence.** An existing role is moved earlier and a bound stated; the cost the issue reports (T5 4.11M, T2 19→11) is a matter of order, and the roles table is where a coordinator reads the order. Reviewer overlap itself stays: narrowing it could lose findings (#16 E3: the best recorded reviewer lost adopted findings in every task), so that half waits for Q3f/Q7b (D24).
**Keep list.** K3 kept: refuters remain, per cluster instead of per duplicate.
**Followed.** R2's partial on F5 (one-claim rule exists; overlap and pre-refutation dedup do not) and its upheld P8d; O1's design.

## D12 — F6, Q3a: no brief exists before the split critic returns, and a gate fixture checks the order

**Files.** plugin/skills/orchestrate/SKILL.md:117 (the split bullet); plugin/skills/orchestrate/references/roles.md:10 (Returns cell); orchestrate-live.test.mjs.
**Kind.** Sentence, with a live-gate case.
**Old (:117).** `- Critique the split before the fan-out: a top-row agent reads the decomposition, not the subject, for what the cut lost, what the wording added, which items are two and which the fan-out's rights cannot decide; twenty agents on a bad split agree and are all wrong (measured 2026-09-12: it caught two claims true at one release and false at the next, and they never reached the fan-out).`
**New.** `- Critique the split before the fan-out: a top-row agent reads the decomposition, not the subject, for what the cut lost, what the wording added, which items are two and which the fan-out's rights cannot decide, and returns the corrected split as a file under its temporary directory; every worker brief is written from that file and names its path, so no brief exists before the critic returns; twenty agents on a bad split agree and are all wrong (measured 2026-09-12: it caught two claims true at one release and false at the next, and they never reached the fan-out).`
roles.md:10 Returns: `the corrected split` → `the corrected split, as a file every brief names`.
**Evals.** F2 (:307-324) pins the bullet whole and anchored; the second regex changes to the new line. New live-gate case (paid: one Fable or Astra turn plus two cheap workers): a fixture with two units, `lib/a.mjs` and `lib/b.mjs`, both importing `lib/shared.mjs`, whose task needs `shared` to change; asserts (1) a top-row Agent call whose prompt names the split completes (its tool_result appears in the stream) before the first worker Agent call's tool_use; (2) each worker brief contains the critic's file path; (3) `lib/shared.mjs` is owned by exactly one brief. That is #16's acceptance check for the split critic and the regression for T5's bypass (fan-out before the critique finished).
**Cost.** M (the gate case; the page change is S).
**Why a sentence with a regression.** The step was already claimed fixed by a sentence (CHANGELOG :73 in the issue's numbering, now :229) and recurred; the new sentence is not another reminder but a structural dependency (a brief is built from a file that does not exist yet), and the gate case is what M1 asks for. Nothing in the launcher can order Claude Agent calls.
**Keep list.** K2 kept and tightened.
**Followed.** R2's partial on F6 (the step exists; completion and application were missing) and upheld Q3a.

## D13 — F16, P13a: one paragraph per phase, of verified changes only

**File.** plugin/skills/orchestrate/SKILL.md:53, the sentence "After any agent returns, Claude or Codex, write one short paragraph of your own, …".
**Kind.** Sentence, with a gate count.
**Old.** `After any agent returns, Claude or Codex, write one short paragraph of your own, in the user's language and naming the agent by its model, in the same shape for both sides, the agent by name as the subject and what it did as the verb; the five fields are your own input, so never paste a five-field block, a header field name or a path into user-facing text.`
**New.** `At the end of each phase — a fan-out's returns, a verification round, the synthesis — write one short paragraph of your own, in the user's language, naming each agent by its model, in the same shape for both sides, the agent by name as the subject and what it did as the verb, carrying only what a verifier confirmed; a return arriving alone earns no paragraph unless it is a failure or a question for the user; the five fields are your own input, so never paste a five-field block, a header field name or a path into user-facing text.`
**Evals.** orchestrate.test C7 (:176-178) pins the old sentence whole → the new one. New live-gate assertion in the full-run case: assistant text blocks between "go" and the final answer number at most the phases plus one (a hypothesis-level count; recorded to the case directory and asserted at ≤ 4 for the slug task).
**Cost.** S.
**Why a sentence.** The page states a rule that produces the incident (a paragraph after every return is fourteen paragraphs a run); the fix is to say the true cadence, which the reader can act on, and the gate counts it. Machinery in the text is D14's linter.
**Keep list.** None.
**Followed.** Analyst and refuter agree (R3 named the C7 pin).

## D14 — P13b, F20a: the draft linter, and every agent that ran is named in the answer

**Files.** New plugin/skills/orchestrate/scripts/lint-draft.mjs; new evals/lint-draft.test.mjs; plugin/skills/orchestrate/SKILL.md:53 (one clause) and :123 (the critic reads the linted draft); orchestrate-live.test.mjs; evals/run-all.mjs:23; evals/package.test.mjs (payload via D7's `under`).
**Kind.** Mechanism: a script, an offline suite, and gate assertions.
**Mechanism.** `node lint-draft.mjs <file>` (or stdin) prints one `LINT=<rule>: <line>` per hit and exits 1 on any; 0 clean. Rules: an absolute path (`/Users/`, `/var/`, `/tmp/`, `${`); a header field name from the driver's FIELDS (imported from `../../codex/scripts/driver.mjs`, safe since `main()` runs only as the entry point) or one of the five labels at a line start; the words `wrapper`, `driver`, `report.json`, `exitCode`, `RESUME`, `threadId`, `exit 6`; a model slug (`gpt-`, `claude-`); an agent id (`agent-[0-9a-f]{12,}`); more than 400 words in one message; a success word (`passed`, `green`, `works`, `fixed`) in a sentence with neither a digit nor an agent name. The five-field paragraph rule (:53) gains "linted before it goes out" and :123's critic reads "the linted draft" — both compliance clauses; the enforcement is the gate.
**Evals.** New suite evals/lint-draft.test.mjs with fixtures from #15's incidents: agent ids, paths and exit mechanics (T5 :325) red; paths and a RESUME id (T9 :219) red; a 3,000-word wall (T2 :203) red on length; a clean two-sentence paragraph green; the user's own quoted words are not linted (a line starting with `>`). run-all's SUITES gains `lint-draft`. New live-gate assertions in every case: the final assistant text lints clean; and (F20a) each agent that ran — each report's first-line name for Codex, each Agent call's `<Model> <id>` description for Claude (D6's convention) — is named in the final text, or named as dropped. Existing pins: C7 (already changed by D13) gains the clause.
**Hook, open.** The plugin ships no hooks (`plugin/` holds .claude-plugin, agents, skills, README, LICENSE, package.json; `ls`, read here). A Stop hook in `hooks/hooks.json` running the linter on the last assistant message would enforce it before display in every session, at a process per turn end for every user with the plugin enabled; it is the only pre-display enforcement available and it is not the smallest change. Owner's call; not in this delta.
**Cost.** M.
**Why a mechanism.** F16 was answered at 0.20.0 by codex:323-331 (CHANGELOG :197 in the issue's numbering) and recurred eight times; a linter over the text needs no reading of intent and the gate runs it on every case. F20a follows R3: provenance already reaches the synthesis (:142-143, foreman.md:64-66, roles.md:25); the gap is the coordinator's prose, so the check is on the final text.
**Statement.** A second script under the mode → the shared wording.
**Keep list.** None.
**Followed.** R3 on both rows.

## D15 — F20b: the five-field schema ships as a file, and the gate checks every return's shape

**Files.** New plugin/skills/codex/schemas/five-fields.schema.json (the inline line of orchestrate:155, pretty-printed); plugin/skills/codex/SKILL.md:210 (the `OUTPUT_SCHEMA:` row); plugin/skills/orchestrate/SKILL.md:151-153; evals/package.test.mjs:147-152 (the fixed payload entries); orchestrate-live.test.mjs.
**Kind.** Mechanism: a shipped default, with gate assertions.
**Mechanism.** The schema every orchestrated agent takes is a file the plugin ships, so a coordinator names a path instead of writing the JSON to a file each run (the step where the review schema was used instead, `run:sol-r1`, and where the advisor got none). codex:210's row gains: `; the five-field one every orchestrated agent takes ships at `${CLAUDE_SKILL_DIR}/schemas/five-fields.schema.json``. orchestrate:151-153: `A Codex agent takes the same five fields as a strict JSON Schema file (…) named on its `OUTPUT_SCHEMA:` line, and you read them from `answerJson` in its report file:` → `A Codex agent takes the same five fields as the strict JSON Schema file the sibling ships, its path in the sibling's `OUTPUT_SCHEMA:` row, named on its `OUTPUT_SCHEMA:` line, and you read them from `answerJson` in its report file:`. The inline line at :155 stays (G1 pin) and D5's fragment check keeps it equal to the file. For Claude agents the Agent tool has no schema layer; the five fields stay a brief's request, and the gate checks the return.
**Evals.** G1 (:367) unchanged (the line stays); agent-contract's table reader reads first cells only, so the row's new clause is invisible to it; package.test's `required` list gains `"skills/codex/schemas/five-fields.schema.json"`; fragments.test (D5) has the file as a source. New live-gate assertions in the full-run case: every `agent/prompt.txt` under the run carries an `OUTPUT_SCHEMA:` line naming that file and every report's `answerJson` has the five keys; every Claude Agent result parses into the five labelled fields (`^status:` … `^open:`), and one that does not is a failure named by agent.
**Cost.** S.
**Why a mechanism.** A default removes a step (write the schema to a file under `$TMPDIR`, then name it) at which the incidents happened; the driver then validates and repairs once (R3: it validates, repairs once and exits 13 only when `OUTPUT_SCHEMA` is named — the file makes naming it the easy path). The Claude half cannot be enforced, only checked.
**Keep list.** None.
**Followed.** R3 upheld.

## D16 — P11a: size caps in the schema, checked by the driver

**Files.** plugin/skills/orchestrate/SKILL.md:142-146 (the template sentence and lines) and :155 (the schema line; swarm:19 through D5); plugin/skills/codex/schemas/five-fields.schema.json (D15); plugin/skills/codex/scripts/driver.mjs, the validator's SUPPORTED set (:867-868) and the schema sent on `turn/start` (the `outputSchema` argument, :3218); evals/cli.test.mjs.
**Kind.** Mechanism: schema keywords and a driver check.
**Mechanism.** The schema gains `"maxLength": 2400` on `result` (thirty lines of eighty characters) and `"maxItems": 40` on `evidence` and `artifacts`, `20` on `open`. The driver's validator learns `maxLength` and `maxItems` (about fifteen lines beside `enum` and `items`), so a mismatch spends the one corrective turn the driver already has (`--help` :48-51; startCorrectiveTurn :3208-3229 sends the errors) and exits 13 with the answer kept; and because the server's strict mode may refuse or ignore those keywords, the driver strips the two from the copy it sends on `turn/start` and reports them under `schemaSizeCaps`, enforcing them itself. If a fidelity run shows the server accepts them, the stripping goes. The template sentence at :142 gains: "a `result` past the cap, or evidence past forty lines, goes into a file under `$TMPDIR` named in `artifacts`"; the template line `result:    at most 30 lines` stays (G1 pin).
**Evals.** G1's schema regex (:372-373, the exact line) changes with the line; swarm.test U2 (:103) parses and checks strictness, unchanged; the orchestrate case "the inline schema parses and is strict all the way down" (:611) unchanged. New cli.test case against the fake server: a schema with `maxLength: 1` and an answer "ok" → the corrective turn is spent (the fake server returns "ok" again) and the run exits 13 with `schemaErrors` naming `maxLength`; `schemaKeywordsUnchecked` no longer lists it. O1's measurement of the current tree (maxLength 1 accepted "ok" with exit 0, level 3) becomes the red baseline of that case. Claude agents: the Agent tool has no schema; whether the Workflow `schema` option enforces `maxLength` is unknown (open).
**Cost.** M.
**Why a mechanism.** "result: at most 30 lines" is a sentence (:146) and the returns overran it (F20); a cap the driver checks holds without compliance, and the corrective turn means it costs no answer (driver `--help` :50-51: "one corrective turn is spent on a mismatch before exit 13").
**Statement.** Breaks "no driver change" → the shared wording.
**Keep list.** None.
**Followed.** Analyst and refuter agree.

## D17 — M1, P12a: behavioural regressions as the rule, indexed

**Files.** evals/README.md (a paragraph after "Each suite's header comment says what it measures…", :19); evals/orchestrate-live.test.mjs header comment; no page.
**Kind.** Mechanism: an eval policy and the cases the other deltas add.
**Mechanism.** README gains: "A finding that recurred after a page sentence gets a regression that observes the behaviour: offline where a script owns it (agent-run, capture-check, lint-draft, fragments, cli), in the live gate where only a session shows it. A `says`/`shows` pin stays as the cheap layer and is never the only check on a recurring finding." The gate's header lists the recurring findings and their case: F6 → D12; F7 → the Unreleased wait case (:149-154 of the changelog; orchestrate-live:856-858); F8 → the launcher's keeper (Unreleased :76-88, agent-run.test); F11 and F19 → D4's cli case and prompt check; F14 → D6's refusal and id check; F16 → D13's count and D14's lint; F20 → D14's attribution and D15's shape check; plus F1 → D1, F4 → D10, F13 → D6, F9/F10 → D7. Coordinator behaviour cannot be regressed offline (R3), so the paid gate is where those live, and the README says which switch arms it (it already does, :39-43).
**Evals.** No pin removed: retiring `says` pins would lose the cheap layer for nothing. The offline pins the deltas change are named in each delta.
**Cost.** L in total across the gate cases; S for this delta's own text.
**Why a mechanism.** This is the row that says sentences do not hold; its own answer cannot be a sentence on a page. R3's correction (Unreleased already gave F8 a mechanism and F7 a gate case; F14 and F20 got sentences again) is what the index records.
**Keep list.** None.
**Followed.** R3 on both (M1 partial; P12a's "how" revised to the gate).

## D18 — P14a: the activation-position pair

**Files.** evals/orchestrate-live.test.mjs (two cheap sessions); plugins/entrust/research/2026-09-27-field-audit-triage/activation-position.md (a manual protocol for the VS Code extension; the research directory of this run).
**Kind.** Experiment protocol, with a headless half in the gate.
**Mechanism.** Two headless sessions, `model: sonnet`, `maxTurns: 4`, the same trivial task with `/entrust:orchestrate` first and last. The gate records for each whether the page's text arrived (the expanded user message contains "disable-model-invocation: true" and "Your own hands"), whether a Skill call for `entrust:orchestrate` was attempted and refused, and the first assistant text; it fails only if the command-first session did not activate (the existing cases already rely on that). The command-last outcome is the measurement, saved to the case directory. Hypothesis to be settled by it: the client expands a slash command only at the start of the input; at the end it is plain text, the model cannot load a `disable-model-invocation` skill (advisor.test A0's reason, :52), and it reports the skill as absent — the words T8 `be1f1d1e:24` recorded. The VS Code half is a written protocol: the same two prompts, three runs each, the check `grep -c disable-model-invocation ~/.claude/projects/<slug>/<session>.jsonl`, results into the research directory.
**Evals.** The gate pair is the eval; no offline pin. README's line on what the gate spends gains the two Sonnet sessions.
**Cost.** S to write; two cheap paid sessions to run; VS Code by hand.
**Why an experiment.** F2 is `unknown` in the issue and this is the check it names; a page sentence ("put the command first") before the measurement would be advice the audit could not support.
**Keep list.** None.
**Followed.** Analyst and refuter agree (R1: the gate already drives the command first; VS Code needs manual runs).

## D19 — Q3g: the live prober freezes its capture and names its conditions

**File.** plugin/skills/orchestrate/references/roles.md:20, the live prober row.
**Kind.** Sentence.
**"What it does".** Old `makes a behaviour happen for level-3 evidence: rights, a stop, a path` → New `makes a behaviour happen for level-3 evidence: rights, a stop, a path; it takes its baseline capture before any write and never while a writer runs, and each capture names the revision, the mode, the platform and the control it was compared with`.
**"Returns".** Old `what happened, with the report fields` → New `what happened, with the report fields, and per capture its revision, mode, platform and control`.
**Evals.** E9 (:535) counts columns and rows: unchanged. No behavioural case: one incident, causation unknown (R1).
**Cost.** S.
**Why a sentence.** The row is missing a rule a prober can act on; one incident with unknown cause does not warrant a mechanism.
**Keep list.** None.
**Followed.** Agree.

## D20 — Q3c: the cross-review brief carries the requirement, the owning unit and its consumers

**Files.** plugin/skills/orchestrate/SKILL.md:91; plugin/skills/orchestrate/references/roles.md:17.
**Kind.** Sentence.
**Old (:91).** `a cross-review agent is a prompt agent with the diff's path in `TASK:` and the template below in `OUTPUT_SCHEMA:`.`
**New.** `a cross-review agent is a prompt agent with the diff's path in `TASK:`, beside it the requirement the diff answers, the unit that owns the change and the consumers of what it touched, and the template below in `OUTPUT_SCHEMA:`; a valid change in the wrong unit is a finding.`
**roles.md:17, "What it does".** Old `the other family reviews a writer's diff, path in the brief` → New `the other family reviews a writer's diff against the requirement, the owning unit and its consumers, all named in the brief`.
**Evals.** orchestrate.test E2 (:248-253) second string → "a cross-review agent is a prompt agent with the diff's path in `TASK:`, beside it the requirement the diff answers, the unit that owns the change and the consumers of what it touched, and the template below in `OUTPUT_SCHEMA:`". E9 unchanged.
**Cost.** S.
**Why a sentence.** The brief's inputs are stated on the page and were three short of what the incident needed (#15 F4 T6, #16: ownership escaped implementer, reviewer and critic); a reader acts on the list. No enforcement fits a brief's content.
**Keep list.** K5 kept, with three more inputs.
**Followed.** Agree.

## D21 — Q3e: the strong reader's brief bounds the read, and its return tells missing input from a negative

**File.** plugin/skills/orchestrate/references/roles.md:19.
**Kind.** Sentence.
**"What it does".** Old `re-derives a claim by running commands or reading a source whole` → New `re-derives a claim by running commands or reading a source whole, from a brief that names the source, its revision, the decision the answer feeds and the evidence that ends the read; it stops at that evidence`.
**"Returns".** Old `findings with the commands run and their counts` → New `findings with the commands run and their counts, a negative result told apart from an input it could not reach`.
**Evals.** E9 unchanged; no other pin names the row.
**Cost.** S.
**Why a sentence.** The row lacks a stopping rule (T7: 855,530 tokens after the decisive match) and a distinction the driver gives Codex alone (driver.mjs:3951 "Write \"unknown\" for what you could not observe"); the brief is where a Claude reader gets it.
**Keep list.** None.
**Followed.** Agree.

## D22 — Q3j: the criterion that selects survivors is declared before the proposers run

**File.** plugin/skills/orchestrate/references/roles.md:23 (blind proposer) and :24 (judge).
**Kind.** Sentence.
**roles.md:23, "Spawn it when".** Old `a design round; several at once` → New `a design round, after the plan has named the criterion that selects the survivors; several at once`.
**roles.md:24, "What it does".** Old `the final verdict; reads the tree itself, not the returns; `unknown` when its decisive check did not run` → New `the final verdict by the criterion the plan named; reads the tree itself, not the returns; `unknown` when its decisive check did not run`.
:127 ("Between selection rounds, record the candidates rejected, …", F8 pin) is untouched.
**Evals.** E9 unchanged; F8 (:494) unchanged because :127 is not edited.
**Cost.** S.
**Why a sentence.** Independence is on the page; the criterion is absent (`grep -iE 'criterion|criteria'` over the orchestrate pages: 0, O1; re-run here: 0) and a plan can state it.
**Keep list.** None.
**Followed.** Agree.

## D23 — Q3k: measurers and retrospective analysts work from fixed inputs and leave unknowns unknown

**File.** plugin/skills/orchestrate/references/roles.md:28-29.
**Kind.** Sentence.
**roles.md:28, "What it does".** Old `a script over transcripts, reports or files; numbers with the method stated` → New `a script over inputs fixed by path and digest, re-runnable by anyone who has them; numbers with the method stated, and `unknown` for what the inputs do not hold`.
**roles.md:29, "What it does".** Old `a ledger of the coordinator's decisions and their consequences, from traces` → New `a ledger of the coordinator's decisions and their consequences, each incident with its trace address, and `unknown` where the trace has none`.
**Evals.** E9 unchanged.
**Cost.** S.
**Why a sentence.** R3: the rows already give the script, the traces and the retrospective-only spawn; fixed inputs and unknown-for-missing are the two absent clauses, and both are things a brief writer acts on.
**Keep list.** None.
**Followed.** Agree.

## D24 — Q7b: protocol E6, one strong reader against the full policy

**Files.** plugin/skills/experiment/references/protocols.md (a sixth section); evals/experiment.test.mjs F1 (:145-156, "the protocols reference holds E1 to E5 with the seven fields each") gains "E6"; plugin/skills/experiment/SKILL.md:19 says "the four registered first are in protocols.md" while protocols.md:3 says "Five experiments" — pre-existing, not fixed here, recorded below.
**Kind.** Experiment protocol.
**Add.**
    ## E6 One strong reader against the full policy
    **Hypothesis.** On a held-out review task, one strong reader over the whole subject reaches the material findings the full policy reaches (bounded readers or scouts, a split critic, refuters, a completeness critic), at fewer tokens and less owner time.
    **Arms.** A: one Sol strong reader over the whole subject, its return in the five fields. B: the full policy under the orchestrate page, composition by the page's defaults. C: one Opus strong reader, the same-family control for A.
    **Material.** Tasks not in the usefulness journal of #16; for each, the runnable revision, dependencies, sources, complete bodies and grants frozen before any arm; an independent key of material findings built before the run, later comments supplementary; a task whose decisive checks cannot run is marked infeasible and dropped, never rerun.
    **Metrics.** Unique valid findings, clustered; severity; false alarms; missed requirements; completeness; coordinator, agent and relay tokens per arm; elapsed time; retries; corrections; owner-active minutes observed directly. Validity, adoption and origin recorded separately; n stated with an interval, paired by task.
    **Judge.** Two blinded judges, cross-family, over lettered arms with first lines removed; a refuter settles disputes and reports every lost material finding by arm.
    **Budget and stop rule.** Preregistered before the first task: the role, model and effort allocation of B, the budget per arm, the stopping rule, the material-error threshold and the sample size; a cheaper arm is accepted only if the preregistered coverage and false-alarm criteria hold, and any cost-against-quality trade is the owner's word, not the conclusion's.
    **What it cannot show.** The value of any one role inside B, and any task class other than review; a disjoint-area variant of B (Q3f) is a fourth arm only if its ownership and interfaces are frozen before findings.
**Evals.** experiment.test F1's id list gains "E6" (the case loops over ids and the seven fields).
**Cost.** S to write; the run is the owner's paid pilot.
**Why an experiment.** #16 says the overlap simulation cannot replace a prospective pilot, and the framework already expects a single-agent comparator (experiment/SKILL.md:20); registering the protocol is the smallest step that makes the pilot runnable.
**Keep list.** None; the pilot is what would justify changing K3/K2/K4 later.
**Followed.** Agree.

---

## Pins changed, in one list

orchestrate.test.mjs: A1 (shared statement), A3 (D5), B1 (D8), B4 (D7), C2 (D6), C7 (D13, D14), E2 (D20), E5 (D9), F1 (D3), F2 (D10, D12; D11 under option B), F6 (D3), G1 (D16), G6 (D6); new B8 (D8). advisor.test.mjs: D1 (D1); new D3 (D2). agent-contract.test.mjs: none. swarm.test.mjs: none (U2 tolerates the size keywords; the copy is kept equal by D5). experiment.test.mjs: F1 (D24). package.test.mjs: the payload list (D7, D14, D15). run-all.mjs: SUITES (D5, D7, D14). New suites: fragments (D5), capture-check (D7), lint-draft (D14). New cases: cli (D4, D16), agent-run (D6), cleanup (D6). Live gate: D1, D4, D6, D10, D12, D13, D14, D15, D18.

## Conflicts between deltas

- D6 and D13/D14 both edit :53's neighbourhood and step 2; D1 and D2 both edit advisor:17 (D1 first, D2 adds after its first sentence). Apply in the order D5, D6, D7, D8, D13, D14 for orchestrate; D1, D2 for advisor.
- D5 defers the codex load; D6, D15 and D7 name the sibling's scripts and schema by `${CLAUDE_SKILL_DIR}` paths that resolve only once the codex page is loaded (Claude Code substitutes the variable in a skill's body). D6's `--plan` call therefore comes after the codex load in a run with a Codex agent, and an all-Claude run needs the launcher's path another way: the generated composition page (D5) carries the plugin's scripts directory as an absolute path resolved at generation? No — an install's path differs per machine. Resolution: an all-Claude plan skips `--plan` (no Codex launch to refuse) and relies on D6's description convention and the gate; say so on the page. Flagged as the one design gap between D5 and D6.
- D11 option B and the run's own departure from :119 are the same decision; the owner decides once.

## Pre-existing, not fixed here (for the plugin's ISSUES.md, evidence level 1)

- experiment/SKILL.md:19 "the four registered first are in protocols.md" against protocols.md:3 "Five experiments" and five `## E` headings (grep -n '^## E' gives E1–E5).
