# Protocol: one pair on the card task

Registered before the runs. It replaces tier 2 of [protocol.md](protocol.md) for this task; the earlier protocol stays
as the record of what was planned then.

## The question

On the real card task, with Figma reachable through MCP, does the skill get the model to an accepted result with
fewer returns, less time or fewer tokens than the same model without it?

The card is the owner's real kind of work, so it is the task to learn. It is not held out: the skill was shaped by
this task's failures (columns shared across rows, the kit's badge recorded as a difference, a value under the right
heading). A better result here is weaker evidence than the same result on a new task, and the record says so.

## The two arms

| | Baseline | Skill |
|---|---|---|
| Model, effort, host | Terra, the same effort, the same host (Codex or OpenCode) | the same |
| Source | the library at the commit before the work, the consumers' context | the same |
| Design | the Figma frames through MCP, the brief | the same |
| Skill | none | `entrust:design-to-code` |
| Owner decisions | the same list, given to both at the start | the same |
| Budget | the same wall time or turn cap | the same |

The earlier v4 and v5 runs (images only, 2 and 3 returns, 54:31 and 1:17:56) are background, not a control: they
had no Figma data. The baseline with MCP is what separates the skill's effect from the data's.

Both arms start in fresh sessions in separate worktrees, at the same time. Neither sees the research directory (the
plugin installs without it), the released code, earlier submissions, the judge's scenarios or the owner's ledger.
The design font is installed in the stand before either starts.

## Judging and returns

When an arm says it is done, the judge runs:

- the earlier acceptance suite: 27 browser scenarios, the built package's import, the three consumers, the old
  site's adapter;
- a blind visual review of anonymized screenshots at the frame widths against the frames, with the owner's accepted
  differences as the ledger.

A material failure in either gets one consolidated return: the symptoms, not the fix, in the same words for both
arms. At most three returns. "Material" is what the earlier rubric failed on, plus a visual difference the reviewer
would send back that is not in the owner's ledger.

## What is recorded

Per arm:

- submissions and returns until acceptance, or "not accepted within three";
- the defects of the first submission, by the judge;
- worker time to the first submission and to acceptance; judge time;
- tokens (uncached, cached, output), tool calls and MCP calls, from the host;
- for the skill arm: how many check rounds it ran, where it stopped, and its ledger, which the owner reads: is every
  remaining difference listed with a reason?

## Before the runs

The owner supplies the brief, the list of owner decisions, the budget, who reviews blind, and the judge's suite
running locally. Everything private stays local; the record publishes counts, classes and times.

## Afterwards

One pair is a case, not a ranking. The record compares the two arms on the measures above and states what the
pair cannot show. It also lists which parts of the skill and its script the skill arm used; parts unused on a real
task are candidates for removal before the next edition.
