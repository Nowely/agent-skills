# Pilots on the listing case with Sonnet

Two short controlled pairs, run in the coordinator's session before the owner's Terra runs. They test the questions
the first real submission raised ([09](09-first-submission.md)) on a public case that takes minutes, not the
skill's worth on the real card.

## Setup

- **The case:** [listing-card](../../evals/design-to-code/cases/listing-card/README.md). It covers:
  - a rental listing card, responsive by its own width, built with a small UI kit;
  - four design frames at 2× (wide 760, medium 520, narrow 320, and the deal popover) with specs and a design
    context;
  - a legacy component whose hint stays open after the pointer leaves it;
  - a contract, `renderListing(el, data, { onEdit })`.
- **Variants:**
  - **A** ships the kit's popover.
  - **B** removes it, as in 09, where the only popup helper at hand was the legacy one.
- **Arms:** both arms ran Sonnet in a fresh subagent with the same brief, run concurrently.
  - The skill arm was told to use the skill: draft 9 in A, draft 10 in B.
  - The plain arm got only the brief.
- **Isolation:** not blind. The arms shared one filesystem and were only told to stay in their directories. One arm
  wrote screenshots into the parent directory.
- **The judge:** frozen before the runs and accepted the reference beforehand. Every criterion must hold:
  - **visual:** no material finding per frame. Material means an offset or size over 4 px, a missing, changed or
    extra text, a font, or a differing region.
  - **dense:** the judge's own dense listing, swept from 280 to 800 px, shows no overlap, covered control, text
    outside, overflow or hard cut.
  - **popovers:** both popovers pass hover, moving into the popover, leaving, tap, tap elsewhere, focus and Escape.
  - **deal:** the deal popover shows both prices and the date.
  - **edit:** the edit action calls `onEdit`, and a visitor's listing has no edit action.

**One correction to the judge after run B.** The judge compared the deal popover's prices with plain spaces. The
skill arm of B set them with no-break spaces, which is right, and was returned for it. The judge now treats any
space as a space. All four arms were judged again by that one version; only that verdict changed.

## Results

| Variant | Arm | First submission | Material findings | Wall time | Tokens | Tool calls |
|---|---|---|---|---:|---:|---:|
| A | plain | **returned** | 8 spec offsets of 8–17 px at 760 and 320 (column gaps) | 1:32 | 104,101 | 20 |
| A | skill (draft 9) | **accepted** | — | 4:29 | 108,218 | 22 |
| B | plain | **accepted** | — | 2:39 | 98,740 | 15 |
| B | skill (draft 10) | **accepted** | — | 4:27 | 116,114 | 24 |

Tokens are the subagent's totals as the harness reports them; cached and uncached are not separated.

**Handoffs against the judge:**

- **A plain** said the frames render "at card heights … the same as the Figma frames" and that the screenshots were
  compared by eye. It did not name the 8–17 px offsets the judge returned it for: the claim rested on heights.
- **B plain** said positions agree "to within about 1 px", and the judge agreed.
- **Both skill arms** cited the check's verdicts, and the judge agreed.

**What the skill arms did:**

- **A, draft 9:**
  - The pack and `design.json` came before the first edit; the first check came after the rewrite began, so its
    gallery's Before is not the old card.
  - It swept three extra stories, ran 6 check rounds and reached zero findings.
  - It wrote `review.md` and its acceptance list after the implementation, as in 09.
- **B, draft 10:**
  - The check now requires the acceptance list. `review.md` existed at the first check (`"review": true` in
    `history.jsonl`).
  - It swept four stories, wrote 9 journeys (hover and leave, tap, tap elsewhere, Escape, one popover at a time) and
    ran 3 rounds.
  - Its handoff names the open question: clamp long titles, or let the card grow.

## What this shows, and what it does not

- **Shows:**
  - On this case, both skill arms submitted work the judge accepted the first time, and their handoffs matched the
    judge.
  - One plain run did too, and one did not. Its miss was the kind a numeric check finds: column gaps the eye
    passed over.
  - The cost of the skill here was about two to three times the wall time and up to 17 % more tokens.
- **Does not show:**
  - **Popup dismissal and dense collisions did not separate the arms.** Both plain arms built popovers that close,
    and their dense listings did not collide. Sonnet with this brief handled them without a skill, so the case does
    not reproduce 09's two worst misses.
  - **Terra, the real card or a ranking.** Two runs per arm of one model on one small case say nothing about Terra on
    the owner's card. The difference between the two plain runs is a reminder of how much one run varies.

## For the owner's Terra runs

1. **Freeze and test the judge before the runs.** It should accept the accepted implementation and return the start.
   Normalize text before comparing (spaces of every kind), and take the first visible match of a selector. When the
   judge is corrected after a run, judge every arm again with the corrected version and record it.
2. **The first submission's verdict is the measure the owner cares about.** Record returns until acceptance as well,
   but stop the comparison at the first verdict when time is short.
3. **Count each claim in a handoff that the judge contradicts.** "Done" that is only in words shows here.
4. **Read the process from files rather than logs.** File times show whether `review.md` came before the first
   product edit; `history.jsonl` gives check rounds, `review` and `basis`; `design.json` gives stories and journeys.
5. **Run each arm twice when it is cheap.** One plain run passed and one did not.
6. **Keep the arms apart with more than an instruction.** Use separate directories outside the repository, the
   agent's memory off and a clean agent home. Even then, one arm here wrote outside its directory.
7. **Drive the workers directly.** In 09 the coordinator spent more tokens than the worker.
8. **Start small.** On the public listing case (variant B), a Terra pair takes minutes and tells whether Terra
   follows the skill at all: acceptance list, stories, journeys, honest handoff. Then the real card, where the misses
   are harder than this case's.
