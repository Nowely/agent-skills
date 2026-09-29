# Changelog

Hand-written per release from the tagged git log. Dates are the tagged commit dates; detailed
forensics remain in the repository references and release notes.

## Unreleased

### Added

- A trigger case, `ticket-check`, where the request asks only to check a ticket whose last comment is an
  open question, so replying is the writer's own next step: in a field report, clarity did not start on its
  own for such a reply. Measured on 2026-09-29 with Opus 5.5 in three sessions with the plugin as changed here:
  clarity started before the answer in all three, so in a short session a request that never asks for a reply
  did not reproduce the miss. The control arm did not count, because the installed terse loaded there too.

### Changed

- `clarity`'s second question before writing also asks what comes back, and when neither the owner nor the
  sources settle what the reader will do, it has the writer ask the owner instead of inferring it: in a field
  report, a reply in a long thread was built on a division of work the writer had pieced together.
- `clarity` checks after writing that every item under a heading or group label fits the label, since the
  reader applies the label to each item: in the same report, the writer checked explicit claims while a group
  label placed an item where it did not belong. The check sits on clarity's own page because the session did
  not open `truth.md` while drafting.
- `clarity`'s body now says its questions apply while revising as well as writing, as its description
  already did.
- `clarity`'s questions before writing end by choosing the form: look at good nearby texts of the kind and
  choose a form for the way this reader will read it, with links to the sections of `rules.md` on context and
  on form, which the page did not link. The examples advice moves there from the fifth question while writing.
  In the same report, a session that never opened `rules.md` while drafting used a flat list where the reader
  would look things up by screen and then by field.
- `clarity` says that when the answer is itself a list, the list is the conclusion, so conclusion first and
  say a thought once no longer pull apart: in the same report, a status line at the top repeated the list under
  it.
- `rules.md` and `clarity` say to quote what the reader will act on, with its source after it, rather than point
  to where it sits, and the team-message note no longer limits self-containment to a block that leaves the
  conversation: in the same report, the writer pointed to an earlier comment in the thread whose text the
  reader needed in hand.

## 0.5.0 — 2026-09-28

terse gets a genre note for skill pages and standing agent instructions, text whose reader is the model that
loads it, so the note sends the writer to that model's vendor guidance first.

### Added

- A genre note for a skill page or standing agent instructions, `references/genres/skill-page.md`, linked from
  `clarity`: the model that loads such text is its reader, so its vendor's guidance is the authority, and the note
  carries what OpenAI's and Anthropic's guides agree on and Claude Code's 5,000-token limit on a skill kept after
  compaction. `agent-brief.md` points to the same vendor guides. From
  `research/2026-09-28-vendor-guides/`.

### Fixed

- The README's update step is one command, `claude plugin update terse@nowely`. It refreshes the marketplace
  itself: on 2026-09-28 it found terse 0.4.0 with no separate `claude plugin marketplace update nowely`, which the
  README asked for first.

## 0.4.0 — 2026-09-28

terse closes its ledger of defects in `audit`, `rewrite` and their shared pages, makes each audit stand alone,
and gives `clarity` its own line for pushback and three more genre notes. **Compatibility:** `audit` now asks at
its first step where its report goes, a folder of the audited repository (`audits/` by default) or its run
directory, and `rewrite` is given the report's path instead of the audit's run directory.

### Added

- A content eval harness, `evals/content.official.mjs` with its compare, recipient and selftest scripts, grades
  what a text says instead of only whether a skill loaded: it stages a variant of the pages, seeds fixture files
  and an earlier exchange, and has a judge score the answer against a hidden key. The runs spend Claude tokens
  and stay out of CI; `evals/content.md` is the protocol.
- E70: genre notes for a review comment, a ticket or issue, and interface text and error messages, each linked
  from `clarity` and each with an example paraphrased from the anonymized episodes. A before-and-after
  comparison gets no note of its own: it is a device, and `clarity` already asks whether the recipient can tell
  what changed, from what to what.

### Changed

- `audit` and `rewrite`: each audit stands alone, and a before and after on the same questions happens inside
  one `rewrite` run. `audit` settles in its first step where its report goes — a folder of the audited
  repository, `audits/` unless the user names another, or the run directory outside it — writes nothing else
  there and commits nothing; a summary and the report's path come to the chat either way, and the report names paths relative to the
  repository. `rewrite`, given the report's path, asks the audit's questions of the existing text and of its
  own, one file each, and shows both scores; without a report it writes three to five questions and their
  answers first. The pages no longer promise a second audit with the same questions or a stored score as a
  regression test. This settles E9 (on the planted question, a reader of either arm who says it cannot tell is
  right), E12, E14 (the key keeps the true answer and whether the documentation gives it), E15 and E29.

### Fixed

- E55: the live trigger probe blocks `ListAgents` and `SendMessage`, so the agent-brief case is scored where
  agent-messaging tools exist instead of being excluded because the model tried to send the brief to a real agent;
  three live runs on 2026-09-28 were all scored, with `clarity` called before the answer.
- E41, E25: `rewrite`'s section report compares the draft with the repair instead of reading a `budgets.json`
  the writer typed by hand. Keys written as brief 1 asked, `"## Install"`, matched no heading, so the report said
  "0 section(s) over budget" having checked nothing, and a renamed or removed section vanished from it. Now a
  section that grew shows its difference, and one that only one version has is marked; the budgets stay in the
  writer's plan.
- E26: the section report counts words with `Intl.Segmenter`, so a section in Chinese, Japanese or Thai is
  counted in words rather than as one word per run of text between spaces.
- E42: the genre scout's brief asks for each document's raw text, not "raw markdown", which the comments of a
  source file, a man page or a story do not have; the coordinator no longer rewrites the brief for them.
- E20: the task reader points every application a document runs at configuration and data under `$TMPDIR`,
  and a command it cannot point there it does not run; before, a document that installs a plugin or edits a
  configuration had the reader act on the user's own machine.
- E21, E19, E11: `references/run.md` gives a run's real lifetime and cost in prompts. Runs go when the plugin's
  last installation is removed, and `claude plugin marketplace remove` deletes them with no `--keep-data`
  (measured 2026-09-22 on Claude Code 2.1.280); a `claude --plugin-dir` checkout keeps its runs in a data
  directory of its own that no uninstall removes; and the data directory is under `~/.claude`, a protected path
  where each write asks in the `default` and `acceptEdits` modes until edits there are allowed for the session.
  The README no longer says every source-checkout run uses the temporary directory.
- E7, E36: `references/prior-art.md` and the README stop overstating the survey's record: not every practice is
  marked measured, argued or asserted, the curated section ranks 108
  entries rather than "forty", and not every 2026-09-10 number traces to the bake-off directory.
- E38: the note beside the writing rules' frozen block says the block is `PART 2` of the measured prompt with
  the source's four-space indent removed, not "byte for byte"; the block and its SHA-256 are unchanged.
- E69: `clarity` carries its own line for pushback: when the reader disputes a fact, recheck it at its source
  before conceding or holding, and say what the recheck showed. Before, it reached that rule only through a
  link to a deep-skill brief.
- E71: interface text and error messages are already in `clarity`'s scope, so its description stays as it was.
  On 2026-09-28 the unchanged description called `clarity` for them in 12 of 12 runs, the same as a description
  that named them (`research/2026-09-28-clarity-scope/`). Names and test titles stay out, so the skill does not
  load on every code edit. The held-out set that measured it, `evals/clarity-trigger/holdout-ui.json`, joins the
  trigger runs.

## 0.3.0 — 2026-09-28

terse gets `clarity`, a light skill for everyday texts that Claude may choose on its own while writing, and its
rules and deep skills follow a replication of the writing-feedback study behind issue #20 on a second machine's
sessions: `research/2026-09-26-writing-replication/`.

### Added

- `clarity` can be chosen by Claude or invoked as `/terse:clarity` for everyday text. It applies reader-side
  questions without agents or a run, and links six genre notes with their own examples; general examples
  live in `examples.md`. Its description names short texts written during coding, such as commit titles
  and code or review comments, and a reply that tells the user what an agent, test or tool found; the first
  description missed those. On 2026-09-27 Claude chose it before answering in 78 of 78 runs of fourteen
  everyday cases and two held-out sets in a clean `claude plugin eval` (Opus 5.5), in 32 of 33 counted runs
  in the owner's ordinary environment (Fable 5.1), and in none of 18 runs where it does not fit. Whether
  the texts improve when it loads is not yet measured.

### Changed

- The deep skills hand results over with a conclusion and grounds, account for later owner feedback, and
  link their dated rationale in `measurements.md`. The rules now state their principle, reason and scope;
  choices, proportional warnings and meaningful qualifications are handled where readers act. Sentence techniques
  remain frozen as evidence but are applied with judgment for the current reader.
- README and the manifest distinguish manually started deep skills from optional model selection of
  `clarity`. The page checks reject malformed or disabling frontmatter, compare all skill versions with
  the manifest, and require separate README rows and skill-page links for every genre note. The official
  trigger eval takes another case file with `--cases` and keeps each run's trace, the only record of its
  model; two held-out sets, written without sight of the description, sit beside the fourteen cases.
- **What installs is now `plugins/terse/plugin/`.** The marketplace entry's `source` is
  `./plugins/terse/plugin`: the skills, the references, the README, the LICENSE and `package.json`. The
  page check and this changelog no longer install; they stay in the repository beside it, at
  `plugins/terse/evals/pages.test.mjs` and `plugins/terse/CHANGELOG.md`, with the plugin's defects ledger
  (`plugins/terse/ISSUES.md`) and the research runs the pages cite (`plugins/terse/research/`), whose new
  paths the pages now name. `package.json` has no `test` script: CI runs the page check and the rewrite
  scripts' selftest by path. Why: an install copies the whole source directory, so every install carried
  the page check and the changelog; the owner's rule is that the installed plugin carries what the plugin
  needs and the working material lives beside it.

### Fixed

- Corrected M31's account of a changing number in a comment, links to misplaced measurements, and the
  README's claims about skill overrides, run storage and approval. The H1 counter excludes agent sidechains
  and requires the successful Skill result before the target event; H3 trusts its own temporary plugin copy.
- E6: corrected the writing-standards account in `writing-rules.md` and M19. The comparison had four
  standards, including an unpublished owner draft, plus a control pair; on the selected 116-word opening,
  six entrants left its length unchanged, three lengthened it, and one shortened it.
- E54: `practices-full.md` no longer repeats the refuted 2026-09-10 counts or reads that one run as evidence that
  published standards lose to unguided controls; thirteen passages now say what the run's prompts and judge show
  and no more. The fix came from a brief written with the new agent-brief note and carried out by a fresh agent.

## 0.2.0 — 2026-09-26

`rewrite` and `rethink` run one path instead of rounds, the rules are two requirements and advice, and the
pages the skills share are stated once. Measured on two READMEs and one file of code comments:
`research/2026-09-24-terse-benchmark-maestro/`, `research/2026-09-26-terse-light-trial/` and
`research/2026-09-26-terse-second-checks/`.

### Changed

- **One path instead of rounds.** `rewrite` runs one writer, then every critic at once on the draft, then one
  repair and a check of what the repair changed, then your read. The writer first works out the text's world
  and writes `context.md` — what the thing is and what it resembles, who reads it and in what situation, what
  they need first, what would make them want it and choose it over what it resembles, the one thought it
  carries — and plans from that rather than from a list of sections. The critics: truth by groups of sections,
  a rationalizer that asks whether the reader needs a part here or whether it makes them want the thing, form
  beside the best texts of the kind, terms, sentences and question readers; after the repair, truth on the
  changed sentences, the question readers again and two cold readers. Every role and its brief is in
  `references/roles.md`. On 2026-09-24 the rounds, the bake-off, the verifier and the wave after a freeze took
  6 h 38 min on a README of 1,200 words; the one path wrote the same README in 70 minutes.
- **Light by default, full on your word.** In a light run every role reads and runs nothing, and a guarantee
  word holds only where every case is read. A full run adds one agent that builds a runnable copy for the truth
  checks, and a task reader that carries out what the text says. On 2026-09-25 truth critics that each built
  their own copy held the critical path twice, 24 and 20 minutes.
- **`rethink`** runs the same roles stopped at a plan on one screen: the context, then each part, what it gives
  the reader, its device and its budget, with form and the rationalizer on the plan. Its sequential stages — a
  survey, a synthesis, ten structures under three critics, a skeleton — took three hours before a sentence on
  2026-09-24.
- **`audit`** puts a pleasant read first: two cold readers read the entry file beside the question readers, and
  what they found hard to read opens the report, with no mark. It runs light by default; the harness and the
  task readers run in a full one. `rewrite` takes an audit's run directory: its reader profile and shape verdict
  answer what they cover, and the writer answers what the audit found hard to read, every failure and every
  refuted claim.
- **The rules are two requirements and advice.** `references/rules.md` requires every text to be pleasant to
  read and true within its world — the code for documentation, the facts for an essay, what a story has set
  up — which the writer widens only with you; the rest is advice, taken where it helps and left without apology,
  each piece with its source. The critics argue from the reader, and a rule's number is no reason to decline a
  finding or to demand one. On 2026-09-26 a bare agent's README for a disk-usage tool beat ours, which had cut
  the demo, the one-line pitch and the install routes under rules applied as requirements; the owner: «Правила
  должны нести рекомендательный характер».
- **Truth and the repair.** The truth critic returns what is wrong for this reader, each with the plainest true
  sentence, apart from the rare cases that would not mislead them, which stay out of the text. The repair takes a
  finding where the text becomes truer for its reader or easier to read, and declines one that adds words the
  reader does not need there; the fix after the check takes only what the check found wrong, and what a reader
  wished added goes to you. On the second dust README the repair had taken 35 of 36 findings, the truth
  critic's caveats among them. Not yet measured.
- **Shared pages.** A definition two skills use is stated once under `references/`: `roles.md`, `rules.md`,
  `truth.md` (the audit's `truth-pass.md`), `run.md`, `writing-rules.md`, `curse-of-knowledge.md` and
  `measurements.md`. Copies in each skill's folder had drifted apart: on 2026-09-25 light mode reached
  `rewrite`'s pages and not the audit's.
- **Runs live outside your repository**: in the plugin's data directory when installed, in `$TMPDIR/terse`
  from a source checkout, and the report names the path and how long it lives. A code defect a run finds is
  offered to you, never written into your `ISSUES.md` unasked (`ISSUES.md` E5).
- **The README** is the one the owner sent as it is on 2026-09-24: what the plugin is for, Quick start, a table
  of the three skills, How it works, and Checks and guarantees.

### Added

- Genre notes in `references/genres/`: the README of a plugin or skill library, and of a terminal tool, each
  counted from the most used READMEs of its kind, with the owner's advice — among it, highlights that say why
  this tool rather than what any tool of its kind could claim, and the options as one table sorted by
  usefulness. Where a kind has no notes, the genre scout runs before the writer and names the best texts of the
  kind for it to read.
- `evals/pages.test.mjs`: every relative link in the plugin's pages opens, its anchor included; the
  run-directory line is one line in the three skills, in the exact `${...}` form; each frozen block hashes to
  the digest its page records.
- `references/benchmark.md`, the protocol for measuring the skills against a bare agent with a human best
  practice as the reference; its first run is `research/2026-09-24-terse-benchmark-maestro/`.

### Removed

- The rounds' scripts and pages, which no step has run since the one path of 2026-09-24: `ledger.mjs`, the
  ratchet that kept a verified claim in every later round; `round.mjs`, which built each round from checked
  edits; `dup.mjs`, which flagged an idea found in three sections or more; `rule1.mjs`, which kept flags and
  paths out of the sections before How it works and on the dust README counted a terminal tool's options as
  violations; and the pages `loop.md`, `critic-briefs.md`, `bake-off.md` and `rethink`'s `stages.md`. The
  installed plugin now carries only what runs; the record stays in the tag `terse@0.1.1` and in `research/`,
  and `selftest.mjs` keeps the checks of `sections.mjs`. Closes E3, E8, E16, E18, E23, E30, E31 and E34 of
  `ISSUES.md`.

### Fixed

- `rewrite` runs its script from `${CLAUDE_SKILL_DIR}/scripts`. The page used a bare `$CLAUDE_PLUGIN_ROOT`,
  which Claude Code neither substitutes nor exports, so on an installed plugin the command failed. The page
  test fails on a bare or defaulted placeholder.
- An installed `audit` makes its run in the plugin's data directory, no longer in `$TMPDIR/terse`: its
  `${CLAUDE_PLUGIN_DATA:-…}` form is not substituted, so every installed run took the fallback.
- `rethink` makes a run directory of its own, outside the repository that holds the text, and names it at the
  hand-over (`ISSUES.md` E13).

## 0.1.1 — 2026-09-17

### Changed

- The critic briefs follow the rename of `codex-delegate` to `entrust`: a Codex critic is an agent of the
  `entrust:codex-agent` wrapper, its prompt file starts with `RIGHTS: read <repository>` where it started with
  `SEAT:`, and the `entrust:codex` skill page is where `seat` was. Without this, every critic fan-out would exit 2
  on the first header line against entrust 0.16.0. The audit ledger example and the rethink worked example name the new paths.
- The instructions and the README call a delegated model an agent, a critic or a reader, never a seat, the
  word codex-delegate dropped the same day; the measurement narratives under references/ and the two
  frozen files keep their text, and the rethink worked example is about the word itself.

## 0.1.0 — 2026-09-12

First release. Three user-invoked skills; none starts on its own, and nothing is written into your
tree without your word.

### Added

- `audit` builds a profile of who reads the project, derives the correct answers from the code, sends
  one fresh reader per question through the `.md` files, and returns a score with the cause of each
  failure. It never suggests wording.
- `rethink` decides what a document should be — what the genre already solved, what things are called,
  what is said in what order — and stops at a skeleton for your word.
- `rewrite` writes against a skeleton or an audit's run file: one bake-off, then rounds of critics whose
  lenses do not overlap, every round kept as its own file, a ratchet that refuses a round that got worse,
  and a stop that is the owner's read. Its checks ship as scripts with a planted self-test; two reference
  blocks are frozen under their SHA-256.
- `references/`: the survey of the field over three rounds. Raw returns and every research run live
  under `research/` in the repository, outside the payload.

### Known limits

- The audit's ruler measures whether a model can answer from the text, not whether a human reader
  improved.
- `calibrate`, which measured one person's preferences, left the plugin for
  `research/2026-09-11-calibration-bank/` with its result.
