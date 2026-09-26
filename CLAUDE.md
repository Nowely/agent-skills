# agent-skills

Claude Code plugin marketplace `nowely`. One plugin per `plugins/<name>/`: its installed part is
`plugins/<name>/plugin/` (manifest, skills, README, LICENSE, package.json), and its working part sits beside
it — `CHANGELOG.md`, `evals/`, `ISSUES.md`, `research/`, and entrust's `schema-<version>/`. Release tags
are `<name>@X.Y.Z`.

## Rules for this repository

- **Defects found in passing go in the plugin's `ISSUES.md`** (`plugins/<name>/ISSUES.md`; a defect of the
  repository itself goes in a root `ISSUES.md`, created when the first one appears): file:line evidence,
  an evidence level, and wording that can become an issue unchanged. Do not fix a defect in the change
  that records it. Remove the entry when the fix lands and the changelog names it.
- **Evidence levels**, wherever a claim about behaviour is made: 1 — the line resolves; 2 — an
  independent reader of the code would say the same; 3 — the behaviour was made to happen. A claim about
  a lifecycle (what stays, what is removed, what a continuation sees) is level 3 or a guess.
- **Commits** carry one theme each, and the message is a sentence that says what changed and why it was
  worth it. A version bump is its own commit on the PR's branch, and the squash merge folds it into main;
  CHANGELOG entries stay under Unreleased until the release. No attribution trailers.
- **Research runs** live under `plugins/<name>/research/<date>-<slug>/`, and a run about the repository as
  a whole under `research/<date>-<slug>/`. Every iteration of a document is its own numbered file, never
  overwritten; a round is frozen once its critics launch; `rounds.md` beside them records the findings and
  the regression count of each round.
- **Frozen blocks**: `plugins/terse/plugin/references/writing-rules.md` and
  `curse-of-knowledge.md` carry the SHA-256 of their own text. Check it after any edit or move nearby; a
  change to the text changes the measurement it was made under, so the SHA line and the note beside it
  are updated together, never the text alone.
- **terse's shared pages**: a definition two terse skills use lives once, under `plugins/terse/plugin/references/`;
  a skill page holds its steps and links it, and a brief names the file instead of restating it. The one
  exception is the run-directory line, kept identical in each SKILL.md because Claude Code substitutes
  `${CLAUDE_PLUGIN_DATA}` only in a skill's body. After any edit to terse's pages, run
  `node plugins/terse/evals/pages.test.mjs`: it checks that line, every relative link and the frozen digests.
- **Fan-outs**: state the agent count and the models before spawning, and wait for the word.
