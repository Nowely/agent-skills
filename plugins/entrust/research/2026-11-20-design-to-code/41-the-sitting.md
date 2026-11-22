# The sitting on 0.46.1: the protocol

The owner's one sitting, registered in [40](40-overhead-and-one-sitting.md#the-sitting-the-owner). Written before
it runs; its results go below when it has run.

**The skill:** entrust 0.46.1, `bf6aafc` on main. Its skill is byte for byte `36b08a8`, the bump commit on the release
branch. Pass the hash, never a branch's head.

**The scripts:** [`real-run.mjs`](../../evals/design-to-code/harness/real-run.mjs), run from `plugins/entrust`:
- `setup`: records the owner's originals outside the project, prints the Codex rule and the first message, and starts
  Chromium from the project;
- `collect`: waits for checks in flight, freezes the run, diffs the originals, and reads the rollout log into a record
  and a verdict form.

## The steps

0. **`collect` on the rerun's log ([39](39-terra-045-rerun.md)).** Its parser has seen only a synthetic log. Run it on
   the arm and the rollout of 39, labelled `S`. Its record should give 39's 60 calls, 14 empty polls and token figures.
1. **The prebuilt pass, labelled `P`.** [36](36-terra-dry-run.md) again, on 0.46.1, on the fixed prebuilt card, 60
   calls at most. Make the arm with `make-arm.mjs --prebuilt`, then `setup` with the case's inputs as the originals:
   `design`, `README.md`, `data.js` and `.design/card/frames`. Then Terra, `collect` and the planted grader.
2. **Runs A and B on the real task.**
   - **Setup:** both copies are set up before A starts, so Codex restarts once.
   - **A:** ends at its first handover at `pass` or `pending`. A stop to ask approval is not a submission.
   - **B:** starts in a fresh session after A's `collect`, while the owner reviews A.
   - **The owner's verdict:** in `form-A.md` before any review of the coordinator's.
   - **If A is returned:** B is read only for whether the return's class recurs.

## How it is read (from 40, unchanged)

- **The prebuilt pass:**
  - empty polls per complete check at most 1, or the poll wording is reverted in the next release;
  - the entries and rounds, beside the Sonnet arms.
- **A:** the success clause, without its budget line.
- **A and B both accepted:** "experimental" comes off in the next release.
- **A returned:** the return is read under [38](38-after-the-release.md#iteration-9-the-reserve), and B shows whether
  its class recurs.
- **The coordinator, after:**
  - the inputs verdict;
  - the blind review against the owner's originals, with a control;
  - the overhead per class.

## Results

Not run yet.
