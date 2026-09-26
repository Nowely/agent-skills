# Changelog

Hand-written per release from the tagged git log. Dates are the tagged commit dates; detailed
forensics remain in the repository references and release notes.

## Unreleased

### Changed

- `rewrite` takes an audit's run: step 1 asks for its directory, whose reader profile and shape verdict answer
  what they cover, and the writer answers what the audit found hard to read, every failure under What broke and
  every refuted claim. The audit no longer writes the `json claims` block or runs `ledger-seed.mjs`, and its run
  file's contract no longer lists two ledgers `rewrite` returned under the sequential path: since the one path,
  nothing read the ratchet the block seeded, so the README's "give it the folder the report names" led nowhere
  and an audit's findings were lost on the way to `rewrite`. The script still ships, called by no page, until the
  old path's scripts are decided on at the release.
- `audit` puts a pleasant read first and runs light by default, as `rewrite` has since 2026-09-25. Two cold
  readers, brief 11, read the entry file in the same launch as the question readers; what they found hard to
  read, each point with its line, opens the report and the run file's new *A pleasant read* heading, with no
  mark: the user's read decides. The truth pass reads the code. The user's word makes the run full: the harness,
  brief 12, builds a copy for the pass to run the code in, and the two task readers go out on brief 9, which
  starts their state under `$TMPDIR`. A light report says that nothing was run. `rethink` names no mode, since
  none of its roles runs code, and the form its plan gives each section is the plan's share of a pleasant read.
- A definition two skills use is stated once, and the pages link it. `truth.md` holds how a claim is checked —
  the levels, the verdicts, the guarantee words, what a light and a full run may do — for the audit's truth
  pass, `rewrite`'s truth critics and rule 20: the pages had drifted to two words for an unsettled claim
  (`unconfirmed`, `unverifiable`) and two rules for a guarantee word, the audit's demanding a run. `roles.md`
  defines light and full, and holds the question reader's brief for a set of documents beside the one for one
  text, with the rule never to ask a reader whether the text was clear. `run.md` says where a run lives and for
  how long; the line that makes it stays in each skill's own SKILL.md, the same line in all three, because
  Claude Code substitutes `${CLAUDE_PLUGIN_DATA}` only in a skill's body. The audit's line had no `<slug>`, and
  `rethink` pointed at the audit's, which read from another page would not be substituted and would put an
  installed run in the temporary directory. The two sentence-layer pages no longer call themselves parts of the
  four-part chain; their frozen blocks and digests are unchanged.
- The pages more than one skill works from sit together under `references/`: `roles.md`, `truth.md` (the
  audit's `truth-pass.md`, renamed because `rewrite`'s truth critics check by it too), `writing-rules.md`,
  `curse-of-knowledge.md` and `measurements.md`. Each had lived in one skill's folder, and a change made there
  for that skill left the other skills' copies behind: on 2026-09-25 light mode reached `rewrite`'s pages and
  not the audit's.
- Rule 5 makes an advantage a capability and what it means for the reader, with a command at most as proof,
  because the draft's advantages walked through the commands its Quick start repeats while the other README's
  listed its parts. Rule 14 adds badges where they carry live information, none typed by hand and no licence
  badge.
- Rule 6 lets the opening name the reader's problem that the project solves, and still forbids warnings about
  the project itself: on 2026-09-25 the rules critic had cut the draft's own problem line under "no failure
  modes", and in a blind read of two openings the other README's problem line was called the strongest
  selling line in either.
- `rewrite` runs light by default and full when the user asks. In a light run every role reads and runs
  nothing: the truth critics check each sentence against the code's lines, tests and documentation, and a
  guarantee word holds only where every case is read (rule 20). A full run adds one agent that builds a runnable
  copy while the writer writes (brief 12), truth critics that may run the code there, and the task reader. On
  2026-09-25 the second run took 1 h 33 min, and truth critics that each rebuilt the same harness held the
  critical path twice, 24 and 20 minutes; the owner: «Он скорее должен опираться на доступные readonly
  информацию».
- `references/rules.md` puts a pleasant read above every rule, in the owner's words of 2026-09-25: a pleasant
  text sells, formatting is one of its properties, and it reads naturally rather than as every technical detail
  of the code. Quick start carries the routes most readers take, and a narrower route's cost is said beside that
  route or not at all (rule 8); alike rows of an inventory say what tells them apart (rule 10); How it works holds
  only what its reader needs (rule 12). A pleasantness mark from cold readers was tried and dropped: on
  2026-09-25 it gave the owner's first and second choice the same mark.
- `rewrite` applies the sentence rules again: `writing-rules.md` and `curse-of-knowledge.md` had been in no role
  since the one path, and a sentence critic, brief 10, now reads the draft against them. The writer reads the code
  rather than running it, writes its word budgets before the text, and numbers its texts — `01-draft.md`,
  `02-repaired.md` — so none is called final before the user's word. After the repair, truth on the changed
  sentences, the question readers again and two cold readers, brief 11, check it, because on 2026-09-25 the
  repair brought in a contradiction nobody read for. Agents return their reports as messages, since a harness
  hook refuses a subagent's report file.
- `rewrite` runs one path: one writer from the code and the rules; every critic at once on the draft —
  truth split by sections and checked by running the code, a rationalizer asking whether the reader needs
  each fact, form, terms, the rules one by one, fresh readers — then one repair and the user's read. The
  rounds, the bake-off, the verifier's send-backs, the wave after a freeze and its dedup are no longer
  steps; each concern they held is one role in `references/roles.md`, and the pages that held
  them are marked superseded. `rethink` runs the same roles stopped at a plan on one screen. On
  2026-09-24 the sequential path took 6 h 38 min on a README of 1,200 words.
  `ISSUES.md` E4, E17, E22, E24, E27, E28, E32, E33, E35 and E37 are removed: the ledger written by
  hand, the audit's seed into the rounds, the bake-off's veto, the skeleton route and its diff, the
  unannounced adversarial read, the ratchet and the cut ledger are no longer steps.
- The rules are one list, `references/rules.md`: the fourteen content rules merged with the owner's
  feedback from 2026-09-10 to 09-24, each generalised and marked with its source — the owner's words
  with the date, a count of the genre, or a measured failure — and a convenience of ours marked as such.
  Genre notes for READMEs of developer tools, from the two surveys, are in `references/genres/`. On
  2026-09-24 the owner found his earlier feedback missing from a README the skills wrote without it.
- `rewrite`'s ledger starts as the audit's claim ledger instead of empty, so the first round is already
  under the ratchet. `audit` writes its entries a second time as a `json claims` block inside `audit.md`
  — the prose entry restates a claim and a restatement is not a string a pattern can find — and the new
  `audit/scripts/ledger-seed.mjs` turns every confirmed claim into a `want: true` pin and every refuted
  one into a `want: false`, each the sentence itself, escaped. The seed refuses a run file that does not
  keep the contract — a block under another heading, a claim ledger with no prose entries under it, an
  id in one half and not the other, or an entry missing a field, unconfirmed entries included — because
  a ratchet seeded from half a ledger is worse than none. Replayed on the 2026-09-11 record: with a
  ledger in place from the start, the two compression regressions of rounds 02 and 03 read LOST where
  the run saw nothing until round 04.
- A declared check now runs. An edit that carries claims gives `check.run`, a command, and
  `check.expect`, a regex over what it printed; `round.mjs` executes every one of them from the run
  directory before it writes anything, refuses the whole round when one finds nothing, and keeps the
  output as the claim's `saw`. Each claim also states what it `asks` — the proposition the sentence
  makes, in the sentence's own scope words. The check used to be a `{level, how}` pair that nothing
  executed and nothing read, and two regressions of one recorded round carried their own refutation
  inside the `how` they shipped with. `--allow-unrun` accepts the old shape for replaying a recorded
  run and marks those entries `unrun`; the 2026-09-11 record replays byte-identical under it.
- Two edits of one round may no longer declare the same claim name. The name is the ledger's key, so
  the round used to exit 0 and leave one entry carrying the other edit's `asks` and `saw`. A later
  round reusing a name is untouched: that is how a rewritten sentence is re-pinned.
- A round can be undone. `round.mjs` copies the ledger's bytes to `ledger.NN.json` before growing it,
  so a round removed before the freeze takes its ledger entries with it instead of leaving them for the
  round that replaces it.
- `rewrite`'s run directory is outside the repository that holds the document: `audit`'s formula makes
  it, in the plugin's data directory when installed and in `$TMPDIR/terse` from a source checkout. The
  report names its absolute path, and the hand-over tells the user to copy a run that must outlive an
  uninstall or a purge of the temporary directory. A code defect the rounds find is written with its
  check into `code-defects.md` in the run directory and offered to the user, and reaches the
  repository's `ISSUES.md` only on their word. The run used to sit under `research/` at the root of the
  user's repository and the defects went into their `ISSUES.md` unasked, while the skill's description,
  both manifests, this changelog and the README promise that nothing is written into the tree without
  the user's word (`ISSUES.md` E5).
- `rewrite` writes nothing on a shape the user has not agreed to. The check comes before every route —
  a resumed run and a start with neither a skeleton nor an audit included — and reads the user's word:
  a named skeleton file they agree to, with its path and SHA-256, or their quoted words that the current
  shape stands, written as the first line of `rounds.md`. A run file or run directory with no verdict is
  not agreed, and a run begun before the rule is checked once when it resumes. Not agreed, the document
  goes to `/terse:rethink` at its structure stage with the audit's profile, purpose and key; its steps
  keep their order, the survey sized by the user and the words in full, and its skeleton opens with the
  owner's purpose statement, against which its critics judge every structure. The audit's profile and
  failures reach the writers wherever an audit exists, and its ledger still seeds the rounds. A
  structural decision after the agreement is a question to the user, recorded in the skeleton with their
  answer; a read that rejects the purpose, the content or the arrangement goes back to `rethink`; and a
  finding that a section buys the reader nothing the purpose needs is routed to the structure. On
  2026-09-22/23 the audit route led straight from the audit into four rounds, and the run's skeleton
  file reads "none agreed".
- `round.mjs` refuses an edit whose `new` holds more of a fixed list of qualifying forms than its `old`
  — *unless*, *except when*, *only if*, *as long as* and their kin, counted on whitespace-normalised
  text — and quotes the added clause, until the edit carries `qualifies` and declares a claim.
  `qualifies` is a string the verifier reads, why the clause is the sentence's own scope, kept as
  `qualified` on the ledger entry of each of the edit's claims; the script checks only that it is not
  empty, and a form swapped for another leaves the count equal and is not seen. The verifier gains a
  fifth duty: it reads each `qualified` reason as a claim, and checks an edit that narrows or widens a
  pinned sentence at the case its new words add. `rewrite` treats a sentence a critic, the dedup or the
  coordinator proposed as a claim like any other, its scope risk settled by a run or by narrower wording
  before the freeze. Rule 11 of `stages.md` says a qualification is not a fix, and nothing checked it
  (M23: rounds 04 to 08 of one README, repaired by caveats, regressed 1, 0, 6, 5 and 10 times). Over
  the 127 recorded edits of 2026-09-11 and 2026-09-22 the regex fires four times — twice on a sentence
  that regressed, once beside one, once on none (M25) — a signal, not a rate. `--allow-unrun` reports a
  recorded one and lets it through, so the 2026-09-11 record still replays byte-identical.
- The first round with no regression is selected for the user's read, and a second clean round is no
  longer waited for: the task and question readers sized to zero on it are run on that frozen round
  before the hand-over, with no writing round between, and the hand-over names whatever the user kept at
  zero. On 2026-09-23 round 03 had no regression and was held back, its task readers sized to zero, and
  round 04 cost about 1.6M Claude tokens, brought two regressions and was rejected by the owner for its
  shape. `loop.md` says the same; `measurements.md` gains M25, that live run on this plugin's README —
  regressions, send-backs, readers, task gate and cost per round, with the verifier's variance between
  two threads as a hypothesis; and `stages.md` records that the 2026-09-11 failure came back and that
  the shape decision now comes first.
- `rethink`'s hand-over, from the owner's read of the first skeleton for this plugin's README. The
  skeleton's first part carries every statement of the owner's that governs the document, verbatim, and
  the genre's order from step 1, saying place by place where it follows or departs and why; each section
  names its device; a seventh part holds the decisions the owner's read settled, those still the owner's
  with the coordinator's defaults, anything kept against the owner's word with its evidence, anything
  routed outside the document, and the five points least sure, each with what would settle it. The owner
  is shown the sections as a table with budgets and devices, the departures from the genre, what is kept
  against their word, the decisions with their defaults, the points least sure and what is asked of them;
  the mechanical rules, terms, deletions and outside edits are the writers' and the scripts'. Every
  skeleton is its own numbered file, the owner's answer is kept verbatim beside it, and `skeleton.md` is
  a copy of the current one; agreement is still the user's word on a named file, with its path and
  SHA-256. `briefs.md` gains the skeleton writer's brief and the message to the owner, and `stages.md`
  gains rule 12 — a README describes the code as it is, with no binding to a version without a weighty
  reason, in the owner's words from the same read — so lens 7's default rose to twelve rules, fourteen
  with rules 13 and 14 below. On
  2026-09-23 the owner, sent a 447-line skeleton, asked first what exactly was required of him.
- `stages.md` records the 2026-09-23/24 run on this plugin's README. Under stage 1: 39 documents over the
  six slices, WebFetch's paraphrases for four of ten READMEs, the owner's exemplar no survey fetched, and
  the genre's order as counted afterwards — what it is first in 9 of 9 plugin READMEs, install in 8, the
  inventory in 7, How it works in 4. Under stage 3: why ten structures came out as one inventory in ten
  orders, the three critics' shared failures, and how the base was chosen. Beside the rule on the review
  artifact: the owner's read of skeleton 01, five objections each about which sections exist or where
  they sit and none about a phrase, and skeleton 02 agreed at 625 words against the current 909.
- `stages.md`'s principle every stage serves carries the owner's restatement of it, 2026-09-24, verbatim
  with a rendering: the aim is any text, the README now and documentation and code later; every word has
  a reason and carries meaning, in code too; and the workflow takes a text apart into its skeleton,
  essence, structure and meanings, evaluates them, and gathers the best practices.
- The README is round 04 of the 2026-09-24 rewrite from the skeleton the owner agreed to: 788 words by the
  plugin's own count in five sections — what the plugin is for, Quick start as Install, Workflow and Update,
  a table of the three skills, How it works as one line per skill, and *Checks and guarantees* — the methods,
  what each checks and where it comes from — in place of *What was measured*. Every sentence the rounds
  wrote carries a check that ran against the code at `f97eb4a`, read by a verifier before the freeze and by
  three lenses after it, with no regression charged; the owner read it and sent it as it is. The previous
  README gave two runs' numbers and a licence line in 933 words; the owner rejected the numbers as a README
  section — a user wants the result, not what the author did with the plugin twice.
- `stages.md` gains rules 13 and 14 from the owner's read of round 03 on 2026-09-24, verbatim: a README
  carries no results — what was measured on it is development information and lives inside the plugin, and
  in its place the reader wants the pipeline, the methods, their origin and the guarantees — and nothing
  from a run on the page: what comes back is said in the reader's words, never as a dated report line, a
  ledger label or an excerpt. Lens 7's default is fourteen rules. The round the owner read held two runs'
  numbers and showed the audit's `missing` finding as its example, which he read as an error.
- The survey, the synthesis and the skeleton count a section's sub-blocks and what marks them — a `###`
  heading, a bold lead-in, a fence standing alone — beside the devices, and the skeleton names them where
  the genre splits a section. On 2026-09-24 the owner asked for Quick start's three blocks to be marked as
  the genre marks them, and skeleton 03 had to count it afterwards: 4 of 8 plugin READMEs and 4 of 5 agent
  READMEs head the blocks inside their start section.
- `rewrite` says what follows the user's word on a round: the read is recorded verbatim under the round's
  row, sent or not; on the word the round file replaces the document byte for byte as a commit of its own,
  a release is a separate word, and a later run starts from the replaced document. On 2026-09-24 the pages stopped at "then stop" and the coordinator had to decide the
  rest.

### Added

- `evals/pages.test.mjs` checks what linking cannot keep in agreement: that every relative link in the
  plugin's pages opens, its anchor included; that the run-directory line is one line in the three skills, in
  the exact `${...}` form; and that each frozen block still hashes to the digest its page records. Its first run
  found three anchors in the superseded records broken since `rethink`'s page was rewritten; they point at the
  page now.
- `references/benchmark.md`: the protocol for measuring the skills against a bare agent, with a human best
  practice as the reference — three texts, a snapshot the writers see without its README, a stand-in user for
  the owner-less run, seven rulers and three hypotheses written before the run — from the owner's proposal of
  2026-09-24, with his three premises: the model's memory is the baseline, the reference keeps what its
  maintainers know and the owner judges, and a bare agent beating the skills means they fail their main task.
  Not yet run.
- A verifier reads the edits before the round is frozen — brief 0 in `critic-briefs.md`, one agent that
  did not write them, given `edits/NN.json`, the `ledger.json` entries the round wrote — `saw` lives
  there, not in the edits file — and the code, returning `holds`, `does not answer`, `refuted` or
  `unreachable` per claim. A `refuted` or a `does not answer` sends the
  round back to its edits, which costs one regeneration where the same finding from a critic costs a
  wave; an `unreachable` claim has its check rewritten or the claim dropped, because a round does not
  freeze on a pin nothing can reach. It is row 0 of the wave's table: the user sizes it in the same
  announcement as the lenses and may size it to zero, the least that still counts as a round is
  unchanged at lenses 1 and 2, and what a round without it gives up is said where the size is chosen.
  Its cost is unmeasured, and the one blind run behind its first four duties is a hypothesis about them
  and not a rate; both are M24 in `measurements.md`, where this repository's dated observations live.
- `audit` asks the user what the document is for and what it must make its reader able to do, and
  keeps the answer in their words as the profile's ninth section. It returns a shape verdict beside the
  score: `shape: agreed` only on the user's word — that they agree to a named skeleton file, whose path
  and SHA-256 it records, or, quoted, that the current shape stands — and `shape: not agreed` otherwise,
  a skeleton read without assent included, recorded under *Score*. When the shape is not agreed it
  offers `/terse:rethink` at its structure stage instead of `rewrite`. On 2026-09-23 the pages went from
  an audit straight into four rounds of `rewrite` on this plugin's README, and the owner rejected the
  result for its shape and content, not its phrasing, as a draft was rejected on 2026-09-11; nothing on
  the pages had asked for the shape to be decided.
- Lens 7, purpose and content: one Claude Opus critic reads the whole document against the owner's
  purpose statement — the skeleton's, or the audit's purpose line — and against the skeleton's own
  rules, section by section: what each section buys a reader who came for that purpose, the rules it
  breaks, paragraphs whose cut loses nothing the purpose needs, technical detail above the middle, and
  the opening. Where the skeleton adopted them or none exists yet, the rules are `stages.md`'s, fourteen
  by this release, which the brief calls one owner's calibration and not a law of the genre. A finding that
  names neither a rule nor the purpose is discarded, and the one change it proposes is a cut. No brief named those rules: in round 04 of 2026-09-23 the water
  lens proposed three cuts of seven words in all, and the owner, reading that round, found water by the
  paragraph. Its cost is unmeasured.
- `rethink` ships its briefs, in `references/briefs.md`, starting with stage 1: the surveyors' brief, the
  synthesis's, and how the owner's calibration file is made — the owner's own words on the genre, grepped
  from the messages they typed in past sessions and kept verbatim with their dates, which every surveyor,
  structure writer and critic reads. A surveyor fetches the raw markdown, never through a summarising
  tool, and returns the genre's order: each place from the top, what the genre puts there, in N of M
  documents fetched. A seventh slice reads the documents the owner names as good, asked for before anyone
  is spawned; step 1 names it and the order. On 2026-09-23, on this plugin's own README, every brief of
  the run was composed in the coordinator's messages; WebFetch returned paraphrases with invented
  headings for four of ten READMEs; no survey fetched the exemplar the owner had named; and the genre's
  order was counted only when the owner asked for it.
- `briefs.md` gains stage 3: the structure writers' brief with ten default readings of the purpose; the
  critics' brief with three default lenses — the owner's calibration, the reader's task, the genre and
  the evidence — each reading its own file; and the rule that picks the base: a structure from which the
  reader's-task critic shows a reader cannot reach an answer is out, then the owner-calibration critic's
  first if it is still in, else the best average rank — the run's rule with its disqualifier applied to
  every structure, in that form not yet run. Every structure accounts for the sections of the genre it
  drops, with their usage weight and what dropping them costs, and an unknown that is the owner's to
  decide is put to the owner before any structure is written; step 3 points to all three. On 2026-09-23
  the ten structures were one inventory in ten orders, none said what it dropped, and all ten planned the
  files section around a boundary only the owner could settle — failures of the brief, each named by one
  of the three critics.

### Fixed

- `rewrite` runs its scripts from `${CLAUDE_SKILL_DIR}/scripts`. The page set their directory from a bare
  `$CLAUDE_PLUGIN_ROOT`, which Claude Code neither substitutes nor exports, so on an installed plugin both
  commands pointed under `/` and failed. The page test now fails on a bare or defaulted placeholder.
- An installed `audit` makes its run directory in the plugin's data directory, no longer in
  `$TMPDIR/terse`. Its formula wrote `${CLAUDE_PLUGIN_DATA:-…}`, a form Claude Code does not substitute:
  it replaces only the exact `${CLAUDE_PLUGIN_DATA}` in a skill body and exports nothing to the shell,
  so every installed run took the fallback. The formula now assigns the exact placeholder first and
  falls back when it arrives empty, as it does from a source checkout. The page now also says how long a
  run lives: under the data directory it survives plugin updates and is deleted by
  `claude plugin uninstall` unless `--keep-data` is passed, in the temporary directory the operating
  system may purge it, and the report tells the user to copy a run that must outlive either.
- `rethink` names where it writes: a run directory of the document's own, by `audit`'s formula with the
  slug and `-rethink`, holding the calibration file, the words and every skeleton and read, with
  `survey/`, `structures/` and `critics/` beneath it, and nothing in the repository that holds the
  document. The hand-over names its absolute path and how long it lives: under the plugin's data
  directory until the plugin's last installation is uninstalled without `--keep-data` or its
  marketplace is removed, as measured on 2026-09-23 on Claude Code 2.1.280, and in the temporary
  directory until the system purges it. The page handed over "one file" and said nowhere where it went
  (`ISSUES.md` E13); the 2026-09-23 run's directory,
  `…/terse/runs/20260923-212113-terse-readme-rethink`, already had this form, by the coordinator's
  choice.

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
