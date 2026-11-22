# Service overhead, and the real runs in one sitting

Written before the runs it registers, after [the Terra rerun](39-terra-045-rerun.md) and with Fable's reading. It
replaces the order of [38-after-the-release.md](38-after-the-release.md): its iteration 8 and 9 become one sitting,
and the version under test becomes the next release, 0.47.0 (0.46.0, on main since, changed orchestrate and only
the version line of this skill).

## The owner's decisions (2026-11-22)

- **Step 0 is not a gate.** Nothing it could decide changed iteration 8's setup: the approval line goes in the prompt
  either way, the inputs diff is a procedure either way, and the review pass and the context can be read from the real
  run's own log. It ran anyway ([39](39-terra-045-rerun.md)) and is read below as the overhead baseline.
- **The budget is recorded, not a condition.** How long a run takes depends mostly on the task. The success clause of
  [the plan](33-five-iterations-plan.md#when-to-stop) loses its budget line; every role's cost is still counted.
- **The goal of the work is the skill's service overhead:** the calls, polls, context and ledger churn the skill and
  its flow add on top of the task's own work.
- **Run B runs beside run A** (below), so two acceptances can come from one sitting.

## The review pass and the owner's originals: tried, not made

[The review pass](../../plugin/skills/design-to-code/references/review-pass.md#the-prompt) reads the builder's copies,
`<pack>/frames/*/reference.png`, so a bent copy is invisible to it (E146). The control: p2's frozen submission from
iteration 7 (`ab7`), whose four card copies have the "Выдача" band cut out while the supplied `design/*/reference.png`
are byte-identical to the case's. Four fresh Sonnet reviewers, two on the prompt as shipped and two with the
references line pointing at the supplied originals, the rest word for word, the work's diff given as a file. The rule,
written before: the fix holds if both new-prompt reviewers name the missing line and neither old-prompt reviewer does.

**All four accepted and none named it.** Each judged the frames from the check's `side.png`, whose left panel is the
pack's copy, whatever the references line said. The prompt change does not move its measure and is not made. The bend
is caught outside the run: `collect` diffs the inputs against a baseline `setup` records outside the project before
the builder starts.

## The overhead baseline: the Terra rerun on 0.45.0

A prebuilt card whose one real gap is the planted line; its ideal path is a check, one ledger entry with options, and a
handover at `pending`. In 60 calls ([39](39-terra-045-rerun.md#recorded-cost)):

| Class | Rerun | Ideal |
|---|---:|---:|
| Handover | none | at `pending` |
| Check rounds | 5 | 1–2 |
| Ledger entries / distinct questions | 9 / 1 | 1–3 / 1 |
| Empty polls (each asked 1,000 ms) | 14 | ≤ 1 per complete check |
| `side.png` among the ten largest outputs | 4 | — |
| Input per call at calls 1 / 30 / 59 | 25k / 69k / 93k | — |

Fable's attribution, from the page and the checker:
- **The entries:** one fair; three the same per frame; five the rows below the missing line and the root height. A
  missing landmark is never placed, so no entry carries the shift it causes, and each shifted row stays a finding.
  With `fail` left, the page forbids a handover.
- **The polls:** the page says "look every few minutes" and names no duration.
- **The images:** the page says "view only the crop", and the checker writes no crop.

## 0.47.0: four levers

1. **Polls:** the page names the wait: as long as the last complete check took.
2. **One entry per cause:** its texts listed in `landmark`, `frame` left out when it holds in every frame.
3. **Images:** one frame's `side.png`, only when the digest's numbers do not answer the question.
4. **The checker:** a `presence` entry for a landmark the page lacks also carries the vertical shift below it and the
   root height, each bounded by that landmark's height and its gap below; beyond the bound it stays a finding.

Lever 4 is made now against Fable's advice to wait, because it is the cause of the loop and of the missing handover,
and it has deterministic controls. Iteration 7's consequence entries failed with builders writing them; here the
builder writes nothing new.

## Measures and rules, written before

**Deterministic, before any run:**
- **C1:** the prebuilt card with the one entry for the missing line fails on 0.45.0 and is `pending` on 0.47.0.
- **C2:** the same with a planted 20 px shift below the line, beyond the bound, still fails on that row.
- Lever 4 goes in only if both hold.

**Sonnet, the prebuilt planted card, three arms each:** `b1`–`b3` on 0.45.0 (`bc54fde`), `n1`–`n3` on 0.47.0, the
approval line in the prompt as in 39. Per run: ledger entries and distinct questions, `side.png` views, check rounds,
calls to the handover, the status at it, and the grader's verdict.
- **Lever 2 stays** if the median of entries falls and no arm loses the question.
- **Lever 3 stays** if the median of `side.png` views falls.
- **Lever 4 stays** if the median of rounds to a handover falls and more arms hand over at `pending`.
- **Three arms each are noise-limited:** a fall within the arms' spread is read as no change.
- **A lever that does not move its measure is reverted** before the sitting.

**Lever 1 needs Terra:** Sonnet's shell blocks and does not poll.

## The sitting (the owner)

1. **The prebuilt pass:** the rerun of [36](36-terra-dry-run.md) on 0.47.0, 60 calls at most, the same prompt, frozen
   only after in-flight calls end. Read against the baseline table:
   - empty polls per complete check at most 1, or lever 1 is reverted in the next release;
   - the entries and rounds, beside the Sonnet arms.
2. **Run A,** the real task on 0.47.0, with `setup` (the baseline hashes, the Codex rule, Chromium) and the approval
   line. It ends at the first handover at `pass` or `pending`.
   - **A stop for approval** is not a submission: the owner answers as in any work.
   - **At the handover:** `collect`.
3. **Run B,** the same, in a fresh session on a second copy, started at A's freeze.
   - **If A is accepted:** B is the second run of the plan's reserve.
   - **If A is returned:** the owner need not look at B; it is read only for whether the return's class recurs.

**The owner gives, per run:** the verdict as seen and as read, each question marked fair or unfinished, who found each
defect, and his minutes. He gives it before he sees the blind review.

**The coordinator, after:**
- the inputs verdict from `collect`;
- the blind review against the owner's originals, with a control;
- the overhead per class from `collect`.

**Done when** A is accepted under the success clause (without its budget line); two acceptances, A and B, remove
"experimental" in the release after it. A return is read under [38](38-after-the-release.md#iteration-9-the-reserve).
