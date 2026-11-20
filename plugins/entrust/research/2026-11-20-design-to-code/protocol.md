# Protocol: short runs before a full one

Registered before any model run. Each tier is cheap enough to repeat and answers one question; the full task waits
until the tiers below it hold. Tier 1 is a gate: if the check does not see what the owner sees, no model run can
show anything.

| Tier | Question | Model | Cost |
|---|---|---|---|
| 0 | Does the check find what it is for? | none | under a minute |
| 1 | On the owner's real card, does it report what the owner sees, and nothing else? | none | one pack, minutes |
| 2 | Does the skill bring the model to the judge's threshold with fewer pushes and tokens? | Terra | 10–30 min a run, in parallel |
| 3 | Does that hold on a whole real task? | Terra | one task |

## Tier 0

```bash
node plugins/entrust/evals/design-to-code.test.mjs
```

It plants defects in the offer card one at a time and expects each found where it is: a spacing, a font size, a
bottom padding, an image's size and a button's colour, the kit's shorter badge with and without its ledger entry,
columns that stop fitting below one width, a layout change moved to another width. It also checks text found across
markup and case, the gallery, the round history, and the prepare and score pair. Needs Playwright with Chromium;
without it the browser cases skip.

## Tier 1: the check on the owner's card

Private material: it stays on the owner's machine; only counts and classes are published.

1. Build the pack for the card's frames as [pack.md](../../plugin/skills/design-to-code/references/pack.md) says,
   with `design.mjs figma` and a token if the owner has one, else from the MCP outline. Record how long it took, and
   for the MCP path the output tokens spent writing the pack.
2. Point `design.json` at the story of the owner's final implementation and run the check. The owner reads every
   reported difference and marks it: deliberate, then a ledger entry with its category and reason, `accepted`; or a
   real miss of the final implementation; or a false finding. With the deliberate ones in the ledger, this is the
   case's answer key.
3. Point `design.json` at the story as it was before the work, and at the accepted v4 and v5 builds if they still run.
   The check must report the known misses: the spacings of [the 280 px table](README.md#what-one-table-would-have-said),
   the manufacturer's mark's size, the badges' size and colour, the icons, the illegible dense row and the value under
   the wrong heading of the predecessor's [full task](../2026-11-20-adaptive-frontend/full-task.md#what-failed-at-each-handoff).
4. Record false findings, misses, and, on the MCP path, whether the outline's coordinates and text matched the image:
   its format is inferred from Figma's node model, not yet seen.

Gate: no miss of the listed kinds, and few enough false findings that the owner would accept them as ledger entries.
Otherwise fix the check and repeat tier 1.

## Tier 2: Terra on short tasks

**Cases.** `offer-card` ships with the repository (a card in three layouts, written for this; the implementer starts
from unstyled markup); it tests the loop, not the pack, which `prepare.mjs` builds. The owner's card from tier 1 is
the second, from the commit before the work, with the answer key as the judge's ledger; it tests the pack too.
`score.mjs` takes either: a private case needs only its `<dir>.judge/` set up by hand, as its header says.

**Arms.** Both get the same brief, Terra at the same effort on the same host (Codex or OpenCode), a fresh session
and a cap of 30 minutes or 60 turns.

- `plain`: the design as the owner usually gives it (the Figma link; for `offer-card` the images and the context),
  no skill.
- `skill`: the same, with `entrust:design-to-code`; for `offer-card`, a spec as Figma would give it, with texts,
  boxes and fonts and no exact text widths, while the judge keeps its own.

**Pushes.** When an implementer says it is done and the judge's score does not pass, it gets one fixed message:
"The result still differs from the design. Compare it with the design and fix what differs." Up to three pushes.
This stands in for the owner, the same for both arms, and counts what hypothesis 1 is about.

**Runs.** Three per arm per case: twelve. Enough to see a large difference, not a small one. Alternate the arms'
order.

```bash
node plugins/entrust/evals/design-to-code/prepare.mjs offer-card <runs>/skill-1 --arm skill
# start Terra in <runs>/skill-1 with the printed brief; the skill arm loads entrust:design-to-code
node plugins/entrust/evals/design-to-code/score.mjs <runs>/skill-1 --label "skill 1, submission 1"
```

`prepare` keeps the answer out of the run's directory and gives the judge its own copy; `score` runs the check with
the judge's design and ledger, never the implementer's, and lists the implementer's ledger entries for the owner.

**Record per run:** pushes until the judge passes (or "not within three"), the score line at each submission
(frames passed, landmarks within 1 px, largest offset, differing areas, sweep problems, score), the host's token
counts (uncached, cached, output) and tool calls, wall time, and the implementer's ledger, which the owner reads for
honesty: is every difference it left listed with a reason?

**Stop rule.** After two runs per arm on `offer-card`: if the skill arm needs no fewer pushes and no fewer tokens, read
the traces before running more.

## Tier 3

The owner's next real design task, done with the skill. Measured as the owner lived the card task: pushes needed,
tokens, time, and the gallery against the design. Compared with the owner's account of the card, not with a
parallel run.

## Not measured

Real devices, browsers other than Chromium, money.
