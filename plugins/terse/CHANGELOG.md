# Changelog

Hand-written per release from the tagged git log. Dates are the tagged commit dates; detailed
forensics remain in the repository references and release notes.

## Unreleased

### Changed

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

### Added

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
- Lens 7, purpose and content: one Claude Opus critic reads the whole document against its purpose —
  the audit's purpose line, or the skeleton's — and the eleven content rules of `stages.md`, section by
  section: what each section buys a reader who came for that purpose, the rules it breaks by number,
  paragraphs whose cut loses nothing the purpose needs, technical detail above the middle, and the
  opening against rules 1 and 2. A finding that names neither a rule nor the purpose is discarded, and
  the one change it proposes is a cut. No brief named those rules: in round 04 of 2026-09-23 the water
  lens proposed three cuts of seven words in all, and the owner, reading that round, found water by the
  paragraph. Its cost is unmeasured.

### Fixed

- An installed `audit` makes its run directory in the plugin's data directory, no longer in
  `$TMPDIR/terse`. Its formula wrote `${CLAUDE_PLUGIN_DATA:-…}`, a form Claude Code does not substitute:
  it replaces only the exact `${CLAUDE_PLUGIN_DATA}` in a skill body and exports nothing to the shell,
  so every installed run took the fallback. The formula now assigns the exact placeholder first and
  falls back when it arrives empty, as it does from a source checkout. The page now also says how long a
  run lives: under the data directory it survives plugin updates and is deleted by
  `claude plugin uninstall` unless `--keep-data` is passed, in the temporary directory the operating
  system may purge it, and the report tells the user to copy a run that must outlive either.

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
