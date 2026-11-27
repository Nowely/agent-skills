# After v3: the fixes, and the plan from here

## What changed after the v3 check

Made after the release text was written, and measured by no run yet:

- **Spend.** `checks.md` gains "What a check may spend": the plan prices each check (agents, models, tokens
  estimated from runs like it); a check whose every result leaves the plan as it is does not run; the sessions
  without the skill are the baseline for every later round and version on the same cases and are not run
  again; a check starts with one session for each case and side, one reader and one confirmer; one session
  runs first and is read before any more of the check start. Anything larger (a repeated run, several sessions
  per side, a second reader, a top-tier role beyond the two below) is an option put to the user with its cost,
  and runs only on their word naming it; a check of more than five sessions is a line of its own in the plan,
  with its count and cost. The selection check runs each request once, the transfer test one session per
  scenario and side; a margin with no second run is reported as undecided, and the plan's rule says before any
  run whether that keeps the work or fails the rule.
- **Tiers.** The top tier is kept for the architecture critic and the from-zero lens. The quality critic, the
  audit, combinations, evidence and prior art move to the executor tier.
- **E171.** The plan reads each size limit as the number the check script prints when run on the skill's own
  directory before the plan is written.
- **E172.** The plan of a Change names the dispositions' fresh reader for the case where the gate lists a line,
  so the user's word on the plan starts it; where no agent can start, the session opens each disposition at
  both places itself and says so in the result.
- **E173.** A statement that no run passes measured nothing, as one that every run passes already did; past the
  correction's limit the user gets both results before anything is undone, and can overrule the undo. The
  first session read before the rest also catches a statement no session can pass on its setup.
- **E174.** The spend table moves into the plan's Spend section with one row for each agent and session, its
  requirement line, model and estimate filled when the plan is written; checkpoints fill what was spent and
  the gain. The checkpoint rule on the largest share keeps its place.

The gate against the release commit listed 30 lines; each is answered, 10 by the owner's words after the
release.

## The plan

Each item names the decision it can change and what it costs, from v3's own figures: a Create session with
the skill to its end about 2.4 USD, to the plan stage about 0.7, a change session about 0.5, a session without
the skill about 0.45, a retro about 4.2. All agents are on the executor tier unless an item says otherwise.
Items 1 to 3 need no new agreement on fan-outs; items 4 to 6 are options for the owner.

| # | Item | Decides | Cost |
|---|---|---|---|
| 1 | The next real uses of `rnd` in this repository, each closed by a retro on that session | the next Change, from a real observation instead of a constructed case | one retro each, about 4 USD |
| 2 | One Create session with the skill, to the plan stage, on one of v3's Create cases; v3's sessions without the skill stand as its baseline | whether the plan now carries the size numbers (E171) and a filled spend table (E174) | about 0.7 USD |
| 3 | One change session on v3's second pending change, with v3's scripted replies; one Create session on the case whose session undid its work | whether the dispositions' reader starts on the plan's word (E172); whether the first-session read catches a statement no session can pass, and the undo waits for the user (E173) | about 3 USD |
| 4 | The main measure, small: one Create case, one session per side on a tree without the old skill-creator pages (v3's side without the skill opened them, so it is not reused here), three fresh users per result, one blind reader | whether `rnd` beats the host alone on Create at all; one session per side cannot give a margin, so a pass reads as undecided | about 4 USD external, plus native readers |
| 5 | The cost of the Create route itself: 7.6 to 11.6 times the host alone in v3 | whether Create needs a light route like Change's | read from the spend tables of items 1 and 2; a design change only after them |
| 6 | Hosts and rivals not measured: Codex, OpenCode; selection beside a host's built-in skill-creator | whether the description holds beside a rival of the same name | about 20 sessions for each host, about 3 USD on Claude Code |

Not planned: the audit and evidence parts of v3's reflection, stopped by a usage limit before they returned,
are not run again; items 1 to 3 read the same sessions' successors. The retro's proposals not yet taken
(repeat every check of a first run in its rerun; show a dropped step in a changed plan before the work; take
tokens from the transcript's usage) wait for item 1 to show one of them. E170 stays in `ISSUES.md`.

The skill is finished for this record when items 2 and 3 show the four fixes at work and two real uses
closed by a retro find no new defect at evidence level 3.

## Where the tokens went, v1 to v3

Counted from the coordinating session's own transcript and its 337 agents' transcripts, as context tokens
read and written per turn (each turn of an agent reads its whole context again). External sessions started
through the call page are not in these figures; the records give them in USD.

| Who | Agents | Turns | Context read and written | Output |
|---|---|---|---|---|
| the coordinating session, Opus | 1 | 2,731 | 1,259M | 3.9M |
| Sonnet agents | 272 | 4,483 | 420M | 3.3M |
| Opus agents | 21 | 2,001 | 400M | 3.4M |
| Fable agents | 34 | 1,549 | 335M | 3.3M |

- Half of the whole is the coordinating session: 2,731 turns at about 0.46M of context each. It read files,
  ran scripts and checked returns itself, one small step per turn, over a context that grew to half a million
  tokens between compactions.
- Of the agents, about 24 long ones, each of 100 to 300 turns, used some 690M, three fifths of the agents' share.
  Most were readers and writers on Opus or Fable: one Fable writer 84M, a reader of the records 58M, the
  reflection's evidence lens 47M.
- Short agents were cheap beside them: the 72 downstream users of v3's main measure used 47M together, under
  0.7M each.

So the spend followed long contexts read again on every turn, not the count of agents: one long writer on the
top tier cost more than seventy short users on Sonnet. What follows for the next runs, beside the rules of
"What a check may spend": the coordinating session hands each phase to a fresh session with the plan file as
its start, and takes from agents a short return with its long part in a file; an agent that reads much gets
the files it needs and a fixed question, on the executor tier; a writer gets one part at a time, not the whole
design.
