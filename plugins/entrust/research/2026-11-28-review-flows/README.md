# Review flows on real code (2026-11-28)

Research for the `entrust:review` page; it changes nothing in the skill. The owner's sketches in
[#119](https://github.com/Nowely/agent-skills/pull/119#issuecomment-7221091118) show three flows on synthetic data:

- a data path;
- state transitions;
- a manual check with branches.

[prototype.html](prototype.html) draws all three on entrust 0.48.0's own code at `835c58d`:

- **Data path:** where a block's `whole` reason goes.
- **States:** the picture viewer.
- **Checks:** what the viewer's gaps need from a person.

Each flow has a List view and a context panel for the selected step. Places, code lines and test names are real; the
flows were written by hand, as a reviewer would write them.

**Evidence.**

- A step marked *Ran* names its test. The test passed when its suite ran on `835c58d` on 28 November 2026:
  - `review-page-browser`: 81 of 81 passed, run locally (CI starts this suite but, without Playwright, prints NOT RUN
    and passes);
  - `review-report`: 48 of 48 passed.
- A step marked *Read* rests only on the code that was read.
- Changed or Context was computed from `git diff 835c58d~1 835c58d`.

**Checked.** An Opus critic checked the first draft against the code and refuted these claims:

- The trigger list was incomplete: it had 16 triggers and missed six.
- One trigger was marked *Ran* on a test that asserts something else.
- "Each viewer test ends closed" was wrong.
- The record already has `checks` and routes drawn as flows, and the draft proposed both as new.
- Who ran a check and where it ran are not fields today.
- One Changed tag was wrong.

The prototype and the proposal were corrected. The critic's ideas that were taken up:

- build on routes, `checks` and coverage statements;
- send gaps to the author as tests first;
- show no ratio as coverage;
- open states as a table;
- tie the owner's results to the record's revision.

**What it showed.** These are the five points of the proposal in #119:

- The `whole` reason reaches the critic but not the owner's page.
- The printout's description is out of date in seven places.
- A green CI says nothing about the browser suite.
- A reviewer's list of triggers misses some.
- 12 of the viewer's 13 gaps belong in tests.

## The first real review with flows (db8076a)

After the first working version ([#119](https://github.com/Nowely/agent-skills/pull/119)), a Sonnet reviewer ran the
skill on a real change: `db8076a`, +134 −14 lines in 7 files, about how a continuation carries blocks. The plan was
fixed in advance: one reviewer, no checking agents, the full record and page, and one run of the record's own suite.

**Cost.**
- 168k tokens and about 6 minutes to the render.
- Routes took roughly a quarter of the time spent writing the record, most of it on anchors in unchanged code and on
  checking quotes.

**What it wrote.** Three routes:
- **Seven steps and seven links.** The route has a loop between `carry` and `staleCarried`, a second entry point from
  `check`, and a stop at a finding.
- **Four steps in a line.** Three of the steps are confirmed by a test.
- **Five steps.** Four of them are in unchanged code, and one is confirmed by a test.

`check` passed with no warnings. The reviewer checked every quote against the files.

**What it asked of the skill:**
- A finding in the middle of a path needed a duplicate step, because `stops` ends the path. This led to `findings`
  and `questions` on any step.
- `check` cannot test that a quoted line matches its file, so the verifier's brief now names route quotes and
  confirmations.

**What the critic found on the same diff** (fixed, and verified by a Sonnet verifier):
- an observation counted as current because its revision text matched;
- an edge that merged links was drawn green when only one of them was tested;
- edges that skipped a row ran under the step between;
- a run on other code was shown as tested here;
- a `read` statement was listed as a run.

**Fixed after the round.** An edge drawn at the side entered its step from the right, so it passed behind a
neighbour in the same row: on this review, 6→4 read as 6→5. Such edges now run only through the empty gaps between
rows and enter their target from the top. A test samples every edge and fails if one touches a step that is not its
own end.

The [trial-db8076a](trial-db8076a/) folder holds the record, its saved diff, the task, the plan and the test log.
`report.mjs render trial-db8076a/review.json` draws its page. The page is shown in
[trial-loop.png](trial-loop.png) and [trial-confirmed.png](trial-confirmed.png).

| File | What |
|---|---|
| [prototype.html](prototype.html) | The three flows, a List view for each, and the context panel. Opens in any browser, offline. |
| [data-path.png](data-path.png), [states.png](states.png), [states-table.png](states-table.png), [manual-check.png](manual-check.png) | Screenshots at 1440 px. |
| [trial-db8076a/](trial-db8076a/), [trial-loop.png](trial-loop.png), [trial-confirmed.png](trial-confirmed.png) | The first real review with flows: its record and two screenshots of its page. |
