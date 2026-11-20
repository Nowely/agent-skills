# Listing card: a public case for a short controlled pair

A rental listing card that a product renders in containers of different widths, built with a small UI kit. It is
small enough to run in minutes and carries the kinds of misses the first real submission had
([09-first-submission.md](../../../../research/2026-11-20-design-to-code/09-first-submission.md)):

- **dense data no frame draws:** long titles and addresses, six badges, six specs, a long price, the edit action;
- **a popover state drawn once:** the deal popover, with the old price, the new price and the date;
- **popup behaviour:** hover opens, moving into the popover keeps it, leaving both closes it, a tap toggles it,
  Escape closes it;
- **visual numbers:** spacing, columns and alignment at three widths;
- **a contract:** `renderListing(el, data, { onEdit })`, the edit action only on the owner's listings.

## Files

| Path | Who sees it |
|---|---|
| `project/` | the implementer: the start (old look; a legacy hint that stays open after the pointer leaves) and the kit |
| `pack/` | the implementer, as `design/`: four frames at 2× with their specs, and the design context |
| `brief.md` | the implementer: the task, the same words for every arm |
| `reference/` | nobody: the accepted implementation the frames were taken from |
| `judge/` | nobody: the frozen criteria (`judge.mjs`), the judge's listings (`data.js`) and specs with text widths |

**Variants:**

- `a` ships the kit's popover (`Kit.attachPopover`), which behaves as the design says.
- `b` leaves the kit without one, so the popover at hand is the legacy hint. This is how 09's popups stayed open.

## Run a pair

From `plugins/entrust`, into two directories outside the repository:

```bash
node evals/design-to-code/cases/listing-card/make-arm.mjs ~/arms/plain --variant b
```

```bash
node evals/design-to-code/cases/listing-card/make-arm.mjs ~/arms/skill --variant b
```

Each arm gets its own fresh session with the same model, effort and host; the brief printed by `make-arm.mjs`; and
no other files. The skill arm is also told to use `design-to-code`. Keep each arm unable to read the other, the
judge and `reference/`: separate directories outside the repository, the agent's memory off, a clean agent home.
When that is not possible, mark the run as not blind.

When an arm says it is done, judge it from a directory where Playwright resolves:

```bash
node evals/design-to-code/cases/listing-card/judge/judge.mjs ~/arms/plain ~/arms/plain.judge
```

It prints `ACCEPTED` or `RETURNED`, the material findings, and writes `judge.json` and the check's gallery under
`<out dir>/out/`. A return gives the arm the printed symptoms only, in the same words for both arms, at most three
times.

## Record per arm

- **The verdict of the first submission.** It is the measure that matters: the owner wants the first one
  accepted.
- **Returns until accepted.**
- **Each material finding,** and whether the handoff named it.
- **The handoff's claims against the judge.** Count each "checked" or "matches" the judge contradicts.
- **Wall time; tokens** (uncached, cached, output); **tool calls; check rounds.**
- **For the skill arm:**
  - which steps it took, and in what order. Was `review.md` written before the first product edit? Did the first
    check run before it?
  - which acceptance lines became evidence: frames, stories, journeys.

One pair is a case study, not a ranking. A rerun of the same arm shows how much one run varies.
