# Protocol: one pair on the card task, second version

Registered before the runs. It replaces [06-pair-protocol.md](06-pair-protocol.md), which round 6's critic read; the
changes follow its findings and are listed at the end.

## The question

On the real card task, with Figma reachable through MCP, does the skill get the model to an accepted result with
fewer returns than the same model without it, and at what cost in time and tokens?

**Primary measure:** returns until acceptance. **Secondary:** worker time to acceptance, tokens, defects of the first
submission. One pair is described, not ranked: a difference of one return is within what one run can show by
chance, and the record says so.

The card is the owner's real kind of work, so it is the task to learn. It is not held out: the skill was shaped by
this task's failures, among them a value placed under the wrong heading, and its page says "values that must line
up across rows share one grid". The record marks each first-submission defect the skill's page names outright.

## The two arms

| | Baseline | Skill |
|---|---|---|
| Model, effort, host | Terra, the same effort, the same host (Codex or OpenCode) | the same |
| Source | the library at the commit before the work, the consumers' context | the same |
| Design | the Figma frames through MCP, the same 2× PNG exports of each frame, the brief | the same |
| Figma token | none | none |
| Skill | none | `entrust:design-to-code` |
| Owner decisions | the same list, given at the start | the same |
| Cap | 90 minutes of worker time per submission round | the same |

The brief asks both arms to report what still differs from the design and why, so the owner reads both arms' lists
the same way. The earlier v4 and v5 runs (images only, 2 and 3 returns, 54:31 and 1:17:56) are background, not a
control: they had no Figma data.

## Keeping the arms apart from the answer

Each arm works in a fresh clone of the library made with `--single-branch` at the base commit, with no remote: a
worktree would share the branches and objects where the released code and earlier submissions live. The skill arm's
plugin directory holds only `skills/design-to-code/`. Before starting, a search in each arm's directory confirms
that no research file, released code or judge scenario is reachable.

Playwright and Chromium are installed outside the product (the skill's script finds them from its own directory),
so `package.json` is untouched. The design font is installed in the stand. A dry run of the check, without a model,
on the base commit's story must load the font and produce a verdict; it is not a pass, since the work is not done.

The arms run one after the other on the one Figma seat, baseline first; each start records the Figma file's
`lastModified`, and any throttling is recorded.

## Judging and returns

When an arm says it is done, the judge runs:

- the earlier acceptance suite: 27 browser scenarios, the built package's import, the three consumers, the old
  site's adapter;
- a blind visual review: screenshots the judge captures at the frame widths, anonymized and shuffled, against the
  frames, with the owner's accepted differences as the ledger. The reviewer does not see the arm's gallery or ledger.

A material failure in either gets one consolidated return: the symptoms, not the fix, in the same words for both
arms. At most three returns. "Material" is what the earlier rubric failed on, plus a visual difference the reviewer
would send back that is not among the owner's accepted differences.

## What is recorded

Per arm:

- returns until acceptance, or "not accepted within three";
- the first submission's defects, by the judge, each marked if the skill's page names it;
- worker time and tokens (uncached, cached, output) to the first product edit, to the first submission and to
  acceptance; tool calls and MCP calls; judge time;
- the arm's list of remaining differences, read by the owner: is each listed with a reason?
- for the skill arm: how many check rounds it ran, where it stopped, and which parts of the page and the script it
  used. Parts unused on this real task are candidates for removal before the next edition.

## Before the runs

The owner supplies the brief, the list of owner decisions, the PNG exports, who reviews blind, and the judge's suite
running locally. Everything private stays local; the record publishes counts, classes and times.

## Changes from the first version

The critic of round 6 found that worktrees share history with the released code; that the skill arm would pay alone
for writing the pack and might see "missing reference image" every round without exported PNGs; that only one arm
would be scored on listing its differences, and its gallery could reveal it to the reviewer; that no primary
measure, cap or run order was fixed, and both arms would share one seat's rate limit; and that the skill's page names
the card's own fix. Each point above answers one of these. The first version also said "under the right heading"
where the defect was a value under the wrong one.
