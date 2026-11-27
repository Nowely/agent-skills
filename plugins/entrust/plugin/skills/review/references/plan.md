# Review plan

How the review's plan is made and shown when the request or a parent's brief does not already fix every choice.
[The skill's Plan](../SKILL.md#plan) says when to read this and what holds whoever made the plan: approval, a
recheck of the diff, and what happens when an agent fails.

## Choices

Each choice is shown with its alternative and the one selected.

- **Mode:** one reviewer (default), or a coordinator with four direction helpers, for a diff with several risky
  areas. The coordinator still reads the whole diff, so multi mode does not raise the size one review can hold (one
  held 1,085 changed lines). Multi costs two to six times the tokens.
- **Where:** in this session (default), or in a subagent while this session conducts, which keeps the analysis out
  of the working session.
- **Checking agents:** an independent target, a critic and a verifier (default), or none. The plan says in a clause
  what each does: the target sketches the solution from the task and the base code without seeing the change, the
  critic challenges the draft, the verifier checks its facts.
- **Result:** the full record and its page (default), for a change reviewed before a
  [continuation](report-data.md#the-next-revision) that reads only what changed, or, for a small change, a short
  review: the same reading and directions, answered in the response with no record, block map or page; its checking
  agents get the draft response, and its challenges go in the response. The plan offers the short review only for a
  small change.
- **Full record:** name one comparison reader, or use staged self-review when no additional agent is approved.
- **Agents:** each agent the choices above start, with its exact model and the session that starts it, and scouts up
  to a stated number. By default the independent target and the critic run on the reviewer's model, the verifier and
  scouts on a lighter one. On four real changes of 307 to 1,085 lines, a review with them took 610k to 1M tokens and
  8 to 31 minutes, about 70% of the tokens theirs and the reconciling they cause. Every agent gets the plan's scope;
  where it allows tests, one scout runs them once at the start for all.
- **Scope and limits:** what will be read; the tests, application or screenshots run, named by command or suite, or
  the bound of the choice; any outside provider that receives the code; `<out>`, the folder where the record, the
  page and the agents' files go; what is known to be out of reach.

Ask only for what is missing; a corrected plan waits for its own approval unless the user approved it as corrected.

## Showing the plan

Show the plan as a message the owner can scan: a title line naming the object and its link; the task in a line with
its source — the owner's task, the discussion, the project instructions, or the author's description approved as the
task; the diff's facts with abbreviated hashes, file count and added/removed lines. The four choices — Mode, Where,
Checking agents, Result — in a table with columns choice, selected, alternative, one row each, the selected with its
reason. Below, short labelled blocks: what the review judges and returns — the change against the cleanest target, a
verdict with findings, questions and steps; what each checking agent does; the agents with their exact models and the
session that starts each; the checks; `<out>` and how existing snapshots are reused; the limits; the measured cost
with its sample, not a prediction for the change. The approval question alone on the last line. Carry what can change
the owner's decision — inputs, cost, time, trust, limits; not internal scheduling, not the history of past artifacts,
not a quotation of this page.
