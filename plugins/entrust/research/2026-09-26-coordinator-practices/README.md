# A coordinator below the orchestrator, 2026-09-26

The question: the owner saw every worker's Bash cards in the timeline and proposed moving orchestration one
level down, so that a subagent coordinates the workers and reports to the main session. Can a subagent
launch agents, what does the user see when it does, and what must such a coordinator do?

The answer: yes. A worker that a subagent launches in the foreground stays out of the user's timeline: it
shows as one card inside the subagent's, with its task and its report, and the agent map draws the tree. A
worker it launches in the background comes into the timeline whole. Anthropic's own coordinator prompt,
shipped inside Claude Code, supplied what the orchestrate page lacked on approvals and briefs: the user's
words passed down verbatim, a fresh agent for an action approved mid-run, a brief that states why and what
"done" means and never hands understanding back, and continuing or respawning a worker by what its context
is worth. The page gained a foreman,
[`references/foreman.md`](../../plugin/skills/orchestrate/references/foreman.md); the word "coordinator"
already names the main session on the entrust pages.

## Results

| Measurement | Result | Evidence |
|---|---|---|
| nesting | a general-purpose Haiku subagent launched two general-purpose Haiku grandchildren, one in the foreground and one in the background; no error, both ran their Bash calls | 3 — [probe.md](probe.md), the three transcripts |
| depth cap | three levels below the main session by default; `CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH` or the server flag `tengu_hazel_trellis` changes it, and this machine's `~/.claude.json` caches no value | 1 — [probe.md](probe.md#what-the-code-says) |
| timeline, foreground grandchild | none of its cards: no `echo NESTPROBE-FG-…`, no hand-back; its output appears only inside the coordinator's final text | 3 — the owner's screenshots |
| timeline, background grandchild | all of it: two Bash cards, its hand-back and its final text | 3 — the owner's screenshots |
| timeline, the coordinator itself (launched in the background) | its thinking rows, three lines between calls, two Agent cards with the grandchildren's tasks, and its report twice, as a hand-back card and again as text after the harness asked for visible output | 3 — the owner's screenshots |
| agent map | the tree: main session → coordinator → both grandchildren, each with time and tokens | 3 — the owner's screenshot |
| where the background grandchild reported | to the coordinator, queued while the coordinator waited on the foreground call; the main session got the coordinator's report only | 3 — the coordinator's transcript |
| cost | coordinator 23.9k tokens and 39 s for three calls; grandchildren 21.9k and 21.0k tokens for two `echo` each | 3 — the completion notification and the agent map |
| Anthropic's coordinator prompt | 19 rules: 3 present on the page, 1 present in another form, 5 partial, 7 absent, 2 contradicting it, 1 a constraint on the page itself; 8 adopted, 1 to the ledger as E50, 2 kept as the page has them, 5 left as research | 1 — [vendor-practices.md](vendor-practices.md), quoted from the 2.1.280 binary; the extraction command reproduced the 244 lines byte for byte |

The code reading predicted both timeline results before the probe ran: a foreground subagent drops the
progress of its own children unless `forwardSubagentText` is on, which the extension never sets, and a
background subagent writes its messages into the session's stream itself. [probe.md](probe.md) has both code
paths.

## Evidence for and against a middle layer

From the [2026-09-17 survey](../2026-09-17-orchestration-practices/), re-read for this question:

- For. Cursor's single orchestrator, given "plan, explore, research, spawn tasks, check on workers, review
  code, perform edits, merge outputs, and judge if the loop is done", was overwhelmed; planners that spawn
  subplanners owning a slice fixed it (S1-18, S1-19). The handoff that travels up carries "notes, concerns,
  deviations, findings" and can reopen a finished planner (S1-46). LangGraph, CrewAI, the OpenAI Agents SDK
  and Codex CLI all ship a manager over workers, two of them with multi-level hierarchies (S3-07, S3-21,
  S3-29, S3-39).
- Against. Anthropic's agents split by the phases of one feature spent more tokens on coordination than on
  work (S1-04); in one controlled study a planner-executor-critic team was not separable from one agent at
  equal cost, on a 7B backbone (S2-12, S2-13); Cursor deleted a single integrator that all work had to pass,
  as a bottleneck for hundreds of workers (S1-47).

Consequence on the page: a foreman is proposed only for three workers or more, and its role is cut by
rights, not by phase: it has no channel to the user and no right to change the plan.

## Decisions

The owner's, 2026-09-26 and 2026-09-27, each taken on a recommendation shown with its alternatives:

- The foreman is Opus; "definitely not Sonnet". Fable was weighed and set aside: a Fable foreman would hold
  the one Fable slot for the whole run, and a Fable agent never spawns Fable.
- It runs in the background, so the main session stays free for the user.
- The plan proposes it for three workers or more, and the user's "go" confirms it.
- It may launch the one Fable agent the cap allows.
- The page keeps an explicit model per worker, against Anthropic's "omit the model parameter so workers
  inherit the session model": the tiers are agreed in the plan, so no downshift is the coordinator's own
  initiative.
- The TaskOutput finding went to the ledger as E50, not into this change.

## What went into the pages and what stayed research

Into the pages: `references/foreman.md` (when and how the orchestrator launches a foreman, what the foreman
does, its return), a sentence and a link in the page's bounds paragraph, the Fable launch rule widened to a
foreman, a foreman row in `references/roles.md`, and eight pins in `evals/orchestrate.test.mjs` (I1–I8) with D7
widened; each of the nine fails with the change taken out and passes with it.

Stayed research: the code paths and the depth cap; Anthropic's rules the page does not adopt (the model
inheritance, the check-in timer, the coordinator's restricted tools, "do not use workers to trivially report
file contents"); the evidence against a middle layer.

Not measured: whether a foreman improves a real run (the first real run under the page is the test, and
`/entrust:experiment` can compare a run with and without one); a Codex wrapper launched by a foreman, which
takes the same code path as the probe's foreground grandchild but was not run; whether Stop on the agent map
stops a grandchild; extensions after 2.1.280.

## Files

- [rounds.md](rounds.md): the steps, who ran them and what they cost.
- [probe.md](probe.md): the probe's brief verbatim, what each transcript and the timeline showed, and the code
  paths behind the result.
- [vendor-practices.md](vendor-practices.md): Anthropic's coordinator prompt in Claude Code 2.1.280, quoted
  rule by rule and mapped to the page. The prompt is quoted, not copied: the repository is public and the
  binary is "All rights reserved"; the file has the command that extracts it locally.
