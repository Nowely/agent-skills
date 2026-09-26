# Rounds

## Round 01 — `01-proposal.md`

Critic: Codex Sol S1 (completeness). Verdict: partial. Ten findings: no end-to-end order and no rule for when the
word lapses; the fresh-session check did not pin the candidate; no effect measurement; one false example (terse
0.2.0 "published on the second attempt" — the retry was a lookup of 0.1.1, the create succeeded once); "4/11 local
updates" stated as exact; Node 22 and flakiness stated as fact; token figures not scoped to the main session; the
release-diff review, secrets check and cross-plugin contract check dropped; the fidelity move not conditional on
the unread old era; orchestrate-live's third catch missing. Regressions: first round, none counted.

## Round 02 — `02-proposal.md`

Critic: Codex Sol S1, same thread. Verdict: partial. Eight of ten closed, two partly (the pilot lacked a
candidate-readiness timestamp; the cross-plugin contract check was not defined as a behavioural example).
Regressions: 3 — a local `npm test` in step 3 against "PR CI is the only full run" in step 5; `npm test` claimed to
cross-check manifests between plugins; the text claimed all ten findings fixed.

## Round 03 — `03-proposal.md`

Fixes the two partial findings and the three regressions. Not re-checked by a critic: two rounds were the limit.

## Implementation review — branch `release-process`

Reviewer: Codex Sol R1, on the five commits that apply `03-proposal.md`. Verdict: ready after fixes. Taken: the
checklist had added a re-run for a CI failure matching an open ledger entry, which the proposal never made (removed:
a red run stops the release); the merge was not pinned to the approved head and the tag could land past the squash
commit after a pull (now `--match-head-commit` and a tag on the merge commit by SHA); `gh release view` without a
tag reads the latest release; three commit messages claimed counts the research does not carry. Rejected: ten
`[RELEASING.md](RELEASING.md)` links in the frozen `research/2026-09-10-chain/` files never resolved there, before
the move or after it.

The proposal's condition on moving live fidelity out of the release — "if a release before 2026-09-11 shows it
caught something, it stays" — was checked against the entrust CHANGELOG, the commit log and the 0.11.0 release
notes: the one recorded live run, for 0.11.0, agreed on all ten scenarios and caught nothing, while the orchestrate
gate failed its first run there and found a real defect. Level 2; the thirteen sessions were not read.

## Releases under the proposed order

One line per release: decision, candidate ready, owner's word, publication, owner touches.
