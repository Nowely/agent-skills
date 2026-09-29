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
  the regression count of each round; a script resolves paths from its own location, the home or the temp
  directory.
- **Everything gathered for research is private by default.** A tracked file carries only what the owner has
  already made public or would publish on this repository's front page; a detail private only in combination
  with public ones is private.
- **Frozen blocks**: `plugins/terse/plugin/references/writing-rules.md` and
  `curse-of-knowledge.md` carry the SHA-256 of their own text. Check it after any edit or move nearby; a
  change to the text changes the measurement it was made under, so the SHA line and the note beside it
  are updated together, never the text alone.
- **terse's shared pages**: a definition two terse skills use lives once, under
  `plugins/terse/plugin/references/`; a skill page holds its steps and links it, and a brief names the file
  instead of restating it. The one exception is the run-directory line, kept identical in each SKILL.md of a
  skill that makes a run because Claude Code substitutes `${CLAUDE_PLUGIN_DATA}` only in a skill's body. After
  any edit to terse's pages, run `node plugins/terse/evals/pages.test.mjs`: it checks that line, relative
  links and anchors, the frozen digests, skill frontmatter and versions, the README's skill rows and the links
  to genre notes.
- **Checks run by need.** A suite runs when a change touches what it reads, which its header states; entrust's
  `evals/run-all.mjs` on the PR is CI's full run (RELEASING.md step 5). After an edit to a SKILL.md or a file
  it links, run `node evals/skills.test.mjs`: it checks every plugin's skill pages against the vendor's
  mechanical skill rules (name, listing length, body line count, sections reachable from a file's first 100 lines,
  one-level references, forward slashes), a word budget measured in E77, and every link and anchor, and its list
  of known violations only shrinks.
- **Fan-outs**: state the agent count and the models before spawning, and wait for the word.
- **Flags**: a new flag, header field or option is born only with a sentence that names who sets it, why the
  default cannot decide, and what breaks without it; when that sentence cannot be written, the default decides.
  Flags are forgotten, misused and maintained.
- **Design principles** for every plugin's code and pages: minimalism — removing beats adding, and closing an entry
  is a real option when its harm is hypothetical; no crutches — fix the cause in the unit that produces it, never
  compensate in a consumer with a special case, retry, counter or instruction (the Flags rule above is one case of
  this); clean architecture — each fact has one owner and is defined in one place, and a page says what the code
  does. A recommendation to the owner rests on an analysis of that item — its options judged by these principles
  and an outside critic; without one, the item goes to the owner as a question.
