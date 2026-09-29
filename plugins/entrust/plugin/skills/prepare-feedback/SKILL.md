---
name: prepare-feedback
description: >-
  Prepares a field report or feedback on a plugin from your own Claude Code sessions: finds the sessions where
  entrust or terse loaded, has orchestrated agents read them under one focus (a release, one run, where their time
  and tokens went, your feedback on a topic, all of these at once, or a question of your own), and returns an issue
  title and body, or a research run when started inside a checkout of agent-skills.
disable-model-invocation: true
metadata:
  version: "0.23.0"
license: MIT
---

The `/entrust:prepare-feedback` the user typed is the explicit start of the orchestrate mode for this run. Read [orchestrate](../orchestrate/SKILL.md) whole with the Read tool, at `${CLAUDE_SKILL_DIR}/../orchestrate/SKILL.md`, and follow it; for an extraction batch, read `${CLAUDE_SKILL_DIR}/../swarm/SKILL.md` the same way. Load neither with the Skill tool. A page read by path has nothing filled in: its `CLAUDE_SKILL_DIR` is its own directory, `${CLAUDE_SKILL_DIR}/../orchestrate` or `${CLAUDE_SKILL_DIR}/../swarm`, and both its `<state>`, the driver's state directory, and its `CLAUDE_PLUGIN_DATA` are `${CLAUDE_PLUGIN_DATA}`; write those values into its commands yourself. Orchestrate runs everything this page does not change: the plan card, the composition and its caps, the wrapper and the poll, approvals, the five fields, the runner, the linter and the completeness critic with its manifest; load `entrust:codex` with the Skill tool once the plan has a Codex agent, as it says. This page adds the focus, the corpus, two ways of reading, the output and the private folder, and where it replaces one of orchestrate's rules it names the rule; [focuses.md](references/focuses.md) holds each focus's unit, labels, layout and roles.

## The start

1. Your first line says where the run is and where the result goes. Inside means `git rev-parse --show-toplevel` is a tree whose `.claude-plugin/marketplace.json` has `"name": "nowely"`, and the result is a research run committed on a new worktree branch; anywhere else the result is an issue title and body in your answer.
2. Build the corpus with `corpus --slug <slug>` and whatever scope the user's words already give, through orchestrate's runner: its tail keeps the summary lines, and its log keeps the `PROJECT=` lines the tail leaves out. Your second line names the plugins its `PLUGINS=` line found.
3. When the user named no focus, show the menu below and wait for the choice; then the plan.

## Focus and scope

- `version`: how a plugin behaved in one release or a window of releases.
- `run`: one run: what failed, what limited it, or what it measured.
- `process`: where the time and tokens of the runs went, by role and by agent and the coordinator's own share, wall time against active time and where the run waited, repeats, stalls, redundant checks and rounds, and whether each role earned its place; every finding ends in a proposal with its expected saving.
- `feedback`: how the user reacted on a topic.
- `all`: every standard focus over one corpus in one run: `version`, `run` and `process` by the same readers, one brief per task carrying all their questions; `feedback` by extraction.
- A question in the user's own words: the plan writes its unit, closed labels, layout and way of reading, extraction when the unit is closed and the sessions many, readers otherwise.

Each focus fixes a unit, closed labels, a layout and a way of reading. A report is not checked against open issues or a defect ledger.

The script counts a skill load from the transcript's records, never from quoted text. A refused load of one of the plugin's skills is a finding for `version`, not a scope signal. Sessions that loaded this page, this one included, are left out and counted.

By default the corpus is every session that loaded the plugin, loads from a checkout included: `version` and `process` cover every project, `run` is one session with its launches, `feedback` the sessions that loaded the plugin. The options narrow it:

- `--version`, repeatable, keeps the loads of the releases it names; `unknown` matches a load whose version cannot be read, which is every load from a checkout.
- `--since` and `--until` take UTC dates, and `--project` takes a directory and everything below it.
- `--session`, repeatable, takes exactly the sessions it names, past every other option and this skill's runs included; `run` picks its session this way.
- `--all-sessions` takes every session with a user message.
- `--plugin` keeps one plugin when `PLUGINS=` names two.

Beside orchestrate's card the plan shows:

- the projects as the scope, one per `PROJECT=` line;
- with `--version` and without `unknown`, "N sessions loaded from a checkout, version unknown: include them?", N from `checkout=`, which counts the checkout sessions that pass every filter but `--version` and are not in the corpus yet; a yes adds `--version unknown`;
- for `feedback`, "every session with a user message: N" from `HUMAN_SESSIONS=`, where the user's "all" means `--all-sessions`;
- the past runs of this skill, left out (`SELF_RUNS=`); bringing one back means naming every session wanted with `--session`;
- that the client deletes transcripts after 30 days unless `cleanupPeriodDays` says otherwise, with `OLDEST=`;
- under `all`, the cost of each focus in its own rows, as [focuses.md](references/focuses.md#all) lists them, so that the user can drop a focus in words; a dropped focus takes its rows and its section of the report with it;
- inside, the worktree and branch the research run is committed on at the end, `.claude/worktrees/prepare-feedback-<slug>` unless the session is in one already, so that the user's "go" is the instruction to work in it.

The user limits the scope in words, and "go" covers only what the plan showed. A T-id the user names becomes its session id through `corpus/index.json`. A scope changed after the plan is a new `corpus` under a new `--slug`: the script never writes over a run.

## Two ways of reading

Orchestrate's rules for the bulk row, in its Model tiers and its plan step, hold as written: an extraction batch runs as the swarm its plan proposes. A report needs four things beyond those pages:

1. **A batch's unit is a corpus part.** `{{UNIT}}` carries the part's full path, `corpus/parts/P###.md` in the private folder, and the fixed answer schema is the focus's closed labels with verbatim quotes. The agent reads the part's pages, `corpus/pages/P###-NN.md`, one `cat` each, so that `coverage` finds each page whole in one output. The verdict unit stays for the stress test.
2. **The card shows the batches as a line of text**, "4 batches of up to 50 Luna", not as launcher rows, each swarm in a run directory of its own, `<state>/orchestrate/<project-slug>/<run>/`.
3. **A launcher row names its role's class.** Plan registration refuses a role with neither a worker nor a checking word, and most roles.md names have neither: write the roles.md name and the class word, as [focuses.md](references/focuses.md#role-words) lists. An all-Claude plan registers nothing.
4. **The script counts what the swarm's summary lacks.** `tokens` reads the tokens in a batch's reports, and `coverage` checks its page reads in the Codex rollout logs.

**Readers with a question** (`version`, `run`, `process`). One strong reader per task or session, with the question and the addresses in its return; run `timeline` once after `corpus`, and each brief names its task's slice of `corpus/timeline.jsonl`, the events whose `at` starts with `T3:`, `T3.f` or `T3.s` for task T3; for `process`, run `process` once after `corpus`, and each brief carries its task's rows from `measures/process.json` and asks which repeats, waits, redundant checks and rounds the numbers point to, with addresses; a split critic before any fan-out wider than one reader; a foreman at three readers or more, its brief opening with this page's first sentence; six alive at most per batch. After each batch run `tokens` over it, `--reports` for Codex agents and `--from` with the figure each Agent call's completion reports, which is the context of the agent's last call rather than its spend; from the second batch on, `--median` is the first batch's median of the same figure, and an agent over three times it stops further launches until the user has seen a new estimate. Under a foreman, its brief carries the stop line and the `tokens` command: it runs `tokens` after each batch, stops launching as you would, and its report gives each worker's tokens. Add a measurer's script wherever the question has numbers; for entrust, a strong reader of the Codex runs' reports; the page dry run and two blind proposers where the focus calls for them; a dedup-and-rank over several readers; one refuter per cluster; the draft in the focus's layout; the publication reviewer and the completeness critic, in the order The output gives. Judges only where focuses.md names them. A paid repeat, such as a control run, is a plan row with its price.

**Under `all`**, one brief per task carries the questions of every readers' focus the plan kept, and the reader returns a section per focus, with addresses; `feedback` runs its extraction over the same corpus, `parts` cut from it.

**Exhaustive extraction** (`feedback`, or a closed focus over many sessions), in order: the sessions kept and dropped, in the plan; `parts`; a split critic on the brief and the labels; a pilot under a protocol written before it, the reference marked by the strong row; the estimate again per unit, the plan again, and a stop, in place of the swarm page's "go" that covers the pilot and the swarm; the batches as swarms, `--concurrency` the machine's core count with the reason in the plan (issue #22: at 36 alive on eight cores, 24 of 36 agents missed a page); the reducer as the swarm page says, also counting the episodes per unit; `coverage`, and a relaunch for every unread page; the merge by a strong agent, then `quotes`; two independent analyses; the draft by the top row; a stress test as a swarm whose unit is a principle and an episode, and counterexamples part by part; one judge; a comparison with the previous run when there is one; the publication reviewer and the completeness critic, in the order The output gives. Run `tokens` after each batch; when an agent passes the stop line, the batch already running goes to its end and no new one starts.

## The output

The report is a publication, not your answer. It is a draft, a new number for each revision, that goes into the private folder as `drafts/NN-report.md` when its review ends, and its first line is the issue title, bare, with no `#`, so the title goes wherever the draft goes: into the manifest, the review and the export. Only your short answer goes through the linter. The layout is the focus's reference in focuses.md. Every report keeps the facts the timeline and the script's counts give, each with its address, apart from the session model's or a reader's account of its reasons, which the report marks a hypothesis: the pages read before each draft and what the owner said while the model worked come from the timeline, never from a model's memory of the session; [focuses.md](references/focuses.md#facts-and-self-analysis) gives the case behind the rule. Under `all` there is one draft, written by the top row: its title is `<plugin> <release or window> field report: <headline findings>`, then a section per focus in the menu's order, each in its focus's layout, read by one publication reviewer and one completeness critic like any draft. Addresses are `T3:282`, a task and a line of its JSONL, `T3.s2:198` for a subagent, `T3.f1:40` for a fork's own turns, and `run:T3.c1` for a Codex run; the map from T-ids to sessions stays in `corpus/index.json`.

Nothing enters the export set unreviewed. Report drafts stay under a temporary directory until the review ends. The publication reviewer and the completeness critic read each frozen draft side by side, the reviewer returning what to remove and the critic its copy with the fixes: the draft less the reviewer's spans is that draft's text, and the critic's copy less the same spans is the next draft, whose changed lines the reviewer reads against the rest of it. The critic's verdict stands for its draft less the reviewer's spans; this replaces orchestrate's re-read on a changed digest, for those removals alone. When orchestrate's critic rule ends the loop, the reviewer reads the last draft whole once more; remove what it flags from every draft that holds it, then `add` the drafts in order, since an added file is never rewritten and `export` copies every draft (on 2026-09-29 a date the third reviewer caught was already in two added drafts, which then stayed out of the export). `rounds.md` and any file under `measures/` or `anonymized/` are drafted there too, read by the reviewer, cleared of what it flags and added. No text under review counts its own review: the report's audit cost and the README's composition cover every agent but those that reviewed the report or the README; the report's reviews go into `rounds.md`, written after the report's last read, and every review's reads, rounds and tokens into your answer, which counts every read before its own critic's and names that critic only in the verdict line (on 2026-09-29 such lines kept going stale for the next read, and one session's report and README took eight completeness reads). The script's own `coverage-*.json`, `tokens-*.json` and `process.json` hold counts, addresses, basenames, model names, and tool and agent-type names that are built in or folded to `mcp` and `custom`, and need no review.

Outside, after the critic's verdict line come the draft's first line, the title, on a line of its own, and the rest of the draft as one fenced block, its fence longer than any fence inside it (four backticks around a body with code); this replaces orchestrate's "Nothing else follows the lint" for this answer. The skill publishes nothing.

Inside, once the drafts and `rounds.md` are added, take these steps; each path is relative to the repository's top level, and from step 2 on to the worktree's:

1. Make the worktree from `HEAD`, `git worktree add .claude/worktrees/prepare-feedback-<slug> -b prepare-feedback-<slug>`, and enter it with EnterWorktree and that `path`; when the toplevel is already a worktree under `.claude/worktrees/`, stay in it.
2. `export --run <run> --to plugins/<name>/research/<date>-<slug>`, `<name>` the plugin the report is about. The step returns stay in the private folder, and `anonymized/` goes in only when the report cites it.
3. Write the folder's `README.md`, with the question, the result, the composition that ran and what stayed in the private folder, and the run's row in `plugins/<name>/research/README.md`.
4. The publication reviewer and the completeness critic read that README and that row side by side, the critic the folder too, through the manifest. No exported file is edited after `export`.
5. Take the critic's copies of the README and the row less what the reviewer flags; the critic's verdict stands for them less those spans, and a later read covers the changed lines, as for a draft.
6. Stage only the research folder and the index row, and commit them on the worktree's branch as one theme, without asking; this replaces orchestrate's "no commit to the live tree without a separate word from the user" for this commit. Push, PR and merge wait for the user's word.

These six steps use no heredoc and no absolute repository path, which an isolated worktree session refuses; orchestrate's heredoc for `--decide --accept` belongs to the reading, before them.

## The private folder

Everything read from the sessions is private by default: what leaves carries only what the user has already made public or would publish on the front page where it goes, and a detail private only in combination with public ones is private. The agents read the transcripts; you read their returns and the script's summaries. The publication reviewer, a strong-row agent that wrote none of the text, checks every detail of what it reads by two questions: would the user publish it on that front page, and does it combine with what is already public, past issues and the research folders' READMEs, or the report itself where GitHub is out of reach. It reads each file bound for the export before its `add`, and inside, the folder's `README.md` and the index row after `export`. What it removed goes to the user with the text.

The folder is `<state>/prepare-feedback/<date>-<slug>/`, `<date>` today's and `<slug>` of `[a-z0-9-]`, beside the orchestrate runs as the experiment records are; `corpus` prints it as `RUN=`, and every other command takes it as `--run <run>`. One script writes it, because your own write under the state directory is refused: draft each file under your temporary directory, then hand it over with `add`. Every call forwards the data directory:

    CLAUDE_PLUGIN_DATA="${CLAUDE_PLUGIN_DATA}" node "${CLAUDE_SKILL_DIR}/scripts/prepare-feedback.mjs" <command> …

The nine commands, `corpus`, `parts`, `add`, `coverage`, `quotes`, `tokens`, `process`, `timeline` and `export`, with their options and what each writes and prints: [commands.md](references/commands.md).

A result file is named after its input and never written over, so give each batch's map and each episodes file a name of its own. `rounds.md` records each of the report's rounds and goes in once, before `export`. `--help` lists the commands and their refusals. Cleanup neither lists nor removes the folder.
