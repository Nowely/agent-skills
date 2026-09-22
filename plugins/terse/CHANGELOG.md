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
  it, in the plugin's data directory or `$TMPDIR/terse`, and the report names its absolute path. A code
  defect the rounds find is written with its check into `code-defects.md` there and offered to the user,
  and reaches the repository's `ISSUES.md` only on their word. The run used to sit under `research/` at
  the root of the user's repository and the defects went into their `ISSUES.md` unasked, while the
  skill's description, both manifests, this changelog and the README promise that nothing is written
  into the tree without the user's word (`ISSUES.md` E5).

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
  Its cost is unmeasured, and the one blind run behind its four duties is a hypothesis about them and
  not a rate; both are M24 in `measurements.md`, where this repository's dated observations live.

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
