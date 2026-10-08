---
name: prepare-feedback
description: >-
  Reflects on how a plugin's skill worked in your own Claude Code sessions: finds the sessions where entrust or
  terse loaded, has agents read them under your question, and returns findings with transcript addresses and
  proposals to improve the skill.
disable-model-invocation: true
metadata:
  version: "0.27.0"
license: MIT
---

The `/entrust:prepare-feedback` the user typed starts orchestrate for this run: read
[orchestrate](../orchestrate/SKILL.md) whole, as the host adapter reads an explicit-only skill
([Claude Code](../claude/SKILL.md#skills)), and follow it. This page adds the question, the sessions, how they are
read and the report. `<skill-dir>` is this skill's installed directory.

## The question and the sessions

1. Take the user's question. With none, it is: where did the skill fail or limit the work, what worked, and what
   would improve it.
2. Build the corpus through orchestrate's capture runner:

       node "<skill-dir>/scripts/prepare-feedback.mjs" <command> …

   with `corpus --slug <slug>` and the scope the user's words give: `--session <id>` (repeatable) for named
   sessions; `--plugin entrust|terse`; `--version <v>`, `--since`, `--until` (UTC dates) and `--project <dir>` to
   narrow; `--all-sessions` for every session with a user message. By default the corpus is every session that
   loaded the plugin; this skill's own runs are left out and counted (`SELF_RUNS=`). It prints one `PROJECT=` line
   per project, the counts, and `RUN=`, the private folder `<state>/prepare-feedback/<date>-<slug>/`.
3. The card shows the sessions in scope (their count, projects and `OLDEST=`; Claude Code deletes transcripts
   after 30 days unless `cleanupPeriodDays` says otherwise), the question and the readers. Wait for "go". A scope
   changed after the plan is a new `corpus` under a new `--slug`.

## Reading

- Run `timeline --run <run>` once. `corpus/timeline.jsonl` holds each task's events, the owner's messages, the
  skills typed and loaded, the plugin pages read, the drafts, the agents, each at an address: `T3:282` a task and
  a line of its transcript, `T3.s2:198` a subagent, `T3.f1:40` a fork, `run:T3.c1` a Codex run. When the question
  is about time or tokens, run `process --run <run>` too: `measures/process.json` has a row per task and agent.
- One strong-tier reader per session, or per task in a long one, gets the question, its slice of the timeline and
  its transcript paths from `corpus/index.json`. It returns findings, each with its addresses, its kind (skill
  text, script, harness, environment) and its evidence level: 1 the line resolves, 2 an independent reader would
  say the same, 3 the behaviour was made to happen.
- A fact comes from the transcript: an event of the timeline or a count. A model's own account of why it acted,
  the session's or a reader's, is a hypothesis and is marked as one.
- More sessions than six readers can take run in batches, as orchestrate's bulk row says.

## The report

- One refuter per cluster of findings checks it against its addresses. `quotes --run <run> --episodes <jsonl>`
  says whether each quoted line is in the transcripts: exact, near (with the closest text) or missing.
- The report opens with a title line, then: the headline findings; each finding with what happened, its
  addresses, the page or script line of the skill it bears on, its kind, level and the refuter's verdict; what
  worked; proposals for the skill, each naming the finding it answers; and the scope and method (the sessions,
  the readers, what was left out and why).
- Everything read from the sessions is private by default: the report carries only what the user has already
  made public or would publish, and a detail private only in combination with public ones is private. An agent
  that wrote none of the report checks every detail by that rule before it goes out; what it removed goes to the
  user beside the report.
- The report goes in your answer: its title on a line of its own, then its body as one fenced block whose fence is
  longer than any fence inside it. Orchestrate's completeness critic reads it first. The skill publishes nothing;
  the private folder keeps the corpus, the timeline and the measures, and the cleanup neither lists nor removes it.
