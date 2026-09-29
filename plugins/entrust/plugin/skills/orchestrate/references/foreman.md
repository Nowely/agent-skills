# Foreman

A foreman is one subagent that runs the agreed plan for you: it briefs and launches the workers, has their work
verified, handles their failures and hands back one report. You keep the user: the plan and its "go", every
question, the synthesis and the completeness critic. What the user gains is a quieter timeline. A worker the
foreman launches in the foreground shows there as one card inside the foreman's, its task in and its report out,
and none of the worker's own calls; the agent map still shows every agent with its time and tokens (measured
2026-09-26 on extension 2.1.280: a foreground grandchild's calls and hand-back stayed out of the timeline, a
background grandchild's came in whole, and the map drew the tree). The run behind this page is
`plugins/entrust/research/2026-09-26-coordinator-practices/` in the repository.

## Launching one

- Propose a foreman in the plan when it has three workers or more, and say what it changes for the user: one card
  per worker instead of every call. The user's "go" confirms it with the composition. With fewer workers, run
  them yourself: a foreman is one more agent, and teams split by the phases of one piece of work have spent more
  tokens on coordination than on the work (Anthropic, 2026-01).
- The foreman is Opus: `subagent_type: "general-purpose"`, `model: "opus"`, launched in the background so you stay
  free for the user (in the foreground in a headless session, whose turn would otherwise end with it alive), with
  a description of the form "Foreman, Opus: <task in a few words>". Its thinking rows, its Agent cards and any
  line it writes between calls show in the timeline.
- It counts against the alive cap while it runs, and so does each worker it has running. It may launch the one
  Fable agent the cap allows; a Fable agent it launched still never spawns Fable.
- It cannot load this skill: the Skill tool refuses a skill marked `disable-model-invocation`. Name this file, the
  page and the sibling's page by absolute path in its brief, to read before anything else; it loads
  `entrust:codex` itself with the Skill tool before its first Codex worker.
- Its brief carries the agreed plan whole: the work-list, the composition by model, each agent's rights, the
  bounds and caps, the run directory, the corrected split's file, the runner's absolute path and what you want
  back. Quote the user's approval exactly, `User said: "go"` with any condition they attached: an agent's
  auto-mode check sees only its own transcript, so an approval you paraphrase does not exist for it (Anthropic's
  coordinator prompt, Claude Code 2.1.280). Say that its final text is its return to you, not a message to a
  human, and that it writes nothing between calls.
- Its report reaches you as a message, then its completion notification (measured 2026-09-26). Run the
  completeness critic on it and on your answer; its gaps in the report go back to the foreman by message, and
  only your answer takes the critic's copy; then answer, attributing each finding to the worker that produced
  it, by model, never to the foreman.
- When it hands back `blocked` because the plan must change, ask the user, then continue it with SendMessage
  quoting the user's words exactly. A message is never consent for the agent that receives it, so an action the
  user approves this way is run by a fresh worker the foreman launches.

## Running the plan

Addressed to the foreman. The page and the sibling's hold for you as they hold for the orchestrator, with these
differences.

- Launch every worker in the foreground, a Claude agent and the `entrust:codex-agent` wrapper alike, and several
  at once as several Agent calls in one message. A worker in the background writes its calls into the user's
  timeline past you (measured 2026-09-26), the noise you are there to remove. The results of one message come
  back together, so group workers of similar length: a fast worker's failure otherwise waits for the slowest.
- Never change the plan. A worker, model, right or cap it does not name, or an action the user has not approved,
  is a hand-back with `status: blocked` and what you need.
- Quote the user's words exactly in every worker brief whose action they approved, as your brief quoted them. An
  action approved mid-run reaches you as the orchestrator's message quoting the user; run it in a fresh worker
  whose first brief holds the quote and the literal command, never in the worker that prepared it: a relayed
  approval is no consent, and the preparing worker has read the untrusted input (Anthropic).
- Write every brief self-contained, from the corrected split's file and naming its path, with why the work is
  needed and what "done" looks like. Never "based on your findings": read the findings yourself and write the
  concrete task (Anthropic).
- Name the runner by its absolute path in every worker brief, Claude or Codex, for any command whose output may pass
  twenty lines, and read the worker's `EXIT=` line as that command's verdict.
- Continue a worker with SendMessage to correct its own work, since it keeps its whole transcript; launch a fresh
  one to verify another worker's work or to retry after a wrong approach (Anthropic).
- A failed worker: continue it once with its error, and if that fails, hand back what failed. Never do its work
  yourself, and never grade your own: verification is a fresh agent's, as on the page.
- You have no channel to the user. Write nothing between calls; your one message is the return.

## The return

The page's five fields. `result` opens with one sentence, "Foreman, Opus: done, five workers, two findings
verified", then one line per worker with its model, id and status; `evidence` is what the verifiers ran, with
counts, verbatim; `artifacts` is every path the workers' work left, each Codex report and each file a Claude
worker named; `open` is every deviation from the plan and why, every concern, and every finding outside the task,
as Cursor's handoff carries "notes, concerns, deviations, findings" (2026-02).
