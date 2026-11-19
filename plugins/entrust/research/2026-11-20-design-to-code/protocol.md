# Protocol: short runs before a full one

Registered before any model run. Each tier is cheap enough to repeat and answers one question; the full task waits
until the tiers below it hold.

| Tier | Question | Model | Cost |
|---|---|---|---|
| 0 | Does the check find what it is for? | none | ~25 s |
| 1 | On the real card, does it report what the owner sees, and nothing else? | none | one pack, minutes |
| 2 | Does the skill bring the model to a passing check with fewer pushes and tokens? | Terra | 10–30 min a run, in parallel |
| 3 | Does that hold on a whole real task? | Terra | one task |

## Tier 0

```bash
node plugins/entrust/evals/design-to-code.test.mjs
```

Planted defects on the offer card: a spacing, a font size, a padding, a column gap, a layout that stops fitting below
one width, and ledger entries of each status. Needs Playwright with Chromium; without it the browser cases skip.

## Tier 1: the check on the owner's card

Private material: it stays on the owner's machine; only counts and classes are published.

1. An agent with Figma MCP builds the pack for the card's frames as [pack.md](../../plugin/skills/design-to-code/references/pack.md)
   says, and writes `design.json` for the story of the owner's final implementation.
2. Run the check. The owner reads every reported difference and marks it: deliberate, then a ledger entry with its
   category and reason, `accepted`; or a real miss of the final implementation. With the deliberate ones in the
   ledger, this is the case's answer key.
3. Point `design.json` at the story as it was before the work, and at the accepted v4 and v5 builds if they still run.
   The check must report the known misses: the heights and spacings of [the 280 px table](README.md#what-one-table-would-have-said),
   the badge size, the icons (in pixels).
4. Record: false findings (reported, and the owner says it is no difference), misses (the owner sees one, the check
   does not), and the first `get_metadata` outline the spec command read: the coordinate reading it chose, and
   whether its landmarks matched the image. The outline's format is inferred from Figma's node model, not yet seen.

## Tier 2: Terra on short tasks

**Cases.** `offer-card` ships with the repository (a card in three layouts, written for this; the implementer starts
from unstyled markup). The owner's card from tier 1 is the second, from the commit before the work, with the answer
key as the judge's ledger.

**Arms.** Both get the same brief, Terra at the same effort on the same host (Codex or OpenCode), a fresh session, a
cap of 30 minutes or 60 turns, and no human message after the brief.

- `plain`: the design as the owner usually gives it (the Figma link; for `offer-card` the images and the context),
  no skill.
- `skill`: the same, with `entrust:design-to-code` (for `offer-card`, the pack its prepare step makes).

**Runs.** Three per arm per case: twelve. Enough to see a large difference, not a small one. Alternate the arms'
order.

```bash
node plugins/entrust/evals/design-to-code/prepare.mjs offer-card <runs>/skill-1 --arm skill
# start Terra in <runs>/skill-1 with the printed brief; the skill arm loads entrust:design-to-code
node plugins/entrust/evals/design-to-code/score.mjs <runs>/skill-1 --label "skill 1"
```

`prepare` keeps the answer out of the run's directory and gives the judge its own copy; `score` runs the check with
the judge's design and no ledger of the implementer's, so an implementer cannot excuse its own miss.

**Record per run:** the score line (frames passed, landmarks within 1 px, largest offset, sweep problems, check
score), the host's token counts (uncached, cached, output) and tool calls, wall time, whether the agent said it was
done, and its ledger entries, which the owner reads for honesty: is every difference it left listed with a reason?

**Stop rule.** After two runs per arm on `offer-card`: if the skill arm is no better on score or tokens, read the
traces before running more.

## Tier 3

The owner's next real design task, done with the skill. Measured as the owner lived the card task: pushes needed,
tokens, time, and the gallery against the design. Compared with the owner's account of the card, not with a
parallel run.

## Not measured

Real devices, browsers other than Chromium, money.
