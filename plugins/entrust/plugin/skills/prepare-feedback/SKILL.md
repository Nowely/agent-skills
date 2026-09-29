---
name: prepare-feedback
description: >-
  Prepares a field report or feedback on a plugin from your own Claude Code sessions: finds the sessions where
  entrust or terse loaded, has orchestrated agents read them under one focus (a release, one run, your feedback
  on a topic, or a question of your own), and returns an issue title and body, or a research run when started
  inside a checkout of agent-skills.
disable-model-invocation: true
metadata:
  version: "0.22.0"
license: MIT
---

The `/entrust:prepare-feedback` the user typed is the explicit start of the orchestrate mode for this run. Read [orchestrate](../orchestrate/SKILL.md) whole with the Read tool, at `${CLAUDE_SKILL_DIR}/../orchestrate/SKILL.md`, and follow it; for an extraction batch, read `${CLAUDE_SKILL_DIR}/../swarm/SKILL.md` the same way. Load neither with the Skill tool. A page read by path has nothing filled in: its `CLAUDE_SKILL_DIR` is its own directory, `${CLAUDE_SKILL_DIR}/../orchestrate` or `${CLAUDE_SKILL_DIR}/../swarm`, and both its `<state>`, the driver's state directory, and its `CLAUDE_PLUGIN_DATA` are `${CLAUDE_PLUGIN_DATA}`; write those values into its commands yourself. Orchestrate runs everything this page does not change: the plan card, the composition and its caps, the wrapper and the poll, approvals, the five fields, the runner, the linter and the completeness critic with its manifest; load `entrust:codex` with the Skill tool once the plan has a Codex agent, as it says. This page adds the focus, the corpus, two ways of reading, the output and the private folder, and where it replaces one of orchestrate's rules it names the rule; [focuses.md](references/focuses.md) holds each focus's unit, labels, layout and roles.

## The start

1. Your first line says where the run is and where the result goes. Inside means `git rev-parse --show-toplevel` is a tree whose `.claude-plugin/marketplace.json` has `"name": "nowely"`, and the result is a research run committed on a new worktree branch; anywhere else the result is an issue title and body in your answer.
2. Build the corpus with `corpus --slug <slug>` and whatever scope the user's words already give, through orchestrate's runner: its tail keeps the summary lines, and its log keeps the `PROJECT=` lines the tail leaves out. Your second line names the plugins its `PLUGINS=` line found.
3. When the user named no focus, show the menu below and wait for the choice; then the plan.

## Focus and scope

- `version`: how a plugin behaved in one release or a window of releases; on request, through the lens of role usefulness.
- `run`: one run: what failed, what limited it, or what it measured.
- `feedback`: how the user reacted on a topic.
- A question in the user's own words: the plan writes its unit, closed labels, layout and way of reading, extraction when the unit is closed and the sessions many, readers otherwise.

Each focus fixes a unit, closed labels, a layout and a way of reading. A report is not checked against open issues or a defect ledger.

The script counts a skill load from the transcript's records, never from quoted text. A refused load of one of the plugin's skills is a finding for `version`, not a scope signal. Sessions that loaded this page, this one included, are left out and counted.

By default the corpus is every session that loaded the plugin, loads from a checkout included: `version` covers every project, `run` is one session with its launches, `feedback` the sessions that loaded the plugin. The options narrow it:

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
- inside, the worktree and branch the research run is committed on at the end, `.claude/worktrees/prepare-feedback-<slug>` unless the session is in one already, so that the user's "go" is the instruction to work in it.

The user limits the scope in words, and "go" covers only what the plan showed. A T-id the user names becomes its session id through `corpus/index.json`. A scope changed after the plan is a new `corpus` under a new `--slug`: the script never writes over a run.

## Two ways of reading

Orchestrate's rules for the bulk row, in its Model tiers and its plan step, hold as written. A report needs five things beyond those pages:

1. **The plan starts the swarms.** It lists the batches with their count, and the user's "go" starts them, in place of the typed `/entrust:swarm` the swarm page asks for. Launch each batch with `CLAUDE_PLUGIN_DATA="${CLAUDE_PLUGIN_DATA}" node "${CLAUDE_SKILL_DIR}/../swarm/scripts/swarm.mjs" --units <file> --brief <template> --run <run directory> --concurrency <cores>`.
2. **A batch's unit is a corpus part.** `{{UNIT}}` is a part's full path, `corpus/parts/P###.md` in the private folder. The agent reads the part's pages, `corpus/pages/P###-NN.md`, one `cat` each, so that `coverage` finds each page whole in one output, and returns the focus's closed labels with verbatim quotes. The swarm's own unit, a claim with a verdict, stays for the stress test.
3. **Each batch has a run directory of its own, `<state>/orchestrate/<project-slug>/<run>/`, and no registered plan.** The launcher registers only ids that start with a letter and, under a registered plan, refuses the swarm's `001` to `050`. The card shows the batches as a line of text, "4 batches of up to 50 Luna", not as launcher rows.
4. **A launcher row names its role's class.** Plan registration refuses a role with neither a worker nor a checking word, and most roles.md names have neither: write the roles.md name and the class word, as [focuses.md](references/focuses.md#role-words) lists. An all-Claude plan registers nothing.
5. **The script counts what the swarm's summary lacks.** `tokens` reads the tokens in a batch's reports, and `coverage` checks its page reads in the Codex rollout logs.

**Readers with a question** (`version`, `run`). One strong reader per task or session, with the question and the addresses in its return; a split critic before any fan-out wider than one reader; a foreman at three readers or more, its brief opening with this page's first sentence; six alive at most per batch. After each batch run `tokens` over it, `--from` with the tokens each Agent call's completion reports, `--reports` for Codex agents; from the second batch on, `--median` is the first batch's median, and an agent over three times it stops further launches until the user has seen a new estimate. Under a foreman, its brief carries the stop line and the `tokens` command: it runs `tokens` after each batch, stops launching as you would, and its report gives each worker's tokens. Add a measurer's script wherever the question has numbers; for entrust, a strong reader of the Codex runs' reports; the page dry run and two blind proposers where the focus calls for them; a dedup-and-rank over several readers; one refuter per cluster; the draft in the focus's layout; the publication reviewer and the completeness critic, in the order The output gives. A judge only where the focus's reference had one. A paid repeat, such as a control run, is a plan row with its price.

**Exhaustive extraction** (`feedback`, or a closed focus over many sessions), in order: the sessions kept and dropped, in the plan; `parts`; a split critic on the brief and the labels; a pilot under a protocol written before it, the reference marked by the strong row; the estimate again per unit, the plan again, and a stop, in place of the swarm page's "go" that covers the pilot and the swarm; the batches through `swarm.mjs`, `--concurrency` the machine's core count with the reason in the plan (issue #22: at 36 alive on eight cores, 24 of 36 agents missed a page); the reducer as the swarm page says, also counting the episodes per unit; `coverage`, and a relaunch for every unread page; the merge by a strong agent, then `quotes`; two independent analyses; the draft by the top row; a stress test as a swarm whose unit is a principle and an episode, and counterexamples part by part; one judge; a comparison with the previous run when there is one; the publication reviewer and the completeness critic, in the order The output gives. Run `tokens` after each batch; when an agent passes the stop line, the batch already running goes to its end and no new one starts.

## The output

The report is a publication, not your answer. It is a draft in the private folder, `drafts/NN-report.md`, a new number for each revision, and its first line is the issue title, bare, with no `#`, so the title goes wherever the draft goes: into the manifest, the review and the export. Only your short answer goes through the linter. The layout is the focus's reference in focuses.md. Addresses are `T3:282`, a task and a line of its JSONL, `T3.s2:198` for a subagent, `T3.f1:40` for a fork's own turns, and `run:<id>`; the map from T-ids to sessions stays in `corpus/index.json`.

Nothing enters the export set unreviewed. Each file bound for it, each report draft, `rounds.md` and any file you add under `measures/` or `anonymized/`, goes in one order: it is drafted under a temporary directory; the publication reviewer reads it and returns what to remove; you remove it; you `add` it, a draft as the next `drafts/NN-report.md`; and for a draft, the completeness critic reads it last, over the frozen manifest. A change the critic asks for is a new draft, through the same order. The script's own `coverage-*.json` and `tokens-*.json` hold basenames and counts, and need no review.

Outside, after the critic's verdict line come the draft's first line, the title, on a line of its own, and the rest of the draft as one fenced block, its fence longer than any fence inside it (four backticks around a body with code); this replaces orchestrate's "Nothing else follows the lint" for this answer. The skill publishes nothing.

Inside, once the critic has passed the last draft, take these steps; each path is relative to the repository's top level, and from step 2 on to the worktree's:

1. Make the worktree from `HEAD`, `git worktree add .claude/worktrees/prepare-feedback-<slug> -b prepare-feedback-<slug>`, and enter it with EnterWorktree and that `path`; when the toplevel is already a worktree under `.claude/worktrees/`, stay in it.
2. `export --run <run> --to plugins/<name>/research/<date>-<slug>`, `<name>` the plugin the report is about. The step returns stay in the private folder, and `anonymized/` goes in only when the report cites it.
3. Write the folder's `README.md`, with the question, the result, the composition that ran and what stayed in the private folder, and the run's row in `plugins/<name>/research/README.md`.
4. The publication reviewer reads that README and that row, and you remove what it flags from those two files. No exported file is edited after `export`.
5. The completeness critic reads the folder and the row through the manifest.
6. Stage only the research folder and the index row, and commit them on the worktree's branch as one theme, without asking; this replaces orchestrate's "no commit to the live tree without a separate word from the user" for this commit. Push, PR and merge wait for the user's word.

These six steps use no heredoc and no absolute repository path, which an isolated worktree session refuses; orchestrate's heredoc for `--decide --accept` belongs to the reading, before them.

## The private folder

Everything read from the sessions is private by default: what leaves carries only what the user has already made public or would publish on the front page where it goes, and a detail private only in combination with public ones is private. The agents read the transcripts; you read their returns and the script's summaries. The publication reviewer, a strong-row agent that wrote none of the text, checks every detail of what it reads by two questions: would the user publish it on that front page, and does it combine with what is already public, past issues and the research folders' READMEs, or the report itself where GitHub is out of reach. It reads each file bound for the export before its `add`, and inside, the folder's `README.md` and the index row after `export`. What it removed goes to the user with the text.

The folder is `<state>/prepare-feedback/<date>-<slug>/`, `<date>` today's and `<slug>` of `[a-z0-9-]`, beside the orchestrate runs as the experiment records are; `corpus` prints it as `RUN=`, and every other command takes it as `--run <run>`. One script writes it, because your own write under the state directory is refused: draft each file under your temporary directory, then hand it over with `add`. Every call forwards the data directory:

    CLAUDE_PLUGIN_DATA="${CLAUDE_PLUGIN_DATA}" node "${CLAUDE_SKILL_DIR}/scripts/prepare-feedback.mjs" <command> …

- `corpus --slug <slug>`, scoped by `--plugin entrust|terse`, `--version <v>`, `<v>..<v>` or `unknown`, `--since YYYY-MM-DD`, `--until YYYY-MM-DD`, `--project <cwd>` and `--session <session-id>` (`--version`, `--project` and `--session` repeatable), and `--all-sessions` for every session with a user message: makes `<run>` and writes `corpus/index.json` and `corpus/turns.jsonl`. It prints one `PROJECT=` line per project, then its summary lines with `RUN=` last: `PLUGINS=` and `HUMAN_SESSIONS=` counted before any filter, and the counts the plan shows.
- `parts --run <run>`: cuts `corpus/turns.jsonl` into parts of about 60k characters and pages of 18k at most, listed with their digests in `corpus/parts.json`.
- `add --run <run> --name <relative name> --from <file>`: puts a file under `ledger/`, `measures/`, `drafts/` or `anonymized/`, or as `rounds.md`; each step's return goes under `ledger/`, each draft as `drafts/NN-report.md`.
- `coverage --run <run> --map <tsv>`: the map has one line per agent, `agent-id<TAB>report.json<TAB>P###[,P###]`, written from the batch's units file and the swarm's `summary.json`; it names every agent with an unread page, then its counts.
- `quotes --run <run> --episodes <jsonl>`: one JSON object per line with a `quote` and an optional `id`; each quote comes back `exact`, `near` with the nearest match and its address, or `missing`.
- `tokens --run <run>` with `--reports <dir>`, a batch's run directory, or `--from <tsv>`, lines of `agent<TAB>tokens`, and `[--median <n>]`: every agent over three times `<n>` when `--median` is given, then the median and the maximum.
- `export --run <run> --to <relative dir>`: copies the drafts, `rounds.md`, `measures/` and `anonymized/` into a directory that does not exist yet, outside the state directory.

A result file is named after its input and never written over, so give each batch's map and each episodes file a name of its own. `rounds.md` records each round's findings and goes in once, before `export`. `--help` lists the commands and their refusals. Cleanup neither lists nor removes the folder.
