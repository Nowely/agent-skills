# Changelog

Hand-written per release from the tagged git log. Dates are the tagged commit dates; detailed
forensics remain in the repository references and release notes.

## Unreleased

### Changed

- `rewrite`'s ledger starts as the audit's claim ledger instead of empty, so the first round is already
  under the ratchet. `audit` writes its entries a second time as a `json claims` block inside `audit.md`
  — the prose entry restates a claim and a restatement is not a string a pattern can find — and the new
  `audit/scripts/ledger-seed.mjs` turns every confirmed claim into a `want: true` pin and every refuted
  one into a `want: false`, each the sentence itself, escaped. Replayed on the 2026-09-11 record: with a
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
- A round can be undone. `round.mjs` leaves the ledger as it was in `ledger.NN.json` before growing it,
  so a round removed before the freeze takes its ledger entries with it instead of leaving them for the
  round that replaces it.

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
