# The Terra run: one first submission on the owner's case

The Sonnet runs of [iterations 1 to 4](README.md#the-server-card-with-sonnet-drafts-211-to-27) were judged by a model
reviewer with a prompt written here. This run is the owner's: Terra, in the owner's Codex or OpenCode, on the owner's
own case, judged by the owner. One run is little, so nothing in it should be lost to the environment, and the rule for
reading it is written before it starts.

The version under test: the skill at `VERSION` (draft 27 or the draft after iteration 4, whichever the PR names last).

## 1. Smoke-test the mechanics first (unscored)

In the same host, sandbox and project where Terra will work:

- **Node 20 or later,** and Playwright resolving from the project (`npm i -D playwright`, then
  `npx playwright install chromium` if the host has no Chromium).
- **Chromium starts in the sandbox,** and the checker works there. From a checkout of this repository:

  ```bash
  node --test --test-name-pattern "v27" plugins/entrust/evals/design-to-code.test.mjs
  ```

  A sandbox that cannot launch Chromium makes the worker skip every check, which would read as the skill's failure.
- **Named boxes on the owner's own screenshot:** `design.mjs boxes <reference.png> --width <px>` writes `spec.json`
  and `boxes.png`.
- **Figma MCP,** if the frames come from Figma: one design-context call returns the frame in that host.
- **A second session can be started** (another terminal, or `codex exec`) for the review pass.

## 2. Seed what only the owner knows

In the project, before the run:

- **`.design/returns.md`:** the owner's past returns, one per line, as the owner said them.
- **The data's bounds, in the brief:** for each piece, its longest legal value or the word "unbounded" ("a price up to
  16 characters", "up to four disk groups, possibly more"). Iteration 3's return came from "an amount can be long".
- **The narrowest width the product supports,** in the brief.

## 3. Start the run

```bash
node plugins/entrust/evals/design-to-code/harness/arm.mjs prepare <project> --skill VERSION
```

Put the task's brief, as the owner would give it, in `<project>/.brief.md` before preparing. End it with "Work on
your own: there is no one to ask, so make reasonable decisions and note them. When you are done, your final message
is your handoff to the product owner." Start Terra in a fresh session on `<project>/.prompt.md`, at the owner's usual
effort.

## 4. The review pass: on

It is part of the shipped skill. When the builder hands over:

1. Freeze the builder's submission: `arm.mjs freeze <project>`.
2. Start a fresh session with the prompt in `references/review-pass.md`, paths filled in. It must not see `review.md`'s
   reasons or the ledger's.
3. Give its findings to the builder for one round of fixes, then freeze again.

Log the review's findings apart from the builder's, so that the builder's own first submission can be read alone.

## 5. The rule for reading it, written before

The run does what the skill is for if:

- **the owner accepts the submission** after the review round;
- **check rounds** (lines of `out/history.jsonl`) are under about 30;
- **ledger entries** are under about 10;
- **the evidence file opens with `pass` or `pending`** at handover; a handover at `fail` counts against it.

Also record wall time, the host's token counts (uncached, cached, output) and tool calls.

## 6. Record after

- **Each of the owner's returns,** as the owner said it, into `.design/returns.md` and the record, classed:
  - the checker named it, and the builder left it;
  - the checker could have: a rule covers the class, but no story or width reached it;
  - taste: nothing measurable.
- **The frozen archives' hashes** and the status line each opens with.
- **The review pass's findings,** and what the builder did about each.

## What to watch

- Does Terra read `SKILL.md` first and run the check itself, or claim it?
- Does the dense story push unbounded values past the narrowest line, so the fallback shows?
- Does it tune with `--quick` and finish with a complete check?
- Does it hand over at `fail`? Draft 14's Terra run on the real card did.
- Its ledger: how many entries, and under which causes.
