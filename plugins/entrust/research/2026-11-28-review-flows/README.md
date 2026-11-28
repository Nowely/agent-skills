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

| File | What |
|---|---|
| [prototype.html](prototype.html) | The three flows, a List view for each, and the context panel. Opens in any browser, offline. |
| [data-path.png](data-path.png), [states.png](states.png), [states-table.png](states-table.png), [manual-check.png](manual-check.png) | Screenshots at 1440 px. |
