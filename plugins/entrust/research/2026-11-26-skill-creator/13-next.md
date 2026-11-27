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
- **Tiers.** The top tier is kept for the architecture critic, the quality critic and the from-zero lens. The
  audit, combinations, evidence and prior art move to the executor tier (the quality critic went back to the top
  tier by experiment A, below).
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

The gate against the release commit listed 30 lines; each is answered. Ten are answered by the owner's words
after the release, 3 of them in part (they move roles to the executor tier, and the words do not name the
roles). The owner, asked, confirmed both decisions the audit flagged: the roles on the executor tier (the quality
critic by experiment A, below) and the spend table by agent.

## Results of items 2, 3, 5 and 6

- **Item 2.** One Create session on the ledger case at b546935, the same tree and request as v3's D7 rerun, 0.75
  USD, to the plan stage. Its plan gives the size limits as numbers read from the check script (E171), its spend
  table has a row for each agent with model and count at plan time (E174), and it put two larger samples to the
  user as options with their reasons. One session, read by the coordinator, not blind.
- **Experiment A.** Of the 21 holding objections the Sonnet critic found 5, part 4, missed 12: 7 of 21 against a
  rule of 16. It raised 9 new objections, all holding at their place. Decision: the quality critic goes back to
  the top tier. One run a side shows no spread.
- **Experiment B.** Of the trial retro's nine proposals the audit alone found 4, part 4, missed 1: 6 of 9 against
  a rule of 7. Two new findings held. It used about 0.15M tokens against the trial retro's 4.2 USD. The retro keeps
  both prepare-feedback's reader and the audit.
- In both, the cheaper reader found other defects rather than fewer of the same; an observation from one run a
  side, which decides nothing.
- **Item 3 (E172, E173).**
  - E172: one change session on v3's second pending change with v3's scripted replies, at b546935, 0.74 USD. Its
    gate listed five lines; it then started a fresh reader of the removed text (in v3 the same reply left none
    started), though its plan had not named one and the reader was briefed by the session, not as the verifier.
    Of 54 facts 40 are kept, 1 in part and 13 are the defect entry removed by the repository's rule; the part is
    fact 23 again, a condition dropped while its rule moved, which the session's reader did not see. So the fix
    starts the reader, and a reader asked for lost facts still misses a dropped condition.
  - E173: one Create session on the ledger case to its end, at 4257f12, 2.46 USD, two turns. Its one check (one
    session with the skill, one without, eight statements) failed by its plan's rule; it kept the work, gave the
    user the result with no undo, and declined a correction fitted to one run. The undo past the correction's
    limit was not reached, so that part of E173's fix is unmeasured. It ran the smallest sample and noted that
    seven of eight statements passed on both sides. It also dropped steps (the dry run, the selection check, the
    verifier, reflection, the architecture critic's second read) and reported them after the work, not as a
    changed plan before it; and the harness started all its agents on Sonnet, so the critics' tier could not be
    followed in it.
  - Item 3 cost 3.2 USD in all.

## The plan

Each item names the decision it can change and what it costs, from v3's own figures: a Create session with
the skill to its end a median of 4.47 USD (1.62 to 7.51 over six sessions), to the plan stage about 0.7, a change session about 0.5, a session without
the skill about 0.45, a retro about 4.2. All agents are on the executor tier unless an item says otherwise.
Items 1 to 3 need no new agreement on fan-outs; items 4 to 8 are options for the owner.

| # | Item | Decides | Cost |
|---|---|---|---|
| 1 | The next real uses of `rnd` in this repository, each closed by a retro on that session | the next Change, from a real observation instead of a constructed case | one retro each, about 4 USD |
| 2 | One Create session with the skill, to the plan stage, on one of v3's Create cases; v3's sessions without the skill stand as its baseline | whether the plan now carries the size numbers (E171) and a filled spend table (E174) | about 0.7 USD; done, see Results of items 2, 3, 5 and 6 |
| 3 | One change session on v3's second pending change, with v3's scripted replies; one Create session on the case whose session undid its work | whether the dispositions' reader starts on the plan's word (E172); whether the first-session read catches a statement no session can pass, and the undo waits for the user (E173) | about 5 USD; done, see Results of items 2, 3, 5 and 6 |
| 4 | The main measure, small: one Create case, one session per side on a tree without the old skill-creator pages (v3's side without the skill opened them, so it is not reused here), three fresh users per result, one blind reader | whether `rnd` beats the host alone on Create at all; one session per side cannot give a margin, so a pass reads as undecided | about 5 USD external, plus native readers |
| 5 | Experiment A: the quality critic on the executor tier against v3's top-tier critic on the same text (two Sonnet agents); it stays on the executor tier when it finds at least 16 of the 21 holding objections below, a part counting a half | whether the quality critic keeps the executor tier (the move was made with no run) | two Sonnet agents; done, see Results of items 2, 3, 5 and 6 |
| 6 | Experiment B: a retro by rnd's audit alone on the session v3's trial retro read, against that retro's nine proposals (two Sonnet agents) | whether the retro keeps prepare-feedback's reader | two Sonnet agents; done, see Results of items 2, 3, 5 and 6 |
| 7 | The cost of the Create route itself: 7.6 to 11.6 times the host alone in v3 | whether Create needs a light route like Change's | read from the spend tables of items 1 and 2; a design change only after them |
| 8 | Hosts and rivals not measured: Codex, OpenCode; selection beside a host's built-in skill-creator | whether the description holds beside a rival of the same name | about 20 sessions for each host, about 3 USD on Claude Code |

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
| other agents (Haiku and synthetic) | 10 | 73 | 5M | 0.1M |

- Half of the whole is the coordinating session: 2,731 turns at about 0.46M of context each. It read files,
  ran scripts and checked returns itself, one small step per turn, over a context that grew to half a million
  tokens between compactions.
- Of the agents, 17 of 100 turns or more used 611M, about half of the agents' share. Most were readers and writers on Opus or Fable: one Fable writer 84M, a reader of the records 58M, the
  reflection's evidence lens 47M.
- Short agents were cheap beside them: the 72 downstream users of v3's main measure used 47M together, under
  0.7M each.

So the spend followed long contexts read again on every turn, not the count of agents: one long writer on the
top tier cost more than seventy short users on Sonnet. What follows for the next runs, beside the rules of
"What a check may spend": the coordinating session hands each phase to a fresh session with the plan file as
its start, and takes from agents a short return with its long part in a file; an agent that reads much gets
the files it needs and a fixed question, on the executor tier; a writer gets one part at a time, not the whole
design.

## Open after v4

- A dispositions reader's brief that names conditions, not only facts (E172's fact 23).
- Steps dropped without a changed plan (E173's session, and the retro's proposal of the same kind).
- The undo past the correction's limit, still unmeasured.

## Open objections from v3

The second quality critic of v3 raised 22 objections; a verifier found 21 still holding in the released text (the
second, on removing a fact by "decide yourself", was fixed). They are the observation of the next Change and the
input of experiment A.

1. A stage no baseline session reached reads as "no session failed", so it gets no step.
2. A reply that leaves a choice, with a condition on it, is read as a free choice and not as a correction.
3. A retro does not say what the session does at its first item, nor on whose word its two parts start.
4. The rule on departing from the plan does not clearly cover a departure inside a file the plan named.
5. "For a change" in the judges' briefs reads as the route Change or as any work on a skill that exists.
6. A Create that neither makes a new skill nor rewrites one has no baseline, and its stages never settle.
7. Change's steps 5 and 6 do not carry the architecture critic's read of a check that runs sessions.
8. When the owner of a value is asked and the reply leaves it to the agent, the text does not say what stands.
9. A question with no recommendation leaves the plan nothing to be drawn under.
10. Whether a Change's plan states the five parts of the text decision, and how the size limits are stated.
11. A small change for which the user asks runs is not said to take the plan file and step 6.
12. The flag that gives a session the agent tool is not named in the hosts page.
13. "Or lists files of its kind" reads two ways.
14. A figure measured once fell out of the examples of what stays off a page.
15. "Keep its text in the run directory" for an undone change reads as the new skill's arm alone.
16. "No fact as step 3 defines one" decides the light route on an open list.
17. Facts are stated in two places in a number of pairs of files.
18. Step numbers: Change's step 4 is Create's 3, and the references mix the two numberings.
19. Small points: unlinked file names at the step that needs them, loose wording, "unless" tails.
20. The description leaves a retro request a near miss.
21. The quality critic that does the verifier's second item is not given the skill as it was.

## Reflection after v4

The audit ran on Sonnet within 50 tool calls and found five things; each was dealt with in this change.

1. The retirements rest on the owner's words less than the record said: 3 of the 11 were part, one row cited words
   that do not speak of it. The row is deleted and the count now reads 10, 3 of them in part (E1).
2. The plan's prices undercount: a Create session with the skill costs a median of 4.47 USD, not 2.4. The
   figures are corrected (E2).
3. The largest cost, the coordinating session's own turns, had no rule in the skill, and the long-agent figure did
   not recount. The table and the figure are corrected, and a rule on the session's context is added to the
   plan page (E3, E4).
4. "Released regardless" claimed more than the owner's words, and the 22 objections reached the record only as a
   count. The sentence is narrowed and the 21 that hold are listed (E5, E6).
5. The coordinator wrote text after it had said the writing goes to an executor, and its plan table repeated E174;
   the plan now carries experiments A and B and this paragraph (E7).
